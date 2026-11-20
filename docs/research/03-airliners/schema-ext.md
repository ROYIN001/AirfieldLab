# Schema ส่วนขยายของรอบที่ 3 (เครื่องบินโดยสาร)

← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md)

ไฟล์นี้คือข้อตกลงร่วมของทุกหัวข้อย่อยในรอบที่ 3 ใช้คู่กับ schema ของรอบที่ 1
(`../01-flight-physics/schema.md`) ซึ่งยังเป็นหลัก
ทุกอย่างที่ไม่ได้เขียนไว้ที่นี่ให้ทำตามรอบที่ 1

## 1. leaf

ทุกพารามิเตอร์เป็น `{"v","u","scope","src","conf","est","note"}` เหมือนรอบที่ 1 ทุกประการ
- `scope`: `aircraft` | `engine` | `propeller` | `gear` (ค่ารายแบบ) · `environment` | `sim` (ค่าร่วม)
- `src`: รหัสแหล่งในไฟล์หัวข้อของตัวเอง เช่น `["B7"]` (ต้องมีลิงก์ในรายการแหล่งอ้างอิงท้ายไฟล์)
- `conf`: `สูง` / `กลาง` / `ต่ำ` ตามนิยามรอบที่ 1
- `est: true` = ค่าประมาณ (คำนวณ ปรับ หรือเลือกเอง) ต้องบอกวิธีใน `note` หรือในเนื้อหา
- `v` เป็นตัวเลข อาร์เรย์ อ็อบเจกต์ตามค่า config (เช่น `{"clean":…, "landing":…}`) หรือตาราง `{"axes":{…},"data":[…]}`

## 2. บล็อก JSON ในไฟล์หัวข้อ

- ทุกบล็อก ```json ที่นับเป็นข้อมูลต้องมี **คีย์บนสุดคีย์เดียว** เป็นรหัสแบบเครื่องบิน หรือ `common_airliner`
  (บล็อกตัวอย่างที่ไม่ใช่ข้อมูลให้มีคีย์บนสุดมากกว่าหนึ่งคีย์ หรือใช้ ```js แทน)
- รหัสแบบเครื่องบิน: `atr72_600`, `b737_800`, `a320ceo`, `a320neo`, `a321ceo`, `a321neo`, `a330_300`
- รุ่นย่อยที่ต่างจากแบบหลักเพียงบางค่า ใส่ `"_inherits": {"v":"a320ceo","u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"…"}` ที่ระดับบนของแบบนั้น แล้วใส่เฉพาะค่าที่ต่าง
- ใต้รหัสแบบให้ใช้ชื่อหมวดของรอบที่ 1 (`aero`, `interference`, `propeller`, `turboprop`, `turbofan`, `controls`, `gear`,
  `wind`, `validation`, `input`, `otherSims`) ด้วย path เดิมเมื่อพารามิเตอร์ตรงกับของรอบที่ 1 และเพิ่มหมวดใหม่ในข้อ 3
- `common_airliner` ใช้กับค่าที่ใช้ร่วมทุกแบบเครื่องบินโดยสาร (scope `environment`/`sim`) เช่น นิยาม CAT II/III,
  เกณฑ์ stabilised approach ทั่วไป
- สคริปต์รวมจะ deep-merge ทุกบล็อกของทุกไฟล์ตามรหัสแบบ ถ้า path เดียวกันมาจากสองหัวข้อจะถูกแจ้งเป็นความขัดแย้ง
  จึงต้องเขียนเฉพาะหมวดที่หัวข้อของตัวเอง "เป็นเจ้าของ" ตามตารางข้อ 4

## 3. หมวดใหม่และ path ที่เพิ่มในรอบที่ 3

หน่วย SI ในฟิลด์ `v` เสมอ (m, kg, N, s, rad หรือ deg ตามที่ระบุใน `u`) ส่วนค่าการบิน (kt, ft, fpm) ใส่ใน `note` หรือในตาราง Markdown
ตำแหน่งบนตัวเครื่องใช้สองระบบ (ระบุใน `u` ทุกครั้ง):
- `m STA` = ระยะจากจมูกเครื่องไปทางท้าย, ระยะจากแนวกลางลำ (ขวาเป็นบวก), ความสูงจากพื้นขณะจอดที่น้ำหนักอ้างอิง
- `m FRD` = จาก CG อ้างอิง (x หน้า, y ขวา, z ลง) ตามรอบที่ 1; CG อ้างอิง = 25% MAC เว้นแต่ระบุไว้

### `airframe` (เจ้าของ: บัตรข้อมูลรายแบบ ยกเว้น `airframe.geometry` เป็นของหัวข้อ 5)
- `airframe.identity` — `{manufacturer, model, variant, engine, seats, operatorsDMK:[…]}`
- `airframe.weights.{MTW, MTOW, MLW, MZFW, OEW}` — kg (หลายตัวเลือกน้ำหนักให้ใช้ `v` เป็นอ็อบเจกต์ เช่น `{"WV000":…, "WV051":…}` และบอกตัวที่สายการบินไทยใช้ถ้าหาได้)
- `airframe.cg.{LEMAC_x, MAC, fwd_limit_pctMAC, aft_limit_pctMAC, ref_pctMAC}` — LEMAC เป็น m STA
- `airframe.inertia.{Ixx, Iyy, Izz, Ixz}` — kg m2 ที่มวลอ้างอิง `airframe.inertia.ref_mass` (kg); `airframe.inertia.radii` — `{Rx, Ry, Rz}` แบบไร้มิติของ Roskam (R = 2k/b หรือ 2k/L หรือ 2k/e) พร้อมวิธี
- `airframe.wing.{S, b, MAC, AR, taper, sweep_c4_deg, dihedral_deg, incidence_deg, twist_deg, airfoil}`
- `airframe.tail.{S_h, l_h, S_v, l_v, b_h, b_v}` — พื้นที่และแขนโมเมนต์ (ระยะ 25% MAC ปีก ถึง 25% MAC หาง)
- `airframe.geometry.*` (หัวข้อ 5): `length, span, height_tail, fuselage_width, wheelbase, main_track, nose_to_nosegear, nose_to_maingear, eye_pos_STA, eye_height_static, gsAntenna_pos_STA, eye_to_gsAntenna_vertical, eye_to_maingear_vertical, eye_to_maingear_horizontal, turning{min_radius_R3..R6, steering_angle_max}, clearances{engine_nacelle, wingtip, tail_at_rotation}`

### `aero` (เพิ่มจากรอบที่ 1; เจ้าของ: บัตรข้อมูลรายแบบ)
- `aero.ref.{S, b, c}` — ตามรอบที่ 1
- `aero.derivatives.*` — ชุดเชิงเส้นตามชื่อตัวแปรใน `AC` ของโค้ดปัจจุบัน (`src/20-flight.js` บรรทัด 100–118):
  `CLq, CLadot, CLde, CD0, K, CYb, CYdr, CYr, Clb, Clp, Clr, Clda, Cldr, Cmq, Cmadot, Cmde, Cnb, Cnp, Cnr, Cnda, Cndr`
  ใช้ `v` เป็นอ็อบเจกต์ตาม config ถ้าค่าต่างกัน (`{"cruise":…, "approach":…, "landing":…}`) หรือตารางตาม Mach สำหรับเจ็ต
  หน่วยต่อ rad และ rate derivative ไร้มิติด้วย b/2V หรือ c/2V ตามโค้ด
- `aero.static_long.*` — path เดียวกับรอบที่ 1 (CL0, CLalpha, CLmax_target, alpha_CLmax, Cm0, Cmalpha …) ค่าตามตำแหน่งแฟลป
  ใช้ชื่อ detent จริง เช่น `{"0":…, "1":…, "5":…, "15":…, "30":…, "40":…}` (737) หรือ `{"CONF0":…, "CONF1+F":…, "CONF2":…, "CONF3":…, "FULL":…}` (Airbus)
- `aero.flaps.detents` — `[{name, flap_deg, slat_deg, VFE_kt, dCL0, dCD0, dCm0, CLmax}]` และ `aero.flaps.transition_time_s`
- `aero.spoilers.{ground_dCL, ground_dCD, speedbrake_flight_dCD, roll_Cl_per_rad}` 
- `aero.gear_drag.dCD0`
- `aero.mach.{Mcrit, MDD, CD_wave_table, CLalpha_vs_Mach}` (เจ็ต)

### `speeds` (เจ้าของ: บัตรข้อมูลรายแบบ; ข้อยกเว้นของกฎ SI: หมวดนี้ใช้ `u` = `kt CAS` หรือ `kt IAS` ระบุให้ชัด)
- `speeds.{VMO_kt, MMO, VLE_kt, VLO_kt, VFE}` — VFE ตาม detent
- `speeds.VS1g` / `speeds.VSR` — ตาราง `{"axes":{"mass_kg":[…],"flap":[…]},"data":[…]}` (kt CAS)
- `speeds.Vref` (Boeing) หรือ `speeds.VLS` + `speeds.VAPP` (Airbus) หรือ `speeds.VmLB`/`Vref` (ATR) — ตารางตามมวลและแฟลป
- `speeds.takeoff_typical.{V1, VR, V2}` ที่ MTOW ISA SL (ระบุ flap)
- `speeds.{VMCG_kt, VMCA_kt, VMCL_kt}` 
- `speeds.crosswind_demonstrated_kt` — ค่าที่สาธิตในการรับรอง (บอกว่าเป็น gust หรือ steady)
- `speeds.icao_approach_category` — A–E

### `performance` (เจ้าของ: บัตรข้อมูลรายแบบ)
- `performance.TOFL_MTOW_ISA_SL` — m (บอก thrust rating และ flap)
- `performance.LFL_MLW_ISA_SL` — m (บอกว่าเป็น certified dry 1.667× หรือระยะจริง)
- `performance.landing_distance_actual_MLW` — m (air distance 50 ft + ground roll ถ้าหาได้)
- `performance.{ROC_initial_fpm, service_ceiling_ft, cruise_Mach, range_km, max_fuel_kg}`
- `performance.tests` — ข้อมูลที่ใช้เป็นเป้าตรวจโมเดล (เช่น ระยะ ground roll ที่ MLW autobrake 2)

### `propulsion` (เจ้าของ: หัวข้อ 6 สำหรับเจ็ต, หัวข้อ 1 สำหรับ ATR)
- `propulsion.layout` — `[{"id":1,"pos":[x,y,z],"axis":[1,0,0],"type":"turbofan","model":"CFM56_7B26_class"}, …]` ตามข้อเสนอ `AC.engines[]` ของรอบที่ 1 (หัวข้อ 5, 12) ตำแหน่ง m FRD จาก CG อ้างอิงและ m STA
- `turbofan.engines.<ENGINE_CLASS>.*` — path ตามรอบที่ 1 หัวข้อ 5 (F00, bpr, N1_100_rpm, N2_GI_pct, Racc_pctps, rev_* …) แทนค่าประมาณด้วยค่าจาก TCDS/EEDB/ข้อมูลรุ่นจริง
- `turboprop.*`, `propeller.*` — path ตามรอบที่ 1 หัวข้อ 3–4 สำหรับ PW127M + ใบพัด 568F

### `controls` (เพิ่มจากรอบที่ 1)
- `controls.architecture` — `{"pitch":"reversible|feel|fbw", "roll":…, "yaw":…, "trim":"tab|ths"}` (หัวข้อ 7)
- `controls.surfaces.<surface>` — `{travel_deg:{up,down} หรือ {left,right}, rate_dps, actuator_tau_s, hydraulic_systems:[…]}` สำหรับ elevator, stabilizer/THS, aileron, roll_spoiler, ground_spoiler, rudder (หัวข้อ 7)
- `controls.trim.*` — อัตรา trim ตามโหมด (main electric, autopilot, manual, speed trim, Mach trim) และช่วงมุม (หัวข้อ 7)
- `controls.feel.*` — 737: `{breakout_N, gradient_N_per_m (หรือ per deg) ตาม q̄, elevator_feel_computer, manual_reversion_forces}` (หัวข้อ 7)
- `controls.mech.*` — ATR: ใช้ path เดิมของรอบที่ 1 `controls.pitch/roll/yaw.*` (reversible) และเติมส่วนที่ต่าง (หัวข้อ 7)
- `controls.yaw_damper.*`, `controls.spoiler_mixing.*` (หัวข้อ 7)
- `controls.fbw.*` — Airbus: `{normal_law:{pitch:{C_star_or_nz, gains…}, roll:{p_cmd_max_dps, bank_limits…}, protections:{alpha_prot, alpha_max, alpha_floor, VMO_prot, nz_limits, pitch_limits, bank_limits}, flare_mode:{engage_ft, pitch_memo, nose_down_bias}, ground_mode:{…}}, alternate_law:{…}, direct_law:{…}, sidestick:{travel_deg, force_N}}` (หัวข้อ 8)

### `afcs` (เจ้าของ: หัวข้อ 9)
- `afcs.modes` — รายการโหมด AP/FD/AT ที่ควรจำลองพร้อมเงื่อนไข arm/engage
- `afcs.autoland` — `{"LAND_ft":…, "FLARE_ft":…, "RETARD_ft":…, "ROLLOUT":"…", "ALIGN_ft":…, "AP_disc_min_ft":…}` ความสูงเป็น m ใน `v` และ ft ใน `note`
- `afcs.capability` — CAT ที่รับรอง (fail-passive / fail-operational), DH/AH ขั้นต่ำ
- `afcs.laws.*` — สมการ/ค่าคงที่ของ flare law, glide slope/localizer tracking ที่หาได้จากเอกสารสาธารณะ

### `ops` (เจ้าของ: หัวข้อ 10)
- `ops.speed_additive`, `ops.flare_height_m`, `ops.touchdown_pitch_deg`, `ops.tailstrike_pitch_deg` (`{gear_extended, gear_compressed}`),
  `ops.rotation_rate_dps`, `ops.liftoff_pitch_deg`, `ops.initial_climb_pitch_deg`, `ops.approach_pitch_deg`, `ops.approach_thrust`,
  `ops.crosswind_limits`, `ops.autobrake` (decel ตามระดับ), `ops.reverse` (การใช้และความเร็วยกเลิก), `ops.stabilised_criteria`,
  `ops.tdz_target_m`, `ops.hard_landing`

### `validation` (เพิ่ม)
- `validation.reference_modes.<condition>` — short period, phugoid, Dutch roll, roll, spiral ของแบบจริงหรือจากโมเดลเปิด (ระบุ)
- `validation.trim_targets.<condition>` — α, θ, แรงขับ/กำลัง, elevator/stab ที่สภาพอ้างอิง สำหรับกรณีทดสอบ

## 4. เจ้าของหมวด (หัวข้อไหนเขียน path ไหน)

| หัวข้อ | ไฟล์ | อักษร | เขียน JSON ใน path |
|---|---|---|---|
| 1 | 01-atr72-600.md | R | `atr72_600`: airframe (ยกเว้น geometry), aero, interference, speeds, performance, validation, propulsion, turboprop, propeller, gear (strut/tyre/brake/steering), wind.wake |
| 2 | 02-b737-800.md | B | `b737_800`: airframe (ยกเว้น geometry), aero, interference, speeds, performance, validation, gear (strut/tyre/brake/steering), wind.wake |
| 3 | 03-a320-a321.md | L | `a320ceo`, `a320neo`, `a321ceo`, `a321neo`: เหมือนหัวข้อ 2 |
| 4 | 04-a330-300.md | H | `a330_300`: เหมือนหัวข้อ 2 |
| 5 | 05-airport-geometry.md | D | ทุกแบบ: `airframe.geometry`, `gear.geometry` + ค่าร่วมเรื่อง PAPI/MEHT ใน `common_airliner.visual` |
| 6 | 06-jet-engines.md | J | เจ็ตทุกแบบ: `turbofan`, `propulsion` |
| 7 | 07-flight-controls.md | Y | ทุกแบบ: `controls` ยกเว้น `controls.fbw` |
| 8 | 08-fbw-laws.md | Z | Airbus: `controls.fbw` |
| 9 | 09-afcs-autoland.md | O | ทุกแบบ: `afcs` + `common_airliner.afcs` |
| 10 | 10-fctm-technique.md | K | ทุกแบบ: `ops` + `common_airliner.ops` |

## 5. กรณีทดสอบ

รหัส `T-<อักษร>-NN` เช่น T-B-07 ทุกกรณีต้องมี: เงื่อนไข (มวล, CG, config, ความสูง, ISA dev), ปริมาณที่วัด, ผลคาดหวัง, tolerance, แหล่ง/วิธีได้ผลคาดหวัง
ผลคาดหวังที่คำนวณจากสมการต้องรันด้วย Node จริง และเก็บสคริปต์ไว้ใน `scripts/<อักษรเล็ก>_*.mjs`

## 6. ข้อตกลงร่วมกับรอบที่ 2 (เพิ่ม 18 พ.ย. 2026)

รอบที่ 2 ใช้ schema นี้เป็นฐานและเพิ่มบางส่วน (`../02-light-aircraft/ (รอบที่ 2) _brief/schema-ext-r2.md`) รอบที่ 3 ใช้ส่วนเหล่านี้ด้วย:
- `_na` — leaf ระดับบนของแบบ: `v` = อาร์เรย์ path ของรอบที่ 1 ที่ใช้กับแบบนั้นไม่ได้ (ใช้ `หมวด.*` ได้ เช่น `["propeller.*","turboprop.*"]` สำหรับเจ็ต) และ `note` บอกเหตุผล (เจ้าของ: บัตรข้อมูลรายแบบ)
- `aero.legacy` — `{CL0, CLa, CLflap, CDflap, CDgear, Cm0, Cma, Cmflap, aStall, aStallFlap}` ตามนิยาม `AC` ปัจจุบัน (`AC.flaps` 0–1 เป็นสัดส่วนของแฟลปสุด) เพื่อให้แบบนั้นบินกับโค้ดวันนี้ได้ทันที (เจ้าของ: บัตรข้อมูลรายแบบ; est: true)
- `propulsion.legacy` — `{P, eta, T0, idle}` ตามนิยาม `thrustAvail()` ปัจจุบัน (สำหรับเจ็ต ให้เลือก P และ eta ที่ทำให้แรงขับเกือบคงที่ในช่วงความเร็วที่ใช้ แล้วบอกวิธี) (เจ้าของ: หัวข้อ 6 สำหรับเจ็ต, หัวข้อ 1 สำหรับ ATR)
- หน่วยตำแหน่ง `m DAT` = จาก datum ของผู้ผลิต ใช้ได้คู่กับ `m STA` และ `m FRD`
- `src` อ้างข้ามหัวข้อได้ (เช่น `["D3"]`) หรืออ้างรอบที่ 1 ด้วย `["R1:A11"]`; ห้ามว่าง ยกเว้น `_na` และ `_inherits`
- ชื่อคีย์ความเร็วที่ใช้ร่วม: `VREF_kt`, `VAPP_kt`, `VR_kt`, `VLE_kt`, `VLO_kt`, `VMCA_kt` และ `speeds.VFE` = `{"<detent>": kt}` (ตารางตามมวลใช้ `{"axes":…,"data":…}`)
