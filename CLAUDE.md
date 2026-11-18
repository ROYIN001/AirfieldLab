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
- Physics tests (Node ≥ 18, no dependencies; each prints its numbers and exits non-zero if a check fails):
  `node test/geo.test.mjs`, `input`, `engine`, `controls`, `config`, `stall`, `ground`, `validation`, `flight`,
  `runways`, `assist`, `handover`, `autoland` (all as `node test/<name>.test.mjs`; CI runs them all before
  deploying). `autoland` flies 160 approaches and takes about a minute; the others take a few seconds each.
  `test/harness.mjs` evaluates the pure files listed in its `PURE` array (`10-atmo`, `15-geo`, `16-engine`,
  `18-input`, `20-flight`) with `new Function`, so those files must stay DOM-free. Shared helpers: `test/lib/`
  (`check.mjs` assertions, `sim.mjs` trimmed states and runway starts, `linear.mjs` Jacobian and modes).
- Screenshots: `test/shots.mjs <set>` (Playwright + Chromium, SwiftShader). jsDelivr is blocked in cloud sessions,
  so give it a local three.js: `npm pack three@0.186.0`, unpack, then set `THREE_DIR`, `DIST_DIR`, `SHOTS_DIR`,
  `PW_REQUIRE` (folder whose `node_modules` holds playwright, e.g. `/opt/node-tools/node_modules/`) and
  `CHROME=` (empty = Playwright's own Chromium).

## Source layout (concatenated in this order into the `/*__APP__*/` marker of `src/template.html`)
| file | role |
|---|---|
| 00-head.js | three.js imports (OrbitControls, BufferGeometryUtils) |
| 10-atmo.js | pure: constants (KT, FT, NM, DEG, RAD, G0), USSA-1976 `atmosphere(h, isaDev)`, NOAA sun position, sky radiance |
| 15-geo.js | pure: ARP, local projection `llToNE`/`neToLL`, `RWY_DATA` from AIP, derived `RUNWAYS` and `RWY_END[id]` |
| 16-engine.js | pure: `ENG`, `PROP`, `Turboprop` (Ng spool, shaft power), `propeller(P, V, ρ)` (momentum theory + ηp(J), windmill drag) |
| 18-input.js | pure: `KeyAxis` (proportional key ramp, self-centring), `shapeAxis` (dead zone, expo, sensitivity), `readPad` (Gamepad API mapping), `pickInput` |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC`, runway surface friction, `Aircraft` (6-DOF, `trimFlight`), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
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
- Generic two-seat turboprop trainer (fictional): m 2250 kg, S 16.3 m², b 10.2 m, 700 kW flat-rated, prop 2.3 m at
  2,000 rpm, static thrust 12.4 kN (ISA SL). Limits are design values of this fictional type: VFE TO 150 / LDG 125,
  VLE 150 KIAS.
- Engine: Ng follows the lever through a fuel-schedule acceleration limit (idle → 90 % power ≈ 4 s, down ≈ 1 s);
  thrust from momentum theory with ηp(J); flight-idle blades windmill (idle glide ≈ 12.3 : 1).
- Power effects: slipstream dynamic pressure on tail (elevator/rudder) and wing root, swirl sidewash on the fin
  (fin offset 0.8°), P-factor, torque roll (half returned by the wing), gyroscopic precession. Full power at low
  speed pitches up, yaws and rolls left.
- Aero: linear derivatives in `AC`; stall by Beard–McLain blending per half span at its own α (roll rate, yaw
  rate, dihedral × sideslip, seeded ±0.4° asymmetry, `kAsym` 0.4) → wing drop and departure with pro-spin
  controls; elevator halves in the stall; ailerons weaken; buffet from `buffetAlpha(flaps)` (6–7 kt above Vs).
- Controls: reversible-control model (deflection per unit pilot force falls with q, `stickGain`), elevator trim,
  flaps UP/TO/LDG (9 s), gear 6 s with squat switch, flap blow-back above VFE (hinge load q·δf).
- Ground: progressive oleo struts; slip-angle tyre force in a friction circle; torque-limited brakes with wheel
  spin-down and lock; runway dry / wet (14 CFR 25.109(c)) / standing water (hydroplaning ≈ 9√p); nose-wheel
  steering 20° → 7° with speed, centred when the strut is extended; static friction (a spring–damper anchor per
  braked wheel) holds the aircraft still, up to about half power (at full power the prop wash unloads the mains
  and it slides); structure contact points (tail, prop, wing tips, belly) for strikes and gear-up landings; gear
  lowered while on or within 5 cm of the ground jams instead of pushing the airframe up.
- `Aircraft.trimFlight` solves the full 6-DOF trim (α, δe, lever or γ, β, δa, δr) by Newton iteration.
- Wind: 1/7-power shear + MIL-F-8785C Dryden turbulence (first-order).
- Autopilot: LOC/GS tracking with aileron/rudder integrators, flare, wing-low decrab, rollout, braking that backs
  off before the tyres lock (`brakeLikeAPilot`); target speed Vapp, Vref over the threshold, plus 0.2 × wind kt ×
  turbulence level (≤ 8 kt); gear only below VLO − 5 kt and each flap notch below its VFE − 5 kt. Hand-back in the
  air (`Flight.setPilot('ap')`): more than 300 m before the threshold it flies the approach (APP); closer, past it
  or after a touch-and-go it goes around (GA: full power and a 6° climb on the centre line, TO flaps above 85 kt,
  gear up once climbing above 30 m, levels at 300 m ≈ 1,000 ft at 105 KIAS); FLARE is kept only below 10 m and
  descending. Take-over carries the autopilot's trims into DIRECT. `PilotLaws`: ASSIST (attitude command, turn
  coordinator, auto-throttle, auto-brake) and DIRECT (pilot force through `stickGain`, manual trim, optional
  auto-trim on θ̇ and roll rate, rudder trim aid that centres the ball).
- Evaluator: stabilised gates at 500 and 200 ft, callouts, touchdown score (sink 40, position 25, centre line 15,
  speed 10, attitude 10). Touchdown window 300–600 m is "perfect". Deductions: flap or gear overspeed −8, skid −4;
  caps for strikes (tail 45, prop 25, wing tip 30) and belly landing (10); a crash scores 0. Event labels in
  `EVENT_TEXT`.
- Verified (`validation.test.mjs`, ISA SL): Vs1 75.4 / Vs0 69.5 KIAS (PC-9 M TCDS scaled: 75.3 / 67.5), climb
  3,772 fpm at 130 KIAS, take-off 216 m roll / 403 m over 50 ft (PC-9: 391 m), landing 704 m over 50 ft
  (PC-9: 700 m), MIL-F-8785C Class I Level 1 modes in Cat B and C.
- Autoland (`autoland.test.mjs`, 4 runways × 10 turbulence seeds; the app seeds every flight differently):
  calm 93–100 (mean 98), 10 kt headwind 88–100 (97), 10 kt crosswind from the right 87–97 (95), 15 kt gusty
  crosswind from the left 67–97 (89; the low scores touch down 5–10 m downwind of the centre line).

## Controls (current)
- Keyboard (physical keys, so a Thai layout works): W/S or ↑/↓ pitch, A/D or ←/→ roll, Q/E rudder — proportional:
  the longer the hold, the larger the input, re-centring on release. Shift / Z (or PgUp/PgDn, = / −) throttle.
  [ / ] trim nose down / up (also Home/End), F / V flaps down / up one notch, G gear, B both brakes, , / . left /
  right brake, C camera, T take control, P pause, R restart. Ctrl is not used: Ctrl+W/S/D are browser shortcuts.
- Gamepad (W3C standard mapping): left stick roll/pitch, right stick X rudder, right stick Y throttle rate, LT/RT
  toe brakes, LB/RB flaps, D-pad ↑/↓ trim, Y gear, X camera, A take control, Start pause, Back restart. Other
  joysticks: throttle and rudder axes chosen in the setup panel. Rumble for buffet and touchdown.
- Settings (setup panel, saved in localStorage `afl-input`): sensitivity, expo, dead zone; runway surface;
  auto-trim for DIRECT.
- Touch: virtual stick (expo applied), throttle rail, brake button, gear and flap buttons, trim buttons in DIRECT.
  Short landscape screens move the flap/gear buttons into a row and the ILS/PAPI widget left of the controls.
- Cues: TRQ / FLAP / GEAR / TRIM readouts, FMA shows BRK or SKID, callouts STALL, OVERSPEED, TOO LOW · GEAR,
  view shake in the buffet (off with reduced motion).

## Possible next steps
- Runway surface visuals for wet / standing water (the physics has them; the ground shader does not yet).
- A take-off / touch-and-go scenario (the physics and `onRunway` test helper already support it).
- Manual rudder and aileron trim switches (now: rudder trim aid, aileron auto-trim when enabled).
- Spin model beyond the incipient phase (rotary-balance data), propeller normal force at high power.

## Data provenance (data/)
- Runways, lights, navaids: AIP Thailand AD 2 VTBD, AIRAC 14 MAY 2026 (https://aip.caat.or.th).
- Taxiways, aprons, buildings, water, golf course, land use: OpenStreetMap map renders captured and vectorised
  by the scripts in `tools/` (the source captures are not included; regenerate only if the layout must change).
- `city.json`: base64 records, generated buildings (9 bytes each) and street lights (5 bytes each); the artifact
  host refuses `.bin`, so binary data travels inside JSON.

## Working in the cloud (Claude Code on the web)
- The owner works from the cloud so their computer can stay off. Test changes on the GitHub Pages site:
  every push to `main` runs `.github/workflows/pages.yml` (all physics tests, build, deploy).
  One-time setup in the repo: Settings → Pages → Source: GitHub Actions.
- Work on a branch and open a pull request for anything that changes the flight model, so the owner can try it
  before merging.

## Publishing
- Live as a claude.ai artifact (multi-file: index.html + the four data files), title "Airfield Lab ดอนเมือง VTBD",
  slug f3207a70-5bd7-43d8-a606-a2b9b946413a, `downloads` capability declared for the PNG snapshot button.
- The earlier fictional-airfield prototype is a separate artifact (827d3f8b-1c74-4a51-b9e5-6ef7ea33b59c).
