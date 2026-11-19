// Section 6: misc derived numbers (tab range, trim-rate effect, release test, stall force, rudder/aileron forces)
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD, G0, atmosphere, FIELD } = M;
const LBF = 4.44822;
const P = { eta: 0.90, deda: AC.Cmadot / AC.Cmq, lt: (-AC.Cmde / AC.CLde) * AC.c, Se: 1.10, ce: 0.30, G: 2.40, Cha: -0.0020 * RAD, Chd: -0.0060 * RAD, Cht: -0.0035 * RAD };
const W = AC.m * G0;
function trim(Vkt, flaps) { const atm = atmosphere(FIELD.elev + 300, 0), V = Vkt * KT, qb = 0.5 * atm.rho * V * V; const CLreq = W / (qb * AC.S), c0 = AC.CL0 + AC.CLflap * flaps, m0 = AC.Cm0 + AC.Cmflap * flaps; const den = AC.CLa * AC.Cmde - AC.CLde * AC.Cma; return { V, qb, alpha: ((CLreq - c0) * AC.Cmde - AC.CLde * (-m0)) / den, de: (AC.CLa * (-m0) - AC.Cma * (CLreq - c0)) / den }; }
const tabZero = (Vkt, fl) => { const t = trim(Vkt, fl); return -(P.Cha * t.alpha * (1 - P.deda) + P.Chd * t.de) / P.Cht; };
const out = {};
out.tab_deg = { '71kt_f1': +(tabZero(71, 1) * RAD).toFixed(2), '75kt_f1': +(tabZero(75, 1) * RAD).toFixed(2), '95kt_f1': +(tabZero(95, 1) * RAD).toFixed(2), '90kt_f0': +(tabZero(90, 0) * RAD).toFixed(2), '200kt_f0': +(tabZero(200, 0) * RAD).toFixed(2), '230kt_f0': +(tabZero(230, 0) * RAD).toFixed(2) };
// sensitivity of zero-force speed to tab at 95 kt flaps 1 and at 150 kt clean (kt per deg tab)
for (const [v, fl] of [[95, 1], [150, 0]]) { const d = 1; const s = (tabZero(v + d, fl) - tabZero(v - d, fl)) / (2 * d) * RAD; out[`dTab_deg_per_kt_${v}`] = +s.toFixed(3); out[`kt_per_tabdeg_${v}`] = +(1 / s).toFixed(2); }
// proposed electric trim: ±20° tab in 12 s full travel -> 3.33 deg/s
out.trimRate_dps = +(40 / 12).toFixed(2);
out.trimSpeedRate_kt_per_s_95 = +(3.33 * Math.abs(out.kt_per_tabdeg_95)).toFixed(1);
out.trimSpeedRate_kt_per_s_150 = +(3.33 * Math.abs(out.kt_per_tabdeg_150)).toFixed(1);
// rudder pedal force for P-factor rudder 2.8 deg at 80 kt full power (sec-03), slipstream q ratio 1.0..2.0
const R = { Sr: 0.85, cr: 0.32, Chd: -0.0060, Gr: (25 * DEG) / 0.09 };
const q80 = 0.5 * 1.225 * (80 * KT) ** 2;
out.rudderPedal_lbf_2p8deg_80kt = [1.0, 1.5, 2.0].map((k) => ({ qRatio: k, F_lbf: +(R.Gr * k * q80 * R.Sr * R.cr * Math.abs(R.Chd) * 2.8 / LBF).toFixed(1) }));
out.rudderPedal_lbf_per_deg_95kt = +(R.Gr * 0.5 * 1.225 * (95 * KT) ** 2 * R.Sr * R.cr * Math.abs(R.Chd) / LBF).toFixed(2);
out.rudderFull25_95kt_lbf = +(out.rudderPedal_lbf_per_deg_95kt * 25).toFixed(0);
// aileron stick force
const A = { Sa: 0.65, ca: 0.25, Chd: -0.0030, Ga: (20 * DEG) / 0.09 };
const fa = (Vkt, da) => A.Ga * 0.5 * 1.225 * (Vkt * KT) ** 2 * (2 * A.Sa * A.ca) * Math.abs(A.Chd) * da / LBF;
out.aileron_lbf = { torque7p3deg_80kt: +fa(80, 7.3).toFixed(1), full20deg_95kt: +fa(95, 20).toFixed(1), full20deg_150kt: +fa(150, 20).toFixed(1) };
// stick force for steady roll: pb/2V with Clda/Clp -> roll rate per deg aileron (steady, simple)
out.pb2V_per_deg = +(-(AC.Clda / AC.Clp) * DEG).toFixed(4);
console.log(JSON.stringify(out, null, 1));
