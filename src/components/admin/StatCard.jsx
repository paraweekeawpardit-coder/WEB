export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-top">
        <span className="adm-stat-label">{label}</span>
        {Icon && (
          <span className="adm-stat-icon">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>
      <strong className="adm-stat-value">{value}</strong>
      {hint && <span className="adm-stat-hint">{hint}</span>}
    </div>
  )
}
