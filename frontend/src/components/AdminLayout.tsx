import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

interface IconProps {
  className?: string
}

const navLinks = [
  { label: 'Hotels', path: '/hotels', icon: HotelIcon },
  { label: 'Events', path: '/events', icon: CalendarDaysIcon },
]

function HotelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 20V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13" />
      <path d="M16 10h2a2 2 0 0 1 2 2v8" />
      <path d="M8 9h2" />
      <path d="M8 13h2" />
      <path d="M12 9h2" />
      <path d="M12 13h2" />
      <path d="M10 20v-3h4v3" />
      <path d="M3 20h18" />
    </svg>
  )
}

function CalendarDaysIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M8 3v3" />
      <path d="M16 3v3" />
      <path d="M4 9h16" />
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 13h3" />
      <path d="M13 13h3" />
      <path d="M8 17h3" />
    </svg>
  )
}

function LogOutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const initials = user?.f_username
    ? user.f_username.slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="h-full flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-tight">Event Operations</h1>
          <p className="text-xs text-slate-400 mt-1">Platform v1.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-auto">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <a
              key={path}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate(path) }}
              className={['sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm', isActive(path) ? 'active' : ''].filter(Boolean).join(' ')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </a>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.f_username}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <span className="text-sm text-slate-500">{user?.f_username}</span>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-2 flex-shrink-0">
          <p className="text-xs text-slate-400">© 2025 Event Operations Platform</p>
        </footer>
      </div>
    </div>
  )
}
