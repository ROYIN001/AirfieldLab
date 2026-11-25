```json
{
 "common_light": {
  "ops": {
   "rules_of_thumb": {
    "v": {
     "fpm_per_deg_pitch": "1.77 × KTAS (≈ 2 × KIAS ตาม SOP)",
     "vs_on_3deg_fpm": "5.31 × GS kt",
     "example": {
      "65kt": 345,
      "84kt": 446,
      "100kt": 531
     }
    },
    "u": "fpm",
    "scope": "sim",
    "src": [
     "LH0",
     "LH10"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ฟิสิกส์ (T-LH-04, 05)"
   },
   "gust_additive": {
    "v": "½ gust factor",
    "u": "kt",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-20"
   },
   "roundout_start_ft": {
    "v": [
     10,
     20
    ],
    "u": "ft",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-8 เครื่องเล็กลูกสูบ; เทอร์โบพร็อปฝึก 5–10 ft [LH15]"
   },
   "hard_landing_ref": {
    "v": {
     "drop_6in_fpm": 340,
     "load_g": [
      3,
      4
     ]
    },
    "u": "fpm, g",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-35"
   },
   "control_force_limits": {
    "v": {
     "temporary_lbf": {
      "pitch_stick": 60,
      "pitch_wheel2": 75,
      "pitch_wheel1": 50,
      "roll_stick": 30,
      "roll_wheel2": 50,
      "roll_wheel1": 25,
      "yaw": 150
     },
     "prolonged_lbf": {
      "pitch": 10,
      "roll": 5,
      "yaw": 20
     }
    },
    "u": "lbf",
    "scope": "sim",
    "src": [
     "LH30"
    ],
    "conf": "สูง",
    "est": false,
    "note": "14 CFR 23.143(c) ก่อน Amdt 23-64"
   },
   "certification_xwind": {
    "v": "≥ 0.2 VS0 ที่ 90°",
    "u": "kt",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-19"
   },
   "accident_stats": {
    "v": {
     "instr_landing_2001_2010": 830,
     "share_of_landing": 0.22,
     "solo_student": 457,
     "dual": 373,
     "directional_control_share": 0.5,
     "solo_hard_or_stall": 228,
     "fatal_training_2000_2015": {
      "accidents": 240,
      "fatalities": 432,
      "loci": 129,
      "loci_share": 0.54,
      "stall_spin_of_loci": 0.81,
      "pattern_share_of_loci": 0.42,
      "takeoff_ga_share_of_loci": 0.29
     },
     "landing_accidents_per_year": {
      "2013": 58,
      "2014": 52,
      "2004_08": 95,
      "2009_12": 70
     }
    },
    "u": "count, -",
    "scope": "environment",
    "src": [
     "LH5",
     "LH6",
     "LH7"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สหรัฐฯ (NTSB ผ่าน AOPA); takeoff_ga_share_of_loci = ขึ้นบิน/ไต่และ go-around รวมกัน (อยู่ในกลุ่ม pattern 42 %); solo student 2001–2010: แตะก่อนรันเวย์ 2, overrun 8"
   },
   "accident_stats_thailand": {
    "v": {
     "public_final_reports_online": false,
     "caat_asr_2025": {
      "ato_top_categories_2021_2025": [
       "MAC",
       "SCF-NP",
       "WILD",
       "BIRD",
       "ATM"
      ],
      "ato_high_risk_2025": [
       "hard landing",
       "birdstrike with damage"
      ],
      "ato_medium_risk_2025": [
       "tailstrike",
       "taxi clearance deviation",
       "parking brake → loss of directional control",
       "bird ingestion"
      ],
      "solo_hard_landings_after_first_solo_guidance": "ลดลงชัดเจนในปี 2025",
      "ga_accidents_2025": {
       "bounced_landing_prop_strike": 1,
       "runway_excursion_overturn": 1,
       "ultralight_fatal": 1
      },
      "top_accident_categories_all_ops_2016_2025": {
       "RE": 13,
       "SCF-PP": 12,
       "ARC": 11,
       "LOC-I": 7,
       "TURB": 5
      }
     },
     "caat_asr_2022": {
      "ato_reports_change_vs_2021": 0.59,
      "ato_accidents_2022": 2,
      "ato_accident_kind": "runway excursion และ abnormal runway contact จาก unstabilised approach",
      "ato_high_risk_example": "bounced landing → runway excursion"
     },
     "aaic_cases": [
      {
       "date": "2022-04-30",
       "type": "Tecnam P2010",
       "phase": "landing (solo)",
       "sequence": "สูงกว่า glide path ข้าม threshold ราว 100 ft (30 m) แทน 50 ft → เด้งสองครั้ง → ล้อหน้าพับ → ไถลออกซ้าย",
       "injuries": 0,
       "detectors": [
        "high_on_path",
        "bounce",
        "porpoise",
        "nose_first",
        "dir_control"
       ]
      },
      {
       "date": "2016-02-24",
       "type": "Diamond DA40 D",
       "phase": "approach (training)",
       "sequence": "กำลังเครื่องลดและไม่ตอบสนองคันเร่ง → ลงฉุกเฉินนอกสนามก่อนถึงทางวิ่ง 3 NM (5.6 km)",
       "injuries": 0,
       "aaic_report": "06/2016",
       "detectors": []
      }
     ]
    },
    "u": "count, -",
    "scope": "environment",
    "src": [
     "LH34",
     "LH35",
     "LH36",
     "LH37",
     "LH38"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ไทย: ไม่พบคลังรายงานฉบับสมบูรณ์ของคณะกรรมการสอบสวนอุบัติเหตุอากาศยาน (AAIC) ที่เปิดอ่านได้ทางเว็บ [LH38]; รายงานความปลอดภัยประจำปีของ กพท. ให้ภาพรวม ATO (หน่วยฝึกที่ได้รับอนุมัติ) และ GA [LH34][LH35]; สองกรณีฝึกบินที่ AAIC สอบสวนเสร็จแล้ว มาจากฐานข้อมูล ASN ที่อ้างรายงาน AAIC [LH36][LH37] (ทุติยภูมิ); ไม่มีจำนวนชั่วโมงบินฝึกจึงคิดอัตราต่อชั่วโมงไม่ได้"
   },
   "test_standards": {
    "v": {
     "faa_private": {
      "app_kt": [
       -5,
       10
      ],
      "td_beyond_ft": 400,
      "short_td_ft": 200,
      "alt_ft": 100,
      "pattern_kt": 10,
      "hdg_deg": 10,
      "vy_kt": [
       -5,
       10
      ]
     },
     "faa_commercial": {
      "app_kt": [
       -5,
       5
      ],
      "td_beyond_ft": 200,
      "short_td_ft": 100,
      "alt_ft": 100,
      "pattern_kt": 10,
      "vy_kt": [
       -5,
       5
      ]
     },
     "afh_stabilised": {
      "app_kt": [
       -5,
       10
      ],
      "bank_max_deg": 15
     },
     "caat_lapl": {
      "app_kt": [
       -5,
       15
      ],
      "other_kt": 15,
      "alt_ft": 150
     },
     "caat_cpl": {
      "app_kt": [
       -5,
       5
      ],
      "other_kt": 10,
      "alt_ft": 100,
      "hdg_deg": 10
     },
     "easa_ppl": {
      "app_kt": [
       -5,
       15
      ],
      "other_kt": 15,
      "alt_ft": 150,
      "hdg_deg": 10
     }
    },
    "u": "kt, ft, deg",
    "scope": "sim",
    "src": [
     "LH1",
     "LH2",
     "LH3",
     "LH31",
     "LH32",
     "LH33"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ACS-6C/7B (Nov 2023); AFH p.9-6; กพท. LAPL ยก AMC1 FCL.125 (p.6-1), CPL ยก TCAR PEL Part FCL Appendix 4 (p.6-2); EASA PPL ตาม AMC1 FCL.215/FCL.235"
   }
  },
  "evaluator": {
   "levels": {
    "v": {
     "ppl": {
      "spd_hi": 10,
      "spd_lo": -5,
      "long_ft": 400
     },
     "cpl": {
      "spd_hi": 5,
      "spd_lo": -5,
      "long_ft": 200
     }
    },
    "u": "kt, ft",
    "scope": "sim",
    "src": [
     "LH2",
     "LH3",
     "LH32"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ppl = FAA Private (กพท. LAPL/EASA PPL หลวมกว่า +15)"
   },
   "gates": {
    "v": {
     "gate_hi_ft": 500,
     "gate_lo_ft": 300,
     "ifr_gate_ft": 1000,
     "speed": "Vapp −5/+10 (cpl ±5)",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "path_dots": 1,
     "config": "แฟลปลงจอด + ล้อลง"
    },
    "u": "ft, kt, fpm, deg, dots",
    "scope": "sim",
    "src": [
     "LH1",
     "LH2",
     "R1:V19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แทน gate 500/200 ft ของวันนี้"
   },
   "thresholds": {
    "v": {
     "gate_hi_ft": 500,
     "gate_lo_ft": 300,
     "spd_lo": -5,
     "spd_hi_ppl": 10,
     "spd_hi_cpl": 5,
     "sink_max_fpm": 1000,
     "sink_low_fpm": 800,
     "sink_low_ft": 300,
     "bank_final_deg": 15,
     "dots": 1,
     "dots_hold_s": 5,
     "slow_hold_s": 3,
     "fast_hold_s": 5,
     "stall_margin_kt": 5,
     "skid_beta_deg": 5,
     "skid_bank_deg": 10,
     "skid_below_ft": 1000,
     "flare_high_ft": 6,
     "flare_hold_s": 1.5,
     "late_flare_ft": 5,
     "late_flare_frac": 0.75,
     "late_flare_td": 300,
     "balloon_ft": 3,
     "bounce_ft": 1,
     "bounce_s": 0.3,
     "bounce_big_ft": 5,
     "hard_fpm": 360,
     "very_hard_fpm": 600,
     "crab_td_deg": 5,
     "drift_td_ms": 1.6,
     "cl_minor_m": 5,
     "cl_major_m": 10,
     "long_ppl_ft": 400,
     "long_cpl_ft": 200,
     "float_s": 6,
     "float_ft": 3,
     "dir_hdg_deg": 10,
     "dir_latv_ms": 2,
     "dir_min_gs": 10,
     "ail_rollout_gs": 20,
     "ail_xw_kt": 5,
     "brake_hi_frac": 0.8,
     "carb_thr": 0.35,
     "carb_s": 10,
     "mixture_rich": 0.9,
     "mixture_ft": 1000,
     "trim_de_deg": 3,
     "trim_s": 10,
     "trim_below_ft": 1000,
     "ga_pitch_lead_s": 2,
     "ga_pitch_deg": 5,
     "ga_full_thr": 0.9,
     "ga_flap_s": 3,
     "ga_flap_ft": 300,
     "ga_late_ft": 100,
     "rot_early_kt": 5,
     "rot_pitch_deg": 3,
     "vy_lo": -5,
     "vy_hi": 10,
     "vy_from_ft": 200,
     "vy_to_ft": 700,
     "gear_ft": 500
    },
    "u": "ft, kt, fpm, deg, s, m",
    "scope": "sim",
    "src": [
     "LH0",
     "LH1",
     "LH2",
     "LH3",
     "LH13",
     "LH15",
     "LH30",
     "R1:V19"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางตัว (ดูคอมเมนต์ใน lh_eval.mjs ว่าตัวไหนมาจากแหล่ง ตัวไหนตั้งเอง)"
   },
   "rules": {
    "v": {
     "unstable_500": {
      "phase": "final",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "ยังไม่ stabilised ที่ 500 ft: ตรวจความเร็ว อัตราร่อน แนว glide path และแฟลปให้ครบก่อนถึงจุดนี้"
     },
     "unstable_300": {
      "phase": "final",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH1"
      ],
      "th": "ต่ำกว่า 300 ft แล้วยังไม่ stabilised ควร go-around ทันที"
     },
     "continued_unstable": {
      "phase": "landing",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LH1"
      ],
      "th": "ลงจอดต่อทั้งที่ approach ไม่ stabilised ต่ำกว่า 300 ft ครั้งหน้าให้ go-around"
     },
     "high_on_path": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "R1:V19",
       "LH1"
      ],
      "th": "สูงกว่า glide path เกิน 1 dot ลดกำลังเล็กน้อยแล้วรักษาความเร็ว อย่าดันหัวลงแรง"
     },
     "low_on_path": {
      "phase": "final",
      "sev": "major",
      "pts": 6,
      "src": [
       "R1:V19",
       "LH1"
      ],
      "th": "ต่ำกว่า glide path เกิน 1 dot เพิ่มกำลังพร้อมยกหัวเล็กน้อย อย่าเก็บแฟลป"
     },
     "fast": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH2",
       "LH3"
      ],
      "th": "ความเร็ว approach สูงเกินเกณฑ์ ระวังลอยเลยจุดแตะ"
     },
     "slow": {
      "phase": "final",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH2",
       "LH1"
      ],
      "th": "ความเร็ว approach ต่ำกว่าเกณฑ์ เพิ่มกำลังทันที"
     },
     "near_stall": {
      "phase": "any",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LM3",
       "LH4"
      ],
      "th": "ใกล้ stall ที่ความสูงต่ำ ลดมุมปะทะ เพิ่มกำลังเต็ม แล้วไต่"
     },
     "sink_high": {
      "phase": "final",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1"
      ],
      "th": "อัตราร่อนสูงเกินไป ลดอัตราร่อนก่อนเข้าใกล้พื้น"
     },
     "bank_final": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "มุมเอียงบน final เกิน 15° ปรับแนวให้เสร็จเร็วกว่านี้"
     },
     "skid_turn": {
      "phase": "base",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1",
       "LH6"
      ],
      "th": "เลี้ยวแบบ cross-control ใกล้พื้น (ball ไม่อยู่กลาง) เสี่ยง stall/spin ใช้ rudder ให้ประสาน"
     },
     "stall_warning": {
      "phase": "any",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH4",
       "LH2"
      ],
      "th": "สัญญาณเตือน stall ดัง ลดมุมปะทะทันที"
     },
     "high_flare": {
      "phase": "flare",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "flare สูงเกินไป เครื่องลอยอยู่เหนือพื้นแล้วความเร็วลด ระวังตก"
     },
     "late_flare": {
      "phase": "flare",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1",
       "LH5"
      ],
      "th": "flare ช้าเกินไปหรือไม่ได้ flare ทำให้กระแทก เริ่มดึงคันที่ 10–20 ft"
     },
     "balloon": {
      "phase": "flare",
      "sev": "minor",
      "pts": 4,
      "src": [
       "LH1"
      ],
      "th": "ดึงคันเร็วเกินไปจนเครื่องลอยขึ้น (balloon) ค้าง attitude และเติมกำลังเล็กน้อย"
     },
     "float": {
      "phase": "flare",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "ลอยนานเกินไป ความเร็วตอนข้าม threshold สูงเกิน"
     },
     "bounce": {
      "phase": "landing",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1"
      ],
      "th": "เครื่องเด้งหลังแตะพื้น ถ้าเด้งสูงให้ go-around กำลังเต็ม"
     },
     "bounce_big": {
      "phase": "landing",
      "sev": "critical",
      "pts": 20,
      "src": [
       "LH1"
      ],
      "th": "เด้งสูงเกิน 5 ft ต้อง go-around ไม่ใช่พยายามลงต่อ"
     },
     "porpoise": {
      "phase": "landing",
      "sev": "critical",
      "pts": 20,
      "src": [
       "LH1"
      ],
      "th": "porpoising: ล้อหน้าแตะก่อนแล้วเด้งซ้ำ ตั้ง attitude ลงจอดหรือ go-around"
     },
     "nose_first": {
      "phase": "landing",
      "sev": "major",
      "pts": 5,
      "src": [
       "LH1",
       "R1:V19"
      ],
      "th": "ล้อหน้าแตะก่อนล้อหลัก ยกหัวให้ถึง attitude ลงจอด"
     },
     "hard_landing": {
      "phase": "landing",
      "sev": "major",
      "pts": 0,
      "src": [
       "LH1",
       "R1:V19"
      ],
      "th": "แตะพื้นแรง (อัตราจมเกิน 360 fpm) flare ให้ต่อเนื่องจนล้อแตะ"
     },
     "very_hard_landing": {
      "phase": "landing",
      "sev": "critical",
      "pts": 0,
      "src": [
       "R1:V19"
      ],
      "th": "แตะพื้นแรงมาก (เกิน 600 fpm) ต้องตรวจโครงสร้างเครื่อง"
     },
     "side_load": {
      "phase": "landing",
      "sev": "major",
      "pts": 5,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "แตะพื้นขณะยังมี crab หรือ drift ใช้ wing-low ให้หัวตรงกับรันเวย์"
     },
     "off_centre": {
      "phase": "landing",
      "sev": "minor",
      "pts": 0,
      "src": [
       "R1:V19"
      ],
      "th": "แตะพื้นห่างเส้นกลางรันเวย์"
     },
     "short_landing": {
      "phase": "landing",
      "sev": "critical",
      "pts": 0,
      "src": [
       "LH5",
       "R1:V19"
      ],
      "th": "แตะพื้นก่อน threshold"
     },
     "long_landing": {
      "phase": "landing",
      "sev": "major",
      "pts": 0,
      "src": [
       "LH2",
       "LH3"
      ],
      "th": "แตะพื้นเลยจุดเป้าเกินเกณฑ์สอบ ถ้าลอยนานควร go-around"
     },
     "dir_control": {
      "phase": "rollout",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH5",
       "LH1"
      ],
      "th": "เสียการควบคุมทิศทางขณะวิ่ง ใช้ rudder ให้ทันและมองไปปลายรันเวย์"
     },
     "excursion": {
      "phase": "rollout",
      "sev": "critical",
      "pts": 0,
      "src": [
       "R1:V19"
      ],
      "th": "ออกนอกรันเวย์"
     },
     "aileron_rollout": {
      "phase": "rollout",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH1",
       "LH15"
      ],
      "th": "ขณะวิ่งในลมขวาง ให้หมุนพวงมาลัย/คันไปทางลม"
     },
     "brake_fast": {
      "phase": "rollout",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH15",
       "LH1"
      ],
      "th": "เบรกแรงขณะยังเร็ว ให้ล้อรับน้ำหนักก่อน"
     },
     "carb_heat": {
      "phase": "downwind",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH13",
       "LH1"
      ],
      "th": "ลดกำลังโดยไม่ดึง carb heat"
     },
     "carb_heat_ga": {
      "phase": "go_around",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "go-around แล้วยังไม่ดัน carb heat กลับ"
     },
     "mixture": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH13"
      ],
      "th": "mixture ยังไม่ rich ระหว่าง approach"
     },
     "trim": {
      "phase": "final",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH1",
       "LH30"
      ],
      "th": "ยังถือแรงที่คันนานเกินไป trim ให้แรงหมด"
     },
     "gear_up": {
      "phase": "final",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LH29"
      ],
      "th": "ล้อยังไม่ลงที่ 500 ft"
     },
     "ga_late": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "ตัดสินใจ go-around ช้าเกินไป"
     },
     "ga_pitch_first": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "ยกหัวก่อนเพิ่มกำลัง: เพิ่มกำลังเต็มก่อนแล้วจึงตั้ง attitude"
     },
     "ga_flaps_dump": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "เก็บแฟลปทีเดียวหมดขณะต่ำ เครื่องจะจม ให้เก็บเป็นขั้น"
     },
     "ga_no_climb": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "go-around แล้วยังไม่ไต่ภายใน 5 วินาที"
     },
     "rotate_early": {
      "phase": "takeoff",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH11"
      ],
      "th": "ยกหัวก่อนถึง VR"
     },
     "vy_hold": {
      "phase": "climb",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH2"
      ],
      "th": "ความเร็วไต่หลุดเกณฑ์ Vy +10/−5 kt"
     }
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "LH1",
     "LH2",
     "LH5",
     "LH6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ระดับและคะแนนหักเป็นค่าประมาณของหัวข้อนี้; ข้อความไทยเขียนใหม่ทั้งหมด"
   },
   "scoring": {
    "v": {
     "touchdown": {
      "sink": 40,
      "pos": 25,
      "cl": 15,
      "spd": 10,
      "att": 10
     },
     "pos_full_m": [
      "aim − 30",
      "aim + 122 (ppl) / + 61 (cpl)"
     ],
     "pos_partial_m": {
      "10": "aim + 400",
      "18": "aim + 250"
     },
     "spd": "ias ที่ 50 ft ใน Vapp −5/+10 (cpl ±5) และแตะ ≤ Vapp − 5",
     "deduction_by_sev": {
      "minor": [
       2,
       4
      ],
      "major": [
       5,
       10
      ],
      "critical": [
       20,
       30
      ]
     },
     "caps": {
      "short": 20,
      "excursion": 15,
      "sink_gt_600": 35,
      "any_critical": 40
     },
     "pass": "≥ 60 และไม่มี critical",
     "grades": {
      "ดีเยี่ยม": 90,
      "ดี": 75,
      "ผ่าน": 60
     }
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "LH2",
     "LH3",
     "R1:V19"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: โครง 100 คะแนนเดิม + หัก + เพดาน"
   },
   "signals_needed": {
    "v": [
     "nz",
     "carbHeat",
     "mixture",
     "deTrim",
     "phase",
     "stallWarn",
     "xw",
     "latV",
     "Recorder: phi, theta, beta, wow"
    ],
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "R1:V19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "วันนี้ air.load คือแรงตั้งฉากที่ล้อแต่ละล้อ [N] (0 เมื่ออยู่ในอากาศ) ยังไม่มี nz; Recorder ยังไม่เก็บ phi/theta/beta/wow"
   },
   "tests": {
    "v": {
     "script": "scripts/lh_tests.mjs",
     "cases": 67,
     "pass": 67,
     "ids": "T-LH-01…T-LH-67"
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ผลล่าสุด 67/67 ผ่าน (การตรวจความครบถ้วน 19 พ.ย. 2026); ทุกกรณีมีส่วนเผื่อชัดเจนและผลของซิมวันนี้ใน out/lh_tests.json"
   }
  }
 }
}
```

```json
{
 "c172s": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม (static 2,300–2,400 rpm)",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LC3",
      "LC6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04"
    },
    "rotation": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9.3,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "rotate 55 KIAS (28.3 m/s) (LH11 p.4–5, LH8 p.5); short field 51 KIAS แฟลป 10; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": 10.7,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 730
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LC1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy SL 74 KIAS (38.1 m/s) (IM p.4-5); ROC 730 fpm (3.7 m/s) ที่ MTOW SL (ที่มวลฝึกไต่ได้มากกว่า); short field: Vx 62 จนพ้นสิ่งกีดขวาง เก็บแฟลปที่ 300 ft AGL (SOP); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 8.4,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 600
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LC1",
      "LH11",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "75–85 KIAS ที่ SL, 70–80 ที่ 10,000 ft (IM p.4-5); SOP 70–85; rate ค่าประมาณ (ผู้เขียนตั้งต่ำกว่า ROC ที่ Vy); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": 1.3,
      "power": "≈2,200–2,500 rpm (ค่าประมาณ)",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LC1",
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: rpm ในช่วง tach green arc 2,100–2,500 rpm ที่ SL ของบัตร 04 [LC1]; ias ค่าประมาณ; C172R IM แนะนำ cruise 60–80 % (p.4-26); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.2,
      "power": "≈2,000 rpm",
      "flap": "0",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 2.8,
      "power": "2,000–2,200 rpm",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -2,
      "power": "≈1,500 rpm",
      "flap": "20",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "70–75 KIAS แฟลป 20; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": -0.2,
      "power": "≈1,500 rpm ปรับตาม path",
      "flap": "30",
      "rate_fpm": -345
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LC1",
      "LH1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 65 kt IAS ที่มวลฝึก (D1); 60–70 KIAS แฟลป 30 (IM p.4-5); short field 61; 3° ที่ GS 65 kt; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 52,
      "ias_range_kt": [
       65,
       38
      ],
      "pitch_deg": 9.2,
      "pitch_start_deg": -0.2,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "roundout 10–20 ft (AFH p.9-8); ค่าประมาณ: ความเร็วลดจาก final 65 ถึงแตะ 38 KIAS (ค่ากลาง 52); pitch เพิ่มจาก -0.2° (final) ถึง 9.2° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 38,
      "pitch_deg": 9.2,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน ใกล้ power-off stall attitude (AFH ch.9); ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 46 KCAS จาก CLmax_target ของบัตร) = 48.3 KCAS (38 KIAS, 24.8 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.282 ที่ h/b 0.208, รอบที่ 1 §2.4) 9.2° นอก ground effect 10.2°"
    },
    "go_around": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": 7.7,
      "power": "เต็ม",
      "flap": "20",
      "rate_fpm": 300
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "แฟลป 30→20 ทันที, 65 KIAS ที่ 50 ft, Vy 74, 10 → 0 ที่ 300 ft; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 15,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LH11"
    ],
    "conf": "สูง",
    "est": false,
    "note": "สาธิต 15 kt (7.7 m/s) ไม่ใช่ขีดจำกัด (IM p.4-5); SOP ของโรงเรียนแยก 20 kt แฟลป 0–10 / 15 kt แฟลป 20–30 (p.4)"
   },
   "stall_characteristics": {
    "v": {
     "warning": "แตร reed ขอบหน้าปีก",
     "warning_margin_kt": [
      5,
      10
     ],
     "behaviour": "conventional",
     "altitude_loss_ft": 230,
     "altitude_loss_m": 70
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH12",
     "LC2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "margin จาก C172R IM p.4-30; ความสูงที่เสียตอน stall และแก้ 230 ft (70 m) จากบัตร"
   },
   "spin": {
    "v": {
     "approved": "utility category เท่านั้น",
     "flaps": "ห้าม",
     "recovery_turns_max": 0.25,
     "alt_loss_1turn_ft": 1000,
     "complete_recovery_agl_ft": 4000,
     "training_turns": [
      1,
      2
     ],
     "recovery": "idle, aileron กลาง, rudder ตรงข้ามเต็ม, ดันคันไปหน้า, rudder กลางเมื่อหยุดหมุน"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "C172R IM p.4-30…4-32 ใช้กับ 172S (การรับรองเดียวกัน); 1,000 ft = 305 m, 4,000 ft = 1,219 m"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "10": 110,
      "20": 85,
      "30": 85
     },
     "balloon_dn_g": {
      "0to10_85kt": 0.22,
      "10to20_80kt": 0.23,
      "20to30_70kt": 0.09
     },
     "approach_alpha_drop_deg": 4,
     "notes": "ปีกสูงแฟลป Fowler: กางแล้วลอยและเชิดหัว ต้องดันคันและ trim; เกิน 20° หลีกเลี่ยง slip ชัน"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: balloon และ Δα จาก lh_attitude.mjs (T-LH-06, 07)"
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "wheel",
     "fs_per_g_N": {
      "approach": 69,
      "cruise": 68,
      "min": 56,
      "max": 119
     },
     "fs_per_g_lbf": {
      "approach": 15.6,
      "cruise": 15.2,
      "min": 12.5,
      "max": 26.7
     },
     "grad_N_per_kt": {
      "approach": 1.26,
      "cruise": 0.77
     },
     "flare_pull_N": 21,
     "model_fs_per_g_N": {
      "approach": 69.3,
      "cruise": 67.7
     },
     "bounds": {
      "band_lbf_per_g": [
       12.5,
       42.9
      ],
      "cfr23_155_force_lbf": 25.5,
      "cfr23_143_temporary_lbf": 75,
      "cfr23_143_one_hand_lbf": 50,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1009.6 kg ได้ Fs/g 69.3 N (approach 67.5 KCAS) / 67.7 N (cruise 110 KCAS); อยู่ในขอบเขต ใช้เป็นเป้า; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -0.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (65 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 9.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 10.2°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 65,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 30",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "c172r": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม (static 2,300–2,400 rpm)",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LC3",
      "LC6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04"
    },
    "rotation": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9.1,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "lift nose wheel 55 KIAS (p.4-15); short field 57 KIAS ที่ 50 ft แฟลป 10 (p.4-5); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 79,
      "pitch_deg": 9.2,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 720
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy SL 79 KIAS (40.6 m/s) (71 ที่ 10,000 ft), Vx SL 60; normal climb out 70–80; ROC 720 fpm (3.7 m/s) ที่ 2,450 lb SL (p.ii, 4-5); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 8.1,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 600
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "enroute climb 75–85 KIAS SL, 70–80 ที่ 10,000 ft (p.4-5); rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": 1.2,
      "power": "2,000–2,400 rpm (≤ 80 %)",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "checklist p.4-16; ปกติ 60–80 % (p.4-26); ias ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.4,
      "power": "≈2,000 rpm",
      "flap": "0",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 2.5,
      "power": "2,000–2,200 rpm",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -1.9,
      "power": "≈1,500 rpm",
      "flap": "20",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "70–75 KIAS แฟลป 20; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": 0.3,
      "power": "≈1,500 rpm ปรับตาม path",
      "flap": "30",
      "rate_fpm": -345
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 65 kt IAS ที่มวลฝึก (D1); 60–70 KIAS แฟลป 30, 65–75 แฟลปขึ้น; short field 62 (p.4-5); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 54,
      "ias_range_kt": [
       65,
       42
      ],
      "pitch_deg": 9.2,
      "pitch_start_deg": 0.3,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "roundout 10–20 ft (AFH p.9-8); ค่าประมาณ: ความเร็วลดจาก final 65 ถึงแตะ 42 KIAS (ค่ากลาง 54); pitch เพิ่มจาก 0.3° (final) ถึง 9.2° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 42,
      "pitch_deg": 9.2,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน ใกล้ power-off stall attitude (AFH ch.9); ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 45.8 KCAS จาก CLmax_target ของบัตร) = 48 KCAS (42 KIAS, 24.7 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.282 ที่ h/b 0.208, รอบที่ 1 §2.4) 9.2° นอก ground effect 10.2°"
    },
    "go_around": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9.4,
      "power": "เต็ม",
      "flap": "20",
      "rate_fpm": 300
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "balked landing 55 KIAS แฟลป 20 แล้ว 10 และเก็บหมดเมื่อ ≥ 60 KIAS ที่ความสูงปลอดภัย (p.4-17); rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 15,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-5, 4-33"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ],
     "behaviour": "conventional",
     "altitude_loss_ft": 230,
     "altitude_loss_m": 70
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH12",
     "LE3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-30; ความสูงที่เสียตอน stall และแก้ 230 ft (70 m) จากบัตร"
   },
   "spin": {
    "v": {
     "approved": "utility category เท่านั้น",
     "flaps": "ห้าม"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.2-9, 4-30"
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "wheel",
     "fs_per_g_N": {
      "approach": 69,
      "cruise": 67,
      "min": 56,
      "max": 119
     },
     "fs_per_g_lbf": {
      "approach": 15.5,
      "cruise": 15.1,
      "min": 12.5,
      "max": 26.7
     },
     "grad_N_per_kt": {
      "approach": 1.28,
      "cruise": 0.77
     },
     "flare_pull_N": 19,
     "model_fs_per_g_N": {
      "approach": 68.8,
      "cruise": 67.3
     },
     "bounds": {
      "band_lbf_per_g": [
       12.5,
       42.9
      ],
      "cfr23_155_force_lbf": 24.5,
      "cfr23_143_temporary_lbf": 75,
      "cfr23_143_one_hand_lbf": 50,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 998.7 kg ได้ Fs/g 68.8 N (approach 65.5 KCAS) / 67.3 N (cruise 110 KCAS); อยู่ในขอบเขต ใช้เป็นเป้า; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": 0.3,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (65 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 9.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 10.2°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 65,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 30",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "c152": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม carb heat cold",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13"
     ],
     "conf": "สูง",
     "est": false,
     "note": "แฟลป 0–10"
    },
    "rotation": {
     "v": {
      "ias_kt": 50,
      "pitch_deg": 9.1,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ยกล้อหน้า 50 KIAS (25.7 m/s) (p.4-8); short field แฟลป 10 ไต่ 54 KIAS จนพ้นสิ่งกีดขวาง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 67,
      "pitch_deg": 10.8,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 715
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LF1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "65–75 หลังขึ้น; Vy 67 KIAS (34.5 m/s) SL, Vx 55; ROC 715 fpm (3.6 m/s) ที่ 1,670 lb SL จากบัตร 11 [LF1]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": 7.2,
      "power": "เต็ม mixture rich < 3,000 ft",
      "flap": "0",
      "rate_fpm": 500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "70–80 KIAS; rate ค่าประมาณ (ต่ำกว่า ROC ที่ Vy); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": 1.1,
      "power": "1,900–2,550 rpm (55–75 %)",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "rpm p.4-8, % p.4-15; ias ค่าประมาณ (ผู้เขียนตั้ง: IM ให้ cruise เป็น KTAS); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": -1.4,
      "power": "≈2,000 rpm carb heat ตามต้อง",
      "flap": "0",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 85 KIAS −500 fpm (2.5 m/s) ไม่มีในแหล่ง; carb heat เมื่อลดกำลังมาก (p.4-9); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 2.7,
      "power": "ลดหลัง carb heat ON",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ias ค่าประมาณ (ผู้เขียนตั้ง): IM ไม่ให้ความเร็ว downwind ใช้ค่าระหว่าง enroute climb 70–80 และ approach แฟลปขึ้น 60–70 KIAS; carb heat ก่อนลดกำลัง p.4-9; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": -1.8,
      "power": "ลดตาม path (carb heat ON)",
      "flap": "20",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 65 KIAS แฟลป 20 −500 fpm ระหว่าง approach แฟลปขึ้น 60–70 และ final 55–65 KIAS ของ IM; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": -0.5,
      "power": "ปรับตาม path",
      "flap": "30",
      "rate_fpm": -320
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 60 kt IAS ที่มวลฝึก (D1); 55–65 แฟลป 30 (60–70 แฟลปขึ้น); short field 54; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 52,
      "ias_range_kt": [
       60,
       43
      ],
      "pitch_deg": 7.5,
      "pitch_start_deg": -0.5,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "roundout 10–20 ft (AFH p.9-8); ค่าประมาณ: ความเร็วลดจาก final 60 ถึงแตะ 43 KIAS (ค่ากลาง 52); pitch เพิ่มจาก -0.5° (final) ถึง 7.5° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 43,
      "pitch_deg": 7.5,
      "power": "idle",
      "flap": "30",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน; VS0 31–35 KIAS ตาม CG (IM p.5-10); ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 42.9 KCAS จาก CLmax_target ของบัตร) = 45.1 KCAS (43 KIAS, 23.2 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.3 ที่ h/b 0.195, รอบที่ 1 §2.4) 7.5° นอก ground effect 8.5°"
    },
    "go_around": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 7.2,
      "power": "เต็ม carb heat cold",
      "flap": "20",
      "rate_fpm": 200
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "แฟลป 30→20 ทันทีแล้วเก็บช้า ๆ; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 12,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-3, 5-10A (ไม่ใช่ขีดจำกัด)"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": 10,
     "behaviour": "conventional",
     "altitude_loss_ft": 160,
     "altitude_loss_m": 49
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH13",
     "LF1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-18, 5-10; ความสูงที่เสียตอน stall และแก้ 160 ft (49 m) จากบัตร"
   },
   "spin": {
    "v": {
     "approved": true,
     "flaps": "ห้าม",
     "alt_loss_1turn_ft": 1000,
     "alt_loss_6turn": "มากกว่าสองเท่าเล็กน้อย",
     "complete_recovery_agl_ft": 4000
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.2-6 (maneuver limits), 4-18…4-20"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "10": 85,
      "20": 85,
      "30": 85
     },
     "balloon_dn_g": {
      "0to10_80kt": 0.25,
      "20to30_65kt": 0.15
     },
     "notes": "เก็บแฟลป 10 ช้า ๆ หลัง 60 KIAS; balked landing เหลือ 20 ทันที"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH13",
     "LF1",
     "LH0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs กับบัตร 11 (gap 9)"
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "wheel",
     "fs_per_g_N": {
      "approach": 54,
      "cruise": 52,
      "min": 46,
      "max": 98
     },
     "fs_per_g_lbf": {
      "approach": 12,
      "cruise": 11.8,
      "min": 10.3,
      "max": 22
     },
     "grad_N_per_kt": {
      "approach": 1.1,
      "cruise": 0.75
     },
     "flare_pull_N": 15,
     "model_fs_per_g_N": {
      "approach": 53.6,
      "cruise": 52.4
     },
     "bounds": {
      "band_lbf_per_g": [
       10.3,
       38.2
      ],
      "cfr23_155_force_lbf": 20,
      "cfr23_143_temporary_lbf": 75,
      "cfr23_143_one_hand_lbf": 50,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร (ขาด gearing, Ch0, Ch_alpha, Ch_delta, Ch_tab ใช้ของ c172s) ที่มวลฝึก 717.5 kg ได้ Fs/g 53.6 N (approach 61 KCAS) / 52.4 N (cruise 90 KCAS); อยู่ในขอบเขต ใช้เป็นเป้า; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 3.4000000000000004 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -0.5,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (60 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 7.5,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 8.5°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 60,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 30",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX 100 % load (prop 2,200–2,300 rpm)",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 63,
      "pitch_deg": 5.4,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH18",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 56/58/61/65/67 KIAS ที่ 940/1,000/1,100/1,200/1,280 kg: ที่มวลฝึก 1,150 kg ได้ 63 KIAS (32.4 m/s, ประมาณเชิงเส้น); SOP ซิม +7.5° ANU; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 72,
      "pitch_deg": 7,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 650
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy ถึงความสูงปลอดภัย; ROC 651 fpm (3.3 m/s) MTOM; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 88,
      "pitch_deg": 6.9,
      "power": "≈92 %",
      "flap": "UP",
      "rate_fpm": 500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH18",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "กำลังจาก SOP ของชุมชนซิม; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 115,
      "pitch_deg": 0.6,
      "power": "60–75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD4",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ 115 KIAS จาก cruise_table ของบัตร 05 ที่ 60–75 % ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -1.6,
      "power": "≈35–45 %",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 110 KIAS −500 fpm ลด load ให้ได้อัตรานี้ ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 3.3,
      "power": "30–40 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH18",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "SOP ของชุมชนซิม (ต่ำ); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": -3.9,
      "power": "≈25–30 %",
      "flap": "T/O",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS แฟลป T/O −500 fpm ระหว่าง circuit 90 KIAS [LH18] และ final; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": -4.1,
      "power": "≈20–30 % → idle",
      "flap": "LDG",
      "rate_fpm": -390
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LD3",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 74 kt IAS ที่มวลฝึก (D1); VREF LDG 66/68/72/76/76/77 ที่ 940/1,000/1,100/1,200/1,216/1,280 kg; pitch ลบสอดคล้องกับท่าบิน DA40 NG ที่นักบินรายงานในบัตร 05 (แฟลป LDG idle 84 KIAS −6.5°) ดู 08.10; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 68,
      "ias_range_kt": [
       74,
       61
      ],
      "pitch_deg": 1.9,
      "pitch_start_deg": -4.1,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH17",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ปีกต่ำ: ground effect แรง (h/b ≈ 0.05) ลอยนานถ้าเร็วเกิน; ค่าประมาณ: ความเร็วลดจาก final 74 ถึงแตะ 61 KIAS (ค่ากลาง 68); pitch เพิ่มจาก -4.1° (final) ถึง 1.9° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 61,
      "pitch_deg": 1.9,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ล้อหลักก่อน; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 55.8 KCAS จาก CLmax_target ของบัตร) = 58.5 KCAS (61 KIAS, 30.1 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.642 ที่ h/b 0.053, รอบที่ 1 §2.4) 1.9° นอก ground effect 3.5°"
    },
    "go_around": {
     "v": {
      "ias_kt": 72,
      "pitch_deg": 5,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 400
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ขั้นต่ำ 72 KIAS แฟลป T/O; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH17"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "checklist p.8"
   },
   "stall_characteristics": {
    "v": {
     "warning": "lift detector ปีกซ้าย",
     "warning_margin_kt": 5,
     "behaviour": "AFM ไม่บรรยายการตกปีก",
     "dynamic_stall": "ห้าม",
     "altitude_loss_ft": 240,
     "altitude_loss_m": 73
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LD2",
     "LD8",
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: margin = เกณฑ์ขั้นต่ำ 23.207; ความสูงที่เสียตอน stall และแก้ 240 ft (73 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "normal category ห้าม spin และ aerobatics"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "T/O": 110,
      "LDG": 98
     },
     "balloon_dn_g": {
      "UPtoTO_100kt_upper_bound": 0.99
     },
     "notes": "ปีกต่ำ แฟลป 20°/42°: ΔCL0 ของบัตร 05 (0.52/0.75) ยืนยันด้วย DATCOM และท่าบินที่นักบินรายงาน; Δn เป็นขอบบน (แฟลปกางทันทีและถือ α เดิม) จริงแฟลปไฟฟ้าใช้หลายวินาทีและ dCm0 −0.06 กดหัวลง (ดู 08.10)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH17",
     "LH0",
     "LD13"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 25 kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 34,
      "cruise": 34,
      "min": 34,
      "max": 95
     },
     "fs_per_g_lbf": {
      "approach": 7.5,
      "cruise": 7.5,
      "min": 7.5,
      "max": 21.4
     },
     "grad_N_per_kt": {
      "approach": 0.69,
      "cruise": 0.47
     },
     "flare_pull_N": 9,
     "model_fs_per_g_N": {
      "approach": 19.4,
      "cruise": 19.1
     },
     "bounds": {
      "band_lbf_per_g": [
       7.5,
       21.78
      ],
      "cfr23_155_force_lbf": 20.6,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1150 kg ได้ Fs/g 19.4 N (approach 72.9 KCAS) / 19.1 N (cruise 110 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (7.5 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 1.75; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -4.1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (74 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 1.9,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 3.5°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 74,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX PWR (คันเร่งเต็มไม่กระชาก) 2,680 ± 20 rpm, mixture RICH, fuel pump ON",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "รอบวิ่งขึ้น 2,680 ± 20 rpm ถ้าไม่ถึงให้ยกเลิก (p.4A-25); mixture RICH (p.4A-27)"
    },
    "rotation": {
     "v": {
      "ias_kt": 59,
      "pitch_deg": 3.7,
      "power": "MAX PWR",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LD8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ยกล้อหน้า 59 KIAS (30.4 m/s) ค่าเดียวทุกมวล (p.4A-25); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 62,
      "pitch_deg": 9.7,
      "power": "MAX PWR แล้ว 2,400 rpm เมื่อสูงปลอดภัย, mixture RICH, fuel pump OFF",
      "flap": "T/O",
      "rate_fpm": 780
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LD4",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ (ประมาณเชิงเส้นตามมวล): 67/66/60/54 KIAS ที่ 1,200/1,150/1,000/850 kg (p.4A-26, 4A-27) → 62 KIAS (31.9 m/s) ที่ 1,050 kg; ROC 780 fpm (4.0 m/s) [LD4]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": 11.2,
      "power": "MAX PWR / 2,400 rpm, mixture RICH (คง RICH เหนือ 5,000 ft ตาม AFM)",
      "flap": "UP",
      "rate_fpm": 600
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ (ประมาณเชิงเส้นตามมวล): 76/73/68/60 KIAS ที่ 1,200/1,150/1,000/850 kg (p.4A-28) → 70 KIAS ที่ 1,050 kg; rate ผู้เขียนตั้ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": 0.5,
      "power": "≈22–23 inHg / 2,400 rpm (≈ 65 %, ค่าประมาณ), mixture best economy",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LD4",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "rpm 1,800–2,400 และ MAP ตามตารางบท 5 (p.4A-29) ซึ่งเป็นภาพอ่านไม่ได้: ค่าประมาณ MAP จากสัดส่วน MAP × rpm ของ IO-360 (100 % ≈ 29 inHg ที่ 2,700 rpm) บวกความสูญเสียราว 1 inHg; mixture best economy ใช้ได้ถึง 75 % (หรี่จนเครื่องสะดุดแล้วดันกลับให้เรียบ EGT สูงสุด) หรือ best power EGT ต่ำกว่า peak 100 °F (55 °C) (p.4A-31, 4A-32); ias ค่าประมาณจาก 137 KTAS ที่ 75 % 6,000 ft [LD4]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": -1.8,
      "power": "คันเร่งตามต้อง 1,800–2,400 rpm, mixture ปรับตามต้อง",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "CHT ลดไม่เกิน 50 °F (28 °C) ต่อนาที (p.4A-33); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 3.3,
      "power": "fuel pump ON, mixture RICH, RPM HIGH",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "รายการ approach (p.4A-34): fuel pump ON, ถังที่มากกว่า, mixture RICH, RPM HIGH, แฟลป T/O เมื่อต่ำกว่า VFE 108 KIAS; ias ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -4.1,
      "power": "ตามต้อง",
      "flap": "T/O",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "แฟลป T/O ระหว่าง approach (p.4A-34); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": -3.3,
      "power": "ตามต้อง, RPM HIGH, mixture RICH",
      "flap": "LDG",
      "rate_fpm": -350
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 65 kt IAS ที่มวลฝึก (D1); approach แฟลป LDG 73/71/67/63/58 KIAS ที่ 1,200/1,150/1,092/1,000/850 kg (p.4A-34) → 65 KIAS (33.4 m/s) ที่ 1,050 kg; AFM ให้เพิ่มความเร็วเมื่อลมแรง/wind shear; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 59,
      "ias_range_kt": [
       65,
       53
      ],
      "pitch_deg": 1.5,
      "pitch_start_deg": -3.3,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ปีกต่ำ ground effect แรง; ค่าประมาณ: ความเร็วลดจาก final 65 ถึงแตะ 53 KIAS (ค่ากลาง 59); pitch เพิ่มจาก -3.3° (final) ถึง 1.5° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 53,
      "pitch_deg": 1.5,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ล้อหลักก่อน; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 53.5 KCAS จาก CLmax_target ของบัตร) = 56.1 KCAS (53 KIAS, 28.9 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.648 ที่ h/b 0.052, รอบที่ 1 §2.4) 1.5° นอก ground effect 3°"
    },
    "go_around": {
     "v": {
      "ias_kt": 62,
      "pitch_deg": 6.4,
      "power": "MAX PWR",
      "flap": "T/O",
      "rate_fpm": 400
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "MAX PWR, แฟลป T/O แล้ว UP เมื่อสูงปลอดภัย (p.4A-36); 67/66/60/54 KIAS (แฟลป T/O) และ 76/73/68/60 (UP) ที่ 1,200/1,150/1,000/850 kg → 62 / 70 KIAS ที่ 1,050 kg (ค่าประมาณ ประมาณเชิงเส้น); rate ผู้เขียนตั้ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 20,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "DA 40 รุ่น IO-360 (XLT) 20 kt (10.3 m/s) จากหน้าสเปกของผู้ผลิตผ่านบัตร 05"
   },
   "stall_characteristics": {
    "v": {
     "warning": "lift detector ปีกซ้าย",
     "warning_margin_kt": 5,
     "behaviour": "AFM ไม่บรรยายการตกปีก",
     "altitude_loss_ft": 180,
     "altitude_loss_m": 55
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: margin = เกณฑ์ขั้นต่ำ 23.207; รุ่นเดิมโครงเดียวกับ NG; ความสูงที่เสียตอน stall และแก้ 180 ft (55 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": false,
     "recovery": "idle, rudder ตรงข้ามเต็ม, ดันคันหน้าสุด, aileron กลาง, เก็บแฟลป"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ห้าม spin; ขั้นตอนแก้ spin ไม่ตั้งใจ (สรุป) AFM p.3-33 ผ่านบัตร 05"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "T/O": 108,
      "LDG": 91
     },
     "balloon_dn_g": {
      "UPtoTO_90kt_upper_bound": 0.9
     },
     "notes": "แฟลปไฟฟ้า 3 ตำแหน่ง ต่อซ้ายขวาด้วยกลไก [LD8]; VFE ต่ำกว่า NG (108/91 เทียบ 110/98 KIAS)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD6",
     "LD8",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs ที่ 90 KIAS (ขอบบน)"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 20 kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 34,
      "cruise": 34,
      "min": 34,
      "max": 95
     },
     "fs_per_g_lbf": {
      "approach": 7.5,
      "cruise": 7.5,
      "min": 7.5,
      "max": 21.4
     },
     "grad_N_per_kt": {
      "approach": 0.75,
      "cruise": 0.51
     },
     "flare_pull_N": 7,
     "model_fs_per_g_N": {
      "approach": 17.6,
      "cruise": 17.3
     },
     "bounds": {
      "band_lbf_per_g": [
       7.5,
       23.61
      ],
      "cfr23_155_force_lbf": 18.9,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1050 kg ได้ Fs/g 17.6 N (approach 66.5 KCAS) / 17.3 N (cruise 100 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (7.5 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 1.93; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -3.3,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (65 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 1.5,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 3°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 65,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "100 % load (FADEC คันเดียว) ใบพัด ≈ 2,300 rpm",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD8"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "กำลังต่อเนื่องสูงสุด 99 kW (135 hp) ที่ใบพัด 2,300 rpm (handout p.11)"
    },
    "rotation": {
     "v": {
      "ias_kt": 59,
      "pitch_deg": 3.9,
      "power": "100 %",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LD6",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "rotate 59 KIAS (30.4 m/s) (handout p.23–24; AFM p.4A-25); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 62,
      "pitch_deg": 7.8,
      "power": "100 %",
      "flap": "T/O",
      "rate_fpm": 550
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LD6",
      "LD14",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: takeoff climb 66 KIAS ที่ 1,150 kg (handout p.5) ประมาณเชิงเส้นด้วยตารางมวลของโครงเดียวกัน (60 ที่ 1,000 kg, AFM p.4A-27) → 62 KIAS ที่ 1,060 kg; ROC ≈ 550 fpm (2.8 m/s) ค่าประมาณของบัตร 05 [LD14]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": 10.1,
      "power": "100 % (หรือ ≥ 80 %)",
      "flap": "UP",
      "rate_fpm": 450
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: cruise climb 73 KIAS ที่ 1,150 kg (handout p.5) → 70 KIAS ที่ 1,060 kg (ตาราง AFM p.4A-28); rate ผู้เขียนตั้ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": 0.9,
      "power": "55–70 % load",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ตัวอย่าง 70 % load ที่ 6,000 ft ISA ได้ 121 KTAS (handout p.23) ราว 5 USgal/h (19 l/h) (p.14); ias ค่าประมาณที่ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.4,
      "power": "≈30–40 % load",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): handout ไม่ให้ค่า descent; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 3.3,
      "power": "≈35–45 % load",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0",
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง); แฟลป T/O เมื่อต่ำกว่า VFE 108 KIAS [LD8]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -4,
      "power": "≈25–35 % load",
      "flap": "T/O",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 66,
      "pitch_deg": -3.5,
      "power": "≈20–30 % → idle",
      "flap": "LDG",
      "rate_fpm": -355
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LD8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 66 kt IAS ที่มวลฝึก (D1); VREF แฟลป LDG 71 KIAS ที่ 1,150 kg (handout p.24) = ตาราง AFM p.4A-34; 66 KIAS (34.0 m/s) ที่มวลฝึก 1,060 kg ตามบัตร; VFE LDG 91 KIAS; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 59,
      "ias_range_kt": [
       66,
       52
      ],
      "pitch_deg": 1.9,
      "pitch_start_deg": -3.5,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ปีกต่ำ ground effect แรง; ค่าประมาณ: ความเร็วลดจาก final 66 ถึงแตะ 52 KIAS (ค่ากลาง 59); pitch เพิ่มจาก -3.5° (final) ถึง 1.9° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 52,
      "pitch_deg": 1.9,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LD8",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "handout ให้ VLDG แฟลป LDG 58 KIAS (p.25) ที่ 1,150 kg; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 52.9 KCAS จาก CLmax_target ของบัตร) = 55.5 KCAS (52 KIAS, 28.6 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.647 ที่ h/b 0.052, รอบที่ 1 §2.4) 1.9° นอก ground effect 3.5°"
    },
    "go_around": {
     "v": {
      "ias_kt": 62,
      "pitch_deg": 5.7,
      "power": "100 %",
      "flap": "T/O",
      "rate_fpm": 300
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: handout ไม่ให้ค่า go-around; ใช้ลำดับของ AFM โครงเดียวกัน (MAX แฟลป T/O แล้ว UP, p.4A-36) ที่ 1,060 kg; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 20,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: บัตร 05 ใช้ค่าของรุ่น IO-360 (20 kt) เพราะ handout ไม่ให้ค่า"
   },
   "stall_characteristics": {
    "v": {
     "warning": "lift detector ปีกซ้าย",
     "warning_margin_kt": 5,
     "behaviour": "AFM ไม่บรรยายการตกปีก",
     "altitude_loss_ft": 190,
     "altitude_loss_m": 58
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: margin = เกณฑ์ขั้นต่ำ 23.207; รุ่นเดิมโครงเดียวกับ NG; ความสูงที่เสียตอน stall และแก้ 190 ft (58 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": false,
     "recovery": "idle, rudder ตรงข้ามเต็ม, ดันคันหน้าสุด, aileron กลาง, เก็บแฟลป"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ห้าม spin; ขั้นตอนแก้ spin ไม่ตั้งใจ (สรุป) AFM p.3-33 ผ่านบัตร 05"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "T/O": 108,
      "LDG": 91
     },
     "balloon_dn_g": {
      "UPtoTO_90kt_upper_bound": 0.89
     },
     "notes": "แฟลปไฟฟ้า 3 ตำแหน่ง ต่อซ้ายขวาด้วยกลไก [LD8]; VFE ต่ำกว่า NG (108/91 เทียบ 110/98 KIAS)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD6",
     "LD8",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs ที่ 90 KIAS (ขอบบน)"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 20 kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 34,
      "cruise": 34,
      "min": 34,
      "max": 95
     },
     "fs_per_g_lbf": {
      "approach": 7.5,
      "cruise": 7.5,
      "min": 7.5,
      "max": 21.4
     },
     "grad_N_per_kt": {
      "approach": 0.74,
      "cruise": 0.51
     },
     "flare_pull_N": 8,
     "model_fs_per_g_N": {
      "approach": 17.7,
      "cruise": 17.4
     },
     "bounds": {
      "band_lbf_per_g": [
       7.5,
       22.63
      ],
      "cfr23_155_force_lbf": 18.1,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1060 kg ได้ Fs/g 17.7 N (approach 67.4 KCAS) / 17.4 N (cruise 100 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (7.5 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 1.91; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -3.5,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (66 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 1.9,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 3.5°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 66,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX ทั้งสองเครื่อง",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 8.4,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 76 KIAS (39.1 m/s); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 11.6,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 1100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH29",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy 90 KIAS (46.3 m/s); เก็บล้อเมื่อ positive rate; ROC 1,180 fpm MTOM; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": 8.1,
      "power": "≈92 %",
      "flap": "UP",
      "rate_fpm": 900
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "rate ค่าประมาณ; แหล่งเป็นรุ่น L360; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": -0.3,
      "power": "60–75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT10",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ 140 KIAS จาก cruise_table ของบัตร 06 ที่ 60–75 % ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 130,
      "pitch_deg": -1.9,
      "power": "ลดให้ได้ ≈500 fpm",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "130–140 KIAS (L360); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": 3,
      "power": "≈35 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): ias และ load ไม่มีในแหล่ง (สูงกว่า base 95 KIAS เล็กน้อย); ล้อลงบน base เมื่อแน่ใจว่าลงได้ [LH29]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": -2.4,
      "power": "≈25–30 %",
      "flap": "APP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "base 95 KIAS ล้อลง (flashcard รุ่น L360 [LH29]); load และ rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 84,
      "pitch_deg": -2.7,
      "power": "≈20–30 %",
      "flap": "LDG",
      "rate_fpm": -430
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 84 kt IAS ที่มวลฝึก (D1); VREF ≤ 1,900 kg (86 > 1,900 kg); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 74,
      "ias_range_kt": [
       84,
       64
      ],
      "pitch_deg": 5.1,
      "pitch_start_deg": -2.7,
      "power": "idle ทั้งสองเครื่อง",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ปีกต่ำ ground effect แรง; ค่าประมาณ: ความเร็วลดจาก final 84 ถึงแตะ 64 KIAS (ค่ากลาง 74); pitch เพิ่มจาก -2.7° (final) ถึง 5.1° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 64,
      "pitch_deg": 5.1,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT2",
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "VS0 62 KIAS ปลาย white arc ที่ 1,900 kg [LT2]; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 59.1 KCAS จาก CLmax_target ของบัตร) = 62.1 KCAS (64 KIAS, 31.9 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.567 ที่ h/b 0.073, รอบที่ 1 §2.4) 5.1° นอก ground effect 6.6°"
    },
    "go_around": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 4.6,
      "power": "MAX",
      "flap": "APP",
      "rate_fpm": 500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "LDG→APP, ล้อขึ้นเมื่อ positive rate; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก DA42 NG (AOPA 2010) และโบรชัวร์ DA42-VI ผ่านบัตร 06; AFM NG บท 4/5 เปิดไม่ได้"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": 5,
     "note_l360": "รุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า",
     "altitude_loss_ft": 280,
     "altitude_loss_m": 85
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LT4",
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: margin = ขั้นต่ำ 5 kt ของ 14 CFR 23.207 / CS-23 เพราะ AFM ที่เปิดได้ไม่ให้ตัวเลข; ความสูงที่เสียตอน stall และแก้ 280 ft (85 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "normal category"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "APP": 133,
      "LDG": 113
     },
     "balloon_dn_g": {
      "UPtoAPP_110kt_upper_bound": 0.57
     }
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "VFE ผ่านบัตร 06; ค่าประมาณ: balloon จาก lh_attitude.mjs (ขอบบน)"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 25 kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 48,
      "cruise": 48,
      "min": 48,
      "max": 88
     },
     "fs_per_g_lbf": {
      "approach": 10.7,
      "cruise": 10.7,
      "min": 10.7,
      "max": 20
     },
     "grad_N_per_kt": {
      "approach": 0.51,
      "cruise": 0.34
     },
     "flare_pull_N": 9,
     "model_fs_per_g_N": {
      "approach": 7.5,
      "cruise": 6.9
     },
     "bounds": {
      "band_lbf_per_g": [
       10.7,
       20
      ],
      "cfr23_155_force_lbf": 29.9,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1752 kg ได้ Fs/g 7.5 N (approach 81.6 KCAS) / 6.9 N (cruise 135 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (10.7 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 6.86; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -2.7,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (84 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 5.1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 6.6°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 84,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "da42_tae125": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "100 % load ทั้งสองเครื่อง (FADEC คันละเครื่อง)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": 9,
      "power": "100 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5",
      "LT16",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 70 KIAS (36.0 m/s) ≤ 1,700 kg (72 > 1,700 kg) [LT5 p.4A-3]; การจับแถวตาราง 4A.2 เป็นการอนุมานของบัตร 06; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 77,
      "pitch_deg": 14.5,
      "power": "100 %",
      "flap": "UP",
      "rate_fpm": 1060
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5",
      "LT16",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy 77 KIAS (39.6 m/s) ≤ 1,700 kg [LT5]; ROC 1,060 fpm (5.4 m/s) [LT16]; เก็บล้อเมื่อ positive rate; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 9,
      "power": "≈ 80–100 %",
      "flap": "UP",
      "rate_fpm": 800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT16",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง) ทั้ง ias load และ rate; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 125,
      "pitch_deg": 0.3,
      "power": "60 % load",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT16",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "60 % ได้ 138 KTAS ที่ 10,000 ft 16.7 l/h ต่อเครื่อง [LT16]; ias ค่าประมาณที่ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": -1.7,
      "power": "≈30–40 % load",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": 2.5,
      "power": "≈35 % load",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง) ใช้รูปแบบเดียวกับ NG; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": -2.2,
      "power": "≈25–30 % load",
      "flap": "APP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง); ล้อลง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 82,
      "pitch_deg": -3.6,
      "power": "≈20–30 %",
      "flap": "LDG",
      "rate_fpm": -430
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 82 kt IAS ที่มวลฝึก (D1); final approach ขั้นต่ำ 82 KIAS (42.2 m/s) ทั้งสองแถบมวล [LT5 p.4A-3]; VREF 76 KIAS (≤ 1,700 kg); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 70,
      "ias_range_kt": [
       82,
       58
      ],
      "pitch_deg": 5.7,
      "pitch_start_deg": -3.6,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ปีกต่ำ ground effect แรง; ค่าประมาณ: ความเร็วลดจาก final 82 ถึงแตะ 58 KIAS (ค่ากลาง 70); pitch เพิ่มจาก -3.6° (final) ถึง 5.7° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 58,
      "pitch_deg": 5.7,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5",
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "VS0 57 KIAS ที่ 1,785 kg [LT5 p.5-8]; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 55.3 KCAS จาก CLmax_target ของบัตร) = 58.1 KCAS (58 KIAS, 29.9 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.567 ที่ h/b 0.073, รอบที่ 1 §2.4) 5.7° นอก ground effect 7.2°"
    },
    "go_around": {
     "v": {
      "ias_kt": 82,
      "pitch_deg": 5.3,
      "power": "100 %",
      "flap": "APP",
      "rate_fpm": 400
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT5",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: LDG→APP ล้อขึ้นเมื่อ positive rate; ias = final ขั้นต่ำ [LT5]; rate ผู้เขียนตั้ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 20,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2006 จาก POH DA 42 1,785 kg ผ่านบัตร 06"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": 5,
     "altitude_loss_ft": 240,
     "altitude_loss_m": 73
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LT5",
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: margin = ขั้นต่ำ 23.207; ความสูงที่เสียตอน stall และแก้ 240 ft (73 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "APP": 137,
      "LDG": 111
     },
     "balloon_dn_g": {
      "UPtoAPP_110kt_upper_bound": 0.6
     }
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "VFE ผ่านบัตร 06; ค่าประมาณ: balloon จาก lh_attitude.mjs (ขอบบน)"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 20 kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 48,
      "cruise": 48,
      "min": 48,
      "max": 88
     },
     "fs_per_g_lbf": {
      "approach": 10.7,
      "cruise": 10.7,
      "min": 10.7,
      "max": 20
     },
     "grad_N_per_kt": {
      "approach": 0.48,
      "cruise": 0.31
     },
     "flare_pull_N": 10,
     "model_fs_per_g_N": {
      "approach": 7.3,
      "cruise": 6.7
     },
     "bounds": {
      "band_lbf_per_g": [
       10.7,
       20
      ],
      "cfr23_155_force_lbf": 28.1,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 1600 kg ได้ Fs/g 7.3 N (approach 81.5 KCAS) / 6.7 N (cruise 135 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (10.7 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 7.13; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -3.6,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (82 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 5.7,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 7.2°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 82,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "t6a": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 8.5,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH15"
     ],
     "conf": "สูง",
     "est": false,
     "note": "takeoff attitude 7–10° NH; VR 85 KIAS (43.7 m/s); pitch จากคู่มือ"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": 15,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": "tech climb 140/160/180 KIAS = 15/12.5/10° NH; pattern climb 120 KIAS 60–70 % torque; pitch จากคู่มือ"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 12.5,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": "pitch จากคู่มือ"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.1,
      "power": "≈50 % + 1 %/1,000 ft MSL",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Table 2.1: 250 KIAS ≈ 93 % 2° NL; 200 KIAS 0°; 150 KIAS 32 % 2° NH (สูตร 08.1 ได้ −0.1° ที่ 200 KIAS, T-LH-52); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.4,
      "power": "≈10–20 %",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 10 % ใช้ลดสู่ pattern altitude; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": 4.8,
      "power": "≈31 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อลงเมื่อ < 150 KIAS; abeam ลดเป็น 15 %; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -4.2,
      "power": "≈15 %",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "approach turn 120/115/110 (UP/TO/LDG), 90 position 400 ft AGL; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.2,
      "power": "ตามต้อง (≥ on-speed AOA)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP20",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 100 kt IAS ที่มวลฝึก (D1); 110/105/100 KIAS (UP/TO/LDG); groove 100–150 ft ≈ 1,500 ft; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 88,
      "ias_range_kt": [
       100,
       76
      ],
      "pitch_deg": 7,
      "pitch_start_deg": -1.2,
      "power": "idle ที่ 5–10 ft",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 2.3
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ลดกำลังสู่ idle ที่ 5–10 ft แล้วตั้ง landing attitude และ flare ใน ground effect (Fig 6-10); ค่าประมาณ: ความเร็วลดจาก final 100 ถึงแตะ 76 KIAS (ค่ากลาง 88); pitch เพิ่มจาก -1.2° (final) ถึง 7° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 2.3 m (8 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 7,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "attitude สูงกว่า takeoff attitude เล็กน้อย (7–10° NH) [LH15]; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 72.1 KCAS จาก CLmax_target ของบัตร) = 75.7 KCAS (76 KIAS, 38.9 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.473 ที่ h/b 0.105, รอบที่ 1 §2.4) 7° นอก ground effect 9.1°"
    },
    "go_around": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": 10.4,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ias และ rate; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "wet": 10,
     "icy": 5,
     "touch_and_go": 20,
     "formation": 15,
     "tailwind_takeoff": 10,
     "limitation": true,
     "demonstrated": 24
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP29"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ขีดจำกัดปฏิบัติการของผู้ใช้ [LH16]; maximum demonstrated 24 kt ในสเปกของผู้ผลิต [LP29]"
   },
   "stall_characteristics": {
    "v": {
     "warning": "stick shaker",
     "warning_margin_kt": [
      5,
      10
     ],
     "buffet_margin_kt": 3,
     "roll_off": "ซ้ายเมื่อ > 60 % torque แม้ใช้ rudder/aileron ขวาเต็ม; แฟลปทำให้แย่ลง",
     "recovery": "MAX power, ผ่อนคัน, wings level, ball กลาง, AOA < 18 units",
     "altitude_loss_ft": 450,
     "altitude_loss_m": 137
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LP19",
     "LP27",
     "LC2",
     "LF1",
     "LG5"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ตัวเลข margin จาก flashcard [LP19]; ความสูงที่เสียตอน stall และแก้ 450 ft (137 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": true,
     "entry_min_ft_msl": 13500,
     "prohibited_below_ft_pa": 10000,
     "prohibited_above_ft_pa": 22000,
     "max_aggravated_turns": 2,
     "s_per_turn": [
      2,
      3
     ],
     "ft_per_turn": [
      400,
      500
     ],
     "stabilised_kias": [
      120,
      135
     ],
     "recovery_ft": "≈500 ft/รอบ + 1,500–2,000 ft"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LH15",
     "LP19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขลักษณะ spin จาก flashcard (ต่ำ); ขีดจำกัดความสูงจาก ops limits (สูง); 13,500 ft = 4,115 m"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "TO": 150,
      "LDG": 150
     },
     "final_kias": {
      "UP": 110,
      "TO": 105,
      "LDG": 100
     },
     "notes": "แฟลปเพิ่ม roll-off ตอน stall"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LH16",
     "LP19"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "trim_technique": {
    "v": "trim ไฟฟ้า ลำดับ rudder → elevator → aileron; Trim Aid Device trim rudder ตามกำลัง/ความเร็ว (WOW off > 80 KIAS)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH14",
     "LP21"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6) (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 44,
      "cruise": 44,
      "min": 26,
      "max": 44
     },
     "fs_per_g_lbf": {
      "approach": 10,
      "cruise": 10,
      "min": 5.9,
      "max": 10
     },
     "grad_N_per_kt": {
      "approach": 0.72,
      "cruise": 0.36
     },
     "flare_pull_N": 15,
     "model_fs_per_g_N": {
      "approach": 50.1,
      "cruise": 49.5
     },
     "bounds": {
      "band_lbf_per_g": [
       5.83,
       13.2
      ],
      "cfr23_155_force_lbf": 35,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 2574.6 kg ได้ Fs/g 50.1 N (approach 100 KCAS) / 49.5 N (cruise 200 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (10 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 0.9; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 6 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -1.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (100 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 7,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 9.1°); คู่มือ T-6: สูงกว่า takeoff attitude 7–10° เล็กน้อย [LH15]"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft = 2.3 m) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 100,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "t6c": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 10.1,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP29",
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 85 KIAS ที่ 6,300 lb [LP29]; เทคนิคเดียวกับ T-6A (7–10° NH) [LH15]; มวลฝึก 2,776 kg หนักกว่า T-6A จึงยกหัวช้ากว่าเล็กน้อย; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": 15.3,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 2860
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP29",
      "LP27",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VY 140 KIAS [LP29]; ROC 2,860 fpm (14.5 m/s) ค่าประมาณของบัตร 07; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 10.6,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 2500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วเดียวกับ T-6A [LH14]; rate ผู้เขียนตั้ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": 0.1,
      "power": "≈50 % + 1 %/1,000 ft MSL",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Table 2.1: 250 KIAS ≈ 93 % 2° NL; 200 KIAS 0°; 150 KIAS 32 % 2° NH (สูตร 08.1 ได้ −0.1° ที่ 200 KIAS, T-LH-52); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.2,
      "power": "≈10–20 %",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 10 % ใช้ลดสู่ pattern altitude; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": 5.4,
      "power": "≈31 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อลงเมื่อ < 150 KIAS; abeam ลดเป็น 15 %; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -3.5,
      "power": "≈15 %",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "approach turn 120/115/110 (UP/TO/LDG), 90 position 400 ft AGL; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 104,
      "pitch_deg": -1.3,
      "power": "ตามต้อง (≥ on-speed AOA)",
      "flap": "LDG",
      "rate_fpm": -550
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP27",
      "LP20",
      "LP31",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 104 kt IAS ที่มวลฝึก (D1); final 100 KIAS ของ T-6A สเกลด้วย √(มวล) ตามบัตร 07; รายงานบิน T-6C: short final 110 KIAS แตะ 100 [LP31]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 92,
      "ias_range_kt": [
       104,
       79
      ],
      "pitch_deg": 7.1,
      "pitch_start_deg": -1.3,
      "power": "idle ที่ 5–10 ft",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 2.3
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ลดกำลังสู่ idle ที่ 5–10 ft แล้วตั้ง landing attitude และ flare ใน ground effect (Fig 6-10); ค่าประมาณ: ความเร็วลดจาก final 104 ถึงแตะ 79 KIAS (ค่ากลาง 92); pitch เพิ่มจาก -1.3° (final) ถึง 7.1° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 2.3 m (8 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 79,
      "pitch_deg": 7.1,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP31",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "เทคนิคเดียวกับ T-6A; รายงานบินให้แตะราว 100 KIAS [LP31] (เร็วกว่าค่าประมาณ 1.05 VS0 ซึ่งเป็นปลาย flare); ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 74.8 KCAS จาก CLmax_target ของบัตร) = 78.6 KCAS (79 KIAS, 40.4 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.473 ที่ h/b 0.105, รอบที่ 1 §2.4) 7.1° นอก ground effect 9.1°"
    },
    "go_around": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": 11.1,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ias และ rate; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "wet": 10,
     "icy": 5,
     "touch_and_go": 20,
     "formation": 15,
     "tailwind_takeoff": 10,
     "limitation": true,
     "demonstrated": 24
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP29"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ใช้ขีดจำกัดของ T-6A (เอกสารของผู้ใช้ไม่แยก T-6C) [LH16]; demonstrated 24 kt [LP29]"
   },
   "stall_characteristics": {
    "v": {
     "warning": "stick shaker",
     "warning_margin_kt": [
      5,
      10
     ],
     "roll_off": "เหมือน T-6A",
     "altitude_loss_ft": 470,
     "altitude_loss_m": 143
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LP19",
     "LP27",
     "LC2",
     "LF1",
     "LG5"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลักษณะเดียวกับ T-6A (โครงเดียวกัน); ความสูงที่เสียตอน stall และแก้ 470 ft (143 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "TO": 150,
      "LDG": 150
     },
     "notes": "เหมือน T-6A: แฟลปเพิ่ม roll-off ตอน stall"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LP5",
     "LP29",
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "VFE ผ่านบัตร 07"
   },
   "trim_technique": {
    "v": "trim ไฟฟ้า ลำดับ rudder → elevator → aileron; Trim Aid Device trim rudder ตามกำลัง/ความเร็ว (WOW off > 80 KIAS)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH14",
     "LP21"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6) (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 44,
      "cruise": 44,
      "min": 26,
      "max": 44
     },
     "fs_per_g_lbf": {
      "approach": 10,
      "cruise": 10,
      "min": 5.9,
      "max": 10
     },
     "grad_N_per_kt": {
      "approach": 0.7,
      "cruise": 0.37
     },
     "flare_pull_N": 16,
     "model_fs_per_g_N": {
      "approach": 53.2,
      "cruise": 52.7
     },
     "bounds": {
      "band_lbf_per_g": [
       5.83,
       14
      ],
      "cfr23_155_force_lbf": 35,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 2775.5 kg ได้ Fs/g 53.2 N (approach 104 KCAS) / 52.7 N (cruise 200 KCAS); อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (10 lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน 0.84; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 6 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -1.3,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (104 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 7.1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 9.1°); คู่มือ T-6: สูงกว่า takeoff attitude 7–10° เล็กน้อย [LH15]"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft = 2.3 m) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 104,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "pc9m": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6"
    },
    "rotation": {
     "v": {
      "ias_kt": 78,
      "pitch_deg": 8.6,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP27",
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: VR 78 kt CAS ของบัตร 07 (≈ 1.05 VS แฟลป TO); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 136,
      "pitch_deg": 14.5,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 3000
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP27",
      "LP29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: VY 136 kt CAS ของบัตร 07 (lp_perf.mjs); rate ผู้เขียนตั้งต่ำกว่า ROC ของบัตร; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 9.5,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.6,
      "power": "≈50 % + 1 %/1,000 ft MSL (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.9,
      "power": "≈10–20 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 107,
      "pitch_deg": 5,
      "power": "≈31 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 98,
      "pitch_deg": -4.4,
      "power": "≈15 % (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": -1,
      "power": "ตามต้อง (≥ on-speed AOA) (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt CAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP20",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 90 kt CAS ที่มวลฝึก (D1); ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 81,
      "ias_range_kt": [
       90,
       71
      ],
      "pitch_deg": 6,
      "pitch_start_deg": -1,
      "power": "idle ที่ 5–10 ft (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 2.3
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: ความเร็วลดจาก final 90 ถึงแตะ 71 KIAS (ค่ากลาง 81); pitch เพิ่มจาก -1° (final) ถึง 6° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 2.3 m (8 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 71,
      "pitch_deg": 6,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 67.3 KCAS จาก CLmax_target ของบัตร) = 70.7 KCAS (71 KIAS, 36.4 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.472 ที่ h/b 0.105, รอบที่ 1 §2.4) 6° นอก ground effect 8°"
    },
    "go_around": {
     "v": {
      "ias_kt": 98,
      "pitch_deg": 11.7,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ค่าคลาส T-6 (ไม่มีค่าสาธารณะของแบบนี้)"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ],
     "altitude_loss_ft": 380,
     "altitude_loss_m": 116
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LP19",
     "LP27",
     "LC2",
     "LF1",
     "LG5"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: คลาส T-6; ความสูงที่เสียตอน stall และแก้ 380 ft (116 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": "aerobatic category (รายละเอียดไม่เปิดเผย)"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "TCDS/fact sheet"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "TO": 150,
      "LDG": 150
     },
     "balloon_dn_g": {
      "UPtoTO_140kt_upper_bound": 0.75
     },
     "approach_alpha_drop_deg": 3,
     "notes": "แฟลป split/plain ใต้ปีก (ค่าประมาณ: เทคนิคคลาส T-6: ลดความเร็วก่อนกางแล้ว trim หัวลงเล็กน้อย)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP27",
     "LH15",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: VFE {\"TO\":150,\"LDG\":150} kt CAS จาก TCDS ผ่านบัตร 07; balloon และ Δα (downwind แฟลป UP เทียบ final แฟลป LDG) จาก lh_attitude.mjs"
   },
   "trim_technique": {
    "v": "ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LP21"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6) (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 37,
      "cruise": 37,
      "min": 26,
      "max": 44
     },
     "fs_per_g_lbf": {
      "approach": 8.4,
      "cruise": 8.3,
      "min": 5.9,
      "max": 10
     },
     "grad_N_per_kt": {
      "approach": 0.62,
      "cruise": 0.28
     },
     "flare_pull_N": 11,
     "model_fs_per_g_N": {
      "approach": 37.4,
      "cruise": 36.8
     },
     "bounds": {
      "band_lbf_per_g": [
       5.83,
       10.5
      ],
      "cfr23_155_force_lbf": 35,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 2123.8 kg ได้ Fs/g 37.4 N (approach 90 KCAS) / 36.8 N (cruise 200 KCAS); อยู่ในขอบเขต ใช้เป็นเป้า; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 6 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (90 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 6,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 8°)"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft = 2.3 m) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 90,
      "unit": "kt CAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "pc7mk2": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6"
    },
    "rotation": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 9,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP27",
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: VR 76 kt CAS ของบัตร 07 (≈ 1.05 VS แฟลป TO); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 136,
      "pitch_deg": 12.3,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 2500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LP27",
      "LP29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: VY 136 kt CAS ของบัตร 07 (lp_perf.mjs); rate ผู้เขียนตั้งต่ำกว่า ROC ของบัตร; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 9.4,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.7,
      "power": "≈50 % + 1 %/1,000 ft MSL (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.9,
      "power": "≈10–20 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 104,
      "pitch_deg": 5.3,
      "power": "≈31 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": -4.2,
      "power": "≈15 % (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 89,
      "pitch_deg": -1.1,
      "power": "ตามต้อง (≥ on-speed AOA) (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt CAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP20",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 89 kt CAS ที่มวลฝึก (D1); ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 79,
      "ias_range_kt": [
       89,
       69
      ],
      "pitch_deg": 6.3,
      "pitch_start_deg": -1.1,
      "power": "idle ที่ 5–10 ft (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 2.3
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: ความเร็วลดจาก final 89 ถึงแตะ 69 KIAS (ค่ากลาง 79); pitch เพิ่มจาก -1.1° (final) ถึง 6.3° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 2.3 m (8 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 69,
      "pitch_deg": 6.3,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6; ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 65.9 KCAS จาก CLmax_target ของบัตร) = 69.2 KCAS (69 KIAS, 35.6 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.472 ที่ h/b 0.105, รอบที่ 1 §2.4) 6.3° นอก ground effect 8.3°"
    },
    "go_around": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": 12.3,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LP27",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ค่าคลาส T-6 (ไม่มีค่าสาธารณะของแบบนี้)"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ],
     "altitude_loss_ft": 360,
     "altitude_loss_m": 110
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LP19",
     "LP27",
     "LC2",
     "LF1",
     "LG5"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: คลาส T-6; ความสูงที่เสียตอน stall และแก้ 360 ft (110 m) จากบัตร (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)"
   },
   "spin": {
    "v": {
     "approved": "aerobatic category (รายละเอียดไม่เปิดเผย)"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "TCDS/fact sheet"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "TO": 150,
      "LDG": 150
     },
     "balloon_dn_g": {
      "UPtoTO_140kt_upper_bound": 0.77
     },
     "approach_alpha_drop_deg": 3.4,
     "notes": "แฟลป split/plain ใต้ปีก (ค่าประมาณ: เทคนิคคลาส T-6: ลดความเร็วก่อนกางแล้ว trim หัวลงเล็กน้อย)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP27",
     "LH15",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: VFE {\"TO\":150,\"LDG\":150} kt CAS จาก TCDS ผ่านบัตร 07; balloon และ Δα (downwind แฟลป UP เทียบ final แฟลป LDG) จาก lh_attitude.mjs"
   },
   "trim_technique": {
    "v": "ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LP21"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6) (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "stick",
     "fs_per_g_N": {
      "approach": 37,
      "cruise": 36,
      "min": 26,
      "max": 44
     },
     "fs_per_g_lbf": {
      "approach": 8.2,
      "cruise": 8.1,
      "min": 5.9,
      "max": 10
     },
     "grad_N_per_kt": {
      "approach": 0.61,
      "cruise": 0.27
     },
     "flare_pull_N": 11,
     "model_fs_per_g_N": {
      "approach": 36.6,
      "cruise": 36.1
     },
     "bounds": {
      "band_lbf_per_g": [
       5.83,
       10.1
      ],
      "cfr23_155_force_lbf": 35,
      "cfr23_143_temporary_lbf": 60,
      "cfr23_143_one_hand_lbf": 60,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร ที่มวลฝึก 2068.8 kg ได้ Fs/g 36.6 N (approach 89 KCAS) / 36.1 N (cruise 200 KCAS); อยู่ในขอบเขต ใช้เป็นเป้า; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 6 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -1.1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (89 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 6.3,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 8.3°)"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft = 2.3 m) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 89,
      "unit": "kt CAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "p2006t": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "ใบพัดเต็มหน้า คันเร่งเต็ม (กำลังวิ่งขึ้นไม่เกิน 5 นาที)",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3"
     ],
     "conf": "สูง",
     "est": false,
     "note": "trim pitch และ rudder ตั้งกลางก่อนวิ่งขึ้น (S4-23/24); ตรวจค่าเครื่องในแถบเขียว (S4-25)"
    },
    "rotation": {
     "v": {
      "ias_kt": 64,
      "pitch_deg": 5.5,
      "power": "เต็ม",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 64 KIAS (32.9 m/s) ที่ 1,180 kg, 65 ที่ 1,230 kg (S4-7); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 14.1,
      "power": "เต็ม แล้ว MCP 2,250 rpm เมื่อสูงปลอดภัย",
      "flap": "UP",
      "rate_fpm": 1105
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LG4",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VY 80 KIAS (41.2 m/s) แฟลป UP ที่ 1,180 kg (S4-7); ล้อขึ้นเมื่อ positive rate ที่ VY/VX ภายในราว 20 s และ AFM ระบุว่าแฟลป UP ไต่ดีที่สุดเสมอ (S4-25); ROC 1,105 fpm (5.6 m/s) ค่าประมาณของบัตร 12 [LG4]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 9.1,
      "power": "MCP: ลด MAP ก่อนแล้วลด rpm ≤ 2,250",
      "flap": "UP",
      "rate_fpm": 800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ลำดับลดกำลัง MAP ก่อน rpm (S4-3, S4-25); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "cruise": {
     "v": {
      "ias_kt": 135,
      "pitch_deg": -0.4,
      "power": "≈25 inHg / 2,250 rpm ≈ 75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LG10",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "rpm cruise 1,900–2,250 carb heat ตามต้อง (S4-26); 25 inHg ≈ 75 % ได้ 142 KTAS ที่ 3,500 ft −8 °C [LG10]; ias ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "descent": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -1.2,
      "power": "ลด MAP, ใบพัด 2,250 rpm (MCP), carb heat ตามต้อง",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ใบพัดตั้ง MCP 2,250 rpm สำหรับ descent/approach (S4-27); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": -1.9,
      "power": "ตามต้อง ใบพัด 2,250 rpm",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "approach แฟลป T/O 90 KIAS (S4-7); แฟลป T/O เมื่อต่ำกว่า VFE 119 KIAS, ล้อลงเมื่อต่ำกว่า VLO และตรวจไฟเขียวสามดวง (S4-27); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "base": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": -3.3,
      "power": "ตามต้อง",
      "flap": "T/O",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS ระหว่าง approach 90 และ final 70; แฟลป FULL เมื่อต่ำกว่า 93 KIAS บน final (S4-27); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "final": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": -1.6,
      "power": "ตามต้อง ใบพัดเต็มหน้า carb heat OFF",
      "flap": "FULL",
      "rate_fpm": -370
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "บัตร speeds.VAPP_kt 70 kt IAS ที่มวลฝึก (D1); final 70 KIAS (36.0 m/s) แฟลป FULL ที่ 1,180 kg, 71 ที่ 1,230 kg (S4-7, S4-27); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    },
    "flare": {
     "v": {
      "ias_kt": 63,
      "ias_range_kt": [
       70,
       56
      ],
      "pitch_deg": 5.2,
      "pitch_start_deg": -1.6,
      "power": "idle",
      "flap": "FULL",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt IAS, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LG3",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "AFM ไม่บรรยาย flare; ใช้เทคนิค AFH; ค่าประมาณ: ความเร็วลดจาก final 70 ถึงแตะ 56 KIAS (ค่ากลาง 63); pitch เพิ่มจาก -1.6° (final) ถึง 5.2° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ 4.6 m (15 ft) ล้อ; อัตราจมท้าย flare 120 fpm"
    },
    "touchdown": {
     "v": {
      "ias_kt": 56,
      "pitch_deg": 5.2,
      "power": "idle",
      "flap": "FULL",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "AFM ให้ touchdown 65 KIAS (S4-27) ซึ่งสูงกว่าค่าประมาณปลาย flare 1.05 VS0 ของสคริปต์ (ซิมควรถือ 65 เป็นความเร็วเริ่ม flare); ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 54.2 KCAS จาก CLmax_target ของบัตร) = 56.9 KCAS (56 KIAS, 29.3 m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ 0.405 ที่ h/b 0.134, รอบที่ 1 §2.4) 5.2° นอก ground effect 6.6°"
    },
    "go_around": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": 6.3,
      "power": "ใบพัดเต็มหน้าก่อน แล้วคันเร่งเต็ม",
      "flap": "T/O",
      "rate_fpm": 400
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LG3",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "แฟลป T/O, ไม่ต่ำกว่า 62 KIAS แล้วไต่ที่ VY/VX, ล้อขึ้นเมื่อ positive rate แล้วแฟลป UP (S4-28); ias 70 และ rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 17,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LG5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "maximum demonstrated crosswind 17 kt (8.7 m/s) (AFM p5-6) ผ่านบัตร 12"
   },
   "stall_characteristics": {
    "v": {
     "buffet_onset_kt": 50,
     "behaviour": "ไม่รุนแรง",
     "oei_stall": "ห้าม",
     "altitude_loss_ft": 180,
     "altitude_loss_m": 55
    },
    "u": "kt, ft, m",
    "scope": "aircraft",
    "src": [
     "LH22",
     "LH21",
     "LG5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "บทความทดสอบ; POH p.2-22; ความสูงที่เสียตอน stall และแก้ 180 ft (55 m) จากบัตร"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH21"
    ],
    "conf": "สูง",
    "est": false,
    "note": "POH p.2-22, 3-44"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "T/O": 119,
      "FULL": 93
     },
     "balloon_dn_g": {
      "UPtoTO_100kt_upper_bound": 0.92,
      "TOtoFULL_85kt_upper_bound": 0.2
     },
     "best_climb_flaps": "UP",
     "notes": "AFM: ไต่ดีที่สุดที่แฟลป UP เสมอ (S4-25); แฟลป T/O บน downwind ต่ำกว่า 119 KIAS, FULL บน final ต่ำกว่า 93 KIAS (S4-27); AFM ไม่บรรยายผลต่อ pitch/trim"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LG1",
     "LG2",
     "LG3",
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs กับบัตร 12 (ขอบบน: แฟลปกางทันทีและถือ α เดิม)"
   },
   "trim_technique": {
    "v": "ล้อ trim มือของ stabilator (anti-servo tab; electric trim เป็นอุปกรณ์เลือกติด) และ rudder trim ไฟฟ้าที่คันบังคับ; ตั้ง trim pitch และ rudder กลางก่อนวิ่งขึ้น; เพิ่มกำลัง: ใบพัดก่อนแล้ว MAP, ลดกำลัง: MAP ก่อนแล้วใบพัด; trim rudder ใหม่เมื่อเปลี่ยนกำลังสองเครื่องไม่เท่ากัน",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LG3",
     "LG9",
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH (AFM บท 4 ไม่บรรยาย); ค่าสาธิต 17 kt; ปีกสูง ใบพัดสองข้างไม่หมุนสวนกัน",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LG5"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "คันบังคับแบบพวงมาลัย (yoke) สลิงและ push-rod ไม่มี booster; stabilator ทั้งชิ้นพร้อม anti-servo tab (โมเดล hinge ของรอบที่ 1 ใช้ไม่ได้ เป้าตัวเลขอยู่ใน ops.stick_force เป็นแถบกลาง)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LG9",
     "LG1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_force": {
    "v": {
     "controller": "wheel",
     "fs_per_g_N": {
      "approach": 87,
      "cruise": 87,
      "min": 56,
      "max": 119
     },
     "fs_per_g_lbf": {
      "approach": 19.6,
      "cruise": 19.6,
      "min": 12.5,
      "max": 26.7
     },
     "grad_N_per_kt": null,
     "flare_pull_N": null,
     "model_fs_per_g_N": null,
     "bounds": {
      "band_lbf_per_g": [
       12.5,
       48.1
      ],
      "cfr23_155_force_lbf": 26,
      "cfr23_143_temporary_lbf": 75,
      "cfr23_143_one_hand_lbf": 50,
      "cfr23_143_prolonged_lbf": 10
     }
    },
    "u": "N/g, lbf/g, N/kt, N, lbf",
    "scope": "aircraft",
    "src": [
     "LH0",
     "R1:C12",
     "R1:C16",
     "R1:C20",
     "LH30",
     "LM3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (lh_stick.mjs): stabilator (all-moving tail + anti-servo tab): round-1 elevator hinge model not valid: ใช้กลางแถบ; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = 2.8 g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
   },
   "approach_pitch_deg": {
    "v": -1.6,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (70 kt, path 3°, มวลฝึก) จาก lh_attitude.mjs"
   },
   "touchdown_pitch_deg": {
    "v": 5.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect 6.6°)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 70,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป FULL + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "pa28_161": {
  "ops": {
   "attitude_power": {
    "rotation": {
     "v": {
      "ias_kt": 50,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "short field 50 KIAS (Warrior, p.41) แฟลปตามคู่มือ"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 79,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "Vy 79, Vx 63 (p.22)"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 87,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": null,
      "power": "ลดเริ่ม descent",
      "flap": null,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "เริ่มลดที่ abeam ≈ 90 kt; แฟลปตามต้อง"
    },
    "base": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "-",
      "flap": null,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "เลี้ยวที่ 45° จากจุดแตะ; แฟลปตามต้อง"
    },
    "final": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": null,
      "power": "ตาม path",
      "flap": "40",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19",
      "LN3"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 70 kt IAS ที่มวลฝึก (D1); โรงเรียนต้นทางใช้ 65 KIAS +½ gust; stabilised ไม่ต่ำกว่า 300 ft AGL (p.43)"
    },
    "flare": {
     "v": {
      "ias_kt": 58,
      "ias_range_kt": [
       70,
       46
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "40",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 70 ถึง ≈ 1.05 VS0 = 46 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    },
    "go_around": {
     "v": {
      "ias_kt": 63,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "25",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "เก็บแฟลปขั้นแรก (40 → 25) ทันที; pitch Vx แล้ว Vy"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 17,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตาราง V-speeds ของโรงเรียน p.22 (ไม่ระบุว่าสาธิตหรือจำกัด)"
   },
   "spin": {
    "v": {
     "approved": "ไม่ยืนยันในรอบนี้"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "โรงเรียนต้นทางอนุญาต spin เฉพาะใน C152"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 70,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 40",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "be76": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "flashcard ผู้ใช้: ลดเป็น 25 inHg / 2,500 rpm เมื่อพ้นปลายรันเวย์ (end of runway power)"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": null,
      "power": "25 inHg / 2,500 rpm",
      "flap": "0",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "cruise": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": null,
      "power": "21 inHg / 2,300 rpm",
      "flap": "0",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "descent": {
     "v": {
      "ias_kt": 115,
      "pitch_deg": null,
      "power": "20 inHg / 2,300 rpm",
      "flap": "0",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "หรือ 15 inHg 105 KIAS"
    },
    "downwind": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": null,
      "power": "18 inHg / 2,300 rpm",
      "flap": "10",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "แฟลป 10 บน downwind; abeam 15 inHg 90 KIAS"
    },
    "base": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": null,
      "power": "≈15 inHg",
      "flap": "20",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "final": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "props full forward",
      "flap": "35",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20",
      "LN5"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 80 kt IAS ที่มวลฝึก (D1); 76 KIAS short final (flashcard)"
    },
    "flare": {
     "v": {
      "ias_kt": 72,
      "ias_range_kt": [
       80,
       63
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "35",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 80 ถึง ≈ 1.05 VS0 = 63 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    },
    "go_around": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": null,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "pitch Vy 85; แฟลปตามต้อง"
    }
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 80,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 35 + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "p2002jf": {
  "ops": {
   "attitude_power": {
    "initial_climb": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "TO",
      "rate_fpm": 800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ROC SL ที่ 620 kg"
    },
    "cruise": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "118 kt ที่ 6,500 ft"
    },
    "final": {
     "v": {
      "ias_kt": 52,
      "pitch_deg": null,
      "power": "-",
      "flap": "LDG",
      "rate_fpm": null
     },
     "u": "kt CAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26",
      "LH25",
      "LN11"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 52 kt CAS ที่มวลฝึก (D1); VFE LDG 67 KIAS"
    },
    "flare": {
     "v": {
      "ias_kt": 46,
      "ias_range_kt": [
       52,
       40
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 52 ถึง ≈ 1.05 VS0 = 40 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    }
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 52,
      "unit": "kt CAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "p68c": {
  "ops": {
   "attitude_power": {
    "final": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": null,
      "power": "-",
      "flap": "35",
      "rate_fpm": null
     },
     "u": "kt CAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH27",
      "LN14"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 74 kt CAS ที่มวลฝึก (D1); แฟลป 30–35°; VFE 30–35° 99 KCAS, VMC 60 KCAS [LH27]"
    },
    "flare": {
     "v": {
      "ias_kt": 66,
      "ias_range_kt": [
       74,
       58
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "35",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 74 ถึง ≈ 1.05 VS0 = 58 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    }
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 74,
      "unit": "kt CAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป 35 + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "t206h": {
  "ops": {
   "attitude_power": {
    "cruise_climb": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "2,400 rpm / 30 inHg",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH24"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "cowl flaps open"
    },
    "cruise": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "65–75 % (lean 75 °F ROP TIT)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH24"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "65–75 % ตาม POH p.7-38 (ช่วง 50 ชม.แรก); lean ด้วย TIT ได้ที่ ≤ 75 % MCP, 75 °F (42 °C) ROP p.4-37/4-38"
    },
    "final": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": null,
      "power": "-",
      "flap": "FULL",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH23",
      "LN18"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 75 kt IAS ที่มวลฝึก (D1); แฟลป 10–FULL"
    },
    "flare": {
     "v": {
      "ias_kt": 66,
      "ias_range_kt": [
       75,
       57
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "FULL",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 75 ถึง ≈ 1.05 VS0 = 57 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    }
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH23"
    ],
    "conf": "สูง",
    "est": false,
    "note": "POH p.2-9"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 75,
      "unit": "kt IAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป FULL",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```

```json
{
 "ct4": {
  "ops": {
   "attitude_power": {
    "final": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": null,
      "power": "-",
      "flap": "LDG",
      "rate_fpm": null
     },
     "u": "kt CAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH28",
      "LN22"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บัตร speeds.VAPP_kt 60 kt CAS ที่มวลฝึก (D1); ผู้ใช้ทางทหาร แบบทั่วไป; VFE TO 100 / LDG 85 kt CAS จาก TCDS [LH28]"
    },
    "flare": {
     "v": {
      "ias_kt": 54,
      "ias_range_kt": [
       60,
       47
      ],
      "pitch_deg": null,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120,
      "flare_height_m": 4.6
     },
     "u": "kt, deg, -, -, fpm, m",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความเร็วจาก VAPP 60 ถึง ≈ 1.05 VS0 = 47 kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout 4.6 m (15 ft) ตาม AFH [LH1]"
    }
   },
   "spin": {
    "v": {
     "approved": "CT/4E acrobatic category; CT/4A acrobatic + normal"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH28"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "TCDS ไม่ให้รายละเอียด spin"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 60,
      "unit": "kt CAS",
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลป LDG",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s"
   }
  }
 }
}
```
