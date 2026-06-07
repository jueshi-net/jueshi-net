'use client';

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 bg-red-50 text-red-900 rounded-xl border border-red-200 m-4">
      <h2 className="text-xl font-bold mb-2">🚨 内容区渲染崩溃</h2>
      <p className="font-mono text-sm break-all mb-4 text-red-700">{error.message}</p>
      {error.digest && <p className="font-mono text-xs text-red-500 mb-4">Digest: {error.digest}</p>}
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        尝试重试
      </button>
    </div>
  );
}
