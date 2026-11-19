// AirfieldLab research round 2, topic 09 (procedures), code LO.
// Pure functions, Node >= 18, no dependencies, no DOM:
//   1. makeCircuit(p)      generic training-circuit generator (runway frame -> waypoints, heights, speeds)
//   2. toNE(c, end, side)   place a circuit on a real runway end (RWY_END from the AirfieldLab harness)
//   3. gateCheck(s, g)      light-aircraft stabilised-approach gate check
//   4. checklistFor(t), checklistAudit(...), phaseOf(...)   checklist-state logic
//   5. TYPES                per-type procedure numbers used by the scripts (sources in 09-procedures.md, [LOn])
// Frames: runway frame x = metres along the landing direction from the landing threshold (negative = before
// the threshold), y = metres to the RIGHT of the landing direction, h = metres above the runway (AGL).
// Speeds in kt IAS; at VTBD (9 ft) IAS ~ TAS within the accuracy of these rules (labelled as an estimate).

export const KT = 0.514444, FT = 0.3048, NM = 1852, SM = 1609.344, G0 = 9.80665, DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Level-turn radius [m] for true airspeed V [kt] and bank phi [deg]: R = V^2 / (g tan(phi)). */
export const turnRadius = (Vkt, phiDeg) => (Vkt * KT) ** 2 / (G0 * Math.tan(phiDeg * DEG));

/** Default downwind offset [m] (estimate, LO0): D = clamp(2 R(V_dw, phi) + 400 m, 0.5 sm, 1.0 sm).
 *  0.5-1 mile is the AFH range [LO3 p8-3]; the 2R + 400 m term keeps a straight crosswind leg of >= 400 m. */
export const defaultOffset = (Vdw, phiDeg) => clamp(2 * turnRadius(Vdw, phiDeg) + 400, 0.5 * SM, 1.0 * SM);

/** 3-degree descent rate [fpm] from ground speed [kt] (exact) and the AC 91-79A rule of thumb (5 x GS). */
export const sinkForPath = (GSkt, gpDeg = 3) => GSkt * KT * Math.tan(gpDeg * DEG) / FT * 60;

/**
 * Generic rectangular training circuit.
 * p = { L (m, departure end of the runway, x), aim (m, aim point past threshold), side ('L'|'R'),
 *       hP_ft (circuit height AGL), gpDeg (final path, deg), rolloutFt (height at roll-out on final),
 *       baseRule ('gate' -> final length from rolloutFt; '45' -> AFH 45-degree base point),
 *       D (downwind offset m, optional), bankDeg (circuit bank, default 25), finalBankDeg (default 20),
 *       V: {climb, downwind, abeam, base, final} kt, roc_fpm (climb rate), xLiftoff (m, x of lift-off),
 *       turnWithinFt (300: AIM/AC 90-66C crosswind turn within 300 ft of circuit height), minFinal (m, AIM 1/4 mile) }
 */
export function makeCircuit(p) {
  const q = { gpDeg: 3, rolloutFt: 400, baseRule: 'gate', bankDeg: 25, finalBankDeg: 20, turnWithinFt: 300, minFinal: 0.25 * SM, xLiftoff: 400, ...p };
  const s = q.side === 'R' ? 1 : -1;
  const hP = q.hP_ft * FT, tg = Math.tan(q.gpDeg * DEG);
  const Rcw = turnRadius(q.V.climb, q.bankDeg), Rdw = turnRadius(q.V.downwind, q.bankDeg);
  const Rb = turnRadius(q.V.abeam, q.bankDeg), Rf = turnRadius(q.V.base, q.finalBankDeg);
  const D0 = q.D ?? defaultOffset(q.V.downwind, q.bankDeg);
  const D = Math.max(D0, Rb + Rf + 200);             // keep a straight base leg of >= 200 m (estimate); widens fast types
  // upwind: climb gradient, crosswind turn beyond the departure end and within 300 ft of circuit height
  const grad = (q.roc_fpm * FT / 60) / (q.V.climb * KT);
  const xReach = q.xLiftoff + Math.max(0, hP - q.turnWithinFt * FT) / grad;
  const xCw = Math.max(q.L, xReach);                 // start of the crosswind turn
  const hCw = Math.min(hP, (xCw - q.xLiftoff) * grad);
  const XU = xCw + Rcw;                              // crosswind leg line x = XU
  // final and base
  let F, XB;
  if (q.baseRule === '45') { XB = -D; F = D - Rf; }
  else { F = q.rolloutFt * FT / tg - q.aim; XB = -(F + Rf); }
  const hRoll = (F + q.aim) * tg;                    // on the final path at roll-out
  const baseAngleDeg = Math.atan2(D, -XB) / DEG;      // angle of the threshold behind the wing at the base turn (AFH: ~45)
  // descent from abeam threshold (x = 0) to roll-out, rounded corners of radius Rb (downwind->base) and Rf (base->final)
  const S1 = F + D + 2 * Rf - (2 - Math.PI / 2) * (Rb + Rf);  // square path (F + Rf) + D + Rf minus (2 - pi/2) R per rounded corner
  const g1 = (hP - hRoll) / S1;
  const hBaseTurn = hP - g1 * (-(XB + Rb));           // at start of the downwind->base turn
  const hFinalTurn = hRoll + g1 * (Math.PI / 2 * Rf);  // at start of the base->final turn
  const vs = (V, g) => -(V * KT * g) / FT * 60;
  // leg lengths [m] (straight parts + turns), times [s] at the leg speeds, no wind
  const legs = [
    { k: 'upwind', len: xCw - q.xLiftoff, V: q.V.climb },
    { k: 'crosswind', len: Math.PI / 2 * Rcw + Math.max(0, D - Rcw - Rdw) + Math.PI / 2 * Rdw, V: q.V.climb },
    { k: 'downwind', len: Math.max(0, XU - Rdw - 0) + (0 - (XB + Rb)), V: q.V.downwind },
    { k: 'base', len: Math.PI / 2 * Rb + Math.max(0, D - Rb - Rf) + Math.PI / 2 * Rf, V: q.V.base },
    { k: 'final', len: F + q.aim, V: q.V.final },
  ];
  legs.forEach((l) => { l.t = l.len / (l.V * KT); });
  const wp = [
    { k: 'liftoff', x: q.xLiftoff, y: 0, h: 0 },
    { k: 'crosswind_turn', x: xCw, y: 0, h: hCw },
    { k: 'downwind_join', x: XU, y: s * D, h: hP },
    { k: 'abeam_threshold', x: 0, y: s * D, h: hP },
    { k: 'base_turn', x: XB + Rb, y: s * D, h: hBaseTurn },
    { k: 'final_turn', x: XB, y: s * Rf, h: hFinalTurn },
    { k: 'rollout', x: -F, y: 0, h: hRoll },
    { k: 'aim', x: q.aim, y: 0, h: 0 },
  ];
  return {
    p: q, s, D, widened: D > D0, Rcw, Rdw, Rb, Rf, F, XB, XU, xCw, hCw, hRoll, hRollFt: hRoll / FT, baseAngleDeg,
    descentDeg: Math.atan(g1) / DEG, vsBase: vs(q.V.base, g1), vsFinal: vs(q.V.final, tg),
    finalOK: F >= q.minFinal, legs, timeS: legs.reduce((a, l) => a + l.t, 0), wp,
  };
}

/** Place a circuit on runway end E (RWY_END[id]: thr [n,e], u, r). Returns waypoints with n, e. */
export function toNE(c, E) {
  return c.wp.map((w) => ({ ...w, n: E.thr[0] + w.x * E.u[0] + w.y * E.r[0], e: E.thr[1] + w.x * E.u[1] + w.y * E.r[1] }));
}

/** Wind triangle for a leg flown on true track trk [deg] at TAS V [kt]; wind FROM wdir [deg] at W [kt].
 *  Returns crab [deg, + = nose right of track] and ground speed [kt]. */
export function windLeg(trk, V, wdir, W) {
  const rel = (wdir - trk) * DEG;                  // wind direction relative to the track
  const cross = W * Math.sin(rel);                 // + = wind from the right
  const head = W * Math.cos(rel);                  // + = headwind
  const crab = Math.asin(clamp(cross / V, -1, 1)) / DEG;
  return { crab, gs: V * Math.cos(crab * DEG) - head, cross, head };
}

// ───────────────────────── stabilised-approach gates (proposal, LO0) ─────────────────────────
// Heights: IMC 1000 ft, VMC straight-in 500 ft [LO4 p9-6][LO8][LO9]; VFR circuit of a light piston 300 ft [LO4 p9-6][LO18].
export const GATES = {
  imc: { h_ft: 1000, src: ['LO4', 'LO8', 'LO9'] },
  vmc_straight_in: { h_ft: 500, src: ['LO4', 'LO8', 'LO9'] },
  vfr_circuit: { h_ft: 300, src: ['LO4', 'LO18'] },
};
export const GATE_LIMITS = {
  spdLo: -5, spdHi: 10,        // kt about the gust-corrected target Vapp + add [LO4 p9-6][LO36 PA.IV.B.S7 "+10/-5 knots, with gust factor applied"]
  gustFrac: 0.5, gustMax: 10,  // add 1/2 gust factor [LO5 p9-20]; cap 10 kt (T-6 practice [LP20], estimate for all)
  sinkMax: 1000,               // fpm [LO8]
  bankMax: 15,                 // deg on final [LO4 p9-6]
  pathLo: 2.5, pathHi: 3.5,    // deg: PAPI not all-red / all-white (repo PAPI transitions 2.5 / 3.5)
  dots: 1,                     // ILS/RNP: within 1 dot of GS and LOC [LO8]
};
export function gateFor(kind) { return GATES[kind]?.h_ft ?? null; }

/**
 * s = { ias, vs_fpm (negative = down), bank, pathDeg (elevation angle of the aim point, deg) or gsDots, locDots,
 *       flaps (detent name), gearDown (bool), gust (kt) }
 * t = { Vapp, landingFlaps: [names], retract: bool }
 */
export function gateCheck(s, t, L = GATE_LIMITS) {
  const add = Math.min(L.gustMax, L.gustFrac * (s.gust || 0));
  // review 2026-11-19: the ACS applies the +10/-5 tolerance to the gust-corrected target, so BOTH bounds move by `add`
  // (the first draft moved only the upper bound, which let a gusty approach pass 5 kt below the corrected target).
  const items = {
    spd: s.ias >= t.Vapp + add + L.spdLo && s.ias <= t.Vapp + add + L.spdHi,
    sink: s.vs_fpm >= -L.sinkMax,
    bank: Math.abs(s.bank) <= L.bankMax,
    path: s.gsDots != null ? Math.abs(s.gsDots) <= L.dots : s.pathDeg >= L.pathLo && s.pathDeg <= L.pathHi,
    lat: Math.abs(s.locDots ?? 0) <= L.dots,
    cfg: t.landingFlaps.includes(String(s.flaps)) && (!t.retract || !!s.gearDown),
  };
  const fails = Object.keys(items).filter((k) => !items[k]);
  return { ok: fails.length === 0, items, fails, window: [t.Vapp + add + L.spdLo, t.Vapp + add + L.spdHi] };
}

// ───────────────────────── checklist-state logic (proposal, LO0) ─────────────────────────
// Phase list (own words). Items are generic; features switch type-specific items on or off.
const ITEM = (id, th, when = () => true) => ({ id, th, when });
const LIB = {
  before_takeoff: [
    ITEM('doors', 'ประตูและเข็มขัดนิรภัย'), ITEM('controls', 'คันบังคับขยับได้อิสระและถูกทิศ'),
    ITEM('instruments', 'เครื่องวัดและตั้งค่า altimeter (QNH)'), ITEM('fuel', 'เลือกถังเชื้อเพลิงและปริมาณ'),
    ITEM('mixture', 'mixture ตามความสูง', (f) => f.mixture), ITEM('runup_mag', 'ทดสอบ magneto ตามรอบที่ POH กำหนด', (f) => f.mags),
    ITEM('fadec_test', 'ทดสอบ FADEC / ECU', (f) => f.fadec), ITEM('prop_cycle', 'ทดสอบ governor ใบพัด', (f) => f.csProp && !f.fadec && !f.turboprop),
    ITEM('carb_heat_check', 'ทดสอบ carburettor heat', (f) => f.carb), ITEM('trim', 'ตั้ง trim สำหรับวิ่งขึ้น'),
    ITEM('flaps_to', 'แฟลปตำแหน่งวิ่งขึ้น'), ITEM('engine_fail_brief', 'ทบทวนการทำเมื่อเครื่องดับหลังวิ่งขึ้น (ความเร็วร่อน/จุดลง)', (f) => !f.twin),
    ITEM('oei_brief', 'ทบทวน VMCA / VYSE และลำดับเมื่อเครื่องหนึ่งดับ', (f) => f.twin), ITEM('pcl_ignition', 'PCL / ignition / trim อัตโนมัติตามแบบ', (f) => f.turboprop),
    ITEM('transponder_lights', 'transponder, ไฟ และ clearance'),
  ],
  takeoff: [ITEM('power_full', 'กำลังเต็มและตรวจค่าเครื่อง'), ITEM('rotate', 'ยกล้อที่ VR'), ITEM('climb_speed', 'ไต่ที่ Vy (หรือ Vx ถ้ามีสิ่งกีดขวาง)')],
  after_takeoff: [ITEM('gear_up', 'ล้อขึ้นเมื่อไต่ได้แน่นอนและเหลือทางวิ่งไม่พอลง', (f) => f.retract), ITEM('flaps_up', 'เก็บแฟลปที่ความเร็ว/ความสูงที่กำหนด'), ITEM('climb_power', 'กำลังไต่และ mixture/prop ตามแบบ')],
  cruise: [ITEM('cruise_power', 'ตั้งกำลังเดินทางและ lean'), ITEM('fuel_mgmt', 'สลับถัง/ตรวจเชื้อเพลิง')],
  descent: [ITEM('atis_qnh', 'ฟัง ATIS ตั้ง QNH'), ITEM('brief_arrival', 'ทบทวนการเข้าวงจรและทางวิ่ง'), ITEM('carb_heat_descent', 'carburettor heat ตามต้องการเมื่อลดกำลัง', (f) => f.carb)],
  before_landing: [
    ITEM('fuel_sel', 'เลือกถังเชื้อเพลิง / fuel pump ตามแบบ'), ITEM('mixture_rich', 'mixture rich', (f) => f.mixture),
    ITEM('prop_high', 'ใบพัดรอบสูง', (f) => f.csProp && !f.fadec), ITEM('gear_down', 'ล้อลงและล็อก (ไฟเขียว 3 ดวง)', (f) => f.retract),
    ITEM('carb_heat_on', 'carburettor heat ตามที่ POH ให้', (f) => f.carb), ITEM('flaps_app', 'แฟลปตามขาของวงจร'),
    ITEM('lights_belts', 'ไฟลงจอด เข็มขัด'), ITEM('landing_clearance', 'ได้รับอนุญาตลงจอด'),
  ],
  final: [ITEM('gear_recheck', 'ยืนยันล้อลงอีกครั้งบน final', (f) => f.retract), ITEM('stable', 'ตรวจ stabilised ที่ประตู'), ITEM('flaps_land', 'แฟลปลงจอด')],
  after_landing: [ITEM('flaps_up_gnd', 'เก็บแฟลปเมื่อพ้นทางวิ่ง'), ITEM('transponder_gnd', 'transponder / ไฟ ตามขั้นตอนภาคพื้น'), ITEM('carb_cold', 'carburettor heat ปิด', (f) => f.carb)],
  emergency_efato: [
    ITEM('pitch_glide', 'ลดหัวเครื่องทันทีให้ได้ความเร็วร่อนของแบบ', (f) => !f.twin), ITEM('land_ahead', 'เลือกที่ลงด้านหน้า หักเลี้ยวเพียงเล็กน้อย', (f) => !f.twin),
    ITEM('secure', 'ตัดเชื้อเพลิง/ไฟ ตามลำดับของแบบเมื่อแน่ใจว่าลงได้', (f) => !f.twin),
    ITEM('control_vyse', 'คุมทิศด้วย rudder ไม่ให้ต่ำกว่า VMCA แล้วรักษา VYSE', (f) => f.twin), ITEM('power_max', 'กำลังเต็มทั้งสองเครื่อง', (f) => f.twin),
    ITEM('clean_up', 'ล้อขึ้น แฟลปขึ้น', (f) => f.twin), ITEM('identify_verify', 'ระบุเครื่องที่ดับ (dead foot) และยืนยันด้วยคันเร่ง', (f) => f.twin),
    ITEM('feather_secure', 'feather และ secure เครื่องที่ดับ', (f) => f.twin),
  ],
};
export function checklistFor(t) {
  const f = t.features; const out = {};
  for (const [ph, items] of Object.entries(LIB)) out[ph] = items.filter((i) => i.when(f)).map((i) => ({ id: i.id, th: i.th }));
  return out;
}
/** Phase from a sim state (no hysteresis; the sim should add one). s = {onGround, gs, ias, h_ft, vs_fpm, leg} */
export function phaseOf(s) {
  if (s.onGround) return s.gs < 1 ? 'parked' : s.ias > 35 && s.thrHigh ? 'takeoff' : s.wasAirborne ? 'after_landing' : 'taxi';
  if (s.leg === 'final') return 'final';
  if (s.leg === 'downwind' || s.leg === 'base') return 'before_landing';
  if (s.vs_fpm > 300) return s.h_ft < 1000 && s.leg === 'upwind' ? 'after_takeoff' : 'climb';
  if (s.vs_fpm < -300) return 'descent';
  return 'cruise';
}
/** Audit checklist completion: done = {itemId: waypointIndexWhenDone}; deadline per phase as waypoint index. */
export function checklistAudit(t, done, deadlines = { before_landing: 'abeam_threshold', final: 'gate' }, order = ['downwind_join', 'abeam_threshold', 'base_turn', 'final_turn', 'gate', 'aim']) {
  const list = checklistFor(t); const res = { missing: [], late: [] };
  for (const [ph, dl] of Object.entries(deadlines)) for (const it of list[ph]) {
    if (!(it.id in done)) res.missing.push(it.id);
    else if (order.indexOf(done[it.id]) > order.indexOf(dl)) res.late.push(it.id);
  }
  return res;
}

// ───────────────────────── per-type numbers used by the scripts ─────────────────────────
// V: circuit speeds kt IAS (climb = Vy or school climb speed, downwind, abeam, base, final = Vapp).
// flaps: detent per point; est = true where the circuit speeds are estimates (method in 09-procedures.md §09.1.5).
// roc_fpm: sea-level rate of climb used only to find where the circuit height is reached on the upwind leg. Sources:
// c172s 730 / c172r 720 / c152 715 (POH Sec 5, via the card topics), da40ng 651 at MTOM [LD3] (review: was 900),
// da42ng 1,180 [LT2] (review: was 1,100), p2006t 1,000 (card 12: 1,036-1,105); the other values are estimates (est).
// On the long VTBD runways every type reaches circuit height before the departure end, so roc_fpm does not change
// any VTBD result (crosswind turn = runway end, T-LO-08).
export const TYPES = {
  c172s: { name: 'Cessna 172S', V: { climb: 74, downwind: 90, abeam: 85, base: 75, final: 65 }, roc_fpm: 730, Vref_short: 61, flapsAt: { abeam: '10', base: '20', final: '30' }, landingFlaps: ['20', '30'], features: { retract: false, twin: false, carb: false, mixture: true, mags: true, csProp: false }, src: ['LC1', 'LO17', 'LO18'], est: false },
  c172r: { name: 'Cessna 172R', V: { climb: 79, downwind: 90, abeam: 80, base: 70, final: 65 }, roc_fpm: 720, Vref_short: 62, flapsAt: { abeam: '10', base: '20', final: '30' }, landingFlaps: ['20', '30'], features: { retract: false, twin: false, carb: false, mixture: true, mags: true, csProp: false }, src: ['LO20'], est: true },
  c152: { name: 'Cessna 152', V: { climb: 67, downwind: 80, abeam: 70, base: 65, final: 60 }, roc_fpm: 715, Vref_short: 54, flapsAt: { abeam: '10', base: '20', final: '30' }, landingFlaps: ['20', '30'], features: { retract: false, twin: false, carb: true, mixture: true, mags: true, csProp: false }, src: ['LO19'], est: true },
  pa28_161: { name: 'Piper PA-28-161', V: { climb: 79, downwind: 90, abeam: 80, base: 75, final: 70 }, roc_fpm: 640, Vref_short: 65, flapsAt: { abeam: '10', base: '25', final: '40' }, landingFlaps: ['25', '40'], features: { retract: false, twin: false, carb: true, mixture: true, mags: true, csProp: false }, src: ['LO21', 'LO22'], est: true },
  da40ng: { name: 'Diamond DA40 NG', V: { climb: 72, downwind: 95, abeam: 78, base: 78, final: 76 }, roc_fpm: 651, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: false, twin: false, carb: false, mixture: false, mags: false, fadec: true, csProp: true }, src: ['LD3'], est: true },
  da42ng: { name: 'Diamond DA42 NG', V: { climb: 90, downwind: 110, abeam: 100, base: 95, final: 84 }, roc_fpm: 1180, Vref_short: null, flapsAt: { abeam: 'APP', base: 'APP', final: 'LDG' }, landingFlaps: ['LDG', 'APP'], features: { retract: true, twin: true, carb: false, mixture: false, mags: false, fadec: true, csProp: true }, VYSE: 85, VMCA: 76, src: ['LT2', 'LT9', 'LO7'], est: true },
  // Thai-school sub-variants (added in review 2026-11-19, topic 02 §02.5.3). Without their own block they would inherit the
  // FADEC checklist of da40ng through _inherits, which is wrong for the Lycoming DA40. Speeds from the topic 05/06 cards.
  da40_180: { name: 'Diamond DA40 (IO-360, 180 hp)', V: { climb: 67, downwind: 95, abeam: 80, base: 78, final: 73 }, roc_fpm: 780, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: false, twin: false, carb: false, mixture: true, mags: true, csProp: true }, src: ['LD6', 'LD8'], est: true },
  da40d: { name: 'Diamond DA40 D (TAE 125)', V: { climb: 66, downwind: 90, abeam: 78, base: 76, final: 71 }, roc_fpm: 550, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: false, twin: false, carb: false, mixture: false, mags: false, fadec: true, csProp: true }, src: ['LD8', 'LD6'], est: true },
  da42_tae125: { name: 'Diamond DA42 (TAE 125, TDI)', V: { climb: 79, downwind: 105, abeam: 95, base: 90, final: 82 }, roc_fpm: 1100, Vref_short: null, flapsAt: { abeam: 'APP', base: 'APP', final: 'LDG' }, landingFlaps: ['LDG', 'APP'], features: { retract: true, twin: true, carb: false, mixture: false, mags: false, fadec: true, csProp: true }, VYSE: 82, VMCA: 68, src: ['LT3', 'LT5'], est: true },
  be76: { name: 'Beechcraft 76 Duchess', V: { climb: 85, downwind: 105, abeam: 90, base: 85, final: 80 }, roc_fpm: 1200, Vref_short: 76, flapsAt: { abeam: '10', base: '20', final: '35' }, landingFlaps: ['20', '35'], features: { retract: true, twin: true, carb: true, mixture: true, mags: true, csProp: true }, VYSE: 85, VMCA: 65, src: ['LO23', 'LO24'], est: false },
  p2006t: { name: 'Tecnam P2006T', V: { climb: 83, downwind: 100, abeam: 90, base: 80, final: 70 }, roc_fpm: 1000, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'FULL' }, landingFlaps: ['FULL', 'TO'], features: { retract: true, twin: true, carb: true, mixture: false, mags: true, csProp: true }, VYSE: 80, VMCA: 62, src: ['LO26', 'LO27'], est: true },
  p2002jf: { name: 'Tecnam P2002-JF', V: { climb: 68, downwind: 75, abeam: 65, base: 60, final: 50 }, roc_fpm: 800, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'LAND' }, landingFlaps: ['LAND', 'TO'], features: { retract: false, twin: false, carb: true, mixture: false, mags: true, csProp: false }, src: ['LO28', 'LO29', 'LO30'], est: true },
  p68c: { name: 'Partenavia P.68C', V: { climb: 90, downwind: 110, abeam: 100, base: 90, final: 75 }, roc_fpm: 1100, Vref_short: null, flapsAt: { abeam: '17', base: '30', final: '35' }, landingFlaps: ['30', '35'], features: { retract: false, twin: true, carb: false, mixture: true, mags: true, csProp: true }, VYSE: null, VMCA: 60, src: ['LO31', 'LO32'], est: true },
  t206h: { name: 'Cessna T206H', V: { climb: 90, downwind: 100, abeam: 90, base: 80, final: 70 }, roc_fpm: 1000, Vref_short: null, flapsAt: { abeam: '10', base: '20', final: 'FULL' }, landingFlaps: ['20', 'FULL'], features: { retract: false, twin: false, carb: false, mixture: true, mags: true, csProp: true }, src: ['LO33'], est: true },
  ct4: { name: 'PAC CT-4 (generic)', V: { climb: 85, downwind: 90, abeam: 80, base: 70, final: 60 }, roc_fpm: 1200, Vref_short: null, flapsAt: { abeam: 'TO', base: 'TO', final: 'FULL' }, landingFlaps: ['FULL', 'TO'], features: { retract: false, twin: false, carb: false, mixture: true, mags: true, csProp: true }, src: ['LO34'], est: true },
  pc7mk2: { name: 'Pilatus PC-7 MkII', V: { climb: 120, downwind: 140, abeam: 120, base: 110, final: 92 }, roc_fpm: 2000, Vref_short: null, flapsAt: { abeam: 'TO', base: 'LDG', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: true, twin: false, carb: false, mixture: false, mags: false, turboprop: true, csProp: true }, src: ['LP1', 'LP20'], est: true },
  pc9m: { name: 'Pilatus PC-9 M', V: { climb: 125, downwind: 150, abeam: 125, base: 115, final: 95 }, roc_fpm: 2500, Vref_short: null, flapsAt: { abeam: 'TO', base: 'LDG', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: true, twin: false, carb: false, mixture: false, mags: false, turboprop: true, csProp: true }, src: ['LP2', 'LP20'], est: true },
  // trainer_r2 (added in review 2026-11-19): AirfieldLab's own fictional trainer (AC in src/20-flight.js: Vref 88, Vapp 95;
  // topic 07 trainer_r2: VY 125, VS0 67.5 KCAS). Final = AC.Vapp; other legs by the §09.1.5 method (estimates, like pc9m).
  // Flap names map to the sim's AC.flaps: TO = 0.5, LDG = 1.0 (estimate).
  trainer_r2: { name: 'AirfieldLab trainer (fictional)', V: { climb: 125, downwind: 140, abeam: 120, base: 110, final: 95 }, roc_fpm: 4000, Vref: 88, Vref_short: null, flapsAt: { abeam: 'TO', base: 'LDG', final: 'LDG' }, landingFlaps: ['LDG', 'TO'], features: { retract: true, twin: false, carb: false, mixture: false, mags: false, turboprop: true, csProp: true }, src: ['LP27', 'LO0'], est: true },
  t6a: { name: 'Beechcraft T-6A', V: { climb: 140, downwind: 150, abeam: 120, base: 110, final: 100 }, roc_fpm: 3000, Vref_short: null, flapsAt: { abeam: 'TO', base: 'LDG', final: 'LDG' }, landingFlaps: ['LDG', 'TO', 'UP'], features: { retract: true, twin: false, carb: false, mixture: false, mags: false, turboprop: true, csProp: true }, src: ['LP15', 'LP20'], est: true },
};
