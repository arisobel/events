import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Hotel,
  HotelCreate,
  HotelRoom,
  HotelRoomCreate,
  hotelService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomsByHotel, setRoomsByHotel] = useState<Record<number, HotelRoom[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showHotelForm, setShowHotelForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [creatingHotel, setCreatingHotel] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<number | null>(null)

  const [newHotel, setNewHotel] = useState<HotelCreate>({
    f_name: '',
    f_city: '',
    f_state: '',
    f_country: '',
    f_trade_name: '',
    f_notes: '',
  })
  const [newRoom, setNewRoom] = useState<HotelRoomCreate & { hotelId: number | '' }>({
    hotelId: '',
    f_room_number: '',
    f_room_type: '',
    f_floor: '',
    f_block: '',
    f_capacity: 2,
    f_notes: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await hotelService.getHotels()
      setHotels(data)
      if (data.length > 0 && !newRoom.hotelId) {
        setNewRoom((current) => ({ ...current, hotelId: data[0].id }))
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async (hotelId: number) => {
    try {
      const rooms = await hotelService.getHotelRooms(hotelId)
      setRoomsByHotel((current) => ({
        ...current,
        [hotelId]: rooms,
      }))
      setSelectedHotelForRooms(hotelId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load hotel rooms')
    }
  }

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHotel.f_name.trim()) {
      setError('Hotel name is required')
      return
    }

    try {
      setCreatingHotel(true)
      setError('')
      const createdHotel = await hotelService.createHotel({
        ...newHotel,
        f_city: newHotel.f_city || undefined,
        f_state: newHotel.f_state || undefined,
        f_country: newHotel.f_country || undefined,
        f_trade_name: newHotel.f_trade_name || undefined,
        f_notes: newHotel.f_notes || undefined,
      })
      setNewHotel({
        f_name: '',
        f_city: '',
        f_state: '',
        f_country: '',
        f_trade_name: '',
        f_notes: '',
      })
      setShowHotelForm(false)
      setNewRoom((current) => ({ ...current, hotelId: createdHotel.id }))
      await loadHotels()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create hotel')
    } finally {
      setCreatingHotel(false)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoom.hotelId) {
      setError('Select a hotel before creating a room')
      return
    }
    if (!newRoom.f_room_number.trim()) {
      setError('Room number is required')
      return
    }

    try {
      setCreatingRoom(true)
      setError('')
      await hotelService.createHotelRoom(newRoom.hotelId, {
        f_room_number: newRoom.f_room_number,
        f_room_type: newRoom.f_room_type || undefined,
        f_floor: newRoom.f_floor || undefined,
        f_block: newRoom.f_block || undefined,
        f_capacity: Number(newRoom.f_capacity) || 1,
        f_notes: newRoom.f_notes || undefined,
      })
      setNewRoom((current) => ({
        ...current,
        f_room_number: '',
        f_room_type: '',
        f_floor: '',
        f_block: '',
        f_capacity: 2,
        f_notes: '',
      }))
      setShowRoomForm(false)
      await loadRooms(Number(newRoom.hotelId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create room')
    } finally {
      setCreatingRoom(false)
    }
  }

  return (
    <AdminLayout title="Hotels">
      <div className="max-w-7xl mx-auto">
        {/* Page actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-500">
            Create hotels, seed rooms, and prepare infrastructure for events.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowHotelForm((current) => !current)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              {showHotelForm ? 'Hide Hotel Form' : '+ New Hotel'}
            </button>
            <button
              onClick={() => setShowRoomForm((current) => !current)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm"
            >
              {showRoomForm ? 'Hide Room Form' : '+ Add Room'}
            </button>
            <button
              onClick={() => navigate('/events')}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-black text-sm"
            >
              View Events →
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showHotelForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create hotel</h2>
            <form onSubmit={handleCreateHotel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Hotel name *"
                value={newHotel.f_name}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Trade name"
                value={newHotel.f_trade_name}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_trade_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="City"
                value={newHotel.f_city}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_city: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="State"
                value={newHotel.f_state}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_state: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Country"
                value={newHotel.f_country}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_country: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={newHotel.f_notes}
                onChange={(e) => setNewHotel((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingHotel}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingHotel ? 'Creating...' : 'Create hotel'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHotelForm(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showRoomForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create hotel room</h2>
            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newRoom.hotelId}
                onChange={(e) => setNewRoom((current) => ({ ...current, hotelId: Number(e.target.value) || '' }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select hotel</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.f_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Room number *"
                value={newRoom.f_room_number}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_room_number: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Room type"
                value={newRoom.f_room_type}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_room_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                min={1}
                placeholder="Capacity"
                value={newRoom.f_capacity}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_capacity: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Floor"
                value={newRoom.f_floor}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_floor: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Block"
                value={newRoom.f_block}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_block: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={newRoom.f_notes}
                onChange={(e) => setNewRoom((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingRoom}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creatingRoom ? 'Creating...' : 'Create room'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomForm(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600 py-12">Loading hotels...</div>
        )}

        {!loading && hotels.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">No hotels found.</p>
            <p className="text-sm mt-2">Create the first hotel to start the MVP flow.</p>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {hotels.map((hotel) => {
              const rooms = roomsByHotel[hotel.id] || []

              return (
                <div
                  key={hotel.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">{hotel.f_name}</h2>
                      {hotel.f_trade_name && (
                        <p className="text-sm text-gray-600 mb-1">Trade name: {hotel.f_trade_name}</p>
                      )}
                      <div className="space-y-1 text-sm text-gray-600">
                        {hotel.f_city && <p>📍 {hotel.f_city}{hotel.f_state ? `, ${hotel.f_state}` : ''}</p>}
                        {hotel.f_country && <p>🌍 {hotel.f_country}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => loadRooms(hotel.id)}
                      className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                    >
                      {selectedHotelForRooms === hotel.id ? 'Refresh Rooms' : 'View Rooms'}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hotel.f_is_active === 'T' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hotel.f_is_active === 'T' ? 'Active' : 'Inactive'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(hotel.f_created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedHotelForRooms === hotel.id && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Rooms ({rooms.length})
                      </h3>
                      {rooms.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                          No rooms yet. Use the form above to add the first room.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {rooms.map((room) => (
                            <div
                              key={room.id}
                              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  Room {room.f_room_number}
                                </p>
                                <p className="text-gray-500">
                                  {room.f_room_type || 'Standard'} · Capacity {room.f_capacity}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                {room.f_status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
