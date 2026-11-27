"""Regenerates test/fixtures/jsbsim_trainer_doublet.json (research round 1 §12.8, tests T-S-01, T-S-03, T-S-05;
plan item B1). Offline only: CI does not need Python, because test/oracle.test.mjs reads the fixture.

For each case of test/lib/oracle.mjs (`node tools/jsbsim/js_case.mjs --list`; today noadot, CLadot = Cmadot = 0, for
T-S-01, and adot, CLadot 1.6 and Cmadot -4.5, for T-S-03) it
 1. runs `node tools/jsbsim/js_case.mjs <case>`: our model's AC numbers, its trimmed approach and its 10 Hz rows,
 2. builds a JSBSim model from those numbers (make_model.py) in a temporary folder and flies the same doublets
    with Adams-Bashforth 3 at 240 Hz from the same state,
 3. compares the two (T-S-01 or T-S-03 tolerances, plus the limits test/lib/oracle.mjs adds as `extra`).
It also checks the JSBSim install with its own c172x (T-S-05). The fixture is written only when every check passes
(or with --force); --check compares without writing, and also says whether the committed fixture still holds what
test/oracle.test.mjs needs (the same cases, tolerances, AC fields and α̇ terms, the start the test wants, and JSBSim
rows that JSBSim and make_model.py still produce from the fixture's own numbers). Tuned AC numbers, a retrim or a
new field elevation are reported but need no new fixture.
Needs Node >= 22, Python >= 3.10 and `pip install jsbsim==1.3.3`.

Usage: python tools/jsbsim/run_cases.py [--check] [--force]
"""
import datetime
import hashlib
import json
import math
import os
import platform
import re
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True   # leave no __pycache__ beside the scripts (it is git-ignored as well)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('JSBSIM_DEBUG', '0')   # no start-up banner
import make_model  # noqa: E402  (our own module beside this file)
import jsbsim  # noqa: E402

FT = 0.3048
DEG = math.pi / 180
REPO = make_model.REPO
FIXTURE = os.path.join(REPO, 'test', 'fixtures', 'jsbsim_trainer_doublet.json')
JSBSIM_VERSION = '1.3.3'
AB3 = 4   # JSBSim integrator id: Adams-Bashforth 3
# the α̇ terms each case sets itself (CASES[name].adot in test/lib/oracle.mjs); test/oracle.test.mjs checks them
ADOT_KEYS = ('CLadot', 'Cmadot')
# files whose change can move the comparison; their hashes go into the fixture so that test/oracle.test.mjs can say
# which of them changed when a comparison fails
INPUTS = ['src/10-atmo.js', 'src/15-geo.js', 'src/20-flight.js', 'test/harness.mjs', 'test/lib/oracle.mjs',
          'tools/jsbsim/js_case.mjs', 'tools/jsbsim/make_model.py', 'tools/jsbsim/run_cases.py']


def js_case(*args):
    """`node tools/jsbsim/js_case.mjs <args>`: a case name, --list, or --start <fixture>; its JSON output."""
    out = subprocess.run(['node', os.path.join(REPO, 'tools', 'jsbsim', 'js_case.mjs'), *args],
                         check=True, capture_output=True, text=True, cwd=REPO)
    return json.loads(out.stdout)


def sha256(rel):
    with open(os.path.join(REPO, rel), 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def git_head():
    try:
        head = subprocess.run(['git', 'rev-parse', 'HEAD'], check=True, capture_output=True, text=True, cwd=REPO).stdout.strip()
        dirty = subprocess.run(['git', 'status', '--porcelain', '--', 'src', 'data/aircraft', 'test/lib', 'test/harness.mjs', 'tools/jsbsim'],
                               check=True, capture_output=True, text=True, cwd=REPO).stdout.strip()
        return head + (' (with uncommitted changes)' if dirty else '')
    except (OSError, subprocess.CalledProcessError):
        return 'unknown'


def jsbsim_case(case):
    """Flies the case's schedule in JSBSim from the case's initial condition; returns 10 Hz rows in case['cols']."""
    P, ic = case['params'], case['ic']
    root = make_model.write_model(make_model.build_xml(P, ic))
    try:
        dt = case['dt']
        fdm = jsbsim.FGFDMExec(root)
        fdm.set_debug_level(0)
        fdm.set_dt(dt)
        fdm.load_model(make_model.MODEL)
        for k in ['rate/rotational', 'rate/translational', 'position/rotational', 'position/translational']:
            fdm[f'simulation/integrator/{k}'] = AB3
        fdm['simulation/gravity-model'] = 0
        # position first, then height and speed (research §12.8: set lat/long before the speeds)
        fdm['ic/lat-geod-deg'] = 13.914
        fdm['ic/long-gc-deg'] = 100.606
        fdm['ic/terrain-elevation-ft'] = ic['elev_m'] / FT
        x = ic['x']
        fdm['ic/h-sl-ft'] = (ic['elev_m'] - x[2]) / FT
        # body velocities from the NED velocity and the attitude quaternion (body -> NED)
        w, a, b, c = x[6:10]
        R = [1 - 2 * (b * b + c * c), 2 * (a * b - w * c), 2 * (a * c + w * b),
             2 * (a * b + w * c), 1 - 2 * (a * a + c * c), 2 * (b * c - w * a),
             2 * (a * c - w * b), 2 * (b * c + w * a), 1 - 2 * (a * a + b * b)]
        vn = x[3:6]
        uvw = [R[0] * vn[0] + R[3] * vn[1] + R[6] * vn[2], R[1] * vn[0] + R[4] * vn[1] + R[7] * vn[2],
               R[2] * vn[0] + R[5] * vn[1] + R[8] * vn[2]]
        phi = math.atan2(2 * (w * a + b * c), 1 - 2 * (a * a + b * b))
        theta = math.asin(max(-1.0, min(1.0, 2 * (w * b - c * a))))
        psi = math.atan2(2 * (w * c + a * b), 1 - 2 * (b * b + c * c))
        fdm['ic/u-fps'], fdm['ic/v-fps'], fdm['ic/w-fps'] = (u / FT for u in uvw)
        fdm['ic/phi-rad'], fdm['ic/theta-rad'], fdm['ic/psi-true-rad'] = phi, theta, psi % (2 * math.pi)
        fdm['ic/p-rad_sec'] = x[10]
        fdm['ic/q-rad_sec'] = x[11]
        fdm['ic/r-rad_sec'] = x[12]
        fdm['fcs/de-rad'] = ic['de0']
        fdm['fcs/thr'] = ic['thr0']
        fdm.run_ic()
        n = round(case['t_end'] / dt)
        every = round(0.1 / dt)
        rows = []
        for i in range(n + 1):
            t = i * dt
            if i % every == 0:
                rows.append([round(t, 4), fdm['position/h-sl-ft'] * FT - ic['elev_m'], fdm['velocities/vt-fps'] * FT,
                             fdm['aero/alpha-deg'], fdm['aero/beta-deg'], fdm['attitude/phi-deg'], fdm['attitude/theta-deg'],
                             fdm['attitude/psi-deg'], fdm['velocities/p-rad_sec'] / DEG, fdm['velocities/q-rad_sec'] / DEG,
                             fdm['velocities/r-rad_sec'] / DEG])
            if i == n:
                break
            # the schedule of test/lib/oracle.mjs, one step ahead: FGFDMExec::Run() first integrates with the
            # accelerations of the previous frame, then evaluates the forces with the controls set now. Our RK4 step
            # t(i+1) -> t(i+2) holds schedule(t(i+1)), so JSBSim must see that value when it evaluates at t(i+1).
            tn = (i + 1) * dt
            fdm['fcs/de-rad'] = ic['de0'] + (2 if 1 <= tn < 2 else -2 if 2 <= tn < 3 else 0) * DEG
            fdm['fcs/da-rad'] = (5 if 8 <= tn < 9 else -5 if 9 <= tn < 10 else 0) * DEG
            fdm['fcs/dr-rad'] = (5 if 14 <= tn < 15 else 0) * DEG
            fdm.run()
        return rows
    finally:
        shutil.rmtree(root, ignore_errors=True)


def max_abs_err(cols, a, b):
    err = {}
    for k, c in enumerate(cols):
        if k == 0:
            continue
        e = 0.0
        for ra, rb in zip(a, b):
            d = ra[k] - rb[k]
            if c == 'psi_deg':
                d = (d + 180) % 360 - 180
            e = max(e, abs(d))
        err[c] = e
    return err


def env_check():
    """T-S-05: JSBSim's own c172x, trimmed at 100 KCAS and 3,000 ft, then 10 s free."""
    fdm = jsbsim.FGFDMExec(jsbsim.get_default_root_dir())
    fdm.set_debug_level(0)
    fdm.load_model('c172x')
    fdm['ic/lat-geod-deg'] = 13.914          # before height and speed (research §12.8 review)
    fdm['ic/long-gc-deg'] = 100.606
    fdm['ic/h-sl-ft'] = 3000
    fdm['ic/vc-kts'] = 100
    fdm['ic/psi-true-deg'] = 209
    fdm['fcs/mixture-cmd-norm'] = 1
    fdm.run_ic()
    fdm['propulsion/set-running'] = -1
    fdm['simulation/do_simple_trim'] = 1
    r = {'vc_kts': fdm['velocities/vc-kts'], 'alpha_deg': fdm['aero/alpha-deg'], 'elevator_deg': fdm['fcs/elevator-pos-deg'],
         'throttle': fdm['fcs/throttle-pos-norm']}
    h0 = fdm['position/h-sl-ft']
    for _ in range(round(10.0 / fdm.get_delta_t())):
        fdm.run()
    r['dh_ft_10s'] = fdm['position/h-sl-ft'] - h0
    expect = {'vc_kts': (100.0, 0.1), 'alpha_deg': (0.796, 0.05), 'elevator_deg': (5.14, 0.1), 'throttle': (0.769, 0.01),
              'dh_ft_10s': (0.0, 1.0)}
    ok = all(abs(r[k] - v) <= tol for k, (v, tol) in expect.items())
    return {'model': 'c172x', 'case': 'trim 100 KCAS 3,000 ft, then 10 s', 'got': {k: round(v, 4) for k, v in r.items()},
            'expect': {k: list(v) for k, v in expect.items()}, 'pass': ok}


def main():
    check, force = '--check' in sys.argv, '--force' in sys.argv
    if jsbsim.__version__ != JSBSIM_VERSION:
        print(f'jsbsim {jsbsim.__version__} is installed; the fixture is defined for {JSBSIM_VERSION} (pip install jsbsim=={JSBSIM_VERSION})')
        if not force:
            return 1
    ok = True
    env = env_check()
    print(f"T-S-05 c172x environment: {'PASS' if env['pass'] else 'FAIL'} {env['got']}")
    ok &= env['pass']
    listing = js_case('--list')
    cases, fresh, cols, dt = {}, {}, None, None
    for name, test_id in listing['cases'].items():
        case = fresh[name] = js_case(name)
        cols, dt = case['cols'], case['dt']
        rows = jsbsim_case(case)
        err = max_abs_err(case['cols'], case['rows'], rows)
        bad = {k: (round(err[k], 5), tol) for k, tol in {**case['tol'], **case['extra']}.items() if not err[k] <= tol}
        print(f"{test_id} {name}: {'PASS' if not bad else 'FAIL ' + json.dumps(bad)} max |JS - JSBSim| "
              + ', '.join(f'{k} {v:.4g}' for k, v in err.items()))
        ok &= not bad
        cases[name] = {'test': test_id, 'params': case['params'], 'ic': case['ic'], 'tol': case['tol'], 'extra': case['extra'],
                       'max_abs_err_at_generation': {k: round(v, 6) for k, v in err.items()},
                       'rows': [[round(v, 6) for v in r] for r in rows]}
    if check:
        # does the committed fixture still hold what test/oracle.test.mjs needs? The test flies the fixture's own
        # numbers and start, so tuned AC numbers, a retrim or a new elevation are information, not a reason to
        # regenerate; a change in the tolerances, the AC fields, the α̇ terms, make_model.py or JSBSim is.
        if not os.path.exists(FIXTURE):
            print('fixture: missing; regenerate')
            return 1
        with open(FIXTURE, encoding='utf-8') as fh:
            fx = json.load(fh)['jsbsim_trainer_doublet']
        old, meta = fx.get('cases', {}), fx.get('meta', {})
        for name in sorted(set(old) - set(cases)):
            print(f'fixture {name}: regenerate: test/lib/oracle.mjs has no such case now')
            ok = False
        start = js_case('--start', FIXTURE)
        not_in_deriv = set(listing['not_in_deriv'])
        if not re.fullmatch(r'[0-9a-f]{40}', meta.get('repo_commit', '')):
            print(f"fixture: regenerate: made from a tree with uncommitted changes ({meta.get('repo_commit')})")
            ok = False
        if sorted(meta.get('inputs_sha256', {})) != sorted(INPUTS):
            print('fixture: regenerate: it does not record the hashes of the files in INPUTS')
            ok = False
        for name, c in cases.items():
            o, why = old.get(name), []
            if o is None:
                why.append('no such case')
            else:
                if o.get('tol') != c['tol'] or o.get('extra') != c['extra']:
                    why.append('tolerances changed in test/lib/oracle.mjs')
                if o.get('test') != c['test']:
                    why.append(f"made as {o.get('test')}, the case is {c['test']} now")
                op = o.get('params', {})
                added, gone = set(c['params']) - set(op) - not_in_deriv, set(op) - set(c['params'])
                if added:
                    why.append('AC fields the fixture lacks (or list them in AC_NOT_IN_DERIV): ' + ', '.join(sorted(added)))
                if gone:
                    why.append('fixture fields AC no longer has (renamed?): ' + ', '.join(sorted(gone)))
                if start.get(name):
                    why.append('its start is not the approach the test wants: ' + ', '.join(start[name]))
                adot = [k for k in ADOT_KEYS if op.get(k) != c['params'].get(k)]
                if adot:
                    why.append('α̇ terms of the case changed: ' + ', '.join(adot))
                if len(o.get('rows', [])) != len(c['rows']):
                    why.append('row count changed')
                else:
                    try:
                        replay = jsbsim_case({**fresh[name], 'params': o['params'], 'ic': o['ic']})
                        d = max(abs(a - b) for ra, rb in zip(o['rows'], replay) for a, b in zip(ra, rb))
                    except KeyError as e:
                        d = 0.0
                        why.append(f'the fixture lacks {e}, which the oracle reads now')
                    if d > 1e-6:
                        why.append(f'JSBSim flies the fixture\'s own numbers differently now (largest row difference {d:.3g}): '
                                   'make_model.py or JSBSim changed')
                if o.get('ic') != c['ic']:
                    print(f'fixture {name}: the start state differs from the fixture (retrim or field elevation; the '
                          'test flies the fixture\'s; no new fixture needed)')
            print(f"fixture {name}: {'up to date' if not why else 'regenerate: ' + '; '.join(why)}")
            ok &= not why
        # AC as it is now against the numbers the α̇ case flew (every AC number; its CLadot and Cmadot are AC's own
        # unless tuned since)
        fp = old.get('adot', {}).get('params', {})
        tuned = sorted(k for k in fp if k in listing['ac'] and fp[k] != listing['ac'][k])
        if tuned:
            print(f'AC differs from the fixture in {", ".join(tuned)} (the test flies the fixture\'s numbers; no new '
                  'fixture needed)')
        return 0 if ok else 1
    if not ok and not force:
        print('not writing the fixture: a check failed (use --force to write anyway)')
        return 1
    fixture = {'jsbsim_trainer_doublet': {
        'meta': {
            'what': 'JSBSim trajectories of the AirfieldLab trainer, from a JSBSim model built from our own AC numbers '
                    '(tools/jsbsim/make_model.py), flying the open-loop doublets of test/lib/oracle.mjs. Numbers only: '
                    'no JSBSim file is kept in the repository.',
            'src': 'research round 1 §12.8 and tests T-S-01, T-S-02, T-S-03, T-S-05 (docs/research/01-flight-physics/12-other-sims.md)',
            'generator': 'python tools/jsbsim/run_cases.py', 'generated': datetime.date.today().isoformat(),
            'repo_commit': git_head(), 'jsbsim': jsbsim.__version__, 'python': platform.python_version(),
            'integrator': 'Adams-Bashforth 3 (rate and position, rotational and translational)', 'dt_s': dt,
            'planet': 'radius 1000 x Earth, no rotation, g 9.80665 m/s^2', 'sample_hz': 10, 'cols': cols,
            'inputs_sha256': {p: sha256(p) for p in INPUTS},
        },
        'env_check': env,
        'cases': cases,
    }}
    text = json.dumps(fixture, ensure_ascii=False, indent=1)
    # one line per row or short number list, so that a regenerated fixture diffs row by row
    text = re.sub(r'\[\s*(-?[\d.e+-]+(?:,\s*-?[\d.e+-]+)*)\s*\]', lambda m: '[' + ', '.join(m.group(1).split()).replace(',,', ',') + ']', text)
    with open(FIXTURE, 'w', encoding='utf-8') as fh:
        fh.write(text + '\n')
    print(f'wrote {os.path.relpath(FIXTURE, REPO)} ({os.path.getsize(FIXTURE) / 1024:.0f} KB)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
