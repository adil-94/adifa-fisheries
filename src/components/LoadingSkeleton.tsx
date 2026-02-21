export function CardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-3"></div>
        <div className="h-8 w-32 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-4 text-left"><div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div></th>
            <th className="py-4 px-4 text-left"><div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div></th>
            <th className="py-4 px-4 text-left"><div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div></th>
            <th className="py-4 px-4 text-left"><div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-4 px-4"><div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div></td>
              <td className="py-4 px-4"><div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div></td>
              <td className="py-4 px-4"><div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div></td>
              <td className="py-4 px-4"><div className="h-4 w-40 bg-white/10 rounded animate-pulse"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
