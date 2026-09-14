import { Navigate, Outlet } from 'react-router-dom'

/**
 * PrivateRoute — only renders children if a token exists in localStorage.
 * Otherwise redirects the user to /login.
 */
function PrivateRoute() {
  const token = localStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to='/login' replace />
}

export default PrivateRoute
