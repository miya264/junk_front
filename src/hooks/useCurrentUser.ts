'use client';

import { useEffect, useState } from 'react';
import type { AppUser } from '../types/user';

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) throw new Error('failed');
        const data = (await res.json()) as AppUser;
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { user, loading };
}