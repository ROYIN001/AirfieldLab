// lc_json.mjs — builds the c172s JSON blocks of 04-c172s.md (topic 04, code LC) from POH/TCDS inputs (lc_calc.mjs),
// LM estimation tools and, where no type data exists, round-1 trainer values labelled est.
// Run from the repo root:  node <this folder>/lc_json.mjs   → rewrites the block between LC_JSON markers in ../04-c172s.md
//                                                            and writes scripts/out/lc_json.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compute, POH } from './lc_calc.mjs';
import { estimate } from './lm_derivs.mjs';
import { PROPS } from './lm_prop.mjs';
import { G0, RHO0, KT, FT, HP, LB } from './lm_polar.mjs';
import { isMainModule } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOPIC = path.join(HERE, '..', '04-c172s.md');
const IN = 0.0254, DEG = Math.PI / 180;
const r = (x, d = 4) => (typeof x === 'number' ? +x.toFixed(d) : x);
const C = compute();

// round-1 trainer parameters (defaults for leaves with no type-specific data; always est + note)
const R1P = [new URL('../../01-flight-physics/params-trainer.json', import.meta.url).pathname, path.join(HERE, '..', '..', '..', 'round1', 'assembled', '01-flight-physics', 'params-trainer.json')]
  .find(p => fs.existsSync(p));
const R1 = R1P ? JSON.parse(fs.readFileSync(R1P, 'utf8')) : {};
const r1v = p => p.split('.').reduce((a, k) => (a ? a[k] : undefined), R1)?.v;

// legacy fit result (written by: node lm_legacy_fit.mjs c172s --json > out/lc_legacy.json); optional on the first pass
const LEGP = path.join(HERE, 'out', 'lc_legacy.json');
const LEG = fs.existsSync(LEGP) ? JSON.parse(fs.readFileSync(LEGP, 'utf8')) : null;

const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const H = 'สูง', M = 'กลาง', LO = 'ต่ำ';

export function build() {
  const g = C.geom, m = g.MTOW_kg, S = g.S_m2, b = g.b_m, c = g.MAC_m;
  const xref = C.cg.ref_in;                       // reference CG 42.0 in aft of datum (27.4 % MAC)
  const fx = inDat => r((xref - inDat) * IN, 3);  // datum station (in) → FRD x (m, + forward of reference CG)
  // ── geometry used by lm_derivs (tail from NASA TM-80163 Table I via lm_derivs VALIDATION; rest est) ──
  const geo = { S, b, c, taper: 0.70, sweep_c4_deg: 0, dihedral_deg: 1.73, wingPos: 'high', z_w: null,
    fus: { L: POH.length_m, W: 1.0, H: 1.35, x_c4_root: 2.12 },
    tail: { S_h: 3.35, b_h: 3.45, l_h: 4.36, S_v: 1.04, b_v: 2.03, l_v: 4.36, z_v: 1.0, h_h: null },
    surf: { elevator: { chord_ratio: 0.42, span_fraction: 0.95 }, aileron: { chord_ratio: 0.25, eta_in: 0.55, eta_out: 0.97 }, rudder: { chord_ratio: 0.42, span_fraction: 0.9 } },
    cg_frac: C.cg.ref_pctMAC / 100 };
  const W = m * G0, q = v => 0.5 * RHO0 * (v * KT) ** 2;
  const CLcr = W / (q(110) * S), CLap = W / (q(67) * S);
  const ecr = estimate(geo, { CL: CLcr, M: 110 * KT / 340.3, alpha: 1.4 * DEG, CD0: C.cleanPolar.CD0 });
  const eap = estimate(geo, { CL: CLap, M: 67 * KT / 340.3, alpha: 5 * DEG, CD0: C.glide.CD0 });
  const E = { cruise: ecr.body, approach: eap.body };
  const est2 = k => ({ cruise: r(E.cruise[k], 4), approach: r(E.approach[k], 4) });

  // ── flight-test derivatives, NASA TM-80163 (C172-class), CG 28.8 % MAC; Cmalpha moved to the reference CG ──
  const TM = { CLalpha: 5.17, Cmalpha: -0.87, Cmq: -14.85, CLde: 0.42, Cmde: -1.23, CYb: -0.57, Clb: -0.070, Cnb: 0.042, Clp: -0.45, Cnr: -0.11, Cndr: -0.058, Clda: 0.204 };
  const CmaRef = TM.Cmalpha - TM.CLalpha * (0.288 - C.cg.ref_pctMAC / 100);
  const CL0 = 0.25;
  // Cm0 from an assumed cruise trim elevator of −2° (TEU) at 110 KCAS, MTOW, reference CG (est)
  const de_cr = -2 * DEG, a_cr = (CLcr - CL0 - TM.CLde * de_cr) / TM.CLalpha;
  const Cm0 = r(-(CmaRef * a_cr) - TM.Cmde * de_cr, 4);
  // flaps: dCL0 = POH dCLmax at forward CG (no stall-alpha shift, est); dCD0, dCm0 from JSBSim c172r sweep (03-open-models lb_aero, est)
  const fl = C.flaps, dCD = { 10: 0.0069, 20: 0.0124, 30: 0.0193 }, dCm = { 10: -0.0518, 20: -0.0762, 30: -0.0864 };
  const CLmax = { '0': C.CLmax.fwd['0'].CLmax_1g, '10': C.CLmax.fwd['10'].CLmax_1g, '20': C.CLmax.fwd['20'].CLmax_1g, '30': C.CLmax.fwd['30'].CLmax_1g };
  const dCL0 = { '0': 0, '10': fl['10'].dCLmax, '20': fl['20'].dCLmax, '30': fl['30'].dCLmax };
  // R1 stall-shape ratio (trainer: CLmax / linear CL at alpha_CLmax = 0.922, alpha* − alpha_CLmax = 1.73°) → C172S alpha_CLmax, alpha*
  const ratio = 0.922, dA = 1.73;
  const aCL = k => r(((CLmax[k] / ratio) - (CL0 + dCL0[k])) / TM.CLalpha / DEG, 2);
  const alphaCLmax = { '0': aCL('0'), '10': aCL('10'), '20': aCL('20'), '30': aCL('30') };
  const alphaStar = Object.fromEntries(Object.entries(alphaCLmax).map(([k, v]) => [k, r(v + dA, 2)]));
  const f = k => r(dCL0[k] / dCL0['30'], 4);       // AC.flaps for each detent (lift mapping)

  // sim-model static table (clean) for aero.static_long.table_clean: legacy Beard–McLain blend as in src/20-flight.js (est)
  const aSt = LEG?.legacy?.aero?.aStall ?? alphaStar['0'], CD0s = LEG?.legacy?.aero?.CD0 ?? C.glide.sim.CD0, Ks = LEG?.legacy?.aero?.K ?? C.glide.sim.K;
  const alphas = [-20, -12, -8, -4, 0, 4, 8, 12, 14, 16, 18, 20, 25, 30, 40, 60, 90];
  const tab = alphas.map(ad => { const a = ad * DEG, a0 = aSt * DEG, Mb = 55; const e1 = Math.exp(-Mb * (a - a0)), e2 = Math.exp(Mb * (a + a0));
    const s = (1 + e1 + e2) / ((1 + e1) * (1 + e2)); const CLl = CL0 + TM.CLalpha * a, CLp = 2 * Math.sign(a) * Math.sin(a) ** 2 * Math.cos(a);
    const CLx = (1 - s) * CLl + s * CLp; const CD = (1 - s) * (CD0s + Ks * (CLx - 0.15) ** 2) + s * (1.3 * Math.sin(a) ** 2 + CD0s);
    return [r(CLx, 3), r(CD, 3), r(Cm0 + CmaRef * Math.sin(a), 3)]; });

  // stall-warning alpha at VS+5 kt (14 CFR 23.207 min margin) in the linear range
  const aw = k => { const vs = C.CLmax.fwd[k].V1g_kcas; const CLw = CLmax[k] * (vs / (vs + 5)) ** 2; return r((CLw - CL0 - dCL0[k]) / TM.CLalpha / DEG, 2); };

  // gear (datum stations: nose −6.8 in, main 58.2 in, track 86 in from JSBSim c172r cross-check; wheelbase 65 in POH)
  const xn = fx(-6.8), xm = fx(58.2), yt = r(43 * IN, 3), hcg = 1.30;
  const Nn = W * (-xm) / (xn - xm), Nm = (W - Nn) / 2;
  const kMain = 5400 * 4.4482216 / FT, kNose = 1800 * 4.4482216 / FT;   // JSBSim c172r spring coefficients (N/m)
  const zetaM = 0.25, cMain = 2 * zetaM * Math.sqrt(kMain * Nm / G0);

  // propeller
  const P0 = PROPS.fixed_76x60, cs = C.prop.chordScale;
  const xs = P0.cx, cD = P0.cD.map(v => r(v * cs, 4));
  const r1CN = r1v('propeller.tables.CNmu'), r1CM = r1v('propeller.tables.CMmu');
  const col20 = t => t ? t.data.map(row => r(0.45 * row[t.axes.beta75_deg.indexOf(20)], 4)) : null;
  const hubX = fx(-33), hubPos = [hubX, 0, 0.0];

  const S_e = r(geo.tail.S_h * 0.42 * 0.95, 2), c_e = r(0.42 * geo.tail.S_h / geo.tail.b_h, 2), S_a = r(0.25 * 1.40 * (0.97 - 0.55) * b / 2, 2), S_r = r(0.42 * geo.tail.S_v * 0.9, 2);
  const VH = r(geo.tail.S_h * geo.tail.l_h / (S * c), 3);
  const Ixx = C.inertia.MTOW_TM.Ixx, Iyy = C.inertia.MTOW_TM.Iyy;
  const leg = LEG?.legacy;
  let excessTW = null;
  if (leg) { const V = 67 * KT, qq = 0.5 * RHO0 * V * V, CLa = W / (qq * S), la = leg.aero, lp = leg.propulsion, Vc = lp.eta * lp.P / lp.T0;
    const D = qq * S * (la.CD0 + la.CDflap + la.K * (CLa - 0.15) ** 2), T = lp.T0 * Vc / Math.sqrt(V * V + Vc * Vc); excessTW = r((T - D) / W, 3); }

  const card = {
    // ───────────── airframe ─────────────
    airframe: {
      identity: L({ manufacturer: 'Cessna Aircraft Company (Textron Aviation จาก s/n 172S11615)', model: '172S', variant: 'Skyhawk SP (รวม NAV III G1000 / G1000 NXi)', engine: 'Lycoming IO-360-L2A 180 hp @ 2,700 rpm', propeller: 'McCauley 1A170E/JHA7660 fixed pitch 2 ใบ 75–76 in', seats: 4, category: 'normal / utility (spin อนุญาตเฉพาะ utility)', tc_ref: 'FAA TCDS 3A12 Section XII; EASA TCDS IM.A.051 Section 2' }, '-', ['LC6', 'LC3', 'LC1'], H, false, 'ทะเบียนไทย: C172S 34 ใน 44 ลำ C172 ของ ATO (LS1); FNPT ของ BATC เป็น "C172S Glass Cockpit" จึงน่าจะมี G1000 ในฝูง (ค่าประมาณ ทะเบียนไม่บอก avionics)'),
      weights: {
        MTOW: L(g.MTOW_kg, 'kg', ['LC6', 'LC3'], H, false, '2,550 lb normal; utility 2,200 lb (997.9 kg)'),
        MLW: L(g.MTOW_kg, 'kg', ['LC6', 'LC1'], H, false, 'เท่ากับ MTOW 2,550 lb (POH p2-7)'),
        MRW: L(g.ramp_kg, 'kg', ['LC6', 'LC3'], H, false, 'ramp 2,558 lb; utility 2,208 lb (EASA เขียน 2,107 lb เป็นการพิมพ์ผิด ดู §04.12)'),
        BEW_typical: L(g.BEW_kg, 'kg', ['LC1'], M, false, 'standard empty weight 1,663 lb ของ Information Manual (p1-7) ไม่ใช่ของลำใดลำหนึ่ง; เครื่องที่มี G1000 และอุปกรณ์เสริมมักหนักกว่า'),
        max_fuel_usable: L(g.fuel_usable_kg, 'kg', ['LC6', 'LC1', 'LM4'], H, false, '53 US gal = 200.6 L ใช้ได้ (รวม 56 gal) × avgas 6 lb/gal (PHAK)'),
        useful_load: L(g.useful_kg, 'kg', ['LC1'], H, false, '895 lb (normal), 545 lb (utility)'),
        training_mass: L(C.training.total_kg, 'kg', ['LC0', 'LC1'], LO, true, `ค่าประมาณ: BEW 754.3 kg + ครู 85 kg + ศิษย์ 75 kg + เชื้อเพลิง 35 gal (95.3 kg) = ${C.training.total_kg} kg; การเทียบ POH ใช้ --mass ${g.MTOW_kg}`),
      },
      cg: {
        datum: L('lower portion of front face of firewall', '-', ['LC6', 'LC1'], H, false, 'ระยะ m DAT บวกไปทางท้าย'),
        LEMAC: L(C.cg.LEMAC_m, 'm DAT', ['LC6'], H, false, '25.9 in aft of datum'),
        MAC: L(C.cg.MAC_m, 'm', ['LC6'], H, false, '58.8 in'),
        envelope: L(C.cg.normal, 'kg, m DAT', ['LC6', 'LC1'], H, false, `normal: หน้า 35.0 in (${C.cg.normal_pctMAC.fwd_low} %MAC) ที่ ≤1,950 lb เชิงเส้นถึง 41.0 in (${C.cg.normal_pctMAC.fwd_mtow} %MAC) ที่ 2,550 lb; หลัง 47.3 in (${C.cg.normal_pctMAC.aft} %MAC) ทุกน้ำหนัก; utility หน้า 37.5 in ที่ 2,200 lb หลัง 40.5 in (${C.cg.utility_pctMAC.aft} %MAC)`),
        ref: L({ m_DAT: C.cg.ref_m, in_DAT: xref, pct_mac: C.cg.ref_pctMAC }, 'm DAT, %MAC', ['LC0', 'LC6'], M, true, 'CG อ้างอิงของ FRD และ inertia เลือกเอง (ค่าประมาณ): 42.0 in ใกล้ CG ฝึกทั่วไป อยู่ในขอบเขตทุกมวล'),
      },
      inertia: {
        Ixx: L(Ixx, 'kg m2', ['LM5', 'LC0'], LO, true, 'ค่าประมาณ: รัศมีไจเรชันที่วัดจริงของเครื่องคลาส C172 ใน NASA TM-80163 (Rx 0.235) × MTOW, b 11.0 m; ไม่รวมผลเชื้อเพลิงในปีก (+~577 kg m2 ถ้าถังเต็ม)'),
        Iyy: L(Iyy, 'kg m2', ['LM5', 'LC0'], LO, true, 'ค่าประมาณ: Ry 0.324 × MTOW, L 8.205 m (JSBSim c172x ให้ Ry 0.325)'),
        Izz: L(C.inertia.MTOW_TM.Izz, 'kg m2', ['LM5', 'LC0'], LO, true, 'ค่าประมาณ: Rz 0.364 ที่วัดจาก TM-80163 × MTOW, (b+L)/2 = 9.60 m (สูตร Roskam); ไม่รวมเชื้อเพลิงในปีก (+~577 kg m2 ถ้าถังเต็ม)'),
        Ixz: L(C.inertia.MTOW_TM.Ixz, 'kg m2', ['LM5', 'LC0'], LO, true, 'ค่าประมาณ: 123 kg m2 ของ TM-80163 × มวล'),
        ref_mass: L(g.MTOW_kg, 'kg', ['LC0'], M, false, 'inertia สเกลตามมวลด้วยรัศมีคงที่'),
        radii: L(C.inertia.radii_TM80163, '-', ['LM5', 'LM0'], LO, true, `Roskam Rx/Ry/Rz จาก TM-80163 (838 kg); ค่าคลาส single_prop ของหัวข้อ 01 (0.257/0.357/0.404) ให้ Ixx/Iyy/Izz ${C.inertia.MTOW_class.Ixx}/${C.inertia.MTOW_class.Iyy}/${C.inertia.MTOW_class.Izz}`),
        method: L('radii_from_flight_test_class', '-', ['LM0'], M, true, 'ไม่มี inertia ที่วัดของ 172S เผยแพร่; ความไม่แน่นอน ±30 % (หัวข้อ 01 §01.4)'),
      },
      wing: {
        S: L(S, 'm2', ['LC1'], H, false, '174 ft2 (POH p1-3, ใช้คำนวณ wing loading 14.7 lb/ft2); TCDS ให้ 16.3045 m2 (175.5 ft2) ต่าง 0.9 % ดู §04.12'),
        b: L(b, 'm', ['LC3', 'LC1'], H, false, '36 ft 1 in รวมไฟ strobe (POH); TCDS 10.9982 m'),
        MAC: L(c, 'm', ['LC6'], H, false, '58.8 in'),
        AR: L(g.AR, '-', ['LC0'], H, false, 'b²/S ด้วย S 174 ft2 (ด้วย S ของ TCDS ได้ 7.42)'),
        taper: L(0.70, '-', ['LM0'], LO, true, 'ค่าประมาณ: ปีกคอร์ดคงที่ช่วงใน + เรียวช่วงนอก เทียบเป็นปีกเรียวเดียวกับที่หัวข้อ 01 ใช้ตรวจ TM-80163'),
        sweep_c4_deg: L(0, 'deg', ['LM0'], LO, true, 'ค่าประมาณ: ถือว่าเส้น c/4 ไม่มี sweep (ปีกตรง ช่วงนอกเรียวเล็กน้อย) ตามรูปทรงที่หัวข้อ 01 ใช้ตรวจ TM-80163'),
        dihedral_deg: L(1.73, 'deg', ['LM0'], LO, true, 'ค่าประมาณ 1°44′ (ค่าที่หัวข้อ 01 ใช้กับเครื่องคลาส C172; ยังไม่พบเอกสารปฐมภูมิ)'),
        incidence_deg: L(1.5, 'deg', ['LC0'], LO, true, 'ค่าประมาณ: มุมติดตั้งโคนปีก (ยังไม่พบเอกสารปฐมภูมิที่เปิดได้; ตรวจกับ maintenance manual)'),
        twist_deg: L(-3.0, 'deg', ['LC0'], LO, true, 'ค่าประมาณ washout 3° (โคน +1.5° ปลาย −1.5°); ยังไม่ยืนยัน'),
        airfoil: L('NACA 2412 (modified)', '-', ['LC5'], LO, false, 'Wikipedia (ข้อมูลของ 172R) ไม่อ้างแหล่ง; รายการ Lednicer (LC7) เปิดอ่านแถว Cessna ไม่ได้ในรอบนี้'),
        position: L('high', '-', ['LC1'], H, false, 'ปีกสูงมีเสาค้ำ'),
        x_c4_root: L(2.12, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ระยะจากปลาย spinner (~43 in หน้า datum) ถึง c/4 โคนปีก (40.6 in DAT)'),
      },
      tail: {
        S_h: L(3.35, 'm2', ['LM5'], M, false, 'TM-80163 Table I (เครื่องคลาส C172) ผ่าน lm_derivs VALIDATION; JSBSim c172r ให้ 21.9 ft2 (2.03 m2) ต่างกันมาก ดู §04.12'),
        b_h: L(3.45, 'm', ['LM5'], M, false, 'TM-80163'),
        l_h: L(4.36, 'm', ['LM5'], M, false, 'TM-80163; JSBSim c172r 15.7 ft (4.79 m)'),
        S_v: L(1.04, 'm2', ['LM5'], M, false, 'TM-80163 (อาจเป็นเฉพาะครีบ); JSBSim 16.5 ft2 (1.53 m2)'),
        b_v: L(2.03, 'm', ['LM5'], M, false, 'TM-80163'),
        l_v: L(4.36, 'm', ['LM0'], LO, true, 'ค่าประมาณ: ถือว่าแขนหางดิ่งเท่าแขนหางระดับ 4.36 m ของ TM-80163 (ไม่มีค่าวัด)'),
        z_v: L(1.0, 'm', ['LM0'], LO, true, 'ค่าประมาณ: ศูนย์กลางแรงของครีบราวครึ่งหนึ่งของช่วงหางดิ่ง 2.03 m (TM-80163) เหนือแกน x'),
        airfoil_h: L('symmetric (ไม่ทราบรุ่น)', '-', ['LC0'], LO, true, 'ค่าประมาณ: สมมติหน้าตัดสมมาตรแบบหาง GA ทั่วไป (ไม่พบเอกสาร); ซิมใช้ผ่าน a_t ของ lm_derivs เท่านั้น'),
        airfoil_v: L('symmetric (ไม่ทราบรุ่น)', '-', ['LC0'], LO, true, 'ค่าประมาณ: สมมติหน้าตัดสมมาตร (ไม่พบเอกสาร)'),
        incidence_h_deg: L(0, 'deg', ['LC0'], LO, true, 'ค่าประมาณ: ตั้ง 0 เพราะไม่มีข้อมูล ผลของมุมติดตั้งหางรวมอยู่ใน Cm0 ที่ได้จาก trim cruise'),
      },
      surfaces: {
        elevator: L({ area_m2: S_e, chord_ratio: 0.42, span_fraction: 0.95 }, 'm2, -, -', ['LM0', 'LM5'], LO, true, 'ค่าประมาณ chord ratio 0.42 ตามหัวข้อ 01'),
        aileron: L({ area_m2: S_a, chord_ratio: 0.25, span_fraction: [0.55, 0.97] }, 'm2 (ข้างละ), -, สัดส่วนครึ่งช่วงปีก', ['LM0'], LO, true, 'ค่าประมาณ; aileron แบบ Frise'),
        rudder: L({ area_m2: S_r, chord_ratio: 0.42, span_fraction: 0.9 }, 'm2, -, -', ['LM0'], LO, true, 'ค่าประมาณ: 0.42 × S_v 1.04 m2 × 0.9 (chord ratio ตามหัวข้อ 01)'),
        flap: L({ type: 'single-slotted', span_fraction: [0.12, 0.55], detents_deg: [0, 10, 20, 30] }, '-, สัดส่วนครึ่งช่วงปีก, deg', ['LC2', 'LC6'], M, true, 'ชนิดและ detent จาก POH p7-13 และ TCDS; ช่วงตามปีกเป็นค่าประมาณ'),
        trim_tab: L({ chord_ratio: 0.25, location: 'elevator ขวา (ค่าประมาณ)' }, '-', ['LC6', 'LC0'], LO, true, 'ค่าประมาณ: chord ratio 0.25 ของ elevator และตำแหน่งตามแบบทั่วไปของ tab ล้อมือ; TCDS ให้แค่ระยะเคลื่อน'),
      },
      geometry: {
        length: L(POH.length_m, 'm', ['LC3'], H, false, '26.92 ft (Wikipedia 27 ft 2 in)'),
        span: L(b, 'm', ['LC3'], H, false, '36.08 ft'),
        height: L(POH.height_m, 'm', ['LC3'], H, false, '7.73 ft (Wikipedia 8 ft 11 in น่าจะรวมเสาอากาศ/ไฟ)'),
        wheelbase: L(g.wheelbase_m, 'm', ['LC1'], H, false, '65 in (POH p1-3)'),
        main_track: L(r(86 * IN, 3), 'm', ['LM8'], LO, true, 'ค่าประมาณ 86 in จากตำแหน่งล้อในโมเดล JSBSim c172r (y ±43 in)'),
        prop_clearance: L(g.prop_clear_m, 'm', ['LC1'], H, false, '11.25 in'),
        eye_pos_FRD: L([fx(37), -0.25, -0.30], 'm FRD', ['LM8', 'LC0'], LO, true, 'ค่าประมาณ: x จาก EYEPOINT ของ JSBSim c172r (37 in DAT), y ที่นั่งซ้าย, z เหนือ CG 0.30 m'),
        eye_height_static: L(1.60, 'm', ['LC0'], LO, true, 'ค่าประมาณ: CG สูงจากพื้น 1.30 m + 0.30 m'),
        fuselage_width: L(1.0, 'm', ['LM0'], LO, true, 'ค่าประมาณ: ความกว้างห้องโดยสารราว 1.0 m ที่หัวข้อ 01 ใช้กับเครื่องคลาส C172 (ใช้ใน lm_derivs)'),
        fuselage_height: L(1.35, 'm', ['LM0'], LO, true, 'ค่าประมาณ: ความสูงลำตัวที่หัวข้อ 01 ใช้กับเครื่องคลาส C172 (ใช้ใน lm_derivs)'),
      },
    },

    // ───────────── aero ─────────────
    aero: {
      ref: { S: L(S, 'm2', ['LC1'], H, false, '174 ft2'), b: L(b, 'm', ['LC3'], H, false, ''), c: L(c, 'm', ['LC6'], H, false, 'MAC 58.8 in') },
      derivatives: {
        CLq: L(est2('CLq'), '1/rad (c/2V)', ['LM0'], LO, true, 'lm_derivs'),
        CLadot: L(est2('CLadot'), '1/rad (c/2V)', ['LM0'], LO, true, 'lm_derivs'),
        CLde: L(TM.CLde, '1/rad', ['LM5'], M, false, 'บินจริง TM-80163 (ML 40.7 m/s); lm_derivs ' + r(E.cruise.CLde, 3)),
        CD0: L({ cruise: C.cleanPolar.CD0, glide_windmill: C.glide.CD0 }, '-', ['LC1', 'LC4', 'LC0'], LO, true, `polar พาราโบลา CD = CD0 + K CL²: glide (ใบพัดหมุนฟรี) จาก 68 KIAS กับ L/D ${C.glide.E}; cruise จากจุด 75 % 8,500 ft 124 KTAS (η 0.80 ค่าประมาณ)`),
        K: L({ cruise: C.cleanPolar.K, glide_windmill: C.glide.K }, '-', ['LC1', 'LC4', 'LC0'], LO, true, `glide e ${C.glide.e}; cruise สมมติ e 0.75`),
        CYb: L(TM.CYb, '1/rad', ['LM5'], M, false, 'TM-80163 Table X CL 0.6; lm_derivs ' + r(E.cruise.CYb, 3)),
        CYdr: L(est2('CYdr'), '1/rad', ['LM0', 'LM5'], LO, true, 'lm_derivs; ผลบินทดสอบ TM-80163 Table X (fit, แฟลป 0) ≈ 0.11 / 0.14 / 0.17 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR)'),
        CYr: L(est2('CYr'), '1/rad (b/2V)', ['LM0'], LO, true, 'lm_derivs'),
        Clb: L(TM.Clb, '1/rad', ['LM5'], M, false, 'TM-80163'),
        Clp: L(TM.Clp, '1/rad (b/2V)', ['LM5'], M, false, 'TM-80163 Table X linear fit ที่ CL 0.6 (แฟลป 0)'),
        Clr: L(est2('Clr'), '1/rad (b/2V)', ['LM0', 'LM5'], LO, true, 'lm_derivs (ขึ้นกับ CL); TM-80163 Table X (fit, แฟลป 0) ≈ 0.07 / 0.095 / 0.13 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR) ค่า approach ของบัตรสูงกว่า 65 % ดู §04.9'),
        Clda: L(TM.Clda, '1/rad', ['LM5'], M, false, 'TM-80163 Table X CL 0.6: −0.102 ต่อ δa = δซ้าย − δขวา (ผลต่างสองข้าง) → |−0.102| × 2 = +0.204 ต่อมุมเฉลี่ยตามเครื่องหมาย AC (da+ = ม้วนขวา)'),
        Cldr: L(est2('Cldr'), '1/rad', ['LM0', 'LM5'], LO, true, 'lm_derivs; TM-80163 Table X ≈ 0.006–0.0095 (อ่านจาก OCR)'),
        Cmq: L(TM.Cmq, '1/rad (c/2V)', ['LM5'], M, false, 'TM-80163 (ระบุโดยตรึง Cmα̇ = −4.0)'),
        Cmadot: L(est2('Cmadot'), '1/rad (c/2V)', ['LM0', 'LM5'], LO, true, 'lm_derivs; TM-80163 ตรึงไว้ที่ −4.0 ไม่ได้ระบุจากข้อมูล'),
        Cmde: L(TM.Cmde, '1/rad', ['LM5'], M, false, 'TM-80163 Table IV เฉลี่ยสองรัน (−1.24, −1.21) ที่ 40.7 m/s; δe บวก = ขอบท้ายลง ตรงกับ AC (รายการสัญลักษณ์ของรายงานเรียก δe ว่า stabilator แต่ Table II เรียก elevator)'),
        Cnb: L(TM.Cnb, '1/rad', ['LM5'], M, false, 'TM-80163; lm_derivs ' + r(E.cruise.Cnb, 3)),
        Cnp: L(est2('Cnp'), '1/rad (b/2V)', ['LM0', 'LM5'], LO, true, 'lm_derivs (ขึ้นกับ CL); TM-80163 Table X (fit, แฟลป 0) ≈ −0.05 / −0.078 / −0.115 ที่ CL 0.3 / 0.6 / 1.0 (อ่านจาก OCR) ดู §04.9'),
        Cnr: L(TM.Cnr, '1/rad (b/2V)', ['LM5'], M, false, 'TM-80163 Table X linear fit ที่ CL 0.6 (−0.10 / −0.125 ที่ CL 0.3 / 1.0)'),
        Cnda: L(est2('Cnda'), '1/rad', ['LM0', 'LM5'], LO, true, 'lm_derivs (K_n −0.20); TM-80163 ให้ proverse +0.008 (แยกค่าจาก Cnp ไม่ได้) ดู §04.12'),
        Cndr: L(TM.Cndr, '1/rad', ['LM5'], M, false, 'TM-80163'),
      },
      static_long: {
        CL0: L(Object.fromEntries(Object.keys(dCL0).map(k => [k, r(CL0 + dCL0[k], 3)])), '-', ['LC9', 'LC0'], LO, true, 'ค่าประมาณ: clean 0.25 ตามตาราง JSBSim c172 (หัวข้อ 03) + ΔCL0 ของแฟลป = ΔCLmax จาก POH (สมมติมุม stall ไม่เลื่อน)'),
        CLalpha: L(TM.CLalpha, '1/rad', ['LM5'], M, false, 'บินจริง TM-80163 ทั้งลำ; lm_derivs ' + r(ecr.static.CLalpha, 3)),
        alpha_star: L(alphaStar, 'deg', ['LC0', 'LC10'], LO, true, 'ค่าประมาณ: alpha_CLmax + 1.73° ตามรูปร่างโมเดล stall ของรอบที่ 1'),
        alpha_star_neg: L({ '0': 13, '30': 9 }, 'deg', ['LC10'], LO, true, 'ค่าของเครื่องฝึกรอบที่ 1 (ไม่มีข้อมูล C172)'),
        a1: L(22, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        CL_sep_at_alpha_star: L({ '0': r(0.95 * CLmax['0'] / 1.355, 3), '30': r(1.1 * CLmax['30'] / 1.657, 3) }, '-', ['LC10', 'LC0'], LO, true, 'ค่าของรอบที่ 1 สเกลด้วย CLmax'),
        CDmax_90: L(1.4, '-', ['LC10'], LO, true, 'ปีก 1.11 + 0.018 AR = 1.24 + ลำตัว/หาง/เสาค้ำ'),
        dCD_sep: L(0.2, '-', ['LC10'], LO, true, 'ค่าวรรณกรรมของรอบที่ 1'),
        CmX: L(-0.12, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1; C172 pitch break อ่อน (ไม่มีตัวเลข)'),
        Cm0: L(Object.fromEntries(Object.keys(dCL0).map(k => [k, r(Cm0 + (k === '0' ? 0 : dCm[k]), 4)])), '-', ['LC0', 'LC9'], LO, true, 'ค่าประมาณ: clean จาก trim elevator −2° ที่ 110 KCAS MTOW CG อ้างอิง; ΔCm0 แฟลปจากตาราง JSBSim c172r (หัวข้อ 03)'),
        Cmalpha: L(r(CmaRef, 3), '1/rad', ['LM5', 'LC0'], M, false, `TM-80163 −0.87 ที่ CG 28.8 %MAC ย้ายไป ${C.cg.ref_pctMAC} %MAC: −0.87 − CLα·Δh; จุด neutral ≈ ${r(28.8 + 87 / 5.17, 1)} %MAC`),
        CLmax_target: L(CLmax, '-', ['LC2', 'LM0'], M, true, 'ค่าประมาณ: CLmax 1 g แบบ trim ที่ MTOW CG หน้า คำนวณจาก VS ของ Fig 5-3 (KCAS) โดยถือว่า VS เป็นความเร็วต่ำสุดที่ nz 0.95 ตามวิธีของหัวข้อ 01 (ช่วง nz 0.90–1.00 ใน §04.6); 20° สอดแทรก 2/3 ระหว่าง 10° และ 30° ตามรูปทรง ΔCL ของ JSBSim'),
        alpha_CLmax: L(alphaCLmax, 'deg', ['LC0'], LO, true, 'ค่าประมาณจากอัตราส่วน 0.922 ของรอบที่ 1'),
        table_clean: L({ axes: { coef: ['CL', 'CD', 'Cm'], alpha_deg: alphas }, data: tab }, '-', ['LC0'], LO, true, 'ตารางของโมเดล legacy (Beard–McLain M 55 + แผ่นเรียบ) จากค่าในบัตร ไม่ใช่ข้อมูลอุโมงค์ลม'),
      },
      flaps: {
        detents: L(['0', '10', '20', '30'].map(k => ({ name: k, flap_deg: +k, VFE_kt: k === '0' ? null : (k === '10' ? 110 : 85), dCL0: r(dCL0[k], 3), dCD0: k === '0' ? 0 : dCD[k], dCm0: k === '0' ? 0 : dCm[k], CLmax: r(CLmax[k], 3), f_lift: f(k) })).map(o => (o.VFE_kt === null ? (delete o.VFE_kt, o) : o)),
          '-, deg, kt IAS', ['LC2', 'LC6', 'LC9', 'LC0'], LO, true, 'CLmax จาก POH (20° ค่าประมาณ); dCL0 = ΔCLmax; dCD0/dCm0 จาก JSBSim c172r; f_lift = AC.flaps ของแต่ละขั้น'),
        transition_time_s: L(9, 's', ['LC0'], LO, true, 'ค่าประมาณ 0→30° (POH ไม่ระบุเวลา; มอเตอร์ไฟฟ้า)'),
      },
      ...(leg ? { legacy: L(leg.aero, '-, 1/rad, deg', ['LM0', 'LC0'], M, true, 'lm_legacy_fit (lc_fit.mjs โหมด static): polar รูปแบบซิมจาก glide 68 KIAS L/D 9.11; aStall/aStallFlap แก้หาให้ CLmax 1 g ตรง POH; ค่าอื่นจากบัตร (AC.flaps 0–1 = 0–30°)') } : {}),
      gear_drag: { dCD0: L(0, '-', ['LM0'], H, false, 'ล้อตายตัว: แรงต้านรวมใน CD0') },
      elevator_fade: {
        alpha_t_star: L(r1v('aero.elevator_fade.alpha_t_star') ?? 22, 'deg', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        a_t: L(r1v('aero.elevator_fade.a_t') ?? 10, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        floor: L(r1v('aero.elevator_fade.floor') ?? 0.35, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
      },
      separation_dynamics: {
        tau1: L(0.49, 's', ['LC10', 'LC0'], LO, true, 'ค่าของรอบที่ 1 (0.4 s) × (c/V_s ของ C172S)/(c/V_s ของเครื่องฝึก) = 1.22'),
        tau2: L(0.24, 's', ['LC10', 'LC0'], LO, true, 'ค่าประมาณ: ค่าของรอบที่ 1 (0.2 s) × 1.22 เหมือน tau1'),
      },
      large_beta: { CY_crossflow: L(0.53, '-', ['LC0'], LO, true, 'ค่าประมาณ: พื้นที่ด้านข้าง ~8.5 m2 × CD 1.0 / S') },
      strip_wing: {
        taper: L(0.70, '-', ['LM0'], LO, true, 'ค่าประมาณ: ปีกช่วงในคอร์ดคงที่ + ช่วงนอกเรียว เทียบเป็นปีกเรียวเดียว 0.7 (หัวข้อ 01)'),
        dihedral_eff: L(1.73, 'deg', ['LM0'], LO, true, 'ค่าประมาณ (ปีกสูงเพิ่ม Clb เอง)'),
        washout: L(3.0, 'deg', ['LC0'], LO, true, 'ค่าประมาณ: washout 3° เท่ากับ airframe.wing.twist_deg (ยังไม่ยืนยันกับเอกสาร)'),
        kp_roll: L(0.63, '-', ['LC10', 'LC0'], LO, true, 'ค่าของรอบที่ 1 0.661 × Clp เป้า −0.45/−0.47'),
        tau_aileron: L(0.31, '-', ['LC10', 'LC0'], LO, true, 'ค่าของรอบที่ 1 0.26 สเกลให้ Clda 0.204 บนช่วง 0.55–0.97'),
        aileron_span_frac: L([0.55, 0.97], '-', ['LM0'], LO, true, 'ค่าประมาณ: ช่วง aileron 55–97 % ของครึ่งปีก ตามรูปทรงที่หัวข้อ 01 ใช้ตรวจ TM-80163'),
      },
      stall_warning: {
        min_margin: L(5, 'kt', ['LM3', 'LC2'], M, false, '14 CFR 23.207(c) เดิม: เตือนก่อน stall อย่างน้อย 5 kt; C172S ใช้แตรลม (reed) ที่ขอบหน้าปีกซ้าย'),
        alpha_warn_5kt: L({ '0': aw('0'), '30': aw('30') }, 'deg', ['LC0'], LO, true, 'α ที่ V_s + 5 kt จากค่าในบัตร (โมเดลเชิงเส้น)'),
        alpha_warn_design: L({ '0': r(aw('0') - 0.7, 2), '30': r(aw('30') - 0.7, 2) }, 'deg', ['LC0', 'LC10'], LO, true, 'ต่ำกว่า alpha_warn_5kt 0.7° ตามระยะเผื่อของรอบที่ 1'),
      },
      buffet: {
        vertical_filter: L(r1v('aero.buffet.vertical_filter'), 'rad/s,-', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (ไม่มีข้อมูล C172)'),
        lateral_filter: L(r1v('aero.buffet.lateral_filter'), 'rad/s,-,-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        rms_full: L({ az: 0.03, ay: 0.01 }, 'g', ['LC10', 'LC0'], LO, true, 'ค่าประมาณ: 60 % ของเครื่องฝึกรอบที่ 1 (C172 buffet ก่อน stall เบา)'),
      },
      spin_reference: {
        alpha_spin: L(r1v('aero.spin_reference.alpha_spin') ?? [43, 60], 'deg', ['LC10'], LO, true, 'ค่าคลาสเครื่องฝึกของรอบที่ 1 (ไม่พบตัวเลข spin ของ C172 ที่เผยแพร่)'),
        turn_rate: L(r1v('aero.spin_reference.turn_rate') ?? [145, 208], 'deg/s', ['LC10'], LO, true, 'ค่าประมาณ: ค่าคลาสเครื่องฝึกของรอบที่ 1 (ไม่มีข้อมูล spin ของ C172)'),
        omega_hat: L(r1v('aero.spin_reference.omega_hat') ?? [0.24, 0.42], '-', ['LC10'], LO, true, 'ค่าประมาณ: ค่าคลาสเครื่องฝึกของรอบที่ 1'),
        descent_trainer: L(5000, 'fpm', ['LC0'], LO, true, 'ค่าประมาณสำหรับเครื่องเบา (เครื่องฝึกรอบที่ 1 9,500 fpm หนักกว่ามาก) ต้องยืนยัน'),
        IYMP: L(r((Ixx - Iyy) / (m * b * b), 5), '-', ['LC0'], LO, true, '(Ixx − Iyy)/(m b²) จาก inertia ในบัตร'),
        recovery_turns_max: L(1.0, 'turn', ['LM3', 'LC1'], M, false, 'spin อนุญาตเฉพาะ utility (POH p2-9); 14 CFR 23.221(a) ฉบับ 2012: ฟื้นจาก spin หนึ่งรอบหรือ 3 s (แล้วแต่อันไหนนานกว่า) ภายในอีกไม่เกิน 1 รอบ; (b) utility ที่ขออนุมัติ spin ต้องผ่าน (c) และ 23.807(b)(7) เพิ่ม'),
      },
    },

    // ───────────── interference ─────────────
    interference: {
      downwash: {
        deda: L(r(ecr.static.deda, 3), '-', ['LM0'], LO, true, 'lm_derivs (DATCOM 4.4.1)'),
        eps0: L(0, 'rad', ['LC0'], LO, true, 'ค่าประมาณ: ตั้ง 0 เพราะผลของ downwash ที่ α = 0 รวมอยู่ใน Cm0 ที่ได้จาก trim'),
        l_t: L(4.36, 'm', ['LM5'], M, false, 'TM-80163'),
        VH: L(VH, '-', ['LC0'], M, false, 'S_h l_h/(S c)'),
        a_t: L(r(ecr.static.CLaH, 3), '1/rad', ['LM0'], LO, true, 'lm_derivs'),
        eta_t: L(0.9, '-', ['LM0'], LO, true, 'ค่าเริ่มต้นของหัวข้อ 01'),
        CLadot: L(r(E.approach.CLadot, 3), '1/(rad·c/2V)', ['LM0'], LO, true, 'lm_derivs'),
        Cmadot: L(r(E.approach.Cmadot, 3), '1/(rad·c/2V)', ['LM0'], LO, true, 'lm_derivs'),
      },
      groundEffect: {
        rMac: L([fx(25.9 + 0.25 * 58.8), r(b / 6 * (1 + 2 * 0.7) / (1 + 0.7), 3), -0.95], 'm (FRD จาก CG, y ใช้ ±)', ['LC6', 'LC0'], LO, true, 'x จาก c/4 MAC (40.6 in DAT); y ตำแหน่ง MAC ตามช่วงปีกของปีกเรียว 0.7; z ปีกสูงเหนือ CG ~0.95 m (ค่าประมาณ) ⇒ h/b ที่แตะพื้นราว 0.2 (ผลน้อยกว่าปีกต่ำ)'),
        CLa_w: L(r(ecr.static.CLaW, 3), '1/rad', ['LM0'], LO, true, 'lm_derivs (ปีกล้วน)'),
        A: L(g.AR, '-', ['LC0'], H, false, ''),
        rEps: L(r1v('interference.groundEffect.rEps') ?? { a: 3.99, m: 0.652 }, '-', ['LC10'], LO, true, 'สูตร fit ของรอบที่ 1 (VLM) ใช้ซ้ำ'),
      },
      slipstream: {
        diskDiameter: L(g.prop_D_m, 'm', ['LC6'], H, false, '76 in'),
        hubRadius: L(0.15, 'm', ['LC0'], LO, true, 'ค่าประมาณ: รัศมี spinner ≈ 0.15 r/R × รัศมีใบ 0.965 m'),
        hubPos: L(hubPos, 'm (FRD จาก CG)', ['LC0'], LO, true, 'ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum, แนวแรงขับที่ระดับ CG'),
        sense: L(1, '-', ['LC8'], M, false, 'Lycoming direct drive หมุนตามเข็มนาฬิกาเมื่อมองจากห้องนักบิน (PHAK)'),
        kappa: L(r1v('interference.slipstream.kappa') ?? 0.43, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        immersionH: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.8, 0.9, 0.97] }, data: [0, 0.25, 0.45, 0.55, 0.63, 0.68] }, '-', ['LC0'], LO, true, 'ค่าประมาณ: หางระดับ C172 อยู่ใกล้แนวแรงขับ (ต่ำกว่าเล็กน้อย) จึงจมใน slipstream มากกว่าเครื่องฝึกรอบที่ 1'),
        immersionV: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.8, 0.9, 0.97] }, data: [0.05, 0.18, 0.30, 0.36, 0.42, 0.46] }, '-', ['LC0'], LO, true, 'ค่าประมาณ: สัดส่วนครีบที่อยู่ใน slipstream ตามรัศมี slipstream เทียบความสูงครีบ 2.03 m เหนือแนวแรงขับ (เรขาคณิตโดยประมาณ)'),
        kSwirl: L(0.5, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        zSwirl: L(0.6, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ศูนย์กลางครีบเหนือแนวแรงขับ คิดจาก z_v 1.0 m ลบระยะที่แนวแรงขับอยู่สูงกว่าแกนลำตัวท้าย (~0.4 m)'),
        finArea: L(1.04, 'm2', ['LM5'], M, false, 'TM-80163'),
        finArm: L(4.36, 'm', ['LM0'], LO, true, 'ค่าประมาณ: เท่ากับ l_h ของ TM-80163'),
        finLiftSlope: L(r(ecr.static.CLaV, 3), '1/rad', ['LM0'], LO, true, 'lm_derivs'),
        eta_v: L(0.9, '-', ['LM0'], LO, true, 'ค่าเริ่มต้น η_v ของหัวข้อ 01'),
        blownSpanFactor: L(0.9, 'D', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        blownArea: L(2.3, 'm2', ['LC0'], LO, true, 'ค่าประมาณ: ปีกสูงเหนือ slipstream ส่วนใหญ่ ใช้ 0.9 D × คอร์ด ~1.6 m − ลำตัว'),
        kBlown: L(0.3, '-', ['LC0'], LO, true, 'ค่าประมาณ (ต่ำกว่าเครื่องฝึก 0.5 เพราะปีกสูงพ้นแกน slipstream)'),
        k_deda_power: L(0, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (ไม่คิดผลกำลังต่อ downwash)'),
      },
    },

    // ───────────── speeds ─────────────
    speeds: {
      VS0_kt: L(48, 'kt CAS', ['LC2', 'LC1'], H, false, 'แฟลป 30 power off 2,550 lb CG หน้า (Fig 5-3: 40 KIAS; POH หมายเหตุว่าค่า KIAS เป็นค่าโดยประมาณ)'),
      VS1_kt: L(53, 'kt CAS', ['LC2', 'LC1'], H, false, 'แฟลปขึ้น (Fig 5-3: 48 KIAS)'),
      VX_kt: L(62, 'kt IAS', ['LC1'], H, false, 'SL; 67 KIAS ที่ 10,000 ft (p4-5)'),
      VY_kt: L(74, 'kt IAS', ['LC1', 'LC2'], H, false, 'SL; 72 KIAS ที่ 10,000 ft (p4-5; Fig 5-6 74→72)'),
      VR_kt: L(51, 'kt IAS', ['LC2'], M, false, 'ความเร็วล้อพ้นพื้นของ short field takeoff แฟลป 10 (Fig 5-5 p5-14); ความเร็วที่ 50 ft 56 KIAS; normal takeoff (แฟลป 0–10°) ยกล้อหน้าราว 55 KIAS แล้วไต่ 70–80 KIAS (POH p4-15 อ่านจาก OCR ที่เห็นทั้ง 50 และ 55)'),
      VAPP_kt: L(65, 'kt IAS', ['LC1'], M, false, 'normal approach แฟลป 30 60–70 KIAS ใช้กลางช่วง; แฟลปขึ้น 65–75'),
      VAPP_short_kt: L(61, 'kt IAS', ['LC1', 'LC2'], H, false, 'short field แฟลป 30 (p4-5, Fig 5-11 ที่ 50 ft)'),
      VREF_kt: L(61, 'kt IAS', ['LC2'], M, false, 'POH ไม่ใช้คำว่า VREF; ใช้ความเร็วที่ 50 ft ของ short field landing 61 KIAS = 63.9 KCAS ≈ 1.33 VS0 (48 KCAS)'),
      VG_kt: L(68, 'kt IAS', ['LC1'], H, false, 'maximum glide 2,550 lb (p3-3); POH ไม่ให้ตารางตามมวล'),
      VA_kt: L({ '2550': 105, '2200': 98, '1900': 90 }, 'kt IAS', ['LC1', 'LC6'], H, false, 'lb → KIAS (KCAS 102/95/88)'),
      VNO_kt: L(129, 'kt IAS', ['LC6', 'LC1'], H, false, '126 KCAS'),
      VNE_kt: L(163, 'kt IAS', ['LC6', 'LC1'], H, false, '160 KCAS'),
      VFE: L({ '10': 110, '20': 85, '30': 85 }, 'kt IAS', ['LC1', 'LC6'], H, false, '10°: 110 KIAS (107 KCAS); 10–30°: 85 KIAS (TCDS FAA 85 KCAS, EASA 84 KCAS)'),
      ias_cas: L(POH.iasCas, 'KIAS → KCAS', ['LC2'], M, false, 'Fig 5-1 normal static source, power for level flight (p5-9); อ่านจาก OCR การจับคู่บางช่องอนุมาน; ต่ำกว่า 40/50 KIAS ไม่มีข้อมูล'),
      stall_table: L({ cg_fwd: POH.stall.fwd, cg_aft: POH.stall.aft, bank_deg: [0, 30, 45, 60], cell: '[KIAS, KCAS]' }, 'kt', ['LC2'], H, false, `Fig 5-3 2,550 lb power off; ตรวจแล้วทุกช่องตรง V0/√cos φ ภายใน ${C.stallTableCheck.maxDev_kt} kt; KIAS เป็นค่าโดยประมาณตาม POH`),
      stall_warning_margin_kt: L(5, 'kt', ['LM3'], M, false, '14 CFR 23.207(c) (ถึง Amdt 23-50): เตือนก่อน stall อย่างน้อย 5 kt จนถึง stall; กฎไม่กำหนดขีดบน'),
      stall_altitude_loss_ft: L(230, 'ft', ['LC2'], H, false, 'Fig 5-3 note: อาจเสียความสูงถึง 230 ft'),
      crosswind_demonstrated_kt: L(15, 'kt', ['LC1'], H, false, 'takeoff หรือ landing (p4-5); ไม่ใช่ขีดจำกัด'),
      icao_approach_category: L('A', '-', ['LC12', 'LC0'], H, false, '1.3 VS0 = 1.3 × 48 = 62 KCAS < 91 kt = Category A ตามนิยาม 14 CFR 97.3 (VREF หรือ 1.3 VSO ที่ MLW); ICAO PANS-OPS ใช้ขอบ 91 kt เดียวกัน'),
    },

    // ───────────── performance ─────────────
    performance: {
      ROC_SL_fpm: L(730, 'fpm', ['LC1'], H, false, '2,550 lb SL ISA (p ii); Fig 5-6 ที่ 15 °C interpolate ได้ 729'),
      ROC_table: L({ axes: { PA_ft: POH.roc.PA, OAT_C: POH.roc.OAT }, kias: POH.roc.kias, data: POH.roc.fpm }, 'fpm', ['LC2'], H, false, 'Fig 5-6 2,550 lb แฟลปขึ้น คันเร่งเต็ม (p5-17); null = ไม่มีข้อมูล; VTBD 35 °C ≈ ' + C.hot['35'].roc_fpm + ' fpm'),
      service_ceiling_ft: L(14000, 'ft', ['LC1'], H, false, 'p ii'),
      cruise_table: L([{ alt_ft: 8500, power: '75 %', ktas: 124, note: 'ไม่มี wheel fairing ลบ ~2 kt' }, { alt_ft: 0, power: 'max', ktas: 126 }], 'ft, -, kt TAS', ['LC1'], H, false, 'จุดสรุป p ii (ตาราง Fig 5-8 อ่านจาก OCR ไม่ได้)'),
      glide: L({ speed_kt: 68, ratio: C.glide.E }, 'kt IAS, -', ['LC1', 'LC4'], M, true, `ความเร็วจาก POH p3-3 (68 KIAS = ${C.glide.vbg_kcas} KCAS); ratio ค่าประมาณจาก FAA 1.5 NM ต่อ 1,000 ft (ช่วง 1.4–1.6 → ${C.glide.E_range_1p4_1p6.join('–')}); ใบพัดหมุนฟรี แฟลปขึ้น`),
      takeoff: L({ ground_roll_m: r(960 * FT, 0), over50ft_m: r(1630 * FT, 0) }, 'm', ['LC1'], H, false, '960 / 1,630 ft (p ii) MTOW SL ISA ลมสงบ ผิวแห้ง (short field technique แฟลป 10)'),
      landing: L({ ground_roll_m: r(575 * FT, 0), over50ft_m: r(1335 * FT, 0) }, 'm', ['LC1'], H, false, '575 / 1,335 ft (p ii) แฟลป 30 เบรกสุด'),
      takeoff_table: L({ axes: { PA_ft: POH.to.PA, OAT_C: POH.to.OAT }, roll_ft: POH.to.roll, total50_ft: POH.to.total }, 'ft', ['LC2'], M, false, `Fig 5-5 short field 2,550 lb แฟลป 10 lift-off 51 KIAS 56 KIAS ที่ 50 ft; อ่านจาก OCR ที่สลับคอลัมน์ ตรวจความเป็นเอกภาพแล้ว; VTBD 35 °C: ${C.hot['35'].to_roll_ft} / ${C.hot['35'].to_50_ft} ft`),
      landing_table: L({ axes: { PA_ft: POH.ldg.PA, OAT_C: POH.ldg.OAT }, roll_ft: POH.ldg.roll, total50_ft: POH.ldg.total }, 'ft', ['LC2'], M, false, `Fig 5-11 2,550 lb แฟลป 30 61 KIAS ที่ 50 ft (แถว 3,000/5,000–7,000 ft ละไว้); VTBD 35 °C: ${C.hot['35'].ldg_roll_ft} / ${C.hot['35'].ldg_50_ft} ft`),
      fuel: L({ usable_L: g.fuel_usable_L, usable_kg: g.fuel_usable_kg, range_75pct_8500ft_nm: 518, endurance_75pct_h: 4.26, range_45pct_10000ft_nm: 638, endurance_45pct_h: 6.72 }, 'L, kg, NM, h', ['LC1'], H, false, 'p ii: 53 gal usable, ไม่มี wheel fairing'),
      vtbd_hot_day: L(C.hot['35'], 'ft, fpm, m', ['LC2', 'LC0'], M, true, 'interpolate ตาราง POH ที่ PA 0 ft (VTBD 9 ft) OAT 35 °C 2,550 lb ลมสงบ (ค่าประมาณจากการ interpolate)'),
    },

    // ───────────── propulsion / piston / propeller ─────────────
    propulsion: {
      layout: L([{ id: 1, pos: hubPos, axis: [1, 0, 0], type: 'piston', model: 'Lycoming IO-360-L2A', prop_sense: 1 }], 'm FRD', ['LC6', 'LC8', 'LC0'], M, true, 'ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum บนแนว CG; prop_sense 1 ตาม PHAK p5-31 (หมุนตามเข็มนาฬิกามองจากที่นั่งนักบิน)'),
      ...(leg ? { legacy: L(leg.propulsion, 'W, -, N, -', ['LM0', 'LC0'], M, true, `ค่าประมาณ: lc_fit.mjs (lm_legacy_fit โหมด static) ใช้ T0 ${C.prop.static.T0_N} N จาก BEM ของ lc_calc (lm_prop ใบ fixed_76x60 ปรับคอร์ดให้รอบสถิต 2,350 rpm) แล้ว fit η ให้ ROC สูงสุด 730 fpm ที่ SL; ถ้าใช้ T0 จากทฤษฎีโมเมนตัม FM 0.55 (3,094 N) ต้องใช้ η 1.035 ซึ่งเป็นไปไม่ได้; idle 0 เพราะ polar จาก glide รวมแรงต้านใบพัดแล้ว`) } : {}),
    },
    piston: {
      identity: L({ model: 'IO-360-L2A', kind: 'fuel_injected', displacement_L: 5.916, cylinders: 4, tcds: 'FAA 1E10 / EASA IM.E.032' }, '-', ['LM21', 'LC1'], H, false, '5.916 L = 361 in3 ตาม IM.E.032 p6 (POH p1-4 เขียน 360 in3); 4 สูบนอน ฉีดเชื้อเพลิง RSA-5; น้ำหนักแห้ง 122 kg (p9)', 'engine'),
      ratings: {
        P_rated: L(r(180 * HP, 0), 'W', ['LC6', 'LC1'], H, false, '180 hp @ 2,700 rpm (TCDS เครื่องยนต์ให้ L2A 160 hp/2,400 rpm และ alternate 180 hp/2,700 rpm)', 'engine'),
        rpm_rated: L(2700, 'rpm', ['LC6'], H, false, 'ทุกการใช้งาน', 'engine'),
        P_mcp: L(r(180 * HP, 0), 'W', ['LC6'], H, false, 'ไม่มีพิกัด takeoff แยก', 'engine'),
        rpm_redline: L(2700, 'rpm', ['LC1'], H, false, 'tach green 2,100–2,500 SL, –2,600 ที่ 5,000 ft, –2,700 ที่ 10,000 ft', 'engine'),
        rpm_idle: L(650, 'rpm', ['LC0'], LO, true, 'ค่าประมาณ: รอบเดินเบาทั่วไปของ IO-360 fixed pitch (ยังไม่ได้อ่านค่าจาก POH section 4)', 'engine'),
        takeoff_time_limit_s: L('unlimited', 's', ['LC6'], H, false, 'TCDS ให้ 2,700 rpm สำหรับทุกการใช้งาน', 'engine'),
      },
      altitude: L({ model: 'ind_friction', f: 0.10 }, '-', ['LM17', 'LM0'], M, true, `ข้อเสนอของหัวข้อ 01; VTBD 35 °C ได้ ${C.lapseVTBD.ind_friction_35C} (gagg_ferrar ${C.lapseVTBD.gagg_farrar_35C}); ROC ใน POH ลดเป็น ${C.lapseVTBD.POH_roc_ratio_35_15} เท่าที่ 35 °C`, 'engine'),
      fuel: L({ fuel: 'avgas 100LL (100/100LL)', bsfc_g_per_kWh: 254, density_kg_L: 0.72 }, '-, g/kWh, kg/L', ['LC6', 'LC9'], LO, true, 'BSFC ค่าประมาณ 0.418 lb/(hp h) ที่ JSBSim คำนวณให้ c172r (หัวข้อ 03); POH ตาราง cruise อ่านไม่ได้', 'engine'),
      dynamics: L({ tau_throttle_s: 0.2, I_engine: 1.7, friction_torque: 'f 0.10 ของกำลังพิกัดที่รอบพิกัด' }, 's, kg m2, -', ['LM0'], LO, true, 'ค่าประมาณของหัวข้อ 01 (I รวมใบพัด)', 'engine'),
    },
    propeller: {
      identity: {
        kind: L('fixed', '-', ['LC6'], H, false, '', 'propeller'),
        model: L('McCauley 1A170E/JHA7660', '-', ['LC6', 'LC1'], H, false, 'spinner drawing 0550236', 'propeller'),
        nBlades: L(2, '-', ['LC1'], H, false, '', 'propeller'),
        diameter: L(g.prop_D_m, 'm', ['LC6'], H, false, '76 in (ต่ำสุด 75 in)', 'propeller'),
        sense: L(1, '-', ['LC8'], M, false, 'ตามเข็มนาฬิกามองจากด้านหลัง', 'propeller'),
        massComplete: L(14, 'kg', ['LC0'], LO, true, 'ค่าประมาณ: ใบอะลูมิเนียม 2 ใบ 76 in ราว 12 kg + spinner (ยังไม่ตรวจกับน้ำหนักในรายการอุปกรณ์ POH Section 6)', 'propeller'),
        hubPosition: L(hubPos, 'm (FRD จาก CG)', ['LC0'], LO, true, 'ค่าประมาณ: ระนาบใบพัด ~33 in หน้า datum (firewall + ความยาวเครื่องยนต์และ spinner) แนวแรงขับที่ระดับ CG', 'propeller'),
        thrustAxis: L([1, 0, 0], '-', ['LC0'], LO, true, 'ค่าประมาณ: ตั้งแนวแรงขับขนานแกน x เพราะไม่พบมุม down/right thrust ในเอกสารเปิด', 'propeller'),
      },
      fixed: {
        pitch_in: L(60, 'in', ['LM22', 'LC6'], M, false, 'จากรหัส 7660 = 76 in × 60 in (แบบแผนชื่อรุ่นของ McCauley)', 'propeller'),
        beta75_deg: L(18.52, 'deg', ['LM0'], M, false, 'atan(60/(0.75π·76))', 'propeller'),
        static_rpm_range: L([2300, 2400], 'rpm', ['LC6', 'LC1'], H, false, 'คันเร่งเต็ม อยู่กับที่', 'propeller'),
      },
      engineInterface: {
        maxShaftPower: L(r(180 * HP / 1000, 1), 'kW', ['LC6'], H, false, '180 hp', 'propeller'),
        gearRatio: L(1, '-', ['LM21'], H, false, 'direct drive', 'propeller'),
      },
      bladeGeometry: {
        hubRadiusRatio: L(P0.xh, 'r/R', ['LM0'], LO, true, 'lm_prop', 'propeller'),
        chordOverD: L({ axes: { x: xs }, data: cD }, 'c/D', ['LM0'], LO, true, `รูปใบ GA ของ lm_prop × ${cs} (ปรับให้รอบสถิต 2,350 rpm)`, 'propeller'),
        twistDesignJ: L(r(60 / 76, 3), '-', ['LM0'], M, false, 'pitch เรขาคณิตคงที่ = helical ที่ J = p/D', 'propeller'),
        activityFactor: L(90, '-', ['LM0'], LO, true, 'ค่าประมาณ: AF ของรูปใบ GA ใน lm_prop (ไม่มีข้อมูล McCauley)', 'propeller'),
      },
      section: {
        liftSlope: L(r(P0.cla, 3), '1/rad', ['LM0'], LO, true, 'ค่าประมาณ: หน้าตัดคล้าย Clark Y ของ lm_prop (0.9 × 2π)', 'propeller'),
        alpha0: L(r(P0.a0 / DEG, 2), 'deg', ['LM0'], LO, true, 'หน้าตัดคล้าย Clark Y ของ lm_prop', 'propeller'),
        alphaStallPos: L(14, 'deg', ['LM0'], LO, true, 'lm_prop', 'propeller'),
        alphaStallNeg: L(-10, 'deg', ['LM0'], LO, true, 'lm_prop', 'propeller'),
        stallBlendM: L(r1v('propeller.section.stallBlendM') ?? 10, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1', 'propeller'),
        cd0: L(P0.cd0, '-', ['LM0'], LO, true, 'lm_prop', 'propeller'),
        kcd: L(P0.kcd, '-', ['LM0'], LO, true, 'lm_prop', 'propeller'),
        Mdd: L(0.8, '-', ['LC10'], LO, true, 'ปลายใบ 2,700 rpm M ≈ 0.81 (ช่วงบนของ fixed pitch)', 'propeller'),
        stallDelayFactor: L(3, '-', ['LM0'], LO, true, 'ค่าประมาณ: สัมประสิทธิ์ stall delay แบบ Snel ของ lm_prop', 'propeller'),
      },
      tables: {
        CT: L({ axes: { J: C.prop.table.map(x => x[0]) }, data: C.prop.table.map(x => x[1]) }, '-', ['LM0', 'LC0'], LO, true, 'BEM lm_prop (fixed pitch แกน J); C_T = 0 ที่ J ≈ 0.94 ดู §04.5', 'propeller'),
        CP: L({ axes: { J: C.prop.table.map(x => x[0]) }, data: C.prop.table.map(x => x[2]) }, '-', ['LM0', 'LC0'], LO, true, 'BEM lm_prop', 'propeller'),
        CNmu: L(r1CN ? { axes: { J: r1CN.axes.J }, data: col20(r1CN) } : null, '-', ['LC10', 'LC0'], LO, true, 'ค่าประมาณ: คอลัมน์ β75 20° ของรอบที่ 1 × 0.45 (solidity 2×AF 90 / 4×AF 100)', 'propeller'),
        CMmu: L(r1CM ? { axes: { J: r1CM.axes.J }, data: col20(r1CM) } : null, '-', ['LC10', 'LC0'], LO, true, 'ค่าประมาณ: คอลัมน์ β75 20° ของรอบที่ 1 × 0.45 เหมือน CNmu', 'propeller'),
      },
      inertia: {
        Ip: L(1.4, 'kg m2', ['LM0'], LO, true, 'ค่าประมาณ: ใบ 14 kg ที่รัศมีไจเรชัน ~0.32 m (I ≈ m k²) ; หัวข้อ 01 ให้รวมเครื่อง ~1.7', 'propeller'),
        IreflectedEngine: L(0.3, 'kg m2', ['LM0'], LO, true, 'ค่าประมาณ: เพลาข้อเหวี่ยงและชิ้นส่วนหมุนของเครื่อง direct drive = 1.7 − 1.4 ของหัวข้อ 01', 'propeller'),
      },
      checks: {
        staticThrustISA: L(r(C.prop.static.T0_N / 1000, 2), 'kN', ['LM0', 'LC0'], LO, true, `BEM ${C.prop.static.rpm} rpm FM ${C.prop.static.FM} (${C.prop.static.T0_lbf} lbf)`, 'propeller'),
        staticThrustVTBD31C: L(r(C.prop.staticISA20.T0_N / 1000, 2), 'kN', ['LM0', 'LC0'], LO, true, `ค่าประมาณ: BEM เดียวกันที่ ISA+20 (35 °C) ${C.prop.staticISA20.rpm} rpm`, 'propeller'),
        momentumIdealStaticISA: L(4.65, 'kN', ['LC0'], M, false, 'FM = 1 ที่กำลังที่ดูด 158.7 hp, A = π·0.965²', 'propeller'),
        peakEfficiency: L(0.849, '-', ['LM0'], LO, true, 'ค่าประมาณ: η สูงสุดของ BEM (lm_prop) ที่ J ≈ 0.75', 'propeller'),
      },
    },

    // ───────────── controls ─────────────
    controls: {
      architecture: L({ pitch: 'reversible (cable)', roll: 'reversible (cable, Frise ailerons)', yaw: 'reversible (cable) + nose-wheel steering bungee', trim: 'tab' }, '-', ['LC2', 'LC6'], M, false, 'POH Section 7 Fig 7-1; elevator trim tab ล้อมือ (NAV III GFC 700 มี electric trim)'),
      surfaces: {
        elevator: L({ travel_deg: { up: 28, down: 23 }, rate_dps: 70, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LC6', 'LC3'], H, false, 'TCDS up 28° +1/−0, down 23° +1/−0; rate เป็นค่าประมาณของรอบที่ 1 (มือคน)'),
        aileron: L({ travel_deg: { up: 20, down: 15 }, rate_dps: 80, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LC6'], H, false, 'up 20° ±1, down 15° ±1 (differential) ⇒ daMax 17.5°'),
        rudder: L({ travel_deg: { left: 17.73, right: 17.73 }, rate_dps: 60, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LC3', 'LC6'], H, false, '17°44′ ±1° วัดตั้งฉากกับ hinge; 16°10′ ±1° วัดขนาน WL (ทั้ง FAA 3A12 และ EASA IM.A.051 ให้สองค่านี้)'),
        flap: L({ travel_deg: { up: 0, down: 30 }, rate_dps: 3.3, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LC6', 'LC2'], M, true, 'TCDS 0–30° +0/−2; detent 10/20/30; rate ค่าประมาณ'),
        trim_tab: L({ travel_deg: { up: 22, down: 19 } }, 'deg', ['LC6'], H, false, 'up 22° +1/−0, down 19° +1/−0'),
      },
      trim: {
        kind: L('manual wheel + elevator tab (electric trim ใน NAV III GFC 700)', '-', ['LC2', 'LC3'], M, false, 'ไม่มี rudder/aileron trim ใน TCDS'),
        range_deg: L({ tab_up: 22, tab_down: 19 }, 'deg', ['LC6'], H, false, ''),
        rate_dps: L(1.0, 'deg/s', ['LC0'], LO, true, 'ค่าประมาณสำหรับปุ่มคีย์บอร์ด (ล้อมือไม่มีอัตราคงที่)'),
      },
      pitch: {
        architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LC2'], M, false, 'cable'),
        S_e: L(S_e, 'm2', ['LM0'], LO, true, 'ค่าประมาณ: S_h 3.35 m2 × chord ratio 0.42 × span 0.95'),
        c_e: L(c_e, 'm', ['LM0'], LO, true, 'ค่าประมาณ: 0.42 × คอร์ดเฉลี่ยหาง (S_h/b_h)'),
        gearing: L(3.6, 'rad/m', ['LC0'], LO, true, 'ค่าประมาณ: elevator 51° รวม ต่อระยะคันโยก ~0.25 m'),
        eta_t: L(0.9, '-', ['LM0'], LO, true, 'ค่าเริ่มต้น η_h ของหัวข้อ 01'),
        a_t: L(r(ecr.static.CLaH, 3), '1/rad', ['LM0'], LO, true, 'lm_derivs'),
        tau_e: L(r(ecr.static.tauE, 3), '-', ['LM0'], LO, true, 'lm_derivs'),
        l_t: L(4.36, 'm', ['LM5'], M, false, ''),
        deda: L(r(ecr.static.deda, 3), '-', ['LM0'], LO, true, 'lm_derivs (DATCOM)'),
        Ch0: L(0, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Ch_alpha: L(r1v('controls.pitch.Ch_alpha') ?? -0.1146, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (ไม่มีข้อมูล hinge moment ของ C172)'),
        Ch_delta: L(r1v('controls.pitch.Ch_delta') ?? -0.3438, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Ch_tab: L(r1v('controls.pitch.Ch_tab') ?? -0.2005, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        tab_max: L(22, 'deg', ['LC6'], H, false, 'up 22 / down 19'),
        trim_rate_flaps_down: L(1.0, 'deg/s', ['LC0'], LO, true, 'ค่าประมาณ: อัตรา tab ที่ตั้งให้ปุ่มคีย์บอร์ดเลียนแบบการหมุนล้อมือ (ไม่มีอัตราคงที่ในเครื่องจริง)'),
        trim_rate_flaps_up: L(1.0, 'deg/s', ['LC0'], LO, true, 'ค่าประมาณ: เหมือน trim_rate_flaps_down'),
        breakout: L(4.45, 'N', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (1 lbf)'),
        friction: L(4.45, 'N', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        centring_spring: L(r1v('controls.pitch.centring_spring') ?? { Kc: 60, qFade: 400 }, 'N/rad, Pa', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        stops: L({ teu: 28, ted: 23 }, 'deg', ['LC6'], H, false, 'TCDS'),
        rate_limit: L(70, 'deg/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
      },
      roll: {
        architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LC2'], M, false, ''),
        S_a_each: L(S_a, 'm2', ['LM0'], LO, true, 'ค่าประมาณ: 0.25 × คอร์ด 1.40 m × ช่วง (0.97 − 0.55) × b/2'),
        c_a: L(0.35, 'm', ['LM0'], LO, true, 'ค่าประมาณ: 0.25 × คอร์ดปีก ~1.4 m'),
        gearing: L(3.88, 'rad/m', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Ch_delta: L(r1v('controls.roll.Ch_delta') ?? -0.1719, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (Frise ช่วยลดแรง)'),
        Ch_alpha: L(r1v('controls.roll.Ch_alpha') ?? -0.0573, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        breakout: L(3, 'N', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        stops: L({ up: 20, down: 15, max_mean: 17.5 }, 'deg', ['LC6'], H, false, 'TCDS'),
        rate_limit: L(80, 'deg/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
      },
      yaw: {
        architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LC2'], M, false, 'แป้นต่อกับ steering bungee ของล้อหน้า'),
        S_r: L(S_r, 'm2', ['LM0'], LO, true, 'ค่าประมาณ: 0.42 × S_v × 0.9'),
        c_r: L(0.40, 'm', ['LM0'], LO, true, 'ค่าประมาณ: 0.42 × คอร์ดเฉลี่ยครีบ (S_v/b_v ≈ 0.51 m) ปัดขึ้นเพราะ rudder กว้างที่โคน'),
        gearing: L(4.85, 'rad/m', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Ch_delta: L(r1v('controls.yaw.Ch_delta') ?? -0.3438, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Ch_beta: L(r1v('controls.yaw.Ch_beta') ?? -0.1146, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        slipstream_q_ratio: L([1, 1.6], '-', ['LC0'], LO, true, 'ค่าประมาณ: q ที่หางดิ่ง/q อิสระ จาก idle ถึงกำลังเต็มที่ความเร็วต่ำ'),
        breakout: L(13.3, 'N', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        stops: L({ max: 17.73 }, 'deg', ['LC6', 'LC3'], H, false, '17°44′ วัดตั้งฉากกับ hinge'),
        rate_limit: L(60, 'deg/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
      },
    },

    // ───────────── gear ─────────────
    gear: {
      layout: L('tricycle_fixed', '-', ['LC2'], H, false, 'POH p7-14'),
      geometry: {
        nose_contact_body_extended: L([xn, 0, hcg], 'm FRD', ['LM8', 'LC1'], LO, true, 'x จาก JSBSim c172r (−6.8 in DAT) ซึ่งให้ wheelbase 65 in ตรง POH; z = ความสูง CG ค่าประมาณ'),
        main_contact_body_extended: L([[xm, -yt, hcg], [xm, yt, hcg]], 'm FRD', ['LM8'], LO, true, 'x 58.2 in DAT, track 86 in (JSBSim c172r)'),
        cg_height_parked: L(hcg, 'm', ['LM8', 'LC0'], LO, true, 'ค่าประมาณ: JSBSim c172r ให้ 1.38 m ก่อนยุบ'),
      },
      strut_main: {
        kind: L('spring_leg', '-', ['LC2'], H, false, 'tubular spring steel (POH p7-14)'),
        spring: L({ k_vertical: r(kMain, 0), k_lateral: r(0.6 * kMain, 0), damping_ratio: zetaM, static_deflection: r(Nm / kMain, 3) }, 'N/m, N/m, -, m', ['LM8', 'LC0'], LO, true, `k จาก JSBSim c172r 5,400 lb/ft ต่อล้อ (ยุบนิ่ง ${r(Nm / kMain, 3)} m ที่ MTOW); ζ 0.25 ค่าประมาณ (ขาสปริงเหล็กหน่วงน้อย JSBSim ใช้ ζ ≈ 1.9)`),
        stroke: L(0.15, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ระยะยุบสูงสุดราว 2.8 เท่าของยุบนิ่ง 0.054 m (ขาสปริงไม่มีจุดชนตายตัว)'),
        c_linear: L(r(cMain, 0), 'N s/m', ['LC0'], LO, true, 'ค่าประมาณ: 2ζ√(k N/g) ด้วย ζ 0.25 และโหลดนิ่งต่อล้อ'),
      },
      strut_nose: {
        kind: L('oleo', '-', ['LC2'], H, false, 'air/oil shock strut'),
        stroke: L(0.12, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ช่วงยุบ oleo ล้อหน้าแบบ GA ทั่วไป (POH บอกเพียงว่าเห็นแกนราว 2 in ตอนจอด)'),
        p_static: L(112, 'psi', ['LC2', 'LC0'], LO, true, 'ค่าประมาณ = 2.5 × ความดันเติมตอนไม่มีโหลด 45 psi (POH p8-21)'),
        piston_area: L(r(Nn / (112 * 6894.76), 5), 'm2', ['LC0'], LO, true, `โหลดล้อหน้านิ่ง ${r(Nn, 0)} N ÷ p_static`),
        ratio_static_to_extended: L(2.5, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        ratio_compressed_to_extended: L(8, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        Kh_compression: L(r(1600 * m / 2250, 0), 'N/(m/s)^2', ['LC10'], LO, true, 'ค่าของรอบที่ 1 × มวล 1157/2250'),
        Kr_rebound: L(r(19000 * m / 2250, 0), 'N/(m/s)^2', ['LC10'], LO, true, 'ค่าประมาณ: ค่าของรอบที่ 1 × มวล 1157/2250'),
        c_linear: L(r(1000 * m / 2250, 0), 'N s/m', ['LC10'], LO, true, 'ค่าประมาณ: ค่าของรอบที่ 1 × มวล 1157/2250'),
        spring: L({ k_vertical: r(kNose, 0), damping_ratio: 0.6 }, 'N/m, -', ['LM8', 'LM0'], LO, true, 'สำหรับซิม legacy: JSBSim c172r 1,800 lb/ft; ζ 0.6 ค่าเริ่มต้นของหัวข้อ 01'),
      },
      tyre_main: {
        size: L({ size: '6.00-6', ply: 6 }, '-', ['LC3', 'LC2'], H, false, 'EASA IM.A.051 p20 และ POH p8-21 (FAA 3A12 Section XII ไม่ระบุยาง)'),
        operating_pressure: L(38, 'psi', ['LC2'], H, false, 'POH p8-21'),
        outside_diameter: L(0.44, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ยาง 6.00-6 เส้นผ่านศูนย์กลางนอกราว 17.5 in ตามขนาดเรียก (ยังไม่ตรวจกับ tire data book)'),
        section_width: L(0.16, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ความกว้าง 6.00 in ตามขนาดเรียก'),
        rated_load: L(7000, 'N', ['LC0'], LO, true, 'ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6.00-6 6 ply (ยังไม่ได้ตรวจกับ tire data book)'),
        rated_pressure: L(50, 'psi', ['LC0'], LO, true, 'ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6 ply (ยังไม่ตรวจกับ tire data book)'),
        k_vertical: L(150000, 'N/m', ['LC0'], LO, true, 'ค่าประมาณ: ความแข็งยางที่ 38 psi ≈ p × พื้นที่สัมผัส/ยุบ (ยุบราว 3 cm ที่โหลดนิ่ง 4.3 kN)'),
        c_vertical: L(1500, 'N s/m', ['LC0'], LO, true, 'ค่าประมาณ: ζ ของยางราว 0.05 ที่โหลดนิ่ง'),
        cornering_stiffness_coef: L(3.2, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        relaxation_length: L(0.27, 'm', ['LC10', 'LC0'], LO, true, 'ค่าประมาณ: ค่าของรอบที่ 1 สเกลตามเส้นผ่านศูนย์กลางยาง'),
        k_longitudinal: L(120000, 'N/m', ['LC0'], LO, true, 'ค่าประมาณ: ราว 0.8 เท่าของ k แนวดิ่ง ตามสัดส่วนที่รอบที่ 1 ใช้'),
        mu_peak_dry: L(0.8, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (ยางบนผิวแห้ง)'),
        mu_skid_ratio_dry: L(0.75, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        mu_skid_ratio_wet: L(0.5, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        rolling_radius: L(0.21, 'm', ['LC0'], LO, true, 'ค่าประมาณ: รัศมีนอก 0.22 m ลบการยุบตอนรับโหลด'),
        wheel_inertia: L(0.12, 'kg m2', ['LC0'], LO, true, 'ค่าประมาณ: ล้อ+ยาง+จานเบรกราว 6 kg ที่รัศมีไจเรชัน ~0.14 m'),
      },
      tyre_nose: {
        size: L({ size: '5.00-5', ply: 6 }, '-', ['LC3', 'LC2'], H, false, 'EASA IM.A.051 p20 และ POH p8-21'),
        operating_pressure: L(45, 'psi', ['LC2'], H, false, 'POH p8-21'),
        outside_diameter: L(0.36, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ยาง 5.00-5 ราว 14 in ตามขนาดเรียก'),
        rated_load: L(5500, 'N', ['LC0'], LO, true, 'ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 5.00-5 6 ply (ยังไม่ตรวจกับ tire data book)'),
        rated_pressure: L(50, 'psi', ['LC0'], LO, true, 'ค่าประมาณ: ค่าพิกัดทั่วไปของยาง 6 ply'),
        k_vertical: L(110000, 'N/m', ['LC0'], LO, true, 'ค่าประมาณ: สเกลจากยางหลักตามขนาดและความดัน 45 psi'),
        c_vertical: L(800, 'N s/m', ['LC0'], LO, true, 'ค่าประมาณ: ζ ของยางราว 0.05 ที่โหลดนิ่งล้อหน้า'),
        cornering_stiffness_coef: L(3.2, '1/rad', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        relaxation_length: L(0.2, 'm', ['LC0'], LO, true, 'ค่าประมาณ: ค่าของยางหลักสเกลตามเส้นผ่านศูนย์กลาง'),
      },
      brakes: {
        force_limit_ratio: L(0.45, '-', ['LC0'], LO, true, 'ค่าประมาณ: POH ลงจอด 575 ft จาก ~55 KTAS ต้องการเฉลี่ย ≥ 0.23 g'),
        pressure_rise_rate: L(2.5, '1/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1 (เบรกเท้า hydraulic)'),
        antiskid: L(0, 'bool', ['LC2'], H, false, 'ไม่มี anti-skid; disc brake hydraulic ข้างละตัว (p7-14)'),
        heat_sink_mass: L(1.5, 'kg', ['LC0'], LO, true, 'ค่าประมาณ: จานเบรกเหล็กเดี่ยวกับ lining ต่อล้อ'),
        heat_sink_cool_tau: L(600, 's', ['LC0'], LO, true, 'ค่าประมาณ: เวลาเย็นตัวแบบ exponential ของจานเล็กในอากาศนิ่ง'),
        fade_start_temp: L(400, 'degC', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        fade_full_temp: L(700, 'degC', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
      },
      steering: {
        mode: L({ type: 'pedal_linked', caster_with_diff_brake: true }, '-', ['LC2'], H, false, 'steering bungee สปริงจากแป้น; เบรกข้างเดียวเลี้ยวต่อได้ถึง 30°'),
        pedal_max: L(10, 'deg', ['LC2'], H, false, 'ประมาณ 10° แต่ละข้าง (p7-12)'),
        caster_max: L(30, 'deg', ['LC2'], H, false, 'ถึง 30° ด้วยเบรก; ลากห้ามเกิน 30°'),
        steer_rate: L(60, 'deg/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        shimmy_lag: L(0.05, 's', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        min_turn_radius_m: L(r((27 * 12 + 5.5) * IN, 2), 'm', ['LC1', 'LC2'], H, false, '27 ft 5.5 in จากจุดหมุนถึงปลายปีกนอก (Information Manual p1-3); POH p7-12 ให้ราว 27 ft (8.23 m) เมื่อใช้เบรกข้างเดียวช่วย'),
      },
      certification: {
        part23_limit_descent: L({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10', WS_lb_ft2: C.part23.WS_lb_ft2, V_fps: C.part23.Vdesc_fps, V_mps: C.part23.Vdesc_mps }, 'fps', ['LM3', 'LC0'], M, false, '14 CFR 23.473(d) เดิม กับ W/S 14.66'),
        part23_wing_lift_ratio: L(0.667, '-', ['LM3'], M, false, '23.473(e) เดิม'),
        part23_min_load_factors: L({ inertia: 2.67, ground_reaction: 2 }, 'g', ['LM3'], M, false, '23.473(g) เดิม'),
        part23_reserve_drop_factor: L(1.44, 'x drop height', ['LM3'], M, false, '23.727 เดิม'),
      },
    },

    // ───────────── wind / input / validation ─────────────
    wind: {
      fFactor: { trainerExcessTW: L(excessTW ?? 0.06, '-', ['LC0'], LO, true, '(T − D)/W ที่ approach แฟลป 30 คันเร่งเต็ม (ค่าจากโมเดล legacy ของบัตร)') },
      wake: {
        b0_over_b: L(0.7854, '-', ['LC10'], M, false, 'π/4 ปีกวงรี'),
        rc_over_b: L({ default: 0.035, min: 0.02, max: 0.06 }, '-', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        trainerRollControl: L({ Clda: TM.Clda, daMax_deg: 17.5, ClMax: r(TM.Clda * 17.5 * DEG, 4) }, '-', ['LM5', 'LC6'], M, false, 'อำนาจม้วนสูงสุดของ C172S ใช้เทียบกับแรงม้วนของ wake'),
      },
    },
    input: {
      keyboard: {
        interim_trim_rate_elevator: L(0.5, 'deg/s', ['LC10'], LO, true, 'ค่าของรอบที่ 1'),
        flap_notches: L([0, f('10'), f('20'), 1], 'สัดส่วน AC.flaps', ['LC2', 'LC0'], M, true, 'detent 0/10/20/30° แปลงด้วยแรงยก (lift mapping)'),
      },
    },
    validation: {
      classification: { hqClassCategory: L({ class: 'I', approachLanding: 'C', cruiseClimb: 'B', takeoff: 'C' }, '-', ['R1:V8'], H, false, 'MIL-F-8785C Class I (small light)') },
      procedures: { v50MinFactor_singleEngine: L(1.2, '× VS1', ['LM3'], M, false, '14 CFR 23.51(b)(2)(ii) (ฉบับ 2011; ไม่ใช่ 23.53); POH 56 KIAS ที่ 50 ft แฟลป 10 ≈ 60.6 KCAS = 1.19 × VS(10°) 51 KCAS') },
      trim_targets: {
        cruise: L({ ias_kt: 110, h_ft: 3000 }, 'kt CAS, ft', ['LC0'], M, false, 'สภาพ trim/linearise ของ lm_card (ราว 75 % ที่ 3,000 ft)'),
        approach: L({ ias_kt: 67, h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LC1', 'LC0'], M, false, 'normal approach แฟลป 30 65 KIAS ≈ 67 KCAS'),
      },
      stall_test: L({ '0': 70, '10': 66, '20': 64, '30': 63 }, 'kt EAS', ['LC0'], M, false, 'ความเร็วเริ่มของการทดสอบ stall 1 kt/s (≈1.3 V_SR)'),
      takeoff_test: L({ flap: '10', VR_kt: 52, theta_deg: 12 }, '-, kt CAS, deg', ['LC2', 'LC0'], M, true, 'short field: lift-off 51 KIAS ≈ 57.6 KCAS ตามตาราง (ค่าสอบเทียบใช้กับการบินระดับ) ใช้ VR 52 KCAS θ 12° ค่าประมาณ (θ 8° ทำให้ล้อพ้นพื้นที่ 67 kt)'),
    },
  };
  labelEstimates(card);
  return card;
}

// Review (2026-11-18): every est:true leaf must say how it was estimated (schema-ext-r2 §1). Short notes that only name the
// tool or the round-1 origin are expanded into a method statement and prefixed "ค่าประมาณ:".
const EXPAND = [
  [/^lm_derivs/, 'ประมาณจากรูปทรงในบัตรด้วย lm_derivs (สูตร DATCOM/Roskam ของหัวข้อ 01)'],
  [/^ค่าของรอบที่ 1/, 'ยกค่าเครื่องฝึกสมมติของรอบที่ 1 (params-trainer.json) มาใช้เพราะไม่มีข้อมูล C172S'],
  [/^ค่าวรรณกรรมของรอบที่ 1/, 'ยกค่าวรรณกรรมที่รอบที่ 1 ใช้ (params-trainer.json) เพราะไม่มีข้อมูล C172S'],
  [/^ค่าเริ่มต้น/, 'ใช้ค่าเริ่มต้น'],
  [/^lm_prop/, 'รูปใบพัด GA มาตรฐานของ lm_prop (หัวข้อ 01)'],
  [/^BEM lm_prop/, 'คำนวณด้วย BEM ของ lm_prop (หัวข้อ 01) ใบ fixed_76x60 ปรับคอร์ด × 1.0827 ให้รอบสถิต 2,350 rpm'],
  [/^สูตร fit ของรอบที่ 1/, 'ใช้สูตร fit ของรอบที่ 1'],
];
function labelEstimates(o) {
  const isLeaf = x => x && typeof x === 'object' && !Array.isArray(x) && 'v' in x && 'scope' in x;
  if (isLeaf(o)) {
    if (o.est && !/^ค่าประมาณ/.test(o.note)) {
      let n = o.note;
      for (const [re, txt] of EXPAND) if (re.test(n)) { n = n.replace(re, txt); break; }
      o.note = 'ค่าประมาณ: ' + n;
    }
    return;
  }
  if (o && typeof o === 'object') for (const k of Object.keys(o)) labelEstimates(o[k]);
}

// ── _na: round-1 paths that do not apply to the C172S ──
export const NA = {
  v: ['turboprop.*', 'turbofan.*', 'propeller.engineInterface.rpmGoverned', 'propeller.engineInterface.rpmTransientLimit', 'propeller.engineInterface.flightIdleShaftPower',
    'propeller.governor.*', 'propeller.betaReverse.*', 'propeller.feathered.*',
    'gear.strut_main.p_static', 'gear.strut_main.piston_area', 'gear.strut_main.ratio_static_to_extended', 'gear.strut_main.ratio_compressed_to_extended',
    'gear.strut_main.polytropic_n_dynamic', 'gear.strut_main.polytropic_n_static', 'gear.strut_main.Kh_compression', 'gear.strut_main.Kr_rebound', 'gear.strut_main.seal_friction_ratio',
    'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured', 'gear.brakes.antiskid_slip_setpoint',
    'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
    'controls.reference_types.*', 'controls.roll.tab_max', 'controls.roll.trim_rate', 'controls.yaw.tab_max', 'controls.yaw.trim_rate', 'controls.pitch.derived_check',
    'interference.groundEffect.tablesCheck',
    'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders', 'numerics.*',
    'validation.typicalModes.*', 'validation.currentModel.*', 'otherSims.*'],
  note: 'เครื่องลูกสูบใบพัด fixed pitch: ไม่มี turboprop/turbofan, governor, feather, reverse; ล้อหลักเป็นขาสปริงเหล็ก (ไม่มีพารามิเตอร์ oleo); ไม่มี anti-skid; ไม่ใช่ Part 25; ไม่มี aileron/rudder trim (TCDS มีแค่ elevator tab); controls.reference_types และ wind.wake.leaders เป็นค่าอ้างอิงของเครื่องโดยสาร; controls.pitch.derived_check และ groundEffect.tablesCheck เป็นค่าตรวจที่คำนวณจากสูตรของรอบที่ 1 ไม่ใช่ข้อมูลรายแบบ; numerics.* เป็นค่าของตัวซิม; validation.typicalModes/currentModel เป็นค่าของเครื่องฝึกรอบที่ 1 (ของ C172S อยู่ที่ validation.reference_modes และ §04.9); otherSims.* เป็นของหัวข้อ 03',
};

export function blocks(card) {
  const groups = [['airframe'], ['aero'], ['interference'], ['speeds'], ['performance'], ['propulsion', 'piston', 'propeller'], ['controls'], ['gear'], ['wind', 'input', 'validation']];
  const out = [];
  for (const g of groups) { const o = {}; for (const k of g) if (card[k]) o[k] = card[k]; out.push({ title: g.join(' + '), json: { c172s: o } }); }
  out.push({ title: '_na', json: { c172s: { _na: { v: NA.v, u: '-', scope: 'aircraft', src: ['LC0'], conf: 'สูง', est: false, note: NA.note } } } });
  return out;
}

if (isMainModule(import.meta.url)) {
  const card = build();
  // one leaf per line, nested groups indented by one space
  const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'scope' in o;
  const pp = (o, ind = '') => {
    if (isLeaf(o) || typeof o !== 'object' || o === null || Array.isArray(o)) return JSON.stringify(o);
    const ks = Object.keys(o), i2 = ind + ' ';
    return '{\n' + ks.map((k, n) => `${i2}${JSON.stringify(k)}: ${pp(o[k], i2)}${n < ks.length - 1 ? ',' : ''}`).join('\n') + '\n' + ind + '}';
  };
  const md = blocks(card).map(b => `**บล็อก ${b.title}**\n\n\`\`\`json\n${pp(b.json)}\n\`\`\`\n`).join('\n');
  fs.writeFileSync(path.join(HERE, 'out', 'lc_json.md'), md);
  const t = fs.readFileSync(TOPIC, 'utf8'), A = '<!-- LC_JSON_BEGIN -->', B = '<!-- LC_JSON_END -->';
  if (t.includes(A) && t.includes(B)) { fs.writeFileSync(TOPIC, t.slice(0, t.indexOf(A) + A.length) + '\n' + md + '\n' + t.slice(t.indexOf(B))); console.log('topic file updated'); }
  else console.log('markers not found; wrote out/lc_json.md only');
  console.log('legacy:', LEG ? 'included' : 'not yet (run lm_legacy_fit c172s --json > out/lc_legacy.json)');
}
