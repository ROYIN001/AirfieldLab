// Oseguera-Bowles (1988) and Vicroy (1991/92) axisymmetric microburst models; F-factor along a 3 deg approach.
// Convention: u = radial outflow (+ away from centre), w = vertical wind POSITIVE UP (as in the NASA papers).
const KT = 0.514444, FT = 0.3048, G = 9.80665;
export function OB({ R, zs, eps, lam }) { // R shaft radius, zs = z*, eps = boundary-layer height, lam [1/s]
  return (r, z) => {
    const x2 = (r / R) ** 2, P = Math.exp(-z / zs) - Math.exp(-z / eps);
    const u = r < 1e-6 ? 0 : (lam * R * R / (2 * r)) * (1 - Math.exp(-x2)) * P;
    const w = -lam * Math.exp(-x2) * (eps * (Math.exp(-z / eps) - 1) - zs * (Math.exp(-z / zs) - 1));
    return [u, w];
  };
}
export const OBfromPeak = ({ rp, zm, um }) => { const R = rp / 1.1212, zs = zm / 0.22, eps = zs / 12.5; return { R, zs, eps, lam: um / (0.2357 * R) }; };
export function Vicroy({ rp, zm, um, alpha = 2, c1 = -0.15, c2 = -3.2175 }) {
  const lam = 2 * um / (rp * (Math.exp(c1) - Math.exp(c2)) * Math.exp(1 / (2 * alpha)));
  const f = (r, z) => {
    const x = (r * r / (rp * rp)) ** alpha, E = Math.exp((2 - x) / (2 * alpha));
    const u = (lam * r / 2) * (Math.exp(c1 * z / zm) - Math.exp(c2 * z / zm)) * E;
    const w = -lam * ((zm / c1) * (Math.exp(c1 * z / zm) - 1) - (zm / c2) * (Math.exp(c2 * z / zm) - 1)) * (1 - x / 2) * E;
    return [u, w];
  };
  f.lam = lam; return f;
}
// continuity check (1/r) d(r u)/dr + dw/dz = 0
function contCheck(f, r, z) { const h = 0.01; const ru = (rr) => rr * f(rr, z)[0]; return ((ru(r + h) - ru(r - h)) / (2 * h)) / r + (f(r, z + h)[1] - f(r, z - h)[1]) / (2 * h); }
// F along a straight 3 deg glide path toward +x, microburst centre at x = xc on the path, constant TAS V
function Fprofile(f, { V, xc, gs = 3, x0 = -12000, x1 = 0, dx = 5 }) {
  const tg = Math.tan(gs * Math.PI / 180), out = [];
  for (let x = x0; x <= x1; x += dx) {
    const h = -x * tg; if (h < 1) break;
    const r = Math.abs(x - xc), s = Math.sign(x - xc) || 1;
    const [u, w] = f(r, h);
    const Wx = u * s;                                  // + tailwind (flying toward +x)
    out.push({ x, h, Wx, w });
  }
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1], b = out[i], Vg = V + 0.5 * (a.Wx + b.Wx), dtt = (b.x - a.x) / Vg;
    b.F = (b.Wx - a.Wx) / dtt / G - b.w / V;
  }
  out[0].F = out[1]?.F ?? 0;
  const n = Math.round(1000 / dx); let best = { Fbar: -1 };
  for (let i = 0; i + n < out.length; i++) { let s = 0; for (let j = i; j < i + n; j++) s += out[j].F; const Fb = s / n; if (Fb > best.Fbar) best = { Fbar: Fb, xs: out[i].x, xe: out[i + n].x, h: out[i + (n >> 1)].h }; }
  const dV = Math.max(...out.map(o => o.Wx)) - Math.min(...out.map(o => o.Wx));
  const wmin = Math.min(...out.map(o => o.w));
  return { best, dV, wmin, Fmax: Math.max(...out.map(o => o.F)) };
}
if (process.argv[1].endsWith('microburst.mjs')) {
  // 1) model sanity: peaks
  const p = { rp: 1000, zm: 60, um: 15 };
  const V1 = Vicroy(p), O1 = OB(OBfromPeak(p));
  let best = [0, 0, 0]; for (let r = 10; r < 4000; r += 5) for (let z = 1; z < 600; z += 1) { const u = V1(r, z)[0]; if (u > best[0]) best = [u, r, z]; }
  console.log('Vicroy peak u', best[0].toFixed(3), 'at r', best[1], 'z', best[2], ' lambda', V1.lam.toExponential(3), '1/s');
  best = [0, 0, 0]; for (let r = 10; r < 4000; r += 5) for (let z = 1; z < 600; z += 1) { const u = O1(r, z)[0]; if (u > best[0]) best = [u, r, z]; }
  console.log('OB peak u', best[0].toFixed(3), 'at r', best[1], 'z', best[2], ' params', JSON.stringify(OBfromPeak(p), (k, v) => typeof v === 'number' ? +v.toPrecision(4) : v));
  console.log('continuity residual Vicroy', contCheck(V1, 700, 150).toExponential(2), ' OB', contCheck(O1, 700, 150).toExponential(2));
  for (const z of [100, 300, 600, 1000]) console.log(`  w at r=0 z=${z} m: Vicroy ${V1(0, z)[1].toFixed(2)} m/s (${(V1(0, z)[1] / FT * 60).toFixed(0)} fpm)  OB ${O1(0, z)[1].toFixed(2)} m/s`);
  // c1,c2 alternative constants (TM-104053: -0.22,-2.75)
  const V2 = Vicroy({ ...p, c1: -0.22, c2: -2.75 });
  console.log('alt constants (-0.22,-2.75): w(0,300)=', V2(0, 300)[1].toFixed(2), ' u(rp,zm)=', V2(1000, 60)[0].toFixed(2));
  // 2) training sets: F along a 3 deg path, centre placed where the glide path is at 300 ft (x = -h/tan3)
  const sets = [
    { k: 'mb_light', rp: 900, zm: 60, um: 8 },
    { k: 'mb_moderate', rp: 900, zm: 60, um: 13 },
    { k: 'mb_severe', rp: 900, zm: 60, um: 20 },
  ];
  for (const s of sets) {
    const f = Vicroy(s);
    for (const [Vkt, lbl] of [[95, 'trainer 95 kt'], [140, 'jet 140 kt']]) {
      for (const hc of [300, 600]) {
        const xc = -(hc * FT) / Math.tan(3 * Math.PI / 180);
        const r = Fprofile(f, { V: Vkt * KT, xc });
        console.log(`${s.k} um=${s.um} rp=${s.rp} zm=${s.zm} | ${lbl} centre at ${hc} ft on GP: dV=${(r.dV / KT).toFixed(1)} kt, min w=${(r.wmin / FT * 60).toFixed(0)} fpm, Fmax=${r.Fmax.toFixed(3)}, Fbar(1km)=${r.best.Fbar.toFixed(3)} around h=${(r.best.h / FT).toFixed(0)} ft`);
      }
    }
  }
  // 3) mean-profile shear F on a 3 deg approach (1/7 power, W10=15 kt headwind) at 95 kt
  const W10 = 15 * KT; const Wp = (h) => W10 * Math.pow(Math.max(h, 0.3) / 10, 1 / 7);
  for (const h of [300, 100, 30]) { const dh = 1, Vv = 95 * KT * Math.sin(3 * Math.PI / 180); const dWdt = (Wp(h) - Wp(h - dh)) / (dh / Vv); console.log(`1/7 law headwind loss rate at ${h} m: ${(dWdt / KT).toFixed(3)} kt/s -> F=${(dWdt / G).toFixed(4)}`); }
}
