// อันดับเมนูยอดฮิต พร้อมแท่งเปรียบเทียบจำนวน
export default function TopMenuList({ items }) {
  if (items.length === 0) return <p className="adm-empty">ยังไม่มีข้อมูลการสั่งในช่วงนี้</p>
  const max = items[0].qty || 1

  return (
    <ol className="adm-top">
      {items.map((it, i) => (
        <li key={it.menuId}>
          <span className="adm-rank">{i + 1}</span>
          <div className="adm-top-body">
            <div className="adm-top-line">
              <strong>{it.name}</strong>
              <span>{it.qty} จาน</span>
            </div>
            <div className="adm-bar">
              <div className="adm-bar-fill" style={{ width: `${(it.qty / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
