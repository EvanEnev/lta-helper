import convertTZ from '@/lib/functions/convertTZ'
import {Session, User} from 'better-auth'
import db from '@/lib/database'
import {LTWorker} from '@/src/utils/types'
import {cookies} from 'next/headers'

async function getData(authId: string, userId: string, impersonate: boolean) {
  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('yyyy-MM-dd')

  const query = `SELECT
                   w.name,
                   w.id,
                   r.name as rank,
                   w.number,
                   w.balance,
                   w.telegram_id,
                   l.name as location,
                   l.id as location_id,
                   r.permission_level,
                   w.first_name,
                   w.last_name,
                   w.middle_name,
                   w.phone_number,
                   w.email,
                   w.photo_url,
                   w.is_fired,
                   w.is_former,
--                    w.is_approved,
                   admins.location_id as today_location
                 FROM workers w
                        LEFT JOIN ranks r ON r.id = w.rank_id
                        LEFT JOIN locations l ON l.id = w.location_id
                        LEFT JOIN config.admins admins ON admins.worker_id=w.id AND admins.date='${date}'
                 WHERE ${impersonate ? `w.id = ${authId}` : `auth_id = '${authId}' or email = '${authId}'`}`

  const permissionsQuery = `SELECT
        pm.name, description, pm.id
    FROM config.permissions pm
           LEFT JOIN workers w ON ${impersonate ? `w.id = ${authId}` : `auth_id = '${authId}' or email = '${authId}'`}
           LEFT JOIN config.default_permissions dp ON (SELECT weight FROM ranks WHERE id = dp.rank_id) <= (SELECT weight FROM ranks WHERE id = w.rank_id)
           LEFT JOIN relations.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires > NOW(), true)
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
    permissions:
      workerResult.is_fired || workerResult.is_former ? [] : permissions,
    email: workerResult.email || authId.includes('@') ? authId : null,
    // isApproved: workerResult.is_approved || false,
  }

  if (workerResult?.today_location) {
    worker.locationId = workerResult?.today_location
  }

  const trueIdQuery = `select id from workers where auth_id = '${userId}' or email = '${authId}'`
  const trueIdResult = await db.query(trueIdQuery)
  const trueId = trueIdResult.rows[0]?.id

  return {worker, trueId}
}

export default async function generateCustomSession({
  user,
  session,
}: {
  user: User<any>
  session: Session<any>
}) {
  const cookieStore = await cookies()
  const impersonate = cookieStore.get('impersonate')?.value
  const authId = impersonate || session.userId

  let data = await getData(authId, session.userId, !!impersonate)

  if (!data.worker.id) {
    const email = user.email
    data = await getData(email, session.userId, false)

    if (data.worker.id) {
      const query = `update workers set auth_id = '${session.userId}' where id = ${data.worker.id}`

      await db.query(query)
    }
  }
  return {
    user: {...user, ...data.worker, trueId: data.trueId},
    session,
  }
}
