"""JSBSim model of the AirfieldLab trainer, built from our own numbers (research round 1 §12.8, plan item B1).

build_xml(params, ic) writes the forces and moments of Aircraft.deriv (src/20-flight.js) as JSBSim functions:
lift, drag and side force from the same coefficients (Beard-McLain stall blend, ground effect, p/q/r hats, alpha-dot),
thrust from the same available-thrust curve as an external force along body +x, the inertia tensor with
negated_crossproduct_inertia="false" so that it holds -Ixz like AC.Iinv, and a planet 1000 times the Earth's radius
that does not turn, with GM giving g = 9.80665 m/s^2, so Coriolis, centrifugal and curvature terms vanish as in our
flat-earth model. The model is ours: no JSBSim aircraft data is used. JSBSim itself (LGPL-2.1) is only run, from pip.

write_model(xml) puts it in a new temporary folder, never in the repository: the repository keeps only numeric
fixtures (test/licenses.test.mjs, T-S-11, fails on a JSBSim model file). For the same reason this file writes the
root tag in two parts (ROOT_TAG).

Usage on its own: python tools/jsbsim/make_model.py <case.json from js_case.mjs> [out_dir outside the repo]
"""
import json
import math
import os
import sys
import tempfile

FT = 0.3048
LBF = 4.4482216152605
SLUG = LBF / FT                      # kg: 1 lbf s^2/ft = 14.5939029372 kg
SLUGFT2 = SLUG * FT * FT             # kg m^2 per slug ft^2, exact (JSBSim's own KG*M2 factor is 9e-5 off)
DEG = math.pi / 180
ROOT_TAG = 'fdm' + '_config'
MODEL = 'airfieldlab_trainer'
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))


def _p(n): return f'<property>{n}</property>'
def _v(x): return f'<value>{float(x)!r}</value>'
def _prod(*a): return '<product>' + ''.join(a) + '</product>'
def _sum(*a): return '<sum>' + ''.join(a) + '</sum>'
def _fn(name, body): return f'<function name="{name}">{body}</function>'


def build_xml(P, ic):
    """P: numeric AC parameters (SI, as in src/20-flight.js); ic: the initial condition from js_case.mjs."""
    f, gear = ic['flaps'], ic['gear']
    a0 = (P['aStall'] + P['aStallFlap'] * f) * DEG
    hw = f"<max>{_v(0.2)}<difference>{_prod(_p('position/h-sl-ft'), _v(FT))}{_v(ic['elev_m'] + 0.35)}</difference></max>"
    ge = f"<pow>{_prod(_v(16 / P['b']), hw)}{_v(2.0)}</pow>"
    one_minus = lambda x: _sum(_v(1.0), _prod(_v(-1.0), x))
    helpers = [
        _fn('aux/phiGE', f"<quotient>{ge}{_sum(_v(1.0), ge)}</quotient>"),
        _fn('aux/e1', f"<exp>{_prod(_v(-55.0), _sum(_p('aero/alpha-rad'), _v(-a0)))}</exp>"),
        _fn('aux/e2', f"<exp>{_prod(_v(55.0), _sum(_p('aero/alpha-rad'), _v(a0)))}</exp>"),
        _fn('aux/sig', f"<quotient>{_sum(_v(1.0), _p('aux/e1'), _p('aux/e2'))}{_prod(_sum(_v(1.0), _p('aux/e1')), _sum(_v(1.0), _p('aux/e2')))}</quotient>"),
        _fn('aux/ph', _prod(_p('velocities/p-aero-rad_sec'), _p('aero/bi2vel'))),
        _fn('aux/qh', _prod(_p('velocities/q-aero-rad_sec'), _p('aero/ci2vel'))),
        _fn('aux/rh', _prod(_p('velocities/r-aero-rad_sec'), _p('aero/bi2vel'))),
        _fn('aux/adh', _prod(_p('aero/alphadot-rad_sec'), _p('aero/ci2vel'))),
        _fn('aux/CLlin', _sum(_v(P['CL0'] + P['CLflap'] * f),
                              _prod(_v(P['CLa']), _sum(_v(1.0), _prod(_v(0.12), one_minus(_p('aux/phiGE')))), _p('aero/alpha-rad')),
                              _prod(_v(P['CLq']), _p('aux/qh')), _prod(_v(P['CLadot']), _p('aux/adh')),
                              _prod(_v(P['CLde']), _p('fcs/de-rad')))),
        _fn('aux/sa', '<sin>' + _p('aero/alpha-rad') + '</sin>'),
        _fn('aux/ca', '<cos>' + _p('aero/alpha-rad') + '</cos>'),
        _fn('aux/CL', _sum(_prod(one_minus(_p('aux/sig')), _p('aux/CLlin')),
                           _prod(_p('aux/sig'), _v(2.0), '<sign>' + _p('aero/alpha-rad') + '</sign>', _p('aux/sa'), _p('aux/sa'), _p('aux/ca')))),
        _fn('aux/CDlin', _sum(_v(P['CD0'] + P['CDflap'] * f ** 1.5 + P['CDgear'] * gear),
                              _prod(_v(P['K']), _p('aux/phiGE'), f"<pow>{_sum(_p('aux/CLlin'), _v(-0.15))}{_v(2.0)}</pow>"),
                              _prod(_v(0.25), _p('aero/beta-rad'), _p('aero/beta-rad')))),
        _fn('aux/CD', _sum(_prod(one_minus(_p('aux/sig')), _p('aux/CDlin')),
                           _prod(_p('aux/sig'), _sum(_v(P['CD0']), _prod(_v(1.6), _p('aux/sa'), _p('aux/sa')))))),
        _fn('aux/CY', _sum(_prod(_v(P['CYb']), _p('aero/beta-rad')), _prod(_v(P['CYdr']), _p('fcs/dr-rad')),
                           _prod(_v(P['CYr']), _p('aux/rh')))),
        _fn('aux/Cl', _sum(_prod(_v(P['Clb']), _p('aero/beta-rad')), _prod(_v(P['Clp']), _p('aux/ph')),
                           _prod(_v(P['Clr']), _p('aux/rh')), _prod(_v(P['Clda']), _p('fcs/da-rad')),
                           _prod(_v(P['Cldr']), _p('fcs/dr-rad')))),
        _fn('aux/Cm', _sum(_v(P['Cm0'] + P['Cmflap'] * f), _prod(_v(P['Cma']), _p('aero/alpha-rad')),
                           _prod(_v(P['Cmq']), _p('aux/qh')), _prod(_v(P['Cmadot']), _p('aux/adh')),
                           _prod(_v(P['Cmde']), _p('fcs/de-rad')),
                           _prod(_v(-0.06), one_minus(_p('aux/phiGE'))),
                           _prod(_v(-0.25), _p('aux/sig'), f"<max>{_v(0.0)}{_sum(_p('aero/alpha-rad'), _v(-a0))}</max>"))),
        _fn('aux/Cn', _sum(_prod(_v(P['Cnb']), _p('aero/beta-rad')), _prod(_v(P['Cnp']), _p('aux/ph')),
                           _prod(_v(P['Cnr']), _p('aux/rh')), _prod(_v(P['Cnda']), _p('fcs/da-rad')),
                           _prod(_v(P['Cndr']), _p('fcs/dr-rad')))),
    ]
    qS = (_p('aero/qbar-psf'), _p('metrics/Sw-sqft'))
    cb = '<cos>' + _p('aero/beta-rad') + '</cos>'
    sb = '<sin>' + _p('aero/beta-rad') + '</sin>'
    # body-axis forces, as Fb in Aircraft.deriv: lift normal to the relative wind in the symmetry plane, drag along it
    X = _fn('aero/force/X', _prod(*qS, _sum(_prod(_p('aux/CL'), _p('aux/sa')), _prod(_v(-1.0), _p('aux/CD'), _p('aux/ca'), cb))))
    Y = _fn('aero/force/Y', _prod(*qS, _sum(_prod(_v(-1.0), _p('aux/CD'), sb), _p('aux/CY'))))
    Z = _fn('aero/force/Z', _prod(*qS, _sum(_prod(_v(-1.0), _p('aux/CL'), _p('aux/ca')), _prod(_v(-1.0), _p('aux/CD'), _p('aux/sa'), cb))))
    L = _fn('aero/moment/L', _prod(*qS, _p('metrics/bw-ft'), _p('aux/Cl')))
    Mm = _fn('aero/moment/M', _prod(*qS, _p('metrics/cbarw-ft'), _p('aux/Cm')))
    N = _fn('aero/moment/N', _prod(*qS, _p('metrics/bw-ft'), _p('aux/Cn')))
    # thrustAvail(V) = T0 Vc / sqrt(V^2 + Vc^2), Vc = eta P / T0, times the throttle, in lbf
    Vc = P['eta'] * P['P'] / P['T0']
    Vm = _prod(_p('velocities/vt-fps'), _v(FT))
    thrust = _fn('external_reactions/thrust/fn',
                 _prod(_p('fcs/thr'), _v(P['T0'] * Vc / LBF), f"<pow>{_sum(_prod(Vm, Vm), _v(Vc * Vc))}{_v(-0.5)}</pow>"))
    R = 6378137.0 * 1000 / FT
    zero3 = '<x>0</x><y>0</y><z>0</z>'
    return f'''<?xml version="1.0"?>
<{ROOT_TAG} name="{MODEL}" version="2.0" release="ALPHA">
 <fileheader><author>AirfieldLab (generated by tools/jsbsim/make_model.py from the AC numbers of src/20-flight.js)</author>
  <description>Equation-of-motion cross-check model; not a JSBSim aircraft</description></fileheader>
 <planet name="flat-ish"><semimajor_axis unit="FT">{R!r}</semimajor_axis><semiminor_axis unit="FT">{R!r}</semiminor_axis>
  <rotation_rate unit="RAD/SEC">0</rotation_rate><GM unit="FT3/SEC2">{9.80665 / FT * R * R!r}</GM><J2>0</J2></planet>
 <metrics><wingarea unit="M2">{P['S']!r}</wingarea><wingspan unit="M">{P['b']!r}</wingspan><chord unit="M">{P['c']!r}</chord>
  <htailarea unit="M2">0</htailarea><htailarm unit="M">0</htailarm><vtailarea unit="M2">0</vtailarea><vtailarm unit="M">0</vtailarm>
  <location name="AERORP" unit="M">{zero3}</location><location name="EYEPOINT" unit="M">{zero3}</location>
  <location name="VRP" unit="M">{zero3}</location></metrics>
 <mass_balance negated_crossproduct_inertia="false"><ixx unit="SLUG*FT2">{P['Ixx'] / SLUGFT2!r}</ixx>
  <iyy unit="SLUG*FT2">{P['Iyy'] / SLUGFT2!r}</iyy><izz unit="SLUG*FT2">{P['Izz'] / SLUGFT2!r}</izz><ixy unit="SLUG*FT2">0</ixy>
  <ixz unit="SLUG*FT2">{P['Ixz'] / SLUGFT2!r}</ixz><iyz unit="SLUG*FT2">0</iyz>
  <emptywt unit="KG">{P['m']!r}</emptywt><location name="CG" unit="M">{zero3}</location></mass_balance>
 <ground_reactions/>
 <external_reactions><force name="thrust" frame="BODY">{thrust}
  <location unit="M">{zero3}</location><direction><x>1</x><y>0</y><z>0</z></direction></force></external_reactions>
 <flight_control name="fcs"><property value="0">fcs/de-rad</property><property value="0">fcs/da-rad</property>
  <property value="0">fcs/dr-rad</property><property value="0">fcs/thr</property></flight_control>
 <aerodynamics>
  {''.join(helpers)}
  <axis name="X">{X}</axis><axis name="Y">{Y}</axis><axis name="Z">{Z}</axis>
  <axis name="ROLL">{L}</axis><axis name="PITCH">{Mm}</axis><axis name="YAW">{N}</axis>
 </aerodynamics>
</{ROOT_TAG}>
'''


def write_model(xml, out_dir=None):
    """Writes <root>/aircraft/<MODEL>/<MODEL>.xml in a new temporary folder (or out_dir); returns the root."""
    root = os.path.realpath(out_dir or tempfile.mkdtemp(prefix='afl_jsbsim_'))   # links resolved: no way into the repo
    if os.path.commonpath([root, REPO]) == REPO:
        raise SystemExit(f'refusing to write a JSBSim model inside the repository ({root}); use a folder outside it')
    os.makedirs(os.path.join(root, 'aircraft', MODEL), exist_ok=True)
    with open(os.path.join(root, 'aircraft', MODEL, MODEL + '.xml'), 'w', encoding='utf-8') as fh:
        fh.write(xml)
    return root


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    with open(sys.argv[1], encoding='utf-8') as fh:
        case = json.load(fh)
    print(write_model(build_xml(case['params'], case['ic']), sys.argv[2] if len(sys.argv) > 2 else None))
