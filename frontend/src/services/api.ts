import axios from 'axios'

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string
  }

  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }

  if (window.location.hostname.includes('app.github.dev')) {
    const hostname = window.location.hostname.replace(/-\d+\.app\.github\.dev$/, '-8000.app.github.dev')
    return `https://${hostname}`
  }

  return 'http://localhost:8000'
}

const API_BASE_URL = getApiBaseUrl()

console.log('🔗 Backend URL:', API_BASE_URL)
console.log('🌐 Current hostname:', window.location.hostname)

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: number
  f_username: string
  f_email: string
  f_is_active: string
  f_created_at: string
  roles: string[]
}

export interface Hotel {
  id: number
  f_name: string
  f_trade_name: string | null
  f_document?: string | null
  f_phone?: string | null
  f_email?: string | null
  f_address?: string | null
  f_city: string | null
  f_state: string | null
  f_country: string | null
  f_notes?: string | null
  f_is_active: string
  f_created_at: string
  f_updated_at: string
}

export interface HotelCreate {
  f_name: string
  f_trade_name?: string
  f_city?: string
  f_state?: string
  f_country?: string
  f_notes?: string
}

export interface HotelUpdate {
  f_name?: string
  f_trade_name?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_address?: string
  f_city?: string
  f_state?: string
  f_country?: string
  f_notes?: string
  f_is_active?: string
}

export interface HotelRoom {
  id: number
  f_hotel_id: number
  f_room_number: string
  f_room_type: string | null
  f_room_type_label?: string | null
  f_floor: string | null
  f_block: string | null
  f_capacity: number
  f_price_per_night?: string | null
  f_status: string
  f_notes?: string | null
}

export interface HotelRoomCreate {
  f_room_number: string
  f_room_type?: string
  f_room_type_label?: string
  f_floor?: string
  f_block?: string
  f_capacity: number
  f_price_per_night?: string | number
  f_notes?: string
}

export interface HotelRoomUpdate {
  f_room_number?: string
  f_room_type?: string
  f_room_type_label?: string
  f_floor?: string
  f_block?: string
  f_capacity?: number
  f_price_per_night?: string | number
  f_status?: string
  f_notes?: string
}

export interface HotelSpace {
  id: number
  f_hotel_id: number
  f_name: string
  f_space_type: string
  f_capacity?: number | null
  f_floor?: string | null
  f_block?: string | null
  f_notes?: string | null
  f_is_active: string
}

export interface HotelSpaceCreate {
  f_name: string
  f_space_type: string
  f_capacity?: number
  f_floor?: string
  f_block?: string
  f_notes?: string
}

export interface HotelSpaceUpdate {
  f_name?: string
  f_space_type?: string
  f_capacity?: number
  f_floor?: string
  f_block?: string
  f_notes?: string
  f_is_active?: string
}

export interface Event {
  id: number
  f_hotel_id: number
  f_name: string
  f_event_type: string | null
  f_start_date: string
  f_end_date: string
  f_expected_guests?: number | null
  f_expected_families?: number | null
  f_is_entry_default: boolean
  f_notes?: string | null
  f_status: string
  f_created_at: string
  f_updated_at: string
}

export interface EventCreate {
  f_hotel_id: number
  f_name: string
  f_event_type?: string
  f_start_date: string
  f_end_date: string
  f_expected_guests?: number
  f_expected_families?: number
  f_is_entry_default?: boolean
  f_notes?: string
}

export interface EventUpdate {
  f_name?: string
  f_event_type?: string
  f_start_date?: string
  f_end_date?: string
  f_status?: string
  f_expected_guests?: number
  f_expected_families?: number
  f_is_entry_default?: boolean
  f_notes?: string
}

export interface Task {
  id: number
  f_event_id: number
  f_title: string
  f_description: string | null
  f_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  f_priority: 'low' | 'medium' | 'high'
  f_task_type: string | null
  f_space_id?: number | null
  space_name?: string | null
  f_created_at: string
}

export interface TaskCreate {
  f_title: string
  f_description?: string
  f_priority: 'low' | 'medium' | 'high'
  f_task_type?: string
  f_space_id?: number | null
}

export interface TaskComment {
  id: number
  f_task_id: number
  f_comment: string
  f_staff_member_id: number | null
  f_created_at: string
}

export interface TaskCommentCreate {
  f_comment: string
}

export interface Reservation {
  id: number
  f_event_id: number
  f_group_id: number
  f_start_date: string
  f_end_date: string
  f_package_type: string | null
  f_status: string
  f_total_guests: number | null
  f_amount_total: string | number | null
  f_amount_paid: string | number
  f_payment_status: PaymentStatus
  f_payment_notes: string | null
  f_notes: string | null
}

export interface ReservationCreate {
  f_start_date: string
  f_end_date: string
  f_package_type?: string
  f_status?: string
  f_total_guests?: number
  f_notes?: string
}

export interface ReservationUpdate {
  f_start_date?: string
  f_end_date?: string
  f_package_type?: string
  f_status?: string
  f_total_guests?: number
  f_amount_total?: string | number
  f_amount_paid?: string | number
  f_payment_status?: PaymentStatus
  f_payment_notes?: string
  f_notes?: string
}

export interface ReservationExtra {
  id: number
  f_reservation_id: number
  f_description: string
  f_amount: string | number
  f_notes: string | null
}

export interface ReservationExtraCreate {
  f_description: string
  f_amount: string | number
  f_notes?: string
}

export interface Payment {
  id: number
  f_reservation_id: number
  f_amount: string | number
  f_paid_at: string
  f_method: string | null
  f_notes: string | null
}

export interface PaymentCreate {
  f_amount: string | number
  f_paid_at?: string
  f_method?: string
  f_notes?: string
}

export type GuestGender = 'male' | 'female'
export type GuestType = 'adult' | 'child' | 'infant' | 'staff'

export const GUEST_GENDER_OPTIONS: Array<{ value: GuestGender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const GUEST_TYPE_OPTIONS: Array<{ value: GuestType; label: string }> = [
  { value: 'adult', label: 'Adult' },
  { value: 'child', label: 'Child' },
  { value: 'infant', label: 'Infant' },
  { value: 'staff', label: 'Staff' },
]

export interface Guest {
  id: number
  f_group_id: number
  f_person_id: number | null
  f_full_name: string
  f_gender: string | null
  f_birth_date: string | null
  f_document: string | null
  f_phone: string | null
  f_email: string | null
  f_guest_type: string | null
  f_is_group_leader: boolean
  f_notes: string | null
}

export interface GuestCreate {
  f_full_name: string
  f_gender?: GuestGender | ''
  f_birth_date?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_guest_type?: GuestType | ''
  f_is_group_leader?: boolean
  f_notes?: string
}

export interface GuestUpdate {
  f_full_name?: string
  f_gender?: GuestGender | ''
  f_birth_date?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_guest_type?: GuestType | ''
  f_is_group_leader?: boolean
  f_notes?: string
}

export interface GuestGroup {
  id: number
  f_event_id: number
  f_client_id: number | null
  f_name: string
  f_group_type: string | null
  f_nationality: string | null
  f_phone: string | null
  f_email: string | null
  f_notes: string | null
  guests: Guest[]
  reservations: Reservation[]
}

export interface GuestGroupCreate {
  f_name: string
  f_group_type?: string
  f_nationality?: string
  f_phone?: string
  f_email?: string
  f_notes?: string
}

export interface GuestGroupUpdate {
  f_name?: string
  f_group_type?: string
  f_nationality?: string
  f_phone?: string
  f_email?: string
  f_notes?: string
}

export interface RoomAllocation {
  id: number
  f_reservation_id: number
  f_room_id: number
  f_start_date: string
  f_end_date: string
  f_checkin_status: string
  f_checkout_status: string
  f_notes: string | null
}

export interface RoomAllocationCreate {
  f_reservation_id: number
  f_room_id: number
  f_start_date: string
  f_end_date: string
  f_notes?: string
}

export interface RoomAllocationUpdate {
  f_room_id?: number
  f_start_date?: string
  f_end_date?: string
  f_checkin_status?: string
  f_checkout_status?: string
  f_notes?: string
}

// Finance module types
export type PaymentStatus = 'pending' | 'partial' | 'paid'

export interface RoomGridAllocation {
  allocation_id: number
  reservation_id: number
  group_id: number
  group_name: string
  group_nationality?: string | null
  f_start_date: string
  f_end_date: string
  f_payment_status: PaymentStatus
  f_checkin_status: string
}

export interface RoomGridRoom {
  room_id: number
  f_room_number: string
  f_room_type: string | null
  f_room_type_label: string | null
  f_floor: string | null
  f_block: string | null
  f_capacity: number
  f_price_per_night: string | number | null
  f_base_price_per_night: string | number | null
  f_has_event_price: boolean
  allocations: RoomGridAllocation[]
}

export interface EventRoomPrice {
  id: number
  f_event_id: number
  f_room_id: number
  f_price_per_night: string | number
}

export interface RoomGrid {
  event_id: number
  event_name: string
  f_start_date: string
  f_end_date: string
  rooms: RoomGridRoom[]
}

export interface FinancialSummary {
  event_id: number
  total_rooms: number
  event_nights: number
  allocated_room_nights: number
  occupancy_rate: number
  reservation_count: number
  contracted_revenue: string | number
  expected_revenue: string | number
  received_amount: string | number
  pending_amount: string | number
  reservations_by_payment_status: Record<string, number>
}

export interface InvoiceReservation {
  reservation_id: number
  f_start_date: string
  f_end_date: string
  f_status: string
  f_payment_status: PaymentStatus
  f_amount_total: string | number | null
  extras_total: string | number
  grand_total: string | number | null
  f_amount_paid: string | number
  balance: string | number | null
  calculated_total: string | number | null
}

export interface GroupInvoice {
  event_id: number
  group_id: number
  group_name: string
  reservations: InvoiceReservation[]
  total_amount: string | number
  total_paid: string | number
  balance: string | number
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)

    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}

// ---- Admin (usuários & papéis) ----
export interface Role {
  id: number
  f_name: string
  f_notes: string | null
}

export interface AdminUserCreate {
  f_username: string
  f_email?: string
  password: string
}

export const adminService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/auth/users')
    return response.data
  },

  async getRoles(): Promise<Role[]> {
    const response = await api.get<Role[]>('/auth/roles')
    return response.data
  },

  async createUser(user: AdminUserCreate): Promise<User> {
    const response = await api.post<User>('/auth/users', user)
    return response.data
  },

  async assignRole(userId: number, roleId: number): Promise<User> {
    const response = await api.post<User>(`/auth/users/${userId}/roles/${roleId}`)
    return response.data
  },

  async removeRole(userId: number, roleId: number): Promise<User> {
    const response = await api.delete<User>(`/auth/users/${userId}/roles/${roleId}`)
    return response.data
  },
}

export const hotelService = {
  async getHotels(): Promise<Hotel[]> {
    const response = await api.get<Hotel[]>('/hotels')
    return response.data
  },

  async getHotel(id: number): Promise<Hotel> {
    const response = await api.get<Hotel>(`/hotels/${id}`)
    return response.data
  },

  async createHotel(hotel: HotelCreate): Promise<Hotel> {
    const response = await api.post<Hotel>('/hotels', hotel)
    return response.data
  },

  async updateHotel(id: number, hotel: HotelUpdate): Promise<Hotel> {
    const response = await api.put<Hotel>(`/hotels/${id}`, hotel)
    return response.data
  },

  async getHotelRooms(hotelId: number): Promise<HotelRoom[]> {
    const response = await api.get<HotelRoom[]>(`/hotels/${hotelId}/rooms`)
    return response.data
  },

  async createHotelRoom(hotelId: number, room: HotelRoomCreate): Promise<HotelRoom> {
    const response = await api.post<HotelRoom>(`/hotels/${hotelId}/rooms`, room)
    return response.data
  },

  async updateHotelRoom(
    hotelId: number,
    roomId: number,
    room: HotelRoomUpdate,
  ): Promise<HotelRoom> {
    const response = await api.put<HotelRoom>(`/hotels/${hotelId}/rooms/${roomId}`, room)
    return response.data
  },

  async getHotelSpaces(hotelId: number): Promise<HotelSpace[]> {
    const response = await api.get<HotelSpace[]>(`/hotels/${hotelId}/spaces`)
    return response.data
  },

  async createHotelSpace(hotelId: number, space: HotelSpaceCreate): Promise<HotelSpace> {
    const response = await api.post<HotelSpace>(`/hotels/${hotelId}/spaces`, space)
    return response.data
  },

  async updateHotelSpace(
    hotelId: number,
    spaceId: number,
    space: HotelSpaceUpdate,
  ): Promise<HotelSpace> {
    const response = await api.put<HotelSpace>(`/hotels/${hotelId}/spaces/${spaceId}`, space)
    return response.data
  },

  async deleteHotelSpace(hotelId: number, spaceId: number): Promise<void> {
    await api.delete(`/hotels/${hotelId}/spaces/${spaceId}`)
  },
}

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events')
    return response.data
  },

  async getEvent(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`)
    return response.data
  },

  async createEvent(event: EventCreate): Promise<Event> {
    const response = await api.post<Event>('/events', event)
    return response.data
  },

  async updateEvent(id: number, event: EventUpdate): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, event)
    return response.data
  },
}

export const guestGroupService = {
  async getGroups(eventId: number): Promise<GuestGroup[]> {
    const response = await api.get<GuestGroup[]>(`/events/${eventId}/groups`)
    return response.data
  },

  async getGroup(eventId: number, groupId: number): Promise<GuestGroup> {
    const response = await api.get<GuestGroup>(`/events/${eventId}/groups/${groupId}`)
    return response.data
  },

  async createGroup(eventId: number, group: GuestGroupCreate): Promise<GuestGroup> {
    const response = await api.post<GuestGroup>(`/events/${eventId}/groups`, group)
    return response.data
  },

  async updateGroup(eventId: number, groupId: number, group: GuestGroupUpdate): Promise<GuestGroup> {
    const response = await api.put<GuestGroup>(`/events/${eventId}/groups/${groupId}`, group)
    return response.data
  },

  async deleteGroup(eventId: number, groupId: number): Promise<void> {
    await api.delete(`/events/${eventId}/groups/${groupId}`)
  },
}

export const guestService = {
  async getGuests(eventId: number, groupId: number): Promise<Guest[]> {
    const response = await api.get<Guest[]>(`/events/${eventId}/groups/${groupId}/guests`)
    return response.data
  },

  async getGuest(eventId: number, groupId: number, guestId: number): Promise<Guest> {
    const response = await api.get<Guest>(`/events/${eventId}/groups/${groupId}/guests/${guestId}`)
    return response.data
  },

  async createGuest(eventId: number, groupId: number, guest: GuestCreate): Promise<Guest> {
    const response = await api.post<Guest>(`/events/${eventId}/groups/${groupId}/guests`, guest)
    return response.data
  },

  async updateGuest(
    eventId: number,
    groupId: number,
    guestId: number,
    guest: GuestUpdate,
  ): Promise<Guest> {
    const response = await api.put<Guest>(`/events/${eventId}/groups/${groupId}/guests/${guestId}`, guest)
    return response.data
  },

  async deleteGuest(eventId: number, groupId: number, guestId: number): Promise<void> {
    await api.delete(`/events/${eventId}/groups/${groupId}/guests/${guestId}`)
  },
}

export const reservationService = {
  async getGroupReservations(eventId: number, groupId: number): Promise<Reservation[]> {
    const response = await api.get<Reservation[]>(`/events/${eventId}/groups/${groupId}/reservations`)
    return response.data
  },

  async createReservation(
    eventId: number,
    groupId: number,
    reservation: ReservationCreate,
  ): Promise<Reservation> {
    const response = await api.post<Reservation>(`/events/${eventId}/groups/${groupId}/reservations`, reservation)
    return response.data
  },

  async getReservation(reservationId: number): Promise<Reservation> {
    const response = await api.get<Reservation>(`/reservations/${reservationId}`)
    return response.data
  },

  async updateReservation(reservationId: number, reservation: ReservationUpdate): Promise<Reservation> {
    const response = await api.put<Reservation>(`/reservations/${reservationId}`, reservation)
    return response.data
  },
}

export const roomAllocationService = {
  async createAllocation(allocation: RoomAllocationCreate): Promise<RoomAllocation> {
    const response = await api.post<RoomAllocation>('/room-allocations', allocation)
    return response.data
  },

  async getAllocation(allocationId: number): Promise<RoomAllocation> {
    const response = await api.get<RoomAllocation>(`/room-allocations/${allocationId}`)
    return response.data
  },

  async updateAllocation(
    allocationId: number,
    allocation: RoomAllocationUpdate,
  ): Promise<RoomAllocation> {
    const response = await api.put<RoomAllocation>(`/room-allocations/${allocationId}`, allocation)
    return response.data
  },

  async getReservationAllocations(reservationId: number): Promise<RoomAllocation[]> {
    const response = await api.get<RoomAllocation[]>(`/reservations/${reservationId}/room-allocations`)
    return response.data
  },
}

export const financeService = {
  async getRoomGrid(eventId: number): Promise<RoomGrid> {
    const response = await api.get<RoomGrid>(`/events/${eventId}/room-grid`)
    return response.data
  },

  async getFinancialSummary(eventId: number): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>(`/events/${eventId}/financial-summary`)
    return response.data
  },

  async getGroupInvoice(eventId: number, groupId: number): Promise<GroupInvoice> {
    const response = await api.get<GroupInvoice>(`/events/${eventId}/groups/${groupId}/invoice`)
    return response.data
  },

  async setEventRoomPrice(
    eventId: number,
    roomId: number,
    pricePerNight: string | number,
  ): Promise<EventRoomPrice> {
    const response = await api.put<EventRoomPrice>(
      `/events/${eventId}/room-prices/${roomId}`,
      { f_price_per_night: pricePerNight },
    )
    return response.data
  },

  async deleteEventRoomPrice(eventId: number, roomId: number): Promise<void> {
    await api.delete(`/events/${eventId}/room-prices/${roomId}`)
  },

  async getReservationExtras(reservationId: number): Promise<ReservationExtra[]> {
    const response = await api.get<ReservationExtra[]>(`/reservations/${reservationId}/extras`)
    return response.data
  },

  async createReservationExtra(reservationId: number, extra: ReservationExtraCreate): Promise<ReservationExtra> {
    const response = await api.post<ReservationExtra>(`/reservations/${reservationId}/extras`, extra)
    return response.data
  },

  async deleteReservationExtra(reservationId: number, extraId: number): Promise<void> {
    await api.delete(`/reservations/${reservationId}/extras/${extraId}`)
  },

  async getReservationPayments(reservationId: number): Promise<Payment[]> {
    const response = await api.get<Payment[]>(`/reservations/${reservationId}/payments`)
    return response.data
  },

  async createPayment(reservationId: number, payment: PaymentCreate): Promise<Payment> {
    const response = await api.post<Payment>(`/reservations/${reservationId}/payments`, payment)
    return response.data
  },

  async deletePayment(reservationId: number, paymentId: number): Promise<void> {
    await api.delete(`/reservations/${reservationId}/payments/${paymentId}`)
  },
}

export const taskService = {
  async getTasks(eventId: number): Promise<Task[]> {
    const response = await api.get<Task[]>(`/events/${eventId}/tasks`)
    return response.data
  },

  async createTask(eventId: number, task: TaskCreate): Promise<Task> {
    const response = await api.post<Task>(`/events/${eventId}/tasks`, {
      ...task,
      f_event_id: eventId,
    })
    return response.data
  },

  async updateTaskStatus(taskId: number, status: Task['f_status']): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}/status`, {
      new_status: status,
    })
    return response.data
  },

  async addComment(taskId: number, comment: TaskCommentCreate): Promise<TaskComment> {
    const response = await api.post<TaskComment>(`/tasks/${taskId}/comments`, comment)
    return response.data
  },
}

// ---- Clients (cadastro raiz: cliente/família + pessoas permanentes) ----
export interface Person {
  id: number
  f_client_id: number
  f_full_name: string
  f_gender: string | null
  f_birth_date: string | null
  f_document: string | null
  f_phone: string | null
  f_email: string | null
  f_is_primary: boolean
  f_notes: string | null
}

export interface PersonCreate {
  f_full_name: string
  f_gender?: string
  f_birth_date?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_is_primary?: boolean
  f_notes?: string
}

export type PersonUpdate = Partial<PersonCreate>

export interface Client {
  id: number
  f_name: string
  f_client_type: string | null
  f_nationality: string | null
  f_document: string | null
  f_phone: string | null
  f_email: string | null
  f_notes: string | null
  persons: Person[]
}

export interface ClientCreate {
  f_name: string
  f_client_type?: string
  f_nationality?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_notes?: string
}

export type ClientUpdate = Partial<ClientCreate>

export interface ClientEventLink {
  event_id: number
  event_name: string
  group_id: number
  group_name: string
}

export interface ImportClientToEventResult {
  group_id: number
  persons_imported: number
}

export type LedgerEntryType = 'debit' | 'credit'

export interface LedgerEntryCreate {
  f_entry_type: LedgerEntryType
  f_amount: string | number
  f_date?: string
  f_description: string
  f_notes?: string
}

export interface StatementEntry {
  date: string | null
  entry_type: LedgerEntryType
  amount: string | number
  description: string
  source: 'reservation' | 'payment' | 'manual'
  event_id: number | null
  event_name: string | null
  reservation_id: number | null
  ledger_entry_id: number | null
}

export interface ClientStatement {
  client_id: number
  entries: StatementEntry[]
  total_debit: string | number
  total_credit: string | number
  balance: string | number
}

export interface ClientOpenReservation {
  event_id: number
  event_name: string
  reservation_id: number
  grand_total: string | number
  paid: string | number
  balance: string | number
}

export const clientService = {
  async getClients(search?: string): Promise<Client[]> {
    const response = await api.get<Client[]>('/clients', {
      params: search ? { search } : undefined,
    })
    return response.data
  },

  async getClient(clientId: number): Promise<Client> {
    const response = await api.get<Client>(`/clients/${clientId}`)
    return response.data
  },

  async createClient(client: ClientCreate): Promise<Client> {
    const response = await api.post<Client>('/clients', client)
    return response.data
  },

  async updateClient(clientId: number, client: ClientUpdate): Promise<Client> {
    const response = await api.put<Client>(`/clients/${clientId}`, client)
    return response.data
  },

  async deleteClient(clientId: number): Promise<void> {
    await api.delete(`/clients/${clientId}`)
  },

  async createPerson(clientId: number, person: PersonCreate): Promise<Person> {
    const response = await api.post<Person>(`/clients/${clientId}/persons`, person)
    return response.data
  },

  async updatePerson(clientId: number, personId: number, person: PersonUpdate): Promise<Person> {
    const response = await api.put<Person>(`/clients/${clientId}/persons/${personId}`, person)
    return response.data
  },

  async deletePerson(clientId: number, personId: number): Promise<void> {
    await api.delete(`/clients/${clientId}/persons/${personId}`)
  },

  async getClientEvents(clientId: number): Promise<ClientEventLink[]> {
    const response = await api.get<ClientEventLink[]>(`/clients/${clientId}/events`)
    return response.data
  },

  async importClientToEvent(clientId: number, eventId: number): Promise<ImportClientToEventResult> {
    const response = await api.post<ImportClientToEventResult>(
      `/clients/${clientId}/import-to-event/${eventId}`,
    )
    return response.data
  },

  async promoteGroupToClient(groupId: number): Promise<Client> {
    const response = await api.post<Client>(`/clients/from-group/${groupId}`)
    return response.data
  },

  async getClientStatement(clientId: number): Promise<ClientStatement> {
    const response = await api.get<ClientStatement>(`/clients/${clientId}/statement`)
    return response.data
  },

  async getOpenReservations(clientId: number): Promise<ClientOpenReservation[]> {
    const response = await api.get<ClientOpenReservation[]>(`/clients/${clientId}/open-reservations`)
    return response.data
  },

  async createLedgerEntry(clientId: number, entry: LedgerEntryCreate): Promise<void> {
    await api.post(`/clients/${clientId}/ledger-entries`, entry)
  },

  async deleteLedgerEntry(clientId: number, entryId: number): Promise<void> {
    await api.delete(`/clients/${clientId}/ledger-entries/${entryId}`)
  },
}

// ---- Schedule (cronograma de atividades do evento) ----
export type ActivityType = 'religioso' | 'refeicao' | 'infantil' | 'palestra' | 'entretenimento' | 'geral'
export type Audience = 'all' | 'men' | 'women' | 'children' | 'youth'

export interface Activity {
  id: number
  f_event_id: number
  f_title: string
  f_activity_type: ActivityType
  f_audience: Audience
  f_space_id?: number | null
  space_name?: string | null
  f_location: string | null
  f_date: string          // YYYY-MM-DD
  f_start_time: string    // HH:MM
  f_end_time: string | null
  f_description: string | null
  f_sort_order: number
  f_created_at: string | null
}

export interface ActivityCreate {
  f_title: string
  f_activity_type: ActivityType
  f_audience: Audience
  f_space_id?: number | null
  f_location?: string | null
  f_date: string
  f_start_time: string
  f_end_time?: string | null
  f_description?: string | null
  f_sort_order?: number
}

export type ActivityUpdate = Partial<ActivityCreate>

export const scheduleService = {
  async getActivities(
    eventId: number,
    params?: { day?: string; activity_type?: ActivityType; audience?: Audience },
  ): Promise<Activity[]> {
    const response = await api.get<Activity[]>(`/events/${eventId}/activities`, { params })
    return response.data
  },

  async createActivity(eventId: number, activity: ActivityCreate): Promise<Activity> {
    const response = await api.post<Activity>(`/events/${eventId}/activities`, activity)
    return response.data
  },

  async updateActivity(activityId: number, activity: ActivityUpdate): Promise<Activity> {
    const response = await api.put<Activity>(`/activities/${activityId}`, activity)
    return response.data
  },

  async deleteActivity(activityId: number): Promise<void> {
    await api.delete(`/activities/${activityId}`)
  },
}

// ---- Staff (colaboradores raiz + engajamento por evento) ----
// Custos (salário) são gated por RBAC no backend: chegam null sem acesso financeiro
export interface Employee {
  id: number
  f_person_id?: number | null
  f_full_name: string
  f_default_role?: string | null
  f_document?: string | null
  f_phone?: string | null
  f_email?: string | null
  f_default_daily_cost?: string | number | null
  f_notes?: string | null
  f_is_active: string
  f_created_at?: string | null
}

export interface EmployeeCreate {
  f_full_name: string
  f_default_role?: string
  f_document?: string
  f_phone?: string
  f_email?: string
  f_default_daily_cost?: string | number | null
  f_notes?: string
  f_person_id?: number | null
}

export type EmployeeUpdate = Partial<EmployeeCreate> & { f_is_active?: string }

export interface StaffAssignment {
  id: number
  f_event_id: number
  f_employee_id: number
  f_role?: string | null
  f_start_date?: string | null
  f_end_date?: string | null
  f_daily_cost?: string | number | null
  f_total_cost?: string | number | null
  f_notes?: string | null
  employee_name?: string | null
  work_days?: number | null
  effective_daily_cost?: string | number | null
  derived_total_cost?: string | number | null
  f_created_at?: string | null
}

export interface StaffAssignmentCreate {
  f_employee_id: number
  f_role?: string
  f_start_date?: string | null
  f_end_date?: string | null
  f_daily_cost?: string | number | null
  f_total_cost?: string | number | null
  f_notes?: string
}

export type StaffAssignmentUpdate = Partial<Omit<StaffAssignmentCreate, 'f_employee_id'>>

export interface LodgeResult {
  group_id: number
  guest_id: number
  created_guest: boolean
}

export const staffService = {
  async getEmployees(search?: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/staff/employees', {
      params: search ? { search } : undefined,
    })
    return response.data
  },

  async createEmployee(employee: EmployeeCreate): Promise<Employee> {
    const response = await api.post<Employee>('/staff/employees', employee)
    return response.data
  },

  async updateEmployee(employeeId: number, employee: EmployeeUpdate): Promise<Employee> {
    const response = await api.put<Employee>(`/staff/employees/${employeeId}`, employee)
    return response.data
  },

  async deleteEmployee(employeeId: number): Promise<void> {
    await api.delete(`/staff/employees/${employeeId}`)
  },

  async getEmployeeAssignments(employeeId: number): Promise<StaffAssignment[]> {
    const response = await api.get<StaffAssignment[]>(`/staff/employees/${employeeId}/assignments`)
    return response.data
  },

  async getEventStaff(eventId: number): Promise<StaffAssignment[]> {
    const response = await api.get<StaffAssignment[]>(`/events/${eventId}/staff`)
    return response.data
  },

  async createAssignment(eventId: number, assignment: StaffAssignmentCreate): Promise<StaffAssignment> {
    const response = await api.post<StaffAssignment>(`/events/${eventId}/staff`, assignment)
    return response.data
  },

  async updateAssignment(assignmentId: number, assignment: StaffAssignmentUpdate): Promise<StaffAssignment> {
    const response = await api.put<StaffAssignment>(`/staff/assignments/${assignmentId}`, assignment)
    return response.data
  },

  async deleteAssignment(assignmentId: number): Promise<void> {
    await api.delete(`/staff/assignments/${assignmentId}`)
  },

  async lodgeEmployee(employeeId: number, eventId: number): Promise<LodgeResult> {
    const response = await api.post<LodgeResult>(`/staff/employees/${employeeId}/lodge/${eventId}`)
    return response.data
  },
}
