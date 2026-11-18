// u2_delay.mjs — short-period (alpha, q) at Vapp: derivative form (CLadot/Cmadot) vs explicit downwash time delay.
// Tail geometry from sec-06 (lt 5.42 m, VH 0.596, a_t 3.9, eta 0.9); deda 0.40 (DATCOM-type estimate, see text).
const D2R = Math.PI / 180;
const m = 2250, Iyy = 7300, S = 16.3, c = 1.65, rho = 1.160, V = 50.2, g = 9.80665;
const qb = 0.5 * rho * V * V;
const eta = 0.9, VH = 0.596, at = 3.9, lt = 5.42, deda = 0.40, Sh = VH * S * c / lt;
const kT = eta * VH * at;                       // tail moment factor
const CLa = 4.8, Cma = -0.72, CLde = 0.35, Cmde = -1.15;
const CLq = 7.5, Cmq_tail = -2 * kT * lt / c, Cmq = Cmq_tail;      // use tail-theory Cmq in both models
const CLadot = 2 * kT * deda / 1 * 1 / VH * VH;  // = 2 eta VH at deda
const Cmadot = -CLadot * lt / c;
// split for the delay model: tail lift slope part and wing-body remainder
const CLa_t = eta * (Sh / S) * at, CLa_wb = CLa - CLa_t * (1 - deda), Cma_wb = Cma + kT * (1 - deda);
const tau = lt / V, dt = 1 / 240, nd = Math.round(tau / dt);
function sim(model, input, T = 6) {
  let a = 0, q = 0; const hist = new Array(nd + 1).fill(0); const out = [];
  const f = (a, q, aDel, de, adotPrev) => {
    let CL, Cm;
    if (model === 'deriv') {
      // implicit alpha-dot: solve CL with adot term algebraically: adot = q - (qb S/(mV)) CL  (small-angle, level, no gravity perturbation)
      const k = qb * S / (m * V), kh = c / (2 * V);
      const CL0 = CLa * a + CLq * q * kh + CLde * de;     // without adot
      const adot = (q - k * CL0) / (1 + k * CLadot * kh);
      CL = CL0 + CLadot * adot * kh;
      Cm = Cma * a + Cmq * q * kh + Cmadot * adot * kh + Cmde * de;
      return [adot, qb * S * c * Cm / Iyy];
    } else {
      const eps = deda * aDel, aT = a - eps + q * lt / V;    // tail AoA relative to its trim value
      CL = CLa_wb * a + CLa_t * aT + CLde * de + (CLq - 2 * kT) * q * c / (2 * V); // wing part of CLq kept
      Cm = Cma_wb * a - kT * aT + Cmde * de;
      const adot = q - qb * S / (m * V) * CL;
      return [adot, qb * S * c * Cm / Iyy];
    }
  };
  for (let i = 0; i < T / dt; i++) {
    const t = i * dt, de = input(t);
    const aDel = hist[0];    // alpha(t - tau), held over the step
    const k1 = f(a, q, aDel, de), k2 = f(a + dt / 2 * k1[0], q + dt / 2 * k1[1], aDel, de);
    const k3 = f(a + dt / 2 * k2[0], q + dt / 2 * k2[1], aDel, de), k4 = f(a + dt * k3[0], q + dt * k3[1], aDel, de);
    a += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); q += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    hist.shift(); hist.push(a); out.push({ t: t + dt, a, q });
  }
  return out;
}
const step = (t) => (t > 0.2 ? -2 * D2R : 0);
const r1 = sim('deriv', step), r2 = sim('delay', step);
const pk = (r, k) => r.reduce((m, x) => (Math.abs(x[k]) > Math.abs(m[k]) ? x : m));
const p1 = pk(r1, 'q'), p2 = pk(r2, 'q');
const fin1 = r1[r1.length - 1], fin2 = r2[r2.length - 1];
let maxd = 0; for (let i = 0; i < r1.length; i++) maxd = Math.max(maxd, Math.abs(r1[i].q - r2[i].q));
console.log(`tail Sh=${Sh.toFixed(2)} m2, tau=lt/V=${tau.toFixed(3)} s (${nd} steps); CLadot=${CLadot.toFixed(2)}, Cmadot=${Cmadot.toFixed(2)}, Cmq(tail)=${Cmq.toFixed(2)}`);
console.log(`elevator step -2 deg: peak q deriv ${(p1.q / D2R).toFixed(3)} deg/s @${p1.t.toFixed(2)}s, delay ${(p2.q / D2R).toFixed(3)} deg/s @${p2.t.toFixed(2)}s; max |dq| ${(maxd / D2R).toFixed(3)} deg/s; final alpha ${(fin1.a / D2R).toFixed(3)} vs ${(fin2.a / D2R).toFixed(3)} deg`);
// damping / frequency from the linear derivative model (exact eigenvalues of 2x2)
function eig(Cmad) {
  const kh = c / (2 * V), k = qb * S / (m * V);
  const Za = -k * CLa, Zq = 1 - k * CLq * kh, Zad = k * CLadot * kh;   // adot(1+Zad) = Za a + Zq q
  const Ma = qb * S * c * Cma / Iyy, Mq = qb * S * c * Cmq * kh / Iyy, Mad = qb * S * c * Cmad * kh / Iyy;
  const a11 = Za / (1 + Zad), a12 = Zq / (1 + Zad), a21 = Ma + Mad * a11, a22 = Mq + Mad * a12;
  const tr = a11 + a22, det = a11 * a22 - a12 * a21, wn = Math.sqrt(det), zeta = -tr / (2 * wn);
  return { wn, zeta };
}
for (const C of [0, -4.5, Cmadot, -7.27]) { const e = eig(C); console.log(`Cmadot ${C.toFixed(2)}: wn ${e.wn.toFixed(3)} rad/s, zeta ${e.zeta.toFixed(3)}`); }
// sharp vertical gust (alpha of air mass +1 deg step): delay model vs derivative model with ideal adot impulse vs repo clamp+filter
function gust(model) {
  // treat gust as change in a seen by wing at t0, by tail at t0 + tau (penetration) — delay model handles via history
  let a = 0, q = 0, ag = 0; const hist = new Array(nd + 1).fill(0); let maxq = 0;
  for (let i = 0; i < 4 / dt; i++) {
    const t = i * dt; ag = t > 0.2 ? 1 * D2R : 0;     // air-mass alpha increment
    const aw = a + ag;                                  // wing AoA
    // tail sees the gust with delay tau (penetration) and the wing's downwash with delay tau
    const aTailGust = (t - 0.2) > tau ? 1 * D2R : 0;
    const eps = deda * hist[0];
    const aT = a + aTailGust - eps + q * lt / V;
    const CL = CLa_wb * aw + CLa_t * aT + (CLq - 2 * kT) * q * c / (2 * V);
    const Cm = Cma_wb * aw - kT * aT;
    const adot = q - qb * S / (m * V) * CL;
    a += adot * dt; q += qb * S * c * Cm / Iyy * dt;
    hist.shift(); hist.push(aw); maxq = Math.max(maxq, Math.abs(q));
  }
  return maxq;
}
console.log(`1 deg sharp-edged vertical gust: peak |q| (delay+penetration model) ${(gust() / D2R).toFixed(3)} deg/s`);
