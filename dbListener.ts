import {Client} from 'pg'
import {Server as SocketIOServer} from 'socket.io'

let client: Client

export async function initListener(io: SocketIOServer) {
  client = new Client({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!),
  })

  await client.connect()
  await client.query('LISTEN salary_updates')

  client.on('notification', msg => {
    const payload = JSON.parse(msg.payload || '{}')
    console.log(payload)
    io.emit('salary:update', payload)
  })

  console.log('[Postgres] LISTEN salary_updates started')
  return client
}

export async function stopListener() {
  await client.end()
}
