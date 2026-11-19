// le_fit.mjs — legacy fit of the c172r card (topic 10) with the LM procedure (lm_legacy_fit.legacyFit + checkFit),
// using the BEM static thrust of the 75x70 propeller (le_calc) as T0, same as lc_fit.mjs does for the C172S.
// Run from the repo root:  node <this folder>/le_fit.mjs [--mode static|vy] [--T0 N]  → scripts/out/le_legacy.json (+ le_legacy_<mode>.json)
// The card's aero.legacy / propulsion.legacy (own or inherited from c172s) are removed before fitting.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyFit, checkFit } from './lm_legacy_fit.mjs';
import { loadType, isMainModule } from './lm_lib.mjs';
import { compute } from './le_calc.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, '');
const G0 = 9.80665, RHO0 = 1.225, KT = 0.514444;

export async function fit({ mode = 'static', T0 = null } = {}) {
  const card = loadType('c172r');
  if (card.propulsion) delete card.propulsion.legacy;
  if (card.aero) delete card.aero.legacy;
  const t0 = T0 ?? compute().prop.static.T0_N;
  const f = legacyFit(card, { mode, T0: mode === 'static' ? t0 : null });
  const { M } = await import(path.join(ROOT, 'test', 'harness.mjs'));
  const chk = await checkFit(M, card, f);
  // excess T/W at approach, flaps full, full throttle (sim force model, MTOW, 66 KCAS ≈ 65 KIAS)
  const ac = f.ac, V = 66 * KT, q = 0.5 * RHO0 * V * V, W = ac.m * G0, CL = W / (q * ac.S);
  const Vc = ac.eta * ac.P / ac.T0, T = ac.T0 * Vc / Math.hypot(V, Vc);
  const D = q * ac.S * (ac.CD0 + ac.K * (CL - 0.15) ** 2 + ac.CDflap);
  return { type: 'c172r', mode, T0_input: t0, legacy: f.legacy, notes: f.notes, targets: f.targets, check: chk, excessTW: +((T - D) / W).toFixed(3) };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const mode = opt('--mode', 'static'), T0 = opt('--T0', null);
  const r = await fit({ mode, T0: T0 ? +T0 : null });
  // keep the takeoff-test choice (VR, theta) made in le_iter.mjs if present
  const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'le_legacy.json'), 'utf8')); } catch { return {}; } })();
  if (prev.takeoff_VR_kcas) { r.takeoff_VR_kcas = prev.takeoff_VR_kcas; r.takeoff_theta_deg = prev.takeoff_theta_deg; }
  const s = JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1);
  fs.writeFileSync(path.join(HERE, 'out', `le_legacy_${mode}.json`), s);
  if (mode === 'static') fs.writeFileSync(path.join(HERE, 'out', 'le_legacy.json'), s);
  const c = r.check, fx = (x, d = 1) => (x == null ? 'n/a' : x.toFixed(d));
  console.log(`mode ${mode} T0 ${r.legacy.propulsion.T0} eta ${r.legacy.propulsion.eta} | ${r.notes.join(' | ')}`);
  console.log(`legacy aero ${JSON.stringify(r.legacy.aero)}`);
  console.log(`stall V_SR clean ${c.stall_clean.VSR_cas.toFixed(1)} Vmin ${c.stall_clean.Vmin_eas.toFixed(1)} | full ${c.stall_full.VSR_cas.toFixed(1)} Vmin ${c.stall_full.Vmin_eas.toFixed(1)}`);
  console.log(`climb Vy ${c.climb.Vy_kt.toFixed(1)} ROC ${c.climb.ROCmax_fpm.toFixed(0)} | glide ${c.glide.Vbg_kt.toFixed(1)} L/D ${c.glide.LD.toFixed(2)} | excess T/W approach ${r.excessTW}` + (c.takeoff ? ` | TO roll ${fx(c.takeoff.groundRoll_m, 0)} m 50 ft ${fx(c.takeoff.dist50ft_m, 0)} m VLOF ${fx(c.takeoff.V_LOF_kt)}` : ''));
}
