'use server'

import { revalidatePath } from 'next/cache'

import type { SignInResponse } from 'next-auth/react'

import { signIn, signOut } from '@/lib/auth'

export async function doSocialLogin(formData: FormData): Promise<void> {
  const action = formData.get('action')

  if (typeof action !== 'string') throw new Error('Invalid provider')

  await signIn(action, { redirectTo: '/' })
}

export async function doLogout(): Promise<void> {
  await signOut({ redirectTo: '/' })
}

export async function doCredentialLogin(formData: FormData): Promise<SignInResponse | undefined> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid email or password')
  }

  try {
    const response = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    revalidatePath('/')

    return response
  } catch (err) {
    console.error('Login error:', err)
    throw err
  }
}
