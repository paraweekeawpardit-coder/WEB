import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ปุ่มย้อนกลับ วางบนพื้นแดงนอกกรอบขาว (สีขาวให้อ่านง่าย)
export default function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <div className="adm-backrow">
      <button type="button" className="adm-back-white" onClick={() => navigate(to)}>
        <ArrowLeft size={18} aria-hidden="true" /> ย้อนกลับ
      </button>
    </div>
  )
}
