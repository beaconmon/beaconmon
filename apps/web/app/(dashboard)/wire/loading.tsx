import { Skeleton } from '@/components/ui/skeleton';

export default function WireLoading() {
  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-brand-line">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="border-b border-brand-line px-4 py-3">
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="divide-y divide-brand-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3">
              <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
