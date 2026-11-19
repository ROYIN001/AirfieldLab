#!/usr/bin/env node
// lm_selftest.mjs — automated checks T-LM-01…T-LM-07 (lm_card on the round-1 trainer fixture must reproduce round-1's
// published regression numbers, 10-validation.md §10.0/§10.6) plus method checks of lm_polar / lm_inertia / lm_derivs /
// lm_engine / lm_prop / lm_legacy_fit when those modules exist, T-LM-22/23 (report JSON = script constants; validator clean)
// and T-LM-24 (CLI robustness of lm_derivs / lm_polar). Exit code 1 on any failure.  node scripts/lm_selftest.mjs [--json]
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
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else for (const x of rows) console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.id.padEnd(8)} ${x.what.padEnd(48)} got ${String(x.got).padEnd(9)} exp ${x.exp} ± ${x.tol}`);
console.log(`${rows.filter(x => x.ok).length}/${rows.length} passed`);
process.exitCode = rows.every(x => x.ok) ? 0 : 1;
