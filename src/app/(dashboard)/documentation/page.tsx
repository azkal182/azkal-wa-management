// src/app/(dashboard)/documentation/page.tsx
import { Typography, Button, Container, Box } from '@mui/material'

export default function ApiDocs() {
  return (
    <Container maxWidth='lg' className='py-10'>
      <Box className='text-center mb-10'>
        <Typography variant='h3' component='h1' className='font-bold text-gray-800'>
          WhatsApp API Documentation
        </Typography>
        <Typography variant='subtitle1' className='mt-2 text-gray-600'>
          Comprehensive guide for interacting with the WhatsApp API endpoints
        </Typography>
      </Box>

      <Box component='section' className='mb-12'>
        <Typography variant='h4' component='h2' className='mb-4 font-semibold text-gray-700'>
          POST /:sessionId/messages/send
        </Typography>
        <Typography variant='body1' className='mb-4 text-gray-600'>
          Send a message to a WhatsApp number using the API. This endpoint allows you to send text messages to a
          specified WhatsApp JID.
        </Typography>

        <Box className='bg-gray-50 p-6 rounded-lg shadow-sm'>
          <Typography variant='h5' component='h3' className='mb-3 font-medium text-gray-700'>
            Request
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {`POST /:sessionId/messages/send HTTP/1.1
Host: wa-api.amtsilatipusat.com
X-API-Key: your-api-token
Content-Type: application/json

${JSON.stringify(
  {
    jid: '62878333234234@s.whatsapp.net',
    type: 'number',
    message: {
      text: 'Hello, this is a test message'
    }
  },
  null,
  2
)}`}
            </code>
          </pre>

          <Typography variant='h5' component='h3' className='mt-6 mb-3 font-medium text-gray-700'>
            Response (Success)
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {JSON.stringify(
                {
                  key: {
                    remoteJid: '628950xxxxx-1631xxxx@g.us',
                    fromMe: true,
                    id: 'BAE58AXXXXXXXX'
                  },
                  message: {
                    extendedTextMessage: {
                      text: "What's that @62823xxxxx?",
                      contextInfo: {
                        mentionedJid: ['62823xxxxx@s.whatsapp.net']
                      }
                    }
                  },
                  messageTimestamp: '1673018835',
                  status: 'PENDING',
                  participant: '628132xxxxx:78@s.whatsapp.net'
                },
                null,
                2
              )}
            </code>
          </pre>

          <Typography variant='h5' component='h3' className='mt-6 mb-3 font-medium text-gray-700'>
            Response (Error)
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {JSON.stringify(
                {
                  error: 'An error occurred while sending the message'
                },
                null,
                2
              )}
            </code>
          </pre>

          <Typography variant='h6' component='h4' className='mt-6 mb-2 font-medium text-gray-700'>
            Parameters
          </Typography>
          <Box component='ul' className='list-disc pl-5 text-gray-600'>
            <li>
              <strong>jid</strong>: The WhatsApp ID of the recipient (e.g., 62878333234234@s.whatsapp.net)
            </li>
            <li>
              <strong>type</strong>: The type of recipient (e.g., &quot;number&quot;)
            </li>
            <li>
              <strong>message.text</strong>: The text content of the message
            </li>
          </Box>
        </Box>
      </Box>

      <Box component='section' className='mb-12'>
        <Typography variant='h4' component='h2' className='mb-4 font-semibold text-gray-700'>
          GET /:sessionId/messages
        </Typography>
        <Typography variant='body1' className='mb-4 text-gray-600'>
          Retrieve a list of received messages for a given session. This endpoint supports pagination via a limit query
          parameter.
        </Typography>

        <Box className='bg-gray-50 p-6 rounded-lg shadow-sm'>
          <Typography variant='h5' component='h3' className='mb-3 font-medium text-gray-700'>
            Request
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {`GET /:sessionId/messages?limit=500 HTTP/1.1
Host: wa-api.amtsilatipusat.com
X-API-Key: your-api-token`}
            </code>
          </pre>

          <Typography variant='h5' component='h3' className='mt-6 mb-3 font-medium text-gray-700'>
            Response (Success)
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {JSON.stringify(
                {
                  data: [
                    {
                      pkId: 1458,
                      sessionId: 'john',
                      remoteJid: '628132xxxxx@s.whatsapp.net',
                      id: 'BF7DB5EE494FXXXXXXXXXXXXXXXX',
                      key: {
                        id: 'BF7DB5EE494FXXXXXXXXXXXXXXXX',
                        fromMe: true,
                        remoteJid: '6281320761832@s.whatsapp.net'
                      },
                      message: {
                        protocolMessage: {
                          type: 'INITIAL_SECURITY_NOTIFICATION_SETTING_SYNC',
                          initialSecurityNotificationSettingSync: {
                            securityNotificationEnabled: false
                          }
                        }
                      },
                      messageTimestamp: '1673015208',
                      pushName: 'Nothing',
                      status: 2
                    }
                  ],
                  cursor: 1482
                },
                null,
                2
              )}
            </code>
          </pre>

          <Typography variant='h5' component='h3' className='mt-6 mb-3 font-medium text-gray-700'>
            Response (Error)
          </Typography>
          <pre className='bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto'>
            <code>
              {JSON.stringify(
                {
                  error: 'An error occurred while retrieving the message list'
                },
                null,
                2
              )}
            </code>
          </pre>

          <Typography variant='h6' component='h4' className='mt-6 mb-2 font-medium text-gray-700'>
            Query Parameters
          </Typography>
          <Box component='ul' className='list-disc pl-5 text-gray-600'>
            <li>
              <strong>limit</strong>: Maximum number of messages to retrieve (e.g., 500)
            </li>
          </Box>
        </Box>
      </Box>

      <Box className='text-center'>
        <Button
          variant='contained'
          color='primary'
          size='large'
          href='https://www.example.com/docs'
          className='px-6 py-3'
        >
          View Full API Documentation
        </Button>
      </Box>
    </Container>
  )
}
