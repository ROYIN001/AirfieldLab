// j_spool.mjs — spool-up / spool-down checks per engine class (topic 3.6).
// Model = round 1 section 5.5 (N2 first-order with N2-dependent accel limit, thrust ~ n^k, fan lag tauF),
// re-implemented here with per-class idle levels. Also simulates the FlightGear A320/A330 N1 spool table
// (open model, GPL-2.0, used only as a comparison number) and checks 14 CFR 33.73(b) / 25.119.
import { isa, lapseBY, ratedThrust, ENG, fmt } from './j_lib.mjs';
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const base = { k: 2, tau2: 0.35, Racc: 18, a: 6, Rdec: 16, altExp: 1, tauF: 0.25, idle0: 0.05, idleM0: 0.5, N2max: 100 };
export const SPOOL = {
  CFM56_7B26_class: { ...base, N2gi: 58, N2fi: 61, N2ai: 72 },                 // GI 58 (EEC notes), AI 72 (low end of 72-79 %)
  CFM56_5B6_class:  { ...base, N2gi: 59.4, N2fi: 61, N2ai: 69 },               // GI 59.4 (FlightGear idlen2), FI/AI est
  LEAP_1A26_class:  { ...base, N2gi: 57, N2fi: 59, N2ai: 68, Rdec: 15, tauF: 0.30, idle0: 0.045 }, // round 1 values
  TRENT_772B_class: { ...base, N2gi: 62.4, N2fi: 64, N2ai: 72, Racc: 17, Rdec: 14, tauF: 0.40, idle0: 0.05 }, // est
};
class Eng {
  constructor(E) { this.E = E; this.n2 = E.N2gi; this.F = 0; this.wowT = 0; }
  floor(env) { const E = this.E; if (env.wow && this.wowT > 4) return E.N2gi; return (env.flapsLanding || env.gearDown) ? E.N2ai : E.N2fi; }
  update(dt, env, u) {
    const E = this.E, span = E.N2max - E.N2gi; this.wowT = env.wow ? this.wowT + dt : 0;
    const cmd = Math.max(this.floor(env), E.N2gi + span * Math.pow(u, 1 / E.k));
    const n = clamp((this.n2 - E.N2gi) / span, 0, 1), nn = Math.min(1, n + 0.1);
    const d2 = Math.min(1, env.amb.delta * (1 + 0.2 * env.M * env.M) ** 3.5) ** E.altExp;
    const rate = clamp((cmd - this.n2) * d2 / E.tau2, -E.Rdec * d2, E.Racc * d2 / (1 + E.a * (1 - nn) ** 3));
    this.n2 += rate * dt;
    const phi = clamp((this.n2 - E.N2gi) / span, 0, 1) ** E.k;
    const Fr = ratedThrust(E, env.amb, env.M), Fi = E.F00 * env.amb.delta * E.idle0 * Math.max(-0.2, 1 - env.M / E.idleM0);
    const Fss = Fi + (Fr - Fi) * phi; this.F += (Fss - this.F) * (1 - Math.exp(-dt / E.tauF));
    return { Fr, Fi };
  }
}
const dt = 1 / 240;
function settle(e, env, u, T = 30) { for (let t = 0; t < T; t += dt) e.update(dt, env, u); }
function accel(E, env, uFrom = 0) {
  const e = new Eng(E); settle(e, env, uFrom); const Fr = ratedThrust(E, env.amb, env.M), F0 = e.F;
  let t = 0, t50 = null, t95 = null; const at = {};
  while (t < 12) { e.update(dt, env, 1); t += dt;
    for (const s of [1, 2, 3, 5, 8]) if (at[s] === undefined && t >= s) at[s] = e.F / Fr;
    if (t50 === null && e.F >= 0.5 * Fr) t50 = t; if (t95 === null && e.F >= 0.95 * Fr) t95 = t; }
  return { idleFrac: F0 / Fr, t50, t95, at };
}
function decel(E, env) {
  const e = new Eng(E); settle(e, env, 1); const Fr = ratedThrust(E, env.amb, env.M); let t = 0;
  while (e.F > 0.10 * Fr && t < 15) { e.update(dt, env, 0); t += dt; } return t;
}
const SL = { amb: isa(0), M: 0, wow: false };            // static SL, in-air logic (FI floor)
const GND = { amb: isa(0), M: 0, wow: true };            // on ground > 4 s (GI floor)
const APP = { amb: isa(1000 * 0.3048), M: 0.2, wow: false, gearDown: true }; // approach idle, 1,000 ft
const res = {};
for (const [k, S] of Object.entries(SPOOL)) {
  const E = { ...ENG[k], ...S };
  const r = { FI: accel(E, SL), GI: null, AI: accel(E, APP) };
  // ground idle run: start with wowT already > 4 s
  { const e = new Eng(E); for (let t = 0; t < 30; t += dt) e.update(dt, GND, 0); const Fr = ratedThrust(E, GND.amb, 0); let t = 0, t95 = null; const at = {};
    while (t < 12) { e.update(dt, GND, 1); t += dt; for (const s of [1, 2, 3]) if (at[s] === undefined && t >= s) at[s] = e.F / Fr; if (t95 === null && e.F >= 0.95 * Fr) t95 = t; }
    r.GI = { t95, at }; }
  r.TOto10 = decel(E, SL);
  res[k] = r;
  console.log(`${k}: FI->95% ${fmt(r.FI.t95, 2)} s (t50 ${fmt(r.FI.t50, 2)}); GI->95% ${fmt(r.GI.t95, 2)} s, F(1,2,3 s)/Fr ${[1, 2, 3].map(s => fmt(r.GI.at[s], 3)).join('/')}; ` +
    `AI(1000 ft,M0.2)->95% ${fmt(r.AI.t95, 2)} s, F(1 s) ${fmt(r.AI.at[1], 3)}, F(8 s) ${fmt(r.AI.at[8], 3)}; FI F(8 s) ${fmt(r.FI.at[8], 3)}; TO->10% ${fmt(r.TOto10, 2)} s; idle frac FI ${fmt(r.FI.idleFrac, 3)} AI ${fmt(r.AI.idleFrac, 3)}`);
}
// 25.119 style check at VTBD hot day: from AI at 500 ft, OAT 38 C (ISA+23), M 0.21: thrust fraction of rated at 8 s
for (const k of Object.keys(SPOOL)) {
  const E = { ...ENG[k], ...SPOOL[k] }; const amb = isa(500 * 0.3048, 23), M = 72 / amb.a; const r = accel(E, { amb, M, wow: false, gearDown: true });
  console.log(`VTBD hot ${k}: AI->95% ${fmt(r.t95, 2)} s, F(8 s)/Fr ${fmt(r.at[8], 3)}, Fr/F00 ${fmt(ratedThrust(E, amb, M) / E.F00, 3)}`);
}
// FlightGear spool table: dN1/dt = rate(N1) %/s (table lookup on N1, clamped at ends)
const tbl = [[24, 1.1], [28, 2.9], [46, 9.7], [68, 15.4], [80, 19.6], [94, 21.4], [103, 23.6]];
const rate = n => { if (n <= tbl[0][0]) return tbl[0][1]; for (let i = 1; i < tbl.length; i++) if (n <= tbl[i][0]) { const [x0, y0] = tbl[i - 1], [x1, y1] = tbl[i]; return y0 + (y1 - y0) * (n - x0) / (x1 - x0); } return tbl[tbl.length - 1][1]; };
for (const [name, n0] of [['FG A320 (idle N1 18.9)', 18.9], ['FG A330 Trent (idle N1 22.7)', 22.7]]) {
  let n = n0, t = 0; const hit = {}; while (t < 30 && n < 90) { n += rate(n) * 0.001; t += 0.001; for (const lv of [30, 50, 80, 85, 90]) if (hit[lv] === undefined && n >= lv) hit[lv] = t; }
  console.log(`${name}: t(N1=30/50/80/85/90 %) = ${[30, 50, 80, 85, 90].map(l => fmt(hit[l] ?? NaN, 2)).join(' / ')} s`);
}
