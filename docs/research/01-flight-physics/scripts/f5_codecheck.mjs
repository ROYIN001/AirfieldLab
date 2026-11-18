// Section 5: extract the JS block of 5.9 from the section file and exercise it (FI->95%, AI GA, reverse interlock, cancel speed)
import fs from 'fs';
import { M } from 'test/harness.mjs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const code = md.split('```js')[1].split('```')[0];
const { atmosphere, KT, FT } = M; const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const mod = new Function('atmosphere', 'KT', 'clamp', code + '; return { lapseBY, ratedThrust, TurbofanEngine };')(atmosphere, KT, clamp);
const E = { F00: 121400, bpr: 5.1, kT: 0.0075, TflatC: 30, N2gi: 59, N2fi: 61, N2ai: 69, N2max: 100, k: 2, tau2: 0.35, Racc: 18, a: 6, Rdec: 16, altExp: 1,
  tauF: 0.25, idle0: 0.05, idleM0: 0.5, revDeploy: 2, revStow: 2.5, vCancel: 60, revUmax: 0.7, revC0: 0.3, revC1: 1.0, revIdle: 0.1, N1gi: 20, N1max: 100 };
const amb0 = atmosphere(0), dt = 1 / 240;
function run(env, cmd, T, eng) { for (let t = 0; t < T; t += dt) eng.update(dt, env, cmd); return eng; }
const out = {};
// FI -> TO static SL (in air logic: wow false, no flaps): settle at idle then full
{ const e = new mod.TurbofanEngine(E); const env = { amb: amb0, M: 0, V: 0, wow: false };
  run(env, { u: 0 }, 20, e); const F0 = e.F; let t = 0; const Fr = mod.ratedThrust(E, amb0, 0);
  while (e.F < 0.95 * Fr && t < 20) { e.update(dt, env, { u: 1 }); t += dt; } out.FI_to_95_s = +t.toFixed(2); out.FI_idle_frac = +(F0 / Fr).toFixed(3); out.N1_at_end = +e.N1.toFixed(1); }
// AI -> GA at 1000 ft M0.2 with gear down
{ const amb = atmosphere(1000 * FT); const e = new mod.TurbofanEngine(E); const env = { amb, M: 0.2, V: 0.2 * 340, wow: false, gearDown: true };
  run(env, { u: 0 }, 20, e); const Fr = mod.ratedThrust(E, amb, 0.2); let t = 0;
  while (e.F < 0.95 * Fr && t < 20) { e.update(dt, env, { u: 1 }); t += dt; } out.AI_to_95_s = +t.toFixed(2); }
// reverse in the air: must stay stowed
{ const e = new mod.TurbofanEngine(E); const env = { amb: amb0, M: 0.2, V: 130 * KT, wow: false }; run(env, { u: 0, rev: true, r: 1 }, 5, e); out.rev_in_air_s = e.s; out.F_air = Math.round(e.F); }
// reverse on ground at 130 kt held: deploy, then max reverse
{ const e = new mod.TurbofanEngine(E); const env = { amb: amb0, M: 0.2, V: 130 * KT, wow: true }; run(env, { u: 0 }, 6, e);
  let t = 0, tDep = null; while (t < 12) { e.update(dt, env, { u: 0, rev: true, r: 1 }); t += dt; if (tDep == null && e.s >= 0.9) tDep = t; }
  out.rev_s90_s = +tDep.toFixed(2); out.Frev_130kt_overF00 = +(e.F / E.F00).toFixed(3);
  env.V = 55 * KT; env.M = 55 * KT / 340; run(env, { u: 0, rev: true, r: 1 }, 6, e); out.Frev_55kt_overF00_afterCancel = +(e.F / E.F00).toFixed(3);
  run(env, { u: 0.8, rev: false }, 1.0, e); out.forward_locked_while_stowing = Math.round(e.F) <= 0; }
out.Theta_VTBD_35C = +(1 - E.kT * Math.max(0, 35 - E.TflatC)).toFixed(4);
console.log(JSON.stringify(out));
