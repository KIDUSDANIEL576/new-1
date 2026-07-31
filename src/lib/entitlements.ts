// Who paid, and what that unlocks.
//
// The server is the only authority: `entitlements` is written solely by the
// RevenueCat webhook, and the DB rejects Pro brushes / extra photos from free
// couples regardless of what any client believes. Everything here exists so the
// UI can be polite about it rather than letting people walk into a wall.

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface TierStatus {
  isPro: boolean;
  photosToday: number;
  /** null = unlimited */
  photoLimit: number | null;
  /** null = full history */
  replayDays: number | null;
}

export const FREE_STATUS: TierStatus = {
  isPro: false,
  photosToday: 0,
  photoLimit: 1,
  replayDays: 7,
};

export async function fetchStatus(): Promise<TierStatus> {
  const { data, error } = await supabase.rpc('my_status');
  const row = Array.isArray(data) ? data[0] : data;
  // Assume free on failure. Being wrong here costs a paying couple one tap on
  // "Restore purchase"; being wrong the other way would hand out the product.
  if (error || !row) return FREE_STATUS;
  return {
    isPro: !!row.is_pro,
    photosToday: row.photos_today ?? 0,
    photoLimit: row.photo_limit ?? null,
    replayDays: row.replay_days ?? null,
  };
}

/** Live tier for the signed-in couple, with a manual refresh for post-purchase. */
export function useEntitlement() {
  const [status, setStatus] = useState<TierStatus>(FREE_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await fetchStatus();
    setStatus(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, loading, refresh };
}

/** True when a write was rejected by the server's tier rules. */
export const isTierError = (message?: string | null) =>
  /PRO_BRUSH|FREE_PHOTO_LIMIT/.test(message ?? '');
