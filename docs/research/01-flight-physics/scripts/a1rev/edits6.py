import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
('NASA Langley ทดสอบแบบจำลอง GA เครื่องยนต์เดียวด้วย rotary balance ที่ α 8–90° หมุนทั้งสองทิศ Ωb/2V 0–0.9 แต่รายงานเป็นกราฟ "without analysis" [A18]',
 'รายงานผู้รับจ้างของ NASA (Bihrle Applied Research) ทดสอบแบบจำลอง GA เครื่องยนต์เดียว **ปีกสูง** มาตราส่วน 1/6 ("model C") ด้วย rotary balance ที่ α 8–90° และ spin coefficient 0–0.9 (บทคัดย่อไม่ได้ระบุว่าเป็น Ωb/2V) โดย "Data are presented without analysis" [A18] เนื่องจากเครื่องฝึกของเราเป็นปีกต่ำ ตัวเลขจาก [A18] ใช้ได้เพียงเป็นลำดับขนาด'),
('"Rotary balance data for a typical single-engine general aviation design for an angle-of-attack range of 8° to 90°. 2: High-wing model C", NASA CR-3201, 1980, https://ntrs.nasa.gov/citations/19800023828 — ปฐมภูมิ · US Gov · ใช้ข้อมูลได้ (รอบนี้อ่านเฉพาะบทคัดย่อ)',
 '"Rotary balance data for a typical single-engine general aviation design for an angle-of-attack range of 8° to 90°. 2: High-wing model C", NASA CR-3201 (Bihrle Applied Research สำหรับ NASA), 1980, https://ntrs.nasa.gov/citations/19800023828 — ปฐมภูมิ · NTRS ระบุ "Work of the US Gov. Public Use Permitted." · ใช้ข้อมูลได้ (รอบนี้อ่านเฉพาะบทคัดย่อ; เป็นแบบจำลองปีกสูง)'),
('"Fixed Pitch Rotor Performance of Large Horizontal Axis Wind Turbines", ใน Large Horizontal-Axis Wind Turbines (NASA conference publication), 1982, NTRS 19830010962, https://ntrs.nasa.gov/citations/19830010962 — ปฐมภูมิ · US Gov, public use permitted',
 '"Fixed Pitch Rotor Performance of Large Horizontal Axis Wind Turbines", ใน Large Horizontal-Axis Wind Turbines (NASA conference publication; หน้า NTRS ไม่แสดงเลข CP), NASA Lewis, 1982, NTRS 19830010962, https://ntrs.nasa.gov/citations/19830010962 — ปฐมภูมิ · NTRS ระบุ "Work of the US Gov. Public Use Permitted."'),
('AFFDL-TR-79-3032, April 1979, https://apps.dtic.mil/sti/pdfs/ADA086557.pdf — ปฐมภูมิ · "Approved for public release; distribution unlimited" (งานรัฐบาลสหรัฐฯ) · อ้าง/ใช้ผลที่รันได้อิสระ (ชื่อผู้เขียนคนที่สองอ่านไม่ออกจาก OCR)',
 'AFFDL-TR-79-3032, April 1979, https://apps.dtic.mil/sti/pdfs/ADA086557.pdf — ปฐมภูมิ · "Approved for public release; distribution unlimited" (งานรัฐบาลสหรัฐฯ) · อ้าง/ใช้ผลที่รันได้อิสระ (ชื่อผู้เขียนคนที่สองอ่านไม่ออกจาก OCR; principal investigators ในเล่ม: J. E. Williams, S. C. Murray, G. J. Meblick, T. B. Sellers; ยืนยัน NALPHA ≤ 20 และ NMACH ≤ 20 แล้ว)'),
('10. **P3 · M** ดึงตัวเลข CN(α), Cl(α, Ω̂) จาก NASA CR-3201 และรายงาน rotary balance ชุดเดียวกันมาปรับ',
 '10. **P3 · M** ดึงตัวเลข CN(α), Cl(α, Ω̂) จาก NASA CR-3201 (แบบจำลองปีกสูง ใช้เป็นลำดับขนาด) และรายงาน rotary balance ชุดเดียวกันมาปรับ'),
]
for a, b in E:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:80]); continue
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
