import 'dotenv/config'
import {createServer, request} from 'node:http'
import {Server} from 'socket.io'
import {SalaryData} from '@/src/utils/types'
import {initListener} from '@/lib/dbListener'
import {DateTime} from 'luxon'

const port = 4000
const dev = process.env.NODE_ENV !== 'production'
const test = process.env.NODE_ENV === 'test'

const hostname = dev
  ? 'http://127.0.0.1'
  : test
    ? 'https://lt-test.bubenev.su'
    : 'https://lt.bubenev.su'

async function startSocketServer() {
  const httpServer = createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: hostname,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  const client = await initListener(io)

  io.on('connection', socket => {
    console.log(`> Socket ${socket.id}`)

    socket.on('update:user_salary', async (data: SalaryData) => {
      console.log(data)
      const date = DateTime.fromISO(data.date)

      const overworkStart =
        data.overwork_start === 'NULL' ? 'NULL' : `'${data.overwork_start}'`

      const overworkEnd =
        data.overwork_end === 'NULL' ? 'NULL' : `'${data.overwork_end}'`

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
      console.log(`> WebSocket ready on port ${port}`)
    })
}

startSocketServer().catch(err => {
  console.error(err.message)
  process.exit(1)
})
