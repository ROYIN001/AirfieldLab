// Step 2 — turboprop and propeller: static thrust, thrust vs speed, spool-up lag, idle drag,
// and the left-turning tendencies (torque, P-factor, slipstream swirl) plus gyroscopic precession.
import { M, trimmed, run, DT } from './lib/sim.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { ENG, PROP, Turboprop, propeller, KT, DEG, RAD, AC, Aircraft } = M;
const rho0 = 1.225;

// thrust curve at ISA sea level, full power
const T0 = propeller(ENG.Pmax, 0, rho0).T;
check('static thrust at full power (ISA SL)', within(T0, 11000, 14000), `${f1(T0 / 1000, 2)} kN`);
let prev = Infinity, mono = true; const rows = [];
for (const kt of [0, 40, 80, 120, 160, 200, 250]) {
  const p = propeller(ENG.Pmax, kt * KT, rho0); if (p.T > prev) mono = false; prev = p.T;
  rows.push(`${kt} kt: T ${f1(p.T / 1000, 2)} kN, η ${f1(p.T * kt * KT / ENG.Pmax, 2)}, J ${f1(p.J, 2)}`);
}
console.log('  ' + rows.join('\n  '));
check('thrust falls monotonically with speed', mono);
const eta200 = propeller(ENG.Pmax, 200 * KT, rho0).T * 200 * KT / ENG.Pmax;
check('propulsive efficiency at 200 kt', within(eta200, 0.78, 0.88), f1(eta200, 3));
const idle95 = propeller(ENG.idle * ENG.Pmax, 95 * KT, 1.16).T, idle150 = propeller(ENG.idle * ENG.Pmax, 150 * KT, 1.16).T;
check('flight idle at 95 kt: blades on the fine-pitch stop, slight drag', within(idle95, -700, 100), `${f1(idle95, 0)} N`);
check('flight idle drag grows with speed', idle150 < idle95 - 500, `${f1(idle150, 0)} N at 150 kt`);
const t15 = propeller(0.15 * ENG.Pmax, 95 * KT, 1.16).T;
check('governed above 9 % power: no windmill drag at approach power', t15 > 1200, `${f1(t15, 0)} N at 15 % power`);

// spool-up from flight idle to 90 % power, and spool-down
{
  const e = new Turboprop().set(0); let t = 0;
  while (e.frac < 0.9 && t < 20) { e.update(DT, 1); t += DT; }
  const t50 = (() => { const g = new Turboprop().set(0); let s = 0; while (g.frac < 0.5 && s < 20) { g.update(DT, 1); s += DT; } return s; })();
  check('spool-up idle → 90 % power', within(t, 3, 5.5), `${f1(t, 2)} s (50 % at ${f1(t50, 2)} s)`);
  let td = 0; while (e.frac > 0.1 && td < 20) { e.update(DT, 0); td += DT; }
  check('spool-down 90 % → 10 % power', within(td, 0.5, 2.5), `${f1(td, 2)} s`);
  const s = new Turboprop().set(0.5);
  check('steady power is linear in the lever', Math.abs(s.frac - (ENG.idle + (1 - ENG.idle) * 0.5)) < 1e-9, f1(s.frac, 3));
}

// left-turning tendencies: full power from a trimmed approach with the controls frozen
{
  const { ac, tr } = trimmed({ ias: 95, gamma: -3, flaps: 1, gear: 1, h: 300 });
  check('approach trim converges', tr.err < 1e-6, `α ${f1(tr.alpha * RAD, 2)}° δe ${f1(tr.de * RAD, 2)}° PCL ${f1(tr.thr, 3)} β ${f1(tr.beta * RAD, 2)}° δa ${f1(tr.da * RAD, 2)}° δr ${f1(tr.dr * RAD, 2)}°`);
  check('approach needs a little right rudder against swirl', tr.dr < 0 && tr.dr > -3 * DEG, `${f1(tr.dr * RAD, 2)}°`);
  ac.cmd.thr = 1;
  run(ac, 2.5);
  const a = ac.air;
  check('power on: nose yaws left', a.r < 0 && M.wrapPi(a.psi - tr.psi) < 0, `r ${f1(a.r * RAD, 2)}°/s, heading ${f1(M.wrapPi(a.psi - tr.psi) * RAD, 2)}°`);
  check('power on: rolls left', a.p < 0 || a.phi < 0, `φ ${f1(a.phi * RAD, 2)}° p ${f1(a.p * RAD, 2)}°/s`);
  check('power on: pitches up (slipstream on the tail)', a.q > 0 || a.theta > tr.th, `θ ${f1(a.theta * RAD, 2)}° (trim ${f1(tr.th * RAD, 2)}°)`);
}
// rudder and aileron needed for a full-power climb at 85 kt (go-around)
{
  const { tr } = trimmed({ ias: 85, flaps: 0.45, gear: 1, pcl: 1, h: 300 });
  check('full-power climb at 85 kt: right rudder 15–60 %', tr.dr < 0 && within(-tr.dr / AC.drMax, 0.15, 0.6), `${f1(tr.dr * RAD, 1)}° (${f1(-tr.dr / AC.drMax * 100, 0)} %), γ ${f1(tr.gamma * RAD, 1)}°`);
  check('full-power climb at 85 kt: aileron under 35 %', Math.abs(tr.da / AC.daMax) < 0.35, `${f1(tr.da * RAD, 1)}°`);
  check('full-power climb: right aileron holds the torque reaction', tr.da > 0, `${f1(tr.da * RAD, 1)}°`);
}
// torque reaction alone (fin swirl and P-factor switched off): a power step rolls the airframe left by (1 − kWing)·ΔQ
{
  const keep = { fV: AC.fV, kPf: AC.kPf }; AC.fV = 0; AC.kPf = 0;
  const pdot = (pcl) => { const ac = new Aircraft(); ac.eng.set(pcl); const q = M.eulerToQ(0, 3 * DEG, 0); ac.x.set([0, 0, -500, 50, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]); const d = new Float64Array(13); ac.deriv(ac.x, d); return { pd: d[10], Q: ac.eng.torque }; };
  const lo = pdot(0), hi = pdot(1);
  const want = -(1 - AC.kWing) * (hi.Q - lo.Q) * AC.Iinv[0];
  Object.assign(AC, keep);
  check('torque reaction rolls left by (1 − kWing)·ΔQ/Ixx', (hi.pd - lo.pd) < 0 && Math.abs((hi.pd - lo.pd) / want - 1) < 0.15, `Δṗ ${f1((hi.pd - lo.pd) * RAD, 2)} vs ${f1(want * RAD, 2)} °/s²`);
}
// cruise: the fin offset leaves little rudder (compared with the same trim without the offset)
{
  const { tr } = trimmed({ ias: 180, pcl: 0.6, h: 1500 });
  const keep = AC.finOffset; AC.finOffset = 0; const { tr: tr0 } = trimmed({ ias: 180, pcl: 0.6, h: 1500 }); AC.finOffset = keep;
  check('cruise 180 kt at 60 % power: the fin offset leaves under 1° of rudder', Math.abs(tr.dr) < 1 * DEG && Math.abs(tr0.dr) > Math.abs(tr.dr) + 0.5 * DEG, `${f1(tr.dr * RAD, 2)}° (without the offset ${f1(tr0.dr * RAD, 2)}°)`);
}
// P-factor: at high α with power the thrust centre moves right (nose-left moment)
{
  const ac = new Aircraft(); ac.eng.set(1);
  const yawAt = (alphaDeg) => {
    const V = 40, al = alphaDeg * DEG, q = M.eulerToQ(0, al, 0);
    ac.x.set([0, 0, -500, V, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);   // flying north, nose raised by α
    const d = new Float64Array(13); ac.deriv(ac.x, d); return d[12];
  };
  const r0 = yawAt(0), r12 = yawAt(12);
  check('P-factor: more left yaw at α 12° than at 0°', r12 < r0, `ṙ ${f1(r0 * RAD, 2)} → ${f1(r12 * RAD, 2)} °/s²`);
}
// gyroscopic precession: pitching up yaws right, pitching down yaws left (P-factor off to isolate the rotor term)
{
  const keep = AC.kPf; AC.kPf = 0;
  const ac = new Aircraft(); ac.eng.set(0.8);
  const rdot = (qq) => { const q = M.eulerToQ(0, 0, 0); ac.x.set([0, 0, -500, 60, 0, 0, q[0], q[1], q[2], q[3], 0, qq, 0]); const d = new Float64Array(13); ac.deriv(ac.x, d); return d[12]; };
  const up = rdot(0.5), dn = rdot(-0.5), want = PROP.H * AC.Iinv[8];   // Δq = 1 rad/s
  AC.kPf = keep;
  check('gyroscopic: pitch up → yaw right, size H·Δq/Izz', up - dn > 0 && Math.abs((up - dn) / want - 1) < 0.1, `Δṙ ${f1((up - dn) * RAD, 2)} vs ${f1(want * RAD, 2)} °/s² (H ${f1(PROP.H, 0)} kg·m²/s)`);
}
// zero power and bad inputs stay finite
{
  const z = propeller(0, 0, 1.2), e = new Turboprop().set(0.3); e.update(1 / 240, NaN); e.update(1 / 240, 0.5);
  check('zero shaft power at rest gives finite zero thrust; a NaN lever is ignored', Number.isFinite(z.T) && Number.isFinite(z.Vs) && Number.isFinite(e.ng) && Number.isFinite(e.P), `T ${z.T}, Ng ${f1(e.ng, 1)}`);
}
done();
