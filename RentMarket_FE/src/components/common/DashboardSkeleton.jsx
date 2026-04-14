/* ─── Skeleton Loading cho Dashboard ─── */
const SkeletonPulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const DashboardSkeleton = ({ cardCount = 4 }) => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonPulse className="h-7 w-64" />
        <SkeletonPulse className="h-4 w-48" />
      </div>
      <SkeletonPulse className="h-10 w-56 rounded-xl" />
    </div>

    {/* Stat cards skeleton */}
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(cardCount, 4)} gap-5`}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <SkeletonPulse className="h-3 w-28" />
              <SkeletonPulse className="h-8 w-40" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
            <SkeletonPulse className="h-12 w-12 rounded-xl shrink-0" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SkeletonPulse className="h-5 w-48 mb-6" />
        <SkeletonPulse className="h-[300px] w-full" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SkeletonPulse className="h-5 w-48 mb-6" />
        <div className="flex items-center justify-center h-[300px]">
          <SkeletonPulse className="h-52 w-52 !rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
