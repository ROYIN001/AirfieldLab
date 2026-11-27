#!/usr/bin/env node
// Aircraft cards for the simulator, generated from the round 2 research cards (plan C1; research round 2 task item 10,
// docs/research/02-light-aircraft.md). Node >= 22, no dependencies.
//
//   node tools/aircraft/build_cards.mjs                 writes data/aircraft/<id>.json for the six types and the seven
//                                                       experimental airliners of build_airliners.mjs (plan C4)
//   node tools/aircraft/build_cards.mjs --only c172s    writes one card
//   node tools/aircraft/build_cards.mjs --check         writes nothing; exit 1 when a file differs from what this
//                                                       script would write (each differing id and its first 10
//                                                       differing leaf paths; a missing file differs)
//
// Each card holds 45 copied leaves (COPIED: what acFromCard in src/20-flight.js reads, the speed table speeds.ias_cas
// (kt IAS → kt CAS), the flap detents, and the type's identity, MTOW, length and gear layout, which the selector text
// and the round 2 helpers use), copied with all seven fields {v, u, scope, src, conf, est, note} from the resolved
// round 2 card in docs/research/02-light-aircraft/params-light.json, and four generated leaves:
//  - aero.legacy gets the stall-warning angles aWarn and aWarnFlap, solved on the simulator's own trimmed lift curve
//    for a warning 7 kt above the 1-g stall (the T-A-07 method of test/stall.test.mjs), and the trainer's release
//    values aWarnHyst 0.5° and aWarnMinOn 0.5 s (plan A5);
//  - gear.legacy, when the research card has none: the three struts of round 2's lm_card.mjs buildAC (legacyGear);
//  - airframe.geometry.gsAntenna_pos_FRD: no source gives the glide-slope antenna, so it sits at the eye;
//  - thai_fleet: the civil schools and clubs in Thailand that fly the type, from common_light.thai_fleet.
// Inertia from class radii of gyration (lm_inertia.inertiaFromRadii) is written only when a card has none (none of the
// six today). Before it copies anything, prepare(id) applies the provenance fixes of the research's own rules (LM8:
// numbers read from the JSBSim bundle files are cited as such; 03-open-models.md: no number from a GPL model), so no
// FlightGear number and no LB19 code reaches a card.
// The cards depend on params-light.json; on the reference rows of the research topic files (docs/research/
// 02-light-aircraft/0x-*.md and 01-flight-physics/*.md), which give every _meta.sources entry its text and link; on the
// round 2 scripts lm_lib.mjs, lm_card.mjs and lm_inertia.mjs (type resolution, gear, inertia); on this script; and on
// the simulator's lift and pitch lines (the warning solve). A change to any of them regenerates the cards in the same
// pull request: test/cards.test.mjs runs --check, so the page workflow (pages.yml, every pull request into main) fails
// on a stale card, also for a research-only change. The script never writes data/aircraft/trainer.json, and the cards
// do not depend on it; it is read only because test/harness.mjs loads it at import (a broken trainer card stops this
// script too).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leaf, val, isObj, isLeaf, leafPaths, resolveType, loadBases, loadRefIndex, SRC_OWNER, R1_OWNER, isMainModule } from '../../docs/research/02-light-aircraft/scripts/lm_lib.mjs';
import { buildAC, detents, flapMap } from '../../docs/research/02-light-aircraft/scripts/lm_card.mjs';
import { inertiaFromRadii, RADII } from '../../docs/research/02-light-aircraft/scripts/lm_inertia.mjs';
import { M } from '../../test/harness.mjs';
import { AIRLINER_IDS, airlinerText } from './build_airliners.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const R2 = path.join(ROOT, 'docs', 'research', '02-light-aircraft');
const OUT = path.join(ROOT, 'data', 'aircraft');
const SELF = 'tools/aircraft/build_cards.mjs';

// The six types of plan C1, in the selector's order after the trainer (owner decision OD-TYPES, on the plan's advice)
export const TYPE_IDS = ['c172s', 'c172r', 'da42ng', 'da42_tae125', 'da40d', 'da40_180'];
const TOPIC = { c172s: '04-c172s.md', c172r: '10-c172r.md', da42ng: '06-da42.md', da42_tae125: '06-da42.md', da40d: '05-da40.md', da40_180: '05-da40.md' };

// The leaves copied from the research card (45 paths): what acFromCard reads, the speed table, the flap detents, and
// the identity, MTOW, length and gear layout (read by the selector text of src/22-types.js or by round 2's helpers)
const DER = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
export const COPIED = [
  'airframe.identity', 'airframe.weights.training_mass', 'airframe.weights.MTOW',
  ...['Ixx', 'Iyy', 'Izz', 'Ixz', 'ref_mass'].map((k) => 'airframe.inertia.' + k),
  'airframe.geometry.eye_pos_FRD', 'airframe.geometry.length',
  'aero.ref.S', 'aero.ref.b', 'aero.ref.c', 'aero.legacy', 'aero.flaps.detents', ...DER.map((k) => 'aero.derivatives.' + k),
  'propulsion.legacy', 'propulsion.layout',
  'controls.surfaces.elevator', 'controls.surfaces.aileron', 'controls.surfaces.rudder',
  'gear.layout', 'gear.legacy',
  'speeds.VS0_kt', 'speeds.VREF_kt', 'speeds.VAPP_kt', 'speeds.ias_cas',
];
// The units of the three legacy leaves, as the trainer card writes them (the research cards vary: '-' for the DA40
// propulsion, 'AC.gear' for the DA42 gear); nothing reads them, they say what v holds
const LEGACY_U = { 'aero.legacy': '-, 1/rad, deg, deg/f, s', 'propulsion.legacy': 'W, -, N, -', 'gear.legacy': 'm FRD, N/m, N s/m, m' };
// The leaves this script writes itself (gear.legacy only where the research card has none)
export const GENERATED = ['gear.legacy', 'airframe.geometry.gsAntenna_pos_FRD', 'thai_fleet'];
// The inputs of buildAC's legacyGear, whose sources gear.legacy carries
const GEAR_INPUTS = ['gear.geometry.nose_contact_body_extended', 'gear.geometry.main_contact_body_extended', 'gear.geometry.cg_height_parked',
  'gear.strut_nose.spring', 'gear.strut_main.spring', 'gear.strut_nose.stroke', 'gear.strut_main.stroke', 'airframe.weights.training_mass'];

const uniq = (a) => [...new Set(a)];
const CODE_RE = /(?<![A-Za-z0-9:])(R1:[A-Z]\d+|L[A-Z]\d+)(?![A-Za-z0-9])/g;
const codesIn = (s) => uniq([...String(s || '').matchAll(CODE_RE)].map((m) => m[1]));
const CONF_ORDER = ['ต่ำ', 'กลาง', 'สูง'];
const lowestConf = (cs) => CONF_ORDER.find((c) => cs.includes(c)) ?? 'ต่ำ';
const EST = 'ค่าประมาณ';
const r2 = (x) => Math.round(x * 100) / 100;
const minus = (x) => String(x).replace('-', '−');
const fmt = (x, n) => (+x.toFixed(n)).toLocaleString('en-US', { maximumFractionDigits: n });
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thaiDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${TH_MONTH[m - 1]} ${y}`; };

// the gear-station derivation prepare() wrote for a card (DA40), quoted in the generated gear.legacy note, since the
// contact leaves it rewrote are inputs and do not reach the card
const STATIONS_NOTE = new WeakMap();
let _params = null;
const params = () => (_params ??= JSON.parse(fs.readFileSync(path.join(R2, 'params-light.json'), 'utf8')));

// ───────────────────────── the research card, with the provenance fixes ─────────────────────────
// prepare(id): the resolved round 2 card (as lm_lib.loadType gives it) after these fixes, which follow the research's
// own rules (01-methods.md LM8: numbers read or measured from the JSBSim bundle files, cited as such, never XML or code
// in the repo; 03-open-models.md §03.6: not even single constants from GPL files, and the FlightGear DA40 is LB19,
// GPL-2.0):
//  - c172s, c172r: a leaf whose note says its number comes from JSBSim c172r cites that file (LB3) instead of the
//    generic LM8 row: the eye point, the gear contacts, the parked CG height, the strut springs and the flap detents;
//    aero.legacy, whose CDflap and Cmflap are the landing detent's dCD0 and dCm0, cites it too.
//  - da40d, da40_180: the eye point is derived from the seat station its note gives, 2.30 m DAT [LD8], with the eye
//    about 0.1 m aft of it: 2.40 m DAT, so x = 2.47 − 2.40 = +0.07 m ahead of the card's CG reference 2.47 m DAT
//    (05-da40.md §05.2), in the FRD convention of the card's other stations (engine hub 0.25 m DAT → +2.22 m). The
//    research leaf held −0.07 m cited only to LB19, which the derivation in its note does not support.
//    The parked CG height 0.85 m is the research's own estimate [LD0] (FlightGear's 0.79 m was only a comparison).
//    The research leaves give the main station 2.80 m DAT next to FlightGear's 2.81 m [LB19] and the nose station as
//    main − wheelbase; the topic file (§05.2) calls 2.80 / 1.12 m its own estimates from pictures, checked against the
//    FlightGear model. To keep LB19 off the card, the stations are taken from the AFM wheelbase 1.68 m [LD2] split by
//    the research's nose-load share of about 20 % ("โหลดสถิตล้อหน้า ≈ 20 % ของน้ำหนัก", gear.tyre_nose.rated_load)
//    [LD0]. That share is itself what the research's image stations give at CG 2.47 m (19.6 %), so the split gives
//    those stations back, rounded: main −0.336 m, nose +1.344 m against the research's −0.33 / +1.35 m. Track [LD2]
//    and heights stay.
export function prepare(id) {
  if (!TYPE_IDS.includes(id)) throw new Error(`unknown type ${id} (known: ${TYPE_IDS.join(', ')})`);
  const card = structuredClone(resolveType(params(), id, new Set(), loadBases().bases));
  if (!card) throw new Error(`${id}: not in params-light.json`);
  if (id.startsWith('c172')) {
    for (const p of uniq([...COPIED, ...GEAR_INPUTS])) {
      const l = leaf(card, p);
      if (l && /JSBSim c172r/.test(l.note || '')) l.src = uniq(l.src.includes('LM8') ? l.src.map((s) => (s === 'LM8' ? 'LB3' : s)) : [...l.src, 'LB3']);
    }
    // aero.legacy's CDflap and Cmflap, the numbers the sim reads, are the landing detent's dCD0 and dCm0, which the
    // detents leaf takes from JSBSim c172r: the legacy leaf cites that file too
    const det = leaf(card, 'aero.flaps.detents'), lg = leaf(card, 'aero.legacy');
    const land = det.v.reduce((a, d) => (d.flap_deg > a.flap_deg ? d : a));
    if (det.src.includes('LB3') && lg.v.CDflap === land.dCD0 && lg.v.Cmflap === land.dCm0) {
      lg.src = uniq([...lg.src, 'LB3']);
      lg.note = `${lg.note.trim().replace(/[;.]$/, '')}; CDflap ${lg.v.CDflap} และ Cmflap ${minus(lg.v.Cmflap)} คือ dCD0 และ dCm0 ของแฟลป ${land.name}° ใน aero.flaps.detents`
        + ' ซึ่งเป็นตัวเลขที่อ่านจากโมเดล JSBSim c172r [LB3]';
    }
  }
  if (id.startsWith('da40')) {
    const eye = leaf(card, 'airframe.geometry.eye_pos_FRD'), cgRef = 2.47, seat = 2.30, aft = 0.1;
    const ex = +(cgRef - (seat + aft)).toFixed(4);
    eye.v = [ex, eye.v[1], eye.v[2]];
    Object.assign(eye, { src: ['LD8', 'LD0', 'AL:C1'], note: `${EST}: ตานักบินที่นั่งหน้าซ้าย ที่นั่งหน้า ${seat.toFixed(2)} m DAT [LD8] ตาอยู่หลังกว่าราว ${aft} m`
      + ` คือ ${(seat + aft).toFixed(2)} m DAT จึง x = ${cgRef} − ${(seat + aft).toFixed(2)} = +${ex} m หน้า CG อ้างอิง ${cgRef} m DAT ของบัตร (05-da40.md §05.2) [LD0] [AL:C1];`
      + ` y ${minus(eye.v[1])} m ที่นั่งซ้าย, ตาสูงกว่า CG ราว ${-eye.v[2]} m (z ${minus(eye.v[2])})` });
    const hp = leaf(card, 'gear.geometry.cg_height_parked');
    Object.assign(hp, { src: ['LD0'], note: `${EST}: ความสูง CG เหนือพื้นขณะจอด ${hp.v} m ประมาณโดยงานวิจัยรอบที่ 2 (05-da40.md) [LD0]` });
    const wb = val(card, 'airframe.geometry.wheelbase'), fNose = 0.2;
    const xm = +(-fNose * wb).toFixed(4), xn = +((1 - fNose) * wb).toFixed(4);
    const nose = leaf(card, 'gear.geometry.nose_contact_body_extended'), main = leaf(card, 'gear.geometry.main_contact_body_extended');
    const was = [nose.v[0], main.v[0][0]], mm = Math.round(1000 * Math.max(Math.abs(xn - was[0]), Math.abs(xm - was[1])));
    nose.v = [xn, nose.v[1], nose.v[2]];
    main.v = main.v.map((w) => [xm, w[1], w[2]]);
    const why = `แบ่ง wheelbase ${wb} m [LD2] ให้ล้อหน้ารับน้ำหนักสถิตราว ${fNose * 100} % ตามค่าประมาณของงานวิจัย (gear.tyre_nose.rated_load) [LD0]`
      + ` ซึ่งงานวิจัยได้จากตำแหน่งล้อที่ประมาณจากภาพ 2.80 / 1.12 m DAT ที่ CG 2.47 m (19.6 %, 05-da40.md §05.2)`
      + ` จึงได้ตำแหน่งของงานวิจัย (+${was[0]} / ${minus(was[1])} m) กลับมาโดยปัดแล้ว ต่างไม่เกิน ${mm} mm [AL:C1]`;
    Object.assign(nose, { src: ['LD2', 'LD0', 'AL:C1'], note: `${EST}: ล้อหน้า x ${xn} m หน้า CG; ${why}; z = ความสูง CG + ยุบตัวสถิต` });
    Object.assign(main, { src: ['LD2', 'LD0', 'AL:C1'], note: `${EST}: ล้อหลัก x ${xm} m หลัง CG; ${why}; track ${2 * Math.abs(main.v[1][1])} m [LD2]; z = ความสูง CG + ยุบตัวสถิต` });
    STATIONS_NOTE.set(card, `ล้อหน้า x +${xn} m และล้อหลัก x ${minus(xm)} m: ${why}`);
  }
  return card;
}

// ───────────────────────── the stall end of speeds.ias_cas (plan C3, research R2-12) ─────────────────────────
// The POH's calibration table (Fig 5-1 of the Cessna POHs) is for level flight and starts at 40 or 50 KIAS, above the
// stall; the stall table (Fig 5-3, speeds.stall_table, cells [KIAS, KCAS] of the power-off stall at 0 / 30 / 45 / 60° of
// bank) gives the pair at the stall itself, where the position error is larger (C152 flaps 30: 35 KIAS = 43 KCAS, the
// calibration table has 40 KIAS = 43 KCAS). The simulator's KIAS display needs the pair, or the stall would read 40
// KIAS instead of 35 (T-LF-07, research item 12: "extend speeds.ias_cas below 40 KIAS with pairs from speeds.stall_table").
// anchorStallRows(ias, stall): a copy of the ias_cas leaf whose rows start at the stall pair, for each row whose name is
// a flap row of the stall table (the forward-CG block, bank 0: the lowest speed of the type, at its maximum mass). The
// pair becomes the row's first point when its KIAS is not above the row's first KIAS (the stall is the start of the
// table, not a point inside it); the row's points that it contradicts (KIAS not above it, or KCAS not above it, which
// would make the table non-monotone: the stall table is a different calibration, power off) are dropped, the rest stay.
// A row whose first point is already below the stall pair, a row with no stall pair, and a type whose stall table has no
// [KIAS, KCAS] cells (the DA40 and DA42: KIAS only) stay as they are. The POH marks the KIAS of Fig 5-3 as approximate, so
// the row between the stall pair and the next Fig 5-1 point is an interpolation, not a POH figure (ค่าประมาณ).
export function anchorStallRows(ias, stall) {
  const out = structuredClone(ias), cg = stall && isObj(stall.v) ? stall.v.cg_fwd : null, notes = [];
  if (!isObj(cg) || !isObj(out.v) || out.v.axes) return { leaf: out, notes };
  for (const [name, row] of Object.entries(out.v)) {
    const cell = cg[name] && cg[name][0];
    if (!Array.isArray(row) || !Array.isArray(cell) || cell.length !== 2 || !cell.every((x) => typeof x === 'number')) continue;
    const [ka, ca] = cell;
    if (!(ka <= row[0][0])) continue;
    const kept = row.filter((q) => q[0] > ka && q[1] > ca);
    out.v[name] = [[ka, ca], ...kept];
    notes.push(`แถว ${name}: เริ่มที่คู่ stall ${ka} KIAS = ${ca} KCAS${kept.length === row.length ? '' : ` แทนจุด ${row.filter((q) => !kept.includes(q)).map((q) => `${q[0]} → ${q[1]}`).join(', ')} ของ Fig 5-1`}`);
  }
  if (notes.length) {
    out.est = true;   // the stall end is an interpolation between the Fig 5-3 pair and Fig 5-1, so the leaf holds estimates
    out.src = uniq([...out.src, ...stall.src, 'AL:C3']);
    out.note = `${String(out.note).trim().replace(/[;.]$/, '')}. ช่วง stall (${EST}): ${notes.join('; ')}; คู่ KIAS/KCAS จาก speeds.stall_table (Fig 5-3, CG หน้า, ปีกระดับ, power off`
      + ` ซึ่ง POH บอกว่า KIAS เป็นค่าโดยประมาณ) เพราะ Fig 5-1 เริ่มที่ 40 หรือ 50 KIAS สูงกว่า stall จึงต้องต่อจุดล่างด้วยคู่นี้เพื่อให้ HUD อ่าน stall ใกล้ขอบล่างของ white arc;`
      + ` ระหว่างคู่ stall กับจุดถัดไปของ Fig 5-1 เป็นเส้นตรง (ไม่ใช่ตัวเลขของ POH); ซิมอ่านต่ำกว่าจุดแรกของแถวตามสัดส่วนถึงศูนย์ และสูงกว่าจุดสุดท้ายด้วยส่วนต่างคงที่`
      + ` (src/20-flight.js iasToCas, ${EST}) [AL:C3]`;
  }
  return { leaf: out, notes };
}

// ───────────────────────── note rules ─────────────────────────
// Every written leaf: an empty note says which source the value comes from; an estimate says ค่าประมาณ; every code its
// note cites ([LT9], (LS1), …) is in its src, so a note never cites a code that _meta.sources lacks.
const LABEL = { 'aero.ref.S': 'พื้นที่ปีกอ้างอิง', 'aero.ref.b': 'ช่วงปีก', 'aero.ref.c': 'คอร์ดเฉลี่ยทางอากาศพลศาสตร์ (MAC)' };
function noteRules(p, l) {
  if (!String(l.note || '').trim()) l.note = `${l.est ? EST + ': ' : ''}${LABEL[p] ?? 'ค่า'}ตามแหล่ง ${l.src.map((s) => `[${s}]`).join('')}`;
  if (l.est && !l.note.includes(EST)) l.note = `${EST}: ${l.note}`;
  l.src = uniq([...l.src, ...codesIn(l.note)]);
  return l;
}

// ───────────────────────── generated leaves ─────────────────────────
// The stall-warning angles: the α at which the trimmed 1-g speed is margin kt above the 1-g stall, at flaps 0 and 1,
// on the simulator's own lift curve (blend, trimmed elevator), as test/stall.test.mjs T-A-07 measures it: q̇ = 0,
// h 1,000 m, throttle 0, gear down, EAS at the card's training mass, ρ 1.225. CLmax is the peak over α 0…25° in steps
// of 0.01°; the warning angle comes from a bisection below it. aWarn is the flaps-0 angle and aWarnFlap the change to
// flaps 1, each rounded to 0.01°; every detent (flapMap of lm_card) is then checked within margin ± tol kt. AC is set
// from the card for the solve and put back as it was.
export function solveWarn(card, { margin = 7, tol = 0.25 } = {}) {
  const { AC, Aircraft, setAircraft, DEG, KT, G0 } = M;
  const saved = Object.entries(AC);
  try {
    setAircraft(card);
    const clTrim = (flaps, aDeg) => {
      const ac = new Aircraft(); ac.flaps = flaps; ac.gearPos = 1; ac.thr = 0;
      const th = aDeg * DEG, d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13);
      ac.x.set([0, 0, -1000, 45, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]);
      const qd = (de) => { ac.de = de; ac.deriv(ac.x, o, d); return o[11]; };   // q̇ is linear in δe
      const q0 = qd(0), q1 = qd(-0.01); qd(-0.01 * q0 / (q0 - q1));
      return d.CL;
    };
    const v1g = (CL) => Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * CL)) / KT;
    const peak = (f) => {
      let pk = { CL: 0, a: 0 };
      for (let i = 0; i <= 2500; i++) { const a = i * 0.01, CL = clTrim(f, a); if (CL > pk.CL) pk = { CL, a }; }
      return pk;
    };
    const solve = (f) => {
      const pk = peak(f), vs = v1g(pk.CL);
      if (!(v1g(clTrim(f, 0)) - vs > margin)) throw new Error(`warning solve, flaps ${f}: the margin at α 0 is under ${margin} kt`);
      let lo = 0, hi = pk.a;
      for (let k = 0; k < 60; k++) { const mid = 0.5 * (lo + hi); if (v1g(clTrim(f, mid)) - vs > margin) lo = mid; else hi = mid; }
      return 0.5 * (lo + hi);
    };
    const aWarn = r2(solve(0)), aWarnFlap = r2(solve(1) - aWarn);
    const checks = flapMap(detents(card)).map((d) => {
      const pk = peak(d.f), vs = v1g(pk.CL), aw = aWarn + aWarnFlap * d.f;
      return { name: d.name, f: d.f, aWarn: aw, aCLmax: pk.a, CLmax: pk.CL, vs, margin: v1g(clTrim(d.f, aw)) - vs };
    });
    const bad = checks.filter((c) => !(Math.abs(c.margin - margin) <= tol));
    if (bad.length) throw new Error(`warning solve: margin outside ${margin} ± ${tol} kt at ${bad.map((c) => `${c.name} (${c.margin.toFixed(2)} kt)`).join(', ')}`);
    return { aWarn, aWarnFlap, checks };
  } finally {
    for (const k of Object.keys(AC)) if (!saved.some(([s]) => s === k)) delete AC[k];
    for (const [k, v] of saved) {
      if (Object.hasOwn(AC, k)) AC[k] = v;
      else Object.defineProperty(AC, k, { value: v, writable: true, enumerable: true, configurable: true });
    }
  }
}

// Inertia from class radii of gyration (research item 10: "ใช้ inertiaFromRadii เมื่อบัตรไม่มี inertia"): Ixx, Iyy, Izz
// from lm_inertia at the training mass (the card's own airframe.inertia.radii when it has them, else the class of
// RADII, as buildAC chooses), Ixz 0 and ref_mass the training mass.
export function inertiaLeaves(card) {
  const m = val(card, 'airframe.weights.training_mass'), kg = isObj(m) ? m.kg : m;
  const b = val(card, 'aero.ref.b') ?? val(card, 'airframe.wing.b'), L = val(card, 'airframe.geometry.length');
  const lay = val(card, 'propulsion.layout'), n = Array.isArray(lay) ? lay.length : 1;
  const cls = n > 1 ? 'twin_prop' : lay?.[0]?.type === 'turboprop' ? 'trainer_turboprop' : 'single_prop';
  const own = val(card, 'airframe.inertia.radii'), R = isObj(own) ? own : RADII[cls];
  if (![kg, b, L].every((x) => typeof x === 'number' && x > 0)) throw new Error(`inertia from radii needs the training mass, span and length (${kg}, ${b}, ${L})`);
  const I = inertiaFromRadii({ m: kg, b, L, Rx: R.Rx, Ry: R.Ry, Rz: R.Rz });
  const radii = `Rx ${R.Rx}, Ry ${R.Ry}, Rz ${R.Rz}${isObj(own) ? ' ของบัตร' : ` ของคลาส ${cls}`}`;
  const mk = (v, u, note) => ({ v, u, scope: 'aircraft', src: ['LM15', 'LM0', 'AL:C1'], conf: 'ต่ำ', est: true, note: `${EST}: ${note}` });
  const how = `จากรัศมีไจเรชัน (${radii}; นิยาม Roskam [LM15], lm_inertia.inertiaFromRadii [LM0]) ที่มวลฝึก ${kg} kg, b ${b} m, L ${L} m เพราะบัตรวิจัยไม่มี inertia [AL:C1]`;
  return {
    Ixx: mk(I.Ixx, 'kg m2', `Ixx = m(b·Rx/2)² ${how}`),
    Iyy: mk(I.Iyy, 'kg m2', `Iyy = m(L·Ry/2)² ${how}`),
    Izz: mk(I.Izz, 'kg m2', `Izz = m((b+L)/2·Rz/2)² ${how}`),
    Ixz: mk(0, 'kg m2', `ไม่มีข้อมูล ตั้ง 0 ตามค่าเริ่มต้นของ lm_card [LM0] [AL:C1]`),
    ref_mass: mk(kg, 'kg', `มวลที่ใช้คำนวณ inertia ข้างบน (มวลฝึก) [AL:C1]`),
  };
}

// The Thai fleet of one type: the civil training organisations (ATO) and clubs in common_light.thai_fleet whose
// aircraft list names the type id, with the count of this id and the variants the research counts under it.
// common_light.thai_fleet.military_generic and .summary are never read as users; no school note text is copied.
export function fleetLeaf(id) {
  const TF = params().common_light.thai_fleet, sum = TF.summary;
  const users = [], src = [...sum.src], confs = [];
  for (const [k, l] of Object.entries(TF)) {
    if (k === 'summary' || k === 'military_generic' || !isLeaf(l)) continue;
    const u = l.v, kind = /^ato/.test(u.kind) ? 'ato' : u.kind === 'club' ? 'club' : null;
    const n = u.types?.[id];
    if (!kind || !n) continue;
    const base = u.base_icao ? String(u.base).split(' (')[0] : null;
    users.push({ name: u.name, kind, n, base, base_icao: u.base_icao ?? null, base_est: !!(l.est && u.base_icao),
      variants: (u.variants || []).filter((x) => x.id === id).map(({ variant, n: vn }) => ({ variant, n: vn })) });
    src.push(...l.src); confs.push(l.conf);
  }
  if (!users.length) throw new Error(`${id}: no civil user in common_light.thai_fleet`);
  users.sort((a, b) => (a.kind === 'club') - (b.kind === 'club') || b.n - a.n);
  const est = users.some((u) => u.base_est);
  const nAto = users.filter((u) => u.kind === 'ato').reduce((s, u) => s + u.n, 0);
  const note = `จำนวนเครื่องแบบนี้ของโรงเรียนการบินพลเรือน (ATO, kind ato) และชมรมการบิน (kind club) ในไทย ${nAto} ลำใน ATO`
    + ` นับจากทะเบียนอากาศยานของ กพท. ณ ${thaiDate(sum.v.as_of)} [LS1] เป็นเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้;`
    + ` รุ่นในทะเบียนที่ไม่มีบัตรของตัวเองนับใต้แบบนี้ตาม variants; ato_aircraft คือเครื่องฝึกทั้งหมดของ ATO ในทะเบียน และ`
    + ` default_thai_type คือแบบที่ ATO ใช้มากที่สุด (02-thai-schools.md, common_light.thai_fleet);`
    + (est ? ` ฐานฝึกที่ base_est เป็น true เป็น${EST} (อนุมานจากที่ตั้งเครื่องฝึกจำลองหรือที่อยู่);` : '')
    + ` base ว่างเมื่อแหล่งไม่ระบุสนามบิน`;
  return { v: { as_of: sum.v.as_of, default_thai_type: sum.v.default_thai_type, ato_aircraft: sum.v.ato_aircraft, users },
    u: '-', scope: 'environment', src: uniq(src), conf: lowestConf(confs), est, note };
}

function gearLeaf(card, gear) {
  const ins = GEAR_INPUTS.map((p) => leaf(card, p)).filter(Boolean);
  const sp = (s) => val(card, `gear.strut_${s}.spring`) || {};
  const kRule = (s) => (sp(s).k_vertical != null ? 'k_vertical' : sp(s).static_deflection != null ? 'N/static_deflection' : 'N/(0.3·stroke)');
  const zeta = (s) => (sp(s).damping_ratio != null ? `ζ ${sp(s).damping_ratio}` : 'ζ 0.6');
  return {
    v: gear, u: LEGACY_U['gear.legacy'], scope: 'gear', src: uniq([...ins.flatMap((l) => l.src), 'LM0', 'AL:C1']), conf: 'ต่ำ', est: true,
    note: `${EST}: ขาล้อสปริง-แดมเปอร์เชิงเส้น 3 ขาของซิม (ล้อหน้าเลี้ยวได้ ล้อหลักมีเบรก) b ตำแหน่งจุดสัมผัสเมื่อขายืดสุด (m FRD จาก CG), k, c, stroke`
      + ` คำนวณด้วย buildAC (legacyGear) ของ lm_card.mjs [LM0] ที่มวลฝึกจาก gear.geometry.*_contact_body_extended, gear.strut_*.spring และ gear.strut_*.stroke ของบัตรวิจัย:`
      + ` น้ำหนักล้อหน้า N = W·(−x_main)/(x_nose − x_main); k ล้อหน้าจาก ${kRule('nose')} ล้อหลักจาก ${kRule('main')}; c = 2ζ√(k·N/g) (ล้อหน้า ${zeta('nose')}, ล้อหลัก ${zeta('main')}) [AL:C1]`
      + (STATIONS_NOTE.has(card) ? `; ${STATIONS_NOTE.get(card)}` : ''),
  };
}

function antennaLeaf(eye) {
  return {
    v: eye.v.slice(), u: eye.u, scope: eye.scope, src: uniq([...eye.src, 'AL:C1']), conf: 'ต่ำ', est: true,
    note: `${EST}: ไม่มีแหล่งใดให้ตำแหน่งเสาอากาศรับ glide slope ของแบบนี้ จึงวางไว้ที่ตำแหน่งตา (airframe.geometry.eye_pos_FRD) ไฟ PAPI และ ILS จึงอ่านที่จุดเดียวกัน (เครื่องฝึกสมมติมีตาสูงกว่าเสาอากาศ 1.3 m) [AL:C1]`,
  };
}

function warnInto(card, legacy, w) {
  const mm = leaf(card, 'aero.stall_warning.min_margin'), design = val(card, 'aero.stall_warning.alpha_warn_design');
  const m = val(card, 'airframe.weights.training_mass'), kg = isObj(m) ? m.kg : m;
  const land = flapMap(detents(card)).at(-1);
  Object.assign(legacy.v, { aWarn: w.aWarn, aWarnFlap: w.aWarnFlap, aWarnHyst: 0.5, aWarnMinOn: 0.5 });
  legacy.u = LEGACY_U['aero.legacy'];
  legacy.src = uniq([...legacy.src, ...(mm ? mm.src : []), 'R1:A22', 'AL:A5', 'AL:C1']);
  legacy.est = true; legacy.conf = 'ต่ำ';
  const mmCodes = mm ? mm.src.map((s) => `[${s}]`).join('') : '';
  legacy.note = `${legacy.note.trim().replace(/[;.]$/, '')}. สัญญาณเตือน stall (${EST}): aWarn ${w.aWarn}° ที่แฟลป 0 และ aWarn + aWarnFlap`
    + ` = ${r2(w.aWarn + w.aWarnFlap)}° ที่แฟลปลงจอด ${land.name} (f 1) คือมุมปะทะที่ความเร็ว 1 g สูงกว่าความเร็ว stall 1 g 7.00 kt`
    + ` แก้บนเส้น CL ของซิมเองตามวิธี T-A-07 (trim q̇ = 0, ρ 1.225, มวลฝึก ${fmt(kg, 1)} kg) ด้วย tools/aircraft/build_cards.mjs [AL:C1];`
    + ` ทุกขั้นแฟลประหว่างนั้นอยู่ใน 7 ± 0.25 kt; เกณฑ์อย่างน้อย 5 kt ของ 14 CFR 23.207(c) [R1:A22]${mmCodes}`
    + `${design ? `; เทียบ alpha_warn_design ของบัตรวิจัย ${JSON.stringify(design)} deg (แบบจำลองของงานวิจัยเอง ไม่ใช่เส้น CL ของซิม)` : ''};`
    + ` เลิกเตือนเมื่อ α ต่ำกว่า 0.5° และดังมาแล้วอย่างน้อย 0.5 s ตามเครื่องฝึก (plan A5) [AL:A5]`;
}

// ───────────────────────── _meta ─────────────────────────
const FIXED_SOURCES = {
  'R1:A22': { what: '14 CFR Part 23 (1 Jan 2016, before Amdt 23-64) §23.207(c): stall warning at least 5 kt above the stall (reference [A22] of the round 1 aero topic)', link: 'docs/research/01-flight-physics/01-aero.md' },
  'AL:A5': { what: 'AirfieldLab plan A5 design choice, no outside source: the stall warning goes off only 0.5° below its angle and after at least 0.5 s on, so a gust spike sounds as a short chirp; test/stall.test.mjs checks the behaviour', link: 'test/stall.test.mjs' },
  'AL:C3': { what: "AirfieldLab plan C3, this generator's own rule: the first point of a speeds.ias_cas row is the stall pair of speeds.stall_table where that pair lies at or below the row's first KIAS (no outside source beyond the POH tables it reads)", link: SELF },
  'AL:C1': { what: "AirfieldLab plan C1, this generator's own derivations: the stall-warning angles solved on the simulator's lift curve, the gear struts through round 2's buildAC, the glide-slope antenna at the eye, the DA40 eye point from the seat station and the DA40 wheel stations from the wheelbase, the Thai fleet rows and, for a card without inertia, inertia from class radii", link: SELF },
};
// The description of a reference row with its Markdown, links and empty brackets taken out
const stripMd = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/https?:\/\/[^\s,;)]+/g, '').replace(/[*`]/g, '').replace(/<[^>]+>/g, '')
  .replace(/\(\s*(?:หรือ|or)?\s*\)/g, '').replace(/\s+([,;.)])/g, '$1').replace(/([,;])(?:\s*[,;])+/g, '$1')
  .replace(/\s+/g, ' ').replace(/\s*[·,;:]\s*$/, '').trim();
export function sourceOf(code) {
  if (FIXED_SOURCES[code]) return FIXED_SOURCES[code];
  const idx = loadRefIndex(R2);
  let m, file, row, rel, key = code;
  if ((m = /^(L[A-Z])\d+$/.exec(code)) && SRC_OWNER[m[1]]) { file = SRC_OWNER[m[1]]; row = idx.r2[file]; rel = `docs/research/02-light-aircraft/${file}`; }
  else if ((m = /^R1:([A-Z])\d+$/.exec(code)) && R1_OWNER[m[1]]) { file = R1_OWNER[m[1]]; row = idx.r1[file]; rel = `docs/research/01-flight-physics/${file}`; key = code.slice(3); }
  else throw new Error(`source code ${code}: not a round 1 or round 2 code`);
  if (!row || !row.ids.has(key)) throw new Error(`source code ${code}: no row in the references of ${rel}`);
  const line = fs.readFileSync(row.file, 'utf8').split('\n')[row.ids.get(key) - 1];
  // a table row: its second cell; a list item ("8. [LM8] …, link — type · licence"): the text before " — "
  const desc = line.trimStart().startsWith('|') ? line.split('|')[2] : line.replace(/^\s*(?:\d+\.|[-*])\s+\[[^\]]+\]\s*/, '').split(' — ')[0];
  const url = (line.match(/https:\/\/[^\s|,;)<>`]+/) || [])[0];
  return { what: `${stripMd(desc) || code} (reference [${key}] of ${rel})`, link: url ? url.replace(/[.]+$/, '') : rel };
}

function meta(id, doc) {
  const used = new Set();
  (function walk(o) { for (const v of Object.values(o)) { if (isLeaf(v)) v.src.forEach((s) => used.add(s)); else if (isObj(v)) walk(v); } })(doc);
  const lb3 = used.has('LB3');
  return {
    id,
    source: `AirfieldLab plan C1: the round 2 research card ${id} in docs/research/02-light-aircraft/params-light.json (topic file ${TOPIC[id]}),`
      + ` resolved with its _inherits chain, with the Thai fleet of common_light.thai_fleet (02-thai-schools.md); only the values the simulator`
      + ` reads, the speed table, the flap detents and the type's identity, MTOW, length and gear layout, generated by ${SELF}; each leaf names its sources in src, listed in _meta.sources`,
    license: 'MIT (LICENSE): the repository\'s own compilation, fits and estimates; manufacturer, authority and register figures used as cited'
      + ' numbers only (no text, table, figure or document copied; © their owners, see _meta.sources)'
      + (lb3 ? '; a few C172 dimensions, the eye point, the gear spring rates and the flap drag and pitch increments are numbers read from the JSBSim c172r model (LB3), cited, no file or text copied' : ''),
    note: `บัตรพารามิเตอร์ของ ${val(doc, 'airframe.identity')?.model ?? id} สำหรับซิม สร้างด้วย ${SELF} จากบัตรวิจัยรอบที่ 2 ห้ามแก้ไฟล์นี้ด้วยมือ`
      + ' (แก้ params-light.json หรือสคริปต์แล้วสร้างใหม่) ตัวเลขการบินเป็นค่าของเอกสารสาธารณะที่อ้างไว้หรือเป็นค่าประมาณ (est true, ค่าประมาณ ใน note)'
      + ' ใช้เพื่อการฝึกในเกมนี้เท่านั้น ไม่ใช้เพื่อการบินจริง; รูปแบบ leaf {v, u, scope, src, conf, est, note} ตาม docs/research/01-flight-physics/schema.md'
      + ' และ docs/research/02-light-aircraft/schema-ext.md; ความเร็วอ้างอิงเขียนในหน่วยที่แหล่งให้ (ส่วนมาก kt IAS) ซิมแปลง kt IAS เป็น kt CAS'
      + ' ด้วย speeds.ias_cas แถวแฟลปลงจอด และ HUD แสดง KIAS จากตารางเดียวกันตามตำแหน่งแฟลป (plan C3);'
      + ' รหัส AL:A5 และ AL:C1 ไม่ใช่รูปแบบรหัสของรอบที่ 2 (lm_lib.validate ของรอบที่ 2 เตือนโดยตั้งใจ เช่นเดียวกับบัตรเครื่องฝึก)'
      + ' บัตรใน data/aircraft อ่านรหัสทุกตัวผ่าน _meta.sources',
    sources: Object.fromEntries([...used].sort().map((c) => [c, sourceOf(c)])),
  };
}

// ───────────────────────── the card ─────────────────────────
const put = (doc, p, l) => { const ks = p.split('.'); let o = doc; for (const k of ks.slice(0, -1)) o = (o[k] ??= {}); o[ks.at(-1)] = l; };
const COPY = new Set(COPIED);

export function buildCard(id) {
  const card = prepare(id), doc = {};
  // copied leaves, in the research card's key order
  for (const p of leafPaths(card)) {
    if (!COPY.has(p)) continue;
    let l = structuredClone(leaf(card, p));
    if (LEGACY_U[p]) l.u = LEGACY_U[p];
    if (p === 'speeds.ias_cas') l = anchorStallRows(l, leaf(card, 'speeds.stall_table')).leaf;
    put(doc, p, noteRules(p, l));
  }
  if (!['Ixx', 'Iyy', 'Izz'].every((k) => typeof val(card, 'airframe.inertia.' + k) === 'number')) {
    for (const [k, l] of Object.entries(inertiaLeaves(card))) put(doc, 'airframe.inertia.' + k, l);
  }
  for (const p of COPIED) if (p !== 'gear.legacy' && !leaf(doc, p)) throw new Error(`${id}: the research card has no ${p}`);
  if (!leaf(doc, 'gear.legacy')) put(doc, 'gear.legacy', noteRules('gear.legacy', gearLeaf(card, buildAC(card).gear)));
  put(doc, 'airframe.geometry.gsAntenna_pos_FRD', antennaLeaf(leaf(doc, 'airframe.geometry.eye_pos_FRD')));
  doc.thai_fleet = fleetLeaf(id);
  // the stall-warning angles, solved on the card as written so far (aWarn does not enter the forces)
  const legacy = leaf(doc, 'aero.legacy');
  Object.assign(legacy.v, { aWarn: 0, aWarnFlap: 0, aWarnHyst: 0.5, aWarnMinOn: 0.5 });
  warnInto(card, legacy, solveWarn(doc));
  noteRules('aero.legacy', legacy);
  doc._meta = meta(id, doc);
  // what the owner's rules and research round 2 forbid in a card (03-open-models.md §03.6)
  const text = JSON.stringify(doc);
  if (/LB19|FlightGear/i.test(text)) throw new Error(`${id}: a FlightGear number or the LB19 code reached the card`);
  return doc;
}

export const cardText = (id) => JSON.stringify(buildCard(id), null, 1) + '\n';
const fileOf = (id) => path.join(OUT, `${id}.json`);

// Leaf paths (and _meta paths) whose JSON differs between two cards, in order
function diffPaths(a, b, p = '', out = []) {
  const keys = uniq([...Object.keys(isObj(a) ? a : {}), ...Object.keys(isObj(b) ? b : {})]);
  if (!isObj(a) || !isObj(b) || isLeaf(a) || isLeaf(b)) { if (JSON.stringify(a) !== JSON.stringify(b)) out.push(p || '(root)'); return out; }
  for (const k of keys) diffPaths(a[k], b[k], p ? `${p}.${k}` : k, out);
  return out;
}

if (isMainModule(import.meta.url)) {
  // the six light cards of this script and the seven experimental airliner cards of build_airliners.mjs (plan C4; the
  // two modules import each other, so neither reads the other's bindings at the top level)
  const ALL_IDS = [...TYPE_IDS, ...AIRLINER_IDS];
  const textOf = (id) => (AIRLINER_IDS.includes(id) ? airlinerText(id) : cardText(id));
  const args = process.argv.slice(2), at = args.indexOf('--only');
  const ids = at >= 0 ? [args[at + 1]] : ALL_IDS;
  for (const id of ids) if (!ALL_IDS.includes(id)) { console.error(`unknown type ${id} (known: ${ALL_IDS.join(', ')})`); process.exit(2); }
  if (args.includes('--check')) {
    const bad = [];
    for (const id of ids) {
      const want = textOf(id), f = fileOf(id), have = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
      if (have === want) continue;
      let paths;
      try { paths = have === null ? ['(file missing)'] : diffPaths(JSON.parse(have), JSON.parse(want)); } catch (e) { paths = [`(not JSON: ${e.message})`]; }
      bad.push(`${id}: ${(paths.length ? paths : ['(formatting only)']).slice(0, 10).join(', ')}`);
    }
    if (bad.length) { console.error(`data/aircraft differs from ${SELF} (run it to regenerate):\n  ${bad.join('\n  ')}`); process.exit(1); }
    console.log(`data/aircraft: ${ids.length} card(s) up to date`);
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    for (const id of ids) { const t = textOf(id); fs.writeFileSync(fileOf(id), t); console.log(`wrote data/aircraft/${id}.json (${t.length} bytes)`); }
  }
}
