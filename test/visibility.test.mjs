// Visibility as MOR (owner's research round 4, docs/research/04-weather.md §6.8 and §10.4, test cases VIS-1 to VIS-3).
// The maths lives in src/10-atmo.js (pure); the shaders repeat it (HAZE_GLSL in 30-render.js), so the last tests check
// that the sky, the fog chunk, the lights and the app still use it. Run: node --test test/visibility.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const A = new Function('"use strict";\n' + read('10-atmo.js') + '\nreturn { LN20, LN50, morBeta, hazeDepth, skyHazeBeta, SKY_VIS_M };')();
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

test('only haze beyond the 20 km day greys the sky dome and the clouds', () => {
  assert.equal(A.SKY_VIS_M, 20000);
  assert.equal(A.skyHazeBeta(20000), 0); assert.equal(A.skyHazeBeta(40000), 0);
  near(A.skyHazeBeta(500), A.LN20 / 500 - A.LN20 / 20000, 1e-15, '500 m');
  assert.ok(A.skyHazeBeta(500) > A.skyHazeBeta(5000) && A.skyHazeBeta(5000) > A.skyHazeBeta(10000) && A.skyHazeBeta(10000) > 0);
});

test('the sky, the fog chunk and the lights use the MOR haze', () => {
  const sky = read('40-sky.js'), render = read('30-render.js'), lights = read('60-lights.js');
  assert.match(sky, /SU\.uBeta\.value = this\.scene\.fog\.density = morBeta\(visibility\);/);
  assert.match(sky, /SU\.uBetaSky\.value = skyHazeBeta\(visibility\);/);
  assert.match(sky, /hazeDepth\(uBetaSky, cameraPosition\.y, v\)/, 'clouds');
  assert.match(sky, /mix\(hzFogColor\(d\), col, exp\(-uBetaSky \* uHazeH \* exp\(-max\(cameraPosition\.y, 0\.0\) \/ uHazeH\) \/ max\(d\.y, 0\.02\)\)\)/, 'sky dome');
  // the GLSL twin of hazeDepth()
  const glsl = render.match(/const HAZE_GLSL = \/\* glsl \*\/`([\s\S]*?)`;/)[1].replace(/\s+/g, ' ');
  assert.ok(glsl.includes('float k = v.y / uHazeH;'), glsl);
  assert.ok(glsl.includes('float m = abs(k) < 1e-3 ? 1.0 - k / 2.0 + k * k / 6.0 : (1.0 - exp(-k)) / k;'), glsl);
  assert.ok(glsl.includes('return beta * length(v) * exp(-max(h0, 0.0) / uHazeH) * m;'), glsl);
  assert.match(render, /\$\{HAZE_GLSL\}/, 'the prelude holds it');
  // fog: linear in the distance to the camera, never the old exp² of the view depth
  assert.match(render, /'vFogDepth = length\( mvPosition\.xyz \);'/);
  assert.match(render, /1\.0 - exp\( - hazeDepth\( fogDensity, cameraPosition\.y, vFogW \) \)/);
  assert.match(render, /1\.0 - exp\( - fogDensity \* vFogDepth \)/);
  // three.js fogs after tone mapping and the output transform: the haze colour goes through both, as in the sky dome
  assert.match(render, /#ifdef TONE_MAPPING\s+fogC = toneMapping\( fogC \);\s+#endif\s+gl_FragColor\.rgb = mix\( gl_FragColor\.rgb, linearToOutputTexel\( vec4\( fogC, 1\.0 \) \)\.rgb, fogFactor \);/);
  assert.doesNotMatch(render, /fogDensity \* fogDensity/);
  // lights fade through the same haze
  assert.match(lights, /vertexShader: \/\* glsl \*\/`\$\{HAZE_GLSL\}/);
  assert.match(lights, /uBeta: SU\.uBeta, uHazeH: SU\.uHazeH/);
  assert.match(lights, /I \*= exp\(-hazeDepth\(uBeta, cameraPosition\.y, -toCam\)\);/);
  for (const f of fs.readdirSync(new URL('../src/', import.meta.url))) assert.doesNotMatch(read(f), /\buVis\b/, f);
});

test('visibility choices: 500 m to 40 km, default 20 km, lights by value not by slider position', () => {
  const app = read('90-app.js'), html = read('template.html'), lights = read('60-lights.js');
  const m = app.match(/const VIS = (\[[^\]]*\]), VIS_T = (\[[^\]]*\]);/);
  const VIS = new Function(`return ${m[1]}`)(), VIS_T = new Function(`return ${m[2]}`)();
  for (const v of [500, 1500, 3000]) assert.ok(VIS.includes(v), `${v} m`);
  assert.deepEqual([...VIS].sort((a, b) => a - b), VIS);
  assert.equal(VIS_T.length, VIS.length);
  const idx = +app.match(/visIdx: (\d+),/)[1];
  assert.equal(VIS[idx], 20000, 'default');
  assert.match(html, new RegExp(`<input type="range" id="inVis" min="0" max="${VIS.length - 1}" step="1"><output id="outVis">${VIS_T[idx]}</output>`));
  // airfield lights by day at 5 statute miles or less (FAA JO 7110.65BB 3-4-5): 5 km and below, as before
  const LIM = new Function(`${lights.match(/const LIGHTS_DAY_VIS_M = [^;]+;/)[0]} return LIGHTS_DAY_VIS_M;`)();
  near(LIM, 8046.72, 1e-9, '5 SM');
  assert.match(app, /const lightsOnF = \(\) => \(sky\.state\.night > 0\.22 \|\| VIS\[app\.visIdx\] <= LIGHTS_DAY_VIS_M \? 1 : 0\);/);
  assert.deepEqual(VIS.filter((v) => v <= LIM), [500, 1500, 3000, 5000]);
});
