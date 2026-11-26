```json
{
 "b737_800": {
  "afcs": {
   "modes": {"v":{"ap":["CMD A","CMD B","CWS A","CWS B"],"lateral":["HDG SEL","LNAV","VOR/LOC","APP(LOC+G/S)","TO/GA","ROLLOUT(option)"],"vertical":["LVL CHG","V/S","VNAV SPD","VNAV PTH","ALT HOLD","ALT ACQ","G/S","FLARE","TO/GA"],"autothrottle":["N1","MCP SPD","FMC SPD","RETARD","ARM","THR HLD","GA"],"annunciation":["1 CH","LAND 2","LAND 3","NO AUTOLAND"]},"u":"-","scope":"aircraft","src":["O19","O20","O23"],"conf":"กลาง","est":false,"note":"ชื่อตาม FMA ที่สรุปจาก FCOM; ROLLOUT และ LAND 2/3 เฉพาะเครื่องที่มี rollout guidance"},
   "arm_engage": {
    "AP_takeoff_min": {"v":121.92,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"400 ft AGL"},
    "AP_single_channel_min": {"v":15.24,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"50 ft AGL ระหว่าง approach (1 CH)"},
    "LOC_capture_dot": {"v":0.5,"u":"dot","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"capture ไม่ช้ากว่า 1/2 dot"},
    "GS_capture_dot": {"v":0.4,"u":"dot","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"2/5 dot; ไม่ capture ก่อน LOC"},
    "THR_HLD_kt": {"v":43.213,"u":"m/s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"84 kt (43.2 m/s) หรือ 64 kt (32.9 m/s) ตามรุ่นคอมพิวเตอร์ A/T; NG ค้างถึง 800 ft RA"},
    "TOGA_FD_pitch": {"v":{"takeoff_initial":-10,"takeoff_after_60kt":15,"GA_AP":15,"GA_FD_one_engine":13},"u":"deg","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"F/D 10° nose down เริ่ม, 15° nose up ที่ 60 kt IAS"},
    "GA_arm_RA": {"v":609.6,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"A/T GA armed ต่ำกว่า 2000 ft RA"},
    "N1_equalization_max_deg": {"v":8,"u":"deg","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"thrust lever split สูงสุด; ปลด A/T ถ้าเกิน 10° ใน dual channel หลัง FLARE armed"}
   },
   "autoland": {
    "FLARE_ARM_ft": {"v":457.2,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"1500 ft RA: AP2 engage หลัง LOC+G/S capture และ FLARE armed"},
    "DUAL_AP_by_ft": {"v":243.84,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"800 ft RA: ต้องมี AP สองตัว"},
    "STAB_TRIM_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"400 ft RA: stabilizer trim nose up (NG เพิ่มอีกที่ 50 ft)"},
    "FLARE_NOT_ARMED_DISC_ft": {"v":106.68,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"ราว 350 ft RA: FLARE ไม่ armed → AP ทั้งสองปลด"},
    "FLARE_ft": {"v":15.24,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"ราว 50 ft RA"},
    "RETARD_ft": {"v":8.23,"u":"m","scope":"aircraft","src":["O19","O16"],"conf":"สูง","est":false,"note":"27 ft RA (DSB TK1951: radio height < 27 ft เป็นเงื่อนไข retard flare)"},
    "RETARD_after_flare_s": {"v":2.5,"u":"s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"RETARD 2.5 s หลัง FLARE engage หรือที่ 27 ft อย่างใดก่อน"},
    "AT_disc_after_TD_s": {"v":2,"u":"s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"A/T ปลดราว 2 s หลังแตะพื้น"},
    "ROLLOUT": {"v":"option","u":"-","scope":"aircraft","src":["O19","O23"],"conf":"ต่ำ","est":false,"note":"ไม่มี rollout: AP ต้องปลดด้วยมือหลังแตะพื้น; มี rollout: LAND 3 ใช้ LOC บนพื้น (ความสูง engage ไม่พบ)"},
    "ALIGN_ft": {"v":6.096,"u":"m","scope":"aircraft","src":["O30"],"conf":"ต่ำ","est":true,"note":"ไม่พบของ 737; ใช้ 20 ft ตาม A320 (ค่าประมาณ)"},
    "AP_disc_min_ft": {"v":15.24,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"single channel ห้ามต่ำกว่า 50 ft; dual channel ลงถึงพื้น"}
   },
   "capability": {
    "certified": {"v":"Cat 3","u":"-","scope":"aircraft","src":["O22"],"conf":"สูง","est":false,"note":"EASA TCDS IM.A.120 all weather capability"},
    "DH_min": {"v":{"LAND2_fail_passive":15.24,"LAND3_fail_operational":0},"u":"m","scope":"aircraft","src":["O23"],"conf":"ต่ำ","est":false,"note":"LAND 2 DH 50 ft; LAND 3 ไม่มี DH (ตามผู้ประกอบการหนึ่งราย)"},
    "RVR_min": {"v":{"LAND2":125,"LAND3":75},"u":"m","scope":"aircraft","src":["O23","O7"],"conf":"ต่ำ","est":false,"note":"LAND 2 125/75/75 m; LAND 3 75 m"},
    "AH": {"v":30.48,"u":"m","scope":"aircraft","src":["O8"],"conf":"ต่ำ","est":true,"note":"ไม่พบของ 737; ใช้ค่าทั่วไป \"100 ft or less\" (ค่าประมาณ)"},
    "autoland_wind_limits": {"v":{"headwind":12.861,"crosswind":10.289,"tailwind":7.7167},"u":"m/s","scope":"aircraft","src":["O21","O20"],"conf":"กลาง","est":false,"note":"HW 25 kt, XW 20 kt ตาม FCOM MALEV (b737.org.uk ให้ 25 kt), TW 0 ถึง 15 kt ตามความสูงสนามและแฟลป"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.25},"u":"deg","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"มุม GS"},
    "autoland_config": {"v":{"flaps":["30","40"],"engines":"both"},"u":"-","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"flaps 30 หรือ 40 และเครื่องยนต์ทำงานทั้งสอง"}
   },
   "laws": {
    "flare": {"v":{"type":"exp_hB","h_flare":15.24,"h_B":3.658,"tau_rule":"tau=(h_flare+h_B)/(V_G*tan(gs))","tau_at_142kt":4.93,"sink_TD":0.743},"u":"m, s, m/s","scope":"aircraft","src":["O13","O19"],"conf":"ต่ำ","est":true,"note":"hdot_cmd=-(h+h_B)/tau; V_G·tau คงที่ตามสิทธิบัตร 4,354,237; h_flare 50 ft จาก FCOM summary"},
    "retard": {"v":{"h":8.23,"dt_after_flare":2.5,"ramp":"idle at predicted touchdown t_go=tau*ln((h+h_B)/h_B)"},"u":"m, s","scope":"aircraft","src":["O19","O16"],"conf":"กลาง","est":true,"note":"สูตร ramp เป็นค่าประมาณ"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0317,"Ki_Tmax_per_kt_s":0.00297,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=60 t, Tmax 234 kN class, engine lag 1.5 s (o_athr.mjs)"}
   }
  }
 }
}
```

```json
{
 "a320ceo": {
  "afcs": {
   "modes": {"v":{"lateral":["RWY","RWY TRK","NAV","HDG","TRK","LOC*","LOC","LAND","FLARE","ROLL OUT","GA TRK"],"vertical":["SRS","CLB","DES","OP CLB","OP DES","ALT*","ALT","ALT CST*","ALT CST","V/S","FPA","G/S*","G/S","FINAL APP","LAND","FLARE","ROLL OUT","EXP","TCAS"],"athr":["SPEED","MACH","THR CLB","THR IDLE","THR LVR","THR MCT","MAN TOGA","MAN FLX","MAN MCT","MAN THR","A.FLOOR","TOGA LK"],"athr_messages":["THR LK","LVR CLB","LVR MCT","LVR ASYM"],"capability_fma":["CAT 1","CAT 2","CAT 3 SINGLE","CAT 3 DUAL"]},"u":"-","scope":"aircraft","src":["O31","O32","O28"],"conf":"กลาง","est":false,"note":"ชื่อตามเอกสาร/enum ของ FlyByWire A32NX v0.10.0 (GPL-3.0) ที่จำลอง FMA"},
   "arm_engage": {
    "AP_takeoff_min": {"v":{"h":30.48,"t_after_liftoff_s":5},"u":"m, s","scope":"aircraft","src":["O28","O32"],"conf":"กลาง","est":false,"note":"100 ft AGL และอย่างน้อย 5 s หลัง liftoff"},
    "MUH": {"v":{"ILS_CAT1":48.768,"FINAL_APP_VS_FPA":76.2,"circling_C":152.4,"circling_D":182.88,"after_manual_GA":30.48,"other":152.4},"u":"m","scope":"aircraft","src":["O28"],"conf":"กลาง","est":false,"note":"160/250/500/600/100/500 ft AGL"},
    "NAV_min_RA": {"v":9.144,"u":"m","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":false,"note":"NAV engage ได้ที่ RA ≥ 30 ft (โมเดล FBW)"},
    "LOC_star_deg": {"v":1.92,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_LOC| < 1.92° (2.56 dot บน 21R)"},
    "LOC_track_deg": {"v":0.16,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_LOC| < 0.16° ต่อเนื่อง"},
    "GS_star_deg": {"v":0.1333,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_GS| < 0.1333° หลัง LOC*/LOC"}
   },
   "autoland": {
    "LAND_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O26","O32"],"conf":"กลาง","est":false,"note":"LAND เมื่อ LOC และ G/S engaged และ RA < 400 ft (FBW รอ 1.2 s)"},
    "LAND_must_by_ft": {"v":106.68,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"FMA ต้องแสดง LAND ก่อน 350 ft"},
    "AUTOLAND_warning_below_ft": {"v":60.96,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"ใต้ 200 ft: LOC > 1/4 dot (เหนือ 15 ft), GS > 1 dot (เหนือ 100 ft), RA ต่าง > 15 ft, สูญ LOC/GS"},
    "FLARE_ft": {"v":{"nominal":12.192,"rule":"h = clamp(|VS fpm|/15, 45, 60) ft","at_709fpm":14.417},"u":"m","scope":"aircraft","src":["O30","O32"],"conf":"กลาง","est":true,"note":"FMA ราว 40 ft; สูตรของโมเดล FBW (time-to-go 4 s)"},
    "RETARD_ft": {"v":{"thrust_idle":9.144,"callout_autoland":3.048,"callout_manual":6.096},"u":"m","scope":"aircraft","src":["O30","O25","O24"],"conf":"กลาง","est":false,"note":"thrust idle ราว 30 ft; เสียง RETARD 10 ft (autoland) / 20 ft (manual)"},
    "ALIGN_ft": {"v":{"start":6.096,"end":3.048},"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"decrab ระหว่างราว 20 ถึง 10 ft"},
    "ROLLOUT": {"v":"main gear touchdown","u":"-","scope":"aircraft","src":["O26","O30"],"conf":"กลาง","est":false,"note":"ROLL OUT ตาม LOC บนพื้น; ปลด AP ที่ taxi speed"},
    "AP_disc_min_ft": {"v":0,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"CAT 3 DUAL ลงถึงพื้น; CAT II takeover \"at or above 80 ft\" (24.4 m)"}
   },
   "capability": {
    "certified": {"v":["CAT 2","CAT 3 SINGLE","CAT 3 DUAL"],"u":"-","scope":"aircraft","src":["O28","O24"],"conf":"กลาง","est":false,"note":"Airbus ทุกแบบรับรอง autoland"},
    "DH_min": {"v":{"CAT2":30.48,"CAT3_SINGLE":15.24,"CAT3_DUAL":6.096,"CAT3_DUAL_noDH":0},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"100/50/20 ft หรือไม่มี DH"},
    "AH": {"v":30.48,"u":"m","scope":"aircraft","src":["O28","O27"],"conf":"กลาง","est":false,"note":"CAT 3 DUAL alert height 100 ft"},
    "RVR_min": {"v":{"CAT3_DUAL_noDH":75},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"RVR 75 m"},
    "autoland_wind_limits": {"v":{"headwind":15.433,"crosswind":10.289,"tailwind":5.1444},"u":"m/s","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"HW 30, XW 20, TW 10 kt; เกิน → CAT I approach ไม่มี autoland"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.15},"u":"deg","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"FBW docs ให้ 3.25°"},
    "autoland_misc": {"v":{"airport_elev_max":2804.2,"pressure_alt_min":-304.8,"weight":"<= MLW"},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"≤ 9200 ft (บางทะเบียน 2500 ft); ไม่ต่ำกว่า −1000 ft PA; FBW docs: ≥ 44 000 kg"}
   },
   "laws": {
    "flare": {"v":{"type":"exp_offset","h_flare_rule":"clamp(4 s * |hdot|, 13.72 m, 18.29 m)","tau_rule":"tau=h_F/(|hdot_F|-0.762)","sink_TD":0.762,"tau_at_133kt":5.07},"u":"m, s, m/s","scope":"aircraft","src":["O32","O30"],"conf":"ต่ำ","est":true,"note":"hdot_cmd = -h/tau - 0.762 m/s (FBW AutopilotLaws.cpp บรรทัด 2139-2150)"},
    "retard": {"v":{"h_idle":9.144,"h_callout":3.048,"fbw_request_h":12.192},"u":"m","scope":"aircraft","src":["O30","O24","O32"],"conf":"กลาง","est":true,"note":"โมเดล FBW ขอ RETARD ที่ ≤ 40 ft; เลือก 30 ft ตามคำอธิบาย FMA"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0332,"Ki_Tmax_per_kt_s":0.00311,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=64.5 t, Tmax 240 kN class (o_athr.mjs)"}
   }
  }
 }
}
```

```json
{
 "a330_300": {
  "afcs": {
   "modes": {"v":"as a320ceo","u":"-","scope":"aircraft","src":["O24","O29"],"conf":"ต่ำ","est":true,"note":"ใช้ชุดโหมดเดียวกับ A320 (FMGS ตระกูลเดียวกัน); A330/A340 แสดง ALIGN/RETARD ที่ 30 ft"},
   "arm_engage": {
    "AP_takeoff_min": {"v":{"h":30.48,"t_after_liftoff_s":5},"u":"m, s","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"100 ft AGL และ 5 s"},
    "MUH": {"v":{"ILS_CAT1":48.768},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"ILS CAT 1 160 ft AGL; NPA ถึง MDA"}
   },
   "autoland": {
    "LAND_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O26"],"conf":"ต่ำ","est":true,"note":"ใช้ค่า A320 (ไม่พบของ A330)"},
    "FLARE_ft": {"v":{"rule":"as a320ceo","at_743fpm":15.088},"u":"m","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":true,"note":"สูตร FBW ที่ 140 kt"},
    "RETARD_ft": {"v":{"thrust_idle":9.144,"callout_autoland":3.048},"u":"m","scope":"aircraft","src":["O24","O30"],"conf":"กลาง","est":true,"note":"A340: \"At 30 ft, ALIGN and RETARD modes engaged\""},
    "ALIGN_ft": {"v":9.144,"u":"m","scope":"aircraft","src":["O24"],"conf":"กลาง","est":true,"note":"จาก A340-500 (Safety First 12)"},
    "ROLLOUT": {"v":"main gear touchdown","u":"-","scope":"aircraft","src":["O24"],"conf":"กลาง","est":true,"note":"automatic rollout"}
   },
   "capability": {
    "certified": {"v":["CAT 2","CAT 3 SINGLE","CAT 3 DUAL"],"u":"-","scope":"aircraft","src":["O24","O29"],"conf":"ต่ำ","est":false,"note":""},
    "DH_min": {"v":{"CAT3_SINGLE":15.24,"CAT3_DUAL":6.096},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"50 ft / 20 ft"},
    "AH": {"v":60.96,"u":"m","scope":"aircraft","src":["O29","O27"],"conf":"ต่ำ","est":false,"note":"200 ft (บัตรทบทวน + ความเห็นนักบิน)"},
    "RVR_min": {"v":{"CAT3_DUAL":75},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"75 m"},
    "autoland_wind_limits": {"v":{"headwind":18.006,"crosswind":10.289,"tailwind":5.1444},"u":"m/s","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"HW 35, XW 20, TW 10 kt"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.25},"u":"deg","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":""},
    "engine_out": {"v":"CAT 2 and CAT 3 SINGLE in CONF 3","u":"-","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":""}
   },
   "laws": {
    "flare": {"v":{"type":"as a320ceo","tau_at_140kt":5.2,"sink_TD":0.762},"u":"s, m/s","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":true,"note":"ใช้กฎ A320"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0361,"Ki_Tmax_per_kt_s":0.00339,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=185 t, Tmax 633 kN class"}
   }
  }
 }
}
```

```json
{
 "atr72_600": {
  "afcs": {
   "modes": {"v":{"lateral":["HDG SEL","HDG HOLD","NAV","LOC","APP"],"vertical":["IAS","VS","PITCH HOLD","ALT SEL","ALT","G/S","VNAV","GA"],"athr":[]},"u":"-","scope":"aircraft","src":["O33","O34"],"conf":"กลาง","est":false,"note":"ไม่มี autothrottle; VNAV coupled ตั้งแต่ Standard 2 (2014)"},
   "arm_engage": {
    "AP_on_ground": {"v":false,"u":"-","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"AP และ YD engage บนพื้นไม่ได้"},
    "AP_after_liftoff_s": {"v":12,"u":"s","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"12 s หลัง liftoff (ราว 400 ft AGL)"}
   },
   "autoland": {
    "LAND_ft": {"v":null,"u":"m","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"ไม่มี autoland/FLARE mode"},
    "AP_disc_min_ft": {"v":30.48,"u":"m","scope":"aircraft","src":["O33","O7"],"conf":"ต่ำ","est":true,"note":"ปลด AP ที่ DH CAT II (≥ 100 ft); ข้อความ FCOM ที่สรุปได้มี \"80 ft RA\" ซึ่งยืนยันไม่ได้"}
   },
   "capability": {
    "certified": {"v":["CAT 2 (AP + FD)"],"u":"-","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"CAT 2 approaches are flown with AP + FD ON"},
    "cat2_wind_demonstrated": {"v":{"headwind":14.919,"tailwind":5.1444,"crosswind":8.7456},"u":"m/s","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"HW 29, TW 10, XW 17 kt"},
    "LPV_min": {"v":60.96,"u":"m","scope":"aircraft","src":["O34"],"conf":"สูง","est":false,"note":"LPV ถึง 200 ft"}
   }
  }
 }
}
```

```json
{
 "common_airliner": {
  "afcs": {
   "categories": {"v":{"CAT_I":{"DH_min":60.96,"RVR_min":550,"VIS_min":800},"CAT_II":{"DH_min":30.48,"DH_max":60.96,"RVR_min":300},"CAT_IIIA":{"DH_max":30.48,"RVR_min":175},"CAT_IIIB":{"DH_max":15.24,"RVR_min":50,"RVR_max":175},"typeA_min":76.2},"u":"m","scope":"environment","src":["O7","O9"],"conf":"สูง","est":false,"note":"DH 200/100/<100/<50 ft; Type A ≥ 250 ft"},
   "rvr_tables": {"v":{"CAT2_DH100_120":300,"CAT2_DH121_140":400,"CAT2_DH141_199":450,"CAT3_DH50_99":175,"CAT3_lt50_fail_passive":125,"CAT3_lt50_fail_operational":75},"u":"m","scope":"environment","src":["O7"],"conf":"สูง","est":false,"note":"EASA/ICAO; Cat D ที่ DH 100-120 ft ใช้ 350 m เว้นแต่ autoland/HUDLS"},
   "fail_passive_DH_min": {"v":15.24,"u":"m","scope":"environment","src":["O8","O9"],"conf":"สูง","est":false,"note":"50 ft; ต่ำกว่านั้นต้อง fail-operational"},
   "AH_typical_max": {"v":30.48,"u":"m","scope":"environment","src":["O8"],"conf":"กลาง","est":false,"note":"\"100 ft or less\" (SRVSOP); CS-AWO 312 ตามที่อ่านได้: at least 100 ft (ขัดแย้ง)"},
   "cert_touchdown": {"v":{"early":60,"late_avg":823,"late_limit":914,"lateral_outboard_gear":21.3,"sink_limit":3.048,"p_avg":0.000001,"p_limit":0.00001,"p_bank_avg_easa":1e-8,"p_bank_faa":1e-7},"u":"m, m/s, -","scope":"environment","src":["O1","O2","O3"],"conf":"สูง","est":false,"note":"200 ft, 2700 ft, 3000 ft, 70 ft, 10 ft/s"},
   "cert_rollout": {"v":{"lateral_outboard_gear":21.3,"p":0.000001,"speed_above":20.578,"normal_dev":8.2,"p_normal":0.05},"u":"m, m/s, -","scope":"environment","src":["O3","O1"],"conf":"สูง","est":false,"note":"70 ft ที่ > 40 kt; 27 ft ใน < 5 %"},
   "ac2057a_2sigma": {"v":{"long_total":457.2,"lat_each_side":8.23,"min_from_thr":60.96,"demo_wind":{"headwind":12.861,"tailwind":5.1444,"crosswind":7.7167,"shear_per_100ft":4.1156}},"u":"m, m/s","scope":"environment","src":["O4"],"conf":"สูง","est":false,"note":"1500 ft, 27 ft, 200 ft; HW 25, TW 10, XW 15 kt, shear 8 kt/100 ft"},
   "ops_success": {"v":{"td_min":150,"td_max":750,"speed_tol":2.5722,"vs_max":1.8288,"bank_max_deg":7,"rollout_dev":8},"u":"m, m/s, deg","scope":"environment","src":["O8","O7"],"conf":"กลาง","est":false,"note":"±5 kt, 360 fpm, 7°, 8 m"},
   "cat2_approach": {"v":{"p_success_below_500ft":0.95,"loc_uA_95pct":25},"u":"-, uA","scope":"environment","src":["O2"],"conf":"สูง","est":false,"note":"AC 20-191 §4.2.9, §4.2.6.2.2"},
   "ils_signal": {"v":{"loc_full_DDM":0.155,"gs_full_DDM":0.175,"full_scale_uA":150,"dot_uA":75,"loc_sector_at_thr":210,"gs_width_deg":1.4,"gs_dot_deg":0.36},"u":"DDM, uA, m, deg","scope":"environment","src":["O10","O11","O6"],"conf":"สูง","est":true,"note":"1 dot = 75 uA เป็นค่าคำนวณสำหรับ PFD 2 dot"},
   "z_quantiles": {"v":{"p1e5":4.265,"p1e6":4.753,"p1e7":5.199,"p1e8":5.612},"u":"-","scope":"sim","src":["O3"],"conf":"สูง","est":true,"note":"คำนวณ (o_autoland.mjs)"},
   "flare_reference": {"v":{"patent_K":0.205,"patent_hB":3.658,"dials_sink_mean":0.732,"dials_sink_sd":0.213,"cr3074_td_sd":34.5,"cr3074_sink_mean":0.665},"u":"1/s, m, m/s","scope":"environment","src":["O13","O14","O15"],"conf":"สูง","est":false,"note":"ค่าอ้างอิงสำหรับทดสอบกฎ flare"},
   "dmk": {"v":{"ils":{"21R":"CAT II","21L":"CAT I","03L":"CAT I","03R":"none"},"lvp_rvr_below":550,"lvp_ceiling_below":60.96,"lvp_runway":"21R","loc_dot_deg":{"21R":0.751,"03L":0.749,"21L":0.889}},"u":"m, deg","scope":"environment","src":["O36","O37"],"conf":"กลาง","est":false,"note":"LVP: RVR < 550 m หรือ ceiling < 200 ft, ใช้ 21R เท่านั้น; dot คำนวณ (o_autoland.mjs)"}
  }
 }
}
```

