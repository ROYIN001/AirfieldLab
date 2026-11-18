// u2_expected.mjs — expected values for section 2 tests (estimates) + current-model numbers
import { M } from 'test/harness.mjs';
import fs from 'fs';
const { AC, DEG, KT, atmosphere, FIELD } = M;
const out = {};
// (a) alpha-dot derivatives from tail geometry (sec-06 back-derived geometry)
const eta = 0.9, VH = 0.596, at = 3.9, lt = 5.42, c = AC.c, A = AC.b ** 2 / AC.S;
const dedaOpts = { aeromatic_4_over_A_plus_2: 4 / (A + 2), sec06_backsolved: 0.36, chosen: 0.40 };
out.alphadot = {};
for (const [k, d] of Object.entries(dedaOpts)) out.alphadot[k] = { deda: +d.toFixed(3), CLadot: +(2 * eta * VH * at * d).toFixed(3), Cmadot: +(-2 * eta * VH * at * d * lt / c).toFixed(3) };
out.alphadot.current = { CLadot: AC.CLadot, Cmadot: AC.Cmadot };
out.alphadot.CLq_tail = +(2 * eta * VH * at).toFixed(3); out.alphadot.Cmq_tail = +(-2 * eta * VH * at * lt / c).toFixed(3);
out.A = +A.toFixed(3);
// (b) ground effect functions
const sigma = (hb) => Math.exp(-2.48 * Math.pow(2 * hb, 0.768));
const mcc = (hb) => { const g = (16 * hb) ** 2; return g / (1 + g); };
const rEpsFit = (() => { // least-squares fit r = 1 - exp(-a hb^m) to VLM table
  const T = JSON.parse(fs.readFileSync(new URL('./u2_ge_table.json', import.meta.url))).out.filter((r) => r.hb >= 0.075);
  let best = null;
  for (let a = 3; a <= 6; a += 0.01) for (let m = 0.5; m <= 0.9; m += 0.002) {
    let e = 0; for (const r of T) e += (1 - Math.exp(-a * r.hb ** m) - r.epsRatio) ** 2;
    if (!best || e < best.e) best = { a, m, e };
  }
  return { a: +best.a.toFixed(2), m: +best.m.toFixed(3), rms: +Math.sqrt(best.e / T.length).toFixed(4) };
})();
out.rEpsFit = rEpsFit;
const rEps = (hb) => 1 - Math.exp(-rEpsFit.a * hb ** rEpsFit.m);
const CLaw = 4.4;   // wing-body part (estimate: CLa 4.8 minus tail share)
out.ge = [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1.0].map((hb) => ({ hb, kD_tani: +(1 - sigma(hb)).toFixed(3), kD_repo: +mcc(hb).toFixed(3),
  kL_proposed: +(1 / (1 - sigma(hb) * CLaw / (Math.PI * A))).toFixed(3), kL_repo: +(1 + 0.12 * (1 - mcc(hb))).toFixed(3),
  rEps: +rEps(hb).toFixed(3), dCm_repo: +(-0.06 * (1 - mcc(hb))).toFixed(4) }));
// trim change at touchdown: 80 kt IAS, flaps 1, gear down, VTBD 31C; current model vs proposed
const isaDev = 31 - (15 - 0.0065 * FIELD.elev), atm = atmosphere(FIELD.elev, isaDev);
const V = 80 * KT / Math.sqrt(atm.rho / 1.225), qb = 0.5 * atm.rho * V * V, W = AC.m * 9.80665, CLreq = W / (qb * AC.S);
function trimRepo(hw) { const hb = hw / AC.b, ge = (16 * hw / AC.b) ** 2, phi = ge / (1 + ge);
  const CLa = AC.CLa * (1 + 0.12 * (1 - phi)), c0 = AC.CL0 + AC.CLflap, m0 = AC.Cm0 + AC.Cmflap - 0.06 * (1 - phi), det = CLa * AC.Cmde - AC.CLde * AC.Cma;
  return { alpha: ((CLreq - c0) * AC.Cmde - AC.CLde * (-m0)) / det, de: (CLa * (-m0) - AC.Cma * (CLreq - c0)) / det, CDi: AC.K * phi * (CLreq - 0.15) ** 2 }; }
const r0 = trimRepo(300), r1 = trimRepo(0.1 * AC.b);
out.trimRepo = { CLreq: +CLreq.toFixed(3), dAlpha_deg: +((r1.alpha - r0.alpha) / DEG).toFixed(2), dDe_deg: +((r1.de - r0.de) / DEG).toFixed(2), CDiRatio: +(r1.CDi / r0.CDi).toFixed(3) };
// proposed: induced-angle shift on wing (Katzoff) + tail downwash reduction; whole-aircraft linear model
// wing CL share = CLreq (tail small); eps = deda*CL_w/CLaw
const kT = eta * VH * at, deda = 0.40;
function trimProp(hb) {
  const s = sigma(hb), dAlphaInd = -s * CLreq / (Math.PI * A);       // Katzoff NACA 738 p.10
  const eps = deda * CLreq / CLaw, dEps = -(1 - rEps(hb)) * eps;        // rad
  // tail AoA change at fixed alpha_body = -dEps (+ deda*dAlphaInd ignored via eps based on CL) ; extra tail lift -> dCm
  const dCm = -kT * (-dEps);                                            // nose-down
  // solve trim: CLa*da + CLde*dde = 0 (same CL) with da including induced shift; Cma*da + Cmde*dde + dCm = 0
  // simplest: alpha shift from induced angle, then elevator for dCm and for Cma*dAlpha
  const det = AC.CLa * AC.Cmde - AC.CLde * AC.Cma;
  const dCL0 = -AC.CLa * dAlphaInd;                                      // equivalent extra lift at fixed alpha
  const da = ((0 - dCL0) * AC.Cmde - AC.CLde * (-dCm)) / det, dde = (AC.CLa * (-dCm) - AC.Cma * (0 - dCL0)) / det;
  return { sigma: +s.toFixed(3), dAlphaInd_deg: +(dAlphaInd / DEG).toFixed(2), eps_deg: +(eps / DEG).toFixed(2), dEps_deg: +(dEps / DEG).toFixed(2), dCm: +dCm.toFixed(4), dAlpha_deg: +(da / DEG).toFixed(2), dDe_deg: +(dde / DEG).toFixed(2) };
}
out.trimProposed = { hb01: trimProp(0.1), hb02: trimProp(0.2), hb05: trimProp(0.5) };
// (c) blown wing increment, momentum form (estimate): dCL = kw*(Sb/S)*[CLaw*alpha_w*(Vs/V-1) + CLflapLocal*((Vs/V)^2-1)]
const Sb = (0.9 * 2.44 - 1.0) * 2.2, kw = 0.5;
function blown(V, Vs, alphaW, flapCL) { return kw * (Sb / AC.S) * (CLaw * alphaW * (Vs / V - 1) + flapCL * ((Vs / V) ** 2 - 1)); }
out.blown = { Sb: +Sb.toFixed(2), Sb_over_S: +(Sb / AC.S).toFixed(3), ga80: +blown(41.2, 70.2, 8 * DEG, AC.CLflap).toFixed(3), app: +blown(51.0, 57.9, 4 * DEG, AC.CLflap).toFixed(3) };
// slipstream unit values
const rho0 = atm.rho, Ad = Math.PI * 1.22 ** 2;
out.static = { rho: +rho0.toFixed(3), vi: +Math.sqrt(AC.T0 / (2 * rho0 * Ad)).toFixed(2), qs: +(AC.T0 / Ad).toFixed(0), rs_over_R: +(Math.SQRT1_2).toFixed(3) };
console.log(JSON.stringify(out, null, 1));
fs.writeFileSync(new URL('./u2_expected.json', import.meta.url), JSON.stringify(out, null, 1));
