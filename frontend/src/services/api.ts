import axios from 'axios'

// Detectar automaticamente a URL do backend baseado no ambiente
const getApiBaseUrl = () => {
  // Se estamos em desenvolvimento local
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  
  // Se estamos no Codespaces, usar a mesma base mas porta 8000
  if (window.location.hostname.includes('app.github.dev')) {
    // Substituir qualquer porta (-XXXX) por -8000
    const hostname = window.location.hostname.replace(/-\d+\.app\.github\.dev$/, '-8000.app.github.dev')
    return `https://${hostname}`
  }
  
  // Fallback
  return 'http://localhost:8000'
}

const API_BASE_URL = getApiBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para lidar com erros de autenticação
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
  f_city: string | null
  f_state: string | null
  f_country: string | null
  f_is_active: string
  f_created_at: string
  f_updated_at: string
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

    // Salvar tokens no localStorage
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
}
