#!/usr/bin/env node
// lm_ci.mjs — every round-2 check that CI runs, in one command (research item R2-02, plan PR B5). Node >= 18,
// git and tar on PATH, no dependencies. .github/workflows/research.yml runs it on every change to docs/research/**.
//
//   node docs/research/02-light-aircraft/scripts/lm_ci.mjs [--root <dir>] [--out <dir>] [--only id,id] [--keep] [--report-only]
//
// Default: take src/ and test/harness.mjs of the commit pinned in sim-snapshot.json (git archive; fetched from origin
// when the clone lacks it), and data/aircraft/ when that commit has it (OPTIONAL_PATHS), into a temp folder, set
// AIRFIELDLAB_ROOT to it and LM_OUT_DIR to a temp out folder, run the
// steps below, and exit 1 when a step fails or when the run changed a file of the repo (new, deleted or rewritten, ignored
// files included; the --out folder is exempt when it lies inside the repo). The scripts that fly cards in
// the simulator (lm_selftest, lh_tests, lo_tests) and the code they copy from it (lm_card.simCLtrim / simTrimDe = stallBlend and the CL and
// Cm lines, lh_tests.scoreToday = Evaluator.score) were checked against that commit, so a physics pull request cannot turn the
// research CI red; re-pinning is a deliberate edit of sim-snapshot.json together with the expected values it moves.
//   --root <dir>    run against that tree instead of the snapshot; --root . = this working tree (shows what a physics
//                   change would move before re-pinning)
//   --out <dir>     keep the result files (lh_tests.json, lo_tests.json, lo_tests.md, merge-checks.json, params-light.json) there
//   --only a,b      run only these step ids (merge, params, selftest, fleet, handling, procedures)
//   --keep          do not delete the temp folder (extracted sim, and the results when --out is not given)
//   --report-only   always exit 0; failures are printed (and annotated as ::warning:: under GitHub Actions)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes(k);
const REPORT_ONLY = flag('--report-only');
const GHA = !!process.env.GITHUB_ACTIONS;

// id, what it checks, script + arguments. Order: data first (no simulator), then the simulator checks.
export const STEPS = [
  { id: 'merge', what: 'lm_merge --coverage --dry --strict: JSON blocks, leaf format, coverage, consistency checks (0 warnings)',
    argv: ['lm_merge.mjs', '--coverage', '--dry', '--strict'], jsonChecks: 'merge-checks.json' },
  { id: 'params', what: 'params-light.json = a fresh lm_merge of the topic blocks (run lm_merge.mjs and commit the file when it differs)',
    argv: ['lm_merge.mjs', '--quiet', '--out', '$OUT/params-light.json'], sameAs: ['params-light.json', path.join(HERE, '..', 'params-light.json')] },
  { id: 'selftest', what: 'lm_selftest: every T-LM row (trainer_r1 fixture = AC, method modules, validator, tolerance, copies of sim code)', argv: ['lm_selftest.mjs'] },
  { id: 'fleet', what: 'ls_tests: T-LS-01…T-LS-09, T-LS-13 (thai_fleet data)', argv: ['ls_tests.mjs'] },
  { id: 'handling', what: 'lh_tests: T-LH (attitude, evaluator, stick force, 08 ↔ card)', argv: ['lh_tests.mjs'] },
  { id: 'procedures', what: 'lo_tests: T-LO (circuits, gates, checklists, 09 ↔ card)', argv: ['lo_tests.mjs'] },
];

const git = (a, o = {}) => spawnSync('git', ['-C', REPO, ...a], { maxBuffer: 256 * 2 ** 20, ...o });
const isGit = git(['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' }).stdout?.trim() === 'true';
/** Dirty and ignored files of the work tree → "status size mtime" (porcelain -z; a rename's second path is skipped). */
function snapshot() {
  const m = new Map();
  if (!isGit) return m;
  const z = (git(['status', '--porcelain', '-z', '--untracked-files=all', '--ignored'], { encoding: 'utf8' }).stdout || '').split('\0');
  for (let i = 0; i < z.length; i++) {
    const e = z[i]; if (e.length < 4) continue;
    const code = e.slice(0, 2), p = e.slice(3);
    if (/[RC]/.test(code[0])) i++;
    let st = 'gone'; try { const x = fs.statSync(path.join(REPO, p)); st = `${x.size} ${x.mtimeMs}`; } catch { /* deleted */ }
    m.set(p, `${code} ${st}`);
  }
  return m;
}

// Paths taken from the pinned commit too when it has them: from plan B3 on, test/harness.mjs reads the aircraft card
// data/aircraft/trainer.json (setAircraft), so a snapshot pinned after B3 needs it beside src/; one pinned before has none.
export const OPTIONAL_PATHS = ['data/aircraft'];

/** Extract `paths` of `commit`, and the OPTIONAL_PATHS it has, into `dest` (fetching the commit from origin when this clone lacks it). */
export function materialize(snap, dest) {
  if (!isGit) throw new Error(`${REPO} is not a git work tree; pass --root <dir> with src/ and test/harness.mjs`);
  const have = c => git(['cat-file', '-e', `${c}^{commit}`]).status === 0;
  if (!have(snap.commit)) {
    const f = git(['fetch', '--no-tags', '--depth=1', 'origin', snap.commit], { encoding: 'utf8' });
    if (f.status !== 0 || !have(snap.commit)) throw new Error(`cannot fetch ${snap.commit} from origin:\n${f.stderr}`);
  }
  const optional = OPTIONAL_PATHS.filter(p => !snap.paths.includes(p) && git(['cat-file', '-e', `${snap.commit}:${p}`]).status === 0);
  const tar = git(['archive', '--format=tar', snap.commit, ...snap.paths, ...optional]);
  if (tar.status !== 0) throw new Error(`git archive ${snap.commit} failed:\n${tar.stderr}`);
  fs.mkdirSync(dest, { recursive: true });
  const x = spawnSync('tar', ['-x', '-C', dest], { input: tar.stdout });
  if (x.status !== 0) throw new Error(`tar -x failed:\n${x.stderr}`);
  if (!fs.existsSync(path.join(dest, 'test', 'harness.mjs'))) throw new Error(`snapshot ${snap.commit} has no test/harness.mjs`);
}

/** Last "n/m pass" line of a test script, or a short merge summary. */
function summary(id, text) {
  if (id === 'merge') {
    const f = /^files: .*$/m.exec(text)?.[0] ?? '';
    const c = /^CHECKS: .*$/m.exec(text)?.[0] ?? 'CHECKS: 0 WARN';
    const e = /^ERRORS \((\d+)\)/m.exec(text);
    return [f, c.replace(/ \(--strict.*$/, ''), e ? `${e[1]} errors` : ''].filter(Boolean).join('; ');
  }
  const m = [...text.matchAll(/(\d+)\s*\/\s*(\d+)\s*(?:passed|pass|PASS)\b.*$/gm)].pop();
  return m ? m[0].trim() : '';
}

async function main() {
  const snap = JSON.parse(fs.readFileSync(path.join(HERE, 'sim-snapshot.json'), 'utf8'));
  const only = opt('--only', null)?.split(',');
  const steps = only ? STEPS.filter(s => only.includes(s.id)) : STEPS;
  if (only && steps.length !== only.length) throw new Error(`unknown step id in --only ${only.join(',')}; ids: ${STEPS.map(s => s.id).join(', ')}`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-ci-'));
  const rootOpt = opt('--root', null);
  const root = rootOpt ? path.resolve(rootOpt) : path.join(tmp, 'sim');
  const out = path.resolve(opt('--out', path.join(tmp, 'out')));
  try {
    const before = snapshot();
    const label = rootOpt ? `tree ${root}` : `snapshot ${snap.commit.slice(0, 12)} (${snap.paths.join(', ')})`;
    if (!rootOpt) materialize(snap, root);
    fs.mkdirSync(out, { recursive: true });
    console.log(`lm_ci: simulator = ${label}; results in ${out}${opt('--out', null) || flag('--keep') ? '' : ' (deleted at the end; pass --out <dir> to keep them)'}\n`);
    const env = { ...process.env, AIRFIELDLAB_ROOT: root, LM_OUT_DIR: out };
    const rows = [];
    for (const s of steps) {
      const argv = [path.join(HERE, s.argv[0]), ...s.argv.slice(1).map(a => a.replace('$OUT', out))];
      if (s.jsonChecks) argv.push('--json-checks', path.join(out, s.jsonChecks));
      const t0 = Date.now();
      const r = spawnSync(process.execPath, argv, { cwd: REPO, env, encoding: 'utf8', maxBuffer: 256 * 2 ** 20, timeout: 10 * 60e3 });
      const text = (r.stdout || '') + (r.stderr || '');
      let ok = r.status === 0, sum = summary(s.id, text);
      if (ok && s.sameAs) {   // the committed file must equal what the step just wrote
        const [name, committed] = s.sameAs, fresh = path.join(out, name);
        ok = fs.existsSync(committed) && fs.existsSync(fresh) && fs.readFileSync(committed).equals(fs.readFileSync(fresh));
        sum = ok ? `${name} up to date` : `${path.relative(REPO, committed)} differs from a fresh lm_merge (run: node ${path.relative(REPO, path.join(HERE, 'lm_merge.mjs'))}, then commit it)`;
      }
      rows.push({ id: s.id, what: s.what, ok, code: r.status ?? r.signal, sec: (Date.now() - t0) / 1000, summary: sum });
      console.log(`${ok ? 'PASS' : 'FAIL'} ${s.id.padEnd(10)} ${rows.at(-1).sec.toFixed(1).padStart(5)} s  ${rows.at(-1).summary}`);
      if (!ok) {   // show what failed: FAIL rows, error lines, or the tail of the output
        const lines = text.split('\n');
        const bad = lines.filter(l => /\bFAIL\b|✗|ERROR|Error|\[strict\]/.test(l)).slice(0, 40);
        console.log((bad.length ? bad : lines.slice(-40)).map(l => '    ' + l.slice(0, 400)).join('\n'));
      }
    }
    const after = snapshot(), relOut = path.relative(REPO, out);
    const exempt = p => !relOut.startsWith('..') && !path.isAbsolute(relOut) && (p === relOut || p.startsWith(relOut + '/'));
    const changed = [...new Set([...before.keys(), ...after.keys()])].filter(p => !exempt(p) && before.get(p) !== after.get(p))
      .map(p => `${p} (${after.has(p) ? after.get(p).slice(0, 2).trim() : 'no longer dirty'})`);
    if (changed.length) {
      rows.push({ id: 'clean', what: 'the run left the repo unchanged', ok: false, code: 1, sec: 0, summary: `changed: ${changed.join(', ')}` });
      console.log(`FAIL clean      the run changed files in the repo: ${changed.join(', ')} (a script writes outside $LM_OUT_DIR)`);
    }
    const nOk = rows.filter(r => r.ok).length;
    console.log(`\n${nOk}/${rows.length} steps passed (${label})`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      const md = [`### Round 2 research checks — ${label}`, '', '| step | result | time | summary |', '|---|---|---|---|',
        ...rows.map(r => `| ${r.id} | ${r.ok ? '✅ pass' : '❌ fail'} | ${r.sec.toFixed(1)} s | ${String(r.summary).replace(/\|/g, '\\|')} |`), ''];
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n') + '\n');
    }
    if (GHA && REPORT_ONLY) for (const r of rows.filter(r => !r.ok)) console.log(`::warning title=round 2 check ${r.id} (${label})::${r.summary || 'failed'}`);
    process.exitCode = REPORT_ONLY || nOk === rows.length ? 0 : 1;
  } finally {   // the temp folder holds the extracted sim (and the results when --out is not given)
    if (!flag('--keep')) fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url));
if (isMain) main().catch(e => { console.error(`lm_ci: ${e.message}`); process.exitCode = REPORT_ONLY ? 0 : 1; });
