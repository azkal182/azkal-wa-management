// 'use client'

// import { useEffect, useState } from 'react'

// import { io } from 'socket.io-client'

// import { useCurrentSession } from '@/hooks/use-current-user'

// export default function Page() {
//   const { session } = useCurrentSession()

//   //   console.log(session)

//   const [socket, setSocket] = useState(null)
//   const [isConnected, setIsConnected] = useState(false)

//   useEffect(() => {
//     if (session?.user?.accessToken) {
//       const socketInstance = io('http://localhost:3030', {
//         auth: {
//           token: session?.user?.accessToken
//         },
//         query: {
//           session_id: 'john-xx' // Pastikan session_id ada di query
//         }
//       })

//       socketInstance.on('connect', () => {
//         console.log('Socket.IO connected!')
//         setIsConnected(true)
//       })

//       socketInstance.on('disconnect', () => {
//         console.log('Socket.IO disconnected')
//         setIsConnected(false)
//       })

//       setSocket(socketInstance)

//       return () => {
//         socketInstance.disconnect()
//       }
//     }
//   }, [session]) // Depend on token from context

//   return <h1>About page!</h1>
// }

'use client'
import { useState, useEffect } from 'react'

import { io } from 'socket.io-client'

import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

import { useCurrentSession } from '@/hooks/use-current-user'
import { useSessionWhatsapp } from '@/hooks/use-auth-api'

export default function Page() {
  const { session } = useCurrentSession() // Ambil session dari hook

  const {
    data: sessionWa,
    isLoading: sessionWaLoading,
    isError: sessionWaError,
    refetch: refetchSessionWa
  } = useSessionWhatsapp() // Hook untuk mengambil data session WhatsApp

  const [sessionId, setSessionId] = useState('') // Simpan sessionId
  const [qrCodeMap, setQrCodeMap] = useState({}) // Simpan QR Code berdasarkan sessionId
  const [isConnected, setIsConnected] = useState(false) // Untuk status koneksi WebSocket
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socket, setSocket] = useState(null)

  // Menunggu agar sessionWa terisi sebelum melanjutkan
  useEffect(() => {
    if (!sessionWaLoading && !sessionWaError && sessionWa) {
      console.log('Session Whatsapp data loaded:', sessionWa)

      // Menghubungkan WebSocket untuk setiap sesi yang ada di sessionWa
      //   @ts-ignore
      sessionWa?.forEach(session => {
        connectWebSocket(session.id) // Hubungkan WebSocket untuk setiap sessionId
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionWa, sessionWaLoading, sessionWaError])

  // Function untuk menghubungkan WebSocket per sesi
  //   @ts-ignore
  const connectWebSocket = sessionId => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      auth: {
        token: session?.user?.accessToken // Kirim token JWT ke WebSocket
      },
      query: {
        session_id: sessionId // Kirim sessionId sebagai query
      }
    })

    socketInstance.on('connect', () => {
      console.log(`Socket.IO connected for session ${sessionId}`)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log(`Socket.IO disconnected for session ${sessionId}`)
      setIsConnected(false)
    })

    // Mendengarkan pembaruan QR code dari server melalui WebSocket
    socketInstance.on('qrcode.updated', data => {
      console.log(`QR Code Updated for session ${sessionId}:`, data)
      setQrCodeMap(prev => ({ ...prev, [sessionId]: data.data.qr })) // Update QR Code untuk sessionId tertentu
    })

    // Menangani event connection.update dan memperbarui status session
    socketInstance.on('connection.update', data => {
      refetchSessionWa()
      console.log('Event Data:', data) // Debug data yang diterima
      console.log('Status:', data?.data?.data?.status) // Debug status yang tepat

      // Pastikan data valid sebelum mengakses properti
      if (data && data.data && data.data.data) {
        // Jika status adalah "connected" atau "disconected", hapus QR Code dan update status session
        if (data.event === 'connection.update' && data.data.data.status === 'connected') {
          console.log(`Session ${sessionId} connected. Updating session.`)

          // Hapus QR Code hanya jika sessionId sesuai
          if (sessionId === data.session_id) {
            setQrCodeMap(prev => ({ ...prev, [sessionId]: '' })) // Hapus QR Code untuk session ini
          }

          // Update status pada list sessionWa
          //   @ts-ignore
          const updatedSessions = sessionWa.map(session => {
            if (session.id === data.session_id) {
              return { ...session, status: 'connected' } // Update status ke 'connected'
            }

            return session
          })

          // Simulasikan update data session (Anda bisa menggunakan state atau API untuk menyimpannya)
          console.log('Updated sessions:', updatedSessions)
        }

        // Jika status adalah 'disconected', hapus QR Code dan sessionId
        if (data.event === 'connection.update' && data.data.data.status === 'disconected') {
          console.log(`Session ${data.session_id} disconnected. Removing session.`)

          if (sessionId === data.session_id) {
            setQrCodeMap(prev => ({ ...prev, [sessionId]: '' })) // Hapus QR Code hanya untuk session ini
          }
        }
      } else {
        console.error('Invalid data received:', data) // Log jika data tidak valid
      }
    })

    //   @ts-ignore
    setSocket(socketInstance)
  }

  const handleConnect = async () => {
    try {
      if (!session?.user?.accessToken) {
        console.error('Access token not found')

        return
      }

      // 1. Kirim POST request untuk menambahkan sessionId dan menerima QR Code pertama kali
      if (!sessionId) {
        console.error('Session ID is required')

        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}` // Menambahkan Authorization Bearer
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        throw new Error('Failed to add session')
      }

      const data = await response.json()

      console.log('Session added:', data)

      // Set QR Code pertama kali dari response
      setQrCodeMap(prev => ({ ...prev, [sessionId]: data.qr })) // Set QR Code untuk sessionId yang baru

      // Refetch session data setelah menambahkan session
      refetchSessionWa()

      // 2. Menghubungkan WebSocket untuk session yang baru ditambahkan
      connectWebSocket(sessionId)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  //   @ts-ignore
  const handleAction = sessionId => {
    console.log(`Action triggered for session: ${sessionId}`)

    // Lakukan tindakan sesuai dengan kebutuhan, seperti menghapus atau memperbarui session
  }

  return (
    <div className='p-4'>
      <Typography variant='h4' className='text-center mb-4'>
        WebSocket Connection and QR Code
      </Typography>

      <TextField
        label='Session ID'
        variant='outlined'
        fullWidth
        value={sessionId}
        onChange={e => setSessionId(e.target.value)}
        className='mb-4'
      />

      <Button variant='contained' color='primary' onClick={handleConnect} className='w-full mb-4'>
        Connect to WebSocket
      </Button>

      {isConnected ? <p>Connected to WebSocket!</p> : <p>Waiting for connection...</p>}
      {/* @ts-ignore */}
      {qrCodeMap[sessionId] && (
        <div className='mt-4'>
          <Typography variant='h6'>QR Code</Typography>
          <p>Session ID: {sessionId}</p>
          {/* @ts-ignore */}
          <img src={qrCodeMap[sessionId]} alt='QR Code' className='w-full max-w-xs mx-auto' />
        </div>
      )}

      {/* Menampilkan list session WhatsApp sebagai tabel */}
      <h2 className='mt-6'>Session WhatsApp</h2>
      {sessionWaLoading ? (
        <CircularProgress />
      ) : sessionWaError ? (
        <p>Error fetching session data</p>
      ) : (
        <TableContainer component={Paper} className='mt-4'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* @ts-ignore */}
              {sessionWa?.map(session => (
                <TableRow key={session.id}>
                  <TableCell>{session.id}</TableCell>
                  <TableCell>{session.status}</TableCell>
                  <TableCell>
                    <Button variant='outlined' color='secondary' onClick={() => handleAction(session.id)}>
                      Action
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
