# 01. วิธีประมาณค่า เครื่องมือตรวจบัตรข้อมูล และส่วนขยาย schema
← [กลับไปหน้ารวมรอบที่ 2](../02-light-aircraft.md) · [วิธีประมาณค่าและ schema](01-methods.md)
> ความเชื่อมั่นโดยรวม: กลาง (เครื่องมือและสูตรแปลงตรวจซ้ำได้ ความเชื่อมั่นสูง; ค่าคงที่ของวิธีประมาณ กลางถึงต่ำ) · แหล่งหลัก: NASA TM-80163 และ TN D-6643 / FAA-RD-71-6 (derivative จากการบิน), FAA AC 23-8C และ 14 CFR 25.103 (นิยาม stall), EASA TCDS IM.A.051 / IM.E.032, NACA R-190, JSBSim 1.3.3 และซิม AirfieldLab commit cabf0f0

## 01.0 สรุปสั้น

- **บัตรข้อมูล → ซิม**: `lm_card.buildAC` แปลงบัตรตาม schema-ext-r2 เป็น `AC` ครบ 51 ฟิลด์ แล้ววัด stall, trim, glide, climb, โหมดเชิงเส้น, วิ่งขึ้นและลงจอดด้วยซิมปัจจุบัน กับ fixture เครื่องฝึกรอบที่ 1 ได้ตัวเลขตรงที่รอบที่ 1 เผยแพร่ทุกค่า (V_SR 71.86 / 79.59 KEAS, Vy 128 kt ROC 3,225 fpm, L/D 16.46 / 21.73, short period 2.221 rad/s ζ 0.578, Dutch roll 1.611 rad/s ζ 0.139, ถึง 50 ft 590 m, ลงจอด 714 m) ชุดทดสอบ `lm_selftest.mjs` ผ่าน **49/49** ในราว 2 s
- **ตัวตรวจ JSON**: `lm_merge.mjs` (แกนกลาง `mergeDir` ใน `lm_lib.mjs`) ตรวจรูปแบบ leaf, ความขัดแย้งข้ามไฟล์ และ coverage; บล็อก `common_light` ของรอบนี้ 27 leaf (ของหัวข้อนี้ 13) ไม่มี ERROR และ CONFLICT
- **polar รูปแบบซิม**: ซิมใช้ $C_D = C_{D0} + K(C_L-0.15)^2$ จึงต้องแปลง polar จริงด้วย $K_s = 1/(2E(C_L^*-0.15))$, $C_{D0,s} = K_s(C_L^{*2}-0.0225)$ ซึ่งคง (L/D)max และ $C_L$ ที่ best glide (ตรวจ: เป้า 12.91 ได้ 12.91) และห้าม fit จุด glide กับจุด cruise รวมกันเพราะต่างกันราว 13 %
- **CLmax จาก POH**: ความเร็ว stall ใน POH เป็นความเร็วต่ำสุด ใช้ $n_z$ ที่ $V_{min}$ = 0.95 (ค่าประมาณ ช่วง 0.90–1.00) ตามนิยาม 14 CFR 25.103 แล้วแก้ KIAS → KCAS, น้ำหนัก และ CG; CLmax ไม่แน่นอนราว ±5 % จาก $n_z$ และอีก ±6 % จากการปัดความเร็ว
- **derivative จากรูปทรง** (`lm_derivs`, DATCOM + Roskam + Raymer + tail volume และตัวแก้ lifting line ของการม้วน $K_{LL}$ ≈ 0.54): เทียบข้อมูลการบินของเครื่องคลาส C172 (NASA TM-80163) และ Navion (TN D-6643) ค่ามัธยฐานของความผิดพลาด 14.5 % (ชุดบินจริง 29 ค่า) เครื่องหมายถูกทั้ง 46 ค่า ตามยาวผิด 0–24 % (ความเชื่อมั่นกลาง) แต่ Cnβ, Cnr, Clδa, Cnδa ผิด 14–160 % (ต่ำ)
- **inertia**: รัศมีไจเรชันไร้มิติแบบ Roskam ที่หาย้อนจาก 7 ลำ: single_prop Rx 0.257, Ry 0.357, Rz 0.404 (leave-one-out ผิดถึง 42 %), เครื่องฝึก turboprop 0.261 / 0.338 / 0.400 กลุ่ม twin มีแค่ C310 ไม่ควรใช้กับ DA42 (ค่าประมาณ ความเชื่อมั่นต่ำ)
- **เครื่องยนต์ลูกสูบ/ดีเซล**: ที่ 8,000 ft ISA สูตร Gagg–Farrar ให้ 0.758 และสูตร indicated-friction (NACA R-190, f 0.10) ให้ 0.741 แต่วันร้อน VTBD 35 °C ได้ 0.926 กับ 0.963 จึงแนะนำ indicated-friction เมื่อมี ISA deviation; C172S ใช้ IO-360-L2A 180 hp ที่ 2,700 rpm (TCDS IM.A.051); AE300 123.5 kW ที่รอบใบพัด 2,300 rpm, BSFC 227 g/kWh ที่ 100 % และ 205 g/kWh ที่ 60 % (คำนวณจาก factsheet)
- **ใบพัด** (`lm_prop`, BEM + Prandtl tip loss): ใบ fixed pitch 76×60 ปรับคอร์ดให้รอบสถิต 2,350 rpm ตาม TCDS (2,300–2,400) ได้แรงขับสถิต 3,538 N (795 lbf), FM 0.66, η สูงสุด 0.85 ส่วนตาราง JSBSim `prop_75in2f` ให้ 2,245 rpm ต่ำกว่า TCDS; ใบ constant speed 3 ใบ 1.90 m ที่ 123.5 kW ได้ 3,450 N และ η cruise 0.87
- **legacy fit**: ปรับ polar, aStall และแรงขับให้ซิมวันนี้บินตาม POH ได้ (V_SR ผิดไม่เกิน 1 kt, ROC ผิด 15 fpm, L/D ร่อนตรง) แต่ Vy ของซิมต่ำกว่า POH ราว 8 kt เพราะซิมมี polar เดียวทุกสภาวะแรงขับ ต้องแก้ฟิสิกส์ (P2) จึงจะหายขาด
- **ข้อจำกัดหลักของซิมวันนี้**: แรงขับไม่มีเทอมความหนาแน่น (ROC เท่ากันทุกความสูง), แฟลปเป็นตัวแปรเดียว f, "ias" ของซิมคือ EAS ทุกข้อมีงานแก้ใน §01.13

## 01.1 ทำไมต้องขยาย schema และตารางการแปลง schema → AC

รอบที่ 1 วางโครงพารามิเตอร์ไว้สำหรับโมเดลรุ่นถัดไป (ใบพัด BEM, เครื่องยนต์มีพลวัต, ฐานล้อแบบ oleo ฯลฯ) แต่ซิมวันนี้ยังอ่านได้แค่อ็อบเจกต์ `AC` ชุดเดียวใน `src/20-flight.js:100–118` ซึ่งมี 51 ฟิลด์ รอบที่ 2 ต้องทำบัตรข้อมูลของเครื่องบินจริงหลายแบบ จึงต้องมีสองอย่างที่รอบที่ 1 ไม่มี

1. **leaf ที่บอกค่าตามสภาพของเครื่องบินจริง** เช่น แฟลปเป็นขั้น (C172S 0/10/20/30°, DA40 UP/T/O/LDG) ความเร็วเป็น KIAS ที่ต้องแปลงเป็น KCAS เครื่องยนต์ลูกสูบที่กำลังลดตามความสูง และใบพัด fixed pitch ส่วนนี้ schema-ext-r2 §5 กำหนดไว้แล้ว (`aero.flaps.detents`, `speeds.ias_cas`, `piston.*`, `propeller.fixed.*`)
2. **กฎแปลงที่ทำซ้ำได้** จากบัตรข้อมูลไปเป็น `AC` เพื่อให้บินแบบนั้นในซิมวันนี้ได้ทันทีและวัดผลเทียบ POH ได้ กฎนี้อยู่ใน `scripts/lm_card.mjs` (`buildAC`) ทุกฟิลด์มีบันทึกที่มา (`--trace`) และติดธงเมื่อใช้ค่าเริ่มต้น (`default`), ค่าที่แก้สมการหา (`solved`), ค่าที่แปลงรูป (`converted`), ค่าประมาณ (`est`) หรือค่าของเครื่องฝึกรอบที่ 1 (`R1`, ต้องไม่เหลือในบัตรที่เสร็จแล้ว)

### 01.1.1 ตารางการแปลง (ลำดับคือลำดับที่ `buildAC` ลอง ค่าแรกที่มีถูกใช้)

| ฟิลด์ AC | แหล่งในบัตร (ตามลำดับ) | กฎ | ค่าเริ่มต้นเมื่อไม่มีข้อมูล |
|---|---|---|---|
| `m` | `--mass` → `airframe.weights.training_mass` (ตัวเลขหรือ `{kg}`) → `MTOW` | ตรง | 2250 kg (R1) |
| `Ixx, Iyy, Izz, Ixz` | `airframe.inertia.*` | คูณ `m / ref_mass` (รัศมีไจเรชันคงที่เมื่อมวลเปลี่ยน) | ถ้าไม่มี inertia: Roskam radii (`airframe.inertia.radii` หรือ `common_light.methods.radii.<class>` §01.4) กับ `airframe.wing.b` และ `airframe.geometry.length`; `Ixz` = 0 |
| `S, b, c` | `aero.ref.*` → `airframe.wing.{S, b, MAC}` | ตรง | R1 |
| `CL0, CLa, Cm0, Cma` | `aero.legacy.*` → `aero.static_long.{CL0, CLalpha, Cm0, Cmalpha}` ค่า clean | ตรง | R1 |
| `CLflap, Cmflap` | `aero.legacy.*` → `static_long.CL0[full] − CL0[clean]` (และ Cm0) → `aero.flaps.detents[full].dCL0 / dCm0` | ΔCL0, ΔCm0 ที่แฟลปสุด (`f = 1`) | R1 |
| `CDflap` | `aero.legacy.CDflap` → `detents[full].dCD0` | ซิมใช้ `CDflap·f^1.5` | R1 |
| `CDgear` | `aero.legacy.CDgear` → `aero.gear_drag.dCD0` (ล้อพับได้) | ล้อตายตัว: 0 เพราะแรงต้านล้อรวมอยู่ใน `CD0` แล้ว | 0 |
| `CD0, K` | `aero.legacy.{CD0, K}` (รูปแบบของซิม) → `aero.derivatives.{CD0, K}` (polar แบบพาราโบลารอบ CL = 0) | แปลงด้วย `toSimPolar` ให้ (L/D)max และ CL ที่ (L/D)max เท่าเดิม (สมการ 01.1-1) | R1 |
| `CLq … Cndr` (19 ตัว) | `aero.derivatives.<ชื่อ>` | ถ้า `v` เป็นอ็อบเจกต์ตาม config เลือกตามลำดับ `--config`, `approach`, `landing`, `cruise`, `clean` แล้วตัวแรกที่มี | ค่าประมาณจาก `lm_derivs` (§01.3) ถ้าส่งเข้ามา มิฉะนั้น R1 |
| `aStall, aStallFlap` | `aero.legacy.*` → แก้หา | หา a0 (จุดกลางการผสม Beard–McLain) ที่ทำให้ CLmax 1 g แบบ trim ของซิมเท่ากับเป้า เป้ามาจาก `static_long.CLmax_target` → `detents.CLmax` → `VS1/VS0` ผ่าน `lm_polar.clmaxFromStall` (MTOW, KCAS, ความเร็วต่ำสุด nz 0.95) | R1 |
| `deUp, deDn` | `controls.surfaces.elevator.travel_deg.{up, down}` | deg → rad (`de` ลบ = ขอบท้ายขึ้น) | R1 |
| `daMax` | `controls.surfaces.aileron.travel_deg` | ½(up + down) เพราะ `Clda` นิยามต่อ rad ของมุมเฉลี่ยสองข้าง | R1 |
| `drMax` | `controls.surfaces.rudder.travel_deg` | min(left, right) เพราะซิมจำกัดแบบสมมาตร | R1 |
| `P` | `propulsion.legacy.P` → `piston.ratings.P_rated × จำนวนเครื่อง` | W | R1 |
| `eta` | `propulsion.legacy.eta` | – | 0.80 (ค่าประมาณ) |
| `T0` | `propulsion.legacy.T0` → ทฤษฎีโมเมนตัมจาก `propeller.identity.diameter` | $T_0 = (FM\,P\,f_{rpm}\sqrt{2\rho_0 A})^{2/3}$, FM 0.55, $f_{rpm}$ = รอบสถิต/รอบพิกัด | R1 × P/700 kW |
| `idle` | `propulsion.legacy.idle` | – | 0.02 (ค่าประมาณ) |
| `gear` | `gear.legacy` (override) → `gear.geometry.{nose,main}_contact_body_extended` + `gear.strut_*.spring` → `airframe.geometry.{wheelbase, main_track}` | โหลดล้อหน้า $N_n = W(-x_m)/(x_n - x_m)$; $k$ = `k_vertical` หรือ $N/\delta_{static}$ หรือ $N/(0.3\,stroke)$; $c = 2\zeta\sqrt{kN/g}$, ζ = `damping_ratio` หรือ 0.6 | R1 |
| `Vs0, Vref, Vapp` | `speeds.{VS0_kt, VREF_kt, VAPP_kt}` | KIAS → KCAS ด้วย `speeds.ias_cas` ที่แฟลปสุด แล้วปัด | `Vref` = 1.3 Vs0 [LM25], `Vapp` = Vref + 5 (ค่าประมาณ) |

สมการ 01.1-1 (polar): ซิมคิดแรงต้านเป็น $C_D = C_{D0,s} + K_s (C_L - 0.15)^2$ (`src/20-flight.js:185`) ส่วนเอกสารให้ $C_D = C_{D0} + K C_L^2$ ให้ $C_L^* = \sqrt{C_{D0}/K}$ และ $E = 1/(2\sqrt{C_{D0}K})$ แล้ว
$$K_s = \frac{1}{2E\,(C_L^* - 0.15)},\qquad C_{D0,s} = K_s\,(C_L^{*2} - 0.15^2)$$
ซึ่งทำให้ (L/D)max และความเร็ว best glide ของซิมตรงกับบัตร (ตรวจด้วย T-LM-09) ตัวอย่างเครื่องฝึกรอบที่ 1: $C_{D0,s}$ 0.024, $K_s$ 0.062 ให้ $C_L^*$ 0.640 และ E 16.46 ตรงกับที่ซิมวัดได้ 16.46

### 01.1.2 ตำแหน่งแฟลปจริง → `AC.flaps` 0..1

ซิมมีแฟลปตัวเดียวแบบต่อเนื่อง: $C_L \mathrel{+}= C_{L,flap} f$, $C_D \mathrel{+}= C_{D,flap} f^{1.5}$, $C_m \mathrel{+}= C_{m,flap} f$ และมุม stall เลื่อน $a_{Stall,Flap} f$ ส่วนเครื่องบินจริงมีหลายขั้น `flapMap` จึงให้สองวิธี
- **`lift` (ค่าเริ่มต้น):** $f_i = \Delta C_{L0,i} / \Delta C_{L0,full}$ ทำให้แรงยกของทุกขั้นตรงทุกตัว เพราะ CL ในซิมเป็นเชิงเส้นใน f ใช้ได้เมื่อบัตรให้ `dCL0` ทุกขั้น
- **`deflection`:** $f_i = \delta_i/\delta_{full}$ ใช้เมื่อไม่มี `dCL0` (ค่าประมาณ) แฟลป slotted/Fowler ให้แรงยกต่อองศาลดลงที่มุมมาก วิธีนี้จึงให้แรงยกขั้นกลางต่ำกว่าจริง

ข้อจำกัด: เมื่อเลือกตามแรงยก แรงต้านและ Cm ที่ขั้นกลางจะตามรูป $f^{1.5}$ และ $f$ ของซิม ไม่ตรงกับ `dCD0`/`dCm0` ของขั้นนั้นทุกตัว ตัวอย่าง C172S ถ้า ΔCL0 ของ 10°/20°/30° เป็น 0.30/0.55/0.70 (ตัวเลขสมมติเพื่ออธิบาย) จะได้ f = 0.43/0.79/1 การทำให้ตรงทุกขั้นต้องเปลี่ยนโค้ดเป็นตารางตาม detent (งานที่แนะนำ P2) `lm_card` รายงาน V_SR ของทุกขั้นพร้อม f ที่ใช้ เพื่อให้เห็นความคลาดเคลื่อนตรง ๆ

### 01.1.3 หน่วยและเครื่องหมาย

- ความเร็วในซิม: `air.ias` คือ EAS ($V\sqrt{\rho/\rho_0}$) ซึ่งต่ำกว่า CAS ด้วยผลการอัดตัวของอากาศ: ที่ 100 kt ต่างไม่เกิน 0.13 kt ถึง 10,000 ft แต่ที่ 200 kt ต่าง 0.26 kt ที่ 3,000 ft และ 1.0 kt ที่ 10,000 ft (คำนวณจากสูตร pitot แบบ isentropic กับ ISA ในการตรวจทาน) ช่วงความเร็วของเครื่องเล็ก (stall ถึง approach ต่ำกว่า 100 kt) จึงป้อน KCAS เข้า `Vs0/Vref/Vapp` ได้ตรง และรายงาน KIAS ผ่านตาราง `speeds.ias_cas` ย้อนกลับ
- เครื่องหมาย derivative ตาม schema-ext-r2 §5 (`de` บวก = ขอบท้ายลง ⇒ `Cmde < 0`; `da` บวก = สั่งม้วนขวา ⇒ `Clda > 0`, adverse yaw `Cnda < 0`; `dr` บวก = ขอบท้ายไปซ้าย ⇒ `CYdr > 0`, `Cndr < 0`, `Cldr > 0`; `Cnb > 0`, `Clb < 0`) เอกสารของ NASA หลายฉบับนิยาม δa = มุมซ้าย − มุมขวา (เท่ากับสองเท่าของมุมเฉลี่ย) หรือให้ Clδa เป็นลบ ต้องกลับเครื่องหมายเมื่อ Clδa ของเอกสารเป็นลบ (กลับ Cnδa ไปพร้อมกัน) และ**คูณ** Clδa, Cnδa ด้วย 2 เมื่อ δa ของเอกสารเป็นผลต่างสองข้าง (ตาราง 01.3-3, §01.11.1)
- ค่าเริ่มต้นทั้งหมดอยู่ในตัวแปร `DEFAULTS` ของ `lm_card.mjs`: `eta` 0.80, `idle` 0.02, `figureOfMerit` 0.55, `gearStaticFrac` 0.30, `gearZeta` 0.60, `noseLoadFrac` 0.15, `strokeNose/Main` 0.20 m, `VrefOverVs0` 1.3, `VappMinusVref` 5 kt ทุกตัวเป็น**ค่าประมาณ**และถูกติดธงใน trace

### 01.1.4 path ที่หัวข้อนี้เสนอเพิ่ม (ไม่บังคับ)

| path | ความหมาย | เหตุผล |
|---|---|---|
| `aero.legacy.CD0`, `aero.legacy.K` | polar ในรูปแบบของซิม (รอบ CL 0.15) | ให้ fixture และค่าที่ fit แล้ว (§01.8) ส่งเข้าซิมตรง ๆ โดยไม่ผ่านการแปลง |
| `gear.legacy` | อาร์เรย์ 3 ล้อตามรูปแบบ `AC.gear` | ใช้เมื่อหัวข้อบัตร fit ล้อเองแล้ว หรือเพื่อทดสอบ |
| `validation.trim_targets.{cruise, approach}.v` = `{ias_kt, h_ft หรือ h_m, gamma_deg}` | สภาพที่ใช้ trim และ linearise | ให้ทุกแบบวัดที่สภาพของตัวเอง |
| `validation.takeoff_test` = `{flap, VR_kt, theta_deg}` ; `validation.stall_test` = `{<detent>: ias0_kt}` | สภาพการทดสอบวิ่งขึ้นและ stall | ให้ตรงกับขั้นตอนใน POH |


## 01.2 เครื่องมือ (lm_merge, lm_lib, lm_card) วิธีใช้

ทุกสคริปต์อยู่ใน `scripts/` ของโฟลเดอร์นี้ ใช้ Node ≥ 18 ไม่มี dependency หาไฟล์ข้อมูลจากตำแหน่งของตัวเอง และหา repo จาก `AIRFIELDLAB_ROOT` (ค่าเริ่มต้นคือ root ของ repo ซึ่งอยู่สี่ชั้นเหนือ `scripts/`) จึงย้ายไป `docs/research/02-light-aircraft/scripts/` ได้ทันที รันจาก root ของ repo

| สคริปต์ | หน้าที่ | คำสั่ง |
|---|---|---|
| `lm_lib.mjs` | แกนกลาง: `mergeDir(dir, {only, r1})` → `{merged, errors, warnings, conflicts, coverage, stats, …}`; `extractBlocks`, `resolveType` (ตาม `_inherits`), `val/leaf(card, 'a.b.c')`, `loadType(id)` (โฟลเดอร์ก่อน แล้ว `lm_fixture_*.json`), `isMainModule` | `import { mergeDir } from './lm_lib.mjs'` |
| `lm_merge.mjs` | CLI เดิม พฤติกรรมและตัวเลือกเหมือนเดิมทุกตัว (`--dir --out --type --coverage --schema --quiet --dry --r1`) ตอนนี้เรียก `mergeDir` | `node scripts/lm_merge.mjs --type c172s --coverage --dry` |
| `lm_card.mjs` | `buildAC`, `applyAC`, `cardInfo`, `runCard` และตัวทดสอบเชิงตัวเลข (`trim`, `trimThr`, `linearise`, `modes`, `stallTest`, `climbSweep`, `glideSweep`, `takeoffTest`, `landingTest`) เขียนใหม่จาก `v10_perf.mjs` / `v10_modes.mjs` / `v10_timeresp.mjs` ของรอบที่ 1 ด้วยกฎควบคุมและขั้นเวลาเดิม | `node scripts/lm_card.mjs <typeId> [--mass kg] [--config approach] [--flapmap lift\|deflection] [--json] [--quick] [--no-ground] [--trace]` |
| `lm_fixture_trainer_r1.mjs` → `lm_fixture_trainer_r1.json` | เครื่องฝึกรอบที่ 1 ในรูปบัตรข้อมูล (fixture สำหรับทดสอบ ไม่อยู่ในบล็อก JSON ของรายงาน) | `node scripts/lm_fixture_trainer_r1.mjs` |
| `lm_selftest.mjs` | ตรวจ T-LM อัตโนมัติ (exit 1 ถ้าไม่ผ่าน) | `node scripts/lm_selftest.mjs` |
| `lm_derivs.mjs`, `lm_inertia.mjs`, `lm_polar.mjs`, `lm_engine.mjs`, `lm_prop.mjs`, `lm_legacy_fit.mjs` | วิธีประมาณค่าใน §01.3–01.8 | ดูแต่ละหัวข้อ |

### 01.2.1 สิ่งที่ `lm_card` วัด (ซิมปัจจุบัน ISA ลมสงบ)

1. **stall 1 g** ทุกขั้นแฟลป: เริ่มที่ trim ระดับ 3,000 ft (ค่าเริ่ม `validation.stall_test` หรือ 1.35 Vs ของซิม) ดึงคันเร่งเป็น idle ลดความเร็ว 1 kt/s ด้วยวง PI ของมุมก้มเงย หยุดเมื่อ elevator ชนสต็อปเกิน 1 s แล้วหัวทิ่ม หรือ α > 25° รายงาน $V_{SR} = V_{C_{L\max}}/\sqrt{n_z}$ เป็น KEAS, KCAS และ KIAS (ผ่าน `speeds.ias_cas` ถ้ามี), $V_{min}$, $C_{L\max}$, α และอัตราลดจริง (นิยามตาม 14 CFR 25.103 และ AC 23-8C [LM1][LM2])
2. **trim** ที่ Vy (เต็มกำลัง clean), cruise (`validation.trim_targets.cruise` หรือ 0.85 VNO ที่ 3,000 ft) และ approach (แฟลปสุด ล้อลง γ −3°): α, θ, δe, คันเร่ง
3. **glide** แรงขับศูนย์และ idle (3,000 ft clean): ความเร็ว best glide และ L/D จากจุดยอดพาราโบลาของการกวาด trim ทีละ 1 kt
4. **climb** ระดับ 30 m เต็มกำลัง clean: Vy, ROC สูงสุด, Vx และ γ สูงสุด (กวาดทีละ 2 kt)
5. **โหมดเชิงเส้น** ที่ approach และ cruise: linearise ด้วย central difference 9 สถานะ ทำ α̇ แบบ quasi-steady แล้วหาค่าลักษณะเฉพาะ (Faddeev–LeVerrier + Durand–Kerner) ได้ short period, phugoid, Dutch roll, roll mode, spiral, $n/\alpha$ และ CAP
6. **วิ่งขึ้น**: จอด settle 5 s เต็มกำลังพร้อมเบรก 3 s ปล่อย หมุนที่ VR ด้วย 3°/s ถึง θ (ค่าเริ่ม 10°) วัดระยะ ground roll และระยะถึงล้อสูง 50 ft
7. **ลงจอด**: autoland ของซิมจากสภาพ approach มาตรฐาน วัดระยะจากล้อสูง 50 ft ถึงหยุด ทั้งเบรกตามซิมและเบรกเต็มหลังล้อหน้าแตะ

### 01.2.2 ผลตรวจตัวเอง (fixture `trainer_r1` = AC ปัจจุบัน, commit cabf0f0)

| ปริมาณ | รอบที่ 1 เผยแพร่ [R1:V19] | `lm_card` วันนี้ |
|---|---|---|
| V_SR แฟลปลง ล้อลง / clean | 71.9 / 79.6 kt | 71.86 / 79.59 kt |
| Vy, ROC สูงสุด (SL) | 128 kt, 3,225 fpm | 128 kt (กริด; จุดยอดพาราโบลา 128.8), 3,225 fpm |
| L/D แรงขับศูนย์ / idle | 16.5 / 21.7 | 16.46 / 21.73 |
| approach: short period ωn, ζ | 2.22 rad/s, 0.58 | 2.221, 0.578 |
| approach: Dutch roll ωn, ζ; τR; spiral t½ | 1.61, 0.139; 0.218 s; 36.2 s | 1.611, 0.139; 0.218 s; 36.2 s |
| cruise 155 kt: SP, DR | 3.593/0.560, 2.525/0.145 | 3.593/0.560, 2.525/0.145 |
| วิ่งขึ้น flaps 0 VR 82: ground roll, 50 ft, V50 | 358 m, 590 m, 113.8 kt | 358 m, 590 m, 113.8 kt |
| ลงจอดจาก 50 ft เบรกเต็ม | 714 m | 714 m |

ผลเต็มอยู่ใน `scripts/out/lm_card_trainer_r1.json` เวลารันทั้งชุดประมาณ 1 s ข้อสังเกต: ROC ของซิมไม่ขึ้นกับความหนาแน่นอากาศ (`thrustAvail` ไม่มี ρ) ดังนั้น `lm_card` วัด climb ที่ระดับน้ำทะเลเท่านั้น ตามข้อจำกัดที่รอบที่ 1 บันทึกไว้


## 01.3 การประมาณ derivative จากรูปทรง (lm_derivs)

ใช้เมื่อบัตรข้อมูลไม่มีค่าจากการบินทดสอบหรืออุโมงค์ลม (เช่น DA40, DA42, เครื่องฝึกที่โรงเรียนไทยใช้) ทุกค่าที่ได้เป็น**ค่าประมาณ** (`est: true`, `conf: "ต่ำ"` ถึง `"กลาง"` ตามตาราง 01.3-2) วิธีเป็นสูตรกึ่งเอมพิริคัลมาตรฐานจาก USAF DATCOM [LM10], Roskam Part VI [LM11], Raymer [LM12], Nelson [LM13] และ Etkin & Reid [LM14] บวกการแก้ด้วยทฤษฎี lifting line สำหรับโหลดแบบม้วน (สมการ 01.3-9) ที่หัวข้อนี้หาเองและตรวจกับข้อมูลบินจริง

คำสั่ง: `node scripts/lm_derivs.mjs <typeId> [--json] [--V kt]` อ่าน `airframe.wing.*`, `airframe.tail.*`, `airframe.surfaces.*`, `airframe.geometry.*`, `airframe.cg.ref` และมวลจากบัตร แล้วพิมพ์ derivative ทั้ง 19 ตัวของ `AC` (แกนลำตัว) ที่ cruise และ approach พร้อม CLα, Cmα, จุด neutral point $h_n$, static margin และ dε/dα; `--validate` พิมพ์ตาราง 01.3-3 ค่าที่บัตรไม่มีจะถูกแทนด้วยค่าเริ่มต้นและพิมพ์บอกทุกตัว ผลส่งเข้า `buildAC(card, {derivEstimates})` ได้ตรง

### 01.3.1 สมการ (หน่วยต่อ rad; ตำแหน่งตามแกน x เป็นสัดส่วนของ MAC จากขอบหน้า MAC บวกไปทางท้าย)

| # | ปริมาณ | สมการ | แหล่ง |
|---|---|---|---|
| 1 | ความชันแรงยก 3 มิติ | $C_{L\alpha}(A) = \dfrac{2\pi A}{2 + \sqrt{\frac{A^2\beta^2}{\kappa^2}\left(1 + \frac{\tan^2\Lambda_{c/2}}{\beta^2}\right) + 4}}$, $\kappa = c_{l\alpha}/2\pi$ (ค่าเริ่มต้น 0.95), $\beta = \sqrt{1-M^2}$ | DATCOM 4.1.3.2 [LM10]; Raymer eq. 12.6 [LM12] |
| 2 | ผลลำตัวต่อปีก | $K_{WF} = 1 + 0.025\,(d_f/b) - 0.25\,(d_f/b)^2$, $d_f = \sqrt{W_f H_f}$ | DATCOM/Roskam VI [LM10, LM11] |
| 3 | downwash | $\dfrac{d\varepsilon}{d\alpha} = 4.44\left[K_A K_\lambda K_H \sqrt{\cos\Lambda_{c/4}}\right]^{1.19}$; $K_A = \frac1A - \frac1{1+A^{1.7}}$, $K_\lambda = \frac{10-3\lambda}{7}$, $K_H = \frac{1-|h_H/b|}{\sqrt[3]{2 l_H/b}}$ | DATCOM 4.4.1 [LM10] |
| 4 | CLα ทั้งลำ | $C_{L\alpha} = K_{WF} C_{L\alpha,W} + \eta_h C_{L\alpha,h}\frac{S_h}{S}\left(1 - \frac{d\varepsilon}{d\alpha}\right)$, $\eta_h$ 0.90 | Nelson §2 [LM13] |
| 5 | neutral point และ Cmα | $h_n = \dfrac{K_{WF}C_{L\alpha,W}\cdot 0.25 + \eta_h C_{L\alpha,h}\frac{S_h}{S}(1-\frac{d\varepsilon}{d\alpha})\,\bar x_{ac,h} - \Delta C_{m\alpha,f}}{C_{L\alpha}}$, $\bar x_{ac,h} = 0.25 + l_h/\bar c$; $C_{m\alpha} = C_{L\alpha}(h_{cg} - h_n)$; ลำตัว $\Delta C_{m\alpha,f} = K_f W_f^2 L_f/(\bar c S)$ (ต่อองศา แปลงเป็นต่อ rad), $K_f$ จากตารางตามตำแหน่ง c/4 ของโคนปีก | Raymer eq. 16.25, Fig. 16.14 (จาก NACA TR 711) [LM12] |
| 6 | pitch damping | $C_{L_q} = 2\eta_h \frac{S_h}{S}\bar\ell C_{L\alpha,h} + (0.5 + 2(0.25 - h_{cg}))C_{L\alpha,W}$; $C_{m_q} = -1.1\cdot 2\eta_h\frac{S_h}{S}\bar\ell^{\,2} C_{L\alpha,h}$; $\bar\ell = \bar x_{ac,h} - h_{cg}$ | Nelson บทที่ 3 (ตัวคูณ 1.1 แทนปีกและลำตัว), DATCOM 7.1.1 [LM10, LM13] |
| 7 | α̇ | $C_{L_{\dot\alpha}} = 2\eta_h\frac{S_h}{S}\bar\ell C_{L\alpha,h}\frac{d\varepsilon}{d\alpha}$; $C_{m_{\dot\alpha}} = -2\eta_h\frac{S_h}{S}\bar\ell^{\,2}C_{L\alpha,h}\frac{d\varepsilon}{d\alpha}$ | Nelson, Etkin [LM13, LM14] |
| 8 | elevator | $\tau = 0.85\left[1 - \frac{\theta_f - \sin\theta_f}{\pi}\right]$, $\cos\theta_f = 2c_f/c - 1$ (thin airfoil × ตัวคูณความหนืด 0.85); $C_{L_{\delta e}} = \eta_h\frac{S_h}{S}C_{L\alpha,h}\tau_e$; $C_{m_{\delta e}} = -C_{L_{\delta e}}\bar\ell$ | thin-airfoil theory; แนวโน้ม DATCOM 6.1.1.1 [LM10] |
| 9 | ตัวแก้ lifting line ของโหลดแบบม้วน | สมการ monoplane ของ Prandtl สำหรับปีกวงรีที่มุมบิด $py/V$ (เหลือพจน์ n = 2): $C_{l_p} = -\dfrac{c_{l\alpha}A}{8\,(A + 2c_{l\alpha}/\pi)}$; อัตราส่วนต่อ strip theory $K_{LL} = \dfrac{1.5A(1+\lambda)}{(A + 2c_{l\alpha}/\pi)(1+3\lambda)}$ (0.50–0.60 ที่ A 6–7.5, λ 0.5–1; 0.546 ที่ A 7.5, λ 0.7) | หาเองในหัวข้อนี้จาก lifting-line theory [LM14] ตรวจในตาราง 01.3-3 |
| 10 | roll damping | $C_{l_p} = $ (9) $+ C_{l_p,h} + 2C_{Y\beta,v}(z_v/b)^2$ | (9) + Nelson [LM13] |
| 11 | aileron | $C_{l_{\delta a}} = K_{LL}\dfrac{2c_{l\alpha}\tau_a}{Sb}\int_{y_i}^{y_o}c(y)\,y\,dy$ ต่อ rad ของมุมเฉลี่ยสองข้าง | strip theory (Nelson บทที่ 5) × (9) |
| 12 | adverse yaw | $C_{n_{\delta a}} = K_n C_L C_{l_{\delta a}}$, $K_n = -0.20$ (aileron แบบ Frise ทำให้น้อยกว่านี้) | แนวโน้ม Nelson/DATCOM [LM10, LM13] |
| 13 | ครีบ | $C_{Y\beta,v} = -k\,C_{L\alpha,v}\frac{S_v}{S}\left(1+\frac{d\sigma}{d\beta}\right)\eta_v$; $(1+\frac{d\sigma}{d\beta})\eta_v = 0.724 + 3.06\frac{S_v/S}{1+\cos\Lambda} + 0.4\frac{z_w}{z_f} + 0.009A$ ($z_f$ = ความลึกลำตัวที่ปีก, $z_w$ บวกเมื่อปีกอยู่ใต้แนวกลางลำตัว); $A_{v,eff} = 1.55\,b_v^2/S_v$; $k$ = 0.75 ที่ $b_v/2r_1 \le 2$ ถึง 1.0 ที่ 3.5 ($2r_1$ = ความลึกลำตัวที่ครีบ) | DATCOM 5.3.1.1 [LM10]; Nelson บทที่ 2 และ 4 [LM13] |
| 14 | ลำตัวและปีกต่อ CYβ | $C_{Y\beta,B} = -2K_i\frac{\pi d_f^2/4}{S}$ ($K_i$ ปีกสูง 1.85, กลาง 1.0, ต่ำ 1.5); $\Delta C_{Y\beta,\Gamma} = -0.0001|\Gamma°|$ ต่อองศา | DATCOM 5.2.1.1 [LM10] |
| 15 | weathercock | $C_{n\beta} = -C_{Y\beta,v}\,\ell_v/b - 1.3\,\frac{\mathrm{Vol}_f}{Sb}\frac{H_f}{W_f}$, $\mathrm{Vol}_f \approx 0.55\cdot\frac{\pi}{4}W_f H_f L_f$ | Raymer eq. 16.47 [LM12] |
| 16 | dihedral effect | $C_{l\beta} = -K_{LL}\frac{c_{l\alpha}\Gamma}{6}\frac{1+2\lambda}{1+\lambda} + 1.2\sqrt A\,\frac{z_w}{b}\frac{2d_f}{b} + C_{Y\beta,v}\frac{z_v}{b}$ ($z_w$ บวก = ปีกอยู่ใต้แนวกลางลำตัว) | strip theory × (9); DATCOM 5.1.2.1 [LM10] |
| 17 | rate derivatives ทิศทาง | $C_{n_p} = -C_L/8 - \frac{2}{b^2}\ell_v(z_v' - z_v)C_{Y\beta,v}$; $C_{l_r} = C_L/4 - \frac{2}{b^2}\ell_v z_v' C_{Y\beta,v}$; $C_{n_r} = -(C_{D0} + KC_L^2)\frac{1+3\lambda}{6(1+\lambda)} + \frac{2}{b^2}\ell_v^2 C_{Y\beta,v}$; $C_{Y_r} = -\frac{2}{b}\ell_v C_{Y\beta,v}$; $\ell_v = l_v\cos\alpha + z_v\sin\alpha$, $z_v' = z_v\cos\alpha - l_v\sin\alpha$ | Nelson, Roskam VI [LM11, LM13]; พจน์แรงต้านปีกของ $C_{n_r}$ จาก strip theory (หาเอง) |
| 18 | rudder | $C_{Y_{\delta r}} = k\,C_{L\alpha,v}\frac{S_v}{S}\,0.9\,\tau_r$; $C_{n_{\delta r}} = -C_{Y_{\delta r}}\ell_v/b$; $C_{l_{\delta r}} = C_{Y_{\delta r}}z_v'/b$ | Nelson [LM13] |
| 19 | Oswald e และ K | $e = 1.78(1 - 0.045A^{0.68}) - 0.64$; $K = 1/(\pi A e)$ | Raymer eq. 12.48 [LM12] |
| 20 | แกนเสถียรภาพ → แกนลำตัว | $C_{l\beta}^b = C_{l\beta}c_\alpha - C_{n\beta}s_\alpha$; $C_{l_p}^b = C_{l_p}c^2 - (C_{l_r}+C_{n_p})sc + C_{n_r}s^2$; $C_{n_r}^b = C_{n_r}c^2 + (C_{l_r}+C_{n_p})sc + C_{l_p}s^2$ ฯลฯ | Etkin & Reid [LM14] |

### 01.3.2 ค่าเริ่มต้นและความเชื่อมั่น

| ค่า | ค่าเริ่มต้น | ใช้เมื่อ | ความเชื่อมั่นของผล |
|---|---|---|---|
| $c_{l\alpha}$ | 2π·0.95 = 5.97 /rad | ไม่มี airfoil | กลาง |
| $\eta_h$, $\eta_v$ | 0.90 | เสมอ (ใบพัดเป่าหางทำให้สูงกว่า) | กลาง |
| ตัวคูณ $A_{v,eff}$ | 1.55 | เสมอ | ต่ำ |
| ตัวคูณความหนืดของ τ | 0.85 | เสมอ | ต่ำ |
| ความลึกลำตัวที่ครีบ | 0.45 m | ไม่มี `airframe.tail.tailcone_depth` | ต่ำ |
| ตำแหน่งปีก | `airframe.wing.position` ("high"/"mid"/"low"), $z_w/H_f$ = −0.4/0/+0.4 | ไม่มี `airframe.wing.z_w` | ต่ำ |
| $K_n$ (adverse yaw) | −0.20 | เสมอ | ต่ำ |
| ปริมาตรลำตัว | 0.55·(π/4)·W·H·L | เสมอ | ต่ำ |
| ความสูงหางเทียบปีก $h_H/b$ | −0.05 ปีกสูง / +0.02 ปีกกลาง / +0.05 ปีกต่ำ | ไม่มี `airframe.tail.h_h` | ต่ำ |

path ที่ไม่บังคับซึ่ง `lm_derivs` อ่านเพิ่ม (บัตรควรใส่ถ้าหาได้): `airframe.wing.{position, z_w, x_c4_root}`, `airframe.tail.{z_v, h_h, tailcone_depth}`, `airframe.geometry.{fuselage_width, fuselage_height}`, `airframe.surfaces.aileron.span_fraction` = `[η_in, η_out]` (สัดส่วนครึ่งช่วงปีก)

### 01.3.3 ผลตรวจกับข้อมูลบินจริง

ชุดตรวจสองชุดที่เปิดเผยสาธารณะ: (1) NASA TM-80163 [LM5] เครื่องบินปีกสูงค้ำ 4 ที่นั่งล้อตายตัว (คลาสเดียวกับ C172 รายงานไม่ระบุชื่อแบบ) ตามยาวใช้ค่าเฉลี่ยสองรัน "trim" ของ maximum likelihood ที่ 40.7 m/s (Table IV) ส่วน lateral ใช้คอลัมน์ linear fit ที่ $C_L$ 0.6 ของ Table X (CG 28.8 % MAC; หมายเหตุ: รายการสัญลักษณ์ของรายงานเรียก δe ว่า stabilator deflection แต่ Table II เรียก elevator ชุดตรวจนี้ใช้ elevator chord ratio 0.42 ซึ่งเป็นค่าประมาณ ถ้าเป็น stabilator จริงค่า CLδe/Cmδe ที่ประมาณจะสูงขึ้นราว 60 % ผลเทียบ CLδe/Cmδe ของชุดนี้จึงมีความเชื่อมั่นต่ำ); (2) NASA TN D-6643 [LM9] Navion ปีกต่ำ ค่าจากการบินที่ 73.2 m/s แฟลป 0 และคอลัมน์ค่าอ้างอิงในรายงานเดียวกัน รูปทรงที่รายงานไม่ให้ (เช่น taper ของ C172, ตำแหน่ง aileron, ความสูงครีบ) เป็น**ค่าประมาณ**ที่ระบุใน `VALIDATION[].estimated` ของสคริปต์ ข้อมูลอนุพันธ์ทุกตัวเป็นแกนลำตัวหรือแปลงแล้ว

ตาราง 01.3-3 (สร้างจาก `scripts/out/lm_derivs_validate.json`):

| derivative | C172-class: ประมาณ / บินจริง [LM5] / ผิด % | Navion: ประมาณ / บินจริง [LM9] / ผิด % | Navion: ค่าอ้างอิงในรายงาน [LM9] / ผิด % |
|---|---|---|---|
| CLalpha | 5.097 / 5.170 / -1 | 4.901 / 4.330 / +13 | 4.901 / 4.520 / +8 |
| Cmalpha | -0.850 / -0.870 / -2 | -0.946 / -0.770 / +23 | -0.946 / -0.950 / -0 |
| Cmq | -12.260 / -14.850 / -17 | – | – |
| CLde | 0.412 / 0.420 / -2 | 0.471 / 0.511 / -8 | 0.471 / 0.403 / +17 |
| Cmde | -1.189 / -1.230 / -3 | -1.300 / -1.420 / -8 | -1.300 / -1.420 / -8 |
| CYb | -0.458 / -0.570 / -20 | -0.464 / -0.600 / -23 | -0.464 / -0.560 / -17 |
| Clb | -0.075 / -0.070 / +7 | -0.079 / -0.070 / +12 | -0.079 / -0.074 / +6 |
| Cnb | 0.033 / 0.042 / -22 | 0.046 / 0.073 / -37 | 0.046 / 0.070 / -35 |
| Clp | -0.506 / -0.450 / +13 | -0.473 / -0.490 / -4 | -0.473 / -0.410 / +15 |
| Cnr | -0.079 / -0.110 / -28 | -0.103 / -0.090 / +14 | -0.103 / -0.125 / -18 |
| Cndr | -0.059 / -0.058 / +2 | -0.056 / -0.063 / -10 | -0.056 / -0.070 / -19 |
| Clda | 0.243 / 0.204 / +19 | 0.200 / 0.154 / +30 | 0.200 / 0.134 / +49 |
| Cmq_plus_adot | – | -18.780 / -24.600 / -24 | -18.780 / -15.600 / +20 |
| CYdr | – | 0.117 / 0.330 / -65 | 0.117 / 0.157 / -25 |
| Clr | – | 0.080 / 0.110 / -28 | 0.080 / 0.107 / -26 |
| Cldr | – | 0.010 / 0.026 / -62 | 0.010 / 0.012 / -18 |
| Cnp | – | -0.038 / -0.040 / -5 | -0.038 / -0.058 / -35 |
| Cnda | – (รายงานให้ +0.008 ในเครื่องหมายของ AC = proverse ดู §01.11.1; ไม่นับในสถิติ) | -0.009 / -0.004 / +127 | -0.009 / -0.0035 / +159 |

สรุปความแม่นยำ (ใช้ตั้งความเชื่อมั่นของค่าที่ได้จาก `lm_derivs`):
- **ตามยาว** (CLα, Cmα, CLδe, Cmδe): ผิดไม่เกิน ±10 % ในชุด C172 และ ±25 % ใน Navion → ความเชื่อมั่น **กลาง** Cmq + Cmα̇ ผิด 17–24 % (แนวโน้มเดียวกับที่ FAA-RD-71-6 [LM6, p. 18] สรุปว่าตำราทุกเล่มประมาณ Cmα̇ + Cmq ต่ำไปราว 20 %)
- **Clβ, Clp** หลังแก้ด้วย lifting line ผิดไม่เกิน ±15 % (ถ้าไม่แก้ strip theory แบบตำราที่ใช้ CLα ของปีก 3 มิติให้ Clp เกินจริง 32–60 %, Clβ เกิน 20–63 % และ Clδa เกิน 70–105 % ส่วนที่ใช้ clα 2 มิติเกิน 33–175 % คำนวณซ้ำในการตรวจทาน; สอดคล้องกับข้อสรุปของ [LM6, p. 11, 18] ว่าตำราสองเล่ม (DATCOM, Etkin) ประมาณ Clβ เกินราว 50 % และ Cnr เกินราว 50 %) → **กลาง**
- **CYβ, Cnβ, Cnr, Clr, Cnp, rudder**: ผิด 2–40 % (CYδr และ Clδr เทียบค่าบินจริงของ Navion ผิดถึง 62–65 % แต่เทียบค่าอ้างอิงผิด 18–25 %; Cnβ ต่ำไปทั้งสองชุด เพราะสูตรลำตัวของ Raymer ทำลายเสถียรภาพมากไป และไม่คิดผลใบพัด) → **ต่ำ** ตรงกับ Fletcher [LM23] ที่พบว่าวิธีประมาณแบบต่าง ๆ ให้ lateral derivative ต่างกันมาก ส่วนใหญ่มาจากประสิทธิผลของหางดิ่ง ขณะที่ CLα ต่างกันไม่เกิน 10 %
- **Clδa** สูงไป 19–49 % และ **Cnδa** ผิดเกินเท่าตัว (aileron แบบ Frise ของ Cessna/Navion มีช่องและจมูกยื่นซึ่งสูตรไม่คิด; TM-80163 ยังรายงาน Cnδa ที่เป็น proverse yaw ซึ่งกลับทิศกับ $K_n$ −0.20 แต่รายงานเองบอกว่า Cnδa สัมพันธ์กับ Cnp 0.95 จึงแยกค่าได้ไม่ดี) → **ต่ำ** ให้หัวข้อบัตรข้อมูลใช้อัตราม้วนจาก POH/การบินจริงปรับแทนเมื่อมี
- ทุก derivative ได้เครื่องหมายถูกตามที่บินจริง (T-LM-11, ไม่มีข้อยกเว้นในการตรวจเครื่องหมายแล้วหลังการตรวจทาน) ค่ามัธยฐานของความผิดพลาดสัมบูรณ์ 14.5 % (29 ค่าบินจริง, T-LM-12) และ 17.6 % เมื่อรวมค่าอ้างอิง (46 ค่า)

ข้อสังเกตเรื่องเครื่องหมายเมื่ออ่านเอกสาร: TM-80163 นิยาม δa = มุมซ้าย − มุมขวา (ผลรวม), δe บวก = ขอบท้ายลง และ δr บวก = ขอบท้ายไปซ้าย [LM5 รายการสัญลักษณ์] จึงต้องคูณ Clδa ด้วย 2 ให้เป็นต่อมุมเฉลี่ยแบบ `AC` และกลับเครื่องหมายเพราะ Clδa ในรายงานเป็นลบ (Table X ที่ $C_L$ 0.6: −0.102 → +0.204; Table VII ทุกเคส −0.074 ถึง −0.127) **ฉบับก่อนการตรวจทานใช้ −0.070 ซึ่งเป็นค่า Clβ ในแถวข้างกันของ Table X จึงได้ 0.14 และสรุปว่า Clδa ประมาณสูงไป 74 % ซึ่งผิด**; TN D-6643 ใช้แกนลำตัวที่ CG และ CZα ≈ −CLα; ลำดับแถวของตาราง lateral ใน TN D-6643 อนุมานจากคอลัมน์อ้างอิงที่ตรงกับชุด Navion ของตำรา (CYβ, CYδr, Clβ, Clp, Clr, Clδa, Clδr, Cnβ, Cnp, Cnr, Cnδa, Cnδr) จึงมีความเชื่อมั่นกลาง


## 01.4 moment of inertia จาก radius of gyration (lm_inertia)

นิยามรัศมีไจเรชันแบบไร้มิติของ Roskam Part V [LM15] ตาม schema-ext-r2 §5:
$$I_{xx} = m\left(\frac{b R_x}{2}\right)^2,\quad I_{yy} = m\left(\frac{L R_y}{2}\right)^2,\quad I_{zz} = m\left(\frac{b+L}{2}\cdot\frac{R_z}{2}\right)^2$$
($m$ kg, $b$ ช่วงปีก, $L$ ความยาวทั้งลำ) ตารางค่าคลาสในหนังสือ Roskam Part V เป็นเอกสารลิขสิทธิ์ที่หัวข้อนี้เปิดตรวจไม่ได้ จึง**ไม่ใช้ตัวเลขจากความจำ** แต่คำนวณ $R_x, R_y, R_z$ ใหม่จากเครื่องบินที่มี inertia เผยแพร่ แล้วเอาค่าเฉลี่ยเป็นค่าคลาส (`common_light.methods.radii`) และตรวจแบบ leave-one-out (ทำนายแต่ละลำจากค่าเฉลี่ยของลำอื่นในคลาส)

| ลำอ้างอิง | คลาส | มวล kg | b m | L m | Rx | Ry | Rz | แหล่ง (ความเชื่อมั่น) |
|---|---|---|---|---|---|---|---|---|
| คลาส C172 ของ NASA TM-80163 | single_prop | 838 | 11.00 | 8.20 | 0.235 | 0.324 | 0.364 | [LM5] Table I: 837.93 kg, Ixx 1,395, Iyy 1,480, Izz 2,563, Ixz 123 kg m² (กลาง: Iyy อ่านจาก OCR "lk80") |
| Navion (FAA-RD-71-6, TN D-6643) | single_prop | 1,337 | 10.16 | 8.38 | 0.225 | 0.400 | 0.391 | [LM6][LM9] Table I: 2,948 lb, Ix 1,284, Iy 2,773, Iz 3,235 slug ft² (สูง; L 27 ft 6 in จาก [LM7] ความเชื่อมั่นกลาง) |
| JSBSim c172x | single_prop | 1,125 | 10.97 | 8.28 | 0.290 | 0.325 | 0.405 | [LM8] ค่าในโมเดล (ต่ำ) |
| JSBSim pa28 | single_prop | 898 | 9.14 | 7.25 | 0.278 | 0.379 | 0.456 | [LM8] (ต่ำ) |
| JSBSim c310 (ถังปลายปีก) | twin_prop | 1,973 | 11.13 | 8.23 | 0.544 | 0.290 | 0.673 | [LM8] (ต่ำ: Iyy/Ixx 0.16 ผิดปกติ) |
| JSBSim pc7 | trainer_turboprop | 2,015 | 10.40 | 9.78 | 0.219 | 0.292 | 0.341 | [LM8] (ต่ำ) |
| JSBSim t6texan2 | trainer_turboprop | 2,722 | 10.18 | 10.16 | 0.303 | 0.384 | 0.458 | [LM8] (ต่ำ) |

ค่าของโมเดล JSBSim เป็น inertia **รวม**ที่โมเดลใช้บินจริง (โครงสร้าง + จุดมวล + เชื้อเพลิง) ซึ่งหัวข้อนี้วัดเองด้วย `scripts/lm_jsb_inertia.py` (`python3 -I`, ผลใน `scripts/out/lm_jsb_inertia.json`) เพราะค่า `<ixx>` ในไฟล์ XML เป็นของโครงสร้างเปล่าเท่านั้น เลขที่วัดจากการรันโมเดลเป็นของเราเอง (ไม่ได้คัดลอก XML)

ค่าคลาส (ค่าเฉลี่ย, [ต่ำสุด, สูงสุด]):

| คลาส | Rx | Ry | Rz | n | leave-one-out |
|---|---|---|---|---|---|
| `single_prop` | 0.257 [0.225, 0.290] | 0.357 [0.324, 0.400] | 0.404 [0.364, 0.456] | 4 | ผิด 0.4–42 % ต่อแกน (TM-80163: +27/+29/+31 %; Navion Ixx +42 %) |
| `trainer_turboprop` | 0.261 [0.219, 0.303] | 0.338 [0.292, 0.384] | 0.400 [0.341, 0.458] | 2 | ผิด 42–91 % (สองโมเดลต่างกันมาก) |
| `twin_prop` | 0.544 | 0.290 | 0.673 | 1 | ทดสอบไม่ได้ |

ข้อแนะนำ:
1. เครื่องยนต์เดียวใช้ `single_prop` ได้ (ความเชื่อมั่น **ต่ำ–กลาง**, ±30 %) ผลต่อซิม: ωn ของ short period และ Dutch roll แปรตาม $1/\sqrt I$ ความผิด ±30 % ใน I ทำให้ ωn ผิด −12 % ถึง +20 %
2. `twin_prop` มาจาก C310 ที่มีถังน้ำมันปลายปีก ใช้กับ DA42 ไม่ได้ตรง ๆ ให้หัวข้อ 06 ประมาณแบบรวมชิ้นส่วน (component build-up: เครื่องยนต์สองข้าง $2 m_e y_e^2$ บวกปีก ลำตัว ตามสูตรใน Roskam Part V บทที่ 10 [LM15]) แล้วรายงานเทียบกับค่านี้ (งานที่แนะนำ)
3. inertia ที่ได้ต้องสเกลตามมวลด้วยรัศมีคงที่ ($I \propto m$) เฉพาะเมื่อมวลที่เพิ่มอยู่ใกล้ CG (คนนั่ง) เชื้อเพลิงในปีกเพิ่ม Ixx และ Izz มากกว่าสัดส่วนมวล (เช่น c172x: น้ำหนักเปล่า 1,454 lb → 2,480 lb ทำให้ Ixx เพิ่ม 2.21 เท่าเมื่อมวลเพิ่ม 1.71 เท่า)

คำสั่ง: `node scripts/lm_inertia.mjs` (ตารางและ leave-one-out), `node scripts/lm_inertia.mjs <typeId> [--class twin_prop] [--mass kg]`, `--json` (ผลใน `scripts/out/lm_inertia.json`)


## 01.5 CLmax จากความเร็ว stall และ drag polar จาก POH (lm_polar)

### 01.5.1 CLmax จากความเร็ว stall ใน POH

ขั้นตอน (ฟังก์ชัน `clmaxFromStall`, `cgShiftCLmax`, `stallSpeed`):
1. **แปลง KIAS → KCAS** ด้วยตาราง airspeed calibration ของ POH ที่แฟลปนั้น (`speeds.ias_cas`) เพราะ AC 23-8C กำหนดให้ความเร็ว stall ที่ใช้คำนวณเป็น CAS ส่วนที่เป็น IAS ใช้เฉพาะขีดบนมาตรวัด [LM1, p. 15, 22] ใกล้ stall ความต่างมักเป็นหลายนอต (ตำแหน่งท่อ pitot-static ที่ α สูง) ถ้าข้ามขั้นนี้ CLmax จะผิดได้ 10–20 %
2. **ที่ความสูงต่ำ CAS ≈ EAS** (ต่างไม่เกิน 0.13 kt ที่ ≤ 100 kt และ ≤ 10,000 ft, ดู §01.1.3) จึงใช้ $q = \tfrac12\rho_0 V_{CAS}^2$
3. **มวลและ CG ของตัวเลขใน POH**: AC 23-8C ให้หาความเร็ว stall ที่มุมของ envelope ที่วิกฤต (ปกติ MTOW, CG หน้าสุด) และแก้ตามน้ำหนักด้วย $V_s\sqrt{W_{std}/W_{test}}$ [LM1, p. 22] ดังนั้นค่าที่ได้คือ **CLmax แบบ trim ที่ CG หน้าสุด**
4. **ความเร็วต่ำสุด กับ 1 g**: ตาม AC 23-8C และ 14 CFR 23.49 / 23.201 (ก่อน amendment 23-64) $V_S$ ของเครื่องบินที่ elevator ชนสต็อปคือ*ความเร็วต่ำสุด*ที่ได้ขณะดึงคันชนสต็อปอย่างน้อย 2 s ในการลดความเร็ว ≤ 1 kt/s ด้วยคันเร่ง idle [LM1, p. 15–22][LM3] ที่จุดนั้น $n_z < 1$ (เส้นทางบินโค้งลง) ขณะที่ 14 CFR 25.103 นิยาม $V_{SR} = V_{C_{L\max}}/\sqrt{n_z}$ [LM2] จึงได้
$$C_{L\max,1g} = \frac{2\,m g\,n_z}{\rho_0 S V_{min}^2},\qquad V_{1g} = V_{min}/\sqrt{n_z}$$
ค่าเริ่มต้น $n_z$ = 0.95 ช่วง 0.90–1.00 (**ค่าประมาณ** ความเชื่อมั่นต่ำ: ซิมของรอบที่ 1 ภายใต้ขั้นตอนเดียวกันได้ $n_z$ 0.949 แฟลปลง และ 0.985 clean [R1:V19]) ผลต่อ CLmax ±5 %
5. **ย้าย CG**: จากสมดุลแรงยกหาง $C_{L,trim} = C_{L,wb}(1 + (x_{cg}-x_{ac})/l_t) + C_{m,ac}\bar c/l_t$ ที่ stall $C_{L,wb} = C_{L\max,wb}$ คงที่ จึง $C_{L\max}(x_2) \approx C_{L\max}(x_1)\,[1 + (x_2 - x_1)/l_t]$ ($x$ บวกไปทางท้าย, $l_t$ แขนหาง) ตัวอย่าง CG ถอยหลัง 0.20 m ที่ $l_t$ 4.4 m เพิ่ม CLmax 4.5 % (Vs ลด 2.2 % หรือราว 1 kt ที่ 50 kt) ทิศทางและขนาดสอดคล้องกับ POH ของเครื่องเล็กที่ให้ Vs ที่ CG หน้าสุด**สูงกว่า**ที่ CG หลังสุดราว 0–1 kt (เช่น C172P: CG หน้า 52/49/46 KCAS กับ CG หลัง 51/48/46 KCAS ที่แฟลป 0/10/30 ตามที่หัวข้อ 03 อ่านจาก POH [LB9]) (ฉบับก่อนการตรวจทานเขียนกลับทิศ)
6. **ใส่ในซิม**: `buildAC` แก้หาจุดกลางการผสม stall `aStall` (และ `aStallFlap`) ให้ CLmax แบบ trim ของซิมเท่ากับเป้า แล้ว `lm_card` บิน stall 1 kt/s ยืนยัน (T-LM-08 ตรวจสูตร)

ตัวอย่าง (ตัวเลขสมมติเพื่ออธิบาย, `scripts/out/lm_polar_example.json`): m 1,000 kg, S 16.2 m², $V_{min}$ 48 KCAS ได้ $C_L$ ปรากฏ 1.62; ด้วย $n_z$ 0.95 ได้ $C_{L\max,1g}$ 1.54 และ $V_{1g}$ 49.2 kt; ช่วง $n_z$ 0.90–1.00 ให้ 1.46–1.62

### 01.5.2 drag polar จาก best glide, cruise และ climb

- **best glide** (`polarFromGlide`): สำหรับ polar พาราโบลา $C_D = C_{D0} + KC_L^2$ ที่ (L/D)max ได้ $C_{D0} = KC_L^{*2}$ และ $E = 1/(2\sqrt{C_{D0}K})$ ดังนั้นจากความเร็ว best glide (KCAS → $C_L^* = 2W/(\rho_0 S V^2)$) และ glide ratio $E$:
$$C_{D0} = \frac{C_L^*}{2E},\qquad K = \frac{1}{2EC_L^*},\qquad e = \frac{1}{\pi A K}$$
POH ให้ค่าร่อนที่ idle และใบพัดหมุนฟรี (windmilling) polar ที่ได้จึง**รวมแรงต้านใบพัด**ไว้แล้ว ($e$ ที่ได้ต่ำ 0.55–0.65 และ $C_{D0}$ สูงกว่าค่าทางอากาศพลศาสตร์ล้วน) ซึ่งตรงกับที่ซิมต้องการ เพราะซิมตั้ง idle ≥ 0 และไม่มีแรงต้านใบพัด (ดู §01.8)
- **cruise** (`pointFromCruise`): $D = \eta P/V_{TAS}$, $C_L = W/(qS)$, $C_D = D/(qS)$ ที่ความหนาแน่นของความสูงและ OAT ใน POH ต้องสมมติ η (0.78–0.85 สำหรับ fixed pitch ที่ cruise; ดีกว่าคือใช้ `lm_prop` §01.7) และกำลังเพลาจาก % power ในตาราง
- **climb** (`pointFromClimb`): $D = \eta P/V - W\sin\gamma$
- **รวมหลายจุด** (`fitPolar`): weighted least squares ของ $C_D$ บน $C_L^2$ ได้ $C_{D0}, K$ และ covariance จาก residual
- **ความไม่แน่นอน** (`montecarlo`, seed คงที่): สุ่มอินพุตแบบปกติ เช่นความเร็ว ±1.5 kt (ความละเอียดของ POH) glide ratio ±5 % η ±0.05 แล้วรายงาน mean, sd, p05–p95

ตัวอย่าง (ตัวเลขสมมติ m 1,000 kg, S 16.2 m², A 7.47, best glide 70 KCAS, E 9.0): $C_L^*$ 0.762, $C_{D0}$ 0.0423 (p05–p95 0.0383–0.0475), K 0.0729 (0.0656–0.0815), e 0.58 (0.52–0.65); แปลงเป็นรูปแบบซิม (สมการ 01.1-1) ได้ $C_{D0,s}$ 0.0507, $K_s$ 0.0908 ส่วนจุด cruise 110 KTAS ที่ 1,500 m กำลัง 65 % ของ 134 kW η 0.8 ให้ $C_D$ 0.0449 ที่ $C_L$ 0.357 ต่ำกว่า polar จาก glide (0.0516) ราว 13 % แสดงว่า**ห้ามรวมจุด glide (มีแรงต้านใบพัด) กับจุด cruise (แรงขับสุทธิ) ในการ fit เดียวกันโดยไม่แยกบัญชีแรงขับ–แรงต้าน** ให้เลือกตามการใช้งาน: ซิมวันนี้ใช้ polar จาก glide (§01.8) ส่วนโมเดลใบพัดรุ่นถัดไปใช้ polar จาก cruise/climb ร่วมกับ CT/CP

การตรวจ (T-LM-09): ป้อน polar พาราโบลา CD0 0.030, K 0.050 ผ่าน `toSimPolar` เข้าซิม แล้วบินร่อนแรงขับศูนย์ ได้ L/D 12.91 (เป้า 12.91) ที่ $C_L$ 0.777 (เป้า 0.775) และ `polarFromGlide` ย้อนกลับได้ CD0 0.0301


## 01.6 แบบจำลองเครื่องยนต์ลูกสูบและดีเซล (piston.*)

ซิมวันนี้คิดแรงขับจาก `thrustAvail(V)` ที่ไม่ขึ้นกับความหนาแน่นอากาศและไม่มีรอบเครื่อง (`src/20-flight.js:144`) หัวข้อนี้กำหนดโมเดลสำหรับรุ่นถัดไปและนิยาม leaf `piston.*` ของ schema-ext-r2 สคริปต์ `scripts/lm_engine.mjs`

### 01.6.1 กำลังตามความสูงและอุณหภูมิ (`piston.altitude.model`)

schema-ext-r2 §5 กำหนด `piston.altitude.model` เป็น `gagg_ferrar` | `turbo_flat` | `table` หัวข้อนี้**เสนอเพิ่ม** `ind_friction` (พร้อมฟิลด์ `f`) เป็นค่าที่สี่ เพราะเป็นสูตรเดียวในตารางที่แยกผลของอุณหภูมิออกจากความดัน ซึ่งสำคัญกับวันร้อนที่ VTBD (`lm_merge` ไม่ตรวจ enum นี้ บัตรจึงใช้ได้ทันที ส่วนการแก้ไฟล์ schema เป็นงานใน §01.13)

| model | สมการ | แหล่ง | ใช้กับ |
|---|---|---|---|
| `gagg_ferrar` | $P/P_0 = \sigma - (1-\sigma)/7.55$ (= $1.1325\sigma - 0.1325$) | Gagg & Farrar 1934, SAE 340096 [LM16] (บทคัดย่อไม่ให้สูตร); รูปเทียบเท่า $1.132\sigma - 0.132$ ใน Leishman [LM27] eq. 12 | ลูกสูบไม่มี turbo คันเร่งเต็ม |
| `ind_friction` | $P/P_r = (1+f)\,\frac{MAP}{MAP_r}\frac{N}{N_r}\sqrt{T_0/T} - f\left(\frac{N}{N_r}\right)^2$, คันเร่งเต็ม $MAP \propto p_{amb}$ | กำลัง indicated แปรผกผันกับ $\sqrt T$ ที่ความดันคงที่ และกำลังเสียดทานไม่ขึ้นกับอุณหภูมิ ตาม NACA Report 190 [LM17, p. 125, 134] (ส่วนที่แปรตาม MAP และรอบเป็นสมมติฐานมาตรฐานว่ากำลัง indicated ∝ มวลอากาศเข้าต่อเวลา); $f$ = กำลังเสียดทาน/กำลังพิกัด 0.10 (**ค่าประมาณ**, ช่วง 0.08–0.15) | ลูกสูบไม่มี turbo ทุกตำแหน่งคันเร่งและรอบ (fixed pitch) |
| `turbo_flat` | $P = P_r$ ถึง `critical_alt_m` เหนือจากนั้น `gagg_ferrar` ของ $\sigma/\sigma_{crit}$ | หลักการ turbocharger รักษา MAP; ค่า critical altitude ต้องมาจาก AFM | AE300 (turbo-diesel) |
| `table` | ตาราง P(h, OAT) หรือ load % สูงสุดตามความสูงจาก AFM | AFM | ทุกแบบเมื่อมีข้อมูล |

ผลเทียบ (ISA คันเร่งเต็ม รอบพิกัด, `scripts/out/lm_engine.txt`):

| ความสูง ft | σ | gagg_ferrar | ind_friction f 0.10 | ind_friction f 0.15 |
|---|---|---|---|---|
| 0 | 1.000 | 1.000 | 1.000 | 1.000 |
| 4,000 | 0.888 | 0.873 | 0.863 | 0.857 |
| 8,000 | 0.786 | 0.758 | 0.741 | 0.729 |
| 12,000 | 0.693 | 0.653 | 0.630 | 0.614 |

สองสูตรต่างกันไม่เกิน 3.5 % ตลอดช่วงที่เครื่องฝึกใช้ แต่ต่างกันชัดในวันร้อน: ที่ VTBD (9 ft) OAT 35 °C `gagg_ferrar` ให้ 0.926 เพราะคิดตามความหนาแน่น ส่วน `ind_friction` ให้ 0.963 เพราะ NACA R-190 พบว่ากำลังแปรตาม $1/\sqrt T$ ไม่ใช่ $1/T$ ที่ความดันคงที่ (ความเชื่อมั่นกลาง) ข้อเสนอ: ใช้ `ind_friction` เป็นค่าเริ่มต้นของ AirfieldLab เพราะสนามอยู่ในเขตร้อนและสูตรนี้ให้ผลต่อรอบและ MAP ได้ด้วย แล้วตรวจกับตาราง takeoff/climb ของ POH ที่ OAT 30–40 °C (หัวข้อบัตรข้อมูล)

### 01.6.2 คันเร่ง รอบ และพลวัต

- **fixed pitch (C172S):** กำลังเครื่องที่คันเร่งเต็มตามรอบมาจาก `ind_friction` ($P \propto N$ ที่ MAP คงที่ ลบเสียดทาน $\propto N^2$) รอบสมดุลคือจุดที่ $P_{eng}(N) = C_P(J)\rho n^3 D^5$ ของใบพัด (§01.7) ซิมจึงได้รอบสถิตและรอบ cruise ที่ตรวจกับ POH ได้
- **คันเร่ง:** $MAP = MAP_{idle} + thr\,(MAP_{full} - MAP_{idle})$ แล้วใช้ `ind_friction` (การไหลผ่านลิ้นเร่งไม่เชิงเส้น แต่การจับคู่เชิงเส้นของคันเร่งกับ MAP เป็นค่าเริ่มต้นที่ตรวจได้จากรอบ idle และรอบสถิตใน POH)
- **พลวัต:** MAP/กำลังตามคำสั่งด้วยค่าคงที่เวลา $\tau$ (`piston.dynamics.tau_throttle_s`) และรอบตาม $I\dot\omega = Q_{eng} - Q_{prop}$ (`piston.dynamics.I_engine` รวมใบพัด) ค่าเริ่มต้น τ 0.2 s และ I ของใบพัดโลหะ 76 นิ้วราว 1.5–2 kg m² เป็น**ค่าประมาณ** ความเชื่อมั่นต่ำ จนกว่าหัวข้อบัตรจะหาค่าจริง
- **เชื้อเพลิง:** $FF = BSFC\cdot P$ Lycoming ไม่เผยแพร่ BSFC เป็นตัวเลขใน SI 1094D [LM18] (ให้แค่ best power = 100 °F ด้าน rich ของ peak EGT, best economy = peak EGT และแนะนำกำลัง cruise ต่อเนื่อง 65 % เพื่ออายุเครื่อง ไม่มีตัวเลข BSFC) จึงให้หัวข้อบัตร fit BSFC จากตาราง cruise ของ POH ด้วย `fitBsfc(rows, P_rated)` (rows = %BHP กับ GPH) แทนการเดาค่าคงที่ ความหนาแน่นเชื้อเพลิงเริ่มต้น avgas 0.72 kg/l, Jet A-1 0.80 kg/l (**ค่าประมาณ**)

### 01.6.3 AE300 (DA40 NG, DA42 NG) และ FADEC คันเดียว

ข้อมูลจาก factsheet ของผู้ผลิต [LM19] (ผู้ผลิตระบุว่าเป็นข้อมูลประกอบ ไม่ผูกพัน): กำลัง takeoff และต่อเนื่อง 123.5 kW (168 hp), แรงบิดสูงสุด 512 Nm, รอบสูงสุด 2,300 rpm, ความจุ 1,991 cm³, น้ำหนักแห้ง 186 kg, น้ำมันก๊าด, อัตราสิ้นเปลือง 35 l/h ที่ 100 % และ 19 l/h ที่ 60 % ตรวจได้ว่า 123.5 kW / (2,300 rpm) = 512.7 Nm ดังนั้น 2,300 rpm คือ**รอบใบพัด** (เพลาข้อเหวี่ยงราว 3,890 rpm ผ่านเกียร์ 1:1.69 ตาม [LM20]) BSFC ที่คำนวณจากอัตราสิ้นเปลือง (Jet A-1 0.80 kg/l) = **227 g/kWh ที่ 100 % และ 205 g/kWh ที่ 60 %** (T-LM-15)

FADEC: นักบินมีคันเดียวเป็น load % ระบบจัดการทั้งเชื้อเพลิงและ governor ของใบพัด MT constant speed โมเดล `fadec(lever, {schedule, P_rated_W, availFrac})`: load = 100·lever (จำกัดด้วยกำลังที่มีที่ความสูงนั้น `availFrac`), กำลัง = load·P_rated, รอบใบพัดจากตาราง `piston.fadec.rpm_schedule` = [[load %, rpm], …] ค่าตัวอย่างในสคริปต์ [[0, 1800], [100, 2300]] เป็น**ค่าประมาณ**เพื่อทดสอบเท่านั้น หัวข้อ 05/06 ต้องแทนด้วยค่าจาก AFM ของ DA40 NG / DA42 NG (ตาราง load–rpm และ load สูงสุดตามความสูง) ส่วน Thielert/Continental CD-135/155 (DA42 รุ่น TAE 125 / CD-135) ใช้โครงเดียวกัน (`kind: "turbo_diesel"`) หัวข้อ 06 เติมค่าถ้า `da42_tae125` จำเป็น

### 01.6.4 นิยาม leaf `piston.*` พร้อมตัวอย่าง

| path | `v` (รูปแบบ) | IO-360-L2A (C172S) | AE300 (DA40 NG) |
|---|---|---|---|
| `piston.identity` | `{model, kind, displacement_L, cylinders, tcds}` | IO-360-L2A, `fuel_injected`, 5.916 L (361 in³), 4, EASA IM.E.032 p. 6 / FAA 1E10 [LM21] | E4 (AE300), `turbo_diesel`, 1.991 L, 4 แถวเรียง [LM19][LM20] |
| `piston.ratings.P_rated` / `rpm_rated` | W / rpm | 134 kW (180 hp) @ 2,700 rpm ตาม IM.A.051 C.5 [LM22] (TCDS เครื่องยนต์ IM.E.032 p. 12 [LM21] ให้ L2A take-off/MCP 119 kW (160 hp) @ 2,400 rpm และ "alternate rating" 134 kW (180 hp) @ 2,700 rpm ดู §01.11) | 123.5 kW (168 hp) @ 2,300 rpm (ใบพัด) [LM19] |
| `piston.ratings.{P_mcp, rpm_redline, rpm_idle, takeoff_time_limit_s}` | W, rpm, s | เท่ากับ takeoff, 2,700, (POH), ไม่จำกัด | 123.5 kW, 2,300, (AFM), ไม่จำกัด |
| `piston.altitude` | `{model, f, critical_alt_m}` | `{"model":"ind_friction","f":0.10}` (**ค่าประมาณ**) | `{"model":"table"}` จาก AFM (ยังไม่มี) |
| `piston.power_map` | `{"axes":{"rpm":[…],"MAP_inHg":[…]},"data":[…]}` หรือ `{"axes":{"load_pct":[…]}}` | จากตาราง cruise ของ POH | load % → kW เชิงเส้น |
| `piston.fuel` | `{fuel, bsfc_g_per_kWh, ff_table}` | avgas 100LL, `fitBsfc` จาก POH | Jet A-1, 227 (100 %) / 205 (60 %) |
| `piston.dynamics` | `{tau_throttle_s, I_engine, friction_torque}` | 0.2 s, ~1.7 kg m² รวมใบพัด (**ค่าประมาณ**) | 0.5 s (FADEC + turbo lag, **ค่าประมาณ**) |
| `piston.fadec` | `{rpm_schedule, lever_to_load}` | – | จาก AFM |


## 01.7 ใบพัด fixed pitch และ constant speed (lm_prop)

`scripts/lm_prop.mjs` เป็น BEM ที่เขียนใหม่จากสมการของรอบที่ 1 (03-propeller.md §3.3 [R1:P10]): สมดุลโมเมนตัมต่อวงแหวนพร้อม Prandtl tip loss $F = \frac2\pi\arccos e^{-f}$, $f = \frac B2\frac{R-r}{r\sin\phi}$; หน้าตัดเป็นแรงยกเชิงเส้นพร้อม Prandtl–Glauert ผสมแบบ Beard–McLain ไปเป็นแผ่นเรียบหลัง stall ($c_l = 2\sin\alpha\cos\alpha$, $c_d = c_{d0} + 1.9\sin^2\alpha$) และ stall delay ของ Snel ($c_l \mathrel{+}= 3(c/r)^2(c_{l,lin} - c_l)$) ผลคือ $C_T = T/(\rho n^2D^4)$, $C_P = 2\pi Q/(\rho n^2 D^5)$, $\eta = JC_T/C_P$

### 01.7.1 ข้อมูลนำเข้าและที่มา

| ใบพัด | ข้อมูลจริง (แหล่ง) | ค่าประมาณ |
|---|---|---|
| `fixed_76x60` คลาส C172S | McCauley 1A170E/JHA7660, เส้นผ่านศูนย์กลาง 75–76 in, รอบสถิตคันเร่งเต็ม 2,300–2,400 rpm, เครื่อง IO-360-L2A 180 hp ที่ 2,700 rpm (EASA TCDS IM.A.051 Section 2, C.5–C.6 [LM22]); pitch 60 in ที่ 0.75R จากรหัสรุ่น (อ่านตามแบบแผนการตั้งชื่อของ McCauley, ความเชื่อมั่นกลาง) ⇒ $\beta_{75} = \arctan\frac{60}{0.75\pi\cdot 76} = 18.5°$ | 2 ใบ pitch เรขาคณิตคงที่ตามรัศมี, chord/D 0.05–0.073 (activity factor ≈ 90), หน้าตัดคล้าย Clark Y ($c_{l\alpha} = 0.9\cdot 2\pi$, α0 −3.5° จากผิวเรียบ, stall ±14°/−10°, $c_{d0}$ 0.010) |
| `cs3_190` คลาส DA40 NG | ใบพัด MT-Propeller MTV-6-R/190-69 ของ DA 40 NG ตาม EASA TCDSN IM.A.022 p. 8–11 [LM28]; 3 ใบ constant speed เส้นผ่านศูนย์กลาง 1.90 m อ่านจากเลข 190 ในรหัสรุ่น (ความเชื่อมั่นกลาง ต้องยืนยันเส้นผ่านศูนย์กลางกับ TCDS ของใบพัดในหัวข้อ 05), AE300 123.5 kW ที่ 2,300 rpm [LM19] | twist แบบ helical ที่ J 0.95, chord 0.85 เท่าของแบบ 2 ใบ |

### 01.7.2 ผล (ISA ระดับน้ำทะเล; `scripts/out/lm_prop_fixed.json`, `lm_prop_cs.json`)

ใบพัด fixed pitch หลังปรับสเกล chord ×1.083 ให้รอบสถิตเท่ากับกลางช่วง TCDS (2,350 rpm) — ก่อนปรับ BEM ทำนายได้ 2,463 rpm (สูงไป 4.8 %):

| J | 0 | 0.2 | 0.4 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0 |
|---|---|---|---|---|---|---|---|---|
| $C_T$ (BEM) | 0.137 | 0.128 | 0.104 | 0.070 | 0.051 | 0.030 | 0.009 | −0.014 |
| $C_P$ (BEM) | 0.061 | 0.066 | 0.064 | 0.052 | 0.042 | 0.029 | 0.011 | −0.009 |
| η (BEM) | 0 | 0.39 | 0.65 | 0.80 | 0.84 | 0.84 | 0.68 | – |
| $C_T$ / $C_P$ ของ JSBSim `prop_75in2f` [LM8] | 0.073 / 0.066 | 0.072 / 0.070 | 0.069 / 0.060 | 0.062 / 0.050 | – | 0.045 / 0.043 | – | 0.024 / 0.028 |

- รอบสถิต 2,350 rpm, แรงขับสถิต **3.54 kN (795 lbf)**, กำลังที่ดูด 158.7 hp, FM 0.66, η สูงสุด 0.849 ที่ J ≈ 0.75 (**ค่าประมาณ** ความเชื่อมั่นต่ำ–กลาง) ที่ VTBD 35 °C รอบสถิต 2,385 rpm แรงขับ 3.42 kN
- ตาราง JSBSim ให้ $C_{P0}$ 0.066 ซึ่งทำให้รอบสถิตของเครื่อง IO-360 ตามโมเดล `ind_friction` เป็น 2,245 rpm **ต่ำกว่าช่วง TCDS** และ $C_{T0}$ 0.073 ให้ FM เพียง 0.24 (ใบพัดจริงที่ไม่ stall ทั้งใบมี FM 0.5–0.75) จึงไม่ควรใช้ตาราง JSBSim นี้เป็นค่าอ้างอิงของแรงขับสถิต (ส่งข้อสังเกตให้หัวข้อ 03)
- ช่วงที่ต้องตรวจต่อ: BEM ให้ $C_T = 0$ ที่ J ≈ 0.94 ส่วน JSBSim ยังให้แรงขับบวกที่ J 1.0 ความต่างนี้กำหนดรอบ cruise ที่คันเร่งเต็ม หัวข้อ 04 ต้องตรวจด้วยรอบ/ความเร็วในตาราง cruise ของ POH (เช่น จุด 2,500–2,700 rpm) ก่อนใช้ตารางนี้ (งานที่แนะนำ P1)

ใบพัด 3 ใบ constant speed: ที่ 123.5 kW 2,300 rpm สถิตต้องตั้ง $\beta_{75}$ 20.2° ได้แรงขับ **3.45 kN** (FM 0.62); cruise 130 KTAS 6,000 ft 75 % 2,200 rpm ได้ J 0.96, $\beta_{75}$ 25.2°, η 0.87 (ค่าประมาณทั้งหมด) ตาราง $C_T, C_P(J, \beta_{75})$ ที่ β 15–35° อยู่ในไฟล์ผล

### 01.7.3 วิธีใช้กับบัตรข้อมูล

1. ใส่ `propeller.identity.{kind, model, diameter, blades}` และ `propeller.fixed.{pitch_in, beta75_deg, static_rpm_range}` จาก TCDS
2. รัน BEM แล้ว**ปรับสเกล chord ตัวเดียว** (`calibrateChord`) ให้รอบสถิตตรงกลางช่วง TCDS (fixed pitch) หรือให้ดูดกำลังพิกัดที่รอบ governor ด้วยมุมใบในช่วงที่ AFM/TCDS ใบพัดกำหนด (constant speed)
3. ตรวจกับจุด cruise ใน POH: ที่ความสูง รอบ และ % power ของตาราง ใบพัดต้องให้แรงขับเท่าแรงต้านจาก polar (§01.5) ภายใน ±5 % ถ้าไม่ผ่าน ให้ปรับ α0 ของหน้าตัด (ตัวแทนของ pitch ที่ไม่คงที่) แล้วบันทึก
4. เก็บผลเป็น `propeller.tables.CT/CP` (fixed pitch: แกน J อย่างเดียว) ตาม schema-ext-r2


## 01.8 การ fit ค่า legacy ให้บินกับโค้ดวันนี้ (lm_legacy_fit)

เป้าหมาย: ให้ทุกแบบในรอบที่ 2 บินในซิมวันนี้ได้ทันที (ก่อนมีโมเดลใบพัด/เครื่องยนต์ใหม่) โดยให้ความเร็ว stall, อัตราไต่และการร่อนตรงกับ POH ภายในเกณฑ์ คำสั่ง `node scripts/lm_legacy_fit.mjs <typeId> [--mode static|vy] [--json]` ผลคือ `propulsion.legacy` และ `aero.legacy` ที่หัวข้อบัตรนำไปใส่ใน JSON ของตัวเอง

### 01.8.1 ขั้นตอน (ทั้งหมดที่ MTOW, ISA ระดับน้ำทะเล)

1. **stall**: `buildAC` แปลง VS1/VS0 (KIAS → KCAS) เป็น CLmax 1 g ด้วย `lm_polar` (ความเร็วต่ำสุด, $n_z$ 0.95) แล้วแก้หา `aStall` และ `aStallFlap` ในซิม (§01.1)
2. **polar**: จาก `performance.glide` {speed_kt, ratio} ได้ polar พาราโบลา (§01.5) แล้วแปลงเป็นรูปแบบซิมด้วยสมการ 01.1-1 และตั้ง `idle = 0` เพราะ POH ให้การร่อนที่คันเร่ง idle ใบพัดหมุนฟรี แรงต้านใบพัดจึงอยู่ใน polar แล้ว ส่วนซิมให้แรงขับ ≥ 0 เสมอ (`max(AC.idle, thr)`) จึงจำลองแรงต้านใบพัดด้วยแรงขับติดลบไม่ได้
3. **แรงขับ**: กฎของซิม $T = \text{thr}\cdot T_0 V_c/\sqrt{V^2 + V_c^2}$, $V_c = \eta P/T_0$ (ที่ความเร็วสูง $T \to \eta P/V$) มีพารามิเตอร์จริงเพียงสองตัวคือ $T_0$ กับ $V_c$
   - โหมด `static` (ค่าเริ่มต้น): $T_0$ = แรงขับสถิตจาก `lm_prop` (หรือทฤษฎีโมเมนตัม FM 0.55) แล้วหา $V_c$ ให้ ROC สูงสุดของแบบจำลองเท่ากับ POH; $\eta = V_c T_0/P$ โดย $P$ = กำลังพิกัด
   - โหมด `vy`: หา $T_0$ และ $V_c$ พร้อมกันให้ทั้ง Vy และ ROC ตรง
4. **ตรวจในซิม** (`checkFit`): บิน stall 1 kt/s ทั้งสองแฟลป, กวาด climb และ glide และวิ่งขึ้น แล้วรายงานเทียบเป้า

### 01.8.2 ผลตรวจวิธี (ชุดเป้าสมมติ `demo_light`: m 1,100 kg, S 16.2 m², VS1/VS0 48/42 KCAS, Vy 74 KCAS, ROC 730 fpm, ร่อน 68 KCAS L/D 9.0, P 134 kW — **ตัวเลขสมมติเพื่อทดสอบโค้ด ไม่ใช่เครื่องบินจริง**)

| ปริมาณ | เป้า | โหมด static | โหมด vy |
|---|---|---|---|
| V_SR clean / แฟลปสุด (KCAS) | 49.2 / 43.1 (= POH/√0.95) | 49.2 / 43.1 | 49.2 / 43.1 |
| Vmin ในการทดสอบ 1 kt/s (KCAS) | 48 / 42 (POH) | 47.0 / 41.4 | 47.0 / 41.4 |
| ROC สูงสุด (fpm) | 730 | 745 | 740 |
| Vy (kt) | 74 | **65.8** | 73.5 |
| ร่อน: ความเร็ว (kt), L/D | 68, 9.0 | 67.8, 9.00 | 67.8, 9.00 |
| ผลข้างเคียง | – | T0 3,500 N, η 0.82 (มีความหมายทางกายภาพ) | T0 2,615 N, **η 1.30** (ไม่มีความหมายทางกายภาพ) |
| วิ่งขึ้น ground roll / ถึง 50 ft (m) | (POH) | 277 / 522 | 317 / 569 |

### 01.8.3 ข้อจำกัดของการ fit (ต้องบอกในบัตรทุกแบบ)

- **polar เดียวทุกสภาพแรงขับ**: polar จากการร่อนรวมแรงต้านใบพัดหมุนฟรี เมื่อใช้ polar นี้ตอนไต่ แรงต้านจะสูงไป จุด excess power สูงสุดจึงเลื่อนไปที่ความเร็วต่ำ ทำให้ Vy ของซิมต่ำกว่า POH ราว 8 kt ในตัวอย่าง (เครื่องจริง Vy > V best glide) ต้องเลือก: โหมด `static` (แรงขับสถิตและระยะวิ่งขึ้นสมจริง, Vy ผิด) หรือ `vy` (Vy ถูก แต่ T0 ต่ำ ground roll ยาวกว่าโหมด static 14 % และระยะถึง 50 ft ยาวกว่า 9 %, η เกิน 1) ข้อเสนอ: ใช้ `static` เพราะการฝึกของ AirfieldLab เน้น approach และลงจอด แล้วบันทึกค่า ROC ที่ Vy ของ POH ไว้เป็นการตรวจ
- **ไม่มีผลความหนาแน่น**: `thrustAvail` ไม่มี ρ ดังนั้นค่าที่ fit ที่ระดับน้ำทะเล ISA จะให้ ROC สูงไปในวันร้อนที่ VTBD (เทียบ §01.6: กำลังลด 4–7 % ที่ 35 °C) และที่ความสูง
- **CDgear ของล้อตายตัว = 0** (แรงต้านล้ออยู่ใน CD0) ค่า `AC.flaps` ของขั้นกลางเป็นไปตาม §01.1.2
- **ไม่มีรอบเครื่อง ใบพัด P-factor หรือแรงบิด** — ซิมรุ่นถัดไปต้องใช้ `piston.*` + `propeller.*` (§01.6–01.7) และเมื่อถึงตอนนั้นให้ fit polar ใหม่จากจุด cruise/climb ร่วมกับ CT/CP


## 01.9 ค่าพารามิเตอร์ (JSON)

บล็อกนี้เก็บค่าคงที่ของวิธีประมาณที่หัวข้ออื่นในรอบที่ 2 และรอบที่ 3 ใช้ร่วมกัน (ทุก leaf มี scope `sim`) ค่าในบัตรข้อมูลของแต่ละแบบเครื่องบินจะใช้แทนค่าเหล่านี้เสมอ สูตรเขียนเป็นสตริงเพื่ออ่านง่าย ตัวเลขที่ใช้จริงอยู่ในสคริปต์ `lm_*.mjs` ซึ่งต้องตรงกับบล็อกนี้ (ตรวจด้วย `lm_selftest.mjs`)

```json
{
  "common_light": {
    "methods": {
      "radii": {
        "v": {
          "single_prop": {
            "Rx": 0.257,
            "Ry": 0.357,
            "Rz": 0.404,
            "n": 4,
            "range": {"Rx": [0.225,0.29], "Ry": [0.324,0.4], "Rz": [0.364,0.456]}
          },
          "twin_prop": {
            "Rx": 0.544,
            "Ry": 0.29,
            "Rz": 0.673,
            "n": 1,
            "range": {"Rx": [0.544,0.544], "Ry": [0.29,0.29], "Rz": [0.673,0.673]}
          },
          "trainer_turboprop": {
            "Rx": 0.261,
            "Ry": 0.338,
            "Rz": 0.4,
            "n": 2,
            "range": {"Rx": [0.219,0.303], "Ry": [0.292,0.384], "Rz": [0.341,0.458]}
          }
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM15", "LM5", "LM6", "LM9", "LM7", "LM8"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ: รัศมีไจเรชันไร้มิติแบบ Roskam Part V (Ixx = m(b·Rx/2)², Iyy = m(L·Ry/2)², Izz = m(((b+L)/2)·Rz/2)²) หาย้อนจาก inertia ที่วัดจริง (TM-80163, FAA-RD-71-6/TN D-6643 Navion) และจากโมเดล JSBSim 1.3.3 (c172x, pa28, c310, pc7, t6texan2 ที่น้ำหนักรวมของไฟล์) แล้วเฉลี่ยตามกลุ่ม; leave-one-out ของ single_prop ผิด 0.4–42 % (TM-80163 +27/+29/+31 %, Navion Ixx +42 %); twin_prop มีแค่ C310 (ถังปลายปีก) ไม่เหมาะกับ DA42; range = ค่าต่ำสุด–สูงสุดของกลุ่ม; scripts/lm_inertia.mjs"
      },
      "stall_nz_at_vmin": {
        "v": {"nominal": 0.95, "range": [0.9,1]},
        "u": "-",
        "scope": "sim",
        "src": ["LM1", "LM2", "R1:V19"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ: nz ที่ความเร็วต่ำสุดของการ stall 1 kt/s ใช้แปลง POH stall speed (ซึ่งเป็นความเร็วต่ำสุด) เป็น V_1g: CLmax_1g = 2·m·g·nz/(ρ0·S·V²); ซิมรอบที่ 1 วัดได้ 0.949 (แฟลปลง) และ 0.985 (clean); 14 CFR 25.103 นิยาม V_SR = V_CLmax/√nz; AC 23-8C ให้ลดความเร็ว ≤ 1 kt/s"
      },
      "flap_map": {
        "v": {"default": "lift", "lift": "f = ΔCL0(detent)/ΔCL0(full)", "deflection": "f = δf/δf_full"},
        "u": "-",
        "scope": "sim",
        "src": ["LM0", "R1:V19"],
        "conf": "กลาง",
        "est": false,
        "note": "ซิมรับแฟลปเป็น f ∈ [0,1] ตัวเดียว (CLflap·f, CDflap·f^1.5, Cmflap·f, aStall + aStallFlap·f); lm_card แปลงขั้นแฟลปจริงเป็น f ตามสัดส่วน lift (ค่าเริ่ม) หรือตามมุม; ค่าเริ่ม lift เพราะทำให้ V_SR ทุกขั้นตรงกับ POH ได้"
      },
      "polar_sim_form": {
        "v": {
          "CL_offset": 0.15,
          "Ks": "1/(2·E·(CL*−0.15))",
          "CD0s": "Ks·(CL*² − 0.0225)",
          "CLstar": "√(CD0s/Ks + 0.0225)",
          "Emax": "1/(2·Ks·(CL*−0.15))"
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM0", "R1:V19"],
        "conf": "สูง",
        "est": false,
        "note": "ซิมใช้ CD = CD0 + K(CL−0.15)² (src/20-flight.js:185) ไม่ใช่ CD0 + K·CL²; การแปลงนี้คง (L/D)max = E และ CL ที่ best glide = CL* ของ polar พาราโบลาจริงไว้ (พีชคณิตจากนิยาม; ตรวจ T-LM-09); scripts/lm_polar.mjs toSimPolar"
      },
      "lm_card_defaults": {
        "v": {
          "eta": 0.8,
          "idle": 0.02,
          "figureOfMerit": 0.55,
          "gearStaticFrac": 0.3,
          "gearZeta": 0.6,
          "noseLoadFrac": 0.15,
          "strokeNose": 0.2,
          "strokeMain": 0.2,
          "VrefOverVs0": 1.3,
          "VappMinusVref": 5,
          "Ixz_over_Ixx": 0
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM0", "LM25", "R1:V19"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ: ค่าที่ lm_card ใช้เมื่อบัตรข้อมูลไม่มีข้อมูล เลือกจากช่วงทั่วไปของเครื่องเล็ก ไม่ได้ fit กับเครื่องลำใด: eta = ประสิทธิภาพใบพัดที่ความเร็วสูง (asymptote ของ thrustAvail) กลางช่วง 0.78–0.85 ของ §01.5.2/§01.7; idle = สัดส่วนแรงขับ idle ของลูกสูบใกล้ศูนย์ (เครื่องฝึกรอบที่ 1 ใช้ 0.045); figureOfMerit 0.55 = ขอบล่างของ FM 0.5–0.75 ของใบพัดจริง (T0 = (P·FM)^(2/3)·(2ρA)^(1/3)); gearStaticFrac 0.3 = ยุบตัวนิ่ง 30 % ของ stroke, gearZeta 0.6, noseLoadFrac 0.15 = ล้อหน้ารับ 15 % ของน้ำหนัก, stroke 0.20 m (สมมติฐานทางวิศวกรรม); VrefOverVs0 = 1.3 ตาม AFH ch.9 p. 9-3 (1.3 VSO เมื่อไม่มีค่าจากผู้ผลิต); VappMinusVref 5 kt; Ixz_over_Ixx 0; ทุกค่าที่บัตรให้มาจะใช้แทนและถูกติดธง default ใน --trace"
      },
      "derivs_defaults": {
        "v": {
          "clalpha": 5.969,
          "eta_h": 0.9,
          "etaV_fixed": null,
          "AvEffFactor": 1.55,
          "tauViscous": 0.85,
          "CmqWingFus": 1.1,
          "KnAileron": -0.2,
          "KiBody": {"high": 1.85, "mid": 1, "low": 1.5},
          "zwOverDf": {"high": -0.4, "mid": 0, "low": 0.4},
          "fusVolCoef": 0.55,
          "hhOverB": {"high": -0.05, "mid": 0.02, "low": 0.05},
          "tailconeDepth": 0.45
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM10", "LM11", "LM12", "LM13", "LM14"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ: ค่าคงที่ของ lm_derivs: clalpha = 0.95·2π /rad, eta_h 0.9 (q_tail/q), AvEffFactor 1.55 (อัตราส่วนกว้างยาวประสิทธิผลของ fin เหนือ stab แบบ DATCOM), tauViscous 0.85 (คูณ τ ของ thin-airfoil), CmqWingFus 1.1 (ส่วนของปีก+ลำตัวใน Cmq), KnAileron −0.2 (Cnda = Kn·CL·Clda), KiBody/zwOverDf/hhOverB ตามตำแหน่งปีก high/mid/low, fusVolCoef 0.55, tailconeDepth 0.45 m; อ่านจากแนวโน้มในตำรา/DATCOM แล้วเลือกให้ผลตรงชุดตรวจ 3 ชุด (median |err| ของชุดบินจริง 14.5 % หลังแก้ค่าอ้างอิง TM-80163 ในการตรวจทาน 2026-11-18)"
      },
      "derivs_accuracy": {
        "v": {
          "median_abs_err_pct_flight": 14.5,
          "median_abs_err_pct_all": 17.6,
          "wrong_signs_all": 0,
          "n": 46,
          "err_pct": {
            "CLalpha": {"c172class_TM80163": -1, "navion_TND6643_I": 13, "navion_TND6643_wt": 8},
            "Cmalpha": {"c172class_TM80163": -2, "navion_TND6643_I": 23, "navion_TND6643_wt": 0},
            "Cmq": {"c172class_TM80163": -17},
            "CLde": {"c172class_TM80163": -2, "navion_TND6643_I": -8, "navion_TND6643_wt": 17},
            "Cmde": {"c172class_TM80163": -3, "navion_TND6643_I": -8, "navion_TND6643_wt": -8},
            "CYb": {"c172class_TM80163": -20, "navion_TND6643_I": -23, "navion_TND6643_wt": -17},
            "Clb": {"c172class_TM80163": 7, "navion_TND6643_I": 12, "navion_TND6643_wt": 6},
            "Cnb": {"c172class_TM80163": -22, "navion_TND6643_I": -37, "navion_TND6643_wt": -35},
            "Clp": {"c172class_TM80163": 13, "navion_TND6643_I": -4, "navion_TND6643_wt": 15},
            "Cnr": {"c172class_TM80163": -28, "navion_TND6643_I": 14, "navion_TND6643_wt": -18},
            "Cndr": {"c172class_TM80163": 2, "navion_TND6643_I": -10, "navion_TND6643_wt": -19},
            "Clda": {"c172class_TM80163": 19, "navion_TND6643_I": 30, "navion_TND6643_wt": 49},
            "Cmq_plus_adot": {"navion_TND6643_I": -24, "navion_TND6643_wt": 20},
            "CYdr": {"navion_TND6643_I": -65, "navion_TND6643_wt": -25},
            "Clr": {"navion_TND6643_I": -28, "navion_TND6643_wt": -26},
            "Cldr": {"navion_TND6643_I": -62, "navion_TND6643_wt": -18},
            "Cnp": {"navion_TND6643_I": -5, "navion_TND6643_wt": -35},
            "Cnda": {"navion_TND6643_I": 127, "navion_TND6643_wt": 159}
          }
        },
        "u": "%",
        "scope": "sim",
        "src": ["LM5", "LM9", "LM6", "LM0"],
        "conf": "กลาง",
        "est": false,
        "note": "ความผิดพลาดของ lm_derivs เทียบ derivative จากการบินจริง (TM-80163 เครื่องปีกสูงคลาส C172: ตามยาว Table IV ML 40.7 m/s, lateral Table X linear fit ที่ CL 0.6; TN D-6643 Navion cond I flaps 0 (Table VII/XI) และชุดค่าอ้างอิงในรายงานเดียวกัน (Table XIII คอลัมน์ Reference 8, Table XIV)) err = (|est|/|ref| − 1)·100; ข้อมูลอ้างอิงอ่านจาก OCR และลำดับแถว lateral ของ TN D-6643 อนุมานเอง จึงให้ความเชื่อมั่นกลาง; ตรวจทาน 2026-11-18 แก้ Clda ของ TM-80163 เป็น 0.204 (= 2 × 0.102) จากเดิม 0.14 ที่อ่านผิดแถว; scripts/out/lm_derivs_validate.json"
      },
      "roll_lifting_line": {
        "v": {
          "Clp": "−clα·A/(8·(A + 2·clα/π))",
          "KLL": "1.5·A·(1+λ)/((A + 2·clα/π)·(1+3λ))",
          "applies_to": ["Clb_dihedral", "Clda"],
          "KLL_typical": 0.54
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM14", "LM0"],
        "conf": "กลาง",
        "est": true,
        "note": "ค่าประมาณ (วิธี): เทียบชุดตรวจ 3 ชุด strip theory ให้ Clp, Clβ และ Clda สูงไป 20–105 % (ใช้ CLα 3 มิติ) ถึง 33–175 % (ใช้ clα 2 มิติ); KLL คืออัตราส่วน lifting-line ต่อ strip theory ของปีกเรียว (Prandtl monoplane เทอม n = 2 ของปีกวงรี ตรวจพีชคณิตซ้ำในการตรวจทาน) ใช้คูณ Clβ ส่วน dihedral และ Clda; ปีก A 7.5 λ 0.7 ได้ KLL 0.546 ช่วง 0.50–0.60 ที่ A 6–7.5 λ 0.5–1"
      },
      "engine_lapse": {
        "v": {
          "gagg_ferrar": {"eq": "P/P0 = σ − (1−σ)/7.55", "k": 7.55},
          "ind_friction": {"eq": "P/Pr = (1+f)·(MAP/MAPr)·(N/Nr)·√(T0/T) − f·(N/Nr)²", "f": 0.1},
          "turbo_flat": {"eq": "P = Pr for σ ≥ σ_crit, else gagg_ferrar(σ/σ_crit)"}
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM16", "LM27", "LM17", "LM0"],
        "conf": "กลาง",
        "est": true,
        "note": "gagg_ferrar: สูตร Gagg & Farrar 1934 (ต้นฉบับ SAE 340096 ต้องซื้อ บทคัดย่อไม่ให้สูตร; รูปเทียบเท่า P/P0 = 1.132σ − 0.132 อยู่ใน Leishman [LM27] eq. 12); ind_friction: กำลัง indicated ∝ p/√T ตาม NACA R-190 และกำลังเสียดทานไม่ขึ้นกับอุณหภูมิ, f = 0.10 เป็นค่าประมาณ (สัดส่วนกำลังเสียดทานต่อกำลังเบรก) ให้ 0.741 ที่ 8,000 ft เทียบ Gagg–Farrar 0.758; turbo_flat: ค่าประมาณสำหรับเครื่องเทอร์โบที่รักษากำลังถึง crit_alt; scripts/lm_engine.mjs"
      },
      "fuel_density": {
        "v": {"avgas": 0.72, "jet": 0.8},
        "u": "kg/l",
        "scope": "sim",
        "src": ["LM4", "LM0"],
        "conf": "กลาง",
        "est": true,
        "note": "ค่าประมาณ: PHAK ch.10 p.10-5 ให้น้ำหนักมาตรฐาน AVGAS 6 lb/US gal (0.719 kg/l) และ Jet A/A-1 6.8 lb/US gal (0.815 kg/l); lm_engine ใช้ jet 0.80 (ค่ากลางที่ใช้กันทั่วไป ค่าประมาณ) BSFC ของ AE300 จึงต่ำกว่าใช้ 0.815 ราว 1.9 % (227 แทน 231 g/kWh); ใช้แปลง l/h ↔ kg/h"
      },
      "prop_bem_section": {
        "v": {
          "cla_per_rad": 5.655,
          "a0_deg": {"fixed_76x60": -3.5, "cs3_190": -3},
          "aStall_deg": [-10,14],
          "cd0": 0.01,
          "kcd": 0.012,
          "cl_mindrag": 0.4,
          "post_stall_cd": "1.9·sin²α",
          "blend_Mb_per_rad": 25,
          "rotational_delay": "Snel: Δcl = 3·(c/r)²·(cl_lin − cl) for |α| < 30°",
          "compressibility": "Prandtl–Glauert on cl, Ma ≤ 0.8",
          "chord_scale_fixed_76x60": 1.083
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM0", "R1:P10", "LM22", "LM24"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ: ข้อมูลหน้าตัดใบพัดของ lm_prop (BEM + Prandtl tip loss) เพราะรูปทรงใบจริงไม่เปิดเผย; คอร์ดของใบ fixed pitch 76×60 ถูกคูณ 1.083 ให้รอบสถิตเต็มคันเร่งเป็น 2,350 rpm (กลางช่วง 2,300–2,400 ของ EASA TCDS IM.A.051 172S C.6); ได้ T0 3,538 N (795 lbf), FM 0.664, η สูงสุด 0.849"
      },
      "legacy_fit": {
        "v": {
          "modes": ["static", "vy"],
          "default": "static",
          "polar_from": "POH best glide speed + ratio at idle (idle = 0)",
          "climb_from": "POH Vy + ROC",
          "known_bias_Vy_kt": -8,
          "known_bias_note": "single polar for all thrust states"
        },
        "u": "-",
        "scope": "sim",
        "src": ["LM0", "LM1"],
        "conf": "ต่ำ",
        "est": true,
        "note": "ค่าประมาณ (วิธี): หา CD0/K แบบซิมจาก best glide ของ POH, หา aStall/aStallFlap ให้ V_SR ตรง, หา T0 จากใบพัด (static) แล้ว fit Vc ให้ ROC ตรง; โหมด vy fit T0 และ Vc พร้อมกันให้ Vy ตรงแต่ได้ η > 1 (ไม่เป็นกายภาพ); ตัวอย่างสมมติ demo_light: Vy ของซิมต่ำกว่า POH 8 kt ในโหมด static"
      },
      "selftest_trainer": {
        "v": {
          "V_SR_kt": {"LDG": 71.86, "UP": 79.59},
          "Vy_kt": 128,
          "ROC_fpm": 3225,
          "LD": {"zero_thrust": 16.46, "idle": 21.73},
          "approach": {"SP": [2.221,0.578], "DR": [1.611,0.139], "tauR_s": 0.218, "spiral_t_half_s": 36.2},
          "cruise": {"SP": [3.593,0.56], "DR": [2.525,0.145]},
          "takeoff_m": {"ground_roll": 358, "to_50ft": 590},
          "V50_kt": 113.8,
          "landing_50ft_maxbrake_m": 714
        },
        "u": "-",
        "scope": "sim",
        "src": ["R1:V19", "LM0"],
        "conf": "สูง",
        "est": false,
        "note": "ผลของ lm_card กับ fixture trainer_r1 (AC ของ commit cabf0f0) ตรงกับค่าที่รอบที่ 1 เผยแพร่ทุกค่า ใช้เป็น regression baseline ของเครื่องมือ; ความเร็วเป็น KEAS (ias ของซิม = EAS); scripts/lm_selftest.mjs T-LM-01..07"
      }
    }
  }
}
```

## 01.10 กรณีทดสอบ

ทุกกรณีรันอัตโนมัติด้วย `node docs/research/02-light-aircraft/scripts/lm_selftest.mjs` (exit 1 ถ้ามีข้อใดไม่ผ่าน, `--json` ให้ผลเป็น JSON) ใช้เวลาประมาณ 2 s ผลรันล่าสุด 2026-11-18 กับ commit cabf0f0 (หลังการตรวจทาน): **49/49 ผ่าน** (24 รหัส) ค่าคาดหวังทุกค่าคำนวณด้วย Node ในสคริปต์ที่ระบุ ไม่ได้กรอกเอง ค่าความเร็วของซิมเป็น KEAS เพราะ "ias" ของซิมคือ EAS ส่วนการทดสอบที่ใช้บัตรข้อมูลจริงเป็น KCAS

| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-LM-01 | `buildAC(loadType('trainer_r1'))` | ฟิลด์ทั้ง 51 ของ `AC` เทียบ `src/20-flight.js:100–118` | เท่ากันทุกฟิลด์ | [R1:V19] `lm_selftest.mjs` | ผ่าน (51/51) |
| T-LM-02 | trainer_r1, 2,250 kg, 3,000 ft ISA, idle, ลดความเร็ว 1 kt/s ด้วยวง PI | $V_{SR}$ แฟลปลง+ล้อลง / clean | 71.9 ± 0.3 KEAS / 79.6 ± 0.3 KEAS | [R1:V19] 10-validation §10.0 | 71.86 / 79.59 |
| T-LM-03 | SL ISA เต็มกำลัง clean กวาด 2 kt | Vy, ROC สูงสุด | 128 ± 1 kt, 3,225 ± 15 fpm | [R1:V19] | 128 kt, 3,224.8 fpm |
| T-LM-04 | 3,000 ft clean แรงขับศูนย์ และ idle 0.045 | (L/D)max | 16.5 ± 0.1 และ 21.7 ± 0.1 | [R1:V19] | 16.46, 21.73 |
| T-LM-05 | approach 95 kt แฟลปลง ล้อลง 300 m γ −3° | short period ωn, ζ | 2.22 ± 0.02 rad/s, 0.58 ± 0.01 | [R1:V19] | 2.221, 0.578 |
| T-LM-06 | approach เหมือน T-LM-05 | Dutch roll ωn, ζ; roll mode τR | 1.61 ± 0.02 rad/s, 0.139 ± 0.003; 0.218 ± 0.005 s | [R1:V19] | 1.611, 0.1395; 0.218 |
| T-LM-07 | วิ่งขึ้น flaps 0 VR 82 θ 10° 3°/s; ลงจอดจาก approach เบรกเต็มหลังล้อหน้าแตะ | ระยะถึง 50 ft; ระยะจาก 50 ft ถึงหยุด | 590 ± 10 m; 714 ± 15 m | [R1:V19] | 590.0 m; 714.1 m |
| T-LM-08 | `clmaxFromStall` m 2,250 kg S 16.3 m² V 71.9 KCAS (1 g, ρ0 1.225); และ $V_{min}$ 68.4 kt กับ $n_z$ 0.949 | $C_{L\max,1g}$; $V_{1g}$ | 1.615 ± 0.01 (= 2mg/(ρ0 S V²)); 70.2 ± 0.3 kt (= 68.4/√0.949) | [LM2] [LM1] `lm_polar.mjs` | 1.615; 70.21 (สูตร; ซิมวัดได้ CLmax 1.617 ที่ α 11.5°) |
| T-LM-09 | polar พาราโบลา CD0 0.030 K 0.050 → `toSimPolar` → ใส่ซิมแล้วบินร่อนแรงขับศูนย์ | L/D, $C_L$ ที่ best glide, CD0 ที่ `polarFromGlide` หาย้อน | 12.91 ± 0.05; 0.775 ± 0.01; 0.030 ± 0.0005 | [LM0] พีชคณิต §01.5 | 12.91; 0.777; 0.0301 |
| T-LM-10 | `lm_derivs` กับรูปทรงของเครื่องคลาส C172 (TM-80163) และ Navion cond I (TN D-6643) | ความผิดพลาดของ $C_{L_\alpha}$ เทียบการบินจริง | 0 ± 15 % ทั้งสองชุด | [LM5] [LM9] | −1.4 %, +13.2 % |
| T-LM-11 | 3 ชุดตรวจ 46 derivative | จำนวน derivative ที่เครื่องหมายผิด | 0 ± 0 | [LM5] [LM9] [LM6] | 0 |
| T-LM-12 | ชุดการบินจริง 2 ชุด (29 ค่า) | ค่ามัธยฐานของ \|ความผิดพลาด\| | 20 ± 15 % (คือ 5–35 %) | [LM5] [LM9] | 14.5 % (16.4 % ก่อนแก้ค่าอ้างอิง TM-80163) |
| T-LM-13 | `inertiaFromRadii` กับรัศมีของ TM-80163 เอง (m 837.93 kg, b 11.0 m, L 8.2 m); ทำนาย TM-80163 จากค่าเฉลี่ยของอีก 3 ลำในกลุ่ม single_prop (leave-one-out) | Ixx ไปกลับ; ความผิดพลาดสูงสุดของ Ixx/Iyy/Izz ของ TM-80163 | 1,395 ± 0.5 kg m² (Table I); 0 ± 35 % | [LM5] [LM15] `lm_inertia.mjs` | 1,395; 31.0 % |
| T-LM-14 | 8,000 ft ISA เต็มคันเร่ง; SL ISA | P/P0 Gagg–Farrar; ind_friction (f 0.10); ind_friction ที่ SL | 0.7577 ± 0.001; 0.7406 ± 0.001; 1 ± 1e−9 | [LM16] [LM17] `lm_engine.mjs` | 0.7577; 0.7405; 1 (สูตร) |
| T-LM-15 | AE300 อัตราสิ้นเปลือง 35 / 19 l/h ที่ 100 / 60 % ของ 123.5 kW, Jet A-1 0.80 kg/l | BSFC | 226.7 ± 1; 205.1 ± 1 g/kWh | [LM19] [LM4] | 226.7; 205.1 (สูตร) |
| T-LM-16 | VTBD 3 m (9 ft) OAT 35 °C (ISA+20) คันเร่งเต็ม | P/P0 Gagg–Farrar | 0.9262 ± 0.002 (σ 0.9348) | [LM16] [LM27] `lm_engine.mjs` | 0.9262 (ซิมวันนี้ไม่มีกำลังลดตามความหนาแน่น: 1.00) |
| T-LM-17 | ใบพัด fixed 76×60 เต็มกำลัง 180 hp SL ISA จอดนิ่ง | รอบสถิตก่อนปรับคอร์ด; ตัวคูณคอร์ดให้ 2,350 rpm; รอบสถิตจาก CP0 ของ JSBSim `prop_75in2f`; รอบที่ 35 °C ลบ ISA | 2,350 ± 118 rpm (TCDS 2,300–2,400); 1.08 ± 0.03; 2,245 ± 15 rpm; +35 ± 15 rpm | [LM22] [LM8] `lm_prop.mjs` | 2,463; 1.083; 2,245; +34.6 (สูตร) |
| T-LM-18 | ใบพัดเดียวกันหลังปรับคอร์ด SL ISA; ใบพัด 3 ใบ 1.90 m 123.5 kW 2,300 rpm จอดนิ่ง | figure of merit; η สูงสุด (J 0.5–0.85); แรงขับสถิต | 0.66 ± 0.03; 0.849 ± 0.03; 3,500 ± 500 N (ช่วงทางกายภาพ FM 0.55–0.75) | [LM0] [R1:P10] `lm_prop.mjs` | 0.664; 0.849; 3,450 N (ซิมวันนี้ใช้ T0 คงที่ 11.5 kN ของเครื่องฝึก) |
| T-LM-19 | `legacyFit` บัตรสมมติ demo_light (POH ความเร็วต่ำสุด 48 / 42 KCAS) | $V_{SR}$ clean / แฟลปสุดของซิมหลัง fit | 49.2 ± 1 / 43.1 ± 1 KCAS | [LM0] [LM1] | 49.2 / 43.1 |
| T-LM-20 | บัตรเดียวกัน, โหมด static และโหมด vy | ROC สูงสุด; Vy (static, ข้อจำกัดที่รู้); Vy (vy) | 730 ± 40 fpm; 66 ± 2 kt; 74 ± 2 kt | [LM0] | 745 fpm; 65.8 kt; 73.5 kt |
| T-LM-21 | บัตรเดียวกัน ร่อน idle = 0 | L/D; ความเร็ว best glide | 9.0 ± 0.15; 68 ± 2 kt | [LM0] | 9.00; 67.8 kt |
| T-LM-22 | อ่านบล็อก `common_light.methods` จากรายงานนี้ด้วย `mergeDir` | จำนวนค่าที่ไม่ตรงค่าคงที่ในสคริปต์ (`RADII`, `DEFAULTS` ×2, `FUEL_DENSITY`, ค่าคงที่ lapse) | 0 ± 0 | [LM0] | 0 |
| T-LM-23 | `lm_merge` เฉพาะ `common_light` ทั้งโฟลเดอร์ | ERRORS + CONFLICTS | 0 ± 0 | [LM0] | 0 |
| T-LM-24 | (ก) `node lm_derivs.mjs trainer_r1` (fixture ไม่มี `airframe.tail.*`); (ข) `node lm_polar.mjs --selftest` จาก root ของ repo | (ก) exit code 1 และข้อความระบุ `airframe.tail.S_h`; (ข) L/D ร่อนแรงขับศูนย์ของ trainer_r1 ที่พิมพ์ออกมา | (ก) ผ่าน = 1 ± 0; (ข) 16.46 ± 0.05 | [LM0] [R1:V19] (เพิ่มในการตรวจทาน) | 1; 16.458 |

หมายเหตุ T-LM-12: tolerance กว้างโดยตั้งใจ จุดประสงค์คือจับการถดถอย (ถ้ามีใครแก้สูตรแล้วค่ามัธยฐานเกิน 35 % การทดสอบจะล้ม) ไม่ได้อ้างว่าความแม่นยำ 16 % ใช้ได้กับทุกแบบ T-LM-19 ถึง T-LM-21 ใช้บัตรตัวเลขสมมติ (`DEMO.demo_light` ใน `lm_legacy_fit.mjs`) เพื่อทดสอบเครื่องมือเท่านั้น ไม่ใช่ข้อมูลของเครื่องบินจริง เมื่อหัวข้อ 03–07 ทำบัตรของแบบจริงเสร็จแล้ว ควรเพิ่มกรณีแบบเดียวกันต่อแบบ (ดู §01.13)

## 01.11 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด

### 01.11.1 แหล่งข้อมูลขัดกัน

| เรื่อง | แหล่ง A | แหล่ง B | ข้อตัดสินในหัวข้อนี้ |
|---|---|---|---|
| กำลังของ IO-360-L2A | EASA TCDS เครื่องยนต์ IM.E.032 p. 12 [LM21]: take-off และ MCP 119 kW (160 hp) ที่ 2,400 rpm และ "alternate rating" 134 kW (180 hp) ที่ 2,700 rpm (อ่านตามลำดับคอลัมน์ของ PDF) | EASA TCDS เครื่องบิน IM.A.051 Section 2 (172S) C.5 p. 18 [LM22]: "Rated at 180 hp", 2,700 rpm ทุกการใช้งาน | ไม่ขัดกันจริง: C172S ใช้พิกัด alternate 180 hp / 2,700 rpm ของ TCDS เครื่องยนต์ บัตรของ C172S ใช้ 180 hp / 2,700 rpm (ความเชื่อมั่นสูง) ตัวอย่างเครื่องยนต์ใน §01.6 ใช้ค่านี้ |
| รอบสถิตของใบพัด 75–76 in | TCDS 172S C.6 [LM22]: 2,300–2,400 rpm เต็มคันเร่ง | ตาราง CP ของ JSBSim `prop_75in2f` [LM8]: CP0 0.066 ให้ 2,245 rpm และ CT0 0.073 ให้ FM 0.24 (ต่ำเกินจริงสำหรับใบพัดโลหะ) | ใช้ BEM ของ `lm_prop` ที่ปรับคอร์ดให้ได้ 2,350 rpm (FM 0.66) ไม่ใช้ตาราง JSBSim เป็นค่าอ้างอิงของใบพัดนี้ (T-LM-17) |
| CLα ของ Navion | FAA-RD-71-6 Table III [LM6]: flight 6.04, wind tunnel 4.52, DATCOM 5.50, Etkin 4.25 /rad (OCR สลับคอลัมน์ ความเชื่อมั่นกลาง) | TN D-6643 [LM9] flight cond I: $C_{Z_\alpha}$ −4.33 /rad (แกน body จึงได้ CLα ≈ −C_Zα − C_D ≈ 4.3) | ใช้ TN D-6643 เป็นชุดตรวจหลัก (ตารางอ่านง่ายกว่าและเป็นรายงาน NASA ที่ตีพิมพ์ทีหลัง) แต่รายงานว่า `lm_derivs` ผิด +13 % เทียบ TN D-6643 และ −19 % เทียบ flight ของ FAA-RD-71-6 |
| CYδr ของ Navion | TN D-6643 flight flaps 0: 0.33 | คอลัมน์อ้างอิงในรายงานเดียวกัน: 0.157 | ต่างกันสองเท่า น่าจะเป็นปัญหาการระบุค่าจากการบิน `lm_derivs` ได้ 0.117 (ใกล้ค่าอ้างอิง) จึงไม่นับ CYδr เป็นหลักฐานว่าสูตรผิด |
| สูตรลดกำลังตามความสูง | Gagg & Farrar [LM16]: P/P0 = σ − (1−σ)/7.55 (ขึ้นกับความหนาแน่นอย่างเดียว) | NACA R-190 [LM17]: กำลัง indicated ∝ p/√T กำลังเสียดทานไม่ขึ้นกับอุณหภูมิ | ที่ 8,000 ft ISA ต่างกันแค่ 2 % (0.758 กับ 0.741) แต่วันร้อน VTBD 35 °C ต่างกัน 4 % (0.926 กับ 0.963) เพราะเลขชี้กำลังของอุณหภูมิเป็น 1 กับ 0.5 แนะนำ `ind_friction` เมื่อมี ISA deviation และ `gagg_ferrar` เมื่อไม่มีข้อมูล friction (ความเชื่อมั่นกลาง) |
| ความหนาแน่นน้ำมัน Jet A-1 | PHAK ch.10 p. 10-5 [LM4]: 6.8 lb/US gal = 0.815 kg/l | ค่ากลางที่ใช้ใน `lm_engine`: 0.80 kg/l (ค่าประมาณ) | BSFC ของ AE300 ต่างกัน 1.9 % (227 กับ 231 g/kWh) อยู่ในความไม่แน่นอนของ factsheet อยู่แล้ว คงไว้ 0.80 และบอกค่า 0.815 ไว้ใน note ของ JSON |
| นิยาม δa ของ TM-80163 | รายงานใช้ δa = มุมซ้าย − มุมขวา และ Clδa เป็นลบ (Table X ที่ $C_L$ 0.6: −0.102) [LM5] | schema-ext-r2 §5 ใช้มุมเฉลี่ย, da+ = ม้วนขวา | คูณ Clδa ของรายงาน −2 เท่าเป็น +0.204 ก่อนเทียบ (บันทึกใน `VALIDATION` ของ `lm_derivs.mjs`; ฉบับก่อนการตรวจทานใช้ 0.070 ที่เป็นค่า Clβ จึงได้ 0.14 ผิด) |
| ทิศ adverse yaw ของ aileron (Cnδa) | TM-80163 [LM5] Table X: Cnδa −0.003 ถึง −0.005 ในเครื่องหมายเดียวกับ Clδa ลบ = **proverse yaw** (รายงานเรียก "apparent proverse yaw" และบอกว่าสัมพันธ์กับ Cnp 0.95) | TN D-6643 [LM9]: Cnδa −0.004 กับ Clδa +0.154 = adverse yaw; `lm_derivs` ใช้ $K_n$ −0.20 (adverse) | ทิศของ Cnδa ของเครื่องที่ใช้ aileron แบบ Frise ยังไม่แน่นอน ค่าเล็ก (|Cnδa| < 0.01) ไม่นับ Cnδa ของ TM-80163 ในสถิติ และให้ความเชื่อมั่น "ต่ำ" กับ Cnδa ทุกแบบ |
| ชนิดพื้นบังคับตามยาวของเครื่องใน TM-80163 | รายการสัญลักษณ์ [LM5]: "stabilator deflection, positive trailing edge down" | Table II ของรายงานเดียวกัน: "Elevator position" ช่วง +25° ถึง −29° | ยังสรุปไม่ได้ ชุดตรวจใช้ elevator chord ratio 0.42 (ค่าประมาณ) ซึ่งให้ CLδe/Cmδe ตรงภายใน 3 % ถ้าเป็น stabilator ค่าประมาณจะสูงไปราว 60 % จึงไม่ใช้ผลนี้เป็นหลักฐานว่าสูตร elevator แม่น |

### 01.11.2 ข้อจำกัดของวิธีและเครื่องมือ

1. **ซิมวันนี้ไม่มีความหนาแน่นในแรงขับ** (`thrustAvail` = $T_0V_c/\sqrt{V^2+V_c^2}$) ROC และระยะวิ่งขึ้นจึงไม่เปลี่ยนตามความสูงหรืออุณหภูมิ `lm_card` วัด climb ที่ SL เท่านั้น ผลวันร้อน (T-LM-16) ใช้ได้เมื่อโค้ดเพิ่ม lapse แล้ว
2. **polar เดียวทุกสภาวะแรงขับ** ซิมไม่มี slipstream บน CL/CD ดังนั้นเมื่อ fit polar จาก glide ของ POH (idle) แล้ว Vy ของซิมต่ำกว่า POH ราว 8 kt (ตัวอย่าง demo_light 65.8 กับ 74 kt) โหมด `vy` แก้ Vy ได้แต่ต้องใช้ η 1.30 ซึ่งไม่เป็นกายภาพ ทั้งสองโหมดเป็นการประนีประนอม (T-LM-20)
3. **แฟลปเป็นตัวแปรเดียว f** ทำให้ CD ของขั้นกลางเป็น $C_{D,flap}f^{1.5}$ ตายตัว ตั้ง f ตามสัดส่วนแรงยกได้ V_SR ทุกขั้นตรง แต่ drag และ pitching moment ของขั้นกลางเป็นค่าประมาณ
4. **ความเร็วในซิมเป็น EAS** POH ให้ KIAS ส่วน `lm_card` แปลง KIAS → KCAS ด้วย `speeds.ias_cas` แล้วถือว่า KCAS ≈ KEAS (ผิดไม่เกิน 0.13 kt ที่ ≤ 100 kt และ ≤ 10,000 ft; ที่ 200 kt ผิด 0.26 kt ที่ 3,000 ft และ 1.0 kt ที่ 10,000 ft ซึ่งเกี่ยวกับ cruise ของเครื่องฝึก turboprop)
5. **ความเร็ว stall ใน POH** มักเป็นความเร็วต่ำสุดที่ CG หน้าสุด จึงต้องใช้ $n_z$ ที่ $V_{min}$ (ค่าประมาณ 0.95, ช่วง 0.90–1.00) และแก้ CG ช่วง $n_z$ อย่างเดียวทำให้ CLmax ไม่แน่นอน ±5 % และความเร็วใน POH ที่ปัดทีละ 1–2 kt เพิ่มอีกราว ±6 % ที่ 48 kt (ค่าประมาณ: $\Delta C_L/C_L = 2\Delta V/V$)
6. **`lm_derivs` ปรับค่าคงที่กับข้อมูลเพียง 3 ชุด** (เครื่องปีกสูงคลาส C172 และ Navion ปีกต่ำ) ยังไม่มีชุดตรวจของหาง T (DA40, DA42) ปีกเรียวมาก หรือเครื่องฝึก turboprop จึงให้ความเชื่อมั่นไม่เกิน "กลาง" สำหรับตามยาว และ "ต่ำ" สำหรับ Cnβ, Cnr, Clδa, Cnδa และ rudder derivative
7. **ข้อมูลอ้างอิงอ่านจาก OCR** ลำดับแถว lateral ของ TN D-6643 Table XI/XIII อนุมานจากการเทียบคอลัมน์อ้างอิงกับชุด Navion ที่ตำราใช้ [LM13], คอลัมน์ $C_L$ 0.6 ของ TM-80163 Table X อนุมานจากจำนวนตัวเลขในแถว (แถวที่มี 5 ตัวถือว่า 3 ตัวท้ายเป็นค่า fit ที่ $C_L$ 0.3/0.6/1.0) และ Iyy ของ TM-80163 อ่านจาก "lk80" เป็น 1,480 kg m² ส่วน Cmq + Cmα̇ จากการบินของ Navion (−24.6) มี Cmq ที่ถูกตรึงไว้ −6.5 ระหว่าง extract [LM9] ชุดตรวจจึงมีความเชื่อมั่นกลาง เอกสารของ Teper [LM26] มีหน้า Navion แต่ไม่มีชั้นข้อความ จึงไม่ได้ใช้
8. **รัศมีไจเรชัน** ไม่ได้เปิดตารางใน Roskam Part V [LM15] เอง จึงหาย้อนจาก 7 ลำ (2 ลำวัดจริง 5 ลำจากโมเดล JSBSim ซึ่งไม่ระบุที่มาของ inertia) leave-one-out ผิดถึง 42 % (ส่วนใหญ่ Ixx) และกลุ่ม twin มีแค่ C310 ที่มีถังปลายปีก ไม่ควรใช้กับ DA42 โดยไม่ตรวจซ้ำ
9. **ใบพัด** รูปทรงใบจริงของ McCauley และ MT ไม่เปิดเผย คอร์ดและหน้าตัดเป็นค่าประมาณ ปรับเทียบด้วยรอบสถิตจุดเดียว ข้อมูลของ NACA TR-640 [LM24] มีแต่กราฟ จึงไม่ได้ใช้ตรวจเชิงตัวเลข
10. **เครื่องยนต์** Lycoming ไม่เผยแพร่ BSFC เป็นตัวเลข (SI 1094D [LM18] ให้แค่วิธี leaning) ตาราง FADEC ของ AE300 และความสูงวิกฤตของเทอร์โบยังไม่มีแหล่งสาธารณะ factsheet [LM19] ระบุว่าเป็นข้อมูลประกอบ ไม่ผูกพัน สูตร Gagg–Farrar อ้างจากแหล่งทุติยภูมิ [LM27] เพราะต้นฉบับ SAE ต้องซื้อ
11. **AC 23-8C** (ส่วนเครื่อง turbojet) บอกว่าถ้าความเร็ว stall ที่ idle กับที่แรงขับศูนย์ต่างกันไม่เกิน 0.5 kt ถือว่าไม่มีนัยสำคัญ [LM1, p. 20] และเครื่องลูกสูบทดสอบ stall ที่ "engines idling with throttles closed" [LM1, p. 16] ส่วนซิมของรอบที่ 1 มี idle 0.045 ของแรงขับเต็ม ทำให้ L/D ต่างกันถึง 16.5 กับ 21.7 ซึ่งเกินผลของ idle ในเครื่องจริงมาก ค่า idle ของเครื่องลูกสูบในบัตรรอบที่ 2 จึงควรใกล้ 0 (legacy fit ใช้ 0)

## 01.12 แหล่งอ้างอิง

รูปแบบ: [รหัส] ชื่อเอกสาร, ผู้แต่ง/หน่วยงาน, ปี, URL — ประเภท · สัญญาอนุญาต/สถานะ · สิ่งที่ AirfieldLab ทำได้

0. [LM0] AirfieldLab research round 2, สคริปต์ของหัวข้อนี้ `scripts/lm_lib.mjs`, `lm_merge.mjs`, `lm_card.mjs`, `lm_fixture_trainer_r1.mjs`, `lm_selftest.mjs`, `lm_derivs.mjs`, `lm_inertia.mjs`, `lm_jsb_inertia.py`, `lm_polar.mjs`, `lm_engine.mjs`, `lm_prop.mjs`, `lm_legacy_fit.mjs` และผลใน `scripts/out/lm_*` (2026-11-18) — งานของโครงการเอง · repo ยังไม่มี LICENSE (เจ้าของเลือกเอง) · ใช้ แก้ และย้ายเข้า repo ได้ทั้งหมด
1. [LM1] FAA, Advisory Circular AC 23-8C, *Flight Test Guide for Certification of Part 23 Airplanes*, 16 November 2011, https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_23-8C.pdf (อ้าง p. 15 นิยาม VS เป็นความเร็วต่ำสุดขณะคันชนสต็อปอย่างน้อย 2 s และความเร็ว stall เป็น CAS, p. 16 idle throttles closed, p. 20 idle กับแรงขับศูนย์ของ turbojet, p. 22 อัตราลด ≤ 1 kt/s และแก้น้ำหนัก $V_S\sqrt{W_S/W_T}$) — ปฐมภูมิ (เอกสารแนะนำของหน่วยงานรับรอง) · งานรัฐบาลสหรัฐฯ public domain · อ้างและคัดลอกข้อความได้
2. [LM2] 14 CFR §25.103 *Stall speed* (a) นิยาม $V_{SR} \ge V_{CLMAX}/\sqrt{n_{zw}}$ เป็น CAS และ (c) อัตราลดความเร็วไม่เกิน 1 kt/s, eCFR, https://www.ecfr.gov/current/title-14/section-25.103 (สำเนาที่ตรวจได้: https://www.law.cornell.edu/cfr/text/14/25.103) — ปฐมภูมิ (กฎหมาย) · public domain · อ้างและคัดลอกได้ (ใช้เฉพาะนิยาม $V_{SR} = V_{C_{L\max}}/\sqrt{n_z}$)
3. [LM3] 14 CFR Part 23 (ฉบับปัจจุบันหลัง Amendment 23-64 §23.2110 *Stall speed*; ฉบับเดิม §23.49 และ §23.201 นิยามการทดสอบ stall), eCFR, https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-23 ; ฉบับเดิม (CFR 2011 edition, Title 14 Vol. 1 Part 23) https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-part23.pdf p. 200–201 (§23.49(a): "VSO and VS1 are the stalling speeds or the minimum steady flight speeds, in knots (CAS)" ที่เครื่องลูกสูบ idle throttle ปิด) — ปฐมภูมิ · public domain · อ้างและคัดลอกได้ (ผู้ตรวจทานเปิด §23.49 ฉบับ 2011 แล้ว; ข้อความ §23.201 ยังไม่ได้เปิด)
4. [LM4] FAA, *Pilot's Handbook of Aeronautical Knowledge*, FAA-H-8083-25 (ไฟล์บทที่ 10 บน faa.gov ไม่ระบุว่าเป็นฉบับ B หรือ C), Chapter 10 "Weight and Balance", p. 10-5 (AVGAS 6 lb/US gal, Jet A/A-1 6.8 lb/US gal), 10-7, https://www.faa.gov/sites/faa.gov/files/12_phak_ch10.pdf — ปฐมภูมิ (คู่มือทางการ) · public domain · อ้างและคัดลอกได้
5. [LM5] W. T. Suit, R. L. Cannaday, *Comparison of Stability and Control Parameters for a Light, Single-Engine, High-Winged Aircraft Using Different Flight Test and Parameter Estimation Techniques*, NASA TM-80163, NASA Langley, September 1979, https://ntrs.nasa.gov/api/citations/19800001985/downloads/19800001985.pdf (รายการสัญลักษณ์ δa/δe/δr; Table I มวลและ inertia; Table IV ML ตามยาวที่ 31.6/40.7/54.2 m/s; Table VII ML lateral รายเคส; Table X เทียบ lateral กับ linear fit ที่ $C_L$ 0.3/0.6/1.0; ข้อความเป็น OCR) — ปฐมภูมิ (ข้อมูลการบินทดสอบ) · งาน NASA public domain ในสหรัฐฯ · คัดลอกตัวเลขและตารางได้พร้อมอ้างอิง
6. [LM6] E. Seckel, J. J. Morris, *The Stability Derivatives of the Navion Aircraft Estimated by Various Methods and Derived from Flight Test Data*, FAA-RD-71-6 (Princeton Univ. Report 923), January 1971, DTIC AD0723779, https://apps.dtic.mil/sti/pdfs/AD0723779.pdf (Table I p. 4–5, inertia p. 7 และ 14, Table III p. 22, ข้อสรุป p. 18: Cmα̇ + Cmq ต่ำไปราว 20 %, Clβ เกินราว 50 % ในสองตำรา, Cnr เกินราว 50 %) — ปฐมภูมิ (รายงานผู้รับจ้างของ FAA) · เผยแพร่สาธารณะผ่าน DTIC สถานะลิขสิทธิ์ของรายงานผู้รับจ้างไม่ได้ระบุ · อ้างตัวเลขได้ ไม่คัดลอกตารางทั้งตาราง
7. [LM7] Wikipedia, "Navion" (ข้อมูลจำเพาะอ้าง Jane's All the World's Aircraft 1951–52), เปิดอ่าน 2026-11-18, https://en.wikipedia.org/wiki/North_American_Navion — ทุติยภูมิ · CC BY-SA 4.0 · อ้างตัวเลขได้ (ใช้แค่ความยาว 27 ft 6 in) ถ้าคัดลอกข้อความต้องให้เครดิตและใช้สัญญาเดียวกัน
8. [LM8] JSBSim Team, JSBSim 1.3.3 (Python package บน PyPI) และไฟล์แบบจำลองที่มากับแพ็กเกจ `aircraft/{c172x,pa28,c310,pc7,t6texan2}` และ `engine/prop_75in2f.xml`, https://pypi.org/project/jsbsim/1.3.3/ , https://github.com/JSBSim-Team/jsbsim — โมเดลเปิด (ทุติยภูมิ) · ซอฟต์แวร์ LGPL-2.1; header ของไฟล์ `c172x.xml` และ `c310.xml` ระบุ GPL ส่วน `pa28.xml`, `pc7.xml`, `t6texan2.xml`, `prop_75in2f.xml` ไม่ระบุสัญญา · ใช้รันออฟไลน์และอ้างตัวเลขที่อ่านหรือวัดได้ (inertia, CP0) ตัวเลขที่วัดจากการรันเป็นของเรา ห้ามคัดลอก XML หรือโค้ดเข้า repo
9. [LM9] W. T. Suit, *Aerodynamic Parameters of the Navion Airplane Extracted from Flight Data*, NASA TN D-6643 (L-7910), March 1972, https://ntrs.nasa.gov/api/citations/19720011369/downloads/19720011369.pdf (Table I p. 20, Table II p. 21, Table VII p. 26, Table XI–XIV p. 30–33) — ปฐมภูมิ · NASA public domain ในสหรัฐฯ · คัดลอกตัวเลขได้พร้อมอ้างอิง
10. [LM10] D. E. Hoak และคณะ, *USAF Stability and Control DATCOM*, รายงานของรัฐบาลสหรัฐฯ, 1960 (ปรับปรุงถึง 1978); ภาพรวม https://en.wikipedia.org/wiki/USAF_Stability_and_Control_DATCOM ; J. E. Williams และคณะ (McDonnell Douglas Astronautics Co.), *The USAF Stability and Control Digital DATCOM, Volume II: Implementation of Datcom Methods*, AFFDL-TR-79-3032 Vol. II, April 1979, https://apps.dtic.mil/sti/pdfs/ADA086558.pdf ("Approved for public release; distribution unlimited"; เลขหัวข้อ 4.1.3.2, 4.4.1, 5.x ในตาราง 01.3-1 เป็นเลขหัวข้อของ DATCOM ฉบับพิมพ์ ไม่ใช่ของเล่มนี้) — ปฐมภูมิ (วิธีมาตรฐาน) · งานรัฐบาลสหรัฐฯ เผยแพร่สาธารณะ · อ้างและนำสูตรไปใช้ได้ (หัวข้อนี้เขียนสูตรใหม่ ไม่คัดลอกโค้ด Digital DATCOM)
11. [LM11] J. Roskam, *Airplane Design Part VI: Preliminary Calculation of Aerodynamic, Thrust and Power Characteristics*, DARcorporation, ISBN 978-1-884885-52-5, https://catalogo.bibliotecas.unlp.edu.ar/Record/dfi.9845 — ตำรา · © DARcorporation · อ้างวิธีและสูตรได้ ไม่คัดลอกข้อความ ตาราง หรือรูป
12. [LM12] D. P. Raymer, *Aircraft Design: A Conceptual Approach*, 6th ed., AIAA, 2018, ISBN 978-1-62410-490-9, https://search.worldcat.org/title/1048659355 (หรือ https://blackwells.co.uk/bookshop/product/Aircraft-Design-by-Daniel-P-Raymer/9781624104909 ) — ตำรา · © AIAA · อ้างวิธีและสูตรได้ (ใช้ Cmα และ Cnβ ของลำตัว) ไม่คัดลอกตารางหรือรูป
13. [LM13] R. C. Nelson, *Flight Stability and Automatic Control*, 2nd ed., McGraw-Hill, 1998, ISBN 978-0-07-046273-1, https://www.schweitzer-online.de/en/buch/Nelson/Flight-Stability-Automatic-Control/9780070462731/A428230/ — ตำรา · © McGraw-Hill · อ้างสูตร tail volume และชุดข้อมูล Navion ได้ ไม่คัดลอกข้อความ
14. [LM14] B. Etkin, L. D. Reid, *Dynamics of Flight: Stability and Control*, 3rd ed., Wiley, 1996, ISBN 0-471-03418-5, https://gov.wiley.com/WileyCDA/WileyTitle/productCd-0471034185.html (การแปลงแกน stability ↔ body และทฤษฎี lifting line) — ตำรา · © Wiley · อ้างสูตรได้ ไม่คัดลอกข้อความ
15. [LM15] J. Roskam, *Airplane Design Part V: Component Weight Estimation* (บทที่ 10 ตารางรัศมีไจเรชันไร้มิติ), DARcorporation, ISBN 978-1-884885-50-1; สูตรนิยามตามที่ schema-ext-r2 §5 อ้าง ผู้วิจัยไม่ได้เปิดตารางต้นฉบับ, ข้อมูลผู้พิมพ์ https://www.darcorp.com/wp-content/uploads/2019/05/AAA-Brochure-1.pdf — ตำรา · © DARcorporation · อ้างนิยามได้ ตัวเลขในหัวข้อนี้หาเองจาก [LM5][LM6][LM9][LM8]
16. [LM16] R. F. Gagg, E. V. Farrar, *Altitude Performance of Aircraft Engines Equipped with Gear-Driven Superchargers*, SAE Technical Paper 340096, 1934, https://saemobilus.sae.org/papers/altitude-performance-aircraft-engines-equipped-gear-driven-superchargers-340096 — ปฐมภูมิแต่ต้องซื้อ (สูตรอ้างจากแหล่งทุติยภูมิที่อ้างต่อกันมา) · © SAE · อ้างสูตรได้ ไม่คัดลอกเอกสาร
17. [LM17] S. W. Sparrow (Bureau of Standards), *Correcting Horsepower Measurements to a Standard Temperature*, NACA Report No. 190 (ราว 1924; ปีไม่ปรากฏในข้อความที่อ่าน), https://digital.library.unt.edu/ark:/67531/metadc65841/m2/1/high_res_d/19930091256.pdf (p. 125 สรุป: กำลัง indicated แปรผกผันกับรากที่สองของอุณหภูมิสัมบูรณ์ของอากาศเข้าคาร์บูเรเตอร์; p. 134: กำลังเสียดทานไม่เปลี่ยนตามอุณหภูมิอากาศ; p. 136: ใช้ได้เมื่อตั้งส่วนผสมเท่าเดิมหรือ max-power, ช่วง −40 ถึง +60 °C) — ปฐมภูมิ · งาน NACA public domain ในสหรัฐฯ · อ้างและคัดลอกได้
18. [LM18] Textron Lycoming, Service Instruction No. 1094D *Fuel Mixture Leaning Procedures*, 25 March 1994, https://www.lycoming.com/sites/default/files/attachments/Fuel%2520Mixture%2520Leaning%2520Procedures.pdf — ปฐมภูมิ (เอกสารผู้ผลิต) · © Lycoming · อ้างข้อเท็จจริงพร้อมหน้าได้ ไม่คัดลอกข้อความหรือขั้นตอน
19. [LM19] Austro Engine / Diamond Aircraft, *AE300 (E4 series) factsheet*, พฤษภาคม 2024 ("illustrative, non-binding"), https://diamondaircraft.com/fileadmin/diamondaircraft/products/austro-engine/AE_E4_Series_Factsheet_screen.pdf — เอกสารผู้ผลิต · © Austro Engine / Diamond · อ้างตัวเลขพร้อมที่มาได้ ไม่คัดลอกเอกสารหรือรูป
20. [LM20] Wikipedia/Wikiwand, "Austro Engine E4", เปิดอ่าน 2026-11-18, https://www.wikiwand.com/en/articles/Austro_Engine_E4 — ทุติยภูมิ · CC BY-SA 4.0 · อ้างตัวเลขได้ (อัตราทดเกียร์ 1:1.69, bore/stroke) ถ้าคัดลอกข้อความต้องให้เครดิตและใช้สัญญาเดียวกัน
21. [LM21] EASA, Type-Certificate Data Sheet IM.E.032, Lycoming IO-360 series engines, Issue 03, 24 August 2022, https://www.easa.europa.eu/hr/downloads/7741/en (p. 6 ความจุ 5.916 dm³ 4 สูบ; p. 9 น้ำหนักแห้ง L2A 122 kg; p. 12 พิกัด L2A 119 kW/2,400 rpm และ alternate 134 kW/2,700 rpm) — ปฐมภูมิ · เอกสารสาธารณะของ EASA (เงื่อนไขการทำซ้ำยังไม่ได้ตรวจ) · อ้างข้อเท็จจริงพร้อมที่มาได้ ไม่คัดลอกทั้งฉบับ
22. [LM22] EASA, Type-Certificate Data Sheet IM.A.051, Cessna 172 series, Issue 11, 17 November 2025, Section 2 (172S): C.5 เครื่องยนต์ IO-360-L2A 180 hp / 2,700 rpm และ C.6 ใบพัด McCauley 1A170E/JHA7660 75–76 in รอบสถิต 2,300–2,400 rpm (p. 18), C.21 ระยะเคลื่อนพื้นบังคับ (p. 20–21), https://www.easa.europa.eu/es/downloads/7423/en — ปฐมภูมิ · เหมือน [LM21] · อ้างข้อเท็จจริงพร้อมที่มาได้
23. [LM23] H. S. Fletcher, *Comparison of Several Methods for Estimating Low-Speed Stability Derivatives for Two Airplane Configurations*, NASA TN D-6531 (L-7914), 1971, https://ntrs.nasa.gov/api/citations/19720004247/downloads/19720004247.pdf (p. 7–11) — ปฐมภูมิ · NASA public domain ในสหรัฐฯ · อ้างและคัดลอกได้
24. [LM24] E. P. Hartman, D. Biermann, *The Aerodynamic Characteristics of Full-Scale Propellers Having 2, 3, and 4 Blades of Clark Y and R.A.F. 6 Airfoil Sections*, NACA Report No. 640, 1938, https://ntrs.nasa.gov/api/citations/19930091715/downloads/19930091715.pdf — ปฐมภูมิ · NACA public domain ในสหรัฐฯ · คัดลอกข้อมูลและรูปได้พร้อมอ้างอิง (ข้อมูลอยู่ในกราฟ หัวข้อนี้ใช้แค่เป็นบริบท)
25. [LM25] FAA, *Airplane Flying Handbook*, FAA-H-8083-3C, Chapter 9 "Approaches and Landings", p. 9-2 ถึง 9-3 (สำเนาบน FAASafety.gov), https://www.faasafety.gov/files/events/SO/SO15/2024/SO15134233/ApproachesAndLandings10_afh_ch9a.pdf — ปฐมภูมิ (คู่มือทางการ) · public domain · อ้างและคัดลอกได้
26. [LM26] G. L. Teper (Systems Technology, Inc.), *Aircraft Stability and Control Data*, NASA CR-96008, April 1969 (สำเนาบนเว็บ JSBSim), https://jsbsim.sourceforge.net/NASA_CR-96008.pdf — ปฐมภูมิ (รายงานผู้รับจ้าง NASA) · เผยแพร่สาธารณะ สถานะลิขสิทธิ์ของรายงานผู้รับจ้างไม่ได้ระบุ · อ้างได้ (หน้า Navion ไม่มีชั้นข้อความ จึงไม่ได้ใช้ตัวเลข)
27. [LM27] J. G. Leishman, *Introduction to Aerospace Flight Vehicles*, Embry-Riddle Aeronautical University (Eagle Pubs), บท "Reciprocating Engine & Propeller" eq. 12: $P_{alt}/P_{MSL} = 1.132\,\sigma - 0.132$ ("often used in practice") ซึ่งเท่ากับ $\sigma - (1-\sigma)/7.55$ ทางพีชคณิต, เปิดอ่าน 2026-11-18, https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/reciprocating-engine-propeller/ — ตำราออนไลน์ (ทุติยภูมิ) · CC BY-NC-ND 4.0 · อ้างสูตรและตัวเลขพร้อมเครดิตได้ ห้ามคัดลอกเนื้อหาไปดัดแปลงหรือใช้เชิงพาณิชย์
28. [LM28] EASA, Type-Certificate Data Sheet for Noise EASA.IM.A.022 (DA 40, DA 40 D, DA 40 F, DA 40 NG), Issue 2, 26 March 2025, p. 8–11 (DA 40 NG เครื่องยนต์ Austro Engine E4, ใบพัด MT-Propeller MTV-6-R/190-69), https://www.easa.europa.eu/et/downloads/44276/en — ปฐมภูมิ · เอกสารสาธารณะของ EASA · อ้างข้อเท็จจริงพร้อมที่มาได้ (TCDS หลัก EASA.A.022 ให้รายละเอียดใบพัดครบกว่า หัวข้อ 05 ควรเปิด)

อ้างข้ามรอบ (รหัสของรอบที่ 1 ในโฟลเดอร์ `docs/research/01-flight-physics/`):
- [R1:V19] AirfieldLab `src/20-flight.js`, `src/10-atmo.js`, `test/*.mjs` (commit cabf0f0) และสคริปต์ของหัวข้อ 10-validation (`v10_perf.mjs`, `v10_modes.mjs` ฯลฯ) — โค้ดของโครงการเอง · ยังไม่มี LICENSE · ใช้ได้ทั้งหมด
- [R1:P10] A. Ning, CCBlade.jl และบทความ "Using Blade Element Momentum Methods with Gradient-Based Design Optimization", Struct. Multidisc. Optim. 64(2), 2021, https://github.com/byuflowlab/CCBlade.jl — โค้ดเปิด/บทความ · MIT · พอร์ตอัลกอริทึมได้ ถ้าคัดลอกโค้ดต้องคง copyright notice (`lm_prop` เขียนใหม่ ไม่ได้คัดลอก)

## 01.13 งานที่แนะนำสำหรับ Claude Code

ลำดับ: P1 ทำก่อน · P2 หลังเจ้าของอนุมัติแผนพัฒนา · P3 เมื่อมีเวลา; ขนาด S (ไม่เกินครึ่งวัน) · M (1–2 วัน) · L (มากกว่า 2 วัน) งานที่แตะ `src/20-flight.js` ต้องรอเจ้าของอนุมัติแผนหลังรอบที่ 5 และทำบน branch พร้อม pull request

| ลำดับ | งาน | รหัสทดสอบ |
|---|---|---|
| P1 · S | ย้ายโฟลเดอร์ `scripts/` นี้เข้า `docs/research/02-light-aircraft/scripts/` ตามเดิม (สคริปต์หา repo จาก `AIRFIELDLAB_ROOT` และหาไฟล์จากตำแหน่งตัวเองแล้ว) แล้วรัน `node docs/research/02-light-aircraft/scripts/lm_selftest.mjs` ต้องได้ 49/49 | T-LM-01…T-LM-24 |
| P1 · S | เพิ่มขั้น `lm_merge.mjs --dry` และ `lm_selftest.mjs` ใน workflow ของ GitHub Pages (หรือ workflow แยกสำหรับ `docs/research/**`) เพื่อจับบล็อก JSON ที่ผิดรูปแบบและการถดถอยของเครื่องมือ | T-LM-22, T-LM-23 |
| P1 · M | เมื่อบัตรของแบบจริง (หัวข้อ 03–07) เสร็จ ทำ `test/types.test.mjs` ที่โหลดบัตรด้วย `loadType`, สร้าง `AC` ด้วย `buildAC`, ใส่ด้วย `applyAC` แล้ววัด V_SR, ROC, glide, ระยะวิ่งขึ้น และโหมด เทียบค่าคาดหวังของแต่ละหัวข้อ (รูปแบบเดียวกับ T-LM-02…07) | T-LM-02…T-LM-07 และรหัสของหัวข้อ 03–07 |
| P1 · S | ปรับ `schema.md` ตอนรวมรอบที่ 2 เข้า repo: เพิ่ม `ind_friction` (และฟิลด์ `f`) ใน enum ของ `piston.altitude.model` และเพิ่มคำอธิบาย `common_light.methods.*` ทั้ง 13 leaf | T-LM-14, T-LM-22 |
| P1 · S | เขียน `lm_merge` ส่วนขยาย: ทุกรหัสใน `src` ต้องมีรายการในส่วนแหล่งอ้างอิงของไฟล์หัวข้อเจ้าของ (หรือเป็น `R1:` ที่มีจริง) | T-LM-23 (ขยาย) |
| P2 · M | (แก้ฟิสิกส์) ใส่ density lapse ในแรงขับ: กำลังเครื่องลูกสูบตาม `piston.lapse` (ใช้ `ind_friction` เมื่อมี ISA deviation, `gagg_ferrar` เป็นค่าเริ่ม) ทดสอบใหม่: ROC ที่ 5,000 ft ต่ำกว่า SL และวันร้อน VTBD 35 °C กำลังเหลือ 0.93–0.96 | T-LM-14, T-LM-16 |
| P2 · M | (แก้ฟิสิกส์) แยก polar ตามสภาวะแรงขับ หรือเพิ่ม slipstream ΔCL/ΔCD แบบง่าย เพื่อให้ legacy fit ได้ Vy ตรง POH โดยไม่ต้องใช้ η > 1 เกณฑ์: demo_light โหมด static Vy 74 ± 2 kt | T-LM-20 |
| P2 · M | (แก้ฟิสิกส์) ให้ซิมรับตารางขั้นแฟลป (ΔCL, ΔCD, ΔCm, Δα_stall ต่อขั้น) แทน f ตัวเดียว แล้วให้ `buildAC` ส่งตารางนี้แทน `flap_map` | T-LM-19 |
| P2 · L | (แก้ฟิสิกส์) ใบพัดตามรอบที่ 1 งาน propeller: สร้างตาราง CT/CP ต่อแบบด้วย `lm_prop.mjs` ตอน build (fixed pitch และ constant speed) แล้วซิมอ่านตารางแทน $T_0V_c/\sqrt{V^2+V_c^2}$ | T-LM-17, T-LM-18 |
| P2 · S | ใช้ `inertiaFromRadii` กับ `common_light.methods.radii` เมื่อบัตรไม่มี inertia แล้วคำนวณ `AC.Iinv` ใหม่ตาม `src/20-flight.js:119–122` | T-LM-13 |
| P3 · M | ปรับ `lm_derivs`: แก้ Clδa/Cnδa สำหรับ aileron แบบ Frise, ค่า η_h ของหาง T, และหาชุดตรวจเพิ่ม (เครื่องปีกต่ำหาง T หรือ turboprop) ก่อนใช้กับ DA40/DA42 | T-LM-10…T-LM-12 |
| P3 · S | เมื่อได้ข้อมูล FADEC ของ AE300 จาก AFM ที่เปิดเผยได้ แทนตาราง load → rpm สมมติใน `lm_engine.fadec` และเพิ่มกรณีทดสอบรอบที่ 60 % / 100 % | T-LM-15 |
| P3 · S | หาตารางรัศมีไจเรชันของ Roskam Part V ฉบับจริงมาเทียบกับ `radii` ที่หาเอง ถ้าต่างเกิน 15 % ให้รายงานและเลือกค่าที่มีแหล่งปฐมภูมิ | T-LM-13 |
| P3 · S | อ่าน Table IV, VII, X ของ TM-80163 จากภาพสแกนโดยตรง (ไม่ผ่าน OCR) เพื่อยืนยันคอลัมน์ $C_L$ 0.6 ของ Clp, Cnr, Cnδr, Clδa, Cnδa และยืนยันว่าพื้นบังคับตามยาวเป็น elevator หรือ stabilator แล้วแก้ `VALIDATION` ของ `lm_derivs.mjs` | T-LM-10…T-LM-12 |

## 01.14 บันทึกการตรวจทาน

ผู้ตรวจทานอิสระ (ไม่ใช่ผู้เขียน) 2026-11-18 ตรวจกับ repo commit cabf0f0, JSBSim 1.3.3, Node 22

**แหล่งที่เปิดตรวจ (WebFetch/อ่านไฟล์จริง 25 แหล่ง)**
- [LM1] AC 23-8C: p. 15 (VS = ความเร็วต่ำสุดขณะคันชนสต็อป ≥ 2 s, ความเร็ว stall เป็น CAS), p. 16 (ลูกสูบ idle throttle ปิด), p. 20 (turbojet: idle กับแรงขับศูนย์ต่างไม่เกิน 0.5 kt ถือว่าไม่มีนัยสำคัญ), p. 22 (≤ 1 kt/s, แก้น้ำหนัก) ตรงทั้งหมด วันที่ 16 Nov 2011
- [LM2] 14 CFR 25.103(a)(c) (ผ่าน law.cornell.edu เพราะ eCFR ปฏิเสธเครื่องมืออ่าน): $V_{SR} \ge V_{CLMAX}/\sqrt{n_{zw}}$ และ ≤ 1 kt/s ตรง
- [LM3] 14 CFR 23.49 ฉบับ 2011 (govinfo) p. 200–201 ตรง; §23.201 ยังไม่ได้เปิด
- [LM4] PHAK บทที่ 10 p. 10-5: AVGAS 6, Jet A/A-1 6.8 lb/US gal ตรง (ฉบับ B/C ไม่ระบุในไฟล์ จึงแก้ชื่อฉบับ)
- [LM5] NASA TM-80163: Table I (837.93 kg, S 16.2, b 11.0, c 1.49, L 8.2, Ixx 1,395, Iyy 1,480, Izz 2,563, Ixz 123, CG 28.8 % MAC, หาง S_h 3.35 b_h 3.45 l 4.36, ครีบ 1.04 m² b_v 2.03) ตรง; Table IV ตามยาวตรง (CZα, Cmα, Cmq, CZδe, Cmδe ของรัน trim, Cmα̇ ตรึง −4.0); **Table X/VII: Clδa ≈ −0.10 ไม่ใช่ −0.070** (ดูการแก้ด้านล่าง)
- [LM6] FAA-RD-71-6: Table I, inertia, Table III, ข้อสรุป p. 18 (Cmα̇ + Cmq ต่ำ ~20 %, Clβ เกิน ~50 %, Cnr เกิน ~50 %) ตรง
- [LM7] Wikipedia Navion: ยาว 27 ft 6 in (Jane's 1951–52) ตรง
- [LM8] JSBSim 1.3.3 ในเครื่อง: header สัญญาอนุญาตของ c172x/c310 (GPL) และ pa28/pc7/t6texan2/prop_75in2f (ไม่ระบุ) ตรง; ตาราง CT/CP ของ `prop_75in2f` ตรงทุกจุดในตาราง 01.7.2; inertia เปล่า c172x 948 slug ft² (อัตราส่วน 2.21 ตรง); รัน `lm_jsb_inertia.py` ใหม่ได้ค่าตรง `REF` ทุกตัว
- [LM9] NASA TN D-6643: Table I (2,948 lb, 17.112 m², c 1.74 m, AR 6.04, Ix/Iy/Iz), cond I 73.2 m/s 5,000 ft flaps 0, CZα −4.33, CZδe −0.511, Cmα −0.77 (CG 25 %), Cmq ตรึง −6.5 + Cmα̇ −18.1 = −24.6, Cmδe −1.42, แถว lateral 12 ค่าและคอลัมน์ Reference 8 ตรงกับ `VALIDATION`; วันที่ March 1972
- [LM10] DTIC ADA086558: เป็น Digital DATCOM **Volume II** (McDonnell Douglas, April 1979, approved for public release) แก้การอ้างอิงแล้ว
- [LM14] หน้า Wiley ของ Etkin & Reid 3rd ed. (ISBN 0-471-03418-5) ใช้ได้; [LM15] โบรชัวร์ DARcorp กล่าวถึง Parts I–VIII เท่านั้น เพิ่ม ISBN ของ Part V
- [LM16] หน้า SAE 340096: บทคัดย่อไม่มีสูตร จึงเพิ่ม [LM27] Leishman (ERAU) ที่ให้รูปเทียบเท่า $1.132\sigma - 0.132$
- [LM17] NACA R-190: p. 125 (กำลัง indicated ∝ $1/\sqrt T$), p. 134 (กำลังเสียดทานไม่ขึ้นกับอุณหภูมิ), p. 136 ตรง แก้เลขหน้า
- [LM18] Lycoming SI 1094D (25 Mar 1994): best power 100 °F rich of peak, best economy peak EGT, ไม่มีตัวเลข BSFC ตรง; ข้อความ "lean ได้ที่ ≤ 65 % ถ้าไม่มี EGT" ไม่พบในเอกสาร จึงแก้
- [LM19] AE300 factsheet 05/2024: 123.5 kW (168 hp), 512 Nm, 2,300 rpm, 1,991 cm³, 186 kg, 35 l/h (100 %) และ 19 l/h (60 %), ข้อความ non-binding ตรงทั้งหมด
- [LM20] Wikiwand Austro Engine E4: เกียร์ 1:1.69 ตรง
- [LM21] EASA IM.E.032 Issue 03: L2A take-off/MCP 119 kW (160 hp) @ 2,400 และ alternate 134 kW (180 hp) @ 2,700 rpm (p. 12), 5.916 dm³ (p. 6) — ข้อขัดแย้งในฉบับก่อนจึงไม่ใช่ข้อขัดแย้งจริง
- [LM22] EASA IM.A.051 Issue 11: C.5/C.6 p. 18 (180 hp 2,700 rpm; McCauley 1A170E/JHA7660 75–76 in; รอบสถิต 2,300–2,400) ตรง แก้เลขหน้า
- [LM23] Fletcher TN D-6531: CLα ภายใน 10 % (p. 7), lateral ต่างกันมากเพราะประสิทธิผลหางดิ่ง (p. 1) ตรง
- [LM24] NACA R-640: ใบพัด 10 ft ข้อมูลเป็นกราฟ (ตารางขอได้จาก NACA) ตรง
- [LM25] AFH บทที่ 9 p. 9-3: 1.3 VSO เมื่อไม่มีค่าจากผู้ผลิต ตรง
- [LM26] NASA CR-96008 (April 1969): หน้า Navion ไม่มีชั้นข้อความ ตรงกับที่ผู้เขียนบอก
- [LM28] EASA TCDSN IM.A.022: DA 40 NG ใช้ใบพัด MTV-6-R/190-69 (เพิ่มใหม่)
- ตัวเลขข้ามหัวข้อ: [LB9] ความเร็ว stall C172P ตาม CG จาก `03-open-models.md`

**สคริปต์ที่รันซ้ำ (จาก root ของ repo)**: `lm_merge.mjs --type common_light --coverage --dry` (0 ERROR, 0 CONFLICT), `lm_merge.mjs --dry` (ไม่ใส่ `--type`: 3 ไฟล์ 9 บล็อก ทำงานปกติ exit 0), `lm_selftest.mjs` (ก่อนแก้ 47/47, หลังแก้ 49/49), `lm_card.mjs trainer_r1` และ `--json` (ตรงกับ `out/lm_card_trainer_r1.json` และค่าที่รอบที่ 1 เผยแพร่ใน 10-validation.md ทุกค่า), `lm_fixture_trainer_r1.mjs` (ไฟล์ fixture เหมือนเดิม), `lm_derivs.mjs --validate` (ก่อนและหลังแก้), `lm_inertia.mjs` (+`--json` ตรงไฟล์เดิม), `lm_engine.mjs` (ตรง `out/lm_engine.txt`), `lm_prop.mjs fixed` และ `cs`, `lm_polar.mjs --selftest`, `lm_legacy_fit.mjs demo_light` ทั้งสองโหมด, `lm_jsb_inertia.py`, และ smoke test `lm_card.mjs c172s --quick` / `lm_legacy_fit.mjs c172s` กับบัตรที่ยังไม่มีข้อมูล

**ตรวจสมการ**: พีชคณิตของ polar รูปแบบซิม (สมการ 01.1-1), $C_{l_p}$ แบบ lifting line ของปีกวงรีและ $K_{LL}$ (หาใหม่จากสมการ monoplane), τ ของ thin-airfoil, การหมุนแกน stability → body ทั้ง 8 ตัวในโค้ด, $C_{n_r}$ ส่วนแรงต้านปีกจาก strip theory, momentum theory ของ $T_0$ และ FM, แรงที่ล้อหน้า, damping ของสปริงล้อ, Gagg–Farrar และ ind_friction, BSFC, β75 ถูกต้องทั้งหมด เครื่องหมาย derivative ของ `lm_derivs` ตรง schema-ext-r2 §5 (Cmde < 0, Clda > 0, Cnda < 0, CYdr > 0, Cndr < 0, Cldr > 0, Cnb > 0, Clb < 0)

**สิ่งที่แก้**
1. **ค่าอ้างอิงของ TM-80163 ใน `lm_derivs.mjs`**: Clδa 0.14 → 0.204 (เดิมอ่าน −0.070 ซึ่งเป็น Clβ ในแถวข้างกัน) และอ่าน lateral จากคอลัมน์ $C_L$ 0.6 ของ Table X ให้สม่ำเสมอ (Clβ −0.074 → −0.070, Clp −0.435 → −0.45, Cnr −0.12 → −0.11, Cnδr −0.06 → −0.058) ผล: ความผิดพลาดของ Clδa +74 % → +19 %, ค่ามัธยฐาน 16.4 % → 14.5 % อัปเดตตาราง 01.3-3, ข้อสรุป, JSON `derivs_accuracy`, T-LM-12 และ `out/lm_derivs_validate.json`
2. ลบข้อยกเว้นการตรวจเครื่องหมายของ Clda ใน `validate()` (T-LM-11 ยังได้ 0)
3. `lm_polar.mjs --selftest` ค้าง (top-level await กับ import วนระหว่าง lm_polar ↔ lm_card) แก้ให้รันหลังโมดูลโหลดเสร็จ
4. `lm_derivs.mjs <typeId>` กับบัตรที่ไม่มีรูปทรงหางพิมพ์ NaN เงียบ ๆ แก้ให้จบด้วย exit 1 และบอก path ที่ขาด
5. `lm_card.buildAC` กับบัตรที่ไม่มีข้อมูลแฟลปตั้ง CLflap = 0 เงียบ ๆ (ใช้ detent clean เป็นแฟลปสุด) แก้ให้ถอยไปใช้ค่า R1 พร้อมธง ตามตาราง 01.1.1 (ผล trainer_r1 ไม่เปลี่ยน)
6. `lm_jsb_inertia.py` เขียน JSON ลงไฟล์เองแทนการ redirect stdout ที่มีข้อความเริ่มต้นของ JSBSim ปนจนไฟล์ `out/lm_jsb_inertia.json` ไม่ใช่ JSON
7. ค่าคาดหวังที่คำนวณใหม่: T-LM-08 1.617 → 1.615, T-LM-16 0.9259 → 0.9262, T-LM-18 η 0.845 → 0.849; เพิ่ม T-LM-24 (ความทนทานของ CLI)
8. ทิศของผล CG ต่อความเร็ว stall ใน §01.5.1 เขียนกลับทิศ (POH ให้ Vs ที่ CG หน้า**สูงกว่า**) แก้และอ้าง [LB9]
9. ความต่าง CAS − EAS: เดิมบอก ≤ 0.1–0.3 kt ถึง 200 kt/10,000 ft คำนวณใหม่ได้ 1.0 kt ที่ 200 kt 10,000 ft (0.13 kt ที่ 100 kt) แก้ใน §01.1.3, §01.5.1, §01.11.2
10. §01.1.3 "หาร 2" สำหรับ δa แบบผลต่างสองข้าง แก้เป็น "คูณ 2"
11. ข้อขัดแย้งกำลัง IO-360-L2A ปิดได้ (alternate rating ใน IM.E.032 p. 12); เพิ่มข้อขัดแย้งใหม่สองข้อ (ทิศ Cnδa ของ TM-80163 และ elevator/stabilator)
12. ช่วง $K_{LL}$, ข้อความ strip theory "30–400 %", ช่วง leave-one-out "10–42 %" → "0.4–42 %", ผลต่อ ωn ของความผิด inertia, ข้อความ Lycoming SI 1094D, ระยะวิ่งขึ้นโหมด vy (14 %/9 %)
13. แหล่งอ้างอิง: แก้ LM3, LM4, LM10 (Volume II และตัดชื่อหน่วยงานของกองทัพออกตามกติกาข้อมูลทหาร), LM12, LM15, LM17, LM21, LM22 (เลขหน้า), LM9/LM26 (เดือนปี) และเพิ่ม LM27, LM28; note ของ `lm_card_defaults` บอกวิธีประมาณครบ

**ยังไม่ได้ตรวจหรือยังค้าง**: ตาราง X ของ TM-80163 อ่านผ่าน OCR เท่านั้น (คอลัมน์ของแถวที่มี 5 ตัวเลขเป็นการอนุมาน); สูตรและค่าคงที่ที่อ่านจากตำราที่มีลิขสิทธิ์ (Raymer Fig. 16.14 `KF_TABLE`, $K_i$, $K_n$, ตัวคูณ 1.55 ของ $A_{v,eff}$) ไม่ได้เปิดต้นฉบับ ตรวจได้เพียงความสมเหตุสมผลและพีชคณิต; ตารางรัศมีไจเรชันของ Roskam Part V ยังไม่ได้เทียบ; ยังไม่มีชุดตรวจของปีกต่ำหาง T หรือ turboprop สำหรับ `lm_derivs`
