import convertTZ from '../functions/convertTZ'
import db from '../database'
import type {LTWorker} from '@/src/utils/types'

export async function getData(
  authId: string,
  userId: string,
  impersonate: boolean,
) {
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
                   coalesce(w.is_approved, false) as is_approved,
                   admins.location_id as today_location,
                   jsonb_build_object(
                        'lat', w.lat,
                        'lng', w.lng
                   ) as coords
                 FROM workers w
                        LEFT JOIN ranks r ON r.id = w.rank_id
                        LEFT JOIN locations l ON l.id = w.location_id
                        LEFT JOIN (
                   SELECT * FROM config.admins
                   WHERE date::date = $1
                   order by date desc
                   LIMIT 1
                 ) admins ON admins.worker_id = w.id
                 WHERE ${impersonate ? 'w.id = $2' : 'auth_id = $2 or email = $3'}`

  const permissionsQuery = `SELECT
        pm.name, description, pm.id
    FROM config.permissions pm
           LEFT JOIN workers w ON ${impersonate ? 'w.id = $1' : 'auth_id = $1 or email = $2'}
           LEFT JOIN config.default_permissions dp ON (SELECT weight FROM ranks WHERE id = dp.rank_id) <= (SELECT weight FROM ranks WHERE id = w.rank_id)
           LEFT JOIN relations.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires > NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  const identity: (string | number)[] = impersonate
    ? [Number(authId)]
    : [authId, authId]

  const result = await db.query(query, [date, ...identity])
  const permissionsResult = await db.query(permissionsQuery, identity)

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
    email: workerResult.email || (authId.includes('@') ? authId : null),
    isApproved: workerResult.is_approved,
    coords: workerResult.coords,
  }

  if (workerResult?.today_location) {
    worker.locationId = workerResult?.today_location
  }

  const trueIdResult = await db.query(
    'select id from workers where auth_id = $1 or email = $2',
    [userId, authId],
  )
  const trueId = trueIdResult.rows[0]?.id

  return {worker, trueId}
}
