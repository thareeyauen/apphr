# คู่มือการใช้งาน — ผู้อนุมัติ (Board / Director Level)

คู่มือนี้สำหรับผู้บริหารที่ admin assign ให้เป็น **approver** ของพนักงานคนใดคนหนึ่ง — มีหน้าที่ **ตรวจสอบและอนุมัติคำขอ** (ลา, OT, Work Outside) ของลูกทีม

URL: `https://apphr.onrender.com` (ใช้แอปฯ เดียวกับพนักงาน)

> **หมายเหตุ**: คู่มือนี้ครอบคลุมเฉพาะหน้าที่ของ approver ส่วนการ check-in และข้อมูลส่วนตัวให้ดู [user-guide.md](./user-guide.md)

---

## 1. ใครเห็นอะไรในระบบนี้

| สิทธิ์ | Project Level | Director Level | Board Level |
|---|---|---|---|
| Check in ของตัวเอง | ✓ | ✓ (ไม่บังคับ) | ✓ (ไม่บังคับ) |
| ส่งคำขอลา / OT / Work Outside / Document | ✓ | ✓ | ✓ |
| **อนุมัติคำขอของลูกทีมที่ admin assign** | — | ✓ | ✓ |
| เห็นสถานะ check-in/leave ของคนทั้งบริษัท | — | — | ✓ |
| อนุมัติ Request Documents | — | — | — (เฉพาะ admin) |

- **ระดับ Board/Director ที่ไม่ถูก assign** เป็น approver ของใครก็จะไม่มีอะไรให้อนุมัติ
- **Board Level** ที่อยู่แผนก "Board of Directors" จะเห็นสถานะของพนักงานทุกแผนกใน Landing
- **คำขอเอกสาร (Request Documents)** ไปที่ admin โดยตรงเสมอ — approver ไม่เกี่ยวข้อง

---

## 2. การเข้าสู่ระบบ

เหมือนพนักงานทั่วไป — ใช้ Email + Password ที่ HR ส่งให้ (ดู [user-guide.md §1](./user-guide.md#1-เข้าสู่ระบบ))

หลัง login ระบบจะพาไปหน้า Landing โดยอัตโนมัติ

---

## 3. ดูรายการคำขอที่ต้องอนุมัติ

### 3.1 เปิดหน้า Request

กดไอคอนแฟ้มเอกสารที่ Bottom Navigation จะเห็น 2 แท็บ:

- **My Requests** — คำขอของตัวเอง (ถ้ามี)
- **Requests for Review** — คำขอจากพนักงานที่คุณเป็น approver พร้อม badge ตัวเลขแสดง pending count

### 3.2 รายละเอียดในตาราง Requests for Review

| คอลัมน์ | ความหมาย |
|---|---|
| รหัสคำขอ | `REQ-xxxxxx`, `WO-xxxxxx`, `DOC-xxxxxx` |
| ผู้ส่ง | ชื่อ + รหัสพนักงาน |
| ประเภท / รายละเอียด | เช่น "ลาป่วย · 12 พ.ค. 2569 (1 วัน) · เป็นไข้" |
| วันที่ส่ง | วันที่ submit คำขอ |
| ผู้อนุมัติ | ชื่อ approver(s) ที่ admin assign |
| สถานะ | รออนุมัติ / อนุมัติ / ไม่อนุมัติ |
| Action | ปุ่ม ✓ อนุมัติ และ ✕ ปฏิเสธ |

### 3.3 กรองและค้นหา

- **กรองสถานะ**: dropdown "ทั้งหมด / รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ"
- **ค้นหา**: ช่อง search รับ รหัสคำขอ, ประเภท, รายละเอียด

### 3.4 Pagination

แต่ละหน้าแสดง 10 รายการ — กดปุ่ม `‹`, `1`, `2`, ..., `›` เพื่อเปลี่ยนหน้า

---

## 4. อนุมัติ / ปฏิเสธคำขอ

### 4.1 อนุมัติ

1. ที่แถวของคำขอนั้น กดปุ่ม **✓** (สีเขียว) ในคอลัมน์ Action
2. ป๊อปอัปยืนยัน "ต้องการอนุมัติคำขอ `REQ-xxxxxx` ใช่หรือไม่?"
3. กด **ยืนยันอนุมัติ** (หรือ **Cancel** เพื่อยกเลิก)
4. สถานะเปลี่ยนเป็น "อนุมัติ" → ผู้ส่งจะเห็นสถานะใหม่ในหน้า Request ของตัวเอง

### 4.2 ปฏิเสธ

1. กดปุ่ม **✕** (สีแดง) ในคอลัมน์ Action
2. ป๊อปอัปยืนยัน "ต้องการไม่อนุมัติคำขอ `REQ-xxxxxx` ใช่หรือไม่?"
3. กด **ยืนยันไม่อนุมัติ**
4. สถานะเปลี่ยนเป็น "ไม่อนุมัติ" → ผู้ส่งเห็น

### 4.3 ข้อจำกัด

- **อนุมัติคำขอของตัวเองไม่ได้** — ระบบตอบ 403 `cannot self-approve`
- **คำขอเอกสาร (Request Documents) อนุมัติไม่ได้** — เฉพาะ admin role เท่านั้น (Server ตอบ 403 `document requests can only be approved by admin`)
- **คำขอที่อนุมัติ/ไม่อนุมัติแล้ว** เปลี่ยนสถานะกลับไม่ได้ (ต้องให้ admin แก้)

---

## 5. ดูสถานะทีมในหน้า Landing

หน้า Landing (home) ของ Board/Director ก็มี **การ์ดสถานะทีม** เหมือนพนักงาน แต่ขอบเขตต่างกัน:

- **Director Level**: เห็นสถานะเฉพาะพนักงานในแผนกเดียวกัน
- **Board Level** (แผนก Board of Directors): เห็นสถานะของพนักงานทุกคนทั้งบริษัท

สถานะแต่ละคนคำนวณจาก **check-in record** เป็นหลัก + แสดง "ลา" เมื่อมี approved leave ครอบวันนั้น (Work Outside ไม่ override สถานะ — พนักงานยังต้อง check in)

---

## 6. ส่งคำขอของตัวเอง

แม้จะเป็น approver ก็ส่งคำขอลา/OT/Work Outside/Document ได้เหมือนพนักงานทั่วไป — flow เดียวกัน (ดู [user-guide.md §5](./user-guide.md#5-หน้า-request-คำขอ))

**ความต่าง**:
- **Director Level**: คำขอจะถูกส่งไปให้ **Board Level** อนุมัติ
- **Board Level**: คำขอจะส่งตรงไปที่ admin (เพราะไม่มีระดับสูงกว่า)

---

## 7. Notification

> ปัจจุบันระบบ **ยังไม่มี email/push notification** เมื่อมีคำขอใหม่ — approver ต้องเข้ามาเช็คเองที่หน้า Request เป็นระยะ
>
> Badge ตัวเลขที่แท็บ "Requests for Review" จะแสดง pending count ทุกครั้งที่เปิดหน้า

---

## 8. Troubleshooting

### มองไม่เห็นแท็บ "Requests for Review"
- ตรวจ employee level ของตัวเอง (Account > งาน) ต้องเป็น **Board Level** หรือ **Director Level**
- ถ้า level ถูกต้องแต่ยังไม่เห็น → แจ้ง admin ให้ assign คุณเป็น approver ของพนักงานคนใดคนหนึ่งก่อน (admin จะทำที่หน้า Approvals)

### เห็นแท็บ แต่ตารางว่างเปล่า
- ปกติ ถ้ายังไม่มีคำขอใหม่จากลูกทีม
- หรือเปลี่ยน filter เป็น "ทั้งหมด" เพื่อดู approved/rejected ย้อนหลัง

### กดอนุมัติแล้วขึ้น error
- เปิด DevTools → Network → ดู response ของ `PATCH /api/requests/<id>`
  - **403 cannot self-approve** = พยายามอนุมัติคำขอของตัวเอง
  - **403 document requests can only be approved by admin** = คำขอเอกสารต้องให้ admin อนุมัติ
  - **403 forbidden** = ไม่ได้ถูก assign เป็น approver ของผู้ส่งคนนี้
  - **401 missing/invalid token** = session หมดอายุ — login ใหม่
