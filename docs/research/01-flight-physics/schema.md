# ภาคผนวก: schema พารามิเตอร์ของรอบที่ 1

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md)

ไฟล์นี้สร้างอัตโนมัติจากบล็อก JSON ของทั้ง 12 หัวข้อ (สคริปต์ `scripts/integ_schema.mjs`) ค่าทุกตัวมาจากไฟล์หัวข้อนั้น ถ้าแก้ค่าให้แก้ที่ไฟล์หัวข้อแล้วสร้างไฟล์นี้ใหม่ ไฟล์ [params-trainer.json](params-trainer.json) รวมบล็อก JSON ทั้งหมดไว้ในอ็อบเจกต์เดียวสำหรับให้โค้ดอ่าน

## รูปแบบของพารามิเตอร์หนึ่งตัว (leaf)

| ฟิลด์ | ความหมาย |
|---|---|
| `v` | ค่า เป็นตัวเลข อาร์เรย์ หรือตาราง `{"axes": {...}, "data": [...]}` |
| `u` | หน่วย (SI เป็นหลัก เช่น `m`, `kg`, `N`, `rad`, `1/rad`; ตารางหรือค่าไร้หน่วยใช้ `-`) |
| `scope` | `aircraft`, `engine`, `propeller`, `gear` = ต้องเติมรายแบบเครื่องบินในรอบ 2–3 · `environment` = สภาพแวดล้อม ใช้ร่วมทุกแบบ · `sim` = ค่าตั้งของเครื่องจำลอง |
| `src` | รหัสแหล่งอ้างอิงในไฟล์หัวข้อ เช่น `["G6"]` |
| `conf` | ความเชื่อมั่น `สูง` / `กลาง` / `ต่ำ` |
| `est` | `true` = ค่าประมาณ (ออกแบบหรือคำนวณเอง ไม่ได้มาจากเอกสารโดยตรง) |
| `note` | หมายเหตุภาษาไทย |

## จำนวนพารามิเตอร์ตามหมวด

| หมวด (key) | หัวข้อ | aircraft | engine | propeller | gear | environment | sim | รวม | ค่าประมาณ |
|---|---|---|---|---|---|---|---|---|---|
| `aero` | [1. อากาศพลศาสตร์ stall และ spin](01-aero.md) | 41 | 0 | 0 | 0 | 0 | 10 | 51 | 42 |
| `interference` | [2. downwash lag, ground effect, slipstream](02-interference.md) | 27 | 0 | 3 | 0 | 0 | 4 | 34 | 28 |
| `propeller` | [3. ใบพัด](03-propeller.md) | 2 | 7 | 39 | 0 | 0 | 3 | 51 | 42 |
| `turboprop` | [4. เทอร์โบพร็อปคลาส PT6A](04-turboprop.md) | 3 | 37 | 1 | 0 | 0 | 3 | 44 | 30 |
| `turbofan` | [5. เทอร์โบแฟน](05-turbofan.md) | 1 | 61 | 0 | 0 | 16 | 6 | 84 | 50 |
| `controls` | [6. ระบบบังคับ](06-controls.md) | 50 | 0 | 0 | 0 | 0 | 20 | 70 | 50 |
| `gear` | [7. ล้อและพื้น](07-gear.md) | 18 | 0 | 0 | 50 | 10 | 4 | 82 | 54 |
| `wind` | [8. ลม ความปั่นป่วน microburst wake](08-wind.md) | 6 | 0 | 0 | 0 | 24 | 9 | 39 | 11 |
| `numerics` | [9. วิธีเชิงตัวเลข](09-numerics.md) | 0 | 0 | 0 | 8 | 1 | 31 | 40 | 25 |
| `validation` | [10. การตรวจความสมจริง](10-validation.md) | 10 | 0 | 0 | 0 | 0 | 34 | 44 | 9 |
| `input` | [11. อินพุต](11-input.md) | 2 | 0 | 0 | 0 | 0 | 44 | 46 | 30 |
| `otherSims` | [12. ซิมตัวอื่น](12-other-sims.md) | 10 | 1 | 2 | 5 | 0 | 16 | 34 | 8 |
| **รวม** | | 170 | 106 | 45 | 63 | 51 | 184 | 619 | 379 |

ค่าในคอลัมน์ "ค่าเครื่องฝึก" เป็นค่าของเครื่องฝึกเทอร์โบพร็อปสมมติของ AirfieldLab (หรือค่าตัวอย่างของแบบอ้างอิง เช่น CFM56 ในหมวด turbofan) ไม่ใช่ข้อมูลของเครื่องบินแบบใดแบบหนึ่ง

**ส่วนขยายของรอบที่ 2** (เครื่องบินเล็กและเครื่องฝึก) อยู่ใน [`../02-light-aircraft/schema-ext.md`](../02-light-aircraft/schema-ext.md) ข้อ 5: หมวดใหม่ `piston.*` (เช่น `piston.altitude.model` = `gagg_ferrar` | `ind_friction` (ฟิลด์ `f`) | `turbo_flat` | `table`), `speeds`, `performance`, `ops`, `procedures` และคำอธิบาย 14 leaf ของ `common_light.methods` ตารางด้านล่างมีเฉพาะ path ของรอบที่ 1

## `aero` — [หัวข้อ 1. อากาศพลศาสตร์ stall และ spin](01-aero.md)

### ต้องเติมรายแบบเครื่องบิน (41)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `ref.S` | m2 | aircraft | 16.3 | ใช่ | สูง | A1 |
| `ref.b` | m | aircraft | 10.2 | ใช่ | สูง | A1 |
| `ref.c` | m | aircraft | 1.65 | ใช่ | สูง | A1 |
| `static_long.CL0` | - | aircraft | {"clean":0.25,"landing":0.8} | ใช่ | กลาง | A1 |
| `static_long.CLalpha` | 1/rad | aircraft | 4.8 | ใช่ | กลาง | A1 |
| `static_long.alpha_star` | deg | aircraft | {"clean":16.29,"landing":13.73} | ใช่ | ต่ำ | A11 |
| `static_long.alpha_star_neg` | deg | aircraft | {"clean":13,"landing":9} | ใช่ | ต่ำ | A1 |
| `static_long.a1` | 1/rad | aircraft | 22 | ใช่ | ต่ำ | A11 |
| `static_long.CL_sep_at_alpha_star` | - | aircraft | {"clean":0.95,"landing":1.1} | ใช่ | ต่ำ | A9, A10 |
| `static_long.CDmax_90` | - | aircraft | 1.4 | ใช่ | ต่ำ | A9, A10 |
| `static_long.dCD_sep` | - | aircraft | 0.2 | ใช่ | กลาง | A11 |
| `static_long.CmX` | - | aircraft | -0.12 | ใช่ | กลาง | A11 |
| `static_long.Cm0` | - | aircraft | {"clean":0.045,"landing":-0.055} | ใช่ | กลาง | A1 |
| `static_long.Cmalpha` | 1/rad | aircraft | -0.72 | ใช่ | กลาง | A1 |
| `static_long.CLmax_target` | - | aircraft | {"clean":1.355,"landing":1.657} | ใช่ | กลาง | A1 |
| `static_long.alpha_CLmax` | deg | aircraft | {"clean":14.56,"landing":11.58} | ใช่ | ต่ำ | A1 |
| `static_long.table_clean` | - | aircraft | ตาราง coef[3] × alpha_deg[38] | ใช่ | ต่ำ | A9, A10, A11 |
| `elevator_fade.alpha_t_star` | deg | aircraft | 22 | ใช่ | ต่ำ | A15 |
| `elevator_fade.a_t` | 1/rad | aircraft | 10 | ใช่ | ต่ำ | A1 |
| `elevator_fade.floor` | - | aircraft | 0.35 | ใช่ | ต่ำ | A1 |
| `separation_dynamics.tau1` | s | aircraft | 0.4 | ใช่ | ต่ำ | A11, A12 |
| `separation_dynamics.tau2` | s | aircraft | 0.2 | ใช่ | ต่ำ | A11, A12 |
| `large_beta.CY_crossflow` | - | aircraft | 0.45 | ใช่ | ต่ำ | A1 |
| `strip_wing.taper` | - | aircraft | 0.6 | ใช่ | ต่ำ | A1 |
| `strip_wing.dihedral_eff` | deg | aircraft | 4 | ใช่ | ต่ำ | A1 |
| `strip_wing.washout` | deg | aircraft | 3 | ใช่ | ต่ำ | A16, A17 |
| `strip_wing.kp_roll` | - | aircraft | 0.661 | ใช่ | กลาง | A1 |
| `strip_wing.tau_aileron` | - | aircraft | 0.26 | ใช่ | กลาง | A1 |
| `strip_wing.aileron_span_frac` | - | aircraft | [0.6,1] | ใช่ | ต่ำ | A1 |
| `stall_warning.min_margin` | kt | aircraft | 5 |  | สูง | A22 |
| `stall_warning.alpha_warn_5kt` | deg | aircraft | {"clean":11.41,"landing":7.77} | ใช่ | กลาง | A1, A22 |
| `stall_warning.alpha_warn_design` | deg | aircraft | {"clean":10.71,"landing":6.87} | ใช่ | ต่ำ | A1 |
| `buffet.vertical_filter` | rad/s,- | aircraft | {"w0":75.92,"Q":8.28} | ใช่ | ต่ำ | A11 |
| `buffet.lateral_filter` | rad/s,-,- | aircraft | {"w0":[36.43,64.71],"Q":[4.19,11.99],"gain_ra…} | ใช่ | ต่ำ | A11 |
| `buffet.rms_full` | g | aircraft | {"az":0.05,"ay":0.016} | ใช่ | ต่ำ | A11 |
| `spin_reference.alpha_spin` | deg | aircraft | [43,60] |  | กลาง | A15, A16 |
| `spin_reference.turn_rate` | deg/s | aircraft | [145,208] |  | กลาง | A15 |
| `spin_reference.omega_hat` | - | aircraft | [0.24,0.42] | ใช่ | ต่ำ | A15 |
| `spin_reference.descent_trainer` | fpm | aircraft | 9500 | ใช่ | ต่ำ | A1 |
| `spin_reference.IYMP` | - | aircraft | -0.0201 | ใช่ | สูง | A1, A19 |
| `spin_reference.recovery_turns_max` | turn | aircraft | 1.5 |  | สูง | A22, A23 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (10)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `conventions.frames` | - | sim | {"body":"FRD","world":"NED","alpha":"atan2(w,…} |  | สูง | A1, A2 |
| `conventions.table_rules` | - | sim | {"interp":"linear ทุกแกน (monotone cubic เป็น…} |  | สูง | A2 |
| `static_long.tailfirst_CL_scale` | - | sim | 0.7 |  | ต่ำ | A10 |
| `separation_dynamics.dynamic_CLmax_cap` | - | sim | 0.25 | ใช่ | ต่ำ | A1 |
| `large_beta.lift_beta_exponent` | - | sim | 2 | ใช่ | กลาง | A4 |
| `strip_wing.panels_per_side` | - | sim | 8 | ใช่ | กลาง | A4 |
| `strip_wing.asym_seed_dalpha_star` | deg | sim | 0.5 | ใช่ | ต่ำ | A15, A16 |
| `buffet.X_onset` | - | sim | 0.89 |  | กลาง | A11 |
| `sim.alpha_table_step` | deg | sim | {"inner_deg":1,"inner_range_deg":[-30,30],"ou…} | ใช่ | กลาง | A1 |
| `sim.X_update` | - | sim | {"method":"exact first-order step ต่อ dt","dt…} |  | กลาง | A12 |

## `interference` — [หัวข้อ 2. downwash lag, ground effect, slipstream](02-interference.md)

### ต้องเติมรายแบบเครื่องบิน (30)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `downwash.deda` | - | aircraft | 0.4 | ใช่ | ต่ำ | U4, U17 |
| `downwash.eps0` | rad | aircraft | 0 | ใช่ | ต่ำ |  |
| `downwash.l_t` | m | aircraft | 5.42 | ใช่ | กลาง | U17, U1 |
| `downwash.VH` | - | aircraft | 0.596 | ใช่ | กลาง | U17 |
| `downwash.a_t` | 1/rad | aircraft | 3.9 | ใช่ | กลาง | U17 |
| `downwash.eta_t` | - | aircraft | 0.9 | ใช่ | กลาง | U11, U17 |
| `downwash.CLadot` | 1/(rad·c/2V) | aircraft | 1.67 | ใช่ | ต่ำ | U2, U4 |
| `downwash.Cmadot` | 1/(rad·c/2V) | aircraft | -5.5 | ใช่ | ต่ำ | U2, U4 |
| `groundEffect.rMac` | m (FRD จาก CG, y ใช้ ±) | aircraft | [0,2.51,0.15] | ใช่ | ต่ำ | U1 |
| `groundEffect.CLa_w` | 1/rad | aircraft | 4.4 | ใช่ | ต่ำ | U17 |
| `groundEffect.A` | - | aircraft | 6.38 |  | สูง | U1 |
| `groundEffect.rEps` | - | aircraft | {"a":3.99,"m":0.652} | ใช่ | กลาง | U7, U18 |
| `groundEffect.tablesCheck` | - | aircraft | ตาราง hb[7] | ใช่ | กลาง | U7, U18 |
| `slipstream.diskDiameter` | m | propeller | 2.44 | ใช่ | ต่ำ | U16 |
| `slipstream.hubRadius` | m | propeller | 0.25 | ใช่ | ต่ำ |  |
| `slipstream.hubPos` | m (FRD จาก CG) | aircraft | [3.94,0,-0.06] | ใช่ | ต่ำ | U16, U1 |
| `slipstream.sense` | - | propeller | 1 | ใช่ | กลาง | U16 |
| `slipstream.kappa` | - | aircraft | 0.43 | ใช่ | ต่ำ | U11 |
| `slipstream.immersionH` | - | aircraft | ตาราง rs_m[8] | ใช่ | ต่ำ | U1, U18 |
| `slipstream.immersionV` | - | aircraft | ตาราง rs_m[8] | ใช่ | ต่ำ | U1, U18 |
| `slipstream.kSwirl` | - | aircraft | 0.5 | ใช่ | ต่ำ | U14 |
| `slipstream.zSwirl` | m | aircraft | 0.55 | ใช่ | ต่ำ | U18 |
| `slipstream.finArea` | m2 | aircraft | 2.06 | ใช่ | ต่ำ | U1 |
| `slipstream.finArm` | m | aircraft | 5.25 | ใช่ | ต่ำ | U1 |
| `slipstream.finLiftSlope` | 1/rad | aircraft | 2.8 | ใช่ | ต่ำ |  |
| `slipstream.eta_v` | - | aircraft | 0.9 | ใช่ | ต่ำ |  |
| `slipstream.blownSpanFactor` | D | aircraft | 0.9 |  | กลาง | U10 |
| `slipstream.blownArea` | m2 | aircraft | 2.63 | ใช่ | ต่ำ | U10, U1 |
| `slipstream.kBlown` | - | aircraft | 0.5 | ใช่ | ต่ำ |  |
| `slipstream.k_deda_power` | - | aircraft | 0 | ใช่ | ต่ำ | U11 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (4)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `downwash.tailModel` | - | sim | {"mode":"derivative","alternative":"delay","b…} |  | สูง | U2, U3 |
| `downwash.adotEstimator` | - | sim | {"method":"closedForm","clampRadS":2} |  | สูง | U6 |
| `groundEffect.sigmaModel` | - | sim | {"type":"tani","a":2.48,"m":0.768,"cutoffHb":…} |  | สูง | U7, U8, U9 |
| `slipstream.propEffectsScale` | - | sim | 1 |  | สูง |  |

## `propeller` — [หัวข้อ 3. ใบพัด](03-propeller.md)

### ต้องเติมรายแบบเครื่องบิน (48)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `identity.nBlades` | - | propeller | 4 |  | สูง | P3 |
| `identity.diameter` | m | propeller | 2.44 | ใช่ | กลาง | P3 |
| `identity.sense` | - | propeller | 1 |  | สูง | P3, P14, P1 |
| `identity.massComplete` | kg | propeller | 68.9 |  | สูง | P3 |
| `identity.hubPosition` | m (FRD จาก CG) | aircraft | [3.94,0,-0.06] | ใช่ | ต่ำ | P16 |
| `identity.thrustAxis` | - | aircraft | [1,0,0] | ใช่ | ต่ำ | P16 |
| `engineInterface.maxShaftPower` | kW | engine | 708 |  | สูง | P4 |
| `engineInterface.rpmGoverned` | rpm | engine | 2000 |  | สูง | P4 |
| `engineInterface.rpmTransientLimit` | rpm | engine | 2205 |  | สูง | P4 |
| `engineInterface.gearRatio` | - | engine | 15.07 |  | สูง | P4 |
| `engineInterface.flightIdleShaftPower` | kW | engine | 20 | ใช่ | ต่ำ |  |
| `bladeGeometry.hubRadiusRatio` | r/R | propeller | 0.18 | ใช่ | ต่ำ |  |
| `bladeGeometry.chordOverD` | c/D | propeller | ตาราง x[11] | ใช่ | ต่ำ |  |
| `bladeGeometry.twistDesignJ` | - | propeller | 1.1 | ใช่ | ต่ำ |  |
| `bladeGeometry.activityFactor` | - | propeller | 100 | ใช่ | ต่ำ |  |
| `section.liftSlope` | 1/rad | propeller | 5.78 | ใช่ | กลาง |  |
| `section.alpha0` | deg | propeller | -3 | ใช่ | ต่ำ |  |
| `section.alphaStallPos` | deg | propeller | 14 | ใช่ | ต่ำ |  |
| `section.alphaStallNeg` | deg | propeller | -11 | ใช่ | ต่ำ |  |
| `section.stallBlendM` | 1/rad | propeller | 10 | ใช่ | ต่ำ |  |
| `section.cd0` | - | propeller | 0.0085 | ใช่ | ต่ำ |  |
| `section.kcd` | - | propeller | 0.01 | ใช่ | ต่ำ |  |
| `section.Mdd` | - | propeller | 0.8 | ใช่ | ต่ำ |  |
| `section.stallDelayFactor` | - | propeller | 3 | ใช่ | ต่ำ | P10 |
| `tables.CT` | - | propeller | ตาราง J[13] × beta75_deg[11] | ใช่ | ต่ำ | P10 |
| `tables.CP` | - | propeller | ตาราง J[13] × beta75_deg[11] | ใช่ | ต่ำ | P10 |
| `tables.CNmu` | - | propeller | ตาราง J[6] × beta75_deg[7] | ใช่ | ต่ำ | P6 |
| `tables.CMmu` | - | propeller | ตาราง J[6] × beta75_deg[7] | ใช่ | ต่ำ | P6 |
| `inertia.Ip` | kg m2 | propeller | 14 | ใช่ | ต่ำ | P2, P3 |
| `inertia.IreflectedEngine` | kg m2 | engine | 0 | ใช่ | ต่ำ |  |
| `governor.kGov` | deg/s per rpm | propeller | 1 |  | กลาง | P1 |
| `governor.pitchRateMax` | deg/s | propeller | 20 | ใช่ | ต่ำ | P8 |
| `governor.rpmOverspeed` | rpm | propeller | 2100 | ใช่ | ต่ำ | P8, P4 |
| `governor.oilMinRpm` | rpm | propeller | 200 |  | กลาง | P1 |
| `governor.betaFlightIdle` | deg @0.75R | propeller | 10 | ใช่ | ต่ำ | P8, P9 |
| `governor.betaFeather` | deg @0.75R | propeller | 81 | ใช่ | กลาง | P8, P9 |
| `governor.featherRate` | deg/s | propeller | 15 | ใช่ | ต่ำ | P8, P1 |
| `betaReverse.reverseAvailable` | - | propeller | false | ใช่ | กลาง | P3 |
| `betaReverse.betaGroundIdle` | deg @0.75R | propeller | 0 | ใช่ | ต่ำ | P8 |
| `betaReverse.betaReverseMax` | deg @0.75R | propeller | -15 | ใช่ | ต่ำ | P7, P9 |
| `betaReverse.reverseRpmMax` | rpm | engine | 1825 | ใช่ | ต่ำ | P9 |
| `betaReverse.reverseCTstatic` | - | propeller | -0.088 | ใช่ | ต่ำ |  |
| `feathered.bladePlanformArea` | m2 | propeller | 0.66 | ใช่ | ต่ำ |  |
| `feathered.CDfeathered` | - | propeller | 0.06 | ใช่ | ต่ำ |  |
| `checks.staticThrustISA` | kN | propeller | 12.36 | ใช่ | ต่ำ |  |
| `checks.staticThrustVTBD31C` | kN | propeller | 11.55 | ใช่ | ต่ำ |  |
| `checks.momentumIdealStaticISA` | kN | propeller | 17.77 | ใช่ | สูง |  |
| `checks.peakEfficiency` | - | propeller | 0.88 | ใช่ | ต่ำ |  |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (3)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `sim.tableStepJ` | - | sim | 0.1 | ใช่ | กลาง |  |
| `sim.tableStepBeta` | deg | sim | 5 | ใช่ | กลาง |  |
| `sim.useRealtimeBEM` | - | sim | false | ใช่ | สูง |  |

## `turboprop` — [หัวข้อ 4. เทอร์โบพร็อปคลาส PT6A](04-turboprop.md)

### ต้องเติมรายแบบเครื่องบิน (41)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `ratings.P_rated` | W | engine | 700000 | ใช่ | กลาง | E1 |
| `ratings.T_flat_C` | degC | engine | 37 | ใช่ | กลาง | E1 |
| `ratings.rating_basis` | - | engine | {"pressure_Pa":101325,"static":true,"bleed":0…} |  | สูง | E1 |
| `ratings.install_loss_frac` | - | aircraft | 0 | ใช่ | ต่ำ | E1 |
| `ratings.Np_max_rpm` | rpm | engine | 2000 |  | สูง | E1 |
| `ratings.Np_transient_rpm` | rpm | engine | 2205 |  | สูง | E1 |
| `ratings.Q_lim` | N m | engine | 3342 | ใช่ | กลาง | E1 |
| `ratings.Ng_100pct_rpm` | rpm | engine | 37468 |  | สูง | E1, E3 |
| `ratings.Ng_max_pct` | % | engine | 104 |  | สูง | E1, E3 |
| `ratings.ITT_max_C` | degC | engine | 800 |  | สูง | E1 |
| `ratings.ITT_start_C` | degC | engine | 1000 |  | สูง | E1, E3 |
| `ratings.takeoff_time_limit_s` | s | engine | 300 |  | สูง | E1 |
| `steady_map.Ng_GI_pct` | % | engine | 52 | ใช่ | ต่ำ | E9 |
| `steady_map.Ng_FI_pct` | % | engine | 68 | ใช่ | ต่ำ | E9 |
| `steady_map.Ng0_pct` | % | engine | 52 | ใช่ | ต่ำ | E8, E9 |
| `steady_map.kMap` | - | engine | 2.7 | ใช่ | ต่ำ | E8 |
| `steady_map.Pc_frac_vs_Ngc` | - | engine | ตาราง Ngc_pct[9] | ใช่ | ต่ำ | E8 |
| `steady_map.nITT` | - | engine | 3 | ใช่ | ต่ำ | E1, E3 |
| `steady_map.ITTc_vs_Pc` | K (corrected, ITT_K/theta2) | engine | ตาราง Pc_frac[7] | ใช่ | ต่ำ | E1 |
| `dynamics.tauAcc_s` | s | engine | 0.6 | ใช่ | ต่ำ | E4, E6, E14 |
| `dynamics.rAcc_pct_s` | %Ng/s | engine | 10 | ใช่ | ต่ำ | E14 |
| `dynamics.tauDec_s` | s | engine | 0.8 | ใช่ | ต่ำ | E7 |
| `dynamics.rDec_pct_s` | %Ng/s | engine | 12 | ใช่ | ต่ำ |  |
| `dynamics.tauITT_s` | s | engine | 1.5 | ใช่ | ต่ำ | E7 |
| `dynamics.kITTacc` | K per (%Ng/s) | engine | 4 | ใช่ | ต่ำ | E7, E10 |
| `dynamics.cert_accel_FI_to_95pct_max_s` | s | engine | 5 |  | สูง | E4 |
| `airframe_coupling.spin` | - | aircraft | 1 | ใช่ | ต่ำ |  |
| `airframe_coupling.thrust_axis_body` | - | aircraft | [1,0,0] | ใช่ | ต่ำ |  |
| `airframe_coupling.I_gg` | kg m2 | engine | 0.12 | ใช่ | ต่ำ | E11 |
| `airframe_coupling.gg_rotation_rel_prop` | - | engine | -1 | ใช่ | ต่ำ | E6 |
| `fuel.psfc` | lb/(hp h) | engine | 0.669 | ใช่ | ต่ำ | E8 |
| `beta_reverse.beta_range_end_frac` | - | engine | 0.64 | ใช่ | ต่ำ | E8 |
| `beta_reverse.reverse_max_power_frac` | - | engine | 0.6 | ใช่ | ต่ำ | E8 |
| `beta_reverse.blade_angle_FI_deg` | deg | propeller | 11 | ใช่ | ต่ำ | E9 |
| `derived_vtbd.P_avail_vs_OAT_SL` | kW | engine | ตาราง OAT_C[8] | ใช่ | ต่ำ | E1 |
| `derived_vtbd.P_avail_static_grid` | kW | engine | ตาราง alt_ft[7] × isa_dev_C[4] | ใช่ | ต่ำ | E1, E12 |
| `reference_engines.PT6A-62` | mixed | engine | {"P_kW":708,"flat_C":37,"ITT_C":800,"Np_rpm":…} |  | สูง | E1, E2 |
| `reference_engines.PT6A-60A` | mixed | engine | {"P_kW":783,"flat_C":25,"ITT_C":820,"Np_rpm":…} |  | สูง | E1 |
| `reference_engines.PT6A-52` | mixed | engine | {"P_kW":634,"flat_C":61,"ITT_C":820,"Np_rpm":…} |  | สูง | E1 |
| `reference_engines.PT6A-68` | mixed | engine | {"P_kW":932,"flat_C":42.4,"ITT_C":820,"Np_rpm…} |  | สูง | E3 |
| `reference_engines.PT6A-68B_C_D_T` | mixed | engine | {"P_kW":1194,"flat_C_68B":30.8,"flat_C_68CDT"…} |  | สูง | E3 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (3)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `sim.limiter` | bool | sim | 1 | ใช่ | กลาง | E1, E7 |
| `sim.leverMode` | - | sim | {"mode":"power"} | ใช่ | กลาง | E13 |
| `sim.engine_update_rate_Hz` | Hz | sim | 240 | ใช่ | สูง |  |

## `turbofan` — [หัวข้อ 5. เทอร์โบแฟน](05-turbofan.md)

### ต้องเติมรายแบบเครื่องบิน (62)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `engines.CFM56_7B27_class.F00` | N | engine | 121400 |  | สูง | F10, F14 |
| `engines.CFM56_7B27_class.bpr` | - | engine | 5.1 |  | กลาง | F10 |
| `engines.CFM56_7B27_class.opr` | - | engine | 29 |  | กลาง | F10 |
| `engines.CFM56_7B27_class.ffLTO` | kg/s | engine | [1.293,1.031,0.343,0.11] |  | กลาง | F10 |
| `engines.CFM56_7B27_class.N1_100_rpm` | rpm | engine | 5175 | ใช่ | กลาง | F14 |
| `engines.CFM56_7B27_class.N2_100_rpm` | rpm | engine | 14460 | ใช่ | กลาง | F14 |
| `engines.CFM56_7B27_class.N1_GI_pct` | %N1 | engine | 20 | ใช่ | ต่ำ | F16 |
| `engines.CFM56_7B27_class.Tflat_C` | degC | engine | 30 | ใช่ | ต่ำ |  |
| `engines.CFM56_7B27_class.kT_perK` | 1/K | engine | 0.0075 | ใช่ | ต่ำ | F12 |
| `engines.CFM56_7B27_class.N2_GI_pct` | %N2 | engine | 59 | ใช่ | ต่ำ | F16, F14, F19 |
| `engines.CFM56_7B27_class.N2_FI_pct` | %N2 | engine | 61 | ใช่ | ต่ำ | F16 |
| `engines.CFM56_7B27_class.N2_AI_pct` | %N2 | engine | 69 | ใช่ | ต่ำ | F18 |
| `engines.CFM56_7B27_class.idleFrac0` | - | engine | 0.05 | ใช่ | ต่ำ | F19, F10 |
| `engines.CFM56_7B27_class.idleMach0` | - | engine | 0.5 | ใช่ | ต่ำ | F19 |
| `engines.CFM56_7B27_class.thrustExp_k` | - | engine | 2 | ใช่ | กลาง | F19 |
| `engines.CFM56_7B27_class.tau2_s` | s | engine | 0.35 | ใช่ | ต่ำ | F17 |
| `engines.CFM56_7B27_class.Racc_pctps` | %N2/s | engine | 18 | ใช่ | ต่ำ | F1, F17 |
| `engines.CFM56_7B27_class.accShape_a` | - | engine | 6 | ใช่ | ต่ำ | F19 |
| `engines.CFM56_7B27_class.Rdec_pctps` | %N2/s | engine | 16 | ใช่ | ต่ำ | F17 |
| `engines.CFM56_7B27_class.altExp` | - | engine | 1 | ใช่ | ต่ำ | F17 |
| `engines.CFM56_7B27_class.tauFan_s` | s | engine | 0.25 | ใช่ | ต่ำ |  |
| `engines.CFM56_7B27_class.revType` | - | engine | {"type":"cascade (translating sleeve, fan str…} |  | กลาง | F14, F21 |
| `engines.CFM56_7B27_class.rev_c0` | - | engine | 0.3 | ใช่ | ต่ำ | F23, F25 |
| `engines.CFM56_7B27_class.rev_c1` | 1/Mach | engine | 1 | ใช่ | ต่ำ | F21, F25 |
| `engines.CFM56_7B27_class.rev_uMax` | - | engine | 0.7 | ใช่ | ต่ำ | F25, F29 |
| `engines.CFM56_7B27_class.rev_idleFrac` | - | engine | 0.1 | ใช่ | ต่ำ | F21 |
| `engines.CFM56_7B27_class.rev_deploy_s` | s | engine | 2 | ใช่ | ต่ำ | F22, F25 |
| `engines.CFM56_7B27_class.rev_stow_s` | s | engine | 2.5 | ใช่ | ต่ำ |  |
| `engines.CFM56_5B4_class.inherits` | - | engine | {"from":"CFM56_7B27_class"} | ใช่ | กลาง |  |
| `engines.CFM56_5B4_class.F00` | N | engine | 120100 |  | สูง | F10 |
| `engines.CFM56_5B4_class.bpr` | - | engine | 5.7 |  | กลาง | F10 |
| `engines.CFM56_5B4_class.opr` | - | engine | 27.3 |  | กลาง | F10 |
| `engines.CFM56_5B4_class.ffLTO` | kg/s | engine | [1.142,0.939,0.316,0.102] |  | กลาง | F10 |
| `engines.CFM56_5B4_class.N1_100_rpm` | rpm | engine | 5000 | ใช่ | ต่ำ |  |
| `engines.CFM56_5B4_class.N2_100_rpm` | rpm | engine | 14460 | ใช่ | ต่ำ | F14 |
| `engines.CFM56_5B4_class.N1_GI_pct` | %N1 | engine | 20 | ใช่ | ต่ำ | F16 |
| `engines.CFM56_5B4_class.Tflat_C` | degC | engine | 30 | ใช่ | ต่ำ |  |
| `engines.CFM56_5B4_class.N2_GI_pct` | %N2 | engine | 59 | ใช่ | ต่ำ | F16, F14, F19 |
| `engines.CFM56_5B4_class.N2_FI_pct` | %N2 | engine | 61 | ใช่ | ต่ำ | F16 |
| `engines.CFM56_5B4_class.N2_AI_pct` | %N2 | engine | 69 | ใช่ | ต่ำ | F18 |
| `engines.CFM56_5B4_class.idleFrac0` | - | engine | 0.05 | ใช่ | ต่ำ | F19, F10 |
| `engines.CFM56_5B4_class.Rdec_pctps` | %N2/s | engine | 16 | ใช่ | ต่ำ | F17 |
| `engines.CFM56_5B4_class.tauFan_s` | s | engine | 0.25 | ใช่ | ต่ำ |  |
| `engines.CFM56_5B4_class.revType` | - | engine | {"type":"pivoting door"} |  | กลาง | F25 |
| `engines.LEAP_1A26_class.inherits` | - | engine | {"from":"CFM56_7B27_class"} | ใช่ | กลาง |  |
| `engines.LEAP_1A26_class.F00` | N | engine | 120600 |  | สูง | F10, F15 |
| `engines.LEAP_1A26_class.bpr` | - | engine | 11.1 |  | กลาง | F10 |
| `engines.LEAP_1A26_class.opr` | - | engine | 33.3 |  | กลาง | F10 |
| `engines.LEAP_1A26_class.ffLTO` | kg/s | engine | [0.861,0.71,0.244,0.091] |  | กลาง | F10 |
| `engines.LEAP_1A26_class.N1_100_rpm` | rpm | engine | 3856 |  | สูง | F15 |
| `engines.LEAP_1A26_class.N2_100_rpm` | rpm | engine | 16645 |  | สูง | F15 |
| `engines.LEAP_1A26_class.N1_GI_pct` | %N1 | engine | 18 | ใช่ | ต่ำ | F16 |
| `engines.LEAP_1A26_class.Tflat_C` | degC | engine | 30 | ใช่ | ต่ำ |  |
| `engines.LEAP_1A26_class.N2_GI_pct` | %N2 | engine | 57 | ใช่ | ต่ำ | F16, F14, F19 |
| `engines.LEAP_1A26_class.N2_FI_pct` | %N2 | engine | 59 | ใช่ | ต่ำ | F16 |
| `engines.LEAP_1A26_class.N2_AI_pct` | %N2 | engine | 68 | ใช่ | ต่ำ | F18 |
| `engines.LEAP_1A26_class.idleFrac0` | - | engine | 0.045 | ใช่ | ต่ำ | F19, F10 |
| `engines.LEAP_1A26_class.Rdec_pctps` | %N2/s | engine | 15 | ใช่ | ต่ำ | F17 |
| `engines.LEAP_1A26_class.tauFan_s` | s | engine | 0.3 | ใช่ | ต่ำ |  |
| `engines.LEAP_1A26_class.revType` | - | engine | {"type":"cascade (translating sleeve)"} |  | กลาง | F15 |
| `reverser.cancel_kt` | kt | aircraft | 60 |  | กลาง | F24, F25 |
| `reverser.revSpool_target_s` | s | engine | 3 |  | ต่ำ | F29 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (22)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `lapse.takeoffModel` | - | environment | {"name":"Bartel-Young 2008 eq.11-14","validMa…} |  | กลาง | F11, F10 |
| `lapse.BY_A` | - | environment | [-0.4327,1.3855,0.0472] |  | กลาง | F10, F11 |
| `lapse.BY_Z` | - | environment | [0.9106,-1.7736,1.8697] |  | กลาง | F10, F11 |
| `lapse.BY_X` | - | environment | [0.1377,-0.4374,1.3003] |  | กลาง | F10, F11 |
| `lapse.BY_lin` | - | environment | [0.377,0.82] |  | กลาง | F10, F11 |
| `lapse.BY_quad` | - | environment | [0.23,0.19] |  | กลาง | F10, F11 |
| `lapse.BY_G0fit` | - | environment | [0.0606,0.6337] | ใช่ | ต่ำ | F10 |
| `lapse.tempModel` | - | environment | {"form":"F = Fflat*(1 - kT*max(0, OAT - Tflat…} | ใช่ | กลาง | F12, F16 |
| `idleAndLTO.LTO_pct` | % rated | environment | {"takeoff":100,"climb":85,"approach":30,"idle…} |  | สูง | F8 |
| `idleAndLTO.N1_display` | - | sim | {"form":"N1 = N1gi + (N1max-N1gi)*sqrt(phi_la…} | ใช่ | ต่ำ | F17 |
| `idleAndLTO.AI_select` | - | sim | {"flapsAtLeast":"landing","orGearDown":true,"…} | ใช่ | ต่ำ |  |
| `cert.accel_FI_to_95pct_s` | s | environment | 5 |  | สูง | F1 |
| `cert.lever_full_travel_s` | s | environment | 1 |  | สูง | F1, F6 |
| `cert.GA_thrust_available_at_s` | s | environment | 8 |  | สูง | F2 |
| `cert.landing_climb_gradient` | - | environment | 0.032 |  | สูง | F2 |
| `cert.reverse_credit` | - | environment | {"accelStopDry":false,"accelStopWet":true,"la…} |  | สูง | F3, F4 |
| `cert.Vmc_limits` | - | environment | {"maxBank_deg":5,"VmcMax_over_VSR":1.13,"rudd…} |  | สูง | F7 |
| `reverser.pilotAction_min_s` | s | sim | 1 |  | สูง | F22 |
| `reverser.interlock` | - | sim | {"wow":"main gear","forwardLeverAtIdle":true,…} | ใช่ | กลาง | F22 |
| `reverser.LDF_AC91_79B` | - | environment | ตาราง RwyCC[6] × col[2] |  | สูง | F23 |
| `sim.testFixture_A320class` | mixed | sim | {"m_kg":62000,"S_m2":122.6,"CDground":0.1,"nE…} | ใช่ | ต่ำ | F22 |
| `sim.vmcFixture_JSBSim737` | mixed | sim | {"S_m2":108.79,"b_m":28.86,"Cn_dr_perRad":-0.…} | ใช่ | ต่ำ | F19 |

## `controls` — [หัวข้อ 6. ระบบบังคับ](06-controls.md)

### ต้องเติมรายแบบเครื่องบิน (50)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `pitch.architecture` | - | aircraft | {"kind":"reversible","input":"force"} | ใช่ | สูง | C23, C15 |
| `pitch.S_e` | m2 | aircraft | 1.1 | ใช่ | ต่ำ | C17 |
| `pitch.c_e` | m | aircraft | 0.3 | ใช่ | ต่ำ | C17 |
| `pitch.gearing` | rad/m | aircraft | 2.4 | ใช่ | ต่ำ |  |
| `pitch.eta_t` | - | aircraft | 0.9 | ใช่ | กลาง |  |
| `pitch.a_t` | 1/rad | aircraft | 3.9 | ใช่ | กลาง |  |
| `pitch.tau_e` | - | aircraft | 0.55 | ใช่ | กลาง | C16 |
| `pitch.l_t` | m | aircraft | 5.42 | ใช่ | กลาง |  |
| `pitch.deda` | - | aircraft | 0.36 | ใช่ | กลาง |  |
| `pitch.Ch0` | - | aircraft | 0 | ใช่ | ต่ำ |  |
| `pitch.Ch_alpha` | 1/rad | aircraft | -0.1146 | ใช่ | ต่ำ | C15, C17 |
| `pitch.Ch_delta` | 1/rad | aircraft | -0.3438 | ใช่ | ต่ำ | C15, C16, C17 |
| `pitch.Ch_tab` | 1/rad | aircraft | -0.2005 | ใช่ | ต่ำ | C16 |
| `pitch.tab_max` | deg | aircraft | 20 | ใช่ | ต่ำ |  |
| `pitch.trim_rate_flaps_down` | deg/s | aircraft | 1 | ใช่ | ต่ำ |  |
| `pitch.trim_rate_flaps_up` | deg/s | aircraft | 0.5 | ใช่ | ต่ำ |  |
| `pitch.breakout` | N | aircraft | 4.45 | ใช่ | ต่ำ | C19, C20 |
| `pitch.friction` | N | aircraft | 4.45 | ใช่ | ต่ำ | C18, C19 |
| `pitch.centring_spring` | N/rad, Pa | aircraft | {"Kc":60,"qFade":400} | ใช่ | ต่ำ |  |
| `pitch.stops` | deg | aircraft | {"teu":22,"ted":15} |  | กลาง |  |
| `pitch.rate_limit` | deg/s | aircraft | 70 | ใช่ | ต่ำ |  |
| `pitch.derived_check` | mixed | aircraft | {"Fs_per_g_N":39.7,"grad_95kt_N_per_kt":0.63,…} | ใช่ | กลาง |  |
| `roll.architecture` | - | aircraft | {"kind":"reversible","input":"force"} | ใช่ | สูง | C31 |
| `roll.S_a_each` | m2 | aircraft | 0.65 | ใช่ | ต่ำ | C17 |
| `roll.c_a` | m | aircraft | 0.25 | ใช่ | ต่ำ | C17 |
| `roll.gearing` | rad/m | aircraft | 3.88 | ใช่ | ต่ำ |  |
| `roll.Ch_delta` | 1/rad | aircraft | -0.1719 | ใช่ | ต่ำ |  |
| `roll.Ch_alpha` | 1/rad | aircraft | -0.0573 | ใช่ | ต่ำ |  |
| `roll.tab_max` | deg | aircraft | 10 | ใช่ | ต่ำ |  |
| `roll.trim_rate` | deg/s | aircraft | 1 | ใช่ | ต่ำ |  |
| `roll.breakout` | N | aircraft | 3 | ใช่ | ต่ำ | C18, C19 |
| `roll.stops` | deg | aircraft | {"max":20} |  | กลาง |  |
| `roll.rate_limit` | deg/s | aircraft | 80 | ใช่ | ต่ำ |  |
| `yaw.architecture` | - | aircraft | {"kind":"reversible","input":"force"} | ใช่ | สูง | C23 |
| `yaw.S_r` | m2 | aircraft | 0.85 | ใช่ | ต่ำ |  |
| `yaw.c_r` | m | aircraft | 0.32 | ใช่ | ต่ำ |  |
| `yaw.gearing` | rad/m | aircraft | 4.85 | ใช่ | ต่ำ |  |
| `yaw.Ch_delta` | 1/rad | aircraft | -0.3438 | ใช่ | ต่ำ |  |
| `yaw.Ch_beta` | 1/rad | aircraft | -0.1146 | ใช่ | ต่ำ |  |
| `yaw.slipstream_q_ratio` | - | aircraft | [1,2] | ใช่ | ต่ำ |  |
| `yaw.tab_max` | deg | aircraft | 15 | ใช่ | ต่ำ | C18 |
| `yaw.trim_rate` | deg/s | aircraft | 1.5 | ใช่ | ต่ำ |  |
| `yaw.breakout` | N | aircraft | 13.3 | ใช่ | กลาง | C14 |
| `yaw.stops` | deg | aircraft | {"max":25} |  | กลาง |  |
| `yaw.rate_limit` | deg/s | aircraft | 60 | ใช่ | ต่ำ |  |
| `reference_types.b737_rudder_rate` | deg/s | aircraft | {"dual":66,"primaryOnly":33} |  | กลาง | C25 |
| `reference_types.b737_rudder_pedal_force_full` | N | aircraft | 311 |  | กลาง | C25 |
| `reference_types.b737_yaw_damper_authority` | deg | aircraft | 3 |  | กลาง | C25 |
| `reference_types.b737max_stab_rate_flaps_down` | deg/s | aircraft | 0.27 |  | สูง | C24 |
| `reference_types.atr72_aileron` | deg, lbf, deg/s | aircraft | {"maxDeflection":14,"wheelForceDesignMax_lbf"…} |  | สูง | C31 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (20)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `pitch.float_lag` | s | sim | 0.05 | ใช่ | กลาง | C14 |
| `requirements.part23_force_limits` | lbf | sim | {"temporary":{"pitch_stick":60,"roll_stick":3…} |  | สูง | C1, C11 |
| `requirements.part25_force_limits` | lbf | sim | {"short2":{"pitch":75,"roll":50},"short1":{"p…} |  | สูง | C8 |
| `requirements.part23_maneuver_force_min` | lbf (W in lbf) | sim | {"wheel":{"perWeight":0.01,"min":20,"cap":50}…} |  | สูง | C2, C11 |
| `requirements.mil8785c_fs_per_g_centre_stick` | lbf/g | sim | {"L1":{"maxNum":240,"maxCap":28,"maxFloorNum"…} |  | กลาง | C12, C13 |
| `requirements.mil8785c_fs_per_g_wheel_L1` | lbf/g | sim | {"maxNum":500,"maxCap":120,"maxFloorNum":120,…} |  | กลาง | C12 |
| `requirements.force_per_deflection_min_catA` | mixed | sim | {"stickOrWheel_lbf_per_in":5,"sidestick_lbf_p…} |  | กลาง | C12 |
| `requirements.speed_stability_return` | fraction | sim | {"part23":0.1,"part25_cruise":0.075,"part25_o…} |  | สูง | C4, C9 |
| `requirements.part25_min_speed_gradient` | lbf/kt | sim | 0.1667 |  | สูง | C9 |
| `requirements.time_delay_levels` | s | sim | [0.1,0.2,0.25] |  | สูง | C14 |
| `requirements.surface_lag_levels` | deg | sim | {"L12_catAC":30,"L12_catB":45,"L3":60} |  | กลาง | C14 |
| `requirements.pedal_breakout` | lbf | sim | {"classIIC":[1,7],"classIIL_III":[1,14]} |  | กลาง | C14 |
| `input.force_full_scale` | N | sim | {"pitch":267,"roll":133,"yaw":667} | ใช่ | กลาง | C1 |
| `input.deadzone_gamepad` | - | sim | 0.08 | ใช่ | ต่ำ | C28 |
| `input.deadzone_touch` | - | sim | 0.04 | ใช่ | ต่ำ |  |
| `input.expo` | - | sim | 0.5 | ใช่ | ต่ำ |  |
| `input.keyboard_force_ramp` | N/s, N/s, N | sim | {"up":45,"release":180,"max":89} | ใช่ | ต่ำ |  |
| `input.auto_trim_ref_force` | N | sim | 11.1 | ใช่ | ต่ำ |  |
| `input.force_display_marks` | lbf | sim | {"pitch":[10,40,60],"roll":[5,30],"yaw":[20,1…} |  | สูง | C1, C4 |
| `input.trim_alert` | lbf, s | sim | {"force_lbf":2,"hold_s":3} | ใช่ | ต่ำ |  |

## `gear` — [หัวข้อ 7. ล้อและพื้น](07-gear.md)

### ต้องเติมรายแบบเครื่องบิน (68)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `geometry.nose_contact_body_extended` | m FRD | aircraft | [2.3,0,1.454] | ใช่ | ต่ำ |  |
| `geometry.main_contact_body_extended` | m FRD | aircraft | [[-0.35,-1.55,1.506],[-0.35,1.55,1.506]] | ใช่ | ต่ำ |  |
| `geometry.cg_height_parked` | m | aircraft | 1.3 | ใช่ | ต่ำ |  |
| `strut_main.stroke` | m | gear | 0.25 | ใช่ | ต่ำ | G3, G4 |
| `strut_main.p_static` | psi | gear | 300 | ใช่ | ต่ำ |  |
| `strut_main.piston_area` | m2 | gear | 0.00463 | ใช่ | ต่ำ |  |
| `strut_main.ratio_static_to_extended` | - | gear | 2.5 | ใช่ | ต่ำ |  |
| `strut_main.ratio_compressed_to_extended` | - | gear | 8 | ใช่ | ต่ำ |  |
| `strut_main.polytropic_n_dynamic` | - | gear | 1.12 |  | กลาง | G8 |
| `strut_main.polytropic_n_static` | - | gear | 1 | ใช่ | กลาง |  |
| `strut_main.Kh_compression` | N/(m/s)^2 | gear | 4000 | ใช่ | ต่ำ | G8 |
| `strut_main.Kr_rebound` | N/(m/s)^2 | gear | 48000 | ใช่ | ต่ำ |  |
| `strut_main.c_linear` | N s/m | gear | 2000 | ใช่ | ต่ำ |  |
| `strut_main.seal_friction_ratio` | - | gear | 0 | ใช่ | ต่ำ | G8 |
| `strut_nose.stroke` | m | gear | 0.2 | ใช่ | ต่ำ |  |
| `strut_nose.p_static` | psi | gear | 300 | ใช่ | ต่ำ |  |
| `strut_nose.piston_area` | m2 | gear | 0.00141 | ใช่ | ต่ำ |  |
| `strut_nose.ratio_static_to_extended` | - | gear | 2.5 | ใช่ | ต่ำ |  |
| `strut_nose.ratio_compressed_to_extended` | - | gear | 8 | ใช่ | ต่ำ |  |
| `strut_nose.Kh_compression` | N/(m/s)^2 | gear | 1600 | ใช่ | ต่ำ |  |
| `strut_nose.Kr_rebound` | N/(m/s)^2 | gear | 19000 | ใช่ | ต่ำ |  |
| `strut_nose.c_linear` | N s/m | gear | 1000 | ใช่ | ต่ำ |  |
| `tyre_main.size` | - | gear | {"size":"6.50-8","type":"III","ply":8} | ใช่ | กลาง | G18 |
| `tyre_main.rated_load` | N | gear | 14012 |  | สูง | G18 |
| `tyre_main.rated_pressure` | psi | gear | 75 |  | สูง | G18 |
| `tyre_main.operating_pressure` | psi | gear | 60 | ใช่ | ต่ำ | G18 |
| `tyre_main.outside_diameter` | m | gear | 0.495 |  | สูง | G18 |
| `tyre_main.section_width` | m | gear | 0.168 |  | สูง | G18 |
| `tyre_main.k_vertical` | N/m | gear | 320000 | ใช่ | ต่ำ | G9 |
| `tyre_main.c_vertical` | N s/m | gear | 3500 | ใช่ | ต่ำ |  |
| `tyre_main.cornering_stiffness_coef` | 1/rad | gear | 3.2 | ใช่ | ต่ำ | G9 |
| `tyre_main.relaxation_length` | m | gear | 0.3 | ใช่ | ต่ำ | G9 |
| `tyre_main.k_longitudinal` | N/m | gear | 246000 | ใช่ | ต่ำ | G9 |
| `tyre_main.mu_peak_dry` | - | gear | 0.8 |  | กลาง | G12, G19 |
| `tyre_main.mu_skid_ratio_dry` | - | gear | 0.75 | ใช่ | ต่ำ |  |
| `tyre_main.mu_skid_ratio_wet` | - | gear | 0.5 | ใช่ | ต่ำ | G11 |
| `tyre_main.rolling_radius` | m | gear | 0.235 | ใช่ | ต่ำ | G9 |
| `tyre_main.wheel_inertia` | kg m2 | gear | 0.33 | ใช่ | ต่ำ |  |
| `tyre_nose.size` | - | gear | {"size":"5.00-5","type":"III","ply":6} | ใช่ | กลาง | G18 |
| `tyre_nose.rated_load` | N | gear | 5716 |  | สูง | G18 |
| `tyre_nose.rated_pressure` | psi | gear | 50 |  | สูง | G18 |
| `tyre_nose.operating_pressure` | psi | gear | 45 | ใช่ | ต่ำ |  |
| `tyre_nose.outside_diameter` | m | gear | 0.354 |  | สูง | G18 |
| `tyre_nose.k_vertical` | N/m | gear | 160000 | ใช่ | ต่ำ | G9 |
| `tyre_nose.c_vertical` | N s/m | gear | 1200 | ใช่ | ต่ำ |  |
| `tyre_nose.cornering_stiffness_coef` | 1/rad | gear | 3.2 | ใช่ | ต่ำ | G9 |
| `tyre_nose.relaxation_length` | m | gear | 0.22 | ใช่ | ต่ำ | G9 |
| `brakes.force_limit_ratio` | - | gear | 0.6 | ใช่ | ต่ำ |  |
| `brakes.pressure_rise_rate` | 1/s | gear | 2.5 | ใช่ | ต่ำ |  |
| `brakes.antiskid` | bool | aircraft | 0 | ใช่ | กลาง |  |
| `brakes.antiskid_efficiency` | - | aircraft | {"on_off":0.3,"quasi_modulating":0.5,"fully_m…} |  | สูง | G6, G13 |
| `brakes.antiskid_efficiency_measured` | - | aircraft | {"dry":0.94,"wet":0.8} |  | กลาง | G12 |
| `brakes.antiskid_slip_setpoint` | - | aircraft | 0.15 |  | กลาง | G12 |
| `brakes.heat_sink_mass` | kg | gear | 6 | ใช่ | ต่ำ |  |
| `brakes.heat_sink_cool_tau` | s | gear | 900 | ใช่ | ต่ำ |  |
| `brakes.fade_start_temp` | degC | gear | 400 | ใช่ | ต่ำ |  |
| `brakes.fade_full_temp` | degC | gear | 700 | ใช่ | ต่ำ |  |
| `steering.mode` | - | aircraft | {"type":"pedal_linked","caster_with_diff_brak…} | ใช่ | ต่ำ |  |
| `steering.pedal_max` | deg | aircraft | 12 | ใช่ | ต่ำ | G19 |
| `steering.caster_max` | deg | aircraft | 45 | ใช่ | ต่ำ |  |
| `steering.steer_rate` | deg/s | aircraft | 60 | ใช่ | ต่ำ |  |
| `steering.shimmy_lag` | s | aircraft | 0.05 | ใช่ | ต่ำ |  |
| `certification.part23_limit_descent` | fps | aircraft | {"formula":"V = 4.4 (W/S)^0.25 fps, 7..10 fps…} |  | สูง | G3 |
| `certification.part23_wing_lift_ratio` | - | aircraft | 0.667 |  | สูง | G3, G4 |
| `certification.part23_min_load_factors` | g | aircraft | {"inertia":2.67,"ground_reaction":2} |  | สูง | G3 |
| `certification.part23_reserve_drop_factor` | x drop height | aircraft | 1.44 |  | สูง | G5 |
| `certification.part25_limit_descent` | fps | aircraft | {"design_landing_weight_fps":10,"design_takeo…} |  | สูง | G1, G2 |
| `certification.part25_friction_cap` | - | aircraft | 0.8 |  | สูง | G1 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (14)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `surface.rolling_mu` | - | environment | {"paved":0.02,"gravel":0.04,"ws30land":0.1} |  | ต่ำ | G21, G19 |
| `surface.friction_factor` | - | environment | {"paved":1,"gravel":0.5,"ws30land":0.7} |  | ต่ำ | G21 |
| `surface.wet_mu_max_coeffs` | μ = a3 x^3 + a2 x^2 + a1 x + a0, x = V_gs[kt]/100 | environment | ตาราง psi[4] × term[4] |  | สูง | G6 |
| `surface.rwycc_wheel_braking_mu` | - | environment | {"rwycc6_factor_of_dry":0.9,"rwycc5":"25.109(…} |  | สูง | G13, G15 |
| `surface.wet_grooved_mu_max_coeffs` | μ = Σ a_k x^k, x = V_gs[kt]/100 | environment | ตาราง psi[4] × term[6] |  | กลาง | G6 |
| `surface.wet_depth_threshold` | mm | environment | 3 |  | สูง | G14, G15, G16 |
| `surface.hydroplaning_k_rolling` | kt/sqrt(psi) | environment | 9 |  | สูง | G10, G13 |
| `surface.hydroplaning_k_nonrotating` | kt/sqrt(psi) | environment | 7.7 |  | กลาง | G11 |
| `surface.hydroplaning_onset_factor` | - | environment | 0.85 |  | สูง | G13, G15 |
| `surface.mu_hydroplaning` | - | environment | 0.05 |  | สูง | G10, G13 |
| `sim.strut_state_in_rk4` | bool | sim | 1 | ใช่ | กลาง |  |
| `sim.tyre_lateral_state_in_rk4` | bool | sim | 1 | ใช่ | กลาง |  |
| `sim.lateral_damping` | N s/m | sim | 9900 | ใช่ | ต่ำ |  |
| `sim.hard_landing_fpm` | fpm | sim | {"inspect":600,"damage":720,"crash":900} | ใช่ | ต่ำ | G3, G5 |

## `wind` — [หัวข้อ 8. ลม ความปั่นป่วน microburst wake](08-wind.md)

### ต้องเติมรายแบบเครื่องบิน (6)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `discreteGust.cfr25_341_Fg` | - | aircraft | {"Fgz":"1 - Zmo/250000","Fgm":"sqrt(R2*tan(pi…} |  | สูง | W9 |
| `fFactor.trainerExcessTW` | - | aircraft | 0.218 | ใช่ | กลาง |  |
| `wake.b0_over_b` | - | aircraft | 0.7854 |  | สูง | W19 |
| `wake.rc_over_b` | - | aircraft | {"default":0.035,"min":0.02,"max":0.06} |  | กลาง | W19, W24 |
| `wake.leaders` | kg, m, kt, m2/s, m/s | aircraft | {"A320ceo":{"mass_kg":64500,"span_m":35.8,"Va…} | ใช่ | กลาง | W31, W32 |
| `wake.trainerRollControl` | - | aircraft | {"Clda":0.16,"daMax_deg":20,"ClMax":0.0559,"r…} | ใช่ | กลาง |  |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (33)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `meanProfile.model` | - | environment | {"default":"log","options":["log","power"]} |  | กลาง | W5, W17 |
| `meanProfile.zRef_m` | m | environment | 10 |  | ต่ำ | W18 |
| `meanProfile.z0_m` | m | environment | {"milspec_catC":0.046,"open_grass":0.03,"roug…} |  | กลาง | W5, W17 |
| `meanProfile.z0_default_VTBD_m` | m | environment | 0.05 | ใช่ | ต่ำ | W5, W17 |
| `meanProfile.powerExponent_legacy` | - | environment | 0.142857 | ใช่ | กลาง | W5 |
| `meanProfile.profileTop_m` | m | environment | 300 | ใช่ | ต่ำ | W5 |
| `turbulence.spec` | - | sim | {"default":"MIL-F-8785C-Dryden","options":["M…} |  | สูง | W1, W2 |
| `turbulence.W20_by_severity` | kt | environment | {"light":15,"moderate":30,"severe":45} |  | สูง | W1, W7 |
| `turbulence.sigmaW_over_W20` | - | environment | 0.1 |  | สูง | W1, W7 |
| `turbulence.lowAlt_coeffs` | ft | environment | {"a":0.177,"b_per_ft":0.000823,"L_exp":1.2,"s…} |  | สูง | W1, W7 |
| `turbulence.highAlt_L_ft` | ft | environment | {"dryden":1750,"vonKarman":2500,"blendFrom_ft…} |  | สูง | W1, W2, W7 |
| `turbulence.highAlt_sigma_POE` | ft/s | environment | ตาราง prob[7] × alt_ft[12] |  | กลาง | W7, W1 |
| `turbulence.rotary` | σp = k·σw/(Lw·b²)^(1/3); τ = k·b/(π·V) | environment | {"sigmaP_coeff":0.954,"tauP_k":4,"tauQ_k":4,"…} | ใช่ | กลาง | W1, W3 |
| `turbulence.sigmaP_1797_simplified` | σp = 1.9σw/√(h·b); Lp = √(h·b)/2.6 | environment | {"coeff":1.9,"Lp_div":2.6} |  | กลาง | W3, W8 |
| `turbulence.verticalTaper_m` | m | sim | 3 | ใช่ | ต่ำ |  |
| `turbulence.dt_s` | s | sim | 0.0041667 |  | สูง |  |
| `discreteGust.cfr25_341` | ft/s EAS, ft | environment | {"Uref_SL_ftps_EAS":56,"Uref_15000ft":44,"Ure…} |  | สูง | W9 |
| `discreteGust.milspec_8785C` | m, m/s | environment | {"shape":"Vm/2*(1-cos(pi*x/dm)) for 0<=x<=dm,…} |  | กลาง | W4 |
| `discreteGust.etso_c117b_nuisance` | kt, rad/s | environment | {"A_kt":7.5,"omega_radps":[2.1,1.26,0.78,0.63…} |  | กลาง | W11 |
| `microburst.OB_relations` | - | environment | {"zm_over_zstar":0.22,"zstar_over_eps":12.5,"…} |  | สูง | W13, W11 |
| `microburst.Vicroy` | - | environment | {"alpha":2,"c1c2_TM104053":[-0.22,-2.75],"c1c…} |  | กลาง | W14, W15 |
| `microburst.etso_sets` | ft, ft/s | environment | ตาราง col[4] |  | สูง | W11 |
| `microburst.training_sets_trainer` | m, m/s | sim | ตาราง col[5] | ใช่ | กลาง | W13, W16 |
| `microburst.translation_mps` | m/s | environment | 0 | ใช่ | ต่ำ |  |
| `fFactor.avgLength_m` | m | sim | 1000 |  | สูง | W16, W15 |
| `fFactor.hazardThreshold` | - | sim | 0.1 |  | กลาง | W16 |
| `fFactor.faaMustAlert` | - | sim | 0.13 |  | กลาง | W16 |
| `fFactor.reactiveFloor` | - | sim | {"default":0.105,"approachMode":0.09,"takeoff…} |  | สูง | W11 |
| `wake.decay_SwitzerProctor` | - | environment | {"Tss_a":1.27,"Tss_b":0.57,"Tss_N":1.15,"beta…} |  | กลาง | W20 |
| `wake.epsilon_presets` | m2/s3 | environment | {"calm":0.0001,"light":0.001,"moderate":0.01} | ใช่ | ต่ำ |  |
| `wake.groundEffect` | b0 | environment | {"imageFrom_b0":1.5,"minHeight_b0":0.5,"rebou…} |  | กลาง | W21 |
| `wake.hazardBankLimit_deg` | deg | sim | 10 |  | กลาง | W24 |
| `wake.separation_NM` | NM | environment | {"ICAO_Doc4444":{"HEAVY_LIGHT":6,"MEDIUM_LIGH…} |  | กลาง | W25, W27 |

## `numerics` — [หัวข้อ 9. วิธีเชิงตัวเลข](09-numerics.md)

### ต้องเติมรายแบบเครื่องบิน (8)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `contact.frictionModel` | - | gear | {"name":"bristle-exponential","longitudinal":…} | ใช่ | กลาง | N5, N18, N23 |
| `contact.bristleZ0` | m | gear | 0.005 | ใช่ | กลาง | N5 |
| `contact.bristleTau` | s | gear | 0.02 | ใช่ | กลาง | N23 |
| `contact.tanhV0Longitudinal` | m/s | gear | 0.25 | ใช่ | กลาง | N1 |
| `contact.tanhV0Lateral` | m/s | gear | 0.35 | ใช่ | กลาง | N1 |
| `contact.yasimStopSpeedReference` | m/s | gear | 0.1 |  | สูง | N5 |
| `contact.currentFrictionTimeConstants` | - | gear | {"longBraked_ms":51.8,"lateral_ms":54.9,"long…} | ใช่ | สูง | N23 |
| `contact.currentGearModes` | - | gear | {"heave_Hz":1.84,"heave_zeta":0.575,"rollOnMa…} | ใช่ | สูง | N23 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (32)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `integrator.method` | - | sim | {"name":"RK4","order":4,"derivEvalsPerStep":5} |  | สูง | N1, N23 |
| `integrator.physicsHz` | Hz | sim | 240 | ใช่ | สูง | N23 |
| `integrator.physicsHzAllowed` | Hz | sim | [240,480] | ใช่ | กลาง | N23 |
| `integrator.rk4RealAxisLimit` | - | sim | 2.7853 |  | สูง | N23 |
| `integrator.rk4ImagAxisLimit` | - | sim | 2.8284 |  | สูง | N23 |
| `integrator.lambdaDtMaxTransient` | - | sim | 0.75 | ใช่ | กลาง | N23 |
| `integrator.lambdaDtMaxSteady` | - | sim | 0.25 | ใช่ | กลาง | N23 |
| `integrator.quatRenormalizeEveryStep` | flag | sim | 1 |  | สูง | N1, N2, N23 |
| `integrator.alphaDotFilterTau` | s | sim | 0.05 | ใช่ | กลาง | N1 |
| `loop.maxFrameDt` | s | sim | 0.1 |  | สูง | N1, N8 |
| `loop.maxStepsPerFrame` | - | sim | 24 | ใช่ | สูง | N23 |
| `loop.accumulatorEpsilon` | s | sim | 1e-9 | ใช่ | สูง | N23 |
| `loop.renderInterpolation` | - | sim | {"position":"lerp","attitude":"nlerp-shortest…} | ใช่ | สูง | N8, N22, N23 |
| `loop.autoPauseOnHidden` | flag | sim | 1 | ใช่ | สูง | N9, N10, N11 |
| `loop.physicsThread` | - | sim | {"where":"main","workerOnlyIfPhysicsMsPerFram…} | ใช่ | สูง | N12, N13, N14, N23 |
| `contact.gearSubsteps` | - | sim | 1 | ใช่ | กลาง | N19, N23 |
| `contact.jsbsimContactSpeedClamp` | flag | sim | 0 | ใช่ | กลาง | N3, N23 |
| `environment.gustClockHz` | Hz | environment | 120 | ใช่ | สูง | N23 |
| `determinism.rng` | - | sim | {"name":"mulberry32","streams":["turb","scena…} | ใช่ | สูง | N1, N16 |
| `determinism.stateRecorderHz` | Hz | sim | 10 |  | สูง | N1 |
| `determinism.inputRecordPerTick` | flag | sim | 1 | ใช่ | สูง | N23 |
| `determinism.stateChecksumPeriod` | s | sim | 1 | ใช่ | กลาง | N23 |
| `attitude.gimbalCosEps` | - | sim | 1e-9 | ใช่ | สูง | N4, N23 |
| `performance.tickMicrosNode` | µs | sim | {"apXl":5.11,"manAssistXl":3.87} |  | สูง | N23 |
| `performance.stepMicrosNode` | µs | sim | {"airborne":3.39,"parked":5.98} |  | สูง | N23 |
| `performance.derivMicrosNode` | µs | sim | {"airborne":0.5,"threeWheels":1.09} |  | สูง | N23 |
| `performance.physicsBudgetPerFrame` | ms | sim | 2 | ใช่ | กลาง | N23 |
| `performance.workerRoundTripNode` | µs | sim | {"median_us":36.3,"p99_us":79.3,"max_us":25404} |  | กลาง | N23 |
| `reference.jsbsimDefaultDt` | s | sim | 0.0083333 |  | สูง | N4 |
| `reference.jsbsimDefaultIntegrators` | - | sim | {"rotationalRate":"RectEuler","translationalR…} |  | สูง | N2 |
| `reference.flightgearModelHz` | Hz | sim | 120 |  | สูง | N5, N6 |
| `reference.yasimIntegrator` | - | sim | {"name":"RK4","stateFloat":"float32 สำหรับควา…} |  | สูง | N5 |

## `validation` — [หัวข้อ 10. การตรวจความสมจริง](10-validation.md)

### ต้องเติมรายแบบเครื่องบิน (10)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `classification.hqClassCategory` | - | aircraft | {"class":"I","approachLanding":"C","cruiseCli…} | ใช่ | กลาง | V7, V10 |
| `procedures.v50MinFactor_singleEngine` | × VS1 | aircraft | 1.2 |  | สูง | V17 |
| `typicalModes.c172x_jsbsim_100kcas_3000ft` | rad/s, -, s | aircraft | {"sp_wn":6.5,"sp_zeta":0.68,"ph_T_s":32,"ph_z…} | ใช่ | ต่ำ | V15 |
| `typicalModes.c172x_jsbsim_65kcas_flaps30` | rad/s, -, s | aircraft | {"sp_wn":4.38,"sp_zeta":0.67,"ph_T_s":19.7,"p…} | ใช่ | ต่ำ | V15 |
| `typicalModes.b737_jsbsim_140kcas_landing` | rad/s, -, s | aircraft | {"sp_wn":1.05,"sp_zeta":0.54,"ph_T_s":37.2,"p…} | ใช่ | ต่ำ | V15 |
| `typicalModes.b747_M08_40000ft` | rad/s, - | aircraft | {"sp_wn":0.962,"sp_zeta":0.387,"ph_wn":0.0673…} |  | กลาง | V14 |
| `typicalModes.gaFlightTest_dutchRoll` | s | aircraft | {"T_s":[2,4],"t_half_max_s":2} |  | กลาง | V13 |
| `currentModel.approach95` | rad/s, -, s | aircraft | {"sp_wn":2.221,"sp_zeta":0.578,"CAP":0.951,"n…} | ใช่ | สูง | V19 |
| `currentModel.cruise155` | rad/s, -, s | aircraft | {"sp_wn":3.593,"sp_zeta":0.56,"CAP":0.935,"nA…} | ใช่ | สูง | V19 |
| `currentModel.performance` | kt, fpm, -, m | aircraft | {"VSR_flaps1_kt":71.9,"VCLmax_flaps1_kt":70,"…} | ใช่ | สูง | V19 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (34)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `classification.fstdAnalogue` | - | sim | {"faa":"FTD Level 5 (generic aero) ถึง Level …} | ใช่ | กลาง | V3, V5 |
| `hqLimits.shortPeriodZeta_catAC` | - | sim | {"L1":[0.35,1.3],"L2":[0.25,2],"L3":[0.15,null]} |  | สูง | V7, V10 |
| `hqLimits.shortPeriodZeta_catB` | - | sim | {"L1":[0.3,2],"L2":[0.2,2],"L3":[0.15,null]} |  | สูง | V7, V11 |
| `hqLimits.CAP_catC` | 1/(g s^2) = rad^2/s^2 per g/rad | sim | {"L1":[0.16,3.6],"L2":[0.096,10]} |  | ต่ำ | V9 |
| `hqLimits.phugoid` | - / s | sim | {"L1":{"zetaMin":0.04},"L2":{"zetaMin":0},"L3…} |  | กลาง | V10, V11 |
| `hqLimits.dutchRoll_classI_catC` | - / rad/s / rad/s | sim | {"L1":{"zeta":0.08,"zetaWn":0.15,"wn":1},"L2"…} |  | กลาง | V7, V10, V11 |
| `hqLimits.rollModeTauMax_classI_catC` | s | sim | {"L1":1,"L2":1.4,"L3":10} |  | กลาง | V7, V10 |
| `hqLimits.spiralT2min_catAC` | s | sim | {"L1":12,"L2":8,"L3":4} |  | สูง | V7, V10 |
| `hqLimits.rollPerformance_classI_catC` | s | sim | {"bankChange_deg":30,"L1":1.3,"L2":1.8,"L3":2.6} |  | ต่ำ | V10 |
| `hqLimits.equivalentTimeDelay` | s | sim | {"L1":0.1,"L2":0.2,"L3":0.25} |  | กลาง | V7 |
| `fstdTolerances.groundAccel_1b1` | % / m | sim | {"timePct":5,"distPct":5,"distAbs_m":61} |  | กลาง | V2 |
| `fstdTolerances.normalTakeoff_1b4` | kt / deg / ft | sim | {"iasAbs_kt":3,"pitchAbs_deg":1.5,"aoaAbs_deg…} |  | กลาง | V2 |
| `fstdTolerances.normalClimb_1c1` | kt / % / fpm / ft | sim | {"iasAbs_kt":3,"rocPct":5,"rocAbs_fpm":100,"m…} |  | กลาง | V2, V3 |
| `fstdTolerances.levelAccelDecel_1d1_1d2` | % / kt | sim | {"timePct":5,"minSpeedChange_kt":50} |  | กลาง | V2 |
| `fstdTolerances.idleDescent_1d4` | kt / % / fpm | sim | {"iasAbs_kt":3,"rodPct":5,"rodAbs_fpm":200} |  | กลาง | V2 |
| `fstdTolerances.stopping_1e1` | % / m | sim | {"timePct":5,"distPct":10,"distAbs_m":61,"rul…} |  | สูง | V2 |
| `fstdTolerances.engineAccel_1f1` | % / s | sim | {"TtPct":10,"TiPct":10,"TiAbs_s":0.25} |  | กลาง | V2 |
| `fstdTolerances.powerChange_2c1` | kt / ft / % / deg | sim | {"iasAbs_kt":3,"altAbs_ft":100,"pitchPct":20,…} |  | กลาง | V2 |
| `fstdTolerances.longTrim_2c5` | deg / % | sim | {"trimSurfAbs_deg":0.5,"elevAbs_deg":1,"pitch…} |  | สูง | V2, V3 |
| `fstdTolerances.stall_2c8` | kt / deg | sim | {"iasAbs_kt":3,"bankAbs_deg":2} |  | กลาง | V2, V3 |
| `fstdTolerances.phugoid_2c9` | % / - | sim | {"periodPct":10,"t2Pct":10,"zetaAbs":0.02,"mi…} |  | สูง | V2, V3 |
| `fstdTolerances.shortPeriod_2c10` | deg / deg/s / g | sim | {"pitchAbs_deg":1.5,"qAbs_degs":2,"nzAbs_g":0.1} |  | กลาง | V2 |
| `fstdTolerances.rollRate_2d2` | % / deg/s | sim | {"pct":10,"abs_degs":2,"wheelFraction":0.33} |  | กลาง | V2 |
| `fstdTolerances.spiral_2d4` | deg / % / s | sim | {"bankAbs_deg":2,"bankPct":10,"window_s":20} |  | กลาง | V2 |
| `fstdTolerances.dutchRoll_2d7` | s / % / - | sim | {"periodAbs_s":0.5,"periodPct":10,"t2Pct":10,…} |  | สูง | V2 |
| `fstdTolerances.steadySideslip_2d8` | deg / % | sim | {"bankAbs_deg":2,"betaAbs_deg":1,"ailPct":10,…} |  | กลาง | V2 |
| `fstdTolerances.normalLanding_2e1` | kt / deg / % / ft | sim | {"iasAbs_kt":3,"pitchAbs_deg":1.5,"aoaAbs_deg…} |  | กลาง | V2 |
| `procedures.stallEntryRate` | kt/s (สูงสุด) | sim | 1 |  | สูง | V16, V17 |
| `procedures.stallTrimSpeed` | × VS1 / × VSR | sim | {"part23":"ราว 1.5 VS1 หรือ minimum trim spee…} |  | สูง | V16, V17 |
| `procedures.stallHoldAtStop` | s | sim | 2 |  | สูง | V17 |
| `procedures.screenHeight` | m (50 ft) | sim | 15.24 |  | สูง | V18 |
| `procedures.takeoffRunsRecommended` | runs | sim | 6 |  | สูง | V17 |
| `procedures.testWindMax` | kt / - | sim | {"kt":10,"fracVS1":0.12} |  | สูง | V17 |
| `procedures.linearisation` | - | sim | {"eps_vel_mps":0.001,"eps_rate_rads":0.00001,…} | ใช่ | สูง | V19 |

## `input` — [หัวข้อ 11. อินพุต](11-input.md)

### ต้องเติมรายแบบเครื่องบิน (2)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `keyboard.interim_trim_rate_elevator` | deg/s | aircraft | 0.5 | ใช่ | ต่ำ |  |
| `keyboard.flap_notches` | สัดส่วน AC.flaps | aircraft | [0,0.5,1] | ใช่ | ต่ำ |  |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (44)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `gamepad.standard_layout` | - | sim | ตาราง  |  | สูง | I1 |
| `gamepad.poll_per_frame` | ครั้ง/เฟรม | sim | 1 |  | สูง | I1, I6 |
| `gamepad.permissions_policy_default` | - | sim | {"allowlist":"*","chrome_since":103} |  | สูง | I1, I4, I5 |
| `gamepad.max_effect_duration` | ms | sim | 5000 |  | สูง | I1 |
| `shaping.deadzone_gamepad_stick` | สัดส่วนช่วงแกน | sim | 0.08 | ใช่ | ต่ำ | I7, I12 |
| `shaping.deadzone_flightstick` | สัดส่วนช่วงแกน | sim | 0.03 | ใช่ | ต่ำ | I12 |
| `shaping.deadzone_pedals` | สัดส่วนช่วงแกน | sim | 0.03 | ใช่ | ต่ำ |  |
| `shaping.deadzone_trigger_rudder` | สัดส่วนช่วงแกน | sim | 0.05 | ใช่ | ต่ำ | I7 |
| `shaping.outer_deadzone` | สัดส่วนช่วงแกน | sim | 0.02 | ใช่ | ต่ำ | I11 |
| `shaping.lever_end_deadzone` | สัดส่วนช่วงคันโยก | sim | {"idle":0.02,"full":0.02} | ใช่ | ต่ำ |  |
| `shaping.deadzone_auto` | - | sim | {"k_noise":1.5,"margin":0.02,"min":0.03,"max"…} | ใช่ | ต่ำ |  |
| `shaping.xinput_reference` | สัดส่วนช่วงแกน | sim | {"left_stick":0.2395,"right_stick":0.2652,"tr…} |  | สูง | I7, I8 |
| `shaping.flightgear_default_deadband` | สัดส่วนช่วงแกน | sim | 0.1 |  | สูง | I12 |
| `shaping.expo_default` | - | sim | {"gamepad":0.5,"flightstick":0.3,"pedals":0.3…} | ใช่ | ต่ำ |  |
| `shaping.expo_range` | - | sim | [0,0.9] | ใช่ | ต่ำ |  |
| `shaping.xplane_max_curve` | - | sim | {"half_input":0.5,"output":0.1,"equivalent_po…} |  | กลาง | I9 |
| `shaping.one_euro` | Hz, - (ไม่มีหน่วยเมื่อแกนเป็นสัดส่วน), Hz, สัดส่วนช่วงแกน | sim | {"min_cutoff_Hz":2,"beta":2,"d_cutoff_Hz":1,"…} | ใช่ | ต่ำ | I18 |
| `shaping.lag_budget` | s | sim | 0.1 |  | กลาง | C14 |
| `keyboard.ramp_pitch` | 1/s, 1/s, - | sim | {"up":0.5,"back":2.5,"cap":1} | ใช่ | ต่ำ |  |
| `keyboard.ramp_roll` | 1/s, 1/s, - | sim | {"up":1,"back":3,"cap":1} | ใช่ | ต่ำ |  |
| `keyboard.ramp_rudder` | 1/s, 1/s, - | sim | {"up":1,"back":2,"cap":1} | ใช่ | ต่ำ |  |
| `keyboard.fine_factor` | - | sim | 0.5 | ใช่ | ต่ำ |  |
| `keyboard.current_ramp_reference` | 1/s | sim | {"pitch_up":2,"roll_up":2.5,"rudder_up":2.5,"…} |  | สูง | repo:90-app.js:360-364 |
| `keyboard.throttle_rate` | 1/s | sim | 0.35 | ใช่ | กลาง |  |
| `keyboard.flightgear_reference` | หน่วยควบคุม | sim | {"stick_step_per_press":0.05,"trim_step_per_r…} |  | สูง | I14, I15 |
| `keyboard.os_key_repeat` | Hz | sim | [2.5,30] |  | สูง | I23 |
| `keyboard.brake_key_rise` | s | sim | 0.5 |  | กลาง | I15 |
| `keyboard.keymap_default` | KeyboardEvent.code | sim | {"pitch":[["KeyW","ArrowUp","Numpad8"],["KeyS…} | ใช่ | ต่ำ | I14, I19 |
| `devices.storage` | - | sim | {"key":"afl-input-v1","schema_version":1} | ใช่ | สูง |  |
| `devices.wizard` | s, สัดส่วนช่วงแกน, s | sim | {"rest_capture_s":2,"move_threshold":0.5,"swe…} | ใช่ | ต่ำ | I9 |
| `devices.arbitration_hold` | s | sim | 0.5 | ใช่ | ต่ำ |  |
| `devices.device_hints` | vendor:product | sim | {"044f:b108":{"name":"T.Flight Hotas X","axes…} |  | ต่ำ | I16, I26 |
| `haptics.update_period` | s | sim | 0.1 | ใช่ | ต่ำ |  |
| `haptics.effect_duration` | ms | sim | 120 | ใช่ | ต่ำ |  |
| `haptics.mix` | - | sim | {"buffet_strong":1,"buffet_weak":0.5,"runway_…} | ใช่ | ต่ำ |  |
| `haptics.user_gain` | - | sim | {"default":0.7,"range":[0,1]} | ใช่ | ต่ำ |  |
| `haptics.android_vibrate_touchdown` | ms | sim | 40 | ใช่ | ต่ำ |  |
| `touch.stick_radius_current` | px | sim | 50 |  | สูง | repo:90-app.js:346 |
| `touch.deadzone` | สัดส่วนรัศมี | sim | 0.04 | ใช่ | ต่ำ |  |
| `touch.origin_mode` | - | sim | {"default":"floating"} | ใช่ | ต่ำ |  |
| `touch.square_gate` | - | sim | {"enabled":1} | ใช่ | ต่ำ |  |
| `mouse.yoke_gain_K` | คันเต็มต่อความกว้างหน้าต่าง | sim | 4 | ใช่ | ต่ำ | I17 |
| `mouse.wheel_trim_step` | หน่วย trim ต่อคลิก | sim | 0.001 |  | กลาง | I17 |
| `browser.reserved_shortcuts_chrome` | - | sim | {"outside_fullscreen":["Ctrl/Cmd+T","Ctrl/Cmd…} |  | สูง | I22 |

## `otherSims` — [หัวข้อ 12. ซิมตัวอื่น](12-other-sims.md)

### ต้องเติมรายแบบเครื่องบิน (18)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `jsbsim.gearSideForcePacejkaDefaults` | - | gear | {"B_stiffness":0.06,"C_shape":2.8,"D_peak":"s…} |  | สูง | S5 |
| `jsbsim.c172xTrimCruise100kcas3000ft` | kt, deg, -, rpm, lb, ft | aircraft | {"vc_kts":100,"alpha_deg":0.796,"elevator_pos…} | ใช่ | กลาง | S7, S29 |
| `jsbsim.c172xTrimApproach65kcas1000ftFlap30` | kt, deg, -, rpm, fpm | aircraft | {"vc_kts":65,"vtrue_kts":65.96,"alpha_deg":2.…} | ใช่ | กลาง | S7, S29 |
| `yasim.propEtaC` | - | propeller | 0.85 |  | สูง | S12 |
| `yasim.propLambdaPeak` | - | propeller | 0.6687 |  | สูง | S12 |
| `yasim.gearStaticFrictionDefault` | - | gear | 0.8 |  | สูง | S11 |
| `yasim.gearDynamicFrictionDefault` | - | gear | 0.7 |  | สูง | S11 |
| `xplane.maxElementsPerSide` | - | aircraft | 10 |  | สูง | S14 |
| `xplane.tireRollingCoeffGuidance` | - | gear | {"airlinerFighter":0.008,"generalAviation":0.…} |  | กลาง | S15 |
| `msfs.stallDefStartRatio` | - | aircraft | 0.9 |  | สูง | S18 |
| `msfs.stallDefEndRatio` | - | aircraft | 1.1 |  | สูง | S18 |
| `msfs.stallDefCurvePower` | - | aircraft | 0.8 |  | สูง | S18 |
| `msfs.stallTipAddIncidence` | deg | aircraft | 2 |  | สูง | S18 |
| `msfs.elevatorTrimModel` | deg | aircraft | {"mode":"additive to elevator deflection","li…} |  | สูง | S20 |
| `msfs.gearSpringExponentDefault` | - | gear | 16 |  | กลาง | S22 |
| `geofs.airfoilPartFields` | - | aircraft | ["area \| liftFactor+dragFactor","stallInciden…] |  | ต่ำ | S26 |
| `geofs.enginePartThrust` | - | engine | {"unit":"N","model":"constant static thrust x…} |  | ต่ำ | S26 |
| `airfieldlab.trimKind` | - | aircraft | {"options":["tab","ths"],"trainer":"tab"} | ใช่ | กลาง | S30, S15, S20 |

### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (16)

| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |
|---|---|---|---|---|---|---|
| `jsbsim.version` | major.minor.patch | sim | [1,3,3] |  | สูง | S7 |
| `jsbsim.defaultDt` | s | sim | 0.00833333 |  | สูง | S2 |
| `jsbsim.defaultIntegrators` | - | sim | {"rotationalRate":"RectEuler","translationalR…} |  | สูง | S2 |
| `jsbsim.tableOutOfRange` | - | sim | {"mode":"clamp","extrapolate":false} |  | สูง | S3 |
| `jsbsim.costPerStep_c172x_native` | us/step | sim | 15.3 | ใช่ | กลาง | S29 |
| `jsbsim.wasmBundleBytes` | byte | sim | 1588240 |  | สูง | S9 |
| `yasim.groundEffectShape` | - | sim | {"form":"Fz_extra = Fz_aero * k_ge * (b - h)/…} |  | สูง | S12 |
| `yasim.flightgearModelHz` | Hz | sim | 120 |  | สูง | S13 |
| `xplane.minCyclesPerSecond` | Hz | sim | 15 |  | กลาง | S14 |
| `xplane.minFrameRate` | fps | sim | 20 |  | สูง | S17 |
| `msfs.windTunnelIterations` | - | sim | 100 |  | สูง | S19 |
| `geofs.inputModel` | - | sim | {"modes":["mouse","keyboard","orientation","t…} |  | ต่ำ | S26 |
| `airfieldlab.oracleTolerance` | m, m/s, deg, deg/s | sim | {"h_m":0.05,"V_mps":0.01,"theta_deg":0.05,"ph…} | ใช่ | กลาง | S29 |
| `airfieldlab.oracleMeasuredMaxErr240HzAB3` | m, m/s, deg, deg/s | sim | {"h_m":0.004,"V_mps":0.00095,"alpha_deg":0.01…} | ใช่ | สูง | S29 |
| `airfieldlab.oracleMeasuredMaxErrAdot` | m, deg, deg/s | sim | {"h_m":0.0095,"alpha_deg":0.04,"theta_deg":0.…} | ใช่ | สูง | S29 |
| `airfieldlab.stepCostNode` | us/step | sim | [3.7,4.5] | ใช่ | กลาง | S29 |

