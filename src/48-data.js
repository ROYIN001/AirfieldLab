// ───────────────────────── Data files served beside the page ─────────────────────────
// vtbd_af.json   airfield vectors (taxiway centre lines, aprons, terminal, buildings, water, golf, corridors)
// land_in.png    land-use classes, 2.5 m/px, e −3600…4400, n −5000…5000   (© OpenStreetMap contributors)
// land_out.png   land-use classes, 8 m/px,  e −10000…10000, n −12000…12000
// city.json      base64 records: generated city buildings (9 bytes each) and street lights (5 bytes each)
// aircraft/trainer.json  the aircraft card of the fictional trainer (plan B3): the app hands it to setAircraft
//                (src/20-flight.js) before any Flight exists
// aircraft/<id>.json  the cards of the other types of the training pane (plan C1, AIRCRAFT_TYPES of 22-types.js),
//                loaded by loadCards beside loadData; the experimental airliners (plan C4, AIRLINER_TYPES) only when
//                the switch รุ่นทดลอง is on
const LAND = {
  in: { e0: -3600, n1: 5000, res: 2.5, w: 3200, h: 4000 },
  out: { e0: -10000, n1: 12000, res: 8, w: 2500, h: 3000 },
};
const DATA_FILES = ['vtbd_af.json', 'land_in.png', 'land_out.png', 'city.json', 'aircraft/trainer.json'];

// Once one file fails, Promise.all rejects at once and main() shows the error in #loadMsg; the other files still
// arriving must not overwrite it with the progress text, so progress stops at the first failure. The error names the
// file in Thai (the browser's own message, often English, stays in error.cause for the console).
async function loadData(onProgress = () => {}) {
  let done = 0, failed = false;
  const tick = (name) => { done++; if (!failed) onProgress(done / DATA_FILES.length, name); };
  const get = async (name, kind) => {
    let r = null;
    try {
      r = await fetch(name);
      if (r.ok) {
        const v = kind === 'json' ? await r.json() : kind === 'img' ? await createImageBitmap(await r.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }) : await r.arrayBuffer();
        tick(name); return v;
      }
    } catch (e) {
      failed = true;
      throw new Error(`โหลด ${name} ไม่ได้ (${r ? 'อ่านข้อมูลในไฟล์ไม่ได้' : 'เชื่อมต่อไม่ได้'})`, { cause: e });
    }
    failed = true;
    throw new Error(`โหลด ${name} ไม่ได้ (${r.status})`);
  };
  const [af, landIn, landOut, city, aircraft] = await Promise.all([
    get('vtbd_af.json', 'json'), get('land_in.png', 'img'), get('land_out.png', 'img'), get('city.json', 'json'), get('aircraft/trainer.json', 'json'),
  ]);
  const b64 = (s) => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
  return { af, landIn, landOut, bld: b64(city.bld), lights: b64(city.lights), aircraft };
}

// The cards of the training pane's other aircraft types (plan C1): aircraft/<id>.json for each id, fetched in parallel
// with loadData and checked at once with check(card) (the page passes acFromCard). Resolves to { [id]: { card, ac } }
// for a good card and { [id]: { error } } for one that fails, error a Thai message that names the file and, for a card
// the reader refuses, the card path (error.path; the reader's English message goes to the console, as for the trainer).
// It never rejects: a bad card only disables its entry in the selector, while the trainer card (loadData) still stops
// the page.
async function loadCards(ids, check) {
  const one = async (id) => {
    const name = `aircraft/${id}.json`;
    let r = null, card;
    try {
      r = await fetch(name);
      if (!r.ok) return { error: `โหลด ${name} ไม่ได้ (${r.status})` };
      card = await r.json();
    } catch (e) {
      console.error(e);
      return { error: `โหลด ${name} ไม่ได้ (${r ? 'อ่านข้อมูลในไฟล์ไม่ได้' : 'เชื่อมต่อไม่ได้'})` };
    }
    try { return { card, ac: check(card) }; } catch (e) {
      console.error(e);
      return { error: `ข้อมูลเครื่องบินใน ${name} ใช้ไม่ได้${e && e.path ? ` (ค่าที่ขาดหรือผิดรูปแบบ: ${e.path})` : ''}` };
    }
  };
  const got = await Promise.all(ids.map((id) => one(id).catch((e) => { console.error(e); return { error: `โหลด aircraft/${id}.json ไม่ได้` }; })));
  return Object.fromEntries(ids.map((id, i) => [id, got[i]]));
}

function classTexture(bitmap) {
  const t = new THREE.Texture(bitmap);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false;
  t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
  return t;
}

// decoded building records: e, n, w, d, h, yaw, kind (0 block, 1 shophouse, 2 tower, 3 house), colour index
function decodeBuildings(buf) {
  const dv = new DataView(buf), n = Math.floor(buf.byteLength / 9), out = new Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 9, k = dv.getUint8(o + 8);
    out[i] = { e: dv.getInt16(o, true) / 2, n: dv.getInt16(o + 2, true) / 2, w: dv.getUint8(o + 4) / 4, d: dv.getUint8(o + 5) / 4, h: dv.getUint8(o + 6) / 4, yaw: dv.getUint8(o + 7) / 255 * Math.PI, kind: k >> 4, col: k & 15 };
  }
  return out;
}
function decodeLights(buf) {
  const dv = new DataView(buf), n = Math.floor(buf.byteLength / 5), out = new Array(n);
  for (let i = 0; i < n; i++) { const o = i * 5; out[i] = { e: dv.getInt16(o, true) * 2, n: dv.getInt16(o + 2, true) * 2, k: dv.getUint8(o + 4) }; }
  return out;
}
