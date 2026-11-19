**บล็อก airframe**

```json
{
 "c172s": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Cessna Aircraft Company (Textron Aviation จาก s/n 172S11615)","model":"172S","variant":"Skyhawk SP (รวม NAV III G1000 / G1000 NXi)","engine":"Lycoming IO-360-L2A 180 hp @ 2,700 rpm","propeller":"McCauley 1A170E/JHA7660 fixed pitch 2 ใบ 75–76 in","seats":4,"category":"normal / utility (spin อนุญาตเฉพาะ utility)","tc_ref":"FAA TCDS 3A12 Section XII; EASA TCDS IM.A.051 Section 2"},"u":"-","scope":"aircraft","src":["LC6","LC3","LC1"],"conf":"สูง","est":false,"note":"ทะเบียนไทย: C172S 34 ใน 44 ลำ C172 ของ ATO (LS1); FNPT ของ BATC เป็น \"C172S Glass Cockpit\" จึงน่าจะมี G1000 ในฝูง (อนุมาน: ทะเบียนไม่บอก avionics)"},
   "weights": {
    "MTOW": {"v":1156.66,"u":"kg","scope":"aircraft","src":["LC6","LC3"],"conf":"สูง","est":false,"note":"2,550 lb normal; utility 2,200 lb (997.9 kg)"},
    "MLW": {"v":1156.66,"u":"kg","scope":"aircraft","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"เท่ากับ MTOW 2,550 lb (POH p2-7)"},
    "MRW": {"v":1160.29,"u":"kg","scope":"aircraft","src":["LC6","LC3"],"conf":"สูง","est":false,"note":"ramp 2,558 lb; utility 2,208 lb (EASA เขียน 2,107 lb เป็นการพิมพ์ผิด ดู §04.12)"},
    "BEW_typical": {"v":754.3,"u":"kg","scope":"aircraft","src":["LC1"],"conf":"กลาง","est":false,"note":"standard empty weight 1,663 lb ของ Information Manual (p1-7) ไม่ใช่ของลำใดลำหนึ่ง; เครื่องที่มี G1000 และอุปกรณ์เสริมมักหนักกว่า"},
    "max_fuel_usable": {"v":144.2,"u":"kg","scope":"aircraft","src":["LC6","LC1","LM4"],"conf":"สูง","est":false,"note":"53 US gal = 200.6 L ใช้ได้ (รวม 56 gal) × avgas 6 lb/gal (PHAK)"},
    "useful_load": {"v":406,"u":"kg","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"895 lb (normal), 545 lb (utility)"},
    "training_mass": {"v":{"kg":1009.6,"empty_kg":754.3,"crew_kg":160,"fuel_kg":95.3,"fuel_l":132.5},"u":"kg (fuel_l: L)","scope":"aircraft","src":["LC0","LC1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 754.3 kg (POH p1-7) + ครู 85 kg + ศิษย์ 75 kg + เชื้อเพลิง 35 US gal (132.5 L, 95.3 kg ที่ 6 lb/gal) = 1009.6 kg (2,226 lb); การเทียบ POH ใช้ --mass 1156.66"}
   },
   "cg": {
    "datum": {"v":"lower portion of front face of firewall","u":"-","scope":"aircraft","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"ระยะ m DAT บวกไปทางท้าย"},
    "LEMAC": {"v":0.6579,"u":"m DAT","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"25.9 in aft of datum"},
    "MAC": {"v":1.4935,"u":"m","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"58.8 in"},
    "envelope": {"v":[[884.5,0.889,1.2014],[1156.66,1.0414,1.2014]],"u":"kg, m DAT","scope":"aircraft","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"normal: หน้า 35.0 in (15.5 %MAC) ที่ ≤1,950 lb เชิงเส้นถึง 41.0 in (25.7 %MAC) ที่ 2,550 lb; หลัง 47.3 in (36.4 %MAC) ทุกน้ำหนัก; utility หน้า 37.5 in ที่ 2,200 lb หลัง 40.5 in (24.8 %MAC)"},
    "ref": {"v":{"m_DAT":1.0668,"in_DAT":42,"pct_mac":27.4},"u":"m DAT, %MAC","scope":"aircraft","src":["LC0","LC6"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: CG อ้างอิงของ FRD และ inertia เลือกเอง (ค่าประมาณ): 42.0 in ใกล้ CG ฝึกทั่วไป อยู่ในขอบเขตทุกมวล"}
   },
   "inertia": {
    "Ixx": {"v":1925,"u":"kg m2","scope":"aircraft","src":["LM5","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รัศมีไจเรชันที่วัดจริงของเครื่องคลาส C172 ใน NASA TM-80163 (Rx 0.235) × MTOW, b 11.0 m; ไม่รวมผลเชื้อเพลิงในปีก (+~577 kg m2 ถ้าถังเต็ม)"},
    "Iyy": {"v":2046,"u":"kg m2","scope":"aircraft","src":["LM5","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ry 0.324 × MTOW, L 8.205 m (JSBSim c172x ให้ Ry 0.325)"},
    "Izz": {"v":3539,"u":"kg m2","scope":"aircraft","src":["LM5","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Rz 0.364 ที่วัดจาก TM-80163 × MTOW, (b+L)/2 = 9.60 m (สูตร Roskam); ไม่รวมเชื้อเพลิงในปีก (+~577 kg m2 ถ้าถังเต็ม)"},
    "Ixz": {"v":170,"u":"kg m2","scope":"aircraft","src":["LM5","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 123 kg m2 ของ TM-80163 × มวล"},
    "ref_mass": {"v":1156.66,"u":"kg","scope":"aircraft","src":["LC0"],"conf":"กลาง","est":false,"note":"inertia สเกลตามมวลด้วยรัศมีคงที่"},
    "radii": {"v":{"Rx":0.235,"Ry":0.324,"Rz":0.364},"u":"-","scope":"aircraft","src":["LM5","LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Roskam Rx/Ry/Rz จาก TM-80163 (838 kg); ค่าคลาส single_prop ของหัวข้อ 01 (0.257/0.357/0.404) ให้ Ixx/Iyy/Izz 2310/2481/4351"},
    "method": {"v":"radii_from_flight_test_class","u":"-","scope":"aircraft","src":["LM0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ไม่มี inertia ที่วัดของ 172S เผยแพร่; ความไม่แน่นอน ±30 % (หัวข้อ 01 §01.4)"}
   },
   "wing": {
    "S": {"v":16.165,"u":"m2","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"174 ft2 (POH p1-3, ใช้คำนวณ wing loading 14.7 lb/ft2); TCDS ให้ 16.3045 m2 (175.5 ft2) ต่าง 0.9 % ดู §04.12"},
    "b": {"v":10.9982,"u":"m","scope":"aircraft","src":["LC3","LC1"],"conf":"สูง","est":false,"note":"36 ft 1 in รวมไฟ strobe (POH); TCDS 10.9982 m"},
    "MAC": {"v":1.4935,"u":"m","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"58.8 in"},
    "AR": {"v":7.483,"u":"-","scope":"aircraft","src":["LC0"],"conf":"สูง","est":false,"note":"b²/S ด้วย S 174 ft2 (ด้วย S ของ TCDS ได้ 7.42)"},
    "taper": {"v":0.7,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีกคอร์ดคงที่ช่วงใน + เรียวช่วงนอก เทียบเป็นปีกเรียวเดียวกับที่หัวข้อ 01 ใช้ตรวจ TM-80163"},
    "sweep_c4_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ถือว่าเส้น c/4 ไม่มี sweep (ปีกตรง ช่วงนอกเรียวเล็กน้อย) ตามรูปทรงที่หัวข้อ 01 ใช้ตรวจ TM-80163"},
    "dihedral_deg": {"v":1.73,"u":"deg","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ 1°44′ (ค่าที่หัวข้อ 01 ใช้กับเครื่องคลาส C172; ยังไม่พบเอกสารปฐมภูมิ)"},
    "incidence_deg": {"v":1.5,"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: มุมติดตั้งโคนปีก (ยังไม่พบเอกสารปฐมภูมิที่เปิดได้; ตรวจกับ maintenance manual)"},
    "twist_deg": {"v":-3,"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ washout 3° (โคน +1.5° ปลาย −1.5°); ยังไม่ยืนยัน"},
    "airfoil": {"v":"NACA 2412 (modified)","u":"-","scope":"aircraft","src":["LC5"],"conf":"ต่ำ","est":false,"note":"Wikipedia (ข้อมูลของ 172R) ไม่อ้างแหล่ง; รายการ Lednicer (LC7) เปิดอ่านแถว Cessna ไม่ได้ในรอบนี้"},
    "position": {"v":"high","u":"-","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"ปีกสูงมีเสาค้ำ"},
    "x_c4_root": {"v":2.12,"u":"m","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระยะจากปลาย spinner (~43 in หน้า datum) ถึง c/4 โคนปีก (40.6 in DAT)"}
   },
   "tail": {
    "S_h": {"v":3.35,"u":"m2","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table I (เครื่องคลาส C172) ผ่าน lm_derivs VALIDATION; JSBSim c172r ให้ 21.9 ft2 (2.03 m2) ต่างกันมาก ดู §04.12"},
    "b_h": {"v":3.45,"u":"m","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"},
    "l_h": {"v":4.36,"u":"m","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163; JSBSim c172r 15.7 ft (4.79 m)"},
    "S_v": {"v":1.04,"u":"m2","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 (อาจเป็นเฉพาะครีบ); JSBSim 16.5 ft2 (1.53 m2)"},
    "b_v": {"v":2.03,"u":"m","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"},
    "l_v": {"v":4.36,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ถือว่าแขนหางดิ่งเท่าแขนหางระดับ 4.36 m ของ TM-80163 (ไม่มีค่าวัด)"},
    "z_v": {"v":1,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ศูนย์กลางแรงของครีบราวครึ่งหนึ่งของช่วงหางดิ่ง 2.03 m (TM-80163) เหนือแกน x"},
    "airfoil_h": {"v":"symmetric (ไม่ทราบรุ่น)","u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สมมติหน้าตัดสมมาตรแบบหาง GA ทั่วไป (ไม่พบเอกสาร); ซิมใช้ผ่าน a_t ของ lm_derivs เท่านั้น"},
    "airfoil_v": {"v":"symmetric (ไม่ทราบรุ่น)","u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สมมติหน้าตัดสมมาตร (ไม่พบเอกสาร)"},
    "incidence_h_deg": {"v":0,"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตั้ง 0 เพราะไม่มีข้อมูล ผลของมุมติดตั้งหางรวมอยู่ใน Cm0 ที่ได้จาก trim cruise"}
   },
   "surfaces": {
    "elevator": {"v":{"area_m2":1.34,"chord_ratio":0.42,"span_fraction":0.95},"u":"m2, -, -","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ chord ratio 0.42 ตามหัวข้อ 01"},
    "aileron": {"v":{"area_m2":0.81,"chord_ratio":0.25,"span_fraction":[0.55,0.97]},"u":"m2 (ข้างละ), -, สัดส่วนครึ่งช่วงปีก","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ; aileron แบบ Frise"},
    "rudder": {"v":{"area_m2":0.39,"chord_ratio":0.42,"span_fraction":0.9},"u":"m2, -, -","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.42 × S_v 1.04 m2 × 0.9 (chord ratio ตามหัวข้อ 01)"},
    "flap": {"v":{"type":"single-slotted","span_fraction":[0.12,0.55],"detents_deg":[0,10,20,30]},"u":"-, สัดส่วนครึ่งช่วงปีก, deg","scope":"aircraft","src":["LC2","LC6"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ชนิดและ detent จาก POH p7-13 และ TCDS; ช่วงตามปีกเป็นค่าประมาณ"},
    "trim_tab": {"v":{"chord_ratio":0.25,"location":"elevator ขวา (ค่าประมาณ)"},"u":"-","scope":"aircraft","src":["LC6","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: chord ratio 0.25 ของ elevator และตำแหน่งตามแบบทั่วไปของ tab ล้อมือ; TCDS ให้แค่ระยะเคลื่อน"}
   },
   "geometry": {
    "length": {"v":8.20522,"u":"m","scope":"aircraft","src":["LC3"],"conf":"สูง","est":false,"note":"26.92 ft (Wikipedia 27 ft 2 in)"},
    "span": {"v":10.9982,"u":"m","scope":"aircraft","src":["LC3"],"conf":"สูง","est":false,"note":"36.08 ft"},
    "height": {"v":2.35661,"u":"m","scope":"aircraft","src":["LC3"],"conf":"สูง","est":false,"note":"7.73 ft (Wikipedia 8 ft 11 in น่าจะรวมเสาอากาศ/ไฟ)"},
    "wheelbase": {"v":1.651,"u":"m","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"65 in (POH p1-3)"},
    "main_track": {"v":2.184,"u":"m","scope":"aircraft","src":["LM8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ 86 in จากตำแหน่งล้อในโมเดล JSBSim c172r (y ±43 in)"},
    "prop_clearance": {"v":0.286,"u":"m","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"11.25 in"},
    "eye_pos_FRD": {"v":[0.127,-0.25,-0.3],"u":"m FRD","scope":"aircraft","src":["LM8","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: x จาก EYEPOINT ของ JSBSim c172r (37 in DAT), y ที่นั่งซ้าย, z เหนือ CG 0.30 m"},
    "eye_height_static": {"v":1.6,"u":"m","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CG สูงจากพื้น 1.30 m + 0.30 m"},
    "fuselage_width": {"v":1,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความกว้างห้องโดยสารราว 1.0 m ที่หัวข้อ 01 ใช้กับเครื่องคลาส C172 (ใช้ใน lm_derivs)"},
    "fuselage_height": {"v":1.35,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความสูงลำตัวที่หัวข้อ 01 ใช้กับเครื่องคลาส C172 (ใช้ใน lm_derivs)"}
   }
  }
 }
}
```

**บล็อก aero**

```json
{
 "c172s": {
  "aero": {
   "ref": {
    "S": {"v":16.165,"u":"m2","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"174 ft2"},
    "b": {"v":10.9982,"u":"m","scope":"aircraft","src":["LC3"],"conf":"สูง","est":false,"note":""},
    "c": {"v":1.4935,"u":"m","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"MAC 58.8 in"}
   },
   "derivatives": {
    "CLq": {"v":{"cruise":6.0121,"approach":5.98},"u":"1/rad (c/2V)","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "CLadot": {"v":{"cruise":1.3752,"approach":1.3597},"u":"1/rad (c/2V)","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "CLde": {"v":0.42,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"บินจริง TM-80163 (ML 40.7 m/s); lm_derivs 0.414"},
    "CD0": {"v":{"cruise":0.033,"glide_windmill":0.0508},"u":"-","scope":"aircraft","src":["LC1","LC4","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: polar พาราโบลา CD = CD0 + K CL²: glide (ใบพัดหมุนฟรี) จาก 68 KIAS กับ L/D 9.114; cruise จากจุด 75 % 8,500 ft 124 KTAS (η 0.80 ค่าประมาณ)"},
    "K": {"v":{"cruise":0.0567,"glide_windmill":0.0593},"u":"-","scope":"aircraft","src":["LC1","LC4","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: glide e 0.717; cruise สมมติ e 0.75"},
    "CYb": {"v":-0.57,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table X CL 0.6; lm_derivs -0.461"},
    "CYdr": {"v":{"cruise":0.1502,"approach":0.1493},"u":"1/rad","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01); ผลบินทดสอบ TM-80163 Table X (fit, แฟลป 0) ≈ 0.11 / 0.14 / 0.17 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR)"},
    "CYr": {"v":{"cruise":0.1663,"approach":0.1665},"u":"1/rad (b/2V)","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "Clb": {"v":-0.07,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"},
    "Clp": {"v":-0.45,"u":"1/rad (b/2V)","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table X linear fit ที่ CL 0.6 (แฟลป 0)"},
    "Clr": {"v":{"cruise":0.0925,"approach":0.2142},"u":"1/rad (b/2V)","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (ขึ้นกับ CL); TM-80163 Table X (fit, แฟลป 0) ≈ 0.07 / 0.095 / 0.13 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR) ค่า approach ของบัตรสูงกว่า 65 % ดู §04.9"},
    "Clda": {"v":0.204,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table X CL 0.6: −0.102 ต่อ δa = δซ้าย − δขวา (ผลต่างสองข้าง) → |−0.102| × 2 = +0.204 ต่อมุมเฉลี่ยตามเครื่องหมาย AC (da+ = ม้วนขวา)"},
    "Cldr": {"v":{"cruise":0.0137,"approach":0.0136},"u":"1/rad","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01); TM-80163 Table X ≈ 0.006–0.0095 (อ่านจาก OCR)"},
    "Cmq": {"v":-14.85,"u":"1/rad (c/2V)","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 (ระบุโดยตรึง Cmα̇ = −4.0)"},
    "Cmadot": {"v":{"cruise":-3.9816,"approach":-3.9368},"u":"1/rad (c/2V)","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01); TM-80163 ตรึงไว้ที่ −4.0 ไม่ได้ระบุจากข้อมูล"},
    "Cmde": {"v":-1.23,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table IV เฉลี่ยสองรัน (−1.24, −1.21) ที่ 40.7 m/s; δe บวก = ขอบท้ายลง ตรงกับ AC (รายการสัญลักษณ์ของรายงานเรียก δe ว่า stabilator แต่ Table II เรียก elevator)"},
    "Cnb": {"v":0.042,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163; lm_derivs 0.034"},
    "Cnp": {"v":{"cruise":-0.0568,"approach":-0.1627},"u":"1/rad (b/2V)","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (ขึ้นกับ CL); TM-80163 Table X (fit, แฟลป 0) ≈ −0.05 / −0.078 / −0.115 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR) ดู §04.9"},
    "Cnr": {"v":-0.11,"u":"1/rad (b/2V)","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163 Table X linear fit ที่ CL 0.6 (−0.10 / −0.125 ที่ CL 0.3 / 1.0)"},
    "Cnda": {"v":{"cruise":-0.0114,"approach":-0.0255},"u":"1/rad","scope":"aircraft","src":["LM0","LM5"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (K_n −0.20); TM-80163 ให้ proverse +0.008 (แยกค่าจาก Cnp ไม่ได้) ดู §04.12"},
    "Cndr": {"v":-0.058,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"}
   },
   "static_long": {
    "CL0": {"v":{"0":0.25,"10":0.367,"20":0.503,"30":0.571},"u":"-","scope":"aircraft","src":["LC9","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: clean 0.25 ตามตาราง JSBSim c172 (หัวข้อ 03) + ΔCL0 ของแฟลป = ΔCLmax จาก POH (สมมติมุม stall ไม่เลื่อน)"},
    "CLalpha": {"v":5.17,"u":"1/rad","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"บินจริง TM-80163 ทั้งลำ; lm_derivs 5.125"},
    "alpha_star": {"v":{"0":16.56,"10":16.67,"20":16.79,"30":16.86},"u":"deg","scope":"aircraft","src":["LC0","LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: alpha_CLmax + 1.73° ตามรูปร่างโมเดล stall ของรอบที่ 1"},
    "alpha_star_neg": {"v":{"0":13,"30":9},"u":"deg","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของเครื่องฝึกรอบที่ 1 (ไม่มีข้อมูล C172)"},
    "a1": {"v":22,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "CL_sep_at_alpha_star": {"v":{"0":1.026,"30":1.185},"u":"-","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S สเกลด้วย CLmax"},
    "CDmax_90": {"v":1.4,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีก 1.11 + 0.018 AR = 1.24 + ลำตัว/หาง/เสาค้ำ"},
    "dCD_sep": {"v":0.2,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าวรรณกรรมที่รอบที่ 1 ใช้ (params-trainer.json) เพราะไม่มีข้อมูล C172S"},
    "CmX": {"v":-0.12,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S; C172 pitch break อ่อน (ไม่มีตัวเลข)"},
    "Cm0": {"v":{"0":-0.0206,"10":-0.0724,"20":-0.0968,"30":-0.107},"u":"-","scope":"aircraft","src":["LC0","LC9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: clean จาก trim elevator −2° ที่ 110 KCAS MTOW CG อ้างอิง; ΔCm0 แฟลปจากตาราง JSBSim c172r (หัวข้อ 03)"},
    "Cmalpha": {"v":-0.942,"u":"1/rad","scope":"aircraft","src":["LM5","LC0"],"conf":"กลาง","est":false,"note":"TM-80163 −0.87 ที่ CG 28.8 %MAC ย้ายไป 27.4 %MAC: −0.87 − CLα·Δh; จุด neutral ≈ 45.6 %MAC"},
    "CLmax_target": {"v":{"0":1.464,"10":1.581,"20":1.717,"30":1.785},"u":"-","scope":"aircraft","src":["LC2","LM0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: CLmax 1 g แบบ trim ที่ MTOW CG หน้า คำนวณจาก VS ของ Fig 5-3 (KCAS) โดยถือว่า VS เป็นความเร็วต่ำสุดที่ nz 0.95 ตามวิธีของหัวข้อ 01 (ช่วง nz 0.90–1.00 ใน §04.6); 20° สอดแทรก 2/3 ระหว่าง 10° และ 30° ตามรูปทรง ΔCL ของ JSBSim"},
    "alpha_CLmax": {"v":{"0":14.83,"10":14.94,"20":15.06,"30":15.13},"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณจากอัตราส่วน 0.922 ของรอบที่ 1"},
    "table_clean": {"v":{"axes":{"coef":["CL","CD","Cm"],"alpha_deg":[-20,-12,-8,-4,0,4,8,12,14,16,18,20,25,30,40,60,90]},"data":[[-0.438,0.19,0.302],[-0.831,0.127,0.175],[-0.472,0.086,0.111],[-0.111,0.064,0.045],[0.25,0.06,-0.021],[0.611,0.074,-0.086],[0.972,0.107,-0.152],[1.33,0.157,-0.217],[1.491,0.185,-0.249],[1.54,0.192,-0.28],[1.149,0.153,-0.312],[0.52,0.188,-0.343],[0.327,0.291,-0.419],[0.433,0.384,-0.492],[0.633,0.596,-0.626],[0.75,1.034,-0.837],[0,1.359,-0.963]]},"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตารางของโมเดล legacy (Beard–McLain M 55 + แผ่นเรียบ) จากค่าในบัตร ไม่ใช่ข้อมูลอุโมงค์ลม"}
   },
   "flaps": {
    "detents": {"v":[{"name":"0","flap_deg":0,"dCL0":0,"dCD0":0,"dCm0":0,"CLmax":1.464,"f_lift":0},{"name":"10","flap_deg":10,"VFE_kt":110,"dCL0":0.117,"dCD0":0.0069,"dCm0":-0.0518,"CLmax":1.581,"f_lift":0.3645},{"name":"20","flap_deg":20,"VFE_kt":85,"dCL0":0.253,"dCD0":0.0124,"dCm0":-0.0762,"CLmax":1.717,"f_lift":0.7882},{"name":"30","flap_deg":30,"VFE_kt":85,"dCL0":0.321,"dCD0":0.0193,"dCm0":-0.0864,"CLmax":1.785,"f_lift":1}],"u":"-, deg, kt IAS","scope":"aircraft","src":["LC2","LC6","LC9","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax จาก POH (20° ค่าประมาณ); dCL0 = ΔCLmax; dCD0/dCm0 จาก JSBSim c172r; f_lift = AC.flaps ของแต่ละขั้น"},
    "transition_time_s": {"v":9,"u":"s","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ 0→30° (POH ไม่ระบุเวลา; มอเตอร์ไฟฟ้า)"}
   },
   "legacy": {"v":{"CD0":0.05899,"K":0.07077,"CL0":0.25,"CLa":5.17,"CLflap":0.321,"CDflap":0.0193,"CDgear":0,"Cm0":-0.0206,"Cma":-0.942,"Cmflap":-0.0864,"aStall":18.3,"aStallFlap":0.57},"u":"-, 1/rad, deg","scope":"aircraft","src":["LM0","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: lm_legacy_fit (lc_fit.mjs โหมด static): polar รูปแบบซิมจาก glide 68 KIAS L/D 9.11; aStall/aStallFlap แก้หาให้ CLmax 1 g ตรง POH; ค่าอื่นจากบัตร (AC.flaps 0–1 = 0–30°)"},
   "gear_drag": {
    "dCD0": {"v":0,"u":"-","scope":"aircraft","src":["LM0"],"conf":"สูง","est":false,"note":"ล้อตายตัว: แรงต้านรวมใน CD0"}
   },
   "elevator_fade": {
    "alpha_t_star": {"v":22,"u":"deg","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "a_t": {"v":10,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "floor": {"v":0.35,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"}
   },
   "separation_dynamics": {
    "tau1": {"v":0.49,"u":"s","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (0.4 s) × (c/V_s ของ C172S)/(c/V_s ของเครื่องฝึก) = 1.22"},
    "tau2": {"v":0.24,"u":"s","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของรอบที่ 1 (0.2 s) × 1.22 เหมือน tau1"}
   },
   "large_beta": {
    "CY_crossflow": {"v":0.53,"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: พื้นที่ด้านข้าง ~8.5 m2 × CD 1.0 / S"}
   },
   "strip_wing": {
    "taper": {"v":0.7,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีกช่วงในคอร์ดคงที่ + ช่วงนอกเรียว เทียบเป็นปีกเรียวเดียว 0.7 (หัวข้อ 01)"},
    "dihedral_eff": {"v":1.73,"u":"deg","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (ปีกสูงเพิ่ม Clb เอง)"},
    "washout": {"v":3,"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: washout 3° เท่ากับ airframe.wing.twist_deg (ยังไม่ยืนยันกับเอกสาร)"},
    "kp_roll": {"v":0.63,"u":"-","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S 0.661 × Clp เป้า −0.45/−0.47"},
    "tau_aileron": {"v":0.31,"u":"-","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S 0.26 สเกลให้ Clda 0.204 บนช่วง 0.55–0.97"},
    "aileron_span_frac": {"v":[0.55,0.97],"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ช่วง aileron 55–97 % ของครึ่งปีก ตามรูปทรงที่หัวข้อ 01 ใช้ตรวจ TM-80163"}
   },
   "stall_warning": {
    "min_margin": {"v":5,"u":"kt","scope":"aircraft","src":["LM3","LC2"],"conf":"กลาง","est":false,"note":"14 CFR 23.207(c) เดิม: เตือนก่อน stall อย่างน้อย 5 kt; C172S ใช้แตรลม (reed) ที่ขอบหน้าปีกซ้าย"},
    "alpha_warn_5kt": {"v":{"0":10.84,"30":9.98},"u":"deg","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: α ที่ V_s + 5 kt จากค่าในบัตร (โมเดลเชิงเส้น)"},
    "alpha_warn_design": {"v":{"0":10.14,"30":9.28},"u":"deg","scope":"aircraft","src":["LC0","LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ต่ำกว่า alpha_warn_5kt 0.7° ตามระยะเผื่อของรอบที่ 1"}
   },
   "buffet": {
    "vertical_filter": {"v":{"w0":75.92,"Q":8.28},"u":"rad/s,-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (ไม่มีข้อมูล C172)"},
    "lateral_filter": {"v":{"w0":[36.43,64.71],"Q":[4.19,11.99],"gain_ratio":[2,1]},"u":"rad/s,-,-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "rms_full": {"v":{"az":0.03,"ay":0.01},"u":"g","scope":"aircraft","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 60 % ของเครื่องฝึกรอบที่ 1 (C172 buffet ก่อน stall เบา)"}
   },
   "spin_reference": {
    "alpha_spin": {"v":[43,60],"u":"deg","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าคลาสเครื่องฝึกของรอบที่ 1 (ไม่พบตัวเลข spin ของ C172 ที่เผยแพร่)"},
    "turn_rate": {"v":[145,208],"u":"deg/s","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าคลาสเครื่องฝึกของรอบที่ 1 (ไม่มีข้อมูล spin ของ C172)"},
    "omega_hat": {"v":[0.24,0.42],"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าคลาสเครื่องฝึกของรอบที่ 1"},
    "descent_trainer": {"v":5000,"u":"fpm","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณสำหรับเครื่องเบา (เครื่องฝึกรอบที่ 1 9,500 fpm หนักกว่ามาก) ต้องยืนยัน"},
    "IYMP": {"v":-0.00086,"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (Ixx − Iyy)/(m b²) จาก inertia ในบัตร"},
    "recovery_turns_max": {"v":1,"u":"turn","scope":"aircraft","src":["LM3","LC1"],"conf":"กลาง","est":false,"note":"spin อนุญาตเฉพาะ utility (POH p2-9); 14 CFR 23.221(a) ฉบับ 2012: ฟื้นจาก spin หนึ่งรอบหรือ 3 s (แล้วแต่อันไหนนานกว่า) ภายในอีกไม่เกิน 1 รอบ; (b) utility ที่ขออนุมัติ spin ต้องผ่าน (c) และ 23.807(b)(7) เพิ่ม"}
   }
  }
 }
}
```

**บล็อก interference**

```json
{
 "c172s": {
  "interference": {
   "downwash": {
    "deda": {"v":0.353,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (DATCOM 4.4.1)"},
    "eps0": {"v":0,"u":"rad","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตั้ง 0 เพราะผลของ downwash ที่ α = 0 รวมอยู่ใน Cm0 ที่ได้จาก trim"},
    "l_t": {"v":4.36,"u":"m","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"},
    "VH": {"v":0.605,"u":"-","scope":"aircraft","src":["LC0"],"conf":"กลาง","est":false,"note":"S_h l_h/(S c)"},
    "a_t": {"v":3.603,"u":"1/rad","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าเริ่มต้นของหัวข้อ 01"},
    "CLadot": {"v":1.36,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "Cmadot": {"v":-3.937,"u":"1/(rad·c/2V)","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"}
   },
   "groundEffect": {
    "rMac": {"v":[0.036,2.588,-0.95],"u":"m (FRD จาก CG, y ใช้ ±)","scope":"aircraft","src":["LC6","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: x จาก c/4 MAC (40.6 in DAT); y ตำแหน่ง MAC ตามช่วงปีกของปีกเรียว 0.7; z ปีกสูงเหนือ CG ~0.95 m (ค่าประมาณ) ⇒ h/b ที่แตะพื้นราว 0.2 (ผลน้อยกว่าปีกต่ำ)"},
    "CLa_w": {"v":4.691,"u":"1/rad","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (ปีกล้วน)"},
    "A": {"v":7.483,"u":"-","scope":"aircraft","src":["LC0"],"conf":"สูง","est":false,"note":""},
    "rEps": {"v":{"a":3.99,"m":0.652},"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้สูตร fit ของรอบที่ 1 (VLM) ใช้ซ้ำ"}
   },
   "slipstream": {
    "diskDiameter": {"v":1.9304,"u":"m","scope":"propeller","src":["LC6"],"conf":"สูง","est":false,"note":"76 in"},
    "hubRadius": {"v":0.15,"u":"m","scope":"propeller","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รัศมี spinner ≈ 0.15 r/R × รัศมีใบ 0.965 m"},
    "hubPos": {"v":[1.905,0,0],"u":"m (FRD จาก CG)","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum, แนวแรงขับที่ระดับ CG"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LC8"],"conf":"กลาง","est":false,"note":"Lycoming direct drive หมุนตามเข็มนาฬิกาเมื่อมองจากห้องนักบิน (PHAK)"},
    "kappa": {"v":0.43,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "immersionH": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,0.97]},"data":[0,0.25,0.45,0.55,0.63,0.68]},"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หางระดับ C172 อยู่ใกล้แนวแรงขับ (ต่ำกว่าเล็กน้อย) จึงจมใน slipstream มากกว่าเครื่องฝึกรอบที่ 1"},
    "immersionV": {"v":{"axes":{"rs_m":[0.3,0.5,0.7,0.8,0.9,0.97]},"data":[0.05,0.18,0.3,0.36,0.42,0.46]},"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สัดส่วนครีบที่อยู่ใน slipstream ตามรัศมี slipstream เทียบความสูงครีบ 2.03 m เหนือแนวแรงขับ (เรขาคณิตโดยประมาณ)"},
    "kSwirl": {"v":0.5,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "zSwirl": {"v":0.6,"u":"m","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ศูนย์กลางครีบเหนือแนวแรงขับ คิดจาก z_v 1.0 m ลบระยะที่แนวแรงขับอยู่สูงกว่าแกนลำตัวท้าย (~0.4 m)"},
    "finArea": {"v":1.04,"u":"m2","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":"TM-80163"},
    "finArm": {"v":4.36,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่ากับ l_h ของ TM-80163"},
    "finLiftSlope": {"v":4.445,"u":"1/rad","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "eta_v": {"v":0.9,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าเริ่มต้น η_v ของหัวข้อ 01"},
    "blownSpanFactor": {"v":0.9,"u":"D","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "blownArea": {"v":2.3,"u":"m2","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปีกสูงเหนือ slipstream ส่วนใหญ่ ใช้ 0.9 D × คอร์ด ~1.6 m − ลำตัว"},
    "kBlown": {"v":0.3,"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (ต่ำกว่าเครื่องฝึก 0.5 เพราะปีกสูงพ้นแกน slipstream)"},
    "k_deda_power": {"v":0,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (ไม่คิดผลกำลังต่อ downwash)"}
   }
  }
 }
}
```

**บล็อก speeds**

```json
{
 "c172s": {
  "speeds": {
   "VS0_kt": {"v":48,"u":"kt CAS","scope":"aircraft","src":["LC2","LC1"],"conf":"สูง","est":false,"note":"แฟลป 30 power off 2,550 lb CG หน้า (Fig 5-3: 40 KIAS; POH หมายเหตุว่าค่า KIAS เป็นค่าโดยประมาณ)"},
   "VS1_kt": {"v":53,"u":"kt CAS","scope":"aircraft","src":["LC2","LC1"],"conf":"สูง","est":false,"note":"แฟลปขึ้น (Fig 5-3: 48 KIAS)"},
   "VX_kt": {"v":62,"u":"kt IAS","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"SL; 67 KIAS ที่ 10,000 ft (p4-5)"},
   "VY_kt": {"v":74,"u":"kt IAS","scope":"aircraft","src":["LC1","LC2"],"conf":"สูง","est":false,"note":"SL; 72 KIAS ที่ 10,000 ft (p4-5; Fig 5-6 74→72)"},
   "VR_kt": {"v":51,"u":"kt IAS","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"ความเร็วล้อพ้นพื้นของ short field takeoff แฟลป 10 (Fig 5-5 p5-14); ความเร็วที่ 50 ft 56 KIAS; normal takeoff (แฟลป 0–10°) ยกล้อหน้าราว 55 KIAS แล้วไต่ 70–80 KIAS (POH p4-15 อ่านจาก OCR ที่เห็นทั้ง 50 และ 55)"},
   "VAPP_kt": {"v":65,"u":"kt IAS","scope":"aircraft","src":["LC1"],"conf":"กลาง","est":false,"note":"D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): normal approach แฟลป 30 60–70 KIAS (POH p4-5) ใช้กลางช่วง 65 KIAS ≈ 67 KCAS (34.5 m/s); POH บอกว่าความเร็วในหัวข้อ 4 อิงน้ำหนักสูงสุด 2,550 lb และใช้ได้กับทุกน้ำหนักที่ต่ำกว่า จึงเป็นค่าเดียวกันที่ training_mass 1,009.6 kg; VAPP ≥ VREF 61 KIAS; แฟลปขึ้น 65–75 KIAS"},
   "VAPP_short_kt": {"v":61,"u":"kt IAS","scope":"aircraft","src":["LC1","LC2"],"conf":"สูง","est":false,"note":"short field แฟลป 30 (p4-5, Fig 5-11 ที่ 50 ft)"},
   "VREF_kt": {"v":61,"u":"kt IAS","scope":"aircraft","src":["LC2","LC1"],"conf":"กลาง","est":false,"note":"D1: POH ไม่ใช้คำว่า VREF; ใช้ความเร็วที่ 50 ft ของ short field landing 61 KIAS = 63.9 KCAS (32.9 m/s) ≈ 1.33 VS0 (48 KCAS) ที่ 2,550 lb (Fig 5-11, p4-5) และใช้ค่าเดียวกันที่ training_mass 1,009.6 kg ตามที่ POH ให้ใช้กับทุกน้ำหนักที่ต่ำกว่า; ข้อมูลประกอบ: 1.3 VS0 ที่ 1,009.6 kg (VS0 × √(m/MTOW)) = 58.3 KCAS"},
   "VG_kt": {"v":68,"u":"kt IAS","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"maximum glide 2,550 lb (p3-3); POH ไม่ให้ตารางตามมวล"},
   "VA_kt": {"v":{"1900":90,"2200":98,"2550":105},"u":"kt IAS","scope":"aircraft","src":["LC1","LC6"],"conf":"สูง","est":false,"note":"lb → KIAS (KCAS 102/95/88)"},
   "VNO_kt": {"v":129,"u":"kt IAS","scope":"aircraft","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"126 KCAS"},
   "VNE_kt": {"v":163,"u":"kt IAS","scope":"aircraft","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"160 KCAS"},
   "VFE": {"v":{"10":110,"20":85,"30":85},"u":"kt IAS","scope":"aircraft","src":["LC1","LC6"],"conf":"สูง","est":false,"note":"10°: 110 KIAS (107 KCAS); 10–30°: 85 KIAS (TCDS FAA 85 KCAS, EASA 84 KCAS)"},
   "ias_cas": {"v":{"0":[[50,56],[60,62],[70,70],[80,78],[90,87],[100,97],[110,107],[120,117],[130,127],[140,137],[150,147],[160,157]],"10":[[40,51],[50,57],[60,63],[70,71],[80,80],[90,89]],"30":[[40,50],[50,56],[60,63],[70,72],[80,81],[85,86]]},"u":"KIAS → KCAS","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"Fig 5-1 normal static source, power for level flight (p5-9); อ่านจาก OCR การจับคู่บางช่องอนุมาน; ต่ำกว่า 40/50 KIAS ไม่มีข้อมูล"},
   "stall_table": {"v":{"cg_fwd":{"0":[[48,53],[52,57],[57,63],[68,75]],"10":[[43,51],[46,55],[51,61],[61,72]],"30":[[40,48],[43,52],[48,57],[57,68]]},"cg_aft":{"0":[[48,53],[52,57],[57,63],[68,75]],"10":[[42,50],[45,54],[50,59],[59,71]],"30":[[40,48],[43,52],[48,57],[57,68]]},"bank_deg":[0,30,45,60],"cell":"[KIAS, KCAS]"},"u":"kt","scope":"aircraft","src":["LC2"],"conf":"สูง","est":false,"note":"Fig 5-3 2,550 lb power off; ตรวจแล้วทุกช่องตรง V0/√cos φ ภายใน 0.46 kt; KIAS เป็นค่าโดยประมาณตาม POH"},
   "stall_warning_margin_kt": {"v":5,"u":"kt","scope":"aircraft","src":["LM3"],"conf":"กลาง","est":false,"note":"14 CFR 23.207(c) (ถึง Amdt 23-50): เตือนก่อน stall อย่างน้อย 5 kt จนถึง stall; กฎไม่กำหนดขีดบน"},
   "stall_altitude_loss_ft": {"v":230,"u":"ft","scope":"aircraft","src":["LC2"],"conf":"สูง","est":false,"note":"Fig 5-3 note: อาจเสียความสูงถึง 230 ft (70 m) ระหว่าง stall และการแก้"},
   "crosswind_demonstrated_kt": {"v":15,"u":"kt","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"takeoff หรือ landing (p4-5); ไม่ใช่ขีดจำกัด"},
   "icao_approach_category": {"v":"A","u":"-","scope":"aircraft","src":["LC12","LC0"],"conf":"สูง","est":false,"note":"1.3 VS0 = 1.3 × 48 = 62 KCAS < 91 kt = Category A ตามนิยาม 14 CFR 97.3 (VREF หรือ 1.3 VSO ที่ MLW); ICAO PANS-OPS ใช้ขอบ 91 kt เดียวกัน"}
  }
 }
}
```

**บล็อก performance**

```json
{
 "c172s": {
  "performance": {
   "ROC_SL_fpm": {"v":730,"u":"fpm","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"2,550 lb SL ISA (p ii); Fig 5-6 ที่ 15 °C interpolate ได้ 729"},
   "ROC_table": {"v":{"axes":{"PA_ft":[0,2000,4000,6000,8000,10000,12000],"OAT_C":[-20,0,20,40]},"kias":[74,73,73,73,72,72,72],"data":[[855,785,710,645],[760,695,625,560],[685,620,555,495],[575,515,450,390],[465,405,345,285],[360,300,240,180],[255,195,135,null]]},"u":"fpm","scope":"aircraft","src":["LC2"],"conf":"สูง","est":false,"note":"Fig 5-6 2,550 lb แฟลปขึ้น คันเร่งเต็ม (p5-17); null = ไม่มีข้อมูล; VTBD 35 °C ≈ 661 fpm"},
   "service_ceiling_ft": {"v":14000,"u":"ft","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"p ii"},
   "cruise_table": {"v":[{"alt_ft":8500,"power":"75 %","ktas":124,"note":"ไม่มี wheel fairing ลบ ~2 kt"},{"alt_ft":0,"power":"max","ktas":126}],"u":"ft, -, kt TAS","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"จุดสรุป p ii (ตาราง Fig 5-8 อ่านจาก OCR ไม่ได้)"},
   "glide": {"v":{"speed_kt":68,"ratio":9.114},"u":"kt IAS, -","scope":"aircraft","src":["LC1","LC4"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ความเร็วจาก POH p3-3 (68 KIAS = 68.4 KCAS); ratio ค่าประมาณจาก FAA 1.5 NM ต่อ 1,000 ft (ช่วง 1.4–1.6 → 8.51–9.72); ใบพัดหมุนฟรี แฟลปขึ้น"},
   "takeoff": {"v":{"ground_roll_m":293,"over50ft_m":497},"u":"m","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"960 / 1,630 ft (p ii) MTOW SL ISA ลมสงบ ผิวแห้ง (short field technique แฟลป 10)"},
   "landing": {"v":{"ground_roll_m":175,"over50ft_m":407},"u":"m","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"575 / 1,335 ft (p ii) แฟลป 30 เบรกสุด"},
   "takeoff_table": {"v":{"axes":{"PA_ft":[0,1000,2000,3000,4000,5000,6000,7000,8000],"OAT_C":[0,10,20,30,40]},"roll_ft":[[860,925,995,1070,1150],[940,1010,1090,1170,1260],[1025,1110,1195,1285,1380],[1125,1215,1310,1410,1515],[1235,1335,1440,1550,1660],[1355,1465,1585,1705,1825],[1495,1615,1745,1875,2010],[1645,1785,1920,2065,2215],[1820,1970,2120,2280,2450]],"total50_ft":[[1465,1575,1690,1810,1945],[1600,1720,1850,1990,2135],[1755,1890,2035,2190,2355],[1925,2080,2240,2420,2605],[2120,2295,2480,2685,2880],[2345,2545,2755,2975,3205],[2605,2830,3075,3320,3585],[2910,3170,3440,3730,4045],[3265,3575,3880,4225,4615]]},"u":"ft","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"Fig 5-5 short field 2,550 lb แฟลป 10 lift-off 51 KIAS 56 KIAS ที่ 50 ft; อ่านจาก OCR ที่สลับคอลัมน์ ตรวจความเป็นเอกภาพแล้ว; VTBD 35 °C: 1110 / 1878 ft"},
   "landing_table": {"v":{"axes":{"PA_ft":[0,1000,2000,4000,8000],"OAT_C":[0,10,20,30,40]},"roll_ft":[[545,565,585,605,625],[565,585,605,625,650],[585,610,630,650,670],[630,655,675,700,725],[735,760,790,815,840]],"total50_ft":[[1290,1320,1350,1380,1415],[1320,1350,1385,1420,1450],[1355,1385,1420,1455,1490],[1425,1460,1495,1535,1570],[1585,1630,1670,1715,1755]]},"u":"ft","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"Fig 5-11 2,550 lb แฟลป 30 61 KIAS ที่ 50 ft (แถว 3,000/5,000–7,000 ft ละไว้); VTBD 35 °C: 615 / 1398 ft"},
   "fuel": {"v":{"usable_L":200.6,"usable_kg":144.2,"range_75pct_8500ft_nm":518,"endurance_75pct_h":4.26,"range_45pct_10000ft_nm":638,"endurance_45pct_h":6.72},"u":"L, kg, NM, h","scope":"aircraft","src":["LC1"],"conf":"สูง","est":false,"note":"p ii: 53 gal usable, ไม่มี wheel fairing"},
   "vtbd_hot_day": {"v":{"to_roll_ft":1110,"to_50_ft":1878,"ldg_roll_ft":615,"ldg_50_ft":1398,"roc_fpm":661,"to_roll_m":338,"to_50_m":572,"ldg_roll_m":187,"ldg_50_m":426},"u":"ft, fpm, m","scope":"aircraft","src":["LC2","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: interpolate ตาราง POH ที่ PA 0 ft (VTBD 9 ft) OAT 35 °C 2,550 lb ลมสงบ (ค่าประมาณจากการ interpolate)"},
   "tests": {"v":[{"case":"T-LC-01","conditions":"POH p1-2/TCDS: span 36 ft 1 in, wing area 174 ft² (POH) / 175.5 ft² (TCDS)","quantity":"AR = b²/S","expected":7.48,"tolerance":0.02,"unit":"-","origin":"POH [LC1] p1-2; TCDS 3A12 [LC6] ให้ 7.42","current_model":7.483,"pass":true},{"case":"T-LC-02","conditions":"normal category, MTOW 2,550 lb: forward limit 41.0 in, aft limit 47.3 in aft of datum; LEMAC 25.9 in, MAC 58.8 in","quantity":"CG เป็น %MAC (fwd / aft)","expected":"25.7 / 36.4","tolerance":0.2,"unit":"%MAC","origin":"POH p2-7/2-8 [LC1]; TCDS MAC/LEMAC [LC3, LC6]; lc_calc.mjs [LC0]","current_model":"25.7 / 36.4","pass":true},{"case":"T-LC-03","conditions":"ตาราง stall ของ POH (Fig 5-3, CG หน้าสุด แฟลปขึ้น, power off): VS0° 53 KCAS","quantity":"VS(φ) = VS0/√cosφ ที่ 45° และ 60°","expected":"63 / 75 (POH)","tolerance":1,"unit":"KCAS","origin":"POH Fig 5-3 (ManualsLib หน้า 146) [LC2]; ทุกช่องของตารางต่างจากสูตรไม่เกิน 0.46 kt","current_model":"63 / 75","pass":true},{"case":"T-LC-04","conditions":"2,550 lb, S 174 ft², VS1 53 / VS0 48 KCAS ถือเป็นความเร็วต่ำสุด (nz 0.95 ที่ Vmin, ลด 1 kt/s)","quantity":"CLmax 1 g แฟลป 0 / 30","expected":"1.464 / 1.785","tolerance":0.03,"unit":"-","origin":"lm_polar.clmaxFromStall kind min [LM0]; นิยาม VS [LM1, LM3]; POH p ii, Fig 5-3 [LC1, LC2]","current_model":"ซิมวัด CLmax 1.465 / 1.786","pass":true},{"case":"T-LC-05","conditions":"ตาราง airspeed calibration (POH Fig 5-1) ตีความเชิงเส้น","quantity":"KCAS ของ Vy 74 KIAS แฟลปขึ้น / Vref 61 KIAS แฟลป 30 / Vx 62 KIAS","expected":"73.2 / 63.9 / 63.6","tolerance":0.1,"unit":"KCAS","origin":"POH Fig 5-1 p5-9 [LC2]; lc_calc.mjs [LC0]","current_model":"73.2 / 63.9 / 63.6","pass":true},{"case":"T-LC-06","conditions":"ซิม: MTOW 1,156.7 kg CG อ้างอิง 27.4 %MAC, 3,000 ft ISA, idle, แฟลป 0, ปีกระดับ, ลด 1 kt/s","quantity":"VS1 (Vmin, KEAS≈KCAS)","expected":53,"tolerance":3,"unit":"KCAS","origin":"POH p ii, Fig 5-3 [LC1, LC2]; tolerance ±3 kt ตาม Part 60 2.c.8 [R1:V2]","current_model":53.2,"pass":true},{"case":"T-LC-07","conditions":"เหมือน T-LC-06 แฟลป 10","quantity":"VS (Vmin)","expected":51,"tolerance":3,"unit":"KCAS","origin":"POH Fig 5-3 [LC2] (CG หน้าสุด)","current_model":51.4,"pass":true},{"case":"T-LC-08","conditions":"เหมือน T-LC-06 แฟลป 30","quantity":"VS0 (Vmin)","expected":48,"tolerance":3,"unit":"KCAS","origin":"POH p ii, Fig 5-3 [LC1, LC2]","current_model":48.3,"pass":true},{"case":"T-LC-09","conditions":"ซิม: MTOW, SL ISA (h 30 m), คันเร่งสุด, แฟลป 0, กวาด IAS ทีละ 2 kt","quantity":"ROCmax / Vy","expected":"730 / 73.2","tolerance":"±100 fpm (หรือ 5 %) / ±3 kt","unit":"fpm / KCAS","origin":"POH p ii, Fig 5-6 p5-17 [LC1, LC2]; Part 60 1.c.1 [R1:V2]","current_model":"743 / 66.9","pass":false},{"case":"T-LC-10","conditions":"เหมือน T-LC-09","quantity":"Vx (γ สูงสุด)","expected":63.6,"tolerance":3,"unit":"KCAS","origin":"POH p4-5 Vx 62 KIAS [LC1] แปลงด้วย Fig 5-1","current_model":60,"pass":false},{"case":"T-LC-11","conditions":"ซิม: MTOW, 8,000 ft ISA, คันเร่งสุด, แฟลป 0","quantity":"ROCmax","expected":408,"tolerance":100,"unit":"fpm","origin":"POH Fig 5-6 p5-17 [LC2]; ซิมไม่มี power lapse จึงคาดว่าไม่ผ่าน","current_model":733,"pass":false},{"case":"T-LC-12","conditions":"ซิม: MTOW, 3,000 ft ISA, แรงขับศูนย์, แฟลป 0, กวาด IAS ทีละ 1 kt","quantity":"ความเร็วร่อนดีสุด / L/D","expected":"68.4 / 9.1","tolerance":"±3 kt / ±0.5","unit":"KCAS / -","origin":"POH VG 68 KIAS p3-3 [LC1]; ระยะร่อน 1.5 NM ต่อ 1,000 ft [LC4]; Part 60 1.d.4 (idle descent: ±3 kt) [R1:V2]; L/D ±0.5 ผู้เขียนตั้ง","current_model":"68.2 / 9.11","pass":true},{"case":"T-LC-13","conditions":"ซิม: short field แฟลป 10, MTOW, SL ISA 15 °C, ลมสงบ, ทางแห้ง, เบรกค้าง 3 s คันเร่งสุด, VR 52 KEAS, θ 12°","quantity":"ground roll","expected":293,"tolerance":"±5 % หรือ ±61 m","unit":"m","origin":"POH Fig 5-5 p5-14 (960 ft) [LC2]; Part 60 1.b.1 [R1:V2]","current_model":290,"pass":true},{"case":"T-LC-14","conditions":"เหมือน T-LC-13","quantity":"ระยะถึง 50 ft","expected":497,"tolerance":"±10 % (ดัดแปลงจาก 1.b.1)","unit":"m","origin":"POH Fig 5-5 p5-14 (1,630 ft) [LC2]","current_model":488,"pass":true},{"case":"T-LC-15","conditions":"เหมือน T-LC-13 แต่ OAT 35 °C (ISA+20, ค่าประจำของ VTBD ตอนบ่าย)","quantity":"ground roll / ถึง 50 ft","expected":"338 / 572","tolerance":"±10 %","unit":"m","origin":"POH Fig 5-5 p5-14 ตีความเชิงเส้นระหว่าง 30 และ 40 °C [LC2]; thrustAvail ไม่มีพจน์ ρ จึงคาดว่าสั้นเกิน","current_model":"308 / 514","pass":false},{"case":"T-LC-16","conditions":"ซิม: autoland ของ Flight, ลมสงบ, 15 °C, MTOW, แฟลป 30, ข้าม threshold ที่ 64 KCAS (= 61 KIAS ตาม short field), เบรกเต็มเมื่อล้อหน้าแตะ","quantity":"ระยะรวมจาก 50 ft ถึงหยุด","expected":407,"tolerance":"±10 %","unit":"m","origin":"POH Fig 5-11 p5-23/24 (1,335 ft) [LC2]","current_model":"540 (อากาศ 318 + พื้น 222); autoland ปกติ Vapp 67 KCAS = 535","pass":false},{"case":"T-LC-17","conditions":"เหมือน T-LC-16","quantity":"ground roll (แตะพื้นถึงหยุด)","expected":175,"tolerance":"±10 % หรือ ±61 m ค่าที่เล็กกว่า = ±17.5 m","unit":"m","origin":"POH Fig 5-11 (575 ft) [LC2]; Part 60 1.e.1 [R1:V2]","current_model":222,"pass":false},{"case":"T-LC-18","conditions":"ซิม: MTOW, SL ISA, คันเร่งสุด, แฟลป 0, บินระดับ","quantity":"ความเร็วสูงสุด","expected":126,"tolerance":3,"unit":"KTAS","origin":"POH p ii [LC1]","current_model":106.1,"pass":false},{"case":"T-LC-19","conditions":"ซิม: MTOW, 8,500 ft ISA, บินระดับ 124 KTAS","quantity":"กำลังที่ต้องใช้ T·V/(η P)","expected":0.75,"tolerance":0.05,"unit":"-","origin":"POH p ii (75 % BHP, 124 KTAS) [LC1]; η ของซิมคงที่ 0.883","current_model":1.044,"pass":false},{"case":"T-LC-20","conditions":"ซิม linearise: cruise 110 KCAS 3,000 ft แฟลป 0 (Category B)","quantity":"short period ζ / ωn / CAP","expected":"ζ 0.30–2.00; ωn 6.5 rad/s (JSBSim c172x, cross-check); CAP ไม่ตัดสิน","tolerance":"ζ: ช่วงปิด 0.30–2.00 ส่วนเผื่อ 0; ωn: ±30 % (4.55–8.45 rad/s)","unit":"- / rad/s / 1/s²","origin":"MIL-F-8785C Level 1 Class I [R1:V7, R1:V10]; JSBSim c172x 100 KCAS ของรอบที่ 1 [R1:V15]","current_model":"0.702 / 5.6 / 2.17","pass":true},{"case":"T-LC-21","conditions":"เหมือน T-LC-20","quantity":"phugoid ζ / คาบ","expected":"ζ ≥ 0.04; คาบ Lanchester π√2·V/g = 26.8 s (ข้อมูลประกอบ ไม่ใช้ตัดสิน)","tolerance":"ζ: ขีดล่างเดียว ส่วนเผื่อ 0; คาบ: ไม่ตัดสิน","unit":"- / s","origin":"MIL-F-8785C Level 1 [R1:V10, R1:V11]; JSBSim c172x 32 s [R1:V15]","current_model":"0.196 / 33","pass":true},{"case":"T-LC-22","conditions":"ซิม linearise: approach 67 KCAS 300 m แฟลป 30 γ −3° (Category C) และ cruise","quantity":"Dutch roll ωn / ζ / ζωn","expected":"ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 1.0 (approach)","tolerance":"ขีดล่างเดียวทั้งสามค่า ส่วนเผื่อ 0; cruise แสดงอย่างเดียว","unit":"rad/s / - / rad/s","origin":"MIL-F-8785C Level 1 Class I Cat C [R1:V10]; NASA CR-2337 Cardinal ωn 1.6–2.1 [LC11]","current_model":"approach 1.76 / 0.309 / 0.546; cruise 2.34 / 0.253","pass":true},{"case":"T-LC-23","conditions":"เหมือน T-LC-22","quantity":"roll mode τR (approach / cruise)","expected":"≤ 1.0 (Cat C) / ≤ 1.4 (Cat B)","tolerance":"ขีดบนเดียว ส่วนเผื่อ 0","unit":"s","origin":"MIL-F-8785C Table 5 [R1:V7, R1:V10]","current_model":"0.222 / 0.13","pass":true},{"case":"T-LC-24","conditions":"เหมือน T-LC-22","quantity":"spiral: เวลาเพิ่มเป็นสองเท่า T₂ (approach / cruise)","expected":"T₂ ≥ 12 s (Cat C) / ≥ 20 s (Cat B)","tolerance":"ขีดล่างเดียว ส่วนเผื่อ 0; spiral ที่ลู่เข้าผ่านเสมอ","unit":"s","origin":"MIL-F-8785C Table 6 [R1:V7, R1:V10]","current_model":"38.1 / เสถียร","pass":true},{"case":"T-LC-25","conditions":"ลมขวาง 15 kt (demonstrated) ที่ 63.9 KCAS SL, wing-low ไม่มี crab: β = asin(15/63.9) = 13.6° (±0.1° จากการปัดเศษ)","quantity":"δr / δa / มุมเอียงที่ต้องใช้","expected":"ขนาด δr ≤ 17.7°, ขนาด δa ≤ 17.5° (travel เต็มของบัตร); φ แสดงอย่างเดียว","tolerance":"ขีดบนเดียวที่ travel เต็ม ส่วนเผื่อ 0°","unit":"deg","origin":"POH p4-5 [LC1]; travel จาก TCDS [LC3, LC6]; สมการ steady sideslip (Etkin) ใช้อนุพันธ์ของบัตร","current_model":"δr 8 / δa 4.1 / φ 6.2","pass":true},{"case":"T-LC-26","conditions":"เครื่อง IO-360-L2A คันเร่งสุด SL, OAT 35 °C","quantity":"P/P_ISA (indicated-minus-friction, f 0.10)","expected":0.964,"tolerance":0.005,"unit":"-","origin":"lm_engine [LM0]; NACA Rep. 190 [LM17]; เทียบ POH ROC 661/729 = 0.907 ที่ 35 °C [LC2]","current_model":0.9637,"pass":true},{"case":"T-LC-27","conditions":"ใบพัด McCauley 1A170E/JHA7660 (76 in) BEM, SL ISA, คันเร่งสุด, ความเร็วศูนย์","quantity":"static rpm","expected":"2,350","tolerance":"±50 rpm (ช่วง 2,300–2,400 ของ TCDS)","unit":"rpm","origin":"TCDS IM.A.051 C.6 [LC3]; POH p2-5 [LC1]; lm_prop [LM0]; ซิมไม่มีใบพัด (T0 คงที่ 3,538 N)","current_model":2350,"pass":true},{"case":"T-LC-28","conditions":"BEM ใบพัดเดิม คันเร่งสุด 180 hp, SL ISA, 126 KTAS","quantity":"rpm ที่สมดุลกำลัง","expected":"≤ 2,700 (rpm สูงสุด)","tolerance":"ขีดบนเดียว ส่วนเผื่อ 0","unit":"rpm","origin":"POH p2-5 [LC1]; lm_prop [LM0]","current_model":"2790 (J 0.722)","pass":false},{"case":"T-LC-29","conditions":"POH Fig 5-5 short field takeoff, 2,550 lb, SL, ตีความเชิงเส้นระหว่าง 30 และ 40 °C","quantity":"ระยะถึง 50 ft ที่ 35 °C","expected":1878,"tolerance":10,"unit":"ft","origin":"POH p5-14 [LC2]; lc_calc.mjs [LC0]","current_model":1878,"pass":true},{"case":"T-LC-30","conditions":"W/S = 14.66 lb/ft² (2,550 lb, 174 ft²)","quantity":"limit descent velocity V = 4.4 (W/S)^¼ (ไม่ต่ำกว่า 7, ไม่เกิน 10 fps)","expected":8.61,"tolerance":0.02,"unit":"fps","origin":"14 CFR 23.473(d) ฉบับ 2011 [LM3] (รอบที่ 1 [R1:G3]); lc_calc.mjs [LC0]","current_model":8.61,"pass":true},{"case":"T-LC-31","conditions":"ซิม trim: 63.9 KCAS แฟลป 30 γ −3° ที่ 300 m, MTOW, CG อ้างอิง","quantity":"elevator ที่ต้องใช้ / ระยะเผื่อถึง travel ขึ้น 28°","expected":"เผื่อ ≥ 10° ไว้ flare (เกณฑ์ภายใน ค่าประมาณ)","tolerance":"ขีดล่างเดียว ส่วนเผื่อ 0","unit":"deg","origin":"TCDS travel [LC3, LC6]; เกณฑ์ของผู้เขียน","current_model":"de -9.7 / α 6.1 / θ 3.1 / thr 0.34","pass":true},{"case":"T-LC-32","conditions":"ซิม linearise: บัตร c172s ที่ 1,115.8 kg (2,460 lb น้ำหนักทดสอบของ CR-2337), 69.5 KEAS (80 mph CAS), 4,000 ft ISA, แฟลป 0 และแฟลป 30","quantity":"phugoid คาบ / ζ (แฟลป 0; แฟลป 30)","expected":"คาบ 18.3 s (4 รัน 17.6–19.4 s); ζ 0.044–0.061","tolerance":"คาบ ±20 % (14.6–22.0 s); ζ 0.02–0.12 (×0.5 ถึง ×2 ของช่วงที่วัด ค่าประมาณ เพราะเป็นเครื่องต่างแบบ)","unit":"s / -","origin":"NASA CR-2337 Table V (Cessna 177B Cardinal ไม่ใช่ C172) [LC11]","current_model":"แฟลป 0: 21 / 0.094; แฟลป 30: 21 / 0.118","pass":true},{"case":"T-LC-33","conditions":"เหมือน T-LC-32 แฟลป 0 ที่ 69.5 และ 104.3 KEAS (80 และ 120 mph CAS)","quantity":"Dutch roll ωn / ζ (69.5; 104.3 KEAS)","expected":"ωn ≈ 1.60 / ≈ 2.1 rad/s; ζ > 0.5 / > 0.4","tolerance":"อัตราส่วนค่าจริง/บัตร ωn 0.90–1.45, ζ 0.60–1.40 [LM0 §01.3.4 ค่าประมาณ] → บัตรต้องได้ ωn 1.10–1.78 / 1.45–2.33 rad/s และ ζ ≥ 0.36 / ≥ 0.29","unit":"rad/s / -","origin":"NASA CR-2337 หน้า 26 (ข้อความ; รายงานบอกว่าการหน่วงสูงทำให้สกัดตัวเลขได้ไม่แม่น) [LC11]","current_model":"69.5: 1.58 / 0.271; 104.3: 2.27 / 0.254","pass":false},{"case":"T-LC-34","conditions":"ซิมเวลาจริง 240 Hz: trim ระดับแฟลป 0 ที่ 1,115.8 kg 4,000 ft, aileron เต็มทันที (อัตราของซิม 80°/s), rudder และ elevator ค้าง, ไม่มีลม","quantity":"อัตราม้วนสูงสุด p_max (69.5; 104.3 KEAS)","expected":"34.7 / 54.5 °/s (เฉลี่ย 4 รัน ช่วง 33.2–35.9 / 53.8–54.7)","tolerance":"±25 % (ค่าประมาณ ผู้เขียนตั้ง: aileron ของ Cardinal ต่างจาก C172)","unit":"deg/s","origin":"NASA CR-2337 Table IV [LC11]","current_model":"47.4 / 73.3; ข้อมูลประกอบ: เวลาถึง 30° 0.9 / 0.62 s (วัด 1.02–1.41 / 0.70–0.74), pb/2V 0.12 / 0.123 (วัด 0.083–0.090 / 0.090–0.098), β ที่ 30° 8.7 / 5° (วัด 8.5–11 / 3–3.5)","pass":false},{"case":"T-LC-35","conditions":"ดึงคันบังคับใน turn หรือ pull-up ที่ cruise 110 KCAS 3,000 ft MTOW (n/α ของบัตร 14.5 g/rad)","quantity":"แรงที่ wheel ต่อ g (Fs/g)","expected":"12.5–42.9 lbf/g (56–191 N/g)","tolerance":"ช่วงปิด ส่วนเผื่อ 0 (แถบเป้าหมายค่าประมาณ ไม่ใช่ค่าที่วัดจาก C172)","unit":"lbf/g","origin":"MIL-F-8785C Level 1 wheel [R1:C12]; 14 CFR 23.155 [LM3]; lc_cardfix.stickForceBand","current_model":"ไม่รองรับในซิมวันนี้ (ซิมไม่มีแบบจำลองแรงที่คันบังคับ)","pass":null}],"u":"ตามช่อง unit ของแต่ละแถว","scope":"aircraft","src":["LC0","LC1","LC2","LC3","LC6","LC11","R1:V10"],"conf":"กลาง","est":false,"note":"แถวเดียวกับตาราง T-LC ในหัวข้อ 04.11 สร้างโดย lc_json.mjs จาก scripts/out/lc_tests.json (รัน lc_tests.mjs ก่อน); ค่าคาดหวังมาจาก POH/TCDS/MIL-F-8785C/ฟิสิกส์ตามช่อง origin; tolerance ที่ผู้เขียนตั้งเองบอกไว้ในช่อง tolerance ของแถวนั้น; current_model คือผลของบัตรในฟิสิกส์วันนี้ (null ใน pass = ไม่ตัดสิน)"}
  }
 }
}
```

**บล็อก propulsion + piston + propeller**

```json
{
 "c172s": {
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":[1.905,0,0],"axis":[1,0,0],"type":"piston","model":"Lycoming IO-360-L2A","prop_sense":1}],"u":"m FRD","scope":"aircraft","src":["LC6","LC8","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum บนแนว CG; prop_sense 1 ตาม PHAK p5-31 (หมุนตามเข็มนาฬิกามองจากที่นั่งนักบิน)"},
   "legacy": {"v":{"P":134230,"eta":0.883,"T0":3538,"idle":0},"u":"W, -, N, -","scope":"aircraft","src":["LM0","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: lc_fit.mjs (lm_legacy_fit โหมด static) ใช้ T0 3538 N จาก BEM ของ lc_calc (lm_prop ใบ fixed_76x60 ปรับคอร์ดให้รอบสถิต 2,350 rpm) แล้ว fit η ให้ ROC สูงสุด 730 fpm ที่ SL; ถ้าใช้ T0 จากทฤษฎีโมเมนตัม FM 0.55 (3,094 N) ต้องใช้ η 1.035 ซึ่งเป็นไปไม่ได้; idle 0 เพราะ polar จาก glide รวมแรงต้านใบพัดแล้ว"}
  },
  "piston": {
   "identity": {"v":{"model":"IO-360-L2A","kind":"fuel_injected","displacement_L":5.916,"cylinders":4,"tcds":"FAA 1E10 / EASA IM.E.032"},"u":"-","scope":"engine","src":["LM21","LC1"],"conf":"สูง","est":false,"note":"5.916 L = 361 in3 ตาม IM.E.032 p6 (POH p1-4 เขียน 360 in3); 4 สูบนอน ฉีดเชื้อเพลิง RSA-5; น้ำหนักแห้ง 122 kg (p9)"},
   "ratings": {
    "P_rated": {"v":134226,"u":"W","scope":"engine","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"180 hp @ 2,700 rpm (TCDS เครื่องยนต์ให้ L2A 160 hp/2,400 rpm และ alternate 180 hp/2,700 rpm)"},
    "rpm_rated": {"v":2700,"u":"rpm","scope":"engine","src":["LC6"],"conf":"สูง","est":false,"note":"ทุกการใช้งาน"},
    "P_mcp": {"v":134226,"u":"W","scope":"engine","src":["LC6"],"conf":"สูง","est":false,"note":"ไม่มีพิกัด takeoff แยก"},
    "rpm_redline": {"v":2700,"u":"rpm","scope":"engine","src":["LC1"],"conf":"สูง","est":false,"note":"tach green 2,100–2,500 SL, –2,600 ที่ 5,000 ft, –2,700 ที่ 10,000 ft"},
    "rpm_idle": {"v":650,"u":"rpm","scope":"engine","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รอบเดินเบาทั่วไปของ IO-360 fixed pitch (ยังไม่ได้อ่านค่าจาก POH section 4)"},
    "takeoff_time_limit_s": {"v":"unlimited","u":"s","scope":"engine","src":["LC6"],"conf":"สูง","est":false,"note":"TCDS ให้ 2,700 rpm สำหรับทุกการใช้งาน"}
   },
   "altitude": {"v":{"model":"ind_friction","f":0.1},"u":"-","scope":"engine","src":["LM17","LM0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ข้อเสนอของหัวข้อ 01; VTBD 35 °C ได้ 0.9637 (gagg_ferrar 0.9265); ROC ใน POH ลดเป็น 0.907 เท่าที่ 35 °C"},
   "fuel": {"v":{"fuel":"avgas 100LL (100/100LL)","bsfc_g_per_kWh":254,"density_kg_L":0.72},"u":"-, g/kWh, kg/L","scope":"engine","src":["LC6","LC9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BSFC ค่าประมาณ 0.418 lb/(hp h) ที่ JSBSim คำนวณให้ c172r (หัวข้อ 03); POH ตาราง cruise อ่านไม่ได้"},
   "dynamics": {"v":{"tau_throttle_s":0.2,"I_engine":1.7,"friction_torque":"f 0.10 ของกำลังพิกัดที่รอบพิกัด"},"u":"s, kg m2, -","scope":"engine","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณของหัวข้อ 01 (I รวมใบพัด)"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"fixed","u":"-","scope":"propeller","src":["LC6"],"conf":"สูง","est":false,"note":""},
    "model": {"v":"McCauley 1A170E/JHA7660","u":"-","scope":"propeller","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"spinner drawing 0550236"},
    "nBlades": {"v":2,"u":"-","scope":"propeller","src":["LC1"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.9304,"u":"m","scope":"propeller","src":["LC6"],"conf":"สูง","est":false,"note":"76 in (ต่ำสุด 75 in)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LC8"],"conf":"กลาง","est":false,"note":"ตามเข็มนาฬิกามองจากด้านหลัง"},
    "massComplete": {"v":14,"u":"kg","scope":"propeller","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใบอะลูมิเนียม 2 ใบ 76 in ราว 12 kg + spinner (ยังไม่ตรวจกับน้ำหนักในรายการอุปกรณ์ POH Section 6)"},
    "hubPosition": {"v":[1.905,0,0],"u":"m (FRD จาก CG)","scope":"propeller","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum (firewall + ความยาวเครื่องยนต์และ spinner) แนวแรงขับที่ระดับ CG"},
    "thrustAxis": {"v":[1,0,0],"u":"-","scope":"propeller","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตั้งแนวแรงขับขนานแกน x เพราะไม่พบมุม down/right thrust ในเอกสารเปิด"}
   },
   "fixed": {
    "pitch_in": {"v":60,"u":"in","scope":"propeller","src":["LM22","LC6"],"conf":"กลาง","est":false,"note":"จากรหัส 7660 = 76 in × 60 in (แบบแผนชื่อรุ่นของ McCauley)"},
    "beta75_deg": {"v":18.52,"u":"deg","scope":"propeller","src":["LM0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: atan(60/(0.75π·76)) โดยสมมติว่า pitch 60 in ของรุ่นใบวัดที่ 75 % ของรัศมี และใบบิดแบบ helical (รูปใบจริงไม่เปิดเผย; ใช้ใน BEM ของ lm_prop)"},
    "static_rpm_range": {"v":[2300,2400],"u":"rpm","scope":"propeller","src":["LC6","LC1"],"conf":"สูง","est":false,"note":"คันเร่งเต็ม อยู่กับที่"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":134.2,"u":"kW","scope":"propeller","src":["LC6"],"conf":"สูง","est":false,"note":"180 hp"},
    "gearRatio": {"v":1,"u":"-","scope":"propeller","src":["LM21"],"conf":"สูง","est":false,"note":"direct drive"}
   },
   "bladeGeometry": {
    "hubRadiusRatio": {"v":0.15,"u":"r/R","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)"},
    "chordOverD": {"v":{"axes":{"x":[0.15,0.25,0.35,0.45,0.6,0.75,0.85,0.93,1]},"data":[0.0541,0.065,0.0736,0.078,0.079,0.0736,0.065,0.0541,0.0346]},"u":"c/D","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบ GA ของ lm_prop × 1.0827 (ปรับให้รอบสถิต 2,350 rpm)"},
    "twistDesignJ": {"v":0.789,"u":"-","scope":"propeller","src":["LM0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: สมมติใบบิดแบบ helical ที่ pitch เรขาคณิตคงที่ ได้ J ออกแบบ = p/D = 60/76 (รูปใบจริงไม่เปิดเผย; ใช้ใน BEM ของ lm_prop)"},
    "activityFactor": {"v":90,"u":"-","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: AF ของรูปใบ GA ใน lm_prop (ไม่มีข้อมูล McCauley)"}
   },
   "section": {
    "liftSlope": {"v":5.655,"u":"1/rad","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หน้าตัดคล้าย Clark Y ของ lm_prop (0.9 × 2π)"},
    "alpha0": {"v":-3.5,"u":"deg","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หน้าตัดคล้าย Clark Y ของ lm_prop"},
    "alphaStallPos": {"v":14,"u":"deg","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)"},
    "alphaStallNeg": {"v":-10,"u":"deg","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)"},
    "stallBlendM": {"v":10,"u":"1/rad","scope":"propeller","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "cd0": {"v":0.01,"u":"-","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)"},
    "kcd": {"v":0.012,"u":"-","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)"},
    "Mdd": {"v":0.8,"u":"-","scope":"propeller","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปลายใบ 2,700 rpm M ≈ 0.81 (ช่วงบนของ fixed pitch)"},
    "stallDelayFactor": {"v":3,"u":"-","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สัมประสิทธิ์ stall delay แบบ Snel ของ lm_prop"}
   },
   "tables": {
    "CT": {"v":{"axes":{"J":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]},"data":[0.1365,0.1331,0.128,0.1176,0.1039,0.0877,0.0698,0.0505,0.03,0.0086,-0.0136]},"u":"-","scope":"propeller","src":["LM0","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คำนวณด้วย BEM ของ lm_prop (หัวข้อ 01) ใบ fixed_76x60 ปรับคอร์ด × 1.0827 ให้รอบสถิต 2,350 rpm (fixed pitch แกน J); C_T = 0 ที่ J ≈ 0.94 ดู §04.5"},
    "CP": {"v":{"axes":{"J":[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]},"data":[0.0606,0.0633,0.0658,0.066,0.0642,0.0597,0.0524,0.0421,0.0285,0.0114,-0.0089]},"u":"-","scope":"propeller","src":["LM0","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คำนวณด้วย BEM ของ lm_prop (หัวข้อ 01) ใบ fixed_76x60 ปรับคอร์ด × 1.0827 ให้รอบสถิต 2,350 rpm"},
    "CNmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2]},"data":[0.0188,0.0225,0.0283,0.0359,0.0398,0.0411]},"u":"-","scope":"propeller","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คอลัมน์ β75 20° ของรอบที่ 1 × 0.45 (solidity 2×AF 90 / 4×AF 100)"},
    "CMmu": {"v":{"axes":{"J":[0.2,0.4,0.6,0.8,1,1.2]},"data":[0.023,0.0238,0.0243,0.0239,0.0208,0.0168]},"u":"-","scope":"propeller","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คอลัมน์ β75 20° ของรอบที่ 1 × 0.45 เหมือน CNmu"}
   },
   "inertia": {
    "Ip": {"v":1.4,"u":"kg m2","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใบ 14 kg ที่รัศมีไจเรชัน ~0.32 m (I ≈ m k²) ; หัวข้อ 01 ให้รวมเครื่อง ~1.7"},
    "IreflectedEngine": {"v":0.3,"u":"kg m2","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เพลาข้อเหวี่ยงและชิ้นส่วนหมุนของเครื่อง direct drive = 1.7 − 1.4 ของหัวข้อ 01"}
   },
   "checks": {
    "staticThrustISA": {"v":3.54,"u":"kN","scope":"propeller","src":["LM0","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM 2350 rpm FM 0.664 (795 lbf)"},
    "staticThrustVTBD31C": {"v":3.42,"u":"kN","scope":"propeller","src":["LM0","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: BEM เดียวกันที่ ISA+20 (35 °C) 2385 rpm"},
    "momentumIdealStaticISA": {"v":4.65,"u":"kN","scope":"propeller","src":["LC0"],"conf":"กลาง","est":false,"note":"FM = 1 ที่กำลังที่ดูด 158.7 hp, A = π·0.965²"},
    "peakEfficiency": {"v":0.849,"u":"-","scope":"propeller","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: η สูงสุดของ BEM (lm_prop) ที่ J ≈ 0.75"}
   }
  }
 }
}
```

**บล็อก controls**

```json
{
 "c172s": {
  "controls": {
   "architecture": {"v":{"pitch":"reversible (cable)","roll":"reversible (cable, Frise ailerons)","yaw":"reversible (cable) + nose-wheel steering bungee","trim":"tab"},"u":"-","scope":"aircraft","src":["LC2","LC6"],"conf":"กลาง","est":false,"note":"POH Section 7 Fig 7-1; elevator trim tab ล้อมือ (NAV III GFC 700 มี electric trim)"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":28,"down":23},"rate_dps":70,"actuator_tau_s":0},"u":"deg, deg/s, s","scope":"aircraft","src":["LC6","LC3"],"conf":"สูง","est":false,"note":"travel_deg อ่านตรงจาก TCDS (up 28° +1/−0, down 23° +1/−0) ไม่ใช่ค่าประมาณ; rate_dps 70 เป็นค่าสมมติของรอบที่ 1 สำหรับมือคน (ค่าเดียวกับ controls.pitch.rate_limit ที่ติด est); actuator_tau_s 0 เพราะต่อด้วยสลิงตรง"},
    "aileron": {"v":{"travel_deg":{"up":20,"down":15},"rate_dps":80,"actuator_tau_s":0},"u":"deg, deg/s, s","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"up 20° ±1, down 15° ±1 (differential) ⇒ daMax 17.5°"},
    "rudder": {"v":{"travel_deg":{"left":17.73,"right":17.73},"rate_dps":60,"actuator_tau_s":0},"u":"deg, deg/s, s","scope":"aircraft","src":["LC3","LC6"],"conf":"สูง","est":false,"note":"17°44′ ±1° วัดตั้งฉากกับ hinge; 16°10′ ±1° วัดขนาน WL (ทั้ง FAA 3A12 และ EASA IM.A.051 ให้สองค่านี้)"},
    "flap": {"v":{"travel_deg":{"up":0,"down":30},"rate_dps":3.3,"actuator_tau_s":0},"u":"deg, deg/s, s","scope":"aircraft","src":["LC6","LC2"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: TCDS 0–30° +0/−2; detent 10/20/30; rate ค่าประมาณ"},
    "trim_tab": {"v":{"travel_deg":{"up":22,"down":19}},"u":"deg","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"up 22° +1/−0, down 19° +1/−0"}
   },
   "trim": {
    "kind": {"v":"manual wheel + elevator tab (electric trim ใน NAV III GFC 700)","u":"-","scope":"aircraft","src":["LC2","LC3"],"conf":"กลาง","est":false,"note":"ไม่มี rudder/aileron trim ใน TCDS"},
    "range_deg": {"v":{"tab_up":22,"tab_down":19},"u":"deg","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":""},
    "rate_dps": {"v":1,"u":"deg/s","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณสำหรับปุ่มคีย์บอร์ด (ล้อมือไม่มีอัตราคงที่)"}
   },
   "pitch": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"cable"},
    "S_e": {"v":1.34,"u":"m2","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: S_h 3.35 m2 × chord ratio 0.42 × span 0.95"},
    "c_e": {"v":0.41,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.42 × คอร์ดเฉลี่ยหาง (S_h/b_h)"},
    "gearing": {"v":3.6,"u":"rad/m","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: elevator 51° รวม ต่อระยะคันโยก ~0.25 m"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ค่าเริ่มต้น η_h ของหัวข้อ 01"},
    "a_t": {"v":3.603,"u":"1/rad","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "tau_e": {"v":0.616,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)"},
    "l_t": {"v":4.36,"u":"m","scope":"aircraft","src":["LM5"],"conf":"กลาง","est":false,"note":""},
    "deda": {"v":0.353,"u":"-","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01) (DATCOM)"},
    "Ch0": {"v":0,"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Ch_alpha": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (ไม่มีข้อมูล hinge moment ของ C172)"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Ch_tab": {"v":-0.2005,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "tab_max": {"v":22,"u":"deg","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"up 22 / down 19"},
    "trim_rate_flaps_down": {"v":1,"u":"deg/s","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: อัตรา tab ที่ตั้งให้ปุ่มคีย์บอร์ดเลียนแบบการหมุนล้อมือ (ไม่มีอัตราคงที่ในเครื่องจริง)"},
    "trim_rate_flaps_up": {"v":1,"u":"deg/s","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เหมือน trim_rate_flaps_down"},
    "breakout": {"v":4.45,"u":"N","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (1 lbf)"},
    "friction": {"v":4.45,"u":"N","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "centring_spring": {"v":{"Kc":60,"qFade":400},"u":"N/rad, Pa","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "stops": {"v":{"teu":28,"ted":23},"u":"deg","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"TCDS"},
    "rate_limit": {"v":70,"u":"deg/s","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"}
   },
   "roll": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":""},
    "S_a_each": {"v":0.81,"u":"m2","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.25 × คอร์ด 1.40 m × ช่วง (0.97 − 0.55) × b/2"},
    "c_a": {"v":0.35,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.25 × คอร์ดปีก ~1.4 m"},
    "gearing": {"v":3.88,"u":"rad/m","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Ch_delta": {"v":-0.1719,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (Frise ช่วยลดแรง)"},
    "Ch_alpha": {"v":-0.0573,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "breakout": {"v":3,"u":"N","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "stops": {"v":{"up":20,"down":15,"max_mean":17.5},"u":"deg","scope":"aircraft","src":["LC6"],"conf":"สูง","est":false,"note":"TCDS"},
    "rate_limit": {"v":80,"u":"deg/s","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"}
   },
   "yaw": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["LC2"],"conf":"กลาง","est":false,"note":"แป้นต่อกับ steering bungee ของล้อหน้า"},
    "S_r": {"v":0.39,"u":"m2","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.42 × S_v × 0.9"},
    "c_r": {"v":0.4,"u":"m","scope":"aircraft","src":["LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 0.42 × คอร์ดเฉลี่ยครีบ (S_v/b_v ≈ 0.51 m) ปัดขึ้นเพราะ rudder กว้างที่โคน"},
    "gearing": {"v":4.85,"u":"rad/m","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Ch_beta": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "slipstream_q_ratio": {"v":[1,1.6],"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: q ที่หางดิ่ง/q อิสระ จาก idle ถึงกำลังเต็มที่ความเร็วต่ำ"},
    "breakout": {"v":13.3,"u":"N","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "stops": {"v":{"max":17.73},"u":"deg","scope":"aircraft","src":["LC6","LC3"],"conf":"สูง","est":false,"note":"17°44′ วัดตั้งฉากกับ hinge"},
    "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"}
   }
  }
 }
}
```

**บล็อก gear**

```json
{
 "c172s": {
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"POH p7-14"},
   "geometry": {
    "nose_contact_body_extended": {"v":[1.24,0,1.3],"u":"m FRD","scope":"gear","src":["LM8","LC1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: x จาก JSBSim c172r (−6.8 in DAT) ซึ่งให้ wheelbase 65 in ตรง POH; z = ความสูง CG ค่าประมาณ"},
    "main_contact_body_extended": {"v":[[-0.411,-1.092,1.3],[-0.411,1.092,1.3]],"u":"m FRD","scope":"gear","src":["LM8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: x 58.2 in DAT, track 86 in (JSBSim c172r)"},
    "cg_height_parked": {"v":1.3,"u":"m","scope":"gear","src":["LM8","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: JSBSim c172r ให้ 1.38 m ก่อนยุบ"}
   },
   "strut_main": {
    "kind": {"v":"spring_leg","u":"-","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"tubular spring steel (POH p7-14)"},
    "spring": {"v":{"k_vertical":78807,"k_lateral":47284,"damping_ratio":0.25,"static_deflection":0.054},"u":"N/m, N/m, -, m","scope":"gear","src":["LM8","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: k จาก JSBSim c172r 5,400 lb/ft ต่อล้อ (ยุบนิ่ง 0.054 m ที่ MTOW); ζ 0.25 ค่าประมาณ (ขาสปริงเหล็กหน่วงน้อย JSBSim ใช้ ζ ≈ 1.9)"},
    "stroke": {"v":0.15,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ระยะยุบสูงสุดราว 2.8 เท่าของยุบนิ่ง 0.054 m (ขาสปริงไม่มีจุดชนตายตัว)"},
    "c_linear": {"v":2925,"u":"N s/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 2ζ√(k N/g) ด้วย ζ 0.25 และโหลดนิ่งต่อล้อ"}
   },
   "strut_nose": {
    "kind": {"v":"oleo","u":"-","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"air/oil shock strut"},
    "stroke": {"v":0.12,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ช่วงยุบ oleo ล้อหน้าแบบ GA ทั่วไป (POH บอกเพียงว่าเห็นแกนราว 2 in ตอนจอด)"},
    "p_static": {"v":112,"u":"psi","scope":"gear","src":["LC2","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ = 2.5 × ความดันเติมตอนไม่มีโหลด 45 psi (POH p8-21)"},
    "piston_area": {"v":0.00366,"u":"m2","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โหลดล้อหน้านิ่ง 2824 N ÷ p_static"},
    "ratio_static_to_extended": {"v":2.5,"u":"-","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "ratio_compressed_to_extended": {"v":8,"u":"-","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "Kh_compression": {"v":823,"u":"N/(m/s)^2","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S × มวล 1157/2250"},
    "Kr_rebound": {"v":9767,"u":"N/(m/s)^2","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของรอบที่ 1 × มวล 1157/2250"},
    "c_linear": {"v":514,"u":"N s/m","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของรอบที่ 1 × มวล 1157/2250"},
    "spring": {"v":{"k_vertical":26269,"damping_ratio":0.6},"u":"N/m, -","scope":"gear","src":["LM8","LM0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สำหรับซิม legacy: JSBSim c172r 1,800 lb/ft; ζ 0.6 ค่าเริ่มต้นของหัวข้อ 01"}
   },
   "tyre_main": {
    "size": {"v":{"size":"6.00-6","ply":6},"u":"-","scope":"gear","src":["LC3","LC2"],"conf":"สูง","est":false,"note":"EASA IM.A.051 p20 และ POH p8-21 (FAA 3A12 Section XII ไม่ระบุยาง)"},
    "operating_pressure": {"v":38,"u":"psi","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"POH p8-21"},
    "outside_diameter": {"v":0.44,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยาง 6.00-6 เส้นผ่านศูนย์กลางนอกราว 17.5 in ตามขนาดเรียก (ยังไม่ตรวจกับ tire data book)"},
    "section_width": {"v":0.16,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความกว้าง 6.00 in ตามขนาดเรียก"},
    "rated_load": {"v":7000,"u":"N","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6.00-6 6 ply (ยังไม่ได้ตรวจกับ tire data book)"},
    "rated_pressure": {"v":50,"u":"psi","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6 ply (ยังไม่ตรวจกับ tire data book)"},
    "k_vertical": {"v":150000,"u":"N/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ความแข็งยางที่ 38 psi ≈ p × พื้นที่สัมผัส/ยุบ (ยุบราว 3 cm ที่โหลดนิ่ง 4.3 kN)"},
    "c_vertical": {"v":1500,"u":"N s/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ζ ของยางราว 0.05 ที่โหลดนิ่ง"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "relaxation_length": {"v":0.27,"u":"m","scope":"gear","src":["LC10","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของรอบที่ 1 สเกลตามเส้นผ่านศูนย์กลางยาง"},
    "k_longitudinal": {"v":120000,"u":"N/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ราว 0.8 เท่าของ k แนวดิ่ง ตามสัดส่วนที่รอบที่ 1 ใช้"},
    "mu_peak_dry": {"v":0.8,"u":"-","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (ยางบนผิวแห้ง)"},
    "mu_skid_ratio_dry": {"v":0.75,"u":"-","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "mu_skid_ratio_wet": {"v":0.5,"u":"-","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "rolling_radius": {"v":0.21,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รัศมีนอก 0.22 m ลบการยุบตอนรับโหลด"},
    "wheel_inertia": {"v":0.12,"u":"kg m2","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ล้อ+ยาง+จานเบรกราว 6 kg ที่รัศมีไจเรชัน ~0.14 m"}
   },
   "tyre_nose": {
    "size": {"v":{"size":"5.00-5","ply":6},"u":"-","scope":"gear","src":["LC3","LC2"],"conf":"สูง","est":false,"note":"EASA IM.A.051 p20 และ POH p8-21"},
    "operating_pressure": {"v":45,"u":"psi","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"POH p8-21"},
    "outside_diameter": {"v":0.36,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยาง 5.00-5 ราว 14 in ตามขนาดเรียก"},
    "rated_load": {"v":5500,"u":"N","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 5.00-5 6 ply (ยังไม่ตรวจกับ tire data book)"},
    "rated_pressure": {"v":50,"u":"psi","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6 ply"},
    "k_vertical": {"v":110000,"u":"N/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สเกลจากยางหลักตามขนาดและความดัน 45 psi"},
    "c_vertical": {"v":800,"u":"N s/m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ζ ของยางราว 0.05 ที่โหลดนิ่งล้อหน้า"},
    "cornering_stiffness_coef": {"v":3.2,"u":"1/rad","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "relaxation_length": {"v":0.2,"u":"m","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของยางหลักสเกลตามเส้นผ่านศูนย์กลาง"}
   },
   "brakes": {
    "force_limit_ratio": {"v":0.45,"u":"-","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: POH ลงจอด 575 ft จาก ~55 KTAS ต้องการเฉลี่ย ≥ 0.23 g"},
    "pressure_rise_rate": {"v":2.5,"u":"1/s","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S (เบรกเท้า hydraulic)"},
    "antiskid": {"v":0,"u":"bool","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"ไม่มี anti-skid; disc brake hydraulic ข้างละตัว (p7-14)"},
    "heat_sink_mass": {"v":1.5,"u":"kg","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จานเบรกเหล็กเดี่ยวกับ lining ต่อล้อ"},
    "heat_sink_cool_tau": {"v":600,"u":"s","scope":"gear","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เวลาเย็นตัวแบบ exponential ของจานเล็กในอากาศนิ่ง"},
    "fade_start_temp": {"v":400,"u":"degC","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "fade_full_temp": {"v":700,"u":"degC","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"}
   },
   "steering": {
    "mode": {"v":{"type":"pedal_linked","caster_with_diff_brake":true},"u":"-","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"steering bungee สปริงจากแป้น; เบรกข้างเดียวเลี้ยวต่อได้ถึง 30°"},
    "pedal_max": {"v":10,"u":"deg","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"ประมาณ 10° แต่ละข้าง (p7-12)"},
    "caster_max": {"v":30,"u":"deg","scope":"gear","src":["LC2"],"conf":"สูง","est":false,"note":"ถึง 30° ด้วยเบรก; ลากห้ามเกิน 30°"},
    "steer_rate": {"v":60,"u":"deg/s","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "shimmy_lag": {"v":0.05,"u":"s","scope":"gear","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "min_turn_radius_m": {"v":8.37,"u":"m","scope":"gear","src":["LC1","LC2"],"conf":"สูง","est":false,"note":"27 ft 5.5 in จากจุดหมุนถึงปลายปีกนอก (Information Manual p1-3); POH p7-12 ให้ราว 27 ft (8.23 m) เมื่อใช้เบรกข้างเดียวช่วย"}
   },
   "certification": {
    "part23_limit_descent": {"v":{"formula":"V = 4.4 (W/S)^0.25 fps, 7..10","WS_lb_ft2":14.66,"V_fps":8.61,"V_mps":2.624},"u":"fps","scope":"gear","src":["LM3","LC0"],"conf":"กลาง","est":false,"note":"14 CFR 23.473(d) เดิม กับ W/S 14.66"},
    "part23_wing_lift_ratio": {"v":0.667,"u":"-","scope":"gear","src":["LM3"],"conf":"กลาง","est":false,"note":"23.473(e) เดิม"},
    "part23_min_load_factors": {"v":{"inertia":2.67,"ground_reaction":2},"u":"g","scope":"gear","src":["LM3"],"conf":"กลาง","est":false,"note":"23.473(g) เดิม"},
    "part23_reserve_drop_factor": {"v":1.44,"u":"x drop height","scope":"gear","src":["LM3"],"conf":"กลาง","est":false,"note":"23.727 เดิม"}
   }
  }
 }
}
```

**บล็อก wind + input + validation**

```json
{
 "c172s": {
  "wind": {
   "fFactor": {
    "trainerExcessTW": {"v":0.088,"u":"-","scope":"aircraft","src":["LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: (T − D)/W ที่ approach แฟลป 30 คันเร่งเต็ม (ค่าจากโมเดล legacy ของบัตร)"}
   },
   "wake": {
    "b0_over_b": {"v":0.7854,"u":"-","scope":"aircraft","src":["LC10"],"conf":"กลาง","est":false,"note":"π/4 ปีกวงรี"},
    "rc_over_b": {"v":{"default":0.035,"min":0.02,"max":0.06},"u":"-","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "trainerRollControl": {"v":{"Clda":0.204,"daMax_deg":17.5,"ClMax":0.0623},"u":"-","scope":"aircraft","src":["LM5","LC6"],"conf":"กลาง","est":false,"note":"อำนาจม้วนสูงสุดของ C172S ใช้เทียบกับแรงม้วนของ wake"}
   }
  },
  "input": {
   "keyboard": {
    "interim_trim_rate_elevator": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["LC10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S"},
    "flap_notches": {"v":[0,0.3645,0.7882,1],"u":"สัดส่วน AC.flaps","scope":"aircraft","src":["LC2","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: detent 0/10/20/30° แปลงด้วยแรงยก (lift mapping)"}
   }
  },
  "validation": {
   "classification": {
    "hqClassCategory": {"v":{"class":"I","approachLanding":"C","cruiseClimb":"B","takeoff":"C"},"u":"-","scope":"aircraft","src":["R1:V8"],"conf":"สูง","est":false,"note":"MIL-F-8785C Class I (small light)"}
   },
   "procedures": {
    "v50MinFactor_singleEngine": {"v":1.2,"u":"× VS1","scope":"aircraft","src":["LM3"],"conf":"กลาง","est":false,"note":"14 CFR 23.51(b)(2)(ii) (ฉบับ 2011; ไม่ใช่ 23.53); POH 56 KIAS ที่ 50 ft แฟลป 10 ≈ 60.6 KCAS = 1.19 × VS(10°) 51 KCAS"}
   },
   "trim_targets": {
    "cruise": {"v":{"ias_kt":110,"h_ft":3000},"u":"kt CAS, ft","scope":"aircraft","src":["LC0"],"conf":"กลาง","est":false,"note":"สภาพ trim/linearise ของ lm_card (ราว 75 % ที่ 3,000 ft)"},
    "approach": {"v":{"ias_kt":67,"h_m":300,"gamma_deg":-3},"u":"kt CAS, m, deg","scope":"aircraft","src":["LC1","LC0"],"conf":"กลาง","est":false,"note":"normal approach แฟลป 30 65 KIAS ≈ 67 KCAS"}
   },
   "stall_test": {"v":{"0":70,"10":66,"20":64,"30":63},"u":"kt EAS","scope":"aircraft","src":["LC0"],"conf":"กลาง","est":false,"note":"ความเร็วเริ่มของการทดสอบ stall 1 kt/s (≈1.3 V_SR)"},
   "takeoff_test": {"v":{"flap":"10","VR_kt":52,"theta_deg":12},"u":"-, kt CAS, deg","scope":"aircraft","src":["LC2","LC0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: short field: lift-off 51 KIAS ≈ 57.6 KCAS ตามตาราง (ค่าสอบเทียบใช้กับการบินระดับ) ใช้ VR 52 KCAS θ 12° ค่าประมาณ (θ 8° ทำให้ล้อพ้นพื้นที่ 67 kt)"},
   "reference_modes": {"v":{"conditions":{"lo":"80 mph CAS = 69.5 KCAS (35.8 m/s), 4,000 ft (1,219 m) ISA, แฟลป 0","hi":"120 mph CAS = 104.3 KCAS (53.7 m/s), 4,100 ft (1,250 m) ISA, แฟลป 0","mass_kg":1115.8,"mass_lb":2460},"phugoid":{"ref_LC11_C177B":{"flap0":{"T_s":[17.6,19],"zeta":[0.047,0.061]},"flap30":{"T_s":[18.5,19.4],"zeta":[0.044,0.045]}},"model":{"flap0":{"wn_rad_s":0.3,"zeta":0.0936,"T_s":21},"flap30":{"wn_rad_s":0.301,"zeta":0.118,"T_s":21}},"test":"T-LC-32"},"dutch_roll":{"ref_LC11_C177B":{"lo":{"wn_rad_s":1.6,"zeta_min":0.5},"hi":{"wn_rad_s":2.1,"zeta_min":0.4}},"model":{"lo":{"wn_rad_s":1.58,"zeta":0.271,"T_s":4.14},"hi":{"wn_rad_s":2.27,"zeta":0.254,"T_s":2.86}},"jsbsim_c172x_R1V15":{"wn_rad_s":2.25,"zeta":0.16,"note":"แบบจำลอง ไม่ใช่การบิน"},"test":"T-LC-33"},"roll":{"input":"aileron เต็มเร็วที่สุด rudder ค้าง","ref_LC11_C177B":{"lo":{"pmax_dps":[33.2,35.9],"t30_s":[1.02,1.41],"pb2V":[0.0828,0.0896],"beta30_deg":[8.5,11]},"hi":{"pmax_dps":[53.8,54.7],"t30_s":[0.7,0.74],"pb2V":[0.0894,0.098],"beta30_deg":[3,3.5]}},"model":{"lo":{"pmax_dps":47.4,"t30_s":0.9,"pb2V":0.12,"beta30_deg":8.72,"tauR_s":0.205},"hi":{"pmax_dps":73.3,"t30_s":0.625,"pb2V":0.123,"beta30_deg":5,"tauR_s":0.135}},"test":"T-LC-34"},"short_period":{"ref":null,"ref_note":"ไม่พบโหมดตามยาวที่วัดจาก C172 หรือ C177B ที่เปิดเผย","model":{"lo":{"wn_rad_s":3.61,"zeta":0.705,"T_s":2.45},"hi":{"wn_rad_s":5.41,"zeta":0.703,"T_s":1.63}},"jsbsim_c172x_R1V15":{"wn_rad_s":6.5,"zeta":0.68,"at":"100 KCAS","note":"แบบจำลอง ไม่ใช่การบิน"}},"spiral":{"ref":null,"ref_note":"ไม่พบค่าที่วัดที่เปิดเผย (KU-M-407-7 บันทึกการบินยาวสำหรับ spiral แต่ตารางเป็นภาพไมโครฟิชอ่านไม่ได้)","model":{"lo":{"lam_1_s":-0.00867,"t_half_or_double_s":80,"divergent":false},"hi":{"lam_1_s":-0.0214,"t_half_or_double_s":32.5,"divergent":false}}}},"u":"s, rad/s, -, deg/s, deg","scope":"aircraft","src":["LC11","LC13","LM5","R1:V15","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าอ้างอิงวัดจากการบินทดสอบ Cessna 177B Cardinal (NASA CR-2337 Table IV, V และข้อความหน้า 26) ซึ่งเป็นเครื่อง Cessna ปีกสูงสี่ที่นั่งคนละแบบกับ C172 (ปีกไม่มีค้ำ stabilator ทั้งชิ้น) ใช้แทนเพราะไม่พบโหมดที่วัดจาก C172 ที่เปิดเผย; อนุพันธ์ของบัตรนี้คือชุดที่ NASA TM-80163 หาจากการบินของ C172 (KU-M-407-7 ยืนยันว่าเป็น C172) จึงไม่ใช่ค่าอ้างอิงอิสระ; ค่า model คำนวณด้วย lm_card ที่มวล 1,115.8 kg (linearise สำหรับ phugoid, Dutch roll, short period, spiral และจำลองเวลาจริง 240 Hz สำหรับการม้วน) ใน scripts/lc_tests.mjs; CR-2337 บอกเองว่า Dutch roll หน่วงสูงจนสกัดตัวเลขได้ไม่แม่น"},
   "stick_force_targets": {"v":{"fs_per_g_lbf":{"min":12.5,"max":42.9},"fs_per_g_N":{"min":56,"max":191},"nAlpha_cruise_g_per_rad":14.45,"nL":3.8,"mil_L1_wheel_lbf":{"min":12.5,"max":42.9},"part23_155_force_lbf":25.5,"part23_155_min_gradient_lbf":9.1,"fs_per_kt_min_lbf":0.167,"fs_per_kt_min_N":0.74},"u":"lbf/g, N/g, g/rad, lbf, lbf/kt, N/kt","scope":"aircraft","src":["R1:C12","LM3","LC14","LC1","LC0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่ใช่ค่าที่วัดจาก C172 แต่เป็นแถบเป้าหมายจากเกณฑ์ MIL-F-8785C Level 1 แบบ wheel (สูตรของ controls.requirements.mil8785c_fs_per_g_wheel_L1 รอบที่ 1) ด้วย n/α 14.5 g/rad ของบัตรที่ cruise 110 KCAS MTOW และ nL 3.8 (normal category) และพื้นขั้นต่ำจาก 14 CFR 23.155 (แรงถึง limit load ≥ W/100 = 25.5 lbf); แรงต่อ kt ขั้นต่ำ 1 lbf ต่อ 6 kt ยืมจาก 14 CFR 25.173(c) เพราะ Part 23 ไม่มีตัวเลข; ซิมวันนี้ไม่มีแบบจำลองแรงที่คันบังคับ จึงทดสอบไม่ได้ (T-LC-35)"}
  }
 }
}
```

**บล็อก _na**

```json
{
 "c172s": {
  "_na": {"v":["turboprop.*","turbofan.*","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.flightIdleShaftPower","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","gear.strut_main.p_static","gear.strut_main.piston_area","gear.strut_main.ratio_static_to_extended","gear.strut_main.ratio_compressed_to_extended","gear.strut_main.polytropic_n_dynamic","gear.strut_main.polytropic_n_static","gear.strut_main.Kh_compression","gear.strut_main.Kr_rebound","gear.strut_main.seal_friction_ratio","gear.brakes.antiskid_efficiency","gear.brakes.antiskid_efficiency_measured","gear.brakes.antiskid_slip_setpoint","gear.certification.part25_limit_descent","gear.certification.part25_friction_cap","controls.reference_types.*","controls.roll.tab_max","controls.roll.trim_rate","controls.yaw.tab_max","controls.yaw.trim_rate","controls.pitch.derived_check","interference.groundEffect.tablesCheck","wind.discreteGust.cfr25_341_Fg","wind.wake.leaders","numerics.*","validation.typicalModes.*","validation.currentModel.*","otherSims.*"],"u":"-","scope":"aircraft","src":["LC0"],"conf":"สูง","est":false,"note":"เครื่องลูกสูบใบพัด fixed pitch: ไม่มี turboprop/turbofan, governor, feather, reverse; ล้อหลักเป็นขาสปริงเหล็ก (ไม่มีพารามิเตอร์ oleo); ไม่มี anti-skid; ไม่ใช่ Part 25; ไม่มี aileron/rudder trim (TCDS มีแค่ elevator tab); controls.reference_types และ wind.wake.leaders เป็นค่าอ้างอิงของเครื่องโดยสาร; controls.pitch.derived_check และ groundEffect.tablesCheck เป็นค่าตรวจที่คำนวณจากสูตรของรอบที่ 1 ไม่ใช่ข้อมูลรายแบบ; numerics.* เป็นค่าของตัวซิม; validation.typicalModes/currentModel เป็นค่าของเครื่องฝึกรอบที่ 1 (ของ C172S อยู่ที่ validation.reference_modes และ §04.9); otherSims.* เป็นของหัวข้อ 03"}
 }
}
```
