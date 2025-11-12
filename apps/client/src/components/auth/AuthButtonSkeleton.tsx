export default function AuthButtonSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="w-10 h-10 rounded-full bg-linear-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-[200%_100%] animate-shimmer border-2 border-night-700"></div>
      
      <div className="hidden sm:block space-y-1">
        <div className="h-[14px] w-24 bg-linear-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-[200%_100%] animate-shimmer rounded"></div>
        <div className="h-[12px] w-32 bg-linear-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-[200%_100%] animate-shimmer rounded"></div>
      </div>
    </div>
  );
}

