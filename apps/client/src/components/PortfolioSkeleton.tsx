export default function PortfolioSkeleton() {
  return (
    <div className="bg-davys-100 border border-white-200 rounded-lg shadow p-4 group">
      <div className="flex items-start justify-between gap-4">
        {/* Title skeleton */}
        <div className="flex-1">
          <div className="h-[28px] bg-linear-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-[200%_100%] animate-shimmer rounded w-3/4"></div>
        </div>
        
        {/* Action Buttons placeholder - invisible but takes space */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="w-5 h-5"></div>
          <div className="w-5 h-5"></div>
        </div>
      </div>

      {/* Portfolio Metadata */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm">
          <div className="h-[20px] bg-linear-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-[200%_100%] animate-shimmer rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

