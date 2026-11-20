// r_aero_modes.mjs — หัวข้อ 3.1 ATR 72-600: เรขาคณิตปีก/หาง (ค่าประมาณ), derivative เชิงเส้นด้วยสูตรตำรา
// (Nelson 1998 ch.2–3, 5; DATCOM/Helmbold สำหรับ CLα), inertia แบบ build-up เทียบกับค่า GE791 (ผ่าน Wolfram [R24]),
// และโหมดพลวัตจาก eigenvalue ของระบบเชิงเส้น 4×4 ทั้งสองแกน
// ทุกค่าที่ได้เป็นค่าประมาณ (est) — ใช้เป็นจุดเริ่มต้นและเป้าตรวจแบบ tolerance กว้าง
const g = 9.80665, KT = 0.514444, FT = 0.3048, D2R = Math.PI / 180;
const f = (x, d = 3) => Number(x.toFixed(d));
function isa(h) { const T = 288.15 - 0.0065 * h; const p = 101325 * Math.pow(T / 288.15, 5.25588); return { rho: p / (287.053 * T), a: Math.sqrt(401.874 * T) }; }
const out = {};

// ---------- 1) เรขาคณิต ----------
const S = 61.0, b = 27.05;                         // [R4]
const AR = b * b / S;
const lam = 0.50;                                  // taper (est: ระหว่าง 0.419 [R26] และ 0.59 [R27])
const cr = 2 * S / (b * (1 + lam)), ct = lam * cr;
const mac = (2 / 3) * cr * (1 + lam + lam * lam) / (1 + lam);
const Sh = 11.73, Sv = 12.48;                      // [R27] "original" 11.7 / 12.5 m²
const lh = 13.6, lv = 13.6;                        // [R22] FG 44.58 ft, [R27] 13.565 m (redesign) -> est
const bh = 7.31;                                   // est: AR_h ≈ 4.55
const zv = 3.2;                                    // est: ความสูง c.p. ของ fin เหนือ CG
const VH = Sh * lh / (S * mac), VV = Sv * lv / (S * b);
out.geometry = { AR: f(AR), lam, cr: f(cr), ct: f(ct), mac: f(mac), VH: f(VH), VV: f(VV), ARh: f(bh * bh / Sh) };

// ---------- 2) lift slope ----------
const helm = (A, M, kappa = 0.95, sweepHalf = 0) => { const B = Math.sqrt(1 - M * M); return 2 * Math.PI * A / (2 + Math.sqrt(4 + (A * B / kappa) ** 2 * (1 + Math.tan(sweepHalf) ** 2 / (B * B)))); };
const cases = { approach: { M: 0.17, h: 0, CL: 1.64, flap: 30 }, cruise: { M: 0.45, h: 17000 * FT, CL: 0.50, flap: 0 } };
const ARh = bh * bh / Sh;
out.lift = {};
for (const [k, c] of Object.entries(cases)) {
  const aw = helm(AR, c.M), at = helm(ARh, c.M, 0.95, 6 * D2R);
  const deda = 2 * aw / (Math.PI * AR) * 0.85;          // T-tail อยู่สูง: ลด 15 % (est)
  const etat = 0.95;
  const CLa = aw * 1.04 + at * etat * (Sh / S) * (1 - deda);   // 1.04 = ผลจากลำตัว/nacelle ต่อ CLα (est)
  const CLaSel = k === 'approach' ? 5.6 : 6.0;          // ค่าที่เลือกใน JSON (ระหว่าง FG 5.2 กับสูตร) — ใช้ค่านี้ต่อ
  out.lift[k] = { aw: f(aw), at: f(at), deda: f(deda), CLa_formula: f(CLa), CLa_selected: CLaSel };
  c.aw = aw; c.at = at; c.deda = deda; c.CLa = CLaSel; c.etat = etat;
}

// ---------- 3) จุด neutral point และ Cmα ----------
// h_n = h_ac,w + ΔH_tail − Δ_fus − Δ_nac − Δ_prop  (หน่วย MAC)
for (const c of Object.values(cases)) {
  const tail = VH * c.etat * c.at / c.CLa * (1 - c.deda);
  const wf = 2.865, Lf = 27.17, Kf = 0.012 / D2R * D2R;  // Multhopp/Gilruth Kf ≈ 0.012 per deg (est, wing ~45 % ของลำตัว)
  const CmaFus = 0.012 * wf * wf * Lf / (S * mac) / D2R; // per rad
  const dfus = CmaFus / c.CLa;
  const dnac = 0.05, dprop = 0.03;                        // est
  c.hn = 0.25 + tail - dfus - dnac - dprop;
}
out.neutralPoint = Object.fromEntries(Object.entries(cases).map(([k, c]) => [k, f(c.hn)]));
const hcg = 0.25;

// ---------- 4) derivative เชิงเส้น (ต่อ rad; rate derivative ไร้มิติ c/2V หรือ b/2V) ----------
const tauE = 0.45, tauR = 0.45;                     // effectiveness (est; elevator/rudder chord ratio ~0.3–0.35)
const av = 3.0;                                     // VT lift slope ต่อ rad รวม end-plate ของ T-tail (est)
const etav = 1.0;
const der = {};
for (const [k, c] of Object.entries(cases)) {
  const CLq = 2 * c.at * c.etat * VH;
  const Cmq = -2.2 * c.at * c.etat * VH * (lh / mac);   // ×1.1 รวมปีก/ลำตัว
  const CLadot = 2 * c.at * c.etat * VH * c.deda;
  const Cmadot = -2 * c.at * c.etat * VH * (lh / mac) * c.deda;
  const CLde = c.at * c.etat * (Sh / S) * tauE;
  const Cmde = -VH * c.at * c.etat * tauE;
  const Cma = -c.CLa * (c.hn - hcg);
  const CYb_v = -av * etav * Sv / S, CYb = CYb_v - 0.10;
  const Cnb = av * etav * VV - 0.084;                  // fuselage −1.3·Vol/(S b) ≈ −0.084 (est)
  const Clb = -0.050 - 0.02 - av * (Sv / S) * zv / b;   // dihedral(est 2.5° outer) + high-wing + fin
  const Clp = -0.60;
  const Clr = c.CL / 4 + av * (Sv / S) * zv / b * 2 * lv / b * 0.5;
  const Cnp = -c.CL / 8 + 0.01;
  const Cnr = -2 * av * etav * VV * (lv / b) - 0.02;
  const CYr = -2 * CYb_v * (lv / b);
  const CYdr = av * etav * (Sv / S) * tauR;
  const Cndr = -CYdr * lv / b, Cldr = CYdr * zv / b;
  const Clda = 0.18, Cnda = -0.10 * c.CL * Clda;       // est (aileron ±14° [R10] + roll spoiler)
  der[k] = { CLq, Cmq, CLadot, Cmadot, CLde, Cmde, Cma, CYb, CYdr, CYr, Clb, Clp, Clr, Clda, Cldr, Cnb, Cnp, Cnr, Cnda, Cndr };
}
out.derivatives = Object.fromEntries(Object.entries(der).map(([k, d]) => [k, Object.fromEntries(Object.entries(d).map(([n, v]) => [n, f(v)]))]));

// ---------- 5) inertia build-up (ค่าประมาณ) ที่ m ≈ 21 t ----------
// ตำแหน่ง STA จากจมูก (x ไปท้าย), y ขวา, z ลง (จากแนวกลางลำตัว) ; รายการมวลเป็นการประมาณของผู้วิจัย
const items = [
  // name, m, x0, x1 (แท่งตามยาว) หรือ x, y-span half (แท่งตามขวาง), y, z, own-radial r²
  { n: 'fuselage+systems', m: 6700, x0: 0, x1: 27.17, y: 0, z: 0, rr: 1.4 * 1.4 * 0.7 },
  { n: 'payload', m: 6000, x0: 3.5, x1: 21.0, y: 0, z: 0.2, rr: 0.8 * 0.8 },
  { n: 'cockpit+avionics', m: 600, x: 2.5, y: 0, z: 0, rr: 0.5 },
  { n: 'wing', m: 2300, x: 12.6, ys: 13.5, y: 0, z: -1.3 },
  { n: 'fuel', m: 2000, x: 12.6, ys: 8.5, ysIn: 1.3, y: 0, z: -1.2 },
  { n: 'powerplant L', m: 1010, x: 9.3, y: -4.05, z: -0.6 },
  { n: 'powerplant R', m: 1010, x: 9.3, y: 4.05, z: -0.6 },
  { n: 'MLG L', m: 330, x: 13.0, y: -1.6, z: 1.3 }, { n: 'MLG R', m: 330, x: 13.0, y: 1.6, z: 1.3 },
  { n: 'NLG', m: 120, x: 2.6, y: 0, z: 1.3 },
  { n: 'VT', m: 350, x: 24.6, y: 0, z: -3.6 }, { n: 'HT', m: 250, x: 26.0, ys: 3.65, y: 0, z: -6.0 },
];
let M = 0, Mx = 0, Mz = 0;
for (const it of items) { const xc = it.x0 !== undefined ? (it.x0 + it.x1) / 2 : it.x; it.xc = xc; M += it.m; Mx += it.m * xc; Mz += it.m * it.z; }
const xcg = Mx / M, zcg = Mz / M;
let Ixx = 0, Iyy = 0, Izz = 0, Ixz = 0;
for (const it of items) {
  const dx = it.xc - xcg, dz = it.z - zcg;
  const lenTerm = it.x0 !== undefined ? it.m * (it.x1 - it.x0) ** 2 / 12 : 0;
  const ysIn = it.ysIn || 0;
  const yy = it.ys ? it.m * (it.ys ** 3 - ysIn ** 3) / (3 * (it.ys - ysIn)) : it.m * it.y * it.y;
  const rr = it.m * (it.rr || 0);
  Ixx += yy + it.m * dz * dz + rr;
  Iyy += lenTerm + it.m * dx * dx + it.m * dz * dz + rr / 2;
  Izz += lenTerm + it.m * dx * dx + yy + rr / 2;
  Ixz += -it.m * dx * dz;     // FRD: x หน้า -> dx_FRD = −dx
}
const Lfus = 27.17, e = (b + Lfus) / 2;
const radii = (I, m) => ({ Rx: f(2 * Math.sqrt(I.Ixx / m) / b), Ry: f(2 * Math.sqrt(I.Iyy / m) / Lfus), Rz: f(2 * Math.sqrt(I.Izz / m) / e) });
const IB = { Ixx, Iyy, Izz, Ixz };
const IG = { Ixx: 289900, Iyy: 298400, Izz: 573600, Ixz: 0 };     // [R24] จาก GE791 ผ่าน Wolfram (มวลอ้างอิงไม่ระบุ)
out.inertia = {
  buildup: { m: M, xcg_STA: f(xcg, 2), zcg: f(zcg, 2), Ixx: Math.round(Ixx), Iyy: Math.round(Iyy), Izz: Math.round(Izz), Ixz: Math.round(Ixz), radii: radii(IB, M) },
  GE791_if_m21217: radii(IG, 21217), GE791_if_m14380: radii(IG, 14380),
  FG_slugft2_to_SI: { Ixx: Math.round(232683 * 1.35582), Iyy: Math.round(124973 * 1.35582), Izz: Math.round(570228 * 1.35582) },
};

// ---------- 6) โหมดพลวัต ----------
function charpoly(A) { // Faddeev–LeVerrier: det(sI − A) = s^n + c1 s^(n-1) + ... + cn
  const n = A.length; let Mk = A.map(r => r.map(() => 0)); const c = [1];
  for (let k = 1; k <= n; k++) {
    const AM = A.map((r, i) => r.map((_, j) => r.reduce((s, _a, l) => s + A[i][l] * Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + (i === j ? c[k - 1] : 0)));
    const AMk = A.map((r, i) => r.map((_, j) => r.reduce((s, _a, l) => s + A[i][l] * Mk[l][j], 0)));
    c.push(-AMk.reduce((s, r, i) => s + r[i], 0) / k);
  }
  return c;
}
function roots(c) { // Durand–Kerner บน polynomial monic
  const n = c.length - 1; let z = Array.from({ length: n }, (_, k) => ({ re: Math.cos(2 * Math.PI * k / n + 0.4) * 0.9, im: Math.sin(2 * Math.PI * k / n + 0.4) * 0.9 }));
  const mul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; };
  const ev = s => { let p = { re: 1, im: 0 }; for (let k = 1; k <= n; k++) p = { re: p.re * s.re - p.im * s.im + c[k], im: p.re * s.im + p.im * s.re }; return p; };
  for (let it = 0; it < 2000; it++) z = z.map((zi, i) => { let den = { re: 1, im: 0 }; z.forEach((zj, j) => { if (j !== i) den = mul(den, { re: zi.re - zj.re, im: zi.im - zj.im }); }); const q = div(ev(zi), den); return { re: zi.re - q.re, im: zi.im - q.im }; });
  return z;
}
const modeInfo = r => { const wn = Math.hypot(r.re, r.im); return { re: f(r.re, 4), im: f(r.im, 4), wn: f(wn, 4), zeta: f(-r.re / wn, 3), T_s: r.im !== 0 ? f(2 * Math.PI / Math.abs(r.im), 2) : null, tau_or_T2: r.im === 0 ? f(-1 / r.re, 2) : null }; };

const cond = {
  approach: { m: 20400, Vkt: 111, h: 0, gam: -3, flap: 30, CD: 0.21, ...cases.approach, IB },
  cruise: { m: 21000, Vkt: 275, tas: true, h: 17000 * FT, gam: 0, flap: 0, ...cases.cruise, IB },
  approach_GE791I: { m: 20400, Vkt: 111, h: 0, gam: -3, flap: 30, CD: 0.21, ...cases.approach, IB: IG, Mref: 21217, dkey: 'approach' },
  cruise_GE791I: { m: 21000, Vkt: 275, tas: true, h: 17000 * FT, gam: 0, flap: 0, ...cases.cruise, IB: IG, Mref: 21217, dkey: 'cruise' },
};
out.modes = {};
for (const [k, c] of Object.entries(cond)) {
  const at = isa(c.h), V = c.tas ? c.Vkt * KT : c.Vkt * KT * Math.sqrt(1.225 / at.rho);
  const qb = 0.5 * at.rho * V * V, m = c.m, W = m * g;
  const CL = W * Math.cos(c.gam * D2R) / (qb * S);
  const K = c.flap ? 0.040 : 0.0313;
  const CD = c.flap ? c.CD : 0.030 + K * CL * CL;
  const d = der[c.dkey || k];
  const th0 = (c.gam + 2) * D2R;          // ประมาณ θ0 (ไม่สำคัญต่อผล)
  const Dn = qb * S * CD, T = Dn + W * Math.sin(c.gam * D2R);
  const Xu = (-2 * Dn / V - T / V) / m;   // แรงขับกำลังคงที่ dT/dV = −T/V
  const CDa = 2 * K * CL * c.CLa;
  const Xw = -(CDa - CL) * qb * S / (m * V);
  const Zu = -2 * CL * qb * S / (m * V);
  const Zw = -(c.CLa + CD) * qb * S / (m * V);
  const Mref = c.Mref || M; const Iyy = c.IB.Iyy * (m / Mref);           // scale ตามมวล (est)
  const Mw = d.Cma * qb * S * mac / (V * Iyy);
  const Mwd = d.Cmadot * mac / (2 * V) * qb * S * mac / (V * Iyy);
  const Mq = d.Cmq * mac / (2 * V) * qb * S * mac / Iyy;
  const Alon = [[Xu, Xw, 0, -g * Math.cos(th0)], [Zu, Zw, V, -g * Math.sin(th0)], [Mwd * Zu, Mw + Mwd * Zw, Mq + Mwd * V, 0], [0, 0, 1, 0]];
  const rl = roots(charpoly(Alon)).sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im));
  const Ixx = c.IB.Ixx * (m / Mref), Izz = c.IB.Izz * (m / Mref);
  const Yb = qb * S * d.CYb / m, Yr = qb * S * b * d.CYr / (2 * m * V);
  const Lb = qb * S * b * d.Clb / Ixx, Lp = qb * S * b * b * d.Clp / (2 * Ixx * V), Lr = qb * S * b * b * d.Clr / (2 * Ixx * V);
  const Nb = qb * S * b * d.Cnb / Izz, Np = qb * S * b * b * d.Cnp / (2 * Izz * V), Nr = qb * S * b * b * d.Cnr / (2 * Izz * V);
  const Alat = [[Yb / V, 0, Yr / V - 1, g * Math.cos(th0) / V], [Lb, Lp, Lr, 0], [Nb, Np, Nr, 0], [0, 1, Math.tan(th0), 0]];
  const rlat = roots(charpoly(Alat));
  out.modes[k] = {
    V_TAS: f(V, 1), qbar: f(qb, 0), CL: f(CL), CD: f(CD, 4), LoverD: f(CL / CD, 2),
    lon: rl.map(modeInfo), lat: rlat.map(modeInfo),
    approx: { phugoid_wn_lanchester: f(Math.SQRT2 * g / V, 4), phugoid_zeta_lanchester: f(1 / (Math.SQRT2 * CL / CD), 3) },
  };
}
console.log(JSON.stringify(out, null, 1));
