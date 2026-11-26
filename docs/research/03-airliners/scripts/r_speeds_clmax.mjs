// r_speeds_clmax.mjs — หัวข้อ 3.1 ATR 72-600: VSR/CLmax จากความเร็วที่เผยแพร่, ตาราง VREF/VmLB/VmHB ตามมวล,
// approach category, CL0/alpha ตามแฟลป และค่า aero.legacy
// จุดยึด (anchor) ทั้งหมดมีแหล่ง: VREF 106 kt @20.4 t [R9 BEA F-OZKN]; VREF 113 KIAS @MLW [R4 factsheet];
// V2min 116 KCAS @MTOW 22.8 t [R4]; VREF = 1.23 VSR, VmLB0 = 1.18 VSR [R14][R16][R31]; VMCL 98 kt [R14]
// ทุกค่าที่ได้เป็น "ค่าประมาณ" (est) เพราะได้จากการแปลงย้อนด้วยนิยาม
const KT = 0.514444, g = 9.80665, rho0 = 1.225, S = 61.0;
const f = (x, d = 2) => Number(x.toFixed(d));
const CLfrom = (m, Vkt) => 2 * m * g / (rho0 * S * (Vkt * KT) ** 2);
const Vfrom = (m, CL) => Math.sqrt(2 * m * g / (rho0 * S * CL)) / KT;
const out = {};

// 1) แฟลป 30: VSR30 จาก VREF
const a1 = { m: 20400, VREF: 106 }, a2 = { m: 22350, VREF: 113 };
const CL30_a1 = CLfrom(a1.m, a1.VREF / 1.23), CL30_a2 = CLfrom(a2.m, a2.VREF / 1.23);
const CL30 = (CL30_a1 + CL30_a2) / 2;
out.flap30 = { VSR30_at_20_4t: f(a1.VREF / 1.23, 1), CLmax30_from_BEA: f(CL30_a1, 3), VSR30_at_MLW_from_factsheet: f(a2.VREF / 1.23, 1), CLmax30_from_factsheet: f(CL30_a2, 3), CLmax30_selected: f(CL30, 3) };

// 2) แฟลป 15: V2min = max(1.13 VSR15, 1.10 VMCA) [CS/14 CFR 25.107] -> สมมติ V2min ถูกจำกัดด้วย VSR15
const v2 = { m: 22800, V2: 116 };
const VSR15 = v2.V2 / 1.13, CL15 = CLfrom(v2.m, VSR15);
out.flap15 = { VSR15_at_22_8t: f(VSR15, 1), CLmax15: f(CL15, 3), VMCA_upper_bound_kt: f(v2.V2 / 1.10, 1) };

// 3) แฟลป 0: ไม่มีค่าเผยแพร่ -> ใช้ CLmax0 = 1.50 (ค่าประมาณ: FlightGear 1.62 ที่ 18° [R22] ลบเผื่อ, และการตีความ icing bug 162 kt @21 t [R18])
const CL0max = 1.50;
// ตรวจการตีความ icing bug: ถ้า icing bug = 1.18·VSR0 + 20 kt (สมมติ) ที่ 21 t
const VSR0_21 = Vfrom(21000, CL0max);
out.flap0 = { CLmax0_assumed: CL0max, VSR0_at_21t: f(VSR0_21, 1), VmLB0_at_21t: f(1.18 * VSR0_21, 1),
  CL_if_icingbug162_eq_VmLB0_plus20: f(CLfrom(21000, (162 - 20) / 1.18), 3) };

// 4) ตารางตามมวล (kt CAS): VSR0/15/30, VmLB0 = 1.18 VSR0, VmHB0 = 1.23 VSR0 (สมมติ), VREF = max(1.23 VSR30, VMCL 98)
const masses = [14000, 16000, 18000, 20000, 21000, 22000, 22350, 23000];
const VMCL = 98;
out.table = masses.map(m => {
  const s0 = Vfrom(m, CL0max), s15 = Vfrom(m, CL15), s30 = Vfrom(m, CL30);
  return { m, VSR0: f(s0, 1), VSR15: f(s15, 1), VSR30: f(s30, 1), VmLB0: f(1.18 * s0, 1), VmHB0: f(1.23 * s0, 1), VmLB15: f(1.18 * s15, 1),
    VREF30: f(Math.max(1.23 * s30, VMCL), 1), VREF30_unclamped: f(1.23 * s30, 1), V2min15: f(Math.max(1.13 * s15, 116 / 1.13 * 0 + 0), 1) };
});
out.VREF_floor_mass_kg = f(2 * g * 0 + ((VMCL / 1.23) * KT) ** 2 * rho0 * S * CL30 / (2 * g), 0);

// 5) approach category (14 CFR 97.3: VREF หรือ 1.3 VS0 ที่ MLW; B = 91–120 kt)
const VREF_MLW = Math.max(1.23 * Vfrom(22350, CL30), VMCL);
out.approachCategory = { VREF_MLW: f(VREF_MLW, 1), category: VREF_MLW < 91 ? 'A' : VREF_MLW < 121 ? 'B' : VREF_MLW < 141 ? 'C' : 'D' };

// 6) lift curve / alpha ที่ CLmax (body axis) — ค่าที่เลือก (est) แล้วตรวจท่าทาง
const CLa = 5.6;                         // /rad ทั้งลำ (est; ดู r_aero_modes.mjs)
const cfg = { '0': { CLmax: CL0max, aMax: 13.0 }, '15': { CLmax: CL15, aMax: 12.0 }, '30': { CLmax: CL30, aMax: 12.0 } };
for (const k of Object.keys(cfg)) cfg[k].CL0 = cfg[k].CLmax - CLa * cfg[k].aMax * Math.PI / 180;
out.cfg = Object.fromEntries(Object.entries(cfg).map(([k, v]) => [k, { CLmax: f(v.CLmax, 3), alpha_CLmax_deg: v.aMax, CL0: f(v.CL0, 3), dCL0_vs_clean: f(v.CL0 - cfg['0'].CL0, 3) }]));

// 7) ท่าทางที่ VREF/VAPP บน 3° (ไม่รวม ground effect) และที่ touchdown (VREF−7 kt, path ~0°, ground effect +10 % CLα)
const att = (m, Vkt, flap, gammaDeg, geFac = 1) => {
  const CL = CLfrom(m, Vkt); const a = (CL - cfg[flap].CL0) / (CLa * geFac) * 180 / Math.PI; return { CL: f(CL, 3), alpha: f(a, 2), theta: f(a + gammaDeg, 2) };
};
out.attitudes = {
  VREF_20_4t: att(20400, 106, '30', -3), VAPP_20_4t_plus5: att(20400, 111, '30', -3),
  VAPP_21_7t_113kt: att(21700, 113, '30', -3), TD_21_7t_106kt: att(21700, 106, '30', -0.5, 1.10),
  TD_20_4t_99kt: att(20400, 99, '30', -0.5, 1.10),
  climb_V2_22_8t_116kt_flap15: att(22800, 116, '15', 0),
};

// 8) aero.legacy: AC.flaps 1 = flaps 30; CLflap = ΔCL0(30); flapMap = ΔCL0/ΔCL0(30); aStall = α*(clean)+3°; aStallFlap = α*(30)−α*(0)
const d30 = cfg['30'].CL0 - cfg['0'].CL0, d15 = cfg['15'].CL0 - cfg['0'].CL0;
out.legacy = { CL0: f(cfg['0'].CL0, 3), CLa, CLflap: f(d30, 3), flapMap: { '0': 0, '15': f(d15 / d30, 3), '30': 1 },
  aStall: cfg['0'].aMax + 3, aStallFlap: cfg['30'].aMax - cfg['0'].aMax };
console.log(JSON.stringify(out, null, 1));
