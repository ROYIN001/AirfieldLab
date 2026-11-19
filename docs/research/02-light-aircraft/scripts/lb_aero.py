# lb_aero.py - static (power-off, zero-rate) aerodynamic sweep of the JSBSim 1.3.3 bundled models: CL, CD, Cm versus
# alpha per flap detent, elevator 0, out of ground effect. Rate-dependent functions (alphadot, q) are subtracted.
# Gives CL0, CLalpha (linear fit -2..6 deg), CLmax and alpha at CLmax, CD at CL=0 (CD_min) and Cm0/Cmalpha.
# Output: scripts/out/lb_aero.json. Numbers are measured by running the models (ours); no XML is copied.
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lb_jsb import *
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out', 'lb_aero.json')
EXTRACT = json.load(open(os.path.join(HERE, 'out', 'lb_extract.json')))
RATE = ('aero/alphadot-rad_sec', 'velocities/q-aero-rad_sec', 'aero/alphadot-rad_sec', 'aero/bi2vel', 'aero/ci2vel')
def rate_funcs(m, axis):
    return [f['name'] for f in EXTRACT[m]['aero'].get(axis, []) if any(p in RATE[:2] for p in f['props'])]
def sweep(m, flap):
    f = new(m); set_mass(f, m, None)
    f['ic/h-sl-ft'] = 5000; f['ic/vc-kts'] = 100; f.run_ic()
    f['fcs/flap-cmd-norm'] = flap / MODELS[m]['fmax']; f['gear/gear-cmd-norm'] = 1.0 if not MODELS[m]['retract'] else 0.0
    for _ in range(int(12 / f.get_delta_t())): f.run()           # let the kinematic flap reach the detent
    S = f['metrics/Sw-sqft']; c = f['metrics/cbarw-ft']; rows = []
    lift_rate = rate_funcs(m, 'LIFT'); pitch_rate = rate_funcs(m, 'PITCH'); drag_rate = rate_funcs(m, 'DRAG')
    for a10 in range(-60, 241, 5):
        a = a10 / 10
        f['ic/h-sl-ft'] = 5000; f['ic/vc-kts'] = 100; f['ic/alpha-deg'] = a; f['ic/theta-deg'] = a; f['ic/beta-deg'] = 0
        f['ic/q-rad_sec'] = 0; f['ic/p-rad_sec'] = 0; f['ic/r-rad_sec'] = 0; f['fcs/elevator-cmd-norm'] = 0; f['fcs/pitch-trim-cmd-norm'] = 0
        f.run_ic(); q = f['aero/qbar-psf']
        L = f['forces/fwz-aero-lbs'] - sum(f[n] for n in lift_rate)
        D = f['forces/fwx-aero-lbs'] - sum(f[n] for n in drag_rate)
        M = f['moments/m-aero-lbsft'] - sum(f[n] for n in pitch_rate)
        rows.append(dict(alpha=a, CL=L / (q * S), CD=D / (q * S), Cm=M / (q * S * c), flap=f['fcs/flap-pos-deg']))
    lin = [x for x in rows if -2.0 <= x['alpha'] <= 6.0]
    n = len(lin); sx = sum(x['alpha'] for x in lin); sy = sum(x['CL'] for x in lin); sxx = sum(x['alpha'] ** 2 for x in lin); sxy = sum(x['alpha'] * x['CL'] for x in lin)
    slope = (n * sxy - sx * sy) / (n * sxx - sx * sx); icpt = (sy - slope * sx) / n
    sm = sum(x['Cm'] * x['alpha'] for x in lin); smy = sum(x['Cm'] for x in lin); cma = (n * sm - sx * smy) / (n * sxx - sx * sx)
    top = max(rows, key=lambda x: x['CL']); cdmin = min(rows, key=lambda x: x['CD'])
    return dict(flap_deg=round(rows[0]['flap'], 2), CL0=round(icpt, 4), CLalpha_per_rad=round(slope * 57.2958, 3), CLmax=round(top['CL'], 3),
                alpha_CLmax_deg=top['alpha'], CDmin=round(cdmin['CD'], 4), alpha_CDmin=cdmin['alpha'], Cm0=round(next(x['Cm'] for x in rows if x['alpha'] == 0), 4),
                Cmalpha_per_rad=round(cma * 57.2958, 3), CD_at_CL05=round(min(rows, key=lambda x: abs(x['CL'] - 0.5))['CD'], 4),
                excluded_rate_functions=lift_rate + pitch_rate + drag_rate)
if __name__ == '__main__':
    res = {}
    for m in MODELS:
        res[m] = {str(fl): sweep(m, fl) for fl in MODELS[m]['flaps']}
        print(m, json.dumps({k: [v['CL0'], v['CLalpha_per_rad'], v['CLmax'], v['alpha_CLmax_deg'], v['CDmin'], v['Cmalpha_per_rad']] for k, v in res[m].items()}), flush=True)
    save(OUT, res)
