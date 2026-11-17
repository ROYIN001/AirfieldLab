// ───────────────────────── Lights: directional point sprites ─────────────────────────
// kind: 0 steady · 1 two-way (colour depends on side) · 2 one-way toward the approach · 3 PAPI unit
//       4 sequenced flasher · 5 rotating beacon (white/green) · 6 blinking obstruction · 7 strobe
//       8 red beacon · 9 forward lamp (aircraft)
// category (aP.z): 0 airfield lighting · 1 always on · 2 night only · 3 aircraft
const LIGHT_KIND = { steady: 0, twoWay: 1, oneWay: 2, papi: 3, sfl: 4, beacon: 5, blink: 6, strobe: 7, redBeacon: 8, fwd: 9 };

function makeLightMaterial() {
  return new THREE.ShaderMaterial({
    name: 'lights', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uDay: { value: 1 }, uPx: { value: 1000 }, uVis: { value: 20000 }, uOnAF: { value: 0 }, uNightF: { value: 0 }, uOnAC: { value: 1 }, uLand: { value: 1 }, uGlow: { value: 0 } },
    vertexShader: /* glsl */`
      attribute vec3 aColA; attribute vec3 aColB; attribute vec2 aAxis; attribute float aKind; attribute vec4 aP;
      uniform float uTime, uDay, uPx, uVis, uOnAF, uNightF, uOnAC, uLand, uGlow;
      varying vec3 vCol; varying float vI; varying float vG;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 toCam = cameraPosition - wp.xyz;
        float dist = max(length(toCam), 0.5);
        vec3 col = aColA; float I = aP.x;
        int kind = int(aKind + 0.5);
        vec2 h = toCam.xz / max(length(toCam.xz), 1e-3);
        float s = dot(h, aAxis);
        if (kind == 1) { col = s < 0.0 ? aColA : aColB; I *= mix(0.3, 1.0, smoothstep(0.05, 0.5, abs(s))); }
        else if (kind == 2) { I *= smoothstep(0.05, 0.45, -s); }
        else if (kind == 3) {
          float el = degrees(atan(toCam.y, length(toCam.xz)));
          col = mix(vec3(1.0, 0.04, 0.02), vec3(1.0, 0.96, 0.9), smoothstep(aP.y - 0.025, aP.y + 0.025, el));
          I *= smoothstep(0.80, 0.92, -s);
        }
        else if (kind == 4) { float ph = fract(uTime * 2.0 - aP.y); I *= smoothstep(0.05, 0.45, -s) * exp(-ph * ph * 1500.0); }
        else if (kind == 5) {
          float az = atan(h.x, -h.y), beam = uTime * 6.2832 * 0.2 + aP.y;
          float d1 = abs(mod(az - beam + 3.14159, 6.28318) - 3.14159), d2 = abs(mod(az - beam, 6.28318) - 3.14159);
          float f1 = exp(-d1 * d1 * 140.0), f2 = exp(-d2 * d2 * 140.0);
          col = (vec3(1.0, 0.97, 0.92) * f1 + vec3(0.1, 1.0, 0.4) * f2) / max(f1 + f2, 1e-4);
          I *= max(f1, f2);
        }
        else if (kind == 6) { I *= step(fract(uTime * 0.667 + aP.y), 0.45); }
        else if (kind == 7) { float ph = fract(uTime / 1.2 + aP.y); I *= exp(-ph * ph * 5000.0) + exp(-pow(ph - 0.11, 2.0) * 5000.0); }
        else if (kind == 8) { float ph = fract(uTime + aP.y); I *= exp(-ph * ph * 250.0); }
        else if (kind == 9) { vec3 ax = normalize((modelMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz); float c = dot(normalize(toCam), ax); I *= (0.05 + 0.95 * smoothstep(0.80, 0.985, c)) * uLand; }
        float cat = aP.z;
        float on = cat < 0.5 ? uOnAF : (cat < 1.5 ? 1.0 : (cat < 2.5 ? uNightF : uOnAC));
        I *= on * mix(1.0, aP.w, uDay);
        I *= exp(-3.0 * dist / uVis);
        vCol = col;
        vI = I * 2.2 / (1.0 + pow(dist / 3500.0, 1.4));
        vec4 mv = viewMatrix * wp;
        gl_Position = projectionMatrix * mv;
        float px = (2.4 + 22.0 / (1.0 + dist / 90.0)) * (uPx / 1000.0) * (0.75 + 0.25 * sqrt(max(aP.x, 0.0) / 0.4));
        px *= 1.0 + 0.9 * uGlow; vG = uGlow;
        gl_PointSize = vI < 0.0008 ? 0.0 : clamp(px, max(2.0, 1.6 * uPx / 1000.0) * (1.0 + 1.2 * uGlow), 64.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vCol; varying float vI; varying float vG;
      void main() {
        vec2 c = gl_PointCoord - 0.5; float r2 = dot(c, c) * 4.0;
        if (r2 > 1.0) discard;
        float a = exp(-r2 * mix(20.0, 26.0, vG)) + exp(-r2 * mix(4.5, 5.5, vG)) * (0.16 + 0.22 * vG);
        gl_FragColor = vec4(vCol * vI * a, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

class LightSet {
  constructor() { this.L = []; }
  add(p, { kind = 0, a = [1, 1, 1], b = null, axis = [0, 0], I = 0.3, param = 0, cat = 0, day = 1 }) {
    this.L.push({ p: p.clone ? [p.x, p.y, p.z] : p, kind, a, b: b || a, axis, I, param, cat, day });
  }
  build(mat) {
    const n = this.L.length, f = (k) => new Float32Array(n * k);
    const pos = f(3), ca = f(3), cb = f(3), ax = f(2), kd = f(1), pp = f(4);
    this.L.forEach((l, i) => {
      pos.set(l.p, i * 3); ca.set(l.a, i * 3); cb.set(l.b, i * 3); ax.set(l.axis, i * 2); kd[i] = l.kind; pp.set([l.I, l.param, l.cat, l.day], i * 4);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aColA', new THREE.BufferAttribute(ca, 3));
    g.setAttribute('aColB', new THREE.BufferAttribute(cb, 3)); g.setAttribute('aAxis', new THREE.BufferAttribute(ax, 2));
    g.setAttribute('aKind', new THREE.BufferAttribute(kd, 1)); g.setAttribute('aP', new THREE.BufferAttribute(pp, 4));
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 20;
    return pts;
  }
}

const LC = { white: [1, 0.95, 0.85], yellow: [1, 0.72, 0.12], green: [0.1, 1, 0.35], red: [1, 0.06, 0.03], blue: [0.12, 0.3, 1], sodium: [1, 0.55, 0.18], warm: [1, 0.78, 0.5], led: [0.95, 0.95, 1] };

function buildAirfieldLights(scene, field, city, data) {
  const S = new LightSet();
  const P3 = (e, n, y) => [e, y, -n];
  // ── runways: edge, threshold/end, centre line (03L/21R), touchdown zone (21R) ──
  for (const R of RUNWAYS) {
    const ax = [R.u[1], -R.u[0]];                       // render xz of the low→high direction
    const at = (s, t, y) => { const [e, n] = rwyEN(R, s, t); return P3(e, n, y); };
    const [A, Bk] = R.ends, EA = RWY_END[A], EB = RWY_END[Bk];
    const sA = R.sThr[0], sB = R.sThr[1], W2 = R.w / 2;
    // colour seen by a pilot landing toward +s (end A) and toward −s (end B)
    const edgeCol = (s) => {
      const fromA = s - sA, fromB = sB - s;
      const a = s < sA ? LC.red : (R.len - s < 600 ? LC.yellow : LC.white);
      const b = s > sB ? LC.red : (s < 600 ? LC.yellow : LC.white);
      return [a, b];
    };
    for (let s = 0; s <= R.len + 0.1; s += 60) for (const t of [-(W2 + 0.6), W2 + 0.6]) {
      const [a, b] = edgeCol(s);
      S.add(at(s, t, 0.35), { kind: 1, a, b, axis: ax, I: 0.32, day: 0.6 });
    }
    // landing thresholds: green toward the approach; runway end lights: red toward the rollout
    for (let t = -W2 + 1.5; t <= W2 - 1.4; t += 3) {
      S.add(at(sA - 1, t, 0.3), { kind: sA > 1 ? 2 : 1, a: LC.green, b: LC.red, axis: ax, I: 0.38, day: 0.6 });
      S.add(at(sB + 1, t, 0.3), { kind: R.len - sB > 1 ? 2 : 1, a: LC.red, b: LC.green, axis: sB < R.len - 1 ? [-ax[0], -ax[1]] : ax, I: 0.38, day: 0.6 });
      if (sA > 1) S.add(at(0.5, t, 0.3), { kind: 2, a: LC.red, axis: [-ax[0], -ax[1]], I: 0.38, day: 0.6 });
      if (sB < R.len - 1) S.add(at(R.len - 0.5, t, 0.3), { kind: 2, a: LC.red, axis: ax, I: 0.38, day: 0.6 });
    }
    // wing bars at a displaced threshold
    if (sB < R.len - 1) for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) S.add(at(sB + 1, sd * (W2 + 2 + k * 3), 0.3), { kind: 2, a: LC.green, axis: [-ax[0], -ax[1]], I: 0.38, day: 0.6 });
    if (R.cl) {
      const cc = (d, k) => (d > R.len - 300 ? LC.red : d > R.len - 900 ? (k % 2 ? LC.red : LC.white) : LC.white);
      for (let s = 15, k = 0; s < R.len; s += 30, k++) S.add(at(s, 0.6, 0.12), { kind: 1, a: cc(s, k), b: cc(R.len - s, k), axis: ax, I: 0.22, day: 0.3 });
    }
    for (const E of [EA, EB]) if (E.tdz) {
      const dir = E === EA ? 1 : -1, s0 = E === EA ? sA : sB, axE = dir > 0 ? ax : [-ax[0], -ax[1]];
      for (let d = 60; d <= 900; d += 60) for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) S.add(at(s0 + dir * d, sd * (9 + j * 1.5), 0.12), { kind: 2, a: LC.white, axis: axE, I: 0.2, day: 0.3 });
    }
  }
  // ── approach lighting per AIP AD 2.14 ──
  for (const E of Object.values(RWY_END)) {
    const ax = [E.u[1], -E.u[0]];
    const at = (s, t, y) => P3(E.thr[1] + E.u[1] * s + E.r[1] * t, E.thr[0] + E.u[0] * s + E.r[0] * t, y);
    const len = { CAT2: 900, CAT1: 900, SALS420: 420, SALS300: 300 }[E.als];
    const stepS = E.als === 'SALS300' ? 60 : 30, bar = E.als.startsWith('SALS') && E.als !== 'SALS300' ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
    for (let s = stepS; s <= len; s += stepS) {
      const k = s / 30, y = s <= E.disp ? 0.25 : 0.9 + s * 0.012 + 0.12;
      for (const t of bar) S.add(at(-s, t * (bar.length === 3 ? 1.2 : 1.0), y), { kind: 2, a: LC.white, axis: ax, I: 0.42, day: 1.6 });
      if (s === 300 || (E.als === 'CAT2' && s === 150)) for (let t = 4.5; t <= (s === 150 ? 10.6 : 15.01); t += 1.5) for (const sg of [-1, 1]) S.add(at(-s, sg * t, y), { kind: 2, a: LC.white, axis: ax, I: 0.42, day: 1.6 });
      if (E.als === 'CAT2' && s <= 270) for (const sg of [-1, 1]) for (const t of [11.5, 13, 14.5]) S.add(at(-s, sg * t, y), { kind: 2, a: LC.red, axis: ax, I: 0.36, day: 1.4 });
      if ((E.als === 'CAT2' || E.als === 'CAT1') && s >= 330) S.add(at(-s - 0.3, 0, y + 0.35), { kind: 4, a: [1, 1, 1], axis: ax, I: 4.0, param: (len - s) / 30 * 0.03, day: 1.2 });
    }
  }
  // ── PAPI (always on, high daytime intensity) ──
  for (const pp of field.papiPos) S.add(P3(pp.e - pp.u[0] * 0.55, pp.n - pp.u[1] * 0.55, 0.64), { kind: 3, axis: [pp.u[0], -pp.u[1]], I: 0.5, param: pp.ang, cat: 1, day: 8 });
  // ── taxiway edge lights (blue) on taxiways outside the aprons ──
  for (const t of data.af.tw) {
    if (t.k !== 'twy') continue;
    plSample(t.p, 45, (p, d) => {
      if (onAnyRunway(p[0], p[1], 40)) return;
      for (const sd of [-1, 1]) S.add(P3(p[0] + d[1] * sd * 12.1, p[1] - d[0] * sd * 12.1, 0.3), { kind: 0, a: LC.blue, I: 0.13, day: 0.4 });
    });
  }
  // ── obstruction lights, aerodrome beacon, mast lamps, windsocks ──
  if (field.towerTop) {
    S.add([field.towerTop.x, field.towerTop.y, field.towerTop.z], { kind: 0, a: LC.red, I: 0.25, cat: 1, day: 1.4 });
    S.add([field.towerCab.x, field.towerCab.y + 4.4, field.towerCab.z], { kind: 5, I: 3.0, cat: 2, day: 0.5 });
  }
  for (const [e, n] of field.masts) {
    S.add(P3(e, n, 31.4), { kind: 6, a: LC.red, I: 0.2, cat: 1, param: e * 0.01, day: 1.4 });
    for (const d of [-0.9, 0, 0.9]) S.add(P3(e + d * 0.48, n + d * 0.877, 29.6), { kind: 0, a: LC.led, I: 1.4, cat: 2, day: 0.2 });
  }
  for (const [e, n] of field.sockPos) S.add(P3(e, n, 6.6), { kind: 0, a: LC.warm, I: 0.12, cat: 2, day: 0.1 });
  // ── corridors: tollway LED lamps, viaduct lamps, BTS ──
  const af = data.af;
  plSample(af.tollway, 38, (p, d) => { for (const sd of [-1, 1]) S.add(P3(p[0] + d[1] * sd * 13, p[1] - d[0] * sd * 13, 24), { kind: 0, a: LC.led, I: 0.32, cat: 2, day: 0.05 }); });
  plSample(af.tollway, 52, (p, d) => { for (const sd of [-1, 1]) S.add(P3(p[0] + d[1] * sd * 24, p[1] - d[0] * sd * 24, 10), { kind: 0, a: LC.sodium, I: 0.3, cat: 2, day: 0.05 }); });
  plSample(af.rail, 40, (p, d) => S.add(P3(p[0], p[1], 19), { kind: 0, a: LC.led, I: 0.16, cat: 2, day: 0.05 }));
  plSample(af.phahon, 36, (p, d) => { for (const sd of [-1, 1]) S.add(P3(p[0] + d[1] * sd * 16, p[1] - d[0] * sd * 16, 9), { kind: 0, a: LC.sodium, I: 0.28, cat: 2, day: 0.05 }); });
  // ── city street lights along mapped roads ──
  for (const L of decodeLights(data.lights)) {
    const major = L.k === 1, h = ((L.e * 73856093) ^ (L.n * 19349663)) >>> 0;
    S.add(P3(L.e, L.n, major ? 9 : 6), { kind: 0, a: major ? LC.sodium : (h % 3 === 0 ? LC.led : LC.warm), I: major ? 0.26 : 0.1, cat: 2, day: 0.02 });
  }
  // distant suburbs beyond the mapped area
  const rr = makeRng(77);
  for (let i = 0; i < 1400; i++) {
    const a = rr() * Math.PI * 2, d = 11000 + Math.pow(rr(), 0.7) * 24000;
    const cl = rr() < 0.6 ? LC.sodium : LC.warm, x = Math.cos(a) * d, z = Math.sin(a) * d;
    for (let k = 0; k < 2 + Math.floor(rr() * 6); k++) S.add([x + (rr() - 0.5) * 400, 5, z + (rr() - 0.5) * 400], { kind: 0, a: cl, I: 0.12 + rr() * 0.12, cat: 2, day: 0.02 });
  }
  const mat = makeLightMaterial();
  const pts = S.build(mat);
  scene.add(pts);
  return { pts, mat, count: S.L.length };
}
