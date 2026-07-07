import axios from 'axios'

function createApi(baseURL) {
  const instance = axios.create({ baseURL })

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

export const authApi = createApi(import.meta.env.VITE_AUTH_API_URL)
export const patientsApi = createApi(import.meta.env.VITE_PATIENTS_API_URL)
export const personnelApi = createApi(import.meta.env.VITE_PERSONNEL_API_URL)
export const consultationsApi = createApi(import.meta.env.VITE_CONSULTATIONS_API_URL)
export const statsApi = createApi(import.meta.env.VITE_STATS_API_URL)
export const hopitauxApi = createApi(import.meta.env.VITE_HOPITAUX_API_URL)
