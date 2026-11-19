# lb_signs.py - control-sign check of the JSBSim 1.3.3 bundled models (topic 03, code LB; added in the 2026-11-19 review).
# From level flight at 5,000 ft (c172p/pa28 100 KCAS, pc7/t6texan2 160 KCAS, flaps 0) step one normalised command by +0.3
# and read the body rates 0.5 s later. Shows that JSBSim uses the same signs as AirfieldLab's AC (schema-ext-r2.md §5):
# +elevator = trailing edge down (q < 0), +aileron = roll right (p > 0), +rudder = trailing edge left / nose left (r < 0),
# so JSBSim derivative constants can be compared with AC values without a sign change.
# Usage: python3 -I scripts/lb_signs.py   -> scripts/out/lb_signs.json (numbers measured by running the models; no XML copied)
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lb_jsb import *
HERE = os.path.dirname(os.path.abspath(__file__))
POS = {'elevator': 'fcs/elevator-pos-deg', 'aileron': 'fcs/left-aileron-pos-deg', 'rudder': 'fcs/rudder-pos-deg'}
res = {}
for m in ('c172p', 'pa28', 'pc7', 't6texan2'):
    res[m] = {}
    for ax in ('elevator', 'aileron', 'rudder'):
        cmd = f'fcs/{ax}-cmd-norm'
        f = new(m); set_mass(f, m, None)
        setup(f, m, 100 if m in ('c172p', 'pa28') else 160, 5000, flap_deg=0, gear_down=False)
        if m not in ('pc7', 'pa28'): trim(f)       # FGTrim fails for these two (03.1); they start from the IC
        f[cmd] = f[cmd] + 0.3
        for _ in range(int(0.5 / f.get_delta_t())): f.run()
        res[m][ax] = dict(step=0.3, surface_deg=round(f[POS[ax]], 2), p=round(f['velocities/p-rad_sec'], 3),
                          q=round(f['velocities/q-rad_sec'], 3), r=round(f['velocities/r-rad_sec'], 3), beta_deg=round(f['aero/beta-deg'], 2))
    print(m, json.dumps(res[m]), flush=True)
save(os.path.join(HERE, 'out', 'lb_signs.json'), dict(jsbsim=jsbsim.__version__, note='5,000 ft ISA, +0.3 command step, rates 0.5 s after the step (rad/s)', models=res))
