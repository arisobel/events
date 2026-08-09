import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LANGUAGES, isLanguage, useI18n } from '../i18n'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useI18n()
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
      setError(err.response?.data?.detail || t('login.failed'))
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
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {t('login.badge')}
                </div>
                <select
                  value={language}
                  onChange={(e) => { if (isLanguage(e.target.value)) setLanguage(e.target.value) }}
                  aria-label={t('lang.label')}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 backdrop-blur"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-slate-900">{lang.label}</option>
                  ))}
                </select>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {t('login.heroTitle')}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                {t('login.heroSubtitle')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">{t('login.card1Title')}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {t('login.card1Text')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">{t('login.card2Title')}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {t('login.card2Text')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">{t('login.card3Title')}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {t('login.card3Text')}
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
                  {t('login.kicker')}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {t('login.title')}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {t('login.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">
                    {t('login.username')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder={t('login.usernamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    {t('login.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    placeholder={t('login.passwordPlaceholder')}
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
                  {loading ? t('login.submitting') : t('login.submit')}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{t('login.devCredsTitle')}</p>
                <p className="mt-1">`admin / admin123`</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
