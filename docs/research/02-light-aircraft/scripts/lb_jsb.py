# lb_jsb.py - helper library for the round-2 open-model experiments (topic 03, code LB).
# Runs (1) the JSBSim 1.3.3 models bundled with the `jsbsim` wheel (LGPL-2.1 library; aircraft files GPL or no licence)
# and (2) FlightGear JSBSim models fetched by lb_fg_fetch.py into a scratch folder OUTSIDE the repo (GPL; never copied
# into the repo). Nothing from the XML is copied: we set inputs through properties and read outputs; the few facts the
# protocol needs (tank capacity, empty-weight CG, names of rate-dependent functions) are read from the installed or
# fetched XML at run time. Numbers produced are ours.
# Fix 2026-11-19 (completeness check, gaps 3 and 14): no hard-coded XML constants any more (TANK_CAP_LB / REF_CG_IN are
# read from the XML at run time and give the same values as before), FlightGear models registered in FG_MODELS, and a
# loader that pre-creates the FlightGear-owned properties (/sim/..., /controls/..., systems/canopy/...) that FlightGear
# itself would provide, so the XML loads in plain JSBSim.
import jsbsim, math, json, os, re, tempfile, xml.etree.ElementTree as ET
ROOT = jsbsim.get_default_root_dir()
DEG = math.pi / 180; KT = 0.514444; FT = 0.3048; LB = 0.45359237; P0_PSF = 2116.22
LAT, LON = 13.914, 100.606          # VTBD area (only sets gravity/earth position; ISA atmosphere is used)
# scratch folder with the fetched FlightGear repos and a JSBSim root (aircraft/<model> symlinks): see lb_fg_fetch.py
FG_DIR = os.environ.get('LB_FG_DIR') or os.path.join(tempfile.gettempdir(), 'lb_fg')
FG_ROOT = os.path.join(FG_DIR, 'root')
MODELS = {   # flap detents (deg) and full-flap angle; retractable gear; mass slots to load (pointmass index order)
  'c172p':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2, 3, 4]),
  'c172r':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2]),
  'c172x':   dict(flaps=[0, 10, 20, 30], fmax=30, retract=False, kind='piston', slots=[1, 0, 2, 3, 4, 5]),
  'pa28':    dict(flaps=[0, 15, 25, 40], fmax=40, retract=False, kind='piston', slots=[0]),
  'pc7':     dict(flaps=[0, 15, 30], fmax=30, retract=True, kind='turboprop', slots=[0]),
  't6texan2':dict(flaps=[0, 15, 30], fmax=30, retract=True, kind='turbine', slots=[]),
}
# FlightGear JSBSim models (gap 14). repo + commit pin the exact files; xml = model name under FG_ROOT/aircraft/.
# flaps = flap angles tested, in fcs/flap-pos-deg of the model (PC-9M, DA40 NG, T-6: the model's own detents, which for
# the DA40 NG are 0/15/30 deg, not the AFM's 0/20/42; C152: the POH stall-table angles 0/10/30, reached by commanding a
# fraction of the model's 30 deg travel); flap_cmd = property that
# commands the flaps when it is not fcs/flap-cmd-norm (the DA40 NG model uses a FlightGear property).
FG_MODELS = {
  'fg_pc9m':   dict(repo='FGMEMBERS/PC-9M', commit='8cf7c875d7d4e3d0eaadd28f358c0c422ecb927f', dir='PC-9M', xml='PC-9M',
                    licence='GPL-3.0 (GPLv3 logo in PC9-shared.xml; no COPYING file)', flaps=[0, 23, 50], fmax=50,
                    retract=True, kind='turboprop', slots=[0]),
  'fg_c152':   dict(repo='FGMEMBERS/c152', commit='b8286b92050c4b77050ea262f6d2dedcc587b219', dir='c152', xml='c152',
                    licence='GPL-2.0 (LICENSE)', flaps=[0, 10, 30], fmax=30, retract=False, kind='piston', slots=[0]),
  'fg_da40ng': dict(repo='sryu1/DA40', commit='0d50a457edb203b9ac6058b41cac1b33922acf28', dir='DA40', xml='da40ng-jsb',
                    licence='GPL-2.0 (COPYING)', flaps=[0, 15, 30], fmax=30, retract=False, kind='piston', slots=[0, 1, 2, 3, 4],
                    flap_cmd='/controls/flight/flaps-int', throttle_prop='/controls/engines/engine[0]/throttle', fadec=True,
                    sync={'/position/altitude-ft': 'position/h-sl-ft'},
                    fg_props={'/controls/fuel/fuel-tank-selector': 1, '/controls/electric/engine-master': 1,
                              '/controls/electric/electric-master': 1, '/environment/temperature-degc': 15.0}),
  'fg_t6':     dict(repo='FGMEMBERS/T-6', commit='15837eeccf087353a1636992ded82585f87d5dbb', dir='T-6', xml='T-6',
                    licence='GPL-2.0 (COPYING)', flaps=[0, 0.5, 1.0], fmax=1.0, retract=True, kind='turbine', slots=[]),
}
for _k, _v in FG_MODELS.items(): MODELS[_k] = _v
def is_fg(model): return model in FG_MODELS
def xml_path(model):
    if is_fg(model): x = FG_MODELS[model]['xml']; return os.path.join(FG_ROOT, 'aircraft', x, x + '.xml')
    return os.path.join(ROOT, 'aircraft', model, model + '.xml')
def _lb(e):
    v = float(e.text); u = (e.get('unit') or 'LBS').upper()
    return v / LB if u in ('KG', 'KGS') else v
def _inch(e, unit):
    v = float(e.text); u = (unit or 'IN').upper()
    return v / 0.0254 if u == 'M' else v
_FACTS = {}
def xml_facts(model):
    """facts the protocol needs, read from the model XML at run time (not stored in the repo): tank capacities (lb) and
    the empty-weight CG location (x, z in the model's structural frame, inches)."""
    if model in _FACTS: return _FACTS[model]
    r = ET.parse(xml_path(model)).getroot()
    caps = [_lb(t.find('capacity')) for t in r.find('propulsion').findall('tank')]
    loc = r.find('mass_balance').find('location'); u = loc.get('unit')
    _FACTS[model] = dict(tank_cap_lb=caps, ref_cg_in=(_inch(loc.find('x'), u), _inch(loc.find('z'), u)))
    return _FACTS[model]
class _Lazy(dict):
    def __init__(self, key): super().__init__(); self.key = key
    def __missing__(self, m): v = xml_facts(m)[self.key]; self[m] = v; return v
TANK_CAP_LB = _Lazy('tank_cap_lb')   # same values as the constants used before the fix (c172p 185 + 185 lb, ...)
REF_CG_IN = _Lazy('ref_cg_in')       # (c172p (41.0, 36.5), pc7 (154.02, -9.63), ...)
def _axis_functions(model, axis):
    r = ET.parse(xml_path(model)).getroot(); aero = r.find('aerodynamics'); out = []
    for ax in aero.findall('axis'):
        if ax.get('name') == axis:
            for fn in ax.findall('function'):
                out.append((fn.get('name'), set(re.sub(r'\s+', ' ', p.text or '').strip() for p in fn.iter('property'))))
    return out
def rate_functions(model, axis):
    """names of the aero functions of one axis that use alpha-dot or the pitch rate (subtracted in the static sweep).
    Read from the XML at run time; replaces the lookup in out/lb_extract.json, which is not in the repo (D7)."""
    return [n for n, props in _axis_functions(model, axis) if props & {'aero/alphadot-rad_sec', 'velocities/q-aero-rad_sec'}]
def propwash_terms(model, axis):
    """aero functions of one axis that depend on the propeller, as (name, kind, property):
    'ct'   adds a term proportional to the thrust coefficient (subtracted for power-off values; with the engine stopped
           the coefficient is not zero, 03.2.3 item 5);
    'qind' is scaled by a dynamic pressure that includes the propeller-induced velocity (PC-9M style); it is rescaled to
           the free-stream qbar-psf, i.e. value * qbar / qbar_induced (so the airframe part stays in);
    'wash' uses the induced velocity alone (DA40 style); it is zero in the static states used here and is left in."""
    out = []
    for n, props in _axis_functions(model, axis):
        ct = [p for p in props if 'thrust-coefficient' in p]
        qi = [p for p in props if 'qbar-induced' in p]
        wa = [p for p in props if ('propwash' in p or 'prop-induced' in p) and not ct and not qi]
        if ct: out.append((n, 'ct', ct[0]))
        elif qi: out.append((n, 'qind', qi[0]))
        elif wa: out.append((n, 'wash', wa[0]))
    return out
def propwash_functions(model, axis):
    """names of the additive thrust-coefficient terms of one axis (subtracted for power-off airframe values)."""
    return [n for n, k, _ in propwash_terms(model, axis) if k == 'ct']
def poweroff_correction(f, model, axis, terms=None):
    """what to subtract from the axis total for the power-off airframe value: the 'ct' terms in full and the
    induced part of the 'qind' terms (value * (1 - qbar / qbar_induced)); 'wash' terms add nothing."""
    q = f['aero/qbar-psf']; c = 0.0
    for n, k, p in (terms if terms is not None else propwash_terms(model, axis)):
        if k == 'ct': c += f[n]
        elif k == 'qind':
            qi = f[p]
            if qi > 1e-6: c += f[n] * (1.0 - q / qi)
    return c
def start_engine(f, model, secs=3.0):
    """pa28: set-running alone leaves the constant-speed prop at 0 rpm in flight; crank it with magnetos+starter."""
    if model != 'pa28': return
    f['propulsion/magneto_cmd'] = 3; f['propulsion/starter_cmd'] = 1
    for _ in range(int(secs / f.get_delta_t())): f.run()
    f['propulsion/starter_cmd'] = 0
def setp(f, path, v):
    """set a property that may live outside /fdm/jsbsim (FlightGear-owned, absolute path)."""
    if path.startswith('/'): f.get_property_manager().get_node(path, True).set_double_value(float(v))
    else: f[path] = v
_FG_PRESET = {}
def _fg_load(model):
    """load a FlightGear JSBSim model in plain JSBSim: properties that FlightGear itself would provide are created
    (value 0, or the value in fg_props) before loading; a missing one reported by the first run_ic is added and the load
    is retried."""
    if not os.path.exists(xml_path(model)):
        raise SystemExit(f'{model}: {xml_path(model)} not found - run python3 -I scripts/lb_fg_fetch.py first '
                         '(it clones the GPL FlightGear repos at the pinned commits into a scratch folder outside the repo)')
    pre = _FG_PRESET.setdefault(model, [])
    for _ in range(100):
        f = jsbsim.FGFDMExec(FG_ROOT); f.set_debug_level(0); pm = f.get_property_manager()
        for p in pre: pm.get_node(p, True)
        for p, v in FG_MODELS[model].get('fg_props', {}).items(): pm.get_node(p, True).set_double_value(float(v))
        f.load_model(FG_MODELS[model]['xml']); f.disable_output()
        try:
            f['ic/lat-geod-deg'] = LAT; f['ic/long-gc-deg'] = LON; f['ic/h-sl-ft'] = 5000; f['ic/vc-kts'] = 100; f.run_ic()
            return f
        except Exception as e:
            mm = re.search(r'The property (\S+) does not exist', str(e))
            if not mm or mm.group(1) in pre: raise
            pre.append(mm.group(1))
    raise RuntimeError(f'{model}: too many missing FlightGear properties')
class FGProxy:
    """wraps an FGFDMExec for a FlightGear model whose FCS reads FlightGear-owned inputs: writes to
    fcs/throttle-cmd-norm go to the power lever property (the DA40 NG FCS maps lever -> load % -> throttle, propeller
    rpm and mixture like the AE300 FADEC), and before every step the properties in `sync` copy their JSBSim source
    (e.g. /position/altitude-ft, which the DA40 NG mixture schedule reads)."""
    def __init__(self, f, cfg):
        self.__dict__['_f'] = f; self.__dict__['_cfg'] = cfg; self.__dict__['_thr'] = 0.0
    def __getattr__(self, k): return getattr(self._f, k)
    def __setattr__(self, k, v): setattr(self._f, k, v)
    def __getitem__(self, k):
        if k == 'fcs/throttle-cmd-norm' and self._cfg.get('throttle_prop'): return self._thr
        return self._f[k]
    def __setitem__(self, k, v):
        if k == 'fcs/throttle-cmd-norm' and self._cfg.get('throttle_prop'):
            self.__dict__['_thr'] = v; setp(self._f, self._cfg['throttle_prop'], v)
        self._f[k] = v
    def _sync(self):
        for dst, src in self._cfg.get('sync', {}).items(): setp(self._f, dst, self._f[src])
    def run(self): self._sync(); return self._f.run()
    def run_ic(self): self._sync(); return self._f.run_ic()
def new(model, terrain_ft=-3000.0):
    if is_fg(model):
        f = _fg_load(model)
        if FG_MODELS[model].get('throttle_prop') or FG_MODELS[model].get('sync'): f = FGProxy(f, FG_MODELS[model])
    else: f = jsbsim.FGFDMExec(ROOT); f.set_debug_level(0); f.load_model(model); f.disable_output()
    f['ic/lat-geod-deg'] = LAT; f['ic/long-gc-deg'] = LON; f['ic/psi-true-deg'] = 0.0
    f['ic/terrain-elevation-ft'] = terrain_ft
    return f
def flap_cmd(f, model, deg):
    setp(f, MODELS[model].get('flap_cmd', 'fcs/flap-cmd-norm'), deg / MODELS[model]['fmax'])
def flap_pos(f, model):
    """flap position in the units of MODELS[model]['flaps'] (deg; fg_t6 defines its detents as 0 / 0.5 / 1 of full)."""
    return f['fcs/flap-pos-norm'] * MODELS[model]['fmax'] if model == 'fg_t6' else f['fcs/flap-pos-deg']
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
    flap_cmd(f, model, flap_deg)
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
def state(f, model=None):
    g = lambda p: f[p]
    d = dict(t=g('simulation/sim-time-sec'), vc=g('velocities/vc-kts'), vt=g('velocities/vtrue-kts'), h=g('position/h-sl-ft'),
             hdot=g('velocities/h-dot-fps') * 60, alpha=g('aero/alpha-deg'), theta=g('attitude/theta-deg'), phi=g('attitude/phi-deg'),
             beta=g('aero/beta-deg'), q=g('velocities/q-rad_sec'), el=g('fcs/elevator-pos-deg'), thr=g('fcs/throttle-pos-norm'),
             flap=flap_pos(f, model) if model else g('fcs/flap-pos-deg'), w=g('inertia/weight-lbs'), cgx=g('inertia/cg-x-in'),
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
# out/lb_extract.json (constants and table shapes read from LGPL/GPL XML) is deliberately NOT in the repo (D7). No
# script needs it any more; anything that wants it for local analysis must call load_extract(), which stops with this:
EXTRACT_MSG = ('scripts/out/lb_extract.json is missing: run python3 -I scripts/lb_extract.py first; the file is not in the '
               'repo because it holds values read from LGPL/GPL JSBSim/FlightGear XML (decision D7, see 03.5.5)')
def load_extract():
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'lb_extract.json')
    if not os.path.exists(p): raise SystemExit(EXTRACT_MSG)
    return json.load(open(p))
def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as fh: json.dump(obj, fh, indent=1)
