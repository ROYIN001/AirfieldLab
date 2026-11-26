// jrev_spool.mjs — reviewer: independent re-implementation of the round-1 sec 5.5 spool model with หัวข้อ 3.6 per-class values.
// Euler step dt = 1/240 s for N2, exact first-order update for the fan/thrust lag (as in round-1 code listing).
const g0 = 9.80665, R = 287.05287;
const atm = (h, dT = 0) => { const Ts = 288.15 - 0.0065 * h, p = 101325 * (Ts / 288.15) ** (g0 / (R * 0.0065)), T = Ts + dT; return { T, d: p / 101325, a: Math.sqrt(1.4 * R * T) }; };
const BY = (M, d, B) => { const G = 0.0606 * B + 0.6337, A = -0.4327 * d * d + 1.3855 * d + 0.0472, Z = 0.9106 * d ** 3 - 1.7736 * d * d + 1.8697 * d, X = 0.1377 * d ** 3 - 0.4374 * d * d + 1.3003 * d;
  return A - 0.377 * (1 + B) / Math.sqrt((1 + 0.82 * B) * G) * Z * M + (0.23 + 0.19 * Math.sqrt(B)) * X * M * M; };
const C = { // F00, bpr, Tflat, bump, GI, FI, AI, Racc, Rdec, tauF, idle0
  '7B26': [116990, 5.1, 30, 0, 58, 61, 72, 18, 16, 0.25, 0.05], '5B6': [104530, 5.9, 45, 0, 59.4, 61, 69, 18, 16, 0.25, 0.05],
  '1A26': [120640, 11.1, 44, 0, 57, 59, 68, 18, 15, 0.30, 0.045], 'T772B': [316300, 5.0, 30, 0.054, 62.4, 64, 72, 17, 14, 0.40, 0.05] };
const k = 2, tau2 = 0.35, a = 6, idleM0 = 0.5, N2max = 100, dt = 1 / 240;
function sim(c, env, uFrom, uTo, T, probe) {
  const [F00, B, Tf, bump, GI, FI, AI, Racc, Rdec, tauF, idle0] = C[c];
  const oat = env.amb.T - 273.15, o = Math.max(0, oat - Tf), th = Math.min(1, 1 - 0.0065 * o + Math.min(bump, 0.0065 * o));
  const Fr = F00 * BY(Math.min(env.M, 0.45), env.amb.d, B) * th, Fi = F00 * env.amb.d * idle0 * Math.max(-0.2, 1 - env.M / idleM0);
  const floor = env.wow ? GI : (env.ai ? AI : FI), span = N2max - GI, dT = Math.min(1, env.amb.d * (1 + 0.2 * env.M ** 2) ** 3.5);
  let n2 = GI, F = 0;
  const step = u => { const cmd = Math.max(floor, GI + span * u ** (1 / k)), n = Math.min(1, Math.max(0, (n2 - GI) / span)), nn = Math.min(1, n + 0.1);
    const r = Math.min(Racc * dT / (1 + a * (1 - nn) ** 3), Math.max(-Rdec * dT, (cmd - n2) * dT / tau2)); n2 += r * dt;
    const phi = Math.min(1, Math.max(0, (n2 - GI) / span)) ** k, Fss = Fi + (Fr - Fi) * phi; F += (Fss - F) * (1 - Math.exp(-dt / tauF)); };
  for (let t = 0; t < 30; t += dt) step(uFrom);
  const res = { idle: F / Fr }; let t = 0;
  while (t < T) { step(uTo); t += dt; probe(t, F / Fr, res); }
  return res;
}
const up = (t, x, r) => { for (const s of [1, 2, 3, 8]) if (r['F' + s] === undefined && t >= s - 1e-9) r['F' + s] = x; if (r.t95 === undefined && x >= 0.95) r.t95 = t; };
const dn = (t, x, r) => { if (r.t10 === undefined && x <= 0.10) r.t10 = t; };
const f = (x, n = 2) => x === undefined ? 'n/a' : x.toFixed(n);
for (const c of Object.keys(C)) {
  const FI = sim(c, { amb: atm(0), M: 0, wow: false, ai: false }, 0, 1, 12, up);
  const GI = sim(c, { amb: atm(0), M: 0, wow: true }, 0, 1, 12, up);
  const AI = sim(c, { amb: atm(304.8), M: 0.2, wow: false, ai: true }, 0, 1, 12, up);
  const h = atm(152.4, 23), HOT = sim(c, { amb: h, M: 72 / h.a, wow: false, ai: true }, 0, 1, 12, up);
  const DN = sim(c, { amb: atm(0), M: 0, wow: false, ai: false }, 1, 0, 15, dn);
  console.log(`${c}: FI->95 ${f(FI.t95)} | GI->95 ${f(GI.t95)} F(1,2,3) ${f(GI.F1, 3)}/${f(GI.F2, 3)}/${f(GI.F3, 3)} | AI->95 ${f(AI.t95)} F1 ${f(AI.F1, 3)} F8 ${f(AI.F8, 3)} idle ${f(AI.idle, 3)} | VTBD hot AI->95 ${f(HOT.t95)} (M ${f(72 / h.a, 3)}) | TO->10% ${f(DN.t10)} | FI idle ${f(FI.idle, 3)}`);
}
// FlightGear N1SpoolUp table, dN1/dt = rate(N1) %/s (clamped below first row)
const tb = [[24, 1.1], [28, 2.9], [46, 9.7], [68, 15.4], [80, 19.6], [94, 21.4], [103, 23.6]];
const rt = n => { if (n <= 24) return 1.1; for (let i = 1; i < tb.length; i++) if (n <= tb[i][0]) return tb[i - 1][1] + (tb[i][1] - tb[i - 1][1]) * (n - tb[i - 1][0]) / (tb[i][0] - tb[i - 1][0]); return 23.6; };
for (const n0 of [18.9, 22.7]) { let n = n0, t = 0; const hit = {}; while (n < 86) { n += rt(n) * 1e-4; t += 1e-4; for (const L of [50, 80, 85]) if (hit[L] === undefined && n >= L) hit[L] = t; } console.log(`FG table from N1 ${n0}: t50 ${f(hit[50])} t80 ${f(hit[80])} t85 ${f(hit[85])} s`); }
