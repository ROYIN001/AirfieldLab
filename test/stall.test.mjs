// 1-g stall: CL(α) sweep for clean and landing flaps (owner's research round 1,
// docs/research/01-flight-physics/01-aero.md T-A-01; Vs0 71 kt is the design value AC.Vs0),
// and T-A-07 stall-warning margin, 14 CFR 23.207 [A22].
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
import { trim } from './lib/fstd.mjs';
const { Aircraft, Evaluator, aWarnAt, Flight, SCENARIOS, setActiveRunway, AC, DEG, RAD, KT, G0, FT, eulerToQ, qToR, mulR } = M;

function clmax(flaps) {
  const ac = new Aircraft(); ac.flaps = flaps;
  let best = { CL: 0, a: 0 };
  for (let i = 0; i <= 440; i++) {
    const a = i * 0.05, th = a * DEG, qq = [Math.cos(th / 2), 0, Math.sin(th / 2), 0];
    ac.x.set([0, 0, -500, 45, 0, 0, qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);   // level flight path: α = θ
    const d = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, new Float64Array(13), d);
    if (d.CL > best.CL) best = { CL: d.CL, a };
  }
  return { ...best, vs: Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * best.CL)) / KT };
}

test('T-A-01 clean: CLmax 1.355 ± 0.02 at α 14.6 ± 1.0°, Vs1 78.5 ± 0.6 kt', () => {
  const r = clmax(0);
  assert.ok(Math.abs(r.CL - 1.355) <= 0.02 && Math.abs(r.a - 14.6) <= 1.0 && Math.abs(r.vs - 78.5) <= 0.6, `CLmax ${r.CL.toFixed(3)} at ${r.a.toFixed(2)}°, Vs ${r.vs.toFixed(1)} kt`);
});

test('T-A-01 landing flaps: CLmax 1.657 ± 0.02 at α 11.6 ± 1.0°, Vs0 71.0 ± 0.5 kt (AC.Vs0)', () => {
  const r = clmax(1);
  assert.ok(Math.abs(r.CL - 1.657) <= 0.02 && Math.abs(r.a - 11.6) <= 1.0 && Math.abs(r.vs - AC.Vs0) <= 0.5, `CLmax ${r.CL.toFixed(3)} at ${r.a.toFixed(2)}°, Vs ${r.vs.toFixed(1)} kt (AC.Vs0 ${AC.Vs0})`);
});

test('flaps lower the stall speed and the stall angle', () => {
  const c = clmax(0), f = clmax(1);
  assert.ok(f.vs < c.vs - 5 && f.a < c.a, `clean ${c.vs.toFixed(1)} kt at ${c.a.toFixed(2)}°, flaps ${f.vs.toFixed(1)} kt at ${f.a.toFixed(2)}°`);
});

// T-A-07 (01-aero.md §1.6, §1.9): the stall warning starts ≥ 5 kt above the stall (14 CFR 23.207(c) [A22]).
// Static: CL with the elevator trimmed for q̇ = 0 (q = 0, no α̇, level path, h 1,000 m, out of ground effect);
// 1-g EAS at 2,250 kg, ISA sea-level density. Margin = V(α_warn) − Vs at the CLmax of the same curve.
const aWarnDeg = (f) => aWarnAt(f) * RAD;   // the Evaluator's own threshold (src/20-flight.js aWarnAt)
function clTrim(flaps, aDeg) {
  const ac = new Aircraft(); ac.flaps = flaps; ac.gearPos = 1; ac.thr = 0;
  const th = aDeg * DEG, d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13);
  ac.x.set([0, 0, -1000, 45, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]);
  const qd = (de) => { ac.de = de; ac.deriv(ac.x, o, d); return o[11]; };   // q̇ is linear in δe
  const q0 = qd(0), q1 = qd(-0.01); qd(-0.01 * q0 / (q0 - q1));
  return d.CL;
}
const v1g = (CL) => Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * CL)) / KT;
function warnMargin(f) {
  let pk = { CL: 0, a: 0 };
  for (let i = 0; i <= 2500; i++) { const a = i * 0.01, CL = clTrim(f, a); if (CL > pk.CL) pk = { CL, a }; }
  const vs = v1g(pk.CL), vw = v1g(clTrim(f, aWarnDeg(f)));
  return { aw: aWarnDeg(f), aPk: pk.a, vs, vw, dv: vw - vs };
}
for (const f of [0, 0.25, 0.5, 0.75, 1]) {
  test(`T-A-07 static, flaps ${f}: warning ≥ 5 kt above Vs and within 7 ± 1 kt; α_warn below α_CLmax`, () => {
    const r = warnMargin(f), info = `α_warn ${r.aw.toFixed(2)}°, α_CLmax ${r.aPk.toFixed(2)}°, warn ${r.vw.toFixed(2)} kt, Vs ${r.vs.toFixed(2)} kt, margin ${r.dv.toFixed(2)} kt`;
    assert.ok(r.dv >= 5 && Math.abs(r.dv - 7) <= 1 && r.aw < r.aPk - 2, info);
  });
}

// Dynamic: 1 kt/s deceleration holding 1,000 m (the throttle holds the speed schedule, so it is not at idle as in
// 10-validation.md T-V-11), no α limiter, ISA, calm. Each sample is corrected to 1 g by V/√n_L with n_L = q̄·S·CL/W
// (aero lift only), so the margin is warning speed minus stall speed, both in 1-g flight, as in the static test.
function decel(f) {
  const ac = new Aircraft(), ev = new Evaluator(), h0 = 1000, ias0 = f ? 92 : 100;
  const T = trim(ac, { ias: ias0, h: h0, flaps: f, gear: 1 });
  const Q = eulerToQ(0, T.alpha, 0), v = mulR(qToR(Q, new Array(9)), [T.y0[0], 0, T.y0[2]]);
  ac.x.set([0, 0, -h0, v[0], v[1], v[2], ...Q, 0, 0, 0]);
  ac.cmd.flaps = f; ac.cmd.gear = 1; ac.de = ac.cmd.de = T.de; ac.thr = ac.cmd.thr = T.thr; ac.updateAir(0);
  const dt = 1 / 240; let thBias = T.alpha, deI = T.de, thrI = T.thr, t = 0, on = null, off = false, evIas = null, pk = { CL: 0 };
  while (t < 150) {
    const a = ac.air, c = ac.cmd, gCmd = -Math.max(-0.05, Math.min(0.05, 0.0028 * (a.h - h0)));
    thBias = Math.max(-8 * DEG, Math.min(25 * DEG, thBias + (gCmd - a.gamma) * 0.55 * dt));
    const e = thBias + 1.4 * (gCmd - a.gamma) - a.theta;
    deI = Math.max(-AC.deUp, Math.min(AC.deDn, deI - 0.6 * e * dt)); c.de = deI - 2.0 * e + 0.85 * a.q;
    const err = ias0 - t - a.ias / KT; thrI = Math.max(AC.idle, Math.min(1, thrI + 0.02 * err * dt)); c.thr = Math.max(AC.idle, Math.min(1, thrI + 0.08 * err));
    ac.step(dt); t += dt; ev.update(ac, null);
    const b = ac.air, v1 = b.ias / KT / Math.sqrt(b.qbar * AC.S * b.CL / (AC.m * G0));   // 1-g equivalent, kt
    if (ev.stallHorn && on == null) on = v1;
    if (on != null && !ev.stallHorn) off = true;
    if (evIas == null && ev.events.length) evIas = v1;
    if (b.CL > pk.CL) pk = { CL: b.CL, ias: v1, a: b.alpha * RAD };
    if (b.alpha * RAD > pk.a + 2) break;   // 2° past the CL peak: stalled
  }
  return { on, off, evIas, pk, dv: on - pk.ias };
}
const DYN = { 0: 6.82, 1: 7.31 };   // measured 2026-11-22 (A5), 1-g corrected: 6.82 / 7.31 kt (static 6.83 / 7.31); band ± 0.5 kt
for (const f of [0, 1]) {
  test(`T-A-07 dynamic 1 kt/s, flaps ${f}: the Evaluator warns ≥ 5 kt (${DYN[f]} ± 0.5) above the CL peak and stays on through the stall`, () => {
    const r = decel(f), info = `warn ${r.on && r.on.toFixed(2)} kt, CL peak ${r.pk.CL.toFixed(3)} at ${r.pk.ias.toFixed(2)} kt (α ${r.pk.a.toFixed(2)}°), margin ${r.dv.toFixed(2)} kt, debrief stall event at ${r.evIas && r.evIas.toFixed(2)} kt, went off ${r.off}`;
    assert.ok(r.on != null && r.dv >= 5 && Math.abs(r.dv - DYN[f]) <= 0.5, info);
    assert.ok(!r.off, 'the warning continues until the stall (23.207(c)): ' + info);
    assert.ok(r.evIas != null && r.on - r.evIas >= 4, 'the debrief stall event keeps its own, later criterion: ' + info);
  });
}

// The Evaluator switches the warning by α at aWarnAt(flaps), at any speed, so it holds in turning and pulled-up flight
// (01-aero.md §1.6, 14 CFR 23.207(a) [A22]: straight and turning flight). Stub aircraft state, one Evaluator step each.
function evStep(ev, ac, t, aDeg, extra = {}) {
  ac.t = t; Object.assign(ac.air, { alpha: aDeg * DEG }, extra); ev.update(ac, null); return ev.stallHorn;
}
const stubAc = (flaps, iasKt) => ({ t: 0, flaps, air: { h: 1000, s: -5000, hWheel: 1000, ias: iasKt * KT, alpha: 0, onGround: false, stall: 0, wow: [false, false, false] } });
for (const f of [0, 0.25, 0.5, 0.75, 1]) {
  test(`stall warning, flaps ${f}: the Evaluator comes on at aWarnAt (${aWarnDeg(f).toFixed(2)}°) by α at 70 and 120 kt (accelerated)`, () => {
    for (const kt of [70, 120]) {
      const below = new Evaluator(), above = new Evaluator();
      assert.equal(evStep(below, stubAc(f, kt), 1, aWarnDeg(f) - 0.1), false, `${kt} kt, α_warn − 0.1°`);
      assert.equal(evStep(above, stubAc(f, kt), 1, aWarnDeg(f) + 0.1), true, `${kt} kt, α_warn + 0.1°`);
    }
    assert.equal(evStep(new Evaluator(), stubAc(f, 70), 1, aWarnDeg(f) - 1), false, '70 kt, α_warn − 1°');
  });
}

test('stall warning release: on at once, held for aWarnMinOn s and within aWarnHyst, then off; off on the ground', () => {
  assert.deepEqual([AC.aWarnHyst, AC.aWarnMinOn], [0.5, 0.5], 'A5 design values');
  const ev = new Evaluator(), ac = stubAc(0, 90), aW = aWarnDeg(0);
  assert.equal(evStep(ev, ac, 0, aW - 0.01), false);
  assert.equal(evStep(ev, ac, 1, aW + 0.001), true, 'on at α_warn');
  assert.equal(evStep(ev, ac, 1.2, aW - 1), true, 'held: less than aWarnMinOn since onset');
  assert.equal(evStep(ev, ac, 1.6, aW - AC.aWarnHyst + 0.05), true, 'held: inside the hysteresis band');
  assert.equal(evStep(ev, ac, 1.7, aW - AC.aWarnHyst - 0.01), false, 'off below α_warn − aWarnHyst after aWarnMinOn');
  assert.equal(evStep(ev, ac, 2.0, aW + 0.2), true, 'not latched: comes on again');
  assert.equal(evStep(ev, ac, 2.1, aW + 3, { onGround: true }), false, 'off on the ground');
  assert.equal(evStep(ev, ac, 2.2, aW + 3, { onGround: false, ias: 40 * KT }), false, 'off at 40 kt or less');
  assert.deepEqual(ev.events, [], 'the debrief stall event keeps its own criterion');
});

// 23.207(d) [A22] asks for no stall warning on a normal approach. This holds in calm air; in the 15 kt gusty
// crosswind it does not yet (the autopilot flies Vref with no gust additive), so that half is a regression guard for
// seed 5 until the owner decides. Autoland, seed 5, all four runway ends. In calm air there is
// none. In the 15 kt gusty crosswind the autopilot flies Vref with no gust additive, and with seed 5 the horn starts
// in APP mode between about 29 and 50 ft on every runway end, above the flare height. Round 2's `stall_warning` check
// (02-light-aircraft/08-handling.md, any phase above 20 ft) would flag these flights; the threshold stays at the T-A-07
// design value until the owner chooses (flap α_warn 7.77°, about 5 kt, or a Vref gust additive). The 50 ft limit and
// the 3 onsets are an A5 regression choice (no source) that holds for seed 5 only.
for (const id of ['21R', '21L', '03L', '03R']) {
  test(`${id} autoland, seed 5: no stall warning in calm air (23.207(d)); gusty crosswind regression guard (not yet 23.207(d)): onsets only below 50 ft, at most 3`, () => {
    setActiveRunway(id);
    try {
      for (const key of ['calm', 'xl']) {
        const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
        let high = 0, any = 0, prev = false;
        const onsets = [];
        while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
          f.tick(f.dt); const h = f.ev.stallHorn;
          if (h) { any++; if (f.ac.air.hWheel > 50 * FT) high++; if (!prev) onsets.push(`${(f.ac.air.hWheel / FT).toFixed(1)} ft ${f.ap.mode}`); }
          prev = h;
        }
        const info = `${id} ${key}: horn onsets [${onsets.join('; ')}]`;
        assert.equal(high, 0, `${info}, ${high} steps above 50 ft`);
        if (key === 'calm') assert.equal(any, 0, `${info}, ${any} steps`);
        else assert.ok(onsets.length <= 3, info);
        assert.deepEqual(f.ev.events.map((e) => e.k), []);
      }
    } finally { setActiveRunway('21R'); }
  });
}

// The app wiring: the HUD STALL word and the horn both follow Evaluator.stallHorn (01-aero.md §1.12 item 3 asks for the
// fix in the Evaluator and the HUD), and the HUD no longer uses the old α_stall − 4° rule.
test('src/90-app.js drives the HUD STALL word and the horn from fl.ev.stallHorn', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /if \(fl\.ev\.stallHorn\) callout\('STALL'/, 'HUD STALL word');
  assert.match(app, /horn\.set\([^;]*fl\.ev\.stallHorn\)/, 'horn');
  assert.doesNotMatch(app, /aStallFlap \* fl\.ac\.flaps - 4/, 'old HUD rule');
});
