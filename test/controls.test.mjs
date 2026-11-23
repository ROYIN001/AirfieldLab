// Load factor from the body-axis specific force (plan item A6; owner's research round 1, task list item 5 in
// docs/research/01-flight-physics.md and docs/research/01-flight-physics/06-controls.md §6.7.4 note 4, test T-C-01).
// air.nz = −(Rᵀ f_NED)_z / g and air.ny = (Rᵀ f_NED)_y / g with f_NED = v̇ − [0, 0, g]: aero, thrust and gear forces per
// unit mass, without gravity. Wings level in steady flight nz = cos θ cos φ; parked on the gear nz = 1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD, G0, qToR, mulRT } = M;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const f4 = (v) => v.toFixed(4);

test('T-C-01: trimmed 95 kt 3° glide, air.nz 1.00 ± 0.02 (cos θ cos φ = 0.9998), ny 0', () => {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000 });
  const a = f.ac.air;
  assert.ok(Math.abs(a.ias / KT - 95) < 0.5 && Math.abs(a.theta * RAD + 1.24) < 0.05 && Math.abs(a.phi) < 1e-9, `IAS ${(a.ias / KT).toFixed(2)} kt, θ ${(a.theta * RAD).toFixed(3)}°`);
  assert.ok(Math.abs(a.nz - 1) <= 0.02, `nz ${f4(a.nz)}`);
  // setApproach leaves |a_NED| < 0.05 m/s² (T-V-01), so nz is within 0.005 of the steady value cos θ cos φ
  assert.ok(Math.abs(a.nz - Math.cos(a.theta) * Math.cos(a.phi)) <= 0.005, `nz ${f4(a.nz)}, cos θ cos φ ${f4(Math.cos(a.theta) * Math.cos(a.phi))}`);
  assert.ok(Math.abs(a.ny) <= 1e-6, `ny ${a.ny}`);
  let lo = Infinity, hi = -Infinity;
  while (f.ac.t < 10) { f.tick(f.dt); lo = Math.min(lo, a.nz); hi = Math.max(hi, a.nz); }
  assert.ok(lo >= 0.98 && hi <= 1.02, `hands off for 10 s: nz ${f4(lo)}…${f4(hi)}`);
});

test('parked: the gear carries the weight, nz 1.000 ± 0.002, ny 0, nz = ΣN/W', () => {
  const f = new Flight({ wind: SCENARIOS.calm }); f.ac.setParked(0, 0, 30 * DEG);
  for (let i = 0; i < 240 * 6; i++) f.ac.step(1 / 240);
  const a = f.ac.air, sumN = a.load.reduce((s, v) => s + v, 0) / (AC.m * G0);
  assert.ok(a.onGround, 'on the ground');
  assert.ok(Math.abs(a.nz - 1) <= 0.002 && Math.abs(a.ny) <= 0.002, `nz ${f4(a.nz)}, ny ${f4(a.ny)}`);
  assert.ok(Math.abs(a.nz - sumN) <= 0.002, `nz ${f4(a.nz)}, ΣN/W ${f4(sumN)}`);
});

// Steady level turn flown by a test-side controller on ac.cmd (independent of PilotLaws): bank by aileron, β → 0 by
// rudder, height by elevator (θ̇ damping, so the steady pitch rate of the turn is not opposed), IAS by throttle.
function levelTurn(phiDeg, ias, clean) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000 });
  const ac = f.ac, c = ac.cmd, dt = f.dt;
  if (clean) { ac.flaps = c.flaps = 0; ac.gearPos = 0; c.gear = 0; }
  const h0 = ac.air.h; let deI = ac.de, thrI = ac.thr, thB = ac.air.theta;
  const S = { n: 0, nz: 0, ny: 0, phi: 0, vs: 0, ias: 0, lo: Infinity, hi: -Infinity };
  while (ac.t < 60) {
    const a = ac.air, phiC = Math.sign(phiDeg) * Math.min(Math.abs(phiDeg), 5 * ac.t) * DEG;   // roll in at 5°/s
    c.da = clamp(1.25 * (phiC - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
    c.dr = clamp(-1.6 * a.beta, -AC.drMax, AC.drMax);
    thB = clamp(thB + (-0.01 * a.vs + 0.002 * (h0 - a.h)) * dt, -10 * DEG, 20 * DEG);
    let thC = thB - 0.015 * a.vs + 0.003 * (h0 - a.h);
    const aLim = (AC.aStall + AC.aStallFlap * ac.flaps - 6) * DEG; if (a.alpha > aLim) thC = Math.min(thC, a.theta - (a.alpha - aLim));
    const e = clamp(thC - a.theta, -3 * DEG, 3 * DEG), thDot = a.q * Math.cos(a.phi) - a.r * Math.sin(a.phi);
    deI = clamp(deI - 0.8 * e * dt, -AC.deUp, AC.deDn);
    c.de = clamp(deI - 2.0 * e + 0.85 * thDot, -AC.deUp, AC.deDn);
    const err = ias - a.ias / KT; thrI = clamp(thrI + 0.0045 * err * dt, AC.idle, 1); c.thr = clamp(thrI + 0.035 * err, AC.idle, 1);
    ac.step(dt);
    if (ac.t > 50) { S.n++; S.nz += a.nz; S.ny += a.ny; S.phi += a.phi; S.vs += a.vs; S.ias += a.ias / KT; S.lo = Math.min(S.lo, a.nz); S.hi = Math.max(S.hi, a.nz); }
  }
  for (const k of ['nz', 'ny', 'phi', 'vs', 'ias']) S[k] /= S.n;
  return S;
}
test('steady level turn: nz ≈ 1/cos φ (30° landing configuration ± 0.02, 45° clean ± 0.035), ny ≈ 0', () => {
  for (const [phiDeg, ias, clean, tol] of [[30, 95, false, 0.02], [45, 120, true, 0.035]]) {
    const S = levelTurn(phiDeg, ias, clean), n1 = 1 / Math.cos(S.phi);
    const info = `${phiDeg}° at ${ias} kt: φ ${(S.phi * RAD).toFixed(2)}°, nz ${f4(S.nz)} (${f4(S.lo)}…${f4(S.hi)}), 1/cos φ ${f4(n1)}, ny ${f4(S.ny)}, V/S ${S.vs.toFixed(3)} m/s, IAS ${S.ias.toFixed(2)} kt`;
    assert.ok(Math.abs(S.vs) < 0.2 && Math.abs(S.ias - ias) < 1 && Math.abs(S.phi * RAD - phiDeg) < 1 && S.hi - S.lo < 0.005, `not steady: ${info}`);
    // body axis: nz = cos α·|f|/g, and |f|/g = 1/cos μ (bank of the wind axes) < 1/cos φ (Euler bank) when θ > 0, so nz
    // reads 0.5–1.5 % under 1/cos φ (measured nz = cos α / cos μ to 1e-4; no sideslip term)
    assert.ok(Math.abs(S.nz - n1) <= tol && Math.abs(S.ny) <= 0.02, info);
  }
});

// −5.9° = Δδe per g at 120 kt (06-controls.md §6.1 table, 'Δδe ต่อ g', Node measurements of the current model);
// the band is from T-C-06, which is a 39.7 N stick-force step and stays open until ControlAxis (research round 1
// task list item 3). This elevator-angle step stands in for it.
test('pull-up: elevator step −5.9° at 120 kt clean, peak Δnz 1.00 ± 0.15 within 3 s; nz matches v̇ by finite differences', () => {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000 });
  const ac = f.ac, c = ac.cmd, dt = f.dt, tr = ac.setApproach({ dist: 14000, ias: 120, flaps: 0, gearDown: false });
  const nz0 = ac.air.nz, H = [];
  const snap = () => H.push({ v: [ac.x[3], ac.x[4], ac.x[5]], q: [ac.x[6], ac.x[7], ac.x[8], ac.x[9]], nz: ac.air.nz, ny: ac.air.ny });
  snap();
  while (ac.t < 3.5) {
    const a = ac.air;
    c.de = tr.de + (ac.t >= 0.5 ? -5.9 * DEG : 0); c.da = clamp(1.2 * (0 - a.phi) - 0.25 * a.p, -AC.daMax, AC.daMax); c.dr = 0; c.thr = tr.thr;
    ac.step(dt); snap();
  }
  const pk = Math.max(...H.map((h) => h.nz));
  assert.ok(pk > 1.5 && Math.abs(pk - nz0 - 1) <= 0.15, `nz ${f4(nz0)} → peak ${f4(pk)}`);
  let eZ = 0, eY = 0;
  for (let k = 1; k < H.length - 1; k++) {   // central difference of the NED velocity → specific force in body axes
    const A = H[k - 1], B = H[k], C = H[k + 1], acc = [0, 1, 2].map((j) => (C.v[j] - A.v[j]) / (2 * dt));
    const fb = mulRT(qToR(B.q, new Array(9)), [acc[0], acc[1], acc[2] - G0]);
    eZ = Math.max(eZ, Math.abs(-fb[2] / G0 - B.nz)); eY = Math.max(eY, Math.abs(fb[1] / G0 - B.ny));
  }
  assert.ok(eZ <= 0.005 && eY <= 0.005, `finite-difference check: |Δnz| ≤ ${eZ.toExponential(1)}, |Δny| ≤ ${eY.toExponential(1)}`);
});

// ny sign and value in the air (the HUD ball will read it): a rudder step with the wings held level gives sideslip
// β > 0; the side force CYb·β is then to the left (CYb < 0), so ny < 0 while β > 0, as documented in updateAir()
// ("+ = to the right").
test('sideslip: rudder step +10° at 95 kt, wings level: β > 5°, ny < −0.05 (opposite to β); ny matches v̇ by finite differences', () => {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000 });
  const ac = f.ac, c = ac.cmd, dt = f.dt, tr = f.trim, H = [];
  const snap = () => H.push({ v: [ac.x[3], ac.x[4], ac.x[5]], q: [ac.x[6], ac.x[7], ac.x[8], ac.x[9]], ny: ac.air.ny });
  snap();
  while (ac.t < 4) {
    const a = ac.air;
    c.dr = ac.t >= 0.5 ? 10 * DEG : 0; c.da = clamp(1.2 * (0 - a.phi) - 0.25 * a.p, -AC.daMax, AC.daMax); c.de = tr.de; c.thr = tr.thr;
    ac.step(dt); snap();
  }
  const a = ac.air;
  assert.ok(AC.CYb < 0 && a.beta > 5 * DEG && a.ny < -0.05, `β ${(a.beta * RAD).toFixed(2)}°, ny ${f4(a.ny)}`);
  let eY = 0;
  for (let k = 1; k < H.length - 1; k++) {
    const A = H[k - 1], B = H[k], C = H[k + 1], acc = [0, 1, 2].map((j) => (C.v[j] - A.v[j]) / (2 * dt));
    eY = Math.max(eY, Math.abs(mulRT(qToR(B.q, new Array(9)), [acc[0], acc[1], acc[2] - G0])[1] / G0 - B.ny));
  }
  assert.ok(eY <= 0.005, `finite-difference check: |Δny| ≤ ${eY.toExponential(1)}`);
});
