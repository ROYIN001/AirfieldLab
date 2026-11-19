| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน | lo_lib |
|---|---|---|---|---|---|---|
| T-LO-01 | level turn 90 KIAS (TAS), bank 25° | R (m) | 468.8 ± 1 | physics, LO0 | – | 468.8 ✓ |
| T-LO-02 | c172s downwind 90 kt, bank 25° | D (m) | 1337.6 ± 1 | LO3 p8-3 range; rule LO0 (est) | – | 1337.6 ✓ |
| T-LO-03 | VTBD 21L, c172s, side L | east offset of downwind abeam threshold (m) | 1173 ± 2 | LO13 AD 2.20 4.2 (east of 03R/21L) | – | 1173 ✓ |
| T-LO-04 | VTBD 03R, c172s, side R | east offset of downwind abeam threshold (m) | 1173 ± 2 | LO13 AD 2.20 4.2 (east of 03R/21L) | – | 1173 ✓ |
| T-LO-05 | VTBD 21L, roll-out 400 ft, γ 3°, aim 308.2 m | F (m) | 2018.1 ± 1 | LO4 p9-6 (3°), LO0 | – | 2018.1 ✓ |
| T-LO-06 | VTBD 21L, c172s, base at 45° (X_B = −D), final 3° | roll-out height (ft) | 211 ± 1 | LO3 p8-3 vs LO4 p9-6 | roll-out < 300 ft → gate ไม่ผ่าน | 211 ✓ |
| T-LO-07 | 19 types × 4 runways, default circuits | all waypoints within 5 NM of ARP (max NM) | true (2.85) | LO13 AD 2.17 (ATZ 5 NM) | – | true (2.85) ✓ |
| T-LO-08 | VTBD 03R, c172s, ROC 730 fpm at 74 KIAS | x of crosswind turn (m) [= runway end] | 3501 ± 1 | LO1, LO2 11.7 | – | 3501 ✓ |
| T-LO-09 | VTBD 21L, c172s, 800 → 400 ft | mean descent angle before final (°) | 1.82 ± 0.01 | LO0 | – | 1.82 ✓ |
| T-LO-10 | GS 65 kt, γ 3° | sink (fpm) [rule 5×GS = 325] | 345 ± 1 | LO9 App 1 3.c | – | 345 ✓ |
| T-LO-11 | 21L downwind track 028.75°, 90 kt, wind 090/10 | crab (°) / GS (kt) | 5.59 / 84.76 | LO3 p8-2, p8-4 | – | 5.59 / 84.76 ✓ |
| T-LO-12 | c172s at 300 ft: 66 KIAS, −650 fpm, bank 3°, path 3.0°, flaps 30 | gate result | {"ok":true,"fails":[]} | LO4 p9-6, LO8 | – | {"ok":true,"fails":[]} ✓ |
| T-LO-13 | same, 78 KIAS (Vapp + 13) | gate result | {"ok":false,"fails":["spd"]} | LO4 p9-6 (+10/−5), LO36 | – | {"ok":false,"fails":["spd"]} ✓ |
| T-LO-14 | same, −1,100 fpm | gate result | {"ok":false,"fails":["sink"]} | LO8 (≤ 1,000 fpm) | – | {"ok":false,"fails":["sink"]} ✓ |
| T-LO-15 | same, bank 20° (still in the final turn) | gate result | {"ok":false,"fails":["bank"]} | LO4 p9-6 (≤ 15°), LO18 | – | {"ok":false,"fails":["bank"]} ✓ |
| T-LO-16 | same, path 3.6° (PAPI four white) | gate result | {"ok":false,"fails":["path"]} | LO8; PAPI 2.5–3.5° (repo) | – | {"ok":false,"fails":["path"]} ✓ |
| T-LO-17 | da42ng 84 KIAS, flaps LDG, gear UP | gate result | {"ok":false,"fails":["cfg"]} | LO8, LO9 App 1 3.a | – | {"ok":false,"fails":["cfg"]} ✓ |
| T-LO-18 | c172s 78 KIAS with gust factor 10 kt vs none | pass with gust / without | true / false | LO5 p9-20 (½ gust), LO4 | – | true / false ✓ |
| T-LO-19 | gate height: vfr_circuit / vmc_straight_in / imc | ft | 300 / 500 / 1000 | LO4 p9-6, LO8, LO9, LO18 | – | 300 / 500 / 1000 ✓ |
| T-LO-20 | AirfieldLab trainer Vref 88 / Vapp 95, 500 ft on GS/LOC, IAS 107 and 85 KIAS | current g500 / proposed gate (both speeds) | true,true / false,false | src/20-flight.js 485–493; LO4 p9-6; LO36 | ปัจจุบัน true,true (ช่อง Vref−5…+20 = 83–108) | true,true / false,false ✓ |
| T-LO-21 | items: c172s gear/carb, pa28 carb, da42 gear/prop/feather, c152 glide | present? | false,false,true,true,false,true,true | LO0 (features from LO19–LO33, LT2) | – | false,false,true,true,false,true,true ✓ |
| T-LO-22 | c172s: before-landing items at abeam, landing clearance at base turn | late / missing | {"missing":[],"late":["landing_clearance"]} | LO17 p15, LO18 (checklist on downwind) | – | {"missing":[],"late":["landing_clearance"]} ✓ |
| T-LO-23 | synthetic circuit trace (7 samples) | phases | parked,taxi,takeoff,after_takeoff,before_landing,final,after_landing | LO0 | – | parked,taxi,takeoff,after_takeoff,before_landing,final,after_landing ✓ |
| T-LO-24 | VTBD 21L c172s, no wind (lift-off → aim) | circuit time (min) | 5.73 ± 0.01 | LO0 | – | 5.73 ✓ |
| T-LO-25 | c152 downwind (21L, east) vs runway 21R centreline | lateral distance (m) = D + runway spacing | 1536 ± 2 | LO13; repo geometry | – | 1536 ✓ |
| T-LO-26 | twins: base speed ≥ VYSE (AFH: not below VYSE until landing assured) | types violating | [] | LO7 p13-20 | – | [] ✓ |
| T-LO-27 | 19 types × 4 runways: abeam → base → final turn → roll-out → aim | non-monotonic profiles | [] | LO3 p8-3 (descend from abeam), LO0 | – | [] ✓ |
| T-LO-28 | c172s Vapp 65, gust factor 10 kt (add 5), IAS 62 | speed window (KIAS) / spd item | 65–80 / false | LO5 p9-20; LO36 PA.IV.B.S7 (+10/−5 with gust factor applied) | – | 65–80 / false ✓ |
| T-LO-29 | trainer_r2 (V downwind 140 / abeam 120 / base 110 KIAS), 21L, 1,000 ft | D (m) = max(clamp(2R+400), R_b+R_f+200) | 1931 ± 1 | LO3 p8-3; LO0 (est) | – | 1931 ✓ |
| T-LO-30 | items mixture_rich / runup_mag / prop_high: da40_180 vs da40ng | present? | true,true,true / false,false,false | LO0; features from LD1/LD6 (IO-360-M1A, MTV-12) and LD2 (AE300 FADEC) | – | true,true,true / false,false,false ✓ |
