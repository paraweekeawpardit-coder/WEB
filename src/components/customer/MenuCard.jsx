import { useState } from 'react'

// ร้านบุฟเฟ่ต์: ซ่อนราคาต่อจาน (เปลี่ยนเป็น true ถ้าต้องการแสดงราคา)
const SHOW_PRICE = false

const ICON = {
  beef: '🥩',
  pork: '🍖',
  seafood: '🦐',
  veggie: '🥬',
  meatball: '🍢',
  soup: '🍲',
  drink: '🥤',
}

export default function MenuCard({ menu, onAdd, showPrice = SHOW_PRICE }) {
  const [qty, setQty] = useState(1)

  return (
    <li className="menu-card">
      {menu.image ? (
        <img src={menu.image} alt={menu.name} loading="lazy" />
      ) : (
        <span className="menu-icon" aria-hidden="true">
          {ICON[menu.category] ?? '🍽️'}
        </span>
      )}
      <h3>{menu.name}</h3>
      {showPrice && <p className="muted">{menu.price} บาท</p>}

      <div className="stepper">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="ลดจำนวน">
          −
        </button>
        <output aria-live="polite">{qty}</output>
        <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="เพิ่มจำนวน">
          +
        </button>
      </div>

      <button
        type="button"
        className="add-btn"
        onClick={() => {
          onAdd(menu, qty)
          setQty(1)
        }}
      >
        เพิ่มลงตะกร้า
      </button>
    </li>
  )
}