export default function ToolLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 mb-8 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="grid gap-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        
        {/* Bottom section skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
