// Section 7: re-parametrised oleo design (extended:static:compressed pressure ratios) + drop tests. Run: node g7_oleo2.mjs
import { strutForce, drop, strutEff } from './g7_oleo.mjs';
const g = 9.80665, m = 2250, W = m * g, xn = 2.30, xm = -0.35, fN = -xm / (xn - xm);
const WN = W * fN, WM = W * (1 - fN) / 2;
export function design2({ Wst, S, rStatic = 4, rComp = 12, pStaticPsi = 300, Kh, KrRatio = 4, muF = 0.03, n = 1.12 }) {
  const L0 = S * rComp / (rComp - 1);           // gas column length at full extension (V0/A)
  const Fext = Wst / rStatic;
  const p0 = pStaticPsi * 6894.76 / rStatic;    // extended pressure
  const A = Fext / p0, V0 = L0 * A, sst = L0 * (1 - 1 / rStatic);
  return { S, A, V0, p0, n, Kh, Kr: KrRatio * Kh, muF, kStop: 5e7, L0, Fext, sst, Wst };
}
const vLim = 10 * 0.3048, vRes = 1.2 * vLim;
const TM = { kt: 3.2e5, ct: 600 }, TN = { kt: 1.6e5, ct: 300 };
function best(Wst, S, T, extra = {}) {
  let b = null;
  for (let Kh = 100; Kh <= 2e5; Kh *= 1.04) {
    const P = design2({ Wst, S, Kh, ...extra });
    const r = drop(P, T, { vs: vLim, liftFrac: 2 / 3, Wst });
    if (r.bottom) continue;
    if (!b || r.nGround < b.r.nGround) b = { Kh, r, P };
  }
  return b;
}
const isMain = process.argv[1].endsWith('g7_oleo2.mjs');
if (isMain) {
  for (const [nm, Wst, T, Ss] of [['MAIN', WM, TM, [0.22, 0.25, 0.28]], ['NOSE', WN, TN, [0.18, 0.20, 0.22]]]) {
    for (const S of Ss) {
      const b = best(Wst, S, T); const P = b.P, r = b.r;
      const rr = drop(P, T, { vs: vRes, liftFrac: 1.0, Wst }), r3 = drop(P, T, { vs: 3.0, liftFrac: 1.0, Wst }), r15 = drop(P, T, { vs: 1.5, liftFrac: 1.0, Wst });
      // static stiffness at static point (isothermal) and heave frequency
      const kst = P.p0 * P.A * P.L0 / Math.pow(P.L0 - P.sst, 2) * 1; // dF/ds isothermal: p0 A L0/(L0-s)^2 * A?  (F = p0 A L0/(L0-s))
      const keff = 1 / (1 / kst + 1 / T.kt);
      const fH = Math.sqrt(keff / (Wst / g)) / 2 / Math.PI;
      console.log(`${nm} S ${S}: Kh ${b.Kh.toExponential(2)} A ${(P.A * 1e4).toFixed(2)} cm2 L0 ${P.L0.toFixed(3)} m s_static ${(P.sst * 1000).toFixed(0)} mm p_ext ${(P.p0 / 6894.76).toFixed(0)} psi | LIMIT(L=2/3,3.05) n_g ${r.nGround.toFixed(2)} n_i ${r.nInertia.toFixed(2)} smax ${(r.smax * 1000).toFixed(0)} (${(100 * r.smax / S).toFixed(0)}%) tPk ${(r.tPk * 1000).toFixed(0)}ms bounce ${r.airborneAfter} | RES(L=1,3.66) n_g ${rr.nGround.toFixed(2)} smax ${(rr.smax * 1000).toFixed(0)} bottom ${rr.bottom} | 3.0 L=1 n_g ${r3.nGround.toFixed(2)} smax ${(r3.smax * 1000).toFixed(0)} | 1.5 L=1 n_g ${r15.nGround.toFixed(2)} | eta ${strutEff(P, T, { vs: vLim, liftFrac: 2 / 3, Wst }).toFixed(2)} | k_static ${(kst / 1e3).toFixed(0)} kN/m keff ${(keff / 1e3).toFixed(0)} f ${fH.toFixed(2)} Hz`);
    }
  }
}
