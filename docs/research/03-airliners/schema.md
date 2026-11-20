# ภาคผนวก: schema พารามิเตอร์รายแบบของรอบที่ 3

← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md) · [schema ส่วนขยาย](schema-ext.md) · [schema ของรอบที่ 1](../01-flight-physics/schema.md)

ไฟล์นี้สร้างอัตโนมัติ (สคริปต์ `scripts/r3_schema.mjs`) จากไฟล์ `params-*.json` ซึ่ง `scripts/r3_merge.mjs` รวมมาจากบล็อก JSON ในไฟล์หัวข้อทั้ง 10 ไฟล์ ค่าทุกตัวมาจากไฟล์หัวข้อ ถ้าจะแก้ค่าให้แก้ที่ไฟล์หัวข้อ แล้วรันสองสคริปต์นี้ใหม่ตามลำดับ (`node scripts/r3_merge.mjs --dir . --out .` แล้ว `node scripts/r3_schema.mjs`)

รูปแบบของพารามิเตอร์หนึ่งตัวเหมือนรอบที่ 1 คือ `{v, u, scope, src, conf, est, note}` หมวดที่รอบที่ 3 เพิ่ม (airframe, speeds, performance, propulsion, controls.architecture, controls.fbw, afcs, ops) อธิบายไว้ใน [schema-ext.md](schema-ext.md)

วิธีอ่านตาราง: ค่าที่ขึ้นต้นด้วย ≈ คือ **ค่าประมาณ** (`est: true`) ค่าที่ไม่มีเครื่องหมายมาจากเอกสารหรือคำนวณตรงจากเอกสาร · "—" คือแบบนั้นไม่มีพารามิเตอร์นี้ · "ตาราง n ค่า" คือ lookup table ให้ดูค่าเต็มในไฟล์ JSON · ข้อความยาวถูกตัดด้วย … ความเชื่อมั่น แหล่ง และหมายเหตุของแต่ละค่าอยู่ในไฟล์ `params-<แบบ>.json` และในไฟล์หัวข้อ

## จำนวนพารามิเตอร์ต่อแบบ

| แบบ | ไฟล์ | พารามิเตอร์ | ค่าประมาณ | ความเชื่อมั่น สูง / กลาง / ต่ำ | path ของรอบที่ 1 ที่เติมแล้ว | ไม่ใช้กับแบบนี้ (n/a) | ยังขาด |
|---|---|---|---|---|---|---|---|
| ATR 72-600 | [params-atr72-600.json](params-atr72-600.json) | 282 | 164 | 74 / 54 / 154 | 115 / 384 | 79 | 190 |
| 737-800 | [params-b737-800.json](params-b737-800.json) | 344 | 150 | 88 / 106 / 150 | 62 / 384 | 144 | 178 |
| A320ceo | [params-a320ceo.json](params-a320ceo.json) | 370 | 156 | 98 / 134 / 138 | 49 / 384 | 171 | 164 |
| A320neo | [params-a320neo.json](params-a320neo.json) | 410 | 178 | 107 / 142 / 161 | 64 / 384 | 155 | 165 |
| A321ceo | [params-a321ceo.json](params-a321ceo.json) | 430 | 188 | 117 / 139 / 174 | 64 / 384 | 155 | 165 |
| A321neo | [params-a321neo.json](params-a321neo.json) | 421 | 190 | 110 / 129 / 182 | 64 / 384 | 155 | 165 |
| A330-300 | [params-a330-300.json](params-a330-300.json) | 293 | 144 | 67 / 71 / 155 | 36 / 384 | 187 | 161 |
| ใช้ร่วม (common_airliner) | [params-common-airliner.json](params-common-airliner.json) | 42 | 10 | 26 / 12 / 4 | — | — | — |

แบบ A320neo, A321ceo และ A321neo สืบค่าจาก A320ceo ผ่าน `_inherits` แล้วเขียนทับเฉพาะค่าที่ต่างกัน ไฟล์ params รายแบบเป็นค่าหลังสืบทอดแล้ว

## จำนวนพารามิเตอร์ตามหมวด

| หมวด | ความหมาย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `_na` | หมวดที่ไม่ใช้กับแบบนั้น | 1 (≈0) | 1 (≈0) | 1 (≈0) | 1 (≈0) | 1 (≈0) | 1 (≈0) | 1 (≈0) |
| `airframe` | โครงสร้าง น้ำหนัก CG และเรขาคณิต | 58 (≈34) | 67 (≈22) | 62 (≈21) | 62 (≈22) | 62 (≈27) | 62 (≈29) | 63 (≈23) |
| `aero` | อากาศพลศาสตร์ | 39 (≈36) | 45 (≈41) | 53 (≈42) | 53 (≈42) | 53 (≈39) | 53 (≈39) | 45 (≈37) |
| `interference` | ผลกระทบระหว่างชิ้นส่วน (downwash, ground effect) | 16 (≈14) | 13 (≈11) | 9 (≈9) | 9 (≈9) | 9 (≈9) | 9 (≈9) | 9 (≈8) |
| `speeds` | ความเร็วอ้างอิงและความเร็วจำกัด | 16 (≈7) | 13 (≈4) | 18 (≈2) | 18 (≈2) | 18 (≈8) | 18 (≈9) | 16 (≈7) |
| `performance` | สมรรถนะอ้างอิง | 10 (≈2) | 9 (≈1) | 8 (≈3) | 10 (≈3) | 10 (≈2) | 10 (≈2) | 10 (≈3) |
| `propulsion` | การจัดวางเครื่องยนต์ | 2 (≈2) | 2 (≈2) | 2 (≈2) | 2 (≈2) | 2 (≈2) | 2 (≈2) | 2 (≈2) |
| `turbofan` | เครื่องยนต์เทอร์โบแฟน | — | 57 (≈24) | 49 (≈26) | 87 (≈47) | 105 (≈49) | 96 (≈48) | 43 (≈23) |
| `turboprop` | เครื่องยนต์เทอร์โบพร็อป | 26 (≈11) | — | — | — | — | — | — |
| `propeller` | ใบพัด | 23 (≈12) | — | — | — | — | — | — |
| `gear` | ล้อ ยาง เบรก และการเลี้ยว | 24 (≈15) | 34 (≈10) | 30 (≈8) | 30 (≈8) | 30 (≈10) | 30 (≈10) | 25 (≈12) |
| `wind` | ลมและ wake | 3 (≈3) | 3 (≈1) | 3 (≈1) | 3 (≈1) | 3 (≈1) | 3 (≈1) | 3 (≈1) |
| `controls` | ระบบบังคับการบิน | 38 (≈20) | 39 (≈18) | 81 (≈24) | 81 (≈24) | 83 (≈24) | 83 (≈24) | 39 (≈11) |
| `afcs` | autopilot, flight director, autothrust, autoland | 8 (≈1) | 30 (≈5) | 25 (≈7) | 25 (≈7) | 25 (≈7) | 25 (≈7) | 17 (≈8) |
| `ops` | เทคนิคการบินมาตรฐาน (FCTM) | 13 (≈2) | 22 (≈3) | 21 (≈5) | 21 (≈5) | 21 (≈5) | 21 (≈5) | 12 (≈4) |
| `validation` | ค่าตรวจโมเดล | 5 (≈5) | 9 (≈8) | 8 (≈6) | 8 (≈6) | 8 (≈5) | 8 (≈5) | 8 (≈5) |

ตัวเลขในวงเล็บคือจำนวนค่าประมาณ

## path รายแบบของรอบที่ 1 ที่ยังไม่มีค่า

รอบที่ 1 กำหนด path ที่ต้องเติมรายแบบไว้ 384 path ส่วนใหญ่ที่ยังขาดเป็นโครงสร้างที่ออกแบบมาสำหรับเครื่องฝึกขนาดเล็ก (เช่น hinge moment ของคันบังคับแบบสายเคเบิล, รายละเอียดยางและโช้คแบบหนึ่งล้อ, ค่าของซิมตัวอื่น) หรือเป็น path ของรุ่นเครื่องยนต์แบบคลาสใน `turbofan.engines` ซึ่งรอบที่ 3 เก็บค่าจริงไว้ใต้ชื่อของเครื่องยนต์แต่ละรุ่นแทน ตารางนี้นับตามกลุ่ม path สองระดับแรก

| กลุ่ม path | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|
| `aero.buffet` | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| `aero.elevator_fade` | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| `aero.large_beta` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `aero.separation_dynamics` | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `aero.stall_warning` | 2 | 3 | 2 | 2 | 2 | 2 | 3 |
| `aero.static_long` | 8 | 9 | 8 | 8 | 8 | 8 | 8 |
| `aero.strip_wing` | 6 | 6 | 3 | 3 | 3 | 3 | 6 |
| `controls.pitch` | 11 | 16 | 22 | 22 | 22 | 22 | 22 |
| `controls.reference_types` | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| `controls.roll` | 2 | 7 | 11 | 11 | 11 | 11 | 11 |
| `controls.yaw` | 6 | 7 | 12 | 12 | 12 | 12 | 12 |
| `gear.brakes` | 9 | 9 | 9 | 9 | 9 | 9 | 10 |
| `gear.certification` | 1 | 6 | 2 | 2 | 2 | 2 | 2 |
| `gear.steering` | 2 | 3 | 3 | 3 | 3 | 3 | 3 |
| `gear.strut_main` | 10 | 10 | 10 | 10 | 10 | 10 | 10 |
| `gear.strut_nose` | 8 | 7 | 7 | 7 | 7 | 7 | 7 |
| `gear.tyre_main` | 11 | 10 | 10 | 10 | 10 | 10 | 10 |
| `gear.tyre_nose` | 6 | 4 | 5 | 5 | 5 | 5 | 7 |
| `input.keyboard` | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `interference.downwash` | — | — | 1 | 1 | 1 | 1 | 1 |
| `interference.groundEffect` | 5 | 1 | 3 | 3 | 3 | 3 | 3 |
| `interference.slipstream` | 9 | — | — | — | — | — | — |
| `numerics.contact` | 8 | 8 | 8 | 8 | 8 | 8 | 8 |
| `otherSims.airfieldlab` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `otherSims.geofs` | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `otherSims.jsbsim` | 3 | 3 | 3 | 3 | 3 | 3 | 3 |
| `otherSims.msfs` | 6 | 6 | 6 | 6 | 6 | 6 | 6 |
| `otherSims.xplane` | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| `otherSims.yasim` | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| `propeller.betaReverse` | 3 | — | — | — | — | — | — |
| `propeller.bladeGeometry` | 4 | — | — | — | — | — | — |
| `propeller.feathered` | 2 | — | — | — | — | — | — |
| `propeller.governor` | 4 | — | — | — | — | — | — |
| `propeller.inertia` | 1 | — | — | — | — | — | — |
| `propeller.section` | 9 | — | — | — | — | — | — |
| `propeller.tables` | 4 | — | — | — | — | — | — |
| `turbofan.engines` | — | 24 | 10 | 11 | 11 | 11 | — |
| `turbofan.reverser` | — | 1 | 1 | 1 | 1 | 1 | 1 |
| `turboprop.airframe_coupling` | 2 | — | — | — | — | — | — |
| `turboprop.beta_reverse` | 2 | — | — | — | — | — | — |
| `turboprop.derived_vtbd` | 2 | — | — | — | — | — | — |
| `turboprop.dynamics` | 4 | — | — | — | — | — | — |
| `turboprop.reference_engines` | 5 | — | — | — | — | — | — |
| `turboprop.steady_map` | 4 | — | — | — | — | — | — |
| `validation.classification` | 1 | — | 1 | 1 | 1 | 1 | 1 |
| `validation.currentModel` | 3 | 3 | — | — | — | — | — |
| `validation.procedures` | 1 | 1 | — | — | — | — | — |
| `validation.typicalModes` | — | 5 | — | — | — | — | — |
| `wind.discreteGust` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| `wind.fFactor` | — | 1 | — | — | — | — | — |
| `wind.wake` | — | 2 | 1 | 1 | 1 | 1 | 1 |

## `_na` หมวดที่ไม่ใช้กับแบบนั้น (1)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `_na` | - | อาร์เรย์ 10 ค่า | [propeller.*, turboprop.*, interference.slipstr… | อาร์เรย์ 13 ค่า | อาร์เรย์ 13 ค่า | อาร์เรย์ 13 ค่า | อาร์เรย์ 13 ค่า | อาร์เรย์ 13 ค่า |

## `airframe` โครงสร้าง น้ำหนัก CG และเรขาคณิต (71)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md), [3.5](05-airport-geometry.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `cg.Harm_formula` | - | — | — | ≈CG_pctMAC = (H_m - 17.8016) / 0.041935 | ≈CG_pctMAC = (H_m - 17.8016) / 0.041935 | ≈CG_pctMAC = (H_m - 17.8016) / 0.041935 | ≈CG_pctMAC = (H_m - 17.8016) / 0.041935 | — |
| `cg.LEMAC_x` | m STA | ≈11.9 | 15.928 | 15.262 | 15.262 | ≈19.53 | ≈19.53 | ≈28.95 |
| `cg.MAC` | m | ≈2.34 | 3.958 | 4.1935 | 4.1935 | 4.1935 | 4.1935 | 7.27 |
| `cg.aft_limit_pctMAC` | %MAC | 37 | ตาราง 7 ค่า | US1549_takeoff_68724kg 39.9; FBW_takeoff 40 | US1549_takeoff_68724kg 39.9; FBW_takeoff 40 | ≈FBW_takeoff 40 | ≈FBW_takeoff 40 | — |
| `cg.datum` | m | — | — | — | — | — | — | A330_200_fwd_of_nose_m 6.382; A330_300 — |
| `cg.fwd_limit_pctMAC` | %MAC | 20.8 | ตาราง 7 ค่า | AFM_extended_min 15; loadsheet_typical 17; US15… | AFM_extended_min 15; loadsheet_typical 17; US15… | ≈AFM_extended_min 15; FBW_takeoff 16 | ≈AFM_extended_min 15; FBW_takeoff 16 | — |
| `cg.ref_pctMAC` | %MAC | 25 | ≈25 | ≈25 | ≈25 | ≈25 | ≈25 | ≈25 |
| `cg.ref_station_check` | in DAT | — | 658.26 | — | — | — | — | — |
| `geometry.approach_visual` | m (pitch deg) | ≈theta_deg 3; pitch_deg 0; H 2.3; H1 3.2; H2 0.… | theta_deg 3; pitch_deg 3.2; H 4.237; H1 5.669; … | theta_deg 3; H 4.88; H1 6.74; H2 1.86; H4 5.96 | theta_deg 3; H 4.97; H1 6.82; H2 1.85; H4 6.04 | theta_deg 3; H 4.99; H1 6.88; H2 1.89; H4 5.87 | theta_deg 3; H 4.81; H1 6.71; H2 1.9; H4 5.7 | theta_deg 3; H 8.56; H1 11.34; H2 2.78; H4 9.77 |
| `geometry.clearances.engine_nacelle` | m | — | OEW 0.64; MTW 0.48 | — | — | — | — | — |
| `geometry.clearances.propeller_tip` | m | 0.835 | — | — | — | — | — | — |
| `geometry.clearances.tail_at_rotation` | deg | gear_extended 8; gear_compressed 5.9 | ≈gear_extended 11; gear_compressed 9.6 | gear_extended 13.5; gear_compressed 11.7 | gear_extended 13.5; gear_compressed 11.7 | gear_extended 11.4; gear_compressed 9.7 | ≈gear_extended 11.4; gear_compressed 9.7 | event_oleos_almost_compressed 10.4 |
| `geometry.clearances.wingtip` | m | — | OEW 3.91; MTW 3.66 | — | — | — | — | — |
| `geometry.eye_height_static` | m | ≈2.5 | ≈3.6 | ≈4.81 | ≈4.81 | ≈4.81 | ≈4.81 | ≈6.5 |
| `geometry.eye_pos_FRD` | m FRD | ≈[10.24, -0.45, -0.85] | ≈[16.154, -0.508, -0.945] | ≈[13.93, -0.57, -2.098] | ≈[13.93, -0.57, -2.098] | ≈[18.198, -0.57, -2.098] | ≈[18.198, -0.57, -2.098] | ≈[27.37, -0.8, -3.9] |
| `geometry.eye_pos_STA` | m STA | ≈2.6 | 2.489 | ≈2.38 | ≈2.38 | ≈2.38 | ≈2.38 | ≈3.4 |
| `geometry.eye_to_gsAntenna_vertical` | m | ≈0.89 | 1.433 | ≈1.86 | ≈1.85 | ≈1.89 | ≈1.9 | ≈2.78 |
| `geometry.eye_to_maingear_horizontal` | m | ≈11.1 | ≈16.87 | ≈14.88 | ≈14.88 | ≈19.27 | ≈19.27 | ≈29.96 |
| `geometry.eye_to_maingear_vertical` | m | ≈2.65 | 4.785 | 5.96 | 6.04 | 5.87 | 5.7 | 9.77 |
| `geometry.faa_adg` | - | ≈III | III | III | III | III | III | V |
| `geometry.fuselage_width` | m | — | 3.73 | 3.95 | 3.95 | 3.95 | 3.95 | 5.64 |
| `geometry.ground_attitude` | deg | — | ≈0.3 | -0.2 | -0.2 | ≈-0.2 | ≈-0.2 | — |
| `geometry.gsAntenna_pos_STA` | m STA | — | ≈1.5 | — | — | — | — | — |
| `geometry.height_tail` | m | 7.65 | OEW 12.62; MTW 12.37 | 11.76 | 11.76 | 11.76 | 11.76 | 16.79 |
| `geometry.icao_code` | - | ≈3C | ≈4C | MTOW_upto_73t5 3C; MTOW_above_73t5 4C | 3C | 4C | 4C | 4E |
| `geometry.length` | m | 27.166 | 39.47 | 37.57 | 37.57 | 44.51 | 44.51 | 63.66 |
| `geometry.main_track` | m | 4.1 | 5.715 | 7.6 | 7.6 | 7.6 | 7.6 | 10.7 |
| `geometry.nose_to_maingear` | m STA | ≈13.7 | 19.685 | 17.709 | 17.709 | ≈21.98 | ≈21.98 | ≈32.8 |
| `geometry.nose_to_nosegear` | m STA | ≈2.9 | 4.089 | 5.069 | 5.069 | ≈5.07 | ≈5.07 | ≈7.4 |
| `geometry.span` | m | 27.05 | winglets 35.79; no_winglets 34.32 | sharklet 35.8; wingtip_fence 34.1 | sharklet 35.8 | sharklet 35.8; wingtip_fence 34.1 | sharklet 35.8 | 60.3 |
| `geometry.turning.min_radius_R3` | m | ≈12.84 | ≈16.15 | ≈13.31 | ≈13.31 | ≈at_69_2 18.08; at_73_1 17.66 | ≈at_69_2 18.08; at_73_1 17.66 | ≈full 27.43; reduced 28.74 |
| `geometry.turning.min_radius_R4` | m | ≈20.52 | ≈22.63 | ≈22.36 | ≈22.36 | ≈at_69_2 24.59; at_73_1 23.32 | ≈at_69_2 24.59; at_73_1 23.32 | ≈full 41.73; reduced 44.73 |
| `geometry.turning.min_radius_R5` | m | ≈15.38 | ≈20.13 | ≈18.19 | ≈18.19 | ≈at_69_2 22.9; at_73_1 22.57 | ≈at_69_2 22.9; at_73_1 22.57 | ≈full 34.4; reduced 35.45 |
| `geometry.turning.min_radius_R6` | m | ≈15.18 | ≈20.22 | ≈20.29 | ≈20.29 | ≈at_69_2 23.43; at_73_1 23.11 | ≈at_69_2 23.43; at_73_1 23.11 | ≈full 32.55; reduced 33.66 |
| `geometry.turning.steering_angle_effective` | deg | ≈57 | ≈75 | 71.8 | 71.8 | low 69.2; high 73.1 | low 69.2; high 73.1 | full 67.8; reduced 62.1 |
| `geometry.turning.steering_angle_max` | deg | 60 | 78 | 75 | 75 | 75 | 75 | full 72; reduced 65 |
| `geometry.wheelbase` | m | 10.77 | 15.596 | 12.64 | 12.64 | 16.9 | 16.9 | 25.4 |
| `identity` | - | manufacturer ATR (GIE Avions de Transport Régio… | manufacturer The Boeing Company; model 737-800;… | manufacturer Airbus S.A.S.; model A320-200 (A32… | manufacturer Airbus S.A.S.; model A320neo; vari… | manufacturer Airbus S.A.S.; model A321-200 (A32… | manufacturer Airbus S.A.S.; model A321neo; vari… | manufacturer Airbus S.A.S.; model A330-300; var… |
| `inertia.Ixx` | kg m2 | ≈265800 | ≈2132340 | ≈1749000 | ≈2015000 | ≈2048000 | ≈2367000 | ≈15810000 |
| `inertia.Ixz` | kg m2 | ≈33400 | ≈170362 | ≈0 | ≈0 | ≈0 | ≈0 | ≈0 |
| `inertia.Iyy` | kg m2 | ≈789800 | ≈3878047 | ≈4946000 | ≈5168000 | ≈8125000 | ≈8523000 | ≈41140000 |
| `inertia.Izz` | kg m2 | ≈1002000 | ≈5822929 | ≈6248000 | ≈6842000 | ≈8798000 | ≈9633000 | ≈54130000 |
| `inertia.radii` | - | ≈Rx 0.263; Ry 0.451; Rz 0.51 | ≈Rx 0.33; Ry 0.387; Rz 0.508 | ≈Rx 0.305; Ry 0.466; Rz 0.549 | ≈Rx 0.305; Ry 0.466; Rz 0.549 | ≈Rx 0.305; Ry 0.466; Rz 0.549 | ≈Rx 0.305; Ry 0.466; Rz 0.549 | ≈Rx 0.305; Ry 0.466; Rz 0.549 |
| `inertia.ref_mass` | kg | ≈21000 | ≈66361 | ≈64500 | ≈67400 | ≈75500 | ≈79200 | ≈187000 |
| `inertia.source_values` | kg, kg m2 | — | wolfram_dry m 58094; Ixx 1866711; Iyy 3394953; … | jsbsim_empty m 50349; Ixx 1278370; Iyy 3781268;… | jsbsim_empty m 50349; Ixx 1278370; Iyy 3781268;… | jsbsim_empty m 50349; Ixx 1278370; Iyy 3781268;… | jsbsim_empty m 50349; Ixx 1278370; Iyy 3781268;… | fg_a330_empty m 97069; Ixx 3221000; Iyy 6785000… |
| `tail.S_h` | m2 | 11.73 | 32.4 | 31 | 31 | 31 | 31 | 72.9 |
| `tail.S_v` | m2 | 12.48 | 23.13 | 21.5 | 21.5 | 21.5 | 21.5 | 45.2 |
| `tail.b_h` | m | ≈7.31 | 13.4 | 12.45 | 12.45 | 12.45 | 12.45 | 19.06 |
| `tail.b_v` | m | ≈3.87 | 6 | 5.87 | 5.87 | 5.87 | 5.87 | 8.45 |
| `tail.l_h` | m | ≈13.6 | 17.68 | ≈17.6 | ≈17.6 | ≈20.27 | ≈20.27 | 28.6 |
| `tail.l_v` | m | ≈13.6 | 17.7 | ≈17.2 | ≈17.2 | ≈19.87 | ≈19.87 | 27.5 |
| `weights.MLW` | kg | WV00 21000; WV09 21850; WV10 21850; WV20 22350;… | opt1 65317; opt2 65317; opt3 66360 | WV000 64500; opt_66000 66000 | WV051 67400; WV055 67400 | WV000 75500; WV001 77800; WV011 77800 | WV050 77300; WV053 79200; WV057 79200; WV067 79… | WV000 174000; WV022 187000; WV052 187000; WV054… |
| `weights.MTOW` | kg | WV00 21000; WV09 21999; WV10 22000; WV20 22500;… | opt1 70533; opt2 78244; opt3 79015 | WV000 73500; opt_77000 77000; opt_75500 75500 | WV051 73500; WV055 79000 | WV000 89000; WV001 93000; WV011 93500 | WV050 89000; WV053 93500; WV057 92500; WV067 90… | WV000 212000; WV022 233000; WV052 233000; WV054… |
| `weights.MTW` | kg | WV00 21170; WV09 22170; WV10 22180; WV20 22670;… | opt1 70760; opt2 78471; opt3 79242; easa_tcds 7… | WV000 73900 | WV051 73900; WV055 79400 | WV000 89400; WV001 93400; WV011 93900 | WV050 89400; WV053 93900; WV057 92900; WV067 90… | WV000 212900; WV022 233900; WV052 233900; WV054… |
| `weights.MZFW` | kg | WV00 20000; WV09 20500; WV10 20000; WV20 20300;… | opt1 61688; opt2 61688; opt3 62731 | WV000 60500; opt_61000 61000; opt_62500 62500 | WV051 64300; WV055 64300 | WV000 71500; WV001 73800; WV011 73800 | WV050 73300; WV053 75600; WV057 75600; WV067 75… | WV000 164000; WV022 175000; WV052 175000; WV054… |
| `weights.OEW` | kg | tech_spec 13010; typical_in_service_PW127M 1345… | 41412 | 41310 | ≈41310 | 48000 | ≈48000 | jenkinson_1999 118189; openap 122780 |
| `weights.default_sim` | kg | — | ≈MTW 79333; MTOW 79015; MLW 66360; MZFW 62731 | ≈MTW 73900; MTOW 73500; MLW 64500; MZFW 60500 | ≈MTW 79400; MTOW 79000; MLW 67400; MZFW 64300 | ≈MTW 89400; MTOW 89000; MLW 75500; MZFW 71500 | ≈MTW 97400; MTOW 97000; MLW 79200; MZFW 75600 | ≈MTW 242900; MTOW 242000; MLW 187000; MZFW 1710… |
| `weights.max_fuel` | kg | 5000 | 20897 | CFM 19004; IAE 18729 | neo 18636 | CFM 18879; IAE 18605 | basic 18440; ACF_max_ACT 25860 | usable_L 97530; kg_at_0p785 76561 |
| `weights.min_weight` | kg | — | — | — | — | — | — | 121000 |
| `wing.AR` | - | 12 | ≈no_winglets 9.45; winglets_geometric 10.28 | ≈no_sharklet 9.485; sharklet_geometric 10.454 | ≈geometric 10.454; aero_ref 9.485 | ≈no_sharklet 9.485; sharklet_geometric 10.454 | ≈geometric 10.454; aero_ref 9.485 | ≈geometric_b60p3 10.056; jenkinson 9.26 |
| `wing.MAC` | m | ≈2.34 | weight_balance 3.96; geometric 4.17 | 4.1935 | 4.1935 | 4.1935 | 4.1935 | 7.27 |
| `wing.S` | m2 | 61 | 124.6 | 122.6 | 122.6 | 122.6 | 122.6 | 361.6 |
| `wing.airfoil` | - | root RA 1843 (NACA 43018 mod); tip RA 1343 (NAC… | Boeing BAC family (ไม่พบรุ่น) | — | — | — | — | tc_avg 0.11; type supercritical |
| `wing.b` | m | 27.05 | no_winglets 34.32; winglets 35.79 | no_sharklet 34.1; sharklet 35.8 | sharklet 35.8 | no_sharklet 34.1; sharklet 35.8 | sharklet 35.8 | 60.3 |
| `wing.chords` | m | — | root 6.65; tip 1.25 | — | — | — | — | — |
| `wing.dihedral_deg` | deg | ≈0 | 6 | 5.11 | 5.11 | 5.11 | 5.11 | ≈5 |
| `wing.flap` | - | — | type double-slotted (S2); span_frac 0.599; cf_c… | type Fowler ช่องเดียว + slat ตลอดช่วงปีก; cf_c … | type Fowler ช่องเดียว + slat ตลอดช่วงปีก; cf_c … | type Fowler ช่องเดียว + slat ตลอดช่วงปีก; cf_c … | type Fowler ช่องเดียว + slat ตลอดช่วงปีก; cf_c … | type Fowler (S2 = slotted ช่องเดียวตาม Jenkinso… |
| `wing.incidence_deg` | deg | ≈1 | 3 | 2 | 2 | 2 | 2 | 1.03 |
| `wing.sweep_c4_deg` | deg | ≈1 | 25 | 25 | 25 | 25 | 25 | 29.7 |
| `wing.taper` | - | ≈0.5 | 0.278 | 0.24 | 0.24 | 0.24 | 0.24 | 0.251 |
| `wing.twist_deg` | deg | ≈-2 | ≈3 | -2 | -2 | -2 | -2 | ≈— |

## `aero` อากาศพลศาสตร์ (58)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `derivatives.CD0` | - | ≈0.03 | ≈cruise 0.019; approach 0.0747 | ≈0.0182 | ≈0.0182 | 0.02 | 0.02 | 0.022 |
| `derivatives.CLadot` | 1/(rad·c/2V) | ≈approach 1.98; cruise 2.28 | ≈cruise 2.9; approach 2.2 | ≈approach 2.19; cruise 3.54 | ≈approach 2.19; cruise 3.54 | ≈approach 2.38; cruise 3.86 | ≈approach 2.38; cruise 3.86 | ≈approach 1.54; cruise 2.59 |
| `derivatives.CLde` | 1/rad | ≈approach 0.329; cruise 0.348 | ≈cruise 0.38; approach 0.38 | ≈approach 0.464; cruise 0.571 | ≈approach 0.464; cruise 0.571 | ≈approach 0.464; cruise 0.571 | ≈approach 0.464; cruise 0.571 | ≈approach 0.352; cruise 0.443 |
| `derivatives.CLih` | 1/rad | — | — | ≈approach 0.893 | ≈approach 0.893 | ≈approach 0.893 | ≈approach 0.893 | ≈approach 0.705 |
| `derivatives.CLq` | 1/(rad·c/2V) | ≈approach 8.5; cruise 9.01 | ≈cruise 8; approach 8 | ≈approach 7.49; cruise 9.21 | ≈approach 7.49; cruise 9.21 | ≈approach 8.63; cruise 10.61 | ≈approach 8.63; cruise 10.61 | ≈approach 5.55; cruise 6.98 |
| `derivatives.CYb` | 1/rad | ≈-0.714 | ≈cruise -0.87; approach -0.87 | ≈approach -0.719; cruise -0.777 | ≈approach -0.719; cruise -0.777 | ≈approach -0.719; cruise -0.777 | ≈approach -0.719; cruise -0.777 | ≈approach -0.505; cruise -0.547 |
| `derivatives.CYdr` | 1/rad | ≈0.276 | ≈cruise 0.23; approach 0.23 | ≈approach 0.235; cruise 0.263 | ≈approach 0.235; cruise 0.263 | ≈approach 0.235; cruise 0.263 | ≈approach 0.235; cruise 0.263 | ≈approach 0.196; cruise 0.22 |
| `derivatives.CYp` | 1/rad (b/2V) | — | — | ≈approach 0.09; cruise 0.119 | ≈approach 0.09; cruise 0.119 | ≈approach 0.084; cruise 0.114 | ≈approach 0.084; cruise 0.114 | ≈approach 0.04; cruise 0.064 |
| `derivatives.CYr` | 1/(rad·b/2V) | ≈0.617 | ≈cruise 0.43; approach 0.43 | ≈approach 0.503; cruise 0.559 | ≈approach 0.503; cruise 0.559 | ≈approach 0.58; cruise 0.645 | ≈approach 0.58; cruise 0.645 | ≈approach 0.314; cruise 0.35 |
| `derivatives.Clb` | 1/rad | ≈-0.143 | ≈cruise -0.157; approach -0.247 | ≈approach -0.204; cruise -0.176 | ≈approach -0.204; cruise -0.176 | ≈approach -0.199; cruise -0.173 | ≈approach -0.199; cruise -0.173 | ≈approach -0.201; cruise -0.176 |
| `derivatives.Clda` | 1/rad | ≈0.18 | ≈cruise 0.1; approach 0.1 | ≈approach 0.089; cruise 0.117 | ≈approach 0.089; cruise 0.117 | ≈approach 0.089; cruise 0.117 | ≈approach 0.089; cruise 0.117 | ≈approach 0.135; cruise 0.18 |
| `derivatives.Cldr` | 1/rad | ≈0.033 | ≈cruise 0.023; approach 0.023 | ≈approach 0.022; cruise 0.029 | ≈approach 0.022; cruise 0.029 | ≈approach 0.02; cruise 0.027 | ≈approach 0.02; cruise 0.027 | ≈approach 0.0115; cruise 0.0186 |
| `derivatives.Clp` | 1/(rad·b/2V) | ≈-0.6 | ≈cruise -0.5; approach -0.5 | ≈approach -0.509; cruise -0.664 | ≈approach -0.509; cruise -0.664 | ≈approach -0.509; cruise -0.664 | ≈approach -0.509; cruise -0.664 | ≈approach -0.483; cruise -0.638 |
| `derivatives.Clr` | 1/(rad·b/2V) | ≈approach 0.447; cruise 0.162 | ≈cruise 0.145; approach 0.383 | ≈approach 0.335; cruise 0.179 | ≈approach 0.335; cruise 0.179 | ≈approach 0.334; cruise 0.186 | ≈approach 0.334; cruise 0.186 | ≈approach 0.265; cruise 0.145 |
| `derivatives.Cmadot` | 1/(rad·c/2V) | ≈approach -11.5; cruise -13.2 | ≈cruise -12; approach -9.2 | ≈approach -9.18; cruise -14.87 | ≈approach -9.18; cruise -14.87 | ≈approach -11.52; cruise -18.65 | ≈approach -11.52; cruise -18.65 | ≈approach -6.06; cruise -10.18 |
| `derivatives.Cmde` | 1/rad | ≈approach -1.91; cruise -2.03 | ≈cruise -1.6; approach -1.6 | ≈approach -1.948; cruise -2.395 | ≈approach -1.948; cruise -2.395 | ≈approach -2.243; cruise -2.759 | ≈approach -2.243; cruise -2.759 | ≈approach -1.387; cruise -1.744 |
| `derivatives.Cmih` | 1/rad | — | — | ≈approach -3.746 | ≈approach -3.746 | ≈approach -4.314 | ≈approach -4.314 | ≈approach -2.773 |
| `derivatives.Cmq` | 1/(rad·c/2V) | ≈approach -54.4; cruise -57.6 | ≈cruise -37.4; approach -37.4 | ≈approach -34.59; cruise -42.53 | ≈approach -34.59; cruise -42.53 | ≈approach -45.88; cruise -56.42 | ≈approach -45.88; cruise -56.42 | ≈approach -24; cruise -30.2 |
| `derivatives.Cnb` | 1/rad | ≈0.225 | ≈cruise 0.167; approach 0.167 | ≈approach 0.113; cruise 0.141 | ≈approach 0.113; cruise 0.141 | ≈approach 0.099; cruise 0.132 | ≈approach 0.099; cruise 0.132 | ≈approach 0.046; cruise 0.064 |
| `derivatives.Cnda` | 1/rad | ≈approach -0.03; cruise -0.009 | ≈cruise -0.005; approach -0.005 | ≈approach -0.024; cruise -0.009 | ≈approach -0.024; cruise -0.009 | ≈approach -0.023; cruise -0.009 | ≈approach -0.023; cruise -0.009 | ≈approach -0.031; cruise -0.013 |
| `derivatives.Cndr` | 1/rad | ≈-0.139 | ≈cruise -0.118; approach -0.118 | ≈approach -0.121; cruise -0.134 | ≈approach -0.121; cruise -0.134 | ≈approach -0.139; cruise -0.155 | ≈approach -0.139; cruise -0.155 | ≈approach -0.091; cruise -0.101 |
| `derivatives.Cnp` | 1/(rad·b/2V) | ≈approach -0.195; cruise -0.052 | ≈cruise -0.063; approach -0.181 | ≈approach -0.203; cruise -0.125 | ≈approach -0.203; cruise -0.125 | ≈approach -0.203; cruise -0.131 | ≈approach -0.203; cruise -0.131 | ≈approach -0.15; cruise -0.091 |
| `derivatives.Cnr` | 1/(rad·b/2V) | ≈-0.33 | ≈cruise -0.242; approach -0.272 | ≈approach -0.327; cruise -0.296 | ≈approach -0.327; cruise -0.296 | ≈approach -0.41; cruise -0.39 | ≈approach -0.41; cruise -0.39 | ≈approach -0.197; cruise -0.171 |
| `derivatives.K` | - | ≈clean 0.0313; landing 0.04 | ≈cruise 0.042; approach 0.0383 | ≈0.0386 | ≈0.0386 | 0.041 | 0.041 | 0.041 |
| `flaps.detents` | mixed | ≈[name 0; flap_deg 0; slat_deg 0; VFE_kt —; dCL… | ≈อาร์เรย์ 9 ค่า | ≈[name CONF0; slat_deg 0; flap_deg 0; VFE_kt —;… | ≈[name CONF0; slat_deg 0; flap_deg 0; VFE_kt —;… | ≈[name CONF0; slat_deg 0; flap_deg 0; VFE_kt —;… | ≈[name CONF0; slat_deg 0; flap_deg 0; VFE_kt —;… | ≈[name CONF0; slat_deg —; flap_deg 0; VFE_kt —;… |
| `flaps.transition_time_s` | s | ≈0-15 8; 15-30 8 | ≈0-1 5; 1-2 4; 2-5 3; 5-10 2; 10-15 2; 15-25 2;… | slats_full_travel 20; flaps_full_travel 20 | slats_full_travel 20; flaps_full_travel 20 | slats_full_travel 20; flaps_full_travel 20 | slats_full_travel 20; flaps_full_travel 20 | flaps_full_travel 30; slats_full_travel 20 |
| `gear_drag.dCD0` | - | ≈0.02 | 0.017 | 0.017 | 0.017 | 0.017 | 0.017 | 0.014 |
| `legacy` | ตามนิยาม AC (de… | ≈CL0 0.229; CLa 5.6; CLflap 1.273; CDflap 0.075… | ≈CL0 0.2; CLa 5.26; CLflap 0.947; CDflap 0.062;… | ≈CL0 0.12; CLa 5.302; CLflap 1.249; CDflap 0.06… | ≈CL0 0.12; CLa 5.302; CLflap 1.249; CDflap 0.06… | ≈CL0 0.12; CLa 5.317; CLflap 1.218; CDflap 0.06… | ≈CL0 0.12; CLa 5.317; CLflap 1.337; CDflap 0.06… | ≈CL0 0.116; CLa 5.072; CLflap 0.885; CDflap 0.0… |
| `mach.CD_wave_table` | - | — | ≈ตาราง 8 ค่า | ≈ตาราง 7 ค่า | ≈ตาราง 7 ค่า | ≈ตาราง 7 ค่า | ≈ตาราง 7 ค่า | ≈ตาราง 7 ค่า |
| `mach.CLalpha_vs_Mach` | 1/rad | — | ≈ตาราง 3 ค่า | ≈ตาราง 8 ค่า | ≈ตาราง 8 ค่า | ≈ตาราง 8 ค่า | ≈ตาราง 8 ค่า | ≈ตาราง 9 ค่า |
| `mach.MDD` | - | — | ≈0.835 | ≈0.827 | ≈0.827 | ≈0.827 | ≈0.827 | ≈0.864 |
| `mach.Mcrit` | - | — | ≈CL0.5 0.727 | ≈CL0.5 0.727 | ≈CL0.5 0.727 | ≈CL0.5 0.727 | ≈CL0.5 0.727 | ≈CL0p5 0.764 |
| `polar.CD0_clean` | - | — | — | ≈0.0182 | ≈0.0182 | 0.02 | 0.02 | 0.022 |
| `polar.K_by_flap` | - | — | ≈0 0.042; 1 0.0419; 2 0.0417; 5 0.0413; 10 0.04… | ≈CONF0 0.0386; CONF1 0.043; CONF1+F 0.0447; CON… | ≈CONF0 0.0386; CONF1 0.043; CONF1+F 0.0447; CON… | ≈CONF0 0.0386; CONF1 0.043; CONF1+F 0.0447; CON… | ≈CONF0 0.0386; CONF1 0.043; CONF1+F 0.0447; CON… | ≈CONF0 0.041; CONF1 0.0406; CONF1+F 0.0422; CON… |
| `polar.dCD0_by_flap` | - | — | ≈0 0; 1 0.003; 2 0.0032; 5 0.0041; 10 0.0073; 1… | ≈CONF0 0; CONF1 0.004; CONF1+F 0.01; CONF2 0.02… | ≈CONF0 0; CONF1 0.004; CONF1+F 0.01; CONF2 0.02… | ≈CONF0 0; CONF1 0.004; CONF1+F 0.01; CONF2 0.02… | ≈CONF0 0; CONF1 0.004; CONF1+F 0.01; CONF2 0.02… | ≈CONF0 0; CONF1 0.004; CONF1+F 0.01; CONF2 0.02… |
| `polar.sharklet_K_factor` | - | — | — | ≈0.95 | ≈0.95 | ≈0.95 | ≈0.95 | — |
| `polar.winglet_K_factor` | - | — | ≈0.97 | — | — | — | — | — |
| `ref.S` | m2 | 61 | 124.6 | 122.6 | 122.6 | 122.6 | 122.6 | 361.6 |
| `ref.b` | m | 27.05 | 34.32 | 34.1 | 34.1 | 34.1 | 34.1 | 60.3 |
| `ref.c` | m | ≈2.34 | 4.17 | 4.1935 | 4.1935 | 4.1935 | 4.1935 | 7.27 |
| `spoilers.ground_dCD` | - | ≈0 | ≈0.06 | 0.058 | 0.058 | 0.058 | 0.058 | — |
| `spoilers.ground_dCL` | - | ≈0 | ≈-0.47 | -0.467 | -0.467 | -0.467 | -0.467 | — |
| `spoilers.roll_Cl_per_rad` | 1/rad | ≈0.05 | ≈0.08 | — | — | — | — | — |
| `spoilers.speedbrake_flight_dCD` | - | — | ≈0.02 | ≈0.0277 | ≈0.0277 | ≈0.0277 | ≈0.0277 | — |
| `stall_warning.alpha_warn_design` | deg (AoA จาก AD… | — | — | landing_conf_sensor 23; clean_high_alt_alternat… | landing_conf_sensor 23; clean_high_alt_alternat… | landing_conf_sensor 23; clean_high_alt_alternat… | landing_conf_sensor 23; clean_high_alt_alternat… | — |
| `stall_warning.min_margin` | kt | ≈13 | — | — | — | — | — | — |
| `stall_warning.vane_aoa` | deg (vane) | shaker 0 15.9; 15 16.3; 0_icing 11.2; 15_icing … | — | — | — | — | — | — |
| `static_long.CL0` | - | ≈0 0.229; 15 0.973; 30 1.502 | ≈0 0.2; 1 0.295; 2 0.342; 5 0.456; 10 0.579; 15… | ≈CONF0 0.12; CONF1 0.252; CONF1+F 0.702; CONF2 … | ≈CONF0 0.12; CONF1 0.252; CONF1+F 0.702; CONF2 … | ≈CONF0 0.117; CONF1 0.248; CONF1+F 0.697; CONF2… | ≈CONF0 0.117; CONF1 0.248; CONF1+F 0.697; CONF2… | ≈CONF0 0.116; CONF1 0.129; CONF1+F 0.429; CONF2… |
| `static_long.CLalpha` | 1/rad | ≈approach 5.6; cruise 6 | ≈clean 5.257; landing 5.257 | ≈M0.2 5.302; M0.78 6.826 | ≈M0.2 5.302; M0.78 6.826 | ≈M0.2 5.317; M0.78 6.849 | ≈M0.2 5.317; M0.78 6.849 | ≈M0p21 5.072; M0p82 6.654 |
| `static_long.CLmax_target` | - | ≈0 1.5; 15 2.146; 30 2.675 | ≈0 1.262; 1 1.554; 2 1.656; 5 1.962; 10 2.095; … | ≈CONF0 1.316; CONF1 1.957; CONF1+F 2.36; CONF2 … | ≈CONF0 1.316; CONF1 1.957; CONF1+F 2.36; CONF2 … | ≈CONF0 1.316; CONF1 1.957; CONF1+F 2.36; CONF2 … | ≈CONF0 1.316; CONF1 1.957; CONF1+F 2.36; CONF2 … | ≈CONF0 1.26; CONF1 1.8; CONF1+F 2.1; CONF2 2.24… |
| `static_long.Cm0` | - | ≈0.074 | — | — | — | — | — | — |
| `static_long.Cmalpha` | 1/rad | ≈approach -1.74; cruise -1.81 | ≈-1 | ≈approach_cg25 -1.38; approach_cg30 -1.115; cru… | ≈approach_cg25 -1.38; approach_cg30 -1.115; cru… | ≈approach_cg25 -1.642; approach_cg30 -1.376; cr… | ≈approach_cg25 -1.642; approach_cg30 -1.376; cr… | ≈approach_cg28 -0.963; cruise_M0p82_cg28 -1.072 |
| `static_long.alpha_CLmax` | deg | ≈0 13; 15 12; 30 12 | ≈0 11.6; 1 13.7; 2 14.3; 5 16.4; 10 16.5; 15 16… | ≈CONF0 12.9; CONF1 18.4; CONF1+F 17.9; CONF2 17… | ≈CONF0 12.9; CONF1 18.4; CONF1+F 17.9; CONF2 17… | ≈CONF0 12.9; CONF1 18.4; CONF1+F 17.9; CONF2 17… | ≈CONF0 12.9; CONF1 18.4; CONF1+F 17.9; CONF2 17… | ≈CONF0 14.05; CONF1 20; CONF1+F 20; CONF2 19.5;… |
| `static_long.alpha_star` | deg | — | — | ≈CONF0 14; CONF1 19.5; CONF1+F 19; CONF2 18.5; … | ≈CONF0 14; CONF1 19.5; CONF1+F 19; CONF2 18.5; … | ≈CONF0 14; CONF1 19.5; CONF1+F 19; CONF2 18.5; … | ≈CONF0 14; CONF1 19.5; CONF1+F 19; CONF2 18.5; … | ≈CONF0 14.05; CONF1 20; CONF1+F 20; CONF2 19.5;… |
| `static_long.neutral_point_pctMAC` | %MAC | — | ≈45 | ≈M0.2 51; M0.78 47.6 | ≈M0.2 51; M0.78 47.6 | ≈M0.2 55.9; M0.78 52.4 | ≈M0.2 55.9; M0.78 52.4 | ≈M0p21 47; M0p82 44.1 |
| `strip_wing.dihedral_eff` | deg | — | — | 5.11 | 5.11 | 5.11 | 5.11 | — |
| `strip_wing.taper` | - | — | — | 0.24 | 0.24 | 0.24 | 0.24 | — |
| `strip_wing.washout` | deg | — | — | 2 | 2 | 2 | 2 | — |

## `interference` ผลกระทบระหว่างชิ้นส่วน (downwash, ground effect) (21)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `downwash.CLadot` | 1/(rad·c/2V) | ≈1.98 | ≈2.18 | ≈2.19 | ≈2.19 | ≈2.38 | ≈2.38 | ≈1.54 |
| `downwash.Cmadot` | 1/(rad·c/2V) | ≈-11.5 | ≈-9.25 | ≈-9.18 | ≈-9.18 | ≈-11.52 | ≈-11.52 | ≈-6.06 |
| `downwash.VH` | - | ≈1.12 | ≈1.102 | ≈1.061 | ≈1.061 | ≈1.222 | ≈1.222 | ≈0.793 |
| `downwash.a_t` | 1/rad | ≈approach 4; cruise 4.24 | ≈4.045 | ≈3.922 | ≈3.922 | ≈3.922 | ≈3.922 | ≈3.885 |
| `downwash.deda` | - | ≈approach 0.233; cruise 0.253 | ≈M0.2 0.272; M0.785 0.359 | ≈M0.2 0.292; M0.78 0.385 | ≈M0.2 0.292; M0.78 0.385 | ≈M0.2 0.276; M0.78 0.364 | ≈M0.2 0.276; M0.78 0.364 | ≈approach 0.278; cruise 0.371 |
| `downwash.eps0` | rad | ≈0.02 | ≈0 | — | — | — | — | — |
| `downwash.eta_t` | - | ≈0.95 | ≈0.9 | ≈0.9 | ≈0.9 | ≈0.9 | ≈0.9 | ≈0.9 |
| `downwash.l_t` | m | ≈13.6 | 17.68 | ≈17.6 | ≈17.6 | ≈20.27 | ≈20.27 | 28.6 |
| `groundEffect.A` | - | — | ≈no_winglets 9.45; winglets_geometric 10.28 | ≈9.485 | ≈9.485 | ≈9.485 | ≈9.485 | ≈10.056 |
| `groundEffect.CLa_w` | 1/rad | — | ≈4.568 | ≈4.67 | ≈4.67 | ≈4.67 | ≈4.67 | ≈4.563 |
| `groundEffect.rMac` | m (FRD จาก CG, … | — | ≈[0, 6.96, 1.2] | — | — | — | — | — |
| `groundEffect.tablesCheck` | - | — | ตาราง 20 ค่า | — | — | — | — | — |
| `groundEffect.wing_height_touchdown` | m | — | ≈2.4 | — | — | — | — | — |
| `slipstream.blownArea` | m2 | ≈16.3 | — | — | — | — | — | — |
| `slipstream.blownSpanFactor` | D | ≈0.8 | — | — | — | — | — | — |
| `slipstream.diskDiameter` | m | 3.93 | — | — | — | — | — | — |
| `slipstream.hubPos` | m (FRD จาก CG) | ≈[[4.3, -4.05, -0.3], [4.3, 4.05, -0.3]] | — | — | — | — | — | — |
| `slipstream.hubRadius` | m | ≈0.4 | — | — | — | — | — | — |
| `slipstream.immersionH` | - | ≈0 | — | — | — | — | — | — |
| `slipstream.immersionV` | - | ≈0.15 | — | — | — | — | — | — |
| `slipstream.sense` | - | 1 | — | — | — | — | — | — |

## `speeds` ความเร็วอ้างอิงและความเร็วจำกัด (23)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `MMO` | Mach | 0.55 | 0.82 | 0.82 | 0.82 | 0.82 | 0.82 | 0.86 |
| `V2_kt` | kt CAS | — | — | ตาราง 27 ค่า | ตาราง 27 ค่า | rule V2 ≥ 1.13 VS1g(CONF) และ ≥ 1.10 VMCA; skyb… | rule V2 ≥ 1.13 VS1g(CONF) และ ≥ 1.10 VMCA; skyb… | ≈ตาราง 12 ค่า |
| `VAPP_kt` | kt CAS | — | — | ≈rule VLS + clamp(HW/3, 5, 15); calm_64500kg 13… | ≈rule VLS + clamp(HW/3, 5, 15); calm_64500kg 13… | ≈rule VLS + clamp(HW/3, 5, 15); calm_73000kg 14… | ≈rule VLS + clamp(HW/3, 5, 15); calm_73000kg 13… | ≈ตาราง 12 ค่า |
| `VAPP_rule` | - | VAPP = max(VmHB30 + WF, VMCL); WF = max(1/3 hea… | — | — | — | — | — | — |
| `VA_kt` | kt IAS | 175 | — | — | — | — | — | — |
| `VFE` | kt IAS | 15 185; 30 150 | 1 250; 2 250; 5 250; 10 210; 15 200; 25 190; 30… | CONF1 230; CONF1+F 215; CONF2 200; CONF3 185; F… | CONF1 230; CONF1+F 215; CONF2 200; CONF3 185; F… | ≈CONF1 230; CONF1+F 215; CONF2 205; CONF3 195; … | ≈CONF1 230; CONF1+F 215; CONF2 205; CONF3 195; … | CONF1 240; CONF1+F 215; CONF2_takeoff 205; CONF… |
| `VLE_kt` | kt IAS | 185 | 320 | 280 | 280 | 280 | 280 | kt 250; mach 0.55 |
| `VLO_kt` | kt IAS | extension 170; retraction 160 | extend 270; retract 235 | extension 250; retraction 220 | extension 250; retraction 220 | extension 250; retraction 220 | extension 250; retraction 220 | extension 250; retraction 250; mach 0.55 |
| `VLS` | kt CAS | — | — | cg_below_25 ตาราง 54 ค่า; cg_25_and_above ตาราง… | cg_below_25 ตาราง 54 ค่า; cg_25_and_above ตาราง… | ≈all_cg ตาราง 11 ค่า | ≈all_cg ตาราง 11 ค่า | ≈ตาราง 12 ค่า |
| `VMCA_kt` | kt CAS | ≈101 | ≈112 | 110 | 114 | ≈110 | ≈110 | ≈122 |
| `VMCG_kt` | kt CAS | ≈92 | ≈107 | 111 | 116 | ≈111 | ≈111 | ≈120 |
| `VMCL_kt` | kt CAS | 98 | — | 113 | 116 | ≈116 | ≈116 | 125 |
| `VMO_kt` | kt IAS | 250 | 340 | 350 | 350 | 350 | 350 | 330 |
| `VREF_kt` | kt CAS | ≈ตาราง 8 ค่า | ≈ตาราง 20 ค่า | ≈rule VLS CONF FULL; at_64500kg 128.5; at_67400… | ≈rule VLS CONF FULL; at_64500kg 128.5; at_67400… | rule VLS CONF FULL; QRH_74000kg 139; QRH_78000k… | ≈rule VLS CONF FULL; at_73000kg 133.7; at_79200… | — |
| `VS1g` | kt CAS | — | — | ตาราง 54 ค่า | ตาราง 54 ค่า | ≈ตาราง 66 ค่า | ≈ตาราง 66 ค่า | ≈ตาราง 36 ค่า |
| `VSR` | kt CAS | ≈ตาราง 24 ค่า | ≈ตาราง 90 ค่า | — | — | — | — | — |
| `VmLB` | kt CAS | ≈ตาราง 16 ค่า | — | — | — | — | — | — |
| `approach_speed_boeing_kt` | kt | — | 142 | — | — | — | — | — |
| `crosswind_demonstrated_kt` | kt | 35 | winglets 33; no_winglets 36 | landing_incl_gust 38; takeoff 35 | landing_incl_gust 38; takeoff 35 | ≈landing_incl_gust 38; takeoff 35 | ≈landing_incl_gust 38; takeoff 35 | takeoff_incl_gust 32; landing_incl_gust 40 |
| `icao_approach_category` | - | ≈B | D | C | C | MLW_75500 C; MLW_77800 D | C | C |
| `manoeuvre_speeds` | kt CAS | — | — | ตาราง 27 ค่า | ตาราง 27 ค่า | rule_F ≈ 1.18 VS1g(CONF1+F); rule_S ≈ 1.21 VS1g… | rule_F ≈ 1.18 VS1g(CONF1+F); rule_S ≈ 1.21 VS1g… | — |
| `tailwind_limit_kt` | kt | — | — | takeoff_landing 15; autoland 10 | takeoff_landing 15; autoland 10 | takeoff_landing 15; autoland 10 | takeoff_landing 15; autoland 10 | takeoff_landing 15; autoland 10 |
| `takeoff_typical` | kt CAS | ≈flap 15; mass_kg 22800; V1 113; VR 113; V2 116 | mass_kg 76400; V1 152; VR 155; V2 158; N1_pct 9… | mass_kg 73690; conf CONF3; CG_pctMAC 31; V1 123… | mass_kg 73690; conf CONF3; CG_pctMAC 31; V1 123… | V2 145 | V2 145 | ≈mass_kg 242000; flap CONF2; V1 148; VR 151.5; … |

## `performance` สมรรถนะอ้างอิง (11)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md), [3.6](06-jet-engines.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `LFL_MLW_ISA_SL` | m | 915 | basic_65317kg 1630; max_66360kg 1655; jenkinson… | 1440 | 1440 | 1580 | 1600 | ≈est_187t 1672; jenkinson_179t 1600 |
| `ROC_initial_fpm` | fpm | 1355 | 2415 | — | 2500 | 2500 | 2500 | 1736 |
| `TOFL_MTOW_ISA_SL` | m | 22800_basic 1279; 23000_option 1304 | max_79010kg_7B27 2230; basic_70530kg_7B24 2025;… | ≈jenkinson_A320_200 2180; test_band [1750, 2250] | ≈skybrary_A20N 2190; test_band [1750, 2250] | jenkinson_A321_200 2000 | skybrary_A21N 2210 | ≈est_242t_trent772b 2737; jenkinson_217t_cf6 23… |
| `cruise_Mach` | Mach | ≈0.44 | 0.789 | 0.78 | 0.79 | 0.79 | 0.79 | typical 0.82; wrap_mean 0.81 |
| `cruise_TAS_kt` | kt TAS | max_cruise_PW127M 275; max_cruise_XT_FL200 270 | — | — | — | — | — | — |
| `landing_distance_actual_MLW` | m | ≈640 | ≈993 | ≈864 | ≈864 | ≈948 | ≈960 | ≈est_187t 1003; est_179t 960 |
| `load_factor_limits` | g | — | — | clean [-1, 2.5]; flaps_extended [0, 2] | clean [-1, 2.5]; flaps_extended [0, 2] | clean [-1, 2.5]; flaps_extended [0, 2] | clean [-1, 2.5]; flaps_extended [0, 2] | clean [-1, 2.5]; flaps [0, 2] |
| `max_fuel_kg` | kg | 5000 | 20897 | 19004 | 18636 | 18879 | 18440 | 76561 |
| `range_km` | km | 1404 | basic 3645; max 5675 | — | 6482 | 6482 | 6482 | 11750 |
| `service_ceiling_ft` | ft | 25000 | 41000 | 39100 | 39000 | 39000 | 39000 | 41010 |
| `tests` | mixed | V2min_MTOW_kt 116; VREF_landing_kt 113; climb_s… | wrap_liftoff_mps mean 86.5; min 75; max 98; wra… | ≈autobrake_decel_mps2 LO 1.7; MED 3; autobrake_… | ≈autobrake_decel_mps2 LO 1.7; MED 3; autobrake_… | ≈autobrake_decel_mps2 LO 1.7; MED 3; autobrake_… | ≈autobrake_decel_mps2 LO 1.7; MED 3; autobrake_… | wrap_takeoff_distance_km 1.86; wrap_liftoff_mps… |

## `propulsion` การจัดวางเครื่องยนต์ (2)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.6](06-jet-engines.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `layout` | m FRD / m STA | ≈[id 1; pos [4.3, -4.05, -0.3]; pos_STA [8.2, -… | ≈[id 1; pos [2.159, -4.902, 1.11]; posSTA [16.4… | ≈[id 1; pos [4.453, -5.755, 1.24]; posSTA [11.8… | ≈[id 1; pos [4.453, -5.755, 1.24]; posSTA [11.8… | ≈[id 1; pos [4.453, -5.755, 1.24]; posSTA [16.1… | ≈[id 1; pos [4.453, -5.755, 1.24]; posSTA [16.1… | ≈[id 1; pos [3.184, -9.401, 2.149]; posSTA [—, … |
| `legacy` | W, -, N, - | ≈P 3692000; eta 0.957; T0 76955; idle 0.02 | ≈P 27873000; eta 0.8; T0 233980; idle 0.05 | ≈P 24251000; eta 0.8; T0 209060; idle 0.05 | ≈P 25214000; eta 0.8; T0 241280; idle 0.045 | ≈P 33557000; eta 0.8; T0 284680; idle 0.05 | ≈P 30148000; eta 0.8; T0 286100; idle 0.045 | ≈P 75596000; eta 0.8; T0 632600; idle 0.05 |

## `turbofan` เครื่องยนต์เทอร์โบแฟน (197)

หัวข้อที่ให้ค่า: [3.6](06-jet-engines.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `engine_default` | - | — | CFM56_7B26_class | CFM56_5B6_class | LEAP_1A26_class | CFM56_5B3_class | LEAP_1A32_class | TRENT_772B_class |
| `engines.CFM56_5B3_class.F00` | N | — | — | — | — | 142340 | — | — |
| `engines.CFM56_5B3_class.MCT` | N | — | — | — | — | 129400 | — | — |
| `engines.CFM56_5B3_class.Tflat_C` | degC | — | — | — | — | 30 | — | — |
| `engines.CFM56_5B3_class.bpr` | - | — | — | — | — | 5.4 | — | — |
| `engines.CFM56_5B3_class.eedbUid` | - | — | — | — | — | 8CM054 | — | — |
| `engines.CFM56_5B3_class.ffLTO` | kg/s | — | — | — | — | [1.462, 1.153, 0.369, 0.113] | — | — |
| `engines.CFM56_5B3_class.ffQuad` | - | — | — | — | — | ≈[0.0404, 0.5622, 0.3899] | — | — |
| `engines.CFM56_5B3_class.inherits` | - | — | — | — | — | from CFM56_5B6_class | — | — |
| `engines.CFM56_5B3_class.opr` | - | — | — | — | — | 32.6 | — | — |
| `engines.CFM56_5B4_class.F00` | N | — | — | 120100 | 120100 | 120100 | 120100 | — |
| `engines.CFM56_5B4_class.MCT` | N | — | — | 108400 | 108400 | 108400 | 108400 | — |
| `engines.CFM56_5B4_class.Tflat_C` | degC | — | — | 45 | 45 | 45 | 45 | — |
| `engines.CFM56_5B4_class.bpr` | - | — | — | 5.7 | 5.7 | 5.7 | 5.7 | — |
| `engines.CFM56_5B4_class.eedbUid` | - | — | — | 8CM055 | 8CM055 | 8CM055 | 8CM055 | — |
| `engines.CFM56_5B4_class.ffLTO` | kg/s | — | — | [1.142, 0.939, 0.316, 0.102] | [1.142, 0.939, 0.316, 0.102] | [1.142, 0.939, 0.316, 0.102] | [1.142, 0.939, 0.316, 0.102] | — |
| `engines.CFM56_5B4_class.ffQuad` | - | — | — | ≈[0.0386, 0.7169, 0.2435] | ≈[0.0386, 0.7169, 0.2435] | ≈[0.0386, 0.7169, 0.2435] | ≈[0.0386, 0.7169, 0.2435] | — |
| `engines.CFM56_5B4_class.inherits` | - | — | — | from CFM56_5B6_class | from CFM56_5B6_class | from CFM56_5B6_class | from CFM56_5B6_class | — |
| `engines.CFM56_5B4_class.opr` | - | — | — | 27.3 | 27.3 | 27.3 | 27.3 | — |
| `engines.CFM56_5B6_class.EGT_limits_C` | degC | — | — | takeoff 950; maxContinuous 915; start 725 | takeoff 950; maxContinuous 915; start 725 | takeoff 950; maxContinuous 915; start 725 | takeoff 950; maxContinuous 915; start 725 | — |
| `engines.CFM56_5B6_class.F00` | N | — | — | 104530 | 104530 | 104530 | 104530 | — |
| `engines.CFM56_5B6_class.MCT` | N | — | — | 90080 | 90080 | 90080 | 90080 | — |
| `engines.CFM56_5B6_class.N1_100_rpm` | rpm | — | — | ≈5000 | ≈5000 | ≈5000 | ≈5000 | — |
| `engines.CFM56_5B6_class.N1_GI_pct` | %N1 | — | — | ≈18.9 | ≈18.9 | ≈18.9 | ≈18.9 | — |
| `engines.CFM56_5B6_class.N1_max_pct` | %N1 | — | — | 104 | 104 | 104 | 104 | — |
| `engines.CFM56_5B6_class.N2_100_rpm` | rpm | — | — | ≈14460 | ≈14460 | ≈14460 | ≈14460 | — |
| `engines.CFM56_5B6_class.N2_AI_pct` | %N2 | — | — | ≈69 | ≈69 | ≈69 | ≈69 | — |
| `engines.CFM56_5B6_class.N2_FI_pct` | %N2 | — | — | ≈61 | ≈61 | ≈61 | ≈61 | — |
| `engines.CFM56_5B6_class.N2_GI_pct` | %N2 | — | — | ≈59.4 | ≈59.4 | ≈59.4 | ≈59.4 | — |
| `engines.CFM56_5B6_class.N2_max_pct` | %N2 | — | — | 105 | 105 | 105 | 105 | — |
| `engines.CFM56_5B6_class.Racc_pctps` | %N2/s | — | — | ≈18 | ≈18 | ≈18 | ≈18 | — |
| `engines.CFM56_5B6_class.Rdec_pctps` | %N2/s | — | — | ≈16 | ≈16 | ≈16 | ≈16 | — |
| `engines.CFM56_5B6_class.Tflat_C` | degC | — | — | 45 | 45 | 45 | 45 | — |
| `engines.CFM56_5B6_class.accShape_a` | - | — | — | ≈6 | ≈6 | ≈6 | ≈6 | — |
| `engines.CFM56_5B6_class.altExp` | - | — | — | ≈1 | ≈1 | ≈1 | ≈1 | — |
| `engines.CFM56_5B6_class.bpr` | - | — | — | 5.9 | 5.9 | 5.9 | 5.9 | — |
| `engines.CFM56_5B6_class.eedbUid` | - | — | — | 8CM057 | 8CM057 | 8CM057 | 8CM057 | — |
| `engines.CFM56_5B6_class.fan_diameter_m` | m | — | — | ≈1.735 | ≈1.735 | ≈1.735 | ≈1.735 | — |
| `engines.CFM56_5B6_class.ffLTO` | kg/s | — | — | [0.965, 0.8, 0.279, 0.095] | [0.965, 0.8, 0.279, 0.095] | [0.965, 0.8, 0.279, 0.095] | [0.965, 0.8, 0.279, 0.095] | — |
| `engines.CFM56_5B6_class.ffQuad` | - | — | — | ≈[0.0455, 0.748, 0.2059] | ≈[0.0455, 0.748, 0.2059] | ≈[0.0455, 0.748, 0.2059] | ≈[0.0455, 0.748, 0.2059] | — |
| `engines.CFM56_5B6_class.idleFrac0` | - | — | — | ≈0.05 | ≈0.05 | ≈0.05 | ≈0.05 | — |
| `engines.CFM56_5B6_class.idleMach0` | - | — | — | ≈0.5 | ≈0.5 | ≈0.5 | ≈0.5 | — |
| `engines.CFM56_5B6_class.kT_perK` | 1/K | — | — | ≈0.0065 | ≈0.0065 | ≈0.0065 | ≈0.0065 | — |
| `engines.CFM56_5B6_class.mass_dry_kg` | kg | — | — | 2455.2 | 2455.2 | 2455.2 | 2455.2 | — |
| `engines.CFM56_5B6_class.opr` | - | — | — | 24.3 | 24.3 | 24.3 | 24.3 | — |
| `engines.CFM56_5B6_class.revType` | - | — | — | type pivoting door (4 doors, fan stream) | type pivoting door (4 doors, fan stream) | type pivoting door (4 doors, fan stream) | type pivoting door (4 doors, fan stream) | — |
| `engines.CFM56_5B6_class.rev_c0` | - | — | — | ≈0.3 | ≈0.3 | ≈0.3 | ≈0.3 | — |
| `engines.CFM56_5B6_class.rev_c1` | 1/Mach | — | — | ≈1 | ≈1 | ≈1 | ≈1 | — |
| `engines.CFM56_5B6_class.rev_deploy_s` | s | — | — | ≈2 | ≈2 | ≈2 | ≈2 | — |
| `engines.CFM56_5B6_class.rev_idleFrac` | - | — | — | ≈0.1 | ≈0.1 | ≈0.1 | ≈0.1 | — |
| `engines.CFM56_5B6_class.rev_stow_s` | s | — | — | ≈2.5 | ≈2.5 | ≈2.5 | ≈2.5 | — |
| `engines.CFM56_5B6_class.rev_uMax` | - | — | — | ≈0.7 | ≈0.7 | ≈0.7 | ≈0.7 | — |
| `engines.CFM56_5B6_class.tau2_s` | s | — | — | ≈0.35 | ≈0.35 | ≈0.35 | ≈0.35 | — |
| `engines.CFM56_5B6_class.tauFan_s` | s | — | — | ≈0.25 | ≈0.25 | ≈0.25 | ≈0.25 | — |
| `engines.CFM56_5B6_class.thrustExp_k` | - | — | — | ≈2 | ≈2 | ≈2 | ≈2 | — |
| `engines.CFM56_7B24_class.F00` | N | — | 107650 | — | — | — | — | — |
| `engines.CFM56_7B24_class.MCT` | N | — | 101420 | — | — | — | — | — |
| `engines.CFM56_7B24_class.bpr` | - | — | 5.3 | — | — | — | — | — |
| `engines.CFM56_7B24_class.eedbUid` | - | — | 8CM064 | — | — | — | — | — |
| `engines.CFM56_7B24_class.ffLTO` | kg/s | — | [1.086, 0.895, 0.308, 0.103] | — | — | — | — | — |
| `engines.CFM56_7B24_class.ffQuad` | - | — | ≈[0.0437, 0.726, 0.229] | — | — | — | — | — |
| `engines.CFM56_7B24_class.inherits` | - | — | from CFM56_7B26_class | — | — | — | — | — |
| `engines.CFM56_7B24_class.opr` | - | — | 25.6 | — | — | — | — | — |
| `engines.CFM56_7B26_class.EGT_limits_C` | degC | — | takeoff 950; maxContinuous 925; start 725; tran… | — | — | — | — | — |
| `engines.CFM56_7B26_class.F00` | N | — | 116990 | — | — | — | — | — |
| `engines.CFM56_7B26_class.MCT` | N | — | 115210 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N1_100_rpm` | rpm | — | ≈5175 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N1_GI_pct` | %N1 | — | ≈20 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N1_max_pct` | %N1 | — | 104 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N2_100_rpm` | rpm | — | ≈14460 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N2_AI_pct` | %N2 | — | 72 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N2_FI_pct` | %N2 | — | ≈61 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N2_GI_pct` | %N2 | — | 58 | — | — | — | — | — |
| `engines.CFM56_7B26_class.N2_max_pct` | %N2 | — | 105 | — | — | — | — | — |
| `engines.CFM56_7B26_class.Racc_pctps` | %N2/s | — | ≈18 | — | — | — | — | — |
| `engines.CFM56_7B26_class.Rdec_pctps` | %N2/s | — | ≈16 | — | — | — | — | — |
| `engines.CFM56_7B26_class.Tflat_C` | degC | — | 30 | — | — | — | — | — |
| `engines.CFM56_7B26_class.accShape_a` | - | — | ≈6 | — | — | — | — | — |
| `engines.CFM56_7B26_class.altExp` | - | — | ≈1 | — | — | — | — | — |
| `engines.CFM56_7B26_class.bpr` | - | — | 5.1 | — | — | — | — | — |
| `engines.CFM56_7B26_class.eedbUid` | - | — | 8CM065 | — | — | — | — | — |
| `engines.CFM56_7B26_class.fan_diameter_m` | m | — | 1.549 | — | — | — | — | — |
| `engines.CFM56_7B26_class.ffLTO` | kg/s | — | [1.213, 0.986, 0.331, 0.108] | — | — | — | — | — |
| `engines.CFM56_7B26_class.ffQuad` | - | — | ≈[0.0425, 0.6716, 0.2828] | — | — | — | — | — |
| `engines.CFM56_7B26_class.idleFrac0` | - | — | ≈0.05 | — | — | — | — | — |
| `engines.CFM56_7B26_class.idleMach0` | - | — | ≈0.5 | — | — | — | — | — |
| `engines.CFM56_7B26_class.kT_perK` | 1/K | — | ≈0.0065 | — | — | — | — | — |
| `engines.CFM56_7B26_class.length_m` | m | — | 2.508 | — | — | — | — | — |
| `engines.CFM56_7B26_class.mass_dry_kg` | kg | — | 2386 | — | — | — | — | — |
| `engines.CFM56_7B26_class.opr` | - | — | 27.7 | — | — | — | — | — |
| `engines.CFM56_7B26_class.revType` | - | — | type cascade (translating sleeve + blocker door… | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_c0` | - | — | ≈0.3 | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_c1` | 1/Mach | — | ≈1 | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_deploy_s` | s | — | ≈2 | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_idleFrac` | - | — | ≈0.1 | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_stow_s` | s | — | ≈2.5 | — | — | — | — | — |
| `engines.CFM56_7B26_class.rev_uMax` | - | — | ≈0.7 | — | — | — | — | — |
| `engines.CFM56_7B26_class.tau2_s` | s | — | ≈0.35 | — | — | — | — | — |
| `engines.CFM56_7B26_class.tauFan_s` | s | — | ≈0.25 | — | — | — | — | — |
| `engines.CFM56_7B26_class.thrustExp_k` | - | — | ≈2 | — | — | — | — | — |
| `engines.CFM56_7B27_class.F00` | N | — | 121430 | — | — | — | — | — |
| `engines.CFM56_7B27_class.MCT` | N | — | 115210 | — | — | — | — | — |
| `engines.CFM56_7B27_class.bpr` | - | — | 5.1 | — | — | — | — | — |
| `engines.CFM56_7B27_class.eedbUid` | - | — | 8CM066 | — | — | — | — | — |
| `engines.CFM56_7B27_class.ffLTO` | kg/s | — | [1.293, 1.031, 0.343, 0.11] | — | — | — | — | — |
| `engines.CFM56_7B27_class.ffQuad` | - | — | ≈[0.0448, 0.6081, 0.3404] | — | — | — | — | — |
| `engines.CFM56_7B27_class.inherits` | - | — | from CFM56_7B26_class | — | — | — | — | — |
| `engines.CFM56_7B27_class.opr` | - | — | 29 | — | — | — | — | — |
| `engines.LEAP_1A26_class.EGT_limits_C` | degC | — | — | — | takeoff 1060; maxContinuous 1025; start 750; tr… | takeoff 1060; maxContinuous 1025; start 750; tr… | takeoff 1060; maxContinuous 1025; start 750; tr… | — |
| `engines.LEAP_1A26_class.F00` | N | — | — | — | 120640 | 120640 | 120640 | — |
| `engines.LEAP_1A26_class.MCT` | N | — | — | — | 118680 | 118680 | 118680 | — |
| `engines.LEAP_1A26_class.N1_100_rpm` | rpm | — | — | — | 3856 | 3856 | 3856 | — |
| `engines.LEAP_1A26_class.N1_GI_pct` | %N1 | — | — | — | ≈18 | ≈18 | ≈18 | — |
| `engines.LEAP_1A26_class.N1_max_pct` | %N1 | — | — | — | 101 | 101 | 101 | — |
| `engines.LEAP_1A26_class.N2_100_rpm` | rpm | — | — | — | 16645 | 16645 | 16645 | — |
| `engines.LEAP_1A26_class.N2_AI_pct` | %N2 | — | — | — | ≈68 | ≈68 | ≈68 | — |
| `engines.LEAP_1A26_class.N2_FI_pct` | %N2 | — | — | — | ≈59 | ≈59 | ≈59 | — |
| `engines.LEAP_1A26_class.N2_GI_pct` | %N2 | — | — | — | ≈57 | ≈57 | ≈57 | — |
| `engines.LEAP_1A26_class.N2_max_pct` | %N2 | — | — | — | 116.5 | 116.5 | 116.5 | — |
| `engines.LEAP_1A26_class.Racc_pctps` | %N2/s | — | — | — | ≈18 | ≈18 | ≈18 | — |
| `engines.LEAP_1A26_class.Rdec_pctps` | %N2/s | — | — | — | ≈15 | ≈15 | ≈15 | — |
| `engines.LEAP_1A26_class.Tflat_C` | degC | — | — | — | 44 | 44 | 44 | — |
| `engines.LEAP_1A26_class.accShape_a` | - | — | — | — | ≈6 | ≈6 | ≈6 | — |
| `engines.LEAP_1A26_class.altExp` | - | — | — | — | ≈1 | ≈1 | ≈1 | — |
| `engines.LEAP_1A26_class.bpr` | - | — | — | — | 11.1 | 11.1 | 11.1 | — |
| `engines.LEAP_1A26_class.eedbUid` | - | — | — | — | 20CM089 | 20CM089 | 20CM089 | — |
| `engines.LEAP_1A26_class.fan_diameter_m` | m | — | — | — | 1.981 | 1.981 | 1.981 | — |
| `engines.LEAP_1A26_class.ffLTO` | kg/s | — | — | — | [0.861, 0.71, 0.244, 0.091] | [0.861, 0.71, 0.244, 0.091] | [0.861, 0.71, 0.244, 0.091] | — |
| `engines.LEAP_1A26_class.ffQuad` | - | — | — | — | ≈[0.0571, 0.6742, 0.2689] | ≈[0.0571, 0.6742, 0.2689] | ≈[0.0571, 0.6742, 0.2689] | — |
| `engines.LEAP_1A26_class.goAround` | - | — | — | — | GA_le_TO true; MCT_le_GA true | GA_le_TO true; MCT_le_GA true | GA_le_TO true; MCT_le_GA true | — |
| `engines.LEAP_1A26_class.idleFrac0` | - | — | — | — | ≈0.045 | ≈0.045 | ≈0.045 | — |
| `engines.LEAP_1A26_class.idleMach0` | - | — | — | — | ≈0.5 | ≈0.5 | ≈0.5 | — |
| `engines.LEAP_1A26_class.kT_perK` | 1/K | — | — | — | ≈0.0065 | ≈0.0065 | ≈0.0065 | — |
| `engines.LEAP_1A26_class.length_m` | m | — | — | — | 3.328 | 3.328 | 3.328 | — |
| `engines.LEAP_1A26_class.mass_kg` | kg | — | — | — | 2990 | 2990 | 2990 | — |
| `engines.LEAP_1A26_class.opr` | - | — | — | — | 33.3 | 33.3 | 33.3 | — |
| `engines.LEAP_1A26_class.revType` | - | — | — | — | type cascade (translating, Aircelle/Safran) | type cascade (translating, Aircelle/Safran) | type cascade (translating, Aircelle/Safran) | — |
| `engines.LEAP_1A26_class.rev_c0` | - | — | — | — | ≈0.3 | ≈0.3 | ≈0.3 | — |
| `engines.LEAP_1A26_class.rev_c1` | 1/Mach | — | — | — | ≈1 | ≈1 | ≈1 | — |
| `engines.LEAP_1A26_class.rev_deploy_s` | s | — | — | — | ≈2 | ≈2 | ≈2 | — |
| `engines.LEAP_1A26_class.rev_idleFrac` | - | — | — | — | ≈0.1 | ≈0.1 | ≈0.1 | — |
| `engines.LEAP_1A26_class.rev_stow_s` | s | — | — | — | ≈2.5 | ≈2.5 | ≈2.5 | — |
| `engines.LEAP_1A26_class.rev_uMax` | - | — | — | — | ≈0.7 | ≈0.7 | ≈0.7 | — |
| `engines.LEAP_1A26_class.tau2_s` | s | — | — | — | ≈0.35 | ≈0.35 | ≈0.35 | — |
| `engines.LEAP_1A26_class.tauFan_s` | s | — | — | — | ≈0.3 | ≈0.3 | ≈0.3 | — |
| `engines.LEAP_1A26_class.thrustExp_k` | - | — | — | — | ≈2 | ≈2 | ≈2 | — |
| `engines.LEAP_1A32_class.F00` | N | — | — | — | — | 143050 | 143050 | — |
| `engines.LEAP_1A32_class.MCT` | N | — | — | — | — | 140960 | 140960 | — |
| `engines.LEAP_1A32_class.Tflat_C` | degC | — | — | — | — | 30 | 30 | — |
| `engines.LEAP_1A32_class.bpr` | - | — | — | — | — | 10.5 | 10.5 | — |
| `engines.LEAP_1A32_class.eedbUid` | - | — | — | — | — | 20CM090 | 20CM090 | — |
| `engines.LEAP_1A32_class.ffLTO` | kg/s | — | — | — | — | [1.062, 0.869, 0.284, 0.098] | [1.062, 0.869, 0.284, 0.098] | — |
| `engines.LEAP_1A32_class.ffQuad` | - | — | — | — | — | ≈[0.0452, 0.6498, 0.3052] | ≈[0.0452, 0.6498, 0.3052] | — |
| `engines.LEAP_1A32_class.inherits` | - | — | — | — | — | from LEAP_1A26_class | from LEAP_1A26_class | — |
| `engines.LEAP_1A32_class.opr` | - | — | — | — | — | 38.5 | 38.5 | — |
| `engines.TRENT_772B_class.F00` | N | — | — | — | — | — | — | 316300 |
| `engines.TRENT_772B_class.F00bare` | N | — | — | — | — | — | — | 320300 |
| `engines.TRENT_772B_class.MCT` | N | — | — | — | — | — | — | 282700 |
| `engines.TRENT_772B_class.N1_100_rpm` | rpm | — | — | — | — | — | — | 3900 |
| `engines.TRENT_772B_class.N1_GI_pct` | %N1 | — | — | — | — | — | — | ≈22.7 |
| `engines.TRENT_772B_class.N1_max_pct` | %N1 | — | — | — | — | — | — | 99 |
| `engines.TRENT_772B_class.N2_AI_pct` | %N2 | — | — | — | — | — | — | ≈72 |
| `engines.TRENT_772B_class.N2_FI_pct` | %N2 | — | — | — | — | — | — | ≈64 |
| `engines.TRENT_772B_class.N2_GI_pct` | %N2 | — | — | — | — | — | — | ≈62.4 |
| `engines.TRENT_772B_class.N3_max_pct` | %N3 | — | — | — | — | — | — | 100 |
| `engines.TRENT_772B_class.Racc_pctps` | %N2/s | — | — | — | — | — | — | ≈17 |
| `engines.TRENT_772B_class.Rdec_pctps` | %N2/s | — | — | — | — | — | — | ≈14 |
| `engines.TRENT_772B_class.TGT_limits_C` | degC | — | — | — | — | — | — | takeoff 900; maxContinuous 850; start 700; over… |
| `engines.TRENT_772B_class.Tflat_C` | degC | — | — | — | — | — | — | ≈30 |
| `engines.TRENT_772B_class.accShape_a` | - | — | — | — | — | — | — | ≈6 |
| `engines.TRENT_772B_class.altExp` | - | — | — | — | — | — | — | ≈1 |
| `engines.TRENT_772B_class.bpr` | - | — | — | — | — | — | — | 5 |
| `engines.TRENT_772B_class.eedbUid` | - | — | — | — | — | — | — | 14RR071 |
| `engines.TRENT_772B_class.fan_diameter_m` | m | — | — | — | — | — | — | 2.47 |
| `engines.TRENT_772B_class.ffLTO` | kg/s | — | — | — | — | — | — | [3.139, 2.53, 0.821, 0.27] |
| `engines.TRENT_772B_class.ffQuad` | - | — | — | — | — | — | — | ≈[0.0431, 0.6153, 0.3386] |
| `engines.TRENT_772B_class.hotBump_max` | - | — | — | — | — | — | — | 0.054 |
| `engines.TRENT_772B_class.idleFrac0` | - | — | — | — | — | — | — | ≈0.05 |
| `engines.TRENT_772B_class.idleMach0` | - | — | — | — | — | — | — | ≈0.5 |
| `engines.TRENT_772B_class.kT_perK` | 1/K | — | — | — | — | — | — | ≈0.0065 |
| `engines.TRENT_772B_class.length_m` | m | — | — | — | — | — | — | 5.639 |
| `engines.TRENT_772B_class.mass_dry_kg` | kg | — | — | — | — | — | — | 6160 |
| `engines.TRENT_772B_class.opr` | - | — | — | — | — | — | — | 36.3 |
| `engines.TRENT_772B_class.revType` | - | — | — | — | — | — | — | type cascade in C-duct (fan stream) |
| `engines.TRENT_772B_class.rev_c0` | - | — | — | — | — | — | — | ≈0.3 |
| `engines.TRENT_772B_class.rev_c1` | 1/Mach | — | — | — | — | — | — | ≈1 |
| `engines.TRENT_772B_class.rev_deploy_s` | s | — | — | — | — | — | — | ≈2.5 |
| `engines.TRENT_772B_class.rev_idleFrac` | - | — | — | — | — | — | — | ≈0.1 |
| `engines.TRENT_772B_class.rev_stow_s` | s | — | — | — | — | — | — | ≈3 |
| `engines.TRENT_772B_class.rev_uMax` | - | — | — | — | — | — | — | ≈0.7 |
| `engines.TRENT_772B_class.spools` | - | — | — | — | — | — | — | 3 |
| `engines.TRENT_772B_class.tau2_s` | s | — | — | — | — | — | — | ≈0.35 |
| `engines.TRENT_772B_class.tauFan_s` | s | — | — | — | — | — | — | ≈0.4 |
| `engines.TRENT_772B_class.thrustExp_k` | - | — | — | — | — | — | — | ≈2 |
| `idleAndLTO.AI_select` | - | — | ≈approachIdleWhen flaps >= 15 (landing) OR ther… | ≈approachIdleWhen gear down OR CONF 3/FULL (in … | ≈approachIdleWhen gear down OR CONF 3/FULL (in … | ≈approachIdleWhen gear down OR CONF 3/FULL (in … | ≈approachIdleWhen gear down OR CONF 3/FULL (in … | ≈approachIdleWhen gear down OR CONF 3/FULL (in … |
| `reverser.cancel_kt` | m/s | — | 30.87 | 36.01 | 36.01 | 36.01 | 36.01 | 36.01 |
| `reverser.interlock` | - | — | wowOrRA_ft 10; forwardLeverAtIdle true; powerAb… | wow main gear; forwardLeverAtIdle true; autoIdl… | wow main gear; forwardLeverAtIdle true; autoIdl… | wow main gear; forwardLeverAtIdle true; autoIdl… | wow main gear; forwardLeverAtIdle true; autoIdl… | wow main gear; forwardLeverAtIdle true; autoIdl… |

## `turboprop` เครื่องยนต์เทอร์โบพร็อป (26)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `airframe_coupling.spin` | - | 1 | — | — | — | — | — | — |
| `airframe_coupling.thrust_axis_body` | - | ≈[1, 0, 0] | — | — | — | — | — | — |
| `atpcs` | mixed | arm_torque_pct 46.2; arm_PLA_deg 49; trigger_to… | — | — | — | — | — | — |
| `beta_reverse.blade_angle_FI_deg` | deg | ≈— | — | — | — | — | — | — |
| `beta_reverse.reverse_available` | bool | true | — | — | — | — | — | — |
| `dynamics.cert_accel_FI_to_95pct_max_s` | s | 5 | — | — | — | — | — | — |
| `dynamics.rAcc_pct_s` | %Ng/s | ≈8 | — | — | — | — | — | — |
| `dynamics.tauAcc_s` | s | ≈0.8 | — | — | — | — | — | — |
| `fuel.psfc` | lb/(hp h) | ≈0.48 | — | — | — | — | — | — |
| `ratings.ITT_max_C` | degC | NTO 765; RTO 800; MCT 800; transient20s 840 | — | — | — | — | — | — |
| `ratings.ITT_start_C` | degC | 950 | — | — | — | — | — | — |
| `ratings.Ng_100pct_rpm` | rpm | ≈33457 | — | — | — | — | — | — |
| `ratings.Ng_max_pct` | % | 102.7 | — | — | — | — | — | — |
| `ratings.Np_100pct_rpm` | rpm | 1200 | — | — | — | — | — | — |
| `ratings.Np_max_rpm` | rpm | 1212 | — | — | — | — | — | — |
| `ratings.Np_transient_rpm` | rpm | 20s 1296; 5s 1440 | — | — | — | — | — | — |
| `ratings.P_rated` | W | NTO 1846000; RTO 2051000; MCT 1864000; CLB 1635… | — | — | — | — | — | — |
| `ratings.Q_100pct` | N m | ≈16321 | — | — | — | — | — | — |
| `ratings.Q_lim` | N m | 17354 | — | — | — | — | — | — |
| `ratings.T_flat_C` | degC | NTO 39; RTO 39; MCT 48 | — | — | — | — | — | — |
| `ratings.install_loss_frac` | - | ≈0 | — | — | — | — | — | — |
| `ratings.rating_basis` | - | pressure_Pa 101325; static true; bleed ไม่ระบุ;… | — | — | — | — | — | — |
| `ratings.takeoff_time_limit_s` | s | 300 | — | — | — | — | — | — |
| `steady_map.Ng_FI_pct` | % | ≈70 | — | — | — | — | — | — |
| `steady_map.Ng_GI_pct` | % | ≈63 | — | — | — | — | — | — |
| `steady_map.kMap` | - | ≈2.7 | — | — | — | — | — | — |

## `propeller` ใบพัด (23)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `betaReverse.betaReverseMax` | deg (β_ref) | -14 | — | — | — | — | — | — |
| `betaReverse.reverseAvailable` | - | true | — | — | — | — | — | — |
| `checks.CP_static_NTO` | - | ≈0.201 | — | — | — | — | — | — |
| `checks.momentumIdealStaticISA` | kN | ≈46.6 | — | — | — | — | — | — |
| `checks.peakEfficiency` | - | ≈0.88 | — | — | — | — | — | — |
| `checks.staticThrustISA` | kN | ≈38.5 | — | — | — | — | — | — |
| `checks.staticThrustVTBD31C` | kN | ≈37.8 | — | — | — | — | — | — |
| `checks.tipMach_static` | - | ≈0.726 | — | — | — | — | — | — |
| `engineInterface.flightIdleShaftPower` | kW | ≈— | — | — | — | — | — | — |
| `engineInterface.gearRatio` | - | ≈16.68 | — | — | — | — | — | — |
| `engineInterface.maxShaftPower` | kW | 2051 | — | — | — | — | — | — |
| `engineInterface.rpmGoverned` | rpm | TO 1200; CLB_CRZ 984 | — | — | — | — | — | — |
| `engineInterface.rpmTransientLimit` | rpm | 1296 | — | — | — | — | — | — |
| `governor.betaFeather` | deg (β_ref) | 78.5 | — | — | — | — | — | — |
| `governor.featherRate` | deg/s | ≈20 | — | — | — | — | — | — |
| `governor.rpmOverspeed` | rpm | 1224 | — | — | — | — | — | — |
| `identity.diameter` | m | 3.93 | — | — | — | — | — | — |
| `identity.hubPosition` | m (FRD จาก CG) | ≈[[4.3, -4.05, -0.3], [4.3, 4.05, -0.3]] | — | — | — | — | — | — |
| `identity.massComplete` | kg | 180 | — | — | — | — | — | — |
| `identity.nBlades` | - | 6 | — | — | — | — | — | — |
| `identity.sense` | - | 1 | — | — | — | — | — | — |
| `identity.thrustAxis` | - | ≈[1, 0, 0] | — | — | — | — | — | — |
| `inertia.Ip` | kg m2 | ≈104 | — | — | — | — | — | — |

## `gear` ล้อ ยาง เบรก และการเลี้ยว (48)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md), [3.5](05-airport-geometry.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `brakes.accumulator` | ครั้ง, h | — | — | full_applications_min 7; parking_hold_h 12 | full_applications_min 7; parking_hold_h 12 | full_applications_min 7; parking_hold_h 12 | full_applications_min 7; parking_hold_h 12 | — |
| `brakes.antiskid` | bool | true | 1 | present 1; off_below_mps 10.29 | present 1; off_below_mps 10.29 | present 1; off_below_mps 10.29 | present 1; off_below_mps 10.29 | — |
| `brakes.antiskid_logic` | kt, -, s | — | skid_control_min_kt 8; locked_wheel_min_kt 25; … | — | — | — | — | — |
| `brakes.autobrake` | bool | false | — | — | — | — | — | — |
| `brakes.emergency_brake_note` | - | ห้ามดันคัน EMER BRAKE เลย notch เมื่อความเร็ว >… | — | — | — | — | — | — |
| `brakes.max_pressure` | MPa | — | 20.68 | — | — | — | — | — |
| `brakes.max_temp_takeoff` | °C | — | — | fans_off 300; fans_on 150 | fans_off 300; fans_on 150 | fans_off 300; fans_on 150 | fans_off 300; fans_on 150 | fans_off 300 |
| `brakes.max_tyre_ground_speed_kt` | kt GS | 165 | — | — | — | — | — | — |
| `brakes.type` | - | — | standard steel; option carbon (Messier-Bugatti-… | hydraulic multi-disc; normal = green, alternate… | hydraulic multi-disc; normal = green, alternate… | hydraulic multi-disc; normal = green, alternate… | hydraulic multi-disc; normal = green, alternate… | ≈braked_wheels 8; nose_braked false; material c… |
| `certification.part25_limit_descent` | m/s | 3.05 | — | — | — | — | — | — |
| `certification.tail_clearance` | deg | strut_extended_deg 8; strut_compressed_deg 5.9 | — | — | — | — | — | — |
| `geometry.cg_height_parked` | m | ≈1.65 | ≈2.7 | 2.71 | 2.71 | ≈2.71 | ≈2.71 | ≈3.6 |
| `geometry.main_contact_body_extended` | m FRD | ≈[[-0.86, -2.05, 1.8], [-0.86, 2.05, 1.8]] | ≈[[-1.041, -2.857, 2.895], [-1.041, 2.857, 2.89… | ≈[[-1.399, -3.8, 2.996], [-1.399, 3.8, 2.996]] | ≈[[-1.399, -3.8, 2.996], [-1.399, 3.8, 2.996]] | ≈[[-1.4, -3.8, 2.996], [-1.4, 3.8, 2.996]] | ≈[[-1.4, -3.8, 2.996], [-1.4, 3.8, 2.996]] | ≈[[-2.032, -5.35, 4.1], [-2.032, 5.35, 4.1]] |
| `geometry.nose_contact_body_extended` | m FRD | ≈[9.91, 0, 1.75] | ≈[14.554, 0, 2.815] | ≈[11.241, 0, 2.911] | ≈[11.241, 0, 2.911] | ≈[15.51, 0, 2.911] | ≈[15.51, 0, 2.911] | ≈[23.368, 0, 4] |
| `geometry.ref_cg` | m STA | ≈STA 12.84; pctMAC 25 | ≈STA 18.644; pctMAC 25; LEMAC_STA 17.654; MAC 3… | ≈STA 16.31; pctMAC 25; LEMAC_STA 15.262; MAC 4.… | ≈STA 16.31; pctMAC 25; LEMAC_STA 15.262; MAC 4.… | ≈STA 20.578; pctMAC 25; LEMAC_STA 19.53; MAC 4.… | ≈STA 20.578; pctMAC 25; LEMAC_STA 19.53; MAC 4.… | ≈STA 30.77; pctMAC 25 |
| `geometry.tail_contact_body` | m FRD | — | ≈[-17.349, 0, -0.275] | ≈[-17.849, 0, -0.953] | ≈[-17.849, 0, -0.953] | ≈[-20.521, 0, -0.859] | ≈[-20.521, 0, -0.859] | — |
| `steering.caster_max` | deg | ≈91 | — | — | — | — | — | — |
| `steering.deflated_tyre_limits` | kt, deg | — | — | — | — | — | — | one_deflated_turn_kt 7; two_deflated_same_gear_… |
| `steering.mode` | - | tiller (hand wheel); การเลี้ยวด้วยแป้นยังไม่ยืน… | type tiller_plus_pedal | tiller + rudder pedals (hydraulic nose wheel st… | tiller + rudder pedals (hydraulic nose wheel st… | tiller + rudder pedals (hydraulic nose wheel st… | tiller + rudder pedals (hydraulic nose wheel st… | ≈hydraulic nose wheel steering (tiller + rudder… |
| `steering.pedal_max` | deg | ≈— | 7 | angle_deg 6; fade_start_mps 20.58; zero_at_mps … | angle_deg 6; fade_start_mps 20.58; zero_at_mps … | angle_deg 6; fade_start_mps 20.58; zero_at_mps … | angle_deg 6; fade_start_mps 20.58; zero_at_mps … | ≈angle_deg 6; note ค่า A320 ชั่วคราว |
| `steering.tiller_max` | deg | ≈60 | 78 | angle_deg 75; full_below_mps 10.29; zero_at_mps… | angle_deg 75; full_below_mps 10.29; zero_at_mps… | angle_deg 75; full_below_mps 10.29; zero_at_mps… | angle_deg 75; full_below_mps 10.29; zero_at_mps… | angle_deg 72 |
| `steering.tow_max` | deg | — | — | towbar 95; towbarless 85; deflated_tyre_taxi 30 | towbar 95; towbarless 85; deflated_tyre_taxi 30 | towbar 95; towbarless 85; deflated_tyre_taxi 30 | towbar 95; towbarless 85; deflated_tyre_taxi 30 | — |
| `strut_main.c_compression` | N s/m | — | 145939 | — | — | — | — | — |
| `strut_main.c_linear` | N s/m | — | — | 349626 | 349626 | 349626 | 349626 | 786823 |
| `strut_main.c_rebound` | N s/m | — | 291878 | — | — | — | — | — |
| `strut_main.k_linear` | N/m | — | 1751268 | 872496 | 872496 | 872496 | 872496 | 2007689 |
| `strut_main.stroke` | m | ≈0.35 | ≈0.373 | — | — | — | — | — |
| `strut_nose.c_compression` | N s/m | — | 58376 | — | — | — | — | — |
| `strut_nose.c_linear` | N s/m | — | — | 247775 | 247775 | 247775 | 247775 | 583133 |
| `strut_nose.c_rebound` | N s/m | — | 116751 | — | — | — | — | — |
| `strut_nose.k_linear` | N/m | — | 1313451 | 451462 | 451462 | 451462 | 451462 | 786190 |
| `strut_nose.stroke` | m | — | ≈0.35 | — | — | — | — | — |
| `tyre_main.limit_ground_speed` | m/s | — | — | 100.3 | 100.3 | 100.3 | 100.3 | 104.95 |
| `tyre_main.load_ratio_MTW` | - | — | ≈0.909 | — | — | — | — | — |
| `tyre_main.operating_pressure` | psi | ≈120 | ≈1413 | 71900-75900kg 1331; 77400kg 1379 | 71900-75900kg 1331; 77400kg 1379 | ≈77400kg_A320_value 1379 | ≈77400kg_A320_value 1379 | ≈est_MRW_242t 1412 |
| `tyre_main.outside_diameter` | m | ≈0.864 | 1.13 | ≈1.168 | ≈1.168 | ≈1.27 | ≈1.27 | ≈1.4 |
| `tyre_main.rated_load` | N | ≈57827 | 198836 | size 49x17 30PR; N 207700 | size 49x17 30PR; N 207700 | size 49x17 30PR; N 207700 | size 49x17 30PR; N 207700 | size 54x21.0-23 36PR; N 304700 |
| `tyre_main.rated_pressure` | kPa | — | 1475 | size 49x17 30PR; kPa 1344 | size 49x17 30PR; kPa 1344 | size 49x17 30PR; kPa 1344 | size 49x17 30PR; kPa 1344 | size 54x21.0-23 36PR; kPa 1538 |
| `tyre_main.section_width` | m | ≈0.254 | 0.419 | ≈0.432 | ≈0.432 | ≈0.455 | ≈0.455 | ≈0.53 |
| `tyre_main.size` | - | H34x10.0R16 | size H44.5x16.5-21; ply 28; count 4 | 46x17R20 30PR (2 ล้อต่อขา) | 46x17R20 30PR (2 ล้อต่อขา) | 1270x455R22 30PR หรือ 32PR (2 ล้อต่อขา) | 1270x455R22 30PR หรือ 32PR (2 ล้อต่อขา) | size 1400x530R23; type radial; ply [32, 36]; co… |
| `tyre_main.speed_rating` | m/s | — | 100.6 | 100.6 | 100.6 | 100.6 | 100.6 | 105.05 |
| `tyre_main.static_load_MTOW` | N | ≈51877 | — | — | — | — | — | — |
| `tyre_nose.operating_pressure` | kPa | — | ≈1276 | — | — | — | — | — |
| `tyre_nose.outside_diameter` | m | ≈0.455 | 0.686 | ≈0.762 | ≈0.762 | ≈0.762 | ≈0.762 | ≈1.05 |
| `tyre_nose.rated_load` | N | ≈16014 | 42925 | 63200 | 63200 | 63200 | 63200 | — |
| `tyre_nose.rated_pressure` | kPa | — | 1379 | 1372 | 1372 | 1372 | 1372 | — |
| `tyre_nose.section_width` | m | — | 0.197 | ≈0.224 | ≈0.224 | ≈0.224 | ≈0.224 | ≈0.395 |
| `tyre_nose.size` | - | 450x190-5 | size 27x7.75-15; ply 12; count 2 | 30x8.8R15 16PR (2 ล้อ) | 30x8.8R15 16PR (2 ล้อ) | 30x8.8R15 16PR (2 ล้อ) | 30x8.8R15 16PR (2 ล้อ) | size 1050x395R16; type radial; ply 28; count 2 |

## `wind` ลมและ wake (4)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `wake.b0_over_b` | - | ≈0.785 | 0.7854 | 0.7854 | 0.7854 | 0.7854 | 0.7854 | 0.7854 |
| `wake.category` | - | — | ICAO M; RECAT_EU CAT-D Upper Medium; FAA_RECAT … | ICAO M; RECAT_EU CAT-D Upper Medium; ARC 3C (MT… | ICAO M; RECAT_EU CAT-D (A20N ไม่อยู่ในตาราง Ed … | ICAO M; RECAT_EU CAT-D Upper Medium; ARC 4C; AD… | ICAO M; RECAT_EU CAT-D (A21N ไม่อยู่ในตาราง Ed … | ICAO H; RECAT_EU CAT-B Upper Heavy; FAA_CWT B; … |
| `wake.leaders` | kg, m, kt, m2/s… | ≈icao_wtc M; recat_eu E (Lower Medium); Gamma0_… | ≈B737_800W mass_kg 66361; span_m 35.79; Vapp_kt… | ≈A320ceo mass_kg 64500; span_m 34.1; Vapp_kt 13… | ≈A320neo mass_kg 67400; span_m 35.8; Vapp_kt 13… | ≈A321ceo mass_kg 75500; span_m 34.1; Vapp_kt 14… | ≈A321neo mass_kg 79200; span_m 35.8; Vapp_kt 14… | ≈A330_300_MLW mass_kg 187000; span_m 60.3; Vapp… |
| `wake.rc_over_b` | - | ≈0.05 | — | — | — | — | — | — |

## `controls` ระบบบังคับการบิน (140)

หัวข้อที่ให้ค่า: [3.7](07-flight-controls.md), [3.8](08-fbw-laws.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `architecture` | - | pitch reversible; roll reversible; yaw reversib… | pitch feel; roll feel; yaw feel; trim ths | pitch fbw; roll fbw; yaw feel; trim ths | pitch fbw; roll fbw; yaw feel; trim ths | pitch fbw; roll fbw; yaw feel; trim ths | pitch fbw; roll fbw; yaw feel; trim ths | pitch fbw; roll fbw; yaw feel; trim ths |
| `fbw.abnormal_attitude.effect` | - | — | — | ALT2 with max roll authority; no autotrim in ph… | ALT2 with max roll authority; no autotrim in ph… | ALT2 with max roll authority; no autotrim in ph… | ALT2 with max roll authority; no autotrim in ph… | — |
| `fbw.abnormal_attitude.triggers` | deg, m/s, Mach | — | — | bank_deg 125; pitch_up_deg 50; pitch_down_deg -… | bank_deg 125; pitch_up_deg 50; pitch_down_deg -… | bank_deg 125; pitch_up_deg 50; pitch_down_deg -… | bank_deg 125; pitch_up_deg 50; pitch_down_deg -… | bank_deg 125 |
| `fbw.alternate_law.airspeed_drop_trigger` | m/s, s | — | — | — | — | — | — | dCAS 15.433; dt 1 |
| `fbw.alternate_law.alt1_roll` | - | — | — | — | — | — | — | normal |
| `fbw.alternate_law.alt2_roll` | - | — | — | — | — | — | — | direct |
| `fbw.alternate_law.gear_down_to_direct` | - | — | — | true | true | true | true | — |
| `fbw.alternate_law.high_speed_stability` | - | — | — | nose_up_demand_above_VMO_MMO_overridable | nose_up_demand_above_VMO_MMO_overridable | nose_up_demand_above_VMO_MMO_overridable | nose_up_demand_above_VMO_MMO_overridable | — |
| `fbw.alternate_law.low_speed_stability_onset` | m/s | — | — | [2.572, 5.144] | [2.572, 5.144] | [2.572, 5.144] | [2.572, 5.144] | — |
| `fbw.alternate_law.pitch` | - | — | — | nz_demand; nz limits kept; no pitch attitude pr… | nz_demand; nz limits kept; no pitch attitude pr… | nz_demand; nz limits kept; no pitch attitude pr… | nz_demand; nz limits kept; no pitch attitude pr… | — |
| `fbw.alternate_law.roll` | - | — | — | direct | direct | direct | direct | — |
| `fbw.alternate_law.stall_warning_speed_factor` | VS1g | — | — | — | — | — | — | 1.03 |
| `fbw.alternate_law.triggers` | - | — | — | reduced_prot อาร์เรย์ 10 ค่า; no_prot [3 ADR, b… | reduced_prot อาร์เรย์ 10 ค่า; no_prot [3 ADR, b… | reduced_prot อาร์เรย์ 10 ค่า; no_prot [3 ADR, b… | reduced_prot อาร์เรย์ 10 ค่า; no_prot [3 ADR, b… | — |
| `fbw.alternate_law.yaw_damper_authority` | deg | — | — | 5 | 5 | 5 | 5 | — |
| `fbw.computers` | - | — | — | pitch_roll 2 ELAC + 3 SEC; yaw 2 FAC (rudder ต่… | pitch_roll 2 ELAC + 3 SEC; yaw 2 FAC (rudder ต่… | pitch_roll 2 ELAC + 3 SEC; yaw 2 FAC (rudder ต่… | pitch_roll 2 ELAC + 3 SEC; yaw 2 FAC (rudder ต่… | pitch_roll 3 PRIM (FCPC) + 2 SEC (FCSC); yaw กล… |
| `fbw.direct_law.autotrim` | - | — | — | false | false | false | false | false |
| `fbw.direct_law.pitch` | - | — | — | stick_to_elevator; max deflection f(CG, config) | stick_to_elevator; max deflection f(CG, config) | stick_to_elevator; max deflection f(CG, config) | stick_to_elevator; max deflection f(CG, config) | — |
| `fbw.direct_law.roll_rate_max` | deg/s | — | — | clean 30; slats 25 | clean 30; slats 25 | clean 30; slats 25 | clean 30; slats 25 | — |
| `fbw.direct_law.triggers` | - | — | — | [3 IR, RA fail with gear down, ALT law + gear d… | [3 IR, RA fail with gear down, ALT law + gear d… | [3 IR, RA fail with gear down, ALT law + gear d… | [3 IR, RA fail with gear down, ALT law + gear d… | — |
| `fbw.mechanical_backup` | - | — | — | pitch THS trim wheel; yaw rudder pedals | pitch THS trim wheel; yaw rudder pedals | pitch THS trim wheel; yaw rudder pedals | pitch THS trim wheel; yaw rudder pedals | — |
| `fbw.normal_law.flare_mode.blend_RA` | m | — | — | [15.24, 9.144] | [15.24, 9.144] | [15.24, 9.144] | [15.24, 9.144] | — |
| `fbw.normal_law.flare_mode.engage_RA` | m | — | — | 15.24 | 15.24 | 15.24 | 30.48 | 30.48 |
| `fbw.normal_law.flare_mode.gains` | 1/s, -, deg | — | — | ≈K_theta 0.8; K_q 1; stick_theta_deg 10 | ≈K_theta 0.8; K_q 1; stick_theta_deg 10 | ≈K_theta 0.8; K_q 1; stick_theta_deg 10 | ≈K_theta 0.8; K_q 1; stick_theta_deg 10 | — |
| `fbw.normal_law.flare_mode.ground_thrust_effect_compensation` | - | — | — | — | — | false | false | — |
| `fbw.normal_law.flare_mode.law_type` | - | — | — | — | — | — | — | direct_full_authority_no_autotrim_plus_nose_dow… |
| `fbw.normal_law.flare_mode.nose_down_target` | deg | — | — | -2 | -2 | -2 | -2 | ≈-2 |
| `fbw.normal_law.flare_mode.nose_down_time` | s | — | — | 8 | 8 | 8 | 8 | ≈8 |
| `fbw.normal_law.flare_mode.transition_time` | s | — | — | — | — | — | — | 2 |
| `fbw.normal_law.ground_mode.blend_after_liftoff` | s | — | — | 5 | 5 | 5 | 5 | 5 |
| `fbw.normal_law.ground_mode.stick_to_elevator` | - | — | — | direct | direct | direct | direct | — |
| `fbw.normal_law.ground_mode.transition_logic_model` | - | — | — | to_flight airborne && (theta > 8 deg \|\| RA > … | to_flight airborne && (theta > 8 deg \|\| RA > … | to_flight airborne && (theta > 8 deg \|\| RA > … | to_flight airborne && (theta > 8 deg \|\| RA > … | — |
| `fbw.normal_law.pitch.Vco` | m/s | — | — | ≈121.9 | ≈121.9 | ≈121.9 | ≈121.9 | ≈121.9 |
| `fbw.normal_law.pitch.autotrim_bank_max` | deg | — | — | 33 | 33 | 33 | 33 | 33 |
| `fbw.normal_law.pitch.autotrim_freeze_RA` | m | — | — | 15.24 | 15.24 | 15.24 | 30.48 | — |
| `fbw.normal_law.pitch.autotrim_gain_Kt` | 1/s | — | — | ≈0.5 | ≈0.5 | ≈0.5 | ≈0.5 | — |
| `fbw.normal_law.pitch.autotrim_inhibit` | - | — | — | alpha_prot no_nose_up; hsp frozen; direct_law o… | alpha_prot no_nose_up; hsp frozen; direct_law o… | alpha_prot no_nose_up; hsp frozen; direct_law o… | alpha_prot no_nose_up; hsp frozen; direct_law o… | alpha_prot no_nose_up; hsp frozen; direct_law o… |
| `fbw.normal_law.pitch.autotrim_nz_window` | g | — | — | [0.5, 1.3] | [0.5, 1.3] | [0.5, 1.3] | [0.5, 1.3] | [0.5, 1.3] |
| `fbw.normal_law.pitch.bank_compensation_max` | deg | — | — | 33 | 33 | 33 | 33 | 33 |
| `fbw.normal_law.pitch.command` | - | — | — | C_star_nz_integral | C_star_nz_integral | C_star_nz_integral | C_star_nz_integral | C_star_nz_integral |
| `fbw.normal_law.pitch.gains` | rad/g, rad/(g s… | — | — | ≈Kp 0.06; Ki 0.2; qbar0 8000; sched_min 0.3; sc… | ≈Kp 0.06; Ki 0.2; qbar0 8000; sched_min 0.3; sc… | ≈Kp 0.06; Ki 0.2; qbar0 8000; sched_min 0.3; sc… | ≈Kp 0.06; Ki 0.2; qbar0 8000; sched_min 0.3; sc… | ≈Kp 0.06; Ki 0.2; qbar0 8000; sched_min 0.3; sc… |
| `fbw.normal_law.pitch.path_hold` | 1/s, 1/s2, g | — | — | ≈Kg 1; Kgi 0.2; dnz_max 0.3 | ≈Kg 1; Kgi 0.2; dnz_max 0.3 | ≈Kg 1; Kgi 0.2; dnz_max 0.3 | ≈Kg 1; Kgi 0.2; dnz_max 0.3 | ≈Kg 1; Kgi 0.2; dnz_max 0.3 |
| `fbw.normal_law.pitch.stick_to_dnz` | g (เทียบ 1 g) | — | — | ≈clean pull_full 1.5; push_full -2; slats_flaps… | ≈clean pull_full 1.5; push_full -2; slats_flaps… | ≈clean pull_full 1.5; push_full -2; slats_flaps… | ≈clean pull_full 1.5; push_full -2; slats_flaps… | ≈clean pull_full 1.5; push_full -2; slats_flaps… |
| `fbw.normal_law.pitch.ths_autotrim_nose_up_limit` | deg | — | — | -11 | -11 | -11 | -11 | — |
| `fbw.normal_law.roll.ap_disconnect_bank` | deg | — | — | 45 | 45 | 45 | 45 | — |
| `fbw.normal_law.roll.bank_limits` | deg | — | — | neutral_spiral 33; full_stick 67; aoa_prot 45; … | neutral_spiral 33; full_stick 67; aoa_prot 45; … | neutral_spiral 33; full_stick 67; aoa_prot 45; … | neutral_spiral 33; full_stick 67; aoa_prot 45; … | neutral_spiral 33; full_stick 67; aoa_prot 45; … |
| `fbw.normal_law.roll.bank_return_rate` | deg/s | — | — | ≈at_33 0; at_limit 15; limit_plus_5 20 | ≈at_33 0; at_limit 15; limit_plus_5 20 | ≈at_33 0; at_limit 15; limit_plus_5 20 | ≈at_33 0; at_limit 15; limit_plus_5 20 | — |
| `fbw.normal_law.roll.gains` | rad/s, -, -, deg | — | — | ≈wn 2; zeta 0.8; Ki_over_Kphi 0.5; ref_window_d… | ≈wn 2; zeta 0.8; Ki_over_Kphi 0.5; ref_window_d… | ≈wn 2; zeta 0.8; Ki_over_Kphi 0.5; ref_window_d… | ≈wn 2; zeta 0.8; Ki_over_Kphi 0.5; ref_window_d… | ≈wn 2; zeta 0.8; Ki_over_Kphi 0.5; ref_window_d… |
| `fbw.normal_law.roll.p_cmd_max` | deg/s | — | — | 15 | 15 | 15 | 15 | ≈15 |
| `fbw.normal_law.roll.turn_coordination` | - | — | — | ≈r_cmd = g tan(phi)/V; beta -> 0 | ≈r_cmd = g tan(phi)/V; beta -> 0 | ≈r_cmd = g tan(phi)/V; beta -> 0 | ≈r_cmd = g tan(phi)/V; beta -> 0 | — |
| `fbw.protections.alpha_anchor_1988_conf3` | deg | — | — | aprot 14.5; amax 17.5; afloor 15 | aprot 14.5; amax 17.5; afloor 15 | aprot 14.5; amax 17.5; afloor 15 | aprot 14.5; amax 17.5; afloor 15 | — |
| `fbw.protections.alpha_anchor_us1549_conf2` | deg | — | — | amax 17.5; alpha_touchdown [13, 14] | amax 17.5; alpha_touchdown [13, 14] | amax 17.5; alpha_touchdown [13, 14] | amax 17.5; alpha_touchdown [13, 14] | — |
| `fbw.protections.alpha_floor_fcom` | deg | — | — | CONF0 9.5; CONF1 15; CONF2 15; CONF3 14; FULL 13 | CONF0 9.5; CONF1 15; CONF2 15; CONF3 14; FULL 13 | CONF0 9.5; CONF1 15; CONF2 15; CONF3 14; FULL 13 | CONF0 9.5; CONF1 15; CONF2 15; CONF3 14; FULL 13 | — |
| `fbw.protections.alpha_floor_logic` | -, Mach, deg | — | — | active lift-off ถึง RA 30.48 m ขาลง; mach_max 0… | active lift-off ถึง RA 30.48 m ขาลง; mach_max 0… | active lift-off ถึง RA 30.48 m ขาลง; mach_max 0… | active lift-off ถึง RA 30.48 m ขาลง; mach_max 0… | — |
| `fbw.protections.alpha_mode_gains` | -, s, - | — | — | ≈kA 4; kAa 5; kAd 0.15 | ≈kA 4; kAa 5; kAd 0.15 | ≈kA 4; kAa 5; kAd 0.15 | ≈kA 4; kAa 5; kAd 0.15 | — |
| `fbw.protections.alpha_mode_logic` | s, -, s, deg/s,… | — | — | ≈entry_lead_s 0.5; exit_stick -0.5; exit_fwd_ti… | ≈entry_lead_s 0.5; exit_stick -0.5; exit_fwd_ti… | ≈entry_lead_s 0.5; exit_stick -0.5; exit_fwd_ti… | ≈entry_lead_s 0.5; exit_stick -0.5; exit_fwd_ti… | — |
| `fbw.protections.alpha_rule` | -, deg, deg | — | — | ≈CL_amax_over_CLmax 0.873; aprot_below_amax 3; … | ≈CL_amax_over_CLmax 0.873; aprot_below_amax 3; … | ≈CL_amax_over_CLmax 0.873; aprot_below_amax 3; … | ≈CL_amax_over_CLmax 0.873; aprot_below_amax 3; … | ≈CL_amax_over_CLmax 0.873; aprot_below_amax 3; … |
| `fbw.protections.alpha_speed_sensitivity` | m/s per deg | — | — | — | — | — | — | cruise 12.861; approach 2.572 |
| `fbw.protections.ap_disconnect_alpha_margin` | deg | — | — | 1 | 1 | 1 | 1 | — |
| `fbw.protections.cert_nz_limits` | g | — | — | clean [-1, 2.5]; high_lift [0, 2] | clean [-1, 2.5]; high_lift [0, 2] | clean [-1, 2.5]; high_lift [0, 2] | clean [-1, 2.5]; high_lift [0, 2] | — |
| `fbw.protections.fd_removal` | deg | — | — | up 25; down -13; restore_up 22; restore_down -10 | up 25; down -13; restore_up 22; restore_down -10 | up 25; down -13; restore_up 22; restore_down -10 | up 25; down -13; restore_up 22; restore_down -10 | — |
| `fbw.protections.g_load_ecam` | g | — | — | [0.7, 1.4] | [0.7, 1.4] | [0.7, 1.4] | [0.7, 1.4] | — |
| `fbw.protections.high_incidence_cert` | m/s/s, m/s/s, %… | — | — | — | — | vmin_entry_rate 0.514; icing_decel_max 1.029; s… | vmin_entry_rate 0.514; icing_decel_max 1.029; s… | — |
| `fbw.protections.hsp` | m/s, Mach | — | — | dV_on 3.087; dM_on 0.01; dV_nd_zero 8.231; dM_n… | dV_on 3.087; dM_on 0.01; dV_nd_zero 8.231; dM_n… | dV_on 3.087; dM_on 0.01; dV_nd_zero 8.231; dM_n… | dV_on 3.087; dM_on 0.01; dV_nd_zero 8.231; dM_n… | dV_on 3.087; dM_on 0.01; dV_nd_zero 8.231; dM_n… |
| `fbw.protections.hsp_dnz_max` | g | — | — | — | — | — | — | 0.75 |
| `fbw.protections.hsp_model` | s, g/(m/s), g | — | — | ≈tau_pred_s 8; dnz_slope_g_per_mps 0.1458; dnz_… | ≈tau_pred_s 8; dnz_slope_g_per_mps 0.1458; dnz_… | ≈tau_pred_s 8; dnz_slope_g_per_mps 0.1458; dnz_… | ≈tau_pred_s 8; dnz_slope_g_per_mps 0.1458; dnz_… | — |
| `fbw.protections.nz_limits` | g | — | — | clean [-1, 2.5]; slats_flaps [0, 2] | clean [-1, 2.5]; slats_flaps [0, 2] | clean [-1, 2.5]; slats_flaps [0, 2] | clean [-1, 2.5]; slats_flaps [0, 2] | clean [-1, 2.5]; slats_flaps [0, 2] |
| `fbw.protections.pitch_limit_gain` | 1/s | — | — | ≈0.5 | ≈0.5 | ≈0.5 | ≈0.5 | — |
| `fbw.protections.pitch_limits` | deg | — | — | nose_up_conf0_3 30; nose_up_conf0_3_low_speed 2… | nose_up_conf0_3 30; nose_up_conf0_3_low_speed 2… | nose_up_conf0_3 30; nose_up_conf0_3_low_speed 2… | nose_up_conf0_3 30; nose_up_conf0_3_low_speed 2… | nose_up 30; nose_up_low_speed 25; nose_down -15 |
| `fbw.protections.stall_warning_alpha_landing` | deg | — | — | 23 | 23 | 23 | 23 | — |
| `fbw.protections.stall_warning_alpha_max` | deg | — | — | — | — | — | — | 23 |
| `fbw.sidestick.ap_override` | N | — | — | pitch 50; roll 35 | pitch 50; roll 35 | pitch 50; roll 35 | pitch 50; roll 35 | — |
| `fbw.sidestick.breakout` | N | — | — | 4.89 | 4.89 | 4.89 | 4.89 | — |
| `fbw.sidestick.dual_input_threshold` | deg | — | — | 2 | 2 | 2 | 2 | — |
| `fbw.sidestick.force_at_stop` | N | — | — | pitch 100.1; roll_out 24.9; roll_in 34.7 | pitch 100.1; roll_out 24.9; roll_in 34.7 | pitch 100.1; roll_out 24.9; roll_in 34.7 | pitch 100.1; roll_out 24.9; roll_in 34.7 | — |
| `fbw.sidestick.gradient` | N/deg | — | — | ≈pitch 5.949; roll_out 1.001; roll_in 1.49 | ≈pitch 5.949; roll_out 1.001; roll_in 1.49 | ≈pitch 5.949; roll_out 1.001; roll_in 1.49 | ≈pitch 5.949; roll_out 1.001; roll_in 1.49 | — |
| `fbw.sidestick.takeover_latch` | s | — | — | 40 | 40 | 40 | 40 | — |
| `fbw.sidestick.travel` | deg | — | — | pitch 16; roll 20 | pitch 16; roll 20 | pitch 16; roll 20 | pitch 16; roll 20 | pitch 16; roll 20 |
| `fbw.sim.input_mapping` | - | — | — | stick_units [-1, 1] หลัง deadzone + expo; expo_… | stick_units [-1, 1] หลัง deadzone + expo; expo_… | stick_units [-1, 1] หลัง deadzone + expo; expo_… | stick_units [-1, 1] หลัง deadzone + expo; expo_… | stick_units [-1, 1] หลัง deadzone + expo; expo_… |
| `fbw.sim.time_delay_budget` | s | — | — | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| `fbw.update_rate_hz` | Hz | — | — | ≈240 | ≈240 | ≈240 | ≈240 | ≈240 |
| `feel.ap_override` | N | — | cws_N 44.5; single_ch_N 111; dual_ch_N 222 | — | — | — | — | — |
| `feel.elevator_feel_computer` | Pa, -, deg | — | p_base_Pa 1241056; p_max_Pa 9652660; efsm_suppl… | — | — | — | — | — |
| `feel.manual_reversion_forces` | N | — | roll_initiate_N 178; pitch_initiate_N 267; rudd… | — | — | — | — | — |
| `feel.pedal` | N, m, m/deg, N/m | — | breakout_N 40; full_N 311; travel_m 0.1016; m_p… | — | — | — | — | — |
| `feel.pitch_gradient` | N, N/deg, Pa/Pa… | — | ≈Fbo_N 17.8; Kmax_N_per_deg_elevator 60.62; kq_… | — | — | — | — | — |
| `feel.wheel` | N | — | ≈breakout_N 13; full_N 110 | — | — | — | — | — |
| `feel.wheel_force_design_max_N` | N | 267 | — | — | — | — | — | — |
| `hydraulics` | Pa; รายการพื้นบ… | — | nominal_Pa 20684271; A [aileron, elevator, rudd… | nominal_Pa 20684271; aileron [B, G]; elevator_L… | nominal_Pa 20684271; aileron [B, G]; elevator_L… | nominal_Pa 20684271; aileron [B, G]; elevator_L… | nominal_Pa 20684271; aileron [B, G]; elevator_L… | — |
| `inceptors.sidestick` | N, deg | — | — | ≈ap_override_N pitch 50; roll 35; travel_deg pi… | ≈ap_override_N pitch 50; roll 35; travel_deg pi… | ≈ap_override_N pitch 50; roll 35; travel_deg pi… | ≈ap_override_N pitch 50; roll 35; travel_deg pi… | — |
| `mech.cable_tension_N` | N | [200, 250] | — | — | — | — | — | — |
| `mech.column_travel_deg` | deg | up 11.25; down 6.75; stop_up 13.25; stop_down 8… | — | — | — | — | — | — |
| `mech.pitch_uncoupling` | N | each_column_N [500, 550]; total_differential_N … | — | — | — | — | — | — |
| `mech.stick_pusher_column_deg` | deg | 8 | — | — | — | — | — | — |
| `mech.wheel_travel_deg` | deg | 65 | — | — | — | — | — | — |
| `pitch.Ch_alpha` | 1/rad | ≈-0.0173 | — | — | — | — | — | — |
| `pitch.Ch_delta` | 1/rad | ≈-0.0519 | — | — | — | — | — | — |
| `pitch.S_e` | m2 | ≈3.5 | — | — | — | — | — | — |
| `pitch.architecture` | - | kind reversible; input force | kind feel; input force | — | — | — | — | — |
| `pitch.breakout` | N | ≈20 | ≈17.8 | — | — | — | — | — |
| `pitch.c_e` | m | ≈0.48 | — | — | — | — | — | — |
| `pitch.gearing` | rad/m | ≈3.717 | — | — | — | — | — | — |
| `pitch.rate_limit` | deg/s | ≈60 | 50 | — | — | — | — | — |
| `pitch.stops` | deg | teu 23; ted 13 | ≈teu 22.2; ted 19.3 | — | — | — | — | — |
| `pitch.trim_rate_flaps_down` | deg/s | ≈0.5 | 0.4 | — | — | — | — | — |
| `pitch.trim_rate_flaps_up` | deg/s | ≈0.5 | 0.2 | — | — | — | — | — |
| `reference_types.atr72_ap_aileron_rate_monitor` | deg/s | 3.6 | — | — | — | — | — | — |
| `roll.Ch_delta` | 1/rad | ≈-0.0667 | — | — | — | — | — | — |
| `roll.S_a_each` | m2 | ≈1.5 | — | — | — | — | — | — |
| `roll.architecture` | - | kind reversible; input force | kind feel; input force | — | — | — | — | — |
| `roll.breakout` | N | ≈13 | ≈13 | — | — | — | — | — |
| `roll.c_a` | m | ≈0.45 | — | — | — | — | — | — |
| `roll.gearing` | rad/m | ≈1.197 | — | — | — | — | — | — |
| `roll.rate_limit` | deg/s | ≈80 | ≈50 | — | — | — | — | — |
| `roll.stops` | deg | max 14 | ≈max 20.5 | — | — | — | — | — |
| `roll.tab_max` | deg | 4 | — | — | — | — | — | — |
| `rudder_limiter` | deg, kt, s | kind TLU; low_speed_deg 27; high_speed_deg 3; t… | ≈kind pressure_reducer; classic full_Pa 2068427… | ตาราง 7 ค่า | ตาราง 7 ค่า | ตาราง 7 ค่า | ตาราง 7 ค่า | — |
| `spoiler_mixing.roll` | deg | threshold_aileron_deg 2.5; gain_deg_per_deg 4.9… | ≈ตาราง 8 ค่า | — | — | — | — | — |
| `spoiler_mixing.speedbrake` | deg | — | ≈ตาราง 3 ค่า | ตาราง 5 ค่า | ตาราง 5 ค่า | ตาราง 5 ค่า | ตาราง 5 ค่า | — |
| `surfaces.aileron` | deg, deg/s, s | — | ≈travel_deg up 20.5; down 15.5; rate_dps 50; ac… | ≈travel_deg up 25; down 25; rate_dps 40; actuat… | ≈travel_deg up 25; down 25; rate_dps 40; actuat… | ≈travel_deg up 25; down 25; rate_dps 40; actuat… | ≈travel_deg up 25; down 25; rate_dps 40; actuat… | — |
| `surfaces.elevator` | deg, deg/s, s | — | ≈travel_deg up 22.2; down 19.3; rate_dps 50; ac… | ≈travel_deg up 30; down 17; rate_dps 40; actuat… | ≈travel_deg up 30; down 17; rate_dps 40; actuat… | ≈travel_deg up 30; down 17; rate_dps 40; actuat… | ≈travel_deg up 30; down 17; rate_dps 40; actuat… | travel_deg up 30; down 15 |
| `surfaces.ground_spoiler` | -, deg/s | — | ≈panels_per_wing 2; rate_dps 55; hydraulic_syst… | ≈panels [1, 2, 3, 4, 5]; travel_deg up 50; spee… | ≈panels [1, 2, 3, 4, 5]; travel_deg up 50; spee… | ≈panels [1, 2, 3, 4, 5]; travel_deg up 50; spee… | ≈panels [1, 2, 3, 4, 5]; travel_deg up 50; spee… | — |
| `surfaces.roll_spoiler` | deg, deg/s, s | ≈travel_deg up 57; rate_dps 60; actuator_tau_s … | ≈travel_deg up 33; inboard_up_deg 38; rate_dps … | ≈panels [2, 3, 4, 5]; rate_dps 35; actuator_tau… | ≈panels [2, 3, 4, 5]; rate_dps 35; actuator_tau… | ≈panels [2, 3, 4, 5]; rate_dps 35; actuator_tau… | ≈panels [2, 3, 4, 5]; rate_dps 35; actuator_tau… | — |
| `surfaces.rudder` | deg, deg/s, s, N | — | ≈travel_deg left 26; right 26; pedal_stop_deg 2… | ≈travel_deg left 25; right 25; rate_dps 40; act… | ≈travel_deg left 25; right 25; rate_dps 40; act… | ≈travel_deg left 25; right 25; rate_dps 40; act… | ≈travel_deg left 25; right 25; rate_dps 40; act… | — |
| `surfaces.stabilizer` | deg, units, deg… | — | travel_deg LE_up 4.2; LE_down 12.9; units min -… | — | — | — | — | — |
| `surfaces.ths` | deg, deg/s | — | — | ≈travel_deg nose_up 13.5; nose_down 4; rate_dps… | ≈travel_deg nose_up 13.5; nose_down 4; rate_dps… | ≈travel_deg nose_up 13.5; nose_down 4; rate_dps… | ≈travel_deg nose_up 13.5; nose_down 4; rate_dps… | ≈travel_deg nose_up 14; nose_down 2; rate_dps 0… |
| `trim.electric_limits_units` | units | — | ≈flaps_up [3.9, 14.5]; flaps_down [-0.2, 16.9] | — | — | — | — | — |
| `trim.kinds` | - | pitch electric elevator trim tab (normal + stan… | — | — | — | — | — | — |
| `trim.mach_trim` | Mach | — | active_above_M 0.615; acts_on elevator neutral … | — | — | — | — | — |
| `trim.manual_rate_dps` | deg/s | — | ≈0.1 | — | — | — | — | — |
| `trim.rudder` | deg, deg/s | — | range_deg 16; rate_dps 0.5 | ≈range_deg 20; rate_dps 1 | ≈range_deg 20; rate_dps 1 | ≈range_deg 20; rate_dps 1 | ≈range_deg 20; rate_dps 1 | — |
| `trim.speed_trim` | deg/s | — | rate_dps_flaps_down 0.27; envelope 100 kt ถึง M… | — | — | — | — | — |
| `trim.stabilizer_units_to_deg` | deg/unit | — | offset_units 4; deg_per_unit 1; sign delta_s_de… | — | — | — | — | — |
| `yaw.S_r` | m2 | ≈3.7 | — | — | — | — | — | — |
| `yaw.architecture` | - | kind reversible; input force | kind feel; input force | — | — | — | — | — |
| `yaw.breakout` | N | ≈40 | ≈40 | — | — | — | — | — |
| `yaw.c_r` | m | ≈0.6 | — | — | — | — | — | — |
| `yaw.rate_limit` | deg/s | ≈60 | 66 | — | — | — | — | — |
| `yaw.stops` | deg | max 27 | max 26 | — | — | — | — | — |
| `yaw.trim_rate` | deg/s | — | 0.5 | — | — | — | — | — |
| `yaw_damper` | deg, deg/s | — | authority_deg 3; rate_dps 50; kind series (ไม่ข… | alternate_law_authority_deg 5 | alternate_law_authority_deg 5 | alternate_law_authority_deg 5 | alternate_law_authority_deg 5 | — |

## `afcs` autopilot, flight director, autothrust, autoland (44)

หัวข้อที่ให้ค่า: [3.9](09-afcs-autoland.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `arm_engage.AP_after_liftoff_s` | s | 12 | — | — | — | — | — | — |
| `arm_engage.AP_on_ground` | - | false | — | — | — | — | — | — |
| `arm_engage.AP_single_channel_min` | m | — | 15.24 | — | — | — | — | — |
| `arm_engage.AP_takeoff_min` | m | — | 121.92 | h 30.48; t_after_liftoff_s 5 | h 30.48; t_after_liftoff_s 5 | h 30.48; t_after_liftoff_s 5 | h 30.48; t_after_liftoff_s 5 | h 30.48; t_after_liftoff_s 5 |
| `arm_engage.GA_arm_RA` | m | — | 609.6 | — | — | — | — | — |
| `arm_engage.GS_capture_dot` | dot | — | 0.4 | — | — | — | — | — |
| `arm_engage.GS_star_deg` | deg | — | — | ≈0.1333 | ≈0.1333 | ≈0.1333 | ≈0.1333 | — |
| `arm_engage.LOC_capture_dot` | dot | — | 0.5 | — | — | — | — | — |
| `arm_engage.LOC_star_deg` | deg | — | — | ≈1.92 | ≈1.92 | ≈1.92 | ≈1.92 | — |
| `arm_engage.LOC_track_deg` | deg | — | — | ≈0.16 | ≈0.16 | ≈0.16 | ≈0.16 | — |
| `arm_engage.MUH` | m | — | — | ILS_CAT1 48.768; FINAL_APP_VS_FPA 76.2; circlin… | ILS_CAT1 48.768; FINAL_APP_VS_FPA 76.2; circlin… | ILS_CAT1 48.768; FINAL_APP_VS_FPA 76.2; circlin… | ILS_CAT1 48.768; FINAL_APP_VS_FPA 76.2; circlin… | ILS_CAT1 48.768 |
| `arm_engage.N1_equalization_max_deg` | deg | — | 8 | — | — | — | — | — |
| `arm_engage.NAV_min_RA` | m | — | — | 9.144 | 9.144 | 9.144 | 9.144 | — |
| `arm_engage.THR_HLD_kt` | m/s | — | 43.213 | — | — | — | — | — |
| `arm_engage.TOGA_FD_pitch` | deg | — | takeoff_initial -10; takeoff_after_60kt 15; GA_… | — | — | — | — | — |
| `autoland.ALIGN_ft` | m | — | ≈6.096 | start 6.096; end 3.048 | start 6.096; end 3.048 | start 6.096; end 3.048 | start 6.096; end 3.048 | ≈9.144 |
| `autoland.AP_disc_min_ft` | m | ≈30.48 | 15.24 | 0 | 0 | 0 | 0 | — |
| `autoland.AT_disc_after_TD_s` | s | — | 2 | — | — | — | — | — |
| `autoland.AUTOLAND_warning_below_ft` | m | — | — | 60.96 | 60.96 | 60.96 | 60.96 | — |
| `autoland.DUAL_AP_by_ft` | m | — | 243.84 | — | — | — | — | — |
| `autoland.FLARE_ARM_ft` | m | — | 457.2 | — | — | — | — | — |
| `autoland.FLARE_NOT_ARMED_DISC_ft` | m | — | 106.68 | — | — | — | — | — |
| `autoland.FLARE_ft` | m | — | 15.24 | ≈nominal 12.192; rule h = clamp(\|VS fpm\|/15, … | ≈nominal 12.192; rule h = clamp(\|VS fpm\|/15, … | ≈nominal 12.192; rule h = clamp(\|VS fpm\|/15, … | ≈nominal 12.192; rule h = clamp(\|VS fpm\|/15, … | ≈rule as a320ceo; at_743fpm 15.098 |
| `autoland.LAND_ft` | m | — | — | 121.92 | 121.92 | 121.92 | 121.92 | ≈121.92 |
| `autoland.LAND_must_by_ft` | m | — | — | 106.68 | 106.68 | 106.68 | 106.68 | — |
| `autoland.RETARD_after_flare_s` | s | — | 2.5 | — | — | — | — | — |
| `autoland.RETARD_ft` | m | — | 8.23 | thrust_idle 9.144; callout_autoland 3.048; call… | thrust_idle 9.144; callout_autoland 3.048; call… | thrust_idle 9.144; callout_autoland 3.048; call… | thrust_idle 9.144; callout_autoland 3.048; call… | ≈thrust_idle 9.144; callout_autoland 3.048 |
| `autoland.ROLLOUT` | - | — | option | main gear touchdown | main gear touchdown | main gear touchdown | main gear touchdown | ≈main gear touchdown |
| `autoland.STAB_TRIM_ft` | m | — | 121.92 | — | — | — | — | — |
| `capability.AH` | m | — | ≈30.48 | 30.48 | 30.48 | 30.48 | 30.48 | 60.96 |
| `capability.DH_min` | m | — | LAND2_fail_passive 15.24; LAND3_fail_operationa… | CAT2 30.48; CAT3_SINGLE 15.24; CAT3_DUAL 6.096;… | CAT2 30.48; CAT3_SINGLE 15.24; CAT3_DUAL 6.096;… | CAT2 30.48; CAT3_SINGLE 15.24; CAT3_DUAL 6.096;… | CAT2 30.48; CAT3_SINGLE 15.24; CAT3_DUAL 6.096;… | CAT3_SINGLE 15.24; CAT3_DUAL 6.096 |
| `capability.LPV_min` | m | 60.96 | — | — | — | — | — | — |
| `capability.RVR_min` | m | — | LAND2 125; LAND3 75 | CAT3_DUAL_noDH 75 | CAT3_DUAL_noDH 75 | CAT3_DUAL_noDH 75 | CAT3_DUAL_noDH 75 | CAT3_DUAL 75 |
| `capability.autoland_config` | - | — | flaps [30, 40]; engines both | — | — | — | — | — |
| `capability.autoland_gs_deg` | deg | — | min 2.5; max 3.25 | min 2.5; max 3.15 | min 2.5; max 3.15 | min 2.5; max 3.15 | min 2.5; max 3.15 | min 2.5; max 3.25 |
| `capability.autoland_misc` | m | — | — | airport_elev_max 2804.2; pressure_alt_min -304.… | airport_elev_max 2804.2; pressure_alt_min -304.… | airport_elev_max 2804.2; pressure_alt_min -304.… | airport_elev_max 2804.2; pressure_alt_min -304.… | — |
| `capability.autoland_wind_limits` | m/s | — | headwind 12.861; crosswind 10.289; tailwind 7.7… | headwind 15.433; crosswind 10.289; tailwind 5.1… | headwind 15.433; crosswind 10.289; tailwind 5.1… | headwind 15.433; crosswind 10.289; tailwind 5.1… | headwind 15.433; crosswind 10.289; tailwind 5.1… | headwind 18.006; crosswind 10.289; tailwind 5.1… |
| `capability.cat2_wind_demonstrated` | m/s | headwind 14.919; tailwind 5.1444; crosswind 8.7… | — | — | — | — | — | — |
| `capability.certified` | - | [CAT 2 (AP + FD)] | Cat 3 | [CAT 2, CAT 3 SINGLE, CAT 3 DUAL] | [CAT 2, CAT 3 SINGLE, CAT 3 DUAL] | [CAT 2, CAT 3 SINGLE, CAT 3 DUAL] | [CAT 2, CAT 3 SINGLE, CAT 3 DUAL] | [CAT 2, CAT 3 SINGLE, CAT 3 DUAL] |
| `capability.engine_out` | - | — | — | — | — | — | — | CAT 2 and CAT 3 SINGLE in CONF 3 |
| `laws.athr_speed` | 1/kt, 1/(kt s),… | — | ≈Kp_Tmax_per_kt 0.0317; Ki_Tmax_per_kt_s 0.0029… | ≈Kp_Tmax_per_kt 0.0332; Ki_Tmax_per_kt_s 0.0031… | ≈Kp_Tmax_per_kt 0.0332; Ki_Tmax_per_kt_s 0.0031… | ≈Kp_Tmax_per_kt 0.0332; Ki_Tmax_per_kt_s 0.0031… | ≈Kp_Tmax_per_kt 0.0332; Ki_Tmax_per_kt_s 0.0031… | ≈Kp_Tmax_per_kt 0.0361; Ki_Tmax_per_kt_s 0.0033… |
| `laws.flare` | m, s, m/s | — | ≈type exp_hB; h_flare 15.24; h_B 3.658; tau_rul… | ≈type exp_offset; h_flare_rule clamp(4 s * \|hd… | ≈type exp_offset; h_flare_rule clamp(4 s * \|hd… | ≈type exp_offset; h_flare_rule clamp(4 s * \|hd… | ≈type exp_offset; h_flare_rule clamp(4 s * \|hd… | ≈type as a320ceo; tau_at_140kt 5.01; sink_TD 0.… |
| `laws.retard` | m, s | — | ≈h 8.23; dt_after_flare 2.5; ramp idle at predi… | ≈h_idle 9.144; h_callout 3.048; fbw_request_h 1… | ≈h_idle 9.144; h_callout 3.048; fbw_request_h 1… | ≈h_idle 9.144; h_callout 3.048; fbw_request_h 1… | ≈h_idle 9.144; h_callout 3.048; fbw_request_h 1… | — |
| `modes` | - | lateral [HDG SEL, HDG HOLD, NAV, LOC, APP]; ver… | ap [CMD A, CMD B, CWS A, CWS B]; lateral [HDG S… | lateral อาร์เรย์ 11 ค่า; vertical อาร์เรย์ 19 ค… | lateral อาร์เรย์ 11 ค่า; vertical อาร์เรย์ 19 ค… | lateral อาร์เรย์ 11 ค่า; vertical อาร์เรย์ 19 ค… | lateral อาร์เรย์ 11 ค่า; vertical อาร์เรย์ 19 ค… | ≈as a320ceo |

## `ops` เทคนิคการบินมาตรฐาน (FCTM) (24)

หัวข้อที่ให้ค่า: [3.10](10-fctm-technique.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `approach_pitch_deg` | deg | range [-2.5, 1]; excess_energy_below -2.5 | F30_Vref5 2.4; F40_Vref5 1.4; F30_Vref5_two_pos… | ≈FULL_VAPP 2.5; range [1.5, 3.3] | ≈FULL_VAPP 2.5; range [1.5, 3.3] | FULL_Vapp 2.4; observed_D_AIRE [1.5, 2.1]; obse… | FULL_Vapp 2.4; observed_D_AIRE [1.5, 2.1]; obse… | — |
| `approach_thrust` | % torque | torque_pct_3deg 25; torque_pct_per_deg_slope 5;… | ≈total_N_60t_F30_Vref5 32200; fraction_of_stati… | ≈total_N_64_5t_FULL 51200; fraction_of_static 0… | ≈total_N_64_5t_FULL 51200; fraction_of_static 0… | ≈total_N_64_5t_FULL 51200; fraction_of_static 0… | ≈total_N_64_5t_FULL 51200; fraction_of_static 0… | — |
| `autobrake` | - | — | AB1 1.219; AB2 1.524; AB3 2.195; MAX_above_80kt… | LO 1.7; LO_delay_s 4; MED 3; MED_delay_s 2; MAX… | LO 2; LO_delay_s 2; MED 3; MED_delay_s 2; MAX R… | LO 1.7; LO_delay_s 4; MED 3; MED_delay_s 2; MAX… | LO 2; LO_delay_s 2; MED 3; MED_delay_s 2; MAX R… | ≈LO 1.7; MED 3; MAX RTO |
| `bank_limit_touchdown_deg` | deg | — | ≈operational 5; nacelle_contact_static MTW 13.2… | operational 5; max_crab_deg 5 | operational 5; max_crab_deg 5 | operational 5; max_crab_deg 5 | operational 5; max_crab_deg 5 | — |
| `bounce` | - | — | shallow hold/re-establish normal landing attitu… | low keep normal landing attitude, do not increa… | low keep normal landing attitude, do not increa… | low keep normal landing attitude, do not increa… | low keep normal landing attitude, do not increa… | — |
| `crosswind_limits` | m/s | demonstrated_mps 18.006; autopilot_mps 8.746 | demonstrated_mps winglets 16.977; no_winglets 1… | demonstrated_landing_incl_gust_mps 19.549; demo… | demonstrated_landing_incl_gust_mps 19.549; demo… | demonstrated_landing_incl_gust_mps 19.549; demo… | demonstrated_landing_incl_gust_mps 19.549; demo… | demonstrated_mps —; contaminated common_airline… |
| `crosswind_technique` | m/s | — | preferred crab on final, de-crab in flare with … | — | — | — | — | — |
| `flare_duration_s` | s | — | [4, 8] | — | — | — | — | — |
| `flare_height_m` | m | 6.096 | 6.096 | 9.144 | 9.144 | 9.144 | 9.144 | 12.192 |
| `flare_pitch_increase_deg` | deg | — | [2, 3] | typical 4; range [3, 4.5] | typical 4; range [3, 4.5] | 4.2 | 4.2 | — |
| `ground_spoilers` | - | — | auto_deploy speedbrake ARMED + RA < 10 ft + mai… | rto_min_speed_mps 37.04; landing armed: extend … | rto_min_speed_mps 37.04; landing armed: extend … | rto_min_speed_mps 37.04; landing armed: extend … | rto_min_speed_mps 37.04; landing armed: extend … | — |
| `gs_mini` | - | — | — | k 1; rule IAS target = VAPP + k*max(0, HW_curre… | k 0.33; rule IAS target = VAPP + k*max(0, HW_cu… | k 1; rule IAS target = VAPP + k*max(0, HW_curre… | k 0.33; rule IAS target = VAPP + k*max(0, HW_cu… | k_above_400ft 1; k_below_400ft 0.33; blend_s 25 |
| `hard_landing` | m/s, g | ≈gear_design_sink_mps 3.048; gear_reserve_sink_… | amm_nz 2.2; valid_max_roll_deg 2; events VH_YQR… | load15_nz 2.6; load15_window_s 0.5; load15_sink… | load15_nz 2.6; load15_window_s 0.5; load15_sink… | load15_nz 2.6; load15_window_s 0.5; load15_sink… | load15_nz 2.6; load15_window_s 0.5; load15_sink… | — |
| `initial_climb_pitch_deg` | deg | — | 15 | 15 | 15 | 15 | 15 | 15 |
| `liftoff_pitch_deg` | deg, m | — | typical [7, 9]; flaps1 8.5; flaps5_target 8; ta… | ≈typical 10; mlg_full_extension_after_liftoff_s… | ≈typical 10; mlg_full_extension_after_liftoff_s… | ≈typical 9 | ≈typical 9 | typical 10; time_after_VR_s [4, 5] |
| `reverse` | m/s (ground spe… | use reverse from touchdown, ground idle below ~… | select_within_s 2; max_reverse_until_mps 30.867… | max_reverse_until_mps 36.011; then idle reverse… | max_reverse_until_mps 36.011; then idle reverse… | max_reverse_until_mps 36.011; then idle reverse… | max_reverse_until_mps 36.011; then idle reverse… | ≈max_reverse_until_mps 36.011 |
| `rotation_rate_dps` | deg/s | — | nominal [2, 3]; max_before_risk 4 | nominal 3; sidestick_fraction [0.33, 0.5]; even… | nominal 3; note_neo pitches up more readily (hi… | ≈nominal 3 | ≈nominal 3 | nominal 3; to_pitch_deg 15; early_rotation_risk… |
| `rotation_to_liftoff_s` | s | — | [3, 4] | — | — | — | — | — |
| `speed_additive` | m/s | rule VAPP = max(VmHB30 + WF, VMCL); WF = min(15… | at_engaged_mps 2.572; manual_rule max(5, 0.5*HW… | rule VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5… | rule VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5… | rule VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5… | rule VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5… | rule VAPP = VLS + clamp(max(HW/3, 5 if A/THR, 5… |
| `stabilised_criteria` | m/s | speed_rel_target_mps [-2.572, 5.144]; vs_max_mp… | — | speed_rel_VAPP_mps [-2.572, 5.144]; vs_max_mps … | speed_rel_VAPP_mps [-2.572, 5.144]; vs_max_mps … | speed_rel_VAPP_mps [-2.572, 5.144]; vs_max_mps … | speed_rel_VAPP_mps [-2.572, 5.144]; vs_max_mps … | — |
| `tailstrike_pitch_deg` | deg | gear_extended 8; gear_compressed 5.9; tail_skid… | gear_extended 11; gear_compressed 9; alt_extend… | gear_extended 13.5; gear_compressed 11.7 | gear_extended 13.5; gear_compressed 11.7 | gear_extended 11.2; gear_compressed 9.7; aaib_2… | gear_extended 11.2; gear_compressed 9.7; aaib_2… | ≈gear_compressed 10.4; gear_extended 13.7 |
| `thrust_retard` | m | to FLIGHT IDLE; height_m 6.096; early_retard_ri… | manual idle reached at main gear touchdown; at_… | manual_callout_m 6.096; autoland_callout_m 3.04… | manual_callout_m 6.096; autoland_callout_m 3.04… | manual_callout_m 6.096; autoland_callout_m 3.04… | manual_callout_m 6.096; autoland_callout_m 3.04… | manual_callout_m 6.096; rule IDLE at touchdown … |
| `touchdown_pitch_deg` | deg | ≈typical 4; range [2, 5.5] | ≈typical 5; range [4, 6.5]; pitch_callout 8 | ≈typical 6; range [4.5, 8]; pitch_callout 10 | ≈typical 6; range [4.5, 8]; pitch_callout 10 | ≈typical 6.6; range [4.5, 7.5]; pitch_callout 7… | ≈typical 6.6; range [4.5, 7.5]; pitch_callout 7… | ≈typical 5.5; range [4, 7.5]; pitch_callout 8.5 |
| `touchdown_speed_rel_mps` | m/s relative to… | [-5.144, -2.572] | [-2.572, 0] | ≈[-4.116, 0] | ≈[-4.116, 0] | ≈[-4.116, 0] | ≈[-4.116, 0] | — |

## `validation` ค่าตรวจโมเดล (30)

หัวข้อที่ให้ค่า: [3.1](01-atr72-600.md), [3.2](02-b737-800.md), [3.3](03-a320-a321.md), [3.4](04-a330-300.md), [3.6](06-jet-engines.md)

| path | หน่วย | ATR 72-600 | 737-800 | A320ceo | A320neo | A321ceo | A321neo | A330-300 |
|---|---|---|---|---|---|---|---|---|
| `anchors.AF447_A330_203` | kg, %MAC, deg, g | — | — | — | — | — | — | takeoff_mass_kg 232757; takeoff_cg_pct 23.3; ev… |
| `anchors.D_AIRE_A321` | kg, deg, kt, ft… | — | — | landing_mass_kg 72999; conf FULL; approach_pitc… | landing_mass_kg 72999; conf FULL; approach_pitc… | landing_mass_kg 72999; conf FULL; approach_pitc… | landing_mass_kg 72999; conf FULL; approach_pitc… | — |
| `anchors.D_AXLA_A320_232` | kg, %MAC, kt, d… | — | — | mass_kg 53700; CG_pctMAC 22; VLS_kt 123; Valpha… | mass_kg 53700; CG_pctMAC 22; VLS_kt 123; Valpha… | mass_kg 53700; CG_pctMAC 22; VLS_kt 123; Valpha… | mass_kg 53700; CG_pctMAC 22; VLS_kt 123; Valpha… | — |
| `anchors.QF72_A330_303` | kg, %, kt, deg | — | — | — | — | — | — | mass_kg 185280; cg_refdist_pct 28.2; FL 370; ma… |
| `anchors.TSB_C_GHLM_A330_343` | kg, %MAC, °C, k… | — | — | — | — | — | — | mass_kg 221200; CG_pctMAC 23.8; conf CONF1+F; F… |
| `classification.hqClassCategory` | - | — | ≈class III; approachLanding C; cruise B; takeof… | — | — | — | — | — |
| `reference_modes.approach_F30_111kt_20t` | rad/s, -, s | ≈short_period wn [0.96, 1.55]; zeta [0.59, 0.63… | — | — | — | — | — | — |
| `reference_modes.cruise_275KTAS_FL170_21t` | rad/s, -, s | ≈short_period wn [1.71, 2.79]; zeta [0.49, 0.53… | — | — | — | — | — | — |
| `reference_modes.est_approach_60t_142kt_F30` | rad/s, -, s | — | ≈sp_wn 0.861; sp_zeta 0.669; ph_T_s 41.1; ph_ze… | — | — | — | — | — |
| `reference_modes.est_approach_FULL` | kg, kt, rad/s, … | — | — | ≈mass_kg 64500; V_kt 133.5; CG_pctMAC 30; sp_wn… | ≈mass_kg 64500; V_kt 133.5; CG_pctMAC 30; sp_wn… | ≈mass_kg 73000; V_kt 143.3; CG_pctMAC 30; sp_wn… | ≈mass_kg 73000; V_kt 143.3; CG_pctMAC 30; sp_wn… | — |
| `reference_modes.est_approach_FULL_187t` | kg, kt, rad/s, … | — | — | — | — | — | — | ≈mass_kg 187000; V_kt 144; CG_pctMAC 28; sp_wn … |
| `reference_modes.est_cruise_65t_M0785_FL350` | rad/s, -, s | — | ≈sp_wn 1.444; sp_zeta 0.415; ph_T_s 112.8; ph_z… | — | — | — | — | — |
| `reference_modes.est_cruise_M078_FL350` | kg, rad/s, -, s | — | — | ≈mass_kg 65000; sp_wn 1.218; sp_zeta 0.457; CAP… | ≈mass_kg 65000; sp_wn 1.218; sp_zeta 0.457; CAP… | ≈mass_kg 65000; sp_wn 1.166; sp_zeta 0.462; CAP… | ≈mass_kg 65000; sp_wn 1.166; sp_zeta 0.462; CAP… | — |
| `reference_modes.est_cruise_M082_FL370` | kg, rad/s, -, s | — | — | — | — | — | — | ≈mass_kg 185280; sp_wn 0.931; sp_zeta 0.51; CAP… |
| `reference_modes.jsbsim_approach_140kcas` | rad/s, -, s | — | ≈sp_wn 1.05; sp_zeta 0.54; ph_T_s 37.2; ph_zeta… | — | — | — | — | — |
| `reference_modes.jsbsim_cruise_280kcas_25000ft` | rad/s, -, s | — | ≈sp_wn 1.73; sp_zeta 0.42; ph_T_s 93.3; ph_zeta… | — | — | — | — | — |
| `trim_targets.V2_CONF1F` | -, deg | — | — | ≈CL 1.848; alpha_deg 12.4; L_over_D 10.21 | ≈CL 1.848; alpha_deg 12.4; L_over_D 10.21 | ≈CL 1.848; alpha_deg 12.4; L_over_D 10.21 | ≈CL 1.848; alpha_deg 12.4; L_over_D 10.21 | — |
| `trim_targets.V2_CONF2_242t` | -, deg, % | — | — | — | — | — | — | ≈CL 1.754; alpha_deg 12.88; L_over_D 9.89; OEI_… |
| `trim_targets.approach_3deg` | mixed | ≈mass_kg 20400; VAPP_kt 111; flap 30; gear down… | — | — | — | — | — | — |
| `trim_targets.approach_CONF3_VAPP` | kg, kt, deg, -,… | — | — | ≈mass_kg 64500; V_kt 145.4; alpha_deg 6.25; the… | ≈mass_kg 64500; V_kt 145.4; alpha_deg 6.25; the… | VAPP_CONF3_minus_FULL_kt ceo [5, 7]; neo [10, 1… | VAPP_CONF3_minus_FULL_kt ceo [5, 7]; neo [10, 1… | — |
| `trim_targets.approach_F30_Vref5` | kg, kt, deg, -,… | — | ≈mass_kg 60000; V_kt 142.1; gamma_deg -3; theta… | — | — | — | — | — |
| `trim_targets.approach_F40_Vref5` | kg, kt, deg, -,… | — | ≈mass_kg 60000; V_kt 137.1; gamma_deg -3; theta… | — | — | — | — | — |
| `trim_targets.approach_FULL_VAPP` | kg, kt, deg, -,… | — | — | ≈mass_kg 64500; V_kt 133.5; gamma_deg -3; alpha… | ≈mass_kg 64500; V_kt 133.5; gamma_deg -3; alpha… | ≈mass_kg 73000; V_kt 143.3; gamma_deg -3; alpha… | ≈mass_kg 73000; V_kt 143.3; gamma_deg -3; alpha… | — |
| `trim_targets.approach_FULL_VAPP_187t` | kg, kt, deg, -,… | — | — | — | — | — | — | ≈mass_kg 187000; V_kt 144; gamma_deg -3; alpha_… |
| `trim_targets.climb_V2` | mixed | ≈mass_kg 22800; flap 15; V2_kt 116; alpha_deg 7… | — | — | — | — | — | — |
| `trim_targets.cruise_M0785_FL350` | kg, -, deg, kN,… | — | ≈mass_kg 65000; CL 0.497; alpha_deg 2.5; drag_k… | — | — | — | — | — |
| `trim_targets.cruise_M078_FL350` | kg, -, deg, kt,… | — | — | ≈mass_kg 65000; CL 0.512; alpha_deg 2.68; TAS_k… | ≈mass_kg 65000; CL 0.512; alpha_deg 2.68; TAS_k… | ≈mass_kg 65000; CL 0.512; alpha_deg 2.68; TAS_k… | ≈mass_kg 65000; CL 0.512; alpha_deg 2.68; TAS_k… | — |
| `trim_targets.cruise_QF72` | kg, -, kt, deg,… | — | — | — | — | — | — | ≈mass_kg 185280; FL 370; mach 0.82; CAS_kt 270;… |
| `trim_targets.touchdown` | mixed | ≈flare_height_ft 20; power flight idle; theta_d… | — | — | — | — | — | — |
| `trim_targets.touchdown_pitch_qar_deg` | deg | — | 5.2 | — | — | — | — | — |

## ค่าที่ใช้ร่วมทุกแบบ (common_airliner) (42)

| path | หน่วย | ค่า | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|
| `afcs.ac2057a_2sigma` | m, m/s | long_total 457.2; lat_each_side 8.23; min_from_thr 60.96; demo_wind h… | สูง | O4 |
| `afcs.AH_typical_max` | m | 30.48 | กลาง | O8 |
| `afcs.cat2_approach` | -, uA | p_success_below_500ft 0.95; loc_uA_95pct 25 | สูง | O2 |
| `afcs.categories` | m | CAT_I DH_min 60.96; RVR_min 550; VIS_min 800; CAT_II DH_min 30.48; DH… | สูง | O7, O9 |
| `afcs.cert_rollout` | m, m/s, - | lateral_outboard_gear 21.3; p 0.000001; speed_above 20.578; normal_de… | สูง | O3, O1 |
| `afcs.cert_touchdown` | m, m/s, - | early 60; late_avg 823; late_limit 914; lateral_outboard_gear 21.3; s… | สูง | O1, O2, O3 |
| `afcs.dmk` | m, deg | ils 21R CAT II; 21L CAT I; 03L CAT I; 03R none; lvp_rvr_below 550; lv… | กลาง | O36, O37 |
| `afcs.fail_passive_DH_min` | m | 15.24 | สูง | O8, O9, O3 |
| `afcs.flare_reference` | 1/s, m, m/s | patent_K 0.205; patent_hB 3.658; dials_sink_mean 0.732; dials_sink_sd… | สูง | O13, O14, O15 |
| `afcs.ils_signal` | DDM, uA, m, deg | ≈loc_full_DDM 0.155; gs_full_DDM 0.175; full_scale_uA 150; dot_uA 75;… | กลาง | O10, O11, O6, O43 |
| `afcs.ops_success` | m, m/s, deg | td_min 150; td_max 750; speed_tol 2.5722; vs_max 1.8288; bank_max_deg… | สูง | O8, O7 |
| `afcs.rvr_tables` | m | CAT2_DH100_120 300; CAT2_DH121_140 400; CAT2_DH141_199 450; CAT3_DH50… | สูง | O7 |
| `afcs.z_quantiles` | - | ≈p1e5 4.265; p1e6 4.753; p1e7 5.199; p1e8 5.612 | สูง | O3 |
| `controls.actuator_model` | - | ≈form first-order lag + rate limit + position limit; update explicit … | กลาง | R1:C14, R1:C17 |
| `controls.force_cue_marks_N` | N | pitch [44.5, 222.4, 333.6]; roll [22.2, 111.2, 222.4]; yaw [89, 667.2] | สูง | Y30 |
| `controls.requirements.fstd_dynamic_tolerance` | N, % | force_N 8.9; force_pct 10; T_P0_pct 10 | สูง | Y32 |
| `controls.requirements.part25_force_limits_N` | N | short_two_hands pitch 334; roll 222; short_one_hand pitch 222; roll 1… | สูง | Y30 |
| `controls.requirements.part25_out_of_trim` | s, g, N | mistrim_s_at_normal_rate 3; g_range [-1, 2.5]; recovery_g 1.5; max_fo… | สูง | Y31 |
| `ops.autobrake` | m/s^2 | typical_low_mps2 1.543; typical_medium_mps2 3.087; range_kt_per_s [3,… | กลาง | K70, K69, K68 |
| `ops.crosswind_limits` | m/s, mu | cert_min_mps rule max(20 kt, 0.2 VSR0), need not exceed 25 kt; min 10… | สูง | K14, K4, K64 |
| `ops.crosswind_technique` | deg | ≈crab_angle psi = asin(Vxw/TAS); airbus_td_max_crab_deg 5; airbus_td_… | สูง | K4, K11, K42 |
| `ops.evaluator` | points, m/s, s,… | ≈weights sink 40; pos 25; cl 15; spd 10; att 10; sink_pts full_mps 1.… | ต่ำ | K15, K13, K12, K58, K57 |
| `ops.flare_law` | m, s | ≈form hdot = -K (h + hB); K (s0 - std)/hF; hB std/K; std_mps 0.762; f… | ต่ำ | K15, K6, K47 |
| `ops.go_around` | deg, deg/s, % | pitch_target_deg 15; rotation_rate_dps 3; ultimate_pitch_deg 25; pitc… | กลาง | K2, K71, K44, K15 |
| `ops.ground_spoilers` | - | weight_on_wheels_without 0.6; weight_on_wheels_with 0.85; drag_increa… | กลาง | K70, K15, K20 |
| `ops.hard_landing` | m/s, g, deg | ≈design_sink_MLW_mps 3.048; design_sink_MTOW_mps 1.829; boeing_amm_nz… | กลาง | K13, K58, K57, K47, K15, K23 |
| `ops.landing_distance_factors` | -, m | dispatch_dry_factor 1.667; wet_factor 1.15; toa_margin 1.15; speed_pl… | สูง | K12, K75, K69 |
| `ops.reverse` | m/s | use max reverse as soon as possible after touchdown; reverse_idle_spe… | กลาง | K70, K69, K53 |
| `ops.stabilised_criteria` | m, m/s, dots, d… | gate_IMC_m 304.8; gate_VMC_m 152.4; circling_wings_level_m 91.44; spe… | สูง | K1, K2, K3, K58, K23 |
| `ops.tdz_target_m` | m from threshold | ≈aiming_marking_start 400; aiming_marking_end 450; ac91_79b_air_dista… | กลาง | K12, K51, K52 |
| `visual.canada_tp312_groups` | m | ตาราง 9 ค่า | สูง | D23 |
| `visual.faa_papi_gs_colocation_tol` | m | same_distance_tol 9.144; hg4_extra 91.44 | สูง | D22 |
| `visual.faa_visual_tch_height_groups` | m | ตาราง 8 ค่า | สูง | D22 |
| `visual.icao_wheel_clearance_table` | m | ตาราง 8 ค่า | สูง | D24, D23, D25 |
| `visual.ils_tch_typical` | m | nominal 15.24; min 12.19; max 18.29 | กลาง | D23 |
| `visual.meht_angle_M_deg` | deg | icao_tc_B_minus_2arcmin 2.8; stac_check_theta_minus_10arcmin 2.8333 | กลาง | D23, D24 |
| `visual.on_slope_band_deg` | deg | lower 2.8333; upper 3.1667 | สูง | D24, D23 |
| `visual.papi_unit_settings_deg` | deg | [2.5, 2.8333, 3.1667, 3.5] | สูง | D40, D24 |
| `visual.vtbd_harmonisation_offset_needed` | m | ≈03L 6.3; 21R 4.77; 03R 5.2; 21L 4.55 | ต่ำ | D35, D23 |
| `visual.vtbd_ils_rdh` | m | 03L 16.76; 21R 16.46; 03R 15.24; 21L 16.15 | สูง | D35, D36 |
| `visual.vtbd_meht` | m | 03L 21.9; 21R 19.94; 03R 19.31; 21L 19.45 | สูง | D35, D36 |
| `visual.vtbd_papi_distance_est` | m | ≈03L 440; 21R 405; 03R 390; 21L 395 | ต่ำ | D35, D36, D40 |
