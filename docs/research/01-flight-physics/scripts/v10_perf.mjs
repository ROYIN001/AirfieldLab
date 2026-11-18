// v10_perf.mjs — performance tests on the CURRENT model: 1 kt/s stall, steady climb/glide trims, takeoff, landing distance
import { M } from 'test/harness.mjs';
import { f9, solve } from './v10_modes.mjs';
import { startTrimmed } from './v10_timeresp.mjs';
const { Aircraft, Flight, SCENARIOS, AC, DEG, RAD, KT, FT, G0, atmosphere } = M;
const dt = 1/240, clamp = (x, a, b) => Math.max(a, Math.min(b, x)), out = {};
// 1) stall: idle, wings level, 1 kt/s deceleration from ~1.35 Vs by pitch-attitude PI loop; stop at full-aft elevator + pitch break or 60 s
for (const [k, c] of [['flaps1_gear', { ias: 96, h: 3000*FT, flaps: 1, gear: 1, gammaDeg: 0 }], ['clean', { ias: 106, h: 3000*FT, flaps: 0, gear: 0, gammaDeg: 0 }]]) {
  const { ac, T } = startTrimmed(c); const a = ac.air; let thC = a.theta, deI = T.de, vmin = 1e9, clmax = 0, rec = {}, tSat = 0, t0 = ac.t;
  const ias0 = a.ias/KT; ac.cmd.thr = 0;
  while (ac.t - t0 < 70) {
    const tgt = ias0 - (ac.t - t0)*1.0, err = a.ias/KT - tgt;            // + = too fast -> raise nose
    thC += (0.25*DEG*err + 0.6*DEG)*dt;                                   // feed-forward 0.6 deg/s plus correction
    const e = thC - a.theta; deI = clamp(deI - 0.6*e*dt, -AC.deUp, AC.deDn);
    ac.cmd.de = clamp(deI - 2.0*e + 0.85*a.q, -AC.deUp, AC.deDn);
    ac.cmd.da = clamp(1.25*(0 - a.phi) - 0.28*a.p, -AC.daMax, AC.daMax); ac.cmd.dr = -1.6*a.beta;
    ac.step(dt);
    const nz = a.CL*a.qbar*AC.S/(AC.m*G0);
    if (a.CL > clmax) { clmax = a.CL; rec = { ias_CLmax: a.ias/KT, nz, alpha: a.alpha*RAD, t: ac.t - t0, rate: (ias0 - a.ias/KT)/(ac.t - t0) }; }
    vmin = Math.min(vmin, a.ias/KT);
    tSat = ac.de <= -AC.deUp + 1e-3 ? tSat + dt : 0;
    if ((tSat > 1 && a.q < -2*DEG) || a.alpha > 25*DEG) break;
  }
  out['stall_' + k] = { CLmax: clmax, ...rec, VSR_kt: rec.ias_CLmax/Math.sqrt(rec.nz), Vmin_kt: vmin, deAtEnd_deg: ac.de*RAD };
}
// generic steady trim with throttle fixed: unknowns alpha, de, gamma
function trimThr(ias, thr, flaps, gear, h) {
  const ac = new Aircraft(); ac.flaps = flaps; ac.gearPos = gear; ac.thr = thr; ac.adot = 0;
  const rho = atmosphere(M.FIELD.elev + h, 0).rho, V = ias*KT/Math.sqrt(rho/1.225);
  const res = (x) => { ac.de = x[1]; const [al, , g] = x; const fy = f9(ac, [V*Math.cos(al), 0, V*Math.sin(al), 0, 0, 0, 0, al + g, 0], h); return [fy[0], fy[2], fy[4]]; };
  let x = [3*DEG, -2*DEG, 0];
  for (let it = 0; it < 40; it++) { const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i])/1e-6; }
    const dx = solve(J, r0.map(v => -v)); x = x.map((v, i) => v + 0.7*dx[i]); if (Math.hypot(...dx) < 1e-11) break; }
  return { ias, V, alpha: x[0]*RAD, de: x[1]*RAD, gamma: x[2]*RAD, roc_fpm: V*Math.sin(x[2])/FT*60, LoverD: -1/Math.tan(x[2]) };
}
// 2) best-rate climb (full throttle, clean, gear up) near sea level and at 5000 ft
for (const [k, h] of [['SL', 30], ['5000ft', 5000*FT]]) {
  const rows = []; for (let v = 80; v <= 160; v += 2) rows.push(trimThr(v, 1, 0, 0, h));
  const best = rows.reduce((b, r) => r.roc_fpm > b.roc_fpm ? r : b), steep = rows.reduce((b, r) => r.gamma > b.gamma ? r : b);
  out['climb_' + k] = { Vy_kt: best.ias, ROCmax_fpm: best.roc_fpm, Vx_kt: steep.ias, gammaMax_deg: steep.gamma };
}
// 3) glide: idle (current model idle thrust is positive) and zero thrust, clean
for (const [k, thr] of [['idle', AC.idle], ['zeroThrust', 0]]) {
  const rows = []; for (let v = 80; v <= 150; v += 1) rows.push(trimThr(v, thr, 0, 0, 3000*FT));
  const best = rows.reduce((b, r) => r.LoverD > b.LoverD ? r : b);
  out['glide_' + k] = { Vbg_kt: best.ias, glideRatio: best.LoverD, sink_fpm: -best.roc_fpm };
}
// 4) takeoff: brakes on, full throttle 3 s, release; rotate at VR to 10 deg pitch at 3 deg/s; distance to 50 ft wheel height
for (const [k, fl, VR] of [['flaps0_VR82', 0, 82], ['flaps05_VR78', 0.5, 78]]) {
  const ac = new Aircraft(); ac.setParked(0, 0, 0); for (let i = 0; i < 240*5; i++) ac.step(dt);
  ac.cmd.flaps = ac.flaps = fl; ac.cmd.thr = 1; for (let i = 0; i < 240*3; i++) ac.step(dt);
  ac.cmd.brake = 0; const a = ac.air, n0 = ac.x[0], t0 = ac.t; let thC = null, deI = 0, lo = null, d50 = null;
  while (ac.t - t0 < 90 && d50 == null) {
    if (a.ias/KT >= VR) { if (thC == null) thC = a.theta; thC = Math.min(10*DEG, thC + 3*DEG*dt); const e = thC - a.theta; deI = clamp(deI - 0.6*e*dt, -AC.deUp, AC.deDn); ac.cmd.de = clamp(deI - 2.5*e + 0.85*a.q, -AC.deUp, AC.deDn); }
    else ac.cmd.de = 0;
    ac.cmd.dr = clamp(1.4*(a.psi - 0) + 0.6*a.r, -AC.drMax, AC.drMax); ac.cmd.steer = a.wow[0] ? clamp(-ac.cmd.dr/AC.drMax, -1, 1)*10*DEG : 0;
    ac.cmd.da = clamp(1.25*(0 - a.phi) - 0.28*a.p, -AC.daMax, AC.daMax);
    ac.step(dt);
    if (!lo && !a.onGround && a.ias/KT > 40) lo = { s: ac.x[0] - n0, t: ac.t - t0, ias: a.ias/KT };
    if (lo && a.hWheel >= 50*FT) d50 = { s: ac.x[0] - n0, t: ac.t - t0, ias: a.ias/KT };
  }
  out['takeoff_' + k] = { groundRoll_m: lo?.s, tLiftoff_s: lo?.t, V_LOF_kt: lo?.ias, dist50ft_m: d50?.s, V50_kt: d50?.ias };
}
// 5) landing from 50 ft: autoland, calm, 21R; as-is braking vs max braking after nose-wheel contact
for (const [k, maxBrake] of [['autoland_asIs', false], ['autoland_maxBrake', true]]) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5, oatC: 15 }); let s50 = null, tdS = null;
  if (maxBrake) { const up = f.ap.update.bind(f.ap); f.ap.update = (dt2) => { const c = up(dt2); if (f.ac.air.wow[0]) c.brake = 1; return c; }; }
  while (f.ac.t < 300 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (s50 == null && a.hWheel < 50*FT) s50 = { s: a.s, ias: a.ias/KT, vs: a.vs/FT*60 }; }
  out['landing_' + k] = { s50: s50.s, ias50: s50.ias, td_s: f.ev.td.s, vtd_kt: f.ev.td.ias, sinkTD_fpm: f.ev.td.vsFpm, stop_s: f.ev.stopS, air_m: f.ev.td.s - s50.s, ground_m: f.ev.stopS - f.ev.td.s, total_m: f.ev.stopS - s50.s };
}
console.log(JSON.stringify(out, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v, 1));
