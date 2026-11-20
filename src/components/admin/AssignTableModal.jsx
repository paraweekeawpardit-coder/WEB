import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'

const GUEST_PRESETS = [1, 2, 3, 4, 5, 6]
const MAX_GUESTS = 12

export default function AssignTableModal({ table, isEdit, busy, onSubmit, onClose }) {
  const [guestCount, setGuestCount] = useState(table.guests > 0 ? table.guests : 2)
  const [tableMode, setTableMode] = useState(table.mode ?? 'buffet')
  const [guestError, setGuestError] = useState('')

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const count = Number(guestCount)
    if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS) {
      setGuestError(`กรุณาระบุจำนวนลูกค้าตั้งแต่ 1 - ${MAX_GUESTS} คน`)
      return
    }
    onSubmit(count, tableMode)
  }

  return (
    <div
      className="adm-modal-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`เปิดโต๊ะ ${table.id}`}
    >
      <form
        className="adm-modal tbl-assign-modal"
        onSubmit={handleFormSubmit}
        noValidate
      >
        <div className="adm-modal-head">
          <h2>
            {isEdit
              ? `แก้ไขจำนวนลูกค้า · โต๊ะ ${table.id}`
              : `เปิดโต๊ะ ${table.id} (โซน ${table.zone})`}
          </h2>
          <button
            type="button"
            className="adm-icon-btn"
            onClick={onClose}
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="tbl-preset-group">
          <span className="tbl-preset-label">รูปแบบการให้บริการ</span>
          <div
            className="tbl-presets"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
          >
            <button
              type="button"
              style={{ whiteSpace: 'nowrap' }}
              className={tableMode === 'buffet' ? 'tbl-preset-btn active' : 'tbl-preset-btn'}
              onClick={() => setTableMode('buffet')}
            >
              บุฟเฟ่ต์
            </button>
            <button
              type="button"
              style={{ whiteSpace: 'nowrap' }}
              className={tableMode === 'alacarte' ? 'tbl-preset-btn active' : 'tbl-preset-btn'}
              onClick={() => setTableMode('alacarte')}
            >
              อาลาคาร์ต
            </button>
          </div>
        </div>

        <div className="tbl-preset-group">
          <span className="tbl-preset-label">เลือกจำนวนลูกค้า</span>
          <div className="tbl-presets">
            {GUEST_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className={Number(guestCount) === n ? 'tbl-preset-btn active' : 'tbl-preset-btn'}
                onClick={() => {
                  setGuestCount(n)
                  setGuestError('')
                }}
              >
                {n} คน
              </button>
            ))}
          </div>
        </div>

        <div className="adm-field">
          <span>หรือระบุจำนวนคนเอง (สูงสุด {MAX_GUESTS} คน)</span>
          <div className="tbl-stepper">
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                setGuestCount((c) => Math.max(1, Number(c) - 1))
                setGuestError('')
              }}
              aria-label="ลดจำนวนคน"
            >
              <Minus size={18} />
            </button>
            <input
              type="number"
              min={1}
              max={MAX_GUESTS}
              value={guestCount}
              onChange={(e) => {
                setGuestCount(e.target.value)
                setGuestError('')
              }}
              autoFocus
            />
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                setGuestCount((c) => Math.min(MAX_GUESTS, Number(c) + 1))
                setGuestError('')
              }}
              aria-label="เพิ่มจำนวนคน"
            >
              <Plus size={18} />
            </button>
          </div>
          {guestError && <small className="adm-field-error">{guestError}</small>}
        </div>

        <div className="adm-modal-actions">
          <button
            type="button"
            className="adm-btn"
            onClick={onClose}
            disabled={busy}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="adm-btn primary"
            disabled={busy}
          >
            {busy ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'ยืนยัน'}
          </button>
        </div>
      </form>
    </div>
  )
}