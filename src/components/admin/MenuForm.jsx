import { useRef, useState } from 'react'
import { ImagePlus, Trash2, TriangleAlert, X } from 'lucide-react'
import { CATEGORIES } from '../customer/MenuToolBar'
import { fileToResizedDataUrl } from '../../utils/image'
import CategoryIcon from './CategoryIcon'

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.id !== 'all')
const MAX_PRICE = 99999

// ข้อความเตือนใต้ช่องที่กรอกผิด
function FieldError({ id, message }) {
  if (!message) return null
  return (
    <small id={id} className="adm-field-error" role="alert">
      <TriangleAlert size={14} aria-hidden="true" /> {message}
    </small>
  )
}

// ฟอร์มเพิ่ม/แก้ไขเมนู (ถ้ามี initial = โหมดแก้ไข) รองรับอัปโหลดรูปจากเครื่อง
export default function MenuForm({ initial, existingNames, onSubmit, onCancel, saving }) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    price: initial?.price ?? '',
    image: initial?.image ?? '',
  })
  const [errors, setErrors] = useState({}) // { name, category, price, image }
  const [processing, setProcessing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const formRef = useRef(null)

  // ตรวจทีละช่อง คืนข้อความ error หรือ '' ถ้าถูกต้อง
  const validators = {
    name: (v) => {
      const name = v.name.trim()
      if (!name) return 'กรุณากรอกชื่อเมนู'
      const dup = existingNames.some((n) => n.toLowerCase() === name.toLowerCase() && n !== initial?.name)
      return dup ? `มีเมนูชื่อ "${name}" อยู่แล้ว` : ''
    },
    category: (v) => (v.category ? '' : 'กรุณาเลือกหมวดหมู่'),
    price: (v) => {
      if (String(v.price).trim() === '') return 'กรุณากรอกราคา'
      const n = Number(v.price)
      if (Number.isNaN(n)) return 'ราคาต้องเป็นตัวเลขเท่านั้น'
      if (n < 0) return 'ราคาต้องไม่ติดลบ'
      if ((String(v.price).split('.')[1] ?? '').length > 2) return 'ทศนิยมได้ไม่เกิน 2 ตำแหน่ง'
      if (n > MAX_PRICE) return `ราคาสูงเกินไป (สูงสุด ${MAX_PRICE.toLocaleString('th-TH')} บาท)`
      return ''
    },
  }

  const setField = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' })) // พิมพ์แก้แล้วเอาข้อความเตือนของช่องนั้นออก
  }

  const checkField = (key) => setErrors((e) => ({ ...e, [key]: validators[key](values) }))

  const handleFile = async (file) => {
    if (!file) return
    try {
      setProcessing(true)
      setErrors((e) => ({ ...e, image: '' }))
      setField('image', await fileToResizedDataUrl(file))
    } catch (err) {
      setErrors((e) => ({ ...e, image: err.message }))
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {
      name: validators.name(values),
      category: validators.category(values),
      price: validators.price(values),
      image: errors.image ?? '',
    }
    setErrors(next)
    if (next.name || next.category || next.price || next.image) {
      // เลื่อนไปโฟกัสช่องแรกที่ผิด
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    onSubmit({
      name: values.name.trim(),
      category: values.category,
      price: Number(values.price),
      image: values.image,
    })
  }

  return (
    <div className="adm-modal-bg" role="dialog" aria-modal="true" aria-label="ฟอร์มเมนู">
      <form ref={formRef} className="adm-modal" onSubmit={handleSubmit} noValidate>
        <div className="adm-modal-head">
          <h2>{initial ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h2>
          <button type="button" className="adm-icon-btn" onClick={onCancel} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>

        {/* อัปโหลดรูป: คลิกเลือกไฟล์ หรือลากรูปมาวาง */}
        <div>
          <div
            className={`adm-drop${dragging ? ' dragging' : ''}${errors.image ? ' invalid' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files?.[0])
            }}
          >
            <div className="adm-drop-preview">
              {values.image ? (
                <img src={values.image} alt="ตัวอย่างรูปเมนู" />
              ) : (
                <CategoryIcon category={values.category} size={36} strokeWidth={1.5} />
              )}
            </div>
            <div className="adm-drop-text">
              <strong>รูปเมนู (ไม่บังคับ)</strong>
              <span>{processing ? 'กำลังประมวลผลรูป...' : 'คลิกเลือกไฟล์ หรือลากรูปมาวางที่นี่'}</span>
              <div className="adm-drop-actions">
                <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={processing}>
                  <ImagePlus size={16} aria-hidden="true" /> {values.image ? 'เปลี่ยนรูป' : 'เลือกรูปจากเครื่อง'}
                </button>
                {values.image && (
                  <button type="button" className="adm-btn danger" onClick={() => setField('image', '')}>
                    <Trash2 size={16} aria-hidden="true" /> ลบรูป
                  </button>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
          <FieldError id="err-image" message={errors.image} />
        </div>

        <label className={errors.name ? 'adm-field invalid' : 'adm-field'}>
          <span>
            ชื่อเมนู <em className="adm-req">*</em>
          </span>
          <input
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => checkField('name')}
            maxLength={60}
            autoFocus
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'err-name' : undefined}
          />
          <FieldError id="err-name" message={errors.name} />
        </label>

        <div className="adm-field-row">
          <label className={errors.category ? 'adm-field invalid' : 'adm-field'}>
            <span>
              หมวดหมู่ <em className="adm-req">*</em>
            </span>
            <select
              value={values.category}
              onChange={(e) => setField('category', e.target.value)}
              onBlur={() => checkField('category')}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'err-category' : undefined}
            >
              <option value="" disabled>
                กรุณาเลือกหมวดหมู่
              </option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <FieldError id="err-category" message={errors.category} />
          </label>

          <label className={errors.price ? 'adm-field invalid' : 'adm-field'}>
            <span>
              ราคา (บาท) <em className="adm-req">*</em>
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={values.price}
              onChange={(e) => setField('price', e.target.value)}
              onBlur={() => checkField('price')}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'err-price' : undefined}
            />
            <FieldError id="err-price" message={errors.price} />
          </label>
        </div>

        <div className="adm-modal-actions">
          <button type="button" className="adm-btn" onClick={onCancel} disabled={saving}>
            ยกเลิก
          </button>
          <button type="submit" className="adm-btn primary" disabled={saving || processing}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  )
}
