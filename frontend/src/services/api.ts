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

export interface Event {
  id: number
  f_hotel_id: number
  f_name: string
  f_event_type: string | null
  f_start_date: string
  f_end_date: string
  f_expected_guests?: number | null
  f_expected_families?: number | null
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
  f_created_at: string
}

export interface TaskCreate {
  f_title: string
  f_description?: string
  f_priority: 'low' | 'medium' | 'high'
  f_task_type?: string
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
  f_name: string
  f_group_type: string | null
  f_phone: string | null
  f_email: string | null
  f_notes: string | null
  guests: Guest[]
  reservations: Reservation[]
}

export interface GuestGroupCreate {
  f_name: string
  f_group_type?: string
  f_phone?: string
  f_email?: string
  f_notes?: string
}

export interface GuestGroupUpdate {
  f_name?: string
  f_group_type?: string
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
