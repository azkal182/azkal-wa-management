// auth.ts - Konfigurasi Auth.js v5
import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

// Fungsi untuk refresh token
// Fungsi untuk refresh token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    console.log('🔄 Attempting to refresh token. Current time:', new Date().toISOString())
    console.log('🔄 Token expires at:', new Date(token.accessTokenExpires).toISOString())

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken
      })
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      console.error('❌ Refresh token failed:', refreshedTokens)
      throw refreshedTokens
    }

    const { tokens } = refreshedTokens

    // Kurangi 30 detik dari expiresIn untuk buffer
    const bufferTime = 30 * 1000 // 30 detik dalam milliseconds
    const expiresInMs = tokens.expiresIn * 1000 // convert ke milliseconds
    const accessTokenExpires = Date.now() + expiresInMs - bufferTime

    console.log('✅ Token refreshed successfully. New expiry:', new Date(accessTokenExpires).toISOString())

    return {
      ...token,
      accessToken: tokens.accessToken,
      accessTokenExpires: accessTokenExpires,
      refreshToken: tokens.refreshToken ?? token.refreshToken,
      error: undefined // Clear any previous errors
    }
  } catch (error) {
    console.error('❌ Error refreshing access token', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          const user = await response.json()

          if (!response.ok) {
            return null
          }

          return {
            id: user.user.id,
            email: user.user.email,
            name: user.user.name,
            accessToken: user.tokens.accessToken,
            refreshToken: user.tokens.refreshToken,
            expiresIn: user.tokens.expiresIn
          }
        } catch (error) {
          console.error('Login error:', error)

          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 hari
  },
  callbacks: {
    // @ts-ignore
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Kurangi 30 detik dari expiresIn untuk buffer
        const bufferTime = 30 * 1000 // 30 detik dalam milliseconds
        const expiresInMs = user.expiresIn * 1000 // convert ke milliseconds
        const accessTokenExpires = Date.now() + expiresInMs - bufferTime

        console.log('🔐 Initial login. Token expires at:', new Date(accessTokenExpires).toISOString())

        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: accessTokenExpires
        }
      }

      // Check if there was an error during refresh
      if (token.error === 'RefreshAccessTokenError') {
        console.log('❌ Previous refresh failed, clearing session')

        return { ...token, accessToken: undefined, refreshToken: undefined }
      }

      // Check if token is still valid (add some logging)
      const now = Date.now()
      const timeUntilExpiry = token.accessTokenExpires - now

      console.log('⏰ Time until token expiry:', Math.round(timeUntilExpiry / 1000), 'seconds')

      // Return previous token jika access token belum expired
      if (now < token.accessTokenExpires) {
        return token
      }

      // Access token expired, refresh it
      console.log('🔄 Token expired, attempting refresh...')

      console.log(JSON.stringify(token, null, 2))

      return refreshAccessToken(token)
    },

    // @ts-ignore
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken

        // Jika ada error refresh token, session menjadi invalid
        if (token.error === 'RefreshAccessTokenError') {
          console.log('❌ Session invalid due to refresh error')

          return null
        }
      }

      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})
