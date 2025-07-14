import {createServer} from 'node:http'
import next from 'next'
import {Server} from 'socket.io'
import {initListener} from './dbListener'
import {DateTime} from 'luxon'
import logger from '@/lib/Logger'

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
      const loggerData: any = {}

      loggerData.data = data
      const date = DateTime.fromISO(data.date)

      if (data.delete) {
        const query = `DELETE FROM lt_arena.salary
                WHERE
                    date = '${date.toFormat('yyyy-MM-dd')}'
                    AND worker_id = ${data.worker_id}
                    AND location_id = (SELECT id FROM lt_arena.locations WHERE name = '${data.location.name}')
                `

        loggerData.query = query
        logger.info('Update user salary', {data: loggerData})
        return await client.query(query)
      }

      const overworkStart =
        data.overwork_start === null ? 'NULL' : `'${data.overwork_start}'`

      const overworkEnd =
        data.overwork_end === null ? 'NULL' : `'${data.overwork_end}'`

      const query = `UPDATE lt_arena.salary
                SET
                  ${data.newDate ? `date = '${data.newDate}',` : ''}
                    ${data.newLocation ? `location_id = (SELECT id FROM lt_arena.locations WHERE id = ${data.newLocation.id}),` : ''}
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
                    AND location_id = (SELECT id FROM lt_arena.locations WHERE id = '${data.location.id}')
                `

      loggerData.query = query
      logger.info('Update user salary', {data: loggerData})
      await client.query(query)
    })
  })

  httpServer
    .once('error', err => {
      logger.error('Server error', {data: err})
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> WebSocker ready on port ${port}`)
    })
})
