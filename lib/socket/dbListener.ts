import {Client} from 'pg'
import {isDemo} from '@/lib/demo'
import {demoDb, getPglite} from '@/lib/demo/db'
import {Server as SocketIOServer} from 'socket.io'

let client: Client

export async function initListener(io: SocketIOServer) {
  const listeners = [
    'salary:update',
    'workers_payrolls:update',
    'workers_requirements:update',
  ]

  if (isDemo) {
    const pg = await getPglite()

    pg.onNotification((channel, payload) => {
      io.emit(channel, JSON.parse(payload || '{}'))
    })

    for (const listener of listeners) {
      await pg.exec(`LISTEN "${listener}"`)
    }

    return demoDb as unknown as Client
  }

  client = new Client({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!),
  })

  await client.connect()
  for (const listener of listeners) {
    await client.query(`LISTEN "${listener}"`)
    console.log(`[Postgres] LISTEN ${listener} started`)
  }

  client.on('notification', msg => {
    const payload = JSON.parse(msg.payload || '{}')
    io.emit(msg.channel, payload)
  })

  return client
}

export async function stopListener() {
  await client?.end()
}
