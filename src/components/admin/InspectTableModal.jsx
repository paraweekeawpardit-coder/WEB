import { RotateCcw, X } from 'lucide-react'
import { SERVICE_RATE, VAT_RATE } from '../../../config/picing'

const baht = (n) =>
  `฿${Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function InspectTableModal({ table, onClose, onRequestClear }) {
  return (
    <div
      className="adm-modal-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`รายการโต๊ะ ${table.id}`}
    >
      <div className="adm-modal">
        <div className="adm-modal-head">
          <h2>
            รายการอาหาร · โต๊ะ {table.id} ({table.isBuffet ? 'บุฟเฟ่ต์' : 'อาลาคาร์ต'})
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

        {table.activeOrders.length === 0 ? (
          <p className="adm-empty">โต๊ะนี้ยังไม่มีรายการสั่งอาหาร</p>
        ) : (
          <div className="tbl-order-list">
            {table.activeOrders.map((order, idx) => (
              <div key={order.id ?? idx} className="tbl-order-box">
                <div className="tbl-order-head">
                  <strong>ออเดอร์ #{order.id}</strong>
                  <span>
                    {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    น.
                  </span>
                </div>
                <ul>
                  {(order.items ?? []).map((item, i) => (
                    <li key={i}>
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>
                        {table.isBuffet ? 'รวมในบุฟเฟ่ต์' : baht(item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="tbl-order-box">
          <ul>
            <li>
              <span>
                {table.isBuffet
                  ? `ค่าบุฟเฟ่ต์ (${table.buffetPrice} × ${table.effectiveGuests} คน)`
                  : 'รวมค่าอาหาร'}
              </span>
              <span>{baht(table.subtotal)}</span>
            </li>
            <li>
              <span>ค่าบริการ {Number((SERVICE_RATE * 100).toFixed(2))}%</span>
              <span>{baht(table.serviceCharge)}</span>
            </li>
            <li>
              <span>ภาษีมูลค่าเพิ่ม {Number((VAT_RATE * 100).toFixed(2))}%</span>
              <span>{baht(table.vat)}</span>
            </li>
          </ul>
        </div>

        <div className="tbl-modal-total">
          <span>ยอดรวมทั้งหมด</span>
          <strong>{baht(table.totalAmount)}</strong>
        </div>

        <div className="adm-modal-actions">
          <button type="button" className="adm-btn" onClick={onClose}>
            ปิดหน้าต่าง
          </button>
          <button
            type="button"
            className="adm-btn primary"
            onClick={() => {
              onClose()
              onRequestClear(table)
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> เคลียร์โต๊ะนี้
          </button>
        </div>
      </div>
    </div>
  )
}