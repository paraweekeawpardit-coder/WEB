import { Copy, ExternalLink, QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function TableQrModal({ table, onClose, onNotify }) {
  const menuUrl = `${window.location.origin}/customer/menu?table=${encodeURIComponent(table.id)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      onNotify?.(`คัดลอกลิงก์โต๊ะ ${table.id} แล้ว`)
    } catch {
      onNotify?.('คัดลอกลิงก์ไม่สำเร็จ', 'error')
    }
  }

  return (
    <div
      className="adm-modal-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`QR Code โต๊ะ ${table.id}`}
    >
      <div className="adm-modal" style={{ maxWidth: 430, textAlign: 'center' }}>
        <div className="adm-modal-head">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={20} aria-hidden="true" /> QR Code สั่งอาหาร
          </h2>
          <button
            type="button"
            className="adm-icon-btn"
            onClick={onClose}
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="tbl-order-box"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            padding: '20px 16px',
          }}
        >
          <div>
            <span className="tbl-zone">โซน {table.zone}</span>
            <h3 style={{ margin: '4px 0', fontSize: '1.5rem' }}>โต๊ะ {table.id}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.75 }}>
              {table.guests} คน · {table.isBuffet ? 'บุฟเฟ่ต์' : 'อาลาคาร์ต'}
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
            }}
          >
            <QRCodeSVG value={menuUrl} size={190} level="M" />
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
            สแกน QR Code เพื่อเปิดเมนูและสั่งอาหารของโต๊ะ {table.id}
          </p>

          <code
            title={menuUrl}
            style={{
              display: 'block',
              maxWidth: '100%',
              fontSize: '0.72rem',
              background: 'rgba(0,0,0,0.05)',
              padding: '7px 12px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {menuUrl}
          </code>
        </div>

        <div className="adm-modal-actions" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="adm-btn" onClick={handleCopyLink}>
            <Copy size={15} aria-hidden="true" /> คัดลอกลิงก์
          </button>
          <a
            href={menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn primary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={15} aria-hidden="true" /> เปิดหน้าเมนู (จำลองสแกน)
          </a>
        </div>
      </div>
    </div>
  )
}