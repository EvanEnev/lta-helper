'use server'

import convertTZ from '../functions/convertTZ'

export default async function authQueryGenerator(
  id: number,
): Promise<{worker: string; permissions: string}> {
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
                   r.permission_level,
                   w.first_name,
                   w.last_name,
                   w.middle_name,
                   w.phone_number,
                   w.email,
                   w.photo_url,
                   admins.location_id as today_location,
                    coalesce(is_approved, false) as "isApproved"
                 FROM workers w
                        LEFT JOIN ranks r ON r.name = w.rank
                        LEFT JOIN locations l ON l.id = w.location_id
                        LEFT JOIN config.admins admins ON admins.worker_id=w.id AND admins.date='${date}'
                 WHERE w.id = ${id}`

  const permissionsQuery = `SELECT
        pm.name, description, pm.id
    FROM config.permissions pm
           LEFT JOIN workers w ON w.id = ${id}
           LEFT JOIN config.default_permissions dp ON (SELECT weight FROM ranks WHERE id = dp.rank_id) <= (SELECT weight FROM ranks WHERE name = w.rank)
           LEFT JOIN relations.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires > NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  return {worker: query, permissions: permissionsQuery}
}
