import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import OrderFilterBar from '../../components/staff/OrderFilterBar'
import OrderCard from '../../components/staff/OrderCard'
import './StaffDashboardPage.css'

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const { data: orders, error, loading, reload } = usePolling(() => api.getOrders(), 4000)

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTable, setSearchTable] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const counts = useMemo(() => {
    const list = orders || []
    return {
      all: list.length,
      pending: list.filter((o) => o.status === 'pending').length,
      preparing: list.filter((o) => o.status === 'preparing').length,
      served: list.filter((o) => o.status === 'served').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      const matchStatus = statusFilter === 'all' || order.status === statusFilter
      const matchTable = order.tableId.toLowerCase().includes(searchTable.trim().toLowerCase())
      return matchStatus && matchTable
    })
  }, [orders, statusFilter, searchTable])

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      setUpdatingId(orderId)
      await api.updateOrderStatus(orderId, nextStatus)
      await reload()
    } catch (err) {
      alert(`เปลี่ยนสถานะไม่สำเร็จ: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const emptyMessages = {
    all: '🍲 ตอนนี้ยังไม่มีออเดอร์สุกี้เข้าครัว รอรับออเดอร์จากโต๊ะลูกค้าได้เลย!',
    pending: '✨ รับออเดอร์ครบทุกโต๊ะแล้ว ไม่มีรายการรอรับในขณะนี้',
    preparing: '🔥 ครัวว่างอยู่! ไม่มีรายการที่กำลังเตรียมเสิร์ฟ',
    served: '🥢 ยังไม่มีรายการที่เสิร์ฟแล้วในรอบนี้',
  }

  return (
    <main className="cloth staff-bg">
      <div className="staff-container">
        {/* แผ่นกระดานสีขาวทึบขนาดใหญ่ คลุมพื้นที่ทำงานทั้งหมดไม่ให้ลายแดงแทรก */}
        <div className="staff-workspace">
          <header className="staff-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/')}>
                ← ย้อนกลับ
              </button>
              <h1>แดชบอร์ดจัดการออร์เดอร์ (พนักงาน)</h1>
            </div>

            <button className="reload-btn" onClick={reload}>
              ↻ รีเฟรชข้อมูล
            </button>
          </header>

          <OrderFilterBar
            searchTable={searchTable}
            onSearchChange={setSearchTable}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
          />

          {loading && !orders && (
            <div className="state-msg">กำลังเปิดสมุดรับออเดอร์ร้านสุกี้...</div>
          )}

          {error && (
            <div className="state-msg error">
              เกิดข้อผิดพลาดในการเชื่อมต่อระบบกลาง: {error.message}
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="state-msg">
              <p className="empty-title">
                {searchTable.trim()
                  ? `🔍 ไม่พบออเดอร์ของโต๊ะ "${searchTable.toUpperCase()}" ในหมวดหมู่นี้`
                  : emptyMessages[statusFilter]}
              </p>
              <span className="empty-sub">ระบบจะอัปเดตบิลอัตโนมัติทันทีเมื่อลูกค้าสั่งอาหาร</span>
            </div>
          )}

          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingId === order.id}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}