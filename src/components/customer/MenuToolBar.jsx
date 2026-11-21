export const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'pork', label: 'หมู' },
  { id: 'beef', label: 'เนื้อวัว' },
  { id: 'seafood', label: 'ทะเล' },
  { id: 'veggie', label: 'ผัก' },
  { id: 'meatball', label: 'ลูกชิ้น' },
  { id: 'soup', label: 'น้ำซุป' },
  { id: 'drink', label: 'เครื่องดื่ม' },
]

// ช่องค้นหา + แท็บหมวดหมู่
// extraCategories = หมวดที่แอดมินพิมพ์เพิ่มเอง ([{ id, label }]) ต่อท้ายหมวดมาตรฐาน
export default function MenuToolbar({ search, onSearch, category, onCategory, extraCategories = [] }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="search"
        placeholder="ค้นหาเมนู..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="ค้นหาเมนู"
      />
      <div className="tabs" role="tablist" aria-label="หมวดหมู่">
        {[...CATEGORIES, ...extraCategories].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            className={category === c.id ? 'tab active' : 'tab'}
            onClick={() => onCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}