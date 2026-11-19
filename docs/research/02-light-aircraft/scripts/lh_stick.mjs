#!/usr/bin/env node
// lh_stick.mjs — 08-handling gap 18 (completeness check, 19 Nov 2026): estimated pitch stick force per g, stick-force
// gradient per kt and flare pull for every carded type, from the round-1 reversible-elevator hinge-moment model
// (round 1 §6.2.5 / §6.3.2: quasi-steady trim of the linear AC model; Ch = Ch0 + Chα·αt + Chδ·δe + Chtab·δtab;
// F = G·ηt·q·Se·ce·Ch). The equations are written here again (same as ld_stickforce.mjs, generalised to all cards);
// every input is a card leaf (controls.pitch.*, aero via lm_card.buildAC). All results are ค่าประมาณ (est:true):
// the hinge derivatives are the round-1 trainer class values, no type has published Ch data.
// Bounds kept from the regulations (no model value may be read as a certification value):
//   14 CFR 23.143(c) (before Amdt 23-64) temporary pitch force: stick 60 lbf, wheel two hands 75 lbf, one hand 50 lbf;
//   prolonged 10 lbf.  23.155(a): pull to reach nL ≥ max(W/100, 20) lbf ≤ 50 (wheel) or max(W/140, 15) lbf ≤ 35 (stick).
//   Targets: the card's validation.stick_force_targets band (MIL-F-8785C Level 1 + 23.155), computed here for cards
//   without one (DA40 family) with the same formulas.  Gradient floor 0.167 lbf/kt (0.74 N/kt) as in the cards (guide only).
// P2006T: all-moving stabilator with anti-servo tab; the round-1 elevator hinge model does not apply -> band only.
// Run: node scripts/lh_stick.mjs  -> scripts/out/lh_stick.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, val, iasCas, trainingMassKg } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC } from './lm_card.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LBF = 4.44822, LB = 0.45359237, FT = 0.3048;
// [id, controller, nL, landing detent for VAPP CAS lookup, fallbacks for missing pitch leaves]
export const IDS = [
  ['c172s', 'wheel', 3.8], ['c172r', 'wheel', 3.8], ['c152', 'wheel', 4.4, { from: 'c172s', keys: ['gearing', 'Ch0', 'Ch_alpha', 'Ch_delta', 'Ch_tab'] }],
  ['da40ng', 'stick', 3.8], ['da40_180', 'stick', 3.8], ['da40d', 'stick', 3.8],
  ['da42ng', 'stick', 3.8], ['da42_tae125', 'stick', 3.8], ['da42_vi', 'stick', 3.8],
  ['t6a', 'stick', 7], ['t6c', 'stick', 7], ['pc9m', 'stick', 7], ['pc7mk2', 'stick', 7],
  ['p2006t', 'wheel', 3.8, { noHinge: 'stabilator (all-moving tail + anti-servo tab): round-1 elevator hinge model not valid' }],
];
export const CFR23_143 = { stick_temp_lbf: 60, wheel_two_hands_lbf: 75, wheel_one_hand_lbf: 50, prolonged_lbf: 10 };

/** MIL-F-8785C Level 1 + 23.155 band (lbf/g); wheel formula as lc_cardfix.stickForceBand, centre stick as lp_check */
export function band(ctrl, nAlpha, nL, W_lb) {
  const dn = nL - 1;
  const milMax = ctrl === 'wheel' ? Math.max(Math.min(500 / nAlpha, 120), 120 / dn) : Math.max(Math.min(240 / nAlpha, 28), 56 / dn);
  const milMin = ctrl === 'wheel' ? Math.max(35 / dn, 6) : Math.max(21 / dn, 3);
  const p23 = ctrl === 'wheel' ? Math.min(Math.max(W_lb / 100, 20), 50) : Math.min(Math.max(W_lb / 140, 15), 35);
  return { min: Math.max(milMin, p23 / dn), max: milMax, mil_min: milMin, mil_max: milMax, p23_force_lbf: p23, p23_per_g: p23 / dn };
}

export async function compute() {
  const M = await loadSim();
  const { KT, RAD, G0, atmosphere } = M;
  const out = {};
  for (const [id, ctrl, nL, fb = {}] of IDS) {
    const card = loadType(id), P = k => val(card, `controls.pitch.${k}`);
    const src = fb.from ? loadType(fb.from) : null;
    const PF = k => P(k) ?? (src && fb.keys.includes(k) ? val(src, `controls.pitch.${k}`) : undefined);
    const p = { eta: PF('eta_t'), at: PF('a_t'), tau: PF('tau_e') ?? 0.6, lt: PF('l_t'), deda: PF('deda'), Se: PF('S_e'), ce: PF('c_e'), G: PF('gearing'),
      Ch0: PF('Ch0') ?? 0, Cha: PF('Ch_alpha'), Chd: PF('Ch_delta'), Cht: PF('Ch_tab') };
    const fallback = fb.from ? fb.keys.filter(k => P(k) == null) : [];
    const mtow = val(card, 'airframe.weights.MTOW'), mTrain = trainingMassKg(card), Wlb = mtow / LB;
    const sft = val(card, 'validation.stick_force_targets');
    const cardBand = sft ? (sft.band?.fs_per_g_lbf ?? sft.fs_per_g_lbf) : null;
    const vappCas = (() => { const v = val(card, 'speeds.VAPP_kt'); const f = iasCas(card, landDetName(card)); return f && f.f ? f.f(v) : v; })();
    const crz = val(card, 'validation.trim_targets.cruise') || {};
    const res = { id, controller: ctrl, nL, mtow_kg: mtow, train_kg: mTrain, inputs: p, fallback_from: fb.from && fallback.length ? { id: fb.from, keys: fallback } : null };
    let nAlpha = null;
    if (!fb.noHinge && p.G && p.Cha != null && p.Se && p.ce) {
      for (const [tag, mass] of [['train', mTrain], ['mtow', mtow]]) {
        const ac = buildAC(card, { mass }), restore = applyAC(M, ac), A = M.AC;
        try {
          const W = A.m * G0;
          const trim = (Vkt, flaps, h) => {          // 1-g level trim (CAS ≈ EAS, q from sea-level density), out of ground effect
            const rho = atmosphere(h, 0).rho, V = Vkt * KT * Math.sqrt(1.225 / rho), qb = 0.5 * 1.225 * (Vkt * KT) ** 2, CLreq = W / (qb * A.S);
            const c0 = A.CL0 + A.CLflap * flaps, m0 = A.Cm0 + A.Cmflap * flaps, den = A.CLa * A.Cmde - A.CLde * A.Cma;
            return { V, qb, alpha: ((CLreq - c0) * A.Cmde + A.CLde * m0) / den, de: (-A.CLa * m0 - A.Cma * (CLreq - c0)) / den };
          };
          const aT = t => t.alpha * (1 - p.deda);
          const Ch = (a, de, dt) => p.Ch0 + p.Cha * a + p.Chd * de + p.Cht * dt;
          const F = (qb, ch) => p.G * p.eta * qb * p.Se * p.ce * ch;       // N, pull positive (same sign rule as ld_stickforce.mjs)
          const point = (Vkt, flaps, h, vFlare) => {
            const t0 = trim(Vkt, flaps, h), dt = -(p.Ch0 + p.Cha * aT(t0) + p.Chd * t0.de) / p.Cht;   // tab trimmed to zero force
            const f = v => { const t = trim(v, flaps, h); return F(t.qb, Ch(aT(t), t.de, dt)); };
            const grad = (f(Vkt - 1) - f(Vkt + 1)) / 2;                                      // N/kt, > 0: pull when slower (stable)
            const qh = (G0 / t0.V) * A.c / (2 * t0.V), dCL = W / (t0.qb * A.S), det = A.CLa * A.Cmde - A.CLde * A.Cma;
            const b1 = dCL - A.CLq * qh, b2 = -A.Cmq * qh, da = (b1 * A.Cmde - A.CLde * b2) / det, dde = (A.CLa * b2 - A.Cma * b1) / det;
            const Fg = F(t0.qb, p.Cha * (da * (1 - p.deda) + (G0 / t0.V) * p.lt / t0.V) + p.Chd * dde);
            const r = { cas_kt: +Vkt.toFixed(1), flaps, h_m: +h.toFixed(0), alpha_deg: +(t0.alpha * RAD).toFixed(2), de_deg: +(t0.de * RAD).toFixed(2), tab_deg: +(dt * RAD).toFixed(2),
              grad_N_per_kt: +grad.toFixed(3), grad_lbf_per_kt: +(grad / LBF).toFixed(3), Fs_per_g_N: +Fg.toFixed(1), Fs_per_g_lbf: +(Fg / LBF).toFixed(2),
              dde_per_g_deg: +(dde * RAD).toFixed(2) };
            if (vFlare) { const Ff = f(vFlare); r.flare = { to_cas_kt: +vFlare.toFixed(1), pull_N: +Ff.toFixed(1), pull_lbf: +(Ff / LBF).toFixed(1) }; }
            return r;
          };
          const vs0 = Math.sqrt(2 * W / (1.225 * A.S * (val(card, 'aero.static_long.CLmax_target')?.[landDetName(card)] ?? 1.8))) / KT;
          res[tag] = { mass_kg: +A.m.toFixed(1),
            approach: point(vappCas, 1, 300, 1.05 * vs0),
            cruise: point(crz.ias_kt ?? 110, 0, (crz.h_ft ?? 3000) * FT) };
          if (tag === 'mtow') nAlpha = 0.5 * 1.225 * ((crz.ias_kt ?? 110) * KT) ** 2 * A.S * A.CLa / W;
        } finally { restore(); }
      }
    } else {
      res.no_hinge = fb.noHinge || 'pitch leaves incomplete';
      nAlpha = sft?.nAlpha_cruise_g_per_rad ?? sft?.band?.nAlpha_cruise_g_per_rad ?? null;
    }
    const nA = sft?.nAlpha_cruise_g_per_rad ?? sft?.band?.nAlpha_cruise_g_per_rad ?? nAlpha;
    const b = band(ctrl, nA, nL, Wlb);
    res.band_lbf_per_g = cardBand ? { min: cardBand.min, max: cardBand.max, from: 'card validation.stick_force_targets' }
      : { min: +b.min.toFixed(2), max: +b.max.toFixed(2), from: `computed here (${ctrl}, n/α ${nA?.toFixed(2)} g/rad, nL ${nL}, W ${Math.round(Wlb)} lb)` };
    res.band_N_per_g = { min: +(res.band_lbf_per_g.min * LBF).toFixed(1), max: +(res.band_lbf_per_g.max * LBF).toFixed(1) };
    res.cfr23_155 = { force_lbf: +b.p23_force_lbf.toFixed(1), per_g_lbf: +b.p23_per_g.toFixed(2) };
    const temp = ctrl === 'wheel' ? CFR23_143.wheel_two_hands_lbf : CFR23_143.stick_temp_lbf;
    res.cfr23_143 = { temporary_pitch_lbf: temp, one_hand_lbf: ctrl === 'wheel' ? CFR23_143.wheel_one_hand_lbf : CFR23_143.stick_temp_lbf, prolonged_lbf: CFR23_143.prolonged_lbf };
    if (res.mtow) {
      const pull = res.mtow.cruise.Fs_per_g_lbf * (nL - 1);
      res.checks = {
        pull_to_nL_mtow_lbf: +pull.toFixed(1),
        model_meets_23_155: pull >= b.p23_force_lbf - 0.05,
        model_pull_within_23_143_temporary: pull <= temp,
        model_train_cruise_in_band: res.train.cruise.Fs_per_g_lbf >= res.band_lbf_per_g.min && res.train.cruise.Fs_per_g_lbf <= res.band_lbf_per_g.max,
        gradient_stable_23_173: res.train.approach.grad_N_per_kt > 0 && res.train.cruise.grad_N_per_kt > 0,
        gradient_ge_0_167_guide: res.train.approach.grad_lbf_per_kt >= 0.167,
        flare_pull_le_one_hand_23_143: res.train.approach.flare.pull_lbf <= res.cfr23_143.one_hand_lbf,
      };
    }
    // target for the sim (ค่าประมาณ): the hinge-model Fs/g at the training mass clamped into
    // [band min, min(band max, 23.143 temporary force / (nL − 1))]; gradient target = hinge model (must stay > 0, 23.173(a))
    {
      const lo = res.band_lbf_per_g.min, hi = Math.min(res.band_lbf_per_g.max, temp / (nL - 1));
      const m = res.train ? res.train.cruise.Fs_per_g_lbf : null, ma = res.train ? res.train.approach.Fs_per_g_lbf : null;
      const clamp = x => Math.min(Math.max(x, lo), hi);
      const tc = m != null ? clamp(m) : (lo + hi) / 2, ta = ma != null ? clamp(ma) : (lo + hi) / 2;
      // rounded bounds stay inside the exact ones (ceil / floor); rounded targets are kept inside the rounded bounds
      const loL = Math.ceil(lo * 10) / 10, hiL = Math.floor(hi * 10) / 10, loN = Math.ceil(lo * LBF), hiN = Math.floor(hi * LBF);
      const rc = (x, a, b, d) => Math.min(Math.max(+x.toFixed(d), a), b);
      res.target = {
        fs_per_g_lbf: { approach: rc(ta, loL, hiL, 1), cruise: rc(tc, loL, hiL, 1), min: loL, max: hiL },
        fs_per_g_N: { approach: rc(ta * LBF, loN, hiN, 0), cruise: rc(tc * LBF, loN, hiN, 0), min: loN, max: hiN },
        // gradient and flare pull scale with the same factor as Fs/g (all ∝ G·ηt·Se·ce·Ch), so the clamp ratio is applied to them too
        grad_N_per_kt: res.train ? { approach: +(res.train.approach.grad_N_per_kt * ta / ma).toFixed(2), cruise: +(res.train.cruise.grad_N_per_kt * tc / m).toFixed(2) } : null,
        flare_pull_N: res.train ? +(res.train.approach.flare.pull_N * ta / ma).toFixed(0) : null,
        scale_vs_model: res.train ? { approach: +(ta / ma).toFixed(2), cruise: +(tc / m).toFixed(2) } : null,
        basis: m == null ? 'band midpoint (no hinge model)' : (Math.abs(tc - m) < 0.05 ? 'hinge model inside the bounds' : `hinge model ${m} lbf/g clamped to the bounds`),
      };
    }
    out[id] = res;
  }
  return out;
}
function landDetName(card) { const d = val(card, 'aero.flaps.detents') || []; return d.length ? String(d.slice().sort((a, b) => a.flap_deg - b.flap_deg).slice(-1)[0].name) : null; }

const real = f => { try { return fs.realpathSync(f); } catch { return path.resolve(f); } };
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) {
  const out = await compute();
  for (const [id, r] of Object.entries(out)) {
    if (!r.train) { console.log(`${id.padEnd(12)} no hinge model (${r.no_hinge}); band ${r.band_lbf_per_g.min}–${r.band_lbf_per_g.max} lbf/g; target ${JSON.stringify(r.target.fs_per_g_N)} N/g`); continue; }
    const a = r.train.approach, c = r.train.cruise;
    console.log(`${id.padEnd(12)} ${r.controller} m ${r.train.mass_kg}: app ${a.cas_kt} KCAS Fs/g ${a.Fs_per_g_N} N (${a.Fs_per_g_lbf} lbf) grad ${a.grad_N_per_kt} N/kt flare→${a.flare.to_cas_kt} pull ${a.flare.pull_N} N (${a.flare.pull_lbf} lbf); ` +
      `crz ${c.cas_kt} Fs/g ${c.Fs_per_g_N} N (${c.Fs_per_g_lbf} lbf) grad ${c.grad_N_per_kt}; band ${r.band_lbf_per_g.min}–${r.band_lbf_per_g.max}; pull nL ${r.checks.pull_to_nL_mtow_lbf} lbf ` +
      Object.entries(r.checks).filter(([k, v]) => v === false).map(([k]) => 'no:' + k).join(' ') + `\n             target Fs/g ${r.target.fs_per_g_N.approach}/${r.target.fs_per_g_N.cruise} N (${r.target.fs_per_g_lbf.cruise} lbf, ${r.target.basis}); grad ${r.target.grad_N_per_kt.approach}/${r.target.grad_N_per_kt.cruise} N/kt; flare pull ${r.target.flare_pull_N} N`);
  }
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lh_stick.json'), JSON.stringify({ generated: 'lh_stick.mjs 19 Nov 2026', method: 'round-1 §6 reversible elevator hinge model with card leaves (ค่าประมาณ)', cfr23_143: CFR23_143, ids: out }, null, 1));
}
