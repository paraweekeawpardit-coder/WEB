import { RotateCcw } from 'lucide-react'

const baht = (n) =>
  `฿${Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ClearTableModal({ table, busy, onConfirm, onClose }) {
  return (
    <div
      className="adm-modal-bg"
      role="alertdialog"
      aria-modal="true"
      aria-label="ยืนยันการเคลียร์โต๊ะ"
    >
      <div className="adm-modal adm-confirm">
        <span className="adm-confirm-icon">
          <RotateCcw size={26} aria-hidden="true" />
        </span>
        <h2>เคลียร์โต๊ะ “{table.id}” ?</h2>
        <p>
          ยอดรวมสุทธิ <strong>{baht(table.totalAmount)}</strong> ({table.activeOrders.length}{' '}
          ออเดอร์)
          <br />
          เมื่อยืนยันแล้ว โต๊ะจะเปลี่ยนสถานะเป็น <strong>“ว่าง”</strong> เพื่อพร้อมรับลูกค้ารอบถัดไป
        </p>
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
            type="button"
            className="adm-btn danger-solid"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'กำลังเคลียร์...' : 'ยืนยันเคลียร์โต๊ะ'}
          </button>
        </div>
      </div>
    </div>
  )
}