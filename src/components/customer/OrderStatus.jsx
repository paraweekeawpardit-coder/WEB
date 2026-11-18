import usePolling from '../../hooks/usePolling'
import { api } from '../../services/api'

const LABEL = {
  pending: 'รอครัวรับออเดอร์',
  preparing: 'กำลังเตรียม',
  served: 'เสิร์ฟแล้ว',
}

const fmt = (iso) => new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

// สถานะออเดอร์ของโต๊ะนี้ (อัปเดตอัตโนมัติทุก 4 วินาที)
export default function OrderStatus({ table }) {
  const { data: orders, error } = usePolling(() => api.getOrdersByTable(table), 4000)

  if (error && !orders) return <p className="muted">โหลดสถานะออเดอร์ไม่ได้</p>
  if (!orders || orders.length === 0) return null

  return (
    <section className="orders" aria-label="สถานะออเดอร์">
      <h2>ออเดอร์ของคุณ</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id} className="order">
            <div className="order-head">
              <span>เวลา {fmt(o.createdAt)}</span>
              <span className={`badge ${o.status}`}>{LABEL[o.status] ?? o.status}</span>
            </div>
            <p className="muted">{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}