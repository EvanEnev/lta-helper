'use server'

import createAdminSupabase from '@/lib/createAdminSupabase'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {LTWorker} from '@/src/utils/types'

export default async function auth(): Promise<LTWorker> {
  const supabase = await createAdminSupabase()

  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user)
    return {
      email: '',
      firstName: '',
      id: 0,
      isFormer: false,
      lastName: '',
      location: '',
      middleName: '',
      name: '',
      permissionLevel: 0,
      permissions: [],
      phoneNumber: '',
      photoUrl: '',
      rank: '',
      telegramId: 0,
      number: 0,
    }

  const telegramId = user?.user_metadata.telegram_id

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('dd.MM')

  const query = `SELECT
                   w.name,
                   w.id,
                   w.rank,
                   w.number,
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
           LEFT JOIN lt_arena.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires < NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  const result = await db.query(query)

  const permissionsResult = await db.query(permissionsQuery)
  const permissions = permissionsResult.rows
  const workerResult = result.rows[0] || {}

  const worker: LTWorker = workerResult

  worker.permissions = permissions
  worker.permissionLevel = workerResult.permission_level

  if (workerResult?.today_location) {
    worker.permissionLevel = 4
  }

  worker.firstName = workerResult.first_name
  worker.lastName = workerResult.last_name
  worker.middleName = workerResult.middle_name
  worker.phoneNumber = workerResult.phone_number
  worker.photoUrl = workerResult.photo_url
  worker.locationId = workerResult.location_id

  return worker
}
