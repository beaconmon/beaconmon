export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Beaconmon</h1>
      <p className="text-muted-foreground mb-8">
        Your monitors will appear here once you add them.
      </p>
      <a
        href="/monitors/new"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Add your first monitor
      </a>
    </div>
  );
}
