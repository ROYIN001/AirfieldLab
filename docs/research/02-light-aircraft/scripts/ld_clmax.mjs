#!/usr/bin/env node
// ld_clmax.mjs — gap 12 (completeness check, 19 Nov 2026): is the low flaps-UP CLmax of the DA 40 NG in the published
// speed schedules themselves, independent of the card's IAS–CAS estimate (ld_iascas)? Node >= 18, no dependencies.
// Method: the AFM approach / flaps-failed approach speeds are VREF = 1.3 VS (14 CFR 23.73 before Amdt 23-64 [LD12]), at
// 63–83 kt where IAS ≈ CAS (small position error at low alpha), so CL(VS) = 2mg/(ρ S (VREF/1.3)²) needs no IAS–CAS table.
// Compared with CL from the published stall speeds (which do need IAS–CAS near the stall) and with the legacy airframe.
// Inputs are published numbers (05-da40.md §05.3, [LD3] [LD6] [LD8] [LD4]); output scripts/out/ld_clmax.json.
import fs from 'node:fs';
const G0 = 9.80665, RHO0 = 1.225, KT = 0.514444;
const CL = (m, S, kt) => 2 * m * G0 / (RHO0 * S * (kt * KT) ** 2);
const r = (x, n = 3) => +x.toFixed(n);
const S_NG = 13.244, S_C = 13.54;
// [airframe, flap, mass kg, VREF KIAS, source]
const VREF = [
  ['NG', 'UP', 1280, 83, 'LD3 approach_table (flaps-failed approach)'], ['NG', 'T/O', 1280, 78, 'LD3'], ['NG', 'LDG', 1280, 77, 'LD3'],
  ['NG', 'UP', 1100, 78, 'LD3'], ['NG', 'LDG', 1100, 72, 'LD3'],
  ['legacy', 'UP', 1150, 73, 'LD6 p.4B-9'], ['legacy', 'UP', 1200, 76, 'LD6 p.4B-9'], ['legacy', 'LDG', 1150, 71, 'LD6 p.4A-34'], ['legacy', 'LDG', 1200, 73, 'LD6 p.4A-34'],
];
const vref = VREF.map(([af, flap, m, kias, src]) => ({ af, flap, m, kias, src, VS_kcas: r(kias / 1.3, 1), CL: r(CL(m, af === 'NG' ? S_NG : S_C, kias / 1.3)) }));
const pick = (af, flap, m) => vref.find(x => x.af === af && x.flap === flap && x.m === m).CL;
// published stall speeds read as CAS (IAS ≈ CAS assumed, only for comparison)
const stall = [
  ['NG', 'UP', 1310, 66, 'LD3'], ['NG', 'LDG', 1310, 60, 'LD3'], ['NG', 'LDG', 1310, 58, 'LD4 brochure, KCAS'],
  ['legacy', 'UP', 1150, 52, 'LD6 p.5-8'], ['legacy', 'LDG', 1150, 49, 'LD6 p.5-8'], ['legacy', 'LDG', 1200, 52, 'LD6 p.5-8 (MÄM 40-227)'],
].map(([af, flap, m, kt, src]) => ({ af, flap, m, kt, src, CL_if_cas: r(CL(m, af === 'NG' ? S_NG : S_C, kt)) }));
// legacy 1,150 kg bank-angle row (flaps UP, idle): 52 / 57 / 66 / 79 KIAS at 0 / 30 / 45 / 60 deg [LD6 p.5-8].
// If IAS = CAS at 66–79 KIAS, VS(0) in CAS = VS(φ)·√cos φ; the 0° IAS then shows the position error near the stall.
const bank = [[0, 52], [30, 57], [45, 66], [60, 79]];
const vs0FromBank = bank.slice(2).map(([phi, v]) => ({ phi, kias: v, VS0_cas: r(v * Math.sqrt(Math.cos(phi * Math.PI / 180)), 2) }));
const ias_low = vs0FromBank.map(x => r(x.VS0_cas - 52, 2));
// mass scaling check of the legacy 1,200 kg row (V ∝ √m from 1,150 kg)
const sq = Math.sqrt(1200 / 1150);
const scale1200 = { UP: { table: 53, from1150: r(52 * sq, 1) }, 'T/O': { table: 52, from1150: r(51 * sq, 1) }, LDG: { table: 52, from1150: r(49 * sq, 1) } };
// NG flaps-UP VREF scaled to the legacy mass for a like-for-like speed comparison
const ngUp1200 = r(83 * Math.sqrt(1200 / 1280), 1);
const out = {
  vref, stall,
  ratio_legacy_over_NG: { UP: r(pick('legacy', 'UP', 1150) / pick('NG', 'UP', 1280)), LDG: r(pick('legacy', 'LDG', 1150) / pick('NG', 'LDG', 1280)) },
  bank_1150: { rows: bank, vs0FromBank, ias_reads_low_kt: ias_low },
  legacy_1200_vs_sqrt_mass: scale1200,
  ng_up_vref_at_1200kg: { kias: ngUp1200, legacy: 76, diff_kt: r(ngUp1200 - 76, 1) },
};
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/ld_clmax.json', import.meta.url), JSON.stringify(out, null, 1));
for (const x of vref) console.log(`${x.af.padEnd(6)} ${x.flap.padEnd(4)} ${x.m} kg VREF ${x.kias} KIAS → VS ${x.VS_kcas} KCAS → CL ${x.CL}  [${x.src}]`);
for (const x of stall) console.log(`stall ${x.af.padEnd(6)} ${x.flap.padEnd(4)} ${x.m} kg ${x.kt} kt → CL ${x.CL_if_cas} (as CAS) [${x.src}]`);
console.log('legacy/NG CL ratio (from VREF/1.3):', JSON.stringify(out.ratio_legacy_over_NG));
console.log('1,150 kg bank row → VS0 (CAS):', JSON.stringify(vs0FromBank), 'IAS reads low by', ias_low.join(' / '), 'kt');
console.log('legacy 1,200 kg row vs √m from 1,150 kg:', JSON.stringify(scale1200));
console.log('NG flaps-UP VREF scaled to 1,200 kg:', ngUp1200, 'KIAS vs legacy 76 KIAS');
