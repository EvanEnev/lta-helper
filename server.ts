import {createServer} from 'node:http'
import next from 'next'
import {Server} from 'socket.io'
import {initListener} from './dbListener'
import {DateTime} from 'luxon'

const dev = process.env.NODE_ENV === 'development'
const test = process.env.NODE_ENV === 'test'

let hostname = 'lt.bubenev.su'
let port = 5000

if (dev) {
  port = 80
  hostname = '127.0.0.1'
} else if (test) {
  port = 5001
  hostname = 'lt-test.bubenev.su'
}

const app = next({dev, hostname, port, turbopack: dev})
const handler = app.getRequestHandler()

app.prepare().then(async () => {
  console.log(`> Next.js ready on port ${port}`)
  const httpServer = createServer(handler)

  const io = new Server(httpServer)
  const client = await initListener(io)

  io.on('connection', socket => {
    console.log(`> Socket ${socket.id}`)

    socket.on('update:user_salary', async (data: any) => {
      console.log(data)
      const date = DateTime.fromISO(data.date)

      const overworkStart =
        data.overwork_start === null ? 'NULL' : `'${data.overwork_start}'`

      const overworkEnd =
        data.overwork_end === null ? 'NULL' : `'${data.overwork_end}'`

      const query = `UPDATE lt_arena.salary
                SET
                    value = ${data.value},
                    bonuses = '${data.bonuses}',
                    fines = '${data.fines}',
                    comment = '${data.comment}',
                    start_time = '${data.start_time}',
                    end_time = '${data.end_time}',
                    updated_by = ${data.updated_by},
                    overwork_start = ${overworkStart},
                    overwork_end = ${overworkEnd},
                    overwork = ${data.overwork || 'NULL'}
                WHERE
                    date = '${date.toFormat('yyyy-MM-dd')}'
                    AND worker_id = ${data.worker_id}
                    AND location_id = (SELECT id FROM lt_arena.locations WHERE name = '${data.location.name}')
                `
      console.log(query)
      await client.query(query)
    })
  })

  httpServer
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> WebSocker ready on port ${port}`)
    })
})
