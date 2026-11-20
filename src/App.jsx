import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from './services/auth'
import './App.css'

const ROLES = [
  {
    id: 'customer',
    name: 'ลูกค้า',
    line: 'สั่งอาหารที่โต๊ะ',
    href: '/customer/welcome',
    cta: 'เริ่มสั่งอาหาร',
    features: [
      'สแกน QR Code ประจำโต๊ะ (หรือเปิดลิงก์ของโต๊ะ) เพื่อเริ่มสั่ง',
      'เลือกหมวดหมู่ ค้นหา และกรองเมนู แล้วเพิ่มลงตะกร้า',
      'ดูสถานะอาหารแบบเรียลไทม์: รอรับออเดอร์ → กำลังเตรียม → เสิร์ฟแล้ว',
      'กดเรียกพนักงาน (Service Call) หรือขอเช็กบิล (Bill Request)',
    ],
  },
  {
    id: 'staff',
    name: 'พนักงาน',
    line: 'รับและอัปเดตออเดอร์',
    href: '/staff',
    cta: 'เปิดหน้าจัดการออเดอร์',
    features: [
      'ออเดอร์ใหม่เข้ามาอัตโนมัติ พร้อมเลขโต๊ะและเวลาที่สั่ง',
      'เปลี่ยนสถานะรายการได้ทันที: รับออเดอร์ → กำลังทำ → เสิร์ฟแล้ว',
    ],
  },
  {
    id: 'admin',
    name: 'ผู้จัดการ / แอดมิน',
    line: 'ดูแลร้านทั้งหมด',
    href: '/admin',
    cta: 'เปิด Dashboard ร้าน',
    features: [
      'ผังโต๊ะ: ว่าง / กำลังใช้งาน / รอเช็กบิล และเคลียร์โต๊ะเมื่อลูกค้ากลับ',
      'จัดการเมนู: เพิ่ม แก้ราคา ซ่อนเมนูที่หมด หรือลบเมนู',
      'สถิติร้าน: ยอดขายรายวัน เมนูยอดฮิต จำนวนออเดอร์รวม',
    ],
  },
]

function Tick() {
  return (
    <svg className="tick" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 17 C8 20, 10 24, 12 27 C16 16, 22 8, 30 3" />
    </svg>
  )
}

function App() {
  const navigate = useNavigate()
  const [roleId, setRoleId] = useState(null)

  // เคลียร์สิทธิ์เดิมทุกครั้งที่กลับมาหน้าเลือกบทบาท เพื่อให้ต้องกรอกรหัสผ่านใหม่เสมอ
  useEffect(() => {
    logout()
  }, [])

  const role = ROLES.find((r) => r.id === roleId)
  const ready = !!role

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ready) return
    navigate(role.href)
  }

  return (
    <main className="cloth">
      <form className="slip" onSubmit={handleSubmit}>
        <header className="slip-head">
          <p className="shop">ระบบจัดการออเดอร์ร้านสุกี้</p>
          <h1>ติ๊กบทบาทของคุณ</h1>
        </header>

        <fieldset className="rows">
          <legend className="sr-only">เลือกบทบาท</legend>

          {ROLES.map((r) => {
            const checked = r.id === roleId
            return (
              <div className="row" key={r.id} data-checked={checked}>
                <label className="row-head">
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={checked}
                    onChange={() => setRoleId(r.id)}
                  />
                  <span className="box">
                    <Tick />
                  </span>
                  <span className="row-name">{r.name}</span>
                  <span className="row-line">{r.line}</span>
                </label>

                {checked && (
                  <div className="detail">
                    <ul>
                      {r.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>

                    {r.id !== 'customer' && (
                      <p className="or">ต้องใส่รหัสผ่านเพื่อเข้าใช้งาน</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </fieldset>

        <button className="go" type="submit" disabled={!ready}>
          {role ? role.cta : 'เลือกบทบาทก่อน'}
        </button>
      </form>
    </main>
  )
}

export default App