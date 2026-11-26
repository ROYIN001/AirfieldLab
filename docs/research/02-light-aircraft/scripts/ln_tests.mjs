#!/usr/bin/env node
// Round 2 / topic 13 (LN): tests T-LN-01 … T-LN-21 on the six short TCDS-level cards of ../13-other-trainers.md
// (pa28_161, be76, p2002jf, p68c, t206h, ct4).
//   T-LN-01 … 09  data consistency (speed order, VREF/VAPP, twin speeds, training mass, detents, CLmax, merge checks,
//                 generic military text): no simulator needed
//   T-LN-10 … 15  stall in TODAY's simulator through lm_card (buildAC + stallTest) at MTOW, ±3 kt of the card VS1 / VS0
//   T-LN-16 … 21  SL full-throttle climb in today's simulator (lm_card climbSweep) at MTOW: ROC ±25 %, Vy ±6 kt
// The simulator rows need the AirfieldLab repo (test/harness.mjs, found by lm_card through $AIRFIELDLAB_ROOT); without it
// they print "ไม่รองรับในซิมวันนี้" and do not count as failures.
//   node scripts/ln_tests.mjs [--no-sim] [--json]
// Writes out/ln_tests.txt and out/ln_tests.json. Exit code 1 when a data row (01–09) fails; simulator rows are reported
// (the sim is the round-1 trainer model with legacy propulsion, so a failure there is a finding, not a broken card).
// Node >= 18, no dependencies. Data paths are relative to this file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeDir, val, leaf } from './lm_lib.mjs';
import { clmaxFromStall } from './lm_polar.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..');
const IDS = ['pa28_161', 'be76', 'p2002jf', 'p68c', 't206h', 'ct4'];
const args = process.argv.slice(2);
const LB = 0.45359237;
const r = (x, n = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** n) / 10 ** n);

const res = mergeDir(DIR);
const own = id => res.merged[id];
const sp = (id, k) => val(own(id), 'speeds.' + k);
const rows = [];
const T = (id, cond, qty, exp, src, got, ok, data = true) => rows.push({ id, cond, qty, exp, src, got, ok, data });

// ── T-LN-01 speed order VS0 < VS1 < VX ≤ VY < VNO < VNE (each card, the speeds it has) ──
{
  const bad = [], seen = [];
  for (const id of IDS) {
    const seq = ['VS0_kt', 'VS1_kt', 'VX_kt', 'VY_kt', 'VNO_kt', 'VNE_kt'].map(k => [k, sp(id, k)]).filter(([, v]) => v != null);
    for (let i = 1; i < seq.length; i++) {
      const [ka, a] = seq[i - 1], [kb, b] = seq[i];
      const ok = ka === 'VX_kt' && kb === 'VY_kt' ? a <= b : a < b;
      if (!ok) bad.push(`${id}:${ka}≥${kb}`);
    }
    seen.push(`${id} ${seq.map(([, v]) => v).join('<')}`);
  }
  T('T-LN-01', 'ทุกบัตร ความเร็วที่บัตรมี (KIAS หรือ KCAS ตามแหล่ง)', 'ลำดับ VS0 < VS1 < VX ≤ VY < VNO < VNE', 'เรียงถูกทุกบัตร', 'นิยามความเร็วของ 14 CFR Part 23 [LM3]', bad.length ? bad.join(', ') : 'เรียงถูก 6/6', bad.length === 0);
}
// ── T-LN-02 VREF / VAPP (D1) ──
{
  const bad = [], got = [];
  for (const id of IDS) {
    const c = own(id), m = val(c, 'airframe.weights.training_mass').kg, mtow = val(c, 'airframe.weights.MTOW');
    const vref = sp(id, 'VREF_kt'), vapp = sp(id, 'VAPP_kt'), vs0 = sp(id, 'VS0_kt');
    const lo = 1.2 * vs0 * Math.sqrt(m / mtow), hi = 1.45 * vs0;
    const ok = vapp >= vref && vapp - vref <= 10 && vref >= lo - 0.5 && vref <= hi + 0.5;
    got.push(`${id} ${vref}/${vapp}`);
    if (!ok) bad.push(`${id} (VREF ${vref} ช่วง ${r(lo)}–${r(hi)})`);
  }
  T('T-LN-02', 'ทุกบัตร ที่ training_mass', 'VREF / VAPP kt', 'VAPP ≥ VREF, VAPP − VREF ≤ 10, 1.2·VS0·√(m/MTOW) ≤ VREF ≤ 1.45·VS0(MTOW)', 'D1; AFH p9-3 [LM25]; 01-methods §01.1',
    (bad.length ? 'ไม่ผ่าน: ' + bad.join(', ') + '; ' : '') + got.join(', '), bad.length === 0);
}
// ── T-LN-03 twin speeds ──
{
  const got = [], bad = [];
  for (const id of ['be76', 'p68c']) {
    const vmc = sp(id, 'VMCA_kt'), vyse = sp(id, 'VYSE_kt'), vref = sp(id, 'VREF_kt');
    const ok = vmc != null && vmc < vref && (vyse == null || vmc < vyse);
    got.push(`${id} VMCA ${vmc} < VREF ${vref}${vyse != null ? ` และ < VYSE ${vyse}` : ' (ไม่มี VYSE)'}`);
    if (!ok) bad.push(id);
  }
  T('T-LN-03', 'บัตรสองเครื่องยนต์ be76, p68c', 'VMCA เทียบ VREF และ VYSE', 'VMCA < VREF และ VMCA < VYSE (เมื่อมี)', 'นิยาม VMC/VYSE ของ 14 CFR Part 23 [LM3] และ AFH [LM25]', got.join('; '), bad.length === 0);
}
// ── T-LN-04 training mass (D3) ──
{
  const bad = [], got = [];
  for (const id of IDS) {
    const c = own(id), t = val(c, 'airframe.weights.training_mass');
    const sum = t.empty_kg + t.crew_kg + t.fuel_kg, bew = val(c, 'airframe.weights.BEW_typical'), mtow = val(c, 'airframe.weights.MTOW');
    const fu = val(c, 'airframe.weights.max_fuel_usable');
    const ok = Math.abs(sum - t.kg) <= 2 && t.empty_kg === bew && t.kg <= mtow && (fu == null || t.fuel_kg <= fu);
    got.push(`${id} ${t.kg} (${r(100 * t.kg / mtow, 0)} % MTOW)`);
    if (!ok) bad.push(id);
  }
  T('T-LN-04', 'ทุกบัตร', 'training_mass kg', 'ผลรวม ±2 kg, empty_kg = BEW_typical, ≤ MTOW, fuel ≤ max_fuel_usable', 'D3; 01-methods', (bad.length ? 'ไม่ผ่าน: ' + bad.join(', ') + '; ' : '') + got.join(', '), bad.length === 0);
}
// ── T-LN-05 detents and VFE ──
{
  const bad = [];
  for (const id of IDS) {
    const c = own(id), d = val(c, 'aero.flaps.detents'), vno = sp(id, 'VNO_kt');
    const vfe = d.filter(x => x.VFE_kt != null);
    for (let i = 1; i < vfe.length; i++) if (vfe[i].VFE_kt > vfe[i - 1].VFE_kt || vfe[i].flap_deg <= vfe[i - 1].flap_deg) bad.push(`${id}:${vfe[i].name}`);
    if (vfe.some(x => x.VFE_kt > vno)) bad.push(`${id}:VFE>VNO`);
    const travel = leaf(c, 'controls.surfaces.flap')?.v?.travel_deg?.down;
    if (travel != null && travel !== Math.max(...d.map(x => x.flap_deg))) bad.push(`${id}:flap travel ${travel}`);
    const VFE = val(c, 'speeds.VFE');
    if (Object.keys(VFE).some(k => !d.find(x => x.name === k))) bad.push(`${id}:VFE name`);
  }
  T('T-LN-05', 'ทุกบัตร aero.flaps.detents กับ speeds.VFE', 'VFE ตามมุมแฟลป', 'VFE ไม่เพิ่มเมื่อแฟลปมากขึ้น, VFE ≤ VNO, มุมสุดเท่ากับ controls.surfaces.flap (เมื่อมี), ชื่อ speeds.VFE อยู่ใน detents', 'TCDS/POH ของแต่ละแบบ; D6',
    bad.length ? bad.join(', ') : 'ผ่าน 6/6', bad.length === 0);
}
// ── T-LN-06 CLmax plausibility (flags source stall speeds that physics cannot reach) ──
{
  const flagged = [], got = [];
  for (const id of IDS) {
    const c = own(id), cl = val(c, 'aero.static_long.CLmax_target');
    const dets = val(c, 'aero.flaps.detents'), cleanName = dets[0].name;
    for (const [k, v] of Object.entries(cl)) {
      const [lo, hi] = k === cleanName ? [1.1, 1.75] : [1.4, 2.4];
      got.push(`${id}:${k} ${v}`);
      if (v < lo || v > hi) flagged.push(`${id}:${k}`);
    }
  }
  const exp = 'p2002jf:UP, ct4:LDG';
  T('T-LN-06', 'CLmax_target ทุกบัตร (MTOW, จาก VS ของแหล่ง)', 'รายการ CLmax นอกช่วงปกติ (ไม่มีแฟลป 1.1–1.75, มีแฟลป 1.4–2.4)', exp + ' (สองค่าที่บันทึกใน §13.8 ข้อ 4 และ 7)',
    'ช่วง CLmax ของปีกเครื่องบินเบาตามตำรา [LM12][LM11]; 01-methods §01.5', `${flagged.join(', ') || 'ไม่มี'} [${got.join(', ')}]`, flagged.join(', ') === exp);
}
// ── T-LN-07 CLmax_target recomputed from the stall speeds (physics) ──
{
  const bad = [];
  for (const id of IDS) {
    const c = own(id), cl = val(c, 'aero.static_long.CLmax_target'), S = val(c, 'aero.ref.S'), mtow = val(c, 'airframe.weights.MTOW');
    const dets = val(c, 'aero.flaps.detents');
    for (const [k, v] of Object.entries(cl)) {
      const vs = k === dets[0].name ? sp(id, 'VS1_kt') : sp(id, 'VS0_kt');
      const x = clmaxFromStall({ mass: mtow, S, vs_kcas: vs, kind: 'min' }).CLmax_1g;
      if (Math.abs(x - v) > 0.005) bad.push(`${id}:${k} ${r(x, 3)}≠${v}`);
    }
  }
  T('T-LN-07', 'ทุกบัตร', 'CLmax_target = 0.95 · 2mg/(ρ0 S VS²) ที่ MTOW', 'ตรง ±0.005', 'lm_polar.clmaxFromStall (01-methods §01.5)', bad.length ? bad.join(', ') : 'ตรงทุกค่า', bad.length === 0);
}
// ── T-LN-08 merge checks, coverage and own WARN classes ──
{
  const errs = res.errors.filter(e => IDS.some(id => e.includes(id)));
  const confl = res.conflicts.filter(e => IDS.some(id => JSON.stringify(e).includes(id)));
  const miss = IDS.filter(id => (res.coverage[id]?.missing?.length ?? 1) !== 0);
  const OWN = ['scope', 'est', 'est_conf', 'training_mass', 'speeds', 'vapp_vref'];
  const warns = res.checks.filter(c => c.level === 'warn' && IDS.includes(c.id) && OWN.includes(c.check) && /13-other-trainers/.test(c.where || '13-other-trainers'));
  const other = res.checks.filter(c => c.level === 'warn' && IDS.includes(c.id) && !OWN.includes(c.check)).length;
  T('T-LN-08', 'lm_lib.mergeDir ของทั้งโฟลเดอร์ (= lm_merge --coverage)', 'ERRORS / CONFLICTS / path ที่ขาด / WARN ของบัตร (scope, est, est_conf, training_mass, speeds, vapp_vref)', '0 / 0 / 0 / 0',
    '_brief/schema-ext-r2.md; D1–D4 [LM0]', `${errs.length} / ${confl.length} / ${miss.length} / ${warns.length}` + (warns.length ? ' ' + warns.map(w => w.id + ':' + w.check + ':' + w.msg.slice(0, 50)).join(' | ') : '') + ` (WARN ของ 08/09 ที่อ้างบัตร: ${other}, ส่งต่อใน §13.3)`,
    errs.length + confl.length + miss.length + warns.length === 0);
}
// ── T-LN-09 generic military depiction in the ct4 card ──
{
  const txt = JSON.stringify(own('ct4'));
  const hit = txt.match(/squadron|wing\s+\d|air\s*force|navy|army|academy|RTAF|กองทัพ|กองบิน|ฝูงบิน|โรงเรียนนายเรืออากาศ|โรงเรียนการบินกำแพงแสน|สถาบันการบิน|ตราสัญลักษณ์|emblem/gi);
  T('T-LN-09', 'บัตร ct4 ทั้งก้อน', 'คำที่ระบุหน่วย ฐาน สถาบัน หรือเครื่องหมาย', 'ไม่มี', 'กฎของเจ้าของ (CLAUDE.md: military content generic)', hit ? hit.join(', ') : 'ไม่มี', !hit);
}

// ── simulator rows (lm_card) ──
let sim = null;
if (!args.includes('--no-sim')) {
  try {
    const L = await import('./lm_card.mjs');
    const M = await L.loadSim();
    sim = { L, M };
  } catch (e) { sim = null; console.error('lm_card / harness ไม่พร้อม:', e.message.split('\n')[0]); }
}
const simOut = {};
let n = 10;
for (const id of IDS) {
  const c = own(id), mtow = val(c, 'airframe.weights.MTOW');
  const vs0 = sp(id, 'VS0_kt'), vs1 = sp(id, 'VS1_kt');
  const unit = leaf(c, 'speeds.VS0_kt').u;
  const tid = `T-LN-${String(n++).padStart(2, '0')}`;
  // R2-07: with no VS1 the clean detent is still flown and must stall faster than the full flap (+1 kt), so a flap-down
  // CLmax taken as the clean one (lm_card pickCfg before R2-07: p68c 56.9 / 56.9 KEAS) fails the row
  const exp = `${vs1 != null ? 'VS1 ' + vs1 + ' / ' : ''}VS0 ${vs0} ±3 (${unit.replace('kt ', 'K')})${vs1 == null ? '; ไม่มี VS1: แฟลปขึ้น > แฟลปเต็ม + 1' : ''}`;
  const cond = `stall idle 1 kt/s 3,000 ft ปีกระดับ มวล MTOW ${r(mtow, 1)} kg (lm_card buildAC จากบัตร, R1 สำหรับ leaf ที่ _na)`;
  if (!sim) { T(tid, cond, 'V_SR KEAS แฟลปขึ้น / แฟลปเต็ม', exp, 'บัตร §13.2 (speeds.VS1_kt / VS0_kt)', 'ไม่รองรับในซิมวันนี้ (ไม่พบ harness)', null, false); continue; }
  const { L, M } = sim;
  const card = (await import('./lm_lib.mjs')).loadType(id, { dir: DIR, merged: res.merged });
  const ac = L.buildAC(card, { mass: mtow });
  const restore = L.applyAC(M, ac);
  const info = L.cardInfo(card, ac, {});
  const out = L.runCard(M, ac, info, { noGround: true });
  restore?.();
  simOut[id] = { m: ac.m, P_kW: r(ac.P / 1000, 1), T0_N: r(ac.T0, 0), stall: out.stall, climb: out.climb };
  const dn = val(c, 'aero.flaps.detents').map(d => d.name), sClean = out.stall[dn[0]], sFull = out.stall[dn.at(-1)];
  const parts = [], oks = [];
  parts.push(`${dn[0]} ${r(sClean.VSR_eas)}`);
  oks.push(vs1 != null ? Math.abs(sClean.VSR_eas - vs1) <= 3 : sClean.VSR_eas > sFull.VSR_eas + 1);
  parts.push(`${dn.at(-1)} ${r(sFull.VSR_eas)}`); oks.push(Math.abs(sFull.VSR_eas - vs0) <= 3);
  const ok = oks.every(Boolean);
  T(tid, cond, `V_SR KEAS ${dn[0]} / ${dn.at(-1)}`, exp, `บัตร §13.2 (speeds.VS1_kt / VS0_kt)`, parts.join(' / ') + (ok ? ' (ผ่าน)' : ' (ไม่ผ่าน)'), ok, false);
}
for (const id of IDS) {
  const c = own(id), mtow = val(c, 'airframe.weights.MTOW');
  const roc = val(c, 'performance.ROC_SL_fpm'), vy = sp(id, 'VY_kt');
  const tid = `T-LN-${String(n++).padStart(2, '0')}`;
  const cond = `ไต่ SL (h 30 m) ISA เต็มกำลัง${val(c, 'propulsion.layout').length > 1 ? 'สองเครื่อง' : ''} clean ${/retract/.test(val(c, 'gear.layout')) ? 'ล้อขึ้น' : ''} มวล MTOW ${r(mtow, 1)} kg`;
  const exp = `ROC ${roc} ±25 %` + (vy != null ? `; Vy ${vy} ±6` : '; Vy ไม่มีในบัตร');
  if (!simOut[id]) { T(tid, cond, 'ROC max fpm; Vy KEAS', exp, 'บัตร performance.ROC_SL_fpm / speeds.VY_kt', 'ไม่รองรับในซิมวันนี้ (ไม่พบ harness)', null, false); continue; }
  const cl = simOut[id].climb;
  const okR = Math.abs(cl.ROCmax_fpm - roc) <= 0.25 * roc, okV = vy == null || Math.abs(cl.Vy_kt - vy) <= 6;
  T(tid, cond, 'ROC max fpm; Vy KEAS', exp, `บัตร performance.ROC_SL_fpm [${leaf(c, 'performance.ROC_SL_fpm').src.join(', ')}] / speeds.VY_kt`,
    `ROC ${r(cl.ROCmax_fpm, 0)} (${r(100 * (cl.ROCmax_fpm - roc) / roc, 0)} %); Vy ${r(cl.Vy_kt)}` + (okR && okV ? ' (ผ่าน)' : ' (ไม่ผ่าน)'), okR && okV, false);
}

// ── print / write ──
const line = x => `${x.id} | ${x.cond} | ${x.qty} | ${x.exp} | ${x.src} | ${x.got} | ${x.ok == null ? 'n/a' : x.ok ? 'PASS' : 'FAIL'}`;
const txt = rows.map(line).join('\n');
const dataFail = rows.filter(x => x.data && !x.ok).length;
const simRows = rows.filter(x => !x.data && x.ok != null);
const summary = `data rows ${rows.filter(x => x.data).length - dataFail}/${rows.filter(x => x.data).length} PASS; simulator rows ${simRows.filter(x => x.ok).length}/${simRows.length} PASS` + (sim ? '' : ' (no harness)');
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out', 'ln_tests.txt'), txt + '\n' + summary + '\n');
fs.writeFileSync(path.join(HERE, 'out', 'ln_tests.json'), JSON.stringify({ _meta: { script: 'scripts/ln_tests.mjs', date: '2026-11-19' }, rows, sim: simOut }, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1) + '\n');
console.log(args.includes('--json') ? JSON.stringify(rows, null, 1) : txt);
console.log(summary);
process.exitCode = dataFail ? 1 : 0;
