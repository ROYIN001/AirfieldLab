// ───────────────────────── Turboprop engine and constant-speed propeller (pure, no DOM) ─────────────────────────
// A generic free-turbine turboprop driving a four-blade constant-speed propeller held at 2,000 rpm by its
// governor. Fictional, class-typical numbers (≈ 940 shp trainers), not any manufacturer's data.
//  • Gas generator: Ng follows the power lever through a fuel-schedule acceleration limit that is slow near
//    idle and faster near maximum, so power arrives late and then quickly (≈ 4 s from flight idle to 90 %).
//  • Shaft power rises steeply with Ng. Flat rated: full power is still available on a hot Bangkok day.
//  • Thrust from actuator-disc momentum theory with a profile efficiency curve ηp(J):
//      ηp·P = T·(V + vi),  T = 2ρA(V + vi)·vi,  J = V/(nD).  At V = 0 this is the static thrust.
//  • On the flight-idle stop the blades windmill and add drag ∝ ρV² (steeper idle descents, as in turboprops).
//  • Torque Q = P/Ω. Slipstream (far wake V + 2vi), swirl, P-factor and the gyroscopic moment act on the
//    airframe in 20-flight.js.

const ENG = {
  Pmax: 700e3,             // W, flat-rated shaft power
  idle: 0.05,              // flight-idle shaft power fraction
  ngIdle: 67, ngMax: 101,  // % gas-generator speed at flight idle / maximum power
  acc0: 5, acc1: 9,        // %/s acceleration limit: acc0 at idle, acc0 + acc1 at maximum (fuel schedule)
  dec: 25,                 // %/s deceleration limit
  tau: 0.5,                // s, final approach to the target Ng
  pExp: 1.8,               // shaft power ∝ ((Ng − idle)/(max − idle))^pExp
};
const PROP = {
  D: 2.30, rpm: 2000,                   // diameter from the 3D model; governed speed
  etaMax: 0.86, eta0: 0.62, Jc: 0.35,   // profile efficiency ηp(J) = ηmax − (ηmax − η0)·e^(−J/Jc)
  Ip: 6.0,                              // kg·m², propeller and spinner polar inertia (estimate)
  wmCd: 0.16, wmFrac: 0.09,             // drag coefficient on the disc at the flight-idle stop, fading out by 9 % power
};
PROP.R = PROP.D / 2; PROP.A = Math.PI * PROP.R * PROP.R; PROP.n = PROP.rpm / 60; PROP.Om = 2 * Math.PI * PROP.n;
PROP.H = PROP.Ip * PROP.Om;   // angular momentum along body +x (turns clockwise seen from the cockpit)

class Turboprop {
  constructor() { this.set(0); }
  static ngFor(pcl) { return ENG.ngIdle + (ENG.ngMax - ENG.ngIdle) * Math.pow(clamp(pcl, 0, 1), 1 / ENG.pExp); }
  static powerAt(ng) {
    const x = clamp((ng - ENG.ngIdle) / (ENG.ngMax - ENG.ngIdle), 0, 1);
    return ENG.Pmax * (ENG.idle + (1 - ENG.idle) * Math.pow(x, ENG.pExp));
  }
  // steady state for a lever position: shaft power is linear in the lever (idle … 100 %)
  set(pcl) { this.pcl = clamp(pcl, 0, 1); this.ng = Turboprop.ngFor(this.pcl); this.P = Turboprop.powerAt(this.ng); return this; }
  update(dt, pcl) {
    if (Number.isFinite(pcl)) this.pcl = clamp(pcl, 0, 1);   // a bad input must not poison the spool state
    const tgt = Turboprop.ngFor(this.pcl), x = clamp((this.ng - ENG.ngIdle) / (ENG.ngMax - ENG.ngIdle), 0, 1);
    const rate = clamp((tgt - this.ng) / ENG.tau, -ENG.dec, ENG.acc0 + ENG.acc1 * x);
    const ng = this.ng + rate * dt;
    this.ng = (tgt - this.ng) * (tgt - ng) < 0 ? tgt : ng;
    this.P = Turboprop.powerAt(this.ng);
  }
  get frac() { return this.P / ENG.Pmax; }   // shaft power = torque fraction at governed rpm (TRQ %)
  get torque() { return this.P / PROP.Om; }  // N·m
}

// Propeller thrust for shaft power P (W), axial airspeed Va (m/s) and density rho.
function propeller(P, Va, rho) {
  const V = Math.max(Va, 0), J = V / (PROP.n * PROP.D);
  const eta = PROP.etaMax - (PROP.etaMax - PROP.eta0) * Math.exp(-J / PROP.Jc);
  const k = 2 * rho * PROP.A, E = eta * Math.max(P, 0);
  // k(V+vi)²vi = E is increasing and convex in vi; Newton from the static value (above the root) converges monotonically
  let vi = Math.cbrt(E / k);
  for (let i = 0; i < 12 && E > 0; i++) {
    const s = V + vi, d = (k * s * s * vi - E) / (k * (s * s + 2 * s * vi));
    vi -= d;
    if (Math.abs(d) < 1e-5) break;
  }
  vi = E > 0 ? Math.max(vi, 0) : 0;
  const wm = clamp((PROP.wmFrac - P / ENG.Pmax) / (PROP.wmFrac - ENG.idle), 0, 1);
  const T = k * (V + vi) * vi - 0.5 * rho * V * V * PROP.A * PROP.wmCd * wm;
  return { T, vi, Va: V, Vs: V + 2 * vi, Q: Math.max(P, 0) / PROP.Om, eta, J };
}
