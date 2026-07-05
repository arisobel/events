import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Client,
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
  clientService,
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

// busca acento-insensível
const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Ícones inline (o projeto não usa lib de ícones — só SVG inline). Paths do FA Free.
function GroupIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={className} aria-hidden="true">
      <path d="M320 64C355.3 64 384 92.7 384 128C384 163.3 355.3 192 320 192C284.7 192 256 163.3 256 128C256 92.7 284.7 64 320 64zM416 376C416 401 403.3 423 384 435.9L384 528C384 554.5 362.5 576 336 576L304 576C277.5 576 256 554.5 256 528L256 435.9C236.7 423 224 401 224 376L224 336C224 283 267 240 320 240C373 240 416 283 416 336L416 376zM160 96C190.9 96 216 121.1 216 152C216 182.9 190.9 208 160 208C129.1 208 104 182.9 104 152C104 121.1 129.1 96 160 96zM176 336L176 368C176 400.5 188.1 430.1 208 452.7L208 528C208 529.2 208 530.5 208.1 531.7C199.6 539.3 188.4 544 176 544L144 544C117.5 544 96 522.5 96 496L96 439.4C76.9 428.4 64 407.7 64 384L64 352C64 299 107 256 160 256C172.7 256 184.8 258.5 195.9 262.9C183.3 284.3 176 309.3 176 336zM432 528L432 452.7C451.9 430.2 464 400.5 464 368L464 336C464 309.3 456.7 284.4 444.1 262.9C455.2 258.4 467.3 256 480 256C533 256 576 299 576 352L576 384C576 407.7 563.1 428.4 544 439.4L544 496C544 522.5 522.5 544 496 544L464 544C451.7 544 440.4 539.4 431.9 531.7C431.9 530.5 432 529.2 432 528zM480 96C510.9 96 536 121.1 536 152C536 182.9 510.9 208 480 208C449.1 208 424 182.9 424 152C424 121.1 449.1 96 480 96z" />
    </svg>
  )
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.3 220.3 291.7 90.3z" />
    </svg>
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
  // Colapso da lista de hóspedes — no mobile começa fechada; no desktop (md+) sempre visível via CSS
  const [openGuests, setOpenGuests] = useState<Record<number, boolean>>({})
  const [search, setSearch] = useState('')
  // Importar de cliente (cliente raiz → grupo neste evento)
  const [showClientPicker, setShowClientPicker] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoaded, setClientsLoaded] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [busyClientId, setBusyClientId] = useState<number | null>(null)
  const [promotingGroupId, setPromotingGroupId] = useState<number | null>(null)
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

  // Busca: filtra grupos por nome, tipo, líder, telefone/email e nomes dos hóspedes
  const visibleGroups = useMemo(() => {
    const q = normalizeText(search.trim())
    if (!q) return groups
    return groups.filter((group) => {
      const haystack = [
        group.f_name,
        group.f_group_type ?? '',
        group.f_phone ?? '',
        group.f_email ?? '',
        ...group.guests.map((guest) => guest.f_full_name),
      ]
      return haystack.some((value) => normalizeText(value).includes(q))
    })
  }, [groups, search])

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

  const openClientPicker = async () => {
    setShowClientPicker(true)
    setClientSearch('')
    if (!clientsLoaded) {
      try {
        setClients(await clientService.getClients())
        setClientsLoaded(true)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Falha ao carregar clientes')
      }
    }
  }

  const handleImportClient = async (clientId: number) => {
    try {
      setBusyClientId(clientId)
      setError('')
      await clientService.importClientToEvent(clientId, Number(eventId))
      setShowClientPicker(false)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao importar cliente')
    } finally {
      setBusyClientId(null)
    }
  }

  const handlePromoteGroup = async (group: GuestGroup) => {
    if (!window.confirm(`Criar um cliente permanente a partir do grupo "${group.f_name}"? As pessoas serão copiadas para o cadastro raiz.`)) {
      return
    }
    try {
      setPromotingGroupId(group.id)
      setError('')
      await clientService.promoteGroupToClient(group.id)
      setClientsLoaded(false) // força recarregar a lista de clientes no próximo picker
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao promover grupo a cliente')
    } finally {
      setPromotingGroupId(null)
    }
  }

  const visibleClients = useMemo(() => {
    const q = normalizeText(clientSearch.trim())
    if (!q) return clients
    return clients.filter((client) => {
      const haystack = [client.f_name, ...client.persons.map((p) => p.f_full_name)]
      return haystack.some((value) => normalizeText(value).includes(q))
    })
  }, [clients, clientSearch])

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
    // garante que a seção de hóspedes esteja aberta no mobile ao adicionar
    setOpenGuests((current) => ({ ...current, [group.id]: true }))
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
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2 text-sm min-w-0 overflow-x-auto">
            <button
              onClick={() => navigate('/events')}
              className="shrink-0 text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50"
            >
              ← Events
            </button>
            {event && <span className="hidden sm:inline shrink-0 text-slate-500 truncate">{event.f_name}</span>}
            <button
              onClick={() => navigate(`/events/${eventId}/rooms`)}
              className="shrink-0 bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700"
            >
              Rooms
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}/tasks`)}
              className="shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
            >
              Tasks
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openClientPicker}
            title="Importar de cliente"
            aria-label="Importar de cliente"
            className="shrink-0 whitespace-nowrap border border-indigo-200 bg-white text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-50 text-sm flex items-center gap-1.5"
          >
            <GroupIcon className="w-5 h-5 sm:hidden" />
            <span className="hidden sm:inline">Importar de cliente</span>
          </button>
          <button
            onClick={() => setShowGroupForm((current) => !current)}
            title={showGroupForm ? 'Hide group form' : 'New group'}
            aria-label={showGroupForm ? 'Hide group form' : 'New group'}
            className={`shrink-0 whitespace-nowrap bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 text-sm flex items-center gap-1.5 ${
              showGroupForm ? 'ring-2 ring-indigo-300' : ''
            }`}
          >
            {/* mobile: ícone de grupo com "+"; desktop (sm+): texto */}
            <span className="sm:hidden flex items-center gap-0.5">
              <span className="text-base leading-none">+</span>
              <GroupIcon className="w-5 h-5" />
            </span>
            <span className="hidden sm:inline">{showGroupForm ? 'Hide' : '+ New Group'}</span>
          </button>
          </div>
        </div>

        {showClientPicker && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Importar de cliente</h2>
                <p className="text-sm text-gray-500">Cria um grupo neste evento a partir de um cliente do cadastro raiz.</p>
              </div>
              <button
                onClick={() => setShowClientPicker(false)}
                className="text-gray-500 hover:text-gray-800 text-sm"
              >
                Fechar
              </button>
            </div>
            <input
              type="search"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Buscar cliente…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mb-3"
            />
            {!clientsLoaded ? (
              <p className="text-sm text-gray-500 py-4 text-center">Carregando clientes…</p>
            ) : visibleClients.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                {clients.length === 0
                  ? 'Nenhum cliente cadastrado ainda. Cadastre em Clientes, ou promova um grupo existente a cliente.'
                  : 'Nenhum cliente corresponde à busca.'}
              </p>
            ) : (
              <div className="max-h-72 overflow-auto divide-y divide-gray-100">
                {visibleClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 py-2">
                    {client.f_nationality && <Flag code={client.f_nationality} size={18} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{client.f_name}</p>
                      <p className="text-xs text-gray-500">
                        {client.persons.length} pessoa{client.persons.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleImportClient(client.id)}
                      disabled={busyClientId === client.id}
                      className="shrink-0 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50"
                    >
                      {busyClientId === client.id ? 'Importando…' : 'Importar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
          <div className="space-y-4">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.64-3.63A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups or guests…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            {visibleGroups.length === 0 ? (
              <div className="text-center text-gray-500 bg-white rounded-lg shadow p-8 text-sm">
                Nenhum grupo ou hóspede corresponde a “{search}”.
              </div>
            ) : (
            <div className="space-y-6">
            {visibleGroups.map((group) => {
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
                            {group.f_client_id && (
                              <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700" title="Vinculado a um cliente do cadastro raiz">
                                Cliente ✓
                              </span>
                            )}
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

                    <div className="flex flex-nowrap gap-2 overflow-x-auto">
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
                        title="Edit group"
                        aria-label="Edit group"
                        className="shrink-0 whitespace-nowrap bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm flex items-center"
                      >
                        <PencilIcon className="w-4 h-4 sm:hidden" />
                        <span className="hidden sm:inline">Edit group</span>
                      </button>
                      <button
                        onClick={() => startGuestCreate(group)}
                        title="Add guest"
                        aria-label="Add guest"
                        className="shrink-0 whitespace-nowrap bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 text-sm flex items-center"
                      >
                        <span className="sm:hidden flex items-center gap-0.5">
                          <span className="text-base leading-none">+</span>
                          <PersonIcon className="w-4 h-4" />
                        </span>
                        <span className="hidden sm:inline">+ Guest</span>
                      </button>
                      <button
                        onClick={() => startReservationCreate(group)}
                        className="shrink-0 whitespace-nowrap bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 text-sm"
                      >
                        + Reservation
                      </button>
                      {!group.f_client_id && (
                        <button
                          onClick={() => handlePromoteGroup(group)}
                          disabled={promotingGroupId === group.id}
                          title="Salvar como cliente"
                          aria-label="Salvar como cliente"
                          className="shrink-0 whitespace-nowrap bg-amber-50 text-amber-700 px-3 py-2 rounded-md hover:bg-amber-100 text-sm flex items-center disabled:opacity-50"
                        >
                          <GroupIcon className="w-4 h-4 sm:hidden" />
                          <span className="hidden sm:inline">
                            {promotingGroupId === group.id ? 'Salvando…' : '★ Salvar como cliente'}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        title="Delete group"
                        aria-label="Delete group"
                        className="shrink-0 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1a1 1 0 0 0-.96.72L7.42 3H4a1 1 0 0 0 0 2h.09l.66 10.55A2 2 0 0 0 6.74 17.5h6.52a2 2 0 0 0 1.99-1.95L15.91 5H16a1 1 0 1 0 0-2h-3.42l-.37-1.28A1 1 0 0 0 11.25 1h-2.5ZM9 7a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V7Zm3.5 0a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V7Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-200 pt-5">
                    <button
                      type="button"
                      onClick={() => setOpenGuests((current) => ({ ...current, [group.id]: !current[group.id] }))}
                      className="w-full flex items-center justify-between text-left md:cursor-default"
                    >
                      <h3 className="text-sm font-semibold text-gray-900">
                        Guests ({group.guests.length})
                      </h3>
                      <span className={`md:hidden text-gray-400 text-lg leading-none transition-transform ${openGuests[group.id] ? 'rotate-90' : ''}`}>
                        ▸
                      </span>
                    </button>

                    <div className={`${openGuests[group.id] ? 'block' : 'hidden'} md:block`}>
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
        )}
      </div>
    </AdminLayout>
  )
}
