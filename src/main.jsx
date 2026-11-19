import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import WelcomePage from './pages/customer/WelcomePage.jsx'
import MenuPage from './pages/customer/MenuPage.jsx'
import BillPage from './pages/customer/BillPage.jsx'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'
import AdminHomePage from './pages/admin/AdminHomePage.jsx'
import AdminMenuPage from './pages/admin/AdminMenuPage.jsx'
import AdminStatsPage from './pages/admin/AdminStatsPage.jsx'
import AdminTablesPage from './pages/admin/AdminTablesPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/customer/welcome" element={<WelcomePage />} />
        <Route path="/customer/menu" element={<MenuPage />} />
        <Route path="/customer/bill" element={<BillPage />} />
        <Route
          path="/staff/StaffDashboardPage"
          element={
            <p style={{ padding: 24 }}>
              หน้าพนักงานยังไม่ได้ทำ · <Link to="/staff/tables">ตั้งค่าโต๊ะ / จำนวนคน</Link>
            </p>
          }
        />
        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/stats" element={<AdminStatsPage />} />
        <Route path="/admin/tables" element={<AdminTablesPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)