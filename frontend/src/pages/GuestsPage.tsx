import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Event,
  Guest,
  GuestCreate,
  GuestGender,
  GuestGroup,
  GuestGroupCreate,
  GuestType,
  GuestGroupUpdate,
  GuestUpdate,
  GUEST_GENDER_OPTIONS,
  GUEST_TYPE_OPTIONS,
  InvoiceReservation,
  Reservation,
  ReservationCreate,
  ReservationUpdate,
  eventService,
  financeService,
  guestGroupService,
  guestService,
  reservationService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'
import CountryPicker from '../components/CountryPicker'
import Flag from '../components/Flag'

const GUEST_GENDER_VALUES = new Set(GUEST_GENDER_OPTIONS.map((option) => option.value))
const GUEST_TYPE_VALUES = new Set(GUEST_TYPE_OPTIONS.map((option) => option.value))
const GUEST_GENDER_LABELS = Object.fromEntries(GUEST_GENDER_OPTIONS.map((option) => [option.value, option.label]))
const GUEST_TYPE_LABELS = Object.fromEntries(GUEST_TYPE_OPTIONS.map((option) => [option.value, option.label]))

// Rótulo discreto acima do campo — o placeholder deixa de ser a única pista após preencher.
// Definido em nível de módulo para não remontar (e perder o foco) a cada render.
function LabeledField({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  )
}

const emptyGuest: GuestCreate = {
  f_full_name: '',
  f_gender: '',
  f_birth_date: '',
  f_document: '',
  f_phone: '',
  f_email: '',
  f_guest_type: '',
  f_is_group_leader: false,
  f_notes: '',
}

export default function GuestsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<Event | null>(null)
  const [groups, setGroups] = useState<GuestGroup[]>([])
  // Financeiro por reserva (do invoice do grupo) — candidato a gate por RBAC no futuro
  const [financeByReservation, setFinanceByReservation] = useState<Record<number, InvoiceReservation>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [creatingGuest, setCreatingGuest] = useState(false)
  const [activeGuestGroupId, setActiveGuestGroupId] = useState<number | null>(null)
  const [activeReservationGroupId, setActiveReservationGroupId] = useState<number | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null)
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null)

  const [newGroup, setNewGroup] = useState<GuestGroupCreate>({
    f_name: '',
    f_group_type: '',
    f_nationality: '',
    f_phone: '',
    f_email: '',
    f_notes: '',
  })
  const [groupEditForm, setGroupEditForm] = useState<GuestGroupUpdate>({})
  const [newGuest, setNewGuest] = useState<GuestCreate>(emptyGuest)
  const [guestEditForm, setGuestEditForm] = useState<GuestUpdate>({})
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
      void loadData()
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
      void loadFinance(groupsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load guest groups')
    } finally {
      setLoading(false)
    }
  }

  // Busca o extrato de cada grupo em paralelo e indexa por reserva (não bloqueia a lista de grupos)
  const loadFinance = async (groupsData: GuestGroup[]) => {
    try {
      const invoices = await Promise.all(
        groupsData.map((group) => financeService.getGroupInvoice(Number(eventId), group.id)),
      )
      const map: Record<number, InvoiceReservation> = {}
      for (const invoice of invoices) {
        for (const res of invoice.reservations) {
          map[res.reservation_id] = res
        }
      }
      setFinanceByReservation(map)
    } catch {
      // financeiro é complementar; se falhar, a lista de grupos segue funcionando
    }
  }

  const resetGuestCreateForm = (makeLeader = false) => {
    setNewGuest({
      ...emptyGuest,
      f_is_group_leader: makeLeader,
    })
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
        f_nationality: newGroup.f_nationality || undefined,
        f_phone: newGroup.f_phone || undefined,
        f_email: newGroup.f_email || undefined,
        f_notes: newGroup.f_notes || undefined,
      })
      setNewGroup({
        f_name: '',
        f_group_type: '',
        f_nationality: '',
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
    if (!window.confirm('Delete this group? This only works if no guests or reservations are attached.')) {
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

  const handleCreateGuest = async (groupId: number, e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuest.f_full_name.trim()) {
      setError('Guest name is required')
      return
    }

    try {
      setCreatingGuest(true)
      setError('')
      await guestService.createGuest(Number(eventId), groupId, {
        ...newGuest,
        f_gender: newGuest.f_gender || undefined,
        f_birth_date: newGuest.f_birth_date || undefined,
        f_document: newGuest.f_document || undefined,
        f_phone: newGuest.f_phone || undefined,
        f_email: newGuest.f_email || undefined,
        f_guest_type: newGuest.f_guest_type || undefined,
        f_notes: newGuest.f_notes || undefined,
      })
      setActiveGuestGroupId(null)
      resetGuestCreateForm()
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create guest')
    } finally {
      setCreatingGuest(false)
    }
  }

  const handleUpdateGuest = async (groupId: number, guestId: number) => {
    try {
      setError('')
      await guestService.updateGuest(Number(eventId), groupId, guestId, {
        ...guestEditForm,
        f_gender: guestEditForm.f_gender || undefined,
        f_birth_date: guestEditForm.f_birth_date || undefined,
        f_document: guestEditForm.f_document || undefined,
        f_phone: guestEditForm.f_phone || undefined,
        f_email: guestEditForm.f_email || undefined,
        f_guest_type: guestEditForm.f_guest_type || undefined,
        f_notes: guestEditForm.f_notes || undefined,
      })
      setEditingGuestId(null)
      setGuestEditForm({})
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update guest')
    }
  }

  const handleDeleteGuest = async (groupId: number, guestId: number) => {
    if (!window.confirm('Delete this guest from the group?')) {
      return
    }

    try {
      setError('')
      await guestService.deleteGuest(Number(eventId), groupId, guestId)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete guest')
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

  const startGuestCreate = (group: GuestGroup) => {
    setActiveGuestGroupId(group.id)
    setEditingGuestId(null)
    resetGuestCreateForm(group.guests.length === 0)
  }

  const startReservationCreate = (group: GuestGroup) => {
    setActiveReservationGroupId(group.id)
    setNewReservation({
      f_start_date: event?.f_start_date || '',
      f_end_date: event?.f_end_date || '',
      f_package_type: '',
      f_status: 'confirmed',
      f_total_guests: Math.max(group.guests.length, 1),
      f_notes: '',
    })
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

  const getGroupLeader = (group: GuestGroup) =>
    group.guests.find((guest) => guest.f_is_group_leader)

  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : '')

  const formatMoney = (value: string | number | null | undefined) => {
    const num = Number(value ?? 0)
    return (Number.isNaN(num) ? 0 : num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800'
      case 'partial':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-rose-100 text-rose-800'
    }
  }

  const normalizeGuestGender = (value: string | null | undefined): GuestGender | '' => {
    const normalized = value?.trim().toLowerCase() ?? ''
    return GUEST_GENDER_VALUES.has(normalized as GuestGender) ? (normalized as GuestGender) : ''
  }

  const normalizeGuestType = (value: string | null | undefined): GuestType | '' => {
    const normalized = value?.trim().toLowerCase() ?? ''
    return GUEST_TYPE_VALUES.has(normalized as GuestType) ? (normalized as GuestType) : ''
  }

  const formatGuestGender = (value: string | null | undefined) => {
    const normalized = normalizeGuestGender(value)
    return normalized ? GUEST_GENDER_LABELS[normalized as keyof typeof GUEST_GENDER_LABELS] : value || ''
  }

  const formatGuestType = (value: string | null | undefined) => {
    const normalized = normalizeGuestType(value)
    return normalized ? GUEST_TYPE_LABELS[normalized as keyof typeof GUEST_TYPE_LABELS] : value || ''
  }

  const getReservationGuestWarning = (reservationTotal: number | null | undefined, registeredGuests: number) => {
    if (reservationTotal == null || reservationTotal >= registeredGuests) {
      return null
    }

    return `Inconsistency: reservation total (${reservationTotal}) is lower than guests registered in the group (${registeredGuests}).`
  }

  const renderGuestFormFields = (
    guest: GuestCreate | GuestUpdate,
    onChange: (field: keyof GuestCreate, value: string | boolean) => void,
  ) => (
    <>
      <input
        type="text"
        placeholder="Guest full name *"
        value={(guest.f_full_name as string | undefined) ?? ''}
        onChange={(e) => onChange('f_full_name', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
        required
      />
      <select
        value={normalizeGuestType((guest.f_guest_type as string | undefined) ?? '')}
        onChange={(e) => onChange('f_guest_type', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
      >
        <option value="">Guest type</option>
        {GUEST_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={normalizeGuestGender((guest.f_gender as string | undefined) ?? '')}
        onChange={(e) => onChange('f_gender', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
      >
        <option value="">Gender</option>
        {GUEST_GENDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={(guest.f_birth_date as string | undefined) ?? ''}
        onChange={(e) => onChange('f_birth_date', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Document"
        value={(guest.f_document as string | undefined) ?? ''}
        onChange={(e) => onChange('f_document', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Phone"
        value={(guest.f_phone as string | undefined) ?? ''}
        onChange={(e) => onChange('f_phone', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="email"
        placeholder="Email"
        value={(guest.f_email as string | undefined) ?? ''}
        onChange={(e) => onChange('f_email', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <input
        type="text"
        placeholder="Notes"
        value={(guest.f_notes as string | undefined) ?? ''}
        onChange={(e) => onChange('f_notes', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />
      <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={Boolean(guest.f_is_group_leader)}
          onChange={(e) => onChange('f_is_group_leader', e.target.checked)}
        />
        Mark as group leader
      </label>
    </>
  )

  return (
    <AdminLayout title="Guests & Reservations">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/events')}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50"
            >
              ← Events
            </button>
            {event && <span className="text-slate-500">{event.f_name}</span>}
            <button
              onClick={() => navigate(`/events/${eventId}/rooms`)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700"
            >
              Rooms
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/tasks`)}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
            >
              Tasks
            </button>
          </div>
          <button
            onClick={() => setShowGroupForm((current) => !current)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            {showGroupForm ? 'Hide Group Form' : '+ New Group'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showGroupForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create guest group</h2>
            <form onSubmit={handleCreateGroup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledField label="Group name *">
                <input
                  type="text"
                  placeholder="e.g. Familia Zellerkraut"
                  value={newGroup.f_name}
                  onChange={(e) => setNewGroup((current) => ({ ...current, f_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </LabeledField>
              <LabeledField label="Group type">
                <input
                  type="text"
                  placeholder="e.g. Family"
                  value={newGroup.f_group_type}
                  onChange={(e) => setNewGroup((current) => ({ ...current, f_group_type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Nationality">
                <CountryPicker
                  value={newGroup.f_nationality || ''}
                  onChange={(code) => setNewGroup((current) => ({ ...current, f_nationality: code }))}
                />
              </LabeledField>
              <LabeledField label="Phone">
                <input
                  type="text"
                  placeholder="+55 11 90000-0000"
                  value={newGroup.f_phone}
                  onChange={(e) => setNewGroup((current) => ({ ...current, f_phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Email">
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={newGroup.f_email}
                  onChange={(e) => setNewGroup((current) => ({ ...current, f_email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Notes" className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={newGroup.f_notes}
                  onChange={(e) => setNewGroup((current) => ({ ...current, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
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
            {groups.map((group) => {
              const leader = getGroupLeader(group)

              return (
                <div key={group.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      {editingGroupId === group.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <LabeledField label="Group name *">
                            <input
                              type="text"
                              value={groupEditForm.f_name ?? ''}
                              onChange={(e) => setGroupEditForm((current) => ({ ...current, f_name: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Group type">
                            <input
                              type="text"
                              value={groupEditForm.f_group_type ?? ''}
                              onChange={(e) => setGroupEditForm((current) => ({ ...current, f_group_type: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Nationality">
                            <CountryPicker
                              value={groupEditForm.f_nationality ?? ''}
                              onChange={(code) => setGroupEditForm((current) => ({ ...current, f_nationality: code }))}
                            />
                          </LabeledField>
                          <LabeledField label="Phone">
                            <input
                              type="text"
                              value={groupEditForm.f_phone ?? ''}
                              onChange={(e) => setGroupEditForm((current) => ({ ...current, f_phone: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Email">
                            <input
                              type="email"
                              value={groupEditForm.f_email ?? ''}
                              onChange={(e) => setGroupEditForm((current) => ({ ...current, f_email: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Notes" className="md:col-span-2">
                            <input
                              type="text"
                              value={groupEditForm.f_notes ?? ''}
                              onChange={(e) => setGroupEditForm((current) => ({ ...current, f_notes: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
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
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                              {group.f_nationality && <Flag code={group.f_nationality} size={22} />}
                              {group.f_name}
                            </h2>
                            {group.f_group_type && (
                              <span className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                                {group.f_group_type}
                              </span>
                            )}
                            <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                              {group.guests.length} guest{group.guests.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {leader && <p>Leader: {leader.f_full_name}</p>}
                            {group.f_phone && <p>Phone: {group.f_phone}</p>}
                            {group.f_email && <p>Email: {group.f_email}</p>}
                            {group.f_notes && <p>Notes: {group.f_notes}</p>}
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
                            f_nationality: group.f_nationality || '',
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
                        onClick={() => startGuestCreate(group)}
                        className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 text-sm"
                      >
                        + Guest
                      </button>
                      <button
                        onClick={() => startReservationCreate(group)}
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

                  <div className="mt-5 border-t border-gray-200 pt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Guests ({group.guests.length})
                      </h3>
                    </div>

                    {activeGuestGroupId === group.id && (
                      <form
                        onSubmit={(e) => handleCreateGuest(group.id, e)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4"
                      >
                        {renderGuestFormFields(newGuest, (field, value) =>
                          setNewGuest((current) => ({ ...current, [field]: value })),
                        )}
                        <div className="md:col-span-2 flex gap-2">
                          <button
                            type="submit"
                            disabled={creatingGuest}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {creatingGuest ? 'Saving...' : 'Save guest'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGuestGroupId(null)
                              resetGuestCreateForm()
                            }}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {group.guests.length === 0 ? (
                      <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                        No individual guests registered yet for this group.
                      </div>
                    ) : (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {group.guests.map((guest: Guest) => (
                          <div key={guest.id} className={`rounded-lg border border-gray-200 p-4 ${editingGuestId === guest.id ? 'md:col-span-2 xl:col-span-3' : ''}`}>
                            {editingGuestId === guest.id ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {renderGuestFormFields(guestEditForm, (field, value) =>
                                  setGuestEditForm((current) => ({ ...current, [field]: value })),
                                )}
                                <div className="md:col-span-2 flex gap-2">
                                  <button
                                    onClick={() => handleUpdateGuest(group.id, guest.id)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                  >
                                    Save guest
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGuestId(null)
                                      setGuestEditForm({})
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
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900">{guest.f_full_name}</p>
                                    {guest.f_is_group_leader && (
                                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
                                        Leader
                                      </span>
                                    )}
                                    {guest.f_guest_type && (
                                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                        {formatGuestType(guest.f_guest_type)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    {guest.f_phone && <p>Phone: {guest.f_phone}</p>}
                                    {guest.f_email && <p>Email: {guest.f_email}</p>}
                                    {guest.f_document && <p>Document: {guest.f_document}</p>}
                                    {guest.f_gender && <p>Gender: {formatGuestGender(guest.f_gender)}</p>}
                                    {guest.f_birth_date && <p>Birth date: {formatDate(guest.f_birth_date)}</p>}
                                    {guest.f_notes && <p>Notes: {guest.f_notes}</p>}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingGuestId(guest.id)
                                      setGuestEditForm({
                                        f_full_name: guest.f_full_name,
                                        f_gender: normalizeGuestGender(guest.f_gender),
                                        f_birth_date: guest.f_birth_date || '',
                                        f_document: guest.f_document || '',
                                        f_phone: guest.f_phone || '',
                                        f_email: guest.f_email || '',
                                        f_guest_type: normalizeGuestType(guest.f_guest_type),
                                        f_is_group_leader: guest.f_is_group_leader,
                                        f_notes: guest.f_notes || '',
                                      })
                                    }}
                                    className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGuest(group.id, guest.id)}
                                    className="bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                      {getReservationGuestWarning(newReservation.f_total_guests, group.guests.length) && (
                        <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          {getReservationGuestWarning(newReservation.f_total_guests, group.guests.length)}
                        </div>
                      )}
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
                          <div key={reservation.id} className="rounded-lg border border-gray-200 p-4">
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
                                {getReservationGuestWarning(reservationEditForm.f_total_guests, group.guests.length) && (
                                  <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                    {getReservationGuestWarning(reservationEditForm.f_total_guests, group.guests.length)}
                                  </div>
                                )}
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
                                  {getReservationGuestWarning(reservation.f_total_guests, group.guests.length) && (
                                    <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                      {getReservationGuestWarning(reservation.f_total_guests, group.guests.length)}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatDate(reservation.f_start_date)} - {formatDate(reservation.f_end_date)}
                                    </p>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getReservationStatusColor(reservation.f_status)}`}>
                                      {reservation.f_status}
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    {reservation.f_package_type && <p>Package: {reservation.f_package_type}</p>}
                                    {reservation.f_total_guests ? <p>Total guests: {reservation.f_total_guests}</p> : null}
                                    {group.guests.length > 0 && (
                                      <p>Guests registered in group: {group.guests.length}</p>
                                    )}
                                    {reservation.f_notes && <p>Notes: {reservation.f_notes}</p>}
                                  </div>

                                  {financeByReservation[reservation.id] && (() => {
                                    const fin = financeByReservation[reservation.id]
                                    const balance = Number(fin.balance ?? 0)
                                    return (
                                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-sm">
                                        <span className="text-gray-600">Total geral: <span className="font-semibold text-gray-900">{formatMoney(fin.grand_total)}</span></span>
                                        {Number(fin.extras_total ?? 0) > 0 && (
                                          <span className="text-gray-600">Extras: <span className="font-medium text-gray-900">{formatMoney(fin.extras_total)}</span></span>
                                        )}
                                        <span className="text-gray-600">Pago: <span className="font-medium text-emerald-700">{formatMoney(fin.f_amount_paid)}</span></span>
                                        <span className="text-gray-600">Saldo: <span className={`font-semibold ${balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatMoney(balance)}</span></span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPaymentStatusColor(fin.f_payment_status)}`}>
                                          {fin.f_payment_status}
                                        </span>
                                      </div>
                                    )
                                  })()}
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
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
