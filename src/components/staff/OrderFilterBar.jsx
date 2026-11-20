export default function OrderFilterBar({
  tables = [],
  selectedTable,
  onSelectTable,
  searchTable,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
}) {
  const tabs = [
    { key: 'all', label: `ทั้งหมด (${counts.active ?? 0})` },
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

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          className="search-input"
          style={{ minWidth: '150px', cursor: 'pointer' }}
          value={selectedTable}
          onChange={(e) => onSelectTable(e.target.value)}
        >
          <option value="all">ทุกโต๊ะ</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              โต๊ะ {t.id}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาเลขโต๊ะ (เช่น A01)..."
          value={searchTable}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}