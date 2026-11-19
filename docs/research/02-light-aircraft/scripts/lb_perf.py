# lb_perf.py - scripted, reproducible performance measurements of the JSBSim 1.3.3 bundled models (topic 03, code LB).
# Usage: python3 -I scripts/lb_perf.py <model> [tests...]     tests: stall climb glide cruise static takeoff
# Output: scripts/out/lb_perf_<model>.json, each test merged in as soon as it finishes (a cut-off run keeps its results).
# Speeds: JSBSim has no pitot-static error model, so velocities/vc-kts is KCAS. POH KIAS values are converted to KCAS
# with the POH calibration table before comparison (lb_compare.mjs). Weight: published MTOW of the real type, payload
# placed at the model's empty-weight CG (lb_jsb.set_mass). ISA, zero wind, default JSBSim dt (1/120 s).
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lb_jsb import *
HERE = os.path.dirname(os.path.abspath(__file__))
PIST = ('c172p', 'c172r', 'c172x', 'pa28')
CASES = {   # w = MTOW (lb) of the real type; vs = rough stall guess (only sets start speeds); cruise = (alt ft, mode, target)
 'c172p':   dict(w=2400, vs=48, climb=range(55, 111, 5), glide=range(55, 96, 5), cruise=[(8000, 'rpm', 2600), (8000, 'rpm', 2500), (4000, 'rpm', 2500), (8000, 'full', None)], to_flap=10, vr=50, v50=56, theta_rot=8),
 'c172r':   dict(w=2450, vs=48, climb=range(55, 111, 5), glide=range(55, 96, 5), cruise=[(8000, 'rpm', 2600), (8000, 'rpm', 2500), (4000, 'rpm', 2500), (8000, 'full', None)], to_flap=10, vr=51, v50=57, theta_rot=8),
 'c172x':   dict(w=2400, vs=48, climb=range(55, 111, 5), glide=range(55, 96, 5), cruise=[(8000, 'rpm', 2600), (8000, 'rpm', 2500), (4000, 'rpm', 2500), (8000, 'full', None)], to_flap=10, vr=50, v50=56, theta_rot=8),
 'pa28':    dict(w=2450, vs=50, climb=range(60, 121, 5), glide=range(60, 101, 5), cruise=[(8000, 'hp', 135.0), (8000, 'full', None), (4000, 'hp', 135.0)], to_flap=0, vr=60, v50=70, theta_rot=8),
 'pc7':     dict(w=5952, vs=70, climb=range(90, 201, 10), glide=range(85, 171, 5), cruise=[(10000, 'full', None), (20000, 'full', None, 130), (20000, 'full', None, 160)], to_flap=15, vr=85, v50=100, theta_rot=8),
 't6texan2':dict(w=6500, vs=80, climb=range(110, 231, 10), glide=range(100, 181, 5), cruise=[(1000, 'full', None, 240), (10000, 'full', None), (22000, 'full', None)], to_flap=15, vr=90, v50=110, theta_rot=8),
}
EL_STOP = {'c172p': -28.0, 'c172r': -28.0, 'c172x': -28.0, 'pa28': -28.0, 'pc7': -20.05, 't6texan2': -30.0}  # TE-up stop, deg
def outpath(m): return os.path.join(HERE, 'out', f'lb_perf_{m}.json')
def load(m):
    try: return json.load(open(outpath(m)))
    except Exception: return {'model': m}
def r(x, n=2): return None if x is None else round(x, n)
def avg(rows, k): 
    v = [x[k] for x in rows if x.get(k) is not None]; return sum(v) / len(v) if v else None
def start(m, kcas, h, flap=0.0, gear_down=True, gamma=0.0, mix=None, thr=0.75, terrain=-3000.0):
    """new FDM at MTOW, IC, engine running, longitudinal trim; if FGTrim fails (pc7: FGTurboProp gives 0 hp in its trim phase; pa28 prop) the pilot
    settles the aircraft for 25 s: speed on pitch, altitude (or gamma) on throttle."""
    f = new(m, terrain); left = set_mass(f, m, CASES[m]['w'])
    setup(f, m, kcas, h, gamma=gamma, flap_deg=flap, gear_down=gear_down, mix=mix, thr=thr); start_engine(f, m)
    ok = trim(f) if m not in ('pc7', 'pa28') else False
    if not ok:
        if m == 'pc7': f['fcs/throttle-cmd-norm'] = 0.8
        P = Pilot(f['attitude/theta-deg']); dt = f.get_delta_t(); I = 0.0; thr0 = f['fcs/throttle-cmd-norm']
        for _ in range(int(25 / dt)):
            P.step(f, kcas, dt); e = -(f['velocities/h-dot-fps'] * 60 - 0.0) / 1000.0; I += e * dt
            f['fcs/throttle-cmd-norm'] = max(0.0, min(1.0, thr0 + 0.4 * e + 0.15 * I)); f.run()
    return f, ok, left
# ---------- 1-g stall, 1 kt/s, idle ---------------------------------------------------------------------------------
def t_stall(m):
    c = CASES[m]; res = {}
    for fl in MODELS[m]['flaps']:
        v0 = round(c['vs'] * 1.45); f, ok, left = start(m, v0, 3000, flap=fl, gear_down=True); s0 = state(f)
        P = Pilot(s0['theta']); f['fcs/throttle-cmd-norm'] = 0.0
        dt = f.get_delta_t(); t = 0.0; vmin = 1e9; rec = None; amax = -99; ra = None
        while t < v0 - 0.5 * c['vs'] + 10:
            P.step(f, v0 - 1.0 * t, dt); f.run(); t += dt; s = state(f)
            if s['vc'] < vmin: vmin, rec = s['vc'], s
            if s['alpha'] > amax: amax, ra = s['alpha'], s
            if s['vc'] > vmin + 5 and t > 5: break
        res[str(fl)] = dict(trim_ok=ok, w_lb=r(s0['w'], 1), not_loaded_lb=r(left, 1), cg_x_in=r(s0['cgx'], 2), v0_kcas=v0, flap_deg=r(s0['flap'], 1),
                            vs_kcas=r(vmin), alpha_at_vs=r(rec['alpha']), elev_at_vs=r(rec['el']), CL_at_vs=r(rec['CL'], 3),
                            alpha_max=r(amax), CL_at_alpha_max=r(ra['CL'], 3), hdot_at_vs_fpm=r(rec['hdot'], 0),
                            limit='elevator stop' if rec['el'] <= EL_STOP[m] + 1.0 else 'aero (CL break)')
    return res
# ---------- climb at full throttle, sea level ISA --------------------------------------------------------------------
def t_climb(m):
    c = CASES[m]; pts = []
    for v in c['climb']:
        h0 = -700.0 if m in PIST else -2500.0
        f, ok, left = start(m, v, h0, flap=0, gear_down=False, mix=1.0); s0 = state(f)
        P = Pilot(s0['theta']); f['fcs/throttle-cmd-norm'] = 1.0; f['fcs/mixture-cmd-norm'] = 1.0
        dt = f.get_delta_t(); t = 0.0; win = []
        while t < 200:
            P.step(f, v, dt); f.run(); t += dt; s = state(f)
            if t > 15 and abs(s['h']) < 150: win.append(s)
            if s['h'] > 200 and t > 15: break
        if not win: pts.append(dict(kcas=v, trim_ok=ok, roc_fpm=None)); continue
        pts.append(dict(kcas=v, trim_ok=ok, vc=r(avg(win, 'vc')), roc_fpm=r(avg(win, 'hdot'), 0), theta=r(avg(win, 'theta')), alpha=r(avg(win, 'alpha')),
                        rpm=r(avg(win, 'prop_rpm'), 0), hp=r(avg(win, 'hp'), 1), thrust_lb=r(avg(win, 'thrust'), 1), w_lb=r(s0['w'], 1)))
    good = [p for p in pts if p['roc_fpm'] is not None]
    best = max(good, key=lambda p: p['roc_fpm']); i = good.index(best); vy, rocmax = best['vc'], best['roc_fpm']; edge = not (0 < i < len(good) - 1)
    if not edge:   # parabola through the best point and its neighbours
        (x0, y0), (x1, y1), (x2, y2) = [(good[j]['vc'], good[j]['roc_fpm']) for j in (i - 1, i, i + 1)]
        den = (x0 - x1) * (x0 - x2) * (x1 - x2); A = (x2 * (y1 - y0) + x1 * (y0 - y2) + x0 * (y2 - y1)) / den
        B = (x2 * x2 * (y0 - y1) + x1 * x1 * (y2 - y0) + x0 * x0 * (y1 - y2)) / den; C = (x1 * x2 * (x1 - x2) * y0 + x2 * x0 * (x2 - x0) * y1 + x0 * x1 * (x0 - x1) * y2) / den
        vy = -B / (2 * A); rocmax = C - B * B / (4 * A)
    return dict(points=pts, vy_kcas=r(vy, 1), roc_max_fpm=r(rocmax, 0), vy_at_sweep_edge=edge,
                note='SL ISA (window |h|<150 ft), flaps 0, gear up, full throttle, mixture full rich, prop max rpm')
# ---------- glide, engine off --------------------------------------------------------------------------------------
def t_glide(m):
    c = CASES[m]; pts = []
    for v in c['glide']:
        f, ok, left = start(m, v, 6000, flap=0, gear_down=False, gamma=-4.0 if m not in ('pc7', 'pa28') else 0.0); s0 = state(f)
        P = Pilot(s0['theta']); f['fcs/throttle-cmd-norm'] = 0.0; f['fcs/mixture-cmd-norm'] = 0.0
        if m in PIST: f['propulsion/magneto_cmd'] = 0
        else: f['propulsion/cutoff_cmd'] = 1
        if m == 'pc7': f['fcs/feather-cmd-norm'] = 1.0
        dt = f.get_delta_t(); t = 0.0; win = []
        while t < 100:
            P.step(f, v, dt); f.run(); t += dt; s = state(f)
            if t > 60: win.append(s)
        vh = avg(win, 'vt') * math.cos(math.asin(avg(win, 'hdot') / 60 / (avg(win, 'vt') * 1.68781)))
        pts.append(dict(kcas=v, vc=r(avg(win, 'vc')), ktas=r(avg(win, 'vt')), sink_fpm=r(-avg(win, 'hdot'), 0), ratio=r(vh * 1.68781 * 60 / -avg(win, 'hdot'), 2),
                        alpha=r(avg(win, 'alpha')), h_ft=r(avg(win, 'h'), 0), prop_rpm=r(avg(win, 'prop_rpm'), 0)))
    ok_pts = [p for p in pts if abs(p['vc'] - p['kcas']) < 1.5]
    best = max(ok_pts, key=lambda p: p['ratio'])
    return dict(points=pts, best_kcas=best['vc'], best_ratio=best['ratio'], best_at_sweep_edge=best in (ok_pts[0], ok_pts[-1]),
                note='engine off (piston: magnetos off, prop windmills or stops as the model decides; pc7: cutoff + feather; t6: cutoff), flaps 0, gear up, 4,000-5,500 ft ISA, last 40 s of 100 s')
# ---------- cruise: altitude on pitch, throttle on rpm / power / full; speed free ---------------------------------
def best_mix(m, h, v):
    """pilot leaning at full throttle: mixture that gives the highest rpm/power after 6 s (POH: lean for max rpm)."""
    best = (None, -1)
    for k in range(0, 21):
        mix = 0.5 + 0.025 * k; f, ok, left = start(m, v, h, flap=0, gear_down=False, mix=mix)
        f['fcs/throttle-cmd-norm'] = 1.0; f['fcs/mixture-cmd-norm'] = mix
        for _ in range(int(6 / f.get_delta_t())): f.run()
        if f['propulsion/engine/power-hp'] > best[1]: best = (mix, f['propulsion/engine/power-hp'])
    return best[0]
def t_cruise(m):
    res = []
    for case in CASES[m]['cruise']:
        h, mode, target = case[:3]; v0 = case[3] if len(case) > 3 else (100 if m in PIST else 180)
        mix = best_mix(m, h, v0) if m in PIST else 1.0
        f, ok, left = start(m, v0, h, flap=0, gear_down=False, mix=mix); f['fcs/mixture-cmd-norm'] = mix
        P = Pilot(f['attitude/theta-deg']); dt = f.get_delta_t()
        thr = f['fcs/throttle-cmd-norm']; It = 0.0; Ih = 0.0; t = 0.0; win = []
        while t < 400:
            eh = (h - f['position/h-sl-ft']); Ih += eh * dt
            thc = P.theta0 + 0.01 * eh + 0.0008 * Ih - 0.003 * f['velocities/h-dot-fps'] * 60 / 10
            P.hold_theta(f, max(-10, min(15, thc)), dt)
            if mode == 'full': thr = 1.0
            else:
                meas = f['propulsion/engine/engine-rpm'] if mode == 'rpm' else f['propulsion/engine/power-hp']
                e = (target - meas) / (500.0 if mode == 'rpm' else 50.0); It += e * dt; thr = max(0.0, min(1.0, 0.6 + 0.3 * e + 0.08 * It))
            f['fcs/throttle-cmd-norm'] = thr; f.run(); t += dt
            if t > 340: win.append(state(f))
        res.append(dict(h_ft=h, mode=mode, target=target, v0_kcas=v0, ktas=r(avg(win, 'vt'), 1), kcas=r(avg(win, 'vc'), 1), h_avg=r(avg(win, 'h'), 0),
                        hdot_fpm=r(avg(win, 'hdot'), 0), rpm=r(avg(win, 'prop_rpm'), 0), hp=r(avg(win, 'hp'), 1), thr=r(avg(win, 'thr'), 3),
                        mixture=r(mix, 3), dv_last60s=r(win[-1]['vt'] - win[0]['vt'], 2)))
    return res
# ---------- power required at 8,000 ft (speed on pitch, altitude on throttle, 90 s): front-side cruise check ---------
def t_preq(m):
    rows = []; h = 8000
    for v in (range(70, 141, 10) if m in PIST else range(110, 241, 10)):
        f, ok, left = start(m, v, h, flap=0, gear_down=False, mix=0.85 if m in PIST else None)
        P = Pilot(f['attitude/theta-deg']); dt = f.get_delta_t(); I = 0.0; thr0 = f['fcs/throttle-cmd-norm']; win = []
        for k in range(int(90 / dt)):
            P.step(f, v, dt); e = (h - f['position/h-sl-ft']) / 100.0 - f['velocities/h-dot-fps'] * 60 / 1000.0; I += e * dt
            f['fcs/throttle-cmd-norm'] = max(0.0, min(1.0, thr0 + 0.3 * e + 0.05 * I)); f.run()
            if k * dt > 60: win.append(state(f))
        rows.append(dict(kcas=v, ktas=r(avg(win, 'vt'), 1), hp=r(avg(win, 'hp'), 1), thr=r(avg(win, 'thr'), 3), h=r(avg(win, 'h'), 0), hdot=r(avg(win, 'hdot'), 0), alpha=r(avg(win, 'alpha'))))
    return dict(h_ft=h, rows=rows, note='speed held on pitch, altitude on throttle; thr 1.0 with h below 8000 means the speed cannot be held level')
# ---------- static rpm and take-off --------------------------------------------------------------------------------
def ground(m, flap):
    f = new(m, terrain_ft=0.0); set_mass(f, m, CASES[m]['w'])
    f['ic/h-agl-ft'] = 6.0 if m in PIST else 8.0; f['ic/vc-kts'] = 0; f['ic/u-fps'] = 0; f['ic/theta-deg'] = 0
    f['fcs/flap-cmd-norm'] = flap / MODELS[m]['fmax']; f['gear/gear-cmd-norm'] = 1; f['fcs/mixture-cmd-norm'] = 1; f['fcs/advance-cmd-norm'] = 1
    f.run_ic(); f['propulsion/set-running'] = -1; start_engine(f, m)
    for b in ('left', 'right', 'center'): f[f'fcs/{b}-brake-cmd-norm'] = 1.0
    f['fcs/throttle-cmd-norm'] = 0.0
    for _ in range(int(10 / f.get_delta_t())): f.run()     # settle on the gear, flaps travel
    f['fcs/throttle-cmd-norm'] = 1.0
    for _ in range(int(10 / f.get_delta_t())): f.run()     # spool / rpm settle, brakes on
    return f
def t_static(m):
    f = ground(m, 0); s = state(f)
    return dict(engine_rpm=r(s.get('rpm'), 0), prop_rpm=r(s.get('prop_rpm'), 0), hp=r(s.get('hp'), 1), thrust_lb=r(s['thrust'], 1), vc_kts=r(s['vc']),
                note='SL ISA, brakes on, full throttle, mixture full rich, 10 s after throttle-up')
def t_takeoff(m):
    c = CASES[m]; f = ground(m, c['to_flap']); dt = f.get_delta_t()
    x0 = f['position/distance-from-start-mag-mt']; psi0 = f['attitude/psi-rad']; h_gear = f['position/h-agl-ft']
    for b in ('left', 'right', 'center'): f[f'fcs/{b}-brake-cmd-norm'] = 0.0
    t = 0.0; phase = 'roll'; x_lo = t_lo = v_lo = x50 = v50 = None; P = None
    while t < 120:
        vc = f['velocities/vc-kts']
        dpsi = math.atan2(math.sin(f['attitude/psi-rad'] - psi0), math.cos(f['attitude/psi-rad'] - psi0))
        f['fcs/rudder-cmd-norm'] = max(-1, min(1, 3.0 * dpsi + 1.0 * f['velocities/r-rad_sec']))   # + rudder -> nose left
        f['fcs/steer-cmd-norm'] = f['fcs/rudder-cmd-norm']
        f['fcs/aileron-cmd-norm'] = max(-1, min(1, -(1.5 * f['attitude/phi-rad'] + 0.4 * f['velocities/p-rad_sec'])))
        if phase == 'roll':
            f['fcs/elevator-cmd-norm'] = 0.0
            if vc >= c['vr']: phase = 'rotate'; P = Pilot(c['theta_rot'], Kv=0.0, Kvi=0.0)
        else:
            if phase == 'rotate': P.hold_theta(f, c['theta_rot'], dt)
            else: P.step(f, c['v50'], dt)
            wow = any(f[f'gear/unit[{i}]/WOW'] for i in range(3))
            if phase == 'rotate' and not wow:
                phase = 'air'; x_lo = f['position/distance-from-start-mag-mt'] - x0; t_lo = t; v_lo = vc
                P.theta0 = f['attitude/theta-deg']; P.Kv, P.Kvi = 0.6, 0.08
        f.run(); t += dt
        if phase == 'air' and f['position/h-agl-ft'] - h_gear >= 50.0:
            x50 = f['position/distance-from-start-mag-mt'] - x0; v50 = f['velocities/vc-kts']; break
    return dict(flap_deg=c['to_flap'], vr_kcas=c['vr'], v50_target_kcas=c['v50'], theta_rot_deg=c['theta_rot'], ground_roll_ft=r(x_lo / FT if x_lo else None, 0),
                over50_ft=r(x50 / FT if x50 else None, 0), t_liftoff_s=r(t_lo, 1), v_liftoff_kcas=r(v_lo, 1), v_50ft_kcas=r(v50, 1),
                note='SL ISA, JSBSim default friction, zero wind, full throttle against brakes then release; pilot model: elevator neutral to VR, pitch to theta_rot, after lift-off speed hold at v50')
TESTS = dict(stall=t_stall, climb=t_climb, glide=t_glide, cruise=t_cruise, static=t_static, takeoff=t_takeoff, preq=t_preq)
if __name__ == '__main__':
    m = sys.argv[1]; tests = sys.argv[2:] or list(TESTS)
    for tname in tests:
        out = load(m); out['jsbsim'] = jsbsim.__version__
        try: out[tname] = TESTS[tname](m)
        except Exception as e: out[tname] = dict(error=repr(e)[:300])
        f = new(m); out['dt_s'] = f.get_delta_t(); out['mtow_lb'] = CASES[m]['w']; save(outpath(m), out)
        print(m, tname, json.dumps(out[tname])[:300], flush=True)
