// ───────────────────────── Generic two-seat turboprop trainer (procedural model) ─────────────────────────
// Model axes: +X nose, +Y up, +Z right wing; origin at the centre of gravity. Gear points match the trainer's AC.gear.
// The other types of the training pane (plan C1) fly this same model, fitted to their card by fit(spec) (spec from
// modelSpec in 22-types.js): per-type shapes are later work, and the Thai type note says the picture is generic.

function naca(m, p, t, x) {
  const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
  const yc = m === 0 ? 0 : x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * x - x * x);
  return [yc + yt, yc - yt];
}
// closed airfoil loop for chord fraction [f0, f1] (sharp closure at f1 when f1 < 1)
function airfoilLoop(m, p, t, f0, f1, n = 16) {
  const xs = [];
  for (let i = 0; i <= n; i++) { const b = (1 - Math.cos((i / n) * Math.PI)) / 2; xs.push(f0 + (f1 - f0) * b); }
  const up = xs.map((x) => [x, naca(m, p, t, Math.max(x, 1e-4))[0]]), lo = xs.map((x) => [x, naca(m, p, t, Math.max(x, 1e-4))[1]]);
  const loop = [...up.slice().reverse(), ...lo.slice(1)];      // TE(up) → LE → TE(low)
  loop.push(loop[0]);                                          // close the spar face
  return loop;
}
// loft between sections; each section: {x (LE), y, z, c (chord), tw (twist rad)}; loop in chord units
function loftWing(sections, loop, flip = false) {
  const pos = [], idx = [], nL = loop.length, nS = sections.length;
  for (const sc of sections) {
    const ct = Math.cos(sc.tw), st = Math.sin(sc.tw);
    for (const [u, v] of loop) {
      const x0 = -u * sc.c, y0 = v * sc.c;            // chord runs aft (−X)
      pos.push(sc.x + x0 * ct - y0 * st, sc.y + x0 * st + y0 * ct, sc.z);
    }
  }
  for (let s = 0; s < nS - 1; s++) for (let i = 0; i < nL - 1; i++) {
    const a = s * nL + i, b = a + 1, c = a + nL, d = c + 1;
    if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const cap = (s, rev) => { const base = s * nL, cIdx = pos.length / 3; let cx = 0, cy = 0, cz = 0; for (let i = 0; i < nL; i++) { cx += pos[(base + i) * 3]; cy += pos[(base + i) * 3 + 1]; cz += pos[(base + i) * 3 + 2]; } pos.push(cx / nL, cy / nL, cz / nL); for (let i = 0; i < nL - 1; i++) { if (rev) idx.push(cIdx, base + i + 1, base + i); else idx.push(cIdx, base + i, base + i + 1); } };
  cap(0, !flip); cap(nS - 1, flip);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const gn = ni(g); gn.computeVertexNormals();
  return gn;
}

function fuselageGeo() {
  const st = [ // x, half-width, top, bottom
    [3.72, 0.33, 0.40, -0.30], [3.45, 0.43, 0.47, -0.42], [2.85, 0.50, 0.52, -0.52], [2.10, 0.52, 0.56, -0.56], [1.60, 0.54, 0.59, -0.58],
    [0.90, 0.55, 0.61, -0.58], [0.10, 0.55, 0.62, -0.56], [-0.80, 0.53, 0.60, -0.50], [-1.60, 0.48, 0.56, -0.42], [-2.60, 0.40, 0.50, -0.30],
    [-3.60, 0.32, 0.44, -0.18], [-4.60, 0.24, 0.38, -0.05], [-5.40, 0.16, 0.33, 0.06], [-6.00, 0.07, 0.28, 0.14], [-6.12, 0.02, 0.23, 0.18],
  ];
  const seg = 32, pos = [], idx = [];
  for (const [x, hw, top, bot] of st) {
    const cy = (top + bot) / 2, ry = (top - bot) / 2;
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), n = 2.4;
      const sx = Math.sign(c) * Math.pow(Math.abs(c), 2 / n), sy = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      pos.push(x, cy + ry * sy, hw * sx);
    }
  }
  for (let i = 0; i < st.length - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + 1, c = a + seg + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeVertexNormals(); return g;
}

// group whose local +Z is the hinge axis from p0 to p1; child pivot rotates about it
function hingeGroup(p0, p1, geo) {
  const grp = new THREE.Group(); grp.position.copy(p0);
  const axis = new THREE.Vector3().subVectors(p1, p0).normalize();
  grp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
  const inv = grp.quaternion.clone().invert();
  const pa = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).sub(p0).applyQuaternion(inv); pa.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const pivot = new THREE.Group(); grp.add(pivot);
  return { grp, pivot };
}

const PAINT_FRAG = /* glsl */`
vec3 o = vObj; float az = abs(o.z);
#define BX(x, a, b) (step(a, x) * step(x, b))
vec3 c = vec3(0.80, 0.81, 0.82);
float fus = step(az, 0.62) * step(o.y, 0.75) * step(-4.4, o.x) + step(az, 0.62) * step(o.x, -4.4) * step(o.y, 0.36);
float orange = fus * (BX(o.x, -4.15, -3.5) + BX(o.x, 3.25, 3.8)) + BX(az, 4.3, 6.0) + step(1.62, o.y) + step(o.x, -4.3) * BX(az, 1.48, 2.2) * step(o.y, 0.6);
float navy = fus * BX(o.y, -0.17, -0.03) * BX(o.x, -5.7, 3.25);
float glare = fus * step(0.30, o.y) * BX(o.x, 1.62, 3.25) * step(az, 0.40);
c = mix(c, vec3(0.72, 0.13, 0.02), min(orange, 1.0));
c = mix(c, vec3(0.02, 0.05, 0.15), navy);
c = mix(c, vec3(0.015, 0.015, 0.016), glare);
diffuseColor.rgb = c;
float paintRough = mix(0.32, 0.85, glare);
`;

function buildAircraft() {
  // group: placed at the CG by the app; body: raised by fit(spec).lift; root: every mesh (hidden in the cockpit view of
  // a fitted type), with the aircraft's lights beside it in body
  const group = new THREE.Group(); group.name = 'aircraft';
  const body = new THREE.Group(); group.add(body);
  const root = new THREE.Group(); root.name = 'trainer'; body.add(root);
  const paint = physMat({ color: 0xffffff, roughness: 0.32, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.18 }, {
    key: 'paint', vert: (v) => v.replace('#include <common>', '#include <common>\nvarying vec3 vObj;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;'),
    frag: (f) => f.replace('#include <common>', '#include <common>\nvarying vec3 vObj;').replace('#include <map_fragment>', PAINT_FRAG).replace('#include <roughnessmap_fragment>', 'float roughnessFactor = paintRough;'),
  });
  const M = {
    paint,
    dark: stdMat({ color: lin(0x17191b), roughness: 0.55, metalness: 0.2 }),
    metal: stdMat({ color: lin(0x9ea4a8), roughness: 0.32, metalness: 0.9 }),
    tire: stdMat({ color: lin(0x0d0d0e), roughness: 0.9 }),
    prop: stdMat({ color: lin(0x1a1a1a), roughness: 0.5 }),
    yellow: stdMat({ color: lin(0xe0b412), roughness: 0.5 }),
    glass: physMat({ color: lin(0x6f8796), roughness: 0.03, metalness: 0, transparent: true, opacity: 0.32, envMapIntensity: 1.8, clearcoat: 1, depthWrite: false }),
    helmet: stdMat({ color: lin(0xdedede), roughness: 0.35 }),
    visor: stdMat({ color: lin(0x0b0b0d), roughness: 0.08, metalness: 0.6 }),
    exhaust: stdMat({ color: lin(0x3b3330), roughness: 0.5, metalness: 0.7 }),
    lens: stdMat({ color: lin(0xffffff), emissive: lin(0xffffff), emissiveIntensity: 0.6, roughness: 0.2 }),
  };
  const parts = {};
  const add = (geo, mat, parent = root, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  // fuselage, spinner, cowl details
  add(fuselageGeo(), M.paint);
  const spin = new THREE.LatheGeometry(Array.from({ length: 12 }, (_, i) => { const u = i / 11; return new THREE.Vector2(0.27 * Math.sqrt(1 - u * u * 0.98), u * 0.48); }), 24);
  spin.rotateZ(-Math.PI / 2); spin.translate(3.66, 0.06, 0);
  const propGroup = new THREE.Group(); root.add(propGroup);
  add(spin, M.dark, propGroup);
  for (const z of [-0.47, 0.47]) { const e = cylGeo(0.075, 0.09, 0.35, 10, 0, 0, 0); e.rotateX(Math.PI / 2 * Math.sign(z) * 0.6); e.translate(3.0, -0.05, z * 1.04); add(e, M.exhaust); }
  // canopy + frame + glare shield + pilots
  const can = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2); can.scale(1.5, 0.64, 0.46); can.translate(0.18, 0.56, 0);
  const canMesh = add(can, M.glass, root, false); canMesh.renderOrder = 5;
  for (const x of [1.58, 0.22, -0.88]) {
    const k = Math.sqrt(Math.max(0, 1 - ((x - 0.18) / 1.5) ** 2));
    const pts = Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI; return new THREE.Vector3(x, 0.56 + 0.64 * k * Math.sin(a) + 0.004, 0.46 * k * Math.cos(a)); });
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, x > 1 ? 0.016 : 0.02, 6, false), M.dark);
  }
  add(boxGeo(0.35, 0.12, 0.82, 1.42, 0.62, 0), M.dark);
  const helmets = [];
  for (const [x, y] of [[0.92, 0.86], [-0.42, 0.95]]) {
    const hg = new THREE.Group(); hg.position.set(x, y, 0);
    add(new THREE.SphereGeometry(0.135, 16, 12), M.helmet, hg);
    const v = new THREE.SphereGeometry(0.14, 16, 8, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.35, Math.PI * 0.3); v.rotateY(Math.PI / 2); add(v, M.visor, hg);
    add(boxGeo(0.25, 0.32, 0.36, -0.05, -0.28, 0), M.dark, hg);
    root.add(hg); helmets.push(hg);
  }
  parts.helmets = helmets;
  // wings (NACA 4415 root → 4412 tip), dihedral 6°, LE sweep 4°
  const span = 5.1, zr = 0.5, yr = -0.36, dih = Math.tan(6 * DEG), sw = Math.tan(4 * DEG);
  const sec = (z) => { const f = (z - zr) / (span - zr); return { x: 0.55 - (z - zr) * sw, y: yr + (z - zr) * dih, z, c: lerp(2.2, 1.0, f), tw: lerp(1.5, -1.0, f) * DEG, t: lerp(0.15, 0.12, f) }; };
  const zf = 2.85, za = 4.85;
  const wingGeos = [], surf = {};
  for (const side of [1, -1]) {
    const mk = (z0, z1, f0, f1, n) => { const ss = Array.from({ length: n + 1 }, (_, i) => { const s = sec(z0 + (z1 - z0) * i / n); return { ...s, z: s.z * side }; }); return loftWing(ss, airfoilLoop(0.04, 0.4, 0.14, f0, f1), side > 0); };
    wingGeos.push(mk(zr, zf, 0, 0.74, 3), mk(zf, za, 0, 0.74, 3), mk(za, span, 0, 1, 2));
    // wing tip fairing
    for (const which of ['flap', 'ail']) {
      const [z0, z1] = which === 'flap' ? [zr + 0.25, zf - 0.03] : [zf + 0.03, za];
      const ss = [sec(z0), sec(z1)].map((s) => ({ ...s, z: s.z * side }));
      const g = loftWing(ss, airfoilLoop(0.04, 0.4, 0.14, 0.75, 1.0, 8), side > 0);
      const h0 = new THREE.Vector3(ss[0].x - 0.75 * ss[0].c, ss[0].y + 0.01, ss[0].z), h1 = new THREE.Vector3(ss[1].x - 0.75 * ss[1].c, ss[1].y + 0.01, ss[1].z);
      const hgp = side > 0 ? hingeGroup(h0, h1, g) : hingeGroup(h1, h0, g);
      add(g, M.paint, hgp.pivot); root.add(hgp.grp);
      surf[which + (side > 0 ? 'R' : 'L')] = hgp.pivot;
    }
  }
  for (const g of wingGeos) add(g, M.paint);
  // horizontal tail and elevator
  const hsec = (z) => { const f = Math.abs(z) / 1.85; return { x: -4.70 - Math.abs(z) * 0.18, y: 0.30, z, c: lerp(1.25, 0.72, f), tw: 0, t: 0.1 }; };
  for (const side of [1, -1]) {
    const ss = [0.2, 1.85].map((z) => hsec(z * side));
    add(loftWing(ss, airfoilLoop(0, 0.4, 0.1, 0, 0.64), side > 0), M.paint);
  }
  {
    const ss = [-1.85, -0.0, 1.85].map((z) => hsec(z));
    const g = loftWing(ss, airfoilLoop(0, 0.4, 0.1, 0.65, 1.0, 8), true);
    const h0 = new THREE.Vector3(ss[0].x - 0.65 * ss[0].c, 0.30, -1.85), h1 = new THREE.Vector3(ss[2].x - 0.65 * ss[2].c, 0.30, 1.85);
    const hg = hingeGroup(h0, h1, g);
    add(g, M.paint, hg.pivot); root.add(hg.grp); surf.elev = hg.pivot;
  }
  // vertical fin and rudder (fin as a wing standing on its root: y ↔ z)
  {
    const finSec = (h) => ({ x: -4.45 - h * 0.62, y: 0, z: h, c: lerp(1.55, 0.8, h / 1.75), tw: 0, t: 0.11 });
    const toFin = (g) => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), z = pa.getZ(i); pa.setXYZ(i, pa.getX(i), 0.34 + z, -y); } g.computeVertexNormals(); return g; };
    add(toFin(loftWing([0, 0.9, 1.75].map(finSec), airfoilLoop(0, 0.4, 0.11, 0, 0.66), true)), M.paint);
    const rg = toFin(loftWing([0.05, 1.7].map(finSec), airfoilLoop(0, 0.4, 0.11, 0.67, 1.0, 8), true));
    const p0 = new THREE.Vector3(finSec(0.05).x - 0.67 * finSec(0.05).c, 0.39, 0), p1 = new THREE.Vector3(finSec(1.7).x - 0.67 * finSec(1.7).c, 2.04, 0);
    const hg = hingeGroup(p0, p1, rg); add(rg, M.paint, hg.pivot); root.add(hg.grp); surf.rud = hg.pivot;
    const dorsal = new THREE.BufferGeometry();
    dorsal.setAttribute('position', new THREE.Float32BufferAttribute([-2.9, 0.47, 0.06, -4.5, 0.36, 0.06, -4.5, 0.78, 0.0, -2.9, 0.47, -0.06, -4.5, 0.78, 0.0, -4.5, 0.36, -0.06], 3)); dorsal.computeVertexNormals();
    add(dorsal, M.paint);
  }
  // propeller: 4 blades + blur disc
  const blades = new THREE.Group(); blades.position.set(3.94, 0.06, 0); propGroup.add(blades);
  for (let i = 0; i < 4; i++) {
    const bg = new THREE.BoxGeometry(0.06, 0.92, 0.2, 1, 8, 1); const pa = bg.attributes.position;
    for (let k = 0; k < pa.count; k++) { const y = pa.getY(k) + 0.46, tw = lerp(0.9, 0.25, y / 0.92), w = lerp(1.0, 0.55, y / 0.92); const x = pa.getX(k), z = pa.getZ(k) * w; pa.setXYZ(k, x * Math.cos(tw) - z * Math.sin(tw), y + 0.2, x * Math.sin(tw) + z * Math.cos(tw)); }
    bg.computeVertexNormals(); bg.rotateX((i / 4) * Math.PI * 2);
    add(bg, M.prop, blades);
    const tip = boxGeo(0.065, 0.1, 0.12, 0, 1.08, 0); tip.rotateX((i / 4) * Math.PI * 2); add(tip, M.yellow, blades, false);
  }
  const discMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uA: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform float uA; void main(){ float r = length(vUv - 0.5) * 2.0; if (r > 1.0 || r < 0.2) discard; float a = 0.16 * (1.0 - smoothstep(0.85, 1.0, r)) + 0.35 * smoothstep(0.86, 0.9, r) * (1.0 - smoothstep(0.95, 1.0, r)); vec3 c = mix(vec3(0.03), vec3(0.75, 0.6, 0.1), smoothstep(0.86, 0.9, r)); gl_FragColor = vec4(c, a * uA); }',
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), discMat); disc.rotation.y = Math.PI / 2; disc.position.set(3.95, 0.06, 0); disc.renderOrder = 6;
  root.add(disc);
  // landing gear with hinges (retract animation) and nose-wheel steering
  const wheel = (r, w) => { const g = cylGeo(r, r, w, 20, 0, 0, 0); g.rotateX(Math.PI / 2); return g; };
  const gear = {};
  for (const side of [1, -1]) {
    const leg = new THREE.Group(); leg.position.set(-0.35, -0.36, 1.55 * side);
    add(cylGeo(0.05, 0.05, 0.72, 8, 0, -0.36, 0), M.metal, leg);
    add(cylGeo(0.065, 0.065, 0.3, 8, 0, -0.2, 0), M.metal, leg);
    const w = add(wheel(0.29, 0.16), M.tire, leg); w.position.set(0, -0.73, 0.1 * side);
    const hub = add(wheel(0.14, 0.17), M.metal, leg); hub.position.set(0, -0.73, 0.1 * side);
    root.add(leg); gear['main' + (side > 0 ? 'R' : 'L')] = leg;
  }
  {
    const leg = new THREE.Group(); leg.position.set(2.3, -0.5, 0);
    const steer = new THREE.Group(); leg.add(steer);
    add(cylGeo(0.045, 0.045, 0.66, 8, 0, -0.33, 0), M.metal, steer);
    const fork = boxGeo(0.06, 0.26, 0.2, 0, -0.62, 0); add(fork, M.metal, steer);
    const w = add(wheel(0.22, 0.13), M.tire, steer); w.position.set(0, -0.64, 0);
    root.add(leg); gear.nose = leg; gear.steer = steer;
  }
  // small details: antennas, pitot, beacon housings
  add(boxGeo(0.25, 0.22, 0.03, -2.2, 0.62, 0), M.dark);
  add(boxGeo(0.2, 0.18, 0.03, -1.2, -0.62, 0), M.dark);
  const pitot = cylGeo(0.012, 0.012, 0.5, 6, 0, 0, 0); pitot.rotateZ(Math.PI / 2); pitot.translate(0.35, -0.12, -3.9); add(pitot, M.metal, root, false);
  // aircraft lights
  const wy = yr + (span - zr) * dih;
  const LS = new LightSet();
  LS.add([0.05, wy, -5.15], { kind: 0, a: [1, 0.05, 0.03], I: 0.55, cat: 3, day: 1.6 });
  LS.add([0.05, wy, 5.15], { kind: 0, a: [0.1, 1, 0.3], I: 0.55, cat: 3, day: 1.6 });
  LS.add([-6.13, 0.24, 0], { kind: 0, a: [1, 1, 1], I: 0.4, cat: 3, day: 1.4 });
  LS.add([-0.05, wy, -5.15], { kind: 7, a: [1, 1, 1], I: 7, param: 0, cat: 3, day: 1.2 });
  LS.add([-0.05, wy, 5.15], { kind: 7, a: [1, 1, 1], I: 7, param: 0, cat: 3, day: 1.2 });
  LS.add([-2.0, 0.66, 0], { kind: 8, a: [1, 0.08, 0.03], I: 1.6, param: 0, cat: 3, day: 1.4 });
  LS.add([-1.0, -0.6, 0], { kind: 8, a: [1, 0.08, 0.03], I: 1.6, param: 0.5, cat: 3, day: 1.4 });
  for (const z of [-1.15, 1.15]) LS.add([0.62, -0.30, z], { kind: 9, a: [1, 0.97, 0.9], I: 3.5, cat: 3, day: 0.8 });
  const lmat = makeLightMaterial();
  const lpts = LS.build(lmat); body.add(lpts);
  // landing light that actually lights the runway
  const land = new THREE.SpotLight(0xfff4e6, 0, 900, 11 * DEG, 0.55, 2);
  land.position.set(0.7, -0.3, 0); land.target.position.set(60, -5, 0);
  body.add(land, land.target);

  // A twin's engines (fit): per engine a nacelle, a spinner, three blades and a blur disc at the card's engine position
  // (model axes), built once per layout and kept. The nose propeller's blades and disc hide; its spinner stays as the
  // nose cone (the fuselage is open at the front).
  const twinCache = new Map();
  function nacelles(list) {
    const key = JSON.stringify(list);
    if (twinCache.has(key)) return twinCache.get(key);
    const g = new THREE.Group(); g.name = 'nacelles'; const units = [];
    for (const [x, y, z] of list) {
      const shell = new THREE.LatheGeometry([[0.05, -2.05], [0.2, -1.8], [0.3, -1.0], [0.3, -0.35], [0.22, -0.05]].map(([r, h]) => new THREE.Vector2(r, h)), 20);
      shell.rotateZ(-Math.PI / 2); shell.translate(x, y, z); add(shell, M.paint, g);
      const sp = new THREE.LatheGeometry(Array.from({ length: 8 }, (_, i) => { const u = i / 7; return new THREE.Vector2(0.22 * Math.sqrt(1 - u * u * 0.98), u * 0.3); }), 16);
      sp.rotateZ(-Math.PI / 2); sp.translate(x - 0.05, y, z); add(sp, M.dark, g);
      const bl = new THREE.Group(); bl.position.set(x + 0.1, y, z); g.add(bl);
      for (let i = 0; i < 3; i++) { const b = boxGeo(0.05, 0.85, 0.16, 0, 0.5, 0); b.rotateX((i / 3) * Math.PI * 2); add(b, M.prop, bl); }
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.93, 48), discMat); d.rotation.y = Math.PI / 2; d.position.set(x + 0.12, y, z); d.renderOrder = 6; g.add(d);
      units.push({ blades: bl, disc: d });
    }
    const t = { group: g, units }; twinCache.set(key, t); return t;
  }
  let flapDeg = 38, retract = true, twin = null;

  const api = {
    group, body, root, parts, surf, gear, blades, disc, discMat, helmets, lights: lpts, lightMat: lmat, land, M, spec: null,
    pose(state) { // state: {de, da, dr, flaps, gear, steer, prop (rad), rpmVisible}
      const { de = 0, da = 0, dr = 0, flaps = 0, gearPos = 1, steer = 0 } = state;
      // every hinge axis points toward +Z, so +rotation is trailing edge down on both wings
      if (surf.ailR) surf.ailR.rotation.z = -da; if (surf.ailL) surf.ailL.rotation.z = da;
      const fd = flaps * flapDeg * DEG; if (surf.flapR) surf.flapR.rotation.z = fd; if (surf.flapL) surf.flapL.rotation.z = fd;
      if (surf.elev) surf.elev.rotation.z = de;
      if (surf.rud) surf.rud.rotation.z = -dr;
      const r = retract ? (1 - gearPos) * Math.PI / 2 : 0;
      gear.mainR.rotation.x = r; gear.mainL.rotation.x = -r; gear.nose.rotation.z = -r;
      gear.steer.rotation.y = -steer;
    },
    spin(rad, running) {
      blades.rotation.x = rad; blades.visible = !running && !twin; disc.visible = running && !twin;
      if (twin) for (const u of twin.units) { u.blades.rotation.x = rad; u.blades.visible = !running; u.disc.visible = running; }
    },
    // Fitted to a type (plan C1): spec { lift, flapDeg, retract, engines, hideInCockpit } from modelSpec, null = the
    // trainer as built (lift 0, flaps 38°, retracting gear, nose propeller).
    fit(spec) {
      api.spec = spec || null;
      body.position.y = spec ? spec.lift : 0;
      flapDeg = spec ? spec.flapDeg : 38; retract = spec ? spec.retract : true;
      if (twin) root.remove(twin.group);
      twin = spec && spec.engines.length > 1 ? nacelles(spec.engines) : null;
      if (twin) root.add(twin.group);
      api.inCockpit(false);
      return api;
    },
    // the cockpit view: the trainer hides its front helmet, a fitted type with hideInCockpit its whole model (the
    // trainer's canopy and helmets would stand around the card's eye point); the lights stay
    inCockpit(on) { helmets[0].visible = !on; root.visible = !(on && api.spec && api.spec.hideInCockpit); },
  };
  api.pose({ flaps: 1 });
  return api;
}

// static copy for the apron (shares geometry and materials; no lights, no crew, flaps up)
function cloneParked(ac) {
  ac.pose({ flaps: 0 });
  const g = ac.group.clone(true);
  ac.pose({ flaps: 1 });
  const hide = [];
  g.traverse((o) => {
    if (o.isPoints || o.isSpotLight) hide.push(o);
    if (o.isMesh && o.material === ac.discMat) hide.push(o);
    if (o.isMesh && o.material === ac.M.helmet && o.parent) hide.push(o.parent);
  });
  hide.forEach((o) => (o.visible = false));
  return g;
}
