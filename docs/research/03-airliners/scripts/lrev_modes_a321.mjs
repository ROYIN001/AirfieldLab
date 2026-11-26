// Reviewer (หัวข้อ 3.3): A321 approach FULL 73 t 143.3 kt CG 30 % modes from the derivative values printed in the a321neo block
// (CYb, Clp not listed for A321 -> A320 values, same wing/fin). Reuses the solver of lrev_modes.mjs by import-free copy.
import { readFileSync } from 'fs';
const src = readFileSync(new URL('./lrev_modes.mjs', import.meta.url), 'utf8').split('const base =')[0];
const { lon, lat } = new Function(src + '; return { lon, lat };')();
const KT = 0.514444, D = Math.PI / 180, m = 73000, b = 34.1, L = 44.51;
const Ixx = m * (0.305 * b / 2) ** 2, Iyy = m * (0.466 * L / 2) ** 2, Izz = m * (0.549 * (b + L) / 4) ** 2;
const K = 1 / (Math.PI * 9.485 * 0.70), CL = 1.754, base = { m, V: 143.3 * KT, rho: 1.225, S: 122.6, cb: 4.1935, b };
console.log('I', Ixx.toExponential(3), Iyy.toExponential(3), Izz.toExponential(3));
console.log('A321 approach lon', JSON.stringify(lon({ ...base, Iyy, CL, CD: 0.0182 + 0.05 + 0.017 + K * CL * CL, CLa: 5.317, CDa: 2 * K * CL * 5.317, Cma: -1.376, Cmq: -45.88, Cmad: -11.52, CLad: 2.38 })));
console.log('A321 approach lat', JSON.stringify(lat({ ...base, Ixx, Izz, al: 4.5 * D, CYb: -0.719, CYp: 0.084, CYr: 0.58, Clb: -0.199, Clp: -0.509, Clr: 0.334, Cnb: 0.099, Cnp: -0.203, Cnr: -0.41 })));
