#!/usr/bin/env node
// lm_selftest.mjs — automated checks T-LM-01…T-LM-07 (lm_card on the round-1 trainer fixture must reproduce round-1's
// published regression numbers, 10-validation.md §10.0/§10.6) plus method checks of lm_polar / lm_inertia / lm_derivs /
// lm_engine / lm_prop / lm_legacy_fit when those modules exist, T-LM-22/23 (report JSON = script constants; validator clean)
// and T-LM-24 (CLI robustness of lm_derivs / lm_polar); T-LM-25…30 (19 Nov 2026): control travel from the leaf
// controls.surfaces.<s> (D2), training_mass object (D3), _na ["*"] (D5), trainer_r2 resolution against the trainer_r1 base,
// lm_lib.validate() checks (D1, D3, D4, D6, est/note) and lm_merge --strict; T-LM-31 tolerance guidance of lm_tolerance
// (lateral-directional modes, gap 17); T-LM-32 (22 Nov 2026) the copies of simulator code (simCLtrim, scoreToday) equal
// the simulator they run on; T-LM-33 (R2-04) the stall comparison (V_SR, nz at Vmin); T-LM-34 (R2-06, in lm_legacy_fit.tests)
// legacy fit without speeds.VY_kt, --T0 and the vy-mode bounds; T-LM-23 extended (R2-03) src codes resolve to a reference
// line (src_ref); T-LM-35 (R2-05) the open_model check; T-LM-36 (R2-01) schema-ext.md documents the methods leaves and the
// piston.altitude.model values; T-LM-37…39 (R2-07) per-point derivative sets in runCard, strict clean lookups (pickCfg) and
// iasCas placement of a detent with no row; T-LM-40 (R2-08) the vx_vy and xfile_vy checks; T-LM-41 (R2-19) the take-off
// lift-off state (mode r1 and the opt-in rate mode). Exit code 1 on any failure.
// node scripts/lm_selftest.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';
import { HERE, loadType } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, runCard, loadSim, takeoffTest, AC_FIELDS, AC_R1 } from './lm_card.mjs';

const rows = [];
const check = (id, what, got, exp, tol) => { const ok = Number.isFinite(got) && Math.abs(got - exp) <= tol; rows.push({ id, what, got: +(+got).toPrecision(5), exp, tol, ok }); };
const M = await loadSim();
const card = loadType('trainer_r1');
const ac = buildAC(card, {});
// T-LM-01: buildAC returns exactly the AC fields and equals today's AC for the fixture
const same = AC_FIELDS.every(k => JSON.stringify(ac[k]) === JSON.stringify(M.AC[k])) && Object.keys(ac).length === AC_FIELDS.length;
rows.push({ id: 'T-LM-01', what: 'buildAC(trainer_r1) == AC (all 51 fields)', got: same, exp: true, tol: 0, ok: same });
applyAC(M, ac);
const r = runCard(M, ac, cardInfo(card, ac), {});
check('T-LM-02', 'V_SR LDG (flaps 1, gear down) KEAS', r.stall.LDG.VSR_eas, 71.9, 0.3);
check('T-LM-02', 'V_SR UP (clean, gear up) KEAS', r.stall.UP.VSR_eas, 79.6, 0.3);
check('T-LM-03', 'Vy SL grid kt', r.climb.Vy_grid_kt, 128, 1);
check('T-LM-03', 'ROC max SL fpm', r.climb.ROC_grid_fpm, 3225, 15);
check('T-LM-04', 'glide L/D zero thrust', r.glide.zeroThrust.LD, 16.5, 0.1);
check('T-LM-04', 'glide L/D idle 0.045', r.glide.idle.LD, 21.7, 0.1);
check('T-LM-05', 'approach SP wn rad/s', r.modes.approach.sp.wn, 2.22, 0.02);
check('T-LM-05', 'approach SP zeta', r.modes.approach.sp.zeta, 0.58, 0.01);
check('T-LM-06', 'approach DR wn rad/s', r.modes.approach.dr.wn, 1.61, 0.02);
check('T-LM-06', 'approach DR zeta', r.modes.approach.dr.zeta, 0.139, 0.003);
check('T-LM-06', 'approach roll tau s', r.modes.approach.roll_tau, 0.218, 0.005);
check('T-LM-07', 'takeoff 50 ft m (VR 82, flaps 0)', r.takeoff.dist50ft_m, 590, 10);
check('T-LM-07', 'landing 50 ft max brake m', r.landing.maxBrake.total_m, 714, 15);
// T-LM-41 inputs (R2-19), flown here while M.AC is still the trainer_r1 fixture; checked at the end
const to41 = { r1: r.takeoff, r1theta14: takeoffTest(M, { f: 0, VR: r.takeoff.VR, theta: 14 }), rate5: takeoffTest(M, { f: 0, VR: r.takeoff.VR, theta: 10, mode: 'rate', rate: 5 }) };
// optional method modules
for (const [f, fn] of [['lm_polar.mjs', 'tests'], ['lm_inertia.mjs', 'tests'], ['lm_derivs.mjs', 'tests'], ['lm_engine.mjs', 'tests'], ['lm_prop.mjs', 'tests'], ['lm_legacy_fit.mjs', 'tests']]) {
  if (!fs.existsSync(path.join(HERE, f))) continue;
  const mod = await import('./' + f);
  if (typeof mod[fn] === 'function') for (const t of await mod[fn](M)) check(t.id, t.what, t.got, t.exp, t.tol);
}
// T-LM-22/23: the report's common_light.methods block equals the script constants, and the folder validates clean
{
  const { mergeDir } = await import('./lm_lib.mjs');
  const res = mergeDir(path.join(HERE, '..'), { only: 'common_light' });
  const m = res.merged?.common_light?.methods;
  if (m) {
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const [ine, der, crd, eng, pol, lfit] = await Promise.all(['lm_inertia.mjs', 'lm_derivs.mjs', 'lm_card.mjs', 'lm_engine.mjs', 'lm_polar.mjs', 'lm_legacy_fit.mjs'].map(f => import('./' + f)));
    const r3 = x => Math.round(x * 1000) / 1000;
    let n = 0;
    n += !same(m.radii?.v, ine.RADII);
    n += !same(m.derivs_defaults?.v, { ...der.DEFAULTS, clalpha: r3(der.DEFAULTS.clalpha) });
    n += !same(m.lm_card_defaults?.v, crd.DEFAULTS);
    n += !same(m.fuel_density?.v, eng.FUEL_DENSITY);
    n += m.engine_lapse?.v?.ind_friction?.f !== 0.10 || m.engine_lapse?.v?.gagg_ferrar?.k !== 7.55;
    n += m.stall_nz_at_vmin?.v?.nominal !== pol.NZ_AT_VMIN || m.stall_nz_at_vmin?.v?.compare !== 'V_SR';   // R2-04
    n += !same(m.legacy_fit?.v?.vy_bounds, lfit.FIT_BOUNDS);                                                  // R2-06
    check('T-LM-22', 'methods JSON vs script constants (mismatches)', n, 0, 0);
  }
  check('T-LM-23', 'lm_merge common_light ERRORS + CONFLICTS', res.errors.length + res.conflicts.length, 0, 0);
}
// T-LM-23 extended (R2-03): every src code has a line in the reference section of its owner file (prefix → file,
// schema-ext.md §4) or is an existing round-1 code R1:<X>n / R1:params-trainer.json[#path]; lm_merge --strict makes it an error
{
  const L = await import('./lm_lib.mjs');
  const { spawnSync } = await import('node:child_process');
  const os = await import('node:os');
  const full = L.mergeDir(path.join(HERE, '..'), {});
  check('T-LM-23', 'src codes without a reference line, whole folder (src_ref WARN)', full.checks.filter(c => c.check === 'src_ref' && c.level === 'warn').length, 0, 0);
  const sec = L.refSection('# t\n## 99.1 อื่น\n| LC5 | x |\n## 99.2 แหล่งอ้างอิง\n| รหัส | ชื่อ |\n|---|---|\n| LC1 | a |\n| [LB2] | b |\n'
    + '1. [LM3] c\n- [R1:V19] d\n| LC7, LC8 | ข้ามหัวข้อ |\nอ้างข้ามหัวข้อ: [LC9]\n### 99.2.1 ย่อย\n- [LP4] e\n## 99.3 ถัดไป\n| LC6 | f |\n');
  check('T-LM-23', 'refSection: defined = LC1 LB2 LM3 R1:V19 LP4 (not LC5/LC6 outside, not LC7/8/9 cross-refs)', [...sec.ids.keys()].join(' ') === 'LC1 LB2 LM3 R1:V19 LP4' ? 1 : 0, 1, 0);
  const idx = L.loadRefIndex(path.join(HERE, '..'));
  const cases = [['LC1', 0], ['LM29', 0], ['R1:V19', 0], ['R1:params-trainer.json', 0], ['R1:params-trainer.json#controls.yaw.S_r', 0],
    ['LC999', 1], ['LZ1', 1], ['R1:V99', 1], ['R1:Q1', 1], ['R1', 1], ['LC1 p5-12', 1], ['R1:params-trainer.json#controls.pitch.nope', 1]];
  check('T-LM-23', 'srcProblem on 12 codes (7 bad) classified right', cases.filter(([s, bad]) => !!L.srcProblem(s, 'interference.downwash.eps0', idx) === !!bad).length, cases.length, 0);
  const nest = { common_light: { evaluator: { rules: { v: { a: { src: ['R1', 'LH1'] }, b: { src: ['R1:V19'] }, c: [{ src: ['LH999'] }] }, u: '-', scope: 'sim', src: ['LH0'], conf: 'กลาง', est: false, note: '' } } } };
  check('T-LM-23', 'src lists inside v checked too (bare R1, LH999 → 2 src_ref WARN)', L.validate({ merged: nest, origin: {} }, { refs: idx }).filter(c => c.check === 'src_ref' && c.level === 'warn').length, 2, 0);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-selftest-src-'));
  const block = src => '# t\n\n```json\n' + JSON.stringify({ common_light: { methods: { zz: { v: 1, u: '-', scope: 'sim', src, conf: 'กลาง', est: false, note: '' } } } }) + '\n```\n';
  const run = a => spawnSync(process.execPath, [path.join(HERE, 'lm_merge.mjs'), '--dir', dir, '--dry', '--quiet', ...a], { encoding: 'utf8', timeout: 20000 }).status;
  fs.writeFileSync(path.join(dir, '99-test.md'), block(['LC999']));
  const bad = run([]) * 10 + run(['--strict']);
  fs.writeFileSync(path.join(dir, '99-test.md'), block(['LC1', 'R1:V19']));
  check('T-LM-23', 'lm_merge exit: LC999 default/--strict, LC1+R1:V19 --strict (100·a + 10·b + c)', bad * 10 + run(['--strict']), 10, 0);
  // --strict also fails a card with round-1 per-type paths neither filled nor in _na (coverage missing > 0)
  fs.writeFileSync(path.join(dir, '99-test.md'), '# t\n\n```json\n' + JSON.stringify({ xz: { airframe: { identity: { v: 'x', u: '-', scope: 'aircraft', src: ['LC1'], conf: 'กลาง', est: false, note: '' } } } }) + '\n```\n');
  const cov = r => r.errors.filter(e => e.startsWith('[strict] coverage ')).length;
  check('T-LM-23', 'mergeDir --strict coverage errors: card with missing round-1 paths + whole folder (10·a + b)', cov(L.mergeDir(dir, { strict: true })) * 10 + cov(L.mergeDir(path.join(HERE, '..'), { strict: true })), 10, 0);
  fs.rmSync(dir, { recursive: true, force: true });
}
// T-LM-24 (review 2026-11-18): CLI robustness of the shared tools other topics call.
//   (a) lm_derivs on a card without tail geometry must stop with exit 1 and name the missing paths (it used to print NaN silently)
//   (b) lm_polar --selftest must finish (it used to deadlock on the circular import lm_polar ↔ lm_card under top-level await)
{
  const { spawnSync } = await import('node:child_process');
  const run = (f, a) => spawnSync(process.execPath, [path.join(HERE, f), ...a], { encoding: 'utf8', timeout: 20000, env: process.env });
  const d = run('lm_derivs.mjs', ['trainer_r1']);
  check('T-LM-24', 'lm_derivs w/o tail geometry: exit 1 + names missing paths', d.status === 1 && /airframe\.tail\.S_h/.test(d.stderr) ? 1 : 0, 1, 0);
  const pz = run('lm_polar.mjs', ['--selftest']);
  let LD = NaN; try { LD = JSON.parse(pz.stdout).glide.LD; } catch { }
  check('T-LM-24', 'lm_polar --selftest finishes: glide L/D of trainer_r1', LD, 16.46, 0.05);
}
// ───────────── T-LM-25 … T-LM-30: completeness-check fixes (19 Nov 2026, gaps 2, 5, 10, 19, 20, 27; D1–D6) ─────────────
{
  const L = await import('./lm_lib.mjs');
  const { travelOf } = await import('./lm_card.mjs');
  const os = await import('node:os');
  const DEG = Math.PI / 180, lf = (v, u = '-', o = {}) => ({ v, u, scope: 'aircraft', src: ['LM0'], conf: 'กลาง', est: false, note: '', ...o });
  const clone = o => JSON.parse(JSON.stringify(o));
  // T-LM-25 (gap 2, D2): control travel read from the leaf controls.surfaces.<s> (v.travel_deg); old leaf path still read
  const fx = loadType('trainer_r1');
  check('T-LM-25', 'fixture travel via leaf v.travel_deg: deUp deg', buildAC(fx, {}).deUp / DEG, 22, 1e-9);
  const old = clone(fx); old.controls.surfaces = { elevator: { travel_deg: lf({ up: 18, down: 13 }, 'deg') }, aileron: { travel_deg: lf({ up: 20, down: 10 }, 'deg') }, rudder: { travel_deg: lf({ left: 24, right: 26 }, 'deg') } };
  const aOld = buildAC(old, {});
  check('T-LM-25', 'old leaf path (fallback): deUp/deDn/daMax/drMax sum deg', (aOld.deUp + aOld.deDn + aOld.daMax + aOld.drMax) / DEG, 18 + 13 + 15 + 24, 1e-9);
  const neu = clone(fx); neu.controls.surfaces = { elevator: lf({ travel_deg: { up: 28, down: 23 } }, 'deg'), aileron: lf({ travel_deg: { up: 20, down: 15 } }, 'deg'), rudder: lf({ travel_deg: { left: 17.73, right: 17.73 } }, 'deg') };
  const tr = [], aNew = buildAC(neu, { trace: tr });
  check('T-LM-25', 'leaf v.travel_deg (C172S TCDS 28/23, 20/15, 17.73): deUp+deDn+daMax+drMax deg', (aNew.deUp + aNew.deDn + aNew.daMax + aNew.drMax) / DEG, 28 + 23 + 17.5 + 17.73, 1e-9);
  check('T-LM-25', 'travel fields flagged R1 in the trace (must be 0)', tr.filter(t => ['deUp', 'deDn', 'daMax', 'drMax'].includes(t.field) && t.flag === 'R1').length, 0, 0);
  const sym = clone(fx); sym.controls.surfaces = { rudder: lf({ travel_deg: 30 }, 'deg') };
  check('T-LM-25', 'plain-number travel = symmetric: drMax deg', travelOf(sym, 'rudder').left, 30, 0);
  // T-LM-26 (gap 2/19, D3): training_mass as a number or as {kg, empty_kg, crew_kg, fuel_kg}
  const tmo = clone(fx); tmo.airframe.weights.training_mass = lf({ kg: 2100, empty_kg: 1700, crew_kg: 190, fuel_kg: 210 }, 'kg');
  check('T-LM-26', 'buildAC m from the D3 object kg', buildAC(tmo, {}).m, 2100, 0);
  check('T-LM-26', 'trainingMassKg: number / object / legacy keys {kg,BEW,crew,fuel}', L.trainingMassKg(fx) + L.trainingMassKg(tmo) + L.trainingMass({ airframe: { weights: { training_mass: lf({ kg: 1000, BEW: 800, crew: 150, fuel: 50 }) } } }).empty_kg, 2250 + 2100 + 800, 0);
  { const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, [path.join(HERE, 'lm_inertia.mjs'), 'da40ng'], { encoding: 'utf8', timeout: 20000 });
    const m = +(/m (\d+(?:\.\d+)?) kg/.exec(r.stdout || '')?.[1]), exp = L.trainingMassKg(loadType('da40ng'));
    check('T-LM-26', 'lm_inertia CLI on da40ng (object training_mass): exit 0 and m = kg', r.status === 0 && Math.abs(m - exp) < 0.6 ? 1 : 0, 1, 0); }
  // T-LM-27 (gap 5, D5): _na ["*"] = every remaining round-1 per-type path deliberately absent
  const r1 = JSON.parse(fs.readFileSync(L.defaultR1Paths().find(f => fs.existsSync(f)), 'utf8'));
  const cStar = L.coverageOf({ _na: lf(['*']), aero: { ref: { S: lf(16.2, 'm2') } } }, r1);
  check('T-LM-27', '_na ["*"] with one filled path: missing', cStar.missing.length, 0, 0);
  check('T-LM-27', '_na ["*"]: filled + _na = round-1 per-type paths', cStar.filled + cStar.na, Object.keys(r1).length, 0);
  check('T-LM-27', '_na ["gear.*"] only: missing = per-type paths outside gear.* and the filled one', L.coverageOf({ _na: lf(['gear.*']), aero: { ref: { S: lf(16.2, 'm2') } } }, r1).missing.length, Object.keys(r1).filter(p => !p.startsWith('gear.')).length - 1, 0);
  // T-LM-28 (gap 10): trainer_r2 resolves against the trainer_r1 base (fixture + round-1 per-type leaves), not copied into params-light.json
  const res = L.mergeDir(path.join(HERE, '..'), { checks: false });
  if (res.merged.trainer_r2) {
    check('T-LM-28', 'mergeDir: "_inherits not found" warnings for trainer_r2', res.warnings.filter(w => /^trainer_r2\._inherits/.test(w)).length, 0, 0);
    const cov = res.coverage.trainer_r2;
    check('T-LM-28', 'coverage trainer_r2 resolved, missing round-1 paths', cov?.resolved ? cov.missing.length : -1, 0, 0);
    const card = loadType('trainer_r2'), own = L.leafPaths(res.merged.trainer_r2).filter(p => !p.startsWith('_'));
    check('T-LM-28', 'loadType(trainer_r2): own leaves win, aero.ref.S from round 1 (16.3 m2)', own.every(p => JSON.stringify(L.val(card, p)) === JSON.stringify(L.val(res.merged.trainer_r2, p))) ? L.val(card, 'aero.ref.S') : NaN, 16.3, 0);
    const po = L.paramsObject(res);
    check('T-LM-28', 'params-light: trainer_r1 not copied, _meta.bases.trainer_r1 points to the base', !('trainer_r1' in po) && !!po._meta.bases?.trainer_r1?.from ? 1 : 0, 1, 0);
  }
  // T-LM-29 (gaps 0/1/15/19/20/27; D1, D3, D4, D6): validate() on a synthetic folder state
  const ias = { axes: { flap: ['UP', 'LDG'], KIAS: [50, 100] }, data: [[52, 101], [48, 98]] };   // LDG: KIAS 50→48, 100→98 KCAS
  const merged = {
    xa: {
      airframe: { weights: { training_mass: lf(1000, 'kg'), BEW_typical: lf(700, 'kg') } },
      aero: { flaps: { detents: lf([{ name: 'UP', flap_deg: 0 }, { name: 'LDG', flap_deg: 40 }]) } },
      speeds: { VREF_kt: lf(70, 'kt CAS'), VAPP_kt: lf(74, 'kt IAS'), ias_cas: lf(ias, 'kt') },   // 74 KIAS = 72.4 KCAS ≥ 70
      gear: { layout: lf('tricycle_fixed', '-', { scope: 'aircraft' }) },                             // D4: should be "gear"
      piston: { identity: lf({ model: 'x' }, '-', { scope: 'engine', est: true, note: 'from brochure' }) },          // est without ประมาณ
      propeller: { identity: lf({ kind: 'fixed' }, '-', { scope: 'propeller', note: 'ค่าประมาณ จากรูปถ่าย' }) },  // est:false + ค่าประมาณ
      performance: { glide: lf({ ratio: 9 }, '-', { est: true, conf: 'สูง', note: 'ค่าประมาณ จาก polar' }) },     // est_conf
      validation: { x: lf(1, '-', { note: 'ไม่ใช่ค่าประมาณ อ่านตรงจาก AFM' }) },                                 // negated: no warning
      ops: { attitude_power: { final: lf({ ias_kt: 74, flap: 'LDG' }, 'kt IAS, deg, -, -, fpm'), base: lf({ ias_kt: 80, flap: 'FULL' }, 'kt IAS') } },
      procedures: { stabilised: lf({ Vapp: { 900: 70, 1000: 76 }, landingFlaps: ['LDG', 'T/O'] }, 'kt IAS') },
    },
    xb: { _inherits: lf('xa'), speeds: { VAPP_kt: lf(68, 'kt CAS') }, airframe: { weights: { training_mass: lf({ kg: 990, empty_kg: 700, crew_kg: 170, fuel_kg: 120 }, 'kg') } } },
    xc: { _inherits: lf('xa'), ops: { attitude_power: { final: lf({ ias_kt: 70, flap: 'LDG' }, 'kt IAS', { note: 'แก้มวล จาก 74 KIAS ที่ 1,000 kg' }) } }, airframe: { weights: { training_mass: lf({ kg: 900, BEW: 710, crew: 170, fuel: 30 }, 'kg') } } },
    xd: { _na: lf(['*']), otherSims: { y: lf(1) } },
    common_light: { methods: { z: lf(1, '-', { scope: 'aircraft' }) } },
  };
  const C = L.validate({ merged, origin: {} }, { r1 });
  const n = (id, ck, lvl = 'warn') => C.filter(c => c.id === id && c.check === ck && c.level === lvl).length;
  check('T-LM-29', 'scope D4: xa gear.layout "aircraft" → warn; common_light "aircraft" → warn', n('xa', 'scope') + n('common_light', 'scope'), 2, 0);
  check('T-LM-29', 'est: est:true w/o ประมาณ + est:false with ค่าประมาณ (negation ignored)', n('xa', 'est'), 2, 0);
  check('T-LM-29', 'est_conf: est:true with conf สูง', n('xa', 'est_conf'), 1, 0);
  check('T-LM-29', 'training_mass: number (xa 1), clean D3 object (xb 0), legacy keys + sum + empty≠BEW_typical (xc 3)', n('xa', 'training_mass') * 100 + n('xb', 'training_mass') * 10 + n('xc', 'training_mass'), 100 + 0 + 3, 0);
  check('T-LM-29', 'VAPP ≥ VREF in CAS: xa ok (74 KIAS = 72.4 KCAS ≥ 70), xb 68 KCAS < 70 → warn', n('xa', 'vapp_vref') * 10 + n('xb', 'vapp_vref'), 1, 0);
  check('T-LM-29', 'xfile_vapp: xa 08 = card, 09 {1000: 76} vs 74 → 1; xb 68 KCAS = 70 KIAS vs inherited 74 and 76 @990 kg → 2', n('xa', 'xfile_vapp') * 10 + n('xb', 'xfile_vapp'), 12, 0);
  check('T-LM-29', 'xfile_vapp: note "แก้มวล" → info, not warn (xc)', n('xc', 'xfile_vapp') * 10 + n('xc', 'xfile_vapp', 'info'), 1 + 10 * 1, 0);
  check('T-LM-29', 'detent D6: "FULL" (08 base) and "T/O" (09) not card names → 2 warn', n('xa', 'detent'), 2, 0);
  check('T-LM-29', '_na ["*"] id (xd): no card checks', C.filter(c => c.id === 'xd').length, 0, 0);
  // T-LM-30: --strict turns the WARN into ERRORS (exit 1); default exit 0
  { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-selftest-'));
    fs.writeFileSync(path.join(dir, '99-test.md'), '# test\n\n```json\n' + JSON.stringify({ xa: merged.xa }) + '\n```\n');
    const { spawnSync } = await import('node:child_process');
    const run = a => spawnSync(process.execPath, [path.join(HERE, 'lm_merge.mjs'), '--dir', dir, '--dry', '--quiet', ...a], { encoding: 'utf8', timeout: 20000 });
    check('T-LM-30', 'lm_merge exit code default / --strict on a folder with WARN only', run([]).status * 10 + run(['--strict']).status, 1, 0);
    fs.rmSync(dir, { recursive: true, force: true }); }
}
// T-LM-31 (gap 17): tolerance guidance for lateral-directional mode tests (lm_tolerance.mjs, §01.3.4) stays as documented
{
  const T = await (await import('./lm_tolerance.mjs')).run();
  const g = (id, cls, q, i) => T.cards.find(c => c.id === id).range[cls][q][i];
  check('T-LM-31', 'c172s validated: DR wn ratio 10·min + max (min 0.90, max 1.37)', g('c172s', 'validated', 'dr_wn', 0) * 10 + g('c172s', 'validated', 'dr_wn', 1), 0.90 * 10 + 1.37, 0.05);
  check('T-LM-31', 'pc9m unvalidated (×1.5): tauR ratio max', g('pc9m', 'unvalidated', 'tauR', 1), 2.00, 0.05);
  check('T-LM-31', 'da40ng unvalidated: spiral changes sign at a corner (t2 min < 0)', g('da40ng', 'unvalidated', 'spiral_t2', 0) < 0 ? 1 : 0, 1, 0);
  // the report leaf common_light.methods.lateral_mode_tolerance must envelope what the script computes for all three cards
  const { mergeDir, val } = await import('./lm_lib.mjs');
  const leafT = val(mergeDir(path.join(HERE, '..'), { only: 'common_light', checks: false }).merged.common_light, 'methods.lateral_mode_tolerance');
  if (leafT) {
    let bad = 0;
    for (const [cls, key] of [['validated', 'validated_class'], ['unvalidated', 'unvalidated_class']]) for (const q of ['dr_wn', 'dr_zeta', 'tauR'])
      for (const c of T.cards) { const r = c.range[cls][q]; if (r[0] < leafT[key][q][0] - 1e-9 || r[1] > leafT[key][q][1] + 1e-9) bad++; }
    check('T-LM-31', 'methods.lateral_mode_tolerance envelopes lm_tolerance (cards outside)', bad, 0, 0);
  }
}
// T-LM-32 (plan PR B5, 22 Nov 2026): the copies of simulator code in the scripts still equal the simulator they run on
// (the commit pinned in scripts/sim-snapshot.json under lm_ci.mjs). (a) lm_card.simCLtrim (stallBlend + the CL line) against
// Aircraft.deriv's CL at the same α and trim elevator, out of ground effect; (a2) the Cm line copied in lm_card.simTrimDe:
// at its elevator (when not on a stop) the sim's pitch acceleration q̇ must be zero, so a change of the sim's Cm line fails
// here (review of PR B5); (b) lh_eval.scoreToday against Evaluator.score
// on a grid of touchdowns. A failure after re-pinning means a copy must be updated together with the expected values.
{
  const { simCLtrim, simTrimDe, simStallBlend } = await import('./lm_card.mjs');
  const { scoreToday } = await import('./lh_eval.mjs');
  applyAC(M, buildAC(loadType('trainer_r1'), {}));
  const AC = M.AC, DEG = Math.PI / 180, V = 50;
  let dCL = 0, dSig = 0, dQ = 0, n = 0, nFree = 0;
  for (const f of [0, 0.5, 1]) for (let aDeg = -4; aDeg <= 26; aDeg += 1) {
    const a = aDeg * DEG, ac = new M.Aircraft();
    ac.flaps = f; ac.gearPos = 1; ac.de = simTrimDe(AC, f, a); ac.adot = 0;
    const s = new Float64Array(13); s[2] = -1500; s[3] = V * Math.cos(a); s[5] = V * Math.sin(a); s[6] = 1;
    const diag = { wow: [], load: [] }, out = new Float64Array(13); ac.deriv(s, out, diag);
    dCL = Math.max(dCL, Math.abs(diag.CL - simCLtrim(AC, f, a)));
    if (ac.de > -AC.deUp + 1e-9 && ac.de < AC.deDn - 1e-9) { dQ = Math.max(dQ, Math.abs(out[11])); nFree++; }
    dSig = Math.max(dSig, Math.abs(diag.sig - simStallBlend(a, (AC.aStall + AC.aStallFlap * f) * DEG)));
    n++;
  }
  check('T-LM-32', `simCLtrim = sim CL (max |ΔCL|, ${n} pts α −4…26°, f 0/0.5/1)`, dCL, 0, 1e-6);
  check('T-LM-32', 'simStallBlend = sim stallBlend (max |Δσ|)', dSig, 0, 1e-9);
  check('T-LM-32', `simTrimDe = sim Cm trim: max |q̇| rad/s² (${nFree} pts off the stops)`, nFree ? dQ : NaN, 0, 1e-6);
  const ev = new M.Flight().ev, P = { Vref: AC.Vref };
  let bad = 0, m = 0;
  // one value inside every band of every part (sink 180/360/600 fpm, position 0/220/300/600/750/900 m, centre line 2/5/10 m, …)
  for (const sink of [100, 190, 250, 400, 500, 700]) for (const s of [-10, 210, 250, 450, 650, 800, 950]) for (const y of [1, 3, 7, 12]) for (const dv of [-14, -10, -3, 8, 15])
    for (const phi of [2, 5, 8]) for (const crab of [-2, 5, -8]) for (const latV of [0.5, 1.2, 2]) for (const nose of [false, true]) {
      const td = { vs: -sink, s, y, ias: AC.Vref + dv, phi, crab, latV, wow: nose ? [true, false, false] : [false, true, true] };
      ev.td = { vsFpm: td.vs, s, tl: y, ias: td.ias, bank: phi, crab, drift: latV, noseFirst: nose, onRunway: s >= 0 && s <= M.FIELD.rwyLen && Math.abs(y) <= M.FIELD.rwyWid / 2 };
      ev.events = [];
      bad += ev.score().total !== scoreToday([{ wow: [false, false, false] }, td], P); m++;
    }
  check('T-LM-32', `lh_eval.scoreToday = Evaluator.score (mismatches of ${m} touchdowns)`, bad, 0, 0);
}
// T-LM-33 (R2-04, plan PR B5): the project's stall comparison. stallTest reports nz at Vmin, and V_SR (the number compared
// with VS_POH/√0.95) does not depend on the start speed of the 1 kt/s entry while Vmin does. trainer_r1, both detents.
{
  const { stallTest, simCLmax } = await import('./lm_card.mjs');
  applyAC(M, buildAC(loadType('trainer_r1'), {}));
  for (const [nm, f, g] of [['UP', 0, 0], ['LDG', 1, 1]]) {
    const vs = Math.sqrt(2 * M.AC.m * 9.80665 / (1.225 * M.AC.S * simCLmax(M.AC, f).CL)) / 0.514444;
    const s = [1.2, 1.35, 1.5].map(k => stallTest(M, { ias0: Math.round(k * vs), flaps: f, gear: g }));
    const spread = a => Math.max(...a) - Math.min(...a);
    check('T-LM-33', `${nm}: V_SR spread over start 1.20/1.35/1.50 Vs (kt)`, spread(s.map(x => x.VSR_eas)), 0, 0.3);
    check('T-LM-33', `${nm}: nz_Vmin reported, below nz at CLmax (count)`, s.filter(x => Number.isFinite(x.nz_Vmin) && x.nz_Vmin < x.nz).length, 3, 0);
  }
}
// T-LM-35 (R2-05, 03-open-models §03.5.2, T-LB-17/18): validate() check open_model on a synthetic card, and 0 WARN on the folder
{
  const L = await import('./lm_lib.mjs');
  const lf = (v, u = '-', o = {}) => ({ v, u, scope: 'aircraft', src: ['LC1'], conf: 'กลาง', est: false, note: '', ...o });
  const merged = { xo: {
    speeds: { VS1_kt: lf(54.49, 'kt CAS'), VS0_kt: lf(48, 'kt CAS'), VY_kt: lf(95.6, 'kt CAS', { src: ['LB2'] }), VX_kt: lf(60, 'kt IAS', { src: ['LB2', 'LC1'] }) },
    performance: { glide: lf({ speed_kt: 85, ratio: 10.5 }, 'kt IAS, -') },
    validation: { openModels: { jsbsim_x: {
      stall_vs: lf({ 0: 54.49, 30: 48.77 }, 'kt CAS', { src: ['LB1', 'LB2'] }), vy: lf(95.6, 'kt CAS', { src: ['LB1', 'LB2'] }),
      glide_best_speed: lf(85, 'kt CAS', { src: ['LB1'] }), glide_ld_max: lf(10.46, '-', { src: ['LB1'] }) } } } } };
  const C = L.validate({ merged, origin: {}, openSrc: new Map([['LB1', 'x'], ['LB2', 'x']]) }).filter(c => c.check === 'open_model');
  const n = lvl => C.filter(c => c.level === lvl).length;
  // WARN: VY src only LB2; VS1 54.49 and VY 95.6 digit for digit. info: VX mixed src; glide 85 (whole number); L/D 10.46 → 10.5
  check('T-LM-35', 'open_model synthetic: 10·WARN + info (VY src LB2, VS1 54.49, VY 95.6 | VX mixed, glide 85, L/D 10.5)', n('warn') * 10 + n('info'), 33, 0);
  const real = L.mergeDir(path.join(HERE, '..')).checks.filter(c => c.check === 'open_model');
  check('T-LM-35', 'open_model on the folder: WARN (info rows are for review)', real.filter(c => c.level === 'warn').length, 0, 0);
}
// T-LM-36 (R2-01): schema-ext.md documents every common_light.methods leaf (a row "| `methods.<key>` |") and no key that
// is gone, and lists the four piston.altitude.model values; the cards use only those four
{
  const L = await import('./lm_lib.mjs');
  const doc = fs.readFileSync(path.join(HERE, '..', 'schema-ext.md'), 'utf8');
  const res = L.mergeDir(path.join(HERE, '..'), { checks: false });
  const keys = Object.keys(res.merged.common_light?.methods || {});
  const rowsDoc = [...doc.matchAll(/^\| `methods\.([a-z_0-9]+)` \|/gm)].map(m => m[1]);
  check('T-LM-36', `methods leaves without a schema-ext row + rows without a leaf (${keys.length} leaves)`, keys.filter(k => !rowsDoc.includes(k)).length + rowsDoc.filter(k => !keys.includes(k)).length, 0, 0);
  const ENUM = ['gagg_ferrar', 'ind_friction', 'turbo_flat', 'table'];
  check('T-LM-36', 'schema-ext lists piston.altitude.model = the 4 values', doc.includes(ENUM.map(x => '`"' + x + '"`').join(' | ')) ? 1 : 0, 1, 0);
  const used = Object.keys(res.merged).map(id => L.leaf(res.merged[id], 'piston.altitude')?.v?.model).filter(Boolean);
  check('T-LM-36', `cards with piston.altitude.model outside the 4 values (of ${used.length})`, used.filter(m => !ENUM.includes(m)).length, 0, 0);
}
// T-LM-37 (R2-07): runCard linearises the cruise point with the card's "cruise" derivatives and the approach point with
// "approach" (derivSets + withDerivs); c172s keys 9 lateral/rate derivatives by config and none of the fields the stall
// solve uses, so its cruise modes must equal a run of the AC built with buildAC({config: 'cruise'})
{
  const L = await import('./lm_card.mjs');
  const c = loadType('c172s'), sets = L.derivSets(c);
  check('T-LM-37', 'derivSets(c172s): cruise keys taken from "cruise" (count of 9)', Object.values(sets.keys.cruise).filter(k => k === 'cruise').length, 9, 0);
  const a = L.buildAC(c, {}), rs = L.applyAC(M, a);
  const rc = L.runCard(M, a, L.cardInfo(c, a), { noGround: true });
  rs();
  const aC = L.buildAC(c, { config: 'cruise' }), rs2 = L.applyAC(M, aC);
  const ci = L.cardInfo(c, aC);
  const ref = L.modes(M, { ias: ci.cruise.ias, h: ci.cruise.h, flaps: 0, gear: ci.retract ? 0 : 1, gammaDeg: 0 }, { adot: true });
  rs2();
  check('T-LM-37', 'c172s runCard cruise DR wn − buildAC(config cruise) DR wn', rc.modes.cruise.dr.wn - ref.dr.wn, 0, 1e-9);
  check('T-LM-37', 'c172s runCard cruise roll tau − buildAC(config cruise)', rc.modes.cruise.roll_tau - ref.roll.tau, 0, 1e-9);
  check('T-LM-37', 'c172s runCard modes: derivSet cruise / approach recorded (count)', (rc.modes.cruise.derivSet === 'cruise') + (rc.modes.approach.derivSet === 'approach'), 2, 0);
}
// T-LM-38 (R2-07): a clean lookup never falls back to a flap-down key (p68c has CLmax_target only for flap 35)
{
  const L = await import('./lm_card.mjs');
  check('T-LM-38', 'pickCfg({35: 1.996}, clean keys, strict) is null', L.pickCfg({ 35: 1.996 }, ['clean', 'cruise', '0', 'UP'], { strict: true }) === null ? 1 : 0, 1, 0);
  check('T-LM-38', 'pickCfg not strict marks the first-key fallback', L.pickCfg({ 35: 1.996 }, ['clean'])?.fallback ? 1 : 0, 1, 0);
  const c = loadType('p68c'), tr = [], a = L.buildAC(c, { trace: tr }), rs = L.applyAC(M, a);
  const st = L.runCard(M, a, L.cardInfo(c, a), { quick: true }).stall; rs();
  check('T-LM-38', 'p68c aStall from AC_R1, flagged R1 (not the flap-35 CLmax)', tr.find(t => t.field === 'aStall')?.flag === 'R1' ? 1 : 0, 1, 0);
  const names = Object.keys(st);
  check('T-LM-38', `p68c V_SR ${names[0]} − ${names.at(-1)} KEAS (clean stalls faster, > 1)`, st[names[0]].VSR_eas - st[names.at(-1)].VSR_eas > 1 ? 1 : 0, 1, 0);
}
// T-LM-39 (R2-07): iasCas places a detent with no row by flap angle: c172s flap 20 between rows 10 and 30 (w 0.5), the
// clean row of a table that names it UP for '0' (alias), an unknown name keeps the first row (unknown)
{
  const Lb = await import('./lm_lib.mjs');
  const c = loadType('c172s'), t20 = Lb.iasCas(c, '20', { warn: false }), t10 = Lb.iasCas(c, '10'), t30 = Lb.iasCas(c, '30');
  check('T-LM-39', `c172s flap 20: how interp (${t20.how}), w`, t20.how === 'interp' ? t20.w : NaN, 0.5, 1e-12);
  check('T-LM-39', 'c172s flap 20: CAS(60 KIAS) − mean of rows 10 and 30', t20.f(60) - 0.5 * (t10.f(60) + t30.f(60)), 0, 1e-9);
  check('T-LM-39', 'c172s flap 20: inv(f(60)) = 60', t20.inv(t20.f(60)), 60, 1e-9);
  const d = loadType('da40ng');
  check('T-LM-39', `da40ng "0" → its clean row by alias (${Lb.iasCas(d, '0', { warn: false }).row})`, Lb.iasCas(d, '0', { warn: false }).how === 'alias' ? 1 : 0, 1, 0);
  check('T-LM-39', 'unknown detent name → how unknown (first row)', Lb.iasCas(c, 'nonsense', { warn: false }).how === 'unknown' ? 1 : 0, 1, 0);
}
// T-LM-40 (R2-08): vx_vy and xfile_vy on synthetic cards (speeds.climb_basis labels the flap and mass of VX and VY)
{
  const L = await import('./lm_lib.mjs');
  const lf = (v, u = '-', o = {}) => ({ v, u, scope: o.scope ?? 'aircraft', src: o.src ?? ['LM0'], conf: o.conf ?? 'กลาง', est: o.est ?? false, note: o.note ?? '' });
  const base = { airframe: { weights: { training_mass: lf(1000, 'kg') } }, aero: { flaps: { detents: lf([{ name: 'UP', flap_deg: 0 }, { name: 'T/O', flap_deg: 20 }, { name: 'LDG', flap_deg: 40 }]) } } };
  const sp = (vx, vy, more = {}) => ({ VREF_kt: lf(60, 'kt IAS'), VAPP_kt: lf(65, 'kt IAS'), VX_kt: lf(vx, 'kt IAS'), VY_kt: lf(vy, 'kt IAS'), ...more });
  const merged = {
    ya: { ...base, speeds: sp(78, 72) },                                                                                         // VX > VY, no basis → warn
    yb: { ...base, speeds: sp(78, 72, { climb_basis: lf({ VX: { flap: 'UP', mass_kg: 1310 }, VY: { flap: 'T/O', mass_kg: null } }, '-, kg') }) },   // flaps differ → info
    yc: { ...base, speeds: sp(80, 79, { climb_basis: lf({ VX: { flap: 'UP', mass_kg: 1200 }, VY: { flap: 'UP', mass_kg: 1000 } }, '-, kg') }) },   // 80·√(1000/1200) = 73.0 ≤ 79 → ok
    yd: { ...base, speeds: sp(70, 79),
      ops: { attitude_power: { initial_climb: lf({ ias_kt: 77, flap: 'UP' }, 'kt IAS, deg, -, -, fpm') } },                   // 77 vs 79, no แก้มวล → warn
      procedures: { pattern: lf({ climb: 77, final: 65 }, 'kt IAS', { note: 'climb แก้มวล ที่มวลฝึก' }) } },                     // 77 vs 79, แก้มวล → info
    ye: { _inherits: lf('yd'), speeds: { VY_kt: lf(77, 'kt IAS') } },                                                          // inherited 08/09 = own VY → 0
  };
  const C = L.validate({ merged, origin: {} }, {});
  const n = (id, ck, lvl = 'warn') => C.filter(c => c.id === id && c.check === ck && c.level === lvl).length;
  check('T-LM-40', 'vx_vy: ya no basis 78 > 72 → warn; yb flaps UP/T/O → info; yc √m-scaled 73.0 ≤ 79 → 0', n('ya', 'vx_vy') * 100 + n('yb', 'vx_vy', 'info') * 10 + n('yc', 'vx_vy') + n('yc', 'vx_vy', 'info'), 110, 0);
  check('T-LM-40', 'xfile_vy: yd 08 77 vs 79 → warn, 09 แก้มวล → info; ye inherits 77 = own VY → 0', n('yd', 'xfile_vy') * 100 + n('yd', 'xfile_vy', 'info') * 10 + n('ye', 'xfile_vy') + n('ye', 'xfile_vy', 'info'), 110, 0);
  const real = L.validate(L.mergeDir(path.join(HERE, '..'), { checks: false }), {});
  check('T-LM-40', 'vx_vy + xfile_vy WARN on the folder', real.filter(c => (c.check === 'vx_vy' || c.check === 'xfile_vy') && c.level === 'warn').length, 0, 0);
}
// T-LM-41 (R2-19): the lift-off state that explains V_LOF > VR. Mode r1 (round-1 law, the default) lifts the nose 1.35 s
// after VR and the mains during the 3 deg/s attitude ramp at θ 7.2°, CL 0.85, so V_LOF does not move with the target θ;
// the opt-in pitch-rate mode (5 deg/s, an estimate) lifts off earlier. Values measured on the pinned sim, 25 Nov 2026.
{
  const { r1, r1theta14: t14, rate5 } = to41;
  check('T-LM-41', 'r1: V_LOF kt (VR 82)', r1.V_LOF_kt, 99.2, 0.3);
  check('T-LM-41', 'r1: θ at lift-off deg', r1.theta_LOF_deg, 7.2, 0.3);
  check('T-LM-41', 'r1: CL at lift-off', r1.CL_LOF, 0.85, 0.03);
  check('T-LM-41', 'r1: VR → nose-wheel lift s', r1.tVRtoNose_s, 1.35, 0.1);
  check('T-LM-41', 'r1: V_LOF(θ 14) − V_LOF(θ 10) kt', t14.V_LOF_kt - r1.V_LOF_kt, 0, 0.1);
  check('T-LM-41', 'rate 5°/s: V_LOF kt', rate5.V_LOF_kt, 92.8, 0.5);
  check('T-LM-41', 'rate 5°/s: 50 ft distance m', rate5.dist50ft_m, 549, 10);
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else for (const x of rows) console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.id.padEnd(8)} ${x.what.padEnd(48)} got ${String(x.got).padEnd(9)} exp ${x.exp} ± ${x.tol}`);
console.log(`${rows.filter(x => x.ok).length}/${rows.length} passed`);
process.exitCode = rows.every(x => x.ok) ? 0 : 1;
