import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
('F-8C ปลายปีกตอบสนองชัดที่ 29 Hz ระหว่างโหมด bending ที่สองกับ torsion แรก [A28]',
 'F-8C ปลายปีกตอบสนองเด่นที่ความถี่ระหว่างโหมด bending ที่สองกับ torsion แรก และมีการตอบสนองชัดที่ 29 Hz ซึ่งผู้เขียนระบุว่ายังไม่ทราบสาเหตุ [A28]'),
('F-104 9–22 Hz [A27], F-8C 29 Hz [A28] เป็นค่าเฉพาะโครงสร้าง',
 'F-104 9–22 Hz [A27], F-8C ระหว่างโหมด bending ที่สองกับ torsion แรก และพีคที่ 29 Hz ที่ยังไม่ทราบสาเหตุ [A28] เป็นค่าเฉพาะโครงสร้าง'),
('"Effects of flaps on buffet characteristics and wing-rock onset of an F-8C airplane at subsonic and transonic speeds", NASA TM X-2873, 1973, https://ntrs.nasa.gov/api/citations/19730019173/downloads/19730019173.pdf — ปฐมภูมิ · US Gov · ใช้ได้',
 '"Effects of flaps on buffet characteristics and wing-rock onset of an F-8C airplane at subsonic and transonic speeds", NASA TM X-2873, 1973, https://ntrs.nasa.gov/api/citations/19730019173/downloads/19730019173.pdf — ปฐมภูมิ · US Gov (สถานะลิขสิทธิ์บนหน้า NTRS ยังไม่ได้เปิดดู) · ใช้ได้ (ข้อมูลทั่วไปของ buffet เท่านั้น ไม่ระบุหน่วยทหาร)'),
]
for a, b in E:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:80]); continue
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
