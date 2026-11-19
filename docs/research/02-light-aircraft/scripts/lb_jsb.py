# lb_jsb.py - helper library for the round-2 open-model experiments (topic 03, code LB).
# Runs the JSBSim 1.3.3 models bundled with the `jsbsim` wheel (LGPL-2.1 library; aircraft files GPL or no licence).
# Nothing from the XML is copied: we only set inputs through properties and read outputs. Numbers produced are ours.
import jsbsim, math, json, os
ROOT = jsbsim.get_default_root_dir()
DEG = math.pi / 180; KT = 0.514444; FT = 0.3048; LB = 0.45359237; P0_PSF = 2116.22
LAT, LON = 13.914, 100.606          # VTBD area (only sets gravity/earth position; ISA atmosphere is used)
MODELS = {   # flap detents (deg) and full-flap angle; retractable gear; mass slots to load (pointmass index order)
  'c172p':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2, 3, 4]),
  'c172r':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2]),
  'c172x':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2, 3, 4, 5]),
  'pa28':    dict(flaps=[0, 15, 25, 40], fmax=40, retract=False, kind='piston', slots=[0]),
  'pc7':     dict(flaps=[0, 15, 30], fmax=30, retract=True, kind='turboprop', slots=[0]),
  't6texan2':dict(flaps=[0, 15, 30], fmax=30, retract=True, kind='turbine', slots=[]),
}
# tank capacities (lb) as declared in each model's <tank><capacity> (no capacity property is exposed)
TANK_CAP_LB = {'c172p': [185.0, 185.0], 'c172r': [168.0, 168.0], 'c172x': [130.0, 130.0], 'pa28': [150.0],
               'pc7': [363.16, 363.16], 't6texan2': [500.0, 500.0]}
# empty-weight CG (x, z) in each model's structural frame, inches (from <mass_balance><location name="CG">)
REF_CG_IN = {'c172p': (41.0, 36.5), 'c172r': (39.0, 36.5), 'c172x': (41.0, 36.5), 'pa28': (88.32, 0.0), 'pc7': (154.02, -9.63), 't6texan2': (188.8, 0.0)}
def start_engine(f, model, secs=3.0):
    """pa28: set-running alone leaves the constant-speed prop at 0 rpm in flight; crank it with magnetos+starter."""
    if model != 'pa28': return
    f['propulsion/magneto_cmd'] = 3; f['propulsion/starter_cmd'] = 1
    for _ in range(int(secs / f.get_delta_t())): f.run()
    f['propulsion/starter_cmd'] = 0
def new(model, terrain_ft=-3000.0):
    f = jsbsim.FGFDMExec(ROOT); f.set_debug_level(0); f.load_model(model); f.disable_output()
    f['ic/lat-geod-deg'] = LAT; f['ic/long-gc-deg'] = LON; f['ic/psi-true-deg'] = 0.0
    f['ic/terrain-elevation-ft'] = terrain_ft
    return f
def n_tanks(f):
    n = 0
    while True:
        try: f[f'propulsion/tank[{n}]/contents-lbs']; n += 1
        except Exception: return n
def set_mass(f, model, w_lb, fuel_frac=1.0):
    """Fill fuel tanks (fraction of capacity, reduced if needed) then load pointmasses in slot order up to w_lb.
    Returns the weight reached (JSBSim updates inertia/weight-lbs after run_ic)."""
    cfg = MODELS[model]; nt = len(TANK_CAP_LB[model])
    caps = TANK_CAP_LB[model]
    for i in range(nt): f[f'propulsion/tank[{i}]/contents-lbs'] = caps[i] * fuel_frac
    if w_lb is None: return None
    f.run_ic(); w = f['inertia/weight-lbs']
    # protocol: every pointmass we load is moved to the model's empty-weight CG, so the loaded CG stays at the
    # designer's reference CG (model coordinates cannot be mapped to the POH datum without guessing).
    # clear the slots we use, then fill each up to 250 lb, any rest into the last slot
    slots = cfg['slots']; base = w - sum(f[f'inertia/pointmass-weight-lbs[{s}]'] for s in slots)
    for s_ in slots:
        f[f'inertia/pointmass-location-X-inches[{s_}]'] = REF_CG_IN[model][0]; f[f'inertia/pointmass-location-Y-inches[{s_}]'] = 0.0
        f[f'inertia/pointmass-location-Z-inches[{s_}]'] = REF_CG_IN[model][1]
    need = w_lb - base
    if need < 0:   # too heavy even with empty slots: reduce fuel
        fuel = sum(f[f'propulsion/tank[{i}]/contents-lbs'] for i in range(nt))
        for i in range(nt): f[f'propulsion/tank[{i}]/contents-lbs'] = max(0.0, f[f'propulsion/tank[{i}]/contents-lbs'] + need * (f[f'propulsion/tank[{i}]/contents-lbs'] / fuel))
        need = 0
    for k, s in enumerate(slots):
        put = need if k == len(slots) - 1 else min(need, 250.0)
        f[f'inertia/pointmass-weight-lbs[{s}]'] = put; need -= put
    return need   # >0 means the model could not reach w_lb (no slots left)
def mixture_for(h_ft):
    """keep the sea-level full-rich equivalence ratio: JSBSim FGPiston scales mixture by p0/p, so cmd = p/p0."""
    return min(1.0, (1 - 6.8756e-6 * h_ft) ** 5.2559)
def setup(f, model, kcas, h_ft, gamma=0.0, flap_deg=0.0, gear_down=True, thr=0.75, mix=None, running=True, prop_adv=1.0):
    cfg = MODELS[model]
    f['ic/h-sl-ft'] = h_ft; f['ic/vc-kts'] = kcas; f['ic/gamma-deg'] = gamma
    f['ic/beta-deg'] = 0.0; f['ic/phi-deg'] = 0.0
    f['fcs/flap-cmd-norm'] = flap_deg / cfg['fmax']
    f['gear/gear-cmd-norm'] = 1.0 if (gear_down or not cfg['retract']) else 0.0
    f['fcs/mixture-cmd-norm'] = mixture_for(h_ft) if mix is None else mix
    f['fcs/throttle-cmd-norm'] = thr; f['fcs/advance-cmd-norm'] = prop_adv
    f.run_ic()
    f['fcs/mixture-cmd-norm'] = mixture_for(h_ft) if mix is None else mix   # run_ic resets the mixture command to 1
    if running: f['propulsion/set-running'] = -1
    return f
def trim(f):
    try:
        f['simulation/do_simple_trim'] = 1; return True
    except Exception:
        return False
def state(f):
    g = lambda p: f[p]
    d = dict(t=g('simulation/sim-time-sec'), vc=g('velocities/vc-kts'), vt=g('velocities/vtrue-kts'), h=g('position/h-sl-ft'),
             hdot=g('velocities/h-dot-fps') * 60, alpha=g('aero/alpha-deg'), theta=g('attitude/theta-deg'), phi=g('attitude/phi-deg'),
             beta=g('aero/beta-deg'), q=g('velocities/q-rad_sec'), el=g('fcs/elevator-pos-deg'), thr=g('fcs/throttle-pos-norm'),
             flap=g('fcs/flap-pos-deg'), w=g('inertia/weight-lbs'), cgx=g('inertia/cg-x-in'),
             thrust=g('propulsion/engine/thrust-lbs'), qbar=g('aero/qbar-psf'))
    for p, k in [('propulsion/engine/engine-rpm', 'rpm'), ('propulsion/engine/propeller-rpm', 'prop_rpm'), ('propulsion/engine/power-hp', 'hp')]:
        try: d[k] = g(p)
        except Exception: pass
    S = g('metrics/Sw-sqft'); d['CL'] = g('forces/fwz-aero-lbs') / max(1e-6, d['qbar'] * S); d['CD'] = g('forces/fwx-aero-lbs') / max(1e-6, d['qbar'] * S)
    try: d['x_ft'] = g('position/distance-from-start-mag-mt') / FT
    except Exception: d['x_ft'] = None
    return d
class Pilot:
    """speed-on-pitch pilot model: theta_c = theta0 + Kv (Vc - Vt) + Kvi int(Vc - Vt); elevator from pitch error and q;
    wings level with aileron, yaw damper/beta hold with rudder. Signs measured: +aileron -> +p, +elevator -> nose down,
    +rudder -> nose left."""
    def __init__(self, theta0, Kv=0.6, Kvi=0.08, Kth=2.0, Kthi=0.6, Kq=0.6, th_lim=(-25, 30)):
        self.theta0, self.Kv, self.Kvi, self.Kth, self.Kthi, self.Kq, self.th_lim = theta0, Kv, Kvi, Kth, Kthi, Kq, th_lim
        self.Iv = 0.0; self.Ith = 0.0
    def hold_theta(self, f, thc_c, dt):
        eth = (f['attitude/theta-deg'] - thc_c) * DEG
        de = self.Kth * eth + self.Kthi * self.Ith + self.Kq * f['velocities/q-rad_sec']
        if -1 < de + f['fcs/pitch-trim-cmd-norm'] < 1: self.Ith += eth * dt
        f['fcs/elevator-cmd-norm'] = max(-1.0, min(1.0, de))
        f['fcs/aileron-cmd-norm'] = max(-1.0, min(1.0, -(1.5 * f['attitude/phi-rad'] + 0.4 * f['velocities/p-rad_sec'])))
        f['fcs/rudder-cmd-norm'] = max(-1.0, min(1.0, 1.0 * f['velocities/r-rad_sec'] - 2.0 * f['aero/beta-rad']))
    def step(self, f, vt, dt):
        vc = f['velocities/vc-kts']; ev = vc - vt
        thc = self.theta0 + self.Kv * ev + self.Kvi * self.Iv
        thc_c = min(max(thc, self.th_lim[0]), self.th_lim[1])
        if thc_c == thc: self.Iv += ev * dt
        eth = (f['attitude/theta-deg'] - thc_c) * DEG
        de = self.Kth * eth + self.Kthi * self.Ith + self.Kq * f['velocities/q-rad_sec']
        if -1 < de + f['fcs/pitch-trim-cmd-norm'] < 1: self.Ith += eth * dt
        f['fcs/elevator-cmd-norm'] = max(-1.0, min(1.0, de))
        f['fcs/aileron-cmd-norm'] = max(-1.0, min(1.0, -(1.5 * f['attitude/phi-rad'] + 0.4 * f['velocities/p-rad_sec'])))
        f['fcs/rudder-cmd-norm'] = max(-1.0, min(1.0, 1.0 * f['velocities/r-rad_sec'] - 2.0 * f['aero/beta-rad']))
        return thc_c
def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as fh: json.dump(obj, fh, indent=1)
