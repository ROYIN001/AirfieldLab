// Section 5: spool-up model, tuning and comparison (proposed TurbofanEngine core vs JSBSim/YASim/current AirfieldLab)
import { M } from 'test/harness.mjs';
const { atmosphere, FT, Aircraft, AC } = M;
const P0 = 101325;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const deltaT = (hft, Mach) => atmosphere(hft * FT).p / P0 * (1 + 0.2 * Mach * Mach) ** 3.5;
// ---- proposed core model: N2 first-order + N2-dependent accel limit + fixed decel limit; thrust = idle + (1-idle)*n^k; fan lag tauF
export function makeEngine(p) {
  return { n2: p.N2gi, Fn: 0, p };
}
export function stepEngine(e, dt, cmd, env) { // cmd: demanded thrust fraction 0..1 ; env: {hft, Mach, floorN2}
  const p = e.p, span = p.N2max - p.N2gi;
  const floor = env.floorN2 ?? p.N2gi;
  const n2cmd = Math.max(floor, p.N2gi + span * Math.pow(clamp(cmd, 0, 1), 1 / p.k));
  const n = clamp((e.n2 - p.N2gi) / span, 0, 1), nn = Math.min(1, n + 0.1);
  const altf = Math.pow(Math.min(1, deltaT(env.hft || 0, env.Mach || 0)), p.altExp);
  const Racc = p.Racc0 * altf / (1 + p.a * (1 - nn) ** 3);
  const Rdec = p.Rdec0 * altf;
  e.n2 += clamp((n2cmd - e.n2) * altf / p.tau, -Rdec, Racc) * dt;
  const nNew = clamp((e.n2 - p.N2gi) / span, 0, 1);
  const Fss = p.idleFrac + (1 - p.idleFrac) * Math.pow(nNew, p.k);    // fraction of rated (local max) thrust
  e.Fn += (Fss - e.Fn) * (1 - Math.exp(-dt / p.tauF));
  return e.Fn;
}
function settle(e, cmd, env, T = 30, dt = 1 / 240) { for (let t = 0; t < T; t += dt) stepEngine(e, dt, cmd, env); return e; }
function stepResp(p, fromCmd, toCmd, env, opts = {}) { // returns times to reach given levels of the transition and of rated
  const dt = 1 / 240; const e = makeEngine(p); settle(e, fromCmd, env); const F0 = e.Fn;
  const Fend = (() => { const e2 = makeEngine(p); settle(e2, toCmd, env, 60); return e2.Fn; })();
  const res = { F0: +F0.toFixed(4), Fend: +Fend.toFixed(4) }; const marks = { t10: 0.1, t50: 0.5, t90: 0.9, t98: 0.98 };
  const abs = opts.abs || [0.95];
  let t = 0; const hit = {};
  while (t < 40) { stepEngine(e, dt, toCmd, env); t += dt;
    const frac = (e.Fn - F0) / (Fend - F0);
    for (const [k, v] of Object.entries(marks)) if (hit[k] == null && frac >= v) hit[k] = t;
    for (const a of abs) { const k = 'tAbs' + a; if (hit[k] == null && ((toCmd > fromCmd && e.Fn >= a) || (toCmd < fromCmd && e.Fn <= a))) hit[k] = t; }
    if (opts.at) for (const ta of opts.at) if (Math.abs(t - ta) < dt / 2) hit['F@' + ta] = +e.Fn.toFixed(3);
  }
  for (const k in hit) if (typeof hit[k] === 'number' && !k.startsWith('F@')) hit[k] = +hit[k].toFixed(2);
  return { ...res, ...hit };
}
// Parameter set (ค่าประมาณ, tuned to targets below)
export const CORE = {
  CFM56_7B: { N2gi: 59, N2fi: 61, N2ai: 69, N2max: 100, k: 2, idleFrac: 0.05, tau: 0.35, Racc0: 18, a: 6, Rdec0: 16, altExp: 1.0, tauF: 0.25 },
  LEAP_1A:  { N2gi: 57, N2fi: 59, N2ai: 68, N2max: 100, k: 2, idleFrac: 0.045, tau: 0.35, Racc0: 18, a: 6, Rdec0: 15, altExp: 1.0, tauF: 0.30 },
};
const out = {};
for (const [name, p] of Object.entries(CORE)) {
  const span = p.N2max - p.N2gi, fracAt = (n2) => +(p.idleFrac + (1 - p.idleFrac) * ((n2 - p.N2gi) / span) ** p.k).toFixed(4);
  const SLS = { hft: 0, Mach: 0 };
  out[name] = {
    thrustAt: { GI: fracAt(p.N2gi), FI: fracAt(p.N2fi), AI: fracAt(p.N2ai) },
    GI_to_TO_SLS: stepResp(p, 0, 1, SLS, { at: [1, 2, 3, 5, 8] }),
    FI_to_TO_SLS_33_73b: stepResp(p, 0, 1, { ...SLS, floorN2: p.N2fi }, { at: [5] }),
    AI_to_GA_1000ft_M02: stepResp(p, 0, 1, { hft: 1000, Mach: 0.2, floorN2: p.N2ai }, { at: [2, 3, 5, 8] }),
    from40_to_TO_SLS: stepResp(p, 0.40, 1, SLS),
    from30_to_TO_SLS: stepResp(p, 0.30, 1, SLS),
    TO_to_idle_SLS: stepResp(p, 1, 0, SLS, { abs: [0.10] }),
    from40_to_TO_10kft_M025: stepResp(p, 0.40, 1, { hft: 10000, Mach: 0.25 }),
    from40_to_TO_25kft_M062: stepResp(p, 0.40, 1, { hft: 25000, Mach: 0.62 }),
    from40_to_TO_42kft_M084: stepResp(p, 0.40, 1, { hft: 42000, Mach: 0.84 }),
  };
  const r = out[name]; const base = r.from40_to_TO_SLS.t90 - r.from40_to_TO_SLS.t10;
  out[name].riseRatio = { '10k': +((r.from40_to_TO_10kft_M025.t90 - r.from40_to_TO_10kft_M025.t10) / base).toFixed(2), '25k': +((r.from40_to_TO_25kft_M062.t90 - r.from40_to_TO_25kft_M062.t10) / base).toFixed(2), '42k': +((r.from40_to_TO_42kft_M084.t90 - r.from40_to_TO_42kft_M084.t10) / base).toFixed(2), NASA: { '10k': +(1.25 / 1.13).toFixed(2), '25k': +(1.95 / 1.13).toFixed(2), '42k': +(3.66 / 1.13).toFixed(2) } };
}
// ---- JSBSim FGTurbine law (LGPL-2.1, cited): N2 seek rate = (90/(BPR+3))/(1+3(1-n)^3+(1-sigma)) %/s, n=min(1,N2norm+0.1); thrust = idle + (mil-idle)*N2norm^2
function jsbsimTimes(bpr, idleN2 = 60, idleT = 0.0436) {
  const dt = 1 / 120; let N2 = idleN2, t = 0, hit = {}; const rate0 = 90 / (bpr + 3);
  while (t < 60) { const N2n = (N2 - idleN2) / (100 - idleN2); const n = Math.min(1, N2n + 0.1); const r = rate0 / (1 + 3 * (1 - n) ** 3 + 0);
    N2 = Math.min(100, N2 + r * dt); t += dt; const n2 = (N2 - idleN2) / (100 - idleN2); const F = idleT + (1 - idleT) * n2 * n2;
    for (const a of [0.5, 0.9, 0.95]) if (hit['t' + a] == null && F >= a) hit['t' + a] = +t.toFixed(2); }
  return hit;
}
out.JSBSim_FGTurbine = { 'BPR5.1': jsbsimTimes(5.1), 'BPR5.9': jsbsimTimes(5.9), 'BPR11.1': jsbsimTimes(11.1) };
// ---- YASim Jet (GPL-2.0, cited): implicit first-order on N2 then N1 with decay = 1.5*2.3/spoolTime, thrust ~ betaN1 (linear in N1)
function yasim(spool = 4) { const dec = 1.5 * 2.3 / spool, dt = 1 / 120; let n2 = 0, n1 = 0, t = 0, hit = {};
  while (t < 30) { n2 = (n2 + dt * dec * 1) / (1 + dt * dec); n1 = (n1 + dt * dec * n2) / (1 + dt * dec); t += dt; for (const a of [0.5, 0.9, 0.95]) if (hit['t' + a] == null && n1 >= a) hit['t' + a] = +t.toFixed(2); }
  return hit; }
out.YASim_Jet_spool4 = yasim(4);
// ---- current AirfieldLab: thr lag tau=1 s from idle 0.045 (src/20-flight.js:248), thrust = thr*thrustAvail(V)
{ const ac = new Aircraft(); ac.thr = AC.idle; ac.cmd.thr = 1; let t = 0; const hit = {}; const dt = 1 / 240;
  while (t < 10) { ac.actuators(dt); t += dt; for (const a of [0.5, 0.9, 0.95]) if (hit['t' + a] == null && ac.thr >= a) hit['t' + a] = +t.toFixed(2); }
  // decel
  ac.thr = 1; ac.cmd.thr = 0; t = 0; while (t < 10) { ac.actuators(dt); t += dt; if (hit.tdown10 == null && ac.thr <= 0.10) hit.tdown10 = +t.toFixed(2); }
  out.AirfieldLab_current = hit; }
if (!process.env.QUIET) console.log(JSON.stringify(out, null, 1));
export { stepResp };
