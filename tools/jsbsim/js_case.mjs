// Our side of the JSBSim oracle (test/lib/oracle.mjs), as JSON on stdout for tools/jsbsim/run_cases.py:
//   node tools/jsbsim/js_case.mjs --list      the cases with the research test each makes, AC_NOT_IN_DERIV and AC's
//                                             numeric fields as they are now
//   node tools/jsbsim/js_case.mjs <case>      one case flown by our model: the AC numbers, the initial condition and
//                                             the 10 Hz rows (run_cases.py builds the JSBSim model from the same numbers)
//   node tools/jsbsim/js_case.mjs --start <fixture.json>
//                                             per case of that fixture, what makes its recorded start other than the
//                                             approach test/oracle.test.mjs wants (startProblems; empty when none)
import fs from 'node:fs';
import { AC_NOT_IN_DERIV, CASES, COLS, DT, T_END, acParams, approachIC, runCase, startProblems } from '../../test/lib/oracle.mjs';

const out = (v) => process.stdout.write(JSON.stringify(v));
const [arg, file] = process.argv.slice(2);
if (arg === '--list') {
  out({ cases: Object.fromEntries(Object.entries(CASES).map(([k, c]) => [k, c.gen])), not_in_deriv: AC_NOT_IN_DERIV, ac: acParams() });
} else if (arg === '--start' && file) {
  const fx = JSON.parse(fs.readFileSync(file, 'utf8')).jsbsim_trainer_doublet;
  out(Object.fromEntries(Object.entries(fx.cases).map(([k, c]) => {
    try { return [k, startProblems(c.ic)]; } catch (e) { return [k, [`unreadable start state: ${e.message}`]]; }
  })));
} else if (Object.hasOwn(CASES, arg ?? '')) {
  const params = { ...acParams(), ...CASES[arg].adot };
  const ic = approachIC(params);
  const rows = runCase({ params, ic });
  out({ case: arg, test: CASES[arg].gen, dt: DT, t_end: T_END, tol: CASES[arg].tol, extra: CASES[arg].extra, params, ic, cols: COLS, rows });
} else {
  console.error(`usage: node tools/jsbsim/js_case.mjs <${Object.keys(CASES).join('|')}> | --list | --start <fixture.json>`);
  process.exit(2);
}
