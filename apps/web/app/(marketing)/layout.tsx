export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen overflow-x-hidden">
      {children}
    </div>
  );
}
