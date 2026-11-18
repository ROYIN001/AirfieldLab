// In-plane (normal) force and P-factor moment derivatives vs J and beta75 from azimuthal BEM (estimates).
import { prop, loads } from './p3_bem.mjs';
const D = prop.D, n = 2000 / 60, rho = 1.225;
const Js = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], Bs = [10, 15, 20, 25, 30, 35, 40];
const CN = [], CM = [];
for (const J of Js) { const rn = [], rm = [];
  for (const b of Bs) {
    const mu = 0.03, w = mu * n * D;               // small in-plane component (w only)
    const L = loads(J, b, [0, w], { n, rho, N: 20 });
    rn.push(+(-L.Fz / (rho * n * n * D ** 4) / mu).toFixed(4));
    rm.push(+(-L.Mz / (rho * n * n * D ** 5) / mu).toFixed(4));
  } CN.push(rn); CM.push(rm); }
console.log('beta75', Bs.join(' '));
console.log('C_N_mu = dC_N/dmu (C_N = F_ip/(rho n^2 D^4), mu = V_ip/(nD))'); Js.forEach((J, i) => console.log(J, CN[i].join(' ')));
console.log('C_M_mu = dC_Mpf/dmu (C_Mpf = M_pf/(rho n^2 D^5))'); Js.forEach((J, i) => console.log(J, CM[i].join(' ')));
// linearity check at J=0.5, beta 25: mu 0.03 vs 0.12
for (const mu of [0.03, 0.06, 0.12]) { const L = loads(0.5, 25, [0, mu * n * D], { n, rho, N: 20 }); console.log(`lin check mu=${mu}: CN/mu=${(-L.Fz / (rho * n * n * D ** 4) / mu).toFixed(4)} CM/mu=${(-L.Mz / (rho * n * n * D ** 5) / mu).toFixed(4)}`); }
// symmetry check: v-only gives the same magnitudes on the other axes
const Lv = loads(0.5, 25, [0.03 * n * D, 0], { n, rho, N: 20 });
console.log(`v-only: CN/mu=${(-Lv.Fy / (rho * n * n * D ** 4) / 0.03).toFixed(4)} CMpitch/mu=${(-Lv.My / (rho * n * n * D ** 5) / 0.03).toFixed(4)}`);
import fs from 'fs'; fs.writeFileSync(new URL('./p3_pfactor_table.json', import.meta.url), JSON.stringify({ J: Js, beta75: Bs, CN_mu: CN, CM_mu: CM }));
