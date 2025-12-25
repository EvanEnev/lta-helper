import convertTZ from '@/lib/functions/convertTZ'
import {InferSession, InferUser} from 'better-auth'
import db from '@/lib/database'
import {LTWorker} from '@/src/utils/types'
import {cookies} from 'next/headers'

export default async function generateCustomSession({
  user,
  session,
}: {
  user: InferUser<any>
  session: InferSession<any>
}) {
  const cookieStore = await cookies()
  const telegramId =
    Number(cookieStore.get('impersonate')?.value || 'a') ||
    Number(user.email.split('@')[0])

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('dd.MM')

  const query = `SELECT
                   w.name,
                   w.id,
                   w.rank,
                   w.number,
                   w.balance,
                   w.telegram_id,
                   l.name as location,
                   l.id as location_id,
                   ranks.permission_level,
                   w.first_name,
                   w.last_name,
                   w.middle_name,
                   w.phone_number,
                   w.email,
                   w.photo_url,
                   admins.location_id as today_location
                 FROM lt_arena.workers w
                        LEFT JOIN lt_arena.ranks ranks ON ranks.name = w.rank
                        LEFT JOIN lt_arena.locations l ON l.id = w.location_id
                        LEFT JOIN lt_arena.admins admins ON admins.worker_id=w.id AND admins.date='${date}'
                 WHERE telegram_id = ${telegramId}`

  const permissionsQuery = `SELECT
        pm.name, description, pm.id
    FROM lt_arena.permissions pm
           LEFT JOIN lt_arena.workers w ON telegram_id=${telegramId}
           LEFT JOIN lt_arena.default_permissions dp ON (SELECT weight FROM lt_arena.ranks WHERE id = dp.rank_id) <= (SELECT weight FROM lt_arena.ranks WHERE name = w.rank)
           LEFT JOIN lt_arena.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires > NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  const result = await db.query(query)
  const permissionsResult = await db.query(permissionsQuery)

  const permissions = permissionsResult.rows
  const workerResult = result.rows[0] || {}

  const worker: LTWorker = {
    name: workerResult.name,
    id: workerResult.id,
    balance: workerResult.balance,
    telegramId: workerResult.telegram_id,
    rank: workerResult.rank,
    firstName: workerResult.first_name,
    lastName: workerResult.last_name,
    middleName: workerResult.middle_name,
    phoneNumber: workerResult.phone_number,
    photoUrl: workerResult.photo_url,
    locationId: workerResult.location_id,
    location: workerResult.location,
    permissions,
    email: workerResult.email,
  }

  if (workerResult?.today_location) {
    worker.locationId = workerResult?.today_location
  }

  const trueIdQuery = `select id from lt_arena.workers where telegram_id = ${Number(user.email.split('@')[0])}`
  const trueIdResult = await db.query(trueIdQuery)
  const trueId = trueIdResult.rows[0]?.id

  return {
    user: {...user, ...worker, trueId},
    session,
  }
}
