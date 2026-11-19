import { useCallback, useMemo, useState } from 'react'
import { Plus, Search, UtensilsCrossed } from 'lucide-react'
import { api } from '../../services/api'
import usePolling from '../../hooks/usePolling'
import BackButton from '../../components/admin/BackButton'
import AdminNav from '../../components/admin/AdminNav'
import AdminMenuCard from '../../components/admin/AdminMenuCard'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import MenuForm from '../../components/admin/MenuForm'
import Toast from '../../components/admin/Toast'
import { CATEGORIES } from '../../components/customer/MenuToolBar'
import './AdminPages.css'

const STATUS_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'on', label: 'พร้อมขาย' },
  { id: 'off', label: 'ซ่อนอยู่' },
]

// 🐰 ระบบจัดการเมนูอาหาร: เพิ่ม / แก้ไขราคา-รายละเอียด-รูป / ซ่อนเมนูที่หมด / ลบเมนู
export default function AdminMenuPage() {
  const { data, error: loadError, loading, reload: load } = usePolling(() => api.getMenus(), 15000)
  const menus = useMemo(() => data ?? [], [data])
  const error = loadError?.message ?? ''
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [formMode, setFormMode] = useState(null) // null | 'add' | menu object (แก้ไข)
  const [deleting, setDeleting] = useState(null) // menu ที่รอยืนยันการลบ
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState(null)

  const closeToast = useCallback(() => setToast(null), [])
  const notify = (msg, type = 'ok') => setToast({ msg, type, id: Date.now() })

  const counts = useMemo(() => {
    const on = menus.filter((m) => m.available).length
    return { all: menus.length, on, off: menus.length - on }
  }, [menus])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return menus.filter(
      (m) =>
        (category === 'all' || m.category === category) &&
        (status === 'all' || (status === 'on' ? m.available : !m.available)) &&
        m.name.toLowerCase().includes(q),
    )
  }, [menus, search, category, status])

  const handleSave = async (values) => {
    const isAdd = formMode === 'add'
    try {
      setSaving(true)
      if (isAdd) await api.addMenu({ ...values, available: true })
      else await api.updateMenu(formMode.id, values)
      setFormMode(null)
      await load()
      notify(isAdd ? `เพิ่มเมนู "${values.name}" แล้ว` : `บันทึก "${values.name}" แล้ว`)
    } catch (e) {
      notify(`บันทึกไม่สำเร็จ: ${e.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (menu) => {
    try {
      setBusyId(menu.id)
      await api.updateMenu(menu.id, { available: !menu.available })
      await load()
      notify(menu.available ? `ซ่อน "${menu.name}" แล้ว` : `"${menu.name}" พร้อมขายแล้ว`)
    } catch (e) {
      notify(`เปลี่ยนสถานะเมนูไม่สำเร็จ: ${e.message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    const menu = deleting
    try {
      setBusyId(menu.id)
      await api.deleteMenu(menu.id)
      setDeleting(null)
      await load()
      notify(`ลบ "${menu.name}" แล้ว`)
    } catch (e) {
      notify(`ลบเมนูไม่สำเร็จ: ${e.message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="adm-bg">
      <BackButton to="/admin" />
      <div className="adm-workspace">
        <AdminNav title="จัดการเมนูอาหาร" />

        <div className="adm-toolbar">
          <label className="adm-searchbox">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="ค้นหาเมนู..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ค้นหาเมนู"
            />
          </label>
          <button type="button" className="adm-btn primary lg" onClick={() => setFormMode('add')}>
            <Plus size={18} aria-hidden="true" /> เพิ่มเมนูใหม่
          </button>
        </div>

        <div className="adm-filters">
          <div className="adm-chips" role="tablist" aria-label="หมวดหมู่">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                className={category === c.id ? 'adm-pill active' : 'adm-pill'}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="adm-seg" role="tablist" aria-label="สถานะเมนู">
            {STATUS_TABS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={status === s.id}
                className={status === s.id ? 'active' : ''}
                onClick={() => setStatus(s.id)}
              >
                {s.label} <span>{counts[s.id]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="adm-empty">กำลังโหลดเมนู...</p>}
        {error && <p className="adm-error-box">เชื่อมต่อระบบกลางไม่ได้: {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="adm-empty">
            <UtensilsCrossed size={36} strokeWidth={1.5} aria-hidden="true" />
            <p>{menus.length === 0
                ? 'ยังไม่มีเมนูในระบบ กด “เพิ่มเมนูใหม่” ได้เลย'
                : search.trim()
                  ? `ไม่พบเมนู “${search.trim()}”`
                  : 'ไม่พบเมนูในหมวดนี้'}</p>
          </div>
        )}

        <ul className="adm-grid">
          {filtered.map((m) => (
            <AdminMenuCard
              key={m.id}
              menu={m}
              busy={busyId === m.id}
              onEdit={setFormMode}
              onToggle={handleToggle}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      </div>

      {formMode && (
        <MenuForm
          key={formMode === 'add' ? 'add' : formMode.id}
          initial={formMode === 'add' ? null : formMode}
          existingNames={menus.map((m) => m.name)}
          saving={saving}
          onSubmit={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          menu={deleting}
          busy={busyId === deleting.id}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      <Toast key={toast?.id} toast={toast} onClose={closeToast} />
    </main>
  )
}
