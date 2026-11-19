import { useState } from 'react'
import usePolling from '../../hooks/usePolling'
import { api } from '../../services/api'

const TYPES = [
  { type: 'call', label: 'เรียกพนักงาน', waiting: 'เรียกพนักงานแล้ว รอสักครู่' },
  { type: 'bill', label: 'ขอเช็กบิล', waiting: 'แจ้งเช็กบิลแล้ว รอพนักงานนำบิลมา' },
]

// ปุ่มเรียกพนักงาน / ขอเช็กบิล (ปุ่มจะถูกล็อกจนกว่าพนักงานรับเรื่อง กันกดซ้ำ)
export default function ServiceActions({ table }) {
  const { data: calls, reload } = usePolling(() => api.getServiceCallsByTable(table), 4000)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const isPending = (type) => (calls ?? []).some((c) => c.type === type)

  const send = async (type) => {
    setBusy(type)
    setError('')
    try {
      await api.createServiceCall(table, type)
      reload?.()
    } catch {
      setError('ส่งคำขอไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setBusy('')
    }
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
            onClick={() => send(t.type)}
          >
            {isPending(t.type) ? 'รอพนักงาน...' : t.label}
          </button>
        ))}
      </div>
      {TYPES.filter((t) => isPending(t.type)).map((t) => (
        <p key={t.type} role="status" className="muted">
          {t.waiting}
        </p>
      ))}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </section>
  )
}
