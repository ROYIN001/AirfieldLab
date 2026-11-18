// Derived numbers for section 3 (propeller). Run: node analyze.mjs
import { prop, bem, loads } from './p3_bem.mjs';
import { M } from 'test/harness.mjs';
const { AC, KT, FT, DEG, RAD, atmosphere, FIELD } = M;
const D = prop.D, A = Math.PI * D * D / 4, P0 = 700e3, nGov = 2000 / 60;
const atmSL = { rho: 1.225, a: 340.29 };
const atmTH = atmosphere(FIELD.elev, 31 - (15 - 0.0065 * FIELD.elev));   // VTBD 31 C
const out = (...a) => console.log(...a);
const fmt = (x, d = 1) => x.toFixed(d);

// ---------- momentum theory ----------
for (const [nm, at] of [['ISA SL', atmSL], ['VTBD 31C', atmTH]]) {
  const Tid = Math.cbrt(2 * at.rho * A) * P0 ** (2 / 3);
  out(`[momentum] ${nm}: rho=${fmt(at.rho, 4)} ideal static T(700kW)=${fmt(Tid / 1e3, 2)} kN; FM needed for AC.T0=11.5kN: ${fmt((11500 / Tid) ** 1.5, 3)}; T at FM 0.5/0.6/0.7: ${[0.5, 0.6, 0.7].map(f => fmt(Tid * f ** (2 / 3) / 1e3, 2)).join('/')} kN`);
}
const vi0 = Math.sqrt(11500 / (2 * 1.225 * A));
out(`[momentum] induced velocity at disk for T=11.5kN SL: ${fmt(vi0, 1)} m/s; slipstream far wake 2vi=${fmt(2 * vi0, 1)} m/s`);

// ---------- constant-speed solution: beta such that shaft power = P ----------
function betaForPower(J, Pw, n, at) {
  let lo = 2, hi = 70; const f = (b) => bem(J, b, { n, rho: at.rho, a_s: at.a, N: 30 }).CP * at.rho * n ** 3 * D ** 5 - Pw;
  if (f(lo) > 0) return null;
  for (let k = 0; k < 32; k++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
  return (lo + hi) / 2;
}
out('\n[constant speed 2000 rpm, 700 kW] V(kt) beta75 J T_BEM(kN) eta  | current AC thrustAvail(kN)');
const Vc = AC.eta * AC.P / AC.T0;
const rows = [];
for (const at of [atmSL, atmTH]) {
  for (const kt of [0, 40, 60, 80, 88, 95, 120, 150, 200]) {
    const V = kt * KT, J = V / (nGov * D);
    const b = betaForPower(J, P0, nGov, at);
    const s = bem(J, b, { n: nGov, rho: at.rho, a_s: at.a, N: 30 });
    const Tcur = AC.T0 * Vc / Math.hypot(V, Vc);
    rows.push({ rho: at.rho, kt, b, J, T: s.T, eta: s.eta, Tcur });
    out(`rho ${fmt(at.rho, 3)} ${kt}kt beta=${fmt(b)} J=${fmt(J, 3)} T=${fmt(s.T / 1e3, 2)} eta=${fmt(s.eta, 3)} vi=${fmt(s.vaMean, 1)} | cur ${fmt(Tcur / 1e3, 2)}`);
  }
}

// ---------- flight idle at Vref: blade on low-pitch stop or governing ----------
function idleState(V, Pidle, bStop, at, nMax = nGov) {
  // underspeed: blade on stop, n from power balance (n<=nMax); else governor sets beta at nMax
  let lo = 5, hi = nMax;
  const pw = (n) => bem(V / (n * D), bStop, { n, rho: at.rho, a_s: at.a, N: 30 }).CP * at.rho * n ** 3 * D ** 5;
  if (pw(nMax) <= Pidle) { // on the stop the prop would overspeed -> governor coarsens at nMax
    const b = betaForPower(V / (nMax * D), Pidle, nMax, at);
    const s = bem(V / (nMax * D), b, { n: nMax, rho: at.rho, a_s: at.a, N: 30 });
    return { mode: 'governing', n: nMax, beta: b, T: s.T, J: V / (nMax * D) };
  }
  for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (pw(m) > Pidle) hi = m; else lo = m; }
  const n = (lo + hi) / 2, s = bem(V / (n * D), bStop, { n, rho: at.rho, a_s: at.a, N: 30 });
  return { mode: 'on stop', n, beta: bStop, T: s.T, J: V / (n * D) };
}
out('\n[flight idle] P_idle, beta_stop, V -> mode, rpm, T');
for (const Pid of [0, 20e3, 40e3]) for (const bs of [8, 10, 12]) for (const kt of [88, 120]) {
  const r = idleState(kt * KT, Pid, bs, atmTH);
  out(`P=${Pid / 1e3}kW stop=${bs} ${kt}kt: ${r.mode} rpm=${fmt(r.n * 60, 0)} beta=${fmt(r.beta)} J=${fmt(r.J, 3)} T=${fmt(r.T, 0)} N`);
}
out(`current model idle thrust at 88 kt: ${fmt(AC.idle * AC.T0 * Vc / Math.hypot(88 * KT, Vc), 0)} N`);

// ---------- windmilling vs feathered drag ----------
out('\n[windmill] engine failed (P=0), governor holds <=2000 rpm, 100 kt and 120 kt');
for (const kt of [100, 120]) { const r = idleState(kt * KT, 0, 10, atmTH); out(`${kt} kt: ${r.mode} rpm=${fmt(r.n * 60, 0)} beta=${fmt(r.beta)} D_windmill=${fmt(-r.T, 0)} N`); }
// feathered: blades stopped (n -> 0), beta75 = 81 deg: element drag from section coefficients at alpha = th - 90deg
import { airfoil, chord, twist } from './p3_bem.mjs';
for (const kt of [100, 120]) {
  const V = kt * KT, q = 0.5 * atmTH.rho * V * V; let Dr = 0, Ab = 0; const N = 200;
  for (let i = 0; i < N; i++) { const x = prop.xh + (1 - prop.xh) * (i + 0.5) / N, dr = (1 - prop.xh) * D / 2 / N, c = chord(x);
    const th = 81 * DEG + twist(x); const a = th - Math.PI / 2; const { cl, cd } = airfoil(a, V / atmTH.a);
    // axial force on the stopped blade element (flow purely axial, phi = 90 deg): Cy = cl*cos(90)-cd*sin(90) = -cd
    Dr += prop.B * q * c * cd * dr; Ab += prop.B * c * dr; }
  out(`${kt} kt feathered (beta75=81): D_feather=${fmt(Dr, 0)} N  blade area ${fmt(Ab, 3)} m2 CD_on_blade_area=${fmt(Dr / (q * Ab), 3)}`);
}

// ---------- reverse ----------
out('\n[reverse] static BEM (J=0) at negative beta, 1825 rpm (Caravan TCDS max reverse rpm used as analogue)');
for (const b of [-5, -10, -15, -20]) { const n = 1825 / 60, s = bem(0, b, { n, rho: atmTH.rho, a_s: atmTH.a, N: 30 }); out(`beta ${b}: CT=${fmt(s.CT, 4)} CP=${fmt(s.CP, 4)} T=${fmt(s.T / 1e3, 2)} kN P=${fmt(s.P / 1e3, 0)} kW ok=${s.ok}`); }
for (const kt of [40, 60, 80]) { const n = 1825 / 60, V = kt * KT, s = bem(V / (n * D), -15, { n, rho: atmTH.rho, a_s: atmTH.a, N: 30 }); out(`beta -15 at ${kt} kt: CT=${fmt(s.CT, 4)} CP=${fmt(s.CP, 4)} T=${fmt(s.T / 1e3, 2)} kN P=${fmt(s.P / 1e3, 0)} kW momentum-valid=${s.ok}`); }

// ---------- off-axis loads: P-factor and normal force ----------
out('\n[P-factor/normal force] body FRD; vIp=[v,w]; prop disk 3.94 m ahead of CG (src/70-aircraft.js:183)');
const lp = 3.94;   // prop disk x from src/70-aircraft.js:183 (model origin assumed at CG)
function offAxis(kt, alphaDeg, betaDeg, Pw, at) {
  const V = kt * KT, J = V * Math.cos(alphaDeg * DEG) * Math.cos(betaDeg * DEG) / (nGov * D);
  const b = betaForPower(J, Pw, nGov, at);
  const vIp = [V * Math.sin(betaDeg * DEG), V * Math.sin(alphaDeg * DEG) * Math.cos(betaDeg * DEG)];
  const L = loads(J, b, vIp, { n: nGov, rho: at.rho, a_s: at.a, N: 24 });
  return { kt, alphaDeg, betaDeg, b, J, ...L };
}
const qS = (kt, at) => 0.5 * at.rho * (kt * KT) ** 2 * AC.S;
for (const [kt, a, bb, Pw, label] of [[80, 10, 0, 700e3, 'rotation/climb max power'], [88, 5, 0, 150e3, 'Vref approach power'], [88, 0, 5, 150e3, 'Vref sideslip 5deg'], [80, 0, 5, 700e3, 'climb sideslip 5deg'], [80, 0, 0, 700e3, 'axial']]) {
  const r = offAxis(kt, a, bb, Pw, atmTH);
  const qs = qS(kt, atmTH), qSb = qs * AC.b, qSc = qs * AC.c;
  const Nyaw = r.Mz + lp * r.Fy, Mpitch = r.My - lp * r.Fz;
  const drNeed = -Nyaw / (qSb * AC.Cndr) * RAD;   // rudder deflection (deg, model sign) to cancel
  const daNeed = -r.Mx / (qSb * AC.Clda) * RAD;
  out(`${label}: ${kt}kt a=${a} b=${bb} beta75=${fmt(r.b)} T=${fmt(r.T, 0)}N Fy=${fmt(r.Fy, 0)} Fz=${fmt(r.Fz, 0)} | hub moments Mx=${fmt(r.Mx, 0)} My=${fmt(r.My, 0)} Mz=${fmt(r.Mz, 0)} N m | about CG: yaw ${fmt(Nyaw, 0)} pitch ${fmt(Mpitch, 0)} | thrust offset dy=${fmt(-r.Mz / r.T, 3)} m dz=${fmt(r.My / r.T, 3)} m | rudder to cancel yaw ${fmt(drNeed, 2)} deg, aileron to cancel torque ${fmt(daNeed, 2)} deg | Cn=${(Nyaw / qSb).toExponential(2)} Cm=${(Mpitch / qSc).toExponential(2)}`);
}

// ---------- torque reaction and gyroscopic moments ----------
const Ip = 14, Om = 2 * Math.PI * nGov, H = Ip * Om;
out(`\n[gyro] Ip=${Ip} kg m2, Omega=${fmt(Om, 1)} rad/s, H=${fmt(H, 0)} kg m2/s`);
for (const qd of [5, 10, 20]) out(`pitch rate ${qd} deg/s -> yaw moment N = H q = ${fmt(H * qd * DEG, 0)} N m`);
for (const kt of [60, 88]) { const qs = qS(kt, atmTH); out(`  rudder for 10 deg/s pitch at ${kt} kt: ${fmt(H * 10 * DEG / (qs * AC.b * Math.abs(AC.Cndr)) * RAD, 2)} deg`); }
const Qto = P0 / Om; out(`[torque] full power torque Q=${fmt(Qto, 0)} N m (${fmt(Qto / 1.3558, 0)} lbf ft)`);
for (const kt of [60, 80, 88]) { const qs = qS(kt, atmTH); out(`  aileron to cancel full-power torque at ${kt} kt: ${fmt(Qto / (qs * AC.b * AC.Clda) * RAD, 2)} deg`); }
// main-gear load transfer on the ground (track 3.10 m)
out(`  ground: torque taken by main gear, delta N per wheel = Q/track = ${fmt(Qto / 3.10, 0)} N`);

// ---------- BEM cost ----------
let t0 = performance.now(); for (let i = 0; i < 200; i++) bem(0.5 + i * 1e-4, 20, { N: 20 }); let dt = (performance.now() - t0) / 200;
out(`\n[cost] bem() N=20 with 300-step phi scan: ${fmt(dt, 3)} ms/call`);
