// ───────────────────────── Bangkok around the airfield: buildings, corridors, trees, parked airliners ─────────────────────────

// city building material: wall colour per instance (or vertex), roof colour from aRoof, procedural windows lit at night
function cityMaterial(vertexColors) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0, vertexColors });
  enhance(m, {
    key: 'city' + (vertexColors ? 'V' : 'I'),
    vert: (v) => v.replace('#include <common>', '#include <common>\nattribute vec3 aRoof; varying vec3 vRoof; varying vec3 vWP; varying vec3 vWN;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vRoof = aRoof;
        #ifdef USE_INSTANCING
          vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        #else
          vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif
        vWN = normalize((vec4(transformedNormal, 0.0) * viewMatrix).xyz);`),
    frag: (f) => f.replace('#include <common>', '#include <common>\nvarying vec3 vRoof; varying vec3 vWP; varying vec3 vWN;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float isRoof = step(0.6, vWN.y);
        vec2 tg = normalize(vec2(-vWN.z, vWN.x) + 1e-5);
        float u = dot(vWP.xz, tg), v = vWP.y;
        vec2 cell = vec2(floor(u / 3.1), floor((v - 0.6) / 3.2));
        vec2 f = vec2(fract(u / 3.1), fract((v - 0.6) / 3.2));
        float win = (1.0 - isRoof) * step(0.22, f.x) * step(f.x, 0.80) * step(0.30, f.y) * step(f.y, 0.80) * step(1.0, v);
        float hw = hash2i(ivec2(cell) + ivec2(int(floor(vWP.x * 0.013)), int(floor(vWP.z * 0.017))) * 37);
        vec3 wall = diffuseColor.rgb * (0.92 + 0.08 * texture2D(uNoise, vWP.xz / 7.0 + v * 0.05).r);
        diffuseColor.rgb = mix(mix(wall, vec3(0.05, 0.06, 0.07), win * 0.85), vRoof, isRoof);
        vec3 winLight = win * step(0.52, hw) * mix(vec3(1.0, 0.72, 0.42), vec3(0.85, 0.92, 1.0), step(0.8, hw));`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += winLight * uNight * 0.55;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.2, win * 0.8);'),
  });
  return m;
}
const WALLS = [[0.80, 0.76, 0.66], [0.86, 0.86, 0.83], [0.71, 0.71, 0.69], [0.86, 0.80, 0.60], [0.82, 0.63, 0.53], [0.63, 0.71, 0.79], [0.67, 0.77, 0.67], [0.76, 0.69, 0.57],
  [0.90, 0.88, 0.84], [0.78, 0.74, 0.70], [0.84, 0.72, 0.58], [0.70, 0.75, 0.72], [0.88, 0.84, 0.74], [0.66, 0.66, 0.68], [0.80, 0.80, 0.78], [0.74, 0.70, 0.62]];
const ROOFS = [[0.55, 0.27, 0.18], [0.50, 0.50, 0.48], [0.28, 0.38, 0.52], [0.78, 0.78, 0.76], [0.30, 0.31, 0.32], [0.55, 0.22, 0.18], [0.30, 0.42, 0.33], [0.62, 0.60, 0.56]];
const srgbC = (c) => new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);

// elevated decks (generic dimensions): Don Mueang Tollway, the SRT viaduct and the BTS line on Phahonyothin Road
const VIADUCT = {
  tollway: { w: 27, top: 15, thick: 2.2, pierEvery: 40, pierW: 2.6, cap: 21 },
  rail: { w: 25, top: 12.5, thick: 2.0, pierEvery: 34, pierW: 2.2, twin: 8 },
  phahon: { w: 10, top: 12, thick: 1.8, pierEvery: 30, pierW: 2.0 },
};

function buildCity(scene, data, field, quality) {
  const root = new THREE.Group(); root.name = 'city'; scene.add(root);
  const out = { root };
  const rnd = makeRng(4242);
  const mats = { inst: cityMaterial(false), vert: cityMaterial(true) };
  out.mats = mats;
  // ── generated buildings (instanced boxes; houses get a gable roof) ──
  // `site` (17-siting.js) holds everything a tree or a generated building must keep clear of: what is mapped, the
  // viaduct decks, the stations and the footbridge, then the buildings kept here. It lives only inside this function:
  // with every kept building in it, it is some 50 MB.
  const af = data.af, cls = landClassArray(data.landIn), stations = stationSites(af);
  const site = mappedSite(af, cls, LAND.in, Object.keys(VIADUCT).map((k) => [af[k], VIADUCT[k].w]), stations);
  let list = decodeBuildings(data.bld);
  if (quality !== 'high') list = list.filter((b, i) => Math.hypot(b.e * 0.9, b.n * 0.55) < 2200 || i % 3 === 0);
  // generated buildings are not mapped ones: none may stand in water, in the middle of a road or a railway, on a
  // mapped building, under a viaduct or a station, in an approach light lane or through an obstacle limitation surface
  ({ kept: list, dropped: out.bldDropped } = siteBuildings(site, list));
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const n = list.length;
  const blds = new THREE.InstancedMesh(box, mats.inst, n);
  const roofA = new Float32Array(n * 3);
  const houses = list.filter((b) => b.kind === 3);
  const gable = (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0, 0.42); s.lineTo(0.5, 0); s.lineTo(-0.5, 0); const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g; })();
  const roofs = new THREE.InstancedMesh(gable, stdMat({ color: 0xffffff, roughness: 0.75 }, { key: 'gable' }), houses.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  let hi = 0;
  list.forEach((b, i) => {
    q.setFromAxisAngle(up, b.yaw); sc.set(b.w, b.h, b.d); p.set(b.e, 0, -b.n);
    m4.compose(p, q, sc); blds.setMatrixAt(i, m4);
    const wall = b.kind === 0 ? [0.72, 0.73, 0.74] : b.kind === 2 ? WALLS[[1, 8, 2, 14][b.col & 3]] : WALLS[b.col];
    blds.setColorAt(i, col.copy(srgbC(wall)));
    const rc = srgbC(b.kind === 0 ? ROOFS[[3, 2, 1, 7][b.col & 3]] : b.kind === 2 ? ROOFS[[1, 4, 7, 1][b.col & 3]] : ROOFS[(b.col * 7 + 3) % ROOFS.length]);
    roofA.set([rc.r, rc.g, rc.b], i * 3);
    if (b.kind === 3) {
      sc.set(b.w * 1.08, Math.min(b.w, b.d) * 1.0, b.d * 1.08); p.set(b.e, b.h, -b.n);
      m4.compose(p, q, sc); roofs.setMatrixAt(hi, m4);
      roofs.setColorAt(hi, col.copy(srgbC(ROOFS[[0, 0, 5, 1, 2, 6][b.col % 6]])));
      hi++;
    }
  });
  box.setAttribute('aRoof', new THREE.InstancedBufferAttribute(roofA, 3));
  blds.instanceMatrix.needsUpdate = true; blds.instanceColor.needsUpdate = true;
  blds.castShadow = quality === 'high'; blds.receiveShadow = true; blds.frustumCulled = false;
  roofs.count = hi; roofs.castShadow = quality === 'high'; roofs.receiveShadow = true; roofs.frustumCulled = false;
  root.add(blds, roofs);
  out.count = n;

  // ── mapped footprints (OpenStreetMap), extruded with per-vertex wall and roof colours ──
  const parts = [];
  const footprint = (o, h, wallC, roofC) => {
    const shp = new THREE.Shape(o.map(([e, nn]) => new THREE.Vector2(e, nn)));
    const g = ni(new THREE.ExtrudeGeometry(shp, { depth: h, bevelEnabled: false })); g.rotateX(-Math.PI / 2);
    g.deleteAttribute('uv');
    const k = g.attributes.position.count, c = new Float32Array(k * 3), r = new Float32Array(k * 3);
    const wc = srgbC(wallC), rc = srgbC(roofC);
    for (let i = 0; i < k; i++) { c.set([wc.r, wc.g, wc.b], i * 3); r.set([rc.r, rc.g, rc.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('aRoof', new THREE.BufferAttribute(r, 3));
    parts.push(g);
  };
  for (const b of data.af.cbld) footprint(b.o, b.z, WALLS[Math.floor(rnd() * WALLS.length)], ROOFS[Math.floor(rnd() * ROOFS.length)]);
  for (const b of data.af.bld) if (b.k === 's' || b.k === 'b') footprint(b.o, b.z, WALLS[Math.floor(rnd() * WALLS.length)], ROOFS[Math.floor(rnd() * ROOFS.length)]);
  if (parts.length) { const g = mergeGeometries(parts, false); const mm = new THREE.Mesh(g, mats.vert); mm.castShadow = mm.receiveShadow = true; root.add(mm); }

  // ── corridors: Don Mueang Tollway over Vibhavadi Rangsit, SRT viaduct with Don Mueang station, BTS on Phahonyothin ──
  const B = new Batch();
  const C = {
    deck: stdMat({ color: lin(0xb3b0a8), roughness: 0.85 }),
    deckTop: stdMat({ color: lin(0x3a3a3a), roughness: 0.9 }),
    pier: stdMat({ color: lin(0xa9a59b), roughness: 0.9 }),
    rail: stdMat({ color: lin(0x4a4642), roughness: 0.95 }),
    roof: stdMat({ color: lin(0xd8dadc), roughness: 0.4, metalness: 0.6 }),
    glass: field.mats.glass, interior: field.mats.interior,
  };
  out.mats.corr = C;
  const segBox = (a, b, w, h, y, mat, along = 0) => {
    const de = b[0] - a[0], dn = b[1] - a[1], l = Math.hypot(de, dn); if (l < 0.5) return;
    const g = new THREE.BoxGeometry(l + along, h, w); g.rotateY(Math.atan2(dn, de)); g.translate((a[0] + b[0]) / 2, y, -(a[1] + b[1]) / 2); B.add(mat, g);
  };
  const offsetPl = (P, d) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; const de = b[0] - a[0], dn = b[1] - a[1], l = Math.hypot(de, dn) || 1; return [p[0] + dn / l * d, p[1] - de / l * d]; });
  const viaduct = (P, { w, top, thick, pierEvery, pierW, twin = 0, cap = 0 }) => {
    for (let i = 0; i + 1 < P.length; i++) {
      segBox(P[i], P[i + 1], w, thick, top - thick / 2, C.deck, 1.5);
      segBox(P[i], P[i + 1], w - 1.2, 0.12, top + 0.06, C.deckTop, 1.5);
    }
    for (const sd of [-1, 1]) { const E = offsetPl(P, sd * (w / 2 - 0.25)); for (let i = 0; i + 1 < E.length; i++) segBox(E[i], E[i + 1], 0.5, 1.1, top + 0.55, C.deck, 0.6); }
    plSample(P, pierEvery, (pt, d) => {
      const yaw = Math.atan2(d[1], d[0]);
      const cols = twin ? [-twin, twin] : [0];
      for (const o of cols) {
        const g = new THREE.BoxGeometry(pierW, top - thick, pierW); g.translate(0, (top - thick) / 2, o); g.rotateY(yaw); g.translate(pt[0], 0, -pt[1]); B.add(C.pier, g);
      }
      if (cap) { const g = new THREE.BoxGeometry(2.0, 1.6, cap); g.translate(0, top - thick - 0.8, 0); g.rotateY(yaw); g.translate(pt[0], 0, -pt[1]); B.add(C.pier, g); }
    });
  };
  viaduct(af.tollway, VIADUCT.tollway);
  viaduct(af.rail, VIADUCT.rail);
  for (let i = 0; i + 1 < af.rail.length; i++) for (const o of [-7.5, -2.5, 2.5, 7.5]) { const E = offsetPl(af.rail, o); segBox(E[i], E[i + 1], 3.0, 0.35, 12.7, C.rail, 0.5); }
  viaduct(af.phahon, VIADUCT.phahon);
  // stations (stationSites in 17-siting.js, where the siting rules already know them): a glass box under a vaulted roof
  for (const { p: center, yaw, len, wid, y0, h, vault, roof, bridge, walk } of stations) {
    const put = (mat, g) => { g.rotateY(yaw); g.translate(center[0], 0, -center[1]); B.add(mat, g); };
    put(C.glass, boxGeo(len, h, wid, 0, y0 + h / 2, 0));
    put(C.interior, boxGeo(len - 2, h - 1, wid - 2, 0, y0 + h / 2, 0));
    const r = new THREE.CylinderGeometry(roof[1] / 2, roof[1] / 2, roof[0], 28, 1, false, 0, Math.PI);
    r.rotateZ(Math.PI / 2); r.scale(1, vault, 1); r.translate(0, y0 + h, 0); put(C.roof, r);
    if (bridge) out.station = center;
    if (!walk) continue;
    // footbridge to Terminal 1 (square to the line, at first-floor level, passing under the tollway deck)
    const [a, end] = walk;
    segBox(a, end, 6, 4.4, 9.2, C.glass); segBox(a, end, WALK_W, 0.5, 11.6, C.roof); segBox(a, end, WALK_W, 0.5, 6.8, C.deck);
    plSample([a, end], 36, (pt) => { const g = boxGeo(1.2, 6.6, 1.2, pt[0], 3.3, -pt[1]); B.add(C.pier, g); });
    out.skywalk = walk;
  }
  B.build(root);

  // ── trees from land use (parks, temples, yards, canal banks), where the siting rules let one stand ──
  const geos = makeTreeGeos();
  const trees = placeTrees(cls, LAND.in, quality, rnd, site);
  const treeMat = stdMat({ vertexColors: true, roughness: 0.92 }, { key: 'tree' });
  for (const [geo, arr] of [[geos.broad, trees.broad], [geos.palm, trees.palm]]) {
    const im = new THREE.InstancedMesh(geo, treeMat, arr.length);
    arr.forEach(([e, nn, s, r, hk], i) => { q.setFromAxisAngle(up, r); sc.set(s, s * hk, s); p.set(e, 0, -nn); m4.compose(p, q, sc); im.setMatrixAt(i, m4); });
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im);
  }
  out.treesDropped = trees.dropped;
  out.trees = trees.broad.length + trees.palm.length; out.bldCount = n;

  // ── parked airliners: contact stands along the piers and rows on the remote aprons ──
  out.parked = buildParkedAirliners(root, af, rnd);
  return out;
}

function landClassArray(bitmap) {
  const c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bitmap, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, out = new Uint8Array(c.width * c.height);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4];
  return out;
}

function makeTreeGeos() {
  const r = makeRng(31);
  const col = (g, c, jit = 0.15) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const k = 1 - jit / 2 + r() * jit; a[i * 3] = c[0] * k; a[i * 3 + 1] = c[1] * k; a[i * 3 + 2] = c[2] * k; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
  const trunk = col(cylGeo(0.22, 0.32, 3.4, 5, 0, 1.7, 0, true), [0.09, 0.065, 0.045]);
  const crown = new THREE.IcosahedronGeometry(1, 0); const cp = crown.attributes.position;
  for (let i = 0; i < cp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(cp, i); const k = 0.82 + r() * 0.36; cp.setXYZ(i, v.x * 3.4 * k, v.y * 2.5 * k, v.z * 3.4 * k); }
  crown.translate(0, 5.0, 0); crown.computeVertexNormals();
  const broad = mergeGeometries([ni(trunk), col(ni(crown), [0.045, 0.095, 0.03], 0.35)]);
  const pt = col(cylGeo(0.14, 0.2, 9, 5, 0, 4.5, 0, true), [0.11, 0.09, 0.07]);
  const fronds = [];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.PlaneGeometry(4.6, 0.8, 3, 1); const fp = f.attributes.position;
    for (let k = 0; k < fp.count; k++) { const x = fp.getX(k) + 2.3; fp.setXYZ(k, x, -0.11 * x * x, fp.getY(k) * (1 - x / 5.5)); }
    f.rotateY((i / 6) * Math.PI * 2 + r() * 0.3); f.translate(0, 9, 0); f.computeVertexNormals();
    fronds.push(col(ni(f), [0.05, 0.10, 0.03], 0.3));
  }
  const palm = mergeGeometries([ni(pt), ...fronds]);
  for (const g of [broad, palm]) { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k); }
  return { broad, palm };
}

// generic, unbranded twin-jet airliner (nose +x, origin at the fuselage mid-point on the ground)
function airlinerGeo(L, span, D) {
  const body = [], fin = [];
  const k = L / 37.6;
  const rad = D / 2, cy = 1.55 * k + rad;
  const add = (arr, g) => arr.push(ni(g));
  const fus = new THREE.CylinderGeometry(rad, rad, L * 0.66, 18); fus.rotateZ(Math.PI / 2); fus.translate(-L * 0.02, cy, 0); add(body, fus);
  const nose = new THREE.SphereGeometry(rad, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2); nose.scale(1, 1.9 * k * 1.3, 1); nose.rotateZ(-Math.PI / 2); nose.translate(L * 0.31, cy - rad * 0.12, 0); add(body, nose);
  const tail = new THREE.CylinderGeometry(rad, rad * 0.25, L * 0.2, 18); tail.rotateZ(Math.PI / 2); tail.translate(-L * 0.45, cy + rad * 0.32, 0); add(body, tail);
  for (const sd of [-1, 1]) {
    const w = new THREE.BoxGeometry(5.2 * k, 0.45 * k, span / 2 - rad); const wp = w.attributes.position;
    for (let i = 0; i < wp.count; i++) { const z = wp.getZ(i), f = (z + (span / 2 - rad) / 2) / (span / 2 - rad); wp.setX(i, wp.getX(i) * (1 - 0.6 * f) - f * span * 0.21); wp.setY(i, wp.getY(i) + f * 1.1 * k); }
    w.translate(-L * 0.03, cy - rad * 0.55, sd * (rad + (span / 2 - rad) / 2)); if (sd < 0) { w.scale(1, 1, 1); } add(body, w);
    const eng = new THREE.CylinderGeometry(1.05 * k * 1.1, 0.9 * k, 4.2 * k, 14); eng.rotateZ(Math.PI / 2); eng.translate(L * 0.06, cy - rad - 0.55 * k, sd * span * 0.165); add(body, eng);
    const st = new THREE.BoxGeometry(2.4 * k, 0.9 * k, 0.3 * k); st.translate(L * 0.03, cy - rad + 0.1, sd * span * 0.165); add(body, st);
    const ht = new THREE.BoxGeometry(2.8 * k, 0.25 * k, 6.4 * k); const hp = ht.attributes.position;
    for (let i = 0; i < hp.count; i++) { const f = Math.abs(hp.getZ(i)) / (6.4 * k); hp.setX(i, hp.getX(i) * (1 - f * 0.5) - f * 3 * k); }
    ht.translate(-L * 0.47, cy + rad * 0.35, sd * 3.4 * k); add(body, ht);
  }
  const vf = new THREE.BoxGeometry(5.0 * k, 6.2 * k, 0.35 * k); const vp = vf.attributes.position;
  for (let i = 0; i < vp.count; i++) { const f = (vp.getY(i) + 3.1 * k) / (6.2 * k); vp.setX(i, vp.getX(i) * (1 - f * 0.55) - f * 3.6 * k); }
  vf.translate(-L * 0.45, cy + rad + 3.0 * k, 0); add(fin, vf);
  const win = new THREE.BoxGeometry(L * 0.5, 0.35 * k, D + 0.04); win.translate(L * 0.02, cy + rad * 0.32, 0);
  return { body: mergeGeometries(body.map((g) => { for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a); return g; })), fin: mergeGeometries(fin), win: ni(win) };
}

function buildParkedAirliners(root, af, rnd) {
  const R = RUNWAYS[0];
  const stands = [];   // {e, n, hdg, wide}
  const tooClose = (e, n, d) => stands.some((s) => Math.hypot(s.e - e, s.n - n) < d);
  const inBuilding = (x) => af.pier.some((p) => pointInPoly(x, p.o)) || af.hall.some((h) => pointInPoly(x, h.o));
  for (const pr of af.pier) {
    const pts = pr.o.map(([e, n]) => rwyST(R, e, n));
    const s0 = Math.min(...pts.map((p) => p[0])), s1 = Math.max(...pts.map((p) => p[0])), t0 = Math.min(...pts.map((p) => p[1])), t1 = Math.max(...pts.map((p) => p[1]));
    if (t1 - t0 < 90) continue;                      // only fingers that reach out toward the runway
    const sc = (s0 + s1) / 2;
    for (let t = t0 + 40; t <= t1 - 8; t += 50) for (const sd of [-1, 1]) {
      // finger half-width at this t from the polygon, then nose ~5 m off the glass
      const wide = rnd() < 0.18;
      const Lac = wide ? 63.7 : 37.6;
      let edge = sc;
      for (let d = 0; d < 80; d += 1) { const [e, n] = rwyEN(R, sc + sd * d, t); if (!pointInPoly([e, n], pr.o)) { edge = sc + sd * d; break; } }
      const s = edge + sd * (5 + Lac / 2 - 2);
      const [e, n] = rwyEN(R, s, t);
      if (inBuilding([e, n]) || tooClose(e, n, 40) || rnd() < 0.15) continue;
      stands.push({ e, n, hdg: sd > 0 ? R.hdg + 180 : R.hdg, wide });
    }
  }
  // remote stands: rows on the north and south aprons, nose toward the terminal side
  const lanes = af.tw.filter((t) => t.k === 'lane');
  const nearLane = (e, n, d) => lanes.some((l) => { for (let i = 0; i + 1 < l.p.length; i++) { const a = l.p[i], b = l.p[i + 1], de = b[0] - a[0], dn = b[1] - a[1], l2 = de * de + dn * dn || 1; const t = clamp(((e - a[0]) * de + (n - a[1]) * dn) / l2, 0, 1); if (Math.hypot(e - a[0] - de * t, n - a[1] - dn * t) < d) return true; } return false; });
  for (const ap of af.apron) {
    if (ap.k === 'mil') continue;
    const pts = ap.o.map(([e, n]) => rwyST(R, e, n));
    const s0 = Math.min(...pts.map((p) => p[0])), s1 = Math.max(...pts.map((p) => p[0])), t0 = Math.min(...pts.map((p) => p[1])), t1 = Math.max(...pts.map((p) => p[1]));
    if (t1 > 0) continue;   // west side only
    for (let s = s0 + 30; s < s1 - 30; s += 46) for (let t = t0 + 30; t < t1 - 30; t += 66) {
      const [e, n] = rwyEN(R, s, t);
      if (!pointInPoly([e, n], ap.o) || inBuilding([e, n]) || tooClose(e, n, 44) || nearLane(e, n, 34) || rnd() < 0.5) continue;
      if (stands.length > 95) continue;
      if (af.pier.some((p) => p.o.some((v) => Math.hypot(v[0] - e, v[1] - n) < 45))) continue;
      stands.push({ e, n, hdg: R.hdg - 90, wide: rnd() < 0.12 });
    }
  }
  const nar = airlinerGeo(37.6, 35.8, 3.95), wid = airlinerGeo(63.7, 60.3, 5.64);
  const white = stdMat({ color: lin(0xe9ebec), roughness: 0.35, metalness: 0.15 }, { key: 'liner' });
  const finM = stdMat({ color: 0xffffff, roughness: 0.4, metalness: 0.1 }, { key: 'linerFin' });
  const winM = stdMat({ color: lin(0x15191d), roughness: 0.2, metalness: 0.3 }, { key: 'linerWin' });
  const FIN = [[0.78, 0.10, 0.10], [0.95, 0.80, 0.10], [0.10, 0.25, 0.55], [0.85, 0.45, 0.10], [0.12, 0.45, 0.30], [0.55, 0.15, 0.45], [0.92, 0.92, 0.92]];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  for (const [geo, sel] of [[nar, stands.filter((s) => !s.wide)], [wid, stands.filter((s) => s.wide)]]) {
    if (!sel.length) continue;
    const mk = (g, mat) => { const im = new THREE.InstancedMesh(g, mat, sel.length); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; root.add(im); return im; };
    const b = mk(geo.body, white), f = mk(geo.fin, finM), w = mk(geo.win, winM);
    sel.forEach((s, i) => {
      q.setFromAxisAngle(up, yawFor(s.hdg)); p.set(s.e, 0, -s.n); m4.compose(p, q, sc);
      b.setMatrixAt(i, m4); f.setMatrixAt(i, m4); w.setMatrixAt(i, m4);
      const c = FIN[Math.floor(rnd() * FIN.length)]; f.setColorAt(i, col.copy(srgbC(c)));
    });
  }
  return stands;
}
