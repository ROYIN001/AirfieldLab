// Current model: max coefficient change between 0.1-deg neighbours over the full alpha circle (beta 0, flaps 0)
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG } = M;
const ac = new Aircraft();
function c(aDeg) { ac.flaps = 0; ac.gearPos = 1; ac.de = 0; ac.adot = 0; const a = aDeg * DEG, V = 40;
  ac.x.set([0, 0, -1000, V * Math.cos(a), 0, V * Math.sin(a), 1, 0, 0, 0, 0, 0, 0]); const o = new Float64Array(13), d = { wow: [0, 0, 0], load: [0, 0, 0] };
  ac.deriv(ac.x, o, d); return { CL: d.CL, CD: d.D / (d.qbar * AC.S), Cm: AC.Iyy * o[11] / (d.qbar * AC.S * AC.c) }; }
const mx = { CL: [0, 0], CD: [0, 0], Cm: [0, 0] };
for (let a = -180; a < 180; a += 0.1) { const p = c(a), q = c(a + 0.1); for (const k in mx) { const d = Math.abs(q[k] - p[k]); if (d > mx[k][0]) mx[k] = [d, a]; } }
console.log('current max |dC| per 0.1 deg (value, at alpha):', JSON.stringify(Object.fromEntries(Object.entries(mx).map(([k, v]) => [k, [+v[0].toFixed(3), +v[1].toFixed(1)]]))));
const p = c(179.999), q = c(-179.999); console.log('wrap jump CL CD Cm:', (p.CL - q.CL).toFixed(3), (p.CD - q.CD).toFixed(3), (p.Cm - q.Cm).toFixed(3));
// CL ratio at beta 60 vs 0 (alpha 5)
function clb(bDeg) { const a = 5 * DEG, b = bDeg * DEG, V = 40; ac.x.set([0, 0, -1000, V * Math.cos(a) * Math.cos(b), V * Math.sin(b), V * Math.sin(a) * Math.cos(b), 1, 0, 0, 0, 0, 0, 0]);
  const d = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, new Float64Array(13), d); return d.L; }
console.log('current lift ratio beta60/beta0 at alpha 5:', (clb(60) / clb(0)).toFixed(3));
