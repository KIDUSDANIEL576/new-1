// Replay maths, kept out of the component so it can be tested without a device.

import type { Stroke } from '@/types';

export const countPoints = (strokes: Stroke[]): number =>
  strokes.reduce((n, s) => n + s.points.length, 0);

/**
 * The pool truncated to `position` points, so playback draws itself on.
 * Whole strokes are passed through untouched; only the one being drawn at the
 * cut is copied, which keeps React.memo hits on everything already complete.
 */
export function sliceStrokes(pool: Stroke[], position: number): Stroke[] {
  let left = Math.max(0, Math.round(position));
  const out: Stroke[] = [];
  for (const s of pool) {
    if (left <= 0) break;
    if (left >= s.points.length) {
      out.push(s);
      left -= s.points.length;
    } else {
      out.push({ ...s, points: s.points.slice(0, left) });
      left = 0;
    }
  }
  return out;
}

/** Strokes eligible for replay: no secrets, and within the free window if any. */
export function replayPool(
  strokes: Stroke[],
  inView: (authorId: string) => boolean,
  replayDays: number | null,
  now: number = Date.now()
): Stroke[] {
  let pool = strokes.filter((s) => s.brush !== 'invisible' && inView(s.authorId));
  if (replayDays != null) {
    const cutoff = now - replayDays * 86400000;
    // strokes drawn this session have no createdAt yet — they're always recent
    pool = pool.filter((s) => !s.createdAt || Date.parse(s.createdAt) >= cutoff);
  }
  return pool;
}
