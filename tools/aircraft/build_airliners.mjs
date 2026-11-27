// Experimental airliner cards for the simulator, generated from the round 3 research cards (plan C4; research round 3
// task items 1, 2 and 39, docs/research/03-airliners.md). Node >= 22, no dependencies. tools/aircraft/build_cards.mjs
// runs it: `node tools/aircraft/build_cards.mjs [--only <id>] [--check]` covers the six light cards and these seven.
//
// Each card holds the leaves of the research card (docs/research/03-airliners/params-<type>.json, _inherits already
// resolved by the research's r3_merge.mjs) that the simulator's legacy mode reads on today's equations (aero.legacy,
// propulsion.legacy, mass, inertia, S b c̄, the 19 derivatives, control travels, engines and eye point), the type's
// identity, weights, CG reference and classification, copied with all seven fields {v, u, scope, src, conf, est, note},
// and leaves this script writes itself (src AL:C4, each one an estimate unless it only restates a source):
//  - airframe.weights.training_mass: the card's default mass (OD-RATINGS): default_sim.MLW of the jets, the largest MLW
//    of the ATR (which has no default_sim); airframe.weights.mass_options: the masses the page offers;
//  - speeds.VS0_kt, VREF_kt, VAPP_kt as mass tables { axes: { mass_kg, flap? }, data } in kt CAS (acFromCard reads
//    them at the chosen mass, in the landing detent's column): VS0 is the 1-g stall of the landing detent (VSR of the
//    ATR and 737, VS1g of the Airbus types), VREF the research's own table (ATR, 737) or VLS CONF FULL (Airbus, the
//    research's rule "VLS CONF FULL"), VAPP in calm air the research's rule with no wind (ATR VmHB30 + 0 = VREF; 737
//    VREF + 5 kt, the minimum additive; Airbus VLS + 5 kt, the A/THR minimum; the A330's own VAPP table);
//    plan C5 (R3-3): VS0_kt and VREF_kt keep every flap column of the research table (the 737's Vref30 and Vref40, the
//    Airbus VLS columns the research gives, the stall table of every detent) for the functions of src/20-flight.js SPD,
//    which read them at any mass and configuration; AC.Vref and the others still read the landing detent's column;
//  - speeds.approach_rule (plan C5): the wind rule of the type in knots (737 additive, Airbus APPR COR, ATR wind factor),
//    from ops.speed_additive, speeds.VAPP_rule and speeds.VMCL_kt of the research card;
//  - controls.surfaces where the research card has none: the ATR's travels from topic 07's text, the A330 aileron
//    (the A320 figure) and rudder (the 30° of the research's VMCA build-up);
//  - gear.legacy (three linear struts at the default mass) and gear.layout;
//  - plan C7 (research round 3 task item 6, R3-6; 05-airport-geometry.md §3.5.6, §3.5.9 item 1): the eye and the
//    glide-slope antenna in the reference approach attitude (eyeAntenna below): the Airbus eye height refitted to the
//    manufacturer's H1 (owner decisions OD-A320-PITCH and OD-A330-VISUAL), the antenna H2 below the eye's path;
//  - aero.legacy's stall-warning angles, solved on the simulator's lift curve for 7 kt above the 1-g stall at flaps 0
//    and at the landing detent (the intermediate detents of the legacy model are known to be off: 03-airliners.md task 2);
//  - the A330's lateral derivatives turned from stability to body axes (04-a330-300.md §3.4.7.5);
//  - OD-LEMAC: the A321 LEMAC from FAA TCDS A28NM, the 737-800 LEMAC from BA 627.1 in, both low confidence;
//  - turbofan.ratings_offered: the engine classes of the type the page offers (OD-RATINGS), with Tflat_C 30 °C on every
//    CFM56-7B class;
//  - _na: the research card's own _na plus the round 1 per-type paths that cannot apply to the type, each group with
//    its reason; _deferred: the round 1 per-type paths that apply but that the legacy mode does not read, each group
//    with the plan or research item that will fill it. Every gap that `r3_merge.mjs --coverage` lists is in one of the
//    two (coverage3() checks it; buildCard throws on a gap in neither).
// The research files are never edited: every fix is made here, at the reader (plan C4).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leaf, val, isObj, isLeaf, leafPaths } from '../../docs/research/02-light-aircraft/scripts/lm_lib.mjs';
import { sourceOf as sourceOf2 } from './build_cards.mjs';
import { M } from '../../test/harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const R3 = path.join(ROOT, 'docs', 'research', '03-airliners');
const SELF = 'tools/aircraft/build_airliners.mjs';
const EST = 'ค่าประมาณ';
const uniq = (a) => [...new Set(a)];
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;

// The seven types of research round 3, in the selector's order: by the number of aircraft based at Don Mueang
// (03-airliners.md "เครื่องบินโดยสารที่ดอนเมืองและค่าตั้งต้นของบัตร")
export const AIRLINER_IDS = ['a320ceo', 'b737_800', 'a320neo', 'a330_300', 'a321neo', 'atr72_600', 'a321ceo'];
const TOPIC = { atr72_600: '01-atr72-600.md', b737_800: '02-b737-800.md', a320ceo: '03-a320-a321.md', a320neo: '03-a320-a321.md',
  a321ceo: '03-a320-a321.md', a321neo: '03-a320-a321.md', a330_300: '04-a330-300.md' };
const AIRBUS = new Set(['a320ceo', 'a320neo', 'a321ceo', 'a321neo', 'a330_300']);
const JETS = new Set(AIRLINER_IDS.filter((id) => id !== 'atr72_600'));
// OD-RATINGS: the engine classes of each type that the page offers, the default first. The research cards of the A320
// family inherit every class of the family; a type is offered only the ones its default note names (06-jet-engines.md:
// A320-214 = 5B4, A320-216 = 5B6; A320-251N = LEAP-1A26; A321-211 = 5B3; A321-251N(X) = LEAP-1A32; 737-800 7B24/26/27)
export const RATINGS = {
  b737_800: ['CFM56_7B26_class', 'CFM56_7B27_class', 'CFM56_7B24_class'], a320ceo: ['CFM56_5B6_class', 'CFM56_5B4_class'],
  a320neo: ['LEAP_1A26_class'], a321ceo: ['CFM56_5B3_class'], a321neo: ['LEAP_1A32_class'], a330_300: ['TRENT_772B_class'], atr72_600: [],
};

let _p = {};
export const research = (id) => (_p[id] ??= JSON.parse(fs.readFileSync(path.join(R3, `params-${id.replace(/_/g, '-')}.json`), 'utf8')));

// ───────────────────────── the leaves copied ─────────────────────────
const DER = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
export const COPIED3 = [
  'airframe.identity', 'airframe.weights.MTOW', 'airframe.weights.MLW', 'airframe.weights.default_sim',
  ...['Ixx', 'Iyy', 'Izz', 'Ixz', 'ref_mass', 'radii'].map((k) => 'airframe.inertia.' + k),
  'airframe.cg.LEMAC_x', 'airframe.cg.MAC', 'airframe.cg.ref_pctMAC',
  'airframe.geometry.eye_pos_FRD', 'airframe.geometry.length', 'airframe.geometry.eye_to_gsAntenna_vertical', 'airframe.geometry.approach_visual',
  'aero.ref.S', 'aero.ref.b', 'aero.ref.c', 'aero.legacy', 'aero.flaps.detents', ...DER.map((k) => 'aero.derivatives.' + k),
  'propulsion.legacy', 'propulsion.layout', 'controls.surfaces.elevator', 'controls.surfaces.aileron', 'controls.surfaces.rudder',
  'speeds.icao_approach_category', 'turbofan.engine_default', 'wind.wake.category',
  'ops.tailstrike_pitch_deg', 'ops.flare_height_m', 'ops.gs_mini',
];
// leaves a type may lack in the research card (this script writes the surfaces, the rest stay out)
const OPTIONAL = new Set(['airframe.weights.default_sim', 'controls.surfaces.elevator', 'controls.surfaces.aileron', 'controls.surfaces.rudder',
  'turbofan.engine_default', 'wind.wake.category', 'ops.gs_mini']);
const ENGINE_LEAVES = ['F00', 'Tflat_C', 'bpr'];
const LEGACY_U = { 'aero.legacy': '-, 1/rad, deg, deg/f, s', 'propulsion.legacy': 'W, -, N, -', 'gear.legacy': 'm FRD, N/m, N s/m, m' };

// The note rules of build_cards (an empty note names its source, an estimate says ค่าประมาณ, every code a note cites
// is in src), with round 3's code forms
const CODE_RE = /\[(R1:[A-Z]\d+|[RBLHDJYZOK]\d+|AL:C[457])\]/g;   // a code the note cites in brackets
const codesIn = (s) => uniq([...String(s || '').matchAll(CODE_RE)].map((m) => m[1]));
function noteRules(l) {
  if (!String(l.note || '').trim()) l.note = `${l.est ? EST + ': ' : ''}ค่าตามแหล่ง ${l.src.map((s) => `[${s}]`).join('')}`;
  if (l.est && !l.note.includes(EST)) l.note = `${EST}: ${l.note}`;
  l.src = uniq([...l.src, ...codesIn(l.note).filter((c) => /^AL:C[457]$/.test(c) || /^R1:/.test(c) || hasRef(c))]);
  return l;
}
const mk = (v, u, scope, src, note, { conf = 'ต่ำ', est = true } = {}) => noteRules({ v, u, scope, src: uniq(src), conf, est, note: est && !note.includes(EST) ? `${EST}: ${note}` : note });
const put = (doc, p, l) => { const ks = p.split('.'); let o = doc; for (const k of ks.slice(0, -1)) o = (o[k] ??= {}); o[ks.at(-1)] = l; };
const landing = (card) => val(card, 'aero.flaps.detents').reduce((a, d) => (d.flap_deg > a.flap_deg ? d : a));

// ───────────────────────── generated leaves ─────────────────────────
function defaultMass(id, card) {
  const ds = leaf(card, 'airframe.weights.default_sim'), mlw = leaf(card, 'airframe.weights.MLW');
  if (ds && typeof ds.v.MLW === 'number') {
    return mk(ds.v.MLW, 'kg', 'aircraft', [...ds.src, 'AL:C4'], `มวลตั้งต้นของซิม = MLW ใน airframe.weights.default_sim ของบัตรวิจัย ${ds.v.MLW} kg (ลงจอดที่มวลลงจอดสูงสุด) ผู้ใช้เลือกมวลอื่นในหน้าตั้งค่าได้ (OD-RATINGS) [AL:C4]`);
  }
  const top = Math.max(...Object.values(mlw.v));
  return mk(top, 'kg', 'aircraft', [...mlw.src, 'AL:C4'], `บัตรวิจัยไม่มี default_sim จึงใช้ MLW สูงสุดของทุก weight variant ใน airframe.weights.MLW (${top} kg) เป็นมวลตั้งต้นของซิม ผู้ใช้เลือกมวลอื่นได้ (OD-RATINGS) [AL:C4]`);
}
function massOptions(card, tm) {
  const mlw = leaf(card, 'airframe.weights.MLW'), m0 = tm.v;
  const list = uniq([m0, ...Object.values(mlw.v), Math.round(0.9 * m0 / 100) * 100, Math.round(0.8 * m0 / 100) * 100]).filter((x) => x <= m0).sort((a, b) => b - a);
  return mk(list, 'kg', 'aircraft', [...mlw.src, 'AL:C4'], `มวลที่หน้าตั้งค่าให้เลือก: มวลตั้งต้น ${m0} kg, MLW ของ weight variant อื่นที่ไม่เกินมวลนั้น และ 90 % กับ 80 % ของมวลตั้งต้น ปัดเป็น 100 kg (มวลลงจอดของสายการบินจริงไม่เผยแพร่) [AL:C4]`);
}

// a mass table of the research card at one flap column (or the table as it is); add adds a constant to every value
function tableAt(l, path, cols, add = 0) {
  const v = l.v, fl = v.axes.flap;
  const keep = cols && fl ? cols.map((c) => { const j = fl.map(String).indexOf(c); if (j < 0) throw new Error(`${path}: no column ${c}`); return j; }) : null;
  const data = v.data.map((row) => (keep ? keep.map((j) => r4(row[j] + add)) : Array.isArray(row) ? row.map((x) => r4(x + add)) : r4(row + add)));
  return { axes: keep ? { mass_kg: v.axes.mass_kg, flap: cols } : { ...v.axes }, data };
}
function vlsLeaf(card) {   // VLS of an Airbus type as one mass table with the CONF FULL column
  const l = leaf(card, 'speeds.VLS'), v = l.v;
  if (v.axes) return { l, t: v, which: '' };
  const k = v.cg_25_and_above ? 'cg_25_and_above' : v.all_cg ? 'all_cg' : null;   // the CG of the card is 25 % MAC (ref_pctMAC)
  if (!k) throw new Error(`speeds.VLS: no table for a CG of 25 % MAC (${Object.keys(v).join(', ')})`);
  return { l, t: v[k], which: k };
}
function speedLeaves(id, card) {
  const land = String(landing(card).name);
  const out = {};
  const stall = leaf(card, AIRBUS.has(id) ? 'speeds.VS1g' : 'speeds.VSR');
  out.VS0_kt = mk(tableAt(stall, 'VS0', null), 'kt CAS', 'aircraft', [...stall.src, 'AL:C4'],
    `ความเร็ว stall 1 g ทุกตำแหน่งแฟลป = ตาราง speeds.${AIRBUS.has(id) ? 'VS1g' : 'VSR'} ของบัตรวิจัยทุกคอลัมน์ ตามมวล; VS0 ที่ซิมใช้ (AC.Vs0) อ่านคอลัมน์แฟลปลงจอด ${land} ที่มวลที่เลือกแบบเส้นตรงและไม่ต่อเกินปลายตาราง [AL:C4]`,
    { conf: stall.conf, est: true });
  if (AIRBUS.has(id)) {
    const { l, t, which } = vlsLeaf(card), ref = leaf(card, 'speeds.VREF_kt') || leaf(card, 'speeds.VAPP_kt');
    const vls = tableAt({ v: t }, 'VLS', [land]), vlsAll = tableAt({ v: t }, 'VLS', null);
    out.VREF_kt = mk(vlsAll, 'kt CAS', 'aircraft', [...l.src, ...(ref ? ref.src : []), 'AL:C4'],
      `Vref ตามกฎของบัตรวิจัย "VLS CONF FULL" = ตาราง speeds.VLS${which ? `.${which}` : ''} (CG 25 % MAC) ทุกคอลัมน์ที่บัตรวิจัยให้ ตามมวล; Vref ที่ซิมใช้ (AC.Vref) อ่านคอลัมน์ ${land} [AL:C4]`, { conf: l.conf });
    const vapp = leaf(card, 'speeds.VAPP_kt');
    if (vapp && isObj(vapp.v) && vapp.v.axes) {
      out.VAPP_kt = mk(tableAt(vapp, 'VAPP', [land]), 'kt CAS', 'aircraft', [...vapp.src, 'AL:C4'], `คอลัมน์ ${land} ของ speeds.VAPP_kt ในบัตรวิจัย (VLS + 5 kt ลมสงบ A/THR) ตามมวล [AL:C4]`, { conf: vapp.conf });
    } else {
      const add = leaf(card, 'ops.speed_additive');
      out.VAPP_kt = mk(tableAt({ v: vls }, 'VAPP', null, 5), 'kt CAS', 'aircraft', [...l.src, ...(vapp ? vapp.src : []), ...(add ? add.src : []), 'AL:C4'],
        `Vapp ในลมสงบตามกฎ ${JSON.stringify(vapp ? vapp.v.rule : 'VLS + 5')} ของบัตรวิจัย: VLS CONF FULL + 5 kt (ค่าต่ำสุดของ APPR COR เมื่อใช้ A/THR) ตามมวล; ส่วนเพิ่มจากลมคิดในแต่ละเที่ยวบินจาก speeds.approach_rule (SPD และ Approach ของ plan C5) [AL:C4]`, { conf: l.conf });
    }
  } else {
    const vr = leaf(card, 'speeds.VREF_kt');
    const t = tableAt(vr, 'VREF', vr.v.axes.flap ? [land] : null), tAll = tableAt(vr, 'VREF', null);
    out.VREF_kt = mk(tAll, 'kt CAS', 'aircraft', [...vr.src, 'AL:C4'], `speeds.VREF_kt ของบัตรวิจัย${vr.v.axes.flap ? ` ทุกคอลัมน์แฟลป (Vref ที่ซิมใช้ AC.Vref อ่านคอลัมน์ ${land})` : ''} ตามมวล [AL:C4]`, { conf: vr.conf });
    if (id === 'b737_800') {
      const add = leaf(card, 'ops.speed_additive');
      out.VAPP_kt = mk(tableAt({ v: t }, 'VAPP', null, 5), 'kt CAS', 'aircraft', [...vr.src, ...add.src, 'AL:C4'],
        `Vapp ในลมสงบ = Vref + 5 kt ค่าต่ำสุดของ wind additive ใน ops.speed_additive (min 2.572 m/s) ตามมวล; ส่วนเพิ่มจากลมคิดในแต่ละเที่ยวบินจาก speeds.approach_rule (SPD และ Approach ของ plan C5) [AL:C4]`, { conf: vr.conf });
    } else {
      const rule = leaf(card, 'speeds.VAPP_rule');
      out.VAPP_kt = mk(t, 'kt CAS', 'aircraft', [...vr.src, ...rule.src, 'AL:C4'],
        `Vapp ในลมสงบตามกฎ speeds.VAPP_rule ของบัตรวิจัย (VAPP = max(VmHB30 + WF, VMCL), ลมสงบ WF = 0) จึงเท่ากับ Vref (VmHB30) ตามมวล; ส่วนเพิ่มจากลมคิดในแต่ละเที่ยวบินจาก speeds.approach_rule (SPD และ Approach ของ plan C5) [AL:C4]`, { conf: vr.conf });
    }
  }
  out.approach_rule = approachRule(id, card);
  return out;
}

// speeds.approach_rule (plan C5, research R3-3 and topic 3.10): how the wind changes the approach speed of the type, in
// knots, for the functions of src/20-flight.js (SPD.vapp). The research writes the rule in text and in m/s; each number
// here is the research's own, read from its leaf and turned to knots (the generator checks it comes out as the round
// figure the rule's text states). Owner decision OD-WIND-ADDITIVE: the Boeing cap is Vref + 20 kt (FCTM 2013) and the
// Vref + 15 kt of Boeing's 2018 study stays an option labelled unconfirmed (no revised FCTM seen).
const KT_R = 0.514444;   // the research scripts' kt (m/s)
function approachRule(id, card) {
  const add = leaf(card, 'ops.speed_additive'), kt = (mps, want, what) => {
    const x = r2(mps / KT_R);
    if (x !== want) throw new Error(`${id}: ${what} ${mps} m/s is ${x} kt, not the ${want} kt of the rule`);
    return want;
  };
  if (id === 'b737_800') {
    const a = add.v;
    return mk({ kind: 'boeing', at_kt: kt(a.at_engaged_mps, 5, 'at_engaged_mps'), min_kt: kt(a.min_mps, 5, 'min_mps'), max_kt: kt(a.max_mps, 20, 'max_mps'),
      max_option_kt: 15, headwind_factor: a.headwind_factor, gust_factor: a.gust_factor, vfe_margin_kt: 5 }, '-, kt', 'aircraft', [...add.src, 'AL:C5'],
      'wind additive ของ Boeing 737: A/T ต่ออยู่ Vref + 5 kt; A/T ปลด Vref + max(5, 0.5 × headwind คงที่ + gust เต็มค่า) ไม่เกิน Vref + 20 kt และไม่เกิน VFE − 5 kt (FCTM Rev 12 ปี 2013 ผ่านแหล่งทุติยภูมิ [K35][K60]);'
      + ' ส่วน headwind คงที่ลดลงใน flare ส่วน gust คงถึงแตะพื้น [K28]; max_option_kt 15 คือเพดานที่เอกสาร Boeing ปี 2018 เสนอ (OD-WIND-ADDITIVE) แต่ยังไม่เห็น FCTM ฉบับที่แก้ จึงเป็นตัวเลือกที่ยังไม่ยืนยัน;'
      + ' VFE − 5 kt อ่านจาก aero.flaps.detents ของแฟลปนั้น (VFE_kt) [AL:C5]', { conf: add.conf, est: false });
  }
  if (AIRBUS.has(id)) {
    const a = add.v;
    return mk({ kind: 'airbus', min_kt: kt(a.appr_cor_min_mps, 5, 'appr_cor_min_mps'), max_kt: kt(a.appr_cor_max_mps, 15, 'appr_cor_max_mps'), headwind_div: 3 }, '-, kt', 'aircraft', [...add.src, 'AL:C5'],
      'VAPP ของ Airbus = VLS + APPR COR; APPR COR = 1/3 ของ headwind จากหอ จำกัดระหว่าง 5 ถึง 15 kt (5 kt เมื่อ A/THR ต่อ) gust ไม่รวมใน VAPP แต่ชดเชยด้วย GS mini (ops.gs_mini) [K7][K35];'
      + ' ไม่จำลองน้ำแข็ง (ซิมไม่มีสภาพน้ำแข็ง) [AL:C5]', { conf: add.conf, est: false });
  }
  const rule = leaf(card, 'speeds.VAPP_rule'), vmcl = leaf(card, 'speeds.VMCL_kt');
  if (id !== 'atr72_600' || !rule || !vmcl) throw new Error(`${id}: no approach rule`);
  return mk({ kind: 'atr', max_kt: kt(add.v.max_mps, 15, 'max_mps'), headwind_div: 3, gust_factor: 1, vmcl_kt: vmcl.v }, '-, kt', 'aircraft', [...add.src, ...rule.src, ...vmcl.src, 'AL:C5'],
    `VAPP ของ ATR 72-600 = max(VmHB30 + WF, VMCL); WF = min(15 kt, max(1/3 ของ headwind, gust เต็มค่า)) (${rule.v}) [K40][K41]; VmHB30 คือ Vref ของตาราง speeds.VREF_kt ที่แฟลป 30; VMCL ${vmcl.v} kt CAS ตาม AFM LIM.3 ผ่านแหล่งทุติยภูมิ [R14] [AL:C5]`,
    { conf: add.conf, est: false });
}

// Control travels the research card lacks, from the research's own text
function surfaceLeaves(id, card) {
  const out = {};
  if (id === 'atr72_600') {
    out.elevator = mk({ travel_deg: { up: 23, down: 13 } }, 'deg', 'aircraft', ['Y18', 'Y19', 'AL:C4'],
      'elevator ขึ้น 23° ลง 13° (ระบบกลไก cable) ตามข้อความหัวข้อ 3.7 (07-flight-controls.md) [Y18][Y19]; บัตรวิจัยไม่มี leaf นี้ [AL:C4]', { conf: 'กลาง' });
    out.aileron = mk({ travel_deg: { up: 14, down: 14 } }, 'deg', 'aircraft', ['Y19', 'Y17', 'AL:C4'],
      'aileron ±14° ที่ wheel ±65° ตามข้อความหัวข้อ 3.7 [Y19][Y17]; ไม่รวม roll spoiler; บัตรวิจัยไม่มี leaf นี้ [AL:C4]', { conf: 'กลาง' });
    out.rudder = mk({ travel_deg: { left: 27, right: 27 } }, 'deg', 'aircraft', ['Y17', 'Y21', 'AL:C4'],
      'rudder ±27° ในโหมดความเร็วต่ำ (TLU ลดเหลือราว 3° เหนือ 185 KIAS ยังไม่จำลอง) ตามหัวข้อ 3.7 [Y17][Y21]; บัตรวิจัยไม่มี leaf นี้ [AL:C4]', { conf: 'กลาง' });
  }
  if (id === 'a330_300') {
    const a320 = research('a320ceo').controls.surfaces.aileron;
    out.aileron = mk({ travel_deg: { up: 25, down: 25 } }, 'deg', 'aircraft', [...a320.src, 'AL:C4'],
      'ไม่พบระยะเคลื่อน aileron ของ A330 ในแหล่งสาธารณะ จึงใช้ ±25° ของ A320 (ระบบ FBW ตระกูลเดียวกัน) [AL:C4]');
    const vmca = leaf(card, 'speeds.VMCA_kt');
    out.rudder = mk({ travel_deg: { left: 30, right: 30 } }, 'deg', 'aircraft', [...vmca.src, 'AL:C4'],
      'ไม่พบระยะเคลื่อน rudder ของ A330 ในแหล่งสาธารณะ ใช้ 30° ที่งานวิจัยใช้คิด VMCA build-up (speeds.VMCA_kt, หัวข้อ 3.4.8) [AL:C4]');
  }
  return out;
}

// gear.legacy: three linear struts at the default mass (the sim's spring-damper; nose steers, mains brake)
function gearLeaf(card, m) {
  const g = (p) => leaf(card, 'gear.' + p), W = m * M.G0;
  const pn = g('geometry.nose_contact_body_extended'), pm = g('geometry.main_contact_body_extended'), hp = g('geometry.cg_height_parked');
  const xn = pn.v[0], xm = pm.v[0][0], Nn = W * (-xm) / (xn - xm), Nm = (W - Nn) / 2;
  const src = [pn.src, pm.src, hp.src].flat(), how = [];
  const strut = (s, N, z) => {
    const k0 = g(`strut_${s}.k_linear`), cl = g(`strut_${s}.c_linear`), cc = g(`strut_${s}.c_compression`), st = g(`strut_${s}.stroke`);
    const defl = z - hp.v;
    const k = k0 ? k0.v : N / defl;
    const c = cl ? cl.v : cc ? cc.v : 2 * 0.6 * Math.sqrt(k * N / M.G0);
    const stroke = st ? st.v : (N / k) / 0.3;
    for (const l of [k0, cl || cc, st]) if (l) src.push(...l.src);
    how.push(`ล้อ${s === 'nose' ? 'หน้า' : 'หลัก'}: k ${k0 ? `strut_${s}.k_linear` : `N/(z ขายืด − cg_height_parked) = N/${r4(defl)} m`}, c ${cl ? 'c_linear' : cc ? 'c_compression (ด้านยุบ)' : '2·0.6·√(k·N/g)'}, stroke ${st ? `strut_${s}.stroke` : 'ยุบสถิต/0.3 (กฎ gearStaticFrac ของรอบที่ 2)'}`);
    return { k: Math.round(k), c: Math.round(c), stroke: r4(stroke) };
  };
  const sn = strut('nose', Nn, pn.v[2]), sm = strut('main', Nm, pm.v[0][2]);
  const v = [
    { b: pn.v.slice(), ...sn, steer: true },
    { b: pm.v[0].slice(), ...sm, brake: true },
    { b: pm.v[1].slice(), ...sm, brake: true },
  ];
  return mk(v, LEGACY_U['gear.legacy'], 'gear', [...src, 'AL:C4'],
    `ขาล้อสปริง-แดมเปอร์เชิงเส้น 3 ขาของซิม (ล้อหน้าเลี้ยวได้ ล้อหลักมีเบรก; ล้อคู่และ bogie เป็นจุดสัมผัสเดียวต่อขา) b คือจุดสัมผัสเมื่อขายืดสุด`
    + ` จาก gear.geometry.*_contact_body_extended ของบัตรวิจัย ที่มวลตั้งต้น ${m} kg: น้ำหนักล้อหน้า N = W·(−x_main)/(x_nose − x_main) = ${Math.round(Nn)} N; ${how.join('; ')};`
    + ` ซิมไม่ปรับขาล้อตามมวลที่เลือก [AL:C4]`);
}

// ── Plan C7 (research round 3 task item 6, R3-6): the eye and the glide-slope antenna of each type ──
// 05-airport-geometry.md §3.5.6–§3.5.9 [D3][D4]: the manufacturers give the vertical distances between the paths of the
// pilot's eye, the glide-slope antenna and the lowest wheel on a 3° approach in a reference attitude (H1 eye to wheel,
// H2 = H1 − H eye to antenna, H antenna to wheel; H4 eye above wheel point to point). On a path descending at θ a body
// point p (FRD from the CG) at pitch ρ, wings level, has its path height above the CG's path
//   pathUp(p) = x·(sin ρ + cos ρ·tan θ) − z·(cos ρ − sin ρ·tan θ),
// its height above the CG plus the rise of the path over its distance ahead (§3.5.8 equation 1).
// The reference attitude ρ of each type (REF_PITCH): the research's approach_visual.pitch_deg where it gives one (737
// FD pitch 3.2° at Vref flaps 30 [D3], ATR ≈ 0° [D19]); the A320 family 2.5° (owner decision OD-A320-PITCH, a temporary
// estimate: topic 3.5 used 3.3°, topic 3.10 2.5°, topic 3.3 1.5°, 03-airliners.md conflict "pitch ขณะ approach ของ
// A320"); the A330 3.0°, the research's own estimate (§3.5.6, the ρ of its back-solve).
export const GS_DEG = 3;
export const REF_PITCH = { a320ceo: 2.5, a320neo: 2.5, a321ceo: 2.5, a321neo: 2.5, a330_300: 3.0 };
export function pathUp(p, rhoDeg, thDeg = GS_DEG) {
  const r = rhoDeg * Math.PI / 180, t = Math.tan(thDeg * Math.PI / 180);
  return p[0] * (Math.sin(r) + Math.cos(r) * t) - p[2] * (Math.cos(r) - Math.sin(r) * t);
}
export const refPitch = (id, card) => { const pv = val(card, 'airframe.geometry.approach_visual').pitch_deg; return typeof pv === 'number' ? pv : REF_PITCH[id]; };
// The glide-slope antenna ahead of the eye (m, along the body x): the 737's from its station (eye_pos_STA −
// gsAntenna_pos_STA, from (H − H3)/tan 3° [D3], T-D-23); the ATR's the research's assumption (§3.5.6: in the nose, 1.0 m
// below and 2.1 m ahead of the eye, "ค่าทั้งหมดนี้ต้องแทนด้วยค่าจากผู้ผลิตเมื่อหาได้"); the Airbus types have no antenna
// station, so x_ant = x_eye (§3.5.9 item 1).
const ATR_ANT_AHEAD = 2.1;
function antAhead(id, card) {
  if (id === 'b737_800') return r4(val(card, 'airframe.geometry.eye_pos_STA') - val(card, 'airframe.geometry.gsAntenna_pos_STA'));
  if (id === 'atr72_600') return ATR_ANT_AHEAD;
  return 0;
}
// eyeAntenna(id, card): { eye, ant } leaves (FRD from the CG reference). The eye keeps the research's x and y; on an
// Airbus type its z is set so that the eye's path runs H1 (Airbus 2023 issue [D4]; OD-A330-VISUAL picks the 2023 A330
// figure 11.34 m over the 2021 10.82 m [D5]) above the path of the main wheels (gear.geometry.main_contact_body_extended)
// at REF_PITCH. The research's eye z sat 0.08–0.30 m off it at that attitude: the FBW eye of the A320 family [D27] (z
// −2.098 on all four; it matches Airbus at 3.3° for the A320ceo only, T-D-10) gives H1 0.19 m (A320ceo) and 0.27 m
// (A320neo) low and 0.08 m (A321ceo) and 0.25 m (A321neo) high at 2.5°; the A330's z_eye = z_MG − B with its estimated
// B ≈ 8.0 m and A = 29.4 m (§3.5.7; the 8 % rule places the eye and the main wheels together, so it does not set H1)
// gives 0.30 m low. The 737 and the ATR keep the research's eye (Boeing's own B 3.84 m [D3]; the ATR's estimate). The
// antenna stands on the centre line (in the nose radome; ค่าประมาณ for every type but the 737), antAhead ahead of the
// eye, its z solved so that its path runs H2 (airframe.geometry.eye_to_gsAntenna_vertical) below the eye's at REF_PITCH:
//   z_ant = z_eye + (H2 + dx·(sin ρ + cos ρ·tan θ)) / (cos ρ − sin ρ·tan θ),
// the exact form of the research's z_ant = z_eye + H2 (§3.5.9 item 1, "vertical in the reference approach attitude"; with
// dx = 0 and ρ 2.5° the divisor adds 6 mm).
// eyeL: the eye leaf as copied into the simulator card (the research's, through noteRules).
export function eyeAntenna(id, card, eyeL = noteRules(structuredClone(leaf(card, 'airframe.geometry.eye_pos_FRD')))) {
  const av = leaf(card, 'airframe.geometry.approach_visual'), h2 = leaf(card, 'airframe.geometry.eye_to_gsAntenna_vertical');
  const mg = leaf(card, 'gear.geometry.main_contact_body_extended'), rho = refPitch(id, card), r = rho * Math.PI / 180, t = Math.tan(GS_DEG * Math.PI / 180);
  if (typeof rho !== 'number') throw new Error(`${id}: no reference approach pitch`);
  const w = mg.v[0], a = Math.sin(r) + Math.cos(r) * t, b = Math.cos(r) - Math.sin(r) * t;
  const odPitch = REF_PITCH[id] === 2.5 ? ' (OD-A320-PITCH: ค่าประมาณชั่วคราว ปรับใหม่เมื่อพบแหล่ง)' : '';
  let eye = eyeL;
  if (AIRBUS.has(id)) {
    const H1 = av.v.H1, z = r4(w[2] - (H1 - (eyeL.v[0] - w[0]) * a) / b);
    eye = mk([eyeL.v[0], eyeL.v[1], z], eyeL.u, eyeL.scope, [...eyeL.src, ...av.src, ...mg.src, 'AL:C7'],
      `x, y ตามบัตรวิจัย (${eyeL.v.join(', ')}); z ตั้งใหม่ให้ทางเดินตาสูงกว่าทางเดินล้อหลัก (gear.geometry.main_contact_body_extended, โช้คยืด) H1 ${H1} m`
      + ` ตามข้อมูล Airbus ฉบับ 2023 [D4] ที่แนวร่อน ${GS_DEG}° และ pitch อ้างอิง ${rho}°${odPitch}`
      + (id === 'a330_300' ? '; OD-A330-VISUAL เลือกฉบับ 2023 (H1 11.34 m) ไม่ใช่ฉบับ 2021 (10.82 m) [D5]; จุดสัมผัสล้อหลักเป็นศูนย์ bogie' : '')
      + `: z ของบัตรวิจัย ${eyeL.v[2]} ให้ H1 ${r2(pathUp(eyeL.v, rho) - pathUp(w, rho))} m ที่ pitch นี้; ตาเหนือล้อจุดต่อจุดได้ H4 ${r2((eyeL.v[0] - w[0]) * Math.sin(r) + (w[2] - z) * Math.cos(r))} m`
      + ` (Airbus ${av.v.H4} m) [AL:C7]`, { conf: 'ต่ำ' });
  }
  const dx = antAhead(id, card), dz = (h2.v + dx * a) / b;
  const v = [r4(eye.v[0] + dx), 0, r4(eye.v[2] + dz)];
  const ahead = id === 'b737_800' ? `อยู่หน้าตา ${dx} m ตาม airframe.geometry.gsAntenna_pos_STA (${val(card, 'airframe.geometry.gsAntenna_pos_STA')} m) กับ eye_pos_STA (${val(card, 'airframe.geometry.eye_pos_STA')} m)`
    : id === 'atr72_600' ? `อยู่หน้าตา ${dx} m ตามสมมติฐานของงานวิจัย (หัวข้อ 3.5.6: ในจมูก ต่ำกว่าตา 1.0 m หน้าตา 2.1 m)`
      : 'x เท่าตา (ไม่มีตำแหน่งสายอากาศของ Airbus หัวข้อ 3.5.9 ข้อ 1)';
  const src = [...eye.src, ...h2.src, ...(id === 'b737_800' ? leaf(card, 'airframe.geometry.gsAntenna_pos_STA').src : []), 'AL:C7'];
  const ant = mk(v, eye.u, eye.scope, src,
    `เสาอากาศรับ glide slope บนแนวกลางลำ ${ahead}; z ตั้งให้ทางเดินเสาอากาศต่ำกว่าทางเดินตา H2 ${h2.v} m (airframe.geometry.eye_to_gsAntenna_vertical)`
    + ` ที่แนวร่อน ${GS_DEG}° และ pitch อ้างอิง ${rho}°${odPitch}: z_ant = z_eye + (H2 + dx·(sin ρ + cos ρ·tan θ))/(cos ρ − sin ρ·tan θ) = z_eye + ${r4(dz)} m`
    + ` (รูปเต็มของ z_ant = z_eye + H2 ในหัวข้อ 3.5.9 ข้อ 1); ILS และออโต้ไพลอตอ่านที่จุดนี้ ไฟ PAPI อ่านที่ตา [AL:C7]`, { conf: id === 'b737_800' ? 'กลาง' : 'ต่ำ' });
  return { eye, ant, rho };
}

// The A330's lateral derivatives are in stability axes at α 5.74° (approach) and 2.5° (cruise); the sim uses body axes
// (04-a330-300.md §3.4.7.5). Etkin's axis transformation, checked against the research's own body-axis numbers.
const A330_ALPHA = { approach: 5.74, cruise: 2.5 };
export function stabToBody(d, aDeg) {
  const a = aDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return {
    Clb: d.Clb * c - d.Cnb * s, Cnb: d.Cnb * c + d.Clb * s,
    Clp: d.Clp * c * c - (d.Clr + d.Cnp) * s * c + d.Cnr * s * s,
    Clr: d.Clr * c * c + (d.Clp - d.Cnr) * s * c - d.Cnp * s * s,
    Cnp: d.Cnp * c * c + (d.Clp - d.Cnr) * s * c - d.Clr * s * s,
    Cnr: d.Cnr * c * c + (d.Clr + d.Cnp) * s * c + d.Clp * s * s,
    CYr: d.CYr * c + d.CYp * s,
    Clda: d.Clda * c - d.Cnda * s, Cnda: d.Cnda * c + d.Clda * s,
    Cldr: d.Cldr * c - d.Cndr * s, Cndr: d.Cndr * c + d.Cldr * s,
  };
}
const A330_BODY_CHECK = { Clb: -0.205, Cnb: 0.026, Clp: -0.492, Clr: 0.235, Cnp: -0.180, Cnr: -0.188 };   // §3.4.7.5, approach
function a330Body(doc, card) {
  const D = card.aero.derivatives, cfgs = Object.keys(A330_ALPHA), out = {};
  for (const cfg of cfgs) {
    const d = Object.fromEntries(['Clb', 'Cnb', 'Clp', 'Clr', 'Cnp', 'Cnr', 'CYp', 'CYr', 'Clda', 'Cnda', 'Cldr', 'Cndr'].map((k) => [k, D[k].v[cfg]]));
    out[cfg] = stabToBody(d, A330_ALPHA[cfg]);
  }
  for (const [k, want] of Object.entries(A330_BODY_CHECK)) {
    if (!(Math.abs(out.approach[k] - want) <= 0.0015)) throw new Error(`a330_300: body-axis ${k} ${out.approach[k]} is not the research's ${want}`);
  }
  for (const k of Object.keys(out.approach)) {
    const l = leaf(doc, 'aero.derivatives.' + k), was = JSON.stringify(l.v);
    l.v = Object.fromEntries(cfgs.map((c) => [c, r4(out[c][k])]));
    l.est = true; l.conf = 'ต่ำ'; l.src = uniq([...l.src, 'AL:C4']);
    l.note = `${EST}: แปลงจากแกน stability ของบัตรวิจัย (${was}, α ${A330_ALPHA.approach}° ที่ approach และ ${A330_ALPHA.cruise}° ที่ cruise) เป็นแกนตัวเครื่องที่ซิมใช้ ตามสูตรของ Etkin`
      + ` เพราะหัวข้อ 3.4.7.5 บอกว่าใช้ค่าแกน stability คู่กับ Ixz = 0 แล้ว Dutch roll ไม่เสถียร (ζ −0.031); ที่ approach ได้ Clβ −0.205, Cnβ 0.026, Clp −0.492, Clr 0.235, Cnp −0.180, Cnr −0.188`
      + ` ตรงกับค่าที่หัวข้อนั้นให้ (DR ζ 0.024) [AL:C4]; ${String(l.note).replace(/^ค่าประมาณ:\s*/, '')}`;
  }
}

// OD-LEMAC (R3-C5, R3-C6)
function lemacFix(id, doc) {
  const l = leaf(doc, 'airframe.cg.LEMAC_x');
  if (id === 'a321ceo' || id === 'a321neo') {
    const a320 = leaf(research('a320ceo'), 'airframe.cg.LEMAC_x');
    Object.assign(l, { v: r4(700.85 * 0.0254), u: 'm DAT', src: uniq([...a320.src, 'D14', 'AL:C4']), conf: 'ต่ำ', est: true,
      note: `${EST} (OD-LEMAC): LEMAC Sta 700.85 in = 17.8016 m จาก datum ตาม FAA TCDS A28NM ซึ่งให้ MAC และ LEMAC ชุดเดียวใน "DATA PERTINENT TO ALL MODELS" รวม A321 [L3][D14];`
        + ' แทนค่าประมาณ 19.53 m STA (LEMAC ของ A320 + ส่วนต่อหน้าปีก 4.27 m) ของหัวข้อ 3.3; datum ของ A320 อยู่หน้าจมูก 100 in แต่ของ A321 ยังไม่ยืนยัน (03-airliners.md ความขัดแย้งข้อ 5) จึงให้เป็น m DAT'
        + ' และความเชื่อมั่นต่ำ; ซิมไม่ได้อ่านค่านี้: ตำแหน่ง FRD ของล้อและเครื่องยนต์ และ x, y ของตาในบัตรเป็นของงานวิจัย (วัดจาก CG ที่ 25 % MAC บน LEMAC 19.53 m STA ของงานวิจัย) ไม่ได้เลื่อนตามค่านี้'
        + ' ส่วน z ของตาตั้งใหม่ใน plan C7 จาก H1 (ดู eye_pos_FRD); การเลื่อนตำแหน่งเหล่านี้ตาม LEMAC ของ TCDS ยังเปิดอยู่จนกว่า datum ของ A321 จะยืนยัน (ความขัดแย้งข้อ 5) และยังไม่มี plan item ใดรับ [AL:C4]' });
  }
  if (id === 'b737_800') {
    Object.assign(l, { conf: 'ต่ำ', est: true, src: uniq([...l.src, 'AL:C4']),
      note: `${EST} (OD-LEMAC): LEMAC ที่ BA 627.1 in = ${l.v} m ตามรายงาน W&B [B9] (MAC 155.8 in); หัวข้อ 3.5 ใช้ LEMAC หลังจมูก 695.05 in จากโมเดลอื่น`
        + ' ถ้าทั้งสองถูก จมูกอยู่ที่ BA ราว −68 in ซึ่งยังไม่ยืนยัน (03-airliners.md ความขัดแย้งข้อ 6) จึงลดความเชื่อมั่นเป็นต่ำ; %MAC = (BA − 627.1)/155.8 [AL:C4]' });
  }
}

// The stall-warning angles: as build_cards' solveWarn (T-A-07: trim q̇ = 0, h 1,000 m, throttle 0, gear down, ρ 1.225,
// default mass), checked at flaps 0 and the landing detent only
export function solveWarnEnds(doc, { margin = 7, tol = 0.25 } = {}) {
  const { AC, Aircraft, setAircraft, DEG, KT, G0 } = M;
  const saved = Object.entries(AC);
  try {
    setAircraft(doc);
    const clTrim = (flaps, aDeg) => {
      const ac = new Aircraft(); ac.flaps = flaps; ac.gearPos = 1; ac.thr = 0;
      const th = aDeg * DEG, d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13);
      ac.x.set([0, 0, -1000, 45, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]);
      const qd = (de) => { ac.de = de; ac.deriv(ac.x, o, d); return o[11]; };
      const q0 = qd(0), q1 = qd(-0.01); qd(-0.01 * q0 / (q0 - q1));
      return d.CL;
    };
    const v1g = (CL) => Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * CL)) / KT;
    const peak = (f) => { let pk = { CL: 0, a: 0 }; for (let i = 0; i <= 2500; i++) { const a = i * 0.01, CL = clTrim(f, a); if (CL > pk.CL) pk = { CL, a }; } return pk; };
    const solve = (f) => {
      const pk = peak(f), vs = v1g(pk.CL);
      let lo = 0, hi = pk.a;
      for (let k = 0; k < 60; k++) { const mid = 0.5 * (lo + hi); if (v1g(clTrim(f, mid)) - vs > margin) lo = mid; else hi = mid; }
      return 0.5 * (lo + hi);
    };
    const aWarn = r2(solve(0)), aWarnFlap = r2(solve(1) - aWarn);
    const checks = [0, 1].map((f) => { const pk = peak(f), vs = v1g(pk.CL), aw = aWarn + aWarnFlap * f; return { f, aWarn: aw, CLmax: pk.CL, aCLmax: pk.a, vs, margin: v1g(clTrim(f, aw)) - vs }; });
    const bad = checks.filter((c) => !(Math.abs(c.margin - margin) <= tol));
    if (bad.length) throw new Error(`warning solve: margin outside ${margin} ± ${tol} kt at f ${bad.map((c) => `${c.f} (${c.margin.toFixed(2)} kt)`).join(', ')}`);
    return { aWarn, aWarnFlap, checks };
  } finally {
    for (const k of Object.keys(AC)) if (!saved.some(([s]) => s === k)) delete AC[k];
    for (const [k, v] of saved) {
      if (Object.hasOwn(AC, k)) AC[k] = v;
      else Object.defineProperty(AC, k, { value: v, writable: true, enumerable: true, configurable: true });
    }
  }
}

// ───────────────────────── coverage (research item 39) ─────────────────────────
// The gaps of r3_merge.mjs --coverage for one type, computed as that script does (round 1 per-type paths neither filled
// nor under the research card's _na nor auto-n/a: propeller and turboprop on a jet, turbofan on the ATR, an engine class
// the type does not carry)
const R1PATHS = () => JSON.parse(fs.readFileSync(path.join(R3, 'scripts', 'r1-pertype-paths.json'), 'utf8'));
export function researchGaps(id) {
  const card = research(id), r1 = Object.keys(R1PATHS()), have = leafPaths(card), hs = new Set(have);
  const na = ((card._na && card._na.v) || []).map(String);
  const autoNA = JETS.has(id) ? ['propeller.*', 'turboprop.*'] : ['turbofan.*'];
  if (JETS.has(id)) {
    const mine = new Set(Object.keys((card.turbofan && card.turbofan.engines) || {}));
    for (const p of r1) { const m = p.match(/^turbofan\.engines\.([^.]+)\./); if (m && !mine.has(m[1])) autoNA.push(`turbofan.engines.${m[1]}.*`); }
  }
  const isNA = (p) => [...na, ...autoNA].some((n) => n === p || (n.endsWith('.*') && p.startsWith(n.slice(0, -1))) || p.startsWith(n + '.'));
  return r1.filter((p) => !(hs.has(p) || have.some((h) => h.startsWith(p + '.'))) && !isNA(p));
}
export const matches = (pat, p) => { const q = pat.endsWith('.*') ? pat.slice(0, -2) : pat; return p === q || p.startsWith(q + '.'); };

// Paths that cannot apply to the type: [patterns, reason, which types]
const HINGE = ['controls.pitch.Ch0', 'controls.pitch.Ch_alpha', 'controls.pitch.Ch_delta', 'controls.pitch.Ch_tab', 'controls.pitch.tab_max',
  'controls.roll.Ch_alpha', 'controls.roll.Ch_delta', 'controls.roll.tab_max', 'controls.yaw.Ch_beta', 'controls.yaw.Ch_delta', 'controls.yaw.tab_max'];
const NA_RULES = [
  [['otherSims.*'], 'ค่าตั้งต้นและผลของซิมอื่นที่รอบที่ 1 ใช้เทียบกับเครื่องฝึก ไม่ใช่ข้อมูลของแบบนี้', () => true],
  [['controls.reference_types.*'], 'ตัวเลขอ้างอิงของแบบอื่นที่รอบที่ 1 เก็บไว้เทียบ (ค่าของแบบนี้อยู่ใน controls.surfaces)', () => true],
  [['validation.typicalModes.*', 'validation.currentModel.*', 'validation.procedures.v50MinFactor_singleEngine'],
    'ชุดตรวจของเครื่องฝึกและแบบอ้างอิงอื่นในรอบที่ 1 (บัตร Airbus ของงานวิจัยใส่ _na ไว้แล้ว; เครื่องบินโดยสารใช้ validation.reference_modes และ validation.trim_targets)', () => true],
  [['gear.certification.part23_limit_descent', 'gear.certification.part23_wing_lift_ratio', 'gear.certification.part23_min_load_factors', 'gear.certification.part23_reserve_drop_factor'],
    'เกณฑ์ล้อของ Part 23 ใช้ไม่ได้กับเครื่องบินที่รับรองตาม Part 25 / CS-25', () => true],
  [['wind.fFactor.trainerExcessTW', 'wind.wake.trainerRollControl'], 'ค่าเฉพาะของเครื่องฝึกในรอบที่ 1', () => true],
  [['aero.spin_reference.*'], 'เครื่องบินขนส่งไม่รับรอง spin', () => true],
  [HINGE, 'hinge moment และ tab ของระบบบังคับแบบ reversible ใช้ไม่ได้กับระบบ irreversible (737) และ FBW (Airbus) (03-airliners.md งานข้อ 39); ATR เป็นระบบกลไกจึงไม่อยู่ในกลุ่มนี้', (id) => JETS.has(id)],
  [['controls.yaw.slipstream_q_ratio', 'interference.slipstream.*', 'propeller.*', 'turboprop.*'], 'เจ็ตไม่มีใบพัดและ slipstream ของใบพัด', (id) => JETS.has(id)],
  [['turbofan.*'], 'ATR 72-600 เป็นเทอร์โบพร็อป', (id) => id === 'atr72_600'],
];
const notOffered = (id) => Object.keys((research(id).turbofan && research(id).turbofan.engines) || {}).filter((c) => !RATINGS[id].includes(c)).map((c) => `turbofan.engines.${c}.*`);
// Paths that apply but the legacy mode does not read: [pattern, the item that fills it]
const DEFER_RULES = [
  ['aero.*', 'งานวิจัยรอบที่ 3 ข้อ 9 (ตารางอากาศพลศาสตร์ตาม detent) และข้อของรอบที่ 1 เรื่อง stall, buffet และ strip wing'],
  ['interference.*', 'งานวิจัยรอบที่ 3 ข้อ 9 (ground effect และ downwash) และข้อ 11 (slipstream ของ ATR)'],
  ['turbofan.*', 'งานวิจัยรอบที่ 3 ข้อ 10 (ENGINE_DB และ TurbofanEngine) และข้อ 13 (reverser), ระยะ K ของแผน'],
  ['turboprop.*', 'งานวิจัยรอบที่ 3 ข้อ 11 (เทอร์โบพร็อปสองเครื่องของ ATR)'],
  ['propeller.*', 'งานวิจัยรอบที่ 3 ข้อ 11 (ใบพัดและ governor ของ ATR)'],
  ['controls.*', 'งานวิจัยรอบที่ 3 ข้อ 17 ถึง 19, 24 และ 27 (architecture ต่อแกน, actuator, stabilizer, feel ของ 737, ระบบกลไกของ ATR)'],
  ['gear.*', 'งานวิจัยรอบที่ 3 ข้อ 40 (ล้อของเครื่องบินโดยสาร)'],
  ['numerics.*', 'งานวิจัยรอบที่ 3 ข้อ 40 (แบบจำลองแรงเสียดทานของล้อ)'],
  ['wind.*', 'งานลมของรอบที่ 1 (01-flight-physics/08-wind.md: discrete gust, wake)'],
  // plan C6 trims every type against validation.trim_targets of the research file (test/airliner.test.mjs); what stays
  // missing under validation.* is the MIL-F-8785C class of a type, which the per-type mode checks need (plan N4)
  ['validation.*', 'plan N4 (ตรวจโหมดพลวัตและสมรรถนะรายแบบ ซึ่งใช้ class และ category ของ MIL-F-8785C) และงานวิจัยรอบที่ 3 ข้อ 42 และ 43'],
  ['input.*', 'งานวิจัยรอบที่ 3 ข้อ 26 และรอบที่ 1 ข้อ 1 (คีย์แฟลปและ trim)'],
];

export function naAndDeferred(id) {
  const card = research(id), gaps = researchGaps(id);
  const own = ((card._na && card._na.v) || []).map(String);
  const rules = [...NA_RULES.filter(([, , on]) => on(id)).map(([pats, why]) => [pats, why]), [notOffered(id), 'รุ่นเครื่องยนต์ที่บัตรวิจัยสืบมาจากแบบอื่นในตระกูล แต่แบบนี้ไม่ได้ใช้ (หน้าเว็บจึงไม่ให้เลือก)']];
  const na = new Set(own), whyNA = {}, deferred = {}, left = [];
  for (const p of gaps) {
    const r = rules.find(([pats]) => pats.some((q) => matches(q, p)));
    if (r) { const q = r[0].find((x) => matches(x, p)); na.add(q); (whyNA[r[1]] ??= new Set()).add(q); continue; }
    const d = DEFER_RULES.find(([q]) => matches(q, p));
    if (d) { deferred[d[0]] ??= { item: d[1], paths: [] }; deferred[d[0]].paths.push(p); continue; }
    left.push(p);
  }
  if (left.length) throw new Error(`${id}: coverage gaps in neither _na nor _deferred: ${left.join(', ')}`);
  return { gaps, own, na: [...na].sort(), whyNA: Object.fromEntries(Object.entries(whyNA).map(([k, s]) => [k, [...s].sort()])), deferred };
}

// ───────────────────────── sources ─────────────────────────
const FIXED3 = {
  'AL:C4': { what: 'AirfieldLab plan C4, this generator\'s own derivations and the owner\'s decisions OD-LEMAC, OD-SOURCES and OD-RATINGS:'
    + ' the default mass and the masses offered, Vref, Vapp and VS0 as mass tables from the research\'s tables and rules, control travels the'
    + ' research card lacks, the gear struts, the stall-warning angles, the A330 derivatives in body axes,'
    + ' the A321 and 737-800 LEMAC, the engine ratings offered and the _na and _deferred lists', link: SELF },
  'AL:C5': { what: 'AirfieldLab plan C5 (research round 3 task item 3, R3-3) and the owner decision OD-WIND-ADDITIVE: speeds.approach_rule, this generator\'s'
    + ' transcription, in knots, of the wind rules of research topic 3.10 (the 737 additive and its two caps, the Airbus APPR COR, the ATR wind factor)', link: SELF },
  'AL:C7': { what: 'AirfieldLab plan C7 (research round 3 task item 6, R3-6) and the owner decisions OD-A320-PITCH and OD-A330-VISUAL: the pilot\'s eye'
    + ' and the glide-slope antenna placed from the manufacturers\' approach distances H1 and H2 of research topic 3.5 at a reference approach'
    + ' attitude (this generator\'s eyeAntenna)', link: SELF },
};
const PREFIX_FILE = { R: '01-atr72-600.md', B: '02-b737-800.md', L: '03-a320-a321.md', H: '04-a330-300.md', D: '05-airport-geometry.md',
  J: '06-jet-engines.md', Y: '07-flight-controls.md', Z: '08-fbw-laws.md', O: '09-afcs-autoland.md', K: '10-fctm-technique.md' };
const _refs = {};
function refLines(file) {
  if (_refs[file]) return _refs[file];
  const s = fs.readFileSync(path.join(R3, file), 'utf8'), i = s.search(/^## (?:[\d.]+ )?แหล่งอ้างอิง/m);
  const out = new Map();
  if (i >= 0) {
    const seg = s.slice(i), end = seg.slice(5).search(/^## /m), body = end < 0 ? seg : seg.slice(0, end + 5);
    for (const l of body.split('\n')) {
      const m = l.match(/^\s*(?:\d+\.\s*|[-*]\s*)?\*?\*?\[([A-Z]+\d+)\]/) || l.match(/^\|\s*\*?\*?\[?([A-Z]\d+)\]?\*?\*?\s*\|/);
      if (m && !out.has(m[1])) out.set(m[1], l);
    }
  }
  return (_refs[file] = out);
}
function hasRef(code) { const f = PREFIX_FILE[code[0]]; return !!(f && /^[A-Z]\d+$/.test(code) && refLines(f).has(code)); }
const stripMd = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/https?:\/\/[^\s,;)|]+/g, '').replace(/[*`]/g, '').replace(/<[^>]+>/g, '')
  .replace(/\(\s*(?:หรือ|or)?\s*\)/g, '').replace(/\s+([,;.)])/g, '$1').replace(/([,;])(?:\s*[,;])+/g, '$1')
  .replace(/\s+/g, ' ').replace(/\s*[·,;:.]\s*$/, '').trim();
export function sourceOf3(code) {
  if (FIXED3[code]) return FIXED3[code];
  if (/^R1:/.test(code)) return sourceOf2(code);
  const file = PREFIX_FILE[code[0]];
  if (!file || !hasRef(code)) throw new Error(`source code ${code}: no reference row in docs/research/03-airliners`);
  const line = refLines(file).get(code), rel = `docs/research/03-airliners/${file}`;
  let desc;
  if (line.trimStart().startsWith('|')) desc = line.split('|')[2];
  else {
    const body = line.replace(/^\s*(?:\d+\.\s*|[-*]\s*)?\*?\*?\[[A-Z]+\d+\]\*?\*?\s*/, ''), k = body.search(/https?:/);
    desc = (k < 0 ? body : body.slice(0, k)).split(' · ')[0];
  }
  const url = (line.match(/https?:\/\/[^\s|,;)<>`]+/) || [])[0];
  return { what: `${stripMd(desc) || code} (reference [${code}] of ${rel})`, link: url && /^https:/.test(url) ? url.replace(/[.]+$/, '') : rel };
}

function meta3(id, doc) {
  const used = new Set();
  (function walk(o) { for (const v of Object.values(o)) { if (isLeaf(v)) v.src.forEach((s) => used.add(s)); else if (isObj(v)) walk(v); } })(doc);
  return {
    id,
    source: `AirfieldLab plan C4: the round 3 research card ${id} in docs/research/03-airliners/params-${id.replace(/_/g, '-')}.json (topic file ${TOPIC[id]},`
      + ` _inherits resolved by the research's r3_merge.mjs), with the engine classes of 06-jet-engines.md and the control travels of 07-flight-controls.md;`
      + ` only what the simulator's legacy mode reads and the type's identity, weights, CG reference and classification, generated by ${SELF};`
      + ' each leaf names its sources in src, listed in _meta.sources',
    license: 'MIT (LICENSE): the repository\'s own compilation, fits and estimates; manufacturer, authority, investigation-board and airline figures used'
      + ' as cited numbers only (no text, table, figure or document copied; © their owners, see _meta.sources); a few numbers come from open'
      + ' simulator models (FlyByWire A32NX, FlightGear, JSBSim) and OpenAP, cited as numbers with their source, no code or file copied (research round 3 licence rule)',
    note: `บัตรพารามิเตอร์รุ่นทดลองของ ${val(doc, 'airframe.identity')?.model ?? id} สำหรับซิม สร้างด้วย ${SELF} จากบัตรวิจัยรอบที่ 3 ห้ามแก้ไฟล์นี้ด้วยมือ`
      + ' (แก้ไฟล์หัวข้อของงานวิจัยหรือสคริปต์แล้วสร้างใหม่) ตัวเลขการบินเกือบทั้งหมดเป็นค่าประมาณ (est true, ค่าประมาณ ใน note) จากเอกสารสาธารณะ'
      + ' ซิมบินด้วยโหมด legacy บนสมการของเครื่องฝึก (aero.legacy, propulsion.legacy) จนกว่าระยะ K ของแผนจะให้เครื่องยนต์และตาราง'
      + ' ใช้เพื่อการฝึกในเกมนี้เท่านั้น ไม่ใช้เพื่อการบินจริง; สายการบินไม่เผยแพร่มวลและ rating จริง จึงเป็นค่าตั้งต้นที่ผู้ใช้เปลี่ยนได้ (OD-RATINGS);'
      + ' รูปแบบ leaf {v, u, scope, src, conf, est, note} ตาม docs/research/01-flight-physics/schema.md และ docs/research/03-airliners/schema-ext.md;'
      + ' ความเร็วเป็น kt CAS ตามมวล (ซิมไม่มีตาราง IAS–CAS ของแบบนี้ HUD จึงแสดง KCAS); _na คือ path ของรอบที่ 1 ที่ใช้กับแบบนี้ไม่ได้'
      + ' และ _deferred คือ path ที่ใช้ได้แต่โหมด legacy ยังไม่อ่าน พร้อมงานที่จะเติม; รหัส AL:C4 ไม่ใช่รหัสของงานวิจัย',
    sources: Object.fromEntries([...used].sort().map((c) => [c, sourceOf3(c)])),
  };
}

// ───────────────────────── the card ─────────────────────────
export function buildAirliner(id) {
  if (!AIRLINER_IDS.includes(id)) throw new Error(`unknown airliner ${id} (known: ${AIRLINER_IDS.join(', ')})`);
  const card = research(id), doc = {};
  const COPY = new Set(COPIED3);
  for (const p of leafPaths(card)) {
    if (!COPY.has(p)) continue;
    const l = structuredClone(leaf(card, p));
    if (LEGACY_U[p]) l.u = LEGACY_U[p];
    put(doc, p, noteRules(l));
  }
  for (const p of COPIED3) if (!OPTIONAL.has(p) && !leaf(doc, p)) throw new Error(`${id}: the research card has no ${p}`);
  // engine classes offered (OD-RATINGS), with the CFM56-7B flat rating 30 °C on every 7B class
  for (const c of RATINGS[id]) {
    for (const k of ENGINE_LEAVES) { const l = leaf(card, `turbofan.engines.${c}.${k}`); if (l) put(doc, `turbofan.engines.${c}.${k}`, noteRules(structuredClone(l))); }
    if (!leaf(doc, `turbofan.engines.${c}.F00`)) throw new Error(`${id}: no F00 for ${c}`);
    if (/^CFM56_7B/.test(c) && !leaf(doc, `turbofan.engines.${c}.Tflat_C`)) {
      const t = leaf(card, 'turbofan.engines.CFM56_7B26_class.Tflat_C');
      put(doc, `turbofan.engines.${c}.Tflat_C`, mk(30, t.u, t.scope, [...t.src, 'AL:C4'],
        `flat rating 30 °C ของ CFM56-7B ทุก rating ตามการตัดสินใจของเจ้าของ OD-RATINGS (ค่าของ CFM56_7B26_class ในบัตรวิจัย ${t.v} ${t.u}); บัตรวิจัยไม่มีค่านี้ของ class นี้ [AL:C4]`));
    }
  }
  if (RATINGS[id].length) {
    const d = leaf(card, 'turbofan.engine_default');
    put(doc, 'turbofan.ratings_offered', mk(RATINGS[id], '-', 'engine', [...d.src, 'AL:C4'],
      `รุ่นเครื่องยนต์ที่หน้าตั้งค่าให้เลือก ค่าแรกคือ turbofan.engine_default ของบัตรวิจัย; ซิมคูณ T0 และ P ของ propulsion.legacy ด้วย F00 ของรุ่นที่เลือก/F00 ของรุ่นตั้งต้น`
      + ' (สายการบินไม่เผยแพร่ rating จริง, OD-RATINGS) [AL:C4]', { est: false, conf: 'กลาง' }));
  }
  // weights and speeds
  const tm = defaultMass(id, card);
  put(doc, 'airframe.weights.training_mass', tm);
  put(doc, 'airframe.weights.mass_options', massOptions(card, tm));
  for (const [k, l] of Object.entries(speedLeaves(id, card))) put(doc, 'speeds.' + k, l);
  for (const [k, l] of Object.entries(surfaceLeaves(id, card))) { if (leaf(doc, 'controls.surfaces.' + k)) throw new Error(`${id}: controls.surfaces.${k} exists`); put(doc, 'controls.surfaces.' + k, l); }
  lemacFix(id, doc);
  if (id === 'a330_300') a330Body(doc, card);
  // gear, layout, antenna
  put(doc, 'gear.layout', mk('tricycle_retract', '-', 'gear', [...leaf(card, 'airframe.identity').src, 'AL:C4'],
    'ล้อสามจุดแบบพับเก็บได้ (ล้อหน้าและล้อหลัก) ตามแบบของเครื่องบินโดยสาร [AL:C4]', { est: false, conf: 'สูง' }));
  put(doc, 'gear.legacy', gearLeaf(card, tm.v));
  const ea = eyeAntenna(id, card, leaf(doc, 'airframe.geometry.eye_pos_FRD'));   // plan C7
  put(doc, 'airframe.geometry.eye_pos_FRD', ea.eye);
  put(doc, 'airframe.geometry.gsAntenna_pos_FRD', ea.ant);
  // the legacy aero leaf: K_CL_offset and the warning angles
  const legacy = leaf(doc, 'aero.legacy'), off = legacy.v.K_CL_offset;
  Object.assign(legacy.v, { aWarn: 0, aWarnFlap: 0, aWarnHyst: 0.5, aWarnMinOn: 0.5 });
  const w = solveWarnEnds(doc);
  Object.assign(legacy.v, { aWarn: w.aWarn, aWarnFlap: w.aWarnFlap });
  legacy.src = uniq([...legacy.src, 'AL:C4']); legacy.est = true; legacy.conf = 'ต่ำ';
  const [c0, c1] = w.checks;
  legacy.note = `${String(legacy.note).trim().replace(/[;.]$/, '')}. ${EST} (plan C4): K_CL_offset ${off === undefined ? 'ไม่ระบุ ซิมใช้ค่าตั้งต้น 0.15 ของเครื่องฝึก (งานวิจัยออกแบบชุดนี้กับ 0.15)' : `${off} ตามบัตรวิจัย`};`
    + ` CLmax ของ blend บนเส้นของซิม (trim q̇ = 0) ${c0.CLmax.toFixed(3)} ที่ α ${c0.aCLmax.toFixed(2)}° (แฟลป 0) และ ${c1.CLmax.toFixed(3)} ที่ α ${c1.aCLmax.toFixed(2)}° (แฟลปลงจอด);`
    + ` สัญญาณเตือน stall aWarn ${w.aWarn}° และ aWarn + aWarnFlap ${r2(w.aWarn + w.aWarnFlap)}° ที่ความเร็ว 1 g สูงกว่า stall 7.00 kt ที่มวลตั้งต้น (มากกว่าเกณฑ์ 5 kt หรือ 5 % ของ CS-25.207);`
    + ' ตรวจเฉพาะแฟลป 0 และแฟลปลงจอด เพราะ CLmax ของแฟลปกลางในโหมด legacy ผิดตามที่งานวิจัยบอก (03-airliners.md งานข้อ 2) เลิกเตือนตามเครื่องฝึก 0.5° และ 0.5 s [AL:C4]';
  // _na and _deferred (research item 39)
  const cov = naAndDeferred(id);
  doc._na = mk(cov.na, '-', 'aircraft', ['AL:C4'],
    `path ของรอบที่ 1 ที่ใช้กับแบบนี้ไม่ได้: _na ของบัตรวิจัย (${cov.own.length} รายการ${cov.own.length ? `: ${(research(id)._na.note || '').trim()}` : ''})`
    + (Object.keys(cov.whyNA).length ? ` และที่ตัวอ่านเพิ่ม: ${Object.entries(cov.whyNA).map(([why, ps]) => `${why} (${ps.join(', ')})`).join('; ')}` : '')
    + '; ตัวอ่าน acFromCard ไม่อ่าน path ใน _na [AL:C4]', { est: false, conf: 'กลาง' });
  doc._deferred = mk(Object.fromEntries(Object.entries(cov.deferred).map(([k, d]) => [k, { item: d.item, paths: d.paths }])), '-', 'sim', ['AL:C4'],
    `path ของรอบที่ 1 ที่ใช้กับแบบนี้ได้แต่บัตรวิจัยยังไม่มีค่าและโหมด legacy ไม่อ่าน (${Object.values(cov.deferred).reduce((s, d) => s + d.paths.length, 0)} path) จัดกลุ่มตามงานที่จะเติม;`
    + ' ช่องว่างทุกตัวที่ r3_merge.mjs --coverage แสดงอยู่ใน _na หรือ _deferred [AL:C4]', { est: false, conf: 'กลาง' });
  doc._meta = meta3(id, doc);
  return doc;
}

export const airlinerText = (id) => JSON.stringify(buildAirliner(id), null, 1) + '\n';
