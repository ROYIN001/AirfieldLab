import { prop, bem } from './p3_bem.mjs';
const n = 2000/60, rho = 1.225, D = prop.D, P0 = 700e3;
function staticAt(P) { // find beta s.t. power = P0 at J=0
  let lo = 5, hi = 60;
  for (let k = 0; k < 30; k++) { const m = (lo+hi)/2; const s = bem(0, m, { N: 24, P }); if (s.CP*rho*n**3*D**5 > P0) hi = m; else lo = m; }
  const s = bem(0, (lo+hi)/2, { N: 24, P });
  const T = s.CT*rho*n*n*D**4, Tid = Math.cbrt(2*rho*Math.PI*D*D/4)*P0**(2/3);
  return { beta: (lo+hi)/2, CT: s.CT, CP: s.CP, T, FM: (T/Tid)**1.5 };
}
const variants = [
  { name: 'base', ch: 1.0, a0: -2.5, as: 13 },
  { name: 'AF115 a0-3.5 as14', ch: 1.15, a0: -3.5, as: 14 },
  { name: 'AF125 a0-4 as15', ch: 1.25, a0: -4, as: 15 },
  { name: 'AF115 a0-4 as15', ch: 1.15, a0: -4, as: 15 },
  { name: 'AF130 a0-4 as16', ch: 1.30, a0: -4, as: 16 },
];
for (const v of variants) {
  const P = { ...prop, cD: prop.cD.map(c => c*v.ch), a0: v.a0*Math.PI/180, aStallP: v.as*Math.PI/180 };
  const s = staticAt(P);
  console.log(v.name, `static beta75=${s.beta.toFixed(1)} CT=${s.CT.toFixed(3)} CP=${s.CP.toFixed(3)} T=${(s.T/1e3).toFixed(2)} kN FM=${s.FM.toFixed(2)}`);
}
