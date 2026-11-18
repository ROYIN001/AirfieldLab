# 11. การรับคำสั่งจากผู้ใช้: gamepad คีย์บอร์ด จอย HOTAS pedals และการแสดงแรง

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง (ข้อกำหนดเว็บและการรองรับของเบราว์เซอร์ สูง; ค่าตั้ง dead zone, expo และอัตรา ramp เป็นค่าประมาณ ต่ำ–กลาง) · แหล่งหลัก: W3C Gamepad [I1], MDN browser-compat-data [I2], โค้ดและข้อมูลอินพุตของ FlightGear [I12–I17], คู่มือ X-Plane 12 [I9]

## 11.0 สรุปสั้น
- **มีบั๊กที่ต้องแก้ก่อนอย่างอื่น:** คีย์ลดคันเร่งคือ Ctrl (90-app.js:332) ส่วนคีย์ดันหัวลงคือ W (W → `up` → y = −1 ซึ่ง `PilotLaws` แปลงเป็น elevator ลง) ถ้าผู้เล่นลดคันเร่งพร้อมกับดันหัวลงตอนร่อนลง ก็คือกด Ctrl+W ซึ่ง Chrome สงวนไว้ปิดแท็บ หน้าเว็บจึงดักด้วย `preventDefault()` ไม่ได้เมื่อไม่ได้อยู่ในโหมดเต็มจอ [I22] ทางแก้คือเอา Ctrl, Meta และ Alt ออกจาก keymap ทั้งหมด และไม่ตีความคีย์การบินเมื่อมีตัวปรับเหล่านี้กดอยู่ (T-I-07)
- **คีย์บอร์ดมี ramp อยู่แล้ว แต่เร็วเกินไป:** CLAUDE.md บอกว่า "binary" แต่โค้ดจริง (90-app.js:361) ไต่ 2.0/s ในแกน pitch และคืนกลาง 5/s ในโหมด DIRECT ที่ 95 kt (48.9 m/s) แฟลปลง การกดค้าง 0.3 s ให้ Δn = +0.40 g ข้อเสนอคือลดเหลือ 0.5/s (≈ 1.1 g/s ตรงกับหัวข้อ 6) ซึ่งให้ +0.07 g เพิ่มปุ่ม Shift สำหรับโหมดละเอียด และให้การแตะที่สั้นกว่าหนึ่งเฟรมยังถูกนับ นอกจากนี้ปุ่ม toggle ทุกปุ่ม (C, T, P, R) ต้องไม่ทำงานซ้ำตาม key repeat ของระบบปฏิบัติการ (T-I-05, T-I-06, T-I-08, T-I-09)
- **Gamepad API ใช้ได้ทุกเบราว์เซอร์หลักแล้ว** (Chrome 21, Firefox 29, Safari 10.1 [I2]) ให้อ่าน `navigator.getGamepads()` หนึ่งครั้งต่อเฟรมก่อน `fl.advance` [I1] ในผัง Standard Gamepad แกน `axes[1]` เป็นบวกเมื่อดึงคันกลับ จึงตรงกับ `y` (+ดึง) ของ PilotLaws ได้เลยโดยไม่ต้องกลับเครื่องหมาย ส่วนการสั่นมีเฉพาะ Chrome/Edge 68+ และ Safari 16.4+ บนเดสก์ท็อป Firefox และ iOS ไม่มี [I2]
- **ต้องมีชั้น shaping ที่ไม่ผูกกับ DOM** เรียงเป็น ปรับเทียบ → กลับทิศ → dead zone แบบ scaled → expo/power/เส้นโค้งกำหนดเอง → gain วัดโมเดลปัจจุบันในโหมด DIRECT ที่ Vapp ได้ว่าถ้าคันเป็นเชิงเส้น โยกเพียง 30 % ก็ถึงสัญญาณเตือน stall (α 11.6°) แต่ถ้าใช้ d = 0.08 และ e = 0.5 จะถึงที่ 50 % ช่วงคันที่ใช้ได้จริงจึงกว้างขึ้นราว 1.8 เท่า (ตาราง 11.3.5)
- **การผูกอุปกรณ์ควรทำผ่าน wizard ที่ตรวจจับจากการขยับ** และบันทึกค่า rest/full ของคันโยกทุกตัว เพราะอุปกรณ์จริงให้เครื่องหมายสวนกัน เช่น toe brake ของ Saitek มีค่าพักที่ −1 แต่ของ Thrustmaster T-Rudder มีค่าพักที่ +1 [I16] และลำดับแกนในเบราว์เซอร์ไม่ได้กำหนดไว้ [I1] ให้เก็บโปรไฟล์ไว้ใน `localStorage` โดยใช้ vendor:product เป็นคีย์
- **แรงที่คันส่งผ่านเว็บโดยตรงไม่ได้:** Gamepad API มีแค่การสั่นแบบระยะเวลาคงที่และความแรงคงที่ [I1] จึงใช้การสั่นแทน buffet, ล้อบนทางวิ่ง และแรงกระแทกตอนแตะพื้น ร่วมกับแถบแสดงแรงของหัวข้อ 6 และเสียง ส่วน force feedback ผ่าน WebHID ใช้ได้เฉพาะ Chromium บนเดสก์ท็อป [I2] และต้องเขียนโปรโตคอล HID PID เองทั้งหมด [I25] จึงยังไม่คุ้มค่า

## 11.1 สภาพปัจจุบันใน AirfieldLab

| ส่วน | โค้ดปัจจุบัน | ปัญหา/ช่องว่าง |
|---|---|---|
| Keymap | `KEYMAP` (90-app.js:332): W/S, ↑/↓ = pitch; A/D, ←/→ = roll; Q/E = rudder; Shift = คันเร่งขึ้น; **Ctrl = คันเร่งลง**; B = เบรก | Ctrl+W, Ctrl+T, Ctrl+N เป็นชุดคีย์ที่ Chrome สงวนไว้ [I22]; Ctrl+S, Ctrl+D, Ctrl+A ก็จะเปิดหน้าต่างบันทึก, bookmark หรือเลือกทั้งหน้า เพราะโค้ดเรียก `preventDefault` เฉพาะลูกศร (90-app.js:336) ไม่มีคีย์ trim, แฟลป, ล้อ หรือเบรกแยกซ้ายขวา |
| Ramp คีย์ | `ramp(v, tgt, r)` (90-app.js:360–362): pitch ขึ้น 2.0/s, roll และ rudder 2.5/s, คืนกลาง 5/s | ถึงสุดใน 0.5 s และคืนกลางใน 0.2 s ทำให้ไวมากใน DIRECT (ตารางด้านล่าง) ไม่มีโหมดละเอียด ถ้าแตะคีย์สั้นกว่าหนึ่งเฟรม `keydown`/`keyup` จะเพิ่มและลบออกจาก `Set` ก่อนที่ `readInputs` จะได้อ่าน การแตะนั้นจึงหายไป |
| คีย์แบบ toggle | C, T, P, R (90-app.js:338–341) | ไม่ได้เช็ก `e.repeat` ถ้ากดค้าง ระบบปฏิบัติการจะส่ง keydown ซ้ำที่ 2.5–30 Hz [I23] กล้องจึงวนเปลี่ยน, การรับช่วงบังคับสลับไปมา และ pause เปิดปิดถี่ ๆ |
| Focus | `blur` ล้างคีย์ทั้งหมด (90-app.js:344) | ใช้ได้ แต่ยังไม่จัดการ `visibilitychange` และไม่ได้กันคีย์เมื่อกด Ctrl/Meta ค้าง ตัวอย่างคือ Ctrl+R จะเรียก `startFlight()` ก่อนที่หน้าจะโหลดใหม่ |
| ปุ่ม "เต็มจอ" | สลับ class CSS (90-app.js:329) | ไม่ได้เรียก Fullscreen API จึงใช้ Keyboard Lock ไม่ได้ เพราะ API นั้นทำงานเฉพาะในโหมดเต็มจอจริง [I21] |
| Stick บนจอสัมผัส | absolute ในวงกลม 140 px, คันเต็มที่ R = 50 px (90-app.js:346), ปล่อยแล้วกลับศูนย์ (349), CSS `touch-action: none` (template.html:148) | แตะลงที่จุดใดก็ได้คันกระโดดไปที่นั่นทันที เช่น แตะห่างศูนย์ 15 px ได้ y = 0.3 ซึ่งถ้าค้างไว้ใน DIRECT ที่ 95 kt จะถึงสัญญาณเตือน stall วงกลมทำให้ดึงสุดพร้อมเอียงสุดไม่ได้ (มุมทแยงได้ 0.707) และไม่มี dead zone, expo หรือ trim |
| Gamepad / จอย / pedals | ไม่มี | — |
| Haptics / เสียง | ไม่มี (`grep vibrat|haptic|AudioContext` ไม่พบ) | — |
| Pilot laws | ASSIST: dead zone แบบไม่ scale 0.04 (20-flight.js:434, 437); DIRECT: เชิงเส้น `c.de = −y·22°` ข้างบวก และ `−y·15°` ข้างลบ, auto-trim เมื่อ \|y\| < 0.05 (467–470) | ใน ASSIST ค่าข้าม 0.04 ทำให้คำสั่ง bank กระโดดจาก 0 ไป 1.32° ใน DIRECT ไม่มี shaping เลย เบรกเป็นค่าเดียวใช้กับล้อหลักทั้งสองข้าง (20-flight.js:217) และเลี้ยวล้อหน้าด้วย rudder เท่านั้น (474) |

**ผลวัดกับโมเดลปัจจุบัน** (`scripts/i11_current.mjs`: `Flight` ค่าเริ่ม 5,500 m, 95 kt, แฟลปลง, ล้อลง, โหมด DIRECT, เฟรม 60 Hz, Δn คำนวณจาก q̄·S·C_L·cos α/(m·g) − 1; α ตั้งต้น 1.76°, เกณฑ์เตือนในแอปคือ α > 10.5°):

| อินพุต | Δn สูงสุด (g) | α สูงสุด (°) | เตือน stall |
|---|---|---|---|
| คีย์ pull ปัจจุบัน (2.0/s) กดค้าง 0.1 / 0.2 / 0.3 s แล้วปล่อย | 0.06 / 0.21 / 0.40 | 2.4 / 4.1 / 6.2 | ไม่ |
| คีย์ pull ที่เสนอ (0.5/s) กดค้าง 0.3 / 0.5 / 0.8 s | 0.07 / 0.22 / 0.49 | 2.6 / 4.2 / 7.3 | ไม่ |
| คันเชิงเส้น (gamepad ถ้าเสียบตอนนี้) ค้าง 2.5 s ที่ 0.05 / 0.1 / 0.2 / 0.3 | 0.12 / 0.25 / 0.48 / 0.65 | 3.3 / 4.9 / 8.1 / 11.6 | ที่ 0.3 |
| คันผ่าน d 0.08 + e 0.5 ค้าง 2.5 s ที่ 0.25 / 0.5 / 0.6 | 0.24 / 0.62 / 0.69 | 4.8 / 10.6 / 21.7 | ที่ 0.5 (0.6 = stall) |
| ASSIST, คีย์ปัจจุบัน กดค้าง 0.3 / 0.6 s | 0.04 / 0.14 | 2.2 / 3.4 | ไม่ |

ข้อสังเกต: ใน DIRECT คันเชิงเส้นใช้ได้เฉพาะ 10 % แรกของระยะคัน (≤ 0.25 g) ซึ่งบน thumbstick เท่ากับไม่กี่มิลลิเมตร และตัวเลขชุดนี้สอดคล้องกับค่า 0.431 คัน/g ที่หัวข้อ 6 คำนวณจาก derivative (`c6_current.mjs`) แต่ไม่ได้แปลว่าเครื่องไวเกินจริง เพราะที่ Vapp/Vs0 = 95/71 เครื่องมีระยะเผื่อถึง stall ราว (95/71)² − 1 ≈ 0.79 g อยู่แล้ว ปัญหาอยู่ที่การแปลงอินพุต ไม่ได้อยู่ที่ฟิสิกส์

## 11.2 Gamepad API (W3C)

### 11.2.1 ข้อมูลที่ได้และผัง Standard Gamepad
สเปก W3C (Editor's Draft) กำหนดว่า "All axis values MUST be linearly normalized to the range [-1 .. 1]" และ "-1 SHOULD correspond to "forward" or "left", and 1 SHOULD correspond to "backward" or "right"" ค่า `GamepadButton.value` อยู่ในช่วง [0..1] ปุ่มแบบดิจิทัลให้ได้แค่ 0 หรือ 1 [I1] ถ้าเบราว์เซอร์รู้จักอุปกรณ์ `mapping` จะเป็น `"standard"` และแกนกับปุ่มจะเรียงตามผังมาตรฐาน 17 ปุ่ม 4 แกน ถ้าไม่รู้จัก `mapping` จะเป็น `""` และสเปกบอกเพียงว่าอุปกรณ์ที่ไม่รู้จัก "should still be exposed in their raw form" [I1] จอยบิน, HOTAS และ pedals มักอยู่ในกลุ่มหลังนี้ จึงต้องผูกแกนเองทุกครั้ง (11.5)

ตารางผังมาตรฐาน [I1] พร้อมหน้าที่ที่เสนอสำหรับการบิน (ค่าเสนอ ปรับได้ใน UI):

| ดัชนี | ตำแหน่งตามสเปก | หน้าที่ที่เสนอ |
|---|---|---|
| axes[0] | Left stick แนวนอน (ลบ = ซ้าย) | roll (x, +ขวา) |
| axes[1] | Left stick แนวตั้ง (ลบ = ขึ้น/ดัน) | pitch: `y = +axes[1]` (ดึง = บวก ไม่ต้องกลับเครื่องหมาย) |
| axes[2], axes[3] | Right stick | axes[2] = มองซ้ายขวาในกล้อง cockpit/free; axes[3] = **อัตรา**คันเร่ง (ดัน = เพิ่ม, 0.5/s เมื่อสุด) |
| buttons[6], [7] | Bottom left/right front (trigger, ค่า analog) | rudder = value[7] − value[6] |
| buttons[4], [5] | Top left/right front (bumper) | เบรกซ้าย/ขวา (ดิจิทัล ไต่ถึงเต็มใน 0.5 s) |
| buttons[12], [13] | D-pad ขึ้น/ลง | trim หัวลง/หัวขึ้น (เหมือนหมุนล้อ trim ไปหน้า/หลัง) |
| buttons[14], [15] | D-pad ซ้าย/ขวา | แฟลปเก็บ/กางทีละขั้น |
| buttons[3] | Top button in right cluster | ล้อขึ้น/ลง |
| buttons[0] / [1] | Bottom / right button in right cluster | รับช่วงบังคับ (T) / เปลี่ยนกล้อง (C) |
| buttons[9] | Right button in center cluster | pause |

ถ้าใช้ shaping ตาม 11.3 (radial d = 0.08, e = 0.5, rudder d = 0.05, e = 0.3, คันเร่ง d = 0.15) กับ snapshot ทดสอบ `axes = [0.5, 0.6, 0, −0.4]`, trigger L = 0.2, R = 0.7 ได้ x = 0.3019, y = 0.3930, rud = 0.3635 และคันเร่งเพิ่ม 0.147/s (`scripts/i11_gamepad_profile.mjs`, T-I-12)

### 11.2.2 การ poll และวงจรชีวิตของอุปกรณ์
- **Poll ทุกเฟรม:** สเปกบอกว่า "the gamepad data should be polled as closely as possible to immediately before the animation callbacks are executed, and with frequency matching that of the animation" [I1] และ `getGamepads()` คืน *สำเนา* ของสถานะ (`gamepadCopy`) web.dev จึงเตือนว่า "Always call `navigator.getGamepads()` inside of the game loop" [I6] จุดที่เหมาะใน AirfieldLab คือใน `readInputs(dt)` ซึ่ง `frame()` เรียกก่อน `fl.advance` (90-app.js:457) ส่วนสถานะ `Gamepad.timestamp` ใช้ตรวจว่ามีข้อมูลใหม่หรือไม่ [I1]
- **ต้องมี user gesture ก่อน:** "To mitigate fingerprinting, `getGamepads()` returns an empty list before a gamepad user gesture has been seen" [I1] คำว่า gesture ในที่นี้คือการกดปุ่มที่เคยรายงาน `false` มาก่อน หรือการโยกแกนที่มีจุดกลางออกไปเกินเกณฑ์ ส่วนแกนที่ไม่คืนกลางเอง (เช่นคันเร่ง HOTAS) "SHOULD NOT be considered" [I1] ดังนั้น UI ต้องบอกผู้ใช้ว่า "กดปุ่มใดก็ได้บนจอยเพื่อเริ่มใช้งาน" การขยับคันเร่งอย่างเดียวอาจไม่ทำให้อุปกรณ์ปรากฏ
- **เหตุการณ์:** `gamepadconnected` และ `gamepaddisconnected` สเปกระบุว่าค่าจาก `getGamepads()` "does not reflect disconnection or connection until after" เหตุการณ์ทั้งสองยิงแล้ว [I1] ถ้าอุปกรณ์ที่กำลังคุมเครื่องหลุดระหว่างบิน ข้อเสนอคือหยุดเวลา (`app.train.warp = 0`), แสดงข้อความ "จอยหลุดการเชื่อมต่อ" และให้คีย์บอร์ดรับช่วงต่อ
- **ตอนหน้าเว็บถูกซ่อน:** `playEffect()` และ `reset()` จะ reject ถ้าเอกสาร "hidden" และเมื่อหน้าเปลี่ยนเป็น hidden เอฟเฟกต์ที่ค้างอยู่จะถูกหยุด [I1]
- **หลายอุปกรณ์:** `getGamepads()` คืน array ที่มี `null` ในช่องที่ว่าง [I1] เช่น stick + pedals + throttle quadrant เป็นสามรายการแยกกัน จึงต้องผูกหน้าที่กับคู่ (อุปกรณ์, แกน) ไม่ใช่กับ index ของ array ซึ่งเปลี่ยนได้เมื่อถอดเสียบ ควรจับคู่ด้วย `id` แทน

### 11.2.3 สิทธิ์ ความปลอดภัย และการฝังใน iframe
- **Permissions Policy:** สเปกกำหนด feature `"gamepad"` ที่มี default allowlist เป็น `*` [I1, I4] ถ้าหน้าแม่ปิด feature นี้ `getGamepads()` จะ throw `SecurityError` และเหตุการณ์จะไม่ยิง [I1, I4] Chrome เริ่มบังคับใช้ใน Chrome 103 โดยประกาศว่า "Default policy allows cross-origin iframes and does not change behavior on existing sites." [I5] ดังนั้นการรันใน artifact ของ claude.ai ซึ่งน่าจะเป็น iframe ข้ามโดเมน ควรใช้ gamepad ได้ เว้นแต่โฮสต์จะตั้ง policy ปิดไว้ ข้อนี้**ยังไม่ยืนยัน** ต้องทดสอบจริงบนทั้งสองโฮสต์
- **Secure context:** ข้อความ Intent ของ Chrome ปี 2022 บอกว่า "The secure context requirement will be communicated in a separate Intent" [I5] และ Firefox มี bug ชื่อ "Add SecureContext and Permission Policy to Gamepad API" [I32] (เปิดอ่านแค่ชื่อเรื่อง) เรื่องนี้ไม่กระทบ AirfieldLab เพราะ GitHub Pages, claude.ai และ `http://localhost` เป็น secure context ทั้งหมด (ความเชื่อมั่น กลาง)
- **API ข้างเคียงที่ iframe ส่งผล:** `navigator.vibrate` บน Chrome ใช้ไม่ได้ใน iframe ข้ามโดเมนตั้งแต่ Chrome 55 และต้องมี user gesture ตั้งแต่ Chrome 60 [I2]; Pointer Lock ใช้ไม่ได้ใน iframe แบบ sandbox ที่ไม่มี `allow-pointer-lock` [I28]; Keyboard Lock ต้องใช้กับโหมดเต็มจอของ top-level browsing context [I21] ทุกข้อจึงต้อง feature-detect ตอนรันและแสดงข้อความภาษาไทยเมื่อใช้ไม่ได้

### 11.2.4 การรองรับของเบราว์เซอร์ (MDN browser-compat-data, ดึงจาก GitHub เดือน 11/2026 [I2])

| ความสามารถ | Chrome/Edge | Firefox | Safari macOS | iOS/iPadOS | Android |
|---|---|---|---|---|---|
| `Gamepad`, `getGamepads()` | 21 (ไม่มี prefix ตั้งแต่ 35) / Edge 12 | 29 | 10.1 | mirror ของ Safari | Chrome mirror, Firefox 32 |
| `vibrationActuator.playEffect('dual-rumble')` | 68 | ไม่มี | 16.4 | ไม่มี | Chrome mirror (WebView ไม่มี) |
| `"trigger-rumble"`, `effects` | 126 | ไม่มี | ไม่มี | ไม่มี | mirror |
| `hapticActuators` / `pulse()` (Gamepad Extensions) | ไม่มี (Edge Legacy 15–79) | 55 | ไม่มี | ไม่มี | — |
| Permissions-Policy `gamepad` | 103 | ไม่มี | ไม่มี | — | — |
| WebHID `navigator.hid` | 89 (เดสก์ท็อป) | ไม่มี | ไม่มี | ไม่มี | ไม่มี |
| Keyboard Lock / `getLayoutMap()` | 68 / 69 | ไม่มี | ไม่มี | — | — |
| `navigator.vibrate` | 32 (BCD ระบุทั้งเดสก์ท็อปและ Android; Android: ใช้ไม่ได้ใน iframe ข้ามโดเมนตั้งแต่ 55, ต้องมี user gesture ตั้งแต่ 60) | เดสก์ท็อป 16–128 (ถอดออกใน 129); Android 79+: คืน `true` แต่ไม่สั่น | ไม่มี | ไม่มี | Chrome 32 |

ผลต่อการออกแบบ: ทุกฟีเจอร์ต้องมีทางเลือกสำรอง เพราะผู้ใช้ Firefox และ iPad ใช้จอยได้แต่สั่นไม่ได้ ส่วนผู้ใช้ Safari บน Mac สั่นได้ แต่ไม่มี `effects` ให้ตรวจล่วงหน้า (Safari มี `canPlayEffectType` ซึ่ง BCD ระบุว่า deprecated [I2]) วิธีที่ใช้ได้ทุกที่คือเรียก `playEffect('dual-rumble', …)` ใน `try/catch` แล้วจำไว้ว่าอุปกรณ์นี้สั่นได้หรือไม่

### 11.2.5 ข้อควรระวังเฉพาะอุปกรณ์
- **รูปแบบ `id`:** สเปกไม่กำหนดรูปแบบ บอกเพียงว่าระบุรุ่นได้ เช่นด้วย `idVendor`/`idProduct` และห้ามมี serial number [I1] Firefox ใช้ `vvvv-pppp-ชื่อ` แต่ตัวอย่างใน MDN คือ "810-3-USB Gamepad" (ตัดศูนย์นำหน้า) [I3] ส่วน Chrome ใช้ "Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)" [I6] `parseGamepadId` จึงรองรับทั้งสองแบบและเติมศูนย์ให้ครบ (T-I-11)
- **อาจถูกตัดเพื่อกัน fingerprinting:** สเปกอนุญาตให้เบราว์เซอร์รายงานจำนวนปุ่มและแกนเท่าผังมาตรฐาน "even if more or fewer inputs are present" [I1] อุปกรณ์ที่มีแกนมาก (HOTAS) จึงอาจเห็นไม่ครบในบางเบราว์เซอร์ wizard ต้องรายงานให้ผู้ใช้รู้เมื่อหาแกนที่ต้องการไม่เจอ
- **Trigger:** ในผังมาตรฐานเป็น `buttons[6]`/`[7]` ที่มี `value` แบบ analog [I1] แต่บนอุปกรณ์ที่ไม่ได้ map เบราว์เซอร์อาจรายงาน trigger เป็นแกนที่มีค่าพักไม่ใช่ศูนย์ ข้อนี้**ยังไม่ยืนยัน**ด้วยเอกสาร จึงให้ wizard บันทึกค่าพักจริงเสมอ ไม่อนุมานเอาเอง
- **คันเร่ง HOTAS:** ตามสเปก ดันไปหน้า = −1 [I1] FlightGear จึงแปลงคันเร่งด้วย `(1 − val)/2` (val −1 → 1 คือเต็ม) [I15] และ README ให้ตัวอย่าง offset −1, factor −0.5 ซึ่งให้ผลเดียวกัน [I12] ดังนั้นการผูกคันเร่งต้องเป็นแบบ unipolar ที่บันทึก rest/full (11.3.1) ไม่ใช่สมมุติว่า +1 คือเต็ม
- **Pedals เป็นอีกอุปกรณ์หนึ่ง และ toe brake มีเครื่องหมายต่างกัน:** FlightGear แปลง toe brake ของ Saitek Pro Flight Rudder Pedals ด้วย `(raw + 1)·0.5` (แกน 0 ซ้าย, 1 ขวา; พักที่ −1) แต่ของ Thrustmaster T-Rudder ด้วย `(raw − 1)·(−0.5)` (แกน 1 ซ้าย, 0 ขวา; พักที่ +1) และแกน rudder ทั้งสองรุ่นใช้ `power` 2 [I16] จึงต้องปรับเทียบ ไม่ใช่เดา
- **ลำดับแกนจาก FlightGear ใช้เป็นแค่คำใบ้:** FlightGear อ่านจาก API จอยของระบบปฏิบัติการ ลำดับแกนในเบราว์เซอร์จึงอาจต่างไป (ความเชื่อมั่น ต่ำ)

### 11.2.6 การสั่น (haptics)
`GamepadHapticActuator.playEffect(type, params)` มีสองแบบ คือ `"dual-rumble"` ซึ่งเป็นมอเตอร์ ERM สองตัวในด้ามจับ และ `"trigger-rumble"` ซึ่งเพิ่มมอเตอร์ใน trigger ทั้งสองแบบเป็น "fixed-duration, constant-intensity vibration" [I1] พารามิเตอร์มี `duration` และ `startDelay` (ms) และ `strongMagnitude` (มอเตอร์ความถี่ต่ำ) กับ `weakMagnitude` (ความถี่สูง) อยู่ในช่วง [0..1] ส่วน `leftTrigger`/`rightTrigger` ใช้กับ trigger-rumble เท่านั้น [I1, I31] ฝั่ง XInput ก็ระบุเช่นกันว่า "the right motor is the high-frequency motor, the left motor is the low-frequency motor" [I7] ถ้าเรียกครั้งใหม่ขณะเอฟเฟกต์เดิมยังเล่นอยู่ เอฟเฟกต์เดิมจะถูกแทนที่และ promise ของมัน resolve เป็น `"preempted"` [I1] (MDN อธิบายตรงกัน [I31] แต่ผู้ตรวจทานไม่ได้เปิดหน้านั้นซ้ำ) และ "It is RECOMMENDED that the user agent use a maximum of 5 seconds" [I1] สรุปคือไม่มี spring, damper หรือ constant force การสั่นต่อเนื่องจึงต้องต่ออายุเป็นช่วง ๆ (11.6.2)

## 11.3 การปรับแต่งสัญญาณ (signal shaping)

ลำดับที่เสนอสำหรับแกนที่คืนกลางเอง (stick, yoke, pedals, touch):

$$y=\operatorname{clamp}\Big(g\cdot f\big(D(\,s\cdot C(r)\,)\big),-1,1\Big)$$

$r$ ค่าดิบจาก API (−1…1), $C$ การปรับเทียบ (11.3.1), $s\in\{+1,-1\}$ การกลับทิศ, $D$ dead zone (11.3.2), $f$ เส้นโค้งตอบสนอง (11.3.3), $g$ gain หรือความไว (ค่าเริ่ม 1) ผลลัพธ์ $y$ ไม่มีหน่วย จากนั้นชั้นบนเป็นผู้แปลง $y$ เป็นมุมพื้นบังคับ (DIRECT ปัจจุบัน), คำสั่งอัตรา (ASSIST) หรือแรงที่คัน (โหมดแรงของหัวข้อ 6.7.2) ชั้นนี้จึงไม่ต้องรู้จักเครื่องบิน และใช้ซ้ำได้กับ C172, DA40 และเครื่องโดยสารในรอบต่อไป

### 11.3.1 การปรับเทียบ (calibration)
แกนสองทิศ (คืนกลาง) ใช้สเกลเชิงเส้นแยกครึ่ง เพื่อชดเชยศูนย์ที่เยื้องและช่วงที่ไม่สมมาตร

$$C(r)=\begin{cases}\dfrac{r-c}{r_{max}-c}, & r\ge c\\[6pt]\dfrac{r-c}{c-r_{min}}, & r<c\end{cases}\qquad \text{แล้วจำกัดไว้ใน }[-1,1]$$

$c$ ค่าเฉลี่ยตอนพัก (ปล่อยมือ 2 s), $r_{min}, r_{max}$ ค่าต่ำสุดและสูงสุดตอนให้ผู้ใช้โยกจนสุดทุกทิศ ทั้งหมดมีหน่วยเดียวกับ $r$ วิธีนี้เหมือนขั้น "calibrate" (โยกสุดทุกแกน) แล้ว "centering" (ปล่อยมือแล้วกด Next) ในคู่มือ X-Plane 12 [I9]

คันโยกที่ไม่คืนกลาง (คันเร่ง, คันใบพัด/condition, toe brake) ใช้

$$u=\operatorname{clamp}\!\left(\frac{r-r_{rest}}{r_{full}-r_{rest}},0,1\right),\qquad u'=\operatorname{clamp}\!\left(\frac{u-e_0}{1-e_0-e_1},0,1\right)$$

$r_{rest}$ คือค่าที่ idle หรือตอนปล่อยเท้า, $r_{full}$ คือค่าที่เต็ม, $e_0$ และ $e_1$ คือ dead zone ที่ปลายทั้งสอง (เสนอ 0.02) เพื่อให้ถึง 0 และ 1 ได้แน่นอนแม้ potentiometer สึก สูตรนี้ใช้ได้ทั้งอุปกรณ์ที่ $r_{rest} > r_{full}$ (คันเร่งตามสเปก, T-Rudder) และ $r_{rest} < r_{full}$ (Saitek) โดยไม่ต้องมีตัวเลือก "invert" ตัวอย่าง: คันเร่ง $r_{rest}$ = +1, $r_{full}$ = −1 ให้ raw 1 → 0, 0 → 0.5, −1 → 1 ตรงกับ `(1 − val)/2` ของ FlightGear [I15] และ toe brake ทั้งสองรุ่นให้ 0 ตอนพักและ 1 ตอนกดสุด ตรงกับสูตรในไฟล์ของ FlightGear [I16] (T-I-03)

### 11.3.2 Dead zone
**ชนิด** (โค้ดอยู่ใน 11.8):

| ชนิด | สมการ | ข้อดี | ข้อเสีย | ใช้กับ |
|---|---|---|---|---|
| Axial แบบไม่ scale (FlightGear `dead-band` [I12], ASSIST ปัจจุบัน) | $x_d = x$ ถ้า $\lvert x\rvert>d$ มิฉะนั้น 0 | ง่าย | ค่ากระโดดจาก 0 เป็น $d$ ที่ขอบ | ไม่แนะนำ |
| Axial แบบ scale | $x_d=\operatorname{sgn}(x)\min\!\big(1,\max(0,\lvert x\rvert-d)/(1-d-d_o)\big)$ | ต่อเนื่อง แต่ละแกนแยกกัน | คันทแยงใกล้ศูนย์ถูกตัดทั้งสองแกน (0.1, 0.1) → (0.022, 0.022) | จอยบิน, yoke, pedals, trigger |
| Radial แบบไม่ scale (ตัวอย่าง XInput ส่วนแรก [I7]) | ศูนย์ถ้า $m=\sqrt{x^2+y^2}\le d$ | วงกลมสม่ำเสมอ | กระโดดที่ขอบ | — |
| **Radial แบบ scale** (ตัวอย่างโค้ด XInput ที่ "adjust magnitude relative to the end of the dead zone" แล้ว normalize [I7]) | $(x_d,y_d)=\dfrac{\min\!\big(1,\max(0,m-d)/(1-d-d_o)\big)}{m}(x,y)$ | ต่อเนื่อง คงทิศของคันไว้ | แกนเดี่ยวได้ค่าเล็กกว่า axial นิดหน่อยเมื่ออีกแกนไม่ใช่ศูนย์ | thumbstick, touch |

$d$ คือ dead zone ใน (สัดส่วนของช่วงแกน), $d_o$ คือ outer หรือ extremity dead zone ที่ทำให้ถึง ±1 ก่อนสุดกลไก (เสนอ 0.02) MSFS มีตัวตั้ง "Extremity dead zone" ที่ผู้ใช้คนหนึ่งอธิบายว่า "cuts off the end of each travel maximum" แต่อีกคนในกระทู้เดียวกันเขียนว่า "The extremity deadzone reduces the max deflection of control input" ซึ่งตีความกลับกัน (ถึงสุดก่อนปลายกลไก กับ ไปไม่ถึงสุด) และไม่มีคำตอบจากผู้พัฒนา (แหล่งชุมชน ความเชื่อมั่น ต่ำ [I11]) $d_o$ ในรายงานนี้ใช้ความหมายแรก

**ค่าอ้างอิง:** XInput นิยาม `XINPUT_GAMEPAD_LEFT_THUMB_DEADZONE` = 7849, `RIGHT` = 8689 และ `TRIGGER_THRESHOLD` = 30 [I7] จากช่วงแกน −32768…32767 และ trigger 0–255 [I8] คิดเป็น 0.240, 0.265 และ 0.118 ของช่วง (หารเอง) Microsoft เองยังเตือนว่า "some controllers are more sensitive than others, thus the dead zone may vary from unit to unit" [I7] FlightGear ระบุค่าเริ่ม dead-band 0.1 ของ elevator/aileron ว่า "very forgiving" และแนะนำ 0 สำหรับคันเร่ง [I12] หัวข้อ 6 เสนอ 0.08 ซึ่งอยู่ในช่วงนี้ ข้อเสนอนี้จึงคงค่า **0.08 แบบ scaled radial** สำหรับ thumbstick, ใช้ **0.03 แบบ axial** สำหรับจอยบินและ pedals (ค่าประมาณ) และให้ wizard ปรับขึ้นเองจากสัญญาณรบกวนที่วัดได้:

$$d=\operatorname{clamp}\!\left(\frac{k\,n_{rest}}{h}+m_d,\;0.03,\;0.25\right),\quad k=1.5,\; m_d=0.02$$

$n_{rest}$ คือส่วนเบี่ยงเบนสูงสุดจากค่าเฉลี่ยตอนพัก (หน่วยเดียวกับ $r$), $h$ คือครึ่งช่วงหลังปรับเทียบ (≈ 1) ตัวอย่างสังเคราะห์: ศูนย์ 0.03 ± 0.01 ได้ $d$ = 0.035 (T-I-04) ข้อดีของ scaled dead zone คือได้ทั้งความนิ่งที่ศูนย์และความละเอียดเต็มช่วง: ความชันของผลลัพธ์ที่ขอบ dead zone คือ $(1-e)/(1-d)$ = 0.543 เมื่อ $d$ = 0.08 และ $e$ = 0.5

### 11.3.3 เส้นโค้งตอบสนอง (response curve)
| แบบ | สมการ | ที่มา | ค่าที่ $x$ = 0.5 |
|---|---|---|---|
| Expo แบบ RC | $f_e(x)=(1-e)x+e x^3$, $0\le e\le 1$ ($e$ = 1 คือกำลังสามล้วน ความชันที่ศูนย์เป็น 0) | ใช้ทั่วไป; XInput แนะนำให้ "cube the result" สำหรับเกมขับรถ [I7] | $e$ = 0.5: 0.3125; $e$ = 1: 0.125 |
| Power รักษาเครื่องหมาย | $f_p(x)=\operatorname{sgn}(x)\lvert x\rvert^{p}$ | FlightGear `property-scale` รับ `power` เป็นจำนวนเต็ม (2 = `squared`) และคงเครื่องหมายให้กำลังคู่ [I13]; ไฟล์ pedals ใช้ power 2 [I16] | $p$ = 2: 0.25; $p$ = 3: 0.125 |
| เส้นหักกำหนดเอง (PWL) | สมมาตรคี่ ผ่านจุด $(x_i,y_i)$ | X-Plane 11.30+ ให้สร้าง custom curve ต่อแกนที่ "will *override* the global control response curve" และใช้ทำ null zone เองได้ [I10, I9] | ตามจุด |
| ตัวเลื่อนของ X-Plane | ซ้ายสุด "completely linear"; ขวาสุด โยกครึ่งทาง "may only deflect the aircraft's controls by 10%" [I9] | — | 0.1 ⇒ เทียบ $p=\ln0.1/\ln0.5$ = 3.32 (คำนวณเอง) |
| MSFS | ตัวตั้ง Sensitivity −/+, Dead zone, Extremity dead zone, Neutral, Reactivity ไม่พบเอกสารทางการที่อธิบายสมการ มีแต่กระทู้ผู้ใช้ [I11] | ทุติยภูมิ | — |

**ข้อเสนอ:** ใช้ expo แบบ RC เป็นค่าเริ่ม เพราะความชันที่ศูนย์ไม่เป็นศูนย์ (ต่างจาก power ซึ่งความชันที่ศูนย์เป็น 0 ทำให้ผู้ใช้รู้สึกว่าคันมี "รู" ตรงกลาง) และ $e$ หาค่าผกผันได้ด้วยสมการกำลังสามที่ทางเดียว ค่าเริ่มที่เสนอ: gamepad และ touch $e$ = 0.5 (เท่าหัวข้อ 6), จอยบินและ pedals $e$ = 0.3, ช่วงในหน้าตั้งค่า 0–0.9 (ป้าย "ความไวรอบกลาง") ส่วน PWL เก็บไว้สำหรับผู้ใช้ขั้นสูง ค่าที่ได้จากชุด $d$ = 0.08 และ $e$ = 0.5: f(0.1) = 0.0109, f(0.25) = 0.0955, f(0.5) = 0.2758, f(0.75) = 0.5573, f(1) = 1 (T-I-01)

### 11.3.4 การกรองสัญญาณ (smoothing)
หัวข้อ 6.5.1 ตั้งงบ time delay ของทั้งเส้นทางไว้ ≤ 0.10 s และสรุปว่า "ไม่ควรเพิ่ม lag ใดอีกโดยไม่จำเป็น" ฟิลเตอร์อันดับหนึ่งที่ cutoff $f_c$ หน่วงสัญญาณ ramp ไป $\tau = 1/(2\pi f_c)$: 1 Hz หน่วง 0.159 s ซึ่งเกินงบทั้งก้อน ส่วน 5 Hz หน่วง 0.032 s **ข้อเสนอคือปิดการกรองไว้โดยปริยาย** และเปิดใช้ **1€ filter** [I18] เฉพาะเมื่อ wizard วัดสัญญาณรบกวนตอนพักได้เกิน 0.01 (เช่น potentiometer เก่า)

$$\hat X_i=\alpha X_i+(1-\alpha)\hat X_{i-1},\quad \alpha=\frac{1}{1+\tau/T_e},\quad \tau=\frac{1}{2\pi f_c},\quad f_c=f_{c,min}+\beta\left|\dot{\hat X}_i\right|$$

$T_e$ คือคาบการสุ่ม (s), $f_{c,min}$ คือ cutoff ต่ำสุด (Hz), $\beta$ คือสัมประสิทธิ์ความเร็ว (ไม่มีหน่วยเมื่อ $X$ เป็นสัดส่วนช่วงแกน เพราะ $f_c$ [1/s] = $\beta\,|\dot X|$ [1/s]; ถ้า $X$ มีหน่วย $\beta$ จะมีหน่วย 1/หน่วยของ $X$), อนุพันธ์ $\dot{\hat X}$ กรองด้วย cutoff คงที่ 1 Hz ตามบทความ [I18] (ข้อความในฉบับเต็มว่า "Our implementation uses a fixed value of 1 Hz" **ยังไม่ยืนยัน**ในการตรวจทาน เพราะเปิด HAL ไม่ได้ ความเชื่อมั่น กลาง) หลักของฟิลเตอร์ตามหน้าโครงการคือ "decreasing fcmin reduces jitter but increases lag" ฟิลเตอร์จึงเพิ่ม $f_c$ เมื่อสัญญาณเคลื่อนเร็ว [I18] จำลองที่ 60 Hz (`i11_expected.mjs`): $f_{c,min}$ = 2 Hz, $\beta$ = 2 ให้ lag 0.046 s เมื่อโยกช้า 0.2/s, 0.016 s เมื่อโยกเร็ว 2/s และลดสัญญาณรบกวนเหลือ RMS 0.32 เท่า เทียบกับ $f_{c,min}$ = 1 Hz, $\beta$ = 1 ที่ให้ 0.076 s / 0.026 s / 0.23 เท่า จึงเลือก 2 Hz/2 เพราะอยู่ในงบ 0.05 s ทั้งสองกรณี (T-I-13) วิธีจูนของผู้เขียนคือตั้ง β = 0 แล้วปรับ fcmin จนหายสั่น จากนั้นเพิ่ม β จน lag หาย [I18] ซึ่งนำไปทำเป็นขั้นตอนอัตโนมัติใน wizard ได้

### 11.3.5 ผลของ shaping ต่อการบินจริงในโมเดลปัจจุบัน
(DIRECT, 95 kt, แฟลปลง, คันค้าง 2.5 s; `i11_current.mjs`, `i11_current2.mjs`)

| ระยะคันจริง | เชิงเส้น: Δn / α สูงสุด | d 0.08 + e 0.5: คำสั่ง / Δn / α สูงสุด |
|---|---|---|
| 0.10 | +0.25 g / 4.9° | 0.011 / +0.02 g / 2.0° |
| 0.25 | +0.58 g / 9.7° | 0.096 / +0.24 g / 4.8° |
| 0.28 | +0.63 g / 10.8° (เตือน) | — |
| 0.30 | +0.65 g / 11.6° (เตือน) | 0.126 / +0.31 g / 5.7° |
| 0.45 | — | 0.234 / +0.55 g / 9.2° |
| 0.50 | +0.71 g / 26.7° (stall) | 0.276 / +0.62 g / 10.6° (เตือน) |

ระยะคันจนถึงสัญญาณเตือนเพิ่มจาก 0.28 เป็น 0.50 ถ้าต้องการเลื่อนจุดเตือนไปที่ราว 0.58 ใช้ $e$ = 0.7 ได้ (แก้สมการกำลังสามหาคำสั่ง ≈ 0.27 ที่เริ่มเตือน) แต่ถ้าเปลี่ยนไปใช้โหมดแรงของหัวข้อ 6 ความไวต่อ g จะคงที่ทุกความเร็ว และค่า $e$ ควรจูนใหม่ในโหมดนั้น

## 11.4 คีย์บอร์ด

### 11.4.1 ใช้ `KeyboardEvent.code` ไม่ใช้ `.key` (แป้นภาษาไทย)
`code` "represents a physical key on the keyboard … this property returns a value that isn't altered by keyboard layout or the state of the modifier keys" [I19] สเปก UI Events ระบุเช่นกันว่า code อ้างตำแหน่งกายภาพของคีย์และ "do not vary based on the user's" layout [I19] เมื่อผู้ใช้เปิดแป้นเกษมณีอยู่ คีย์ W จะได้ `key` = "ไ" แต่ได้ `code` = "KeyW" เท่าเดิม โค้ดปัจจุบันใช้ `e.code` อยู่แล้ว (90-app.js:335) จึงถูกต้อง ส่วนป้ายที่แสดงบนหน้าตั้งค่าให้ใช้ `navigator.keyboard.getLayoutMap()` เมื่อเบราว์เซอร์มี (Chrome 69+ [I2], ตัวอย่าง `keyboardLayoutMap.get("KeyW")` [I20]) ถ้าไม่มีให้แสดงชื่อแป้นแบบ QWERTY พร้อมคำอธิบายว่าเป็นตำแหน่ง ไม่ใช่ตัวอักษร

### 11.4.2 Ramp แบบสัดส่วนและการคืนกลาง
$$v_{k+1}=v_k+\operatorname{clamp}\big(v^*-v_k,\,-r\,\Delta t,\,r\,\Delta t\big),\qquad v^*=s\,c\,\phi$$

$v$ คือคำสั่งคัน (−1…1), $s\in\{-1,0,+1\}$ คือคีย์ที่กดอยู่ (ทั้งสองคีย์ = 0), $c$ คือเพดาน (1), $\phi$ คือตัวคูณโหมดละเอียด (0.5 เมื่อกด Shift ค้าง มิฉะนั้น 1), $\Delta t$ คือคาบเฟรม (s), $r$ คืออัตรา (1/s) ซึ่งเลือกดังนี้: $r_{up}\phi$ เมื่อกดทิศเดียวกับ $v$, $r_{back}$ เมื่อปล่อย และ $\max(r_{up},r_{back})$ เมื่อกดทิศตรงข้ามขณะคันยังเบี่ยงอยู่ ให้ผ่านศูนย์ได้เร็ว

**เทียบกับแหล่งอื่น:** FlightGear ไม่คืนกลาง กดหนึ่งครั้งเพิ่ม elevator/aileron 0.05 แบบ `repeatable` และมี Numpad 5 ไว้คืนกลาง [I14, I15] อัตราจริงจึงขึ้นกับ key repeat ของระบบปฏิบัติการ ซึ่งบน Windows ตั้งได้ตั้งแต่ "approximately 2.5" ถึง "approximately 30 repetitions per second" [I23] คือ 0.125–1.5/s ต่างกัน 12 เท่า **ห้ามผูก ramp กับ key repeat** ให้คิดตามเวลาเฟรม เหมือน `slewProp` ของ FlightGear ที่ "Slews a property smoothly, without dependence on the simulator frame rate" [I15]

**ค่าที่เสนอ** (ค่าประมาณ): pitch $r_{up}$ = 0.5/s, $r_{back}$ = 2.5/s; roll 1.0/3.0; rudder 1.0/2.0 (ปัจจุบัน 2.0–2.5/5.0) ใน DIRECT ที่ 95 kt ต้องใช้คัน 0.431 ต่อ g (หัวข้อ 6) อัตรา 0.5/s จึงเท่ากับ ≈ 1.16 g/s ตรงกับ ramp แรง 45 N/s ≈ 1.1 g/s ของหัวข้อ 6.7.2 ส่วนค่าปัจจุบันเท่ากับ ≈ 4.6 g/s ผลที่คาด: แตะหนึ่งเฟรมได้ 0.0083 (ปัจจุบัน 0.0333), ค้าง 0.3 s ได้ 0.15, ถึงสุดใน 2.0 s, คืนกลางใน 0.40 s, กดกลับทิศจาก 0.5 นาน 6 เฟรมได้ 0.25, Shift ค้าง 2 s ได้ 0.5 (T-I-05) บนเครื่อง: ค้าง 0.3 s แล้วปล่อยได้ Δn +0.074 g เทียบกับ +0.401 g ในปัจจุบัน (T-I-06) สำหรับ roll อัตราม้วนคงตัวที่ aileron เต็มประมาณ $-(C_{l\delta a}/C_{lp})(2V/b)\delta_{a,max}$ ≈ 65 °/s ที่ 95 kt (ค่าประมาณจาก `AC`) กดค้าง 0.3 s จึงได้ ≈ 20 °/s

**สองโหมดให้เลือก:** (1) "สปริง" (ค่าเริ่ม) ตามสมการข้างบน เหมาะกับมือใหม่และ ASSIST (2) "ค้างตำแหน่ง" แบบ FlightGear กดค้างแล้วคันเลื่อนที่อัตรา $r_{up}$ ปล่อยแล้วคันอยู่ที่เดิม มีคีย์ Numpad 5 (`centre`) คืนกลาง [I14] โหมดนี้ใกล้กับการบินจริงที่ใช้คันเฉพาะช่วงเปลี่ยนแล้ว trim ออก แต่ต้องมี trim ที่ใช้ได้ก่อน

**การแตะสั้นกว่าหนึ่งเฟรม:** เก็บคีย์เป็นสองชุด คือ `held` (กดอยู่ตอนนี้) และ `tapped` (มี keydown ตั้งแต่เฟรมก่อน) แล้วให้ `readInputs` ถือว่าคีย์ใน `tapped ∪ held` ถูกกดตลอดเฟรมนั้น จากนั้นล้าง `tapped` การแตะสั้นจึงให้ $r_{up}\Delta t$ เสมอ ไม่หายไป (T-I-09)

### 11.4.3 Trim, แฟลป, ล้อ และเบรก
- **Trim:** คีย์ส่งแค่ทิศ ($\pm1$) อัตราเป็นของเครื่อง (`trim_rate` ในหัวข้อ 6) FlightGear ใช้ `TRIM_RATE = 0.045`/s บนช่วงเต็ม 2.0 [I15] คือ 44 s จากสุดถึงสุด และคีย์ Home/End, Numpad 7/1 เพิ่ม 0.001 ต่อ repeat [I14] ก่อนมีโมเดล tab ให้ใช้อัตราชั่วคราว 0.5 °/s ของ `trimDe` ในโหมด DIRECT ≈ 2.9 kt/s ของความเร็ว trim ที่ 95 kt แฟลปลง (0.171 °/kt จาก `c6_current.mjs`; ค่าประมาณ) และเพิ่มตัวเลือกปิด auto-trim (20-flight.js:469) AATD ของ FAA ก็ต้องมี "Pitch trim (manual or electric pitch trim)" [I30, C.3.1.7]
- **แฟลป:** คีย์ toggle เลื่อนไปขั้น (detent) ถัดไปในชุด `flap_notches` ของเครื่อง สำหรับเครื่องฝึกเสนอ [0, 0.5, 1] = UP, T/O, LDG (ค่าประมาณ) ค่าเริ่มของ FlightGear คือ "Hard-coded flaps movement in 3 equal steps" [I15] คำสั่งจากคีย์คือตำแหน่งเป้าหมาย การเคลื่อนจริงใช้อัตรา actuator ของเครื่อง (ตอนนี้ 0.15/s, 20-flight.js:246) ถ้าคำสั่งอยู่ระหว่างขั้น ให้ไปขั้นถัดไปในทิศที่กด (0.3 กางเพิ่ม → 0.5) (T-I-10)
- **ล้อ:** G สลับขึ้น/ลง ตอบสนองเฉพาะ `!e.repeat` FlightGear ใช้ g/G แยกขึ้นกับลง [I14] แต่เมื่อใช้ `e.code` ตัวพิมพ์ใหญ่กับเล็กเป็นคีย์เดียวกัน จึงใช้การสลับแทน และควรล็อกไม่ให้เก็บล้อขณะ weight-on-wheels
- **เบรก:** B = ทั้งสองข้าง (เหมือน "Apply all brakes" ของ FlightGear [I14]), Z/X = ซ้าย/ขวา (หัวข้อ 6), Shift+B = parking brake เบรกจากคีย์ไต่ถึงเต็มใน 0.5 s ตาม `fullBrakeTime` [I15] และ $b_{L}=\max(k_L,k_B,P)$, $b_{R}=\max(k_R,k_B,P)$ ($k$ = คีย์หรือ toe brake, $P$ = parking) ฝั่งโมเดลต้องแยก `brakeL`/`brakeR` เพราะตอนนี้ล้อหลักใช้ `this.brake` ค่าเดียว (20-flight.js:217) เชื่อมกับหัวข้อ 7
- **คันเร่ง:** อัตรา 0.35/s คงเดิม ใกล้กับ FlightGear 0.01 ต่อ repeat (≈ 0.3/s ที่ 30 Hz) [I14] แต่ย้ายคีย์ไปที่ `Equal`/`Minus` (+/−), PageUp/PageDown และ Numpad 9/3 (FlightGear [I14])

### 11.4.4 Keymap ที่เสนอ (ค่าเริ่ม, ใช้ `code`)

| หน้าที่ | ปัจจุบัน | ที่เสนอ | FlightGear [I14] |
|---|---|---|---|
| Pitch ดัน/ดึง | W/S, ↑/↓ | W/S, ↑/↓, Numpad 8/2 | ↑/↓, 8/2 |
| Roll | A/D, ←/→ | A/D, ←/→, Numpad 4/6 | ←/→, 4/6 |
| Rudder | Q/E | Q/E, Numpad 0/Enter | 0/Enter, Insert |
| คืนกลางทุกแกน | — | Numpad 5 | 5 |
| คันเร่ง | Shift/**Ctrl** | `=`/`−`, PageUp/PageDown, Numpad 9/3 | 9/3, PageUp/PageDown |
| โหมดละเอียด | — | Shift (กดค้าง) | — |
| Trim หัวลง/หัวขึ้น | — | `[`/`]`, Home/End, Numpad 7/1 | 7/1 และ Home/End: +0.001/−0.001 ต่อ repeat (เครื่องหมายเดียวกับ 8 ซึ่งเป็น "Elevator down") |
| Rudder trim | — | `,`/`.` (หัวข้อ 6) | `,`/`.` = เบรกซ้าย/ขวา |
| แฟลปเก็บ/กาง | — | V/F (หัวข้อ 6) | `[`/`]` |
| ล้อ | — | G (สลับ) | g ขึ้น / G ลง |
| เบรก ทั้งคู่/ซ้าย/ขวา/จอด | B | B / Z / X / Shift+B | b / `,` / `.` / B |
| กล้อง, รับช่วง, pause, เริ่มใหม่ | C, T, P, R | คงเดิม แต่ต้องไม่ทำงานซ้ำเมื่อกดค้าง | p = pause |

ความต่างจาก FlightGear ตรงคีย์ `[ ] , .` เกิดจากที่หัวข้อ 6 เสนอไว้ก่อน รายงานนี้เลือกตามหัวข้อ 6 เพื่อให้ทั้งรอบสอดคล้องกัน และระบุความต่างไว้ใน 11.11 เนื่องจากผู้ใช้เปลี่ยนการผูกคีย์ได้ (11.5) ค่าเริ่มจึงไม่ผูกมัด

### 11.4.5 กับดักของเบราว์เซอร์
1. **คีย์ลัดที่สงวนไว้:** Chrome มีคีย์ลัดที่ "are not sent to the web app" คือ "Ctrl/Cmd + (T | W | N)" และ "Ctrl/Cmd + Shift + (T | W | N)" ส่วนในโหมดเต็มจอ Chrome จะส่งคีย์เหล่านี้ให้หน้าเว็บก่อน [I22] **กฎ:** keymap ห้ามมี Control, Meta หรือ Alt และฟังก์ชัน `resolveKey` ต้องคืน `null` ทุกครั้งที่ `ctrlKey || metaKey || altKey` เพื่อไม่ขวางคีย์ลัดของเบราว์เซอร์ (เช่น Ctrl+R, Ctrl+L) (T-I-07)
2. **`preventDefault`:** ขณะ `state === 'fly'` ให้เรียกกับทุกคีย์ที่ผูกไว้และไม่มีตัวปรับ เพราะ PageUp/PageDown, Home/End, ลูกศร และ Space จะเลื่อนหน้าเว็บ ไม่ใช่แค่ลูกศรอย่างที่ทำอยู่
3. **Key repeat:** ต้องเช็ก `e.repeat` กับคีย์แบบ toggle (กล้อง, รับช่วง, pause, แฟลป, ล้อ, parking brake) ส่วนคีย์แบบค้าง (แกน, trim, เบรก) ต้องอ่านสถานะ held ไม่ใช่นับเหตุการณ์ (T-I-08)
4. **Focus:** นอกจาก `blur` แล้ว ให้ฟัง `visibilitychange` ด้วย เมื่อ `hidden` ให้ล้างคีย์, หยุดการสั่น และหยุดเวลาในโหมดฝึก
5. **Keyboard Lock:** `navigator.keyboard.lock(['KeyW', …])` ทำให้หน้าเว็บได้รับ Ctrl+W ด้วย แต่ใช้ได้เฉพาะเมื่ออยู่ในโหมดเต็มจอ [I21, I20] มีเฉพาะ Chromium [I2] และสเปกเองบอกว่า API นี้ทำงานแบบ "best effort" [I21] ใช้เป็นตัวเสริมเมื่อปุ่ม "เต็มจอ" เปลี่ยนไปเรียก Fullscreen API จริงแล้วเท่านั้น ไม่ใช่ทางแก้หลักของข้อ 1

## 11.5 การผูกอุปกรณ์ (device mapping): จอย, HOTAS, pedals, yoke

### 11.5.1 ช่องควบคุมเชิงตรรกะ (logical channels)
ทุกแหล่งอินพุตแปลงเข้าสู่ช่องชุดเดียวกัน แล้ว `Flight.input` รับเฉพาะช่องเหล่านี้ ทำให้ 20-flight.js ไม่ต้องรู้ว่าอินพุตมาจากอะไร

| ช่อง | ชนิด | ช่วง | หมายเหตุ |
|---|---|---|---|
| `x` roll, `y` pitch (+ดึง), `rud` (+ขวา) | สองทิศ คืนกลาง | −1…1 | มีอยู่แล้วใน `Flight.input` (20-flight.js:596) |
| `thr` (คันเร่ง/power lever), `prop`, `cond` | คันโยก | 0…1 | `prop`/`cond` สำหรับ PT6A และเครื่องรอบถัดไป (หัวข้อ 4) |
| `brakeL`, `brakeR`, `parking` | คันโยก/ปุ่ม | 0…1 | ต้องแยกในโมเดล (11.4.3) |
| `trimPitch`, `trimRud` | อัตรา | −1, 0, +1 | ทิศเท่านั้น อัตราเป็นของเครื่อง |
| `flapsCmd` | ขั้น | ค่าใน `flap_notches` | เปลี่ยนเฉพาะที่ขอบของการกด |
| `gearCmd`, `takeCtl`, `camera`, `pause` | ขอบของการกด | — | ใช้ `!repeat` และการตรวจขอบขาขึ้นของปุ่ม gamepad |

ข้อกำหนด BATD ของ FAA ระบุชุดเดียวกันนี้เป็นขั้นต่ำ: "A self-centering displacement yoke or control stick", "Self-centering rudder pedals", "Throttle or power control(s) that allows continuous movement from idle to full-power", ระบบ mixture/condition และ propeller ตามแบบเครื่อง, แฟลป, pitch trim และคันล้อ (B.3.2.1) และกำหนดว่า "Time from control input to recognizable system response must be without delay" (B.3.3.1) [I30] AC เดียวกันยังห้ามใช้ "keyboard, mouse, or gaming joystick" กับอุปกรณ์ที่จะขอรับรอง (B.3.1.1) [I30] AirfieldLab ไม่ได้ขอรับรอง แต่รายการนี้บอกได้ว่าช่องไหนสำคัญต่อการฝึก ลำดับความสำคัญคือ rudder pedals, trim, แฟลป และคันเร่งต่อเนื่อง

### 11.5.2 แบบจำลองข้อมูลการผูก (เก็บใน `localStorage`)
```json
{ "v": 1,
  "devices": {
    "06a3:0763": { "label": "Saitek Pro Flight Rudder Pedals", "idSeen": "…(Vendor: 06a3 Product: 0763)",
      "axes": [
        { "ch": "rud",    "axis": 2, "kind": "bipolar", "cal": { "min": -1, "center": 0.01, "max": 1 }, "invert": false, "dz": 0.03, "expo": 0.3 },
        { "ch": "brakeL", "axis": 0, "kind": "lever",   "cal": { "rest": -1, "full": 1 }, "dzIdle": 0.02, "dzFull": 0.02 },
        { "ch": "brakeR", "axis": 1, "kind": "lever",   "cal": { "rest": -1, "full": 1 }, "dzIdle": 0.02, "dzFull": 0.02 } ],
      "buttons": [] } },
  "keyboard": { "mode": "spring", "bindings": { "trimPitch-": ["BracketLeft", "Home", "Numpad7"] } } }
```
คีย์ของอุปกรณ์คือ `vendor:product` จาก `parseGamepadId` ถ้า parse ไม่ได้ให้ใช้ `id` ทั้งสตริง ถ้ามีอุปกรณ์รุ่นเดียวกันสองตัว ให้เติม `#n` ตามลำดับที่เห็น ใช้ตัวห่อ `store` ที่มีอยู่แล้ว (90-app.js:5) ซึ่งจับ exception ตอน storage ใช้ไม่ได้ เก็บเป็น JSON string ภายใต้คีย์ `afl-input-v1` และมี `v` ไว้ย้ายรูปแบบในอนาคต ห้ามเก็บสตริง `id` เต็มของผู้ใช้ไว้ที่อื่นนอกเครื่อง เพราะสเปกระบุว่า id ใช้ fingerprint ได้ [I1]

### 11.5.3 ขั้นตอนใน UI (ข้อความภาษาไทย)
1. "ตรวจพบ: T.Flight Hotas X (044f:b108) — ตั้งค่าเลยไหม" ถ้ามีโปรไฟล์ที่บันทึกไว้ ให้โหลดเลยโดยไม่ถาม
2. **ปล่อยมือ (2 s):** "วางมือออกจากคันบังคับและเท้าออกจากแป้น" แล้วบันทึกค่าเฉลี่ยและส่วนเบี่ยงเบนสูงสุดของทุกแกน (`restStats`) ขั้นนี้ได้ทั้งศูนย์ ($c$), สัญญาณรบกวน (→ $d$) และค่าพักของคันโยก ($r_{rest}$)
3. **เลือกแกนด้วยการขยับ:** วนทีละช่อง เช่น "ดึงคันบังคับเข้าหาตัวจนสุด" แล้วใช้ `detectAxis` หาแกนที่ห่างจากค่าพักมากที่สุด (เกณฑ์ 0.5) เครื่องหมายของการเคลื่อนที่ที่ผู้ใช้ทำตามคำสั่งบอก `invert` ได้ทันที เช่นสั่งให้ดึงแต่ค่าติดลบ ก็แปลว่าต้องกลับทิศ ใช้วิธีเดียวกันกับ "เหยียบเบรกเท้าซ้ายจนสุด" (ได้ $r_{full}$) และ "ดันคันเร่งไปหน้าสุด"
4. **โยกสุดทุกทิศ (4 s):** บันทึก $r_{min}, r_{max}$ ตามขั้น calibrate ของ X-Plane [I9]
5. **ทดลอง:** แสดงกราฟเส้นโค้ง (ค่าดิบ → ค่าที่ใช้) พร้อมจุดของค่าปัจจุบัน และตัวเลื่อน dead zone, expo, gain, invert แบบสด
6. **ปุ่ม:** "กดปุ่มที่ต้องการใช้เป็น trim หัวลง" แล้วจับขอบขาขึ้นของปุ่มแรกที่เปลี่ยน
โปรไฟล์ค่าเริ่มจากตาราง `device_hints` (11.9) ใช้แค่เติมคำตอบไว้ล่วงหน้าในขั้น 3 ผู้ใช้ยังต้องยืนยันด้วยการขยับทุกครั้ง เพราะลำดับแกนจาก FlightGear อาจไม่ตรงกับเบราว์เซอร์ (11.2.5) ส่วน vendor:product ยืนยันได้จากฐาน usb.ids [I26] เช่น 044f:b108 "T-Flight Hotas X Flight Stick", 044f:b679 "T-Rudder", 06a3:0763 "Pro Flight Rudder Pedals", 046d:c215 "Extreme 3D Pro", 045e:028e "Xbox360 Controller"

### 11.5.4 หลายแหล่งในช่องเดียว
ตัวอย่างคือคีย์บอร์ดกับ gamepad ที่วางพักไว้ ถ้าเอาค่ามาบวกกัน หรือให้ gamepad ทับค่าทุกเฟรม gamepad ที่อยู่ศูนย์จะลบคำสั่งจากคีย์บอร์ดทิ้ง กฎที่เสนอคือ **แหล่งที่ขยับออกจาก dead zone ล่าสุดเป็นผู้คุมช่องนั้น** ถ้าทุกแหล่งอยู่ที่ศูนย์ ให้คงแหล่งล่าสุดไว้อีก 0.5 s แล้วเป็น 0 (`arbitrate` ใน `i11_gamepad_profile.mjs`) ช่องคันโยก (คันเร่ง) ใช้กฎเดียวกัน เพื่อให้กด `=` ปรับคันเร่งได้แม้ HOTAS ค้างอยู่ที่ 40 % และเมื่อผู้ใช้ขยับคันเร่ง HOTAS ค่าจากคันจริงจะกลับมาคุม การสลับระหว่างแหล่งต้องไม่ทำให้ค่ากระโดด กรณีคันโยกที่ค่าไม่ตรงกัน ให้แสดงลูกศร "ขยับคันไปที่ 40 % เพื่อรับช่วง" แบบ pickup ของ throttle quadrant (ค่าเสนอ)

## 11.6 การสื่อแรงที่คันบนเว็บ

### 11.6.1 ตัวเลือก
| วิธี | สิ่งที่ส่งได้ | รองรับ | ต้นทุน | ข้อเสนอ |
|---|---|---|---|---|
| Rumble ผ่าน `playEffect` | buffet, ล้อบนทางวิ่ง, แรงกระแทกตอนแตะพื้น, stall (ด้วย buffet) | Chrome/Edge 68+, Safari 16.4+ [I2] | ต่ำ | **P2** |
| Trigger rumble | แยกซ้าย/ขวา เช่นเบรกล้อซ้ายลื่น | Chrome 126+ [I2] | ต่ำ | P3 |
| แถบแสดงแรง (หัวข้อ 6.7.3) | แรงที่คันใน lbf/N และแรงที่ต้องค้างเมื่อยังไม่ trim | ทุกที่ | ต่ำ | **P2** (หัวข้อ 6) |
| เสียง (Web Audio) | stall horn, ลมตามความเร็ว, เสียงล้อ | ทุกที่ | ต่ำ | **P2** |
| `navigator.vibrate` (มือถือ) | แตะพื้น, stall | Chrome Android; ไม่มีใน iOS; Firefox Android คืน true แต่ไม่สั่น; ใช้ไม่ได้ใน iframe ข้ามโดเมน [I2] | ต่ำ | P3 |
| WebHID + HID PID (force feedback จริง) | spring, damper, constant force | Chromium 89+ เดสก์ท็อปเท่านั้น [I2] | สูงมาก | ไม่ทำตอนนี้ |
| เมาส์เป็น yoke | ความรู้สึกต่อเนื่องดีกว่าคีย์ ไม่มีแรง | ทุกที่ (Pointer Lock) | กลาง | P3 |

### 11.6.2 การผสมสัญญาณ rumble
ใช้ช่วงอัปเดต $T_u$ = 0.1 s และ `duration` = 120 ms เหมือนหัวข้อ 1.6 เพราะ playEffect ครั้งใหม่ทับครั้งเก่า (ครั้งเก่าได้ผล `"preempted"` [I1]) และสเปกแนะนำให้ตัดที่ 5 s [I1] คาบ 0.1 s และ 120 ms เป็นค่าประมาณจากหัวข้อ 1.6 ไม่ได้มาจากสเปก

$$S=\operatorname{clamp}\Big(G\cdot\max\big(g_B\,B,\;k_{td}\big),0,1\Big),\qquad W=\operatorname{clamp}\Big(G\cdot\max\big(0.5\,g_B\,B,\;g_R\,\rho\,\min(1,V_g/30)\big),0,1\Big)$$

$$k_{td}=g_{TD}\operatorname{clamp}\!\left(\frac{\dot h_{td}-100}{600},\,0.15,\,1\right)\ \text{(เฉพาะ 150 ms หลังแตะพื้น)}$$

$S$ คือ `strongMagnitude` (มอเตอร์ความถี่ต่ำ), $W$ คือ `weakMagnitude` (ความถี่สูง) [I1, I7], $B\in[0,1]$ คือความแรง buffet จากหัวข้อ 1.6 ($g_b(X)$ ที่ normalize แล้ว), $V_g$ คือความเร็วพื้น (m/s), $\rho$ คือความขรุขระของผิว (คอนกรีต 0.15; ค่าประมาณ), $\dot h_{td}$ คืออัตราจมตอนแตะพื้น (fpm), $G$ คือ gain ของผู้ใช้ (ค่าเริ่ม 0.7) และ $g_B, g_R, g_{TD}$ คือ gain ของแต่ละช่อง (1) ตัวเลขทั้งหมดเป็นค่าประมาณ ตัวอย่างผลที่คาด (T-I-14, คิดที่ $G$ = 1 ไม่ใช่ค่าเริ่ม 0.7 เพื่อให้เห็นตัวผสมตรง ๆ; ที่ $G$ = 0.7 ทุกค่าคูณ 0.7): buffet 0.6 → S 0.6, W 0.3; วิ่งบนพื้น 30 m/s → W 0.15; แตะพื้น 400 fpm → S 0.5; 900 fpm → S 1.0 ตัวจัดเวลา `RumbleScheduler` เรียกได้ไม่เกิน 10 ครั้ง/วินาที และไม่เรียกเลยเมื่อทุกค่าเป็นศูนย์ ตอนเชื่อมกับ DOM ให้ห่อด้วย `try { await gp.vibrationActuator?.playEffect(type, params) } catch {}` และหยุดเมื่อ `visibilitychange`

### 11.6.3 ทำไมยังไม่ทำ force feedback ผ่าน WebHID
WebHID ตั้งใจให้ใช้กับอุปกรณ์ที่ high-level API ยังรองรับไม่ครบ และยกตัวอย่างเองว่า "flight simulators" เป็นหนึ่งในอุปกรณ์ HID [I24] แต่ (1) มีเฉพาะ Chrome/Edge 89+ บนเดสก์ท็อป ไม่มีใน Firefox, Safari และ Android [I2] (2) ต้องเรียก `requestDevice()` พร้อม transient activation แล้วให้ผู้ใช้เลือกอุปกรณ์จาก chooser [I24] (3) จอย force feedback ใช้ USB HID PID class (usage page 0x0F) ซึ่ง host ต้องส่ง Create New Effect Report แล้วอ่าน PID Block Load Report เพื่อขอ effect block index จากนั้นตั้ง Set Effect, Set Condition หรือ Set Constant Force แล้วสั่ง Effect Operation [I25] ทุกขั้นต้อง parse report descriptor เฉพาะรุ่น (4) สเปกเตือนว่า "the rumble feature on a gamepad could become damaged if a page sends an invalid rumble command" [I24] ส่วน blocklist ของ WebHID (ไฟล์ใน repo WICG เปิดอ่าน 11/2026) บล็อก FIDO (usage page 0xF1D0), Generic Desktop ชนิด Mouse/Keyboard/Keypad/System Control (usage page 0x01, usage 0x02/0x06/0x07/0x80), รายงานเฉพาะของ Jabra และอุปกรณ์ OnlyKey แต่ไม่มีรายการของ joystick (0x01/0x04), gamepad (0x01/0x05) หรือ usage page PID (0x0F) [I24] ทางเทคนิคจึงทำได้ แต่ต้นทุนสูงและได้ผู้ใช้กลุ่มเล็ก จัดเป็น P3 หรือ "ไม่ทำ" จนกว่าจะมีผู้ใช้จริงที่ขอ

### 11.6.4 เมาส์เป็น yoke
FlightGear มีโหมดเมาส์ "yoke" (โหมด 1, เคอร์เซอร์ crosshair, คลิกขวาวนโหมด) ซึ่งเลื่อนเมาส์แนวนอนเป็น aileron (`property-adjust` factor 4.0), กดปุ่มซ้ายค้างเปลี่ยนเป็น rudder, แนวตั้งเป็น elevator (factor −4.0), ล้อเมาส์เป็น elevator trim 0.001 ต่อคลิก (กด modifier ได้ 0.0001 หรือ 0.01) และคันไม่คืนกลาง [I17] การแปลงไปเป็นเว็บใช้ Pointer Lock ซึ่งให้ `movementX/Y` ได้ไม่จำกัดและซ่อนเคอร์เซอร์ และมีตัวเลือก `unadjustedMovement: true` สำหรับปิด mouse acceleration [I28]

$$y_{k+1}=\operatorname{clamp}\!\left(y_k+\frac{K\,\Delta m_y}{W_{px}},-1,1\right),\qquad K=4$$

$\Delta m_y$ คือ `movementY` (px), $W_{px}$ คือความกว้างของ viewport (px) ค่า $K$ = 4 แปลว่าเลื่อนเมาส์หนึ่งในสี่ของความกว้างหน้าต่างได้คันเต็ม (T-I-16) นี่เป็น**การตีความ** factor 4.0 ของ FlightGear โดยสมมุติว่าการเคลื่อนถูก normalize ด้วยขนาดหน้าต่าง ซึ่ง**ยังไม่ยืนยัน** (ความเชื่อมั่น ต่ำ) Pointer Lock ใช้ไม่ได้ใน iframe ที่เป็น sandbox โดยไม่มี `allow-pointer-lock` [I28] จึงอาจใช้ใน artifact ของ claude.ai ไม่ได้ (ยังไม่ยืนยัน)

## 11.7 จอสัมผัส
| ประเด็น | ปัจจุบัน | ที่เสนอ |
|---|---|---|
| จุดศูนย์ | absolute: คันอยู่ที่จุดแตะ (90-app.js:346–347) | **floating** เป็นค่าเริ่ม: จุดที่นิ้วแตะครั้งแรกเป็นศูนย์ คันจึงไม่กระโดด (คำสั่งตอน pointerdown = 0); absolute เป็นตัวเลือก |
| Dead zone และ expo | ไม่มี | radial 0.04 และ $e$ 0.5 ตามหัวข้อ 6.7.2 (ไม่มีสปริงกลไก นิ้วจึงนิ่งกว่า thumbstick) |
| รูปวงกลม | มุมทแยงได้ 0.707/0.707 | `circleToSquare`: $k=m/\max(\lvert x\rvert,\lvert y\rvert)$ ทำให้ (0.707, 0.707) → (1, 1) ดึงสุดพร้อมเอียงสุดได้เหมือนคันจริง (T-I-15) |
| การคืนกลาง | ทันทีเมื่อยกนิ้ว (349) | คงไว้ใน ASSIST; ใน DIRECT ให้คืนผ่าน ramp 2.5/s (เท่าคีย์บอร์ด) เพื่อไม่ให้เกิด step ของพื้นบังคับ |
| Trim | ไม่มี | ปุ่ม "trim ตามคันตอนนี้" ย้ายค่า pitch ที่ค้างอยู่ไปเป็น trim แล้วให้ศูนย์ของคันกลับมาที่นิ้ว เทียบได้กับ `setElevatorTrimToPosition` ("Trim elevator to current stick position (on release)") ของ FlightGear [I15] และมีปุ่ม trim ▲▼ แบบกดค้าง |
| ขนาดและพื้นที่ | 140 px, R 50 px | ให้ปรับ R ได้ 40–90 px ในหน้าตั้งค่า เพราะ R ใหญ่ขึ้นให้ความละเอียดต่อพิกเซลมากขึ้น |
| การสั่น | ไม่มี | `navigator.vibrate(40)` (Vibration API [I27]) ตอนแตะพื้นบน Android (ต้องมี user activation และไม่ทำงานใน iframe ข้ามโดเมน [I2]) |
| การยกเลิก | `pointercancel` คืนศูนย์ (350) | คงไว้ CSS `touch-action: none` มีอยู่แล้ว ซึ่งจำเป็นเพราะถ้าเบราว์เซอร์เริ่มจัดการท่าทาง touch เอง หน้าเว็บจะได้ `pointercancel` [I29] |

## 11.8 โค้ดชั้นอินพุตที่ไม่ผูกกับ DOM (เสนอ `src/25-input.js`)
ไฟล์นี้ต้องไม่อ้าง `window`, `navigator` หรือ `document` เพื่อให้ `test/harness.mjs` โหลดด้วย `new Function` แบบเดียวกับ 10/15/20 ได้ (ให้เพิ่ม `'25-input.js'` ในรายการไฟล์และในรายชื่อที่ `return` ของ `test/harness.mjs`; ฝั่ง `build.mjs` ไม่ต้องแก้ เพราะรวมทุกไฟล์ที่ตรงกับ `^\d\d-.*\.js$` ตามลำดับชื่ออยู่แล้ว) ส่วน 90-app.js ทำหน้าที่แค่อ่าน `navigator.getGamepads()`, keyboard events และ pointer events แล้วส่งค่าดิบให้ฟังก์ชันเหล่านี้ ต้นแบบที่รันแล้วอยู่ที่ `scripts/i11_input.mjs` (ใช้ `export` เพื่อทดสอบ เมื่อนำเข้า src ให้ลบ `export` ออก **และลบบรรทัด `const clamp` ทิ้ง** เพราะ 10-atmo.js:8 ประกาศ `clamp` ไว้แล้วด้วยความหมายเดียวกัน ถ้าไม่ลบ ทั้ง harness และหน้าเว็บที่ build เป็น module เดียวจะหยุดด้วย `SyntaxError: Identifier 'clamp' has already been declared` ตรวจแล้วด้วย `scripts/i11_review_concat.mjs`: เมื่อลบบรรทัดนี้ โหลดต่อจาก 10/15/20 ได้และ T-I-01 ได้ค่าเดิม):

```js
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v); // standalone tests only: delete in src/25-input.js (10-atmo.js:8 already declares clamp)

// ── calibration ──
// bipolar (self-centring) axis: piecewise-linear about the measured centre -> [-1, 1]
export function calBipolar(raw, c) {
  const d = raw - c.center, span = d >= 0 ? c.max - c.center : c.center - c.min;
  return span > 1e-6 ? clamp(d / span, -1, 1) : 0;
}
// unipolar (non-centring) lever / toe brake: rest and full may be in either order (inverted devices)
export function calUnipolar(raw, c) {
  const span = c.full - c.rest;
  return Math.abs(span) > 1e-6 ? clamp((raw - c.rest) / span, 0, 1) : 0;
}
// rest statistics from samples captured while the user does not touch the device
export function restStats(samples) {
  const n = samples.length; let s = 0; for (const v of samples) s += v; const center = s / n;
  let dev = 0; for (const v of samples) dev = Math.max(dev, Math.abs(v - center));
  return { center, noise: dev };
}
// dead zone suggested from measured rest noise (bipolar span ~1 after calibration)
export function suggestDeadzone(noise, span = 1, k = 1.5, margin = 0.02, lo = 0.03, hi = 0.25) {
  return clamp((k * noise) / span + margin, lo, hi);
}
// which axis did the user move? (largest excursion from the rest frame)
export function detectAxis(rest, frames, minMove = 0.5) {
  let best = -1, bestMove = minMove;
  for (let i = 0; i < rest.length; i++) {
    let mv = 0; for (const f of frames) mv = Math.max(mv, Math.abs(f[i] - rest[i]));
    if (mv > bestMove) { bestMove = mv; best = i; }
  }
  return best;
}
export function rangeOf(frames, i) { let lo = Infinity, hi = -Infinity; for (const f of frames) { lo = Math.min(lo, f[i]); hi = Math.max(hi, f[i]); } return { min: lo, max: hi }; }

// ── dead zones ──
export function dzAxial(x, d, outer = 0) { // scaled axial dead zone + extremity (outer) dead zone
  const a = Math.abs(x); if (a <= d) return 0;
  return Math.sign(x) * Math.min(1, (a - d) / (1 - d - outer));
}
export function dzRadial(x, y, d, outer = 0) { // scaled radial (XInput-style circular, rescaled)
  const m = Math.hypot(x, y); if (m <= d) return [0, 0];
  const k = Math.min(1, (m - d) / (1 - d - outer)) / m; return [x * k, y * k];
}
export function dzRadialUnscaled(x, y, d) { const m = Math.hypot(x, y); return m <= d ? [0, 0] : [x, y]; }
// circle -> square (lets a round-gated stick reach full roll and full pitch together)
export function circleToSquare(x, y) {
  const m = Math.hypot(x, y), a = Math.max(Math.abs(x), Math.abs(y)); if (a < 1e-9) return [0, 0];
  const k = m / a; return [clamp(x * k, -1, 1), clamp(y * k, -1, 1)];
}

// ── response curves ──
export const expo = (x, e) => (1 - e) * x + e * x * x * x;           // RC-style blend
export const powc = (x, p) => Math.sign(x) * Math.abs(x) ** p;         // sign-preserving power (FlightGear 'power')
export function pwl(x, pts) {                                          // odd-symmetric piecewise-linear, pts [[0,0],...,[1,1]]
  const a = Math.min(1, Math.abs(x)), s = Math.sign(x);
  for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return s * (y0 + ((a - x0) * (y1 - y0)) / (x1 - x0)); }
  return s * pts[pts.length - 1][1];
}
// full chain for one bipolar axis
export function shapeAxis(raw, p) {
  let x = p.cal ? calBipolar(raw, p.cal) : clamp(raw, -1, 1);
  if (p.invert) x = -x;
  x = dzAxial(x, p.dz || 0, p.outer || 0);
  if (p.curve) x = pwl(x, p.curve); else if (p.pow) x = powc(x, p.pow); else x = expo(x, p.expo || 0);
  return clamp(x * (p.gain ?? 1), -1, 1);
}
export function shapeLever(raw, p) { // throttle, prop, condition, toe brake
  let u = calUnipolar(raw, p.cal); const e0 = p.dzIdle || 0, e1 = p.dzFull || 0;
  return clamp((u - e0) / (1 - e0 - e1), 0, 1);
}

// ── keyboard ──
// proportional ramp with self-centring; dir in {-1,0,1}; r = {up, back, cap}; fine = precision modifier factor
export function keyRamp(v, dir, dt, r, fine = 1) {
  const tgt = dir * r.cap * Math.min(1, fine);              // v* = s·c·φ (11.4.2)
  let rate = dir === 0 ? r.back : v * dir < 0 ? Math.max(r.up, r.back) : r.up * fine;
  return v + clamp(tgt - v, -rate * dt, rate * dt);
}
// key latch: a key pressed and released between two frames still counts as held for one frame
export const keyLatch = () => ({ held: new Set(), tapped: new Set() });
export function onKeyDown(ks, code) { ks.held.add(code); ks.tapped.add(code); }
export function onKeyUp(ks, code) { ks.held.delete(code); }
export function frameKeys(ks) { const s = new Set([...ks.held, ...ks.tapped]); ks.tapped.clear(); return s; }
export const keyDir = (keys, neg, pos) => (pos.some((c) => keys.has(c)) ? 1 : 0) - (neg.some((c) => keys.has(c)) ? 1 : 0);
export function trimStep(t, dir, rate, dt, lo = -1, hi = 1) { return clamp(t + dir * rate * dt, lo, hi); }
// mouse as yoke (11.6.4): pointer-lock movement in px, normalised by viewport width, held (no self-centring)
export function mouseYoke(v, dPx, widthPx, K = 4) { return clamp(v + (K * dPx) / widthPx, -1, 1); }
export function flapNotch(cmd, dir, notches) { // move to the next detent in 'dir' (+1 extend, -1 retract)
  if (dir > 0) { for (const n of notches) if (n > cmd + 1e-6) return n; return notches[notches.length - 1]; }
  for (let i = notches.length - 1; i >= 0; i--) if (notches[i] < cmd - 1e-6) return notches[i]; return notches[0];
}
export function brakes(left, right, both, parking = 0) { return [Math.max(left, both, parking), Math.max(right, both, parking)]; }
// toggles fire once per physical press: ignore auto-repeat
export const isToggleEdge = (ev) => ev.type === 'keydown' && !ev.repeat;
// flight bindings are never resolved when Ctrl/Meta/Alt is held (browser shortcuts, e.g. Ctrl+W closes the tab)
export function resolveKey(code, mods, keymap) { if (mods.ctrl || mods.meta || mods.alt) return null; return keymap[code] || null; }
const RESERVED_MODS = ['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'AltLeft', 'AltRight', 'OSLeft', 'OSRight'];
export function keymapProblems(keymap) { return Object.keys(keymap).filter((c) => RESERVED_MODS.includes(c)); }

// ── 1€ filter (Casiez, Roussel, Vogel, CHI 2012) ──
export class OneEuro {
  constructor(minCutoff = 1, beta = 0, dCutoff = 1) { this.mc = minCutoff; this.beta = beta; this.dc = dCutoff; this.x = null; this.dx = 0; }
  static alpha(dt, fc) { const tau = 1 / (2 * Math.PI * fc); return 1 / (1 + tau / dt); }
  filter(x, dt) {
    if (this.x === null) { this.x = x; return x; }
    const dxRaw = (x - this.x) / dt; this.dx += OneEuro.alpha(dt, this.dc) * (dxRaw - this.dx);
    const fc = this.mc + this.beta * Math.abs(this.dx); this.x += OneEuro.alpha(dt, fc) * (x - this.x); return this.x;
  }
}

// ── device identity ──
export function parseGamepadId(id) {
  let m = /Vendor:\s*([0-9a-f]{1,4})\s+Product:\s*([0-9a-f]{1,4})/i.exec(id);
  if (!m) m = /^([0-9a-f]{1,4})-([0-9a-f]{1,4})-/i.exec(id);
  return m ? { vendor: m[1].toLowerCase().padStart(4, '0'), product: m[2].toLowerCase().padStart(4, '0') } : null;
}

// ── haptics mixer: sim state -> one 'dual-rumble' effect per update period ──
export class RumbleScheduler { // at most one playEffect per period; skip if nothing changed and the effect is still running
  constructor(period = 0.1, durMs = 120, eps = 0.05) { this.p = period; this.d = durMs; this.eps = eps; this.tLast = -1e9; this.last = { strongMagnitude: 0, weakMagnitude: 0 }; }
  next(now, mix) {
    const changed = Math.abs(mix.strongMagnitude - this.last.strongMagnitude) > this.eps || Math.abs(mix.weakMagnitude - this.last.weakMagnitude) > this.eps;
    const active = mix.strongMagnitude > 0 || mix.weakMagnitude > 0;
    if (now - this.tLast < this.p) return null;
    if (!changed && (!active || now - this.tLast < (this.d / 1000) * 0.8)) return null;
    this.tLast = now; this.last = mix; return { type: 'dual-rumble', params: { duration: active ? this.d : 0, ...mix } };
  }
}
export function hapticMix(s, g = { gain: 1, buffet: 1, runway: 1, touchdown: 1 }) {
  let strong = 0, weak = 0;
  if (s.buffet > 0) { strong = Math.max(strong, g.buffet * s.buffet); weak = Math.max(weak, 0.5 * g.buffet * s.buffet); }
  if (s.onGround && s.gs > 1) weak = Math.max(weak, g.runway * (s.rough ?? 0.15) * Math.min(1, s.gs / 30));
  if (s.tdSinkFpm != null) strong = Math.max(strong, g.touchdown * clamp((s.tdSinkFpm - 100) / 600, 0.15, 1));
  return { strongMagnitude: clamp(strong * g.gain, 0, 1), weakMagnitude: clamp(weak * g.gain, 0, 1) };
}
```

ตัวอย่างการต่อเข้ากับ `readInputs(dt)` (90-app.js, ส่วนที่ผูกกับ DOM; ย่อไว้):
```js
const pads = navigator.getGamepads ? navigator.getGamepads() : [];       // สำเนา อ่านทุกเฟรม [I1]
const keys = frameKeys(app.kl);                                          // held ∪ tapped
const fine = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 0.5 : 1;
app._ky = keyRamp(app._ky, keyDir(keys, BIND.pitchDn, BIND.pitchUp), dt, RATES.pitch, fine);
for (const gp of pads) if (gp) { const prof = profiles[devKey(gp)]; if (prof) applyProfile(gp, prof, sources, now); }
I.y = arbitrate([{ v: app._ky, tActive: app._kyT }, ...sources.y], now); // แหล่งที่ขยับล่าสุดชนะ
```

## 11.9 ค่าพารามิเตอร์ (JSON)
ทุกค่าในกลุ่มนี้ใช้ร่วมกันทุกเครื่องบิน (`scope: "sim"`) ยกเว้น `flap_notches` และ `interim_trim_rate_elevator` ซึ่งแต่ละแบบเครื่องต้องให้ค่าเอง ตัวเลขที่ระบุ `est: true` เป็นค่าประมาณที่ต้องจูนด้วยการลองบินจริง JSON นี้สร้างและตรวจด้วย `JSON.parse` ใน `scripts/i11_json.mjs`

```json
{
 "input": {
  "gamepad": {
    "standard_layout": {"v":{"buttons":17,"axes":4,"axis_range":[-1,1],"button_range":[0,1],"axes1_back_sign":1},"u":"-","scope":"sim","src":["I1"],"conf":"สูง","est":false,"note":"axes[1] บวก = ดึงกลับ = y บวก ไม่ต้องกลับเครื่องหมาย"},
    "poll_per_frame": {"v":1,"u":"ครั้ง/เฟรม","scope":"sim","src":["I1","I6"],"conf":"สูง","est":false,"note":"getGamepads() ก่อน fl.advance"},
    "permissions_policy_default": {"v":{"allowlist":"*","chrome_since":103},"u":"-","scope":"sim","src":["I1","I4","I5"],"conf":"สูง","est":false,"note":"iframe ข้ามโดเมนใช้ได้เว้นแต่หน้าแม่ปิด"},
    "max_effect_duration": {"v":5000,"u":"ms","scope":"sim","src":["I1"],"conf":"สูง","est":false,"note":"ค่าที่สเปกแนะนำ"}
  },
  "shaping": {
    "deadzone_gamepad_stick": {"v":0.08,"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I7","I12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: scaled radial เท่าหัวข้อ 6; XInput 0.24 [I7] และ FlightGear 0.1 [I12] ใช้เทียบเท่านั้น"},
    "deadzone_flightstick": {"v":0.03,"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I12"],"conf":"ต่ำ","est":true,"note":"axial; ค่าประมาณ ต่ำกว่าค่าเริ่ม 0.1 ของ FlightGear [I12] ที่ใช้เทียบ"},
    "deadzone_pedals": {"v":0.03,"u":"สัดส่วนช่วงแกน","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: axial"},
    "deadzone_trigger_rudder": {"v":0.05,"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I7"],"conf":"ต่ำ","est":true,"note":"กับผลต่าง RT−LT; ค่าประมาณ ต่ำกว่า TRIGGER_THRESHOLD 30/255 = 0.118 ของ XInput [I7]"},
    "outer_deadzone": {"v":0.02,"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: extremity"},
    "lever_end_deadzone": {"v":{"idle":0.02,"full":0.02},"u":"สัดส่วนช่วงคันโยก","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "deadzone_auto": {"v":{"k_noise":1.5,"margin":0.02,"min":0.03,"max":0.25},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จากช่วงพัก 2 s"},
    "xinput_reference": {"v":{"left_stick":0.2395,"right_stick":0.2652,"trigger":0.1176},"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I7","I8"],"conf":"สูง","est":false,"note":"7849/32767, 8689/32767, 30/255"},
    "flightgear_default_deadband": {"v":0.1,"u":"สัดส่วนช่วงแกน","scope":"sim","src":["I12"],"conf":"สูง","est":false,"note":""},
    "expo_default": {"v":{"gamepad":0.5,"flightstick":0.3,"pedals":0.3,"trigger_rudder":0.3,"touch":0.5},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: out = (1−e)x + e x³"},
    "expo_range": {"v":[0,0.9],"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "xplane_max_curve": {"v":{"half_input":0.5,"output":0.1,"equivalent_power":3.32},"u":"-","scope":"sim","src":["I9"],"conf":"กลาง","est":false,"note":"เลขชี้กำลังคำนวณเอง"},
    "one_euro": {"v":{"min_cutoff_Hz":2,"beta":2,"d_cutoff_Hz":1,"enable_if_noise_gt":0.01},"u":"Hz, - (ไม่มีหน่วยเมื่อแกนเป็นสัดส่วน), Hz, สัดส่วนช่วงแกน","scope":"sim","src":["I18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: d_cutoff ตามบทความ ค่าอื่นเลือกให้ lag ≤ 0.05 s"},
    "lag_budget": {"v":0.1,"u":"s","scope":"sim","src":["C14"],"conf":"กลาง","est":false,"note":"หัวข้อ 6.5.1 ใช้เกณฑ์ time delay Level 1 = 0.10 s ที่ [C14] ยกมาจาก MIL-F-8785 เป็นงบรวมของทั้งเส้นทางอินพุต"}
  },
  "keyboard": {
    "ramp_pitch": {"v":{"up":0.5,"back":2.5,"cap":1},"u":"1/s, 1/s, -","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ≈ 1.1 g/s ที่ 95 kt DIRECT"},
    "ramp_roll": {"v":{"up":1,"back":3,"cap":1},"u":"1/s, 1/s, -","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "ramp_rudder": {"v":{"up":1,"back":2,"cap":1},"u":"1/s, 1/s, -","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "fine_factor": {"v":0.5,"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Shift ค้าง: คูณอัตราและเพดาน"},
    "current_ramp_reference": {"v":{"pitch_up":2,"roll_up":2.5,"rudder_up":2.5,"back":5,"throttle":0.35},"u":"1/s","scope":"sim","src":["repo:90-app.js:360-364"],"conf":"สูง","est":false,"note":"ค่าในโค้ดปัจจุบัน"},
    "throttle_rate": {"v":0.35,"u":"1/s","scope":"sim","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: คงค่าปัจจุบัน (90-app.js:363); FlightGear 0.01 ต่อ repeat ≈ 0.3/s ที่ 30 Hz [I14] ใช้เทียบเท่านั้น"},
    "flightgear_reference": {"v":{"stick_step_per_press":0.05,"trim_step_per_repeat":0.001,"TRIM_RATE_per_s":0.045,"throttle_step_per_repeat":0.01,"flap_steps":3,"full_brake_time_s":0.5},"u":"หน่วยควบคุม","scope":"sim","src":["I14","I15"],"conf":"สูง","est":false,"note":""},
    "os_key_repeat": {"v":[2.5,30],"u":"Hz","scope":"sim","src":["I23"],"conf":"สูง","est":false,"note":"ห้ามผูก ramp กับ repeat"},
    "brake_key_rise": {"v":0.5,"u":"s","scope":"sim","src":["I15"],"conf":"กลาง","est":false,"note":""},
    "interim_trim_rate_elevator": {"v":0.5,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ของ trimDe ก่อนมี tab (หัวข้อ 6)"},
    "flap_notches": {"v":[0,0.5,1],"u":"สัดส่วน AC.flaps","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: UP/T-O/LDG"},
    "keymap_default": {"v":{"pitch":[["KeyW","ArrowUp","Numpad8"],["KeyS","ArrowDown","Numpad2"]],"roll":[["KeyA","ArrowLeft","Numpad4"],["KeyD","ArrowRight","Numpad6"]],"rudder":[["KeyQ","Numpad0"],["KeyE","NumpadEnter"]],"centre":["Numpad5"],"throttle":[["Minus","PageDown","Numpad3"],["Equal","PageUp","Numpad9"]],"trim_pitch":[["BracketLeft","Home","Numpad7"],["BracketRight","End","Numpad1"]],"trim_rudder":[["Comma"],["Period"]],"flaps":[["KeyV"],["KeyF"]],"gear":["KeyG"],"brake_both":["KeyB"],"brake_left":["KeyZ"],"brake_right":["KeyX"],"parking_brake":["Shift+KeyB"],"fine":["ShiftLeft","ShiftRight"],"camera":["KeyC"],"take_control":["KeyT"],"pause":["KeyP"],"restart":["KeyR"]},"u":"KeyboardEvent.code","scope":"sim","src":["I14","I19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คู่ [ลบ, บวก]: ดัน/ดึง, ซ้าย/ขวา, ลด/เพิ่ม, หัวลง/หัวขึ้น, เก็บ/กาง"}
  },
  "devices": {
    "storage": {"v":{"key":"afl-input-v1","schema_version":1},"u":"-","scope":"sim","src":[],"conf":"สูง","est":true,"note":"ค่าประมาณ: ผ่าน store (90-app.js:5)"},
    "wizard": {"v":{"rest_capture_s":2,"move_threshold":0.5,"sweep_capture_s":4},"u":"s, สัดส่วนช่วงแกน, s","scope":"sim","src":["I9"],"conf":"ต่ำ","est":true,"note":"ลำดับขั้นตาม X-Plane [I9]; ตัวเลขทั้งสามเป็นค่าประมาณ ไม่ได้มาจาก [I9]"},
    "arbitration_hold": {"v":0.5,"u":"s","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แหล่งที่ขยับล่าสุดคุมช่อง"},
    "device_hints": {"v":{"044f:b108":{"name":"T.Flight Hotas X","axes":{"roll":0,"pitch":1,"throttle":2,"rudder":3}},"044f:b679":{"name":"T-Rudder","axes":{"brakeR":0,"brakeL":1,"rudder":2},"toe_rest":1,"rudder_power":2},"06a3:0763":{"name":"Saitek Pro Flight Rudder Pedals","axes":{"brakeL":0,"brakeR":1,"rudder":2},"toe_rest":-1,"rudder_power":2}},"u":"vendor:product","scope":"sim","src":["I16","I26"],"conf":"ต่ำ","est":false,"note":"ลำดับแกนจาก FlightGear ใช้เป็นคำใบ้ให้ wizard เท่านั้น"}
  },
  "haptics": {
    "update_period": {"v":0.1,"u":"s","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่าหัวข้อ 1.6; สเปก [I1] ไม่กำหนดคาบ กำหนดแค่ว่าเอฟเฟกต์ใหม่ preempt ของเดิม"},
    "effect_duration": {"v":120,"u":"ms","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่าหัวข้อ 1.6; ยาวกว่าคาบอัปเดต 20 ms เพื่อไม่ให้ขาดช่วง; ต่ำกว่าเพดาน 5 s ที่สเปกแนะนำ [I1]"},
    "mix": {"v":{"buffet_strong":1,"buffet_weak":0.5,"runway_weak_at_30mps":0.15,"td_sink_zero_fpm":100,"td_sink_full_fpm":700,"td_min":0.15,"td_duration_ms":150},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "user_gain": {"v":{"default":0.7,"range":[0,1]},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "android_vibrate_touchdown": {"v":40,"u":"ms","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ; ใช้ได้จริงเฉพาะ Chrome Android ตาม [I2]"}
  },
  "touch": {
    "stick_radius_current": {"v":50,"u":"px","scope":"sim","src":["repo:90-app.js:346"],"conf":"สูง","est":false,"note":"R = ความกว้าง 140 px / 2 − 20"},
    "deadzone": {"v":0.04,"u":"สัดส่วนรัศมี","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เท่าหัวข้อ 6"},
    "origin_mode": {"v":{"default":"floating"},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
    "square_gate": {"v":{"enabled":1},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"}
  },
  "mouse": {
    "yoke_gain_K": {"v":4,"u":"คันเต็มต่อความกว้างหน้าต่าง","scope":"sim","src":["I17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตีความจาก factor 4.0 (ยังไม่ยืนยัน)"},
    "wheel_trim_step": {"v":0.001,"u":"หน่วย trim ต่อคลิก","scope":"sim","src":["I17"],"conf":"กลาง","est":false,"note":""}
  },
  "browser": {
    "reserved_shortcuts_chrome": {"v":{"outside_fullscreen":["Ctrl/Cmd+T","Ctrl/Cmd+W","Ctrl/Cmd+N","Ctrl/Cmd+Shift+T","Ctrl/Cmd+Shift+W","Ctrl/Cmd+Shift+N"]},"u":"-","scope":"sim","src":["I22"],"conf":"สูง","est":false,"note":""}
  }
 }
}
```

## 11.10 กรณีทดสอบ
ทุกกรณีเขียนเป็น `test/input.test.mjs` ที่โหลด `src/25-input.js` ผ่าน harness ได้ (ไม่มี DOM) ส่วน T-I-06 ใช้ `Flight` จาก harness ค่าคาดหวังทั้งหมดคำนวณด้วย `scripts/i11_expected.mjs`, `i11_gamepad_profile.mjs`, `i11_latch_check.mjs`, `i11_current.mjs` / `i11_current2.mjs` และสคริปต์ตรวจทาน `i11_review_checks.mjs`, `i11_review_mouse.mjs`, `i11_review_concat.mjs` (รันซ้ำแล้วตรงทุกค่า 11/2026)

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-I-01 | ชุด dead zone + expo | `shapeAxis(x, {dz: 0.08, expo: 0.5})` | f(0.05) = 0; f(0.1) = 0.0109; f(0.25) = 0.0955; f(0.5) = 0.2758; f(0.75) = 0.5573; f(1) = 1; f(−0.5) = −0.2758 (± 0.0005); เพิ่มขึ้นทางเดียวบน [−1, 1] | สมการ 11.3.2–11.3.3 | ยังไม่มีฟีเจอร์ (DIRECT เป็นเชิงเส้น; ASSIST มี dead zone แบบไม่ scale ทำให้ bank กระโดด 1.32° ที่ 20-flight.js:434) |
| T-I-02 | Radial, axial, outer dead zone และ circle→square | d = 0.08; d_o = 0 ในสามกรณีแรก และ d_o = 0.02 ในสองกรณีหลัง (`dzAxial(x, 0.08, 0.02)`); `circleToSquare(0.7071, 0.7071)` | `dzRadial(0.1, 0.1)` = (0.0472, 0.0472); `dzAxial(0.1)` = 0.0217; `dzRadial(0.3, 0.05)` = (0.2403, 0.0401); `dzAxial(0.97, ·, 0.02)` = 0.9889; `dzAxial(0.98, ·, 0.02)` = 1; circle→square = (1, 1) (± 0.0005) (ถ้าใช้ d_o = 0.02 กับสามกรณีแรกจะได้ (0.0483, 0.0483), 0.0222, (0.2457, 0.0409); `scripts/i11_review_checks.mjs`) | สมการ 11.3.2, ตัวอย่าง XInput [I7] | ยังไม่มีฟีเจอร์ |
| T-I-03 | การปรับเทียบ bipolar และคันโยกที่เครื่องหมายสวนกัน | bipolar min −0.9, c 0.04, max 0.95; คันเร่ง rest +1, full −1, e₀ = e₁ = 0.02; toe brake Saitek rest −1 / T-Rudder rest +1 | bipolar: −0.9 → −1, 0.04 → 0, 0.5 → 0.5055; คันเร่ง: 1 → 0, 0 → 0.5, −1 → 1; toe ทั้งสองรุ่น: พัก → 0, กลาง → 0.5, สุด → 1 (± 1e-4) | 11.3.1; ตรงกับ (1 − val)/2 [I15], (raw + 1)·0.5 และ (raw − 1)·(−0.5) [I16] | ยังไม่มีฟีเจอร์ |
| T-I-04 | สถิติตอนพัก, dead zone อัตโนมัติ, การตรวจหาแกน | 120 ตัวอย่าง ศูนย์ 0.03 ± 0.01 (LCG seed 7); `detectAxis(rest=[0.01, −0.02, 1, 0], frames)` ที่แกน 1 ไปถึง −1 | center 0.030 ± 0.002, noise ≤ 0.0102, dz = 0.035 ± 0.003; detectAxis = 1 | 11.3.2, 11.5.3 | ยังไม่มีฟีเจอร์ |
| T-I-05 | Ramp คีย์บอร์ดที่เสนอ | pitch up 0.5, back 2.5, cap 1, dt 1/60 | 1 เฟรม = 0.00833; ค้าง 0.3 s = 0.150; ถึง 1 ใน 2.0 s; คืนจาก 1 เป็น 0 ใน 0.40 s; กดกลับทิศจาก 0.5 เป็นเวลา 6 เฟรม = 0.25; Shift (φ 0.5) ค้าง 2 s = 0.50 (± 0.001) | สมการ 11.4.2 | ค่าที่จำลองตาม 90-app.js:361: 1 เฟรม 0.0333, 0.5 ที่ 0.25 s, ถึงสุด 0.5 s, คืนกลาง 0.2 s |
| T-I-06 | ผลของ ramp ต่อเครื่องบิน (closed loop) | `Flight` DIRECT ค่าเริ่ม (95 kt (48.9 m/s), แฟลปลง), กด pull 0.3 s แล้วปล่อย, เฟรม 60 Hz, ดู 4 s | Δn สูงสุดอยู่ใน 0.04–0.15 g (คาด 0.074) และ α สูงสุด < 4° | `i11_current.mjs` | **ไม่ผ่าน:** Δn 0.401 g, α 6.21° |
| T-I-07 | ความปลอดภัยของ keymap | `keymapProblems(DEFAULT_KEYMAP)`; `resolveKey('KeyW', {ctrl: true})`; `resolveKey('KeyR', {meta: true})` | `[]`; `null`; `null` | คีย์สงวนของ Chrome [I22] | **ไม่ผ่าน:** `['ControlLeft', 'ControlRight']` (90-app.js:332) |
| T-I-08 | Toggle ไม่ทำงานซ้ำตาม key repeat | ลำดับเหตุการณ์ keydown G (repeat false) ตามด้วย keydown G (repeat true) 20 ครั้ง แล้ว keyup | `gearCmd` สลับครั้งเดียว; `isToggleEdge` เป็นจริง 1 ครั้งจาก 21 | 11.4.5; อัตรา repeat 2.5–30 Hz [I23] | **ไม่ผ่าน** (ใช้ C แทน G เพราะยังไม่มีคีย์ล้อ): ตัวจัดการที่ 90-app.js:338 จะทำงาน 21 ครั้ง |
| T-I-09 | การแตะสั้นกว่าหนึ่งเฟรม | `onKeyDown(S)`, `onKeyUp(S)` ก่อน `frameKeys` | เฟรมนั้นเห็น S ⇒ y = 0.00833 ± 1e-5; เฟรมถัดไปว่าง | 11.4.2 | การแตะหายไป (y = 0) เพราะ `Set` ถูกเพิ่มแล้วลบก่อน `readInputs` |
| T-I-10 | ขั้นแฟลปและเบรกแยกข้าง | notches [0, 0.5, 1]; `brakes(l, r, both)` | 0 + กาง → 0.5; 0.3 + กาง → 0.5; 0.5 + กาง → 1; 1 + เก็บ → 0.5; 0 + เก็บ → 0; brakes(0.3, 0, 0.6) = [0.6, 0.6]; brakes(0.8, 0, 0) = [0.8, 0] | 11.4.3 | ยังไม่มีฟีเจอร์ (ไม่มีคีย์แฟลป, เบรกเป็นค่าเดียว 20-flight.js:217) |
| T-I-11 | Parse `Gamepad.id` | สตริงจาก [I6], [I3] | "Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)" → 045e:028e; "810-3-USB Gamepad" → 0810:0003; "T.16000M" → `null` | [I3, I6] | ยังไม่มีฟีเจอร์ |
| T-I-12 | โปรไฟล์ Standard Gamepad | mock: axes [0.5, 0.6, 0, −0.4], buttons[6].value 0.2, [7].value 0.7, thr เริ่ม 0.3, dt 1 s | x = 0.3019, y = +0.3930 (ดึง = บวก โดยไม่กลับเครื่องหมาย), rud = 0.3635, thr = 0.4471 (± 0.0005); ตอนพัก (0.05, −0.04, 0, 0.1) ทุกช่อง = 0 และ thr ไม่เปลี่ยน | ผังมาตรฐาน [I1], `i11_gamepad_profile.mjs` | ยังไม่มีฟีเจอร์ |
| T-I-13 | 1€ filter อยู่ในงบ lag | fcmin 2 Hz, β 2, dcutoff 1 Hz, 60 Hz | lag ของ ramp 0.2/s = 0.046 ± 0.005 s; ramp 2/s = 0.016 ± 0.003 s; RMS สัญญาณรบกวนสม่ำเสมอเหลือ 0.32 ± 0.05 เท่า; เทียบกับ LPF 1 Hz ที่หน่วง 0.159 s ซึ่งเกินงบ 0.10 s | สมการ [I18]; งบจากหัวข้อ 6.5.1 | ยังไม่มีฟีเจอร์ (ไม่มีการกรอง lag 0) |
| T-I-14 | ตัวผสมและตัวจัดเวลา rumble | `hapticMix` ด้วย gain ค่าเริ่มในโค้ด (G = 1, g_B = g_R = g_TD = 1) ยกเว้นกรณี gain 0.5, ρ 0.15; `RumbleScheduler(0.1 s, 120 ms)` ที่ 240 Hz นาน 2.5 s, buffet 0.5 + 0.3 sin(20t) | buffet 0.6 → (S 0.6, W 0.3); พื้น 30 m/s (58.3 kt) → W 0.15; 15 m/s (29.2 kt) → W 0.075; แตะพื้น 400 fpm (2.03 m/s) → S 0.5; 900 fpm (4.57 m/s) + พื้น 40 m/s (77.8 kt) → (1.0, 0.15); gain 0.5 → (0.3, 0.15); เรียก 25 ครั้ง (≤ 10/s); เงียบ → 0 ครั้ง | 11.6.2; สเปก playEffect [I1] | ยังไม่มีฟีเจอร์ |
| T-I-15 | Stick บนจอสัมผัส | floating origin, radial dz 0.04, e 0.5, square gate | pointerdown → (0, 0); ลาก (0.5, 0) → x = 0.2946; (0.7071, 0.7071) → (1, 1) (± 0.0005) | 11.7 | absolute: แตะห่าง 15 px ได้ y = 0.3 ทันที ถ้าค้าง 2.5 s ใน DIRECT ที่ 95 kt (48.9 m/s) จะถึง α 11.6° และเตือน stall; มุมทแยงได้สูงสุด 0.707 |
| T-I-16 | เมาส์เป็น yoke (สะสม ไม่คืนกลาง) | `mouseYoke(y, movementY, W_px = 1200, K = 4)` เริ่ม y = 0, ลำดับ +150, +200, −2400, 0 px | y = 0.5, 1 (ถูก clamp จาก 1.1667), −1, −1 (คงที่เมื่อไม่ขยับ) (± 1e-4) | สมการ 11.6.4 (K = 4 เป็นการตีความที่ยังไม่ยืนยัน [I17]); `scripts/i11_review_mouse.mjs` | ยังไม่มีฟีเจอร์ |

## 11.11 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
- **ขนาด dead zone ต่างกันสามเท่า:** XInput ให้ 0.240/0.265 [I7], FlightGear ให้ 0.1 แล้วบอกเองว่า "very forgiving" [I12], หัวข้อ 6 เสนอ 0.08 ทั้งหมดเป็นค่าสำหรับคนละบริบท (เกมทั่วไป, จอยบิน, เครื่องจำลองนี้) รายงานนี้ใช้ 0.08 เพื่อให้สอดคล้องกับหัวข้อ 6 และให้ wizard ปรับเพิ่มจากสัญญาณรบกวนที่วัดได้ (ช่วง 0.03–0.25)
- **เครื่องหมายแกน pitch ของ gamepad:** หัวข้อ 6.7.2 เขียนว่า "ดึง = บวกหลังกลับเครื่องหมายแกน Y ของ gamepad" แต่ตามสเปก `axes[1]` เป็นบวกเมื่อดึงกลับอยู่แล้ว [I1] และ `y` ของ PilotLaws ก็เป็นบวกเมื่อดึง (20-flight.js:429) จึง**ไม่ต้องกลับเครื่องหมาย** FlightGear ใช้ factor −1 กับ elevator [I16] เพราะ property ของ FlightGear นิยามเครื่องหมายต่างออกไป ไม่ควรลอกค่า factor ของ FlightGear มาใช้ตรง ๆ
- **ตำแหน่งคีย์:** FlightGear ใช้ `[ ]` เป็นแฟลปและ `, .` เป็นเบรกซ้ายขวา [I14] แต่หัวข้อ 6 ใช้ `[ ]` เป็น trim, `, .` เป็น rudder trim, F/V เป็นแฟลป และ Z/X เป็นเบรก รายงานนี้เลือกตามหัวข้อ 6 เพื่อให้ทั้งรอบสอดคล้องกัน และผู้ใช้เปลี่ยนการผูกได้
- **CLAUDE.md กับโค้ด:** CLAUDE.md บอกว่าคีย์ "binary (no proportional ramp yet)" แต่ 90-app.js:361 มี ramp แล้ว (หัวข้อ 6 พบเช่นกัน) ควรแก้ข้อความใน CLAUDE.md เมื่อทำงานนี้
- **ข้อมูลที่ยังไม่ยืนยัน:** (1) iframe ของ artifact claude.ai อนุญาต gamepad, pointer lock, fullscreen และ vibrate หรือไม่ ต้องทดสอบจริง (2) การตีความ factor 4.0 ของเมาส์ FlightGear ว่าเท่ากับ 1/4 ความกว้างหน้าต่าง (3) ลำดับแกนในเบราว์เซอร์ของ HOTAS/pedals แต่ละรุ่น ตัวเลขใน `device_hints` มาจาก API ของระบบปฏิบัติการผ่าน FlightGear (4) ความหมายจริงของตัวตั้งใน MSFS มีแต่แหล่งชุมชน [I11] (5) สถานะ secure context ของ Gamepad API ในแต่ละเบราว์เซอร์ อ่านได้แค่ชื่อ bug [I32] และ Intent [I5] (6) ค่าเริ่มของ key repeat บน Windows/macOS ไม่ได้ค้น รู้เพียงช่วง 2.5–30 Hz [I23] (7) พฤติกรรมของ trigger บนอุปกรณ์ที่ไม่ได้ map (8) ข้อความในฉบับเต็มของบทความ 1€ (cutoff ของอนุพันธ์ 1 Hz) เพราะเปิด HAL ไม่ได้ตอนตรวจทาน ตัวเลขอื่นของ [I18] ยืนยันจากหน้าโครงการแล้ว (9) หน้า MDN ของ `playEffect` [I31] ไม่ได้เปิดซ้ำในการตรวจทาน ข้อเท็จจริงที่ใช้จึงอ้างสเปก [I1] แทน (10) ใน AC 61-136B [I30] ผู้ตรวจทานยืนยันข้อความของ B.3.1.1, สามรายการแรกของ B.3.2.1, B.3.3.1 และ C.3.1.7 แล้ว ส่วนรายการ mixture/condition, propeller, แฟลป, trim และคันล้อใน B.3.2.1 ยังไม่ได้ยืนยันซ้ำ
- **ข้อจำกัดของการวัด:** Δn ในตาราง 11.1 คำนวณจาก $C_L$ เพราะ `air.nz` ในโมเดลเป็น 0 เสมอ (20-flight.js:291) และตัวเลขทั้งหมดขึ้นกับอนุพันธ์ใน `AC` ซึ่งรอบต่อไปจะเปลี่ยน T-I-06 จึงตั้งช่วงยอมรับกว้าง (0.04–0.15 g) แทนค่าเดียว
- **ใบอนุญาต:** fgdata มีไฟล์ `LICENSE.md` เป็นข้อความ GNU GPL version 2 และ GitLab ระบุโครงการเป็น "GNU General Public License v2.0 or later" (https://gitlab.com/flightgear/fgdata/-/blob/next/LICENSE.md, ตรวจผ่าน GitLab API 11/2026) ส่วนซอร์ส flightgear มี `SPDX-License-Identifier: GPL-2.0-or-later` ในไฟล์ [I13] ส่วน repo ของ AirfieldLab ยังไม่มี LICENSE จึงไม่คัดลอกโค้ดหรือไฟล์ XML ของ FlightGear มาใช้ ใช้เพียงข้อเท็จจริงเชิงตัวเลข (ขนาดขั้น, เครื่องหมายแกน) โค้ดใน 11.8 ผู้เขียนเขียนใหม่จากสมการทั้งหมด

## 11.12 แหล่งอ้างอิง
1. [I1] W3C Web Applications WG, *Gamepad* (Editor's Draft, เปิดอ่าน 11/2026), https://w3c.github.io/gamepad/ (ไฟล์ต้นฉบับ https://github.com/w3c/gamepad) — ปฐมภูมิ · W3C permissive document license: อ้างอิงและยกข้อความสั้นได้ สมการและโค้ดเขียนเอง
2. [I2] MDN, *browser-compat-data* (api/Gamepad.json, GamepadHapticActuator.json, Navigator.json, HID.json, Keyboard.json, http/headers/Permissions-Policy.json; ดึง 11/2026), https://github.com/mdn/browser-compat-data — ปฐมภูมิ (ข้อมูลรวบรวม) · CC0: คัดลอกข้อมูลได้เสรี
3. [I3] MDN Web Docs, *Gamepad: id property* และ *Using the Gamepad API*, https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/id — ทุติยภูมิ · ข้อความ CC BY-SA 2.5 (ตัวอย่างโค้ด CC0): อ้างอิงได้ ไม่คัดลอกข้อความยาว
4. [I4] MDN Web Docs, *Permissions-Policy: gamepad directive*, https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/gamepad — ทุติยภูมิ · CC BY-SA 2.5: อ้างอิง
5. [I5] Chromium blink-dev, *Intent to Ship: Restrict Gamepad usage* (เริ่ม 2022-04-19, Chrome 103), https://groups.google.com/a/chromium.org/g/blink-dev/c/B1QUuICApvc/m/RRxZLqG4HQAJ — ปฐมภูมิ (ประกาศของผู้พัฒนาเบราว์เซอร์) · ลิงก์และอ้างอิงเท่านั้น
6. [I6] T. Steiner, *Play the Chrome dino game with your gamepad*, web.dev (ปรับปรุง 2024-04-11), https://web.dev/articles/gamepad — ทุติยภูมิ · CC BY 4.0 (โค้ด Apache-2.0): อ้างอิงได้ ถ้าคัดโค้ดต้องใส่ notice ของ Apache-2.0
7. [I7] Microsoft Learn, *Getting Started With XInput in Windows applications*, https://learn.microsoft.com/en-us/windows/win32/xinput/getting-started-with-xinput — ปฐมภูมิ (ผู้ผลิต API) · Microsoft docs (ไม่ได้ตรวจใบอนุญาตของหน้านี้): อ้างข้อเท็จจริงและค่าคงที่เท่านั้น
8. [I8] Microsoft Learn, *XINPUT_GAMEPAD structure (xinput.h)*, https://learn.microsoft.com/en-us/windows/win32/api/xinput/ns-xinput-xinput_gamepad — ปฐมภูมิ · อ้างข้อเท็จจริง
9. [I9] Laminar Research, *X-Plane 12 Desktop Manual* (version 12.0), หัวข้อ Configuring Flight Controls, https://x-plane.com/manuals/desktop/index.html#configuringflightcontrols — ปฐมภูมิ (ผู้ผลิตซอฟต์แวร์) · proprietary: อ้างอิงและยกข้อความสั้นเท่านั้น
10. [I10] T. Young, *Joystick Features Coming in X-Plane 11.30*, X-Plane Developer blog, 2018-09-27, https://developer.x-plane.com/?p=8671 — ปฐมภูมิ · proprietary: อ้างอิง
11. [I11] ผู้ใช้ MSFS Forums, *Explanation of new sensitivity settings?* (เริ่ม 2020-12-23), https://forums.flightsimulator.com/t/explanation-of-new-sensitivity-settings/339054 — ทุติยภูมิ (ชุมชน ไม่มีคำตอบจากผู้พัฒนา) · อ้างอิงเพื่อบอกว่ามีตัวตั้งอะไรบ้างเท่านั้น
12. [I12] J. Check และคณะ, *README.Joystick* (FlightGear fgdata), https://gitlab.com/flightgear/fgdata/-/raw/next/Docs/README.Joystick.html — ปฐมภูมิ (เอกสารของโปรแกรมเปิด) · GPL-2.0 (ไฟล์ LICENSE.md ของ fgdata; GitLab ระบุเป็น GPL-2.0-or-later ใช้กับ [I14]–[I17] ด้วย): อ้างข้อเท็จจริง ห้ามคัดลอกเข้า repo ที่ไม่มีใบอนุญาตเข้ากันได้
13. [I13] FlightGear, `src/Main/fg_commands.cxx` (`do_property_scale`), https://gitlab.com/flightgear/flightgear/-/raw/next/src/Main/fg_commands.cxx — ปฐมภูมิ (source code) · SPDX GPL-2.0-or-later: อ้างพฤติกรรมได้ ไม่คัดลอกโค้ด
14. [I14] FlightGear, `keyboard.xml` (fgdata), https://gitlab.com/flightgear/fgdata/-/raw/next/keyboard.xml — ปฐมภูมิ (ข้อมูลของโปรแกรม) · GPL-2.0: อ้างการผูกคีย์และขนาดขั้นได้ ไม่คัดลอกไฟล์
15. [I15] FlightGear, `Nasal/controls.nas` (fgdata), https://gitlab.com/flightgear/fgdata/-/raw/next/Nasal/controls.nas — ปฐมภูมิ · GPL-2.0: อ้าง TRIM_RATE, fullBrakeTime, throttleAxis และ setElevatorTrimToPosition เป็นข้อเท็จจริง
16. [I16] FlightGear joystick configs: `Input/Joysticks/Saitek/Pro-Flight-Rudder-Pedals.xml`, `ThrustMaster/T-Rudder.xml`, `ThrustMaster/T-Flight-Hotas-X.xml`, `Logitech/extreme-3d-pro.xml`, https://gitlab.com/flightgear/fgdata/-/tree/next/Input/Joysticks — ปฐมภูมิ (ข้อมูลอุปกรณ์จากโปรแกรมเปิด) · GPL-2.0: ใช้เป็นคำใบ้ของเครื่องหมายและลำดับแกน ไม่คัดลอกไฟล์
17. [I17] FlightGear, `mice.xml` (fgdata), https://gitlab.com/flightgear/fgdata/-/raw/next/mice.xml — ปฐมภูมิ · GPL-2.0: อ้างโหมด yoke, factor และ trim step
18. [I18] G. Casiez, N. Roussel, D. Vogel, "1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems", *CHI '12*, ACM, pp. 2527–2530, 2012, doi:10.1145/2207676.2208639; หน้าโครงการ https://gery.casiez.net/1euro/ (เปิดอ่าน 11/2026: ยืนยันผู้แต่ง ชื่อเรื่อง หน้า 2527–2530 วิธีจูน และใบอนุญาต BSD ของโค้ด JavaScript); ฉบับเปิด https://hal.archives-ouvertes.fr/hal-00670496 (ระบบกันบอตของ HAL ปฏิเสธการเข้าถึงตอนตรวจทาน จึงยังไม่ได้ยืนยันว่าเป็นเอกสารนี้ และยังไม่ได้อ่านข้อความในฉบับเต็ม) — ปฐมภูมิ (peer-reviewed) · บทความเป็นลิขสิทธิ์ ACM: อ้างสมการได้; โค้ดอ้างอิงฉบับ JavaScript เป็น BSD (ตามหน้าโครงการ): คัดลอกได้ถ้าใส่ notice แต่ข้อเสนอนี้เขียนใหม่จากสมการแล้ว
19. [I19] W3C, *UI Events KeyboardEvent code Values* (Working Draft), https://w3c.github.io/uievents-code/ และ MDN *KeyboardEvent: code property*, https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code — ปฐมภูมิ/ทุติยภูมิ · W3C permissive license / CC BY-SA 2.5: อ้างอิง
20. [I20] MDN Web Docs, *Keyboard API*, https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API — ทุติยภูมิ · CC BY-SA 2.5: อ้างอิง
21. [I21] W3C WICG, *Keyboard Lock* (Draft Community Group Report, 6 October 2021), https://wicg.github.io/keyboard-lock/ — ปฐมภูมิ · W3C permissive document license: อ้างอิง
22. [I22] Chromium blink-dev, *Intent to Implement and Ship: Browser Shortcuts in Fullscreen* (2017-01-18), https://groups.google.com/a/chromium.org/g/blink-dev/c/wlRDnLbyVlk — ปฐมภูมิ (ประกาศผู้พัฒนาเบราว์เซอร์) · ลิงก์และอ้างอิง
23. [I23] Microsoft Learn, *SystemParameters.KeyboardSpeed Property*, https://learn.microsoft.com/en-us/dotnet/api/system.windows.systemparameters.keyboardspeed — ปฐมภูมิ · อ้างข้อเท็จจริง
24. [I24] W3C WICG, *WebHID API* (Draft Community Group Report, 13 September 2024), https://wicg.github.io/webhid/ และ blocklist https://github.com/WICG/webhid/blob/main/blocklist.txt — ปฐมภูมิ · W3C Community Contributor License Agreement: อ้างอิง
25. [I25] USB Implementers Forum, *Device Class Definition for Physical Interface Devices (PID)* Version 1.0, 1999-09-08, https://usb.org/sites/default/files/pid1_01.pdf — ปฐมภูมิ · ลิขสิทธิ์ USB-IF: อ้างอิงเท่านั้น
26. [I26] S. J. Gowdy (ผู้ดูแล), *List of USB ID's* (usb.ids, Version 2026.06.26) ผ่าน mirror ของ systemd https://raw.githubusercontent.com/systemd/systemd/main/hwdb.d/usb.ids (ต้นทาง http://www.linux-usb.org/usb.ids ซึ่งเปิดไม่ได้จาก sandbox) — ปฐมภูมิ (ทะเบียนชุมชน) · ใบอนุญาตของไฟล์ยังไม่ยืนยัน (ไม่ได้เปิดหน้าต้นทาง): ใช้ VID/PID ไม่กี่ค่าเป็นข้อเท็จจริง ไม่คัดลอกไฟล์
27. [I27] W3C, *Vibration API*, https://w3c.github.io/vibration/ และ MDN *Navigator: vibrate()*, https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate — ปฐมภูมิ/ทุติยภูมิ · W3C license / CC BY-SA 2.5: อ้างอิง (ข้อจำกัดของเบราว์เซอร์มาจาก [I2])
28. [I28] MDN Web Docs, *Pointer Lock API*, https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API — ทุติยภูมิ · CC BY-SA 2.5: อ้างอิง
29. [I29] MDN Web Docs, *touch-action*, https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action — ทุติยภูมิ · CC BY-SA 2.5: อ้างอิง
30. [I30] FAA, AC 61-136B *FAA Approval of Aviation Training Devices and Their Use for Training and Experience*, 2018-09-12, https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-136B.pdf — ปฐมภูมิ · งานรัฐบาลสหรัฐฯ (public domain): อ้างและยกข้อความได้
31. [I31] MDN Web Docs, *GamepadHapticActuator: playEffect() method*, https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator/playEffect — ทุติยภูมิ · CC BY-SA 2.5 (ตัวอย่างโค้ด CC0): อ้างอิง (ไม่ได้เปิดซ้ำในการตรวจทาน; ข้อเท็จจริงเรื่อง preempt และพารามิเตอร์ยืนยันจาก [I1] แทน)
32. [I32] Mozilla Bugzilla, *Bug 1704005: Add SecureContext and Permission Policy to Gamepad API*, https://bugzilla.mozilla.org/show_bug.cgi?id=1704005 — ปฐมภูมิ (bug tracker) · เห็นเฉพาะชื่อเรื่องจากผลค้นหา ไม่ได้เปิดอ่านรายละเอียด: ลิงก์เท่านั้น ความเชื่อมั่น ต่ำ

## 11.13 งานที่แนะนำสำหรับ Claude Code
งานที่เปลี่ยน feel ของการบินให้ทำบน branch และเปิด PR ตาม CLAUDE.md
1. **P1 · S** แก้ keymap ให้ปลอดภัย: เอา ControlLeft/ControlRight ออก ย้ายคันเร่งไปที่ `=`/`−`, PageUp/PageDown, Numpad 9/3, ไม่ตีความคีย์การบินเมื่อมี Ctrl/Meta/Alt, เรียก `preventDefault` กับทุกคีย์ที่ผูกขณะบิน, เช็ก `e.repeat` ใน C/T/P/R และล้างคีย์ใน `visibilitychange` แก้ CLAUDE.md (ส่วน Controls) ให้ตรงกัน — T-I-07, T-I-08
2. **P1 · M** สร้าง `src/25-input.js` (ไม่ผูกกับ DOM, ตามโค้ด 11.8 โดยไม่ประกาศ `clamp` ซ้ำกับ 10-atmo.js), เพิ่มเข้า harness (build รวมให้เองตามชื่อไฟล์), เขียน `test/input.test.mjs` — T-I-01, T-I-02, T-I-03, T-I-04, T-I-10, T-I-11
3. **P1 · S** คีย์บอร์ด: ramp ใหม่ (pitch 0.5/2.5, roll 1.0/3.0, rudder 1.0/2.0), Shift = โหมดละเอียด, key latch สำหรับการแตะสั้น, โหมด "ค้างตำแหน่ง" + Numpad 5 — T-I-05, T-I-06, T-I-09
4. **P1 · M** Gamepad API ใน `readInputs`: poll ทุกเฟรม, ข้อความ "กดปุ่มใดก็ได้", จัดการ connected/disconnected (หยุดเวลาเมื่ออุปกรณ์หลุด), โปรไฟล์ Standard Gamepad ค่าเริ่ม, arbitration ระหว่างแหล่ง — T-I-12
5. **P2 · M** คีย์และช่องใหม่: trim (ชั่วคราว 0.5 °/s ของ `trimDe` จนกว่าหัวข้อ 6 จะมี tab), แฟลปตามขั้น, ล้อ, เบรกซ้าย/ขวา/จอด (ต้องแยก `brakeL`/`brakeR` ใน `Aircraft` ร่วมกับหัวข้อ 7) และตัวเลือกปิด auto-trim ใน DIRECT — T-I-10
6. **P2 · L** Wizard ผูกอุปกรณ์ (ปล่อยมือ → ขยับเพื่อเลือกแกน → โยกสุด → ทดลองกับกราฟสด), เก็บใน `localStorage` (`afl-input-v1`), รองรับ HOTAS, pedals + toe brakes และ yoke หลายอุปกรณ์พร้อมกัน ข้อความไทยทั้งหมด — T-I-03, T-I-04, T-I-11
7. **P2 · S** Rumble: `hapticMix` + `RumbleScheduler`, ต่อกับ buffet ของหัวข้อ 1.6, ล้อบนพื้น และการแตะพื้น, ตัวปรับ gain/ปิด, ห่อ `try/catch` — T-I-14
8. **P2 · S** จอสัมผัส: floating origin, dead zone 0.04 + expo, square gate, ปุ่ม "trim ตามคัน", ปรับขนาด R — T-I-15
9. **P3 · S** 1€ filter เปิดใช้อัตโนมัติเมื่อ noise > 0.01 — T-I-13
10. **P3 · M** ตรวจบนโฮสต์จริงทั้ง GitHub Pages และ artifact ของ claude.ai: gamepad (permissions policy), Pointer Lock, Fullscreen + Keyboard Lock, `navigator.vibrate`; บันทึกผลเป็นตารางใน README (ทดสอบด้วยมือ ไม่มี test ID)
11. **P3 · M** โหมดเมาส์เป็น yoke ด้วย Pointer Lock (K = 4, ล้อเมาส์ = trim) — T-I-16 (สูตรสะสมและการจำกัดช่วง) ส่วนความรู้สึกทดสอบด้วยมือ
12. **ไม่ทำในรอบนี้:** force feedback ผ่าน WebHID/HID PID (11.6.3)
