import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

// GET /api/forum/posts/[slug] - 加载帖子数据（用于编辑页面）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.session.user.id;
    const { slug } = await params;

    // 查询帖子
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }

    // 检查用户角色
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';
    const isAuthor = post.userId === userId;

    // 权限检查：只有作者和管理员可以访问编辑页面
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: '无权编辑此帖子' }, { status: 403 });
    }

    // locked 帖：作者不能编辑
    if (post.isLocked && !isAdmin) {
      return NextResponse.json({ error: '帖子已锁定，无法编辑' }, { status: 403 });
    }

    // hidden / deleted 帖：只有管理员可以编辑
    if ((post.status === 'hidden' || post.status === 'deleted') && !isAdmin) {
      return NextResponse.json({ error: '无权编辑此帖子' }, { status: 403 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        categoryId: post.categoryId,
        category: post.category,
        status: post.status,
        isLocked: post.isLocked,
        userId: post.userId
      },
      canEdit: true
    });

  } catch (error) {
    console.error('Get post for edit error:', error);
    return NextResponse.json(
      { error: '加载失败' },
      { status: 500 }
    );
  }
}

// 内容校验
function validateContent(title: string, content: string, categoryId: string) {
  if (!title || title.trim().length < 5) {
    return { valid: false, error: '标题至少 5 个字符' };
  }
  if (title.length > 200) {
    return { valid: false, error: '标题最多 200 个字符' };
  }
  if (!content || content.trim().length < 20) {
    return { valid: false, error: '内容至少 20 个字符' };
  }
  if (content.length > 50000) {
    return { valid: false, error: '内容最多 50000 个字符' };
  }
  if (!categoryId) {
    return { valid: false, error: '请选择分类' };
  }
  return { valid: true };
}

// 频率限制检查
async function checkRateLimit(userId: string, action: 'post' | 'comment') {
  const now = new Date();
  const windowMinutes = action === 'post' ? 1 : 1;
  const maxCount = action === 'post' ? 1 : 3;
  const since = new Date(now.getTime() - windowMinutes * 60 * 1000);

  let count: number;
  if (action === 'post') {
    count = await prisma.forumPost.count({
      where: {
        userId,
        createdAt: { gte: since }
      }
    });
  } else {
    count = await prisma.forumComment.count({
      where: {
        userId,
        createdAt: { gte: since }
      }
    });
  }

  if (count >= maxCount) {
    // 写 EventLog
    try {
      await prisma.eventLog.create({
        data: {
          eventType: 'forum_rate_limit_hit',
          action: `edit_${action}`,
          toolName: 'rate_limit',
        },
      });
    } catch (logError) {
      // 写入失败不影响 429
    }

    return { limited: true };
  }

  return { limited: false };
}

// 重复内容检测
async function checkDuplicate(userId: string, title: string, content: string) {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h

  const existing = await prisma.forumPost.findFirst({
    where: {
      userId,
      title,
      content,
      createdAt: { gte: since }
    }
  });

  if (existing) {
    return { duplicate: true, postId: existing.id };
  }

  return { duplicate: false };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.session.user.id;
    const { slug } = await params;

    // 查询帖子
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: '帖子不存在' }, { status: 404 });
    }

    // 检查用户角色
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    const isAdmin = user?.role === 'admin';
    const isAuthor = post.userId === userId;

    // 权限检查
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: '无权编辑此帖子' }, { status: 403 });
    }

    // locked 帖：作者不能编辑
    if (post.isLocked && !isAdmin) {
      return NextResponse.json({ error: '帖子已锁定，无法编辑' }, { status: 403 });
    }

    // hidden / deleted 帖：只有管理员可以编辑
    if ((post.status === 'hidden' || post.status === 'deleted') && !isAdmin) {
      return NextResponse.json({ error: '无权编辑此帖子' }, { status: 403 });
    }

    // 解析请求体
    const body = await request.json();
    const { title, content, categoryId } = body;

    // 内容校验
    const validation = validateContent(title, content, categoryId);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 检查分类是否存在
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 400 });
    }

    // 频率限制检查（编辑也算一次操作）
    const rateLimit = await checkRateLimit(userId, 'post');
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: '编辑过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    // 重复内容检测（如果标题和内容都没变，不算重复）
    if (title !== post.title || content !== post.content) {
      const duplicate = await checkDuplicate(userId, title, content);
      if (duplicate.duplicate && duplicate.postId !== post.id) {
        return NextResponse.json(
          { error: '24 小时内已发布相同内容的帖子' },
          { status: 409 }
        );
      }
    }

    // 计算新状态
    const previousStatus = post.status;
    let newStatus = post.status;

    if (post.status === 'published' && !isAdmin) {
      // 作者编辑 published 帖，进入 pending
      newStatus = 'pending';
    } else if (post.status === 'rejected') {
      // 作者编辑被驳回的帖子，重新进入审核队列
      newStatus = 'pending';
    }

    // 更新帖子
    const updatedPost = await prisma.forumPost.update({
      where: { slug },
      data: {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // 写 EventLog
    try {
      await prisma.eventLog.create({
        data: {
          eventType: 'forum_post_update',
          action: 'update',
          toolName: slug,
        },
      });
    } catch (logError) {
      console.error('[Forum Event Log Error]', logError);
    }

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        slug: updatedPost.slug,
        title: updatedPost.title,
        status: updatedPost.status,
        updatedAt: updatedPost.updatedAt
      },
      message: newStatus === 'pending'
        ? '帖子已更新，等待审核'
        : '帖子已更新'
    });

  } catch (error) {
    console.error('Edit post error:', error);
    return NextResponse.json(
      { error: '编辑失败，请稍后重试' },
      { status: 500 }
    );
  }
}
