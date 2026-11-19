# lb_derivs.py - measure the stability and control derivatives of a JSBSim model by finite differences of the aero
# forces and moments it computes (topic 03, code LB; added 2026-11-19 for gap 14 and the turboprop topic 07).
# Usage: python3 -I scripts/lb_derivs.py [model] [mass_lb]   (default fg_pc9m at 5,181 lb = 2,350 kg; FlightGear models
# need lb_fg_fetch.py first). Output: scripts/out/lb_derivs_<model>.json. Only numbers we measure are written: no XML,
# table or constant is copied (the XML stays outside the repo).
# Method: at each condition the static state is set with run_ic (engine not running, no wind), alpha and elevator are
# solved for 1-g level flight (CL = W/(qbar S), Cm = 0), then one input at a time is perturbed (central differences):
# alpha +-0.5 deg, beta +-1 deg, p/q/r +-0.05 rad/s, elevator/aileron/rudder command +-0.05. Coefficients:
# CL = fwz/(qbar S), CD = fwx/(qbar S), CY = fby/(qbar S) (body y, + right), Cl = l/(qbar S b), Cm = m/(qbar S cbar),
# Cn = n/(qbar S b), moments about the loaded CG in body axes. Power-off airframe values (lb_jsb.poweroff_correction):
# terms proportional to the propeller thrust coefficient are subtracted, and functions scaled by a qbar that includes
# the propeller-induced velocity are rescaled to the free-stream qbar (with the engine stopped the induced velocity is 0). Rate derivatives are
# non-dimensional with cbar/2V (q) and b/2V (p, r); control derivatives are per rad of fcs/elevator-pos-rad,
# fcs/left-aileron-pos-rad (= half the differential deflection when the right aileron mirrors it) and fcs/rudder-pos-rad.
# The alpha-dot terms are measured in a short dynamic run: the value of each LIFT/PITCH function that uses
# aero/alphadot-rad_sec divided by qbar S (cbar) ci2vel alphadot. Signs: JSBSim uses the AC signs (T-LB-20, 03.2.2).
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lb_jsb import *
from lb_jsb import _axis_functions
HERE = os.path.dirname(os.path.abspath(__file__))
COND = {   # condition: KCAS, altitude ft, flap (model units), gear down
  'fg_pc9m': {'cruise': (200, 5000, 0, False), 'approach': (95, 1000, 50, True)},
}
def coeffs(f, m, pw):
    q = f['aero/qbar-psf']; S = f['metrics/Sw-sqft']; b = f['metrics/bw-ft']; c = f['metrics/cbarw-ft']
    sub = lambda ax: poweroff_correction(f, m, ax, pw[ax])
    return dict(CL=(f['forces/fwz-aero-lbs'] - sub('LIFT')) / (q * S), CD=(f['forces/fwx-aero-lbs'] - sub('DRAG')) / (q * S),
                CY=(f['forces/fby-aero-lbs'] - sub('SIDE')) / (q * S), Cl=(f['moments/l-aero-lbsft'] - sub('ROLL')) / (q * S * b),
                Cm=(f['moments/m-aero-lbsft'] - sub('PITCH')) / (q * S * c), Cn=(f['moments/n-aero-lbsft'] - sub('YAW')) / (q * S * b))
def ic(f, m, kcas, h, flap, gear, alpha=0.0, beta=0.0, p=0.0, qr=0.0, r=0.0, de=0.0, da=0.0, dr=0.0):
    f['ic/h-sl-ft'] = h; f['ic/vc-kts'] = kcas; f['ic/alpha-deg'] = alpha; f['ic/theta-deg'] = alpha; f['ic/beta-deg'] = beta
    f['ic/p-rad_sec'] = p; f['ic/q-rad_sec'] = qr; f['ic/r-rad_sec'] = r; f['ic/phi-deg'] = 0.0
    f['fcs/elevator-cmd-norm'] = de; f['fcs/aileron-cmd-norm'] = da; f['fcs/rudder-cmd-norm'] = dr; f['fcs/pitch-trim-cmd-norm'] = 0.0
    f.run_ic()
def measure(m, w_lb, cond):
    kcas, h, flap, gear = cond
    f = new(m); set_mass(f, m, w_lb); flap_cmd(f, m, flap); f['gear/gear-cmd-norm'] = 1.0 if gear else 0.0
    f['ic/h-sl-ft'] = h; f['ic/vc-kts'] = kcas; f.run_ic()
    for _ in range(int(15 / f.get_delta_t())): f.run()          # flaps and gear reach their positions
    pw = {ax: propwash_terms(m, ax) for ax in ('LIFT', 'DRAG', 'SIDE', 'ROLL', 'PITCH', 'YAW')}
    W = f['inertia/weight-lbs']
    def ev(**k): ic(f, m, kcas, h, flap, gear, **k); return coeffs(f, m, pw)
    # solve alpha, elevator for CL = CLreq and Cm = 0 (2x2 Newton with finite differences)
    a, de = 3.0, 0.0
    for _ in range(12):
        c0 = ev(alpha=a, de=de); CLreq = W / (f['aero/qbar-psf'] * f['metrics/Sw-sqft'])
        ca = ev(alpha=a + 0.2, de=de); cd = ev(alpha=a, de=de + 0.02)
        J = [[(ca['CL'] - c0['CL']) / 0.2, (cd['CL'] - c0['CL']) / 0.02], [(ca['Cm'] - c0['Cm']) / 0.2, (cd['Cm'] - c0['Cm']) / 0.02]]
        r1, r2 = CLreq - c0['CL'], -c0['Cm']; det = J[0][0] * J[1][1] - J[0][1] * J[1][0]
        da_ = (r1 * J[1][1] - J[0][1] * r2) / det; dde = (J[0][0] * r2 - r1 * J[1][0]) / det
        a += da_; de = max(-1.0, min(1.0, de + dde))
        if abs(da_) < 1e-4 and abs(dde) < 1e-5: break
    base = ev(alpha=a, de=de); el = f['fcs/elevator-pos-rad']; V = f['velocities/vt-fps']
    ci2v = f['metrics/cbarw-ft'] / (2 * V); bi2v = f['metrics/bw-ft'] / (2 * V)
    def cd(key, h_, scale, **k):
        up = ev(**{**dict(alpha=a, de=de), **{key: k[key] + h_}}); dn = ev(**{**dict(alpha=a, de=de), **{key: k[key] - h_}})
        return {x: (up[x] - dn[x]) / (2 * h_ * scale) for x in up}
    d_a = cd('alpha', 0.5, DEG, alpha=a); d_b = cd('beta', 1.0, DEG, beta=0.0)
    d_p = cd('p', 0.05, bi2v, p=0.0); d_q = cd('qr', 0.05, ci2v, qr=0.0); d_r = cd('r', 0.05, bi2v, r=0.0)
    def ctl(key, prop, h_=0.05):
        up_kw, dn_kw = dict(alpha=a, de=de), dict(alpha=a, de=de)
        up_kw[key] = (de if key == 'de' else 0.0) + h_; dn_kw[key] = (de if key == 'de' else 0.0) - h_
        up = ev(**up_kw); pu = f[prop]; dn = ev(**dn_kw); pd = f[prop]
        return {x: (up[x] - dn[x]) / (pu - pd) for x in up}, (pu - pd) / (2 * h_)
    d_de, g_e = ctl('de', 'fcs/elevator-pos-rad'); d_da, g_a = ctl('da', 'fcs/left-aileron-pos-rad'); d_dr, g_r = ctl('dr', 'fcs/rudder-pos-rad')
    # alpha-dot terms from a short dynamic run (elevator doublet), sampled where |alphadot| > 0.05 rad/s
    ic(f, m, kcas, h, flap, gear, alpha=a, de=de); f['propulsion/set-running'] = -1
    adot = lambda ax: [n for n, props in _axis_functions(m, ax) if 'aero/alphadot-rad_sec' in props]
    names_L, names_M = adot('LIFT'), adot('PITCH')
    CLad = Cmad = None; t = 0.0; dt = f.get_delta_t()
    while t < 3.0:
        f['fcs/elevator-cmd-norm'] = de + (0.2 if t < 0.5 else -0.2 if t < 1.0 else 0.0); f.run(); t += dt
        ad = f['aero/alphadot-rad_sec']
        if abs(ad) > 0.05 and CLad is None:
            k = f['aero/qbar-psf'] * f['metrics/Sw-sqft'] * f['aero/ci2vel'] * ad
            CLad = sum(f[n] for n in names_L) / k if names_L else None
            Cmad = sum(f[n] for n in names_M) / (k * f['metrics/cbarw-ft']) if names_M else None
    r = lambda x, n=4: None if x is None else round(x, n)
    return dict(kcas=kcas, h_ft=h, flap=flap, gear_down=gear, w_lb=round(W, 1), cg_x_in=round(f['inertia/cg-x-in'], 2),
                ktas=round(f['velocities/vtrue-kts'], 1), alpha_trim_deg=r(a, 2), elevator_trim_deg=r(el / DEG, 2), CL_trim=r(base['CL']), CD_trim=r(base['CD']),
                CLalpha=r(d_a['CL']), CDalpha=r(d_a['CD']), Cmalpha=r(d_a['Cm']),
                CLq=r(d_q['CL']), Cmq=r(d_q['Cm']), CLadot=r(CLad), Cmadot=r(Cmad),
                CYb=r(d_b['CY']), Clb=r(d_b['Cl']), Cnb=r(d_b['Cn']),
                CYp=r(d_p['CY']), Clp=r(d_p['Cl']), Cnp=r(d_p['Cn']), CYr=r(d_r['CY']), Clr=r(d_r['Cl']), Cnr=r(d_r['Cn']),
                CLde=r(d_de['CL']), Cmde=r(d_de['Cm']), CDde=r(d_de['CD']), Clda=r(d_da['Cl']), Cnda=r(d_da['Cn']),
                CYdr=r(d_dr['CY']), Cldr=r(d_dr['Cl']), Cndr=r(d_dr['Cn']),
                surface_per_cmd_deg=dict(elevator=r(g_e / DEG, 2), aileron_left=r(g_a / DEG, 2), rudder=r(g_r / DEG, 2)),
                propwash_terms=[f'{n} ({k})' for n, k, _ in sum(pw.values(), [])], alphadot_functions=names_L + names_M,
                thrust_coefficient_static=r(f['propulsion/engine[0]/thrust-coefficient']) if f.get_property_manager().hasNode('propulsion/engine[0]/thrust-coefficient') else None)
if __name__ == '__main__':
    m = sys.argv[1] if len(sys.argv) > 1 else 'fg_pc9m'; w = float(sys.argv[2]) if len(sys.argv) > 2 else 5181.0
    out = dict(model=m, jsbsim=jsbsim.__version__, mass_lb=w, mass_kg=round(w * LB, 1),
               note='power-off airframe derivatives measured by finite differences (lb_derivs.py); per rad; rate derivatives with cbar/2V, b/2V')
    if is_fg(m): out['source'] = dict(repo=FG_MODELS[m]['repo'], commit=FG_MODELS[m]['commit'], file=FG_MODELS[m]['xml'] + '.xml', licence=FG_MODELS[m]['licence'])
    out['conditions'] = {k: measure(m, w, c) for k, c in COND[m].items()}
    for k, v in out['conditions'].items(): print(k, json.dumps(v), flush=True)
    save(os.path.join(HERE, 'out', f'lb_derivs_{m}.json'), out)
