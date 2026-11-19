import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
E = [
# JSON a1 note
('"note": "ความชันของการแยกตัว; Citation II ระบุจากการบินได้ 20.6-23.9 ที่ h 1500-4000 m"',
 '"note": "ความชันของการแยกตัว; Citation II: เส้นแนวโน้ม a1 = 18.67 + 1.309e-3*h (h เป็น m) ให้ 20.6-23.9 ที่ h 1500-4000 m (คำนวณจากเส้นแนวโน้มใน [A11]); วรรณกรรมที่ [A11] อ้าง 14.9-25.7"'),
# dCD_sep
('"note": "แรงต้านเพิ่มเมื่อแยกตัวเต็ม (Citation C_DX 0.27, วรรณกรรม ~0.2)"',
 '"note": "แรงต้านเพิ่มเมื่อแยกตัวเต็ม; Citation II ระบุได้ราว 0.2 ซึ่งผู้เขียนว่าสอดคล้องกับวรรณกรรม (AT-26 Xavante 0.2, VFW-614 0.22, C-160 ~0.40) [A11]"'),
# CmX
('"note": "pitch break; Citation C_mX -0.14, วรรณกรรม ~-0.12"',
 '"note": "pitch break; Citation II ระบุได้ราว -0.12; วรรณกรรมที่ [A11] อ้าง: AT-26 Xavante -0.08"'),
# rms_full
('"note": "ที่ X=0; Citation อนุมานจาก H0 ได้ ~0.09 g แนวดิ่ง (สมมติ white noise ความเข้ม 1)"',
 '"note": "ที่ X=0; ค่าตั้งของเรา: az 0.05 g, ay = 0.05/sqrt(10) ~ 0.016 g จาก PSD แนวดิ่ง ~10 เท่าแนวข้าง [A11]; ถ้าตีความ H0 ของ Citation ว่าใช้ white noise ความเข้ม 1 จะได้ ~0.09 g แนวดิ่ง (การอนุมานเอง)"'),
# omega_hat
('''   "omega_hat": {
    "v": [
     0.27,
     0.42
    ],''',
 '''   "omega_hat": {
    "v": [
     0.24,
     0.42
    ],'''),
('"note": "Omega*b/(2V) อนุมานจาก TP-2644 ด้วย V_descent จากสมดุลแรง"',
 '"note": "Omega*b/(2V) อนุมานจากอัตราหมุนที่วัดใน TP-2644 (145-208 deg/s, 1,530-1,538 lb, 98.11 ft2, span 24.46 ft) กับ V_descent จากสมดุลแรง: ใช้ C_D (แรงต้าน = น้ำหนัก) ได้ 0.24-0.38, ใช้ C_R ได้ 0.27-0.42 (a1rev_check.mjs)"'),
# descent_trainer
('''   "descent_trainer": {
    "v": 8400,''',
 '''   "descent_trainer": {
    "v": 9500,'''),
('"note": "V=sqrt(2W/(rho S C_R)), C_R(50 deg)=1.21 -> 42.7 m/s"',
 '"note": "ค่าประมาณ: เส้นทางบินเกือบดิ่ง แรงต้านสมดุลน้ำหนัก V=sqrt(2W/(rho S C_D)); C_D(43-53 deg) 0.78-0.98 -> 47-53 m/s (9,300-10,500 fpm); ถ้าใช้ C_R แทน C_D (ขอบล่าง) ได้ 41-45 m/s (8,100-8,800 fpm) ที่ alpha 40-60 deg"'),
]
for a, b in E:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:70]); continue
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
