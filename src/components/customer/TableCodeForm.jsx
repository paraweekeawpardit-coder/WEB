import { useState } from 'react'
import { normalizeTable } from '../../services/tableService'

// onSubmit(code) ต้องคืน Promise ที่ throw Error(message) เมื่อเข้าโต๊ะไม่สำเร็จ
export default function TableCodeForm({ initialValue = '', onSubmit }) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = normalizeTable(value)
    if (!code) return setError('กรุณากรอกเลขโต๊ะ')
    setBusy(true)
    setError('')
    try {
      await onSubmit(code)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="table-field">
        <label htmlFor="table">โต๊ะที่</label>
        <input
          id="table"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder="A01"
          autoComplete="off"
          maxLength={6}
          aria-invalid={!!error}
          aria-describedby="table-error"
        />
      </div>
      <p id="table-error" role="alert" className="field-error">
        {error}
      </p>
      <button className="go" type="submit" disabled={busy}>
        {busy ? 'กำลังตรวจสอบโต๊ะ...' : 'เข้าสู่ระบบสั่งอาหาร'}
      </button>
    </form>
  )
}