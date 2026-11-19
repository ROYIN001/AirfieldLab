// u2_slip.mjs — actuator-disk slipstream at the tail of the trainer (estimates). Geometry: visual model src/70-aircraft.js
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, KT, atmosphere, FIELD } = M;
const D = 2.44, R = D / 2, A = Math.PI * R * R, rHub = 0.25, Om = 2000 * 2 * Math.PI / 60;
const thrustAvail = (V) => { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); };
// tail geometry (body, metres from CG; z up here): thrust line z=+0.06; HT plane z=+0.30, semi 1.85, chord 1.25->0.72, root hidden |y|<0.2
// fin root z=+0.34, height 1.75, chord 1.55->0.80; HT c/4 x≈-5.1, fin c/4 x≈-5.25 ; prop disk x=+3.94
const zThr = 0.06, zHT = 0.30, zFin = 0.34;
const cHT = (y) => 1.25 - 0.53 * (y / 1.85), cFin = (h) => 1.55 - 0.75 * (h / 1.75);
const integ = (f, a, b, n = 200) => { if (b <= a) return 0; let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h) * h; return s; };
const kappa = 0.43;   // NACA TR 690: effective/average dynamic-pressure increment (1.30-1)/(1.70-1)
const kSw = 0.5;      // swirl straightening by wing root/fuselage (estimate, low confidence)
const Sv = integ(cFin, 0, 1.75), lv = 5.25 + 3.94 - 3.94, Sh = 2 * integ(cHT, 0.2, 1.85), av = 2.8, etaV = 0.9;
export function slip({ V, T, P, rho }) {
  const vi = 0.5 * (-V + Math.sqrt(V * V + 2 * T / (rho * A)));
  const Vs = V + 2 * vi, rs = R * Math.sqrt((V + vi) / (V + 2 * vi));
  const q = 0.5 * rho * V * V, qs = 0.5 * rho * Vs * Vs;
  const Q = P / Om, C = Q / (Math.PI * rho * (V + vi) * (R * R - rHub * rHub));   // free-vortex swirl: w_t r = C
  // immersion (slipstream centred on thrust line at the tail)
  const dzH = zHT - zThr, wH = rs > dzH ? Math.sqrt(rs * rs - dzH * dzH) : 0;
  const kH = 2 * integ(cHT, 0.2, Math.min(wH, 1.85)) / Sh;
  const hImm = Math.max(0, Math.min(1.75, rs - (zFin - zThr)));
  const kV = integ(cFin, 0, hImm) / Sv;
  // chord-weighted swirl angle over the immersed fin
  const rMin = Math.max(zFin - zThr, rHub * rs / R);
  const swAng = hImm > 0 ? integ((h) => cFin(h) * Math.atan(C / ((zFin - zThr + h) * Vs)), 0, hImm) / integ(cFin, 0, hImm) : 0;
  const qEffH = q + kappa * kH * (qs - q), qEffV = q + kappa * kV * (qs - q);
  // yawing moment from swirl on the fin (s = +1, clockwise from behind -> nose-left, N < 0)
  const Nsw = -kSw * kappa * kV * qs * Sv * etaV * av * swAng * lv;    // uses fin area fraction in jet
  return { V, T, vi, Vs, rs, q, qs, ratio: q > 0 ? qs / q : Infinity, Q, swirlDeg: swAng / DEG, kH, kV, qEffH, qEffV, Nsw };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const ac = new Aircraft(); ac.isaDev = 31 - (15 - 0.0065 * FIELD.elev);
  const tr = ac.setApproach({ dist: 5500 });
  const rho = atmosphere(FIELD.elev + 300, ac.isaDev).rho, rho0 = atmosphere(FIELD.elev, ac.isaDev).rho;
  const Vapp = ac.air.V, Tapp = ac.air.T, thrApp = ac.thr;
  console.log(`Sv=${Sv.toFixed(2)} m2 Sh(exposed)=${Sh.toFixed(2)} m2; approach: V=${Vapp.toFixed(1)} m/s thr=${thrApp.toFixed(3)} T=${Tapp.toFixed(0)} N rho=${rho.toFixed(3)}; rho(field,31C)=${rho0.toFixed(3)}`);
  const cases = [
    ['static, full power', 0, AC.T0, AC.P, rho0],
    ['20 kt roll, full', 20 * KT, thrustAvail(20 * KT), AC.P, rho0],
    ['40 kt roll, full', 40 * KT, thrustAvail(40 * KT), AC.P, rho0],
    ['70 kt rotate, full', 70 * KT, thrustAvail(70 * KT), AC.P, rho0],
    ['80 kt go-around, full', 80 * KT, thrustAvail(80 * KT), AC.P, rho0],
    ['approach trim', Vapp, Tapp, thrApp * AC.P, rho],
    ['approach, idle', Vapp, AC.idle * thrustAvail(Vapp), AC.idle * AC.P, rho],
  ];
  const Cnd = -0.072, S = AC.S, b = AC.b;
  const res = [];
  for (const [name, V, T, P, r] of cases) {
    const s = slip({ V, T, P, rho: r });
    const Tc = V > 0 ? T / (r * V * V * D * D) : Infinity;
    // rudder to cancel swirl yaw (repo convention: right rudder = dr<0 gives N>0); effective q at fin for rudder
    const drReq = s.Nsw / (s.qEffV * S * b * Cnd);   // N_sw + qEffV S b Cndr dr = 0 -> dr = -Nsw/(...)... sign below
    res.push({ name, V_kt: V / KT, T, Tc, ...s, drReqDeg: -drReq / DEG });
    console.log(`${name.padEnd(22)} V ${(V / KT).toFixed(0).padStart(3)} kt T ${T.toFixed(0).padStart(5)} N Tc ${Number.isFinite(Tc) ? Tc.toFixed(3) : 'inf'} | vi ${s.vi.toFixed(1)} Vs ${s.Vs.toFixed(1)} m/s rs ${s.rs.toFixed(2)} m | qs ${s.qs.toFixed(0)} Pa q ${s.q.toFixed(0)} Pa (qs/q ${Number.isFinite(s.ratio) ? s.ratio.toFixed(2) : 'inf'}) | kH ${s.kH.toFixed(2)} kV ${s.kV.toFixed(2)} | qEffH/q ${(s.q > 0 ? s.qEffH / s.q : Infinity).toFixed(2)} qEffH ${s.qEffH.toFixed(0)} Pa | swirl ${s.swirlDeg.toFixed(1)}° | Nsw ${s.Nsw.toFixed(0)} N·m | rudder for swirl ${(-drReq / DEG).toFixed(1)}° (neg = right)`);
  }
  // ground roll: can the elevator lift the nose at brake release?  Moment about main-gear contact.
  const W = AC.m * 9.80665, xN = 2.30, xM = -0.35, hT = 1.36 + 0.06;   // thrust line height above ground (approx)
  const noseLoad = W * (0 - xM) / (xN - xM);
  const s0 = slip({ V: 0, T: AC.T0, P: AC.P, rho: rho0 });
  const Mel = s0.qEffH * S * AC.c * Math.abs(AC.Cmde) / 0.9 * AC.deUp;      // Cmde includes eta; full up elevator
  console.log(`static nose-gear load ${noseLoad.toFixed(0)} N -> moment about mains ${(noseLoad * (xN - xM)).toFixed(0)} N·m; thrust nose-down moment ${(AC.T0 * hT).toFixed(0)} N·m; full-up elevator in slipstream ${Mel.toFixed(0)} N·m (repo today: 0)`);
  import('fs').then((fs) => fs.writeFileSync(new URL('./u2_slip.json', import.meta.url), JSON.stringify(res, null, 1)));
}
