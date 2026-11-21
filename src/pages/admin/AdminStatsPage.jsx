import { useMemo, useState } from 'react'
import { Banknote, CalendarDays, Crown, Flame, Receipt, RefreshCw, ShoppingBag, TrendingUp, UserRound, Users, UtensilsCrossed } from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import AdminNav from '../../components/admin/AdminNav'
import BackButton from '../../components/admin/BackButton'
import StatCard from '../../components/admin/StatCard'
import SalesChart from '../../components/admin/SalesChart'
import TopMenuList from '../../components/admin/TopMenuList'
import PartySizeChart from '../../components/admin/PartySizeChart'
import { baht, buildBillStats, buildDailySales, buildPartySizes, buildTopMenus, dayKey, ordersInRange } from '../../utils/stats'
import './AdminPages.css'

const RANGES = [7, 14, 30]
const TABS = [
  { id: 'sales', label: 'ยอดขาย', icon: TrendingUp },
  { id: 'menus', label: 'เมนูฮิต', icon: Flame },
  { id: 'guests', label: 'ลูกค้า', icon: Users },
]

// 🐰 Dashboard สถิติร้าน แยกเป็นแท็บย่อย: ยอดขาย / เมนูฮิต / ลูกค้า
export default function AdminStatsPage() {
  const { data, error, loading, reload } = usePolling(
    () =>
      Promise.all([
        api.getOrders(),
        api.getVisits().catch(() => []), // ถ้ายังไม่มี collection visits ใน db.json ให้ถือว่าว่าง
        api.getTables(),
      ]),
    5000,
  )
  const [days, setDays] = useState(7)
  const [tab, setTab] = useState('sales')
  const [refreshing, setRefreshing] = useState(false)
  const [basis, setBasis] = useState('bill') // bill = ยอดตามบิล, orders = ยอดอาหารที่สั่ง

  // เวลาที่ข้อมูลอัปเดตล่าสุด (เปลี่ยนทุกครั้งที่ได้ข้อมูลใหม่ ทั้งจากปุ่มและการโหลดอัตโนมัติ)
  const updatedAt = useMemo(
    () => (data ? new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''),
    [data],
  )

  // กดรีเฟรช: หมุนไอคอนอย่างน้อย 0.7 วินาที ให้เห็นว่าระบบกำลังทำงาน
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([reload(), new Promise((resolve) => setTimeout(resolve, 700))])
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    if (!data) return null
    const [orders, visits, tables] = data
    const inRange = ordersInRange(orders, days)
    const total = inRange.reduce((s, o) => s + (Number(o.total) || 0), 0)
    const allMenus = buildTopMenus(inRange, Infinity)
    const todayKey = dayKey(new Date())
    return {
      daily: buildDailySales(orders, days),
      orderCount: inRange.length,
      total,
      avg: inRange.length ? total / inRange.length : 0,
      today: orders.filter((o) => dayKey(o.createdAt) === todayKey).length,
      topMenus: allMenus.slice(0, 10),
      dishCount: allMenus.reduce((s, m) => s + m.qty, 0),
      menuKinds: allMenus.length,
      party: buildPartySizes(visits, tables, days),
      bill: buildBillStats(visits, days),
    }
  }, [data, days])

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
                className={r === days ? 'adm-pill active' : 'adm-pill'}
                onClick={() => setDays(r)}
              >
                {r} วันล่าสุด
              </button>
            ))}
          </div>
          <div className="adm-refresh">
            {updatedAt && <span className="adm-updated">อัปเดตล่าสุด {updatedAt}</span>}
            <button type="button" className="adm-btn" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'adm-spin' : ''} aria-hidden="true" />
              {refreshing ? 'กำลังอัปเดต...' : 'รีเฟรช'}
            </button>
          </div>
        </div>

        <div className="adm-subtabs" role="tablist" aria-label="หัวข้อสถิติ">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'adm-subtab active' : 'adm-subtab'}
              onClick={() => setTab(id)}
            >
              <Icon size={17} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {loading && !data && <p className="adm-empty">กำลังคำนวณสถิติ...</p>}
        {error && <p className="adm-error-box">เชื่อมต่อระบบกลางไม่ได้: {error.message}</p>}

        {stats && tab === 'sales' && (
          <>
            <div className="adm-seg adm-basis" role="tablist" aria-label="วิธีนับยอดขาย">
              <button type="button" role="tab" aria-selected={basis === 'bill'} className={basis === 'bill' ? 'active' : ''} onClick={() => setBasis('bill')}>
                ยอดตามบิล
              </button>
              <button type="button" role="tab" aria-selected={basis === 'orders'} className={basis === 'orders' ? 'active' : ''} onClick={() => setBasis('orders')}>
                ยอดอาหารที่สั่ง
              </button>
            </div>

            {basis === 'bill' ? (
              <>
                <section className="adm-stats">
                  <StatCard icon={Banknote} label="ยอดขายรวม" value={baht(stats.bill.total)} hint={`ใน ${days} วันล่าสุด`} />
                  <StatCard icon={Receipt} label="จำนวนบิล" value={stats.bill.count} hint="โต๊ะที่เคลียร์แล้ว" />
                  <StatCard icon={ShoppingBag} label="เฉลี่ยต่อบิล" value={baht(stats.bill.avg)} />
                  <StatCard icon={CalendarDays} label="ยอดวันนี้" value={baht(stats.bill.todayTotal)} />
                </section>
                <section className="adm-panel">
                  <h2>ยอดขายรายวัน (ตามบิล)</h2>
                  {stats.bill.count === 0 ? (
                    <p className="adm-empty">ยังไม่มีบิลที่ชำระในช่วงนี้ ข้อมูลจะเพิ่มขึ้นเมื่อแอดมินเคลียร์โต๊ะ หรือดู “ยอดอาหารที่สั่ง” แทนได้</p>
                  ) : (
                    <SalesChart data={stats.bill.daily} unit="บิล" />
                  )}
                  <p className="adm-note">ยอดบิลสุทธิ รวมค่าบุฟเฟ่ต์/ค่าอาหาร ค่าบริการ และ VAT บันทึกตอนเคลียร์โต๊ะ</p>
                </section>
              </>
            ) : (
              <>
                <section className="adm-stats">
                  <StatCard icon={ShoppingBag} label="ออเดอร์รวม" value={stats.orderCount} hint={`ใน ${days} วันล่าสุด`} />
                  <StatCard icon={Banknote} label="ยอดอาหารที่สั่ง" value={baht(stats.total)} hint={`ใน ${days} วันล่าสุด`} />
                  <StatCard icon={Receipt} label="เฉลี่ยต่อออเดอร์" value={baht(stats.avg)} />
                  <StatCard icon={CalendarDays} label="ออเดอร์วันนี้" value={stats.today} />
                </section>
                <section className="adm-panel">
                  <h2>ยอดอาหารที่สั่งรายวัน</h2>
                  <SalesChart data={stats.daily} />
                  <p className="adm-note">รวมราคารายการอาหารที่สั่ง ไม่รวมค่าบุฟเฟ่ต์ ค่าบริการ และ VAT</p>
                </section>
              </>
            )}
          </>
        )}

        {stats && tab === 'menus' && (
          <>
            <section className="adm-stats">
              <StatCard icon={Crown} label="เมนูอันดับ 1" value={stats.topMenus[0]?.name ?? '–'} hint={stats.topMenus[0] ? `${stats.topMenus[0].qty} จาน` : undefined} />
              <StatCard icon={UtensilsCrossed} label="จำนวนจานที่ขายได้" value={stats.dishCount} hint={`ใน ${days} วันล่าสุด`} />
              <StatCard icon={Flame} label="เมนูที่ถูกสั่ง" value={`${stats.menuKinds} เมนู`} />
            </section>
            <section className="adm-panel">
              <h2>เมนูยอดฮิต Top 10</h2>
              <TopMenuList items={stats.topMenus} />
            </section>
          </>
        )}

        {stats && tab === 'guests' && (
          <>
            <section className="adm-stats">
              <StatCard
                icon={Crown}
                label="ลูกค้าส่วนใหญ่มาเป็นโต๊ะละ"
                value={stats.party.top ? `${stats.party.top.size} คน` : '–'}
                hint={stats.party.top ? `${stats.party.top.count} โต๊ะ (${Math.round(stats.party.top.pct)}%)` : undefined}
              />
              <StatCard icon={Users} label="จำนวนลูกค้ารวม" value={`${stats.party.totalGuests} คน`} hint={`ใน ${days} วันล่าสุด`} />
              <StatCard icon={UserRound} label="เฉลี่ยต่อโต๊ะ" value={`${stats.party.avg.toFixed(1)} คน`} />
              <StatCard icon={CalendarDays} label="โต๊ะที่ให้บริการ" value={stats.party.tableCount} />
            </section>
            <section className="adm-panel">
              <h2>สัดส่วนโต๊ะตามจำนวนคน</h2>
              <PartySizeChart rows={stats.party.rows} top={stats.party.top} />
              <p className="adm-note">นับจากโต๊ะที่เคลียร์แล้ว รวมโต๊ะที่กำลังใช้งานอยู่ตอนนี้</p>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
