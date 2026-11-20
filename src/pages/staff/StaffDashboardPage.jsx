import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Check, Clock } from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import OrderFilterBar from '../../components/staff/OrderFilterBar'
import OrderCard from '../../components/staff/OrderCard'
import './StaffDashboardPage.css'

export default function StaffDashboardPage() {
  const navigate = useNavigate()

  const fetchDashboardData = useCallback(async () => {
    const [orders, serviceCalls] = await Promise.all([
      api.getOrders(),
      api.getServiceCalls(),
    ])
    return { orders, serviceCalls }
  }, [])

  const { data, error, loading, reload } = usePolling(fetchDashboardData, 4000)

  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTable, setSearchTable] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [busyCallId, setBusyCallId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notice, setNotice] = useState('')

  // ดึงรายชื่อโต๊ะทั้งหมดมาใส่ในตัวเลือกกรองโต๊ะ
  useEffect(() => {
    api.getTables().then(setTables).catch(() => setTables([]))
  }, [])

  // กรองเฉพาะออเดอร์รอบปัจจุบัน (ซ่อนบิลเก่าที่แอดมินเคลียร์โต๊ะเป็น paid แล้ว)
  const activeOrders = useMemo(
    () => (data?.orders ?? []).filter((o) => o.status !== 'paid'),
    [data],
  )

  // รายการที่ลูกค้ากด "เรียกพนักงาน" และยังไม่ได้รับเรื่อง
  const staffCalls = useMemo(
    () => (data?.serviceCalls ?? []).filter((c) => c.type === 'call' && !c.done),
    [data],
  )

  // นับจำนวนออเดอร์ (active นับเฉพาะที่รอรับ + กำลังทำ ไม่รวมเสิร์ฟแล้ว)
  const counts = useMemo(() => {
    const pending = activeOrders.filter((o) => o.status === 'pending').length
    const preparing = activeOrders.filter((o) => o.status === 'preparing').length
    const served = activeOrders.filter((o) => o.status === 'served').length
    return {
      active: pending + preparing,
      pending,
      preparing,
      served,
    }
  }, [activeOrders])

  // กรองออเดอร์ตามสถานะ (แท็บแรกตัด served ออก), Dropdown โต๊ะ และช่องค้นหา
  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      const matchStatus =
        statusFilter === 'all'
          ? order.status !== 'served'
          : order.status === statusFilter

      const matchDropdownTable =
        selectedTable === 'all' || order.tableId === selectedTable

      const matchSearchTable = order.tableId
        .toLowerCase()
        .includes(searchTable.trim().toLowerCase())

      return matchStatus && matchDropdownTable && matchSearchTable
    })
  }, [activeOrders, statusFilter, selectedTable, searchTable])

  // ปุ่มรีเฟรชข้อมูลพร้อมแสดงสถานะและแจ้งเตือนสั้นๆ
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true)
      await reload()
      setNotice('อัปเดตข้อมูลบิลล่าสุดแล้ว')
      setTimeout(() => setNotice(''), 2500)
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }

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

  // พนักงานกดรับเรื่องเรียกพนักงาน -> ปิดคำขอเพื่อให้ปุ่มฝั่งลูกค้ารีเซ็ตกลับมากดใหม่ได้
  const handleAcknowledgeCall = async (call) => {
    try {
      setBusyCallId(call.id)
      const sameTableCalls = staffCalls.filter((c) => c.tableId === call.tableId)
      await Promise.all(sameTableCalls.map((c) => api.updateServiceCall(c.id, { done: true })))
      await reload()
      setNotice(`รับเรื่องเรียกพนักงานโต๊ะ ${call.tableId} แล้ว`)
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      alert(`รับเรื่องไม่สำเร็จ: ${err.message}`)
    } finally {
      setBusyCallId(null)
    }
  }

  const emptyMessages = {
    all: '🍲 ตอนนี้ไม่มีออเดอร์ค้างในครัว เสิร์ฟครบทุกโต๊ะแล้ว!',
    pending: '✨ รับออเดอร์ครบทุกโต๊ะแล้ว ไม่มีรายการรอรับในขณะนี้',
    preparing: '🔥 ครัวว่างอยู่! ไม่มีรายการที่กำลังเตรียมเสิร์ฟ',
    served: '🥢 ยังไม่มีรายการที่เสิร์ฟแล้วในรอบนี้',
  }

  return (
    <main className="cloth staff-bg">
      <div className="staff-container">
        <div className="staff-workspace">
          <header className="staff-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/')}>
                ← ย้อนกลับ
              </button>
              <h1>แดชบอร์ดจัดการออร์เดอร์ (พนักงาน)</h1>
            </div>

            <button
              className="reload-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? '⏳ กำลังรีเฟรช...' : '↻ รีเฟรชข้อมูล'}
            </button>
          </header>

          {notice && (
            <div role="status" className="staff-notice-bar">
              <Check size={16} aria-hidden="true" /> {notice}
            </div>
          )}

          {/* แถบแจ้งเตือนลูกค้าเรียกพนักงาน */}
          {staffCalls.length > 0 && (
            <section className="staff-calls-box" aria-label="รายการเรียกพนักงาน">
              <div className="staff-calls-head">
                <BellRing size={18} aria-hidden="true" />
                <strong>ลูกค้าเรียกพนักงาน ({staffCalls.length} โต๊ะ)</strong>
              </div>
              <div className="staff-calls-list">
                {staffCalls.map((call) => (
                  <div key={call.id} className="staff-call-card">
                    <div className="staff-call-info">
                      <span className="staff-call-table">โต๊ะ {call.tableId}</span>
                      <span className="staff-call-time">
                        <Clock size={14} aria-hidden="true" /> เรียกเมื่อ{' '}
                        {new Date(call.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        น.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="staff-call-btn"
                      disabled={busyCallId === call.id}
                      onClick={() => handleAcknowledgeCall(call)}
                    >
                      <Check size={16} aria-hidden="true" />{' '}
                      {busyCallId === call.id ? 'กำลังรับเรื่อง...' : 'รับเรื่อง'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <OrderFilterBar
            tables={tables}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            searchTable={searchTable}
            onSearchChange={setSearchTable}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
          />

          {loading && !data && (
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
                {selectedTable !== 'all' || searchTable.trim()
                  ? '🔍 ไม่พบออเดอร์ของโต๊ะที่เลือกในหมวดหมู่นี้'
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