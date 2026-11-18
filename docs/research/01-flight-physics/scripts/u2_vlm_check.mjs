import { solve } from './u2_vlm_ge.mjs';
const D2R = Math.PI / 180;
// 1) vertical profile of downwash at tail x, alpha 0 vs 6 (tail held fixed relative to the wing root in EARTH frame)
for (const a of [4, 6]) {
  const r = [];
  for (const dz of [-0.6, -0.3, 0, 0.3, 0.6, 0.9]) { const s = solve({ alpha: a * D2R, ground: false, tailDz: dz }); r.push(`${dz}:${(s.eps / D2R).toFixed(2)}`); }
  console.log('alpha', a, 'eps(deg) vs tail dz (body) :', r.join('  '), ' CL', solve({ alpha: a * D2R, ground: false }).CL.toFixed(3));
}
