// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'
import type { JWT as DefaultJWT } from '@auth/core/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      accessToken: string
      refreshToken: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    id: string
  }
}
