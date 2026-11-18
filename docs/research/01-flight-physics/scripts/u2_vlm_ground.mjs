// U2: Weissinger-type horseshoe vortex lattice with a ground image (ค่าประมาณ, own computation).
// Wing planform from src/70-aircraft.js: chord 2.2 m (0<=y<=0.5), linear taper to 1.0 m at y=5.1, LE sweep 4 deg.
// Axes: x aft, y right, z up. Bound vortex at c/4, control point at 3c/4 (Weissinger), flat wake along +x.
// Ground image: mirror at z=0 with opposite circulation. Tail point: 5.10 m aft of wing MAC c/4, 0.66 m above wing plane.
const N = 60, b = 10.2, s = b / 2, sw = Math.tan(4 * Math.PI / 180);
const chord = (y) => { y = Math.abs(y); return y <= 0.5 ? 2.2 : 2.2 + (1.0 - 2.2) * (y - 0.5) / 4.6; };
const xLE = (y) => { y = Math.abs(y); return y <= 0.5 ? -0.55 : -0.55 + (y - 0.5) * sw; }; // x aft positive, LE root at x=-0.55
// cosine spacing of panel edges
const ye = Array.from({ length: N + 1 }, (_, i) => -s * Math.cos(Math.PI * i / N));
const pan = [];
for (let i = 0; i < N; i++) {
  const ya = ye[i], yb = ye[i + 1], ym = (ya + yb) / 2;
  pan.push({ ya, yb, ym, xa: xLE(ya) + 0.25 * chord(ya), xb: xLE(yb) + 0.25 * chord(yb), xc: xLE(ym) + 0.75 * chord(ym), c: chord(ym), dy: yb - ya });
}
// velocity induced at P by a straight segment A->B with unit circulation (Biot-Savart)
function seg(P, A, B) {
  const r1 = [P[0] - A[0], P[1] - A[1], P[2] - A[2]], r2 = [P[0] - B[0], P[1] - B[1], P[2] - B[2]];
  const cx = r1[1] * r2[2] - r1[2] * r2[1], cy = r1[2] * r2[0] - r1[0] * r2[2], cz = r1[0] * r2[1] - r1[1] * r2[0];
  const c2 = cx * cx + cy * cy + cz * cz; if (c2 < 1e-10) return [0, 0, 0];
  const n1 = Math.hypot(...r1), n2 = Math.hypot(...r2);
  const r0 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const k = (r0[0] * (r1[0] / n1 - r2[0] / n2) + r0[1] * (r1[1] / n1 - r2[1] / n2) + r0[2] * (r1[2] / n1 - r2[2] / n2)) / (4 * Math.PI * c2);
  return [k * cx, k * cy, k * cz];
}
const FAR = 1e4;
function horseshoe(P, p, z) { // trailing legs from far downstream to bound vortex A->B and back to far
  const A = [p.xa, p.ya, z], B = [p.xb, p.yb, z];
  const v1 = seg(P, [FAR, p.ya, z], A), v2 = seg(P, A, B), v3 = seg(P, B, [FAR, p.yb, z]);
  return [v1[0] + v2[0] + v3[0], v1[1] + v2[1] + v3[1], v1[2] + v2[2] + v3[2]];
}
function induced(P, p, h) { // real wing at z=h, image at z=-h with opposite sign; h=Infinity -> free air, wing at z=0
  if (!isFinite(h)) return horseshoe(P, p, 0);
  const v = horseshoe(P, p, h);
  const w = horseshoe(P, p, -h);
  return [v[0] - w[0], v[1] - w[1], v[2] - w[2]];
}
function solve(Am, rhs) { // Gaussian elimination
  const n = rhs.length, A = Am.map((r, i) => [...r, rhs[i]]);
  for (let i = 0; i < n; i++) {
    let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k;
    [A[i], A[m]] = [A[m], A[i]];
    for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let sum = A[i][n]; for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j]; x[i] = sum / A[i][i]; }
  return x;
}
const Sref = pan.reduce((a, p) => a + p.c * p.dy, 0);
const xmac = 0.0 + 0.55 - 0.55; // not used
function run(h) { // h = height of the c/4 line above ground (Infinity = free air). alpha = 1 rad (linear)
  const z = isFinite(h) ? h : 0;
  const A = pan.map(pi => pan.map(pj => induced([pi.xc, pi.ym, z], pj, h)[2]));
  // boundary condition: w_induced + V*alpha = 0 at control points (V=1, alpha=1 rad) ; z-up: freestream has w = -alpha? use magnitude
  const G = solve(A, pan.map(() => -1));  // induced upward velocity = +1 cancels downward normal flow from alpha (sign convention: circulation positive gives lift)
  const CL = 2 * pan.reduce((a, p, i) => a + G[i] * p.dy, 0) / Sref;  // L = rho V Gamma dy, CL = 2 sum(G dy)/S
  // Trefftz plane: induced drag from wake normal-wash at far-field bound by image; evaluate w at bound-vortex midpoints from trailing legs only (x=FAR/2)
  let Di = 0;
  for (let i = 0; i < N; i++) {
    const P = [FAR / 2, pan[i].ym, z]; let w = 0;
    for (let j = 0; j < N; j++) w += G[j] * induced(P, pan[j], h)[2];
    Di += -0.5 * G[i] * w * pan[i].dy; // far wake: induced velocity is twice the bound-plane value; D = 1/2 rho sum Gamma * (-w_T) dy
  }
  const CDi = 2 * Di / Sref;
  return { G, CL, CDi, z };
}
const ac = { x: 0.55 - 0.55 + 0.0, z: 0 };
const xQCmac = -0.55 + 0.25 * 1.675 + 0.0; // approx MAC c/4 x (aft-positive) relative to root LE (-0.55); MAC LE at y=2.30 => x = -0.55+1.8*tan4
const xMACqc = -0.55 + (2.30 - 0.5) * sw + 0.25 * 1.675; // c/4 of MAC in this frame
function tailDownwash(sol, h, dzTail) { // downwash angle per rad of alpha at tail point
  const P = [xMACqc + 5.094, 0, sol.z + dzTail];
  let w = 0; for (let j = 0; j < N; j++) w += sol.G[j] * induced(P, pan[j], h)[2];
  return -w; // positive = downwash (per unit V, per rad alpha) = d eps / d alpha
}
const oge = run(Infinity);
const e_oge = oge.CL ** 2 / (Math.PI * (b * b / Sref) * oge.CDi);
const out = { Sref: +Sref.toFixed(2), AR: +(b * b / Sref).toFixed(3), CLa_OGE: +oge.CL.toFixed(3), e_span: +e_oge.toFixed(3) };
out.deda_tail_OGE = { dz066: +tailDownwash(oge, Infinity, 0.66).toFixed(3), dz030: +tailDownwash(oge, Infinity, 0.30).toFixed(3), dz0: +tailDownwash(oge, Infinity, 0.0).toFixed(3) };
const rows = [];
for (const hb of [0.04, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0, 1.5]) {
  const h = hb * b, sol = run(h);
  const kL = sol.CL / oge.CL;                         // lift ratio at constant alpha
  const kD = (sol.CDi / sol.CL ** 2) / (oge.CDi / oge.CL ** 2); // induced-drag ratio at constant CL
  const r = (dz) => tailDownwash(sol, h, dz) / tailDownwash(oge, Infinity, dz);
  // tail point lowered by pitch attitude theta: dz_eff = 0.66 - 5.1*sin(theta)
  rows.push({ hb, h_m: +h.toFixed(2), kCL_constAlpha: +kL.toFixed(3), kCDi_constCL: +kD.toFixed(3),
    eps_ratio_constAlpha_dz066: +r(0.66).toFixed(3), eps_ratio_constAlpha_dz022: +r(0.66 - 5.1 * Math.sin(5 * Math.PI / 180)).toFixed(3),
    eps_ratio_constCL_dz066: +(r(0.66) / kL).toFixed(3), deda_tail_dz066: +tailDownwash(sol, h, 0.66).toFixed(3) });
}
out.rows = rows;
console.log(JSON.stringify(out, null, 1));
// --- upwash gradient at the propeller disc (x = 3.94 m ahead of CG, 0.42 m above the wing plane), free air
{
  const R = 1.22, xc = -3.94, zc = 0.42; let sum = 0, n = 0, centre = 0;
  for (const rr of [0, 0.25, 0.5, 0.75, 0.95]) for (let k = 0; k < (rr ? 24 : 1); k++) {
    const ps = 2 * Math.PI * k / 24, P = [xc, rr * R * Math.cos(ps), zc + rr * R * Math.sin(ps)];
    let w = 0; for (let j = 0; j < N; j++) w += oge.G[j] * induced(P, pan[j], Infinity)[2];
    const wt = rr ? rr : 0; sum += w * wt; n += wt; if (!rr) centre = w;
  }
  console.log(JSON.stringify({ upwash_prop_deps_u_dalpha: { centre: +centre.toFixed(3), disc_area_weighted: +(sum / n).toFixed(3) } }));
}
