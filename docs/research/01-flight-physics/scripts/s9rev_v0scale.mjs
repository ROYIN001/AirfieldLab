// Review check: how the fastest parked eigenvalue scales when the tanh reference speed v0 is reduced.
// Loads the same three pure files with the tanh constants replaced (scratch copy in memory; repo untouched).
import fs from 'fs';
import { jac12, eig } from './s9_eigen_lib.mjs';
const root = 'src/';
const base = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(root + f, 'utf8')).join('\n');
function load(vl, vs) {
  const src = base.replace('Math.tanh(vl / 0.25)', `Math.tanh(vl / ${vl})`).replace('Math.tanh(vs / 0.35)', `Math.tanh(vs / ${vs})`);
  if (src === base && (vl !== 0.25 || vs !== 0.35)) throw new Error('replace failed');
  return new Function(src + '\nreturn { Aircraft, DEG };')();
}
for (const [vl, vs] of [[0.25, 0.35], [0.025, 0.35], [0.025, 0.035]]) {
  const { Aircraft, DEG } = load(vl, vs);
  const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); for (let i = 0; i < 20000; i++) ac.step(1 / 2000);
  const ev = eig(jac12(ac, ac.x)).map(({re, im}) => Math.hypot(re, im)).sort((a, b) => b - a);
  console.log(`v0 long ${vl} lat ${vs}: |λ| top3 = ${ev.slice(0, 3).map(v => v.toFixed(1)).join(', ')}; |λ|dt@240 = ${(ev[0] / 240).toFixed(3)}; creep gs = ${ac.air.gs.toExponential(2)} m/s`);
}
