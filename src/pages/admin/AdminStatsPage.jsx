import { useMemo, useState } from 'react'
import { Banknote, CalendarDays, Receipt, RefreshCw, ShoppingBag } from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import BackButton from '../../components/admin/BackButton'
import AdminNav from '../../components/admin/AdminNav'
import StatCard from '../../components/admin/StatCard'
import SalesChart from '../../components/admin/SalesChart'
import TopMenuList from '../../components/admin/TopMenuList'
import { baht, buildDailySales, buildTopMenus, dayKey, ordersInRange } from '../../utils/stats'
import './AdminPages.css'

const RANGES = [7, 14, 30]

// 🐰 Dashboard สถิติร้าน: ยอดขายรายวัน / เมนูยอดฮิต / จำนวนออเดอร์รวม
export default function AdminStatsPage() {
  const { data: orders, error, loading, reload } = usePolling(() => api.getOrders(), 5000)
  const [days, setDays] = useState(7)

  const stats = useMemo(() => {
    const inRange = ordersInRange(orders ?? [], days)
    const total = inRange.reduce((s, o) => s + (Number(o.total) || 0), 0)
    const todayKey = dayKey(new Date())
    return {
      daily: buildDailySales(orders ?? [], days),
      top: buildTopMenus(inRange, 5),
      orderCount: inRange.length,
      total,
      avg: inRange.length ? total / inRange.length : 0,
      today: (orders ?? []).filter((o) => dayKey(o.createdAt) === todayKey).length,
    }
  }, [orders, days])

  return (
    <main className="adm-bg">
      <BackButton to="/admin" />
      <div className="adm-workspace">
        <AdminNav title="สถิติร้านสุกี้" />

        <div className="adm-toolbar">
          <div className="adm-range" role="group" aria-label="ช่วงเวลา">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={r === days ? 'adm-tab active' : 'adm-tab'}
                onClick={() => setDays(r)}
              >
                {r} วันล่าสุด
              </button>
            ))}
          </div>
          <button type="button" className="adm-btn" onClick={reload}>
            <RefreshCw size={16} aria-hidden="true" /> รีเฟรช
          </button>
        </div>

        {loading && !orders && <p className="adm-empty">กำลังคำนวณสถิติ...</p>}
        {error && <p className="adm-error-box">เชื่อมต่อระบบกลางไม่ได้: {error.message}</p>}

        {orders && (
          <>
            <section className="adm-stats">
              <StatCard icon={ShoppingBag} label="ออเดอร์รวม" value={stats.orderCount} hint={`ใน ${days} วันล่าสุด`} />
              <StatCard icon={Banknote} label="ยอดขายรวม" value={baht(stats.total)} hint={`ใน ${days} วันล่าสุด`} />
              <StatCard icon={Receipt} label="เฉลี่ยต่อออเดอร์" value={baht(stats.avg)} />
              <StatCard icon={CalendarDays} label="ออเดอร์วันนี้" value={stats.today} />
            </section>

            <section className="adm-panel">
              <h2>ยอดขายรายวัน</h2>
              <SalesChart data={stats.daily} />
            </section>

            <section className="adm-panel">
              <h2>เมนูยอดฮิต Top 5</h2>
              <TopMenuList items={stats.top} />
            </section>
          </>
        )}
      </div>
    </main>
  )
}
