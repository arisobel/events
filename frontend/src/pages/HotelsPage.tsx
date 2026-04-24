import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hotelService, Hotel } from '../services/api'

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      const data = await hotelService.getHotels()
      setHotels(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/events')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View Events →
              </button>
              <span className="text-sm text-gray-600">
                Welcome, {user?.f_username}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <div className="text-center text-gray-600">
            Loading hotels...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">No hotels found.</p>
            <p className="text-sm mt-2">Create a hotel using the API or backend.</p>
          </div>
        )}

        {!loading && !error && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {hotel.f_name}
                </h2>
                
                {hotel.f_trade_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    Trade Name: {hotel.f_trade_name}
                  </p>
                )}

                <div className="space-y-1 text-sm text-gray-600">
                  {hotel.f_city && (
                    <p>📍 {hotel.f_city}{hotel.f_state ? `, ${hotel.f_state}` : ''}</p>
                  )}
                  {hotel.f_country && (
                    <p>🌍 {hotel.f_country}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    hotel.f_is_active === 'T' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hotel.f_is_active === 'T' ? 'Active' : 'Inactive'}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(hotel.f_created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
