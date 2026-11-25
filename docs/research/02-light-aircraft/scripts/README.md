# สคริปต์และชุดตรวจของรอบที่ 2

← [กลับไปหน้ารวมรอบที่ 2](../../02-light-aircraft.md) · [schema ส่วนขยาย](../schema-ext.md)

โฟลเดอร์นี้เก็บเครื่องมือตรวจบัตรข้อมูล (`lm_*`) และสคริปต์คำนวณของแต่ละหัวข้อในรอบที่ 2 เป็นหลักฐานการคำนวณและชุดตรวจข้อมูล ไม่ใช่โค้ดของแอป และไม่ถูก build สคริปต์ Node ใช้ Node ≥ 18 (CI ใช้ 22) ไม่มี dependency ให้รันจากรากของ repo

## ชุดตรวจที่ CI รัน

`.github/workflows/research.yml` รัน `lm_ci.mjs` ทุกครั้งที่ pull request หรือ push แตะ `docs/research/**` รันขั้นตอนเดียวกันในเครื่องได้ด้วยคำสั่งเดียว

```sh
node docs/research/02-light-aircraft/scripts/lm_ci.mjs            # ซิมของ commit ใน sim-snapshot.json (ต้องเป็น git clone)
node docs/research/02-light-aircraft/scripts/lm_ci.mjs --root .   # ซิมของ working tree (ดูว่าการแก้ฟิสิกส์ขยับค่าใด)
```

| ขั้น (`--only`) | คำสั่ง | ผลที่ต้องได้ (25 พ.ย. 2026) |
|---|---|---|
| `merge` | `lm_merge.mjs --coverage --dry --strict` | exit 0: ไม่มี ERRORS หรือ CONFLICTS, 0 WARN (รวมคำเตือนรูปแบบ leaf) และ path ของรอบที่ 1 ที่ขาด 0 ทุก id (`--strict` นับทั้งสามอย่างเป็น ERROR) |
| `params` | `lm_merge.mjs --quiet --out $LM_OUT_DIR/params-light.json` | ไฟล์ที่ได้เหมือน `../params-light.json` ที่ commit ไว้ทุกไบต์ (ลืมรัน `lm_merge.mjs` หลังแก้บล็อก JSON = ไม่ผ่าน) |
| `selftest` | `lm_selftest.mjs` | 124/124 (T-LM-01…T-LM-41) |
| `fleet` | `ls_tests.mjs` | 10/10 |
| `handling` | `lh_tests.mjs` | 67/67 |
| `procedures` | `lo_tests.mjs` | 34/34 |

- สคริปต์ที่บินบัตรในซิม (`lm_selftest`, `lh_tests`, `lo_tests`) หา repo จาก `AIRFIELDLAB_ROOT` ซึ่ง `lm_ci.mjs` ตั้งให้ชี้ไปที่ `src/` และ `test/harness.mjs` ของ commit ใน `sim-snapshot.json` PR ฟิสิกส์จึงไม่ทำให้ CI นี้แดง T-LM-32 ตรวจว่าสำเนาโค้ดซิมในสคริปต์ (`lm_card.simCLtrim` = stallBlend กับบรรทัด CL, `lh_eval.scoreToday` = `Evaluator.score`) ยังตรงกับซิมที่ตรึงไว้ เมื่อจะยกค่าคาดหวังไปใช้ฟิสิกส์ใหม่ ให้รัน `--root .` ดูค่าที่ขยับ แล้วแก้ค่าคาดหวังพร้อม commit ใน `sim-snapshot.json` ใน PR เดียวกัน
- ไฟล์ผลลัพธ์เขียนลง `$LM_OUT_DIR` เมื่อตั้งไว้ (ไม่เช่นนั้นลง `out/`) และ `lm_ci.mjs` ล้มถ้าการรันทำให้ไฟล์ใน repo เปลี่ยน (ไฟล์ใหม่ ไฟล์ที่ถูกลบ หรือไฟล์ที่ถูกเขียนทับ รวมไฟล์ที่ git ignore; โฟลเดอร์ `--out` ที่อยู่ใน repo ได้รับยกเว้น)
- หลังแก้บล็อก JSON ในไฟล์หัวข้อใดก็ตาม `lm_merge.mjs --coverage --dry --strict` ต้องผ่าน แล้วรัน `lm_merge.mjs` (ไม่มี `--dry`) เพื่อสร้าง `../params-light.json` ใหม่ ห้ามแก้ไฟล์นั้นด้วยมือ
- `lm_merge` อ่านไฟล์ `.md` ทุกไฟล์ที่อยู่ชั้นบนสุดของ `02-light-aircraft/` และเขียนชื่อไว้ใน `_meta.files` ของ `params-light.json` เอกสารของเครื่องมือจึงอยู่ในโฟลเดอร์นี้แทน

## กติกา: การเทียบความเร็ว stall

ที่มา: [01-methods §01.5.1](../01-methods.md), `common_light.methods.stall_nz_at_vmin`, งาน R2-04 (22 พ.ย. 2026)

1. VS0 และ VS1 ใน POH/AFM เป็นความเร็วต่ำสุดของการลดความเร็ว 1 kt/s ซึ่ง nz ต่ำกว่า 1 เล็กน้อย เป้าของซิมจึงเป็น V_SR 1 g = VS (KCAS)/√0.95 (`lm_polar.vsrTarget`, ค่า 0.95 = `NZ_AT_VMIN`)
2. ฝั่งซิมใช้ V_SR = V/√nz ที่จุด CLmax ของ `lm_card.stallTest` (เทียบ 14 CFR 25.103) ไม่ใช้ Vmin ของซิม เพราะในซิมวันนี้ Vmin มักเกิดหลัง CL break (75 ใน 76 การทดสอบของผลวันที่ 22 พ.ย. 2026) และเลื่อน 0.6–3.4 kt ตามความเร็วเริ่ม ขณะที่ V_SR แทบไม่เปลี่ยน (T-LM-33, T-LP-03)
3. `stallTest` รายงาน `Vmin`, `nz_Vmin`, `CL_Vmin`, `alpha_Vmin_deg` เป็นข้อมูลเท่านั้น ห้ามใช้เป็นเกณฑ์ผ่าน/ไม่ผ่านในเทสต์ใหม่
4. ขอบเขตวันนี้: ใช้กับ T-LP (07), `lm_legacy_fit.checkFit`, T-LM-19 และ T-LM-33 แล้ว แถวเดิมของหัวข้ออื่นยังตัดสินด้วย Vmin เทียบ VS ของ POH (T-LC-06–08, T-LD-05–07, T-LT-01–06, T-LE-05–07, T-LF-04–07, T-LG-01–04) หรือเทียบ V_SR กับ VS โดยไม่หาร √0.95 (T-LN-10–15) ให้อ่านผลของแถวเหล่านี้เป็นข้อมูล และย้ายมาใช้กติกานี้ในงาน C2 ของแผนพัฒนา (ตอนย้ายเทสต์ stall เข้า `test/types.test.mjs`)

## กติกา: รหัสแหล่งใน `src`

ที่มา: [schema-ext.md ข้อ 1 และข้อ 4](../schema-ext.md), งาน R2-03 (22 พ.ย. 2026)

1. รหัส `L?n` ต้องมีบรรทัดของตัวเองในส่วน "NN.x แหล่งอ้างอิง" ของไฟล์เจ้าของคำนำหน้า (LM → 01, LS → 02, LB → 03, LC → 04, LD → 05, LT → 06, LP → 07, LH → 08, LO → 09, LE → 10, LF → 11, LG → 12, LN → 13)
2. รหัสของรอบที่ 1 เขียน `R1:<X>n` (เช่น `R1:V19` คือโค้ดซิมใน `01-flight-physics/10-validation.md`) ค่าที่รับจาก `params-trainer.json` ของรอบที่ 1 เขียน `R1:params-trainer.json` (path เดียวกัน) หรือ `R1:params-trainer.json#<path>` คำว่า `R1` เปล่า ๆ ใช้ไม่ได้
3. `lm_merge` ตรวจทุกรหัสใน `src` ของ leaf และในรายการ `src` ที่ซ้อนอยู่ใน `v` ด้วยข้อ `src_ref` (T-LM-23) และ `--strict` ล้มเมื่อพบรหัสที่ไม่มีบรรทัด

## กติกา: ค่าของโมเดลเปิดใช้เทียบเท่านั้น

ที่มา: [หัวข้อ 03 §03.5.2 และ §03.6](../03-open-models.md), T-LB-17, T-LB-18 และงานข้อ 5 ของรายการท้ายหน้ารวม

1. ค่าใน `<id>.validation.openModels.*` (และ `<id>.otherSims.*`) คือ **ผลวัดจากการรันโมเดลเปิด** (โมเดลที่มากับ JSBSim 1.3.3 และโมเดล FlightGear) ไม่ใช่ข้อมูลของเครื่องบินจริง `conf: "สูง"` ของ leaf เหล่านี้แปลว่าวัดซ้ำได้ตรงตามนิยาม ไม่ได้แปลว่าตรงกับเครื่องจริง
2. **ห้าม** คัดค่าจาก `validation.openModels.*` ไปเป็นค่าใน `speeds.*` หรือ `performance.*` ของบัตรใด (รวม `performance.tests[].expected`) ห้ามใช้เป็นค่าคาดหวังของเทสต์ใน `test/` หรือในโฟลเดอร์นี้ และห้าม fit ค่าประมาณของบัตรให้ซิมตรงกับผลของโมเดลเปิด
3. เป้าของบัตรมาจากเอกสารปฐมภูมิของแบบนั้น: POH, AFM, Information Manual หรือ TCDS (บัตร `c172s` ใช้ Information Manual ของ 172S [LB12] และแหล่ง LC ของหัวข้อ 04) ช่วงยอมรับตาม 14 CFR Part 60 [R1:V2]
4. ใช้โมเดลเปิดได้ตามลำดับชั้นของ §03.5.2 เท่านั้น: oracle ของสมการ (XML ที่สร้างจากบัตรของเราเอง แล้วรัน protocol เดียวกันทั้งสองฝั่ง), fixture ของสภาพแวดล้อม oracle (T-LB-01…14 และ T-LB-20…25 ตรวจว่า JSBSim ที่ติดตั้งยังให้ผลเดิม) และตัวอย่างโครงสร้าง ห้ามคัดลอกตารางหรือ XML ของโมเดล เพราะเป็น LGPL/GPL (§03.5.5) และห้ามนำ `out/lb_extract.json` เข้า repo (D7)
5. ในตารางเทสต์ ค่าของโมเดลเปิดอยู่ได้เฉพาะในคอลัมน์ "ที่มา" หรือหมายเหตุเพื่อเทียบ ไม่อยู่ในคอลัมน์ผลคาดหวังหรือช่วงยอมรับ ตัวอย่าง: T-LB-17 เป้า VS1 / VS0 ของบัตร `c172s` คือ 53 / 48 ± 3 KCAS จาก [LB12] (VS ของ JSBSim c172p สูงกว่า POH 2.5–2.8 kt จึงใช้เป็นเป้าไม่ได้) และ T-LB-18 CL ที่ POH ต้องการ ณ VS คือ 1.566 / 1.925 ± 0.005 (ค่า JSBSim 1.372 / 1.713 แสดงไว้เพื่อเทียบเท่านั้น) สองข้อนี้ย้ายเข้า `test/types.test.mjs` เมื่อซิมเลือกแบบเครื่องบินได้ (งานข้อ 10–11)
6. `lm_merge` ตรวจกติกานี้ด้วยข้อ `open_model` ([schema-ext.md ข้อ 6](../schema-ext.md)) leaf `speeds.*` หรือ `performance.*` ที่ `src` เป็นแหล่งโมเดลเปิดทั้งหมด หรือ VS1, VS0, VY, ROC, ความเร็วและอัตราร่อน, ระยะวิ่งขึ้นที่เท่ากับผลวัดทศนิยมใน `validation.openModels` ทุกหลัก เป็น WARN (`--strict` ล้ม) ส่วนที่เท่ากันหลังปัดหรือเป็นจำนวนเต็มเป็น info ให้คนตรวจว่า `src` เป็น POH/AFM วันที่ 22 พ.ย. 2026 ได้ 0 WARN และ 4 info ซึ่งตรวจแล้วว่าตรงกันโดยบังเอิญ: `pc7mk2` VS1 75 [LP9], `t6a` VS1 82 และ VS0 74 [LP29], `c172r` ความเร็วร่อน 65 KIAS [LE2]

## สคริปต์ตามหัวข้อ

| คำนำหน้า | หัวข้อ | ตารางเทสต์ |
|---|---|---|
| `lm_*` | 01 วิธีประมาณค่าและเครื่องมือ (`lm_lib`, `lm_merge`, `lm_card`, `lm_selftest`, `lm_ci`, `lm_derivs`, `lm_inertia`, `lm_polar`, `lm_engine`, `lm_prop`, `lm_legacy_fit`, `lm_tolerance`) | `lm_selftest.mjs` (T-LM) |
| `ls_*` | 02 โรงเรียนการบินไทย | `ls_tests.mjs` (T-LS) |
| `lb_*` | 03 โมเดลเปิด | `lb_tests.mjs` (T-LB, อ่าน fixture ใน `out/`) |
| `lc_*` | 04 C172S | `lc_tests.mjs` (T-LC) |
| `ld_*` | 05 DA40 | `ld_tests.mjs` (T-LD) |
| `lt_*` | 06 DA42 | `lt_tests.mjs` (T-LT) |
| `lp_*` | 07 เครื่องฝึกใบพัดเทอร์โบ | `lp_check.mjs` (T-LP) |
| `lh_*` | 08 การบังคับและการประเมินผล | `lh_tests.mjs` (T-LH) |
| `lo_*` | 09 ขั้นตอนและวงจรฝึก | `lo_tests.mjs` (T-LO) |
| `le_*` | 10 C172R | `le_tests.mjs` (T-LE) |
| `lf_*` | 11 C152 | `lf_tests.mjs` (T-LF) |
| `lg_*` | 12 P2006T | `lg_tests.mjs` (T-LG) |
| `ln_*` | 13 เครื่องฝึกอื่น | `ln_tests.mjs` (T-LN) |

- ตารางเทสต์ที่ไม่อยู่ใน CI สร้างตารางที่วางในรายงานพร้อมผลของซิมวันนี้ บางตัวต้องรันสคริปต์อื่นก่อน (ดูหัวไฟล์) และบางแถวไม่ผ่านโดยตั้งใจเพราะเป็นข้อค้นพบ
- สคริปต์ Python `lb_*.py` และ `lm_jsb_inertia.py` ใช้ `jsbsim==1.3.3` จาก PyPI (LGPL-2.1) ที่ผู้พัฒนาติดตั้งเอง รันด้วย `python3 -I` ไม่อยู่ใน CI และไม่เป็น dependency ของ repo
- `ls_fleet.mjs --check` ทำงานออฟไลน์ (เทียบบล็อก §02.6 กับบล็อกที่สร้างจาก `out/ls_register_*.json`) ส่วน `ls_aip_check.mjs` และ `lo_aip_check.mjs` ต้องใช้เครือข่ายจึงไม่อยู่ใน CI ให้รันเมื่อ AIRAC เปลี่ยน (งานข้อ 9)
- `lm_fixture_trainer_r1.json` คือ `AC` ของซิมรอบที่ 1 (ฐาน resolve `trainer_r1`), `r1-pertype-paths.json` และ `r1-pertype-leaves.txt` คือ path ต่อแบบ 384 ตัวของรอบที่ 1 ที่ใช้นับ coverage และ `sim-snapshot.json` คือ commit ของซิมที่ `lm_ci.mjs` ใช้

## สัญญาอนุญาต

สคริปต์เหล่านี้เขียนขึ้นใหม่สำหรับ AirfieldLab และอยู่ภายใต้สัญญาอนุญาตเดียวกับ repo สคริปต์ที่รันโมเดลเปิดเก็บเฉพาะตัวเลขผลวัด ไม่คัดลอกโค้ด XML หรือตารางของโมเดล (§03.5.5)
