# v10_jsb_c172.py - linear modes of the open JSBSim c172x model (LGPL-2.1) for comparison
import sys; sys.path.insert(0, 'docs/research/01-flight-physics/pyjsb')
import jsbsim, numpy as np
print([x for x in dir(jsbsim) if 'inear' in x or 'Lin' in x])
ROOT = 'docs/research/01-flight-physics/jsbroot'
def run(model, kcas, alt_ft, flaps_deg):
    fdm = jsbsim.FGFDMExec(ROOT); fdm.set_debug_level(0)
    fdm.load_model(model)
    fdm['ic/h-sl-ft'] = alt_ft; fdm['ic/vc-kts'] = kcas; fdm['ic/gamma-deg'] = 0; fdm['ic/psi-true-deg'] = 0
    fdm['fcs/flap-cmd-norm'] = flaps_deg/30.0 if model=='c172x' else flaps_deg
    fdm['gear/gear-cmd-norm'] = 1 if (model!='737' or flaps_deg>0.5) else 0
    fdm.run_ic()
    fdm['propulsion/set-running'] = -1; fdm['fcs/mixture-cmd-norm'] = 1
    for _ in range(50 if model=='c172x' else 4000): fdm.run()
    fdm['simulation/do_simple_trim'] = 1
    lin = jsbsim.FGLinearization(fdm)
    A = np.array(lin.system_matrix); names = [n for n in dir(lin) if not n.startswith('_')] if False else getattr(lin,'x_names',None) or getattr(lin,'states',None)
    ev, V = np.linalg.eig(A)
    scd = {'Vt':1/50,'Rpm0':1/2000,'Latitude':0,'Longitude':0,'Alt':0,'Psi':0}; sc = np.array([scd.get(n,1) for n in names])
    print(f'\n{model} {kcas} KCAS {alt_ft} ft flaps {flaps_deg}: alpha {fdm["aero/alpha-deg"]:.2f} deg, states {names}')
    for k in sorted(range(len(ev)), key=lambda i: -abs(ev[i])):
        l = ev[k]; vec = np.abs(V[:,k])*sc; dom = ','.join(names[i] for i in np.argsort(-vec)[:2])
        if abs(l) < 1e-4 or l.imag < -1e-9: continue
        wn = abs(l); z = -l.real/wn
        s = f'  lambda {l.real:+.4f}{l.imag:+.4f}j  wn {wn:.3f} zeta {z:.3f}'
        if abs(l.imag) > 1e-9: s += f'  T {2*np.pi/l.imag:.2f} s'
        else: s += f'  tau {-1/l.real:.2f} s'
        print(s, ' dominant:', dom)
for args in [('c172x', 100, 3000, 0), ('c172x', 65, 1000, 30), ('737', 140, 1500, 1.0), ('737', 280, 25000, 0)]:
    try: run(*args)
    except Exception as e: print('ERR', args, e)
