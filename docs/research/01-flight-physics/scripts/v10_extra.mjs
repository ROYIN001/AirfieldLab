// v10_extra.mjs — Part 60-style performance snapshots on the CURRENT model: level accel/decel, idle descent, power change, delay
import { M } from 'test/harness.mjs';
import { startTrimmed } from './v10_timeresp.mjs';
const { AC, DEG, RAD, KT, FT } = M; const dt = 1/240, clamp = (x, a, b) => Math.max(a, Math.min(b, x)), out = {};
function altHold(ac, st) { const a = ac.air; const e = (st.h - a.h); st.thC = clamp(st.thC0 + 0.004*e - 0.02*a.vs, -10*DEG, 15*DEG);
  const eth = st.thC - a.theta; st.deI = clamp(st.deI - 0.6*eth*dt, -AC.deUp, AC.deDn); ac.cmd.de = clamp(st.deI - 2.0*eth + 0.85*a.q, -AC.deUp, AC.deDn);
  ac.cmd.da = clamp(1.25*(0 - a.phi) - 0.28*a.p, -AC.daMax, AC.daMax); ac.cmd.dr = -1.6*a.beta; }
// 1.d.2 level deceleration at idle 160 -> 110 kt; 1.d.1 level acceleration at full power 100 -> 150 kt (3000 ft, clean)
for (const [k, v0, v1, thr] of [['levelDecel_160to110_idle', 160, 110, 0], ['levelAccel_100to150_full', 100, 150, 1]]) {
  const { ac, T } = startTrimmed({ ias: v0, h: 3000*FT, flaps: 0, gear: 0, gammaDeg: 0 }); const st = { h: ac.air.h, thC0: ac.air.theta, deI: T.de, thC: 0 };
  ac.cmd.thr = thr; const t0 = ac.t; let tEnd = null, hdev = 0;
  while (ac.t - t0 < 200 && tEnd == null) { st.thC0 += (thr ? -1 : 1)*0; altHold(ac, st); st.thC0 += 0.002*(st.h - ac.air.h)*dt; ac.step(dt); hdev = Math.max(hdev, Math.abs(ac.air.h - st.h));
    if (thr ? ac.air.ias/KT >= v1 : ac.air.ias/KT <= v1) tEnd = ac.t - t0; }
  out[k] = { time_s: tEnd, maxAltDev_ft: hdev/FT };
}
// 2.c.1 power change dynamics: approach trim, throttle to max, controls fixed, response after 10 and 20 s
{ const { ac, T } = startTrimmed({ ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }); const a = ac.air, ias0 = a.ias/KT, h0 = a.h, th0 = a.theta*RAD; ac.cmd.thr = 1; const t0 = ac.t; const snap = {};
  while (ac.t - t0 < 20) { ac.step(dt); for (const ts of [5, 10, 20]) if (!snap[ts] && ac.t - t0 >= ts) snap[ts] = { dIAS_kt: a.ias/KT - ias0, dH_ft: (a.h - h0)/FT, dTheta_deg: a.theta*RAD - th0 }; }
  out.powerChange_approach = snap; }
// time from elevator command step to 50 % of peak pitch acceleration (model-only part of equivalent delay)
{ const { ac, T } = startTrimmed({ ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }); const qd = new Float64Array(13); let pk = 0, t50 = null; const hist = [];
  ac.cmd.de = T.de - 3*DEG; const t0 = ac.t;
  while (ac.t - t0 < 1) { ac.step(dt); ac.deriv(ac.x, qd); hist.push([ac.t - t0, qd[11]]); pk = Math.max(pk, qd[11]); }
  t50 = hist.find(([, v]) => v >= 0.5*pk)[0]; out.pitchAccelOnset = { t50_s: t50, peak_degs2: pk*RAD }; }
console.log(JSON.stringify(out, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v));
