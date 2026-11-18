// p3rev: reviewer re-checks for section 3 (propeller). Run: node p3rev_checks.mjs
import { prop, chord } from './p3_bem.mjs';
import { M } from 'test/harness.mjs';
const { AC, KT, atmosphere, FIELD } = M;
const atm = atmosphere(FIELD.elev, 31 - (15 - 0.0065 * FIELD.elev));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// 1) moments about CG with the full hub position r_p = [3.94, 0, -0.06] (FRD), hub loads from p3_analyze_out.txt
const rp = [3.94, 0, -0.06];
const cases = [ // label, kt, F hub [T,Fy,Fz], M hub [Mx,My,Mz]
  ['80kt a10 700kW', 80, [10152, 0, -258], [-3345, 0, -568]],
  ['88kt a5 150kW', 88, [2551, 0, -102], [-716, 0, -212]],
  ['88kt b5 150kW', 88, [2551, -102, 0], [-716, -212, 0]],
  ['80kt b5 700kW', 80, [10104, -130, 0], [-3345, -286, 0]],
  ['80kt axial 700kW', 80, [10088, 0, 0], [-3345, 0, 0]]];
for (const [lab, kt, F, Mh] of cases) {
  const rxF = cross(rp, F), Mcg = rxF.map((v, i) => v + Mh[i]);
  const rxF_noz = cross([3.94, 0, 0], F), Mnf = rxF_noz.map((v, i) => v + Mh[i]);
  const qS = 0.5 * atm.rho * (kt * KT) ** 2 * AC.S;
  console.log(`${lab}: about CG with r_z=-0.06: L=${Mcg[0].toFixed(0)} M=${Mcg[1].toFixed(0)} N=${Mcg[2].toFixed(0)} N m (dCm=${(Mcg[1] / (qS * AC.c)).toFixed(4)}) | r_z=0 (normal force only): M=${Mnf[1].toFixed(0)} N=${Mnf[2].toFixed(0)} (dCm=${(Mnf[1] / (qS * AC.c)).toFixed(4)}) | thrust-line part r_z*T=${(rp[2] * F[0]).toFixed(0)}`);
}
// 2) activity factor, planform area, solidity definitions
const R = prop.D / 2; let AF = 0, Ab = 0; const Ns = 2000;
for (let i = 0; i < Ns; i++) { const x = prop.xh + (1 - prop.xh) * (i + 0.5) / Ns, dx = (1 - prop.xh) / Ns; AF += chord(x) / prop.D * x ** 3 * dx; Ab += prop.B * chord(x) * dx * R; }
console.log(`AF per blade = ${(AF * 1e5 / 16).toFixed(1)}; blade planform area B*int c dr = ${Ab.toFixed(3)} m2; sigma=Bc/(piR) at 0.75R = ${(prop.B * chord(0.75) / (Math.PI * R)).toFixed(4)}; local sigma'=Bc/(2 pi r) at 0.75R = ${(prop.B * chord(0.75) / (2 * Math.PI * 0.75 * R)).toFixed(4)}`);
// 3) misc derived numbers
const A = Math.PI * prop.D ** 2 / 4, Om = 2 * Math.PI * 2000 / 60;
console.log(`A=${A.toFixed(3)} m2, Om=${Om.toFixed(2)} rad/s, Q(700kW)=${(700e3 / Om).toFixed(1)} N m = ${(700e3 / Om / 1.35582).toFixed(0)} lbf ft, tip speed=${(Om * R).toFixed(1)} m/s, a(31C)=${atm.a.toFixed(1)} -> Mtip=${(Om * R / atm.a).toFixed(3)}, helical@200kt=${(Math.hypot(Om * R, 200 * KT) / atm.a).toFixed(3)}`);
console.log(`twist 0.2R->tip = ${((Math.atan(1.1 / (0.2 * Math.PI)) - Math.atan(1.1 / Math.PI)) * 180 / Math.PI).toFixed(2)} deg; Ribner C_Ypsi = 8*0.0713/(pi*0.6) = ${(8 * 0.0713 / (Math.PI * 0.6)).toFixed(3)}/rad`);
console.log(`gyro: H=14*Om=${(14 * Om).toFixed(0)}, N(q=10deg/s)=${(14 * Om * 10 * Math.PI / 180).toFixed(1)} N m; /Izz=${(14 * Om * 10 * Math.PI / 180 / AC.Izz).toFixed(4)} rad/s2; KE=${(0.5 * 14 * Om * Om / 1e3).toFixed(0)} kJ; tau=I*Om/Q=${(14 * Om / (700e3 / Om)).toFixed(3)} s`);
console.log(`ground roll moment: Q/track = ${(700e3 / Om / 3.10).toFixed(0)} N per wheel; left-right = ${(2 * 700e3 / Om / 3.10).toFixed(0)} N; track from AC.gear = ${(AC.gear[2].b[1] - AC.gear[1].b[1]).toFixed(2)} m`);
console.log(`rho(31C)=${atm.rho.toFixed(4)}; Vc=${(AC.eta * AC.P / AC.T0).toFixed(2)} m/s; dCm/dalpha normal force = 0.0384/(10 deg) = ${(0.0384 / (10 * Math.PI / 180)).toFixed(3)} /rad vs Cma ${AC.Cma}`);
