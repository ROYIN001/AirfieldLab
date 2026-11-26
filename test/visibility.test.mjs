// Visibility as MOR (owner's research round 4, docs/research/04-weather.md §6.8 and §10.4, test cases VIS-1 to VIS-3).
// The maths lives in src/10-atmo.js (pure); the shaders repeat it (HAZE_GLSL in 30-render.js), so the last tests check
// that the sky, the fog chunk, the lights, the sunlight and the app still use it, in code that is not commented out.
// Run: node --test test/visibility.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
// without comments (JS and GLSL): block comments other than the /* glsl */ tags, and // to the end of the line after a
// space or at its start (so 'https://' stays)
const strip = (t) => t.replace(/\/\*(?! glsl \*\/)[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const live = (f) => strip(read(f));
const A = new Function('"use strict";\n' + read('10-atmo.js') + '\nreturn { LN20, LN50, morBeta, hazeDepth, hazeDepthUp, skyHazeBeta, SKY_VIS_M, sunHazeT, skyIrradianceUp, skyFull, sunColor, lum };')();
const H = 1600;                                     // SU.uHazeH in 30-render.js
// 40-sky.js on top of 10-atmo.js, with three.js and the shared uniforms stubbed: the sky materials' shader text and
// SkySystem's methods run as written
const vec = () => ({ x: 0, y: 0, z: 0, set(a, b, c) { this.x = a; this.y = b; this.z = c; return this; } });
const SU = { uHazeH: { value: H }, uFogHz: { value: Array.from({ length: 16 }, vec) } };
const THREE = { BackSide: 1, ShaderMaterial: class { constructor(o) { Object.assign(this, o); } }, Vector3: class { set() {} }, Vector2: class { set() {} } };
const S = new Function('THREE', 'SU', 'GLSL_PRELUDE', '"use strict";\n' + read('10-atmo.js') + read('40-sky.js') + '\nreturn { makeSkyMaterial, SkySystem, G_ALB, hzFogAt };')(THREE, SU, '');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);
const T = (V, s) => Math.exp(-A.hazeDepth(A.morBeta(V), 0, [s, 0, 0], H));      // along the ground
const oldT = (V, s) => Math.exp(-(((1.98 / V) * s) ** 2));                          // FogExp2, density 1.98 / V
const exp2T = (V, s) => Math.exp(-(((Math.sqrt(A.LN20) / V) * s) ** 2));         // exp² scaled to 5% at V

test('VIS-1: constants', () => {
  near(A.LN20, 2.995732, 1e-6, 'ln20');
  near(A.LN50, 3.912023, 1e-6, 'ln50');
  near(Math.sqrt(A.LN20), 1.730818, 1e-6, '√ln20');
});

test('VIS-2: the old density 1.98 / V left 2% at the reported visibility; MOR leaves 5%', () => {
  near(oldT(5000, 5000), 0.0198, 1e-4, 'old, at V');
  for (const V of [500, 1500, 3000, 5000, 20000]) near(T(V, V), 0.05, 1e-12, `MOR at V = ${V} m`);
  assert.doesNotMatch(read('40-sky.js'), /1\.98\s*\//, 'the sky no longer sets 1.98 / V');
});

test('VIS-3: V = 5 km at 1 km and 2.5 km', () => {
  near(T(5000, 1000), 0.5493, 1e-4, 'Beer–Lambert 1 km'); near(T(5000, 2500), 0.2236, 1e-4, 'Beer–Lambert 2.5 km');
  near(exp2T(5000, 1000), 0.8871, 1e-4, 'exp² 1 km'); near(exp2T(5000, 2500), 0.4729, 1e-4, 'exp² 2.5 km');
  near(oldT(5000, 1000), 0.8549, 1e-4, 'old 1 km'); near(oldT(5000, 2500), 0.3753, 1e-4, 'old 2.5 km');
});

test('hazeDepth integrates exp(−h / H) along the path exactly', () => {
  const simpson = (beta, h0, v) => {
    const N = 2000, len = Math.hypot(...v); let s = 0;
    for (let i = 0; i <= N; i++) {
      const w = i === 0 || i === N ? 1 : i % 2 ? 4 : 2;
      s += w * Math.exp(-Math.max(h0 + (v[1] * i) / N, 0) / H);
    }
    return (beta * len * s) / (3 * N);
  };
  const b = A.morBeta(1500);
  for (const [h0, v] of [[0, [3000, 0, 0]], [300, [5700, -300, 0]], [60, [0, -60, 1150]], [0, [0, 2000, 0]], [1500, [400, 900, -300]]]) {
    const d = A.hazeDepth(b, h0, v, H);
    near(d, simpson(b, h0, v), 1e-9 * Math.max(1, d), `h0 ${h0}, v ${v}`);
  }
  // both branches meet at |k| = 1e-3, and a camera below the ground counts as on it
  const k = 1e-3 * H, len = Math.hypot(1000, k);
  near(A.hazeDepth(1, 0, [1000, k * (1 - 1e-9), 0], H) / len, A.hazeDepth(1, 0, [1000, k * (1 + 1e-9), 0], H) / len, 1e-9, 'branches');
  assert.equal(A.hazeDepth(b, -5, [1000, 0, 0], H), A.hazeDepth(b, 0, [1000, 0, 0], H));
});

test('hazeDepthUp is hazeDepth on an endless path', () => {
  const b = A.morBeta(3000);
  for (const [h0, el] of [[0, 14], [0, 60], [300, 5], [1500, 30]]) {
    const dy = Math.sin(el * Math.PI / 180), L = 1e7;
    near(A.hazeDepth(b, h0, [L * Math.cos(el * Math.PI / 180), L * dy, 0], H), A.hazeDepthUp(b, h0, dy, H), 1e-9, `h0 ${h0}, ${el}°`);
  }
  // held at 0.02 near the horizon and below it, and only there (the GLSL twin holds it at 0.02 too)
  for (const dy of [-0.5, 0, 0.001, 0.02]) near(A.hazeDepthUp(b, 0, dy, H), (b * H) / 0.02, 1e-12, `dy ${dy}`);
  assert.equal(A.hazeDepthUp(b, -5, 0.3, H), A.hazeDepthUp(b, 0, 0.3, H), 'a camera below the ground counts as on it');
  near(A.hazeDepthUp(b, 0, 0.03, H), (b * H) / 0.03, 1e-12, 'dy 0.03');
});

test('only haze beyond the 20 km day greys the sky dome and the clouds', () => {
  assert.equal(A.SKY_VIS_M, 20000);
  assert.equal(A.skyHazeBeta(20000), 0); assert.equal(A.skyHazeBeta(40000), 0);
  near(A.skyHazeBeta(500), A.LN20 / 500 - A.LN20 / 20000, 1e-15, '500 m');
  assert.ok(A.skyHazeBeta(500) > A.skyHazeBeta(5000) && A.skyHazeBeta(5000) > A.skyHazeBeta(10000) && A.skyHazeBeta(10000) > 0);
});

test('sunlight through the haze: sunHazeT', () => {
  const y14 = Math.sin(14 * Math.PI / 180);                       // 16:40 in November
  for (const V of [20000, 40000]) assert.equal(A.sunHazeT(V, y14, H), 1, `${V} m`);
  // ground to sun: (ln20 / V − ln20 / 20 km) · H / sin(elevation)
  for (const [V, y] of [[5000, 0.24], [5000, y14], [1500, 0.8], [3000, 0.05]]) {
    near(A.sunHazeT(V, y, H), Math.exp(-(Math.log(20) / V - Math.log(20) / 20000) * 1600 / y), 1e-12, `${V} m, sin el ${y}`);
  }
  near(A.sunHazeT(5000, 0.24, H), 0.0500, 1e-4, '5 km, sun at 14°');
  assert.ok(A.sunHazeT(500, y14, H) < 1e-12, 'gone in 500 m fog');
  assert.equal(A.sunHazeT(5000, -0.021, H), 0); assert.equal(A.sunHazeT(20000, -0.03, H), 0);
});

test('sky irradiance through the haze: clear sky at 20 km, the fog colour in thick fog', () => {
  const sun = [0.3, 0.83, -0.47];
  const clear = A.skyIrradianceUp(sun);
  assert.deepEqual(A.skyIrradianceUp(sun, 0, H, null), clear, 'no haze, no fog colour needed');
  const c = [0.7, 0.75, 0.8], fogC = () => c;
  // in thick fog every direction shows the fog colour: irradiance π·c (24×8 midpoint samples: +0.65%)
  const thick = A.skyIrradianceUp(sun, A.skyHazeBeta(200), H, fogC);
  for (let k = 0; k < 3; k++) near(thick[k] / (Math.PI * c[k]), 1.0065, 1e-3, `channel ${k}`);
  // each direction keeps exp(−hazeDepthUp) of the clear sky and takes the rest from the fog colour, so the difference
  // made by a brighter fog colour is the fog's cosine-weighted share of the sky: 0 at 20 km, growing to π in fog
  const share = (V) => {
    const a = A.skyIrradianceUp(sun, A.skyHazeBeta(V), H, () => [0, 0, 0]), b = A.skyIrradianceUp(sun, A.skyHazeBeta(V), H, () => [1, 1, 1]);
    near(b[0] - a[0], b[2] - a[2], 1e-12, `${V} m, one share for every channel`);
    return b[1] - a[1];
  };
  const expect = (V) => {                                  // the same 8 elevations, written out: 2π Σ sin·cos·Δel·(1 − T)
    let t = 0;
    for (let j = 0; j < 8; j++) {
      const el = ((j + 0.5) / 8) * (Math.PI / 2);
      t += 2 * Math.PI * Math.sin(el) * Math.cos(el) * (Math.PI / 16) * (1 - Math.exp(-(A.skyHazeBeta(V) * 1600) / Math.max(Math.sin(el), 0.02)));
    }
    return t;
  };
  const Vs = [200, 500, 1500, 5000, 10000, 20000];
  const sh = Vs.map(share);
  for (let i = 0; i < Vs.length; i++) near(sh[i], expect(Vs[i]), 1e-9, `${Vs[i]} m`);
  for (let i = 1; i < sh.length; i++) assert.ok(sh[i] < sh[i - 1], sh.map((x) => x.toFixed(3)).join(' '));
  assert.equal(sh[sh.length - 1], 0);
  near(sh[0], Math.PI * 1.0065, 0.01, 'thick fog');
  // against a fine integral (64×96, its own azimuth parametrisation; the fog colour read at atan2(d.x, −d.z) as
  // hzFogColor does) of the clear sky through exp(−β·H / sin el) plus the fog colour behind it
  const fogAz = (az) => [0.6 + 0.3 * Math.sin(az), 0.6 + 0.3 * Math.cos(az), 0.6];
  const ref = (V) => {
    const tz = A.skyHazeBeta(V) * 1600, out = [0, 0, 0], NE = 64, NA = 96;
    for (let j = 0; j < NE; j++) {
      const el = ((j + 0.5) / NE) * (Math.PI / 2), t = Math.exp(-tz / Math.max(Math.sin(el), 0.02));
      for (let i = 0; i < NA; i++) {
        const ph = ((i + 0.5) / NA) * 2 * Math.PI, d = [Math.cos(el) * Math.cos(ph), Math.sin(el), Math.cos(el) * Math.sin(ph)];
        const L = A.skyFull(d, sun), F = fogAz((Math.atan2(d[0], -d[2]) + 2 * Math.PI) % (2 * Math.PI));
        const w = Math.sin(el) * Math.cos(el) * (Math.PI / 2 / NE) * ((2 * Math.PI) / NA);
        for (let k = 0; k < 3; k++) out[k] += w * (t * L[k] + (1 - t) * F[k]);
      }
    }
    return out;
  };
  for (const V of [1500, 5000, 10000, 20000]) {
    const got = A.skyIrradianceUp(sun, A.skyHazeBeta(V), H, fogAz), want = ref(V);
    for (let k = 0; k < 3; k++) near(got[k] / want[k], 1, 0.03, `${V} m, channel ${k}`);
  }
});

// SkySystem.applySunHaze run as written, on a stub sky: the sun's direction and colour, the visibility and the fog
// palette the page would have (updateFogPalette)
function applyHaze(V, sunDir, sunMax = 9.5) {
  const self = { state: { sunDir, sunCol: A.sunColor(sunDir[1]), ambUp: A.skyIrradianceUp(sunDir), night: 0 }, visibility: V,
    sunMax, sun: {}, capMat: { uniforms: { uGround: { value: vec() } } }, mat: { uniforms: { uCityDir: { value: vec() } } } };
  S.SkySystem.prototype.updateFogPalette.call(self);
  S.SkySystem.prototype.applySunHaze.call(self);
  const g = self.capMat.uniforms.uGround.value;
  return { I: self.sun.intensity, g: [g.x, g.y, g.z], st: self.state };
}

test('applySunHaze: the direct sun and the ground of the image-based light', () => {
  const noon = [0.25, Math.sin(55.7 * Math.PI / 180), -0.5], low = [0.95, 0.24, -0.2];
  assert.deepEqual(S.G_ALB, [0.09, 0.11, 0.06], 'the ground albedo of the image-based light, as before plan B9');
  for (const V of [20000, 40000]) {
    const r = applyHaze(V, noon), sc = r.st.sunCol, amb = r.st.ambUp;
    assert.equal(r.I, 9.5, `${V} m: full sun`);
    // the clear-sky ground, as before plan B9
    assert.deepEqual(r.g, [0, 1, 2].map((k) => (S.G_ALB[k] * (sc[k] * noon[1] + amb[k])) / Math.PI), `${V} m ground`);
  }
  near(applyHaze(5000, low).I / 9.5, 0.0500, 1e-4, '5 km, sun at 14°');
  assert.equal(applyHaze(5000, [0.99, -0.03, 0.1]).I, 0, 'sun below the horizon');
  assert.equal(applyHaze(20000, noon, null).I, 0, 'before the first setSunDir');
  // 500 m at noon: no direct sun; the ground is lit by the fog all round (π · the palette's mean), not by the sun
  const fog = applyHaze(500, noon), clear = applyHaze(20000, noon);
  assert.ok(fog.I / 9.5 < 2e-5, `${fog.I}`);                     // T = 1.2e-5
  const mean = [0, 1, 2].map((k) => SU.uFogHz.value.reduce((a, v) => a + [v.x, v.y, v.z][k], 0) / 16);
  for (let k = 0; k < 3; k++) near(fog.g[k] / (S.G_ALB[k] * mean[k]), 1.0065, 0.01, `500 m ground, channel ${k}`);
  assert.ok(A.lum(fog.g) < 0.5 * A.lum(clear.g), `${A.lum(fog.g)} vs ${A.lum(clear.g)}`);
  // 3 km: between the two
  const mid = applyHaze(3000, noon);
  assert.ok(A.lum(mid.g) < A.lum(clear.g) && A.lum(mid.g) > A.lum(fog.g));
  // and exactly: the sun through (ln20 / 3 km − ln20 / 20 km) · 1,600 m / sin 55.7°, the sky through the same haze
  const T3 = Math.exp(-(Math.log(20) / 3000 - Math.log(20) / 20000) * 1600 / noon[1]);
  near(mid.I / 9.5, T3, 1e-12, '3 km sun');
  const sky3 = A.skyIrradianceUp(noon, Math.log(20) / 3000 - Math.log(20) / 20000, 1600, S.hzFogAt);
  const want = [0, 1, 2].map((k) => (S.G_ALB[k] * (mid.st.sunCol[k] * noon[1] * T3 + sky3[k])) / Math.PI);
  for (let k = 0; k < 3; k++) near(mid.g[k], want[k], 1e-12, `3 km ground, channel ${k}`);
  // hzFogAt reads the palette as hzFogColor does: entry i at i · 22.5°, linear in between, round the circle
  const P = SU.uFogHz.value;
  assert.deepEqual(S.hzFogAt(0), [P[0].x, P[0].y, P[0].z]);
  assert.deepEqual(S.hzFogAt(2 * Math.PI * 3 / 16), [P[3].x, P[3].y, P[3].z]);
  const half = S.hzFogAt(2 * Math.PI * 15.5 / 16);
  near(half[1], (P[15].y + P[0].y) / 2, 1e-12, 'between the last entry and the first');
  near(S.hzFogAt(-Math.PI / 8)[2], P[15].z, 1e-12, 'negative azimuth');
});

test('MOR on screen: the haze is mixed in display-linear light, before the sRGB encode', () => {
  // The shader block below mixes a tone-mapped fog colour into gl_FragColor before colorspace_fragment encodes it.
  // The arithmetic for a black object at V, with the sRGB transfer functions (IEC 61966-2-1): mixed before the encode
  // it keeps exactly the 5% contrast MOR defines; mixed after it (three.js's fog_fragment) it would keep about 10%.
  const enc = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  const dec = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const T5 = Math.exp(-A.hazeDepth(A.morBeta(1500), 0, [1500, 0, 0], H));  // at the reported visibility
  near(T5, 0.05, 1e-12, 'MOR');
  for (const F of [0.1, 0.3, 0.6, 0.9]) {                   // haze, display-linear (after tone mapping)
    near(1 - dec(enc((1 - T5) * F)) / F, T5, 1e-9, `contrast at V, haze ${F}`);
    assert.ok(1 - dec((1 - T5) * enc(F)) / F > 0.09, 'after the encode');
  }
  const render = live('30-render.js');
  const cs = render.match(/C\.colorspace_fragment = `([\s\S]*?)` \+ C\.colorspace_fragment;/);
  assert.ok(cs, 'the haze is put in front of colorspace_fragment');
  assert.equal(cs[1].replace(/\s+/g, ' ').trim(), ['#if defined( USE_FOG ) && defined( USE_HZFOG ) && defined( FOG_EXP2 ) {',
    'vec3 fogC = hzFogColor( normalize( vFogW ) );', '#ifdef TONE_MAPPING fogC = toneMapping( fogC ); #endif',
    'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, 1.0 - exp( - hazeDepth( fogDensity, cameraPosition.y, vFogW ) ) ); } #endif'].join(' '));
  // every enhanced material has the haze on
  assert.match(render, /mat\.defines = Object\.assign\(\{\}, mat\.defines, \{ USE_HZFOG: '' \}, cloud \? \{ USE_CLOUDSHADOW: '' \} : \{\}\);/);
  // the fog chunk (after the encode) leaves hazed materials alone
  const fog = render.match(/C\.fog_fragment = `([\s\S]*?)`;/)[1];
  assert.equal(fog.split('\n')[0], '#if defined( USE_FOG ) && !( defined( USE_HZFOG ) && defined( FOG_EXP2 ) )');
  assert.doesNotMatch(fog, /hazeDepth|hzFogColor/);
});

test('the sky, the fog chunk, the lights and the sunlight use the MOR haze', () => {
  const sky = live('40-sky.js'), render = live('30-render.js'), lights = live('60-lights.js');
  const src = fs.readdirSync(new URL('../src/', import.meta.url));
  const count = (re) => src.flatMap((f) => live(f).match(re) || []).length;
  // setWeather: the visibility first, then the fog density (one place in the page), the sky's share and the sunlight
  const sw = sky.match(/\n  setWeather\([^\n]*\n([\s\S]*?)\n  \}\n/);
  assert.ok(sw, 'setWeather');
  const swl = sw[1].split('\n').map((l) => l.trim()).filter(Boolean);
  assert.equal(swl[0], 'this.cloudCover = cloud; this.visibility = visibility;');
  for (const l of ['SU.uBeta.value = this.scene.fog.density = morBeta(visibility);', 'SU.uBetaSky.value = skyHazeBeta(visibility);', 'this.applySunHaze();']) {
    assert.ok(swl.includes(l), l);
  }
  assert.equal(count(/fog\.density\s*=/g), 1, 'fog.density assignments');
  // setSunDir: sunMax, then the fog palette, then the sunlight and the ground (they read both)
  const sd = sky.match(/\n  setSunDir\(sun\) \{\n([\s\S]*?)\n  \}\n/)[1].split('\n').map((l) => l.trim()).filter(Boolean);
  const at = (l) => { const i = sd.indexOf(l); assert.ok(i >= 0, l); return i; };
  assert.ok(at('this.sunMax = m;') < at('this.updateFogPalette();') && at('this.updateFogPalette();') < at('this.applySunHaze();'));
  assert.equal((sky.match(/this\.applySunHaze\(\);/g) || []).length, 2, 'setSunDir and setWeather');
  assert.equal(count(/sun\.intensity\s*=/g), 1, 'sun.intensity assignments');
  assert.equal(count(/uGround\.value\.set\(/g), 1, 'uGround is set in applySunHaze only');
  // the clouds, and the sky dome: on screen above and below the horizon line, in the capture only above it
  assert.match(sky, /hazeDepth\(uBetaSky, cameraPosition\.y, v\)/, 'clouds');
  const dome = (capture) => strip(S.makeSkyMaterial(capture).fragmentShader).replace(/\s+/g, ' ');
  const haze = 'col = mix(hzFogColor(d), col, exp(-hazeDepthUp(uBetaSky, cameraPosition.y, d.y)));';
  const scr = dome(false), cap = dome(true);
  assert.equal(scr.split(haze).length, 2, 'once on screen');
  assert.doesNotMatch(scr, /if \(d\.y > 0\.0\) col = mix\(hzFogColor/);
  for (const before of ['col += uSunCol *', 'col += uNight *']) assert.ok(scr.indexOf(before) >= 0 && scr.indexOf(before) < scr.indexOf(haze), before);
  assert.ok(scr.indexOf(haze) < scr.indexOf('gl_FragColor = vec4(col, 1.0);'));
  assert.equal(cap.split('if (d.y > 0.0) ' + haze).length, 2, 'the capture keeps its ground');
  assert.ok(cap.includes('else col = mix(hzFogColor(d), uGround, smoothstep(0.0, -0.2, d.y));'), 'the capture\'s ground is uGround');
  // the GLSL twins of hazeDepth() and hazeDepthUp()
  const glsl = render.match(/const HAZE_GLSL = \/\* glsl \*\/`([\s\S]*?)`;/)[1].replace(/\s+/g, ' ');
  for (const t of ['float k = v.y / uHazeH;', 'float m = abs(k) < 1e-3 ? 1.0 - k / 2.0 + k * k / 6.0 : (1.0 - exp(-k)) / k;',
    'return beta * length(v) * exp(-max(h0, 0.0) / uHazeH) * m;',
    'float hazeDepthUp(float beta, float h0, float dy) { return beta * uHazeH * exp(-max(h0, 0.0) / uHazeH) / max(dy, 0.02); }']) assert.ok(glsl.includes(t), t);
  assert.match(render, /\$\{HAZE_GLSL\}/, 'the prelude holds it');
  // the distance: vFogW (camera to fragment, world axes) for hazed materials, vFogDepth radial for three.js's own fog
  assert.match(render, /C\.fog_vertex \+= '\\n#ifdef USE_HZFOG\\nvFogW = \( vec4\( mvPosition\.xyz, 0\.0 \) \* viewMatrix \)\.xyz;\\n#endif';/);
  assert.match(render, /C\.fog_vertex = C\.fog_vertex\.replace\(depth, 'vFogDepth = length\( mvPosition\.xyz \);'\);/);
  assert.match(render, /float fogFactor = 1\.0 - exp\( - fogDensity \* vFogDepth \);/);
  assert.doesNotMatch(render, /fogDensity \* fogDensity/);
  // lights fade through the same haze
  assert.match(lights, /vertexShader: \/\* glsl \*\/`\$\{HAZE_GLSL\}/);
  assert.match(lights, /uBeta: SU\.uBeta, uHazeH: SU\.uHazeH/);
  assert.match(lights, /I \*= exp\(-hazeDepth\(uBeta, cameraPosition\.y, -toCam\)\);/);
  for (const f of src) assert.doesNotMatch(read(f), /\buVis\b/, f);
});

test('visibility choices: 500 m to 40 km, default 20 km, lights by value not by slider position', () => {
  const app = live('90-app.js'), html = read('template.html'), lights = live('60-lights.js');
  const m = app.match(/const VIS = (\[[^\]]*\]), VIS_T = (\[[^\]]*\]);/);
  const VIS = new Function(`return ${m[1]}`)(), VIS_T = new Function(`return ${m[2]}`)();
  for (const v of [500, 1500, 3000]) assert.ok(VIS.includes(v), `${v} m`);
  assert.deepEqual([...VIS].sort((a, b) => a - b), VIS);
  // each label names its value ('500 ม.', '1.5 กม.', ...)
  assert.deepEqual(VIS_T.map((t) => { const x = t.match(/^([\d.]+) (ม\.|กม\.)$/); return x && +x[1] * (x[2] === 'กม.' ? 1000 : 1); }), VIS);
  assert.match(app, /sky\.setWeather\(\{ cloud: CLOUD\[app\.cloudIdx\], visibility: VIS\[app\.visIdx\] \}\);/, 'the choice reaches the sky');
  const idx = +app.match(/visIdx: (\d+),/)[1];
  assert.equal(VIS[idx], 20000, 'default');
  assert.match(html, new RegExp(`<input type="range" id="inVis" min="0" max="${VIS.length - 1}" step="1"><output id="outVis">${VIS_T[idx]}</output>`));
  // airfield lights by day at 5 statute miles or less (FAA JO 7110.65BB 3-4-5): 5 km and below, as before
  const LIM = new Function(`${lights.match(/const LIGHTS_DAY_VIS_M = [^;]+;/)[0]} return LIGHTS_DAY_VIS_M;`)();
  near(LIM, 8046.72, 1e-9, '5 SM');
  assert.match(app, /const lightsOnF = \(\) => \(sky\.state\.night > 0\.22 \|\| VIS\[app\.visIdx\] <= LIGHTS_DAY_VIS_M \? 1 : 0\);/);
  assert.deepEqual(VIS.filter((v) => v <= LIM), [500, 1500, 3000, 5000]);
});
