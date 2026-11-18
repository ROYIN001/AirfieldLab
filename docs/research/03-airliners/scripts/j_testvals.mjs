// j_testvals.mjs — expected values for the T-J-xx test cases of หัวข้อ 3.6 (one place, re-computable).
import { LBF, KT, FT, isa, lapseBY, flatTheta, ratedThrust, ENG, ffInterp, fmt } from './j_lib.mjs';
const p = (id, s) => console.log(`${id}: ${s}`);
// T-J-01 unit conversion of TCDS ratings
p('T-J-01', `LEAP-1A26 27120 lbf = ${fmt(27120 * LBF, 1)} N; 7B26 11699 daN = ${11699 * 10} N; Trent 772B 71100 lbf = ${fmt(71100 * LBF, 0)} N`);
// T-J-02 100 % N1
p('T-J-02', `CFM56-5B 5200/1.04 = ${fmt(5200 / 1.04, 1)} rpm; CFM56-7B 5382/1.04 = ${fmt(5382 / 1.04, 1)} rpm; LEAP N2 19391/1.165 = ${fmt(19391 / 1.165, 1)} rpm`);
// T-J-03 flat rating factor at 38 C
for (const k of ['CFM56_7B26_class', 'CFM56_5B6_class', 'LEAP_1A26_class', 'LEAP_1A32_class', 'TRENT_772B_class']) p('T-J-03', `${k} Theta(38 C) = ${fmt(flatTheta(ENG[k], 38), 4)}, Theta(45 C) = ${fmt(flatTheta(ENG[k], 45), 4)}`);
// T-J-04 VTBD static thrust at 35.8 C, QNH 1008 hPa, elev 2.7 m
{ const pf = 100800 * Math.pow(1 - 2.25577e-5 * 2.7, 5.25588), amb = { T: 35.8 + 273.15, p: pf, delta: pf / 101325 };
  for (const k of ['CFM56_7B26_class', 'CFM56_5B6_class', 'LEAP_1A26_class', 'TRENT_772B_class']) p('T-J-04', `${k}: F_static = ${fmt(ratedThrust(ENG[k], amb, 0), 0)} N (${fmt(ratedThrust(ENG[k], amb, 0) / ENG[k].F00, 4)} F00), delta ${fmt(amb.delta, 5)}`); }
// T-J-05 B&Y lapse
for (const b of [5.1, 5.9, 11.1]) p('T-J-05', `BPR ${b}: SL M0.2 ${fmt(lapseBY(0.2, 1, b), 4)}; 1000 ft M0.2 ${fmt(lapseBY(0.2, isa(1000 * FT).delta, b), 4)}`);
// T-J-07 kT consistency with ATSB AO-2014-162
{ const E = ENG.CFM56_7B26_class, r = flatTheta(E, 51) / flatTheta(E, 35); p('T-J-07', `model F(51)/F(35) = ${fmt(r, 4)}; ATSB N1 ratio^2 = ${fmt((88.4 / 93.1) ** 2, 4)}, ^2.5 = ${fmt((88.4 / 93.1) ** 2.5, 4)}`); }
// T-J-08 fuel flow
p('T-J-08', `LEAP-1A26 FF(0.30) = ${fmt(ffInterp(ENG.LEAP_1A26_class, 0.30), 4)}, FF(0.50) = ${fmt(ffInterp(ENG.LEAP_1A26_class, 0.50), 4)}, FF(1.0) = ${fmt(ffInterp(ENG.LEAP_1A26_class, 1.0), 4)} kg/s; 7B26 FF(0.5) = ${fmt(ffInterp(ENG.CFM56_7B26_class, 0.5), 4)}`);
// T-J-09 TSFC
p('T-J-09', `TSFC TO 7B26 = ${fmt(1.213 / 116.99 * 1000, 3)} g/(kN s); LEAP-1A26 = ${fmt(0.861 / 120.6 * 1000, 3)}; ratio LEAP/7B26 = ${fmt((0.861 / 120.6) / (1.213 / 116.99), 3)}`);
// T-J-19 legacy thrustAvail check
for (const [t, T0, Vc, bpr] of [['b737_800', 233980, 95.3, 5.1], ['a320neo', 241280, 83.6, 11.1]]) {
  const V = 70; p('T-J-19', `${t}: Vc/sqrt(V^2+Vc^2) at 70 m/s = ${fmt(Vc / Math.hypot(V, Vc), 4)} vs B&Y ${fmt(lapseBY(V / 340.294, 1, bpr), 4)}; T(70) = ${fmt(T0 * Vc / Math.hypot(V, Vc), 0)} N`); }
// T-J-20 cruise reference (informational): OpenAP Svoboda cruise thrust ratios
p('T-J-20', `7B24 cruise ratio ${fmt(24376 / 107650, 4)}, 5B4 ${fmt(22241 / 117900, 4)}; B&Y at M0.8 35 kft BPR 5.3: ${fmt(lapseBY(0.8, isa(35000 * FT).delta, 5.3), 4)}`);
