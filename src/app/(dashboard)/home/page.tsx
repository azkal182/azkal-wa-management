// app/dashboard/page.tsx - Protected dashboard page
import { redirect } from 'next/navigation'

import DashboardClient from './home-client'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <DashboardClient />
}
