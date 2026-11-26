// o_json.mjs — builds and validates the JSON blocks of หัวข้อ 3.9 (topic 3.9, prefix O).
// Output: o_json_out.md (markdown with one ```json block per top-level key). Run: node o_json.mjs
import { writeFileSync } from 'node:fs';
const FT = 0.3048, KT = 1852 / 3600;
const m = (ft) => Number((ft * FT).toFixed(3));
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const A = 'aircraft', S = 'sim', E = 'environment';

const b737 = { b737_800: { afcs: {
  modes: L({ ap: ['CMD A', 'CMD B', 'CWS A', 'CWS B'], lateral: ['HDG SEL', 'LNAV', 'VOR/LOC', 'APP(LOC+G/S)', 'TO/GA', 'ROLLOUT(option)'],
    vertical: ['LVL CHG', 'V/S', 'VNAV SPD', 'VNAV PTH', 'ALT HOLD', 'ALT ACQ', 'G/S', 'FLARE', 'TO/GA'],
    autothrottle: ['N1', 'MCP SPD', 'FMC SPD', 'RETARD', 'ARM', 'THR HLD', 'GA'], annunciation: ['1 CH', 'LAND 2', 'LAND 3', 'NO AUTOLAND'] },
    '-', A, ['O19', 'O20', 'O23'], 'กลาง', false, 'ชื่อตาม FMA ที่สรุปจาก FCOM; ROLLOUT และ LAND 2/3 เฉพาะเครื่องที่มี rollout guidance'),
  arm_engage: {
    AP_takeoff_min: L(m(400), 'm', A, ['O20'], 'กลาง', false, '400 ft AGL'),
    AP_single_channel_min: L(m(50), 'm', A, ['O20'], 'กลาง', false, '50 ft AGL ระหว่าง approach (1 CH)'),
    LOC_capture_dot: L(0.5, 'dot', A, ['O19'], 'กลาง', false, 'capture ไม่ช้ากว่า 1/2 dot'),
    GS_capture_dot: L(0.4, 'dot', A, ['O19'], 'กลาง', false, '2/5 dot; ไม่ capture ก่อน LOC'),
    THR_HLD_kt: L(84 * KT, 'm/s', A, ['O19'], 'กลาง', false, '84 kt (43.2 m/s) หรือ 64 kt (32.9 m/s) ตามรุ่นคอมพิวเตอร์ A/T; NG ค้างถึง 800 ft RA'),
    TOGA_FD_pitch: L({ takeoff_initial: -10, takeoff_after_60kt: 15, GA_AP: 15, GA_FD_one_engine: 13 }, 'deg', A, ['O19'], 'กลาง', false, 'F/D 10° nose down เริ่ม, 15° nose up ที่ 60 kt IAS'),
    GA_arm_RA: L(m(2000), 'm', A, ['O19'], 'กลาง', false, 'A/T GA armed ต่ำกว่า 2000 ft RA'),
    N1_equalization_max_deg: L(8, 'deg', A, ['O19'], 'กลาง', false, 'thrust lever split สูงสุด; ปลด A/T ถ้าเกิน 10° ใน dual channel หลัง FLARE armed'),
  },
  autoland: {
    FLARE_ARM_ft: L(m(1500), 'm', A, ['O19'], 'กลาง', false, '1500 ft RA: AP2 engage หลัง LOC+G/S capture และ FLARE armed'),
    DUAL_AP_by_ft: L(m(800), 'm', A, ['O19'], 'กลาง', false, '800 ft RA: ต้องมี AP สองตัว'),
    STAB_TRIM_ft: L(m(400), 'm', A, ['O19'], 'กลาง', false, '400 ft RA: stabilizer trim nose up (NG เพิ่มอีกที่ 50 ft)'),
    FLARE_NOT_ARMED_DISC_ft: L(m(350), 'm', A, ['O19'], 'กลาง', false, 'ราว 350 ft RA: FLARE ไม่ armed → AP ทั้งสองปลด'),
    FLARE_ft: L(m(50), 'm', A, ['O19'], 'กลาง', false, 'ราว 50 ft RA'),
    RETARD_ft: L(m(27), 'm', A, ['O19', 'O16'], 'สูง', false, '27 ft RA (DSB TK1951: radio height < 27 ft เป็นเงื่อนไข retard flare)'),
    RETARD_after_flare_s: L(2.5, 's', A, ['O19'], 'กลาง', false, 'RETARD 2.5 s หลัง FLARE engage หรือที่ 27 ft อย่างใดก่อน'),
    AT_disc_after_TD_s: L(2, 's', A, ['O19'], 'กลาง', false, 'A/T ปลดราว 2 s หลังแตะพื้น'),
    ROLLOUT: L('option', '-', A, ['O19', 'O23'], 'ต่ำ', false, 'ไม่มี rollout: AP ต้องปลดด้วยมือหลังแตะพื้น; มี rollout: LAND 3 ใช้ LOC บนพื้น (ความสูง engage ไม่พบ)'),
    ALIGN_ft: L(m(20), 'm', A, ['O30'], 'ต่ำ', true, 'ไม่พบของ 737; ใช้ 20 ft ตาม A320 (ค่าประมาณ)'),
    AP_disc_min_ft: L(m(50), 'm', A, ['O20'], 'กลาง', false, 'single channel ห้ามต่ำกว่า 50 ft; dual channel ลงถึงพื้น'),
  },
  capability: {
    certified: L('Cat 3', '-', A, ['O22'], 'สูง', false, 'EASA TCDS IM.A.120 all weather capability'),
    DH_min: L({ LAND2_fail_passive: m(50), LAND3_fail_operational: 0 }, 'm', A, ['O23'], 'ต่ำ', false, 'LAND 2 DH 50 ft; LAND 3 ไม่มี DH (ตามผู้ประกอบการหนึ่งราย)'),
    RVR_min: L({ LAND2: 125, LAND3: 75 }, 'm', A, ['O23', 'O7'], 'ต่ำ', false, 'LAND 2 125/75/75 m; LAND 3 75 m'),
    AH: L(m(100), 'm', A, ['O8'], 'ต่ำ', true, 'ไม่พบของ 737; ใช้ค่าทั่วไป "100 ft or less" (ค่าประมาณ)'),
    autoland_wind_limits: L({ headwind: 25 * KT, crosswind: 20 * KT, tailwind: 15 * KT }, 'm/s', A, ['O21', 'O20'], 'กลาง', false, 'HW 25 kt, XW 20 kt ตาม FCOM MALEV (b737.org.uk ให้ 25 kt), TW 0 ถึง 15 kt ตามความสูงสนามและแฟลป'),
    autoland_gs_deg: L({ min: 2.5, max: 3.25 }, 'deg', A, ['O20'], 'กลาง', false, 'มุม GS'),
    autoland_config: L({ flaps: ['30', '40'], engines: 'both' }, '-', A, ['O20'], 'กลาง', false, 'flaps 30 หรือ 40 และเครื่องยนต์ทำงานทั้งสอง'),
  },
  laws: {
    flare: L({ type: 'exp_hB', h_flare: m(50), h_B: m(12), tau_rule: 'tau=(h_flare+h_B)/(V_G*tan(gs))', tau_at_142kt: 4.93, sink_TD: 0.743 }, 'm, s, m/s', A, ['O13', 'O19'], 'ต่ำ', true, 'hdot_cmd=-(h+h_B)/tau; V_G·tau คงที่ตามสิทธิบัตร 4,354,237; h_flare 50 ft จาก FCOM summary'),
    retard: L({ h: m(27), dt_after_flare: 2.5, ramp: 'idle at predicted touchdown t_go=tau*ln((h+h_B)/h_B)' }, 'm, s', A, ['O19', 'O16'], 'กลาง', true, 'สูตร ramp เป็นค่าประมาณ'),
    athr_speed: L({ Kp_Tmax_per_kt: 0.0317, Ki_Tmax_per_kt_s: 0.00297, omega: 0.15, zeta: 0.8 }, '1/kt, 1/(kt s), rad/s, -', A, ['O40'], 'ต่ำ', true, 'pole placement m=60 t, Tmax 234 kN class, engine lag 1.5 s (o_athr.mjs)'),
  },
} } };

const a320 = { a320ceo: { afcs: {
  modes: L({ lateral: ['RWY', 'RWY TRK', 'NAV', 'HDG', 'TRK', 'LOC*', 'LOC', 'LAND', 'FLARE', 'ROLL OUT', 'GA TRK'],
    vertical: ['SRS', 'CLB', 'DES', 'OP CLB', 'OP DES', 'ALT*', 'ALT', 'ALT CST*', 'ALT CST', 'V/S', 'FPA', 'G/S*', 'G/S', 'FINAL APP', 'LAND', 'FLARE', 'ROLL OUT', 'EXP', 'TCAS'],
    athr: ['SPEED', 'MACH', 'THR CLB', 'THR IDLE', 'THR LVR', 'THR MCT', 'MAN TOGA', 'MAN FLX', 'MAN MCT', 'MAN THR', 'A.FLOOR', 'TOGA LK'], athr_messages: ['THR LK', 'LVR CLB', 'LVR MCT', 'LVR ASYM'],
    capability_fma: ['CAT 1', 'CAT 2', 'CAT 3 SINGLE', 'CAT 3 DUAL'] }, '-', A, ['O31', 'O32', 'O28'], 'กลาง', false, 'ชื่อตามเอกสาร/enum ของ FlyByWire A32NX v0.10.0 (GPL-3.0) ที่จำลอง FMA'),
  arm_engage: {
    AP_takeoff_min: L({ h: m(100), t_after_liftoff_s: 5 }, 'm, s', A, ['O28', 'O32'], 'กลาง', false, '100 ft AGL และอย่างน้อย 5 s หลัง liftoff'),
    MUH: L({ ILS_CAT1: m(160), FINAL_APP_VS_FPA: m(250), circling_C: m(500), circling_D: m(600), after_manual_GA: m(100), other: m(500) }, 'm', A, ['O28'], 'กลาง', false, '160/250/500/600/100/500 ft AGL'),
    NAV_min_RA: L(m(30), 'm', A, ['O32'], 'ต่ำ', false, 'NAV engage ได้ที่ RA ≥ 30 ft (โมเดล FBW)'),
    LOC_star_deg: L(1.92, 'deg', S, ['O32'], 'ต่ำ', true, 'FBW: |e_LOC| < 1.92° (2.56 dot บน 21R)'),
    LOC_track_deg: L(0.16, 'deg', S, ['O32'], 'ต่ำ', true, 'FBW: |e_LOC| < 0.16° ต่อเนื่อง'),
    GS_star_deg: L(0.1333, 'deg', S, ['O32'], 'ต่ำ', true, 'FBW: |e_GS| < 0.1333° หลัง LOC*/LOC'),
  },
  autoland: {
    LAND_ft: L(m(400), 'm', A, ['O26', 'O32'], 'กลาง', false, 'LAND เมื่อ LOC และ G/S engaged และ RA < 400 ft (FBW รอ 1.2 s)'),
    LAND_must_by_ft: L(m(350), 'm', A, ['O30'], 'กลาง', false, 'FMA ต้องแสดง LAND ก่อน 350 ft'),
    AUTOLAND_warning_below_ft: L(m(200), 'm', A, ['O30'], 'กลาง', false, 'ใต้ 200 ft: LOC > 1/4 dot (เหนือ 15 ft), GS > 1 dot (เหนือ 100 ft), RA ต่าง > 15 ft, สูญ LOC/GS'),
    FLARE_ft: L({ nominal: m(40), rule: 'h = clamp(|VS fpm|/15, 45, 60) ft', at_709fpm: m(47.3) }, 'm', A, ['O30', 'O32'], 'กลาง', true, 'FMA ราว 40 ft; สูตรของโมเดล FBW (time-to-go 4 s)'),
    RETARD_ft: L({ thrust_idle: m(30), callout_autoland: m(10), callout_manual: m(20) }, 'm', A, ['O30', 'O25', 'O24'], 'กลาง', false, 'thrust idle ราว 30 ft; เสียง RETARD 10 ft (autoland) / 20 ft (manual)'),
    ALIGN_ft: L({ start: m(20), end: m(10) }, 'm', A, ['O30'], 'กลาง', false, 'decrab ระหว่างราว 20 ถึง 10 ft'),
    ROLLOUT: L('main gear touchdown', '-', A, ['O26', 'O30'], 'กลาง', false, 'ROLL OUT ตาม LOC บนพื้น; ปลด AP ที่ taxi speed'),
    AP_disc_min_ft: L(0, 'm', A, ['O30'], 'กลาง', false, 'CAT 3 DUAL ลงถึงพื้น; CAT II takeover "at or above 80 ft" (24.4 m)'),
  },
  capability: {
    certified: L(['CAT 2', 'CAT 3 SINGLE', 'CAT 3 DUAL'], '-', A, ['O28', 'O24'], 'กลาง', false, 'Airbus ทุกแบบรับรอง autoland'),
    DH_min: L({ CAT2: m(100), CAT3_SINGLE: m(50), CAT3_DUAL: m(20), CAT3_DUAL_noDH: 0 }, 'm', A, ['O28', 'O30'], 'กลาง', false, '100/50/20 ft หรือไม่มี DH'),
    AH: L(m(100), 'm', A, ['O28', 'O27'], 'กลาง', false, 'CAT 3 DUAL alert height 100 ft'),
    RVR_min: L({ CAT3_DUAL_noDH: 75 }, 'm', A, ['O28', 'O30'], 'กลาง', false, 'RVR 75 m'),
    autoland_wind_limits: L({ headwind: 30 * KT, crosswind: 20 * KT, tailwind: 10 * KT }, 'm/s', A, ['O28', 'O30'], 'กลาง', false, 'HW 30, XW 20, TW 10 kt; เกิน → CAT I approach ไม่มี autoland'),
    autoland_gs_deg: L({ min: 2.5, max: 3.15 }, 'deg', A, ['O28', 'O30'], 'กลาง', false, 'FBW docs ให้ 3.25°'),
    autoland_misc: L({ airport_elev_max: m(9200), pressure_alt_min: m(-1000), weight: '<= MLW' }, 'm', A, ['O28', 'O30'], 'กลาง', false, '≤ 9200 ft (บางทะเบียน 2500 ft); ไม่ต่ำกว่า −1000 ft PA; FBW docs: ≥ 44 000 kg'),
  },
  laws: {
    flare: L({ type: 'exp_offset', h_flare_rule: 'clamp(4 s * |hdot|, 13.72 m, 18.29 m)', tau_rule: 'tau=h_F/(|hdot_F|-0.762)', sink_TD: 0.762, tau_at_133kt: 5.07 }, 'm, s, m/s', A, ['O32', 'O30'], 'ต่ำ', true, 'hdot_cmd = -h/tau - 0.762 m/s (FBW AutopilotLaws.cpp บรรทัด 2139-2150)'),
    retard: L({ h_idle: m(30), h_callout: m(10), fbw_request_h: m(40) }, 'm', A, ['O30', 'O24', 'O32'], 'กลาง', true, 'โมเดล FBW ขอ RETARD ที่ ≤ 40 ft; เลือก 30 ft ตามคำอธิบาย FMA'),
    athr_speed: L({ Kp_Tmax_per_kt: 0.0332, Ki_Tmax_per_kt_s: 0.00311, omega: 0.15, zeta: 0.8 }, '1/kt, 1/(kt s), rad/s, -', A, ['O40'], 'ต่ำ', true, 'pole placement m=64.5 t, Tmax 240 kN class (o_athr.mjs)'),
  },
} } };

const a330 = { a330_300: { afcs: {
  modes: L('as a320ceo', '-', A, ['O24', 'O29'], 'ต่ำ', true, 'ใช้ชุดโหมดเดียวกับ A320 (FMGS ตระกูลเดียวกัน); A330/A340 แสดง ALIGN/RETARD ที่ 30 ft'),
  arm_engage: {
    AP_takeoff_min: L({ h: m(100), t_after_liftoff_s: 5 }, 'm, s', A, ['O29'], 'ต่ำ', false, '100 ft AGL และ 5 s'),
    MUH: L({ ILS_CAT1: m(160) }, 'm', A, ['O29'], 'ต่ำ', false, 'ILS CAT 1 160 ft AGL; NPA ถึง MDA'),
  },
  autoland: {
    LAND_ft: L(m(400), 'm', A, ['O26'], 'ต่ำ', true, 'ใช้ค่า A320 (ไม่พบของ A330)'),
    FLARE_ft: L({ rule: 'as a320ceo', at_743fpm: m(49.5) }, 'm', A, ['O32'], 'ต่ำ', true, 'สูตร FBW ที่ 140 kt'),
    RETARD_ft: L({ thrust_idle: m(30), callout_autoland: m(10) }, 'm', A, ['O24', 'O30'], 'กลาง', true, 'A340: "At 30 ft, ALIGN and RETARD modes engaged"'),
    ALIGN_ft: L(m(30), 'm', A, ['O24'], 'กลาง', true, 'จาก A340-500 (Safety First 12)'),
    ROLLOUT: L('main gear touchdown', '-', A, ['O24'], 'กลาง', true, 'automatic rollout'),
  },
  capability: {
    certified: L(['CAT 2', 'CAT 3 SINGLE', 'CAT 3 DUAL'], '-', A, ['O24', 'O29'], 'ต่ำ', false, ''),
    DH_min: L({ CAT3_SINGLE: m(50), CAT3_DUAL: m(20) }, 'm', A, ['O29'], 'ต่ำ', false, '50 ft / 20 ft'),
    AH: L(m(200), 'm', A, ['O29', 'O27'], 'ต่ำ', false, '200 ft (บัตรทบทวน + ความเห็นนักบิน)'),
    RVR_min: L({ CAT3_DUAL: 75 }, 'm', A, ['O29'], 'ต่ำ', false, '75 m'),
    autoland_wind_limits: L({ headwind: 35 * KT, crosswind: 20 * KT, tailwind: 10 * KT }, 'm/s', A, ['O29'], 'ต่ำ', false, 'HW 35, XW 20, TW 10 kt'),
    autoland_gs_deg: L({ min: 2.5, max: 3.25 }, 'deg', A, ['O29'], 'ต่ำ', false, ''),
    engine_out: L('CAT 2 and CAT 3 SINGLE in CONF 3', '-', A, ['O29'], 'ต่ำ', false, ''),
  },
  laws: {
    flare: L({ type: 'as a320ceo', tau_at_140kt: 5.2, sink_TD: 0.762 }, 's, m/s', A, ['O32'], 'ต่ำ', true, 'ใช้กฎ A320'),
    athr_speed: L({ Kp_Tmax_per_kt: 0.0361, Ki_Tmax_per_kt_s: 0.00339, omega: 0.15, zeta: 0.8 }, '1/kt, 1/(kt s), rad/s, -', A, ['O40'], 'ต่ำ', true, 'pole placement m=185 t, Tmax 633 kN class'),
  },
} } };

const atr = { atr72_600: { afcs: {
  modes: L({ lateral: ['HDG SEL', 'HDG HOLD', 'NAV', 'LOC', 'APP'], vertical: ['IAS', 'VS', 'PITCH HOLD', 'ALT SEL', 'ALT', 'G/S', 'VNAV', 'GA'], athr: [] }, '-', A, ['O33', 'O34'], 'กลาง', false, 'ไม่มี autothrottle; VNAV coupled ตั้งแต่ Standard 2 (2014)'),
  arm_engage: {
    AP_on_ground: L(false, '-', A, ['O33'], 'กลาง', false, 'AP และ YD engage บนพื้นไม่ได้'),
    AP_after_liftoff_s: L(12, 's', A, ['O33'], 'กลาง', false, '12 s หลัง liftoff (ราว 400 ft AGL)'),
  },
  autoland: {
    LAND_ft: L(null, 'm', A, ['O33'], 'กลาง', false, 'ไม่มี autoland/FLARE mode'),
    AP_disc_min_ft: L(m(100), 'm', A, ['O33', 'O7'], 'ต่ำ', true, 'ปลด AP ที่ DH CAT II (≥ 100 ft); ข้อความ FCOM ที่สรุปได้มี "80 ft RA" ซึ่งยืนยันไม่ได้'),
  },
  capability: {
    certified: L(['CAT 2 (AP + FD)'], '-', A, ['O33'], 'กลาง', false, 'CAT 2 approaches are flown with AP + FD ON'),
    cat2_wind_demonstrated: L({ headwind: 29 * KT, tailwind: 10 * KT, crosswind: 17 * KT }, 'm/s', A, ['O33'], 'กลาง', false, 'HW 29, TW 10, XW 17 kt'),
    LPV_min: L(m(200), 'm', A, ['O34'], 'สูง', false, 'LPV ถึง 200 ft'),
  },
} } };

const common = { common_airliner: { afcs: {
  categories: L({ CAT_I: { DH_min: m(200), RVR_min: 550, VIS_min: 800 }, CAT_II: { DH_min: m(100), DH_max: m(200), RVR_min: 300 },
    CAT_IIIA: { DH_max: m(100), RVR_min: 175 }, CAT_IIIB: { DH_max: m(50), RVR_min: 50, RVR_max: 175 }, typeA_min: m(250) }, 'm', E, ['O7', 'O9'], 'สูง', false, 'DH 200/100/<100/<50 ft; Type A ≥ 250 ft'),
  rvr_tables: L({ CAT2_DH100_120: 300, CAT2_DH121_140: 400, CAT2_DH141_199: 450, CAT3_DH50_99: 175, CAT3_lt50_fail_passive: 125, CAT3_lt50_fail_operational: 75 }, 'm', E, ['O7'], 'สูง', false, 'EASA/ICAO; Cat D ที่ DH 100-120 ft ใช้ 350 m เว้นแต่ autoland/HUDLS'),
  fail_passive_DH_min: L(m(50), 'm', E, ['O8', 'O9'], 'สูง', false, '50 ft; ต่ำกว่านั้นต้อง fail-operational'),
  AH_typical_max: L(m(100), 'm', E, ['O8'], 'กลาง', false, '"100 ft or less" (SRVSOP); CS-AWO 312 ตามที่อ่านได้: at least 100 ft (ขัดแย้ง)'),
  cert_touchdown: L({ early: 60, late_avg: 823, late_limit: 914, lateral_outboard_gear: 21.3, sink_limit: 3.048, p_avg: 1e-6, p_limit: 1e-5, p_bank_avg_easa: 1e-8, p_bank_faa: 1e-7 }, 'm, m/s, -', E, ['O1', 'O2', 'O3'], 'สูง', false, '200 ft, 2700 ft, 3000 ft, 70 ft, 10 ft/s'),
  cert_rollout: L({ lateral_outboard_gear: 21.3, p: 1e-6, speed_above: 40 * KT, normal_dev: 8.2, p_normal: 0.05 }, 'm, m/s, -', E, ['O3', 'O1'], 'สูง', false, '70 ft ที่ > 40 kt; 27 ft ใน < 5 %'),
  ac2057a_2sigma: L({ long_total: m(1500), lat_each_side: m(27), min_from_thr: m(200), demo_wind: { headwind: 25 * KT, tailwind: 10 * KT, crosswind: 15 * KT, shear_per_100ft: 8 * KT } }, 'm, m/s', E, ['O4'], 'สูง', false, '1500 ft, 27 ft, 200 ft; HW 25, TW 10, XW 15 kt, shear 8 kt/100 ft'),
  ops_success: L({ td_min: 150, td_max: 750, speed_tol: 5 * KT, vs_max: 360 * FT / 60, bank_max_deg: 7, rollout_dev: 8 }, 'm, m/s, deg', E, ['O8', 'O7'], 'กลาง', false, '±5 kt, 360 fpm, 7°, 8 m'),
  cat2_approach: L({ p_success_below_500ft: 0.95, loc_uA_95pct: 25 }, '-, uA', E, ['O2'], 'สูง', false, 'AC 20-191 §4.2.9, §4.2.6.2.2'),
  ils_signal: L({ loc_full_DDM: 0.155, gs_full_DDM: 0.175, full_scale_uA: 150, dot_uA: 75, loc_sector_at_thr: 210, gs_width_deg: 1.4, gs_dot_deg: 0.36 }, 'DDM, uA, m, deg', E, ['O10', 'O11', 'O6'], 'สูง', true, '1 dot = 75 uA เป็นค่าคำนวณสำหรับ PFD 2 dot'),
  z_quantiles: L({ p1e5: 4.265, p1e6: 4.753, p1e7: 5.199, p1e8: 5.612 }, '-', S, ['O3'], 'สูง', true, 'คำนวณ (o_autoland.mjs)'),
  flare_reference: L({ patent_K: 0.205, patent_hB: m(12), dials_sink_mean: 0.732, dials_sink_sd: 0.213, cr3074_td_sd: 34.5, cr3074_sink_mean: 0.665 }, '1/s, m, m/s', E, ['O13', 'O14', 'O15'], 'สูง', false, 'ค่าอ้างอิงสำหรับทดสอบกฎ flare'),
  dmk: L({ ils: { '21R': 'CAT II', '21L': 'CAT I', '03L': 'CAT I', '03R': 'none' }, lvp_rvr_below: 550, lvp_ceiling_below: m(200), lvp_runway: '21R', loc_dot_deg: { '21R': 0.751, '03L': 0.749, '21L': 0.889 } }, 'm, deg', E, ['O36', 'O37'], 'กลาง', false, 'LVP: RVR < 550 m หรือ ceiling < 200 ft, ใช้ 21R เท่านั้น; dot คำนวณ (o_autoland.mjs)'),
} } };

const blocks = [b737, a320, a330, atr, common];
let md = '', leaves = 0;
const isLeaf = (o) => o && typeof o === 'object' && 'v' in o && 'u' in o && 'scope' in o && 'src' in o;
function walk(o, path) {
  if (isLeaf(o)) {
    const keys = Object.keys(o).join(',');
    if (keys !== 'v,u,scope,src,conf,est,note') throw new Error('bad leaf keys at ' + path + ': ' + keys);
    if (!Array.isArray(o.src) || !o.src.length) throw new Error('empty src at ' + path);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) throw new Error('bad conf at ' + path);
    leaves++; return;
  }
  for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
}
for (const b of blocks) {
  if (Object.keys(b).length !== 1) throw new Error('block must have one top key');
  walk(b, '');
  const txt = JSON.stringify(b, null, 1).replace(/\n {3,}(?=[^"\s{])/g, ' ');
  JSON.parse(txt);
  md += '```json\n' + compact(b) + '\n```\n\n';
}
function compact(b) {
  // one leaf per line
  const lines = [];
  function emit(o, ind, key, last) {
    const pad = ' '.repeat(ind);
    const comma = last ? '' : ',';
    if (isLeaf(o)) { lines.push(`${pad}${JSON.stringify(key)}: ${JSON.stringify(o, (k, v) => (typeof v === 'number' && !Number.isInteger(v) ? Number(v.toPrecision(5)) : v))}${comma}`); return; }
    lines.push(`${pad}${key === null ? '' : JSON.stringify(key) + ': '}{`);
    const ents = Object.entries(o);
    ents.forEach(([k, v], i) => emit(v, ind + 1, k, i === ents.length - 1));
    lines.push(`${pad}}${comma}`);
  }
  emit(b, 0, null, true);
  const s = lines.join('\n'); JSON.parse(s); return s;
}
writeFileSync(new URL('./o_json_out.md', import.meta.url), md);
console.log('blocks', blocks.length, 'leaves', leaves, 'bytes', md.length);
