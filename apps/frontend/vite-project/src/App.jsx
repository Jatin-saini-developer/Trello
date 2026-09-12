import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import SignUp from './pages/SignUp';
import LoginPage from './pages/LoginPage';
import CreateOrgPage from './pages/CreateOrgPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/dashboard' replace />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/create-org' element={<CreateOrgPage />} />
      <Route path='/dashboard' element={<DashboardPage />} />
    </Routes>
  )
}

export default App
