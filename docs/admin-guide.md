# คู่มือการใช้งาน — Admin

คู่มือนี้สำหรับ admin (HR / IT) ที่ดูแลระบบทั้งหมด — จัดการ users, กำหนดสายอนุมัติ, ตั้งค่าโควต้าการลา, อนุมัติคำขอเอกสาร และดูรายงาน

URL admin app: `https://admin-apphr.onrender.com` (หรือ URL ที่ทีมแจ้ง — **คนละ URL กับฝั่งพนักงาน**)

---

## 1. เข้าสู่ระบบ

1. เข้า admin URL ระบบจะ redirect ไปหน้า Login
2. กรอก **Email** และ **Password** ของบัญชี admin (`admin@apphr.test` หรือบัญชีที่ super-admin สร้างให้)
3. กด **Sign in**

> Admin login ใช้ endpoint `/auth/admin/login` แยกจาก employee login — บัญชี employee จะเข้า admin app ไม่ได้ และในทางกลับกัน

หลัง login จะพาไปหน้า **Dashboard** อัตโนมัติ

---

## 2. โครงสร้างเมนู

| เมนู | Path | หน้าที่ |
|---|---|---|
| Dashboard | `/dashboard` | ภาพรวมสถานะการเข้างาน + คำขอ pending วันนี้ |
| Users | `/users` | รายชื่อพนักงาน + เพิ่ม/แก้ไข/ลบ |
| Approvals | `/approvals` | กำหนดผู้อนุมัติให้พนักงานแต่ละคน |
| Requests | `/requests` | คำขอทั้งหมดในระบบ + approve/reject/edit/delete |
| Leave entitlement | `/leave` | โควต้าการลาของพนักงานแต่ละคน |
| Reports | `/reports` | รายงาน check-in / leave / overtime |
| Data management | `/data-management` | ตั้งค่า Company info และ Benefits |
| Admin accounts | `/admin-accounts` | จัดการบัญชี admin (เพิ่ม / reset password / ลบ) |

---

## 3. Dashboard

หน้าแรกของ admin app — แสดงสถานะของพนักงานในวันที่เลือก

### 3.1 Date selector
- เริ่มต้นแสดงวันนี้ — เลือกวันอื่นได้ผ่าน date picker หรือปุ่ม `‹` / `›` เพื่อเลื่อนวัน
- มีปุ่ม "กลับไปยังวันที่ปัจจุบัน" เมื่อไม่ได้อยู่วันนี้

### 3.2 Summary cards (4 ใบ)

| Card | นับจาก |
|---|---|
| **เช็คอินแล้ววันนี้** | จำนวนพนักงานที่เช็คอินที่ออฟฟิศ + WFH |
| **WFH** | เช็คอินแบบ Work From Home |
| **นอกสถานที่** | เช็คอิน offsite จริง (ไม่นับ Work Outside ที่ยังไม่ได้ check-in) |
| **ลา** | มี approved leave ครอบวันนั้น |

### 3.3 สถานะทีม — ตามแผนก

แสดงเป็น **dot grid** แยกตามแผนก — แต่ละ dot แทนพนักงาน 1 คน เปลี่ยนสีตามสถานะ:

| สี | สถานะ |
|---|---|
| เขียว | ออฟฟิศ |
| ฟ้า | WFH |
| ส้ม | นอกสถานที่ |
| แดง | ลา |
| เทา | ยังไม่เช็คอิน |

Hover ที่ dot จะเห็นชื่อพนักงาน + สถานะ

### 3.4 รออนุมัติ (panel ขวา)

- แสดง **คำขอ pending สูงสุด 8 รายการ** ที่ active ในวันที่เลือก
- ครอบคลุมทุกประเภท: Leave, Overtime, Work Outside, **Request Documents**
- กดปุ่ม **✓** อนุมัติ หรือ **✕** ปฏิเสธได้ที่นี่
- ถ้าต้องการดูทั้งหมด → ไปหน้า **Requests**

> **กฎสำคัญ**: สถานะใน Dashboard ใช้ check-in เป็นหลักเสมอ + แสดง "ลา" ก็ต่อเมื่อมี approved leave — Work Outside ที่อนุมัติแล้วแต่ไม่ได้ check-in **ไม่แสดงเป็นนอกสถานที่** (พนักงานยังต้อง check in เพื่อยืนยันการเข้างาน)

---

## 4. Users — จัดการพนักงาน

### 4.1 รายชื่อ
- ตารางพนักงานทั้งหมด — ชื่อ, รหัสพนักงาน, แผนก, ระดับ, ประเภทการจ้าง, วันเริ่มงาน
- ค้นหาด้วยชื่อ/รหัส/แผนก

### 4.2 เพิ่มพนักงานใหม่
1. กดปุ่ม **+ เพิ่มพนักงาน** ที่หน้า Users (จะพาไป `/users/new`)
2. กรอกข้อมูล: รหัสพนักงาน, ชื่อ (TH/EN), ชื่อเล่น, email, ตำแหน่ง, แผนก, ระดับ, ประเภทการจ้าง, วันเริ่มงาน
3. รหัสผ่านเริ่มต้นจะถูก generate ให้: `<รหัสพนักงาน>@123` เช่น H0050 → `H0050@123`
4. ระบบจะสร้างเสร็จแล้วเพิ่ม leave balances เริ่มต้นทุกประเภทอัตโนมัติ
5. **แจ้งพนักงานให้เปลี่ยน password ทันที** ที่ login ครั้งแรก

### 4.3 แก้ไข / ดูโปรไฟล์
- กดที่แถวพนักงานเพื่อเปิด `/users/:employeeId`
- แก้ไขข้อมูลส่วนตัว, ที่อยู่, ผู้ติดต่อฉุกเฉิน, การศึกษา, ตำแหน่ง, ธนาคาร, เงินเดือน, เอกสาร, ประวัติตำแหน่ง

### 4.4 Reset password ของพนักงาน
- ที่หน้าโปรไฟล์ มีปุ่ม "Reset Password" → กรอก password ใหม่ → admin override ได้โดย **ไม่ต้องรู้ password เก่า** (เป็นสิทธิ์เฉพาะ admin)

### 4.5 ลบพนักงาน
- ที่หน้าโปรไฟล์ หรือรายการ → **soft delete** (set `is_active = false`)
- หลังลบ พนักงานคนนั้น login ไม่ได้ + ไม่ขึ้นใน lookup ของ approver_mappings อีกต่อไป

---

## 5. Approvals — กำหนดผู้อนุมัติ

### 5.1 หลักการ

ระบบใช้ **per-user approver assignment** — admin กำหนด **1–2 คน** ที่จะเป็น approver ของพนักงานคนหนึ่ง

ระดับที่เลือกเป็น approver ได้:

| ระดับของผู้ส่ง | เลือกใครเป็น approver ได้บ้าง |
|---|---|
| Project Level | Director Level, Board Level |
| Director Level | Board Level |
| Board Level | (ไม่ต้อง — ไม่มีระดับสูงกว่า) |

### 5.2 ขั้นตอน

1. เปิด `/approvals` — เห็นรายชื่อพนักงาน (ตัด Board ออกเพราะไม่ต้อง approver)
2. คลิกพนักงานที่ต้องการ — แสดงผู้อนุมัติปัจจุบันใน panel ขวา
3. กด **Edit**
4. เลือก approver จาก dropdown (สูงสุด 2 ช่อง) — ระบบ filter เฉพาะคนที่มี level เหมาะสม
5. กด **Save** — ระบบบันทึก mapping ลง `approver_mappings` table

### 5.3 ผลของ approver mapping

- เมื่อพนักงานคนนั้นส่งคำขอ → ระบบ resolve approver names เป็น "คุณ A / คุณ B" แสดงที่คอลัมน์ "ผู้อนุมัติ"
- เฉพาะ approver ที่ถูก assign เท่านั้นถึงจะเห็นคำขอใน "Requests for Review" และอนุมัติได้
- **ถ้าไม่ assign ใคร** → คำขอจะแสดง "ผู้อนุมัติ: แอดมิน" และต้องให้ admin อนุมัติเอง

---

## 6. Requests — คำขอทั้งหมด

หน้านี้รวมคำขอจากทุกตาราง (leave_requests + attendance_exception_requests + document_requests):

- กรองตามสถานะ / ประเภท / ผู้ส่ง / วันที่
- กดปุ่ม approve / reject ในแต่ละแถว
- กดเพื่อ edit (เฉพาะ admin) — เปลี่ยน type / detail / startDate / endDate / days (เฉพาะ leave)
- กดถังขยะเพื่อ delete (soft delete)

### 6.1 ความแตกต่างของแต่ละประเภท

| ประเภท | Table | ใครอนุมัติได้ |
|---|---|---|
| Leave (11 ชนิด) | `leave_requests` | approver chain หรือ admin |
| Work Outside | `attendance_exception_requests` | approver chain หรือ admin |
| Overtime | `leave_requests` (type='Overtime') | approver chain หรือ admin |
| **Request Documents** | `document_requests` | **เฉพาะ admin** (Board/Director อนุมัติไม่ได้) |

> Document requests ถูกออกแบบให้ส่งตรงไปที่ HR (admin) เท่านั้น — Board/Director จะไม่เห็นใน "Requests for Review" ของพวกเขา

---

## 7. Leave entitlement — โควต้าการลา

### 7.1 ดูโควต้า
- เปิด `/leave` → ตาราง employee × leave type
- แสดงสิทธิ์เริ่มต้นของปี + carry-over (สำหรับ Annual Leave) + ที่ใช้ไป

### 7.2 แก้ไขโควต้าของพนักงาน
1. คลิกที่ row พนักงาน → form แก้
2. ใส่จำนวนวันใหม่สำหรับแต่ละประเภท
3. สำหรับ Annual Leave มี field `_annualCarryOver` แยก (จำกัด 0–20 วัน)
4. Save → บันทึกลง `leave_balances` table ของปีปัจจุบัน

### 7.3 Snapshot สิ้นปี (annual carry forward)

ปลายปี / ต้นปีใหม่ ให้กดปุ่ม **"Snapshot annual carry"** → ระบบ:
1. คำนวณ remaining = quota − used (จาก approved + pending requests ปีที่เลือก)
2. ตั้ง `carry_over_days` ใหม่ = `min(remaining, 20)` ของทุกพนักงาน
3. คืน summary (per-user: before, after, excess) — admin สามารถ export เก็บได้

> ทำ snapshot **ครั้งเดียวต่อปี** — รันซ้ำจะ overwrite carry-over ของปีนั้น

---

## 8. Reports

หน้า `/reports` รวบรวมข้อมูลเพื่อ export / วิเคราะห์:
- จำนวนวันเช็คอินต่อพนักงานต่อเดือน
- การใช้ leave แต่ละประเภท
- Overtime hours

(หน้านี้อาจมี filter เพิ่มเติม เช่น เลือกช่วงเวลา / แผนก ตามที่ทีมเพิ่มไว้)

---

## 9. Data management

### 9.1 Company info (`/data-management/company`)
- แก้ชื่อบริษัท, เลขผู้เสียภาษี, ที่อยู่, จำนวนพนักงาน
- ข้อมูลนี้แสดงใน Account > บริษัท ของฝั่งพนักงาน

### 9.2 Benefits (`/data-management/benefits`)
- แก้รายการสวัสดิการ: ประกันสังคม, ประกันกลุ่ม, การเบิกชุดสูท, ชุดทำงาน, อุปกรณ์
- เพิ่ม/แก้ title (TH/EN), status, detail
- ข้อมูลนี้แสดงใน Account > สวัสดิการ ของฝั่งพนักงาน

ทั้ง 2 ส่วนเก็บใน file `data/settings.json` ของ backend

---

## 10. Admin accounts (`/admin-accounts`)

จัดการบัญชี admin คนอื่นๆ:

### 10.1 เพิ่ม admin ใหม่
1. กด **+ เพิ่ม admin**
2. กรอก email, ชื่อภาษาไทย, รหัสผ่าน
3. ระบบสร้าง user + employee + assign role 'admin' ใน Supabase

### 10.2 Reset password ของ admin คนอื่น
- กดปุ่ม **Reset Password** ใน row นั้น → กรอก password ใหม่ → save
- ไม่ต้องรู้ password เก่า (admin acting on another admin)

### 10.3 ลบ admin
- ปุ่มลบ → soft delete (is_active = false)
- **ไม่ควรลบบัญชี admin คนสุดท้าย** — ระบบจะไม่มีใครจัดการได้

---

## 11. Backend API endpoints ที่ admin เข้าถึง

| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/api/auth/admin/login` | Login admin (token) |
| GET | `/api/users` | รายชื่อพนักงานทั้งหมด |
| POST | `/api/users` | สร้างพนักงานใหม่ |
| PATCH | `/api/users/:id` | แก้โปรไฟล์ + approver mapping |
| PATCH | `/api/users/:id/password` | Reset password (admin override) |
| DELETE | `/api/users/:id` | Soft delete |
| GET | `/api/admins` | รายชื่อ admin |
| POST | `/api/admins` | สร้าง admin ใหม่ |
| GET | `/api/requests?all=1` | ดูทุก request |
| PATCH | `/api/requests/:id` | Approve / reject / edit |
| GET | `/api/checkins?all=1` | ดู check-in ทุกคน |
| DELETE | `/api/checkins/:id` | ลบ check-in (admin override) |
| GET / PATCH | `/api/settings` | Company info + benefits |
| GET / PUT | `/api/entitlements` | Leave balances |
| POST | `/api/entitlements/snapshot-carry` | Year-end carry snapshot |

> **เหตุผลที่ admin เห็นทุกอย่าง**: backend ตรวจ `req.user.role === 'admin'` ก่อนใส่ scope filter — admin bypass scope ทั้งหมด

---

## 12. Troubleshooting

### Login admin ไม่ได้
- ใช้ URL `/admin/login` (POST) ไม่ใช่ `/login` — frontend ทำให้อัตโนมัติ
- ถ้าจำ password ไม่ได้ ต้องให้ admin อีกคน reset ให้ผ่าน `/admin-accounts`
- ถ้าเป็น admin คนสุดท้าย → ต้อง reset hash ตรงๆ ที่ Supabase users table

### พนักงานบอก "ส่งคำขอแล้วไม่เห็น"
- เช็คใน `/requests` admin app (เห็นทุก request) ว่า record มีจริงไหม
- ถ้ามี → ผู้ส่งอาจดูผิด filter (เปลี่ยนเป็น "ทั้งหมด")
- ถ้าไม่มี → backend POST อาจ fail — ดู Render logs

### Approver บอก "ไม่เห็นคำขอของลูกทีม"
- เช็คใน `/approvals` ว่า admin assign approver ให้ถูกคนไหม
- ตรวจว่า level ของ approver ตรงกับ eligibility table (Project → Director/Board, Director → Board)
- ถ้าเป็น Document request — approver chain ไม่ใช้กับ document (admin only)

### Dashboard นับ "ลา" ผิด
- คนที่ขอ Work Outside ไม่ได้นับเป็น "ลา" — ต้องเป็น **approved Leave type เท่านั้น**
- ถ้านับขาด → ตรวจว่า request approved จริง (status = 'approved') และวันที่อยู่ในช่วง startDate–endDate

### Sessions timeout ระหว่างทำงาน
- Token หมดอายุที่ 12 ชั่วโมง (ค่าเริ่มต้นจาก `JWT_EXPIRES_IN`)
- หลังหมดอายุ — API ตอบ 401, frontend จะ auto-logout และพากลับ /login
- เพิ่มเวลาได้โดยตั้ง env var `JWT_EXPIRES_IN=24h` ที่ backend
