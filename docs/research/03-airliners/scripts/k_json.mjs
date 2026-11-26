// k_json.mjs — builds and validates the ops.* JSON blocks of topic 3.10 (prefix K). Writes k_json_out.md.
// Run 2 (18 Nov 2026): reference ids follow the final list in 10-fctm-technique.md ([K1]..[K78]).
import { writeFileSync } from 'node:fs';
const KT = 0.514444, FT = 0.3048, FPM = 0.00508;
const r = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
const L = (v, u, scope, src, conf, est, note = '') => ({ v, u, scope, src, conf, est, note });
const kt = (x) => r(x * KT), ft = (x) => r(x * FT);
const blocks = {};
// ---------------- common_airliner ----------------
blocks.common_airliner = { ops: {
  stabilised_criteria: L({ gate_IMC_m: ft(1000), gate_VMC_m: ft(500), circling_wings_level_m: ft(300), speed_min_rel_Vref_mps: 0, speed_max_rel_Vref_mps: kt(20), sink_max_mps: r(1000 * FPM), ils_max_dots: 1, airbus_callouts: { speed_low_rel_Vapp_mps: kt(-5), speed_high_rel_Vapp_mps: kt(10), vs_max_mps: r(1000 * FPM), bank_deg: 7, loc_dots: 0.25, gs_dots: 1 }, operator_typical: { speed_rel_target_mps: [kt(-5), kt(10)], wings_level_by_m: ft(500) }, action: 'go-around if not stabilised at gate' }, 'm, m/s, dots, deg', 'sim', ['K1', 'K2', 'K3', 'K58', 'K23'], 'สูง', false, 'FSF BN 7.1: 1,000 ft IMC / 500 ft VMC, VREF..VREF+20 kt, ≤1,000 fpm, ±1 dot; Airbus FOBN: VAPP −5/+10 kt, V/S −1,000 fpm, bank 7°, LOC 1/4 dot, G/S 1 dot; ผู้ให้บริการ (ATSB): −5/+10 kt, wings level by 500 ft; AC 120-71B ย้ายเกณฑ์ไปไว้ใน AC 91-79 แล้ว [K76]'),
  tdz_target_m: L({ aiming_marking_start: 400, aiming_marking_end: 450, ac91_79b_air_distance: ft(1500), ac91_79b_min_air_distance: ft(1000), score_perfect: [300, 600], score_good: [220, 750], tdz_end: 900, dmk_gp_origin: { '21R': 314.1, '21L': 308.2, '03L': 319.9 } }, 'm from threshold', 'environment', ['K12', 'K51', 'K52'], 'กลาง', true, 'AC 91-79B ¶3.9: 1,500 ft หรือ 7 s air distance, สั้นสุด 1,000 ft; เครื่องหมาย aiming point 400 m ตามที่ repo วาด (ICAO, LDA ≥ 2,400 m) ไม่ได้อ่าน Annex 14 เอง; GP origin = RDH/tan3° (AIP); ช่วงคะแนนเป็นค่าที่เลือก (est)'),
  hard_landing: L({ design_sink_MLW_mps: 3.048, design_sink_MTOW_mps: 1.829, boeing_amm_nz: 2.2, boeing_amm_max_roll_deg: 2, airbus_load15_nz: 2.6, airbus_load15_sink_mps: 2.743, airbus_severe_sink_mps: 4.267, score_cap_sink_mps: 3.048, typical_td_sink_mps: [0.5, 1.5], dials_autoland_sink_mean_mps: 0.732 }, 'm/s, g, deg', 'sim', ['K13', 'K58', 'K57', 'K47', 'K15', 'K23'], 'กลาง', true, '25.473: 10 ft/s (600 fpm) ที่ MLW, 6 ft/s (360 fpm) ที่ MTOW; Boeing AMM: peak nz เกิน 2.2 g (ใช้ได้เมื่อ roll ≤ 2°); Airbus LOAD<15>: VRTA > 2.6 g หรือ RALR < −9 ft/s (540 fpm); 14 ft/s = severe hard; typical 100–300 fpm เป็นค่าประมาณจากเหตุการณ์ปกติในรายงาน (est)'),
  landing_distance_factors: L({ dispatch_dry_factor: 1.667, wet_factor: 1.15, toa_margin: 1.15, speed_plus10pct_distance_factor: 1.2, tch_plus10ft_add_m: ft(200), delay_2s_118kt_add_m: ft(400), downhill_1pct_factor: 1.1, tailwind_10kt_factor: 1.21, fsf_tailwind_per_5kt: 1.10, fsf_headwind_per_5kt: 0.975, fsf_elevation_per_1000ft: 1.05, ldf_columns: ['Dry 6', 'Good 5', 'Good grooved/PFC 5', 'Good to Medium 4', 'Medium 3', 'Medium to Poor 2', 'Poor 1'], ldf_turbojet_with_reverse: [1.67, 1.92, 2.2, 2.3, 2.5, 2.9, 3.4], ldf_turbojet_no_reverse: [1.67, 2.3, 2.6, 2.8, 3.2, 4.0, 5.1] }, '-, m', 'environment', ['K12', 'K75', 'K69'], 'สูง', false, '14 CFR 121.195(b)(d): หยุดภายใน 60 % ของทางวิ่ง, เปียก ×1.15; AC 91-79B ¶3.1, ¶5.2.2–5.2.9, Table 3-1 (ลำดับคอลัมน์ตามที่ WebFetch อ่านหัวตาราง: ต้องตรวจกับ PDF ก่อนใช้, conf ของคอลัมน์ = กลาง); FSF BN 8.5: tailwind +10 %/5 kt, headwind −2.5 %/5 kt, elevation +5 %/1,000 ft'),
  crosswind_limits: L({ cert_min_mps: { rule: 'max(20 kt, 0.2 VSR0), need not exceed 25 kt', min: kt(20), cap: kt(25) }, airbus_contaminated_typical: { good_5: 'max demonstrated', good_medium_4: kt(30), medium_3: kt(25), medium_poor_2: kt(20), poor_1: kt(15), unreliable_9: kt(5) }, mu_bands: { good: 0.40, good_medium: [0.36, 0.39], medium: [0.30, 0.35], medium_poor: [0.26, 0.29], poor: 0.25 }, demonstrated_is_not_limit: true }, 'm/s, mu', 'environment', ['K14', 'K4', 'K64'], 'สูง', false, '14 CFR 25.237; Airbus FOBN Crosswind Landings Table 1 (typical); EASA SIB 2014-20: ค่า demonstrated ไม่ใช่ขีดจำกัดโครงสร้าง ผู้ผลิตควรบอกว่ารวม gust หรือไม่'),
  crosswind_technique: L({ crab_angle: 'psi = asin(Vxw/TAS)', airbus_td_max_crab_deg: 5, airbus_td_max_bank_deg: 5, sideslip_bank_per_kt_deg: 0.3, sideslip_only_max_kt_737: 26, examples: { xw10kt: { sideslip_bank_deg: 3, wings_level_crab_deg: [4, 5] }, xw30kt: { sideslip_bank_deg: 9, wings_level_crab_deg: 13, combined: { crab: 5, bank: 5 } } } }, 'deg', 'sim', ['K4', 'K11', 'K42'], 'สูง', false, 'ตัวอย่างที่ MLW config ลงจอด (Airbus FOBN); 0.3°/kt เป็นค่าเฉลี่ยของ 3°/10 kt และ 9°/30 kt (est); 737 FCTM: sideslip-only ไม่แนะนำเกิน 26 kt (ผ่าน code7700)'),
  autobrake: L({ typical_low_mps2: r(3 * KT), typical_medium_mps2: r(6 * KT), range_kt_per_s: [3, 6], max_pedal_mps2: [r(8 * KT), r(10 * KT)], model: 'deceleration command: brake force = clamp(m*a_cmd - other decel forces, 0, mu limit)' }, 'm/s^2', 'sim', ['K70', 'K69', 'K68'], 'กลาง', false, 'FSF BN 8.4/8.5: autobrake low ราว 3 kt/s, medium ราว 6 kt/s, pedal สูงสุด 8–10 kt/s (ค่าทั่วไป ไม่ใช่รายแบบ); แปลงหน่วยใน k_testvals.mjs'),
  reverse: L({ use: 'max reverse as soon as possible after touchdown', reverse_idle_speed_range_mps: [kt(60), kt(80)], effectiveness: 'higher at high airspeed; force independent of runway condition', full_stop_after_selection: true }, 'm/s', 'sim', ['K70', 'K69', 'K53'], 'กลาง', false, 'FSF BN 8.4: กลับ reverse idle ที่ราว 60–80 KIAS; BN 8.5: reverse ได้ผลมากเมื่อความเร็วสูงและเมื่อ decel จากเบรกต่ำ; Airbus SF#14: เลือก reverse แล้วต้องหยุดเต็ม'),
  ground_spoilers: L({ weight_on_wheels_without: 0.60, weight_on_wheels_with: 0.85, drag_increase: 1.30, bounce_note: 'auto extension at touchdown gives nose-up pitch and loss of lift' }, '-', 'sim', ['K70', 'K15', 'K20'], 'กลาง', false, 'FSF BN 8.4 Figure 1 (แผนภาพทั่วไป ไม่ใช่รายแบบ)'),
  flare_law: L({ form: 'hdot = -K (h + hB)', K: '(s0 - std)/hF', hB: 'std/K', std_mps: 0.762, flare_time_nominal_s: [3, 6.5], boeing_fctm_flare_time_s: [4, 8] }, 'm, s', 'sim', ['K15', 'K6', 'K47'], 'ต่ำ', true, 'ตระกูลเดียวกับ flare law ของหัวข้อ 9; std 2.5 ft/s เลือกให้ใกล้ sink ตอนแตะพื้นที่สังเกตได้ (JTSB 100 fpm, NASA DIALS 2.4 ft/s); ผลใน k_flare.mjs'),
  go_around: L({ pitch_target_deg: 15, rotation_rate_dps: 3, ultimate_pitch_deg: 25, pitch_callout_deg: 20, bank_callout_deg: 15, triggers: ['unstabilised at gate', 'high hard bounce', 'not in TDZ'], fsf_go_around_rate_pct: 17 }, 'deg, deg/s, %', 'sim', ['K2', 'K71', 'K44', 'K15'], 'กลาง', false, 'FSF BN 6.2: หมุนเท่าตอนวิ่งขึ้น ราว 3°/s, ห้ามเกินค่าสูงสุด เช่น 25° (เรียกที่ 20°), bank call > 15°; 15° = F/D TO/GA (หัวข้อ 9); FSF BN 6.1: มีเพียง 17 % ที่ go-around จริง'),
  evaluator: L({ weights: { sink: 40, pos: 25, cl: 15, spd: 10, att: 10 }, sink_pts: { full_mps: r(240 * FPM), p30_mps: r(360 * FPM), p10_mps: r(600 * FPM) }, caps: { tailstrike: 25, podstrike: 30, hard: 35, high_bounce: 40, long: 50 }, penalties: { bounce: 10, unstable: 10, duck_under: 5, float: 5, pitch_call: 5 }, bounce_detect: { min_air_s: 0.5, min_h_m: 0.3, high_h_m: 1.5 }, float_max_s: 8, duck_under: { below_ft: 200, dots_low: 1 } }, 'points, m/s, s, m', 'sim', ['K15', 'K13', 'K12', 'K58', 'K57'], 'ต่ำ', true, 'ข้อเสนอขยาย Evaluator (k_score.mjs) เกณฑ์ทั้งหมดเลือกเอง โดยยึด 25.473, FCTM flare 4–8 s, AC 91-79B air distance 1,500 ft, เกณฑ์ hard landing ของ Boeing/Airbus'),
} };
// ---------------- b737_800 ----------------
blocks.b737_800 = { ops: {
  speed_additive: L({ at_engaged_mps: kt(5), manual_rule: 'max(5, 0.5*HW_steady + gust) kt, command speed <= min(Vref+20, VFE-5)', min_mps: kt(5), max_mps: kt(20), headwind_factor: 0.5, gust_factor: 1, bleed: 'steady part bled off in flare, gust kept to touchdown', tailwind: 'no additive', ice_max_additive_mps: kt(20) }, 'm/s, -', 'aircraft', ['K35', 'K60', 'K28', 'K15', 'K9'], 'กลาง', false, 'FCTM Rev 12 (2013) p.1.11 ผ่าน code7700: "add one half of the reported steady headwind component plus the full gust increment"; ขั้นต่ำ Vref+5; เพดาน Vref+20 หรือ VFE−5 (flaps2approach); code7700 รายงานว่า FCTM มิ.ย. 2018 ลดเพดานเป็น 15 kt (ยังไม่ยืนยัน); A/T engaged ใช้ Vref+5 (JTSB: Vref 134 + 5)'),
  approach_pitch_deg: L({ F30_Vref5: 2.4, F40_Vref5: 1.4, F30_Vref5_two_pos_skid: 3.6, F40_Vref5_two_pos_skid: 2.7, per_5kt_above_Vref5: -1, FD_pitch_VLA_F30: 3.4 }, 'deg', 'aircraft', ['K31', 'K45'], 'กลาง', false, 'FCTM p.6.3 ผ่านกระทู้ (สำเนาไม่เป็นทางการ); FD pitch 3.4° ที่ θ 3.0° จาก Boeing Visual Landing Aids data (หัวข้อ 5 [D3])'),
  approach_thrust: L({ total_N_60t_F30_Vref5: 32200, fraction_of_static: 0.138, N1_pct_typical: 57 }, 'N, -, %', 'aircraft', ['K36', 'K38', 'K16'], 'ต่ำ', true, 'validation.trim_targets ของหัวข้อ 2 หารด้วย 2×116,990 N (หัวข้อ 6); N1 ราว 57 % จากกระทู้ (หัวข้อ 2 [B30]); VT-JTD บันทึก N1 59.4 % ที่แตะพื้นครั้งแรก'),
  flare_height_m: L(ft(20), 'm (main gear height)', 'aircraft', ['K15', 'K16', 'K58'], 'สูง', false, '20 ft: "Initiate the flare when the main gears are approximately 20 ft above the runway" (FCTM ที่ยกใน JTSB, AAIB India, ATSB AO-2023-010); บางโรงเรียนสอน 30 ft'),
  flare_pitch_increase_deg: L([2, 3], 'deg', 'aircraft', ['K15', 'K16', 'K10'], 'สูง', false, '"increasing pitch attitude approximately 2° - 3°"'),
  flare_duration_s: L([4, 8], 's', 'aircraft', ['K15', 'K58'], 'สูง', false, '"Typical landing flare times range from 4 to 8 seconds and are a function of approach speed"'),
  thrust_retard: L({ manual: 'idle reached at main gear touchdown', at_retard_height_m: ft(27), at_retard_alt: '2.5 s after FLARE' }, 'm', 'aircraft', ['K15', 'K44'], 'กลาง', false, 'A/T RETARD 27 ft RA (หัวข้อ 9 [O19][O16])'),
  touchdown_pitch_deg: L({ typical: 5.0, range: [4.0, 6.5], pitch_callout: 8.0 }, 'deg', 'aircraft', ['K31', 'K15', 'K16', 'K26', 'K58'], 'ต่ำ', true, 'approach 2.4° + flare 2–3° = 4.4–5.4°; ข้อมูลจริง 4.57° (VT-JTD), 5.09° (VH-YQR), ~6° (JA56AN), QAR เฉลี่ย 5.2° (กระทู้); pitch_callout 8° เลือกให้ห่าง 1° จากขีดยุบ 9° (est)'),
  touchdown_speed_rel_mps: L([kt(-5), 0], 'm/s relative to Vref', 'aircraft', ['K16'], 'สูง', false, 'FCTM: "normal touchdown speed (VREF to VREF - 5 knots)"'),
  tailstrike_pitch_deg: L({ gear_extended: 11.0, gear_compressed: 9.0, alt_extended_JTSB: 11.5, tail_skid: 'takeoff only' }, 'deg', 'aircraft', ['K18', 'K15', 'K26', 'K67', 'K9'], 'สูง', false, 'TSIB: "Tail strike will occur when the lift-off pitch angle exceeded 11"; JTSB: ยุบ "approx. 9º", ยืด "approx. 11.5º"; เลือก 11.0 ให้ตรงกับหัวข้อ 5; tail skid กันได้เฉพาะตอนวิ่งขึ้น ไม่รับประกันตอนลงจอด'),
  rotation_rate_dps: L({ nominal: [2, 3], max_before_risk: 4 }, 'deg/s', 'aircraft', ['K17', 'K18', 'K9'], 'สูง', false, 'ATSB/TSIB อ้าง FCTM 2–3°/s; AERO: เกิน 4°/s ลดระยะหางชัด'),
  liftoff_pitch_deg: L({ typical: [7, 9], flaps1: 8.5, flaps5_target: 8, tail_clearance_flaps1_m: 0.33, tail_clearance_flaps5_m: 0.51 }, 'deg, m', 'aircraft', ['K18', 'K17'], 'สูง', false, 'TSIB §1.5.2.1; ATSB AO-2018-011 p.4'),
  rotation_to_liftoff_s: L([3, 4], 's', 'aircraft', ['K17'], 'สูง', false, '"lift-off attitude is achieved in approximately 3 to 4 seconds"'),
  initial_climb_pitch_deg: L(15, 'deg', 'aircraft', ['K44'], 'กลาง', false, 'F/D TO/GA 15° nose up (หัวข้อ 9 [O19])'),
  crosswind_limits: L({ demonstrated_mps: { winglets: kt(33), no_winglets: kt(36) }, guideline_takeoff_mps: { dry_winglets: kt(34), dry_no_winglets: kt(36), wet: kt(25), standing_water_slush: kt(15), snow_no_melting: kt(25), ice_no_melting: kt(15) }, guideline_landing_mps: { dry: kt(40), wet: kt(40), standing_water_slush: kt(20), snow_no_melting: kt(35), ice_no_melting: kt(17) }, autoland_mps: kt(25), operator_examples_mps: { continental_dry: kt(33) }, sideslip_only_max_mps: kt(26), gust: 'guideline values include gusts in some operator manuals' }, 'm/s', 'aircraft', ['K55', 'K48', 'K11', 'K25', 'K42'], 'ต่ำ', false, 'ตาราง guideline จากกระทู้ PPRuNe t-443278 (ผู้โพสต์ยกคู่มือบริษัท 737-700/800) รูปแบบตรงกับตาราง Boeing ของ Cashman ที่อ่านได้ไม่ครบ; ค่าสาธิต 33/36 kt จากกระทู้ (หัวข้อ 2 [B29]); Continental dry 33 kt (NTSB)'),
  crosswind_technique: L({ preferred: 'crab on final, de-crab in flare with rudder, into-wind aileron', rudder_effective_until_mps: kt(60), rudder_effective_from_mps: [kt(40), kt(60)] }, 'm/s', 'aircraft', ['K59', 'K25', 'K11'], 'กลาง', false, 'FCTM ผ่าน SKYbrary (Leeds Bradford): rudder มีผลถึงราว 60 kt; NTSB Continental 1404: rudder เริ่มมีผล 40–60 kt ขณะวิ่งขึ้น'),
  bank_limit_touchdown_deg: L({ operational: 5, nacelle_contact_static: { MTW: 13.6, OEW: 18.2 }, nacelle_contact_pitch_m2p5: { MTW: 9.6, OEW: 14.2 }, wingtip_contact_static: [14.1, 15.1], events_nacelle_strike: { VH_YIW: 10.3, EI_DAL: 11.4 } }, 'deg', 'aircraft', ['K4', 'K56', 'K61', 'K62'], 'ต่ำ', true, 'เรขาคณิต asin((h0 − L·sin(−θ))/(y − track/2)) จาก clearance หัวข้อ 5 และตำแหน่งเครื่องยนต์หัวข้อ 6 (k_testvals.mjs, L = 3.2 m) ไม่รวมการยุบโช้คข้างเดียว; เหตุการณ์จริง: nacelle แตะที่ bank 10.3° pitch −2.5° (VH-YIW) และ 11.4° โช้คขวายุบ (EI-DAL); 5° ตามแนว Airbus ใช้แทนขีดปฏิบัติ'),
  autobrake: L({ AB1: r(4 * FT), AB2: r(5 * FT), AB3: r(7.2 * FT), MAX_above_80kt: r(14 * FT), MAX_below_80kt: r(12 * FT), RTO: 'full pressure', engage: 'thrust levers idle + main wheel spin-up; selectable after TD while > 60 kt', disarm: ['speedbrake lever DOWN', 'thrust levers advanced (except first 3 s)', 'manual braking', 'selector OFF'] }, 'm/s^2', 'aircraft', ['K29', 'K30'], 'กลาง', false, '4, 5, 7.2, 14/12 ft/s² (แหล่งทุติยภูมิสองแหล่งตรงกัน ไม่ใช่ FCOM โดยตรง)'),
  reverse: L({ select_within_s: 2, max_reverse_until_mps: kt(60), then: 'reverse idle until taxi speed', reverse_idle_speed_mps: kt(60) }, 's, m/s', 'aircraft', ['K24', 'K54', 'K34'], 'สูง', false, 'NTSB AAR-07/06: Boeing ให้คง reverse ถึง 60 kt; SWA เลือก reverse ภายใน 2 s หลังแตะพื้น'),
  ground_spoilers: L({ auto_deploy: 'speedbrake ARMED + RA < 10 ft + main wheel spin-up > 60 kt (or thrust levers idle)', bounce_warning: 'retarding to idle after a bounce can deploy spoilers: loss of lift + nose-up moment' }, '-', 'aircraft', ['K15', 'K16', 'K58'], 'กลาง', false, 'JTSB AA2011-4 p.13–14 (AOM); ATSB AO-2023-010 p.3'),
  bounce: L({ shallow: 'hold/re-establish normal landing attitude, thrust not needed', high_hard: 'go-around', no_pitch_increase_after_td: true }, '-', 'aircraft', ['K15', 'K16', 'K58', 'K9'], 'สูง', false, 'FCTM ที่ยกในรายงาน JTSB, AAIB India และ ATSB'),
  hard_landing: L({ amm_nz: 2.2, valid_max_roll_deg: 2, events: { VH_YQR_2nd_td_nz: 2.96, VH_YQR_comparison_nz: 1.94, JA56AN_nz: 2.4, VT_JTD_nz: 2.79 } }, 'g, deg', 'aircraft', ['K58', 'K15', 'K16'], 'สูง', false, 'Boeing AMM (ATSB AO-2023-010 p.4): "a peak recorded vertical acceleration that exceeds 2.2 G", "valid for a conventional landing with impact of no more than 2° roll"'),
} };
// ---------------- a320ceo ----------------
blocks.a320ceo = { ops: {
  speed_additive: L({ rule: 'VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5 if ice), 5, 15)', appr_cor_min_mps: kt(5), appr_cor_max_mps: kt(15), headwind_factor: 1 / 3, gust: 'excluded (GS mini)', ice_conf3_mps: kt(10) }, 'm/s, -', 'aircraft', ['K7', 'K20', 'K35'], 'สูง', false, 'Safety First #24 p.12; BEA F-GTAT: "VAPP est égale à VLS + 1/3 vent de face tour avec minimum de VLS + 5 kt"'),
  gs_mini: L({ k: 1, rule: 'IAS target = VAPP + k*max(0, HW_current - HW_tower)' }, '-', 'aircraft', ['K7', 'K72'], 'สูง', false, 'k = 1 สำหรับ A320ceo (กระทู้: ceo ที่มี sharklet ก็ยังใช้ k = 1)'),
  approach_pitch_deg: L({ FULL_VAPP: 2.5, range: [1.5, 3.3] }, 'deg', 'aircraft', ['K19', 'K46', 'K20'], 'ต่ำ', true, 'A321 ได้ 2.4° (BEA); หัวข้อ 3 ใช้ 1.5°, หัวข้อ 5 ถอดได้ ~3.3° จากข้อมูล visual aids; เลือก 2.5 ± 1'),
  approach_thrust: L({ total_N_64_5t_FULL: 51200, fraction_of_static: 0.245 }, 'N, -', 'aircraft', ['K37', 'K38'], 'ต่ำ', true, 'validation.trim_targets ของหัวข้อ 3 หารด้วย 2×104,530 N (CFM56-5B6, หัวข้อ 6)'),
  flare_height_m: L(ft(30), 'm (RA)', 'aircraft', ['K6', 'K57'], 'สูง', false, '"Flare should be initiated at around 30 ft RA (A220/A300/A310/A320)"; FCOM ใน AAIB 6/2009: "From stabilized conditions, the flare height is about 30 ft"'),
  flare_pitch_increase_deg: L({ typical: 4, range: [3, 4.5] }, 'deg', 'aircraft', ['K57', 'K19'], 'กลาง', false, 'FCOM ใน AAIB 6/2009: "The typical pitch increment in the flare is approximately 4°, which leads to -1° flight path angle"; FCOM Bulletin 22/2 (A321): ราว 4.5°'),
  thrust_retard: L({ manual_callout_m: ft(20), autoland_callout_m: ft(10), rule: 'thrust levers IDLE at touchdown at the latest (ground spoilers)' }, 'm', 'aircraft', ['K6', 'K57'], 'สูง', false, '"The 20 ft RETARD auto callout is a reminder, not an order"; autoland 10 ft ตามหัวข้อ 9'),
  touchdown_pitch_deg: L({ typical: 6.0, range: [4.5, 8.0], pitch_callout: 10.0 }, 'deg', 'aircraft', ['K57', 'K8'], 'ต่ำ', true, 'approach ~2.5 + flare ~4 = ~6.5 (est; A321 ตารางผู้ผลิตให้ 6.6); callout 10° เลือกให้ห่างจากขีดยุบ 11.7° (est)'),
  touchdown_speed_rel_mps: L([kt(-8), 0], 'm/s relative to VAPP-5 (≈VREF)', 'aircraft', ['K27'], 'ต่ำ', true, 'ตาม FCOM 806/1 ของ A321 ที่สมมติลดความเร็ว 8 kt ใน flare (VAPP − 8)'),
  tailstrike_pitch_deg: L({ gear_extended: 13.5, gear_compressed: 11.7 }, 'deg', 'aircraft', ['K8', 'K63'], 'สูง', false, 'Safety First #05 p.4; ATSB AO-2016-046 (13.5° oleo ยืดเต็ม)'),
  rotation_rate_dps: L({ nominal: 3, sidestick_fraction: [0.33, 0.5], event_too_high: [5, 9] }, 'deg/s, -', 'aircraft', ['K8', 'K63'], 'สูง', false, '"continuous rotation rate of approximately 3°/sec"; FCTM ของผู้ให้บริการ: "typically 1/3 to 1/2 backstick", "initial rotation rate is about 3 deg/sec"; เหตุการณ์ 5°/s (SF#05) และ 9°/s (VH-VGF)'),
  liftoff_pitch_deg: L({ typical: 10, mlg_full_extension_after_liftoff_s: 2 }, 'deg, s', 'aircraft', ['K8', 'K73'], 'ต่ำ', true, 'A320 ไม่พบค่าปกติ; ใช้ ~10° ตาม FCTM A330 ("4 to 5 seconds after VR ... approximately 10°") (est); โช้คยืดเต็ม "may take place more than 2 seconds later"'),
  initial_climb_pitch_deg: L(15, 'deg', 'aircraft', ['K73', 'K72'], 'กลาง', false, 'FCOM/FCTM (A330 ผ่าน SKYbrary): "continuous rotation rate of 3 °/second up to a pitch attitude of 15°"; กระทู้ A320neo: pitch "settles at 15"'),
  crosswind_limits: L({ demonstrated_landing_incl_gust_mps: kt(38), demonstrated_takeoff_mps: kt(35), contaminated: 'common_airliner.ops.crosswind_limits.airbus_contaminated_typical' }, 'm/s', 'aircraft', ['K49', 'K4'], 'กลาง', false, '38/35 kt จากหัวข้อ 3 [L11][L14]'),
  bank_limit_touchdown_deg: L({ operational: 5, max_crab_deg: 5 }, 'deg', 'aircraft', ['K4'], 'สูง', false, 'FOBN Crosswind: TD "Maximum 5 degrees of crab angle" และ "Maximum 5 degrees of bank angle"; ขีดเรขาคณิตไม่พบ'),
  autobrake: L({ LO: 1.7, LO_delay_s: 4, MED: 3.0, MED_delay_s: 2, MAX: 'RTO only, commands ~6 m/s^2', MAX_cmd: 6.0, arm_min_speed_mps: kt(72), decel_light_fraction: 0.8, alt_LO_newer_fcom: 2.0, alt_LO_delay_s: 2 }, 'm/s^2, s', 'aircraft', ['K39', 'K65', 'K32', 'K33'], 'กลาง', false, '1.7/4 s จาก Flying Engineer (หัวข้อ 3 [L15]) และกระทู้; มีตัวเลือกลดหน่วงเหลือ 2 s; แหล่งใหม่กว่า (FBW, avistory) ให้ LO 2.0 m/s² หน่วง 2 s; MAX สั่ง 6 m/s²'),
  reverse: L({ max_reverse_until_mps: kt(70), then: 'idle reverse to taxi speed', full_stop_rule: 'reverser selection means full stop' }, 'm/s', 'aircraft', ['K43', 'K53', 'K32'], 'กลาง', false, '70 kt (สำเนาไม่เป็นทางการของ FCOM ผ่านหัวข้อ 6 [J45]); Safety First #14 (หัวข้อ 6 [J39])'),
  ground_spoilers: L({ rto_min_speed_mps: kt(72), landing: 'armed: extend at MLG touchdown with thrust levers at IDLE' }, 'm/s', 'aircraft', ['K32', 'K6'], 'กลาง', false, 'FBW RTO guide: ต่ำกว่า 72 kt spoiler และ autobrake ไม่ทำงาน'),
  bounce: L({ low: 'keep normal landing attitude, do not increase pitch, keep idle, continue landing', high: 'go-around', note_spoilers: 'spoiler extension gives pitch-up' }, '-', 'aircraft', ['K20', 'K5'], 'สูง', false, 'Airbus Briefing Notes ที่ยกใน BEA F-AT110912 p.6'),
  stabilised_criteria: L({ speed_rel_VAPP_mps: [kt(-5), kt(10)], vs_max_mps: r(1000 * FPM), bank_deg: 7 }, 'm/s, deg', 'aircraft', ['K3'], 'สูง', false, 'Airbus FOBN stabilized approach'),
  hard_landing: L({ load15_nz: 2.6, load15_window_s: 0.5, load15_sink_mps: 2.743, severe_sink_mps: 4.267 }, 'g, s, m/s', 'aircraft', ['K57'], 'สูง', false, 'AAIB 6/2009 p.10: "RALR is less than ... -9 ft/sec", "VRTA is more than +2.6G during +/- 0.5 seconds before and after landing"; 14 ft/s = "severe hard"'),
} };
// ---------------- a320neo (inherits a320ceo via topic 3) ----------------
blocks.a320neo = { ops: {
  gs_mini: L({ k: 0.33, rule: 'IAS target = VAPP + k*max(0, HW_current - HW_tower)' }, '-', 'aircraft', ['K7', 'K72'], 'สูง', false, 'k = 0.33 สำหรับ A320neo'),
  autobrake: L({ LO: 2.0, LO_delay_s: 2, MED: 3.0, MED_delay_s: 2, MAX: 'RTO only', MAX_cmd: 6.0, arm_min_speed_mps: kt(72), decel_light_fraction: 0.8 }, 'm/s^2, s', 'aircraft', ['K32', 'K33', 'K65'], 'ต่ำ', false, 'FBW (จำลอง A320neo) และ avistory; ไม่ใช่ FCOM โดยตรง; BTV ของ A320neo ไม่พบในแหล่งที่อ่านได้'),
  rotation_rate_dps: L({ nominal: 3, note_neo: 'pitches up more readily (higher thrust), easy to over-rotate' }, 'deg/s', 'aircraft', ['K72', 'K63'], 'กลาง', false, 'กระทู้นักบิน A320neo; ค่าเป้าเท่า ceo'),
} };
// ---------------- a321neo (full A321 set; a321ceo inherits via topic 3) ----------------
blocks.a321neo = { ops: {
  approach_pitch_deg: L({ FULL_Vapp: 2.4, observed_D_AIRE: [1.5, 2.1], observed_F_GTAT_50ft: 1.8 }, 'deg', 'aircraft', ['K20', 'K27', 'K19'], 'สูง', false, 'BEA F-AT110912 p.5 (คู่มือ): "l assiette est généralement voisine de + 2,4°"; FCOM 806/1 ผ่านกระทู้ 2.4°; AAIB D-AIRE 1.5–2.1°'),
  flare_height_m: L(ft(30), 'm (RA)', 'aircraft', ['K20', 'K57', 'K6', 'K19'], 'สูง', false, 'BEA F-GTAT: "réaliser l arrondi vers 30 ft"; AAIB G-DHJH (A321): about 30 ft; FCOM Bulletin 22/2 (2000) ให้ ~20 ft และลดกำลัง 20–15 ft (เก่ากว่า)'),
  flare_pitch_increase_deg: L(4.2, 'deg', 'aircraft', ['K20', 'K57', 'K19'], 'กลาง', false, '6.6 − 2.4 = 4.2° (BEA); FCOM ใน AAIB 6/2009 ราว 4°; FCOM Bulletin 22/2 ราว 4.5°'),
  touchdown_pitch_deg: L({ typical: 6.6, range: [4.5, 7.5], pitch_callout: 7.5 }, 'deg', 'aircraft', ['K20', 'K27'], 'สูง', false, 'BEA: "Elle est de + 6,6° au touché des roues"; callout "PITCH" ที่ 7.5° (A321) ตาม SOP ผู้ให้บริการในรายงาน BEA'),
  touchdown_speed_rel_mps: L([kt(-8), 0], 'm/s relative to VAPP-5 (≈VREF)', 'aircraft', ['K27'], 'กลาง', false, 'FCOM 806/1: "a deceleration of 8 knots during flare (Vapp - 8)"'),
  tailstrike_pitch_deg: L({ gear_extended: 11.2, gear_compressed: 9.7, aaib_2001_extended: 11.4, speed_sensitivity_deg_per_5kt: 1.3 }, 'deg', 'aircraft', ['K20', 'K27', 'K19'], 'สูง', false, 'BEA F-AT110912 (2012): "+ 11,2 ° amortisseurs détendus, + 9,7° amortisseurs compressés" ตรงกับ FCOM 806/1 (11.2); AAIB 5/2001 ให้ยืด 11.4°; เลือก 11.2 (ใหม่กว่า, สองแหล่ง, ระวังกว่า); ใช้แทน A321neo จนกว่าจะพบค่า neo'),
  rotation_rate_dps: L({ nominal: 3 }, 'deg/s', 'aircraft', ['K8', 'K63'], 'กลาง', true, 'ใช้ค่า A320 กับ A321 (est)'),
  liftoff_pitch_deg: L({ typical: 9 }, 'deg', 'aircraft', ['K8', 'K19'], 'ต่ำ', true, 'ไม่พบ; ต่ำกว่าขีด 11.2° ราว 2° (est)'),
} };
// ---------------- a321ceo (inherits a321neo via topic 3; override neo-only items back to ceo values) ----------------
blocks.a321ceo = { ops: {
  gs_mini: L({ k: 1, rule: 'IAS target = VAPP + k*max(0, HW_current - HW_tower)' }, '-', 'aircraft', ['K7'], 'สูง', false, 'k = 1 สำหรับตระกูล A320ceo (รวม A321ceo); ต้อง override เพราะสายการสืบค่า a321ceo -> a321neo -> a320neo ให้ 0.33'),
  autobrake: L({ LO: 1.7, LO_delay_s: 4, MED: 3.0, MED_delay_s: 2, MAX: 'RTO only, commands ~6 m/s^2', MAX_cmd: 6.0, arm_min_speed_mps: kt(72), decel_light_fraction: 0.8, alt_LO_newer_fcom: 2.0, alt_LO_delay_s: 2 }, 'm/s^2, s', 'aircraft', ['K39', 'K65', 'K32'], 'กลาง', false, 'เท่า a320ceo (override ค่า neo ที่สืบมา)'),
} };
// ---------------- a330_300 ----------------
blocks.a330_300 = { ops: {
  speed_additive: L({ rule: 'VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5 if ice), 5, 15)', appr_cor_min_mps: kt(5), appr_cor_max_mps: kt(15) }, 'm/s', 'aircraft', ['K7', 'K35'], 'สูง', false, 'Safety First #24; A330/340 FCTM §6.30.2 ผ่าน code7700: "the higher of 5 kt or 1/3 of the tower headwind component", "increment to VLS is limited to 15 kt"'),
  gs_mini: L({ k_above_400ft: 1, k_below_400ft: 0.33, blend_s: 25 }, '-, s', 'aircraft', ['K7'], 'สูง', false, 'A330/A340: k = 1 เหนือ 400 ft ลดเป็น 0.33 ต่ำกว่า 400 ft ภายใน 25 s'),
  flare_height_m: L(ft(40), 'm (RA)', 'aircraft', ['K6'], 'สูง', false, '"40 ft (A330/A340/A350/A380)"'),
  thrust_retard: L({ manual_callout_m: ft(20), rule: 'IDLE at touchdown at the latest' }, 'm', 'aircraft', ['K6'], 'สูง', false, 'RETARD callout เป็นการเตือน'),
  tailstrike_pitch_deg: L({ gear_compressed: 10.4, gear_extended: 13.7 }, 'deg', 'aircraft', ['K21', 'K73'], 'กลาง', true, 'ค่าจากเหตุการณ์ ไม่ใช่ขีดออกแบบ: C-GHLM หางแตะที่ 10.4° ขณะโช้ค "almost fully compressed" (TSB); HB-JHC หางแตะที่ 13.7° ขณะล้อหลัก "about to lift off" (STSB ผ่าน SKYbrary)'),
  touchdown_pitch_deg: L({ typical: 5.5, range: [4, 7.5], pitch_callout: 8.5 }, 'deg', 'aircraft', ['K21'], 'ต่ำ', true, 'ไม่พบ; est'),
  rotation_rate_dps: L({ nominal: 3, to_pitch_deg: 15, early_rotation_risk: 'rotation 24 kt below VR caused tail strike' }, 'deg/s, deg', 'aircraft', ['K73', 'K21'], 'กลาง', false, 'FCOM/FCTM: "continuous rotation rate of 3 °/second up to a pitch attitude of 15°"'),
  liftoff_pitch_deg: L({ typical: 10, time_after_VR_s: [4, 5] }, 'deg, s', 'aircraft', ['K73'], 'กลาง', false, '"4 to 5 seconds after VR reaches a pitch angle of approximately 10°" (FCTM ผู้ให้บริการผ่าน SKYbrary)'),
  initial_climb_pitch_deg: L(15, 'deg', 'aircraft', ['K73'], 'กลาง', false, 'หมุนถึง 15° แล้วตาม SRS'),
  autobrake: L({ LO: 1.7, MED: 3.0, MAX: 'RTO' }, 'm/s^2', 'aircraft', ['K39'], 'ต่ำ', true, 'ไม่พบของ A330; ใช้ค่า A320 (est)'),
  reverse: L({ max_reverse_until_mps: kt(70) }, 'm/s', 'aircraft', ['K43'], 'ต่ำ', true, 'ค่า A320 ใช้แทน (est)'),
  crosswind_limits: L({ demonstrated_mps: null, contaminated: 'common_airliner table' }, 'm/s', 'aircraft', ['K4'], 'ต่ำ', false, 'ค่าสาธิตของ A330-300 ไม่พบในแหล่งสาธารณะที่อ่านได้'),
} };
// ---------------- atr72_600 ----------------
blocks.atr72_600 = { ops: {
  speed_additive: L({ rule: 'VAPP = max(VmHB30 + WF, VMCL); WF = min(15, max(HW/3, gust))', max_mps: kt(15) }, 'm/s', 'aircraft', ['K40', 'K41'], 'กลาง', false, 'ผ่านหัวข้อ 1 [R16][R17]'),
  approach_pitch_deg: L({ range: [-2.5, 1.0], excess_energy_below: -2.5 }, 'deg', 'aircraft', ['K22'], 'สูง', false, '"between 2.5° nose down and 1° nose up" (FCTM ผ่าน BEA)'),
  approach_thrust: L({ torque_pct_3deg: 25, torque_pct_per_deg_slope: 5, torque_pct_3p8deg: 20, observed_torque_pct: 22 }, '% torque', 'aircraft', ['K22', 'K23'], 'สูง', false, 'BEA F-OZKN §3.1; ATSB VH-FVZ'),
  flare_height_m: L(ft(20), 'm', 'aircraft', ['K22', 'K23'], 'สูง', false, '"starting the flare at a height of 20 ft by completely reducing power"; FCOM: flight idle ที่ 20 ft'),
  thrust_retard: L({ to: 'FLIGHT IDLE', height_m: ft(20), early_retard_risk: 'idle at 100 ft -> excessive sink' }, 'm', 'aircraft', ['K23', 'K22'], 'สูง', false, 'VH-FVZ ลดเป็น FI ที่ 118 ft แล้วแตะพื้น 928 fpm'),
  touchdown_pitch_deg: L({ typical: 4.0, range: [2.0, 5.5] }, 'deg', 'aircraft', ['K22', 'K23'], 'ต่ำ', true, 'ต้องต่ำกว่าขีดยุบ 5.9°; เหตุการณ์ hard landing แตะที่ 6°'),
  touchdown_speed_rel_mps: L([kt(-10), kt(-5)], 'm/s relative to VAPP', 'aircraft', ['K40'], 'กลาง', false, 'แตะพื้นช้ากว่า VAPP 5–10 kt (หัวข้อ 1 [R9][R16])'),
  tailstrike_pitch_deg: L({ gear_extended: 8.0, gear_compressed: 5.9, tail_skid_contact: 8.0 }, 'deg', 'aircraft', ['K22', 'K23'], 'สูง', false, 'BEA: "between 5.9° when the main landing gear is compressed and 8°"; ATSB: skid กันลำตัวที่ ≥ 8°'),
  crosswind_limits: L({ demonstrated_mps: kt(35), autopilot_mps: kt(17) }, 'm/s', 'aircraft', ['K50'], 'ต่ำ', false, 'บัตรทบทวนออนไลน์ (หัวข้อ 1 [R21])'),
  autobrake: L(null, '-', 'aircraft', ['K40'], 'กลาง', false, 'ATR 72-600 ไม่มี autobrake (FCOM ใช้ max braking ด้วยแป้น)'),
  reverse: L({ use: 'reverse from touchdown, ground idle below ~40 kt', ground_idle_speed_mps: kt(40) }, 'm/s', 'aircraft', ['K40'], 'กลาง', false, 'ผ่านหัวข้อ 1 [R16]'),
  hard_landing: L({ gear_design_sink_mps: r(600 * FPM), gear_reserve_sink_mps: r(720 * FPM), score_flag_nz_est: 2.0, event_VH_FVZ: { sink_mps: r(928 * FPM), nz_g: 2.97 }, event_F_OZKN_nz: 2.2 }, 'm/s, g', 'aircraft', ['K23', 'K22'], 'กลาง', true, 'ATSB AO-2017-111 p.7: ล้อออกแบบรับ 600 fpm ที่ MLW สำรองถึง 720 fpm; เกณฑ์ nz ของ ATR AMM ไม่พบ (2.0 g = est)'),
  stabilised_criteria: L({ speed_rel_target_mps: [kt(-5), kt(10)], vs_max_mps: r(1000 * FPM) }, 'm/s', 'aircraft', ['K23', 'K22'], 'สูง', false, 'ผู้ให้บริการใน ATSB และ BEA'),
} };
// ---------------- validate and emit ----------------
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
let leaves = 0, bad = 0, md = '';
function walk(o, path) {
  if (o && typeof o === 'object' && 'v' in o && 'u' in o && 'scope' in o) {
    leaves++; const ks = Object.keys(o);
    if (ks.length !== 7 || !KEYS.every((k) => ks.includes(k))) { bad++; console.log('bad keys', path); }
    if (!Array.isArray(o.src) || !o.src.length) { bad++; console.log('bad src', path); }
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) { bad++; console.log('bad conf', path); }
    return;
  }
  for (const k of Object.keys(o)) walk(o[k], path + '.' + k);
}
for (const [type, body] of Object.entries(blocks)) {
  const block = { [type]: body };
  const txt = JSON.stringify(block);
  JSON.parse(txt);
  walk(body, type);
  // one leaf per line for readability
  const lines = [`{"${type}": {"ops": {`];
  const ent = Object.entries(body.ops);
  ent.forEach(([k, v], i) => lines.push(`   "${k}": ${JSON.stringify(v)}${i < ent.length - 1 ? ',' : ''}`));
  lines.push('}}}');
  const pretty = lines.join('\n');
  JSON.parse(pretty);
  md += '```json\n' + pretty + '\n```\n\n';
}
writeFileSync(new URL('./k_json_out.md', import.meta.url), md);
console.log(`blocks ${Object.keys(blocks).length}, leaves ${leaves}, bad ${bad}, md bytes ${Buffer.byteLength(md)}`);
