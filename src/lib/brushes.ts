import type { Brush } from '@/types';

// Widths are normalized to canvas width (prototype used px at ~400px wide).
export const BRUSHES: Record<Brush, { label: string; width: number }> = {
  marker: { label: 'Marker', width: 16 / 400 },
  chalk: { label: 'Chalk', width: 7 / 400 },
  glow: { label: 'Glow pen', width: 9 / 400 },
  neon: { label: 'Neon', width: 4 / 400 },
  invisible: { label: 'Secret', width: 12 / 400 },
};

// Free brushes first — the locked ones read as an upgrade, not a wall.
export const BRUSH_ORDER: Brush[] = ['marker', 'chalk', 'glow', 'neon', 'invisible'];

/** Free tier. Everything else is Trace Forever — enforced server-side too. */
export const FREE_BRUSHES: ReadonlySet<Brush> = new Set<Brush>(['marker', 'chalk']);

export const isBrushLocked = (b: Brush, isPro: boolean) => !isPro && !FREE_BRUSHES.has(b);
