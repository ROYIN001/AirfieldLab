import { prop, bem } from './p3_bem.mjs';
const n = 2000/60, rho = 1.225, D = prop.D, P0 = 700e3;
function staticAt(P) { let lo = 5, hi = 60;
  for (let k = 0; k < 30; k++) { const m = (lo+hi)/2; const s = bem(0, m, { N: 24, P }); if (s.CP*rho*n**3*D**5 > P0) hi = m; else lo = m; }
  const s = bem(0, (lo+hi)/2, { N: 24, P }); const T = s.CT*rho*n*n*D**4, Tid = Math.cbrt(2*rho*Math.PI*D*D/4)*P0**(2/3);
  return { beta: (lo+hi)/2, CT: s.CT, CP: s.CP, T, FM: (T/Tid)**1.5 }; }
for (const ch of [1.0, 1.05, 1.1]) for (const a0 of [-2.5, -3, -3.5]) for (const as of [13, 14]) {
  const P = { ...prop, cD: prop.cD.map(c => c*ch), a0: a0*Math.PI/180, aStallP: as*Math.PI/180 };
  const s = staticAt(P);
  console.log(`ch ${ch} a0 ${a0} as ${as}: beta=${s.beta.toFixed(1)} CT=${s.CT.toFixed(3)} T=${(s.T/1e3).toFixed(2)} kN FM=${s.FM.toFixed(2)}`);
}
