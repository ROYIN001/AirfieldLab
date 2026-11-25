// Fixed-step accumulator, auto-pause and render interpolation (plan item A7; owner's research round 1, task list items
// 6 and 7 in docs/research/01-flight-physics.md; docs/research/01-flight-physics/09-numerics.md §9.4, §9.12 tasks 1–2,
// tests T-N-07, T-N-08, T-N-09 in §9.9; research scripts s9_advance.mjs, s9_judder.mjs, s9_judder_hist.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const { Flight, Recorder, qNlerp, SCENARIOS, setActiveRunway, RAD } = M;
setActiveRunway('21R');
const calm = () => new Flight({ wind: SCENARIOS.calm, pilot: 'ap' });

// Frames fed as frame() in src/90-app.js does, dt = min(0.1, (now − last) / 1000), from ideal float ms timestamps
// k·1000/f as research s9_advance.mjs; round = 0.1 rounds them to 0.1 ms as browsers coarsen rAF times.
function run(hz, n = 2000, round = 0) {
  const f = calm(), hist = {}; let last = 0, steps = 0, bad = 0;
  for (let k = 1; k <= n; k++) {
    const now = round ? Math.round(k * 1000 / hz / round) * round : k * 1000 / hz, dt = Math.min(0.1, (now - last) / 1000); last = now;
    const t0 = f.ac.t, s = f.advance(dt);
    if (s !== Math.round((f.ac.t - t0) / f.dt) || f.acc < 0) bad++;   // a remainder below 0 (≤ ε) is clamped, so α = acc/dt ≥ 0
    hist[s] = (hist[s] || 0) + 1; steps += s;
  }
  return { f, hist, steps, bad, wall: n / hz };
}

test('T-N-07: ideal float ms timestamps (k·1000/f), 120 Hz gives 2 steps every frame and 60 Hz 4 (was 1/2/3 and 3/4/5); sim time = real time', () => {
  for (const [hz, want] of [[120, { 2: 2000 }], [60, { 4: 2000 }], [240, { 1: 2000 }], [144, { 1: 667, 2: 1333 }]]) {
    const { f, hist, steps, bad, wall } = run(hz);
    assert.equal(bad, 0, `${hz} Hz: advance() returns the number of ticks it took and leaves acc ≥ 0`);
    assert.deepEqual(hist, want, `${hz} Hz steps per frame ${JSON.stringify(hist)}`);
    assert.ok(Math.abs(steps * f.dt - wall) <= f.dt && Math.abs(f.ac.t - wall) <= f.dt, `${hz} Hz: sim ${f.ac.t.toFixed(6)} s, real ${wall.toFixed(6)} s`);
    assert.ok(Math.abs(f.ac.t + f.acc - wall) <= 1e-6, `${hz} Hz: sim time + remainder = real time`);
  }
  // Browser rAF times rounded to 0.1 ms: ε cannot snap a 0.03 ms rounding error, so the step count still mixes
  // (measured 60 Hz {3:667, 4:667, 5:666}, 120 Hz {1:667, 2:666, 3:667}); time is conserved and renderPose hides the
  // mix (T-N-09 below with the same timestamps).
  for (const [hz, want] of [[60, { 3: 667, 4: 667, 5: 666 }], [120, { 1: 667, 2: 666, 3: 667 }]]) {
    const { f, hist, bad } = run(hz, 2000, 0.1), wall = Math.round(2000 * 1000 / hz / 0.1) * 0.1 / 1000;
    assert.equal(bad, 0); assert.deepEqual(hist, want, `${hz} Hz, 0.1 ms timestamps: ${JSON.stringify(hist)}`);
    assert.ok(Math.abs(f.ac.t + f.acc - wall) <= 1e-6, `${hz} Hz, 0.1 ms timestamps: sim time + remainder = real time`);
  }
  // Jittered timestamps (±0.5 ms, rounded to 1 µs): time is conserved, so ε stays far below the jitter (1e-9 s in
  // §9.8; ε = 1e-4 s would drift 0.5 ms ahead) and the negative-remainder clamp never adds time.
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, f = calm(); let last = 0, wall = 0;
  for (let k = 1; k <= 2000; k++) {
    const now = Math.round((k * 1000 / 120 + (rnd() - 0.5)) * 1000) / 1000, dt = (now - last) / 1000; last = now; wall += dt; f.advance(dt);
  }
  assert.ok(Math.abs(f.ac.t + f.acc - wall) <= 1e-6, `jitter: sim + remainder − real = ${(f.ac.t + f.acc - wall).toExponential(2)} s`);
});

test('T-N-08: advance(30) adds 0.1 ± 1/240 s in 24 steps, advance(0) takes none and leaves the picture still', () => {
  const f = calm(), t0 = f.ac.t;
  assert.equal(f.advance(30), Math.ceil(0.1 / f.dt));
  assert.ok(Math.abs(f.ac.t - t0 - 0.1) <= f.dt, `gap: +${(f.ac.t - t0).toFixed(6)} s`);
  assert.ok(f.acc >= 0 && f.acc < f.dt, `remainder ${f.acc}`);
  f.advance(0.002);
  const t1 = f.ac.t, acc = f.acc, pose = JSON.stringify(f.renderPose());
  assert.equal(f.advance(0), 0); assert.equal(f.ac.t, t1); assert.equal(f.acc, acc);
  assert.equal(JSON.stringify(f.renderPose()), pose, 'paused (warp 0): same pose every frame');
  assert.equal(f.advance(-0.005), 0); assert.equal(f.acc, acc, 'a negative frame time is ignored');
  f.acc = 0.5;   // a backlog (cannot build up through advance itself): at most ceil(0.1/dt) steps, the rest dropped
  assert.equal(f.advance(0), 24); assert.equal(f.acc, f.dt, 'backlog beyond one step dropped (acc = min(acc, dt), §9.4)');
});

test('T-N-09: interpolated pose on a calm 95 kt glide at 144 Hz moves V/f every frame (RMS ≤ 5 mm; latest state ~100 mm)', () => {
  const judder = (interp, round = 0) => {   // round 0.1: rAF timestamps rounded to 0.1 ms, the display still at 1/144 s
    const f = calm(), e = []; let last = 0, prev = null, prevV = 0, Vmin = Infinity, Vmax = 0;
    for (let k = 1; k <= 1440; k++) {
      const now = round ? Math.round(k * 1000 / 144 / round) * round : k * 1000 / 144, dt = Math.min(0.1, (now - last) / 1000); last = now; f.advance(dt);
      const p = interp ? f.renderPose().p : [f.ac.x[0], f.ac.x[1], f.ac.x[2]], V = Math.hypot(f.ac.x[3], f.ac.x[4], f.ac.x[5]);
      if (prev && k > 10) e.push(Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]) - 0.5 * (V + prevV) / 144);
      prev = p; prevV = V; Vmin = Math.min(Vmin, V); Vmax = Math.max(Vmax, V);
    }
    return { rms: Math.sqrt(e.reduce((s, x) => s + x * x, 0) / e.length), Vmin, Vmax };
  };
  const a = judder(true), b = judder(false), c = judder(true, 0.1);
  // 95 kt IAS is 50.9 m/s true at 31 °C, so the ideal step is the flown speed / f, not 95 kt / f
  assert.ok(a.Vmin > 50.5 && a.Vmax < 51.5, `speed ${a.Vmin.toFixed(3)}…${a.Vmax.toFixed(3)} m/s`);
  assert.ok(a.rms <= 0.005, `interpolated: RMS ${(a.rms * 1000).toFixed(4)} mm`);
  assert.ok(b.rms >= 0.08, `latest state (old method): RMS ${(b.rms * 1000).toFixed(1)} mm`);
  // with 0.1 ms timestamps the drawn pose follows the rounded clock: ±0.05 ms × 51 m/s, measured 2.5 mm RMS
  assert.ok(c.rms <= 0.005, `interpolated, 0.1 ms timestamps: RMS ${(c.rms * 1000).toFixed(4)} mm`);
});

test('renderPose: ends at the previous and current state, unit quaternion on the shorter arc, surfaces lerped', () => {
  // A new Flight (start, R restart, a new demo; the setup preview draws one with no advance) draws its own start state
  // (09-numerics.md §9.7: xPrev = x after setApproach or setParked), also after another Flight has flown.
  const g0 = calm(); g0.advance(0.5);
  for (const g of [calm(), new Flight({ wind: SCENARIOS.xl, pilot: 'man', dist: 1700, seed: 3 })]) {
    const r = g.renderPose();
    for (let i = 0; i < 3; i++) assert.equal(r.p[i], g.ac.x[i], 'new Flight: position');
    // within 1e-15, not exact (A9): qNlerp normalises, and the xl start state (log-law crab) has |q| − 1 = −1.1e-16,
    // so one component came out one ulp off (−0.1394330266010838 against −0.13943302660108378); a rounding, not physics
    for (let i = 0; i < 4; i++) assert.ok(Math.abs(r.q[i] - g.ac.x[6 + i]) <= 1e-15, `new Flight: attitude ${r.q[i]} ${g.ac.x[6 + i]}`);
    for (const n of ['de', 'da', 'dr', 'flaps', 'gearPos', 'steer']) assert.equal(r[n], g.ac[n], `new Flight: ${n}`);
  }
  const f = calm(); f.advance(0.0125); f.advance(0.002);
  const u = f.acc / f.dt, A = f.xPrev, B = f.ac.x, near = (x, y, tol = 1e-12) => Math.abs(x - y) <= tol;
  assert.ok(u > 0 && u < 1, `α ${u}`);
  const acc = f.acc; f.acc = 0; const r0 = f.renderPose(); f.acc = f.dt; const r1 = f.renderPose(); f.acc = acc;
  for (let i = 0; i < 3; i++) assert.ok(near(r0.p[i], A[i]) && near(r1.p[i], B[i]), 'position at α 0 and 1');
  for (let i = 0; i < 4; i++) assert.ok(near(r0.q[i], A[6 + i]) && near(r1.q[i], B[6 + i]), 'attitude at α 0 and 1');
  const r = f.renderPose(); assert.ok(near(Math.hypot(...r.q), 1), '|q| = 1');
  for (let i = 6; i < 10; i++) B[i] = -B[i];            // −q is the same attitude: the pose must not swing through 360°
  const rf = f.renderPose(); for (let i = 6; i < 10; i++) B[i] = -B[i];
  for (let i = 0; i < 4; i++) assert.ok(near(rf.q[i], r.q[i], 1e-15), 'shorter arc');
  const names = ['de', 'da', 'dr', 'flaps', 'gearPos', 'steer'];   // make every saved surface differ from the current one
  f.sPrev.set([0.11, -0.07, 0.05, 0.4, 0.3, 0.2]); const rs = f.renderPose();
  names.forEach((n, i) => assert.ok(near(rs[n], f.sPrev[i] + (f.ac[n] - f.sPrev[i]) * u), `surface ${n}`));
});

test('renderPose: setParked or setApproach on a live Flight draws the new state at once, with or without a tick (§9.7)', () => {
  const same = (f, what) => {
    const r = f.renderPose();
    for (let i = 0; i < 3; i++) assert.equal(r.p[i], f.ac.x[i], `${what}: position`);
    for (let i = 0; i < 4; i++) assert.equal(r.q[i], f.ac.x[6 + i], `${what}: attitude`);
    for (const n of ['de', 'da', 'dr', 'flaps', 'gearPos', 'steer']) assert.equal(r[n], f.ac[n], `${what}: ${n}`);
  };
  const f = calm(); f.advance(0.0125); f.advance(0.002); assert.ok(f.acc > 0);
  f.ac.setParked(0, 0, 30 * Math.PI / 180); same(f, 'setParked'); f.advance(0); same(f, 'setParked, advance(0)');
  f.advance(0.0005); same(f, 'setParked, no tick yet');
  const g = calm(); g.advance(0.3); g.advance(0.002);
  g.ac.setApproach({ dist: 3000 }); same(g, 'setApproach'); g.advance(0); same(g, 'setApproach, advance(0)');
});

test('renderPose: a crashed flight stands still (tick keeps the previous state even when it does nothing)', () => {
  const f = calm(); f.advance(1 / 60); f.crashed = true; f.advance(1 / 60);
  const p0 = JSON.stringify(f.renderPose());
  for (const dt of [0.001, 0.003, 0.0071, 0.02]) { f.advance(dt); assert.equal(JSON.stringify(f.renderPose()), p0, `dt ${dt}`); }
});

test('renderPose: attitude also moves evenly, 38°/s roll at 144 Hz (angle per frame vs |ω|/f, RMS ≤ 0.005°)', () => {
  const judder = (interp) => {
    const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: true }), e = [];
    let last = 0, pq = null, pw = 0;
    for (let k = 1; k <= 144 * 3; k++) {
      f.input.x = k < 43 ? 0 : 0.6;
      const now = k * 1000 / 144, dt = (now - last) / 1000; last = now; f.advance(dt);
      const q = interp ? f.renderPose().q : [f.ac.x[6], f.ac.x[7], f.ac.x[8], f.ac.x[9]], w = Math.hypot(f.ac.x[10], f.ac.x[11], f.ac.x[12]);
      if (pq && k > 72) e.push(2 * Math.acos(Math.min(1, Math.abs(q[0] * pq[0] + q[1] * pq[1] + q[2] * pq[2] + q[3] * pq[3]))) - 0.5 * (w + pw) / 144);
      pq = q.slice(); pw = w;
    }
    return Math.sqrt(e.reduce((s, x) => s + x * x, 0) / e.length) * RAD;
  };
  const a = judder(true), b = judder(false);
  assert.ok(a <= 0.005, `interpolated ${a.toFixed(5)}°`); assert.ok(b >= 0.03, `latest state ${b.toFixed(4)}°`);
});

test('Recorder.at (replay) on the shared qNlerp: frame attitudes at their times, shorter arc, u from A to B', () => {
  const f = calm(); for (let i = 0; i < 480; i++) f.tick(f.dt);   // 2 s flown: about 20 real frames at 10 Hz
  const F = f.rec.f, A = F[5], B = F[6], near = (x, y, tol = 1e-12) => Math.abs(x - y) <= tol;
  for (const [t, Q] of [[A.t, A.q], [B.t, B.q]]) { const q = f.rec.at(t).q; for (let i = 0; i < 4; i++) assert.ok(near(q[i], Q[i]), `at(${t}) q`); }
  // synthetic frames 40° apart in yaw, B stored as −q: the replay must take the 40° arc, not the 320° one
  const R = new Recorder(), c = Math.cos(20 * Math.PI / 180), sn = Math.sin(20 * Math.PI / 180);
  R.f.push({ t: 0, n: 0, q: [1, 0, 0, 0] }, { t: 1, n: 10, q: [-c, 0, 0, -sn] });
  for (const u of [0.25, 0.5]) {
    const o = R.at(u), w = [1 - u + u * c, 0, 0, u * sn], l = Math.hypot(...w);
    assert.ok(near(o.n, 10 * u), `n at ${u}`); assert.ok(near(Math.hypot(...o.q), 1), '|q| = 1');
    for (let i = 0; i < 4; i++) assert.ok(near(o.q[i], w[i] / l), `q at u ${u}: ${o.q} vs ${w.map((v) => v / l)}`);
  }
});

test('qNlerp: offsets into the state vector, ends at u 0 and 1, the shorter arc for −q, unit length', () => {
  const c = Math.cos(15 * Math.PI / 180), sn = Math.sin(15 * Math.PI / 180), near = (x, y) => Math.abs(x - y) <= 1e-12;
  const a = [9, 9, 1, 0, 0, 0], b = [7, -c, -sn, 0, 0];   // a at 2, b at 1 (roll 30°, stored as −q)
  const q0 = qNlerp(a, 2, b, 1, 0, [0, 0, 0, 0]), q1 = qNlerp(a, 2, b, 1, 1, [0, 0, 0, 0]), qh = qNlerp(a, 2, b, 1, 0.5, [0, 0, 0, 0]);
  [1, 0, 0, 0].forEach((v, i) => assert.ok(near(q0[i], v), 'u 0'));
  [c, sn, 0, 0].forEach((v, i) => assert.ok(near(q1[i], v), 'u 1: +q of the stored −q'));
  const h = Math.cos(7.5 * Math.PI / 180), hs = Math.sin(7.5 * Math.PI / 180);
  [h, hs, 0, 0].forEach((v, i) => assert.ok(near(qh[i], v), `u 0.5: half the 30° arc ${qh}`));
  assert.ok(near(Math.hypot(...qh), 1));
  const o = [0, 0, 0, 0]; assert.equal(qNlerp(a, 2, b, 1, 0.3, o), o, 'writes into out');
});

// Regression guard only: it also holds for the pre-A7 accumulator (the autopilot takes no per-frame input and frames
// stay ≤ 34 ms, below the cap), so it keeps advance() equal to tick() rather than proving A7.
test('frame-rate guard (regression guard, also held before A7): autoland 21R, 15 kt gusty crosswind (seed 5), same touchdown at 60 Hz, 144 Hz and jittery frames as tick by tick', () => {
  const fly = (mode) => {
    const f = new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed: 5 }); let s = 7, last = 0, k = 0, td = null;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
      if (mode === 'tick') f.tick(f.dt);
      else { k++; const now = mode === 'jit' ? last + 4 + rnd() * 30 : k * 1000 / mode; f.advance(Math.min(0.1, (now - last) / 1000)); last = now; }
      if (!td && f.ev.td) td = f.ev.td;
    }
    return { td: JSON.stringify(td), score: f.ev.score().total };
  };
  const ref = fly('tick');
  assert.ok(ref.td !== 'null', 'touchdown');
  for (const m of [60, 144, 'jit']) { const r = fly(m); assert.equal(r.td, ref.td, `${m}: touchdown record`); assert.equal(r.score, ref.score, `${m}: score`); }
});

test('src/90-app.js: the aircraft and cameras use renderPose, the hidden tab pauses (Thai message), P, ×1 or a tap resumes', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /else if \(fl\) \{ const r = fl\.renderPose\(rPose\); poseFrom\(r\.p, r\.q, r, dt, running\); \}/, 'aircraft and cameras from renderPose');
  assert.doesNotMatch(app, /poseFrom\((fl\.)?ac\.x/, 'no pose from the latest state');
  assert.match(app, /ac3\.group\.updateMatrixWorld\(true\);\n\s*const acPos = ac3\.group\.position;/, 'cameras follow the drawn (interpolated) aircraft');
  const cam = app.match(/\n    \/\/ camera\n[\s\S]*?\n    \/\/ shadows/)?.[0];
  assert.ok(cam && /acPos/.test(cam) && /ac3\.group\.(matrixWorld|quaternion)/.test(cam), 'camera block found');
  assert.doesNotMatch(cam, /fl\.ac\.x|\bac\.x\[/, 'no camera from the latest state');
  // the multi-line handler only (a newline right after the brace): the one-line keys.clear listener must not start the match
  const vis = app.match(/document\.addEventListener\('visibilitychange', \(\) => \{\n[\s\S]*?\n  \}\);/)?.[0];
  assert.ok(vis && /app\.train\.warp = 0/.test(vis), 'a visibilitychange handler sets warp = 0');
  assert.match(vis, /const flying = app\.mode === 'train' && app\.train\.state === 'fly';/);
  assert.match(vis, /if \(document\.hidden\) \{ stickUp\(\); brUp\(\); thrDrag = false; if \(flying && app\.train\.warp\) \{ app\.train\.warp = 0; refreshLive\(\); \} \}/, 'pause on hide, touch controls released');
  assert.match(vis, /else if \(flying && !app\.train\.warp\) \{ pauseMsg = true; showPause\(\); \}/, 'message on return');
  assert.match(app, /const showPause = \(\) => \{ toast\(PAUSE_MSG, Infinity\); toast\._pause = true; \$\('#toast'\)\.classList\.add\('tap'\); \};/, 'the pause message takes taps (tap class)');
  assert.doesNotMatch(vis, /setTimeout|warp\s*(\+\+|\+=|=\s*[^0=\s])/, 'no auto-resume');
  assert.match(app, /const PAUSE_MSG = isTouch \? 'หยุดชั่วคราว — แตะข้อความนี้เพื่อบินต่อ' : 'หยุดชั่วคราว — กด P เพื่อบินต่อ';/, 'Thai message');
  assert.match(app, /\$\('#toast'\)\.addEventListener\('click', \(\) => \{ if \(toast\._pause && app\.train\.state === 'fly' && !app\.train\.warp\) \{ app\.train\.warp = 1; refreshLive\(\); \} \}\);/, 'a tap on the message resumes');
  assert.match(app, /if \(pauseMsg && !\(app\.mode === 'train' && app\.train\.state === 'fly' && !app\.train\.warp\)\) \{[^\n]*\n\s*pauseMsg = false; if \(toast\._pause\) \{ toast\._pause = false; \$\('#toast'\)\.classList\.remove\('on', 'tap'\); \}\n\s*\} else if \(pauseMsg && !\$\('#toast'\)\.classList\.contains\('on'\)\) showPause\(\);/, 'message dropped once the flight runs again, back after another message times out');
  assert.match(app, /function toast\(msg, ms = 2600\) \{ const t = \$\('#toast'\); toast\._pause = false; t\.classList\.remove\('tap'\); t\.textContent = msg; t\.classList\.add\('on'\); clearTimeout\(toast\._h\); if \(ms < Infinity\) toast\._h = setTimeout/, 'another message replaces the pause message; Infinity is never passed to setTimeout (it would be 0 ms)');
  assert.match(app, /const flying = \(\) => app\.mode === 'train' && app\.train\.state === 'fly' && app\.train\.warp > 0;/, 'the horn context idles in a paused flight');
  // .toast has pointer-events: none and .ov z-index 3, like the strip (#instr, after #toast) and the rotate hint
  const tpl = fs.readFileSync(new URL('../src/template.html', import.meta.url), 'utf8');
  const zi = tpl.match(/\.toast\.on\.tap \{ pointer-events: auto;[^}]*z-index: (\d+);[^}]*\}/);
  assert.ok(zi && +zi[1] > 3 && +zi[1] < 10, 'the pause message takes taps above the overlays (z-index 3) and below .loading (10)');
  // P (and the gamepad's Start) toggle pause through doAction(act), the one place for key and gamepad toggles since the
  // input layer (PR #11, plan B4) moved them out of the keydown handler
  assert.match(app, /function doAction\(act\) \{[\s\S]{0,400}?if \(act === 'pause' && app\.train\.state === 'fly'\) \{ app\.train\.warp = app\.train\.warp \? 0 : 1; refreshLive\(\); \}/, 'P toggles pause');
});
