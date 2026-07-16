/**
 * Forum skeleton loading components for V4.
 * Used by loading.tsx files across bbs routes.
 */

/** Simple skeleton bar using Tailwind animate-pulse. */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for the forum home page (bbs).
 */
export function ForumHomeSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Breadcrumb skeleton */}
        <div className="mb-4">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Page header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* Mobile category chips skeleton */}
        <div className="lg:hidden mb-4">
          <Skeleton className="h-10 w-full mb-3 rounded-lg" />
          <div className="flex gap-2 overflow-hidden pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
            ))}
          </div>
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Post list skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForumPostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a single post card.
 */
export function ForumPostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <div className="flex items-start gap-2 mb-2">
        <Skeleton className="h-5 flex-1 max-w-md" />
        <Skeleton className="h-5 w-12 rounded" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the post detail page.
 */
export function ForumPostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content skeleton */}
          <main className="min-w-0">
            {/* Post header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-4">
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4 mb-3" />
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-32 ml-auto" />
              </div>
            </div>

            {/* Post content */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-8 mb-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Comments skeleton */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-gray-50">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the category page.
 */
export function ForumCategorySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96 mb-6" />
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForumPostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
