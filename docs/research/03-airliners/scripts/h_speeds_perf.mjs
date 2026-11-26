// h_speeds_perf.mjs — หัวข้อ 3.4 (A330-300): หน่วย, CLmax จากจุดยึด, ตาราง VS1g/VLS/VAPP, V2, approach category,
// TOFL/LFL (scaling), แรงดันยาง (ประมาณ), LEMAC (ประมาณ), wake Γ0. รัน: node h_speeds_perf.mjs (Node >= 18)
// ทุกค่าที่พิมพ์เป็นค่าประมาณ (est) ยกเว้นการแปลงหน่วยของค่าจากแหล่ง
const g = 9.80665, KT = 0.514444, LB = 0.45359237, FT = 0.3048, PSI = 6894.757, rho0 = 1.225;
const f = (x, d = 3) => +x.toFixed(d);
export const S = 361.6, b = 60.3, MAC = 7.27;          // OpenAP/FlightGear S, Airbus span, EASA TCDS MAC (A330-200 section)
const S_jenk = 363.1;                                  // Jenkinson
const CLof = (m, Vkt, s = S, rho = rho0) => m * g / (0.5 * rho * (Vkt * KT) ** 2 * s);
const Vof = (m, CL, s = S, rho = rho0) => Math.sqrt(2 * m * g / (rho * s * CL)) / KT;
// ── 1. จุดยึด CLmax ──
console.log('== 1. anchors ==');
const CLapp_j = CLof(179000, 136), CLv2_j = CLof(217000, 144);
console.log('Jenkinson Vapp 136 kt @179 t: CL =', f(CLapp_j), ' -> if Vapp=VLS=1.23VS1g: CLmax_FULL =', f(CLapp_j * 1.23 ** 2), '; if Vapp=VLS+5:', f(CLof(179000, 131) * 1.23 ** 2),
  '; Jenkinson CLmax_LDG 2.73 (S 363.1) -> S 361.6:', f(2.73 * S_jenk / S), '; CL@Vapp*1.3^2 =', f(CLof(179000, 136, S_jenk) * 1.69));
console.log('Jenkinson V2 144 kt @217 t: CL =', f(CLv2_j), ' -> V2=1.13VS1g: CLmax_TO =', f(CLv2_j * 1.13 ** 2), '; CL@V2*1.2^2 (S 363.1) =', f(CLof(217000, 144, S_jenk) * 1.44), '(Jenkinson 2.51)');
const CLv2_tsb = CLof(222700, 162);
console.log('TSB C-GHLM V2 162 kt @222.7 t CONF1+F: CL@V2 =', f(CLv2_tsb), ' -> lower bound CLmax(1+F) = CL*1.13^2 =', f(CLv2_tsb * 1.13 ** 2), '; VR 157 kt CL =', f(CLof(222700, 157)));
const VATmax = 141, CLcatC = CLof(187000, VATmax / 1.23);
console.log('ICAO cat C (VAT<141 kt, VAT=1.23VSR @MLW 187 t): CLmax_FULL >', f(CLcatC));
// ── 2. ตาราง CLmax ที่เลือก ──
export const CLMAX = { CONF0: 1.26, CONF1: 1.80, 'CONF1+F': 2.10, CONF2: 2.24, CONF3: 2.32, FULL: f(CLapp_j * 1.23 ** 2, 2) };
console.log('\n== 2. chosen CLmax (1-g, S 361.6) ==', CLMAX, ' clean via A320 1.316*cos29.7/cos25 =', f(1.316 * Math.cos(29.7 * Math.PI / 180) / Math.cos(25 * Math.PI / 180)));
// ── 3. VS1g / VLS / VAPP ──
const masses = [130000, 150000, 170000, 187000, 210000, 242000];
console.log('\n== 3. VS1g (kt CAS, ISA SL, CAS=EAS) ==');
const tab = {};
for (const c of Object.keys(CLMAX)) { tab[c] = masses.map(m => f(Vof(m, CLMAX[c]), 1)); console.log(c.padEnd(8), tab[c].join('  ')); }
console.log('masses', masses.join(' '));
console.log('VLS FULL (1.23):', masses.map(m => f(1.23 * Vof(m, CLMAX.FULL), 1)).join(' '), '\nVLS CONF3 (1.23):', masses.map(m => f(1.23 * Vof(m, CLMAX.CONF3), 1)).join(' '));
console.log('VAPP FULL = VLS+5:', masses.map(m => f(1.23 * Vof(m, CLMAX.FULL) + 5, 1)).join(' '));
const VLS187 = 1.23 * Vof(187000, CLMAX.FULL);
console.log('VAT @MLW 187 t =', f(VLS187, 1), 'kt -> category', VLS187 < 141 ? 'C' : 'D', '; margin', f(141 - VLS187, 1), 'kt; @179 t VLS', f(1.23 * Vof(179000, CLMAX.FULL), 1));
// ── 4. takeoff typical @242 t ISA SL ──
const VS1F = Vof(242000, CLMAX['CONF1+F']), VS2 = Vof(242000, CLMAX.CONF2), VS3 = Vof(242000, CLMAX.CONF3);
console.log('\n== 4. takeoff 242 t ==', { VS1g_1F: f(VS1F, 1), V2min_1F: f(1.13 * VS1F, 1), VS1g_2: f(VS2, 1), V2min_2: f(1.13 * VS2, 1), VS1g_3: f(VS3, 1), V2min_3: f(1.13 * VS3, 1) });
console.log('scale TSB ratio V2/VS1g(1+F) @222.7 t =', f(162 / Vof(222700, CLMAX['CONF1+F']), 3), '; VR/V2 =', f(157 / 162, 3));
const V2_242 = 1.13 * VS2 * 1.03; console.log('V2 typical CONF2 (1.13*1.03 VS1g) =', f(V2_242, 1), ' VR = V2-5 =', f(V2_242 - 5, 1));
// ── 5. TOFL / LFL scaling ──
console.log('\n== 5. field lengths ==');
const T_cf6 = 300.0, T_trent = 316.3;                   // kN per engine: Jenkinson CF6-80E1A2; Trent 772B-60 net (หัวข้อ 6)
const TOFL242 = 2320 * (242 / 217) ** 2 * (T_cf6 / T_trent);
const raymer = (m, T, CLto) => { const WS = m / S * LB ** -1 * FT ** 2, TW = 2 * T * 1000 / (m * g); return 37.5 * WS / (CLto / 1.21 * TW) * FT; };
const r217 = raymer(217000, T_cf6, CLMAX.CONF2), r242 = raymer(242000, T_trent, CLMAX.CONF2);
console.log('TOFL scale W^2/T from Jenkinson 2320 m @217 t:', f(TOFL242, 0), 'm =', f(TOFL242 / FT, 0), 'ft; Raymer TOP raw 217t', f(r217, 0), '242t', f(r242, 0), '; calibrated', f(2320 * r242 / r217, 0));
const LFL187 = 1600 * 187 / 179; console.log('LFL scale W from Jenkinson 1600 m @179 t ->187 t:', f(LFL187, 0), 'm =', f(LFL187 / FT, 0), 'ft; actual = LFL/1.667:', f(LFL187 / 1.667, 0), 'm; @179 t actual', f(1600 / 1.667, 0));
const Vtd = 1.23 * Vof(187000, CLMAX.FULL) - 3; console.log('ground roll check: Vtd (VLS-3) =', f(Vtd, 1), 'kt; decel for 0.6*LFL/1.667 roll? distance at 1.7/3.0 m/s2:', f((Vtd * KT) ** 2 / (2 * 1.7), 0), f((Vtd * KT) ** 2 / (2 * 3.0), 0), 'm');
// ── 6. tyre pressure estimate ──
const perTyre = 242900 * 0.94 / 8 / LB;      // lb, MRW, 94 % on main gear (est)
console.log('\n== 6. tyre ==', { perTyre_lb: f(perTyre, 0), perTyre_kN: f(perTyre * LB * g / 1000, 1), p_est_psi: f(223 * perTyre / 68500, 1), p_est_kPa: f(223 * perTyre / 68500 * PSI / 1000, 0), p_est_bar: f(223 * perTyre / 68500 * PSI / 1e5, 2), rated_load_kN_54x21: f(68500 * LB * g / 1000, 1), rated_p_kPa: f(223 * PSI / 1000, 0), speed_rating_mps: f(235 * 0.44704, 2), gs_limit_mps: f(204 * KT, 2), OD_m: f(1400 / 1000, 3), width_m: 0.53, nose_OD_m: 1.05, nose_w_m: 0.395 });
// ── 7. LEMAC (est, consistent with หัวข้อ 5 ref CG STA 30.77 m) ──
const cgRef = 30.77; console.log('\n== 7. LEMAC_STA =', f(cgRef - 0.25 * MAC, 3), ' (CG25 ที่ 30.77 m STA); HT c/4 STA =', f(cgRef + 28.6, 2), ' VT c/4 STA =', f(cgRef + 27.5, 2), '; datum(-200) 6.382 m หน้าจมูก');
// ── 8. wake ──
const b0 = Math.PI / 4 * b;
const wake = (m, Vkt, rho) => { const G = m * g / (rho * Vkt * KT * b0); return { Gamma0: f(G, 1), w0: f(G / (2 * Math.PI * b0), 3) }; };
const Vapp187 = VLS187 + 5, rhoHot = 101325 / (287.053 * (273.15 + 35));
console.log('\n== 8. wake ==', { b0: f(b0, 2), Vapp187: f(Vapp187, 1), ISA: wake(187000, Vapp187, rho0), DMK_35C: wake(187000, Vapp187, rhoHot), rhoHot: f(rhoHot, 4), MTOW_V2_ISA: wake(242000, V2_242, rho0) });
// ── 9. units ──
console.log('\n== 9. units ==', { MTOW_lb: f(242000 / LB, 0), MLW_lb: f(187000 / LB, 0), fuel_kg: f(97530 * 0.785, 0), S_ft2: f(S / FT ** 2, 0), MAC_in: f(MAC / 0.0254, 1), AR: f(b * b / S, 3), AR_jenk: f(58 * 58 / 363.1, 3), VMO_mps: f(330 * KT, 2), VFE: { CONF1: 240, 'CONF1+F': 215, CONF2: 196, CONF3: 186, FULL: 180 }, VLE_mps: f(250 * KT, 2), ceiling_ft: f(12500 / FT, 0), qf72_CAS_kt: 270 });
