import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import {
  Event,
  EventCreate,
  Hotel,
  eventService,
  hotelService,
} from '../services/api'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newEvent, setNewEvent] = useState<EventCreate>({
    f_hotel_id: 0,
    f_name: '',
    f_event_type: '',
    f_start_date: '',
    f_end_date: '',
    f_expected_guests: undefined,
    f_expected_families: undefined,
    f_notes: '',
  })

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const hotelMap = useMemo(
    () => Object.fromEntries(hotels.map((hotel) => [hotel.id, hotel])),
    [hotels]
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
      await eventService.createEvent({
        ...newEvent,
        f_event_type: newEvent.f_event_type || undefined,
        f_expected_guests: newEvent.f_expected_guests || undefined,
        f_expected_families: newEvent.f_expected_families || undefined,
        f_notes: newEvent.f_notes || undefined,
      })
      setShowCreateForm(false)
      setNewEvent((current) => ({
        ...current,
        f_name: '',
        f_event_type: '',
        f_start_date: '',
        f_end_date: '',
        f_expected_guests: undefined,
        f_expected_families: undefined,
        f_notes: '',
      }))
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create event')
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create events and navigate the internal MVP flow by event.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/hotels')}
                className="text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                ← Back to Hotels
              </button>
              <button
                onClick={() => setShowCreateForm((current) => !current)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {showCreateForm ? 'Hide Event Form' : '+ New Event'}
              </button>
              <span className="text-sm text-gray-600">{user?.f_username}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create event</h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newEvent.f_hotel_id}
                onChange={(e) => setNewEvent((current) => ({ ...current, f_hotel_id: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
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
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
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
            {events.map((event) => {
              const hotel = hotelMap[event.f_hotel_id]

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {event.f_name}
                        </h2>
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
                        {hotel && <p>🏨 {hotel.f_name}</p>}
                        {event.f_expected_guests ? <p>👥 Expected guests: {event.f_expected_guests}</p> : null}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
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
      </main>
    </div>
  )
}
