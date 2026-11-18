# ไฟล์ประกอบรายงานรอบที่ 5 (สนามบินดอนเมืองและเมืองโดยรอบ)

รายงานฉบับหลักอยู่ที่ [`../05-airport-city.md`](../05-airport-city.md) โฟลเดอร์นี้เก็บเนื้อหาเต็มของหัวข้อ 1–10 และข้อมูลอนุพันธ์ขนาดเล็กที่รายงานอ้างถึง
ยังไม่มีไฟล์ใดในโฟลเดอร์นี้ถูกโหลดโดยแอป การนำเข้า `data/`, `src/` หรือ `test/` จะทำหลังเจ้าของอนุมัติแผนพัฒนา (หัวข้อ 12 ของฉบับหลัก)

| ไฟล์ | เนื้อหา | สัญญาอนุญาตของข้อมูล / เครดิต |
|---|---|---|
| `5a-aip.md` | หัวข้อ 1–4: AIRAC, AD 2.8–2.10 และหอบังคับการบิน, หลุมจอดและทางขับ, IAP/SID/STAR | ข้อเท็จจริงจาก AIP Thailand (© CAAT) อ้าง AIRAC 29 OCT 2026 |
| `5b-airport.md` | หัวข้อ 5–7: อาคารในสนาม, ภาคพื้น, การปฏิบัติการ | ตามแหล่งที่อ้างในแต่ละหัวข้อ |
| `5c-city.md` | หัวข้อ 8–10: อาคาร 3 มิติ, ภูมิประเทศและสีพื้นผิว, ลักษณะเมือง | ตามแหล่งที่อ้างในแต่ละหัวข้อ |
| `5d-aip-update.md` | อัปเดต 18 พ.ย. 2026: AD 2.19–2.25, OCA/H ทุกแผ่น, ตรวจ AIRAC 26 NOV และ 24 DEC 2026 | ข้อเท็จจริงจาก AIP Thailand (© CAAT) |
| `aip_vtbd_iap_minima.json` | OCA/H, FAF และ missed approach ของ 13 แผ่น และข้อเท็จจริง AD 2.20 | ข้อเท็จจริงจาก AIP Thailand (© CAAT) |
| `iap_minima.test.mjs` | ต้นแบบเทสต์ T-U01–T-U08: `node docs/research/05-airport-city/iap_minima.test.mjs` | โค้ดของโครงการ |
| `aip_vtbd_current.json` | ค่าทางวิ่ง เครื่องช่วยเดินอากาศ และระยะประกาศของ AIRAC ปัจจุบัน | ข้อเท็จจริงจาก AIP Thailand AD 2 VTBD (© CAAT) |
| `aip.test.mjs` | ต้นแบบเทสต์ T-A: `node docs/research/05-airport-city/aip.test.mjs` | โค้ดของโครงการ |
| `derived_points.json` | ตำแหน่ง stop bar และ hot spot จากเส้น OSM ตัดกับระยะใน AIP | ODbL 1.0, © OpenStreetMap contributors |
| `tw_names.json` | ชื่อทางขับของเส้น `tw` 137 เส้นตามลำดับใน `data/vtbd_af.json` | ODbL 1.0, © OpenStreetMap contributors, Overture Maps Foundation |
| `vtbd_ops.json` | พารามิเตอร์จราจร (ค่าประมาณระบุด้วย `est`) | สถิติ ทอท. (ข้อเท็จจริง) และค่าประมาณของโครงการ |
| `ops.test.mjs` | ต้นแบบเทสต์ T-G01–T-G18: `node docs/research/05-airport-city/ops.test.mjs` | โค้ดของโครงการ |
| `e-buildings/` | รูปโถงอาคาร 1/2, จุด gate, ความสูงหอหลายปีจาก 2.5D | ODbL 1.0 (Overture/OSM); Google Open Buildings 2.5D Temporal (CC BY 4.0) |
| `f-ground/flood.py` | คำนวณความส่องสว่างของแถวเสาไฟ | โค้ดของโครงการ |
| `h-buildings/` | สถิติความสูงอาคาร อาคารสูง 30 อันดับ การจับคู่สิ่งกีดขวาง JSON ฉบับเต็ม และสคริปต์อ้างอิง (`scripts/` มีพาธของเครื่องที่ใช้ค้นคว้า ต้องแก้ก่อนรัน) | ODbL 1.0 (Overture/OSM); Google Open Buildings 2.5D Temporal (CC BY 4.0) |
| `i-terrain/` | จานสี albedo ต่อคลาส (`land_palette.json`), สถิติ DEM (`dem_stats.json`) | Contains modified Copernicus Sentinel data 2026; produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA |

ไฟล์ที่เป็นอนุพันธ์จาก OSM/Overture เป็นฐานข้อมูลอนุพันธ์ภายใต้ ODbL 1.0 ถ้านำไปแจกจ่ายต่อต้องคงสัญญาอนุญาตเดิมและเครดิต
