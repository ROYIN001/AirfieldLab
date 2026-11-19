import { prop, bem } from './p3_bem.mjs';
const n = 2000/60, D = prop.D, P0 = 700e3, KT=0.514444;
function at(J, rho, P) { let lo = 5, hi = 60;
  for (let k = 0; k < 28; k++) { const m = (lo+hi)/2; const s = bem(J, m, { N: 24, P, rho }); if (s.CP*rho*n**3*D**5 > P0) hi = m; else lo = m; }
  const s = bem(J, (lo+hi)/2, { N: 24, P, rho }); return { b: (lo+hi)/2, T: s.T }; }
for (const ch of [1.0, 1.05]) for (const mb of [25, 15, 10]) for (const as of [14, 15]) {
  const P = { ...prop, cD: prop.cD.map(c => c*ch), Mblend: mb, aStallP: as*Math.PI/180 };
  const r = [];
  for (const rho of [1.225, 1.160]) for (const kt of [0, 20, 40]) { const x = at(kt*KT/(n*D), rho, P); r.push(`${rho}/${kt}kt b${x.b.toFixed(1)} T${(x.T/1e3).toFixed(2)}`); }
  console.log(`ch${ch} M${mb} as${as}: ` + r.join(' | '));
}
