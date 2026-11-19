```json
{
 "c172s": {
  "otherSims": {
   "jsbsim_c172p": {"v":{"file":"aircraft/c172p/c172p.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"$Id 1.29 2013-10-25","represents":"C172P (ไม่ใช่ 172S)","author":"Unknown","licence":"ไม่ระบุในไฟล์","engine":"eng_io320 (bsfc 0.32 → 205.9 hp จาก 160 hp)","use":"fixture ของ oracle เท่านั้น"},"u":"-","scope":"aircraft","src":["LB1","LB2","LB8"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2); ห้ามคัดลอก XML ลง repo"},
   "jsbsim_c172r": {"v":{"file":"aircraft/c172r/c172r.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"$Id 1.20 2012-12-22","represents":"C172R (โครงลำ) + เครื่อง 180 hp 2,700 rpm ซึ่งตรงพิกัดของ 172S","author":"Unknown","licence":"ไม่ระบุในไฟล์","use":"fixture; ใกล้ POH ที่สุดในตระกูล (3 ตรง 3 ใกล้ 1 ไม่ตรง)"},"u":"-","scope":"aircraft","src":["LB1","LB3","LB12"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2–03.3)"},
   "jsbsim_c172x": {"v":{"file":"aircraft/c172x/c172x.xml","package":"jsbsim 1.3.3 (PyPI)","rev":"Rev 1.91","represents":"1982 C172P ตามหัวไฟล์","author":"Tony Peden","licence":"GPL","defect":"แรงยกนับซ้ำ CLα 9.99/rad","use":"oracle ของสมการในรอบที่ 1 เท่านั้น ห้ามใช้เป็นเป้าสมรรถนะ"},"u":"-","scope":"aircraft","src":["LB1","LB4"],"conf":"สูง","est":false,"note":"อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 1)"},
   "flightgear_c172p": {"v":{"repo":"github.com/c172p-team/c172p","licence":"GPL-2.0","fdm":"JSBSim c172p.xml $Id 1.41 (2018)","engines":["eng_io320 160 hp","eng_io360 180 hp"],"bsfc":"ปิดไว้ในไฟล์เครื่องยนต์ทั้งสอง","poh_refs":["172P 1982 POH p6-10","172S 1998 POH p6-12"],"published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB18"],"conf":"กลาง","est":false,"note":"อ่านไฟล์ใน repo ยังไม่ได้รันวัด; \"ไม่พบผลเทียบ\" ค้นเฉพาะ README และหน้า repo"},
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
     "poh_verdict": {"v":{"ตรง":1,"ใกล้":4,"ไม่ตรง":5,"เทียบไม่ได้":2},"u":"-","scope":"aircraft","src":["LB9","LB10"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "cruise_ktas_at_120hp_8000ft": {"v":120.9,"u":"kt TAS","scope":"aircraft","src":["LB1","LB2"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; interpolate ระหว่าง 2,500 และ 2,600 rpm ที่ 8,000 ft; POH 75% 120 KTAS [LB10]"}
    },
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
     "poh_verdict": {"v":{"ตรง":3,"ใกล้":3,"ไม่ตรง":1,"เทียบไม่ได้":0},"u":"-","scope":"aircraft","src":["LB11"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
     "cruise_ktas_at_128hp_8000ft": {"v":124.4,"u":"kt TAS","scope":"aircraft","src":["LB1","LB3"],"conf":"สูง","est":false,"note":"ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; interpolate ที่ 80% ของ 160 hp; POH 122 KTAS [LB11]"}
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
     "poh_verdict": {"v":{"ตรง":3,"ใกล้":3,"ไม่ตรง":4,"เทียบไม่ได้":2},"u":"-","scope":"aircraft","src":["LB9","LB10"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"},
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
   "open_models_mk2": {"v":"ไม่พบโมเดลเปิดเฉพาะ PC-7 MkII; แพ็กเกจ FlightGear PC-9M [LB27] มีรุ่นย่อย \"Pilatus PC-7\" (variant-of PC-9M) ที่ใช้ FDM ของ PC-9M กับชุดเครื่อง PT6A-25 ใบพัด 3 ใบ","u":"-","scope":"aircraft","src":["LB23","LB27"],"conf":"กลาง","est":false,"note":"ค้น GitHub 2026-11-18; ตรวจ FGMEMBERS เพิ่มตอนตรวจทาน 2026-11-19"}
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
   "flightgear_t6": {"v":{"repo":"github.com/RobAndrew96/T-6-Texan-II","licence":"ไม่ระบุ (ห้ามนำมาใช้)","content":"1 commit; โฟลเดอร์ PC-9M เป็นสำเนาแพ็กเกจ PC-9M ของ FlightGear (PC-9M.xml ตรงกับ FGMEMBERS/PC-9M ทุกบรรทัด) มี T-6-set.xml เป็น variant-of PC-9M","last_push":"2024-01-11","measured_here":false},"u":"-","scope":"aircraft","src":["LB21","LB27"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ตอนตรวจทาน; ไฟล์ต้นฉบับ GPL อยู่ที่ FGMEMBERS จึงอ้างต้นฉบับแทน"},
   "flightgear_t6_fgmembers": {"v":{"repo":"github.com/FGMEMBERS/T-6","licence":"GPL-2.0 (ไฟล์ COPYING)","fdm":"JSBSim T-6.xml โดย Petar Jedvaj (2011, Rev 1.9, BETA)","set":"ผู้สร้าง Rob Dosogne สถานะ development","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB29"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ FDM และไฟล์ set ไม่ได้รันวัด (เพิ่มตอนตรวจทาน; งาน P2 ใน 03.10)"}
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
     "poh_verdict": {"v":{"ตรง":0,"ใกล้":1,"ไม่ตรง":0,"เทียบไม่ได้":2},"u":"-","scope":"aircraft","src":["LB16"],"conf":"สูง","est":false,"note":"จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)"}
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
   "flightgear_da40ng": {"v":{"repo":"github.com/sryu1/DA40","licence":"GPL-2.0","fdm":"da40ng-jsb.xml โดย Aeromatic v 3.3.10 (2019, รุ่น 10/2021, ALPHA)","refs":"ขนาดและน้ำหนักอ้างหน้า AFM (\"ref. 1\")","note_izz":"Izz 5,000 slug·ft² ปรับให้เลี้ยวบนพื้นง่าย \"source needed\"","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB19"],"conf":"กลาง","est":false,"note":"อ่านไฟล์ FDM ไม่ได้รันวัด; ค่าเรขาคณิตให้อ้าง AFM ต้นทาง"},
   "flightgear_da40ng_fg1000": {"v":{"repo":"github.com/CMDR-DiTRay/FGFS-DA40","licence":"GPL-2.0","updated":"2023-11-19","measured_here":false},"u":"-","scope":"aircraft","src":["LB20"],"conf":"กลาง","est":false,"note":"ไม่ได้อ่าน FDM"}
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
   "open_models": {"v":"JSBSim 1.3.3 ไม่มี PC-9; FlightGear มีโมเดล JSBSim ของ PC-9M [LB27]","u":"-","scope":"aircraft","src":["LB1","LB23","LB27"],"conf":"กลาง","est":false,"note":"ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ PC-9M"},
   "flightgear_pc9m": {"v":{"repo":"github.com/FGMEMBERS/PC-9M","licence":"ไม่มีไฟล์ COPYING ที่ราก repo; PC9-shared.xml ใช้โลโก้ GPLv3 (ถือเป็น GPL-3.0 จนกว่าจะยืนยัน)","fdm":"JSBSim PC-9M.xml โดย Erik Hofman, David Culp (2011, Rev 1.9, BETA)","refs":"หัวไฟล์อ้าง DSTO-TR-0479 (van Bronswijk และคณะ, อนุพันธ์จากการบินทดสอบ PC-9/A) = [LP26] ของหัวข้อ 07","engines":"ชุดเครื่อง PT6A-25 (ใบพัด 3 ใบ), PT6A-62 และ PT6A-68 (ใบพัด 4 ใบ) ใน FDM เดียว; มีไฟล์ set รุ่นย่อย PC-7","status":"set 1.4.0; วิกิ FlightGear: early production","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB27","LB34","LP26"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ FDM ไม่ได้รันวัด; ต้องตรวจว่าค่าอนุพันธ์ในไฟล์มาจาก DSTO-TR-0479 จริงหรือไม่ก่อนใช้ (งาน P2 ใน 03.10)"}
  }
 }
}
```

```json
{
 "c172r": {
  "otherSims": {
   "jsbsim_c172r_ref": {"v":{"results_at":"c172s.validation.openModels.jsbsim_c172r","file":"aircraft/c172r/c172r.xml","represents":"โครงลำ C172R แต่เครื่อง engIO360C 180 hp 2,700 rpm (C172R จริง IO-360-L2A 160 hp 2,400 rpm)","use":"fixture เท่านั้น ห้ามใช้เป็นเป้าของบัตร c172r"},"u":"-","scope":"aircraft","src":["LB1","LB3","LB11"],"conf":"สูง","est":false,"note":"ผลวัดเก็บใต้ c172s เพราะหัวข้อ 03 เขียนก่อนมีบัตร c172r; บัตร c172r สืบทอด c172s จึงเห็นผลชุดนี้ผ่าน _inherits (เพิ่มตอนตรวจทาน)"}
  }
 }
}
```

```json
{
 "c152": {
  "otherSims": {
   "jsbsim_bundled": {"v":"ไม่มีใน JSBSim 1.3.3","u":"-","scope":"aircraft","src":["LB1"],"conf":"สูง","est":false,"note":"ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)"},
   "flightgear_c152": {"v":{"repo":"github.com/FGMEMBERS/c152","licence":"GPL-2.0 (GitHub)","fdm":"JSBSim c152.xml โดย Aeromatic v0.95 (2015-10-04, Rev 1.15, ALPHA)","represents":"Cessna 152 II","authors":"README: Adrián Fernández (3D), Gilberto Agostinho (texture, โปรแกรม)","published_poh_validation":"ไม่พบ","measured_here":false},"u":"-","scope":"aircraft","src":["LB32"],"conf":"กลาง","est":false,"note":"อ่านหัวไฟล์ FDM และหน้า repo ไม่ได้รันวัด; สัมประสิทธิ์จาก Aeromatic (ประมาณจากเรขาคณิต) (เพิ่มตอนตรวจทาน)"}
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
   "flightgear_pa28": {"v":{"wiki":"wiki.flightgear.org/Piper_PA28_Warrior_II","licence":"GPLv2+ (infobox ของวิกิ)","fdm":"JSBSim","authors":"Josh Davidson (Octal450), legoboyvdlp, D-ECHO, Knüppelrührer","status":"Advanced production","variants":"PA28-161 เครื่อง O-320-D3G 160 hp และตัวเลือก O-360-A4A 180 hp","mirror":"github.com/FGMEMBERS/pa28-161 (ยังไม่ได้เปิด)","published_poh_validation":"ไม่พบในหน้าวิกิ","measured_here":false},"u":"-","scope":"aircraft","src":["LB33"],"conf":"กลาง","est":false,"note":"อ่านหน้าวิกิเท่านั้น ยังไม่ได้เปิด FDM (เพิ่มตอนตรวจทาน)"}
  }
 }
}
```
