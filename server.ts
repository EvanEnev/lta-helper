import {createServer} from 'node:http'
import next from 'next'
import {Server} from 'socket.io'
import socket from './lib/socket/socket'

const dev = process.env.NODE_ENV === 'development'

const hostname = process.env.HOSTNAME!
const port = Number(process.env.PORT!)

const app = next({dev, hostname, port})
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
})
