// Streak maths, kept pure so the rule can be tested without a database.

/** Local calendar day — a streak should follow the day you're living in. */
export function localDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export interface DailyMark {
  day: string;
  user_id: string;
}

/**
 * Consecutive days you BOTH left a trace. One person drawing every day isn't a
 * streak; the point is that it takes two.
 *
 * Today only counts once both have drawn — otherwise the number would drop at
 * midnight and climb back later the same day, which reads as losing something
 * you never lost.
 */
export function computeStreak(marks: DailyMark[], today: Date = new Date()): number {
  const byDay: Record<string, Set<string>> = {};
  for (const m of marks) (byDay[m.day] ??= new Set()).add(m.user_id);
  const bothDrew = (key: string) => (byDay[key]?.size ?? 0) >= 2;

  const cursor = new Date(today);
  if (!bothDrew(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);

  let n = 0;
  while (bothDrew(localDay(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}
