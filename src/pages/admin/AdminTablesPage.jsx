import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, LayoutGrid, Receipt, RefreshCw, Users } from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import BackButton from '../../components/admin/BackButton'
import AdminNav from '../../components/admin/AdminNav'
import Toast from '../../components/admin/Toast'
import TableCard from '../../components/admin/TableCard'
import AssignTableModal from '../../components/admin/AssignTableModal'
import InspectTableModal from '../../components/admin/InspectTableModal'
import ClearTableModal from '../../components/admin/ClearTableModal'
import { BUFFET_PRICE, SERVICE_RATE, VAT_RATE } from '../../../config/picing'
import './AdminPages.css'

const STATUS_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'available', label: 'ว่าง' },
  { id: 'occupied', label: 'กำลังใช้งาน' },
  { id: 'billing', label: 'รอเช็กบิล' },
]

// ระบบจัดการโต๊ะ: แอดมินเปิดโต๊ะระบุจำนวนคน / รับเรื่องเช็กบิล / เคลียร์โต๊ะเมื่อลูกค้ากลับ
export default function AdminTablesPage() {
  const fetchAll = useCallback(async () => {
    const [tables, orders, serviceCalls] = await Promise.all([
      api.getTables(),
      api.getOrders(),
      api.getServiceCalls(),
    ])
    return { tables, orders, serviceCalls }
  }, [])

  const { data, error, loading, reload } = usePolling(fetchAll, 5000)

  const [statusFilter, setStatusFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [assignModal, setAssignModal] = useState(null) // { table, isEdit }
  const [inspectTable, setInspectTable] = useState(null) // โต๊ะที่กดดูรายการอาหาร
  const [clearingTable, setClearingTable] = useState(null) // โต๊ะที่รอยืนยันการเคลียร์
  const [busyId, setBusyId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)

  const closeToast = useCallback(() => setToast(null), [])
  const notify = (msg, type = 'ok') => setToast({ msg, type, id: Date.now() })

  const handleRefresh = async () => {
    setRefreshing(true)
    await reload()
    notify('อัปเดตข้อมูลผังโต๊ะล่าสุดแล้ว')
    setTimeout(() => setRefreshing(false), 350)
  }

  // รวมข้อมูลโต๊ะ + ออเดอร์ค้าง + คำขอเช็กบิล เข้าด้วยกัน
  const enrichedTables = useMemo(() => {
    const tables = data?.tables ?? []
    const orders = data?.orders ?? []
    const calls = data?.serviceCalls ?? []

    return tables.map((t) => {
      const tableCalls = calls.filter((c) => c.tableId === t.id && !c.done)
      const hasBillRequest = tableCalls.some((c) => c.type === 'bill')
      const activeOrders =
        t.status === 'available'
          ? []
          : orders.filter((o) => o.tableId === t.id && o.status !== 'paid')

      let effectiveStatus = t.status || 'available'
      if (effectiveStatus !== 'available' && (effectiveStatus === 'billing' || hasBillRequest)) {
        effectiveStatus = 'billing'
      }

      const isBuffet = (t.mode ?? 'buffet') === 'buffet'
      const guests = Math.max(1, Number(t.guests) || 1)
      const buffetPrice = Number(t.buffetPrice) || BUFFET_PRICE

      const itemsTotal = activeOrders.reduce(
        (sum, o) =>
          sum +
          (Number(o.total ?? (o.items ?? []).reduce((s, i) => s + i.price * i.qty, 0)) || 0),
        0,
      )

      const subtotal =
        effectiveStatus === 'available' ? 0 : isBuffet ? buffetPrice * guests : itemsTotal
      const serviceCharge = subtotal * SERVICE_RATE
      const vat = (subtotal + serviceCharge) * VAT_RATE
      const totalAmount = subtotal + serviceCharge + vat
      const zone = String(t.id).replace(/[0-9]/g, '') || 'ทั่วไป'

      return {
        ...t,
        isBuffet,
        effectiveGuests: guests,
        buffetPrice,
        zone,
        effectiveStatus,
        activeOrders,
        tableCalls,
        subtotal,
        serviceCharge,
        vat,
        totalAmount,
      }
    })
  }, [data])

  const zones = useMemo(() => {
    const unique = [...new Set(enrichedTables.map((t) => t.zone))]
    return [{ id: 'all', label: 'ทุกโซน' }, ...unique.map((z) => ({ id: z, label: `โซน ${z}` }))]
  }, [enrichedTables])

  const counts = useMemo(() => {
    const c = { all: enrichedTables.length, available: 0, occupied: 0, billing: 0 }
    for (const t of enrichedTables) {
      if (c[t.effectiveStatus] !== undefined) c[t.effectiveStatus] += 1
    }
    return c
  }, [enrichedTables])

  const filteredTables = useMemo(() => {
    return enrichedTables.filter(
      (t) =>
        (statusFilter === 'all' || t.effectiveStatus === statusFilter) &&
        (zoneFilter === 'all' || t.zone === zoneFilter),
    )
  }, [enrichedTables, statusFilter, zoneFilter])

  const openAssignModal = (table, isEdit = false) => {
    setAssignModal({ table, isEdit })
  }

  // บันทึกการเปิดโต๊ะ / จำนวนลูกค้า
  const handleAssignSubmit = async (count, mode) => {
    const { table, isEdit } = assignModal
    try {
      setBusyId(table.id)
      await api.updateTable(table.id, { status: 'occupied', guests: count, mode })
      setAssignModal(null)
      await reload()
      notify(
        isEdit
          ? `อัปเดตจำนวนลูกค้าโต๊ะ ${table.id} เป็น ${count} คนแล้ว`
          : `เปิดโต๊ะ ${table.id} (${count} คน) เรียบร้อยแล้ว`,
      )
    } catch (err) {
      notify(`บันทึกไม่สำเร็จ: ${err.message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  // รับเรื่องเช็กบิล -> ปิด serviceCall (done: true) เพื่อให้ปุ่มฝั่งลูกค้ารีเซ็ตกลับมากดใหม่ได้
  const handleAcknowledgeBill = async (target) => {
    try {
      setBusyId(target.id)
      const billCalls = target.tableCalls.filter((c) => c.type === 'bill' && !c.done)

      await Promise.all(billCalls.map((c) => api.updateServiceCall(c.id, { done: true })))

      if (target.status === 'billing') {
        await api.updateTable(target.id, { status: 'occupied' })
      }

      await reload()
      notify(`รับเรื่องเช็กบิลโต๊ะ ${target.id} แล้ว`)
    } catch (err) {
      notify(`รับเรื่องไม่สำเร็จ: ${err.message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  // เคลียร์โต๊ะเมื่อลูกค้าจ่ายเงินและกลับแล้ว
  const handleClearTable = async () => {
    const target = clearingTable
    if (!target) return

    try {
      setBusyId(target.id)
      await Promise.all(target.activeOrders.map((o) => api.updateOrderStatus(o.id, 'paid')))
      await Promise.all(target.tableCalls.map((c) => api.updateServiceCall(c.id, { done: true })))
      await api.updateTable(target.id, { status: 'available', guests: 0, mode: 'buffet' })

      setClearingTable(null)
      if (inspectTable?.id === target.id) setInspectTable(null)
      await reload()
      notify(`เคลียร์โต๊ะ ${target.id} เรียบร้อยแล้ว`)
    } catch (err) {
      notify(`เคลียร์โต๊ะไม่สำเร็จ: ${err.message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="adm-bg">
      <BackButton to="/admin" />
      <div className="adm-workspace">
        <AdminNav title="จัดการโต๊ะภายในร้าน" />

        {/* การ์ดสรุปสถานะโต๊ะ */}
        <section className="adm-stats" aria-label="สรุปสถานะโต๊ะ">
          <div className="adm-stat">
            <div className="adm-stat-top">
              <span className="adm-stat-label">โต๊ะทั้งหมด</span>
              <span className="adm-stat-icon">
                <LayoutGrid size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{data ? counts.all : '–'}</strong>
          </div>

          <div className="adm-stat tbl-stat-available">
            <div className="adm-stat-top">
              <span className="adm-stat-label">โต๊ะว่าง</span>
              <span className="adm-stat-icon">
                <CheckCircle2 size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{data ? counts.available : '–'}</strong>
          </div>

          <div className="adm-stat tbl-stat-occupied">
            <div className="adm-stat-top">
              <span className="adm-stat-label">กำลังใช้งาน</span>
              <span className="adm-stat-icon">
                <Users size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{data ? counts.occupied : '–'}</strong>
          </div>

          <div className="adm-stat tbl-stat-billing">
            <div className="adm-stat-top">
              <span className="adm-stat-label">รอเช็กบิล</span>
              <span className="adm-stat-icon">
                <Receipt size={18} aria-hidden="true" />
              </span>
            </div>
            <strong className="adm-stat-value">{data ? counts.billing : '–'}</strong>
          </div>
        </section>

        {/* แถบตัวกรองโซน + สถานะ + ปุ่มรีเฟรช */}
        <div className="adm-filters">
          <div className="adm-chips" role="tablist" aria-label="โซนโต๊ะ">
            {zones.map((z) => (
              <button
                key={z.id}
                type="button"
                role="tab"
                aria-selected={zoneFilter === z.id}
                className={zoneFilter === z.id ? 'adm-pill active' : 'adm-pill'}
                onClick={() => setZoneFilter(z.id)}
              >
                {z.label}
              </button>
            ))}
          </div>

          <div className="tbl-filter-right">
            <div className="adm-seg" role="tablist" aria-label="สถานะโต๊ะ">
              {STATUS_TABS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === s.id}
                  className={statusFilter === s.id ? 'active' : ''}
                  onClick={() => setStatusFilter(s.id)}
                >
                  {s.label} <span>{counts[s.id]}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="adm-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="อัปเดตข้อมูลล่าสุด"
            >
              <RefreshCw size={16} className={refreshing ? 'adm-spin' : ''} aria-hidden="true" />{' '}
              {refreshing ? 'กำลังอัปเดต...' : 'รีเฟรช'}
            </button>
          </div>
        </div>

        {loading && !data && <p className="adm-empty">กำลังโหลดข้อมูลผังโต๊ะ...</p>}
        {error && <p className="adm-error-box">เชื่อมต่อระบบกลางไม่ได้: {error.message}</p>}

        {data && filteredTables.length === 0 && (
          <div className="adm-empty">
            <LayoutGrid size={36} strokeWidth={1.5} aria-hidden="true" />
            <p>ไม่พบโต๊ะในหมวดหมู่ที่เลือก</p>
          </div>
        )}

        {/* ผังการ์ดโต๊ะในร้าน */}
        <ul className="tbl-grid">
          {filteredTables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              busy={busyId === t.id}
              onOpenAssign={openAssignModal}
              onAcknowledgeBill={handleAcknowledgeBill}
              onInspect={setInspectTable}
              onClear={setClearingTable}
            />
          ))}
        </ul>
      </div>

      {assignModal && (
        <AssignTableModal
          table={assignModal.table}
          isEdit={assignModal.isEdit}
          busy={busyId === assignModal.table.id}
          onSubmit={handleAssignSubmit}
          onClose={() => setAssignModal(null)}
        />
      )}

      {inspectTable && (
        <InspectTableModal
          table={inspectTable}
          onClose={() => setInspectTable(null)}
          onRequestClear={setClearingTable}
        />
      )}

      {clearingTable && (
        <ClearTableModal
          table={clearingTable}
          busy={busyId === clearingTable.id}
          onConfirm={handleClearTable}
          onClose={() => setClearingTable(null)}
        />
      )}

      <Toast key={toast?.id} toast={toast} onClose={closeToast} />
    </main>
  )
}