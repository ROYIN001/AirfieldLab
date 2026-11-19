#!/usr/bin/env node
// ld_stickforce.mjs — gap 18 (completeness check, 19 Nov 2026): stick force per g and stick-force gradient per kt of the
// three DA40 cards, from the round-1 reversible-elevator model (round 1 §6, scripts/c6_hinge.mjs: quasi-steady trim of
// the linear AC model + hinge moment Ch = Ch0 + Chα·αt + Chδ·δe + Chtab·δtab, F = G·ηt·q·Se·ce·Ch). The equations are
// re-written here (no round-1 code copied); every input is a card leaf (controls.pitch.*, aero via lm_card.buildAC).
// All results are ค่าประมาณ: Ch derivatives are the round-1 trainer values (no DA40 data), gearing is estimated.
// Check against 14 CFR 23.155(a)(2) (before Amdt 23-64 [LD12]): stick pull to reach the positive limit load factor at
// least max(W/140 lb, 15 lb), need not exceed 35 lb (W = maximum weight). 23.173(a): pull needed below trim speed.
// Run from the repo root: node <this folder>/ld_stickforce.mjs  -> scripts/out/ld_stickforce.json
import fs from 'node:fs';
import { loadType, val, iasCas, trainingMassKg } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC } from './lm_card.mjs';
const M = await loadSim();
const { KT, RAD, G0, atmosphere } = M;
const LBF = 4.44822, LB = 0.45359237, FT = 0.3048;
const IDS = [['da40ng', 1310, 3.8], ['da40_180', 1200, 3.8], ['da40d', 1150, 3.8]];   // MTOM kg, limit n (normal category [LD1][LD2 p.2-20])
const out = { method: 'round-1 §6 reversible elevator model with card leaves (ค่าประมาณ)', ids: {} };
for (const [id, mtom, nL] of IDS) {
  const card = loadType(id), P = k => val(card, `controls.pitch.${k}`);
  const p = { eta: P('eta_t'), at: P('a_t'), tau: P('tau_e'), lt: P('l_t'), deda: P('deda'), Se: P('S_e'), ce: P('c_e'), G: P('gearing'),
    Ch0: P('Ch0') ?? 0, Cha: P('Ch_alpha'), Chd: P('Ch_delta'), Cht: P('Ch_tab') };
  const res = {};
  for (const [tag, mass] of [['train', trainingMassKg(card)], ['mtom', mtom]]) {
    const ac = buildAC(card, { mass }), restore = applyAC(M, ac), A = M.AC;
    try {
      const W = A.m * G0;
      const trim = (Vkt, flaps, h) => {            // 1-g level trim of the linear model, out of ground effect
        const rho = atmosphere(h, 0).rho, V = Vkt * KT, qb = 0.5 * rho * V * V, CLreq = W / (qb * A.S);
        const c0 = A.CL0 + A.CLflap * flaps, m0 = A.Cm0 + A.Cmflap * flaps, den = A.CLa * A.Cmde - A.CLde * A.Cma;
        return { V, qb, alpha: ((CLreq - c0) * A.Cmde + A.CLde * m0) / den, de: (-A.CLa * m0 - A.Cma * (CLreq - c0)) / den };
      };
      const aT = (t, q = 0) => t.alpha * (1 - p.deda) + q * p.lt / t.V;
      const Ch = (a, de, dt) => p.Ch0 + p.Cha * a + p.Chd * de + p.Cht * dt;
      const F = (qb, ch) => p.G * p.eta * qb * p.Se * p.ce * ch;       // N, pull positive
      const point = (Vkt, flaps, h) => {
        const t0 = trim(Vkt, flaps, h), dt = -(p.Ch0 + p.Cha * aT(t0) + p.Chd * t0.de) / p.Cht;   // tab trimmed to zero force
        const f = v => { const t = trim(v, flaps, h); return F(t.qb, Ch(aT(t), t.de, dt)); };
        const grad = (f(Vkt - 1) - f(Vkt + 1)) / 2;                      // N/kt, > 0: pull needed when slower (stable)
        // pull-up increments per g (quasi-steady): ΔCL and pitch rate q = g/V
        const qh = (G0 / t0.V) * A.c / (2 * t0.V), dCL = W / (t0.qb * A.S), det = A.CLa * A.Cmde - A.CLde * A.Cma;
        const b1 = dCL - A.CLq * qh, b2 = -A.Cmq * qh, da = (b1 * A.Cmde - A.CLde * b2) / det, dde = (A.CLa * b2 - A.Cma * b1) / det;
        const Fg = F(t0.qb, p.Cha * (da * (1 - p.deda) + (G0 / t0.V) * p.lt / t0.V) + p.Chd * dde);
        return { ias_kt: Vkt, flaps, h_m: h, alpha_deg: +(t0.alpha * RAD).toFixed(2), de_deg: +(t0.de * RAD).toFixed(2), tab_deg: +(dt * RAD).toFixed(2),
          grad_N_per_kt: +grad.toFixed(3), grad_lbf_per_kt: +(grad / LBF).toFixed(3), Fs_per_g_N: +Fg.toFixed(1), Fs_per_g_lbf: +(Fg / LBF).toFixed(2),
          dde_per_g_deg: +(dde * RAD).toFixed(2), stick_per_g_mm: +(Math.abs(dde) / p.G * 1000).toFixed(1) };
      };
      const vapp = iasCas(card, 'LDG').f(val(card, 'speeds.VAPP_kt')), crz = val(card, 'validation.trim_targets.cruise');
      const Fe = 1 - p.tau * p.Cha / p.Chd, SMfix = -A.Cma / A.CLa, SMfree = -(A.Cma + p.eta * (val(card, 'airframe.tail.S_h') * p.lt / (A.S * A.c)) * p.at * (1 - p.deda) * (1 - Fe)) / A.CLa;
      res[tag] = { mass: A.m, approach: point(Math.round(vapp), 1, 300), cruise: point(crz.ias_kt, 0, (crz.h_ft ?? 3000) * FT),
        SM_fixed: +SMfix.toFixed(3), SM_free: +SMfree.toFixed(3), free_elevator_factor: +Fe.toFixed(3) };
    } finally { restore(); }
  }
  const Wlb = mtom / LB, req = Math.min(Math.max(Wlb / 140, 15), 35);
  const Flim = res.mtom.cruise.Fs_per_g_lbf * (nL - 1);
  out.ids[id] = { p, ...res, cfr23_155: { W_lb: Math.round(Wlb), nL, required_lbf: +req.toFixed(1), required_per_g_lbf: +(req / (nL - 1)).toFixed(2), model_lbf: +Flim.toFixed(1), ok: Flim >= req } };
  const t = res.train;
  console.log(`${id}: train ${t.mass} kg approach ${t.approach.ias_kt} KCAS Fs/g ${t.approach.Fs_per_g_N} N (${t.approach.Fs_per_g_lbf} lbf), grad ${t.approach.grad_N_per_kt} N/kt; cruise ${t.cruise.ias_kt} KCAS Fs/g ${t.cruise.Fs_per_g_N} N, grad ${t.cruise.grad_N_per_kt} N/kt; SM fixed/free ${t.SM_fixed}/${t.SM_free}`);
  console.log(`   MTOM ${mtom} kg: pull to n ${nL} = ${Flim.toFixed(1)} lbf vs 23.155 min ${req.toFixed(1)} lbf → ${Flim >= req ? 'ok' : 'LOW'}`);
}
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/ld_stickforce.json', import.meta.url), JSON.stringify(out, null, 1));
