// Effect of JSBSim's contact-speed clamp (compressSpeed ≤ compressLength/dt, FGLGear.cpp) on the 5 m/s drop, vs current model.
import fs from 'fs';
const root = 'src/';
function build(clamp) { let fl = fs.readFileSync(root + '20-flight.js', 'utf8');
  if (clamp) { const a = '+ g.c * vc[2];'; if (!fl.includes(a)) throw new Error('miss'); fl = fl.replace(a, '+ g.c * Math.min(vc[2], pen / (globalThis.__DT || 1 / 240));'); }
  const src = ['10-atmo.js', '15-geo.js'].map(f => fs.readFileSync(root + f, 'utf8')).join('\n') + fl;
  return new Function(src + '\nreturn { AC, Aircraft, DEG, G0, eulerToQ };')(); }
const variants = { current: build(false), 'JSBSim clamp': build(true) };
const rows = [];
for (const [name, Mx] of Object.entries(variants)) for (const dt of [1 / 4000, 1 / 1000, 1 / 240, 1 / 120, 1 / 60]) {
  globalThis.__DT = dt; const ac = new Mx.Aircraft(); const tr = ac.setApproach({ dist: 5500 }); const q = Mx.eulerToQ(0, 5 * Mx.DEG, 0);
  ac.x.set([0, 0, -1.6, 45, 0, 5, q[0], q[1], q[2], q[3], 0, 0, 0]); ac.updateAir(0); ac.x[2] -= (0.3 - ac.air.hWheel); ac.updateAir(0);
  ac.thr = ac.cmd.thr = Mx.AC.idle; ac.de = ac.cmd.de = tr.de; let pk = 0, pkNz = 0, pv = ac.x[5]; const N = Math.round(1.5 / dt);
  for (let i = 0; i < N; i++) { ac.step(dt); pk = Math.max(pk, ac.air.load[1]); const nz = -(ac.x[5] - pv) / dt / Mx.G0 + 1; pv = ac.x[5]; pkNz = Math.max(pkNz, nz); }
  rows.push({ variant: name, dt: `1/${Math.round(1 / dt)}`, 'peak main load N': Math.round(pk), 'peak nz': +pkNz.toFixed(2) });
}
console.table(rows);
