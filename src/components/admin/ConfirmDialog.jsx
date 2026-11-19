import { Trash2 } from 'lucide-react'

// กล่องยืนยันการลบ (แทน window.confirm ให้หน้าตาเข้ากับระบบ)
export default function ConfirmDialog({ menu, busy, onConfirm, onCancel }) {
  return (
    <div className="adm-modal-bg" role="alertdialog" aria-modal="true" aria-label="ยืนยันการลบเมนู">
      <div className="adm-modal adm-confirm">
        <span className="adm-confirm-icon">
          <Trash2 size={26} aria-hidden="true" />
        </span>
        <h2>ลบเมนู “{menu.name}” ?</h2>
        <p>เมนูนี้จะถูกลบออกจากระบบถาวร ถ้าแค่ของหมดชั่วคราว ให้ใช้สวิตช์ “พร้อมขาย” เพื่อซ่อนแทน</p>
        <div className="adm-modal-actions">
          <button type="button" className="adm-btn" onClick={onCancel} disabled={busy}>
            ยกเลิก
          </button>
          <button type="button" className="adm-btn danger-solid" onClick={onConfirm} disabled={busy}>
            {busy ? 'กำลังลบ...' : 'ลบเมนู'}
          </button>
        </div>
      </div>
    </div>
  )
}
