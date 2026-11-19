**รุ่นย่อย, _na, airframe**

```json
{
 "c172r": {
  "_inherits": {"v":"c172s","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"โครงลำ ปีก หาง พื้นบังคับ ล้อ และระยะเคลื่อนเหมือน 172S ตาม TCDS 3A12 (172R กับ 172S อยู่ใน TCDS ฉบับเดียวกัน ค่าระยะเคลื่อนเท่ากันทุกตัว) บัตรนี้ใส่เฉพาะค่าที่ต่าง: เครื่องยนต์ 160 hp ที่ 2,400 rpm ใบพัด 1C235/LFA7570, น้ำหนัก, CG, ความเร็ว, สมรรถนะ และค่า fit ของซิม"},
  "_na": {"v":["turboprop.*","turbofan.*","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.flightIdleShaftPower","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","gear.strut_main.p_static","gear.strut_main.piston_area","gear.strut_main.ratio_static_to_extended","gear.strut_main.ratio_compressed_to_extended","gear.strut_main.polytropic_n_dynamic","gear.strut_main.polytropic_n_static","gear.strut_main.Kh_compression","gear.strut_main.Kr_rebound","gear.strut_main.seal_friction_ratio","gear.brakes.antiskid_efficiency","gear.brakes.antiskid_efficiency_measured","gear.brakes.antiskid_slip_setpoint","gear.certification.part25_limit_descent","gear.certification.part25_friction_cap","controls.reference_types.*","controls.roll.tab_max","controls.roll.trim_rate","controls.yaw.tab_max","controls.yaw.trim_rate","controls.pitch.derived_check","interference.groundEffect.tablesCheck","wind.discreteGust.cfr25_341_Fg","wind.wake.leaders","numerics.*","validation.typicalModes.*","validation.currentModel.*","otherSims.*"],"u":"-","scope":"aircraft","src":["LC0","LE0"],"conf":"สูง","est":false,"note":"รายการเดียวกับ c172s (เหตุผลเดียวกัน: เครื่องลูกสูบใบพัด fixed pitch ไม่มี governor/feather/reverse; ขาหลักสปริงเหล็กไม่มีพารามิเตอร์ oleo; ไม่มี anti-skid; ไม่ใช่ Part 25; มี trim เฉพาะ elevator tab ตาม TCDS 3A12; ค่าตรวจและค่าตัวซิมไม่ใช่ข้อมูลรายแบบ; otherSims เป็นของหัวข้อ 03) ต้องเขียนซ้ำเพราะ leaf _na ของรุ่นย่อยแทนที่ของ c172s ทั้งก้อน · leaf รอบที่ 1 ระดับลึกที่ไม่มีข้อมูลสาธารณะของ 172R (แรงที่คัน hinge moment ใบพัดรายละเอียด buffet spin) ใช้ค่าของ c172s ที่สืบทอดมา ถ้าต้องแยกรายแบบให้เลื่อนไปทำเมื่อจำเป็น"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Cessna Aircraft Company","model":"172R","variant":"Skyhawk (รวม NAV III G1000 ของ 172R ที่ผลิตภายหลัง)","engine":"Lycoming IO-360-L2A 160 hp @ 2,400 rpm (พิกัดตาม TCDS ของเครื่องบิน)","propeller":"McCauley 1C235/LFA7570 fixed pitch 2 ใบ 74–75 in","seats":4,"category":"normal / utility","tc_ref":"FAA TCDS 3A12 Model 172R (s/n 17280001 ขึ้นไป, TC แก้ไข 21 มิ.ย. 1996)"},"u":"-","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"ไทย: C172R 5 ลำ (CATC 3 ที่หัวหิน VTPH, BAC 2) และ FNPT แบบ C172R 3 เครื่อง (CATC 1, BAC 2) [LS1, LS2]; 172R ที่ติด kit MK172-72-01 ได้ 180 hp/2,700 rpm ใบพัด 1A170E/JHA7660 MTOW 2,550 lb = เท่ากับ c172s"},
   "older_variants": {"v":{"c172m":{"years":"1973–1976","engine":"Lycoming O-320-E2D (carburetted)","P_kW":111.9,"rpm":2700,"prop":"McCauley 1C160/CTM7553 or DTM7553","prop_D_m":1.905,"static_rpm":[2270,2370],"MTOW_kg":1043.3,"flap_max_deg":40,"VNE_kias":158,"VNO_kias":126,"VA_kias":97,"VFE_kias":87,"cg_fwd_mtow_pctMAC":21.4,"cg_aft_pctMAC":36.4,"spec":{"roc_sl_fpm":645,"ceiling_ft":13100,"to_roll_ft":865,"to_50_ft":1525,"ldg_roll_ft":520,"ldg_50_ft":1250,"src":"LE5"}},"c172n":{"years":"1977–1980","engine":"Lycoming O-320-H2AD (carburetted)","P_kW":119.3,"rpm":2700,"prop":"McCauley 1C160/DTM7557","prop_D_m":1.905,"static_rpm":[2280,2400],"MTOW_kg":1043.3,"flap_max_deg":40,"VNE_kias":160,"VNO_kias":128,"VA_kias":97,"VFE_kias":85,"cg_fwd_mtow_pctMAC":21.4,"cg_aft_pctMAC":36.4,"spec":{"roc_sl_fpm":770,"ceiling_ft":14200,"to_roll_ft":805,"to_50_ft":1440,"ldg_roll_ft":520,"ldg_50_ft":1250,"vs1_kcas":50,"vs0_kcas":44,"vx_kias":59,"vy_kias":73,"vg_kias":65,"vref_short_kias":60,"cruise75_8000_ktas":122,"src":"LE4"}},"c172p":{"years":"1981–1986","engine":"Lycoming O-320-D2J (carburetted)","P_kW":119.3,"rpm":2700,"prop":"McCauley 1C160/DTM7557","prop_D_m":1.905,"static_rpm":[2300,2420],"MTOW_kg":1088.6,"flap_max_deg":30,"VNE_kias":158,"VNO_kias":127,"VA_kias":99,"VFE_kias":85,"cg_fwd_mtow_pctMAC":23.1,"cg_aft_pctMAC":36.4,"spec":{"roc_sl_fpm":700,"ceiling_ft":13000,"to_roll_ft":890,"to_50_ft":1625,"ldg_roll_ft":540,"ldg_50_ft":1280,"vs1_kcas":52,"vs1_kcas_spec":51,"vs0_kcas":46,"vy_kias":76,"vg_kias":65,"cruise75_8000_ktas":120,"src":"LB9, LB10"}}},"u":"-, kW, rpm, m, kg, deg, kt IAS, %MAC, ft, fpm","scope":"aircraft","src":["LE1","LE4","LE5","LB9","LB10","LS1"],"conf":"กลาง","est":false,"note":"รุ่นเก่า O-320 คาร์บูเรเตอร์ที่ ATO ไทยมี 5 ลำ (AAT M+N, TIF M+N, BAC P) [LS1]: ข้อมูล TCDS 3A12 (สูง) และหน้า spec ของ POH (172N [LE4] สูง; 172P ผ่านหัวข้อ 03 [LB9, LB10] สูง; 172M จาก 172guide [LE5] ต่ำ ความเร็ว stall ของหน้า 172M อ่านไม่ได้จึงไม่ใส่) · ความเร็วจำกัดของ 172M ใน v เป็นชุด s/n ต้น (17260759–17265684) ซึ่งตรงกับ 172M ของ AAT (17265202) และ TIF (17260826) ในทะเบียน [LS1]; 172N ของทั้งสองสถาบันเป็นรุ่น 1977–79 (VNE 160) · ไม่ทำบัตรแยก ถ้าจะบินในซิมให้ใช้ c172r แล้วแก้ P, MTOW, แฟลปสุด (40° ของ M/N) ตาม §10.10"},
   "weights": {
    "MTOW": {"v":1111.3,"u":"kg","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"2,450 lb normal; utility 2,100 lb (952.5 kg) เมื่อใช้ POH/AFM 172RPHUS ทุกฉบับหรือ 172RPHAUS-00 ถึง -03 และ 2,200 lb (997.9 kg) เมื่อใช้ 172RPHAUS-04 ขึ้นไปหรือ 172RPHBUS [LE1 Section Model 172R]"},
    "MLW": {"v":1111.3,"u":"kg","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"2,450 lb เท่า MTOW"},
    "MRW": {"v":1114.48,"u":"kg","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"2,457 lb"},
    "BEW_typical": {"v":743.4,"u":"kg","scope":"aircraft","src":["LE2"],"conf":"กลาง","est":false,"note":"1,639 lb standard empty weight (IM p ii, Feb 2000); 172guide ให้ 1,699 lb (770.7 kg) น่าจะเป็นฉบับปรับปรุงที่อุปกรณ์มากขึ้น ต่างกันรายลำ"},
    "max_fuel_usable": {"v":144.2,"u":"kg","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"53 US gal ใช้ได้ (200.6 L) จาก 56 gal ที่ 6.0 lb/gal; ถังปีก 2 × 28 gal ที่ 48.0 in DAT"},
    "useful_load": {"v":371,"u":"kg","scope":"aircraft","src":["LE2"],"conf":"กลาง","est":false,"note":"818 lb (IM p ii); utility 468 lb; 172guide 758 lb"},
    "training_mass": {"v":998.7,"u":"kg","scope":"aircraft","src":["LE0","LE2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (กฎเดียวกับ c172s): BEW 743.4 kg + ครู 85 kg + ศิษย์ 75 kg + เชื้อเพลิง 35 gal (95.3 kg) = 998.7 kg (2202 lb); การเทียบ POH ใช้ --mass 1111.3"}
   },
   "cg": {
    "envelope": {"v":[[884.5,0.889,1.2014],[1111.3,1.016,1.2014]],"u":"kg, m DAT","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"normal: หน้า 35.0 in (15.5 %MAC) ที่ ≤1,950 lb เชิงเส้นถึง 40.0 in (24 %MAC) ที่ 2,450 lb; หลัง 47.3 in (36.4 %MAC) ทุกน้ำหนัก; utility หน้า 36.5 in ที่ 2,100 lb (POH 172RPHUS หรือ 172RPHAUS-00..-03) หรือ 37.5 in ที่ 2,200 lb (172RPHAUS-04 ขึ้นไปหรือ 172RPHBUS) หลัง 40.5 in; datum = ผิวหน้าส่วนล่างของ firewall, LEMAC 25.9 in, MAC 58.8 in (เท่ากับ 172S) · CG อ้างอิงของบัตร 42.0 in (27.4 %MAC) สืบทอดจาก c172s และอยู่ในช่วงทุกน้ำหนัก"}
   },
   "inertia": {
    "Ixx": {"v":1850,"u":"kg m2","scope":"aircraft","src":["LM5","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: radii ของเครื่องคลาส C172 ที่วัดใน TM-80163 (Rx 0.235) กับมวล 1,111.3 kg, b 11.00 m (เหมือน c172s)"},
    "Iyy": {"v":2002,"u":"kg m2","scope":"aircraft","src":["LM5","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ry 0.324, L 8.28 m (27 ft 2 in ตาม IM 172R)"},
    "Izz": {"v":3427,"u":"kg m2","scope":"aircraft","src":["LM5","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Rz 0.364"},
    "Ixz": {"v":163,"u":"kg m2","scope":"aircraft","src":["LM5","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 123 kg m2 ของ TM-80163 คูณ m/837.9"},
    "ref_mass": {"v":1111.3,"u":"kg","scope":"aircraft","src":["LE1"],"conf":"สูง","est":false,"note":"MTOW 2,450 lb; lm_card คูณ inertia ด้วย m/ref_mass"}
   },
   "geometry": {
    "length": {"v":8.2804,"u":"m","scope":"aircraft","src":["LE2"],"conf":"กลาง","est":false,"note":"27 ft 2 in (IM 172R Fig 1-1); บัตร c172s ใช้ 26 ft 11 in (8.205 m) จาก IM 172S ต่างกัน 3 in น่าจะเป็นวิธีวัด (spinner) ไม่ใช่โครงลำต่างกัน"},
    "height": {"v":2.7178,"u":"m","scope":"aircraft","src":["LE2"],"conf":"กลาง","est":false,"note":"8 ft 11 in \"MAX\" (IM 172R Fig 1-1, รวมเสาอากาศ/ไฟบนหาง) ต่างจาก 2.36 m ในบัตร c172s ดู §10.13"}
   }
  }
 }
}
```

**aero (เฉพาะส่วนที่ต่างจาก c172s)**

```json
{
 "c172r": {
  "aero": {
   "derivatives": {
    "CD0": {"v":{"cruise":0.0325,"glide_windmill":0.0524},"u":"-","scope":"aircraft","src":["LE2","LE3","LC4","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: cruise จาก 80 % (128 hp) 8,000 ft 122 KTAS (มี speed fairing) ที่ 2,450 lb, η 0.80 (สมมติ เท่ากับบัตร c172s), e 0.75; ตรงกับ 34 จุดของ Fig 5-8 ภายใน -1 ถึง +10 %; glide จาก 65 KIAS (66 KCAS) L/D 9.11 (1.5 NM/1,000 ft); c172s 0.033 / 0.0508"},
    "K": {"v":{"cruise":0.0567,"glide_windmill":0.0575},"u":"-","scope":"aircraft","src":["LE2","LE3","LC4","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: cruise e 0.75 AR 7.48; glide e 0.74 (รวมแรงต้านใบพัดหมุนฟรี)"}
   },
   "legacy": {"v":{"CD0":0.06061,"K":0.06817,"CL0":0.25,"CLa":5.17,"CLflap":0.321,"CDflap":0.0193,"CDgear":0,"Cm0":-0.0206,"Cma":-0.942,"Cmflap":-0.0864,"aStall":18.3,"aStallFlap":0.57},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM0","LE0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static (le_fit.mjs): polar รูปแบบซิมจาก glide 65 KIAS L/D 9.11 ที่ 2,450 lb; aStall/aStallFlap แก้หาให้ CLmax 1 g ตรง CLmax ของบัตร (สืบทอดจาก c172s ซึ่งตรง stall ของ 172R ภายใน 0.2 %); CL0/CLa/flap/Cm จากบัตร c172s (AC.flaps 0–1 = 0–30°)"}
  }
 }
}
```

**speeds**

```json
{
 "c172r": {
  "speeds": {
   "VS0_kt": {"v":47,"u":"kt CAS","scope":"aircraft","src":["LE3","LE2"],"conf":"สูง","est":false,"note":"แฟลป 30 power off 2,450 lb (Fig 5-3 ทั้ง CG หน้าและหลัง; IM p ii); KIAS 33 (ขอบล่าง white arc) ซึ่ง POH บอกว่าเป็นค่าโดยประมาณ"},
   "VS1_kt": {"v":52,"u":"kt CAS","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"แฟลป 0 power off 2,450 lb CG หน้าสุด (Fig 5-3, KIAS 44 = ขอบล่าง green arc); หน้า spec (IM p ii) และ 172guide ให้ 51 KCAS = ค่า CG หลังสุด"},
   "VX_kt": {"v":60,"u":"kt IAS","scope":"aircraft","src":["LE2"],"conf":"สูง","est":false,"note":"SL (62 KCAS); 65 KIAS ที่ 10,000 ft (IM p4-5)"},
   "VY_kt": {"v":79,"u":"kt IAS","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"SL (78.1 KCAS); 71 KIAS ที่ 10,000 ft; ตาราง Fig 5-6 ลดจาก 79 ถึง 69 KIAS ที่ 12,000 ft"},
   "VR_kt": {"v":51,"u":"kt IAS","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"short field แฟลป 10 lift-off 51 KIAS (55.7 KCAS) และ 57 KIAS ที่ 50 ft (Fig 5-5); normal takeoff ยกล้อหน้าที่ 55 KIAS (IM p4-15)"},
   "VAPP_kt": {"v":65,"u":"kt IAS","scope":"aircraft","src":["LE2"],"conf":"กลาง","est":false,"note":"normal approach แฟลป 30 60–70 KIAS ใช้กลางช่วง (65.5 KCAS); แฟลปขึ้น 65–75 KIAS"},
   "VAPP_short_kt": {"v":62,"u":"kt IAS","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"short field แฟลป 30 (62.8 KCAS)"},
   "VREF_kt": {"v":62,"u":"kt IAS","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"ความเร็วที่ 50 ft ของ Fig 5-11 (short field แฟลป 30); แฟลปขึ้น +7 KIAS"},
   "VG_kt": {"v":65,"u":"kt IAS","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"2,450 lb แฟลปขึ้น (66 KCAS) IM p3-3, Fig 3-1"},
   "VA_kt": {"v":{"1600":82,"2000":92,"2450":99},"u":"kt IAS","scope":"aircraft","src":["LE2","LE1"],"conf":"สูง","est":false,"note":"lb → KIAS (KCAS 82/91/97) IM p2-4; TCDS 99 KIAS (97 KCAS)"},
   "VNO_kt": {"v":129,"u":"kt IAS","scope":"aircraft","src":["LE2","LE1"],"conf":"สูง","est":false,"note":"126 KCAS"},
   "VNE_kt": {"v":163,"u":"kt IAS","scope":"aircraft","src":["LE2","LE1"],"conf":"สูง","est":false,"note":"160 KCAS (ตาราง Fig 5-1 ไปถึง 160 KIAS = 154 KCAS เท่านั้น ดู §10.13)"},
   "VFE": {"v":{"10":110,"20":85,"30":85},"u":"kt IAS","scope":"aircraft","src":["LE2","LE1"],"conf":"สูง","est":false,"note":"แฟลป 10° 110 KIAS (108 KCAS), 10–30° 85 KIAS (84 KCAS); TCDS ระบุเฉพาะ 85 KIAS"},
   "ias_cas": {"v":{"0":[[50,56],[60,62],[70,70],[80,79],[90,89],[100,98],[110,107],[120,117],[130,126],[140,135],[150,145],[160,154]],"10":[[40,49],[50,55],[60,62],[70,70],[80,79],[90,89],[100,98],[110,108]],"30":[[40,47],[50,53],[60,61],[70,70],[80,80],[85,84]]},"u":"KIAS → KCAS","scope":"aircraft","src":["LE3"],"conf":"กลาง","est":false,"note":"Fig 5-1 normal static source, power for level flight (p5-9); อ่านจาก OCR จับคู่คอลัมน์ตามลำดับ; ต่างจากตารางของ 172S ที่ความเร็วต่ำ (แฟลป 30 ที่ 40 KIAS: 47 vs 50 KCAS)"},
   "stall_warning_margin_kt": {"v":5,"u":"kt","scope":"aircraft","src":["LE2","LM3"],"conf":"สูง","est":false,"note":"แตรเตือน stall ดัง 5–10 kt ก่อน stall ทุก configuration (IM p4-30); ใช้ขอบล่าง 5 kt ซึ่งเป็นค่าต่ำสุดตาม 14 CFR 23.207 เดิม"},
   "stall_altitude_loss_ft": {"v":230,"u":"ft","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"หมายเหตุของ Fig 5-3 (p5-12): เสียความสูงตอนแก้ stall ได้ถึง 230 ft (70 m)"},
   "crosswind_demonstrated_kt": {"v":15,"u":"kt","scope":"aircraft","src":["LE2"],"conf":"สูง","est":false,"note":"ลมขวางตรงที่สาธิตแล้ว 15 kt (7.7 m/s) ทั้งวิ่งขึ้นและลงจอด (IM p4-5, p4-33) ไม่ใช่ข้อจำกัด"},
   "stall_table": {"v":{"cg_fwd":{"0":[[44,52],[48,56],[53,62],[63,74]],"10":[[37,50],[40,53],[44,59],[53,70]],"30":[[33,47],[36,50],[40,56],[47,66]]},"cg_aft":{"0":[[44,51],[48,55],[53,61],[63,73]],"10":[[35,48],[38,52],[42,58],[50,69]],"30":[[33,47],[36,50],[40,56],[47,66]]},"bank_deg":[0,30,45,60],"cell":"[KIAS, KCAS]"},"u":"kt","scope":"aircraft","src":["LE3"],"conf":"กลาง","est":false,"note":"Fig 5-3 2,450 lb power off (p5-12); ข้อความ OCR สลับตำแหน่ง ผู้วิจัยจัดเข้าช่องตามลำดับคอลัมน์และตรวจว่าทุกช่องตรง V0/√cos φ ภายใน 1.12 kt; บล็อกที่ความเร็วสูงกว่าถือเป็น CG หน้าสุด; KIAS เป็นค่าโดยประมาณตาม POH"}
  }
 }
}
```

**performance**

```json
{
 "c172r": {
  "performance": {
   "ROC_SL_fpm": {"v":720,"u":"fpm","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"2,450 lb SL ISA (IM p ii); interpolate Fig 5-6 ที่ 15 °C ได้ 721 fpm"},
   "ROC_table": {"v":{"axes":{"PA_ft":[0,2000,4000,6000,8000,10000,12000],"OAT_C":[-20,0,20,40]},"kias":[79,77,76,74,72,71,69],"data":[[830,770,705,640],[720,655,595,535],[645,585,525,465],[530,475,415,360],[420,365,310,250],[310,255,200,145],[200,145,null,null]]},"u":"fpm","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"Fig 5-6 2,450 lb แฟลปขึ้น คันเร่งเต็ม (p5-15); leaned เหนือ 3,000 ft; null = ไม่มีข้อมูล; VTBD 35 °C ≈ 656 fpm"},
   "service_ceiling_ft": {"v":13500,"u":"ft","scope":"aircraft","src":["LE2"],"conf":"สูง","est":false,"note":"IM p ii; extrapolate คอลัมน์ ISA ของ Fig 5-6 ได้ 100 fpm ที่ 13394 ft"},
   "cruise_table": {"v":[{"alt_ft":8000,"power":"80 %","ktas":122,"note":"หน้า spec (IM p ii) มี speed fairing (ไม่มี ≈ 120)"},{"alt_ft":0,"power":"max","ktas":123,"note":"หน้า spec มี speed fairing"},{"alt_ft":2000,"rpm":2250,"power":"79 %","ktas":115,"gph":9,"isa":0},{"alt_ft":2000,"rpm":2200,"power":"74 %","ktas":112,"gph":8.5,"isa":0},{"alt_ft":2000,"rpm":2100,"power":"65 %","ktas":106,"gph":7.5,"isa":0},{"alt_ft":2000,"rpm":2000,"power":"58 %","ktas":99,"gph":6.6,"isa":0},{"alt_ft":2000,"rpm":1900,"power":"51 %","ktas":91,"gph":5.9,"isa":0},{"alt_ft":4000,"rpm":2300,"power":"79 %","ktas":117,"gph":9.1,"isa":0},{"alt_ft":4000,"rpm":2250,"power":"75 %","ktas":114,"gph":8.6,"isa":0},{"alt_ft":4000,"rpm":2200,"power":"70 %","ktas":111,"gph":8.1,"isa":0},{"alt_ft":4000,"rpm":2100,"power":"62 %","ktas":105,"gph":7.1,"isa":0},{"alt_ft":4000,"rpm":2000,"power":"55 %","ktas":98,"gph":6.4,"isa":0},{"alt_ft":4000,"rpm":1900,"power":"50 %","ktas":90,"gph":5.8,"isa":0},{"alt_ft":6000,"rpm":2350,"power":"80 %","ktas":120,"gph":9.2,"isa":0},{"alt_ft":6000,"rpm":2300,"power":"75 %","ktas":117,"gph":8.6,"isa":0},{"alt_ft":6000,"rpm":2250,"power":"71 %","ktas":114,"gph":8.1,"isa":0},{"alt_ft":6000,"rpm":2200,"power":"67 %","ktas":111,"gph":7.7,"isa":0},{"alt_ft":6000,"rpm":2100,"power":"60 %","ktas":104,"gph":6.9,"isa":0},{"alt_ft":6000,"rpm":2000,"power":"53 %","ktas":96,"gph":6.2,"isa":0},{"alt_ft":8000,"rpm":2400,"power":"80 %","ktas":122,"gph":9.2,"isa":0},{"alt_ft":8000,"rpm":2350,"power":"76 %","ktas":119,"gph":8.7,"isa":0},{"alt_ft":8000,"rpm":2300,"power":"71 %","ktas":116,"gph":8.2,"isa":0},{"alt_ft":8000,"rpm":2200,"power":"64 %","ktas":110,"gph":7.3,"isa":0},{"alt_ft":8000,"rpm":2100,"power":"57 %","ktas":102,"gph":6.6,"isa":0},{"alt_ft":8000,"rpm":2000,"power":"52 %","ktas":94,"gph":6,"isa":0},{"alt_ft":10000,"rpm":2350,"power":"72 %","ktas":118,"gph":8.2,"isa":0},{"alt_ft":10000,"rpm":2300,"power":"68 %","ktas":115,"gph":7.8,"isa":0},{"alt_ft":10000,"rpm":2250,"power":"65 %","ktas":112,"gph":7.4,"isa":0},{"alt_ft":10000,"rpm":2200,"power":"61 %","ktas":108,"gph":7,"isa":0},{"alt_ft":10000,"rpm":2100,"power":"55 %","ktas":100,"gph":6.4,"isa":0},{"alt_ft":10000,"rpm":2000,"power":"51 %","ktas":91,"gph":5.9,"isa":0},{"alt_ft":12000,"rpm":2350,"power":"69 %","ktas":117,"gph":7.9,"isa":0},{"alt_ft":12000,"rpm":2300,"power":"65 %","ktas":113,"gph":7.5,"isa":0},{"alt_ft":12000,"rpm":2250,"power":"62 %","ktas":109,"gph":7.1,"isa":0},{"alt_ft":12000,"rpm":2200,"power":"59 %","ktas":105,"gph":6.8,"isa":0},{"alt_ft":12000,"rpm":2100,"power":"54 %","ktas":97,"gph":6.2,"isa":0}],"u":"ft, rpm, -, kt TAS, US gal/h","scope":"aircraft","src":["LE2","LE3"],"conf":"กลาง","est":false,"note":"จุดสรุป p ii และคอลัมน์ ISA ของ Fig 5-8 ทั้งสองแผ่น (p5-17 2,000–6,000 ft และ p5-18 8,000–12,000 ft, 2,450 lb recommended lean) ทุกค่ารวมหน้า spec เป็นความเร็วของเครื่องที่ติด speed fairing (หมายเหตุของ IM p iii และ Fig 5-8) ลบราว 2 kt ถ้าไม่มี; IM p4-27: 80 % ที่ SL/4,000/8,000 ft = 113/117/122 KTAS; 80 % ที่ 8,000 ft ใช้ 2,400 rpm (แผ่น 2)"},
   "glide": {"v":{"speed_kt":65,"ratio":9.114},"u":"kt IAS, -","scope":"aircraft","src":["LE2","LE3","LC4"],"conf":"ต่ำ","est":true,"note":"ความเร็ว 65 KIAS จาก POH (สูง); อัตราร่อน 9.1 = rule of thumb 1.5 NM ต่อ 1,000 ft สำหรับ C152 และ C172 ของ FAA AFS-920 18-05 เพราะกราฟ Fig 3-1 (แกน 0–12,000 ft × 0–20 NM) อ่านเป็นตัวเลขไม่ได้ (ค่าประมาณ)"},
   "takeoff": {"v":{"ground_roll_m":288,"over50ft_m":514},"u":"m","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"short field แฟลป 10 2,450 lb SL ISA ลมสงบผิวแห้ง: 945 / 1,685 ft (IM p ii, Fig 5-5)"},
   "landing": {"v":{"ground_roll_m":168,"over50ft_m":395},"u":"m","scope":"aircraft","src":["LE2","LE3"],"conf":"สูง","est":false,"note":"short field แฟลป 30 62 KIAS เบรกสุด: 550 / 1,295 ft (IM p ii, Fig 5-11)"},
   "takeoff_table": {"v":{"axes":{"PA_ft":[0,1000,2000,3000,4000,5000,6000,7000,8000],"OAT_C":[0,10,20,30,40]},"roll_ft":[[845,910,980,1055,1135],[925,1000,1075,1160,1245],[1015,1095,1185,1275,1365],[1115,1205,1305,1400,1505],[1230,1330,1435,1545,1655],[1355,1470,1585,1705,1830],[1500,1625,1750,1880,2020],[1660,1795,1935,2085,2240],[1840,1995,2150,2315,null]],"total50_ft":[[1510,1625,1745,1875,2015],[1660,1790,1925,2070,2220],[1830,1970,2125,2290,2455],[2020,2185,2360,2540,2730],[2245,2430,2630,2830,3045],[2500,2715,2945,3175,3430],[2805,3060,3315,3590,3895],[3170,3470,3770,4105,4485],[3620,3975,4345,4775,null]]},"u":"ft","scope":"aircraft","src":["LE3"],"conf":"กลาง","est":false,"note":"Fig 5-5 short field 2,450 lb แฟลป 10 lift-off 51 KIAS 57 KIAS ที่ 50 ft (p5-14); แถว 5,000 ft OCR เพี้ยนบางช่อง; null = POH เว้นไว้ (ไต่ได้น้อย); VTBD 35 °C: 1095 / 1945 ft"},
   "landing_table": {"v":{"axes":{"PA_ft":[0,1000,2000,3000,4000,5000,6000,7000,8000],"OAT_C":[0,10,20,30,40]},"roll_ft":[[525,540,560,580,600],[545,560,580,600,620],[565,585,605,625,645],[585,605,625,650,670],[605,630,650,670,695],[630,650,675,700,720],[655,675,700,725,750],[null,705,730,755,775],[705,730,755,780,810]],"total50_ft":[[1250,1280,1310,1340,1370],[1280,1310,1345,1375,1405],[1310,1345,1375,1410,1440],[1345,1380,1415,1445,1480],[1380,1415,1450,1485,1520],[1415,1455,1490,1525,1560],[1455,1490,1530,1565,1605],[1495,1535,1570,1610,1650],[1535,1575,1615,1655,1695]]},"u":"ft","scope":"aircraft","src":["LE3"],"conf":"กลาง","est":false,"note":"Fig 5-11 2,450 lb แฟลป 30 62 KIAS (p5-21); null = OCR อ่านไม่ได้; ลมหน้า −10 %/9 kt, ลมหลัง +10 %/2 kt, หญ้าแห้ง +45 % ของ ground roll, แฟลปขึ้น +7 KIAS และ +35 %; VTBD 35 °C: 590 / 1355 ft"},
   "fuel": {"v":{"usable_L":200.6,"usable_kg":144.2,"range_80pct_8000ft_nm":580,"endurance_80pct_h":4.8,"range_60pct_10000ft_nm":687,"endurance_60pct_h":6.6,"bsfc_g_per_kWh":262},"u":"L, kg, NM, h, g/kWh","scope":"aircraft","src":["LE2","LE3","LE0"],"conf":"สูง","est":false,"note":"p ii: 53 gal ใช้ได้ เครื่องติด speed fairing (ระยะเปลี่ยนตาม); ระยะรวมเชื้อเพลิง start/taxi/takeoff/climb และสำรอง 45 นาที ตาม Fig 5-9 p5-19; BSFC เฉลี่ย 0.431 lb/(hp h) จาก 34 จุดของ Fig 5-8 ทั้งสองแผ่น (คำนวณ)"},
   "tests": {"v":[{"id":"T-LE-05","case":"stall_f0","conditions":"2,450 lb, CG หน้าสุด, idle, แฟลป 0, ปีกระดับ, ลด 1 kt/s","quantity":"VS1 KCAS (Vmin)","expected":52,"tolerance":3},{"id":"T-LE-06","case":"stall_f10","conditions":"เหมือน stall_f0 แฟลป 10","quantity":"VS KCAS","expected":50,"tolerance":3},{"id":"T-LE-07","case":"stall_f30","conditions":"เหมือน stall_f0 แฟลป 30","quantity":"VS0 KCAS","expected":47,"tolerance":3},{"id":"T-LE-08","case":"climb_SL","conditions":"2,450 lb, SL ISA, คันเร่งเต็ม, แฟลป 0","quantity":"ROC สูงสุด fpm / Vy KCAS","expected":[720,78.1],"tolerance":[100,3]},{"id":"T-LE-10","case":"climb_8000","conditions":"2,450 lb, 8,000 ft ISA, คันเร่งเต็ม, แฟลป 0","quantity":"ROC สูงสุด fpm","expected":367,"tolerance":100},{"id":"T-LE-11","case":"glide","conditions":"2,450 lb, 3,000 ft ISA, แรงขับศูนย์, แฟลป 0","quantity":"VG KCAS / L/D (ค่าประมาณ)","expected":[66,9.114],"tolerance":[3,0.5]},{"id":"T-LE-12/13","case":"takeoff_SL","conditions":"short field แฟลป 10, 2,450 lb, SL 15 °C, ลมสงบ, ทางแห้ง","quantity":"ground roll m / ถึง 50 ft m","expected":[288,514],"tolerance":["5 %","10 %"]},{"id":"T-LE-14","case":"takeoff_VTBD_35C","conditions":"เหมือน takeoff_SL แต่ OAT 35 °C","quantity":"ground roll m / ถึง 50 ft m","expected":[334,593],"tolerance":["10 %","10 %"]},{"id":"T-LE-15/16","case":"landing_SL","conditions":"short field แฟลป 30, 62 KIAS ที่ 50 ft, power off, เบรกสุด, 2,450 lb, SL 15 °C","quantity":"ถึงหยุดจาก 50 ft m / ground roll m","expected":[395,168],"tolerance":["10 %","10 %"]},{"id":"T-LE-17","case":"vmax_SL","conditions":"2,450 lb, SL ISA, คันเร่งเต็ม, บินระดับ (มี speed fairing)","quantity":"KTAS","expected":123,"tolerance":3},{"id":"T-LE-18","case":"cruise_8000_80pct","conditions":"2,450 lb, 8,000 ft ISA, 2,400 rpm 80 % (มี speed fairing)","quantity":"KTAS ที่กำลังนี้ (ซิมวันนี้ตรวจว่าคันเร่ง ≤ 1)","expected":122,"tolerance":3}],"u":"-","scope":"aircraft","src":["LE2","LE3","LE0"],"conf":"สูง","est":false,"note":"จุดเป้าจาก POH สำหรับเทสต์อัตโนมัติ (รายละเอียดและผลของซิมวันนี้ใน §10.12); expected ตามลำดับ quantity; tolerance เป็นหน่วยเดียวกับ expected หรือ %; glide ratio เป็นค่าประมาณ (1.5 NM/1,000 ft)"},
   "vtbd_hot_day": {"v":{"to_roll_ft":1095,"to_50_ft":1945,"ldg_roll_ft":590,"ldg_50_ft":1355,"roc_fpm":656,"to_roll_m":334,"to_50_m":593,"ldg_roll_m":180,"ldg_50_m":413,"oat30":{"to_roll_ft":1055,"to_50_ft":1875,"roc_fpm":673}},"u":"ft, fpm, m","scope":"aircraft","src":["LE3","LE0"],"conf":"กลาง","est":true,"note":"interpolate ตาราง POH ที่ PA 0 ft (VTBD 9 ft) OAT 35 °C 2,450 lb ลมสงบ (ค่าประมาณจากการ interpolate); วิ่งขึ้นยาวขึ้น 16 % ROC ลดลง 9 % เทียบ ISA"}
  }
 }
}
```

**propulsion, piston, propeller**

```json
{
 "c172r": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[1.905,0,0],"axis":[1,0,0],"type":"piston","model":"Lycoming IO-360-L2A (160 hp @ 2,400 rpm)","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LE1","LC8","LC0"],"conf":"กลาง","est":true,"note":"ตำแหน่งดุมใบพัดเหมือน c172s (ค่าประมาณ); ใบพัดหมุนตามเข็มเมื่อมองจากห้องนักบิน"},
   "legacy": {"v":{"P":119310,"eta":1.1338,"T0":2933,"idle":0},"u":"W, -, N, -","scope":"aircraft","src":["LM0","LE0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static (le_fit.mjs): T0 = แรงขับสถิต BEM 2933 N ของใบพัด 75×70 ที่ 2,115 rpm แล้ว fit Vc ให้ ROC 720 fpm; idle 0 เพราะ polar จาก glide รวมแรงต้านใบพัดแล้ว"}
  },
  "piston": {
   "identity": {"v":{"model":"IO-360-L2A","kind":"fuel_injected","displacement_L":5.916,"cylinders":4,"tcds":"FAA 1E10 / EASA IM.E.032"},"u":"-","scope":"aircraft","src":["LM21","LE1"],"conf":"สูง","est":false,"note":"เครื่องรุ่นเดียวกับ 172S แต่ TCDS ของเครื่องบินจำกัดรอบ 2,400 rpm = พิกัดหลัก 119 kW ของ IM.E.032"},
   "ratings": {
    "P_rated": {"v":119312,"u":"W","scope":"aircraft","src":["LE1","LE2","LM21"],"conf":"สูง","est":false,"note":"160 BHP @ 2,400 rpm (EASA IM.E.032 พิกัดหลัก 119 kW @ 2,400)"},
    "rpm_rated": {"v":2400,"u":"rpm","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"รอบสูงสุด (tach red line); green arc 1,900–2,400"},
    "P_mcp": {"v":119312,"u":"W","scope":"aircraft","src":["LE2"],"conf":"สูง","est":false,"note":"ไม่มีจำกัดเวลา takeoff"},
    "rpm_redline": {"v":2400,"u":"rpm","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":""}
   },
   "fuel": {"v":{"fuel":"avgas 100LL (100/100LL)","bsfc_g_per_kWh":262,"density_kg_L":0.72},"u":"-, g/kWh, kg/L","scope":"aircraft","src":["LE3","LE0"],"conf":"กลาง","est":false,"note":"BSFC 0.431 lb/(hp h) (ช่วง 0.427–0.439) = GPH × 6.0 lb / (%BHP × 160 hp) เฉลี่ย 34 จุดคอลัมน์ ISA ของ Fig 5-8 แผ่น 1–2 (recommended lean)"}
  },
  "propeller": {
   "identity": {
    "model": {"v":"McCauley 1C235/LFA7570","u":"-","scope":"aircraft","src":["LE1"],"conf":"สูง","est":false,"note":"TCDS 3A12 172R ฐาน; spinner dwg 0550236"},
    "diameter": {"v":1.905,"u":"m","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"75 in (ต่ำสุด 74 in = 1.880 m)"}
   },
   "fixed": {
    "pitch_in": {"v":70,"u":"in","scope":"aircraft","src":["LE1","LC6"],"conf":"กลาง","est":false,"note":"จากรหัส 7570 = 75 in × 70 in (แบบแผนชื่อรุ่นของ McCauley เหมือนที่บัตร c172s ใช้กับ 7660)"},
    "beta75_deg": {"v":21.61,"u":"deg","scope":"aircraft","src":["LE0"],"conf":"กลาง","est":false,"note":"atan(70/(0.75π·75))"},
    "static_rpm_range": {"v":[2065,2165],"u":"rpm","scope":"aircraft","src":["LE1","LE2"],"conf":"สูง","est":false,"note":"คันเร่งเต็ม อยู่กับที่ mixture leaned for max rpm; ไม่มี tolerance เพิ่ม"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":119.31,"u":"kW","scope":"aircraft","src":["LE1"],"conf":"สูง","est":false,"note":"160 hp"}
   },
   "bladeGeometry": {
    "chordOverD": {"v":{"axes":{"x":[0.15,0.25,0.35,0.45,0.6,0.75,0.85,0.93,1]},"data":[0.0596,0.0715,0.0811,0.0859,0.087,0.0811,0.0715,0.0596,0.0382]},"u":"c/D","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบ GA ของ lm_prop × 1.1924 (ปรับให้รอบสถิต 2,115 rpm กลางช่วง TCDS ที่ 160 hp/2,400 rpm)"},
    "twistDesignJ": {"v":0.933,"u":"-","scope":"aircraft","src":["LE0"],"conf":"กลาง","est":false,"note":"pitch เรขาคณิตคงที่ = helical ที่ J = p/D"}
   },
   "tables": {
    "CT": {"v":{"axes":{"J":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1]},"data":[0.146,0.1474,0.1475,0.1427,0.132,0.1178,0.1009,0.0825,0.0628,0.042,0.0204,-0.0021]},"u":"-","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"BEM lm_prop (ค่าประมาณ ใบ 75×70 เชือกใบปรับแล้ว) ที่ 2,100 rpm ISA SL"},
    "CP": {"v":{"axes":{"J":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1]},"data":[0.0759,0.0802,0.0847,0.0877,0.0879,0.0853,0.0797,0.0711,0.0592,0.0438,0.0249,0.0024]},"u":"-","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM lm_prop ชุดเดียวกับ CT; η สูงสุด 0.864 ที่ J ≈ 0.9"}
   },
   "checks": {
    "staticThrustISA": {"v":2.93,"u":"kN","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM 2115 rpm FM 0.565 (659 lbf); ช่วง TCDS 2,065–2,165 rpm ให้ 2912–2953 N"},
    "staticThrustVTBD31C": {"v":2.83,"u":"kN","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM ที่ ISA+20 (35 °C) 2146 rpm"},
    "momentumIdealStaticISA": {"v":4.29,"u":"kN","scope":"aircraft","src":["LE0"],"conf":"กลาง","est":false,"note":"FM = 1 ที่กำลังที่ดูด 142.7 hp, A = π·0.9525²"},
    "peakEfficiency": {"v":0.864,"u":"-","scope":"aircraft","src":["LM0","LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM ที่ J ≈ 0.9"},
    "levelFlight": {"v":{"v123kt_rpm":2434,"v123kt_eta":0.852,"cruise80_8000ft_rpm":2393,"vmax_clean_polar_kt":129.8,"poh_cruise_absorb_ratio":[0.904,0.946]},"u":"rpm, -, kt TAS","scope":"aircraft","src":["LM0","LE0","LE3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตรวจใบพัด BEM: ที่จุด cruise ของ Fig 5-8 (rpm และ KTAS ตาม POH) ใบพัดดูดกำลัง 0.90–0.95 เท่าของ %BHP × 160 hp (8,000 ft 2,400 rpm 122 KTAS: 120 vs 128 hp) และ คันเร่งเต็มบินระดับ SL ที่ 123 KTAS ต้องการรอบเกิน 2,400 rpm เล็กน้อย และ polar สะอาดให้ความเร็วสูงสุด 130 kt (POH 123) แสดงว่า CD0 cruise หรือ η ของ BEM สูง/ต่ำไปราว 5 %"}
   }
  },
  "interference": {
   "slipstream": {
    "diskDiameter": {"v":1.905,"u":"m","scope":"aircraft","src":["LE1"],"conf":"สูง","est":false,"note":"75 in"}
   }
  }
 }
}
```

**gear, wind, validation**

```json
{
 "c172r": {
  "gear": {
   "certification": {
    "part23_limit_descent": {"v":{"formula":"V = 4.4 (W/S)^0.25 fps, 7..10","WS_lb_ft2":14.08,"V_fps":8.52,"V_mps":2.597},"u":"fps","scope":"aircraft","src":["LM3","LE0"],"conf":"กลาง","est":false,"note":"14 CFR 23.473(d) เดิม กับ W/S 14.08 lb/ft² (IM: 14.1)"}
   }
  },
  "wind": {
   "fFactor": {
    "trainerExcessTW": {"v":0.087,"u":"-","scope":"aircraft","src":["LE0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (T − D)/W ที่ approach แฟลป 30 คันเร่งเต็ม (โมเดล legacy ของบัตร)"}
   }
  },
  "validation": {
   "trim_targets": {
    "approach": {"v":{"ias_kt":66,"h_m":300,"gamma_deg":-3},"u":"kt CAS, m, deg","scope":"aircraft","src":["LE2","LE0"],"conf":"กลาง","est":false,"note":"normal approach แฟลป 30 65 KIAS ≈ 65.5 KCAS"}
   },
   "takeoff_test": {"v":{"flap":"10","VR_kt":49,"theta_deg":12},"u":"-, kt CAS, deg","scope":"aircraft","src":["LE3","LE0"],"conf":"กลาง","est":true,"note":"short field: lift-off 51 KIAS ≈ 55.7 KCAS ตามตาราง (ค่าสอบเทียบใช้กับการบินระดับ); VR และ θ ของการทดสอบเลือกตามวิธีของ c172s ปรับตาม √(มวล) (ค่าประมาณ)"}
  }
 }
}
```
