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
  const t50 = (() => { const g = new Turboprop().set(0); let s = 0; while (g.frac < 0.5) { g.update(DT, 1); s += DT; } return s; })();
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
  check('power on: nose yaws left', a.r < 0 && a.psi < ac.air.psi + 1, `r ${f1(a.r * RAD, 2)}°/s`);
  check('power on: rolls left', a.p < 0 || a.phi < 0, `φ ${f1(a.phi * RAD, 2)}° p ${f1(a.p * RAD, 2)}°/s`);
  check('power on: pitches up (slipstream on the tail)', a.q > 0 || a.theta > tr.th, `θ ${f1(a.theta * RAD, 2)}° (trim ${f1(tr.th * RAD, 2)}°)`);
}
// rudder and aileron needed for a full-power climb at 85 kt (go-around)
{
  const { tr } = trimmed({ ias: 85, flaps: 0.45, gear: 1, pcl: 1, h: 300 });
  check('full-power climb at 85 kt: right rudder 15–60 %', tr.dr < 0 && within(-tr.dr / AC.drMax, 0.15, 0.6), `${f1(tr.dr * RAD, 1)}° (${f1(-tr.dr / AC.drMax * 100, 0)} %), γ ${f1(tr.gamma * RAD, 1)}°`);
  check('full-power climb at 85 kt: aileron under 35 %', Math.abs(tr.da / AC.daMax) < 0.35, `${f1(tr.da * RAD, 1)}°`);
}
// cruise: the fin offset leaves little rudder
{
  const { tr } = trimmed({ ias: 180, pcl: 0.6, h: 1500 });
  check('cruise 180 kt at 60 % power: rudder within ±2°', Math.abs(tr.dr) < 2 * DEG, `${f1(tr.dr * RAD, 2)}°`);
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
// gyroscopic precession: pitching up yaws right, pitching down yaws left
{
  const ac = new Aircraft(); ac.eng.set(0.8);
  const rdot = (qq) => { const q = M.eulerToQ(0, 0, 0); ac.x.set([0, 0, -500, 60, 0, 0, q[0], q[1], q[2], q[3], 0, qq, 0]); const d = new Float64Array(13); ac.deriv(ac.x, d); return d[12]; };
  const up = rdot(0.5), dn = rdot(-0.5);
  check('gyroscopic: pitch up → yaw right', up - dn > 0, `Δṙ ${f1((up - dn) * RAD, 2)} °/s² (H ${f1(PROP.H, 0)} kg·m²/s)`);
}
done();
