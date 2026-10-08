import {createServer} from 'node:http'
import next from 'next'
import {Server} from 'socket.io'
import socket from './lib/socket/socket'
import {stopListener} from './lib/socket/dbListener'

const dev = process.env.NODE_ENV === 'development'

const hostname = process.env.HOSTNAME!
const port = Number(process.env.PORT!)

const app = next({dev, hostname, port, ...(dev && {turbopack: true})})
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  console.log(`[Next.js] Ready on http://${hostname}:${port}`)
  const httpServer = createServer(handler)

  httpServer.keepAliveTimeout = 70000
  httpServer.headersTimeout = 75000

  const io = new Server(httpServer)
  await socket(io)

  httpServer
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`[WebSocker] Ready on port ${port}`)
    })

  let closing = false

  const shutdown = async (signal: string) => {
    if (closing) return
    closing = true

    console.log(`[Server] ${signal}: завершение`)

    setTimeout(() => process.exit(1), 10_000).unref()

    try {
      await io.close()
      await stopListener()
      await app.close()
    } catch (error) {
      console.error('[Server] ошибка при завершении', error)
    }

    process.exit(0)
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
})
