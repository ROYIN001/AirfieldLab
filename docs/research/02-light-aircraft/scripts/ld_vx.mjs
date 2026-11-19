#!/usr/bin/env node
// ld_vx.mjs — Vx (speed of the steepest climb = maximum excess thrust) for the DA40 cards (05-da40.md §05.3, gap 7).
// The DA 40 AFMs publish no Vx: only a climb speed after take-off with flaps T/O and a cruise-climb speed with flaps UP
// (14 CFR 23.1585(d)(1) and 23.1587(a)(2), (b) ask for the take-off climb procedure and its rate/gradient and the
// balked-landing angle, not for a best-angle speed [LD17]). Three looks, SL ISA, full power, flaps UP, wings level:
//  A) card model: thrust from the card's propeller tables (propeller.tables.CT/CP, BEM of 01-methods) with the governor
//     holding propeller.engineInterface.rpmGoverned at propeller.engineInterface.maxShaftPower; drag = CD0 + K CL² with
//     K = 1/(π e AR) and CD0 calibrated so that the maximum ROC at the brochure mass equals the brochure ROC
//     (performance.ROC_SL_fpm); e = 0.65 / 0.75 / 0.85 (0.75 = lm_derivs, §05.6). Result: the climb angle keeps rising
//     down to the stall, so the model optimum lies at the low-speed limit and does not fix Vx by itself.
//  C) class rule used for the card value: Vx(CAS) = k · VS1(CAS), k = mean of the published POH ratios of the
//     single-engine cards of this round (c172s, c172r, c152, read from their cards at run time; ≈ 1.19).
//  B) current model: today's sim with the card (lm_card buildAC + trimThr), sweep 0.25 kt from 1.03 VS1, full throttle,
//     flaps UP — the "current model" column of T-LD-38…40.
// Speeds are KCAS (= KEAS at SL); KIAS through the card's speeds.ias_cas UP row.
// It also computes the class value of speeds.stall_altitude_loss_ft (gap 18), see the end of the file.
//   node <this folder>/ld_vx.mjs   → scripts/out/ld_vx.json (run from the repo root, or set AIRFIELDLAB_ROOT)
import fs from 'node:fs';
import { loadType, val, trainingMassKg, iasCas } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, trimThr } from './lm_card.mjs';
const OUT = new URL('./out/', import.meta.url);
const KT = 0.514444, G0 = 9.80665, RHO = 1.225, FPM = 196.8504;
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;

/** bilinear interpolation in a {axes:{beta75_deg, J}, data[beta][J]} table, clamped at the edges */
function tab2(t, beta, J) {
  const B = t.axes.beta75_deg, Js = t.axes.J, cl = (x, a) => Math.max(a[0], Math.min(a[a.length - 1], x));
  const b = cl(beta, B), j = cl(J, Js);
  let i = 0; while (i < B.length - 2 && b > B[i + 1]) i++;
  let k = 0; while (k < Js.length - 2 && j > Js[k + 1]) k++;
  const u = (b - B[i]) / (B[i + 1] - B[i]), v = (j - Js[k]) / (Js[k + 1] - Js[k]);
  const d = t.data;
  return (1 - u) * (1 - v) * d[i][k] + u * (1 - v) * d[i + 1][k] + (1 - u) * v * d[i][k + 1] + u * v * d[i + 1][k + 1];
}
/** governed constant-speed propeller: thrust (N) at V (m/s) for shaft power P (W) at n (rev/s) */
function thrustCS(card, V) {
  const CT = val(card, 'propeller.tables.CT'), CP = val(card, 'propeller.tables.CP');
  const D = val(card, 'propeller.identity.diameter'), n = val(card, 'propeller.engineInterface.rpmGoverned') / 60;
  const P = val(card, 'propeller.engineInterface.maxShaftPower') * 1000, J = V / (n * D);
  const cpNeed = P / (RHO * n ** 3 * D ** 5);
  let lo = CP.axes.beta75_deg[0], hi = CP.axes.beta75_deg.at(-1);
  if (tab2(CP, hi, J) < cpNeed) return { T: tab2(CT, hi, J) * RHO * n * n * D ** 4, beta: hi, J, capped: true };
  for (let it = 0; it < 60; it++) { const m = (lo + hi) / 2; if (tab2(CP, m, J) < cpNeed) lo = m; else hi = m; }
  const beta = (lo + hi) / 2;
  return { T: tab2(CT, beta, J) * RHO * n * n * D ** 4, beta, J, capped: false };
}
/** steady climb sweep with the card model: returns {Vx, Vy, gmax_deg, rocmax_fpm} in KCAS (SL) */
function sweepA(card, mass, CD0, K) {
  const S = val(card, 'aero.ref.S'), W = mass * G0;
  let best = { g: -1 }, bestR = { roc: -1e9 };
  for (let V = 22; V <= 60; V += 0.02) {
    const q = 0.5 * RHO * V * V, T = thrustCS(card, V).T;
    let g = 0;
    for (let it = 0; it < 6; it++) { const CL = W * Math.cos(g) / (q * S), Dr = q * S * (CD0 + K * CL * CL); g = Math.asin(Math.max(-1, Math.min(1, (T - Dr) / W))); }
    if (g > best.g) best = { g, V };
    const roc = V * Math.sin(g); if (roc > bestR.roc) bestR = { roc, V };
  }
  return { Vx: best.V / KT, gmax_deg: best.g * 180 / Math.PI, Vy: bestR.V / KT, rocmax_fpm: bestR.roc * FPM };
}
function calibrateCD0(card, mass, K, rocTarget) {
  let lo = 0.01, hi = 0.12;
  for (let it = 0; it < 50; it++) { const m = (lo + hi) / 2; if (sweepA(card, mass, m, K).rocmax_fpm > rocTarget) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

const IDS = [
  { id: 'da40ng', mtow: 1310, vs1: { kias: 66, mass: 1310 }, vsTO: 62, climbTO: { kias: 72, note: 'ไต่หลังวิ่งขึ้น/Vy แฟลป T/O ทุกมวล [LD3]' } },
  { id: 'da40_180', mtow: 1200, vs1: { kias: 53, mass: 1200 }, vsTO: 52, climbTO: { kias: 67, note: 'ไต่หลังวิ่งขึ้นแฟลป T/O 1,200 kg [LD6 p.5-13]' } },
  { id: 'da40d', mtow: 1150, vs1: { kias: 52, mass: 1150 }, vsTO: 51, climbTO: { kias: 66, note: 'ไต่หลังวิ่งขึ้นแฟลป T/O 1,150 kg [LD6 p.5-13][LD8]' } },
];
const ES = [0.65, 0.75, 0.85];
// C) class ratio from the POH values stored in the single-engine cards of this round (speeds.VX_kt, speeds.VS1_kt)
const CLASS = {};
for (const id of ['c172s', 'c172r', 'c152']) {
  try {
    const c = loadType(id), t = iasCas(c, '0'), lx = c.speeds?.VX_kt, ls = c.speeds?.VS1_kt;
    const cas = l => (/CAS/.test(l.u) ? l.v : t.f(l.v));
    CLASS[id] = { VX: lx.v, VX_u: lx.u, VS1: ls.v, VS1_u: ls.u, ratio: r(cas(lx) / cas(ls), 3) };
  } catch (e) { CLASS[id] = { error: String(e.message || e) }; }
}
const ks = Object.values(CLASS).map(x => x.ratio).filter(Number.isFinite);
const K_CLASS = ks.length ? ks.reduce((a, b) => a + b, 0) / ks.length : 1.19;
console.log('class Vx/VS1 (CAS):', JSON.stringify(CLASS), '→ k', r(K_CLASS, 3));
const M = await loadSim();
const out = { date: new Date().toISOString().slice(0, 10), method: 'A: CT/CP card tables + calibrated polar (shape only); C: Vx = k·VS1 (class, card value); B: sim sweep (lm_card)', class: CLASS, k: r(K_CLASS, 3), ids: {} };
for (const x of IDS) {
  const card = loadType(x.id), AR = val(card, 'airframe.wing.AR'), roc = val(card, 'performance.ROC_SL_fpm');
  const tmKg = trainingMassKg(card), up = iasCas(card, 'UP');
  const vs1cas = m => up.f(x.vs1.kias) * Math.sqrt(m / x.vs1.mass);
  // A) card model shape: gamma at 1.1 / k / 1.3 VS1 and the unconstrained optimum
  const A = {};
  for (const e of ES) {
    const K = 1 / (Math.PI * e * AR), CD0 = calibrateCD0(card, x.mtow, K, roc), sw = sweepA(card, x.mtow, CD0, K);
    const gAt = f => { const S = val(card, 'aero.ref.S'), W = x.mtow * G0, V = f * vs1cas(x.mtow) * KT, q = 0.5 * RHO * V * V, T = thrustCS(card, V).T; let g = 0; for (let it = 0; it < 6; it++) { const CL = W * Math.cos(g) / (q * S); g = Math.asin((T - q * S * (CD0 + K * CL * CL)) / W); } return r(g * 180 / Math.PI, 2); };
    A[e] = { K: r(K, 4), CD0: r(CD0, 4), opt: { Vx: r(sw.Vx), Vy: r(sw.Vy), gmax_deg: r(sw.gmax_deg, 2) }, gamma_deg: { '1.1VS1': gAt(1.1), 'k·VS1': gAt(K_CLASS), '1.3VS1': gAt(1.3) } };
  }
  // C) card value
  const C = { mtow: { VS1_kcas: r(vs1cas(x.mtow)), Vx_kcas: r(K_CLASS * vs1cas(x.mtow)), Vx_kias: Math.round(up.inv(K_CLASS * vs1cas(x.mtow))) },
    train: { mass: tmKg, VS1_kcas: r(vs1cas(tmKg)), Vx_kcas: r(K_CLASS * vs1cas(tmKg)), Vx_kias: Math.round(up.inv(K_CLASS * vs1cas(tmKg))) } };
  // B) the sim with the card, fine sweep (flaps UP, gear fixed down, SL h 30 m as in lm_card.climbSweep)
  const B = {};
  for (const [k, m] of [['mtow', x.mtow], ['train', tmKg]]) {
    const ac = buildAC(card, { mass: m }), restore = applyAC(M, ac);
    try {
      let best = { g: -9 }, bestR = { roc: -1e9 };
      const v0 = Math.ceil(1.03 * vs1cas(m) * 4) / 4;
      for (let v = v0; v <= v0 + 30; v += 0.25) { const t = trimThr(M, v, 1, 0, 1, 30); if (t.gamma > best.g) best = { g: t.gamma, v }; if (t.roc_fpm > bestR.roc) bestR = { roc: t.roc_fpm, v }; }
      B[k] = { mass: m, v0, Vx: best.v, gmax_deg: r(best.g, 2), Vy: bestR.v, rocmax_fpm: Math.round(bestR.roc), Vx_kias: r(up.inv(best.v)) };
    } finally { restore(); }
  }
  // check of the rule on the AFM's own climb speed with flaps T/O (same mass as the VS(T/O) row): k · VS(T/O) in CAS
  const to = iasCas(card, 'T/O'), chk = { afm_kias: x.climbTO.kias, afm_kcas: r(to.f(x.climbTO.kias)), rule_kcas: r(K_CLASS * to.f(x.vsTO)), VS_TO_kias: x.vsTO };
  out.ids[x.id] = { mtow: x.mtow, train_kg: tmKg, roc_ref_fpm: roc, AR, climbTO: { ...x.climbTO, check: chk }, A, C, B };
  console.log(`   check flaps T/O: AFM climb ${chk.afm_kias} KIAS = ${chk.afm_kcas} KCAS vs k·VS(T/O) ${chk.rule_kcas} KCAS`);
  console.log(`${x.id}: MTOM ${x.mtow} kg VS1 ${C.mtow.VS1_kcas} KCAS → Vx ${C.mtow.Vx_kcas} KCAS = ${C.mtow.Vx_kias} KIAS; training ${tmKg} kg → ${C.train.Vx_kcas} KCAS = ${C.train.Vx_kias} KIAS | sim Vx ${B.mtow.Vx} / ${B.train.Vx} KCAS (Vy ${B.mtow.Vy} / ${B.train.Vy}) | A opt Vx ${ES.map(e => A[e].opt.Vx).join('/')} γ(1.1/k/1.3 VS1, e .75) ${Object.values(A[0.75].gamma_deg).join('/')}°`);
}
// speeds.stall_altitude_loss_ft (gap 18): the DA40 AFM copies that can be read give no altitude loss for a stall
// recovery, so the card uses a class value: POH/AFM altitude loss of three cards of this round divided by VS1² (KCAS,
// energy-like scaling Δh ∝ VS1²), mean coefficient × the DA40 VS1² at training mass, rounded to 10 ft (ค่าประมาณ).
const AL = {};
for (const id of ['c172s', 'c152', 'p2006t']) {
  try {
    const c = loadType(id), t = iasCas(c, '0'), ls = c.speeds?.VS1_kt, la = c.speeds?.stall_altitude_loss_ft;
    const vs = /CAS/.test(ls.u) ? ls.v : t.f(ls.v);
    AL[id] = { loss_ft: la.v, src: la.src, VS1_kcas: r(vs, 1), coef: +(la.v / vs ** 2).toFixed(4) };
  } catch (e) { AL[id] = { error: String(e.message || e) }; }
}
const cs = Object.values(AL).map(x => x.coef).filter(Number.isFinite), cMean = cs.reduce((a, b) => a + b, 0) / cs.length;
out.stall_alt_loss = { class: AL, coef_mean: +cMean.toFixed(4), coef_min: Math.min(...cs), coef_max: Math.max(...cs), ids: {} };
for (const x of IDS) {
  const o = out.ids[x.id], vs = o.C.train.VS1_kcas;
  out.stall_alt_loss.ids[x.id] = { mass: o.train_kg, VS1_kcas: vs, loss_ft: Math.round(cMean * vs * vs / 10) * 10, min_ft: Math.round(Math.min(...cs) * vs * vs / 10) * 10, max_ft: Math.round(Math.max(...cs) * vs * vs / 10) * 10 };
}
console.log('stall altitude loss (class):', JSON.stringify(out.stall_alt_loss));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL('ld_vx.json', OUT), JSON.stringify(out, null, 1));
console.log('wrote scripts/out/ld_vx.json');
