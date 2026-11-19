#!/usr/bin/env node
// lp_hot.mjs — LP §07.4.3: hot-day (VTBD, elevation 9 ft, OAT 31–35 °C) estimates for the class (ค่าประมาณ).
//   node scripts/lp_hot.mjs   (Node >= 18, no dependencies)
// Flat rating keeps shaft power at the take-off rating up to T_flat (PT6A-62 37 °C [R1:E1]); constant-power static thrust ∝ ρ^(1/3)
// (momentum theory), so the take-off ground roll ∝ W²/(ρ·T) ∝ σ^(-4/3). ROC from the power balance with the class polar [LP27]:
// ROC = (ηP − D·V_TAS)/W at the same EAS, η 0.80 (ค่าประมาณ).
import { rhoISA } from './lm_polar.mjs';
const G0 = 9.80665, KT = 0.514444, FT = 0.3048, RHO0 = 1.225;
const pol = { CD0: 0.02864, K: 0.06836 };            // class polar from the T-6 glide (lp_cards.mjs, d.t6a.polar)
const out = [];
for (const [id, m, P, Tflat] of [['pc9m', 2350, 708e3, 37], ['pc7mk2', 2250, 522e3, 45], ['t6a', 2948.35, 820.3e3, 46], ['trainer', 2250, 700e3, 37]]) {
  for (const oat of [15, 31, 35]) {
    const h = 9 * FT, rho = rhoISA(h, oat - (15 - 0.0065 * h)), sig = rho / RHO0;
    const Pav = oat <= Tflat ? P : P * (1 - 0.0135 * (oat - Tflat));
    const Veas = 125 * KT, V = Veas / Math.sqrt(sig), q = 0.5 * RHO0 * Veas ** 2, W = m * G0, S = 16.28;
    const CL = W / (q * S), D = q * S * (pol.CD0 + pol.K * CL * CL), roc = (0.8 * Pav - D * V) / W / FT * 60;
    out.push({ id, oat, sigma: +sig.toFixed(4), P_kW: Math.round(Pav / 1e3), TO_roll_factor: +Math.pow(sig, -4 / 3).toFixed(3), ROC_125KEAS_fpm: Math.round(roc), TAS_per_EAS: +(1 / Math.sqrt(sig)).toFixed(4) });
  }
}
console.table(out);
import fs from 'node:fs';
fs.writeFileSync(new URL('./out/lp_hot.json', import.meta.url), JSON.stringify(out, null, 1));
