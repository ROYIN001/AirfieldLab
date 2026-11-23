// ───────────────────────── Render core: frames, noise, shader patches, materials ─────────────────────────
// Render space: +X east, +Y up, +Z south (three.js y-up). NED (n,e,d) → (e, −d, −n).

const ned2w = (n, e, d, out = new THREE.Vector3()) => out.set(e, -d, -n);
// Active landing-runway frame in render space (follows setActiveRunway): origin at the landing threshold,
// U along the landing direction, R to the pilot's right.
const RW = { O: new THREE.Vector3(), U: new THREE.Vector3(), R: new THREE.Vector3() };
function syncRW() {
  RW.O.set(THR03[1], 0, -THR03[0]); RW.U.set(RWY_U[1], 0, -RWY_U[0]); RW.R.set(RWY_R[1], 0, -RWY_R[0]);
  RWY_YAW = yawFor(FIELD.rwyHdg);
}
function rw(s, t, y = 0, out = new THREE.Vector3()) { return out.copy(RW.O).addScaledVector(RW.U, s).addScaledVector(RW.R, t).setY(y); }
const yawFor = (hdgDeg) => (90 - hdgDeg) * DEG;          // rotation.y that points local +X at a true heading
let RWY_YAW = 0;
syncRW();
globalThis.__onRwy = () => syncRW();
// world position from local north/east metres
const W3 = (e, n, y = 0, out = new THREE.Vector3()) => out.set(e, y, -n);

// ── tileable fbm noise (4 channels, different base frequencies) used by every procedural surface ──
function makeNoiseTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const rand = makeRng(1234);
  const chans = [{ f: 4, oct: 5 }, { f: 16, oct: 4 }, { f: 64, oct: 2 }, { f: 8, oct: 4 }];
  const acc = new Float32Array(size * size);
  for (let c = 0; c < 4; c++) {
    acc.fill(0);
    let amp = 1;
    for (let o = 0; o < chans[c].oct; o++) {
      const F = chans[c].f << o; if (F > size) break;
      const lat = new Float32Array(F * F); for (let i = 0; i < F * F; i++) lat[i] = rand();
      for (let y = 0; y < size; y++) {
        const gy = (y * F) / size, y0 = Math.floor(gy), fy = gy - y0, sy = fy * fy * (3 - 2 * fy), y1 = (y0 + 1) % F;
        for (let x = 0; x < size; x++) {
          const gx = (x * F) / size, x0 = Math.floor(gx), fx = gx - x0, sx = fx * fx * (3 - 2 * fx), x1 = (x0 + 1) % F;
          const v = lerp(lerp(lat[y0 * F + x0], lat[y0 * F + x1], sx), lerp(lat[y1 * F + x0], lat[y1 * F + x1], sx), sy);
          acc[y * size + x] += v * amp;
        }
      }
      amp *= 0.5;
    }
    let mn = 1e9, mx = -1e9; for (let i = 0; i < acc.length; i++) { mn = Math.min(mn, acc[i]); mx = Math.max(mx, acc[i]); }
    for (let i = 0; i < acc.length; i++) data[i * 4 + c] = Math.round(((acc[i] - mn) / (mx - mn)) * 255);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

// integer hash shared by GLSL and JS (pcg2d), so trees and houses land where the shader draws villages
function pcg2d(x, y) {
  let vx = (x >>> 0), vy = (y >>> 0);
  vx = (Math.imul(vx, 1664525) + 1013904223) >>> 0; vy = (Math.imul(vy, 1664525) + 1013904223) >>> 0;
  vx = (vx + Math.imul(vy, 1664525)) >>> 0; vy = (vy + Math.imul(vx, 1664525)) >>> 0;
  vx = (vx ^ (vx >>> 16)) >>> 0; vy = (vy ^ (vy >>> 16)) >>> 0;
  vx = (vx + Math.imul(vy, 1664525)) >>> 0; vy = (vy + Math.imul(vx, 1664525)) >>> 0;
  vx = (vx ^ (vx >>> 16)) >>> 0;
  return vx / 4294967296;
}
// ── shared uniforms and the GLSL prelude every enhanced material gets ──
const SU = {
  uNoise: { value: null },
  uFogHz: { value: Array.from({ length: 16 }, () => new THREE.Vector3(0.5, 0.6, 0.7)) },
  uHazeH: { value: 1600 },
  uBeta: { value: morBeta(SKY_VIS_M) },        // extinction at the ground (1/m) from the visibility (SkySystem.setWeather)
  uBetaSky: { value: 0 },                      // the part of it the sky dome and clouds do not already show (skyHazeBeta)
  uSunW: { value: new THREE.Vector3(0, 1, 0) },
  uCloud: { value: new THREE.Vector4(0, 1 / 5200, 0, 0) },
  uCloudAlt: { value: 1700 },
  uTime: { value: 0 },
  uNight: { value: 0 },
};
// Haze optical depth from height h0 along the world vector v, and out of the atmosphere along a direction with vertical
// component dy: the GLSL twins of hazeDepth() and hazeDepthUp() in 10-atmo.js.
const HAZE_GLSL = /* glsl */`
uniform float uHazeH;
float hazeDepth(float beta, float h0, vec3 v) {
  float k = v.y / uHazeH;
  float m = abs(k) < 1e-3 ? 1.0 - k / 2.0 + k * k / 6.0 : (1.0 - exp(-k)) / k;
  return beta * length(v) * exp(-max(h0, 0.0) / uHazeH) * m;
}
float hazeDepthUp(float beta, float h0, float dy) {
  return beta * uHazeH * exp(-max(h0, 0.0) / uHazeH) / max(dy, 0.02);
}
`;
const GLSL_PRELUDE = /* glsl */`
uniform sampler2D uNoise;
uniform vec3 uFogHz[16];
uniform float uBetaSky;
${HAZE_GLSL}
uniform vec3 uSunW;
uniform vec4 uCloud;
uniform float uCloudAlt;
uniform float uTime;
uniform float uNight;
vec3 hzFogColor(vec3 d) {
  float a = fract(atan(d.x, -d.z) * 0.15915494 + 1.0) * 16.0;
  int i0 = int(floor(a)); int i1 = (i0 + 1) - 16 * ((i0 + 1) / 16);
  return mix(uFogHz[i0], uFogHz[i1], fract(a));
}
float cloudDensity(vec2 xz) {
  vec2 p = (xz + uCloud.zw) * uCloud.y;
  float n = texture2D(uNoise, p).r * 0.62 + texture2D(uNoise, p * 3.1 + 0.37).g * 0.38;
  return smoothstep(1.0 - uCloud.x, 1.0 - uCloud.x + 0.2, n);
}
float cloudShadowW(vec3 wp) {
  if (uCloud.x < 0.01 || uSunW.y < 0.02) return 1.0;
  float tt = (uCloudAlt - wp.y) / max(uSunW.y, 0.08);
  return 1.0 - 0.82 * cloudDensity(wp.xz + uSunW.xz * tt);
}
uint pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v = v ^ (v >> 16u); v.x += v.y * 1664525u; v.y += v.x * 1664525u; v = v ^ (v >> 16u);
  return v.x;
}
float hash2i(ivec2 c) { return float(pcg2d(uvec2(c + 4096))) / 4294967296.0; }
`;

function patchShaderChunks() {
  const C = THREE.ShaderChunk;
  if (C.__airfieldPatched) return; C.__airfieldPatched = true;
  // Fog is MOR haze (research round 4 §6.8, §7.4): Beer–Lambert on the distance to the camera (vFogW, not the depth
  // along the view axis), with fogDensity = β = ln20 / V (SkySystem.setWeather) and the extinction thinning with height.
  // three.js runs tonemapping_fragment, colorspace_fragment and then fog_fragment, so the haze goes in front of the
  // sRGB encode instead: mixed in display-linear light, a black object at the reported visibility keeps exactly 5%
  // luminance contrast on screen whatever the tone curve (mixed after the encode it kept about 10%). The haze colour is
  // linear radiance, as in the sky dome, so it is tone-mapped first and full fog matches the sky at the horizon.
  const depth = 'vFogDepth = - mvPosition.z;';
  if (!C.fog_vertex.includes(depth)) console.warn('fog chunk changed; fog uses view depth');
  C.fog_vertex = C.fog_vertex.replace(depth, 'vFogDepth = length( mvPosition.xyz );');
  C.fog_pars_vertex += '\n#ifdef USE_HZFOG\nvarying vec3 vFogW;\n#endif';
  C.fog_vertex += '\n#ifdef USE_HZFOG\nvFogW = ( vec4( mvPosition.xyz, 0.0 ) * viewMatrix ).xyz;\n#endif';
  C.fog_pars_fragment += '\n#ifdef USE_HZFOG\nvarying vec3 vFogW;\n#endif';
  C.colorspace_fragment = `#if defined( USE_FOG ) && defined( USE_HZFOG ) && defined( FOG_EXP2 )
  {
    vec3 fogC = hzFogColor( normalize( vFogW ) );
    #ifdef TONE_MAPPING
      fogC = toneMapping( fogC );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogC, 1.0 - exp( - hazeDepth( fogDensity, cameraPosition.y, vFogW ) ) );
  }
#endif
` + C.colorspace_fragment;
  // three.js's own fog, left for a material without the haze (none in the page today), linear in the distance
  C.fog_fragment = `#if defined( USE_FOG ) && !( defined( USE_HZFOG ) && defined( FOG_EXP2 ) )
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`;
  const key = 'getDirectionalLightInfo( directionalLight, directLight );';
  if (!C.lights_fragment_begin.includes(key)) console.warn('lights chunk changed; cloud shadows off');
  C.lights_fragment_begin = C.lights_fragment_begin.replace(key, key + `
		#ifdef USE_CLOUDSHADOW
		directLight.color *= cloudShadowW( cameraPosition + ( vec4( geometryPosition, 0.0 ) * viewMatrix ).xyz );
		#endif`);
}

// Every lit material goes through here: horizon-coloured haze, cloud shadows, optional shader edits.
function enhance(mat, { key = 'std', frag = null, vert = null, uniforms = null, cloud = true } = {}) {
  mat.defines = Object.assign({}, mat.defines, { USE_HZFOG: '' }, cloud ? { USE_CLOUDSHADOW: '' } : {});
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, SU, uniforms || {});
    sh.fragmentShader = GLSL_PRELUDE + sh.fragmentShader;
    if (vert) sh.vertexShader = vert(sh.vertexShader);
    if (frag) sh.fragmentShader = frag(sh.fragmentShader);
  };
  mat.customProgramCacheKey = () => key + (cloud ? '+c' : '');
  return mat;
}
const stdMat = (p, o) => enhance(new THREE.MeshStandardMaterial(p), o);
const physMat = (p, o) => enhance(new THREE.MeshPhysicalMaterial(p), o);
const basicMat = (p, o) => enhance(new THREE.MeshBasicMaterial(p), Object.assign({ cloud: false }, o));

// world position varying for procedural surfaces
const VERT_WPOS = (v) => v.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
  .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
const FRAG_WPOS = (f) => f.replace('#include <common>', '#include <common>\nvarying vec3 vWP;');

// colour helpers (linear)
const lin = (hex) => new THREE.Color(hex);

// geometry helpers
const ni = (g) => (g.index ? g.toNonIndexed() : g);
function boxGeo(w, h, d, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z); return g;
}
function cylGeo(rt, rb, h, seg, x = 0, y = 0, z = 0, open = false) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open); g.translate(x, y, z); return g;
}
function place(g, pos, yaw = 0) { g.rotateY(yaw); g.translate(pos.x, pos.y, pos.z); return g; }

// collects geometries per material and merges them into a handful of meshes
class Batch {
  constructor() { this.parts = new Map(); }
  add(mat, geo) {
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    const g = ni(geo);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    this.parts.get(mat).push(g);
  }
  build(parent, { cast = true, receive = true } = {}) {
    const out = [];
    for (const [mat, list] of this.parts) {
      const g = mergeGeometries(list, false);
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = receive;
      parent.add(m); out.push(m);
    }
    return out;
  }
}

// small canvas → texture helper
function canvasTex(w, h, draw, { srgb = true, mip = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = mip; t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.anisotropy = 8;
  return t;
}
