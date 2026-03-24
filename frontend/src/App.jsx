import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import DashboardPage  from './pages/DashboardPage'
import ComplaintsPage from './pages/ComplaintsPage'
import NewComplaintPage from './pages/NewComplaintPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import TrackPage      from './pages/TrackPage'
import OfficersPage   from './pages/OfficersPage'
import ReportsPage    from './pages/ReportsPage'
import HearingsPage   from './pages/HearingsPage'
import SettingsPage   from './pages/SettingsPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/track"    element={<TrackPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="complaints/new" element={<NewComplaintPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="officers" element={<ProtectedRoute roles={['admin','officer']}><OfficersPage /></ProtectedRoute>} />
        <Route path="reports"  element={<ProtectedRoute roles={['admin','officer']}><ReportsPage /></ProtectedRoute>} />
        <Route path="hearings" element={<ProtectedRoute roles={['admin','officer']}><HearingsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
