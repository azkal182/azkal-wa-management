// lib/force-refresh.ts - Utility untuk force refresh session
'use client'

import { getSession } from 'next-auth/react'

/**
 * Force refresh session dengan memanggil internal endpoint
 * Ini akan trigger JWT callback dan refresh token jika diperlukan
 */
export async function forceRefreshSession() {
  try {
    console.log('🔄 Force refreshing session...')

    // Call the session endpoint directly to trigger refresh
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    })

    if (response.ok) {
      // Get the fresh session
      const session = await getSession()

      console.log('✅ Session force refreshed:', !!session?.user?.accessToken)

      return session
    } else {
      console.error('❌ Failed to force refresh session')

      return null
    }
  } catch (error) {
    console.error('❌ Error force refreshing session:', error)

    return null
  }
}

/**
 * Check apakah token akan expire dalam waktu tertentu
 * @param bufferSeconds - buffer time dalam detik (default: 60)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function willTokenExpireSoon(session: any, bufferSeconds: number = 60): boolean {
  if (!session?.user?.accessToken) return true

  // Kita tidak bisa langsung akses JWT dari client side
  // Jadi kita hanya bisa mengandalkan session refresh otomatis
  // atau implementasi server-side check

  return false
}
