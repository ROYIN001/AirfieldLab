// Section 6: proposed reversible elevator (hinge moment) model for the fictional trainer.
// All geometry and Ch values are ESTIMATES (ค่าประมาณ); method documented in sec-06.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, G0, atmosphere, FIELD } = M;
const LBF = 4.44822, IN = 0.0254;
const P = {
  eta: 0.90, at: 3.9, tau: 0.55,                     // tail efficiency, tail lift slope /rad, elevator effectiveness
  deda: AC.Cmadot / AC.Cmq,                           // dε/dα inferred from AC (Cmα̇/Cmq ratio) = 0.36
  lt: (-AC.Cmde / AC.CLde) * AC.c,                    // tail arm from Cmδe/CLδe = 5.42 m
  Se: 1.10, ce: 0.30,                                 // elevator area aft of hinge (m²), mean chord (m)
  G: 2.40,                                            // gearing |dδe/dx_s| rad per metre of stick-grip travel
  Cha: -0.0020 * RAD, Chd: -0.0060 * RAD, Cht: -0.0035 * RAD, Ch0: 0, // per rad
};
P.Sh = AC.CLde / (P.eta * P.at * P.tau) * AC.S;
P.VH = P.Sh * P.lt / (AC.S * AC.c);
const W = AC.m * G0;
function trim(Vkt, flaps, h = 300) {               // 1-g level-flight trim of the linear AC model (no ground effect)
  const atm = atmosphere(FIELD.elev + h, 0), V = Vkt * KT, qb = 0.5 * atm.rho * V * V;
  const CLreq = W / (qb * AC.S), c0 = AC.CL0 + AC.CLflap * flaps, m0 = AC.Cm0 + AC.Cmflap * flaps; // out of ground effect: deriv() terms 0.12(1-phiGE) and 0.06(1-phiGE) vanish
  const CLa = AC.CLa;
  const alpha = ((CLreq - c0) * AC.Cmde - AC.CLde * (-m0)) / (CLa * AC.Cmde - AC.CLde * AC.Cma);
  const de = (CLa * (-m0) - AC.Cma * (CLreq - c0)) / (CLa * AC.Cmde - AC.CLde * AC.Cma);
  return { V, qb, alpha, de, CLa };
}
const alphaT = (alpha, q, V) => alpha * (1 - P.deda) + q * P.lt / V;     // tail AoA minus constant (absorbed in Ch0)
const Ch = (aT, de, dt) => P.Ch0 + P.Cha * aT + P.Chd * de + P.Cht * dt;
const force = (qb, ch) => P.G * P.eta * qb * P.Se * P.ce * ch;          // pull positive (N)
function perG(t) {                                   // quasi-steady pull-up increments per g
  const qh = (G0 / t.V) * AC.c / (2 * t.V), dCL = W / (t.qb * AC.S);
  const a11 = t.CLa, a12 = AC.CLde, b1 = dCL - AC.CLq * qh, a21 = AC.Cma, a22 = AC.Cmde, b2 = -AC.Cmq * qh;
  const det = a11 * a22 - a12 * a21;
  return { da: (b1 * a22 - a12 * b2) / det, dde: (a11 * b2 - a21 * b1) / det, dq: G0 / t.V };
}
const res = { geometry: { Sh: +P.Sh.toFixed(2), lt: +P.lt.toFixed(2), VH: +P.VH.toFixed(3), deda: +P.deda.toFixed(3),
  Cmq_tail_check: +(-2 * P.eta * P.VH * P.at * P.lt / AC.c).toFixed(1), Cmadot_tail_check: +(-2 * P.eta * P.VH * P.at * P.lt / AC.c * P.deda).toFixed(2),
  Cma_tail: +(-P.eta * P.VH * P.at * (1 - P.deda)).toFixed(3) } };
// neutral points: stick-fixed hn - h = -Cma/CLa ; stick-free with free-elevator factor
const Fe = 1 - P.tau * P.Cha / P.Chd;
const CLa = AC.CLa;
const SMfix = -AC.Cma / CLa;
const dCma_free = P.eta * P.VH * P.at * (1 - P.deda) * (1 - Fe);       // destabilising increment when elevator floats
const SMfree = -(AC.Cma + dCma_free) / CLa;
res.neutral = { freeElevatorFactor: +Fe.toFixed(3), SMfix_c: +SMfix.toFixed(3), SMfree_c: +SMfree.toFixed(3) };
// trim tab and stick force vs speed, trimmed at V0 (tab fixed), per configuration
function sweep(V0, flaps, Vs) {
  const t0 = trim(V0, flaps); const aT0 = alphaT(t0.alpha, 0, t0.V);
  const dt = -(P.Ch0 + P.Cha * aT0 + P.Chd * t0.de) / P.Cht;          // tab for zero force at V0
  const rows = Vs.map((v) => { const t = trim(v, flaps); const F = force(t.qb, Ch(alphaT(t.alpha, 0, t.V), t.de, dt)); return [v, +(F / LBF).toFixed(2)]; });
  const dv = 1, tp = trim(V0 + dv, flaps), tm = trim(V0 - dv, flaps);
  const Fp = force(tp.qb, Ch(alphaT(tp.alpha, 0, tp.V), tp.de, dt)), Fm = force(tm.qb, Ch(alphaT(tm.alpha, 0, tm.V), tm.de, dt));
  const grad = (Fm - Fp) / (2 * dv);   // N/kt, positive = pull needed when slower (stable)
  const g = perG(t0); const Fn = force(t0.qb, P.Cha * (g.da * (1 - P.deda) + g.dq * P.lt / t0.V) + P.Chd * g.dde);
  const xs = Math.abs(g.dde) / P.G;   // stick travel per g (m)
  return { V0, flaps, de_trim_deg: +(t0.de * RAD).toFixed(2), alpha_deg: +(t0.alpha * RAD).toFixed(2), tab_deg: +(dt * RAD).toFixed(2), grad_N_per_kt: +grad.toFixed(3), grad_lbf_per_kt: +(grad / LBF).toFixed(3),
    Fs_per_g_N: +Fn.toFixed(1), Fs_per_g_lbf: +(Fn / LBF).toFixed(2), stick_per_g_in: +(xs / IN).toFixed(2), lb_per_in: +((Fn / LBF) / (xs / IN)).toFixed(2), dde_per_g_deg: +(g.dde * RAD).toFixed(2), F_vs_V_lbf: rows };
}
res.approach = sweep(95, 1, [80, 85, 90, 95, 100, 105, 110]);
res.cruise = sweep(150, 0, [120, 130, 140, 150, 160, 170, 180]);
res.climb = sweep(110, 0, [95, 100, 105, 110, 115, 120, 125]);
// force to reach limit load (23.155) at VO-like speed for nL = 4.4 and 6
res.limitPull = [4.4, 6].map((nL) => ({ nL, F_lbf: +((nL - 1) * res.cruise.Fs_per_g_lbf).toFixed(1) }));
// floating angle of free elevator per deg alpha
res.float_deg_per_deg_alpha = +(-(P.Cha * (1 - P.deda)) / P.Chd).toFixed(3);
// gearing / stops
res.stick = { aft_in: +((AC.deUp / P.G) / IN).toFixed(2), fwd_in: +((AC.deDn / P.G) / IN).toFixed(2) };
console.log(JSON.stringify({ P: { ...P, Cha_per_deg: P.Cha * DEG, Chd_per_deg: P.Chd * DEG, Cht_per_deg: P.Cht * DEG }, ...res }, null, 1));
