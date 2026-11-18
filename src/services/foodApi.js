const BASE = 'https://free-food-menus-api-two.vercel.app'

async function getJson(path, signal) {
  const res = await fetch(`${BASE}${path}`, { signal })
  if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`)
  return res.json()
}

export const fetchBestFoods = (signal) => getJson('/best-foods', signal)
