import {SocketUpdateProps} from '@/src/utils/types'
import authQueryGenerator from '../../../lib/auth/authQueryGenerator'
import authParseWorker from '../../../lib/auth/authParseWorker'
import checkPermissions from '../../../lib/functions/checkPermissions'

export default async function updateWorkersPayrolls({
  data,
  client,
}: SocketUpdateProps) {
  const loggerData: any = {}

  console.debug(data)

  const sessionQuery = `
  select
    "userId"
  from auth.session where token = '${data.auth}'
  order by "createdAt"
  limit 1`

  const sessionResult = await client.query(sessionQuery)
  const userId = sessionResult.rows[0]?.userId

  const userQuery = `select email from auth.user where id = '${userId}'`
  const userResult = await client.query(userQuery)
  const userEmail = userResult.rows[0]?.email

  const telegramId = userEmail?.split('@')[0]

  if (!telegramId) return

  const queries = await authQueryGenerator(telegramId)

  const result = await client.query(queries.worker)
  const permissionsResult = await client.query(queries.permissions)

  const worker = await authParseWorker(result, permissionsResult)

  if (!checkPermissions(['edit_payrolls'], worker)) {
    return
  }

  loggerData.data = data

  const query = `update relations.workers_payrolls
                set value = ${data.value},
                    bonuses = ${data.bonuses || null},
                    location_id = ${data.location_id},
                    external_payment = ${data.external_payment || null}
                where worker_id = ${data.worker_id}
                and payroll_id = ${data.payroll_id}
                `

  loggerData.query = query
  // logger.info('Update user salary', {data: loggerData})
  // console.log(loggerData)

  await client.query(query)
}
