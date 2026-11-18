import { useEffect, useState } from 'react'
import { api } from '../../services/api'

// จำลองการสแกน QR: ดึงรายชื่อโต๊ะจากระบบกลาง กดแล้วเหมือนสแกน QR ของโต๊ะนั้น
export default function QrScanBox({ onScan, disabled }) {
  const [tables, setTables] = useState([])

  useEffect(() => {
    let alive = true
    api
      .getTables()
      .then((list) => alive && setTables(list.slice(0, 3)))
      .catch(() => {}) // ไม่แสดงอะไรถ้าโหลดไม่ได้ ผู้ใช้ยังกรอกเลขโต๊ะเองได้
    return () => {
      alive = false
    }
  }, [])

  if (tables.length === 0) return null

  return (
    <div className="qr-box">
      <p className="or">จำลองการสแกน QR Code ประจำโต๊ะ</p>
      <div className="qr-list">
        {tables.map((t) => (
          <button
            key={t.id}
            type="button"
            className="qr-btn"
            disabled={disabled}
            onClick={() => onScan(t.id)}
          >
            สแกนโต๊ะ {t.id}
          </button>
        ))}
      </div>
    </div>
  )
}