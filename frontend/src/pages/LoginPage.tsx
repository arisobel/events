import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden px-6 py-12 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)]" />
          <div className="relative flex h-full max-w-2xl flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Internal Admin Workspace
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Event Operations Platform
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Coordinate hospitality events by hotel, event cycle, guest groups, reservations,
                room allocations, and operational tasks from one admin surface.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Hotels</p>
                <p className="mt-2 text-sm text-slate-300">
                  Prepare infrastructure, rooms, and base setup.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Events</p>
                <p className="mt-2 text-sm text-slate-300">
                  Run operations by season and period, like Pessach 2027.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Execution</p>
                <p className="mt-2 text-sm text-slate-300">
                  Manage reservations, room allocation, and event tasks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10">
              <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-600">
                  Admin Login
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  Access the operations hub
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Sign in to manage hotels, event operations, guests, reservations, rooms, and tasks.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter your password"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Logging in...' : 'Enter Admin Area'}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Default development credentials</p>
                <p className="mt-1">`admin / admin123`</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
