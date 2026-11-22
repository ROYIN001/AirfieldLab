# Schema ส่วนขยายของรอบที่ 2 (เครื่องบินเล็กและเครื่องฝึก)
← [กลับไปหน้ารวมรอบที่ 2](../02-light-aircraft.md)

ไฟล์นี้คือข้อตกลงร่วมของทุกหัวข้อย่อยในรอบที่ 2 ใช้คู่กับ
1. schema ของรอบที่ 1: [`../01-flight-physics/schema.md`](../01-flight-physics/schema.md) (หลัก) และรายการ leaf รายแบบ 384 ตัวใน `scripts/r1-pertype-leaves.txt` (และรายการ path ใน `scripts/r1-pertype-paths.json`)
2. schema ส่วนขยายของรอบที่ 3 (เครื่องบินโดยสาร): [`../03-airliners/schema-ext.md`](../03-airliners/schema-ext.md) (มีใน repo เมื่อ pull request ของรอบที่ 3 merge แล้ว)

รอบที่ 2 ใช้โครงเดียวกับรอบที่ 3 ทุกอย่าง (leaf, บล็อก JSON ที่มีคีย์บนสุดคีย์เดียว, หมวด `airframe`, `aero.derivatives`, `aero.flaps.detents`, `speeds`, `performance`, `propulsion`, `controls.*`, `ops`, `validation.*`) เพื่อให้ทั้งสองรอบป้อนรูปแบบ `data/aircraft/<id>.json` เดียวกันได้ ข้อ 1–4 ด้านล่างสรุปส่วนที่ใช้ร่วม ข้อ 5 เป็นส่วนที่รอบที่ 2 เพิ่ม ข้อ 6 คือการตรวจความสอดคล้องที่ `lm_merge` ทำ ถ้าขัดกันให้ยึดไฟล์นี้แล้วบันทึกไว้ในหัวข้อ "ความขัดแย้ง"

**อัปเดต 19 พ.ย. 2026** (ตามการตรวจความครบถ้วนและข้อตัดสิน D1–D6 ของผู้ประสานงาน): ความเร็วอ้างอิงของบัตร (D1, ข้อ 4 และ `speeds`), ระยะเคลื่อนพื้นบังคับ (D2, `controls`), รูปแบบ `training_mass` (D3, `airframe`), scope ตามหมวด (D4, ข้อ 1), ไฟล์ 13 และ `_na ["*"]` (D5, ข้อ 2–4), ชื่อ detent (D6, `aero`), ฐาน resolve `trainer_r1` (ข้อ 2) และการตรวจใหม่ (ข้อ 6) กฎที่เปลี่ยนมีคำว่า "อัปเดต 19 พ.ย. 2026" กำกับ

**ขอบเขตของ D1 และ D4** สองข้อนี้บังคับเฉพาะบัตรของรอบที่ 2 บัตรเครื่องบินโดยสารของรอบที่ 3 ไม่ทำตามและไม่ต้องแก้: รอบที่ 3 ตั้ง scope ตามความหมายของค่า (เช่น `gear.brakes.*` เป็น `aircraft`, `controls.fbw.*` เป็น `sim`) และให้ VREF/VAPP เป็นตารางหรือกฎตามมวลแทนตัวเลขที่มวลฝึก ดูย่อหน้า "ความต่างจากข้อตกลงของรอบที่ 2" ใน [`../03-airliners.md`](../03-airliners.md) (มีใน repo เมื่อ pull request ของรอบที่ 3 merge แล้ว) ตัวอ่านที่สร้าง `data/aircraft/<id>.json` จึงต้องตั้ง scope ตามหมวดตอนโหลด และคำนวณ VREF/VAPP จากมวลที่เลือกเมื่อบัตรให้เป็นตารางหรือกฎ ส่วน `lm_merge --strict` (ข้อ 6) ใช้ตรวจไฟล์ของรอบที่ 2 เท่านั้น ไม่ใช้กับ `params-*.json` ของรอบที่ 3

## 1. leaf

ทุกพารามิเตอร์เป็น `{"v","u","scope","src","conf","est","note"}` ครบ 7 ฟิลด์ ไม่มีฟิลด์อื่น
- `v` ตัวเลข สตริง อาร์เรย์ อ็อบเจกต์ตาม config (เช่น `{"0":…, "10":…, "30":…}` ตามองศาแฟลป) หรือตาราง `{"axes":{…},"data":[…]}`
- `u` หน่วยเป็นสตริง (SI เป็นหลัก: `m`, `kg`, `N`, `W`, `s`, `rad`, `deg`, `1/rad`, `kg m2`; ค่าไร้หน่วย `-`) ความเร็วในหมวด `speeds` ใช้ `kt IAS` หรือ `kt CAS` (ต้องระบุว่าอันไหน) และหน่วยการบินอื่นใส่ใน `note`
- `scope` `aircraft` | `engine` | `propeller` | `gear` (ค่ารายแบบ) · `environment` | `sim` (ค่าร่วม)
  - **อัปเดต 19 พ.ย. 2026 (D4)** scope ตามหมวดแรกของ path: `gear.*` → `gear`; `piston.*`, `turboprop.*`, `turbofan.*`, `engine.*` → `engine`; `propeller.*` → `propeller`; `airframe`, `aero`, `speeds`, `performance`, `controls`, `ops`, `procedures`, `validation`, `otherSims` → `aircraft`; หมวดอื่นของรอบที่ 1 (`interference.*`, `wind.*`, `input.*`) ใช้ scope เดียวกับ path นั้นในรอบที่ 1; `common_light` ใช้ `environment` หรือ `sim` เท่านั้น (`lm_merge` ตรวจ ข้อ 6)
- `src` อาร์เรย์รหัสแหล่งในไฟล์หัวข้อของตัวเอง เช่น `["LC7"]` อ้างข้ามหัวข้อได้ เช่น `["LM3"]` หรือรอบที่ 1 `["R1:A11"]` ห้ามว่าง (ยกเว้น `_na`, `_inherits`)
  - **อัปเดต 22 พ.ย. 2026 (R2-03)** รหัส `L?n` ต้องมีบรรทัดของตัวเอง (แถวตารางที่ช่องแรกมีรหัสเดียว หรือรายการ `- [L?n]`) ในส่วน "NN.x แหล่งอ้างอิง" ของไฟล์เจ้าของตามตารางข้อ 4; รหัส `R1:<X>n` ต้องมีในส่วนแหล่งอ้างอิงของไฟล์รอบที่ 1 ตามตัวอักษร (ย่อหน้าท้ายข้อ 4); `R1:params-trainer.json` คือค่าที่ path เดียวกันใน `params-trainer.json` ของรอบที่ 1 ถ้า path ต่างกันเขียน `R1:params-trainer.json#<path ของรอบที่ 1>`; คำว่า `R1` เปล่า ๆ ใช้ไม่ได้ `lm_merge` ตรวจทุกรหัส (ข้อ `src_ref` ในข้อ 6)
- `conf` `สูง` (อ่านตรงจากเอกสารปฐมภูมิหรือคำนวณจากนิยาม) · `กลาง` (แหล่งทุติยภูมิหรือต้องตีความ) · `ต่ำ` (ประมาณจากหลักการหรือยังไม่ยืนยัน)
- `est` `true` = **ค่าประมาณ** ต้องบอกวิธีได้มาใน `note` หรือเนื้อหา
  - **อัปเดต 19 พ.ย. 2026** `est: true` ต้องมีคำว่า "ค่าประมาณ" (อย่างน้อย "ประมาณ") ใน `note` และ `conf` เป็น `กลาง` หรือ `ต่ำ` ไม่ใช่ `สูง`; `est: false` ห้ามเขียนว่า "ค่าประมาณ" ใน `note` (ยกเว้นวลีปฏิเสธ เช่น "ไม่ใช่ค่าประมาณ") ค่าที่ได้จากการ fit หรือการคำนวณของโครงการเอง (เช่นรูปทรงใบพัดจาก BEM) เป็น `est: true` (`lm_merge` ตรวจ ข้อ 6)
- `note` หมายเหตุภาษาไทยสั้น ๆ (หน่วยการบิน, เงื่อนไข เช่น มวล CG แฟลป, เลขหน้าในเอกสาร)

## 2. บล็อก JSON ในไฟล์หัวข้อ

- บล็อก ```json ที่เป็นข้อมูลต้องมี **คีย์บนสุดคีย์เดียว** เป็นรหัสแบบเครื่องบิน (ข้อ 3) หรือ `common_light` บล็อกตัวอย่างที่ไม่ใช่ข้อมูลให้ใช้ ```js หรือมีคีย์บนสุดมากกว่าหนึ่งคีย์
- แบ่งเป็นหลายบล็อกได้ (เช่นบล็อกละหมวด) สคริปต์รวมจะ deep-merge ตามรหัสแบบ ถ้า path เดียวกันมาจากสองที่จะถูกแจ้งเป็นความขัดแย้ง จึงต้องเขียนเฉพาะ path ที่หัวข้อของตัวเองเป็นเจ้าของ (ข้อ 4)
- ตรวจด้วย `node docs/research/02-light-aircraft/scripts/lm_merge.mjs --type <id> --coverage --dry` (แจ้ง ERRORS, CONFLICTS และ path ของรอบที่ 1 ที่ยังไม่เติมและไม่อยู่ใน `_na`) ต้องไม่มี ERRORS/CONFLICTS ในบล็อกของตัวเองก่อนส่งงาน **อัปเดต 19 พ.ย. 2026**: คำสั่งเดียวกันพิมพ์การตรวจความสอดคล้อง (ข้อ 6) เป็น WARN ต่อ id พร้อมไฟล์:บรรทัด ควรแก้ WARN ของบล็อกตัวเองด้วย; `--strict` นับ WARN เป็น ERROR (exit 1) และจะเปิดใน CI เมื่อทุกบัตรแก้ครบ
- รุ่นย่อย: `"_inherits": {"v":"da40ng","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"…"}` แล้วใส่เฉพาะค่าที่ต่าง
  - **อัปเดต 19 พ.ย. 2026** `_inherits` อ้าง**ฐาน resolve** ได้โดยไม่ต้องมีบล็อกในไฟล์หัวข้อ: `trainer_r1` = fixture `02-light-aircraft/scripts/lm_fixture_trainer_r1.json` (`AC` ของซิมวันนี้) รวมกับ leaf ต่อแบบของรอบที่ 1 จาก `01-flight-physics/params-trainer.json` (ยกเว้น `turbofan.*`, `controls.reference_types.*`) ฐานไม่ถูกคัดลอกลง `params-light.json` ไฟล์นั้นบอกที่มาใน `_meta.bases` (01-methods §01.2.5); coverage ของ id ที่สืบทอดคิดบนบัตรที่ resolve แล้ว
- path ของรอบที่ 1 ที่ไม่ใช้กับแบบนั้น: leaf `_na` ระดับบนของแบบ `v` = อาร์เรย์ path (ใช้ `หมวด.*` ได้) และ `note` บอกเหตุผล เช่น `["turbofan.*", "turboprop.*", "gear.strut_main.*"]` สำหรับเครื่องลูกสูบที่ใช้ขาสปริง
  - **อัปเดต 19 พ.ย. 2026 (D5)** `v` = `["*"]` (หรือมี `"*"` ในอาร์เรย์) แปลว่าทุก path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกตั้งใจไม่ใส่ ใช้กับ id ที่ไม่มีบัตรข้อมูล เช่น `pa28_180` ที่มีแค่ข้อมูลโมเดลเปิดของหัวข้อ 03 `note` ต้องบอกเหตุผล coverage ของ id นั้นจะขาด 0 และ `lm_merge` ไม่ตรวจความเร็ว (ข้อ 6) ของ id นั้น

## 3. รหัสแบบเครื่องบิน (type id)

| รหัส | แบบ | หมายเหตุ |
|---|---|---|
| `c172s` | Cessna 172S Skyhawk SP (Lycoming IO-360-L2A, ใบพัด fixed pitch) | |
| `da40ng` | Diamond DA40 NG (Austro AE300, ใบพัด MT constant speed) | แบบหลักของ DA40 |
| `da40_180` | DA40 / DA40 CS / DA40 XLS เครื่อง Lycoming IO-360-M1A | `_inherits: da40ng` ใส่เฉพาะที่ต่าง (ตั้งชื่อรหัสรุ่นย่อยอื่นตามรูปแบบนี้ถ้าจำเป็น) |
| `da42ng` | Diamond DA42 NG (2× AE300) | แบบหลักของ DA42 (เลือกรุ่นที่โรงเรียนไทยใช้จริงถ้าหัวข้อ 02 พบว่าต่าง) |
| `da42_vi`, `da42_tae125` | รุ่นย่อย DA42 | `_inherits: da42ng` ถ้าจำเป็น |
| `pc7mk2`, `pc9m`, `t6a`, `t6c` | เครื่องฝึกใบพัดเทอร์โบคลาสอ้างอิง | ค่าที่เปิดเผยสาธารณะเท่านั้น |
| `trainer_r2` | ข้อเสนอของรอบที่ 2 สำหรับเครื่องฝึกสมมติของ AirfieldLab | ใส่เฉพาะ leaf ที่เสนอให้เปลี่ยนจากรอบที่ 1 (บอก path และค่าเดิมใน `note`); `_inherits: trainer_r1` resolve กับฐานของข้อ 2 (อัปเดต 19 พ.ย. 2026) |
| `pa28_161`, `be76`, `p2002jf`, `p68c`, `t206h`, `ct4` | แบบที่โรงเรียนหรือผู้ใช้ในไทยใช้ บัตรย่อระดับ TCDS ในไฟล์ 13 (LN) | อัปเดต 19 พ.ย. 2026 (D5); `ct4` ใช้แหล่งสาธารณะและการอธิบายแบบทั่วไปตามกติกาข้อมูลทหาร |
| `pa28_180` | ข้อมูลโมเดลเปิดเท่านั้น (หัวข้อ 03) ไม่มีบัตร | อัปเดต 19 พ.ย. 2026 (D5): `_na ["*"]` |
| อื่น ๆ | แบบที่โรงเรียนการบินไทยใช้ เช่น `c152`, `p2008jc`, `p2006t`, `sr20`, `pa44_180` | ตั้งชื่อรูปแบบนี้ (ตัวเล็ก ตัวเลข `_`) |
| `common_light` | ค่าที่ใช้ร่วมกันทุกแบบในรอบนี้ (scope `environment`/`sim`) | |

## 4. เจ้าของ path (หัวข้อไหนเขียนอะไร)

| ไฟล์ (ใน `02-light-aircraft/`) | รหัส | เขียน JSON ใน path |
|---|---|---|
| `01-methods.md` | LM | `common_light.methods.*` (ค่าคงที่ของวิธีประมาณ เช่นตาราง radius of gyration) |
| `02-thai-schools.md` | LS | `common_light.thai_fleet.*` (โรงเรียน/ผู้ใช้ แบบ และจำนวนเครื่อง) |
| `03-open-models.md` | LB | `<id>.otherSims.*` และ `<id>.validation.openModels.*` ของทุกแบบที่มีโมเดลเปิด และ `pa28_180._na` = `["*"]` (อัปเดต 19 พ.ย. 2026, D5) |
| `04-c172s.md` | LC | `c172s` ทุกหมวด ยกเว้น `ops`, `procedures`, `otherSims`, `validation.openModels` |
| `05-da40.md` | LD | `da40ng` และรุ่นย่อย DA40 (ข้อยกเว้นเดียวกัน) |
| `06-da42.md` | LT | `da42ng` และรุ่นย่อย DA42 (ข้อยกเว้นเดียวกัน) |
| `07-turboprop-trainers.md` | LP | `pc7mk2`, `pc9m`, `t6a`, `t6c`, `trainer_r2` (ข้อยกเว้นเดียวกัน) |
| `08-handling.md` | LH | `<id>.ops.*` ของทุกแบบ, `common_light.ops.*`, `common_light.evaluator.*` |
| `09-procedures.md` | LO | `<id>.procedures.*` ของทุกแบบ, `common_light.procedures.*` |
| `10-…md`, `11-…md`, `12-…md` | LE, LF, LG | บัตรข้อมูลแบบย่อของแบบที่โรงเรียนไทยใช้ (ข้อยกเว้นเดียวกับบัตรหลัก) |
| `13-other-trainers.md` | LN | `pa28_161`, `be76`, `p2002jf`, `p68c`, `t206h`, `ct4` ทุกหมวดของบัตร รวม `speeds.*` (ข้อยกเว้นเดียวกับบัตรหลัก) — อัปเดต 19 พ.ย. 2026 (D5) |

**อัปเดต 19 พ.ย. 2026 (D1) ความเร็วอ้างอิง**: เจ้าของบัตรตามตารางนี้เป็นเจ้าของ `speeds.VREF_kt` และ `speeds.VAPP_kt` ที่ `airframe.weights.training_mass` (สำหรับ `pa28_161`, `be76`, `p2002jf`, `p68c`, `t206h`, `ct4` คือไฟล์ 13) หัวข้อ 08 (`ops.attitude_power.final.v.ias_kt`) และ 09 (`procedures.stabilised.v.Vapp`) **อ้างค่าของบัตร** ต่างได้ไม่เกิน 0.5 kt ถ้าหัวข้อ 08/09 ใช้ค่าที่แก้ตามมวลอื่น ต้องเขียน "แก้มวล" (หรือ "mass-corrected") พร้อมมวลและวิธีใน `note` ของ leaf นั้น

รหัสแหล่งอ้างอิงและกรณีทดสอบใช้รหัสสองตัวอักษรในตาราง เช่น แหล่ง [LC12] และกรณีทดสอบ T-LC-07 (ไม่ซ้ำกับรอบที่ 1 ที่ใช้ตัวเดียว A, U, P, E, F, C, G, W, N, V, I, S และรอบที่ 3 ที่ใช้ R, B, L, H, D, J, Y, Z, O, K) สคริปต์ใช้คำนำหน้าตัวเล็ก เช่น `scripts/lc_*.mjs`

## 5. หมวดและ path (ร่วมกับรอบที่ 3 + ส่วนที่รอบที่ 2 เพิ่ม)

ระบบตำแหน่งบนตัวเครื่อง (ระบุใน `u` ทุกครั้ง):
- `m DAT` = ระยะจาก datum ของผู้ผลิตไปทางท้าย (บวก) ตามที่ POH/AFM/TCDS ใช้ ต้องบอกว่า datum อยู่ที่ไหน (เช่น C172: ผิวหน้า firewall; DA40: ตามที่ AFM กำหนด) ค่าเป็นนิ้วใส่ใน `note`
- `m FRD` = จาก CG อ้างอิง (x หน้า, y ขวา, z ลง) ตามรอบที่ 1 CG อ้างอิงของแต่ละแบบระบุใน `airframe.cg.ref`
- `m STA` (จากจมูกเครื่อง) ใช้เมื่อเอกสารให้แบบนั้น ตามรอบที่ 3

### `airframe` (บัตรรายแบบ)
- `airframe.identity` — leaf เดียว `v` = `{manufacturer, model, variant, engine, propeller, seats, category (normal/utility/aerobatic), tc_ref}`
- `airframe.weights.{MTOW, MLW, MRW, BEW_typical, max_fuel_usable, useful_load}` — kg (MLW ใส่เมื่อ POH กำหนดต่างจาก MTOW; น้ำหนักเปล่าให้บอกว่าเป็นค่าตัวอย่างของเครื่องลำไหนหรือค่าโบรชัวร์)
- `airframe.weights.training_mass` — มวลที่เสนอให้ซิมใช้เป็นค่าเริ่มต้น (ครูฝึก + ศิษย์ + เชื้อเพลิงตามที่ระบุ) พร้อมวิธีคิด
  - **อัปเดต 19 พ.ย. 2026 (D3)** `v` = `{"kg", "empty_kg", "crew_kg", "fuel_kg"}` (เพิ่ม `"fuel_l"` ได้) `u` = `kg`; `kg` = `empty_kg + crew_kg + fuel_kg` (±2 kg); `empty_kg` เท่ากับ `airframe.weights.BEW_typical` หรือ `note` อธิบายความต่างโดยอ้างคำว่า `BEW_typical` ตัวอย่าง `{"kg": 1000, "empty_kg": 760, "crew_kg": 170, "fuel_kg": 70, "fuel_l": 97}` (ตัวเลขสมมติเพื่อแสดงรูปแบบ) เครื่องมือของหัวข้อ 01 ยังอ่านตัวเลขเดียวและคีย์แบบเก่า `{kg, BEW, crew, fuel}` ได้ (`trainingMassKg`) แต่ `lm_merge` เตือน
- `airframe.cg.{datum, LEMAC, MAC, envelope, ref}` — `envelope` เป็นตาราง/รูปหลายเหลี่ยม `[[mass_kg, fwd_m, aft_m], …]` หน่วย `kg, m DAT` และ %MAC ใน `note`; `ref` = CG อ้างอิงของตำแหน่ง FRD และ inertia (m DAT และ %MAC)
- `airframe.inertia.{Ixx, Iyy, Izz, Ixz, ref_mass, radii, method}` — kg m2 แกนตัวเครื่องที่ CG อ้างอิง; `radii` = `{Rx, Ry, Rz}` แบบไร้มิติของ Roskam (Ixx = m (b Rx / 2)², Iyy = m (L Ry / 2)², Izz = m ((b+L)/2 · Rz / 2)²) ตามรอบที่ 3
- `airframe.wing.{S, b, MAC, AR, taper, sweep_c4_deg, dihedral_deg, incidence_deg, twist_deg, airfoil}`
- `airframe.tail.{S_h, b_h, l_h, S_v, b_v, l_v, airfoil_h, airfoil_v, incidence_h_deg}` — แขนโมเมนต์ = ระยะ 25% MAC ปีก ถึง 25% MAC หาง
- `airframe.surfaces.{elevator, aileron, rudder, flap, trim_tab}` — `{area_m2, chord_ratio, span_fraction}` (ระยะเคลื่อนอยู่ที่ `controls.surfaces`)
- `airframe.geometry.{length, span, height, wheelbase, main_track, prop_clearance, eye_pos_FRD, eye_height_static}` — ตำแหน่งตานักบิน (ที่นั่งซ้าย) ใช้วางกล้องและคำนวณการมองเห็นไฟ PAPI

### `aero` (บัตรรายแบบ)
- `aero.ref.{S, b, c}` — ตามรอบที่ 1
- `aero.derivatives.*` — ชื่อตามตัวแปรใน `AC` (`src/20-flight.js:100–118`): `CLq, CLadot, CLde, CD0, K, CYb, CYdr, CYr, Clb, Clp, Clr, Clda, Cldr, Cmq, Cmadot, Cmde, Cnb, Cnp, Cnr, Cnda, Cndr` หน่วยต่อ rad; rate derivative ไร้มิติด้วย c̄/2V (pitch, α̇) และ b/2V (roll, yaw) `v` เป็นอ็อบเจกต์ตาม config ได้ (`{"cruise":…, "approach":…}`)
- **เครื่องหมาย (ตาม `AC` ปัจจุบัน ต้องแปลงค่าจากเอกสารให้ตรงก่อนใส่)**: α บวกเมื่อเชิดหัว; `de` บวก = ขอบท้าย elevator ลง (ก้มหัว) ⇒ `Cmde < 0`, `CLde > 0`; `da` บวก = สั่งม้วนขวา ⇒ `Clda > 0` และ adverse yaw `Cnda < 0`; `dr` บวก = ขอบท้าย rudder ไปซ้าย ⇒ `CYdr > 0`, `Cndr < 0`, `Cldr > 0`; `Cnb > 0` (เสถียร), `Clb < 0` (dihedral effect)
- `aero.static_long.*` — path ของรอบที่ 1 (`CL0`, `CLalpha`, `CLmax_target`, `alpha_CLmax`, `Cm0`, `Cmalpha`, …) ค่าตามแฟลปใช้ชื่อ detent จริง เช่น C172S `{"0":…, "10":…, "20":…, "30":…}` (องศา) DA40 `{"UP":…, "TO":…, "LDG":…}`
- `aero.flaps.detents` — `[{name, flap_deg, VFE_kt, dCL0, dCD0, dCm0, CLmax}]`; `aero.flaps.transition_time_s`
  - **อัปเดต 19 พ.ย. 2026 (D6)** `name` ใช้ชื่อตำแหน่งแฟลปตาม AFM/POH ของแบบนั้นตามตัวอักษร (เจ้าของบัตรตรวจกับ AFM; P2006T ให้หัวข้อ 12 ตัดสิน) และทุกที่ที่อ้างแฟลปใช้ชื่อเดียวกันนี้: คีย์ตามแฟลปใน `aero.static_long.*` และ `speeds.VFE`, `validation.stall_test`, หัวข้อ 08 `ops.attitude_power.*.v.flap`, หัวข้อ 09 `procedures.stabilised.v.landingFlaps`, `procedures.pattern.v.flapsAt.*`, `procedures.{short_field, soft_field}.v.{takeoff, landing}.flaps`, `procedures.go_around.v.flapsSeq` (`lm_merge` ตรวจ ข้อ 6)
- `aero.gear_drag.dCD0` (ล้อพับได้) ; `aero.legacy` — ค่าที่ทำให้แบบนี้บินได้กับโค้ดวันนี้ทันที: `{CL0, CLa, CLflap, CDflap, CDgear, Cm0, Cma, Cmflap, aStall, aStallFlap}` (นิยามตาม `AC`; `AC.flaps` 0–1 เป็นสัดส่วนของแฟลปสุด) — หัวข้อ 01 กำหนดวิธีแปลง

### `speeds` (บัตรรายแบบ; `u` = `kt IAS` หรือ `kt CAS`)
- `speeds.{VS0_kt, VS1_kt, VX_kt, VY_kt, VR_kt, VAPP_kt, VAPP_short_kt, VREF_kt, VG_kt, VA_kt, VNO_kt, VNE_kt, VLE_kt, VLO_kt}` (ใส่เท่าที่แบบนั้นมี; VA และ VG ที่ขึ้นกับมวลใช้ตาราง)
  - **อัปเดต 22 พ.ย. 2026 (R2-04)** `VS0_kt`/`VS1_kt` เป็นความเร็วต่ำสุดตาม POH/AFM การทดสอบเทียบ VS (KCAS)/√0.95 กับ V_SR 1 g ของซิม (V/√nz ที่ CLmax, `lm_card.stallTest`) ตาม `common_light.methods.stall_nz_at_vmin` ไม่เทียบกับ Vmin ของซิม (Vmin และ nz ที่ Vmin เป็นข้อมูลเท่านั้น)
- `speeds.VFE` — `{"<detent>": kt}`
- เครื่องสองเครื่องยนต์: `speeds.{VMCA_kt, VYSE_kt, VXSE_kt, VSSE_kt}`
- `speeds.ias_cas` — ตาราง KIAS → KCAS ตามแฟลปจาก POH/AFM (ซิมต้องใช้ CAS ในฟิสิกส์ IAS ใช้แสดงผลและเทียบเกณฑ์)
- **อัปเดต 19 พ.ย. 2026 (D1) ความเร็วอ้างอิงของบัตร**: ทุกบัตรต้องมี `speeds.VREF_kt` และ `speeds.VAPP_kt` เป็นตัวเลข ที่ `training_mass` และแฟลปลงจอด (`u` บอก `kt IAS` หรือ `kt CAS`; ถ้าสองค่าต่างหน่วย ให้มี `speeds.ias_cas` ของ detent ลงจอดเพื่อแปลง) ต้องได้ VAPP ≥ VREF เมื่อเทียบใน KCAS ค่าที่ POH ให้ที่ MTOW ให้แก้ด้วย $V \propto \sqrt{m}$ แล้วบอกใน `note` ค่าคู่นี้เป็นค่ากลางที่หัวข้อ 08 และ 09 อ้าง (ข้อ 4)
- `speeds.stall_table` — ความเร็ว stall ตามมุมเอียง แฟลป และ CG จาก POH/AFM, `speeds.stall_warning_margin_kt`, `speeds.stall_altitude_loss_ft`
- `speeds.crosswind_demonstrated_kt`, `speeds.icao_approach_category`

### `performance` (บัตรรายแบบ; ค่าตามเงื่อนไขที่ระบุใน `note`: มวล, ISA/OAT, ความสูง, ลม, ผิว)
- `performance.{ROC_SL_fpm, ROC_table, service_ceiling_ft, cruise_table, glide, takeoff, landing, takeoff_table, landing_table, fuel}`
  - `glide` = `{speed_kt, ratio}` ; `takeoff` = `{ground_roll_m, over50ft_m}` ที่ MTOW SL ISA ลมสงบผิวแห้ง ; `landing` = เหมือนกัน
  - `*_table` = ตารางจาก POH ตามความสูงและอุณหภูมิ (เท่าที่ได้) ให้มีจุดที่ใกล้สภาพ VTBD (ความสูงสนาม 9 ft, OAT 30–35 °C) ถ้า POH มี
- `performance.tests` — จุดเป้าที่ใช้ตรวจโมเดลอัตโนมัติ (รายการ `{case, conditions, quantity, expected, tolerance}`)

### `propulsion` และเครื่องยนต์
- `propulsion.layout` — `[{"id":1,"pos":[x,y,z],"axis":[1,0,0],"type":"piston"|"turboprop","model":"…","prop_sense":+1|-1}]` หน่วย m FRD (เครื่องเดียวมีหนึ่งแถว) `prop_sense` +1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง ตามรอบที่ 1
- `propulsion.legacy` — `{P, eta, T0, idle}` ตามนิยาม `AC`/`thrustAvail()` ปัจจุบัน ที่ทำให้แบบนี้บินกับโค้ดวันนี้ได้ใกล้ POH (หัวข้อ 01 กำหนดวิธี fit)
- **ใหม่ `piston.*`** (scope `engine`) สำหรับเครื่องลูกสูบและดีเซล:
  - `piston.identity` — `{model, kind: "carb"|"fuel_injected"|"turbo_diesel", displacement_L, cylinders, tcds}`
  - `piston.ratings.{P_rated, rpm_rated, P_mcp, rpm_redline, rpm_idle, takeoff_time_limit_s}` — W, rpm
  - `piston.altitude` — `{model, f, critical_alt_m, max_operating_alt_m, table}` สัดส่วนกำลังคันเร่งเต็มต่อกำลังพิกัดตามความสูงและอุณหภูมิ (`u` = `-`) สูตรอยู่ใน 01-methods §01.6.1 และ `common_light.methods.engine_lapse`
    - **อัปเดต 22 พ.ย. 2026 (R2-01)** `model` = `"gagg_ferrar"` | `"ind_friction"` | `"turbo_flat"` | `"table"`
    - `gagg_ferrar` — $P/P_0 = \sigma - (1-\sigma)/7.55$ ลูกสูบไม่มี turbo ไม่มีฟิลด์เพิ่ม (ชื่อ enum สะกดตามที่บัตรและ `lm_engine` ใช้ ผู้แต่งสูตรคือ Gagg & Farrar)
    - `ind_friction` — $P/P_r = (1+f)\,\frac{MAP}{MAP_r}\frac{N}{N_r}\sqrt{T_0/T} - f\,(N/N_r)^2$ (กำลัง indicated ∝ $p/\sqrt T$ ตาม NACA R-190 ลบกำลังเสียดทานที่ไม่ขึ้นกับอุณหภูมิ) ฟิลด์ `f` = กำลังเสียดทาน / กำลังพิกัด ไร้หน่วย **ค่าประมาณ** 0.10 (ช่วง 0.08–0.15) ไม่ใส่ `f` = 0.10 ตาม `lm_engine.lapse()` ใช้กับลูกสูบไม่มี turbo เมื่อมี ISA deviation (ค่าเริ่มของ AirfieldLab เพราะ VTBD อยู่ในเขตร้อน)
    - `turbo_flat` — $P = P_r$ ถึง `critical_alt_m` (m; `null` = AFM ยังไม่ให้) เหนือจากนั้น `gagg_ferrar` ของ $\sigma/\sigma_{crit}$ (AE300, CD-135)
    - `table` — `table` = `{"axes":{"h_ft":[…]},"data":[…]}` สัดส่วนกำลังสูงสุดตามความสูงจาก AFM (`lm_engine.lapse()` ยังไม่อ่าน)
    - ฟิลด์เสริม: `max_operating_alt_m` (m, จาก AFM) ใช้ได้ทุก model; คีย์อื่นใน `v` (เช่น `vtbd_35C`, `at_8000ft_isa` ของ `p2006t`) เป็นผลคำนวณประกอบ ไม่ใช่อินพุต
  - `piston.power_map` — ตาราง P(rpm, MAP) หรือ P(load %) (FADEC) ; `piston.fuel` — `{fuel, bsfc_g_per_kWh, ff_table}`
  - `piston.dynamics.{tau_throttle_s, I_engine, friction_torque}` ; `piston.fadec` — การจับคู่คันเร่งเดียว → load % → รอบใบพัด (AE300)
- เทอร์โบพร็อป: path ของรอบที่ 1 หัวข้อ 4 (`turboprop.*`)
- **ใบพัด**: path ของรอบที่ 1 หัวข้อ 3 (`propeller.*`) และเพิ่ม
  - `propeller.identity.kind` — `"fixed"` | `"constant_speed"` | `"constant_speed_feathering"`; `propeller.identity.model`
  - `propeller.fixed.{pitch_in, beta75_deg, static_rpm_range}` สำหรับใบพัด fixed pitch; `propeller.tables.CT/CP` ของ fixed pitch มีแกน J อย่างเดียว

### `controls` (บัตรรายแบบ)
- `controls.architecture` — `{"pitch":"reversible", "roll":…, "yaw":…, "trim":"tab"|"ths"|"spring"}` ตามรอบที่ 3
- `controls.surfaces.<elevator|aileron|rudder|flap|trim_tab>` — `{travel_deg:{up,down} หรือ {left,right}, rate_dps, actuator_tau_s}` (ระยะเคลื่อนจาก TCDS/AMM เป็นหลัก)
  - **อัปเดต 19 พ.ย. 2026 (D2)** รูปแบบมาตรฐานคือ leaf เดียวต่อพื้นบังคับที่ `controls.surfaces.<s>` และ `travel_deg` อยู่ใน `v` เช่น `"elevator": {"v": {"travel_deg": {"up": 28, "down": 23}}, "u": "deg", …}`; `travel_deg` เป็นตัวเลขเดียวได้ (ถือว่าสมมาตร) `lm_card.buildAC` อ่านรูปแบบนี้ก่อน แล้วจึงอ่าน path เดิม `controls.surfaces.<s>.travel_deg` เป็นทางสำรอง บัตรไม่ต้องใส่ทางเลี่ยงในสคริปต์อีก (01-methods §01.2.3)
- `controls.trim.*` — ชนิด (manual wheel, electric), ช่วงมุม, อัตรา
- path ของรอบที่ 1 `controls.pitch/roll/yaw.*` (hinge moment, gearing, breakout, ...) สำหรับระบบ reversible

### `gear` (บัตรรายแบบ)
- path ของรอบที่ 1 หัวข้อ 7 (`gear.geometry`, `gear.strut_*`, `gear.tyre_*`, `gear.brakes`, `gear.steering`, …) และเพิ่ม
  - `gear.layout` — `"tricycle_fixed"` | `"tricycle_retract"` ; `gear.retract.{time_s, VLO_kt, VLE_kt}`
  - `gear.strut_main.kind`, `gear.strut_nose.kind` — `"oleo"` | `"trailing_link_oleo"` | `"spring_leg"` | `"elastomer"`
  - `gear.strut_main.spring.{k_vertical, k_lateral, damping_ratio, static_deflection}` สำหรับขาสปริง (เช่น C172 ล้อหลัก tubular spring steel)
  - `gear.steering.mode` (path รอบที่ 1) ใช้ค่า `"pedal_linked"` | `"castering_diff_brake"` | `"tiller"` และ `gear.steering.pedal_max` / `caster_max`

### `ops` (หัวข้อ 08 เจ้าของ; path ร่วมกับรอบที่ 3 + ของเครื่องเล็ก)
- `ops.attitude_power.<phase>` — phase = `takeoff_roll`, `rotation`, `initial_climb`, `cruise_climb`, `cruise`, `descent`, `downwind`, `base`, `final`, `flare`, `touchdown`, `go_around` แต่ละตัว `v` = `{ias_kt, pitch_deg, power, flap, rate_fpm}` (`power` ใช้หน่วยที่นักบินแบบนั้นอ่าน: rpm, MAP, load %, torque %)
- `ops.{trim_technique, flap_effects, stall_characteristics, spin, crosswind_technique, stick_feel}` (ข้อมูลเชิงตัวเลขเท่าที่หาได้ ข้อความใช้ `v` เป็นสตริงได้)
- `ops.{flare_height_m, touchdown_pitch_deg, approach_pitch_deg, crosswind_limits, stabilised_criteria}` ตามรอบที่ 3
- `common_light.evaluator.*` — เกณฑ์ประเมินผลนักบินฝึกที่ใช้ร่วมกันทุกแบบ (ข้อผิดพลาด, ตัวชี้วัด, เกณฑ์ผ่าน/ไม่ผ่าน, คะแนน)

### `procedures` (หัวข้อ 09 เจ้าของ; ใหม่)
- `<id>.procedures.{checklist_summary, pattern, stabilised, short_field, soft_field, go_around}` — ความเร็ว แฟลป กำลังในแต่ละขา และขั้นตอนย่อของแบบนั้น
- `common_light.procedures.{pattern_geometry, pattern_altitude_ft, stabilised_gates, radio_calls}` — ค่าทั่วไปจาก FAA AIM / AC 90-66 / ICAO / กพท.

### `validation`
- `validation.trim_targets.<condition>` — α, θ, กำลัง, elevator ที่สภาพอ้างอิง (บัตรรายแบบ)
- `validation.reference_modes.<condition>` — โหมดพลวัตของแบบจริงหรือจากงานวิชาการ (บัตรรายแบบ; ระบุแหล่ง)
- `validation.openModels.<model>` — ผลวัดจากการรันโมเดลเปิด (หัวข้อ 03 เจ้าของ) **อัปเดต 22 พ.ย. 2026 (R2-05)** ใช้เทียบเท่านั้น ห้ามคัดไปเป็นค่าใน `speeds.*` หรือ `performance.*` (รวม `performance.tests[].expected`) และห้ามใช้เป็นค่าคาดหวังของเทสต์ เป้าของบัตรมาจาก POH/AFM/TCDS ตามลำดับชั้นใน 03 §03.5.2 กติกาเต็มอยู่ใน [`scripts/README.md`](scripts/README.md)
- path ของรอบที่ 1 `validation.*` ที่เป็น per-type (เช่น `hqClassCategory`) — บัตรรายแบบ

### `common_light.methods` (หัวข้อ 01 เจ้าของ; ค่าคงที่ของวิธีประมาณและเครื่องมือ)

**อัปเดต 22 พ.ย. 2026 (R2-01)** 14 leaf ใน `01-methods.md` §01.9 ทุกตัว scope `sim` ค่าใน `v` เป็นอ็อบเจกต์ (คีย์ตามคอลัมน์ "ความหมาย") leaf ที่ `lm_selftest` เทียบกับค่าคงที่ในสคริปต์ (T-LM-22, T-LM-31) ต้องแก้คู่กับสคริปต์เสมอ

| path | หน่วย | scope | ค่าประมาณ | ความเชื่อมั่น | แหล่ง | ความหมาย (คีย์ใน `v`) | ใช้ที่ |
|---|---|---|---|---|---|---|---|
| `methods.radii` | - | sim | ใช่ | ต่ำ | LM15, LM5, LM6, LM9, LM7, LM8 | รัศมีไจเรชันไร้มิติแบบ Roskam ต่อกลุ่ม `single_prop`, `twin_prop`, `trainer_turboprop` แต่ละกลุ่ม `{Rx, Ry, Rz, n, range}`; Ixx = m(b·Rx/2)², Iyy = m(L·Ry/2)², Izz = m((b+L)/2·Rz/2)² ใช้เมื่อบัตรไม่มี inertia | §01.4, `lm_inertia.RADII` (T-LM-22) |
| `methods.stall_nz_at_vmin` | - | sim | ใช่ | ต่ำ | LM1, LM2, R1:V19 | nz ที่ความเร็วต่ำสุดของการ stall ลดความเร็ว 1 kt/s `{nominal 0.95, range [0.9, 1], compare "V_SR", target "VS_POH_KCAS/√nominal", report_only ["Vmin", "nz_Vmin"]}` ใช้แปลงความเร็ว stall ใน POH เป็น CLmax 1 g: CLmax = 2·m·g·nz/(ρ0·S·V²) และกำหนดการเทียบ stall ของโครงการ (R2-04): V_SR 1 g ของซิมเทียบ VS/√0.95 ส่วน Vmin, nz_Vmin รายงานเท่านั้น | §01.5.1, `lm_polar.NZ_AT_VMIN`/`vsrTarget` (T-LM-22, T-LM-33) |
| `methods.flap_map` | - | sim | | กลาง | LM0, R1:V19 | วิธีแปลงขั้นแฟลปจริงเป็น `AC.flaps` f ∈ [0, 1]: `default` `"lift"` (f = ΔCL0(detent)/ΔCL0(full)) หรือ `"deflection"` (f = δf/δf_full) | §01.1.2, `lm_card` |
| `methods.polar_sim_form` | - | sim | | สูง | LM0, R1:V19 | สูตรแปลง polar พาราโบลา (E, CL*) เป็นรูปของซิม CD = CD0s + Ks·(CL − 0.15)²: `CL_offset` 0.15, สตริงสมการ `Ks`, `CD0s`, `CLstar`, `Emax` | §01.5.2, `lm_polar.toSimPolar` |
| `methods.lm_card_defaults` | - | sim | ใช่ | ต่ำ | LM0, LM25, R1:V19 | ค่าที่ `lm_card.buildAC` ใช้เมื่อบัตรไม่มีข้อมูล: `eta` 0.8, `idle` 0.02, `figureOfMerit` 0.55, `gearStaticFrac` 0.3, `gearZeta` 0.6, `noseLoadFrac` 0.15, `strokeNose`/`strokeMain` 0.2 m, `VrefOverVs0` 1.3, `VappMinusVref` 5 kt, `Ixz_over_Ixx` 0 (ค่าที่ใช้ติดธง default ใน `--trace`) | §01.1.3, `lm_card.DEFAULTS` (T-LM-22) |
| `methods.derivs_defaults` | - | sim | ใช่ | ต่ำ | LM10, LM11, LM12, LM13, LM14 | ค่าคงที่ของ `lm_derivs`: `clalpha` 5.969 1/rad (0.95·2π), `eta_h` 0.9, `etaV_fixed` null, `AvEffFactor` 1.55, `tauViscous` 0.85, `CmqWingFus` 1.1, `KnAileron` −0.2, `KiBody`/`zwOverDf`/`hhOverB` ตามตำแหน่งปีก high/mid/low, `fusVolCoef` 0.55, `tailconeDepth` 0.45 m | §01.3.2, `lm_derivs.DEFAULTS` (T-LM-22) |
| `methods.derivs_accuracy` | % | sim | | กลาง | LM5, LM9, LM6, LM0 | ความผิดของ `lm_derivs` เทียบอนุพันธ์จากการบินจริง (TM-80163, TN D-6643) err = (\|est\|/\|ref\| − 1)·100: `median_abs_err_pct_flight` 14.5, `median_abs_err_pct_all` 17.6, `wrong_signs_all` 0, `n` 46, `err_pct` ต่ออนุพันธ์ต่อชุดตรวจ | §01.3.3 |
| `methods.roll_lifting_line` | - | sim | ใช่ | กลาง | LM14, LM0 | สูตร lifting line แทน strip theory: `Clp` = −clα·A/(8·(A + 2·clα/π)), `KLL` = 1.5·A·(1+λ)/((A + 2·clα/π)·(1+3λ)) คูณ `applies_to` (Clβ ส่วน dihedral, Clδa), `KLL_typical` 0.54 | §01.3.1 |
| `methods.engine_lapse` | - | sim | ใช่ | กลาง | LM16, LM27, LM17, LM0 | สูตรของ `piston.altitude.model`: `gagg_ferrar` `{eq, k 7.55}`, `ind_friction` `{eq, f 0.10}`, `turbo_flat` `{eq}` | §01.6.1, `lm_engine` (T-LM-14, T-LM-22) |
| `methods.fuel_density` | kg/l | sim | ใช่ | กลาง | LM4, LM0 | ความหนาแน่นเชื้อเพลิง `avgas` 0.72, `jet` 0.80 ใช้แปลง l/h ↔ kg/h และหา BSFC จากตาราง cruise | §01.6.2, `lm_engine.FUEL_DENSITY` (T-LM-22) |
| `methods.prop_bem_section` | - | sim | ใช่ | ต่ำ | LM0, R1:P10, LM22, LM24 | หน้าตัดใบพัดของ `lm_prop` (BEM + Prandtl tip loss): `cla_per_rad` 5.655, `a0_deg` ต่อใบพัด (`fixed_76x60` −3.5, `cs3_190` −3), `aStall_deg` [−10, 14], `cd0` 0.01, `kcd` 0.012, `cl_mindrag` 0.4, `post_stall_cd`, `blend_Mb_per_rad` 25, `rotational_delay` (Snel), `compressibility`, `chord_scale_fixed_76x60` 1.083 | §01.7 |
| `methods.legacy_fit` | - | sim | ใช่ | ต่ำ | LM0, LM1 | วิธี fit ค่า legacy ของ `AC` (`lm_legacy_fit`): `modes` ["static", "vy"], `default` "static", `polar_from`, `climb_from`, `known_bias_Vy_kt` −8 (Vy ของซิมต่ำกว่า POH ในโหมด static), `known_bias_note`, `static_needs` (ROC), `vy_needs` (ROC + VY), `vy_bounds` {T0 [0.7, 1.3] × ค่า static, eta [0.5, 1.5]}, `vy_no_solution` (เก็บผล static และรายงาน Vy ที่ทำได้) (R2-06) | §01.8, `lm_legacy_fit.FIT_BOUNDS` (T-LM-22, T-LM-34) |
| `methods.selftest_trainer` | - | sim | | สูง | R1:V19, LM0 | ค่า regression ของเครื่องมือ: `lm_card` กับ fixture `trainer_r1` ให้ `V_SR_kt` {LDG 71.86, UP 79.59} KEAS, `Vy_kt` 128, `ROC_fpm` 3225, `LD` {zero_thrust 16.46, idle 21.73}, `approach`/`cruise` `SP`, `DR` = [ωn rad/s, ζ], `tauR_s`, `spiral_t_half_s`, `takeoff_m`, `V50_kt`, `landing_50ft_maxbrake_m` 714 | §01.2.2, `lm_selftest` T-LM-01…07 |
| `methods.lateral_mode_tolerance` | - | sim | ใช่ | ต่ำ | LM0, LM5, LM9, LM15, R1:V7 | ช่วงอัตราส่วน ค่าจริง / ค่าของบัตร ของ Dutch roll (`dr_wn`, `dr_zeta`) และ roll mode (`tauR`) ที่ approach เมื่ออนุพันธ์ lateral-directional มาจาก `lm_derivs`: `validated_class` (คลาส C172, Navion; dr_wn [0.9, 1.45]), `unvalidated_class` (หาง T, สองเครื่องยนต์, turboprop; `K_widen` 1.5, dr_wn [0.75, 1.55]); `spiral` และ `Cnda` ไม่เทียบตัวเลข | §01.3.4, `lm_tolerance` (T-LM-31) |

### อื่น ๆ
- `interference.*`, `wind.*` (per-type), `input.*` (per-type) — path ของรอบที่ 1
- `otherSims.*` — หัวข้อ 03 เจ้าของ
- `_na`, `_inherits` — ข้อ 2

## 6. การตรวจความสอดคล้องของ `lm_merge` (เพิ่ม 19 พ.ย. 2026)

`lm_merge.mjs` (ผ่าน `lm_lib.validate()`) ตรวจ 10 ข้อหลังรวมบล็อก (ข้อ `src_ref` และ `open_model` เพิ่ม 22 พ.ย. 2026, R2-03 และ R2-05) รายงานเป็น WARN ค่าเริ่มต้น พร้อมตารางสรุปต่อ id และไฟล์:บรรทัดที่ต้องแก้; `--strict` นับ WARN และคำเตือนรูปแบบ leaf (ฟิลด์เกิน, est ไม่มี note, src ว่าง, v null, `_inherits` ไม่พบ) เป็น ERROR (exit 1; CI ของงานวิจัยใช้โหมดนี้); `--checks` พิมพ์ทุกข้อ; `--json-checks <file>` เขียนผลเป็น JSON รายละเอียดและผลรันล่าสุดอยู่ใน 01-methods §01.2.4

| ชื่อ | กฎ | ข้อตัดสิน |
|---|---|---|
| `scope` | scope ตามหมวดของข้อ 1 | D4 |
| `est` | `est: true` ต้องมี "ประมาณ" ใน note; `est: false` ห้ามมี "ค่าประมาณ" (ยกเว้นวลีปฏิเสธ) | กติกาของเจ้าของโครงการ (ค่าประมาณต้องติดป้าย), ข้อ 1 |
| `est_conf` | `est: true` ห้ามใช้ `conf: "สูง"` | ข้อ 1 |
| `training_mass` | รูปแบบ `{kg, empty_kg, crew_kg, fuel_kg}`; ผลรวมตรง ±2 kg; `empty_kg` = `BEW_typical` ±1 kg หรือ note อธิบาย | D3 |
| `speeds` | บัตรที่ resolve แล้วมี `speeds.VREF_kt` และ `speeds.VAPP_kt` (ข้ามเมื่อ `_na ["*"]`) | D1, D5 |
| `vapp_vref` | VAPP ≥ VREF ใน KCAS | D1 |
| `xfile_vapp` | 08 `ops.attitude_power.final.v.ias_kt` และ 09 `procedures.stabilised.v.Vapp` = `speeds.VAPP_kt` ±0.5 kt เว้นแต่ note บอก "แก้มวล"/"mass-corrected" (ลดเป็น info) | D1 |
| `detent` | ชื่อแฟลปใน 08/09 อยู่ใน `aero.flaps.detents[].name` | D6 |
| `src_ref` | ทุกรหัสใน `src` ของ leaf และในรายการ `src` ที่ซ้อนอยู่ใน `v` (เช่น `common_light.evaluator.rules`) มีบรรทัดในส่วนแหล่งอ้างอิงของไฟล์เจ้าของ หรือเป็นรหัสรอบที่ 1 ที่มีจริง (`R1:<X>n`, `R1:params-trainer.json[#path]`) ตามข้อ 1 | T-LM-23, R2-03 |
| `open_model` | leaf `speeds.*`/`performance.*` ที่ `src` เป็นแหล่งโมเดลเปิดทั้งหมด (รายการในส่วนแหล่งอ้างอิงของไฟล์หัวข้อที่ชื่อหรือประเภทระบุ JSBSim, FlightGear, YASim, Aeromatic, MSFS หรือ "โมเดลเปิด") = WARN, ปนกับแหล่งอื่น = info; VS1/VS0/VY/ROC/ร่อน/ระยะวิ่งขึ้นของบัตรเท่ากับผลวัดทศนิยมใน `validation.openModels` ทุกหลัก = WARN, เท่ากันเมื่อปัดหรือเป็นจำนวนเต็ม = info | 03 §03.5.2, R2-05 |
