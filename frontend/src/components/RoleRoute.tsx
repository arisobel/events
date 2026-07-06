import { Navigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

type Access = 'financial' | 'admin'

/**
 * Rota protegida por papel. Exige autenticação e a alçada indicada;
 * caso contrário redireciona para /events (sem acesso).
 */
export default function RoleRoute({
  access,
  children,
}: {
  access: Access
  children: React.ReactNode
}) {
  const { loading, isAuthenticated, canSeeFinancials, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const allowed = access === 'admin' ? isAdmin : canSeeFinancials
  if (!allowed) {
    return <Navigate to="/events" replace />
  }

  return <>{children}</>
}
