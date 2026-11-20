import {
  Check,
  CheckCircle2,
  Clock,
  Receipt,
  RotateCcw,
  UserPlus,
  Users,
} from 'lucide-react'

const baht = (n) =>
  `฿${Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_META = {
  available: { label: 'ว่าง', hint: 'กดเพื่อเปิดโต๊ะรับลูกค้า', Icon: CheckCircle2 },
  occupied: { label: 'กำลังใช้งาน', hint: 'มีลูกค้าใช้บริการ', Icon: Users },
  billing: { label: 'รอเช็กบิล', hint: 'ลูกค้าขอเช็กบิลแล้ว', Icon: Receipt },
}

export default function TableCard({
  table: t,
  busy,
  onOpenAssign,
  onAcknowledgeBill,
  onInspect,
  onClear,
}) {
  const meta = STATUS_META[t.effectiveStatus] ?? STATUS_META.available
  const StatusIcon = meta.Icon
  const isAvailable = t.effectiveStatus === 'available'
  const isBilling = t.effectiveStatus === 'billing'

  return (
    <li
      className={`tbl-card status-${t.effectiveStatus}${isAvailable ? ' is-clickable' : ''}`}
      onClick={isAvailable ? () => onOpenAssign(t, false) : undefined}
    >
      <div className="tbl-card-head">
        <div>
          <span className="tbl-zone">โซน {t.zone}</span>
          <h3 className="tbl-number">โต๊ะ {t.id}</h3>
        </div>
        <span className={`tbl-badge ${t.effectiveStatus}`}>
          <StatusIcon size={14} aria-hidden="true" /> {meta.label}
        </span>
      </div>

      <div className="tbl-card-body">
        {isAvailable ? (
          <p className="tbl-idle-text">{meta.hint}</p>
        ) : (
          <>
            <div className="tbl-info-row">
              <button
                type="button"
                className="tbl-guest-pill"
                onClick={() => onOpenAssign(t, true)}
                title="คลิกเพื่อแก้ไขจำนวนลูกค้า"
              >
                <Users size={15} aria-hidden="true" />{' '}
                {t.guests > 0 ? `${t.guests} คน` : 'ระบุจำนวนคน'} ·{' '}
                {t.isBuffet ? 'บุฟเฟ่ต์' : 'อาลาคาร์ต'}
              </button>
              <span>
                <Clock size={15} aria-hidden="true" /> {t.activeOrders.length} ออเดอร์
              </span>
            </div>
            <div className="tbl-bill-row">
              <span>ยอดรวมสุทธิ</span>
              <strong>{baht(t.totalAmount)}</strong>
            </div>
          </>
        )}
      </div>

      <div className="tbl-card-foot" onClick={(e) => e.stopPropagation()}>
        {isAvailable ? (
          <button
            type="button"
            className="adm-btn tbl-btn-open"
            disabled={busy}
            onClick={() => onOpenAssign(t, false)}
          >
            <UserPlus size={16} aria-hidden="true" /> เปิดโต๊ะรับลูกค้า
          </button>
        ) : isBilling ? (
          <div className="tbl-billing-actions">
            <button
              type="button"
              className="adm-btn tbl-btn-ack"
              disabled={busy}
              onClick={() => onAcknowledgeBill(t)}
            >
              <Check size={16} aria-hidden="true" />{' '}
              {busy ? 'กำลังอัปเดต...' : 'รับเรื่องเช็กบิล'}
            </button>
            <div className="tbl-sub-actions">
              <button
                type="button"
                className="adm-btn"
                disabled={busy}
                onClick={() => onInspect(t)}
              >
                ดูรายการ
              </button>
              <button
                type="button"
                className="adm-btn danger"
                disabled={busy}
                onClick={() => onClear(t)}
              >
                <RotateCcw size={15} aria-hidden="true" /> เคลียร์โต๊ะ
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="adm-btn"
              disabled={busy}
              onClick={() => onInspect(t)}
            >
              ดูรายการ
            </button>
            <button
              type="button"
              className="adm-btn danger"
              disabled={busy}
              onClick={() => onClear(t)}
            >
              <RotateCcw size={15} aria-hidden="true" /> เคลียร์โต๊ะ
            </button>
          </>
        )}
      </div>
    </li>
  )
}