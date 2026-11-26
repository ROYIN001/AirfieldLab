// b_mass_modes.mjs — 737-800: inertia conversions, Roskam radii, mass scaling, approximate modes,
// VMCA yaw-balance estimate. ESTIMATES unless stated. Run: node b_mass_modes.mjs
const g = 9.80665, DEG = Math.PI / 180, KT = 0.514444, SLUGFT2 = 1.3558179, LB = 0.45359237;
const f = (x, n = 3) => Number(x.toFixed(n));
const S = 124.6, b = 34.32, c = 4.17, L = 39.47;            // [B1][B11][B12]
const out = {};
// JSBSim 737.xml (classic-like geometry) empty inertia [B13]
const jsb = { Ixx: 562000, Iyy: 1.473e6, Izz: 1.894e6, Ixz: 8000, mEmpty_lb: 83000 };
out.jsb_SI = { Ixx: Math.round(jsb.Ixx * SLUGFT2), Iyy: Math.round(jsb.Iyy * SLUGFT2), Izz: Math.round(jsb.Izz * SLUGFT2), Ixz: Math.round(jsb.Ixz * SLUGFT2), m: Math.round(jsb.mEmpty_lb * LB) };
// Wolfram SystemModeler Boeing737800 dry inertia [B10]
const wol = { m: 58094.312, Ixx: 1866711, Iyy: 3394953, Izz: 5097558, Ixz: 149140 };
const radii = (I, m, bb, LL) => { const e = (bb + LL) / 2; return {
  Rx: 2 * Math.sqrt(I.Ixx / m) / bb, Ry: 2 * Math.sqrt(I.Iyy / m) / LL, Rz: 2 * Math.sqrt(I.Izz / m) / e }; };
const Rw = radii(wol, wol.m, b, L);
const Rj = radii(out.jsb_SI, out.jsb_SI.m, 28.86, 33.4);   // JSBSim span 94.7 ft; 737-400 length 36.4 m? use 33.4 m (-300) est
out.radii_wolfram = { Rx: f(Rw.Rx), Ry: f(Rw.Ry), Rz: f(Rw.Rz) };
out.radii_jsbsim_classic = { Rx: f(Rj.Rx), Ry: f(Rj.Ry), Rz: f(Rj.Rz) };
const Iat = m => { const e = (b + L) / 2; return {
  Ixx: Math.round(m * (Rw.Rx * b / 2) ** 2), Iyy: Math.round(m * (Rw.Ry * L / 2) ** 2), Izz: Math.round(m * (Rw.Rz * e / 2) ** 2),
  Ixz: Math.round(wol.Ixz * m / wol.m) }; };
out.I_60000 = Iat(60000); out.I_66361 = Iat(66361); out.I_79015 = Iat(79015);
// ── approximate modes at approach, 60 t, flaps 30, gear down, Vref30+5 = 142 kt, SL ISA ──
const D = { CLa: 5.26, CD: 0.155, Cma: -1.0, Cmq: -37.4, Cmad: -9.2, CYb: -0.87, Cnb: 0.167, Cnr: -0.272, Clp: -0.50, Clb: -0.247, Clr: 0.383, Cnp: -0.181 };
const modes = (m, V, rho, I, d) => {
  const q = 0.5 * rho * V * V, qS = q * S;
  const Ma = qS * c * d.Cma / I.Iyy, Za = -qS * (d.CLa + d.CD) / m, Mq = qS * c * c * d.Cmq / (2 * V * I.Iyy), Mad = qS * c * c * d.Cmad / (2 * V * I.Iyy);
  const wsp = Math.sqrt(-Ma + Za * Mq / V), zsp = -(Mq + Mad + Za / V) / (2 * wsp);
  const Nb = qS * b * d.Cnb / I.Izz, Nr = qS * b * b * d.Cnr / (2 * V * I.Izz), Yb = qS * d.CYb / m;
  const wdr = Math.sqrt(Nb + Yb * Nr / V), zdr = -(Nr + Yb / V) / (2 * wdr);
  const Lp = qS * b * b * d.Clp / (2 * V * I.Ixx);
  const CL = m * g / qS;
  return { wsp: f(wsp), zsp: f(zsp), wdr: f(wdr), zdr: f(zdr), Tdr_s: f(2 * Math.PI / (wdr * Math.sqrt(1 - zdr * zdr)), 2), tauR_s: f(-1 / Lp, 2),
    Tph_s: f(Math.PI * Math.SQRT2 * V / g, 1), zph: f((1 / Math.SQRT2) * d.CD / CL, 3), CL: f(CL) };
};
out.modes_app_60t = modes(60000, 142 * KT, 1.225, Iat(60000), D);
out.modes_app_60t_jsbCnb = modes(60000, 142 * KT, 1.225, Iat(60000), { ...D, Cnb: 0.26, Cnr: -0.35, Clp: -0.4 });
// cruise M0.785 FL350, 65 t (CLa 6.79 at M0.785, CD 0.0296)
out.modes_cruise_65t = modes(65000, 0.785 * 296.54, 0.3796, Iat(65000), { ...D, CLa: 6.79, CD: 0.0296, Cmq: -37.4, Cmad: -12.0, Cnr: -0.242, Clp: -0.50, Cma: -1.3 });
// ── VMCA yaw-balance estimate (bank 0, rudder only), est ──
const yEng = 0.282 * b / 2;                       // nacelle spanwise location 0.282 of semi-span [B11]
const vmca = (T, Cndr, dr, windmill = 1.1) => { const N = windmill * T * yEng; const qv = N / (S * b * Math.abs(Cndr) * dr); return Math.sqrt(2 * qv / 1.225) / KT; };
out.yEng_m = f(yEng);
out.VMCA_est = { 'T117kN_Cndr0.118_dr26': f(vmca(117e3, 0.118, 26 * DEG), 1), 'T117kN_Cndr0.20_dr26': f(vmca(117e3, 0.20, 26 * DEG), 1),
  'T121kN_Cndr0.15_dr26': f(vmca(121.4e3, 0.15, 26 * DEG), 1) };
console.log(JSON.stringify(out, null, 1));
