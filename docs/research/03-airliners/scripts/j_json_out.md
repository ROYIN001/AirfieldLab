```json
{
 "b737_800": {
  "turbofan": {
   "engines": {
    "CFM56_7B26_class": {
     "F00": {"v":116990,"u":"N","scope":"engine","src":["J1","J9"],"conf":"สูง","est":false,"note":"take-off 11,699 daN (26,300 lbf) EASA E.004 III.6; EEDB 8CM065 = 117.0 kN"},
     "MCT": {"v":115210,"u":"N","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"max continuous 11,521 daN (25,900 lbf)"},
     "bpr": {"v":5.1,"u":"-","scope":"engine","src":["J9","J28"],"conf":"กลาง","est":false,"note":"EEDB 8CM065 (7B26/3) 5.1"},
     "opr": {"v":27.7,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM065"},
     "ffLTO": {"v":[1.213,0.986,0.331,0.108],"u":"kg/s","scope":"engine","src":["J9","J8"],"conf":"กลาง","est":false,"note":"TO/CO/App/Idle (100/85/30/7%) EEDB 8CM065 ผ่าน OpenAP; EASA เตือนว่าไม่ใช่ข้อมูลเปรียบเทียบ fuel efficiency"},
     "ffQuad": {"v":[0.0425,0.6716,0.2828],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"FF/FF_TO = c0 + c1 x + c2 x^2 (x = F/F00) least squares ผ่าน 4 จุด EEDB, max|res| 0.0048 (j_ratings.mjs)"},
     "eedbUid": {"v":"8CM065","u":"-","scope":"engine","src":["J8","J9"],"conf":"สูง","est":false,"note":"CFM56-7B26/3; 7B26E = 11CM072 ค่าเดียวกัน"},
     "N1_100_rpm": {"v":5175,"u":"rpm","scope":"engine","src":["J1"],"conf":"สูง","est":true,"note":"คำนวณ 5,382 rpm ÷ 1.04 (N1 สูงสุด 104%)"},
     "N1_max_pct": {"v":104,"u":"%N1","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"5,382 rpm"},
     "N2_100_rpm": {"v":14460,"u":"rpm","scope":"engine","src":["J1"],"conf":"สูง","est":true,"note":"15,183 rpm ÷ 1.05"},
     "N2_max_pct": {"v":105,"u":"%N2","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"15,183 rpm"},
     "EGT_limits_C": {"v":{"takeoff":950,"maxContinuous":925,"start":725,"transientTO_20s":960},"u":"degC","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"EGT แสดงผล (T49.5) E.004 IV.1.1"},
     "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":["J26"],"conf":"กลาง","est":false,"note":"flat rate 30 °C (ISA+15) ตาม Aircraft Commerce; TCDS เขียนเพียง \"Sea level corner point conditions\""},
     "kT_perK": {"v":0.0065,"u":"1/K","scope":"engine","src":["J33"],"conf":"ต่ำ","est":true,"note":"จาก ATSB AO-2014-162: assumed temp 35 เป็น 51 °C ทำให้ N1 93.1 เป็น 88.4% ถ้า F ∝ N1^2–2.5 ได้ 0.0062–0.0076/K (j_ratings.mjs)"},
     "mass_dry_kg": {"v":2386,"u":"kg","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"SAC; DAC 2,431; E 2,395"},
     "fan_diameter_m": {"v":1.549,"u":"m","scope":"engine","src":["J28","J26"],"conf":"กลาง","est":false,"note":"61 in"},
     "length_m": {"v":2.508,"u":"m","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"E.004 III.4"},
     "N1_GI_pct": {"v":20,"u":"%N1","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"สำหรับ N1 display; ไม่พบค่าจริงในแหล่งสาธารณะ"},
     "N2_GI_pct": {"v":58,"u":"%N2","scope":"engine","src":["J43","J1"],"conf":"ต่ำ","est":false,"note":"ground min idle 58% N2 เมื่อ TAT < 52 °C (66% เมื่อร้อนกว่า) สอดคล้อง N2 ต่ำสุดใน icing 58.8% ของ TCDS"},
     "N2_FI_pct": {"v":61,"u":"%N2","scope":"engine","src":["J54"],"conf":"ต่ำ","est":true,"note":"flight min idle (ค่าประมาณ รอบที่ 1)"},
     "N2_AI_pct": {"v":72,"u":"%N2","scope":"engine","src":["J43"],"conf":"ต่ำ","est":false,"note":"approach idle \"72 – 79%\" N2 ใช้ขอบล่าง (เอกสารฝึกอบรมไม่เป็นทางการ)"},
     "thrustExp_k": {"v":2,"u":"-","scope":"engine","src":["J23","J23"],"conf":"กลาง","est":true,"note":"F = Fidle + (Frated - Fidle) n^k ตาม JSBSim FGTurbine; คงค่ารอบที่ 1"},
     "tau2_s": {"v":0.35,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ค่าคงที่เวลาสัญญาณเล็กของ N2 ปรับในรอบที่ 1 (f5_spool_tune.mjs)"},
     "Racc_pctps": {"v":18,"u":"%N2/s","scope":"engine","src":["J13","J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราเร่ง N2 สูงสุด เลือกให้ FI ถึง 95% ≤ 5 s ตาม 14 CFR 33.73(b) (j_spool.mjs)"},
     "accShape_a": {"v":6,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"รูปร่าง accel schedule 1/(1 + a(1 - ñ)^3)"},
     "Rdec_pctps": {"v":16,"u":"%N2/s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราลด N2"},
     "altExp": {"v":1,"u":"-","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ตัวคูณอัตรา δt^e ตามความสูง"},
     "tauFan_s": {"v":0.25,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"lag ของพัดลม"},
     "idleFrac0": {"v":0.05,"u":"-","scope":"engine","src":["J23","J8"],"conf":"ต่ำ","est":true,"note":"net idle ต่อ F00 ที่ static SL (EEDB 7% เป็นจุดทดสอบ ไม่ใช่ idle จริง)"},
     "idleMach0": {"v":0.5,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"Mach ที่ net idle = 0"},
     "revType": {"v":{"type":"cascade (translating sleeve + blocker doors, fan stream)"},"u":"-","scope":"engine","src":["J1","J28"],"conf":"กลาง","est":false,"note":"Boeing reverser P/N 315A2295; \"blocker doors and cascade vanes\""},
     "rev_c0": {"v":0.3,"u":"-","scope":"engine","src":["J18","J22"],"conf":"ต่ำ","est":true,"note":"Frev = F00 (c0 + c1 M)[ρi + (1 - ρi)φ] ปรับจาก LDF ของ AC 91-79B ในรอบที่ 1"},
     "rev_c1": {"v":1,"u":"1/Mach","scope":"engine","src":["J18"],"conf":"ต่ำ","est":true,"note":"ดู rev_c0"},
     "rev_uMax": {"v":0.7,"u":"-","scope":"engine","src":["J22"],"conf":"ต่ำ","est":true,"note":"thrust demand สูงสุดในโหมด reverse"},
     "rev_idleFrac": {"v":0.1,"u":"-","scope":"engine","src":["J20"],"conf":"ต่ำ","est":true,"note":"reverse idle ให้แรงน้อยมาก (FAA AFH)"},
     "rev_deploy_s": {"v":2,"u":"s","scope":"engine","src":["J44","J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก stowed ถึง deployed (ไม่พบในแหล่งสาธารณะ) REV สีเขียวที่ s ≥ 0.9 = 1.8 s"},
     "rev_stow_s": {"v":2.5,"u":"s","scope":"engine","src":["J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก deployed ถึง stowed (ค่าประมาณ)"}
    },
    "CFM56_7B27_class": {
     "inherits": {"v":{"from":"CFM56_7B26_class"},"u":"-","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"ฮาร์ดแวร์เดียวกัน ต่างที่ rating"},
     "F00": {"v":121430,"u":"N","scope":"engine","src":["J1","J9"],"conf":"สูง","est":false,"note":"12,143 daN (27,300 lbf); EEDB 8CM066 121.4 kN"},
     "MCT": {"v":115210,"u":"N","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"11,521 daN"},
     "bpr": {"v":5.1,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM066 (7B27 เดิม 3CM034 = 5.0)"},
     "opr": {"v":29,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM066"},
     "ffLTO": {"v":[1.293,1.031,0.343,0.11],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM066"},
     "ffQuad": {"v":[0.0448,0.6081,0.3404],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0102"}
    },
    "CFM56_7B24_class": {
     "inherits": {"v":{"from":"CFM56_7B26_class"},"u":"-","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"ฮาร์ดแวร์เดียวกัน ต่างที่ rating"},
     "F00": {"v":107650,"u":"N","scope":"engine","src":["J1","J9"],"conf":"สูง","est":false,"note":"10,765 daN (24,200 lbf)"},
     "MCT": {"v":101420,"u":"N","scope":"engine","src":["J1"],"conf":"สูง","est":false,"note":"10,142 daN"},
     "bpr": {"v":5.3,"u":"-","scope":"engine","src":["J9","J28"],"conf":"กลาง","est":false,"note":"EEDB 8CM064"},
     "opr": {"v":25.6,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM064"},
     "ffLTO": {"v":[1.086,0.895,0.308,0.103],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM064"}
    }
   },
   "engine_default": {"v":"CFM56_7B26_class","u":"-","scope":"aircraft","src":["J9","J37","J38"],"conf":"กลาง","est":false,"note":"OpenAP default; TK1951 และ I-NEOT ใช้ 7B26; ฝูง Thai Lion/Nok ไม่พบ dash number"},
   "reverser": {
    "cancel_kt": {"v":30.87,"u":"m/s","scope":"aircraft","src":["J21","J44","J28"],"conf":"สูง","est":false,"note":"60 kt: \"On the 737, reverser cancellation speed is 60 knots\""},
    "interlock": {"v":{"wowOrRA_ft":10,"forwardLeverAtIdle":true,"powerAboveRevIdleWhen":"sleeves >= 90% (REV green)","amberBand":[0.1,0.9]},"u":"-","scope":"aircraft","src":["J44","J28"],"conf":"กลาง","est":false,"note":"RA < 10 ft หรือ air/ground; REV amber 10–90%, green > 90%"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"flaps >= 15 (landing) OR thermal anti-ice ON (in air)","groundIdleAfterTouchdown_s":4,"below15000ft_fallback":"AI if signal lost"},"u":"-","scope":"aircraft","src":["J43","J54"],"conf":"ต่ำ","est":true,"note":"เงื่อนไขจากเอกสารฝึกอบรมไม่เป็นทางการ; หน่วงหลังแตะพื้น 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[2.159,-4.902,1.11],"posSTA":[16.485,-4.902],"axis":[1,0,0],"type":"turbofan","model":"CFM56_7B26_class"},{"id":2,"pos":[2.159,4.902,1.11],"posSTA":[16.485,4.902],"axis":[1,0,0],"type":"turbofan","model":"CFM56_7B26_class"}],"u":"m FRD","scope":"aircraft","src":["J23","J48","J47"],"conf":"ต่ำ","est":true,"note":"x,y จาก JSBSim 737 (engine 85 in หน้า AERORP, y 193 in; Jenkinson y = 0.282·b/2 = 4.84 m); z = ความสูง CG 2.7 m − ศูนย์ nacelle 1.59 m; STA จาก 25%MAC 18.644 (หัวข้อ 5)"},
   "legacy": {"v":{"P":27873000,"eta":0.8,"T0":233980,"idle":0.05},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc = 95.3 m/s ทำให้ thrustAvail(V) ตรง B&Y BPR 5.1 ที่ SL ภายใน 0.042 ช่วง 0–90 m/s (j_layout.mjs); T0 = 2 × 116,990 N"}
  }
 }
}
```

```json
{
 "a320ceo": {
  "turbofan": {
   "engines": {
    "CFM56_5B6_class": {
     "F00": {"v":104530,"u":"N","scope":"engine","src":["J5","J9"],"conf":"สูง","est":false,"note":"23,500 lbf (10,453 daN) FAA E37NE; EEDB 8CM057 104.5 kN"},
     "MCT": {"v":90080,"u":"N","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"20,250 lbf (9,008 daN)"},
     "bpr": {"v":5.9,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM057 (5B6/3); /P = 6.0"},
     "opr": {"v":24.3,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM057"},
     "ffLTO": {"v":[0.965,0.8,0.279,0.095],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM057 (5B6/3)"},
     "ffQuad": {"v":[0.0455,0.748,0.2059],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0010"},
     "eedbUid": {"v":"8CM057","u":"-","scope":"engine","src":["J9"],"conf":"สูง","est":false,"note":"CFM56-5B6/3; /P = 3CM028"},
     "N1_100_rpm": {"v":5000,"u":"rpm","scope":"engine","src":["J5"],"conf":"สูง","est":true,"note":"5,200 rpm ÷ 1.04 (N1 สูงสุดทุกรุ่น 5B)"},
     "N1_max_pct": {"v":104,"u":"%N1","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"5,200 rpm"},
     "N2_100_rpm": {"v":14460,"u":"rpm","scope":"engine","src":["J5"],"conf":"กลาง","est":true,"note":"ช่อง 5B ใน E37NE เป็น \"- -\" จึงอนุมานว่า 15,183 rpm = 105%"},
     "N2_max_pct": {"v":105,"u":"%N2","scope":"engine","src":["J5"],"conf":"กลาง","est":false,"note":"อนุมานจาก \"- -\""},
     "EGT_limits_C": {"v":{"takeoff":950,"maxContinuous":915,"start":725},"u":"degC","scope":"engine","src":["J5","J27"],"conf":"กลาง","est":false,"note":"SAC; รุ่น /P จริงต่ำกว่าค่าแสดง 10 °C (Note 17) redline /P 940"},
     "Tflat_C": {"v":45,"u":"degC","scope":"engine","src":["J5","J27"],"conf":"สูง","est":false,"note":"Note 4: Std + 30 °C (45 °C, 113 °F) สำหรับ -5B6, -5B6/P, -5B6/2P, -5B6/3; MCT 25 °C"},
     "kT_perK": {"v":0.0065,"u":"1/K","scope":"engine","src":["J33"],"conf":"ต่ำ","est":true,"note":"ใช้ค่าเดียวกับ 7B (ไม่มีข้อมูลรายรุ่น)"},
     "mass_dry_kg": {"v":2455.2,"u":"kg","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"/P 5,412.9 lb; /2P 2,500.6 kg"},
     "fan_diameter_m": {"v":1.735,"u":"m","scope":"engine","src":["J27"],"conf":"ต่ำ","est":true,"note":"68.3 in ซึ่งแหล่งระบุให้ CFM56-5A; สมมติว่า 5B ใช้พัดลมขนาดเดียวกัน"},
     "N1_GI_pct": {"v":18.9,"u":"%N1","scope":"engine","src":["J24"],"conf":"ต่ำ","est":true,"note":"FlightGear idlen1 (ค่าของโมเดลเปิด)"},
     "N2_GI_pct": {"v":59.4,"u":"%N2","scope":"engine","src":["J24"],"conf":"ต่ำ","est":true,"note":"FlightGear idlen2"},
     "N2_FI_pct": {"v":61,"u":"%N2","scope":"engine","src":["J54"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
     "N2_AI_pct": {"v":69,"u":"%N2","scope":"engine","src":["J55"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณรอบที่ 1"},
     "thrustExp_k": {"v":2,"u":"-","scope":"engine","src":["J23","J23"],"conf":"กลาง","est":true,"note":"F = Fidle + (Frated - Fidle) n^k ตาม JSBSim FGTurbine; คงค่ารอบที่ 1"},
     "tau2_s": {"v":0.35,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ค่าคงที่เวลาสัญญาณเล็กของ N2 ปรับในรอบที่ 1 (f5_spool_tune.mjs)"},
     "Racc_pctps": {"v":18,"u":"%N2/s","scope":"engine","src":["J13","J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราเร่ง N2 สูงสุด เลือกให้ FI ถึง 95% ≤ 5 s ตาม 14 CFR 33.73(b) (j_spool.mjs)"},
     "accShape_a": {"v":6,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"รูปร่าง accel schedule 1/(1 + a(1 - ñ)^3)"},
     "Rdec_pctps": {"v":16,"u":"%N2/s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราลด N2"},
     "altExp": {"v":1,"u":"-","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ตัวคูณอัตรา δt^e ตามความสูง"},
     "tauFan_s": {"v":0.25,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"lag ของพัดลม"},
     "idleFrac0": {"v":0.05,"u":"-","scope":"engine","src":["J23","J8"],"conf":"ต่ำ","est":true,"note":"net idle ต่อ F00 ที่ static SL (EEDB 7% เป็นจุดทดสอบ ไม่ใช่ idle จริง)"},
     "idleMach0": {"v":0.5,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"Mach ที่ net idle = 0"},
     "revType": {"v":{"type":"pivoting door (4 doors, fan stream)"},"u":"-","scope":"engine","src":["J40","J22"],"conf":"กลาง","est":false,"note":"AD F-2001-361R1: \"all 4 thrust reverser pivot doors\" (CFM56-5A บน A320 nacelle ตระกูลเดียวกัน)"},
     "rev_c0": {"v":0.3,"u":"-","scope":"engine","src":["J18","J22"],"conf":"ต่ำ","est":true,"note":"Frev = F00 (c0 + c1 M)[ρi + (1 - ρi)φ] ปรับจาก LDF ของ AC 91-79B ในรอบที่ 1"},
     "rev_c1": {"v":1,"u":"1/Mach","scope":"engine","src":["J18"],"conf":"ต่ำ","est":true,"note":"ดู rev_c0"},
     "rev_uMax": {"v":0.7,"u":"-","scope":"engine","src":["J22"],"conf":"ต่ำ","est":true,"note":"thrust demand สูงสุดในโหมด reverse"},
     "rev_idleFrac": {"v":0.1,"u":"-","scope":"engine","src":["J20"],"conf":"ต่ำ","est":true,"note":"reverse idle ให้แรงน้อยมาก (FAA AFH)"},
     "rev_deploy_s": {"v":2,"u":"s","scope":"engine","src":["J44","J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก stowed ถึง deployed (ไม่พบในแหล่งสาธารณะ) REV สีเขียวที่ s ≥ 0.9 = 1.8 s"},
     "rev_stow_s": {"v":2.5,"u":"s","scope":"engine","src":["J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก deployed ถึง stowed (ค่าประมาณ)"}
    },
    "CFM56_5B4_class": {
     "inherits": {"v":{"from":"CFM56_5B6_class"},"u":"-","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"ฮาร์ดแวร์ 5B เดียวกัน"},
     "F00": {"v":120100,"u":"N","scope":"engine","src":["J5","J9"],"conf":"สูง","est":false,"note":"27,000 lbf (12,010 daN); EEDB 3CM026/8CM055"},
     "MCT": {"v":108400,"u":"N","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"24,370 lb (10,840 daN)"},
     "bpr": {"v":5.7,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM055 (5B4/3); /P = 5.9"},
     "opr": {"v":27.3,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM055"},
     "ffLTO": {"v":[1.142,0.939,0.316,0.102],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM055"},
     "Tflat_C": {"v":45,"u":"degC","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"Std + 30 °C; รุ่น /P1, /2P1, /3B1 ถึง 50 °C"}
    }
   },
   "engine_default": {"v":"CFM56_5B6_class","u":"-","scope":"aircraft","src":["J35","J9"],"conf":"กลาง","est":false,"note":"Thai AirAsia HS-ABI = A320-216 CFM56-5B6 (ASN); A320-214 = 5B4"},
   "reverser": {
    "cancel_kt": {"v":36.01,"u":"m/s","scope":"aircraft","src":["J45","J39"],"conf":"กลาง","est":false,"note":"70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)"},
    "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"autoIdleWhileUnstowed":true},"u":"-","scope":"aircraft","src":["J39"],"conf":"กลาง","est":false,"note":"Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"gear down OR CONF 3/FULL (in air)","minIdle":"ground (fwd) or in flight gear up and not CONF3/FULL","reverseIdle":"slightly higher than forward idle","groundIdleAfterTouchdown_s":4},"u":"-","scope":"aircraft","src":["J42"],"conf":"กลาง","est":true,"note":"สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[4.453,-5.755,1.24],"posSTA":[11.857,-5.755],"axis":[1,0,0],"type":"turbofan","model":"CFM56_5B6_class"},{"id":2,"pos":[4.453,5.755,1.24],"posSTA":[11.857,5.755],"axis":[1,0,0],"type":"turbofan","model":"CFM56_5B6_class"}],"u":"m FRD","scope":"aircraft","src":["J24","J47"],"conf":"กลาง","est":true,"note":"FlightGear A320 (engine x 14.396, CG 25%MAC 18.849, z −1.048 vs 0.192 m); STA = 16.310 − 4.453; ติดตั้ง pitch 2.2°, toe 1° ใน FG ไม่ได้ใส่ (axis ตรง)"},
   "legacy": {"v":{"P":24251000,"eta":0.8,"T0":209060,"idle":0.05},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc 92.8 m/s, T0 = 2 × 104,530 N (5B6), max err 0.043"}
  }
 }
}
```

```json
{
 "a320neo": {
  "turbofan": {
   "engines": {
    "LEAP_1A26_class": {
     "F00": {"v":120640,"u":"N","scope":"engine","src":["J3","J2","J9"],"conf":"สูง","est":false,"note":"27,120 lbf (12,064 daN); EEDB 20CM089 120.6 kN"},
     "MCT": {"v":118680,"u":"N","scope":"engine","src":["J3"],"conf":"สูง","est":false,"note":"26,680 lb (11,868 daN), flat 25 °C"},
     "bpr": {"v":11.1,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM089"},
     "opr": {"v":33.3,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM089"},
     "ffLTO": {"v":[0.861,0.71,0.244,0.091],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM089"},
     "ffQuad": {"v":[0.0571,0.6742,0.2689],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0002"},
     "eedbUid": {"v":"20CM089","u":"-","scope":"engine","src":["J9"],"conf":"สูง","est":false,"note":"LEAP-1A26/26E1"},
     "N1_100_rpm": {"v":3856,"u":"rpm","scope":"engine","src":["J2"],"conf":"สูง","est":false,"note":"E.110 IV.2.1"},
     "N1_max_pct": {"v":101,"u":"%N1","scope":"engine","src":["J2","J3"],"conf":"สูง","est":false,"note":"3,894 rpm"},
     "N2_100_rpm": {"v":16645,"u":"rpm","scope":"engine","src":["J2","J3"],"conf":"สูง","est":false,"note":"\"100% core speed = 16,645 RPM\""},
     "N2_max_pct": {"v":116.5,"u":"%N2","scope":"engine","src":["J2","J3"],"conf":"สูง","est":false,"note":"19,391 rpm"},
     "EGT_limits_C": {"v":{"takeoff":1060,"maxContinuous":1025,"start":750,"transient30s":1065},"u":"degC","scope":"engine","src":["J2","J4"],"conf":"สูง","est":false,"note":"start 800 หลัง S/B 73-0034"},
     "Tflat_C": {"v":44,"u":"degC","scope":"engine","src":["J3"],"conf":"กลาง","est":false,"note":"FAA E00089EN Rev 1: 1A26 flat 111 °F (44 °C); 1A26E1 49 °C; รุ่นอื่น Std+15"},
     "kT_perK": {"v":0.0065,"u":"1/K","scope":"engine","src":["J33"],"conf":"ต่ำ","est":true,"note":"ไม่มีข้อมูลรายรุ่น"},
     "mass_kg": {"v":2990,"u":"kg","scope":"engine","src":["J2","J4"],"conf":"สูง","est":false,"note":"รวม fluids (G01); G02 ขึ้นไป 3,008 kg"},
     "fan_diameter_m": {"v":1.981,"u":"m","scope":"engine","src":["J29"],"conf":"กลาง","est":false,"note":"78 in"},
     "length_m": {"v":3.328,"u":"m","scope":"engine","src":["J2"],"conf":"สูง","est":false,"note":"E.110 III.4"},
     "goAround": {"v":{"GA_le_TO":true,"MCT_le_GA":true},"u":"-","scope":"engine","src":["J2"],"conf":"สูง","est":false,"note":"\"available Go-Around thrust is less than or equal to rated Take-Off thrust\""},
     "N1_GI_pct": {"v":18,"u":"%N1","scope":"engine","src":["J54"],"conf":"ต่ำ","est":true,"note":"รอบที่ 1"},
     "N2_GI_pct": {"v":57,"u":"%N2","scope":"engine","src":["J54"],"conf":"ต่ำ","est":true,"note":"รอบที่ 1 (FlightGear ใช้ 59.4 ซึ่งคัดลอกจาก CFM56)"},
     "N2_FI_pct": {"v":59,"u":"%N2","scope":"engine","src":["J54"],"conf":"ต่ำ","est":true,"note":"รอบที่ 1"},
     "N2_AI_pct": {"v":68,"u":"%N2","scope":"engine","src":["J55"],"conf":"ต่ำ","est":true,"note":"รอบที่ 1"},
     "thrustExp_k": {"v":2,"u":"-","scope":"engine","src":["J23","J23"],"conf":"กลาง","est":true,"note":"F = Fidle + (Frated - Fidle) n^k ตาม JSBSim FGTurbine; คงค่ารอบที่ 1"},
     "tau2_s": {"v":0.35,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ค่าคงที่เวลาสัญญาณเล็กของ N2 ปรับในรอบที่ 1 (f5_spool_tune.mjs)"},
     "Racc_pctps": {"v":18,"u":"%N2/s","scope":"engine","src":["J13","J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราเร่ง N2 สูงสุด เลือกให้ FI ถึง 95% ≤ 5 s ตาม 14 CFR 33.73(b) (j_spool.mjs)"},
     "accShape_a": {"v":6,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"รูปร่าง accel schedule 1/(1 + a(1 - ñ)^3)"},
     "Rdec_pctps": {"v":15,"u":"%N2/s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราลด N2"},
     "altExp": {"v":1,"u":"-","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ตัวคูณอัตรา δt^e ตามความสูง"},
     "tauFan_s": {"v":0.3,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"พัดลมใหญ่ 78 in จึง lag มากกว่า CFM56"},
     "idleFrac0": {"v":0.045,"u":"-","scope":"engine","src":["J23","J8"],"conf":"ต่ำ","est":true,"note":"net idle ต่อ F00 ที่ static SL (EEDB 7% เป็นจุดทดสอบ ไม่ใช่ idle จริง)"},
     "idleMach0": {"v":0.5,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"Mach ที่ net idle = 0"},
     "revType": {"v":{"type":"cascade (translating, Aircelle/Safran)"},"u":"-","scope":"engine","src":["J2","J30"],"conf":"สูง","est":false,"note":"E.110 Note VI.5 P/N BDL0011-12-0 / BDL0051-12-0; Safran \"Cascade thrust reversers\""},
     "rev_c0": {"v":0.3,"u":"-","scope":"engine","src":["J18","J22"],"conf":"ต่ำ","est":true,"note":"Frev = F00 (c0 + c1 M)[ρi + (1 - ρi)φ] ปรับจาก LDF ของ AC 91-79B ในรอบที่ 1"},
     "rev_c1": {"v":1,"u":"1/Mach","scope":"engine","src":["J18"],"conf":"ต่ำ","est":true,"note":"ดู rev_c0"},
     "rev_uMax": {"v":0.7,"u":"-","scope":"engine","src":["J22"],"conf":"ต่ำ","est":true,"note":"thrust demand สูงสุดในโหมด reverse"},
     "rev_idleFrac": {"v":0.1,"u":"-","scope":"engine","src":["J20"],"conf":"ต่ำ","est":true,"note":"reverse idle ให้แรงน้อยมาก (FAA AFH)"},
     "rev_deploy_s": {"v":2,"u":"s","scope":"engine","src":["J44","J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก stowed ถึง deployed (ไม่พบในแหล่งสาธารณะ) REV สีเขียวที่ s ≥ 0.9 = 1.8 s"},
     "rev_stow_s": {"v":2.5,"u":"s","scope":"engine","src":["J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก deployed ถึง stowed (ค่าประมาณ)"}
    }
   },
   "engine_default": {"v":"LEAP_1A26_class","u":"-","scope":"aircraft","src":["J9"],"conf":"กลาง","est":false,"note":"A320-251N = LEAP-1A26 (OpenAP); รุ่นของ Thai AirAsia ไม่ยืนยัน (อาจเป็น 1A26E1)"},
   "reverser": {
    "cancel_kt": {"v":36.01,"u":"m/s","scope":"aircraft","src":["J45","J39"],"conf":"กลาง","est":false,"note":"70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)"},
    "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"autoIdleWhileUnstowed":true},"u":"-","scope":"aircraft","src":["J39"],"conf":"กลาง","est":false,"note":"Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"gear down OR CONF 3/FULL (in air)","minIdle":"ground (fwd) or in flight gear up and not CONF3/FULL","reverseIdle":"slightly higher than forward idle","groundIdleAfterTouchdown_s":4},"u":"-","scope":"aircraft","src":["J42"],"conf":"กลาง","est":true,"note":"สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[4.453,-5.755,1.24],"posSTA":[11.857,-5.755],"axis":[1,0,0],"type":"turbofan","model":"LEAP_1A26_class"},{"id":2,"pos":[4.453,5.755,1.24],"posSTA":[11.857,5.755],"axis":[1,0,0],"type":"turbofan","model":"LEAP_1A26_class"}],"u":"m FRD","scope":"aircraft","src":["J24","J47"],"conf":"ต่ำ","est":true,"note":"FlightGear ใช้ตำแหน่งเดียวกับ CFM; LEAP จริงยื่นไปหน้าและสูงกว่า (ไม่พบในแหล่งสาธารณะ)"},
   "legacy": {"v":{"P":25214000,"eta":0.8,"T0":241280,"idle":0.045},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc 83.6 m/s (BPR 11.1 ลดเร็วกว่า), T0 = 2 × 120,640 N, max err 0.046"}
  }
 }
}
```

```json
{
 "a321ceo": {
  "turbofan": {
   "engines": {
    "CFM56_5B3_class": {
     "inherits": {"v":{"from":"CFM56_5B6_class"},"u":"-","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"ฮาร์ดแวร์ 5B เดียวกัน"},
     "F00": {"v":142340,"u":"N","scope":"engine","src":["J5","J9"],"conf":"สูง","est":false,"note":"32,000 lbf (14,234 daN); EEDB 3CM025 142.35 kN"},
     "MCT": {"v":129400,"u":"N","scope":"engine","src":["J5"],"conf":"สูง","est":false,"note":"29,090 lb (12,940 daN)"},
     "bpr": {"v":5.4,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM054 (5B3/3); /P = 5.6"},
     "opr": {"v":32.6,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM054"},
     "ffLTO": {"v":[1.462,1.153,0.369,0.113],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 8CM054"},
     "ffQuad": {"v":[0.0404,0.5622,0.3899],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0113"},
     "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":["J5","J27"],"conf":"สูง","est":false,"note":"Std + 15 °C (5B3/P, /2P, /3)"}
    }
   },
   "engine_default": {"v":"CFM56_5B3_class","u":"-","scope":"aircraft","src":["J9"],"conf":"กลาง","est":false,"note":"A321-211 = CFM56-5B3/P หรือ /2P (TCDS ผ่านหัวข้อ 3)"},
   "reverser": {
    "cancel_kt": {"v":36.01,"u":"m/s","scope":"aircraft","src":["J45","J39"],"conf":"กลาง","est":false,"note":"70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)"},
    "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"autoIdleWhileUnstowed":true},"u":"-","scope":"aircraft","src":["J39"],"conf":"กลาง","est":false,"note":"Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"gear down OR CONF 3/FULL (in air)","minIdle":"ground (fwd) or in flight gear up and not CONF3/FULL","reverseIdle":"slightly higher than forward idle","groundIdleAfterTouchdown_s":4},"u":"-","scope":"aircraft","src":["J42"],"conf":"กลาง","est":true,"note":"สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[4.453,-5.755,1.24],"posSTA":[16.125,-5.755],"axis":[1,0,0],"type":"turbofan","model":"CFM56_5B3_class"},{"id":2,"pos":[4.453,5.755,1.24],"posSTA":[16.125,5.755],"axis":[1,0,0],"type":"turbofan","model":"CFM56_5B3_class"}],"u":"m FRD","scope":"aircraft","src":["J24","J47"],"conf":"ต่ำ","est":true,"note":"ใช้ตำแหน่งเทียบ 25%MAC เท่า A320 (ปีกเดียวกัน); STA = 20.578 − 4.453"},
   "legacy": {"v":{"P":33557000,"eta":0.8,"T0":284680,"idle":0.05},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc 94.3 m/s (B&Y BPR 5.4), T0 = 2 × 142,340 N"}
  }
 }
}
```

```json
{
 "a321neo": {
  "turbofan": {
   "engines": {
    "LEAP_1A32_class": {
     "inherits": {"v":{"from":"LEAP_1A26_class"},"u":"-","scope":"engine","src":["J2"],"conf":"สูง","est":false,"note":"ตระกูล LEAP-1A เดียวกัน"},
     "F00": {"v":143050,"u":"N","scope":"engine","src":["J3","J9"],"conf":"สูง","est":false,"note":"32,160 lbf (14,305 daN); EEDB 20CM090 (1A35A/33/33B2/32/30) 143.1 kN"},
     "MCT": {"v":140960,"u":"N","scope":"engine","src":["J3"],"conf":"สูง","est":false,"note":"31,690 lb (14,096 daN)"},
     "bpr": {"v":10.5,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM090"},
     "opr": {"v":38.5,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM090"},
     "ffLTO": {"v":[1.062,0.869,0.284,0.098],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 20CM090"},
     "ffQuad": {"v":[0.0452,0.6498,0.3052],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0003"},
     "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":["J3"],"conf":"กลาง","est":false,"note":"Std + 15 °C; 1A33 ตาราง \"- -\" เท่ากับ 1A35A แต่ Note 5 ว่า 1A33 \"higher thrust rating\" (ขัดแย้ง)"}
    }
   },
   "engine_default": {"v":"LEAP_1A32_class","u":"-","scope":"aircraft","src":["J9","J3"],"conf":"กลาง","est":false,"note":"A321-251N(X) = LEAP-1A32; -253N = 1A33"},
   "reverser": {
    "cancel_kt": {"v":36.01,"u":"m/s","scope":"aircraft","src":["J45","J39"],"conf":"กลาง","est":false,"note":"70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)"},
    "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"autoIdleWhileUnstowed":true},"u":"-","scope":"aircraft","src":["J39"],"conf":"กลาง","est":false,"note":"Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"gear down OR CONF 3/FULL (in air)","minIdle":"ground (fwd) or in flight gear up and not CONF3/FULL","reverseIdle":"slightly higher than forward idle","groundIdleAfterTouchdown_s":4},"u":"-","scope":"aircraft","src":["J42"],"conf":"กลาง","est":true,"note":"สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[4.453,-5.755,1.24],"posSTA":[16.125,-5.755],"axis":[1,0,0],"type":"turbofan","model":"LEAP_1A32_class"},{"id":2,"pos":[4.453,5.755,1.24],"posSTA":[16.125,5.755],"axis":[1,0,0],"type":"turbofan","model":"LEAP_1A32_class"}],"u":"m FRD","scope":"aircraft","src":["J24","J47"],"conf":"ต่ำ","est":true,"note":"เหมือน a321ceo"},
   "legacy": {"v":{"P":30148000,"eta":0.8,"T0":286100,"idle":0.045},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc 84.3 m/s, T0 = 2 × 143,050 N, max err 0.046"}
  }
 }
}
```

```json
{
 "a330_300": {
  "turbofan": {
   "engines": {
    "TRENT_772B_class": {
     "F00": {"v":316300,"u":"N","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"net take-off 316.3 kN (71,100 lbf); equivalent bare engine 320.3 kN (72,000 lbf) = EEDB rated output"},
     "F00bare": {"v":320300,"u":"N","scope":"engine","src":["J6","J9"],"conf":"สูง","est":false,"note":"ใช้คำนวณ TSFC จาก EEDB"},
     "MCT": {"v":282700,"u":"N","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"63,560 lbf"},
     "bpr": {"v":5,"u":"-","scope":"engine","src":["J31","J9"],"conf":"กลาง","est":false,"note":"RR poster ผ่าน Wikipedia 5.0; EEDB 14RR071 5.03"},
     "opr": {"v":36.3,"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 14RR071"},
     "ffLTO": {"v":[3.139,2.53,0.821,0.27],"u":"kg/s","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"EEDB 14RR071 (Trent 772)"},
     "ffQuad": {"v":[0.0431,0.6153,0.3386],"u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":true,"note":"max|res| 0.0047"},
     "eedbUid": {"v":"14RR071","u":"-","scope":"engine","src":["J9"],"conf":"กลาง","est":false,"note":"\"Trent 772\" ใน OpenAP; ไม่แยก 772B"},
     "spools": {"v":3,"u":"-","scope":"engine","src":["J32","J6"],"conf":"สูง","est":false,"note":"three-spool; โมเดลใช้ N2 ของโมเดล = HP (N3) และ N1 = LP"},
     "N1_100_rpm": {"v":3900,"u":"rpm","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"LP; N2(IP) 100% = 7,000 rpm; N3(HP) 100% = 10,611 rpm"},
     "N1_max_pct": {"v":99,"u":"%N1","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"take-off 5 min; MCT 98.2%"},
     "N3_max_pct": {"v":100,"u":"%N3","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"HP take-off; MCT 99.1%; IP 103.3%"},
     "TGT_limits_C": {"v":{"takeoff":900,"maxContinuous":850,"start":700,"overtemp20s":920},"u":"degC","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"Trent ใช้ TGT ไม่ใช่ EGT"},
     "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":["J6"],"conf":"กลาง","est":true,"note":"อนุมานจาก Note VI.12 (772B ต่างจาก 772 เมื่อ > ISA+15)"},
     "hotBump_max": {"v":0.054,"u":"-","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"Note VI.12: 772B-60 เพิ่มแรงขับ take-off เมื่อ > ISA+15 °C หรือ 610–2,440 m สูงสุด 5.4%; โมเดล: Θ = 1 - kT·ΔT + min(0.054, kT·ΔT)"},
     "kT_perK": {"v":0.0065,"u":"1/K","scope":"engine","src":["J33"],"conf":"ต่ำ","est":true,"note":"ไม่มีข้อมูลรายรุ่น"},
     "mass_dry_kg": {"v":6160,"u":"kg","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"ไม่รวม fluids และ nacelle EBU"},
     "fan_diameter_m": {"v":2.47,"u":"m","scope":"engine","src":["J31"],"conf":"กลาง","est":false,"note":"97.4 in"},
     "length_m": {"v":5.639,"u":"m","scope":"engine","src":["J6"],"conf":"สูง","est":false,"note":"spinner ถึงท้าย CNA"},
     "N1_GI_pct": {"v":22.7,"u":"%N1","scope":"engine","src":["J25"],"conf":"ต่ำ","est":true,"note":"FlightGear idlen1"},
     "N2_GI_pct": {"v":62.4,"u":"%N2","scope":"engine","src":["J25"],"conf":"ต่ำ","est":true,"note":"FlightGear idlen2 (ใช้เป็น HP ของโมเดล)"},
     "N2_FI_pct": {"v":64,"u":"%N2","scope":"engine","src":["J25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
     "N2_AI_pct": {"v":72,"u":"%N2","scope":"engine","src":["J25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
     "thrustExp_k": {"v":2,"u":"-","scope":"engine","src":["J23","J23"],"conf":"กลาง","est":true,"note":"F = Fidle + (Frated - Fidle) n^k ตาม JSBSim FGTurbine; คงค่ารอบที่ 1"},
     "tau2_s": {"v":0.35,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ค่าคงที่เวลาสัญญาณเล็กของ N2 ปรับในรอบที่ 1 (f5_spool_tune.mjs)"},
     "Racc_pctps": {"v":17,"u":"%N2/s","scope":"engine","src":["J13","J19"],"conf":"ต่ำ","est":true,"note":"เลือก 17 ให้ FI ถึง 95% = 4.85 s (16 ได้ 5.07 s เกิน 33.73(b))"},
     "accShape_a": {"v":6,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"รูปร่าง accel schedule 1/(1 + a(1 - ñ)^3)"},
     "Rdec_pctps": {"v":14,"u":"%N2/s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ขีดอัตราลด N2"},
     "altExp": {"v":1,"u":"-","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"ตัวคูณอัตรา δt^e ตามความสูง"},
     "tauFan_s": {"v":0.4,"u":"s","scope":"engine","src":["J19"],"conf":"ต่ำ","est":true,"note":"พัดลม 2.47 m (ค่าประมาณ)"},
     "idleFrac0": {"v":0.05,"u":"-","scope":"engine","src":["J23","J8"],"conf":"ต่ำ","est":true,"note":"net idle ต่อ F00 ที่ static SL (EEDB 7% เป็นจุดทดสอบ ไม่ใช่ idle จริง)"},
     "idleMach0": {"v":0.5,"u":"-","scope":"engine","src":["J23"],"conf":"ต่ำ","est":true,"note":"Mach ที่ net idle = 0"},
     "revType": {"v":{"type":"cascade in C-duct (fan stream)"},"u":"-","scope":"engine","src":["J41","J6"],"conf":"ต่ำ","est":false,"note":"FAA AD 2005: \"the C-duct of the thrust reverser on Rolls-Royce engines\"; TRU อยู่ใน engine DIS; ชนิดละเอียดไม่พบในแหล่งสาธารณะ"},
     "rev_c0": {"v":0.3,"u":"-","scope":"engine","src":["J18","J22"],"conf":"ต่ำ","est":true,"note":"Frev = F00 (c0 + c1 M)[ρi + (1 - ρi)φ] ปรับจาก LDF ของ AC 91-79B ในรอบที่ 1"},
     "rev_c1": {"v":1,"u":"1/Mach","scope":"engine","src":["J18"],"conf":"ต่ำ","est":true,"note":"ดู rev_c0"},
     "rev_uMax": {"v":0.7,"u":"-","scope":"engine","src":["J22"],"conf":"ต่ำ","est":true,"note":"thrust demand สูงสุดในโหมด reverse"},
     "rev_idleFrac": {"v":0.1,"u":"-","scope":"engine","src":["J20"],"conf":"ต่ำ","est":true,"note":"reverse idle ให้แรงน้อยมาก (FAA AFH)"},
     "rev_deploy_s": {"v":2.5,"u":"s","scope":"engine","src":["J44","J17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (เครื่องใหญ่กว่า)"},
     "rev_stow_s": {"v":3,"u":"s","scope":"engine","src":["J17"],"conf":"ต่ำ","est":true,"note":"เวลาจาก deployed ถึง stowed (ค่าประมาณ)"}
    }
   },
   "engine_default": {"v":"TRENT_772B_class","u":"-","scope":"aircraft","src":["J32","J7","J34"],"conf":"กลาง","est":false,"note":"AirAsia X A330-343 = Trent 772B-60 (ATSB); A330-343 อาจเป็น 768-60/772B-60/772C-60 ตาม TCDS"},
   "reverser": {
    "cancel_kt": {"v":36.01,"u":"m/s","scope":"aircraft","src":["J45"],"conf":"กลาง","est":false,"note":"70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)"},
    "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"autoIdleWhileUnstowed":true},"u":"-","scope":"aircraft","src":["J39"],"conf":"กลาง","est":false,"note":"Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow"}
   },
   "idleAndLTO": {
    "AI_select": {"v":{"approachIdleWhen":"gear down OR CONF 3/FULL (in air)","minIdle":"ground (fwd) or in flight gear up and not CONF3/FULL","reverseIdle":"slightly higher than forward idle","groundIdleAfterTouchdown_s":4},"u":"-","scope":"aircraft","src":["J42"],"conf":"กลาง","est":true,"note":"สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[3.184,-9.401,2.149],"posSTA":[null,-9.401],"axis":[1,0,0],"type":"turbofan","model":"TRENT_772B_class"},{"id":2,"pos":[3.184,9.401,2.149],"posSTA":[null,9.401],"axis":[1,0,0],"type":"turbofan","model":"TRENT_772B_class"}],"u":"m FRD","scope":"aircraft","src":["J25"],"conf":"ต่ำ","est":true,"note":"FlightGear A330-300-RR (engine x −2.703, CG 0.481, AERORP 1.481 จึงได้ 4.18 m ถ้าอ้าง AERORP); z ขัดกับความสูง CG 3.6 m ของหัวข้อ 5 (ดูความขัดแย้ง); STA ไม่มีเพราะไม่มี LEMAC"},
   "legacy": {"v":{"P":75596000,"eta":0.8,"T0":632600,"idle":0.05},"u":"W, -, N, -","scope":"sim","src":["J11","J10"],"conf":"ต่ำ","est":true,"note":"Vc 95.6 m/s, T0 = 2 × 316,300 N, max err 0.042"}
  }
 }
}
```

