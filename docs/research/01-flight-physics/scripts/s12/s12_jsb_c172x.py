# s12_jsb_c172x.py - feasibility check: JSBSim (PyPI wheel) c172x trimmed, then 10 s free run.
# Run with: <venv>/bin/python -I s12_jsb_c172x.py
import time, json, sys, jsbsim, os
ROOT = jsbsim.get_default_root_dir()
out = {'jsbsim_version': jsbsim.__version__, 'root': ROOT}
def case(name, kcas, alt_ft, flap_norm, gamma_deg=0.0, model='c172x', trim_mode=1):
    fdm = jsbsim.FGFDMExec(ROOT); fdm.set_debug_level(0)
    fdm.load_model(model)
    fdm['ic/h-sl-ft'] = alt_ft; fdm['ic/vc-kts'] = kcas; fdm['ic/gamma-deg'] = gamma_deg
    fdm['ic/psi-true-deg'] = 209; fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606
    fdm['fcs/flap-cmd-norm'] = flap_norm; fdm['fcs/mixture-cmd-norm'] = 1
    fdm.run_ic(); fdm['propulsion/set-running'] = -1
    t0 = time.perf_counter(); fdm['simulation/do_simple_trim'] = trim_mode; t_trim = time.perf_counter() - t0
    r = {'model': model, 'kcas': kcas, 'alt_ft': alt_ft, 'flap_cmd_norm': flap_norm, 'gamma_deg': gamma_deg, 'dt_s': fdm.get_delta_t(),
         'trim_wall_ms': round(t_trim*1e3, 1),
         'alpha_deg': fdm['aero/alpha-deg'], 'theta_deg': fdm['attitude/theta-deg'], 'elev_pos_deg': fdm['fcs/elevator-pos-deg'],
         'elev_cmd_norm': fdm['fcs/elevator-cmd-norm'], 'pitch_trim_cmd_norm': fdm['fcs/pitch-trim-cmd-norm'],
         'throttle_norm': fdm['fcs/throttle-pos-norm'], 'rpm': fdm['propulsion/engine/engine-rpm'],
         'flap_pos_deg': fdm['fcs/flap-pos-deg'], 'mass_lb': fdm['inertia/weight-lbs'], 'vc_kts': fdm['velocities/vc-kts']}
    h0 = fdm['position/h-sl-ft']; v0 = fdm['velocities/vc-kts']; th0 = fdm['attitude/theta-deg']
    n = int(round(10.0 / fdm.get_delta_t()))
    t0 = time.perf_counter()
    for _ in range(n): fdm.run()
    wall = time.perf_counter() - t0
    r.update({'steps_10s': n, 'run10s_wall_ms': round(wall*1e3, 2), 'realtime_factor': round(10.0/wall, 1),
              'us_per_step': round(wall/n*1e6, 2),
              'dh_ft_10s': fdm['position/h-sl-ft'] - h0, 'dvc_kt_10s': fdm['velocities/vc-kts'] - v0,
              'dtheta_deg_10s': fdm['attitude/theta-deg'] - th0, 'hdot_fpm_end': fdm['velocities/h-dot-fps']*60,
              'alpha_end_deg': fdm['aero/alpha-deg']})
    out[name] = {k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()}
case('cruise_100kcas_3000ft', 100, 3000, 0.0)
case('approach_65kcas_1000ft_flap30_gs3', 65, 1000, 1.0, -3.0)
print(json.dumps(out, indent=1))
