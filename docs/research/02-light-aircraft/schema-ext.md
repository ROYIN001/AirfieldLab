# Schema ส่วนขยายของรอบที่ 2 (เครื่องบินเล็กและเครื่องฝึก)
← [กลับไปหน้ารวมรอบที่ 2](../02-light-aircraft.md)

ไฟล์นี้คือข้อตกลงร่วมของทุกหัวข้อย่อยในรอบที่ 2 ใช้คู่กับ
1. schema ของรอบที่ 1: [`../01-flight-physics/schema.md`](../01-flight-physics/schema.md) (หลัก) และรายการ leaf รายแบบ 384 ตัวใน `scripts/r1-pertype-leaves.txt` (และรายการ path ใน `scripts/r1-pertype-paths.json`)
2. schema ส่วนขยายของรอบที่ 3 (เครื่องบินโดยสาร): [`../03-airliners/schema-ext.md`](../03-airliners/schema-ext.md) (มีใน repo เมื่อ pull request ของรอบที่ 3 merge แล้ว)

รอบที่ 2 ใช้โครงเดียวกับรอบที่ 3 ทุกอย่าง (leaf, บล็อก JSON ที่มีคีย์บนสุดคีย์เดียว, หมวด `airframe`, `aero.derivatives`, `aero.flaps.detents`, `speeds`, `performance`, `propulsion`, `controls.*`, `ops`, `validation.*`) เพื่อให้ทั้งสองรอบป้อนรูปแบบ `data/aircraft/<id>.json` เดียวกันได้ ข้อ 1–4 ด้านล่างสรุปส่วนที่ใช้ร่วม ข้อ 5 เป็นส่วนที่รอบที่ 2 เพิ่ม ถ้าขัดกันให้ยึดไฟล์นี้แล้วบันทึกไว้ในหัวข้อ "ความขัดแย้ง"

## 1. leaf

ทุกพารามิเตอร์เป็น `{"v","u","scope","src","conf","est","note"}` ครบ 7 ฟิลด์ ไม่มีฟิลด์อื่น
- `v` ตัวเลข สตริง อาร์เรย์ อ็อบเจกต์ตาม config (เช่น `{"0":…, "10":…, "30":…}` ตามองศาแฟลป) หรือตาราง `{"axes":{…},"data":[…]}`
- `u` หน่วยเป็นสตริง (SI เป็นหลัก: `m`, `kg`, `N`, `W`, `s`, `rad`, `deg`, `1/rad`, `kg m2`; ค่าไร้หน่วย `-`) ความเร็วในหมวด `speeds` ใช้ `kt IAS` หรือ `kt CAS` (ต้องระบุว่าอันไหน) และหน่วยการบินอื่นใส่ใน `note`
- `scope` `aircraft` | `engine` | `propeller` | `gear` (ค่ารายแบบ) · `environment` | `sim` (ค่าร่วม)
- `src` อาร์เรย์รหัสแหล่งในไฟล์หัวข้อของตัวเอง เช่น `["LC7"]` อ้างข้ามหัวข้อได้ เช่น `["LM3"]` หรือรอบที่ 1 `["R1:A11"]` ห้ามว่าง (ยกเว้น `_na`, `_inherits`)
- `conf` `สูง` (อ่านตรงจากเอกสารปฐมภูมิหรือคำนวณจากนิยาม) · `กลาง` (แหล่งทุติยภูมิหรือต้องตีความ) · `ต่ำ` (ประมาณจากหลักการหรือยังไม่ยืนยัน)
- `est` `true` = **ค่าประมาณ** ต้องบอกวิธีได้มาใน `note` หรือเนื้อหา
- `note` หมายเหตุภาษาไทยสั้น ๆ (หน่วยการบิน, เงื่อนไข เช่น มวล CG แฟลป, เลขหน้าในเอกสาร)

## 2. บล็อก JSON ในไฟล์หัวข้อ

- บล็อก ```json ที่เป็นข้อมูลต้องมี **คีย์บนสุดคีย์เดียว** เป็นรหัสแบบเครื่องบิน (ข้อ 3) หรือ `common_light` บล็อกตัวอย่างที่ไม่ใช่ข้อมูลให้ใช้ ```js หรือมีคีย์บนสุดมากกว่าหนึ่งคีย์
- แบ่งเป็นหลายบล็อกได้ (เช่นบล็อกละหมวด) สคริปต์รวมจะ deep-merge ตามรหัสแบบ ถ้า path เดียวกันมาจากสองที่จะถูกแจ้งเป็นความขัดแย้ง จึงต้องเขียนเฉพาะ path ที่หัวข้อของตัวเองเป็นเจ้าของ (ข้อ 4)
- ตรวจด้วย `node docs/research/02-light-aircraft/scripts/lm_merge.mjs --type <id> --coverage --dry` (แจ้ง ERRORS, CONFLICTS และ path ของรอบที่ 1 ที่ยังไม่เติมและไม่อยู่ใน `_na`) ต้องไม่มี ERRORS/CONFLICTS ในบล็อกของตัวเองก่อนส่งงาน
- รุ่นย่อย: `"_inherits": {"v":"da40ng","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"…"}` แล้วใส่เฉพาะค่าที่ต่าง
- path ของรอบที่ 1 ที่ไม่ใช้กับแบบนั้น: leaf `_na` ระดับบนของแบบ `v` = อาร์เรย์ path (ใช้ `หมวด.*` ได้) และ `note` บอกเหตุผล เช่น `["turbofan.*", "turboprop.*", "gear.strut_main.*"]` สำหรับเครื่องลูกสูบที่ใช้ขาสปริง

## 3. รหัสแบบเครื่องบิน (type id)

| รหัส | แบบ | หมายเหตุ |
|---|---|---|
| `c172s` | Cessna 172S Skyhawk SP (Lycoming IO-360-L2A, ใบพัด fixed pitch) | |
| `da40ng` | Diamond DA40 NG (Austro AE300, ใบพัด MT constant speed) | แบบหลักของ DA40 |
| `da40_180` | DA40 / DA40 CS / DA40 XLS เครื่อง Lycoming IO-360-M1A | `_inherits: da40ng` ใส่เฉพาะที่ต่าง (ตั้งชื่อรหัสรุ่นย่อยอื่นตามรูปแบบนี้ถ้าจำเป็น) |
| `da42ng` | Diamond DA42 NG (2× AE300) | แบบหลักของ DA42 (เลือกรุ่นที่โรงเรียนไทยใช้จริงถ้าหัวข้อ 02 พบว่าต่าง) |
| `da42_vi`, `da42_tae125` | รุ่นย่อย DA42 | `_inherits: da42ng` ถ้าจำเป็น |
| `pc7mk2`, `pc9m`, `t6a`, `t6c` | เครื่องฝึกใบพัดเทอร์โบคลาสอ้างอิง | ค่าที่เปิดเผยสาธารณะเท่านั้น |
| `trainer_r2` | ข้อเสนอของรอบที่ 2 สำหรับเครื่องฝึกสมมติของ AirfieldLab | ใส่เฉพาะ leaf ที่เสนอให้เปลี่ยนจากรอบที่ 1 (บอก path และค่าเดิมใน `note`) |
| อื่น ๆ | แบบที่โรงเรียนการบินไทยใช้ เช่น `c152`, `p2008jc`, `p2006t`, `sr20`, `pa28_161`, `pa44_180` | ตั้งชื่อรูปแบบนี้ (ตัวเล็ก ตัวเลข `_`) |
| `common_light` | ค่าที่ใช้ร่วมกันทุกแบบในรอบนี้ (scope `environment`/`sim`) | |

## 4. เจ้าของ path (หัวข้อไหนเขียนอะไร)

| ไฟล์ (ใน `02-light-aircraft/`) | รหัส | เขียน JSON ใน path |
|---|---|---|
| `01-methods.md` | LM | `common_light.methods.*` (ค่าคงที่ของวิธีประมาณ เช่นตาราง radius of gyration) |
| `02-thai-schools.md` | LS | `common_light.thai_fleet.*` (โรงเรียน/ผู้ใช้ แบบ และจำนวนเครื่อง) |
| `03-open-models.md` | LB | `<id>.otherSims.*` และ `<id>.validation.openModels.*` ของทุกแบบที่มีโมเดลเปิด |
| `04-c172s.md` | LC | `c172s` ทุกหมวด ยกเว้น `ops`, `procedures`, `otherSims`, `validation.openModels` |
| `05-da40.md` | LD | `da40ng` และรุ่นย่อย DA40 (ข้อยกเว้นเดียวกัน) |
| `06-da42.md` | LT | `da42ng` และรุ่นย่อย DA42 (ข้อยกเว้นเดียวกัน) |
| `07-turboprop-trainers.md` | LP | `pc7mk2`, `pc9m`, `t6a`, `t6c`, `trainer_r2` (ข้อยกเว้นเดียวกัน) |
| `08-handling.md` | LH | `<id>.ops.*` ของทุกแบบ, `common_light.ops.*`, `common_light.evaluator.*` |
| `09-procedures.md` | LO | `<id>.procedures.*` ของทุกแบบ, `common_light.procedures.*` |
| `10-…md`, `11-…md`, `12-…md` | LE, LF, LG | บัตรข้อมูลแบบย่อของแบบที่โรงเรียนไทยใช้ (ข้อยกเว้นเดียวกับบัตรหลัก) |

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
- `aero.gear_drag.dCD0` (ล้อพับได้) ; `aero.legacy` — ค่าที่ทำให้แบบนี้บินได้กับโค้ดวันนี้ทันที: `{CL0, CLa, CLflap, CDflap, CDgear, Cm0, Cma, Cmflap, aStall, aStallFlap}` (นิยามตาม `AC`; `AC.flaps` 0–1 เป็นสัดส่วนของแฟลปสุด) — หัวข้อ 01 กำหนดวิธีแปลง

### `speeds` (บัตรรายแบบ; `u` = `kt IAS` หรือ `kt CAS`)
- `speeds.{VS0_kt, VS1_kt, VX_kt, VY_kt, VR_kt, VAPP_kt, VAPP_short_kt, VREF_kt, VG_kt, VA_kt, VNO_kt, VNE_kt, VLE_kt, VLO_kt}` (ใส่เท่าที่แบบนั้นมี; VA และ VG ที่ขึ้นกับมวลใช้ตาราง)
- `speeds.VFE` — `{"<detent>": kt}`
- เครื่องสองเครื่องยนต์: `speeds.{VMCA_kt, VYSE_kt, VXSE_kt, VSSE_kt}`
- `speeds.ias_cas` — ตาราง KIAS → KCAS ตามแฟลปจาก POH/AFM (ซิมต้องใช้ CAS ในฟิสิกส์ IAS ใช้แสดงผลและเทียบเกณฑ์)
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
  - `piston.altitude` — `{model: "gagg_ferrar"|"turbo_flat"|"table", coef…, critical_alt_m}` กำลังตามความหนาแน่น/ความสูง
  - `piston.power_map` — ตาราง P(rpm, MAP) หรือ P(load %) (FADEC) ; `piston.fuel` — `{fuel, bsfc_g_per_kWh, ff_table}`
  - `piston.dynamics.{tau_throttle_s, I_engine, friction_torque}` ; `piston.fadec` — การจับคู่คันเร่งเดียว → load % → รอบใบพัด (AE300)
- เทอร์โบพร็อป: path ของรอบที่ 1 หัวข้อ 4 (`turboprop.*`)
- **ใบพัด**: path ของรอบที่ 1 หัวข้อ 3 (`propeller.*`) และเพิ่ม
  - `propeller.identity.kind` — `"fixed"` | `"constant_speed"` | `"constant_speed_feathering"`; `propeller.identity.model`
  - `propeller.fixed.{pitch_in, beta75_deg, static_rpm_range}` สำหรับใบพัด fixed pitch; `propeller.tables.CT/CP` ของ fixed pitch มีแกน J อย่างเดียว

### `controls` (บัตรรายแบบ)
- `controls.architecture` — `{"pitch":"reversible", "roll":…, "yaw":…, "trim":"tab"|"ths"|"spring"}` ตามรอบที่ 3
- `controls.surfaces.<elevator|aileron|rudder|flap|trim_tab>` — `{travel_deg:{up,down} หรือ {left,right}, rate_dps, actuator_tau_s}` (ระยะเคลื่อนจาก TCDS/AMM เป็นหลัก)
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
- `validation.openModels.<model>` — ผลวัดจากการรันโมเดลเปิด (หัวข้อ 03 เจ้าของ)
- path ของรอบที่ 1 `validation.*` ที่เป็น per-type (เช่น `hqClassCategory`) — บัตรรายแบบ

### อื่น ๆ
- `interference.*`, `wind.*` (per-type), `input.*` (per-type) — path ของรอบที่ 1
- `otherSims.*` — หัวข้อ 03 เจ้าของ
- `_na`, `_inherits` — ข้อ 2
