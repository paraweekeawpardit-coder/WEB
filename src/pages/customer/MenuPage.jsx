import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import MenuToolbar from '../../components/customer/MenuToolbar'
import MenuCard from '../../components/customer/MenuCard'
import CartPanel from '../../components/customer/CartPanel'
import OrderStatus from '../../components/customer/OrderStatus'
import ServiceActions from "../../components/customer/ServiceAction"
import useCart from '../../hooks/useCart'
import { api } from '../../services/api'
import { getSavedTable, normalizeTable } from '../../services/TableService'
import './MenuPage.css'

export default function MenuPage() {
  const [params] = useSearchParams()
  const table = normalizeTable(params.get('table')) || getSavedTable()

  const [menus, setMenus] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isBuffet, setIsBuffet] = useState(true)
  const cart = useCart()

  // อ่านรูปแบบบริการของโต๊ะ (บุฟเฟ่ต์ซ่อนราคา, อาลาคาร์ตแสดงราคา)
  useEffect(() => {
    if (!table) return
    api
      .getTable(table)
      .then((t) => setIsBuffet((t.mode ?? 'buffet') === 'buffet'))
      .catch(() => {})
  }, [table])

  useEffect(() => {
    let alive = true
    api
      .getMenus()
      .then((data) => {
        if (!alive) return
        setMenus(data)
        setStatus('done')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return menus.filter(
      (m) => m.available && (category === 'all' || m.category === category) && m.name.toLowerCase().includes(q),
    )
  }, [menus, search, category])

  if (!table) return <Navigate to="/customer/welcome" replace />

  const confirm = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.createOrder({ tableId: table, items: cart.items })
      cart.clear()
      setNotice('ส่งออเดอร์เข้าครัวแล้ว')
      setTimeout(() => setNotice(''), 4000)
    } catch {
      setError('ส่งออเดอร์ไม่สำเร็จ กรุณาลองใหม่หรือเรียกพนักงาน')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="menu-page">
      <header className="menu-top">
        <Link to="/" className="back-link">
          ← หน้าหลัก
        </Link>
        <div>
          <p className="shop">ร้านสุกี้</p>
          <h1>โต๊ะ {table}</h1>
        </div>
        <span className="cart-badge" aria-label={`ตะกร้ามี ${cart.count} รายการ`}>
          ตะกร้า {cart.count}
        </span>
      </header>

      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}

      <div className="menu-layout">
        <section className="menu-main">
          <MenuToolbar search={search} onSearch={setSearch} category={category} onCategory={setCategory} />

          {status === 'loading' && <p className="muted">กำลังโหลดเมนู...</p>}
          {status === 'error' && <p role="alert" className="field-error">โหลดเมนูไม่สำเร็จ กรุณาลองใหม่</p>}
          {status === 'done' && visible.length === 0 && <p className="muted">ไม่พบเมนูที่ค้นหา</p>}

          <ul className="menu-grid">
            {visible.map((m) => (
              <MenuCard key={m.id} menu={m} onAdd={cart.add} showPrice={!isBuffet} />
            ))}
          </ul>
        </section>

        <div className="menu-side">
          <CartPanel
            table={table}
            items={cart.items}
            onSetQty={cart.setQty}
            onRemove={cart.remove}
            onConfirm={confirm}
            submitting={submitting}
            error={error}
          />
          <Link to={`/customer/bill?table=${encodeURIComponent(table)}`} className="add-btn bill-link">
            ดูประวัติและยอดรวมบิล
          </Link>
          <OrderStatus table={table} />
          <ServiceActions table={table} />
        </div>
      </div>
    </div>
  )
}