// client กลางสำหรับคุยกับ json-server (ทุกหน้าใช้ไฟล์นี้ไฟล์เดียว)
// ถ้าเปิดจากเครื่องอื่นในวง LAN ให้ตั้ง VITE_API_URL=http://<IP เครื่อง>:3001 ใน .env
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = new Error(`เรียก API ไม่สำเร็จ (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  // เมนู
  getMenus: () => request('/menus'),
  addMenu: (m) => request('/menus', { method: 'POST', body: JSON.stringify(m) }),
  updateMenu: (id, patch) => request(`/menus/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteMenu: (id) => request(`/menus/${id}`, { method: 'DELETE' }),

  // โต๊ะ
  getTables: () => request('/tables'),
  getTable: (id) => request(`/tables/${id}`),
  updateTable: (id, patch) => request(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  // ออเดอร์
  getOrders: () => request('/orders?_sort=createdAt&_order=desc'),
  // ซ่อนออเดอร์ที่ชำระแล้ว (paid) ตอนแอดมินเคลียร์โต๊ะ เพื่อให้ลูกค้ารอบใหม่เริ่มจากบิลว่าง
  // (ยังเก็บ paid ไว้ใน db เพื่อใช้คำนวณสถิติ จึงกรองฝั่ง client)
  getOrdersByTable: async (tableId) => {
    const list = await request(`/orders?tableId=${tableId}&_sort=createdAt&_order=desc`)
    return list.filter((o) => o.status !== 'paid')
  },
  createOrder: ({ tableId, items }) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        tableId,
        items, // [{ menuId, name, price, qty }]
        total: items.reduce((s, i) => s + i.price * i.qty, 0),
        status: 'pending', // pending -> preparing -> served
        createdAt: new Date().toISOString(),
      }),
    }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // เรียกพนักงาน / ขอเช็กบิล
  getServiceCalls: () => request('/serviceCalls?done=false'),
  getServiceCallsByTable: (tableId) => request(`/serviceCalls?tableId=${tableId}&done=false`),
  updateServiceCall: (id, patch) =>
    request(`/serviceCalls/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  createServiceCall: (tableId, type) =>
    request('/serviceCalls', {
      method: 'POST',
      body: JSON.stringify({ tableId, type, done: false, createdAt: new Date().toISOString() }),
    }),
}