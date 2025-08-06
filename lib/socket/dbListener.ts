import {Client} from 'pg'
import {Server as SocketIOServer} from 'socket.io'

let client: Client

export async function initListener(io: SocketIOServer) {
  const listeners = ['salary_updates', 'points_updates']

  client = new Client({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!),
  })

  await client.connect()
  for (const listener of listeners) {
    await client.query(`LISTEN ${listener}`)
    console.log(`[Postgres] LISTEN ${listener} started`)
  }

  client.on('notification', msg => {
    const payload = JSON.parse(msg.payload || '{}')
    io.emit(msg.channel, payload)
  })

  return client
}

export async function stopListener() {
  await client.end()
}
