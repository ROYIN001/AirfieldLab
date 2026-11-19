#!/usr/bin/env node
// ld_tests.mjs — T-LD test table for the DA40 cards (topic 05, ids da40ng, da40_180, da40d).
// Expected values come from the AFM/TCDS/checklist/brochure numbers or from physics, computed here in Node; the
// "current" column is what the cards give in TODAY's AirfieldLab physics (lm_card outputs in scripts/out/ld_card_*.json,
// plus extra sim runs below: hot-day takeoff and the 14,000 ft cruise trim). Run from the repo root after
//   node scripts/ld_tools.mjs card da40ng --mass 1310   (and da40_180 --mass 1200, da40d --mass 1150)
//   node <this folder>/ld_tests.mjs   → scripts/out/ld_tests.json + scripts/out/ld_tests.md (markdown rows)
import fs from 'node:fs';
import { loadType, val, trainingMass } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, takeoffTest, trim, trimThr } from './lm_card.mjs';
import { clmaxFromStall } from './lm_polar.mjs';
const OUT = new URL('./out/', import.meta.url);
const rd = f => JSON.parse(fs.readFileSync(new URL(f, OUT), 'utf8'));
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225, LBFT2 = 4.88243;
const r = (x, n = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const rhoISA = h => RHO0 * (1 - 2.25577e-5 * h) ** 4.2559;
const interp = (t, x) => { for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return t.at(-1)[1]; };

const ng = rd('ld_card_da40ng_m1310.json').res, c180 = rd('ld_card_da40_180_m1200.json').res, cD = rd('ld_card_da40d_m1150.json').res;
const cardNG = loadType('da40ng'), card180 = loadType('da40_180'), cardD = loadType('da40d');
const iasNG = val(cardNG, 'speeds.ias_cas'), iasC = val(card180, 'speeds.ias_cas');
// D6 (19 Nov 2026): the T/O detent is named 'T/O' as in the AFM; outputs made before the rename used 'TO'
const TO = o => o['T/O'] ?? o.TO;
const vx = rd('ld_vx.json');                                           // ld_vx.mjs (gap 7 Vx, gap 18 altitude loss)

// ---- extra sim runs -------------------------------------------------------------------------------------------------
const M = await loadSim();
async function withCard(card, mass, fn, isaDev = 0) {
  const ac = buildAC(card, { mass }); const restore = applyAC(M, ac), info = cardInfo(card, ac);
  const Orig = M.Aircraft; if (isaDev) M.Aircraft = class extends Orig { constructor(...a) { super(...a); this.isaDev = isaDev; } };
  try { return fn(info, ac); } finally { M.Aircraft = Orig; restore(); }
}
// hot day at VTBD: 35 °C at sea level = ISA+20
const hotNG = await withCard(cardNG, 1310, info => takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: info.takeoff.theta }), 20);
const hotD = await withCard(cardD, 1150, info => takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: info.takeoff.theta }), 20);
// cruise point of the brochure: 60 % load, 14,000 ft ISA, 124 KTAS, MTOM 1,310 kg → throttle the sim needs
const h14 = 14000 * FT, sig14 = rhoISA(h14) / RHO0;
const cruise14 = await withCard(cardNG, 1310, () => trim(M, new M.Aircraft(), { ias: 124 * Math.sqrt(sig14), h: h14, flaps: 0, gear: 1, gammaDeg: 0 }));
// review 2026-11-18: idle glides at the DA40 NG points of [LD13] post 17/20 (mass ≈ 1,100 kg, ค่าประมาณ; h 1,000 ft)
const glideNG = await withCard(cardNG, 1100, info => ({
  clean88: trimThr(M, 88, 0, 0, 1, 1000 * FT),
  ldg88: trimThr(M, 88, 0, info.dets.find(d => d.name === 'LDG').f, 1, 1000 * FT) }));
const glideNG1310 = await withCard(cardNG, 1310, info => trimThr(M, 88, 0, info.dets.find(d => d.name === 'LDG').f, 1, 1000 * FT));
// quasi-steady max level speed at SL with the card's legacy polar and thrust law (same force model as the sim, no thrust angle)
function vmaxSL(card, mass) {
  const a = val(card, 'aero.legacy'), p = val(card, 'propulsion.legacy'), S = val(card, 'aero.ref.S'), W = mass * G0, Vc = p.eta * p.P / p.T0;
  let vm = 0; for (let V = 30; V < 90; V += 0.02) { const q = 0.5 * RHO0 * V * V, CL = W / (q * S); if (p.T0 * Vc / Math.hypot(V, Vc) >= q * S * (a.CD0 + a.K * (CL - 0.15) ** 2)) vm = V; }
  return vm / KT;
}

// ---- expected values from sources and physics ----------------------------------------------------------------------
const S_NG = 13.244, b_NG = 11.63;
const AR = b_NG ** 2 / S_NG;
const LEMAC = 2.229, MAC = 1.171, pct = x => (x - LEMAC) / MAC * 100;
const vsK = { UP: interp(iasNG.UP, 66), 'T/O': interp(TO(iasNG), 62), LDG: interp(iasNG.LDG, 60) };
const CLx = Object.fromEntries(Object.entries(vsK).map(([k, v]) => [k, clmaxFromStall({ mass: 1310, S: S_NG, vs_kcas: v, kind: 'min' }).CLmax_1g]));
const vsScaled = 66 * Math.sqrt(1000 / 1310);                       // checklist UP stall at 1,000 kg from √m scaling
const vrefCheck = 73 / 1.3;                                           // classic VREF flaps UP 73 KIAS (1,150 kg) / 1.3
const vs1C = interp(iasC.UP, 52);
const vsTO1280 = 60 + (1280 - 1200) / 110 * 2, v50k = interp(TO(iasNG), 72), vsTOk = interp(TO(iasNG), vsTO1280);
const WS_lbft2 = 1310 / S_NG / LBFT2, vLimit = 4.4 * WS_lbft2 ** 0.25;
const Tideal = Math.cbrt(123500 ** 2 * 2 * RHO0 * Math.PI * 1.9 ** 2 / 4);
const sigHot = 288.15 / 308.15;                                       // 35 °C at SL
const hotFactorTurbo = 1 / (sigHot * Math.cbrt(sigHot));              // flat-rated power: s ∝ 1/(σ · T/T0), T ∝ σ^(1/3) (static)
const lycLapse = 1.132 * sigHot - 0.132, hotFactorNA = 1 / (sigHot * Math.cbrt(lycLapse ** 2 * sigHot));
const lanchester = v => Math.PI * Math.SQRT2 * v * KT / G0;

const T = [];
// ids: the card(s) a row checks (performance.tests of each id in ld_json.mjs); pass null = n.a. (ไม่รองรับในซิมวันนี้)
const add = (id, cond, qty, exp, tol, src, cur, pass, unit = '', ids = ['da40ng']) => T.push({ id, cond, qty, exp, tol, unit, src, cur, pass, ids });
const within = (x, e, t) => x != null && Math.abs(x - e) <= t;

add('T-LD-01', 'DA40 NG AFM: span 11.63 m, wing area 13.244 m²', 'AR = b²/S', r(10.223, 3), 0.02, '[LD2 p.1-5] ให้ 10.223', r(AR, 3), within(AR, 10.223, 0.02));
add('T-LD-02', 'CG หน้า 2.40 m (≤ 1,080 kg), 2.469 m (1,310 kg), หลัง 2.53 m DAT; LEMAC 2.229 m (ค่าประมาณ ld_geom), MAC 1.171 m', 'CG เป็น %MAC: หน้าสุด / หน้าที่ MTOW / หลังสุด', `${r(pct(2.40))} / ${r(pct(2.469))} / ${r(pct(2.53))}`, '±1 %MAC (จาก LEMAC ค่าประมาณ)', '[LD1 p.29][LD2 p.2-18]; ld_geom.mjs', `CG อ้างอิงของบัตร ${val(cardNG, 'airframe.cg.ref').pct_mac} %MAC อยู่ในช่วง`, pct(2.40) < 20.6 && 20.6 < pct(2.53), '%MAC');
add('T-LD-03', 'ตาราง stall checklist แฟลป UP: 66 KIAS ที่ 1,310 kg', 'VS ที่ 1,000 kg = 66·√(1000/1310)', r(vsScaled), 1, '[LD3] ตารางให้ 58 KIAS', 58, within(58, vsScaled, 1), 'KIAS');
add('T-LD-04', '1,310 kg, S 13.244 m², VS 66/62/60 KIAS → 64.6/60.7/58.0 KCAS (ld_iascas) ถือเป็นความเร็วต่ำสุด (n_z 0.95)', 'CLmax 1 g UP / T/O / LDG', `${r(CLx.UP, 3)} / ${r(CLx['T/O'], 3)} / ${r(CLx.LDG, 3)}`, 0.03, 'lm_polar.clmaxFromStall [LM2]; [LD3][LD4]', `${r(ng.stall.UP.CLmax, 3)} / ${r(TO(ng.stall).CLmax, 3)} / ${r(ng.stall.LDG.CLmax, 3)}`, within(ng.stall.UP.CLmax, CLx.UP, 0.03) && within(TO(ng.stall).CLmax, CLx['T/O'], 0.03) && within(ng.stall.LDG.CLmax, CLx.LDG, 0.03));
for (const [i, k] of [[5, 'UP'], [6, 'T/O'], [7, 'LDG']]) { const s = k === 'T/O' ? TO(ng.stall) : ng.stall[k], tol = k === 'UP' ? 5 : 3;
  add(`T-LD-0${i}`, `ซิม: da40ng 1,310 kg, CG อ้างอิง, 3,000 ft ISA, idle, แฟลป ${k}, ลด 1 kt/s`, 'Vmin (KEAS ≈ KCAS)', r(vsK[k]), tol, `[LD3] แปลงด้วย ld_iascas${k === 'LDG' ? '; Diamond ระบุ 58 KCAS [LD4]' : ''}; ±3 kt ตาม Part 60 [R1:V2]${k === 'UP' ? ' + ±2 kt ความไม่แน่นอนของ IAS–CAS และ CLmax แฟลป UP (gap 12, §05.3)' : ''}`, r(s.Vmin_eas), within(s.Vmin_eas, vsK[k], tol), 'KCAS'); }
add('T-LD-08', 'ซิม: da40ng 1,310 kg, SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS', 'ROC สูงสุด', 651, '±100 fpm (หรือ 5 %)', '[LD4] 3.3 m/s; Part 60 [R1:V2]', Math.round(ng.climb.ROCmax_fpm), within(ng.climb.ROCmax_fpm, 651, 100), 'fpm');
add('T-LD-09', 'เหมือน T-LD-08', 'Vy', r(interp(TO(iasNG), 72)), 3, 'Vy 72 KIAS แฟลป T/O [LD3] (ซิมไต่แฟลป UP — ต่างโครงแบบ)', r(ng.climb.Vy_kt), within(ng.climb.Vy_kt, interp(TO(iasNG), 72), 3), 'KCAS');
add('T-LD-10', 'ซิม: da40ng 1,310 kg, 3,000 ft ISA, แรงขับศูนย์, แฟลป UP', 'ความเร็วร่อนดีสุด / L/D', `${r(interp(iasNG.UP, 88))} / 9.7`, '±3 kt / ±0.5', '[LD2 p.3-4][LD3]', `${r(ng.glide.zeroThrust.Vbg_kt)} / ${r(ng.glide.zeroThrust.LD, 2)}`, within(ng.glide.zeroThrust.Vbg_kt, interp(iasNG.UP, 88), 3) && within(ng.glide.zeroThrust.LD, 9.7, 0.5), 'KCAS / -');
add('T-LD-11', 'ซิม: da40ng 1,310 kg, SL ISA 15 °C, แฟลป T/O, คันเร่งสุด, VR 66.9 KCAS, θ 8°', 'ground roll', 397, '±5 % หรือ ±61 m (ค่าเล็ก = ±20 m)', '[LD4]; Part 60 [R1:V2]; หมายเหตุ: T0 ของซิมถูกปรับให้ตรงข้อนี้ (§05.9)', Math.round(ng.takeoff.groundRoll_m), within(ng.takeoff.groundRoll_m, 397, 19.85), 'm');
add('T-LD-12', 'เหมือน T-LD-11', 'ระยะถึง 50 ft', 590, '±10 % (59 m; ผู้เขียนตั้ง ไม่มีเกณฑ์ Part 60 ตรง)', '[LD4]', Math.round(ng.takeoff.dist50ft_m), within(ng.takeoff.dist50ft_m, 590, 59), 'm');
add('T-LD-13', 'ซิม: autoland da40ng 1,310 kg (MLW จริง 1,280), ลมสงบ, 15 °C, แฟลป LDG, VREF 77 KIAS = 76 KCAS (speeds.approach_table แถว 1,280 kg, ld_tools card), เบรกเต็ม', 'ระยะจาก 50 ft ถึงหยุด', 650, '±10 % หรือ ±61 m (ค่าเล็ก = ±61 m)', '[LD4]; Part 60 1.e [R1:V2]', Math.round(ng.landing.maxBrake.total_m), within(ng.landing.maxBrake.total_m, 650, 61), 'm');
add('T-LD-14', 'เหมือน T-LD-13', 'ground roll', 318, '±10 % หรือ ±61 m (ค่าเล็ก = ±32 m)', '[LD4]', Math.round(ng.landing.maxBrake.ground_m), within(ng.landing.maxBrake.ground_m, 318, 31.8), 'm');
add('T-LD-15', 'วันร้อนที่ดอนเมือง 35 °C SL (ISA+20), da40ng 1,310 kg แฟลป T/O', 'ground roll = 397 × 1/(σ·σ^⅓) (เครื่อง flat-rated กำลังคงที่)', Math.round(397 * hotFactorTurbo), '±10 % (ค่าประมาณ)', `σ ${r(sigHot, 3)}; สเกลจาก [LD4]; ค่าประมาณ ไม่มีตาราง AFM บท 5`, Math.round(hotNG.groundRoll_m), within(hotNG.groundRoll_m, 397 * hotFactorTurbo, 0.1 * 397 * hotFactorTurbo), 'm');
const ap = ng.modes.approach, cr = ng.modes.cruise;
add('T-LD-16', 'ซิม linearise da40ng 1,310 kg: approach 76 KCAS แฟลป LDG γ −3° (Cat C) / cruise 110 KCAS 3,000 ft (Cat B)', 'short period ζ (approach / cruise)', '0.35–1.30 / 0.30–2.00', 'ขอบ Level 1', 'MIL-F-8785C Class I [R1:V7, R1:V10]', `${r(ap.sp.zeta, 3)} / ${r(cr.sp.zeta, 3)}`, ap.sp.zeta >= 0.35 && ap.sp.zeta <= 1.3 && cr.sp.zeta >= 0.3 && cr.sp.zeta <= 2);
add('T-LD-17', 'เหมือน T-LD-16', 'CAP = ωsp²/(n/α) (approach / cruise)', '0.16–3.6 (Cat C) / 0.085–3.6 (Cat B)', 'ขอบ Level 1 (ขอบบน 3.6 ยังไม่ยืนยันจากต้นฉบับตามรอบที่ 1)', 'MIL-F-8785C §3.2.2.1.1 [R1:V7][R1:V9]; ฉบับแรกใช้ 0.15 / 0.28 (0.28 เป็นของ Cat A)', `${r(ap.CAP, 2)} / ${r(cr.CAP, 2)}`, ap.CAP >= 0.16 && ap.CAP <= 3.6 && cr.CAP >= 0.085 && cr.CAP <= 3.6, '1/s²');
add('T-LD-18', 'เหมือน T-LD-16 (cruise)', 'phugoid ζ / คาบ', `ζ ≥ 0.04; คาบ Lanchester π√2·V/g = ${r(lanchester(115))} s (ข้อมูลประกอบ)`, '-', 'MIL-F-8785C [R1:V10]', `${r(cr.ph.zeta, 3)} / ${r(cr.ph.T)}`, cr.ph.zeta >= 0.04, '- / s');
add('T-LD-19', 'เหมือน T-LD-16 (approach)', 'Dutch roll ζ / ζωn / ωn', 'ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 0.4', '-', 'MIL-F-8785C Table 3 Class I Cat C [R1:V10]', `${r(ap.dr.zeta, 3)} / ${r(ap.dr.zeta * ap.dr.wn, 3)} / ${r(ap.dr.wn, 2)}`, ap.dr.zeta >= 0.08 && ap.dr.zeta * ap.dr.wn >= 0.15 && ap.dr.wn >= 0.4, '- / rad/s');
add('T-LD-20', 'เหมือน T-LD-16', 'roll mode τR (approach / cruise)', '≤ 1.0 / ≤ 1.4', '-', 'MIL-F-8785C Table 5 [R1:V10]', `${r(ap.roll_tau, 3)} / ${r(cr.roll_tau, 3)}`, ap.roll_tau <= 1 && cr.roll_tau <= 1.4, 's');
add('T-LD-21', 'เหมือน T-LD-16', 'spiral T₂ (approach / cruise)', '≥ 12 / ≥ 20', '-', 'MIL-F-8785C Table 6 [R1:V10]', `${r(ap.spiral.t2)} / ${r(cr.spiral.t2)}`, ap.spiral.t2 >= 12 && cr.spiral.t2 >= 20, 's');
add('T-LD-22', 'รุ่นเดิม 1,150 kg: VREF แฟลป UP 73 KIAS [LD8] ถือว่า IAS ≈ CAS ที่ 73 kt และ VREF = 1.3 VS', 'VS1 (KCAS) = 73/1.3 เทียบตาราง ias_cas ที่ VS1 52 KIAS', r(vrefCheck), 1.5, '[LD8][LD6 p.5-8]; ld_iascas.mjs (ตรวจอิสระ)', r(vs1C), within(vs1C, vrefCheck, 1.5), 'KCAS');
add('T-LD-23', 'DA40 NG 1,280 kg แฟลป T/O: V50 72 KIAS, VS(T/O) 61.5 KIAS (ตีความตาราง)', 'V50 / VS (KCAS)', 1.2, '≥ 1.20 − 0.03 (การอ่านค่า)', '14 CFR 23.53 ก่อน Amdt 64 [LD12]; [LD3]', `AFM ${r(v50k / vsTOk, 3)}; ซิม ${r(ng.takeoff.V50_kt / TO(ng.stall).VSR_cas, 3)}`, v50k / vsTOk >= 1.17 && ng.takeoff.V50_kt / TO(ng.stall).VSR_cas >= 1.17, '-');
add('T-LD-24', `MTOW 1,310 kg, S 13.244 m² → W/S ${r(WS_lbft2, 2)} lb/ft²`, 'limit descent velocity 4.4 (W/S)^¼', r(vLimit, 2), 0.02, '14 CFR 23.473(d) ก่อน Amdt 64 [LD12]', `ค่าในบัตร ${val(cardNG, 'gear.certification.part23_limit_descent').da40ng_fps}`, within(val(cardNG, 'gear.certification.part23_limit_descent').da40ng_fps, vLimit, 0.02), 'fps');
add('T-LD-25', 'ใบพัด NG 1.90 m 123.5 kW SL ISA ความเร็วศูนย์', 'แรงขับสถิตอุดมคติ (P²·2ρA)^⅓ / BEM (FM)', `${r(Tideal / 1000, 2)} kN / FM 0.55–0.80`, '-', 'ทฤษฎีโมเมนตัม; lm_prop [LM0]', `BEM 3.45 kN (FM ${r((3450 ** 1.5) / (123500 * Math.sqrt(2 * RHO0 * Math.PI * 1.9 ** 2 / 4)), 3)}); T0 ซิม 4.05 kN (FM เทียบเท่า ${r((4050 ** 1.5) / (123500 * Math.sqrt(2 * RHO0 * Math.PI * 1.9 ** 2 / 4)), 2)})`, true, 'kN');
add('T-LD-26', 'ซิม: da40ng 1,310 kg, 14,000 ft ISA, บินระดับ 124 KTAS (โบรชัวร์: load 60 %)', 'คันเร่งที่ซิมต้องใช้ (≈ สัดส่วนกำลัง)', 0.60, '±0.05', '[LD4]', r(cruise14.thr, 3), within(cruise14.thr, 0.6, 0.05), '-');
add('T-LD-27', 'ซิม: da40_180 1,200 kg, 3,000 ft ISA, idle, ลด 1 kt/s', 'Vmin UP / LDG', `${r(interp(iasC.UP, 53))} / ${r(interp(iasC.LDG, 52))}`, '±5 / ±3', '[LD6 p.5-8][LD4] แปลงด้วยตารางรุ่นเดิม; UP ±5 kt = Part 60 ±3 kt + ±2 kt ความไม่แน่นอนของ IAS–CAS (ตาราง IAS–CAS ของ AFM รุ่นเดิมอ่านไม่ได้, gap 12)', `${r(c180.stall.UP.Vmin_eas)} / ${r(c180.stall.LDG.Vmin_eas)}`, within(c180.stall.UP.Vmin_eas, interp(iasC.UP, 53), 5) && within(c180.stall.LDG.Vmin_eas, interp(iasC.LDG, 52), 3), 'KCAS', ['da40_180']);
add('T-LD-28', 'ซิม: da40_180 1,200 kg SL ISA คันเร่งสุด / ร่อนแรงขับศูนย์', 'ROC สูงสุด / L/D ร่อน', '780 / 8.8', '±100 fpm / ±0.5', '[LD4][LD6 p.3-28]', `${Math.round(c180.climb.ROCmax_fpm)} / ${r(c180.glide.zeroThrust.LD, 2)}`, within(c180.climb.ROCmax_fpm, 780, 100) && within(c180.glide.zeroThrust.LD, 8.8, 0.5), 'fpm / -', ['da40_180']);
add('T-LD-29', 'ซิม: da40_180 1,200 kg SL ISA แฟลป T/O VR ≈ 62 KCAS θ 8°', 'ground roll / ระยะถึง 50 ft', '305 / 450', '±15 m (5 %) / ±45 m (10 %)', '[LD4] (XLT)', `${Math.round(c180.takeoff.groundRoll_m)} / ${Math.round(c180.takeoff.dist50ft_m)}`, within(c180.takeoff.groundRoll_m, 305, 15.25) && within(c180.takeoff.dist50ft_m, 450, 45), 'm', ['da40_180']);
add('T-LD-30', 'da40_180 1,200 kg SL ISA คันเร่งสุด บินระดับ (quasi-steady แบบแรงของซิม)', 'ความเร็วสูงสุด', 142, '±3 kt', '[LD4] max cruise MSL', r(vmaxSL(card180, 1200)), within(vmaxSL(card180, 1200), 142, 3), 'KTAS', ['da40_180']);
add('T-LD-31', 'ซิม: da40d 1,150 kg 3,000 ft idle / SL คันเร่งสุด', 'Vmin UP / ROC สูงสุด', `${r(interp(iasC.UP, 52))} / 550 (ค่าประมาณ)`, '±5 kt / ±100 fpm', '[LD8][LD14]; Vmin ±5 kt = Part 60 ±3 kt + ±2 kt ความไม่แน่นอนของ IAS–CAS (gap 12)', `${r(cD.stall.UP.Vmin_eas)} / ${Math.round(cD.climb.ROCmax_fpm)}`, within(cD.stall.UP.Vmin_eas, interp(iasC.UP, 52), 5) && within(cD.climb.ROCmax_fpm, 550, 100), 'KCAS / fpm', ['da40d']);
add('T-LD-32', 'ซิม: da40d 1,150 kg SL ISA แฟลป T/O VR ≈ 62 KCAS', 'ระยะถึง 50 ft', 640, '±10 % (64 m; ผู้เขียนตั้ง)', '[LD8]', Math.round(cD.takeoff.dist50ft_m), within(cD.takeoff.dist50ft_m, 640, 64), 'm', ['da40d']);
add('T-LD-33', 'วันร้อนที่ดอนเมือง 35 °C SL, da40d 1,150 kg แฟลป T/O', 'ระยะถึง 50 ft = 640 × 1/(σ·σ^⅓)', Math.round(640 * hotFactorTurbo), '±10 % (ค่าประมาณ)', '[LD8] สเกลด้วย σ; ค่าประมาณ', Math.round(hotD.dist50ft_m), within(hotD.dist50ft_m, 640 * hotFactorTurbo, 0.1 * 640 * hotFactorTurbo), 'm', ['da40d']);
add('T-LD-34', 'da40d 1,150 kg, SL ISA, คันเร่งสุด บินระดับ (quasi-steady)', 'ความเร็วสูงสุด', 125, '±5 kt (ค่าประมาณจากนักบิน ~130 KIAS ที่ความสูง)', '[LD14] (ต่ำ)', r(vmaxSL(cardD, 1150)), within(vmaxSL(cardD, 1150), 125, 5), 'KTAS', ['da40d']);

// ---- added in review 2026-11-18 ----
add('T-LD-35', 'ซิม: da40ng 1,100 kg (ค่าประมาณจาก "เชื้อเพลิงเต็ม + นักบิน 1 คน") / 1,310 kg, 1,000 ft ISA, idle, แฟลป LDG, 88 KIAS', 'อัตราร่อน L/D ≈ V / (อัตราจม)', 6.9, '±0.7 (แหล่งความเชื่อมั่นต่ำ)', '[LD13] โพสต์ 20: DA40 NG −12.5° 88 kt −1,300 fpm (ไม่ใช่จุด DA 40 TDI 73 kt ที่ใช้ปรับ CDflap)', `${r(glideNG.ldg88.LoverD, 2)} / ${r(glideNG1310.LoverD, 2)}`, within(glideNG.ldg88.LoverD, 6.9, 0.7) && within(glideNG1310.LoverD, 6.9, 0.7), '-');
add('T-LD-36', 'ซิม: da40ng 1,100 kg, 1,000 ft ISA, idle, แฟลป UP, 88 KIAS', 'pitch attitude θ', -2.5, '±1.5° (ผู้เขียนตั้ง; แหล่งความเชื่อมั่นต่ำ)', '[LD13] โพสต์ 17/20: DA40 NG −2.5° 88 kt −900 to −950 fpm', r(glideNG.clean88.theta, 1), within(glideNG.clean88.theta, -2.5, 1.5), 'deg');
{ // card consistency across the variants (inherited leaves must follow each variant's own propeller and stops)
  const rows = [['da40ng', cardNG], ['da40_180', card180], ['da40d', cardD]].map(([id, c]) => {
    const D = val(c, 'propeller.identity.diameter'), disk = val(c, 'interference.slipstream.diskDiameter');
    const el = val(c, 'controls.surfaces.elevator').travel_deg, st = val(c, 'controls.pitch.stops'), ru = val(c, 'controls.surfaces.rudder').travel_deg, ys = val(c, 'controls.yaw.stops');
    return { id, ok: D === disk && el.up === st.teu && el.down === st.ted && ru.left === ys.left && ru.right === ys.right, txt: `${id}: D ${D}/${disk} m, elev ${el.up}/${el.down} vs ${st.teu}/${st.ted}, rud ${ru.left}/${ru.right} vs ${ys.left}/${ys.right}` }; });
  add('T-LD-37', 'บัตรที่ merge แล้วของ da40ng, da40_180, da40d (รุ่นย่อยรับค่าจาก NG ผ่าน _inherits)', 'propeller.identity.diameter = interference.slipstream.diskDiameter; controls.surfaces.* travel = controls.pitch/yaw.stops', 'เท่ากันทุก id', 'ตรงทุกค่า', '[LD1 p.5, 7, 13–14, 27, 29]', rows.map(x => x.txt).join('; '), rows.every(x => x.ok), '-', ['da40ng', 'da40_180', 'da40d']);
}

// ---- added 19 Nov 2026 (completeness check: gap 7 Vx, gap 18 stall altitude loss, D1/D3 card consistency) ----
const IDS3 = ['da40ng', 'da40_180', 'da40d'];
for (const [tid, id] of [['T-LD-38', 'da40ng'], ['T-LD-39', 'da40_180'], ['T-LD-40', 'da40d']]) {
  const o = vx.ids[id], ck = o.climbTO.check;
  add(tid, `ซิม: ${id} ${o.mtow.toLocaleString('en-US')} kg (MTOM), SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS ทีละ 0.25 kt จาก 1.03 VS1 (ld_vx.mjs)`, 'Vx (ความเร็วที่มุมไต่สูงสุด)', o.C.mtow.Vx_kcas, 4,
    `ค่าประมาณ: k·VS1 = ${vx.k} × ${o.C.mtow.VS1_kcas} KCAS (= ${o.C.mtow.Vx_kias} KIAS); k เฉลี่ยจาก POH C172S/C172R/C152 [LC1][LE2][LF1]; AFM ไม่ให้ Vx [LD17]; ความเร็วไต่แฟลป T/O ของ AFM ${ck.afm_kias} KIAS = ${ck.afm_kcas} KCAS เทียบ k·VS(T/O) ${ck.rule_kcas} KCAS; ±4 kt = ช่วง k (±1 kt) + ความไม่แน่นอนของ VS1 (gap 12)`,
    `${o.B.mtow.Vx} (γmax ${o.B.mtow.gmax_deg}°)`, within(o.B.mtow.Vx, o.C.mtow.Vx_kcas, 4), 'KCAS', [id]);
}
{ const a = vx.stall_alt_loss;
  add('T-LD-41', 'stall ปีกระดับ idle ลด 1 kt/s แฟลป UP ที่ training_mass (NG 1,150 / 180 1,050 / D 1,060 kg) แล้วแก้ตามวิธีมาตรฐาน: ลดมุมปะทะ คันเร่งเต็ม ปีกระดับ ดึงกลับสู่การไต่', 'ความสูงที่เสียจากเริ่ม stall ถึงอัตราจมเป็นศูนย์ (da40ng / da40_180 / da40d)', IDS3.map(id => a.ids[id].loss_ft).join(' / '), '±35 % (ช่วง c ของคลาส)',
    `ค่าประมาณ Δh = c·VS1² (KCAS), c เฉลี่ย ${a.coef_mean} จาก C172S 230 ft [LC2], C152 160 ft [LF1], P2006T 180 ft [LG5] (ช่วง ${a.coef_min}–${a.coef_max}); AFM ที่อ่านได้ไม่ระบุ`, 'ไม่รองรับในซิมวันนี้ (ไม่มีลำดับแก้ stall อัตโนมัติและ evaluator ไม่วัดความสูงที่เสีย)', null, 'ft', IDS3); }
{ const rows = [['da40ng', cardNG], ['da40_180', card180], ['da40d', cardD]].map(([id, c]) => {
    const tm = trainingMass(c), at = val(c, 'speeds.approach_table'), fl = at.axes.flap.map(String), row = Array.isArray(at.data[0]) ? at.data[fl.indexOf('LDG')] : at.data;
    const tab = interp(at.axes.mass_kg.map((m, i) => [m, row[i]]), tm.kg), vapp = val(c, 'speeds.VAPP_kt'), vref = val(c, 'speeds.VREF_kt'), sum = tm.empty_kg + tm.crew_kg + tm.fuel_kg;
    return { id, ok: Math.abs(vapp - tab) <= 0.5 && vapp >= vref && Math.abs(sum - tm.kg) <= 2, txt: `${id}: ${tm.kg} kg → ตาราง ${r(tab)} KIAS, VREF ${vref} / VAPP ${vapp}; ${tm.empty_kg} + ${tm.crew_kg} + ${tm.fuel_kg} = ${sum} kg` }; });
  add('T-LD-42', 'บัตรที่ merge แล้วของ 3 id: speeds.VREF_kt / VAPP_kt, speeds.approach_table (แถว LDG), airframe.weights.training_mass', 'VAPP = approach_table ที่ training_mass; VAPP ≥ VREF; empty + crew + fuel = kg', 'เป็นจริงทุก id', '±0.5 kt / ±2 kg', 'D1, D3 (critic-r2); [LD3][LD6 p.4A-34][LD8]', rows.map(x => x.txt).join('; '), rows.every(x => x.ok), 'kt IAS, kg', IDS3); }

{ // gap 18: stick force per g and per kt from the round-1 hinge model with card leaves (ld_stickforce.mjs, ค่าประมาณ)
  const sf = rd('ld_stickforce.json').ids, f = (x, k) => IDS3.map(id => sf[id][x].cruise[k]).join(' / ');
  add('T-LD-43', 'เครื่องที่ MTOM (NG 1,310 / 180 1,200 / D 1,150 kg), CG อ้างอิง, cruise trim (NG 110, รุ่นเดิม 100 KCAS) 3,000 ft, ดึงถึง limit load factor 3.8 g (normal category)', 'แรงดึงคันต่อ g (Fs/g) da40ng / da40_180 / da40d',
    IDS3.map(id => `≥ ${r(sf[id].cfr23_155.required_per_g_lbf * 4.44822, 0)}`).join(' / '), 'ขั้นต่ำตามข้อกำหนด (ไม่มี tolerance)',
    `14 CFR 23.155(a)(2) ก่อน Amdt 64 [LD12]: แรงดึงถึง n limit ≥ max(W/140 lb, 15 lb) = ${IDS3.map(id => sf[id].cfr23_155.required_lbf).join(' / ')} lbf; หาร (n − 1) = 2.8; ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (controls.pitch.*) = ${f('mtom', 'Fs_per_g_N')} N/g ต่ำกว่าเกณฑ์ (ค่า Chδ/gearing ของรอบที่ 1 ต่ำไปสำหรับ DA40)`,
    'ไม่รองรับในซิมวันนี้ (ซิมไม่มีโมเดลแรงที่คัน: DIRECT สั่งมุม elevator ตรง)', null, 'N/g', IDS3);
  add('T-LD-44', 'เครื่องที่ training_mass, trim ด้วย tab ที่ VAPP แฟลป LDG 300 m และที่ cruise 3,000 ft แล้วเปลี่ยนความเร็ว ±1 kt (tab คงที่)', 'ความชันแรงคันต่อความเร็ว approach / cruise (ดึงเมื่อช้าลง = บวก)',
    IDS3.map(id => `${sf[id].train.approach.grad_N_per_kt} / ${sf[id].train.cruise.grad_N_per_kt}`).join('; '), '±50 % (ค่าประมาณ) และต้อง > 0',
    `ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (ld_stickforce.mjs); 14 CFR 23.173(a) ต้องดึงเมื่อช้ากว่าความเร็ว trim [LD12]; เครื่องฝึกรอบที่ 1 0.63 N/kt ที่ 95 kt [R1:V10]`,
    'ไม่รองรับในซิมวันนี้ (ไม่มีโมเดลแรงที่คัน)', null, 'N/kt', IDS3); }

const nPass = T.filter(t => t.pass === true).length, nFail = T.filter(t => t.pass === false).length, nNA = T.filter(t => t.pass == null).length;
fs.writeFileSync(new URL('ld_tests.json', OUT), JSON.stringify({ date: new Date().toISOString().slice(0, 10), nPass, nFail, nNA, hot: { factorTurbo: hotFactorTurbo, factorNA: hotFactorNA, sigma: sigHot, hotNG, hotD }, cruise14, glideNG, glideNG1310, tests: T }, null, 1));
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน (บัตรนี้ในฟิสิกส์ปัจจุบัน) |', '|---|---|---|---|---|---|',
  ...T.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.exp} (${typeof t.tol === 'number' ? '±' + t.tol : t.tol}) ${t.unit} | ${t.src} | ${t.cur} (${t.pass == null ? 'n.a.' : t.pass ? 'ผ่าน' : '**ไม่ผ่าน**'}) |`)].join('\n');
fs.writeFileSync(new URL('ld_tests.md', OUT), md + '\n');
console.log(md); console.log(`pass ${nPass} / fail ${nFail} / n.a. ${nNA} of ${T.length}; hot factor turbo ${hotFactorTurbo.toFixed(3)}, NA ${hotFactorNA.toFixed(3)}`);
