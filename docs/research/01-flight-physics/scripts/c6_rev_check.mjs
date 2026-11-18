// Review of sec-06: independent re-computation of derived numbers (run: node c6_rev_check.mjs)
import { readFileSync } from 'node:fs';
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, G0, atmosphere, FIELD } = M;
const LBF = 4.44822, IN = 0.0254;
const out = {};
// (a) rate-limiter describing function: numeric (many cycles, discard transient) vs analytic full-saturation formula
function rl(A, w, R, cyc = 40) { const N = 20000, Tp = 2 * Math.PI / w, h = Tp / N; let y = 0, a = 0, b = 0;
  for (let c = 0; c < cyc; c++) for (let i = 0; i < N; i++) { const t = i * h, u = A * Math.sin(w * t); y += Math.max(-R * h, Math.min(R * h, u - y)); if (c === cyc - 1) { a += y * Math.sin(w * t) * h; b += y * Math.cos(w * t) * h; } }
  a *= 2 / Tp; b *= 2 / Tp; return { gain: +(Math.hypot(a, b) / A).toFixed(4), phase_deg: +(Math.atan2(b, a) * RAD).toFixed(2) }; }
out.rateLimiterDF = [1.5, 2, 3].map((m) => { const A = 10, R = 70, w = R / A * m; const num = rl(A, w, R);
  const full = m >= Math.sqrt(1 + (Math.PI / 2) ** 2) ? { gain: +(4 / Math.PI / m).toFixed(4), phase_deg: +(-Math.acos(Math.PI / (2 * m)) * RAD).toFixed(2) } : null;
  const wEx = 70 / 22 * m; return { ratio: m, numeric40cyc: num, analyticFullSat: full, delay_s_A22: +((-num.phase_deg * DEG) / wEx).toFixed(3) }; });
// (b) auto-trim reference force for a ~3 s time constant: tau = FtrimRef / (K*|Cht|*rate)
const P = { eta: 0.9, Se: 1.1, ce: 0.3, G: 2.4, Cht: 0.0035 * RAD };
const qbAt = (kt, h = 300) => 0.5 * atmosphere(FIELD.elev + h, 0).rho * (kt * KT) ** 2;
const dFdTab = (kt) => P.G * P.eta * qbAt(kt) * P.Se * P.ce * P.Cht * DEG; // N per deg tab
out.autoTrim = { dF_per_tabdeg_N_95: +dFdTab(95).toFixed(2), dF_per_tabdeg_N_150: +dFdTab(150).toFixed(2),
  forceRate_lbf_s_95_at1dps: +(dFdTab(95) * 1 / LBF).toFixed(2), forceRate_lbf_s_150_at0p5dps: +(dFdTab(150) * 0.5 / LBF).toFixed(2),
  FtrimRef_for_tau3s_95_N: +(3 * dFdTab(95) * 1).toFixed(1), FtrimRef_for_tau3s_150_N: +(3 * dFdTab(150) * 0.5).toFixed(1) };
out.autoTrim.tau_s_with_11p1N = { k95: +(11.1 / (dFdTab(95) * 1)).toFixed(2), k150: +(11.1 / (dFdTab(150) * 0.5)).toFixed(2) };
out.autoTrim.tau_s_with_4p45N_ifProportional = { k95: +(4.45 / (dFdTab(95) * 1)).toFixed(2) };
// (c) stick force per unit stick travel vs speed (8.93 lbf/g fixed); find speed where >= 5 lbf/in (MIL-F-8785C 3.2.2.2.2 Cat A)
const W = AC.m * G0;
function perG(Vkt) { const V = Vkt * KT, qb = qbAt(Vkt), qh = (G0 / V) * AC.c / (2 * V), dCL = W / (qb * AC.S);
  const a11 = AC.CLa, a12 = AC.CLde, b1 = dCL - AC.CLq * qh, a21 = AC.Cma, a22 = AC.Cmde, b2 = -AC.Cmq * qh, det = a11 * a22 - a12 * a21;
  return (a11 * b2 - a21 * b1) / det; }
const lbPerIn = (kt) => 8.93 / ((Math.abs(perG(kt)) / P.G) / IN);
let v5 = 60; while (lbPerIn(v5) < 5 && v5 < 250) v5 += 0.5;
out.lbPerIn = { k95: +lbPerIn(95).toFixed(2), k110: +lbPerIn(110).toFixed(2), k120: +lbPerIn(120).toFixed(2), k150: +lbPerIn(150).toFixed(2), speed_kt_for_5lbf_per_in: v5 };
// (d) n_z in steady 3 deg descent: body-axis = cos(theta)cos(phi); L/W = cos(gamma)
out.nz = { theta_deg: +(1.76 - 3).toFixed(2), nz_body: +Math.cos((1.76 - 3) * DEG).toFixed(5), cosGamma: +Math.cos(3 * DEG).toFixed(5) };
// (e) misc unit checks
out.units = { W_lbf: +(AC.m * 2.20462).toFixed(0), W_over_140: +(AC.m * 2.20462 / 140).toFixed(1), astm_W14_N: +(AC.m / 14).toFixed(1), qFade_kt: +(Math.sqrt(2 * 400 / 1.225) / KT).toFixed(1),
  F05_N: +(267 * ((1 - 0.5) * ((0.5 - 0.08) / 0.92) + 0.5 * ((0.5 - 0.08) / 0.92) ** 3)).toFixed(1), Kc_full_aft_lbf: +(60 * 22 * DEG / LBF).toFixed(1) };
// (f) JSON extraction + schema check
const md = readFileSync(process.argv[2] || '../sec-06-controls.md', 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);
const refs = new Set([...md.matchAll(/^\d+\. \[(C\d+)\]/gm)].map((m) => m[1]));
const issues = []; let leaves = 0;
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'], SCOPES = ['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'];
function walk(o, path) { if (o && typeof o === 'object' && 'v' in o) { leaves++; const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every((x) => k.includes(x))) issues.push(`${path}: keys ${k}`);
    if (!SCOPES.includes(o.scope)) issues.push(`${path}: scope ${o.scope}`);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) issues.push(`${path}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') issues.push(`${path}: est`);
    for (const s of o.src) if (!refs.has(s)) issues.push(`${path}: src ${s} not in reference list`);
    return; }
  for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k); }
let parsed = 0; for (const b of blocks) { try { walk(JSON.parse(b), ''); parsed++; } catch (e) { issues.push('parse: ' + e.message); } }
out.json = { blocks: blocks.length, parsed, leaves, refs: refs.size, issues };
// (g) test IDs cited vs defined
const defined = new Set([...md.matchAll(/^\| (T-C-\d+) \|/gm)].map((m) => m[1]));
const cited = new Set([...md.matchAll(/T-C-\d+/g)].map((m) => m[0]));
out.testIds = { defined: defined.size, citedNotDefined: [...cited].filter((x) => !defined.has(x)) };
console.log(JSON.stringify(out, null, 1));
