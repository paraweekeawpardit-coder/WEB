import { CATEGORIES } from '../components/customer/MenuToolBar'

const BASE_IDS = new Set(CATEGORIES.map((c) => c.id))

// หมวดที่แอดมินพิมพ์เพิ่มเอง = ค่า category ของเมนูที่ไม่ตรงกับหมวดมาตรฐาน (ใช้ชื่อหมวดเป็นทั้ง id และ label)
export function customCategoriesOf(menus) {
  const seen = new Set()
  const list = []
  for (const m of menus) {
    const id = m.category
    if (!id || BASE_IDS.has(id) || seen.has(id)) continue
    seen.add(id)
    list.push({ id, label: id })
  }
  return list
}

// หมวดทั้งหมดที่ใช้ได้: มาตรฐาน + ที่เพิ่มเอง
export const buildCategories = (menus) => [...CATEGORIES, ...customCategoriesOf(menus)]
