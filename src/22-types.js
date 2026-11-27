// ───────────────────────── Aircraft types of the training pane (plan C1) ─────────────────────────
// Pure (no DOM): test/cards.test.mjs evaluates this file alone with new Function, as test/keys.test.mjs does 18-keys.js.
// It holds the selector order, the Thai sentence frames and type names, and how the generic 3D model of 70-aircraft.js
// is fitted to a type. Research round 2 task item 10 (docs/research/02-light-aircraft.md) and 02-thai-schools.md
// (T-LS-03, T-LS-11). Schools, counts, bases and the register date come from the card's thai_fleet leaf (built by
// tools/aircraft/build_cards.mjs from common_light.thai_fleet: civil schools and clubs only), speeds and gear from
// acFromCard (20-flight.js), so no number of a card is copied into code. No AIP fact lives here.

// Owner decision OD-TYPES (plan C1): the fictional trainer first (the default, and the only aircraft of the explore
// mode), then the C172S, the type most Thai civil schools fly (T-LS-03, T-LS-11 (ก)), and the other five round 2 cards.
// There is no DA40 NG: no Thai civil school has one (02-thai-schools.md §02.5.3, T-LS-11 (ข)).
const AIRCRAFT_TYPES = ['trainer', 'c172s', 'c172r', 'da42ng', 'da42_tae125', 'da40d', 'da40_180'];

// name: the selector and the brief; desc: the start of the setup lede; note: the type's own line in the notes
const TYPE_TEXT = {
  trainer: { name: 'เครื่องฝึกสมมติ' },
  c172s: { name: 'Cessna 172S Skyhawk SP', desc: 'Cessna 172S เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกสูง' },
  c172r: { name: 'Cessna 172R Skyhawk', desc: 'Cessna 172R เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกสูง' },
  da42ng: { name: 'Diamond DA42 NG', desc: 'Diamond DA42 NG เครื่องยนต์ดีเซลสองเครื่อง', note: 'ซิมยังไม่จำลองเครื่องยนต์ดับข้างเดียว' },
  da42_tae125: { name: 'Diamond DA42 (TAE 125)', desc: 'Diamond DA42 (TAE 125) เครื่องยนต์ดีเซลสองเครื่อง', note: 'ซิมยังไม่จำลองเครื่องยนต์ดับข้างเดียว' },
  da40d: { name: 'Diamond DA40 D', desc: 'Diamond DA40 D เครื่องยนต์ดีเซลหนึ่งเครื่อง ปีกต่ำ', note: 'โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG' },
  da40_180: { name: 'Diamond DA40 (IO-360)', desc: 'Diamond DA40 (IO-360) เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกต่ำ', note: 'โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG' },
};
const TRAINER_LEDE = 'เครื่องฝึกใบพัดเทอร์โบสองที่นั่ง (แบบสมมติ) เริ่มบนแนวร่อน 3° ใส่ล้อและแฟลปลงจอดแล้ว';
const TRAINER_NOTES = [
  'เครื่องฝึกเทอร์โบพร็อปสองที่นั่งแบบสมมติของ AirfieldLab ไม่ใช่เครื่องบินของผู้ผลิตจริง ค่าทุกตัวเป็นค่าประมาณ',
  'โรงเรียนการบินพลเรือนในไทยไม่มีเครื่องฝึกเทอร์โบพร็อป',
];
// T-LS-11 (ค): a light aircraft on the Don Mueang approach is a made-up scene (02-thai-schools.md §02.4.2: Thai schools
// train at regional fields; the AIP names no school that trains at VTBD)
const SCENARIO_NOTE = 'สถานการณ์สมมติ: โรงเรียนการบินในไทยฝึกที่สนามภูมิภาค ไม่ได้ฝึกวงจรที่ดอนเมืองเป็นประจำ';
const MODEL_NOTE = 'ภาพเครื่องบินในฉากเป็นแบบทั่วไป ไม่ใช่รูปทรงจริงของแบบนี้';
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thaiDate = (iso) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(String(iso)); return m ? `${+m[3]} ${TH_MONTH[+m[2] - 1]} ${m[1]}` : String(iso); };
// the landing detent: the entry of aero.flaps.detents with the largest flap_deg (as acFromCard reads it)
const landingDetent = (card) => card.aero.flaps.detents.v.reduce((a, d) => (d.flap_deg > a.flap_deg ? d : a));

// The Thai text of a type: { name, em, span, lede, notes, links: [{ text, href }], real }. card is the parsed
// data/aircraft/<id>.json and ac what acFromCard made of it; without them (a card that failed to load) only the name.
// em and the brief show kt CAS, the sim's speeds, rounded for display; the card's KIAS are in note 4 until plan C3 (they
// are not all manual figures: the da42ng ones come from a school's deck, the C172 Vapp is the middle of the POH range).
function typeInfo(id, card, ac) {
  const T = TYPE_TEXT[id] || { name: String(id) }, real = id !== 'trainer';
  const out = { name: T.name, em: '', span: '', lede: '', notes: [], links: [], real };
  if (!card || !ac) return out;
  out.em = `Vref ${Math.round(ac.Vref)} · Vapp ${Math.round(ac.Vapp)} kt`;
  if (!real) {
    out.span = 'แบบสมมติ ค่าทุกตัวเป็นค่าประมาณ'; out.lede = TRAINER_LEDE; out.notes = [...TRAINER_NOTES];
    return out;
  }
  const det = landingDetent(card), flap = /^\d+$/.test(String(det.name)) ? `${det.name}°` : String(det.name);
  const retract = card.gear && card.gear.layout && card.gear.layout.v === 'tricycle_retract';
  out.lede = `${T.desc || T.name} เริ่มบนแนวร่อน 3° ${retract ? 'ใส่ล้อและแฟลปลงจอด' : 'ล้อตายตัว แฟลปลงจอด'} (${flap}) แล้ว`;
  const tf = card.thai_fleet && card.thai_fleet.v;
  if (tf && Array.isArray(tf.users)) {
    const ato = tf.users.filter((u) => u.kind === 'ato'), club = tf.users.filter((u) => u.kind === 'club');
    const nAto = ato.reduce((s, u) => s + u.n, 0);
    out.span = `โรงเรียนการบินพลเรือนในไทย ${nAto} ลำ ${ato.length} แห่ง${id === tf.default_thai_type ? ' · ใช้มากที่สุด' : ''}`;
    const one = (u) => `${u.name} ${u.n} ลำ${u.variants && u.variants.length ? ` (รวมรุ่น ${u.variants.map((x) => x.variant).join(', ')})` : ''}`
      + (u.base ? ` ฐานฝึก${u.base}${u.base_est ? ' (ค่าประมาณ)' : ''}` : '');
    out.notes.push(`ใช้ฝึกที่ ${ato.map(one).join(', ')}${club.length ? ` และชมรมการบิน ${club.map(one).join(', ')}` : ''}`);
    out.notes.push(`จำนวนจากทะเบียนอากาศยานของ กพท. ณ ${thaiDate(tf.as_of)} นับเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้`);
  }
  if (T.note) out.notes.push(T.note);
  const sp = (l) => `${l.v} ${l.u === 'kt IAS' ? 'KIAS' : 'KCAS'}`, S = card.speeds;
  if (S.VREF_kt.u === 'kt IAS' || S.VAPP_kt.u === 'kt IAS') out.notes.push(`ความเร็วในซิมเป็น kt CAS แปลงจากค่าในบัตร Vref ${sp(S.VREF_kt)} และ Vapp ${sp(S.VAPP_kt)}`);
  out.notes.push(`ตัวเลขการบินในซิมเป็นค่าประมาณจากเอกสารสาธารณะของผู้ผลิตและหน่วยงาน ดูที่มาทุกค่าใน aircraft/${id}.json`);
  out.notes.push(SCENARIO_NOTE, MODEL_NOTE);
  const reg = card._meta && card._meta.sources && card._meta.sources.LS1;
  if (reg && /^https:\/\//.test(reg.link)) out.links.push({ text: 'ทะเบียนอากาศยานของ กพท.', href: reg.link });
  out.links.push({ text: `aircraft/${id}.json`, href: `aircraft/${id}.json` });
  return out;
}

// The generic model (70-aircraft.js) is the trainer's: its main wheels touch 1.38 m below its CG (leg y −0.36, wheel
// −0.73, radius 0.29 in model axes), the trainer card's main-gear contact z. For another type it is raised so the
// wheels sit at the card's deepest contact, the flaps drawn at the landing detent's angle, the retract animation kept
// only for a retractable gear, and engines given in model axes (FRD x, −z, y) for the twins' nacelles. The whole model
// hides in the cockpit view, where the trainer's canopy and helmets would stand around the card's eye point. null =
// the trainer as built.
const MODEL_WHEEL_Z = 1.38;
function modelSpec(id, card, ac) {
  if (id === 'trainer' || !card || !ac) return null;
  return {
    lift: MODEL_WHEEL_Z - Math.max(...ac.gear.map((g) => g.b[2])),
    flapDeg: landingDetent(card).flap_deg,
    retract: !!(card.gear && card.gear.layout && card.gear.layout.v === 'tricycle_retract'),
    engines: ac.engines.map((e) => [e.pos[0], -e.pos[2], e.pos[1]]),
    hideInCockpit: true,
  };
}
