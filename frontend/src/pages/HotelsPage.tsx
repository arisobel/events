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

type HotelFormState = {
  f_name: string
  f_trade_name: string
  f_city: string
  f_state: string
  f_country: string
  f_notes: string
}

type RoomFormState = {
  hotelId: number | ''
  f_room_number: string
  f_room_type: string
  f_room_type_label: string
  f_floor: string
  f_block: string
  f_capacity: number
  f_price_per_night: string
  f_notes: string
}

const emptyHotelForm: HotelFormState = {
  f_name: '',
  f_trade_name: '',
  f_city: '',
  f_state: '',
  f_country: '',
  f_notes: '',
}

const emptyRoomForm: RoomFormState = {
  hotelId: '',
  f_room_number: '',
  f_room_type: '',
  f_room_type_label: '',
  f_floor: '',
  f_block: '',
  f_capacity: 2,
  f_price_per_night: '',
  f_notes: '',
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomsByHotel, setRoomsByHotel] = useState<Record<number, HotelRoom[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showHotelForm, setShowHotelForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [savingHotel, setSavingHotel] = useState(false)
  const [savingRoom, setSavingRoom] = useState(false)
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<number | null>(null)
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null)
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null)

  const [hotelForm, setHotelForm] = useState<HotelFormState>(emptyHotelForm)
  const [roomForm, setRoomForm] = useState<RoomFormState>(emptyRoomForm)

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
      if (data.length > 0 && !roomForm.hotelId) {
        setRoomForm((current) => ({ ...current, hotelId: data[0].id }))
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

  // ---- Hotel form (create + edit) ----

  const openNewHotelForm = () => {
    setEditingHotelId(null)
    setHotelForm(emptyHotelForm)
    setShowHotelForm(true)
  }

  const openEditHotelForm = (hotel: Hotel) => {
    setEditingHotelId(hotel.id)
    setHotelForm({
      f_name: hotel.f_name || '',
      f_trade_name: hotel.f_trade_name || '',
      f_city: hotel.f_city || '',
      f_state: hotel.f_state || '',
      f_country: hotel.f_country || '',
      f_notes: hotel.f_notes || '',
    })
    setShowHotelForm(true)
    setError('')
  }

  const closeHotelForm = () => {
    setShowHotelForm(false)
    setEditingHotelId(null)
    setHotelForm(emptyHotelForm)
  }

  const handleSubmitHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hotelForm.f_name.trim()) {
      setError('Hotel name is required')
      return
    }

    const payload = {
      f_name: hotelForm.f_name,
      f_trade_name: hotelForm.f_trade_name || undefined,
      f_city: hotelForm.f_city || undefined,
      f_state: hotelForm.f_state || undefined,
      f_country: hotelForm.f_country || undefined,
      f_notes: hotelForm.f_notes || undefined,
    }

    try {
      setSavingHotel(true)
      setError('')
      if (editingHotelId) {
        await hotelService.updateHotel(editingHotelId, payload)
      } else {
        const created = await hotelService.createHotel(payload as HotelCreate)
        setRoomForm((current) => ({ ...current, hotelId: created.id }))
      }
      closeHotelForm()
      await loadHotels()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save hotel')
    } finally {
      setSavingHotel(false)
    }
  }

  // ---- Room form (create + edit) ----

  const openNewRoomForm = (hotelId?: number) => {
    setEditingRoomId(null)
    setRoomForm({
      ...emptyRoomForm,
      hotelId: hotelId ?? (hotels[0]?.id ?? ''),
    })
    setShowRoomForm(true)
    setError('')
  }

  const openEditRoomForm = (hotelId: number, room: HotelRoom) => {
    setEditingRoomId(room.id)
    setRoomForm({
      hotelId,
      f_room_number: room.f_room_number || '',
      f_room_type: room.f_room_type || '',
      f_room_type_label: room.f_room_type_label || '',
      f_floor: room.f_floor || '',
      f_block: room.f_block || '',
      f_capacity: room.f_capacity ?? 1,
      f_price_per_night: room.f_price_per_night != null ? String(room.f_price_per_night) : '',
      f_notes: room.f_notes || '',
    })
    setShowRoomForm(true)
    setError('')
  }

  const closeRoomForm = () => {
    setShowRoomForm(false)
    setEditingRoomId(null)
    setRoomForm((current) => ({ ...emptyRoomForm, hotelId: current.hotelId }))
  }

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomForm.hotelId) {
      setError('Select a hotel before saving a room')
      return
    }
    if (!roomForm.f_room_number.trim()) {
      setError('Room number is required')
      return
    }

    const payload = {
      f_room_number: roomForm.f_room_number,
      f_room_type: roomForm.f_room_type || undefined,
      f_room_type_label: roomForm.f_room_type_label || undefined,
      f_floor: roomForm.f_floor || undefined,
      f_block: roomForm.f_block || undefined,
      f_capacity: Number(roomForm.f_capacity) || 1,
      f_price_per_night: roomForm.f_price_per_night !== '' ? roomForm.f_price_per_night : undefined,
      f_notes: roomForm.f_notes || undefined,
    }

    try {
      setSavingRoom(true)
      setError('')
      const hotelId = Number(roomForm.hotelId)
      if (editingRoomId) {
        await hotelService.updateHotelRoom(hotelId, editingRoomId, payload)
      } else {
        await hotelService.createHotelRoom(hotelId, payload as HotelRoomCreate)
      }
      closeRoomForm()
      await loadRooms(hotelId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save room')
    } finally {
      setSavingRoom(false)
    }
  }

  const formatPrice = (value?: string | null) => {
    if (value == null || value === '') return null
    const num = Number(value)
    if (Number.isNaN(num)) return null
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
              onClick={openNewHotelForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              + New Hotel
            </button>
            <button
              onClick={() => openNewRoomForm()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm"
            >
              + Add Room
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingHotelId ? 'Edit hotel' : 'Create hotel'}
            </h2>
            <form onSubmit={handleSubmitHotel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Hotel name *"
                value={hotelForm.f_name}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Trade name"
                value={hotelForm.f_trade_name}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_trade_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="City"
                value={hotelForm.f_city}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_city: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="State"
                value={hotelForm.f_state}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_state: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Country"
                value={hotelForm.f_country}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_country: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={hotelForm.f_notes}
                onChange={(e) => setHotelForm((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingHotel}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingHotel ? 'Saving...' : editingHotelId ? 'Save changes' : 'Create hotel'}
                </button>
                <button
                  type="button"
                  onClick={closeHotelForm}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRoomId ? 'Edit hotel room' : 'Create hotel room'}
            </h2>
            <form onSubmit={handleSubmitRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={roomForm.hotelId}
                onChange={(e) => setRoomForm((current) => ({ ...current, hotelId: Number(e.target.value) || '' }))}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                required
                disabled={editingRoomId != null}
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
                value={roomForm.f_room_number}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_room_number: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Room type (standard, suite...)"
                value={roomForm.f_room_type}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_room_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Commercial label (ex: Família Vista Mar)"
                value={roomForm.f_room_type_label}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_room_type_label: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                min={1}
                placeholder="Capacity"
                value={roomForm.f_capacity}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_capacity: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Price per night (R$)"
                value={roomForm.f_price_per_night}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_price_per_night: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Floor"
                value={roomForm.f_floor}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_floor: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Block"
                value={roomForm.f_block}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_block: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={roomForm.f_notes}
                onChange={(e) => setRoomForm((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingRoom ? 'Saving...' : editingRoomId ? 'Save changes' : 'Create room'}
                </button>
                <button
                  type="button"
                  onClick={closeRoomForm}
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
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEditHotelForm(hotel)}
                        className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 text-sm"
                      >
                        Edit Hotel
                      </button>
                      <button
                        onClick={() => loadRooms(hotel.id)}
                        className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                      >
                        {selectedHotelForRooms === hotel.id ? 'Refresh Rooms' : 'View Rooms'}
                      </button>
                    </div>
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
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Rooms ({rooms.length})
                        </h3>
                        <button
                          onClick={() => openNewRoomForm(hotel.id)}
                          className="text-xs text-emerald-700 hover:text-emerald-900"
                        >
                          + Add room here
                        </button>
                      </div>
                      {rooms.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                          No rooms yet. Use the form above to add the first room.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {rooms.map((room) => {
                            const price = formatPrice(room.f_price_per_night)
                            return (
                              <div
                                key={room.id}
                                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Room {room.f_room_number}
                                    {room.f_room_type_label ? ` · ${room.f_room_type_label}` : ''}
                                  </p>
                                  <p className="text-gray-500">
                                    {room.f_room_type || 'Standard'} · Capacity {room.f_capacity}
                                    {price ? ` · ${price}/night` : ' · no price set'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                    {room.f_status}
                                  </span>
                                  <button
                                    onClick={() => openEditRoomForm(hotel.id, room)}
                                    className="text-xs text-blue-700 hover:text-blue-900"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            )
                          })}
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
