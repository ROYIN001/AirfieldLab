# lb_pc9m_fg.py - hand-over file for the turboprop topic 07 (gap 14): what the FlightGear PC-9M JSBSim model gives,
# as measured by our scripts, plus the single coefficient constants that the model file marks "DSTO" (facts with file,
# line and commit; DSTO-TR-0479 = [LP26]). Tables are never copied: for a tabulated coefficient only its name and the
# variables it depends on are listed. Inputs: scripts/out/lb_derivs_fg_pc9m.json (lb_derivs.py), lb_perf_fg_pc9m.json
# (lb_perf.py), lb_aero.json (lb_aero.py) and the model XML fetched by lb_fg_fetch.py (outside the repo); optional
# ../07-turboprop-trainers.md for the ratio table vs_topic07 (measured / topic 07 card estimate).
# Usage: python3 -I scripts/lb_pc9m_fg.py   Output: scripts/out/lb_pc9m_fg.json
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lb_jsb import FG_MODELS, xml_path, save, LB
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out')
M = 'fg_pc9m'; src = FG_MODELS[M]
rd = lambda f: json.load(open(os.path.join(OUT, f)))
D = rd('lb_derivs_fg_pc9m.json'); P = rd('lb_perf_fg_pc9m.json'); A = rd('lb_aero.json')[M]
SKIP = {'aero/qbar-psf', 'metrics/Sw-sqft', 'metrics/bw-ft', 'metrics/cbarw-ft', 'aero/function/qbar-induced-psf'}
# symbol of the coefficient a DSTO-marked function multiplies (AC notation; per rad, rates with b/2V)
SYM = {'aero/force/Side_beta': 'CYb', 'aero/force/Side_beta_gear': 'dCYb gear down', 'aero/force/Side_rudder': 'CYdr',
       'aero/force/Side_rudder_speedbrake': 'dCYdr speedbrake', 'aero/force/Delta_Side_rudder_gear': 'dCYdr gear down',
       'aero/moment/Roll_beta': 'Clb', 'aero/moment/Roll_damp': 'Clp', 'aero/moment/Roll_yaw': 'Clr', 'aero/moment/Roll_yaw_gear': 'dClr gear down',
       'aero/moment/Pitch_alpha': 'Cma', 'aero/moment/Pitch_elevator': 'Cmde', 'aero/moment/Yaw_beta': 'Cnb',
       'aero/moment/Delta_Yaw_beta_gear': 'dCnb gear down', 'aero/moment/Delta_Yaw_roll_rate_gear': 'dCnp gear down',
       'aero/moment/Delta_Yaw_roll_rate_speedbrake': 'dCnp speedbrake', 'aero/moment/Yaw_damp': 'Cnr',
       'aero/moment/Delta_Yaw_damp_gear': 'dCnr gear down', 'aero/moment/Yaw_rudder': 'Cndr'}
def dsto_marked():
    """single <value> constants and tables that carry a DSTO comment inside an aero function (header lines skipped)."""
    lines = open(xml_path(M)).read().split('\n'); axis = fn = None; start = 0; vals, tabs = [], []
    for i, l in enumerate(lines, 1):
        m = re.search(r'<axis name="(\w+)"', l)
        if m: axis = m.group(1)
        m = re.search(r'<function name="([^"]+)"', l)
        if m: fn, start = m.group(1), i
        if 'DSTO' not in l or axis is None or fn is None: continue
        end = next(j for j in range(i, len(lines) + 1) if '</function>' in lines[j - 1])
        body = lines[start - 1:end]
        props = [re.sub(r'.*<property>\s*|\s*</property>.*', '', x) for x in body if '<property>' in x]
        iv = [re.sub(r'.*">\s*|\s*</independentVar>.*', '', x) for x in body if 'independentVar' in x]
        rec = dict(function=fn, axis=axis, symbol=SYM.get(fn, '?'), multiplies=[p for p in props if p not in SKIP], xml_line=i)
        mv = re.search(r'<value>\s*([-+0-9.eE]+)\s*</value>', l)
        if mv: vals.append({**rec, 'value': float(mv.group(1))})
        else: tabs.append({**rec, 'table_of': iv, 'value': 'ตาราง (ไม่คัดลอก)'})
    return vals, tabs
def table_rows(fn):
    """rows of the first tableData of an aero function, as lists of floats (comments stripped)."""
    txt = open(xml_path(M)).read(); i = txt.index(f'<function name="{fn}"'); body = txt[i:txt.index('</function>', i)]
    td = re.sub(r'<!--.*?-->', '', body[body.index('<tableData>') + 11:body.index('</tableData>')], flags=re.S)
    return [[float(x) for x in l.split()] for l in td.strip().split('\n') if l.strip()]
def readme():
    """the README table of DSTO-TR-0479 values: {(section, symbol): [flap 0, 23, 50, gear down, delta gear]}."""
    sec, out = None, {}
    for l in open(os.path.join(os.path.dirname(xml_path(M)), 'README')).read().split('\n'):
        if 'for degrees' in l: sec = 'deg'
        if 'for radians' in l: sec = 'rad'
        t = l.split()
        if sec and len(t) == 6 and re.match(r'^[A-Za-z]+$', t[0]): out[(sec, t[0])] = [float(x) for x in t[1:]]
    return out
# README row used to check each DSTO-marked function: (section, symbol, column) for constants; (section, symbol) for tables
CHK_V = {'aero/force/Side_beta_gear': ('rad', 'CYb', 4), 'aero/force/Side_rudder': ('rad', 'CYdr', 0), 'aero/force/Delta_Side_rudder_gear': ('rad', 'CYdr', 4),
         'aero/moment/Roll_beta': ('rad', 'Clb', 0), 'aero/moment/Roll_damp': ('deg', 'Clp', 0), 'aero/moment/Roll_yaw_gear': ('deg', 'Clr', 4),
         'aero/moment/Delta_Yaw_beta_gear': ('rad', 'Cnb', 4), 'aero/moment/Delta_Yaw_roll_rate_gear': ('deg', 'Cnp', 4),
         'aero/moment/Delta_Yaw_damp_gear': ('deg', 'Cnr', 4), 'aero/moment/Yaw_rudder': ('rad', 'Cndr', 0)}
CHK_T = {'aero/force/Side_beta': ('rad', 'CYb'), 'aero/moment/Roll_yaw': ('deg', 'Clr'), 'aero/moment/Pitch_alpha': ('rad', 'Cma'),
         'aero/moment/Pitch_elevator': ('rad', 'Cmde'), 'aero/moment/Yaw_beta': ('rad', 'Cnb'), 'aero/moment/Yaw_damp': ('deg', 'Cnr')}
def readme_check(vals, tabs):
    R = readme(); res = []
    for v in vals:
        c = CHK_V.get(v['function'])
        if not c: res.append(dict(function=v['function'], readme='ไม่มีคอลัมน์นี้ใน README (speedbrake)')); continue
        ref = R[(c[0], c[1])][c[2]]; res.append(dict(function=v['function'], readme_symbol=c[1], match=abs(ref - v['value']) < 5e-5, **({} if abs(ref - v['value']) < 5e-5 else dict(xml=v['value'], readme=ref))))
    for t in tabs:
        c = CHK_T.get(t['function']); rows = table_rows(t['function']); ref = R[c]
        if len(rows[0]) == 2 and len(rows) > 1 and len(rows[1]) == 3:      # 2-D: header (gear 0, 1), rows flap, gear-up value, gear-down value
            pairs = [(r[0], r[1], ref[i]) for i, r in enumerate(rows[1:4])] + [(0.0, rows[1][2], ref[3])]
            pts = ['flap 0', 'flap 23', 'flap 50', 'flap 0 gear down']
        else:
            pairs = [(r[0], r[1], ref[[0.0, 23.0, 50.0].index(r[0])]) for r in rows if r[0] in (0.0, 23.0, 50.0)]
            pts = [f'flap {int(r[0])}' for r in rows if r[0] in (0.0, 23.0, 50.0)]
        bad = [dict(point=pts[i], xml=x, readme=y) for i, (_, x, y) in enumerate(pairs) if abs(x - y) > 5e-5]
        res.append(dict(function=t['function'], readme_symbol=c[1], points_checked=len(pairs), match=not bad, **({'differs': bad} if bad else {})))
    return res
vals, tabs = dsto_marked()
chk = readme_check(vals, tabs)
st = P['stall']; cl = P['climb']; cr = P.get('cruise', [])
out = dict(
    generated_by='lb_pc9m_fg.py', for_topic='07 (turboprop trainers), type id pc9m',
    model=dict(repo=src['repo'], commit=src['commit'], file='PC-9M.xml', licence=src['licence'], jsbsim=D['jsbsim'],
               note='ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง; ไฟล์ XML อยู่นอก repo (lb_fg_fetch.py); ไม่มีตารางหรือข้อความ XML ในไฟล์นี้'),
    mass=dict(lb=D['mass_lb'], kg=D['mass_kg'], basis='มวล acrobatic 2,350 kg ของ PC-9M [LP2]; ถังเชื้อเพลิงและ pointmass ตามที่ lb_jsb.set_mass จัด'),
    engine_in_model=dict(active='PT6A-25 + ใบพัด 3 ใบ (ชุดของ PC-7); ชุด PT6A-62 และ PT6A-68 ถูก comment ออกที่ commit นี้',
                         static_full_throttle=dict(hp=P['static']['hp'], kW=round(P['static']['hp'] * 0.745699872, 1), thrust_lbf=P['static']['thrust_lb'], thrust_N=round(P['static']['thrust_lb'] * 4.4482216)),
                         public_rating='PC-9M PT6A-62 950 shp (708 kW) flat rated [LP2]',
                         defects=['แรงขับสถิต 4,256 lbf (18.9 kN) เกินขีดจำกัด actuator disc ของใบพัด 3 ใบที่ 514 hp (ราว 2,650 lbf) ',
                                  'ประสิทธิภาพใบพัดขณะไต่ T·V/P ≈ 1.8 (เกิน 1 ไม่เป็นไปได้ทางฟิสิกส์) จึงไต่เร็วเกินจริงแม้กำลังต่ำกว่า PC-9M',
                                  'thrust-coefficient ค้างค่าบวกเมื่อใบพัดหยุด 0 rpm ทำให้ Pitch_propwash กดหัวและการร่อนต่ำกว่า ~113 KCAS ใช้ไม่ได้ (ตระกูลเดียวกับ pc7 ของ JSBSim, 03.2.3 ข้อ 5)']),
    derivatives=dict(
        method='lb_derivs.py: central finite differences รอบจุด trim 1 g (CL = W/(q̄S), Cm = 0) ไม่มีกำลัง (term ที่คูณ thrust coefficient ถูกหักออก และ term ที่ใช้ q̄ รวมลมใบพัดปรับเป็น q̄ อิสระ) โมเมนต์รอบ CG ที่โหลด แกนลำตัว; ต่อ rad; อนุพันธ์อัตราใช้ c̄/2V (q, α̇) และ b/2V (p, r); เครื่องหมายแบบ AC (+δe TE ลง, +δa ม้วนขวา, +δr TE ซ้าย)',
        surfaces='δe ต่อ fcs/elevator-pos-rad, δa ต่อ fcs/left-aileron-pos-rad (= ครึ่งหนึ่งของผลต่างซ้ายขวา), δr ต่อ fcs/rudder-pos-rad',
        conditions={k: v for k, v in D['conditions'].items()}),
    dsto_marked_constants=dict(
        note=f'ค่าคงที่เดี่ยวใน PC-9M.xml ที่มี comment "DSTO" ({len(vals)} ค่า) อ้างเป็นข้อเท็จจริงพร้อมเลขบรรทัด; ค่าเหล่านี้เป็น "ส่วนหนึ่ง" ของสัมประสิทธิ์รวม (ค่ารวมที่วัดได้อยู่ใน derivatives); ตารางที่มี comment DSTO ({len(tabs)} ตาราง) ระบุแค่ชื่อและตัวแปร; DSTO-TR-0479 = [LP26]',
        values=vals, tables=tabs,
        readme_check=dict(note='README ของ repo มีตารางที่ผู้สร้างถอดจาก DSTO-TR-0479 (แฟลป 0/23/50, gear down, Δ gear); เทียบอัตโนมัติทีละค่า (ยังไม่ได้เทียบกับรายงานต้นฉบับ เพราะเปิดไฟล์ DTIC ไม่ได้)', results=chk)),
    performance=dict(
        stall_kcas={k: dict(vs=v['vs_kcas'], flap_deg=v['flap_deg'], alpha_deg=v['alpha_at_vs'], CL=v['CL_at_vs'], limit=v['limit']) for k, v in st.items()},
        stall_note='ลด 1 kt/s idle 3,000 ft ISA; แฟลป 0 และ 50 หยุดเพราะ elevator ชนสต็อป −20.05° จึงเป็นขอบล่างของ VS ที่โมเดลบินได้ ไม่ใช่ CLmax; สาธารณะ 77 / 69 KCAS ที่ 2,350 kg [LP2]',
        climb=dict(vy_kcas=cl['vy_kcas'], roc_max_fpm=cl['roc_max_fpm'], roc_max_ms=round(cl['roc_max_fpm'] * 0.00508, 2), public='4,090 fpm (20.8 m/s) [LP12, LP13]'),
        cruise_full_power=[dict(h_ft=c['h_ft'], h_m=round(c['h_ft'] * 0.3048), ktas=c['ktas'], kcas=c['kcas'], hp=c['hp']) for c in cr if c.get('mode') == 'full'],
        cruise_public='276 KTAS ที่ 2,000 ft, 301 KTAS ที่ 20,000 ft [LP12]',
        trimmed=[dict(name=k, kcas=v['kcas'], h_ft=v['h_ft'], ktas=v['ktas'], alpha_deg=v['alpha_trim_deg'], elevator_deg=v['elevator_trim_deg'], flap=v['flap'], gear_down=v['gear_down']) for k, v in D['conditions'].items()],
        glide_best=dict(kcas=P['glide']['best_kcas'], ratio=P['glide']['best_ratio'], note='ใบพัดหยุด 0 rpm ไม่ feather; จุดต่ำกว่า ~113 KCAS ใช้ไม่ได้ (defect ข้อ 3)'),
        takeoff=dict(flap_deg=P['takeoff']['flap_deg'], ground_roll_ft=P['takeoff']['ground_roll_ft'], ground_roll_m=round(P['takeoff']['ground_roll_ft'] * 0.3048), over50_ft=P['takeoff']['over50_ft'], over50_m=round(P['takeoff']['over50_ft'] * 0.3048), note='ขึ้นกับนักบินจำลอง (VR 85 KCAS θ 8°)')),
    aero_static={k: dict(CL0=v['CL0'], CLalpha_per_rad=v['CLalpha_per_rad'], CLmax=v['CLmax'], alpha_CLmax_deg=v['alpha_CLmax_deg'], CDmin=v['CDmin'], Cmalpha_per_rad=v['Cmalpha_per_rad']) for k, v in A.items() if isinstance(v, dict)},
    use='เทียบกับอนุพันธ์ของบัตร pc9m ในหัวข้อ 07 ได้ (โมเดลอ้าง DSTO-TR-0479 เป็นแหล่ง) แต่ห้ามใช้สมรรถนะของโมเดลเป็นเป้า เพราะเครื่องยนต์ในโมเดลเป็น PT6A-25 และใบพัดให้ประสิทธิภาพเกิน 1')
def vs_topic07():
    # gap 14 asks to check topic 07's estimated derivatives against this model: read the pc9m card of 07 (sibling file,
    # if present) and give ratio = measured here / card value for each derivative both have (same AC signs, per rad)
    p = os.path.join(HERE, '..', '07-turboprop-trainers.md')
    if not os.path.exists(p): return None
    card = {}
    for b in re.findall(r'```json\n(.*?)\n```', open(p, encoding='utf-8').read(), re.S):
        try: d = json.loads(b)
        except ValueError: continue
        a = d.get('pc9m', {}).get('aero', {})
        for k, v in a.get('derivatives', {}).items(): card[k] = v['v']
        for k in ('CLalpha', 'Cmalpha'):
            if k in a.get('static_long', {}): card[k] = a['static_long'][k]['v']
    rows = []
    for k, cv in card.items():
        for cond in ('cruise', 'approach'):
            ours = D['conditions'][cond].get(k)
            theirs = cv.get(cond) if isinstance(cv, dict) else cv
            if ours is None or not isinstance(theirs, (int, float)) or theirs == 0: continue
            rows.append(dict(name=k, cond=cond, fg_pc9m=ours, card_07=theirs, ratio=round(ours / theirs, 2)))
    return dict(note='อัตราส่วน = ค่าที่วัดจากโมเดล FlightGear / ค่าประมาณของบัตร pc9m ในหัวข้อ 07 (lm_derivs [LP27]) อ่านจาก 07-turboprop-trainers.md ตอนรันสคริปต์; ทั้งสองเป็นแกนลำตัว ต่อ rad เครื่องหมายแบบ AC; CG ต่างกัน (07: 25 %MAC) จึงเทียบ Cmα ตรง ๆ ไม่ได้',
                rows=rows)
v07 = vs_topic07()
if v07: out['vs_topic07'] = v07
save(os.path.join(OUT, 'lb_pc9m_fg.json'), out)
print(json.dumps({k: out[k] for k in ('mass', 'performance')}, ensure_ascii=False)[:1500])
if v07:
    for r_ in v07['rows']: print('vs07', r_)
print(len(vals), 'DSTO constants,', len(tabs), 'DSTO tables')
for c in chk: print(c)
