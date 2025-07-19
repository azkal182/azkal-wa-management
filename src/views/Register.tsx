'use client'

import { useState } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports

// Styled Component Imports
import AuthIllustrationWrapper from '@/components/AuthIllustrationWrapper'

const RegisterV1 = () => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Tambahkan state untuk proses pendaftaran
  const [error, setError] = useState<string | null>(null) // Menangani error

  // Hooks
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null) // Reset error saat submit

    const formData = new FormData(e.target as HTMLFormElement)

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const response = await fetch('https://wa-api.amtsilatipusat.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        // Jika berhasil, arahkan pengguna ke halaman login
        window.location.href = '/login'
      } else {
        // Menampilkan error jika request gagal
        setError(result.message || 'An error occurred')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={'/'} className='flex justify-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography>Make your app management easy and fun!</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <CustomTextField name='name' autoFocus fullWidth label='Name' placeholder='Enter your name' />
            <CustomTextField name='email' fullWidth label='Email' placeholder='Enter your email' />
            <CustomTextField
              name='password'
              fullWidth
              label='Password'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <>
                  <span>I agree to </span>
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    privacy policy & terms
                  </Link>
                </>
              }
            />
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={isSubmitting} // Disable tombol saat proses pendaftaran
            >
              {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Sign Up'}
            </Button>

            {/* Error message */}
            {error && (
              <Typography color='error' align='center' className='mt-2'>
                {error}
              </Typography>
            )}

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href={'/login'} color='primary.main'>
                Sign in instead
              </Typography>
            </div>
            <Divider className='gap-2 text-textPrimary'>or</Divider>
            <div className='flex justify-center items-center gap-1.5'>
              <IconButton className='text-facebook' size='small'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter' size='small'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-textPrimary' size='small'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-error' size='small'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default RegisterV1
