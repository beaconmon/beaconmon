import Footer from '@/components/marketing/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen overflow-x-clip flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
