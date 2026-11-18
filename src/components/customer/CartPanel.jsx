// ตะกร้า: ปรับจำนวน / ลบรายการ / ยืนยันการสั่งอาหาร
export default function CartPanel({ table, items, onSetQty, onRemove, onConfirm, submitting, error }) {
  return (
    <aside className="cart" aria-label="ตะกร้า">
      <h2>ตะกร้าของโต๊ะ {table}</h2>

      {items.length === 0 ? (
        <p className="muted">ยังไม่มีรายการ เลือกเมนูด้านข้างได้เลย</p>
      ) : (
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.menuId}>
              <span className="cart-name">{i.name}</span>
              <div className="stepper small">
                <button type="button" onClick={() => onSetQty(i.menuId, i.qty - 1)} disabled={i.qty <= 1} aria-label={`ลด ${i.name}`}>
                  −
                </button>
                <output>{i.qty}</output>
                <button type="button" onClick={() => onSetQty(i.menuId, i.qty + 1)} aria-label={`เพิ่ม ${i.name}`}>
                  +
                </button>
              </div>
              <button type="button" className="remove" onClick={() => onRemove(i.menuId)} aria-label={`ลบ ${i.name}`}>
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <button type="button" className="go" disabled={items.length === 0 || submitting} onClick={onConfirm}>
        {submitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งอาหาร'}
      </button>
    </aside>
  )
}