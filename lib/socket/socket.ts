import {DefaultEventsMap, Server} from 'socket.io'
import {initListener} from './dbListener'
import updateSalary from './functions/updateSalary'

export default async function socket(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
  const client = await initListener(io)

  io.on('connection', socket => {
    console.log(`> Socket ${socket.id}`)

    socket.on('update:user_salary', async (data: any) => {
      await updateSalary({data, client})
    })
  })
}
