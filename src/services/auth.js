const PASSWORDS = {
  staff: import.meta.env.VITE_STAFF_PASSWORD ?? 'sTafF_Working1234',
  admin: import.meta.env.VITE_ADMIN_PASSWORD ?? 'Admin_Working1234',
}

const KEY = 'suki_auth_role'

export const ROLE_LABEL = {
  staff: 'พนักงาน',
  admin: 'ผู้จัดการ / แอดมิน',
}

export function login(role, password) {
  if (!PASSWORDS[role] || password !== PASSWORDS[role]) return false
  sessionStorage.setItem(KEY, role)
  return true
}

export function logout() {
  sessionStorage.removeItem(KEY)
}

export function getRole() {
  return sessionStorage.getItem(KEY)
}

export function canAccess(required) {
  const role = getRole()
  return role === required || role === 'admin'
}