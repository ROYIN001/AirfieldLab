#!/usr/bin/env node
// lh_attitude.mjs — AirfieldLab research round 2, topic 08 (LH): pitch-attitude estimates per flight phase.
// ค่าประมาณ: theta = alpha_body + gamma, alpha_body = (CL_req - CL0[flap]) / CLalpha, CL_req = n m g cos(gamma) / (q S),
// q = 0.5 rho V_CAS^2 (sea level ISA, rho 1.225 -> TAS = CAS). Thrust-line lift, elevator trim lift and downwash lag ignored.
// Touchdown / flare (gap 8, 19 Nov 2026): CL_req at 1.05 V_S0 of the training mass (CL = CLmax_LDG / 1.05^2) in ground
// effect, round-1 model 01-flight-physics §2.4 [R1:U7]: sigma = exp(-2.48 (2h/b)^0.768) with h = height of the MAC
// quarter-chord above the runway when the main wheels touch, and CL_w = CL_OGE(alpha) / (1 - sigma CLa_w / (pi A)).
// Inputs (19 Nov 2026, gap 9): every number comes from the data cards through lm_lib.loadType (aero.ref.S/b,
// aero.static_long.CL0/CLalpha/CLmax_target, speeds.ias_cas, airframe.weights.training_mass, interference.groundEffect,
// gear.geometry.main_contact_body_extended), so c152 uses its own card (no longer the c172s values). Speeds per phase
// come from the operating sources [LH..] (rows in PHASES); the final-approach speed of every type is the card's
// speeds.VAPP_kt (decision D1). Output: scripts/out/lh_attitude.json and a table on stdout. Pure Node >= 18.
//   node lh_attitude.mjs            (run from anywhere; writes next to this script in out/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, mergeDir, val, leaf, isObj, trainingMassKg } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const G0 = 9.80665, RHO0 = 1.225, KT = 0.514444, FPM = 0.00508, DEG = Math.PI / 180, FT = 0.3048;

// ---- card-driven aero (gap 9) ----
export const CARD_IDS = ['c172s', 'c172r', 'c152', 'da40ng', 'da40_180', 'da40d', 'da42ng', 'da42_tae125', 'da42_vi',
  't6a', 't6c', 'pc9m', 'pc7mk2', 'p2006t'];
let _merged = null;
const merged = () => (_merged ??= mergeDir(path.join(HERE, '..'), { checks: false, bases: false }).merged);
export const card = id => loadType(id, { merged: merged() });

const lin = (tab, x) => {                       // piecewise-linear inside the table; outside it the IAS-CAS offset of the end row is held
  if (!tab || tab.length < 2) return x;
  if (x <= tab[0][0]) return x + (tab[0][1] - tab[0][0]);
  if (x >= tab[tab.length - 1][0]) { const [xe, ye] = tab[tab.length - 1]; return x + (ye - xe); }
  let i = 0; while (i < tab.length - 2 && x > tab[i + 1][0]) i++;
  const [x0, y0] = tab[i], [x1, y1] = tab[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
};
/** type object from a card: {S, b, A, CLa, CLaW, CL0{det}, CLmax{det}, mass, dets[{name,deg}], ias2cas(det,kt), cas2ias(det,kt), landFlap, ge{xm,zm,xmac,zmac}} */
export function typeFromCard(id, c = card(id)) {
  const dets = (val(c, 'aero.flaps.detents') || []).map(d => ({ name: String(d.name), deg: +d.flap_deg })).sort((a, b) => a.deg - b.deg);
  const S = val(c, 'aero.ref.S'), b = val(c, 'aero.ref.b'), CLa = val(c, 'aero.static_long.CLalpha');
  const CL0 = val(c, 'aero.static_long.CL0'), CLmax = val(c, 'aero.static_long.CLmax_target');
  const tab = val(c, 'speeds.ias_cas');
  const tabFor = det => {                       // IAS->CAS rows for a detent; nearest detent by flap angle when absent
    if (!isObj(tab)) return null;
    const keys = Object.keys(tab).filter(k => Array.isArray(tab[k]));
    if (!keys.length) return null;
    if (keys.includes(String(det))) return tab[String(det)].slice().sort((p, q) => p[0] - q[0]);
    const degOf = n => dets.find(d => d.name === n)?.deg ?? 0, want = degOf(String(det));
    const k = keys.slice().sort((p, q) => Math.abs(degOf(p) - want) - Math.abs(degOf(q) - want))[0];
    return tab[k].slice().sort((p, q) => p[0] - q[0]);
  };
  const ias2cas = (det, kt) => lin(tabFor(det), kt);
  const cas2ias = (det, kt) => { const t = tabFor(det); return t ? lin(t.map(([x, y]) => [y, x]), kt) : kt; };
  const ge = val(c, 'interference.groundEffect.rMac'), mc = val(c, 'gear.geometry.main_contact_body_extended');
  const A = val(c, 'interference.groundEffect.A') ?? (b && S ? b * b / S : null);
  return { id, S, b, A, CLa, CLaW: val(c, 'interference.groundEffect.CLa_w') ?? CLa, CL0, CLmax, mass: trainingMassKg(c), dets,
    landFlap: dets.length ? dets[dets.length - 1].name : null, ias2cas, cas2ias,
    ge: Array.isArray(ge) && Array.isArray(mc) ? { xmac: ge[0], zmac: ge[2], xm: mc[0][0], zm: mc[0][2] } : null,
    unitVAPP: leaf(c, 'speeds.VAPP_kt')?.u, VAPP: val(c, 'speeds.VAPP_kt'), VREF: val(c, 'speeds.VREF_kt') };
}
export const TYPES = Object.fromEntries(CARD_IDS.map(id => [id, typeFromCard(id)]));

// ---- phases: [phase, KIAS, flap detent name (card, D6), gamma {fpm}|{deg}, power text, source codes] ----
// KIAS / power / flap come from operating documents (lh_json.mjs rows give the sources); 'VAPP' = card speeds.VAPP_kt (D1).
const c172 = (vr, vy, roc, ga, gaFlap) => [
  ['rotation', vr, '0', { fpm: 0 }], ['initial_climb', vy, '0', { fpm: roc }], ['cruise_climb', 80, '0', { fpm: 600, est: true }],
  ['cruise', 105, '0', { fpm: 0 }], ['descent', 100, '0', { fpm: -500, est: true }], ['downwind', 90, '0', { fpm: 0 }],
  ['base', 75, '20', { fpm: -500, est: true }], ['final', 'VAPP', '30', { deg: -3 }], ['go_around', ga, gaFlap, { fpm: 300, est: true }]];
export const PHASES = {
  c172s: c172(55, 74, 730, 60, '20'),
  c172r: c172(55, 79, 720, 55, '20'),
  c152: [['rotation', 50, '0', { fpm: 0 }], ['initial_climb', 67, '0', { fpm: 715 }], ['cruise_climb', 75, '0', { fpm: 500, est: true }],
    ['cruise', 95, '0', { fpm: 0 }], ['descent', 85, '0', { fpm: -500, est: true }], ['downwind', 80, '0', { fpm: 0 }],
    ['base', 65, '20', { fpm: -500, est: true }], ['final', 'VAPP', '30', { deg: -3 }], ['go_around', 55, '20', { fpm: 200, est: true }]],
  da40ng: [['rotation', 63, 'T/O', { fpm: 0 }], ['initial_climb', 72, 'T/O', { fpm: 650 }], ['cruise_climb', 88, 'UP', { fpm: 500, est: true }],
    ['cruise', 115, 'UP', { fpm: 0 }], ['descent', 110, 'UP', { fpm: -500, est: true }], ['downwind', 90, 'UP', { fpm: 0 }],
    ['base', 80, 'T/O', { fpm: -500, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 72, 'T/O', { fpm: 400, est: true }]],
  da40_180: [['rotation', 59, 'T/O', { fpm: 0 }], ['initial_climb', 62, 'T/O', { fpm: 780 }], ['cruise_climb', 70, 'UP', { fpm: 600, est: true }],
    ['cruise', 110, 'UP', { fpm: 0 }], ['descent', 105, 'UP', { fpm: -500, est: true }], ['downwind', 85, 'UP', { fpm: 0 }],
    ['base', 75, 'T/O', { fpm: -500, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 62, 'T/O', { fpm: 400, est: true }]],
  da40d: [['rotation', 59, 'T/O', { fpm: 0 }], ['initial_climb', 62, 'T/O', { fpm: 550 }], ['cruise_climb', 70, 'UP', { fpm: 450, est: true }],
    ['cruise', 105, 'UP', { fpm: 0 }], ['descent', 100, 'UP', { fpm: -500, est: true }], ['downwind', 85, 'UP', { fpm: 0 }],
    ['base', 75, 'T/O', { fpm: -500, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 62, 'T/O', { fpm: 300, est: true }]],
  da42ng: [['rotation', 76, 'UP', { fpm: 0 }], ['initial_climb', 90, 'UP', { fpm: 1100 }], ['cruise_climb', 100, 'UP', { fpm: 900, est: true }],
    ['cruise', 140, 'UP', { fpm: 0 }], ['descent', 130, 'UP', { fpm: -500 }], ['downwind', 100, 'UP', { fpm: 0 }],
    ['base', 95, 'APP', { fpm: -500, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 90, 'APP', { fpm: 500, est: true }]],
  da42_tae125: [['rotation', 70, 'UP', { fpm: 0 }], ['initial_climb', 77, 'UP', { fpm: 1060 }], ['cruise_climb', 90, 'UP', { fpm: 800, est: true }],
    ['cruise', 125, 'UP', { fpm: 0 }], ['descent', 120, 'UP', { fpm: -500, est: true }], ['downwind', 100, 'UP', { fpm: 0 }],
    ['base', 90, 'APP', { fpm: -500, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 82, 'APP', { fpm: 400, est: true }]],
  t6a: [['rotation', 85, 'TO', { fpm: 0 }], ['initial_climb', 140, 'UP', { fpm: 3000, est: true }], ['cruise_climb', 160, 'UP', { fpm: 2500, est: true }],
    ['cruise', 200, 'UP', { fpm: 0 }], ['descent', 200, 'UP', { fpm: -1500, est: true }], ['downwind', 120, 'UP', { fpm: 0 }],
    ['base', 110, 'LDG', { fpm: -800, est: true }], ['final', 'VAPP', 'LDG', { deg: -3 }], ['go_around', 110, 'TO', { fpm: 1500, est: true }]],
  p2006t: [['rotation', 64, 'T/O', { fpm: 0 }], ['initial_climb', 80, 'UP', { fpm: 1105 }], ['cruise_climb', 90, 'UP', { fpm: 800, est: true }],
    ['cruise', 135, 'UP', { fpm: 0 }], ['descent', 110, 'UP', { fpm: -500, est: true }], ['downwind', 90, 'T/O', { fpm: 0 }],
    ['base', 80, 'T/O', { fpm: -500, est: true }], ['final', 'VAPP', 'FULL', { deg: -3 }], ['go_around', 70, 'T/O', { fpm: 400, est: true }]],
};
// T-6C: same technique and speeds as the T-6A except the mass-scaled approach (card VAPP 104) — 07 [LP27]
PHASES.t6c = PHASES.t6a.map(r => r.slice());
// PC-9 M and PC-7 MkII: T-6 class technique; rotation = card VR_kt, initial climb = card VY_kt (07, both ค่าประมาณ),
// downwind/base/go-around scaled by the VS0 ratio (ค่าประมาณ), final = card VAPP
export const VS0_RATIO = { pc9m: 69 / 77.3, pc7mk2: 67 / 77.3 };   // VS0 KCAS of the PC cards / T-6A VS0 77.3 KCAS (07, first edition) — kept fixed
const PC_CARD = { pc9m: { vr: 78, vy: 136, roc: 3000 }, pc7mk2: { vr: 76, vy: 136, roc: 2500 } };   // 07 cards speeds.VR_kt / VY_kt; climb rate below the card ROC (est)
for (const id of ['pc9m', 'pc7mk2']) {
  const k = VS0_RATIO[id], pc = PC_CARD[id];
  PHASES[id] = PHASES.t6a.map(([ph, v, fl, g]) => {
    if (ph === 'rotation') return [ph, pc.vr, fl, g];
    if (ph === 'initial_climb') return [ph, pc.vy, fl, { fpm: pc.roc, est: true }];
    const low = ['downwind', 'base', 'go_around'].includes(ph);
    return [ph, v === 'VAPP' ? v : Math.round(low ? v * k : v), fl, g];
  });
}
PHASES.da42_vi = PHASES.da42ng.map(r => r.slice());

export function interp(tab, x) { return lin(tab, x); }
export function iasToCas(t, flap, ias) { return t.ias2cas(flap, ias); }

/** steady flight: alpha_body (deg) and theta (deg) at CAS (kt), flap key, gamma (rad), load factor n, ground-effect sigma */
export function attitude(t, flap, vcas, gamma, n = 1, sigma = 0) {
  const V = vcas * KT, q = 0.5 * RHO0 * V * V;
  const CL = n * t.mass * G0 * Math.cos(gamma) / (q * t.S);
  const kGE = 1 - sigma * (t.CLaW ?? t.CLa) / (Math.PI * (t.A ?? 7));       // round-1 §2.4: CL_w = CL_OGE / kGE
  const a = (CL * kGE - t.CL0[flap]) / t.CLa;
  return { CL, alpha: a / DEG, theta: (a + gamma) / DEG };
}
/** ground-effect sigma (round-1 §2.4, Tani/Torenbeek) for MAC height h (m) and span b (m) */
export const sigmaGE = (h, b) => Math.exp(-2.48 * Math.pow(Math.max(2 * h / b, 0.02), 0.768));
/** MAC quarter-chord height above the runway when the main wheels touch at pitch theta (rad) */
export function hMac(t, theta) {
  if (!t.ge) return null;
  const { xm, zm, xmac, zmac } = t.ge, c = Math.cos(theta), s = Math.sin(theta);
  return (zm * c - xm * s) - (zmac * c - xmac * s);
}
/** 1-g stall speed (KCAS) of the training mass at a detent, from the card's CLmax_target (SL ISA) */
export function vsCas(t, flap) {
  const cl = isObj(t.CLmax) ? t.CLmax[flap] : null;
  return cl ? Math.sqrt(2 * t.mass * G0 / (RHO0 * t.S * cl)) / KT : null;
}
/** touchdown (end of flare): 1.05 V_S0 at the training mass, sink 120 fpm, in ground effect (and the OGE upper bound) */
export function touchdown(t, flap = t.landFlap, { k = 1.05, sinkFpm = 120 } = {}) {
  const vs = vsCas(t, flap); if (!vs) return null;
  const vcas = k * vs, gamma = -Math.asin(sinkFpm * FPM / (vcas * KT));
  const oge = attitude(t, flap, vcas, gamma);
  let th = oge.theta * DEG, h = null, sig = 0, r = oge;
  for (let i = 0; i < 4 && t.ge; i++) { h = hMac(t, th); sig = sigmaGE(h, t.b); r = attitude(t, flap, vcas, gamma, 1, sig); th = r.theta * DEG; }
  return { vs_cas: vs, cas_kt: vcas, ias_kt: t.cas2ias(flap, vcas), gamma_deg: gamma / DEG, CL: r.CL, alpha_deg: r.alpha, pitch_deg: r.theta,
    pitch_oge_deg: oge.theta, h_mac_m: h, h_over_b: h != null ? h / t.b : null, sigma: sig };
}
/** instantaneous load-factor increment when flaps move f1 -> f2 at KIAS v and the pilot holds alpha (balloon tendency) */
export function balloon(t, f1, f2, kias) {
  const v = t.ias2cas(f2, kias) * KT, q = 0.5 * RHO0 * v * v;
  return (t.CL0[f2] - t.CL0[f1]) * q * t.S / (t.mass * G0);
}
/** flight-path angle from rate (fpm) and TAS (kt) */
export const gammaOf = (fpm, vkt) => Math.asin((fpm * FPM) / (vkt * KT));
/** fpm change per degree of pitch at constant speed (rule of thumb check) */
export const fpmPerDeg = vkt => vkt * KT * Math.sin(DEG) / FPM;
/** descent rate on a glide path of angle g (deg) at ground speed gs (kt) */
export const vsOnPath = (gs, gdeg = 3) => gs * KT * Math.tan(gdeg * DEG) / FPM;
/** card VAPP as KIAS (cards in kt CAS are converted with the landing-detent table) */
export function vappIas(t) { return /CAS/i.test(t.unitVAPP || '') ? t.cas2ias(t.landFlap, t.VAPP) : t.VAPP; }

export function run() {
  const out = {};
  for (const id of Object.keys(PHASES)) {
    const t = TYPES[id]; out[id] = {};
    for (const [ph, kRaw, flap, g] of PHASES[id]) {
      const kias = kRaw === 'VAPP' ? Math.round(vappIas(t) * 10) / 10 : kRaw;
      const vcas = t.ias2cas(flap, kias);
      const gamma = g.deg != null ? g.deg * DEG : gammaOf(g.fpm, vcas);
      const r = attitude(t, flap, vcas, gamma);
      const rate = Math.round(Math.sin(gamma) * vcas * KT / FPM);
      out[id][ph] = { ias_kt: kias, cas_kt: +vcas.toFixed(1), flap, rate_fpm: rate, gamma_deg: +(gamma / DEG).toFixed(2),
        CL: +r.CL.toFixed(3), alpha_deg: +r.alpha.toFixed(1), pitch_deg: +r.theta.toFixed(1), rate_est: !!g.est, from_card_vapp: kRaw === 'VAPP' };
    }
    const td = touchdown(t);
    if (td) {
      const fin = out[id].final, ias = Math.round(td.ias_kt);
      out[id].touchdown = { ias_kt: ias, cas_kt: +td.cas_kt.toFixed(1), flap: t.landFlap, rate_fpm: -120, gamma_deg: +td.gamma_deg.toFixed(2), CL: +td.CL.toFixed(3),
        alpha_deg: +td.alpha_deg.toFixed(1), pitch_deg: +td.pitch_deg.toFixed(1), pitch_oge_deg: +td.pitch_oge_deg.toFixed(1),
        h_mac_m: td.h_mac_m != null ? +td.h_mac_m.toFixed(2) : null, h_over_b: td.h_over_b != null ? +td.h_over_b.toFixed(3) : null, sigma: +td.sigma.toFixed(3), vs0_cas_train: +td.vs_cas.toFixed(1) };
      out[id].flare = { ias_kt: Math.round((fin.ias_kt + ias) / 2), ias_range_kt: [fin.ias_kt, ias], flap: t.landFlap, pitch_start_deg: fin.pitch_deg, pitch_deg: +td.pitch_deg.toFixed(1), rate_fpm: -120 };
    }
  }
  return out;
}

const real = f => { try { return fs.realpathSync(f); } catch { return path.resolve(f); } };
const isMain = !!process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url));
if (isMain) {
  const out = run();
  const C = TYPES.c172s;
  const checks = {
    fpm_per_deg_65kt: +fpmPerDeg(65).toFixed(1), fpm_per_deg_90kt: +fpmPerDeg(90).toFixed(1), fpm_per_deg_120kt: +fpmPerDeg(120).toFixed(1),
    vs_3deg_gs65: +vsOnPath(65).toFixed(0), vs_3deg_gs74: +vsOnPath(74).toFixed(0), vs_3deg_gs84: +vsOnPath(84).toFixed(0), vs_3deg_gs100: +vsOnPath(100).toFixed(0),
    t6_150kias_flapsUP_level: +attitude(TYPES.t6a, 'UP', 150, 0).theta.toFixed(1),
    t6_250kias_level: +attitude(TYPES.t6a, 'UP', 250, 0).theta.toFixed(1),
    c172_alpha_flap0_65kias_level: +attitude(C, '0', C.ias2cas('0', 65), 0).alpha.toFixed(2),
    c172_alpha_flap30_65kias_3deg: +attitude(C, '30', C.ias2cas('30', 65), -3 * DEG).alpha.toFixed(2),
    c172_balloon_dn_flap0to10_85kias: +balloon(C, '0', '10', 85).toFixed(3),
    c172_balloon_dn_flap10to20_80kias: +balloon(C, '10', '20', 80).toFixed(3),
    c172_balloon_dn_flap20to30_70kias: +balloon(C, '20', '30', 70).toFixed(3),
    da40_balloon_dn_UPtoTO_100kias: +balloon(TYPES.da40ng, 'UP', 'T/O', 100).toFixed(3),
  };
  const inputs = Object.fromEntries(Object.entries(TYPES).map(([id, t]) => [id, { S: t.S, b: t.b, A: t.A, CLa: t.CLa, CLa_w: t.CLaW, CL0: t.CL0, CLmax: t.CLmax, mass: t.mass,
    landFlap: t.landFlap, ge: t.ge, VAPP: t.VAPP, VAPP_u: t.unitVAPP, VREF: t.VREF }]));
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lh_attitude.json'), JSON.stringify({ generated: 'lh_attitude.mjs (cards via lm_lib.loadType, 19 Nov 2026)',
    note: 'ค่าประมาณ: theta = alpha + gamma (SL ISA); touchdown/flare in ground effect (round-1 §2.4)', checks, inputs, types: out }, null, 1) + '\n');
  for (const id of Object.keys(out)) {
    console.log(`\n${id}  (m ${TYPES[id].mass} kg, S ${TYPES[id].S}, CLα ${TYPES[id].CLa})`);
    for (const [ph, r] of Object.entries(out[id])) console.log(`  ${ph.padEnd(14)} ${String(r.ias_kt ?? '-').padStart(5)} KIAS ${String(r.cas_kt ?? '').padStart(6)} KCAS flap ${String(r.flap).padEnd(4)} ${String(r.rate_fpm).padStart(6)} fpm  CL ${r.CL != null ? r.CL.toFixed(2) : '  - '}  α ${String(r.alpha_deg ?? '-').padStart(5)}°  θ ${String(r.pitch_deg).padStart(5)}°${r.sigma != null ? `  (OGE ${r.pitch_oge_deg}°, h/b ${r.h_over_b}, σ ${r.sigma})` : ''}`);
  }
  console.log('\nchecks', JSON.stringify(checks));
}
