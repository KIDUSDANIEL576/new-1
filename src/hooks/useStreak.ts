// Daily Love Streak — consecutive days you BOTH left a trace.
// The rule itself lives in lib/streak.ts so it can be tested without a database.

import { useCallback, useEffect, useState } from 'react';
import { TABLES } from '@/lib/backend';
import { computeStreak, localDay, type DailyMark } from '@/lib/streak';
import { supabase } from '@/lib/supabase';

export function useStreak(coupleId: string | undefined) {
  const [streak, setStreak] = useState(0);

  const refresh = useCallback(async () => {
    if (!coupleId) return;
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const { data } = await supabase
      .from(TABLES.dailyMarks)
      .select('day, user_id')
      .eq('couple_id', coupleId)
      .gte('day', localDay(since));
    if (!data) return;

    setStreak(computeStreak(data as DailyMark[]));
  }, [coupleId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { streak, refresh };
}
