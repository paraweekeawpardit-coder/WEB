import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../customer/MenuToolBar'
import CategoryIcon from './CategoryIcon'

const labelOf = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

// การ์ดเมนู 1 รายการ: รูป/ไอคอน, ราคา, สวิตช์พร้อมขาย, แก้ไข, ลบ
export default function AdminMenuCard({ menu, busy, onEdit, onToggle, onDelete }) {
  return (
    <li className={menu.available ? 'adm-card' : 'adm-card is-hidden'}>
      <div className="adm-thumb">
        {menu.image ? (
          <img src={menu.image} alt={menu.name} loading="lazy" />
        ) : (
          <CategoryIcon category={menu.category} size={44} strokeWidth={1.6} />
        )}
        {!menu.available && (
          <span className="adm-badge-off">
            <EyeOff size={13} aria-hidden="true" /> ซ่อนอยู่
          </span>
        )}
      </div>

      <div className="adm-card-body">
        <h3>{menu.name}</h3>
        <div className="adm-card-meta">
          <span className="adm-chip">{labelOf(menu.category)}</span>
          <strong className="adm-price">฿{Number(menu.price).toLocaleString('th-TH')}</strong>
        </div>
      </div>

      <div className="adm-card-foot">
        <button
          type="button"
          role="switch"
          aria-checked={menu.available}
          className={menu.available ? 'adm-switch on' : 'adm-switch'}
          disabled={busy}
          onClick={() => onToggle(menu)}
          title={menu.available ? 'กดเพื่อซ่อนเมนู (ของหมด)' : 'กดเพื่อแสดงเมนูให้ลูกค้า'}
        >
          <span className="adm-switch-track">
            <span className="adm-switch-dot" />
          </span>
          {menu.available ? (
            <>
              <Eye size={15} aria-hidden="true" /> พร้อมขาย
            </>
          ) : (
            <>
              <EyeOff size={15} aria-hidden="true" /> ซ่อนอยู่
            </>
          )}
        </button>

        <div className="adm-icon-btns">
          <button
            type="button"
            className="adm-icon-btn"
            disabled={busy}
            onClick={() => onEdit(menu)}
            aria-label={`แก้ไข ${menu.name}`}
            title="แก้ไข"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            className="adm-icon-btn danger"
            disabled={busy}
            onClick={() => onDelete(menu)}
            aria-label={`ลบ ${menu.name}`}
            title="ลบ"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </li>
  )
}
