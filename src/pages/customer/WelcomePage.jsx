import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import WelcomeHeader from '../../components/customer/WelcomeHeader'
import QrScanBox from '../../components/customer/QrScanBox'
import FeaturedFoods from "../../components/customer/FeatureFoods"
import { findTable, normalizeTable, openTable } from '../../services/TableService'
import './WelcomePage.css'

export default function WelcomePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromUrl = normalizeTable(params.get('table'))

  // โต๊ะจาก QR/URL ที่ตรวจกับระบบกลางแล้ว (null = ไม่มีหรือไม่ถูกต้อง)
  const [urlTable, setUrlTable] = useState(null)
  const [checking, setChecking] = useState(!!fromUrl)
  const [scanError, setScanError] = useState('')
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    if (!fromUrl) return
    let alive = true
    findTable(fromUrl)
      .then((t) => {
        if (!alive) return
        if (t && t.status === 'available') {
          setUrlError(`โต๊ะ ${t.id} ยังไม่เปิดให้บริการ กรุณากรอกเลขโต๊ะใหม่ หรือแจ้งพนักงานเพื่อเปิดโต๊ะ`)
          return
        }
        if (!t) {
          setUrlError(`ไม่พบโต๊ะ ${fromUrl} ในระบบ กรุณากรอกเลขโต๊ะใหม่`)
          return
        }
        setUrlTable(t)
      })
      .catch(() => {}) // เชื่อมต่อไม่ได้ -> ตกไปใช้ฟอร์มกรอกเอง
      .finally(() => alive && setChecking(false))
    return () => {
      alive = false
    }
  }, [fromUrl])

  // ใช้ร่วมกันทั้งฟอร์ม, ปุ่มสแกน และลิงก์ QR
  const enter = async (code) => {
    let table
    try {
      table = await findTable(code)
    } catch {
      throw new Error('เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่หรือเรียกพนักงาน')
    }
    if (!table) throw new Error(`ไม่พบโต๊ะ ${normalizeTable(code)} ในระบบ`)
    if (table.status === 'available') {
      throw new Error(`โต๊ะ ${table.id} ยังไม่เปิดให้บริการ กรุณาตรวจสอบเลขโต๊ะอีกครั้ง หรือแจ้งพนักงานเพื่อเปิดโต๊ะ`)
    }
    await openTable(table)
    navigate(`/customer/menu?table=${encodeURIComponent(table.id)}`)
  }

  return (
    <main className="cloth">
      <div className="slip">
        <Link to="/" className="back-link">
          ← กลับหน้าเลือกบทบาท
        </Link>
        <WelcomeHeader table={urlTable?.id} />

        {checking ? (
          <p className="or">กำลังตรวจสอบโต๊ะ...</p>
        ) : urlTable ? (
          <button className="go" type="button" onClick={() => enter(urlTable.id)}>
            เริ่มสั่งอาหารที่โต๊ะ {urlTable.id}
          </button>
        ) : (
          <>
            <p className="or">
              {urlError || 'กรุณาสแกน QR Code ที่โต๊ะ หรือเปิดลิงก์ที่พนักงานให้'}
            </p>
            <QrScanBox
              onScan={(code) => {
                setScanError('')
                enter(code).catch((err) => setScanError(err.message))
              }}
            />
            {scanError && (
              <p role="alert" className="field-error">
                {scanError}
              </p>
            )}
          </>
        )}

        <FeaturedFoods />
      </div>
    </main>
  )
}