// web — serves the Trace web app (and its privacy/support pages) at a stable
// URL, straight from the git branch.
//
// Why this exists: the web app previously lived on raw.githack.com, a CDN for
// source files with multi-minute cache lag and no control. This function
// fetches the file from GitHub raw at request time with a 60-second in-memory
// cache, so a git push is live in under a minute — and the Vercel front door
// (vercel.json rewrites) gives it a clean domain.
//
// verify_jwt is off by design: this IS the public web page.
//
// Deploy with: supabase functions deploy web --no-verify-jwt

const REPO_RAW =
  'https://raw.githubusercontent.com/KIDUSDANIEL576/new-1/claude/trace-prototype-mobile-5s5vfd/web';

const ALLOWED: Record<string, string> = {
  'index.html': 'text/html; charset=utf-8',
  'privacy.html': 'text/html; charset=utf-8',
  'support.html': 'text/html; charset=utf-8',
};

const TTL_MS = 60_000;
const cache = new Map<string, { body: string; at: number }>();

Deno.serve(async (req) => {
  let name = new URL(req.url).pathname.split('/').pop() ?? '';
  if (name === '' || name === 'web') name = 'index.html';
  const type = ALLOWED[name];
  if (!type) return new Response('not found', { status: 404 });

  const hit = cache.get(name);
  if (hit && Date.now() - hit.at < TTL_MS) return page(hit.body, type);

  try {
    const res = await fetch(`${REPO_RAW}/${name}`);
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const body = await res.text();
    cache.set(name, { body, at: Date.now() });
    return page(body, type);
  } catch {
    // a stale page beats a broken one
    if (hit) return page(hit.body, type);
    return new Response('temporarily unavailable — try again in a minute', { status: 503 });
  }
});

function page(body: string, type: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': type,
      // browsers may cache briefly; the function itself refreshes every minute
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
