// orev_geo.mjs — independent reviewer (topic 3.9): runway/ILS geometry from the repo's own 15-geo.js
// Run: node orev_geo.mjs /path/to/AirfieldLab
import fs from 'fs';
const root = process.argv[2] || 'repo';
const src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(root + '/src/' + f, 'utf8')).join('\n');
const M = new Function(src + '\nreturn { FIELD, AC, RWY_END, FT, DEG, KT };')();
const { RWY_END, AC, FT, DEG } = M;
for (const id of ['21R', '03L', '21L', '03R']) {
  const E = RWY_END[id];
  const half = Math.atan(105 / E.locDist) / DEG;
  const crsDeg = Math.atan2(E.u[1], E.u[0]) / DEG;   // u = [n,e] landing direction
  console.log(`${id}: kind ${E.appr.kind}, locDist ${E.locDist.toFixed(1)} m, lda ${E.lda?.toFixed?.(0)}, aim ${E.aim.toFixed(1)} m, ` +
    `course width ${(2 * half).toFixed(2)} deg, 1 dot ${(half / 2).toFixed(3)} deg, grid course ${((crsDeg + 360) % 360).toFixed(2)} deg`);
}
console.log('trainer gear (body FRD):', JSON.stringify(AC.gear.map(g => g.b)), 'Vref', AC.Vref, 'Vapp', AC.Vapp);
