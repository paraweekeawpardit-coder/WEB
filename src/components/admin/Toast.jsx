import { useEffect } from 'react'
import { CircleCheck, TriangleAlert } from 'lucide-react'

// ข้อความแจ้งผลสั้น ๆ มุมล่างจอ หายเองใน 2.8 วินาที
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const Icon = toast.type === 'error' ? TriangleAlert : CircleCheck
  return (
    <div className={`adm-toast ${toast.type}`} role="status">
      <Icon size={18} aria-hidden="true" /> {toast.msg}
    </div>
  )
}
