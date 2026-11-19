# rev_c172x_fixed.py - s12_jsb_c172x.py with lat/long set BEFORE altitude and speed, so ic/vc-kts holds.
import jsbsim, json, time
ROOT = jsbsim.get_default_root_dir(); out = {}
def case(name, kcas, alt_ft, flap, gamma):
    fdm = jsbsim.FGFDMExec(ROOT); fdm.set_debug_level(0); fdm.load_model('c172x')
    fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606; fdm['ic/psi-true-deg'] = 209
    fdm['ic/h-sl-ft'] = alt_ft; fdm['ic/vc-kts'] = kcas; fdm['ic/gamma-deg'] = gamma
    fdm['fcs/flap-cmd-norm'] = flap; fdm['fcs/mixture-cmd-norm'] = 1
    fdm.run_ic(); fdm['propulsion/set-running'] = -1; fdm['simulation/do_simple_trim'] = 1
    r = dict(vc_kts=fdm['velocities/vc-kts'], alpha_deg=fdm['aero/alpha-deg'], theta_deg=fdm['attitude/theta-deg'],
             elev_pos_deg=fdm['fcs/elevator-pos-deg'], pitch_trim=fdm['fcs/pitch-trim-cmd-norm'], thr=fdm['fcs/throttle-pos-norm'],
             rpm=fdm['propulsion/engine/engine-rpm'], w_lb=fdm['inertia/weight-lbs'], flap_deg=fdm['fcs/flap-pos-deg'])
    h0 = fdm['position/h-sl-ft']
    for _ in range(int(round(10 / fdm.get_delta_t()))): fdm.run()
    r['dh_ft_10s'] = fdm['position/h-sl-ft'] - h0; r['hdot_fpm_end'] = fdm['velocities/h-dot-fps'] * 60
    out[name] = {k: round(v, 4) for k, v in r.items()}
case('cruise_100kcas_3000ft', 100, 3000, 0.0, 0.0)
case('approach_65kcas_1000ft_flap30_gs3', 65, 1000, 1.0, -3.0)
print(json.dumps(out, indent=1))
# extra: gamma/vtrue check for the approach case (why hdot is -345 fpm, not -350)
fdm = jsbsim.FGFDMExec(ROOT); fdm.set_debug_level(0); fdm.load_model('c172x')
fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606; fdm['ic/psi-true-deg'] = 209
fdm['ic/h-sl-ft'] = 1000; fdm['ic/vc-kts'] = 65; fdm['ic/gamma-deg'] = -3; fdm['fcs/flap-cmd-norm'] = 1; fdm['fcs/mixture-cmd-norm'] = 1
fdm.run_ic(); fdm['propulsion/set-running'] = -1; fdm['simulation/do_simple_trim'] = 1
print('approach check vtrue_kt %.3f vg_kt %.3f gamma_deg %.3f hdot_fpm %.1f' % (fdm['velocities/vtrue-kts'], fdm['velocities/vg-fps']/1.68781, fdm['flight-path/gamma-deg'], fdm['velocities/h-dot-fps']*60))
