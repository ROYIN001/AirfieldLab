# Data licences · สัญญาอนุญาตของไฟล์ข้อมูล

The files in this folder are served beside the page: `node build.mjs` copies them into `dist/` with `index.html`.
Research round 5 §11 (`docs/research/05-airport-city.md`) gives the licence rules; `test/licenses.test.mjs` checks
this file, the page footer and `README.md` against `test/fixtures/license_policy.json`. The code of the repository
is under the MIT licence (`LICENSE`); it does not change the licence of the files below, which stay under the ODbL,
nor of the data and research material in `docs/research/`, which keeps the licences of the sources each report cites.

## OpenStreetMap derived files (ODbL)

These files are derived databases of OpenStreetMap data, © OpenStreetMap contributors
(https://www.openstreetmap.org/copyright). They were captured from the OpenStreetMap standard map at zoom 15–17 around
the airport and vectorised or classified, mostly by the scripts in `tools/` (see `tools/README.md` and the table; the
captures are not kept).

They are made available under the Open Database License v1.0: https://opendatacommons.org/licenses/odbl/1-0/.
Any rights in individual contents of the databases are licensed under the Database Contents License:
https://opendatacommons.org/licenses/dbcl/1-0/.

| file | content | made by | licence |
|---|---|---|---|
| `vtbd_af.json` | airfield vectors: taxiway centre lines, aprons, terminal halls and piers, buildings, water, golf course, tollway, rail and Phahonyothin Road centre lines; city building footprints (`cbld`). Building heights (`z`) are estimates drawn by the scripts, not OSM data | `tools/extract_af.py`, `graph.py`, `graph2.py`, `merge.py`, `extract_poly.py`, `lines.py`, `assemble.py`; `cbld` from `tools/autogen.py` (`city_mapped.json`, merged in by a step that is not kept) | ODbL 1.0 |
| `land_in.png` | land-use classes, 2.5 m per pixel, e −3600…4400 m, n −5000…5000 m from the ARP | classes of `tools/landclass.py`, cleaned and written by `tools/autogen.py` | ODbL 1.0 |
| `land_out.png` | land-use classes, 8 m per pixel, e −10000…10000 m, n −12000…12000 m from the ARP | classes of `tools/landclass.py`; the script that wrote the file is not kept | ODbL 1.0 |
| `city.json` | generated city buildings and street lights, placed from the land-use classes and the road network; sizes, heights and colours are estimates | buildings from `tools/autogen.py` (`city_bld.bin`); the street lights and the packing into this file come from scripts that are not kept | ODbL 1.0 |

ODbL 4.6: the derived databases are these files themselves, published whole in this repository; `tools/` holds most of
the method that made them, and the table names the steps that are not kept. Whoever redistributes the files, changed
or not, keeps this notice and the ODbL.

A picture rendered from them (a Produced Work, such as a screenshot of the page) does not take the ODbL itself, but it
needs a notice that it uses OpenStreetMap data and that the data is available under the ODbL, for example
"© OpenStreetMap contributors, data available under the ODbL" with a link to https://www.openstreetmap.org/copyright
(ODbL 4.3). A Produced Work made from a changed copy of the files must also offer that changed copy (ODbL 4.6). The
page itself hands these files to the browser, so they travel with this notice (ODbL 4.2), and its footer carries the
credit and the links.

## Other sources in the page (not files in this folder)

- Runways, lighting, ILS and navaids in `src/15-geo.js`: AIP Thailand AD 2 VTBD, © CAAT (https://aip.caat.or.th).
  Only numbers, coordinates and names are used, with the AIRAC cycle cited in the footer; no chart, PDF or text of
  the AIP is copied (research round 5 §11, table 11.2). For training in the game only, not for real navigation.
- three.js r186 (MIT licence) is loaded from jsDelivr and not kept in the repository.

## A new data file

- A new JSON file in this folder carries `source` and `license` fields, at the top level or in `_meta` when the file
  keeps its metadata there (a parameter card whose leaves follow `{v, u, scope, ...}`); `license` names ODbL when any of its sources is ODbL, and an ODbL
  file joins the table above and `odbl_derived_files` in `test/fixtures/license_policy.json`. `vtbd_af.json` and
  `city.json` predate the rule and are described here instead.
- Every file in this folder has a row in a table of this file (content, made by, licence), and a new data source adds
  its credit to the page footer when its data arrives, not before (research round 5 §11, tables 11.1 to 11.3 list
  what may and may not be used).

## สรุปภาษาไทย

ไฟล์ทั้งสี่ในโฟลเดอร์นี้สร้างจากแผนที่ OpenStreetMap จึงเป็นฐานข้อมูลอนุพันธ์ภายใต้ ODbL 1.0 ผู้ที่นำไปใช้ต่อต้องให้เครดิต
"© ผู้ร่วมพัฒนา OpenStreetMap" และถ้าแจกจ่ายไฟล์ไม่ว่าจะดัดแปลงหรือไม่ ต้องแจกภายใต้ ODbL พร้อมข้อความนี้ เงื่อนไข
share-alike ใช้กับไฟล์ข้อมูลเท่านั้น ไม่ใช้กับโค้ด ซึ่งใช้สัญญาอนุญาต MIT ในไฟล์ `LICENSE` ความสูงอาคารในไฟล์เหล่านี้เป็นค่าประมาณ

ภาพที่เรนเดอร์จากข้อมูลนี้ (Produced Work) เช่น ภาพหน้าจอ ไม่ต้องใช้ ODbL กับตัวภาพ แต่ต้องบอกว่าใช้ข้อมูลจาก
OpenStreetMap และข้อมูลอยู่ภายใต้ ODbL เช่น "© ผู้ร่วมพัฒนา OpenStreetMap ข้อมูลภายใต้ ODbL" พร้อมลิงก์ไปที่
https://www.openstreetmap.org/copyright ถ้าภาพสร้างจากไฟล์ที่ดัดแปลงแล้ว ต้องเปิดให้ผู้รับได้ไฟล์ที่ดัดแปลงนั้นด้วย

ค่าทางวิ่ง ไฟ และเครื่องช่วยเดินอากาศมาจาก AIP Thailand ซึ่งเป็นลิขสิทธิ์ของ กพท. repo ใช้เฉพาะตัวเลขและอ้างรอบ AIRAC
ข้อมูลในเกมใช้เพื่อการฝึกเท่านั้น ไม่ใช้เพื่อการเดินอากาศจริง
