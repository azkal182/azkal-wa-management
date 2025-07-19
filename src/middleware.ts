// middleware.ts - Protect routes
import { auth } from '@/lib/auth'

export default auth(req => {
  // req.auth berisi session object jika user sudah login
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/home')
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')

  // Jika user sudah login dan mencoba akses login page, redirect ke dashboard
  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL('/home', req.nextUrl))
  }

  // Jika user belum login dan mencoba akses dashboard, redirect ke login
  if (!isLoggedIn && isOnDashboard) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  return null
})

export const config = {
  // Matcher untuk menentukan route mana yang akan diprotect
  matcher: ['/home/:path*', '/login']
}
