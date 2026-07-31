// render-snapshot — renders the couple's latest-drawn canvas to a PNG in the
// widgets bucket. Called fire-and-forget by the app/web after stroke changes;
// the home-screen widgets display that PNG via the widget-snapshot endpoint.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { createCanvas, loadImage } from 'https://deno.land/x/canvas@v1.4.2/mod.ts';

const W = 640;
const H = 704;

type Pt = [number, number];
interface StrokeRow {
  brush: string;
  color: string;
  width: number;
  points: Pt[];
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: 'unauthorized' }, 401);

    const { coupleId } = await req.json().catch(() => ({}));
    if (!coupleId) return json({ error: 'coupleId required' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: membership } = await admin
      .from('members')
      .select('user_id')
      .eq('couple_id', coupleId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!membership) return json({ error: 'not a member' }, 403);

    // the widget shows whatever was drawn on last; fall back to the shared canvas
    const { data: canvases } = await admin
      .from('canvases')
      .select('id, kind, photo_url')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true });
    if (!canvases?.length) return json({ error: 'no canvases' }, 404);

    const { data: latestStroke } = await admin
      .from('strokes')
      .select('canvas_id')
      .in(
        'canvas_id',
        canvases.map((c) => c.id)
      )
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    const target =
      canvases.find((c) => c.id === latestStroke?.canvas_id) ??
      canvases.find((c) => c.kind === 'shared') ??
      canvases[0];

    const { data: strokes } = await admin
      .from('strokes')
      .select('brush, color, width, points')
      .eq('canvas_id', target.id)
      .order('id', { ascending: true });

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    paintBackdrop(ctx);

    // photo backgrounds are stored as 'path#fit=cover|contain&dim=NN'
    if (target.photo_url) {
      const [path, frag = ''] = String(target.photo_url).split('#');
      const params = new URLSearchParams(frag);
      const fit = params.get('fit') === 'contain' ? 'contain' : 'cover';
      const dim = Math.max(0, Math.min(70, Number(params.get('dim') ?? 35) || 0));
      const { data: blob } = await admin.storage.from('couple-photos').download(path);
      if (blob) {
        const img = await loadImage(new Uint8Array(await blob.arrayBuffer()));
        const s =
          fit === 'contain'
            ? Math.min(W / img.width(), H / img.height())
            : Math.max(W / img.width(), H / img.height());
        const dw = img.width() * s;
        const dh = img.height() * s;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.fillStyle = `rgba(12,11,16,${dim / 100})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    for (const s of (strokes ?? []) as StrokeRow[]) drawStroke(ctx, s);

    const png = canvas.toBuffer('image/png');
    const { error: upErr } = await admin.storage
      .from('widgets')
      .upload(`${coupleId}/snapshot.png`, png, { contentType: 'image/png', upsert: true });
    if (upErr) return json({ error: 'upload failed' }, 502);

    return json({ rendered: true, canvasId: target.id, strokes: strokes?.length ?? 0 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

/** Midpoint-quadratic smoothing, same family as the app's stroke rendering. */
function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  const px = (i: number) => pts[i][0] * W;
  const py = (i: number) => pts[i][1] * H;
  ctx.beginPath();
  ctx.moveTo(px(0), py(0));
  if (pts.length < 3) {
    for (let i = 1; i < pts.length; i++) ctx.lineTo(px(i), py(i));
    return;
  }
  for (let i = 1; i < pts.length - 1; i++) {
    ctx.quadraticCurveTo(px(i), py(i), (px(i) + px(i + 1)) / 2, (py(i) + py(i + 1)) / 2);
  }
  ctx.lineTo(px(pts.length - 1), py(pts.length - 1));
}

/** Brush characters matching the web app's drawStroke. */
function drawStroke(ctx: CanvasRenderingContext2D, s: StrokeRow) {
  const pts = s.points;
  if (!Array.isArray(pts) || pts.length < 1) return;
  const w = Math.max(1.5, s.width * W);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  tracePath(ctx, pts);
  switch (s.brush) {
    case 'glow':
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = w * 1.6;
      ctx.lineWidth = w;
      ctx.stroke();
      break;
    case 'neon':
      ctx.strokeStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = w * 2.6;
      ctx.lineWidth = w * 0.75;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, w * 0.22);
      ctx.stroke();
      break;
    case 'chalk':
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = w * 1.15;
      ctx.stroke();
      break;
    default: // marker
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = w;
      ctx.stroke();
  }
  ctx.restore();
}

/** The app's board backdrop: near-black with red/pink dusk tints. */
function paintBackdrop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#100f16';
  ctx.fillRect(0, 0, W, H);
  let rg = ctx.createRadialGradient(W * 0.15, 0, 0, W * 0.15, 0, W * 0.9);
  rg.addColorStop(0, 'rgba(226,51,67,0.10)');
  rg.addColorStop(1, 'rgba(226,51,67,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
  rg = ctx.createRadialGradient(W, H, 0, W, H, W * 0.9);
  rg.addColorStop(0, 'rgba(255,122,156,0.10)');
  rg.addColorStop(1, 'rgba(255,122,156,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
