import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Hotel,
  HotelCreate,
  HotelRoom,
  HotelRoomCreate,
  HotelSpace,
  HotelSpaceCreate,
  hotelService,
} from '../services/api'
import { SPACE_TYPES, spaceTypeLabel } from '../utils/spaces'
import AdminLayout from '../components/AdminLayout'

// Pequeno rótulo acima do campo — evita depender só do placeholder, que some ao digitar
function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className || ''}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  )
}

// Incrementa a parte numérica final do número do quarto, preservando prefixo e zeros à esquerda
// ex: incrementRoomNumber("101", 2) -> "103"; incrementRoomNumber("A007", 2) -> "A009"
function incrementRoomNumber(roomNumber: string, step: number): string {
  const match = roomNumber.match(/^(.*?)(\d+)$/)
  if (!match) return roomNumber
  const [, prefix, digits] = match
  const nextValue = Math.max(parseInt(digits, 10) + step, 0)
  const nextDigits = String(nextValue).padStart(digits.length, '0')
  return `${prefix}${nextDigits}`
}

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

type SpaceFormState = {
  hotelId: number | ''
  f_name: string
  f_space_type: string
  f_capacity: string
  f_floor: string
  f_block: string
  f_notes: string
}

const emptySpaceForm: SpaceFormState = {
  hotelId: '',
  f_name: '',
  f_space_type: 'salao_refeicao',
  f_capacity: '',
  f_floor: '',
  f_block: '',
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
  const [isSequenceMode, setIsSequenceMode] = useState(false)
  const [sequenceStep, setSequenceStep] = useState(1)
  const [sequenceQuantity, setSequenceQuantity] = useState(1)
  // Step/quantidade ficam visíveis na lista de quartos (não escondidos dentro do modal) —
  // são os parâmetros usados quando o botão "Sequence" de um quarto é clicado
  const [bulkStep, setBulkStep] = useState(1)
  const [bulkQuantity, setBulkQuantity] = useState(1)

  const [spacesByHotel, setSpacesByHotel] = useState<Record<number, HotelSpace[]>>({})
  const [selectedHotelForSpaces, setSelectedHotelForSpaces] = useState<number | null>(null)
  const [showSpaceForm, setShowSpaceForm] = useState(false)
  const [savingSpace, setSavingSpace] = useState(false)
  const [editingSpaceId, setEditingSpaceId] = useState<number | null>(null)

  const [hotelForm, setHotelForm] = useState<HotelFormState>(emptyHotelForm)
  const [roomForm, setRoomForm] = useState<RoomFormState>(emptyRoomForm)
  const [spaceForm, setSpaceForm] = useState<SpaceFormState>(emptySpaceForm)

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

  const loadSpaces = async (hotelId: number) => {
    try {
      const spaces = await hotelService.getHotelSpaces(hotelId)
      setSpacesByHotel((current) => ({
        ...current,
        [hotelId]: spaces,
      }))
      setSelectedHotelForSpaces(hotelId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load hotel spaces')
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
    setIsSequenceMode(false)
    setRoomForm({
      ...emptyRoomForm,
      hotelId: hotelId ?? (hotels[0]?.id ?? ''),
    })
    setShowRoomForm(true)
    setError('')
  }

  const openEditRoomForm = (hotelId: number, room: HotelRoom) => {
    setEditingRoomId(room.id)
    setIsSequenceMode(false)
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

  // Duplica um quarto existente como modelo, incrementando o número pelo step definido na lista de quartos
  const openSequenceForm = (hotelId: number, room: HotelRoom) => {
    setEditingRoomId(null)
    setIsSequenceMode(true)
    setSequenceStep(bulkStep)
    setSequenceQuantity(bulkQuantity)
    setRoomForm({
      hotelId,
      f_room_number: incrementRoomNumber(room.f_room_number, bulkStep),
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
    setIsSequenceMode(false)
    setRoomForm((current) => ({ ...emptyRoomForm, hotelId: current.hotelId }))
  }

  // Prévia dos números que serão gerados, a partir do número inicial + step, até a quantidade escolhida
  const sequencePreview = useMemo(() => {
    if (!isSequenceMode) return []
    const numbers: string[] = []
    let current = roomForm.f_room_number
    for (let i = 0; i < sequenceQuantity && i < 50; i += 1) {
      numbers.push(current)
      current = incrementRoomNumber(current, sequenceStep)
    }
    return numbers
  }, [isSequenceMode, roomForm.f_room_number, sequenceQuantity, sequenceStep])

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

    if (isSequenceMode && (sequenceQuantity < 1 || sequenceQuantity > 50)) {
      setError('Quantity must be between 1 and 50')
      return
    }
    if (isSequenceMode && sequenceQuantity > 1 && !/\d+$/.test(roomForm.f_room_number)) {
      setError('Room number must end with digits to generate more than one room')
      return
    }

    try {
      setSavingRoom(true)
      setError('')
      const hotelId = Number(roomForm.hotelId)
      if (isSequenceMode) {
        let currentNumber = roomForm.f_room_number
        for (let i = 0; i < sequenceQuantity; i += 1) {
          await hotelService.createHotelRoom(hotelId, {
            ...payload,
            f_room_number: currentNumber,
          } as HotelRoomCreate)
          currentNumber = incrementRoomNumber(currentNumber, sequenceStep)
        }
      } else if (editingRoomId) {
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

  // ---- Space form (create + edit) ----

  const openNewSpaceForm = (hotelId?: number) => {
    setEditingSpaceId(null)
    setSpaceForm({
      ...emptySpaceForm,
      hotelId: hotelId ?? (hotels[0]?.id ?? ''),
    })
    setShowSpaceForm(true)
    setError('')
  }

  const openEditSpaceForm = (hotelId: number, space: HotelSpace) => {
    setEditingSpaceId(space.id)
    setSpaceForm({
      hotelId,
      f_name: space.f_name || '',
      f_space_type: space.f_space_type || 'outro',
      f_capacity: space.f_capacity != null ? String(space.f_capacity) : '',
      f_floor: space.f_floor || '',
      f_block: space.f_block || '',
      f_notes: space.f_notes || '',
    })
    setShowSpaceForm(true)
    setError('')
  }

  const closeSpaceForm = () => {
    setShowSpaceForm(false)
    setEditingSpaceId(null)
    setSpaceForm((current) => ({ ...emptySpaceForm, hotelId: current.hotelId }))
  }

  const handleSubmitSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spaceForm.hotelId) {
      setError('Select a hotel before saving a space')
      return
    }
    if (!spaceForm.f_name.trim()) {
      setError('Space name is required')
      return
    }

    const payload = {
      f_name: spaceForm.f_name,
      f_space_type: spaceForm.f_space_type,
      f_capacity: spaceForm.f_capacity !== '' ? Number(spaceForm.f_capacity) : undefined,
      f_floor: spaceForm.f_floor || undefined,
      f_block: spaceForm.f_block || undefined,
      f_notes: spaceForm.f_notes || undefined,
    }

    try {
      setSavingSpace(true)
      setError('')
      const hotelId = Number(spaceForm.hotelId)
      if (editingSpaceId) {
        await hotelService.updateHotelSpace(hotelId, editingSpaceId, payload)
      } else {
        await hotelService.createHotelSpace(hotelId, payload as HotelSpaceCreate)
      }
      closeSpaceForm()
      await loadSpaces(hotelId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save space')
    } finally {
      setSavingSpace(false)
    }
  }

  const handleDeleteSpace = async (hotelId: number, space: HotelSpace) => {
    if (!window.confirm(`Delete space "${space.f_name}"?`)) return
    try {
      setError('')
      await hotelService.deleteHotelSpace(hotelId, space.id)
      await loadSpaces(hotelId)
    } catch (err: any) {
      // 409 quando o espaço está em uso por cozinhas/mesas/eventos
      setError(err.response?.data?.detail || 'Failed to delete space')
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
              onClick={() => openNewSpaceForm()}
              className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm"
            >
              + Add Space
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
              <Field label="Hotel name *">
                <input
                  type="text"
                  value={hotelForm.f_name}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </Field>
              <Field label="Trade name">
                <input
                  type="text"
                  value={hotelForm.f_trade_name}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_trade_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="City">
                <input
                  type="text"
                  value={hotelForm.f_city}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="State">
                <input
                  type="text"
                  value={hotelForm.f_state}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_state: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Country">
                <input
                  type="text"
                  value={hotelForm.f_country}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_country: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Notes">
                <input
                  type="text"
                  value={hotelForm.f_notes}
                  onChange={(e) => setHotelForm((current) => ({ ...current, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
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
              {isSequenceMode ? 'Generate rooms in sequence' : editingRoomId ? 'Edit hotel room' : 'Create hotel room'}
            </h2>
            <form onSubmit={handleSubmitRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hotel">
                <select
                  value={roomForm.hotelId}
                  onChange={(e) => setRoomForm((current) => ({ ...current, hotelId: Number(e.target.value) || '' }))}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 w-full"
                  required
                  disabled={editingRoomId != null || isSequenceMode}
                >
                  <option value="">Select hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.f_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={isSequenceMode ? 'Starting room number *' : 'Room number *'}>
                <input
                  type="text"
                  value={roomForm.f_room_number}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_room_number: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </Field>
              <Field label="Room type">
                <input
                  type="text"
                  placeholder="standard, suite..."
                  value={roomForm.f_room_type}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_room_type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Commercial label">
                <input
                  type="text"
                  placeholder="ex: Família Vista Mar"
                  value={roomForm.f_room_type_label}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_room_type_label: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Capacity">
                <input
                  type="number"
                  min={1}
                  value={roomForm.f_capacity}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_capacity: Number(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Price per night (R$)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={roomForm.f_price_per_night}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_price_per_night: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Floor">
                <input
                  type="text"
                  value={roomForm.f_floor}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_floor: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Block">
                <input
                  type="text"
                  value={roomForm.f_block}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_block: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Notes" className="md:col-span-2">
                <input
                  type="text"
                  value={roomForm.f_notes}
                  onChange={(e) => setRoomForm((current) => ({ ...current, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>

              {isSequenceMode && (
                <div className="md:col-span-2 text-sm text-violet-700 bg-violet-50 rounded-md px-3 py-2">
                  Step {sequenceStep} · Quantity {sequenceQuantity} —{' '}
                  {sequencePreview.length > 1
                    ? `will create ${sequencePreview.length} rooms: ${sequencePreview.join(', ')}`
                    : `will create room: ${sequencePreview[0] || roomForm.f_room_number}`}
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingRoom
                    ? 'Saving...'
                    : isSequenceMode
                    ? `Generate ${sequenceQuantity} room${sequenceQuantity > 1 ? 's' : ''}`
                    : editingRoomId
                    ? 'Save changes'
                    : 'Create room'}
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

        {showSpaceForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSpaceId ? 'Edit space' : 'Create space'}
            </h2>
            <form onSubmit={handleSubmitSpace} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hotel">
                <select
                  value={spaceForm.hotelId}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, hotelId: Number(e.target.value) || '' }))}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 w-full"
                  required
                  disabled={editingSpaceId != null}
                >
                  <option value="">Select hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.f_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Space name *">
                <input
                  type="text"
                  placeholder="ex: Salão Jequitibás"
                  value={spaceForm.f_name}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </Field>
              <Field label="Space type *">
                <select
                  value={spaceForm.f_space_type}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_space_type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                >
                  {SPACE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {spaceTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Capacity">
                <input
                  type="number"
                  min={0}
                  value={spaceForm.f_capacity}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_capacity: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Floor">
                <input
                  type="text"
                  value={spaceForm.f_floor}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_floor: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Block">
                <input
                  type="text"
                  value={spaceForm.f_block}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_block: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Notes" className="md:col-span-2">
                <input
                  type="text"
                  value={spaceForm.f_notes}
                  onChange={(e) => setSpaceForm((current) => ({ ...current, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingSpace}
                  className="bg-violet-600 text-white px-5 py-2 rounded-md hover:bg-violet-700 disabled:opacity-50"
                >
                  {savingSpace ? 'Saving...' : editingSpaceId ? 'Save changes' : 'Create space'}
                </button>
                <button
                  type="button"
                  onClick={closeSpaceForm}
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
              const spaces = spacesByHotel[hotel.id] || []

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
                      <button
                        onClick={() => loadSpaces(hotel.id)}
                        className="bg-violet-50 text-violet-700 px-3 py-2 rounded-md hover:bg-violet-100 text-sm"
                      >
                        {selectedHotelForSpaces === hotel.id ? 'Refresh Spaces' : 'View Spaces'}
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
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Rooms ({rooms.length})
                        </h3>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-xs text-gray-500" title="Used by the Sequence button on each room">
                            Step
                            <input
                              type="number"
                              value={bulkStep}
                              onChange={(e) => setBulkStep(Number(e.target.value) || 1)}
                              className="w-14 px-1.5 py-1 border border-gray-300 rounded-md text-xs"
                            />
                          </label>
                          <label className="flex items-center gap-1 text-xs text-gray-500" title="Used by the Sequence button on each room">
                            Qty
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={bulkQuantity}
                              onChange={(e) => setBulkQuantity(Number(e.target.value) || 1)}
                              className="w-14 px-1.5 py-1 border border-gray-300 rounded-md text-xs"
                            />
                          </label>
                          <button
                            onClick={() => openNewRoomForm(hotel.id)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
                          >
                            + Add room here
                          </button>
                        </div>
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
                                  <button
                                    onClick={() => openSequenceForm(hotel.id, room)}
                                    title={`Duplicate this room and generate ${bulkQuantity} room(s), step ${bulkStep}`}
                                    className="text-xs text-violet-700 hover:text-violet-900"
                                  >
                                    🔁 Sequence
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedHotelForSpaces === hotel.id && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Spaces ({spaces.length})
                        </h3>
                        <button
                          onClick={() => openNewSpaceForm(hotel.id)}
                          className="text-xs text-violet-700 hover:text-violet-900 whitespace-nowrap"
                        >
                          + Add space here
                        </button>
                      </div>
                      {spaces.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                          No spaces yet. Register where activities happen: synagogue, dining halls, pool...
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {spaces.map((space) => (
                            <div
                              key={space.id}
                              className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{space.f_name}</p>
                                <p className="text-gray-500">
                                  {spaceTypeLabel(space.f_space_type)}
                                  {space.f_capacity != null ? ` · Capacity ${space.f_capacity}` : ''}
                                  {space.f_floor ? ` · Floor ${space.f_floor}` : ''}
                                  {space.f_block ? ` · Block ${space.f_block}` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditSpaceForm(hotel.id, space)}
                                  className="text-xs text-blue-700 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSpace(hotel.id, space)}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
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
