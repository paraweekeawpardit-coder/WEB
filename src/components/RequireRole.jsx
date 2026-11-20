import { Navigate, useLocation } from 'react-router-dom'
import { canAccess } from '../services/auth'

// ครอบ route ที่ต้องล็อกอิน ถ้ายังไม่ผ่านจะส่งไปหน้า PIN
export default function RequireRole({ role, children }) {
  const location = useLocation()
  if (!canAccess(role)) {
    return <Navigate to={`/login?role=${role}`} state={{ from: location.pathname }} replace />
  }
  return children
}