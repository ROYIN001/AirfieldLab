// lf_fit.mjs — legacy fit of the c152 card (topic 11) with the LM procedure (lm_legacy_fit.legacyFit + checkFit),
// using the BEM static thrust of lm_prop (lf_calc) as T0 instead of the momentum-theory default.
// Run from the repo root:  node <this folder>/lf_fit.mjs [--mode static|vy] [--T0 N]   → scripts/out/lf_legacy.json (+ lf_legacy_<mode>.json)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyFit, checkFit } from './lm_legacy_fit.mjs';
import { loadType, isMainModule } from './lm_lib.mjs';
import { compute } from './lf_calc.mjs';
import { patchTravel } from './lf_card.mjs';
import { solveStallCentre } from './lm_card.mjs';
import { val } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, '');

export async function fit({ mode = 'static', T0 = null } = {}) {
  const card = loadType('c152');
  // drop an existing propulsion.legacy / aero.legacy so the fit starts from the physical card values
  if (card.propulsion) delete card.propulsion.legacy;
  if (card.aero) delete card.aero.legacy;
  const t0 = T0 ?? compute().prop.static.T0_N;
  const f = legacyFit(card, { mode, T0: mode === 'static' ? t0 : null });
  // workaround (lf_card.mjs): lm_card.buildAC ignores the card's control travel; apply TCDS travel, then re-solve the
  // stall blend centres so the trimmed CLmax still equals the POH-derived targets with the real elevator authority
  const plog = patchTravel(f.ac, card);
  const tg = val(card, 'aero.static_long.CLmax_target');
  f.ac.aStall = +solveStallCentre(f.ac, 0, tg['0']).toFixed(2);
  f.ac.aStallFlap = +((solveStallCentre(f.ac, 1, tg['30']) - f.ac.aStall) / 1).toFixed(2);
  f.legacy.aero.aStall = f.ac.aStall; f.legacy.aero.aStallFlap = f.ac.aStallFlap;
  f.notes.push(`travel patched (${plog.join(', ')}); stall centres re-solved: aStall ${f.ac.aStall}, aStallFlap ${f.ac.aStallFlap}`);
  const { M } = await import(path.join(ROOT, 'test', 'harness.mjs'));
  const chk = await checkFit(M, card, f);
  return { type: 'c152', mode, T0_input: t0, legacy: f.legacy, notes: f.notes, targets: f.targets, check: chk };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const mode = opt('--mode', 'static'), T0 = opt('--T0', null);
  const r = await fit({ mode, T0: T0 ? +T0 : null });
  const s = JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1);
  fs.writeFileSync(path.join(HERE, 'out', `lf_legacy_${mode}.json`), s);
  if (mode === 'static') fs.writeFileSync(path.join(HERE, 'out', 'lf_legacy.json'), s);
  const c = r.check;
  console.log(`mode ${mode} T0 ${r.legacy.propulsion.T0} eta ${r.legacy.propulsion.eta} | ${r.notes.join(' | ')}`);
  console.log(`stall V_SR clean ${c.stall_clean.VSR_cas.toFixed(1)} Vmin ${c.stall_clean.Vmin_eas.toFixed(1)} | full ${c.stall_full.VSR_cas.toFixed(1)} Vmin ${c.stall_full.Vmin_eas.toFixed(1)}`);
  console.log(`climb Vy ${c.climb.Vy_kt.toFixed(1)} ROC ${c.climb.ROCmax_fpm.toFixed(0)} | glide ${c.glide.Vbg_kt.toFixed(1)} L/D ${c.glide.LD.toFixed(2)}` + (c.takeoff ? ` | TO roll ${c.takeoff.groundRoll_m.toFixed(0)} m 50 ft ${c.takeoff.dist50ft_m.toFixed(0)} m VLOF ${c.takeoff.V_LOF_kt.toFixed(1)}` : ''));
}
