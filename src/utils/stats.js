// ฟังก์ชันคำนวณสถิติร้าน (pure function ไม่ยุ่งกับ React เพื่อให้ทดสอบง่าย)

// คีย์วันที่แบบ YYYY-MM-DD ตามเวลาเครื่อง
export const dayKey = (d) => {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// ยอดขายรายวันย้อนหลัง `days` วัน (วันที่ไม่มีข้อมูล = 0)
// rows = ออเดอร์ (ค่าเริ่มต้น) หรือประวัติโต๊ะ (visits) โดยบอกวิธีอ่านวันที่/ยอดเงินผ่าน getDate, getValue
export function buildDailySales(
  rows,
  days = 7,
  getDate = (o) => o.createdAt,
  getValue = (o) => o.total,
) {
  const list = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    list.push({ key: dayKey(d), date: d, total: 0, orders: 0 })
  }
  const byKey = Object.fromEntries(list.map((x) => [x.key, x]))
  for (const r of rows) {
    const row = byKey[dayKey(getDate(r))]
    if (!row) continue
    row.total += Number(getValue(r)) || 0
    row.orders += 1
  }
  return list
}

// ยอดตามบิล: นับจากโต๊ะที่เคลียร์แล้ว (visits ที่มี amount) ในช่วง `days` วัน
export function buildBillStats(visits, days) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  const bills = (visits ?? []).filter((v) => typeof v.amount === 'number' && new Date(v.closedAt) >= start)
  const total = bills.reduce((s, v) => s + v.amount, 0)
  const todayKey = dayKey(new Date())
  return {
    daily: buildDailySales(bills, days, (v) => v.closedAt, (v) => v.amount),
    count: bills.length,
    total,
    avg: bills.length ? total / bills.length : 0,
    todayTotal: bills.filter((v) => dayKey(v.closedAt) === todayKey).reduce((s, v) => s + v.amount, 0),
  }
}

// เมนูยอดฮิต เรียงตามจำนวนที่สั่งรวม (qty)
export function buildTopMenus(orders, limit = 5) {
  const map = new Map()
  for (const o of orders) {
    for (const it of o.items ?? []) {
      const cur = map.get(it.menuId) ?? { menuId: it.menuId, name: it.name, qty: 0, revenue: 0 }
      cur.qty += Number(it.qty) || 0
      cur.revenue += (Number(it.price) || 0) * (Number(it.qty) || 0)
      map.set(it.menuId, cur)
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit)
}

// กรองออเดอร์ให้อยู่ในช่วง `days` วันล่าสุด
export function ordersInRange(orders, days) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return orders.filter((o) => new Date(o.createdAt) >= start)
}

// สถิติจำนวนลูกค้าต่อโต๊ะ: นับจากโต๊ะที่เคลียร์แล้ว (visits) ในช่วง `days` วัน + โต๊ะที่กำลังใช้งานอยู่ตอนนี้
export function buildPartySizes(visits, tables, days) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  const sizes = (visits ?? [])
    .filter((v) => new Date(v.closedAt) >= start)
    .map((v) => Number(v.guests) || 0)
  for (const t of tables ?? []) {
    if (t.status !== 'available' && Number(t.guests) > 0) sizes.push(Number(t.guests))
  }

  const valid = sizes.filter((n) => n > 0)
  const count = new Map()
  for (const n of valid) count.set(n, (count.get(n) ?? 0) + 1)

  const rows = [...count.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([size, c]) => ({ size, count: c, pct: (c / valid.length) * 100 }))

  // ขนาดโต๊ะที่พบบ่อยสุด (ถ้าเท่ากัน เลือกโต๊ะที่คนน้อยกว่า)
  const top = rows.reduce((best, r) => (!best || r.count > best.count ? r : best), null)
  const totalGuests = valid.reduce((s, n) => s + n, 0)

  return {
    rows,
    top,
    tableCount: valid.length,
    totalGuests,
    avg: valid.length ? totalGuests / valid.length : 0,
  }
}

export const baht = (n) => `฿${Math.round(n).toLocaleString('th-TH')}`
