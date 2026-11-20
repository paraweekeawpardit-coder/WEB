import OrderStatusBadge from './OrderStatusBadge'

export default function OrderCard({ order, onUpdateStatus, isUpdating }) {
  // แปลงเวลา ISO เป็นเวลาอ่านง่าย เช่น 14:30
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // กำหนดปุ่มและสถานะถัดไป
  const nextStep = {
    pending: { nextStatus: 'preparing', btnText: 'กำลังเตรียมอาหาร', btnClass: 'btn-accept' },
    preparing: { nextStatus: 'served', btnText: 'เสิร์ฟอาหารแล้ว', btnClass: 'btn-serve' },
    served: null,
  }[order.status]

  return (
    <div className={`order-card status-${order.status}`}>
      <div className="order-card-header">
        <div>
          <h3 className="table-title">โต๊ะ {order.tableId}</h3>
          <span className="order-time">สั่งเมื่อ {formattedTime} น.</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="order-items">
        {order.items?.map((item, idx) => (
          <li key={idx} className="order-item-row">
            <span>{item.name}</span>
            <span className="item-qty">x{item.qty}</span>
          </li>
        ))}
      </ul>

      <div className="order-card-footer">
        {nextStep && (
          <button
            className={`status-action-btn ${nextStep.btnClass}`}
            disabled={isUpdating}
            onClick={() => onUpdateStatus(order.id, nextStep.nextStatus)}
          >
            {isUpdating ? 'กำลังอัปเดต...' : nextStep.btnText}
          </button>
        )}
      </div>
    </div>
  )
}