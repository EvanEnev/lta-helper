import {SocketUpdateProps} from '@/src/utils/types'
import {createClient} from '@supabase/supabase-js'
import authQueryGenerator from '../../../lib/auth/authQueryGenerator'
import authParseWorker from '../../../lib/auth/authParseWorker'
import checkPermissions from '../../../lib/functions/checkPermissions'

export default async function updateWorkersPayrolls({
  data,
  client,
}: SocketUpdateProps) {
  const loggerData: any = {}

  const supabase = createClient(
    'https://db.bubenev.su',
    process.env.NEXT_PUBLIC_ANON_KEY!,
  )

  console.debug(data)

  const {data: session} = await supabase.auth.getUser(data.auth)
  const user = session?.user

  if (!user) return

  const queries = await authQueryGenerator(user)

  const result = await client.query(queries.worker)
  const permissionsResult = await client.query(queries.permissions)

  const worker = await authParseWorker(result, permissionsResult)

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return
  }

  console.debug(worker, checkPermissions(['edit_payrolls'], worker))

  loggerData.data = data

  const query = `update lt_arena.workers_payrolls
                set value = ${data.value},
                    bonuses = ${data.bonuses || null},
                    location_id = ${data.location_id}
                where worker_id = ${data.worker_id}
                and payroll_id = ${data.payroll_id}
                `

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  // console.log(loggerData)

  await client.query(query)
}
