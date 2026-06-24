# SwizerStore

ระบบร้านค้าออนไลน์แบบ Full-stack สำหรับ **Swizer Superfoods** พัฒนาด้วย Nuxt 4 รองรับตั้งแต่การเลือกซื้อสินค้า สมัครสมาชิก ชำระเงิน และติดตามคำสั่งซื้อ ไปจนถึงระบบหลังบ้านสำหรับจัดการสินค้า สต็อก เนื้อหา คำสั่งซื้อ และการคืนเงิน

![SwizerStore](public/Home/1200x600-1-scaled.jpg)

## ความสามารถของระบบ

### หน้าร้านและลูกค้า

- แสดงสินค้า หมวดหมู่ รายละเอียดสินค้า ราคาปกติ และราคาลด
- ค้นหาและกรองสินค้า พร้อมตรวจสอบสถานะสินค้าและสต็อก
- ตะกร้าสินค้าแบบ Persisted Cart เก็บรายการไว้ในเบราว์เซอร์
- Checkout ได้ทั้งผู้เยี่ยมชมและสมาชิก
- บันทึกข้อมูลที่อยู่จัดส่งสำหรับสมาชิก
- ดูประวัติและรายละเอียดคำสั่งซื้อ
- ยกเลิกคำสั่งซื้อตามเงื่อนไขของสถานะรายการ
- หน้าเนื้อหาข่าวสาร วิธีชำระเงิน เกี่ยวกับเรา และติดต่อร้านค้า
- รองรับภาษาไทย อังกฤษ และจีน

### สมาชิกและการยืนยันตัวตน

- สมัครสมาชิกและยืนยันอีเมลก่อนเข้าใช้งาน
- เข้าสู่ระบบด้วย JWT และกำหนดสิทธิ์ตาม Role
- ลืมรหัสผ่านและตั้งรหัสผ่านใหม่ผ่านอีเมล
- แก้ไขอีเมล รหัสผ่าน และข้อมูลจัดส่งในหน้าโปรไฟล์
- จำกัดความถี่ของคำขอสำคัญ เช่น สมัครสมาชิกและ Checkout

### การชำระเงิน

- ชำระด้วยบัตรเครดิต/เดบิตผ่าน Omise
- ชำระผ่าน PromptPay QR Code
- จองสต็อกระหว่างรอชำระ PromptPay และหมดอายุอัตโนมัติภายใน 15 นาที
- รับผลการชำระเงินผ่าน Omise Webhook
- ตรวจสอบและปรับสถานะการชำระเงินของคำสั่งซื้อ
- ส่งอีเมลยืนยันเมื่อชำระเงินสำเร็จ

### ระบบหลังบ้าน

- Dashboard สรุปยอดขาย รายได้ สถานะคำสั่งซื้อ และสินค้าที่ใกล้หมด
- แจ้งเตือนคำสั่งซื้อใหม่และรายการชำระเงินล่าสุด
- จัดการสินค้า รูปภาพ แกลเลอรี ราคาโปรโมชัน สต็อก และสถานะเผยแพร่
- จัดการหมวดหมู่สินค้าและหมวดหมู่ย่อย
- จัดการข่าวสารด้วย Rich Text Editor
- จัดการคำสั่งซื้อ สถานะจัดส่ง และหมายเลขติดตามพัสดุ
- ตรวจสอบการชำระเงินและส่งอีเมลคำสั่งซื้อซ้ำ
- คืนเงินผ่าน Omise หรือบันทึกการคืนเงินแบบ Manual
- รองรับการคืนเงินบางส่วนและเต็มจำนวน
- จัดการบัญชีผู้ดูแลและรายชื่อผู้รับอีเมลแจ้งเตือน

ระบบแบ่งสิทธิ์หลังบ้านเป็น 2 ระดับ:

- `admin` — จัดการสินค้า หมวดหมู่ ข่าว และไฟล์อัปโหลด
- `super_admin` — เข้าถึงข้อมูลคำสั่งซื้อ การคืนเงิน ผู้ดูแลระบบ และการตั้งค่าผู้รับอีเมลเพิ่มเติม

## เทคโนโลยีหลัก

| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend / Backend | Nuxt 4, Vue 3, TypeScript |
| UI | Nuxt UI 4, Tailwind CSS |
| State Management | Pinia, pinia-plugin-persistedstate |
| Database | MySQL / MariaDB, mysql2 |
| Authentication | JWT, bcryptjs |
| Payment | Omise API, Credit Card, PromptPay |
| Email | SMTP over TLS |
| Rich Text | Tiptap |

## เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.development` ที่ root ของโปรเจกต์ โดยห้าม commit ไฟล์นี้ขึ้น Git

```dotenv
ENV_NAME=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=
DB_PASS=
DB_NAME=

BASE_URL=http://localhost:3000
API_BASE=http://localhost:3000

TOKEN_SECRET=
TOKEN_EXPIRES=7d
TOKEN_NAME=swizer_token

OMISE_PUBLIC_KEY=
OMISE_SECRET_KEY=
OMISE_WEBHOOK_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_SECURE=false
ADMIN_EMAIL=
```

`OMISE_PUBLIC_KEY` เป็นค่าที่ส่งไปยังเบราว์เซอร์ ส่วน `OMISE_SECRET_KEY`, `OMISE_WEBHOOK_SECRET`, `TOKEN_SECRET`, รหัสผ่านฐานข้อมูล และรหัสผ่าน SMTP ต้องเก็บไว้ฝั่ง Server เท่านั้น

สามารถสร้าง `TOKEN_SECRET` แบบสุ่มได้ด้วยคำสั่ง:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. เตรียมฐานข้อมูล

โปรเจกต์ใช้ MySQL/MariaDB และต้องมีตารางหลัก `users`, `products`, `categories` และ `news` ก่อน จากนั้นให้รันไฟล์ใน `server/database/migrations` ตามลำดับชื่อไฟล์ เพื่อเพิ่มระบบคำสั่งซื้อ การชำระเงิน โปรไฟล์จัดส่ง การยืนยันอีเมล Role และการคืนเงิน

> อย่านำ Database dump, ข้อมูลผู้ใช้จริง หรือ Password hash ขึ้น Git

### 4. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | รายละเอียด |
| --- | --- |
| `npm run dev` | รัน Development Server ด้วย `.env.development` |
| `npm run build:dev` | Build สำหรับ Development |
| `npm run build:uat` | Build สำหรับ UAT ด้วย `.env.uat` |
| `npm run build:prod` | Build สำหรับ Production ด้วย `.env.production` |
| `npm run preview` | Preview Production Build |
| `npm run run:build` | รัน Nitro Server จาก `.output` |

## โครงสร้างโปรเจกต์

```text
app/
├── components/          # UI และส่วนประกอบของหน้าร้าน/หลังบ้าน
├── composables/         # Logic ที่นำกลับมาใช้ซ้ำ
├── layouts/             # Layout หน้าร้านและ Admin
├── pages/               # Routing ของ Nuxt
├── plugins/             # Auth refresh และระบบแปลภาษา
└── store/               # Pinia stores สำหรับ Auth และ Cart

server/
├── api/                 # REST API ของระบบ
├── database/migrations/ # Database migrations
├── middleware/          # Authentication และ Authorization
└── utils/               # Database, Payment, Email และ Business logic

public/                  # Static assets
uploads/                 # Runtime uploads (ไม่ถูก commit)
```

## ความปลอดภัย

- ไฟล์ `.env.*`, runtime uploads และ local database dump ถูก ignore จาก Git
- รหัสผ่านผู้ใช้จัดเก็บเป็น bcrypt hash
- API หลังบ้านตรวจ Role ระหว่าง `admin` และ `super_admin`
- Endpoint สำคัญมี Rate Limit และตรวจสอบข้อมูลก่อนบันทึก
- Webhook ตรวจสอบลายเซ็นก่อนอัปเดตสถานะการชำระเงิน

ก่อน Deploy ควรใช้ HTTPS, กำหนด Secret ใหม่สำหรับแต่ละ Environment และตั้งค่า Omise Webhook ให้ชี้มายัง `/api/webhook/omise`

## License

ยังไม่ได้กำหนด License สำหรับโปรเจกต์นี้ การเผยแพร่ Source Code ไม่ได้หมายความว่าอนุญาตให้นำชื่อแบรนด์ รูปภาพ หรือเนื้อหาไปใช้ต่อโดยอัตโนมัติ
