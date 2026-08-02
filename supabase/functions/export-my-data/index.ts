// export-my-data — everything this account has made, in one file.
//
// The honest companion to a delete button: you shouldn't be able to erase
// something you were never able to take with you.
//
// Two deliberate decisions about scope:
//
// 1. YOUR strokes are exported in full. Your partner's are counted, not
//    included. The canvas is shared, but their ink is their data — exporting
//    it here would hand one person a copy of the other's on request.
// 2. The strokes are also rendered to SVG. A JSON array of normalized
//    coordinates satisfies data portability and tells a human nothing; an SVG
//    opens in any browser. The product is drawings, so the export should
//    contain drawings.
//
// Deploy with: supabase functions deploy export-my-data

import { createClient } from 'npm:@supabase/supabase-js@2';

const W = 1000; // SVG viewport; points are normalized 0..1
const H = 1100; // matches the app's 1 : 1.1 board

type Pt = [number, number];

interface StrokeRow {
  id: number;
  canvas_id: string;
  author_id: string;
  brush: string;
  color: string;
  width: number;
  points: Pt[];
  created_at: string;
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

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: me } = await admin
      .from('members')
      .select('couple_id, display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const account = {
      userId: user.id,
      email: user.email ?? null,
      emailConfirmed: !!user.email_confirmed_at,
      accountCreated: user.created_at ?? null,
      displayName: me?.display_name ?? null,
    };

    if (!me) {
      return json({
        exportedAt: new Date().toISOString(),
        format: 'trace-export-v1',
        account,
        couple: null,
        note: 'This account is not paired with anyone, so there is nothing else to export.',
      });
    }

    const coupleId = me.couple_id as string;

    const [couple, partner, canvases, myStrokes, marks, entitlement, photos] =
      await Promise.all([
        admin.from('couples').select('invite_code, created_at').eq('id', coupleId).maybeSingle(),
        admin
          .from('members')
          .select('display_name')
          .eq('couple_id', coupleId)
          .neq('user_id', user.id)
          .maybeSingle(),
        admin
          .from('canvases')
          .select('id, kind, photo_url, created_at')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: true }),
        admin
          .from('strokes')
          .select('id, canvas_id, author_id, brush, color, width, points, created_at')
          .eq('author_id', user.id)
          .order('id', { ascending: true }),
        admin
          .from('daily_marks')
          .select('day')
          .eq('couple_id', coupleId)
          .eq('user_id', user.id)
          .order('day', { ascending: true }),
        admin
          .from('entitlements')
          .select('product_id, store, purchased_at')
          .eq('couple_id', coupleId)
          .maybeSingle(),
        admin.from('photo_events').select('created_at, set_by').eq('couple_id', coupleId),
      ]);

    const canvasRows = canvases.data ?? [];
    const mine = (myStrokes.data ?? []) as StrokeRow[];

    // Scoped to THIS couple's canvases. An unfiltered count would have counted
    // every stroke in the database and reported it as the partner's.
    const canvasIds = canvasRows.map((c) => c.id);
    let partnerStrokeCount = 0;
    if (canvasIds.length) {
      const { count } = await admin
        .from('strokes')
        .select('id', { count: 'exact', head: true })
        .in('canvas_id', canvasIds)
        .neq('author_id', user.id);
      partnerStrokeCount = count ?? 0;
    }

    // Photos live in shared storage. Link the ones this person added; the links
    // are short-lived, which the export says out loud rather than pretending
    // they're permanent.
    const myPhotoCount = (photos.data ?? []).filter((p) => p.set_by === user.id).length;
    const photoLinks: { path: string; url: string | null }[] = [];
    for (const c of canvasRows) {
      const path = String(c.photo_url ?? '').split('#')[0];
      if (!path) continue;
      const { data: signed } = await admin.storage
        .from('couple-photos')
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      photoLinks.push({ path, url: signed?.signedUrl ?? null });
    }

    const exportedCanvases = canvasRows.map((c) => {
      const strokes = mine.filter((s) => s.canvas_id === c.id);
      return {
        canvasId: c.id,
        kind: c.kind,
        created: c.created_at,
        hasPhotoBackground: !!c.photo_url,
        myStrokeCount: strokes.length,
        // openable in any browser — the drawing, not just its coordinates
        svg: toSvg(strokes),
        strokes: strokes.map((s) => ({
          id: s.id,
          brush: s.brush,
          color: s.color,
          width: s.width,
          drawnAt: s.created_at,
          points: s.points,
        })),
      };
    });

    return json({
      exportedAt: new Date().toISOString(),
      format: 'trace-export-v1',
      account,
      couple: {
        coupleId,
        inviteCode: couple.data?.invite_code ?? null,
        created: couple.data?.created_at ?? null,
        partnerName: partner.data?.display_name ?? null,
        traceForever: entitlement.data
          ? {
              product: entitlement.data.product_id,
              store: entitlement.data.store,
              purchasedAt: entitlement.data.purchased_at,
              note: 'Bought once for the couple — it stays with the canvas, not with one account.',
            }
          : null,
      },
      streak: {
        daysYouDrew: (marks.data ?? []).length,
        days: (marks.data ?? []).map((m) => m.day),
      },
      canvases: exportedCanvases,
      photos: {
        youAdded: myPhotoCount,
        links: photoLinks,
        note: 'Photo links expire after 7 days. Download anything you want to keep now.',
      },
      notIncluded: {
        partnerStrokes: partnerStrokeCount,
        why:
          "Your partner's drawings are their data, not yours. They can export " +
          'their own copy the same way from their own account.',
      },
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

/** Renders strokes to a standalone SVG, matching the app's brush character. */
function toSvg(strokes: StrokeRow[]): string {
  const parts: string[] = [];
  for (const s of strokes) {
    const pts = Array.isArray(s.points) ? s.points : [];
    if (pts.length < 1) continue;
    const d = pts
      .map((p, i) => `${i ? 'L' : 'M'}${(p[0] * W).toFixed(1)} ${(p[1] * H).toFixed(1)}`)
      .join(' ');
    const w = Math.max(1.5, s.width * W);
    // invisible ink stays invisible-ish, but it is the author's own secret and
    // this is their own export, so it is included and simply marked
    const opacity =
      s.brush === 'chalk' ? 0.55 : s.brush === 'invisible' ? 0.35 : s.brush === 'marker' ? 0.85 : 1;
    parts.push(
      `<path d="${d}" fill="none" stroke="${escapeAttr(s.color)}" stroke-width="${w.toFixed(1)}" ` +
        `stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"` +
        (s.brush === 'invisible' ? ' stroke-dasharray="6 6"' : '') +
        ' />'
    );
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="#100f16"/>` +
    parts.join('') +
    `</svg>`
  );
}

function escapeAttr(v: string): string {
  return String(v).replace(/[<>&"']/g, '');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
