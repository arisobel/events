import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, User } from '../services/api'
import { isLanguage, useI18n } from '../i18n'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  isAdmin: boolean
  canSeeFinancials: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setLanguage } = useI18n()

  // Preferência salva no usuário vence a detecção local (cross-device)
  const applyUserLanguage = (currentUser: User) => {
    if (isLanguage(currentUser.f_language)) {
      setLanguage(currentUser.f_language)
    }
  }

  useEffect(() => {
    // Verificar se há token e carregar usuário
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          applyUserLanguage(currentUser)
        } catch (error) {
          console.error('Failed to load user:', error)
          authService.logout()
        }
      }
      setLoading(false)
    }

    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (username: string, password: string) => {
    await authService.login({ username, password })
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    applyUserLanguage(currentUser)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const hasRole = (role: string) => Boolean(user?.roles?.includes(role))
  const isAdmin = hasRole('admin')
  const canSeeFinancials = isAdmin || hasRole('gestor_financeiro')

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        isAdmin,
        canSeeFinancials,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
