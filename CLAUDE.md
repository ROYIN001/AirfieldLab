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
- Build: `node build.mjs` → `dist/index.html`, and copies `data/` (sub-folders included) into `dist/`.
  `node build.mjs --preview <PR number>` builds a pull request's preview page into `dist-preview/pr-<n>/` and prints
  the Artifact `files` map (see "Preview each pull request").
- Run: `python3 -m http.server 8080 -d dist`, open http://localhost:8080 (needs HTTP: the page fetches its data).
- Tests (Node ≥ 22, no dependencies, `node:test` + `node:assert/strict`): `node --test "test/**/*.test.mjs"`
  (quote the glob: a bare `node --test` would also run `test/shots.mjs`, `test/harness.mjs`, `test/lib/*.mjs` and
  the research scripts under `docs/research/` whose names match Node's default test patterns).
  `geo` (AIP geometry), `flight` (start trim, parked, autoland per wind), `runways` (autoland on all four ends),
  `assist` (robot pilot in ASSIST and DIRECT), `stall` (CLmax and Vs, research T-A-01), `modes` (trim, linearise and
  MIL-F-8785C Level 1 modes with regression bands, research T-V-01…T-V-06), `keys` (keyboard map and key handling,
  research T-I-07 and T-I-08, and that `src/90-app.js` applies its decisions), `page` (parses the assembled page
  module and checks the element ids the scripts use; a build holds index.html and every data file the page fetches, in
  types and sizes the artifact host serves; the preview page only adds its title and badge; the `--preview` command
  line), `shots` (no machine paths under `test/`; the pinned three.js matches the import map and covers every file the
  page imports; both three.js cache folders sit inside the CI cache; the harness fails fast on an unpinned file,
  fetches through the proxy and seeds each flight), `visibility` (MOR helpers in `10-atmo.js`, research VIS-1…VIS-3,
  the haze mixed before the sRGB encode as one exact block, `SkySystem.applySunHaze` run on a stub sky, the dome's
  shader text, and that the sky, the fog, the lights, the sunlight and the visibility choices use them). Autoland
  score floors sit just under the values measured on 2026-11-19 (the assist robot's floor is a loose 50); touchdown
  points and every mode value have regression bands. A physics change that moves them updates the test in the same PR.
  `test/lib/fstd.mjs` holds `f9`, `trim`, `linearise`, `eig4`, `modes` (research round 1 §10.5).
  `test/harness.mjs` evaluates `10-atmo.js + 15-geo.js + 20-flight.js` with `new Function` in strict mode, and
  `test/keys.test.mjs` evaluates `18-keys.js` the same way, so those four files must stay DOM-free. `build.mjs`
  exports `assemble()`, `build()`, `dataFiles()`, `checkPr()` and `previewHtml()` for the page test.
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
| 10-atmo.js | pure: constants (KT, FT, NM, DEG, RAD, G0), USSA-1976 `atmosphere(h, isaDev)`, NOAA sun position, sky radiance, MOR visibility (`morBeta`, `hazeDepth`, `hazeDepthUp`, `skyHazeBeta`, `sunHazeT`) |
| 15-geo.js | pure: ARP, local projection `llToNE`/`neToLL`, `RWY_DATA` from AIP, derived `RUNWAYS` and `RWY_END[id]` |
| 18-keys.js | pure: `DEFAULT_KEYMAP` (physical key codes), `TOGGLE_ACTIONS`, `resolveKey`, `keymapProblems`, `isToggleEdge`, `KeyState` (held keys + keydown/keyup decisions; `app.keys`) |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC`, `Aircraft` (6-DOF), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
| 30-render.js | render frame `RW` (follows the active runway through `globalThis.__onRwy`), `W3(e,n,y)`, shared uniforms `SU`, shader patching `enhance()` (fog = MOR haze, `HAZE_GLSL`), `Batch` |
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

## Controls (current)
- Keyboard (physical keys, `KeyboardEvent.code`, so a Thai layout works; map in `src/18-keys.js`): W/S or ↑/↓
  pitch, A/D or ←/→ roll, Q/E rudder, = / - (or PageUp/PageDown, Numpad 9/3) throttle, B brake, C camera,
  T take control, P pause, R restart. No Ctrl, Meta or Alt in the map: pressing one releases every held flight key
  and keys pressed with one are ignored. Ctrl (the old throttle-down key) with W made Ctrl+W, which closes the
  Chrome tab before the page can block it (research round 1 §11.4.5). On macOS, Cmd's keyup also releases held keys
  (the browser sends no keyup for a key released while Cmd is down). C/T/P/R act once per press (key repeat
  ignored); while flying, bound keys do not scroll the page; held keys are released when the window loses focus or
  the tab is hidden. Keys ramp linearly
  (`readInputs` in 90-app.js: pitch 2.0/s, roll and rudder 2.5/s, release 5/s); research round 1 §11 finds the
  ramps too fast (its task list, item 10).
- Touch: virtual stick, throttle rail, brake button.

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
- Live as a claude.ai artifact (multi-file: index.html + the four data files), title "Airfield Lab ดอนเมือง VTBD",
  slug f3207a70-5bd7-43d8-a606-a2b9b946413a, `downloads` capability declared for the PNG snapshot button.
- The earlier fictional-airfield prototype is a separate artifact (827d3f8b-1c74-4a51-b9e5-6ef7ea33b59c).
- Pull request previews are separate private artifacts titled "พรีวิว PR #n · Airfield Lab ดอนเมือง VTBD". The live
  artifact is always republished from a plain `node build.mjs` (`dist/`), never from `dist-preview/`.
