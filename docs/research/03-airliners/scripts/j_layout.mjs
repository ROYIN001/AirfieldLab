// j_layout.mjs — engine positions (m FRD from 25 % MAC, m STA), thrust moments and legacy thrustAvail() fit (topic 3.6).
// Inputs: JSBSim 737.xml (LGPL-2.1), FlightGear A320-family / Airbus_A330 FDMs (GPL-2.0) — numbers only, est;
// 25 % MAC STA and static CG height from หัวข้อ 3.5 (D). All outputs are estimates (est: true).
import { isa, lapseBY, ENG, fmt, KT } from './j_lib.mjs';
const IN = 0.0254, DEG = Math.PI / 180;
// --- positions
const L = {};
// 737-800: JSBSim engine x 540 in, AERORP 625 in (taken as 25 % MAC), y 193 in; z from geometry (CG height 2.7 m - nacelle centre height)
{ const dx = (625 - 540) * IN, y = 193 * IN, hNacC = (0.64 + 0.48) / 2 + 2.06 / 2, z = 2.7 - hNacC;
  L.b737_800 = { x: dx, y, z, sta: 18.644 - dx, hEng: hNacC, alt_jsbsim_cg_dx: (639 - 540) * IN, jenkinson_y: 0.282 * 34.3 / 2 }; }
// A320 family: FG engine x 14.3962788, CG(25 % MAC) 18.849, z -1.04768 vs CG z 0.19249, y 5.755
{ const dx = 18.849 - 14.3962788, z = 0.19249 - (-1.04768), y = 5.755;
  L.a320 = { x: dx, y, z, sta: 16.310 - dx, hEng: 2.71 - z };
  L.a321 = { x: dx, y, z, sta: 20.578 - dx, hEng: 2.71 - z }; }
// A330-300: FG engine x -2.7034, CG 0.48086, AERORP 1.48086, z -1.89664 vs CG z 0.25204, y 9.40138
{ const dx = 0.48086 - (-2.7034), z = 0.25204 - (-1.89664), y = 9.40138;
  L.a330_300 = { x: dx, y, z, sta: null, hEng_ifCG3p6: 3.6 - z, dx_vs_AERORP: 1.48086 - (-2.7034) }; }
for (const [k, v] of Object.entries(L)) console.log(k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, b === null ? null : +b.toFixed(3)])));
// thrust axis with FG installation angles (pitch 2.2 deg up, toe 1 deg): body FRD unit vector
const ax = (p, yw) => [Math.cos(p * DEG) * Math.cos(yw * DEG), Math.sin(yw * DEG), -Math.sin(p * DEG)];
console.log('axis pitch 2.2 toe 0:', ax(2.2, 0).map(v => +v.toFixed(5)), ' axis pitch 2.2 yaw 1:', ax(2.2, 1).map(v => +v.toFixed(5)));
// --- pitching moment of go-around thrust at approach (both engines), and OEI yaw moment
const TY = [ // type, class, layout key, S, cbar(m), Vapp kt, b
  ['b737_800', 'CFM56_7B26_class', 'b737_800', 124.6, 4.17, 145, 34.32],
  ['a320ceo', 'CFM56_5B6_class', 'a320', 122.6, 4.1935, 135, 34.10],
  ['a320neo', 'LEAP_1A26_class', 'a320', 122.6, 4.1935, 135, 35.80],
  ['a321neo', 'LEAP_1A32_class', 'a321', 122.6, 4.1935, 140, 35.80],
  ['a330_300', 'TRENT_772B_class', 'a330_300', 361.6, 7.26, 140, 60.3],
];
const amb = isa(0, 20); // 35 C day at SL
for (const [t, k, lk, S, c, vk, b] of TY) {
  const E = ENG[k], V = vk * KT, M = V / amb.a, F = E.F00 * lapseBY(M, amb.delta, E.bpr), q = 0.5 * amb.rho * V * V, g = L[lk];
  const dCm = 2 * F * g.z / (q * S * c), dCn = F * g.y / (q * S * b);
  console.log(`${t}: TOGA F/eng ${fmt(F / 1000, 1)} kN at ${vk} kt; My(2 eng) ${fmt(2 * F * g.z / 1000, 1)} kN m, dCm ${fmt(dCm, 4)}; OEI N ${fmt(F * g.y / 1000, 1)} kN m, dCn ${fmt(dCn, 4)}`);
}
// --- legacy thrustAvail fit: T(V)/T0 = Vc/sqrt(V^2+Vc^2) vs B&Y at SL ISA, V = 0..90 m/s (least squares on Vc)
const legacy = {};
for (const [t, k] of TY) {
  const E = ENG[k]; let best = null;
  for (let Vc = 40; Vc <= 200; Vc += 0.1) { let e = 0; for (let V = 0; V <= 90; V += 2) { const M = V / 340.294; e += (Vc / Math.hypot(V, Vc) - lapseBY(M, 1, E.bpr)) ** 2; } if (!best || e < best.e) best = { Vc, e }; }
  const T0 = 2 * E.F00, eta = 0.8, P = T0 * best.Vc / eta; let maxErr = 0;
  for (let V = 0; V <= 90; V += 2) maxErr = Math.max(maxErr, Math.abs(best.Vc / Math.hypot(V, best.Vc) - lapseBY(V / 340.294, 1, E.bpr)));
  legacy[t] = { T0, eta, P: Math.round(P / 1000) * 1000, Vc: +best.Vc.toFixed(1), maxErr: +maxErr.toFixed(4) };
}
console.log('legacy thrustAvail fits:', legacy);
