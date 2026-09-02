import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

function createApi(prefix) {
  const instance = axios.create({ baseURL: `${BASE_URL}${prefix}` })

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('medisys_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('medisys_token')
        localStorage.removeItem('medisys_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export const authApi = createApi('/api/auth')
export const patientsApi = createApi('/api/patients')
export const personnelApi = createApi('/api/personnel')
export const consultationsApi = createApi('/api/consultations')
export const statsApi = createApi('/api/stats')
export const hopitauxApi = createApi('/api/hopitaux')
