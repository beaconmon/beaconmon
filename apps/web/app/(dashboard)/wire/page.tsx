import { Suspense } from 'react';
import { WirePageClient } from './WirePageClient';

export default function WirePage() {
  return (
    <Suspense>
      <WirePageClient />
    </Suspense>
  );
}
