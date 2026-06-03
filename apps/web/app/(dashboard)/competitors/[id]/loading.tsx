export default function CompetitorDetailLoading() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-24 animate-pulse rounded bg-brand-bg3" />
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-brand-bg3" />
        <div className="h-4 w-32 animate-pulse rounded bg-brand-bg3" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-lg bg-brand-bg3" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-brand-bg3" />
        ))}
      </div>
    </div>
  );
}
