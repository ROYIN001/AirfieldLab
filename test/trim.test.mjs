// Numerical trim (plan B2; research round 1 task list item 11, docs/research/01-flight-physics/12-other-sims.md
// §12.14 task 6): Aircraft.trim and newtonSolve, research T-S-04 (the setApproach trim holds with the controls fixed)
// and T-S-06 (a YASim-style two-point round trip through the same solver), trim across the envelope, the throttle
// limits, roots that are not trims (below the stall, past CLmax, on the wheels), a test-only asymmetric thrust for the
// lateral solve, and the gust state set aside. The solver promises max |r| ≤ 1e-9 (u̇, ẇ in m/s², ṗ, q̇, ṙ in rad/s²);
// the limits below sit at 1e-8 and 1e-9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Aircraft, Flight, SCENARIOS, AC, KT, FT, DEG, RAD, FIELD, newtonSolve } = M;

const at = (ac, h, ias) => ias * KT / Math.sqrt(ac.atm(h).rho / 1.225);
const accel = (ac) => { const d = new Float64Array(13); ac.deriv(ac.x, d); return { a: Math.hypot(d[3], d[4], d[5]), w: Math.hypot(d[10], d[11], d[12]) }; };
const hold = (ac, s) => {   // controls held where the trim left them (research s12_trimhold.mjs)
  const c = { de: ac.de, da: ac.da, dr: ac.dr, thr: ac.thr };
  for (let i = 0; i < 240 * s; i++) { Object.assign(ac.cmd, c); ac.step(1 / 240); }
};

// T-S-04: limits are the research's (ค่าประมาณ of the researcher). The old linear formula measured 0.008°, −0.146 kt,
// 3.3 fpm with |a_NED| 0.027 m/s² at the start; the Newton trim starts at |a| ≈ 1e-10 and measures 0.042°, −0.023 kt,
// +8.2 fpm at 5,500 m (0.043°, −0.024 kt, +8.6 fpm at 9,000 m): what is left is the descent into denser air, not a trim
// error. A regression band of ±0.02°, ±0.02 kt and ±3 fpm holds those values.
const TS04 = { 5500: { th: 0.042, ias: -0.023, vs: 8.2 }, 9000: { th: 0.043, ias: -0.024, vs: 8.6 } };
for (const dist of [5500, 9000]) {
  test(`T-S-04: setApproach at ${dist} m is a trim and holds 20 s with fixed controls (no wind, ISA)`, () => {
    const ac = new Aircraft(), tr = ac.setApproach({ dist });
    assert.ok(tr.ok && tr.it <= 5 && tr.limited === null, `ok ${tr.ok} (${tr.why}), ${tr.it} iterations, limited ${tr.limited}`);
    const { a, w } = accel(ac);
    assert.ok(a < 1e-8 && w < 1e-9 && tr.residual < 1e-8, `|a_NED| ${a.toExponential(2)}, |ω̇| ${w.toExponential(2)}, residual ${tr.residual.toExponential(2)}`);
    assert.ok(Math.abs(ac.air.ias / KT - AC.Vapp) < 1e-9, `IAS ${ac.air.ias / KT} kt`);
    assert.ok(Math.abs(tr.th - (tr.alpha + tr.gammaA)) < 1e-12 && tr.da === 0 && tr.dr === 0 && tr.mu === 0 && Math.abs(tr.phi) < 1e-12,
      `wings level, β 0, α + γa = θ: φ ${tr.phi}, θ − α − γa ${tr.th - tr.alpha - tr.gammaA}`);
    const a0 = { ...ac.air }; hold(ac, 20); const a1 = ac.air;
    const dTh = (a1.theta - a0.theta) * RAD, dIas = (a1.ias - a0.ias) / KT, dVs = (a1.vs - a0.vs) / FT * 60;
    assert.ok(Math.abs(dTh) <= 0.1 && Math.abs(dIas) <= 0.5 && Math.abs(dVs) <= 20, `Δθ ${dTh.toFixed(3)}°, ΔIAS ${dIas.toFixed(3)} kt, Δvs ${dVs.toFixed(1)} fpm`);
    const R = TS04[dist];
    assert.ok(Math.abs(dTh - R.th) <= 0.02 && Math.abs(dIas - R.ias) <= 0.02 && Math.abs(dVs - R.vs) <= 3, `band: Δθ ${dTh.toFixed(4)}, ΔIAS ${dIas.toFixed(4)}, Δvs ${dVs.toFixed(2)}`);
  });
}

test('a Flight starts in trim in every wind scenario (default weather), heading on the runway branch as before B2', () => {
  for (const [k, sc] of Object.entries(SCENARIOS)) {
    const f = new Flight({ wind: sc }), tr = f.trim, { a, w } = accel(f.ac);
    assert.ok(tr.ok && a < 1e-8 && w < 1e-9, `${k}: |a_NED| ${a.toExponential(2)}, |ω̇| ${w.toExponential(2)}`);
    assert.ok(Math.abs(tr.psi - FIELD.rwyHdg * DEG) < 15 * DEG, `${k}: ψ ${(tr.psi * RAD).toFixed(2)}° (crab into the wind, not wrapped)`);
    assert.ok(Math.abs(f.ac.air.ias / KT - AC.Vapp) < 1e-9 && Math.abs(f.ac.air.beta) < 1e-12, `${k}: IAS ${f.ac.air.ias / KT}, β ${f.ac.air.beta}`);
  }
});

// Trim at every flight point of the envelope, from 7–15 kt above the trimmed 1-g stall (about 79.6 kt clean, 75.5 kt
// with flaps 0.5 and 71.9 kt with landing flaps, the stall test's method). Attached-flow trims exist down to within
// about 0.5 kt of it; below, or where CL sits at CLmax, ok is false (the tests after the throttle limits).
test('trim across the envelope: flaps 0/0.5/1, 78–220 kt, γ −6°…+6°, in or out of ground effect', () => {
  const cases = [[0, 0, [95, 120, 150, 180, 220]], [0.5, 1, [85, 90, 110, 130]], [1, 1, [78, 85, 95, 110, 130]]];
  let n = 0, idle = 0, max = 0;
  for (const [flaps, gear, list] of cases) for (const ias of list) for (const g of [-6, -3, 0, 3, 6]) for (const h of [300, 3]) {
    if (h === 3 && g !== 0) continue;   // in ground effect only level (wheels 1.6 m above the ground)
    const ac = new Aircraft(); ac.flaps = ac.cmd.flaps = flaps; ac.gearPos = ac.cmd.gear = gear;
    const tr = ac.trim({ h, tas: at(ac, h, ias), gammaA: g * DEG, chi: 0.3 }), tag = `flaps ${flaps}, ${ias} kt, γ ${g}°, h ${h} m`;
    const { a, w } = accel(ac); n++;
    assert.ok(tr.ok && tr.residual < 1e-8 && a < 1e-8 && w < 1e-9, `${tag}: ok ${tr.ok} (${tr.why}), residual ${tr.residual.toExponential(2)}, |a| ${a.toExponential(2)}`);
    assert.ok(tr.de >= -AC.deUp && tr.de <= AC.deDn && ac.air.stall < 0.03, `${tag}: δe ${(tr.de * RAD).toFixed(2)}°, stall blend ${ac.air.stall.toFixed(3)}`);
    assert.ok(tr.thr >= AC.idle && tr.thr <= 1, `${tag}: thr ${tr.thr}`);
    if (tr.limited) {
      assert.equal(tr.thr, tr.limited === 'idle' ? AC.idle : 1, tag);
      assert.ok(tr.limited === 'idle' ? tr.gammaA > g * DEG : tr.gammaA < g * DEG, `${tag}: γa ${(tr.gammaA * RAD).toFixed(2)}° with ${tr.limited}`);
      if (tr.limited === 'idle') idle++; else max++;
    } else assert.equal(tr.gammaA, g * DEG, tag);
    const v = ac.air.V, path = Math.asin(-ac.x[5] / v);   // no wind: the air path is the flight path of the state
    assert.ok(Math.abs(path - tr.gammaA) < 1e-12 && Math.abs(v - at(ac, h, ias)) < 1e-9, `${tag}: state γ ${(path * RAD).toFixed(6)}°, V ${v}`);
  }
  assert.ok(n === 84 && idle >= 5 && max >= 1, `${n} points, ${idle} at idle, ${max} at full throttle`);
});

test('throttle limits: 120 kt clean on a 3° descent glides at idle; 130 kt with landing flaps cannot climb 6°', () => {
  const a = new Aircraft(); a.flaps = a.cmd.flaps = 0; a.gearPos = a.cmd.gear = 0;
  const ta = a.trim({ h: 300, tas: at(a, 300, 120), gammaA: -3 * DEG });
  assert.ok(ta.ok && ta.limited === 'idle' && ta.thr === AC.idle, `limited ${ta.limited}, thr ${ta.thr}`);
  assert.ok(Math.abs(ta.gammaA * RAD - -2.68) < 0.01, `idle glide γa ${(ta.gammaA * RAD).toFixed(3)}° (−2.68°: L/(D − T) 21.4 with idle thrust, aerodynamic L/D 16.4 at 120 kt clean)`);
  const b = new Aircraft();
  const tb = b.trim({ h: 300, tas: at(b, 300, 130), gammaA: 6 * DEG });
  assert.ok(tb.ok && tb.limited === 'max' && tb.thr === 1 && Math.abs(tb.gammaA * RAD - 5.60) < 0.01, `limited ${tb.limited}, γa ${(tb.gammaA * RAD).toFixed(3)}°`);
  hold(b, 5); assert.ok(Math.abs(b.air.ias / KT - 130) < 0.2, `IAS after 5 s ${(b.air.ias / KT).toFixed(2)} kt`);
});

test('below the stall speed there is no trim: ok false, a finite state, the residual reported', () => {
  const ac = new Aircraft();   // landing flaps, Vs0 71 kt
  const tr = ac.trim({ h: 300, tas: at(ac, 300, 66), gammaA: 0 });
  assert.ok(!tr.ok && tr.why.includes('residual') && tr.residual > 0.01 && ac.x.every(Number.isFinite), `ok ${tr.ok} (${tr.why}), residual ${tr.residual}`);
});

// Roots that balance deriv() but are not trims (found by fuzzing the B2 review): Newton can converge past CLmax, or,
// in ground effect below the stall, onto a state held up by the nose wheel with the elevator far beyond its stop.
test('roots that are not trims: past CLmax (dCL/dα < 0) and on the wheels with δe beyond its limit give ok false', () => {
  const a = new Aircraft(); a.flaps = a.cmd.flaps = 0; a.gearPos = a.cmd.gear = 0;
  const ta = a.trim({ h: 50, tas: at(a, 50, 79.5), gammaA: -8 * DEG });   // idle-limited, 0.1 kt below the attached root
  assert.ok(!ta.ok && ta.residual < 1e-9 && ta.why.join() === 'stalled' && ta.alpha * RAD > 14.5, `${ta.why}, α ${(ta.alpha * RAD).toFixed(2)}°`);
  const b = new Aircraft(); b.flaps = b.cmd.flaps = 0; b.gearPos = b.cmd.gear = 0;
  const tb = b.trim({ h: 50, tas: at(b, 50, 79.75), gammaA: -8 * DEG });  // the attached root, α 13.58°
  assert.ok(tb.ok && tb.limited === 'idle' && Math.abs(tb.alpha * RAD - 13.58) < 0.01, `${tb.why}, α ${(tb.alpha * RAD).toFixed(3)}°`);
  const c = new Aircraft(); c.isaDev = 31 - (15 - 0.0065 * FIELD.elev); c.qnh = 1009.3; c.dewC = 22.8;   // Flight's default air
  const tc = c.trim({ h: 2, tas: at(c, 2, 60.5), gammaA: 0 });          // landing flaps, gear down, 2 m: below the stall
  assert.ok(!tc.ok && tc.why.includes('elevator') && tc.why.includes('ground') && c.air.onGround, `${tc.why}, δe ${(tc.de * RAD).toFixed(1)}°`);
});

// Asymmetric thrust arrives with the propeller model (plan F3). Here a test-only rolling and yawing moment that scale
// with the throttle (a torque reaction and a P-factor to the left; sizes are arbitrary) stand in for it.
test('lateral trim: a test-only propeller torque and P-factor are trimmed with bank, aileron and rudder at β = 0', () => {
  const ac = new Aircraft(), base = ac.deriv.bind(ac);
  ac.deriv = (s, out, diag) => { base(s, out, diag); out[10] += -0.20 * ac.thr; out[12] += -0.05 * ac.thr; };
  const tr = ac.setApproach({ dist: 5500 }), { a, w } = accel(ac);
  assert.ok(tr.ok && tr.residual < 1e-9 && a < 1e-8 && w < 1e-9, `residual ${tr.residual.toExponential(2)}, |a| ${a.toExponential(2)}, |ω̇| ${w.toExponential(2)}`);
  assert.ok(tr.da > 0.1 * DEG && tr.dr < -0.2 * DEG && tr.mu > 0.02 * DEG && Math.abs(ac.air.beta) < 1e-12,
    `δa ${(tr.da * RAD).toFixed(3)}°, δr ${(tr.dr * RAD).toFixed(3)}°, μ ${(tr.mu * RAD).toFixed(3)}°, β ${ac.air.beta}`);
  assert.equal(ac.cmd.da, tr.da); assert.equal(ac.cmd.dr, tr.dr);
  const a0 = { ...ac.air }; hold(ac, 10);
  assert.ok(Math.abs(ac.air.phi - a0.phi) < 0.05 * DEG && Math.abs(wrapDeg(ac.air.psi - a0.psi)) < 0.05, `Δφ ${((ac.air.phi - a0.phi) * RAD).toFixed(4)}°, Δψ ${(wrapDeg(ac.air.psi - a0.psi)).toFixed(4)}°`);
  const sym = new Aircraft().setApproach({ dist: 5500 });   // symmetric aircraft: the lateral solve is skipped, exactly 0
  assert.ok(sym.da === 0 && sym.dr === 0 && sym.mu === 0 && Math.abs(sym.phi) < 1e-12, JSON.stringify(sym));
});
const wrapDeg = (r) => (((r * RAD + 540) % 360) - 180);

// The lateral solve moves the throttle too. At 120 kt clean on γa −2.675° the symmetric trim needs thr 0.04501, just
// above idle; a test-only roll and yaw (ṗ −2, ṙ −0.5 rad/s², arbitrary) pushes the lateral solution under idle, so the
// throttle must be held at idle and γa solved again (review of B2: before the fix it returned thr 0.04485 as a trim).
test('lateral trim re-checks the throttle limits: held at idle, γa solved, still a trim', () => {
  const sym = new Aircraft(); sym.flaps = sym.cmd.flaps = 0; sym.gearPos = sym.cmd.gear = 0;
  const t0 = sym.trim({ h: 300, tas: at(sym, 300, 120), gammaA: -2.675 * DEG });
  assert.ok(t0.ok && t0.limited === null && t0.thr > AC.idle && t0.thr < AC.idle + 1e-4, `symmetric thr ${t0.thr}`);
  const ac = new Aircraft(), base = ac.deriv.bind(ac); ac.flaps = ac.cmd.flaps = 0; ac.gearPos = ac.cmd.gear = 0;
  ac.deriv = (s, out, diag) => { base(s, out, diag); out[10] += -2; out[12] += -0.5; };
  const tr = ac.trim({ h: 300, tas: at(ac, 300, 120), gammaA: -2.675 * DEG }), { a, w } = accel(ac);
  assert.ok(tr.ok && tr.limited === 'idle' && tr.thr === AC.idle && a < 1e-8 && w < 1e-9, `${tr.why}, limited ${tr.limited}, thr ${tr.thr}, |a| ${a}`);
  assert.ok(tr.gammaA > -2.675 * DEG && tr.it > t0.it, `γa ${(tr.gammaA * RAD).toFixed(4)}°, ${tr.it} iterations over all solves`);
});

test('the gust state is set aside for the solve and put back', () => {
  const f = new Flight({ wind: SCENARIOS.xl, seed: 5 });
  for (let i = 0; i < 240 * 5; i++) f.tick(f.dt);
  const g = f.ac.wind.g.slice(); assert.ok(Math.hypot(...g) > 0.1, `gusts ${g}`);
  const tr = f.ac.setApproach({ dist: 5500 });
  assert.deepEqual(f.ac.wind.g, g);
  const ref = new Flight({ wind: SCENARIOS.xl, seed: 5 });
  for (let i = 0; i < 13; i++) assert.ok(Math.abs(f.ac.x[i] - ref.ac.x[i]) < 1e-9, `x[${i}] ${f.ac.x[i]} vs ${ref.ac.x[i]}`);
  assert.ok(Math.abs(tr.thr - ref.trim.thr) < 1e-12 && Math.abs(tr.de - ref.trim.de) < 1e-12);
});

// T-S-06 (research 12-other-sims.md table, scripts/s12/s12_solver_proto.mjs): trim the model at a cruise point
// (5,000 ft ISA, thr 0.75, clean, gear up, level) for V, α, δe, then forget CD0, CL0, Cm0 and recover them from that
// point alone (YASim's idea: a type built from its performance numbers). The research's prototype gave 240.362 KTAS,
// α −1.1939°, δe +2.9895°.
test('T-S-06: newtonSolve trims a cruise point and recovers CD0, CL0, Cm0 from it (± 1e-6)', () => {
  const ac = new Aircraft(); ac.flaps = ac.cmd.flaps = 0; ac.gearPos = ac.cmd.gear = 0;
  const h = 5000 * FT - FIELD.elev, out = new Float64Array(13);
  const resid = (V, al, de) => {
    ac.x.set([0, 0, -h, V, 0, 0, Math.cos(al / 2), 0, Math.sin(al / 2), 0, 0, 0, 0]); ac.de = de; ac.thr = 0.75; ac.adot = 0;
    ac.deriv(ac.x, out); return [out[3], out[5], out[11]];
  };
  const c = newtonSolve((x) => resid(...x), [70, 0.02, 0]);
  const [V, al, de] = c.x;
  assert.ok(c.ok, `cruise trim residual ${c.rn}`);
  assert.ok(Math.abs(V / KT - 240.3622) < 1e-3 && Math.abs(al * RAD - -1.19388) < 1e-4 && Math.abs(de * RAD - 2.98948) < 1e-4,
    `${(V / KT).toFixed(4)} KTAS, α ${(al * RAD).toFixed(5)}°, δe ${(de * RAD).toFixed(5)}°`);
  const truth = { CD0: AC.CD0, CL0: AC.CL0, Cm0: AC.Cm0 };
  try {
    const r = newtonSolve(([cd0, cl0, cm0]) => { AC.CD0 = cd0; AC.CL0 = cl0; AC.Cm0 = cm0; return resid(V, al, de); }, [0.03, 0.4, 0]);
    assert.ok(r.ok, `round trip residual ${r.rn}`);
    assert.ok(Math.abs(r.x[0] - 0.024) <= 1e-6 && Math.abs(r.x[1] - 0.25) <= 1e-6 && Math.abs(r.x[2] - 0.045) <= 1e-6, `recovered ${r.x}`);
  } finally { Object.assign(AC, truth); }
});

test('newtonSolve: a singular Jacobian or no descent stops with ok false instead of NaN', () => {
  const s = newtonSolve(([x, y]) => [x + y - 1, 2 * x + 2 * y - 3], [0, 0]);   // inconsistent: no solution
  assert.ok(!s.ok && s.it === 0 && s.x.every(Number.isFinite), JSON.stringify(s));      // singular Jacobian at once
  const nd = newtonSolve(([x]) => [x * x + 1], [1]);                            // no real root: x → 0, then no descent
  assert.ok(!nd.ok && nd.it === 1 && Math.abs(nd.x[0]) < 1e-6 && Math.abs(nd.rn - 1) < 1e-9, JSON.stringify(nd));
  const q = newtonSolve(([x]) => [x * x - 2], [1]);
  assert.ok(q.ok && Math.abs(q.x[0] - Math.SQRT2) < 1e-9 && q.it <= 6, JSON.stringify(q));
});
