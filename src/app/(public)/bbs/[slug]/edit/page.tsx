'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [postStatus, setPostStatus] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Draft auto-save state
  const isDraftMode = postStatus === 'draft';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title: '', content: '', categoryId: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/bbs/' + slug + '/edit');
      return;
    }

    if (status === 'authenticated') {
      loadPost();
      loadCategories();
    }
  }, [status, slug]);

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/forum/posts/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('帖子不存在');
          return;
        }
        if (res.status === 403) {
          setError('无权编辑此帖子');
          return;
        }
        throw new Error('加载失败');
      }
      const data = await res.json();
      setTitle(data.post.title);
      setContent(data.post.content);
      setCategoryId(data.post.categoryId);
      setPostStatus(data.post.status);
      setIsAuthor(data.post.userId === session?.user?.id);
      setIsAdmin(data.isAuthor === false && data.canEdit === true);
      lastSavedRef.current = {
        title: data.post.title,
        content: data.post.content,
        categoryId: data.post.categoryId,
      };
    } catch (err) {
      setError('加载帖子失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/forum/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('加载分类失败', err);
    }
  };

  // Auto-save for drafts
  const autoSaveDraft = useCallback(async () => {
    if (!isDraftMode) return;
    if (
      title === lastSavedRef.current.title &&
      content === lastSavedRef.current.content &&
      categoryId === lastSavedRef.current.categoryId
    ) return;

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/forum/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId, saveAsDraft: true }),
      });
      if (res.ok) {
        lastSavedRef.current = { title, content, categoryId };
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [isDraftMode, title, content, categoryId, slug]);

  useEffect(() => {
    if (!isDraftMode || loading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSaveDraft();
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, categoryId, isDraftMode, loading, autoSaveDraft]);

  const handleSaveDraft = async () => {
    setError('');
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/forum/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId, saveAsDraft: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus('saved');
        lastSavedRef.current = { title, content, categoryId };
      } else {
        setSaveStatus('error');
        setError(data.error || '保存失败');
      }
    } catch {
      setSaveStatus('error');
      setError('网络错误');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const body: Record<string, unknown> = { title, content, categoryId };
      // If it's a draft being submitted for review
      if (isDraftMode) {
        body.submitForReview = true;
      }

      const res = await fetch(`/api/forum/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '编辑失败');
        return;
      }

      setSuccess(data.message || '帖子已更新');
      setTimeout(() => {
        if (data.post?.status === 'published') {
          router.push('/bbs/' + slug);
        } else {
          router.push('/bbs/my-posts/' + slug);
        }
      }, 1500);
    } catch (err) {
      setError('编辑失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isDraftMode ? '编辑草稿' : '编辑帖子'}
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {success}
            </div>
          )}

          {postStatus === 'pending' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              ⏳ 此帖子正在等待审核
            </div>
          )}

          {postStatus === 'draft' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              📝 这是草稿，保存后不会公开。完成后点击"提交审核"。
            </div>
          )}

          {postStatus === 'published' && isAuthor && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              ℹ️ 编辑已发布的帖子后，将重新进入待审核状态
            </div>
          )}

          {/* Auto-save status for drafts */}
          {isDraftMode && saveStatus !== 'idle' && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">保存中...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">已保存</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">保存失败，请手动保存</span>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="">请选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="帖子标题"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="帖子内容"
                rows={12}
                maxLength={50000}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => router.push('/bbs/my-posts')}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                disabled={submitting}
              >
                取消
              </button>
              {isDraftMode && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition inline-flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  <Save className="w-4 h-4" />
                  保存草稿
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? '提交中...' : isDraftMode ? '📝 提交审核' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
