# v10rev_edits1.py: targeted, checked replacements in sec-10 (each old string must occur exactly once)
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
# 10.1 table DR criterion
("| ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 0.4 ✓ |",
 "| ζ ≥ 0.08, ζωn ≥ 0.15; ωn ≥ 1.0 (Cat C ตาม [V10]) หรือ ≥ 0.4 (Cat B [V11]) ✓ |"),
# 10.1 (5) theta
("(5) ตอน approach θ ออกมา −1.24° คือจมูกต่ำกว่าขอบฟ้าบนเส้นร่อน 3°",
 "(5) ตอน approach θ ออกมา −1.27° จาก `trim()` (−1.24° จาก `setApproach()` ซึ่งได้ α 1.76°) คือจมูกต่ำกว่าขอบฟ้าบนเส้นร่อน 3°"),
# 10.2 general tolerance rule (now confirmed)
("บางรายการเขียนชัดว่าให้ใช้ค่าที่เล็กกว่า เช่นข้อ 1.e.1 ส่วนกฎทั่วไปที่ว่ารายการอื่นให้ใช้ค่าที่หลวมกว่า (less restrictive) ยังไม่ได้ยืนยันจากต้นฉบับ ฟังก์ชันตรวจจึงควรรับโหมดเป็นพารามิเตอร์",
 "กฎทั่วไปใน Attachment 2 ข้อ 2.b ของฉบับถอดความ [V2] เขียนว่า \"When two tolerance values are given for a parameter, the less restrictive may be used unless otherwise indicated.\" คือใช้ค่าที่หลวมกว่าได้ ยกเว้นรายการที่เขียนไว้เป็นอย่างอื่น เช่นข้อ 1.e.1 ที่ระบุ \"whichever is smaller\" ฟังก์ชันตรวจจึงใช้ค่าตั้งต้น `rule = 'larger'` และรับโหมด `'smaller'` เป็นพารามิเตอร์"),
# 10.2 table rows
("| 2.c.1 | Power change dynamics | ±3 kt, ±100 ft, ±20 % หรือ ±1.5° pitch | Approach | 10.6 (regression) |",
 "| 2.c.1 | Power change dynamics | ±3 kt, ±100 ft, ±20 % หรือ ±1.5° pitch; บันทึกตั้งแต่ 5 s ก่อนถึง 15 s หลังเปลี่ยนกำลัง | Approach | 10.6 (regression) |"),
("| 2.c.5 | Longitudinal trim | ±1° elevator, ±1° pitch, ±5 % thrust | Cruise, Approach, Landing | T-V-01 |",
 "| 2.c.5 | Longitudinal trim | ±0.5° trim surface, ±1° elevator, ±1° pitch, ±5 % net thrust | Cruise, Approach, Landing | T-V-01 |"),
("| 2.c.8 | Stall characteristics (ฉบับก่อน 2016) | ±3 kt สำหรับ buffet, stall warning, stall speed; ±2° bank | Approach/Landing | T-V-11 |",
 "| 2.c.8 | Stall characteristics (ฉบับก่อน 2016) | ±3 kt สำหรับ initial buffet, stall warning, stall speed; ±2° bank ที่ความเร็วสูงกว่า stick shaker หรือ initial buffet | Second segment climb, Approach/Landing (เข้าที่ idle หรือใกล้ idle) | T-V-11 |"),
("| 2.c.9 | Phugoid dynamics | ±10 % คาบ, ±10 % t½ หรือ t₂ หรือ ±0.02 ζ; ≥ 3 รอบ | Cruise | T-V-08 |",
 "| 2.c.9 | Phugoid dynamics | ±10 % คาบ, ±10 % t½ หรือ t₂ หรือ ±0.02 ζ; บันทึก 3 รอบเต็มหรือพอหา t½/t₂ (เลือกที่น้อยกว่า) | Cruise | T-V-08 |"),
("| 2.d.8 | Steady state sideslip | ±2° bank, ±1° β, ±10 % หรือ ±2° aileron | Approach/Landing | หลังมีโมเดลใบพัด (sec 3) |",
 "| 2.d.8 | Steady state sideslip | ที่ตำแหน่ง rudder ที่กำหนด: ±2° bank, ±1° β (ส่วน ±10 % หรือ ±2° aileron ยังไม่ยืนยันในรอบตรวจ); อย่างน้อยสองตำแหน่ง rudder และเครื่องใบพัดต้องทดสอบทั้งสองทิศ | Approach/Landing | หลังมีโมเดลใบพัด (sec 3) |"),
# 10.3 table: short period Cat B
("| Short period ζsp (Cat B) | 0.30–2.00 | 0.20–2.00 | ≥ 0.15 | กลาง [V11] |",
 "| Short period ζsp (Cat B) | 0.30–2.00 | 0.20–2.00 | ≥ 0.15 | สูง [V7 Table 2, V11] (ขอบบนใน V7 อ่านไม่ชัด, V11 ยืนยัน 2.00) |"),
# 10.3 table: dutch roll row
("| Dutch roll, Class I, Cat C | ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 0.4 rad/s | ζ ≥ 0.02, ζωn ≥ 0.05, ωn ≥ 0.4 | ζ ≥ 0, ωn ≥ 0.4 | กลาง: ζ และ ζωn ของ L1 ยืนยันแล้ว ค่าอื่นยังไม่ยืนยัน [V7, V10, V11] |",
 "| Dutch roll, Class I, Cat C | ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 1.0 rad/s [V10] (V7 Table 4 ที่ OCR อ่านไม่ชัดให้ 0.4) | ζ ≥ 0.02, ωn ≥ 0.4 [V11]; ζωn ≥ 0.05 ยังไม่ยืนยัน | ζ ≥ 0, ωn ≥ 0.4 (ยังไม่ยืนยัน) | กลาง: ζ และ ζωn ของ L1 ยืนยันสองแหล่ง ωn ของ L1 แหล่งขัดกัน (ดู 10.10 ข้อ 3) [V7 Table 4, V10, V11] |"),
("| Roll mode τR สูงสุด, Class I, Cat C | 1.0 s | 1.4 s | 10 s (ยังไม่ยืนยัน) | กลาง [V7 Table 5, V10] |",
 "| Roll mode τR สูงสุด, Class I, Cat C | 1.0 s | 1.4 s | 10 s (ยังไม่ยืนยัน: V7 Table 5 ให้ 10 s เฉพาะ Cat B ส่วน Cat C เป็นช่องว่าง) | กลาง [V7 Table 5, V10] |"),
# 10.4 747 row
("| 747, M 0.8, 40,000 ft | 0.962, 0.387 | ωn 0.0673 → ≈ 93 s, 0.049 | – | – | – | ทุติยภูมิ (เอกสารสอนจาก Nelson และ Reid) / กลาง [V14] |",
 "| 747, M 0.8, 40,000 ft | 0.962, 0.387 | ωn 0.0673, ζ 0.049 → คาบ 93.5 s (ค่าประมาณ: 2π/(ωn√(1−ζ²))) | – | – | – | ทุติยภูมิ (เอกสารสอน: ตัวเลขโหมดจาก Lecture 7, สภาวะ 40,000 ft จาก Lecture 9 ซึ่งระบุว่าข้อมูลมาจาก Etkin และ Reid) / กลาง [V14] |"),
("- NASA CR-2144 (Heffley & Jewell 1972) มีข้อมูลของ 747, CV-880M และ Jetstar [V20] แต่เครื่องมือรอบนี้อ่านได้แค่สารบัญ จึงยังไม่ได้ดึงตัวเลขออกมา",
 "- NASA CR-2144 (Heffley & Jewell, ธ.ค. 1972) มีข้อมูลของเครื่อง 10 แบบ ได้แก่ NT-33A, F-104A, F-4C, X-15, HL-10, Jetstar, CV-880M, B-747, C-5A และ XB-70A [V20] แต่เครื่องมือรอบนี้อ่านได้แค่หน้าบรรณานุกรม จึงยังไม่ได้ดึงตัวเลขออกมา"),
# 10.5 snippet: sub() helper
("// lon = eig4(sub(A,[0,2,4,7])) -> คู่ซับซ้อนที่ |λ| ใหญ่ = short period, เล็ก = phugoid",
 "// const sub = (A, ix) => ix.map(i => ix.map(j => A[i][j]));   (ตัดเมทริกซ์ย่อย)\n// lon = eig4(sub(A,[0,2,4,7])) -> คู่ซับซ้อนที่ |λ| ใหญ่ = short period, เล็ก = phugoid"),
# 10.6 (a)
("  - AC 23-8C ให้ trim ที่ราว 1.5 V_S1 (หรือความเร็ว trim ต่ำสุด) ลดความเร็วจนเหลือราว 10 kt เหนือ stall แล้วลดต่อ \"at a rate of one knot per second or less\" จนเกิด stall หรือคันบังคับถึง stop [V17]",
 "  - AC 23-8C ให้ trim ที่ \"approximately 1.5 VS1 or the minimum speed trim, whichever is greater\" แล้วลดความเร็ว \"at a rate of one knot per second or less\" จนเกิด stall หรือคันบังคับถึง stop [V17] (ขั้นลดความเร็วให้เหลือราว 10 kt เหนือ stall ก่อนเริ่มอัตรา 1 kt/s ยังไม่ยืนยันจากข้อความต้นฉบับ)"),
("  - ค่าแฟลปลงตรงกับ `AC.Vs0` = 71 kt (ต่าง 1.3 %)",
 "  - ค่าแฟลปลงตรงกับ `AC.Vs0` = 71 kt (ต่าง 1.2 %: 71.86/71)"),
# 10.6 (d)
("  - ให้ใช้เทคนิคหมุน \"normal/natural\" และแนะนำให้ทำ 6 รอบ\n  - ลมระหว่างทดสอบไม่ควรเกินราว 12 % V_S1 หรือ 10 kt [V17]",
 "  - คำว่า \"normal/natural rotation technique\" ปรากฏในหัวข้อทดสอบ abuse ของ §23.51 และ AC แนะนำ \"Six acceptable runs\" สำหรับหาช่วงเร่งบนพื้นในวิธี segment technique [V17] ในซิมจึงใช้การหมุนแบบปกติ (3°/s) และไม่ต้องทำซ้ำ 6 รอบเพราะผลกำหนดแน่นอน\n  - ลมระหว่างทดสอบไม่ควรเกิน \"approximately 12 percent VS1 or 10 knots, whichever is lower\" (Table 1 ของ AC ใช้กับการทดสอบ takeoff และ landing) [V17]"),
("  - tolerance ของ Part 60 ข้อ 1.b.1 คือ ±5 % ทั้งเวลาและระยะ หรือ ±5 % เวลากับ ±61 m [V2]",
 "  - tolerance ของ Part 60 ข้อ 1.b.1 คือ ±5 % ทั้งเวลาและระยะ หรือ ±5 % เวลากับ ±61 m [V2] ข้อนี้วัดช่วงเร่งบนพื้น การนำมาใช้กับระยะถึง 50 ft จึงเป็นการดัดแปลงของผู้เขียน"),
# 10.6 (e)
("- tolerance ของการหยุดตาม Part 60 ข้อ 1.e.1 คือ ±5 % ของเวลา และสำหรับระยะไม่เกิน 4,000 ft ให้ใช้ ±200 ft หรือ ±10 % แล้วแต่ค่าใดเล็กกว่า [V2]",
 "- tolerance ของการหยุดตาม Part 60 ข้อ 1.e.1 คือ ±5 % ของเวลา และสำหรับระยะไม่เกิน 4,000 ft ให้ใช้ ±200 ft หรือ ±10 % แล้วแต่ค่าใดเล็กกว่า [V2] ข้อนี้คือ \"Stopping time and distance\" ด้วยเบรกล้อบนทางวิ่งแห้ง จึงใช้กับ ground roll ตั้งแต่แตะพื้นจนหยุด ไม่ใช่ระยะรวมจาก 50 ft"),
# 10.7 node --test
("- ใน `.github/workflows/pages.yml` ให้เพิ่ม `node --test test/` ต่อจากการทดสอบ geo และ runways (`node --test` รันเฉพาะไฟล์ที่ชื่อเข้าแบบ `*.test.mjs` ส่วน `shots.mjs` ไม่ถูกรัน)",
 "- ใน `.github/workflows/pages.yml` (ใช้ Node 22) ให้เพิ่ม `node --test \"test/**/*.test.mjs\"` ต่อจากการทดสอบ geo และ runways ต้องใส่ glob ในเครื่องหมายคำพูด เพราะตรวจกับ Node 22.23.5 แล้ว (`scratch/v10rev_nodetest/`) `node --test test/` ล้มด้วย `ERR_TEST_FAILURE` และ `node --test` แบบไม่ใส่อาร์กิวเมนต์จะรันทุกไฟล์ `.mjs` ใต้ `test/` ตามรูปแบบตั้งต้น `**/test/**/*.mjs` รวมถึง `shots.mjs` (ต้องใช้ Playwright), `harness.mjs` และ `test/lib/*.mjs`"),
("2. **P1 · S** เพิ่ม `node --test test/` ใน `.github/workflows/pages.yml`",
 "2. **P1 · S** เพิ่ม `node --test \"test/**/*.test.mjs\"` ใน `.github/workflows/pages.yml`"),
]
for old, new in E:
    c = s.count(old)
    if c != 1:
        print('ANCHOR COUNT', c, '::', old[:90]); sys.exit(1)
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(E))
