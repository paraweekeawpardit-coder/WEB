import { ChartColumn, LayoutGrid, UtensilsCrossed } from 'lucide-react'
import { NavLink } from 'react-router-dom'

// แถบเมนูของหน้าแอดมิน (ส่วนจัดการเมนู + สถิติร้าน + จัดการโต๊ะ)
export default function AdminNav({ title }) {
  const cls = ({ isActive }) => (isActive ? 'adm-tab active' : 'adm-tab')

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-top">
          <h1>{title}</h1>
        </div>
        <nav className="adm-nav" aria-label="เมนูแอดมิน">
          <NavLink to="/admin/menu" className={cls}>
            <UtensilsCrossed size={16} aria-hidden="true" /> จัดการเมนู
          </NavLink>
          <NavLink to="/admin/stats" className={cls}>
            <ChartColumn size={16} aria-hidden="true" /> สถิติร้าน
          </NavLink>
          <NavLink to="/admin/tables" className={cls}>
            <LayoutGrid size={16} aria-hidden="true" /> จัดการโต๊ะ
          </NavLink>
        </nav>
      </header>
    </>
  )
}