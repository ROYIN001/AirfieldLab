`pc9m` · _meta+airframe

```json
{
 "pc9m": {
  "_na": {"v":["turbofan.*","controls.reference_types.*","validation.typicalModes.*","gear.certification.part25_limit_descent","gear.certification.part25_friction_cap","wind.discreteGust.cfr25_341_Fg","wind.wake.leaders","numerics.contact.*","aero.static_long.table_clean","controls.pitch.derived_check","propeller.betaReverse.betaGroundIdle","propeller.betaReverse.betaReverseMax","propeller.betaReverse.reverseRpmMax","propeller.betaReverse.reverseCTstatic","turboprop.beta_reverse.*","gear.brakes.antiskid_efficiency","gear.brakes.antiskid_efficiency_measured","gear.brakes.antiskid_slip_setpoint","validation.currentModel.approach95","validation.currentModel.cruise155","otherSims.jsbsim.gearSideForcePacejkaDefaults","otherSims.jsbsim.c172xTrimCruise100kcas3000ft","otherSims.jsbsim.c172xTrimApproach65kcas1000ftFlap30","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*","turboprop.reference_engines.PT6A-68","turboprop.reference_engines.PT6A-60A","turboprop.reference_engines.PT6A-52","turboprop.reference_engines.PT6A-68B_C_D_T"],"u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"ไม่ใช้กับแบบนี้: turbofan.* (เครื่องเทอร์โบพร็อป); part25_* และ cfr25_* (ใบรับรอง FAR 23); controls.reference_types/typicalModes/wake.leaders (ค่าอ้างอิงรวมของรอบที่ 1 ไม่ใช่ค่ารายแบบ); numerics.contact.* (ของซิม); table_clean และ pitch.derived_check (ผลคำนวณของเครื่องฝึกรอบที่ 1); betaReverse/beta_reverse และ antiskid (ไม่มีระบบนี้); currentModel.approach95/cruise155 (เงื่อนไขของรอบที่ 1; ใช้ validation.currentModel.approach/cruise แทน); otherSims.* (หัวข้อ 03 เป็นเจ้าของ ส่วนที่เหลือเป็นค่าของ C172/โมเดลอื่น); reference_engines ของเครื่องยนต์ที่แบบนี้ไม่ใช้"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Pilatus Aircraft Ltd","model":"PC-9 M","variant":"PC-9(M)","engine":"P&WC PT6A-62 flat rated 950 shp (708 kW)","propeller":"Hartzell HC-D4N-2A/-2F + 4× D9512A(K), 2.44 m","seats":2,"category":"acrobatic/utility (FAR 23)","tc_ref":"FOCA TCDS F 56-32 Issue 4 (2008)"},"u":"-","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
   "weights": {
    "MTOW": {"v":2350,"u":"kg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"acrobatic; utility (มี underwing stores) 3,200 kg"},
    "MLW": {"v":2350,"u":"kg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"acrobatic; utility 3,100 kg"},
    "MRW": {"v":2360,"u":"kg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"acrobatic; utility 3,210 kg"},
    "MZFW": {"v":2000,"u":"kg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "BEW_typical": {"v":1725,"u":"kg","scope":"aircraft","src":["LP13"],"conf":"กลาง","est":false,"note":"น้ำหนักเปล่า 1,725 kg (Jane's ผ่าน Wikipedia)"},
    "max_fuel_usable": {"v":417.5,"u":"kg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"518 L × 0.806 kg/L (ถังในปีก)"},
    "useful_load": {"v":625,"u":"kg","scope":"aircraft","src":["LP27","LP2"],"conf":"กลาง","est":false,"note":"MTOW − BEW"},
    "training_mass": {"v":{"kg":2123.8,"BEW":1725,"crew":190,"fuel":208.8},"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEW + ครูและศิษย์ 2 × 95 kg (รวมร่มชูชีพและอุปกรณ์) + เชื้อเพลิงครึ่งถัง; การเทียบ TCDS/POH ใช้ --mass 2350"}
   },
   "cg": {
    "datum": {"v":"3,000 mm หน้า firewall","u":"-","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "MAC": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "LEMAC": {"v":3.8725,"u":"m DAT","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"3,872.5 mm"},
    "envelope": {"v":[[2250,4.2355,4.3675],[2350,4.285,4.3675]],"u":"kg, m DAT","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"acrobatic: ≤2,250 kg 22–30 %MAC, 2,350 kg 25–30 %MAC (gear up/down); utility ≤2,350 kg 22–30, 3,200 kg 23–28 %MAC"},
    "ref": {"v":{"x":4.285,"pct_mac":25},"u":"m DAT","scope":"aircraft","src":["LP27","LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG อ้างอิงของ FRD และ inertia = 25 %MAC (กลางช่วง envelope)"}
   },
   "inertia": {
    "ref_mass": {"v":2350,"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: inertia ข้างล่างคิดที่ MTOW; buildAC สเกลตามมวลด้วยรัศมีไจเรชันคงที่"},
    "Ixx": {"v":4156,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii คลาส trainer_turboprop Rx 0.261 (01-methods §01.4); ตรวจไขว้ด้วย component build-up ของ PC-9 M ได้ 3575 ที่ MTOW เชื้อเพลิงเต็ม"},
    "Iyy": {"v":6901,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ry 0.338; build-up 8745"},
    "Izz": {"v":9713,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Rz 0.4; build-up 12178"},
    "Ixz": {"v":0,"u":"kg m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล; แกนลำตัวของเครื่องปีกต่ำ Ixz เล็ก"},
    "radii": {"v":{"Rx":0.261,"Ry":0.338,"Rz":0.4},"u":"-","scope":"aircraft","src":["LM15"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าเฉลี่ยคลาส trainer_turboprop จาก JSBSim pc7 และ t6texan2 (n = 2, leave-one-out ผิด 42–91 %)"},
    "method": {"v":"Roskam radii (class trainer_turboprop) + ตรวจด้วย component build-up","u":"-","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความไม่แน่นอน ±30 % ต่อแกน"}
   },
   "wing": {
    "S": {"v":16.29,"u":"m2","scope":"aircraft","src":["LP13","LP10"],"conf":"กลาง","est":false,"note":"16.29 m² (175.3 ft²); แผ่นแบบของ Pilatus ให้ 16.28 m²"},
    "b": {"v":10.19,"u":"m","scope":"aircraft","src":["LP10"],"conf":"กลาง","est":false,"note":"33 ft 5 in จากแผ่นแบบของ Pilatus; Wikipedia ให้ 10.125 m (33 ft 3 in) ขัดกัน"},
    "MAC": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "AR": {"v":6.374,"u":"-","scope":"aircraft","src":["LP27"],"conf":"กลาง","est":false,"note":"b²/S"},
    "taper": {"v":0.526,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แก้จาก S, b, MAC ของปีกสี่เหลี่ยมคางหมู: c_root 2.09 m, c_tip 1.1 m"},
    "sweep_c4_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีกตรง ไม่มีข้อมูลตัวเลข"},
    "dihedral_deg": {"v":6,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่พบตัวเลขสาธารณะ; เลือกให้ Clβ ใกล้ค่าคลาส (ความเชื่อมั่นต่ำ)"},
    "incidence_deg": {"v":1,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"},
    "twist_deg": {"v":-3,"u":"deg","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: washout เท่ารอบที่ 1"},
    "airfoil": {"v":{"root":"PIL15M825","tip":"PIL12M850"},"u":"-","scope":"aircraft","src":["LP24"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รายการระบุของ T-6 ซึ่งใช้ปีกตระกูล PC-9; ยังไม่ได้ยืนยันกับ PC-9 M"},
    "position": {"v":"low","u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"ปีกต่ำ"},
    "x_c4_root": {"v":4.285,"u":"m DAT","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 ของ MAC (ใช้แทนโคนปีกใน lm_derivs)"}
   },
   "tail": {
    "S_h": {"v":3,"u":"m2","scope":"aircraft","src":["LP10","LP11","LP25","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จากช่วงหางระดับ 3.66 m กับ AR_h 4.5; JSBSim pc7 (Aeromatic) ให้ 2.82 m²; รอบที่ 1 ถอยได้ 2.96 m²"},
    "b_h": {"v":3.66,"u":"m","scope":"aircraft","src":["LP10","LP11"],"conf":"กลาง","est":false,"note":"12 ft 2 in จากแผ่นแบบ 1:25 ของ Pilatus (ป้ายอ่านจาก PC-7 MKX ซึ่งใช้โครงตระกูลเดียวกัน)"},
    "l_h": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 MAC ปีก (4.29 m DAT) ถึง c/4 MAC หางระดับ (~9.2 m DAT) ประมาณจากความยาวลำ 10.14 m"},
    "S_v": {"v":2,"u":"m2","scope":"aircraft","src":["LP25","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รวม rudder ไม่รวม dorsal/ventral fin; JSBSim pc7 1.66 m²; รอบที่ 1 2.06 m²"},
    "b_v": {"v":1.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความสูงครีบจากความสูงเครื่อง 3.26 m"},
    "l_v": {"v":4.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แขนโมเมนต์หางดิ่ง"},
    "z_v": {"v":0.8,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระยะ c/4 MAC หางดิ่งเหนือแกนลำตัว"},
    "airfoil_h": {"v":"ไม่ทราบ (สมมาตร)","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแหล่งสาธารณะ"},
    "airfoil_v": {"v":"ไม่ทราบ (สมมาตร)","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแหล่งสาธารณะ"},
    "incidence_h_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"}
   },
   "surfaces": {
    "elevator": {"v":{"area_m2":1.1,"chord_ratio":0.4,"span_fraction":1},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "aileron": {"v":{"area_m2":0.65,"chord_ratio":0.25,"span_fraction":[0.55,0.97]},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ต่อข้าง; span_fraction เป็นสัดส่วนครึ่งช่วงปีก"},
    "rudder": {"v":{"area_m2":0.85,"chord_ratio":0.4,"span_fraction":1},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "flap": {"v":{"kind":"split (ไม่ยืนยัน)","chord_ratio":0.25,"span_fraction":[0.12,0.55]},"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแบบสาธารณะ"},
    "trim_tab": {"v":{"elevator_tab":true,"rudder_trim_tab":true,"rudder_anti_flettner":true,"aileron_fixed_tab":true},"u":"-","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""}
   },
   "geometry": {
    "length": {"v":10.14,"u":"m","scope":"aircraft","src":["LP13"],"conf":"กลาง","est":false,"note":"33 ft 3 in"},
    "span": {"v":10.19,"u":"m","scope":"aircraft","src":["LP10"],"conf":"กลาง","est":false,"note":""},
    "height": {"v":3.26,"u":"m","scope":"aircraft","src":["LP10","LP13"],"conf":"กลาง","est":false,"note":"10 ft 8 in"},
    "wheelbase": {"v":2.31,"u":"m","scope":"aircraft","src":["LP10","LP9"],"conf":"กลาง","est":false,"note":"7 ft 7 in (ตัวเลขในแผ่นแบบไม่มีป้าย จับคู่กับ TCDS ของ T-6)"},
    "main_track": {"v":2.54,"u":"m","scope":"aircraft","src":["LP10","LP9"],"conf":"กลาง","est":false,"note":"8 ft 4 in"},
    "fuselage_width": {"v":0.97,"u":"m","scope":"aircraft","src":["LP10","LP11"],"conf":"กลาง","est":false,"note":"3 ft 2 in"},
    "fuselage_height": {"v":1.5,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รวมหลังคาครอบห้องนักบิน"},
    "prop_clearance": {"v":0.25,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"},
    "eye_pos_FRD": {"v":[0.224,0,-0.95],"u":"m FRD","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ที่นั่งหน้า  4,061 mm DAT; ที่นั่งเรียงหน้า-หลัง y = 0; ตาสูงกว่า CG 0.95 m"},
    "eye_height_static": {"v":2.2,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG สูง 1.25 m + 0.95 m"}
   }
  }
 }
}
```

`pc9m` · aero

```json
{
 "pc9m": {
  "aero": {
   "ref": {
    "S": {"v":16.29,"u":"m2","scope":"aircraft","src":["LP13"],"conf":"กลาง","est":false,"note":""},
    "b": {"v":10.19,"u":"m","scope":"aircraft","src":["LP10"],"conf":"กลาง","est":false,"note":""},
    "c": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"MAC"}
   },
   "derivatives": {
    "CLq": {"v":{"cruise":6.2987,"approach":6.1496},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CLadot": {"v":{"cruise":1.6805,"approach":1.6001},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CLde": {"v":{"cruise":0.428,"approach":0.4185},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYb": {"v":{"cruise":-0.6344,"approach":-0.6294},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYdr": {"v":{"cruise":0.1974,"approach":0.1948},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYr": {"v":{"cruise":0.359,"approach":0.3561},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clb": {"v":{"cruise":-0.0668,"approach":-0.0545},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clp": {"v":{"cruise":-0.4799,"approach":-0.4885},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clr": {"v":{"cruise":0.0857,"approach":0.2032},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Clda": {"v":{"cruise":0.2267,"approach":0.2307},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cldr": {"v":{"cruise":0.0155,"approach":0.0153},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmq": {"v":{"cruise":-13.0642,"approach":-12.7736},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmadot": {"v":{"cruise":-4.9905,"approach":-4.7518},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmde": {"v":{"cruise":-1.271,"approach":-1.2427},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cnb": {"v":{"cruise":0.1027,"approach":0.0959},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnp": {"v":{"cruise":-0.0243,"approach":-0.1877},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnr": {"v":{"cruise":-0.175,"approach":-0.1836},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnda": {"v":{"cruise":-0.0113,"approach":-0.011},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cndr": {"v":{"cruise":-0.091,"approach":-0.0899},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 95 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CD0": {"v":{"clean":0.02864},"u":"-","scope":"aircraft","src":["LP27","LP16","LP19","LP20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar พาราโบลา (รอบ CL 0) จากการร่อน T-6: 125 KIAS ที่ ~6,000 lb, sink 1,100–1,350 fpm ⇒ L/D 11.3 (ช่วง 9.8–13.18); รวมแรงต้านใบพัด feather; ค่า clean ไม่รวมใบพัดจากความเร็วสูงสุด ≈ 0.02154–0.02547"},
    "K": {"v":{"clean":0.06836},"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: e = 0.73; lm_derivs ให้ e 0.858 (ไม่รวมใบพัด)"}
   },
   "static_long": {
    "CL0": {"v":{"UP":0.25,"TO":0.55,"LDG":0.8},"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CL ที่ α 0 (แกนลำตัว) ปีก PIL15 โค้ง α0L ≈ −2° กับ incidence 1°; แฟลปตาม aero.flaps.detents"},
    "CLalpha": {"v":4.987,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs ทั้งลำ (ปีก 4.6, หาง 4.06, dε/dα 0.42); รอบที่ 1 = 4.8"},
    "Cm0": {"v":{"UP":0.045,"TO":-0.005,"LDG":-0.055},"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1 (CG 25 %MAC); ไม่มีข้อมูล trim สาธารณะ"},
    "Cmalpha": {"v":-0.761,"u":"1/rad","scope":"aircraft","src":["LM10","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG 25 %MAC, h_n 0.403, static margin 0.153; รอบที่ 1 = −0.72"},
    "CLmax_target": {"v":{"UP":1.3984,"LDG":1.7414},"u":"-","scope":"aircraft","src":["LP2","LM1","LP27"],"conf":"กลาง","est":false,"note":"จาก TCDS 77/69 KCAS ที่ 2,350 kg (ความเร็วต่ำสุด, nz 0.95 ⇒ CL ปรากฏ 1.472/1.8331); PC-9 รุ่นแรก 79/70 kt EAS ที่ 2,250 kg ให้ 1.2719/1.62"},
    "alpha_star_neg": {"v":{"UP":13,"LDG":9},"u":"deg","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "a1": {"v":22,"u":"1/rad","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CL_sep_at_alpha_star": {"v":{"clean":0.95,"landing":1.1},"u":"-","scope":"aircraft","src":["R1:A9","R1:A10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CDmax_90": {"v":1.4,"u":"-","scope":"aircraft","src":["R1:A9","R1:A10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR เท่ากัน (6.38)"},
    "dCD_sep": {"v":0.2,"u":"-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CmX": {"v":-0.12,"u":"-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "alpha_star": {"v":{"clean":17.57,"landing":15.74},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โค้ดปัจจุบัน: ศูนย์กลาง blending (aStall, aStall + aStallFlap) ที่ legacy fit แก้ไว้ ใช้แทน α* ของรอบที่ 1 (ยังไม่ได้ปรับจุด X0 ของโมเดล Viterna)"},
    "alpha_CLmax": {"v":{"clean":14.78,"landing":12.68},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ที่ CL ของซิม (trim, นอก ground effect) สูงสุด; CLmax 1.398/1.741"}
   },
   "flaps": {
    "detents": {"v":[{"name":"UP","flap_deg":0,"VFE_kt":null,"dCL0":0,"dCD0":0,"dCm0":0,"CLmax":1.3984},{"name":"TO","flap_deg":23,"VFE_kt":150,"dCL0":0.3,"dCD0":0.02,"dCm0":-0.05,"CLmax":1.5999},{"name":"LDG","flap_deg":50,"VFE_kt":150,"dCL0":0.55,"dCD0":0.06,"dCm0":-0.1,"CLmax":1.7414}],"u":"-","scope":"aircraft","src":["LP2","LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: มุมแฟลป 23°/50° และ VFE 150 kt จาก TCDS; CLmax ของ UP/LDG จากความเร็ว stall ของ PC-9 M; dCL0/dCD0/dCm0 และ CLmax ของ TO เป็นค่าประมาณ (dCL0 ของ LDG เท่ารอบที่ 1 = 0.55)"},
    "transition_time_s": {"v":6,"u":"s","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล; เท่าเวลาล้อ 6 s ของ T-6 [LP21]"}
   },
   "gear_drag": {
    "dCD0": {"v":0.02,"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1; ไม่มีข้อมูลรายแบบ"}
   },
   "elevator_fade": {
    "alpha_t_star": {"v":22,"u":"deg","scope":"aircraft","src":["R1:A15"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "a_t": {"v":10,"u":"1/rad","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "floor": {"v":0.35,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "separation_dynamics": {
    "tau1": {"v":0.4,"u":"s","scope":"aircraft","src":["R1:A11","R1:A12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); คอร์ดเท่ากัน 1.65 m"},
    "tau2": {"v":0.2,"u":"s","scope":"aircraft","src":["R1:A11","R1:A12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); คอร์ดเท่ากัน 1.65 m"}
   },
   "large_beta": {
    "CY_crossflow": {"v":0.45,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "strip_wing": {
    "kp_roll": {"v":0.661,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "taper": {"v":0.526,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.wing.taper"},
    "dihedral_eff": {"v":6,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.wing.dihedral_deg"},
    "washout": {"v":3,"u":"deg","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "tau_aileron": {"v":0.26,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1 (ปรับใหม่เมื่อ Clda ของบัตรนี้ถูกใช้)"},
    "aileron_span_frac": {"v":[0.55,0.97],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแบบสาธารณะ"}
   },
   "buffet": {
    "vertical_filter": {"v":{"w0":75.92,"Q":8.28},"u":"rad/s,-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "lateral_filter": {"v":{"w0":[36.43,64.71],"Q":[4.19,11.99],"gain_ratio":[2,1]},"u":"rad/s,-,-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rms_full": {"v":{"az":0.05,"ay":0.016},"u":"g","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "onset_margin_kt": {"v":3,"u":"kt","scope":"aircraft","src":["LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าของ T-6"}
   },
   "stall_warning": {
    "min_margin": {"v":5,"u":"kt","scope":"aircraft","src":["R1:A22"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 14 CFR 23.207(c) ก่อน amdt 23-64"},
    "alpha_warn_5kt": {"v":{"clean":11.34,"landing":8.261},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ของ CL เชิงเส้นที่ VS + 5 kt (1 g, ISA SL, MTOW); วิธีเดียวกับ 06-da42"},
    "alpha_warn_design": {"v":{"clean":10.68,"landing":7.375},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: margin 7 kt เผื่อ gust (ตามรอบที่ 1)"}
   },
   "spin_reference": {
    "alpha_spin": {"v":[35,50],"u":"deg","scope":"aircraft","src":["LP27","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T-6: AOA ≥ 18 units ระหว่าง spin (หน่วย AOA ไม่ใช่องศา); ช่วงองศาประมาณจากเครื่องปีกต่ำของ NASA ที่ปรับลงเพราะ spin ของ T-6 ชัน (ความเร็ว 120–135 KIAS)"},
    "turn_rate": {"v":[120,180],"u":"deg/s","scope":"aircraft","src":["LP19","LP20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าของ T-6 (2–3 s ต่อรอบ [LP19]) เป็นค่าคลาส เพราะไม่มีข้อมูล spin สาธารณะของ PC-9 M"},
    "omega_hat": {"v":[0.122,0.206],"u":"-","scope":"aircraft","src":["LP27","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ω b/(2V) ที่ 15,000 ft, 120–135 KIAS, 2–3 s ต่อรอบ"},
    "descent_trainer": {"v":[8000,15000],"u":"fpm","scope":"aircraft","src":["LP19","LP20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าของ T-6 เป็นค่าคลาส; 400–500 ft ต่อรอบ ที่ 2–3 s ต่อรอบ (400 ft/3 s ถึง 500 ft/2 s)"},
    "IYMP": {"v":-0.0113,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Ixx − Iyy)/(m b²) จาก inertia ประมาณ"},
    "recovery_turns_max": {"v":1.5,"u":"turn","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"กลาง","est":false,"note":"FAR 23.221 (acrobatic): กู้ได้ภายใน 1.5 รอบ"}
   },
   "legacy": {"v":{"CD0":0.03529,"K":0.08895,"CL0":0.25,"CLa":4.987,"CLflap":0.55,"CDflap":0.06,"CDgear":0.02,"Cm0":0.045,"Cma":-0.761,"Cmflap":-0.1,"aStall":17.57,"aStallFlap":-1.83},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM1","LM0","LP27","LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static ที่ MTOW: polar ของซิม CD = CD0 + K(CL − 0.15)² จากการร่อน (L/D 11.3 ที่ 116.1 kt); aStall/aStallFlap แก้ให้ CLmax 1 g ตรง CLmax_target; ค่าอื่นจาก aero.static_long/flaps; polar from glide 116.1 KCAS E 11.3: CD0s 0.0353 Ks 0.0889; idle 0 (POH glide is at idle, windmilling); climb fit (static): target Vy 125.0 KCAS ROC 4090 fpm → T0 12014 N, Vc 78.8 m/s; WARNING eta 1.34 > 0.95: P too low for the sim's thrust law at this ROC"}
  }
 }
}
```

`pc9m` · interference

```json
{
 "pc9m": {
  "interference": {
   "downwash": {
    "deda": {"v":0.42,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: DATCOM ผ่าน lm_derivs"},
    "eps0": {"v":0,"u":"rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "l_t": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.l_h"},
    "VH": {"v":0.547,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: S_h l_t/(S c)"},
    "a_t": {"v":4.06,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หางระดับ AR 4.5"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:U11","R1:U17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "CLadot": {"v":1.68,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "Cmadot": {"v":-4.99,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"}
   },
   "groundEffect": {
    "rMac": {"v":[0,2.28,0.3],"u":"m FRD (y ใช้ ±)","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 ของ MAC เทียบ CG อ้างอิง; ปีกต่ำ z +0.3 m"},
    "CLa_w": {"v":4.6,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "A": {"v":6.374,"u":"-","scope":"aircraft","src":["LP27"],"conf":"กลาง","est":false,"note":"b²/S"},
    "rEps": {"v":{"a":3.99,"m":0.652},"u":"-","scope":"aircraft","src":["R1:U7","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR 6.37 เท่ารอบที่ 1 (6.38)"},
    "tablesCheck": {"v":{"axes":{"hb":[0.05,0.1,0.15,0.2,0.3,0.5,1]},"data":[[0.345,0.513,0.626,0.707,0.813,0.916,0.985],[1.168,1.12,1.089,1.069,1.043,1.019,1.003],[0.432,0.589,0.686,0.753,0.838,0.921,0.982]]},"u":"-","scope":"aircraft","src":["R1:U7","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR เท่ากัน"}
   },
   "slipstream": {
    "diskDiameter": {"v":2.438,"u":"m","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"95–96 in"},
    "hubRadius": {"v":0.25,"u":"m","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "hubPos": {"v":[3.83,0,-0.05],"u":"m FRD","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระนาบใบพัดสมมติที่ 0.45 m DAT (datum อยู่ใกล้ปลาย spinner)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LP5"],"conf":"กลาง","est":false,"note":"หมุนตามเข็มนาฬิกาเมื่อมองจากด้านเครื่องยนต์ (จากด้านหลัง)"},
    "kappa": {"v":0.43,"u":"-","scope":"aircraft","src":["R1:U11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "immersionH": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,1,1.1,1.22]},"data":[0,0.175,0.327,0.397,0.464,0.529,0.591,0.663]},"u":"-","scope":"aircraft","src":["R1:U1","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "immersionV": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,1,1.1,1.22]},"data":[0.015,0.161,0.298,0.364,0.427,0.489,0.548,0.616]},"u":"-","scope":"aircraft","src":["R1:U1","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kSwirl": {"v":0.5,"u":"-","scope":"aircraft","src":["R1:U14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "zSwirl": {"v":0.55,"u":"m","scope":"aircraft","src":["R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "finLiftSlope": {"v":2.8,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "eta_v": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "blownSpanFactor": {"v":0.9,"u":"D","scope":"aircraft","src":["R1:U10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kBlown": {"v":0.5,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "k_deda_power": {"v":0,"u":"-","scope":"aircraft","src":["R1:U11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "finArea": {"v":2,"u":"m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.S_v"},
    "finArm": {"v":4.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.l_v"},
    "blownArea": {"v":2.56,"u":"m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (0.9 D − ความกว้างลำตัว) × คอร์ดโคน"}
   }
  }
 }
}
```

`pc9m` · speeds+performance

```json
{
 "pc9m": {
  "speeds": {
   "VS1_kt": {"v":77,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"2,350 kg acrobatic, แฟลปขึ้น; utility 3,200 kg 93 KCAS; PC-9 (EAS) 79 kt ที่ 2,250 kg"},
   "VS0_kt": {"v":69,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"แฟลปลง (ล้อลง); utility 85 KCAS; PC-9 70 kt EAS"},
   "VA_kt": {"v":205,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"ที่ 2,350 kg; 170 kt ที่ 1,650 kg (TCDS ไม่ระบุชนิดความเร็ว; PC-9 TCDS ใช้ EAS)"},
   "VNE_kt": {"v":320,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"VMO ถึง 15,000 ft; MMO 0.65"},
   "VFE": {"v":{"TO":150,"LDG":150},"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"VFE = VLO 150 kt"},
   "VLO_kt": {"v":150,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":""},
   "VLE_kt": {"v":150,"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: TCDS ไม่ระบุ VLE; ใช้ VLO"},
   "VREF_kt": {"v":90,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 89.7 kt"},
   "VAPP_kt": {"v":95,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: VREF + 5"},
   "VR_kt": {"v":78,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีค่าสาธารณะ; ≈ 1.05 × VS แฟลป TO (ประมาณ 74 kt)"},
   "VY_kt": {"v":125,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีค่าสาธารณะ; 140 KIAS ของ T-6 สเกล √(W/S)"},
   "VG_kt": {"v":116.1,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จาก polar คลาส (CL* 0.647) ที่ 2,350 kg"},
   "stall_table": {"v":{"acrobatic_2350kg":{"UP":77,"LDG":69},"utility_3200kg":{"UP":93,"LDG":85}},"u":"kt CAS","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"PC-9 (F 56-22): 2,250 kg 79/70 kt EAS; PC-9/B 2,500 kg 83/74 kt"},
   "stall_warning_margin_kt": {"v":5,"u":"kt","scope":"aircraft","src":["R1:A22"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 14 CFR 23.207 (เท่ารอบที่ 1)"},
   "icao_approach_category": {"v":"A","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 89.7 kt (< 91 kt)"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":4090,"u":"fpm","scope":"aircraft","src":["LP12","LP13"],"conf":"ต่ำ","est":false,"note":"best ROC ที่ระดับน้ำทะเล (โบรชัวร์/Jane's ไม่ระบุน้ำหนัก; ฟิสิกส์บอกว่าน่าจะเป็นน้ำหนักฝึกเบา ≈ 2,000–2,100 kg)"},
   "service_ceiling_ft": {"v":25000,"u":"ft","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"ความสูงปฏิบัติการสูงสุด (Jane's ผ่าน Wikipedia ให้เพดาน 37,990 ft)"},
   "cruise_table": {"v":[{"h_ft":2000,"ktas":276,"power":"max"},{"h_ft":20000,"ktas":301,"power":"max"}],"u":"ft, kt TAS","scope":"aircraft","src":["LP12"],"conf":"ต่ำ","est":false,"note":"max level speed ISA (ข้อความโบรชัวร์ที่เผยแพร่ซ้ำ)"},
   "glide": {"v":{"speed_kt":116.1,"ratio":11.3},"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ polar ของ T-6 (ปีกตระกูลเดียวกัน) ที่ 2,350 kg; ไม่มีค่าสาธารณะของ PC-9 M"},
   "fuel": {"v":{"usable_L":518,"usable_kg":417.5,"endurance_h":{"2000ft_120KIAS":2.45,"25000ft_120KIAS":4}},"u":"L, kg, h","scope":"aircraft","src":["LP2","LP12"],"conf":"กลาง","est":false,"note":"endurance รวมสำรอง 100 nm"}
  }
 }
}
```

`pc9m` · propulsion+turboprop+propeller

```json
{
 "pc9m": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[3.83,0,-0.05],"axis":[1,0,0],"type":"turboprop","model":"PT6A-62","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LP2","LP27"],"conf":"กลาง","est":false,"note":"ตำแหน่งดุมเป็นค่าประมาณ"},
   "legacy": {"v":{"P":708000,"eta":1.337,"T0":12014,"idle":0},"u":"W, -, N, -","scope":"engine","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T0 จากทฤษฎีโมเมนตัม FM 0.55 (lm_card); eta = Vc·T0/P ฟิตให้ ROC ของซิมที่ MTOW = 4090 fpm ที่ VY 125 kt; idle 0 เพราะ polar มาจากการร่อนแรงขับศูนย์; WARNING eta > 0.95"}
  },
  "turboprop": {
   "ratings": {
    "P_rated": {"v":708000,"u":"W","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"950 shp flat rated (thermodynamic 1,150 shp [LP12])"},
    "T_flat_C": {"v":37,"u":"degC","scope":"engine","src":["R1:E1"],"conf":"กลาง","est":false,"note":"PT6A-62 flat rated ถึง 37 °C"},
    "rating_basis": {"v":{"pressure_Pa":101325,"static":true,"bleed":0,"accessory_load":0},"u":"-","scope":"engine","src":["R1:E1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "install_loss_frac": {"v":0,"u":"-","scope":"aircraft","src":["R1:E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Np_max_rpm": {"v":2000,"u":"rpm","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "Np_transient_rpm": {"v":2205,"u":"rpm","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"20 s"},
    "Q_lim": {"v":3383,"u":"N m","scope":"engine","src":["LP3","LP2"],"conf":"สูง","est":false,"note":"2,495 lb ft (67.4 psi) ที่ 2,000 rpm = 950 shp"},
    "Ng_100pct_rpm": {"v":37468,"u":"rpm","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "Ng_max_pct": {"v":104,"u":"%","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "ITT_max_C": {"v":800,"u":"degC","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"max cruise 775 °C; transient 870 °C 20 s"},
    "ITT_start_C": {"v":1000,"u":"degC","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"5 s"},
    "takeoff_time_limit_s": {"v":"ไม่จำกัด (take-off = max continuous)","u":"s","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":""}
   },
   "steady_map": {
    "Ng_GI_pct": {"v":56,"u":"%","scope":"engine","src":["LP3"],"conf":"สูง","est":false,"note":"idle ต่ำสุด 56 % N1 (PC-9 TCDS)"},
    "Ng_FI_pct": {"v":68,"u":"%","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "Ng0_pct": {"v":52,"u":"%","scope":"engine","src":["R1:E8","R1:E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kMap": {"v":2.7,"u":"-","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Pc_frac_vs_Ngc": {"v":{"axes":{"Ngc_pct":[52,60,68,76,84,90,95,100,104]},"data":[0,0.008,0.051,0.154,0.335,0.532,0.743,1,1.241]},"u":"-","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "nITT": {"v":3,"u":"-","scope":"engine","src":["R1:E1","R1:E3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ITTc_vs_Pc": {"v":{"axes":{"Pc_frac":[0,0.05,0.25,0.5,0.75,0.964,1]},"data":[665,682,751,837,923,997,1009]},"u":"K (corrected, ITT_K/theta2)","scope":"engine","src":["R1:E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "dynamics": {
    "tauAcc_s": {"v":0.6,"u":"s","scope":"engine","src":["R1:E4","R1:E6","R1:E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rAcc_pct_s": {"v":10,"u":"%Ng/s","scope":"engine","src":["R1:E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tauDec_s": {"v":0.8,"u":"s","scope":"engine","src":["R1:E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rDec_pct_s": {"v":12,"u":"%Ng/s","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tauITT_s": {"v":1.5,"u":"s","scope":"engine","src":["R1:E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kITTacc": {"v":4,"u":"K per (%Ng/s)","scope":"engine","src":["R1:E7","R1:E10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "cert_accel_FI_to_95pct_max_s": {"v":5,"u":"s","scope":"engine","src":["R1:E4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); 14 CFR 33.73 ใช้กับเครื่องยนต์ทุกแบบ"}
   },
   "airframe_coupling": {
    "I_gg": {"v":0.12,"u":"kg m2","scope":"engine","src":["R1:E11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gg_rotation_rel_prop": {"v":-1,"u":"-","scope":"engine","src":["R1:E6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "spin": {"v":1,"u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"ใบพัดหมุนตามเข็มจากด้านหลัง ⇒ แรงบิดปฏิกิริยาม้วนซ้าย สอดคล้องกับ roll-off ซ้ายที่ torque > 60 % ของ T-6 [LP19]"},
    "thrust_axis_body": {"v":[1,0,0],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"}
   },
   "fuel": {
    "psfc": {"v":0.669,"u":"lb/(hp h)","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ตัวยึดตำแหน่ง; T-6 อัตราการไหลสูงสุด 799 PPH [LP18]"}
   },
   "derived_vtbd": {
    "P_avail_vs_OAT_SL": {"v":{"axes":{"OAT_C":[15,25,31,34,37,38,40,45]},"data":[708,708,708,708,708,698,679,632]},"u":"kW","scope":"engine","src":["R1:E1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: flat rating ถึง 37 °C แล้วลด 1.35 %/°C (ความชันเดียวกับตารางรอบที่ 1)"},
    "P_avail_static_grid": {"v":{"axes":{"alt_ft":[0,2500,5000,7500,10000,15000,20000],"isa_dev_C":[0,10,20,25]},"data":[[708,708,708,691],[708,708,683,656],[708,698,647,622],[707,658,611,589],[665,619,577,555],[584,545,508,491],[508,475,444,429]]},"u":"kW","scope":"engine","src":["R1:E1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตารางรอบที่ 1 × 708/700"}
   },
   "reference_engines": {
    "PT6A-62": {"v":{"P_kW":708,"flat_C":37,"ITT_C":800,"Np_rpm":2000,"Np_trans_rpm":2205,"Ng_max_rpm":39000,"PT_rpm_at_2000":30145,"dry_kg":206},"u":"mixed","scope":"engine","src":["R1:E1","R1:E2"],"conf":"สูง","est":false,"note":"EASA TCDS IM.E.078; เครื่องยนต์ของ PC-9 M"}
   }
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed_feathering","u":"-","scope":"propeller","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "model": {"v":"Hartzell HC-D4N-2A หรือ -2F / D9512A(K)","u":"-","scope":"propeller","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":4,"u":"-","scope":"propeller","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":2.438,"u":"m","scope":"propeller","src":["LP2"],"conf":"สูง","est":false,"note":"สูงสุด 96 in ต่ำสุด 95 in"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LP2","R1:params-trainer.json"],"conf":"กลาง","est":false,"note":"PT6A ใบพัดหมุนตามเข็มเมื่อมองจากด้านหลัง (ตามรอบที่ 1)"},
    "massComplete": {"v":68.9,"u":"kg","scope":"propeller","src":["R1:P3"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ใบพัดรุ่นเดียวกัน HC-D4N/D9512"},
    "hubPosition": {"v":[3.83,0,-0.05],"u":"m FRD","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า interference.slipstream.hubPos"},
    "thrustAxis": {"v":[1,0,0],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล right/down thrust"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":708,"u":"kW","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"950 shp take-off = max continuous"},
    "rpmGoverned": {"v":2000,"u":"rpm","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "rpmTransientLimit": {"v":2205,"u":"rpm","scope":"engine","src":["LP2"],"conf":"สูง","est":false,"note":"20 s"},
    "gearRatio": {"v":15.07,"u":"-","scope":"engine","src":["R1:P4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); PT6A-62 รุ่นเดียวกัน"},
    "flightIdleShaftPower": {"v":20,"u":"kW","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "bladeGeometry": {
    "hubRadiusRatio": {"v":0.18,"u":"r/R","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "chordOverD": {"v":{"axes":{"x":[0.18,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.92,0.97,1]},"data":[0.058,0.064,0.07,0.073,0.074,0.073,0.071,0.066,0.06,0.052,0.04]},"u":"c/D","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "twistDesignJ": {"v":1.1,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "activityFactor": {"v":100,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"}
   },
   "section": {
    "liftSlope": {"v":5.78,"u":"1/rad","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "alpha0": {"v":-3,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "alphaStallPos": {"v":14,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "alphaStallNeg": {"v":-11,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "stallBlendM": {"v":10,"u":"1/rad","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "cd0": {"v":0.0085,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "kcd": {"v":0.01,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "Mdd": {"v":0.8,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "stallDelayFactor": {"v":3,"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"}
   },
   "tables": {
    "CT": {"v":{"axes":{"J":[0,0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8,2,2.2,2.4],"beta75_deg":[10,15,20,25,30,35,40,45,50,55,60]},"data":[[0.1312,0.1855,0.229,0.2538,0.2528,0.2271,0.1868,0.1487,0.1311,0.1165,0.1011],[0.0954,0.1557,0.2104,0.25,0.2645,0.2507,0.2177,0.1709,0.1434,0.1276,0.1123],[0.0473,0.1117,0.1753,0.2296,0.2664,0.2782,0.2506,0.2058,0.1574,0.1364,0.1203],[-0.0125,0.0551,0.1272,0.1937,0.2476,0.2797,0.2831,0.2563,0.191,0.1471,0.1275],[-0.0805,-0.0111,0.0664,0.1449,0.2137,0.2664,0.2926,0.2871,0.2645,0.1706,0.1376],[-0.1521,-0.0829,-0.0028,0.0835,0.167,0.2373,0.2871,0.3051,0.2902,0.263,0.1538],[-0.2218,-0.1567,-0.0764,0.0139,0.1086,0.1952,0.2654,0.3096,0.3164,0.2915,0.2606],[-0.2872,-0.2292,-0.1521,-0.06,0.0405,0.1428,0.2305,0.2978,0.3323,0.3245,0.29],[-0.3506,-0.2984,-0.2273,-0.1365,-0.0319,0.0787,0.1852,0.2723,0.3327,0.352,0.3268],[-0.4167,-0.3654,-0.3006,-0.2139,-0.1079,0.0093,0.1294,0.236,0.3187,0.3661,0.3639],[-0.4897,-0.4338,-0.3719,-0.2909,-0.1862,-0.0642,0.0649,0.1908,0.2933,0.3657,0.392],[-0.5725,-0.5075,-0.4431,-0.3666,-0.2657,-0.1415,-0.0044,0.1347,0.2584,0.3527,0.4064],[-0.5784,-0.5898,-0.5177,-0.4418,-0.3455,-0.2216,-0.0784,0.0714,0.2149,0.329,0.4068]]},"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "CP": {"v":{"axes":{"J":[0,0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8,2,2.2,2.4],"beta75_deg":[10,15,20,25,30,35,40,45,50,55,60]},"data":[[0.0478,0.0823,0.1228,0.1642,0.202,0.2358,0.2678,0.3008,0.3393,0.3732,0.3989],[0.0427,0.0804,0.1269,0.1757,0.2197,0.2561,0.2894,0.3198,0.3602,0.4038,0.4426],[0.0285,0.0686,0.1216,0.1803,0.2374,0.2859,0.317,0.3448,0.3741,0.4213,0.4689],[0.0006,0.0423,0.1024,0.1724,0.2442,0.3079,0.3566,0.3901,0.4016,0.4342,0.4863],[-0.0432,-0.0016,0.0635,0.1466,0.2356,0.321,0.3897,0.4367,0.4783,0.458,0.5025],[-0.1013,-0.0628,0.0042,0.097,0.2058,0.3155,0.4138,0.4845,0.528,0.571,0.5247],[-0.1672,-0.1385,-0.0736,0.0242,0.1502,0.2864,0.4175,0.5261,0.5939,0.6329,0.6794],[-0.2332,-0.2223,-0.1668,-0.0684,0.0669,0.2311,0.3957,0.5469,0.6596,0.7181,0.7529],[-0.2968,-0.3076,-0.2701,-0.1783,-0.0377,0.1428,0.3463,0.5408,0.7069,0.813,0.8558],[-0.362,-0.3913,-0.3773,-0.3011,-0.1617,0.0309,0.2648,0.5062,0.7274,0.897,0.9816],[-0.4347,-0.4751,-0.4841,-0.4312,-0.3018,-0.1024,0.1522,0.4426,0.7188,0.9567,1.1104],[-0.5194,-0.5638,-0.5895,-0.5632,-0.4529,-0.2544,0.0172,0.3434,0.6815,0.9879,1.2226],[-0.4256,-0.662,-0.6958,-0.6931,-0.609,-0.4205,-0.1378,0.2169,0.616,0.9907,1.3089]]},"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "CNmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2],"beta75_deg":[10,15,20,25,30,35,40]},"data":[[0.0246,0.0331,0.0417,0.0364,0.0537,0.0625,0.0738],[0.0306,0.0409,0.0499,0.0576,0.0647,0.0738,0.0749],[0.0372,0.0513,0.0629,0.0713,0.0764,0.0799,0.0879],[0.0399,0.0593,0.0797,0.0901,0.0969,0.0975,0.0956],[0.0366,0.0617,0.0884,0.1148,0.122,0.1253,0.119],[0.027,0.0568,0.0913,0.1256,0.1573,0.1574,0.1544]]},"u":"-","scope":"propeller","src":["R1:P6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "CMmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2],"beta75_deg":[10,15,20,25,30,35,40]},"data":[[0.0336,0.0445,0.0512,0.0497,0.0482,0.0412,0.0347],[0.0307,0.0441,0.0528,0.0566,0.0546,0.0484,0.0393],[0.0254,0.0416,0.054,0.0602,0.0609,0.0545,0.0456],[0.0174,0.0353,0.0531,0.063,0.067,0.0638,0.053],[0.007,0.0264,0.0463,0.0651,0.0714,0.0727,0.0648],[-0.0046,0.0153,0.0373,0.0586,0.078,0.0791,0.0766]]},"u":"-","scope":"propeller","src":["R1:P6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"}
   },
   "inertia": {
    "Ip": {"v":14,"u":"kg m2","scope":"propeller","src":["R1:P2","R1:P3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "IreflectedEngine": {"v":0,"u":"kg m2","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"}
   },
   "governor": {
    "kGov": {"v":1,"u":"deg/s per rpm","scope":"propeller","src":["R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "pitchRateMax": {"v":20,"u":"deg/s","scope":"propeller","src":["R1:P8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "rpmOverspeed": {"v":2100,"u":"rpm","scope":"propeller","src":["R1:P8","R1:P4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "oilMinRpm": {"v":200,"u":"rpm","scope":"propeller","src":["R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "featherRate": {"v":15,"u":"deg/s","scope":"propeller","src":["R1:P8","R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "betaFlightIdle": {"v":11.74,"u":"deg @0.75R","scope":"propeller","src":["LP2","LP27"],"conf":"สูง","est":false,"note":"min pitch 14° ที่สถานี 30 in แปลงเป็น 0.75R ด้วย tanβ ∝ 1/r"},
    "betaFeather": {"v":85.2,"u":"deg @0.75R","scope":"propeller","src":["LP2","LP27"],"conf":"สูง","est":false,"note":"feather 86° ที่สถานี 30 in"}
   },
   "feathered": {
    "bladePlanformArea": {"v":0.66,"u":"m2","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "CDfeathered": {"v":0.06,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"}
   },
   "checks": {
    "peakEfficiency": {"v":0.88,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน"},
    "momentumIdealStaticISA": {"v":17.9,"u":"kN","scope":"propeller","src":["LP27"],"conf":"กลาง","est":false,"note":"(2ρA)^(1/3) P^(2/3), D 2.438 m, 708 kW"},
    "staticThrustISA": {"v":12.01,"u":"kN","scope":"propeller","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ทฤษฎีโมเมนตัม FM 0.55 (ค่าเริ่มต้นของ lm_card); BEM ของรอบที่ 1 ที่ 700 kW ได้ 12.36 kN (FM 0.58)"},
    "staticThrustVTBD31C": {"v":11.8,"u":"kN","scope":"propeller","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สเกล ρ^(1/3) ที่ 31 °C (ρ 1.160) กำลังเต็มเพราะ flat rating"}
   },
   "betaReverse": {
    "reverseAvailable": {"v":false,"u":"-","scope":"propeller","src":["LP2"],"conf":"กลาง","est":false,"note":"ไม่มี reverse/beta บนพื้น (เครื่องฝึก)"}
   }
  }
 }
}
```

`pc9m` · controls

```json
{
 "pc9m": {
  "controls": {
   "architecture": {"v":{"pitch":"reversible","roll":"reversible","yaw":"reversible","trim":"tab"},"u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"กลไกสาย/ก้าน"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":18.5,"down":16},"rate_dps":null,"actuator_tau_s":null},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"±1°; ระบบกลไก ไม่มี actuator"},
    "aileron": {"v":{"travel_deg":{"up":20,"down":11}},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"differential"},
    "rudder": {"v":{"travel_deg":{"left":24,"right":24}},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
    "flap": {"v":{"travel_deg":{"TO":23,"LDG":50}},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"สองขั้น"},
    "trim_tab": {"v":{"elevator_tab":{"up":15,"down":20},"rudder_tab":{"right":3.5,"left":11.5}},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"aileron fixed tab ±5° (ปรับบนพื้น)"},
    "speedbrake": {"v":{"travel_deg":70},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"airbrake; ใช้ได้ถึง VMO"}
   },
   "trim": {"v":{"kind":"electric/manual (ไม่ยืนยัน)","elevator_tab_deg":{"up":15,"down":20},"rudder_tab_deg":{"right":3.5,"left":11.5}},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"ระยะ tab จาก TCDS; ชนิดตัวขับไม่ยืนยัน"},
   "pitch": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":""},
    "S_e": {"v":1.1,"u":"m2","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_e": {"v":0.3,"u":"m","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":2.4,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch0": {"v":0,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_alpha": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["R1:C15","R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["R1:C15","R1:C16","R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_tab": {"v":-0.2005,"u":"1/rad","scope":"aircraft","src":["R1:C16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate_flaps_down": {"v":1,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate_flaps_up": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":4.45,"u":"N","scope":"aircraft","src":["R1:C19","R1:C20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "friction": {"v":4.45,"u":"N","scope":"aircraft","src":["R1:C18","R1:C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "centring_spring": {"v":{"Kc":60,"qFade":400},"u":"N/rad, Pa","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":70,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "a_t": {"v":4.06,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "tau_e": {"v":0.636,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: cf/c 0.40 × ตัวคูณความหนืด 0.85"},
    "l_t": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "deda": {"v":0.42,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "tab_max": {"v":20,"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"elevator tab ขึ้น 15° ลง 20°"},
    "stops": {"v":{"teu":18.5,"ted":16},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""}
   },
   "roll": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":""},
    "S_a_each": {"v":0.65,"u":"m2","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_a": {"v":0.25,"u":"m","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":3.88,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.1719,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_alpha": {"v":-0.0573,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate": {"v":1,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":3,"u":"N","scope":"aircraft","src":["R1:C18","R1:C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":80,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tab_max": {"v":5,"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"fixed tab ±5° (ปรับบนพื้น ไม่ใช่ trim)"},
    "stops": {"v":{"max":20,"up":20,"down":11},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""}
   },
   "yaw": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":""},
    "S_r": {"v":0.85,"u":"m2","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_r": {"v":0.32,"u":"m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":4.85,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_beta": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "slipstream_q_ratio": {"v":[1,2],"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate": {"v":1.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":13.3,"u":"N","scope":"aircraft","src":["R1:C14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tab_max": {"v":11.5,"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"rudder trim tab ขวา 3.5° ซ้าย 11.5°"},
    "stops": {"v":{"max":24},"u":"deg","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":"±24°"}
   }
  }
 }
}
```

`pc9m` · gear

```json
{
 "pc9m": {
  "gear": {
   "layout": {"v":"tricycle_retract","u":"-","scope":"aircraft","src":["LP2"],"conf":"สูง","est":false,"note":""},
   "retract": {"v":{"time_s":6,"VLO_kt":150,"VLE_kt":150},"u":"s, kt","scope":"aircraft","src":["LP2","LP21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เวลา 6 s ของ T-6; VLO 150 kt จาก TCDS"},
   "geometry": {
    "nose_contact_body_extended": {"v":[2.033,0,1.33],"u":"m FRD","scope":"aircraft","src":["LP27","LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: wheelbase 2.31 m, โหลดล้อหน้า 12 % (ค่าประมาณ), CG จอดสูง 1.25 m, ช่วงยืด 0.08 m"},
    "main_contact_body_extended": {"v":[[-0.277,-1.27,1.35],[-0.277,1.27,1.35]],"u":"m FRD","scope":"aircraft","src":["LP27","LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: track 2.54 m"},
    "cg_height_parked": {"v":1.25,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1 1.30 m"}
   },
   "strut_main": {
    "kind": {"v":"oleo","u":"-","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: oleo-pneumatic (ไม่ยืนยันชนิดย่อย)"},
    "stroke": {"v":0.25,"u":"m","scope":"gear","src":["R1:G3","R1:G4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "p_static": {"v":300,"u":"psi","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "piston_area": {"v":0.00463,"u":"m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_static_to_extended": {"v":2.5,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_compressed_to_extended": {"v":8,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "polytropic_n_dynamic": {"v":1.12,"u":"-","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "polytropic_n_static": {"v":1,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kh_compression": {"v":4000,"u":"N/(m/s)^2","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kr_rebound": {"v":48000,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_linear": {"v":2000,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "seal_friction_ratio": {"v":0,"u":"-","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "strut_nose": {
    "kind": {"v":"oleo","u":"-","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "stroke": {"v":0.2,"u":"m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "p_static": {"v":300,"u":"psi","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "piston_area": {"v":0.00141,"u":"m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_static_to_extended": {"v":2.5,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_compressed_to_extended": {"v":8,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kh_compression": {"v":1600,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kr_rebound": {"v":19000,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_linear": {"v":1000,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "tyre_main": {
    "size": {"v":{"size":"6.50-8","type":"III","ply":8},"u":"-","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "rated_load": {"v":14012,"u":"N","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "rated_pressure": {"v":75,"u":"psi","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "operating_pressure": {"v":60,"u":"psi","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "outside_diameter": {"v":0.495,"u":"m","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "section_width": {"v":0.168,"u":"m","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "k_vertical": {"v":320000,"u":"N/m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "c_vertical": {"v":3500,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "relaxation_length": {"v":0.3,"u":"m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "k_longitudinal": {"v":246000,"u":"N/m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "mu_peak_dry": {"v":0.8,"u":"-","scope":"gear","src":["R1:G12","R1:G19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "mu_skid_ratio_dry": {"v":0.75,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "mu_skid_ratio_wet": {"v":0.5,"u":"-","scope":"gear","src":["R1:G11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "rolling_radius": {"v":0.235,"u":"m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"},
    "wheel_inertia": {"v":0.33,"u":"kg m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])"}
   },
   "tyre_nose": {
    "size": {"v":{"size":"5.00-5","type":"III","ply":6},"u":"-","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "rated_load": {"v":5716,"u":"N","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "rated_pressure": {"v":50,"u":"psi","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "operating_pressure": {"v":45,"u":"psi","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "outside_diameter": {"v":0.354,"u":"m","scope":"gear","src":["R1:G18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "k_vertical": {"v":160000,"u":"N/m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "c_vertical": {"v":1200,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"},
    "relaxation_length": {"v":0.22,"u":"m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ไม่พบข้อมูลสาธารณะ"}
   },
   "brakes": {
    "force_limit_ratio": {"v":0.6,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "pressure_rise_rate": {"v":2.5,"u":"1/s","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "heat_sink_mass": {"v":6,"u":"kg","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "heat_sink_cool_tau": {"v":900,"u":"s","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "fade_start_temp": {"v":400,"u":"degC","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "fade_full_temp": {"v":700,"u":"degC","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "antiskid": {"v":0,"u":"bool","scope":"aircraft","src":["LP2"],"conf":"กลาง","est":false,"note":"ไม่มี antiskid (เครื่องฝึก; ไม่พบในเอกสาร)"}
   },
   "steering": {
    "mode": {"v":{"type":"castering_diff_brake"},"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่พบข้อมูลสาธารณะของ PC-9 M (ค่าประมาณว่าใช้ล้อหน้าอิสระ + เบรกแยกข้างแบบ PC-7)"},
    "pedal_max": {"v":0,"u":"deg","scope":"aircraft","src":["R1:G19","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: castering"},
    "caster_max": {"v":45,"u":"deg","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "steer_rate": {"v":60,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "shimmy_lag": {"v":0.05,"u":"s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "certification": {
    "part23_limit_descent": {"v":{"formula":"V = 4.4 (W/S)^0.25 fps, 7..10 fps","W_S_lb_ft2":29.55,"fps":10,"mps":3.048},"u":"fps","scope":"aircraft","src":["R1:G3","LP27"],"conf":"กลาง","est":false,"note":"14 CFR 23.473(d); W/S สูงพอให้ได้ค่าสูงสุด 10 fps"},
    "part23_wing_lift_ratio": {"v":0.667,"u":"-","scope":"aircraft","src":["R1:G3","R1:G4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "part23_min_load_factors": {"v":{"inertia":2.67,"ground_reaction":2},"u":"g","scope":"aircraft","src":["R1:G3"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "part23_reserve_drop_factor": {"v":1.44,"u":"x drop height","scope":"aircraft","src":["R1:G5"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   }
  }
 }
}
```

`pc9m` · wind+validation+input

```json
{
 "pc9m": {
  "wind": {
   "wake": {
    "b0_over_b": {"v":0.7854,"u":"-","scope":"aircraft","src":["R1:W19"],"conf":"กลาง","est":false,"note":"π/4 (แรงยกแบบวงรี)"},
    "rc_over_b": {"v":{"default":0.035,"min":0.02,"max":0.06},"u":"-","scope":"aircraft","src":["R1:W19","R1:W24"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trainerRollControl": {"v":{"Clda":0.2307,"daMax_deg":15.5,"ClMax":0.0624},"u":"-, deg","scope":"aircraft","src":["LM10","LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: อำนาจม้วนสูงสุด Clda × ค่าเฉลี่ยมุม aileron"}
   },
   "fFactor": {
    "trainerExcessTW": {"v":0.259,"u":"-","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Tmax − D)/W ที่ Vapp 95 kt แฟลปสุด ล้อลง ISA+16 ระดับน้ำทะเล ด้วยกฎแรงขับของซิมและ legacy ของบัตรนี้ (นิยามรอบที่ 1)"}
   }
  },
  "validation": {
   "classification": {
    "hqClassCategory": {"v":{"class":"I","approachLanding":"C","cruiseClimb":"B","takeoff":"C","aerobatics":"A"},"u":"-","scope":"aircraft","src":["R1:V7","R1:V10","R1:C12"],"conf":"กลาง","est":false,"note":"MIL-F-8785C: primary trainer = Class I; ผาดแผลง/spin = Category A"}
   },
   "procedures": {
    "v50MinFactor_singleEngine": {"v":1.2,"u":"× VS1","scope":"aircraft","src":["R1:V17"],"conf":"กลาง","est":false,"note":"14 CFR 23.53 (ก่อน amdt 23-64)"}
   },
   "trim_targets": {
    "cruise": {"v":{"ias_kt":200,"h_ft":3000,"power":"ไม่มีข้อมูล"},"u":"kt, ft","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: cruise 200 kt 3,000 ft (จุดเดียวกับ T-6 เพื่อเทียบกัน)"},
    "approach": {"v":{"ias_kt":95,"h_m":300,"gamma_deg":-3,"flap":"LDG","gear":"down"},"u":"kt, m, deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: VAPP 95 kt แฟลป LDG ล้อลง γ −3° 300 m"}
   },
   "takeoff_test": {"v":{"flap":"TO","VR_kt":78,"theta_deg":10},"u":"kt, deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แฟลป TO; VR ค่าประมาณ (speeds.VR_kt)"},
   "currentModel": {
    "performance": {"v":{"VSR_clean_kt":79,"Vmin_clean_kt":74.1,"VSR_full_kt":70.79,"Vmin_full_kt":66.36,"Vy_SL_kt":142.2,"ROCmax_SL_fpm":4126,"glideLD_zeroThrust":11.3,"Vbg_kt":115.9,"glideLD_idle":11.3,"TO_groundRoll_m":301,"TO_50ft_m":495,"LDG_50ft_maxBrake_m":674,"LDG_50ft_asIs_m":848},"u":"kt, fpm, -, m","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: โมเดลวันนี้ (src/ @ cabf0f0) + aero.legacy/propulsion.legacy ของบัตรนี้ ที่ 2350 kg ISA ลมสงบ (lm_card runCard); ความเร็ว KEAS ของซิม; ใช้เป็น regression ไม่ใช่ค่าจริง"},
    "approach": {"v":{"sp_wn":2.342,"sp_zeta":0.5785,"CAP":1.063,"nAlpha":5.157,"ph_T_s":25.55,"ph_zeta":0.1362,"dr_wn":1.797,"dr_zeta":0.1786,"dr_zetaWn":0.3209,"tauR_s":0.3386,"spiral_t2_s":25.74,"spiral_divergent":true,"trim_alpha_deg":2.175,"trim_theta_deg":-0.8254,"trim_de_deg":-3.867,"trim_thr":0.2889},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 95 kt แฟลปสุด ล้อลง 300 m γ −3° ที่ 2350 kg"},
    "cruise": {"v":{"sp_wn":4.89,"sp_zeta":0.5583,"CAP":1.046,"nAlpha":22.86,"ph_T_s":55.21,"ph_zeta":0.1664,"dr_wn":3.661,"dr_zeta":0.1643,"dr_zetaWn":0.6014,"tauR_s":0.1654,"spiral_t2_s":50.82,"spiral_divergent":true,"trim_alpha_deg":-0.5646,"trim_theta_deg":-0.5646,"trim_de_deg":2.421,"trim_thr":0.5313},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 200 kt clean 3,000 ft ระดับ ที่ 2350 kg"}
   }
  },
  "input": {
   "keyboard": {
    "interim_trim_rate_elevator": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "flap_notches": {"v":[0,0.5455,1],"u":"-","scope":"sim","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: AC.flaps ของขั้น UP/TO/LDG แบบ lift (dCL0 0/0.30/0.55) ⇒ 0, 0.545, 1; มุมจริง 0/23/50° [LP1][LP2][LP5]"}
   }
  }
 }
}
```

`pc7mk2` · _meta+airframe

```json
{
 "pc7mk2": {
  "_inherits": {"v":"pc9m","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"PC-7 MkII ใช้โครงสร้าง PC-9: TCDS F 56-25 ให้ MAC 1,650 mm, LEMAC 3,872.5 mm, datum, ตำแหน่งที่นั่ง, เชื้อเพลิง 540 L และระยะพื้นบังคับเท่า PC-9 M ทุกค่า; ต่างที่เครื่องยนต์ PT6A-25C, น้ำหนัก และความเร็ว"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Pilatus Aircraft Ltd","model":"PC-7 MkII","variant":"PC-7 MkII (MSN 101–689, 765–999); MSN 690–764 และ 1000+ = PC-7 MKX (MTOW 2,350 kg)","engine":"P&WC PT6A-25C 700 shp (522 kW)","propeller":"Hartzell HC-D4N-2D/-2E + 4× D9512A(K), 2.44 m","seats":2,"category":"acrobatic/utility (FAR 23)","tc_ref":"FOCA TCDS F 56-25 Issue 10 (2025)"},"u":"-","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":""},
   "weights": {
    "MTOW": {"v":2250,"u":"kg","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":"acrobatic; stores 2,700 kg; PC-7 MKX 2,350 kg"},
    "MLW": {"v":2250,"u":"kg","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":""},
    "MRW": {"v":2260,"u":"kg","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":""},
    "MZFW": {"v":1900,"u":"kg","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":""},
    "BEW_typical": {"v":1670,"u":"kg","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"3,682 lb (fact sheet)"},
    "useful_load": {"v":580,"u":"kg","scope":"aircraft","src":["LP27","LP1","LP9"],"conf":"กลาง","est":false,"note":"MTOW − BEW"},
    "training_mass": {"v":{"kg":2068.8,"BEW":1670,"crew":190,"fuel":208.8},"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEW + 2 × 95 kg + เชื้อเพลิงครึ่งถัง; เทียบ TCDS ใช้ --mass 2250"}
   },
   "cg": {
    "envelope": {"v":[[2250,4.2355,4.3675],[2350,4.285,4.3675]],"u":"kg, m DAT","scope":"aircraft","src":["LP1"],"conf":"สูง","est":false,"note":"≤2,250 kg 22–30 %MAC; 2,350 kg (MKX) 25–30 %MAC; stores 2,700 kg 22.5–29, 2,850 kg 23–28"}
   },
   "inertia": {
    "ref_mass": {"v":2250,"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: inertia ของ pc9m สเกลด้วยรัศมีไจเรชันคงที่ (ลดลง 4 %); ค่า Ixx … ของ pc9m ถูกคูณ 2,250/2,350 โดย buildAC"},
    "Ixx": {"v":3979,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii คลาส trainer_turboprop ที่ 2,250 kg"},
    "Iyy": {"v":6607,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เหมือนกัน"},
    "Izz": {"v":9299,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เหมือนกัน"}
   }
  }
 }
}
```

`pc7mk2` · aero

```json
{
 "pc7mk2": {
  "aero": {
   "static_long": {
    "CLmax_target": {"v":{"UP":1.4118,"LDG":1.7691},"u":"-","scope":"aircraft","src":["LP9","LM1","LP27"],"conf":"กลาง","est":false,"note":"จาก fact sheet 75/67 KCAS (สมมติที่ 2,250 kg) ⇒ CL ปรากฏ 1.4862/1.8622"},
    "alpha_star": {"v":{"clean":17.74,"landing":16.09},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โค้ดปัจจุบัน: ศูนย์กลาง blending (aStall, aStall + aStallFlap) ที่ legacy fit แก้ไว้ ใช้แทน α* ของรอบที่ 1 (ยังไม่ได้ปรับจุด X0 ของโมเดล Viterna)"},
    "alpha_CLmax": {"v":{"clean":14.94,"landing":13},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ที่ CL ของซิม (trim, นอก ground effect) สูงสุด; CLmax 1.411/1.769"}
   },
   "legacy": {"v":{"CD0":0.03529,"K":0.08894,"CL0":0.25,"CLa":4.987,"CLflap":0.55,"CDflap":0.06,"CDgear":0.02,"Cm0":0.045,"Cma":-0.761,"Cmflap":-0.1,"aStall":17.74,"aStallFlap":-1.65},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM1","LM0","LP27","LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static ที่ MTOW: polar ของซิม CD = CD0 + K(CL − 0.15)² จากการร่อน (L/D 11.3 ที่ 113.6 kt); aStall/aStallFlap แก้ให้ CLmax 1 g ตรง CLmax_target; ค่าอื่นจาก aero.static_long/flaps; polar from glide 113.6 KCAS E 11.3: CD0s 0.0353 Ks 0.0889; idle 0 (POH glide is at idle, windmilling); climb fit (static): target Vy 120.0 KCAS ROC 2840 fpm → T0 9805 N, Vc 64.5 m/s; WARNING eta 1.21 > 0.95: P too low for the sim's thrust law at this ROC"},
   "stall_warning": {
    "alpha_warn_5kt": {"v":{"clean":11.43,"landing":8.468},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ของ CL เชิงเส้นที่ VS + 5 kt (1 g, ISA SL, MTOW); วิธีเดียวกับ 06-da42"},
    "alpha_warn_design": {"v":{"clean":10.75,"landing":7.548},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: margin 7 kt เผื่อ gust (ตามรอบที่ 1)"}
   }
  }
 }
}
```

`pc7mk2` · speeds+performance

```json
{
 "pc7mk2": {
  "speeds": {
   "VS1_kt": {"v":75,"u":"kt CAS","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"แฟลปและล้อขึ้น; fact sheet ไม่ระบุน้ำหนัก (สมมติ 2,250 kg)"},
   "VS0_kt": {"v":67,"u":"kt CAS","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"แฟลปและล้อลง"},
   "VA_kt": {"v":210,"u":"kt CAS","scope":"aircraft","src":["LP1"],"conf":"กลาง","est":false,"note":"ที่ 2,250 kg; 200 kt เมื่อมี stores"},
   "VNE_kt": {"v":300,"u":"kt CAS","scope":"aircraft","src":["LP1"],"conf":"กลาง","est":false,"note":"VMO ถึง 15,000 ft; MMO 0.60; fact sheet: 300 KCAS"},
   "VREF_kt": {"v":87,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 87.1"},
   "VAPP_kt": {"v":92,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: VREF + 5"},
   "VR_kt": {"v":76,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีค่าสาธารณะ"},
   "VY_kt": {"v":120,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีค่าสาธารณะ; ค่าประมาณจากกำลังต่ำกว่า PC-9 M"},
   "VG_kt": {"v":113.6,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar คลาสที่ 2,250 kg"},
   "stall_table": {"v":{"2250kg":{"UP":75,"LDG":67}},"u":"kt CAS","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"น้ำหนักสมมติ"},
   "icao_approach_category": {"v":"A","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 87.1 kt"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":2840,"u":"fpm","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"ISA SL (น้ำหนักไม่ระบุ สมมติ 2,250 kg)"},
   "takeoff": {"v":{"ground_roll_m":null,"over50ft_m":415},"u":"m","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"ISA SL ถึง 50 ft (1,360 ft)"},
   "landing": {"v":{"ground_roll_m":null,"over50ft_m":674},"u":"m","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"ISA SL จาก 50 ft (2,210 ft)"},
   "cruise_table": {"v":[{"h_ft":0,"ktas":242,"power":"max"},{"h_ft":10000,"ktas":251,"power":"max"}],"u":"ft, kt TAS","scope":"aircraft","src":["LP9"],"conf":"กลาง","est":false,"note":"max level cruise"},
   "glide": {"v":{"speed_kt":113.6,"ratio":11.3},"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar คลาสของ T-6"},
   "fuel": {"v":{"usable_L":518,"usable_kg":417.5,"range_nm":810},"u":"L, kg, nm","scope":"aircraft","src":["LP1","LP9"],"conf":"กลาง","est":false,"note":""}
  }
 }
}
```

`pc7mk2` · propulsion+turboprop+propeller

```json
{
 "pc7mk2": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[3.83,0,-0.05],"axis":[1,0,0],"type":"turboprop","model":"PT6A-25C","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LP1","LP27"],"conf":"กลาง","est":false,"note":"ตำแหน่งดุมเป็นค่าประมาณ"},
   "legacy": {"v":{"P":522000,"eta":1.211,"T0":9805,"idle":0},"u":"W, -, N, -","scope":"engine","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T0 จากทฤษฎีโมเมนตัม FM 0.55 (lm_card); eta = Vc·T0/P ฟิตให้ ROC ของซิมที่ MTOW = 2840 fpm ที่ VY 120 kt; idle 0 เพราะ polar มาจากการร่อนแรงขับศูนย์; WARNING eta > 0.95"}
  },
  "turboprop": {
   "ratings": {
    "P_rated": {"v":522000,"u":"W","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"700 shp"},
    "T_flat_C": {"v":45,"u":"degC","scope":"engine","src":["LP9","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: thermodynamic 850 shp/flat 700 shp ⇒ กำลังเต็มถึงอุณหภูมิสูง (ไม่มีตัวเลข)"},
    "Np_max_rpm": {"v":2040,"u":"rpm","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"ดู propeller.engineInterface.rpmGoverned"},
    "Q_lim": {"v":2443,"u":"N m","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"49.7 psi; P/ω ที่ 522 kW, 2,040 rpm"},
    "ITT_max_C": {"v":790,"u":"degC","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"max acceleration 850 °C 2 s"},
    "ITT_start_C": {"v":1090,"u":"degC","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"2 s (PT6A-25C)"}
   },
   "derived_vtbd": {
    "P_avail_vs_OAT_SL": {"v":{"axes":{"OAT_C":[15,25,31,34,37,38,40,45]},"data":[522,522,522,522,522,522,522,522]},"u":"kW","scope":"engine","src":["LP9","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: flat rating กว้าง (850 → 700 shp)"},
    "P_avail_static_grid": {"v":{"axes":{"alt_ft":[0,5000,10000]},"data":[522,522,480]},"u":"kW","scope":"engine","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หยาบ: flat ถึงราว 8,000 ft ISA"}
   },
   "reference_engines": {
    "PT6A-62": {"v":"ไม่ใช้ (PC-7 MkII ใช้ PT6A-25C)","u":"-","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"แทนค่าที่สืบทอดจาก pc9m"}
   }
  },
  "propeller": {
   "identity": {
    "model": {"v":"Hartzell HC-D4N-2D หรือ -2E / D9512A(K)","u":"-","scope":"propeller","src":["LP1"],"conf":"สูง","est":false,"note":""}
   },
   "engineInterface": {
    "maxShaftPower": {"v":522,"u":"kW","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"700 shp (thermodynamic 850 shp [LP9])"},
    "rpmGoverned": {"v":2040,"u":"rpm","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"TCDS F 56-25 Issue 10 หน้า 1 (ตรวจทานแล้ว); transient 2,205 rpm 2 s; PC-9 M ใช้ 2,000"},
    "rpmTransientLimit": {"v":2205,"u":"rpm","scope":"engine","src":["LP1"],"conf":"สูง","est":false,"note":"max acceleration 2 s"}
   },
   "governor": {
    "betaFlightIdle": {"v":13.44,"u":"deg @0.75R","scope":"propeller","src":["LP1","LP27"],"conf":"สูง","est":false,"note":"min pitch 16° ที่สถานี 30 in"}
   }
  }
 }
}
```

`pc7mk2` · wind+validation+input

```json
{
 "pc7mk2": {
  "wind": {
   "fFactor": {
    "trainerExcessTW": {"v":0.1748,"u":"-","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Tmax − D)/W ที่ Vapp 92 kt แฟลปสุด ล้อลง ISA+16 ระดับน้ำทะเล ด้วยกฎแรงขับของซิมและ legacy ของบัตรนี้ (นิยามรอบที่ 1)"}
   }
  },
  "validation": {
   "trim_targets": {
    "approach": {"v":{"ias_kt":92,"h_m":300,"gamma_deg":-3,"flap":"LDG","gear":"down"},"u":"kt, m, deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: VAPP 92 kt (ค่าประมาณ) แฟลป LDG ล้อลง γ −3° 300 m"}
   },
   "takeoff_test": {"v":{"flap":"TO","VR_kt":76,"theta_deg":10},"u":"kt, deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แฟลป TO สมมติ; VR ค่าประมาณ"},
   "currentModel": {
    "performance": {"v":{"VSR_clean_kt":76.94,"Vmin_clean_kt":72.36,"VSR_full_kt":68.72,"Vmin_full_kt":64.65,"Vy_SL_kt":127.2,"ROCmax_SL_fpm":2869,"glideLD_zeroThrust":11.3,"Vbg_kt":113.4,"glideLD_idle":11.3,"TO_groundRoll_m":337,"TO_50ft_m":543,"LDG_50ft_maxBrake_m":652,"LDG_50ft_asIs_m":813},"u":"kt, fpm, -, m","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: โมเดลวันนี้ (src/ @ cabf0f0) + aero.legacy/propulsion.legacy ของบัตรนี้ ที่ 2250 kg ISA ลมสงบ (lm_card runCard); ความเร็ว KEAS ของซิม; ใช้เป็น regression ไม่ใช่ค่าจริง"},
    "approach": {"v":{"sp_wn":2.329,"sp_zeta":0.5886,"CAP":1.074,"nAlpha":5.051,"ph_T_s":24.88,"ph_zeta":0.1381,"dr_wn":1.785,"dr_zeta":0.1854,"dr_zetaWn":0.3308,"tauR_s":0.3359,"spiral_t2_s":24.33,"spiral_divergent":true,"trim_alpha_deg":2.412,"trim_theta_deg":-0.588,"trim_de_deg":-4.013,"trim_thr":0.3556},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 92 kt แฟลปสุด ล้อลง 300 m γ −3° ที่ 2250 kg"},
    "cruise": {"v":{"sp_wn":5.019,"sp_zeta":0.568,"CAP":1.055,"nAlpha":23.87,"ph_T_s":55.58,"ph_zeta":0.1803,"dr_wn":3.747,"dr_zeta":0.1694,"dr_zetaWn":0.6345,"tauR_s":0.1587,"spiral_t2_s":51.49,"spiral_divergent":true,"trim_alpha_deg":-0.6762,"trim_theta_deg":-0.6762,"trim_de_deg":2.489,"trim_thr":0.7461},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 200 kt clean 3,000 ft ระดับ ที่ 2250 kg"}
   }
  }
 }
}
```

`t6a` · _meta+airframe

```json
{
 "t6a": {
  "_na": {"v":["turbofan.*","controls.reference_types.*","validation.typicalModes.*","gear.certification.part25_limit_descent","gear.certification.part25_friction_cap","wind.discreteGust.cfr25_341_Fg","wind.wake.leaders","numerics.contact.*","aero.static_long.table_clean","controls.pitch.derived_check","propeller.betaReverse.betaGroundIdle","propeller.betaReverse.betaReverseMax","propeller.betaReverse.reverseRpmMax","propeller.betaReverse.reverseCTstatic","turboprop.beta_reverse.*","gear.brakes.antiskid_efficiency","gear.brakes.antiskid_efficiency_measured","gear.brakes.antiskid_slip_setpoint","validation.currentModel.approach95","validation.currentModel.cruise155","otherSims.jsbsim.gearSideForcePacejkaDefaults","otherSims.jsbsim.c172xTrimCruise100kcas3000ft","otherSims.jsbsim.c172xTrimApproach65kcas1000ftFlap30","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*","turboprop.reference_engines.PT6A-62","turboprop.reference_engines.PT6A-60A","turboprop.reference_engines.PT6A-52","turboprop.reference_engines.PT6A-68B_C_D_T"],"u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"ไม่ใช้กับแบบนี้: turbofan.* (เครื่องเทอร์โบพร็อป); part25_* และ cfr25_* (ใบรับรอง FAR 23); controls.reference_types/typicalModes/wake.leaders (ค่าอ้างอิงรวมของรอบที่ 1 ไม่ใช่ค่ารายแบบ); numerics.contact.* (ของซิม); table_clean และ pitch.derived_check (ผลคำนวณของเครื่องฝึกรอบที่ 1); betaReverse/beta_reverse และ antiskid (ไม่มีระบบนี้); currentModel.approach95/cruise155 (เงื่อนไขของรอบที่ 1; ใช้ validation.currentModel.approach/cruise แทน); otherSims.* (หัวข้อ 03 เป็นเจ้าของ ส่วนที่เหลือเป็นค่าของ C172/โมเดลอื่น); reference_engines ของเครื่องยนต์ที่แบบนี้ไม่ใช้"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Raytheon/Hawker Beechcraft, ปัจจุบัน Textron Aviation Defense","model":"Model 3000 (T-6A Texan II)","variant":"T-6A (ห้องนักบินแบบเข็ม)","engine":"P&WC PT6A-68 flat rated 1,100 shp","propeller":"Hartzell HC-E4A-2 + 4× E9612, 2.46 m","seats":2,"category":"normal/aerobatic (FAR 23)","tc_ref":"EASA TCDS IM.A.636 (Model 3000, PM series); FAA type certificate ตาม 14 CFR 23 + special conditions (ยื่นขอ 15 Jan 1996 [LP6]; วันออก TC ยังไม่ได้ตรวจกับเอกสาร FAA)"},"u":"-","scope":"aircraft","src":["LP5","LP6","LP14"],"conf":"กลาง","est":false,"note":"TCDS ของ EASA ครอบคลุม Model 3000 รุ่นส่งออก (MTOW 6,900 lb) ค่าที่เป็นของ T-6A โดยเฉพาะมาจากเอกสารฝึกและ fact sheet"},
   "weights": {
    "MTOW": {"v":2948.4,"u":"kg","scope":"aircraft","src":["LP21","LP14","LB16"],"conf":"กลาง","est":false,"note":"6,500 lb; TCDS ของ EASA (รุ่น PM series) ให้ 6,900 lb ซึ่งเป็นค่าของ T-6C"},
    "MLW": {"v":2948.4,"u":"kg","scope":"aircraft","src":["LP21"],"conf":"กลาง","est":false,"note":"6,500 lb (เท่า MTOW)"},
    "MRW": {"v":2971,"u":"kg","scope":"aircraft","src":["LP20"],"conf":"ต่ำ","est":false,"note":"6,550 lb จาก flashcard [LP20] (แหล่งทุติยภูมิ)"},
    "MZFW": {"v":2494.8,"u":"kg","scope":"aircraft","src":["LP20"],"conf":"ต่ำ","est":false,"note":"5,500 lb จาก flashcard [LP20]"},
    "BEW_typical": {"v":2135.1,"u":"kg","scope":"aircraft","src":["LP14","LP21"],"conf":"กลาง","est":false,"note":"4,707 lb (Wikipedia อ้าง fact sheet); flashcard ให้ 4,900 lb"},
    "max_fuel_usable": {"v":499,"u":"kg","scope":"aircraft","src":["LP5","LP21"],"conf":"สูง","est":false,"note":"1,100 lb (498.95 kg) ตาม TCDS ข้อ A.III.2 = เติมจุดเดียว (SPR) [LP21]; TCDS ข้อ A.III.9.1 ให้ 2 × 90 gal = 180 gal (681.37 L ≈ 545 kg ที่ 0.80 kg/L ≈ 1,200 lb) ตรงกับการเติมทางปีก 1,200 lb [LP21] — TCDS ให้สองค่า บัตรใช้ 1,100 lb"},
    "useful_load": {"v":813.3,"u":"kg","scope":"aircraft","src":["LP27","LP5"],"conf":"กลาง","est":false,"note":"MTOW − BEW"},
    "training_mass": {"v":{"kg":2574.6,"BEW":2135.1,"crew":190,"fuel":249.5},"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEW + ครูและศิษย์ 2 × 95 kg (รวมร่มชูชีพและอุปกรณ์) + เชื้อเพลิงครึ่งถัง; การเทียบ TCDS/POH ใช้ --mass 2948.4"}
   },
   "cg": {
    "datum": {"v":"F.S. 0 อยู่หน้า firewall 118.1 in (3.000 m)","u":"-","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"firewall อยู่ที่ F.S. 118.1 in ⇒ datum อยู่หน้า firewall 3.000 m เท่ากับของ Pilatus"},
    "MAC": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: TCDS ของ T-6 ไม่ให้ MAC; ใช้ของ PC-9 M เพราะช่วงปีกและพื้นที่ปีกเท่ากัน (10.19 m, 16.28 m²)"},
    "LEMAC": {"v":3.8725,"u":"m DAT","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สมมติเท่า PC-9 M (3,872.5 mm หลัง datum) ใช้แปลง F.S. เป็น %MAC เท่านั้น"},
    "envelope": {"v":[[2653.5,4.1826,4.3015],[3129.8,4.2024,4.3015],[3152.5,4.2024,4.3015]],"u":"kg, m DAT","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"gear down, fuelled: fwd F.S. 164.67 in @5,850 lb, 165.45 in @6,900–6,950 lb; aft 169.35 in ถึง 6,950 lb (zero fuel: 164.80–169.22 in ≤ 5,850 lb) ≈ 18.8–26 %MAC, 20–26 %MAC, 20–26 %MAC (ถ้า LEMAC เท่า PC-9); ตารางนี้เป็นของ PM series (6,900 lb) ใช้กับ T-6A เป็นค่าใกล้เคียง"},
    "ref": {"v":{"x":4.252,"pct_mac":23},"u":"m DAT","scope":"aircraft","src":["LP27","LP5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG อ้างอิงของ FRD และ inertia = 23 %MAC (กลางช่วง envelope)"}
   },
   "inertia": {
    "ref_mass": {"v":2948.4,"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: inertia ข้างล่างคิดที่ MTOW; buildAC สเกลตามมวลด้วยรัศมีไจเรชันคงที่"},
    "Ixx": {"v":5214,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii คลาส trainer_turboprop Rx 0.261 (01-methods §01.4); ตรวจไขว้ด้วย component build-up ของ PC-9 M ได้ 3575 ที่ MTOW เชื้อเพลิงเต็ม"},
    "Iyy": {"v":8692,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ry 0.338; build-up 8745"},
    "Izz": {"v":12210,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Rz 0.4; build-up 12178"},
    "Ixz": {"v":0,"u":"kg m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล; แกนลำตัวของเครื่องปีกต่ำ Ixz เล็ก"},
    "radii": {"v":{"Rx":0.261,"Ry":0.338,"Rz":0.4},"u":"-","scope":"aircraft","src":["LM15"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าเฉลี่ยคลาส trainer_turboprop จาก JSBSim pc7 และ t6texan2 (n = 2, leave-one-out ผิด 42–91 %)"},
    "method": {"v":"Roskam radii (class trainer_turboprop) + ตรวจด้วย component build-up","u":"-","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความไม่แน่นอน ±30 % ต่อแกน"}
   },
   "wing": {
    "S": {"v":16.28,"u":"m2","scope":"aircraft","src":["LP7"],"conf":"กลาง","est":false,"note":"175.3 ft² (Textron); Wikipedia ให้ 177.5 ft² (16.49 m²) ขัดกัน"},
    "b": {"v":10.19,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"33 ft 5 in"},
    "MAC": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ของ PC-9 M"},
    "AR": {"v":6.378,"u":"-","scope":"aircraft","src":["LP27"],"conf":"กลาง","est":false,"note":"b²/S"},
    "taper": {"v":0.523,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แก้จาก S, b, MAC ของปีกสี่เหลี่ยมคางหมู: c_root 2.1 m, c_tip 1.1 m"},
    "sweep_c4_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีกตรง ไม่มีข้อมูลตัวเลข"},
    "dihedral_deg": {"v":6,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่พบตัวเลขสาธารณะ; เลือกให้ Clβ ใกล้ค่าคลาส (ความเชื่อมั่นต่ำ)"},
    "incidence_deg": {"v":1,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"},
    "twist_deg": {"v":-3,"u":"deg","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: washout เท่ารอบที่ 1"},
    "airfoil": {"v":{"root":"PIL15M825","tip":"PIL12M850"},"u":"-","scope":"aircraft","src":["LP24"],"conf":"กลาง","est":false,"note":"หน้าตัดของ Pilatus หนา 15 % / 12 %"},
    "position": {"v":"low","u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"ปีกต่ำ"},
    "x_c4_root": {"v":4.285,"u":"m DAT","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 ของ MAC (ใช้แทนโคนปีกใน lm_derivs)"}
   },
   "tail": {
    "S_h": {"v":3,"u":"m2","scope":"aircraft","src":["LP10","LP11","LP25","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จากช่วงหางระดับ 3.66 m กับ AR_h 4.5; JSBSim pc7 (Aeromatic) ให้ 2.82 m²; รอบที่ 1 ถอยได้ 2.96 m²"},
    "b_h": {"v":3.66,"u":"m","scope":"aircraft","src":["LP10","LP11"],"conf":"กลาง","est":false,"note":"12 ft 2 in จากแผ่นแบบ 1:25 ของ Pilatus (ป้ายอ่านจาก PC-7 MKX ซึ่งใช้โครงตระกูลเดียวกัน)"},
    "l_h": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 MAC ปีก (4.29 m DAT) ถึง c/4 MAC หางระดับ (~9.2 m DAT) ประมาณจากความยาวลำ 10.14 m"},
    "S_v": {"v":2,"u":"m2","scope":"aircraft","src":["LP25","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รวม rudder ไม่รวม dorsal/ventral fin; JSBSim pc7 1.66 m²; รอบที่ 1 2.06 m²"},
    "b_v": {"v":1.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความสูงครีบจากความสูงเครื่อง 3.26 m"},
    "l_v": {"v":4.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แขนโมเมนต์หางดิ่ง"},
    "z_v": {"v":0.8,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระยะ c/4 MAC หางดิ่งเหนือแกนลำตัว"},
    "airfoil_h": {"v":"ไม่ทราบ (สมมาตร)","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแหล่งสาธารณะ"},
    "airfoil_v": {"v":"ไม่ทราบ (สมมาตร)","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแหล่งสาธารณะ"},
    "incidence_h_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"}
   },
   "surfaces": {
    "elevator": {"v":{"area_m2":1.1,"chord_ratio":0.4,"span_fraction":1},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "aileron": {"v":{"area_m2":0.65,"chord_ratio":0.25,"span_fraction":[0.55,0.97]},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ต่อข้าง; span_fraction เป็นสัดส่วนครึ่งช่วงปีก"},
    "rudder": {"v":{"area_m2":0.85,"chord_ratio":0.4,"span_fraction":1},"u":"m2, -","scope":"aircraft","src":["R1:params-trainer.json","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "flap": {"v":{"kind":"single-slotted? (ไม่ยืนยัน)","chord_ratio":0.25,"span_fraction":[0.12,0.55]},"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแบบสาธารณะ"},
    "trim_tab": {"v":{"elevator_tab":true,"rudder_tab":true,"aileron":"biased centering spring (ไม่มี tab)"},"u":"-","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""}
   },
   "geometry": {
    "length": {"v":10.16,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"33 ft 4 in"},
    "span": {"v":10.19,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "height": {"v":3.25,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"10 ft 8 in"},
    "wheelbase": {"v":2.31,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"7 ft 7 in"},
    "main_track": {"v":2.54,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"8 ft 4 in"},
    "fuselage_width": {"v":0.96,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"38 in"},
    "fuselage_height": {"v":1.5,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รวมหลังคาครอบห้องนักบิน"},
    "prop_clearance": {"v":0.25,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"},
    "eye_pos_FRD": {"v":[0.191,0,-0.95],"u":"m FRD","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ที่นั่งหน้า (สมมติตำแหน่งเท่า PC-9 M) 4,061 mm DAT; ที่นั่งเรียงหน้า-หลัง y = 0; ตาสูงกว่า CG 0.95 m"},
    "eye_height_static": {"v":2.2,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG สูง 1.25 m + 0.95 m"}
   }
  }
 }
}
```

`t6a` · aero

```json
{
 "t6a": {
  "aero": {
   "ref": {
    "S": {"v":16.28,"u":"m2","scope":"aircraft","src":["LP7"],"conf":"กลาง","est":false,"note":""},
    "b": {"v":10.19,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "c": {"v":1.65,"u":"m","scope":"aircraft","src":["LP2"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: MAC ของ PC-9 M"}
   },
   "derivatives": {
    "CLq": {"v":{"cruise":6.5125,"approach":6.3675},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CLadot": {"v":{"cruise":1.6944,"approach":1.6184},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CLde": {"v":{"cruise":0.4283,"approach":0.4193},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYb": {"v":{"cruise":-0.6326,"approach":-0.628},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYdr": {"v":{"cruise":0.1975,"approach":0.1951},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CYr": {"v":{"cruise":0.3599,"approach":0.3564},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clb": {"v":{"cruise":-0.0662,"approach":-0.0543},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clp": {"v":{"cruise":-0.4807,"approach":-0.4889},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Clr": {"v":{"cruise":0.0945,"approach":0.2075},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Clda": {"v":{"cruise":0.2268,"approach":0.2309},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cldr": {"v":{"cruise":0.0155,"approach":0.0153},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmq": {"v":{"cruise":-13.2489,"approach":-12.9725},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmadot": {"v":{"cruise":-5.0658,"approach":-4.8384},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cmde": {"v":{"cruise":-1.2803,"approach":-1.2536},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "Cnb": {"v":{"cruise":0.1023,"approach":0.0958},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnp": {"v":{"cruise":-0.0365,"approach":-0.1935},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnr": {"v":{"cruise":-0.1755,"approach":-0.1844},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cnda": {"v":{"cruise":-0.0113,"approach":-0.011},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods"},
    "Cndr": {"v":{"cruise":-0.0911,"approach":-0.09},"u":"1/rad","scope":"aircraft","src":["LM10","LM11","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach 105 kt, MTOW) แกนลำตัว; รอบที่ 1 = –"},
    "CD0": {"v":{"clean":0.02864},"u":"-","scope":"aircraft","src":["LP27","LP16","LP19","LP20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar พาราโบลา (รอบ CL 0) จากการร่อน T-6: 125 KIAS ที่ ~6,000 lb, sink 1,100–1,350 fpm ⇒ L/D 11.3 (ช่วง 9.8–13.18); รวมแรงต้านใบพัด feather; ค่า clean ไม่รวมใบพัดจากความเร็วสูงสุด ≈ 0.02154–0.02547"},
    "K": {"v":{"clean":0.06836},"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: e = 0.73; lm_derivs ให้ e 0.858 (ไม่รวมใบพัด)"}
   },
   "static_long": {
    "CL0": {"v":{"UP":0.25,"TO":0.55,"LDG":0.8},"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CL ที่ α 0 (แกนลำตัว) ปีก PIL15 โค้ง α0L ≈ −2° กับ incidence 1°; แฟลปตาม aero.flaps.detents"},
    "CLalpha": {"v":4.988,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_derivs ทั้งลำ (ปีก 4.6, หาง 4.06, dε/dα 0.421); รอบที่ 1 = 4.8"},
    "Cm0": {"v":{"UP":0.045,"TO":-0.005,"LDG":-0.055},"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1 (CG 25 %MAC); ไม่มีข้อมูล trim สาธารณะ"},
    "Cmalpha": {"v":-0.869,"u":"1/rad","scope":"aircraft","src":["LM10","LM12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG 23 %MAC, h_n 0.404, static margin 0.174; รอบที่ 1 = −0.72"},
    "CLmax_target": {"v":{"UP":1.3984,"LDG":1.7414},"u":"-","scope":"aircraft","src":["LP2","LM1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีความเร็ว stall สาธารณะของ T-6; ใช้ CLmax 1 g ของ PC-9 M (ปีกตระกูลเดียวกัน) ⇒ VS1/VS0 86.3/77.3 KCAS ที่ 6,500 lb"},
    "alpha_star_neg": {"v":{"UP":13,"LDG":9},"u":"deg","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "a1": {"v":22,"u":"1/rad","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CL_sep_at_alpha_star": {"v":{"clean":0.95,"landing":1.1},"u":"-","scope":"aircraft","src":["R1:A9","R1:A10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CDmax_90": {"v":1.4,"u":"-","scope":"aircraft","src":["R1:A9","R1:A10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR เท่ากัน (6.38)"},
    "dCD_sep": {"v":0.2,"u":"-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "CmX": {"v":-0.12,"u":"-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "alpha_star": {"v":{"clean":17.68,"landing":15.83},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โค้ดปัจจุบัน: ศูนย์กลาง blending (aStall, aStall + aStallFlap) ที่ legacy fit แก้ไว้ ใช้แทน α* ของรอบที่ 1 (ยังไม่ได้ปรับจุด X0 ของโมเดล Viterna)"},
    "alpha_CLmax": {"v":{"clean":14.88,"landing":12.76},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ที่ CL ของซิม (trim, นอก ground effect) สูงสุด; CLmax 1.399/1.741"}
   },
   "flaps": {
    "detents": {"v":[{"name":"UP","flap_deg":0,"VFE_kt":null,"dCL0":0,"dCD0":0,"dCm0":0,"CLmax":1.3984},{"name":"TO","flap_deg":23,"VFE_kt":150,"dCL0":0.3,"dCD0":0.02,"dCm0":-0.05,"CLmax":1.5999},{"name":"LDG","flap_deg":50,"VFE_kt":150,"dCL0":0.55,"dCD0":0.06,"dCm0":-0.1,"CLmax":1.7414}],"u":"-","scope":"aircraft","src":["LP5","LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: มุมแฟลป 23°/50° และ VFE 150 kt จาก TCDS; CLmax ของ UP/LDG จากความเร็ว stall ของ PC-9 M; dCL0/dCD0/dCm0 และ CLmax ของ TO เป็นค่าประมาณ (dCL0 ของ LDG เท่ารอบที่ 1 = 0.55)"},
    "transition_time_s": {"v":6,"u":"s","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล; เท่าเวลาล้อ 6 s ของ T-6 [LP21]"}
   },
   "gear_drag": {
    "dCD0": {"v":0.02,"u":"-","scope":"aircraft","src":["R1:A1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1; ไม่มีข้อมูลรายแบบ"}
   },
   "elevator_fade": {
    "alpha_t_star": {"v":22,"u":"deg","scope":"aircraft","src":["R1:A15"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "a_t": {"v":10,"u":"1/rad","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "floor": {"v":0.35,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "separation_dynamics": {
    "tau1": {"v":0.4,"u":"s","scope":"aircraft","src":["R1:A11","R1:A12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); คอร์ดเท่ากัน 1.65 m"},
    "tau2": {"v":0.2,"u":"s","scope":"aircraft","src":["R1:A11","R1:A12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); คอร์ดเท่ากัน 1.65 m"}
   },
   "large_beta": {
    "CY_crossflow": {"v":0.45,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "strip_wing": {
    "kp_roll": {"v":0.661,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "taper": {"v":0.523,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.wing.taper"},
    "dihedral_eff": {"v":6,"u":"deg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.wing.dihedral_deg"},
    "washout": {"v":3,"u":"deg","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "tau_aileron": {"v":0.26,"u":"-","scope":"aircraft","src":["R1:A1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1 (ปรับใหม่เมื่อ Clda ของบัตรนี้ถูกใช้)"},
    "aileron_span_frac": {"v":[0.55,0.97],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแบบสาธารณะ"}
   },
   "buffet": {
    "vertical_filter": {"v":{"w0":75.92,"Q":8.28},"u":"rad/s,-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "lateral_filter": {"v":{"w0":[36.43,64.71],"Q":[4.19,11.99],"gain_ratio":[2,1]},"u":"rad/s,-,-","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rms_full": {"v":{"az":0.05,"ay":0.016},"u":"g","scope":"aircraft","src":["R1:A11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "onset_margin_kt": {"v":3,"u":"kt","scope":"aircraft","src":["LP19"],"conf":"ต่ำ","est":false,"note":"natural stall warning ~3 kt เหนือ stall ชัดเมื่อไม่ประสานแป้น"}
   },
   "stall_warning": {
    "min_margin": {"v":{"shaker_kt":[5,10],"natural_buffet_kt":3},"u":"kt","scope":"aircraft","src":["LP19","LP20"],"conf":"กลาง","est":false,"note":"stick shaker 5–10 kt เหนือ stall (15–16 AOA units), buffet ธรรมชาติราว 3 kt เหนือ stall; แหล่งทุติยภูมิ"},
    "alpha_warn_5kt": {"v":{"clean":11.52,"landing":8.511},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ของ CL เชิงเส้นที่ VS + 5 kt (1 g, ISA SL, MTOW); วิธีเดียวกับ 06-da42"},
    "alpha_warn_design": {"v":{"clean":10.92,"landing":7.7},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: margin 7 kt เผื่อ gust (ตามรอบที่ 1); T-6 จริง: shaker 5–10 kt เหนือ stall [LP19]"}
   },
   "spin_reference": {
    "alpha_spin": {"v":[35,50],"u":"deg","scope":"aircraft","src":["LP27","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T-6: AOA ≥ 18 units ระหว่าง spin (หน่วย AOA ไม่ใช่องศา); ช่วงองศาประมาณจากเครื่องปีกต่ำของ NASA ที่ปรับลงเพราะ spin ของ T-6 ชัน (ความเร็ว 120–135 KIAS)"},
    "turn_rate": {"v":[120,180],"u":"deg/s","scope":"aircraft","src":["LP19","LP20"],"conf":"ต่ำ","est":false,"note":"2–3 s ต่อรอบ (360°/3 s ถึง 360°/2 s)"},
    "omega_hat": {"v":[0.122,0.206],"u":"-","scope":"aircraft","src":["LP27","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ω b/(2V) ที่ 15,000 ft, 120–135 KIAS, 2–3 s ต่อรอบ"},
    "descent_trainer": {"v":[8000,15000],"u":"fpm","scope":"aircraft","src":["LP19","LP20"],"conf":"ต่ำ","est":false,"note":"400–500 ft ต่อรอบ ที่ 2–3 s ต่อรอบ (400 ft/3 s ถึง 500 ft/2 s)"},
    "IYMP": {"v":-0.0114,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Ixx − Iyy)/(m b²) จาก inertia ประมาณ"},
    "recovery_turns_max": {"v":{"aggravated_limit_turns":2,"recovery_alt_loss_ft_per_turn":500,"dive_recovery_ft":[1500,2000]},"u":"turn, ft","scope":"aircraft","src":["LP18","LP19"],"conf":"กลาง","est":false,"note":"spin เกิน 2 รอบ (aggravated) ห้าม; เสียความสูงราว 500 ft ต่อรอบระหว่างกู้ + 1,500–2,000 ft ดึงออกจากดิ่ง; ห้าม spin ต่ำกว่า 10,000 ft หรือสูงกว่า 22,000 ft PA"}
   },
   "legacy": {"v":{"CD0":0.03528,"K":0.08897,"CL0":0.25,"CLa":4.988,"CLflap":0.55,"CDflap":0.06,"CDgear":0.02,"Cm0":0.045,"Cma":-0.869,"Cmflap":-0.1,"aStall":17.68,"aStallFlap":-1.85},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM1","LM0","LP27","LP16","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static ที่ MTOW: polar ของซิม CD = CD0 + K(CL − 0.15)² จากการร่อน (L/D 11.3 ที่ 130.1 kt); aStall/aStallFlap แก้ให้ CLmax 1 g ตรง CLmax_target; ค่าอื่นจาก aero.static_long/flaps; polar from glide 130.1 KCAS E 11.3: CD0s 0.0353 Ks 0.0890; idle 0 (POH glide is at idle, windmilling); climb fit (static): target Vy 140.0 KCAS ROC 3100 fpm → T0 13347 N, Vc 64.6 m/s; WARNING eta 1.05 > 0.95: P too low for the sim's thrust law at this ROC"}
  }
 }
}
```

`t6a` · interference

```json
{
 "t6a": {
  "interference": {
   "downwash": {
    "deda": {"v":0.421,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: DATCOM ผ่าน lm_derivs"},
    "eps0": {"v":0,"u":"rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "l_t": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.l_h"},
    "VH": {"v":0.547,"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: S_h l_t/(S c)"},
    "a_t": {"v":4.06,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หางระดับ AR 4.5"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:U11","R1:U17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "CLadot": {"v":1.694,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "Cmadot": {"v":-5.066,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"}
   },
   "groundEffect": {
    "rMac": {"v":[-0.033,2.28,0.3],"u":"m FRD (y ใช้ ±)","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: c/4 ของ MAC เทียบ CG อ้างอิง; ปีกต่ำ z +0.3 m"},
    "CLa_w": {"v":4.6,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "A": {"v":6.378,"u":"-","scope":"aircraft","src":["LP27"],"conf":"กลาง","est":false,"note":"b²/S"},
    "rEps": {"v":{"a":3.99,"m":0.652},"u":"-","scope":"aircraft","src":["R1:U7","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR 6.37 เท่ารอบที่ 1 (6.38)"},
    "tablesCheck": {"v":{"axes":{"hb":[0.05,0.1,0.15,0.2,0.3,0.5,1]},"data":[[0.345,0.513,0.626,0.707,0.813,0.916,0.985],[1.168,1.12,1.089,1.069,1.043,1.019,1.003],[0.432,0.589,0.686,0.753,0.838,0.921,0.982]]},"u":"-","scope":"aircraft","src":["R1:U7","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); AR เท่ากัน"}
   },
   "slipstream": {
    "diskDiameter": {"v":2.4638,"u":"m","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"97 in"},
    "hubRadius": {"v":0.25,"u":"m","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "hubPos": {"v":[3.8,0,-0.05],"u":"m FRD","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระนาบใบพัดสมมติที่ 0.45 m DAT (datum อยู่ใกล้ปลาย spinner)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":"หมุนตามเข็มนาฬิกาเมื่อมองจากด้านเครื่องยนต์ (จากด้านหลัง)"},
    "kappa": {"v":0.43,"u":"-","scope":"aircraft","src":["R1:U11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "immersionH": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,1,1.1,1.22]},"data":[0,0.175,0.327,0.397,0.464,0.529,0.591,0.663]},"u":"-","scope":"aircraft","src":["R1:U1","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "immersionV": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,1,1.1,1.22]},"data":[0.015,0.161,0.298,0.364,0.427,0.489,0.548,0.616]},"u":"-","scope":"aircraft","src":["R1:U1","R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kSwirl": {"v":0.5,"u":"-","scope":"aircraft","src":["R1:U14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "zSwirl": {"v":0.55,"u":"m","scope":"aircraft","src":["R1:U18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "finLiftSlope": {"v":2.8,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "eta_v": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "blownSpanFactor": {"v":0.9,"u":"D","scope":"aircraft","src":["R1:U10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kBlown": {"v":0.5,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "k_deda_power": {"v":0,"u":"-","scope":"aircraft","src":["R1:U11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "finArea": {"v":2,"u":"m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.S_v"},
    "finArm": {"v":4.7,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า airframe.tail.l_v"},
    "blownArea": {"v":2.64,"u":"m2","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (0.9 D − ความกว้างลำตัว) × คอร์ดโคน"}
   }
  }
 }
}
```

`t6a` · speeds+performance

```json
{
 "t6a": {
  "speeds": {
   "VS1_kt": {"v":86.3,"u":"kt CAS","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีค่าสาธารณะ; CL ของ PC-9 M ที่ 6,500 lb (ความเร็วต่ำสุดแบบ POH) ⇒ ตรวจไขว้: 1.3 VS0 = 100.5 kt ≈ final 100–110 KIAS และ on-speed AOA = 1.3 Vs [LP20][LP21]; JSBSim t6texan2 82.4 KCAS ที่ 6,000 lb"},
   "VS0_kt": {"v":77.3,"u":"kt CAS","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แฟลป LDG ล้อลง idle; วิธีเดียวกับ VS1"},
   "VR_kt": {"v":85,"u":"kt IAS","scope":"aircraft","src":["LP15"],"conf":"กลาง","est":false,"note":"takeoff 85 KIAS แฟลป TO pitch 7–10° (ตารางความเร็วทั่วไปของคู่มือฝึก; ค่าโดยประมาณตามน้ำหนัก)"},
   "VY_kt": {"v":140,"u":"kt IAS","scope":"aircraft","src":["LP15","LP20"],"conf":"ต่ำ","est":false,"note":"climbout 140 KIAS (เทคนิคไต่ 140/160/180 KIAS); ไม่ใช่ Vy จากกราฟ POH"},
   "VG_kt": {"v":125,"u":"kt IAS","scope":"aircraft","src":["LP16","LP19","LP20"],"conf":"กลาง","est":false,"note":"best glide clean (ใบพัด feather จำลองด้วย torque 4–6 %); ล้อลง 105 KIAS"},
   "VREF_kt": {"v":100,"u":"kt CAS","scope":"aircraft","src":["LP27","LP21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = on-speed AOA ที่ MTOW; ที่ 6,000 lb 96.6 kt"},
   "VAPP_kt": {"v":100,"u":"kt IAS","scope":"aircraft","src":["LP20","LP23"],"conf":"ต่ำ","est":false,"note":"final แฟลป LDG 100 KIAS (แฟลป TO 105, ไม่มีแฟลป 110) จาก flashcard; คู่มือ ATC ให้ approach speed เฉลี่ย 110 kt; touchdown 80–95 KIAS; ลดราว 1 kt ต่อเชื้อเพลิง 100 lb ที่ใช้ไป [LP21]"},
   "VA_kt": {"v":227,"u":"kt IAS","scope":"aircraft","src":["LP5","LP20"],"conf":"สูง","est":false,"note":"manoeuvring (สมมาตร); asymmetric 177 KIAS"},
   "VNE_kt": {"v":316,"u":"kt IAS","scope":"aircraft","src":["LP5","LP18"],"conf":"สูง","est":false,"note":"VMO 316 KIAS / MMO 0.67"},
   "VNO_kt": {"v":195,"u":"kt IAS","scope":"aircraft","src":["LP20"],"conf":"ต่ำ","est":false,"note":"max turbulence penetration 195 KIAS (ไม่ใช่ VNO ตามนิยาม FAR 23)"},
   "VFE": {"v":{"TO":150,"LDG":150},"u":"kt IAS","scope":"aircraft","src":["LP5","LP18"],"conf":"สูง","est":false,"note":""},
   "VLE_kt": {"v":150,"u":"kt IAS","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""},
   "VLO_kt": {"v":150,"u":"kt IAS","scope":"aircraft","src":["LP18"],"conf":"สูง","est":false,"note":"gear and/or flaps 150 KIAS"},
   "stall_table": {"v":{"mass_lb":[6000,6500,6900],"UP":[82.9,86.3,88.9],"LDG":[74.3,77.3,79.6]},"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สเกล √W จาก VS1/VS0 ประมาณ"},
   "stall_warning_margin_kt": {"v":[5,10],"u":"kt","scope":"aircraft","src":["LP19","LP20"],"conf":"กลาง","est":false,"note":"stick shaker"},
   "crosswind_demonstrated_kt": {"v":25,"u":"kt","scope":"aircraft","src":["LP18","LP20"],"conf":"กลาง","est":false,"note":"ขีดจำกัดการปฏิบัติ (ไม่ใช่ demonstrated): แห้ง 25, เปียก 10, น้ำแข็ง 5, touch-and-go 20; ลมท้ายวิ่งขึ้น 10 kt"},
   "icao_approach_category": {"v":"B","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 100.5 kt (91–120 kt)"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":3100,"u":"fpm","scope":"aircraft","src":["LP23"],"conf":"ต่ำ","est":false,"note":"climb rate เฉลี่ยในคู่มือ ATC (ไม่ระบุน้ำหนัก/ความเร็ว); GlobalSecurity: initial ROC > 4,500 fpm (ไม่ระบุน้ำหนัก) [LP22]; ฟิสิกส์ที่ MTOW η 0.8 ให้ราว 3,100"},
   "service_ceiling_ft": {"v":31000,"u":"ft","scope":"aircraft","src":["LP5","LP6"],"conf":"สูง","est":false,"note":"ความสูงปฏิบัติการสูงสุด"},
   "cruise_table": {"v":[{"h_ft":1000,"ktas":270,"power":"max","mass_lb":6000,"src":"LB16"},{"h_ft":null,"ktas":280,"note":"cruise (Wikipedia)","src":"LP14"}],"u":"ft, kt TAS","scope":"aircraft","src":["LB16","LP14"],"conf":"กลาง","est":false,"note":"ความเร็วสูงสุดบินระดับ 270 KTAS ที่ 1,000 ft"},
   "glide": {"v":{"speed_kt":130.1,"ratio":11.3},"u":"kt IAS","scope":"aircraft","src":["LP16","LP19","LP20","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 125 KIAS ที่ ~6,000 lb สเกลเป็น MTOW; L/D จาก sink 1,100–1,350 fpm ที่ 3,000–9,000 ft ได้ 9.8–13.18 (ใบพัด feather/แรงขับศูนย์)"},
   "takeoff": {"v":{"ground_roll_m":null,"over50ft_m":null,"distance_ft":1775},"u":"m, ft","scope":"aircraft","src":["LP22"],"conf":"ต่ำ","est":false,"note":"takeoff distance 1,775 ft ที่ระดับน้ำทะเล (ไม่ระบุนิยาม/น้ำหนัก)"},
   "landing": {"v":{"min_runway_ft":4000,"rule":"ground roll + 500 ft หรือ 4,000 ft"},"u":"ft","scope":"aircraft","src":["LP18"],"conf":"กลาง","est":false,"note":"เกณฑ์ความยาวทางวิ่งขั้นต่ำของผู้ใช้ ไม่ใช่ระยะลงจอดจาก POH"},
   "fuel": {"v":{"usable_lb":1100,"max_ff_pph":799,"range_nm":900},"u":"lb, pph, nm","scope":"aircraft","src":["LP21","LP18","LP14"],"conf":"กลาง","est":false,"note":""}
  }
 }
}
```

`t6a` · propulsion+turboprop+propeller

```json
{
 "t6a": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[3.8,0,-0.05],"axis":[1,0,0],"type":"turboprop","model":"PT6A-68","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LP5","LP27"],"conf":"กลาง","est":false,"note":"ตำแหน่งดุมเป็นค่าประมาณ"},
   "legacy": {"v":{"P":820300,"eta":1.051,"T0":13347,"idle":0},"u":"W, -, N, -","scope":"engine","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T0 จากทฤษฎีโมเมนตัม FM 0.55 (lm_card); eta = Vc·T0/P ฟิตให้ ROC ของซิมที่ MTOW = 3100 fpm ที่ VY 140 kt; idle 0 เพราะ polar มาจากการร่อนแรงขับศูนย์; WARNING eta > 0.95"}
  },
  "turboprop": {
   "ratings": {
    "P_rated": {"v":820300,"u":"W","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"1,100 shp (เครื่องยนต์ thermodynamic 1,250 shp ตาม TCDS เครื่องยนต์ [R1:E3])"},
    "T_flat_C": {"v":42.4,"u":"degC","scope":"engine","src":["R1:E3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: flat rating ของ PT6A-68 ที่พิกัดเครื่องยนต์ 932 kW; ที่ 820 kW ของ T-6 น่าจะได้กำลังเต็มถึงอุณหภูมิสูงกว่านี้"},
    "rating_basis": {"v":{"pressure_Pa":101325,"static":true,"bleed":0,"accessory_load":0},"u":"-","scope":"engine","src":["R1:E1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "install_loss_frac": {"v":0,"u":"-","scope":"aircraft","src":["R1:E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Np_max_rpm": {"v":2000,"u":"rpm","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "Np_transient_rpm": {"v":2200,"u":"rpm","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"20 s"},
    "Q_lim": {"v":3917,"u":"N m","scope":"engine","src":["LP27","LP5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: P/ω ที่ 1,100 shp, 2,000 rpm (2,889 lb ft); ห้องนักบินแสดงเป็น % torque (100 % = take-off) [LP18]"},
    "Ng_100pct_rpm": {"v":37468,"u":"rpm","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "Ng_max_pct": {"v":104,"u":"%","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "ITT_max_C": {"v":820,"u":"degC","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"transient 821–870 °C 20 s [LP18]"},
    "ITT_start_C": {"v":1000,"u":"degC","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"5 s"},
    "takeoff_time_limit_s": {"v":"ไม่จำกัด (take-off = max continuous)","u":"s","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":""}
   },
   "steady_map": {
    "Ng_GI_pct": {"v":60.5,"u":"%","scope":"engine","src":["LP18","LP5"],"conf":"กลาง","est":false,"note":"ground idle 60–61 % N1 (pressurization) [LP18]; TCDS: ต่ำสุด 51 %"},
    "Ng_FI_pct": {"v":67,"u":"%","scope":"engine","src":["LP18"],"conf":"กลาง","est":false,"note":"N1 idle ต่ำสุดในอากาศ 67 % (บนพื้น 60–61 %) [LP18]; PMU คง Np 80 % ที่ PCL idle เหนือ 10,000 ft pressure altitude [LP19]"},
    "Ng0_pct": {"v":52,"u":"%","scope":"engine","src":["R1:E8","R1:E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kMap": {"v":2.7,"u":"-","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Pc_frac_vs_Ngc": {"v":{"axes":{"Ngc_pct":[52,60,68,76,84,90,95,100,104]},"data":[0,0.008,0.051,0.154,0.335,0.532,0.743,1,1.241]},"u":"-","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "nITT": {"v":3,"u":"-","scope":"engine","src":["R1:E1","R1:E3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ITTc_vs_Pc": {"v":{"axes":{"Pc_frac":[0,0.05,0.25,0.5,0.75,0.964,1]},"data":[665,682,751,837,923,997,1009]},"u":"K (corrected, ITT_K/theta2)","scope":"engine","src":["R1:E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "dynamics": {
    "tauAcc_s": {"v":0.6,"u":"s","scope":"engine","src":["R1:E4","R1:E6","R1:E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rAcc_pct_s": {"v":10,"u":"%Ng/s","scope":"engine","src":["R1:E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tauDec_s": {"v":0.8,"u":"s","scope":"engine","src":["R1:E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rDec_pct_s": {"v":12,"u":"%Ng/s","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tauITT_s": {"v":1.5,"u":"s","scope":"engine","src":["R1:E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "kITTacc": {"v":4,"u":"K per (%Ng/s)","scope":"engine","src":["R1:E7","R1:E10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "cert_accel_FI_to_95pct_max_s": {"v":5,"u":"s","scope":"engine","src":["R1:E4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); 14 CFR 33.73 ใช้กับเครื่องยนต์ทุกแบบ"}
   },
   "airframe_coupling": {
    "I_gg": {"v":0.12,"u":"kg m2","scope":"engine","src":["R1:E11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gg_rotation_rel_prop": {"v":-1,"u":"-","scope":"engine","src":["R1:E6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "spin": {"v":1,"u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"ใบพัดหมุนตามเข็มจากด้านหลัง ⇒ แรงบิดปฏิกิริยาม้วนซ้าย สอดคล้องกับ roll-off ซ้ายที่ torque > 60 % ของ T-6 [LP19]"},
    "thrust_axis_body": {"v":[1,0,0],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล"}
   },
   "fuel": {
    "psfc": {"v":0.669,"u":"lb/(hp h)","scope":"engine","src":["R1:E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ตัวยึดตำแหน่ง; T-6 อัตราการไหลสูงสุด 799 PPH [LP18]"}
   },
   "derived_vtbd": {
    "P_avail_vs_OAT_SL": {"v":{"axes":{"OAT_C":[15,25,31,34,37,38,40,45]},"data":[820,820,820,820,820,820,820,820]},"u":"kW","scope":"engine","src":["R1:E1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: flat rating ถึง 46 °C แล้วลด 1.35 %/°C (ความชันเดียวกับตารางรอบที่ 1); T-6: 820 kW ต่ำกว่าพิกัดเครื่องยนต์ 932 kW จึงคาดว่า flat ถึงราว 46 °C"},
    "P_avail_static_grid": {"v":{"axes":{"alt_ft":[0,2500,5000,7500,10000,15000,20000],"isa_dev_C":[0,10,20,25]},"data":[[820,820,820,820],[820,820,820,820],[820,820,820,819],[820,820,804,775],[820,815,759,731],[768,718,668,646],[668,626,584,565]]},"u":"kW","scope":"engine","src":["R1:E1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตารางรอบที่ 1 × 932/700 แล้วตัดที่ 820 kW"}
   },
   "reference_engines": {
    "PT6A-68": {"v":{"P_kW":932,"flat_C":42.4,"ITT_C":820,"Np_rpm":2000,"Np_trans_rpm_20s":2200,"Ng_max_pct":104,"jet_N":823},"u":"mixed","scope":"engine","src":["R1:E3"],"conf":"สูง","est":false,"note":"EASA TCDS IM.E.038 (พิกัดเครื่องยนต์); ใน T-6 จำกัด 1,100 shp"}
   }
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed_feathering","u":"-","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "model": {"v":"Hartzell HC-E4A-2 / E9612","u":"-","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":4,"u":"-","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":2.4638,"u":"m","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":"97 in"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LP5"],"conf":"สูง","est":false,"note":"clockwise viewed from engine side"},
    "massComplete": {"v":68.9,"u":"kg","scope":"propeller","src":["R1:P3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); ใบพัดคนละรุ่น (E9612)"},
    "hubPosition": {"v":[3.8,0,-0.05],"u":"m FRD","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่า interference.slipstream.hubPos"},
    "thrustAxis": {"v":[1,0,0],"u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล right/down thrust"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":820.3,"u":"kW","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"1,100 shp take-off = max continuous"},
    "rpmGoverned": {"v":2000,"u":"rpm","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":""},
    "rpmTransientLimit": {"v":2200,"u":"rpm","scope":"engine","src":["LP5"],"conf":"สูง","est":false,"note":"20 s"},
    "gearRatio": {"v":15.07,"u":"-","scope":"engine","src":["R1:P4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); PT6A-68 ใช้ power turbine รอบใกล้เคียง (ไม่ยืนยัน)"},
    "flightIdleShaftPower": {"v":20,"u":"kW","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "bladeGeometry": {
    "hubRadiusRatio": {"v":0.18,"u":"r/R","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "chordOverD": {"v":{"axes":{"x":[0.18,0.25,0.35,0.45,0.55,0.65,0.75,0.85,0.92,0.97,1]},"data":[0.058,0.064,0.07,0.073,0.074,0.073,0.071,0.066,0.06,0.052,0.04]},"u":"c/D","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "twistDesignJ": {"v":1.1,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "activityFactor": {"v":100,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"}
   },
   "section": {
    "liftSlope": {"v":5.78,"u":"1/rad","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "alpha0": {"v":-3,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "alphaStallPos": {"v":14,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "alphaStallNeg": {"v":-11,"u":"deg","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "stallBlendM": {"v":10,"u":"1/rad","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "cd0": {"v":0.0085,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "kcd": {"v":0.01,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "Mdd": {"v":0.8,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "stallDelayFactor": {"v":3,"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"}
   },
   "tables": {
    "CT": {"v":{"axes":{"J":[0,0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8,2,2.2,2.4],"beta75_deg":[10,15,20,25,30,35,40,45,50,55,60]},"data":[[0.1312,0.1855,0.229,0.2538,0.2528,0.2271,0.1868,0.1487,0.1311,0.1165,0.1011],[0.0954,0.1557,0.2104,0.25,0.2645,0.2507,0.2177,0.1709,0.1434,0.1276,0.1123],[0.0473,0.1117,0.1753,0.2296,0.2664,0.2782,0.2506,0.2058,0.1574,0.1364,0.1203],[-0.0125,0.0551,0.1272,0.1937,0.2476,0.2797,0.2831,0.2563,0.191,0.1471,0.1275],[-0.0805,-0.0111,0.0664,0.1449,0.2137,0.2664,0.2926,0.2871,0.2645,0.1706,0.1376],[-0.1521,-0.0829,-0.0028,0.0835,0.167,0.2373,0.2871,0.3051,0.2902,0.263,0.1538],[-0.2218,-0.1567,-0.0764,0.0139,0.1086,0.1952,0.2654,0.3096,0.3164,0.2915,0.2606],[-0.2872,-0.2292,-0.1521,-0.06,0.0405,0.1428,0.2305,0.2978,0.3323,0.3245,0.29],[-0.3506,-0.2984,-0.2273,-0.1365,-0.0319,0.0787,0.1852,0.2723,0.3327,0.352,0.3268],[-0.4167,-0.3654,-0.3006,-0.2139,-0.1079,0.0093,0.1294,0.236,0.3187,0.3661,0.3639],[-0.4897,-0.4338,-0.3719,-0.2909,-0.1862,-0.0642,0.0649,0.1908,0.2933,0.3657,0.392],[-0.5725,-0.5075,-0.4431,-0.3666,-0.2657,-0.1415,-0.0044,0.1347,0.2584,0.3527,0.4064],[-0.5784,-0.5898,-0.5177,-0.4418,-0.3455,-0.2216,-0.0784,0.0714,0.2149,0.329,0.4068]]},"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "CP": {"v":{"axes":{"J":[0,0.2,0.4,0.6,0.8,1,1.2,1.4,1.6,1.8,2,2.2,2.4],"beta75_deg":[10,15,20,25,30,35,40,45,50,55,60]},"data":[[0.0478,0.0823,0.1228,0.1642,0.202,0.2358,0.2678,0.3008,0.3393,0.3732,0.3989],[0.0427,0.0804,0.1269,0.1757,0.2197,0.2561,0.2894,0.3198,0.3602,0.4038,0.4426],[0.0285,0.0686,0.1216,0.1803,0.2374,0.2859,0.317,0.3448,0.3741,0.4213,0.4689],[0.0006,0.0423,0.1024,0.1724,0.2442,0.3079,0.3566,0.3901,0.4016,0.4342,0.4863],[-0.0432,-0.0016,0.0635,0.1466,0.2356,0.321,0.3897,0.4367,0.4783,0.458,0.5025],[-0.1013,-0.0628,0.0042,0.097,0.2058,0.3155,0.4138,0.4845,0.528,0.571,0.5247],[-0.1672,-0.1385,-0.0736,0.0242,0.1502,0.2864,0.4175,0.5261,0.5939,0.6329,0.6794],[-0.2332,-0.2223,-0.1668,-0.0684,0.0669,0.2311,0.3957,0.5469,0.6596,0.7181,0.7529],[-0.2968,-0.3076,-0.2701,-0.1783,-0.0377,0.1428,0.3463,0.5408,0.7069,0.813,0.8558],[-0.362,-0.3913,-0.3773,-0.3011,-0.1617,0.0309,0.2648,0.5062,0.7274,0.897,0.9816],[-0.4347,-0.4751,-0.4841,-0.4312,-0.3018,-0.1024,0.1522,0.4426,0.7188,0.9567,1.1104],[-0.5194,-0.5638,-0.5895,-0.5632,-0.4529,-0.2544,0.0172,0.3434,0.6815,0.9879,1.2226],[-0.4256,-0.662,-0.6958,-0.6931,-0.609,-0.4205,-0.1378,0.2169,0.616,0.9907,1.3089]]},"u":"-","scope":"propeller","src":["R1:P10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "CNmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2],"beta75_deg":[10,15,20,25,30,35,40]},"data":[[0.0246,0.0331,0.0417,0.0364,0.0537,0.0625,0.0738],[0.0306,0.0409,0.0499,0.0576,0.0647,0.0738,0.0749],[0.0372,0.0513,0.0629,0.0713,0.0764,0.0799,0.0879],[0.0399,0.0593,0.0797,0.0901,0.0969,0.0975,0.0956],[0.0366,0.0617,0.0884,0.1148,0.122,0.1253,0.119],[0.027,0.0568,0.0913,0.1256,0.1573,0.1574,0.1544]]},"u":"-","scope":"propeller","src":["R1:P6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "CMmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2],"beta75_deg":[10,15,20,25,30,35,40]},"data":[[0.0336,0.0445,0.0512,0.0497,0.0482,0.0412,0.0347],[0.0307,0.0441,0.0528,0.0566,0.0546,0.0484,0.0393],[0.0254,0.0416,0.054,0.0602,0.0609,0.0545,0.0456],[0.0174,0.0353,0.0531,0.063,0.067,0.0638,0.053],[0.007,0.0264,0.0463,0.0651,0.0714,0.0727,0.0648],[-0.0046,0.0153,0.0373,0.0586,0.078,0.0791,0.0766]]},"u":"-","scope":"propeller","src":["R1:P6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"}
   },
   "inertia": {
    "Ip": {"v":14,"u":"kg m2","scope":"propeller","src":["R1:P2","R1:P3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "IreflectedEngine": {"v":0,"u":"kg m2","scope":"engine","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"}
   },
   "governor": {
    "kGov": {"v":1,"u":"deg/s per rpm","scope":"propeller","src":["R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "pitchRateMax": {"v":20,"u":"deg/s","scope":"propeller","src":["R1:P8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "rpmOverspeed": {"v":2100,"u":"rpm","scope":"propeller","src":["R1:P8","R1:P4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "oilMinRpm": {"v":200,"u":"rpm","scope":"propeller","src":["R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "featherRate": {"v":15,"u":"deg/s","scope":"propeller","src":["R1:P8","R1:P1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "betaFlightIdle": {"v":11.74,"u":"deg @0.75R","scope":"propeller","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูล T-6; ใช้ของ PC-9 M"},
    "betaFeather": {"v":85.2,"u":"deg @0.75R","scope":"propeller","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ของ PC-9 M"}
   },
   "feathered": {
    "bladePlanformArea": {"v":0.66,"u":"m2","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "CDfeathered": {"v":0.06,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"}
   },
   "checks": {
    "peakEfficiency": {"v":0.88,"u":"-","scope":"propeller","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ"},
    "momentumIdealStaticISA": {"v":19.88,"u":"kN","scope":"propeller","src":["LP27"],"conf":"กลาง","est":false,"note":"(2ρA)^(1/3) P^(2/3), D 2.4638 m, 820.3 kW"},
    "staticThrustISA": {"v":13.35,"u":"kN","scope":"propeller","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ทฤษฎีโมเมนตัม FM 0.55 (ค่าเริ่มต้นของ lm_card); BEM ของรอบที่ 1 ที่ 700 kW ได้ 12.36 kN (FM 0.58)"},
    "staticThrustVTBD31C": {"v":13.11,"u":"kN","scope":"propeller","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สเกล ρ^(1/3) ที่ 31 °C (ρ 1.160) กำลังเต็มเพราะ flat rating"}
   },
   "betaReverse": {
    "reverseAvailable": {"v":false,"u":"-","scope":"propeller","src":["LP5"],"conf":"กลาง","est":false,"note":"ไม่มี reverse/beta บนพื้น (เครื่องฝึก)"}
   }
  }
 }
}
```

`t6a` · controls

```json
{
 "t6a": {
  "controls": {
   "architecture": {"v":{"pitch":"reversible","roll":"reversible","yaw":"reversible","trim":"tab (elevator, rudder) + aileron biased spring + rudder trim aid device"},"u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"T-6 มี Trim Aid Device ช่วย trim rudder อัตโนมัติ (ทำงานเมื่อ weight off wheels เหนือ 80 KIAS [LP21])"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":18,"down":16},"rate_dps":null,"actuator_tau_s":null},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"±1°; ระบบกลไก ไม่มี actuator"},
    "aileron": {"v":{"travel_deg":{"up":20,"down":11}},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"differential"},
    "rudder": {"v":{"travel_deg":{"left":24,"right":24}},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"ห้ามใช้ rudder เต็มเหนือ 150 KIAS [LP18]"},
    "flap": {"v":{"travel_deg":{"TO":23,"LDG":50}},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"สองขั้น"},
    "trim_tab": {"v":{"elevator_tab":{"up":5.5,"down":22},"rudder_tab":{"right":6,"left":11}},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"aileron trim = biased centering spring"},
    "speedbrake": {"v":{"travel_deg":67.5},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"speedbrake ใต้ลำตัว; flashcard ให้ 70°"}
   },
   "trim": {"v":{"kind":"electric (elevator, rudder, aileron spring bias)","elevator_tab_deg":{"up":5.5,"down":22},"rudder_tab_deg":{"right":6,"left":11}},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"ระยะ tab จาก TCDS; ชนิดตัวขับไม่ยืนยัน"},
   "pitch": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":""},
    "S_e": {"v":1.1,"u":"m2","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_e": {"v":0.3,"u":"m","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":2.4,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch0": {"v":0,"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_alpha": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["R1:C15","R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["R1:C15","R1:C16","R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_tab": {"v":-0.2005,"u":"1/rad","scope":"aircraft","src":["R1:C16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate_flaps_down": {"v":1,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate_flaps_up": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":4.45,"u":"N","scope":"aircraft","src":["R1:C19","R1:C20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "friction": {"v":4.45,"u":"N","scope":"aircraft","src":["R1:C18","R1:C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "centring_spring": {"v":{"Kc":60,"qFade":400},"u":"N/rad, Pa","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":70,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "a_t": {"v":4.06,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "tau_e": {"v":0.636,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: cf/c 0.40 × ตัวคูณความหนืด 0.85"},
    "l_t": {"v":4.9,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "deda": {"v":0.421,"u":"-","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "tab_max": {"v":22,"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"elevator tab ขึ้น 5.5° ลง 22°"},
    "stops": {"v":{"teu":18,"ted":16},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""}
   },
   "roll": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":""},
    "S_a_each": {"v":0.65,"u":"m2","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_a": {"v":0.25,"u":"m","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":3.88,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.1719,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_alpha": {"v":-0.0573,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate": {"v":1,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":3,"u":"N","scope":"aircraft","src":["R1:C18","R1:C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":80,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tab_max": {"v":0,"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"ไม่มี aileron tab; trim ด้วย biased centering spring"},
    "stops": {"v":{"max":20,"up":20,"down":11},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""}
   },
   "yaw": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"+ trim aid device (rudder trim อัตโนมัติตามกำลัง/ความเร็ว)"},
    "S_r": {"v":0.85,"u":"m2","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_r": {"v":0.32,"u":"m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "gearing": {"v":4.85,"u":"rad/m","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Ch_beta": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "slipstream_q_ratio": {"v":[1,2],"u":"-","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trim_rate": {"v":1.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "breakout": {"v":13.3,"u":"N","scope":"aircraft","src":["R1:C14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "tab_max": {"v":11,"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"rudder trim tab ขวา 6° ซ้าย 11°"},
    "stops": {"v":{"max":24},"u":"deg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"±24°"}
   }
  }
 }
}
```

`t6a` · gear

```json
{
 "t6a": {
  "gear": {
   "layout": {"v":"tricycle_retract","u":"-","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":""},
   "retract": {"v":{"time_s":6,"VLO_kt":150,"VLE_kt":150},"u":"s, kt","scope":"aircraft","src":["LP21","LP5"],"conf":"ต่ำ","est":false,"note":"เวลาเก็บ/กางล้อ 6 s (flashcard)"},
   "geometry": {
    "nose_contact_body_extended": {"v":[2.033,0,1.33],"u":"m FRD","scope":"aircraft","src":["LP27","LP5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: wheelbase 2.31 m, โหลดล้อหน้า 12 % (ค่าประมาณ), CG จอดสูง 1.25 m, ช่วงยืด 0.08 m"},
    "main_contact_body_extended": {"v":[[-0.277,-1.27,1.35],[-0.277,1.27,1.35]],"u":"m FRD","scope":"aircraft","src":["LP27","LP5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: track 2.54 m"},
    "cg_height_parked": {"v":1.25,"u":"m","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1 1.30 m"}
   },
   "strut_main": {
    "kind": {"v":"oleo","u":"-","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: oleo-pneumatic (ไม่ยืนยันชนิดย่อย)"},
    "stroke": {"v":0.25,"u":"m","scope":"gear","src":["R1:G3","R1:G4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "p_static": {"v":300,"u":"psi","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "piston_area": {"v":0.00463,"u":"m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "ratio_static_to_extended": {"v":2.5,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "ratio_compressed_to_extended": {"v":8,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "polytropic_n_dynamic": {"v":1.12,"u":"-","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "polytropic_n_static": {"v":1,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "Kh_compression": {"v":4000,"u":"N/(m/s)^2","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "Kr_rebound": {"v":48000,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "c_linear": {"v":2000,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"},
    "seal_friction_ratio": {"v":0,"u":"-","scope":"gear","src":["R1:G8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน); มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area"}
   },
   "strut_nose": {
    "kind": {"v":"oleo","u":"-","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ:"},
    "stroke": {"v":0.2,"u":"m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "p_static": {"v":300,"u":"psi","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "piston_area": {"v":0.00141,"u":"m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_static_to_extended": {"v":2.5,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "ratio_compressed_to_extended": {"v":8,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kh_compression": {"v":1600,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "Kr_rebound": {"v":19000,"u":"N/(m/s)^2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "c_linear": {"v":1000,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "tyre_main": {
    "size": {"v":{"size":"20x4.4","type":"VII (high pressure)"},"u":"-","scope":"gear","src":["LP5"],"conf":"สูง","est":false,"note":"CMM 133-590075-0045"},
    "operating_pressure": {"v":[225,185],"u":"psi","scope":"gear","src":["LP21"],"conf":"ต่ำ","est":false,"note":"ยางแรงดันสูง 225 ± 5 หรือยางแรงดันต่ำ 185 ± 5 psi (flashcard)"},
    "rated_pressure": {"v":225,"u":"psi","scope":"gear","src":["LP21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีตาราง TRA; ใช้แรงดันใช้งาน"},
    "rated_load": {"v":18174,"u":"N","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โหลดสถิตต่อล้อ 12722 N ÷ 0.7"},
    "outside_diameter": {"v":0.508,"u":"m","scope":"gear","src":["LP5"],"conf":"สูง","est":false,"note":"20 in (ชื่อขนาด)"},
    "section_width": {"v":0.112,"u":"m","scope":"gear","src":["LP5"],"conf":"สูง","est":false,"note":"4.4 in"},
    "k_vertical": {"v":500863,"u":"N/m","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยุบสถิต ≈ 25 % ของความสูงหน้ายาง (OD 20 in, ขอบล้อ ~12 in ⇒ สูง 4 in)"},
    "rolling_radius": {"v":0.244,"u":"m","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: r − δ/3"},
    "c_vertical": {"v":3500,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "relaxation_length": {"v":0.3,"u":"m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "k_longitudinal": {"v":246000,"u":"N/m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "mu_peak_dry": {"v":0.8,"u":"-","scope":"gear","src":["R1:G12","R1:G19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "mu_skid_ratio_dry": {"v":0.75,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "mu_skid_ratio_wet": {"v":0.5,"u":"-","scope":"gear","src":["R1:G11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "wheel_inertia": {"v":0.33,"u":"kg m2","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "tyre_nose": {
    "size": {"v":{"size":"16x4.4","type":"VII"},"u":"-","scope":"gear","src":["LP5"],"conf":"สูง","est":false,"note":"CMM 133-590075-0021"},
    "operating_pressure": {"v":120,"u":"psi","scope":"gear","src":["LP21"],"conf":"ต่ำ","est":false,"note":"120 ± 5 psi (flashcard)"},
    "rated_pressure": {"v":120,"u":"psi","scope":"gear","src":["LP21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้แรงดันใช้งาน"},
    "rated_load": {"v":4957,"u":"N","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โหลดสถิต 3470 N ÷ 0.7"},
    "outside_diameter": {"v":0.406,"u":"m","scope":"gear","src":["LP5"],"conf":"สูง","est":false,"note":"16 in"},
    "k_vertical": {"v":136599,"u":"N/m","scope":"gear","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับล้อหลัก"},
    "c_vertical": {"v":1200,"u":"N s/m","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "relaxation_length": {"v":0.22,"u":"m","scope":"gear","src":["R1:G9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "brakes": {
    "force_limit_ratio": {"v":0.6,"u":"-","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "pressure_rise_rate": {"v":2.5,"u":"1/s","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "heat_sink_mass": {"v":6,"u":"kg","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "heat_sink_cool_tau": {"v":900,"u":"s","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "fade_start_temp": {"v":400,"u":"degC","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "fade_full_temp": {"v":700,"u":"degC","scope":"gear","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "antiskid": {"v":0,"u":"bool","scope":"aircraft","src":["LP5"],"conf":"กลาง","est":false,"note":"ไม่มี antiskid (เครื่องฝึก; ไม่พบในเอกสาร)"}
   },
   "steering": {
    "mode": {"v":{"type":"pedal_linked","powered_NWS":true,"caster_with_diff_brake":true},"u":"-","scope":"aircraft","src":["LP28","LP20","LP21"],"conf":"กลาง","est":false,"note":"nosewheel steering ไฮดรอลิก (ต้องการ 1,800 psi [LP20]) ±12° [LP28]; เลี้ยวแคบกว่านั้นปลด NWS แล้วใช้ rudder + เบรกแยกข้าง (ล้อหน้าหมุนอิสระ)"},
    "pedal_max": {"v":12,"u":"deg","scope":"aircraft","src":["LP28","LP20"],"conf":"กลาง","est":false,"note":"NWS ±12° จากศูนย์กลาง (P-868 หน้า 4-8 [LP28]); flashcard [LP20] ให้ช่วง NWS 24° รวม ซึ่งตรงกัน"},
    "caster_max": {"v":80,"u":"deg","scope":"aircraft","src":["LP21"],"conf":"ต่ำ","est":false,"note":"flashcard [LP21] ให้ 160° รวม (80° ต่อข้าง) และเรียกว่า NWS range; ตีความเป็นช่วงหมุนอิสระเมื่อปลด NWS เพราะ [LP28][LP20] ให้ NWS ±12° (ยังไม่ยืนยัน)"},
    "steer_rate": {"v":60,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "shimmy_lag": {"v":0.05,"u":"s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   },
   "certification": {
    "part23_limit_descent": {"v":{"formula":"V = 4.4 (W/S)^0.25 fps, 7..10 fps","W_S_lb_ft2":37.09,"fps":10,"mps":3.048},"u":"fps","scope":"aircraft","src":["R1:G3","LP27"],"conf":"กลาง","est":false,"note":"14 CFR 23.473(d); W/S สูงพอให้ได้ค่าสูงสุด 10 fps"},
    "part23_wing_lift_ratio": {"v":0.667,"u":"-","scope":"aircraft","src":["R1:G3","R1:G4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "part23_min_load_factors": {"v":{"inertia":2.67,"ground_reaction":2},"u":"g","scope":"aircraft","src":["R1:G3"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "part23_reserve_drop_factor": {"v":1.44,"u":"x drop height","scope":"aircraft","src":["R1:G5"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"}
   }
  }
 }
}
```

`t6a` · wind+validation+input

```json
{
 "t6a": {
  "wind": {
   "wake": {
    "b0_over_b": {"v":0.7854,"u":"-","scope":"aircraft","src":["R1:W19"],"conf":"กลาง","est":false,"note":"π/4 (แรงยกแบบวงรี)"},
    "rc_over_b": {"v":{"default":0.035,"min":0.02,"max":0.06},"u":"-","scope":"aircraft","src":["R1:W19","R1:W24"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)"},
    "trainerRollControl": {"v":{"Clda":0.2309,"daMax_deg":15.5,"ClMax":0.0625},"u":"-, deg","scope":"aircraft","src":["LM10","LP5","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: อำนาจม้วนสูงสุด Clda × ค่าเฉลี่ยมุม aileron"}
   },
   "fFactor": {
    "trainerExcessTW": {"v":0.1794,"u":"-","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Tmax − D)/W ที่ Vapp 100 kt แฟลปสุด ล้อลง ISA+16 ระดับน้ำทะเล ด้วยกฎแรงขับของซิมและ legacy ของบัตรนี้ (นิยามรอบที่ 1)"}
   }
  },
  "validation": {
   "classification": {
    "hqClassCategory": {"v":{"class":"I","approachLanding":"C","cruiseClimb":"B","takeoff":"C","aerobatics":"A"},"u":"-","scope":"aircraft","src":["R1:V7","R1:V10","R1:C12"],"conf":"กลาง","est":false,"note":"MIL-F-8785C: primary trainer = Class I; ผาดแผลง/spin = Category A"}
   },
   "procedures": {
    "v50MinFactor_singleEngine": {"v":1.2,"u":"× VS1","scope":"aircraft","src":["R1:V17"],"conf":"กลาง","est":false,"note":"14 CFR 23.53 (ก่อน amdt 23-64)"}
   },
   "trim_targets": {
    "cruise": {"v":{"ias_kt":200,"h_ft":3000,"power":"≈53 % torque, pitch 0°"},"u":"kt, ft","scope":"aircraft","src":["LP15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: บินระดับ 200 KIAS ที่ 3,000 ft: torque 50 % + 1 %/1,000 ft, pitch 0° ตามตารางของคู่มือฝึก [LP15]"},
    "approach": {"v":{"ias_kt":100,"h_m":300,"gamma_deg":-3,"flap":"LDG","gear":"down"},"u":"kt, m, deg","scope":"aircraft","src":["LP20","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: final แฟลป LDG 100 KIAS [LP20] γ −3° 300 m"}
   },
   "takeoff_test": {"v":{"flap":"TO","VR_kt":85,"theta_deg":8.5},"u":"kt, deg","scope":"aircraft","src":["LP15"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: takeoff 85 KIAS แฟลป TO pitch 7–10° [LP15]"},
   "currentModel": {
    "performance": {"v":{"VSR_clean_kt":88.52,"Vmin_clean_kt":82.79,"VSR_full_kt":79.33,"Vmin_full_kt":73.78,"Vy_SL_kt":140.6,"ROCmax_SL_fpm":3134,"glideLD_zeroThrust":11.3,"Vbg_kt":129.8,"glideLD_idle":11.3,"TO_groundRoll_m":408,"TO_50ft_m":688,"LDG_50ft_maxBrake_m":769,"LDG_50ft_asIs_m":992},"u":"kt, fpm, -, m","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: โมเดลวันนี้ (src/ @ cabf0f0) + aero.legacy/propulsion.legacy ของบัตรนี้ ที่ 2948.3 kg ISA ลมสงบ (lm_card runCard); ความเร็ว KEAS ของซิม; ใช้เป็น regression ไม่ใช่ค่าจริง"},
    "approach": {"v":{"sp_wn":2.269,"sp_zeta":0.5057,"CAP":1.131,"nAlpha":4.552,"ph_T_s":26.04,"ph_zeta":0.1373,"dr_wn":1.686,"dr_zeta":0.1592,"dr_zetaWn":0.2684,"tauR_s":0.4012,"spiral_t2_s":22.31,"spiral_divergent":true,"trim_alpha_deg":3.705,"trim_theta_deg":0.7049,"trim_de_deg":-5.082,"trim_thr":0.3459},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 100 kt แฟลปสุด ล้อลง 300 m γ −3° ที่ 2948.3 kg"},
    "cruise": {"v":{"sp_wn":4.515,"sp_zeta":0.4861,"CAP":1.119,"nAlpha":18.21,"ph_T_s":53.33,"ph_zeta":0.1343,"dr_wn":3.253,"dr_zeta":0.1409,"dr_zetaWn":0.4582,"tauR_s":0.2055,"spiral_t2_s":45.6,"spiral_divergent":true,"trim_alpha_deg":0.1072,"trim_theta_deg":0.1072,"trim_de_deg":1.982,"trim_thr":0.563},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 200 kt clean 3,000 ft ระดับ ที่ 2948.3 kg"}
   }
  },
  "input": {
   "keyboard": {
    "interim_trim_rate_elevator": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["R1:params-trainer.json"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ารอบที่ 1"},
    "flap_notches": {"v":[0,0.5455,1],"u":"-","scope":"sim","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: AC.flaps ของขั้น UP/TO/LDG แบบ lift (dCL0 0/0.30/0.55) ⇒ 0, 0.545, 1; มุมจริง 0/23/50° [LP1][LP2][LP5]"}
   }
  }
 }
}
```

`t6c` · _meta+airframe

```json
{
 "t6c": {
  "_inherits": {"v":"t6a","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"T-6C = T-6B (ห้องนักบินกระจก HUD, HOTAS) + hardpoint ใต้ปีก; โครงสร้าง เครื่องยนต์ ใบพัดเดียวกับ T-6A [LP14]; ผู้ใช้ทางทหารในไทยใช้รุ่นส่งออกของ T-6C"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Textron Aviation Defense","model":"Model 3000 (T-6C Texan II)","variant":"T-6C (glass cockpit, 2 จุดติดถังภายนอก)","engine":"P&WC PT6A-68A 1,100 shp","propeller":"Hartzell HC-E4A-2 + 4× E9612, 2.46 m","seats":2,"category":"normal/aerobatic","tc_ref":"EASA TCDS IM.A.636 (Model 3000 PM series)"},"u":"-","scope":"aircraft","src":["LP8","LP5"],"conf":"กลาง","est":false,"note":""},
   "weights": {
    "MTOW": {"v":3129.8,"u":"kg","scope":"aircraft","src":["LP8","LP5"],"conf":"สูง","est":false,"note":"6,900 lb; LP7 ให้ 8,300 lb เมื่อมี stores"},
    "MLW": {"v":3129.8,"u":"kg","scope":"aircraft","src":["LP8","LP5"],"conf":"สูง","est":false,"note":"6,900 lb"},
    "MRW": {"v":3152.5,"u":"kg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"6,950 lb"},
    "MZFW": {"v":2653.5,"u":"kg","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"5,850 lb"},
    "BEW_typical": {"v":2336,"u":"kg","scope":"aircraft","src":["LP8"],"conf":"กลาง","est":false,"note":"5,150 lb (LP7: 5,170 lb)"},
    "useful_load": {"v":793.8,"u":"kg","scope":"aircraft","src":["LP27","LP8"],"conf":"กลาง","est":false,"note":"MTOW − BEW"},
    "training_mass": {"v":{"kg":2775.5,"BEW":2336,"crew":190,"fuel":249.5},"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEW + 2 × 95 kg + เชื้อเพลิงครึ่งถัง; เทียบใช้ --mass 3129.8"}
   },
   "cg": {
    "envelope": {"v":[[2653.5,4.1826,4.3015],[3129.8,4.2024,4.3015],[3152.5,4.2024,4.3015]],"u":"kg, m DAT","scope":"aircraft","src":["LP5"],"conf":"สูง","est":false,"note":"ตารางของ Model 3000 PM series ตรงกับน้ำหนัก T-6C"}
   },
   "inertia": {
    "ref_mass": {"v":3129.8,"u":"kg","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: inertia ของ t6a × 6,900/6,500"},
    "Ixx": {"v":5535,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii ที่ 6,900 lb"},
    "Iyy": {"v":9227,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii ที่ 6,900 lb"},
    "Izz": {"v":12961,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam radii ที่ 6,900 lb"}
   }
  }
 }
}
```

`t6c` · aero

```json
{
 "t6c": {
  "aero": {
   "legacy": {"v":{"CD0":0.0353,"K":0.0889,"CL0":0.25,"CLa":4.988,"CLflap":0.55,"CDflap":0.06,"CDgear":0.02,"Cm0":0.045,"Cma":-0.869,"Cmflap":-0.1,"aStall":17.68,"aStallFlap":-1.85},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM1","LM0","LP27","LP16","LP19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lm_legacy_fit โหมด static ที่ MTOW: polar ของซิม CD = CD0 + K(CL − 0.15)² จากการร่อน (L/D 11.3 ที่ 134 kt); aStall/aStallFlap แก้ให้ CLmax 1 g ตรง CLmax_target; ค่าอื่นจาก aero.static_long/flaps; polar from glide 134.0 KCAS E 11.3: CD0s 0.0353 Ks 0.0889; idle 0 (POH glide is at idle, windmilling); climb fit (static): target Vy 140.0 KCAS ROC 2850 fpm → T0 13347 N, Vc 64.3 m/s; WARNING eta 1.05 > 0.95: P too low for the sim's thrust law at this ROC"},
   "static_long": {
    "alpha_star": {"v":{"clean":17.68,"landing":15.83},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โค้ดปัจจุบัน: ศูนย์กลาง blending (aStall, aStall + aStallFlap) ที่ legacy fit แก้ไว้ ใช้แทน α* ของรอบที่ 1 (ยังไม่ได้ปรับจุด X0 ของโมเดล Viterna)"},
    "alpha_CLmax": {"v":{"clean":14.88,"landing":12.76},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ที่ CL ของซิม (trim, นอก ground effect) สูงสุด; CLmax 1.399/1.741"}
   },
   "stall_warning": {
    "alpha_warn_5kt": {"v":{"clean":11.57,"landing":8.573},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ของ CL เชิงเส้นที่ VS + 5 kt (1 g, ISA SL, MTOW); วิธีเดียวกับ 06-da42"},
    "alpha_warn_design": {"v":{"clean":10.98,"landing":7.781},"u":"deg","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: margin 7 kt เผื่อ gust (ตามรอบที่ 1); T-6 จริง: shaker 5–10 kt เหนือ stall [LP19]"}
   }
  }
 }
}
```

`t6c` · speeds+performance

```json
{
 "t6c": {
  "speeds": {
   "VS1_kt": {"v":88.9,"u":"kt CAS","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CL ของ PC-9 M ที่ 6,900 lb"},
   "VS0_kt": {"v":79.7,"u":"kt CAS","scope":"aircraft","src":["LP2","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เหมือนกัน"},
   "VREF_kt": {"v":104,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0"},
   "icao_approach_category": {"v":"B","u":"-","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1.3 VS0 = 103.6 kt"}
  },
  "performance": {
   "fuel": {"v":{"usable_L":681.37,"range_nm":884,"ferry_range_nm":1382},"u":"L, nm","scope":"aircraft","src":["LP5","LP8"],"conf":"กลาง","est":false,"note":"range ไม่มีถังภายนอก 884 nm; ferry (ถัง 2 ใบ) 1,382 nm; usable_L = 2 × 90 gal ตาม TCDS ข้อ A.III.9.1 (ข้อ A.III.2 ให้ 1,100 lb ดู t6a.airframe.weights.max_fuel_usable)"},
   "ROC_SL_fpm": {"v":2850,"u":"fpm","scope":"aircraft","src":["LP23","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 3,100 fpm ของ T-6A ลดตามน้ำหนัก 6,900/6,500 (excess power ลด ~8 %)"},
   "glide": {"v":{"speed_kt":134,"ratio":11.3},"u":"kt IAS","scope":"aircraft","src":["LP16","LP19","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar ของ T-6A; ความเร็วสเกล √(6,900/6,500)"}
  }
 }
}
```

`t6c` · propulsion+turboprop+propeller

```json
{
 "t6c": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[3.8,0,-0.05],"axis":[1,0,0],"type":"turboprop","model":"PT6A-68A","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LP8","LP27"],"conf":"กลาง","est":false,"note":"PT6A-68A ตาม product card"},
   "legacy": {"v":{"P":820300,"eta":1.047,"T0":13347,"idle":0},"u":"W, -, N, -","scope":"engine","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: T0 จากทฤษฎีโมเมนตัม FM 0.55 (lm_card); eta = Vc·T0/P ฟิตให้ ROC ของซิมที่ MTOW = 2850 fpm ที่ VY 140 kt; idle 0 เพราะ polar มาจากการร่อนแรงขับศูนย์; WARNING eta > 0.95"}
  }
 }
}
```

`t6c` · wind+validation+input

```json
{
 "t6c": {
  "wind": {
   "fFactor": {
    "trainerExcessTW": {"v":0.1585,"u":"-","scope":"aircraft","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Tmax − D)/W ที่ Vapp 100 kt แฟลปสุด ล้อลง ISA+16 ระดับน้ำทะเล ด้วยกฎแรงขับของซิมและ legacy ของบัตรนี้ (นิยามรอบที่ 1)"}
   }
  },
  "validation": {
   "currentModel": {
    "performance": {"v":{"VSR_clean_kt":91.21,"Vmin_clean_kt":85.85,"VSR_full_kt":81.74,"Vmin_full_kt":75.98,"Vy_SL_kt":142,"ROCmax_SL_fpm":2883,"glideLD_zeroThrust":11.3,"Vbg_kt":133.7,"glideLD_idle":11.3,"TO_groundRoll_m":436,"TO_50ft_m":754,"LDG_50ft_maxBrake_m":812,"LDG_50ft_asIs_m":1060},"u":"kt, fpm, -, m","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: โมเดลวันนี้ (src/ @ cabf0f0) + aero.legacy/propulsion.legacy ของบัตรนี้ ที่ 3129.8 kg ISA ลมสงบ (lm_card runCard); ความเร็ว KEAS ของซิม; ใช้เป็น regression ไม่ใช่ค่าจริง"},
    "approach": {"v":{"sp_wn":2.192,"sp_zeta":0.4938,"CAP":1.12,"nAlpha":4.288,"ph_T_s":25.94,"ph_zeta":0.1355,"dr_wn":1.638,"dr_zeta":0.1563,"dr_zetaWn":0.256,"tauR_s":0.426,"spiral_t2_s":20.8,"spiral_divergent":true,"trim_alpha_deg":4.496,"trim_theta_deg":1.496,"trim_de_deg":-5.63,"trim_thr":0.3661},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 100 kt แฟลปสุด ล้อลง 300 m γ −3° ที่ 3129.8 kg"},
    "cruise": {"v":{"sp_wn":4.363,"sp_zeta":0.474,"CAP":1.11,"nAlpha":17.15,"ph_T_s":53.06,"ph_zeta":0.1269,"dr_wn":3.153,"dr_zeta":0.1351,"dr_zetaWn":0.4259,"tauR_s":0.2175,"spiral_t2_s":44.68,"spiral_divergent":true,"trim_alpha_deg":0.3112,"trim_theta_deg":0.3112,"trim_de_deg":1.841,"trim_thr":0.5709},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: IAS 200 kt clean 3,000 ft ระดับ ที่ 3129.8 kg"}
   }
  }
 }
}
```

`trainer_r2` · _meta+airframe

```json
{
 "trainer_r2": {
  "_inherits": {"v":"trainer_r1","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"ข้อเสนอรอบที่ 2 = เครื่องฝึกรอบที่ 1 (fixture scripts/lm_fixture_trainer_r1.json = AC ของ commit cabf0f0) + leaf ข้างล่างเท่านั้น; lm_card โหลดได้ด้วย loadType(\"trainer_r2\")"},
  "airframe": {
   "inertia": {
    "Ixx": {"v":3700,"u":"kg m2","scope":"aircraft","src":["LM15","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.Ixx = 2600; Rx คลาส 0.261 ให้ 3,980 และ component build-up ของ PC-9 M (ปีกมีเชื้อเพลิง 418 kg) ให้ 3,420 ที่ 2,250 kg ⇒ ค่ากลาง 3,700 (±20 %); ค่าเดิมเท่ากับ Rx 0.211 ต่ำกว่าคลาส"}
   }
  }
 }
}
```

`trainer_r2` · aero

```json
{
 "trainer_r2": {
  "aero": {
   "legacy": {"v":{"CD0":0.03527,"K":0.08901,"CL0":0.25,"CLa":4.8,"CLflap":0.55,"CDflap":0.05,"CDgear":0.02,"Cm0":0.045,"Cma":-0.72,"Cmflap":-0.1,"aStall":18.07,"aStallFlap":-1.94},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM0","LP2","LP16","LP19","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.{CD0,K,aStall,aStallFlap} (src/20-flight.js) = {\"CD0\":0.024,\"K\":0.062,\"aStall\":17,\"aStallFlap\":-2.5}; เปลี่ยน CD0/K ให้ L/D ร่อนแรงขับศูนย์ = 11.3 (คลาส T-6 จากการร่อน 125 KIAS sink 1,100–1,350 fpm) ที่ 114 KCAS; aStall/aStallFlap แก้ให้ CLmax 1 g = 1.3984/1.7414 ของ PC-9 M (TCDS 77/69 KCAS); ค่าอื่นเท่าเดิม"},
   "static_long": {
    "CLmax_target": {"v":{"clean":1.3984,"landing":1.7414},"u":"-","scope":"aircraft","src":["LP2","LM1","LP27"],"conf":"กลาง","est":false,"note":"รอบที่ 1: aero.static_long.CLmax_target = {\"clean\":1.355,\"landing\":1.657}; ใช้ CLmax 1 g ของ PC-9 M จาก TCDS (ปีกและพื้นที่ปีกเท่ากัน) ⇒ VS1/VS0 1 g ที่ 2,250 kg = 77.28/69.25 KCAS; คีย์ clean/landing ตามรอบที่ 1 (แฟลปต่อเนื่อง)"}
   },
   "derivatives": {
    "Clda": {"v":0.21,"u":"1/rad","scope":"aircraft","src":["LM10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.Clda = 0.16; คู่กับ da เฉลี่ย 15.5° ให้ Cl สูงสุด 0.057 ≈ เดิม 0.056 (0.16 × 20°) อัตราม้วนเท่าเดิม; lm_derivs ของ PC-9 M ให้ 0.227 (ความเชื่อมั่นต่ำ)"}
   }
  }
 }
}
```

`trainer_r2` · speeds+performance

```json
{
 "trainer_r2": {
  "speeds": {
   "VS0_kt": {"v":67.5,"u":"kt CAS","scope":"aircraft","src":["LP2","LM1","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.Vs0 = 71; VS0 ตามนิยาม POH/TCDS (ความเร็วต่ำสุดของการทดสอบ 1 kt/s, 14 CFR 23.49 เดิม) ที่ 2,250 kg = V_SR 1 g 69.25 × √0.95 จาก CLmax ของ PC-9 M (= 69 KCAS ของ PC-9 M สเกล √(2,250/2,350); PC-7 MkII 67 KCAS [LP9]); speeds.VREF_kt 88 kt ของรอบที่ 1 คงเดิม เพราะ 1.3 × 67.5 = 87.8 kt (ตรวจทาน: ข้อเสนอเดิม 90 kt ใช้ V_SR 1 g ผิดนิยาม)"},
   "VY_kt": {"v":125,"u":"kt CAS","scope":"aircraft","src":["LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เป้าใหม่ (ซิมวันนี้ 128.8 kt)"}
  },
  "performance": {
   "glide": {"v":{"speed_kt":113.6,"ratio":11.3},"u":"kt CAS","scope":"aircraft","src":["LP16","LP19","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เป้าใหม่ (รอบที่ 1 ไม่มี path นี้; ซิมวันนี้ให้ L/D 16.5 ที่ 105 kt) จาก polar ของ T-6 ที่ 2,250 kg"},
   "ROC_SL_fpm": {"v":4000,"u":"fpm","scope":"aircraft","src":["LP9","LP12","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เป้าใหม่ (ซิมวันนี้ 3,225 fpm) จาก PC-7 MkII 2,840 fpm ที่ 522 kW และ PC-9 4,090 fpm สเกลด้วยกำลังส่วนเกินที่ 2,250 kg 700 kW ⇒ 3,900–4,200"}
  }
 }
}
```

`trainer_r2` · propulsion+turboprop+propeller

```json
{
 "trainer_r2": {
  "propulsion": {
   "legacy": {"v":{"P":700000,"eta":1.266,"T0":11500,"idle":0},"u":"W, -, N, -","scope":"engine","src":["LM0","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.{eta,idle} = {\"eta\":0.8,\"idle\":0.045}; eta (= Vc·T0/P ของกฎแรงขับวันนี้) ฟิตให้ ROC ที่ 2,250 kg = 4000 fpm (ค่าประมาณของคลาส 3,900–4,200); idle 0.045 → 0 เพราะแรงขับ idle บวกทำให้ร่อนได้ L/D 21.7 (เทอร์โบพร็อปจริงที่ flight idle ให้แรงขับศูนย์ถึงลบ); P และ T0 เท่าเดิม"}
  },
  "propeller": {
   "governor": {
    "betaFlightIdle": {"v":11.74,"u":"deg @0.75R","scope":"propeller","src":["LP2","LP27"],"conf":"สูง","est":false,"note":"รอบที่ 1: propeller.governor.betaFlightIdle = 10; min pitch 14° ที่สถานี 30 in ของ HC-D4N/D9512 (ใบพัดเดียวกับรอบที่ 1) แปลงเป็น 0.75R"}
   }
  }
 }
}
```

`trainer_r2` · controls

```json
{
 "trainer_r2": {
  "controls": {
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":18.5,"down":16}},"u":"deg","scope":"aircraft","src":["LP1","LP2"],"conf":"สูง","est":false,"note":"รอบที่ 1: AC.deUp/deDn = \"22/15 deg\"; ระยะจาก TCDS ของ PC-7 MkII/PC-9 M (T-6: 18/16 [LP5])"},
    "aileron": {"v":{"travel_deg":{"up":20,"down":11}},"u":"deg","scope":"aircraft","src":["LP1","LP2","LP5"],"conf":"สูง","est":false,"note":"รอบที่ 1: AC.daMax = \"20 deg (สมมาตร)\"; differential 20/11 ⇒ da เฉลี่ย 15.5° ในซิม; ต้องเพิ่ม Clda คู่กัน (ดู aero.derivatives.Clda)"},
    "rudder": {"v":{"travel_deg":{"left":24,"right":24}},"u":"deg","scope":"aircraft","src":["LP1","LP2","LP5"],"conf":"สูง","est":false,"note":"รอบที่ 1: AC.drMax = \"25 deg\""}
   }
  }
 }
}
```

`trainer_r2` · gear

```json
{
 "trainer_r2": {
  "gear": {
   "legacy": {"v":[{"b":[2.03,0,1.36],"k":52000,"c":5000,"stroke":0.22,"steer":true},{"b":[-0.28,-1.27,1.38],"k":125000,"c":12500,"stroke":0.25,"brake":true},{"b":[-0.28,1.27,1.38],"k":125000,"c":12500,"stroke":0.25,"brake":true}],"u":"m FRD, N/m, N s/m, m","scope":"gear","src":["LP5","LP10","LP27"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบที่ 1: AC.gear = \"nose x 2.30, main x −0.35, y ±1.55 (track 3.10 m, wheelbase 2.65 m)\"; track 2.54 m และ wheelbase 2.31 m ของคลาส (T-6 TCDS, แผ่นแบบ PC-9 M); สัดส่วนโหลดล้อหน้า 12 % เท่าเดิม; k, c, stroke เท่าเดิม"}
  }
 }
}
```

`trainer_r2` · wind+validation+input

```json
{
 "trainer_r2": {
  "validation": {
   "currentModel": {
    "performance": {"v":{"VSR_clean_kt":77.27,"Vmin_clean_kt":72.52,"VSR_full_kt":69.25,"Vmin_full_kt":65.01,"Vy_SL_kt":139.1,"ROCmax_SL_fpm":4035,"glideLD_zeroThrust":11.3,"Vbg_kt":113.4,"glideLD_idle":11.3,"TO_groundRoll_m":332,"TO_50ft_m":556,"LDG_50ft_maxBrake_m":669,"LDG_50ft_asIs_m":838},"u":"kt, fpm, -, m","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: รอบที่ 1: validation.currentModel.performance = {\"VSR_flaps1_kt\":71.9,\"VCLmax_flaps1_kt\":70,\"VSR_clean_kt\":79.6,\"Vy_SL_kt\":128,\"ROCmax_SL_fpm\":3225,\"glideLD_zeroThrust\":16.5,\"glideLD_idle\":21.7,\"TO_groundRoll_flaps0_m\":358,\"TO_50ft_flaps0_m\":590,\"LDG_50ft_maxBrake_m\":714}; ผลของโมเดลวันนี้กับข้อเสนอนี้ที่ 2,250 kg (regression)"},
    "approach": {"v":{"sp_wn":2.22,"sp_zeta":0.5801,"CAP":0.9504,"nAlpha":5.187,"ph_T_s":25.56,"ph_zeta":0.1273,"dr_wn":1.595,"dr_zeta":0.1286,"dr_zetaWn":0.2052,"tauR_s":0.3042,"spiral_t2_s":36.1,"spiral_divergent":false,"trim_alpha_deg":1.72,"trim_theta_deg":-1.28,"trim_de_deg":-3.817,"trim_thr":0.2707},"u":"rad/s, -, s, deg","scope":"aircraft","src":["LM0","LP27"],"conf":"สูง","est":true,"note":"ค่าประมาณ: เทียบ รอบที่ 1: validation.currentModel.approach95 = \"sp 2.221/0.578, DR 1.611/0.139, τR 0.218 s\""}
   }
  }
 }
}
```
