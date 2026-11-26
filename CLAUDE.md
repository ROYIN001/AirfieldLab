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
  research T-I-07 and T-I-08, and that `src/90-app.js` applies its decisions), `input` (shaping, key ramps, the
  sub-frame key latch, the standard gamepad and source arbitration, research T-I-01…T-I-06, T-I-09…T-I-12 and T-C-14,
  phone tilt geometry and `TiltStick`, and that `src/90-app.js` reads the gamepad and the tilt through it), `page` (parses the assembled page
  module and checks the element ids the scripts use; a build holds index.html and every data file the page fetches, in
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
  `alsStands` against the real pavements; every flash seen at 20, 30 and 60 frames a second). Autoland
  score floors sit just under the values measured on 2026-11-19 (the assist robot's floor is a loose 50); touchdown
  points and every mode value have regression bands. A physics change that moves them updates the test in the same PR.
  `test/lib/fstd.mjs` holds `f9`, `trim`, `linearise`, `eig4`, `modes` (research round 1 §10.5).
  `test/harness.mjs` evaluates `10-atmo.js + 15-geo.js + 18-keys.js + 20-flight.js + 25-input.js` with
  `new Function` in strict mode, `test/keys.test.mjs` evaluates `18-keys.js` and `test/siting.test.mjs` evaluates
  `17-siting.js` the same way, so those six files must stay DOM-free. The siting and lights tests also evaluate `48-data.js` and `60-lights.js`:
  these two may use three.js and the DOM inside their functions, never at the top level. `test/lib/png.mjs` reads the
  land-use PNGs (8-bit greyscale) with `node:zlib`. `build.mjs` exports `assemble()`, `build()`, `dataFiles()`,
  `checkPr()` and `previewHtml()` for the page test.
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
| 17-siting.js | pure: where something tall may stand: obstacle limitation surfaces `olsHeight(e, n)`, approach light lanes `alsLaneOf`, `ALS` (length and spacing per system), `RWY_PAD`, `TWY_W`, `SiteIndex` (clearances from buildings, decks, aprons, taxiways, water; the land-use class under a point), `STATIONS` and `stationSites(af)`, `mappedSite`, `placeTrees`, `siteBuildings` (`buildingProblem`, `groundShare`); also `rwyST`, `rwyEN`, `onAnyRunway`, `pointInPoly`, `nearestOnLine`, `lineLength`, `pointAlong` |
| 18-keys.js | pure: `DEFAULT_KEYMAP` (physical key codes), `TOGGLE_ACTIONS`, `resolveKey`, `keymapProblems`, `isToggleEdge`, `KeyState` (held keys + keydown/keyup decisions + `frame()` with sub-frame taps; `app.keys`) |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC`, `Aircraft` (6-DOF), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
| 25-input.js | pure: `INPUT_CFG` (estimates from research §11), calibration and dead-zone helpers, `shapeAxis` / `shapeLever`, `keyRamp` + `KeyAxis`, `readPad` (W3C standard gamepad), `Arbiter` (last-moved source wins) + `InputAxis` (no jump on a switch), `TiltStick` (phone tilt), `PilotInput` (one frame from keys, pad, touch and tilt; `app.pin`) |
| 30-render.js | render frame `RW` (follows the active runway through `globalThis.__onRwy`), `W3(e,n,y)`, shared uniforms `SU`, shader patching `enhance()` (fog = MOR haze, `HAZE_GLSL`), `Batch` |
| 40-sky.js | sky dome, clouds, horizon fog palette, sun light and shadow box |
| 48-data.js | loads `vtbd_af.json`, `land_in.png`, `land_out.png`, `city.json` |
| 50-airfield.js | land-use bake on the GPU + ground shader, runway marking shader (per runway), taxiways, aprons, hold lines, terminal, towers, navaids, approach light stands, windsocks, masts |
| 55-city.js | instanced city buildings (those that pass `siteBuildings`), OSM footprints, tollway / SRT viaduct / BTS (`VIADUCT` deck sizes) + stations from `stationSites`, trees from `placeTrees`, parked airliners |
| 60-lights.js | point-sprite lights with directional colour (`LightSet`); `airfieldLights(field, data)` is the whole lighting layout as data, `alsStands(E)` the approach light stands, `taxiEdgeLights(af)` the places of the taxiway edge lights, `buildAirfieldLights` draws the lights |
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
