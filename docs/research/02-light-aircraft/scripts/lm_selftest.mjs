#!/usr/bin/env node
// lm_selftest.mjs — automated checks T-LM-01…T-LM-07 (lm_card on the round-1 trainer fixture must reproduce round-1's
// published regression numbers, 10-validation.md §10.0/§10.6) plus method checks of lm_polar / lm_inertia / lm_derivs /
// lm_engine / lm_prop / lm_legacy_fit when those modules exist, T-LM-22/23 (report JSON = script constants; validator clean)
// and T-LM-24 (CLI robustness of lm_derivs / lm_polar); T-LM-25…30 (19 Nov 2026): control travel from the leaf
// controls.surfaces.<s> (D2), training_mass object (D3), _na ["*"] (D5), trainer_r2 resolution against the trainer_r1 base,
// lm_lib.validate() checks (D1, D3, D4, D6, est/note) and lm_merge --strict; T-LM-31 tolerance guidance of lm_tolerance
// (lateral-directional modes, gap 17); T-LM-32 (22 Nov 2026) the copies of simulator code (simCLtrim, scoreToday) equal
// the simulator they run on. Exit code 1 on any failure.
// node scripts/lm_selftest.mjs [--json]
import fs from 'node:fs';
import path from 'node:path';
import { HERE, loadType } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, runCard, loadSim, AC_FIELDS, AC_R1 } from './lm_card.mjs';

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
    const [ine, der, crd, eng] = await Promise.all(['lm_inertia.mjs', 'lm_derivs.mjs', 'lm_card.mjs', 'lm_engine.mjs'].map(f => import('./' + f)));
    const r3 = x => Math.round(x * 1000) / 1000;
    let n = 0;
    n += !same(m.radii?.v, ine.RADII);
    n += !same(m.derivs_defaults?.v, { ...der.DEFAULTS, clalpha: r3(der.DEFAULTS.clalpha) });
    n += !same(m.lm_card_defaults?.v, crd.DEFAULTS);
    n += !same(m.fuel_density?.v, eng.FUEL_DENSITY);
    n += m.engine_lapse?.v?.ind_friction?.f !== 0.10 || m.engine_lapse?.v?.gagg_ferrar?.k !== 7.55;
    check('T-LM-22', 'methods JSON vs script constants (mismatches)', n, 0, 0);
  }
  check('T-LM-23', 'lm_merge common_light ERRORS + CONFLICTS', res.errors.length + res.conflicts.length, 0, 0);
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
// Aircraft.deriv's CL at the same α and trim elevator, out of ground effect; (b) lh_eval.scoreToday against Evaluator.score
// on a grid of touchdowns. A failure after re-pinning means a copy must be updated together with the expected values.
{
  const { simCLtrim, simTrimDe, simStallBlend } = await import('./lm_card.mjs');
  const { scoreToday } = await import('./lh_eval.mjs');
  applyAC(M, buildAC(loadType('trainer_r1'), {}));
  const AC = M.AC, DEG = Math.PI / 180, V = 50;
  let dCL = 0, dSig = 0, n = 0;
  for (const f of [0, 0.5, 1]) for (let aDeg = -4; aDeg <= 26; aDeg += 1) {
    const a = aDeg * DEG, ac = new M.Aircraft();
    ac.flaps = f; ac.gearPos = 1; ac.de = simTrimDe(AC, f, a); ac.adot = 0;
    const s = new Float64Array(13); s[2] = -1500; s[3] = V * Math.cos(a); s[5] = V * Math.sin(a); s[6] = 1;
    const diag = { wow: [], load: [] }; ac.deriv(s, new Float64Array(13), diag);
    dCL = Math.max(dCL, Math.abs(diag.CL - simCLtrim(AC, f, a)));
    dSig = Math.max(dSig, Math.abs(diag.sig - simStallBlend(a, (AC.aStall + AC.aStallFlap * f) * DEG)));
    n++;
  }
  check('T-LM-32', `simCLtrim = sim CL (max |ΔCL|, ${n} pts α −4…26°, f 0/0.5/1)`, dCL, 0, 1e-6);
  check('T-LM-32', 'simStallBlend = sim stallBlend (max |Δσ|)', dSig, 0, 1e-9);
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
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else for (const x of rows) console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.id.padEnd(8)} ${x.what.padEnd(48)} got ${String(x.got).padEnd(9)} exp ${x.exp} ± ${x.tol}`);
console.log(`${rows.filter(x => x.ok).length}/${rows.length} passed`);
process.exitCode = rows.every(x => x.ok) ? 0 : 1;
