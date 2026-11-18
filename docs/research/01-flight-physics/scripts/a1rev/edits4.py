import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
('ช่วง autorotation ในต้นแบบกว้างถึงราว 21.5° (ข้อมูล [A17] ชี้ว่าเครื่องจริงบางแบบกว้างถึง ~32°; ปรับได้ด้วย a1 และกิ่งแยกตัว)',
 'ช่วง autorotation ในต้นแบบกว้างถึงราว 21.5° (ปรับได้ด้วย a1 และกิ่งแยกตัว; [A17] ให้เพียงข้อสรุปเชิงคุณภาพว่าการคง C_R ไม่ให้ลดลงหลัง stall ซึ่ง droop ทำได้ถึงราว α 32° ช่วยกำจัด autorotation ไม่ได้ให้ความกว้างของช่วง autorotation ของเครื่องจริง)'),
('ช่วง autorotation ในต้นแบบกว้างราว 6.5° ขณะที่ข้อมูล [A17] บอกเป็นนัยว่าบางเครื่องกว้างถึงราว 32°',
 'ช่วง autorotation ในต้นแบบกว้างราว 6.5° (15.05–21.5°) ยังไม่มีข้อมูลสาธารณะที่เปิดอ่านแล้วซึ่งให้ความกว้างของช่วงนี้ของเครื่องจริง ([A17] บอกเพียงว่าความชันของ C_R หลัง stall สำคัญต่อ autorotation และ droop คง C_R ไว้ได้ถึงราว α 32°)'),
('งานในอุโมงค์ 12-ft ของแบบ T-tail ปีกต่ำ 1/6 พบว่าการติด leading-edge droop ที่ปีกนอก "ทำให้ resultant-force coefficient คงที่หรือเพิ่มขึ้นถึงราว α 32°" และโยงความชันของเส้นนี้กับการหายไปของ autorotation [A17]',
 'งานในอุโมงค์ลมของแบบ T-tail ปีกต่ำพบว่าการติด leading-edge droop ที่ปีกนอก "maintained or increased the resultant-force coefficient up to about alpha = 32 degrees" และโยงการเปลี่ยนความชันของเส้นนี้กับการกำจัด autorotation และความต้านทาน spin [A17] (ขนาดอุโมงค์และมาตราส่วนแบบจำลองยังไม่ได้ยืนยันจากตัวรายงาน)'),
# refs
('ปฐมภูมิ (peer-reviewed conference) · ลิขสิทธิ์ AIAA, author manuscript แบบ Green OA · อ้างสมการและค่าพารามิเตอร์ได้ ห้ามคัดลอกข้อความ/รูป',
 'ปฐมภูมิ (conference paper, 2018 AIAA Modeling and Simulation Technologies Conference; DOI ยืนยันจาก https://research.tudelft.nl/en/publications/aerodynamic-stall-and-buffet-modeling-for-the-cessna-citation-ii-/) · ลิขสิทธิ์ AIAA; ไฟล์ที่ TU Delft เผยแพร่เป็น accepted author manuscript ไม่ระบุ license เปิด · อ้างสมการและค่าพารามิเตอร์ได้ ห้ามคัดลอกข้อความ/รูป'),
('AIAA 2014-0542, NASA Langley, 2014, https://ntrs.nasa.gov/citations/20140011902 — ปฐมภูมิ · Work of the US Gov, public use permitted · ใช้สมการ/ตัวเลขได้',
 'AIAA 2014-0542 (AIAA Atmospheric Flight Mechanics Conference), NASA Langley, 2014, https://ntrs.nasa.gov/citations/20140011902 — ปฐมภูมิ · NTRS ระบุ "Work of the US Gov. Public Use Permitted." · ใช้สมการ/ตัวเลขได้ (ยืนยันจำนวน 45 เทอมจากบทคัดย่อ; ช่วง α/β ของข้อมูลยังไม่ยืนยัน)'),
('· ข้อความ CC-BY-SA 2.5 · อ้างวิธีเรียก API ได้ ไม่คัดลอกข้อความยาว',
 '· ข้อความ CC-BY-SA 2.5, ตัวอย่างโค้ด CC0 · อ้างวิธีเรียก API ได้ ไม่คัดลอกข้อความยาว'),
('https://github.com/JSBSim-Team/jsbsim — ปฐมภูมิ (โค้ดเปิด) · LGPL-2.1 ·',
 'https://github.com/JSBSim-Team/jsbsim — ปฐมภูมิ (โค้ดเปิด) · LGPL-2.1 (ไฟล์ COPYING; header ของไฟล์ระบุ "version 2 … or any later version") ·'),
('Journal of Aircraft 31(5), 1994, https://www.scilit.net/publications/8d16badaad5e6a2d32866ae4f5b13b0f — ปฐมภูมิ (ไม่ได้เปิดตัวบทความ อ้างผ่าน [A11, A12])',
 'Journal of Aircraft 31(5), 1994, https://www.scilit.net/publications/8d16badaad5e6a2d32866ae4f5b13b0f — ปฐมภูมิ (ไม่ได้เปิดตัวบทความ อ้างผ่าน [A11, A12]; URL และเลขเล่มยังไม่ยืนยันในการตรวจทาน)'),
('"Flight investigation of the effects of an outboard wing-leading-edge modification on stall/spin characteristics of a low-wing, single-engine, T-tail light airplane", NASA TP-2691, 1987, https://ntrs.nasa.gov/citations/19870014181 — ปฐมภูมิ · US Gov · ใช้ได้',
 '"Flight investigation of the effects of an outboard wing-leading-edge modification on stall/spin characteristics of a low-wing, single-engine, T-tail light airplane", NASA TP-2691, 1987, https://ntrs.nasa.gov/citations/19870014181 (PDF https://ntrs.nasa.gov/api/citations/19870014181/downloads/19870014181.pdf) — ปฐมภูมิ · "Work of the US Gov. Public Use Permitted." · ใช้ได้ (ยืนยันแล้ว: 4 ที่นั่ง 200 hp, stall ราว α 20°, spin ราว α 43°)'),
('NASA CR-3636, 1982, https://ntrs.nasa.gov/citations/19830003779 — ปฐมภูมิ · US Gov · ใช้ได้ (รอบนี้อ่านเฉพาะบทคัดย่อ)',
 'NASA CR-3636 (Kentron International สำหรับ NASA), 1982, https://ntrs.nasa.gov/citations/19830003779 — ปฐมภูมิ · NTRS ระบุ "Work of the US Gov. Public Use Permitted." · ใช้ได้ (รอบนี้อ่านเฉพาะบทคัดย่อ)'),
]
for a, b in E:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:80]); continue
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
