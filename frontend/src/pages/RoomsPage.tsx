import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Event,
  GuestGroup,
  HotelRoom,
  RoomAllocation,
  RoomAllocationCreate,
  RoomAllocationUpdate,
  eventService,
  guestGroupService,
  hotelService,
  roomAllocationService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'

export default function RoomsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<Event | null>(null)
  const [groups, setGroups] = useState<GuestGroup[]>([])
  const [rooms, setRooms] = useState<HotelRoom[]>([])
  const [allocationsByReservation, setAllocationsByReservation] = useState<Record<number, RoomAllocation[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAllocationId, setEditingAllocationId] = useState<number | null>(null)
  const [creatingAllocation, setCreatingAllocation] = useState(false)

  const [newAllocation, setNewAllocation] = useState<RoomAllocationCreate>({
    f_reservation_id: 0,
    f_room_id: 0,
    f_start_date: '',
    f_end_date: '',
    f_notes: '',
  })
  const [allocationEditForm, setAllocationEditForm] = useState<RoomAllocationUpdate>({})

  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

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

  const roomMap = useMemo(
    () => Object.fromEntries(rooms.map((room) => [room.id, room])),
    [rooms]
  )

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const eventData = await eventService.getEvent(Number(eventId))
      const [groupsData, roomsData] = await Promise.all([
        guestGroupService.getGroups(Number(eventId)),
        hotelService.getHotelRooms(eventData.f_hotel_id),
      ])

      const reservationIds = groupsData.flatMap((group) => group.reservations.map((reservation) => reservation.id))
      const allocationEntries = await Promise.all(
        reservationIds.map(async (reservationId) => [
          reservationId,
          await roomAllocationService.getReservationAllocations(reservationId),
        ] as const)
      )

      setEvent(eventData)
      setGroups(groupsData)
      setRooms(roomsData)
      setAllocationsByReservation(Object.fromEntries(allocationEntries))

      const firstReservation = groupsData.flatMap((group) => group.reservations)[0]
      const firstRoom = roomsData[0]
      setNewAllocation((current) => ({
        ...current,
        f_reservation_id: current.f_reservation_id || firstReservation?.id || 0,
        f_room_id: current.f_room_id || firstRoom?.id || 0,
        f_start_date: current.f_start_date || firstReservation?.f_start_date || '',
        f_end_date: current.f_end_date || firstReservation?.f_end_date || '',
      }))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load room allocation data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAllocation.f_reservation_id || !newAllocation.f_room_id) {
      setError('Select a reservation and a room')
      return
    }

    try {
      setCreatingAllocation(true)
      setError('')
      await roomAllocationService.createAllocation({
        ...newAllocation,
        f_notes: newAllocation.f_notes || undefined,
      })
      setShowCreateForm(false)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create room allocation')
    } finally {
      setCreatingAllocation(false)
    }
  }

  const handleUpdateAllocation = async (allocationId: number) => {
    try {
      setError('')
      await roomAllocationService.updateAllocation(allocationId, allocationEditForm)
      setEditingAllocationId(null)
      setAllocationEditForm({})
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update room allocation')
    }
  }

  return (
    <AdminLayout title="Room Allocations">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / sub-page navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/events')}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50"
            >
              ← Events
            </button>
            {event && (
              <span className="text-slate-500">{event.f_name}</span>
            )}
            <button
              onClick={() => navigate(`/events/${eventId}/guests`)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              Guests
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/tasks`)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
            >
              Tasks
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/room-grid`)}
              className="bg-amber-500 text-white px-3 py-1.5 rounded-md hover:bg-amber-600"
            >
              📅 Room Grid
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm((current) => !current)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm"
          >
            {showCreateForm ? 'Hide Allocation Form' : '+ New Allocation'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create room allocation</h2>
            <form onSubmit={handleCreateAllocation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newAllocation.f_reservation_id}
                onChange={(e) => {
                  const reservationId = Number(e.target.value)
                  const reservation = reservations.find((item) => item.id === reservationId)
                  setNewAllocation((current) => ({
                    ...current,
                    f_reservation_id: reservationId,
                    f_start_date: reservation?.f_start_date || current.f_start_date,
                    f_end_date: reservation?.f_end_date || current.f_end_date,
                  }))
                }}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value={0}>Select reservation</option>
                {reservations.map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    {reservation.groupName} · {reservation.f_start_date} → {reservation.f_end_date}
                  </option>
                ))}
              </select>
              <select
                value={newAllocation.f_room_id}
                onChange={(e) => setNewAllocation((current) => ({ ...current, f_room_id: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value={0}>Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.f_room_number} · {room.f_status}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newAllocation.f_start_date}
                onChange={(e) => setNewAllocation((current) => ({ ...current, f_start_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="date"
                value={newAllocation.f_end_date}
                onChange={(e) => setNewAllocation((current) => ({ ...current, f_end_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Notes"
                value={newAllocation.f_notes}
                onChange={(e) => setNewAllocation((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingAllocation}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creatingAllocation ? 'Creating...' : 'Create allocation'}
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

        {loading && <div className="text-center text-gray-600 py-12">Loading room allocations...</div>}

        {!loading && reservations.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">No reservations available.</p>
            <p className="text-sm mt-2">Create reservations first before allocating rooms.</p>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-900">Available rooms ({rooms.length})</h2>
              {rooms.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">
                  No hotel rooms found. Go back to Hotels and add rooms first.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <span
                      key={room.id}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      Room {room.f_room_number} · {room.f_status}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900">{group.f_name}</h2>
                <div className="mt-4 space-y-4">
                  {group.reservations.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                      This group has no reservations yet.
                    </div>
                  ) : (
                    group.reservations.map((reservation) => {
                      const allocations = allocationsByReservation[reservation.id] || []

                      return (
                        <div key={reservation.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Reservation #{reservation.id} · {new Date(reservation.f_start_date).toLocaleDateString()} - {new Date(reservation.f_end_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {reservation.f_status}
                                {reservation.f_total_guests ? ` · Guests: ${reservation.f_total_guests}` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowCreateForm(true)
                                setNewAllocation({
                                  f_reservation_id: reservation.id,
                                  f_room_id: rooms[0]?.id || 0,
                                  f_start_date: reservation.f_start_date,
                                  f_end_date: reservation.f_end_date,
                                  f_notes: '',
                                })
                              }}
                              className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md hover:bg-emerald-100 text-sm"
                            >
                              Allocate this reservation
                            </button>
                          </div>

                          {allocations.length === 0 ? (
                            <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                              No room allocations yet.
                            </div>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {allocations.map((allocation) => (
                                <div
                                  key={allocation.id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                                >
                                  {editingAllocationId === allocation.id ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <select
                                        value={allocationEditForm.f_room_id ?? allocation.f_room_id}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_room_id: Number(e.target.value) }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      >
                                        {rooms.map((room) => (
                                          <option key={room.id} value={room.id}>
                                            Room {room.f_room_number}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        type="date"
                                        value={allocationEditForm.f_start_date ?? allocation.f_start_date}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_start_date: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      />
                                      <input
                                        type="date"
                                        value={allocationEditForm.f_end_date ?? allocation.f_end_date}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_end_date: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      />
                                      <select
                                        value={allocationEditForm.f_checkin_status ?? allocation.f_checkin_status}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_checkin_status: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="planned">planned</option>
                                        <option value="checked_in">checked_in</option>
                                        <option value="completed">completed</option>
                                      </select>
                                      <select
                                        value={allocationEditForm.f_checkout_status ?? allocation.f_checkout_status}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_checkout_status: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="planned">planned</option>
                                        <option value="checked_out">checked_out</option>
                                        <option value="completed">completed</option>
                                      </select>
                                      <input
                                        type="text"
                                        value={allocationEditForm.f_notes ?? allocation.f_notes ?? ''}
                                        onChange={(e) => setAllocationEditForm((current) => ({ ...current, f_notes: e.target.value }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                      />
                                      <div className="md:col-span-2 flex gap-2">
                                        <button
                                          onClick={() => handleUpdateAllocation(allocation.id)}
                                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                        >
                                          Save allocation
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingAllocationId(null)
                                            setAllocationEditForm({})
                                          }}
                                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          Room {roomMap[allocation.f_room_id]?.f_room_number || allocation.f_room_id}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {new Date(allocation.f_start_date).toLocaleDateString()} - {new Date(allocation.f_end_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Check-in: {allocation.f_checkin_status} · Check-out: {allocation.f_checkout_status}
                                        </p>
                                        {allocation.f_notes && (
                                          <p className="text-sm text-gray-600 mt-1">Notes: {allocation.f_notes}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingAllocationId(allocation.id)
                                          setAllocationEditForm({
                                            f_room_id: allocation.f_room_id,
                                            f_start_date: allocation.f_start_date,
                                            f_end_date: allocation.f_end_date,
                                            f_checkin_status: allocation.f_checkin_status,
                                            f_checkout_status: allocation.f_checkout_status,
                                            f_notes: allocation.f_notes || '',
                                          })
                                        }}
                                        className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                                      >
                                        Edit allocation
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
