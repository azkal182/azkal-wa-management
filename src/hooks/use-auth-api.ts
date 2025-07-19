// hooks/use-auth-api.ts - Custom hooks untuk API calls
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import api from '@/lib/api'
import { forceRefreshSession } from '@/lib/force-refresh'

// Types
interface User {
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  authorId: string
  author: User
  createdAt: string
}

// Custom hook untuk handle API dengan auto-refresh
export const useAuthenticatedQuery = <T>(queryKey: string[], queryFn: () => Promise<T>, options?: any) => {
  const { data: session } = useSession()

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn()
      } catch (error: any) {
        // Jika 401 dan belum retry, coba force refresh
        if (error.response?.status === 401) {
          console.log('🔄 401 in query, attempting force refresh...')
          const refreshedSession = await forceRefreshSession()

          if (refreshedSession?.user?.accessToken) {
            // Retry query dengan session yang baru
            return await queryFn()
          }
        }

        throw error
      }
    },
    enabled: !!session?.user?.accessToken,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false

      return failureCount < 3
    },
    ...options
  })
}

// Auth hooks
export const useProfile = () => {
  return useAuthenticatedQuery(['profile'], async () => {
    const { data } = await api.get<User>('/api/auth/profile')

    return data?.user
  })
}

type SessionWa = { id: string; status: string }

export const useSessionWhatsapp = () => {
  return useAuthenticatedQuery(['session_wa'], async () => {
    const { data } = await api.get<SessionWa[]>('/api/sessions')

    return data
  })
}

// Posts hooks
export const usePosts = () => {
  return useAuthenticatedQuery(['posts'], async () => {
    const { data } = await api.get<Post[]>('/posts')

    return data
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postData: { title: string; content: string }) => {
      try {
        const { data } = await api.post<Post>('/posts', postData)

        return data
      } catch (error: any) {
        // Jika 401, coba force refresh dan retry
        if (error.response?.status === 401) {
          console.log('🔄 401 in mutation, attempting force refresh...')
          const refreshedSession = await forceRefreshSession()

          if (refreshedSession?.user?.accessToken) {
            // Retry mutation dengan session yang baru
            const { data } = await api.post<Post>('/posts', postData)

            return data
          }
        }

        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      try {
        await api.delete(`/posts/${postId}`)
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('🔄 401 in delete, attempting force refresh...')
          const refreshedSession = await forceRefreshSession()

          if (refreshedSession?.user?.accessToken) {
            await api.delete(`/posts/${postId}`)

            return
          }
        }

        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...postData }: { id: string; title: string; content: string }) => {
      try {
        const { data } = await api.put<Post>(`/posts/${id}`, postData)

        return data
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('🔄 401 in update, attempting force refresh...')
          const refreshedSession = await forceRefreshSession()

          if (refreshedSession?.user?.accessToken) {
            const { data } = await api.put<Post>(`/posts/${id}`, postData)

            return data
          }
        }

        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}
