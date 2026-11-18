// u2_vlm_ge.mjs — single-chordwise-row VLM (horseshoes at c/4, control points at 3c/4) with ground image.
// Planform of the trainer taken from the visual model src/70-aircraft.js:137-176 (estimate).
// Earth frame: X forward, Y right, Z up, ground Z = 0. Body pitched nose-up by theta (= alpha, level flight).
const D2R = Math.PI / 180;
const geo = {
  semi: 5.1, yRoot: 0.5, cRoot: 2.2, cTip: 1.0, xLEroot: 0.55, sweepLE: 4 * D2R, dih: 6 * D2R, zRoot: -0.36,
  twRoot: 1.5 * D2R, twTip: -1.0 * D2R,
  tail: { x: -5.10, z: 0.30, semi: 1.85 },   // tail c/4 (approx) and height, body frame, from CG
};
function wingPanels(N = 24) {
  const P = [];
  const ys = []; for (let i = 0; i <= N; i++) ys.push(geo.semi * (1 - Math.cos(Math.PI / 2 * i / N)));  // half-cosine, dense at tip
  for (const side of [1, -1]) for (let i = 0; i < N; i++) {
    const ya = ys[i], yb = ys[i + 1], ym = (ya + yb) / 2;
    const sec = (y) => {
      const f = Math.max(0, (y - geo.yRoot) / (geo.semi - geo.yRoot));
      const c = y < geo.yRoot ? geo.cRoot : geo.cRoot + (geo.cTip - geo.cRoot) * f;
      const xle = y < geo.yRoot ? geo.xLEroot : geo.xLEroot - (y - geo.yRoot) * Math.tan(geo.sweepLE);
      const z = geo.zRoot + Math.max(0, y - geo.yRoot) * Math.tan(geo.dih);
      const tw = y < geo.yRoot ? geo.twRoot : geo.twRoot + (geo.twTip - geo.twRoot) * f;
      return { c, xle, z, tw };
    };
    const sa = sec(ya), sb = sec(yb), sm = sec(ym);
    P.push({ A: [sa.xle - 0.25 * sa.c, side * ya, sa.z], B: [sb.xle - 0.25 * sb.c, side * yb, sb.z],
      C: [sm.xle - 0.75 * sm.c, side * ym, sm.z], c: sm.c, tw: sm.tw, side, dy: yb - ya });
  }
  // keep A→B running left-to-right (+Y) so that positive Gamma = positive lift
  for (const p of P) if (p.side < 0) { const t = p.A; p.A = p.B; p.B = t; }
  return P;
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => Math.hypot(a[0], a[1], a[2]);
function seg(P, A, B) { // unit-strength segment A->B, Biot–Savart
  const r1 = sub(P, A), r2 = sub(P, B), r0 = sub(B, A);
  const c = crs(r1, r2), c2 = dot(c, c); if (c2 < 1e-10) return [0, 0, 0];
  const k = dot(r0, sub(r1.map((v) => v / nrm(r1)), r2.map((v) => v / nrm(r2)))) / (4 * Math.PI * c2);
  return [c[0] * k, c[1] * k, c[2] * k];
}
const FAR = 1e6;
function horseshoe(P, A, B) { // legs trail to -X (downstream, horizontal)
  const Af = [A[0] - FAR, A[1], A[2]], Bf = [B[0] - FAR, B[1], B[2]];
  const v1 = seg(P, Af, A), v2 = seg(P, A, B), v3 = seg(P, B, Bf);
  return [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]];
}
function rotPitch(p, th) { return [p[0] * Math.cos(th) - p[2] * Math.sin(th), p[1], p[0] * Math.sin(th) + p[2] * Math.cos(th)]; }
// solve; hw = height of wing ROOT quarter-chord above ground (m), alpha = body pitch (rad); ground=false -> free air
export function solve({ alpha, hw = 1e4, ground = true, N = 24, tailDz = 0 }) {
  const P0 = wingPanels(N);
  const zr = rotPitch([geo.xLEroot - 0.25 * geo.cRoot, 0, geo.zRoot], alpha)[2];
  const H = hw - zr;  // CG height
  const P = P0.map((p) => {
    const A = rotPitch(p.A, alpha), B = rotPitch(p.B, alpha), C = rotPitch(p.C, alpha);
    A[2] += H; B[2] += H; C[2] += H;
    // panel normal: chord direction (TE-LE) incl. local twist, then pitch
    const ch = rotPitch([-Math.cos(p.tw), 0, -Math.sin(p.tw)], alpha);
    const sp = sub(p.B, p.A); const spu = sp.map((v) => v / nrm(sp));
    let n = crs(spu, ch); if (n[2] < 0) n = n.map((v) => -v);  // sign fixed after: want n pointing up
    // crs(span(+Y), chord(-X)) = +Z ... ok
    return { ...p, A, B, C, n: n.map((v) => v / nrm(n)) };
  });
  const n = P.length, M = Array.from({ length: n }, () => new Float64Array(n)), rhs = new Float64Array(n);
  const Vinf = [-1, 0, 0];   // air moves aft (unit speed)
  const ind = (X, q) => { // induced velocity at X by unit-strength horseshoe q (+ image)
    let v = horseshoe(X, q.A, q.B);
    if (ground) { const Ai = [q.A[0], q.A[1], -q.A[2]], Bi = [q.B[0], q.B[1], -q.B[2]]; const vi = horseshoe(X, Ai, Bi); v = [v[0] - vi[0], v[1] - vi[1], v[2] - vi[2]]; }
    return v;
  };
  for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) M[i][j] = dot(ind(P[i].C, P[j]), P[i].n); rhs[i] = -dot(Vinf, P[i].n); }
  // Gauss elimination
  const G = Float64Array.from(rhs), A = M.map((r) => Float64Array.from(r));
  for (let k = 0; k < n; k++) { let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
    [A[k], A[p]] = [A[p], A[k]]; [G[k], G[p]] = [G[p], G[k]];
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; for (let j = k; j < n; j++) A[i][j] -= f * A[k][j]; G[i] -= f * G[k]; } }
  for (let k = n - 1; k >= 0; k--) { let s = G[k]; for (let j = k + 1; j < n; j++) s -= A[k][j] * G[j]; G[k] = s / A[k][k]; }
  // forces: Kutta–Joukowski on bound segments with local velocity (rho = 1, V = 1)
  let L = 0, S = 0;
  for (let i = 0; i < n; i++) {
    const p = P[i], mid = p.A.map((v, k) => (v + p.B[k]) / 2);
    let vl = [...Vinf]; for (let j = 0; j < n; j++) { // bound-vortex velocity: skip own bound segment
      const q = P[j]; let v = j === i ? [0, 0, 0] : seg(mid, q.A, q.B);
      const Af = [q.A[0] - FAR, q.A[1], q.A[2]], Bf = [q.B[0] - FAR, q.B[1], q.B[2]];
      const t1 = seg(mid, Af, q.A), t3 = seg(mid, q.B, Bf);
      v = [v[0] + t1[0] + t3[0], v[1] + t1[1] + t3[1], v[2] + t1[2] + t3[2]];
      if (ground) { const Ai = [q.A[0], q.A[1], -q.A[2]], Bi = [q.B[0], q.B[1], -q.B[2]]; const vi = horseshoe(mid, Ai, Bi); v = [v[0] - vi[0], v[1] - vi[1], v[2] - vi[2]]; }
      vl = [vl[0] + G[j] * v[0], vl[1] + G[j] * v[1], vl[2] + G[j] * v[2]];
    }
    const F = crs(vl, sub(p.B, p.A)).map((v) => v * G[i]);   // rho*Gamma*(V x dl)
    L += F[2]; S += p.c * p.dy;
  }
  const CL = 2 * L / S;   // q = 1/2
  // induced drag in the Trefftz plane (X = -1e4)
  let Di = 0;
  for (let i = 0; i < n; i++) {
    const p = P[i], T = [-1e4, (p.A[1] + p.B[1]) / 2, (p.A[2] + p.B[2]) / 2];
    let v = [0, 0, 0]; for (let j = 0; j < n; j++) { const vj = ind(T, P[j]); v = [v[0] + G[j] * vj[0], v[1] + G[j] * vj[1], v[2] + G[j] * vj[2]]; }
    // normal to the trailing sheet in the Trefftz plane (span x X)
    const sp = sub(p.B, p.A); const nn = crs([1, 0, 0], sp); const nl = nrm(nn);
    Di += -0.5 * G[i] * dot(v, nn) / nl * nrm([0, sp[1], sp[2]]);
  }
  const CDi = Math.abs(2 * Di / S);
  // downwash at the tail (average over tail span, uniform weight), tail point rotated with body
  let eps = 0; const NT = 9;
  for (let k = 0; k < NT; k++) {
    const yt = -geo.tail.semi + 2 * geo.tail.semi * (k + 0.5) / NT;
    const X = rotPitch([geo.tail.x, yt, geo.tail.z + tailDz], alpha); X[2] += H;
    let v = [0, 0, 0]; for (let j = 0; j < n; j++) { const vj = ind(X, P[j]); v = [v[0] + G[j] * vj[0], v[1] + G[j] * vj[1], v[2] + G[j] * vj[2]]; }
    eps += Math.atan2(-v[2], 1 + v[0]) / NT;   // positive = downwash
  }
  const AR = (2 * geo.semi) ** 2 / S;
  return { CL, CDi, e: CL * CL / (Math.PI * AR * CDi), eps, S, AR, H };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const a1 = 4 * D2R, a2 = 6 * D2R, b = 2 * geo.semi;
  const free1 = solve({ alpha: a1, ground: false }), free2 = solve({ alpha: a2, ground: false });
  const CLa = (free2.CL - free1.CL) / (a2 - a1), deda = (free2.eps - free1.eps) / (a2 - a1);
  console.log(`S=${free1.S.toFixed(2)} AR=${free1.AR.toFixed(2)} CLa(free)=${CLa.toFixed(3)}/rad e=${free2.e.toFixed(3)} deda(free, tail at 4-6deg)=${deda.toFixed(3)} eps@6deg=${(free2.eps / D2R).toFixed(2)}deg`);
  console.log('h/b  | CL ratio @alpha6 | CLa ratio | CDi/CL^2 ratio | eps(6deg) deg | deda | dEps at same CL (deg)');
  const rows = [];
  for (const hb of [0.06, 0.08, 0.1, 0.125, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0, 1.5]) {
    const hw = hb * b;
    const g1 = solve({ alpha: a1, hw }), g2 = solve({ alpha: a2, hw });
    const cla = (g2.CL - g1.CL) / (a2 - a1);
    const kD = (g2.CDi / g2.CL ** 2) / (free2.CDi / free2.CL ** 2);
    const de = (g2.eps - g1.eps) / (a2 - a1);
    // downwash at the same CL as free air at 6 deg: interpolate alpha in ground effect
    const aSame = a1 + (free2.CL - g1.CL) / cla;
    const gs = solve({ alpha: aSame, hw });
    const dEps = (gs.eps - free2.eps) / D2R;
    rows.push({ hb, CLr: g2.CL / free2.CL, CLar: cla / CLa, kD, eps: g2.eps / D2R, deda: de, dEps, dAlpha: (aSame - a2) / D2R });
    console.log(`${hb.toFixed(3)} | ${(g2.CL / free2.CL).toFixed(3)} | ${(cla / CLa).toFixed(3)} | ${kD.toFixed(3)} | ${(g2.eps / D2R).toFixed(2)} | ${de.toFixed(3)} | ${dEps.toFixed(2)} (dAlpha same CL ${((aSame - a2) / D2R).toFixed(2)})`);
  }
  console.log(JSON.stringify({ CLa, deda, eps6: free2.eps / D2R, rows }));
}
