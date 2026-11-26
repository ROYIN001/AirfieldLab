// drev_papi_repo.mjs — reviewer: what the repo's papiSeen() geometry (PAPI.h = 0.9 m, units 15/24/33/42 m outside the
// runway edge on the left, per-unit slant distance) gives for T-D-06 / T-D-21, versus the report's idealised geometry
// (light height 0, unit on the centre line at distance D). Run: node drev_papi_repo.mjs
const FT = 0.3048, R = Math.PI / 180, f = (x, n = 3) => x.toFixed(n);
const units = [[15, 3.5], [24, 3 + 10 / 60], [33, 2 + 50 / 60], [42, 2.5]]; // [offset from edge m, setting deg]
const seen = (h, s, D, W, hL = 0.9) => units.map(([o, a]) => { const d = Math.hypot(D - s, W / 2 + o); const ang = Math.atan2(h - hL, d) / R; return { a, ang }; });
const show = (lbl, h, D, W) => { const u = seen(h, 0, D, W); const ideal = Math.atan2(h, D) / R; console.log(`${lbl.padEnd(28)} eye ${f(h, 2)} m: ideal ${f(ideal)}° ${[2.5, 2 + 50 / 60, 3 + 10 / 60, 3.5].filter((x) => ideal > x).length}W | repo per-unit ${u.map((x) => f(x.ang)).join('/')}° → ${u.filter((x) => x.ang > x.a).length}W`); };
const H2 = { b738W: (18.6 - 13.9) * FT, a333: 11.34 - 8.56 };
show('T-D-06 738W 03L', 55 * FT + H2.b738W, 440, 60);
show('T-D-06 738W 21R', 54 * FT + H2.b738W, 405, 60);
show('T-D-06 A333 21R', 54 * FT + H2.a333, 405, 60);
for (const h of [17, 19, 21.23, 23.5, 25.5]) show('T-D-21 21R', h, 405, 60);
