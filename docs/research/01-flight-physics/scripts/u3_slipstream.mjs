// U3: propeller slipstream for the AirfieldLab trainer: actuator disc (momentum theory), contraction,
// tail immersion, swirl from torque (angular-momentum flux), fin side force, rudder capacity. ค่าประมาณ.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, atmosphere } = M;
const D = 2.44, R = D / 2, A = Math.PI * R * R, rpm = 2000, Om = rpm * 2 * Math.PI / 60;
const thrustAvail = (V) => { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); };
// geometry from u1 (src/70-aircraft.js): thrust line 0.06 m above CG, prop at x=+3.94
const geo = { xProp: 3.94, zLine_up: 0.06, ht: { x: -5.104, z_up: 0.30, span: 3.7, fusW: 0.40, S: 3.645 },
  fin: { x: -5.239, zRoot_up: 0.34, h: 1.75, S: 2.056, zac_up: 1.122 }, Vh: 0.69, a_t: 3.67 };
function disc(Va, T, rho) {           // JSBSim FGPropeller form (McCormick eq. 6.15)
  const vi = 0.5 * (-Va + Math.sqrt(Va * Va + 2 * T / (rho * A)));
  const Vj = Va + 2 * vi;               // fully developed slipstream
  const Rj = R * Math.sqrt((Va + vi) / Vj);
  return { vi, Vj, Rj, qsq: Va > 0.5 ? (Vj / Va) ** 2 : Infinity, mdot: rho * A * (Va + vi) };
}
// span fraction of a horizontal line at vertical offset dz inside a circle of radius Rj, excluding the fuselage
const immH = (Rj, dz, span, fusW) => { const half = Math.sqrt(Math.max(0, Rj * Rj - dz * dz)); return Math.max(0, 2 * half - fusW) / (span - fusW); };
// fraction of fin height inside the circle: fin spans [zRoot, zRoot+h] above thrust line offset
const immV = (Rj, z0, h) => { const lo = Math.max(z0, -Rj), hi = Math.min(z0 + h, Rj); return Math.max(0, hi - lo) / h; };
const cases = [
  { name: 'static, full power', kt: 0, thr: 1 }, { name: 'taxi 10 kt, 40% power', kt: 10, thr: 0.4 },
  { name: 'takeoff roll 40 kt full', kt: 40, thr: 1 }, { name: 'rotation 70 kt full', kt: 70, thr: 1 },
  { name: 'go-around 80 kt full', kt: 80, thr: 1 }, { name: 'approach 95 kt (trim thr)', kt: 95, thr: 0.26 },
  { name: 'climb 140 kt full', kt: 140, thr: 1 }, { name: 'cruise 200 kt full', kt: 200, thr: 1 },
];
const atm = atmosphere(3, 31 - 15);
const rho = atm.rho;
const kq = 0.8, ksw = 0.5;            // mixing factor on dynamic-pressure excess; swirl straightening factor (ค่าประมาณ)
const av = 2.6;                        // fin lift-curve slope per rad (effective AR ~ 1.5 x 1.55 end-plate) ค่าประมาณ
const rows = [];
for (const c of cases) {
  const V = c.kt * KT, T = c.thr * thrustAvail(V), P = c.thr * AC.P, Q = P / Om;
  const d = disc(V, T, rho);
  const q = 0.5 * rho * V * V, qs = 0.5 * rho * d.Vj * d.Vj;
  const fH = Math.min(1, immH(d.Rj, geo.ht.z_up - geo.zLine_up, geo.ht.span, geo.ht.fusW));
  const fV = immV(d.Rj, geo.fin.zRoot_up - geo.zLine_up, geo.fin.h);
  const qH = q + fH * kq * (qs - q), qV = q + fV * kq * (qs - q);
  // swirl: constant r*v_theta = Q/mdot (free-vortex far wake); sidewash at the immersed fin centroid
  const K = Q / d.mdot;
  const zlo = Math.max(geo.fin.zRoot_up - geo.zLine_up, 0.15), zhi = Math.min(geo.fin.zRoot_up - geo.zLine_up + geo.fin.h, d.Rj);
  const rfin = zhi > zlo ? (zlo + zhi) / 2 : NaN;
  const sigma = zhi > zlo ? ksw * Math.atan(K / (rfin * d.Vj)) : 0;
  const Ysw = qs * kq * geo.fin.S * fV * av * sigma;          // +y (right) for clockwise-from-behind
  const Nsw = geo.fin.x * Ysw, Lsw = (geo.fin.zac_up) * Ysw * 0;   // roll term small; reported separately
  // rudder capacity: Cndr scaled by fin dynamic pressure ratio
  const Nrud_max = (qV) * AC.S * AC.b * Math.abs(AC.Cndr) * AC.drMax;
  rows.push({ case: c.name, V_kt: c.kt, T_N: Math.round(T), Q_Nm: Math.round(Q), Tc_disc: V > 0.5 ? +(T / (q * A)).toFixed(2) : 'inf',
    Tc_rhoV2D2: V > 0.5 ? +(T / (rho * V * V * D * D)).toFixed(3) : 'inf', vi_ms: +d.vi.toFixed(1), Vj_kt: +(d.Vj / KT).toFixed(1), Rj_m: +d.Rj.toFixed(3),
    qs_over_q: isFinite(d.qsq) ? +d.qsq.toFixed(2) : 'inf', fH: +fH.toFixed(2), fV: +fV.toFixed(2),
    etaH_eff: V > 0.5 ? +(qH / q).toFixed(2) : 'inf', etaV_eff: V > 0.5 ? +(qV / q).toFixed(2) : 'inf',
    qH_Pa: Math.round(qH), qV_Pa: Math.round(qV), swirl_K_m2s: +K.toFixed(2), r_fin_m: +rfin.toFixed(2), sidewash_deg: +(sigma * RAD).toFixed(1),
    Y_fin_N: Math.round(Ysw), N_swirl_Nm: Math.round(Nsw), N_rudder_max_Nm: Math.round(Nrud_max), rudder_frac_needed: +(Math.abs(Nsw) / Nrud_max).toFixed(2) });
}
console.log('rho', rho.toFixed(4), 'A', A.toFixed(3), 'Omega', Om.toFixed(1));
for (const r of rows) console.log(JSON.stringify(r));
