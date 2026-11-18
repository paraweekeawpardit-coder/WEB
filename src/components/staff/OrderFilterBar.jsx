export default function OrderFilterBar({ searchTable, onSearchChange, statusFilter, onStatusChange, counts }) {
  const tabs = [
    { key: 'all', label: `ทั้งหมด (${counts.all})` },
    { key: 'pending', label: `รอครัวรับออเดอร์ (${counts.pending})` },
    { key: 'preparing', label: `กำลังเตรียมอาหาร (${counts.preparing})` },
    { key: 'served', label: `เสิร์ฟแล้ว (${counts.served})` },
  ]

  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => onStatusChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="ค้นหาเลขโต๊ะ (เช่น A01)..."
        value={searchTable}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}