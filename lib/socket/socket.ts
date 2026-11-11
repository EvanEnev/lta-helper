import {DefaultEventsMap, Server} from 'socket.io'
import {initListener} from './dbListener'
import {getSocketWorker, guarded} from './authenticate'
import updateSalary from './functions/updateSalary'
import updateWorkersPayrolls from './functions/updateWorkersPayrolls'
import updateRankRequrement from './functions/updateRankRequrement'

export default async function socket(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
  const client = await initListener(io)

  io.use(async (socket, next) => {
    try {
      const worker = await getSocketWorker(socket, client)

      if (!worker) return next(new Error('unauthorized'))

      next()
    } catch (error) {
      console.error('[Socket] auth error', error)
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', socket => {
    console.log(`> Socket ${socket.id}`)

    socket.on(
      'update:user_salary',
      guarded(socket, client, ['edit_salary'], data =>
        updateSalary({data, client}),
      ),
    )

    socket.on(
      'update:workers_payrolls',
      guarded(socket, client, ['edit_payrolls'], data =>
        updateWorkersPayrolls({data, client}),
      ),
    )

    socket.on(
      'update:workers_requirements',
      guarded(socket, client, ['edit_worker_rank'], data =>
        updateRankRequrement({data, client}),
      ),
    )
  })
}
