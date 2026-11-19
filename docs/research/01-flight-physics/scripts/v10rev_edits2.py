# v10rev_edits2.py: test table, JSON, conflicts and reference fixes (checked, exactly-once replacements)
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
# ---- test table
("| ζ ≥ 0.08, ζωn ≥ 0.15 rad/s, ωn ≥ 0.4 rad/s | [V7, V10, V11] |",
 "| ζ ≥ 0.08 และ ζωn ≥ 0.15 rad/s ทั้งสองสภาวะ; ωn ≥ 1.0 rad/s ที่ approach (Cat C, ใช้ค่าที่เข้มกว่าจาก [V10]) และ ωn ≥ 0.4 rad/s ที่ cruise (Cat B [V11]) | [V7, V10, V11] |"),
("| V50 ≥ 1.2 V_S1 (≥ 95.5 kt); รอบ 2: ระยะ ±5 % หรือ ±61 m จาก POH; regression 590 ± 30 m |",
 "| V50 ≥ 1.2 V_S1 (≥ 95.5 kt จาก 1.2 × 79.6); รอบ 2: ระยะ ±5 % หรือ ±61 m จาก POH (ดัดแปลงจาก 1.b.1); regression 590 ± 30 m (±5 %) |"),
("| IAS ที่ 50 ft = Vref 88 ± 3 kt; ระยะรวม 714 ± 61 m (ค่าที่เล็กกว่าระหว่าง ±10 % กับ ±61 m); รอบ 2 เทียบ POH | §23.2130 [V18]; Part 60 ข้อ 1.e.1 [V2] | 87.9 kt, 714 m (air 338 + ground 376) ✓ |",
 "| IAS ที่ 50 ft = Vref 88 ± 3 kt; ground roll (แตะพื้นถึงหยุด) 376 ± 37.6 m ตาม 1.e.1 (ค่าที่เล็กกว่าระหว่าง ±10 % = 37.6 m กับ ±61 m) และเวลาหยุด ±5 %; ระยะรวมจาก 50 ft 714 ± 36 m (regression ±5 %); รอบ 2 เทียบ POH | §23.2130 [V18]; Part 60 ข้อ 1.e.1 [V2] | 87.9 kt, ground roll 376 m, รวม 714 m (air 338 + ground 376) ✓ |"),
# ---- JSON
('"shortPeriodZeta_catB": {"v": {"L1": [0.30, 2.00], "L2": [0.20, 2.00], "L3": [0.15, null]}, "u": "-", "scope": "sim", "src": ["V11"], "conf": "กลาง", "est": false, "note": "จากหน้าเอกสาร MathWorks (ทุติยภูมิ) ใช้กับช่วง cruise"}',
 '"shortPeriodZeta_catB": {"v": {"L1": [0.30, 2.00], "L2": [0.20, 2.00], "L3": [0.15, null]}, "u": "-", "scope": "sim", "src": ["V7", "V11"], "conf": "สูง", "est": false, "note": "ขอบล่างจาก V7 Table 2; ขอบบน 2.00 ใน V7 อ่านไม่ชัดแต่ V11 (MathWorks, ทุติยภูมิ) ยืนยัน; ใช้กับช่วง cruise"}'),
('"dutchRoll_classI_catC": {"v": {"L1": {"zeta": 0.08, "zetaWn": 0.15, "wn": 0.4}, "L2": {"zeta": 0.02, "zetaWn": 0.05, "wn": 0.4}, "L3": {"zeta": 0.0, "wn": 0.4}}, "u": "- / rad/s / rad/s", "scope": "sim", "src": ["V7", "V10", "V11"], "conf": "กลาง", "est": false, "note": "ζ 0.08 และ ζωn 0.15 ยืนยันจากสองแหล่ง; ωn 0.4 และค่า L2/L3 ยังไม่ยืนยันจากต้นฉบับ (V10 ให้ ωn 1.0 ซึ่งตรงกับ Category A)"}',
 '"dutchRoll_classI_catC": {"v": {"L1": {"zeta": 0.08, "zetaWn": 0.15, "wn": 1.0}, "L2": {"zeta": 0.02, "zetaWn": 0.05, "wn": 0.4}, "L3": {"zeta": 0.0, "wn": 0.4}}, "u": "- / rad/s / rad/s", "scope": "sim", "src": ["V7", "V10", "V11"], "conf": "กลาง", "est": false, "note": "L1 ζ 0.08 และ ζωn 0.15 ยืนยันจาก V7 Table 4 และ V10; L1 ωn: V10 ให้ 1.0 (เขียนหน่วยเป็น Hz) แต่ V7 Table 4 ที่ OCR อ่านไม่ชัดให้ 0.4 จึงใช้ 1.0 ที่เข้มกว่า (โมเดลผ่านทั้งสองค่า); L2 ζ 0.02 และ ωn 0.4 จาก V11 (Cat B แต่ L2 ใช้กับทุก Category ตาม V7); L2 ζωn 0.05 และค่า L3 ยังไม่ยืนยัน"}'),
('"note": "L3 = 10 s ยังไม่ยืนยัน"}',
 '"note": "L1/L2 จาก V7 Table 5 และ V10 (L1); L3 = 10 s ยังไม่ยืนยัน เพราะ V7 Table 5 ให้ 10 s เฉพาะ Cat B"}'),
('"longTrim_2c5": {"v": {"elevAbs_deg": 1, "pitchAbs_deg": 1, "thrustPct": 5}, "u": "deg / %", "scope": "sim", "src": ["V2", "V3"], "conf": "กลาง", "est": false, "note": "cruise, approach, landing"}',
 '"longTrim_2c5": {"v": {"trimSurfAbs_deg": 0.5, "elevAbs_deg": 1, "pitchAbs_deg": 1, "thrustPct": 5}, "u": "deg / %", "scope": "sim", "src": ["V2", "V3"], "conf": "สูง", "est": false, "note": "cruise, approach, landing; ข้อความตรงกันใน A2A [V2] และ B2A [V3]; ±5 % net thrust or equivalent"}'),
('"stall_2c8": {"v": {"iasAbs_kt": 3, "bankAbs_deg": 2}, "u": "kt / deg", "scope": "sim", "src": ["V2", "V3"], "conf": "กลาง", "est": false, "note": "ฉบับก่อน 2016; ฉบับปัจจุบันแก้ไขหัวข้อ stall แล้ว"}',
 '"stall_2c8": {"v": {"iasAbs_kt": 3, "bankAbs_deg": 2}, "u": "kt / deg", "scope": "sim", "src": ["V2", "V3"], "conf": "กลาง", "est": false, "note": "ฉบับก่อน 2016; ±3 kt สำหรับ initial buffet, stall warning และ stall speed; ±2° bank ที่ความเร็วสูงกว่า stick shaker หรือ initial buffet; เข้าที่ idle หรือใกล้ idle ปีกระดับ; ฉบับ 2016 (Amdt. 60-4) และ 2022 แก้ตาราง A2A แล้ว ยังไม่ได้ตรวจแถวนี้ในฉบับใหม่"}'),
('"phugoid_2c9": {"v": {"periodPct": 10, "t2Pct": 10, "zetaAbs": 0.02, "minCycles": 3}, "u": "% / -", "scope": "sim", "src": ["V2", "V3"], "conf": "สูง", "est": false, "note": "cruise"}',
 '"phugoid_2c9": {"v": {"periodPct": 10, "t2Pct": 10, "zetaAbs": 0.02, "minCycles": 3}, "u": "% / -", "scope": "sim", "src": ["V2", "V3"], "conf": "สูง", "est": false, "note": "cruise; บันทึก 3 รอบเต็ม (6 overshoot หลังจบ input) หรือพอหา t½/t₂ แล้วแต่ค่าใดน้อยกว่า"}'),
('"steadySideslip_2d8": {"v": {"bankAbs_deg": 2, "betaAbs_deg": 1, "ailPct": 10, "ailAbs_deg": 2}, "u": "deg / %", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "อย่างน้อยสองตำแหน่ง rudder"}',
 '"steadySideslip_2d8": {"v": {"bankAbs_deg": 2, "betaAbs_deg": 1, "ailPct": 10, "ailAbs_deg": 2}, "u": "deg / %", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "ที่ตำแหน่ง rudder ที่กำหนด; อย่างน้อยสองตำแหน่ง rudder และเครื่องใบพัดทดสอบทั้งสองทิศ; ±2° bank และ ±1° β ยืนยันแล้ว ส่วน aileron ±10 % หรือ ±2° ยังไม่ยืนยันในรอบตรวจ"}'),
('"stopping_1e1": {"v": {"timePct": 5, "distPct": 10, "distAbs_m": 61, "rule": "smaller"}, "u": "% / m", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "ระยะไม่เกิน 4000 ft ใช้ ±200 ft หรือ ±10% ค่าที่เล็กกว่า"}',
 '"stopping_1e1": {"v": {"timePct": 5, "distPct": 10, "distAbs_m": 61, "rule": "smaller"}, "u": "% / m", "scope": "sim", "src": ["V2"], "conf": "สูง", "est": false, "note": "Stopping time and distance ด้วยเบรกล้อ ทางวิ่งแห้ง ไม่มี reverse: ใช้กับระยะจากแตะพื้นถึงหยุด; ระยะไม่เกิน 4000 ft ใช้ ±200 ft หรือ ±10% whichever is smaller"}'),
('"stallTrimSpeed": {"v": {"part23": "1.5 VS1 หรือ minimum trim", "part25": [1.13, 1.30]}',
 '"stallTrimSpeed": {"v": {"part23": "ราว 1.5 VS1 หรือ minimum trim speed (ค่าที่สูงกว่า)", "part25": [1.13, 1.30]}'),
('"takeoffRunsRecommended": {"v": 6, "u": "runs", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "ในซิมใช้ 1 รันลมสงบ + กรณีลมหน้า/หลัง"}',
 '"takeoffRunsRecommended": {"v": 6, "u": "runs", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "AC 23-8C: Six acceptable runs สำหรับหาช่วงเร่งบนพื้นในวิธี segment technique; ในซิมใช้ 1 รันลมสงบ + กรณีลมหน้า/หลัง"}'),
('"testWindMax": {"v": {"kt": 10, "fracVS1": 0.12}, "u": "kt / -", "scope": "sim", "src": ["V17"], "conf": "กลาง", "est": false, "note": "ลมระหว่างทดสอบสมรรถนะ; ในซิมตั้งลมสงบ"}',
 '"testWindMax": {"v": {"kt": 10, "fracVS1": 0.12}, "u": "kt / -", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "AC 23-8C Table 1 สำหรับการทดสอบ takeoff และ landing: ไม่เกินราว 12% VS1 หรือ 10 kt ค่าที่ต่ำกว่า; ในซิมตั้งลมสงบ"}'),
('"note": "เอกสารสอน MIT OCW จากข้อมูล Nelson/Reid; ทุติยภูมิ"}',
 '"note": "เอกสารสอน MIT OCW (ทุติยภูมิ): ตัวเลขโหมดจาก Lecture 7, สภาวะ M 0.8 / 40,000 ft จาก Lecture 9 ซึ่งระบุข้อมูลจาก Etkin และ Reid; คาบ phugoid 93.5 s เป็นค่าประมาณจาก ωn และ ζ"}'),
# ---- 10.10 conflicts
("   - ฉบับรวมของ FAA ระบุว่าการแก้ไขล่าสุดคือ Amdt. 60-4 (81 FR 18217, 30 มี.ค. 2016) [V21] และผลค้นหาพบกฎปี 2014 ชื่อ \"Flight Simulation Training Device Qualification Standards for Extended Envelope and Adverse Weather Event Training Tasks\" (FR 2014-15432, ยังไม่ได้เปิดอ่าน) ซึ่งตามชื่อน่าจะแก้แถว stall (2.c.8) และเพิ่มการทดสอบเรื่อง stall และ upset",
 "   - ฉบับรวมของ FAA (2016) อ้าง Amdt. 60-4 (Docket FAA-2014-0391, 81 FR 18217–18218, 30 มี.ค. 2016) และมี Attachment 7 ที่ครอบคลุมงานฝึก high angle of attack, upset recovery และ icing [V21] ส่วนชื่อกฎ \"Extended Envelope and Adverse Weather Event Training Tasks\" ที่ผลค้นหาแสดง (FR 2014-15432, ยังไม่ได้เปิดอ่าน) ไม่ปรากฏในฉบับรวม จึงยังไม่ยืนยันว่าเป็นกฎฉบับเดียวกันและแก้แถว 2.c.8 อย่างไร\n   - หลังจากนั้น FAA ออก \"Miscellaneous Amendments\" (87 FR 75704, 9 ธ.ค. 2022, Docket FAA-2022-1355) ซึ่งมีคำสั่ง \"Revise table A2A\" ใน Appendix A [V23] ตรงกับที่ eCFR แสดงตารางเป็นภาพจากฉบับ 9 ธ.ค. 2022 [V1]"),
("3. **ωn ขั้นต่ำของ Dutch roll สำหรับ Category C** ค่า 0.4 rad/s มาจากเอกสาร MathWorks สำหรับ Category B [V11] ส่วนวิทยานิพนธ์ TU Delft [V10] เขียน ωnd > 1.0 และ ζωn > 0.15 โดยใช้หน่วย \"Hz\" ซึ่งน่าจะพิมพ์หน่วยผิด และค่า 1.0 ตรงกับ Category A ของ Class I ในตารางที่ [V7] ถอดไว้ ในการทดสอบใช้ 0.4 rad/s ซึ่งผ่อนกว่า โมเดลปัจจุบันผ่านทั้งสองค่า (ωn 1.61 rad/s)",
 "3. **ωn ขั้นต่ำของ Dutch roll สำหรับ Class I Category C** แหล่งขัดกัน\n   - วิทยานิพนธ์ TU Delft [V10] เขียน ζd > 0.08, ζdωnd > 0.15 และ ωnd > 1.0 โดยใช้หน่วย \"Hz\" (น่าจะหมายถึง rad/s เพราะค่าตัวเลขตรงกับตาราง rad/s ของ [V7])\n   - Table 4 ของ [V7] ซึ่งสแกนอ่านไม่ชัดบางช่อง ให้ 0.4 rad/s สำหรับ Cat C Class I, II-C, IV และให้ 1.0 rad/s ทั้ง Cat A Class I, IV และ Cat A Class II, III ซึ่งชวนสงสัยว่าคอลัมน์ ωn อาจเลื่อนแถวจาก OCR\n   - ค่า 0.4 rad/s ของ [V11] เป็นของ Category B\n   - ในการทดสอบ T-V-04 จึงใช้ 1.0 rad/s ซึ่งเข้มกว่าสำหรับ approach (ความเชื่อมั่น ต่ำ–กลาง จนกว่าจะเปิดต้นฉบับ MIL-F-8785C Table VI) โมเดลปัจจุบันผ่านทั้งสองค่า (ωn 1.61 rad/s)"),
("10. **กฎเลือกค่าที่หลวมกว่า** เมื่อ Part 60 ให้ tolerance สองค่า การใช้ค่าที่หลวมกว่าเป็นหลักทั่วไปยังไม่ได้ยืนยันจากต้นฉบับ ข้อ 1.e.1 ระบุชัดว่าให้ใช้ค่าที่เล็กกว่า",
 "10. **กฎเลือกค่าที่หลวมกว่า** ยืนยันแล้วจาก Attachment 2 ข้อ 2.b ในฉบับถอดความ [V2]: \"the less restrictive may be used unless otherwise indicated\" ส่วนข้อ 1.e.1 ระบุชัดว่าให้ใช้ค่าที่เล็กกว่า ยังควรตรวจกับข้อความในฉบับ eCFR ปัจจุบัน [V1] อีกครั้ง"),
]
for old, new in E:
    c = s.count(old)
    if c != 1:
        print('ANCHOR COUNT', c, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(E))
