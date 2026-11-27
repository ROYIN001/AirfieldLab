// A simulator card (the form acFromCard reads) for a round 2 research type that has no file in data/aircraft/ yet:
// the C152 (11-c152.md), P2006T (12-p2006t.md), PC-9M, PC-7 MkII, T-6A and T-6C (07-turboprop-trainers.md) and the DA40 NG
// (05-da40.md). Plan C2 flies them in test/types.test.mjs for the research tests of those topics (T-LF, T-LG, T-LP-62…65,
// T-LD-41). It makes the card the way tools/aircraft/build_cards.mjs makes the six of plan C1 (same copied leaves,
// same inertia-from-radii rule, same gear.legacy from round 2's buildAC, same stall-warning solve on the sim's own lift
// curve), but writes nothing: no data file, no page entry. The page does not offer these types. The provenance fixes of
// build_cards.mjs `prepare` (the JSBSim citations of the C172 leaves, the DA40 eye point and wheel stations) are not applied:
// they change no number the stall, climb, glide, takeoff and mode tests read.
import { leaf, val, leafPaths, loadType } from '../../docs/research/02-light-aircraft/scripts/lm_lib.mjs';
import { buildAC } from '../../docs/research/02-light-aircraft/scripts/lm_card.mjs';
import { COPIED, anchorStallRows, inertiaLeaves, solveWarn } from '../../tools/aircraft/build_cards.mjs';

const put = (doc, p, l) => { const ks = p.split('.'); let o = doc; for (const k of ks.slice(0, -1)) o = (o[k] ??= {}); o[ks.at(-1)] = l; };
const COPY = new Set(COPIED);
const cache = new Map();

// the research card of `id` (loadType: resolved with its _inherits chain), as a card acFromCard can read
export function researchCard(id) {
  if (cache.has(id)) return structuredClone(cache.get(id));
  const card = loadType(id), doc = {};
  for (const p of leafPaths(card)) if (COPY.has(p)) put(doc, p, structuredClone(leaf(card, p)));
  // the stall end of the KIAS table, as the generator makes it for the six cards (plan C3)
  put(doc, 'speeds.ias_cas', anchorStallRows(leaf(doc, 'speeds.ias_cas'), leaf(card, 'speeds.stall_table')).leaf);
  if (!['Ixx', 'Iyy', 'Izz'].every((k) => typeof val(card, 'airframe.inertia.' + k) === 'number')) {
    for (const [k, l] of Object.entries(inertiaLeaves(card))) put(doc, 'airframe.inertia.' + k, l);
  }
  const lackWhat = COPIED.filter((p) => p !== 'gear.legacy' && !leaf(doc, p));
  if (lackWhat.length) throw new Error(`${id}: the research card has no ${lackWhat.join(', ')}`);
  if (!leaf(doc, 'gear.legacy')) put(doc, 'gear.legacy', { v: buildAC(card).gear, u: 'm FRD, N/m, N s/m, m', scope: 'gear', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'ค่าประมาณ: ขาล้อ 3 ขาจาก buildAC ของ lm_card (test/lib/rcard.mjs)' });
  put(doc, 'airframe.geometry.gsAntenna_pos_FRD', { ...structuredClone(leaf(doc, 'airframe.geometry.eye_pos_FRD')), est: true });
  const legacy = leaf(doc, 'aero.legacy');
  Object.assign(legacy.v, { aWarn: 0, aWarnFlap: 0, aWarnHyst: 0.5, aWarnMinOn: 0.5 });
  const w = solveWarn(doc);
  Object.assign(legacy.v, { aWarn: w.aWarn, aWarnFlap: w.aWarnFlap });
  cache.set(id, doc);
  return structuredClone(doc);
}
