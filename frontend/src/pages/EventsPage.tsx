import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { eventService, Event } from '../services/api'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await eventService.getEvents()
      setEvents(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load events')
    } finally {
      setLoading(false)
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your events and access tasks
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hotels')}
                className="text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                ← Back to Hotels
              </button>
              <span className="text-sm text-gray-600">
                {user?.f_username}
              </span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg mt-4">No events found.</p>
            <p className="text-sm mt-2">Create an event using the API or backend.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
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
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {event.f_event_type}
                      </p>
                    )}

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        📅 {new Date(event.f_start_date).toLocaleDateString()} - {new Date(event.f_end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Hotel ID: {event.f_hotel_id}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/events/${event.id}/tasks`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                    >
                      View Tasks →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
