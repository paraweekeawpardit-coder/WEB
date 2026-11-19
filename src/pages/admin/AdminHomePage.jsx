import { ArrowRight, Banknote, ChartColumn, EyeOff, LayoutGrid, ShoppingBag, Store, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import BackButton from '../../components/admin/BackButton'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import { baht, dayKey } from '../../utils/stats'
import './AdminPages.css'

// หน้าหลักของผู้จัดการ/แอดมิน: ทางลัดไปแต่ละส่วน + ตัวเลขสรุปวันนี้
export default function AdminHomePage() {
  const { data: menus } = usePolling(() => api.getMenus(), 10000)
  const { data: orders } = usePolling(() => api.getOrders(), 10000)

  const summary = useMemo(() => {
    const todayKey = dayKey(new Date())
    const today = (orders ?? []).filter((o) => dayKey(o.createdAt) === todayKey)
    return {
      menuCount: menus?.length ?? 0,
      hiddenCount: (menus ?? []).filter((m) => !m.available).length,
      todayOrders: today.length,
      todaySales: today.reduce((s, o) => s + (Number(o.total) || 0), 0),
    }
  }, [menus, orders])

  const ready = menus && orders

  return (
    <main className="adm-bg">
      <BackButton to="/" />
      <div className="adm-workspace">
        <header className="adm-header">
          <div className="adm-header-top">
            <h1>ผู้จัดการ / แอดมิน</h1>
          </div>
          <p className="adm-sub">
            <Store size={16} aria-hidden="true" /> จัดการเมนู ดูสถิติ และดูแลโต๊ะภายในร้าน
          </p>
        </header>

        <section className="adm-stats" aria-label="สรุปวันนี้">
          <div className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-label">ออเดอร์วันนี้</span>
              <span className="adm-stat-icon">
                <ShoppingBag size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{ready ? summary.todayOrders : '–'}</strong>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-label">ยอดขายวันนี้</span>
              <span className="adm-stat-icon">
                <Banknote size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{ready ? baht(summary.todaySales) : '–'}</strong>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-label">เมนูในระบบ</span>
              <span className="adm-stat-icon">
                <UtensilsCrossed size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{ready ? summary.menuCount : '–'}</strong>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-label">เมนูที่ซ่อนอยู่</span>
              <span className="adm-stat-icon">
                <EyeOff size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{ready ? summary.hiddenCount : '–'}</strong>
          </div>
        </section>

        <h2 className="adm-section-title">เมนูการทำงาน</h2>
        <div className="adm-hub">
          <Link to="/admin/menu" className="adm-hub-card">
            <span className="adm-hub-icon">
              <UtensilsCrossed size={28} aria-hidden="true" />
            </span>
            <div>
              <h3>จัดการเมนูอาหาร</h3>
              <p>เพิ่ม แก้ไข ซ่อน หรือลบเมนู</p>
            </div>
            <ArrowRight className="adm-hub-arrow" size={20} aria-hidden="true" />
          </Link>

          <Link to="/admin/stats" className="adm-hub-card">
            <span className="adm-hub-icon">
              <ChartColumn size={28} aria-hidden="true" />
            </span>
            <div>
              <h3>สถิติร้าน</h3>
              <p>ยอดขายและเมนูขายดี</p>
            </div>
            <ArrowRight className="adm-hub-arrow" size={20} aria-hidden="true" />
          </Link>

          <Link to="/admin/tables" className="adm-hub-card">
            <span className="adm-hub-icon">
              <LayoutGrid size={28} aria-hidden="true" />
            </span>
            <div>
              <h3>จัดการโต๊ะ</h3>
              <p>ดูสถานะและเคลียร์โต๊ะ</p>
            </div>
            <ArrowRight className="adm-hub-arrow" size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}