import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import AdminLayout from '../components/AdminLayout'
import {
  Activity,
  ActivityCreate,
  ActivityType,
  Audience,
  Event,
  HotelSpace,
  eventService,
  hotelService,
  scheduleService,
} from '../services/api'

// Cores derivadas do programa impresso real de Pessach
const TYPE_META: Record<ActivityType, { label: string; chip: string; accent: string; dot: string }> = {
  religioso: { label: 'Religioso', chip: 'bg-amber-100 text-amber-900 border-amber-300', accent: 'border-l-amber-700', dot: 'bg-amber-700' },
  refeicao: { label: 'Refeição', chip: 'bg-teal-100 text-teal-900 border-teal-300', accent: 'border-l-teal-600', dot: 'bg-teal-600' },
  infantil: { label: 'Infantil', chip: 'bg-orange-100 text-orange-900 border-orange-300', accent: 'border-l-orange-500', dot: 'bg-orange-500' },
  palestra: { label: 'Palestra', chip: 'bg-yellow-50 text-yellow-900 border-yellow-300', accent: 'border-l-yellow-500', dot: 'bg-yellow-500' },
  entretenimento: { label: 'Entretenimento', chip: 'bg-sky-100 text-sky-900 border-sky-300', accent: 'border-l-sky-500', dot: 'bg-sky-500' },
  geral: { label: 'Geral', chip: 'bg-slate-100 text-slate-800 border-slate-300', accent: 'border-l-slate-400', dot: 'bg-slate-400' },
}

const TYPE_ORDER: ActivityType[] = ['religioso', 'refeicao', 'infantil', 'palestra', 'entretenimento', 'geral']

const AUDIENCE_META: Record<Audience, string> = {
  all: 'Todos',
  men: 'Homens',
  women: 'Mulheres',
  children: 'Crianças',
  youth: 'Jovens',
}

const emptyForm = (date: string): ActivityCreate => ({
  f_title: '',
  f_activity_type: 'geral',
  f_audience: 'all',
  f_space_id: null,
  f_location: '',
  f_date: date,
  f_start_time: '',
  f_end_time: '',
  f_description: '',
})

// Gera a lista de dias (YYYY-MM-DD) entre start e end, inclusive — sem depender de fuso
const buildDays = (start: string, end: string): string[] => {
  const days: string[] = []
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const cursor = new Date(sy, sm - 1, sd)
  const last = new Date(ey, em - 1, ed)
  let guard = 0
  while (cursor <= last && guard < 400) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    days.push(`${y}-${m}-${d}`)
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return days
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const formatDayLabel = (dayKey: string) => {
  const [y, m, d] = dayKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return { weekday: WEEKDAYS[date.getDay()], daymonth: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}` }
}

export default function SchedulePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<Event | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [spaces, setSpaces] = useState<HotelSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [selectedDay, setSelectedDay] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ActivityCreate>(emptyForm(''))

  const days = useMemo(
    () => (event ? buildDays(event.f_start_date, event.f_end_date) : []),
    [event],
  )

  useEffect(() => {
    if (eventId) {
      void load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const [ev, acts] = await Promise.all([
        eventService.getEvent(Number(eventId)),
        scheduleService.getActivities(Number(eventId)),
      ])
      setEvent(ev)
      setActivities(acts)
      try {
        setSpaces(await hotelService.getHotelSpaces(ev.f_hotel_id))
      } catch {
        // espaços são opcionais — sem eles o form cai no texto livre
      }
      // seleciona o primeiro dia com atividade, senão o primeiro dia do evento
      const evDays = buildDays(ev.f_start_date, ev.f_end_date)
      const firstWithActivity = evDays.find((d) => acts.some((a) => a.f_date === d))
      setSelectedDay((current) => current || firstWithActivity || evDays[0] || '')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao carregar o cronograma')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm(selectedDay))
    setShowForm(true)
  }

  const openEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setForm({
      f_title: activity.f_title,
      f_activity_type: activity.f_activity_type,
      f_audience: activity.f_audience,
      f_space_id: activity.f_space_id ?? null,
      f_location: activity.f_location ?? '',
      f_date: activity.f_date,
      f_start_time: activity.f_start_time,
      f_end_time: activity.f_end_time ?? '',
      f_description: activity.f_description ?? '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.f_title.trim()) {
      setError('Título é obrigatório')
      return
    }
    if (!form.f_start_time) {
      setError('Horário de início é obrigatório')
      return
    }
    try {
      setSaving(true)
      setError('')
      const payload: ActivityCreate = {
        ...form,
        // com espaço estruturado escolhido, o texto livre é limpo (evita informação dupla/estale)
        f_location: form.f_space_id != null ? null : form.f_location?.trim() || null,
        f_end_time: form.f_end_time || null,
        f_description: form.f_description?.trim() || null,
      }
      if (editingId) {
        await scheduleService.updateActivity(editingId, payload)
      } else {
        await scheduleService.createActivity(Number(eventId), payload)
      }
      setSelectedDay(form.f_date)
      closeForm()
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao salvar a atividade')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (activity: Activity) => {
    if (!window.confirm(`Excluir "${activity.f_title}"?`)) return
    try {
      setError('')
      await scheduleService.deleteActivity(activity.id)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao excluir a atividade')
    }
  }

  const dayActivities = useMemo(() => {
    return activities
      .filter((a) => a.f_date === selectedDay)
      .filter((a) => typeFilter === 'all' || a.f_activity_type === typeFilter)
      .sort((a, b) =>
        a.f_start_time.localeCompare(b.f_start_time) ||
        a.f_sort_order - b.f_sort_order ||
        a.id - b.id,
      )
  }, [activities, selectedDay, typeFilter])

  const countForDay = (dayKey: string) => activities.filter((a) => a.f_date === dayKey).length

  // Conflito de espaço (warning não-bloqueante): mesmo espaço estruturado + horários sobrepostos
  // no mesmo dia. Atividade sem fim conta como pontual (fim = início). Considera o dia inteiro,
  // ignorando o filtro de tipo, para o aviso não sumir ao filtrar.
  const conflictIds = useMemo(() => {
    const dayActs = activities.filter((a) => a.f_date === selectedDay && a.f_space_id != null)
    const ids = new Set<number>()
    for (let i = 0; i < dayActs.length; i += 1) {
      for (let j = i + 1; j < dayActs.length; j += 1) {
        const a = dayActs[i]
        const b = dayActs[j]
        if (a.f_space_id !== b.f_space_id) continue
        const aEnd = a.f_end_time || a.f_start_time
        const bEnd = b.f_end_time || b.f_start_time
        if (a.f_start_time <= bEnd && b.f_start_time <= aEnd) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
    return ids
  }, [activities, selectedDay])

  return (
    <AdminLayout title="Cronograma">
      <div className="max-w-5xl mx-auto">
        {/* Sub-navegação do evento */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/events')}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50"
            >
              ← Events
            </button>
            {event && <span className="hidden sm:inline text-slate-500 truncate max-w-[16rem]">{event.f_name}</span>}
            <button
              onClick={() => navigate(`/events/${eventId}/guests`)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              Guests
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/rooms`)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700"
            >
              Rooms
            </button>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Nova atividade
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulário criar/editar */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar atividade' : 'Nova atividade'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.f_title}
                  onChange={(e) => setForm({ ...form, f_title: e.target.value })}
                  placeholder="Ex.: Shacharit, Almoço, Palestra, Mincha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.f_activity_type}
                    onChange={(e) => setForm({ ...form, f_activity_type: e.target.value as ActivityType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_ORDER.map((t) => (
                      <option key={t} value={t}>{TYPE_META[t].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Público</label>
                  <select
                    value={form.f_audience}
                    onChange={(e) => setForm({ ...form, f_audience: e.target.value as Audience })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(Object.keys(AUDIENCE_META) as Audience[]).map((a) => (
                      <option key={a} value={a}>{AUDIENCE_META[a]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
                  <input
                    type="date"
                    value={form.f_date}
                    min={event?.f_start_date}
                    max={event?.f_end_date}
                    onChange={(e) => setForm({ ...form, f_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                  <input
                    type="time"
                    value={form.f_start_time}
                    onChange={(e) => setForm({ ...form, f_start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                  <input
                    type="time"
                    value={form.f_end_time ?? ''}
                    onChange={(e) => setForm({ ...form, f_end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espaço</label>
                  <select
                    value={form.f_space_id ?? ''}
                    onChange={(e) => setForm({ ...form, f_space_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— texto livre —</option>
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>{s.f_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.f_space_id == null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local (texto livre)</label>
                  <input
                    type="text"
                    value={form.f_location ?? ''}
                    onChange={(e) => setForm({ ...form, f_location: e.target.value })}
                    placeholder="Ex.: Sinagoga — prefira cadastrar o espaço no hotel e selecioná-lo acima"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea
                  value={form.f_description ?? ''}
                  onChange={(e) => setForm({ ...form, f_description: e.target.value })}
                  rows={2}
                  placeholder="Ex.: idioma, nusach (Sefaradi/Ashkenazi), 'caso chova, na Sinagoga'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar atividade'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="text-center text-gray-600 py-12">Carregando cronograma...</div>}

        {!loading && event && (
          <>
            {/* Abas de dias (colunas do programa) */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
              {days.map((dayKey) => {
                const { weekday, daymonth } = formatDayLabel(dayKey)
                const count = countForDay(dayKey)
                const active = dayKey === selectedDay
                return (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDay(dayKey)}
                    className={`shrink-0 w-16 py-2 rounded-lg border text-center transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wide opacity-80">{weekday}</div>
                    <div className="text-sm font-semibold">{daymonth}</div>
                    <div className={`text-[10px] mt-0.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      {count > 0 ? `${count} ativ.` : '—'}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Filtro por tipo */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  typeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                }`}
              >
                Todos
              </button>
              {TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 ${
                    typeFilter === t ? TYPE_META[t].chip : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${TYPE_META[t].dot}`} />
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>

            {/* Lista de atividades do dia */}
            {dayActivities.length === 0 ? (
              <div className="text-center text-gray-500 bg-white rounded-lg shadow p-10">
                <p className="mb-1">Nenhuma atividade neste dia.</p>
                <button onClick={openCreate} className="text-blue-600 hover:text-blue-800 text-sm">
                  + Adicionar a primeira
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dayActivities.map((activity) => {
                  const meta = TYPE_META[activity.f_activity_type]
                  return (
                    <div
                      key={activity.id}
                      className={`bg-white rounded-lg shadow-sm border border-slate-100 border-l-4 ${meta.accent} p-4 flex items-start gap-4`}
                    >
                      <div className="shrink-0 text-right w-16">
                        <div className="text-sm font-bold text-slate-900">{activity.f_start_time}</div>
                        {activity.f_end_time && (
                          <div className="text-[11px] text-slate-400">→ {activity.f_end_time}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">{activity.f_title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.chip}`}>
                            {meta.label}
                          </span>
                          {activity.f_audience !== 'all' && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {AUDIENCE_META[activity.f_audience]}
                            </span>
                          )}
                          {conflictIds.has(activity.id) && (
                            <span
                              title="Outra atividade usa o mesmo espaço em horário sobreposto neste dia"
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300"
                            >
                              ⚠ Conflito de espaço
                            </span>
                          )}
                        </div>
                        {(activity.space_name || activity.f_location) && (
                          <div className="text-sm text-slate-500 mt-0.5">
                            📍 {activity.space_name || activity.f_location}
                          </div>
                        )}
                        {activity.f_description && (
                          <div className="text-sm text-slate-600 mt-1">{activity.f_description}</div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          onClick={() => openEdit(activity)}
                          title="Editar"
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(activity)}
                          title="Excluir"
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
