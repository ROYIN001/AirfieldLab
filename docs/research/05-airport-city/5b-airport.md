# รอบที่ 5B: สนามบิน: อาคาร ภาคพื้น และการปฏิบัติการ (หัวข้อ 5–7)

ส่วนหนึ่งของรายงานรอบที่ 5 (สนามบินดอนเมืองและเมืองโดยรอบ) ฉบับหลักอยู่ที่ [`../05-airport-city.md`](../05-airport-city.md) ซึ่งมีสรุป วิธีอ่าน (ระดับความเชื่อมั่น ป้ายค่าประมาณ รหัสแหล่งอ้างอิงและกรณีทดสอบ ระบบพิกัด) สัญญาอนุญาต (หัวข้อ 11) และรายการสิ่งที่ Claude Code ควรทำ (หัวข้อ 12)

- **วันที่ค้นคว้า:** 17 พ.ย. 2026
- **AIP ที่ใช้:** AIRAC 29 OCT 2026 (AIRAC AIP AMDT 11/26)
- **สถานะ:** งานค้นคว้าอย่างเดียว ไม่ได้แก้โค้ดหรือข้อมูลใน repo
- **อัปเดต 18 พ.ย. 2026:** อ่าน AD 2.20 ฉบับปัจจุบันได้ครบแล้วใน [`5d-aip-update.md`](5d-aip-update.md): มี 16 ข้อ hot spot HS1–HS6, LVP เริ่มเมื่อ RVR < 550 m หรือฐานเมฆ < 200 ft และใช้ได้เฉพาะ 21R, circuit ของ 03R/21L อยู่ทางตะวันออก (1500/1000/800/500 ft ตามประเภทอากาศยาน) ข้อความในหัวข้อ 7 ที่อ้างบทสรุปของเครื่องมือให้ถือตาม 5D

## 5 อาคารในสนามบิน: อาคารผู้โดยสาร pier สะพานเทียบ อาคารจอดรถ คลังสินค้า โรงซ่อม และหอบังคับการบิน

### สรุป

- **อาคารผู้โดยสารเป็นแนวยาวเดียวกันขนานทางวิ่ง** เรียงจากเหนือลงใต้ดังนี้: North Corridor (หลุมจอด 12, 14, 15), อาคาร 1 (Terminal 1 ระหว่างประเทศ) กับ Pier 2 (หลุม 21–26), Pier 3 (หลุม 31–36) ตรงรอยต่อ อาคาร 2 (Terminal 2 ในประเทศ) กับ Pier 4 (หลุม 41–46), South Corridor กับ Pier 5 (หลุม 51–56) และอาคารผู้โดยสารในประเทศเดิมกับ Pier 6 (หลุม 61–68) ทางใต้สุด ชื่อ pier และเลขหลุมจอดมาจากแผนภูมิ Aerodrome Ground Movement Chart ของ AIP ฉบับ 2020 [E9] และ AIP SUP A19/20 [E1] ส่วนตำแหน่งประตูมาจาก OSM [E17] AIP SUP A19/20 เรียกส่วนเหนือสุดว่า "North Corridor" [E1] ส่วนแผนภูมิ AGMC ชุด AIRAC 4 SEP 2025 มีป้าย "Pier 1" ถึง "Pier 6" ตามข้อความที่เครื่องมือสกัดได้ [E21] จึงอาจเรียกส่วนนี้ว่า Pier 1 ได้ด้วย (ยังไม่ยืนยันกับภาพแผนภูมิ ความเชื่อมั่น กลาง)
- **สะพานเทียบเครื่องบิน (PBB) มี 33 ชุด** ทั้งหมดผลิตโดย PT Bukaka Teknik Utama (อินโดนีเซีย) ตามสัญญาที่ลงนามเมื่อ 22 ต.ค. 2019 กับผู้รับเหมาไทย M-Solution Co., Ltd. รวมทางเลื่อน 3 ชุด มูลค่าราว US$7.5 ล้าน กำหนดเสร็จภายใน 1 ปี เริ่มส่งของ ม.ค. 2020 [E2][E3][E20] ความเชื่อมั่นระดับกลาง เพราะมาจากข่าวสามสำนักที่ตรงกัน แต่ยังไม่พบเอกสาร ทอท. ยืนยัน AIP SUP A19/20 ยืนยันตำแหน่งติดตั้งได้ 15 หลุม คือ 31–36, 41–46 และ 12/14/15 ระหว่าง 7 MAY–24 NOV 2020 [E1] เมื่อรวม Pier 2 และ Pier 5 ที่มี 6 หลุมประชิดอาคารต่อ pier [E9] จะระบุตำแหน่งได้ 27 ชุด อีก 6 ชุดยังไม่รู้ตำแหน่ง (น่าจะอยู่ที่ Pier 6 ซึ่งมี 8 หลุม)
- **หลังคาโถงอาคาร 1 และ 2 น่าจะสูงกว่าที่ repo ใช้ราว 4–6 m** ข้อมูลความสูงจากดาวเทียม 3 ชุดให้ค่าตรงกันว่ายอดหลังคาอยู่ราว 22–27 m ได้แก่ Open Buildings 2.5D Temporal (ค่ามัธยฐานของ 8 ปี P50 25.2 / 23.9 m) [E12], Copernicus DEM (P90 23.2 / 26.1 m) [E18] และผลของส่วนที่ 8 [E14] ส่วน repo ใช้แผ่นหลังคาที่ 17–19.2 m ค่าที่เสนอคือ 24 m (ค่าประมาณ, ความเชื่อมั่นต่ำ–กลาง) อาคาร 2 มีชั้นผู้โดยสารขาออกอยู่ชั้น 3 และทางเชื่อมอยู่ชั้น 2 [E6] ซึ่งสอดคล้องกับอาคารสูงราว 4 ระดับ
- **pier สูงกว่าที่ repo ใช้เล็กน้อย** Open Buildings ให้ P50 13.4–16.9 m [E12] แต่แหล่งนี้มักให้ค่าสูงเกินจริงสำหรับอาคารเตี้ย (ส่วนที่ 8 พบว่าอาคาร 1–2 ชั้นได้ราว 7 m) [E14] ค่าที่เสนอคือยอดหลังคา 14 m ± 2 m ส่วน repo ใช้ราว 12.6 m
- **อาคารจอดรถ 7 ชั้น** อยู่ระหว่างอาคาร 2 กับสถานีรถไฟ ขนาดฐาน 104 × 74 m [E11] มี skywalk ยาว 110 m กว้าง 6 m จากสถานีดอนเมือง (สายสีแดง) เข้าชั้น 2 ของอาคารจอดรถแล้วต่อไปอาคาร 2 เปิดใช้ 2 AUG 2021 [E6] ระยะระหว่างขอบอาคารที่วัดได้คือ 105.5 m ซึ่งตรงกับความยาวที่ประกาศ ความสูงที่คาดจาก 7 ชั้น × 3.0 m คือพื้นดาดฟ้าราว 18 m และยอดหลังคาบันไดราว 21 m (ค่าประมาณ) Copernicus DEM ให้ค่ามัธยฐาน 19.4 m [E18]
- **โรงแรมอมารี ดอนเมือง** (429 ห้อง) อยู่ฝั่งตะวันตกของถนนวิภาวดีรังสิต เชื่อมกับอาคาร 1 ด้วยทางเดินยกระดับที่เข้าชั้น 2 ระหว่างประตู 5 กับ 6 [E7] ทางเดินนี้เป็นทางเดินปิดกระจกที่ต่อถึงอาคาร 2 ด้วย [E10] ช่วงที่ต้องข้ามระหว่างขอบอาคารยาวประมาณ 156 m [E11] ปี 2026 โรงแรมเปิดใช้ทางเดินสะพานชั่วคราวระหว่างปรับปรุงทางเชื่อมหลัก [E7]
- **หอบังคับการบินด้านใต้ (TWR-S) ใน repo วางคลาดไปราว 36 m** footprint ฐานหอใน Overture มีขนาด 23.6 × 18.4 m และอยู่ที่ (e −859.4, n −368.7) [E11] ซึ่งตรงกับจุดสูงสุดใน 2.5D ของส่วนที่ 8 ที่ (−857, −373) [E14] ส่วน repo วางไว้ที่ (−893, −355) ความสูงยอดที่วัดได้คือ 48.5 m (มัธยฐานของ 8 ปีจาก Open Buildings) [E12] และ 56.9 m จากส่วนที่ 8 [E14] ทั้งสองค่าเข้ากับค่าประมาณของ repo (กระจกห้องควบคุมถึงราว 50 m เสาอากาศถึงราว 59 m) ส่วน TWR-N อยู่ในอาคาร "AIS/MET/TWR-N" [E9] และยอดที่วัดได้ราว 27 m [E12]
- **โรงซ่อมฝั่งเหนือ** ทางเหนือของอาคารสำนักงาน ทอท. มีโรงซ่อมขนาดใหญ่ 4 หลัง กว้าง 66–93 m และยาว 98–215 m [E11] สูง P50 21–29 m [E12] แผนภูมิ AIP ระบุป้าย "B747 HANGAR", "TWIN HANGAR", "SINGLE HANGAR", "ENGINE SHOP" และ "WORK SHOP HANGAR" ในพื้นที่นี้ [E9] ในปี 2011 โรงซ่อมของการบินไทยที่ดอนเมืองรับเครื่องบินซ่อมหนักพร้อมกัน 5 ลำ (B747-400 สองลำ, B777-300, B777-300ER และ A330-300) [E16] ใน repo โรงซ่อมเหล่านี้เป็น footprint คลังสินค้ารวมกันหลังเดียว 23,980 m² สูง 23.6 m
- **คลังสินค้าทางใต้** แผนภูมิแสดง CARGO BLDG 1–4, WARE HOUSE 1–2 และ CARGO AGENT [E9] อาคารคลังสินค้าแนวยาวมีขนาด 624 × 104 m (65,098 m²) [E11] สูง P50 15.9 m [E12] ในขณะที่ repo ใช้ 21.4 m แผนระยะ 3 กำหนดให้ปรับปรุงคลังสินค้า 1–2 และเปลี่ยนคลังสินค้า 4 เป็นอาคารผู้โดยสารเครื่องบินส่วนบุคคล [E4]
- **สีหลังคาจาก Sentinel-2 (ค่าประมาณ)** หลังคาโถงอาคาร 1 และ 2 เป็นสีเขียวเทาเข้ม (#334c35 และ #556849) มีแถบสว่างซึ่งน่าจะเป็นช่องแสง Pier 2–3 เป็นสีเทาโลหะ (#747274, #78797d) Pier 5 กับ South Corridor เป็นสีอิฐ/ส้มน้ำตาล (#733e2b) ซึ่งเห็นชัดในภาพสีจริง ส่วนโรงซ่อมและคลังสินค้าเป็นสีเทาอ่อนของหลังคาเหล็ก (#7b7363 ถึง #a4a08a) [E13] ทั้งหมดนี้วัดจากพิกเซล 10 m และยังไม่ได้ตรวจกับภาพถ่ายภาคพื้นที่มีสัญญาอนุญาตชัดเจน
- **แผนระยะ 3 (ยังไม่สร้าง)** อาคาร 3 ใหม่มีพื้นที่มากกว่า 166,000 m² อาคาร 1 และ 2 รวมกันจะมีพื้นที่ราว 240,000 m² และทั้งสนามบินจะมีพื้นที่อาคารผู้โดยสารมากกว่า 400,000 m² [E4] แผนยังรวมถึง Junction Building ที่ต่อกับสายสีแดง และที่จอดรถราว 8,000 คัน [E5] ไม่ควรวาดสิ่งเหล่านี้ใน simulator ตอนนี้ (ตามกฎข้อ 7 ของเจ้าของ)

### ข้อมูล

#### ตาราง E-1 อาคารผู้โดยสารและ pier (เรียงจากเหนือลงใต้)

พิกัดคือ centroid ของ footprint และ [e, n] คือเมตรจาก ARP ตาม `ll_to_en` ส่วน L × W คือความยาวและความกว้างของกรอบสี่เหลี่ยมที่หมุนตามทิศอาคาร แกนยาวอยู่ที่ 28–29° ซึ่งขนานทางวิ่ง ความสูงในวงเล็บมาจาก Open Buildings 2.5D Temporal เป็นค่ามัธยฐานของ P50 และ P90 รายปี ปี 2016–2023 [E12] ส่วน "COP" คือความสูงเหนือพื้นจาก Copernicus DEM GLO-30 [E18]

| ส่วน | การใช้งาน / หลุมจอด | centroid lat, lon | [e, n] m | L × W (m), พื้นที่ (m²) | ความสูงที่วัดได้ (m) | ความสูงที่เสนอ (ค่าประมาณ) | ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|
| North Corridor ส่วนปลาย (Overture เรียก "pier1") | หลุม 12, 14, 15 [E1][E9] | 13.923646, 100.604978 | −77.1, 1026.0 | 173.7 × 62.5, 4,689 [E11] | P50 16.9, P90 20.1 [E12] | 15 m (13–17) | ต่ำ–กลาง |
| North Corridor ส่วนเชื่อม | ทางเดินจากอาคาร 1 ไปทางเหนือ | 13.921930, 100.604086 | −173.5, 836.2 | 287.3 × 41.6, 5,797 [E11] | P50 20.1 (sd 5.6), ข้อมูลน้อย (presence 0.26) [E12] | 14 m | ต่ำ |
| อาคาร 1 (Terminal 1, ระหว่างประเทศ) [E5][E10] | โถงหลัก | 13.920104, 100.602624 | −331.6, 634.2 | 268.5 × 120.8, 27,164 [E11] | P50 25.2, P90 30.1 [E12]; COP มัธยฐาน 21.2, P90 23.2 [E18] | ยอดหลังคา 24 m (21–27) | ต่ำ–กลาง |
| Pier 2 | หลุม 21–26 [E9] | 13.920584, 100.604755 | −101.3, 687.2 | 221.9 × 76.9, 7,494 [E11] | P50 14.6, P90 16.5 [E12] | 14 m (12–16) | ต่ำ–กลาง |
| Pier 3 | หลุม 31–36 [E1][E9] | 13.918366, 100.603494 | −237.5, 441.8 | 221.2 × 76.3, 7,391 [E11] | P50 13.4, P90 14.9 [E12] | 14 m | ต่ำ–กลาง |
| อาคาร 2 (Terminal 2, ในประเทศ) [E5][E10] | โถงหลัก; ขาออกอยู่ชั้น 3, ทางเชื่อมสถานีอยู่ชั้น 2 [E6] | 13.917983, 100.601509 | −452.1, 399.5 | 306.7 × 110.3, 28,754 [E11] | P50 23.9, P90 27.9 [E12]; COP 22.2, 26.1 [E18] | ยอดหลังคา 24 m (21–27) | ต่ำ–กลาง |
| Pier 4 | หลุม 41–46 [E1][E9] | 13.916131, 100.602270 | −369.8, 194.6 | 221.6 × 76.7, 7,338 [E11] | P50 15.1, P90 17.6 [E12] | 14 m | ต่ำ–กลาง |
| South Corridor + Pier 5 | หลุม 51–56 [E9]; ซ่อม South Corridor และ PBB ของ Pier 5 ในระยะ 2 (2015) [E8] | 13.914573, 100.600695 | −540.0, 22.2 | 309.0 × 251.8 (กรอบรวมรูปตัว L), 16,174 [E11] | P50 21.9, P90 28.3 [E12] (น่าจะปนกับหางเครื่องบินที่จอด) | 15 m (13–20) | ต่ำ |
| อาคารผู้โดยสารในประเทศเดิม (Overture: "อาคารผู้โดยสารในประเทศเดิม") | เลิกใช้ตั้งแต่ปี 2011 [E10]; ยังตั้งอยู่ (กฎข้อ 7) | 13.912488, 100.598501 | −777.1, −208.5 | 271.8 × 64.7 (โถง), 14,674 [E11] | P50 15.9, P90 19.0 [E12]; COP 12.4, 15.8 [E18] | 16 m (14–19) | กลาง |
| Pier 6 | หลุม 61–68 [E9] | 13.911665, 100.599506 | −668.5, −299.6 | 210.7 × 28.7, 5,489 [E11] | P50 16.4, P90 18.6 [E12] | 15 m | ต่ำ–กลาง |

หมายเหตุ: อาคาร 1 กับ 2 อยู่ใน footprint ต่อเนื่องเดียวกัน ระยะห่างระหว่าง polygon เป็น 0 m [E11] การแบ่งว่า pier ใดเป็นของอาคารใดในตารางนี้อนุมานจากตำแหน่ง (Pier 2 และ North Corridor ติดอาคาร 1, Pier 4 ติดอาคาร 2, Pier 3 อยู่ตรงรอยต่อ) ยังไม่พบเอกสาร ทอท. ที่ยืนยันว่าประตูขึ้นเครื่องใดเป็นระหว่างประเทศหรือในประเทศ (ความเชื่อมั่นต่ำ)

#### ตาราง E-2 สะพานเทียบเครื่องบินและหลุมจอดประชิดอาคาร

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| จำนวน PBB ทั้งสนามบิน | 33 ชุด (สัญญากับ PT Bukaka Teknik Utama ลงนาม 22 ต.ค. 2019 ผ่านผู้รับเหมาไทย M-Solution Co., Ltd. พร้อมทางเลื่อน 3 ชุด มูลค่า US$7.5 ล้าน กำหนดเสร็จภายใน 1 ปี) | [E2][E3][E20] | กลาง |
| หลุมที่ AIP ยืนยันว่ามีการติดตั้ง "aircraft bridge" | 31, 33, 35 (7–29 MAY 2020); 32, 34, 36; 41, 43, 45; 42, 44, 46; 12, 14, 15 (21 SEP–24 NOV 2020) แต่ละหลุมใช้เครน 2 คัน ยอดเครนสูงสุด 204/207 ft AMSL (62/63 m) | [E1] | สูง |
| หลุมประชิดอาคารตามแผนภูมิ | 12, 14, 15; 21–26; 31–36; 41–46; 51–56; 61–68 รวม 35 หลุม | [E9] | สูง (ฉบับ 2020) |
| หลุมจอดทั้งหมด | 101 หลุม; ลานจอด 860,000 m² | [E5] | กลาง (หน้าเว็บ ทอท. ไม่ระบุวันที่ของข้อมูล) |
| ทุกหลุมเป็นแบบหันหัวเข้า (nose-in) | ใช่ | [E9] | สูง |
| แบบของ PBB (apron-drive, ผนังกระจกหรือเหล็ก) | ไม่พบในแหล่งเปิด | – | – |

ตำแหน่ง PBB รายหลุมอยู่ใน JSON `boarding_bridges` ตำแหน่งนั้นคือประตูของ pier จาก OSM [E17] ซึ่งห่างขอบ polygon ของ repo 5–13 m ส่วนตำแหน่งเครนใน SUP A19/20 ห่างประตูเหล่านี้ 3–15 m (ไฟล์ `sup_a19_20_cranes.json`) จึงยืนยันได้ว่าเลขหลุมกับประตูจับคู่ถูกต้อง พิกัดใน SUP เขียนผิดรูปแบบ (เช่น "13°92'36.79"N") ที่ถูกคือองศาทศนิยม 13.923679 ซึ่งตรวจแล้วว่าตกใกล้ประตูหลุม 12 ห่าง 12.6 m [E1]

#### ตาราง E-3 อาคารอื่นในเขตและขอบสนามบิน (ฝั่งพลเรือน)

| อาคาร | การระบุ | lat, lon | [e, n] m | L × W (m), พื้นที่ (m²) | ความสูงที่วัดได้ (m) | ที่เสนอ (ค่าประมาณ) | repo ตอนนี้ | ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|---|
| อาคารจอดรถ 7 ชั้น | "อาคารจอดรถ 7 ชั้น" ที่ skywalk เข้าชั้น 2 [E6]; ป้าย PARKING BLDG [E9] | 13.916446, 100.600532 | −557.6, 229.5 | 104.2 × 74.0, 7,540 [E11] | 2.5D P50 16.9, P90 26.5 (มัธยฐาน 8 ปี; presence 0.06 จึงเชื่อได้น้อย) [E12]; COP มัธยฐาน 19.4, P90 21.3 [E18] | พื้นดาดฟ้า 18 m, ยอดหลังคาบันได 21 m; 7 ชั้น | ไม่มีใน bld (ไม่ได้วาด) | กลาง (ชั้น), ต่ำ (ความสูง) |
| skywalk สถานีรถไฟ → อาคารจอดรถ | ยาว 110 m กว้าง 6 m ปรับอากาศ มีลิฟต์ 1 ตัว และบันไดลงถนนวิภาวดีฯ เปิด 2 AUG 2021 [E6] | – | ช่วงระหว่าง (−845, 36) กับ (−558, 230) | ระยะช่องว่างที่วัดได้ 105.5 m [E11] | – | พื้นทางเดินอยู่ระดับชั้น 2 ≈ 6 m (ค่าประมาณ) | ไม่มี | สูง (ความยาว) |
| โรงแรมอมารี ดอนเมือง | 429 ห้อง; ทางเดินเข้าอาคาร 1 ชั้น 2 ระหว่างประตู 5–6 [E7]; ป้าย HOTEL [E9] | 13.920909, 100.600156 | −598.2, 723.2 | 122.2 × 76.0, 9,249 [E11] | 2.5D P50 18.6, P90 22.6 [E12]; COP 12.7, 14.1 [E18] | 20 m (14–24); จำนวนชั้นยังไม่รู้ | อยู่ใน city footprint | ต่ำ |
| ทางเดินโรงแรม → อาคาร 1 | ทางเดินยกระดับปิดกระจก [E10] | – | ช่วงจาก (−598, 723) ถึงหน้าอาคาร 1 | ระยะช่องว่าง 156.2 m [E11] ข้ามถนนวิภาวดีฯ และทางยกระดับ | – | พื้นทางเดินชั้น 2 ต้องอยู่สูงกว่าทางยกระดับ (≈15 m ตามกฎข้อ 7) หรือลอดใต้ (ยังไม่รู้) | ไม่มี | ต่ำ (รูปทรง) |
| อาคารสำนักงานท่าอากาศยานดอนเมือง | ชื่อตาม OSM/Overture [E11]; ป้าย AIRPORT OFFICE [E9] | 13.922836, 100.603931 | −190.3, 936.4 | 108.6 × 89.5, 9,457 [E11] | 2.5D P50 22.6, P90 27.8 [E12]; COP 16.2, 22.7 [E18] | 24 m | footprint เล็ก 180 m² สูง 8.3 m | ต่ำ |
| อาคารผู้โดยสารอากาศยานส่วนบุคคล (GA/private jet) | ชื่อตาม OSM [E11]; ป้าย MJETS HANGAR บนแผนภูมิ [E9] | 13.923315, 100.604577 | −120.5, 989.4 | 72.7 × 39.2, 2,429 [E11] | 2.5D P50 15.8 [E12]; COP 5.2, 14.3 [E18] (ไม่ตรงกัน) | 12 m | ไม่มี | ต่ำ |
| อาคารสูงหลังอาคาร 1 (w200147368) | ไม่มีชื่อ | 13.921942, 100.603747 | −210.1, 837.5 | 93.1 × 46.0, 4,219 [E11] | 2.5D P50 25.4, P90 28.6 [E12] | 27 m | ไม่มี | ต่ำ |
| คลังสินค้าแนวยาว (CARGO BLDG 1–4) | ป้ายบนแผนภูมิ [E9]; ปรับปรุงคลัง 1–2, คลัง 4 → อาคารเครื่องบินส่วนบุคคล [E4] | 13.906357, 100.595542 | −1097.0, −886.8 | 624.3 × 104.4, 65,098 [E11] | 2.5D P50 15.9, P90 19.0 [E12]; COP 10.5, 14.4 [E18] | 16 m | 'w' 64,138 m², 21.4 m | กลาง (footprint), ต่ำ (ความสูง) |
| คลังสินค้าใต้ 1 (WARE HOUSE?) | ป้าย WARE HOUSE 1/2 [E9] (จับคู่กับ footprint จากตำแหน่ง) | 13.901786, 100.592929 | −1379.3, −1392.6 | 245.6 × 114.5, 28,050 [E11] | 2.5D P50 19.3, P90 23.2 [E12] | 19 m | 'w' 23.0 m | ต่ำ |
| คลังสินค้าใต้ 2 | เหมือนข้างบน | 13.899341, 100.591582 | −1524.8, −1663.0 | 185.2 × 102.2, 18,877 [E11] | 2.5D P50 16.3, P90 20.4 [E12] | 16 m | 'w' 23.1 m | ต่ำ |
| โรงซ่อม N1 (ใหญ่สุด) | ป้าย B747 HANGAR / TWIN HANGAR อยู่ในกลุ่มนี้ [E9]; ฐานซ่อมของการบินไทย [E16] | 13.926759, 100.606255 | 60.9, 1370.5 | 162.9 × 93.0, 15,112 [E11] | 2.5D P50 26.2, P90 32.3 [E12] | ยอด 30 m; ประตูกว้าง ≥ 70 m (ค่าประมาณ ดูสมการ E-4) | รวม 3 หลังเป็น 'w' 23,980 m², 23.6 m | ต่ำ–กลาง |
| โรงซ่อม N2 | เหมือนข้างบน | 13.927892, 100.607234 | 166.7, 1495.8 | 149.5 × 65.7, 9,805 [E11] | 2.5D P50 23.9, P90 27.6 [E12] | 27 m | (รวมใน 'w' ข้างบน) | ต่ำ |
| โรงซ่อม N3 | เหมือนข้างบน | 13.928524, 100.607264 | 170.0, 1565.7 | 214.6 × 93.2, 10,595 [E11] | 2.5D P50 18.6, P90 23.8 [E12] | 22 m | (รวมใน 'w' ข้างบน) | ต่ำ |
| โรงซ่อม N4 (หันตั้งฉาก) | เหมือนข้างบน | 13.929376, 100.607889 | 237.5, 1660.0 | 98.0 × 71.1, 6,944 [E11] | 2.5D P50 20.8, P90 22.8 [E12] | 22 m | 'w' 24,746 m², 22.0 m | ต่ำ |
| อาคารโรงงาน/ENGINE SHOP? (w194900823) | ป้าย ENGINE SHOP / WORK SHOP [E9] (การจับคู่ยังไม่ยืนยัน) | 13.931021, 100.608848 | 341.1, 1841.9 | 149.6 × 99.4, 14,679 [E11] | 2.5D P50 21.8, P90 25.0 [E12] | 22 m | 'w' 18,365 m², 24.3 m | ต่ำ |
| อาคารจอดรถทางเหนือ (w194900813) | Overture class parking; ป้าย PARKING BLDG ตัวที่สอง [E9] | 13.931337, 100.608315 | 283.5, 1877.0 | 162.5 × 32.7, 4,879 [E11] | 2.5D P50 28.2, P90 32.4 [E12] | 24 m (ยังไม่รู้จำนวนชั้น) | รวมใน 'w' 24.3 m | ต่ำ |
| สถานีดับเพลิง 1 (FIRE STN NR 1) | ป้าย [E9]; footprint 2 หลังระหว่างทางวิ่ง | 13.914511, 100.607718 | 219.0, 15.4 (และ 219.0, −16.9) | 75.0 × 15.3 และ 129.0 × 19.0 [E11] | 2.5D P50 5.6 และ 4.8 [E12] | 7 m (โรงรถดับเพลิงชั้นเดียว) | 'b' 8.9 m | กลาง |
| สถานีดับเพลิง 2 (FIRE STN NO.2) | ป้ายอยู่ติด TWR-S [E9] | 13.910383, 100.597366 | −899.8, −441.4 | 98.8 × 35.5, 2,997 [E11] | 2.5D P50 8.2, P90 9.3 [E12] | 8.5 m | ไม่มี | กลาง |
| ถังน้ำมัน 8 ใบ (คลังน้ำมันอากาศยาน) | ป้าย BAFS บนแผนภูมิ [E9]; อยู่นอกรั้วสนามบินไปทางตะวันตก 164 m (วัดจาก boundary ของ OSM) | 13.904337, 100.591325 (กึ่งกลางกลุ่ม) | −1552.7, −1110.3 | Ø 25.2 m ทุกใบ [E11] | 2.5D P90 14.2–22.0 [E12] | 16 m (ค่าเดียวกันทุกใบ) | ไม่ทราบ | ต่ำ |
| เสาหรือโครงสร้างสูงเหนือ GA (−10, 1267) | จุดสูงสุดใน 2.5D | 13.925824, 100.605599 | −10, 1267 | – | มัธยฐาน 8 ปี 49.2 m (41.4–54.6) [E12] | ตรวจกับ AD 2.10 ในส่วนที่ 1 ก่อนเพิ่ม | ไม่มี | ต่ำ |

พื้นที่ทหารฝั่งตะวันออกของทางวิ่ง (ลานจอดฝั่งตะวันออก โรงเก็บเครื่องบิน อาคาร) ให้วาดแบบทั่วไปตามกฎข้อ 4 โดยใช้ footprint ที่ repo มีอยู่แล้ว (kind 'm' และ 'h') ไม่ต้องลงรายละเอียดเพิ่ม

#### ตาราง E-4 หอบังคับการบิน

| รายการ | TWR-S (หอหลัก) | TWR-N | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|
| ป้ายบนแผนภูมิ | "TWR-S" อยู่ติดกับ FIRE STN NO.2 | "AIS/MET/TWR-N" (อาคาร AIS/MET ที่มีห้องควบคุม) | [E9][E21] (ป้ายทั้งสองยังอยู่ในแผนภูมิชุด 2025) | สูง |
| ไฟ ABN | อยู่บนยอด TWR-S | – | ส่วนที่ 1 [A3] / [E15] | สูง |
| ตำแหน่งฐาน (footprint) | 13.911040, 100.597739; [e −859.4, n −368.7]; 23.6 × 18.4 m ยาวตามแนว 121.5° | อยู่ในหรือติดอาคารสำนักงานทางเหนือ ไม่มี footprint แยก | [E11] | กลาง |
| จุดสูงสุดที่วัดได้ | 48.5 m (มัธยฐานปี 2016–2023: 49.0, 44.9, 40.8, 38.6, 48.0, 48.9, 65.0, 57.9) [E12]; 56.9 m ที่ (−857, −373) [E14] | 27.1 m (ปี 2016–2021: 25.1–28.2 m; ปี 2022–23 ได้ 46–47 m ซึ่งน่าจะเป็นเครนหรือโครงสร้างชั่วคราว) [E12] | [E12][E14] | ต่ำ–กลาง |
| repo ตอนนี้ | (−893, −355); ฐาน 24 × 12 × 18 m; พื้นห้องควบคุม ≈45 m; กระจกถึง ≈50 m; เสาอากาศถึง ≈59 m | (−254, 929); พื้นห้องควบคุม ≈29 m | `src/50-airfield.js` บรรทัด 472–473 | – |
| รูปทรง สี วัสดุ | ไม่พบเอกสารหรือภาพที่มีสัญญาอนุญาตเปิดและอ่านได้ในรอบนี้ (ดูหัวข้อช่องว่าง) | เหมือนกัน | – | – |

### สมการ

1. **การฉายพิกัด** (เหมือน `src/15-geo.js`): e = (λ − λ0)·N·cos φ0, n = (φ − φ0)·M โดย M = a(1−e²)/(1−e² sin²φ0)^1.5 และ N = a/√(1−e² sin²φ0) ใช้ WGS-84 กับ ARP 13°54′51.74″N 100°36′20.49″E ส่วนสูตรย้อนกลับคือ φ = φ0 + n/M และ λ = λ0 + e/(N cos φ0) (มุมเป็นเรเดียน)

2. **ความสูงอาคารจากจำนวนชั้น** (ค่าประมาณ): H_roof = (N_levels − 1)·h_ff + h_top
   - อาคารจอดรถ 7 ชั้น (ชั้นบนสุดเป็นดาดฟ้าเปิด): h_ff = 3.0 m (ช่วงทั่วไปของอาคารจอดรถ 2.9–3.2 m, ค่าประมาณ) ได้พื้นดาดฟ้า = 6 × 3.0 = **18.0 m** ส่วนหลังคาบันไดหรือลิฟต์ใช้ h_top ≈ 3 m ได้ **21 m** ค่านี้เข้ากับ COP มัธยฐาน 19.4 m และ P90 21.3 m [E18]
   - โถงอาคารผู้โดยสาร (ชั้น 1 ขาเข้า, ชั้น 2 ทางเชื่อม, ชั้น 3 ขาออก [E6]): ถ้า h_ff ≈ 5 m ชั้น 3 จะอยู่ที่ ≈10 m และโถงขาออกสูงโปร่ง 12–14 m ได้ยอดหลังคา ≈ 22–24 m (ค่าประมาณ) ซึ่งเข้ากับ [E12][E18]

3. **ความสูงที่วัดจากดาวเทียม**: H_est = median_y( P50_y ) โดย y คือปี 2016–2023 และ P50_y คือเปอร์เซ็นไทล์ 50 ของพิกเซล 2.5D ที่อยู่ใน footprint ในปีนั้น [E12] ค่า sd ข้ามปีใช้เป็นตัวบอกความแปรปรวน (โถงอาคาร 1: sd 3.0 m) และค่า presence (สัดส่วนพิกเซลที่จัดเป็นอาคาร) ต่ำกว่า 0.3 หมายถึงค่าเชื่อได้น้อย

4. **ช่องประตูโรงซ่อมขั้นต่ำ** (ค่าประมาณ): W_door ≥ b_max + 2·c และ H_door ≥ H_tail + c_v โดย b_max คือช่วงปีกของเครื่องที่ใหญ่สุดที่ซ่อม c ≈ 3 m ต่อข้าง และ c_v ≈ 1.5 m (ระยะเผื่อทั่วไป เป็นค่าประมาณ) ค่าช่วงปีกและความสูงหางให้เอาจาก Airport Planning document ของผู้ผลิต (ส่วนข้อมูลเครื่องบินของรายงานนี้) เพราะรอบนี้ไม่ได้อ่านเอกสารเหล่านั้น เมื่อโรงซ่อม N1 รับ B747-400 ได้ [E16] ความกว้าง 93 m ของ footprint [E11] ก็เพียงพอสำหรับหนึ่งลำต่อช่อง

5. **สีหลังคาจาก Sentinel-2**: ρ = DN·10⁻⁴ − 0.1 (offset ของ L2A ตั้งแต่ processing baseline 04.00; ฉากที่ใช้เป็น baseline 05.11) จากนั้นแปลงเป็น sRGB ด้วย c = 1.055·ρ^(1/2.4) − 0.055 เมื่อ ρ > 0.0031308 และ c = 12.92·ρ เมื่อน้อยกว่านั้น ใช้แถบ B04/B03/B02 และค่ามัธยฐานของพิกเซล 10 m ที่อยู่ใน footprint จากฉาก S2A_47PPR_20260112 (12 JAN 2026, เมฆ 0.001%) [E13] ค่า "alb" ใน JSON คือ luminance ของ reflectance = 0.2126ρ_R + 0.7152ρ_G + 0.0722ρ_B ซึ่งไม่ใช่ broadband albedo ข้อควรระวัง: ค่านี้ยังไม่ได้แก้ผลบรรยากาศที่เหลือและไม่ได้ทำ BRDF footprint ที่แคบกว่า 3 พิกเซล (เช่น pier ใน repo บางชิ้น) มีพิกเซลขอบปนอยู่มาก และค่าลบใน refl เกิดจาก offset ในบริเวณเงา

### พารามิเตอร์ (JSON)

ทุกค่าความสูงในบล็อกนี้เป็นค่าประมาณ (`est: true`) ค่า `measured` คือค่าดิบจาก [E12] (obt_* = มัธยฐานของ P50/P90 รายปี 2016–2023 ตรงกับตาราง E-1 และ E-3) และ [E18] (cop_*) ส่วน `colour_hex` ของหลังคาเป็นค่าประมาณจาก Sentinel-2 [E13] คิดจากพิกเซลใน footprint ของชิ้นส่วนเดียวกับ `overture_key` (ตรงกับหัวข้อสรุป) ส่วน `lum_refl` คิดจาก polygon OSM ทั้งหลังที่ครอบชิ้นส่วนนั้น จึงใช้เป็นค่าคร่าว ๆ เท่านั้น ค่า `door_en` ของสะพานเทียบคือตำแหน่งประตู pier จาก OSM [E17] ไม่ใช่หัวสะพาน

```json
{
 "meta":{"section":5,"frame":"local metres from ARP via ll_to_en (src/15-geo.js)","date":"2026-11-17","note":"heights are estimates (est=true) unless stated"},
 "buildings":[
  {"id":"T1","name_th":"อาคารผู้โดยสาร 1 (ระหว่างประเทศ)","name_en":"Terminal 1 (international)","use":"terminal","lat":13.920104,"lon":100.602624,"en":[-331.5,634.2],"footprint":{"L_m":268.5,"W_m":120.8,"axis_deg":28.1,"area_m2":27164,"overture_key":"T1_hall"},"height_m":24.0,"height_range_m":[21,27],"levels":"3-4 (est)","measured":{"obt_p50":25.2,"obt_p90":30.1,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":21.2,"cop_p90":23.2},"roof":{"shape":"low-slope with light strips (skylights?), est","colour_hex":"#334c35","colour_src":"E13","colour_est":true,"lum_refl":0.075,"material":"metal sheet (est)"},"facade":{"material":"glass curtain wall at kerb (unverified)","colour_hex":null},"src":["E5","E10","E11","E12","E18"],"conf":"low-medium","est":true},
  {"id":"T2","name_th":"อาคารผู้โดยสาร 2 (ในประเทศ)","name_en":"Terminal 2 (domestic)","use":"terminal","lat":13.917983,"lon":100.601509,"en":[-452.0,399.5],"footprint":{"L_m":306.7,"W_m":110.3,"axis_deg":27.9,"area_m2":28754,"overture_key":"T2_hall"},"height_m":24.0,"height_range_m":[21,27],"levels":"3 public levels: L1 arrivals, L2 link, L3 departures","measured":{"obt_p50":23.9,"obt_p90":27.9,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":22.2,"cop_p90":26.1},"roof":{"shape":"low-slope, est","colour_hex":"#556849","colour_src":"E13","colour_est":true,"lum_refl":0.111,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E5","E6","E10","E11","E12","E18"],"conf":"low-medium","est":true},
  {"id":"NC_END","name_th":"North Corridor ส่วนปลาย (หลุม 12/14/15)","name_en":"North Corridor end (stands 12, 14, 15)","use":"pier","lat":13.923646,"lon":100.604978,"en":[-77.1,1026.0],"footprint":{"L_m":173.7,"W_m":62.5,"axis_deg":28.8,"area_m2":4689,"overture_key":"pier1"},"height_m":15.0,"height_range_m":[13,17],"levels":null,"measured":{"obt_p50":16.9,"obt_p90":20.1,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":0.2,"cop_p90":1.7},"roof":{"shape":"flat/low-slope, est","colour_hex":"#47422f","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E1","E9","E11","E12"],"conf":"low-medium","est":true},
  {"id":"NC_LINK","name_th":"North Corridor ส่วนเชื่อม","name_en":"North Corridor link","use":"corridor","lat":13.92193,"lon":100.604086,"en":[-173.5,836.2],"footprint":{"L_m":287.3,"W_m":41.6,"axis_deg":30.5,"area_m2":5797,"overture_key":"north_corridor"},"height_m":14.0,"height_range_m":[11,17],"levels":null,"measured":{"obt_p50":20.1,"obt_p90":25.6,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":6.2,"cop_p90":9.7},"roof":{"shape":"flat, est","colour_hex":"#3c3b1f","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"P2","name_th":"Pier 2 (หลุม 21-26)","name_en":"Pier 2 (stands 21-26)","use":"pier","lat":13.920584,"lon":100.604755,"en":[-101.2,687.3],"footprint":{"L_m":221.9,"W_m":76.9,"axis_deg":119.4,"area_m2":7494,"overture_key":"pier2"},"height_m":14.0,"height_range_m":[12,16],"levels":null,"measured":{"obt_p50":14.6,"obt_p90":16.5,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":3.9,"cop_p90":7.9},"roof":{"shape":"flat/low-slope, est","colour_hex":"#747274","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"metal sheet, grey (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low-medium","est":true},
  {"id":"P3","name_th":"Pier 3 (หลุม 31-36)","name_en":"Pier 3 (stands 31-36)","use":"pier","lat":13.918366,"lon":100.603494,"en":[-237.5,441.9],"footprint":{"L_m":221.2,"W_m":76.3,"axis_deg":118.7,"area_m2":7391,"overture_key":"pier3"},"height_m":14.0,"height_range_m":[12,16],"levels":null,"measured":{"obt_p50":13.4,"obt_p90":14.9,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":1.9,"cop_p90":5.0},"roof":{"shape":"flat/low-slope, est","colour_hex":"#78797d","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"metal sheet, grey (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E1","E9","E11","E12"],"conf":"low-medium","est":true},
  {"id":"P4","name_th":"Pier 4 (หลุม 41-46)","name_en":"Pier 4 (stands 41-46)","use":"pier","lat":13.916131,"lon":100.60227,"en":[-369.8,194.6],"footprint":{"L_m":221.6,"W_m":76.7,"axis_deg":118.7,"area_m2":7338,"overture_key":"pier4"},"height_m":14.0,"height_range_m":[12,16],"levels":null,"measured":{"obt_p50":15.1,"obt_p90":17.6,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":7.4,"cop_p90":10.3},"roof":{"shape":"flat/low-slope, est","colour_hex":"#1a0800","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"dark (est, colour unreliable)"},"facade":{"material":"unknown","colour_hex":null},"src":["E1","E9","E11","E12"],"conf":"low-medium","est":true},
  {"id":"P5_SC","name_th":"South Corridor และ Pier 5 (หลุม 51-56)","name_en":"South Corridor and Pier 5 (stands 51-56)","use":"pier","lat":13.914573,"lon":100.600695,"en":[-540.0,22.2],"footprint":{"L_m":309.0,"W_m":251.8,"axis_deg":28.9,"area_m2":16174,"overture_key":"pier5_south_corridor"},"height_m":15.0,"height_range_m":[13,20],"levels":null,"measured":{"obt_p50":21.9,"obt_p90":28.3,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":5.8,"cop_p90":18.5},"roof":{"shape":"flat/low-slope, est","colour_hex":"#733e2b","colour_src":"E13","colour_est":true,"lum_refl":0.071,"material":"terracotta/red-brown (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E8","E9","E11","E12"],"conf":"low","est":true},
  {"id":"OLD_DOM","name_th":"อาคารผู้โดยสารในประเทศเดิม (เลิกใช้)","name_en":"Former domestic terminal (disused since 2011)","use":"terminal_disused","lat":13.912488,"lon":100.598501,"en":[-777.1,-208.5],"footprint":{"L_m":271.8,"W_m":64.7,"axis_deg":28.0,"area_m2":14674,"overture_key":"old_dom_hall"},"height_m":16.0,"height_range_m":[14,19],"levels":null,"measured":{"obt_p50":15.9,"obt_p90":19.0,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":12.4,"cop_p90":15.8},"roof":{"shape":"low-slope, est","colour_hex":"#2d2600","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"dark (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E10","E11","E12","E18"],"conf":"medium","est":true},
  {"id":"P6","name_th":"Pier 6 (หลุม 61-68)","name_en":"Pier 6 (stands 61-68)","use":"pier","lat":13.911665,"lon":100.599506,"en":[-668.5,-299.5],"footprint":{"L_m":210.7,"W_m":28.7,"axis_deg":118.5,"area_m2":5489,"overture_key":"pier6"},"height_m":15.0,"height_range_m":[13,18],"levels":null,"measured":{"obt_p50":16.4,"obt_p90":18.6,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":1.9,"cop_p90":2.6},"roof":{"shape":"flat/low-slope, est","colour_hex":"#706a4b","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"khaki/grey (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low-medium","est":true},
  {"id":"CP7","name_th":"อาคารจอดรถ 7 ชั้น","name_en":"7-storey car park","use":"car_park","lat":13.916446,"lon":100.600532,"en":[-557.6,229.4],"footprint":{"L_m":104.2,"W_m":74.0,"axis_deg":29.2,"area_m2":7540,"overture_key":"carpark_7storey"},"height_m":21.0,"height_range_m":[18,22],"levels":7,"measured":{"obt_p50":16.9,"obt_p90":26.5,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":19.4,"cop_p90":21.3},"roof":{"shape":"open roof deck at 18 m + stair/lift cores to 21 m (est)","colour_hex":"#463e30","colour_src":"E13","colour_est":true,"lum_refl":0.044,"material":"concrete"},"facade":{"material":"open concrete decks (est)","colour_hex":null},"src":["E6","E9","E11","E12","E18"],"conf":"medium (levels), low (height)","est":true,"roof_deck_m":18.0,"floor_to_floor_m":3.0},
  {"id":"HOTEL","name_th":"โรงแรมอมารี ดอนเมือง","name_en":"Amari Don Muang Airport Bangkok","use":"hotel","lat":13.920909,"lon":100.600156,"en":[-598.3,723.2],"footprint":{"L_m":122.2,"W_m":76.0,"axis_deg":118.8,"area_m2":9249,"overture_key":"hotel_r2623703"},"height_m":20.0,"height_range_m":[14,24],"levels":null,"measured":{"obt_p50":18.6,"obt_p90":22.6,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":12.7,"cop_p90":14.1},"roof":{"shape":"flat, est","colour_hex":"#3a2c0e","colour_src":"E13","colour_est":true,"lum_refl":0.026,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E7","E9","E11","E12","E18"],"conf":"low","est":true,"rooms":429},
  {"id":"AOT_OFFICE","name_th":"อาคารสำนักงานท่าอากาศยานดอนเมือง","name_en":"Don Mueang Airport office building","use":"office","lat":13.922836,"lon":100.603931,"en":[-190.3,936.4],"footprint":{"L_m":108.6,"W_m":89.5,"axis_deg":118.8,"area_m2":9457,"overture_key":"aot_office"},"height_m":24.0,"height_range_m":[18,28],"levels":null,"measured":{"obt_p50":22.6,"obt_p90":27.8,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":16.2,"cop_p90":22.7},"roof":{"shape":"flat, est","colour_hex":"#38413b","colour_src":"E13","colour_est":true,"lum_refl":0.046,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12","E18"],"conf":"low","est":true},
  {"id":"GA_TERM","name_th":"อาคารผู้โดยสารอากาศยานส่วนบุคคล","name_en":"Private aviation terminal","use":"ga_terminal","lat":13.923315,"lon":100.604577,"en":[-120.5,989.4],"footprint":{"L_m":72.7,"W_m":39.2,"axis_deg":28.8,"area_m2":2429,"overture_key":"ga_terminal"},"height_m":12.0,"height_range_m":[6,20],"levels":null,"measured":{"obt_p50":15.8,"obt_p90":17.5,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":5.2,"cop_p90":14.3},"roof":{"shape":"flat, est","colour_hex":"#9d9475","colour_src":"E13","colour_est":true,"lum_refl":0.279,"material":"light (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12","E18"],"conf":"low","est":true},
  {"id":"CARGO","name_th":"กลุ่มคลังสินค้า (CARGO BLDG 1-4)","name_en":"Cargo buildings 1-4","use":"cargo","lat":13.906357,"lon":100.595542,"en":[-1096.9,-886.8],"footprint":{"L_m":624.3,"W_m":104.4,"axis_deg":28.4,"area_m2":65098,"overture_key":"cargo_w145937308"},"height_m":16.0,"height_range_m":[14,20],"levels":null,"measured":{"obt_p50":15.9,"obt_p90":19.0,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":10.5,"cop_p90":14.4},"roof":{"shape":"low-pitch metal, est","colour_hex":"#7b7363","colour_src":"E13","colour_est":true,"lum_refl":0.17,"material":"metal sheet, grey-beige (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E4","E9","E11","E12","E18"],"conf":"medium (footprint), low (height)","est":true},
  {"id":"WH_S1","name_th":"คลังสินค้าใต้ 1","name_en":"South warehouse 1","use":"warehouse","lat":13.901786,"lon":100.592929,"en":[-1379.3,-1392.5],"footprint":{"L_m":245.6,"W_m":114.5,"axis_deg":27.7,"area_m2":28050,"overture_key":"sw_w145937362"},"height_m":19.0,"height_range_m":[16,23],"levels":null,"measured":{"obt_p50":19.3,"obt_p90":23.2,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":13.1,"cop_p90":20.0},"roof":{"shape":"low-pitch metal, est","colour_hex":"#7e7565","colour_src":"E13","colour_est":true,"lum_refl":0.181,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"WH_S2","name_th":"คลังสินค้าใต้ 2","name_en":"South warehouse 2","use":"warehouse","lat":13.899341,"lon":100.591582,"en":[-1524.9,-1663.0],"footprint":{"L_m":185.2,"W_m":102.2,"axis_deg":28.2,"area_m2":18877,"overture_key":"sw_w145937365"},"height_m":16.0,"height_range_m":[14,20],"levels":null,"measured":{"obt_p50":16.3,"obt_p90":20.4,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":15.4,"cop_p90":21.9},"roof":{"shape":"low-pitch metal, est","colour_hex":"#837f78","colour_src":"E13","colour_est":true,"lum_refl":0.211,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"HGR_N1","name_th":"โรงซ่อม N1","name_en":"Maintenance hangar N1","use":"hangar","lat":13.926759,"lon":100.606255,"en":[60.9,1370.5],"footprint":{"L_m":162.9,"W_m":93.0,"axis_deg":28.9,"area_m2":15112,"overture_key":"hangar_w194900816"},"height_m":30.0,"height_range_m":[26,36],"levels":null,"measured":{"obt_p50":26.2,"obt_p90":32.3,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":10.9,"cop_p90":12.8},"roof":{"shape":"low-pitch or arched, est","colour_hex":"#999d9b","colour_src":"E13","colour_est":true,"lum_refl":0.314,"material":"metal sheet, light grey (est)"},"facade":{"material":"metal cladding, large door on apron side (est)","colour_hex":null},"src":["E9","E11","E12","E16"],"conf":"low-medium","est":true},
  {"id":"HGR_N2","name_th":"โรงซ่อม N2","name_en":"Maintenance hangar N2","use":"hangar","lat":13.927892,"lon":100.607234,"en":[166.7,1495.8],"footprint":{"L_m":149.5,"W_m":65.7,"axis_deg":28.2,"area_m2":9805,"overture_key":"hangar_w194900821"},"height_m":27.0,"height_range_m":[24,32],"levels":null,"measured":{"obt_p50":23.9,"obt_p90":27.6,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":16.7,"cop_p90":21.9},"roof":{"shape":"low-pitch or arched, est","colour_hex":"#a4a08a","colour_src":"E13","colour_est":true,"lum_refl":0.326,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"HGR_N3","name_th":"โรงซ่อม N3","name_en":"Maintenance hangar N3","use":"hangar","lat":13.928524,"lon":100.607264,"en":[169.9,1565.7],"footprint":{"L_m":214.6,"W_m":93.2,"axis_deg":28.3,"area_m2":10595,"overture_key":"hangar_w194900825"},"height_m":22.0,"height_range_m":[19,27],"levels":null,"measured":{"obt_p50":18.6,"obt_p90":23.8,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":17.2,"cop_p90":19.1},"roof":{"shape":"low-pitch, est","colour_hex":"#8b8d86","colour_src":"E13","colour_est":true,"lum_refl":0.237,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"HGR_N4","name_th":"โรงซ่อม N4","name_en":"Maintenance hangar N4","use":"hangar","lat":13.929376,"lon":100.607889,"en":[237.5,1660.0],"footprint":{"L_m":98.0,"W_m":71.1,"axis_deg":119.5,"area_m2":6944,"overture_key":"hangar_w194900814"},"height_m":22.0,"height_range_m":[20,25],"levels":null,"measured":{"obt_p50":20.8,"obt_p90":22.8,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":15.9,"cop_p90":20.3},"roof":{"shape":"low-pitch, est","colour_hex":"#948b7f","colour_src":"E13","colour_est":true,"lum_refl":0.244,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"SHOP_N","name_th":"อาคารโรงงานทางเหนือ","name_en":"Northern workshop building","use":"workshop","lat":13.931021,"lon":100.608848,"en":[341.1,1842.0],"footprint":{"L_m":149.6,"W_m":99.4,"axis_deg":28.4,"area_m2":14679,"overture_key":"bldg_w194900823"},"height_m":22.0,"height_range_m":[19,25],"levels":null,"measured":{"obt_p50":21.8,"obt_p90":25.0,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":6.3,"cop_p90":9.9},"roof":{"shape":"low-pitch, est","colour_hex":"#979b97","colour_src":"E13","colour_est":true,"lum_refl":0.301,"material":"metal sheet (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"CP_N","name_th":"อาคารจอดรถทางเหนือ","name_en":"Northern parking building","use":"car_park","lat":13.931337,"lon":100.608315,"en":[283.5,1877.0],"footprint":{"L_m":162.5,"W_m":32.7,"axis_deg":28.1,"area_m2":4879,"overture_key":"carpark_w194900813"},"height_m":24.0,"height_range_m":[20,32],"levels":null,"measured":{"obt_p50":28.2,"obt_p90":32.4,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":7.2,"cop_p90":11.3},"roof":{"shape":"flat deck, est","colour_hex":"#000000","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"concrete (est)"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"low","est":true},
  {"id":"FS1","name_th":"สถานีดับเพลิง 1","name_en":"Fire station 1","use":"fire_station","lat":13.914511,"lon":100.607718,"en":[219.0,15.4],"footprint":{"L_m":75.0,"W_m":15.3,"axis_deg":29.1,"area_m2":1144,"overture_key":"fs1_w587737423"},"height_m":7.0,"height_range_m":[5,8],"levels":1,"measured":{"obt_p50":5.6,"obt_p90":6.9,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":2.6,"cop_p90":2.6},"roof":{"shape":"flat, est","colour_hex":"#6d6852","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"medium","est":true},
  {"id":"FS2","name_th":"สถานีดับเพลิง 2","name_en":"Fire station 2","use":"fire_station","lat":13.910383,"lon":100.597366,"en":[-899.8,-441.4],"footprint":{"L_m":98.8,"W_m":35.5,"axis_deg":29.1,"area_m2":2997,"overture_key":"fs2_g"},"height_m":8.5,"height_range_m":[7,10],"levels":null,"measured":{"obt_p50":8.2,"obt_p90":9.3,"obt_basis":"median of yearly P50/P90 2016-2023","cop_med":6.5,"cop_p90":7.6},"roof":{"shape":"flat, est","colour_hex":"#847f72","colour_src":"E13","colour_est":true,"lum_refl":null,"material":"unknown"},"facade":{"material":"unknown","colour_hex":null},"src":["E9","E11","E12"],"conf":"medium","est":true}
 ],
 "towers":[
  {"id":"TWR_S","name_th":"หอบังคับการบินด้านใต้","name_en":"Control tower south","lat":13.91104,"lon":100.597739,"en":[-859.5,-368.7],"base_footprint":{"L_m":23.6,"W_m":18.4,"axis_deg":121.5},"top_m":52.0,"top_range_m":[48.5,56.9],"repo_en":[-893,-355],"move_m":36.3,"abn_on_top":true,"src":["E9","E11","E12","E14","E15"],"conf":"low-medium","est":true},
  {"id":"TWR_N","name_th":"หอบังคับการบินด้านเหนือ (อาคาร AIS/MET/TWR-N)","name_en":"Control tower north (AIS/MET/TWR-N building)","top_m":27.1,"top_range_m":[25.1,28.2],"repo_en":[-254,929],"src":["E9","E12"],"conf":"low","est":true,"note":"position not re-measured; keep repo position"}
 ],
 "boarding_bridges":{
  "total":33,
  "total_src":["E2","E3"],
  "total_conf":"medium",
  "manufacturer":"PT Bukaka Teknik Utama",
  "contract":"22 Oct 2019 via M-Solution Co., Ltd., with 3 moving walkways, USD 7.5 million",
  "contract_src":["E2","E3","E20"],
  "located":[
   {"stand":"12","pier":"North Corridor","door_lat":13.923661,"door_lon":100.60532,"door_en":[-40.2,1027.7],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"14","pier":"North Corridor","door_lat":13.923124,"door_lon":100.604982,"door_en":[-76.7,968.3],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"15","pier":"North Corridor","door_lat":13.92257,"door_lon":100.604667,"door_en":[-110.7,907.0],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"21","pier":"Pier 2","door_lat":13.921121,"door_lon":100.604503,"door_en":[-128.5,746.7],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"22","pier":"Pier 2","door_lat":13.920633,"door_lon":100.603907,"door_en":[-192.9,692.7],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"23","pier":"Pier 2","door_lat":13.920814,"door_lon":100.605087,"door_en":[-65.4,712.7],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"24","pier":"Pier 2","door_lat":13.92032,"door_lon":100.604505,"door_en":[-128.2,658.0],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"25","pier":"Pier 2","door_lat":13.92048,"door_lon":100.605644,"door_en":[-5.1,675.8],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"26","pier":"Pier 2","door_lat":13.920005,"door_lon":100.60509,"door_en":[-65.0,623.2],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"31","pier":"Pier 3","door_lat":13.91891,"door_lon":100.603252,"door_en":[-263.7,502.0],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"32","pier":"Pier 3","door_lat":13.91841,"door_lon":100.60267,"door_en":[-326.6,446.7],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"33","pier":"Pier 3","door_lat":13.91859,"door_lon":100.603847,"door_en":[-199.4,466.7],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"34","pier":"Pier 3","door_lat":13.918082,"door_lon":100.603264,"door_en":[-262.4,410.4],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"35","pier":"Pier 3","door_lat":13.918271,"door_lon":100.604394,"door_en":[-140.2,431.4],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"36","pier":"Pier 3","door_lat":13.917778,"door_lon":100.60385,"door_en":[-199.0,376.8],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"41","pier":"Pier 4","door_lat":13.916691,"door_lon":100.602007,"door_en":[-398.2,256.5],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"42","pier":"Pier 4","door_lat":13.916174,"door_lon":100.601408,"door_en":[-463.0,199.3],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"43","pier":"Pier 4","door_lat":13.916374,"door_lon":100.602596,"door_en":[-334.6,221.5],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"44","pier":"Pier 4","door_lat":13.915855,"door_lon":100.602006,"door_en":[-398.3,164.0],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"45","pier":"Pier 4","door_lat":13.916068,"door_lon":100.603188,"door_en":[-270.6,187.6],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"46","pier":"Pier 4","door_lat":13.915535,"door_lon":100.602586,"door_en":[-335.6,128.7],"installed_2020_per_sup":true,"src":["E1","E9","E17"],"conf":"high"},
   {"stand":"51","pier":"Pier 5","door_lat":13.914335,"door_lon":100.600673,"door_en":[-542.4,-4.1],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"52","pier":"Pier 5","door_lat":13.913937,"door_lon":100.600183,"door_en":[-595.3,-48.1],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"53","pier":"Pier 5","door_lat":13.914011,"door_lon":100.60126,"door_en":[-478.9,-40.0],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"54","pier":"Pier 5","door_lat":13.913625,"door_lon":100.600772,"door_en":[-531.7,-82.7],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"55","pier":"Pier 5","door_lat":13.913695,"door_lon":100.601863,"door_en":[-413.8,-74.9],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"},
   {"stand":"56","pier":"Pier 5","door_lat":13.913305,"door_lon":100.601363,"door_en":[-467.8,-118.1],"installed_2020_per_sup":false,"src":["E9","E17"],"conf":"medium"}
  ],
  "pier6_doors_unnumbered":[
   {"stand":null,"pier":"Pier 6","door_lat":13.911811,"door_lon":100.598692,"door_en":[-756.5,-283.4],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.911838,"door_lon":100.599728,"door_en":[-644.5,-280.4],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.912065,"door_lon":100.599303,"door_en":[-690.4,-255.3],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.91111,"door_lon":100.600003,"door_en":[-614.8,-360.9],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.911441,"door_lon":100.600484,"door_en":[-562.8,-324.3],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.911607,"door_lon":100.600159,"door_en":[-597.9,-305.9],"src":["E9","E17"],"conf":"low"},
   {"stand":null,"pier":"Pier 6","door_lat":13.911591,"door_lon":100.599115,"door_en":[-710.8,-307.7],"src":["E9","E17"],"conf":"low"}
  ],
  "unlocated":6,
  "note":"27 located at stands; the remaining 6 are probably at Pier 6 (8 contact stands 61-68) but this is not confirmed"
 },
 "skywalks":[
  {"id":"SW_SRT_CP7","from":"Don Mueang SRT station","to":"7-storey car park level 2, then Terminal 2","length_m":110,"width_m":6,"opened":"2021-08-02","measured_gap_m":105.5,"deck_m_est":6.0,"src":["E6","E11"],"conf":"high (length), low (deck height)"},
  {"id":"SW_HOTEL_T1","from":"Amari Don Muang hotel","to":"Terminal 1 level 2 between doors 5 and 6; enclosed glass walkway continues to Terminal 2","measured_gap_m":156.2,"src":["E7","E10","E11"],"conf":"low (geometry)"}
 ],
 "fuel_tanks":[
  {"lat":13.903798,"lon":100.591235,"en":[-1562.4,-1169.9],"diam_m":25.2,"height_m":16.0,"obt_p90":18.5,"est":true},
  {"lat":13.903969,"lon":100.590929,"en":[-1595.5,-1151.0],"diam_m":25.2,"height_m":16.0,"obt_p90":20.6,"est":true},
  {"lat":13.904116,"lon":100.591417,"en":[-1542.7,-1134.7],"diam_m":25.2,"height_m":16.0,"obt_p90":14.2,"est":true},
  {"lat":13.904279,"lon":100.591065,"en":[-1580.8,-1116.7],"diam_m":25.2,"height_m":16.0,"obt_p90":19.0,"est":true},
  {"lat":13.904394,"lon":100.591585,"en":[-1524.6,-1104.0],"diam_m":25.2,"height_m":16.0,"obt_p90":15.8,"est":true},
  {"lat":13.904584,"lon":100.591229,"en":[-1563.0,-1083.0],"diam_m":25.2,"height_m":16.0,"obt_p90":22.0,"est":true},
  {"lat":13.904678,"lon":100.591742,"en":[-1507.6,-1072.6],"diam_m":25.2,"height_m":16.0,"obt_p90":16.0,"est":true},
  {"lat":13.90488,"lon":100.591399,"en":[-1544.7,-1050.2],"diam_m":25.2,"height_m":16.0,"obt_p90":21.1,"est":true}
 ],
 "fuel_tanks_meta":{"label_on_chart":"BAFS","outside_fence_m":164,"src":["E9","E11","E12"],"conf":"low"}
}
```

### กรณีทดสอบ

ทุกกรณีเขียนเป็น Node test ได้โดยไม่ต้องมี dependency: อ่าน `data/vtbd_af.json` และบล็อก JSON ข้างบน (ควรบันทึกเป็น `data/vtbd_buildings.json` ตามงานข้อ 1) แล้วใช้ `llToNE` ของ `src/15-geo.js` ผ่าน `test/harness.mjs`

| ID | สิ่งที่ทดสอบ | ข้อมูลเข้า | ผลที่คาดหวัง | เกณฑ์ผ่าน | แหล่ง |
|---|---|---|---|---|---|
| T-E01 | การฉายพิกัดของ centroid อาคาร 1 | `llToNE(13.920104, 100.602624)` | [n, e] = [634.2, −331.5] | ±0.5 m | [E11] |
| T-E02 | พื้นที่โถงใน repo เทียบกับ footprint จริง | พื้นที่ `af.hall[1]` (50,366 m²) เทียบกับ T1 + T2 ของ Overture (27,164 + 28,754 = 55,918 m²) | อัตราส่วน 0.90 | 0.85 ≤ อัตราส่วน ≤ 1.05 | [E11] |
| T-E03 | ความสูงยอดหลังคาโถง | ยอดหลังคาของโถงที่ `buildAirfield` สร้าง (ตอนนี้ 19.2 m) | 24 m | \|h − 24\| ≤ 3 m (ตอนนี้ไม่ผ่าน และจะผ่านหลังทำงานข้อ 2) | [E12][E18][E14] |
| T-E04 | ความสูงยอดหลังคา pier | ยอดหลังคา pier ที่ repo สร้าง (ตอนนี้ ≈12.6 m) | 14 m | \|h − 14\| ≤ 2 m | [E12] |
| T-E05 | จำนวนสะพานเทียบ | `boarding_bridges.total` และ `located.length` | 33 และ 27 | ค่าเท่ากันพอดี | [E2][E3][E9] |
| T-E06 | ประตูสะพานเทียบอยู่ที่ขอบ pier | ประตูทั้ง 27 จุดเทียบกับ polygon ของ `af.pier` และ `af.hall` | ระยะถึงขอบ 5.4–12.9 m | ทุกจุด ≤ 15 m | [E17][E11] |
| T-E07 | เลขหลุมใน SUP ตรงกับประตู | ตำแหน่งเครน 15 หลุมใน SUP A19/20 (องศาทศนิยม) เทียบกับประตูที่เลขเดียวกัน | ระยะ 3.2–14.7 m | ทุกหลุม ≤ 16 m และประตูที่ใกล้ที่สุดต้องมีเลขเดียวกัน | [E1][E17] |
| T-E08 | จำนวนหลุมต่อ pier | นับ `located` แยกตาม `pier` | NC 3, Pier 2 6, Pier 3 6, Pier 4 6, Pier 5 6 | เท่ากันพอดี | [E9] |
| T-E09 | ความสูงอาคารจอดรถ | 7 ชั้น, h_ff 3.0 m | พื้นดาดฟ้า 18.0 m และยอด 21 m | ยอดอยู่ใน 18–22 m และ \|ยอด − COP P90 21.3\| ≤ 3 m | [E6][E18] |
| T-E10 | ความยาว skywalk ไปสถานีรถไฟ | ระยะสั้นสุดระหว่าง polygon สถานี (Overture w783249093) กับอาคารจอดรถ (w200147362) | 105.5 m | \|ระยะ − 110\| ≤ 10 m | [E6][E11] |
| T-E11 | ตำแหน่ง TWR-S | จุดศูนย์กลางหอใน `buildAirfield` (`out.towers[0]`) | (e −859.4, n −368.7) | ≤ 10 m (ตอนนี้ห่าง 36.3 m จึงไม่ผ่าน) | [E11][E14] |
| T-E12 | ความสูง TWR-S | ยอดเสาอากาศและยอดกระจกห้องควบคุม | ยอด 48.5–56.9 m | ยอดเสาอากาศอยู่ใน 48–60 m และยอดกระจก ≥ 45 m | [E12][E14] |
| T-E13 | แยกโรงซ่อมฝั่งเหนือ | footprint โรงซ่อม N1–N4 ใน `data/vtbd_af.json` ฉบับใหม่ | 4 footprint, centroid ตาม JSON | centroid ห่าง ≤ 15 m และความสูงของ N1 ≥ 26 m | [E11][E12] |
| T-E14 | ประตู Pier 6 | ประตูใน `pier6_doors_unnumbered` ที่ n > −400 | 7 จุด | ทุกจุดห่างขอบ `af.pier[3]` ≤ 20 m | [E17] |
| T-E15 | ความสูงคลังสินค้า | `af.bld[922].z` (ตอนนี้ 21.4 m) | 16 m | \|z − 16\| ≤ 3 m | [E12][E18] |
| T-E16 | ถังน้ำมัน | 8 รายการใน `fuel_tanks` | Ø 25.2 m ทุกใบ และทุกใบอยู่นอก boundary ของสนามบิน | Ø ±2 m และ point-in-polygon เป็น false | [E11] |

### เทียบกับ repo

| หัวข้อ | repo ตอนนี้ | สิ่งที่พบ | การเปลี่ยนที่เสนอ |
|---|---|---|---|
| โถงผู้โดยสาร (`af.hall[1]`) | polygon เดียว 50,366 m²; กระจกสูงถึง 12 m, facade ถึง 17 m, แผ่นหลังคา 17–19.2 m | เป็นอาคาร 1 (เหนือ) กับอาคาร 2 (ใต้) ต่อกัน รวม 55,918 m² [E11]; ยอดหลังคาราว 24 m [E12][E18] | แยกเป็นสอง polygon (T1, T2) ยกแผ่นหลังคาเป็น 22–24 m และเพิ่มกระจกหรือ facade ช่วง 12–22 m ใส่สีหลังคาตาม JSON (ค่าประมาณ) |
| โถงเก่า (`af.hall[0]`) | ใช้แบบเดียวกับโถงใหม่ (หลังคาถึง 19.2 m) | สูงราว 16 m [E12][E18][E14] และเลิกใช้ตั้งแต่ปี 2011 [E10] | ใช้ความสูง 16 m ไม่เปิดไฟภายใน และใช้วัสดุสีเข้มกว่า |
| pier (`af.pier`) | 12 polygon; หลังคาถึงราว 12.6 m; ไม่มีชื่อ | 6 ส่วนหลักที่จับคู่ได้: pier[11] = North Corridor ส่วนปลาย, pier[10] = NC ส่วนเชื่อม, pier[9] = Pier 2, pier[8] = Pier 3, pier[5] = Pier 4, pier[6] = South Corridor + Pier 5, pier[3] = Pier 6 ส่วน pier[0], [1] (อยู่ไกลทางใต้ที่ (−2487, −3338) และ (−69, −2271)), [2], [4], [7] เป็นชิ้นเล็กหรืออยู่นอกแนวอาคาร | เพิ่ม `name` และ `stands` ให้ polygon ที่จับคู่ได้ ตรวจ pier[0] และ pier[1] ว่าเป็นอาคารผู้โดยสารจริงหรือไม่ (ไม่น่าใช่) ยกหลังคาเป็น 14 m และใช้สีเทาโลหะสำหรับ Pier 2–3 กับสีอิฐสำหรับ Pier 5 (ค่าประมาณ) |
| สะพานเทียบ | ไม่มี | 33 ชุด [E2]; ตำแหน่งหลุม 27 หลุม [E1][E9][E17] | สร้าง PBB 27 ชุดที่ประตูตาม JSON หันไปทางหลุมจอด (ตั้งฉากกับแกน pier ที่ 118.7°/298.7°) อีก 6 ชุดให้วางที่ Pier 6 เป็นตัวเลือกที่ปิดไว้ก่อน |
| เครื่องบินจอด (`55-city.js`) | วางแบบสุ่มที่ปลาย pier ไม่ใช่หลุมจริง | มีเลขหลุมและตำแหน่งประตู 27 หลุม [E1][E17] | วางเครื่องบินที่หลุม 12–56 โดยให้จมูกห่างประตูราว 5–8 m (ค่าประมาณ) แล้วใช้ PBB ต่อถึงประตูเครื่อง |
| อาคารจอดรถ 7 ชั้น | ไม่มีใน `bld` | 104 × 74 m, 7 ชั้น [E6][E11] | เพิ่มเป็นอาคารคอนกรีตเปิดโล่ง 7 ระดับ สูง 18/21 m |
| skywalk | ไม่มี | สถานี → อาคารจอดรถ ยาว 110 m กว้าง 6 m [E6]; โรงแรม → อาคาร 1 [E7][E10] | เพิ่มทางเดินกล่องกระจกกว้าง 6 m ที่ระดับชั้น 2 (≈6 m) ส่วนทางเชื่อมโรงแรมต้องตรวจรูปทรงจากภาพถ่ายก่อน |
| TWR-S | (−893, −355) ยอดเสาอากาศ ≈59 m | ฐานอยู่ที่ (−859.4, −368.7) ยอด 48.5–56.9 m [E11][E12][E14] | ย้ายหอ 36 m ไปที่ (−859.4, −368.7) และหมุนฐานตาม 121.5° คงความสูงเดิม |
| TWR-N | (−254, 929) พื้นห้องควบคุม ≈29 m | ยอดที่วัดได้ราว 27 m [E12] | คงตำแหน่งเดิม ลดยอดรวมให้อยู่ราว 27–30 m |
| โรงซ่อมฝั่งเหนือ | 'w' หลังเดียว 23,980 m² สูง 23.6 m และอีก 2 หลัง (24,746 m² 22.0 m; 18,365 m² 24.3 m) | 4 โรงซ่อม + 1 โรงงาน + 1 อาคารจอดรถ footprint แยกกัน สูง 21–29 m [E11][E12] | แทนด้วย footprint จาก Overture (ODbL) และใส่ประตูโรงซ่อมด้านลานจอด |
| คลังสินค้า | 'w' 21.4–23.1 m | 16–19 m [E12] | ลดความสูงลงตาม JSON |
| อาคารสำนักงาน ทอท. | ชิ้น 's' 180 m² สูง 8.3 m | footprint 9,457 m² สูงราว 24 m [E11][E12] | เพิ่มอาคาร (ค่าประมาณ) |
| เครดิตใน footer | AIP, OSM, ระบุว่าความสูงเป็นค่าประมาณ | ใช้ข้อมูล Overture (ODbL), Google Open Buildings 2.5D (CC BY 4.0), Copernicus Sentinel-2 และ DEM | เพิ่มเครดิตตามหัวข้อแหล่งอ้างอิง |

### ความขัดแย้งและช่องว่าง

1. **จำนวน PBB:** ข่าวสองสำนักให้ 33 ชุด [E2][E3] แต่แผนภูมิปี 2020 มีหลุมประชิดอาคาร 35 หลุม [E9] (รวม Pier 6 อีก 8 หลุม) จึงยังไม่รู้ว่า 33 ชุดนั้นคือทั้งหมดหรือเป็นเฉพาะชุดที่เปลี่ยนใหม่ และอีก 6 ชุดอยู่หลุมใด ทางแก้คือเปิดแผนภูมิ AD 2-VTBD-2-5 ฉบับ 29 OCT 2026 (ส่วนที่ 1) หรือ SUP ฉบับปี 2020–2021 ที่ต่อจาก A19/20 แล้วค้นคำว่า "aircraft bridge" ส่วนแบบของสะพาน (apron-drive หรือไม่ ผนังกระจกหรือเหล็ก) ยังไม่พบ
2. **แผนภูมิที่ใช้เป็นฉบับปี 2020:** ป้ายอาคารและเลขหลุมมาจาก AGMC รอบ 18 JUN 2020 [E9] ส่วนฉบับปัจจุบัน 29 OCT 2026 ยังไม่ได้อ่าน เลขหลุมระยะไกลและชื่ออาคารอาจเปลี่ยนแล้ว ในรอบทวนสอบได้อ่านข้อความของ AGMC ชุด AIRAC 4 SEP 2025 [E21] ผ่านเครื่องมือ พบป้าย TWR-S, AIS/MET/TWR-N, Fire Stn No. 1 และ No. 2, Single Hangar, Twin Hangar, Engine Shop, Work Shop, Cargo Bldg 1–4, Ware House 1–2, Parking Bldg, Hotel, Airport Office และ HQ BAFS ซึ่งตรงกับชุดปี 2020 แต่ไม่พบคำว่า "B747 HANGAR" ในข้อความที่สกัดได้ และเครื่องมือจับคู่เลขหลุมกับ pier ไม่ได้ จึงยังต้องเปิดดูภาพแผนภูมิ
3. **ความสูงอาคาร:** ไม่พบเอกสารจาก ทอท., EIA หรือ TOR ที่ระบุความสูงหรือจำนวนชั้นของอาคาร 1 และ 2 ความสูงทั้งหมดในหัวข้อนี้จึงเป็นค่าประมาณจากดาวเทียม ซึ่งไม่ตรงกันบางจุด: 2.5D ให้ค่าสูงกว่า COP ราว 3–5 m ที่โถงผู้โดยสาร ที่อาคาร GA ได้ 15.8 กับ 5.2 m และที่ Pier 5 ได้ P90 28.3 m ซึ่งน่าจะปนกับหางเครื่องบินที่จอดอยู่ ค่าที่เสนอเลือกค่ากลางระหว่างสองแหล่ง ส่วนส่วนที่ 8 ชี้ว่า 2.5D ให้ค่าสูงเกินสำหรับอาคารเตี้ย [E14]
4. **TWR-N:** ในปี 2022–2023 2.5D พบจุดสูง 46–47 m ใกล้ตำแหน่งนี้ ทั้งที่ปีก่อนหน้าได้ 25–28 m [E12] อาจเป็นเครนก่อสร้างหรือข้อมูลผิดพลาด ยังไม่ได้ยืนยัน
5. **ที่จอดรถในแผนระยะ 3:** InfoQuest ให้เพิ่ม 4,000 คัน [E4] ส่วนหน้าเว็บ ทอท. ให้ราว 8,000 คัน [E5] ตัวเลขแรกน่าจะเป็นส่วนที่เพิ่ม ส่วนตัวเลขหลังน่าจะเป็นความจุรวม แต่ยังไม่ได้ยืนยัน จำนวนช่องจอดของอาคาร 7 ชั้นปัจจุบันยังไม่พบ (ไม่จำเป็นสำหรับการแสดงผล)
6. **รูปทรง สี และวัสดุของหอบังคับการบินและผนังอาคาร:** ยังไม่ได้ตรวจภาพถ่ายที่มีสัญญาอนุญาตเปิด WebFetch เปิดหน้า Wikimedia Commons ไม่ได้ (url_not_found) แต่ค้นเจอไฟล์ที่ควรเปิดดูเอง: `File:Don_Mueang_Airport_Terminal_2_front.jpg`, `File:201701_International_Terminal_of_DMK.jpg`, `File:Don_Mueang_Airport_Radar_tower.JPG`, `File:Don_Mueang_Airport,_domestic_terminal_-_road_nearby_entrance_and_exit.JPG` และ Category:Don_Mueang_International_Airport [E19] สัญญาอนุญาตต้องตรวจทีละไฟล์ (Commons มีทั้ง CC BY, CC BY-SA และ PD) ใช้ภาพเพื่อดูรูปทรงและเก็บสีได้ แต่ไม่ควรใส่ภาพลงใน repo
7. **การแบ่งประตูระหว่างประเทศกับในประเทศ:** ไม่พบเอกสาร ทอท. ที่ระบุว่าประตูใดใช้กับเที่ยวบินประเภทใด ตารางนี้อนุมานจากตำแหน่งอาคาร
8. **โรงแรม:** ไม่พบจำนวนชั้นและความสูงจากแหล่งต้นทาง ส่วนรูปทรงทางเดินว่าข้ามเหนือหรือลอดใต้ทางยกระดับก็ยังไม่รู้ ต้องดูจากภาพถ่าย
9. **โรงซ่อม:** ไม่พบขนาดประตูและความสูงที่ประกาศโดยการบินไทยหรือ ทอท. การจับคู่ป้าย "B747 HANGAR", "TWIN HANGAR" และ "SINGLE HANGAR" กับ footprint ทำได้จากลำดับข้อความในไฟล์ PDF เท่านั้น ไม่ได้ดูภาพแผนภูมิ
10. **สีหลังคา:** ได้จากพิกเซล 10 m ของฉากเดียว Pier 4 ได้ค่าเกือบดำ (#1a0800) ซึ่งอาจเป็นหลังคาสีเข้มจริงหรือเป็นผลจากเงาและพิกเซลปน ส่วนสีของ pier ใน repo บางชิ้นมีพิกเซลน้อยกว่า 10 จุด

### แหล่งอ้างอิง

1. [E1] CAAT, AIP SUP A19/20 "Closure of aircraft stand pier 3, 4 and north corridor for installation of aircraft bridge", Don Mueang Intl, เผยแพร่ 7 MAY 2020 มีผล 7 MAY–24 NOV 2020, https://aip.caat.or.th/2020-05-07/html/eSUP/VT-eSUP-20-19-en-GB.html — © CAAT; ใช้ข้อเท็จจริงและพิกัดได้ ห้ามคัดลอกเอกสาร
2. [E2] Thailand Construction & Engineering News, "Bukaka wins contract to build jet bridges, walkways for Bangkok's Don Mueang airport", 23 OCT 2019, https://stagetestkf2021.thailand-construction.com/?p=13059 — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้ (แหล่งรอง)
3. [E3] CNBC Indonesia, "33 Garbarata Buatan RI Dipakai di Don Mueang Bangkok", 22 OCT 2019, https://www.cnbcindonesia.com/market/20191022184545-17-109146/top-33-garbarata-buatan-ri-dipakai-di-don-mueang-bangkok และ Bisnis.com, "Bukaka Ekspor 33 Garbarata ke Thailand", 3 AUG 2020, https://ekonomi.bisnis.com/read/20200803/257/1274213/bukaka-ekspor-33-garbarata-ke-thailand — ข่าว (สงวนลิขสิทธิ์); ใช้ยืนยันตัวเลข 33 จากหัวข่าว เนื้อหายังเปิดอ่านไม่ได้ (แหล่งรอง)
4. [E4] InfoQuest, "AOT ปรับใหญ่ 'ดอนเมือง' รอบทิศ เคาะประมูลเฟส 3 มี.ค.68 กว่า 3.68 หมื่นลบ.รวบสัญญาเดียว", 28 MAY 2024, https://www.infoquest.co.th/?p=402113 — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้ (แหล่งรอง ที่อ้างคำให้สัมภาษณ์ของ ทอท.)
5. [E5] ทอท., ท่าอากาศยานดอนเมือง "About us", https://donmueang.airportthai.co.th/about-us (เปิดอ่าน 17 NOV 2026) — © AOT; ใช้ข้อเท็จจริงได้ (แหล่งต้นทาง)
6. [E6] ผู้จัดการออนไลน์ (MGR Online), ข่าวเปิดทางเชื่อมสถานีดอนเมือง (สายสีแดง) กับอาคารจอดรถ 7 ชั้นและอาคารผู้โดยสาร 2, 5 AUG 2021, https://mgronline.com/onlinesection/detail/9640000076605 — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้ (แหล่งรองที่รายงานประกาศของ ทอท.)
7. [E7] Amari Don Muang Airport Bangkok เว็บไซต์ทางการ, https://www.amari.com/donmuang (เปิดอ่าน 17 NOV 2026) — สงวนลิขสิทธิ์ (เว็บไซต์โรงแรม); ใช้ข้อเท็จจริงได้ (ห้ามใช้ชื่อหรือโลโก้ในลักษณะที่ทำให้เข้าใจว่าเป็นของโรงแรม ให้ใช้เป็นป้ายบอกตำแหน่งได้)
8. [E8] ผู้จัดการออนไลน์, ข่าวการพัฒนาท่าอากาศยานดอนเมืองระยะ 2 (อาคาร 2, South Corridor, ซ่อม PBB ของ Pier 5; งบ 3,304 ล้านบาท), 29 APR 2015, https://mgronline.com/business/detail/9580000048748 — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้
9. [E9] CAAT, AIP Thailand AD 2-VTBD "Aerodrome Ground Movement Chart – ICAO" (AIRAC 18 JUN 2020), https://aip.caat.or.th/2020-06-18-AIRAC/graphics/98334.pdf — © CAAT; ใช้ข้อเท็จจริง (ชื่ออาคาร เลขหลุมจอด หมายเหตุ) ได้ ห้ามนำภาพหรือ PDF แผนภูมิเข้า repo; ฉบับปัจจุบันคือ 29 OCT 2026 (ดูส่วนที่ 1)
10. [E10] Wikipedia (EN), "Don Mueang International Airport", https://en.wikipedia.org/wiki/Don_Mueang_International_Airport (เปิดอ่าน 17 NOV 2026) — CC BY-SA 4.0; ใช้ข้อเท็จจริงได้ (แหล่งรอง ข้อความบางส่วนไม่มีอ้างอิง) ถ้าคัดลอกข้อความจะติด share-alike
11. [E11] Overture Maps Foundation, Buildings theme release 2026-10-21.0, https://overturemaps-us-west-2.s3.amazonaws.com/release/2026-10-21.0/theme=buildings/type=building/ (footprint ในสนามบินมาจาก OSM) — ODbL-1.0; เก็บ footprint หรือข้อมูลอนุพันธ์ใน repo ได้ โดยต้องใส่เครดิต "© OpenStreetMap contributors, Overture Maps Foundation" และฐานข้อมูลอนุพันธ์ต้องเปิดภายใต้ ODbL ไฟล์ผลลัพธ์อยู่ที่ `docs/research/05-airport-city/e-buildings/components.json`, `bstats.json`, `gates.json`, `tanks.json`
12. [E12] Google Research, Open Buildings 2.5D Temporal v1 (ปี 2016–2023), https://storage.googleapis.com/open-buildings-temporal-data/v1/ และ https://sites.research.google/gr/open-buildings/temporal/ — CC BY 4.0 (ตามแคตตาล็อกของ Google ในส่วนที่ 8); เก็บค่าความสูงที่คำนวณแล้วใน repo ได้พร้อมเครดิต ผลรายปีอยู่ที่ `docs/research/05-airport-city/e-buildings/obt_multiyear.json`
13. [E13] Copernicus Sentinel-2 L2A, ฉาก S2A_47PPR_20260112 (12 JAN 2026) ผ่าน Element 84 Earth Search (https://earth-search.aws.element84.com/v1, ไฟล์ที่ s3 `sentinel-cogs`) — Copernicus Sentinel Data Terms (ใช้ได้เสรีรวมถึงเชิงพาณิชย์); ต้องใส่เครดิต "Contains modified Copernicus Sentinel data 2026" ใช้ได้เฉพาะค่าสีที่คำนวณแล้ว ไม่ควรใส่ภาพดิบใน repo
14. [E14] ส่วนที่ 8 ของรายงานนี้ (ความสูงอาคารจาก Open Buildings 2.5D), `หัวข้อ 8 ของรายงานนี้` และ `หัวข้อ 8 (ผลวิเคราะห์ระหว่างวิจัย ไม่ได้เก็บใน repo)` — ข้อมูลอนุพันธ์ (ODbL / CC BY 4.0)
15. [E15] CAAT, AIP Thailand AD 2 VTBD (AIRAC 14 MAY 2026) AD 2.8 และ AD 2.15, https://aip.caat.or.th/2026-05-14-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html (อ่านผ่านส่วนที่ 1 [A2][A3]) — © CAAT; ใช้ข้อเท็จจริงได้
16. [E16] Asia Travel Tips, "Thai Airways International's Technical Department at Don Muang resumes operations", 6 DEC 2011, https://www.asiatraveltips.com/news11/612-DonMuang.shtml — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้ (แหล่งรอง)
17. [E17] OpenStreetMap, node ประตูขึ้นเครื่อง (aeroway=gate) ที่ท่าอากาศยานดอนเมือง ผ่าน Overture และ extract ในงานนี้ (`docs/research/05-airport-city/e-buildings/gates.json`), https://www.openstreetmap.org — ODbL-1.0; เครดิต "© OpenStreetMap contributors" มีอยู่แล้วใน footer
18. [E18] Copernicus DEM GLO-30 (DSM 30 m), https://copernicus-dem-30m.s3.amazonaws.com/ — ใช้ได้เสรีพร้อมเครดิต "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved"; ใช้เป็นค่าตรวจทานความสูงเท่านั้น (ค่า "COP" คือ DSM ลบระดับพื้นรอบอาคาร)
19. [E19] Wikimedia Commons, Category:Don Mueang International Airport, https://commons.wikimedia.org/wiki/Category:Don_Mueang_International_Airport และไฟล์ในข้อช่องว่างข้อ 6 — สัญญาอนุญาตแยกตามไฟล์ (ยังไม่ได้ตรวจ); ใช้ดูอ้างอิงได้ ห้ามนำภาพเข้า repo จนกว่าจะตรวจสัญญาอนุญาตและใส่เครดิต
20. [E20] Warta Ekonomi, "Bukaka Raih Kontrak Senilai US$7,5 Juta di Thailand", 24 OCT 2019, https://wartaekonomi.co.id/read253199/bukaka-raih-kontrak-senilai-us75-juta-di-thailand — ข่าว (สงวนลิขสิทธิ์); ใช้ข้อเท็จจริงได้ (แหล่งรอง: 33 PBB, ทางเลื่อน 3 ชุด, US$7.5 ล้าน, ลงนาม 22 OCT 2019 กับ M-Solution, เสร็จใน 1 ปี) ตรวจในรอบทวนสอบ 17 NOV 2026
21. [E21] CAAT, AIP Thailand AD 2-VTBD "Aerodrome Ground Movement Chart – ICAO" (ไฟล์ในชุด AIRAC 4 SEP 2025), https://aip.caat.or.th/2025-09-04-AIRAC/graphics/280016.pdf — © CAAT; ใช้ข้อเท็จจริง (ป้ายอาคาร หมายเหตุ) ได้ ห้ามนำภาพหรือ PDF เข้า repo (เป็นไฟล์เดียวกับ [G3] ของหัวข้อ 7)

### สิ่งที่ Claude Code ควรทำ (หัวข้อนี้)

1. **(สูง) สร้างไฟล์ `data/vtbd_buildings.json`** จากบล็อก JSON ข้างบน แล้วเพิ่ม loader ใน `src/48-data.js` และให้ `build.mjs` คัดลอกไฟล์นี้ไป `dist/` ด้วย (สคริปต์คัดลอก `data/*` อยู่แล้ว) จากนั้นเขียน `test/buildings.test.mjs` ให้ครอบคลุม T-E01, T-E05, T-E06, T-E07, T-E08, T-E10 และ T-E16 ซึ่งไม่ต้องใช้ DOM
2. **(สูง) โถงผู้โดยสารใน `src/50-airfield.js` บรรทัด 434–440:** แยก `af.hall[1]` เป็นอาคาร 1 กับอาคาร 2 (ใช้ polygon `T1_hall` และ `T2_hall` จาก `docs/research/05-airport-city/e-buildings/components.json` ซึ่งเป็น ODbL) ยกแผ่นหลังคาจาก 17–19.2 m เป็น 22–24 m ใส่สีหลังคาตาม `roof.colour_hex` และให้ `af.hall[0]` (อาคารเดิม) สูง 16 m ส่วนการทดสอบ T-E02 และ T-E03 ให้ทำเป็นฟังก์ชันที่คืนค่าความสูงเพื่อให้ทดสอบโดยไม่ต้องมี three.js ได้
3. **(สูง) ย้าย TWR-S** ที่บรรทัด 472 จาก `tower(-893, -355, ...)` เป็น `tower(-859.4, -368.7, ...)` และหมุนฐาน 121.5° คงความสูงเดิม แก้ comment ให้ระบุว่าตำแหน่งมาจาก footprint ของ Overture และ 2.5D (ไม่ใช่จาก AIP) ทดสอบด้วย T-E11 และ T-E12
4. **(กลาง) เพิ่มสะพานเทียบ 27 ชุด** เป็นโมดูลใหม่ (เช่นใน `50-airfield.js` หรือไฟล์ `52-pbb.js`) วาง rotunda ที่ `door_en` หันอุโมงค์ตั้งฉากกับแกน pier ไปทางหลุม ให้มีกล่องกระจก/โลหะกว้างราว 3 m (ค่าประมาณ) และยืดตามตำแหน่งเครื่องที่จอด ส่วน 6 ชุดที่เหลือให้มีตัวเลือกเปิด Pier 6 (ปิดไว้ก่อน) แล้วเขียน label "จำนวน 33 ชุด (ข่าว 2019) ตำแหน่ง 27 ชุดจาก AIP SUP A19/20 + OSM" ใน UI
5. **(กลาง) วางเครื่องบินจอดจริงใน `src/55-city.js`** ที่หลุม 12–56 ตาม `boarding_bridges.located` แทนการวางแบบสุ่มที่ปลาย pier (หลุม Pier 6 และหลุมระยะไกลให้รอแผนภูมิฉบับ 29 OCT 2026)
6. **(กลาง) pier:** เพิ่ม `name`/`stands` ให้ `af.pier` ตามตารางเทียบกับ repo ยกหลังคาเป็น 14 m (T-E04) และตรวจ pier[0] กับ pier[1] ที่อยู่ไกลทางใต้ (น่าจะจัดประเภทผิด ให้ย้ายไป `bld`)
7. **(กลาง) อาคารใหม่:** เพิ่มอาคารจอดรถ 7 ชั้น (18/21 m เป็นพื้นคอนกรีตเปิด) skywalk สถานี → อาคารจอดรถ (110 × 6 m ที่ ≈6 m) อาคารสำนักงาน ทอท. (24 m) สถานีดับเพลิง 2 และถังน้ำมัน 8 ใบ ใน `data/vtbd_af.json` ทั้งหมดใส่ `est: true` และให้ UI แสดงคำว่า "ค่าประมาณ"
8. **(กลาง) โรงซ่อมฝั่งเหนือ:** แทน 'w' รวม 3 ชิ้น (index 1084, 1087, 1090) ด้วย footprint แยก 6 ชิ้นจาก JSON ใส่ประตูโรงซ่อมด้านลานจอด (ด้านตะวันออก) และใช้ความสูงตาม JSON (T-E13) ส่วนคลังสินค้าให้ลดเป็น 16–19 m (T-E15)
9. **(ต่ำ) footer:** เพิ่มเครดิต "Overture Maps Foundation (ODbL)", "Google Open Buildings 2.5D Temporal (CC BY 4.0)", "Contains modified Copernicus Sentinel data 2026" และ "Copernicus DEM GLO-30" และระบุว่าสีหลังคาเป็นค่าประมาณจากภาพดาวเทียม
10. **(ต่ำ) งานตรวจต่อ:** อ่าน AGMC ฉบับ 29 OCT 2026 เพื่อยืนยันเลขหลุม 61–68 และ PBB ที่ Pier 6 เปิดภาพใน Commons [E19] เพื่อดูรูปทรง สี และวัสดุของหอบังคับการบินทั้งสอง ผนังอาคาร 1 และ 2 และทางเดินโรงแรม แล้วบันทึกชื่อไฟล์และสัญญาอนุญาตของภาพที่ใช้ในคอมเมนต์ของโค้ด

### บันทึกการตรวจทาน

ตรวจทานโดยผู้ตรวจอิสระ (รอบย่อย 5B) วันที่ 17 พ.ย. 2026

- **ตรวจแล้ว 12 ข้อ:** จำนวน PBB, ข้อมูล SUP A19/20, จำนวนหลุมและพื้นที่ลานจอด, skywalk, ป้ายบนแผนภูมิ, ความสูงที่วัดจาก 2.5D, ตำแหน่งและความสูง TWR-S/TWR-N, สีหลังคา, การฉายพิกัดทุกจุดใน JSON, ระยะเครนถึงประตู (T-E07), ระยะย้ายหอ, ความถูกต้องของ JSON
- **ยืนยันแล้ว:** SUP A19/20 ตรงทุกระยะ (31/33/35 วันที่ 7–29 MAY 2020 … 12/14/15 วันที่ 21 SEP–24 NOV 2020, เครน 2 คันต่อหลุม ยอด 204/207 ft AMSL) [E1]; PBB 33 ชุด ทางเลื่อน 3 ชุด US$7.5 ล้าน [E2][E3][E20]; หลุมจอด 101 หลุม ลานจอด 860,000 m² ที่จอดรถระยะ 3 ราว 8,000 คัน [E5]; skywalk 110 × 6 m เข้าชั้น 2 ของอาคารจอดรถ 7 ชั้น เปิด 2 AUG 2021 [E6]; ป้าย TWR-S และ AIS/MET/TWR-N ยังอยู่ในแผนภูมิชุด 2025 [E21]; ระยะเครนถึงประตูเลขเดียวกัน 3.2–14.7 m และประตูที่ใกล้ที่สุดมีเลขตรงกันทั้ง 15 หลุม (คำนวณซ้ำ); ระยะย้าย TWR-S = 36.3 m (คำนวณซ้ำ); `ll_to_en` ของทุก lat/lon ใน JSON ตรงกับ `en` ภายใน 0.07 m; ค่าความสูงในตาราง E-1/E-3 ตรงกับไฟล์ `docs/research/05-airport-city/e-buildings/obt_multiyear.json`
- **แก้ไขแล้ว:** (1) ค่า `measured.obt_p50/obt_p90` ใน JSON ทั้ง 25 อาคารเดิมเป็นค่าปีเดียวหรือของ polygon OSM ทั้งหลัง ไม่ตรงกับตาราง เช่น T1 18.5/26.1 → 25.2/30.1, P2 19.5/23.6 → 14.6/16.5, P3 10.7/11.0 → 13.4/14.9, HGR_N2 30.1/36.1 → 23.9/27.6 (ใช้มัธยฐาน 8 ปีตาม [E12] และเพิ่ม `obt_basis`); (2) แถวอาคารจอดรถ 7 ชั้น P50 16.8 → 16.9 และเพิ่ม P90 26.5 [E12]; (3) `colour_hex` ใน JSON 14 อาคารไม่ตรงกับหัวข้อสรุป เช่น T1 #43523b → #334c35, T2 #506344 → #556849, Pier 5 #723e2a → #733e2b, CARGO #7a7260 → #7b7363, HGR_N2 #a19b84 → #a4a08a (ใช้ค่าของ footprint ชิ้นเดียวกับ `overture_key` ตาม [E13]); (4) "ไม่มีป้าย Pier 1 บนแผนภูมิ" → แผนภูมิชุด 2025 มีป้าย Pier 1–6 ตามข้อความที่สกัดได้ [E21] (ความเชื่อมั่น กลาง); (5) เพิ่มรายละเอียดสัญญา PBB (22 OCT 2019, M-Solution) และแหล่ง [E20]
- **ยังยืนยันไม่ได้ (ยังไม่ยืนยัน):** ความสูงอาคารทั้งหมดยังเป็นค่าประมาณจากดาวเทียม; ตำแหน่ง PBB 6 ชุดที่เหลือ; ป้าย "B747 HANGAR" ในแผนภูมิปัจจุบัน; จำนวนห้องโรงแรม 429 ห้อง [E7] และข้อมูลโรงซ่อมปี 2011 [E16] ไม่ได้เปิดตรวจซ้ำในรอบนี้

---

## 6 ภาคพื้น: เครื่องหมายลานจอด ป้ายทางขับ ยานพาหนะภาคพื้น และเสาไฟส่องลานจอด

### สรุป

- **ไทยใช้ Annex 14 ตรงตัว:** AIP GEN 1.7 แจ้งว่าประเทศไทยอ้าง Annex 14 Vol I ฉบับที่ 9 (Amendment 17) และ **ไม่มีข้อแตกต่าง (NIL)** ทั้งบทที่ 5 (เครื่องหมาย ไฟ ป้าย) และ Appendix 1 (สี) [F2] ข้อกำหนด กพท. ฉบับที่ 37 ว่าด้วยมาตรฐานสนามบินเป็นกฎหมายลำดับรองที่รับ Annex 14 มาใช้ แต่เว็บ CAAT ไม่ยอมให้ดึงไฟล์ในรอบนี้ [F12] ค่ามิติและสีในหัวข้อนี้จึงใช้ค่า ICAO [F3] และตรวจไขว้กับเอกสารที่อ่านได้ [F4][F5][F10]
- **สีเครื่องหมาย:** เครื่องหมายทางขับ ตำแหน่งรอเข้าทางวิ่ง และเครื่องหมายหลุมจอดเป็น**สีเหลือง** เส้นความปลอดภัยลานจอด (apron safety lines) ต้องเป็นสีเด่นที่ตัดกับสีเหลือง (ในทางปฏิบัติคือขาวหรือแดง) [F3] ลานจอดและทางขับของดอนเมืองเป็นคอนกรีตทั้งหมด [F1] จึงควรวาดเส้นเหลืองพร้อมขอบดำ ซึ่ง ICAO แนะนำเมื่อสีเส้นตัดกับผิวไม่พอ [F3] (ยังไม่ได้ยืนยันจากภาพถ่าย ความเชื่อมั่น ต่ำ–กลาง)
- **มิติหลักที่ coder ใช้ได้ทันที:** เส้นกึ่งกลางทางขับกว้าง ≥ 0.15 m (6 in), เส้นนำเข้าหลุม (lead-in/lead-out) กว้าง ≥ 0.15 m, turn bar และ stop line ยาว ≥ 6 m (20 ft) กว้าง ≥ 0.15 m, เส้นความปลอดภัยลานจอดกว้าง ≥ 0.10 m (4 in), mandatory instruction marking ตัวอักษรสูง 4 m (13 ft) สำหรับ code letter C–F [F3]
- **ป้าย code 4 (ทางวิ่งดอนเมืองกว้าง 45 m และ 60 m):** ป้ายบังคับ (ขาวบนแดง) ตัวอักษรสูง 400 mm, หน้าป้ายสูง ≥ 800 mm ตาม ICAO และขนาดป้ายของผู้ผลิต [F3][F5] (เอกสาร RA3516 ของสหราชอาณาจักรให้ 600 mm [F4] ถือว่าขัดกัน เลือก 800 mm), ความสูงติดตั้ง ≤ 1,100 mm, ห่างขอบผิวทางขับ 11–21 m และห่างขอบผิวทางวิ่ง 8–15 m [F4][F3]
- **ป้ายที่ดอนเมือง:** AD 2.9 ระบุว่ามีป้ายนำทางขับที่ทุกจุดตัดทางขับกับทางวิ่งและทุกตำแหน่งรอ มีเส้นนำล้อหน้าบนลานจอดและที่หลุม และมีระบบนำเข้าหลุมแบบ nose-in การนำเข้าจอดและการดันถอยเป็นหน้าที่ของผู้ดำเนินการหรือตัวแทนภาคพื้น [F1] ชนิด VDGS ไม่ประกาศ จึงไม่ควรใส่ยี่ห้อ (ดูหัวข้อ 2)
- **ผู้ให้บริการภาคพื้นที่ AIP ประกาศ (AD 2.4):** AOT Ground Aviation Services (AOTGA), การบินไทย (TG), Bangkok Air Catering Don Mueang, AGS Cargo DMK, TAP Cargo DMK และ MJets (เฉพาะอากาศยานส่วนตัว) [F1]
- **น้ำมันเชื้อเพลิง:** BAFS ให้บริการ Jet A1 และ AVGAS ตลอด 24 ชม. มี**รถจ่ายน้ำมัน (dispenser) 21 คัน** และรถบรรทุกน้ำมัน 7 คันความจุรวม 65,000 L [F1] การมี dispenser จำนวนมากบ่งว่าหลุมหลักเติมจากระบบท่อ hydrant ใต้ลานจอด (ข้ออนุมาน ความเชื่อมั่น กลาง) ไม่มีบริการ de-icing [F1]
- **กู้ภัยและดับเพลิง:** RFF category 9 และเคลื่อนย้ายอากาศยานที่เสียได้ถึงขนาด B747 [F1] ICAO กำหนดรถดับเพลิงอย่างน้อย 3 คันสำหรับ category 9 [F3] รถแบบตัวแทน Rosenbauer Panther 6×6 ยาว 11.71 m กว้าง 3.00 m สูง 3.75 m [F9]
- **รถโดยสารลานจอด:** แบบตัวแทน e.COBUS 3000 ยาว 13.92 m กว้าง 3.00 m สูง 3.10 m ฐานล้อ 7.10 m รับ 110 คน [F7][F8] มิติรถภาคพื้นอื่น (รถลากดันถอย สายพานลำเลียง รถลากสัมภาระ รถครัวการบิน GPU) ในตารางเป็น**ค่าประมาณ**จากช่วงทั่วไปของอุตสาหกรรม เพราะไม่ได้อ่านเอกสารผู้ผลิตรายรุ่นในรอบนี้
- **เสาไฟส่องลานจอด:** ไม่พบเอกสารสาธารณะของ ทอท. ที่ระบุความสูง จำนวน หรือชนิดโคมของดอนเมือง และ OpenStreetMap/Overture ไม่มีจุดเสาไฟในพื้นที่ [F13] จึงใช้เกณฑ์ ICAO แทน: ความส่องสว่างแนวราบเฉลี่ยบนหลุมจอด 20 lx, ค่าสม่ำเสมอ เฉลี่ย:ต่ำสุด ≤ 4:1, ความส่องสว่างแนวดิ่ง 20 lx ที่ความสูง 2 m และพื้นที่ลานจอดอื่น 50 % ของค่าบนหลุม [F3][F6] เสาควรสูงอย่างน้อย 2 เท่าของระดับตานักบินสูงสุดของเครื่องที่ใช้หลุม [F11][F6] สำหรับ B747 (ตา ≈ 8.7 m ค่าประมาณ) ได้ ≥ 17.4 m ซึ่งเสา 30 m ของ repo ผ่านเกณฑ์ ระยะห่าง 105 m ของ repo ตรงกับ "หนึ่งเสาต่อสองหลุม code C" (ค่าประมาณ)
- **สีของแสงไฟเสา:** ไม่มีหลักฐานสาธารณะว่าดอนเมืองใช้หลอดโซเดียมหรือ LED; ข่าว LED ของ ทอท. ที่พบ (ปี 2014, เปลี่ยนหลอดราว 70,000 ดวงตามข้อตกลง กฟภ.–ทอท.) เขียนเพียงว่า "Bangkok International Airport" และน่าจะเป็นสุวรรณภูมิ ไม่ได้ระบุว่าเป็นไฟส่องลานจอด [F14] แนะนำค่าเริ่มต้น LED 4,000 K (ค่าประมาณตามแนวปฏิบัติปัจจุบัน [F6]) และให้สลับเป็นโซเดียมได้

### ข้อมูล

#### 6.1 กรอบกฎหมายและมาตรฐานที่ใช้

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| ฉบับ Annex 14 Vol I ที่ไทยอ้าง | ฉบับที่ 9, Amendment 17 | [F2] | สูง |
| ข้อแตกต่างจาก ICAO ในบทที่ 5 และ Appendix 1 | NIL (ไม่มี) | [F2] | สูง |
| กฎหมายไทยที่รับมาตรฐาน | ข้อกำหนด กพท. ฉบับที่ 37 ว่าด้วยมาตรฐานสนามบิน (ประกาศ พ.ศ. 2565) | [F12] | กลาง (เห็นชื่อไฟล์และปีจากผลค้นหา แต่ดึงเนื้อหาไม่ได้) |
| คู่มือแนวทาง (ไม่บังคับ) | ICAO Doc 9157 Aerodrome Design Manual Part 4 Visual Aids | [F11] | สูง (มีเอกสารอยู่จริง) |
| VTBD AD 2.9 ป้ายนำทาง | ป้ายนำทางขับที่ทุกจุดตัด TWY/RWY และทุกตำแหน่งรอ | [F1] | สูง |
| VTBD AD 2.9 เส้นนำ | nose-wheel guide lines บนลานจอดและที่หลุม; nose-in guidance ที่หลุม | [F1] | สูง |
| VTBD AD 2.9 เครื่องหมายทางขับ | ตำแหน่งรอมีเครื่องหมายทุกจุดตัด TWY/RWY; ขอบทางขับมีเครื่องหมายและไฟทุกเส้น; เส้นกึ่งกลางมีเครื่องหมายทุกเส้น | [F1] | สูง |
| VTBD AD 2.8 ผิวลานจอดและทางขับ | คอนกรีตทั้งหมด (ลานจอด North Apron, Pier 2-3, Pier 3-4, Pier 4-5, Pier 5-6, Pier 6, South Apron ทุกแห่ง PCR 830; ทางขับกว้าง 23 m และ 50 m) | [F1] | สูง |
| VTBD AD 2.9 ไฟกึ่งกลางทางขับ | มีไฟกึ่งกลางที่ TWY D, E, F, J, O, R, S และ C (ใต้); มีไฟตำแหน่งรอกลางทาง (intermediate holding position lights) ทุกจุดตัดตาม TWY C | [F1] | สูง |
| VTBD AD 2.9 การนำเข้าหลุมและดันถอย | หน้าที่ของผู้ดำเนินการหรือตัวแทนภาคพื้น (marshaller เป็นคน) | [F1] | สูง |

#### 6.2 สีของเครื่องหมายและป้าย

ICAO กำหนดสีด้วยขอบเขตพิกัดสี (chromaticity) ใน Annex 14 Appendix 1 หัวข้อ 3 (ordinary, retroreflective และ transilluminated colours) [F3] ตัวเลขขอบเขตเหล่านั้นไม่ได้อ่านซ้ำในรอบนี้ จึงไม่ใส่ไว้ ตารางล่างให้เลขสีสีอุตสาหกรรมที่ใช้จริงแทน ค่า sRGB เป็น**ค่าประมาณ**จากตารางแปลงสี RAL/FED-STD-595 ที่ใช้กันทั่วไป และค่า albedo เชิงเส้นเป็น**ค่าประมาณ**ของสีทาที่ผ่านแดดบนคอนกรีต (วิธี: ลดความอิ่มสีของ sRGB ลงให้ค่า reflectance อยู่ในช่วงของสีทาถนนจริง 0.4–0.7 สำหรับเหลือง/ขาว)

| ใช้กับ | สี ICAO [F3] | FED-STD-595 (FAA) [F10] | RAL ที่ใช้แทนได้ (ค่าประมาณ) | sRGB hex (ค่าประมาณ) | albedo เชิงเส้นแนะนำ (ค่าประมาณ) | ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| เส้นกึ่งกลางทางขับ, ตำแหน่งรอ, เครื่องหมายหลุมจอด, ตัวอักษร location sign, พื้นป้าย direction | เหลือง | 33538 | RAL 1003 signal yellow | `#F9A800` | [0.62, 0.42, 0.05] | สี: สูง; hex/albedo: ต่ำ |
| ขอบเส้นบนผิวที่สีตัดกันไม่พอ, พื้นป้าย location, ตัวอักษรป้าย direction | ดำ | 37038 | RAL 9005 / 9017 | `#0A0A0A` | [0.04, 0.04, 0.04] | สี: สูง; hex/albedo: กลาง |
| พื้นป้ายบังคับ (mandatory), พื้น mandatory instruction marking | แดง | 31136 | RAL 3020 traffic red | `#C1121C` | [0.38, 0.04, 0.04] | สี: สูง; hex/albedo: ต่ำ |
| ตัวอักษรป้ายบังคับ, เครื่องหมายทางวิ่ง, เส้นความปลอดภัยลานจอด (ตามแนวปฏิบัติ) | ขาว | 37925 | RAL 9016 traffic white | `#F1F0EA` | [0.70, 0.70, 0.68] | สี: สูง; hex/albedo: ต่ำ |
| เส้นห้ามวางอุปกรณ์ (equipment restraint line) และพื้นที่ห้ามจอดแบบลายทแยง | แดง (แนวปฏิบัติ ไม่ใช่ข้อบังคับ ICAO) | 31136 | RAL 3020 | `#C1121C` | [0.38, 0.04, 0.04] | ต่ำ |

หมายเหตุ: ICAO บังคับเพียงว่าเส้นความปลอดภัยลานจอดต้องเป็นสีเด่นที่ตัดกับสีเครื่องหมายหลุม (เหลือง) [F3] การใช้ขาวสำหรับเส้นขอบถนนบริการและเส้นระยะปลายปีก และแดงสำหรับเส้นห้ามวางอุปกรณ์ เป็นแนวปฏิบัติที่พบทั่วไป ยังไม่ได้ยืนยันกับภาพถ่ายดอนเมือง (ความเชื่อมั่น ต่ำ)

#### 6.3 มิติของเครื่องหมายบนผิว (Annex 14 บทที่ 5)

| เครื่องหมาย | มิติ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| เส้นกึ่งกลางทางขับ (taxiway centre line) | กว้าง ≥ 0.15 m (6 in) เส้นทึบต่อเนื่อง ยกเว้นตรงที่ตัดกับตำแหน่งรอ | [F3] | สูง |
| เส้นกึ่งกลางเสริม (enhanced taxiway centre line) | เส้นประเหลืองคู่ขนานสองข้างของเส้นกึ่งกลาง เริ่มจาก Pattern A ห่างออกจากทางวิ่งไม่เกิน 47 m (154 ft) | [F3] | กลาง (ยังไม่ยืนยันว่าดอนเมืองใช้) |
| ตำแหน่งรอเข้าทางวิ่ง Pattern A | เส้นทึบ 2 เส้น + เส้นประ 2 เส้น กว้างเส้นละ 0.15 m ช่องว่างระหว่างเส้น 0.15 m (เส้นประอยู่ฝั่งทางวิ่ง) ความกว้างรวม 7 × 0.15 = 1.05 m (3.4 ft); ช่วงเส้นประ 0.9 m เว้น 0.9 m | [F3][F10] | กลาง (ความกว้างเส้นและช่องว่าง: สูง; ความยาวเส้นประ: กลาง ตรงกับค่า FAA) |
| ตำแหน่งรอเข้าทางวิ่ง Pattern B (ใช้กับตำแหน่งรอของพื้นที่ป้องกันสัญญาณ ILS เช่น CAT II) | ลักษณะ "บันได": เส้นยาว 2 เส้นกว้าง 0.3 m ห่างกัน 1.2 m มีขั้นกว้าง 0.3 m ยาว 1.5 m เว้นช่วง 1.5 m | [F3] | ต่ำ–กลาง (จำจากรูป 5-6 ไม่ได้อ่านซ้ำ ให้ตรวจก่อนใช้) |
| ตำแหน่งรอกลางทาง (intermediate holding position) | เส้นประเส้นเดียว กว้าง 0.15 m ช่วงละ 1 m เว้น 1 m | [F3] | กลาง |
| Mandatory instruction marking (ทาบนผิว) | ตัวอักษรขาวบนพื้นแดง; ตัวอักษรสูง 4 m สำหรับ code letter C, D, E, F และ 2 m สำหรับ A, B; พื้นแดงเลยตัวอักษรออกไป 0.5 m ทุกด้าน | [F3] | กลาง–สูง |
| Information marking (ทาบนผิว) | location: เหลืองบนดำ; direction/destination: ดำบนเหลือง; ตัวอักษรสูง 4 m | [F3] | กลาง |
| เส้นนำเข้าหลุมและออกจากหลุม (lead-in, lead-out) | เส้นทึบ กว้าง ≥ 0.15 m; รัศมีโค้งตามแบบเครื่องที่ใหญ่ที่สุดของหลุม | [F3] | สูง |
| Turn bar | ยาว ≥ 6 m กว้าง ≥ 0.15 m ตั้งฉากกับเส้นนำ อยู่ฝั่งซ้ายของเส้น (ฝั่งนักบิน) | [F3] | สูง |
| Stop line | ยาว ≥ 6 m กว้าง ≥ 0.15 m ตั้งฉากกับเส้นนำ ฝั่งซ้าย; หลายเส้นตามแบบเครื่อง มีตัวอักษรระบุแบบ | [F3] | สูง |
| Alignment bar | กว้าง ≥ 0.15 m ต่อเนื่องจากเส้นกึ่งกลางหลุม ให้นักบินเห็นได้ | [F3] | กลาง |
| ป้ายเลขหลุมบนผิว (stand identification) | ตัวอักษรเหลือง วางบนเส้นนำเข้าหลุมหลังจุดแยก ขนาดให้อ่านได้จากห้องนักบิน (ICAO ไม่กำหนดตัวเลข) | [F3] | กลาง |
| เส้นความปลอดภัยลานจอด (apron safety lines) | กว้าง ≥ 0.10 m (4 in); สีเด่นตัดกับสีเหลือง | [F3] | สูง |
| ตำแหน่งรอของถนนบริการ (road-holding position) | ตามกฎจราจรท้องถิ่น (ICAO ไม่กำหนดตัวเลข) | [F3] | สูง |
| ขอบดำของเส้นบนคอนกรีต | ICAO แนะนำให้มีขอบเมื่อสีเส้นตัดกับผิวไม่พอ; ขอบกว้าง 0.15 m ต่อข้าง (ค่าประมาณตามแนวปฏิบัติ FAA) | [F3][F10] | ต่ำ–กลาง |
| สีเรืองแสงกลางคืน | ICAO แนะนำให้ใช้วัสดุสะท้อนแสง (glass beads) เมื่อใช้งานกลางคืน | [F3] | กลาง |

#### 6.4 ป้ายนำทางขับ (Annex 14 5.4 และ Appendix 4)

สีของป้าย [F3][F4]:

| ชนิดป้าย | ตัวอักษร / พื้น | ขอบ | ตัวอย่างข้อความ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|
| ป้ายบังคับ (mandatory instruction): ชื่อทางวิ่ง, CAT I/II/III hold, ตำแหน่งรอเข้าทางวิ่ง, ตำแหน่งรอถนน, NO ENTRY | ขาว / แดง | อาจเพิ่มขอบดำกว้าง 10 mm (code 1–2) หรือ 20 mm (code 3–4) | `21R-03L`, `CAT II`, `B` | [F3][F4] | สูง |
| ป้ายตำแหน่ง (location) | เหลือง / ดำ | ขอบเหลืองเมื่อป้ายตั้งเดี่ยว | `C`, `J` | [F3][F4] | สูง |
| ป้ายทิศทาง ป้ายปลายทาง ป้ายทางออกทางวิ่ง (direction, destination, runway exit) | ดำ / เหลือง | – | `←J`, `C→`, `APRON` | [F3][F4] | สูง |
| ป้าย runway vacated | ดำ / เหลือง (ภาพ Pattern A) | – | – | [F3] | กลาง |

ขนาดและตำแหน่ง (ตาราง location distances ของ Annex 14 ซึ่ง RA3516 ทำซ้ำ) [F3][F4][F5]:

| code number | ตัวอักษรสูง (mm) | หน้าป้ายสูงต่ำสุด (mm) ICAO [F3][F5] | หน้าป้ายตาม RA3516 [F4] | ความสูงติดตั้งสูงสุด (mm) | ระยะจากขอบผิวทางขับถึงด้านใกล้ของป้าย | ระยะจากขอบผิวทางวิ่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|
| 1 หรือ 2 | 200 | 400 | 300 | 700 (2.3 ft) | 5–11 m (16–36 ft) | 3–10 m (10–33 ft) | กลาง |
| 1 หรือ 2 | 300 | 600 | 450 | 900 (3.0 ft) | 5–11 m | 3–10 m | กลาง |
| 3 หรือ 4 | 300 | 600 | 450 | 900 (3.0 ft) | 11–21 m (36–69 ft) | 8–15 m (26–49 ft) | ระยะ: สูง; หน้าป้าย: กลาง |
| 3 หรือ 4 | 400 | 800 | 600 | 1,100 (3.6 ft) | 11–21 m | 8–15 m | ระยะ: สูง; หน้าป้าย: กลาง |

ความสูงตัวอักษรตามชนิดป้าย (Annex 14 Appendix 4) [F3]:

| ชนิด | code 1–2 | code 3–4 | ความเชื่อมั่น |
|---|---|---|---|
| ป้ายบังคับ | 300 mm | 400 mm | กลาง–สูง |
| ป้าย runway exit และ runway vacated | 300 mm | 400 mm | กลาง |
| ป้ายข้อมูลอื่น (location, direction, destination) | 200 mm | 300 mm | กลาง |

ความสว่างหน้าป้ายเฉลี่ยต่ำสุด (Appendix 4) [F3] ใช้กำหนดอัตราส่วนความสว่างตอนกลางคืนในตัวเรนเดอร์:

| สี | RVR < 800 m (cd/m²) | RVR ≥ 800 m (cd/m²) | ความเชื่อมั่น |
|---|---|---|---|
| แดง | 30 | 10 | กลาง |
| เหลือง | 150 | 50 | กลาง |
| ขาว | 300 | 100 | กลาง |

ความยาวป้ายจากขนาดโมดูลของผู้ผลิต (ป้าย ICAO 800 mm, ตัวอักษร 400 mm): โมดูล 1–4 ยาว 1,143 / 2,225 / 3,302 / 4,375 mm; ป้าย 600 mm (ตัวอักษร 300 mm): 978 / 1,892 / 2,807 / 3,721 mm [F5] (ความเชื่อมั่น สูง สำหรับผลิตภัณฑ์นั้น) ใช้ปัดความยาวป้ายให้เป็นจำนวนโมดูล

ภาษาไทยบนป้าย: ICAO กำหนดตัวอักษรและสัญลักษณ์เป็นอักษรละตินและตัวเลข (Appendix 4) [F3] และไทยไม่มีข้อแตกต่างจาก ICAO [F2] ไม่พบหลักฐานว่าป้ายนำทางขับที่ดอนเมืองมีภาษาไทย จึงไม่ควรใส่ภาษาไทยบนป้ายนำทางขับ ส่วนป้ายถนนบริการและป้ายความปลอดภัยฝั่งอาคารอาจมีสองภาษา (ไม่ได้ยืนยัน ความเชื่อมั่น ต่ำ)

สิ่งที่เห็นที่หลุมจอดดอนเมือง: AIP ยืนยันเส้นนำล้อหน้าแบบเส้นทึบ, nose-in guidance และ marshaller [F1] ป้ายเลขหลุมและ VDGS ไม่ได้ยืนยันจากภาพถ่ายในรอบนี้ (ดูหัวข้อ 2 และ 3 สำหรับรายการหลุมและพิกัด)

#### 6.5 ผู้ให้บริการและยานพาหนะภาคพื้นที่ดอนเมือง

ผู้ให้บริการตาม AIP AD 2.4 (AIRAC 14 MAY 2026) [F1]:

| ผู้ให้บริการ | งาน | ข้อมูลที่ประกาศ | ความเชื่อมั่น |
|---|---|---|---|
| AOT Ground Aviation Services (AOTGA) | ภาคพื้นทั่วไป (ผู้โดยสาร ลานจอด) | ชื่ออยู่ในรายชื่อ ground handling agents | สูง |
| Thai Airways International (TG) | ภาคพื้น | ชื่ออยู่ในรายชื่อ | สูง |
| Bangkok Air Catering Don Mueang | ครัวการบิน (รถ hi-lift) | ชื่ออยู่ในรายชื่อ | สูง |
| AGS Cargo DMK (Asia Ground Service) | สินค้า | รถยก 7 คัน (7 t, 5 t, 3 t และ 2.5 t × 4), รถยกมือไฟฟ้า 1.5 t × 3, รถบรรทุก 2 คัน, ≤ 200 t/วัน | สูง |
| TAP Cargo DMK (Technology Asia Pacific) | สินค้า | รถยก 4 คัน (7 t × 1, 2.5 t × 3), ≤ 200 t/วัน | สูง |
| MJets | อากาศยานส่วนตัว (โรงเก็บและซ่อม) | เฉพาะอากาศยานส่วนตัว | สูง |
| Bangkok Aviation Fuel Services (BAFS) | น้ำมัน Jet A1 และ AVGAS, H24 | fuel dispenser 21 คัน, fuel truck 7 คัน ความจุรวม 65,000 L (เฉลี่ย 9,286 L/คัน คำนวณ) | สูง |
| หน่วยดับเพลิงของท่าอากาศยาน | RFF | category 9; ยกย้ายเครื่องที่เสียได้ถึง B747 | สูง |

หลักการสีและไฟของยานพาหนะ (Annex 14 บทที่ 6) [F3]: ยานพาหนะที่ทำเครื่องหมายด้วยสีควรใช้สีเด่นสีเดียว แดงหรือเขียวอมเหลืองสำหรับรถฉุกเฉิน และเหลืองสำหรับรถบริการ (ความเชื่อมั่น กลาง) ไฟสิ่งกีดขวางความเข้มต่ำบนยานพาหนะ: Type C กะพริบเหลือง (รถบริการ) หรือน้ำเงิน (รถฉุกเฉิน และรถรักษาความปลอดภัย) และ Type D กะพริบเหลืองสำหรับรถนำ (follow-me) (ความเชื่อมั่น กลาง) ในทางปฏิบัติรถภาคพื้นจำนวนมากเป็นสีขาวหรือสีองค์กรพร้อมแถบสะท้อนแสงและไฟวับวาบสีเหลืองบนหลังคา สีองค์กรของ AOTGA และ TG ไม่ได้ยืนยันในรอบนี้ จึงให้ใช้สีทั่วไป

ยานพาหนะแบบตัวแทน (ค่า "ค่าประมาณ" = ช่วงทั่วไปของรุ่นในตลาด ยังไม่ได้อ่านเอกสารผู้ผลิตรายรุ่น วิธี: เลือกค่ากลางของช่วงที่พบในแคตตาล็อกผู้ผลิตหลัก ให้ coder ปรับได้ ±15 %):

| ชนิด | แบบตัวแทน | ยาว × กว้าง × สูง (m) | ข้อมูลอื่น | สีทั่วไป | จำนวนต่อการบริการ A320/B737 หนึ่งรอบ (ค่าประมาณ) | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|
| รถโดยสารลานจอด (apron bus) | e.COBUS 3000 / COBUS 3000 | 13.92 × 3.00 × 3.10 (45.7 × 9.8 × 10.2 ft) | ฐานล้อ 7.10 m, รัศมีเลี้ยว 14.07 m, บันไดขึ้น ≈ 0.29 m, 110 คน, ประตูข้างละ 3 บาน, GVW 20,400 kg | ขาว/สีบริษัท | 2–3 คันที่หลุมระยะไกล; 0 ที่หลุมสะพานเทียบ | [F7][F8] | สูง (รุ่นนั้น); ต่ำ (ว่าดอนเมืองใช้รุ่นนี้) |
| รถดับเพลิงสนามบิน (ARFF) | Rosenbauer Panther 6×6 | 11.71 × 3.00 × 3.75 | น้ำ 11,400 L, โฟม 1,400 L; อย่างน้อย 3 คันสำหรับ CAT 9 [F3] | แดง หรือเขียวอมเหลือง | – | [F9][F3] | กลาง (Wikipedia เป็นแหล่งรอง) |
| รถลากดันถอยไม่ใช้คาน (towbarless, narrow-body) | ค่าประมาณ | 6.5 × 3.0 × 1.5 | ห้องคนขับต่ำ | ขาว/เหลือง | 1 | ค่าประมาณ | ต่ำ |
| รถลากดันถอยแบบคาน (towbar tractor) + คานลาก | ค่าประมาณ | 5.5 × 2.4 × 1.7 (คาน ≈ 5–6 m) | – | ขาว/เหลือง | ทางเลือกแทนแบบไม่ใช้คาน | ค่าประมาณ | ต่ำ |
| รถลากสัมภาระ (baggage tractor) | ค่าประมาณ | 3.0 × 1.4 × 1.9 | ไฟฟ้าหรือดีเซล | ขาว/เหลือง | 2–3 | ค่าประมาณ | ต่ำ |
| รถพ่วงสัมภาระมีหลังคา (baggage cart) | ค่าประมาณ | 3.2 × 1.6 × 2.0 | พ่วงเป็นขบวน 3–5 คัน ห่างกัน ≈ 0.8 m | เทา/น้ำเงิน มีม่าน | 6–10 | ค่าประมาณ | ต่ำ |
| สายพานลำเลียง (belt loader) | ค่าประมาณ | 8.0 × 2.1 × 1.8 (ตอนเก็บ) | ปลายสายพานยกถึง ≈ 3.5 m | ขาว/เหลือง | 2 (หน้าและหลัง) | ค่าประมาณ | ต่ำ |
| รถครัวการบิน (catering hi-lift) | ค่าประมาณ | 9.5 × 2.5 × 4.0 (ตอนลดกล่อง) | กล่องยกถึงระดับประตู ≈ 3.5 m (narrow-body) | ขาว | 1 | ค่าประมาณ | ต่ำ |
| รถจ่ายน้ำมันจาก hydrant (hydrant dispenser) | ค่าประมาณ | 7.5 × 2.5 × 2.6 | แท่นยก, สายต่อกับ pit | ขาว + สีบริษัทน้ำมัน | 1 | [F1] (มีอยู่ 21 คัน), มิติ: ค่าประมาณ | กลาง (จำนวน), ต่ำ (มิติ) |
| รถบรรทุกน้ำมัน (refueller) | ค่าประมาณ | 9.0 × 2.5 × 3.2 | ≈ 9,300 L ต่อคัน (65,000 L / 7) | ขาว | ใช้กับหลุมที่ไม่มี hydrant | [F1] (ความจุ), มิติ: ค่าประมาณ | กลาง (ความจุ), ต่ำ (มิติ) |
| เครื่องจ่ายไฟภาคพื้น (GPU) ลากจูง | ค่าประมาณ | 3.5 × 1.8 × 1.6 | – | ขาว/เหลือง | 0–1 (หลุมสะพานเทียบอาจใช้ GPU ติดสะพาน) | ค่าประมาณ | ต่ำ |
| รถน้ำดื่ม / รถสุขา | ค่าประมาณ | 6.0 × 2.2 × 2.6 | – | ขาว | 1 + 1 | ค่าประมาณ | ต่ำ |
| รถนำ (follow-me) | กระบะ 4 ประตู | 5.3 × 1.9 × 1.8 (+ป้ายไฟหลังคา) | ไฟ Type D กะพริบเหลือง [F3] | เหลือง/ลายตาราง | – | ค่าประมาณ | ต่ำ |

#### 6.6 ไฟส่องลานจอด (apron floodlighting)

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| ต้องมีไฟส่องลานจอดหรือไม่ | ควรมีบนลานจอดที่ใช้งานกลางคืน (Recommendation, Annex 14 5.3.24) | [F3] | สูง |
| ความส่องสว่างแนวราบเฉลี่ยบนหลุมจอด | 20 lx | [F3][F6] | สูง |
| ค่าสม่ำเสมอบนหลุม (เฉลี่ย:ต่ำสุด) | ≤ 4:1 | [F3][F6] | สูง |
| ความส่องสว่างแนวดิ่งเฉลี่ยบนหลุม | 20 lx ที่ความสูง 2 m เหนือผิวลานจอด ในทิศที่เกี่ยวข้อง | [F3][F6] | สูง |
| พื้นที่ลานจอดอื่น (แนวราบ) | 50 % ของค่าเฉลี่ยบนหลุม (≈ 10 lx), สม่ำเสมอ ≤ 4:1 | [F3][F6] | สูง |
| ทิศแสง | ให้แต่ละหลุมได้แสงจากสองทิศขึ้นไปเพื่อลดเงา และลดแสงจ้าต่อนักบินและหอบังคับการบิน | [F3] | กลาง |
| ความสูงเสา | ≥ 2 × ระดับตานักบินสูงสุดของเครื่องที่ใช้หลุมเป็นประจำ | [F11][F6] | กลาง ([F6] ระบุเป็นแนวปฏิบัติ; [F11] จำจากคู่มือ ไม่ได้อ่านซ้ำ) |
| ค่าออกแบบที่อุตสาหกรรมนิยม | เฉลี่ย 30 lx เผื่อการเสื่อม | [F6] | ต่ำ–กลาง (แหล่งรองจากผู้ผลิต) |
| อุณหภูมิสีและดัชนีสี | LED 4,000–5,000 K, Ra ≥ 70 | [F6] | ต่ำ–กลาง (แหล่งรอง) |
| แสงจ้า (glare rating) | GR < 50 ตาม EN 12464-2 | [F6] | ต่ำ (อ้างผ่านแหล่งรอง) |
| ความสูง จำนวน ตำแหน่ง ชนิดโคมที่ดอนเมือง | **ไม่พบข้อมูลสาธารณะ** (AIP ไม่ประกาศ; ไม่พบ TOR ของ ทอท.; OSM/Overture ไม่มีจุดเสา) | [F1][F13] | – |
| ระดับตานักบิน B747-400 (ค่าสูงสุดที่ใช้ทดสอบ) | ≈ 8.7 m (28.5 ft) | ค่าประมาณ (จำจากเอกสาร Airport Planning ของ Boeing ไม่ได้อ่านซ้ำ) | ต่ำ |
| ระดับตานักบิน narrow-body (A320/B737) | ≈ 4.5 m (15 ft) | ค่าประมาณ (วิธีเดียวกัน) | ต่ำ |
| ข้อเสนอสำหรับ repo: ความสูงเสา | คง 30 m (98 ft) และระบุว่าเป็นค่าประมาณ (ผ่านเกณฑ์ ≥ 17.4 m) | คำนวณจากเกณฑ์ [F11] | กลาง |
| ข้อเสนอ: ระยะห่างตามแนวเสา | 90–105 m (≈ 1 เสาต่อ 2 หลุม code C ที่ระยะ ≈ 45–52 m ต่อหลุม) | ค่าประมาณ; ระยะหลุมดูหัวข้อ 3 | ต่ำ–กลาง |
| ข้อเสนอ: ความลึกพื้นที่ที่เสาแถวเดียวครอบคลุม | ≤ 60 m จากแนวเสา (ที่ 70 m ค่าสม่ำเสมอเกิน 4:1 ในแบบจำลองง่าย) | คำนวณด้วยสมการ F.2 (ค่าประมาณ) | กลาง |
| ข้อเสนอ: ฟลักซ์ต่อเสา | ≈ 400,000 lm (เช่น 4 โคม × 100,000 lm ≈ 4 × 700 W LED ที่ 140 lm/W) | คำนวณด้วยสมการ F.1/F.2 (ค่าประมาณ) | ต่ำ–กลาง |

### สมการ

**F.1 วิธีลูเมน (ค่าเฉลี่ยบนพื้นที่)** [F6] (สูตรมาตรฐานของวิศวกรรมแสงสว่าง)

`E_avg = N · Φ · UF · MF / A`  (lx = lm/m²)

N จำนวนโคม, Φ ฟลักซ์ต่อโคม (lm), UF สัดส่วนฟลักซ์ที่ตกบนพื้นที่ (utilisation factor, ลานจอดทั่วไป 0.3–0.5 ค่าประมาณ), MF ค่าการเสื่อม (maintenance factor, LED ≈ 0.8 ค่าประมาณ), A พื้นที่ (m²) ตัวอย่าง: 4 × 60,000 lm, UF 0.40, MF 0.80, A = 2,250 m² (หลุม code C ≈ 45 × 50 m ค่าประมาณ) ได้ 34.1 lx และจำนวนโคมที่ต้องใช้เพื่อ 20 lx คือ ⌈20 · 2,250 / (60,000 · 0.32)⌉ = ⌈2.34⌉ = 3

**F.2 ความส่องสว่างจุด (point-by-point) จากโคมสูง H**

`E_h = I(θ) · cos³θ / (H − h)²`, `E_v = I(θ) · sinθ · cos²θ / (H − h)²`

θ มุมจากแนวดิ่ง, I(θ) ความเข้มแสง (cd) ในทิศนั้น, h ความสูงจุดวัด (0 สำหรับแนวราบ, 2 m สำหรับแนวดิ่งตาม ICAO), E_v คือบนระนาบดิ่งที่หันเข้าหาเสา ตัวอย่าง: I = 100,000 cd, θ = 60°, H = 30 m ได้ E_h = 13.9 lx; ที่ h = 2 m ได้ E_v = 27.6 lx ผลรวมจากทุกเสาให้บวกกัน

แบบจำลองง่ายที่ใช้ในข้อเสนอ: โคมของแต่ละเสาปล่อยฟลักซ์ Φ·MF สม่ำเสมอในกรวยลงด้านล่างครึ่งมุม 75° ดังนั้น `I = Φ·MF / (2π(1 − cos 75°))` ผลการคำนวณ (สคริปต์ `docs/research/05-airport-city/f-ground/flood.py`): เสาแถวเดียวสูง 30 m ห่าง 105 m, Φ = 400,000 lm, MF 0.8, พื้นที่ลึก 60 m หน้าแนวเสา, ตาราง 2.5 m: E_h เฉลี่ย 23.0 lx, ต่ำสุด 6.6 lx, สม่ำเสมอ 3.48:1, E_v เฉลี่ย (2 m) 29.3 lx; ถ้าลึก 70 m: 20.6 lx, 4.3 lx, 4.78:1 (ไม่ผ่าน) และถ้า Φ = 300,000 lm ลึก 60 m: 17.3 lx (ไม่ผ่าน 20 lx)

**F.3 เกณฑ์ความสูงเสา** [F11]: `H_mast ≥ 2 · h_eye,max` → B747 (8.7 m ค่าประมาณ) ได้ ≥ 17.4 m (57 ft)

**F.4 ความกว้างรวม Pattern A** [F3]: `W_A = 4 · w + 3 · s = 4 · 0.15 + 3 · 0.15 = 1.05 m`

**F.5 ตำแหน่งป้ายข้างทางขับ** [F3][F4]: ระยะจากแนวกลางทางขับถึงขอบใกล้ของป้าย `o = W_twy / 2 + d`, d ∈ [11, 21] m สำหรับ code 3–4 ทางขับดอนเมืองกว้าง 23 m จึงได้ o ∈ [22.5, 32.5] m และทางขับ 50 m ได้ o ∈ [36, 46] m [F1] ป้ายข้างทางวิ่ง (เช่นป้ายทางออก): `o = W_rwy / 2 + d`, d ∈ [8, 15] m → 03L/21R (60 m) ได้ [38, 45] m และ 03R/21L (45 m) ได้ [30.5, 37.5] m

**F.6 ความยาวป้าย (ค่าประมาณ)**: เลือกจำนวนโมดูลจากจำนวนตัวอักษร n_c (รวมขีดและลูกศร): n_c ≤ 2 → 1 โมดูล, ≤ 5 → 2, ≤ 8 → 3, มากกว่านั้น → 4 แล้วใช้ความยาวโมดูลของ [F5] (ป้าย 800 mm: 1.143 / 2.225 / 3.302 / 4.375 m) วิธีนี้เป็นค่าประมาณจากความกว้างตัวอักษร ≈ 0.6–0.7 เท่าของความสูง

### พารามิเตอร์ (JSON)

ไม่มีพิกัดจริงของเสาไฟหรือป้ายที่เผยแพร่ จึงไม่มีพิกัด WGS-84 ในบล็อกนี้ ตำแหน่งป้ายให้คำนวณจากเส้นทางขับใน `data/vtbd_af.json` และชื่อทางขับในหัวข้อ 3 ด้วยกฎ `placement` ตำแหน่งเสาให้คำนวณด้วยกฎ `layout_rule`

```json
{
  "markings": {
    "standard": {"doc": "ICAO Annex 14 Vol I", "edition": 9, "amendment": 17, "thai_differences": "NIL", "src": ["F2", "F3"], "conf": "high"},
    "colours": {
      "yellow": {"use": ["taxiway centre line", "runway-holding position", "stand markings", "location sign legend", "direction sign face"], "fed595": "33538", "ral": "RAL 1003", "srgb_hex": "#F9A800", "albedo_lin": [0.62, 0.42, 0.05], "src": ["F3", "F10"], "conf": "high", "est": ["ral", "srgb_hex", "albedo_lin"]},
      "black": {"use": ["border on concrete", "location sign face", "direction sign legend"], "fed595": "37038", "ral": "RAL 9005", "srgb_hex": "#0A0A0A", "albedo_lin": [0.04, 0.04, 0.04], "src": ["F3", "F10"], "conf": "high", "est": ["ral", "srgb_hex", "albedo_lin"]},
      "red": {"use": ["mandatory sign face", "mandatory instruction marking background", "equipment restraint line (practice)"], "fed595": "31136", "ral": "RAL 3020", "srgb_hex": "#C1121C", "albedo_lin": [0.38, 0.04, 0.04], "src": ["F3", "F10"], "conf": "high", "est": ["ral", "srgb_hex", "albedo_lin"]},
      "white": {"use": ["mandatory sign legend", "runway markings", "apron safety lines (practice)"], "fed595": "37925", "ral": "RAL 9016", "srgb_hex": "#F1F0EA", "albedo_lin": [0.70, 0.70, 0.68], "src": ["F3", "F10"], "conf": "high", "est": ["ral", "srgb_hex", "albedo_lin"]}
    },
    "black_border_on_concrete": {"use": true, "width_m": 0.15, "src": ["F3", "F10"], "conf": "low", "est": true},
    "taxiway_centre_line": {"width_min_m": 0.15, "colour": "yellow", "src": ["F3"], "conf": "high"},
    "enhanced_centre_line": {"max_extent_from_pattern_a_m": 47, "used_at_vtbd": null, "src": ["F3"], "conf": "medium"},
    "holding_pattern_a": {"lines": ["solid", "solid", "dashed", "dashed"], "line_width_m": 0.15, "gap_m": 0.15, "total_width_m": 1.05, "dash_m": 0.9, "dash_gap_m": 0.9, "dashed_side": "runway", "src": ["F3", "F10"], "conf": "medium"},
    "holding_pattern_b": {"rail_width_m": 0.3, "rail_spacing_m": 1.2, "rung_width_m": 0.3, "rung_length_m": 1.5, "rung_gap_m": 1.5, "src": ["F3"], "conf": "low", "verify": true},
    "intermediate_holding": {"line_width_m": 0.15, "dash_m": 1.0, "gap_m": 1.0, "src": ["F3"], "conf": "medium"},
    "mandatory_instruction_marking": {"legend": "white", "background": "red", "char_height_m": {"A": 2, "B": 2, "C": 4, "D": 4, "E": 4, "F": 4}, "background_margin_m": 0.5, "src": ["F3"], "conf": "medium"},
    "information_marking": {"char_height_m": 4, "location": "yellow on black", "direction": "black on yellow", "src": ["F3"], "conf": "medium"},
    "stand": {"lead_in_width_min_m": 0.15, "lead_out_width_min_m": 0.15, "turn_bar": {"length_min_m": 6, "width_min_m": 0.15}, "stop_line": {"length_min_m": 6, "width_min_m": 0.15}, "alignment_bar_width_min_m": 0.15, "side": "left of lead-in (pilot side)", "src": ["F3"], "conf": "high"},
    "apron_safety_line": {"width_min_m": 0.10, "colour": "conspicuous, contrasting with yellow", "practice": {"wingtip_and_road_edge": "white", "equipment_restraint": "red"}, "src": ["F3"], "conf": "high", "practice_conf": "low"},
    "vtbd": {"surface": "concrete", "nose_wheel_guide_lines": true, "nose_in_guidance": true, "marshalling": "manual by operator or handling agent", "vdgs_type": null, "src": ["F1"], "conf": "high"}
  },
  "signs": {
    "colours": {
      "mandatory": {"legend": "white", "face": "red", "outline_black_mm": {"code12": 10, "code34": 20}, "src": ["F3", "F4"], "conf": "high"},
      "location": {"legend": "yellow", "face": "black", "border": "yellow when stand-alone", "src": ["F3", "F4"], "conf": "high"},
      "direction": {"legend": "black", "face": "yellow", "src": ["F3", "F4"], "conf": "high"},
      "destination": {"legend": "black", "face": "yellow", "src": ["F3", "F4"], "conf": "high"},
      "runway_exit": {"legend": "black", "face": "yellow", "src": ["F3", "F4"], "conf": "high"}
    },
    "size_table": [
      {"code": [1, 2], "legend_mm": 200, "face_min_mm": 400, "face_min_mm_ra3516": 300, "installed_max_mm": 700, "twy_edge_m": [5, 11], "rwy_edge_m": [3, 10]},
      {"code": [1, 2], "legend_mm": 300, "face_min_mm": 600, "face_min_mm_ra3516": 450, "installed_max_mm": 900, "twy_edge_m": [5, 11], "rwy_edge_m": [3, 10]},
      {"code": [3, 4], "legend_mm": 300, "face_min_mm": 600, "face_min_mm_ra3516": 450, "installed_max_mm": 900, "twy_edge_m": [11, 21], "rwy_edge_m": [8, 15]},
      {"code": [3, 4], "legend_mm": 400, "face_min_mm": 800, "face_min_mm_ra3516": 600, "installed_max_mm": 1100, "twy_edge_m": [11, 21], "rwy_edge_m": [8, 15]}
    ],
    "size_table_meta": {"src": ["F3", "F4", "F5"], "conf": "medium", "note": "face_min_mm from ICAO and manufacturer sizes 600/800 mm; RA3516 lists 1.5x legend"},
    "legend_height_mm": {"mandatory": {"code12": 300, "code34": 400}, "runway_exit_vacated": {"code12": 300, "code34": 400}, "other_information": {"code12": 200, "code34": 300}, "src": ["F3"], "conf": "medium"},
    "luminance_min_cd_m2": {"rvr_lt_800": {"red": 30, "yellow": 150, "white": 300}, "rvr_ge_800": {"red": 10, "yellow": 50, "white": 100}, "src": ["F3"], "conf": "medium"},
    "module_length_m": {"face_800": [1.143, 2.225, 3.302, 4.375], "face_600": [0.978, 1.892, 2.807, 3.721], "src": ["F5"], "conf": "high"},
    "module_rule_est": {"max_chars": [2, 5, 8, 99], "modules": [1, 2, 3, 4], "est": true, "conf": "low"},
    "vtbd": {"code_number": 4, "use_legend_mm": 400, "use_face_mm": 800, "use_installed_mm": 1000, "language": "latin alphanumeric only", "locations": "all TWY/RWY intersections and holding positions", "src": ["F1", "F2", "F3"], "conf": "medium", "est": ["use_installed_mm"]},
    "placement": {"twy_centre_offset_m": {"twy23": [22.5, 32.5], "twy50": [36.0, 46.0]}, "rwy_centre_offset_m": {"rwy60": [38.0, 45.0], "rwy45": [30.5, 37.5]}, "default_d_twy_m": 12, "default_d_rwy_m": 10, "src": ["F1", "F3", "F4"], "conf": "medium", "est": ["default_d_twy_m", "default_d_rwy_m"]}
  },
  "vehicles": {
    "operators": [
      {"name": "AOT Ground Aviation Services (AOTGA)", "role": "ground handling", "src": ["F1"], "conf": "high"},
      {"name": "Thai Airways International", "role": "ground handling", "src": ["F1"], "conf": "high"},
      {"name": "Bangkok Air Catering Don Mueang", "role": "catering", "src": ["F1"], "conf": "high"},
      {"name": "AGS Cargo DMK", "role": "cargo", "forklifts": 7, "src": ["F1"], "conf": "high"},
      {"name": "TAP Cargo DMK", "role": "cargo", "forklifts": 4, "src": ["F1"], "conf": "high"},
      {"name": "MJets", "role": "private aircraft only", "src": ["F1"], "conf": "high"},
      {"name": "BAFS", "role": "fuel Jet A1 and AVGAS H24", "dispensers": 21, "fuel_trucks": 7, "fuel_trucks_total_l": 65000, "src": ["F1"], "conf": "high"}
    ],
    "hydrant_system": {"present": true, "basis": "21 hydrant dispensers listed in AD 2.4", "src": ["F1"], "conf": "medium", "est": true},
    "arff": {"category": 9, "min_vehicles": 3, "src": ["F1", "F3"], "conf": "high"},
    "colour_rule": {"emergency": ["red", "yellowish green"], "service": "yellow", "lights": {"service": "Type C flashing yellow", "emergency": "Type C flashing blue", "follow_me": "Type D flashing yellow"}, "src": ["F3"], "conf": "medium"},
    "types": [
      {"id": "apron_bus", "model": "e.COBUS 3000", "L": 13.92, "W": 3.00, "H": 3.10, "wheelbase": 7.10, "pax": 110, "turn_radius_m": 14.07, "src": ["F7", "F8"], "conf": "high", "used_at_vtbd_conf": "low"},
      {"id": "arff", "model": "Rosenbauer Panther 6x6", "L": 11.71, "W": 3.00, "H": 3.75, "water_l": 11400, "foam_l": 1400, "src": ["F9"], "conf": "medium"},
      {"id": "tug_towbarless", "L": 6.5, "W": 3.0, "H": 1.5, "est": true, "conf": "low"},
      {"id": "tug_towbar", "L": 5.5, "W": 2.4, "H": 1.7, "towbar_L": 5.5, "est": true, "conf": "low"},
      {"id": "baggage_tractor", "L": 3.0, "W": 1.4, "H": 1.9, "est": true, "conf": "low"},
      {"id": "baggage_cart", "L": 3.2, "W": 1.6, "H": 2.0, "train_gap_m": 0.8, "est": true, "conf": "low"},
      {"id": "belt_loader", "L": 8.0, "W": 2.1, "H": 1.8, "belt_top_m": 3.5, "est": true, "conf": "low"},
      {"id": "catering_hilift", "L": 9.5, "W": 2.5, "H": 4.0, "box_sill_raised_m": 3.5, "est": true, "conf": "low"},
      {"id": "hydrant_dispenser", "L": 7.5, "W": 2.5, "H": 2.6, "fleet_vtbd": 21, "est": true, "conf": "low", "src": ["F1"]},
      {"id": "refueller", "L": 9.0, "W": 2.5, "H": 3.2, "capacity_l": 9286, "fleet_vtbd": 7, "est": true, "conf": "low", "src": ["F1"]},
      {"id": "gpu_towed", "L": 3.5, "W": 1.8, "H": 1.6, "est": true, "conf": "low"},
      {"id": "water_or_lav_truck", "L": 6.0, "W": 2.2, "H": 2.6, "est": true, "conf": "low"},
      {"id": "follow_me", "L": 5.3, "W": 1.9, "H": 1.8, "est": true, "conf": "low"}
    ],
    "turnaround_set_narrowbody_est": {"tug": 1, "belt_loader": 2, "baggage_tractor": 2, "baggage_cart": 8, "catering_hilift": 1, "hydrant_dispenser": 1, "gpu_towed": 1, "water_or_lav_truck": 2, "apron_bus_remote": 2, "est": true, "conf": "low"}
  },
  "flood_masts": {
    "icao": {"stand_eh_avg_lx": 20, "stand_uniformity_avg_min_max": 4, "stand_ev_avg_lx": 20, "ev_height_m": 2, "other_apron_fraction": 0.5, "other_uniformity_avg_min_max": 4, "src": ["F3", "F6"], "conf": "high"},
    "mast_height_rule": {"factor_x_eye_height": 2, "eye_height_max_m": 8.7, "eye_height_narrowbody_m": 4.5, "min_mast_m": 17.4, "src": ["F11", "F6"], "conf": "medium", "est": ["eye_height_max_m", "eye_height_narrowbody_m"]},
    "industry": {"design_avg_lx": 30, "cct_k": [4000, 5000], "ra_min": 70, "src": ["F6"], "conf": "low"},
    "vtbd_published": {"height_m": null, "count": null, "luminaire": null, "src": ["F1", "F13", "F14"], "note": "not found in public sources"},
    "proposal": {"height_m": 30, "spacing_m": [90, 105], "max_depth_from_row_m": 60, "flux_per_mast_lm": 400000, "luminaires_per_mast": 4, "mf": 0.8, "cone_half_angle_deg": 75, "cct_k": 4000, "alt_sodium_cct_k": 2000, "est": true, "conf": "low"},
    "layout_rule": {"contact_stands": "row behind stands along the terminal/pier face, one mast per 2 stands, between stand centre lines", "remote_stands": "rows on the service road between stand rows or at the rear of each stand row, one mast per 2 stands", "avoid": "inside stand envelope, taxilane object-free area", "est": true, "conf": "low"}
  }
}
```

### กรณีทดสอบ

| ID | สิ่งที่ทดสอบ | ข้อมูลเข้า | ผลที่คาดหวัง | เกณฑ์ผ่าน | แหล่ง |
|---|---|---|---|---|---|
| T-F01 | มาตรฐานที่อ้าง | `markings.standard` | edition 9, amendment 17, thai_differences "NIL" | เท่ากันทุกช่อง | [F2] |
| T-F02 | ขนาดป้ายบังคับ code 4 | `signs.size_table` code 4, legend 400 | face_min_mm = 800, installed_max_mm = 1100 | เท่ากัน; และขนาดป้ายที่สร้างในฉาก: ตัวอักษร 0.40 m ±0.01, หน้าป้าย ≥ 0.80 m, ยอดป้าย ≤ 1.10 m | [F3][F5] |
| T-F03 | ระยะป้ายข้างทางขับ | ทางขับกว้าง 23 m และ 50 m, d ∈ [11, 21] | ระยะจากแนวกลางถึงขอบใกล้ของป้าย [22.5, 32.5] m และ [36, 46] m | ทุกป้ายที่วางอยู่ในช่วง ±0.1 m | [F3][F4][F1] |
| T-F04 | ระยะป้ายข้างทางวิ่ง | 03L/21R 60 m, 03R/21L 45 m, d ∈ [8, 15] | [38, 45] m และ [30.5, 37.5] m จากแนวกลาง | ทุกป้ายทางออกอยู่ในช่วง | [F3][F4] |
| T-F05 | ความกว้างเส้นกึ่งกลางทางขับ | ribbon width ใน `50-airfield.js` | ≥ 0.15 m | ค่าที่ใช้ ≥ 0.15 (repo ใช้ 0.30 ผ่าน) | [F3] |
| T-F06 | Pattern A | `holding_pattern_a` | 4·0.15 + 3·0.15 = 1.05 m | ±0.005 m | [F3] |
| T-F07 | เครื่องหมายหลุม | `stand.turn_bar`, `stand.stop_line` | ยาว ≥ 6 m กว้าง ≥ 0.15 m | ทุกหลุมที่สร้างผ่าน | [F3] |
| T-F08 | ตัวอักษร mandatory instruction marking | code letter C | 4 m; code letter B ได้ 2 m | เท่ากัน | [F3] |
| T-F09 | วิธีลูเมน | N 4, Φ 60,000 lm, UF 0.40, MF 0.80, A 2,250 m² | E_avg = 34.13 lx | ±0.05 lx | สมการ F.1 |
| T-F10 | จำนวนโคมขั้นต่ำ | E 20 lx, A 2,250 m², Φ 60,000, UF 0.40, MF 0.80 | ⌈2.34⌉ = 3 | เท่ากัน | สมการ F.1 |
| T-F11 | ความส่องสว่างจุด | I 100,000 cd, θ 60°, H 30 m, h 0 และ h 2 | E_h = 13.89 lx; E_v(h=2) = 27.62 lx | ±0.05 lx | สมการ F.2 |
| T-F12 | ความสูงเสาเทียบระดับตา | `flood_masts.mast_height_rule`, เสา repo 30 m | ต่ำสุด 17.4 m; 30 ≥ 17.4 | ทุกเสา ≥ 17.4 m | [F11] |
| T-F13 | ค่าสม่ำเสมอและค่าเฉลี่ยของแถวเสา | แบบจำลองกรวย 75°, H 30, ระยะ 105, Φ 400,000, MF 0.8, ลึก 60 m, ตาราง 2.5 m | E_h เฉลี่ย 23.0 lx, ต่ำสุด 6.6 lx, U 3.48, E_v(2 m) เฉลี่ย 29.3 lx | E_h ±0.3, U ±0.05; และ E_h ≥ 20, U ≤ 4 | สมการ F.2, `docs/research/05-airport-city/f-ground/flood.py` |
| T-F14 | กรณีไม่ผ่านของแถวเสา | เหมือน T-F13 แต่ลึก 70 m | U = 4.78 > 4 | ฟังก์ชันตรวจคืน false | สมการ F.2 |
| T-F15 | สีป้าย | `signs.colours` | mandatory = white on red; location = yellow on black; direction = black on yellow | เท่ากัน; และไม่มีป้ายอื่นใช้พื้นแดง | [F3][F4] |
| T-F16 | ความสว่างป้ายกลางคืน | `luminance_min_cd_m2.rvr_lt_800` | แดง:เหลือง:ขาว = 30:150:300 = 1:5:10 | อัตราส่วนในตัวเรนเดอร์ภายใน ±20 % | [F3] |
| T-F17 | น้ำมันที่ประกาศ | `vehicles.operators` BAFS | dispensers 21, fuel_trucks 7, total 65,000 L | เท่ากัน | [F1] |
| T-F18 | มิติรถโดยสาร | `vehicles.types.apron_bus` | 13.92 × 3.00 × 3.10 m | ±0.01 m; รถทุกคันที่วางในฉากไม่ทับขอบหลุม (wingtip clearance line) | [F7] |
| T-F19 | จำนวนรถดับเพลิง | `vehicles.arff` | category 9 → ≥ 3 คัน | จำนวนรถ ARFF ในฉาก ≥ 3 | [F1][F3] |
| T-F20 | ความยาวป้ายจากโมดูล | "21R-03L" (7 ตัวอักษร), ป้าย 800 mm | 3 โมดูล = 3.302 m | เท่ากัน | [F5], สมการ F.6 (ค่าประมาณ) |

### เทียบกับ repo

| เรื่อง | repo ตอนนี้ (`src/50-airfield.js`, `src/60-lights.js`) | ที่พบ | การเปลี่ยนแปลง |
|---|---|---|---|
| เส้นกึ่งกลางทางขับ | ribbon กว้าง 0.30 m สี `lin(0xb08a10)` ไม่มีขอบดำ | ICAO ≥ 0.15 m; ผิวคอนกรีตควรมีขอบดำ [F3][F1] | คงความกว้าง 0.30 m ได้ (ผ่าน ≥ 0.15 และช่วยให้มองเห็นจากระยะไกล) หรือใช้ 0.15 m เส้นเหลือง + ขอบดำ 0.15 m ข้างละเส้นเมื่อกล้องใกล้; ปรับสีให้อยู่ใกล้ albedo [0.62, 0.42, 0.05] |
| ตำแหน่งรอ | Pattern A ระยะ 90 m ทุกทางวิ่ง (คอมเมนต์พูดถึง 107.5 m แต่โค้ดใช้ 90) | มิติ Pattern A ตาม 6.3; ระยะจริง 90/130/210 m ตาม AD 2.9 (ดูหัวข้อ 2 และ 3) | ใช้มิติ 6.3; เพิ่ม Pattern B ที่ตำแหน่งรอ 130/210 m ถ้าหัวข้อ 2 ยืนยันว่าเป็นตำแหน่งรอ ILS (CAT II) และแก้คอมเมนต์ให้ตรงกับโค้ด |
| เครื่องหมายหลุมจอด | ไม่มี | lead-in, turn bar, stop line, เลขหลุม ตาม 6.3; พิกัดหลุมในหัวข้อ 3 | เพิ่ม decal ต่อหลุม |
| เส้นความปลอดภัยลานจอด | ไม่มี | กว้าง ≥ 0.10 m สีเด่นตัดกับเหลือง [F3] | เพิ่มเส้นขาวขอบถนนบริการและเส้นแดงห้ามวางอุปกรณ์ (ค่าประมาณตามแนวปฏิบัติ) |
| ป้ายนำทางขับ | ไม่มี | ทุกจุดตัด TWY/RWY และตำแหน่งรอ [F1]; ขนาด code 4 ตาม 6.4 | เพิ่มป้ายแบบ instanced พร้อม texture ตัวอักษร |
| ยานพาหนะภาคพื้น | ไม่มี | รายการ 6.5 | เพิ่มชุดรถต่อหลุม (ค่าประมาณ) และรถ ARFF ≥ 3 คันที่สถานีดับเพลิง |
| เสาไฟส่องลานจอด | สูง 30 m ทุก 105 m แถวเดียว ห่างแนวกลาง 03L/21R 462 m ไปทางตะวันตก, โคม LED 3 จุด + ไฟแดงยอด (`kind 6`) | ไม่มีข้อมูลดอนเมือง; ICAO 20 lx / 4:1 / 2 × ระดับตา [F3][F11] | คง 30 m แต่ระบุว่าเป็นค่าประมาณ; เพิ่มแถวเสาที่ลานจอดใต้ (South Apron) และลานจอดเหนือ (North Apron) ตาม `layout_rule`; แต่ละแถวครอบคลุมไม่เกิน 60 m |
| สีแสงเสาไฟ | `LC.led` | ไม่ทราบที่ดอนเมือง; แนวปฏิบัติปัจจุบัน LED 4,000–5,000 K [F6] | คง LED 4,000 K เป็นค่าเริ่มต้น เพิ่มตัวเลือกโซเดียม 2,000 K |
| ไฟแดงบนยอดเสา | มี (`kind 6`, ไฟสิ่งกีดขวาง) | เสาสูง 30 m ใกล้ลานจอดอาจต้องมีไฟสิ่งกีดขวางตามการศึกษาด้านการบิน (ไม่ทราบที่ดอนเมือง) | คงไว้ได้ ไม่ขัดกับแหล่งใด |
| credit ใน footer | ไม่มีข้อความเรื่องเครื่องหมายและป้าย | ค่ามาจาก ICAO Annex 14 ซึ่งไทยใช้โดยไม่มีข้อแตกต่าง | เพิ่ม "เครื่องหมายและป้ายตาม ICAO Annex 14 (AIP GEN 1.7: ไม่มีข้อแตกต่าง); ยานพาหนะและเสาไฟเป็นค่าประมาณ" |

### ความขัดแย้งและช่องว่าง

1. **ความสูงหน้าป้าย:** ICAO และขนาดป้ายของผู้ผลิต (600 mm สำหรับตัวอักษร 300 mm และ 800 mm สำหรับตัวอักษร 400 mm) [F3][F5] ขัดกับ RA3516 ของสหราชอาณาจักรที่ให้ 450 mm และ 600 mm [F4] เลือกค่า ICAO เพราะไทยใช้ ICAO ตรงตัว [F2] และผู้ผลิตยืนยัน; RA3516 เป็นข้อกำหนดของอีกประเทศหนึ่ง ใช้เฉพาะเป็นการตรวจไขว้ของระยะติดตั้ง (ซึ่งตรงกัน)
2. **ไม่ได้อ่านเนื้อความ Annex 14 ในรอบนี้:** ICAO ขายเอกสารและไม่มีสำเนาที่ดึงได้ (ลองหลายแหล่งแล้วล้มเหลว); ข้อกำหนด กพท. ฉบับที่ 37 ดึงจากเว็บ CAAT ไม่ได้ [F12] ค่าที่ไม่มีแหล่งที่สองยืนยันตั้งความเชื่อมั่นไว้ที่ กลาง หรือ ต่ำ โดยเฉพาะมิติ Pattern B และเส้นประของตำแหน่งรอกลางทาง ทางแก้: เจ้าของเปิดข้อกำหนด กพท. ฉบับที่ 37 (เอกสารแนบท้าย โดยเฉพาะภาคผนวกแนบท้าย 4 เรื่องป้าย [F15]) ในเบราว์เซอร์ แล้วตรวจรูป 5-6 และตาราง location distances
3. **ขอบเขตพิกัดสี (Appendix 1):** ไม่ได้ใส่ตัวเลขเพราะไม่ได้อ่านซ้ำ ใช้ RAL/FED-STD แทน (สี sRGB เป็นค่าประมาณ) หัวข้อ 9 วัดสีผิวทางจาก Sentinel-2 ไว้แล้ว ใช้ค่าคอนกรีตจากหัวข้อนั้น
4. **เสาไฟดอนเมือง:** ไม่มีข้อมูลสาธารณะเรื่องความสูง จำนวน ตำแหน่งหรือชนิดโคม (AIP ไม่ประกาศ [F1], ไม่พบ TOR, ไม่มีใน OSM/Overture [F13]) ข่าวเปลี่ยนเป็น LED ของ ทอท. ที่พบ (ปี 2014) ไม่ได้ระบุดอนเมือง และน่าจะเป็นสุวรรณภูมิ [F14] ทางแก้: นับเสาจากภาพถ่ายดาวเทียมความละเอียดสูง (เงาเสายาวชัด) ในเบราว์เซอร์ของเจ้าของ แล้ววัดความสูงจากความยาวเงาด้วย `H = L_shadow · tan(sun elevation)` (มุมดวงอาทิตย์จาก NOAA ใน `10-atmo.js` ที่เวลาถ่ายภาพ) ห้ามคัดลอกภาพที่ไม่มีสัญญาอนุญาตเข้า repo ให้เก็บแค่พิกัดที่วัดเอง
5. **ยานพาหนะ:** ยืนยันชื่อผู้ให้บริการได้จาก AIP แต่ไม่ทราบรุ่นรถที่ใช้จริงที่ดอนเมือง มิติส่วนใหญ่เป็นค่าประมาณ มีเพียงรถโดยสาร (เอกสารผู้ผลิต) และรถดับเพลิง (Wikipedia) ที่มีแหล่ง สีองค์กรของ AOTGA และ TG ไม่ได้ยืนยัน
6. **ระบบ hydrant:** อนุมานจากจำนวน dispenser 21 คัน [F1] ไม่ได้พบเอกสารที่ระบุว่าหลุมใดมี hydrant pit
7. **ภาษาไทยบนป้าย:** ไม่พบข้อกำหนดหรือภาพยืนยัน; ICAO ใช้ตัวอักษรละติน [F3]
8. **ระดับตานักบิน:** ใช้ค่าประมาณ 8.7 m (B747) และ 4.5 m (narrow-body) ควรตรวจกับเอกสาร Airport Planning ของ Boeing/Airbus ก่อนเขียนเป็นค่าคงที่

### แหล่งอ้างอิง

1. [F1] CAAT, AIP Thailand AD 2 VTBD Bangkok/Don Mueang, AD 2.3, 2.4, 2.6, 2.8, 2.9, AIRAC 14 MAY 2026 (อ่าน 17 NOV 2026), https://aip.caat.or.th/2026-05-14-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT ไม่มีสัญญาอนุญาตแบบเปิด; ตัวเลข ชื่อผู้ให้บริการ และข้อเท็จจริงใช้ใน JSON/โค้ดได้พร้อมอ้างรอบ AIRAC ห้ามคัดลอกข้อความยาวหรือแผนภูมิ (รอบปัจจุบันคือ 29 OCT 2026 ดูหัวข้อ 1; รอบทวนสอบอ่าน AD 2.3, 2.4, 2.6, 2.8, 2.9 ของฉบับ 29 OCT 2026 ที่ https://aip.caat.or.th/2026-10-29-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html แล้ว ค่าตรงกับฉบับ 14 MAY 2026 ทุกข้อ)
2. [F2] CAAT, AIP Thailand GEN 1.7 Differences from ICAO Standards, Recommended Practices and Procedures, AIRAC 07 AUG 2025, https://aip.caat.or.th/2025-08-07-AIRAC/html/eAIP/VT-GEN-1.7-en-GB.html — © CAAT; ใช้ข้อเท็จจริง (Annex 14 Vol I ฉบับ 9 Amdt 17, NIL)
3. [F3] ICAO, Annex 14 to the Convention on International Civil Aviation, Volume I Aerodrome Design and Operations, 9th edition (July 2022) and amendments; บทที่ 5 (5.2, 5.3.24, 5.4), บทที่ 6 (การทำเครื่องหมายวัตถุเคลื่อนที่), บทที่ 9 (RFF), Appendix 1, 3, 4; จำหน่ายที่ https://store.icao.int/ — © ICAO all rights reserved; ใช้ตัวเลขข้อกำหนดเป็นข้อเท็จจริงได้ ห้ามคัดลอกข้อความหรือรูป **ค่าในหัวข้อนี้มาจากความรู้เรื่องเนื้อหา Annex 14 ไม่ได้อ่านซ้ำในรอบนี้** (ดูความเชื่อมั่นรายแถว)
4. [F4] UK Ministry of Defence / Military Aviation Authority, RA 3516 Permanent Fixed Wing Aerodrome – Signs, Issue 3, https://assets.publishing.service.gov.uk/media/6336a5b5e90e0772e5d33e64/RA3516_Issue_3.pdf — Open Government Licence v3.0 (เอกสารรัฐบาลสหราชอาณาจักร); ใช้เป็นการตรวจไขว้ตารางป้ายของ ICAO เท่านั้น
5. [F5] Flight Light Inc., ICAO I-Lux LED guidance sign datasheet 4.1.2F, https://flightlight.com/app/uploads/2017/04/ICAO_I-LUX_LED_4.1.2F.pdf — เอกสารผู้ผลิต all rights reserved; ใช้ตัวเลขขนาดเป็นข้อเท็จจริง
6. [F6] Midstream Lighting, "Airport Apron Floodlighting Standards in 2026" (blog), https://info.midstreamlighting.com/blog/airport-apron-floodlighting-standards-in-2026 — แหล่งรองของผู้ผลิตโคม all rights reserved; ใช้เป็นการยืนยันค่า ICAO 5.3.24 และแนวปฏิบัติ
7. [F7] CaetanoBus / COBUS, e.COBUS 3000 datasheet, https://caetanobus.pt/wp-content/uploads/2018/01/e.COBUS_.pdf — เอกสารผู้ผลิต all rights reserved; ใช้มิติเป็นข้อเท็จจริง ห้ามใช้โลโก้หรือแบบรถที่เป็นเอกลักษณ์ ให้โมเดลแบบทั่วไป
8. [F8] COBUS Industries, COBUS 3000 product page, https://www.cobus-industries.com/produkte/cobus-3000/ — all rights reserved; ใช้ข้อเท็จจริง (110 คน, ประตูข้างละ 3)
9. [F9] Wikipedia, "Rosenbauer Panther", https://en.wikipedia.org/wiki/Rosenbauer_Panther — CC BY-SA 4.0 (ข้อความ); แหล่งรอง ใช้เฉพาะตัวเลขมิติเป็นข้อเท็จจริง ไม่คัดลอกข้อความ จึงไม่มีผลบังคับ share-alike
10. [F10] FAA, Advisory Circular 150/5340-1L Standards for Airport Markings, https://www.faa.gov/documentLibrary/media/Advisory_Circular/150_5340_1l.pdf (ฉบับปัจจุบันคือ 150/5340-1M) — งานรัฐบาลสหรัฐ public domain; ใช้เลข FED-STD-595 และการตรวจไขว้มิติเส้น (ไม่ได้อ่านซ้ำในรอบนี้ ความเชื่อมั่น กลาง)
11. [F11] ICAO, Doc 9157 Aerodrome Design Manual, Part 4 Visual Aids (5th ed.), https://store.icao.int/ — © ICAO all rights reserved; หลัก "ความสูงเสา ≥ 2 เท่าระดับตานักบิน" (จำจากคู่มือ ไม่ได้อ่านซ้ำ)
12. [F12] CAAT, ข้อกำหนดของสำนักงานการบินพลเรือนแห่งประเทศไทย ฉบับที่ 37 ว่าด้วยมาตรฐานสนามบิน (ฉบับราชกิจจานุเบกษา, ไฟล์ ก.ย. 2565), https://www.caat.or.th/wp-content/uploads/2022/09/ข้อกำหนด-กพท.-ฉบับที่-37-ว่าด้วยมาตรฐานสนามบิน-ฉบับราชกิจจา.pdf — เอกสารราชการ; ดึงเนื้อหาไม่ได้ในรอบนี้ (client error)
13. [F13] ผลวิเคราะห์ใน work dir: Overture Maps infrastructure รอบ VTBD (ไฟล์ Overture infrastructure ที่ดึงระหว่างวิจัย ไม่ได้เก็บใน repo, 1,945 รายการ ไม่มี subtype/class ของเสาไฟหรือ mast) — Overture infrastructure มาจาก OSM, ODbL; ไม่ได้ใช้ข้อมูลจริงใน repo จึงไม่มีภาระ
14. [F14] LEDinside, "Bangkok Int'l Airport to Receive LED Upgrade" (9 June 2014), https://www.ledinside.com/news/2014/6/bangkok_intl_airport_to_receive_led_upgrade (URL เดิมที่มีปี 2025 ในพาธเป็นสำเนาของหน้าเดียวกัน) — ข่าว แหล่งรอง สงวนลิขสิทธิ์; หน้าไม่ได้ระบุชื่อสนามบิน ("Bangkok International Airport") และพูดถึงหลอดราว 70,000 ดวง ไม่ได้พูดถึงไฟส่องลานจอด ใช้เพียงเพื่อบอกว่าไม่พบข่าว LED ของดอนเมือง
15. [F15] CAAT, ภาคผนวกแนบท้าย 4 ของข้อกำหนด กพท. ฉบับที่ 37 "ข้อกำหนดการออกแบบป้ายสำหรับนำร่องการขับเคลื่อนบนทางขับ" (ก.ย. 2565), https://www.caat.or.th/wp-content/uploads/2022/09/ภาคผนวกแนบท้าย-4-ข้อกำหนดการออกแบบป้ายสำหรับนำร่องการขับเคลื่อนบนทางขับ.pdf — เอกสารราชการไทย; พบจากการค้นหาในรอบทวนสอบแต่ดึงเนื้อหาไม่ได้ (client error) เป็นแหล่งชั้นต้นที่ควรเปิดด้วยเบราว์เซอร์เพื่อยืนยันตารางขนาดป้าย ความสว่าง และขอบดำในหัวข้อ 6.4

### สิ่งที่ Claude Code ควรทำ (หัวข้อนี้)

1. **(สูง) ข้อมูล:** สร้าง `data/vtbd_ground.json` จากบล็อก JSON ข้างบน (ส่วน `markings`, `signs`, `vehicles`, `flood_masts`) แล้วให้ `build.mjs` คัดลอกไปที่ `dist/` และ `48-data.js` โหลด ใส่ `src` และ `conf` ไว้ตามเดิม
2. **(สูง) โมดูลคำนวณแบบ pure:** สร้าง `src/25-ground.js` (ไม่แตะ DOM) มีฟังก์ชัน `lumenAvg(N, phi, uf, mf, A)`, `lumensNeeded(E, A, phi, uf, mf)`, `pointE(I, thetaDeg, H, h)` คืน `{eh, ev}`, `rowStats({H, S, D, phi, mf, cone, step})` คืน `{ehAvg, ehMin, U, evAvg}` (ให้ตรงกับ `docs/research/05-airport-city/f-ground/flood.py`), `mastHeightOK(H, eyeMax)`, `signOffset(widthPav, d)`, `signModules(text, face)`; เขียน `test/ground.test.mjs` ครอบ T-F01–T-F20 (ไม่มี dependency)
3. **(สูง) ป้ายนำทางขับ:** ใน `50-airfield.js` วางป้ายบังคับ (ขาวบนแดง) ที่ทุกตำแหน่งรอซึ่ง `50-airfield.js` คำนวณอยู่แล้ว ทั้งสองข้างของทางขับ ห่างขอบผิว 11–21 m (ค่าเริ่ม 12 m) ตัวอักษร 0.40 m หน้าป้าย 0.80 m ยอด ≤ 1.10 m; ป้าย location (เหลืองบนดำ) คู่กัน; ใช้ชื่อทางขับและข้อความทางวิ่งจากหัวข้อ 3 ทำ texture ตัวอักษรด้วย canvas แบบ atlas และ instancing; ป้ายเรืองแสงกลางคืนด้วยอัตราส่วน แดง:เหลือง:ขาว = 1:5:10
4. **(สูง) เครื่องหมายหลุม:** ต่อจากพิกัดหลุมของหัวข้อ 3 สร้าง decal ต่อหลุม: lead-in 0.15 m (หรือ 0.30 m ที่ระยะไกล), turn bar และ stop line ยาว 6 m กว้าง 0.15 m ฝั่งซ้าย, เลขหลุมสีเหลือง, ขอบดำบนคอนกรีต
5. **(กลาง) ตำแหน่งรอ:** วาด Pattern A ตามมิติ 6.3 (1.05 m) และแก้คอมเมนต์ 107.5 m ให้ตรงกับโค้ด; เพิ่ม Pattern B เมื่อหัวข้อ 2 ยืนยันตำแหน่งรอ ILS
6. **(กลาง) เสาไฟ:** คงความสูง 30 m (ป้ายกำกับว่าเป็นค่าประมาณ) เพิ่มแถวเสาของลานจอดใต้และเหนือตาม `layout_rule` (หนึ่งเสาต่อสองหลุม ระยะ 90–105 m แต่ละแถวครอบคลุม ≤ 60 m) แล้วตรวจด้วย `rowStats` ให้ E_h ≥ 20 lx และ U ≤ 4; ตั้งค่า intensity ของ `LightSet` ให้สัมพันธ์กับฟลักซ์ 400,000 lm ต่อเสา; เพิ่มตัวเลือกสีโซเดียม 2,000 K
7. **(กลาง) ยานพาหนะ:** สร้างโมเดลกล่องแบบ low-poly (instanced) ตาม `vehicles.types` วางชุด `turnaround_set_narrowbody_est` ที่หลุมที่มีเครื่องจอดใน `55-city.js` (รถโดยสารเฉพาะหลุมระยะไกล), รถ ARFF ≥ 3 คันสีแดงหรือเขียวอมเหลือง; ไฟกะพริบเหลืองบนรถบริการ; ทุกคันอยู่นอกแนวปีกเครื่อง
8. **(กลาง) Footer:** เพิ่มข้อความเครดิตในข้อ "เทียบกับ repo" และระบุว่ายานพาหนะและเสาไฟเป็นค่าประมาณ
9. **(ต่ำ) ตรวจภายหลัง:** เจ้าของตรวจข้อกำหนด กพท. ฉบับที่ 37 (รูปตำแหน่งรอ Pattern B, ตารางป้าย) และนับเสาไฟจากภาพดาวเทียมแล้วใส่พิกัดที่วัดเองใน `flood_masts` (WGS-84 + [e, n] จาก `llToNE`)

### บันทึกการตรวจทาน

ตรวจทานโดยผู้ตรวจอิสระ (รอบย่อย 5B) วันที่ 17 พ.ย. 2026

- **ตรวจแล้ว 11 ข้อ:** ฉบับ Annex 14 ที่ไทยอ้างและข้อแตกต่าง, ข้อมูล AD 2.3/2.4/2.6/2.8/2.9, ตารางขนาดและระยะป้าย, มิติรถโดยสาร, มิติรถดับเพลิง, ข่าว LED, การมีอยู่ของข้อกำหนด กพท. ฉบับที่ 37, สมการ F.1/F.2/F.5 และผลของ `docs/research/05-airport-city/f-ground/flood.py`, การแปลงหน่วย m↔ft, ความถูกต้องของ JSON
- **ยืนยันแล้ว:** GEN 1.7 อ้าง Annex 14 Vol I ฉบับที่ 9 Amdt 17 และไม่มีข้อแตกต่าง (NIL) [F2]; AD 2 ฉบับ 29 OCT 2026 ให้ค่าเดียวกับฉบับ 14 MAY 2026: ATS และผู้ดำเนินการสนามบิน H24, ผู้ให้บริการภาคพื้น 6 ราย, BAFS Jet A1/AVGAS, dispenser 21 คัน, รถบรรทุกน้ำมัน 7 คัน รวม 65,000 L, ไม่มี de-icing, RFF category 9, ยกย้ายเครื่องได้ถึง B747, ผิวคอนกรีต PCR 830, ทางขับ 23/50 m, ป้ายที่ทุกจุดตัดและตำแหน่งรอ, เส้นนำล้อหน้าและ nose-in guidance, marshalling โดยผู้ดำเนินการหรือตัวแทน [F1]; ตาราง RA3516 (หน้าป้าย 300/450/450/600 mm, ติดตั้งสูงสุด 700/900/900/1,100 mm, ระยะ 5–11/11–21 m และ 3–10/8–15 m, ขอบดำ 10/20 mm) [F4]; e.COBUS 3000: 13,920 × 3,000 × 3,100 mm, ฐานล้อ 7,100 mm, รัศมีเลี้ยว 14,069 mm, 110 คน, 3 ประตูต่อข้าง, GVW 20,400 kg [F7]; Panther 6×6: 11.71 × 3.00 × 3.75 m, น้ำ 11,400 L, โฟม 1,400 L [F9]; ข้อกำหนด กพท. ฉบับที่ 37 มีอยู่จริงที่ URL ใน [F12]; คำนวณซ้ำ F.1 = 34.13 lx, ⌈2.34⌉ = 3, F.2 = 13.89 / 27.62 lx, แถวเสา 23.0 / 6.6 / 3.48 / 29.3 และกรณีลึก 70 m U = 4.78, ระยะป้าย [22.5, 32.5], [36, 46], [38, 45], [30.5, 37.5] m ตรงทั้งหมด
- **แก้ไขแล้ว:** URL ของ [F14] จาก …/news/2025/06/… → …/news/2014/6/… และแก้ข้อความ "ข่าว LED เป็นของสุวรรณภูมิ" → หน้าเขียนเพียง "Bangkok International Airport" (น่าจะเป็นสุวรรณภูมิ) และไม่ได้พูดถึงไฟส่องลานจอด; เพิ่มชื่อลานจอดตาม AD 2.8 และแถวไฟกึ่งกลางทางขับตาม AD 2.9 [F1]; เพิ่มแหล่ง [F15] (ภาคผนวกแนบท้าย 4 เรื่องป้าย ของข้อกำหนด กพท. ฉบับที่ 37)
- **ยังยืนยันไม่ได้ (ยังไม่ยืนยัน):** หน้าป้ายขั้นต่ำ 800 mm ตาม ICAO (ยังขัดกับ RA3516 ที่ 600 mm; ข้อเสนอเดิมคงไว้ ความเชื่อมั่น กลาง); ค่าที่อ้าง Annex 14 โดยตรง [F3] และ Doc 9157 [F11] เพราะเอกสาร ICAO และภาคผนวกของ กพท. [F15] ดึงไม่ได้ (Pattern B, ความสว่างป้าย, ความสูงตัวอักษรตามชนิดป้าย ยังคงความเชื่อมั่นเดิม); ระดับตานักบิน 8.7 m และ 4.5 m; ข้อมูลเสาไฟของดอนเมือง

---

## 7 การปฏิบัติการ: เที่ยวบิน แบบเครื่องบิน สายการบิน การใช้ทางวิ่ง และเส้นทางขับ

ขอบเขต: ข้อมูลสำหรับสร้างจราจรจำลอง (traffic generation) ที่ดอนเมือง ได้แก่ ปริมาณเที่ยวบิน รูปแบบรายชั่วโมง สัดส่วนสายการบินและแบบเครื่องบิน วิธีใช้ทางวิ่งในแต่ละทิศ ทางออกจากทางวิ่ง (exit) เส้นทางขับปกติ และเวลา turnaround หมายเหตุสำคัญเรื่องเวลา: วันนี้คือ 17 พ.ย. 2026 AIP ที่มีผลบังคับปัจจุบันคือ AIRAC AMDT 11/26 มีผล 29 OCT 2026 [G2] แต่ repo ยังอ้าง AIRAC 14 MAY 2026 ข้อมูล AD 2 ที่อ่านได้ในรอบนี้มาจากฉบับ 14 MAY 2026 [G1] และแผนภูมิ Ground Movement Chart ฉบับ AIRAC 4 SEP 2025 [G3] ส่วน AD 2.20–2.24 (กฎท้องถิ่น การลดเสียง และรายการแผนภูมิ) อ่านไม่ได้เพราะเครื่องมือดึงหน้าเว็บตัดหน้า HTML ที่ราว 100,000 ตัวอักษร และไฟล์ PDF ทั้งส่วนดึงไม่สำเร็จ (ดูหัวข้อ "ความขัดแย้งและช่องว่าง") ภายหลังได้เนื้อหา AD 2.20 ข้อ 1–15 จากฉบับ AIRAC 3 SEP 2026 ซึ่งงานของหัวข้อ 1 อ่านไว้ในรอบนี้ [G32] (สรุปไว้ใน 7.10) ส่วน AD 2.21–2.24 ยังอ่านไม่ได้

### สรุป

- **ปริมาณจราจร:** ปีงบประมาณ 2025 (ต.ค. 2024–ก.ย. 2025) ดอนเมืองมีเที่ยวบินขึ้นลง (aircraft movements) 213,694 เที่ยว (ระหว่างประเทศ 88,737 ในประเทศ 124,957) และผู้โดยสาร 31,337,658 คน [G6] เฉลี่ย ≈ 585.5 เที่ยวต่อวัน (ค่าคำนวณ) ปีปฏิทิน 2025 มี 214,723 เที่ยว [G9] ปีปฏิทิน 2024 มี 205,681 เที่ยว [G8] เที่ยวบินของสายการบินต้นทุนต่ำ (LCC) คิดเป็น 199,511 เที่ยว หรือ ≈ 93.4 % [G7][G6]
- **ปี 2026 ผิดปกติ:** ราคาน้ำมันอากาศยานพุ่งจากความขัดแย้งในตะวันออกกลาง ทำให้ไทยแอร์เอเชียลดเที่ยวบิน ≈ 30 % ช่วง พ.ค.–มิ.ย. 2026 (แต่คงเส้นทางในประเทศจาก DMK ไว้) [G23] ไทยไลอ้อนแอร์ระงับหรือลด 15 เส้นทางจาก DMK [G24] และในเดือน ก.ย. 2026 เที่ยวบินที่ DMK ลดลง 16.9 % เทียบปีก่อน [G22] จึงควรใช้ FY2025 เป็นค่าฐานของ "วันปกติ" และใส่ตัวคูณสถานการณ์ปี 2026 เป็นตัวเลือก
- **วันพีค:** ทอท. ประมาณการช่วงปีใหม่ 2026 ไว้ 7,210 เที่ยวใน 11 วัน (≈ 655 เที่ยว/วัน) [G20] และสงกรานต์ 2026 ไว้ 6,551 เที่ยวใน 10 วัน (≈ 656 เที่ยว/วัน) [G21] คือ ≈ 1.12 เท่าของค่าเฉลี่ย FY2025 ช่วงชั่วโมงที่หนาแน่นตามที่ ทอท. แจ้งคือ 05:00–07:00, 09:00–11:00 และ 15:00/16:00–18:00/19:00 [G20][G21]
- **ขีดความสามารถ:** ดอนเมืองเป็นสนามบิน IATA Level 3 ที่ กพท. (CAAT) จัดสรรเวลาการบิน (slot) [G16][G17] ประกาศขีดความสามารถฉบับล่าสุดที่อ่านได้ (ฤดูหนาว 2024/25, 27 OCT 2024–29 MAR 2025) ระบุ 45 movements/ชม. ช่วง 00:00–03:59 UTC, 50 ช่วง 04:00–09:59 UTC และ 53 ช่วง 10:00–23:59 UTC [G37] ส่วนฉบับฤดูหนาว 2022 ระบุ 40 และ 45 [G14] ประกาศเดียวกันระบุว่าปิดทางวิ่งตอนกลางคืน 17:00–22:00 UTC (00:00–05:00 น.) เพื่อล้างคราบยาง: 03L/21R จันทร์–พฤหัสบดี และ 03R/21L ศุกร์–เสาร์ [G37] ผู้บริหาร ทอท. ระบุขีดความสามารถทางวิ่งปัจจุบัน 55 เที่ยว/ชม. และอาจเพิ่มเป็น 65 เที่ยว/ชม. หากได้พื้นที่สนามกอล์ฟมาทำทางขับคู่ขนาน [G18] ประกาศฉบับฤดูร้อน 2026 มีอยู่ [G15] แต่ดึงเนื้อหาไม่ได้
- **การใช้ทางวิ่ง:** หลักฐานชั้นต้นจาก AIP (stop bar, hot spot) และแหล่งรองจากคู่มือ spotter สอดคล้องกันว่าเที่ยวบินพลเรือนใช้ **03L/21R เป็นทางวิ่งหลักแบบผสม (ทั้งขึ้นและลง)** เพราะอยู่ฝั่งอาคารผู้โดยสาร ส่วน **03R/21L ใช้รับเครื่องลงเพิ่ม (overflow arrivals) ในช่วงหนาแน่น** และเป็นทางวิ่งหลักของพื้นที่ทหารฝั่งตะวันออก [G1][G3][G29] AD 2.20 ข้อ 4 ยืนยันว่า 03R/21L ปกติใช้โดยทหาร แต่เปิดให้พลเรือนใช้ได้ตลอด 24 ชม. ภายใต้การควบคุมของหอบังคับการบิน [G32] เครื่องที่ลง 21L ต้องวิ่งไปออกที่ทางขับ S แล้วข้าม 21R (hot spot HS5) [G3] เครื่องที่ลง 03R ไม่มีทางออกฝั่งตะวันตกอื่นนอกจาก D ใกล้ปลายทางวิ่ง (ข้อนี้อนุมานจากเรขาคณิต OSM) [G30]
- **ทางออกจากทางวิ่ง (คำนวณจาก OSM):** สำหรับการลง 21R มีทางออกฝั่งตะวันตก F (1,101 m จาก threshold), J (1,510 m, 90°), O (1,719 m, rapid exit), R (2,378 m, rapid exit), S (2,966 m) และ C South (3,562 m) สำหรับการลง 03L มี S (736 m), J (2,191 m), F (2,310 m, rapid exit), E (3,146 m, rapid exit) และ B North/D (3,639 m) [G30] แบบจำลองการชะลอความเร็วให้ผลว่า A320 บนทางวิ่งแห้งออกที่ O เมื่อลง 21R และออกที่ J (หรือ F) เมื่อลง 03L (ค่าประมาณ ดูสมการ)
- **ทางขับ:** ทางขับคู่ขนานหลักคือ C (ฝั่งตะวันตกของ 03L/21R) ทางขับในลานจอดหลักคือ Taxilane B และ A ทางเชื่อมข้ามระหว่างสองทางวิ่งมีเพียง D (เหนือ) และ S (ใต้) [G1][G3][G5][G30] Taxilane T (ระหว่าง TWY V กับ S) รับได้เฉพาะ code A–D และ TWY Y ใช้พร้อมกับ 03R/21L ไม่ได้ [G1][G3] ตำแหน่ง TWY Y ไม่มีใน OSM
- **turnaround และกฎท้องถิ่น:** ไม่มีค่า turnaround ที่วัดที่ DMK สถิติของ Thai AirAsia (ใช้งานเครื่อง 12.7 ชม./วัน ระยะบินเฉลี่ย 1,094 km ปี 2023 [G33]; 12.5 ชม./วัน ไตรมาส 1/2026 [G34]) ให้เวลาจอดเฉลี่ยโดยประมาณ 37–61 นาทีต่อรอบ จึงเสนอการแจกแจงสามเหลี่ยม 30/40/75 นาทีสำหรับ A320 (ค่าประมาณ) AD 2.20 กำหนดให้ push-back ด้วย towbar เท่านั้น, LVP ใช้เมื่อ RVR < 550 m หรือฐานเมฆ < 200 ft โดยใช้ได้เฉพาะ 21R (CAT II) และห้ามใช้ 21L, และ TWR-S เป็นหอที่ให้บริการ [G32]
- **ฝูงบิน:** ฐานหลักที่ DMK คือ Thai AirAsia (A320ceo 44, A320neo 11, A321neo 7 ณ ส.ค. 2025) [G26], Thai Lion Air (B737-800 20, B737-900ER 8) [G27], Nok Air (B737-800 10) [G28] และ Thai AirAsia X (A330-300) [G25] สัดส่วนแบบเครื่องบินตามจำนวนเที่ยวบินไม่มีเผยแพร่ ค่าที่เสนอในหัวข้อนี้เป็นค่าประมาณจากขนาดฝูงบินและจำนวนเส้นทาง ความเชื่อมั่นต่ำ ข้อมูลปี 2019 ยืนยันว่าเที่ยวบินในประเทศ 97.57 % เป็นเครื่อง ICAO code C [G10]
- **สิ่งที่ repo ควรเปลี่ยน:** เพิ่มโมดูลจราจร (pure, ไม่มี DOM) ที่สร้างตารางบินรายวันจาก `traffic` JSON, ใส่ชื่อทางขับให้เส้น `tw` (ข้อมูลอนุพันธ์จาก OSM, ODbL), ใช้ตำแหน่งทางออกจริงแทนการวางสุ่ม และให้เครื่องบินจอดเปลี่ยนตามตารางบิน แทนที่การวาง ≈ 96 ลำแบบสุ่มในปัจจุบัน

### ข้อมูล

#### 7.1 ปริมาณจราจรประจำปี (ทอท.)

| รายการ | ระหว่างประเทศ | ในประเทศ | รวม | เปลี่ยนแปลงจากปีก่อน (รวม) | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| Movements ปีงบ 2025 (ต.ค. 24–ก.ย. 25) | 88,737 | 124,957 | 213,694 | +8.19 % | [G6] | สูง |
| ผู้โดยสาร ปีงบ 2025 | 12,489,906 | 18,847,752 | 31,337,658 | +7.51 % | [G6] | สูง |
| สินค้า (ตัน) ปีงบ 2025 | 44,706 | 2,945 | 47,651 | +108.50 % | [G6] | สูง |
| Movements ของ LCC ปีงบ 2025 | 81,046 | 118,465 | 199,511 | +9.25 % | [G7] | สูง |
| ผู้โดยสาร LCC ปีงบ 2025 | 12,119,510 | 18,651,771 | 30,771,281 | +7.77 % | [G7] | สูง |
| Movements ปีปฏิทิน 2024 | 87,990 | 117,691 | 205,681 | +13.01 % | [G8] | สูง |
| ผู้โดยสาร ปีปฏิทิน 2024 | 12,662,393 | 17,828,242 | 30,490,635 | +11.46 % | [G8] | สูง |
| Movements ปีปฏิทิน 2025 | – | – | 214,723 | – | [G9][G25] | สูง |
| ผู้โดยสาร ปีปฏิทิน 2025 | 12,243,429 | 19,407,387 | 31,650,816 | – | [G25] (รวม ≈ 31.6 ล้านตรงกับ [G9]) | กลาง (แยกในประเทศ/ระหว่างประเทศมาจาก Wikipedia) |
| Movements ปี 2019 (ก่อนโควิด) | 108,544 | 163,819 | 272,363 | 0.00 % | [G10] | สูง |
| "เที่ยวบินจริง 2025" ในแผนวิสาหกิจ ทอท. | – | – | 197,520 | – | [G12] | กลาง (ขัดกับ [G6][G9], ดูหัวข้อความขัดแย้ง) |

ค่าที่คำนวณจากตารางข้างบน (สูตรอยู่ในหัวข้อสมการ):

| ค่าอนุพันธ์ | ค่า | วิธีคำนวณ | แหล่งข้อมูลดิบ | ความเชื่อมั่น |
|---|---|---|---|---|
| Movements เฉลี่ยต่อวัน FY2025 | 585.5 เที่ยว/วัน (≈ 292.7 ขึ้น + 292.7 ลง) | 213,694 / 365 | [G6] | สูง |
| Movements เฉลี่ยต่อวัน CY2025 | 588.3 เที่ยว/วัน | 214,723 / 365 | [G9] | สูง |
| Movements เฉลี่ยต่อวัน CY2024 | 562.0 เที่ยว/วัน | 205,681 / 366 | [G8] | สูง |
| สัดส่วนระหว่างประเทศ (movements) FY2025 | 0.4153 | 88,737 / 213,694 | [G6] | สูง |
| สัดส่วน LCC (movements) FY2025 | 0.9336 | 199,511 / 213,694 | [G6][G7] | สูง |
| สัดส่วนที่ไม่ใช่ LCC (full service, เช่าเหมา, เครื่องบินธุรกิจ, ราชการ ฯลฯ) | 0.0664 (≈ 38.9 เที่ยว/วัน) | 1 − 0.9336 | [G6][G7] | กลาง (ทอท. ไม่ได้แยกประเภทย่อย) |
| ผู้โดยสารเฉลี่ยต่อ movement FY2025 | 146.6 คน | 31,337,658 / 213,694 | [G6] | สูง |
| ตัวคูณวันพีค (เทศกาล) | 1.12 | 655.5 / 585.5 และ 655.1 / 585.5 | [G20][G21][G6] | กลาง (เป็นค่าประมาณการล่วงหน้าของ ทอท. ไม่ใช่ค่าจริง) |
| สัดส่วนเที่ยวบินประจำ/ไม่ประจำ (2019) | ประจำ 96 % (ระหว่างประเทศ 38 % + ในประเทศ 58 %), ไม่ประจำ 4 % (2 % + 2 %) | อ่านจากรายงาน | [G10] | กลาง (ปี 2019, รายงานปีหลังอ่านส่วน DMK ไม่ได้) |
| สัดส่วน ICAO code C ของเที่ยวบินในประเทศ (2019) | 97.57 % | อ่านจากรายงาน | [G10] | กลาง |

ข้อมูลรายเดือนที่ใช้ทำตัวคูณฤดูกาล (มีเพียงบางเดือน):

| เดือน | ผู้โดยสาร | Movements เทียบปีก่อน | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|
| มี.ค. 2026 | 3.0 ล้าน (+10.9 %) | +5.7 % | [G22] | กลาง (สรุปของ CAPA, ส่วน Background อาจสร้างด้วยเครื่อง) |
| เม.ย. 2026 | 2.8 ล้าน | – | [G22] | กลาง |
| พ.ค. 2026 | 2.2 ล้าน (เริ่มติดลบ) | – | [G22] | กลาง |
| ก.ย. 2026 | 1.8 ล้าน (−23.1 %) | −16.9 % | [G22] | กลาง |
| ต.ค. 2026 | 2.3 ล้าน | – | [G22] | กลาง |
| AOT ทั้ง 6 สนามบิน ต.ค. 2025–มี.ค. 2026 | 71.29 ล้าน (+4.19 %) | 426,589 เที่ยว (+2.95 %) | [G13] | สูง (ไม่แยก DMK) |

หมายเหตุ: ข้อมูลรายเดือนแยกสนามบินของ ทอท. สำหรับ FY2026 อยู่ใน Power BI dashboard [G11] ซึ่งเครื่องมือดึงข้อมูลอ่านไม่ได้ ไฟล์ xlsx รายปี (`20251017-aot-traffic-fiscal-2025.xlsx`) อยู่ในหน้า archive [G11] และน่าจะมีค่ารายเดือน ควรเปิดด้วยมือแล้วเติมตัวคูณรายเดือน 12 ค่า

#### 7.2 ขีดความสามารถทางวิ่งและการจัดสรร slot

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| ระดับการประสานตารางบิน | IATA Level 3 (ผู้ประสาน: กองจัดสรรเวลาการบิน กพท.) | [G16][G17] | สูง |
| ขีดความสามารถที่ประกาศ W24 (27 OCT 2024–29 MAR 2025, เวลา UTC) | 00:00–03:59 UTC = 45 movements/ชม.; 04:00–09:59 UTC = 50; 10:00–23:59 UTC = 53 (เปิด 24 ชม.) | [G37] | กลาง–สูง (อ่าน PDF ของ กพท. ผ่านเครื่องมือในรอบทวนสอบ) |
| แปลง W24 เป็นเวลาท้องถิ่น (UTC+7) | 07:00–10:59 น. = 45/ชม.; 11:00–16:59 น. = 50/ชม.; 17:00–06:59 น. = 53/ชม. | [G37] + คำนวณ | กลาง–สูง |
| ขีดความสามารถที่ประกาศ W22 (ฉบับเก่า) | 00:00–03:59 UTC = 40 movements/ชม.; 04:00–09:59 UTC = 45 movements/ชม. (07:00–10:59 น. และ 11:00–16:59 น.) | [G14] | กลาง (อ่านจากข้อความดัชนีของเครื่องมือค้นหา ไม่เห็นเอกสารเต็ม) |
| ข้อจำกัดอื่นใน W24 | เครื่องจอดค้างได้ไม่เกิน 24 ชม.; เที่ยวบินไม่ประจำจอดได้ไม่เกิน 3 ชม.; ความจุผู้โดยสารต่อชั่วโมง ขาเข้า 5,400 ขาออก 5,100 คน | [G37] | กลาง |
| ขีดความสามารถทางวิ่งปัจจุบันตามผู้บริหาร ทอท. (เม.ย. 2024) | 55 เที่ยว/ชม. | [G18] | กลาง (ข่าวอ้างคำพูด) |
| ขีดความสามารถหากสร้างทางขับคู่ขนานบนพื้นที่สนามกอล์ฟ | 65 เที่ยว/ชม. | [G18] | กลาง |
| เป้าหมายการออกแบบโครงการพัฒนาระยะที่ 3 | เฉลี่ย 50 เที่ยว/ชม. | [G19] | กลาง |
| ขีดความสามารถเต็มที่ ปี 2019 ตาม Wikipedia | 52 เที่ยว/ชม. | [G25] | ต่ำ (แหล่งรอง) |
| ขีดความสามารถผู้โดยสาร (แผนวิสาหกิจ 2025–2027) | 30 ล้านคน/ปี | [G12] | สูง |
| เป้าหมายเที่ยวบินในแผนวิสาหกิจ | 223,725 (2025), 238,847 (2026), 253,658 (2027) | [G12] | สูง (เป็นเป้า ไม่ใช่ค่าจริง) |
| ชั่วโมงทำการ ATS / ผู้ดำเนินการสนามบิน | H24 (ไม่มี curfew ใน AD 2.3) | [G1] | สูง |

ข้อสรุปสำหรับเครื่องจำลอง: ใช้ "ขีดจำกัดชั่วโมง" = 40 movements/ชม. เป็นค่าตรวจสอบแบบอนุรักษ์ (ทุกชั่วโมงที่สร้างขึ้นต้องไม่เกิน; ต่ำกว่าช่วงต่ำสุดของ W24 ที่ 45/ชม. [G37] จึงผ่านเกณฑ์ประกาศทุกช่วงเวลา) และใช้ 55/ชม. เป็นขีดความสามารถทางกายภาพสำหรับโหมด "วันหนาแน่นสุดขีด" ที่ผู้ใช้เลือกเอง

#### 7.3 รูปแบบรายชั่วโมง (ค่าประมาณ)

ไม่พบตารางจำนวนเที่ยวบินรายชั่วโมงของ DMK ที่เผยแพร่สาธารณะ รายงานสถิติของ ทอท. มีตาราง "1st/30th Peak Hour" สำหรับ BKK [G9] และน่าจะมีของ DMK ในส่วนที่เครื่องมืออ่านไม่ถึง ตารางข้างล่างจึงเป็น **ค่าประมาณ** สร้างตามวิธีนี้:

1. เริ่มจากรูปทรงของสนามบินฐาน LCC: เครื่องที่จอดค้างคืนที่ DMK ออกเป็นระลอกแรกช่วง 06:00–08:00 น. และกลับเข้าฐานช่วง 21:00–01:00 น.
2. ให้ชั่วโมงที่ ทอท. ระบุว่าหนาแน่น (05–07, 09–11, 15/16–18/19 น.) [G20][G21] เป็นยอดของกราฟ
3. ให้ช่วง 01:00–05:00 น. ต่ำ แต่ไม่เป็นศูนย์ เพราะสนามบินเปิด H24 [G1] และมีเที่ยวบินระหว่างประเทศกลางคืน
4. ปรับน้ำหนักจนชั่วโมงสูงสุดในวันพีค (585.5 × 1.12 × w_max) ไม่เกิน 40 movements/ชม. ตามประกาศ W22 [G14] (ฉบับ W24 ให้ 45–53/ชม. [G37] จึงเป็นเกณฑ์ที่อนุรักษ์กว่า)
5. ทำให้ผลรวมเท่ากับ 1.0000 พอดี

| ชั่วโมง (น.) | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| น้ำหนัก w_h | 0.0249 | 0.0153 | 0.0096 | 0.0077 | 0.0096 | 0.0249 | 0.0517 | 0.0566 | 0.0536 | 0.0536 | 0.0556 | 0.0517 |
| สัดส่วนขาออก d_h | 0.45 | 0.45 | 0.50 | 0.50 | 0.60 | 0.75 | 0.70 | 0.60 | 0.50 | 0.50 | 0.50 | 0.50 |
| เที่ยว/ชม. วันเฉลี่ย | 14.6 | 9.0 | 5.6 | 4.5 | 5.6 | 14.6 | 30.3 | 33.1 | 31.4 | 31.4 | 32.6 | 30.3 |

| ชั่วโมง (น.) | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| น้ำหนัก w_h | 0.0479 | 0.0479 | 0.0498 | 0.0527 | 0.0546 | 0.0556 | 0.0536 | 0.0517 | 0.0498 | 0.0469 | 0.0421 | 0.0326 |
| สัดส่วนขาออก d_h | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 | 0.45 | 0.40 | 0.35 | 0.35 |
| เที่ยว/ชม. วันเฉลี่ย | 28.0 | 28.0 | 29.2 | 30.9 | 32.0 | 32.6 | 31.4 | 30.3 | 29.2 | 27.5 | 24.6 | 19.1 |

ทุกค่าในสองตารางนี้เป็น **ค่าประมาณ** (ความเชื่อมั่น ต่ำ–กลาง: รูปทรงอิงช่วงพีคที่ ทอท. แจ้ง [G20][G21] และเพดานจาก [G14] แต่ตัวเลขรายชั่วโมงไม่ได้วัดจริง) ผลตรวจ: Σw_h = 1.0000, Σ w_h·d_h = 0.5028 (ขาออก ≈ ขาเข้า), ชั่วโมงสูงสุดวันเฉลี่ย = 33.1 และวันพีค = 37.1 movements/ชม. ≤ 40 วิธียืนยันในอนาคต: เก็บตารางบินขาเข้าและขาออกจริง 7 วันจากกระดานเที่ยวบินของ ทอท. แล้วนับต่อชั่วโมง

#### 7.4 สายการบินที่ปฏิบัติการที่ DMK (ข้อมูล ณ ต.ค.–พ.ย. 2026)

| สายการบิน (IATA/ICAO) | สถานะที่ DMK | แบบเครื่องบิน (ICAO type designator) | ฝูงบิน (ทั้งสายการบิน) | จำนวนจุดหมายจาก DMK | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| Thai AirAsia (FD/AIQ) | ฐานหลักและสำนักงานใหญ่ | A320 (ceo, 180 ที่นั่ง), A20N (186), A21N (236) | A320ceo 44, A320neo 11, A321neo 7 = 62 ลำ (ส.ค. 2025) | 69 | [G26][G25] | กลาง (Wikipedia; ควรเทียบรายงาน 56-1 ของ AAV) |
| Thai Lion Air (SL/TLM) | ฐานหลัก | B738 (189), B739 (215) | 737-800 20, 737-900ER 8 = 28 ลำ (ส.ค. 2025) | 49 ที่ยังบิน | [G27][G25] | กลาง |
| Nok Air (DD/NOK) | ฐานหลัก | B738 (189) | 737-800 10 ลำ (ส.ค. 2025), สั่ง 737 MAX 8 อีก 6 | 17 | [G28][G25] | กลาง |
| Thai AirAsia X (XJ/TAX) | ฐานหลัก (เส้นทางพิสัยไกล) | A333 | ไม่ได้ยืนยันจำนวน | 6 ที่ยังบิน | [G25] | กลาง |
| AirAsia (AK), Indonesia AirAsia (QZ), Philippines AirAsia (Z2) | ต่างประเทศ | A320 family | – | 1 ต่อสาย | [G25] | กลาง |
| Batik Air Malaysia (OD), Batik Air (ID) | ต่างประเทศ | A320 family / B737 (ไม่ได้ยืนยัน) | – | 3 และ 1 | [G25] | ต่ำ (แบบเครื่องไม่ได้ยืนยัน) |
| Cebu Pacific (5J), Citilink (QG), flydubai (FZ), Spring Airlines (9C), Myanmar Airways International (8M), Bangkok Airways (PG) | ต่างประเทศ / ในประเทศ | ไม่ได้ยืนยันรายสาย | – | 1–4 | [G25] | ต่ำ |

สายการบินที่เป็นฐานหลักทั้งสี่ตรงกับคำอธิบายใน Wikipedia ว่า DMK เป็นฐานของ Nok Air, Thai AirAsia, Thai AirAsia X และ Thai Lion Air [G25] และคู่มือ spotter ยืนยันว่าเครื่องหลักคือ A320/A320neo/A321neo ของไทยแอร์เอเชีย และ B737-800 ของไทยไลอ้อนแอร์กับนกแอร์ [G29]

#### 7.5 สัดส่วนแบบเครื่องบินตามจำนวน movements (ค่าประมาณ)

วิธีประมาณ (ทำซ้ำได้): (1) สัดส่วนสายการบินประมาณจากขนาดฝูงบิน [G26][G27][G28] และจำนวนจุดหมายจาก DMK [G25] (69 : 49 : 17 ≈ 0.51 : 0.36 : 0.13 สำหรับ FD : SL : DD) แล้วปรับลดสาย SL เพราะเส้นทางจีนส่วนใหญ่บินวันละ 1 เที่ยว (2) สัดส่วน "อื่น ๆ ที่ไม่ใช่ LCC" ตรึงไว้ที่ 0.07 ตามสถิติ ทอท. (0.0664) [G6][G7] (3) สัดส่วนแบบเครื่องภายในสายการบินใช้สัดส่วนฝูงบินทั้งสาย

| กลุ่ม | สัดส่วน movements (ค่าประมาณ) | แบบเครื่องภายในกลุ่ม | ความเชื่อมั่น |
|---|---|---|---|
| Thai AirAsia (FD) | 0.48 | A320 0.71, A20N 0.18, A21N 0.11 (จากฝูงบิน [G26]) | ต่ำ |
| Thai Lion Air (SL) | 0.27 | B738 0.714, B739 0.286 (จากฝูงบิน [G27]) | ต่ำ |
| Nok Air (DD) | 0.09 | B738 1.0 [G28] | ต่ำ |
| Thai AirAsia X (XJ) | 0.02 | A333 1.0 [G25] | ต่ำ |
| LCC ต่างประเทศ | 0.07 | A320 0.55, A20N 0.15, A21N 0.10, B738 0.15, B38M 0.05 | ต่ำ |
| อื่น ๆ (full service, เช่าเหมา, ธุรกิจ, ราชการ) | 0.07 (ตรึงจาก [G6][G7]) | A320 0.30, A20N 0.05, A21N 0.05, B738 0.15, AT76 0.15, A333 0.10, BIZJ 0.20 | ต่ำ |

ผลรวมตามแบบเครื่อง (ค่าประมาณ, ผลรวม = 1.0000): A320 0.4003, B738 0.3038, A20N 0.1004, B739 0.0772, A21N 0.0633, A333 0.0270, BIZJ 0.0140, AT76 0.0105, B38M 0.0035 ตรวจความสมเหตุสมผล: ที่นั่งเฉลี่ยถ่วงน้ำหนัก ≈ 191.4 ที่นั่งต่อ movement (ที่นั่งต่อแบบจาก [G26][G27][G28], A333 สมมติ 377, AT76 สมมติ 70, BIZJ สมมติ 12) เทียบกับผู้โดยสารจริง 146.6 คนต่อ movement [G6] ได้ load factor โดยนัย ≈ 0.77 ซึ่งอยู่ในช่วงสมเหตุสมผล 0.70–0.90 สัดส่วน code C รวม ≈ 0.95 สอดคล้องกับข้อมูลปี 2019 ที่ 97.57 % ของเที่ยวบินในประเทศเป็น code C [G10]

เที่ยวบินทหารและราชการ: ไม่มีตัวเลขสาธารณะว่า ทอท. นับรวมใน movements หรือไม่ ให้แสดงในเครื่องจำลองแบบทั่วไปเท่านั้น เป็นพารามิเตอร์ `state_share` ค่าเริ่มต้น 0.02 (ค่าประมาณ ความเชื่อมั่นต่ำ) ใช้ทางวิ่ง 03R/21L และลานจอดฝั่งตะวันออก ไม่ระบุหน่วยหรือแบบเครื่องเฉพาะ

#### 7.6 การใช้ทางวิ่ง

หลักฐานที่มี (เรียงตามน้ำหนัก):

| หลักฐาน | สิ่งที่บอก | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| Stop bar ที่ RWY 21R: B (เหนือ) 130 m; D 130 m ขวา และ 210 m ซ้าย; E 90 m ขวา; J 90 m ขวา; S 90 m ขวา และ 130 m ซ้าย; C (ใต้) 90 m จากเส้นกึ่งกลาง | มีจุดรอข้ามฝั่งซ้าย (ฝั่งตะวันออก ระหว่างสองทางวิ่ง) เฉพาะที่ D และ S จึงมีการข้าม 03L/21R เฉพาะสองจุดนี้ | [G1] AD 2.9 | สูง |
| Hot spot HS1: เครื่องที่ไป 21R จาก Taxilane B หรือ TWY C เลี้ยวขวาเข้า TWY D และรอก่อน 21R | 21R ใช้ขึ้นจากต้นทางวิ่ง (D) | [G3][G4] | สูง |
| HS2: เครื่องบน TWY C ที่ไป 21R เลี้ยวขวาเข้า TWY E และรอก่อน 21R | มีการขึ้นจากจุดตัด E (intersection departure) | [G3][G4] | สูง |
| HS3, HS4: เสี่ยงล้ำเข้า 21R-03L จาก TWY O และ TWY R เมื่อจะเข้า TWY C (ใกล้ rapid exit) | O และ R คือ rapid exit ของการลง 21R | [G3][G4] | สูง |
| HS5: หลังออกจาก 21L ด้วยการเลี้ยวขวาเข้า TWY S ให้รอก่อน 21R | มีเครื่องพลเรือนลง 21L แล้วข้าม 21R ที่ S | [G3][G4] | สูง |
| HS6: เครื่องที่ไป 03R บน Taxilane T เลี้ยวขวาเข้า TWY S และรอก่อน 03R | การขึ้น 03R จากฝั่งตะวันออก (พื้นที่ทหาร/ราชการ) ที่จุด S | [G3][G4] | สูง |
| AIP SUP A 22/21: เมื่อปิด 03L/21R ทางขับที่เชื่อมทางวิ่งนี้ถูกปิด ได้แก่ E, F, J, O, R, C SOUTH ยกเว้น D และ S | ยืนยันชื่อทางออกทั้งหมดของ 03L/21R | [G5] | สูง |
| คู่มือ spotter: 03L/21R เป็นทางวิ่งที่เที่ยวบินประจำใช้มากที่สุดเพราะใกล้อาคาร, 03R/21L เป็นทางวิ่งหลักของฐานทหารฝั่งตะวันออก เที่ยวบินประจำใช้บ้าง เมื่อ 03L/21R มีเครื่องขึ้นมาก จะย้ายเครื่องลงไป 03R/21L และในช่วงพีคอาจมีเครื่องลงฝั่งนี้มากกว่า | โหมดผสมบนทางวิ่งตะวันตก + รับเครื่องลงส่วนเกินบนทางวิ่งตะวันออก | [G29] | กลาง (แหล่งรองจากผู้ถ่ายภาพเครื่องบิน; หน้าเดียวกันสลับความยาวทางวิ่งผิด) |
| ทิศ 03 ใช้ ต.ค.–ก.พ. | เลือกทิศตามลมมรสุม | ข้อมูลที่ทราบแล้วจากเจ้าของโครงการ | – |
| ประกาศขีดความสามารถ W24: ปิดทางวิ่งกลางคืน 17:00–22:00 UTC (00:00–05:00 น.) ล้างคราบยาง 03L/21R จันทร์–พฤหัสบดี, 03R/21L ศุกร์–เสาร์; ทดสอบความฝืด 03L/21R พฤหัสบดี, 03R/21L เสาร์ | ช่วงตีหนึ่งถึงตีห้าบางคืน เที่ยวบินพลเรือนทั้งหมดต้องใช้ทางวิ่งเดียวที่เปิดอยู่ (คืนที่ปิด 03L/21R ต้องใช้ 03R/21L ทั้งขึ้นและลง) | [G37] | กลาง (ฉบับฤดูหนาว 2024/25; ฉบับปัจจุบันดึงไม่ได้) |
| ILS: 21R CAT II, 21L CAT I, 03L CAT I; 03R มีแต่ RNP | ทัศนวิสัยต่ำในทิศ 21 ลง 21R; ทิศ 03 ลง 03L | ข้อมูลฐานของ repo (AIP) | สูง |

ข้อสรุปที่ใช้ในเครื่องจำลอง (โหมด "mixed + overflow"):

| ทิศ | ทางวิ่งขาออก | ทางวิ่งขาเข้าหลัก | ทางวิ่งขาเข้าเสริม (ช่วงพีค) | เส้นทางของเครื่องที่ลงทางวิ่งเสริม | ความเชื่อมั่น |
|---|---|---|---|---|---|
| 21 (มี.ค.–ก.ย. โดยประมาณ) | 21R (เข้าที่ D เต็มความยาว หรือ E แบบ intersection) | 21R (ILS CAT II) | 21L (ILS CAT I) | วิ่งไปออกขวาที่ S (2,955 m จาก threshold 21L) รอที่จุดรอฝั่งซ้ายของ 21R (130 m) แล้วข้าม 21R เข้า C | กลาง |
| 03 (ต.ค.–ก.พ.) | 03L (เข้าที่ C South เต็มความยาว หรือ S แบบ intersection) | 03L (ILS CAT I) | 03R (RNP) | วิ่งไปออกซ้ายที่ D (3,098 m จาก threshold 03R) รอที่จุดรอฝั่งตะวันออกของ 03L (210 m) แล้วข้าม 03L | ต่ำ–กลาง (อนุมานจากเรขาคณิต ไม่มีเอกสารยืนยันการลง 03R ของพลเรือน) |

สัดส่วนการลงบนทางวิ่งเสริม: ไม่มีข้อมูลสาธารณะ เสนอค่าเริ่มต้นเป็นฟังก์ชันของจำนวนขาเข้าต่อชั่วโมง (ค่าประมาณ): ถ้าขาเข้าในชั่วโมงนั้น ≤ 14 ให้ลงทางวิ่งหลักทั้งหมด ถ้ามากกว่า ให้ส่งส่วนเกินไปทางวิ่งเสริม แต่ไม่เกิน 50 % ของขาเข้าในชั่วโมงนั้น (อิงคำบรรยายของ [G29] ว่า "ช่วงพีคอาจลงฝั่งนี้มากกว่า") ความเชื่อมั่นต่ำ

การปฏิบัติการกลางคืน: ATS และผู้ดำเนินการสนามบินเปิด H24 [G1] ไม่พบข้อจำกัด curfew ในส่วนที่อ่านได้ แต่ประกาศ W24 มีการปิดทางวิ่งทีละเส้นช่วง 00:00–05:00 น. ในบางคืนเพื่อล้างคราบยางและทดสอบความฝืด [G37] ตัวสร้างจราจรควรส่งทุกเที่ยวบินในช่วงนั้นไปทางวิ่งที่เปิด (ฟิลด์ `runway_config.night_closures_w24`) AD 2.21 (การลดเสียง) อ่านไม่ได้ในรอบนี้ ให้ถือว่าไม่มี curfew จนกว่าจะยืนยัน

ทัศนวิสัยต่ำ (LVP): ใช้เมื่อ RVR ต่ำกว่า 550 m หรือฐานเมฆต่ำกว่า 200 ft ในสภาพนี้ 21R รับ CAT II ได้ และ**ห้ามใช้ 21L** [G32] จึงต้องปิดโหมดรับเครื่องลงเสริมบนทางวิ่งตะวันออกเมื่อเปิด LVP (ทิศ 03 ไม่มีทางวิ่ง CAT II ตามข้อมูลฐานของ repo)

TWY Y: "เมื่อ RWY 03R/21L ใช้ขึ้นลง ห้ามอากาศยานอื่นใช้ TWY Y และเมื่อ TWY Y มีการใช้ ห้ามใช้ RWY 03R/21L" [G1][G3][G4] ตำแหน่งของ TWY Y ไม่มีในข้อมูล OSM (Overture รุ่น 2026-10-21.0) [G30] จึงระบุพิกัดไม่ได้ ในเครื่องจำลองให้ทำเป็นกฎ: ถ้าทางวิ่ง 03R/21L อยู่ในสถานะ active ให้ห้ามเส้นทางใดที่มี "Y"

Taxilane T: ช่วงระหว่าง TWY V กับ TWY S ใช้ได้เฉพาะ code A, B, C, D [G1][G3] ใน OSM มีเส้น T ทางทิศตะวันออกของ 21L (ฝั่งพื้นที่ทหาร) [G30] เส้นทางพลเรือนไม่ใช้ T

#### 7.7 ทางออกและทางเข้าทางวิ่ง (คำนวณจาก OSM)

วิธีคำนวณ: นำเส้นทางขับ (aeroway=taxiway พร้อมแท็ก ref) จาก Overture Maps base/infrastructure รุ่น 2026-10-21.0 ซึ่งมาจาก OpenStreetMap [G30][G31] ในกรอบ 100.575–100.645°E, 13.875–13.950°N มาฉายด้วยฟังก์ชัน `ll_to_en` ของ repo แล้วหาจุดตัดกับเส้นกึ่งกลางทางวิ่งที่ลากระหว่าง threshold ตาม AIP (03L→21R และ 03R→21L) ระยะ `s` วัดตามแนวทางวิ่งจาก threshold ของทิศที่ลง มุม = ทิศของทางขับที่ระยะ 60 m จากจุดตัด เทียบกับทิศการลง (ค่าบวก = ไปทางซ้ายของทิศ 03 คือฝั่งตะวันตก) ความคลาดเคลื่อนตำแหน่งของ OSM เทียบ AIP: เส้นกึ่งกลาง 03L/21R ของ OSM ห่างเส้นจาก AIP ≤ 1 m และ 03R/21L ห่าง 2–4 m จึงประเมินว่าระยะ `s` ถูกต้อง ±10 m (ค่าประมาณ)

| ทางวิ่ง/ทิศลง | ทางขับ | s จาก threshold ทิศลง (m / ft) | ชนิด (มุม) | ฝั่ง | พิกัด (lat, lon) | local e, n (m) | ใช้กับ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|---|---|
| 21R | E | 419 / 1,375 | ทางเข้าเฉียง (151°) | ตะวันตก | 13.923034, 100.610533 | 523.2, 958.3 | ทางเข้า intersection ขาออก 21R (HS2) | [G30][G3] | กลาง |
| 21R | E | 484 / 1,588 | ตั้งฉาก 90° | ตะวันตก | 13.922515, 100.610242 | 491.8, 900.9 | ทางเข้า intersection ขาออก 21R | [G30] | กลาง |
| 21R | F | 1,101 / 3,612 | ทางออกเฉียง (≈ 50° จากทิศลง) | ตะวันตก | 13.917624, 100.607499 | 195.3, 359.7 | เครื่องใบพัดที่ลงสั้น (ค่าประมาณ; สมการ 7.8 ให้ AT76 ออกที่ J) | [G30] | กลาง |
| 21R | J | 1,510 / 4,954 | ตั้งฉาก 90° (เฉพาะไม่เกิน B737) | ตะวันตก | 13.914381, 100.605680 | −1.2, 1.0 | ATR 72 | [G30][G3][G5] | กลาง (OSM ไม่มีป้าย J ที่ส่วนต่อทางวิ่ง แต่เป็นเส้นเดียวกับ J ในลานจอด) |
| 21R | O | 1,719 / 5,640 | rapid exit (มุมสัมผัส ≈ 7° ที่ 60 m) | ตะวันตก | 13.912729, 100.604754 | −101.3, −181.8 | A320/A20N ทางวิ่งแห้ง | [G30][G3] | กลาง |
| 21R | R | 2,378 / 7,802 | rapid exit (≈ 11°) | ตะวันตก | 13.907500, 100.601821 | −418.3, −760.3 | B738/B739, A321neo, A330, ทางวิ่งเปียก | [G30][G3] | กลาง |
| 21R | S | 2,966 / 9,731 | ตั้งฉาก ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.902842, 100.599209 | −700.6, −1275.7 | ทางออกสุดท้ายก่อนปลาย / จุดข้าม | [G30][G1] | กลาง |
| 21R | C South | 3,562 / 11,686 | ปลายทางวิ่ง | ตะวันตก | 13.898118, 100.596560 | −986.9, −1798.3 | ทางออกปลายทางวิ่ง | [G30] | กลาง |
| 03L | C South | 140 / 459 | ทางเข้าต้นทางวิ่ง | ตะวันตก | 13.898118, 100.596560 | −986.9, −1798.3 | ขึ้น 03L เต็มความยาว | [G30] | กลาง |
| 03L | S | 736 / 2,415 | ตั้งฉาก ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.902842, 100.599209 | −700.6, −1275.7 | ขึ้น 03L แบบ intersection | [G30][G1] | กลาง |
| 03L | J | 2,191 / 7,188 | ตั้งฉาก 90° | ตะวันตก | 13.914381, 100.605680 | −1.2, 1.0 | A320, B738 ทางแห้ง; ATR 72 | [G30] | กลาง |
| 03L | F | 2,310 / 7,579 | rapid exit (มุมสัมผัส) | ตะวันตก | 13.915320, 100.606207 | 55.7, 104.9 | A320 ทางเปียก, A330 | [G30] | กลาง |
| 03L | E | 3,146 / 10,322 | rapid exit (25°) | ตะวันตก | 13.921948, 100.609924 | 457.4, 838.2 | B738 ทางเปียก | [G30] | กลาง |
| 03L | E | 3,217 / 10,555 | ตั้งฉาก 90° | ตะวันตก | 13.922515, 100.610242 | 491.8, 900.9 | – | [G30] | กลาง |
| 03L | D / B North | 3,639 / 11,939 | ปลายทางวิ่ง / ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.925857, 100.612116 | 694.3, 1270.6 | ทางออกสุดท้าย; จุดข้ามของเครื่องที่ลง 03R | [G30] | กลาง |
| 21R | D / B North | 63 / 207 | ต้นทางวิ่ง | ทั้งสองฝั่ง | 13.925857, 100.612116 | 694.3, 1270.6 | ขึ้น 21R เต็มความยาว (HS1) | [G30][G3] | กลาง |
| 21L | D | 53 / 174 (จาก threshold ที่เลื่อน 350 m) | ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.924119, 100.615313 | 1039.8, 1078.4 | ไม่ใช่ทางออก | [G30] | กลาง |
| 21L | ทางออกไม่มีชื่อ | 746 / 2,448 | rapid exit (24°) | ตะวันออก | 13.918627, 100.612229 | 706.5, 470.7 | เครื่องฝั่งตะวันออกเท่านั้น | [G30] | กลาง |
| 21L | U | 809 / 2,654 | ตั้งฉาก | ตะวันออก | 13.918121, 100.611945 | 675.8, 414.8 | ฝั่งตะวันออก | [G30] | กลาง |
| 21L | ทางออกไม่มีชื่อ | 1,444 / 4,738 | rapid exit (37°) | ตะวันออก | 13.913090, 100.609120 | 370.5, −141.8 | ฝั่งตะวันออก | [G30] | กลาง |
| 21L | V | 1,497 / 4,911 | ตั้งฉาก | ตะวันออก | 13.912676, 100.608887 | 345.4, −187.7 | ฝั่งตะวันออก | [G30] | กลาง |
| 21L | W | 2,343 / 7,687 | rapid exit (31°) | ตะวันออก | 13.905972, 100.605123 | −61.5, −929.4 | ฝั่งตะวันออก | [G30] | กลาง |
| 21L | S | 2,955 / 9,695 | ตั้งฉาก ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.901119, 100.602398 | −356.0, −1466.3 | ทางออกฝั่งตะวันตกทางเดียวของ 21L (HS5) | [G30][G3] | กลาง |
| 03R | S | 196 / 643 | ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.901119, 100.602398 | −356.0, −1466.3 | ทางเข้าขึ้น 03R (HS6) | [G30][G3] | กลาง |
| 03R | ทางออกไม่มีชื่อ | 1,607 / 5,272 | rapid exit (40°) | ตะวันออก | 13.912308, 100.608681 | 323.0, −228.4 | ฝั่งตะวันออก | [G30] | กลาง |
| 03R | V | 1,654 / 5,427 | ตั้งฉาก | ตะวันออก | 13.912676, 100.608887 | 345.4, −187.7 | ฝั่งตะวันออก | [G30] | กลาง |
| 03R | ทางออกไม่มีชื่อ | 2,294 / 7,526 | rapid exit (41°) | ตะวันออก | 13.917746, 100.611734 | 653.0, 373.2 | ฝั่งตะวันออก | [G30] | กลาง |
| 03R | U | 2,341 / 7,680 | ตั้งฉาก | ตะวันออก | 13.918121, 100.611945 | 675.8, 414.8 | ฝั่งตะวันออก | [G30] | กลาง |
| 03R | D | 3,098 / 10,164 | ตั้งฉาก ข้ามทางวิ่ง | ทั้งสองฝั่ง | 13.924119, 100.615313 | 1039.8, 1078.4 | ทางออกฝั่งตะวันตกทางเดียวหลัง S | [G30] | กลาง |

ข้อสังเกตเชิงออกแบบ: rapid exit ของทางวิ่งตะวันตกหันไปทางทิศ 21R (R, O) มากกว่าทิศ 03L (F, E) แสดงว่าการลง 21R เป็นกรณีออกแบบหลัก ส่วน rapid exit ทั้งหมดของทางวิ่งตะวันออกหันไปฝั่งตะวันออก [G30] การเลือก "ทางออกปกติ" ตามแบบเครื่องในตาราง 7.7 คำนวณจากสมการในหัวข้อสมการ (ค่าประมาณ)

#### 7.8 เส้นทางขับปกติ (ลำดับชื่อทางขับ)

AD 2.20 ฉบับ 3 SEP 2026 ไม่มีเส้นทางขับมาตรฐาน (standard taxi routes) มีเพียงกฎทั่วไปในข้อ 6, 12 และ 15 [G32] ลำดับข้างล่างจึงอนุมานจาก hot spot [G3], stop bar [G1], รายการทางขับที่ต่อกับทางวิ่ง [G5] และเส้นทางสั้นสุดบนกราฟทางขับ OSM [G30] (ระยะเป็นค่าประมาณ วัดจากโหนดทางขับที่ใกล้ประตูขึ้นเครื่องของ OSM ที่สุด ซึ่งห่างประตูจริง 100–150 m)

| รหัส | ทิศ | การเคลื่อนที่ | ลำดับทางขับ | ระยะโดยประมาณจากลานหน้าประตู 23–53 (m) | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| DEP21R_D | 21 | ขาออกเต็มความยาว | stand → B → (G/H/I) → C → D → 21R | 1,130–2,040 | [G3] HS1, [G30] | กลาง |
| DEP21R_D_N | 21 | ขาออกจากลานจอดเหนือ | stand → A → B (ส่วนต่อขยาย) → D → 21R | 1,130–1,220 | [G3] (Taxilane B extension จาก A ถึง D) | กลาง |
| DEP21R_E | 21 | ขาออก intersection | stand → B → C → E → 21R | 740–1,640 | [G3] HS2, [G30] | กลาง |
| ARR21R_O | 21 | ขาเข้า | 21R → O → C → (M/J/I) → B → stand | 1,040–1,800 | [G3] HS3, [G30] | กลาง |
| ARR21R_R | 21 | ขาเข้า (ลงยาว) | 21R → R → C → (P/J) → B → stand | 1,650–2,490 | [G3] HS4, [G30] | กลาง |
| ARR21R_J | 21 | ขาเข้า (ATR) | 21R → J → C → B → stand | 590–1,170 | [G1][G30] | กลาง |
| ARR21L_S | 21 | ขาเข้าทางวิ่งเสริม | 21L → S → (รอก่อน 21R) → ข้าม 21R → C → B → stand | 2,200–3,040 | [G3] HS5, [G30] | กลาง |
| DEP03L_CS | 03 | ขาออกเต็มความยาว | stand → B → C → C South → 03L | 2,670–3,510 | [G30] | กลาง |
| DEP03L_S | 03 | ขาออก intersection | stand → B → C → S → 03L | 1,810–2,650 | [G1][G30] | ต่ำ–กลาง |
| ARR03L_J | 03 | ขาเข้า | 03L → J → C → B → stand | 590–1,170 | [G30] | กลาง |
| ARR03L_F | 03 | ขาเข้า | 03L → F → (G/H) → C หรือ B → stand | 660–1,290 | [G30] | กลาง |
| ARR03L_E | 03 | ขาเข้า (ลงยาว) | 03L → E → C → B → stand | 780–1,680 | [G30] | กลาง |
| ARR03R_D | 03 | ขาเข้าทางวิ่งเสริม | 03R → D → (รอก่อน 03L ที่ 210 m) → ข้าม 03L → C หรือ B → stand | 1,530–2,430 | [G1][G30] | ต่ำ |

ทางเชื่อมระหว่างทางขับ C กับ Taxilane B ใน OSM มีชื่อ A, G, H, I, J, M, N, O, P, R [G30] ทางขับ C ทั้งเส้นมีไฟกึ่งกลาง (เฉพาะ C ส่วนใต้ระบุชัด) และมีไฟจุดรอระหว่างทางขับ (intermediate holding position lights) ทุกจุดตัดตาม C [G1]

ความกว้าง/ข้อจำกัด: TWY B North, C South และ Taxilane B ส่วนต่อขยาย กว้าง 23 m, TWY D จาก 21L ไปลานจอดฝั่งตะวันออกกว้าง 23 m, TWY J สำหรับเครื่องไม่เกิน B737, ทุกหลุมจอดเป็นแบบหันหัวเข้า (nose-in) [G3][G4] ทางขับอื่นกว้างได้ถึง 50 m [G1]

#### 7.9 เวลา turnaround

ไม่พบตัวเลข turnaround ที่วัดจริงที่ DMK ในแหล่งชั้นต้น สายการบินฐานหลักรายใหญ่ที่สุด (Thai AirAsia ผ่านบริษัทแม่ AAV) เปิดเผยสถิติการใช้งานเครื่องบิน จึงใช้ข้อมูลนั้นประมาณเวลาจอดเฉลี่ยต่อรอบ ส่วนเวลา turnaround ขั้นต่ำตามแผนภูมิของผู้ผลิตยังอ่านไม่ได้

ข้อมูลชั้นต้น:

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| ชั่วโมงใช้งานเครื่องบินของ Thai AirAsia (block hours ต่อลำต่อวัน) ปี 2021 / 2022 / 2023 | 5.6 / 9.6 / 12.7 ชม. | [G33] | สูง |
| ชั่วโมงใช้งานเครื่องบิน ไตรมาส 1/2026 | 12.5 ชม./ลำ/วัน | [G34] | สูง |
| ฝูงบิน ณ 31 ธ.ค. 2023 | A320 43 ลำ (180 ที่นั่ง), A320neo 11 (186), A321neo 2 (236) รวม 56 ลำ | [G33] | สูง |
| ฝูงบินที่ใช้ปฏิบัติการ ไตรมาส 1/2026 | 58 ลำ | [G34] | สูง |
| จำนวนเที่ยวบิน (sectors) ปี 2023 | 114,571 (ระหว่างประเทศ 45,047 ในประเทศ 69,524) | [G33] | สูง |
| ระยะบินเฉลี่ยต่อเที่ยว ปี 2023 | 1,094 km (591 NM) | [G33] | สูง |
| ตรงเวลา (ออกช้าไม่เกิน 15 นาที) ปี 2023 | 83 % | [G33] | สูง |
| Load factor ไตรมาส 1/2026 | 88 % (ในประเทศ 89 %, ระหว่างประเทศ 85 %) | [G34] | สูง |
| แผนภูมิ turnaround ของผู้ผลิต | เอกสาร Airbus A320 Aircraft Characteristics มีหัวข้อ 5-2-0 "Full Servicing Turn Round Time Chart" และ 5-3-0 "Outstation Turn Round Time Chart" แต่เครื่องมืออ่านได้เพียงสารบัญ (ข้อความ 58,916 ตัวอักษรแรก) | [G35] | – (ไม่มีตัวเลข) |
| กฎการถอยออกจากหลุมจอด | push-back ต้องใช้ towbar ห้าม power-back และห้ามเครื่องเลี้ยวออกจากหลุมเอง; ต้อง push-back ภายใน 5 นาทีหลังได้รับอนุญาต (เที่ยวบินในประเทศไม่ต้องทำตามเงื่อนไขเวลานี้) | [G32] AD 2.20 ข้อ 5, 10 | กลาง |

ค่าอนุพันธ์ (ค่าประมาณทั้งหมด สูตรอยู่ในหัวข้อสมการ):

| ค่า | ผล | วิธี | แหล่งข้อมูลดิบ | ความเชื่อมั่น |
|---|---|---|---|---|
| เที่ยวบินต่อลำต่อวัน (เฉลี่ยทั้งฝูง) | 5.61 | 114,571 / (56 × 365) | [G33] | กลาง |
| block time ต่อเที่ยว ถ้าทุกลำบินทุกวัน | 2.27 ชม. | 12.7 / 5.61 | [G33] | ต่ำ (ยาวกว่าที่ระยะบินเฉลี่ยบอก แสดงว่ามีเครื่องที่ไม่ได้บินในบางวัน) |
| block time จากระยะบินเฉลี่ย (ความเร็ว block สมมติ 580 km/h = 313 kt) | 1.89 ชม. | 1,094 / 580 | [G33] + ค่าประมาณ | ต่ำ |
| เวลาจอดเฉลี่ยต่อรอบ ทั้งเครือข่าย (ช่วงทำการ 18.5 ชม./วัน) | ≈ 61 นาที | สมการ (7.9) | [G33] + ค่าประมาณ | ต่ำ |
| เวลาจอดเฉลี่ยต่อรอบ ถ้าบินเส้นทางในประเทศระยะ 700 km | ≈ 37 นาที | สมการ (7.9) | ค่าประมาณ | ต่ำ |
| ขาออกช่วง 05:00–07:59 น. (วันเฉลี่ย) | 52.0 เที่ยว | Σ D·w_h·d_h จากตาราง 7.3 | [G6] + ค่าประมาณ 7.3 | ต่ำ |
| ขาเข้าช่วง 21:00–00:59 น. (วันเฉลี่ย) | 52.9 เที่ยว | Σ D·w_h·(1 − d_h) | [G6] + ค่าประมาณ 7.3 | ต่ำ |
| จำนวนเครื่องที่จอดเพิ่มขึ้นช่วงกลางคืน (ส่วนต่างสะสมขาเข้า − ขาออก จาก 19:00 ถึง 02:00 น.) | ≈ 24 ลำ | ผลรวมสะสมของ (ขาเข้า − ขาออก) รายชั่วโมง | ค่าประมาณ 7.3 | ต่ำ |
| เครื่องบินพาณิชย์ที่จอดค้างคืน (night stop) | ≈ 40–55 ลำ (ค่ากลาง 50) | อิงจำนวนขาออกช่วงเช้า 52 เที่ยวซึ่งส่วนใหญ่เป็นเครื่องที่ค้างคืน | ค่าประมาณ | ต่ำ |

ข้อเสนอสำหรับตัวสร้างจราจร (ทุกค่าเป็น **ค่าประมาณ** ความเชื่อมั่นต่ำ จนกว่าจะได้ค่าจากแผนภูมิ 5-2-0/5-3-0 ของ Airbus [G35] และเอกสาร Airport Planning ของ Boeing/ATR): ใช้การแจกแจงสามเหลี่ยม (min, mode, max) ของเวลาตั้งแต่ on-block ถึง off-block

| กลุ่มแบบเครื่อง | min (นาที) | mode (นาที) | max (นาที) | เหตุผล |
|---|---|---|---|---|
| A320, A20N | 30 | 40 | 75 | สายการบินต้นทุนต่ำจัดตารางให้จอดสั้น; ค่าเฉลี่ยของการแจกแจง = 48.3 นาที อยู่ระหว่าง 37 และ 61 นาทีที่ประมาณจาก [G33] |
| A21N, B738, B739, B38M | 35 | 45 | 80 | ผู้โดยสารมากกว่าและบางลำใช้ประตูเดียว (ค่าเฉลี่ย 53.3 นาที) |
| AT76 | 20 | 25 | 45 | ใบพัดขนาดเล็ก ผู้โดยสาร ≈ 70 คน |
| A333 | 75 | 90 | 150 | wide-body เส้นทางพิสัยไกล |
| BIZJ, ราชการ (generic) | 30 | 90 | 480 | ไม่มีตารางบิน |
| เวลา push-back และติดเครื่อง | 3 | 4 | 5 | ต้อง push ภายใน 5 นาทีหลังได้รับอนุญาต [G32] |

การจอดค้างคืน: เครื่องที่ลงหลัง 21:00 น. ให้จอดถึงระลอกขาออกแรก 05:00–08:00 น. ของวันถัดไป จำนวนเครื่องที่จอดใน repo ตอนนี้ (สุ่มสูงสุด ≈ 96 ลำ) จึงเหมาะเป็นภาพ "ตีสี่" มากกว่าภาพกลางวัน ถ้าทำให้จำนวนเครื่องจอดเปลี่ยนตามเวลา ให้ใช้ N_parked(t) = N_base + Σ(ขาเข้า − ขาออก) ตั้งแต่ 05:00 น. โดย N_base ≈ 25 ลำ (ค่าประมาณ: เครื่องสำรอง ซ่อมบำรุง และเครื่องที่จอดยาว) แล้ว N_parked จะอยู่ราว 25 ลำตอนกลางวันและ ≈ 49 ลำตอน 02:00 น.

#### 7.10 กฎท้องถิ่น AD 2.20 ที่เกี่ยวกับการใช้ทางวิ่งและการขับ (AIRAC 3 SEP 2026)

ข้อมูลนี้มาจากการอ่าน AD 2.20 ฉบับ AIRAC 3 SEP 2026 ที่งานของหัวข้อ 1 ทำไว้ในรอบนี้ (ผ่านเครื่องมือดึงหน้าเว็บซึ่งสรุปความ ไม่ได้คัดลอกตรง) [G32] และหัวข้อ 1 ตรวจแล้วว่ารอบ 1 OCT และ 29 OCT 2026 ไม่มีการแก้ AD 2.20 (ดูหัวข้อ 1 ตาราง AD 2.x) เมื่อดึงหน้าเดิมซ้ำในวันนี้ เครื่องมือได้ข้อความเพียง 97,829 ตัวอักษรแรก ซึ่งจบใน AD 2.19 จึงยืนยันซ้ำไม่ได้ ความเชื่อมั่นทั้งตารางจึงเป็น "กลาง"

| ข้อ | เรื่อง | สาระที่ใช้ในเครื่องจำลอง | ผลต่อโมเดล |
|---|---|---|---|
| 4 | การใช้ RWY 03R/21L | ปกติเป็นทางวิ่งของทหาร เปิดให้พลเรือนใช้ได้ H24 ภายใต้หอบังคับการบิน มีกฎ circuit และความสูงเข้าร่วม circuit; ห้าม straight-in โดยไม่ได้รับอนุมัติ (ตามที่เครื่องมือสรุป) | ยืนยันโหมด "ทางวิ่งตะวันออกเป็นทางวิ่งเสริม" ใน 7.6 |
| 5 | ขั้นตอนติดเครื่อง | IFR ขอ clearance กับ Delivery ขอ push-back และติดเครื่องกับ Ground; push-back ภายใน 5 นาทีหลังได้รับอนุญาต | ลำดับสถานะของเครื่องขาออก: DEL → GND (push) → TWR |
| 6 | คำเตือนการขับ | ระวังบนลานจอด ใช้แรงขับน้อยใกล้ประตูขึ้นเครื่องและใกล้ TWY B (North); หลังออกจาก RWY 21L ทาง TWY S ให้หยุดรอก่อน RWY 21R | ยืนยันเส้นทาง ARR21L_S (จุดรอฝั่งซ้ายของ 21R ที่ S อยู่ 130 m จากแนวกลาง [G1]) |
| 7 | การปิดทางวิ่ง | สภาพอากาศอย่างเดียวไม่ใช่เหตุปิดทางวิ่ง; เครื่องที่ข้าม 21R อาจรบกวน glide path ของ ILS | ใช้เป็นข้อความเตือนในโหมดฝึก |
| 8 | LVP | ใช้เมื่อ RVR < 550 m (1,804 ft) หรือฐานเมฆ < 200 ft; 21R ได้รับอนุมัติ CAT II; ห้ามใช้ 21L ใน LVP | ปิดทางวิ่งเสริมเมื่อทัศนวิสัยต่ำ |
| 9 | ขั้นตอนเพิ่มขีดความสามารถทางวิ่ง | ลดเวลาครองทางวิ่ง: พร้อมเข้าทางวิ่งทันที ทำ checklist ก่อนเข้า ใช้ทางออกด่วน | เครื่องลงต้องเลือกทางออกแรกที่ใช้ได้ (สมการ 7.7) |
| 10 | การเคลื่อนเครื่องบนลานจอด | push-back ด้วย towbar เท่านั้น ห้าม power-back และ self-manoeuvring มีตารางจุดปลด tow ตามหลุมจอดของ North Remote, Terminal และ South Remote (หมายเลขหลุมที่เครื่องมืออ่านได้: 1–12, 14–15, 21–36, 61–68, 73–130) | ทุกขาออกจากหลุมจอดมีช่วง push-back ด้วยรถลาก |
| 11 | การจัดหลุมจอด | Ground/Apron controller จัดหลุมจอดตามแบบเครื่องและสถานการณ์ | ตัวสร้างจราจรเลือกหลุมจอดตามขนาดเครื่อง |
| 12 | การขับ | ขาเข้าขับตามเส้นกึ่งกลางลานจอด ขาออกถูก push ลงบนเส้นกึ่งกลาง; การขับด้วยเครื่องยนต์ดับหนึ่งเครื่องของเครื่อง code E ต้องได้รับอนุมัติ | – |
| 13 | Mode S บนพื้น | เปิด transponder ตั้งแต่ push-back จนถึงจอดเสร็จ; TCAS เปิดเมื่อเข้าทางวิ่ง | – |
| 14 | บริการหอบังคับการบิน | TWR-S ให้บริการควบคุมสนามบิน TWR-N เป็นหอสำรอง | ใน repo หอ TWR-S เป็นหอที่ใช้งาน (ไฟห้องควบคุมเปิด) |
| 15 | Hot spot | HS1 (B/C → D รอก่อน 21R), HS2 (C → E รอก่อน 21R), HS3 ถูกตัด; รายการเต็ม HS1–HS6 อยู่ใน 7.6 จากแผนภูมิ [G3] | – |

### สมการ

ทุกสมการข้างล่างใช้ได้ในโมดูล pure (ไม่มี DOM) และตัวเลขตัวอย่างตรงกับผลของสคริปต์ต้นแบบ `docs/research/05-airport-city/ops.test.mjs`

**(7.1) ค่าเฉลี่ยต่อวัน**  D = M_year / N_days  ตัวอย่าง FY2025: 213,694 / 365 = 585.5 movements/วัน [G6]

**(7.2) จำนวนต่อชั่วโมง**  m_h = D · k_season · k_day · w_h, ขาออก dep_h = m_h · d_h, ขาเข้า arr_h = m_h · (1 − d_h), โดย Σ w_h = 1 และ Σ w_h·d_h ≈ 0.5 (w_h, d_h จากตาราง 7.3 เป็นค่าประมาณ)

**(7.3) ตรวจขีดความสามารถ**  max_h (D · k_peak · w_h) ≤ C_decl  ตัวอย่าง 585.5 × 1.12 × 0.0566 = 37.1 ≤ 40 movements/ชม. [G14][G20][G21]

**(7.4) ตารางบินแบบจำนวนเต็ม** แบบกำหนดแน่นอน: แบ่ง round(D·k) ลง 24 ชั่วโมงด้วยวิธีเศษเหลือมากสุด (largest remainder) ได้ n_h = ⌊D'·w_h⌋ แล้วเพิ่ม 1 ให้ชั่วโมงที่เศษมากสุดจนผลรวมครบ แบบสุ่ม: n_h ~ Poisson(D·w_h) แล้วจำกัด n_h ≤ C และยกส่วนเกินไปชั่วโมงถัดไป (c_{h+1} += n_h − C) ตามหลักการจัดสรร slot

**(7.5) การส่งเครื่องลงไปทางวิ่งเสริม**  a_sec,h = min( max(0, a_h − 14), ⌊0.5 · a_h⌋ ) โดย a_h คือจำนวนขาเข้าในชั่วโมงนั้น (ค่าประมาณ อิงคำบรรยาย [G29]) และ a_sec,h = 0 เมื่อเปิด LVP [G32]

**(7.6) สัดส่วนแบบเครื่อง**  p(type) = Σ_g p_g · p(type | g) โดย g คือกลุ่มสายการบินในตาราง 7.5

**(7.7) Load factor โดยนัย (ตรวจความสมเหตุสมผล)**  LF = (PAX / M) / Σ_type p(type)·seats(type) = 146.6 / 191.4 = 0.766 [G6][G26][G27][G28] เทียบกับ load factor จริงของ Thai AirAsia ไตรมาส 1/2026 = 0.88 [G34] (ค่ารวมทั้งสนามบินต่ำกว่าได้ เพราะรวมสายการบินอื่น เที่ยวบินขนส่งสินค้า และเที่ยวบินที่ไม่มีผู้โดยสาร)

**(7.8) ระยะที่ต้องใช้ก่อนเลี้ยวออก (เลือกทางออก)**

s_req = s_td + (V_td² − V_ex²) / (2 · a), a_wet = 0.7 · a_dry

เลือกทางออกแรก (เรียงตาม s จากน้อยไปมาก) ที่ s_exit ≥ s_req ของชนิดทางออกนั้น และไม่ขัดข้อจำกัดขนาด (TWY J รับได้ไม่เกิน B737 [G4]) ถ้าไม่มีให้ใช้ทางออกสุดท้าย ค่าพารามิเตอร์ (ทั้งหมดเป็น **ค่าประมาณ** ความเชื่อมั่นต่ำ ยกเว้นช่วงความเร็วตามประเภทการเข้าสู่สนามบิน [G36]):

| พารามิเตอร์ | A320, A20N | A21N | B738, B38M | B739 | AT76 | A333 | ที่มา |
|---|---|---|---|---|---|---|---|
| s_td ระยะแตะพื้นจาก threshold | 450 m (1,476 ft) | 450 m | 450 m | 450 m | 350 m (1,148 ft) | 500 m (1,640 ft) | ค่าประมาณ (aim point ≈ 300–400 m บวกระยะลอยตัว) |
| V_td ความเร็วแตะพื้น | 130 kt (66.9 m/s) | 135 kt (69.4 m/s) | 140 kt (72.0 m/s) | 145 kt (74.6 m/s) | 105 kt (54.0 m/s) | 140 kt (72.0 m/s) | ค่าประมาณภายในช่วงประเภท B (91–120 kt) และ C (121–140 kt) ของ [G36] |
| a ความหน่วงเฉลี่ยบนทางวิ่งแห้ง | 1.7 m/s² | 1.7 | 1.7 | 1.7 | 1.5 | 1.5 | ค่าประมาณ (autobrake ระดับต่ำถึงกลาง) |
| V_ex ความเร็วขณะเลี้ยวออก | RET 50 kt (25.7 m/s), ทางออกเฉียง 30 kt (15.4 m/s), ตั้งฉาก 15 kt (7.7 m/s), ปลายทางวิ่ง 10 kt (5.1 m/s) | | | | | | ค่าประมาณ |

ตัวอย่าง A320 ลง 21R ทางแห้ง: s_req(RET) = 450 + (66.9² − 25.7²) / (2 × 1.7) = 450 + 1,121 = 1,571 m (5,154 ft) ทางออก RET แรกที่ไกลกว่าคือ O ที่ 1,719 m (5,640 ft) → ออกที่ O ผลการเลือกทั้งหมดอยู่ในฟิลด์ `typical_exit` ของ JSON

**(7.9) ระยะตามทิศลง**  s_21R = L_thr − s_03L และ s_21L = L'_thr − s_03R โดย L_thr = 3,701.5 m (12,144 ft) คือระยะระหว่าง threshold 03L กับ 21R และ L'_thr = 3,150.5 m (10,336 ft) คือระยะระหว่าง threshold 03R กับ threshold 21L ที่เลื่อน 350 m (คำนวณจากพิกัด AIP ด้วย `ll_to_en`) [G1]

**(7.10) เลือกทิศใช้งาน**  H = V_w · cos(θ_w − ψ_03), ψ_03 = 28.7° true (จาก threshold AIP) ถ้า H > 3 kt (1.5 m/s) ใช้ทิศ 03, ถ้า H < −3 kt ใช้ทิศ 21, ถ้าอยู่ระหว่างนั้นใช้ค่าตามฤดู (ต.ค.–ก.พ. = 03 ตามข้อมูลของเจ้าของโครงการ, มี.ค.–ก.ย. = 21) ค่าเกณฑ์ 3 kt เป็นค่าเดิมของ `inUse()` ใน repo ส่วนกฎตามฤดูเมื่อลมสงบเป็นค่าประมาณ

**(7.11) เวลาจอดเฉลี่ยจากสถิติการใช้งานเครื่อง**  N_sec = S / (F · 365), t_b = d / V_b, n = U / t_b, g = (T_w − U) / (n − 1) ตัวอย่าง: S = 114,571, F = 56 → N_sec = 5.61; d = 1,094 km, V_b = 580 km/h (ค่าประมาณ) → t_b = 1.89 ชม.; U = 12.7 ชม. → n = 6.73; T_w = 18.5 ชม. (ค่าประมาณ) → g = 5.8 / 5.73 = 1.01 ชม. ≈ 61 นาที [G33]

**(7.12) จำนวนเครื่องจอดตามเวลา**  N_parked(t) = N_base + Σ_{τ = 05:00}^{t} (arr_τ − dep_τ) − min_t(·) ตัวอย่าง N_base = 25 → ≈ 25 ลำช่วง 07:00–19:00 น. และ ≈ 49 ลำช่วง 01:00–03:00 น. (ค่าประมาณ)

**(7.13) ค่าเฉลี่ยของการแจกแจงสามเหลี่ยม**  E[t] = (min + mode + max) / 3 เช่น A320: (30 + 40 + 75) / 3 = 48.3 นาที

**(7.14) การฉายพิกัด** ใช้ `ll_to_en(lat, lon)` ของ repo (`llToNE` ใน `src/15-geo.js` คืนค่า [n, e]) ตามที่ให้ไว้ในข้อกำหนดของงาน ค่า e, n ทุกค่าในหัวข้อนี้คำนวณด้วยฟังก์ชันนี้และตรงกับ lat/lon ภายใน 0.05 m

### พารามิเตอร์ (JSON)

ค่า `src` อ้างรหัสแหล่งในหัวข้อแหล่งอ้างอิง ค่า `"owner"` หมายถึงข้อมูลที่เจ้าของโครงการให้ไว้แล้ว (ทิศ 03 ใช้ ต.ค.–ก.พ.) `conf` คือความเชื่อมั่น (high/med/low) และ `est: true` คือค่าประมาณ ชั่วโมงใน `hourly_weights` เป็นเวลาท้องถิ่น (UTC+7) เริ่มที่ 00:00 น. ส่วน `declared_capacity_per_hour_utc` เป็นเวลา UTC ตามเอกสารต้นฉบับ ใน `taxi_routes` รายการ `"HOLD:21R"` หมายถึงจุดรอก่อนข้ามทางวิ่งนั้น ไฟล์เดียวกันอยู่ที่ `docs/research/05-airport-city/vtbd_ops.json`

```json
{
 "traffic": {
  "basis": "AOT FY2025 (Oct 2024-Sep 2025)",
  "src": ["G6", "G7"],
  "annual_movements": 213694,
  "annual_movements_intl": 88737,
  "annual_movements_dom": 124957,
  "annual_passengers": 31337658,
  "lcc_movements": 199511,
  "cy2025_movements": 214723,
  "cy2024_movements": 205681,
  "daily_mean": 585.5,
  "intl_share": 0.4153,
  "lcc_share": 0.9336,
  "pax_per_movement": 146.6,
  "peak_day_factor": {
   "value": 1.12,
   "src": ["G20", "G21", "G6"],
   "conf": "med",
   "est": true
  },
  "scenario_2026_factor": {
   "value": 0.83,
   "note": "Sep 2026 movements -16.9 % YoY",
   "src": ["G22"],
   "conf": "low",
   "est": true
  },
  "declared_capacity_per_hour_utc": [
   { "from": "00:00", "to": "03:59", "value": 45 },
   { "from": "04:00", "to": "09:59", "value": 50 },
   { "from": "10:00", "to": "23:59", "value": 53 }
  ],
  "declared_capacity_src": ["G37"],
  "declared_capacity_season": "W24 (27 Oct 2024 - 29 Mar 2025)",
  "declared_capacity_conf": "med-high",
  "declared_capacity_w22": [
   { "from": "00:00", "to": "03:59", "value": 40 },
   { "from": "04:00", "to": "09:59", "value": 45 }
  ],
  "declared_capacity_w22_src": ["G14"],
  "check_capacity_per_hour": 40,
  "check_capacity_note": "conservative: W22 lower band; lowest W24 band is 45",
  "physical_capacity_per_hour": {
   "value": 55,
   "src": ["G18"],
   "conf": "med"
  },
  "hours_local": "UTC+7",
  "hourly_weights": [0.0249, 0.0153, 0.0096, 0.0077, 0.0096, 0.0249, 0.0517, 0.0566, 0.0536, 0.0536, 0.0556, 0.0517, 0.0479, 0.0479, 0.0498, 0.0527, 0.0546, 0.0556, 0.0536, 0.0517, 0.0498, 0.0469, 0.0421, 0.0326],
  "hourly_weights_conf": "low",
  "hourly_weights_est": true,
  "hourly_weights_src": ["G20", "G21", "G14"],
  "hourly_departure_share": [0.45, 0.45, 0.5, 0.5, 0.6, 0.75, 0.7, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.45, 0.4, 0.35, 0.35],
  "fleet_mix": { "A320": 0.4003, "B738": 0.3038, "A20N": 0.1004, "B739": 0.0772, "A21N": 0.0633, "A333": 0.027, "BIZJ": 0.014, "AT76": 0.0105, "B38M": 0.0035 },
  "fleet_mix_conf": "low",
  "fleet_mix_est": true,
  "fleet_mix_src": ["G26", "G27", "G28", "G25", "G6", "G7"],
  "seats": { "A320": 180, "A20N": 186, "A21N": 236, "B738": 189, "B739": 215, "B38M": 189, "A333": 377, "AT76": 70, "BIZJ": 12 },
  "seats_src": { "A320": "G26", "A20N": "G26", "A21N": "G26", "B738": "G27", "B739": "G27", "B38M": "est", "A333": "est", "AT76": "est", "BIZJ": "est" },
  "state_share": { "value": 0.02, "runway": "03R/21L", "conf": "low", "est": true },
  "airlines": [
   {
    "iata": "FD",
    "icao": "AIQ",
    "name": "Thai AirAsia",
    "status": "main base, HQ",
    "share": 0.48,
    "types": { "A320": 0.71, "A20N": 0.18, "A21N": 0.11 },
    "src": ["G26", "G25", "G33", "G34"]
   },
   {
    "iata": "SL",
    "icao": "TLM",
    "name": "Thai Lion Air",
    "status": "main base",
    "share": 0.27,
    "types": { "B738": 0.714, "B739": 0.286 },
    "src": ["G27", "G25"]
   },
   {
    "iata": "DD",
    "icao": "NOK",
    "name": "Nok Air",
    "status": "main base",
    "share": 0.09,
    "types": { "B738": 1.0 },
    "src": ["G28", "G25"]
   },
   {
    "iata": "XJ",
    "icao": "TAX",
    "name": "Thai AirAsia X",
    "status": "base (long-haul)",
    "share": 0.02,
    "types": { "A333": 1.0 },
    "src": ["G25"]
   },
   {
    "iata": "*",
    "name": "foreign LCC (AK, QZ, Z2, OD, ID, 5J, QG, FZ, 9C, 8M)",
    "status": "foreign",
    "share": 0.07,
    "types": { "A320": 0.55, "A20N": 0.15, "A21N": 0.1, "B738": 0.15, "B38M": 0.05 },
    "src": ["G25"]
   },
   {
    "iata": "*",
    "name": "other (full service, charter, business, state)",
    "status": "other",
    "share": 0.07,
    "types": { "A320": 0.3, "A20N": 0.05, "A21N": 0.05, "B738": 0.15, "AT76": 0.15, "A333": 0.1, "BIZJ": 0.2 },
    "src": ["G6", "G7"]
   }
  ],
  "airlines_conf": "low",
  "airlines_est": true,
  "turnaround_min": {
   "A320": [30, 40, 75],
   "A20N": [30, 40, 75],
   "A21N": [35, 45, 80],
   "B738": [35, 45, 80],
   "B739": [35, 45, 80],
   "B38M": [35, 45, 80],
   "AT76": [20, 25, 45],
   "A333": [75, 90, 150],
   "BIZJ": [30, 90, 480]
  },
  "turnaround_form": "triangular [min, mode, max] minutes on-block to off-block",
  "turnaround_conf": "low",
  "turnaround_est": true,
  "turnaround_src": ["G33", "G34"],
  "pushback_min": [3, 4, 5],
  "pushback_src": ["G32"],
  "night_stop_aircraft": {
   "value": 50,
   "range": [40, 55],
   "base_parked": 25,
   "conf": "low",
   "est": true
  }
 },
 "runway_config": {
  "select": {
   "headwind_threshold_kt": 3,
   "default_by_month": {
    "03": [10, 11, 12, 1, 2],
    "21": [3, 4, 5, 6, 7, 8, 9]
   },
   "src": ["owner", "repo inUse()"],
   "conf": "med",
   "est": true
  },
  "night_closures_w24": {
   "window_utc": "17:00-22:00",
   "window_local": "00:00-05:00",
   "rubber_removal": { "03L/21R": "Mon-Thu", "03R/21L": "Fri-Sat" },
   "friction_test": { "03L/21R": "Thu", "03R/21L": "Sat" },
   "days_basis": "weekday as printed in the W24 notice (UTC); check against the current season notice",
   "src": ["G37"],
   "conf": "med"
  },
  "lvp": {
   "rvr_below_m": 550,
   "ceiling_below_ft": 200,
   "rules": "21R CAT II only; 21L not permitted; no secondary arrivals",
   "src": ["G32"],
   "conf": "med"
  },
  "twy_y_rule": "TWY Y closed while 03R/21L active (and vice versa)",
  "twy_y_src": ["G1", "G3", "G4"],
  "taxilane_t_rule": "T between V and S: code A-D only",
  "taxilane_t_src": ["G1", "G4"],
  "overflow": {
   "primary_only_up_to_arrivals_per_hour": 14,
   "max_secondary_fraction": 0.5,
   "conf": "low",
   "est": true,
   "src": ["G29"]
  },
  "exit_model": {
   "s_td_m": { "A320": 450, "A20N": 450, "A21N": 450, "B738": 450, "B739": 450, "B38M": 450, "AT76": 350, "A333": 500 },
   "v_td_kt": { "A320": 130, "A20N": 130, "A21N": 135, "B738": 140, "B739": 145, "B38M": 140, "AT76": 105, "A333": 140 },
   "decel_ms2": { "A320": 1.7, "A20N": 1.7, "A21N": 1.7, "B738": 1.7, "B739": 1.7, "B38M": 1.7, "AT76": 1.5, "A333": 1.5 },
   "wet_factor": 0.7,
   "v_exit_kt": { "RET": 50, "ANG": 30, "R90": 15, "END": 10 },
   "src": ["G36"],
   "conf": "low",
   "est": true
  },
  "dir21": {
   "departure": {
    "runway": "21R",
    "entries": [
     {
      "id": "D",
      "s_m": 63,
      "type": "full length",
      "src": ["G3", "G30"]
     },
     {
      "id": "E",
      "s_m": 484,
      "type": "intersection",
      "src": ["G3", "G30"]
     }
    ]
   },
   "arrival_primary": "21R",
   "arrival_secondary": "21L",
   "exits": {
    "21R": [
     {
      "id": "F",
      "s_m": 1101,
      "kind": "ANG",
      "lat": 13.917624,
      "lon": 100.607499,
      "en": [195.3, 359.8],
      "src": ["G30"],
      "conf": "med",
      "est": true
     },
     {
      "id": "J",
      "s_m": 1510,
      "kind": "R90",
      "lat": 13.914381,
      "lon": 100.60568,
      "en": [-1.3, 1.0],
      "src": ["G30", "G4"],
      "conf": "med",
      "est": true,
      "limit": "max B737 (G4)"
     },
     {
      "id": "O",
      "s_m": 1719,
      "kind": "RET",
      "lat": 13.912729,
      "lon": 100.604754,
      "en": [-101.3, -181.8],
      "src": ["G30", "G3"],
      "conf": "med",
      "est": true
     },
     {
      "id": "R",
      "s_m": 2378,
      "kind": "RET",
      "lat": 13.9075,
      "lon": 100.601821,
      "en": [-418.3, -760.3],
      "src": ["G30", "G3"],
      "conf": "med",
      "est": true
     },
     {
      "id": "S",
      "s_m": 2966,
      "kind": "R90",
      "lat": 13.902842,
      "lon": 100.599209,
      "en": [-700.6, -1275.7],
      "src": ["G30", "G1"],
      "conf": "med",
      "est": true
     },
     {
      "id": "C South",
      "s_m": 3562,
      "kind": "END",
      "lat": 13.898118,
      "lon": 100.59656,
      "en": [-986.9, -1798.3],
      "src": ["G30"],
      "conf": "med",
      "est": true
     }
    ],
    "21L": [
     {
      "id": "S",
      "s_m": 2955,
      "kind": "R90",
      "lat": 13.901119,
      "lon": 100.602398,
      "en": [-356.0, -1466.3],
      "src": ["G30", "G3", "G32"],
      "conf": "med",
      "est": true,
      "limit": "hold short 21R (130 m) then cross"
     }
    ]
   },
   "typical_exit": {
    "21R": {
     "A320": { "dry": "O", "wet": "R" },
     "A20N": { "dry": "O", "wet": "R" },
     "B738": { "dry": "R", "wet": "R" },
     "AT76": { "dry": "J", "wet": "O" },
     "A333": { "dry": "R", "wet": "S" }
    },
    "21L": { "all": "S" }
   },
   "conf": "med"
  },
  "dir03": {
   "departure": {
    "runway": "03L",
    "entries": [
     {
      "id": "C South",
      "s_m": 140,
      "type": "full length",
      "src": ["G30"]
     },
     {
      "id": "S",
      "s_m": 736,
      "type": "intersection",
      "src": ["G1", "G30"]
     }
    ]
   },
   "arrival_primary": "03L",
   "arrival_secondary": "03R",
   "exits": {
    "03L": [
     {
      "id": "S",
      "s_m": 736,
      "kind": "R90",
      "lat": 13.902842,
      "lon": 100.599209,
      "en": [-700.6, -1275.7],
      "src": ["G30", "G1"],
      "conf": "med",
      "est": true
     },
     {
      "id": "J",
      "s_m": 2191,
      "kind": "R90",
      "lat": 13.914381,
      "lon": 100.60568,
      "en": [-1.3, 1.0],
      "src": ["G30", "G4"],
      "conf": "med",
      "est": true,
      "limit": "max B737 (G4)"
     },
     {
      "id": "F",
      "s_m": 2310,
      "kind": "RET",
      "lat": 13.91532,
      "lon": 100.606207,
      "en": [55.7, 104.9],
      "src": ["G30"],
      "conf": "med",
      "est": true
     },
     {
      "id": "E",
      "s_m": 3146,
      "kind": "RET",
      "lat": 13.921948,
      "lon": 100.609924,
      "en": [457.4, 838.2],
      "src": ["G30"],
      "conf": "med",
      "est": true
     },
     {
      "id": "E",
      "s_m": 3217,
      "kind": "R90",
      "lat": 13.922515,
      "lon": 100.610242,
      "en": [491.8, 900.9],
      "src": ["G30"],
      "conf": "med",
      "est": true
     },
     {
      "id": "D",
      "s_m": 3639,
      "kind": "END",
      "lat": 13.925857,
      "lon": 100.612116,
      "en": [694.3, 1270.7],
      "src": ["G30"],
      "conf": "med",
      "est": true
     }
    ],
    "03R": [
     {
      "id": "D",
      "s_m": 3098,
      "kind": "R90",
      "lat": 13.924119,
      "lon": 100.615313,
      "en": [1039.8, 1078.4],
      "src": ["G30", "G1"],
      "conf": "med",
      "est": true,
      "limit": "hold short 03L (210 m) then cross"
     }
    ]
   },
   "typical_exit": {
    "03L": {
     "A320": { "dry": "J", "wet": "F" },
     "A20N": { "dry": "J", "wet": "F" },
     "B738": { "dry": "J", "wet": "E" },
     "AT76": { "dry": "J", "wet": "J" },
     "A333": { "dry": "F", "wet": "E" }
    },
    "03R": { "all": "D" }
   },
   "conf": "low-med"
  }
 },
 "taxi_routes": {
  "src": ["G1", "G3", "G4", "G5", "G30", "G32"],
  "conf": "med",
  "est": true,
  "stand": "terminal apron via Taxilane B",
  "DEP21R_D": ["B", "C", "D"],
  "DEP21R_D_N": ["A", "B", "D"],
  "DEP21R_E": ["B", "C", "E"],
  "ARR21R_O": ["O", "C", "B"],
  "ARR21R_R": ["R", "C", "B"],
  "ARR21R_J": ["J", "C", "B"],
  "ARR21L_S": ["S", "HOLD:21R", "S", "C", "B"],
  "DEP03L_CS": ["B", "C", "C South"],
  "DEP03L_S": ["B", "C", "S"],
  "ARR03L_J": ["J", "C", "B"],
  "ARR03L_F": ["F", "C", "B"],
  "ARR03L_E": ["E", "C", "B"],
  "ARR03R_D": ["D", "HOLD:03L", "D", "C", "B"],
  "length_m": {
   "DEP21R_D": [1130, 2040],
   "DEP21R_D_N": [1130, 1220],
   "DEP21R_E": [740, 1640],
   "ARR21R_O": [1040, 1800],
   "ARR21R_R": [1650, 2490],
   "ARR21R_J": [590, 1170],
   "ARR21L_S": [2200, 3040],
   "DEP03L_CS": [2670, 3510],
   "DEP03L_S": [1810, 2650],
   "ARR03L_J": [590, 1170],
   "ARR03L_F": [660, 1290],
   "ARR03L_E": [780, 1680],
   "ARR03R_D": [1530, 2430]
  }
 }
}
```

### กรณีทดสอบ

ต้นแบบที่รันผ่านแล้วทุกข้อ (T-G01 ถึง T-G18) อยู่ที่ `docs/research/05-airport-city/ops.test.mjs` ใช้ Node ≥ 18 ไม่มี dependency (`node ops.test.mjs params.json`) เมื่อย้ายเข้า repo ให้เปลี่ยน T-G14 และ T-G18 ให้เรียก `RWY_END['03L'].hdg` และ `llToNE` ผ่าน `test/harness.mjs` แทนสูตรที่เขียนซ้ำ

| ID | สิ่งที่ทดสอบ | ข้อมูลเข้า | ผลที่คาดหวัง | เกณฑ์ผ่าน | แหล่ง |
|---|---|---|---|---|---|
| T-G01 | น้ำหนักรายชั่วโมงรวมเป็น 1 | `traffic.hourly_weights` (24 ค่า) | Σ = 1.0000 | \|Σ − 1\| < 1e-4 และยาว 24 | 7.3 (ค่าประมาณ) |
| T-G02 | ขาออกสมดุลกับขาเข้า | w_h, d_h | Σ w_h·d_h = 0.5028 | \|Σ − 0.5\| ≤ 0.01 | 7.3 |
| T-G03 | ชั่วโมงสูงสุดของวันพีคไม่เกินขีดความสามารถที่ประกาศ | D = 585.5, k_peak = 1.12, max w = 0.0566 | 37.1 movements/ชม. | ≤ 40 | [G6][G14][G20][G21] |
| T-G04 | สัดส่วนแบบเครื่องและสายการบินรวมเป็น 1 และสอดคล้องกัน | `fleet_mix`, `airlines[].share`, `airlines[].types` | Σ fleet = 1.0000, Σ airline = 1.0000, Σ types ต่อสาย = 1, Σ_g p_g·p(type\|g) ต่างจาก `fleet_mix` ≤ 2e-5 | ต่างกัน < 1e-3 | 7.5 |
| T-G05 | วันที่สร้างแบบกำหนดแน่นอนได้จำนวนตามสถิติ | round(213,694 / 365) แบ่งด้วย largest remainder | 585 เที่ยว ชั่วโมงสูงสุด 33 | \|n − 585.5\| / 585.5 ≤ 10 % และทุกชั่วโมง ≤ 40 | [G6] |
| T-G06 | วันที่สร้างแบบสุ่ม 1,000 วัน | mulberry32(seed 12345), Poisson ต่อชั่วโมง, จำกัด 40/ชม. แล้วยกส่วนเกิน | 98.2 % ของวันอยู่ในช่วง ±10 % ของ 585.5; ชั่วโมงสูงสุด 40 | ≥ 95 % และ max ≤ 40 | [G6][G14] |
| T-G07 | สถิติรวมตรงกัน | 88,737 + 124,957 | 213,694 | เท่ากันพอดี | [G6] |
| T-G08 | สัดส่วน LCC | 199,511 / 213,694 | 0.9336 | \|x − 0.9336\| < 5e-4 | [G6][G7] |
| T-G09 | สัดส่วน code C และ load factor โดยนัย | `fleet_mix`, `seats`, PAX/M = 146.6 | code C = 0.9485; ที่นั่งเฉลี่ย 191.4; LF = 0.766 | code C ≥ 0.90; 0.70 ≤ LF ≤ 0.90 | [G6][G10][G26][G27][G28] |
| T-G10 | ทางออกเรียงตามระยะและอยู่บนทางวิ่ง | `exits` ทั้ง 4 ทิศ | s เพิ่มขึ้นตามลำดับ; 0 < s ≤ 3,701.5 m (21L ≤ 3,150.5 m) | ทุกรายการผ่าน | [G30][G1] |
| T-G11 | การเลือกทางออกตามสมการ 7.8 | 21R/03L/21L/03R × A320/B738/AT76/A333/A21N × แห้ง/เปียก | 21R: A320 แห้ง O, เปียก R; B738 แห้ง R; AT76 แห้ง J; A333 แห้ง R. 03L: A320 แห้ง J, เปียก F; B738 เปียก E; A333 แห้ง F; A21N แห้ง F. 21L ทุกแบบ S; 03R ทุกแบบ D | ตรงทุกกรณี | 7.7 (ค่าประมาณ) |
| T-G12 | ข้อจำกัด TWY J | A333, A21N บน 21R และ 03L ทั้งแห้งและเปียก | ไม่เลือก J | ไม่มีกรณีใดได้ J | [G4] |
| T-G13 | กฎส่งเครื่องลงทางวิ่งเสริม (7.5) | a_h = 10, 14, 20, 30 | 0, 0, 6, 15 | ตรงทุกค่า | 7.6 (ค่าประมาณ) |
| T-G14 | การเลือกทิศ (7.10) | ลมจาก 040° 10 kt ก.ค.; 200° 10 kt ธ.ค.; สงบ พ.ย.; สงบ ก.ค.; 120° 10 kt ม.ค. | 03; 21; 03; 21; 03 | ตรงทุกกรณี | owner, repo `inUse()` |
| T-G15 | ชื่อทางขับในเส้นทางถูกต้อง และเส้นทางพลเรือนไม่ใช้ Y หรือ T | `taxi_routes.DEP*`, `ARR*` | ทุกชื่ออยู่ในชุด {A, B, B North, C, C South, D, E, F, G, H, I, J, M, N, O, P, R, S, T, U, V, W, X, Y}; ไม่มี Y และ T | ผ่านทุกเส้นทาง | [G1][G3][G4][G30] |
| T-G16 | เครื่องที่ลงทางวิ่งเสริมต้องหยุดรอก่อนข้าม | `ARR21L_S`, `ARR03R_D` | มี `HOLD:21R` และ `HOLD:03L` | มีครบ | [G3][G32] |
| T-G17 | turnaround สมเหตุสมผล | `turnaround_min` | min ≤ mode ≤ max ทุกแบบ; ค่าเฉลี่ย A320 = 48.3 นาที | 37 ≤ E[A320] ≤ 61 นาที | [G33] (ค่าประมาณ) |
| T-G18 | พิกัดทางออก lat/lon ตรงกับ e, n | ทุกรายการใน `exits`, `ll_to_en` | เช่น O: (13.912729, 100.604754) → e −101.3, n −181.8 | ต่างกัน ≤ 0.15 m (ต้นแบบได้ 0.049 m) | 7.7, (7.14) |
| T-G19 | ทางออกอยู่บนเส้นกึ่งกลางทางวิ่งของ repo | e, n ของทุกทางออก เทียบเส้นตรงระหว่าง `RWY_END` threshold คู่เดียวกัน | ระยะตั้งฉาก 0.0 m (เป็นจุดตัด) | ≤ 5 m | [G1][G30] |
| T-G20 | ชื่อทางขับที่จับคู่กับเส้น `tw` ของ repo | `tw_names.json` (137 ค่า) กับ `data/vtbd_af.json` | 126 เส้นมีชื่อ, 11 เส้นไม่มี; B 30 เส้น, C 20, D 13 | ความยาว 137 และมีชื่อ ≥ 120 เส้น | [G30][G31] |
| T-G21 | จำนวนเครื่องจอดตามเวลา (7.12) | N_base = 25, w_h, d_h, D = 585.5 | ≈ 25 ลำช่วง 07–19 น.; ≈ 49 ลำที่ 02:00 น. | ช่วงกลางวัน 25 ± 1, กลางคืน 49 ± 3 | 7.9 (ค่าประมาณ) |
| T-G22 | ไม่มีเครื่องลงทางวิ่งเสริมใน LVP | RVR 400 m, ขาเข้า 30 ลำ/ชม. | a_sec = 0; ทุกขาเข้าลง 21R | a_sec = 0 | [G32] |
| T-G23 | ปิดทางวิ่งกลางคืน (W24) | `night_closures_w24`, วันจันทร์ 19:00 UTC (02:00 น. เช้าวันอังคาร), เที่ยวบิน 5 เที่ยว | ทุกเที่ยวบินใช้ 21L หรือ 03R; วันศุกร์ 19:00 UTC ทุกเที่ยวบินใช้ 21R หรือ 03L | ตรงทุกเที่ยวบิน | [G37] |

### เทียบกับ repo

| เรื่อง | repo ตอนนี้ | สิ่งที่พบ | สิ่งที่ควรเปลี่ยน |
|---|---|---|---|
| จราจรจำลอง | ไม่มีเครื่องบินอื่นเคลื่อนที่; มีแต่เครื่องจอดนิ่ง | เฉลี่ย 585.5 movements/วัน (FY2025) สูงสุดราว 33 ต่อชั่วโมงในวันปกติ และ 37 ในวันพีค [G6][G14] | เพิ่มโมดูล pure สร้างตารางบินรายวันจาก `traffic` (สมการ 7.1–7.6) |
| เครื่องบินจอด | `src/55-city.js` `buildParkedAirliners` สุ่มวางสูงสุด ≈ 96 ลำ และสุ่ม wide-body ด้วยความน่าจะเป็น 0.18 | wide-body (A333) ≈ 0.027 ของ movements; ที่เหลือเป็น code C เกือบทั้งหมด [G26][G27][G28] (ค่าประมาณ); เครื่องค้างคืน ≈ 40–55 ลำ (ค่าประมาณ) | ลดค่าความน่าจะเป็น wide-body จาก 0.18 เป็น ≈ 0.03 และให้จำนวนเครื่องจอดเปลี่ยนตามเวลาด้วยสมการ 7.12 (กลางวัน ≈ 25 ลำ กลางคืน ≈ 49 ลำ) |
| เลือกทางวิ่ง | `src/90-app.js` `inUse()` เลือก 03L เมื่อ headwind บน 03L > 3 kt นอกนั้น 21R | ทิศ 03 ใช้ ต.ค.–ก.พ. (owner); ใน LVP ใช้ได้เฉพาะ 21R CAT II และห้ามใช้ 21L [G32] | คงเกณฑ์ 3 kt แต่เมื่อลมสงบให้ใช้ค่าตามเดือน (7.10); เพิ่มสถานะ LVP |
| การใช้ทางวิ่งสองเส้น | โหมดฝึกให้ผู้ใช้เลือกทางวิ่งเอง ไม่มีกฎการใช้งาน | 03L/21R ใช้ทั้งขึ้นและลงของพลเรือน; 03R/21L รับเครื่องลงเสริมช่วงพีค และเป็นทางวิ่งหลักของฝั่งทหาร [G29][G32] | ใช้ `runway_config` สำหรับเครื่อง AI; ให้ผู้ใช้ฝึกลง 21L/03R ได้ต่อไปแต่แสดงข้อความว่าเป็นทางวิ่งเสริม |
| ทางออกและชื่อทางขับ | `data/vtbd_af.json` มีเส้น `tw` 137 เส้นแต่ไม่มีชื่อ ไม่มีป้ายทางขับ | ชื่อทางขับจาก OSM จับคู่ได้ 126/137 เส้น (`tw_names.json`) และตำแหน่งทางออก 25 จุดในตาราง 7.7 [G30] | เพิ่มฟิลด์ `ref` ใน `tw` (ข้อมูลอนุพันธ์ ODbL) และ `exits` ใน `RWY_END` |
| เส้นทางขับ | ไม่มี | 13 เส้นทางในตาราง 7.8; กฎ TWY Y และ Taxilane T [G1][G3][G4] | เพิ่ม `taxi_routes` และกราฟทางขับจากเส้น `tw` ที่มีชื่อ |
| หอบังคับการบิน | มี TWR-S และ TWR-N (ความสูงเป็นค่าประมาณ) | TWR-S ให้บริการควบคุมสนามบิน TWR-N เป็นหอสำรอง [G32] | ถ้ามีแสงไฟห้องควบคุม ให้ TWR-S เป็นหอที่ใช้งาน |
| การถอยออกจากหลุมจอด | ไม่มีรถลากหรือการ push-back | push-back ด้วย towbar เท่านั้น ห้าม power-back [G32] | เครื่อง AI ขาออกทุกลำต้องมีช่วง push-back 3–5 นาที (ค่าประมาณ) |
| AIRAC | อ้าง 14 MAY 2026 | ฉบับปัจจุบัน 29 OCT 2026 (หัวข้อ 1) | ทำตามหัวข้อ 1 |

### ความขัดแย้งและช่องว่าง

1. **จำนวนเที่ยวบินปี 2025 ไม่ตรงกันระหว่างเอกสาร ทอท.:** สถิติปีงบ 2025 ให้ 213,694 [G6] รายงานประจำปี 2025 ให้ 214,723 (ปีปฏิทิน) [G9] แต่แผนวิสาหกิจระบุ "ค่าจริง 2025" 197,520 เที่ยวและผู้โดยสาร 29.15 ล้าน [G12] เมื่อคำนวณย้อนจากอัตราเพิ่มใน [G6] จะได้ FY2024 = 213,694 / 1.0819 ≈ 197,517 เที่ยว และ 31,337,658 / 1.0751 ≈ 29.15 ล้านคน ซึ่งตรงกับตัวเลขของ [G12] เกือบพอดี จึงสรุปว่า "ค่าจริง 2025" ใน [G12] คือค่าของปีงบ 2024 ให้ใช้ [G6] นอกจากนี้กราฟใน [G9] ระบุปี 2024 = 177,194 เที่ยว ขัดกับ 205,681 ใน [G8] ให้เชื่อ [G8] เพราะเป็นตารางสถิติเฉพาะ
2. **ขีดความสามารถต่อชั่วโมงมีหลายค่า:** 45/50/53 movements/ชม. (ประกาศฤดูหนาว 2024/25 ฉบับล่าสุดที่อ่านได้) [G37], 40/45 movements/ชม. (ประกาศ slot ฤดูหนาว 2022 อ่านได้จากข้อความดัชนีเท่านั้น) [G14], 55/ชม. (ผู้บริหาร ทอท.) [G18], 50/ชม. (เป้าออกแบบโครงการระยะที่ 3) [G19] และ 52/ชม. (Wikipedia) [G25] ค่าเหล่านี้นิยามต่างกัน (ขีดจำกัดการจัดสรร slot กับความจุทางกายภาพของทางวิ่ง) จึงใช้ 40 เป็นเกณฑ์ตรวจตารางบิน และ 55 เป็นเพดานของโหมดหนาแน่นพิเศษ ประกาศฤดูร้อน 2026 [G15] และฤดูหนาว 2026/27 ดึงเนื้อหาไม่ได้ ควรให้เจ้าของเปิด PDF ของ กพท. ด้วยเบราว์เซอร์แล้วแก้ `declared_capacity_per_hour_utc`
3. **ไม่มีข้อมูลรายชั่วโมงสาธารณะ:** น้ำหนัก w_h ทั้ง 24 ค่าเป็นค่าประมาณ เครื่องมือในรอบนี้เข้า OpenSky API และกระดานเที่ยวบินของบุคคลที่สามไม่ได้ ทางแก้ที่ดีที่สุด: อ่านตาราง "1st/30th Peak Hour" ในส่วน DMK ของ [G9] (มีในส่วน BKK จึงน่าจะมีของ DMK) หรือจดตารางขาเข้าและขาออกจากกระดานเที่ยวบินของ ทอท. 7 วันแล้วนับต่อชั่วโมง
4. **สัดส่วนสายการบินและแบบเครื่องตามจำนวน movements ไม่มีเผยแพร่:** ค่าที่ใช้ประมาณจากขนาดฝูงบินและจำนวนจุดหมาย (ความเชื่อมั่นต่ำ) รายงานประจำปีของ ทอท. [G9] มีตาราง "Airlines Domestic Traffic" และ "International flights by airline" ในส่วน BKK จึงน่าจะมีตารางเดียวกันของ DMK ซึ่งจะให้สัดส่วนสายการบินจริง ควรเปิดอ่านด้วยมือ
5. **ฝูงบิน Thai AirAsia ต่างกันตามวันที่:** 56 ลำ (31 ธ.ค. 2023) [G33], 62 ลำ (Wikipedia ส.ค. 2025) [G26], 58 ลำที่ใช้ปฏิบัติการ (ไตรมาส 1/2026) [G34] ต่างกันเพราะวันที่และนิยาม (ฝูงบินทั้งหมดกับฝูงบินที่ใช้งาน) ใช้สัดส่วนแบบเครื่องจาก [G26] แต่ใช้ 58 ลำเมื่อต้องการจำนวนเครื่องจริงในปี 2026
6. **AD 2.20 อ่านผ่านบทสรุปของเครื่องมือ:** เนื้อหาใน 7.10 มาจากการอ่านฉบับ 3 SEP 2026 [G32] ไม่ใช่ข้อความต้นฉบับ รายละเอียดข้อ 4 (ความสูง circuit) และ hot spot HS3 ถูกตัด AD 2.21–2.24 ของทุกฉบับปี 2026 อ่านไม่ได้ (หน้า HTML ถูกตัดที่ 97,829 ตัวอักษร ไฟล์ PDF ตอบ client_error) ให้เจ้าของเปิด https://aip.caat.or.th/2026-10-29-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html ด้วยเบราว์เซอร์ และดู AD 2.20 ข้อ 4, 9 และ AD 2.21 (noise abatement, curfew)
7. **การลง 03R ของพลเรือน:** มีหลักฐานชัดสำหรับการลง 21L แล้วข้าม 21R ที่ S (HS5 และ AD 2.20 ข้อ 6) [G3][G32] แต่ไม่มีเอกสารยืนยันการลง 03R แล้วข้าม 03L ที่ D เส้นทาง ARR03R_D จึงเป็นการอนุมานจากเรขาคณิต (ความเชื่อมั่นต่ำ) ถ้าต้องการความถูกต้องสูงสุด ให้ตัวสร้างจราจรส่งเครื่องลงเสริมเฉพาะทิศ 21 และในทิศ 03 ใช้ 03L อย่างเดียว
8. **ตำแหน่ง TWY Y ไม่มีใน OSM:** รู้เพียงกฎว่าใช้พร้อม 03R/21L ไม่ได้ [G1][G4] ให้ทำเป็นกฎในโค้ด ไม่วาดเส้น
9. **ทางออกที่ใช้จริงและเวลาครองทางวิ่ง:** ไม่มีข้อมูลสาธารณะ ผลใน 7.7 มาจากแบบจำลอง (สมการ 7.8) ที่ใช้พารามิเตอร์ประมาณ ข้อเท็จจริงที่สนับสนุนคือ rapid exit O และ R หันรับการลง 21R [G3][G30] และ AIP SUP A25/26 ระบุไฟ RETIL ของ O บน 21R (ดูหัวข้อ 1)
10. **turnaround:** ไม่มีค่าที่วัดที่ DMK แผนภูมิ 5-2-0/5-3-0 ของ Airbus มีอยู่แต่เครื่องมืออ่านไม่ถึง [G35] ไม่ได้อ่านเอกสาร Airport Planning ของ Boeing 737 และ ATR 72 ค่าในตาราง 7.9 จึงเป็นค่าประมาณที่ตรวจด้วยสถิติ AAV [G33] เท่านั้น
11. **ปี 2026 ผิดปกติ:** เที่ยวบิน ก.ย. 2026 ลดลง 16.9 % [G22] ตัวคูณ 0.83 ใน JSON เป็นค่าประมาณจากเดือนเดียว ข้อมูลรายเดือนแยกสนามบินของ FY2026 อยู่ใน Power BI และไฟล์ xlsx ของ ทอท. [G11] ที่เครื่องมืออ่านไม่ได้
12. **เที่ยวบินทหารและราชการ:** ไม่พบตัวเลขสาธารณะ และไม่ทราบว่า ทอท. นับรวมใน movements หรือไม่ ค่า `state_share` = 0.02 เป็นค่าประมาณ แสดงแบบทั่วไปเท่านั้นตามกฎข้อ 4 ของเจ้าของโครงการ
13. **แหล่งรองที่มีข้อผิดพลาด:** คู่มือ spotter [G29] สลับความยาวทางวิ่ง (เขียน 03L/21R = 3,500 m และ 03R/21L = 3,700 m) ขณะที่ระยะระหว่าง threshold ตาม AIP คือ 3,701.5 m สำหรับ 03L–21R ใช้เฉพาะคำบรรยายการใช้ทางวิ่งจากแหล่งนี้; บทความ [G18] เขียนว่าเพิ่ม "5 %" แต่ 55 → 65 คือ +18 %

### แหล่งอ้างอิง

1. [G1] CAAT (กพท.), AIP Thailand AD 2 VTBD Bangkok/Don Mueang Intl, AIRAC 14 MAY 2026, https://aip.caat.or.th/2026-05-14-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT ไม่มีสัญญาอนุญาตแบบเปิด; ตัวเลข พิกัด และชื่อทางขับเป็นข้อเท็จจริง ใส่ในโค้ดและ JSON ได้พร้อมอ้างอิงรอบ AIRAC ห้ามคัดลอกข้อความยาว
2. [G2] CAAT, หน้าหลัก eAIP Thailand (ฉบับมีผล AIRAC AMDT 11/26 วันที่ 29 OCT 2026), https://aip.caat.or.th/ และ https://aip.caat.or.th/2026-10-29-AIRAC/html/index-en-GB.html — © CAAT; ใช้ข้อเท็จจริง (วันที่และเลข AMDT)
3. [G3] CAAT, Aerodrome Ground Movement Chart – ICAO, Bangkok/Don Mueang Intl (ไฟล์ในชุด AIRAC 4 SEP 2025; hot spot HS1–HS6), https://aip.caat.or.th/2025-09-04-AIRAC/graphics/280016.pdf — © CAAT; ใช้ข้อเท็จจริงได้ ห้ามนำแผนภูมิหรือภาพมาใส่ใน repo
4. [G4] CAAT, Aerodrome Ground Movement Chart – ICAO, VTBD (ไฟล์ในชุด AIRAC 20 MAR 2025; หมายเหตุ TWY Y, Taxilane T, TWY J, ความกว้างทางขับ, การจอดแบบ nose-in), https://aip.caat.or.th/2025-03-20-AIRAC/graphics/263880.pdf — เงื่อนไขเดียวกับ [G3]
5. [G5] CAAT, AIP SUP A22/21 (การปิด RWY 03L/21R และทางขับที่เชื่อมอยู่; ฉบับเก่า หมดอายุแล้ว ใช้ยืนยันชื่อทางขับเท่านั้น), https://aip.caat.or.th/2021-11-03/html/eSUP/VT-eSUP-21-22-A-en-GB.html — © CAAT; ใช้ข้อเท็จจริง
6. [G6] AOT (ทอท.), "AOT Air Traffic Fiscal Year 2025 – 12 Months (Oct24–Sep25)", ปรับปรุง 16/10/2025, https://investor.airportthai.co.th/misc/statistic/2025/20251017-aot-traffic-calendar-2025-12m.pdf (ชื่อไฟล์มีคำว่า calendar แต่เนื้อหาคือปีงบ ต.ค. 2024–ก.ย. 2025 ตรวจแล้วในรอบทวนสอบ) — © AOT; ตัวเลขสถิติเป็นข้อเท็จจริง ใส่ใน JSON พร้อมอ้างอิงได้
7. [G7] AOT, "AOT LCCs Air Traffic Fiscal Year 2025 – 12 Months (Oct 2024 – Sep 2025)", ปรับปรุง 16/10/2025, https://investor.airportthai.co.th/misc/statistic/2025/20251017-aot-lccs-traffic-calendar-2025-12m.pdf — เงื่อนไขเดียวกับ [G6]
8. [G8] AOT, "AOT Air Traffic Calendar Year 2024 – 12 Month (Jan–Dec 2024)", ปรับปรุง 16/01/2025, https://investor.airportthai.co.th/misc/statistic/2025/20250117-aot-traffic-fiscal-2024-12m.pdf — เงื่อนไขเดียวกับ [G6]
9. [G9] AOT, รายงานสถิติการขนส่งทางอากาศประจำปี 2025 (Summary Report และ Statistics Report รายสนามบิน), https://www.airportthai.co.th/wp-content/uploads/2026/06/ANNUAL-REPORT-2025.pdf — © AOT; ใช้ตัวเลข
10. [G10] AOT, Air Transport Statistics Report 2019, https://www.airportthai.co.th/wp-content/uploads/2020/08/Report-2019.pdf — © AOT; ใช้ตัวเลข (สัดส่วนเที่ยวบินประจำ/ไม่ประจำ และ code C)
11. [G11] AOT Investor Relations, หน้าคลังสถิติการจราจรทางอากาศ https://investor.airportthai.co.th/transport_archive.html (ไฟล์รายปี https://aot.listedcompany.com/misc/statistic/2025/20251017-aot-traffic-fiscal-2025.xlsx) และหน้าสถิติปัจจุบัน (Power BI) https://investor.airportthai.co.th/transport.html — © AOT; ใช้ตัวเลข
12. [G12] AOT Corporate Strategy, แผนวิสาหกิจ ด้านธุรกิจโครงสร้างพื้นฐาน (เป้าหมาย 2025–2027), https://corporatestrategy.airportthai.co.th/en/sd/economic/infrasbusiness/ — © AOT; ใช้ตัวเลข
13. [G13] AOT, รายงานผลการดำเนินงาน 6 เดือนแรกของปีงบ 2026 ที่ส่งตลาดหลักทรัพย์ (15 พ.ค. 2026), https://market.sec.or.th/public/idisc/Download?FILEID=dat%2Fnews%2F202605%2F0765NWS150520261700105980E.pdf — เอกสารเปิดเผยต่อสาธารณะ; ใช้ตัวเลข
14. [G14] CAAT, ประกาศขีดความสามารถ DMK ฤดูหนาว 2022 (DMK-W22-with-attach.pdf), https://www.caat.or.th/wp-content/uploads/2022/05/DMK-W22-with-attach.pdf — © CAAT; อ่านได้เฉพาะข้อความที่เครื่องมือค้นหาทำดัชนีไว้ ใช้ตัวเลขพร้อมระบุฤดู
15. [G15] CAAT, DMK Notice of Airport Capacity ฤดูร้อน 2026 (29 MAR – 24 OCT 2026), https://www.caat.or.th/wp-content/uploads/2025/10/DMK_NAC_S26.pdf และฤดูหนาว 2024 https://www.caat.or.th/wp-content/uploads/2024/05/DMK_NAC_W24_U.pdf — ดึงเนื้อหาไม่ได้ในรอบนี้
16. [G16] APACA / Japan Schedule Coordination, "National Data Base for Thailand" (ปรับปรุง พ.ย. 2022; DMK เป็นสนามบิน Level 3 ผู้ประสานคือ กพท.), https://www.schedule-coordination.jp/apaca/db%20pdf/NDB%20for%20Thailand.pdf — ใช้ข้อเท็จจริง (ไม่ใช้ข้อมูลติดต่อบุคคล)
17. [G17] The Nation Thailand, บทความการประชุม IATA Slot Conference SC158 (มิ.ย. 2026; กพท. เป็นผู้ประสาน slot ของสนามบิน Level 3 รวม DMK), https://www.nationthailand.com/blogs/business/economy/40067329 — ข่าว สงวนลิขสิทธิ์; ใช้ข้อเท็จจริง
18. [G18] ผู้จัดการออนไลน์, 30 เม.ย. 2024 (ขีดความสามารถทางวิ่ง 55 → 65 เที่ยว/ชม. และทางขับคู่ขนานบนพื้นที่สนามกอล์ฟ), https://mgronline.com/business/detail/9670000037554 — ข่าว สงวนลิขสิทธิ์; ใช้ตัวเลขที่อ้างคำพูดผู้บริหาร (ตัวเลข 55 → 65 มาจากทั้ง รมว.คมนาคม และ กรรมการผู้อำนวยการใหญ่ ทอท.)
19. [G19] AOT, เว็บไซต์โครงการพัฒนาท่าอากาศยานดอนเมืองระยะที่ 3 (เป้าออกแบบเฉลี่ย 50 เที่ยว/ชม.), https://www.aot-donmueangphase3.com/ — © AOT; ใช้ตัวเลข
20. [G20] ผู้จัดการออนไลน์, ประมาณการเที่ยวบินช่วงปีใหม่ 2569 ที่ DMK (7,210 เที่ยว 26 ธ.ค. 2568 – 5 ม.ค. 2569), https://mgronline.com/business/detail/9680000124629 — ข่าว; ใช้ตัวเลข
21. [G21] ผู้จัดการออนไลน์, ประมาณการเที่ยวบินช่วงสงกรานต์ 2569 ที่ DMK (6,551 เที่ยว 10–19 เม.ย. 2026), https://mgronline.com/business/detail/9690000033817 — ข่าว; ใช้ตัวเลข
22. [G22] CAPA – Centre for Aviation, "Bangkok Don Mueang International Airport handles 2.3m pax in Oct-2026" (ส่วน Background อาจสร้างด้วยเครื่อง), https://centreforaviation.com/news/bangkok-don-mueang-international-airport-handles-23m-pax-in-oct-2026-1379037 — สงวนลิขสิทธิ์; ใช้ตัวเลขพร้อมระบุว่าเป็นแหล่งรอง
23. [G23] AirAsia Newsroom, "Thai AirAsia implements flight schedules reduction by 30 % in May–June…" (28 เม.ย. 2026), https://newsroom.airasia.com/news/thai-airasia-implements-flight-schedules-reduction-by-30-in-may-june-to-navigate-surging-fuel-costs-and-softer-travel-demand-th — ข่าวประชาสัมพันธ์ของสายการบิน; ใช้ข้อเท็จจริง
24. [G24] The Nation Thailand, ไทยไลอ้อนแอร์ระงับหรือลด 15 เส้นทาง (30 พ.ค. 2026), https://www.nationthailand.com/news/general/40066855 — ข่าว; ใช้ข้อเท็จจริง
25. [G25] Wikipedia, "Don Mueang International Airport" (อ่าน 17 พ.ย. 2026), https://en.wikipedia.org/wiki/Don_Mueang_International_Airport — CC BY-SA 4.0; ใช้ข้อเท็จจริงได้ (ข้อเท็จจริงไม่ติด share-alike) ห้ามคัดลอกข้อความ; แหล่งรอง
26. [G26] Wikipedia, "Thai AirAsia" (ตารางฝูงบิน ส.ค. 2025), https://en.wikipedia.org/wiki/Thai_AirAsia — เงื่อนไขเดียวกับ [G25]
27. [G27] Wikipedia, "Thai Lion Air" (ตารางฝูงบิน ส.ค. 2025), https://en.wikipedia.org/wiki/Thai_Lion_Air — เงื่อนไขเดียวกับ [G25]
28. [G28] Wikipedia, "Nok Air" (ตารางฝูงบิน ส.ค. 2025), https://en.wikipedia.org/wiki/Nok_Air — เงื่อนไขเดียวกับ [G25]
29. [G29] Spotterguide.net, "Bangkok Don Mueang Airport (DMK/VTBD)" (ปรับปรุงล่าสุด 16 พ.ย. 2026), https://www.spotterguide.net/planespotting/asia/thailand/bangkok-dmk-vtbd/ — สงวนลิขสิทธิ์; ใช้คำบรรยายการใช้ทางวิ่งเป็นหลักฐานรองเท่านั้น
30. [G30] Overture Maps Foundation, base theme ชนิด infrastructure รุ่น 2026-10-21.0 (เส้นทางขับ aeroway=taxiway พร้อม ref และประตู airport_gate ที่มาจาก OpenStreetMap), https://overturemaps-us-west-2.s3.amazonaws.com/release/2026-10-21.0/theme=base/type=infrastructure/ (เอกสาร https://docs.overturemaps.org/) — ส่วนที่มาจาก OSM อยู่ภายใต้ ODbL 1.0: ข้อมูลอนุพันธ์ (ชื่อทางขับที่จับคู่ ตำแหน่งทางออก) ใส่ใน repo ได้ โดยต้องคงข้อความ "© OpenStreetMap contributors (ODbL)" และเผยแพร่ฐานข้อมูลอนุพันธ์ภายใต้ ODbL ด้วย
31. [G31] OpenStreetMap contributors, เงื่อนไขลิขสิทธิ์และ ODbL, https://www.openstreetmap.org/copyright — ODbL 1.0 (ข้อความเครดิตเดิมใน footer ของ repo ใช้ได้)
32. [G32] CAAT, AIP Thailand AD 2 VTBD, AIRAC 3 SEP 2026, หัวข้อ AD 2.20 Local Aerodrome Regulations ข้อ 1–15 (อ่านผ่านบทสรุปของเครื่องมือในงานหัวข้อ 1 วันที่ 17 พ.ย. 2026), https://aip.caat.or.th/2026-09-03-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT; ใช้ข้อเท็จจริง
33. [G33] Asia Aviation PCL (AAV, บริษัทแม่ของ Thai AirAsia), One Report 2023 (แบบ 56-1 One Report: สถิติการดำเนินงาน ฝูงบิน การใช้งานเครื่องบิน OTP), https://aavplc.com/storage/document/shareholder-meetings/agm2024/aav-or-2023-en.pdf — เอกสารเปิดเผยต่อผู้ถือหุ้น สงวนลิขสิทธิ์; ใช้ตัวเลข
34. [G34] AAV, "AAV announces financial results for the first quarter of 2026" (14 พ.ค. 2026), https://www.aavplc.com/en/newsroom/investor-news/192724/aav-announces-financial-results-for-the-first-quarter-of-2026 — ข่าวนักลงทุน; ใช้ตัวเลข
35. [G35] Airbus, A320 Aircraft Characteristics – Airport and Maintenance Planning (AC A320, มิ.ย. 2024; หัวข้อ 5-2-0 และ 5-3-0), https://aircraft.airbus.com/sites/g/files/jlcbta126/files/2024-06/AC_A320_0624.pdf — © Airbus เผยแพร่ฟรีเพื่อการวางแผนสนามบิน; ใช้ตัวเลขพร้อมอ้างอิง ห้ามนำรูปมาใส่ใน repo
36. [G36] U.S. 14 CFR § 97.3 (นิยามประเภทการเข้าสู่สนามบิน A–E ตามความเร็วอ้างอิง), Legal Information Institute, https://www.law.cornell.edu/cfr/text/14/97.3 — กฎหมายของรัฐบาลกลางสหรัฐฯ เป็น public domain ใช้ได้อิสระ
37. [G37] CAAT (กองจัดสรรเวลาการบิน), DMK Notice of Airport Capacity ฤดูหนาว 2024/2025 (27 OCT 2024 – 29 MAR 2025), https://www.caat.or.th/wp-content/uploads/2024/05/DMK-NAC-W24.pdf — © CAAT; ใช้ตัวเลขเป็นข้อเท็จจริงพร้อมระบุฤดู (อ่านผ่านเครื่องมือในรอบทวนสอบ 17 พ.ย. 2026; ตารางลานจอดในไฟล์อ่านได้ไม่ครบจึงไม่ได้ใช้)

### สิ่งที่ Claude Code ควรทำ (หัวข้อนี้)

1. **เพิ่มไฟล์ข้อมูล `data/vtbd_ops.json`** โดยคัดลอกจาก `docs/research/05-airport-city/vtbd_ops.json` (บล็อก JSON ข้างบน) ให้ `build.mjs` คัดลอกไปที่ `dist/` เหมือนไฟล์ข้อมูลอื่น และใส่ใน `files` ตอนเผยแพร่ artifact ใส่เครดิตในไฟล์: "AOT statistics FY2025; AIP Thailand AD 2 VTBD (CAAT); taxiway names and exits derived from © OpenStreetMap contributors (ODbL) via Overture Maps 2026-10-21.0; hourly profile, fleet mix, turnaround: estimates"
2. **เพิ่ม `test/ops.test.mjs`** จากต้นแบบ `docs/research/05-airport-city/ops.test.mjs` (T-G01–T-G18 ผ่านแล้ว) เปลี่ยนพาธเป็น `../data/vtbd_ops.json`, ใช้ `RWY_END['03L'].hdg` และ `llToNE` จาก `test/harness.mjs` ใน T-G14 และ T-G18 แล้วเพิ่ม T-G19 ถึง T-G22 และเพิ่มคำสั่งรันใน `.github/workflows/pages.yml`
3. **ใส่ชื่อทางขับให้เส้น `tw`:** เขียนสคริปต์ใน `tools/` ที่อ่าน `docs/research/05-airport-city/tw_names.json` (137 ค่าเรียงตามลำดับเส้นใน `data/vtbd_af.json`) แล้วเพิ่มฟิลด์ `r` ให้แต่ละเส้น (`null` ถ้าไม่มีชื่อ) คัดลอกไฟล์ต้นทางไปไว้ใน `tools/` ด้วยเพื่อให้ทำซ้ำได้ และคงเครดิต ODbL
4. **เพิ่มทางออกใน `src/15-geo.js`:** `RWY_END[id].exits = [{ id, s, kind, en }]` จากฟิลด์ `exits` ของ JSON (หรือโหลดจาก `vtbd_ops.json` ใน `48-data.js` ถ้าไม่อยากให้ไฟล์ pure ยาวขึ้น) และเพิ่มฟังก์ชัน pure `pickExit(rwyId, type, wet)` ตามสมการ 7.8 ใน `src/20-flight.js` หรือไฟล์ pure ใหม่ `src/25-traffic.js` (ถ้าสร้างไฟล์ใหม่ต้องเพิ่มใน `test/harness.mjs` และรักษาให้ไม่มี DOM)
5. **ตัวสร้างตารางบิน (pure) ใน `src/25-traffic.js`:** `makeDay({ seed, month, peak, scenario2026 })` คืนรายการเที่ยวบิน `{ t, kind: 'arr'|'dep', type, airline, rwy, exit, route, stand }` ตามสมการ 7.1–7.6 พร้อมจำกัด 40/ชม. และยกส่วนเกิน, ใช้ `runway_config` เลือกทางวิ่ง (สมการ 7.10, กฎ LVP, กฎทางวิ่งเสริม 7.5), ใช้ `turnaround_min` จับคู่ขาเข้ากับขาออกของเครื่องลำเดียวกัน และสุ่มด้วย mulberry32 เพื่อให้เทสต์ทำซ้ำได้
6. **ปรับเครื่องจอดใน `src/55-city.js`:** เปลี่ยนความน่าจะเป็น wide-body จาก `rnd() < 0.18` เป็น ≈ 0.03 (ค่าประมาณจากสัดส่วน A333 0.027) และให้จำนวนเครื่องจอดขึ้นกับเวลาของฉากตามสมการ 7.12 (กลางวัน ≈ 25 ลำ ตีสอง ≈ 49 ลำ) โดยระบุใน UI ว่าเป็นค่าประมาณ
7. **ปรับ `inUse()` ใน `src/90-app.js`:** คงเกณฑ์ 3 kt แต่เมื่อลมสงบให้ใช้ทิศตามเดือน (ต.ค.–ก.พ. = 03L) และเพิ่มตัวเลือก LVP (RVR < 550 m) ที่บังคับใช้ 21R และปิด 21L ตาม AD 2.20 ข้อ 8
8. **ขั้นต่อไป (เครื่อง AI เคลื่อนที่):** ใช้ `taxi_routes` กับกราฟจากเส้น `tw` ที่มีชื่อ หาเส้นทางสั้นสุดแบบมีข้อจำกัด (ห้าม Y เมื่อ 03R/21L ใช้งาน, ห้าม T สำหรับ code E, ห้าม J สำหรับเครื่องใหญ่กว่า B737) ใส่ช่วง push-back 3–5 นาทีทุกขาออก และหยุดที่จุดรอ (21R: B North 130 m, D 130/210 m, E 90 m, J 90 m, S 90/130 m, C South 90 m จากแนวกลาง [G1])
9. **(ใหม่จากรอบทวนสอบ) ปิดทางวิ่งกลางคืน:** ใน `makeDay` ให้อ่าน `runway_config.night_closures_w24` แล้วในช่วง 00:00–05:00 น. ของคืนที่ปิด ให้ทุกเที่ยวบินใช้ทางวิ่งที่เปิด (คืนที่ปิด 03L/21R ใช้ 03R/21L ทั้งขึ้นและลง) เพิ่มเทสต์ T-G23: เวลา 02:00 น. ของเช้าวันอังคาร (= วันจันทร์ 19:00 UTC ซึ่งอยู่ในช่วงปิด 03L/21R) ต้องได้ `rwy` เป็น 21L หรือ 03R ทุกเที่ยวบิน; ตรวจวันในสัปดาห์กับประกาศฤดูปัจจุบันของ กพท. ก่อนใช้
10. **สิ่งที่ต้องให้เจ้าของช่วยเปิดด้วยมือ (เครื่องมืออ่านไม่ได้):** (ก) ส่วน DMK ของ [G9] เพื่อเอาตาราง peak hour และสัดส่วนสายการบินจริงมาแทนค่าประมาณใน `hourly_weights` และ `airlines`; (ข) ไฟล์ xlsx ใน [G11] เพื่อเอาตัวคูณรายเดือน 12 ค่า; (ค) ประกาศขีดความสามารถ S26/W26 ของ กพท. [G15]; (ง) AD 2.20 ข้อ 4 และ AD 2.21 ของรอบ 29 OCT 2026; (จ) หัวข้อ 5-2-0/5-3-0 ใน [G35] เพื่อแทนค่า turnaround ของ A320
11. **ไม่ต้องทำ:** ไม่ต้องวาด TWY Y (ไม่มีพิกัดสาธารณะ) ไม่ต้องใส่ชื่อหรือแบบเครื่องของหน่วยทหาร ให้เครื่องราชการเป็นแบบทั่วไปที่ใช้ 03R/21L และลานจอดฝั่งตะวันออกเท่านั้น

### บันทึกการตรวจทาน

ตรวจทานโดยผู้ตรวจอิสระ (รอบย่อย 5B) วันที่ 17 พ.ย. 2026

- **ตรวจแล้ว 12 ข้อ:** สถิติ FY2025 ของ ทอท., ขีดความสามารถที่ประกาศ, ขีดความสามารถ 55/65 เที่ยวต่อชั่วโมง, ประมาณการช่วงปีใหม่, สถิติ AAV ปี 2023, stop bar ใน AD 2.9, hot spot HS1–HS6 และหมายเหตุในแผนภูมิ, วันที่มีผลของ AIRAC ปัจจุบัน, พิกัดและระยะ s ของทางออกทุกจุด, การเลือกทางออกตามสมการ 7.8, การรันต้นแบบ T-G01–T-G18, ความถูกต้องของ JSON
- **ยืนยันแล้ว:** FY2025 DMK movements 88,737 + 124,957 = 213,694 (+8.19 %), ผู้โดยสาร 31,337,658 (+7.51 %), สินค้า 47,651 t [G6]; 55 → 65 เที่ยว/ชม. (30 APR 2024) [G18]; ปีใหม่ 7,210 เที่ยว 26 DEC 2025–5 JAN 2026 ช่วงหนาแน่น 05–07, 09–11, 16–19 น. [G20]; AAV ปี 2023: ใช้งาน 12.7 ชม./วัน, 114,571 sectors (45,047 + 69,524), ระยะเฉลี่ย 1,094 km, OTP 83 %, ฝูงบิน 43 + 11 + 2 = 56 ลำ [G33]; stop bar 21R: B North 130, D 130 ขวา/210 ซ้าย, E 90, J 90, S 90 ขวา/130 ซ้าย, C South 90 m ในฉบับ 29 OCT 2026 [G1]; ข้อความ HS1–HS6, TWY J ไม่เกิน B737, Taxilane T code A–D, กฎ TWY Y, ทางขับ 23 m และ nose-in ทุกหลุม ในแผนภูมิชุด 4 SEP 2025 [G3]; AIP ฉบับที่มีผลวันนี้คือ 29 OCT 2026 [G2]; คำนวณซ้ำ: ระยะ threshold 03L–21R 3,701.5 m, 03R–21L(เลื่อน) 3,150.5 m, ทิศ 28.7° true, `ll_to_en` ของทางออกตรงภายใน 0.05 m และทุกจุดอยู่บนแนวกลางทางวิ่ง (ระยะตั้งฉาก 0.0 m), ระยะ s ตรงภายใน 0.4 m, `typical_exit` ทุกช่องตรงกับสมการ 7.8, ต้นแบบผ่านทั้ง 18 ข้อ
- **แก้ไขแล้ว:** ขีดความสามารถที่ประกาศ 40/45 (W22) → 45/50/53 movements/ชม. ตามประกาศ W24 [G37] (คง 40 เป็นเกณฑ์ตรวจแบบอนุรักษ์ และเก็บค่า W22 ไว้ใน `declared_capacity_w22`); เพิ่มข้อมูลปิดทางวิ่งกลางคืน 00:00–05:00 น. (03L/21R จันทร์–พฤหัสบดี, 03R/21L ศุกร์–เสาร์ ตามเวลา UTC ในประกาศ) ใน 7.6, JSON `night_closures_w24`, งานข้อ 9 และเทสต์ T-G23 [G37]; หมายเหตุว่าไฟล์ของ [G6] ชื่อ calendar แต่เป็นปีงบ; เพิ่มแหล่ง [G37]
- **ยังยืนยันไม่ได้ (ยังไม่ยืนยัน):** AD 2.20 ทั้ง 15 ข้อ [G32] (หน้า HTML ฉบับ 29 OCT 2026 ถูกตัดที่ AD 2.18 อีกครั้ง จึงคงความเชื่อมั่น กลาง); ประกาศขีดความสามารถ S26/W26 [G15] ยังดึงไม่ได้ ค่า W24 อาจเปลี่ยนแล้ว; ฝูงบินจาก Wikipedia [G26][G27][G28]; ประมาณการสงกรานต์ [G21]; ตัวเลข CAPA ปี 2026 [G22]; เลข AMDT 11/26
