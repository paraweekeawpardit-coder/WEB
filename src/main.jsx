import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import WelcomePage from './pages/customer/WelcomePage.jsx'
import MenuPage from './pages/customer/MenuPage.jsx'
import BillPage from './pages/customer/BillPage.jsx'
import StaffDashboardPage from './pages/staff/StaffDashboardPage.jsx'
import AdminHomePage from './pages/admin/AdminHomePage.jsx'
import AdminMenuPage from './pages/admin/AdminMenuPage.jsx'
import AdminStatsPage from './pages/admin/AdminStatsPage.jsx'
import AdminTablesPage from './pages/admin/AdminTablesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RequireRole from './components/RequireRole.jsx'

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/staff" element={<RequireRole role="staff"><StaffDashboardPage /></RequireRole>} />
        <Route path="/admin" element={<RequireRole role="admin"><AdminHomePage /></RequireRole>} />
        <Route path="/admin/menu" element={<RequireRole role="admin"><AdminMenuPage /></RequireRole>} />
        <Route path="/admin/stats" element={<RequireRole role="admin"><AdminStatsPage /></RequireRole>} />
        <Route path="/admin/tables" element={<RequireRole role="admin"><AdminTablesPage /></RequireRole>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)