# Airfield Lab — Don Mueang (VTBD)

Browser 3D airfield explorer and landing-training simulator for Bangkok Don Mueang International Airport.
Single page built from `src/` plus data files, three.js r186 loaded from jsDelivr. The owner (Thai) also
runs **Orbitlab**, a space-physics site; this project reuses Orbitlab's physics (US Standard Atmosphere 1976 port).

## Owner rules
- All user-facing UI text is Thai. Keep aviation terms (ILS, PAPI, RNP, TDZ, Vref) in English.
- Real-world facts must come from public sources and be cited in the UI or comments: AIP Thailand for the
  aerodrome, OpenStreetMap for layout (keep the "© OpenStreetMap contributors (ODbL)" credit in the footer).
- Military content: public sources only, generic depiction. No unit names, emblems or academy names.
- Estimated values (building and tower heights, parked aircraft) must be labelled as estimates.
- Licences (research round 5 §11, round 1 §12): the OSM-derived files in `data/` are ODbL and listed in
  `data/LICENSE-DATA.md`. A new data file gets a row there, and a new JSON file in `data/` `source` and `license`
  fields (top level, or in `_meta` where a parameter card keeps its metadata). Its credit joins the footer of both
  panes (explore and train) when its data arrives, not before; the PNG snapshot stamps `SHOT_CREDIT`
  (`src/85-shot.js`), the ODbL notice and the link to the data that a screenshot needs. Never commit a source from §11 table 11.3 (GlobalBuildingAtlas, FABDEM, TanDEM-X, IVAO sector
  files, X-Plane CIFP, BMA BDCTL_POLYGON), an AIP chart or PDF, or GPL/LGPL text or a JSBSim file.
  `test/licenses.test.mjs` fails on the names in `forbidden_sources` (any case, in `data/`, `src/`, `tools/`, `test/`),
  on .tif/.tiff/.jp2/.pdf files and on GPL/LGPL or JSBSim text. Review keeps out the rest: an AIP chart in another
  format, and the two table 11.3 rows that are not on the list (3D-GloBFP, licence not checked; MERIT DEM, only
  under its ODbL option). Only the owner adds a file or pattern to `gpl_guard_allowlist` in
  `test/fixtures/license_policy.json`.

## Commands
- Build: `node build.mjs` → `dist/index.html`, and copies `data/` (sub-folders included) into `dist/`.
  `node build.mjs --preview <PR number>` builds a pull request's preview page into `dist-preview/pr-<n>/` and prints
  the Artifact `files` map (see "Preview each pull request").
- Aircraft cards (plan C1): `node tools/aircraft/build_cards.mjs [--check | --only <id>]` writes the six light-aircraft
  cards `data/aircraft/<id>.json` from `docs/research/02-light-aircraft/params-light.json`; `--check` writes nothing and
  exits 1 naming each card that differs (`test/cards.test.mjs` runs it). Never edit those six by hand: a change to
  `params-light.json`, to a reference row of a round 1 or round 2 topic file (it gives each `_meta.sources` entry its
  text and link), to round 2's `lm_lib.mjs`, `lm_card.mjs` or `lm_inertia.mjs` (type resolution, gear, inertia), to the
  generator, or to physics that moves the CL/Cm lines (the stall-warning solve flies the sim) regenerates them in the
  same PR, also when the PR is research-only (see Research CI). It never writes `trainer.json` and the cards do not
  depend on it, but it reads it through `test/harness.mjs`, so a broken trainer card stops it too (`tools/README.md`).
  Since plan C4 it also writes the seven airliner cards (`a320ceo`, `b737_800`, `a320neo`, `a330_300`, `a321neo`,
  `atr72_600`, `a321ceo`) through `tools/aircraft/build_airliners.mjs` from round 3's
  `docs/research/03-airliners/params-<type>.json` (read only, never edited; every fix is made in the generator);
  `--check` and `--only` cover all thirteen. The same rule holds: never edit them by hand, and a change to a round 3
  params file, a round 3 reference row or the generator regenerates them in the same PR.
- Run: `python3 -m http.server 8080 -d dist`, open http://localhost:8080 (needs HTTP: the page fetches its data).
- Tests (Node ≥ 22, no dependencies, `node:test` + `node:assert/strict`): `node --test "test/**/*.test.mjs"`
  (quote the glob: a bare `node --test` would also run `test/shots.mjs`, `test/harness.mjs`, `test/lib/*.mjs` and
  the research scripts under `docs/research/` whose names match Node's default test patterns).
  `geo` (AIP geometry), `flight` (start trim, parked, autoland per wind), `runways` (autoland on all four ends),
  `assist` (robot pilot in ASSIST and DIRECT), `stall` (CLmax and Vs, research T-A-01; stall-warning margin T-A-07:
  static trimmed margin 7 ± 1 kt at five flap settings from the Evaluator's `aWarnAt(flaps)`, 1 kt/s deceleration with
  the Evaluator flag ≥ 5 kt above the stall, both corrected to 1 g, and on through the stall; the flag by α at 70 and
  120 kt, its release (hysteresis, minimum on-time, off on the ground); seed 5: no warning on the four calm autolands
  and, as a regression guard only, none above 50 ft in the gusty crosswind; the HUD and horn wiring in
  `src/90-app.js`), `modes` (trim, linearise and MIL-F-8785C Level 1 modes with regression bands, research
  T-V-01…T-V-06), `keys` (keyboard map and key handling,
  research T-I-07 and T-I-08, and that `src/90-app.js` applies its decisions), `papi` (PAPI distance from MEHT, colour
  bands at the eye, ILS at the antenna, LOC/GS dots, research round 3 topic 3.5), `controls` (`air.nz`/`air.ny`,
  research T-C-01: trimmed 95 kt glide nz 1.00 ± 0.02, parked nz 1, level turn nz ≈ 1/cos φ at 30° and 45°,
  elevator pull-up Δnz 1.00 ± 0.15 as in T-C-06, a rudder step whose sideslip gives ny < 0, and nz/ny against finite
  differences of the velocity), `numerics` (fixed-step accumulator and render interpolation, research T-N-07…T-N-09:
  ideal float ms timestamps k·1000/f (as research s9_advance.mjs) give exactly 2 steps per frame at 120 Hz and 4 at
  60 Hz; browser rAF times rounded to 0.1 ms keep a 3/4/5 mix at 60 Hz (1/2/3 at 120 Hz) that `renderPose` hides,
  with sim time still equal to real time; `advance(30)` adds 0.1 s in 24 steps, a larger backlog is cut to one step
  (acc = dt), `advance(0)` none; `renderPose` at 144 Hz moves V/f per frame within 5 mm RMS (also with 0.1 ms
  timestamps, 2.5 mm), attitude within 0.005°; a new Flight draws its start state, `ac.setParked`/`setApproach` on a
  live one draws the new state at once, a crashed one draws still; `qNlerp` and `Recorder.at` attitudes; as a
  regression guard only (it held before A7 too), the gusty-crosswind autoland on 21R lands identically at 60 Hz,
  144 Hz and jittery frames; the auto-pause, pause-message, tap-to-resume (CSS included) and pose and camera wiring in
  `src/90-app.js`), `weather`
  (humid air and QNH, research round 4 ATM-1…ATM-10 and the 12 monthly DERIVED rows of 04-weather.md §2.2; ATM-8 at
  elevation 0 as the research computed it; `atmosphere()` with QNH and dew point, old 2-argument calls bit-identical;
  Flight defaults, dry-ISA option, `qnh: null` = 1013.25 hPa, dew point read at the field, Td > T capped at saturation
  in `airDensity`/`relHumidity` as in `atmosphere()`; `WX_DEFAULT` recomputed from the METAR statistics; the briefing,
  training-flight and demo-flight wiring; then the wind, plan A9: WND-4…WND-10 of 04-weather.md §10.2 and round 1
  T-W-08 (log law, the old 1/7 rule, town against field, the gust-factor table, `Wind.lowAlt` σ and L, turbulence in
  calm air with W20 15 kt and the height unit `update` passes to `lowAlt`), `z0` null = default and out of range throws,
  that a Flight flies the log law, the scenario W20 values, `W20: null` = the scenario's, the legacy `turb` rule and
  `Wind.turb`, the card wording and the windsock wiring), `trim` (plan B2: research T-S-04 at 5,500 and 9,000 m with a
  regression band, a Flight's start in each wind scenario (heading on the runway's branch), T-S-06's round trip
  through `newtonSolve`, trim across the envelope (flaps 0/0.5/1, 78–220 kt, γ −6°…+6°, level in ground effect; the
  state's path angle and TAS), the throttle limits, no trim below the stall, roots that are not trims (past CLmax, on
  the wheels with δe beyond its stop), a test-only asymmetric thrust for the lateral solve and the throttle limits
  checked again after it, the gust state set aside, and `newtonSolve` stopping without NaN on a singular Jacobian or
  no descent), `aircraft` (plan B3, research round 1 task list item 8: T-S-07 `table1`/`table2` clamped at the ends,
  bit for bit as `s12_table_expected.mjs`; T-S-12 every `data/aircraft/*.json`: leaves `{v, u, scope, src, conf, est,
  note}`, ค่าประมาณ in the note of every estimate, each `src` code listed in `_meta.sources` with a link that exists,
  `_meta.source` and `license`; `acFromCard` against `AC`, `{kg}` mass, inertia × m/ref_mass, travel, unit engine axes,
  speeds not rounded (kt CAS as written; kt IAS without `speeds.ias_cas` throws there), errors that name the path
  (also in `error.path`); `setAircraft` keeps the
  object, drops stale fields, rebuilds `Iinv`, leaves `AC` as it was on a bad card, and a Flight after it flies the
  new mass; T-S-10 `Aircraft.step` ≤ 20 µs at 240 Hz (it runs first,
  before the tests that change `AC`); T-F-15 engine-out yaw moment and Vmc through `engineLoads` (05-turbofan.md §5.8);
  `AC.engines` in `Aircraft.deriv` (a thrust line 0.5 m below the CG pitches by T·0.5/Iyy, nothing else moves); the
  page loads the card and calls `setAircraft` before any Flight, and a bad card's Thai message names only the path;
  `loadData` of `src/48-data.js` with a stub fetch: progress stops at the first failed file, whose Thai error names it),
  `cards` (plan C1, the six light-aircraft cards and the selector: the generator's `--check`, the file set and
  `AIRCRAFT_TYPES` in the OD-TYPES order; the reader: kt IAS → kt CAS on the landing detent's row of `speeds.ias_cas`
  (both table forms, held at the row's ends, errors with `error.path`), derivatives per configuration; `acFromCard`
  against round 2's `buildAC(prepare(id))` on its 51 fields (speeds within 0.5 kt, as `buildAC` rounds); the exact leaf
  set of a card, no LB19 or FlightGear, LM8 only on the DA40 inertia, the licence traps; per type the stall warning
  7 ± 0.25 kt above the 1-g stall at every detent and below α_CLmax − 2°, and the trim at Vapp 5,500 m out; T-LS-03,
  T-LS-11 (ก)(ข)(ค), T-LM-13; `typeInfo` and `modelSpec` of `src/22-types.js` (the Thai card, lede and notes of each
  type, the model fit); `loadCards` with a stub fetch (Thai errors, never rejects); the owner's rule that no military
  user is named, not even generically (cards, `22-types.js`, the selector lines of `90-app.js`); the page wiring by
  regex), `r3cards` (plan C4, research R3-1, R3-C5, R3-C6, R3-2, R3-39; about 7 s: the seven airliner cards in the
  generator's order; T-B-25 (lb → kg), T-B-22 (%MAC of a balance arm, OD-LEMAC on the 737), OD-LEMAC on both A321s
  (FAA TCDS A28NM, low confidence); T-B-14, T-L-24, T-H-17 (inertia at the research's masses); OD-RATINGS (default
  mass and rating, the choices, Vref/Vapp/VS0 from the mass tables, T0 and P scaled by the F00 ratio, CFM56-7B flat
  rating 30 °C); `AC.K_CL_offset` (0.15 by default, 0 on the ATR and the 737); T-R-23, T-L-26, T-H-08 (CLmax of the
  legacy sets); T-R-24/25 (ATR trim); T-J-19 (thrust lapse); every airliner trims at Vapp and flies 20 s; the A330
  lateral derivatives in body axes; the known gap `AIRLINER_AUTOLAND`: the trainer's Autopilot on every airliner, seed 5,
  calm on all four ends and 03L `head`, 03L `xr`, 21R `xl`, crash flag and events exact, score ± 7, point ± 4 / 8 m, and
  each type's Thai Autopilot note following that table; T-H-21; T-K-27; `r3_merge.mjs --dry --coverage` gaps all in the card's `_na` or
  `_deferred`; `_na` in `acFromCard`; the รุ่นทดลอง and ค่าประมาณ labels and that explore stays on the trainer),
  `types` (plan C1 and C2, the per-type regression lock; about 23 s: research round 2 tests flown through the cards at the
  research's masses and tolerances (plan C3 adds the KIAS rows T-LC-03, T-LC-05, T-LE-04 and T-LF-07, which left
  `DEFERRED`). C1: C172S T-LC-04, 06–08, 12–14, 20–24, 31, C172R T-LE-05–07, 11–13, 19–23, DA40
  T-LD-27, 28, 31, with four known gaps held by regression bands and the research value in `t.diagnostic`: T-LE-09 Vx
  57.4 ± 1.5 KCAS (research 62 ± 3, its 60 was the first point of its 2-kt sweep, not a maximum; the test checks that the
  largest γ of its 1-kt sweep is not an end point; task item 20), T-LD-29 50 ft 507.2 m ± 3 % (research 450 ± 45), T-LD-30
  vmax 114.2 ± 1 KTAS (142 ± 3), T-LD-32 50 ft 574.4 m ± 3 % (640 ± 64; the research flew the trainer's thrust line), the
  last three task item 13. C2: the trainer through lm_card, T-LM-02…07 (V_SR 71.9/79.6 KEAS, Vy 128 kt, ROC 3,225 fpm,
  L/D 16.5/21.7, approach modes, takeoff 590 m and landing 714 m, round 1's numbers on today's sim); T-LM-31 (the leaf
  `lateral_mode_tolerance`, its class ranges applied to R / sim on the P2006T's flight-test Dutch roll, and the spiral
  rule T2 ≥ 12 s on every card); the C152 at 757.5 kg, T-LF-01…06, 08, 10–12, 14, 18, 20, 21, 26–28 (research item 11's
  list), and the P2006T at 1,180/1,230 kg and its training mass, T-LG-01…12, 14–17, 19, both through a card made in memory
  by `test/lib/rcard.mjs` (the way `build_cards.mjs` makes the six, nothing written, the page does not offer them); the
  DA42 NG and TAE 125, T-LT-01…05, 07–09, 11–16, which the plan's list leaves out but "every card" asks for. Stall rows
  use the project's definition (R2-04, plan B5), C1's too (T-LC-06–08, T-LE-05–07, T-LD-27, 31): the sim's V_SR at 1 g
  against the POH's VS (KCAS) / √0.95 at the research tolerance (DA40 flaps UP ± 5, OD-DA40-CLMAX), the research's Vmin in
  `t.diagnostic`. Then the stall-recovery robot pilot
  (`test/lib/stall_recovery.mjs`, a test pilot, not a page feature, research task item 23): entry as `lm_card.stallTest`
  (1 kt/s, idle, 3,000 ft, flaps UP), at the break (CL 1 % under its peak) α down until the stall warning stops (α_warn −
  `aWarnHyst`), full power, wings level, height lost to zero sink rate. T-LD-41 (da40ng, da40_180, da40d), T-LT-33
  (da42ng), T-LP-62…65 (pc9m, pc7mk2, t6a, t6c at MTOW), T-LG-26 (p2006t 1,180 kg) are all known gaps: the sim loses
  47–131 ft against the research's class values 180–470 ft (h = c·VS1²), pinned ± 3 %; plans F6 and G4 re-baseline them.
  The robot recovers when CL is 1 % under its peak (α 2.7–2.9° under `AC.aStall`, stall blend fraction about 0.11), so the
  pins cover the lift peak and the first part of the break only: the post-stall drag and pitch terms are not exercised and
  nothing pins them. The test asserts that each entry reached the peak (α and CL against `simCLmax`) and the break.
  Then `LOCK`: every card at its training mass pinned (V_SR per detent, Vy/ROC/Vx, best glide, takeoff, trim and the
  linear modes at cruise and approach, recovery; 1.5 % bands, floor 0.02° on the trim α and 0.002 elsewhere), `AUTOLAND` (score and touchdown of the four calm
  landings and of `xl` on 21R, with the stall-horn height: ± 7 points and 4 m, ± 5 points, 8 m and 20 ft) and `DEFERRED`
  (the ids of C2's list that nothing asserts, and the unreachable ids of the same topics, each with the reason and the
  research item or plan item that enables it; the last test checks the list against the test titles).
  `TYPES_LOCK_PRINT=1 node --test test/types.test.mjs` prints the numbers of `LOCK`, `AUTOLAND` and the recovery pins as
  the current model gives them, for a physics PR that moves them on purpose; then the six-type autoland smoke test of
  "Verified"), `input` (shaping, key ramps, the
  sub-frame key latch, the standard gamepad and source arbitration, research T-I-01…T-I-06, T-I-09…T-I-12 and T-C-14,
  phone tilt geometry and `TiltStick`, and that `src/90-app.js` reads the gamepad and the tilt through it), `aip` (`RWY_DATA`, the derived
  geometry and the AIP facts in the Thai UI text against `test/fixtures/aip_vtbd_current.json`, research round 5
  T-A01…T-A19, T-A21, T-A22, T-A24, T-A25), `licenses` (footer credits and links, the cited AIRAC cycle, forbidden
  sources and file types, `source`/`license` of data files, `data/LICENSE-DATA.md`, README and the MIT `LICENSE`, and
  no GPL/LGPL text or JSBSim model outside the owner's allowlist: research round 5 §11 T-K01…T-K05 and §12 P3-9, round 1
  §12 T-S-11, policy in `test/fixtures/license_policy.json`), `oracle` (our model against JSBSim 1.3.3 flying the same
  elevator, aileron and rudder doublets from the trimmed approach with a model built from our own `AC` numbers,
  research round 1 §12.8 T-S-01…T-S-03 and T-S-05, fixture `test/fixtures/jsbsim_trainer_doublet.json`),
  `kias` (plan C3; the research rows T-LC-03, T-LC-05, T-LE-04 and T-LF-07 are in `types`: `iasToCas`/`casToIas` monotone,
  inverse of each other, equal to the table at its points, flap mixing and clamping; `AC.kias` hidden from keys and
  JSON; the reader's row checks; `anchorStallRows` and the stall pairs the cards hold; the Evaluator's gates, touchdown
  speed and speed score in KIAS on three types, and the trainer's values unchanged to the bit), `speeds` (plan C5, research R3-3; the
  pure `SPD` functions and the `Approach` of a flight: T-B-01…T-B-03, T-B-24, T-K-01…T-K-06, T-R-05, T-R-06, T-R-21, T-R-29,
  T-L-04…T-L-06, T-H-01…T-H-04, OD-737-VREF, OD-WIND-ADDITIVE both caps, OD-A321NEO-CLMAX; the trainer and the six light
  cards on `kind: 'fixed'`, to the bit; a 737, an ATR and an Airbus flight; the Autopilot, PilotLaws and Evaluator reading
  the flight's `appr`; the HUD and page wiring is in `cards`), `airliner` (plan C6, research R3-4; under 1 s: every
  airliner card trimmed in the landing configuration on a 3° path (wings level, no wind, 300 m, the research's speed as
  EAS, flaps through the card's `aero.legacy.flapMap`) by `Aircraft.trim` (the page's trim, which reports `ok`, `why`
  and `limited`), with `test/lib/fstd.mjs` `trim()` solved beside it and held to the same root (1e-6); the conditions
  and centres read from each research `params-<type>.json`'s `validation.trim_targets`. Passing: T-R-12 (ATR θ −1.59°, α 1.41°),
  T-R-10/11 through the thrust behind the torque (15.03 kN against the research model's 15.04 kN, 0.233 of itself per
  degree; the torque reading waits for plan K4, the model has no shaft or propeller), T-B-08…10 (737 θ 2.27/1.18°, α
  5.27°, 36.9 kN = 15.8 % of the static thrust), T-L-07…09 at the research's own expectations (A320ceo θ 1.24°,
  CONF 3 3.16°, A321ceo 1.24°), T-L-10 on the card's table (137.0 kt), T-L-11 (VS1g 95.6 kt), T-H-05 α, θ and the trimmed state's sink rate. `UNREAD`
  names the readings the model lacks (T-R-10/11's torque, plan K4, whose own test list holds neither id yet: it must gain
  them) and closes itself: the ATR test fails once `AC`, an `Aircraft` or its air data has a field starting `tq`, `torque`,
  `np` or `rpm`. CG: the research's rows are at 30 % (T-L-07), 22 % (T-L-11) and 25–28 % (T-H-05); the cards stand for 25 %
  with no CG term; plan O4 (R3-48) adds a CG choice for the A330, none names one for the A320 family yet.
  Known gaps (`GAPS`, research value in `t.diagnostic`, cause and plan item, value pinned): OD-A320-PITCH's 2.5° ± 1.0°
  (ค่าประมาณ) on T-L-07, 08 (4.25°) and 09: the legacy A320-family sets are fitted to D-AIRE's 1.5°, K1; T-L-10 on the
  sim's lift curve 141.0 kt (one flap position per detent cannot give CONF 3 both its lift increment and its CLmax),
  K1; T-H-05 thrust 99.7 kN against 133 ± 15 (legacy polar L/D 9.3 against 7.99), K1. `LOCK`: every card at every
  `mass_options` mass at the `Approach` speed of plan C5 (α, θ, δe, throttle, thrust; 1.5 %, floor 0.02° on angles and
  0.002 on the throttle), each a trim inside its limits with α ≥ 5° under the warning angle.
  `AIRLINER_LOCK_PRINT=1 node --test test/airliner.test.mjs` prints `LOCK` and the gap pins), `page` (parses the
  assembled page module and checks the element ids the scripts use; a build holds index.html and every data file the page fetches, in
  types and sizes the artifact host serves; the preview page only adds its title and badge; the `--preview` command
  line), `shots` (no machine paths under `test/`; the pinned three.js matches the import map and covers every file the
  page imports; both three.js cache folders sit inside the CI cache; the harness fails fast on an unpinned file,
  fetches through the proxy and seeds each flight), `visibility` (MOR helpers in `10-atmo.js`, research VIS-1…VIS-3,
  the haze mixed before the sRGB encode as one exact block, `SkySystem.applySunHaze` run on a stub sky, the dome's
  shader text, and that the sky, the fog, the lights, the sunlight and the visibility choices use them), `siting`
  (the Annex 14 and AIP numbers in `17-siting.js`, surface heights worked by hand, the approach light lanes,
  `SiteIndex`; then the trees and generated buildings of the real data in both quality settings, every one tried
  again with separate geometry code and against the page's own counts: the trees that stay are the same trees as
  before the rules, drawn from the random stream as the page leaves it after the footprint colours; the kept
  buildings that a road cuts in two are pinned, one in the balanced quality and one more in the high one, and the
  map mirrored east-west or north-south gives every building the same answer; about 17 s),
  `lights` (`airfieldLights` in `60-lights.js`: every runway and approach light read back by its place and by the
  colour a pilot sees from the approach, from the runway and from beyond the end; the brightness of each system
  (regression pins) and the slots `LightSet.build` fills for the shader, on a stand-in for three.js; the whole layout
  run on the real taxiways, roads and street-light records, with PAPI, beacon and obstruction lights and a pinned
  table of every steady light; every taxiway edge light tried with separate geometry code, every place without one
  held to a cause, every free corner of a junction lit, no bare edge dark over 54 m, and the same places with every
  line drawn the other way round; the stands of
  `alsStands` against the real pavements; every flash seen at 20, 30 and 60 frames a second).
  Autoland score floors sit at or just under the values measured on 2026-11-19 and re-measured for A8 on
  2026-11-23 and for A9 and B2 on 2026-11-25 (the assist robot's floor is a loose 50); touchdown points and every mode
  value have regression bands.
  A physics change that moves them updates the test in the same PR.
  `test/lib/fstd.mjs` holds `f9`, `trim`, `linearise`, `eig4`, `modes` (research round 1 §10.5).
  `test/lib/rcard.mjs` `researchCard(id)` makes a simulator card in memory for a round 2 type with no file in
  `data/aircraft/` (C152, P2006T, the turboprops, DA40 NG) and `test/lib/stall_recovery.mjs` `stallRecovery(M, opts)` is
  the stall-recovery robot pilot (plan C2); both are for tests only.
  The oracle flies from the state, `AC` numbers and field elevation recorded in its fixture, so tuning `AC` (the
  card) or retrimming `setApproach` does not touch it; a change to the terms of `Aircraft.deriv`, a new or renamed
  numeric `AC` field, or `AC.engines` other than one engine along body +x through the CG (the oracle checks it), needs
  the same change in `tools/jsbsim/make_model.py` and a fixture regenerated from a committed tree
  (`python tools/jsbsim/run_cases.py`, offline, Python ≥ 3.10, `pip install jsbsim==1.3.3`; `tools/jsbsim/README.md`).
  `step` and `atmosphere` are not mirrored: JSBSim flies its own US 1976 atmosphere, so an atmosphere change that
  moves the density at 230–310 m (humid air) must leave the oracle on the dry ISA. It does not cover ground effect,
  the stall blend or the gear. T-S-03 mostly checks
  the α̇ estimate in `updateAir`, which `make_model.py` does not mirror, so a change to that estimate alone (research
  task item 17) needs no new fixture. A self-convergence test (240 Hz against 960 Hz) checks that `step` stays RK4.
  When `AC` moved to `data/aircraft/` (plan B3, research task item 8), it ran with `ORACLE_AC_FROZEN=1` before and
  after and passed both times; run it that way again after a change to the card or to `acFromCard` that should keep
  the numbers. Plan C4 added `AC.K_CL_offset` (mirrored in `make_model.py`) and regenerated the fixture from the
  commit that added it; the new fixture also holds the stall-warning fields, which `ORACLE_AC_FROZEN` now compares,
  and its rows start from today's retrimmed approach (`tools/jsbsim/README.md`). Its JavaScript side is
  `test/lib/oracle.mjs`; its `withParams` builds `Iinv` with the page's `inertiaInverse`.
  `test/harness.mjs` evaluates `10-atmo.js + 15-geo.js + 18-keys.js + 20-flight.js + 25-input.js` with
  `new Function` in strict mode, reads `data/aircraft/trainer.json` from disk (`AIRCRAFT_CARD`) and calls
  `setAircraft` with it before any test runs, `test/keys.test.mjs` evaluates `18-keys.js`, `test/siting.test.mjs` `17-siting.js`,
  `test/licenses.test.mjs` `85-shot.js` and `test/cards.test.mjs` `22-types.js` the same way, so those eight files must
  stay DOM-free. The siting and lights tests also evaluate `48-data.js` and `60-lights.js`:
  these two may use three.js and the DOM inside their functions, never at the top level. `test/lib/png.mjs` reads the
  land-use PNGs (8-bit greyscale) with `node:zlib`. `build.mjs` exports `assemble()`, `build()`, `dataFiles()`,
  `checkPr()` and `previewHtml()` for the page test. `M` from `test/harness.mjs` also includes `Evaluator`, `aWarnAt`,
  `Recorder`, `qNlerp`, `WX_DEFAULT`, `Wind`, `logLaw`, `WIND_PROFILE`, `W20_PER_KT_LEGACY`, `windW20`,
  `GUST_FACTOR_3S`, `newtonSolve`, `qMul`, `setAircraft`, `acFromCard`, `table1`, `table2`, `inertiaInverse`,
  `engineLoads`, `iasToCas`, `casToIas`, `speedsKias`, `toSI`, `UNIT_SI`, `pctMAC`, `armAtPctMAC`, `thrustAvail`,
  `stallBlend` and the humid-air functions of `10-atmo.js`.
  Since plan B3 `AC` is empty until `setAircraft` runs, so a script that evaluates `src/*.js` itself with
  `new Function` instead of importing `test/harness.mjs` (several in `docs/research/01-flight-physics/scripts/`, e.g.
  `e4_autoland.mjs`) stops in `Aircraft.deriv` on `AC.engines`: have it return `setAircraft` too and call
  `setAircraft(JSON.parse(fs.readFileSync('data/aircraft/trainer.json', 'utf8')))` after evaluating, or run it on the
  commit it cites (`git archive`). The research scripts themselves stay as they are.
- Screenshots: `node test/shots.mjs <set> [--dist <built page>] [--out <dir>] [--pin <three-pin.mjs>]` (Playwright +
  Chrome, SwiftShader; sets `ci`, `explore`, `train`, `layout`, `phone`, `final`, `vtbd`, `vis`, `all`). It builds the
  working tree into `.cache/shots-dist` unless `--dist` is given, writes PNGs to `shots/`, and serves three.js from
  `.cache/three-<version>` (downloaded once by `test/lib/three-pin.mjs`, through `HTTPS_PROXY` when set, and checked
  against pinned SHA-256s; `--pin` adds another build's pin). Math.random is seeded and starts again at each flight
  the harness starts, so training flights draw the same turbulence seed in every run and in both builds; the demo
  flight in explore, cloud drift and flashing lights follow the time since load and differ between runs. Playwright is
  not a repo dependency: it is found in `node_modules/` or on `NODE_PATH`; `SHOTS_CHROME=chrome` uses the installed
  Google Chrome. It exits 1 if the page does not load, throws, logs an error, misses a file or asks for an unpinned
  three.js file. `.github/workflows/shots.yml` runs the `ci` set (5 images, about 3 min) on the PR and on its base
  (with the base's pin) for pull requests that touch `src/`, `data/` or the harness, and keeps them as the Actions
  artifact `shots-pr-<n>` (`before/`, `after/`); a push to main that changes the pin refreshes the three.js cache for
  all PRs. SwiftShader draws on the CPU: compare the images by eye, never time them.

## Source layout (concatenated in this order into the `/*__APP__*/` marker of `src/template.html`)
| file | role |
|---|---|
| 00-head.js | three.js imports (OrbitControls, BufferGeometryUtils) |
| 10-atmo.js | pure: constants (KT, FT, NM, DEG, RAD, G0), USSA-1976 `atmosphere(h, isaDev, qnh, dewC, hDew)`, humid air (`satVap`, `relHumidity`, `dewPoint`, `fieldPressure`, `airDensity`, `densityAltitudeFt(ρ)`, `pressureAltitudeFt`; old rule `densityAltitudeDryFt`), NOAA sun position, sky radiance, MOR visibility (`morBeta`, `hazeDepth`, `hazeDepthUp`, `skyHazeBeta`, `sunHazeT`) |
| 15-geo.js | pure: ARP, local projection `llToNE`/`neToLL`, `RWY_DATA` from AIP, derived `RUNWAYS` and `RWY_END[id]` |
| 17-siting.js | pure: where something tall may stand: obstacle limitation surfaces `olsHeight(e, n)`, approach light lanes `alsLaneOf`, `ALS` (length and spacing per system), `RWY_PAD`, `TWY_W`, `SiteIndex` (clearances from buildings, decks, aprons, taxiways, water; the land-use class under a point), `STATIONS` and `stationSites(af)`, `mappedSite`, `placeTrees`, `siteBuildings` (`buildingProblem`, `groundShare`); also `rwyST`, `rwyEN`, `onAnyRunway`, `pointInPoly`, `nearestOnLine`, `lineLength`, `pointAlong` |
| 18-keys.js | pure: `DEFAULT_KEYMAP` (physical key codes), `TOGGLE_ACTIONS`, `resolveKey`, `keymapProblems`, `isToggleEdge`, `KeyState` (held keys + keydown/keyup decisions + `frame()` with sub-frame taps; `app.keys`) |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC` (empty until `setAircraft(card, opts)` fills it from an aircraft card; `acFromCard`, `inertiaInverse`; `AC.K_CL_offset` of the drag polar), `table1`/`table2` (clamped tables), `toSI`/`UNIT_SI` (card units), `pctMAC`/`armAtPctMAC`, `engineLoads`, `SPD` (Vref, VLS, VS1g, V2min, VAPP by mass, configuration and wind; `AC.spd`) and `Approach` (the speeds one flight flies), `Aircraft` (6-DOF), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
| 22-types.js | pure: `AIRCRAFT_TYPES` (selector order), `AIRLINER_TYPES` (plan C4, behind รุ่นทดลอง), `typeInfo` (Thai card, lede, notes from the card's `thai_fleet`; `airlinerInfo` for the airliners), `EXP_SWITCH`/`EXP_NOTES`, `massOptions`/`ratingOptions`/`ratingName`, `modelSpec` (generic model fit) |
| 25-input.js | pure: `INPUT_CFG` (estimates from research §11), calibration and dead-zone helpers, `shapeAxis` / `shapeLever`, `keyRamp` + `KeyAxis`, `readPad` (W3C standard gamepad), `Arbiter` (last-moved source wins) + `InputAxis` (no jump on a switch), `TiltStick` (phone tilt), `PilotInput` (one frame from keys, pad, touch and tilt; `app.pin`) |
| 30-render.js | render frame `RW` (follows the active runway through `globalThis.__onRwy`), `W3(e,n,y)`, shared uniforms `SU`, shader patching `enhance()` (fog = MOR haze, `HAZE_GLSL`), `Batch` |
| 40-sky.js | sky dome, clouds, horizon fog palette, sun light and shadow box |
| 48-data.js | loads `vtbd_af.json`, `land_in.png`, `land_out.png`, `city.json` and the aircraft card `aircraft/trainer.json` (90-app.js hands it to `setAircraft`); progress stops at the first failed file, whose Thai error names it; `loadCards` (the other types' cards, beside `loadData`; never rejects, a failed card disables its entry; the airliner cards only once รุ่นทดลอง is on) |
| 50-airfield.js | land-use bake on the GPU + ground shader, runway marking shader (per runway), taxiways, aprons, hold lines, terminal, towers, navaids, approach light stands, windsocks, masts |
| 55-city.js | instanced city buildings (those that pass `siteBuildings`), OSM footprints, tollway / SRT viaduct / BTS (`VIADUCT` deck sizes) + stations from `stationSites`, trees from `placeTrees`, parked airliners |
| 60-lights.js | point-sprite lights with directional colour (`LightSet`); `airfieldLights(field, data)` is the whole lighting layout as data, `alsStands(E)` the approach light stands, `taxiEdgeLights(af)` the places of the taxiway edge lights, `buildAirfieldLights` draws the lights |
| 70-aircraft.js | trainer model, control-surface and gear animation; `fit(spec)` fits it to another type (raised to the card's wheels, flap angle, fixed gear, twin nacelles), `inCockpit` |
| 80-hud.js | conformal HUD, ILS/PAPI widget, debrief charts |
| 85-shot.js | pure: `SHOT_CREDIT` and `stampCredit(g, w, h)`, the credit drawn into the PNG snapshot (ODbL 4.3 and 4.6) |
| 90-app.js | UI, camera presets and hotspots (Thai), input, training flow, aircraft type selector (AC is switched only by `useType`; explore always flies the trainer), stall-warning horn (Web Audio), frame loop |

## Frames and units
- Physics: NED metres, origin at the ARP (13°54′51.74″N 100°36′20.49″E), d down, ground at d = 0. Body FRD,
  quaternion body→NED, SI units internally.
- Render: x = east, y = up, z = −north. Data JSON coordinates are `[e, n]` metres from the ARP.
- `RWY_END[id]`: `thr` [n,e], `u` landing direction, `r` right normal, `lda`, `aim` (GP origin = RDH / tan 3°),
  `papi` (estimated distance solved from the AIP MEHT in the drawn geometry: `PAPI_GEOM` light height 0.64 m,
  2°50′ unit 33 m outside the edge), `locDist`, `appr.kind` ILS or RNP (03R is RNP with a synthetic 3° path).
- Body points (FRD from the CG, estimates, card `airframe.geometry`): `AC.eye` (cockpit camera, PAPI colours) and
  `AC.gsAnt` (ILS receiver).
  ILS deviations and the autopilot use the antenna, PAPI uses the eye. LOC 1 dot = atan(105 m / locDist) / 2
  per runway (0.75° on 21R/03L, 0.89° on 21L), G/S 1 dot 0.36°. On the ILS the trainer sees the PAPI read low in
  the last ~0.7 km because DMK's MEHT is 3.3–5.1 m above the beam over the threshold (real, AIP-derived). The trainer's
  eye is 1.3 m above its antenna; the plan C1 cards put the antenna at the eye (no source gives its place), so their
  PAPI reads lower still.

## Flight model (current state)
- Generic two-seat turboprop trainer (fictional): m 2250 kg, S 16.3 m², b 10.2 m, P 700 kW, static thrust 11.5 kN.
  It is the default and the only aircraft of the explore mode. The training pane also offers (plan C1, research
  round 2 task item 10, owner decision OD-TYPES) the six light aircraft Thai civil schools fly: `c172s`, `c172r`,
  `da42ng`, `da42_tae125`, `da40d`, `da40_180` (no DA40 NG: no Thai civil school has one, T-LS-11). The selector
  (`#typeList`, `src/22-types.js`) shows each type's Vref and Vapp (KIAS, whole knots; plan C3) and its Thai civil schools, counts and
  bases from the card's `thai_fleet` (CAAT register of 9 Jul 2026 [LS1]), labels every real type สถานการณ์สมมติ
  (T-LS-11 (ค)) and saves the choice per viewer (`afl-type`). One global `AC`: `useType(id)` in 90-app.js is the only
  switch after start (`setAircraft` + `ac3.fit(modelSpec(...))`), `setMode` puts the trainer back for explore and the
  chosen type for training, and a type changes only in the setup pane, so a Flight only advances under its own type.
  The 3D model stays the trainer's, fitted (raised to the card's wheels, its landing flap angle, fixed gear, two
  nacelles on the DA42s) and hidden in the cockpit view of a real type; a Thai note says the picture is generic.
- Experimental airliners (plan C4, research round 3 R3-1, R3-C5, R3-C6, R3-2, R3-39; owner decisions OD-LEMAC,
  OD-SOURCES, OD-RATINGS): the training pane's Thai switch "รุ่นทดลอง" (`#chkExp`, saved per viewer as `afl-exp`, off
  by default) adds the seven airliner cards to the selector, each labelled รุ่นทดลอง and ค่าประมาณ (OD-SOURCES); the
  cards load lazily (`loadCards`) the first time it is on. Explore stays on the trainer. OD-RATINGS: a type starts at
  its card's default mass (`training_mass`: the research's `default_sim` MLW, the ATR its maximum MLW 22,350 kg) and
  default engine rating; the setup pane offers the card's `mass_options` and `turbofan.ratings_offered`
  (`setAircraft(card, { mass, rating })`; a rating scales T0 and P by the ratio of its F00 to the default's), with a
  Thai note that airlines do not publish the rating they fly; the CFM56-7B classes are flat rated to 30 °C. Reader
  (legacy mode on today's equations): `aero.legacy` and `propulsion.legacy`, the round 3 units through `toSI`, Vref/Vapp/
  VS0 from the mass tables (`{ axes: { mass_kg, flap? }, data }`, kt CAS, read with `table1` at the mass in the
  landing detent's column), `_na` honoured (a needed path marked `_na` throws, an optional one is skipped). The drag
  polar's offset is the card's `AC.K_CL_offset` (`K·φGE·(CL − K_CL_offset)²`; 0.15 when a card gives none, as before,
  so the trainer and the six light cards are bit-identical; the ATR and 737 legacy sets give 0). OD-LEMAC: the A321
  LEMAC is FAA TCDS A28NM's Sta 700.85 in (the research estimated the A320's LEMAC plus a 4.27 m plug, 19.53 m STA),
  the 737-800's BA 627.1 in; both low confidence. Each card carries the research's `_na` plus the generator's rules, and `_deferred` (paths waiting for a
  later plan); every `r3_merge.mjs --coverage` gap is in one of them (`test/r3cards.test.mjs`). The HUD of an airliner
  reads KCAS (no `speeds.ias_cas`), and so do the brief, the live gate row and the debrief's touchdown speed
  (`spdUnit` in `90-app.js`). Approach speeds (plan C5, below): the HUD, the Autopilot and the Evaluator use `Flight.appr`, no longer
  the fixed `AC.Vref`. Known limits: the Autopilot and the flare are tuned for the trainer. Measured on
  2026-11-27 and re-measured after plan C5 moved the wind rows of the ATR and the Airbus types, seed 5 (`AIRLINER_AUTOLAND` in `test/r3cards.test.mjs`; calm = 21R, 21L, 03L, 03R; winds = 03L `head`,
  03L `xr`, 21R `xl`): the 737-800 and the A321ceo hit too hard (crash) in calm air on all four ends and in every wind
  but the 737's `xl` (72); the A320neo crashes in `xl` (calm 35–56), the A321neo in all three winds (calm 35), the ATR
  in `xl` (calm 86, `head` 88, `xr` 76); the A330 stalls about 29 s after the start, 3.3 km before the threshold, in
  every run; only the A320ceo lands everywhere, at 135–165 m, short of the 300 m window (55–64). Plan C5 moved the 03L `head` rows
  of the ATR (wind factor: its 03L `head` 69 → 88, 414 → 244 m) and of the Airbus types (ground speed mini), and the 21R `xl` rows by
  at most about a point and a metre (a scenario's wind direction is a whole degree, which leaves ≈ 0.1 kt of headwind in a
  "crosswind"); calm and `xr` are as before. Each type's Thai note
  says so (`AP_CALM`, `AP_WIND`, the A330's: fly it by hand); phase M of the plan (AFCS M1, flare law per type M2,
  A/THR M5) tunes the Autopilot and moves the table again (plan C6 is the trim lock, `test/airliner.test.mjs`). Gear:
  `gear.legacy` is built once at the card's default mass (the research's strut k and c, or where it gives none k from
  the static deflection and c from ζ 0.6), and the struts
  do not follow a mass chosen in the setup pane (only the inertia does; a Thai note says so; research item 2 asks for
  it, deferred); the stroke where the research gives none (the Airbus nose and main struts, the ATR nose strut) is an
  estimate, static deflection / 0.3. The 3D model is the trainer's.
- Aircraft data (plan B3, research round 1 task list item 8, `12-other-sims.md` §12.14 task 3, `05-turbofan.md`
  task 1): the numbers live in fourteen cards in `data/aircraft/`, `trainer.json`, the six of plan C1 and the seven
  airliners of plan C4 (generated by `tools/aircraft/build_cards.mjs`, never edited by hand), one leaf `{v, u, scope, src, conf, est, note}` per value
  (`schema.md`, round 2 `schema-ext.md` paths; `_meta.sources` lists every `src` code with its link). `const AC = {}`
  until `setAircraft(card, opts)` fills it (`acFromCard(card, opts)` reads the card's direct paths; on every card it
  gives the same numbers as round 2's `lm_card.mjs` `buildAC` on its 51 fields, but unlike `buildAC` it takes speeds
  unrounded and needs `Ixz` (`buildAC` takes 0); `Iinv` from `inertiaInverse`). Reader rules of plan C1: a `kt CAS`
  speed is taken as written; a `kt IAS` speed (the POH figure; most of the six) goes to kt CAS through the landing
  detent's row (largest `flap_deg`) of `speeds.ias_cas` with `table1`, clamped at the row's ends, never extrapolated
  (keyed `{ <detent>: [[KIAS, KCAS], …] }` or lm_lib's `{ axes: { flap, KIAS }, data }`); any other unit throws. A
  derivative is a number or an object per configuration: the first numeric of [`opts.config`, approach, landing,
  cruise, clean], else the first numeric key (the page passes no `opts`; tests pass `{ config: 'cruise' }`). The UI
  rounds the speeds for display (`fmt`). `setAircraft` keeps the one `AC` object, overwrites
  its fields and adds new ones with `Object.defineProperty`: assigning many new keys or deleting one sends V8 to
  dictionary mode, about 40 % slower per step. The page calls it after `loadData` (a bad card stops the start with a
  Thai message that names only the card path, `error.path`; the English message goes to the console), the harness at
  load. `AC.engines` (`[{ pos, dir }]`, FRD, from `propulsion.layout`): `deriv` shares
  `thr·thrustAvail(V)` equally among them and adds each one's force and moment `pos × F` through `engineLoads`
  (sums start at −0, so the trainer's one engine along +x gives exactly T on x and no moment: bit for bit as before).
  `table1`/`table2` (clamped, T-S-07): `table1` converts kt IAS (plan C1) and reads the airliners' mass tables (plan C4); `table2` is not yet used by a card.
- Approach speeds (plan C5, research round 3 task item 3, R3-3): `SPD` and `Approach` in `src/20-flight.js`, with the
  generator's `speeds.approach_rule` on the seven airliner cards (`tools/aircraft/build_airliners.mjs`; `AL:C5`). The
  card's mass tables are read with `table1` (clamped, never extrapolated): `speeds.VREF_kt` now holds every column the
  research gives (the 737's flaps 30 and 40, the Airbus VLS of each CONF), `speeds.VS0_kt` every flap column,
  `speeds.VAPP_kt` the landing one. `AC.spd` (a property that is not enumerable, like `AC.kias`; `setAircraft` keeps it)
  is `{ kind, land, rule, ref, stall, app, vfe, gs }`; a card without a rule is `{ kind: 'fixed' }`: the trainer and the six
  light cards, whose `Approach` returns `AC.Vref` / `AC.Vapp` and adds `+ 0`, so their hashes did not move. Rules, in
  kt: **Boeing** (737-800; FCTM 2013) with the autothrottle on Vref + 5; off, Vref + max(5, ½ steady headwind + the whole
  gust), at most Vref + 20 (`OD-WIND-ADDITIVE`, the default) or + 15 (the option `windCap: 15`, labelled unconfirmed) and at
  most VFE − 5; the steady part is bled off between 61 and 15 m, the gust part is kept to touchdown (`keep`).
  `OD-737-VREF`: Vref = 1.23 VS1g (the card's table). **Airbus** VAPP = VLS + clamp(headwind / 3, 5, 15), VLS from the
  card's CG ≥ 25 % table (1.23 VS1g, an estimate, where a CONF has no column); the ground speed mini adds
  k·max(0, headwind now − headwind at the tower) while the autothrottle flies (k 1 on A320ceo and A321ceo, 0.33 on the neo
  types, and on the A330 from 1 to 0.33 over 25 s below 400 ft: a linear blend, an estimate; it reads the mean wind, so the
  Dryden gusts are not compensated by it, a simplification the research does not make: plan M5, the A/THR). **ATR** VAPP = max(VmHB30 +
  WF, VMCL), WF = min(15, max(headwind / 3, gust)), VmHB30 = VREF = max(1.23 VSR30, VMCL 98 kt): the table's rows, except
  between 16,000 and 18,000 kg where the definition is used (the floor ends at 17,124 kg). ICAO approach category from Vat (A < 91, B < 121, C < 141, D < 166, E < 211 kt);
  V2min = 1.13 VS1g. `OD-A321NEO-CLMAX`: CLmax FULL 3.05 (category C at MLW). The scenarios give no reported gust, so
  it is 0 (`Flight` option `gust`), and no scenario reaches the 15 kt cap: there is no switch for it on the page. The
  wind is the scenario's at the tower (a whole-degree direction, so 03L's 10 kt `head` is 9.99996 kt). The HUD prints
  `VLS` (Airbus) or `Vref` and the approach speed (`VAPP` on an Airbus, `Vapp` otherwise) under it, in the HUD, the brief and the type card; the brief, the FMA and the gate row use the same `Approach`;
  mass changes follow (`setAircraft` with a mass). The light cards have no mass option on the page, so their `fixed`
  speeds do not follow a mass.
- Airliner trims (plan C6, research round 3 task item 4, R3-4; `test/airliner.test.mjs`): every airliner trims in the
  landing configuration on a 3° path at every mass the page offers, inside its control limits, throttle 0.15–0.34, θ
  −0.28° (ATR) to 2.54° (A330). Against the research: the ATR, the 737 and the A330's attitude pass; the A320 family sits
  at 1.2–1.3° at the research's masses (0.4–1.3° across the offered masses; the research's 1.5 −1.0/+2.0 passes,
  owner decision OD-A320-PITCH's temporary 2.5° ± 1.0° does not: K1 retunes it); the A330's thrust is a quarter low (legacy polar, K1). The airliner cards' `_deferred` `validation.*`
  (only `validation.classification.hqClassCategory`, the MIL-F-8785C class) now points at plan N4.
- KIAS (plan C3, research round 2 task item 12, R2-12): the sim flies CAS (`air.ias` is EAS, equal to CAS to 0.1 % below
  3,000 ft and 200 kt); the HUD, the instrument strip, the brief, the debrief, the Recorder and the Evaluator use the
  KIAS a real indicator reads. `AC.kias` (a property that is not enumerable, so `Object.keys(AC)`, JSON and `{...AC}` are
  as before; `setAircraft` keeps it, null without a table) holds `{ Vref, Vapp, Vs0 (KIAS), rows: [{ f, kias[], kcas[] }] }`,
  one row per detent of the card's `speeds.ias_cas` at its flap position f (lift increment over the landing detent's,
  research `flapMap`); `iasToCas(T, f, kias)` and `casToIas(T, f, kcas)` read it (T = `AC.kias`): linear inside a row;
  between two rows the CAS of both mixed by f; outside a row's points an estimate (ค่าประมาณ): in proportion to the
  origin below the first point, a constant difference above the last. `Aircraft.kias()` is the KIAS now (at `this.flaps`),
  `speedsKias()` the card's Vref, Vapp, Vs0 in KIAS (`AC.kias` or, with no table, `AC` itself). The trainer has no table:
  KIAS = KCAS, bit for bit, and its hashes did not move. Decision on the Evaluator (the task said to decide): the gates
  (Vref −5/+20), the touchdown speed `td.ias` and the speed score (−8/+5 full marks) compare the KIAS of the HUD with the
  card's Vref in KIAS, the POH figure the HUD prints (the C172S's 61 KIAS, not its 63.9 KCAS): one scale for the pilot;
  the band widths are the same knots. The Autopilot and PilotLaws fly CAS against the flight's `Approach` (plan C5: for the trainer and the six light cards it is
  `AC.Vref` / `AC.Vapp`, bit for bit), and the stall horn and `'stall'` event keep their 40 kt CAS cut-off. The stall end of the table: the POH's
  Fig 5-1 starts at 40 or 50 KIAS, above the stall, so `tools/aircraft/build_cards.mjs` `anchorStallRows` makes the stall
  pair of `speeds.stall_table` (forward CG, 0° bank, [KIAS, KCAS]) the first point of a row when it is at or below the
  row's first KIAS, dropping the Fig 5-1 points it contradicts (C152 flaps 30: 35 KIAS = 43 KCAS, so T-LF-07 reads 35.4
  KIAS, was 40.3; C172R white arc 33 KIAS; the DA cards have no pair cells, unchanged). A leaf that gains a point has `est: true`
  (the line from the stall pair to the next Fig 5-1 point is an interpolation, not a POH figure). Known gap: the stall table's
  banked cells (45°, 60°) are a power-off calibration; the sim reads them 4 to 8 KIAS above the POH's (C172S 61 / 76
  against 57 / 68 KIAS), diagnostic in `test/types.test.mjs` T-LC-03. Reader rules added: every row of the table is
  checked (positive, KIAS strictly ascending, KCAS not descending) and must name a detent.
  The trainer-era constants in the code still apply to every type (plan C1 R4; per-type values are later work):
  `setParked` d −1.30 m, the wingtip strike at 15.5° bank, the flare at 4.5–9 m, the 300–600 m touchdown window, the
  debrief TDZ 350–600 m, the gates at 500/200 ft and the speed band Vref −5/+20 (in KIAS since plan C3).
- Linear stability derivatives in `AC`, stall by Beard–McLain blending (M = 55, α_stall 17°, −2.5° with flaps),
  ground effect, spring-damper gear with tanh tyre friction, RK4 at 240 Hz.
- Trim (plan B2, research round 1 task list item 11, `12-other-sims.md` §12.14 task 6): `Aircraft.trim({ h, n, e, tas,
  gammaA, chi })` runs `newtonSolve` (finite-difference Jacobian, partial pivoting, step halving; pure, also for a
  solver that builds a type from its performance, T-S-06) on u̇, ẇ, q̇ for α, δe, throttle, wings level, β 0, so
  everything in `deriv()` is in balance (residual ~1e-10; the old linear formula in `setApproach` left 0.027 m/s²).
  Throttle needed outside idle…1: held at the limit, γa solved instead (`limited`). Non-zero v̇, ṗ, ṙ (asymmetric
  thrust, plan F3) add μ (bank about the velocity), δa, δr at β 0; skipped when zero, so the symmetric trim stays
  exact, and the throttle limits are checked again after them. Mean wind only (gust state set aside). `ok` also needs
  the surfaces inside their limits, the wheels clear and dCL/dα > 0 (`why` names what failed): below the trimmed 1-g
  stall (about 79.6 kt clean, 75.5 kt flaps 0.5, 71.9 kt landing flaps) there is no trim, and Newton's other roots
  (past CLmax, or on the nose wheel in ground effect) are refused. `limited`, `gammaA` hold only when `ok`.
  `setApproach` keeps its crab and glide-path kinematics and calls it. `test/lib/fstd.mjs` keeps its own trim for the
  modes tests.
- Frame loop (research round 1 §9.4 and §9.7, T-N-07…T-N-09): `Flight.advance(realDt)` is a fixed-step accumulator
  (ε 1e-9 s, at most 24 steps per frame, backlog beyond one step dropped, returns the steps). The constructor and
  `tick()` keep the previous state (`xPrev`, `sPrev`; `Aircraft.setApproach`/`setParked` bump `ac.gen`, and
  `renderPose()` then restarts from the new state), and `Flight.renderPose()` lerps position and surfaces and nlerps
  attitude at α = acc/dt; the aircraft and cameras draw it (at most 1/240 s behind), the HUD reads the latest state. `qNlerp` is shared with `Recorder.at`. The other
  tests step with `tick()`; only `numerics` goes through `advance`.
- Stall warning by α (`AC.aWarn` 10.71°, `aWarnFlap` −3.84°/flap, so 6.87° with landing flaps; estimates from research
  T-A-07): about 7 kt above the stall, 14 CFR 23.207. The generator solves each light aircraft's angles the same way on
  the sim's blended lift curve (trimmed, 1-g EAS at the training mass, 7.00 kt above the 1-g stall at flaps 0 and 1,
  6.99–7.02 kt at every detent): c172s 10.50°/−0.92 (9.58° landing), c172r 10.48°/−0.92 (9.56°), da42ng 9.16°/−3.22
  (5.94°), da42_tae125 9.59°/−3.21 (6.38°), da40d 10.02°/−7.18 (2.84°), da40_180 10.17°/−7.75 (2.42°). `Evaluator.stallHorn` comes on at once, goes off 0.5° below after
  at least 0.5 s, and is off on the ground; it drives the horn and the HUD STALL word.
- Load factor `air.nz` / `air.ny` (g, body axes) from the specific force (aero + thrust + gear, no gravity), set in
  `updateAir()` (research round 1 task 5, T-C-01): cos θ cos φ in unaccelerated flight (≈ 1 near
  level, 0.978 at θ 12°), 1 when parked; ny + = to the right (ny < 0 when β > 0). Nothing reads it yet
  (HUD, Evaluator and Recorder do not); at touchdown the linear gear damper makes it peak at first contact
  (1.8 g at 130 fpm, 2.2 g at 200 fpm), so keep it out of scoring and hard-landing checks until the new strut model
  (`07-gear.md` task 1); on the ground ny carries the velocity-based tyre side force (`07-gear.md` §7.0, §7.12 task 3)
  and reaches 0.2–0.4 g at a crosswind touchdown (21R autoland, seed 5: 0.41 g in `xr`, 0.29 g in `xl`, 0.17 g in
  `head`, against ≤ 0.11 g in the air), so a HUD ball or side-load use waits for that tyre model too.
- Air (plan A8, research round 4 §6.1–6.2, §13 item 1): `Aircraft.atm(h)` gives the ISA pressure profile scaled to
  QNH, ISA lapse + isaDev, and humid air from the dew point measured at the field (constant mixing ratio, capped at
  saturation); lift, drag and air data use it. Thrust (`thrustAvail(V)`) sees the air only through TAS: shaft power
  is right as it is (flat rated to 37 °C, `01-flight-physics/04-turboprop.md`), and the static-thrust ρ term (≈ρ^{1/3}
  by momentum theory, steeper in the BEM of `03-propeller.md` §3.2 and T-P-02; −0.5 % to −1.8 % at the default
  weather) waits for the propeller model (next phase, item 2), which should take its air from `Aircraft.atm(h)`.
  `Flight` takes `oatC`, `qnh`, `dewC`; `WX_DEFAULT` (20-flight.js, ค่าประมาณ) is OAT 31 °C, QNH 1009.3 hPa (annual
  mean of the VTBD METARs 2016–2025, `docs/research/data/vtbd-metar-climo.json`), dew point 22.8 °C (annual mean at
  11 LT, the hour nearest 31 °C): ρ 1.1437 kg/m³ (−1.4 % against dry ISA), RH 62 %, DA 2,300 ft in the briefing.
  `new Flight({ qnh: 1013.25, dewC: null })` and a bare `new Aircraft()` keep the old dry ISA air bit for bit.
  `app.wx` in 90-app.js feeds the briefing and the flights (B10 WeatherState will set it).
- Wind (plan A9, research round 4 §6.3–6.4 and §13 item 3, round 1 `08-wind.md` §8.7): mean wind by the neutral log
  law U(h) = U10·ln(h/z0)/ln(10/z0) from the 10 m wind, h = CG height clipped to z0…300 m (0 below z0, constant above
  300 m), z0 0.05 m (round 1 default, ค่าประมาณ; `WIND_PROFILE`; `z0: null` = default, outside 0…10 m throws a RangeError);
  `law: 'power'` keeps the old 1/7 rule for tests. `GUST_FACTOR_3S` (3 s / 10 min, §6.4, WND-7) is unused until B10/B11.
  Against 1/7 it is weaker below 10 m (0.776 against 0.844 × U10 at 10 ft) and stronger above (1.080 against 1.062 at
  50 ft). Turbulence: MIL-F-8785C Dryden, first-order (exact form is plan F1), intensity `W20` (kt) set apart from the
  mean wind (`Wind.lowAlt(hft, W20)`, h clipped to 10…1000 ft, σw = 0.1·W20), so calm air can be turbulent:
  `Flight({ W20 })` overrides the scenario's `W20` (null or absent = the scenario's, 0 = none); `windW20(spec)` (used
  by Flight, Wind and the scenario card) gives a spec with no W20 but a `turb` (the explore demo, research scripts)
  the old turb·0.932·kt. `Wind.turb` is the equivalent old turb (0 with no mean wind), kept only for research scripts
  that rebuild a Wind from it (`s9_turbclock.mjs`). SCENARIOS keep their turbulence (σ equal to rounding, ≤ 1 ulp;
  with `law: 'power'` the seed-5 autolands match the pre-A9 code to about 1e-12 and score the same): calm 0 (no
  turbulence), head 5.59, xr 7.45, xl 22.36 kt (all light; the cards now say ปั่นป่วนเล็กน้อย for xl too). Kept by
  choice: §6.4's daytime light-wind estimate max(U10, 5) would give head and xr 10 kt; per-regime W20 is B10's (owner
  to choose). `flightOpts()` in 90-app.js does not forward a W20 from `app.wx` (demo flights spread all of `app.wx`):
  B10 must add it if weather turbulence should reach training flights. The HUD wind (`mean(max(h, 1))`) reads 0.62 × U10 when parked.
- Autopilot: LOC/GS tracking, flare, decrab, rollout, braking. `PilotLaws`: ASSIST (attitude command, auto-rudder,
  auto-throttle) and DIRECT (surface deflections + auto-trim).
- Evaluator: stabilised gates at 500 and 200 ft, callouts, touchdown score (sink 40, position 25, centre line 15,
  speed 10, attitude 10). Touchdown window 300–600 m is "perfect". The debrief `'stall'` event (near stall:
  stall blend σ (`air.stall`) > 0.25 or α > α_stall(flaps) − 4°) is separate from the warning and not scored.
- Verified (`test/runways.test.mjs`, seed 5, A8 default weather, A9 log-law wind): autoland on 21R, 21L, 03L, 03R in
  calm scores 100/100/100/93 and in 15 kt gusty crosswind 85/78/85/80 (A8 before A9: 85/80/85/80; dry ISA before A8:
  88/88/90/78; the Dryden filter steps with TAS, so a seed's gusts change). Measured baseline over the turbulence seeds
  the app draws (7–1006, 1,000 autolands each, 2026-11-25, A9): 10 kt headwind on 03L 87–100 (median 96, mean 97.4; A8
  88–100, median 100, mean 98.6: the log law sheds more headwind in the last 50 ft, so touchdown IAS drops about 0.7 kt
  and more flights lose speed points below Vref − 8 kt, as round 1 §8.7 expects; for the flare re-tune E5); 10 kt
  crosswind on 03L 82–97 (median 96, mean 95.3; A8 82–97, 96, 95.0); 15 kt gusty crosswind on 21R 35–100 (median 86,
  mean 84.8; A8 35–98, 85, 84.1), where 56 flights log the near-stall event (A8 52) and none crashes. B2's exact
  trim keeps the three ranges and medians, the means within 0.03, near-stall flights 56 → 57 and the seed-5 scores
  (touchdowns move ≤ 0.8 m). At the app's training distance (5,556 m against Flight's default 5,500 m) one of the
  1,000 seeds (42) bounces to 17 ft after its touchdown at 274 m, in ROLLOUT, and crashes at −900 fpm (A9 before B2
  too): the autopilot has no bounce recovery. Seeds 1–10 give
  66–96 (A8 67–96, dry ISA before A8 75–94) in the gusty crosswind on all four runways. Calm has no turbulence, so its
  scores do not depend on the seed. Headwind, seed 5 (not in `runways`): touchdowns about 6 m shorter on every end,
  21R/21L/03L/03R 308.4/302.7/314.0/286.4 → 302.2/296.9/309.2/280.6 m (B2: 302.3/296.8/309.1/280.5); 21L falls under
  the 300 m window (score 96 → 89), 21R sits 2.2 m (B2: 2.3 m) inside it (input for E5). Mean crosswind at a height of 50/30/10 ft: xl 16.2/14.8/11.6 kt
  (1/7 rule 15.9/14.8/12.7), xr 10.8/9.8/7.8 (10.6/9.9/8.4); at the CG when the wheels pass 50/30/10 ft (CG at
  54.6/34.5/14.7 ft, 21R autoland, seed 5): xl 16.4/15.1/12.7 (16.1/15.1/13.4), xr 11.0/10.1/8.5 (10.8/10.1/8.9). With the A5 horn, 94 of 100
  gusty-crosswind autolands on 21R (seeds 7–106) hear short chirps, 71 of them above 20 ft and 35 above 50 ft (A8:
  95/71/36), because the autopilot flies Vref with no gust allowance; with seed 5 the horn first sounds in APP at
  39–44 ft on all four runway ends (A8 38–43 ft, dry ISA 45–50 ft), APP onsets span 23–44 ft (A8 25–43 ft), and only
  03R adds a FLARE onset, at 11 ft (round 2's `stall_warning` check counts anything above 20 ft). Open for the owner:
  flap α_warn 7.77° (about 5 kt) or a Vref gust additive.
- Verified per type (plan C1, `test/types.test.mjs`, seed 5, A8 default weather, A9 wind, each card at its training
  mass), autoland scores 21R/21L/03L/03R in calm and in the gusty crosswind `xl`: c172s 100/93/100/93 and 79/79/86/77,
  c172r 100/93/100/93 and 72/76/76/75, da42ng 100/100/100/100 and 96/94/96/89, da42_tae125 100/93/100/93 and
  81/81/80/77, da40d 100/100/100/93 and 93/91/94/83, da40_180 100/100/100/93 and 88/93/92/86; no crash, no near-stall
  event. The test asserts calm on all four ends (no crash, ≥ 90, no near-stall event, horn never on) and `xl` on 21R
  (no crash, ≥ 70; c172r's 72 is 2 points over), and logs the `xl` horn only: none on the DA42s, up to 32–37 ft on the
  c172s and 63–68 ft on the c172r, and from about 930 ft on both DA40s (10–13 s in all), whose landing flaps leave only
  about 2.5–3.2° of α between the trimmed approach and the 7 kt warning angle (`setApproach` 5,500 m out: α −0.13°
  against 2.42° on da40_180, −0.32° against 2.84° on da40d; 5.5–6.8° on the other four), with the autopilot flying
  Vref with no gust additive (the owner's open choice above matters most for them). Plan C2 turns these into
  regression bands for every type (`AUTOLAND` in `test/types.test.mjs`).

## Visibility (current)
- The visibility choice (500 m to 40 km, default 20 km) is MOR (WMO-No. 8; research round 4 §6.8): extinction
  β = ln20 / V at the ground, Beer–Lambert on the distance to the camera, thinning with height as exp(−h / 1,600 m)
  (`uHazeH`, an estimate with no source yet). The fog, the clouds and the light sprites call `hazeDepth`; the sky dome
  (on screen also below the horizon line, where the sun's disc can sit) and the direct sunlight (`sunHazeT`) use its
  limit for an endless path, `hazeDepthUp`. The sky, the clouds and the sunlight take only the haze beyond a 20 km day
  (estimate), since their own model already shows that much, so 20 and 40 km look as before and thick fog hides the
  sun and its shadows. The ground of the image-based light (`uGround`, set only in `SkySystem.applySunHaze`) is lit by
  that sunlight and by the sky seen through the haze (`skyIrradianceUp` with the fog palette), so in fog the
  undersides of the aircraft see a grey ground, not a sunlit one.
- three.js applies fog after tone mapping and the sRGB encode, so the haze is put in front of `colorspace_fragment`
  instead: it mixes in display-linear light (a black object at V keeps 5% contrast on screen) with a tone-mapped fog
  colour (full fog matches the sky at the horizon).
- Airfield lights are on at night and by day at 5 statute miles or less: the FAA rule for approach lights by day
  (JO 7110.65BB para 3-4-5), used for all airfield lights because no Thai or ICAO day threshold was found in a public
  source.

## Siting and airfield lights (current)
- Trees (from land-use classes) and generated city buildings know nothing about the airport, so `17-siting.js` drops
  the ones that cannot stand where they fall. The trees that stay are the same trees as before (the random stream is
  used the same way); mapped buildings (OSM footprints) are never dropped. The rules:
  - Obstacle limitation surfaces of ICAO Annex 14 Vol I, Chapter 4 (Tables 4-1 and 4-2, code 4 instrument runway;
    Thailand files no difference, AIP GEN 1.7): approach 2 % then 2.5 % from 60 m before each threshold (the displaced
    THR 21L included), take-off climb 2 % from the end of the 150 m clearway (AIP AD 2.12), transitional 14.3 %, inner
    horizontal 45 m, conical 5 %. The ground is flat, and the strip is taken as wide as the approach inner edge
    (280 m; the declared strips are narrower). Annex 14 has a new Chapter 4 that applies from 21 Nov 2030.
  - Approach light lanes: nothing within 60 m of the centre line along each system (Annex 14, 5.3.4; lengths from
    AIP AD 2.14: 03L 420 m, 21R 900 m, 03R 300 m, 21L 900 m).
  - Clearances: 43.5 m from a taxiway centre line and 40 m from a stand taxilane (Annex 14 Table 3-1, code letter
    E), 7.5 m from an apron (3.13.6), and our own choices: half a crown from a building, a whole crown from a viaduct
    deck or station, one map cell (2.5 m) plus the crown from water. A generated building also goes when its centre
    is in water or on a bank line, when a fifth of its footprint (`WET_MAX`) is on water, when a third of its
    footprint (`ROAD_MAX`) is on a road or railway of the land-use map, or when any of nine points of its outline is
    on a mapped building, under a deck or a station roof, or in a lane. `groundShare` samples the footprint; a sample
    on a cell border (within a micrometre of it) counts half for each side (`SiteIndex.eachClassAt`), so a house gets the
    same answer on either side of a road or a canal. A building beside a road stays, and for roads the centre is
    not asked: the city data puts no centre inside a road cell, only on a cell border.
  - The index (`mappedSite`) holds the stations and the footbridge before anything is placed; `buildCity` does not
    keep it (with every building in it, it is 35 to 55 MB).
  - Measured on 2026-11-26 (balanced quality): 7,393 of 9,911 trees and 54,773 of 57,895 generated buildings stay
    (2,334 buildings stood on a road or railway, nearly all shophouses, four in five of them standing alone and no
    group larger than five; 684 in water, 101 under a deck or a station; high quality: 16,631 of 24,029 trees and
    89,852 of 94,612 buildings). `test/siting.test.mjs` pins these counts. One kept building of the balanced
    quality has a twentieth or more of its footprint beyond a road (6 %, beyond a lane that turns under it), and one
    more of the high quality (a quarter, where two lanes meet corner to corner under it); with a half instead of a
    third it would be 10 and 23. Ground that hangs on by a neck under half a metre wide counts as beyond, and by one
    up to 0.9 m it may, by the slant of the neck (the test reads the ground at points a quarter of a metre apart).
    The wood before THR 03R (OpenStreetMap) stays from about 700 m before the threshold, where it is under the 2 %
    surfaces; single trees on farm land stay from about 490 m.
- Runway and approach lights follow AIP AD 2.14 for what each end has and Annex 14, 5.3 for the layout: threshold
  lights 3 m apart, green toward the approach only (THR 21L is displaced: a one-way green row with wing bars at the
  threshold, red end lights at the pavement end); edge lights 60 m, red before THR 21L, yellow over the last 600 m;
  centre line lights on 03L/21R; touchdown zone lights on 21R with 18 m between the rows; CAT II red side rows in
  line with them and a 150 m crossbar; flashing lights on 21R beyond 300 m and on 21L beyond the pavement.
  Approach lights over pavement are inset: before THR 21L, and over the 60 m pad the runway mesh draws beyond every
  paved end (`RWY_PAD`; the picture's own, the AIP declares no stopway). Beyond it they stand on `alsStands`: one
  cross-arm per group of lights (`alsArms`), 0.9 m high at the end of the pad and rising 1.2 % outward (up to 11 m
  at 900 m before THR 21R, 6.8 m before THR 21L). A flashing light stays lit 40 ms (`SFL_FLASH`) so that no flash
  falls between two frames.
- Taxiway edge lights: AIP AD 2.15 (AIRAC 29 OCT 2026; research round 5, `5a-aip.md`: table B4 has edge lights on
  every taxiway, the JSON block of that section gives them as blue), so `taxiEdgeLights(af)` walks every taxiway
  polyline of `vtbd_af.json`, whatever its tag (before, only the 28 % tagged `twy` had lights, and TWY C beside the
  main runway had four, on one 72 m piece): a light on each side every 45 m, the stations centred on each line (a
  short connector has a pair in its middle, and the layout is the same whichever way a line was drawn), 0.6 m outside
  the edge of the 23 m `TWY_W` (Annex 14, 5.3.18), square to the run of the line over 25 m (the vector lines have
  jogs). An edge light never stands on pavement: none within `TWY_W / 2` of any taxiway centre line (junctions), on an
  apron or within 3 m of an apron outline (`APRON_EDGE`), so the side of a taxiway that runs along an apron is dark. A
  place that falls on the pavement of one joining taxiway moves to the corner where the two edges meet, if that corner
  is within 3 m of the line's own edge (`TWY_EDGE.out`, the 3 m of 5.3.18; 22 lights stand at such corners, and
  without them the inside of a corner where three taxiways meet was dark over 86 to 92 m along the edge, 72 m straight
  across, and two acute corners over 70 and 65 m). No two lights stand within 7.5 m of each other (`TWY_EDGE.gap`:
  where two lines set a light for the same corner under 7.5 m apart, one stands; with 15 m a light across a junction
  stood in for the light of another edge, and three straight edges were dark over 62 to 67 m); 417 lights, at 424 of
  the 942 places, and no bare edge is dark over more than 51 m measured straight across (`test/lights.test.mjs`
  follows every edge a quarter of a metre at a time).
  Round a patch of grass between taxiways the edge has no light over about 100 m at three junctions (no straight
  part of it over 35 m; left as it is).
  One of them stands inside a mapped water outline beside a taxiway (a data overlap, as before). Not drawn: the
  taxiway centre line lights of TWY D, E, F, J, O, R, S and C (south) (the vector lines carry no names; research
  round 5 has them in `tw_names.json`, not yet in the page data) and the intermediate holding position lights along
  TWY C.
- Estimates in the lighting: the 30 m spacing of the 420 m simple system on 03L (60 m is also allowed), stand
  heights and their rise, the wing bars at 21L (the AIP column was not read), that the 900 m of the 21L system are
  measured from the displaced threshold (so its first 350 m are inset in the runway), the number of lights in a
  barrette, the 1.5 m between the lights of the 300 m crossbar and the places of the 150 m crossbar lights, the 60 m
  between touchdown zone barrettes, the 0.6 m of edge lights outside the edge (`EDGE_OUT`), the length of a flash
  and the 15 ms between one flashing light and the next, the 45 m between taxiway edge lights, the 3 m kept from an
  apron and the 7.5 m under which two taxiway edge lights count as one. Estimates in the siting: every taxiway is
  taken 23 m wide (AIP AD 2.8 gives 23 to 50 m), and the positions of the three stations carry no recorded source
  (research round 5, `5c-city.md`, has the Red Line station 656 m from the one drawn: to be checked).

## Controls (current)
- Keyboard (physical keys, `KeyboardEvent.code`, so a Thai layout works; map in `src/18-keys.js`): W/S or ↑/↓
  pitch, A/D or ←/→ roll, Q/E rudder, = / - (or PageUp/PageDown, Numpad 9/3) throttle, B brake, C camera,
  T take control, P pause, R restart. No Ctrl, Meta or Alt in the map: pressing one releases every held flight key
  and keys pressed with one are ignored. Ctrl (the old throttle-down key) with W made Ctrl+W, which closes the
  Chrome tab before the page can block it (research round 1 §11.4.5). On macOS, Cmd's keyup also releases held keys
  (the browser sends no keyup for a key released while Cmd is down). C/T/P/R act once per press (key repeat
  ignored); while flying, bound keys do not scroll the page; held keys are released when the window loses focus or
  the tab is hidden. Hiding the tab during a training flight also pauses it (warp 0, touch controls released), shows
  "หยุดชั่วคราว — กด P เพื่อบินต่อ" on return (touch: "หยุดชั่วคราว — แตะข้อความนี้เพื่อบินต่อ"; a tap on the
  message resumes, since full screen covers ×1; it sits above the instrument strip) until the flight runs again or
  ends (another message may replace it for its 2.6 s, then it comes back), and never resumes by itself. Keys ramp
  linearly with frame time and self-centre (`src/25-input.js`, research round 1
  §11.4.2): pitch 0.5/s up and 2.5/s back, roll 1.0/3.0, rudder 1.0/2.0, faster when the opposite key undoes a
  deflection; Shift held halves the rate and the travel (fine mode); a key pressed and released between two frames
  still counts for one frame.
- Gamepad (W3C Gamepad API, read once per frame in `readInputs`, the lowest-index standard pad; only the "standard"
  mapping drives the aircraft, other devices wait for a binding page): left stick roll and pitch (scaled radial dead
  zone 0.08, expo 0.5), triggers rudder (right − left), right stick up/down throttle rate 0.5/s, bumpers brakes,
  A/✕ take control, B/○ camera (also between flights, like C), Start pause. Browsers list no pad until a button is
  pressed. A pad lost while it flies the aircraft pauses the flight. D-pad trim, D-pad flaps, Y gear and split brakes
  are read but wait for the model.
- Keyboard, pad and touch stick share an axis (`InputAxis` in `src/25-input.js`, research §11.5.4): the source that
  moved last controls it. A key counts as moving only when it goes down (its ramp and self-centring do not), a finger
  when it touches or moves the stick, a stick when it leaves the centre or moves by more than 0.02. Switching never
  makes the value jump: keys continue from the current value, and the output runs to a stick's value at the axis's
  return rate (pitch 2.5/s, roll 3/s, rudder 2/s) before following it.
- Touch: virtual stick, throttle rail, brake button.
- Phone tilt (option "บังคับด้วยการเอียงโทรศัพท์" in the training setup, shown on touch devices in a secure context;
  `TiltStick` in `src/25-input.js`; not in the research report: geometry from the W3C DeviceOrientation Event spec,
  numbers are estimates sourced in the file): replaces the touch stick for roll and pitch, as source 3 of `InputAxis`.
  The pose when a flight starts, when control is taken over, or when the circle (now an indicator) is held still for
  0.6 s becomes the centre, in the screen frame of that moment; a display rotation later does not change the mapping.
  Screen angle: `window.orientation` first, then `screen.orientation.angle`, never the viewport's shape (tablets can
  be landscape-natural); gravity picks the sign, and the other quarter turn only for `screen.orientation` and a phone
  held up like a wheel across the browser's axis (`window.orientation` is never overruled). Grip from how far the
  screen is raised (`tiltGrip`, wheelFrom 40°): 40°–140° 'wheel' (turn about the screen's normal is roll; its roll is
  floored within 20° of flat or face-down, past full pitch travel), near flat 'tray' (tilt about the up axis is roll),
  screen down overhead 'under' (as the tray; pitch runs on through face-down). The edge that goes down is the bank side; the top edge
  toward the player is pull. Full deflection at 30° roll / 20° pitch, dead zone 2°, expo 0.3, smoothing 0.06 s.
  Chrome sends no event while the phone is still, so the last reading is kept (no stale cut-off); a hidden page drops
  the reading and keeps the centre. A screen wake lock is held while tilt flies. iOS asks permission from the tap
  (Safari remembers a refusal until it is closed); a frame whose Permissions Policy blocks the sensors, or no reading
  within 2 s, turns the option off with a Thai message. Whether the claude.ai artifact viewer allows the sensors has
  not been checked on a phone (it is a cross-origin frame and offers no device-motion capability, so probably not).
- Stall-warning horn (Web Audio, starts after the first click or key press in the training mode, never in explore;
  silent when paused, outside a flight or with the tab hidden; the audio context is suspended after 2 s outside a
  running flight, a paused one included; continuous on slow frames, and fades out by itself 2.5 frame intervals
  (0.25–1 s) after frames stop); checkbox `#chkHorn` in the flight pane turns it off (saved per viewer; flight keys
  still work while it has focus); no key.

## Research reports (docs/research/)
- The owner's 5-round research program lives in `docs/research/`: `01-flight-physics.md`, `02-light-aircraft.md`,
  `03-airliners.md`, `04-weather.md`, `05-airport-city.md` (each file appears when its round's pull request is
  merged). Each report cites its sources with licences, marks
  estimates (ค่าประมาณ), gives test cases with expected values, and ends with "สิ่งที่ Claude Code ควรทำ".
- Round 1 is split: the summary and prioritised task list are in `01-flight-physics.md`; the 12 topic files,
  the parameter schema (`schema.md`), the merged JSON (`params-trainer.json`) and the computation scripts are in
  `01-flight-physics/`. Parameters use the leaf format `{v, u, scope, src, conf, est, note}`; scopes `aircraft`,
  `engine`, `propeller`, `gear` are per aircraft type (rounds 2–3 fill them), `environment` and `sim` are shared.
- Round 2 (light aircraft and trainers) is split the same way in `02-light-aircraft/`. `schema-ext.md` adds
  per-type cards keyed by type id (`c172s`, `da40ng`, `da42ng`, `pc9m`, `t6a`, ...) with `_inherits` for variants,
  shared with round 3. `params-light.json` is merged by `scripts/lm_merge.mjs`; `scripts/lm_lib.mjs` `loadType(id)`
  resolves a card, and `scripts/lm_card.mjs` `buildAC(card)` / `applyAC(M, ac)` load it into the current sim for tests.
  The card owns `speeds.VREF_kt` / `VAPP_kt`; handling (08) and procedures (09) quote it. Task item 10 (the type
  selector, cards from `params-light.json`) is done by plan C1 and item 11 (the regression lock over all types, `test/types.test.mjs`)
  with item 23 (the stall-recovery robot) by plan C2; item 12 (KIAS on the HUD and in the Evaluator) by plan C3; C4
  (airliner cards through the same reader) is done. After editing any JSON block,
  `node docs/research/02-light-aircraft/scripts/lm_merge.mjs --coverage --dry --strict` must report 0 warnings
  (`--strict` exits 1 on any warning, and on a card with round-1 per-type paths neither filled nor in `_na`); then run
  it without `--dry` to rewrite `params-light.json` and commit it (CI checks that the file is up to date).
- Research CI: `.github/workflows/research.yml` runs `node docs/research/02-light-aircraft/scripts/lm_ci.mjs` on
  changes to `docs/research/**` (lm_merge --strict, params-light.json up to date, lm_selftest, ls_tests, lh_tests,
  lo_tests; fails if a run changes a file in the repo). The scripts that fly
  cards run against the simulator commit pinned in `02-light-aircraft/scripts/sim-snapshot.json` (src/,
  test/harness.mjs and, when the pinned commit has it, data/aircraft/ extracted to a temp folder through
  `AIRFIELDLAB_ROOT`; from plan B3 on the harness needs the card beside it), so a physics PR does not move them;
  results go to `$LM_OUT_DIR`, never into the repo. `lm_ci.mjs --root .` runs the same checks on the working tree.
  After a physics change, re-pin the commit and move the expected values in one PR (`lm_selftest` T-LM-32 checks
  that the scripts' copies of `stallBlend` and `Evaluator.score` still match the pinned sim). The plan C1 cards are not
  pinned: a research PR that changes `params-light.json`, a reference row of a topic file or `lm_lib.mjs`,
  `lm_card.mjs` or `lm_inertia.mjs` also runs `node tools/aircraft/build_cards.mjs` and commits the cards it rewrites;
  `research.yml` does not run `--check`, but `pages.yml` runs `test/cards.test.mjs` on every pull request into `main`.
- Round 3 (airliners: ATR 72-600, 737-800, A320/A321 ceo and neo, A330-300) follows the same split:
  `03-airliners.md` holds the summary, conflicts and the task list; `03-airliners/` holds 10 topic files, one
  merged parameter file per type (`params-<type>.json`, plus `params-common-airliner.json`), the per-type
  summary `schema.md`, the round-1 schema extension `schema-ext.md` (new categories airframe, speeds, performance,
  propulsion, controls, afcs, ops; `_inherits` for neo and A321 variants) and the scripts in `scripts/`
  (`r3_merge.mjs` rebuilds the JSON from the topic files, `r3_schema.mjs` rebuilds `schema.md`).
  Round 3 keeps scope by meaning and gives airliner speeds as mass tables or rules, unlike round 2's card rules,
  so do not run round 2's `lm_merge --strict` on round 3's `params-*.json`. Plan C4 turns them into the airliner
  cards with `tools/aircraft/build_airliners.mjs` (through `build_cards.mjs`); `r3_merge.mjs --dry --coverage` may be
  run read-only to compare its gaps with the cards' `_na` and `_deferred`.
- Read the relevant report before changing physics, input or data. Physics code changes wait until the owner
  approves the development plan that follows all five rounds.

## Next phase (owner's request): control feel and flight-physics realism
The prioritised task list at the end of `docs/research/01-flight-physics.md` refines this list.
Suggested order, each with a Node test before tuning by feel in the browser:
1. Input: proportional keyboard ramps with self-centring, elevator trim keys, flap and gear controls,
   differential brakes; Gamepad API (stick, rudder, throttle axes) with dead zone and expo; sensitivity settings.
2. Propeller/engine: thrust from power and advance ratio with an efficiency curve, turbine spool-up lag,
   torque, P-factor and slipstream yaw/roll.
3. Control effectiveness with dynamic pressure and slipstream; trim and stick-force model.
4. Configuration changes: flap/gear transition time, pitching moments, speed limits.
5. Stall behaviour: wing drop and departure; buffet cue.
6. Ground handling: speed-limited nosewheel steering, better tyre model, wet runway.
7. Validation suite against reference trainer numbers: stall speeds, best-rate climb, glide ratio, takeoff and
   landing distances, and linearised modes (short period, phugoid, Dutch roll, spiral) frequency and damping.

## Data provenance (data/)
- Runways, lights, navaids: AIP Thailand AD 2 VTBD, AIRAC 29 OCT 2026 (AMDT 11/26, https://aip.caat.or.th). The values
  are unchanged since AIRAC 14 MAY 2026 and in the 26 NOV and 24 DEC 2026 cycles (research round 5 §1 and 5D); check
  again before AIRAC 21 JAN 2027. `test/fixtures/aip_vtbd_current.json` holds the published values (numbers only,
  © CAAT): `test/aip.test.mjs` checks `RWY_DATA` against it, and `test/licenses.test.mjs` (T-K05) checks that the
  footer, the source comment of `src/15-geo.js` and this line cite its cycle. For a new cycle, update the fixture first.
- Taxiways, aprons, buildings, water, golf course, land use: OpenStreetMap map renders captured and vectorised,
  mostly by the scripts in `tools/` (the source captures and a few steps are not included, see the "made by" column
  of `data/LICENSE-DATA.md`; regenerate only if the layout must change).
- `city.json`: base64 records, generated buildings (9 bytes each) and street lights (5 bytes each); the artifact
  host refuses `.bin`, so binary data travels inside JSON.
- `aircraft/trainer.json` (plan B3): the fictional trainer's parameters, written from the `AC` numbers `src/20-flight.js`
  held before, in the form of the round 2 trainer card. Every value is an estimate of the project with its sources in
  `_meta.sources` (`R1:V19` the old `AC`, `LM0` the few assumptions round 2's fixture added: length, flap angle, MTOW,
  engine position); the repo's own data under MIT (`data/LICENSE-DATA.md`, its own table), no OpenStreetMap data, so
  it adds no footer credit. `_meta` carries `source` and `license`. A card in `data/aircraft/` resolves its `src`
  codes through `_meta.sources`, not through round 2's `lm_lib.validate`, which warns four times on the trainer by
  design (the `_meta.note` says so): `training_mass` stays the fixture's plain number, not D3's
  `{kg, empty_kg, crew_kg, fuel_kg}` (no source to split it), and `R3:D3` and `AL:A5` are not R2-03 code forms.
- `aircraft/<id>.json` for `c172s`, `c172r`, `da42ng`, `da42_tae125`, `da40d`, `da40_180` (plan C1): generated by
  `tools/aircraft/build_cards.mjs` from the round 2 cards in `docs/research/02-light-aircraft/params-light.json` (45
  copied paths: what `acFromCard` reads, the speed table `speeds.ias_cas`, the flap detents, and the identity, MTOW,
  length and gear layout, which the selector text and round 2's helpers use; then the generated stall-warning angles,
  `gear.legacy` where the research card has none, the antenna at the eye, and the Thai `thai_fleet` leaf of civil
  schools and clubs). Each value names its sources and confidence; estimates say ค่าประมาณ. The repository's own
  compilation under MIT, manufacturer, authority and register figures used as cited numbers only; no OpenStreetMap
  data, so no footer credit. On the two C172 cards the eye point, gear stations, track and spring rates and the flap
  drag and pitch increments (`aero.flaps.detents` dCD0/dCm0, which `aero.legacy` carries as CDflap/Cmflap) are numbers
  read from the JSBSim `c172r` model (LB3, cited, no file or text copied; plan C1 R1). No FlightGear number and no
  LB19 code reaches a card. The DA40 wheel stations: the research leaves give the main station 2.80 m DAT next to
  FlightGear's 2.81 m [LB19]; its topic file (§05.2) calls 2.80 / 1.12 m its own estimates from pictures, checked
  against that model. The card instead splits the AFM wheelbase 1.68 m [LD2] by the research's nose-load share of about
  20 % [LD0], which the research itself got (19.6 %) from those stations at CG 2.47 m, so the split gives them back
  rounded: x main −0.336 m, nose +1.344 m (research −0.33 / +1.35). The DA40 eye x is +0.07 m, from the seat station
  2.30 m DAT [LD8] with the eye 0.1 m aft, against the card's CG reference 2.47 m DAT; the research leaf held −0.07 m,
  cited only to LB19, which its own note's derivation does not give.
- Licences: `vtbd_af.json`, `land_in.png`, `land_out.png` and `city.json` are derived from OpenStreetMap and
  available under the ODbL 1.0 (`data/LICENSE-DATA.md`, which `node build.mjs` copies into `dist/` with them).
  `vtbd_af.json` and `city.json` predate the `source`/`license` field rule (`legacy_data_without_fields` in the
  policy); a regenerated file gets the fields and leaves that list. The code (every script, those in `docs/research/`
  included) and the repo's own text are under MIT (`LICENSE`, the owner's choice on 2026-11-25); the files in `data/`
  follow `data/LICENSE-DATA.md`, data files and quoted material in `docs/research/` that state their own licence
  (ODbL, CC BY 4.0, Copernicus) keep it, and AIP values are used as numbers with CAAT cited.

## Working in the cloud (Claude Code on the web)
- The owner works from the cloud so their computer can stay off. The GitHub Pages site shows `main`; a pull request
  is tried on its own claude.ai preview (below). `.github/workflows/pages.yml` runs all tests and the build for pull
  requests into `main` (a check on the PR, nothing deployed; that build, of the PR merged into `main`, is kept as
  the Actions artifact `dist-pr-<n>` for 14 days) and for every push to `main`, which then deploys. The job stops
  after 15 min. One-time setup in the repo: Settings → Pages → Source: GitHub Actions.
- Work on a branch and open a pull request for anything that changes the flight model, so the owner can try it
  before merging.

### Preview each pull request
Pages deploys only `main`, so the owner tries a pull request on a private claude.ai artifact of its own build.
1. On the PR's branch (merge `main` in first if it is behind), `node build.mjs --preview <PR number>`. It writes
   `dist-preview/pr-<n>/`: the page with "พรีวิว PR #n" in its title and a badge beside the brand, nothing else
   changed (`test/page.test.mjs`), and every file under `data/`. It prints the `files` map for step 2.
2. Publish `dist-preview/pr-<n>/index.html` with the Artifact tool, with that `files` map and
   `capabilities: {downloads: true}` (the PNG button), as a new private artifact. A folder per PR gives each preview
   its own file path, so one conversation never redeploys another PR's preview or the live slug (f3207a70…).
3. Put the link, the commit it was built from and what to try under "ลองก่อน merge" at the top of the PR body
   (`.github/pull_request_template.md`). After a push that changes the page or its data, build again and publish to
   the same artifact (same file path in the same conversation, or its URL as `url` in a later one).

## Publishing
- Live as a claude.ai artifact (multi-file: index.html + every file in `data/` at its path, now 19 files: the four
  OSM data files `vtbd_af.json`, `land_in.png`, `land_out.png`, `city.json`, `aircraft/trainer.json` (plan B3: the page
  does not start without it), the six plan C1 cards `aircraft/c172s.json`, `c172r.json`, `da42ng.json`,
  `da42_tae125.json`, `da40d.json`, `da40_180.json` (a missing one only disables its entry), the seven plan C4 airliner
  cards `aircraft/a320ceo.json`, `b737_800.json`, `a320neo.json`, `a330_300.json`, `a321neo.json`, `atr72_600.json`,
  `a321ceo.json` (loaded only once รุ่นทดลอง is on), and `LICENSE-DATA.md`), title "Airfield Lab ดอนเมือง VTBD", slug f3207a70-5bd7-43d8-a606-a2b9b946413a, `downloads`
  capability declared for the PNG snapshot button.
- The earlier fictional-airfield prototype is a separate artifact (827d3f8b-1c74-4a51-b9e5-6ef7ea33b59c).
- Pull request previews are separate private artifacts titled "พรีวิว PR #n · Airfield Lab ดอนเมือง VTBD". The live
  artifact is always republished from a plain `node build.mjs` (`dist/`), never from `dist-preview/`.
