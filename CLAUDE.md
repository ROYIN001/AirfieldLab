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
- Physics tests (Node ≥ 18, no dependencies): `node test/geo.test.mjs`, `node test/flight.test.mjs`,
  `node test/runways.test.mjs`, `node test/assist.test.mjs`, `node test/stall.test.mjs`.
  `test/harness.mjs` evaluates `10-atmo.js + 15-geo.js + 20-flight.js` with `new Function`, so those three files must stay DOM-free.
- Screenshots: `test/shots.mjs <set>` (Playwright + Chrome, SwiftShader). Paths inside it point at the original
  cloud workspace (`/home/claude/...`, `/opt/npm-tools`, vendored three.js); adjust before use.

## Source layout (concatenated in this order into the `/*__APP__*/` marker of `src/template.html`)
| file | role |
|---|---|
| 00-head.js | three.js imports (OrbitControls, BufferGeometryUtils) |
| 10-atmo.js | pure: constants (KT, FT, NM, DEG, RAD, G0), USSA-1976 `atmosphere(h, isaDev)`, NOAA sun position, sky radiance |
| 15-geo.js | pure: ARP, local projection `llToNE`/`neToLL`, `RWY_DATA` from AIP, derived `RUNWAYS` and `RWY_END[id]` |
| 20-flight.js | pure: `FIELD` + active-runway frame (`setActiveRunway(id)`), `Wind` (shear + Dryden), `AC`, `Aircraft` (6-DOF), `Autopilot`, `PilotLaws`, `Evaluator`, `Recorder`, `SCENARIOS`, `Flight` |
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
- Verified: autoland on 21R, 21L, 03L, 03R in calm and 15 kt gusty crosswind, scores 94–100.

## Controls (current)
- Keyboard: W/S or ↑/↓ pitch, A/D or ←/→ roll, Q/E rudder, Shift/Ctrl throttle, B brake, C camera, T take control,
  P pause, R restart. Keys are binary (no proportional ramp yet).
- Touch: virtual stick, throttle rail, brake button.

## Next phase (owner's request): control feel and flight-physics realism
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
  every push to `main` runs `.github/workflows/pages.yml` (geo + runway tests, build, deploy).
  One-time setup in the repo: Settings → Pages → Source: GitHub Actions.
- Work on a branch and open a pull request for anything that changes the flight model, so the owner can try it
  before merging.

## Publishing
- Live as a claude.ai artifact (multi-file: index.html + the four data files), title "Airfield Lab ดอนเมือง VTBD",
  slug f3207a70-5bd7-43d8-a606-a2b9b946413a, `downloads` capability declared for the PNG snapshot button.
- The earlier fictional-airfield prototype is a separate artifact (827d3f8b-1c74-4a51-b9e5-6ef7ea33b59c).
