# Third tightening pass for two new paragraphs.
import sys
p=sys.argv[1]; L=open(p,encoding='utf8').read().split('\n')
def setline(prefix,new):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); L[idx[0]]=new
setline('**การป้อนคำสั่งของ GeoFS**', '**การป้อนคำสั่งของ GeoFS** (จาก typings) มีห้าโหมด (mouse, keyboard, orientation, touch, joystick) แต่ละโหมดมี `sensitivity`, `exponential` และ `mixYawRoll` (รัดเดอร์ตามโรล) แป้นพิมพ์มี increment ต่อแกนและ `recenterRatio` จอยมี `deadZoneUp/Down` trim มี `elevatorTrimMin/Max/Step` [S26] ตรงกับโครงที่หัวข้อ 11 เสนอ คลาส `rigidBody` มี `integrateVelocities`, `integrateTransform`, `applyImpulse` [S26] ชื่อคล้าย `btRigidBody` ของ Bullet จึงอาจใช้ semi-implicit Euler ต่อเฟรม (ข้อสังเกตของผู้วิจัย ยังไม่ยืนยัน)')
setline('- **trim บวกเพิ่มหรือเป็นตำแหน่งพัก:**', '- **trim บวกเพิ่มหรือเป็นตำแหน่งพัก:** MSFS ให้ trim "adds to the elevator deflection" [S20] ส่วน X-Plane 12 เปลี่ยนจากการบวกมาเป็นตำแหน่งพักของคัน [S15] ไม่ขัดกันทางฟิสิกส์ถ้าแยกชนิด trim (tab หรือ stabilizer [S30]) แต่ทั้งสองไม่บอกว่าผลรวมถูกตัดที่ขีดของ elevator หรือไม่ จึงเสนอให้ระบุชนิดต่อเครื่อง')
s='\n'.join(L); open(p,'w',encoding='utf8').write(s); print(len(s.encode()))
