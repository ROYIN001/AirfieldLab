<!-- a320ceo: 65 leaf -->
```json
{
 "a320ceo": {
  "controls": {
   "fbw": {
    "computers": {"v":{"pitch_roll":"2 ELAC + 3 SEC","yaw":"2 FAC (rudder ต่อ pedal ทางกล)","air_data":"3 ADIRU; ELAC ใช้ AoA เฉลี่ยของ ADR1/ADR2"},"u":"-","scope":"aircraft","src":["Z13","Z1","Z7"],"conf":"สูง","est":false,"note":"คอมพิวเตอร์ทั้งหมดทำงานพร้อมกัน"},
    "update_rate_hz": {"v":240,"u":"Hz","scope":"sim","src":["Z14","Z39"],"conf":"ต่ำ","est":true,"note":"คาบจริงของ ELAC ไม่พบในแหล่งสาธารณะ; ใช้ขั้นฟิสิกส์ 240 Hz ของ AirfieldLab"},
    "normal_law": {
     "pitch": {
      "command": {"v":"C_star_nz_integral","u":"-","scope":"aircraft","src":["Z1","Z2","Z12","Z8"],"conf":"สูง","est":false,"note":"คันสั่ง load factor (สูง); รูป C* = dnz + (Vco/g)q และ integral เป็นค่าประมาณตาม Z12"},
      "stick_to_dnz": {"v":{"clean":{"pull_full":1.5,"push_full":-2},"slats_flaps":{"pull_full":1,"push_full":-1}},"u":"g (เทียบ 1 g)","scope":"aircraft","src":["Z1","Z11","Z22","Z19"],"conf":"สูง","est":true,"note":"ปลายช่วงจากขีด nz (สูง); ระหว่างกลางเชิงเส้นตามคัน (ค่าประมาณ)"},
      "Vco": {"v":121.9,"u":"m/s","scope":"aircraft","src":["Z17","Z12"],"conf":"กลาง","est":true,"note":"400 ft/s = 237 kt; FBW A32NX ใช้ 100 m/s (Z19)"},
      "gains": {"v":{"Kp":0.06,"Ki":0.2,"qbar0":8000,"sched_min":0.3,"sched_max":4},"u":"rad/g, rad/(g s), Pa, -, -","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เลือกด้วยต้นแบบ z_fbw_proto.mjs; gain คูณ clamp(qbar0/qbar, 0.3, 4)"},
      "path_hold": {"v":{"Kg":1,"Kgi":0.2,"dnz_max":0.3},"u":"1/s, 1/s2, g","scope":"aircraft","src":["Z1","Z39"],"conf":"ต่ำ","est":true,"note":"ถือ gamma เมื่อคันกลางและ |phi| <= 33 deg (Z1: maintains the flight path); Kg 2.0 แกว่ง"},
      "bank_compensation_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z32","Z33","Z19"],"conf":"กลาง","est":false,"note":"nz_ref = cos(theta)/cos(min(|phi|, 33 deg))"},
      "autotrim_nz_window": {"v":[0.5,1.3],"u":"g","scope":"aircraft","src":["Z33","Z19"],"conf":"กลาง","est":false,"note":"1.3 g จาก Z33; ขอบล่าง 0.5 g และ FBW ใช้ 1.25 g (Z19)"},
      "autotrim_bank_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z33"],"conf":"กลาง","est":false,"note":"FBW A32NX ใช้ 30 deg (Z19)"},
      "autotrim_freeze_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25","Z26"],"conf":"ต่ำ","est":false,"note":"50 ft RA: THS ตรึงเมื่อเข้า flare"},
      "autotrim_gain_Kt": {"v":0.5,"u":"1/s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"อัตรา THS = clamp(Kt*de, rate max ของ controls.trim หัวข้อ 7)"},
      "autotrim_inhibit": {"v":{"alpha_prot":"no_nose_up","hsp":"frozen","direct_law":"off","abnormal_phase1":"off"},"u":"-","scope":"aircraft","src":["Z7","Z22","Z32","Z3"],"conf":"สูง","est":false,"note":"D-AXLA: ถึง alpha prot หยุด nose-up trim"},
      "ths_autotrim_nose_up_limit": {"v":-11,"u":"deg","scope":"aircraft","src":["Z7","Z19"],"conf":"กลาง","est":false,"note":"BEA D-AXLA: THS ถึง nose-up stop -11 deg; ตรวจเครื่องหมายกับ controls.trim (หัวข้อ 7)"}
     },
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z8","Z19","Z25"],"conf":"สูง","est":false,"note":"50 ft RA: จำค่า theta"},
      "blend_RA": {"v":[15.24,9.144],"u":"m","scope":"aircraft","src":["Z8"],"conf":"สูง","est":false,"note":"50 ถึง 30 ft: เทอม nz ถูกแทนด้วยเทอม theta (Habsheim 1988)"},
      "nose_down_target": {"v":-2,"u":"deg","scope":"aircraft","src":["Z8","Z19","Z25"],"conf":"กลาง","est":false,"note":"จาก 30 ft ลด theta อ้างอิงไป -2 deg; FCOM ceo บางฉบับไม่เขียนแล้ว (Z25)"},
      "nose_down_time": {"v":8,"u":"s","scope":"aircraft","src":["Z8","Z19"],"conf":"กลาง","est":false,"note":"rate = (max(-2, theta_memo) + 2)/8 deg/s"},
      "gains": {"v":{"K_theta":0.8,"K_q":1,"stick_theta_deg":10},"u":"1/s, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"e = (V/g)(K_theta (theta - theta_cmd) + K_q theta_dot); w = clamp((50 - RA_ft)/20, 0, 1)"}
     },
     "ground_mode": {
      "stick_to_elevator": {"v":"direct","u":"-","scope":"aircraft","src":["Z28","Z33"],"conf":"ต่ำ","est":false,"note":"ไม่มี auto-trim บนพื้น"},
      "blend_after_liftoff": {"v":5,"u":"s","scope":"aircraft","src":["Z28","Z33"],"conf":"ต่ำ","est":false,"note":"ผสมกฎ ground กับกฎ nz 5 s หลังล้อพ้นพื้น"},
      "transition_logic_model": {"v":{"to_flight":"airborne && (theta > 8 deg || RA > 121.9 m)","to_ground":"onGround && theta < 2.5 deg for 5 s"},"u":"-","scope":"aircraft","src":["Z21"],"conf":"ต่ำ","est":false,"note":"ตรรกะในโมเดล FBW A32NX (RA 400 ft)"}
     },
     "roll": {
      "p_cmd_max": {"v":15,"u":"deg/s","scope":"aircraft","src":["Z1","Z20"],"conf":"สูง","est":false,"note":"0.2618 rad/s ที่คันสุด แปรตามคันเชิงเส้น"},
      "bank_limits": {"v":{"neutral_spiral":33,"full_stick":67,"aoa_prot":45,"hsp":40},"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"ปล่อยคันเกิน 33 deg กลับมา 33 deg; HSP ปล่อยคันกลับ 0 deg"},
      "bank_return_rate": {"v":{"at_33":0,"at_limit":15,"limit_plus_5":20},"u":"deg/s","scope":"aircraft","src":["Z20","Z39"],"conf":"ต่ำ","est":true,"note":"เชิงเส้นระหว่างจุด; HSP: 0 ที่ 0 deg ถึง 15 ที่ 40 deg (Z20)"},
      "gains": {"v":{"wn":2,"zeta":0.8,"Ki_over_Kphi":0.5,"ref_window_deg":1},"u":"rad/s, -, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"pole placement กับ Lp, Lu ที่คำนวณใหม่ทุกขั้น"},
      "turn_coordination": {"v":"r_cmd = g tan(phi)/V; beta -> 0","u":"-","scope":"aircraft","src":["Z13","Z28"],"conf":"กลาง","est":true,"note":"กฎจริงมีเป้า roll rate, sideslip, bank (Z13); สมการเป็นค่าประมาณ"},
      "ap_disconnect_bank": {"v":45,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"autopilot ตัดเมื่อเอียงเกิน 45 deg"}
     }
    },
    "protections": {
     "nz_limits": {"v":{"clean":[-1,2.5],"slats_flaps":[0,2]},"u":"g","scope":"aircraft","src":["Z1","Z11","Z22"],"conf":"สูง","est":false,"note":"คงอยู่ใน alternate law"},
     "g_load_ecam": {"v":[0.7,1.4],"u":"g","scope":"aircraft","src":["Z22"],"conf":"กลาง","est":false,"note":"ECAM G LOAD เมื่ออยู่นอกช่วงนาน > 2 s"},
     "pitch_limits": {"v":{"nose_up_conf0_3":30,"nose_up_conf0_3_low_speed":25,"nose_up_full":25,"nose_up_full_low_speed":20,"nose_down":-15},"u":"deg","scope":"aircraft","src":["Z1","Z22","Z31","Z32"],"conf":"กลาง","est":false,"note":"30/-15 สูง (Z1); ค่าความเร็วต่ำ กลาง; นิยามความเร็วต่ำไม่พบ"},
     "pitch_limit_gain": {"v":0.5,"u":"1/s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"dnz <= (V/g) K (theta_max - theta)"},
     "fd_removal": {"v":{"up":25,"down":-13,"restore_up":22,"restore_down":-10},"u":"deg","scope":"aircraft","src":["Z1","Z22"],"conf":"กลาง","est":false,"note":"25/13 จาก Z1; ค่าคืน 22/10 จาก Z22"},
     "alpha_rule": {"v":{"CL_amax_over_CLmax":0.873,"aprot_below_amax":3,"afloor_below_amax":2.5},"u":"-, deg, deg","scope":"aircraft","src":["Z7","Z8","Z39"],"conf":"ต่ำ","est":true,"note":"ผูกกับเส้นโค้งแรงยกของโมเดล: Vamax/VS1g 1.07 (D-AXLA) และระยะห่างจาก Habsheim"},
     "alpha_anchor_1988_conf3": {"v":{"aprot":14.5,"amax":17.5,"afloor":15},"u":"deg","scope":"aircraft","src":["Z8"],"conf":"สูง","est":false,"note":"A320-111 มาตรฐานปี 1988; afloor ทำงานเมื่อ RA > 100 ft"},
     "alpha_anchor_us1549_conf2": {"v":{"amax":17.5,"alpha_touchdown":[13,14]},"u":"deg","scope":"aircraft","src":["Z30","Z6"],"conf":"กลาง","est":false,"note":"A320-214 ปี 2009 อ้างผ่านฟอรัม"},
     "alpha_floor_fcom": {"v":{"CONF0":9.5,"CONF1":15,"CONF2":15,"CONF3":14,"FULL":13},"u":"deg","scope":"aircraft","src":["Z22"],"conf":"กลาง","est":false,"note":"ค่า FCOM ผ่าน FBW docs; ไม่ตรงกับ alpha ของโมเดล ใช้ alpha_rule แทนในการจำลอง"},
     "alpha_floor_logic": {"v":{"active":"lift-off ถึง RA 30.48 m ขาลง","mach_max":0.6,"stick_deg_with_prot":14},"u":"-, Mach, deg","scope":"aircraft","src":["Z22","Z26","Z8"],"conf":"กลาง","est":false,"note":"สั่ง TOGA ผ่าน A/THR (หัวข้อ 9)"},
     "alpha_mode_logic": {"v":{"entry_lead_s":0.5,"exit_stick":-0.5,"exit_fwd_time_s":0.5,"threshold_rate_limit_degps":1,"takeoff_aprot_eq_amax_s":5},"u":"s, -, s, deg/s, s","scope":"aircraft","src":["Z21","Z26","Z39"],"conf":"ต่ำ","est":true,"note":"latch ตาม Z26; ค่าออกจากโหมดไม่พบในแหล่งสาธารณะ; rate 1 deg/s และ 5 s จากโมเดล Z21"},
     "alpha_mode_gains": {"v":{"kA":4,"kAa":5,"kAd":0.15},"u":"-","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"eA = kA nzA (a - acmd) + kAa nzA a_dot + kAd (Vco/g) theta_dot"},
     "ap_disconnect_alpha_margin": {"v":1,"u":"deg","scope":"aircraft","src":["Z26"],"conf":"ต่ำ","est":false,"note":"AP ตัดที่ alpha prot + 1 deg"},
     "hsp": {"v":{"dV_on":3.087,"dM_on":0.01,"dV_nd_zero":8.231,"dM_nd_zero":0.04,"dV_ap_off":7.717,"dM_ap_off":0.04},"u":"m/s, Mach","scope":"aircraft","src":["Z22","Z13","Z31","Z32"],"conf":"กลาง","est":false,"note":"VMO+6 kt/MMO+0.01 เริ่ม; อำนาจ ND เป็นศูนย์ราว VMO+16 kt/MMO+0.04; AP ตัด VMO+15 kt; Z22 มีที่เขียน +0.015"},
     "hsp_model": {"v":{"tau_pred_s":8,"dnz_slope_g_per_mps":0.1458,"dnz_max":0.75},"u":"s, g/(m/s), g","scope":"aircraft","src":["Z39","Z32"],"conf":"ต่ำ","est":true,"note":"dnz_max 0.75 g = 1.75 g รวม (A330 FCTM ผ่าน Z32); slope 0.075 g/kt"},
     "stall_warning_alpha_landing": {"v":23,"u":"deg","scope":"aircraft","src":["Z7"],"conf":"สูง","est":false,"note":"ใช้ใน alternate/direct; normal law ไม่จำเป็นต้องเตือน (Z9)"}
    },
    "alternate_law": {
     "pitch": {"v":"nz_demand; nz limits kept; no pitch attitude protection","u":"-","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"ALT ของ A320"},
     "low_speed_stability_onset": {"v":[2.572,5.144],"u":"m/s","scope":"aircraft","src":["Z1","Z31"],"conf":"สูง","est":false,"note":"5-10 kt เหนือ stall warning: nose-down ค่อยเป็นค่อยไป ดึงชนะได้"},
     "high_speed_stability": {"v":"nose_up_demand_above_VMO_MMO_overridable","u":"-","scope":"aircraft","src":["Z1","Z23","Z31"],"conf":"กลาง","est":false,"note":"แทน HSP"},
     "roll": {"v":"direct","u":"-","scope":"aircraft","src":["Z1","Z23"],"conf":"สูง","est":false,"note":"ไม่มี bank angle protection และ turn coordination"},
     "yaw_damper_authority": {"v":5,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"+-5 deg rudder"},
     "gear_down_to_direct": {"v":true,"u":"-","scope":"aircraft","src":["Z7","Z23"],"conf":"สูง","est":false,"note":"ALT law + ล้อลง (AP off) = pitch direct"},
     "triggers": {"v":{"reduced_prot":["2 ADR","both ELAC","1 elevator","1 sidestick","2 IR","ELAC1+G or Y hyd","ELAC2+B hyd","all spoilers or 3 SEC","THS jam","G+Y hyd"],"no_prot":["3 ADR","both SFCC slat channels","G+B hyd"]},"u":"-","scope":"aircraft","src":["Z23","Z7"],"conf":"กลาง","est":false,"note":"รายการจาก FBW docs; ELAC ปฏิเสธ ADR > 1 ตัว (Z7 สูง)"}
    },
    "direct_law": {
     "pitch": {"v":"stick_to_elevator; max deflection f(CG, config)","u":"-","scope":"aircraft","src":["Z1","Z31","Z33"],"conf":"สูง","est":false,"note":""},
     "autotrim": {"v":false,"u":"-","scope":"aircraft","src":["Z7","Z3"],"conf":"สูง","est":false,"note":"PFD: USE MAN PITCH TRIM"},
     "roll_rate_max": {"v":{"clean":30,"slats":25},"u":"deg/s","scope":"aircraft","src":["Z31"],"conf":"ต่ำ","est":false,"note":"ใช้ตั้งตัวคูณอำนาจ roll ใน direct law"},
     "triggers": {"v":["3 IR","RA fail with gear down","ALT law + gear down"],"u":"-","scope":"aircraft","src":["Z23","Z7"],"conf":"กลาง","est":false,"note":""}
    },
    "abnormal_attitude": {
     "triggers": {"v":{"bank_deg":125,"pitch_up_deg":50,"pitch_down_deg":-30,"alpha_max_deg":40,"alpha_min_deg":-10,"ias_min":30.867,"ias_max":226.355,"mach_max":0.91},"u":"deg, m/s, Mach","scope":"aircraft","src":["Z23","Z2","Z21"],"conf":"กลาง","est":false,"note":"alpha 30-40 deg และ ias ต่ำ 60-90 kt ตาม theta (Z23); ใช้ค่าในโมเดล Z21"},
     "effect": {"v":"ALT2 with max roll authority; no autotrim in phase 1","u":"-","scope":"aircraft","src":["Z2","Z7","Z23"],"conf":"สูง","est":false,"note":"หลังกู้คืน pitch/yaw อยู่ใน alternate law"}
    },
    "mechanical_backup": {"v":{"pitch":"THS trim wheel","yaw":"rudder pedals"},"u":"-","scope":"aircraft","src":["Z13","Z23","Z32"],"conf":"กลาง","est":false,"note":"ไม่ได้ออกแบบให้ลงจอดในสภาพนี้"},
    "sidestick": {
     "travel": {"v":{"pitch":16,"roll":20},"u":"deg","scope":"aircraft","src":["Z32","Z1"],"conf":"กลาง","est":false,"note":"ตรงกับ controls.inceptors.sidestick ของหัวข้อ 7"},
     "breakout": {"v":4.89,"u":"N","scope":"aircraft","src":["Z27"],"conf":"ต่ำ","est":false,"note":"1.1 lbf"},
     "force_at_stop": {"v":{"pitch":100.1,"roll_out":24.9,"roll_in":34.7},"u":"N","scope":"aircraft","src":["Z27"],"conf":"ต่ำ","est":false,"note":"22.5 / 5.6 / 7.8 lbf"},
     "gradient": {"v":{"pitch":5.949,"roll_out":1.001,"roll_in":1.49},"u":"N/deg","scope":"aircraft","src":["Z27","Z39"],"conf":"ต่ำ","est":true,"note":"(F_stop - breakout)/travel"},
     "ap_override": {"v":{"pitch":50,"roll":35},"u":"N","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"แรงดันผ่าน solenoid detent ขณะ AP ทำงาน (5/3.5 daN)"},
     "dual_input_threshold": {"v":2,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":""},
     "takeover_latch": {"v":40,"u":"s","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":""}
    }
   }
  }
 }
}
```

<!-- a320neo: 1 leaf -->
```json
{
 "a320neo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"A320neo ใช้ flare mode เหมือน ceo (ฟอรัม); ค่าอื่นสืบจาก a320ceo"}
     }
    }
   }
  }
 }
}
```

<!-- a321ceo: 2 leaf -->
```json
{
 "a321ceo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"FCOM A321ceo ตามที่ยกในฟอรัม: THS ตรึงที่ 50 ft; เขียนทับค่าจาก a321neo"}
     },
     "pitch": {
      "autotrim_freeze_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"50 ft RA"}
     }
    }
   }
  }
 }
}
```

<!-- a321neo: 3 leaf -->
```json
{
 "a321neo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"100 ft RA (FCOM A321neo ตามที่ยกในฟอรัม)"},
      "ground_thrust_effect_compensation": {"v":false,"u":"-","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"The flare law does not compensate the ground or thrust effect"}
     },
     "pitch": {
      "autotrim_freeze_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"100 ft RA"}
     }
    }
   }
  }
 }
}
```

<!-- a330_300: 33 leaf -->
```json
{
 "a330_300": {
  "controls": {
   "fbw": {
    "computers": {"v":{"pitch_roll":"3 PRIM (FCPC) + 2 SEC (FCSC)","yaw":"กลไก (รุ่นหลัง FBW)","air_data":"3 ADIRU; FCPC ใช้ AoA เฉลี่ย AOA1/AOA2 หลังแก้ไข"},"u":"-","scope":"aircraft","src":["Z3","Z4","Z13"],"conf":"สูง","est":false,"note":""},
    "update_rate_hz": {"v":240,"u":"Hz","scope":"sim","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
    "normal_law": {
     "pitch": {
      "command": {"v":"C_star_nz_integral","u":"-","scope":"aircraft","src":["Z2","Z12"],"conf":"สูง","est":false,"note":"คันสั่ง load factor (BEA AF447 หน้า 38)"},
      "stick_to_dnz": {"v":{"clean":{"pull_full":1.5,"push_full":-2},"slats_flaps":{"pull_full":1,"push_full":-1}},"u":"g (เทียบ 1 g)","scope":"aircraft","src":["Z32","Z11"],"conf":"กลาง","est":true,"note":"2.5/-1 g clean, 2/0 g slat/flap (A330/340 FCTM)"},
      "Vco": {"v":121.9,"u":"m/s","scope":"aircraft","src":["Z17"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
      "gains": {"v":{"Kp":0.06,"Ki":0.2,"qbar0":8000,"sched_min":0.3,"sched_max":4},"u":"rad/g, rad/(g s), Pa, -, -","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"ยังไม่ได้ทดสอบกับข้อมูล A330; ต้องรันกรณีทดสอบซ้ำ"},
      "path_hold": {"v":{"Kg":1,"Kgi":0.2,"dnz_max":0.3},"u":"1/s, 1/s2, g","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
      "bank_compensation_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"},
      "autotrim_nz_window": {"v":[0.5,1.3],"u":"g","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"เหมือน a320ceo"},
      "autotrim_bank_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":""},
      "autotrim_inhibit": {"v":{"alpha_prot":"no_nose_up","hsp":"frozen","direct_law":"off","abnormal":"off"},"u":"-","scope":"aircraft","src":["Z2","Z3","Z32"],"conf":"กลาง","est":false,"note":"abnormal attitude: ไม่มี auto-trim (Z2)"}
     },
     "flare_mode": {
      "engage_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z29","Z33"],"conf":"ต่ำ","est":false,"note":"100 ft RA"},
      "transition_time": {"v":2,"u":"s","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"flight ไป flare และ flare ไป ground ช่วงละ 2 s"},
      "nose_down_target": {"v":-2,"u":"deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"ไม่พบรายละเอียดของ A330; ใช้ค่าของ A320 ชั่วคราว"},
      "nose_down_time": {"v":8,"u":"s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือนข้างบน"}
     },
     "ground_mode": {
      "blend_after_liftoff": {"v":5,"u":"s","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"อ้าง SmartCockpit A330 ผ่าน Wikipedia"}
     },
     "roll": {
      "p_cmd_max": {"v":15,"u":"deg/s","scope":"aircraft","src":["Z1","Z39"],"conf":"ต่ำ","est":true,"note":"ค่า A320; ของ A330 ไม่พบในแหล่งสาธารณะ"},
      "bank_limits": {"v":{"neutral_spiral":33,"full_stick":67,"aoa_prot":45,"hsp":45},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM: 67 deg ลดเป็น 45 deg เมื่อ HSP"},
      "gains": {"v":{"wn":2,"zeta":0.8,"Ki_over_Kphi":0.5,"ref_window_deg":1},"u":"rad/s, -, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":""}
     }
    },
    "protections": {
     "nz_limits": {"v":{"clean":[-1,2.5],"slats_flaps":[0,2]},"u":"g","scope":"aircraft","src":["Z32","Z3","Z11"],"conf":"สูง","est":false,"note":""},
     "pitch_limits": {"v":{"nose_up":30,"nose_up_low_speed":25,"nose_down":-15},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"},
     "alpha_rule": {"v":{"CL_amax_over_CLmax":0.873,"aprot_below_amax":3,"afloor_below_amax":2.5},"u":"-, deg, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"alpha จริงของ A330 ไม่พบ; ใช้กฎเดียวกับ A320"},
     "stall_warning_alpha_max": {"v":23,"u":"deg","scope":"aircraft","src":["Z3","Z2"],"conf":"สูง","est":false,"note":"ระดับสูงสุดที่ Mach ต่ำ ลดลงเมื่อ Mach สูงขึ้น (AF447)"},
     "alpha_speed_sensitivity": {"v":{"cruise":12.861,"approach":2.572},"u":"m/s per deg","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"25 kt ต่อ 1 deg ที่ cruise, 5 kt ต่อ 1 deg ที่ approach"},
     "hsp": {"v":{"dV_on":3.087,"dM_on":0.01,"dV_nd_zero":8.231,"dM_nd_zero":0.04},"u":"m/s, Mach","scope":"aircraft","src":["Z32","Z22"],"conf":"ต่ำ","est":false,"note":"FCTM: at/above VMO/MMO; ใช้ +6 kt แบบ A320"},
     "hsp_dnz_max": {"v":0.75,"u":"g","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"nose-up สูงสุด 1.75 g"}
    },
    "alternate_law": {
     "alt1_roll": {"v":"normal","u":"-","scope":"aircraft","src":["Z2","Z33"],"conf":"สูง","est":false,"note":"ALT1: roll normal, protections ลดลง"},
     "alt2_roll": {"v":"direct","u":"-","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"ALT2: aileron และ spoiler สั่งตรง"},
     "stall_warning_speed_factor": {"v":1.03,"u":"VS1g","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"แทน high AoA protection"},
     "airspeed_drop_trigger": {"v":{"dCAS":15.433,"dt":1},"u":"m/s, s","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"CAS ที่โหวตตก > 30 kt ใน 1 s เข้า ALT2"}
    },
    "direct_law": {
     "autotrim": {"v":false,"u":"-","scope":"aircraft","src":["Z3"],"conf":"สูง","est":false,"note":"Autotrim was not available in direct law"}
    },
    "abnormal_attitude": {
     "triggers": {"v":{"bank_deg":125},"u":"deg","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"ตัวอย่างเงื่อนไขจาก BEA; อื่น ๆ ใช้ของ a320ceo"}
    },
    "sidestick": {
     "travel": {"v":{"pitch":16,"roll":20},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"}
    }
   }
  }
 }
}
```

<!-- common_airliner: 4 leaf -->
```json
{
 "common_airliner": {
  "fbw": {
   "cert_nz_limits": {"v":{"clean":[-1,2.5],"high_lift":[0,2]},"u":"g","scope":"environment","src":["Z11"],"conf":"สูง","est":false,"note":"FAA special condition ของ FBW g-limiting (EMB-550) ใช้เป็นเกณฑ์ทั่วไป"},
   "high_incidence_cert": {"v":{"vmin_entry_rate":0.514,"icing_decel_max":1.029,"sw_margin_pct":3,"sw_margin":1.543,"full_back_stick_s":3,"turn_bank_deg":30},"u":"m/s/s, m/s/s, %, m/s, s, deg","scope":"environment","src":["Z9","Z10"],"conf":"สูง","est":false,"note":"A321neo XLR special conditions: ใช้ตั้งกรณีทดสอบ alpha protection"},
   "time_delay_budget": {"v":0.1,"u":"s","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"งบหน่วงเวลา Level 1 จากรอบที่ 1 หัวข้อ 6; ขั้น 240 Hz = 4.167 ms"},
   "input_mapping": {"v":{"stick_units":"[-1, 1] หลัง deadzone + expo","expo_gamepad":0.5,"keyboard_ramp_up_per_s":0.5,"keyboard_centre_per_s":2.5},"u":"-","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"ค่าจาก input ของรอบที่ 1 หัวข้อ 11"}
  }
 }
}
```

