// Section 8 extras: clipped strip theory, microburst training-set sweep, 25.341 numbers, Sarpkaya T_L.
import { M } from 'test/harness.mjs';
import { OB, Vicroy } from './microburst.mjs';
const { AC, KT, FT, DEG, G0, atmosphere, FIELD } = M;
const f = (x, n = 3) => Number(x).toFixed(n);
// --- clipped strip theory: trainer centred on one vortex of a 737-800W pair, Gamma = 281.4 m2/s
const rho = 1.1262, Vf = 95 * KT, b = AC.b, S = AC.S, lamT = 0.6, cr = 2 * S / (b * (1 + lamT));
const chord = (y) => cr * (1 - (1 - lamT) * Math.abs(y) / (b / 2));
function Cl(G, b0, rc, yoff, clipDeg) {
  const n = 400, dy = b / n; let L = 0;
  for (let i = 0; i < n; i++) { const y = -b / 2 + (i + 0.5) * dy; let wz = 0;
    for (const [yv, Gv] of [[0, G], [b0, -G]]) { const d = yoff + y - yv; wz += -Gv / (2 * Math.PI) * d / (d * d + rc * rc); }
    let da = -wz / Vf; if (clipDeg) da = Math.max(-clipDeg * DEG, Math.min(clipDeg * DEG, da));
    L += -y * 0.5 * rho * Vf * Vf * chord(y) * AC.CLa * da * dy; }
  return L / (0.5 * rho * Vf * Vf * S * b);
}
const ctl = AC.Clda * AC.daMax;
for (const G of [281.4, 140, 70, 35]) {
  console.log(`Gamma=${G}: ratio linear=${f(Math.abs(Cl(G, 28.11, 1.25, 0)) / ctl, 2)} clip12deg=${f(Math.abs(Cl(G, 28.11, 1.25, 0, 12)) / ctl, 2)} clip8deg=${f(Math.abs(Cl(G, 28.11, 1.25, 0, 8)) / ctl, 2)}; vmax(core)=${f(G / (4 * Math.PI * 1.25), 1)} m/s`);
}
// Gamma giving ratio = 1 and 0.5 (linear and clip 12)
for (const target of [1, 0.5]) for (const clip of [0, 12]) { let lo = 0, hi = 400; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; (Math.abs(Cl(m, 28.11, 1.25, 0, clip)) / ctl > target ? hi = m : lo = m); } console.log(`ratio ${target} at Gamma=${f(lo, 1)} m2/s (clip ${clip || 'none'})`); }
// --- Sarpkaya lifetime T_L(eps*) as read from Switzer & Proctor 2002
function TL(e) { if (e > 0.2535) return 0.8039 * Math.pow(e, -0.75); if (e > 0.0121) { let lo = 0.5, hi = 12; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; (Math.pow(m, 0.25) * Math.exp(-0.7 * m) > e ? lo = m : hi = m); } return lo; } return -18 * e + 9.18; }
for (const e of [0.01, 0.05, 0.088, 0.19, 0.2535, 0.41, 1]) console.log(`eps*=${e}: Sarpkaya T_L=${f(TL(e), 2)}  Tss(hazard model, N*=0)=${f(-(1.27 * Math.log(e) + 0.57), 2)}`);
// --- microburst training sets for the trainer: OB, centre 2000 m before touchdown on a 3 deg GP, zm 50 m, R 600 m
function Fbar(fw, Vkt, xc) { const tg = Math.tan(3 * DEG), V = Vkt * KT, dx = 5, pts = [];
  for (let x = -1500 * FT / tg; x <= -15 / tg; x += dx) { const h = -x * tg, r = Math.abs(x - xc), s = Math.sign(x - xc) || 1, [u, w] = fw(r, h); pts.push({ x, h, Wx: u * s, w }); }
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], c = pts[i], dt = (c.x - a.x) / (V + 0.5 * (a.Wx + c.Wx)); c.F = (c.Wx - a.Wx) / dt / G0 - c.w / V; } pts[0].F = pts[1].F;
  const n = Math.round(1000 / dx); let best = -9, bh = 0; for (let i = 0; i + n < pts.length; i++) { let s = 0; for (let j = i; j < i + n; j++) s += pts[j].F; if (s / n > best) { best = s / n; bh = pts[i + (n >> 1)].h; } }
  return { Fb: best, h: bh, dV: Math.max(...pts.map(p => p.Wx)) - Math.min(...pts.map(p => p.Wx)), wmin: Math.min(...pts.map(p => p.w)), wAtC: fw(0, -xc * tg)[1] }; }
const OBp = (R, um, zm) => { const zs = zm / 0.22; return { R, zs, eps: zs / 12.5, lam: um / (0.2357 * R) }; };
for (const um of [6, 8, 10, 12, 15, 18]) {
  const r = Fbar(OB(OBp(600, um, 50)), 95, -2000);
  const v = Fbar(Vicroy({ rp: 600 * 1.1212, zm: 50, um, c1: -0.22, c2: -2.75 }), 95, -2000);
  console.log(`OB R=600m zm=50m um=${um} m/s (${f(um / KT, 1)} kt), centre 2000 m before TD (GP h=${f(2000 * Math.tan(3 * DEG) / FT, 0)} ft): Fbar=${f(r.Fb)} at ${f(r.h / FT, 0)} ft dV=${f(r.dV / KT, 1)} kt wmin=${f(r.wmin / FT * 60, 0)} fpm | Vicroy(rp=1.1212R): Fbar=${f(v.Fb)} dV=${f(v.dV / KT, 1)} kt wmin=${f(v.wmin / FT * 60, 0)} fpm`);
}
// --- 14 CFR 25.341 design gust
for (const H of [30, 60, 107, 200, 350]) console.log(`25.341: H=${H} ft: Uds/Fg (sea level) = ${f(56 * Math.pow(H / 350, 1 / 6), 1)} ft/s EAS = ${f(56 * Math.pow(H / 350, 1 / 6) * FT, 2)} m/s; U(s=H/2)=${f(0.5 * (1 - Math.cos(Math.PI * 0.5)), 3)}*Uds`);
// quasi-steady incidence from a 1-cos vertical gust peak 3 m/s on the trainer at 95 kt
console.log('Delta alpha for 3 m/s vertical gust at 95 kt =', f(Math.atan(3 / (95 * KT)) / DEG, 2), 'deg; Delta n (quasi-steady, no pitch) =', f(0.5 * 1.1262 * (95 * KT) ** 2 * AC.S * AC.CLa * Math.atan(3 / (95 * KT)) / (AC.m * G0), 3));
// --- ETSO-C117b App.4 Dryden table vs 8785C at same altitudes (sigma_w as given 3.5 ft/s at 100 ft)
for (const [h, su, sw, Lu, Lw] of [[100, 5.6, 3.5, 260, 100], [300, 5.15, 3.85, 540, 300], [700, 5.0, 4.3, 950, 700], [900, 5.0, 4.45, 1123, 900]]) {
  const k = 0.177 + 0.000823 * h; console.log(`h=${h}: ETSO su/sw=${f(su / sw, 2)} Lu=${Lu} | 8785C su/sw=${f(1 / Math.pow(k, 0.4), 2)} Lu=${f(h / Math.pow(k, 1.2), 0)} Lw=${h}`);
}
