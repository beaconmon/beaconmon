'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  token: string;
  userId: string;
  teamName: string;
}

export function AcceptButton({ token, userId, teamName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? 'Something went wrong');
        return;
      }
      router.push('/overview');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        onClick={() => void handleAccept()}
        disabled={loading}
      >
        {loading ? 'Joining…' : `Join ${teamName}`}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
