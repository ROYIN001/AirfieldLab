import { M } from './harness.mjs';
import { check, done } from './lib/check.mjs';
const { Flight, SCENARIOS, KT, FT, RAD, FIELD, setActiveRunway } = M;
for (const id of ['21R', '21L', '03L', '03R']) {
  for (const key of ['calm', 'xl']) {
    setActiveRunway(id);
    const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
    let maxLoc = 0;
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (a.h > 20) maxLoc = Math.max(maxLoc, Math.abs(a.locDots)); }
    const td = f.ev.td, sc = f.ev.score();
    console.log(id, key, FIELD.appr, FIELD.ident, 'hdg', FIELD.rwyHdg.toFixed(1), 'crashed', f.crashed, 'td s', td && td.s.toFixed(0), 'tl', td && td.tl.toFixed(1), 'vs', td && td.vsFpm.toFixed(0), 'maxLoc', maxLoc.toFixed(2), 'score', sc && sc.total, 'events', JSON.stringify(f.ev.events));
    check(`autoland ${id} ${key}: no events, score ≥ 85`, !f.crashed && !f.ev.events.length && sc && sc.total >= 85, `score ${sc && sc.total}`);
  }
}
done();
