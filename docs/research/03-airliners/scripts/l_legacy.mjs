// l_legacy.mjs — หัวข้อ 3.3: ค่า aero.legacy สำหรับ AC ปัจจุบัน + ตาราง VS1g/VLS ของ A321 จาก CLmax + gear/steering/tyre
// รัน: node l_legacy.mjs   (Node >= 18, ไม่มี dependency) — ทุกค่าเป็นค่าประมาณ (est) ยกเว้นค่าคงที่ที่ระบุแหล่ง
const g = 9.80665, KT = 0.514444, D2R = Math.PI / 180, S = 122.6, rho0 = 1.225;
const f = (x, d = 3) => +x.toFixed(d);
// ค่าจาก l_aero_modes.mjs (A320ceo, M 0.2): CLα 5.302 /rad, CL0 ต่อ CONF, CLmax ต่อ CONF (@60 t จาก l_speeds_clmax.mjs)
const CLa = 5.302, CLa_deg = CLa * D2R;
const CONFS = ['CONF0', 'CONF1', 'CONF1+F', 'CONF2', 'CONF3', 'FULL'];
const A320 = { CL0: { CONF0: 0.120, CONF1: 0.252, 'CONF1+F': 0.702, CONF2: 0.835, CONF3: 0.928, FULL: 1.369 }, CLmax: { CONF0: 1.316, CONF1: 1.957, 'CONF1+F': 2.360, CONF2: 2.447, CONF3: 2.447, FULL: 2.902 } };
// Beard–McLain blend ของโค้ดปัจจุบัน (M = 55): หา CL สูงสุดของ blend สำหรับ CL0 และจุดกลาง a0
const blendMax = (CL0x, a0deg) => { const a0 = a0deg * D2R; let best = 0, at = 0; for (let ad = 0; ad <= 40; ad += 0.02) { const a = ad * D2R, e1 = Math.exp(-55 * (a - a0)), e2 = Math.exp(55 * (a + a0)); const sig = (1 + e1 + e2) / ((1 + e1) * (1 + e2)); const CLv = (1 - sig) * (CL0x + CLa * a) + sig * 2 * Math.sin(a) ** 2 * Math.cos(a); if (CLv > best) { best = CLv; at = ad; } } return [best, at]; };
const solveA0 = (CL0x, target) => { let lo = 5, hi = 35; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (blendMax(CL0x, mid)[0] > target) hi = mid; else lo = mid; } return (lo + hi) / 2; };

function legacy(name, CL0, CLmax) {
  const a0c = solveA0(CL0.CONF0, CLmax.CONF0), a0F = solveA0(CL0.FULL, CLmax.FULL), CLflap = CL0.FULL - CL0.CONF0;
  console.log(`\n== ${name}: aStall ${f(a0c, 2)} deg, aStallFlap ${f(a0F - a0c, 2)} deg, CLflap ${f(CLflap)} ==`);
  const map = {};
  for (const k of CONFS) { const fr = (CL0[k] - CL0.CONF0) / CLflap; map[k] = f(fr); const [cm, am] = blendMax(CL0[k], a0c + (a0F - a0c) * fr); console.log(`  ${k.padEnd(8)} flapMap ${f(fr)}  legacy CLmax ${f(cm)} at alpha ${f(am, 1)} deg  (target ${CLmax[k]}, VS ratio ${f(Math.sqrt(CLmax[k] / cm), 3)})`); }
  return { aStall: f(a0c, 2), aStallFlap: f(a0F - a0c, 2), CLflap: f(CLflap), map };
}
const L320 = legacy('A320ceo/neo', A320.CL0, A320.CLmax);

// ── polar สำหรับสูตร legacy: CD = CD0L + CDflap f^1.5 + CDgear gear + KL (CL - 0.15)^2 ──
// จับคู่กับ polar ที่แนะนำ (CD0 0.0182, k 0.0386 clean; FULL: dCD0 0.050, e 0.70, gear 0.017) ที่ CL 0.5 และ 0.7 (clean) และ CL 1.786 (FULL+gear)
const A = 34.10 ** 2 / S, CD0 = 0.0182, k = 0.0386, kF = 1 / (Math.PI * A * 0.70);
const cd = CL => CD0 + k * CL * CL, KL = (cd(0.7) - cd(0.5)) / ((0.7 - 0.15) ** 2 - (0.5 - 0.15) ** 2), CD0L = cd(0.5) - KL * (0.5 - 0.15) ** 2;
const CDfull = CL => CD0 + 0.050 + 0.017 + kF * CL * CL, CDflapL = CDfull(1.786) - (CD0L + 0.017 + KL * (1.786 - 0.15) ** 2);
console.log('\n== legacy polar ==', { CD0L: f(CD0L, 4), KL: f(KL, 4), CDflap: f(CDflapL, 4), CDgear: 0.017 });
for (const CL of [0.3, 0.5, 0.7, 1.0]) console.log(`  clean CL ${CL}: recommended ${f(cd(CL), 4)} legacy ${f(CD0L + KL * (CL - 0.15) ** 2, 4)}`);
for (const CL of [1.4, 1.786, 2.2]) console.log(`  FULL+gear CL ${CL}: recommended ${f(CDfull(CL), 4)} legacy ${f(CD0L + CDflapL + 0.017 + KL * (CL - 0.15) ** 2, 4)}`);

// ── Cm สำหรับ legacy: Cm = Cm0 + Cmflap f + Cma α + Cmde δe; เลือก Cm0/Cmflap ให้ δe = 0 ที่ trim (THS ทำหน้าที่ trim ในเครื่องจริง) ──
// Cma ที่ CG 25 %MAC: -CLα (h_n - 0.25), h_n 0.51 (l_aero_modes.mjs)
const Cma25 = -CLa * (0.51 - 0.25);
const CLclean = 64500 * g / (0.5 * rho0 * (250 * KT) ** 2 * S), a_clean = (CLclean - A320.CL0.CONF0) / CLa;  // 250 kt EAS clean 64.5 t
const a_app = 4.5 * D2R;                                                                                    // FULL ที่ VAPP (l_aero_modes.mjs)
const Cm0L = -Cma25 * a_clean, CmflapL = -Cma25 * a_app - Cm0L;
console.log('\n== legacy Cm ==', { Cma_cg25: f(Cma25), CL_250kt: f(CLclean), alpha_250kt_deg: f(a_clean / D2R, 2), Cm0: f(Cm0L, 4), Cmflap: f(CmflapL, 4) });

// ── A321: VS1g / VLS / VAPP จาก CLmax (ค่าประมาณ; CONF0..3 = ค่าของ A320, FULL: ceo 2.85, neo 3.05) ──
const vs = (m, CL) => Math.sqrt(2 * m * g / (rho0 * S * CL)) / KT;
const Mtab = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
for (const [n, full] of [['A321ceo', 2.85], ['A321neo', 3.05]]) {
  const CLm = { ...A320.CLmax, FULL: full };
  console.log(`\n== ${n} VS1g (kt CAS) จาก CLmax, mass t:`, Mtab.join(' '));
  for (const c of CONFS) console.log('  ' + c.padEnd(8), Mtab.map(m => f(vs(m * 1000, CLm[c]), 0)).join(' '));
  console.log('  VLS FULL (1.23 VS1g)', Mtab.map(m => f(1.23 * vs(m * 1000, full), 0)).join(' '));
  for (const m of [73, 75.5, 77.8, 79.2, 80]) console.log(`  ${m} t: VS1g FULL ${f(vs(m * 1000, full), 1)} VLS ${f(1.23 * vs(m * 1000, full), 1)} VAPP(calm) ${f(1.23 * vs(m * 1000, full) + 5, 1)}`);
  // FULL CL0 anchor: alpha 4.5 deg at VAPP 73 t
  const V = (1.23 * vs(73000, full) + 5) * KT, CLapp = 73000 * g / (0.5 * rho0 * V * V * S), CL0F = CLapp - CLa_deg * 4.5;
  console.log(`  FULL anchor 73 t: VAPP ${f(V / KT, 1)} kt CL ${f(CLapp)} -> CL0_FULL ${f(CL0F)} alpha* ${f((full + 0.10 - CL0F) / CLa_deg, 1)} deg`);
  legacy(n, { ...A320.CL0, FULL: CL0F }, CLm);
}

// ── gear: แปลงสปริง/แดมป์ของ FlightGear A320-family (GPL-2.0) และตรวจการยุบนิ่ง ──
const LBFFT = 14.5939;  // 1 lbf/ft = 14.5939 N/m ; 1 lbf s/ft = 14.5939 N s/m
const gear = { main: { k: 59785 * LBFFT, c: 23957 * LBFFT, share: 0.92 / 2 }, nose: { k: 30935 * LBFFT, c: 16978 * LBFFT, share: 0.08 } };
for (const [n, G] of Object.entries(gear)) { const m = 64500 * G.share; console.log(`\n${n}: k ${f(G.k, 0)} N/m  c ${f(G.c, 0)} N s/m  static load (64.5 t, share ${G.share}) ${f(m * g / 1000, 1)} kN  deflection ${f(m * g / G.k, 3)} m  zeta ${f(G.c / (2 * Math.sqrt(G.k * m)), 2)}  f_n ${f(Math.sqrt(G.k / m) / (2 * Math.PI), 2)} Hz`); }

// ── nose wheel steering schedule (Flying Engineer [L15], FBW docs [L16]) ──
const lerp = (x, x0, x1, y0, y1) => x <= x0 ? y0 : x >= x1 ? y1 : y0 + (y1 - y0) * (x - x0) / (x1 - x0);
const tiller = gs => lerp(gs, 20, 80, 75, 0), pedal = gs => lerp(gs, 40, 130, 6, 0);
console.log('\nsteering: tiller max deg at GS 0/20/50/80 kt', [0, 20, 50, 80].map(tiller), ' pedal max at 0/40/85/130 kt', [0, 40, 85, 130].map(pedal));

// ── tyre dimensions (in -> m) ──
for (const [n, d, w] of [['46x17R20 main A320', 46, 17], ['49x17 main alt', 49, 17], ['30x8.8R15 nose', 30, 8.8], ['1270x455R22 main A321 (mm)', 1270 / 25.4, 455 / 25.4]]) console.log(`${n}: OD ${f(d * 0.0254, 3)} m width ${f(w * 0.0254, 3)} m`);
for (const [n, psi] of [['193 psi', 193], ['195 psi', 195], ['199 psi', 199], ['200 psi', 200]]) console.log(n, '=', f(psi * 6894.757 / 1e5, 2), 'bar =', f(psi * 6894.757, 0), 'Pa');
for (const [n, lb] of [['46 700 lb', 46700], ['14 200 lb', 14200]]) console.log(n, '=', f(lb * 0.45359237 * g / 1000, 1), 'kN');
console.log('tyre speed 225 mph =', f(225 * 0.868976, 1), 'kt; 195 kt =', f(195 * KT, 1), 'm/s');

// ── A321: Cm0/Cmflap ของ legacy (CLα 5.317, h_n 0.559, CL0 clean 0.117 จาก node l_aero_modes.mjs a321) ──
for (const [n, m] of [['A321ceo MLW 75.5 t', 75500], ['A321neo MLW 79.2 t', 79200]]) {
  const CLa21 = 5.317, Cma = -CLa21 * (0.559 - 0.25), CL250 = m * g / (0.5 * rho0 * (250 * KT) ** 2 * S), ac = (CL250 - 0.117) / CLa21;
  const Cm0 = -Cma * ac, Cmflap = -Cma * 4.5 * D2R - Cm0;
  console.log(`${n}: Cma_cg25 ${f(Cma)} CL_250kt ${f(CL250)} alpha ${f(ac / D2R, 2)} deg Cm0 ${f(Cm0, 4)} Cmflap ${f(Cmflap, 4)}`);
}
