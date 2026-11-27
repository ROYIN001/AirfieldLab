# JSBSim oracle (plan item B1)

Regenerates `test/fixtures/jsbsim_trainer_doublet.json`, which `test/oracle.test.mjs` reads in CI (research round 1
§12.8, tests T-S-01, T-S-02, T-S-03 and T-S-05 in `docs/research/01-flight-physics/12-other-sims.md`).

The idea: build a JSBSim model from our own `AC` numbers (the trainer card `data/aircraft/trainer.json`, which
`setAircraft` in `src/20-flight.js` loads into `AC`) and fly the same open-loop doublets from the same trimmed
approach (95 KIAS, flaps 1, gear down, 5,500 m before 21R) in both simulators. With the same aerodynamic numbers on
both sides, a difference in the α̇-free case (T-S-02) comes from the equations of motion, the axes, the inertia or the
force summation. In the α̇ case (T-S-03) most of it comes from our α̇ estimate instead (a finite difference with a
0.05 s low-pass in `Aircraft.updateAir`, where JSBSim takes α̇ from the accelerations), so T-S-03 mainly checks that
estimate. Tuning `AC` therefore does not need a new fixture; a change to the terms of `Aircraft.deriv` does (see
"When to regenerate").

| file | role |
|---|---|
| `js_case.mjs` | our side, from `test/lib/oracle.mjs`: one case (AC numbers, initial condition, 10 Hz rows), the list of cases (`--list`), or what is wrong with a fixture's recorded start (`--start`) |
| `make_model.py` | writes the JSBSim model from those numbers into a temporary folder outside the repository |
| `run_cases.py` | runs both sides, compares them, checks the JSBSim install with its own c172x, writes the fixture |

## Running it

Offline only; CI needs neither Python nor JSBSim. Node ≥ 22 and Python ≥ 3.10 (the floor of the jsbsim 1.3.3 wheel):

    python3 -m venv /tmp/jsbvenv && /tmp/jsbvenv/bin/pip install jsbsim==1.3.3
    /tmp/jsbvenv/bin/python tools/jsbsim/run_cases.py --check   # compare, write nothing, say if the fixture still holds
    /tmp/jsbvenv/bin/python tools/jsbsim/run_cases.py           # write the fixture if every check passes

Commit the code change first, then regenerate and commit the fixture: `test/oracle.test.mjs` fails on a fixture whose
`meta.repo_commit` was taken from a tree with uncommitted changes. The fixture also records the SHA-256 of the files
that can move the comparison (`meta.inputs_sha256`), and the test says which of them changed since, which helps when
a comparison fails. `--check` says whether the committed fixture still holds what the test needs: the same
cases, tolerances, `AC` fields and α̇ terms, the start the test wants (`startProblems`), and JSBSim rows that JSBSim
and `make_model.py` still produce from the fixture's own numbers. It reports tuned `AC` numbers, a retrim or a new elevation without asking for a new fixture.

## What it checks, and what it does not

- Both sides fly from the state, the `AC` numbers and the field elevation recorded in the fixture. A retrim of
  `setApproach` (plan B2), tuned `AC` numbers or a new ARP elevation do not move the comparison; the test reports
  them as diagnostics.
- A new numeric field in `AC` fails the test until the fixture is regenerated (and the term mirrored in
  `make_model.py`), or until the field is listed in `AC_NOT_IN_DERIV` in `test/lib/oracle.mjs` because `deriv` and
  `step` do not read it. A renamed or removed field always needs a new fixture. Vref, Vapp and Vs0 are not read by
  `deriv` either, but the fixture holds them, so `ORACLE_AC_FROZEN` checks them.
- `AC.Iinv` as `setAircraft` builds it with `inertiaInverse` (`src/20-flight.js`, which the oracle's `withParams`
  also uses) must invert the inertia tensor, and so must the inverse built from the fixture's numbers.
- `make_model.py` puts the thrust at the CG along body +x. The test checks that `AC.engines` is still that: one
  engine whose axis is +x and whose thrust line passes through the CG (y = z = 0). A card with another thrust line
  or more engines needs `make_model.py` to model them, and a new fixture.
- The negative controls show it catches an Ixz sign error, thrust 2 % high, a missing Cmadot and a CLadot ten times
  too large. This doublet does not resolve CLadot more finely: zero or twice its value still pass.
- `Aircraft.step` must still converge as RK4 does: the α̇-free case flown at 240 Hz and at 960 Hz agrees to 1e-6
  (RK4 gives about 1e-8, a midpoint step 6e-4, forward Euler 0.09). The comparison with JSBSim cannot see the
  integrator, whose error here is far below its tolerances.
- A change to the α̇ estimate alone (research task item 17 puts α̇ in closed form in `deriv`) moves T-S-03 but
  not the JSBSim rows, so it needs no new fixture: `make_model.py` uses JSBSim's own α̇ and does not mirror the
  estimate. If T-S-03 then fails, the new estimate is further from JSBSim's α̇ than the old one; wider T-S-03
  tolerances need the owner's approval.
- It does not cover ground effect, the stall blend or the gear: the run stays at 230–305 m and α ≈ 2°, where those
  terms are inactive, so their mirror in `make_model.py` is not checked.
- Research task item 8 moved `AC` into `data/aircraft/trainer.json` (plan B3) and asked that T-S-01/T-S-02 stay
  unchanged. Since T-S-02 flies the fixture's numbers, `ORACLE_AC_FROZEN=1 node --test test/oracle.test.mjs` was run
  before and after the move and passed both times: it checks that `AC` still holds the fixture's numbers. Run it
  again after a change to the card or to `acFromCard` that should leave the numbers as they are.
- Plan C4 added `AC.K_CL_offset` (the drag polar's offset, 0.15 on the trainer as before), mirrored in
  `make_model.py` (`CDlin` reads it, 0.15 when absent) and the fixture regenerated from the commit that added it. The
  new fixture also holds the four stall-warning fields of `AC_NOT_IN_DERIV`, so `ORACLE_AC_FROZEN` compares them too.
  Its JSBSim rows and recorded start differ from the plan B1 fixture because `setApproach` had been retrimmed since
  (2.63e-4 away at the parent commit, a diagnostic before); the code of plan C4 flew the old fixture within every
  tolerance before it was replaced.

When to regenerate:

- The terms of `Aircraft.deriv` changed on purpose, or a numeric `AC` field was added or renamed: change
  `make_model.py` the same way (it mirrors `deriv` term by term), run `--check`, then regenerate and commit the
  fixture with the change.
- `Aircraft.step` changed: the JSBSim rows do not depend on it (the start comes from `setApproach`, which does not
  step), so no new fixture. The convergence test checks that it stays RK4, and T-S-02 still compares the flight it
  produces; a step change that adds dynamics the oracle's flight goes through (a new state) is mirrored in
  `make_model.py` like a `deriv` change.
- `atmosphere` changed: `make_model.py` does not mirror it, because JSBSim flies its own US 1976 atmosphere, so
  T-S-02 and T-S-03 also compare our air density at 230–310 m with JSBSim's. A change that keeps it there needs
  nothing; one that moves it (humid air, for example) fails them, and a new fixture does not help: keep the oracle
  on the dry ISA, as JSBSim flies it.
- A comparison fails and nothing was meant to change: the physics change has a bug the oracle was built to catch.

Timing: `FGFDMExec::Run()` integrates with the accelerations of the previous frame and then evaluates the forces with
the controls set now, so `run_cases.py` sets each control one step ahead. Our RK4 step from t to t + dt holds the
control of t, and JSBSim then sees the same control at the same instant.

## Licences

JSBSim (LGPL-2.1) is only installed from pip and run; no JSBSim file is copied into the repository and the model
is generated from our own numbers. The repository keeps only the numbers it produced. `test/licenses.test.mjs`
(T-S-11) fails on a JSBSim model file in the repository, so `make_model.py` refuses to write inside it and builds
the model's root tag from two strings. `run_cases.py` also turns off Python's bytecode cache, so a run leaves no
`__pycache__` beside the scripts (the folder is git-ignored as well).
