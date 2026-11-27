// ───────────────────────── Don Mueang airfield: land cover, pavements, markings, airside structures ─────────────────────────
// Geometry comes from AIP Thailand (runways, lights, navaids) and OpenStreetMap (taxiways, aprons, buildings, land use).

// ── land-use classes → albedo, baked once on the GPU into a mipmapped texture ──
// class ids follow tools/landclass.py: 1 land 2 residential 3 commercial 4 industrial 5 military 6 aerodrome 7 grass 8 park
// 9 golf 10 forest 11 farm 12 water 13 road 14 secondary 15 primary 16 trunk 17 motorway 18 rail 19 building 20 apron
// 21 taxiway 22 parking 23 school 24 temple 25 construction 26 cemetery 27 terminal 28 military building
const LAND_GLSL = /* glsl */`
uint pcgU(uvec2 v) {
  v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v = v ^ (v >> 16u); v.x += v.y * 1664525u; v.y += v.x * 1664525u; v = v ^ (v >> 16u);
  return v.x;
}
float hh(vec2 c) { return float(pcgU(uvec2(ivec2(c) + 65536))) / 4294967296.0; }
vec3 srgb(vec3 c) { return c * c; }   // stored sqrt(linear); decode by squaring
vec3 roofC(float h) {
  return h < 0.22 ? vec3(0.47, 0.25, 0.17) : h < 0.40 ? vec3(0.43, 0.42, 0.40) : h < 0.52 ? vec3(0.27, 0.35, 0.45)
       : h < 0.70 ? vec3(0.62, 0.60, 0.57) : h < 0.84 ? vec3(0.33, 0.34, 0.35) : vec3(0.52, 0.45, 0.38);
}
vec3 treeC(float h) { return mix(vec3(0.19, 0.27, 0.13), vec3(0.25, 0.32, 0.16), h); }
vec3 grassC(float h) { return mix(vec3(0.33, 0.40, 0.20), vec3(0.40, 0.44, 0.24), h); }
vec3 dryC(float h) { return mix(vec3(0.42, 0.43, 0.27), vec3(0.47, 0.45, 0.30), h); }
vec3 asph(float h) { return vec3(0.27, 0.27, 0.27) * (0.92 + 0.16 * h); }
vec3 conc(float h) { return vec3(0.52, 0.51, 0.49) * (0.92 + 0.12 * h); }
// urban texture: lots of a given size, each a roof, a tree crown or a paved yard
vec3 urban(vec2 p, float lot, float pRoof, float pTree, float light) {
  vec2 c = floor(p / lot); float h = hh(c), h2 = hh(c + 917.0);
  vec2 f = fract(p / lot);
  float edge = step(0.08, f.x) * step(f.x, 0.94) * step(0.08, f.y) * step(f.y, 0.94);
  vec3 col = h < pRoof ? roofC(h2) * (0.9 + 0.2 * light) : h < pRoof + pTree ? treeC(h2) : conc(h2) * 0.85;
  return mix(col * 0.72, col, edge);
}
vec3 fallbackLand(vec2 p) {     // outside the mapped area: suburban Bangkok with fields and fish ponds
  float n1 = texture2D(uNoise, p / 5200.0).r, n2 = texture2D(uNoise, p / 1300.0).g;
  vec3 town = urban(p, 11.0, 0.62, 0.24, 0.0);
  vec2 fc = floor(p / vec2(120.0, 80.0)); float fh = hh(fc + 4000.0);
  vec3 field = fh < 0.18 ? vec3(0.17, 0.22, 0.20) : mix(vec3(0.30, 0.38, 0.17), vec3(0.45, 0.42, 0.25), fh);
  return mix(field, town, smoothstep(0.35, 0.55, n1 * 0.75 + n2 * 0.35));
}
vec4 landColor(float cls, vec2 p) {
  int c = int(cls + 0.5);
  float h = hh(floor(p / 3.0)), h7 = hh(floor(p / 7.0) + 33.0);
  vec3 col; float water = 0.0;
  if (c == 0) col = fallbackLand(p);
  else if (c == 1) col = urban(p, 10.0, 0.55, 0.30, 0.0);
  else if (c == 2) col = urban(p, 8.0, 0.70, 0.18, 0.0);
  else if (c == 3) col = urban(p, 16.0, 0.82, 0.06, 0.4);
  else if (c == 4) col = urban(p, 30.0, 0.80, 0.03, 0.8);
  else if (c == 5) col = mix(grassC(h7), urban(p, 22.0, 0.55, 0.25, 0.3), step(0.62, hh(floor(p / 60.0))));
  else if (c == 6) col = dryC(h7);
  else if (c == 7) col = grassC(h7);
  else if (c == 8) col = mix(grassC(h7), treeC(h), step(0.55, hh(floor(p / 9.0))));
  else if (c == 9) col = vec3(0.30, 0.45, 0.17) * (0.95 + 0.1 * h7);
  else if (c == 10) col = treeC(h) * (0.9 + 0.2 * h7);
  else if (c == 11) col = mix(vec3(0.37, 0.42, 0.20), vec3(0.47, 0.44, 0.28), h7);
  else if (c == 12) { col = vec3(0.16, 0.19, 0.17); water = 1.0; }
  else if (c == 13) col = mix(conc(h) * 0.82, asph(h), 0.4);
  else if (c >= 14 && c <= 17) col = asph(h);
  else if (c == 18) col = vec3(0.36, 0.33, 0.30);
  else if (c == 19) col = roofC(hh(floor(p / 14.0) + 5.0));
  else if (c == 20 || c == 21) col = conc(h);
  else if (c == 22) col = asph(h) * 1.08;
  else if (c == 23) col = mix(grassC(h7), urban(p, 18.0, 0.7, 0.1, 0.5), step(0.5, hh(floor(p / 40.0))));
  else if (c == 24) col = mix(urban(p, 12.0, 0.5, 0.3, 0.2), vec3(0.55, 0.30, 0.16), 0.25);
  else if (c == 25) col = vec3(0.47, 0.40, 0.32);
  else if (c == 26) col = grassC(h7) * 0.9;
  else if (c == 27) col = vec3(0.70, 0.70, 0.68);
  else col = vec3(0.45, 0.46, 0.44);
  return vec4(col, water);            // display-referred colour; the ground shader squares it (≈ linear)
}
`;

function bakeLand(renderer, classTex, box, scale) {
  const w = Math.round(box.w * scale), h = Math.round(box.h * scale);
  const rt = new THREE.WebGLRenderTarget(w, h, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, colorSpace: THREE.NoColorSpace });
  rt.texture.anisotropy = 8;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uClass: { value: classTex }, uNoise: SU.uNoise, uBox: { value: new THREE.Vector4(box.e0, box.n1, box.w * box.res, box.h * box.res) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D uClass; uniform sampler2D uNoise; uniform vec4 uBox; varying vec2 vUv;\n${LAND_GLSL}
      void main() {
        vec2 uv = vUv;                    // v = 0 is the first (northern) row of the class map
        float cls = texture2D(uClass, uv).r * 255.0;
        vec2 p = vec2(uBox.x + uv.x * uBox.z, -(uBox.y - uv.y * uBox.w));   // render xz (z = −north)
        gl_FragColor = landColor(cls, p);
      }`,
    depthTest: false, depthWrite: false,
  });
  const scn = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scn.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt); renderer.render(scn, cam); renderer.setRenderTarget(prev);
  mat.dispose();
  return rt;
}

const GROUND_FRAG = /* glsl */`
vec2 P = vWP.xz;
float e = P.x, nn = -P.y;
vec2 uvI = vec2((e - uBoxI.x) / uBoxI.z, (uBoxI.y - nn) / uBoxI.w);
vec2 uvO = vec2((e - uBoxO.x) / uBoxO.z, (uBoxO.y - nn) / uBoxO.w);
float wI = smoothstep(0.0, 0.03, min(min(uvI.x, 1.0 - uvI.x), min(uvI.y, 1.0 - uvI.y)));
float wO = smoothstep(0.0, 0.04, min(min(uvO.x, 1.0 - uvO.x), min(uvO.y, 1.0 - uvO.y)));
vec4 cI = texture2D(uLandI, clamp(uvI, 0.0, 1.0));
vec4 cO = texture2D(uLandO, clamp(uvO, 0.0, 1.0));
vec4 fb = wO < 0.999 ? landColor(0.0, P) : vec4(0.0);
vec4 L = mix(mix(fb, cO, wO), cI, wI);
vec3 c = L.rgb * L.rgb;
float water = smoothstep(0.35, 0.75, L.a);
vec4 nA = texture2D(uNoise, P / 900.0), nC = texture2D(uNoise, P / 19.0), nD = texture2D(uNoise, P / 2.7);
c *= (0.9 + 0.2 * nA.r) * mix(0.9 + 0.2 * nC.g * (0.6 + 0.4 * nD.b), 1.0, water);
c = mix(c, vec3(0.020, 0.032, 0.030) * (0.85 + 0.3 * nA.g), water);
diffuseColor.rgb = c;
float gRough = mix(0.93, 0.07, water);
`;

// ── runway surface with ICAO markings, parameterised per runway ──
const RUNWAY_FRAG = /* glsl */`
vec2 P = vWP.xz - uO;
float s = dot(P, uU), t = dot(P, uR);
float L = uLen, W2 = uW * 0.5;
bool endB = s > (uThr.x + uThr.y) * 0.5;
float sx = endB ? (uThr.y - s) : (s - uThr.x);          // metres past the landing threshold of the nearer end
float tx = endB ? -t : t;
vec3 gly = endB ? uGlyB : uGlyA;
float at = abs(t), atx = abs(tx);
vec2 fw = fwidth(vec2(sx, tx)) * 0.75 + 0.002;
vec4 nA = texture2D(uNoise, vWP.xz / 300.0), nB = texture2D(uNoise, vWP.xz / 31.0), nC = texture2D(uNoise, vWP.xz / 2.3);
vec4 nS = texture2D(uNoise, vec2(sx / 150.0, tx / 2.8));
float concA = 1.0 - step(uConc.x, s), concB = step(L - uConc.y, s);
vec3 asphalt = vec3(0.070, 0.070, 0.068) * (0.86 + 0.28 * nA.g) * (0.86 + 0.28 * nC.r);
vec3 concrete = vec3(0.30, 0.295, 0.28) * (0.88 + 0.2 * nA.r) * (0.9 + 0.15 * nC.g);
float isConc = max(concA, concB);
vec3 surf = mix(asphalt, concrete, isConc);
float patchM = smoothstep(0.64, 0.66, nB.a) * step(at, W2);
surf *= 1.0 - 0.18 * patchM;
float jm = mod(t - 3.75, 7.5); float jd = min(jm, 7.5 - jm);
surf *= 1.0 - 0.25 * (1.0 - smoothstep(0.03, 0.03 + fw.y, jd)) * step(at, W2);
vec3 shoulder = vec3(0.098, 0.094, 0.088) * (0.85 + 0.3 * nB.g);
surf = mix(surf, shoulder, smoothstep(W2 - fw.y, W2 + fw.y, at));
float outRw = step(s, 0.0) + step(L, s);
float tdz = smoothstep(150.0, 330.0, sx) * (1.0 - smoothstep(800.0, 1300.0, sx)) * (1.0 - outRw);
float lanes = exp(-pow((at - 2.6) / 2.4, 2.0)) + 0.55 * exp(-pow(t / 2.2, 2.0)) + 0.35 * exp(-pow((at - 6.0) / 1.6, 2.0));
float rubber = clamp(tdz * lanes * (0.35 + 1.0 * nS.r), 0.0, 1.0);
surf = mix(surf, vec3(0.020, 0.020, 0.020), rubber * 0.88);
float rough = mix(0.88, 0.5, rubber);
#define BOX(x, a, b, w) (smoothstep((a) - (w), (a) + (w), (x)) - smoothstep((b) - (w), (b) + (w), (x)))
float inR = (1.0 - outRw) * step(at, W2 + 0.1);
// threshold stripes: n per side, inner edges 1.8 m from the centre line, outer edge 3 m from the runway edge
float span = min(W2 - 3.0, 27.0) - 1.8, sw = span / (2.0 * uNS - 1.0);
float q = atx - 1.8;
float thr = BOX(sx, 6.0, 36.0, fw.x) * step(0.0, q) * step(q, span) * (1.0 - step(sw, mod(q, 2.0 * sw)));
float cm = mod(sx - 90.0, 50.0);
float cl = BOX(s, uThr.x + 90.0, uThr.y - 90.0, fw.x) * BOX(cm, 0.0, 30.0, fw.x) * BOX(t, -0.45, 0.45, fw.y);
float aim = BOX(sx, 400.0, 450.0, fw.x) * BOX(atx, 9.0, 18.0, fw.y);
float tdzM = 0.0;
for (int i = 0; i < 6; i++) {
  float st = (i == 0) ? 150.0 : (i == 1) ? 300.0 : (i == 2) ? 600.0 : (i == 3) ? 750.0 : (i == 4) ? 900.0 : 1050.0;
  float n = (i < 2) ? 3.0 : (i < 4) ? 2.0 : 1.0;
  float inS = BOX(sx, st, st + 22.5, fw.x);
  float qq = atx - 9.0; float j = floor(qq / 4.5);
  tdzM = max(tdzM, inS * step(0.0, qq) * step(j, n - 1.0) * BOX(mod(qq, 4.5), 0.0, 3.0, fw.y));
}
float side = BOX(at, W2 - 0.9, W2, fw.y) * (1.0 - outRw);
// designation: letter nearest the threshold, then the two digits
float dgt = 0.0;
{
  float vL = (sx - 48.0) / 9.0, vN = (sx - 63.0) / 9.0;
  float uA = (tx + 4.4) / 3.6, uB = (tx - 0.8) / 3.6, uC = (tx + 1.8) / 3.6;
  float a1 = texture(uDigits, vec2((gly.x + clamp(uA, 0.0, 1.0)) / 6.0, clamp(vN, 0.0, 1.0))).a * step(0.0, uA) * step(uA, 1.0);
  float a2 = texture(uDigits, vec2((gly.y + clamp(uB, 0.0, 1.0)) / 6.0, clamp(vN, 0.0, 1.0))).a * step(0.0, uB) * step(uB, 1.0);
  float a3 = texture(uDigits, vec2((gly.z + clamp(uC, 0.0, 1.0)) / 6.0, clamp(vL, 0.0, 1.0))).a * step(0.0, uC) * step(uC, 1.0);
  dgt = step(0.0, vN) * step(vN, 1.0) * max(a1, a2) + step(0.0, vL) * step(vL, 1.0) * a3;
}
float paint = inR * step(0.0, sx) * max(max(max(thr, cl), max(aim, tdzM)), dgt) + side * (1.0 - outRw);
// displaced threshold: transverse bar and arrows in the pre-threshold area
float dsp = 0.0;
if (sx < 0.0 && sx > -400.0 && outRw < 0.5) {
  float bar = BOX(sx, -1.8, 0.0, fw.x) * step(at, W2 - 0.2);
  float k = mod(-sx - 20.0, 60.0);
  float shaft = BOX(k, 12.0, 42.0, fw.x) * BOX(t, -0.45, 0.45, fw.y);
  float head = BOX(k, 0.0, 12.0, fw.x) * step(at, (k / 12.0) * 2.2 + 0.45) * step(-sx, 380.0);
  dsp = max(bar, max(shaft, head) * step(30.0, -sx));
}
paint = max(paint, dsp);
paint *= (0.78 + 0.22 * nC.g) * (1.0 - 0.65 * rubber);
diffuseColor.rgb = mix(surf, vec3(0.60, 0.60, 0.58) * (0.9 + 0.1 * nB.b), paint);
float gRough = mix(rough, 0.72, paint);
`;

const PAVE_FRAG = (kind) => /* glsl */`
vec2 P = vWP.xz;
vec4 nA = texture2D(uNoise, P / 220.0), nB = texture2D(uNoise, P / 27.0), nC = texture2D(uNoise, P / 2.1);
vec3 c; float gRough;
${kind === 'apron' ? `
  vec2 fw = fwidth(P) + 0.002;
  vec2 jm = abs(fract(P / 5.0) - 0.5) * 5.0;
  float joint = max(1.0 - smoothstep(0.0, 0.03 + fw.x, 2.5 - jm.x), 1.0 - smoothstep(0.0, 0.03 + fw.y, 2.5 - jm.y));
  joint *= 1.0 - smoothstep(0.04, 0.22, max(fw.x, fw.y));
  c = vec3(0.30, 0.295, 0.28) * (0.88 + 0.2 * nA.r) * (0.9 + 0.15 * nC.g);
  float slab = texture2D(uNoise, floor(P / 5.0) * 0.137).b;
  c *= 0.93 + 0.12 * slab;
  float stain = smoothstep(0.55, 0.8, nB.r) * smoothstep(0.35, 0.8, nC.a);
  c = mix(c, vec3(0.07, 0.068, 0.065), stain * 0.35);
  c *= 1.0 - 0.2 * joint;
  gRough = 0.82 - 0.2 * stain;
` : kind === 'shoulder' ? `
  c = vec3(0.11, 0.105, 0.098) * (0.85 + 0.3 * nB.g) * (0.9 + 0.2 * nC.r); gRough = 0.92;
` : kind === 'water' ? `
  c = vec3(0.016, 0.026, 0.024) * (0.85 + 0.3 * nA.g); gRough = 0.06;
` : kind === 'golf' ? `
  float stripe = step(0.5, fract(dot(P, vec2(0.48, 0.877)) / 9.0));
  c = vec3(0.075, 0.150, 0.032) * (0.92 + 0.16 * nA.r) * mix(0.93, 1.07, stripe) * (0.95 + 0.1 * nC.g); gRough = 0.9;
` : `
  c = vec3(0.27, 0.265, 0.25) * (0.88 + 0.2 * nA.r) * (0.9 + 0.15 * nC.g);
  vec2 jm = abs(fract(P / 5.0) - 0.5) * 5.0; vec2 fw = fwidth(P) + 0.002;
  float joint = max(1.0 - smoothstep(0.0, 0.03 + fw.x, 2.5 - jm.x), 1.0 - smoothstep(0.0, 0.03 + fw.y, 2.5 - jm.y)) * (1.0 - smoothstep(0.04, 0.22, max(fw.x, fw.y)));
  c *= 1.0 - 0.15 * joint;
  c = mix(c, vec3(0.06), smoothstep(0.62, 0.8, nB.a) * 0.25);
  gRough = 0.86;
`}
diffuseColor.rgb = c;
`;

function procMat(key, frag, uniforms = {}, decl = '') {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
  enhance(m, {
    key, uniforms, vert: VERT_WPOS,
    frag: (f) => FRAG_WPOS(f).replace('#include <common>', '#include <common>\n' + decl)
      .replace('#include <map_fragment>', frag)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = gRough;'),
  });
  m.depthWrite = false;
  return m;
}

function makeDigitsTexture() {
  // painted runway glyphs, 6 cells: 0 1 2 3 L R (tall condensed strokes)
  return canvasTex(768, 320, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#fff';
    const cw = w / 6, st = 22, S = (x, y, ww, hh) => g.fillRect(x, y, ww, hh);
    for (let i = 0; i < 6; i++) {
      const x0 = i * cw + 14, x1 = (i + 1) * cw - 14, y0 = 14, y1 = h - 14, wd = x1 - x0, ym = (y0 + y1) / 2;
      if (i === 0) { S(x0, y0, wd, st); S(x0, y1 - st, wd, st); S(x0, y0, st, y1 - y0); S(x1 - st, y0, st, y1 - y0); }
      if (i === 1) { S((x0 + x1) / 2 - st / 2, y0, st, y1 - y0); S((x0 + x1) / 2 - st * 1.6, y0, st * 1.1, st * 1.4); }
      if (i === 2) { S(x0, y0, wd, st); S(x1 - st, y0, st, ym - y0); S(x0, ym - st / 2, wd, st); S(x0, ym, st, y1 - ym); S(x0, y1 - st, wd, st); }
      if (i === 3) { S(x0, y0, wd, st); S(x1 - st, y0, st, y1 - y0); S(x0 + wd * 0.25, ym - st / 2, wd * 0.75, st); S(x0, y1 - st, wd, st); }
      if (i === 4) { S(x0, y0, st, y1 - y0); S(x0, y0, wd, st); }                       // L (v grows away from the threshold: base first)
      if (i === 5) { S(x0, y0, st, y1 - y0); S(x0, ym - st / 2, wd, st); S(x0, y1 - st, wd, st); S(x1 - st, ym, st, y1 - ym); S(x0 + wd * 0.35, y0, st, ym - y0); S(x0 + wd * 0.35, y0 + (ym - y0) * 0.5, wd * 0.65, st); }
    }
  }, { srgb: false });
}
const GLYPH = { '0': 0, '1': 1, '2': 2, '3': 3, L: 4, R: 5 };

// flat ground geometry helpers in local metres (e, n) → render space
function polyGeo(outer, holes = [], y = 0) {
  const sh = new THREE.Shape(outer.map(([e, n]) => new THREE.Vector2(e, n)));
  for (const h of holes) sh.holes.push(new THREE.Path(h.map(([e, n]) => new THREE.Vector2(e, n))));
  const g = new THREE.ShapeGeometry(sh);
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  const nrm = g.attributes.normal; for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  return g;
}
// ribbon along a polyline with round joins (discs) so junctions and bends close up cleanly
function ribbonGeo(pts, w, { y = 0, caps = true, seg = 10 } = {}) {
  const pos = [];
  const tri = (a, b, c) => pos.push(a[0], y, -a[1], b[0], y, -b[1], c[0], y, -c[1]);
  const h = w / 2;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1]; let de = b[0] - a[0], dn = b[1] - a[1]; const l = Math.hypot(de, dn); if (l < 1e-3) continue; de /= l; dn /= l;
    const ox = dn * h, oy = -de * h;
    const a1 = [a[0] + ox, a[1] + oy], a2 = [a[0] - ox, a[1] - oy], b1 = [b[0] + ox, b[1] + oy], b2 = [b[0] - ox, b[1] - oy];
    tri(a1, b1, b2); tri(a1, b2, a2);
  }
  if (caps) for (const p of pts) for (let k = 0; k < seg; k++) {
    const t0 = (k / seg) * Math.PI * 2, t1 = ((k + 1) / seg) * Math.PI * 2;
    tri(p, [p[0] + Math.cos(t0) * h, p[1] + Math.sin(t0) * h], [p[0] + Math.cos(t1) * h, p[1] + Math.sin(t1) * h]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const nrm = new Float32Array(pos.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  return g;
}
function mergeFlat(list) {
  const gs = list.filter(Boolean).map((g) => { const x = ni(g); for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal') x.deleteAttribute(k); return x; });
  return gs.length ? mergeGeometries(gs, false) : null;
}
// polyline helpers (local e,n)
const plLen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function plSample(P, step, fn) {      // calls fn(point, unitDir, distance) every `step` metres
  let acc = 0, next = 0;
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l < 1e-6) continue;
    const d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    while (next <= acc + l) { const u = next - acc; fn([a[0] + d[0] * u, a[1] + d[1] * u], d, next); next += step; }
    acc += l;
  }
}

function buildAirfield(scene, renderer, data, quality) {
  const root = new THREE.Group(); root.name = 'airfield'; scene.add(root);
  const out = { root, dyn: { socks: [] }, papiPos: [] };
  const af = data.af;
  // ── ground: baked land use (inner 2.5 m, outer 8 m) over a procedural fallback ──
  const scale = quality === 'high' ? 1 : 0.5;
  const rtI = bakeLand(renderer, classTexture(data.landIn), LAND.in, scale);
  const rtO = bakeLand(renderer, classTexture(data.landOut), LAND.out, quality === 'high' ? 1 : 0.6);
  out.landRT = [rtI, rtO];
  const boxV = (b) => new THREE.Vector4(b.e0, b.n1, b.w * b.res, b.h * b.res);
  const groundMat = procMat('ground', GROUND_FRAG, { uLandI: { value: rtI.texture }, uLandO: { value: rtO.texture }, uBoxI: { value: boxV(LAND.in) }, uBoxO: { value: boxV(LAND.out) } },
    'uniform sampler2D uLandI; uniform sampler2D uLandO; uniform vec4 uBoxI; uniform vec4 uBoxO;\n' + LAND_GLSL.replace(/uint pcgU[\s\S]*?^}\n/m, (m) => m));
  const ground = new THREE.Mesh((() => { const g = new THREE.PlaneGeometry(120000, 120000); g.rotateX(-Math.PI / 2); return g; })(), groundMat);
  ground.renderOrder = -20; ground.receiveShadow = true; ground.frustumCulled = false; root.add(ground);
  out.ground = ground;

  // ── water and golf polygons (crisp edges inside the airfield) ──
  const waterMat = procMat('water', PAVE_FRAG('water')), golfMat = procMat('golf', PAVE_FRAG('golf'));
  const addLayer = (geo, mat, ro) => { if (!geo) return null; const m = new THREE.Mesh(geo, mat); m.renderOrder = ro; m.receiveShadow = true; root.add(m); return m; };
  addLayer(mergeFlat(af.golf.map((p) => polyGeo(p.o, p.h))), golfMat, -19);
  addLayer(mergeFlat(af.water.map((p) => polyGeo(p.o, p.h))), waterMat, -18);

  // ── taxiways (concrete, TWY_W = 23 m) with asphalt shoulders, aprons ──
  const twyMat = procMat('twy', PAVE_FRAG('twy')), shMat = procMat('shoulder', PAVE_FRAG('shoulder')), apMat = procMat('apron', PAVE_FRAG('apron'));
  const twys = af.tw.filter((t) => t.k === 'twy'), lanes = af.tw.filter((t) => t.k === 'lane');
  addLayer(mergeFlat(twys.map((t) => ribbonGeo(t.p, 44))), shMat, -17);
  addLayer(mergeFlat([...twys.map((t) => ribbonGeo(t.p, TWY_W)), ...lanes.map((t) => ribbonGeo(t.p, TWY_W))]), twyMat, -16);
  addLayer(mergeFlat(af.apron.map((p) => polyGeo(p.o, p.h))), apMat, -15);

  // ── runways ──
  const digits = makeDigitsTexture();
  out.runways = [];
  for (const R of RUNWAYS) {
    const [A, B] = R.ends;
    const gl = (id) => new THREE.Vector3(GLYPH[id[0]], GLYPH[id[1]], GLYPH[id[2]]);
    const U = new THREE.Vector2(R.u[1], -R.u[0]), Rr = new THREE.Vector2(R.r[1], -R.r[0]);
    const mat = procMat('runway', RUNWAY_FRAG, {
      uO: { value: new THREE.Vector2(R.p0[1], -R.p0[0]) }, uU: { value: U }, uR: { value: Rr }, uLen: { value: R.len }, uW: { value: R.w },
      uThr: { value: new THREE.Vector2(R.sThr[0], R.sThr[1]) }, uGlyA: { value: gl(A) }, uGlyB: { value: gl(B) }, uConc: { value: new THREE.Vector2(R.conc[0], R.conc[1]) },
      uNS: { value: R.w >= 60 ? 8 : 6 }, uDigits: { value: digits },
    }, 'uniform vec2 uO, uU, uR, uThr, uConc; uniform float uLen, uW, uNS; uniform vec3 uGlyA, uGlyB; uniform sampler2D uDigits;');
    const c0 = rwyEN(R, -RWY_PAD, 0), c1 = rwyEN(R, R.len + RWY_PAD, 0);   // with a pad of pavement beyond each end
    const geo = ribbonGeo([c0, c1], R.w + 15, { caps: false });
    const m = addLayer(geo, mat, -12);
    out.runways.push(m);
  }

  // ── painted markings: taxiway centre lines (yellow), runway-holding positions ──
  const yel = stdMat({ color: lin(0xb08a10), roughness: 0.7 }, { key: 'mark' }); yel.depthWrite = false;
  const ym = [];
  for (const t of af.tw) {
    // split the centre line where it runs over a runway (it stops at the runway edge)
    let seg = [];
    const flush = () => { if (seg.length > 1) ym.push(ribbonGeo(seg, 0.3, { caps: false })); seg = []; };
    plSample(t.p, 2, (p) => { if (onAnyRunway(p[0], p[1], 1.5)) flush(); else seg.push(p); });
    flush();
    // holding position (pattern A) where a taxiway enters a runway strip: 107.5 m from the 21R/03L centre line, 90 m otherwise
    for (const R of RUNWAYS) {
      const hold = 90;
      let prev = null;
      plSample(t.p, 1, (p, d) => {
        const [s, tt] = rwyST(R, p[0], p[1]);
        const inS = s > -50 && s < R.len + 50;
        const v = Math.abs(tt) - hold;
        if (prev !== null && inS && prev * v < 0) {
          (out.holds = out.holds || []).push({ e: p[0], n: p[1], rwy: R.id, s });
          // toward the runway = the way |t| decreases along the taxiway
          const tw = Math.sign((d[1] * R.r[0] + d[0] * R.r[1]) * Math.sign(tt)) > 0 ? -1 : 1;
          const pe = -d[1], pn = d[0];
          for (const [off, dashed] of [[-0.45, false], [-0.15, false], [0.15, true], [0.45, true]]) {
            const c = [p[0] + d[0] * off * tw, p[1] + d[1] * off * tw];
            const hw = TWY_W / 2;   // across the whole taxiway
            if (!dashed) ym.push(ribbonGeo([[c[0] - pe * hw, c[1] - pn * hw], [c[0] + pe * hw, c[1] + pn * hw]], 0.15, { caps: false }));
            else for (let k = -hw; k < hw; k += 1.8) { const k2 = Math.min(k + 0.9, hw); ym.push(ribbonGeo([[c[0] + pe * k, c[1] + pn * k], [c[0] + pe * k2, c[1] + pn * k2]], 0.15, { caps: false })); }
          }
        }
        prev = inS ? v : null;
      });
    }
  }
  addLayer(mergeFlat(ym), yel, -10);

  // ── structures ──
  const B = new Batch();
  const M = {
    concrete: stdMat({ color: lin(0xb9b3a6), roughness: 0.9 }),
    white: stdMat({ color: lin(0xd8d8d2), roughness: 0.7 }),
    grey: stdMat({ color: lin(0x6d7176), roughness: 0.6, metalness: 0.2 }),
    dark: stdMat({ color: lin(0x26292c), roughness: 0.6, metalness: 0.3 }),
    red: stdMat({ color: lin(0xa3241b), roughness: 0.55 }),
    orange: stdMat({ color: lin(0xd2561d), roughness: 0.6 }),
    roof: stdMat({ color: lin(0xc9ccce), roughness: 0.45, metalness: 0.5 }),
    roofDark: stdMat({ color: lin(0x7c8288), roughness: 0.5, metalness: 0.55 }),
    glass: physMat({ color: lin(0x4d6370), roughness: 0.06, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.3, emissive: lin(0xffd8a8), emissiveIntensity: 0 }),
    facade: stdMat({ color: lin(0xe2e2dc), roughness: 0.6 }),
    window: stdMat({ color: lin(0x1b252c), roughness: 0.15, metalness: 0.4, emissive: lin(0xffc27a), emissiveIntensity: 0 }),
    interior: stdMat({ color: lin(0x2b2d2f), roughness: 0.9, emissive: lin(0xfff1d8), emissiveIntensity: 0 }),
    hangar: stdMat({ color: lin(0xb4bcc2), roughness: 0.45, metalness: 0.55 }),
    bld: stdMat({ color: lin(0xc8c2b6), roughness: 0.85 }),
    milbld: stdMat({ color: lin(0xb7b29f), roughness: 0.85 }),
    bridge: stdMat({ color: lin(0xb8bcc0), roughness: 0.5, metalness: 0.4 }),
  };
  out.mats = M;
  const extrude = (outer, holes, h, y0 = 0) => {
    const sh = new THREE.Shape(outer.map(([e, n]) => new THREE.Vector2(e, n)));
    for (const ho of holes || []) sh.holes.push(new THREE.Path(ho.map(([e, n]) => new THREE.Vector2(e, n))));
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return g;
  };
  // offset a polygon outward by d metres (simple vertex-normal offset; fine for the near-rectangular footprints)
  const grow = (P, d) => P.map((p, i) => {
    const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length];
    const n1 = [p[1] - a[1], -(p[0] - a[0])], n2 = [b[1] - p[1], -(b[0] - p[0])];
    const l1 = Math.hypot(...n1) || 1, l2 = Math.hypot(...n2) || 1; const nx = n1[0] / l1 + n2[0] / l2, ny = n1[1] / l1 + n2[1] / l2, l = Math.hypot(nx, ny) || 1;
    const area = P.reduce((s, q, k) => s + q[0] * P[(k + 1) % P.length][1] - P[(k + 1) % P.length][0] * q[1], 0);
    const sg = area > 0 ? -1 : 1;
    return [p[0] + sg * nx / l * d, p[1] + sg * ny / l * d];
  });
  // passenger terminal: main hall (glass curtain wall, overhanging roof) and piers
  for (const h of af.hall) {
    B.add(M.glass, extrude(h.o, h.h, 12));
    B.add(M.facade, extrude(grow(h.o, 0.3), h.h, 5, 12));
    B.add(M.interior, extrude(grow(h.o, -1.2), [], 11.5, 0.3));
    B.add(M.roof, extrude(grow(h.o, 4), [], 2.2, 17));
    B.add(M.concrete, extrude(grow(h.o, 0.8), [], 1.2, 7.4));
  }
  for (const p of af.pier) {
    B.add(M.glass, extrude(p.o, [], 8));
    B.add(M.facade, extrude(grow(p.o, 0.2), [], 3, 8));
    B.add(M.roof, extrude(grow(p.o, 1.5), [], 1.6, 11));
  }
  // other buildings: hangars and warehouses get metal cladding, the rest render plaster
  out.towerCab = null;
  for (const b of af.bld) {
    const mat = b.k === 'h' || b.k === 'w' ? M.hangar : b.k === 'm' ? M.milbld : M.bld;
    B.add(mat, extrude(b.o, [], b.z));
    if (b.k === 'h' || b.k === 'w') B.add(M.roofDark, extrude(grow(b.o, 0.6), [], 0.8, b.z));
  }
  out.terminalPolys = af.hall.map((h) => h.o).concat(af.pier.map((p) => p.o));

  // ── control towers: TWR-S (main tower, aerodrome beacon on top per AIP AD 2.15) and TWR-N (AIS/MET building) ──
  // positions read from the AIP aerodrome chart; heights are estimates (no published figure)
  const tower = (e, n, base, shaft, cab) => {
    const put = (mat, geo) => { geo.translate(e, 0, -n); B.add(mat, geo); };
    put(M.concrete, boxGeo(base[0], base[1], base[2], 0, base[1] / 2, 0));
    put(M.window, boxGeo(base[0] + 0.2, 1.6, base[2] + 0.2, 0, base[1] * 0.6, 0));
    put(M.concrete, cylGeo(4.0, 4.6, shaft, 20, 0, base[1] + shaft / 2 - 1, 0));
    const top = base[1] + shaft - 1;
    for (let i = 0; i < Math.floor(shaft / 3.4) - 1; i++) put(M.window, boxGeo(1.0, 1.2, 8.9, 0, base[1] + 2 + i * 3.4, 0));
    put(M.white, cylGeo(cab + 0.6, 5.0, 1.4, 8, 0, top + 0.7, 0));
    put(M.glass, cylGeo(cab + 1.2, cab, 5.0, 8, 0, top + 3.9, 0, true));
    put(M.interior, cylGeo(cab, cab - 0.4, 4.6, 8, 0, top + 3.9, 0));
    put(M.dark, cylGeo(cab + 1.7, cab + 1.7, 0.8, 8, 0, top + 6.8, 0));
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) * Math.PI / 4; put(M.dark, boxGeo(0.2, 5.0, 0.2, Math.cos(a) * (cab + 0.6), top + 3.9, Math.sin(a) * (cab + 0.6))); }
    put(M.grey, cylGeo(0.07, 0.07, 7, 6, 1.8, top + 10.6, 1.0));
    return { cab: W3(e, n, top + 3.7), top: W3(e, n, top + 14) };
  };
  const twS = tower(-893, -355, [24, 12, 18], 34, 6.0);
  const twN = tower(-254, 929, [34, 18, 22], 12, 5.0);
  out.towerCab = twS.cab; out.towerTop = twS.top; out.towers = [twS, twN];

  // ── navaids: ILS localizer arrays, glide-path masts, PAPI units, approach-light stands, windsocks ──
  const papiGroups = [];
  for (const E of Object.values(RWY_END)) {
    const thrE = E.thr[1], thrN = E.thr[0], ue = E.u[1], un = E.u[0], re = E.r[1], rn = E.r[0];
    const at = (s, t) => [thrE + ue * s + re * t, thrN + un * s + rn * t];
    const yaw = yawFor(E.hdg);
    const put = (mat, geo, s, t, yy = 0, rot = yaw) => { const [x, z] = at(s, t); geo.rotateY(rot); geo.translate(x, yy, -z); B.add(mat, geo); };
    if (E.appr.kind === 'ILS') {
      const [le, ln] = (() => { const p = llToNE(...E.appr.loc); return [p[1], p[0]]; })();
      const g = new THREE.Group();
      for (let k = -12; k <= 12; k++) {
        const x = k * 1.9;
        const geo = boxGeo(0.25, 2.6, 0.25, x, 1.3, 0); geo.rotateY(yaw + Math.PI / 2); geo.translate(le, 0, -ln); B.add(M.grey, geo);
        const ant = boxGeo(0.12, 0.5, 2.4, x, 2.7, 0); ant.rotateY(yaw + Math.PI / 2); ant.translate(le, 0, -ln); B.add(M.white, ant);
      }
      const shelter = boxGeo(4, 2.6, 3, 0, 1.3, -12); shelter.rotateY(yaw + Math.PI / 2); shelter.translate(le, 0, -ln); B.add(M.white, shelter);
      // glide-path mast abeam the aim point, 120 m off the centre line (AIP), on the side away from the other runway
      // glide-path mast between the runways, 120 m off the centre line (AIP); 03L uses the published coordinates
      const side = E.id.endsWith('L') ? 1 : -1;
      let gpS = { '21R': 333, '21L': 320 }[E.id] || E.aim + 15, gpT = side * 120;
      if (E.appr.gp) { const g = llToNE(...E.appr.gp); const dn = g[0] - E.thr[0], de = g[1] - E.thr[1]; gpS = dn * E.u[0] + de * E.u[1]; gpT = dn * E.r[0] + de * E.r[1]; }
      put(M.white, cylGeo(0.16, 0.2, 15, 8, 0, 7.5, 0), gpS, gpT);
      for (const y of [5, 9.5, 14]) put(M.grey, boxGeo(0.4, 1.6, 1.2, -0.5, y, 0), gpS, gpT);
      put(M.red, cylGeo(0.2, 0.2, 0.6, 8, 0, 15.3, 0), gpS, gpT);
      put(M.white, boxGeo(3, 2.6, 2.4, 0, 1.3, 0), gpS, gpT + Math.sign(gpT) * 6);
      out.gpPos = out.gpPos || {}; out.gpPos[E.id] = at(gpS, gpT);
    }
    // PAPI: four units each side of the runway. The trainee's siting choice moves them (setPapiSiting in 20-flight.js),
    // so each end's housings are built at the threshold (s = 0) into a group of their own that out.placePapi slides
    // along u to E.papi (papiOffset in 60-lights.js); papiPos (the light sprites) follows the same way (papiPlace).
    const pb = new Batch();
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
      const t = sd * (E.w / 2 + PAPI_GEOM.off[i]), ang = PAPI_GEOM.ang[i], [x, z] = at(0, t);
      for (const [mat, geo] of [[M.dark, boxGeo(1.2, 0.9, 0.9, 0, 0.45, 0)], [M.grey, boxGeo(1.4, 0.15, 1.1, 0, 0.08, 0)]]) { geo.rotateY(yaw); geo.translate(x, 0, -z); pb.add(mat, geo); }
      out.papiPos.push({ id: E.id, t, e: x, n: z, u: [ue, un], ang });
    }
    const pg = new THREE.Group(); pg.name = `papi ${E.id}`; pb.build(pg); root.add(pg); papiGroups.push({ id: E.id, pg });
    // approach-light stands beyond the pavement (alsStands in 60-lights.js; lights over pavement are inset): for
    // each group of lights a cross-arm as wide as the group on a pole, with two more poles under a crossbar
    for (const { s, hgt, arms } of alsStands(E)) for (const { tc, half, poles } of arms) {
      for (const t of poles) put(M.grey, cylGeo(0.08, 0.1, hgt, 6, 0, hgt / 2, 0), -s, t);
      put(M.grey, boxGeo(0.12, 0.12, 2 * half + 0.6, 0, hgt, 0), -s, tc);
    }
  }
  // move every end's PAPI to the distance in use, RWY_END[id].papi: the housings and the places in papiPos (call
  // lights.placePapi() after it for the light sprites)
  out.placePapi = () => {
    for (const { id, pg } of papiGroups) pg.position.set(...papiOffset(RWY_END[id]));
    out.papiPos.forEach(papiPlace);
  };
  out.placePapi();
  // windsocks (AIP AD 2.15): WDI 1 375 m from THR 21R and 179 m from its centre line between the runways; WDI 2 left of THR 21L
  const sockTex = canvasTex(256, 32, (g, w, h) => { for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#f2f2ee' : '#ec5b13'; g.fillRect(i * w / 5, 0, w / 5, h); } });
  const sockMat = stdMat({ map: sockTex, roughness: 0.8, side: THREE.DoubleSide });
  const E21R = RWY_END['21R'], E21L = RWY_END['21L'];
  const socks = [
    [E21R.thr[1] + E21R.u[1] * 375 - E21R.r[1] * 179, E21R.thr[0] + E21R.u[0] * 375 - E21R.r[0] * 179],
    [E21L.thr[1] + E21L.u[1] * 120 - E21L.r[1] * 158, E21L.thr[0] + E21L.u[0] * 120 - E21L.r[0] * 158],
  ];
  out.sockPos = socks;
  for (const [e, n] of socks) {
    const pole = cylGeo(0.07, 0.1, 6.2, 8, 0, 3.1, 0); pole.translate(e, 0, -n); B.add(M.white, pole);
    const grp = new THREE.Group(); grp.position.set(e, 6.1, -n);
    const sg = new THREE.CylinderGeometry(0.42, 0.16, 3.6, 14, 6, true); sg.rotateZ(Math.PI / 2); sg.translate(1.8, 0, 0);
    const pivot = new THREE.Group(); const sock = new THREE.Mesh(sg, sockMat); sock.castShadow = true; pivot.add(sock); grp.add(pivot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 16), M.grey); ring.rotation.y = Math.PI / 2; pivot.add(ring);
    root.add(grp); out.dyn.socks.push({ grp, pivot, sock });
  }
  // apron floodlight masts between the piers, 90 m off the terminal face (generic 30 m masts)
  out.masts = [];
  {
    const R = RUNWAYS[0];
    for (let s = 2360; s >= 600; s -= 105) {
      const p = rwyEN(R, s, -462);
      if (af.pier.some((q) => pointInPoly(p, q.o) || q.o.some((v) => Math.hypot(v[0] - p[0], v[1] - p[1]) < 30))) continue;
      out.masts.push(p);
      const g = cylGeo(0.3, 0.45, 30, 10, 0, 15, 0); g.translate(p[0], 0, -p[1]); B.add(M.grey, g);
      const hd = boxGeo(3.0, 1.2, 1.2, 0, 30.4, 0); hd.rotateY(yawFor(R.hdg)); hd.translate(p[0], 0, -p[1]); B.add(M.dark, hd);
    }
  }
  B.build(root);
  out.dyn.radar = null;
  return out;
}
