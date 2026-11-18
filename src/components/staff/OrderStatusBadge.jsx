export default function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: { label: 'รอรับออร์เดอร์', color: '#f59e0b', bg: '#fef3c7' },
    preparing: { label: 'กำลังทำ', color: '#3b82f6', bg: '#dbeafe' },
    served: { label: 'เสิร์ฟแล้ว', color: '#10b981', bg: '#d1fae5' },
  }

  const current = statusConfig[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.color,
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
      }}
    >
      {current.label}
    </span>
  )
}