import {createServer} from 'node:http'
import next from 'next'
import {Server} from 'socket.io'
import socket from './lib/socket/socket'

const dev = process.env.NODE_ENV === 'development'
const test = process.env.NODE_ENV === 'test'

let hostname = 'lt.bubenev.su'
let port = 5000

if (dev) {
  port = 3000
  hostname = '127.0.0.1'
} else if (test) {
  port = 5001
  hostname = 'lt-test.bubenev.su'
}

const app = next({dev, hostname, port})
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  console.log(`> Next.js ready on port ${port}`)
  const httpServer = createServer(handler)

  const io = new Server(httpServer)
  await socket(io)

  httpServer
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> WebSocker ready on port ${port}`)
    })
})
