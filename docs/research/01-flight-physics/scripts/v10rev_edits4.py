# v10rev_edits4.py: last small fixes (ER09DE22 note, reviewer scripts in V19)
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
E = [
("  - ใน eCFR ฉบับปัจจุบัน ตัว Table A2A เป็นภาพ (ER09DE22.017–.050) ไม่ใช่ข้อความ [V1]",
 "  - ใน eCFR ฉบับปัจจุบัน ตัว Table A2A เป็นภาพ (ER09DE22.017–.050; รหัสภาพยังไม่ยืนยันในรอบตรวจ) ไม่ใช่ข้อความ [V1] ตารางนี้ถูกแก้ล่าสุดโดย \"Miscellaneous Amendments\" ฉบับ 9 ธ.ค. 2022 [V23]"),
("`v10_misc.mjs`, `v10_jsb_c172.py`) — โค้ดของโครงการเอง (repo ยังไม่มี LICENSE)",
 "`v10_misc.mjs`, `v10_jsb_c172.py`; สคริปต์ตรวจทาน `v10rev_json.mjs`, `v10rev_snippet.mjs`, `v10rev_expected.mjs`) — โค้ดของโครงการเอง (repo ยังไม่มี LICENSE)"),
]
for old, new in E:
    c = s.count(old)
    if c != 1: print('ANCHOR COUNT', c, '::', old[:100]); sys.exit(1)
    s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s); print('applied', len(E))
