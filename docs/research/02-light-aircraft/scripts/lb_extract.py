# lb_extract.py - summarise JSBSim 1.3.3 bundled light-aircraft/trainer models (header, metrics, mass, propulsion,
# FCS ranges, aero function names with their constants and table sizes). Reads the XML installed with the jsbsim
# wheel; writes a numeric summary only (no XML is copied). Run: python3 -I scripts/lb_extract.py
# D7 (2026-11-19): the output out/lb_extract.json holds constants and table shapes read from LGPL/GPL XML, so it is
# NOT in the repo (integration deletes it and adds it to .gitignore). Run this script locally when you need it; no other
# lb_* script needs it any more, and lb_jsb.load_extract() stops with "run lb_extract.py first; the file is not in the
# repo because it holds values read from LGPL/GPL XML" if a helper asks for it while it is absent.
import jsbsim, os, json, re, sys, xml.etree.ElementTree as ET
ROOT = jsbsim.get_default_root_dir()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'lb_extract.json')
# Full table data stay in a scratch file outside the repo (licence: the model XML is GPL or has no licence; we keep only
# shapes and a few key numbers in the repo). Pass a scratch path as argv[1] to get the full dump for local analysis.
FULL = sys.argv[1] if len(sys.argv) > 1 else None
MODELS = ['c172p', 'c172r', 'c172x', 'pa28', 'pc7', 't6texan2']
def txt(e):
    return re.sub(r'\s+', ' ', (e.text or '')).strip() if e is not None else None
def num(e):
    try: return float(txt(e))
    except Exception: return txt(e)
def resolve(path, sub):
    p = os.path.join(ROOT, path)
    return ET.parse(p).getroot()
def summarise_function(fn):
    consts = [float(v.text) for v in fn.iter('value') if v.text and re.match(r'^\s*-?[\d.eE+-]+\s*$', v.text)]
    props = sorted(set(txt(p) for p in fn.iter('property')))
    tables = []
    for t in fn.iter('table'):
        idv = [ (iv.get('lookup') or 'row', txt(iv)) for iv in t.findall('independentVar')]
        data = t.find('tableData')
        rows = [r for r in (data.text or '').strip().split('\n') if r.strip()] if data is not None else []
        tables.append({'vars': idv, 'rows': len(rows), 'data': [[float(x) for x in r.split()] for r in rows]})
    return {'name': fn.get('name'), 'desc': txt(fn.find('description')), 'props': props, 'consts': consts, 'tables': tables}
res = {}
for m in MODELS:
    path = os.path.join(ROOT, 'aircraft', m, m + '.xml'); r = ET.parse(path).getroot()
    fh = r.find('fileheader'); d = {'file': f'aircraft/{m}/{m}.xml', 'fdm_name': r.get('name'), 'release': r.get('release')}
    d['header'] = {k: txt(fh.find(k)) for k in ['author', 'filecreationdate', 'version', 'description']}
    lic = fh.find('license'); d['header']['license'] = lic.get('licenseName') if lic is not None else None
    d['header']['references'] = [dict(x.attrib) for x in fh.findall('reference')]
    d['header']['notes'] = [txt(x) for x in fh.findall('note')]
    met = r.find('metrics'); d['metrics'] = {c.tag + (('_' + c.get('name')) if c.get('name') else ''): (num(c) if c.tag != 'location' else {k.tag: num(k) for k in c}) | ({'unit': c.get('unit')} if c.get('unit') else {}) if c.tag=='location' else {'v': num(c), 'unit': c.get('unit')} for c in met}
    mb = r.find('mass_balance'); d['mass'] = {c.tag: {'v': num(c), 'unit': c.get('unit')} for c in mb if c.tag not in ('location', 'pointmass')}
    d['mass']['cg'] = {k.tag: num(k) for k in mb.find('location')}; d['mass']['negated_crossproduct_inertia'] = mb.get('negated_crossproduct_inertia')
    d['mass']['pointmasses'] = [{'name': p.get('name'), 'lb': num(p.find('weight')), 'loc': {k.tag: num(k) for k in p.find('location')}} for p in mb.findall('pointmass')]
    prop = r.find('propulsion'); d['propulsion'] = []
    if prop is not None:
        for eng in prop.findall('engine'):
            th = eng.find('thruster')
            d['propulsion'].append({'engine_file': eng.get('file'), 'thruster_file': th.get('file') if th is not None else None,
                                    'thruster_loc': {k.tag: num(k) for k in th.find('location')} if th is not None and th.find('location') is not None else None,
                                    'feed': [txt(f) for f in eng.findall('feed')]})
        d['tanks'] = [{'type': t.get('type'), 'capacity': num(t.find('capacity')), 'contents': num(t.find('contents'))} for t in prop.findall('tank')]
    # FCS: flap detents and surface ranges
    d['fcs'] = []
    for comp in r.iter():
        if comp.tag in ('aerosurface_scale', 'kinematic', 'actuator', 'pure_gain'):
            item = {'type': comp.tag, 'name': comp.get('name'), 'output': txt(comp.find('output'))}
            if comp.find('range') is not None: item['range'] = {k.tag: num(k) for k in comp.find('range')}
            if comp.tag == 'kinematic':
                item['traverse'] = [[num(s.find('position')), num(s.find('time'))] for s in comp.find('traverse').findall('setting')]
            if comp.tag == 'actuator':
                item['rate_limit'] = [num(x) for x in comp.findall('rate_limit')]
            d['fcs'].append(item)
    gr = r.find('ground_reactions'); d['contacts'] = []
    for c in gr.findall('contact'):
        g = {'name': c.get('name'), 'type': c.get('type')}
        for k in ['static_friction', 'dynamic_friction', 'rolling_friction', 'spring_coeff', 'damping_coeff', 'max_steer', 'brake_group', 'retractable']:
            e = c.find(k)
            if e is not None: g[k] = {'v': num(e), 'unit': e.get('unit')}
        g['loc'] = {k.tag: num(k) for k in c.find('location')}
        d['contacts'].append(g)
    aero = r.find('aerodynamics'); d['aero'] = {}
    d['aero_aliases'] = [dict(a.attrib) | {'text': txt(a)} for a in aero.findall('alias')] if aero is not None else []
    for ax in aero.findall('axis'):
        d['aero'][ax.get('name')] = [summarise_function(f) for f in ax.findall('function')]
    d['aero_top_functions'] = [summarise_function(f) for f in aero.findall('function')]
    res[m] = d
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if FULL: json.dump(res, open(FULL, 'w'))
for m in res.values():
    for fl in list(m['aero'].values()) + [m['aero_top_functions']]:
        for f in fl:
            for t in f['tables']:
                t['shape'] = [len(t['data']), len(t['data'][0]) if t['data'] else 0]; del t['data']
json.dump(res, open(OUT, 'w'), indent=0, separators=(',', ':'))
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
