import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import WelcomePage from './pages/customer/WelcomePage.jsx'
import MenuPage from './pages/customer/MenuPage.jsx'
import BillPage from './pages/customer/BillPage.jsx'

const Placeholder = ({ name }) => (
  <p style={{ padding: 24 }}>หน้า {name} ยังไม่ได้ทำ</p>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/customer/welcome" element={<WelcomePage />} />
        <Route path="/customer/menu" element={<MenuPage />} />
        <Route path="/customer/bill" element={<BillPage />} />
        <Route
          path="/staff"
          element={
            <p style={{ padding: 24 }}>
              หน้าพนักงานยังไม่ได้ทำ · <Link to="/staff/tables">ตั้งค่าโต๊ะ / จำนวนคน</Link>
            </p>
          }
        />
        <Route path="/admin" element={<Placeholder name="แอดมิน" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)