import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Event,
  EventCreate,
  EventUpdate,
  Hotel,
  eventService,
  hotelService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'
import { getTodayDateKey, isEventActiveOnDate } from '../utils/events'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [newEvent, setNewEvent] = useState<EventCreate>({
    f_hotel_id: 0,
    f_name: '',
    f_event_type: '',
    f_start_date: '',
    f_end_date: '',
    f_expected_guests: undefined,
    f_expected_families: undefined,
    f_is_entry_default: false,
    f_notes: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const hotelMap = useMemo(
    () => Object.fromEntries(hotels.map((hotel) => [hotel.id, hotel])),
    [hotels]
  )
  const todayDateKey = getTodayDateKey()
  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) => {
        const leftActive = isEventActiveOnDate(left, todayDateKey)
        const rightActive = isEventActiveOnDate(right, todayDateKey)

        if (leftActive !== rightActive) {
          return leftActive ? -1 : 1
        }

        return left.f_start_date.localeCompare(right.f_start_date)
      }),
    [events, todayDateKey]
  )

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [eventsData, hotelsData] = await Promise.all([
        eventService.getEvents(),
        hotelService.getHotels(),
      ])
      setEvents(eventsData)
      setHotels(hotelsData)
      if (hotelsData.length > 0) {
        setNewEvent((current) => ({
          ...current,
          f_hotel_id: current.f_hotel_id || hotelsData[0].id,
        }))
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowCreateForm(false)
    setEditingEventId(null)
    setNewEvent((current) => ({
      ...current,
      f_name: '',
      f_event_type: '',
      f_start_date: '',
      f_end_date: '',
      f_expected_guests: undefined,
      f_expected_families: undefined,
      f_is_entry_default: false,
      f_notes: '',
    }))
  }

  const openEditForm = (event: Event) => {
    setEditingEventId(event.id)
    setNewEvent({
      f_hotel_id: event.f_hotel_id,
      f_name: event.f_name,
      f_event_type: event.f_event_type || '',
      f_start_date: event.f_start_date,
      f_end_date: event.f_end_date,
      f_expected_guests: event.f_expected_guests ?? undefined,
      f_expected_families: event.f_expected_families ?? undefined,
      f_is_entry_default: event.f_is_entry_default,
      f_notes: event.f_notes || '',
    })
    setShowCreateForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.f_hotel_id) {
      setError('Select a hotel before creating an event')
      return
    }
    if (!newEvent.f_name.trim()) {
      setError('Event name is required')
      return
    }
    if (!newEvent.f_start_date || !newEvent.f_end_date) {
      setError('Start and end dates are required')
      return
    }

    try {
      setCreating(true)
      setError('')
      if (editingEventId) {
        const payload: EventUpdate = {
          f_name: newEvent.f_name,
          f_event_type: newEvent.f_event_type || undefined,
          f_start_date: newEvent.f_start_date,
          f_end_date: newEvent.f_end_date,
          f_expected_guests: newEvent.f_expected_guests || undefined,
          f_expected_families: newEvent.f_expected_families || undefined,
          f_is_entry_default: newEvent.f_is_entry_default,
          f_notes: newEvent.f_notes || undefined,
        }
        await eventService.updateEvent(editingEventId, payload)
      } else {
        await eventService.createEvent({
          ...newEvent,
          f_event_type: newEvent.f_event_type || undefined,
          f_expected_guests: newEvent.f_expected_guests || undefined,
          f_expected_families: newEvent.f_expected_families || undefined,
          f_notes: newEvent.f_notes || undefined,
        })
      }
      resetForm()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save event')
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout title="Events">
      <div className="max-w-7xl mx-auto">
        {/* Page actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-500">
            Create events and navigate the internal MVP flow by event.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => (showCreateForm ? resetForm() : setShowCreateForm(true))}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              {showCreateForm ? 'Hide Event Form' : '+ New Event'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEventId ? 'Edit event' : 'Create event'}
            </h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newEvent.f_hotel_id}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_hotel_id: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                required
                disabled={editingEventId != null}
              >
                <option value={0}>Select hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.f_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Event name *"
                value={newEvent.f_name}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Event type"
                value={newEvent.f_event_type}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_event_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                min={0}
                placeholder="Expected guests"
                value={newEvent.f_expected_guests ?? ''}
                onChange={(e) => setNewEvent((current) => ({
                  ...current,
                  f_expected_guests: e.target.value ? Number(e.target.value) : undefined,
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={newEvent.f_start_date}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_start_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="date"
                value={newEvent.f_end_date}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_end_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                min={0}
                placeholder="Expected families"
                value={newEvent.f_expected_families ?? ''}
                onChange={(e) => setNewEvent((current) => ({
                  ...current,
                  f_expected_families: e.target.value ? Number(e.target.value) : undefined,
                }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={newEvent.f_notes}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
              />
              <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newEvent.f_is_entry_default || false}
                  onChange={(e) => setNewEvent((current) => ({ ...current, f_is_entry_default: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Evento ativo — abrir este evento ao entrar no sistema (desmarca os demais)
              </label>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : editingEventId ? 'Save changes' : 'Create event'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg mt-2">No events found.</p>
            <p className="text-sm mt-2">Create an event to continue the MVP flow.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const hotel = hotelMap[event.f_hotel_id]
              const isActiveToday = isEventActiveOnDate(event, todayDateKey)

              return (
                <div
                  key={event.id}
                  className={`rounded-lg p-6 transition-shadow ${
                    isActiveToday
                      ? 'bg-emerald-50 ring-1 ring-emerald-200 shadow-md'
                      : 'bg-white shadow hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {event.f_name}
                        </h2>
                        {isActiveToday && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            Active today
                          </span>
                        )}
                        {event.f_is_entry_default && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            ⭐ Entry default
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.f_status)}`}>
                          {event.f_status}
                        </span>
                      </div>

                      {event.f_event_type && (
                        <p className="text-sm text-gray-600 mt-1">Type: {event.f_event_type}</p>
                      )}

                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p>
                          📅 {new Date(event.f_start_date).toLocaleDateString()} - {new Date(event.f_end_date).toLocaleDateString()}
                        </p>
                        {isActiveToday && <p className="text-emerald-700">This event is currently in its active period.</p>}
                        {hotel && <p>🏨 {hotel.f_name}</p>}
                        {event.f_expected_guests ? <p>👥 Expected guests: {event.f_expected_guests}</p> : null}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => openEditForm(event)}
                        className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 text-sm font-medium whitespace-nowrap"
                      >
                        ✏️ Edit Event
                      </button>
                      <button
                        onClick={() => navigate(`/events/${event.id}/guests`)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium whitespace-nowrap"
                      >
                        Guests & Reservations
                      </button>
                      <button
                        onClick={() => navigate(`/events/${event.id}/rooms`)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium whitespace-nowrap"
                      >
                        Room Allocations
                      </button>
                      <button
                        onClick={() => navigate(`/events/${event.id}/room-grid`)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 text-sm font-medium whitespace-nowrap"
                      >
                        📅 Room Grid
                      </button>
                      <button
                        onClick={() => navigate(`/events/${event.id}/tasks`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                      >
                        Tasks
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
