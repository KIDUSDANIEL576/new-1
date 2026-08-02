// Pure logic that can't be exercised without a device otherwise: replay
// slicing and the streak rule. Run with `npm test` (compiles, then runs).
const { sliceStrokes, countPoints, replayPool } = require('../.test-build/lib/replay.js');
const { computeStreak } = require('../.test-build/lib/streak.js');

const fails = [];
const ok = (c, l) => { console.log((c ? '  PASS  ' : '  FAIL  ') + l); if (!c) fails.push(l); };
const pts = (n) => Array.from({ length: n }, (_, i) => [i / n, i / n]);

console.log('\n=== replay slicing ===');
const A = { id: 'a', authorId: 'me', brush: 'marker', color: '#f00', width: 1, points: pts(3) };
const B = { id: 'b', authorId: 'them', brush: 'chalk', color: '#fff', width: 1, points: pts(4) };
const pool = [A, B];

ok(countPoints(pool) === 7, 'counts every point across strokes');
ok(sliceStrokes(pool, 0).length === 0, 'position 0 shows nothing — playback starts empty');
ok(sliceStrokes(pool, 2)[0].points.length === 2, 'mid-stroke cut truncates that stroke');
ok(sliceStrokes(pool, 3).length === 1 && sliceStrokes(pool, 3)[0] === A,
   'a fully-drawn stroke is passed through by identity (keeps memo hits)');
ok(sliceStrokes(pool, 5).length === 2 && sliceStrokes(pool, 5)[1].points.length === 2,
   'spills correctly into the next stroke');
ok(countPoints(sliceStrokes(pool, 99)) === 7, 'past the end shows everything, never more');
ok(sliceStrokes(pool, -5).length === 0, 'negative scrub is clamped, not crashed');
ok(A.points.length === 3 && B.points.length === 4, 'slicing never mutates the source strokes');

console.log('\n=== replay pool ===');
const all = () => true;
const secret = { id: 's', authorId: 'me', brush: 'invisible', color: '#fff', width: 1, points: pts(2) };
ok(replayPool([A, secret], all, null).length === 1, 'invisible ink is excluded from replay');
ok(replayPool([A, B], (a) => a === 'me', null).length === 1, 'respects the current view filter');

const NOW = Date.parse('2026-08-02T00:00:00Z');
const old = { ...A, id: 'old', createdAt: '2026-07-01T00:00:00Z' };
const recent = { ...B, id: 'new', createdAt: '2026-08-01T00:00:00Z' };
ok(replayPool([old, recent], all, 7, NOW).length === 1, 'free tier drops strokes older than the window');
ok(replayPool([old, recent], all, null, NOW).length === 2, 'Pro replays everything');
ok(replayPool([A], all, 7, NOW).length === 1, 'a stroke drawn this session (no timestamp) always counts as recent');

console.log('\n=== streak ===');
const D = (s) => ({ day: s, user_id: s.endsWith('x') ? 'x' : 'me' });
const both = (day) => [{ day, user_id: 'me' }, { day, user_id: 'them' }];
const oneOnly = (day) => [{ day, user_id: 'me' }];
const today = new Date('2026-08-02T12:00:00');

ok(computeStreak([], today) === 0, 'no marks = no streak');
ok(computeStreak([...oneOnly('2026-08-02'), ...oneOnly('2026-08-01')], today) === 0,
   'one person drawing alone is not a streak — it takes two');
ok(computeStreak(both('2026-08-02'), today) === 1, 'both drew today = 1');
ok(computeStreak([...both('2026-08-02'), ...both('2026-08-01'), ...both('2026-07-31')], today) === 3,
   'counts consecutive shared days');
ok(computeStreak([...both('2026-08-01'), ...both('2026-07-31')], today) === 2,
   "today not done yet doesn't wipe yesterday's streak");
ok(computeStreak([...both('2026-08-02'), ...both('2026-07-31')], today) === 1,
   'a missed day breaks the chain');
// only Aug 1 has both people, so the streak so far is 1 — today is still open
ok(computeStreak([...both('2026-08-01'), ...oneOnly('2026-08-02')], today) === 1,
   'a half-finished today still shows the streak so far');
ok(computeStreak([...both('2026-08-01'), ...both('2026-07-31'), ...oneOnly('2026-08-02')], today) === 2,
   'and today completing later only ever adds to it');

console.log(fails.length ? `\n${fails.length} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exit(fails.length ? 1 : 0);
