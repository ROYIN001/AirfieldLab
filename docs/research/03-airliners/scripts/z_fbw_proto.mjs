// z_fbw_proto.mjs — AirfieldLab round 3, topic 3.8 (prefix Z)
// Prototype of an Airbus-style fly-by-wire NORMAL LAW for the A320: pitch C* command with integral (auto-trim on
// the THS), 1 g flight-path hold with bank compensation to 33°, pitch-attitude / load-factor / high-AoA / high-speed
// protections, flare mode, and a roll-rate command law with bank hold and spiral return beyond 33°.
// Runs on a point-mass + pitch-rotation model (path axes, bank as an input) and a 1-DOF roll model.
// EVERYTHING HERE IS AN ESTIMATE (est: true): the law structure follows public sources (refs Z.. in
// 08-fbw-laws.md); gains are chosen by this script; aircraft data are the topic-3 estimates (03-a320-a321.md).
// Run: node z_fbw_proto.mjs   (Node >= 18, no dependencies).

const G = 9.80665, DEG = Math.PI / 180, RAD = 180 / Math.PI, KT = 0.514444, FT = 0.3048;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
function rhoISA(h) { const T = 288.15 - 0.0065 * h; return 1.225 * Math.pow(T / 288.15, 4.2559); }

// ───────────── A320 data (หัวข้อ 3.3 estimates; approach derivative set used at all speeds) ─────────────
export const A320 = {
  m: 64500, S: 122.6, c: 4.1935, b: 34.10, Iyy: 4.946e6, Ixx: 1.749e6,
  CL0: 0.12, CLflap: 1.249, CLa: 5.302, CLq: 7.49, CLde: 0.464, tauE: 0.52,
  CD0: 0.0215, K: 0.0515, CDflap: 0.0618, CDgear: 0.017,
  Cm0: 0.1012, Cmflap: 0.0071, Cma: -1.38, Cmq: -34.59, Cmadot: -9.18, Cmde: -1.948,
  Clp: -0.509, ClRollMax: 0.05,          // ClRollMax: aileron + roll-spoiler authority (estimate; topic 7 owns surfaces)
  CLmax: { CONF0: 1.31, FULL: 2.88 }, flap: { CONF0: 0, FULL: 1 },
  deUp: 30 * DEG, deDn: 17 * DEG,        // A320 elevator travel (KNKT §1.6.5.1, via topic 7)
  ihUp: 13.5 * DEG, ihDn: 4 * DEG,       // A320 THS travel (KNKT, via topic 7)
  VMO_kt: 350,
};

// ───────────── PURE FUNCTIONS (candidates for src/20-flight.js, DOM-free) ─────────────
export const FBW = {
  nzLimits(cfg) { return cfg === 'CONF0' ? { max: 2.5, min: -1.0 } : { max: 2.0, min: 0.0 }; },
  stickToDnz(sp, cfg) { const L = this.nzLimits(cfg); return sp >= 0 ? sp * (L.max - 1) : -sp * (L.min - 1); },
  nzRef(theta, phi) { return Math.cos(theta) / Math.cos(Math.min(Math.abs(phi), 33 * DEG)); },
  flareThetaRef(memoDeg, t30) { if (t30 <= 0) return memoDeg; const r = (Math.max(-2, memoDeg) + 2) / 8; return Math.max(-2, memoDeg - r * t30); },
  bankReturnRate(phiDeg, limDeg, hsp) {            // deg/s toward 33° (normal) or 0° (HSP), 15°/s at the limit
    const a = Math.abs(phiDeg), s = Math.sign(phiDeg);
    if (hsp) return s * (a <= limDeg ? 15 * a / limDeg : 15 + 5 * Math.min(1, (a - limDeg) / 5));
    if (a <= 33) return 0;
    return s * (a <= limDeg ? 15 * (a - 33) / (limDeg - 33) : 15 + 5 * Math.min(1, (a - limDeg) / 5));
  },
  rollRateCmd(sr, phiDeg, limDeg, hsp) { return 15 * sr - this.bankReturnRate(phiDeg, limDeg, hsp); },
  abnormal({ phiDeg, thetaDeg, alphaDeg, iasKt, mach }) {
    return Math.abs(phiDeg) > 125 || thetaDeg > 50 || thetaDeg < -30 || alphaDeg > 40 || alphaDeg < -10 || iasKt > 440 || iasKt < 60 || mach > 0.91;
  },
  alphaThresholds(ac, cfg) {                       // relative to the model's own lift curve (estimate rule §3.8.5)
    const CL0 = ac.CL0 + ac.CLflap * ac.flap[cfg], CLmax = ac.CLmax[cfg];
    const aCLmax = (CLmax - CL0) / ac.CLa, aMax = (0.873 * CLmax - CL0) / ac.CLa;
    return { aCLmax, aMax, aProt: aMax - 3 * DEG, aFloor: aMax - 2.5 * DEG, CL0, CLmax };
  },
  hspAuthority(VpredKt, VMO) { return clamp((VMO + 16 - VpredKt) / 10, 0, 1); },
  hspDnz(VpredKt, VMO) { return clamp(0.075 * (VpredKt - (VMO + 6)), 0, 0.75); },
  groundBlend(t) { return clamp(t / 5, 0, 1); },
};

// ───────────── pitch normal law (stateful, one call per physics step) ─────────────
export class PitchNormalLaw {
  constructor(ac, cfg, o = {}) {
    this.ac = ac; this.cfg = cfg; this.th = FBW.alphaThresholds(ac, cfg);
    this.Vco = 121.9;                 // C* crossover speed, 400 ft/s
    this.Kp = 0.06; this.Ki = 0.20;   // elevator rad per g, rad per g·s, at q̄0 (scaled by q̄0/q̄)
    this.qbar0 = 8000; this.Kg = 1.0;// flight-path hold: Δnz = (V/g)·(Kg·Δγ + Kgi·∫Δγ) with stick neutral
    this.Kth = 0.5;                   // pitch-attitude protection: pitch-rate demand per rad of margin
    this.thMax = (cfg === 'FULL' ? 25 : 30) * DEG; this.thMin = -15 * DEG;
    this.I = o.de0 || 0; this.ih = o.ih0 || 0; this.mode = 'CSTAR'; this.hsp = false;
    this.trimRate = 0.3 * DEG; this.Kt = 0.5; this.tauPred = 8;
    this.kA = 4; this.kAd = 0.15; this.kAa = 5; this.tLead = 0.5; this.fwdT = 0; this.Kgi = 0.2; this.gI = 0;   // α-law gains (tuned by z_tune runs)
    this.gRef = null; this.flare = { memo: null, t30: null }; this.Vf = null; this.Vdot = 0; this.log = {};
  }
  update(dt, s, sp) {
    // s: {t, V, Vkt, rho, alpha, alphaDot, theta, thetaDot, gamma, phi, q, nz, ra_ft, inFlight}
    const ac = this.ac, th = this.th, qbar = 0.5 * s.rho * s.V * s.V, sch = clamp(this.qbar0 / qbar, 0.3, 4);
    if (this.Vf == null) this.Vf = s.Vkt;
    const Vf = this.Vf + (s.Vkt - this.Vf) * dt / 0.5; this.Vdot = (Vf - this.Vf) / dt; this.Vf = Vf;
    const Vpred = s.Vkt + this.tauPred * Math.max(0, this.Vdot);
    if (Vpred > ac.VMO_kt + 6) this.hsp = true; else if (s.Vkt < ac.VMO_kt) this.hsp = false;
    let dnz = FBW.stickToDnz(sp, this.cfg);
    if (this.hsp && dnz < 0) dnz *= FBW.hspAuthority(Vpred, ac.VMO_kt);
    const neutral = Math.abs(sp) < 0.02 && Math.abs(s.phi) <= 33 * DEG && !this.hsp && this.mode === 'CSTAR';
    if (!neutral || this.gRef == null) { this.gRef = s.gamma; this.gI = 0; }
    else { this.gI = clamp(this.gI + (this.gRef - s.gamma) * dt, -0.2, 0.2); dnz += clamp(s.V / G * (this.Kg * (this.gRef - s.gamma) + this.Kgi * this.gI), -0.3, 0.3); }
    if (this.hsp) dnz += FBW.hspDnz(Vpred, ac.VMO_kt);
    dnz = Math.min(dnz, s.V / G * this.Kth * (this.thMax - s.theta));
    dnz = Math.max(dnz, s.V / G * this.Kth * (this.thMin - s.theta));
    const nzr = FBW.nzRef(s.theta, s.phi), L = FBW.nzLimits(this.cfg);
    dnz = clamp(nzr + dnz, L.min, L.max) - nzr;
    let e = (s.nz - nzr - dnz) + (this.Vco / G) * (s.thetaDot - G * dnz / s.V);         // C* error (g)
    const aLead = s.alpha + this.tLead * s.alphaDot;
    let entered = false;
    if (this.mode === 'CSTAR' && aLead > th.aProt && s.inFlight) { this.mode = 'AOA'; entered = true; }
    if (this.mode === 'AOA') {
      const aCmd = th.aProt + Math.max(0, sp) * (th.aMax - th.aProt);
      const nzA = qbar * ac.S * ac.CLa / (ac.m * G);                                   // g per rad of α
      let eA = this.kA * nzA * (s.alpha - aCmd) + this.kAa * nzA * s.alphaDot + (this.Vco / G) * s.thetaDot * this.kAd;
      // load-factor and pitch-attitude limits stay active in AOA mode: most nose-down of (α law, C* at the limit)
      const dLim = Math.min(L.max - nzr, s.V / G * this.Kth * (this.thMax - s.theta));
      eA = Math.max(eA, (s.nz - nzr - dLim) + (this.Vco / G) * (s.thetaDot - G * dLim / s.V));
      if (entered) this.I += this.Kp * sch * (e - eA);                                    // bumpless transfer
      e = eA; this.log.aCmd = aCmd;                                                       // α law has priority while in AOA mode
      this.fwdT = sp < -0.03 ? this.fwdT + dt : 0;                                         // exit: > 8° (0.5) forward, or forward
      if (sp < -0.5 || (this.fwdT >= 0.5 && s.alpha < th.aMax)) this.mode = 'CSTAR';   // ≥ 0.5 s with α < αmax (estimate)
    }
    if (s.inFlight && s.ra_ft <= 50 && this.flare.memo == null) this.flare.memo = s.theta * RAD;
    if (this.flare.memo != null && s.ra_ft <= 30 && this.flare.t30 == null) this.flare.t30 = s.t;
    if (this.flare.memo != null && this.mode === 'CSTAR') {
      const tf = this.flare.t30 == null ? 0 : s.t - this.flare.t30;
      const thRef = FBW.flareThetaRef(this.flare.memo, tf) * DEG + sp * 10 * DEG;
      const w = clamp((50 - s.ra_ft) / 20, 0, 1);
      const eTh = (s.V / G) * (0.8 * (s.theta - thRef) + 1.0 * s.thetaDot);
      e = (1 - w) * e + w * eTh; this.log.thRef = thRef;
    }
    this.I = clamp(this.I + this.Ki * sch * e * dt, -ac.deUp, ac.deDn);
    const de = clamp(this.I + this.Kp * sch * e, -ac.deUp, ac.deDn);
    const trimOK = s.inFlight && this.flare.memo == null && s.nz > 0.5 && s.nz < 1.3 && Math.abs(s.phi) <= 33 * DEG;
    if (trimOK) {
      let r = clamp(this.Kt * de, -this.trimRate, this.trimRate);
      if (this.hsp && r > 0) r = 0; if (this.mode === 'AOA' && r < 0) r = 0;
      const ihNew = clamp(this.ih + r * dt, -ac.ihUp, ac.ihDn); this.I -= (ihNew - this.ih) / ac.tauE; this.ih = ihNew;
    }
    return de;
  }
}

export function makeCfg(ac, cfg, gear) {
  const f = ac.flap[cfg];
  return { cfg, CL0: ac.CL0 + ac.CLflap * f, Cm0: ac.Cm0 + ac.Cmflap * f, CDx: ac.CD0 + ac.CDflap * f + (gear ? ac.CDgear : 0),
    CLih: ac.CLde / ac.tauE, Cmih: ac.Cmde / ac.tauE, CLmax: ac.CLmax[cfg], adot: 0 };
}
export function forces(ac, M, x, de, ih) {      // x = [V, gamma, alpha, q, h]
  const [V, , a, q, h] = x, rho = rhoISA(h), qb = 0.5 * rho * V * V;
  let CL = M.CL0 + ac.CLa * a + ac.CLq * q * ac.c / (2 * V) + ac.CLde * de + M.CLih * ih;
  if (CL > M.CLmax) CL = M.CLmax - 0.5 * (CL - M.CLmax);
  const CD = M.CDx + ac.K * CL * CL;
  const Cm = M.Cm0 + ac.Cma * a + (ac.Cmq * q + ac.Cmadot * M.adot) * ac.c / (2 * V) + ac.Cmde * de + M.Cmih * ih;
  return { rho, qb, CL, L: qb * ac.S * CL, D: qb * ac.S * CD, Mm: qb * ac.S * ac.c * Cm };
}
export function deriv(ac, M, x, de, ih, T, phi) {
  const [V, g, a, q] = x, F = forces(ac, M, x, de, ih), Lt = F.L + T * Math.sin(a);
  return [(T * Math.cos(a) - F.D) / ac.m - G * Math.sin(g), (Lt * Math.cos(phi) - ac.m * G * Math.cos(g)) / (ac.m * V),
    q - Lt / (ac.m * V) + G * Math.cos(g) * Math.cos(phi) / V, F.Mm / ac.Iyy, V * Math.sin(g)];
}
export function rk4(ac, M, x, de, ih, T, phi, dt) {
  const add = (a, b, k) => a.map((v, i) => v + k * b[i]);
  const k1 = deriv(ac, M, x, de, ih, T, phi), k2 = deriv(ac, M, add(x, k1, dt / 2), de, ih, T, phi);
  const k3 = deriv(ac, M, add(x, k2, dt / 2), de, ih, T, phi), k4 = deriv(ac, M, add(x, k3, dt), de, ih, T, phi);
  M.adot = k1[2]; M.gdot = k1[1];
  return x.map((v, i) => v + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
export function trim(ac, M, V, h, gamma = 0) {
  const qb = 0.5 * rhoISA(h) * V * V, W = ac.m * G; let a = 0.05, ih = 0, T = 0;
  for (let it = 0; it < 80; it++) {
    const CLreq = (W * Math.cos(gamma) - T * Math.sin(a)) / (qb * ac.S);
    ih = -(M.Cm0 + ac.Cma * a) / M.Cmih; a = (CLreq - M.CL0 - M.CLih * ih) / ac.CLa;
    const CL = M.CL0 + ac.CLa * a + M.CLih * ih; T = (qb * ac.S * (M.CDx + ac.K * CL * CL) + W * Math.sin(gamma)) / Math.cos(a);
  }
  return { x: [V, gamma, a, 0, h], ih, T, a };
}

export const dt = 1 / 240;
export function run({ cfg = 'FULL', gear = true, Vkt = 133.5, h = 300, gamma = 0, T: Tfun, stick, phi: phiFun, dur = 20, ra = false, lawOpt = {} }) {
  const ac = A320, M = makeCfg(ac, cfg, gear), tr = trim(ac, M, Vkt * KT, h, gamma);
  const law = new PitchNormalLaw(ac, cfg, { ih0: tr.ih }); Object.assign(law, lawOpt);
  let x = tr.x, t = 0, deAct = 0; const out = [];
  for (let n = 0; n < Math.round(dur / dt); n++) {
    const phi = phiFun ? phiFun(t) : 0, F = forces(ac, M, x, deAct, law.ih);
    const nz = F.L / (ac.m * G), theta = x[1] + x[2] * Math.cos(phi);
    const thetaDot = (M.gdot || 0) + (M.adot || 0) * Math.cos(phi);
    const s = { t, V: x[0], Vkt: x[0] / KT, rho: F.rho, alpha: x[2], alphaDot: M.adot || 0, theta, thetaDot, gamma: x[1], phi, q: x[3], nz,
      ra_ft: ra ? x[4] / FT : 9999, inFlight: true };
    const de = law.update(dt, s, stick ? stick(t, s) : 0);
    deAct += clamp((de - deAct) / 0.06 * dt, -40 * DEG * dt, 40 * DEG * dt);   // actuator τ 0.06 s, 40°/s (estimate)
    x = rk4(ac, M, x, deAct, law.ih, Tfun ? Tfun(t, tr.T) : tr.T, phi, dt); t += dt;
    out.push({ t, nz, gd: (M.gdot || 0) * RAD, phiD: phi * RAD, a: x[2] * RAD, th: theta * RAD, gam: x[1] * RAD, Vkt: x[0] / KT, h: x[4], de: deAct * RAD, ih: law.ih * RAD, mode: law.mode, hsp: law.hsp, thRef: (law.log.thRef ?? NaN) * RAD });
    if (ra && x[4] <= 0) break;
  }
  return { out, tr, law };
}
export function runRoll({ Vkt = 133.5, h = 300, sr, dur = 20, lim = 67, hsp = false, Ldist = 0 }) {
  const ac = A320, V = Vkt * KT, qb = 0.5 * rhoISA(h) * V * V;
  const Lp = qb * ac.S * ac.b * ac.b * ac.Clp / (2 * V * ac.Ixx), Lu = qb * ac.S * ac.b * ac.ClRollMax / ac.Ixx;
  const wn = 2.0, z = 0.8, Kphi = wn * wn / Lu, Kp = (2 * z * wn + Lp) / Lu, Ki = 0.5 * Kphi;   // pole placement (estimate)
  let phi = 0, p = 0, phiRef = 0, I = 0, t = 0; const out = [];
  for (let n = 0; n < Math.round(dur / dt); n++) {
    const pCmd = FBW.rollRateCmd(sr(t), phiRef * RAD, lim, hsp) * DEG;
    phiRef = clamp(phiRef + pCmd * dt, -(lim + 5) * DEG, (lim + 5) * DEG);
    phiRef = clamp(phiRef, phi - 1 * DEG, phi + 1 * DEG);                     // reference anti-windup (≤ 1° ahead; 3° gave p overshoot 19°/s)
    const e = phiRef - phi; I = clamp(I + Ki * e * dt, -0.5, 0.5);
    const u = clamp(Kphi * e + Kp * (pCmd - p) + I - Lp * pCmd / Lu, -1, 1);
    p += (Lp * p + Lu * u + Ldist) * dt; phi += p * dt; t += dt;
    out.push({ t, phi: phi * RAD, p: p * RAD, u, phiRef: phiRef * RAD });
  }
  return { out, Lp, Lu, Kphi, Kp, Ki };
}

const at = (out, tt) => out[Math.min(out.length - 1, Math.max(0, Math.round(tt / dt) - 1))];
const sel = (out, t0, t1) => out.filter(o => o.t >= t0 && o.t <= t1);
const mx = (o, k) => Math.max(...o.map(z => z[k])), mn = (o, k) => Math.min(...o.map(z => z[k]));
const f = (v, d = 2) => (v == null || Number.isNaN(v)) ? String(v) : v.toFixed(d);

if (import.meta.url === `file://${process.argv[1]}`) {
  const tF = FBW.alphaThresholds(A320, 'FULL'), t0 = FBW.alphaThresholds(A320, 'CONF0');
  console.log('# alpha thresholds (deg, model lift curve)');
  for (const [k, v] of [['FULL', tF], ['CONF0', t0]]) console.log(k, 'aCLmax', f(v.aCLmax * RAD), 'aMax', f(v.aMax * RAD), 'aProt', f(v.aProt * RAD), 'aFloor', f(v.aFloor * RAD));
  const W = A320.m * G, Vcl = (CL) => Math.sqrt(2 * W / (1.225 * A320.S * CL)) / KT;
  console.log('SL 64.5 t FULL: VS1g', f(Vcl(tF.CLmax), 1), 'V_amax', f(Vcl(0.873 * tF.CLmax), 1), 'V_afloor', f(Vcl(0.873 * tF.CLmax - A320.CLa * 2.5 * DEG), 1), 'V_aprot', f(Vcl(0.873 * tF.CLmax - A320.CLa * 3 * DEG), 1), 'VLS=1.23VS1g', f(1.23 * Vcl(tF.CLmax), 1));

  console.log('\n# pure functions');
  console.log('nz(stick): CONF0 +1', 1 + FBW.stickToDnz(1, 'CONF0'), '-1', 1 + FBW.stickToDnz(-1, 'CONF0'), '+0.5', 1 + FBW.stickToDnz(0.5, 'CONF0'), '-0.5', 1 + FBW.stickToDnz(-0.5, 'CONF0'), '| FULL +1', 1 + FBW.stickToDnz(1, 'FULL'), '-1', 1 + FBW.stickToDnz(-1, 'FULL'));
  console.log('nzRef: phi30', f(FBW.nzRef(0, 30 * DEG), 4), 'phi33', f(FBW.nzRef(0, 33 * DEG), 4), 'phi45', f(FBW.nzRef(0, 45 * DEG), 4), 'theta10', f(FBW.nzRef(10 * DEG, 0), 4));
  console.log('flareThetaRef memo 2.5: t0', FBW.flareThetaRef(2.5, 0), 't4', f(FBW.flareThetaRef(2.5, 4), 3), 't8', FBW.flareThetaRef(2.5, 8), 't10', FBW.flareThetaRef(2.5, 10), '| memo 5 t4', f(FBW.flareThetaRef(5, 4), 3), '| memo -3 t4', FBW.flareThetaRef(-3, 4));
  console.log('bankReturn: 30', FBW.bankReturnRate(30, 67), '50', f(FBW.bankReturnRate(50, 67), 3), '67', FBW.bankReturnRate(67, 67), '| lim45 at 40', f(FBW.bankReturnRate(40, 45), 3), '| HSP lim40 at 20', f(FBW.bankReturnRate(20, 40, true), 3));
  console.log('rollRateCmd full stick at 0, 50, 67 deg:', FBW.rollRateCmd(1, 0, 67), f(FBW.rollRateCmd(1, 50, 67), 3), FBW.rollRateCmd(1, 67, 67));
  console.log('abnormal: phi126', FBW.abnormal({ phiDeg: 126, thetaDeg: 0, alphaDeg: 5, iasKt: 250, mach: 0.5 }), 'theta51', FBW.abnormal({ phiDeg: 0, thetaDeg: 51, alphaDeg: 5, iasKt: 250, mach: 0.5 }), 'alpha41', FBW.abnormal({ phiDeg: 0, thetaDeg: 5, alphaDeg: 41, iasKt: 250, mach: 0.5 }), 'ias59', FBW.abnormal({ phiDeg: 0, thetaDeg: 5, alphaDeg: 5, iasKt: 59, mach: 0.1 }), 'M0.92', FBW.abnormal({ phiDeg: 0, thetaDeg: 0, alphaDeg: 2, iasKt: 300, mach: 0.92 }), 'nominal', FBW.abnormal({ phiDeg: 30, thetaDeg: 10, alphaDeg: 5, iasKt: 250, mach: 0.5 }));
  console.log('groundBlend t2.5', FBW.groundBlend(2.5), 't6', FBW.groundBlend(6), '| hspAuthority 356/361/366:', FBW.hspAuthority(356, 350), FBW.hspAuthority(361, 350), FBW.hspAuthority(366, 350), '| hspDnz 366:', FBW.hspDnz(366, 350));

  console.log('\n# C* step, CONF0 330 kt SL 64.5 t');
  for (const sp of [1, 0.5, -1]) {
    const r = run({ cfg: 'CONF0', gear: false, Vkt: 330, h: 600, stick: (t) => (t > 1 ? sp : 0), dur: 4.5 });
    const o = sel(r.out, 1, 4.5), target = 1 + FBW.stickToDnz(sp, 'CONF0');
    const t90 = o.find(z => (z.nz - 1) / (target - 1) >= 0.9)?.t - 1;
    console.log('stick', sp, 'target', target, 'nz peak', f(sp > 0 ? mx(o, 'nz') : mn(o, 'nz'), 3), 'nz@4s', f(at(r.out, 4).nz, 3), 't90', f(t90, 2), 'theta@4.5', f(at(r.out, 4.5).th, 1), 'mode', at(r.out, 4.5).mode);
  }
  { const r1 = run({ cfg: 'CONF0', gear: false, Vkt: 330, h: 600, stick: (t) => (t > 1 ? 1 : 0), dur: 4.5 });
    const ab = r1.out.filter(o => o.nz > 2.5); console.log('stick 1: time above 2.5 g', f(ab.length * dt, 3), 's'); }
  let r = run({ cfg: 'CONF0', gear: false, Vkt: 330, h: 600, stick: (t) => (t > 1 ? 1 : 0), dur: 30, T: (t, T0) => 3 * T0 });
  console.log('\n# pitch attitude protection (full aft held 29 s, 3x thrust): theta max', f(mx(r.out, 'th')), 'nz max', f(mx(r.out, 'nz'), 3), 'theta@30', f(at(r.out, 30).th), 'V@30', f(at(r.out, 30).Vkt, 1), 'alpha max', f(mx(r.out, 'a')));
  r = run({ cfg: 'CONF0', gear: false, Vkt: 330, h: 3000, stick: (t) => (t > 1 ? -1 : 0), dur: 12 });
  console.log('nose-down protection (full fwd 11 s): theta min', f(mn(r.out, 'th')), 'nz min', f(mn(r.out, 'nz'), 3), 'V max', f(mx(r.out, 'Vkt'), 1));

  console.log('\n# approach FULL 64.5 t, 133.5 kt, gamma -3, stick neutral, thrust to 5% at t=5 s');
  r = run({ cfg: 'FULL', Vkt: 133.5, h: 600, gamma: -3 * DEG, dur: 70, T: (t, T0) => (t > 5 ? 0.05 * T0 : T0) });
  let o = r.out; const tP = o.find(z => z.mode === 'AOA')?.t; const pre = sel(o, 5, (tP ?? 70) - 0.5);
  console.log('trim alpha', f(r.tr.a * RAD), 'ih', f(r.tr.ih * RAD), 'T kN', f(r.tr.T / 1000, 1), '| gamma before prot', f(mn(pre, 'gam')), '..', f(mx(pre, 'gam')), '| t_prot', f(tP, 1), 'V at prot', tP && f(at(o, tP).Vkt, 1), 'alpha at prot', tP && f(at(o, tP).a));
  const late = sel(o, 50, 70);
  console.log('t 50-70 s: alpha', f(mn(late, 'a')), '..', f(mx(late, 'a')), 'V', f(mn(late, 'Vkt'), 1), '..', f(mx(late, 'Vkt'), 1), '| alpha max ever', f(mx(o, 'a')), '| aProt', f(tF.aProt * RAD), 'aMax', f(tF.aMax * RAD));

  console.log('\n# approach FULL, full aft stick from t=2 s, approach thrust');
  r = run({ cfg: 'FULL', Vkt: 133.5, h: 600, gamma: -3 * DEG, dur: 40, stick: (t) => (t > 2 ? 1 : 0) });
  o = r.out; const l2 = sel(o, 20, 40);
  console.log('alpha max', f(mx(o, 'a')), 'alpha 20-40 s', f(mn(l2, 'a')), '..', f(mx(l2, 'a')), 'V@40', f(at(o, 40).Vkt, 1), 'nz max', f(mx(o, 'nz'), 3), 'theta max', f(mx(o, 'th')));
  r = run({ cfg: 'FULL', Vkt: 133.5, h: 600, gamma: -3 * DEG, dur: 40, stick: (t) => (t > 2 ? 1 : 0), T: (t, T0) => (t > 2 ? 0.05 * T0 : T0) });
  o = r.out; const l3 = sel(o, 20, 40);
  console.log('idle variant: alpha max', f(mx(o, 'a')), 'alpha 20-40 s', f(mn(l3, 'a')), '..', f(mx(l3, 'a')), 'V@40', f(at(o, 40).Vkt, 1));

  for (const pb of [30, 45]) {
    r = run({ cfg: 'CONF0', gear: false, Vkt: 300, h: 3000, dur: 33, phi: (t) => Math.min(t / 3, 1) * pb * DEG, T: (t, T0) => T0 / Math.cos(Math.min(t / 3, 1) * pb * DEG) });
    console.log(`\n# bank ${pb}° stick neutral 30 s: dh`, f(at(r.out, 33).h - 3000, 1), 'm (', f((at(r.out, 33).h - 3000) / FT, 0), 'ft ) nz@33', f(at(r.out, 33).nz, 3), 'gamma@33', f(at(r.out, 33).gam, 2), 'V@33', f(at(r.out, 33).Vkt, 1));
  }

  console.log('\n# flare mode, FULL 133.5 kt, start 60 ft, gamma -3');
  for (const fl of [0, 1]) {
    r = run({ cfg: 'FULL', Vkt: 133.5, h: 60 * FT, gamma: -3 * DEG, dur: 20, ra: true,
      stick: fl ? (t, s) => (s.ra_ft < 30 ? clamp((30 - s.ra_ft) / 20, 0, 1) * 0.6 : 0) : undefined });
    o = r.out; const td = o.at(-1), i30 = o.findIndex(z => z.h <= 30 * FT), i50 = o.findIndex(z => z.h <= 50 * FT);
    console.log(fl ? 'pilot flare (stick 0→0.6 from 30 to 10 ft)' : 'stick neutral', '| theta@50ft', f(o[i50].th), 'theta@30ft', f(o[i30].th), 't50→td', f(td.t - o[i50].t, 2), 'theta@td', f(td.th), 'thRef@td', f(td.thRef), 'sink@td fpm', f(-td.Vkt * KT * Math.sin(td.gam * DEG) / FT * 60, 0), 'V@td', f(td.Vkt, 1));
  }

  console.log('\n# HSP, CONF0 SL');
  r = run({ cfg: 'CONF0', gear: false, Vkt: 340, h: 3000, gamma: -3 * DEG, dur: 90, T: (t, T0) => T0 + 60000 });
  console.log('stick neutral, +60 kN excess: Vmax', f(mx(r.out, 'Vkt'), 1), 'V@90', f(at(r.out, 90).Vkt, 1), 'hsp seen', r.out.some(z => z.hsp), 'nz max', f(mx(r.out, 'nz'), 3));
  r = run({ cfg: 'CONF0', gear: false, Vkt: 350, h: 3000, dur: 60, T: (t, T0) => 2 * T0, stick: (t) => (t > 1 ? -1 : 0) });
  console.log('full fwd from VMO, 2x thrust: Vmax', f(mx(r.out, 'Vkt'), 1), 'theta min', f(mn(r.out, 'th')), 'V@60', f(at(r.out, 60).Vkt, 1));

  console.log('\n# roll law, FULL 133.5 kt');
  let rr = runRoll({ sr: (t) => (t < 12 ? 1 : 0), dur: 30 });
  const ph = rr.out, rel = ph.filter(z => z.t > 12), t34 = rel.find(z => z.phi <= 34)?.t;
  console.log('Lp', f(rr.Lp, 3), 'Lu', f(rr.Lu, 3), 'gains Kphi', f(rr.Kphi, 2), 'Kp', f(rr.Kp, 2), '| p@2s', f(ph.find(z => z.t >= 2).p, 2), 'phi max', f(mx(ph, 'phi'), 2), 'phi@12', f(ph.find(z => z.t >= 12).phi, 2), '| released: phi@30', f(ph.at(-1).phi, 2), 't(phi<=34) after release', f(t34 - 12, 2));
  rr = runRoll({ sr: (t) => (t < 12 ? 1 : 0), dur: 20, lim: 45 });
  console.log('limit 45 (alpha prot): phi max', f(mx(rr.out, 'phi'), 2), 'phi@12', f(rr.out.find(z => z.t >= 12).phi, 2));
  rr = runRoll({ Vkt: 340, h: 3000, sr: (t) => (t < 10 ? 1 : 0), dur: 30, lim: 40, hsp: true });
  console.log('HSP limit 40: phi max', f(mx(rr.out, 'phi'), 2), 'phi 20 s after release', f(rr.out.at(-1).phi, 2));
  rr = runRoll({ sr: (t) => (t < 2 ? 1 : 0), dur: 32, Ldist: 0.02 });
  const hold = rr.out.filter(z => z.t > 6);
  console.log('bank hold after 2 s full stick, Ldist 0.02 rad/s²: phi 6-32 s', f(mn(hold, 'phi'), 2), '..', f(mx(hold, 'phi'), 2), 'phiRef', f(hold.at(-1).phiRef, 2));
  rr = runRoll({ sr: (t) => (t < 1 ? 0.5 : 0), dur: 10 });
  console.log('half stick 1 s: p@0.8', f(rr.out.find(z => z.t >= 0.8).p, 2), 'phi final', f(rr.out.at(-1).phi, 2));
}
