// app/dashboard/dashboard-client.tsx - Client component untuk dashboard
'use client'

import { useProfile } from '@/hooks/use-auth-api'

export default function HomeClient() {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile()

  if (profileLoading) return <div>Loading...</div>
  if (profileError) return <div>Error loading data.</div>

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>Welcome, {session?.user?.name || session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header> */}

      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-lg shadow mb-6 p-6'>
          <h2 className='text-xl font-semibold mb-4 text-gray-900'>Profile Information</h2>
          {profileLoading ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
              <span className='text-gray-600'>Loading profile...</span>
            </div>
          ) : profile ? (
            <div className='space-y-2'>
              <p className='text-gray-700'>
                {/* @ts-ignore */}
                <strong className='text-gray-900'>ID:</strong> {profile.id}
              </p>
              <p className='text-gray-700'>
                {/* @ts-ignore */}
                <strong className='text-gray-900'>Email:</strong> {profile.email}
              </p>
              <p className='text-gray-700'>
                {/* @ts-ignore */}
                <strong className='text-gray-900'>Name:</strong> {profile.name}
              </p>

              <p className='text-gray-700'>
                {/* @ts-ignore */}
                <strong className='text-gray-900'>Token:</strong> {profile.token}
              </p>
            </div>
          ) : (
            <div className='text-red-500'>Failed to load profile</div>
          )}
        </div>
      </main>
    </div>
  )
}
