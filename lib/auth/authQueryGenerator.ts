'use server'

import convertTZ from '@/lib/functions/convertTZ'
import {User} from '@supabase/supabase-js'

export default async function authQueryGenerator(
  user: User,
): Promise<{worker: string; permissions: string}> {
  const telegramId = user?.user_metadata.telegram_id

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('dd.MM')

  const query = `SELECT
                   w.name,
                   w.id,
                   w.rank,
                   w.number,
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

  return {worker: query, permissions: permissionsQuery}
}
