#!/usr/bin/env node
// lh_eval.mjs — AirfieldLab research round 2, topic 08 (LH): proposed student-pilot error detectors (common_light.evaluator)
// and a synthetic approach/landing time-series generator used by lh_tests.mjs.
// Pure Node >= 18, no dependencies. Nothing here touches src/: it is a reference implementation for Claude Code to port
// into the Evaluator of src/20-flight.js (sample fields mirror Recorder + a few signals the sim should add, marked NEW).
//
// Sample (10 Hz) fields:  t s · h ft (wheel height AGL) · ias kt · vs fpm · phi deg (bank, + right) · theta deg (pitch)
//   beta deg (sideslip) · crab deg (heading − runway) · latV m/s (velocity across runway, + right) · s m (past threshold)
//   y m (right of centre line) · gsd dots (+ above path) · locd dots · flap 0..1 · gear 0..1 · thr 0..1 · gs kt
//   wow [nose, left, right] · brake 0..1 · da −1..1 (+ = right roll) · xw kt (crosswind, + from the right)
//   alpha deg · stallWarn bool · NEW: carbHeat bool · mixture 0..1 · deTrim deg (elevator away from trimmed position,
//   stick-force proxy) · nz g
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KT = 0.514444, FT = 0.3048, DEG = Math.PI / 180;

// ---- per-type profiles: speeds KIAS from the data cards (19 Nov 2026, D1: Vapp/Vref = card VAPP_kt/VREF_kt at the
// training mass); VS0 = card VS0 as published (MTOW, forward CG; KIAS from the card note or stall table: lower IAS
// than the card CAS value makes the near-stall alert earlier, i.e. conservative); VR = normal-takeoff rotation
// (C172S/C172R 55 KIAS from the card notes, card VR_kt 51 is the short-field lift-off); DA40 NG VR/VX at the
// training mass 1,150 kg from the card notes; aim = sim GP origin (m) ----
export const PROFILES = {
  c172s: { Vapp: 65, Vref: 61, VS0: 40, VR: 55, VY: 74, VX: 62, carb: false, retract: false, demoXwind: 15, landFlap: 1, aim: 314 },
  c172r: { Vapp: 65, Vref: 62, VS0: 33, VR: 55, VY: 79, VX: 60, carb: false, retract: false, demoXwind: 15, landFlap: 1, aim: 314 },
  c152: { Vapp: 60, Vref: 54, VS0: 35, VR: 50, VY: 67, VX: 55, carb: true, retract: false, demoXwind: 12, landFlap: 1, aim: 314 },
  da40ng: { Vapp: 74, Vref: 74, VS0: 60, VR: 63, VY: 72, VX: 73, carb: false, retract: false, demoXwind: 25, landFlap: 1, aim: 314 },
  da42ng: { Vapp: 84, Vref: 84, VS0: 62, VR: 76, VY: 90, VX: 77, carb: false, retract: true, demoXwind: 25, landFlap: 1, aim: 314 },
  t6a: { Vapp: 100, Vref: 91, VS0: 74, VR: 85, VY: 140, VX: 100, carb: false, retract: true, demoXwind: 24, landFlap: 1, aim: 314 },
};
/** card speed leaves that each profile field mirrors (lh_tests T-LH-55 checks them) */
export const PROFILE_CARD = { Vapp: 'speeds.VAPP_kt', Vref: 'speeds.VREF_kt', VY: 'speeds.VY_kt', demoXwind: 'speeds.crosswind_demonstrated_kt' };

// ---- thresholds (each with its source; est = ค่าประมาณ of this topic) ----
export const TH = {
  gate_hi_ft: 500, gate_lo_ft: 300,                 // AFH p.9-6: stable by 500 ft VMC; go around if unstable below 300 ft [LH1]
  spd_lo: -5, spd_hi_ppl: 10, spd_hi_cpl: 5,         // AFH p.9-6 stabilised criteria +10/−5 KIAS; ACS PA.IV.B +10/−5, CA.IV.B ±5 [LH1][LH2][LH3]; CAAT CPL ±5 [LH32]
  sink_max_fpm: 1000,                                // AFH p.9-6 "generally 500–1,000 fpm" for light GA; p.9-30 >800–1,000 fpm excessive [LH1]
  sink_low_fpm: 800, sink_low_ft: 300,               // est (lenient): AFH p.9-6 says a rate > 500 fpm should be reduced before 300 ft AGL; 800 keeps T-6 class (≈530 fpm on 3°) clear [LH1]
  bank_final_deg: 15,                                // AFH p.9-6 [LH1]
  dots: 1,                                           // sim gates today (loc/gs ≤ 1 dot) [R1]
  dots_hold_s: 5, slow_hold_s: 3, fast_hold_s: 5,    // est: persistence to avoid nuisance alerts
  stall_margin_kt: 5,                                // 14 CFR 23.207 warning ≥ 5 kt [LM3]
  skid_beta_deg: 5, skid_bank_deg: 10, skid_below_ft: 1000, // est: cross-control turn near the ground
  flare_high_ft: 6, flare_hold_s: 1.5,               // est: level-off (|vs| < 100 fpm) above 6 ft wheel height (AFH: roundout starts 10–20 ft, should be near ground at end) [LH1 p.9-8]
  late_flare_ft: 5, late_flare_frac: 0.75, late_flare_td: 300, // est: at 5 ft still sinking ≥ 75 % of the approach rate and touchdown > 300 fpm = no/late flare
  balloon_ft: 3,                                     // est: wheel height rises ≥ 3 ft during flare
  bounce_ft: 1, bounce_s: 0.3, bounce_big_ft: 5,     // est: airborne again ≥ 1 ft for ≥ 0.3 s; ≥ 5 ft → go around [LH1 p.9-33]
  hard_fpm: 360, very_hard_fpm: 600,                 // sim score today (360, cap at 600); AFH 6-in drop ≈ 340 fpm [LH1 p.9-35][R1]
  crab_td_deg: 5, drift_td_ms: 1.6,                  // sim att thresholds (3/6°, 0.8/1.6 m/s) [R1]; ACS "no side drift" [LH2]
  cl_minor_m: 5, cl_major_m: 10,                     // sim cl score bands [R1]
  long_ppl_ft: 400, long_cpl_ft: 200,                // ACS PA.IV.B 400 ft, CA.IV.B 200 ft beyond the point [LH2][LH3]
  float_s: 6, float_ft: 3,                           // est: > 6 s below 3 ft before touchdown = float (AFH p.9-32)
  dir_hdg_deg: 10, dir_latv_ms: 2, dir_min_gs: 10,   // est: rollout heading/lateral-speed limits
  ail_rollout_gs: 20, ail_xw_kt: 5,                  // est: aileron into wind during rollout (AFH p.9-36)
  brake_hi_frac: 0.8,                                // est: braking above 0.8 Vapp (T-6: none above 80 KIAS = 0.8 × 100) [LH15] or before the nose wheel is down
  carb_thr: 0.35, carb_s: 10,                        // est: carb heat before power reduction (C152 IM p.4-9) [LH13]
  mixture_rich: 0.9, mixture_ft: 1000,               // est: mixture rich for approach / go-around [LH13]
  trim_de_deg: 3, trim_s: 10, trim_below_ft: 1000,   // est: ≈ 10 lbf prolonged force limit [LH30] mapped to ≈ 3° elevator off trim
  ga_pitch_lead_s: 2, ga_pitch_deg: 5, ga_full_thr: 0.9, // AFH p.9-11: power first, don't pitch up before power [LH1]
  ga_flap_s: 3, ga_flap_ft: 300,                     // AFH p.9-11: retract in small increments
  ga_late_ft: 100,                                   // est: go-around started below 100 ft after an unstable 300-ft gate
  rot_early_kt: 5, rot_pitch_deg: 3,                 // est: rotation before VR − 5
  vy_lo: -5, vy_hi: 10, vy_from_ft: 200, vy_to_ft: 700, // ACS PA.IV.A Vy +10/−5 [LH2]
  gear_ft: 500,                                      // est: gear down by 500 ft (retractables) [LH29]
};

// ---- rules: id, phase, severity, deduction, sources, Thai feedback (written for AirfieldLab, not copied) ----
export const RULES = {
  unstable_500: { phase: 'final', sev: 'major', pts: 10, src: ['LH1', 'LH2'], th: 'ยังไม่ stabilised ที่ 500 ft: ตรวจความเร็ว อัตราร่อน แนว glide path และแฟลปให้ครบก่อนถึงจุดนี้' },
  unstable_300: { phase: 'final', sev: 'major', pts: 10, src: ['LH1'], th: 'ต่ำกว่า 300 ft แล้วยังไม่ stabilised ควร go-around ทันที' },
  continued_unstable: { phase: 'landing', sev: 'critical', pts: 30, src: ['LH1'], th: 'ลงจอดต่อทั้งที่ approach ไม่ stabilised ต่ำกว่า 300 ft ครั้งหน้าให้ go-around' },
  high_on_path: { phase: 'final', sev: 'minor', pts: 3, src: ['R1', 'LH1'], th: 'สูงกว่า glide path เกิน 1 dot ลดกำลังเล็กน้อยแล้วรักษาความเร็ว อย่าดันหัวลงแรง' },
  low_on_path: { phase: 'final', sev: 'major', pts: 6, src: ['R1', 'LH1'], th: 'ต่ำกว่า glide path เกิน 1 dot เพิ่มกำลังพร้อมยกหัวเล็กน้อย อย่าเก็บแฟลป' },
  fast: { phase: 'final', sev: 'minor', pts: 3, src: ['LH2', 'LH3'], th: 'ความเร็ว approach สูงเกินเกณฑ์ ระวังลอยเลยจุดแตะ' },
  slow: { phase: 'final', sev: 'major', pts: 8, src: ['LH2', 'LH1'], th: 'ความเร็ว approach ต่ำกว่าเกณฑ์ เพิ่มกำลังทันที' },
  near_stall: { phase: 'any', sev: 'critical', pts: 30, src: ['LM3', 'LH4'], th: 'ใกล้ stall ที่ความสูงต่ำ ลดมุมปะทะ เพิ่มกำลังเต็ม แล้วไต่' },
  sink_high: { phase: 'final', sev: 'major', pts: 8, src: ['LH1'], th: 'อัตราร่อนสูงเกินไป ลดอัตราร่อนก่อนเข้าใกล้พื้น' },
  bank_final: { phase: 'final', sev: 'minor', pts: 3, src: ['LH1'], th: 'มุมเอียงบน final เกิน 15° ปรับแนวให้เสร็จเร็วกว่านี้' },
  skid_turn: { phase: 'base', sev: 'major', pts: 8, src: ['LH1', 'LH6'], th: 'เลี้ยวแบบ cross-control ใกล้พื้น (ball ไม่อยู่กลาง) เสี่ยง stall/spin ใช้ rudder ให้ประสาน' },
  stall_warning: { phase: 'any', sev: 'major', pts: 10, src: ['LH4', 'LH2'], th: 'สัญญาณเตือน stall ดัง ลดมุมปะทะทันที' },
  high_flare: { phase: 'flare', sev: 'major', pts: 6, src: ['LH1'], th: 'flare สูงเกินไป เครื่องลอยอยู่เหนือพื้นแล้วความเร็วลด ระวังตก' },
  late_flare: { phase: 'flare', sev: 'major', pts: 8, src: ['LH1', 'LH5'], th: 'flare ช้าเกินไปหรือไม่ได้ flare ทำให้กระแทก เริ่มดึงคันที่ 10–20 ft' },
  balloon: { phase: 'flare', sev: 'minor', pts: 4, src: ['LH1'], th: 'ดึงคันเร็วเกินไปจนเครื่องลอยขึ้น (balloon) ค้าง attitude และเติมกำลังเล็กน้อย' },
  float: { phase: 'flare', sev: 'minor', pts: 3, src: ['LH1'], th: 'ลอยนานเกินไป ความเร็วตอนข้าม threshold สูงเกิน' },
  bounce: { phase: 'landing', sev: 'major', pts: 8, src: ['LH1'], th: 'เครื่องเด้งหลังแตะพื้น ถ้าเด้งสูงให้ go-around กำลังเต็ม' },
  bounce_big: { phase: 'landing', sev: 'critical', pts: 20, src: ['LH1'], th: 'เด้งสูงเกิน 5 ft ต้อง go-around ไม่ใช่พยายามลงต่อ' },
  porpoise: { phase: 'landing', sev: 'critical', pts: 20, src: ['LH1'], th: 'porpoising: ล้อหน้าแตะก่อนแล้วเด้งซ้ำ ตั้ง attitude ลงจอดหรือ go-around' },
  nose_first: { phase: 'landing', sev: 'major', pts: 5, src: ['LH1', 'R1'], th: 'ล้อหน้าแตะก่อนล้อหลัก ยกหัวให้ถึง attitude ลงจอด' },
  hard_landing: { phase: 'landing', sev: 'major', pts: 0, src: ['LH1', 'R1'], th: 'แตะพื้นแรง (อัตราจมเกิน 360 fpm) flare ให้ต่อเนื่องจนล้อแตะ' },
  very_hard_landing: { phase: 'landing', sev: 'critical', pts: 0, src: ['R1'], th: 'แตะพื้นแรงมาก (เกิน 600 fpm) ต้องตรวจโครงสร้างเครื่อง' },
  side_load: { phase: 'landing', sev: 'major', pts: 5, src: ['LH1', 'LH2'], th: 'แตะพื้นขณะยังมี crab หรือ drift ใช้ wing-low ให้หัวตรงกับรันเวย์' },
  off_centre: { phase: 'landing', sev: 'minor', pts: 0, src: ['R1'], th: 'แตะพื้นห่างเส้นกลางรันเวย์' },
  short_landing: { phase: 'landing', sev: 'critical', pts: 0, src: ['LH5', 'R1'], th: 'แตะพื้นก่อน threshold' },
  long_landing: { phase: 'landing', sev: 'major', pts: 0, src: ['LH2', 'LH3'], th: 'แตะพื้นเลยจุดเป้าเกินเกณฑ์สอบ ถ้าลอยนานควร go-around' },
  dir_control: { phase: 'rollout', sev: 'major', pts: 10, src: ['LH5', 'LH1'], th: 'เสียการควบคุมทิศทางขณะวิ่ง ใช้ rudder ให้ทันและมองไปปลายรันเวย์' },
  excursion: { phase: 'rollout', sev: 'critical', pts: 0, src: ['R1'], th: 'ออกนอกรันเวย์' },
  aileron_rollout: { phase: 'rollout', sev: 'minor', pts: 2, src: ['LH1', 'LH15'], th: 'ขณะวิ่งในลมขวาง ให้หมุนพวงมาลัย/คันไปทางลม' },
  brake_fast: { phase: 'rollout', sev: 'minor', pts: 2, src: ['LH15', 'LH1'], th: 'เบรกแรงขณะยังเร็ว ให้ล้อรับน้ำหนักก่อน' },
  carb_heat: { phase: 'downwind', sev: 'minor', pts: 3, src: ['LH13', 'LH1'], th: 'ลดกำลังโดยไม่ดึง carb heat' },
  carb_heat_ga: { phase: 'go_around', sev: 'minor', pts: 3, src: ['LH1'], th: 'go-around แล้วยังไม่ดัน carb heat กลับ' },
  mixture: { phase: 'final', sev: 'minor', pts: 3, src: ['LH13'], th: 'mixture ยังไม่ rich ระหว่าง approach' },
  trim: { phase: 'final', sev: 'minor', pts: 2, src: ['LH1', 'LH30'], th: 'ยังถือแรงที่คันนานเกินไป trim ให้แรงหมด' },
  gear_up: { phase: 'final', sev: 'critical', pts: 30, src: ['LH29'], th: 'ล้อยังไม่ลงที่ 500 ft' },
  ga_late: { phase: 'go_around', sev: 'major', pts: 6, src: ['LH1'], th: 'ตัดสินใจ go-around ช้าเกินไป' },
  ga_pitch_first: { phase: 'go_around', sev: 'major', pts: 6, src: ['LH1'], th: 'ยกหัวก่อนเพิ่มกำลัง: เพิ่มกำลังเต็มก่อนแล้วจึงตั้ง attitude' },
  ga_flaps_dump: { phase: 'go_around', sev: 'major', pts: 6, src: ['LH1'], th: 'เก็บแฟลปทีเดียวหมดขณะต่ำ เครื่องจะจม ให้เก็บเป็นขั้น' },
  ga_no_climb: { phase: 'go_around', sev: 'major', pts: 6, src: ['LH1', 'LH2'], th: 'go-around แล้วยังไม่ไต่ภายใน 5 วินาที' },
  rotate_early: { phase: 'takeoff', sev: 'minor', pts: 3, src: ['LH11'], th: 'ยกหัวก่อนถึง VR' },
  vy_hold: { phase: 'climb', sev: 'minor', pts: 3, src: ['LH2'], th: 'ความเร็วไต่หลุดเกณฑ์ Vy +10/−5 kt' },
};

const SEV_ORDER = { info: 0, minor: 1, major: 2, critical: 3 };
/** first sample on the wheels that follows an airborne sample (a takeoff-only series has none) */
export function firstTouchdown(S) {
  const on = x => x.wow && (x.wow[0] || x.wow[1] || x.wow[2]);
  const iAir = S.findIndex(x => !on(x)); if (iAir < 0) return -1;
  for (let i = iAir; i < S.length; i++) if (on(S[i])) return i;
  return -1;
}

/** run all detectors over a sampled series. opts.level 'ppl' | 'cpl' */
export function detect(S, P, opts = {}) {
  const level = opts.level || 'ppl';
  const ev = [];
  const add = (id, t, value, limit) => { if (!ev.some(e => e.id === id)) ev.push({ id, t: +t.toFixed(1), value: +(+value).toFixed(2), limit, sev: RULES[id].sev, th: RULES[id].th }); };
  const dt = S.length > 1 ? S[1].t - S[0].t : 0.1;
  const spdHi = level === 'cpl' ? TH.spd_hi_cpl : TH.spd_hi_ppl;
  const airborne = i => !(S[i].wow && (S[i].wow[0] || S[i].wow[1] || S[i].wow[2]));
  const iTD = firstTouchdown(S);
  const td = iTD >= 0 ? S[iTD] : null;
  // go-around: throttle ≥ 0.9 while descending below 1000 ft and before touchdown, followed by climb
  let iGA = -1;
  for (let i = 1; i < S.length; i++) {
    if (iTD >= 0 && i >= iTD) break;
    if (S[i].thr >= TH.ga_full_thr && S[i - 1].thr < TH.ga_full_thr && S[i].h < 1000 && S[i].vs < 200) { iGA = i; break; }
  }
  const gateUnstable = x => {
    const why = [];
    if (x.ias < P.Vapp + TH.spd_lo || x.ias > P.Vapp + spdHi) why.push('spd');
    if (x.vs < -TH.sink_max_fpm) why.push('vs');
    if (Math.abs(x.phi) > TH.bank_final_deg) why.push('bank');
    if (x.flap < P.landFlap - 0.05 || (P.retract && x.gear < 0.98)) why.push('cfg');
    if (x.gsd != null && Math.abs(x.gsd) > TH.dots) why.push('gs');
    if (x.locd != null && Math.abs(x.locd) > TH.dots) why.push('loc');
    return why;
  };
  // gates (first crossing downward, before touchdown / go-around)
  let unst300 = false;
  for (let i = 1; i < S.length; i++) {
    const a = S[i - 1], b = S[i];
    if (iGA >= 0 && i > iGA) break;
    if (a.h >= TH.gate_hi_ft && b.h < TH.gate_hi_ft) { const w = gateUnstable(b); if (w.length) add('unstable_500', b.t, w.length, w.join(',')); if (P.retract && b.gear < 0.98) add('gear_up', b.t, b.gear, '≥ 0.98'); }
    if (a.h >= TH.gate_lo_ft && b.h < TH.gate_lo_ft) { const w = gateUnstable(b); if (w.length) { unst300 = true; add('unstable_300', b.t, w.length, w.join(',')); } }
  }
  if (unst300 && td && iGA < 0) add('continued_unstable', td.t, 1, 'go-around below 300 ft');
  // persistent deviations on final (between 1000 and 100 ft, before TD/GA)
  const endA = iGA >= 0 ? iGA : (iTD >= 0 ? iTD : S.length);
  let cHi = 0, cLo = 0, cFast = 0, cSlow = 0, cSink = 0, cTrim = 0;
  for (let i = 0; i < endA; i++) {
    const x = S[i];
    if (x.h > 1000 || x.h < 100 || x.vs > 200) { cHi = cLo = cFast = cSlow = 0; } else {
      cHi = x.gsd != null && x.gsd > TH.dots ? cHi + dt : 0; if (cHi >= TH.dots_hold_s) add('high_on_path', x.t, x.gsd, `> +${TH.dots} dot ${TH.dots_hold_s} s`);
      cLo = x.gsd != null && x.gsd < -TH.dots ? cLo + dt : 0; if (cLo >= TH.dots_hold_s - 2) add('low_on_path', x.t, x.gsd, `< −${TH.dots} dot ${TH.dots_hold_s - 2} s`);
      if (x.h < TH.gate_hi_ft) {
        cFast = x.ias > P.Vapp + spdHi ? cFast + dt : 0; if (cFast >= TH.fast_hold_s) add('fast', x.t, x.ias - P.Vapp, `> Vapp+${spdHi}`);
        cSlow = x.ias < P.Vapp + TH.spd_lo ? cSlow + dt : 0; if (cSlow >= TH.slow_hold_s) add('slow', x.t, x.ias - P.Vapp, `< Vapp${TH.spd_lo}`);
        if (Math.abs(x.phi) > TH.bank_final_deg) add('bank_final', x.t, x.phi, `> ${TH.bank_final_deg}°`);
      }
    }
    const sinkLim = x.h < TH.sink_low_ft ? TH.sink_low_fpm : TH.sink_max_fpm;
    cSink = x.h < 1000 && x.h > 20 && x.vs < -sinkLim ? cSink + dt : 0; if (cSink >= 2) add('sink_high', x.t, x.vs, `< −${sinkLim} fpm`);
    cTrim = x.deTrim != null && x.h < TH.trim_below_ft && Math.abs(x.deTrim) > TH.trim_de_deg ? cTrim + dt : 0; if (cTrim >= TH.trim_s) add('trim', x.t, x.deTrim, `> ${TH.trim_de_deg}° for ${TH.trim_s} s`);
    if (x.h < TH.skid_below_ft && Math.abs(x.beta) > TH.skid_beta_deg && Math.abs(x.phi) > TH.skid_bank_deg) add('skid_turn', x.t, x.beta, `|β| > ${TH.skid_beta_deg}° at bank > ${TH.skid_bank_deg}°`);
    if (P.carb && x.carbHeat === false && x.thr < TH.carb_thr && x.h < 1500) { x._carb = (S[i - 1]?._carb || 0) + dt; if (x._carb >= TH.carb_s) add('carb_heat', x.t, x.thr, 'carb heat ON when power reduced'); }
    if (x.mixture != null && x.mixture < TH.mixture_rich && x.h < TH.mixture_ft && x.h > 50) add('mixture', x.t, x.mixture, `≥ ${TH.mixture_rich}`);
  }
  // stall margin anywhere airborne
  for (let i = 0; i < S.length; i++) {
    const x = S[i]; if (!airborne(i)) continue;
    if (x.stallWarn && x.h > 20) add('stall_warning', x.t, x.ias, 'stall warning above 20 ft (the horn in the flare is normal)');
    if (x.h > 10 && x.ias < P.VS0 + TH.stall_margin_kt) add('near_stall', x.t, x.ias, `< VS0+${TH.stall_margin_kt}`);
  }
  // flare analysis (last 40 ft before touchdown)
  if (td) {
    let iF = iTD; while (iF > 0 && S[iF - 1].h < 40) iF--;
    let cLev = 0, minH = Infinity, below3 = 0;
    const app = S.filter((x, i) => i < iTD && x.h <= 200 && x.h >= 50); const vsApp = app.length ? app.reduce((a, x) => a + x.vs, 0) / app.length : -400;
    for (let i = iF; i < iTD; i++) {
      const x = S[i];
      cLev = x.h > TH.flare_high_ft && Math.abs(x.vs) < 100 ? cLev + dt : 0; if (cLev >= TH.flare_hold_s) add('high_flare', x.t, x.h, `level > ${TH.flare_high_ft} ft`);
      if (x.h < 20) { if (x.h < minH) minH = x.h; if (x.h - minH >= TH.balloon_ft) add('balloon', x.t, x.h - minH, `rise ≥ ${TH.balloon_ft} ft`); }
      below3 = x.h < TH.float_ft ? below3 + dt : 0; if (below3 >= TH.float_s) add('float', x.t, below3, `> ${TH.float_s} s below ${TH.float_ft} ft`);
      if (S[i - 1] && S[i - 1].h >= TH.late_flare_ft && x.h < TH.late_flare_ft && x.vs < TH.late_flare_frac * vsApp && -td.vs > TH.late_flare_td && !ev.some(e => e.id === 'high_flare')) add('late_flare', x.t, x.vs, `≥ ${TH.late_flare_frac} × ${vsApp.toFixed(0)} fpm at ${TH.late_flare_ft} ft`);
    }
    const sink = -td.vs;
    if (sink > TH.very_hard_fpm) add('very_hard_landing', td.t, sink, `> ${TH.very_hard_fpm}`); else if (sink > TH.hard_fpm) add('hard_landing', td.t, sink, `> ${TH.hard_fpm}`);
    const noseFirst = td.wow[0] && !(td.wow[1] || td.wow[2]);
    if (Math.abs(td.crab) > TH.crab_td_deg || Math.abs(td.latV) > TH.drift_td_ms) add('side_load', td.t, Math.abs(td.crab) > TH.crab_td_deg ? td.crab : td.latV, `crab ≤ ${TH.crab_td_deg}°, drift ≤ ${TH.drift_td_ms} m/s`);
    if (Math.abs(td.y) > TH.cl_minor_m) add('off_centre', td.t, td.y, `≤ ${TH.cl_minor_m} m`);
    if (td.s < 0) add('short_landing', td.t, td.s, '≥ 0 m');
    const longLim = P.aim + (level === 'cpl' ? TH.long_cpl_ft : TH.long_ppl_ft) * FT;
    if (td.s > longLim) add('long_landing', td.t, td.s, `≤ ${longLim.toFixed(0)} m`);
    // bounces after first contact
    let nB = 0, air = 0, peak = 0, firstNose = noseFirst;
    for (let i = iTD + 1; i < S.length; i++) {
      const x = S[i];
      if (airborne(i)) { air += dt; peak = Math.max(peak, x.h); }
      else { if (air >= TH.bounce_s && peak >= TH.bounce_ft) { nB++; if (x.wow[0] && !(x.wow[1] || x.wow[2])) firstNose = true; } air = 0; peak = 0; }
      if (air >= TH.bounce_s && x.h >= TH.bounce_big_ft) add('bounce_big', x.t, x.h, `< ${TH.bounce_big_ft} ft`);
    }
    if (nB >= 1) add('bounce', td.t, nB, '0');
    if (nB >= 2 && firstNose) add('porpoise', td.t, nB, '0');
    else if (noseFirst) add('nose_first', td.t, 1, 'mains first');
    // rollout
    for (let i = iTD + 5; i < S.length; i++) {
      const x = S[i]; if (airborne(i)) continue;
      if (x.gs > TH.dir_min_gs && (Math.abs(x.crab) > TH.dir_hdg_deg || Math.abs(x.latV) > TH.dir_latv_ms)) add('dir_control', x.t, Math.abs(x.crab) > TH.dir_hdg_deg ? x.crab : x.latV, `|hdg| ≤ ${TH.dir_hdg_deg}°, |latV| ≤ ${TH.dir_latv_ms}`);
      if (x.halfWidth != null && Math.abs(x.y) > x.halfWidth) add('excursion', x.t, x.y, `≤ ${x.halfWidth} m`);
      if (x.gs > TH.ail_rollout_gs && Math.abs(x.xw || 0) > TH.ail_xw_kt && x.da != null && Math.sign(x.da) !== Math.sign(x.xw)) { x._ail = (S[i - 1]?._ail || 0) + dt; if (x._ail >= 2) add('aileron_rollout', x.t, x.da, 'into wind'); }
      if (x.brake > 0.5 && (x.ias > TH.brake_hi_frac * P.Vapp || !x.wow[0])) add('brake_fast', x.t, x.ias, `nose wheel down and < ${(TH.brake_hi_frac * P.Vapp).toFixed(0)} KIAS`);
    }
  }
  // go-around checks
  if (iGA >= 0) {
    const g = S[iGA];
    if (unst300 && g.h < TH.ga_late_ft) add('ga_late', g.t, g.h, `≥ ${TH.ga_late_ft} ft`);
    // pitch-first: theta rose ≥ 5° in the 2 s before full power
    const j = S.findIndex(x => x.t >= g.t - 5);
    let up = -Infinity; for (let i = j; i <= iGA; i++) if (S[i].thr < 0.5) up = Math.max(up, S[i].theta - S[j].theta);
    if (up >= TH.ga_pitch_deg) add('ga_pitch_first', g.t, up, `< ${TH.ga_pitch_deg}° pitch-up before power (thr < 0.5)`);
    let climbed = false;
    for (let i = iGA; i < S.length; i++) {
      const x = S[i];
      if (x.t - g.t <= 5 && x.vs > 100) climbed = true;
      const k = S.findIndex(y => y.t >= x.t - TH.ga_flap_s);
      if (x.h < TH.ga_flap_ft && S[k].flap - x.flap > 0.7) add('ga_flaps_dump', x.t, S[k].flap - x.flap, `≤ 0.7 in ${TH.ga_flap_s} s`);
      if (P.carb && x.t - g.t > 5 && x.t - g.t < 6 && x.carbHeat === true) add('carb_heat_ga', x.t, 1, 'carb heat cold within 5 s');
    }
    if (!climbed) add('ga_no_climb', g.t + 5, 0, 'vs > 100 fpm within 5 s');
  }
  // takeoff / climb (series that start on the ground)
  if (S[0].wow && S[0].wow[0] && S[0].gs < 5) {
    let iLO = S.findIndex((x, i) => i > 0 && airborne(i));
    for (let i = 0; i < (iLO < 0 ? S.length : iLO); i++) if (S[i].theta > TH.rot_pitch_deg && S[i].ias < P.VR - TH.rot_early_kt) { add('rotate_early', S[i].t, S[i].ias, `≥ VR−${TH.rot_early_kt}`); break; }
    let cV = 0;
    for (const x of S) { if (x.h < TH.vy_from_ft || x.h > TH.vy_to_ft || x.vs < 100) { cV = 0; continue; } cV = (x.ias < P.VY + TH.vy_lo || x.ias > P.VY + TH.vy_hi) ? cV + dt : 0; if (cV >= 3) add('vy_hold', x.t, x.ias - P.VY, `Vy ${TH.vy_lo}/+${TH.vy_hi}`); }
  }
  ev.sort((a, b) => SEV_ORDER[b.sev] - SEV_ORDER[a.sev] || a.t - b.t);
  return ev;
}

/** proposed landing score: today's 100-point touchdown score (sink 40, pos 25, cl 15, spd 10, att 10) with the
 *  position window moved to the aim point ± ACS tolerance and speeds per type, minus error deductions, with caps */
export function score(S, P, ev, opts = {}) {
  const level = opts.level || 'ppl';
  const iTD = firstTouchdown(S);
  if (iTD < 0) return { total: null, note: 'no touchdown (go-around scored separately)' };
  const td = S[iTD], parts = {};
  const sink = -td.vs;
  parts.sink = sink <= 180 ? 40 : sink <= 360 ? 40 - 10 * (sink - 180) / 180 : sink <= 600 ? 30 - 20 * (sink - 360) / 240 : 0;
  const tol = (level === 'cpl' ? TH.long_cpl_ft : TH.long_ppl_ft) * FT, d = td.s - P.aim;
  parts.pos = td.s < 0 ? 0 : (d >= -30 && d <= tol) ? 25 : (d >= -100 && d <= 250) ? 18 : d <= 400 ? 10 : 0;
  const cl = Math.abs(td.y); parts.cl = cl <= 2 ? 15 : cl <= 5 ? 12 : cl <= 10 ? 6 : 0;
  const spdHi = level === 'cpl' ? TH.spd_hi_cpl : TH.spd_hi_ppl;
  const th50 = S.find((x, i) => i > 0 && S[i - 1].h >= 50 && x.h < 50) || td;          // speed over the threshold (50 ft)
  const d50 = th50.ias - P.Vapp, okTd = td.ias <= P.Vapp + TH.spd_lo;
  parts.spd = d50 >= TH.spd_lo && d50 <= spdHi && okTd ? 10 : d50 >= -10 && d50 <= 15 ? 6 : 2;
  const noseFirst = td.wow[0] && !(td.wow[1] || td.wow[2]);
  parts.att = Math.max(0, (Math.abs(td.phi) <= 3 ? 4 : Math.abs(td.phi) <= 6 ? 2 : 0) + (Math.abs(td.crab) <= 3 ? 3 : Math.abs(td.crab) <= 6 ? 1.5 : 0) + (Math.abs(td.latV) <= 0.8 ? 3 : Math.abs(td.latV) <= 1.6 ? 1.5 : 0) - (noseFirst ? 5 : 0));
  let base = Object.values(parts).reduce((a, b) => a + b, 0);
  const ded = ev.reduce((a, e) => a + (['side_load', 'nose_first'].includes(e.id) ? 0 : RULES[e.id].pts), 0); // already in att
  let total = Math.max(0, base - ded);
  if (ev.some(e => e.id === 'short_landing')) total = Math.min(total, 20);
  if (ev.some(e => e.id === 'excursion')) total = Math.min(total, 15);
  if (ev.some(e => e.id === 'very_hard_landing')) total = Math.min(total, 35);
  if (ev.some(e => e.sev === 'critical')) total = Math.min(total, 40);
  total = Math.round(total);
  const grade = total >= 90 ? 'ดีเยี่ยม' : total >= 75 ? 'ดี' : total >= 60 ? 'ผ่าน' : 'ต้องฝึกเพิ่ม';
  return { total, base: +base.toFixed(1), deductions: ded, parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, +v.toFixed(1)])), grade, pass: total >= 60 && !ev.some(e => e.sev === 'critical') };
}

/** synthetic approach + landing (+ optional go-around / takeoff) at 10 Hz for profile P. p = perturbations. */
export function synth(P, p = {}) {
  const dt = 0.1, out = [], tan3 = Math.tan(3 * DEG);
  const Vapp = P.Vapp, Vtd = p.vtd ?? (P.VS0 * 1.08 + 2);
  let s = P.aim - (p.h0 ?? 1000) * FT / tan3, t = 0, h = p.h0 ?? 1000, ias = Vapp, vs, theta = 0, mode = 'app', tf = 0;
  let wow = [false, false, false], gs = Vapp, y = p.y0 ?? 0, latV = 0, crab = 0, flap = p.flap ?? P.landFlap, gear = p.gear ?? 1;
  let thr = 0.3, hFlare = p.flareFt ?? 15, peakB = 0, bState = 0, touchdowns = 0, gaT = null;
  const tauF = p.flareTau ?? 0.9, vsTD = p.vsTD ?? -120;
  const rec = () => {
    const ils = Math.atan2(h * FT, Math.max(P.aim - s, 1)) / DEG;
    out.push({ t: +t.toFixed(2), h: +h.toFixed(2), ias: +ias.toFixed(2), vs: +vs.toFixed(1), phi: p.bankAt && h < p.bankAt[0] && h > p.bankAt[1] ? p.bankAt[2] : 0,
      theta: +theta.toFixed(2), beta: p.skidAt && h < p.skidAt[0] && h > p.skidAt[1] ? p.skidAt[2] : 0, crab: +crab.toFixed(2), latV: +latV.toFixed(2),
      s: +s.toFixed(1), y: +y.toFixed(2), gsd: mode === 'app' && s < P.aim ? +((ils - 3) / 0.35).toFixed(2) : null, locd: 0, flap: +flap.toFixed(2), gear, thr: +thr.toFixed(2), gs: +gs.toFixed(2),
      wow: [...wow], brake: p.brakeAt && ias > p.brakeAt ? 1 : 0, da: p.da ?? (p.xw ? Math.sign(p.xw) * 0.3 : 0), xw: p.xw ?? 0, alpha: 0,
      stallWarn: ias < P.VS0 + 5 && !wow.some(Boolean), carbHeat: p.carbHeat ?? (P.carb ? true : undefined), mixture: p.mixture ?? 1, deTrim: p.deTrim ?? 0,
      halfWidth: p.halfWidth ?? 30, nz: 1 });
  };
  while (t < (p.tmax ?? 200)) {
    if (mode === 'app') {
      const extra = (p.spdBias && h < p.spdBias[1] && h > p.spdBias[2]) ? p.spdBias[0] : 0;
      ias = Vapp + extra; gs = ias - (p.headwind ?? 0);
      const hPath = (P.aim - s) * tan3 / FT;
      const off = p.pathOffFt && h < p.pathOffFt[1] && h > p.pathOffFt[2] ? p.pathOffFt[0] : 0;
      vs = -gs * KT * tan3 / FT * 60 + (p.sinkExtra && h < p.sinkExtra[1] && h > p.sinkExtra[2] ? -p.sinkExtra[0] : 0);
      // steer height toward path + offset (first-order)
      vs += ((hPath + off) - h) * 0.1 * 60; if (p.sinkExtra && h < p.sinkExtra[1] && h > p.sinkExtra[2]) vs = -p.sinkExtra[0];
      crab = p.xw ? Math.asin(p.xw / ias) / DEG : 0;
      thr = 0.3; theta = p.thetaApp ?? 0;
      if (p.goAroundAt != null && h <= p.goAroundAt) { mode = 'ga'; gaT = t; }
      else if (h <= hFlare) { mode = 'flare'; tf = t; }
    } else if (mode === 'flare') {
      const k = Math.exp(-(t - tf) / tauF);
      const v0 = -gs * KT * tan3 / FT * 60;
      vs = vsTD + (v0 - vsTD) * k;
      if (p.levelOffFt != null && h <= p.levelOffFt + 0.5 && !p._lev) { p._lev = t; }
      if (p._lev && t - p._lev < (p.levelHold ?? 3)) vs = 0;
      else if (p._lev) vs = p.dropVs ?? -500;
      if (p.balloonFt && h < 8 && !p._bal) { p._bal = t; }
      if (p._bal && t - p._bal < 1.2) vs = p.balloonFt / 1.2 * 60; else if (p._bal && t - p._bal < 4) vs = -200;
      if (p.floatHoldS && h < 2 && !p._fl) p._fl = t;
      if (p._fl && t - p._fl < p.floatHoldS) vs = -3; else if (p._fl) vs = -60;
      ias = Math.max(Vtd, ias - (p.floatSlow ? 0.6 : 1.6) * dt * (Vapp - Vtd) / 4);
      gs = ias - (p.headwind ?? 0); theta = Math.min(p.tdPitch ?? 9, theta + 2.5 * dt);
      crab = p.xw ? (p.decrab === false ? Math.asin(p.xw / ias) / DEG : 0) : 0;
      latV = p.driftTD ?? 0; y += latV * dt;
      if (h <= 0) { mode = 'ground'; h = 0; touchdowns++; wow = p.noseFirst ? [true, false, false] : [false, true, true]; if (p.yTD != null) y = p.yTD; }
    } else if (mode === 'ground') {
      if (touchdowns <= (p.bounces ?? 1) && p.bounceFt && bState === 0) { bState = 1; mode = 'bounce'; peakB = 0; vs = Math.sqrt(2 * 9.81 * p.bounceFt * FT) / FT * 60; wow = [false, false, false]; }
      else {
        wow = touchdowns === 1 && !p.noseFirst && t < (out.find(o => o.wow.some(Boolean))?.t ?? t) + 2 ? [false, true, true] : [true, true, true];
        vs = 0; gs = Math.max(0, gs - 3.5 * dt); ias = gs + (p.headwind ?? 0); theta = Math.max(0, theta - 3 * dt);
        crab = p.rolloutYaw && gs > 15 ? p.rolloutYaw : 0; latV = crab ? gs * KT * Math.sin(crab * DEG) : (p.driftTD && gs > 30 ? p.driftTD : 0); y += latV * dt;
        if (gs <= 0.5) { rec(); break; }
      }
    } else if (mode === 'bounce') {
      vs -= 9.81 / FT * 60 * dt;
      if (h + vs / 60 * dt <= 0) { h = 0; touchdowns++; mode = 'ground'; wow = (p.bounces ?? 1) >= touchdowns && p.noseFirst ? [true, false, false] : [false, true, true];
        if ((p.bounces ?? 1) >= touchdowns) { bState = 0; } else bState = 2; }
    } else if (mode === 'ga') {
      const tg = t - gaT; const lag = p.gaPitchFirst ? 2.5 : 0;
      thr = tg < lag ? 0.3 : Math.min(1, 0.3 + (tg - lag) * 0.35);
      theta = p.gaPitchFirst ? Math.min(10, theta + 4 * dt) : (thr > 0.9 ? Math.min(8, theta + 3 * dt) : theta);
      if (p.gaFlapDump && tg > 1) flap = 0; else if (tg > 2) flap = Math.max(0.6, flap - 0.15 * dt);
      vs = thr > 0.9 && !p.gaNoClimb ? Math.min(500, vs + 400 * dt) : vs + (p.gaNoClimb ? 0 : 60 * dt);
      ias = p.gaPitchFirst && thr < 0.9 ? Math.max(P.VS0 + 3, ias - 3 * dt) : Math.min(P.VY, ias + 0.5 * dt);
      if (tg > 3 && p.carbHeatGA === 'stuck') { /* carb heat left on */ } else if (P.carb && tg > 2) p.carbHeat = false;
      if (tg > 25) { rec(); break; }
    }
    if (mode !== 'ground') { h += vs / 60 * dt; if (mode === 'bounce') peakB = Math.max(peakB, h); }
    s += gs * KT * dt; t += dt;
    if (mode === 'ground' && h > 0) h = 0;
    rec();
  }
  return out;
}

/** synthetic takeoff + initial climb (10 Hz) */
export function synthTakeoff(P, p = {}) {
  const dt = 0.1, out = []; let t = 0, ias = 0, h = 0, vs = 0, theta = 0, s = 0, air = false;
  const vr = p.vr ?? P.VR, vclimb = p.vclimb ?? P.VY;
  while (t < 90) {
    if (!air) { ias += 2.2 * dt; if (ias >= vr - 2) theta = Math.min(9, theta + 3 * dt); if (ias >= vr + 3) air = true; }
    else { ias += (vclimb - ias) * 0.3 * dt; vs = Math.min(700, vs + 300 * dt); h += vs / 60 * dt; theta = 9; }
    s += ias * KT * dt; t += dt;
    out.push({ t: +t.toFixed(2), h: +h.toFixed(1), ias: +ias.toFixed(2), vs: +vs.toFixed(0), phi: 0, theta: +theta.toFixed(2), beta: 0, crab: 0, latV: 0, s, y: 0, gsd: null, locd: null,
      flap: 0, gear: 1, thr: 1, gs: ias, wow: air ? [false, false, false] : [theta < 2, true, true], brake: 0, da: 0, xw: 0, stallWarn: false, mixture: 1, deTrim: 0, nz: 1 });
    if (h > 800) break;
  }
  return out;
}

const real = f => { try { return fs.realpathSync(f); } catch { return path.resolve(f); } };
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) {
  const P = PROFILES.c172s, S = synth(P), ev = detect(S, P), sc = score(S, P, ev);
  const td = S.find(x => x.wow.some(Boolean));
  console.log('nominal C172S: samples', S.length, 'touchdown', JSON.stringify({ t: td.t, s: td.s, vs: td.vs, ias: td.ias }));
  console.log('events', JSON.stringify(ev.map(e => e.id)), 'score', JSON.stringify(sc));
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lh_eval_rules.json'), JSON.stringify({ TH, RULES, PROFILES }, null, 1) + '\n');
}
