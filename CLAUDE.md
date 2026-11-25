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

## Commands
- Build: `node build.mjs` → `dist/index.html`, and copies `data/*` into `dist/`.
- Run: `python3 -m http.server 8080 -d dist`, open http://localhost:8080 (needs HTTP: the page fetches its data).
- Tests (Node ≥ 22, no dependencies, `node:test` + `node:assert/strict`): `node --test "test/**/*.test.mjs"`
  (quote the glob: a bare `node --test` would also run `test/shots.mjs`, `test/harness.mjs`, `test/lib/*.mjs` and
  the research scripts under `docs/research/` whose names match Node's default test patterns).
  `geo` (AIP geometry), `flight` (start trim, parked, autoland per wind), `runways` (autoland on all four ends),
  `assist` (robot pilot in ASSIST and DIRECT), `stall` (CLmax and Vs, research T-A-01), `modes` (trim, linearise and
  MIL-F-8785C Level 1 modes with regression bands, research T-V-01…T-V-06), `keys` (keyboard map and key handling,
  research T-I-07 and T-I-08, and that `src/90-app.js` applies its decisions), `input` (shaping, key ramps, the
  sub-frame key latch, the standard gamepad and source arbitration, research T-I-01…T-I-06, T-I-09…T-I-12 and T-C-14,
  phone tilt geometry and `TiltStick`, and that `src/90-app.js` reads the gamepad and the tilt through it), `page` (parses the assembled page
  module and checks the element ids the scripts use). Autoland score floors sit just under the values measured on
  2026-11-19 (the assist robot's floor is a loose 50); touchdown points and every mode value have regression bands.
  A physics change that moves them updates the test in the same PR.
  `test/lib/fstd.mjs` holds `f9`, `trim`, `linearise`, `eig4`, `modes` (research round 1 §10.5).
  `test/harness.mjs` evaluates `10-atmo.js + 15-geo.js + 18-keys.js + 20-flight.js + 25-input.js` with
  `new Function` in strict mode, and `test/keys.test.mjs` evaluates `18-keys.js` the same way, so those files must
  stay DOM-free. `build.mjs` exports `assemble()` for the page test.
- Screenshots: `test/shots.mjs <set>` (Playwright + Chrome, SwiftShader). Paths inside it point at the original
  cloud workspace (`/home/claude/...`, `/opt/npm-tools`, vendored three.js); adjust before use.

## Source layout (concatenated in this order into the `/*__APP__*/` marker of `src/template.html`)
| file | role |
|---|---|
| 00-head.js | three.js imports (OrbitControls, BufferGeometryUtils) |
| 10-atmo.js | pure: constants (KT, FT, NM, DEG, RAD, G0), USSA-1976 `atmosphere(h, isaDev)`, NOAA sun position, sky radiance |
| 15-geo.js | pure: ARP, local projection `llToNE`/`neToLL`, `RWY_DATA` from AIP, derived `RUNWAYS` and `RWY_END[id]` |
| 18-keys.js | pure: `DEFAULT_KEYMAP` (physical key codes), `TOGGLE_ACTIONS`, `resolveKey`, `keymapProblems`, `isToggleEdge`, `KeyState` (held keys + keydown/keyup decisions + `frame()` with sub-frame taps; `app.keys`) |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC`, `Aircraft` (6-DOF), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
| 25-input.js | pure: `INPUT_CFG` (estimates from research §11), calibration and dead-zone helpers, `shapeAxis` / `shapeLever`, `keyRamp` + `KeyAxis`, `readPad` (W3C standard gamepad), `Arbiter` (last-moved source wins) + `InputAxis` (no jump on a switch), `TiltStick` (phone tilt), `PilotInput` (one frame from keys, pad, touch and tilt; `app.pin`) |
| 30-render.js | render frame `RW` (follows the active runway through `globalThis.__onRwy`), `W3(e,n,y)`, shared uniforms `SU`, shader patching `enhance()`, `Batch` |
| 40-sky.js | sky dome, clouds, horizon fog palette, sun light and shadow box |
| 48-data.js | loads `vtbd_af.json`, `land_in.png`, `land_out.png`, `city.json` |
| 50-airfield.js | land-use bake on the GPU + ground shader, runway marking shader (per runway), taxiways, aprons, hold lines, terminal, towers, navaids, windsocks, masts |
| 55-city.js | instanced city buildings, OSM footprints, tollway / SRT viaduct / BTS + stations, trees, parked airliners |
| 60-lights.js | point-sprite lights with directional colour (`LightSet`) and the AIP lighting layout |
| 70-aircraft.js | trainer model, control-surface and gear animation |
| 80-hud.js | conformal HUD, ILS/PAPI widget, debrief charts |
| 90-app.js | UI, camera presets and hotspots (Thai), input, training flow, frame loop |

## Frames and units
- Physics: NED metres, origin at the ARP (13°54′51.74″N 100°36′20.49″E), d down, ground at d = 0. Body FRD,
  quaternion body→NED, SI units internally.
- Render: x = east, y = up, z = −north. Data JSON coordinates are `[e, n]` metres from the ARP.
- `RWY_END[id]`: `thr` [n,e], `u` landing direction, `r` right normal, `lda`, `aim` (GP origin = RDH / tan 3°),
  `papi` (distance from MEHT), `locDist`, `appr.kind` ILS or RNP (03R is RNP with a synthetic 3° path).

## Flight model (current state)
- Generic two-seat turboprop trainer (fictional): m 2250 kg, S 16.3 m², b 10.2 m, P 700 kW, static thrust 11.5 kN.
- Linear stability derivatives in `AC`, stall by Beard–McLain blending (M = 55, α_stall 17°, −2.5° with flaps),
  ground effect, spring-damper gear with tanh tyre friction, RK4 at 240 Hz.
- Wind: 1/7-power shear + MIL-F-8785C Dryden turbulence (first-order).
- Autopilot: LOC/GS tracking, flare, decrab, rollout, braking. `PilotLaws`: ASSIST (attitude command, auto-rudder,
  auto-throttle) and DIRECT (surface deflections + auto-trim).
- Evaluator: stabilised gates at 500 and 200 ft, callouts, touchdown score (sink 40, position 25, centre line 15,
  speed 10, attitude 10). Touchdown window 300–600 m is "perfect".
- Verified (`test/runways.test.mjs`, seed 5): autoland on 21R, 21L, 03L, 03R in calm scores 100/100/100/93 and in
  15 kt gusty crosswind 88/88/90/78. Measured baseline over the turbulence seeds the app draws (7–1006, 1,000
  autolands each, 2026-11-19): 10 kt headwind on 03L 89–100 (median 100); 10 kt crosswind on 03L 81–97 (median
  96); 15 kt gusty crosswind on 21R 35–97 (median 85), where 51 flights log a stall warning and 2 (seeds 42 and
  559) bounce and are flagged as a crash about 5 s after touchdown. Seeds 1–10 give 74–94 in the gusty crosswind
  on all four runways. Calm has no turbulence, so its scores do not depend on the seed.

## Controls (current)
- Keyboard (physical keys, `KeyboardEvent.code`, so a Thai layout works; map in `src/18-keys.js`): W/S or ↑/↓
  pitch, A/D or ←/→ roll, Q/E rudder, = / - (or PageUp/PageDown, Numpad 9/3) throttle, B brake, C camera,
  T take control, P pause, R restart. No Ctrl, Meta or Alt in the map: pressing one releases every held flight key
  and keys pressed with one are ignored. Ctrl (the old throttle-down key) with W made Ctrl+W, which closes the
  Chrome tab before the page can block it (research round 1 §11.4.5). On macOS, Cmd's keyup also releases held keys
  (the browser sends no keyup for a key released while Cmd is down). C/T/P/R act once per press (key repeat
  ignored); while flying, bound keys do not scroll the page; held keys are released when the window loses focus or
  the tab is hidden. Keys ramp linearly with frame time and self-centre (`src/25-input.js`, research round 1
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
  The pose when a flight starts, when control is taken over, or when the circle (now an indicator) is held 0.6 s
  becomes the centre, in the screen frame of that moment (`window.orientation` first, then
  `screen.orientation.angle`, checked against gravity). Held up (screen raised 40° or more from flat) the phone is a
  wheel: turning it about the screen's normal is roll; held near flat it is a tray: tilting about its up axis is
  roll; the top edge toward the player is pull. Full deflection at 30° roll / 20° pitch, dead zone 2°, expo 0.3,
  smoothing 0.06 s. Chrome sends no event while the phone is still, so the last reading is kept (no stale cut-off);
  a hidden page drops the reading and keeps the centre. A screen wake lock is held while tilt flies. iOS asks
  permission from the tap; a frame whose Permissions Policy blocks the sensors, or no reading within 2 s, turns the
  option off with a Thai message. Whether the claude.ai artifact viewer allows the sensors has not been checked on a
  phone (it is a cross-origin frame and offers no device-motion capability, so probably not).

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
  The card owns `speeds.VREF_kt` / `VAPP_kt`; handling (08) and procedures (09) quote it. After editing any JSON block,
  `node docs/research/02-light-aircraft/scripts/lm_merge.mjs --coverage --dry --strict` must report 0 warnings
  (`--strict` exits 1 on any warning, and on a card with round-1 per-type paths neither filled nor in `_na`); then run
  it without `--dry` to rewrite `params-light.json` and commit it (CI checks that the file is up to date).
- Research CI: `.github/workflows/research.yml` runs `node docs/research/02-light-aircraft/scripts/lm_ci.mjs` on
  changes to `docs/research/**` (lm_merge --strict, params-light.json up to date, lm_selftest, ls_tests, lh_tests,
  lo_tests; fails if a run changes a file in the repo). The scripts that fly
  cards run against the simulator commit pinned in `02-light-aircraft/scripts/sim-snapshot.json` (src/ and
  test/harness.mjs extracted to a temp folder through `AIRFIELDLAB_ROOT`), so a physics PR does not move them;
  results go to `$LM_OUT_DIR`, never into the repo. `lm_ci.mjs --root .` runs the same checks on the working tree.
  After a physics change, re-pin the commit and move the expected values in one PR (`lm_selftest` T-LM-32 checks
  that the scripts' copies of `stallBlend` and `Evaluator.score` still match the pinned sim).
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
- Runways, lights, navaids: AIP Thailand AD 2 VTBD, AIRAC 14 MAY 2026 (https://aip.caat.or.th).
- Taxiways, aprons, buildings, water, golf course, land use: OpenStreetMap map renders captured and vectorised
  by the scripts in `tools/` (the source captures are not included; regenerate only if the layout must change).
- `city.json`: base64 records, generated buildings (9 bytes each) and street lights (5 bytes each); the artifact
  host refuses `.bin`, so binary data travels inside JSON.

## Working in the cloud (Claude Code on the web)
- The owner works from the cloud so their computer can stay off. Test changes on the GitHub Pages site:
  `.github/workflows/pages.yml` runs all tests and the build for pull requests into `main` (a check on the PR,
  nothing deployed) and for every push to `main`, which then deploys. The job stops after 15 min.
  One-time setup in the repo: Settings → Pages → Source: GitHub Actions.
- Work on a branch and open a pull request for anything that changes the flight model, so the owner can try it
  before merging.

## Publishing
- Live as a claude.ai artifact (multi-file: index.html + the four data files), title "Airfield Lab ดอนเมือง VTBD",
  slug f3207a70-5bd7-43d8-a606-a2b9b946413a, `downloads` capability declared for the PNG snapshot button.
- The earlier fictional-airfield prototype is a separate artifact (827d3f8b-1c74-4a51-b9e5-6ef7ea33b59c).
