```json
{
 "c172s": {
  "otherSims": {
   "jsbsim_c172p": {"v":{"file":"aircraft/c172p/c172p.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"$Id 1.29 2013-10-25","represents":"C172P (ไม่ใช่ 172S)","author":"Unknown","licence":"ไม่ระบุในไฟล์","engine":"eng_io320 (bsfc 0.32 → 205.9 hp จาก 160 hp)","use":"fixture ของ oracle เท่านั้น"},"u":"-","scope":"aircraft","src":["LB1","LB2","LB8"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2); ห้ามคัดลอก XML ลง repo"},
   "jsbsim_c172r": {"v":{"file":"aircraft/c172r/c172r.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"$Id 1.20 2012-12-22","represents":"C172R (โครงลำ) + เครื่อง 180 hp 2,700 rpm ซึ่งตรงพิกัดของ 172S","author":"Unknown","licence":"ไม่ระบุในไฟล์","use":"fixture; ใกล้ POH ที่สุดในตระกูล (4 ตรง 2 ใกล้ 1 ไม่ตรง)","results_at":"c172r.validation.openModels.jsbsim_c172r"},"u":"-","scope":"aircraft","src":["LB1","LB3","LB12"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2–03.3); ผลวัดย้ายไปไว้ใต้บัตร c172r ตอนแก้ช่องว่าง 28 (บัตร c172s ไม่ได้ใช้ผลชุดนี้)"},
   "jsbsim_c172x": {"v":{"file":"aircraft/c172x/c172x.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"Rev 1.91","represents":"1982 C172P ตามหัวไฟล์","author":"Tony Peden","licence":"GPL","defect":"แรงยกนับซ้ำ CLα 9.99/rad","use":"oracle ของสมการในรอบที่ 1 เท่านั้น ห้ามใช้เป็นเป้าสมรรถนะ"},"u":"-","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 1)"},
   "flightgear_c172p": {"v":{"repo":"github.com/c172p-team/c172p","licence":"GPL-2.0","commit_tried":"10a26158b6456244d84cbac27e6882bdc807f98c (2026-11-16)","fdm":"JSBSim c172p.xml $Id 1.41 (2018)","engines":["eng_io320 160 hp","eng_io360 180 hp"],"bsfc":"ปิดไว้ในไฟล์เครื่องยนต์ทั้งสอง","poh_refs":["172P 1982 POH p6-10","172S 1998 POH p6-12"],"published_poh_validation":"ไม่พบ","measured_here":false,"why_not":"jsbsim 1.3.3 (Python) ปิดโปรเซสทันที (C++ terminate) ระหว่างโหลดโมเดลนี้; หมดเวลาที่กำหนดไว้ ~20 นาทีต่อโมเดลก่อนหาสาเหตุได้"},"u":"-","scope":"aircraft","src":["LB18"],"conf":"กลาง","est":false,"note":"อ่านไฟล์ใน repo; พยายามรันวัดตอนแก้ช่องว่าง 14 (2026-11-19) แต่โหลดไม่ผ่าน; \"ไม่พบผลเทียบ\" ค้นเฉพาะ README และหน้า repo"},
   "closed_sims": {"v":{"xplane12":"ไม่เผยแพร่ผลเทียบ POH ของ C172 เป็นตัวเลข; proprietary","msfs":"ไม่เผยแพร่เป้าสมรรถนะของเครื่องที่มากับซิม; proprietary","geofs":"ปิดซอร์ส ไม่มีเอกสารฟิสิกส์"},"u":"-","scope":"aircraft","src":["R1:S14","R1:S15","R1:S19","R1:S26","LB26"],"conf":"กลาง","est":false,"note":"อ้างแนวคิดได้ ห้ามใช้ไฟล์เครื่องบิน (03.4.2)"}
  },
  "validation": {
   "openModels": {
    "jsbsim_c172p": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"c172p","dt_s":0.008333,"mass_lb":2400,"mass_kg":1089,"cg_x_in_model_datum":43.31,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้"},
     "stall_vs": {"v":{"0":54.49,"10":51.06,"20":49.53,"30":48.77},"u":"kt CAS","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° แรงยกลด, 10° elevator ชนสต็อป, 20° elevator ชนสต็อป, 30° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":1.225,"10":1.413,"20":1.533,"30":1.597},"u":"-","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 17.41/17.34/16.72/16.35°)"},
     "vy": {"v":95.6,"u":"kt CAS","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":5.92,"u":"m/s","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 1,165 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":85,"u":"kt CAS","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "glide_ld_max": {"v":10.46,"u":"-","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "cruise": {"v":{"8000ft_2600rpm":{"ktas":120,"kcas":106.5,"h_avg_ft":8000,"power_kW":88.1,"power_hp":118.2},"8000ft_2500rpm":{"ktas":113.7,"kcas":100.9,"h_avg_ft":8000,"power_kW":79.2,"power_hp":106.2},"4000ft_2500rpm":{"ktas":116,"kcas":109.4,"h_avg_ft":4000,"power_kW":88.2,"power_hp":118.3},"8000ft_full":{"ktas":134.5,"kcas":119.4,"h_avg_ft":8000,"power_kW":143.8,"power_hp":192.9}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":2538,"prop_rpm":2538,"power_kW":153.5,"power_hp":205.9,"thrust_N":2107,"thrust_lbf":473.7},"u":"-","scope":"aircraft","src":["LB1","LB2","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":343,"over50ft_m":556,"v_liftoff_kcas":58.4,"flap_deg":10},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB2"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 10 VR 50 KCAS θ 8°; 1,124 / 1,823 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.2501,"10":0.4501,"20":0.5501,"30":0.6001},"CLalpha_per_rad":{"0":5.465,"10":5.465,"20":5.465,"30":5.465},"CLmax":{"0":1.469,"10":1.669,"20":1.769,"30":1.819},"CDmin":{"0":0.0271,"10":0.034,"20":0.0395,"30":0.0464},"Cmalpha_per_rad":{"0":-1.873,"10":-1.878,"20":-1.881,"30":-1.882}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":3,"ใกล้":2,"ไม่ตรง":5,"เทียบไม่ได้":2},"u":"-","scope":"aircraft","src":["LB9","LB10"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3); ความเร็ว stall เทียบกับค่า CG หน้าสุดของ POH Fig 5-3"},
     "cruise_ktas_at_120hp_8000ft": {"v":120.9,"u":"kt TAS","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; interpolate ระหว่าง 2,500 และ 2,600 rpm ที่ 8,000 ft; POH 75% 120 KTAS [LB10]"}
    },
    "jsbsim_c172x": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"c172x","dt_s":0.008333,"mass_lb":2400,"mass_kg":1089,"cg_x_in_model_datum":41.76,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้"},
     "stall_vs": {"v":{"0":42.73,"10":41.33,"20":41.31,"30":41.16},"u":"kt CAS","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° แรงยกลด, 10° แรงยกลด, 20° แรงยกลด, 30° แรงยกลด"},
     "stall_cl": {"v":{"0":2.117,"10":2.267,"20":2.27,"30":2.288},"u":"-","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 12.71/12.05/11.78/11.65°)"},
     "vy": {"v":96.3,"u":"kt CAS","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":5.93,"u":"m/s","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 1,168 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":65,"u":"kt CAS","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "glide_ld_max": {"v":13.94,"u":"-","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "cruise": {"v":{"8000ft_2600rpm":{"ktas":116.5,"kcas":103.4,"h_avg_ft":8000,"power_kW":89.9,"power_hp":120.6},"8000ft_2500rpm":{"ktas":111.6,"kcas":99,"h_avg_ft":8000,"power_kW":80.2,"power_hp":107.6},"4000ft_2500rpm":{"ktas":112.4,"kcas":106,"h_avg_ft":3999,"power_kW":90.2,"power_hp":121},"8000ft_full":{"ktas":126.6,"kcas":112.4,"h_avg_ft":8005,"power_kW":130.3,"power_hp":174.8}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":2537,"prop_rpm":2537,"power_kW":153.4,"power_hp":205.7,"thrust_N":2106,"thrust_lbf":473.4},"u":"-","scope":"aircraft","src":["LB1","LB4","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":267,"over50ft_m":461,"v_liftoff_kcas":54.8,"flap_deg":10},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB4"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 10 VR 50 KCAS θ 8°; 875 / 1,512 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.25,"10":0.4999,"20":0.5498,"30":0.5997},"CLalpha_per_rad":{"0":9.994,"10":9.956,"20":9.906,"30":9.846},"CLmax":{"0":2.94,"10":3.167,"20":3.19,"30":3.208},"CDmin":{"0":0.0322,"10":0.0392,"20":0.0446,"30":0.0515},"Cmalpha_per_rad":{"0":-1.636,"10":-1.662,"20":-1.645,"30":-1.647}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":3,"ใกล้":2,"ไม่ตรง":5,"เทียบไม่ได้":2},"u":"-","scope":"aircraft","src":["LB9","LB10"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3); ความเร็ว stall เทียบกับค่า CG หน้าสุดของ POH Fig 5-3"},
     "cruise_ktas_at_120hp_8000ft": {"v":116.3,"u":"kt TAS","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; interpolate ที่ 120 hp; POH 120 KTAS [LB10]"}
    }
   }
  }
 }
}
```

```json
{
 "pa28_180": {
  "_na": {"v":["*"],"u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"id นี้มีไว้เก็บผลเทียบของโมเดลเปิด pa28 (JSBSim) เท่านั้น ไม่ใช่บัตรของแบบที่โรงเรียนไทยใช้ (บัตร PA-28 คือ pa28_161 ในหัวข้อ 13); ทุก path ต่อแบบของรอบที่ 1 จึงไม่มีโดยเจตนา (D5)"},
  "otherSims": {
   "jsbsim_pa28": {"v":{"file":"aircraft/pa28/pa28.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"Rev 1.18","represents":"PA28-180 ตามชื่อใน fdm_config","author":"Unknown","licence":"ไม่ระบุในไฟล์","defects":["ใบพัดปรับมุม propC8v (เครื่องจริง fixed pitch)","elevator หมดระยะที่ CL ≈ 0.99","ΔCL แฟลป 25° = +0.016","FGTrim ไม่ผ่าน","บินระดับที่ 8,000 ft ไม่ได้","เครื่องหมาย Clr −0.1665, Cldr −0.0192 และ Cnda +0.0068 (proverse) ขัดกับฟิสิกส์และนิยามของ AC (Clr > 0, Cldr > 0, Cnda < 0)"],"use":"ห้ามใช้เป็นแหล่งตัวเลขของ PA-28"},"u":"-","scope":"aircraft","src":["LB1","LB5","LB13"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 4, 03.3.2)"}
  },
  "validation": {
   "openModels": {
    "jsbsim_pa28": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"pa28","dt_s":0.008333,"mass_lb":2449,"mass_kg":1111,"cg_x_in_model_datum":88.42,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้; ใส่ครบ MTOW 2,450 lb แต่น้ำหนัก ณ เริ่มทดสอบเหลือ 2,449 lb เพราะเชื้อเพลิงลดระหว่างบินนิ่ง 25 s แทน FGTrim"},
     "stall_vs": {"v":{"0":64.26,"15":69.82,"25":75.88,"40":72.76},"u":"kt CAS","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° elevator ชนสต็อป, 15° elevator ชนสต็อป, 25° elevator ชนสต็อป, 40° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":0.989,"15":0.842,"25":0.724,"40":0.785},"u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 8.24/6.19/5.54/3.88°)"},
     "vy": {"v":86.7,"u":"kt CAS","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":2.17,"u":"m/s","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 427 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":100,"u":"kt CAS","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm; ค่าอยู่ที่ขอบช่วงที่กวาด (ค่าจริงของโมเดลอาจสูงกว่า)"},
     "glide_ld_max": {"v":7.04,"u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm"},
     "cruise": {"v":{"8000ft_135hp":{"ktas":74.5,"kcas":67.1,"h_avg_ft":6927,"power_kW":100.7,"power_hp":135},"8000ft_full":{"ktas":75,"kcas":67.1,"h_avg_ft":7413,"power_kW":108.2,"power_hp":145.1},"4000ft_135hp":{"ktas":71,"kcas":67.1,"h_avg_ft":3823,"power_kW":100.7,"power_hp":135}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":2631,"prop_rpm":2631,"power_kW":129.2,"power_hp":173.2,"thrust_N":3415,"thrust_lbf":767.8},"u":"-","scope":"aircraft","src":["LB1","LB5","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":"ไม่ยกตัวภายใน 120 s","u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 0 VR 60 KCAS θ 8°; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.524,"15":0.589,"25":0.54,"40":0.778},"CLalpha_per_rad":{"0":5.966,"15":5.966,"25":5.966,"40":5.966},"CLmax":{"0":1.911,"15":1.976,"25":1.927,"40":2.165},"CDmin":{"0":0.049,"15":0.059,"25":0.079,"40":0.099},"Cmalpha_per_rad":{"0":-2.341,"15":-2.337,"25":-2.346,"40":-2.326}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":1,"ใกล้":1,"ไม่ตรง":4,"เทียบไม่ได้":1},"u":"-","scope":"aircraft","src":["LB13"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "level_flight_8000ft": {"v":"บินระดับไม่ได้ที่ 70–140 KCAS แม้คันเร่งสุด (จม 274–1,922 fpm)","u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; preq ใน lb_perf_pa28.json; เพดานบินจริง 14,150 ft [LB13]"}
    }
   }
  }
 }
}
```

```json
{
 "pc7mk2": {
  "otherSims": {
   "jsbsim_pc7": {"v":{"file":"aircraft/pc7/pc7.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"Rev 1.18 (2016-06-06)","represents":"PC-7 รุ่นแรก PT6A 550 hp (ไม่ใช่ Mk II)","author":"Aeromatic v 3.3.0","licence":"ไม่ระบุในไฟล์","geometry_matches_public":"S 16.6 m², b 10.40 m, น้ำหนักเปล่า 1,330 kg","defects":["Cmα ไม่มีกำลังเป็นบวก (+0.25/rad แฟลป 0) เพราะ term Pitch_propwash คูณ thrust-coefficient ที่ค้าง −0.30 ขณะใบพัดหยุด 0 rpm","ROC ต่ำกว่าข้อมูลสาธารณะ 43%","บินระดับที่ 20,000 ft ไม่ได้"],"use":"fixture เท่านั้น"},"u":"-","scope":"aircraft","src":["LB1","LB6","LB14"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 5, 03.3.3)"},
   "flightgear_pc7": {"v":{"repo":"github.com/FGMEMBERS/pc7","licence":"GPL-3.0 (ไฟล์ COPYING)","fdm":"JSBSim PC-7.xml โดย Aeromatic v3.3.8 (2016, Rev 1.17, ALPHA) ตระกูลเดียวกับ pc7 ของ JSBSim","represents":"PC-7 รุ่นแรก (ไม่ใช่ Mk II)","authors_set":"Erik Hofman, Petar Jedvaj, Ernest Teuscher (based on David Culp's PC-7)","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB28"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ FDM และไฟล์ set ไม่ได้รันวัด; ขนาดและน้ำหนักเปล่าในไฟล์เท่ากับ pc7 ของ JSBSim (เพิ่มตอนตรวจทาน)"},
   "open_models_mk2": {"v":{"found":"แพ็กเกจ FlightGear PC-9M [LB27] มีไฟล์ PC-7mk2-set.xml (\"Pilatus PC-7 mk2\") และ pc7-set.xml (\"Pilatus PC-7\") แบบ variant-of PC-9M ซึ่งใช้ FDM PC-9M.xml เดียวกัน","engine":"ที่ commit 8cf7c87 FDM มีแค่ชุด PT6A-25 + ใบพัด 3 ใบที่ไม่ถูก comment ออก ทุกรุ่นย่อยจึงบินด้วยเครื่องและอากาศพลศาสตร์เดียวกัน (ไม่มีการปรับเฉพาะ MkII)","results_at":"pc9m.validation.openModels.flightgear_pc9m (มวล 2,350 kg ของ PC-9M)","dedicated_mk2_model":"ไม่พบ"},"u":"-","scope":"aircraft","src":["LB23","LB27"],"conf":"กลาง","est":false,"note":"ค้น GitHub 2026-11-18; ตรวจ FGMEMBERS ตอนตรวจทาน; อ่านไฟล์ set และรัน FDM ตอนแก้ช่องว่าง 14 (2026-11-19)"}
  },
  "validation": {
   "openModels": {
    "jsbsim_pc7": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"pc7","dt_s":0.008333,"mass_lb":5949,"mass_kg":2698,"cg_x_in_model_datum":154.02,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้; ใส่ครบ MTOW 5,952 lb แต่น้ำหนัก ณ เริ่มทดสอบเหลือ 5,949 lb เพราะเชื้อเพลิงลดระหว่างบินนิ่ง 25 s แทน FGTrim"},
     "stall_vs": {"v":{"0":74.92,"15":71.86,"30":69.12},"u":"kt CAS","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° elevator ชนสต็อป, 15° elevator ชนสต็อป, 30° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":1.521,"15":1.651,"30":1.787},"u":"-","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 18.36/18.54/18.57°)"},
     "vy": {"v":147.9,"u":"kt CAS","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":6.2,"u":"m/s","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 1,221 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":155,"u":"kt CAS","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm"},
     "glide_ld_max": {"v":13.89,"u":"-","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm"},
     "cruise": {"v":{"10000ft_full":{"ktas":195.2,"kcas":168.4,"h_avg_ft":10000,"power_kW":313.6,"power_hp":420.6},"20000ft_full":{"ktas":105.4,"kcas":83.6,"h_avg_ft":15193,"power_kW":253.6,"power_hp":340.1}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":41250,"prop_rpm":2200,"power_kW":380.8,"power_hp":510.7,"thrust_N":10764,"thrust_lbf":2419.8},"u":"-","scope":"aircraft","src":["LB1","LB6","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":669,"over50ft_m":1194,"v_liftoff_kcas":95,"flap_deg":15},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB6"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 15 VR 85 KCAS θ 8°; 2,194 / 3,916 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.3619,"15":0.4879,"30":0.6139},"CLalpha_per_rad":{"0":4.746,"15":4.634,"30":4.522},"CLmax":{"0":1.637,"15":1.729,"30":1.822},"CDmin":{"0":0.0267,"15":0.05,"30":0.0735},"Cmalpha_per_rad":{"0":0.248,"15":0.945,"30":1.642}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB6"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":2,"ไม่ตรง":1,"เทียบไม่ได้":1},"u":"-","scope":"aircraft","src":["LB14"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"}
    }
   }
  }
 }
}
```

```json
{
 "t6a": {
  "otherSims": {
   "jsbsim_t6texan2": {"v":{"file":"aircraft/t6texan2/t6texan2.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"Rev 1.14","author":"Aeromatic / David Culp","licence":"ไม่ระบุในไฟล์","defects":["เครื่องยนต์ PT6A-68.xml เป็น turbine (jet) แรงขับ 2,464 lbf ไม่มีใบพัด","ตาราง CL(α) และแฟลปเหมือน C172","ใส่น้ำหนักได้สูงสุด 6,000 lb"],"empty_weight":"5,000 lb ตรงกับ Navy fact file (Wikipedia 4,707 lb)","use":"fixture เท่านั้น"},"u":"-","scope":"aircraft","src":["LB1","LB7","LB8","LB16"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 6)"},
   "flightgear_t6": {"v":{"repo":"github.com/RobAndrew96/T-6-Texan-II","licence":"ไม่ระบุ (ห้ามนำมาใช้)","content":"1 commit; โฟลเดอร์ PC-9M เป็นสำเนาแพ็กเกจ PC-9M ของ FlightGear (PC-9M.xml ตรงกับ FGMEMBERS/PC-9M ทุกบรรทัด) มี T-6-set.xml เป็น variant-of PC-9M","commit":"bda592916b5453aee8eb70f7155661d5dd841ec0 (2024-01-11, commit เดียว)","measured_here":false,"results_at":"pc9m.validation.openModels.flightgear_pc9m (FDM เดียวกัน)"},"u":"-","scope":"aircraft","src":["LB21","LB27"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ตอนตรวจทาน; ยืนยันวันที่ด้วย git 2026-11-19; ไฟล์ต้นฉบับ GPL อยู่ที่ FGMEMBERS จึงอ้างต้นฉบับแทน"},
   "flightgear_t6_fgmembers": {"v":{"repo":"github.com/FGMEMBERS/T-6","commit":"15837eeccf087353a1636992ded82585f87d5dbb (2015-05-08)","licence":"GPL-2.0 (ไฟล์ COPYING)","fdm":"JSBSim T-6.xml โดย Petar Jedvaj (2011, Rev 1.9, BETA)","set":"ผู้สร้าง Rob Dosogne สถานะ development","engine":"PT6A-68 แบบ turbine (jet) + thruster direct ไม่มีใบพัด (เหมือน t6texan2)","mass":"น้ำหนักเปล่า 3,564 lb; ถัง + pointmass ใส่ได้ถึง 5,564 lb (MTOW 6,500 lb)","published_poh_validation":"ไม่พบ","measured_here":true,"results_at":"t6a.validation.openModels.flightgear_t6"},"u":"-","scope":"aircraft","src":["LB29"],"conf":"กลาง","est":false,"note":"รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19)"}
  },
  "validation": {
   "openModels": {
    "jsbsim_t6texan2": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"t6texan2","dt_s":0.008333,"mass_lb":6000,"mass_kg":2722,"cg_x_in_model_datum":189,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้; ใส่น้ำหนักได้แค่ 6,000 lb จาก MTOW 6,500 lb (ไม่มี pointmass ให้ใส่อีก 500 lb)"},
     "stall_vs": {"v":{"0":82.39,"15":76.01,"30":73.83},"u":"kt CAS","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° แรงยกลด, 15° แรงยกลด, 30° แรงยกลด"},
     "stall_cl": {"v":{"0":1.301,"15":1.544,"30":1.643},"u":"-","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 18.06/18.13/18.09°)"},
     "vy": {"v":167.4,"u":"kt CAS","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":22.07,"u":"m/s","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 4,344 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":150,"u":"kt CAS","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft"},
     "glide_ld_max": {"v":13.04,"u":"-","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด"},
     "cruise": {"v":{"1000ft_full":{"ktas":294.9,"kcas":290.8,"h_avg_ft":1000},"10000ft_full":{"ktas":307.6,"kcas":266.6,"h_avg_ft":10000},"22000ft_full":{"ktas":303.7,"kcas":218.1,"h_avg_ft":22000}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"thrust_N":10883,"thrust_lbf":2446.7},"u":"-","scope":"aircraft","src":["LB1","LB7","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s; ล้อไถลกับเบรก (14.51 kt)"},
     "takeoff": {"v":{"ground_roll_m":476,"over50ft_m":695,"v_liftoff_kcas":107.8,"flap_deg":15},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB7"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 15 VR 90 KCAS θ 8°; 1,562 / 2,281 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.2501,"15":0.5001,"30":0.6001},"CLalpha_per_rad":{"0":5.465,"15":5.465,"30":5.465},"CLmax":{"0":1.469,"15":1.719,"30":1.819},"CDmin":{"0":0.0231,"15":0.0257,"30":0.0244},"Cmalpha_per_rad":{"0":-1.89,"15":-1.893,"30":-1.891}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB7"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":1,"ไม่ตรง":1,"เทียบไม่ได้":1},"u":"-","scope":"aircraft","src":["LB16","LP23"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"}
    },
    "flightgear_t6": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"fg_t6","dt_s":0.008333,"mass_lb":5564,"mass_kg":2524,"cg_x_in_model_datum":164.16,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); FlightGear FGMEMBERS/T-6 commit 15837ee ไฟล์ T-6.xml (GPL-2.0 (COPYING)) ดึงด้วย lb_fg_fetch.py ไว้นอก repo; CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้; ใส่น้ำหนักได้แค่ 5,564 lb จาก MTOW 6,500 lb (ไม่มี pointmass ให้ใส่อีก 936 lb)"},
     "stall_vs": {"v":{"0":87.36,"0.5":81.62,"1.0":77.6},"u":"kt CAS","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° elevator ชนสต็อป, 0.5° แรงยกลด, 1.0° แรงยกลด"},
     "stall_cl": {"v":{"0":1.005,"0.5":1.211,"1.0":1.376},"u":"-","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 17.54/16.04/15.71°)"},
     "vy": {"v":208,"u":"kt CAS","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":43.29,"u":"m/s","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 8,521 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":170,"u":"kt CAS","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft"},
     "glide_ld_max": {"v":14.17,"u":"-","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด"},
     "cruise": {"v":{"1000ft_full":{"ktas":324.4,"kcas":320,"h_avg_ft":1000},"10000ft_full":{"ktas":335,"kcas":290.8,"h_avg_ft":10000}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"thrust_N":15464,"thrust_lbf":3476.4},"u":"-","scope":"aircraft","src":["LB1","LB29","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":454,"over50ft_m":641,"v_liftoff_kcas":126.8,"flap_deg":0.5},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB29"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 0.5 VR 90 KCAS θ 8°; 1,491 / 2,102 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.1698,"0.5":0.3198,"1.0":0.4698},"CLalpha_per_rad":{"0":4.482,"0.5":4.482,"1.0":4.482},"CLmax":{"0":1.191,"0.5":1.341,"1.0":1.491},"CDmin":{"0":0.0213,"0.5":0.0438,"1.0":0.0663},"Cmalpha_per_rad":{"0":-0.274,"0.5":-0.287,"1.0":-0.3}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB29"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":0,"ไม่ตรง":3,"เทียบไม่ได้":1},"u":"-","scope":"aircraft","src":["LP23","LB16","LP22"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "remark": {"v":"ห้ามใช้เป็นเป้า: แรงขับแบบ jet ทำให้ ROC 8,521 fpm (สาธารณะ 3,100 [LP23]) และ 324 KTAS ที่ 1,000 ft (270 kt [LB16]); น้ำหนักเปล่า 3,564 lb ต่ำกว่า fact file 5,000 lb [LB16] (03.3.6)","u":"-","scope":"aircraft","src":["LB29","LB16","LP23"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง"}
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "otherSims": {
   "jsbsim_bundled": {"v":"ไม่มีใน JSBSim 1.3.3","u":"-","scope":"aircraft","src":["LB1"],"conf":"สูง","est":false,"note":"ตรวจรายการเครื่องบินในแพ็กเกจ"},
   "flightgear_da40ng": {"v":{"repo":"github.com/sryu1/DA40","commit":"0d50a457edb203b9ac6058b41cac1b33922acf28 (2025-04-09)","licence":"GPL-2.0 (ไฟล์ COPYING)","fdm":"da40ng-jsb.xml โดย Aeromatic v 3.3.10 (2019, รุ่น 10/2021, ALPHA)","refs":"ขนาดและน้ำหนักอ้างหน้า AFM (\"ref. 1\")","note_izz":"Izz 5,000 slug·ft² ปรับให้เลี้ยวบนพื้นง่าย \"source needed\"","run_adapter":"FCS อ่านคันเร่งจาก /controls/engines/engine[0]/throttle และ FADEC อ่านความสูงจาก /position/altitude-ft ของ FlightGear; lb_jsb.FGProxy ส่งค่าให้","published_poh_validation":"ไม่พบ","measured_here":true,"results_at":"da40ng.validation.openModels.flightgear_da40ng"},"u":"-","scope":"aircraft","src":["LB19"],"conf":"กลาง","est":false,"note":"รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19); ค่าเรขาคณิตให้อ้าง AFM ต้นทาง"},
   "flightgear_da40ng_fg1000": {"v":{"repo":"github.com/CMDR-DiTRay/FGFS-DA40","licence":"GPL-2.0","last_commit":"a88e934c0eeb3949ba9f2e02a2bf9c9b7005d7be (2023-11-19)","measured_here":false},"u":"-","scope":"aircraft","src":["LB20"],"conf":"กลาง","est":false,"note":"ยืนยันวันที่ด้วย git ตอนแก้ช่องว่าง (2026-11-19); ไม่ได้อ่าน FDM"}
  },
  "validation": {
   "openModels": {
    "flightgear_da40ng": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"fg_da40ng","dt_s":0.008333,"mass_lb":2888,"mass_kg":1310,"cg_x_in_model_datum":-63.98,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); FlightGear sryu1/DA40 commit 0d50a45 ไฟล์ da40ng-jsb.xml (GPL-2.0 (COPYING)) ดึงด้วย lb_fg_fetch.py ไว้นอก repo; CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้"},
     "stall_vs": {"v":{"0":49.32,"15":47.1,"30":45.28},"u":"kt CAS","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° elevator ชนสต็อป, 15° elevator ชนสต็อป, 30° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":2.147,"15":2.287,"30":2.45},"u":"-","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 35.87/36.36/36.61°)"},
     "vy": {"v":85.3,"u":"kt CAS","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":3.28,"u":"m/s","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 646 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":80,"u":"kt CAS","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft"},
     "glide_ld_max": {"v":13.46,"u":"-","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด"},
     "cruise": {"v":{"8000ft_full":{"ktas":153.2,"kcas":136.1,"h_avg_ft":8000,"power_kW":123.5,"power_hp":165.6},"14000ft_100.8hp":{"ktas":112.5,"kcas":90.8,"h_avg_ft":13999,"power_kW":75.2,"power_hp":100.8},"16000ft_full":{"ktas":154.4,"kcas":120.9,"h_avg_ft":16000,"power_kW":107.8,"power_hp":144.6}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":3886,"prop_rpm":2300,"power_kW":122.5,"power_hp":164.3,"thrust_N":2096,"thrust_lbf":471.1},"u":"-","scope":"aircraft","src":["LB1","LB19","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":540,"over50ft_m":967,"v_liftoff_kcas":67.7,"flap_deg":15},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB19"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 15 VR 65 KCAS θ 8°; 1,771 / 3,174 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.6491,"15":0.8336,"30":1.0181},"CLalpha_per_rad":{"0":6.15,"15":6.15,"30":6.15},"CLmax":{"0":1.547,"15":1.731,"30":1.916},"CDmin":{"0":0.0332,"15":0.0647,"30":0.0969},"Cmalpha_per_rad":{"0":-1.334,"15":-1.346,"30":-1.358}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB19"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":3,"ใกล้":2,"ไม่ตรง":7,"เทียบไม่ได้":0},"u":"-","scope":"aircraft","src":["LD3","LD4","LD10","LD2"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "remark": {"v":"ห้ามใช้เป็นเป้า: ตาราง CL ของโมเดลขึ้นอีกหลัง α 24° การลดความเร็วจึงจบที่ α 36° CL 2.15 และ VS ต่ำกว่า AFM 22–24%; L/D 13.5 เทียบ 9.7; ส่วน ROC (646 เทียบ 651 fpm), ความเร็วเต็มกำลังที่ 16,000 ft (154.4 เทียบ 154 KTAS) และกำลังสถิตตรง (03.3.6)","u":"-","scope":"aircraft","src":["LB19","LD3","LD4"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง"}
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "otherSims": {
   "open_models": {"v":"JSBSim 1.3.3 ไม่มี DA42; FlightGear มีโมเดล YASim ของ DA 42-VI [LB30] (ไม่มีโมเดล JSBSim ของ DA42 ที่พบ)","u":"-","scope":"aircraft","src":["LB1","LB23","LB30"],"conf":"กลาง","est":false,"note":"ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ Diamond-DA42; oracle ของสมการยังต้องสร้าง JSBSim XML เอง"},
   "flightgear_da42": {"v":{"repo":"github.com/FGMEMBERS/Diamond-DA42","licence":"GPL-2.0 (ไฟล์ COPYING)","fdm":"YASim da42-yasim.xml (E. Baranger และคณะ v0.96 ปี 2016, Beta)","represents":"DA 42-VI","yasim_targets":"approach 55 kt ที่ AoA 4° / cruise 190 kt ที่ 16,000 ft / mass 1,700 lb (ค่าที่ผู้สร้างกรอก YASim แก้สัมประสิทธิ์ให้ตรงสองจุดนี้)","remark":"approach 55 kt ต่ำกว่า VS0 62 KIAS และ VREF 84 KIAS ของ DA42 NG ในหัวข้อ 06 จึงใช้เป็นแหล่งตัวเลขไม่ได้","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB30","LT2","LT9"],"conf":"กลาง","est":false,"note":"อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้ ต้องใช้ FlightGear)"}
  }
 }
}
```

```json
{
 "pc9m": {
  "otherSims": {
   "open_models": {"v":"JSBSim 1.3.3 ไม่มี PC-9; FlightGear มีโมเดล JSBSim ของ PC-9M [LB27] (รันวัดแล้ว 2026-11-19)","u":"-","scope":"aircraft","src":["LB1","LB23","LB27"],"conf":"กลาง","est":false,"note":"ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ PC-9M"},
   "flightgear_pc9m": {"v":{"repo":"github.com/FGMEMBERS/PC-9M","commit":"8cf7c875d7d4e3d0eaadd28f358c0c422ecb927f (2019-09-22)","licence":"ไม่มีไฟล์ COPYING ที่ราก repo; PC9-shared.xml ใช้โลโก้ GPLv3 (ถือเป็น GPL-3.0 จนกว่าจะยืนยัน)","fdm":"JSBSim PC-9M.xml โดย Erik Hofman, David Culp (2011, Rev 1.9, BETA)","refs":"หัวไฟล์อ้าง DSTO-TR-0479 (van Bronswijk และคณะ, อนุพันธ์จากการบินทดสอบ PC-9/A) = [LP26] ของหัวข้อ 07","engines":"ที่ commit นี้ชุด PT6A-62 และ PT6A-68 (ใบพัด 4 ใบ) ถูก comment ออก เหลือ PT6A-25 + ใบพัด 3 ใบ (ชุดของ PC-7) ที่ทุกรุ่นย่อยใช้","variants":"PC-9M, PC-9A, PC-7mk2, pc7, T-6 (ไฟล์ set แบบ variant-of PC-9M ใช้ FDM เดียวกัน)","status":"set 1.4.0; วิกิ FlightGear: early production","published_poh_validation":"ไม่พบ","measured_here":true,"results_at":"pc9m.validation.openModels.flightgear_pc9m","handover_file":"scripts/out/lb_pc9m_fg.json"},"u":"-","scope":"aircraft","src":["LB27","LB34","LP26"],"conf":"กลาง","est":false,"note":"รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19)"}
  },
  "validation": {
   "openModels": {
    "flightgear_pc9m": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"fg_pc9m","dt_s":0.008333,"mass_lb":5178,"mass_kg":2349,"cg_x_in_model_datum":201.18,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); FlightGear FGMEMBERS/PC-9M commit 8cf7c87 ไฟล์ PC-9M.xml (GPL-3.0 (GPLv3 logo in PC9-shared.xml; no COPYING file)) ดึงด้วย lb_fg_fetch.py ไว้นอก repo; CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้; ใส่ครบ MTOW 5,181 lb แต่น้ำหนัก ณ เริ่มทดสอบเหลือ 5,178 lb เพราะเชื้อเพลิงลดระหว่างบินนิ่ง 25 s แทน FGTrim"},
     "stall_vs": {"v":{"0":68.24,"23":64.03,"50":62.92},"u":"kt CAS","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° elevator ชนสต็อป, 23° แรงยกลด, 50° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":1.566,"23":1.818,"50":2.158},"u":"-","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 20.23/20.14/17.03°)"},
     "vy": {"v":136.7,"u":"kt CAS","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":27.73,"u":"m/s","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 5,458 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":155,"u":"kt CAS","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm"},
     "glide_ld_max": {"v":12.73,"u":"-","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm"},
     "cruise": {"v":{"10000ft_full":{"ktas":244.1,"kcas":210.9,"h_avg_ft":10000,"power_kW":325.2,"power_hp":436.1},"20000ft_full":{"ktas":240.1,"kcas":177.1,"h_avg_ft":20000,"power_kW":233.6,"power_hp":313.2}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":35370,"prop_rpm":2235,"power_kW":383,"power_hp":513.6,"thrust_N":18930,"thrust_lbf":4255.7},"u":"-","scope":"aircraft","src":["LB1","LB27","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s; ล้อไถลกับเบรก (25.25 kt)"},
     "takeoff": {"v":{"ground_roll_m":217,"over50ft_m":448,"v_liftoff_kcas":96.5,"flap_deg":23},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB27"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 23 VR 85 KCAS θ 8°; 712 / 1,469 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.4382,"23":0.6498,"50":0.8982},"CLalpha_per_rad":{"0":5.194,"23":5.194,"50":5.194},"CLmax":{"0":1.977,"23":2.188,"50":2.437},"CDmin":{"0":0.0239,"23":0.0606,"50":0.1039},"Cmalpha_per_rad":{"0":-0.423,"23":-0.662,"50":-0.943}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB27"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":2,"ไม่ตรง":3,"เทียบไม่ได้":1},"u":"-","scope":"aircraft","src":["LP2","LP12","LP13"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "derivatives": {"v":{"cruise":{"kcas":200,"h_ft":5000,"flap_deg":0,"gear_down":false,"alpha_trim_deg":-2.57,"elevator_trim_deg":1.14,"CL_trim":0.2192,"CLalpha":5.1819,"Cmalpha":-0.1662,"CLq":12.4716,"Cmq":-29.0522,"CLadot":4.0852,"Cmadot":-14.1367,"CYb":-0.7874,"Clb":-0.0999,"Cnb":0.0825,"CYp":0.16,"Clp":-0.471,"Cnp":-0.0556,"CYr":0.34,"Clr":0.1285,"Cnr":-0.211,"CLde":0.7886,"Cmde":-1.0573,"Clda":0.0991,"Cnda":-0.003,"CYdr":0.1937,"Cldr":0.0149,"Cndr":-0.1089},"approach":{"kcas":95,"h_ft":1000,"flap_deg":50,"gear_down":true,"alpha_trim_deg":0.73,"elevator_trim_deg":0.09,"CL_trim":0.9672,"CLalpha":5.1159,"Cmalpha":-1.1589,"CLq":12.4613,"Cmq":-29.053,"CLadot":4.0852,"Cmadot":-14.1367,"CYb":-1.3462,"Clb":-0.1139,"Cnb":0.2194,"CYp":0.16,"Clp":-0.471,"Cnp":-0.1,"CYr":0.34,"Clr":0.2925,"Cnr":-0.1276,"CLde":0.7873,"Cmde":-1.2803,"Clda":0.0991,"Cnda":-0.003,"CYdr":0.1582,"Cldr":0.014,"Cndr":-0.1089}},"u":"- (ต่อ rad; q และ α̇ ใช้ c̄/2V, p และ r ใช้ b/2V; มุม deg; kcas kt CAS; h_ft ft)","scope":"aircraft","src":["LB27","LB1"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_derivs.py: finite difference รอบ trim 1 g ไม่มีกำลัง โมเมนต์รอบ CG ที่โหลด (201.18 in ในพิกัดของโมเดล) มวล 2,350 kg; เครื่องหมายแบบ AC; δe ต่อ fcs/elevator-pos-rad, δa ต่อ left-aileron-pos-rad, δr ต่อ rudder-pos-rad; รายละเอียดและสภาพทดสอบใน scripts/out/lb_pc9m_fg.json"},
     "dsto_marked": {"v":{"constants":12,"tables":6,"readme_checked":16,"readme_match":13,"readme_differs":["Delta_Side_rudder_gear","Delta_Yaw_damp_gear","Yaw_damp"]},"u":"-","scope":"aircraft","src":["LB27","LP26"],"conf":"กลาง","est":false,"note":"ค่าใน PC-9M.xml ที่มี comment \"DSTO\" เทียบกับตารางที่ผู้สร้างถอดจาก DSTO-TR-0479 ไว้ใน README ของ repo (ยังไม่ได้เทียบกับรายงานต้นฉบับเพราะเปิดไฟล์ DTIC ไม่ได้); ค่าคงที่เดี่ยวอ้างได้พร้อมเลขบรรทัดใน lb_pc9m_fg.json ตารางไม่คัดลอก"},
     "remark": {"v":"ห้ามใช้สมรรถนะเป็นเป้า: เครื่องยนต์ในโมเดลเป็น PT6A-25 513.6 hp (PC-9M จริง PT6A-62 950 shp) แต่ใบพัดให้ T·V/P ≈ 1.8 และแรงขับสถิต 4,256 lbf จึงไต่ 5,458 fpm เกินค่าสาธารณะ 33% ขณะที่ความเร็วสูงสุดที่ 20,000 ft ต่ำกว่า 20%; การร่อนต่ำกว่า ~113 KCAS ใช้ไม่ได้เพราะ thrust coefficient ค้างเมื่อใบพัดหยุด (03.3.6)","u":"-","scope":"aircraft","src":["LB27","LP2","LP12"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง"}
    }
   }
  }
 }
}
```

```json
{
 "c172r": {
  "otherSims": {
   "jsbsim_c172r_ref": {"v":{"results_at":"c172r.validation.openModels.jsbsim_c172r","file":"aircraft/c172r/c172r.xml","represents":"โครงลำ C172R แต่เครื่อง engIO360C 180 hp 2,700 rpm (C172R จริง IO-360-L2A 160 hp 2,400 rpm)","use":"fixture เท่านั้น ห้ามใช้เป็นเป้าของบัตร c172r"},"u":"-","scope":"aircraft","src":["LB1","LB3","LB11"],"conf":"สูง","est":false,"note":"ผลวัดอยู่ใต้ c172r.validation.openModels ตั้งแต่การแก้ช่องว่าง 28 (2026-11-19); ก่อนหน้านี้อยู่ใต้ c172s"}
  },
  "validation": {
   "openModels": {
    "jsbsim_c172r": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"c172r","dt_s":0.008333,"mass_lb":2450,"mass_kg":1111,"cg_x_in_model_datum":40.23,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้"},
     "stall_vs": {"v":{"0":54.11,"10":50.8,"20":49.31,"30":48.61},"u":"kt CAS","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° แรงยกลด, 10° แรงยกลด, 20° elevator ชนสต็อป, 30° elevator ชนสต็อป"},
     "stall_cl": {"v":{"0":1.277,"10":1.46,"20":1.552,"30":1.599},"u":"-","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 17.5/17.49/17.49/17.48°)"},
     "vy": {"v":88.7,"u":"kt CAS","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":4.46,"u":"m/s","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 878 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":90,"u":"kt CAS","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "glide_ld_max": {"v":10.58,"u":"-","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)"},
     "cruise": {"v":{"8000ft_2600rpm":{"ktas":126.6,"kcas":112.4,"h_avg_ft":8000,"power_kW":99.5,"power_hp":133.4},"8000ft_2500rpm":{"ktas":120.8,"kcas":107.3,"h_avg_ft":8000,"power_kW":89,"power_hp":119.4},"4000ft_2500rpm":{"ktas":122.3,"kcas":115.3,"h_avg_ft":4000,"power_kW":99.6,"power_hp":133.5},"8000ft_full":{"ktas":131.9,"kcas":117.1,"h_avg_ft":8000,"power_kW":109.8,"power_hp":147.2}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":2124,"prop_rpm":2124,"power_kW":109,"power_hp":146.2,"thrust_N":2183,"thrust_lbf":490.8},"u":"-","scope":"aircraft","src":["LB1","LB3","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":281,"over50ft_m":472,"v_liftoff_kcas":60.8,"flap_deg":10},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB3"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 10 VR 51 KCAS θ 8°; 921 / 1,547 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.2501,"10":0.4501,"20":0.5501,"30":0.6001},"CLalpha_per_rad":{"0":5.465,"10":5.465,"20":5.465,"30":5.465},"CLmax":{"0":1.469,"10":1.669,"20":1.769,"30":1.819},"CDmin":{"0":0.0261,"10":0.033,"20":0.0385,"30":0.0454},"Cmalpha_per_rad":{"0":-1.707,"10":-1.713,"20":-1.715,"30":-1.717}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":4,"ใกล้":2,"ไม่ตรง":1,"เทียบไม่ได้":0},"u":"-","scope":"aircraft","src":["LE3","LB11"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3); ความเร็ว stall เทียบกับค่า CG หน้าสุดของ POH Fig 5-3"},
     "cruise_ktas_at_128hp_8000ft": {"v":124.4,"u":"kt TAS","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; interpolate ที่ 80% ของ 160 hp; POH 122 KTAS [LB11]"},
     "stall_basis": {"v":{"vs1_ref_kcas":52,"vs0_ref_kcas":47,"cg":"หน้าสุด"},"u":"kt CAS","scope":"aircraft","src":["LE3"],"conf":"สูง","est":false,"note":"ฐานที่ใช้เทียบ VS (POH Fig 5-3 2,450 lb power off CG หน้าสุด ตามบัตร 10-c172r); หน้า spec [LB11] ให้ 51 KCAS ซึ่งเป็นค่า CG หลังสุด; โมเดลวัดได้ 54.11 / 48.61 KCAS ที่ CG 40.23 in ในพิกัดของโมเดล (เทียบกับ datum ของ POH ไม่ได้)"}
    }
   }
  }
 }
}
```

```json
{
 "c152": {
  "otherSims": {
   "jsbsim_bundled": {"v":"ไม่มีใน JSBSim 1.3.3","u":"-","scope":"aircraft","src":["LB1"],"conf":"สูง","est":false,"note":"ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)"},
   "flightgear_c152": {"v":{"repo":"github.com/FGMEMBERS/c152","commit":"b8286b92050c4b77050ea262f6d2dedcc587b219 (2017-12-16)","licence":"GPL-2.0 (ไฟล์ LICENSE)","fdm":"JSBSim c152.xml โดย Aeromatic v0.95 (2015-10-04, Rev 1.15, ALPHA)","represents":"Cessna 152 II","authors":"README: Adrián Fernández (3D), Gilberto Agostinho (texture, โปรแกรม)","published_poh_validation":"ไม่พบ","measured_here":true,"results_at":"c152.validation.openModels.flightgear_c152"},"u":"-","scope":"aircraft","src":["LB32"],"conf":"กลาง","est":false,"note":"รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19); สัมประสิทธิ์จาก Aeromatic (ประมาณจากเรขาคณิต)"}
  },
  "validation": {
   "openModels": {
    "flightgear_c152": {
     "test_conditions": {"v":{"jsbsim":"1.3.3","model":"fg_c152","dt_s":0.008333,"mass_lb":1670,"mass_kg":757,"cg_x_in_model_datum":138.82,"atmosphere":"ISA ลมสงบ","payload":"pointmass ย้ายไปที่ CG อ้างอิงของโมเดล"},"u":"-","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"สภาพการรันของ lb_perf.py (03.1); FlightGear FGMEMBERS/c152 commit b8286b9 ไฟล์ c152.xml (GPL-2.0 (LICENSE)) ดึงด้วย lb_fg_fetch.py ไว้นอก repo; CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้"},
     "stall_vs": {"v":{"0":54.09,"10":51.49,"30":47.34},"u":"kt CAS","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: 0° แรงยกลด, 10° แรงยกลด, 30° แรงยกลด"},
     "stall_cl": {"v":{"0":1.308,"10":1.389,"30":1.674},"u":"-","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α 15.01/16.53/15.96°)"},
     "vy": {"v":95.4,"u":"kt CAS","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA คันเร่งสุด แฟลป 0"},
     "roc_max": {"v":4.79,"u":"m/s","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; 942 fpm ที่ Vy SL ISA"},
     "glide_best_speed": {"v":75,"u":"kt CAS","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; เครื่องดับ แฟลป 0 4,000–5,500 ft; ใบพัดของโมเดลหยุด 0 rpm"},
     "glide_ld_max": {"v":12.71,"u":"-","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; V_h/|ḣ| ที่ความเร็วร่อนดีสุด; ใบพัดของโมเดลหยุด 0 rpm"},
     "cruise": {"v":{"8000ft_2500rpm":{"ktas":109.8,"kcas":97.4,"h_avg_ft":8000,"power_kW":40.6,"power_hp":54.5},"8000ft_2400rpm":{"ktas":103.4,"kcas":91.7,"h_avg_ft":8000,"power_kW":36.7,"power_hp":49.2},"8000ft_full":{"ktas":146.8,"kcas":130.4,"h_avg_ft":8000,"power_kW":75,"power_hp":100.6}},"u":"kt TAS / kt CAS / kW","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power"},
     "static_full_throttle": {"v":{"engine_rpm":2441,"prop_rpm":2441,"power_kW":73.6,"power_hp":98.7,"thrust_N":1227,"thrust_lbf":275.9},"u":"-","scope":"aircraft","src":["LB1","LB32","LB8"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA เบรก คันเร่งสุด 10 s"},
     "takeoff": {"v":{"ground_roll_m":463,"over50ft_m":628,"v_liftoff_kcas":61.3,"flap_deg":10},"u":"m / kt CAS","scope":"aircraft","src":["LB1","LB32"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; SL ISA ลมสงบ แฟลป 10 VR 45 KCAS θ 8°; 1,519 / 2,062 ft; ขึ้นกับนักบินจำลอง"},
     "aero_static": {"v":{"CL0":{"0":0.25,"10":0.3833,"30":0.6499},"CLalpha_per_rad":{"0":5,"10":5,"30":5},"CLmax":{"0":1.39,"10":1.523,"30":1.789},"CDmin":{"0":0.0293,"10":0.0401,"30":0.0619},"Cmalpha_per_rad":{"0":-0.569,"10":-0.583,"30":-0.61}},"u":"- (CLalpha, Cmalpha ต่อ rad)","scope":"aircraft","src":["LB1","LB32"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป"},
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":4,"ไม่ตรง":7,"เทียบไม่ได้":0},"u":"-","scope":"aircraft","src":["LF1","LF6","LF2"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3); ความเร็ว stall เทียบกับค่า CG หน้าสุดของ POH Fig 5-3"},
     "remark": {"v":"ห้ามใช้เป็นเป้า: Vy 95 KCAS และ ROC 942 fpm เพราะใบพัด fixed pitch หมุนเกิน redline (2,805 rpm ที่ 95 KCAS); L/D 12.7 เทียบ 9.1 ของกฎ FAA และ 132 KTAS ที่ 75% เทียบ 107 แปลว่าแรงต้านต่ำเกินจริง; ความเร็ว stall สูงกว่า POH 10–13% (03.3.6)","u":"-","scope":"aircraft","src":["LB32","LF1","LF6"],"conf":"กลาง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง"}
    }
   }
  }
 }
}
```

```json
{
 "p2006t": {
  "otherSims": {
   "jsbsim_bundled": {"v":"ไม่มีใน JSBSim 1.3.3","u":"-","scope":"aircraft","src":["LB1"],"conf":"สูง","est":false,"note":"ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)"},
   "flightgear_p2006t": {"v":{"repo":"github.com/FGMEMBERS/Tecnam-P2006T","licence":"GPL-2.0 (ไฟล์ COPYING)","fdm":"YASim p2006t-yasim.xml (E. Baranger, v0.1, Alpha)","yasim_targets":"approach 47 kt ที่ AoA 4° / cruise 135 kt ที่ 5,000 ft / mass 1,675 lb (ค่าที่ผู้สร้างกรอก)","remark":"approach 47 kt ต่ำกว่า VS0 53 KIAS ของ AFM ในหัวข้อ 12 จึงใช้เป็นแหล่งตัวเลขไม่ได้","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB31","LG16","LG4"],"conf":"กลาง","est":false,"note":"อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้) (เพิ่มตอนตรวจทาน ตามงานที่หัวข้อ 12 ฝากไว้)"}
  }
 }
}
```

```json
{
 "pa28_161": {
  "otherSims": {
   "jsbsim_bundled": {"v":"JSBSim 1.3.3 มีแค่ pa28 (ชื่อ PA28-180) ซึ่งใช้เป็นแหล่งตัวเลขไม่ได้ (03.3.2); ผลวัดอยู่ใต้ pa28_180","u":"-","scope":"aircraft","src":["LB1","LB5"],"conf":"สูง","est":false,"note":"เพิ่มตอนตรวจทาน"},
   "flightgear_pa28": {"v":{"wiki":"wiki.flightgear.org/Piper_PA28_Warrior_II","licence":"GPLv2+ (infobox ของวิกิ)","fdm":"JSBSim","authors":"Josh Davidson (Octal450), legoboyvdlp, D-ECHO, Knüppelrührer","status":"Advanced production","variants":"PA28-161 เครื่อง O-320-D3G 160 hp และตัวเลือก O-360-A4A 180 hp","mirror_fgmembers":"github.com/FGMEMBERS/pa28-161 commit b1f3e3d (2019-09-22) เป็นโมเดลอีกตัวแบบ YASim (pa28-161.xml) รันด้วยแพ็กเกจ jsbsim ไม่ได้","published_poh_validation":"ไม่พบในหน้าวิกิ","measured_here":false},"u":"-","scope":"aircraft","src":["LB33"],"conf":"กลาง","est":false,"note":"อ่านหน้าวิกิตอนตรวจทาน; เปิดสำเนา FGMEMBERS ตอนแก้ช่องว่าง 14 (2026-11-19) พบว่าเป็น YASim"},
   "flightgear_pa28_warrior_jsbsim": {"v":{"repo":"github.com/FGDATA/PA28-Warrior","commit":"6b57d69a6b048dd216a09de5b27c2f004014cf0c (2018-09-04)","licence":"GPL-2.0 (ไฟล์ LICENSE; หัวไฟล์ Copyright (c) 2018 Joshua Davidson)","fdm":"JSBSim WarriorII-160.xml และ WarriorII-180.xml (metrics, mass_balance และ aerodynamics แยกไฟล์ด้วย file=)","measured_here":false,"why_not":"ต้องเขียนตัวต่อเพิ่ม: FCS อ่าน /controls/flight/* และ /velocities/airspeed-kt ของ FlightGear, elevator ออกเป็น fcs/elevator-deg แทน elevator-pos-rad และ lb_jsb.xml_facts ยังไม่ตามไฟล์ที่ include; เกินเวลาที่กำหนด ~20 นาทีต่อโมเดล (งาน P2 ใน 03.10)"},"u":"-","scope":"aircraft","src":["LB35"],"conf":"กลาง","est":false,"note":"พบตอนแก้ช่องว่าง 14 (2026-11-19) ขณะหา JSBSim FDM ของ PA28-161; ดึงไว้นอก repo ไม่ได้รันวัด"}
  }
 }
}
```
