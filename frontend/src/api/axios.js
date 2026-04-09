import axios from 'axios'

const api = axios.create({
  baseURL: 'https://land-system-1.onrender.com/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhumi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bhumi_token')
      localStorage.removeItem('bhumi_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api