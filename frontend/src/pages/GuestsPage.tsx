import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import {
  Event,
  GuestGroup,
  GuestGroupCreate,
  GuestGroupUpdate,
  Reservation,
  ReservationCreate,
  ReservationUpdate,
  eventService,
  guestGroupService,
  reservationService,
} from '../services/api'

export default function GuestsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [groups, setGroups] = useState<GuestGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [activeReservationGroupId, setActiveReservationGroupId] = useState<number | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null)

  const [newGroup, setNewGroup] = useState<GuestGroupCreate>({
    f_name: '',
    f_group_type: '',
    f_phone: '',
    f_email: '',
    f_notes: '',
  })
  const [groupEditForm, setGroupEditForm] = useState<GuestGroupUpdate>({})
  const [newReservation, setNewReservation] = useState<ReservationCreate>({
    f_start_date: '',
    f_end_date: '',
    f_package_type: '',
    f_status: 'confirmed',
    f_total_guests: 1,
    f_notes: '',
  })
  const [reservationEditForm, setReservationEditForm] = useState<ReservationUpdate>({})

  useEffect(() => {
    if (eventId) {
      loadData()
    }
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [eventData, groupsData] = await Promise.all([
        eventService.getEvent(Number(eventId)),
        guestGroupService.getGroups(Number(eventId)),
      ])
      setEvent(eventData)
      setGroups(groupsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load guest groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroup.f_name.trim()) {
      setError('Group name is required')
      return
    }

    try {
      setCreatingGroup(true)
      setError('')
      await guestGroupService.createGroup(Number(eventId), {
        ...newGroup,
        f_group_type: newGroup.f_group_type || undefined,
        f_phone: newGroup.f_phone || undefined,
        f_email: newGroup.f_email || undefined,
        f_notes: newGroup.f_notes || undefined,
      })
      setNewGroup({
        f_name: '',
        f_group_type: '',
        f_phone: '',
        f_email: '',
        f_notes: '',
      })
      setShowGroupForm(false)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create group')
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleUpdateGroup = async (groupId: number) => {
    try {
      setError('')
      await guestGroupService.updateGroup(Number(eventId), groupId, groupEditForm)
      setEditingGroupId(null)
      setGroupEditForm({})
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm('Delete this group? This only works if no reservations are attached.')) {
      return
    }

    try {
      setError('')
      await guestGroupService.deleteGroup(Number(eventId), groupId)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete group')
    }
  }

  const handleCreateReservation = async (groupId: number, e: React.FormEvent) => {
    e.preventDefault()
    if (!newReservation.f_start_date || !newReservation.f_end_date) {
      setError('Reservation start and end dates are required')
      return
    }

    try {
      setError('')
      await reservationService.createReservation(Number(eventId), groupId, {
        ...newReservation,
        f_package_type: newReservation.f_package_type || undefined,
        f_notes: newReservation.f_notes || undefined,
      })
      setActiveReservationGroupId(null)
      setNewReservation({
        f_start_date: '',
        f_end_date: '',
        f_package_type: '',
        f_status: 'confirmed',
        f_total_guests: 1,
        f_notes: '',
      })
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation')
    }
  }

  const handleUpdateReservation = async (reservationId: number) => {
    try {
      setError('')
      await reservationService.updateReservation(reservationId, reservationEditForm)
      setEditingReservationId(null)
      setReservationEditForm({})
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update reservation')
    }
  }

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guests & Reservations</h1>
              <p className="text-sm text-gray-500 mt-1">
                {event ? `${event.f_name} · event #${event.id}` : 'Loading event...'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/events')}
                className="text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                ← Events
              </button>
              <button
                onClick={() => navigate(`/events/${eventId}/rooms`)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
              >
                Room Allocations
              </button>
              <button
                onClick={() => navigate(`/events/${eventId}/tasks`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Tasks
              </button>
              <button
                onClick={() => setShowGroupForm((current) => !current)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {showGroupForm ? 'Hide Group Form' : '+ New Group'}
              </button>
              <span className="text-sm text-gray-600">{user?.f_username}</span>
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

        {showGroupForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create guest group</h2>
            <form onSubmit={handleCreateGroup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Group name *"
                value={newGroup.f_name}
                onChange={(e) => setNewGroup((current) => ({ ...current, f_name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Group type"
                value={newGroup.f_group_type}
                onChange={(e) => setNewGroup((current) => ({ ...current, f_group_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newGroup.f_phone}
                onChange={(e) => setNewGroup((current) => ({ ...current, f_phone: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={newGroup.f_email}
                onChange={(e) => setNewGroup((current) => ({ ...current, f_email: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Notes"
                value={newGroup.f_notes}
                onChange={(e) => setNewGroup((current) => ({ ...current, f_notes: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creatingGroup ? 'Creating...' : 'Create group'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="text-center text-gray-600 py-12">Loading groups...</div>}

        {!loading && groups.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">No groups yet.</p>
            <p className="text-sm mt-2">Create the first reservation group for this event.</p>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    {editingGroupId === group.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={groupEditForm.f_name ?? ''}
                          onChange={(e) => setGroupEditForm((current) => ({ ...current, f_name: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={groupEditForm.f_group_type ?? ''}
                          onChange={(e) => setGroupEditForm((current) => ({ ...current, f_group_type: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={groupEditForm.f_phone ?? ''}
                          onChange={(e) => setGroupEditForm((current) => ({ ...current, f_phone: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="email"
                          value={groupEditForm.f_email ?? ''}
                          onChange={(e) => setGroupEditForm((current) => ({ ...current, f_email: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={groupEditForm.f_notes ?? ''}
                          onChange={(e) => setGroupEditForm((current) => ({ ...current, f_notes: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
                        />
                        <div className="md:col-span-2 flex gap-2">
                          <button
                            onClick={() => handleUpdateGroup(group.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                          >
                            Save group
                          </button>
                          <button
                            onClick={() => {
                              setEditingGroupId(null)
                              setGroupEditForm({})
                            }}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-semibold text-gray-900">{group.f_name}</h2>
                          {group.f_group_type && (
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                              {group.f_group_type}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {group.f_phone && <p>📞 {group.f_phone}</p>}
                          {group.f_email && <p>✉️ {group.f_email}</p>}
                          {group.f_notes && <p>📝 {group.f_notes}</p>}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingGroupId(group.id)
                        setGroupEditForm({
                          f_name: group.f_name,
                          f_group_type: group.f_group_type || '',
                          f_phone: group.f_phone || '',
                          f_email: group.f_email || '',
                          f_notes: group.f_notes || '',
                        })
                      }}
                      className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Edit group
                    </button>
                    <button
                      onClick={() => {
                        setActiveReservationGroupId(group.id)
                        setNewReservation({
                          f_start_date: event?.f_start_date || '',
                          f_end_date: event?.f_end_date || '',
                          f_package_type: '',
                          f_status: 'confirmed',
                          f_total_guests: 1,
                          f_notes: '',
                        })
                      }}
                      className="bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 text-sm"
                    >
                      + Reservation
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {activeReservationGroupId === group.id && (
                  <form
                    onSubmit={(e) => handleCreateReservation(group.id, e)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4"
                  >
                    <input
                      type="date"
                      value={newReservation.f_start_date}
                      onChange={(e) => setNewReservation((current) => ({ ...current, f_start_date: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="date"
                      value={newReservation.f_end_date}
                      onChange={(e) => setNewReservation((current) => ({ ...current, f_end_date: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Package type"
                      value={newReservation.f_package_type}
                      onChange={(e) => setNewReservation((current) => ({ ...current, f_package_type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Total guests"
                      value={newReservation.f_total_guests ?? ''}
                      onChange={(e) => setNewReservation((current) => ({
                        ...current,
                        f_total_guests: e.target.value ? Number(e.target.value) : undefined,
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      value={newReservation.f_status}
                      onChange={(e) => setNewReservation((current) => ({ ...current, f_status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="confirmed">confirmed</option>
                      <option value="draft">draft</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Notes"
                      value={newReservation.f_notes}
                      onChange={(e) => setNewReservation((current) => ({ ...current, f_notes: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                      >
                        Save reservation
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReservationGroupId(null)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-5 border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Reservations ({group.reservations.length})
                    </h3>
                    <button
                      onClick={() => navigate(`/events/${eventId}/rooms`)}
                      className="text-sm text-emerald-700 hover:text-emerald-900"
                    >
                      Go to allocations →
                    </button>
                  </div>

                  {group.reservations.length === 0 ? (
                    <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                      No reservations yet for this group.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {group.reservations.map((reservation: Reservation) => (
                        <div
                          key={reservation.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          {editingReservationId === reservation.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="date"
                                value={reservationEditForm.f_start_date ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({ ...current, f_start_date: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <input
                                type="date"
                                value={reservationEditForm.f_end_date ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({ ...current, f_end_date: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <input
                                type="text"
                                value={reservationEditForm.f_package_type ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({ ...current, f_package_type: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <input
                                type="number"
                                min={1}
                                value={reservationEditForm.f_total_guests ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({
                                  ...current,
                                  f_total_guests: e.target.value ? Number(e.target.value) : undefined,
                                }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <select
                                value={reservationEditForm.f_status ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({ ...current, f_status: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="confirmed">confirmed</option>
                                <option value="draft">draft</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                              <input
                                type="text"
                                value={reservationEditForm.f_notes ?? ''}
                                onChange={(e) => setReservationEditForm((current) => ({ ...current, f_notes: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <div className="md:col-span-2 flex gap-2">
                                <button
                                  onClick={() => handleUpdateReservation(reservation.id)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                  Save reservation
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReservationId(null)
                                    setReservationEditForm({})
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
                                <div className="flex items-center gap-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(reservation.f_start_date).toLocaleDateString()} - {new Date(reservation.f_end_date).toLocaleDateString()}
                                  </p>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getReservationStatusColor(reservation.f_status)}`}>
                                    {reservation.f_status}
                                  </span>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                  {reservation.f_package_type && <p>Package: {reservation.f_package_type}</p>}
                                  {reservation.f_total_guests ? <p>Total guests: {reservation.f_total_guests}</p> : null}
                                  {reservation.f_notes && <p>Notes: {reservation.f_notes}</p>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingReservationId(reservation.id)
                                    setReservationEditForm({
                                      f_start_date: reservation.f_start_date,
                                      f_end_date: reservation.f_end_date,
                                      f_package_type: reservation.f_package_type || '',
                                      f_status: reservation.f_status,
                                      f_total_guests: reservation.f_total_guests || undefined,
                                      f_notes: reservation.f_notes || '',
                                    })
                                  }}
                                  className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => navigate(`/events/${eventId}/rooms`)}
                                  className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md hover:bg-emerald-100 text-sm"
                                >
                                  Allocate room
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
