import { api } from './api'

const KEY = 'suki_table'

export const normalizeTable = (v) => (v ?? '').trim().toUpperCase()

export async function findTable(code) {
  try {
    return await api.getTable(normalizeTable(code))
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

export async function openTable(table) {
  if (table.status === 'available') {
    await api.updateTable(table.id, { status: 'occupied' })
  }
  sessionStorage.setItem(KEY, table.id)
}

export const getSavedTable = () => sessionStorage.getItem(KEY)