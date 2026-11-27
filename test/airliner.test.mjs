// The airliners trimmed in the landing configuration on the 3° glide path (plan C6, research round 3 task item 4, R3-4;
// docs/research/03-airliners.md): every experimental airliner card of plan C4 at the research's test conditions
// (T-R-10…T-R-12 ATR 72-600, T-B-08…T-B-10 737-800, T-L-07…T-L-11 A320/A321, T-H-05 A330-300) and at every mass the
// page offers at the approach speed of plan C5, as a regression lock in the manner of test/types.test.mjs: the base
// before any physics change for the airliners (phases K and L of the plan).
//
// The trim: Aircraft.trim of plan B2 (src/20-flight.js), with test/lib/fstd.mjs trim() (the one the plan text names, the
// port of the research's round 1 script) solved beside it on every trim of this file, and the two held to agree (α and δe
// within 1e-6 rad, throttle within 1e-6). Aircraft.trim leads because it is the trim the page flies (setApproach calls it
// at the start of every flight) and because it says when a root is not a trim: `ok` false with `why` (residual, elevator
// past its travel, wheels on the ground, past CLmax) and `limited` when the throttle needed is outside idle…1. fstd's
// trim() returns a residual only, so a trim held up by a stop would pass through it unnoticed. The conditions: wings level,
// no wind, air-path angle −3°, h 300 m above the field (out of ground effect: φGE ≥ 0.9998 on every type), the research's
// speed taken as EAS (KCAS at sea level, the research's own V: q̄, α, θ and the thrust do not depend on the height at a
// given EAS), landing gear down, flaps at the research's detent through the card's aero.legacy.flapMap (the research's
// own map: the lift increment over the landing detent's).
//
// A row that misses the research expectation at the research tolerance is a known gap (GAPS below): the research value
// goes to t.diagnostic, a regression band holds what the model does, and the entry names the cause and the plan item that
// should close it. Nothing is faked: a quantity the model does not have (the ATR's propeller torque) is not computed here;
// where the research's figure has a force behind it (the thrust the torque makes), that force is tested and the torque
// reading waits for its plan item. `AIRLINER_LOCK_PRINT=1 node --test test/airliner.test.mjs` prints LOCK and the gap
// pins as the current model gives them, for a physics PR that moves them on purpose (in the same commit, with the reason).
//
// Owner decision OD-A320-PITCH (decisions of phase C; plan C6 and K1): the A320 family's approach pitch is 2.5°, a
// temporary estimate (ค่าประมาณ) until a source is found, used for the expectations of T-L-07…T-L-09 (θ; T-L-10 and T-L-11
// are speeds and do not depend on it). The research's own expectations (θ 1.5 −1.0/+2.0 from the D-AIRE anchor [L35],
// which the research's reviewer says was recorded near 150 kt, not at VAPP) are tested as well.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { trim as fstdTrim } from './lib/fstd.mjs';
import { AIRLINER_IDS, research } from '../tools/aircraft/build_airliners.mjs';

const { AC, Aircraft, Approach, setAircraft, DEG, KT, G0 } = M;
const card = (id) => JSON.parse(fs.readFileSync(new URL(`../data/aircraft/${id}.json`, import.meta.url), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => setAircraft(trainer()));
const near = (x, want, tol, what) => assert.ok(Math.abs(x - want) <= tol, `${what}: ${x} (want ${want} ± ${tol})`);
const within = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} outside ${lo}…${hi}`);
const r = (x, n = 2) => (+x).toFixed(n);
const RHO_SL = 1.225;   // ISA sea level (kg/m³), the density at which an EAS is the TAS
const H = 300;          // m above the field

// The research ids a test names: "T-B-08/09" names T-B-08 and T-B-09. S is t.test that records them.
const NAMED = new Set();
const nameIds = (title) => { for (const m of title.matchAll(/T-([RBLH])-(\d\d(?:\/\d\d)*)/g)) for (const n of m[2].split('/')) NAMED.add(`T-${m[1]}-${n}`); };
const S = (t, title, fn) => { nameIds(title); return t.test(title, fn); };

// The card `id` at mass kg (the card's default when null), trimmed at `kt` (EAS), flaps at detent `conf` (the landing
// detent when null), gear down, air-path angle gammaDeg. Both trims; returns the numbers this file tests.
function trimAt(id, { kg = null, kt, conf = null, gammaDeg = -3 }) {
  const c = card(id);
  setAircraft(c, kg == null ? {} : { mass: kg });
  const fm = c.aero.legacy.v.flapMap, f = conf == null ? 1 : fm[conf];
  assert.ok(Number.isFinite(f), `${id}: detent ${conf} in aero.legacy.flapMap`);
  const ac = new Aircraft();
  ac.flaps = ac.cmd.flaps = f; ac.gearPos = 1; ac.cmd.gear = 1;
  const tas = kt * KT / Math.sqrt(ac.atm(H).rho / RHO_SL);
  const T = ac.trim({ h: H, tas, gammaA: gammaDeg * DEG });
  const F = fstdTrim(new Aircraft(), { ias: kt, h: H, flaps: f, gear: 1, gammaDeg });
  const W = AC.m * G0;
  return {
    id, kg: AC.m, kt, f, ok: T.ok, why: T.why, limited: T.limited, residual: T.residual,
    alpha: T.alpha / DEG, theta: T.th / DEG, de: T.de / DEG, thr: T.thr, thrust: ac.air.T, W, stall: ac.air.stall,
    phiGE: ac.air.phiGE, aWarn: AC.aWarn + AC.aWarnFlap * f,
    // sink rate at sea level (ISA SL, the research's own condition) read from the trimmed state: the NED down speed at h
    // brought to the same EAS (× √(ρ/ρ_SL)), fpm. It checks that the trim keeps the path the test asked for.
    sinkSL: ac.x[5] * Math.sqrt(ac.atm(H).rho / RHO_SL) * 60 / 0.3048,
    fstd: { dAlpha: Math.abs(F.alpha - T.alpha), dDe: Math.abs(F.de - T.de), dThr: Math.abs(F.thr - T.thr), residual: F.residual },
  };
}
// a trim of this file is a trim: Newton converged, inside every limit, both solvers on the same root
function isTrim(x, what) {
  assert.ok(x.ok && x.limited === null, `${what}: not a trim (why [${x.why}], throttle limited ${x.limited})`);
  assert.ok(x.fstd.residual < 1e-9 && x.fstd.dAlpha < 1e-6 && x.fstd.dDe < 1e-6 && x.fstd.dThr < 1e-6,
    `${what}: fstd trim() and Aircraft.trim disagree (${JSON.stringify(x.fstd)})`);
  assert.ok(x.phiGE > 0.9998, `${what}: in ground effect (φGE ${x.phiGE})`);
  assert.ok(x.alpha < x.aWarn, `${what}: α ${x.alpha}° at or past the stall-warning angle ${x.aWarn}°`);
}
const diag = (t, x) => t.diagnostic(`${x.id} ${r(x.kg, 0)} kg, ${r(x.kt, 1)} KEAS, f ${x.f}: α ${r(x.alpha, 3)}°, θ ${r(x.theta, 3)}°, δe ${r(x.de, 3)}°, throttle ${r(x.thr, 4)}, thrust ${r(x.thrust / 1000, 2)} kN (${r(x.thrust / x.W, 4)} W)`);

// The research's trim targets (validation.trim_targets of each params-<type>.json, read only): the conditions and the
// centres below must be the research's own numbers
const target = (id, key) => research(id).validation.trim_targets[key].v;

// The 1-g stall speed of the sim's own lift curve at flap position f (kt EAS): CLmax of the blend on the lift line (δe 0,
// q 0, α̇ 0, h 1,000 m, α 0…25° in steps of 0.01°), as test/r3cards.test.mjs and the research's l_speeds_clmax.mjs measure it
function vs1gModel(f) {
  let CL = 0;
  for (let i = 0; i <= 2500; i++) {
    const th = i * 0.01 * DEG, ac = new Aircraft(); ac.flaps = f; ac.gearPos = 1; ac.thr = 0; ac.de = 0;
    const d = { wow: [0, 0, 0], load: [0, 0, 0] };
    ac.x.set([0, 0, -1000, 60, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]); ac.deriv(ac.x, new Float64Array(13), d);
    CL = Math.max(CL, d.CL);
  }
  return Math.sqrt(2 * AC.m * G0 / (RHO_SL * AC.S * CL)) / KT;
}

// ───────────────────────── known gaps ─────────────────────────
// [what misses, the cause, the plan item that should close it (docs of the plan: phases K and L), the pinned value, band]
const OD_PITCH = { theta: 2.5, tol: 1.0 };   // OD-A320-PITCH: 2.5° ± 1.0° (the research's tolerance below its anchor), ค่าประมาณ
const GAPS = {
  'T-L-07': ['A320ceo θ 1.24° against OD-A320-PITCH 2.5 ± 1.0° (the research\'s own 1.5 −1.0/+2.0 passes)',
    'the legacy CL0 FULL, α* and Cm0/Cmflap of the A320 family are tied to the D-AIRE pitch of 1.5° (03-a320-a321.md, the reviewer\'s open point 1; l_aero_modes.mjs, l_legacy.mjs), so the trim sits near it; raising θ needs less lift at a given α in CONF FULL, a per-CONF CL0',
    'K1 (per-CONF aero tables; OD-A320-PITCH is retuned there, or in its own PR once a source is found)', 1.239, 0.02],
  'T-L-08': ['A320ceo CONF 3 θ 3.16° against OD-A320-PITCH 2.5° + the research\'s 1.75° = 4.25 ± 1.0° (the research\'s own 3.25 ± 1.0 passes)',
    'the same fit as T-L-07: CONF 3 is the legacy line at f 0.647, so it follows the FULL anchor',
    'K1', 3.163, 0.02],
  'T-L-09': ['A321ceo θ 1.24° against OD-A320-PITCH 2.5 ± 1.0° (the research\'s own 1.5 −1.0/+2.0 passes)',
    'the A321 legacy set is anchored to the same D-AIRE 1.5° (it is the A321ceo of [L35])',
    'K1', 1.240, 0.02],
  'T-L-10': ['1.13 VS1g of the sim\'s lift curve at 73.69 t CONF 3 is 141.0 kt against 138 ± 2 (the card\'s VS0_kt table gives 137.0 and passes)',
    'the legacy flap line is one f per detent: aero.legacy.flapMap gives CONF 3 the lift increment (f 0.647), and so the CLmax of the blend at f 0.647 is 2.336 where the research\'s CONF 3 CLmax is 2.447 (flapMap_byCLmax 0.717); one f cannot give both',
    'K1', 140.99, 0.2],
  'T-H-05': ['A330 thrust 99.7 kN (0.054 W) against 133 ± 15 kN (0.073 ± 0.008 W); α, θ and the sink rate pass',
    'the legacy polar of the A330 (CD0 0.022 + CDflap 0.05 + CDgear 0.014 + K (CL − 0.15)², K 0.041) gives L/D 9.3 at the trim CL (CL 1.499: CD 0.161, L/D 9.33) where the research\'s CONF FULL polar gives CD 0.189, L/D 7.99',
    'K1 (per-CONF ΔCD0 and K; plan O4 holds T-H-05 again for the A330 as the last type)', 99.66, 1.5],
};

// Readings the model does not have, so a test reads the force behind them instead (not a gap held by a pin: the stand-in
// passes; what waits is the reading itself): [what is not read, the cause, the plan item that adds it]. Plan K4's own test
// list (T-R-01…T-R-04, T-R-27, T-R-20; research 03-airliners.md task item 11) holds neither T-R-10 nor T-R-11: the
// research names them for the torque model only in 01-atr72-600.md task items 3 and 6. So the list closes itself, as GAPS
// does: the ATR test below fails once the model has a torque or Np reading (`tq`, `torque`, `np`, `rpm` at the start of a
// field name of AC, the Aircraft or its air data), and its message says to test T-R-10 and T-R-11 on it then.
const UNREAD = {
  'T-R-10': ['torque per engine, 25 ± 3 % (100 % = 16,321 N m); the thrust behind it is tested',
    'the legacy thrust thr·thrustAvail(V) has no shaft, propeller or governor, so there is no torque or Np to read',
    'K4 (the ATR\'s two turboprops with TQ and Np: 03-airliners.md task item 11, 01-atr72-600.md task items 3 and 6; K4\'s test list must gain T-R-10 at 25 ± 3 %)'],
  'T-R-11': ['the torque change per degree of path, 5 ± 2 %; the relative thrust change behind it is tested',
    'as T-R-10: no torque in the model', 'K4 (its test list must gain T-R-11 at 5 ± 2 % per degree)'],
};
// the field names of AC, an Aircraft and its air data, two levels down (the readings a torque model would add)
const TORQUE_FIELD = /^(tq|torque|np|rpm)/i;
function torqueFields(ac) {
  const out = [];
  const walk = (o, path, depth) => {
    if (o === null || typeof o !== 'object' || ArrayBuffer.isView(o) || depth > 2) return;
    for (const k of Object.getOwnPropertyNames(o)) {
      if (TORQUE_FIELD.test(k)) out.push(`${path}.${k}`);
      walk(o[k], `${path}.${k}`, depth + 1);
    }
  };
  walk(AC, 'AC', 0); walk(ac, 'ac', 0);
  return out;
}

// ───────────────────────── ATR 72-600, 01-atr72-600.md ─────────────────────────
test('ATR 72-600 at 20,400 kg, 111 KEAS, flaps 30, gear down, γ −3° (01-atr72-600.md T-R-10…T-R-12)', async (t) => {
  const tg = target('atr72_600', 'approach_3deg');
  assert.deepEqual([tg.mass_kg, tg.VAPP_kt, tg.flap, tg.gear], [20400, 111, '30', 'down']);
  const x = trimAt('atr72_600', { kg: 20400, kt: 111, conf: '30' });
  isTrim(x, 'ATR'); diag(t, x);
  await S(t, 'T-R-12: θ within the FCTM\'s −2.5…+1° and −1.5 ± 1.0°; α 1.4 ± 1.0°', () => {
    assert.deepEqual([tg.theta_deg, tg.alpha_deg, ...tg.theta_range_FCTM], [-1.5, 1.4, -2.5, 1]);
    within(x.theta, -2.5, 1, 'θ (FCTM range)'); near(x.theta, -1.5, 1.0, 'θ'); near(x.alpha, 1.4, 1.0, 'α');
  });
  // T-R-10 and T-R-11 read torque per engine (%; 100 % = 16,321 N m at Np 100 %). Today's model has no torque: the legacy
  // thrust thr·thrustAvail(V) has no shaft, propeller or governor (plan K4, research item 11, gives it TQ and Np). What it
  // has is the force the torque makes. At a fixed speed and Np the shaft power, and so the torque, goes with T·V/η, with η
  // about constant over the small change of these rows: the thrust is tested here against the research model's own, with
  // the research's torque tolerance carried over in proportion (± 3 of 25 % = ± 12 %; a stand-in, ค่าประมาณ). The torque
  // reading itself waits for K4.
  await S(t, 'T-R-10 (the thrust behind the 25 ± 3 % torque; the torque reading waits for plan K4): thrust within 12 % of the research model\'s 15.04 kN (L/D 7.83, rrev_atr72.mjs)', (tt) => {
    assert.equal(tg.torque_pct, 25);
    // research 01-atr72-600.md, the reviewer's row for T-R-10/11/30: CD 0.2096, L/D 7.83 at this trim; T = W (cos γ / (L/D) − sin 3°)
    const Tres = x.W * (Math.cos(3 * DEG) / 7.83 - Math.sin(3 * DEG));
    tt.diagnostic(`thrust ${r(x.thrust / 1000, 3)} kN against ${r(Tres / 1000, 3)} kN of the research model (${r(100 * (x.thrust / Tres - 1), 2)} %)`);
    near(x.thrust, Tres, 0.12 * Tres, 'thrust (N)');
  });
  await S(t, 'T-R-11 (the thrust behind the torque change; the torque reading waits for plan K4): γ −2° and −4°, the thrust changes 0.20 ± 0.08 of itself per degree (FCTM 5 ± 2 % of 25 %)', (tt) => {
    assert.equal(tg.dTorque_per_deg_slope, 5);
    const a = trimAt('atr72_600', { kg: 20400, kt: 111, conf: '30', gammaDeg: -2 }), b = trimAt('atr72_600', { kg: 20400, kt: 111, conf: '30', gammaDeg: -4 });
    isTrim(a, 'ATR γ −2°'); isTrim(b, 'ATR γ −4°');
    const per = (a.thrust - b.thrust) / 2 / x.thrust;
    tt.diagnostic(`thrust ${r(a.thrust / 1000, 2)} / ${r(x.thrust / 1000, 2)} / ${r(b.thrust / 1000, 2)} kN at −2 / −3 / −4°: ${r(per, 4)} per degree (research model 6.27 % of 25.16 % = 0.249; FCTM 5 % of 25 % = 0.20)`);
    near(per, 0.20, 0.08, 'relative thrust change per degree');
  });
  // UNREAD closes itself: the day the model reads torque, this fails and T-R-10/11 are tested on the torque itself
  await S(t, 'T-R-10/11 torque reading (UNREAD, plan K4): the model still has no torque or Np to read', () => {
    const ac = new Aircraft(); ac.flaps = ac.cmd.flaps = card('atr72_600').aero.legacy.v.flapMap['30']; ac.gearPos = 1; ac.cmd.gear = 1;
    ac.trim({ h: H, tas: 111 * KT / Math.sqrt(ac.atm(H).rho / RHO_SL), gammaA: -3 * DEG });
    const found = torqueFields(ac);
    assert.deepEqual(found, [], `the model has a torque or Np reading now (${found.join(', ')}): test T-R-10 (torque 25 ± 3 % per engine at 20,400 kg, 111 KIAS, flaps 30) and T-R-11 (5 ± 2 % per degree of path) on it, add them to plan K4's test list, and take both off UNREAD`);
  });
});

// ───────────────────────── 737-800, 02-b737-800.md ─────────────────────────
test('737-800 at 60,000 kg, gear down, γ −3°: flaps 30 at Vref30 + 5 = 142.1 KEAS and flaps 40 at Vref40 + 5 = 137.1 KEAS (02-b737-800.md T-B-08…T-B-10)', async (t) => {
  const t30 = target('b737_800', 'approach_F30_Vref5'), t40 = target('b737_800', 'approach_F40_Vref5');
  assert.deepEqual([t30.mass_kg, t30.V_kt, t30.theta_deg, t30.alpha_deg, t30.thrust_total_kN], [60000, 142.1, 2.4, 5.4, 32.2]);
  assert.deepEqual([t40.mass_kg, t40.V_kt, t40.theta_deg], [60000, 137.1, 1.4]);
  const f30 = trimAt('b737_800', { kg: 60000, kt: 142.1, conf: '30' }), f40 = trimAt('b737_800', { kg: 60000, kt: 137.1, conf: '40' });
  isTrim(f30, '737 flaps 30'); isTrim(f40, '737 flaps 40'); diag(t, f30); diag(t, f40);
  await S(t, 'T-B-08: flaps 30, θ 2.4 ± 1.5°, α 5.4 ± 1.5°', () => { near(f30.theta, 2.4, 1.5, 'θ'); near(f30.alpha, 5.4, 1.5, 'α'); });
  await S(t, 'T-B-09: flaps 40, θ 1.4 ± 1.5°', () => near(f40.theta, 1.4, 1.5, 'θ'));
  await S(t, 'T-B-10: flaps 30, total thrust 32.2 ± 6.5 kN and 10 to 20 % of the total static thrust (2 × F00 of the default rating)', (tt) => {
    tt.diagnostic(`${r(f30.thrust / 1000, 2)} kN = ${r(100 * f30.thrust / AC.T0, 2)} % of ${r(AC.T0 / 1000, 1)} kN; flaps 40 ${r(f40.thrust / 1000, 2)} kN (research ${t40.thrust_total_kN}, no test)`);
    near(f30.thrust / 1000, 32.2, 6.5, 'thrust (kN)'); within(f30.thrust / AC.T0, 0.10, 0.20, 'share of the static thrust');
  });
});

// ───────────────────────── A320 and A321, 03-a320-a321.md ─────────────────────────
test('A320ceo at 64.5 t and A321ceo at 73 t, gear down, γ −3° (03-a320-a321.md T-L-07…T-L-09; OD-A320-PITCH)', async (t) => {
  const tF = target('a320ceo', 'approach_FULL_VAPP'), t3 = target('a320ceo', 'approach_CONF3_VAPP'), t21 = target('a321ceo', 'approach_FULL_VAPP');
  assert.deepEqual([tF.mass_kg, tF.V_kt, tF.alpha_deg, tF.theta_deg, tF.thrust_total_kN], [64500, 133.5, 4.5, 1.5, 51.2]);
  assert.deepEqual([t3.mass_kg, t3.V_kt, t3.theta_deg], [64500, 145.4, 3.25]);
  assert.deepEqual([t21.mass_kg, t21.V_kt, t21.theta_deg], [73000, 143.3, 1.5]);
  const full = trimAt('a320ceo', { kg: 64500, kt: 133.5, conf: 'FULL' }), c3 = trimAt('a320ceo', { kg: 64500, kt: 145.4, conf: 'CONF3' });
  const a321 = trimAt('a321ceo', { kg: 73000, kt: 143.3, conf: 'FULL' });
  for (const [x, w] of [[full, 'A320 FULL'], [c3, 'A320 CONF 3'], [a321, 'A321 FULL']]) { isTrim(x, w); diag(t, x); }
  // CG: the research's rows are at CG 30 % (T-L-07; T-L-11 at 22 %); the legacy coefficients of the cards stand for the
  // card's airframe.cg.ref_pctMAC (25 %): today's model has no CG term. Plan O4 (research R3-48) adds a CG choice of 20 to
  // 30 %MAC for the A330 (T-H-05 at 25 and 28 %); no plan item names one for the A320 family yet
  assert.equal(card('a320ceo').airframe.cg.ref_pctMAC.v, 25);
  await S(t, 'T-L-07 (research expectation): A320ceo FULL 133.5 KEAS, α 4.5 −1.0/+2.0°, θ 1.5 −1.0/+2.0°, thrust 51 ± 15 kN', () => {
    within(full.alpha, 3.5, 6.5, 'α'); within(full.theta, 0.5, 3.5, 'θ'); near(full.thrust / 1000, 51, 15, 'thrust (kN)');
  });
  await S(t, 'T-L-08 (research expectation): A320ceo CONF 3 145.4 KEAS, θ 3.25 ± 1.0° and θ(CONF 3) − θ(FULL) 1.75 ± 0.75°', (tt) => {
    tt.diagnostic(`CONF 3 thrust ${r(c3.thrust / 1000, 2)} kN (research ${t3.thrust_total_kN}, no test)`);
    near(c3.theta, 3.25, 1.0, 'θ CONF 3'); near(c3.theta - full.theta, 1.75, 0.75, 'θ(CONF 3) − θ(FULL)');
  });
  await S(t, 'T-L-09 (research expectation): A321ceo FULL 143.3 KEAS, θ 1.5 −1.0/+2.0°', () => within(a321.theta, 0.5, 3.5, 'θ'));
  const gap = async (id, x) => S(t, `T-L-${id.slice(-2)} known gap (OD-A320-PITCH ${OD_PITCH.theta}° ± ${OD_PITCH.tol}°, ค่าประมาณ; closes in ${GAPS[id][2].split(' ')[0]}): θ pinned at ${GAPS[id][3]}° ± ${GAPS[id][4]}°`, (tt) => {
    const want = id === 'T-L-08' ? OD_PITCH.theta + 1.75 : OD_PITCH.theta;
    tt.diagnostic(`${GAPS[id][0]}. Cause: ${GAPS[id][1]}. Item: ${GAPS[id][2]}. θ ${r(x.theta, 3)}° against ${want} ± ${OD_PITCH.tol}° (${Math.abs(x.theta - want) <= OD_PITCH.tol ? 'within: the gap is closed, move this row to a passing test' : 'outside'})`);
    assert.ok(Math.abs(x.theta - want) > OD_PITCH.tol, `${id}: the OD-A320-PITCH expectation is met now; take the row off GAPS and test it`);
    near(x.theta, GAPS[id][3], GAPS[id][4], 'θ (regression pin)');
  });
  await gap('T-L-07', full); await gap('T-L-08', c3); await gap('T-L-09', a321);
  // the A321neo at the same 73 t and 143.3 kt, information only: T-L-09 is the A321ceo of D-AIRE; the neo's CLmax FULL is
  // 3.05 (OD-A321NEO-CLMAX), so at the ceo's speed it flies 1.4° less α (at its own VAPP the LOCK rows below hold it)
  const neo = trimAt('a321neo', { kg: 73000, kt: 143.3, conf: 'FULL' }); isTrim(neo, 'A321neo FULL'); diag(t, neo);
});

test('A320ceo speeds of the model: 1.13 VS1g at 73.69 t CONF 3 and VS1g at 53.7 t FULL (03-a320-a321.md T-L-10, T-L-11)', async (t) => {
  const c = card('a320ceo'), fm = c.aero.legacy.v.flapMap;
  setAircraft(c, { mass: 73690 });
  const v3 = 1.13 * vs1gModel(fm.CONF3), tab3 = 1.13 * M.SPD.vs1g(AC.spd, 73690, 'CONF3');
  setAircraft(c, { mass: 53700 });
  const vF = vs1gModel(fm.FULL), tabF = M.SPD.vs1g(AC.spd, 53700, 'FULL');
  t.diagnostic(`1.13 VS1g CONF 3 at 73.69 t: lift curve ${r(v3, 2)} kt, card table ${r(tab3, 2)} kt; VS1g FULL at 53.7 t: lift curve ${r(vF, 2)} kt, card table ${r(tabF, 2)} kt (CG 22 % in the research; the model has no CG term, the card stands for 25 %, and no plan item names a CG choice for the A320 family yet)`);
  await S(t, 'T-L-11: VS1g FULL at 53.7 t is 96 ± 3 kt and under 99 kt (the stall warning of [L36]), on the lift curve and in the card\'s table', () => {
    near(vF, 96, 3, 'lift curve'); assert.ok(vF < 99, `lift curve ${vF}`);
    near(tabF, 96, 3, 'card table'); assert.ok(tabF < 99, `card table ${tabF}`);
  });
  await S(t, 'T-L-10 (the card\'s table): 1.13 VS1g CONF 3 at 73.69 t is 138 ± 2 kt (V2 of Safety First #05)', () => near(tab3, 138, 2, 'card table'));
  await S(t, `T-L-10 known gap (the sim's lift curve; closes in K1): 1.13 VS1g pinned at ${GAPS['T-L-10'][3]} ± ${GAPS['T-L-10'][4]} kt`, (tt) => {
    tt.diagnostic(`${GAPS['T-L-10'][0]}. Cause: ${GAPS['T-L-10'][1]}. Item: ${GAPS['T-L-10'][2]}.`);
    assert.ok(Math.abs(v3 - 138) > 2, 'T-L-10 on the lift curve is met now; take the row off GAPS and test it');
    near(v3, GAPS['T-L-10'][3], GAPS['T-L-10'][4], '1.13 VS1g (regression pin)');
  });
});

// ───────────────────────── A330-300, 04-a330-300.md ─────────────────────────
test('A330-300 at 187 t, FULL, gear down, VAPP 144 KEAS, γ −3° (04-a330-300.md T-H-05)', async (t) => {
  const tg = target('a330_300', 'approach_FULL_VAPP_187t');
  assert.deepEqual([tg.mass_kg, tg.V_kt, tg.alpha_deg, tg.theta_deg, tg.thrust_total_kN, tg.sink_fpm], [187000, 144, 5.71, 2.71, 133.3, 763]);
  const x = trimAt('a330_300', { kg: 187000, kt: 144, conf: 'FULL' });
  isTrim(x, 'A330'); diag(t, x);
  // the research's CG is 25 to 28 %; the card's legacy set stands for 25 % (no CG term in the model; plan O4, research
  // R3-48, adds a CG choice of 20 to 30 %MAC and tests T-H-05 at 25 and 28 %)
  assert.equal(card('a330_300').airframe.cg.ref_pctMAC.v, 25);
  await S(t, 'T-H-05: α 5.7 ± 0.5°, θ 2.7 ± 0.5°, sink rate 763 ± 10 fpm at sea level (from the trimmed state)', (tt) => {
    tt.diagnostic(`sink ${r(x.sinkSL, 1)} fpm at sea level`);
    near(x.alpha, 5.7, 0.5, 'α'); near(x.theta, 2.7, 0.5, 'θ'); near(x.sinkSL, 763, 10, 'sink (fpm)');
  });
  await S(t, `T-H-05 known gap (thrust; closes in K1): thrust pinned at ${GAPS['T-H-05'][3]} kN ± ${GAPS['T-H-05'][4]} %`, (tt) => {
    const kN = x.thrust / 1000, share = x.thrust / x.W;
    tt.diagnostic(`${GAPS['T-H-05'][0]}. Cause: ${GAPS['T-H-05'][1]}. Item: ${GAPS['T-H-05'][2]}. Thrust ${r(kN, 2)} kN, ${r(share, 4)} W`);
    assert.ok(Math.abs(kN - 133) > 15 && Math.abs(share - 0.073) > 0.008, 'T-H-05 thrust is met now; take the row off GAPS and test it');
    near(kN, GAPS['T-H-05'][3], GAPS['T-H-05'][4] / 100 * GAPS['T-H-05'][3], 'thrust kN (regression pin)');
  });
});

// ───────────────────────── the regression lock ─────────────────────────
// Every airliner card at every mass the page offers (airframe.weights.mass_options), at the approach speed the flight flies
// there (Approach of plan C5: calm air, autothrottle on, kt CAS taken as EAS), landing detent, gear down, γ −3°, h 300 m:
// [mass kg, Vapp kt, α°, θ°, δe°, throttle, thrust kN]. Every row must be a trim (isTrim). The pins hold the model as it is
// (measured 2026-11-27 on f338aa0, plan C5's head); a physics PR that moves them moves them here on purpose, with the
// reason. Bands, as types.test.mjs LOCK: 1.5 % with a floor of 0.02° on the angles (θ and δe pass through zero) and 0.002
// on the throttle; the thrust 1.5 %; Vapp ± 0.01 kt (plan C5's tables, exact). Today every row trims, inside its control
// limits, with the throttle between 0.15 and 0.34 and α at least 5° under the stall-warning angle.
const LOCK = {
  a320ceo: [[64500, 133.5, 4.2394, 1.2394, 1.4244, 0.30266, 50.596], [58100, 127.1, 4.117, 1.117, 1.5004, 0.26735, 45.467], [51600, 121.96, 3.4232, 0.42324, 1.9335, 0.23132, 39.877]],
  b737_800: [[66360, 143.9, 4.2494, 1.2494, 1.2182, 0.26665, 49.001], [65317, 142.83, 4.2344, 1.2344, 1.2266, 0.26171, 48.23], [59700, 136.76, 4.18, 1.18, 1.257, 0.23541, 44.083], [53100, 129.26, 4.1074, 1.1074, 1.2977, 0.20533, 39.211]],
  a320neo: [[67400, 136.4, 4.2591, 1.2591, 1.4122, 0.28794, 52.892], [60700, 129.7, 4.1812, 1.1812, 1.4606, 0.25365, 47.561], [53900, 123.34, 3.8263, 0.82631, 1.6815, 0.21945, 41.951]],
  a330_300: [[187000, 144, 5.5442, 2.5442, 1.1378, 0.20041, 99.663], [174000, 139.03, 5.513, 2.513, 1.1576, 0.18403, 92.725], [168300, 136.82, 5.4909, 2.4909, 1.1716, 0.17696, 89.682], [149600, 129.33, 5.4017, 2.4017, 1.2282, 0.15423, 79.698]],
  a321neo: [[79200, 144.2, 4.2859, 1.2859, 1.3208, 0.29802, 63.6], [77300, 142.3, 4.3322, 1.3322, 1.2907, 0.28948, 62.139], [71300, 137.04, 4.2195, 1.2195, 1.3639, 0.26208, 57.171], [63400, 129.4, 4.164, 1.164, 1.4, 0.22741, 50.774]],
  atr72_600: [[22350, 112, 2.7235, -0.2765, -1.6936, 0.33886, 16.106], [21850, 110.71, 2.7336, -0.26638, -1.7031, 0.32888, 15.744], [21000, 108.5, 2.7457, -0.25429, -1.7143, 0.31219, 15.129], [20100, 106.16, 2.742, -0.25796, -1.7109, 0.29495, 14.481], [17900, 100.2, 2.7346, -0.2654, -1.704, 0.25405, 12.897]],
  a321ceo: [[75500, 145.5, 4.3016, 1.3016, 1.201, 0.26551, 58.867], [68000, 138, 4.3253, 1.3253, 1.1855, 0.23447, 53.043], [60400, 130.4, 4.2241, 1.2241, 1.2521, 0.20373, 47.025]],
};
const BAND = [() => 0, () => 0.01, (v) => Math.max(0.02, 0.015 * Math.abs(v)), (v) => Math.max(0.02, 0.015 * Math.abs(v)), (v) => Math.max(0.02, 0.015 * Math.abs(v)), (v) => Math.max(0.002, 0.015 * Math.abs(v)), (v) => 0.015 * Math.abs(v)];
const COLS = ['mass', 'Vapp', 'α', 'θ', 'δe', 'throttle', 'thrust kN'];
const printed = [];
test('regression lock: every airliner trims at every offered mass at its Vapp, landing detent, gear down, γ −3°', async (t) => {
  assert.deepEqual(Object.keys(LOCK), AIRLINER_IDS);
  for (const id of AIRLINER_IDS) {
    await t.test(`${id}: ${LOCK[id].length} masses`, (tt) => {
      const c = card(id), rows = [];
      assert.deepEqual(c.airframe.weights.mass_options.v, LOCK[id].map((p) => p[0]), 'the offered masses');
      for (const kg of c.airframe.weights.mass_options.v) {
        setAircraft(c, { mass: kg });
        const vapp = new Approach({}).vapp, x = trimAt(id, { kg, kt: vapp });
        isTrim(x, `${id} ${kg} kg`); diag(tt, x);
        within(x.thr, 0.15, 0.34, `${id} ${kg} kg throttle`); assert.ok(x.aWarn - x.alpha >= 5, `${id} ${kg} kg: α ${x.alpha}° within 5° of the warning ${x.aWarn}°`);
        rows.push([kg, vapp, x.alpha, x.theta, x.de, x.thr, x.thrust / 1000]);
      }
      if (process.env.AIRLINER_LOCK_PRINT) printed.push(`  ${id}: [${rows.map((w) => `[${w.map((v) => +v.toPrecision(5)).join(', ')}]`).join(', ')}],`);
      const bad = [];
      rows.forEach((w, i) => w.forEach((v, j) => { const p = LOCK[id][i][j]; if (!(Math.abs(v - p) <= BAND[j](p))) bad.push(`${w[0]} kg ${COLS[j]}: ${v} against ${p} ± ${+BAND[j](p).toPrecision(2)}`); }));
      assert.equal(bad.length, 0, `moved: ${bad.join('; ')}`);
    });
  }
  setAircraft(trainer());
});

// ───────────────────────── the plan's list ─────────────────────────
test('plan C6: every id of its list is named by a test above; every known gap names its cause and a plan item', () => {
  const range = (pre, a, b) => Array.from({ length: b - a + 1 }, (_, k) => `${pre}-${String(a + k).padStart(2, '0')}`);
  const PLAN = [...range('T-R', 10, 12), ...range('T-B', 8, 10), ...range('T-L', 7, 11), 'T-H-05'];
  assert.deepEqual(PLAN.filter((id) => !NAMED.has(id)), [], 'an id of the plan list that no test names');
  for (const [id, [what, why, item, pin, band]] of Object.entries(GAPS)) {
    assert.ok(PLAN.includes(id) && what.length > 20 && why.length > 20 && /^[A-Z]\d/.test(item) && Number.isFinite(pin) && band > 0, `${id}: what, cause, plan item and pin`);
  }
  for (const [id, [what, why, item]] of Object.entries(UNREAD)) {
    assert.ok(PLAN.includes(id) && what.length > 20 && why.length > 20 && /^K4\b/.test(item), `${id}: what, cause and plan item`);
  }
});

after(() => {
  if (!process.env.AIRLINER_LOCK_PRINT) return;
  console.log(`const LOCK = {\n${printed.join('\n')}\n};`);
  for (const [id, x] of [['T-L-07', ['a320ceo', 64500, 133.5, 'FULL']], ['T-L-08', ['a320ceo', 64500, 145.4, 'CONF3']], ['T-L-09', ['a321ceo', 73000, 143.3, 'FULL']], ['T-H-05', ['a330_300', 187000, 144, 'FULL']]]) {
    const y = trimAt(x[0], { kg: x[1], kt: x[2], conf: x[3] });
    console.log(`GAP ${id} ${id === 'T-H-05' ? `thrust ${+(y.thrust / 1000).toPrecision(5)} kN` : `θ ${+y.theta.toPrecision(4)}°`}`);
  }
  setAircraft(card('a320ceo'), { mass: 73690 });
  console.log(`GAP T-L-10 1.13 VS1g ${+(1.13 * vs1gModel(card('a320ceo').aero.legacy.v.flapMap.CONF3)).toPrecision(5)} kt`);
  setAircraft(trainer());
});
