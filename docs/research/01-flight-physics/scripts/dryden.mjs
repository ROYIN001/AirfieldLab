// Proposed Dryden (MIL-F-8785C form) with exact discretisation, rotational gusts, and checks.
// Units SI. Unit-intensity white noise convention: E[xi(t)xi(t+s)] = delta(s).
const FT = 0.3048, KT = 0.514444;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
export function lowAlt(hft, W20fps) { // MIL-F-8785C low altitude, h in ft (clipped 10..1000)
  const h = Math.min(Math.max(hft, 10), 1000);
  const Lw = h, Lu = h / Math.pow(0.177 + 0.000823 * h, 1.2);
  const sw = 0.1 * W20fps, su = sw / Math.pow(0.177 + 0.000823 * h, 0.4);
  return { Lu: Lu * FT, Lv: Lu * FT, Lw: Lw * FT, su: su * FT, sv: su * FT, sw: sw * FT };
}
// first-order exact AR(1): returns new x with stationary sigma
const ar1 = (x, sig, tau, dt, n) => { const a = Math.exp(-dt / tau); return a * x + sig * Math.sqrt(1 - a * a) * n; };
// Dryden transverse (v or w): H(s)= sig*sqrt(tau)*(1+sqrt3 tau s)/(1+tau s)^2 driven by unit-intensity noise.
// States x1 = 1/(1+tau s) xi~, x2 = 1/(1+tau s)^2 xi~, xi~ = sig sqrt(tau) xi; y = sqrt3 x1 + (1-sqrt3) x2.
// Exact discretisation: Phi = e^{-a dt}[[1,0],[a dt,1]], Q = q a^2 ∫0^dt e^{-2as}[[1,as],[as,(as)^2]] ds, q = sig^2 tau, a = 1/tau.
export function stepTransverse(st, sig, tau, dt, n1, n2) {
  const a = 1 / tau, e = Math.exp(-a * dt), adt = a * dt;
  const x1 = e * st[0], x2 = e * (adt * st[0] + st[1]);
  const q = sig * sig * tau;
  // integrals with k = 2a: I0=∫e^{-ks}, I1=∫s e^{-ks}, I2=∫s^2 e^{-ks} over [0,dt]
  const k = 2 * a, E = Math.exp(-k * dt);
  const I0 = (1 - E) / k, I1 = (1 - E * (1 + k * dt)) / (k * k), I2 = (2 - E * (2 + 2 * k * dt + k * k * dt * dt)) / (k * k * k);
  const Q11 = q * a * a * I0, Q12 = q * a * a * a * I1, Q22 = q * a * a * a * a * I2;
  const l11 = Math.sqrt(Q11), l21 = Q12 / l11, l22 = Math.sqrt(Math.max(Q22 - l21 * l21, 0));
  st[0] = x1 + l11 * n1; st[1] = x2 + l21 * n1 + l22 * n2;
  return Math.sqrt(3) * st[0] + (1 - Math.sqrt(3)) * st[1];
}
export function sigmaP(sw, Lw, b) { // MIL-F-8785C rational p_g spectrum integrated over 0..inf
  return sw * Math.sqrt(0.8 * Math.PI ** 2 * Math.pow(Math.PI / (4 * b), 1 / 3) / (8 * b * Math.pow(Lw, 2 / 3)));
}
export class Dryden {
  constructor(seed = 1) { this.r = rng(seed); this.u = 0; this.v = [0, 0]; this.w = [0, 0]; this.vg = 0; this.wg = 0; this.p = 0; this.q = 0; this.rr = 0; this.ug = 0; }
  step(dt, P, V, b) {
    const r = this.r, wPrev = this.wg, vPrev = this.vg;
    this.ug = ar1(this.ug, P.su, P.Lu / V, dt, gauss(r));
    this.vg = stepTransverse(this.v, P.sv, P.Lv / V, dt, gauss(r), gauss(r));
    this.wg = stepTransverse(this.w, P.sw, P.Lw / V, dt, gauss(r), gauss(r));
    const taup = 4 * b / (Math.PI * V), tauq = taup, taur = 3 * b / (Math.PI * V);
    this.p = ar1(this.p, sigmaP(P.sw, P.Lw, b), taup, dt, gauss(r));
    const aq = Math.exp(-dt / tauq), ar = Math.exp(-dt / taur);
    // q_g = -(s/V)/(1+tauq s) w_g ; r_g = +(s/V)/(1+taur s) v_g   (convention: aero rate = body rate - gust rate)
    this.q = aq * this.q + (1 - aq) * (-(this.wg - wPrev) / (V * dt));
    this.rr = ar * this.rr + (1 - ar) * ((this.vg - vPrev) / (V * dt));
    return this;
  }
}
// ---------- checks ----------
if (process.argv[1].endsWith('dryden.mjs')) {
  const dt = 1 / 240, V = 95 * KT, b = 10.2;
  for (const [hft, W20kt] of [[100, 15], [300, 15], [100, 30], [50, 15]]) {
    const P = lowAlt(hft, W20kt * KT / FT);
    const d = new Dryden(42); const N = 240 * 3000; const xs = { u: new Float64Array(N), v: new Float64Array(N), w: new Float64Array(N), p: new Float64Array(N), q: new Float64Array(N), r: new Float64Array(N) };
    for (let i = 0; i < 240 * 20; i++) d.step(dt, P, V, b);
    for (let i = 0; i < N; i++) { d.step(dt, P, V, b); xs.u[i] = d.ug; xs.v[i] = d.vg; xs.w[i] = d.wg; xs.p[i] = d.p; xs.q[i] = d.q; xs.r[i] = d.rr; }
    const sd = (x) => { let m = 0; for (const v of x) m += v; m /= x.length; let s = 0; for (const v of x) s += (v - m) ** 2; return Math.sqrt(s / x.length); };
    const ac = (x, lag) => { let s = 0, s0 = 0; for (let i = 0; i + lag < x.length; i++) s += x[i] * x[i + lag]; for (const v of x) s0 += v * v; return (s / (x.length - lag)) / (s0 / x.length); };
    console.log(`h=${hft} ft W20=${W20kt} kt: target su=${P.su.toFixed(3)} sw=${P.sw.toFixed(3)} m/s Lu=${P.Lu.toFixed(1)} Lw=${P.Lw.toFixed(1)} m; sigmaP=${sigmaP(P.sw, P.Lw, b).toFixed(4)} rad/s`);
    console.log(`   measured su=${sd(xs.u).toFixed(3)} sv=${sd(xs.v).toFixed(3)} sw=${sd(xs.w).toFixed(3)} sp=${sd(xs.p).toFixed(4)} sq=${sd(xs.q).toFixed(4)} sr=${sd(xs.r).toFixed(4)} rad/s`);
    for (const xi of [0.5, 1, 2]) { // spatial lag in units of Lw
      const lag = Math.round(xi * P.Lw / V / dt);
      console.log(`   R_w(xi=${xi}Lw) meas ${ac(xs.w, lag).toFixed(3)} theory (1-xi/2)e^-xi ${((1 - xi / 2) * Math.exp(-xi)).toFixed(3)}`);
    }
    // Yeager approx sigma_p and sigma_q, sigma_r
    console.log(`   Yeager eq.(8) sigma_p=1.9 sw/sqrt(Lw b)=${(1.9 * P.sw / Math.sqrt(P.Lw * b)).toFixed(4)}; eq.(14) sigma_q~sqrt(pi/(2 Lw b)) sw=${(Math.sqrt(Math.PI / (2 * P.Lw * b)) * P.sw).toFixed(4)}; eq.(17) sigma_r~sqrt(2pi/(3 Lw b)) sv=${(Math.sqrt(2 * Math.PI / (3 * P.Lw * b)) * P.sv).toFixed(4)}`);
    // equivalent rolling moment: Clp*pg*b/2V vs aileron
    const Clp = -0.47, Clda = 0.16;
    const sp = sigmaP(P.sw, P.Lw, b);
    console.log(`   roll: |Clp|*sigmaP*b/(2V)=${(0.47 * sp * b / (2 * V)).toFixed(4)} -> equivalent aileron sigma ${((0.47 * sp * b / (2 * V)) / Clda * 180 / Math.PI).toFixed(2)} deg`);
  }
  // dt sensitivity of transverse filter: dt=1/60 and 1/30
  for (const dtt of [1 / 30, 1 / 60, 1 / 240, 1 / 1000]) {
    const P = lowAlt(20, 30 * KT / FT); const d = new Dryden(7); let s = 0; const N = Math.round(2000 / dtt);
    for (let i = 0; i < N; i++) { d.step(dtt, P, V, b); s += d.wg * d.wg; }
    console.log(`dt=${dtt.toFixed(4)} h=20ft (Lw=${P.Lw.toFixed(2)} m, tau=${(P.Lw / V).toFixed(3)} s) sw target ${P.sw.toFixed(3)} measured ${Math.sqrt(s / N).toFixed(3)}`);
  }
  // PSD level at low frequency: first-order (current code) vs Dryden for w: ratio Phi(0)
  console.log('Phi_w(0) ratio current-first-order(L) / Dryden 8785C =', (2).toFixed(2), '; high-freq ratio =', (2 / 3).toFixed(3));
}
