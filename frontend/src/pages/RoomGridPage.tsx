import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  FinancialSummary,
  GuestGroup,
  RoomAllocationCreate,
  RoomAllocationUpdate,
  RoomGrid,
  RoomGridAllocation,
  RoomGridRoom,
  financeService,
  guestGroupService,
  roomAllocationService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'

// ---- date helpers (YYYY-MM-DD strings, local time) ----

const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const toISO = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const formatMoney = (value: string | number | null | undefined): string => {
  const num = Number(value ?? 0)
  return (Number.isNaN(num) ? 0 : num).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

const paymentStyles: Record<string, string> = {
  paid: 'bg-emerald-500 text-white hover:bg-emerald-600',
  partial: 'bg-amber-400 text-amber-950 hover:bg-amber-500',
  pending: 'bg-rose-500 text-white hover:bg-rose-600',
}

const paymentLabels: Record<string, string> = {
  paid: 'Pago',
  partial: 'Parcial',
  pending: 'Pendente',
}

type CellSegment =
  | { kind: 'free'; dayIndex: number }
  | { kind: 'alloc'; allocation: RoomGridAllocation; startIndex: number; endIndex: number }

type Selection =
  | { kind: 'alloc'; room: RoomGridRoom; allocation: RoomGridAllocation }
  | { kind: 'create'; room: RoomGridRoom; date: string }
  | { kind: 'room'; room: RoomGridRoom }

export default function RoomGridPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [grid, setGrid] = useState<RoomGrid | null>(null)
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [groups, setGroups] = useState<GuestGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [editForm, setEditForm] = useState<RoomAllocationUpdate>({})
  const [createForm, setCreateForm] = useState<RoomAllocationCreate>({
    f_reservation_id: 0,
    f_room_id: 0,
    f_start_date: '',
    f_end_date: '',
    f_notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [eventPriceInput, setEventPriceInput] = useState('')
  const [showStatsMobile, setShowStatsMobile] = useState(false)

  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [gridData, summaryData, groupsData] = await Promise.all([
        financeService.getRoomGrid(Number(eventId)),
        financeService.getFinancialSummary(Number(eventId)),
        guestGroupService.getGroups(Number(eventId)),
      ])
      setGrid(gridData)
      setSummary(summaryData)
      setGroups(groupsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load room grid')
    } finally {
      setLoading(false)
    }
  }

  const reservations = useMemo(
    () =>
      groups.flatMap((group) =>
        group.reservations.map((reservation) => ({
          ...reservation,
          groupName: group.f_name,
        }))
      ),
    [groups]
  )

  // Colunas = noites do evento (dia de checkout não gera coluna)
  const days = useMemo(() => {
    if (!grid) return []
    const start = parseDate(grid.f_start_date)
    const end = parseDate(grid.f_end_date)
    const result: Date[] = []
    for (let d = start; d < end; d = addDays(d, 1)) {
      result.push(d)
    }
    if (result.length === 0) result.push(start)
    return result
  }, [grid])

  const dayISOs = useMemo(() => days.map(toISO), [days])
  const todayISO = toISO(new Date())
  const todayIndex = dayISOs.indexOf(todayISO)

  const segmentsByRoom = useMemo<Record<number, CellSegment[]>>(() => {
    if (!grid) return {}
    const map: Record<number, CellSegment[]> = {}
    for (const room of grid.rooms) {
      const segments: CellSegment[] = []
      let dayIndex = 0
      const sorted = [...room.allocations].sort((a, b) => a.f_start_date.localeCompare(b.f_start_date))
      for (const allocation of sorted) {
        // barra cobre as noites: start até end-1, recortada na janela do evento
        let startIndex = dayISOs.findIndex((iso) => iso >= allocation.f_start_date)
        if (startIndex === -1) continue
        const lastNightISO = toISO(addDays(parseDate(allocation.f_end_date), -1))
        if (lastNightISO < dayISOs[0] && allocation.f_start_date < dayISOs[0]) continue
        let endIndex = dayISOs.length - 1
        while (endIndex >= 0 && dayISOs[endIndex] > lastNightISO) endIndex -= 1
        if (endIndex < startIndex) endIndex = startIndex
        if (startIndex < dayIndex) startIndex = dayIndex
        for (; dayIndex < startIndex; dayIndex += 1) {
          segments.push({ kind: 'free', dayIndex })
        }
        segments.push({ kind: 'alloc', allocation, startIndex, endIndex })
        dayIndex = endIndex + 1
      }
      for (; dayIndex < dayISOs.length; dayIndex += 1) {
        segments.push({ kind: 'free', dayIndex })
      }
      map[room.room_id] = segments
    }
    return map
  }, [grid, dayISOs])

  // No mobile a coluna do quarto mostra só o número (72px); no desktop expande para exibir tipo/capacidade/preço (200px)
  const gridTemplate = `var(--room-col-width, 200px) repeat(${days.length}, minmax(42px, 1fr))`

  // ---- selection handlers ----

  const openAllocation = (room: RoomGridRoom, allocation: RoomGridAllocation) => {
    setSelection({ kind: 'alloc', room, allocation })
    setEditForm({
      f_room_id: room.room_id,
      f_start_date: allocation.f_start_date,
      f_end_date: allocation.f_end_date,
      f_checkin_status: allocation.f_checkin_status,
    })
    setError('')
  }

  const openCreate = (room: RoomGridRoom, date: string) => {
    setSelection({ kind: 'create', room, date })
    setCreateForm({
      f_reservation_id: reservations[0]?.id || 0,
      f_room_id: room.room_id,
      f_start_date: date,
      f_end_date: grid?.f_end_date || date,
      f_notes: '',
    })
    setError('')
  }

  const openRoomPrice = (room: RoomGridRoom) => {
    setSelection({ kind: 'room', room })
    setEventPriceInput(
      room.f_has_event_price && room.f_price_per_night != null
        ? String(room.f_price_per_night)
        : ''
    )
    setError('')
  }

  const closePanel = () => {
    setSelection(null)
    setEditForm({})
  }

  const handleSaveEventPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selection?.kind !== 'room' || eventPriceInput === '') return
    try {
      setSaving(true)
      setError('')
      await financeService.setEventRoomPrice(Number(eventId), selection.room.room_id, eventPriceInput)
      closePanel()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set event price')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveEventPrice = async () => {
    if (selection?.kind !== 'room') return
    try {
      setSaving(true)
      setError('')
      await financeService.deleteEventRoomPrice(Number(eventId), selection.room.room_id)
      closePanel()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove event price')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAllocation = async () => {
    if (selection?.kind !== 'alloc') return
    try {
      setSaving(true)
      setError('')
      await roomAllocationService.updateAllocation(selection.allocation.allocation_id, editForm)
      closePanel()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update allocation')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.f_reservation_id || !createForm.f_room_id) {
      setError('Select a reservation')
      return
    }
    try {
      setSaving(true)
      setError('')
      await roomAllocationService.createAllocation({
        ...createForm,
        f_notes: createForm.f_notes || undefined,
      })
      closePanel()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create allocation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Room Grid">
      <div className="max-w-full mx-auto">
        {/* Navigation + summary */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/events')}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 whitespace-nowrap"
            >
              ← Events
            </button>
            {grid && <span className="font-semibold text-slate-800 truncate">{grid.event_name}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => navigate(`/events/${eventId}/rooms`)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700"
            >
              Allocations
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/guests`)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              Guests
            </button>
            <button
              onClick={loadData}
              className="bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-black md:ml-auto"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {summary && (
          <>
            {/* Toggle do resumo — só no mobile; no desktop os cards ficam sempre visíveis */}
            <button
              onClick={() => setShowStatsMobile((current) => !current)}
              className="md:hidden w-full flex items-center justify-between bg-white rounded-lg shadow px-4 py-3 mb-3 text-sm font-medium text-slate-700"
            >
              <span>
                Resumo financeiro · {summary.occupancy_rate}% ocupação
              </span>
              <span className="text-slate-400">{showStatsMobile ? '▲ ocultar' : '▼ detalhes'}</span>
            </button>

            <div className={`${showStatsMobile ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-4 gap-3 mb-4`}>
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <p className="text-xs text-slate-500">Ocupação</p>
                <p className="text-xl font-semibold text-slate-900">{summary.occupancy_rate}%</p>
                <p className="text-xs text-slate-500">
                  {summary.allocated_room_nights} de {summary.total_rooms * summary.event_nights} noites·quarto
                </p>
              </div>
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <p className="text-xs text-slate-500">Receita esperada</p>
                <p className="text-xl font-semibold text-slate-900">{formatMoney(summary.expected_revenue)}</p>
                {Number(summary.expected_revenue) > Number(summary.contracted_revenue) ? (
                  <p className="text-xs text-violet-600">
                    inclui potencial · {formatMoney(summary.contracted_revenue)} negociado
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">{summary.reservation_count} reservas</p>
                )}
              </div>
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <p className="text-xs text-slate-500">Recebido</p>
                <p className="text-xl font-semibold text-emerald-700">{formatMoney(summary.received_amount)}</p>
                <p className="text-xs text-slate-500">{summary.reservations_by_payment_status['paid'] || 0} reservas quitadas</p>
              </div>
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <p className="text-xs text-slate-500">Pendente</p>
                <p className="text-xl font-semibold text-rose-700">{formatMoney(summary.pending_amount)}</p>
                <p className="text-xs text-slate-500">
                  {(summary.reservations_by_payment_status['pending'] || 0) + (summary.reservations_by_payment_status['partial'] || 0)} reservas em aberto
                </p>
              </div>
            </div>
          </>
        )}

        {/* Legend — rola horizontalmente numa linha no mobile; quebra livre no desktop */}
        <div className="flex md:flex-wrap items-center gap-3 md:gap-4 text-xs text-slate-600 mb-3 overflow-x-auto whitespace-nowrap pb-1">
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-block w-3 h-3 rounded bg-emerald-500" /> Pago
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-block w-3 h-3 rounded bg-amber-400" /> Parcial
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-block w-3 h-3 rounded bg-rose-500" /> Pendente
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="inline-block w-3 h-3 rounded border border-slate-300 bg-white" /> Livre
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">✓ check-in · célula = 1 noite · * preço do evento</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && <div className="text-center text-gray-600 py-12">Loading room grid...</div>}

        {!loading && grid && grid.rooms.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">No rooms found for this event's hotel.</p>
            <p className="text-sm mt-2">Add rooms on the Hotels page first.</p>
          </div>
        )}

        {!loading && grid && grid.rooms.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-auto max-h-[70vh]">
            <div className="min-w-max [--room-col-width:64px] md:[--room-col-width:200px]">
              {/* Header row (sticky top ao rolar verticalmente) */}
              <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="sticky left-0 top-0 z-40 bg-slate-50 px-2 md:px-3 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200">
                  Quarto
                </div>
                {days.map((day, index) => (
                  <div
                    key={dayISOs[index]}
                    className={`sticky top-0 z-30 px-1 py-2 text-center text-xs border-r border-slate-100 ${
                      index === todayIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</div>
                    <div className="font-medium">
                      {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    {index === todayIndex && <div className="text-[10px]">HOJE</div>}
                  </div>
                ))}
              </div>

              {/* Room rows */}
              {grid.rooms.map((room) => (
                <div
                  key={room.room_id}
                  className="grid border-b border-slate-100 items-stretch"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <button
                    onClick={() => openRoomPrice(room)}
                    title="Editar preço deste quarto no evento"
                    className="sticky left-0 z-10 bg-white px-2 md:px-3 py-2 border-r border-slate-200 text-left hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-900">{room.f_room_number}</p>
                    <p className="hidden md:block text-xs text-slate-500 truncate">
                      {room.f_room_type_label || room.f_room_type || 'Standard'} · {room.f_capacity}p
                      {room.f_price_per_night != null ? (
                        <span className={room.f_has_event_price ? 'text-violet-700 font-semibold' : ''}>
                          {' · '}{formatMoney(room.f_price_per_night)}{room.f_has_event_price ? '*' : ''}
                        </span>
                      ) : ' · sem preço'}
                    </p>
                  </button>
                  {(segmentsByRoom[room.room_id] || []).map((segment) => {
                    if (segment.kind === 'free') {
                      const isToday = segment.dayIndex === todayIndex
                      return (
                        <button
                          key={`free-${segment.dayIndex}`}
                          onClick={() => openCreate(room, dayISOs[segment.dayIndex])}
                          title={`Alocar quarto ${room.f_room_number} em ${dayISOs[segment.dayIndex]}`}
                          className={`min-h-[44px] border-r border-slate-100 transition-colors ${
                            isToday ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-slate-100'
                          }`}
                          style={{ gridColumn: `${segment.dayIndex + 2} / ${segment.dayIndex + 3}` }}
                        />
                      )
                    }
                    const { allocation, startIndex, endIndex } = segment
                    const isSelected =
                      selection?.kind === 'alloc' &&
                      selection.allocation.allocation_id === allocation.allocation_id
                    return (
                      <button
                        key={`alloc-${allocation.allocation_id}`}
                        onClick={() => openAllocation(room, allocation)}
                        title={`${allocation.group_name} · ${allocation.f_start_date} → ${allocation.f_end_date} · ${paymentLabels[allocation.f_payment_status] || allocation.f_payment_status}`}
                        className={`m-0.5 rounded-md px-2 min-h-[40px] text-xs font-medium text-left truncate transition-colors ${
                          paymentStyles[allocation.f_payment_status] || paymentStyles.pending
                        } ${isSelected ? 'ring-2 ring-slate-900 ring-offset-1' : ''}`}
                        style={{ gridColumn: `${startIndex + 2} / ${endIndex + 3}` }}
                      >
                        {allocation.f_checkin_status === 'checked_in' ? '✓ ' : ''}
                        {allocation.group_name}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail panel: existing allocation */}
        {selection?.kind === 'alloc' && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selection.allocation.group_name} — Quarto {selection.room.f_room_number}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selection.allocation.f_start_date} → {selection.allocation.f_end_date} ·{' '}
                  Pagamento: {paymentLabels[selection.allocation.f_payment_status] || selection.allocation.f_payment_status}
                </p>
              </div>
              <button
                onClick={() => navigate(`/events/${eventId}/guests`)}
                className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 text-sm whitespace-nowrap"
              >
                Ver grupo →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={editForm.f_room_id ?? selection.room.room_id}
                onChange={(e) => setEditForm((current) => ({ ...current, f_room_id: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {grid?.rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    Quarto {room.f_room_number}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={editForm.f_start_date ?? ''}
                onChange={(e) => setEditForm((current) => ({ ...current, f_start_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={editForm.f_end_date ?? ''}
                onChange={(e) => setEditForm((current) => ({ ...current, f_end_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={editForm.f_checkin_status ?? selection.allocation.f_checkin_status}
                onChange={(e) => setEditForm((current) => ({ ...current, f_checkin_status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="planned">planned</option>
                <option value="checked_in">checked_in</option>
                <option value="completed">completed</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveAllocation}
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Salvar (troca de quarto/datas)'}
              </button>
              <button
                onClick={closePanel}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Detail panel: event room price */}
        {selection?.kind === 'room' && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Preço do Quarto {selection.room.f_room_number} neste evento
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Preço base do quarto: {selection.room.f_base_price_per_night != null
                ? `${formatMoney(selection.room.f_base_price_per_night)}/noite`
                : 'não definido'}
              {selection.room.f_has_event_price && ' · este evento tem preço próprio'}
            </p>
            <form onSubmit={handleSaveEventPrice} className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Preço/noite neste evento (R$)"
                value={eventPriceInput}
                onChange={(e) => setEventPriceInput(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md w-60"
              />
              <button
                type="submit"
                disabled={saving || eventPriceInput === ''}
                className="bg-violet-600 text-white px-5 py-2 rounded-md hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Definir preço do evento'}
              </button>
              {selection.room.f_has_event_price && (
                <button
                  type="button"
                  onClick={handleRemoveEventPrice}
                  disabled={saving}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Remover (voltar ao preço base)
                </button>
              )}
              <button
                type="button"
                onClick={closePanel}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
              >
                Fechar
              </button>
            </form>
          </div>
        )}

        {/* Detail panel: create allocation on free cell */}
        {selection?.kind === 'create' && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Alocar Quarto {selection.room.f_room_number}
            </h2>
            <p className="text-sm text-gray-600 mb-4">A partir de {selection.date}</p>
            {reservations.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                Nenhuma reserva disponível. Crie grupos e reservas primeiro na página de Guests.
              </p>
            ) : (
              <form onSubmit={handleCreateAllocation} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={createForm.f_reservation_id}
                  onChange={(e) => {
                    const reservationId = Number(e.target.value)
                    const reservation = reservations.find((item) => item.id === reservationId)
                    setCreateForm((current) => ({
                      ...current,
                      f_reservation_id: reservationId,
                      f_start_date: reservation?.f_start_date || current.f_start_date,
                      f_end_date: reservation?.f_end_date || current.f_end_date,
                    }))
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
                  required
                >
                  <option value={0}>Selecione a reserva</option>
                  {reservations.map((reservation) => (
                    <option key={reservation.id} value={reservation.id}>
                      {reservation.groupName} · {reservation.f_start_date} → {reservation.f_end_date}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={createForm.f_start_date}
                  onChange={(e) => setCreateForm((current) => ({ ...current, f_start_date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="date"
                  value={createForm.f_end_date}
                  onChange={(e) => setCreateForm((current) => ({ ...current, f_end_date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <div className="md:col-span-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Criar alocação'}
                  </button>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
