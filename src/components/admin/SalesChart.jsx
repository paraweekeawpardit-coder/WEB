import { baht } from '../../utils/stats'

// กราฟแท่งยอดขายรายวัน (SVG ล้วน ไม่ต้องติดตั้งไลบรารีเพิ่ม)
export default function SalesChart({ data, unit = 'ออเดอร์' }) {
  const W = 640
  const H = 260
  const pad = { top: 24, right: 12, bottom: 44, left: 12 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const max = Math.max(...data.map((d) => d.total), 1)
  const slot = innerW / data.length
  const barW = Math.min(46, slot * 0.64)
  const showValue = data.length <= 10
  const labelEvery = data.length > 14 ? 3 : data.length > 10 ? 2 : 1

  return (
    <svg
      className="adm-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="กราฟยอดขายรายวัน"
    >
      <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="#d1d5db" />
      {data.map((d, i) => {
        const h = (d.total / max) * innerH
        const x = pad.left + i * slot + (slot - barW) / 2
        const y = H - pad.bottom - h
        const isToday = i === data.length - 1
        return (
          <g key={d.key}>
            <title>{`${d.date.toLocaleDateString('th-TH')} · ${baht(d.total)} · ${d.orders} ${unit}`}</title>
            <rect
              x={x}
              y={d.total > 0 ? y : H - pad.bottom - 2}
              width={barW}
              height={d.total > 0 ? h : 2}
              rx="4"
              fill={isToday ? '#b7242a' : '#e08a8f'}
            />
            {showValue && d.total > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fill="#374151">
                {baht(d.total)}
              </text>
            )}
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={H - pad.bottom + 18} textAnchor="middle" fontSize="11" fill="#6b7280">
                {d.date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
