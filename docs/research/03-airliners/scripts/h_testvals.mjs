// h_testvals.mjs — หัวข้อ 3.4 (A330-300): คำนวณผลคาดหวังของกรณีทดสอบ T-H-xx จากค่าใน h_json_out.md
// รัน: node h_testvals.mjs  (อ่าน JSON ที่ h_json.mjs สร้าง เพื่อให้ผลคาดหวังสอดคล้องกับค่าพารามิเตอร์ที่เสนอ)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const J = JSON.parse(readFileSync(join(here, 'h_json_out.md'), 'utf8')).a330_300;
const g = 9.80665, KT = 0.514444, FT = 0.3048, D2R = Math.PI / 180, rho0 = 1.225, LB = 0.45359237;
const f = (x, d = 2) => +x.toFixed(d);
const S = J.aero.ref.S.v, b = J.aero.ref.b.v, c = J.aero.ref.c.v;
const CLMAX = J.aero.static_long.CLmax_target.v, CL0 = J.aero.static_long.CL0.v, ASTAR = J.aero.static_long.alpha_star.v;
const CLa = J.aero.static_long.CLalpha.v.M0p21, CLa_deg = CLa * D2R;
const det = Object.fromEntries(J.aero.flaps.detents.v.map(d => [d.name, d]));
const K = J.aero.polar.K_by_flap.v, CD0 = J.aero.polar.CD0_clean.v, dCDg = J.aero.gear_drag.dCD0.v;
const vs = (m, cl, rho = rho0) => Math.sqrt(2 * m * g / (rho * S * cl)) / KT;
const CD = (conf, CL, gear) => CD0 + det[conf].dCD0 + K[conf] * CL * CL + (gear ? dCDg : 0);
const out = {};

// T-H-01 VS1g FULL 187 t, T-H-02 VLS FULL 179 t (Jenkinson Vapp 136 kt), T-H-03 VLS/VAPP @MLW และ category C
out['T-H-01 VS1g FULL 187t kt'] = f(vs(187000, CLMAX.FULL), 1);
out['T-H-01b VS1g CONF0 187t kt'] = f(vs(187000, CLMAX.CONF0), 1);
out['T-H-02 VLS FULL 179t kt'] = f(1.23 * vs(179000, CLMAX.FULL), 1);
const VLS187 = 1.23 * vs(187000, CLMAX.FULL);
out['T-H-03 VLS FULL 187t kt'] = f(VLS187, 1);
out['T-H-03 VAPP FULL 187t kt (VLS+5)'] = f(VLS187 + 5, 1);
out['T-H-03 approach cat (VAT=1.23VSR<141 -> C)'] = VLS187 < 141 ? 'C' : 'D';

// T-H-04 V2min CONF2/CONF1+F ที่ 242 t
out['T-H-04 V2min CONF2 242t kt'] = f(1.13 * vs(242000, CLMAX.CONF2), 1);
out['T-H-04 V2min CONF1+F 242t kt'] = f(1.13 * vs(242000, CLMAX['CONF1+F']), 1);
out['T-H-04 TSB V2/VS1g(1+F) @222.7t'] = f(162 / vs(222700, CLMAX['CONF1+F']), 3);

// T-H-05 trim approach FULL 187 t VAPP, γ −3°, ISA SL (โมเดล per-CONF เชิงเส้น ไม่มีแรงขับเข้า lift)
{ const m = 187000, V = (VLS187 + 5) * KT, q = 0.5 * rho0 * V * V, CL = m * g * Math.cos(3 * D2R) / (q * S);
  const al = (CL - CL0.FULL) / CLa_deg, Cd = CD('FULL', CL, true), T = q * S * Cd - m * g * Math.sin(3 * D2R);
  out['T-H-05 approach'] = { CL: f(CL, 3), alpha_deg: f(al, 2), theta_deg: f(al - 3, 2), L_D: f(CL / Cd, 2), T_total_kN: f(T / 1000, 1), sink_fpm: f(V * Math.sin(3 * D2R) / 0.00508, 0) }; }

// T-H-06 cruise QF72: 185,280 kg, FL370, M0.82 → CL และ α ด้วย CL0/β กับ CLα(M) จากตาราง
{ const T0 = 288.15 - 0.0065 * 11000, Tt = 216.65, p11 = 22632.06; // FL370 = 11,277.6 m ในชั้น stratosphere
  const h = 37000 * FT, p = p11 * Math.exp(-g * (h - 11000) / (287.053 * Tt)), rho = p / (287.053 * Tt), a = Math.sqrt(1.4 * 287.053 * Tt);
  const V = 0.82 * a, q = 0.5 * rho * V * V, CL = 185280 * g / (q * S);
  const tab = J.aero.mach.CLalpha_vs_Mach.v, i = tab.axes.mach.indexOf(0.82), CLaM = tab.data[i];
  const beta = Math.sqrt(1 - 0.82 ** 2), CL0M = CL0.CONF0 / beta;
  const al = (CL - CL0M) / (CLaM * D2R);
  out['T-H-06 cruise QF72'] = { rho: f(rho, 4), TAS_kt: f(V / KT, 1), q_Pa: f(q, 0), CL: f(CL, 3), CL0_M: f(CL0M, 3), alpha_deg: f(al, 2), CD: f(CD0 + K.CONF0 * CL * CL + 0.0002, 4), drag_kN: f(q * S * (CD0 + K.CONF0 * CL * CL + 0.0002) / 1000, 1), unusedT0: f(T0, 2) }; }

// T-H-07 TSB lift-off (CONF1+F, 221.2 t, 152 kt, θ 13.7°): CL ที่ต้องการเทียบกับ CL ของโมเดล
{ const q = 0.5 * rho0 * (152 * KT) ** 2, CLreq = 221200 * g / (q * S), CLmod = CL0['CONF1+F'] + CLa_deg * 13.7;
  const CLaFlap = (CL0['CONF1+F'] + CLa_deg * ASTAR['CONF1+F']);
  out['T-H-07 TSB liftoff'] = { CL_req_noThrust: f(CLreq, 3), CL_model_freeair_13p7: f(CLmod, 3), ratio: f(CLmod / CLreq, 3), CL_lin_at_alphaStar: f(CLaFlap, 3) }; }

// T-H-08 legacy blend (AC เดิม, M = 55): CLmax ที่ flaps 0 และ 1 นอก ground effect
{ const L = J.aero.legacy.v;
  const blendMax = (CL0x, a0deg) => { const a0 = a0deg * D2R; let best = 0, at = 0; for (let ad = 0; ad <= 40; ad += 0.01) { const a_ = ad * D2R, e1 = Math.exp(-55 * (a_ - a0)), e2 = Math.exp(55 * (a_ + a0)); const sig = (1 + e1 + e2) / ((1 + e1) * (1 + e2)); const CLv = (1 - sig) * (CL0x + L.CLa * a_) + sig * 2 * Math.sin(a_) ** 2 * Math.cos(a_); if (CLv > best) { best = CLv; at = ad; } } return [f(best, 3), f(at, 2)]; };
  out['T-H-08 legacy CLmax/alpha flaps0'] = blendMax(L.CL0, L.aStall);
  out['T-H-08 legacy CLmax/alpha flaps1'] = blendMax(L.CL0 + L.CLflap, L.aStall + L.aStallFlap);
  out['T-H-08 legacy CLmax flaps0.563 (CONF2)'] = blendMax(L.CL0 + L.CLflap * 0.563, L.aStall + L.aStallFlap * 0.563); }

// T-H-09 phugoid เทียบ Lanchester T = π √2 V / g
out['T-H-09 Lanchester approach 144 kt s'] = f(Math.PI * Math.SQRT2 * (VLS187 + 5) * KT / g, 1);
out['T-H-09 model phugoid approach s'] = J.validation.reference_modes.est_approach_FULL_187t.v.ph_T_s;

// T-H-11 wake Γ0 = m g/(ρ V b0), b0 = π b/4
{ const b0 = Math.PI * b / 4, G0 = 187000 * g / (rho0 * (VLS187 + 5) * KT * b0);
  out['T-H-11 wake'] = { b0: f(b0, 2), Gamma0: f(G0, 1), w0: f(G0 / (2 * Math.PI * b0), 3), t_descent_1b0_s: f(b0 / (G0 / (2 * Math.PI * b0)), 1) }; }

// T-H-12 ยาง: ภาระต่อยางที่ MRW 242.9 t (ล้อหลักรับ 94 %, 8 ยาง) เทียบ rated 68,500 lb
{ const per = 242900 * 0.94 / 8 / LB; out['T-H-12 tyre'] = { per_tyre_lb: f(per, 0), load_ratio: f(per / 68500, 3) }; }

// T-H-13 strut สถิตด้วย k ของ FG
{ const km = J.gear.strut_main.k_linear.v, kn = J.gear.strut_nose.k_linear.v;
  for (const m of [187000, 242000]) out[`T-H-13 strut static ${m / 1000}t`] = { main_defl_m: f(m * g * 0.94 / 2 / km, 3), nose_defl_m: f(m * g * 0.06 / kn, 3), main_fn_Hz: f(Math.sqrt(km / (m * 0.94 / 2)) / (2 * Math.PI), 3) }; }

// T-H-14 Mcrit (Korn) และ CDwave
{ const L = 29.7 * D2R, tc = 0.11, mc = cl => 0.95 / Math.cos(L) - tc / Math.cos(L) ** 2 - 0.1 * cl / Math.cos(L) ** 3 - 0.108;
  const Mc = mc(0.5); out['T-H-14 Mcrit CL0.5'] = f(Mc, 3); out['T-H-14 CDw M0.86 CL0.5'] = f(20 * Math.max(0, 0.86 - Mc) ** 4, 5); out['T-H-14 CDw M0.82 CL0.5'] = f(20 * Math.max(0, 0.82 - Mc) ** 4, 5); }

// T-H-15 ระยะทางวิ่ง: TOFL สเกล W²/T, LFL สเกล W, landing actual = LFL/1.667; ground roll ที่ decel ต่าง ๆ
{ const tofl = 2320 * (242 / 217) ** 2 * (300 / 316.3), lfl = 1600 * 187 / 179;
  const Vtd = (VLS187 - 3) * KT; // ประมาณการแตะพื้นที่ VLS − 3 kt (ค่าประมาณ ใช้ใน h_speeds_perf.mjs)
  out['T-H-15 field'] = { TOFL_242t_m: f(tofl, 0), TOFL_ft: f(tofl / FT, 0), LFL_187t_m: f(lfl, 0), LFL_ft: f(lfl / FT, 0), actual_187t_m: f(lfl / 1.667, 0), Vtd_kt: f(Vtd / KT, 1), roll_at_1p7_m: f(Vtd ** 2 / (2 * 1.7), 0), roll_at_3p0_m: f(Vtd ** 2 / (2 * 3.0), 0) }; }

// T-H-16 OEI second segment gradient ที่ V2 CONF2 242 t (เกณฑ์ 25.121(b) twin 2.4 %) ใช้แรงขับ TO 316.3 kN ต่อเครื่อง
{ const CL = CLMAX.CONF2 / 1.13 ** 2, Cd = CD('CONF2', CL, false) + 0.005; // +0.005 windmill/asymmetric drag (ค่าประมาณ)
  const grad = 316300 / (242000 * g) - Cd / CL, gradNoExtra = 316300 / (242000 * g) - CD('CONF2', CL, false) / CL;
  out['T-H-16 OEI gradient %'] = { no_extra_drag: f(gradNoExtra * 100, 2), with_0p005_windmill: f(grad * 100, 2), CL: f(CL, 3) }; }

// T-H-17 inertia ที่ MLW
{ const I = J.airframe.inertia, r = I.radii.v, L_ = 63.66, e = (b + L_) / 2, m = 187000;
  out['T-H-17 inertia 187t'] = { Ixx: Math.round(m * (r.Rx * b / 2) ** 2 / 1e4) * 1e4, Iyy: Math.round(m * (r.Ry * L_ / 2) ** 2 / 1e4) * 1e4, Izz: Math.round(m * (r.Rz * e / 2) ** 2 / 1e4) * 1e4, json: [I.Ixx.v, I.Iyy.v, I.Izz.v] }; }

// T-H-18 ความเร็วจำกัดเทียบหน่วย
out['T-H-18 VMO m/s'] = f(J.speeds.VMO_kt.v * KT, 2); out['T-H-18 VFE FULL m/s'] = f(J.speeds.VFE.v.FULL * KT, 2);
out['T-H-18 VAPP < VFE FULL margin kt'] = f(J.speeds.VFE.v.FULL - (1.23 * vs(242000 * 0 + 187000, CLMAX.FULL) + 5), 1);

// T-H-19 ความหนาแน่นร้อน DMK 35 °C: VS1g TAS เพิ่มขึ้น
{ const rhoHot = 101325 / (287.053 * (273.15 + 35)); out['T-H-19 hot day'] = { rho: f(rhoHot, 4), VAPP_TAS_kt: f((VLS187 + 5) * Math.sqrt(rho0 / rhoHot), 1), GS_noWind_kt: f((VLS187 + 5) * Math.sqrt(rho0 / rhoHot), 1) }; }

for (const [k, v] of Object.entries(out)) console.log(k.padEnd(44), JSON.stringify(v));

// T-H-20 (ข้อเสนอ) ลดความหน่วงล้อหน้าให้ ζ 0.6 และตรวจ ζ ของล้อหลัก (ใช้ k ของ FG) ที่ 187 t
{ const km = J.gear.strut_main.k_linear.v, cm = J.gear.strut_main.c_linear.v, kn = J.gear.strut_nose.k_linear.v, cn = J.gear.strut_nose.c_linear.v;
  const mm = 187000 * 0.94 / 2, mn = 187000 * 0.06;
  out['T-H-20 gear damping 187t'] = { zeta_main_FG: f(cm / (2 * Math.sqrt(km * mm)), 3), zeta_nose_FG: f(cn / (2 * Math.sqrt(kn * mn)), 3), c_nose_for_zeta0p6: Math.round(0.6 * 2 * Math.sqrt(kn * mn)), c_main_for_zeta0p6: Math.round(0.6 * 2 * Math.sqrt(km * mm)) }; }
// T-H-21 RECAT-EU ระยะห่างตามหลัง A330 (leader CAT-B) ของแบบที่ DMK (ค่าจากตาราง ไม่ได้คำนวณ) + เวลาที่ 140 kt
{ const sep = { B: 3, C: 4, D: 4, E: 5, F: 7 }; out['T-H-21 RECAT-EU B-leader time @140kt s'] = Object.fromEntries(Object.entries(sep).map(([k, nm]) => [k, Math.round(nm * 1852 / (140 * KT))])); }
for (const k of ['T-H-20 gear damping 187t', 'T-H-21 RECAT-EU B-leader time @140kt s']) console.log(k.padEnd(44), JSON.stringify(out[k]));
