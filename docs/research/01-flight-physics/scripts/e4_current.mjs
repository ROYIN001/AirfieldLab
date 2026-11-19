// Section 4 (turboprop): measure the CURRENT AirfieldLab engine behaviour.
import { M } from 'test/harness.mjs';
const { Flight, Aircraft, AC, KT, FT, DEG, RAD, G0, atmosphere, FIELD } = M;
const out = {};
// 1) Static thrust vs OAT at VTBD: does thrust/power change with density?
for (const oat of [15, 31, 38]) {
  const f = new Flight({ oatC: oat });
  const ac = f.ac; ac.setParked(0, 0, 0); ac.thr = ac.cmd.thr = 1; ac.brake = ac.cmd.brake = 1;
  const d = { wow: [0,0,0], load: [0,0,0] }; const tmp = new Float64Array(13); ac.deriv(ac.x, tmp, d);
  out['staticT_oat' + oat] = { T_N: +d.T.toFixed(0), rho: +d.rho.toFixed(4) };
}
// 2) Thrust/power implied: P_implied = T*V/eta at several speeds (full throttle), independent of rho?
const Vc = AC.eta * AC.P / AC.T0;
out.Vc_ms = +Vc.toFixed(2);
for (const kt of [0, 60, 95, 150, 200]) { const V = kt * KT; const T = AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); out['Tfull_' + kt + 'kt'] = { T_N: +T.toFixed(0), TV_over_eta_kW: +(T * V / AC.eta / 1000).toFixed(0) }; }
// 3) Throttle step response: idle -> 1 (first-order lag 1 s). Time to 50 %, 90 %, 95 % of full command
{
  const ac = new Aircraft(); ac.thr = AC.idle; ac.cmd.thr = 1; const dt = 1 / 240; let t = 0; const tt = {};
  while (t < 10) { ac.thr += (Math.max(AC.idle, Math.min(1, ac.cmd.thr)) - ac.thr) * (1 - Math.exp(-dt / 1.0)); t += dt;
    for (const p of [0.5, 0.9, 0.95]) if (tt[p] == null && ac.thr >= p) tt[p] = +t.toFixed(2); }
  out.stepUp_idle_to_full = tt;
  ac.thr = 1; ac.cmd.thr = 0; t = 0; const td = {};
  while (t < 10) { ac.thr += (Math.max(AC.idle, Math.min(1, ac.cmd.thr)) - ac.thr) * (1 - Math.exp(-dt / 1.0)); t += dt;
    for (const p of [0.5, 0.1]) if (td[p] == null && ac.thr <= p) td[p] = +t.toFixed(2); }
  out.stepDown_full_to_idle = td;
}
// 4) Idle thrust on approach (95 kt, flaps landing, gear down) and resulting steady glide angle
{
  const f = new Flight({ oatC: 31 }); const ac = f.ac;
  const d = { wow: [0,0,0], load: [0,0,0] }; const tmp = new Float64Array(13);
  ac.thr = AC.idle; ac.deriv(ac.x, tmp, d);
  const W = AC.m * G0; out.idle_approach = { T_idle_N: +d.T.toFixed(0), D_N: +d.D.toFixed(0), glide_deg_est: +(Math.asin((d.D - d.T) / W) * RAD).toFixed(2), trim_thr: +f.trim.thr.toFixed(3) };
}
// 5) Engine torque rolling moment: present? Compute full-power shaft torque and compare with aileron authority at 95 kt and 70 kt.
{
  const Q = AC.P / (2000 * 2 * Math.PI / 60);
  const atm = atmosphere(FIELD.elev, 31 - (15 - 0.0065 * FIELD.elev));
  const res = { Q_full_Nm: +Q.toFixed(0), Q_full_lbft: +(Q / 1.35582).toFixed(0) };
  for (const kt of [70, 95, 130]) { const V = kt * KT; const qb = 0.5 * atm.rho * V * V; const La = qb * AC.S * AC.b * AC.Clda * AC.daMax; res['ratio_to_full_aileron_' + kt + 'kt'] = +(Q / La).toFixed(3); }
  out.torque = res;
}
console.log(JSON.stringify(out, null, 1));
