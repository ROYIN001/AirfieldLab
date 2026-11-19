#!/usr/bin/env node
// lp_review.mjs — LP reviewer checks for 07-turboprop-trainers.md (§07.16 บันทึกการตรวจทาน). Recomputes the numbers the
// review changed or added, from the public facts in lp_cards.mjs and the sim results in out/lp_check.json:
//   (1) Vref against the regulatory VS0 definition (minimum speed of the 1 kt/s test, old 14 CFR 23.49/23.73; 01-methods
//       converts POH VS = V_SR·√0.95), for the class at 2,250 kg and for trainer_r1 / trainer_r2;
//   (2) the class ROC band at 2,250 kg / 700 kW by excess-power transfer from PC-7 MkII and PC-9 (ค่าประมาณ);
//   (3) the class take-off target at 700 kW (PC-7 MkII 415 m scaled by static thrust ∝ P^(2/3), ค่าประมาณ);
//   (4) the T-6 CG envelope in %MAC with the fuelled aft limit (EASA TCDS IM.A.636 §A.III, F.S. 169.35 in);
//   (5) T-6 glide L/D for each public sink rate; (6) roll radius of gyration Rx of the round-1 and proposed trainer.
//   node scripts/lp_review.mjs   → scripts/out/lp_review.json        (Node >= 18, no dependencies)
import fs from 'node:fs';
import { PUB, KT, FT, LB, G0, IN } from './lp_cards.mjs';
import { rhoISA } from './lm_polar.mjs';

const chk = JSON.parse(fs.readFileSync(new URL('./out/lp_check.json', import.meta.url), 'utf8'));
const R = chk.results, rr = (x, n = 4) => +(+x).toPrecision(n), s95 = Math.sqrt(0.95);
const out = {};

// (1) Vref vs VS0 (POH / TCDS definition = minimum speed of the 1 kt/s test)
const VS0c = 69 * Math.sqrt(2250 / 2350);                      // PC-9 M 69 KCAS at 2,350 kg [LP2] → 2,250 kg
out.vref = {
  class_VS0_POH_2250kg: rr(VS0c), class_Vref_2250kg: rr(1.3 * VS0c), pc7mk2_Vref: rr(1.3 * 67), pc9m_Vref_2350kg: rr(1.3 * 69),
  pc9m_Vref_over_VSR1g: rr(Math.round(1.3 * 69) / (69 / s95)), pc7mk2_Vref_over_VSR1g: rr(Math.round(1.3 * 67) / (67 / s95)),
  r1: { VSR_full: R.trainer_r1.summ.VSR_full_kt, VS0_POHeq: rr(R.trainer_r1.summ.VSR_full_kt * s95), Vref: 88, ratio_POH: rr(88 / (R.trainer_r1.summ.VSR_full_kt * s95)), ratio_1g: rr(88 / R.trainer_r1.summ.VSR_full_kt), ratio_simVmin: rr(88 / R.trainer_r1.summ.Vmin_full_kt) },
  r2: { VSR_full: R.trainer_r2.summ.VSR_full_kt, VS0_POHeq: rr(R.trainer_r2.summ.VSR_full_kt * s95), Vref: R.trainer_r2.ac.Vref, ratio_POH: rr(R.trainer_r2.ac.Vref / (R.trainer_r2.summ.VSR_full_kt * s95)) },
  note: 'VREF ≥ 1.3 VS0 (old 14 CFR 23.73, AFH) uses VS0 = minimum speed of the 1 kt/s stall test (23.49/23.201), i.e. the POH/TCDS number, not the 1-g V_SR',
};

// (2) class ROC at 2,250 kg / 700 kW by excess-power transfer (drag power at best climb ∝ W^1.5 / √S, same polar)
const roc = [];
for (const eta of [0.75, 0.80, 0.85]) for (const [name, m, PkW, rocFpm, S] of [['PC-7 MkII 2,250 kg', 2250, 522, 2840, 16.283], ['PC-9 (มวลสมมติ 2,350 kg)', 2350, 708, 4090, 16.29], ['PC-9 (มวลสมมติ 2,100 kg)', 2100, 708, 4090, 16.29]]) {
  const Pd = eta * PkW * 1e3 - m * G0 * rocFpm * FT / 60;                 // W, drag power of the source type at its best climb
  const PdT = Pd * (2250 / m) ** 1.5 * Math.sqrt(S / 16.3);
  roc.push({ eta, from: name, ROC_fpm: Math.round((eta * 700e3 - PdT) / (2250 * G0) * 60 / FT) });
}
out.roc_class_2250kg_700kW = { cases: roc, min: Math.min(...roc.map(x => x.ROC_fpm)), max: Math.max(...roc.map(x => x.ROC_fpm)) };

// (3) take-off to 50 ft at 700 kW from PC-7 MkII 415 m at 522 kW (same mass 2,250 kg; T0 ∝ P^(2/3) momentum theory)
out.takeoff_class_700kW = { scaled_m: Math.round(415 * (522 / 700) ** (2 / 3)), factor: rr((522 / 700) ** (2 / 3)), note: 'distance ∝ 1/T0, T0 ∝ P^(2/3); flap TO as PC-7 MkII; ค่าประมาณ ±20 %' };

// (4) T-6 CG envelope (fuelled, gear down): fwd 164.67 in ≤ 5,850 lb → 165.45 in at 6,900–6,950 lb; aft 169.35 in to 6,950 lb.
//     Zero fuel: 164.80–169.22 in ≤ 5,850 lb. %MAC with the PC-9 M MAC/LEMAC (ค่าประมาณ, T-6 LEMAC not public)
const P9 = PUB.pc9m, pct = fsIn => rr((fsIn * IN - P9.LEMAC) / P9.MAC * 100, 3);
out.t6_cg = {
  fuelled: [[5850, 164.67, 169.35], [6900, 165.45, 169.35], [6950, 165.45, 169.35]].map(([lb, f, a]) => ({ lb, kg: rr(lb * LB, 5), fwd_m: rr(f * IN, 5), aft_m: rr(a * IN, 5), fwd_pct: pct(f), aft_pct: pct(a) })),
  zero_fuel: { lb: 5850, fwd_pct: pct(164.80), aft_pct: pct(169.22) },
};

// (5) T-6 glide: 125 KIAS clean; sink 1,100–1,300 fpm [LP16 p. 5-13], 1,350 fpm [LP19][LP20]; L/D = V_TAS / sink
const sig = h => rhoISA(h * FT) / 1.225, LD = (h, sink) => rr(125 / Math.sqrt(sig(h)) * KT * 60 / FT / sink, 4);
out.t6_glide = { at6000ft: { 1100: LD(6000, 1100), 1225: LD(6000, 1225), 1300: LD(6000, 1300), 1350: LD(6000, 1350) }, low_3000ft_1350: LD(3000, 1350), high_9000ft_1100: LD(9000, 1100) };

// (6) Rx = √(Ixx/m)/(b/2); class range from the two JSBSim models (01-methods §01.4)
out.Rx = { trainer_r1: rr(Math.sqrt(2600 / 2250) / 5.1), trainer_r2: rr(Math.sqrt(3700 / 2250) / 5.1), class_mean: 0.261, class_range: [0.219, 0.303] };

fs.writeFileSync(new URL('./out/lp_review.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out, null, 1));
