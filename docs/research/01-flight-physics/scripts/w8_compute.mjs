// Section 8 computations: wind profiles, microburst F-factor (ETSO-C117b App.2 sets), trainer excess thrust, wake vortex.
import { M } from 'test/harness.mjs';
import { OB, OBfromPeak, Vicroy } from './microburst.mjs';
const { AC, KT, FT, DEG, G0, atmosphere, FIELD, Aircraft } = M;
const NM = 1852;
const f = (x, n = 3) => Number(x).toFixed(n);
console.log('=== 1. Mean wind profiles, W10 = 15 kt ===');
const W10 = 15;
const pow7 = (h) => Math.pow(Math.min(Math.max(h, 0.3), 300) / 10, 1 / 7);
const logp = (z0) => (h) => Math.log(Math.max(h, z0 * 1.01) / z0) / Math.log(10 / z0);
const profs = { 'power1/7(code)': pow7, 'log z0=0.03': logp(0.03), 'log z0=0.046(8785C CatC 0.15ft)': logp(0.15 * FT), 'log z0=0.25': logp(0.25), 'log z0=0.5': logp(0.5), 'log z0=1.0': logp(1.0) };
for (const [k, p] of Object.entries(profs)) {
  const row = [10, 30, 50, 100, 200, 300, 500, 1000].map(hf => (W10 * p(hf * FT)).toFixed(1));
  console.log(k.padEnd(34), 'kt at 10,30,50,100,200,300,500,1000 ft:', row.join(' '));
}
console.log('equivalent z0 for 1/7 power matched at 10 m: z0 = 10*exp(-7) =', f(10 * Math.exp(-7), 4), 'm');
// headwind loss rate on a 3 deg approach at 95 kt TAS (ground speed ~ 95-15)
for (const [k, p] of Object.entries(profs)) {
  const out = [];
  for (const hf of [300, 100, 50]) {
    const h = hf * FT, dh = 0.5, Vv = (95 - 15) * KT * Math.tan(3 * DEG);
    const dWdt = W10 * KT * (p(h) - p(h - dh)) / (dh / Vv);
    out.push(`${hf}ft ${f(dWdt / KT, 3)}kt/s F=${f(dWdt / G0, 4)}`);
  }
  console.log(k.padEnd(34), out.join(' | '));
}
console.log('\n=== 2. Trainer excess thrust/weight on approach (current AC params) ===');
{
  const ac = new Aircraft(); ac.isaDev = 31 - (15 - 0.0065 * FIELD.elev);
  const tr = ac.setApproach({ dist: 5500 });
  const d = { wow: [], load: [] }; ac.deriv(ac.x, new Float64Array(13), d);
  const thrAvail = d.T / ac.thr; // T at full throttle
  const W = AC.m * G0;
  console.log(`trim: thr=${f(tr.thr)} alpha=${f(tr.alpha / DEG, 2)}deg V=${f(d.V, 2)} m/s D=${f(d.D, 0)} N T=${f(d.T, 0)} N Tmax=${f(thrAvail, 0)} N; (Tmax-D)/W=${f((thrAvail - d.D) / W, 3)}; sin(gamma) on 3deg ~ ${f(Math.sin(3 * DEG), 4)}`);
  // flaps up, gear up at 95 kt level: excess
  const ac2 = new Aircraft(); ac2.isaDev = ac.isaDev; ac2.setApproach({ dist: 5500, flaps: 0, gearDown: false }); const d2 = { wow: [], load: [] }; ac2.deriv(ac2.x, new Float64Array(13), d2);
  console.log(`clean at 95 kt: D=${f(d2.D, 0)} N -> (Tmax-D)/W=${f((d2.T / ac2.thr - d2.D) / W, 3)}`);
}
console.log('\n=== 3. Microburst F-factor along 3 deg approach, ETSO-C117b App.2 sets (OB model) ===');
// ETSO-C117b Appendix 2 table: [R ft, umax ft/s, zm ft, distance rel. touchdown ft (neg = before touchdown)]
const sets = [[920, 37, 98, -9000], [1180, 47.6, 98, -14000], [2070, 58.4, 131, -4000], [4430, 68.9, 164, 1000], [9010, 72.2, 262, 1000], [3450, 88.2, 197, -4000], [3180, 53.1, 262, 1000], [1640, 46, 164, -4000], [5250, 81.3, 197, 1000], [1250, 67.6, 100, -4000]];
function OBset(Rft, umfps, zmft) { const R = Rft * FT, zs = zmft * FT / 0.22, eps = zs / 12.5, lam = umfps * FT / (0.2357 * R); return { R, zs, eps, lam }; }
function track(fw, Vkt, xc, h0 = 1500 * FT, gs = 3, dx = 5) {
  // aircraft flies toward +x on a fixed 3 deg path from h0 to 15 m, touchdown at x = 0 (path anchored at x=0,h=0); constant TAS
  const tg = Math.tan(gs * DEG), V = Vkt * KT, pts = [];
  for (let x = -h0 / tg; x <= -15 / tg; x += dx) {
    const h = -x * tg, r = Math.abs(x - xc), s = Math.sign(x - xc) || 1, [u, w] = fw(r, h);
    pts.push({ x, h, Wx: u * s, w });
  }
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], dt = (b.x - a.x) / (V + 0.5 * (a.Wx + b.Wx)); b.F = (b.Wx - a.Wx) / dt / G0 - b.w / V; }
  pts[0].F = pts[1].F;
  const n = Math.round(1000 / dx); let best = -9, bh = 0;
  for (let i = 0; i + n < pts.length; i++) { let s = 0; for (let j = i; j < i + n; j++) s += pts[j].F; if (s / n > best) { best = s / n; bh = pts[i + (n >> 1)].h; } }
  return { Fbar: best, hAt: bh, dV: Math.max(...pts.map(p => p.Wx)) - Math.min(...pts.map(p => p.Wx)), wmin: Math.min(...pts.map(p => p.w)) };
}
sets.forEach(([R, um, zm, xrel], i) => {
  const P = OBset(R, um, zm), fw = OB(P), xc = xrel * FT;
  const a = track(fw, 95, xc), b = track(fw, 140, xc);
  console.log(`set${i + 1} R=${R}ft um=${um}fps(${f(um * FT / KT, 1)}kt) zm=${zm}ft xc=${xrel}ft | 95kt: Fbar1km=${f(a.Fbar)} at ${f(a.hAt / FT, 0)}ft, dV=${f(a.dV / KT, 1)}kt, wmin=${f(a.wmin / FT * 60, 0)}fpm | 140kt: Fbar1km=${f(b.Fbar)}`);
});
// ETSO Figure-1 style: fav = 20 kt/(g t)
console.log('ETSO f_av,x = 20kt/(g t):', [10, 9, 8, 7, 6, 5].map(t => `${t}s:${f(20 * KT / (G0 * t), 4)}`).join(' '));
console.log('\n=== 4. Microburst model property checks ===');
{
  const p = { rp: 1000, zm: 60, um: 15 };
  for (const [c1, c2, lbl] of [[-0.22, -2.75, 'TM-104053'], [-0.15, -3.2175, 'Wanke&Hansman1992']]) {
    const V = Vicroy({ ...p, c1, c2 });
    console.log(`${lbl}: c1*e^c1=${f(c1 * Math.exp(c1), 4)} c2*e^c2=${f(c2 * Math.exp(c2), 4)}; u(rp,zm)=${f(V(1000, 60)[0])} w(0,300m)=${f(V(0, 300)[1], 2)} m/s; lambda=${V.lam.toExponential(3)}`);
  }
  // OB relations: z_m/z* = 0.22 from ln(12.5)/11.5; r_peak/R = 1.1212; umax = 0.2357 lambda R
  console.log('OB: ln(12.5)/11.5 =', f(Math.log(12.5) / 11.5, 4), '; max_x (1-e^-x^2)/x at x=', (() => { let b = [0, 0]; for (let x = 0.5; x < 2; x += 1e-4) { const v = (1 - Math.exp(-x * x)) / x; if (v > b[0]) b = [v, x]; } return f(b[1], 4) + ' value ' + f(b[0], 4); })(), '; 0.5*0.6382*(e^-0.2196-e^-2.745)=', f(0.5 * 0.6382 * (Math.exp(-0.2196) - Math.exp(-2.745)), 4));
}
console.log('\n=== 5. Wake vortex: leader A320 / 737-800W on approach, follower = trainer ===');
const hft = 1000, atm = atmosphere(FIELD.elev + hft * FT, 31 - (15 - 0.0065 * FIELD.elev));
const rho = atm.rho; console.log('rho at 1000 ft, OAT 31C at field:', f(rho, 4));
const leaders = [
  { k: 'A320ceo sharklets', m: 64500, b: 35.80, Vkt: 137, note: 'MLW most common (Airbus AC 2024); Vapp est.' },
  { k: 'A320ceo fences', m: 64500, b: 34.10, Vkt: 137, note: '' },
  { k: '737-800W', m: 66361, b: 35.79, Vkt: 142, note: 'Boeing ARC/approach speeds' },
];
const tr = { b: AC.b, S: AC.S, CLa: AC.CLa, Vkt: 95, Clda: AC.Clda, daMax: AC.daMax, Clp: AC.Clp };
const chord = (y) => { // trapezoid, taper 0.6, area S, span b (estimate)
  const lam = 0.6, cr = 2 * tr.S / (tr.b * (1 + lam)); return cr * (1 - (1 - lam) * Math.abs(y) / (tr.b / 2));
};
function vBH(G, rc, dy, dz) { // Burnham-Hallock tangential velocity at offset (dy right, dz down) from vortex axis; returns [vy, vz]
  const r2 = dy * dy + dz * dz; const vt = G / (2 * Math.PI) / (r2 + rc * rc); // v_theta/r
  return [vt * dz, -vt * dy]; // rotation sense set by sign of G
}
function rollCoeff(G, b0, rc, yoff, zoff, Vf) { // trainer wing centred at (yoff, zoff) relative to the LEFT vortex of the pair (pair: left at 0 with +G, right at +b0 with -G)
  const n = 400; let Lsum = 0; const dy = tr.b / n;
  for (let i = 0; i < n; i++) {
    const y = -tr.b / 2 + (i + 0.5) * dy;
    let wz = 0; // downward velocity at the strip
    for (const [yv, Gv] of [[0, G], [b0, -G]]) { const [, vz] = vBH(Gv, rc, yoff + y - yv, zoff); wz += vz; }
    const dalpha = -wz / Vf; // upwash (negative down) raises local alpha
    const dL = 0.5 * rho * Vf * Vf * chord(y) * tr.CLa * dalpha * dy; // lift increment, up positive
    Lsum += -y * dL; // FRD roll moment: lift up on right wing (y>0) gives negative (left) roll
  }
  return Lsum / (0.5 * rho * Vf * Vf * tr.S * tr.b);
}
const Clctl = tr.Clda * tr.daMax;
console.log(`trainer roll control C_l,max = Clda*damax = ${f(Clctl, 4)}`);
for (const L of leaders) {
  const V = L.Vkt * KT, b0 = Math.PI * L.b / 4, G0v = L.m * G0 / (rho * V * b0), w0 = G0v / (2 * Math.PI * b0), t0 = b0 / w0;
  console.log(`${L.k}: m=${L.m} b=${L.b} V=${L.Vkt}kt -> b0=${f(b0, 2)} m, Gamma0=${f(G0v, 1)} m2/s, w0=${f(w0, 3)} m/s (${f(w0 / FT * 60, 0)} fpm), t0=${f(t0, 1)} s`);
  for (const dnm of [3, 4, 5]) {
    const age = dnm * NM / V; // follower crosses the point the leader passed `age` s earlier (no wind)
    const desc = w0 * age;
    for (const eps of [1e-4, 1e-3, 1e-2]) {
      const epsS = Math.cbrt(eps * b0) / w0, T = age / t0;
      // Switzer&Proctor 2002 hazard-model onset Tss (N*=0) and smooth decay (tanh step, beta=0.75 alpha=2.7 as read; est.)
      const Tss = -(1.27 * Math.log(epsS) + 0.57);
      const Gfrac = Math.exp(-0.08 * epsS * T) * 0.5 * (1 - Math.tanh(0.75 * (T - Tss - 2.7)));
      const G = G0v * Gfrac;
      const out = [];
      for (const rc of [0.035 * L.b, 0.05 * L.b]) {
        const Cl = rollCoeff(G, b0, rc, 0, 0, tr.Vkt * KT);
        out.push(`rc=${f(rc, 2)}m Cl=${f(Cl, 4)} ratio=${f(Math.abs(Cl) / Clctl, 2)}`);
      }
      console.log(`   ${dnm} NM age ${f(age, 0)} s (T=${f(T, 2)}) descent(no decay)=${f(desc, 0)} m (${f(desc / FT, 0)} ft) | eps=${eps} eps*=${f(epsS, 3)} Tss=${f(Tss, 2)} Gamma/G0=${f(Gfrac, 3)} | ${out.join(' ; ')}`);
    }
  }
  // undecayed worst case and lateral profile of ratio for 737/A320 at Gamma0
  const prof = [-15, -10, -5, -2.5, 0, 2.5, 5, 10, 15].map(yo => f(rollCoeff(G0v, b0, 0.035 * L.b, yo, 0, tr.Vkt * KT) / Clctl, 2));
  console.log(`   undecayed Gamma0: ratio vs lateral offset of trainer centre from left vortex (-15..15 m):`, prof.join(' '));
}
// Reimer & Vicroy 1996 boundary ~2000 ft2/s for B737-100 -> m2/s
console.log('2000 ft^2/s =', f(2000 * FT * FT, 1), 'm^2/s');
