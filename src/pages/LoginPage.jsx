import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { login, ROLE_LABEL } from '../services/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const role = params.get('role') === 'admin' ? 'admin' : 'staff'
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!login(role, password)) {
      setError('รหัสผ่านไม่ถูกต้อง')
      setPassword('')
      return
    }
    navigate(location.state?.from ?? (role === 'admin' ? '/admin' : '/staff'), { replace: true })
  }

  return (
    <main className="cloth">
      <form className="slip" onSubmit={submit}>
        <Link to="/" className="back-link">← กลับหน้าเลือกบทบาท</Link>
        <header className="slip-head">
          <p className="shop">เข้าสู่ระบบ</p>
          <h1>{ROLE_LABEL[role]}</h1>
        </header>

        <div className="password-field">
          <label htmlFor="password">รหัสผ่าน</label>
          <div className="password-input-row">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="กรอกรหัสผ่าน"
              autoFocus
            />
            <button
              type="button"
              className="toggle-pass-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="field-error">{error}</p>}

        <button className="go" type="submit" disabled={!password.trim()}>
          เข้าสู่ระบบ
        </button>
      </form>
    </main>
  )
}