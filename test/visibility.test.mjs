// Visibility as MOR (owner's research round 4, docs/research/04-weather.md §6.8 and §10.4, test cases VIS-1 to VIS-3).
// The maths lives in src/10-atmo.js (pure); the shaders repeat it (HAZE_GLSL in 30-render.js), so the last tests check
// that the sky, the fog chunk, the lights, the sunlight and the app still use it, in code that is not commented out.
// Run: node --test test/visibility.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const live = (f) => read(f).replace(/^\s*\/\/.*$/gm, '');                       // without comment lines (JS and GLSL)
const A = new Function('"use strict";\n' + read('10-atmo.js') + '\nreturn { LN20, LN50, morBeta, hazeDepth, hazeDepthUp, skyHazeBeta, SKY_VIS_M };')();
const H = 1600;                                     // SU.uHazeH in 30-render.js
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
  assert.equal(A.hazeDepthUp(b, 0, 0.001, H), A.hazeDepthUp(b, 0, 0.02, H), 'held at 0.02 near the horizon');
});

test('only haze beyond the 20 km day greys the sky dome and the clouds', () => {
  assert.equal(A.SKY_VIS_M, 20000);
  assert.equal(A.skyHazeBeta(20000), 0); assert.equal(A.skyHazeBeta(40000), 0);
  near(A.skyHazeBeta(500), A.LN20 / 500 - A.LN20 / 20000, 1e-15, '500 m');
  assert.ok(A.skyHazeBeta(500) > A.skyHazeBeta(5000) && A.skyHazeBeta(5000) > A.skyHazeBeta(10000) && A.skyHazeBeta(10000) > 0);
  // direct sunlight at 14° (16:40 in November): full at 20 km, gone in 500 m fog
  const sunT = (V) => Math.exp(-A.hazeDepthUp(A.skyHazeBeta(V), 0, Math.sin(14 * Math.PI / 180), H));
  assert.equal(sunT(20000), 1);
  assert.ok(sunT(500) < 1e-12 && sunT(5000) > 0.03 && sunT(5000) < 0.1, `${sunT(500)} ${sunT(5000)}`);
});

test('MOR on screen: the haze is mixed in display-linear light, before the sRGB encode', () => {
  // sRGB transfer functions (IEC 61966-2-1); x is display-linear, the encoded value is what the canvas stores
  const enc = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  const dec = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const T5 = 0.05;                                          // transmittance at the reported visibility
  for (const F of [0.1, 0.3, 0.6, 0.9]) {                   // haze, display-linear (after tone mapping)
    const shown = dec(enc((1 - T5) * F));                   // black object at V, mixed before the encode
    near(1 - shown / F, T5, 1e-9, `contrast at V, haze ${F}`);
    const after = dec((1 - T5) * enc(F));                   // mixed after the encode (three.js's fog_fragment)
    assert.ok(1 - after / F > 0.09, `after the encode the contrast would be ${(1 - after / F).toFixed(3)}`);
  }
  const render = live('30-render.js');
  const cs = render.match(/C\.colorspace_fragment = `([\s\S]*?)` \+ C\.colorspace_fragment;/);
  assert.ok(cs, 'the haze is put in front of colorspace_fragment');
  const body = cs[1].replace(/\s+/g, ' ');
  for (const t of ['#if defined( USE_FOG ) && defined( USE_HZFOG ) && defined( FOG_EXP2 )', 'vec3 fogC = hzFogColor( normalize( vFogW ) );',
    '#ifdef TONE_MAPPING fogC = toneMapping( fogC ); #endif',
    'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, 1.0 - exp( - hazeDepth( fogDensity, cameraPosition.y, vFogW ) ) );']) assert.ok(body.includes(t), t);
  assert.doesNotMatch(body, /linearToOutputTexel|sRGBTransfer/, 'no encode inside the haze');
  // the fog chunk (after the encode) leaves hazed materials alone
  const fog = render.match(/C\.fog_fragment = `([\s\S]*?)`;/)[1];
  assert.match(fog, /^#if defined\( USE_FOG \) && !\( defined\( USE_HZFOG \) && defined\( FOG_EXP2 \) \)/);
  assert.doesNotMatch(fog, /hazeDepth|hzFogColor/);
});

test('the sky, the fog chunk, the lights and the sunlight use the MOR haze', () => {
  const sky = live('40-sky.js'), render = live('30-render.js'), lights = live('60-lights.js');
  assert.match(sky, /SU\.uBeta\.value = this\.scene\.fog\.density = morBeta\(visibility\);/);
  assert.match(sky, /SU\.uBetaSky\.value = skyHazeBeta\(visibility\);/);
  // one place sets the fog density
  const src = fs.readdirSync(new URL('../src/', import.meta.url));
  assert.equal(src.flatMap((f) => live(f).match(/fog\.density\s*=/g) || []).length, 1, 'fog.density assignments');
  assert.match(sky, /hazeDepth\(uBetaSky, cameraPosition\.y, v\)/, 'clouds');
  assert.match(sky, /if \(d\.y > 0\.0\) col = mix\(hzFogColor\(d\), col, exp\(-hazeDepthUp\(uBetaSky, cameraPosition\.y, d\.y\)\)\);/, 'sky dome');
  // direct sunlight: set in setSunDir and in setWeather through applySunHaze, nowhere else
  assert.match(sky, /const T = s\[1\] > -0\.02 \? Math\.exp\(-hazeDepthUp\(skyHazeBeta\(this\.visibility\), 0, s\[1\], SU\.uHazeH\.value\)\) : 0;\s+this\.sun\.intensity = \(this\.sunMax \|\| 0\) \* T;/);
  assert.equal((sky.match(/this\.applySunHaze\(\);/g) || []).length, 2, 'setSunDir and setWeather');
  assert.equal(src.flatMap((f) => live(f).match(/sun\.intensity\s*=/g) || []).length, 1, 'sun.intensity assignments');
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
