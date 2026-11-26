// ───────────────────────── Lights: directional point sprites ─────────────────────────
// kind: 0 steady · 1 two-way (colour depends on side) · 2 one-way toward the approach · 3 PAPI unit
//       4 sequenced flasher · 5 rotating beacon (white/green) · 6 blinking obstruction · 7 strobe
//       8 red beacon · 9 forward lamp (aircraft)
// category (aP.z): 0 airfield lighting · 1 always on · 2 night only · 3 aircraft
const LIGHT_KIND = { steady: 0, twoWay: 1, oneWay: 2, papi: 3, sfl: 4, beacon: 5, blink: 6, strobe: 7, redBeacon: 8, fwd: 9 };
// Airfield lighting (category 0) is on at night and by day when the visibility is 5 statute miles (8,047 m) or less:
// the FAA rule for approach lights by day (FAA JO 7110.65BB, para 3-4-5, https://www.faa.gov/air_traffic/publications/
// atpubs/atc_html/chap3_section_4.html). No Thai or ICAO day-time threshold was found in a public source, so the page
// uses the FAA one for all airfield lights; it turns them on for the same choices as before (5 km and below).
const LIGHTS_DAY_VIS_M = 5 * 1609.344;
// A sequenced flashing light is at full strength for the first 0.08 of its half-second cycle (40 ms) and out by 0.13
// (65 ms). A real discharge lamp flashes for a few milliseconds, but uTime moves once a frame, so a flash shorter than
// a frame is missed: with the 10 ms flash the page had, 6 of the 20 lights of 21R never lit at 30 frames a second.
// The 40 ms is our choice (ค่าประมาณ): longer than a frame at 30 frames a second, short enough to read as one flash.
const SFL_FLASH = [0.08, 0.13];

function makeLightMaterial() {
  return new THREE.ShaderMaterial({
    name: 'lights', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uDay: { value: 1 }, uPx: { value: 1000 }, uBeta: SU.uBeta, uHazeH: SU.uHazeH, uOnAF: { value: 0 }, uNightF: { value: 0 }, uOnAC: { value: 1 }, uLand: { value: 1 }, uGlow: { value: 0 } },
    vertexShader: /* glsl */`${HAZE_GLSL}
      attribute vec3 aColA; attribute vec3 aColB; attribute vec2 aAxis; attribute float aKind; attribute vec4 aP;
      uniform float uTime, uDay, uPx, uBeta, uOnAF, uNightF, uOnAC, uLand, uGlow;
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
        else if (kind == 4) { float ph = fract(uTime * 2.0 - aP.y); I *= smoothstep(0.05, 0.45, -s) * (1.0 - smoothstep(${SFL_FLASH[0].toFixed(3)}, ${SFL_FLASH[1].toFixed(3)}, ph)); }
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
        I *= exp(-hazeDepth(uBeta, cameraPosition.y, -toCam));   // the same MOR haze as the fog (30-render.js)
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

// Lateral places of the three lights of a touchdown zone barrette: 18 m between the innermost lights of a pair, the
// lights 1.5 m apart (Annex 14, 5.3.13). The red side rows of the CAT II approach lights use the same places (5.3.4).
const TDZ_T = [9, 10.5, 12];
// Runway edge lights stand this far outside the runway edge (Annex 14, 5.3.9: not more than 3 m; the 0.6 m is an
// estimate, ค่าประมาณ).
const EDGE_OUT = 0.6;
// Taxiway edge lights. AIP AD 2.15 (AIRAC 29 OCT 2026; research round 5, `5a-aip.md`: table B4 has edge lights on
// every taxiway, the JSON block of that section gives them as blue), and centre line lights on TWY D, E, F, J, O, R, S
// and C (south), which are not drawn: the lines of vtbd_af.json carry no names (research round 5 has them in
// tw_names.json, not yet taken into the data). The lights stand `step` metres apart (ค่าประมาณ; Annex 14, 5.3.18: not
// more than 60 m on a straight), the stations centred on each line so that a short connector has a pair in its
// middle and the layout does not depend on the direction a line was drawn in. They stand EDGE_OUT outside the edge
// of a taxiway TWY_W wide (5.3.18: not more than 3 m; AIP AD 2.8 gives 23 to 50 m, all are drawn 23 m), square to
// the run of the line over `chord` metres: the vector lines have jogs of a few metres, and the piece under a station
// points up to 50° off that run. No two lights are set closer than `gap`, whichever lines they belong to (our
// choice, ค่าประมาณ): in the corner where two taxiways meet each line sets a light, and two lights 3 to 7 m apart
// read as one doubled light (seven corners of the real taxiways). The gap must stay small: with 15 m a light on the
// edge of one taxiway took the place of the light of another, 9 to 11 m away across a junction, and three straight
// edges were dark over 62 to 67 m.
const TWY_EDGE = { step: 45, chord: 25, gap: 7.5 };
// An edge light marks the edge of the pavement and never stands on it: none where the place is on a taxiway or
// taxilane ribbon (where taxiways join or cross) or on an apron. An apron counts APRON_EDGE wider than its outline
// (our choice, ค่าประมาณ: the outline runs within a metre of the edge of the taxiways beside it, so a row along it
// would be lit and dark by centimetres), and the side of a taxiway that runs along an apron is dark.
const APRON_EDGE = 3;
function taxiPavement(af) {
  const box = (P, m) => [Math.min(...P.map((p) => p[0])) - m, Math.min(...P.map((p) => p[1])) - m, Math.max(...P.map((p) => p[0])) + m, Math.max(...P.map((p) => p[1])) + m];
  return {
    lines: af.tw.filter((t) => t.p.length > 1).map((t) => ({ p: t.p, box: box(t.p, TWY_W / 2) })),
    aprons: (af.apron || []).map((a) => ({ o: a.o, holes: a.h || [], rings: [a.o, ...(a.h || [])].map((r) => [...r, r[0]]), box: box(a.o, APRON_EDGE) })),
  };
}
function onTaxiPavement(pave, e, n) {
  const x = [e, n], inBox = (b) => e >= b[0] && e <= b[2] && n >= b[1] && n <= b[3];
  return pave.lines.some((l) => inBox(l.box) && nearestOnLine(l.p, x).d < TWY_W / 2)
    || pave.aprons.some((a) => inBox(a.box) && ((pointInPoly(x, a.o) && !a.holes.some((h) => pointInPoly(x, h))) || a.rings.some((r) => nearestOnLine(r, x).d < APRON_EDGE)));
}
// The places [e, n] of the taxiway edge lights of the airfield vectors `af`.
function taxiEdgeLights(af) {
  const pave = taxiPavement(af), out = [], off = TWY_W / 2 + EDGE_OUT;
  for (const t of af.tw) {
    if (t.p.length < 2) continue;
    // n + 1 stations `step` apart, centred on the line (pointAlong keeps them on it). The 1e-9 is for a length that
    // is a whole number of steps but for the rounding of its sum, which depends on the direction the line is walked in
    const len = lineLength(t.p), n = Math.floor(len / TWY_EDGE.step + 1e-9), s0 = (len - n * TWY_EDGE.step) / 2;
    for (let k = 0; k <= n; k++) {
      const s = s0 + k * TWY_EDGE.step, p = pointAlong(t.p, s);
      if (onAnyRunway(p[0], p[1], 40)) continue;
      const a = pointAlong(t.p, s - TWY_EDGE.chord / 2), b = pointAlong(t.p, s + TWY_EDGE.chord / 2), l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (l < 1e-6) continue;
      for (const sd of [-1, 1]) {
        let x = [p[0] + (b[1] - a[1]) / l * sd * off, p[1] - (b[0] - a[0]) / l * sd * off];
        // on the inside of a bend the line is nearer than that: out to the edge, straight away from its nearest point
        const q = nearestOnLine(t.p, x);
        if (q.d < off && q.d > 1e-6) x = [q.p[0] + (x[0] - q.p[0]) * off / q.d, q.p[1] + (x[1] - q.p[1]) * off / q.d];
        if (!onTaxiPavement(pave, x[0], x[1]) && !out.some((o) => Math.hypot(o[0] - x[0], o[1] - x[1]) < TWY_EDGE.gap)) out.push(x);
      }
    }
  }
  return out;
}

// The groups of approach lights that stand together s metres from the threshold of a system, as [centre, half-width]
// across the approach: the 30 m crossbar at 300 m; on CAT II the 150 m crossbar (one row from side row to side row)
// and, over the first 270 m, the centre line barrette with a red barrette each side; else the centre line barrette.
// The stands (alsStands) have one cross-arm per group.
const alsArms = (als, s) => {
  const bar = [0, als === 'SALS420' ? 1.5 : 2], side = (TDZ_T[2] - TDZ_T[0]) / 2;
  if (s === 300) return [[0, 15]];
  if (als !== 'CAT2' || s > 270) return [bar];
  return s === 150 ? [[0, TDZ_T[2]]] : [bar, [-TDZ_T[1], side], [TDZ_T[1], side]];
};
// Height of the stand under the approach lights s metres before the threshold of end E, or 0 where the lights are
// inset in pavement: before a displaced threshold, and over the pad that the runway mesh draws beyond each paved end
// (RWY_PAD). Annex 14, 5.3.4 wants the lights as near as practicable to the horizontal plane through the threshold;
// stands of 0.9 m that rise 1.2 % outward from the end of the pad are an estimate (ค่าประมาณ), there is no published
// figure. The stands are aids that have to be in the strip and the clearway (Annex 14, 9.9: frangible and as low as
// possible), so the surfaces of 17-siting.js are not applied to them.
const alsStandH = (E, s) => (s <= E.disp + RWY_PAD ? 0 : 0.9 + (s - E.disp - RWY_PAD) * 0.012);
// Height of the lights: 0.25 m where they are inset, 0.12 m above the cross-arm of their stand.
const alsLightY = (E, s) => (alsStandH(E, s) ? alsStandH(E, s) + 0.12 : 0.25);
// The stands of the approach lights of end E, drawn by 50-airfield.js: at each station beyond the pavement the height
// and, per group of lights, a cross-arm (centre `tc`, half-width `half`) with the places of its poles across the
// approach: one, or three under a crossbar.
function alsStands(E) {
  const out = [];
  for (let s = ALS[E.als].step; s <= ALS[E.als].len; s += ALS[E.als].step) {
    const hgt = alsStandH(E, s);
    if (hgt) out.push({ s, hgt, arms: alsArms(E.als, s).map(([tc, half]) => ({ tc, half, poles: half > 4 ? [tc - half * 0.7, tc, tc + half * 0.7] : [tc] })) });
  }
  return out;
}

// Every light on and around the airfield, as a LightSet (positions and colours only, nothing drawn here).
// Layout: AIP Thailand AD 2.14 (which systems, their lengths, spacings and colours) and ICAO Annex 14 Vol I, 5.3
// (how each system is laid out). Where neither gives a number the choice is an estimate and says so.
function airfieldLights(field, data) {
  const S = new LightSet();
  const P3 = (e, n, y) => [e, y, -n];
  // ── runways: edge, threshold/end, centre line (03L/21R), touchdown zone (21R) ──
  for (const R of RUNWAYS) {
    const ax = [R.u[1], -R.u[0]];                       // render xz of the low→high direction
    const at = (s, t, y) => { const [e, n] = rwyEN(R, s, t); return P3(e, n, y); };
    const [A, Bk] = R.ends, EA = RWY_END[A], EB = RWY_END[Bk];
    const sA = R.sThr[0], sB = R.sThr[1], W2 = R.w / 2;
    // colour seen by a pilot landing toward +s (end A) and toward −s (end B): red before a displaced threshold,
    // yellow over the last 600 m (AIP AD 2.14)
    const edgeCol = (s) => {
      const a = s < sA ? LC.red : (R.len - s < 600 ? LC.yellow : LC.white);
      const b = s > sB ? LC.red : (s < 600 ? LC.yellow : LC.white);
      return [a, b];
    };
    for (let s = 0; s <= R.len + 0.1; s += 60) for (const t of [-(W2 + EDGE_OUT), W2 + EDGE_OUT]) {
      const [a, b] = edgeCol(s);
      S.add(at(s, t, 0.35), { kind: 1, a, b, axis: ax, I: 0.32, day: 0.6 });
    }
    // Each end: threshold lights 3 m apart, green toward the approach, and runway end lights, red toward the runway
    // (Annex 14, 5.3.10 and 5.3.11). `land` is the landing direction at this end: a one-way light with that axis
    // shows to the pilot on the approach. Where the threshold is not displaced one row does both jobs; where it is,
    // the green row sits at the threshold with a wing bar each side and the red row at the paved end.
    for (const [E, out] of [[EA, -1], [EB, 1]]) {
      const sT = out < 0 ? sA : sB, sEnd = out < 0 ? 0 : R.len, land = out < 0 ? ax : [-ax[0], -ax[1]], back = [-land[0], -land[1]];
      for (let t = -W2 + 1.5; t <= W2 - 1.4; t += 3) {
        if (!E.disp) { S.add(at(sT + out, t, 0.3), { kind: 1, a: out < 0 ? LC.green : LC.red, b: out < 0 ? LC.red : LC.green, axis: ax, I: 0.38, day: 0.6 }); continue; }
        S.add(at(sT + out, t, 0.3), { kind: 2, a: LC.green, axis: land, I: 0.38, day: 0.6 });
        S.add(at(sEnd - out * 0.5, t, 0.3), { kind: 2, a: LC.red, axis: back, I: 0.38, day: 0.6 });
      }
      // wing bar: five lights reaching 10 m out from the line of the edge lights, the first one in that line (Annex
      // 14, 5.3.10). That THR 21L has wing bars is an estimate: the AIP extract of research round 5 does not say.
      if (E.disp) for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) S.add(at(sT + out, sd * (W2 + EDGE_OUT + k * 2.5), 0.3), { kind: 2, a: LC.green, axis: land, I: 0.38, day: 0.6 });
    }
    if (R.cl) {
      const cc = (d, k) => (d > R.len - 300 ? LC.red : d > R.len - 900 ? (k % 2 ? LC.red : LC.white) : LC.white);
      for (let s = 15, k = 0; s < R.len; s += 30, k++) S.add(at(s, 0.6, 0.12), { kind: 1, a: cc(s, k), b: cc(R.len - s, k), axis: ax, I: 0.22, day: 0.3 });
    }
    // touchdown zone lights over the first 900 m (AIP AD 2.14); a pair of barrettes every 60 m is an estimate
    // (ค่าประมาณ): Annex 14, 5.3.13 allows 30 or 60 m and the AIP gives only the length
    for (const E of [EA, EB]) if (E.tdz) {
      const dir = E === EA ? 1 : -1, s0 = E === EA ? sA : sB, axE = dir > 0 ? ax : [-ax[0], -ax[1]];
      for (let d = 60; d <= 900; d += 60) for (const sd of [-1, 1]) for (const t of TDZ_T) S.add(at(s0 + dir * d, sd * t, 0.12), { kind: 2, a: LC.white, axis: axE, I: 0.2, day: 0.3 });
    }
  }
  // ── approach lighting: the system of each end from AIP AD 2.14, laid out as in Annex 14, 5.3.4 ──
  //   simple (03L 420 m, 03R 300 m with five barrettes): a barrette at least 3 m long every 30 or 60 m and a 30 m
  //     crossbar 300 m from the threshold
  //   CAT I (21L) and CAT II (21R), 900 m: a 4 m barrette every 30 m and a crossbar reaching 15 m each side at 300 m;
  //     CAT II adds red side rows over the first 270 m, in line with the touchdown zone lights, and a crossbar at
  //     150 m that fills the gaps between them and the centre line (four lights 1.4 m apart each side: an estimate,
  //     ค่าประมาณ; Annex 14 asks only for gaps of not more than 2.7 m)
  //   flashing lights (AIP: FLG) run twice a second from the outermost barrette inward: on every CAT I barrette that
  //     is on a stand (not inset in pavement) and on the CAT II barrettes beyond 300 m. Each flashes 15 ms after the
  //     one before it (0.03 of the cycle, an estimate, ค่าประมาณ: the run of 20 lights takes 0.3 s of the half second)
  //   the number of lights in a barrette (five over 4 m, three over 3 m on 03L) and the 1.5 m between the lights of
  //     the 300 m crossbar are estimates (ค่าประมาณ): the AIP does not give them
  //   21L: the AIP gives a 900 m CAT I system and a threshold displaced 350 m, and does not say where the 900 m
  //     start. They are measured from the threshold here, so the first 350 m (and the pad) are lights inset in the
  //     runway before the threshold: an estimate (ค่าประมาณ)
  for (const E of Object.values(RWY_END)) {
    const ax = [E.u[1], -E.u[0]];
    const at = (s, t, y) => P3(E.thr[1] + E.u[1] * s + E.r[1] * t, E.thr[0] + E.u[0] * s + E.r[0] * t, y);
    const { len, step: stepS } = ALS[E.als], cat2 = E.als === 'CAT2', cat1 = E.als === 'CAT1';
    const bar = E.als === 'SALS420' ? [-1.5, 0, 1.5] : [-2, -1, 0, 1, 2];
    const white = (s, t, y) => S.add(at(-s, t, y), { kind: 2, a: LC.white, axis: ax, I: 0.42, day: 1.6 });
    for (let s = stepS; s <= len; s += stepS) {
      const y = alsLightY(E, s);                                 // inset over pavement, on stands beyond it
      for (const t of bar) white(s, t, y);
      if (s === 300) for (let t = 4.5; t <= 15.01; t += 1.5) for (const sg of [-1, 1]) white(s, sg * t, y);
      if (cat2 && s === 150) for (const t of [3.4, 4.8, 6.2, 7.6]) for (const sg of [-1, 1]) white(s, sg * t, y);
      if (cat2 && s <= 270) for (const sg of [-1, 1]) for (const t of TDZ_T) S.add(at(-s, sg * t, y), { kind: 2, a: LC.red, axis: ax, I: 0.36, day: 1.4 });
      if ((cat2 && s > 300) || (cat1 && alsStandH(E, s) > 0)) S.add(at(-s - 0.3, 0, y + 0.35), { kind: 4, a: [1, 1, 1], axis: ax, I: 4.0, param: (len - s) / 30 * 0.03, day: 1.2 });
    }
  }
  // ── PAPI (always on, high daytime intensity) ──
  for (const pp of field.papiPos) S.add(P3(pp.e - pp.u[0] * 0.55, pp.n - pp.u[1] * 0.55, 0.64), { kind: 3, axis: [pp.u[0], -pp.u[1]], I: 0.5, param: pp.ang, cat: 1, day: 8 });
  // ── taxiway edge lights (blue) ──
  for (const [e, n] of taxiEdgeLights(data.af)) S.add(P3(e, n, 0.3), { kind: 0, a: LC.blue, I: 0.13, day: 0.4 });
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
  return S;
}

function buildAirfieldLights(scene, field, city, data) {
  const S = airfieldLights(field, data);
  const mat = makeLightMaterial();
  const pts = S.build(mat);
  scene.add(pts);
  return { pts, mat, count: S.L.length };
}
