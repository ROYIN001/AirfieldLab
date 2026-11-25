# Data licences · สัญญาอนุญาตของไฟล์ข้อมูล

The files in this folder are served beside the page: `node build.mjs` copies them into `dist/` with `index.html`.
Research round 5 §11 (`docs/research/05-airport-city.md`) gives the licence rules; `test/licenses.test.mjs` checks
this file, the page footer and `README.md` against `test/fixtures/license_policy.json`.

## OpenStreetMap derived files (ODbL)

These files are derived databases of OpenStreetMap data, © OpenStreetMap contributors
(https://www.openstreetmap.org/copyright). They were captured from the OpenStreetMap standard map at zoom 15–17 around
the airport and vectorised or classified by the scripts in `tools/` (see `tools/README.md`; the captures are not kept).

They are made available under the Open Database License v1.0: https://opendatacommons.org/licenses/odbl/1-0/.
Any rights in individual contents of the databases are licensed under the Database Contents License:
https://opendatacommons.org/licenses/dbcl/1-0/.

| file | content | made by | licence |
|---|---|---|---|
| `vtbd_af.json` | airfield vectors: taxiway centre lines, aprons, terminal halls and piers, buildings, water, golf course, city building footprints, tollway, rail and Phahonyothin Road centre lines | `tools/extract_af.py`, `graph.py`, `graph2.py`, `merge.py`, `extract_poly.py`, `lines.py`, `assemble.py` | ODbL 1.0 |
| `land_in.png` | land-use classes, 2.5 m per pixel, e −3600…4400 m, n −5000…5000 m from the ARP | `tools/landclass.py`, cleaned by `tools/autogen.py` | ODbL 1.0 |
| `land_out.png` | land-use classes, 8 m per pixel, e −10000…10000 m, n −12000…12000 m from the ARP | `tools/landclass.py` | ODbL 1.0 |
| `city.json` | generated city buildings and street lights, placed from the land-use classes and the road network; sizes, heights and colours are estimates | `tools/autogen.py` | ODbL 1.0 |

ODbL 4.6: the derived databases are these files themselves, published in this repository, and the method that made
them is in `tools/`. Whoever redistributes them, changed or not, keeps this notice and the ODbL. A picture rendered from
them (a Produced Work, such as the page or a screenshot) needs only the credit "© OpenStreetMap contributors".

## Other sources in the page (not files in this folder)

- Runways, lighting, ILS and navaids in `src/15-geo.js`: AIP Thailand AD 2 VTBD, © CAAT (https://aip.caat.or.th).
  Only numbers, coordinates and names are used, with the AIRAC cycle cited in the footer; no chart, PDF or text of
  the AIP is copied (research round 5 §11, table 11.2). For training in the game only, not for real navigation.
- three.js r186 (MIT licence) is loaded from jsDelivr and not kept in the repository.

## A new data file

- A new JSON file in this folder carries top-level `source` and `license` fields; `license` names ODbL when any of
  its sources is ODbL. `vtbd_af.json` and `city.json` predate the rule and are described here instead.
- Every file in this folder has a line in this file, and a new data source adds its credit to the page footer when
  its data arrives, not before (research round 5 §11, tables 11.1 to 11.3 list what may and may not be used).

## สรุปภาษาไทย

ไฟล์ทั้งสี่ในโฟลเดอร์นี้สร้างจากแผนที่ OpenStreetMap จึงเป็นฐานข้อมูลอนุพันธ์ภายใต้ ODbL 1.0 ผู้ที่นำไปใช้ต่อต้องให้เครดิต
"© ผู้ร่วมพัฒนา OpenStreetMap" และถ้าแจกจ่ายไฟล์ไม่ว่าจะดัดแปลงหรือไม่ ต้องแจกภายใต้ ODbL พร้อมข้อความนี้ เงื่อนไข
share-alike ใช้กับไฟล์ข้อมูลเท่านั้น ไม่ใช้กับโค้ดใน `src/` (ดูสัญญาอนุญาตของโค้ดใน `README.md`) และภาพที่เรนเดอร์จากข้อมูลนี้ต้องมีเพียงเครดิต
ค่าทางวิ่ง ไฟ และเครื่องช่วยเดินอากาศมาจาก AIP Thailand ซึ่งเป็นลิขสิทธิ์ของ กพท. repo ใช้เฉพาะตัวเลขและอ้างรอบ AIRAC
ข้อมูลในเกมใช้เพื่อการฝึกเท่านั้น ไม่ใช้เพื่อการเดินอากาศจริง
