import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import SignUp from './pages/SignUp'
import LoginPage from './pages/LoginPage'
import CreateOrgPage from './pages/CreateOrgPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'

import PrivateRoute from './components/PrivateRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'

function App() {
  return (
    <Routes>
      {/* Default: redirect / to /login */}
      <Route path='/' element={<Navigate to='/login' replace />} />

      {/* Public-only routes: redirect to /dashboard if already logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUp />} />
      </Route>

      {/* Protected routes: redirect to /login if not logged in */}
      <Route element={<PrivateRoute />}>
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/createOrg' element={<CreateOrgPage />} />
        <Route path='/org/:orgId/board/:boardId' element={<BoardPage />} />
      </Route>
    </Routes>
  )
}

export default App
