# Review edits (part 3) for sec-07-gear.md: JSON leaves, test table, 7.10, references.
import sys, re
p = 'docs/research/01-flight-physics/sec-07-gear.md'
s = open(p, encoding='utf-8').read()
E = [
# ---- JSON
('"note":"drop 10 fps, L = 2/3: ใช้ 88%, n_g 2.32"}', '"note":"drop 10 fps, L = 2/3: ใช้ 88%, n_g 2.38 (strutStep ฉบับแก้; ฉบับแรก 2.32)"}'),
('"polytropic_n_static": {"v":1,"u":"-","scope":"gear","src":["G8"],"conf":"กลาง","est":true,"note":"ยุบช้า"}',
 '"polytropic_n_static": {"v":1,"u":"-","scope":"gear","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: การยุบช้าใกล้ isothermal (ฟิสิกส์ทั่วไป ไม่ได้มาจาก G8)"}'),
('"note":"drop 10 fps: n_g 2.98 ที่ 89%"}', '"note":"drop 10 fps: n_g 3.05 ที่ 89% (strutStep ฉบับแก้)"}'),
('"note":"TN 4110 eq.43 ให้ 0.24-0.35 m"}', '"note":"ค่าประมาณ; TN 4110 eq.43 ให้ 0.35 m (c = 0.55, การอ่านที่น่าจะถูก) หรือ 0.24 m (c = 5.5)"}'),
('"note":"TN D-8455: 0.78; JSBSim: 0.8"}', '"note":"TN D-8455: 0.78 (ค่าทำนายสำหรับยางเย็น 40x14 ที่ 140 psi ไม่ใช่ค่าวัดตรง); JSBSim c172p static_friction 0.8"}'),
('"outside_diameter": {"v":0.354,"u":"m","scope":"gear","src":["G18"],"conf":"สูง","est":false,"note":"14.0 in"}',
 '"outside_diameter": {"v":0.354,"u":"m","scope":"gear","src":["G18"],"conf":"สูง","est":false,"note":"13.9 in (เฉลี่ย 14.2/13.65)"}'),
('"note":"ระบบ slip-ratio control ของ NASA"}', '"note":"ระบบ slip-ratio control ของ NASA; wet = ผิวชื้นและน้ำท่วม (ช่วง 0.47-0.94), dry ช่วง 0.79-1.00"}'),
('"rolling_mu": {"v":{"paved":0.02,"gravel":0.04,"grass":0.1},"u":"-","scope":"environment","src":["G21","G19"],"conf":"ต่ำ","est":false,"note":"FlightGear materials, JSBSim c172p"}',
 '"rolling_mu": {"v":{"paved":0.02,"gravel":0.04,"ws30land":0.1},"u":"-","scope":"environment","src":["G21","G19"],"conf":"ต่ำ","est":false,"note":"FlightGear materials-base.xml (Asphalt, Gravel, ws30land = พื้นดินทั่วไปของ WS3.0 ไม่ใช่หญ้าโดยตรง), JSBSim c172p rolling_friction 0.02"}'),
('"friction_factor": {"v":{"paved":1,"gravel":0.5,"grass":0.7},"u":"-","scope":"environment","src":["G21"],"conf":"ต่ำ","est":false,"note":""}',
 '"friction_factor": {"v":{"paved":1,"gravel":0.5,"ws30land":0.7},"u":"-","scope":"environment","src":["G21"],"conf":"ต่ำ","est":false,"note":"ตัวคูณแรงเสียดทานทั้งหมดของ FlightGear (Asphalt 1.0)"}'),
# ---- tests
("(`g7_series.mjs`, `g7_ground.mjs`, `g7_stop.mjs`, `g7_tests.mjs`, `g7_patch.mjs`)",
 "(`g7_series.mjs`, `g7_ground.mjs`, `g7_stop.mjs`, `g7_tests.mjs`, `g7_patch.mjs` และสคริปต์ของการตรวจทาน `g7_review_series.mjs`, `g7_review_patch.mjs`, `g7_review_t05.mjs`, `g7_review_steer.mjs`, `g7_review_diffbrake.mjs`)"),
("| 1.0000; 14.5%; 1.304 m (ผ่าน ยกเว้น stroke ไม่มี) |",
 "| 1.0000; 14.5%; 1.304 m (ผ่าน ยกเว้น stroke ไม่มี) · โมเดลเสนอ (`g7_review_patch.mjs`): 1.0002; 14.7%; 1.312 m; stroke 158 mm |"),
("| $n_g$ = 2.32 ± 0.10; stroke 220 ± 10 mm; ไม่ถึงก้น; peak ที่ 50–90 ms; $n_g \\ge 2.0$ และ inertia ≥ 2.67 | `g7_series.mjs`; เกณฑ์ 23.473 [G3] |",
 "| $n_g$ = 2.38 ± 0.10; stroke 219 ± 10 mm; ไม่ถึงก้น; peak ที่ 50–90 ms | `g7_review_series.mjs` (strutStep ฉบับแก้); 10 fps และ L = 2/3 จาก 23.473(d),(e) [G3] |"),
("| ไม่ถึงก้น (stroke < 250 mm); $n_g$ = 2.71 ± 0.15 | `g7_series.mjs`; 23.727 [G5] |",
 "| ไม่ถึงก้น (stroke < 250 mm, ได้ 224 mm); $n_g$ = 2.80 ± 0.15 | `g7_review_series.mjs`; 23.727 [G5] |"),
("| T-G-05 | แรงต่อเนื่องตอนสัมผัส | 6-DOF, ปล่อยตก 3.0 m/s, pitch 5°, lift = W | แรงล้อหลักใน 10 ms แรก < 0.5 W_st | ฟิสิกส์ orifice + ยาง [G8] | **37.4 kN = 3.9 W_st ใน step แรก (ไม่ผ่าน)** |",
 "| T-G-05 | แรงต่อเนื่องตอนสัมผัส | (ก) 6-DOF, ปล่อยตก 3.0 m/s, pitch 5°, lift = W, เริ่มห่างพื้น 1 mm (ข) `strutStep` มวลเดียว W_st/g, 3.0 m/s, L = 1, dt 10 µs | (ก) แรงล้อหลักหลัง step แรก (1/240 s) ≤ 0.9 W_st (โมเดลเสนอได้ 0.73) (ข) N ที่ 1 ms = 0.20 ± 0.05 W_st และ N เปลี่ยนไม่เกิน 0.01 W_st ต่อ step | `g7_review_patch.mjs`, `g7_review_t05.mjs`; ฟิสิกส์ orifice + ยาง [G8] | **(ก) 37.4 kN = 3.91 W_st ใน step แรก (ไม่ผ่าน)**; code ฉบับแรกของ 7.2 ก็ไม่ผ่าน (ข): กระโดด 1.19 W_st |"),
("| ΣN/W สูงสุด = 1.92 ± 0.20 ที่ 40–90 ms; stroke หลัก 212 ± 15 mm | `g7_patch.mjs` |",
 "| ΣN/W สูงสุด = 1.98 ± 0.20 ที่ 40–90 ms; stroke หลัก 212 ± 15 mm | `g7_review_patch.mjs` |"),
("(แบบที่เสนอโดยยังไม่มี spin-up: 22–32 mm)", "(แบบที่เสนอโดยยังไม่มี spin-up: 21–27 mm, ΣN/W 1.05)"),
("| ไม่มี antiskid, เบรกเต็ม, N 9.5 kN, มุม slip 3° |", "| ไม่มี antiskid, เบรกเต็ม, N = W_st = 9,575 N, มุม slip 3° |"),
("| แท็กซี่ 5 m/s, แป้นสุด, ไม่เบรก | R = 12.5 ± 2 m; ที่ 10 m/s $a_y$ ≤ 0.35 g | wb/tan 12° (ค่าประมาณ), JSBSim c172p 10° [G19] |",
 "| แท็กซี่ 5 m/s และ 10 m/s, แป้นสุด, ไม่เบรก, ผิวแห้ง | 5 m/s: R = 12.7 ± 1.5 m, $a_y$ = 0.20 ± 0.03 g · 10 m/s: R = 13.9 ± 1.5 m, $a_y$ = 0.73 ± 0.10 g (ต้องไม่เกินขีดคว่ำ 0.89 g); ถ้าเปิดตัวจำกัดของ ASSIST: $a_y$ ≤ 0.35 g | แบบจำลองจักรยาน `g7_review_steer.mjs` (ค่าประมาณ), wb/tan 12°, JSBSim c172p 10° [G19] |"),
("| อัตรา yaw ไปซ้าย > 20°/s, รัศมี CG < 6 m, ล้อหน้าเข้าโหมด caster | 7.4–7.5 (ค่าประมาณ) |",
 "| อัตรา yaw ไปซ้าย > 20°/s, รัศมี CG < 6 m, ล้อหน้าเข้าโหมด caster | แบบจำลองระนาบ `g7_review_diffbrake.mjs` (ค่าประมาณ): idle ได้ yaw สูงสุด 42°/s; คุมความเร็ว 3 m/s ได้ 106°/s และรัศมี CG 1.6 m (หมุนรอบล้อซ้ายที่เบรก) |"),
# ---- 7.10
("- **Relaxation length:** สัมประสิทธิ์ในสูตร TN 4110 eq. 43 อ่านได้ทั้ง 0.55 และ 5.5 ให้ 0.35 หรือ 0.24 m [G9]",
 "- **Relaxation length:** สัมประสิทธิ์ในสูตร TN 4110 eq. 43 อ่านได้ทั้ง 0.55 และ 5.5 ให้ 0.35 หรือ 0.24 m [G9] การอ่านซ้ำในการตรวจทานเห็น \".55\" จึงเอนไปทาง 0.35 m แต่ยังไม่ได้เทียบกับภาพสแกน\n- **แรงตอนล้อแตะ (แก้ในการตรวจทาน):** code ฉบับแรกของ `strutStep` ให้ N กระโดด 1.19 W_st ทันทีที่แตะ เพราะ damping ยางไม่ถูกจำกัด จึงแก้ให้ $|c_t\\dot\\delta| \\le k_t\\delta$ ตัวเลขใน 7.2 และ T-G-03 ถึง T-G-07 คำนวณใหม่แล้ว\n- **การเลี้ยวด้วยแป้นที่ความเร็วสูง:** ข้อเสนอ 12° คงที่ให้ $a_y$ 0.73 g ที่ 10 m/s (ค่าประมาณ) จึงเป็นเรื่องเทคนิคการบินและ ASSIST ไม่ใช่สิ่งที่โมเดลยางแก้ได้"),
# ---- references
(" และสำเนาข้อความ https://anthonygarvan.github.io/allregs/html/sections/14CFR23.725.html (ปฐมภูมิ + สำเนาทุติยภูมิ) public domain",
 " (ปฐมภูมิ; สูตร $W_e$ ใน (b) เป็นรูปภาพที่ถอดข้อความไม่ได้) public domain"),
("NACA TN 4110, 1957 (ฉบับรายงานต่อมาคือ NASA TR R-64 ซึ่งไม่ได้เปิดในรอบนี้)",
 "NACA TN 4110, January 1958 (ตามระเบียน NTRS https://ntrs.nasa.gov/citations/19930084870; ฉบับรายงานต่อมาคือ NASA TR R-64 ซึ่งไม่ได้เปิดในรอบนี้)"),
("10. [G10] R. C. Dreher, W. B. Horne, *Phenomena of Pneumatic Tire Hydroplaning*, NASA TN D-2056, 1963,",
 "10. [G10] W. B. Horne, R. C. Dreher, *Phenomena of Pneumatic Tire Hydroplaning*, NASA TN D-2056, November 1963,"),
("NASA TN D-8455, 1977, https://ntrs.nasa.gov/api/citations/19770026206/downloads/19770026206.pdf (ปฐมภูมิ) งานรัฐบาลสหรัฐฯ ใช้ได้อิสระ",
 "NASA TN D-8455 (L-11292), October 1977, NTRS 19770026206, https://ntrs.nasa.gov/api/citations/19770026206/downloads/19770026206.pdf (ปฐมภูมิ) NTRS ระบุ \"Work of the US Gov. Public Use Permitted\""),
("(ปฐมภูมิ) © ICAO: อ้างข้อเท็จจริงและลิงก์เท่านั้น",
 "(ปฐมภูมิ; ชื่อในไฟล์คือ \"RCAM — WET and DRY only (based on PANS-Aerodromes (Doc 9981))\" ตัวไฟล์ไม่มีข้อความลิขสิทธิ์ แต่เนื้อหามาจาก Doc 9981 ซึ่ง ICAO สงวนลิขสิทธิ์) อ้างข้อเท็จจริงและลิงก์เท่านั้น"),
("8 Apr 2021, https://www.caat.or.th/wp-content/uploads/2021/08/1.-AIC-GRF.pdf (ปฐมภูมิ) เอกสารราชการ: อ้างและลิงก์ได้",
 "8 Apr 2021, https://www.caat.or.th/wp-content/uploads/2021/08/1.-AIC-GRF.pdf (ปฐมภูมิ; AIC ระบุว่ามีผลถึง 6 Nov 2023 จึงเป็นหลักฐานวันเริ่มใช้ GRF ส่วนสถานะปัจจุบันต้องตรวจใน AIP Thailand) เอกสารราชการ ไม่มีสัญญาอนุญาตเปิด: อ้างข้อเท็จจริงและลิงก์ได้"),
("https://github.com/JSBSim-Team/jsbsim/blob/master/src/models/FGLGear.cpp (โมเดลเปิด)",
 "https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGLGear.cpp และ https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/c172p/c172p.xml (โมเดลเปิด; ไฟล์ COPYING ของ repo คือ LGPL 2.1 และหัวไฟล์ระบุ \"version 2 ... or any later version\")"),
]
for old, new in E:
    n = s.count(old)
    if n != 1: sys.exit(f'COUNT {n} for: {old[:90]}')
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok', len(E))
