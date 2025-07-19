// lib/api.ts - Axios instance dengan interceptor untuk auto-refresh
import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000
})

// Request interceptor untuk menambah authorization header
api.interceptors.request.use(
  async config => {
    const session = await getSession()

    console.log('🌐 Making API request to:', config.url)
    console.log('🔑 Session exists:', !!session?.user?.accessToken)

    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor untuk handle token expiry
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    console.log('❌ API Error:', error.response?.status, error.response?.statusText)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      console.log('🔄 401 Error detected, attempting to refresh session...')

      try {
        // Trigger a fresh session fetch (which will trigger JWT callback if needed)
        const session = await getSession()

        console.log('🔍 Fresh session obtained:', !!session?.user?.accessToken)

        if (session?.user?.accessToken) {
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${session.user.accessToken}`
          console.log('🔄 Retrying original request with new token...')

          return api(originalRequest)
        } else {
          console.log('❌ No valid session after refresh, redirecting to login')
          await signOut({ callbackUrl: '/login' })
        }
      } catch (refreshError) {
        console.error('❌ Session refresh failed:', refreshError)
        await signOut({ callbackUrl: '/login' })
      }
    }

    return Promise.reject(error)
  }
)

export default api
