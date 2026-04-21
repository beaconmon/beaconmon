// Auth-gated layout — session check will be added when Better Auth adapter is wired in.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
}
