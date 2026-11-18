import { useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import usePolling from '../../hooks/usePolling'
import { api } from '../../services/api'
import { getSavedTable, normalizeTable } from '../../services/TableService'
import { BUFFET_PRICE, SERVICE_RATE, VAT_RATE } from '../../../config/picing'
import './BillPage.css'

const LABEL = { pending: 'รอครัวรับออเดอร์', preparing: 'กำลังเตรียม', served: 'เสิร์ฟแล้ว' }
const baht = (n) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt = (iso) =>
  new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function BillPage() {
  const [params] = useSearchParams()
  const table = normalizeTable(params.get('table')) || getSavedTable()
  const [splitOverride, setSplitOverride] = useState(null)

  const { data, error } = usePolling(
    () => (table ? Promise.all([api.getTable(table), api.getOrdersByTable(table)]) : Promise.resolve(null)),
    4000,
  )
  const info = data?.[0]
  const orders = data?.[1]

  const isBuffet = (info?.mode ?? 'buffet') === 'buffet'
  const guests = Math.max(1, Number(info?.guests) || 1)
  const buffetPrice = Number(info?.buffetPrice) || BUFFET_PRICE

  const bill = useMemo(() => {
    const map = new Map()
    ;(orders ?? []).forEach((o) =>
      o.items.forEach((i) => {
        const key = i.menuId ?? i.name
        const row = map.get(key) ?? { name: i.name, price: i.price, qty: 0 }
        row.qty += i.qty
        map.set(key, row)
      }),
    )
    const lines = [...map.values()]
    const itemsTotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
    const subtotal = isBuffet ? buffetPrice * guests : itemsTotal
    const service = subtotal * SERVICE_RATE
    const vat = (subtotal + service) * VAT_RATE
    return { lines, itemsTotal, subtotal, service, vat, total: subtotal + service + vat, count: lines.reduce((s, l) => s + l.qty, 0) }
  }, [orders, isBuffet, buffetPrice, guests])

  if (!table) return <Navigate to="/customer/welcome" replace />

  const split = isBuffet ? guests : (splitOverride ?? guests)

  return (
    <div className="bill-page">
      <header className="bill-top">
        <Link to={`/customer/menu?table=${encodeURIComponent(table)}`} className="back-link">
          ← กลับไปสั่งอาหาร
        </Link>
        <h1>บิลโต๊ะ {table}</h1>
      </header>

      <main className="bill-body">
        {error && !data && <p role="alert" className="field-error">โหลดข้อมูลบิลไม่สำเร็จ</p>}
        {!data && !error && <p className="muted">กำลังโหลด...</p>}

        {data && (
          <>
            <section className="bill-card">
              <h2>
                สรุปค่าใช้จ่าย{' '}
                <span className={`mode-tag ${isBuffet ? 'buffet' : ''}`}>{isBuffet ? 'บุฟเฟ่ต์' : 'อาลาคาร์ต'}</span>
              </h2>

              {isBuffet ? (
                <p className="muted">
                  บุฟเฟ่ต์ {baht(buffetPrice)} บาท/คน × {guests} คน (เมนูในบุฟเฟ่ต์ไม่คิดเงินเพิ่ม)
                </p>
              ) : (
                bill.lines.length > 0 && (
                  <table className="bill-table">
                    <thead>
                      <tr>
                        <th>รายการ</th>
                        <th className="num">จำนวน</th>
                        <th className="num">ราคา/หน่วย</th>
                        <th className="num">รวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.lines.map((l) => (
                        <tr key={l.name}>
                          <td>{l.name}</td>
                          <td className="num">{l.qty}</td>
                          <td className="num">{baht(l.price)}</td>
                          <td className="num">{baht(l.price * l.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
              {!isBuffet && bill.lines.length === 0 && <p className="muted">ยังไม่มีรายการสั่ง</p>}

              <dl className="sum">
                <div>
                  <dt>{isBuffet ? `ค่าบุฟเฟ่ต์ (${guests} คน)` : `รวมค่าอาหาร (${bill.count} รายการ)`}</dt>
                  <dd>{baht(bill.subtotal)}</dd>
                </div>
                <div>
                  <dt>ค่าบริการ {SERVICE_RATE * 100}%</dt>
                  <dd>{baht(bill.service)}</dd>
                </div>
                <div>
                  <dt>ภาษีมูลค่าเพิ่ม {VAT_RATE * 100}%</dt>
                  <dd>{baht(bill.vat)}</dd>
                </div>
                <div className="grand">
                  <dt>ยอดรวมทั้งหมด</dt>
                  <dd>{baht(bill.total)} บาท</dd>
                </div>
              </dl>
            </section>

            <section className="bill-card">
              <h2>หารจ่ายต่อคน</h2>
              <div className="split">
                <span>จำนวนคน{isBuffet ? ' (ตามที่พนักงานตั้งไว้)' : ''}</span>
                {isBuffet ? (
                  <strong>{split}</strong>
                ) : (
                  <div className="stepper">
                    <button type="button" onClick={() => setSplitOverride(Math.max(1, split - 1))} aria-label="ลดจำนวนคน" disabled={split <= 1}>
                      −
                    </button>
                    <output aria-live="polite">{split}</output>
                    <button type="button" onClick={() => setSplitOverride(Math.min(50, split + 1))} aria-label="เพิ่มจำนวนคน">
                      +
                    </button>
                  </div>
                )}
              </div>
              <p className="per-head">
                คนละ <strong>{baht(bill.total / split)}</strong> บาท
              </p>
            </section>

            <section className="bill-card">
              <h2>ประวัติการสั่ง</h2>
              {orders.length === 0 && <p className="muted">โต๊ะนี้ยังไม่มีรายการสั่ง</p>}
              <ul className="history">
                {orders.map((o) => (
                  <li key={o.id}>
                    <div className="order-head">
                      <span>{fmt(o.createdAt)}</span>
                      <span className={`badge ${o.status}`}>{LABEL[o.status] ?? o.status}</span>
                    </div>
                    <ul className="history-items">
                      {o.items.map((i) => (
                        <li key={`${o.id}-${i.menuId ?? i.name}`}>
                          <span>
                            {i.name} x{i.qty}
                          </span>
                          {!isBuffet && <span>{baht(i.price * i.qty)}</span>}
                        </li>
                      ))}
                    </ul>
                    {!isBuffet && (
                      <p className="order-sub">รวมออเดอร์นี้ {baht(o.total ?? o.items.reduce((s, i) => s + i.price * i.qty, 0))}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  )
}