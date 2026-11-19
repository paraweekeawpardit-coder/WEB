import { useEffect, useState } from 'react'
import { Receipt, X } from 'lucide-react'
import usePolling from '../../hooks/usePolling'
import { api } from '../../services/api'

const TYPES = [
  { type: 'call', label: 'เรียกพนักงาน', pendingLabel: 'รอพนักงาน...' },
  { type: 'bill', label: 'ขอเช็กบิล', pendingLabel: 'รอเช็กบิล...' },
]

// ปุ่มเรียกพนักงาน / ขอเช็กบิล (ปุ่มจะถูกล็อกจนกว่าพนักงานรับเรื่อง กันกดซ้ำ)
export default function ServiceActions({ table }) {
  const { data: calls, reload } = usePolling(() => api.getServiceCallsByTable(table), 4000)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [showBillModal, setShowBillModal] = useState(false)

  const isPending = (type) => (calls ?? []).some((c) => c.type === type)

  useEffect(() => {
    if (!showBillModal) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && busy !== 'bill') setShowBillModal(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showBillModal, busy])

  const send = async (type) => {
    setBusy(type)
    setError('')
    try {
      await api.createServiceCall(table, type)
      setShowBillModal(false)
      reload?.()
    } catch {
      setError('ส่งคำขอไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setBusy('')
    }
  }

  const handleClick = (type) => {
    if (type === 'bill') {
      setError('')
      setShowBillModal(true)
      return
    }
    send(type)
  }

  return (
    <section className="service" aria-label="บริการ">
      <h2>ต้องการความช่วยเหลือ</h2>
      <div className="service-btns">
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            className="add-btn"
            disabled={busy === t.type || isPending(t.type)}
            onClick={() => handleClick(t.type)}
          >
            {isPending(t.type) ? t.pendingLabel : t.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {/* Pop-up ยืนยันขอเช็กบิล */}
      {showBillModal && (
        <div
          className="svc-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="svc-bill-title"
          onClick={() => busy !== 'bill' && setShowBillModal(false)}
        >
          <div className="svc-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="svc-modal-close"
              onClick={() => setShowBillModal(false)}
              disabled={busy === 'bill'}
              aria-label="ปิดหน้าต่าง"
            >
              <X size={18} />
            </button>

            <div className="svc-modal-icon" aria-hidden="true">
              <Receipt size={28} />
            </div>

            <h3 id="svc-bill-title" className="svc-modal-title">
              ยืนยันการขอเช็กบิล
            </h3>
            <p className="svc-modal-desc">
              ต้องการเรียกพนักงานมาเช็กบิลที่ <strong>โต๊ะ {table}</strong> ใช่หรือไม่?
            </p>

            <div className="svc-modal-actions">
              <button
                type="button"
                className="svc-btn-cancel"
                onClick={() => setShowBillModal(false)}
                disabled={busy === 'bill'}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="svc-btn-confirm"
                onClick={() => send('bill')}
                disabled={busy === 'bill'}
              >
                {busy === 'bill' ? 'กำลังส่งคำขอ...' : 'ยืนยันขอเช็กบิล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}