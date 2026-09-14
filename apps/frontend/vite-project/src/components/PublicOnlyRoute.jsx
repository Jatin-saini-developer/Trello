import { Navigate, Outlet } from 'react-router-dom'

/**
 * PublicOnlyRoute — only renders children if NO token exists in localStorage.
 * If the user is already logged in, redirect them to /dashboard.
 * Used to wrap /login and /signup so authenticated users can't revisit them.
 */
function PublicOnlyRoute() {
  const token = localStorage.getItem('token')
  return token ? <Navigate to='/dashboard' replace /> : <Outlet />
}

export default PublicOnlyRoute
