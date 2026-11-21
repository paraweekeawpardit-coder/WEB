// สัดส่วนโต๊ะตามจำนวนคน (แท่งแนวนอน) ขนาดที่พบบ่อยสุดเน้นสีเข้ม
export default function PartySizeChart({ rows, top }) {
  if (rows.length === 0) {
    return <p className="adm-empty">ยังไม่มีข้อมูลลูกค้าในช่วงนี้ ข้อมูลจะเพิ่มขึ้นเมื่อมีการเปิดและเคลียร์โต๊ะ</p>
  }
  const max = Math.max(...rows.map((r) => r.count))

  return (
    <ul className="adm-party">
      {rows.map((r) => (
        <li key={r.size} className={r.size === top?.size ? 'is-top' : ''}>
          <span className="adm-party-label">{r.size} คน</span>
          <div className="adm-bar">
            <div className="adm-bar-fill" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
          <span className="adm-party-count">
            {r.count} โต๊ะ <em>({Math.round(r.pct)}%)</em>
          </span>
        </li>
      ))}
    </ul>
  )
}
