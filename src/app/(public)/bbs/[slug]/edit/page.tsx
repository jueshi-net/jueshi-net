'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/forum/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, categoryId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '编辑失败');
        return;
      }

      setSuccess(data.message || '帖子已更新');
      setTimeout(() => {
        router.push('/bbs/' + slug);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑帖子</h1>

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

          {postStatus === 'published' && isAuthor && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              ℹ️ 编辑已发布的帖子后，将重新进入待审核状态
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
                placeholder="帖子标题（至少 5 个字符）"
                required
                minLength={5}
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
                placeholder="帖子内容（至少 20 个字符）"
                rows={12}
                required
                minLength={20}
                maxLength={50000}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/bbs/' + slug)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? '提交中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
