// k_speeds.mjs — approach-speed rules for topic 3.10 (prefix K). Node >= 18, no deps.
// Boeing:  Vapp = Vref + additive. A/T engaged: +5 kt [K15][K9]. A/T off: wind additive
//          = 0.5*steady headwind + full gust increment, min 5, max 20 kt (rule widely cited; see text, conf ต่ำ-กลาง).
//          Steady part bled off in flare, gust kept to touchdown [K28].
// Airbus:  VAPP = VLS + APPR COR, APPR COR = clamp(HW/3, 5, 15) (gust excluded), 5 kt if A/THR on [K7].
//          GS mini target IAS = VAPP + k * max(0, HWcur - HWtwr) ; k = 1 (A320ceo), 0.33 (A320neo), A330 1 -> 0.33 below 400 ft [K7].
// ATR:     VAPP = max(VmHB30 + WF, VMCL), WF = min(15, max(HW/3, gust)) [K40][K41] (via topic 1).
const r1 = (x) => Math.round(x * 10) / 10;
export const vref737 = (m, flap) => (flap === 40 ? 0.53923 : 0.5595) * Math.sqrt(m); // kt, m in kg (topic 2 fit [B17][B18])
export function boeingVapp(vref, { at = true, hwSteady = 0, gust = 0 } = {}) {
  if (at) return { vapp: vref + 5, additive: 5, gustKeep: 0 };
  const add = Math.min(20, Math.max(5, 0.5 * Math.max(0, hwSteady) + Math.max(0, gust)));
  return { vapp: vref + add, additive: add, gustKeep: Math.min(add, Math.max(0, gust)) };
}
export function airbusVapp(vls, { hw = 0, athr = true, ice = false, conf3ice320 = false } = {}) {
  let cor = Math.max(0, hw) / 3;
  if (athr) cor = Math.max(cor, 5);
  if (ice) cor = Math.max(cor, conf3ice320 ? 10 : 5);
  cor = Math.min(15, Math.max(5, cor)); // AFS rule: 5 <= APPR COR <= 15
  return { vapp: vls + cor, cor };
}
export function gsMiniTarget(vapp, hwTower, hwCurrent, k = 1) {
  return vapp + k * Math.max(0, hwCurrent - Math.max(0, hwTower));
}
export function atrVapp(vmhb30, vmcl, { hw = 0, gust = 0 } = {}) {
  const wf = Math.min(15, Math.max(Math.max(0, hw) / 3, Math.max(0, gust)));
  return { vapp: Math.max(vmhb30 + wf, vmcl), wf };
}
export const airbusGSmini = (vapp, hwTowerKt) => vapp - Math.max(10, hwTowerKt); // ground speed floor (forum-derived, K28)

const out = [];
const v30 = vref737(60000, 30), v40 = vref737(60000, 40);
out.push(`737-800 60 t: Vref30 ${r1(v30)} kt, Vref40 ${r1(v40)} kt`);
out.push(`737-800 66,361 kg (MLW): Vref30 ${r1(vref737(66361, 30))}, Vref40 ${r1(vref737(66361, 40))}`);
out.push(`Boeing A/T on, 60 t F30: Vapp ${r1(boeingVapp(v30).vapp)}`);
for (const [hw, g] of [[0, 0], [10, 0], [20, 0], [20, 10], [30, 15], [0, 25]]) {
  const b = boeingVapp(v30, { at: false, hwSteady: hw, gust: g });
  out.push(`Boeing A/T off F30 60 t HW ${hw} gust ${g}: additive ${r1(b.additive)} -> Vapp ${r1(b.vapp)} kt, kept to TD ${r1(b.gustKeep)}`);
}
const vls = 128.5; // A320ceo 64.5 t CONF FULL (topic 3 [L12])
for (const hw of [0, 12, 15, 20, 30, 45, 60]) {
  const a = airbusVapp(vls, { hw, athr: true });
  out.push(`A320 VLS ${vls} HW ${hw}: APPR COR ${r1(a.cor)} -> VAPP ${r1(a.vapp)}`);
}
out.push(`A320 VLS 128.5, A/THR off, HW 0: VAPP ${r1(airbusVapp(128.5, { hw: 0, athr: false }).vapp)} (AFS min 5 kt still applies)`);
out.push(`A320 CONF3 ice (A320 family): APPR COR ${airbusVapp(140.4, { hw: 0, ice: true, conf3ice320: true }).cor}`);
// GS mini example: VAPP 133.5, tower HW 10, gusting current HW 25 -> ceo k=1, neo k=0.33
out.push(`GS mini: VAPP 133.5 twr HW 10 current HW 25: ceo target ${r1(gsMiniTarget(133.5, 10, 25, 1))}, neo ${r1(gsMiniTarget(133.5, 10, 25, 0.33))}`);
out.push(`GS mini: current HW 5 < tower 10: target ${r1(gsMiniTarget(133.5, 10, 5, 1))}`);
// ATR example (topic 1): VmHB30 = VREF 106 kt at 20.4 t (BEA), VMCL assumed < VREF
for (const [hw, g] of [[0, 0], [15, 0], [15, 10], [60, 0]]) {
  const t = atrVapp(106, 95, { hw, gust: g });
  out.push(`ATR VREF 106 HW ${hw} gust ${g}: WF ${r1(t.wf)} -> VAPP ${r1(t.vapp)}`);
}
// Approach category check (ICAO Vat = 1.3 VSO ~ Vref): 737 Vref40 MLW, A320 VLS FULL MLW
console.log(out.join('\n'));
