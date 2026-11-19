# v10rev_edits3.py: reference-list fixes for sec-10 (checked, exactly-once replacements)
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
("appendix-Appendix%20A%20to%20Part%2060 — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ (public domain) คัดลอกข้อความและตัวเลขได้",
 "appendix-Appendix%20A%20to%20Part%2060 — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ (public domain) คัดลอกข้อความและตัวเลขได้ (ในรอบตรวจ eCFR ปฏิเสธเครื่องมืออ่าน (robots) จึงยังไม่ยืนยันรหัสภาพ ER09DE22.017–.050 แต่การแก้ Table A2A เมื่อ 9 ธ.ค. 2022 ยืนยันได้จาก [V23])"),
("N86-30738. https://ntrs.nasa.gov/api/citations/19860021266/downloads/19860021266.pdf — รายงาน NASA ที่ถอดตาราง MIL-F-8785C (ทุติยภูมิต่อสเปก) — ผลงานภายใต้ทุนรัฐบาลสหรัฐฯ บน NTRS อ้างตัวเลขได้",
 "N86-30738 (เลข NASA CR บนปกสแกนอ่านไม่ชัด). https://ntrs.nasa.gov/api/citations/19860021266/downloads/19860021266.pdf — รายงานที่ถอดตาราง MIL-F-8785C (ทุติยภูมิต่อสเปก; Table 2 short period, Table 3 delay, Table 4 Dutch roll ที่อ่านไม่ชัดบางช่อง, Table 5 roll mode, Table 6 spiral) — เป็นรายงานของมหาวิทยาลัยภายใต้ทุน NASA ไม่ใช่งานของรัฐบาลโดยตรง ในไฟล์ไม่พบประกาศลิขสิทธิ์ จึงอ้างข้อเท็จจริงและตัวเลขเท่านั้น ไม่คัดลอกตารางหรือภาพลง repo"),
("— ปฐมภูมิ (ไฟล์เป็นภาพสแกน อ่านข้อความไม่ได้; ยังไม่ได้ตรวจ distribution statement) — สเปกทางทหารที่เผยแพร่สาธารณะ อ้างตัวเลขได้",
 "— ปฐมภูมิ (ไฟล์เป็นภาพสแกน อ่านข้อความไม่ได้; หน้า everyspec ไม่แสดง distribution statement ระบุ \"[NO S/S DOCUMENT]\" และมี Notice 2 ปี 1996) — สเปกทางทหารที่เผยแพร่สาธารณะ (คู่มือประกอบ [V22] ระบุ \"Approved for public release, distribution unlimited\") อ้างตัวเลขได้"),
("https://ntrs.nasa.gov/api/citations/19820020424/downloads/19820020424.pdf — ปฐมภูมิสำหรับข้อความที่อ้าง — งานภายใต้สัญญารัฐบาลสหรัฐฯ อ้างได้",
 "https://ntrs.nasa.gov/api/citations/19820020424/downloads/19820020424.pdf — ปฐมภูมิสำหรับข้อความที่อ้าง (\"Level 2 is 0.15 ~ 0.25 versus 0.096 ~ 0.16 for Category C in MIL-F-8785C\", OCR) — งานของ Systems Technology, Inc. ภายใต้สัญญา NAS4-2834 ในไฟล์ไม่พบประกาศลิขสิทธิ์ อ้างข้อเท็จจริงได้"),
("— ทุติยภูมิ — OCW ใช้ CC BY-NC-SA (ไม่ได้เห็นข้อความใบอนุญาตในไฟล์) อ้างตัวเลขได้",
 "— ทุติยภูมิ (Lecture 7 \"Approximate Longitudinal Dynamics Models\" ให้ตัวเลขโหมด; Lecture 9 \"Basic Longitudinal Control\" ระบุสภาวะ \"B747 at Mach 0.8, 40,000ft\" และ \"From Etkin and Reid\") — OCW ใช้ CC BY-NC-SA (ไม่ได้เห็นข้อความใบอนุญาตในไฟล์) อ้างตัวเลขได้"),
("subject-group-ECFR0f27e01839859ea — ปฐมภูมิ — public domain",
 "subject-group-ECFR0f27e01839859ea — ปฐมภูมิ — public domain (ในรอบตรวจ eCFR ปฏิเสธเครื่องมืออ่าน ข้อความ §23.2110 \"idle or zero thrust\", §23.2115(b) 50 ft, §23.2120(a)(1) 8.3 %, §23.2125(a)/(b) และ §23.2130(a) ตรวจจากสำเนาของ Gleim https://www.gleim.com/aviation/faraim/index.php?fullTextNum=23B ซึ่งเป็นแหล่งทุติยภูมิ)"),
("20. [V20] D. E. Heffley, W. F. Jewell (STI), *Aircraft Handling Qualities Data*, NASA CR-2144, 1972.",
 "20. [V20] R. K. Heffley, W. F. Jewell (Systems Technology, Inc.), *Aircraft Handling Qualities Data*, NASA CR-2144, 1 Dec 1972."),
("— ปฐมภูมิ (รอบนี้อ่านได้แค่รายชื่อเครื่องบิน) — งานภายใต้สัญญารัฐบาลสหรัฐฯ ควรดึงตัวเลขของ 747, CV-880M และ Jetstar ในรอบ 2",
 "— ปฐมภูมิ (รอบนี้อ่านได้แค่รายชื่อเครื่องบิน 10 แบบ) — หน้า NTRS ระบุ \"Work of the US Gov. Public Use Permitted\" อ้างและคัดลอกตัวเลขได้ ควรดึงตัวเลขของ B-747, CV-880M และ Jetstar ในรอบ 2"),
("22. [V22] U.S. Air Force laboratory report AFWAL-TR-81-3109, *Background Information and User Guide for MIL-F-8785C*, 1982 (DTIC ADA119421). https://apps.dtic.mil/sti/pdfs/ADA119421.pdf — ปฐมภูมิ (คำอธิบายของผู้จัดทำสเปก; ข้อความ OCR อ่านได้บางส่วน) — รายงานรัฐบาลสหรัฐฯ บน DTIC อ้างได้",
 "22. [V22] D. J. Moorhouse, R. J. Woodcock, *Background Information and User Guide for MIL-F-8785C, Military Specification—Flying Qualities of Piloted Airplanes*, AFWAL-TR-81-3109 (ปกระบุ July 1982 ส่วนหน้า Report Documentation ระบุ September 1981) (DTIC ADA119421). https://apps.dtic.mil/sti/pdfs/ADA119421.pdf — ปฐมภูมิ (คำอธิบายของผู้จัดทำสเปก; ข้อความ OCR อ่านได้บางส่วน ตาราง Table VI อ่านไม่ได้) — \"Approved for public release, distribution unlimited\" รายงานรัฐบาลสหรัฐฯ อ้างได้\n23. [V23] FAA, *Miscellaneous Amendments* (final rule, technical amendment), 87 FR 75704, 9 Dec 2022, Docket FAA-2022-1355, FR Doc 2022-23327. https://www.govinfo.gov/content/pkg/FR-2022-12-09/pdf/2022-23327.pdf (ที่เปิดอ่านจริงคือสำเนา https://regulations.justia.com/regulations/fedreg/2022/12/09/2022-23327.html) — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ (public domain); ยืนยันคำสั่ง \"Revise table A2A\" ใน Part 60 Appendix A"),
]
for old, new in E:
    c = s.count(old)
    if c != 1:
        print('ANCHOR COUNT', c, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('applied', len(E))
