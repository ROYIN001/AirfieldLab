# rev_c172x_vc.py - why does the s12 c172x cruise case report vc 104.5 kt after setting ic/vc-kts=100? Check IC ordering.
import jsbsim
ROOT = jsbsim.get_default_root_dir()
def run(order):
    fdm = jsbsim.FGFDMExec(ROOT); fdm.set_debug_level(0); fdm.load_model('c172x')
    if order == 'latlon_first':
        fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606
    fdm['ic/h-sl-ft'] = 3000; fdm['ic/vc-kts'] = 100; fdm['ic/gamma-deg'] = 0; fdm['ic/psi-true-deg'] = 209
    if order == 'script':
        fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606
    fdm['fcs/mixture-cmd-norm'] = 1
    fdm.run_ic(); vc_ic = fdm['velocities/vc-kts']; h_ic = fdm['position/h-sl-ft']
    fdm['propulsion/set-running'] = -1; fdm['simulation/do_simple_trim'] = 1
    print(order, 'after run_ic vc %.2f h %.1f | after trim vc %.2f alpha %.3f elev %.3f thr %.4f' % (vc_ic, h_ic, fdm['velocities/vc-kts'], fdm['aero/alpha-deg'], fdm['fcs/elevator-pos-deg'], fdm['fcs/throttle-pos-norm']))
for o in ['script', 'latlon_first']: run(o)
