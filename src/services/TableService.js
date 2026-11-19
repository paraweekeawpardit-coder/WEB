import { api } from './api'

const KEY = 'suki_table'

export const normalizeTable = (v) => (v ?? '').trim().toUpperCase()

// ตรวจโต๊ะกับระบบกลาง: คืน table object ถ้ามี, คืน null ถ้าไม่พบ (404)
// ถ้าเชื่อมต่อไม่ได้จะ throw ให้ผู้เรียกแสดง error
export async function findTable(code) {
  try {
    return await api.getTable(normalizeTable(code))
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// จำโต๊ะของลูกค้า (พนักงานเป็นคนเปิดโต๊ะและระบุจำนวนคน ลูกค้าเปิดเองไม่ได้แล้ว)
export async function openTable(table) {
  sessionStorage.setItem(KEY, table.id)
}

export const getSavedTable = () => sessionStorage.getItem(KEY)