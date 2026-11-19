import { useCallback, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Minus,
  Plus,
  Receipt,
  RefreshCw,
  RotateCcw,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import BackButton from '../../components/admin/BackButton'
import AdminNav from '../../components/admin/AdminNav'
import Toast from '../../components/admin/Toast'
import { baht } from '../../utils/stats'
import './AdminPages.css'

const STATUS_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'available', label: 'ว่าง' },
  { id: 'occupied', label: 'กำลังใช้งาน' },
  { id: 'billing', label: 'รอเช็กบิล' },
]

const STATUS_META = {
  available: { label: 'ว่าง', hint: 'กดเพื่อเปิดโต๊ะรับลูกค้า', Icon: CheckCircle2 },
  occupied: { label: 'กำลังใช้งาน', hint: 'มีลูกค้าใช้บริการ', Icon: Users },
  billing: { label: 'รอเช็กบิล', hint: 'ลูกค้าขอเช็กบิลแล้ว', Icon: Receipt },
}

const GUEST_PRESETS = [1, 2, 3, 4, 5, 6]

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
  const [guestCount, setGuestCount] = useState(2)
  const [guestError, setGuestError] = useState('')
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

      const totalAmount = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
      const zone = String(t.id).replace(/[0-9]/g, '') || 'ทั่วไป'

      return {
        ...t,
        zone,
        effectiveStatus,
        activeOrders,
        tableCalls,
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

  // เปิดหน้าต่างระบุจำนวนคน (สำหรับเปิดโต๊ะใหม่ หรือแก้ไขจำนวนคน)
  const openAssignModal = (table, isEdit = false) => {
    setAssignModal({ table, isEdit })
    setGuestCount(table.guests > 0 ? table.guests : 2)
    setGuestError('')
  }

  // บันทึกการเปิดโต๊ะ / จำนวนลูกค้า
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    const count = Number(guestCount)
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      setGuestError('กรุณาระบุจำนวนลูกค้าตั้งแต่ 1 - 50 คน')
      return
    }

    const { table, isEdit } = assignModal
    try {
      setBusyId(table.id)
      await api.updateTable(table.id, { status: 'occupied', guests: count })
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
      // 1. ปิดออเดอร์ของโต๊ะนี้เป็นชำระแล้ว (เก็บไว้คิดสถิติ แต่หน้าลูกค้าจะไม่เห็น)
      await Promise.all(
        target.activeOrders.map((o) => api.updateOrderStatus(o.id, 'paid')),
      )

      // 2. ปิดคำขอเรียกพนักงาน/เช็กบิลที่ค้างอยู่
      await Promise.all(
        target.tableCalls.map((c) => api.updateServiceCall(c.id, { done: true })),
      )

      // 3. ทำสุดท้าย: รีเซ็ตโต๊ะเป็นว่าง และจำนวนคนเป็น 0
      await api.updateTable(target.id, { status: 'available', guests: 0 })

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
          {filteredTables.map((t) => {
            const meta = STATUS_META[t.effectiveStatus] ?? STATUS_META.available
            const StatusIcon = meta.Icon
            const isAvailable = t.effectiveStatus === 'available'
            const isBilling = t.effectiveStatus === 'billing'

            return (
              <li
                key={t.id}
                className={`tbl-card status-${t.effectiveStatus}${isAvailable ? ' is-clickable' : ''}`}
                onClick={isAvailable ? () => openAssignModal(t, false) : undefined}
              >
                <div className="tbl-card-head">
                  <div>
                    <span className="tbl-zone">โซน {t.zone}</span>
                    <h3 className="tbl-number">โต๊ะ {t.id}</h3>
                  </div>
                  <span className={`tbl-badge ${t.effectiveStatus}`}>
                    <StatusIcon size={14} aria-hidden="true" /> {meta.label}
                  </span>
                </div>

                <div className="tbl-card-body">
                  {isAvailable ? (
                    <p className="tbl-idle-text">{meta.hint}</p>
                  ) : (
                    <>
                      <div className="tbl-info-row">
                        <button
                          type="button"
                          className="tbl-guest-pill"
                          onClick={() => openAssignModal(t, true)}
                          title="คลิกเพื่อแก้ไขจำนวนลูกค้า"
                        >
                          <Users size={15} aria-hidden="true" />{' '}
                          {t.guests > 0 ? `${t.guests} คน` : 'ระบุจำนวนคน'}
                        </button>
                        <span>
                          <Clock size={15} aria-hidden="true" /> {t.activeOrders.length} ออเดอร์
                        </span>
                      </div>
                      <div className="tbl-bill-row">
                        <span>ยอดรวมปัจจุบัน</span>
                        <strong>{baht(t.totalAmount)}</strong>
                      </div>
                    </>
                  )}
                </div>

                <div className="tbl-card-foot" onClick={(e) => e.stopPropagation()}>
                  {isAvailable ? (
                    <button
                      type="button"
                      className="adm-btn tbl-btn-open"
                      disabled={busyId === t.id}
                      onClick={() => openAssignModal(t, false)}
                    >
                      <UserPlus size={16} aria-hidden="true" /> เปิดโต๊ะรับลูกค้า
                    </button>
                  ) : isBilling ? (
                    <div className="tbl-billing-actions">
                      <button
                        type="button"
                        className="adm-btn tbl-btn-ack"
                        disabled={busyId === t.id}
                        onClick={() => handleAcknowledgeBill(t)}
                      >
                        <Check size={16} aria-hidden="true" />{' '}
                        {busyId === t.id ? 'กำลังอัปเดต...' : 'รับเรื่องเช็กบิล'}
                      </button>
                      <div className="tbl-sub-actions">
                        <button
                          type="button"
                          className="adm-btn"
                          disabled={busyId === t.id}
                          onClick={() => setInspectTable(t)}
                        >
                          ดูรายการ
                        </button>
                        <button
                          type="button"
                          className="adm-btn danger"
                          disabled={busyId === t.id}
                          onClick={() => setClearingTable(t)}
                        >
                          <RotateCcw size={15} aria-hidden="true" /> เคลียร์โต๊ะ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="adm-btn"
                        disabled={busyId === t.id}
                        onClick={() => setInspectTable(t)}
                      >
                        ดูรายการ
                      </button>
                      <button
                        type="button"
                        className="adm-btn danger"
                        disabled={busyId === t.id}
                        onClick={() => setClearingTable(t)}
                      >
                        <RotateCcw size={15} aria-hidden="true" /> เคลียร์โต๊ะ
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Modal เปิดโต๊ะ / ระบุจำนวนลูกค้า */}
      {assignModal && (
        <div
          className="adm-modal-bg"
          role="dialog"
          aria-modal="true"
          aria-label={`เปิดโต๊ะ ${assignModal.table.id}`}
        >
          <form className="adm-modal tbl-assign-modal" onSubmit={handleAssignSubmit}>
            <div className="adm-modal-head">
              <h2>
                {assignModal.isEdit
                  ? `แก้ไขจำนวนลูกค้า · โต๊ะ ${assignModal.table.id}`
                  : `เปิดโต๊ะ ${assignModal.table.id} (โซน ${assignModal.table.zone})`}
              </h2>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setAssignModal(null)}
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tbl-preset-group">
              <span className="tbl-preset-label">เลือกจำนวนลูกค้า</span>
              <div className="tbl-presets">
                {GUEST_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={Number(guestCount) === n ? 'tbl-preset-btn active' : 'tbl-preset-btn'}
                    onClick={() => {
                      setGuestCount(n)
                      setGuestError('')
                    }}
                  >
                    {n} คน
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-field">
              <span>หรือระบุจำนวนคนเอง</span>
              <div className="tbl-stepper">
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => {
                    setGuestCount((c) => Math.max(1, Number(c) - 1))
                    setGuestError('')
                  }}
                  aria-label="ลดจำนวนคน"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={guestCount}
                  onChange={(e) => {
                    setGuestCount(e.target.value)
                    setGuestError('')
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => {
                    setGuestCount((c) => Math.min(50, Number(c) + 1))
                    setGuestError('')
                  }}
                  aria-label="เพิ่มจำนวนคน"
                >
                  <Plus size={18} />
                </button>
              </div>
              {guestError && <small className="adm-field-error">{guestError}</small>}
            </div>

            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn"
                onClick={() => setAssignModal(null)}
                disabled={busyId === assignModal.table.id}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="adm-btn primary"
                disabled={busyId === assignModal.table.id}
              >
                {busyId === assignModal.table.id
                  ? 'กำลังบันทึก...'
                  : assignModal.isEdit
                    ? 'บันทึก'
                    : 'ยืนยัน'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal ดูรายการอาหารที่โต๊ะสั่ง */}
      {inspectTable && (
        <div
          className="adm-modal-bg"
          role="dialog"
          aria-modal="true"
          aria-label={`รายการโต๊ะ ${inspectTable.id}`}
        >
          <div className="adm-modal">
            <div className="adm-modal-head">
              <h2>
                รายการอาหาร · โต๊ะ {inspectTable.id} ({STATUS_META[inspectTable.effectiveStatus]?.label})
              </h2>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setInspectTable(null)}
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </div>

            {inspectTable.activeOrders.length === 0 ? (
              <p className="adm-empty">โต๊ะนี้ยังไม่มีรายการสั่งอาหาร</p>
            ) : (
              <div className="tbl-order-list">
                {inspectTable.activeOrders.map((order, idx) => (
                  <div key={order.id ?? idx} className="tbl-order-box">
                    <div className="tbl-order-head">
                      <strong>ออเดอร์ #{order.id}</strong>
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        น.
                      </span>
                    </div>
                    <ul>
                      {(order.items ?? []).map((item, i) => (
                        <li key={i}>
                          <span>
                            {item.name} × {item.qty}
                          </span>
                          <span>{baht(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="tbl-modal-total">
              <span>ยอดรวมทั้งหมด</span>
              <strong>{baht(inspectTable.totalAmount)}</strong>
            </div>

            <div className="adm-modal-actions">
              <button type="button" className="adm-btn" onClick={() => setInspectTable(null)}>
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                className="adm-btn primary"
                onClick={() => {
                  const t = inspectTable
                  setInspectTable(null)
                  setClearingTable(t)
                }}
              >
                <RotateCcw size={16} aria-hidden="true" /> เคลียร์โต๊ะนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการเคลียร์โต๊ะ */}
      {clearingTable && (
        <div className="adm-modal-bg" role="alertdialog" aria-modal="true" aria-label="ยืนยันการเคลียร์โต๊ะ">
          <div className="adm-modal adm-confirm">
            <span className="adm-confirm-icon">
              <RotateCcw size={26} aria-hidden="true" />
            </span>
            <h2>เคลียร์โต๊ะ “{clearingTable.id}” ?</h2>
            <p>
              ยอดรวมปัจจุบัน <strong>{baht(clearingTable.totalAmount)}</strong> ({clearingTable.activeOrders.length}{' '}
              ออเดอร์)
              <br />
              เมื่อยืนยันแล้ว โต๊ะจะเปลี่ยนสถานะเป็น <strong>“ว่าง”</strong> เพื่อพร้อมรับลูกค้ารอบถัดไป
            </p>
            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn"
                onClick={() => setClearingTable(null)}
                disabled={busyId === clearingTable.id}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="adm-btn danger-solid"
                onClick={handleClearTable}
                disabled={busyId === clearingTable.id}
              >
                {busyId === clearingTable.id ? 'กำลังเคลียร์...' : 'ยืนยันเคลียร์โต๊ะ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast key={toast?.id} toast={toast} onClose={closeToast} />
    </main>
  )
}