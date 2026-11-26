# AirfieldLab

สนามบินดอนเมือง (VTBD) แบบสามมิติในเบราว์เซอร์ พร้อมเครื่องฝึกบินร่อนลงจอด สร้างจาก `src/` และไฟล์ใน `data/`
ด้วย three.js รายละเอียดการ build การรันและเทสต์อยู่ใน [CLAUDE.md](CLAUDE.md)

```
node build.mjs                          # → dist/index.html และคัดลอก data/* ไปไว้ข้างกัน
python3 -m http.server 8080 -d dist     # เปิด http://localhost:8080
node --test "test/**/*.test.mjs"        # เทสต์ทั้งหมด (Node ≥ 22)
```

## ข้อมูลและสัญญาอนุญาต

- **ไฟล์ข้อมูลภายใต้ ODbL 1.0:** `data/vtbd_af.json`, `data/land_in.png`, `data/land_out.png` และ `data/city.json`
  สร้างจากแผนที่ OpenStreetMap จึงเป็นฐานข้อมูลอนุพันธ์ © ผู้ร่วมพัฒนา OpenStreetMap ภายใต้
  [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) ที่มาและเงื่อนไขของแต่ละไฟล์อยู่ใน
  [data/LICENSE-DATA.md](data/LICENSE-DATA.md) เงื่อนไข share-alike ใช้กับไฟล์ข้อมูลเหล่านี้เท่านั้น ไม่ใช้กับโค้ด
- **AIP Thailand:** ค่าทางวิ่ง ไฟ และเครื่องช่วยเดินอากาศใน `src/15-geo.js` มาจาก AIP Thailand AD 2 VTBD ซึ่งเป็นลิขสิทธิ์ของ กพท.
  repo ใช้เฉพาะตัวเลข พิกัด และชื่อ พร้อมอ้างรอบ AIRAC ไม่เก็บแผนภูมิหรือ PDF ของ AIP ข้อมูลในเกมใช้เพื่อการฝึกเท่านั้น
  ไม่ใช้เพื่อการเดินอากาศจริง
- **โค้ดและข้อความของ repo:** ใช้สัญญาอนุญาต MIT ([LICENSE](LICENSE)) ครอบคลุมโค้ด (`src/`, `test/`, `tools/`, `build.mjs`
  และสคริปต์ทุกไฟล์ รวมถึงสคริปต์ใน `docs/research/`) และข้อความที่ repo เขียนเอง (README, CLAUDE.md, รายงานวิจัย)
  ไม่ครอบคลุมไฟล์ใน `data/` ซึ่งเป็นไปตาม data/LICENSE-DATA.md และไม่ครอบคลุมไฟล์ข้อมูลหรือข้อความที่ยกมาใน `docs/research/`
  ที่ระบุสัญญาอนุญาตของตัวเอง (เช่น ODbL, CC BY 4.0 หรือข้อมูล Copernicus) ค่าจาก AIP Thailand ใช้เฉพาะตัวเลขพร้อมอ้าง กพท.
  เป็นแหล่งที่มา three.js (MIT) โหลดจาก jsDelivr และไม่ได้เก็บไว้ใน repo
- **กติกา:** `test/licenses.test.mjs` ตรวจตามรายงานวิจัยรอบ 5 หัวข้อ 11 และรอบ 1 หัวข้อ 12 ทุกครั้งที่ CI รัน ได้แก่ เครดิตและลิงก์
  ในส่วนท้ายของทั้งหน้าสำรวจและหน้าฝึกบิน, ไฟล์ JSON ใหม่ใน `data/` ต้องมีฟิลด์ `source` และ `license` (ถ้ามาจาก OpenStreetMap
  ต้องเป็น ODbL), ทุกไฟล์ใน `data/` ต้องมีแถวใน `data/LICENSE-DATA.md`, ห้ามมีชื่อแหล่งข้อมูลต้องห้าม (เช่น GlobalBuildingAtlas,
  FABDEM) ใน `data/`, `src/`, `tools/` และ `test/`, ห้ามมีไฟล์ GeoTIFF, JPEG 2000 หรือ PDF (.tif, .tiff, .jp2, .pdf) และห้ามมีข้อความ
  สัญญาอนุญาต GPL/LGPL หรือไฟล์ของ JSBSim ใน repo ยกเว้นไฟล์และรูปแบบที่เจ้าของอนุมัติไว้ใน `test/fixtures/license_policy.json`
  แผนภูมิ AIP ในรูปแบบอื่น (เช่น PNG) และแหล่งที่ไม่อยู่ในรายการ ต้องกันไว้ตอนรีวิว
