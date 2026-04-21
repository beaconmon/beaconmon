// Public status page — ISR with 30-second revalidation.
// Data is served from Redis cache, NOT directly from Postgres.
// See architecture rule #8 in CLAUDE.md.

export const revalidate = 30;

interface Props {
  params: { slug: string };
}

export default async function StatusPage({ params }: Props) {
  // TODO: fetch from Redis cache via /api/status-pages/[slug]/data
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">System Status</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Status page: <code>{params.slug}</code>
        </p>
        <div className="rounded-lg border p-6">
          <p className="text-green-600 font-medium">All systems operational</p>
        </div>
      </div>
    </div>
  );
}
