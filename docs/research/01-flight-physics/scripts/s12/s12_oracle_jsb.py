# s12_oracle_jsb.py - build a JSBSim model of the AirfieldLab trainer from OUR OWN parameters (AC in src/20-flight.js),
# fly the same open-loop doublets as s12_oracle_js.mjs and compare. JSBSim is only executed (LGPL-2.1), no JSBSim data is used.
# Usage: <venv>/bin/python -I s12_oracle_jsb.py oracle_js_noadot.json [dt]
import sys, os, json, math, time, tempfile, jsbsim
js = json.load(open(sys.argv[1])); dt = float(sys.argv[2]) if len(sys.argv) > 2 else 1/240
integ = sys.argv[3] if len(sys.argv) > 3 else 'default'
P, ic = js['params'], js['ic']; f = ic['flaps']; gear = ic['gear']
FT = 0.3048; LBF = 4.4482216152605; DEG = math.pi/180
p = lambda n: f'<property>{n}</property>'
v = lambda x: f'<value>{x!r}</value>'
def prod(*a): return '<product>' + ''.join(a) + '</product>'
def summ(*a): return '<sum>' + ''.join(a) + '</sum>'
def fn(name, body): return f'<function name="{name}">{body}</function>'
a0 = (P['aStall'] + P['aStallFlap']*f)*DEG
# helper functions (non-dimensional), written from the equations in Aircraft.deriv()
hw = f"<max>{v(0.2)}<difference>{prod(p('position/h-sl-ft'), v(FT))}{v(ic['elev_m'] + 0.35)}</difference></max>"
ge = f"<pow>{prod(v(16/P['b']), hw)}{v(2.0)}</pow>"
helpers = [
 fn('aux/phiGE', f"<quotient>{ge}{summ(v(1.0), ge)}</quotient>"),
 fn('aux/e1', f"<exp>{prod(v(-55.0), summ(p('aero/alpha-rad'), v(-a0)))}</exp>"),
 fn('aux/e2', f"<exp>{prod(v(55.0), summ(p('aero/alpha-rad'), v(a0)))}</exp>"),
 fn('aux/sig', f"<quotient>{summ(v(1.0), p('aux/e1'), p('aux/e2'))}{prod(summ(v(1.0), p('aux/e1')), summ(v(1.0), p('aux/e2')))}</quotient>"),
 fn('aux/ph', prod(p('velocities/p-aero-rad_sec'), p('aero/bi2vel'))),
 fn('aux/qh', prod(p('velocities/q-aero-rad_sec'), p('aero/ci2vel'))),
 fn('aux/rh', prod(p('velocities/r-aero-rad_sec'), p('aero/bi2vel'))),
 fn('aux/adh', prod(p('aero/alphadot-rad_sec'), p('aero/ci2vel'))),
 fn('aux/CLlin', summ(v(P['CL0'] + P['CLflap']*f),
     prod(v(P['CLa']), summ(v(1.0), prod(v(0.12), summ(v(1.0), prod(v(-1.0), p('aux/phiGE'))))), p('aero/alpha-rad')),
     prod(v(P['CLq']), p('aux/qh')), prod(v(P['CLadot']), p('aux/adh')), prod(v(P['CLde']), p('fcs/de-rad')))),
 fn('aux/sa', '<sin>' + p('aero/alpha-rad') + '</sin>'), fn('aux/ca', '<cos>' + p('aero/alpha-rad') + '</cos>'),
 fn('aux/CL', summ(prod(summ(v(1.0), prod(v(-1.0), p('aux/sig'))), p('aux/CLlin')),
     prod(p('aux/sig'), v(2.0), '<sign>' + p('aero/alpha-rad') + '</sign>', p('aux/sa'), p('aux/sa'), p('aux/ca')))),
 fn('aux/CDlin', summ(v(P['CD0'] + P['CDflap']*f**1.5 + P['CDgear']*gear),
     prod(v(P['K']), p('aux/phiGE'), f"<pow>{summ(p('aux/CLlin'), v(-0.15))}{v(2.0)}</pow>"),
     prod(v(0.25), p('aero/beta-rad'), p('aero/beta-rad')))),
 fn('aux/CD', summ(prod(summ(v(1.0), prod(v(-1.0), p('aux/sig'))), p('aux/CDlin')),
     prod(p('aux/sig'), summ(v(P['CD0']), prod(v(1.6), p('aux/sa'), p('aux/sa')))))),
 fn('aux/CY', summ(prod(v(P['CYb']), p('aero/beta-rad')), prod(v(P['CYdr']), p('fcs/dr-rad')), prod(v(P['CYr']), p('aux/rh')))),
 fn('aux/Cl', summ(prod(v(P['Clb']), p('aero/beta-rad')), prod(v(P['Clp']), p('aux/ph')), prod(v(P['Clr']), p('aux/rh')),
     prod(v(P['Clda']), p('fcs/da-rad')), prod(v(P['Cldr']), p('fcs/dr-rad')))),
 fn('aux/Cm', summ(v(P['Cm0'] + P['Cmflap']*f), prod(v(P['Cma']), p('aero/alpha-rad')), prod(v(P['Cmq']), p('aux/qh')),
     prod(v(P['Cmadot']), p('aux/adh')), prod(v(P['Cmde']), p('fcs/de-rad')),
     prod(v(-0.06), summ(v(1.0), prod(v(-1.0), p('aux/phiGE')))),
     prod(v(-0.25), p('aux/sig'), f"<max>{v(0.0)}{summ(p('aero/alpha-rad'), v(-a0))}</max>"))),
 fn('aux/Cn', summ(prod(v(P['Cnb']), p('aero/beta-rad')), prod(v(P['Cnp']), p('aux/ph')), prod(v(P['Cnr']), p('aux/rh')),
     prod(v(P['Cnda']), p('fcs/da-rad')), prod(v(P['Cndr']), p('fcs/dr-rad')))),
]
qS = (p('aero/qbar-psf'), p('metrics/Sw-sqft'))
cb = '<cos>' + p('aero/beta-rad') + '</cos>'; sb = '<sin>' + p('aero/beta-rad') + '</sin>'
X = fn('aero/force/X', prod(*qS, summ(prod(p('aux/CL'), p('aux/sa')), prod(v(-1.0), p('aux/CD'), p('aux/ca'), cb))))
Y = fn('aero/force/Y', prod(*qS, summ(prod(v(-1.0), p('aux/CD'), sb), p('aux/CY'))))
Z = fn('aero/force/Z', prod(*qS, summ(prod(v(-1.0), p('aux/CL'), p('aux/ca')), prod(v(-1.0), p('aux/CD'), p('aux/sa'), cb))))
L = fn('aero/moment/L', prod(*qS, p('metrics/bw-ft'), p('aux/Cl')))
Mm = fn('aero/moment/M', prod(*qS, p('metrics/cbarw-ft'), p('aux/Cm')))
N = fn('aero/moment/N', prod(*qS, p('metrics/bw-ft'), p('aux/Cn')))
Vc = P['eta']*P['P']/P['T0']
Vm = prod(p('velocities/vt-fps'), v(FT))
thrust = fn('aux/thrust-lbs', prod(p('fcs/thr'), v(P['T0']*Vc/LBF), f"<pow>{summ(prod(Vm, Vm), v(Vc*Vc))}{v(-0.5)}</pow>"))
R = 6378137.0*1000/FT   # 1000x Earth radius, non-rotating: flat-earth-like, like the JS model
xml = f'''<?xml version="1.0"?>
<fdm_config name="airfieldlab_trainer_oracle" version="2.0" release="ALPHA">
 <fileheader><author>AirfieldLab (generated from src/20-flight.js AC)</author><description>EOM cross-check model</description></fileheader>
 <planet name="flat-ish"><semimajor_axis unit="FT">{R!r}</semimajor_axis><semiminor_axis unit="FT">{R!r}</semiminor_axis>
  <rotation_rate unit="RAD/SEC">0</rotation_rate><GM unit="FT3/SEC2">{9.80665/FT*R*R!r}</GM><J2>0</J2></planet>
 <metrics><wingarea unit="M2">{P['S']}</wingarea><wingspan unit="M">{P['b']}</wingspan><chord unit="M">{P['c']}</chord>
  <htailarea unit="M2">0</htailarea><htailarm unit="M">0</htailarm><vtailarea unit="M2">0</vtailarea><vtailarm unit="M">0</vtailarm>
  <location name="AERORP" unit="M"><x>0</x><y>0</y><z>0</z></location>
  <location name="EYEPOINT" unit="M"><x>0</x><y>0</y><z>0</z></location>
  <location name="VRP" unit="M"><x>0</x><y>0</y><z>0</z></location></metrics>
 <mass_balance negated_crossproduct_inertia="false"><ixx unit="KG*M2">{P['Ixx']}</ixx><iyy unit="KG*M2">{P['Iyy']}</iyy><izz unit="KG*M2">{P['Izz']}</izz>
  <ixy unit="KG*M2">0</ixy><ixz unit="KG*M2">{P['Ixz']}</ixz><iyz unit="KG*M2">0</iyz><emptywt unit="KG">{P['m']}</emptywt>
  <location name="CG" unit="M"><x>0</x><y>0</y><z>0</z></location></mass_balance>
 <ground_reactions/>
 <external_reactions><force name="thrust" frame="BODY">{thrust.replace('aux/thrust-lbs','external_reactions/thrust/fn')}
  <location unit="M"><x>0</x><y>0</y><z>0</z></location><direction><x>1</x><y>0</y><z>0</z></direction></force></external_reactions>
 <flight_control name="fcs"><property value="0">fcs/de-rad</property><property value="0">fcs/da-rad</property>
  <property value="0">fcs/dr-rad</property><property value="0">fcs/thr</property></flight_control>
 <aerodynamics>
  {''.join(helpers)}
  <axis name="X">{X}</axis><axis name="Y">{Y}</axis><axis name="Z">{Z}</axis>
  <axis name="ROLL">{L}</axis><axis name="PITCH">{Mm}</axis><axis name="YAW">{N}</axis>
 </aerodynamics>
</fdm_config>'''
root = tempfile.mkdtemp(prefix='s12jsb_'); os.makedirs(f'{root}/aircraft/afl', exist_ok=True)
open(f'{root}/aircraft/afl/afl.xml', 'w').write(xml)
fdm = jsbsim.FGFDMExec(root); fdm.set_debug_level(0); fdm.set_dt(dt)
fdm.load_model('afl')
if integ != 'default':   # e.g. 'ab3' -> higher-order integrators for every state
    for k in ['rate/rotational', 'rate/translational', 'position/rotational', 'position/translational']:
        fdm[f'simulation/integrator/{k}'] = {'ab3': 4, 'trap': 2}[integ]
fdm['simulation/gravity-model'] = 0
fdm['ic/lat-geod-deg'] = 13.914; fdm['ic/long-gc-deg'] = 100.606; fdm['ic/terrain-elevation-ft'] = ic['elev_m']/FT
fdm['ic/h-sl-ft'] = (ic['elev_m'] + ic['h_m'])/FT
fdm['ic/u-fps'] = ic['u']/FT; fdm['ic/v-fps'] = ic['v']/FT; fdm['ic/w-fps'] = ic['w']/FT
fdm['ic/phi-rad'] = ic['phi']; fdm['ic/theta-rad'] = ic['theta']; fdm['ic/psi-true-rad'] = ic['psi'] % (2*math.pi)
fdm['ic/p-rad_sec'] = 0; fdm['ic/q-rad_sec'] = 0; fdm['ic/r-rad_sec'] = 0
fdm['fcs/de-rad'] = ic['de0']; fdm['fcs/thr'] = ic['thr0']
fdm.run_ic()
def sched(t):
    de = ic['de0'] + (2 if 1 <= t < 2 else -2 if 2 <= t < 3 else 0)*DEG
    da = (5 if 8 <= t < 9 else -5 if 9 <= t < 10 else 0)*DEG
    dr = (5 if 14 <= t < 15 else 0)*DEG
    return de, da, dr
T = 25.0; n = round(T/dt); every = round(0.1/dt); rows = []
t0 = time.perf_counter()
for i in range(n + 1):
    t = i*dt
    if i % every == 0:
        rows.append([round(t, 4), fdm['position/h-sl-ft']*FT - ic['elev_m'], fdm['velocities/vt-fps']*FT, fdm['aero/alpha-deg'], fdm['aero/beta-deg'],
                     fdm['attitude/phi-deg'], fdm['attitude/theta-deg'], fdm['attitude/psi-deg'],
                     fdm['velocities/p-rad_sec']/DEG, fdm['velocities/q-rad_sec']/DEG, fdm['velocities/r-rad_sec']/DEG])
    if i == n: break
    de, da, dr = sched(t); fdm['fcs/de-rad'] = de; fdm['fcs/da-rad'] = da; fdm['fcs/dr-rad'] = dr
    fdm.run()
wall = time.perf_counter() - t0
cols = js['cols']; jr = js['rows']
err = {}
for k in range(1, len(cols)):
    e = 0.0
    for a, b in zip(jr, rows):
        d = a[k] - b[k]
        if cols[k] == 'psi_deg': d = (d + 180) % 360 - 180
        e = max(e, abs(d))
    err[cols[k]] = round(e, 5)
pick = lambda r, ks: {c: round(r[cols.index(c)], 3) for c in ks}
ks = ['h_m', 'V_mps', 'alpha_deg', 'theta_deg', 'phi_deg', 'beta_deg', 'psi_deg']
out = {'jsbsim': jsbsim.__version__, 'case': js['mode'], 'dt': dt, 'integrators': integ, 'maxAbsErr': err,
       'js_t25': pick(jr[-1], ks), 'jsb_t25': pick(rows[-1], ks),
       'js_t3': pick(jr[30], ks), 'jsb_t3': pick(rows[30], ks), 'wall_ms': round(wall*1e3, 1), 'us_per_step': round(wall/n*1e6, 2)}
print(json.dumps(out))
json.dump({'out': out, 'rows': rows}, open(sys.argv[1].replace('oracle_js_', 'oracle_jsb_').replace('.json', f'_{round(1/dt)}hz_{integ}.json'), 'w'))
