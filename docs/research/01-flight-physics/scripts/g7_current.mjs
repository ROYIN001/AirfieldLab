// Section 7 (gear): current-model measurements. Run: node g7_current.mjs
import { M } from 'test/harness.mjs';
const { Aircraft, Flight, SCENARIOS, AC, KT, FT, DEG, RAD, G0 } = M;
const W = AC.m * G0;
// 1) parked equilibrium
{
  const f = new Flight({ wind: SCENARIOS.calm });
  f.ac.setParked(0, 0, 30 * DEG);
  for (let i = 0; i < 240 * 8; i++) f.ac.step(1 / 240);
  const a = f.ac.air;
  const L = a.load;
  console.log('PARKED h_cg', a.h.toFixed(4), 'pitch', (a.theta * RAD).toFixed(3), 'loads N', L.map(v => v.toFixed(0)).join('/'),
    'nose share %', (100 * L[0] / (L[0] + L[1] + L[2])).toFixed(2), 'sum/W', ((L[0] + L[1] + L[2]) / W).toFixed(4), 'gs', a.gs.toExponential(2));
  // static compressions
  const R = f.ac.R; // fresh
  AC.gear.forEach((g, i) => console.log(` strut ${i} static defl ${(L[i] / g.k * 1000).toFixed(1)} mm of stroke ${g.stroke * 1000} mm`));
}
// 2) per-strut natural frequency / damping (tributary mass from static split, rigid airframe)
{
  const xn = AC.gear[0].b[0], xm = AC.gear[1].b[0];
  const shareN = (0 - xm) / (xn - xm);
  const mN = AC.m * shareN, mM = AC.m * (1 - shareN) / 2;
  for (const [nm, g, mt] of [['nose', AC.gear[0], mN], ['main', AC.gear[1], mM]]) {
    const wn = Math.sqrt(g.k / mt), z = g.c / (2 * Math.sqrt(g.k * mt));
    console.log(`MODE ${nm}: m_trib ${mt.toFixed(0)} kg, k ${g.k}, c ${g.c}, wn ${wn.toFixed(2)} rad/s = ${(wn / 2 / Math.PI).toFixed(2)} Hz, zeta ${z.toFixed(3)}`);
  }
  // heave and pitch of whole airframe on all three struts
  const kz = AC.gear.reduce((s, g) => s + g.k, 0), cz = AC.gear.reduce((s, g) => s + g.c, 0);
  const wh = Math.sqrt(kz / AC.m); console.log(`HEAVE wn ${(wh / 2 / Math.PI).toFixed(2)} Hz zeta ${(cz / (2 * Math.sqrt(kz * AC.m))).toFixed(3)}`);
  const kth = AC.gear.reduce((s, g) => s + g.k * g.b[0] ** 2, 0), cth = AC.gear.reduce((s, g) => s + g.c * g.b[0] ** 2, 0);
  const wp = Math.sqrt(kth / AC.Iyy); console.log(`PITCH wn ${(wp / 2 / Math.PI).toFixed(2)} Hz zeta ${(cth / (2 * Math.sqrt(kth * AC.Iyy))).toFixed(3)}`);
  const kph = AC.gear.reduce((s, g) => s + g.k * g.b[1] ** 2, 0), cph = AC.gear.reduce((s, g) => s + g.c * g.b[1] ** 2, 0);
  const wr = Math.sqrt(kph / AC.Ixx); console.log(`ROLL wn ${(wr / 2 / Math.PI).toFixed(2)} Hz zeta ${(cph / (2 * Math.sqrt(kph * AC.Ixx))).toFixed(3)}`);
}
// 3) drop test: wings level, pitch th, sink vs, lift = liftFrac*W applied at CG, no forward speed (aero ~0)
export function dropCurrent(vs, th = 5 * DEG, liftFrac = 1.0, T = 1.5) {
  const ac = new Aircraft();
  ac.gearPos = 1; ac.flaps = 1; ac.thr = 0; ac.cmd.thr = 0;
  const q = M.Aircraft ? null : null;
  // place mains 1 mm above ground
  const cth = Math.cos(th), sth = Math.sin(th);
  const gm = AC.gear[1].b; // body [x,y,z]; NED down of contact = d + (-sth*x + cth*z)
  const d0 = -(-sth * gm[0] + cth * gm[2]) - 0.001;
  const qw = Math.cos(th / 2), qy = Math.sin(th / 2);
  ac.x.set([0, 0, d0, 0, 0, vs, qw, 0, qy, 0, 0, 0, 0]);
  const orig = ac.deriv.bind(ac);
  ac.deriv = (s, out, diag) => { orig(s, out, diag); out[5] -= liftFrac * G0; };
  ac.updateAir(0);
  let maxN = [0, 0, 0], maxPen = [0, 0, 0], maxNz = 0, tPeak = 0, bounce = false, wasOn = false, leftAt = null, dmin = Infinity;
  const dt = 1 / 240; const out = new Float64Array(13);
  for (let t = 0; t < T; t += dt) {
    ac.step(dt);
    const L = ac.air.load;
    const R = ac.R;
    for (let i = 0; i < 3; i++) {
      maxN[i] = Math.max(maxN[i], L[i]);
      const g = AC.gear[i]; const c = [0, 0, 0];
      const pen = ac.x[2] + (ac.R[6] * g.b[0] + ac.R[7] * g.b[1] + ac.R[8] * g.b[2]);
      maxPen[i] = Math.max(maxPen[i], pen);
    }
    const Ltot = L[0] + L[1] + L[2];
    const nz = Ltot / W + liftFrac; // load factor at CG (gear + lift)
    if (nz > maxNz) { maxNz = nz; tPeak = t; }
    const on = ac.air.wow[1] || ac.air.wow[2];
    if (wasOn && !on) bounce = true;
    wasOn = wasOn || on;
  }
  return { maxN, maxPen, maxNz, tPeak, bounce };
}
for (const vs of [3.0, 3.05, 3.66]) {
  for (const lf of [1.0, 2 / 3]) {
    const r = dropCurrent(vs, 5 * DEG, lf);
    console.log(`DROP vs ${vs} m/s lift ${lf.toFixed(2)}W: mainN ${r.maxN[1].toFixed(0)} N (=${(r.maxN[1] / (W / 2)).toFixed(2)}x static-ish), nose ${r.maxN[0].toFixed(0)}, ` +
      `ground reaction factor (sum/W) ${((r.maxN[0] + 2 * r.maxN[1]) / W).toFixed(2)}, nz_cg ${r.maxNz.toFixed(2)} at ${r.tPeak.toFixed(3)} s, max comp main ${(r.maxPen[1] * 1000).toFixed(0)} mm (stroke ${AC.gear[1].stroke * 1000}), nose ${(r.maxPen[0] * 1000).toFixed(0)} mm, bounce ${r.bounce}`);
  }
}
