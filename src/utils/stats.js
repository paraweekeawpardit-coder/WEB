// ฟังก์ชันคำนวณสถิติร้าน (pure function ไม่ยุ่งกับ React เพื่อให้ทดสอบง่าย)

// คีย์วันที่แบบ YYYY-MM-DD ตามเวลาเครื่อง
export const dayKey = (d) => {
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// ยอดขายรายวันย้อนหลัง `days` วัน (วันที่ไม่มีออเดอร์ = 0)
export function buildDailySales(orders, days = 7) {
  const list = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    list.push({ key: dayKey(d), date: d, total: 0, orders: 0 })
  }
  const byKey = Object.fromEntries(list.map((x) => [x.key, x]))
  for (const o of orders) {
    const row = byKey[dayKey(o.createdAt)]
    if (!row) continue
    row.total += Number(o.total) || 0
    row.orders += 1
  }
  return list
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

export const baht = (n) => `฿${Math.round(n).toLocaleString('th-TH')}`
