// Reviewer (หัวข้อ 3.3) — independent recomputation of speed tables and CLmax.
// FBW NXSpeeds v0.8.0 piecewise tables re-entered by hand from the source (L12), index = ceil((m-40)/5).
const KT = 0.514444, g = 9.80665, rho0 = 1.225, S = 122.6;
const idx = m => Math.ceil(((m > 80 ? 80 : m) - 40) / 5);
const VS = { // [clean, 1+F (typo .8+ -> .8*), 2, 3(gear up), FULL, 1]
  C0: [m=>124,m=>124+1.4*(m-40),m=>131+1.4*(m-45),m=>138+1.4*(m-50),m=>145+m-55,m=>150+1.2*(m-60),m=>155+1.2*(m-65),m=>161+m-70,m=>166+1.2*(m-75),m=>172],
  C1F:[m=>93,m=>93+m-40,m=>98+m-45,m=>103+m-50,m=>108+.8*(m-55),m=>112+m-60,m=>117+.8*(m-65),m=>121+.8*(m-70),m=>125+m-75,m=>130],
  C2: [m=>91,m=>91+m-40,m=>96+m-45,m=>101+.8*(m-50),m=>105+m-55,m=>110+.8*(m-60),m=>114+m-65,m=>119+.6*(m-70),m=>122+.8*(m-75),m=>126],
  FULL:[m=>84,m=>84+.8*(m-40),m=>88+m-45,m=>93+.8*(m-50),m=>97+.8*(m-55),m=>101+.8*(m-60),m=>105+.8*(m-65),m=>109+.8*(m-70),m=>113+.6*(m-75),m=>116],
  C1: [m=>102,m=>102+m-40,m=>107+m-45,m=>112+m-50,m=>117+1.2*(m-55),m=>123+.8*(m-60),m=>127+m-65,m=>132+m-70,m=>137+.8*(m-75),m=>141],
};
VS.C3 = VS.C2;
const VLS_FULL_hi = [m=>116,m=>116,m=>116,m=>116+.6*(m-50),m=>119+m-55,m=>124+m-60,m=>129+m-65,m=>134+m-70,m=>139+.8*(m-75),m=>143];
const VLS_FULL_lo = [m=>116,m=>116,m=>116,m=>116+.8*(m-50),m=>120+m-55,m=>125+m-60,m=>130+m-65,m=>135+.8*(m-70),m=>139+.8*(m-75),m=>143];
const VLS_C3_hi = [m=>117,m=>117,m=>117+1.4*(m-45),m=>124+1.2*(m-50),m=>130+m-55,m=>135+1.2*(m-60),m=>141+m-65,m=>146+m-70,m=>151+m-75 /*typo fixed*/,m=>156];
const VLS_C0 = [m=>159,m=>159+1.8*(m-40),m=>168+1.8*(m-45),m=>177+1.8*(m-50),m=>186+1.2*(m-55),m=>192+1.2*(m-60),m=>198+1.6*(m-65),m=>206+1.2*(m-70),m=>212+1.6*(m-75),m=>220];
const ev = (t, m) => t[idx(m)](m);
const CL = (mt, v) => 2 * mt * 1000 * g / (rho0 * S * (v * KT) ** 2);
const VSf = (mt, clmax) => Math.sqrt(2 * mt * 1000 * g / (rho0 * S * clmax)) / KT;
const r = (x, n = 1) => +x.toFixed(n);
console.log('--- A320 points (report claims) ---');
for (const m of [64.5, 67.4, 73.5]) console.log(m, 'VS FULL', r(ev(VS.FULL, m)), 'VLS FULL hi', r(ev(VLS_FULL_hi, m)), 'VS C3', r(ev(VS.C3, m)), 'VLS C3', r(ev(VLS_C3_hi, m)), 'VS 1+F', r(ev(VS.C1F, m)), 'VS C0', r(ev(VS.C0, m)), '1.23VS', r(1.23 * ev(VS.FULL, m)));
console.log('73.69 VS C3', r(ev(VS.C3, 73.69), 2), 'V2/1.13', r(138 / 1.13, 2), 'CL', r(CL(73.69, 138 / 1.13), 3));
console.log('53.7 VS FULL', r(ev(VS.FULL, 53.7), 2), 'k=123/VS', r(123 / ev(VS.FULL, 53.7), 3), 'Vamax/VS', r(107 / ev(VS.FULL, 53.7), 3), 'CL@99', r(CL(53.7, 99), 2), 'CL@92.5', r(CL(53.7, 92.5), 2));
console.log('--- CLmax at 60 t and mean 40..80 ---');
for (const k of ['C0', 'C1', 'C1F', 'C2', 'FULL']) {
  const a = []; for (let m = 40; m <= 80; m += 1) a.push(CL(m, ev(VS[k], m)));
  console.log(k, 'at60', r(CL(60, ev(VS[k], 60)), 3), 'mean', r(a.reduce((s, x) => s + x) / a.length, 3), 'min', r(Math.min(...a), 3), 'max', r(Math.max(...a), 3));
}
console.log('C3 gear down at 60', r(CL(60, ev(VS.C3, 60) - 2), 3));
console.log('Jenkinson Vapp 134 kt at 64.5 t -> VS = 134/1.23? no: Vapp=VLS+5 -> VLS 129 -> VS 104.9 -> CL', r(CL(64.5, 129 / 1.23), 3), '; if Vapp=1.23VS (no add) ->', r(CL(64.5, 134 / 1.23), 3));
console.log('--- VLS/VS ratio FULL hi 50..77.4 ---');
{ let lo = 9, hi = 0; for (let m = 50; m <= 77.4; m += 0.1) { const q = ev(VLS_FULL_hi, m) / ev(VS.FULL, m); lo = Math.min(lo, q); hi = Math.max(hi, q); } console.log('FULL', r(lo, 3), r(hi, 3)); }
{ let lo = 9, hi = 0; for (let m = 40; m <= 80; m += 0.1) { const q = ev(VLS_C0, m) / ev(VS.C0, m); lo = Math.min(lo, q); hi = Math.max(hi, q); } console.log('CONF0', r(lo, 3), r(hi, 3)); }
console.log('--- VAPP rule ---');
for (const hw of [0, 12, 30, 60]) console.log(hw, r(128.6 + Math.max(5, Math.min(15, hw / 3)), 1));
console.log('--- A321 formula ---');
for (const [m, c] of [[74, 2.85], [78, 2.85], [75.5, 2.85], [77.8, 2.85], [80, 3.05], [79.2, 3.05], [79.2, 2.85], [73, 2.85], [73, 3.05]]) console.log(m, c, '1.23VS', r(1.23 * VSf(m, c), 1), 'VS', r(VSf(m, c), 1));
console.log('CLmax from VREF 139 @80t:', r(CL(80, 139 / 1.23), 3), '; Cat C limit 141 kt @79.2t ->', r(CL(79.2, 141 / 1.23), 3));
console.log('A321ceo CLmax from 139@74', r(CL(74, 139 / 1.23), 3), '143@78', r(CL(78, 143 / 1.23), 3), '140@75.5', r(CL(75.5, 140 / 1.23), 3));
console.log('Vat A320ceo 64.5 CL 2.884', r(1.23 * VSf(64.5, 2.884), 1), 'A320neo 67.4 table', r(1.23 * ev(VS.FULL, 67.4), 1), 'CL2.884', r(1.23 * VSf(67.4, 2.884), 1));
