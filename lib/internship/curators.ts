import db from '@/lib/database'

export interface Curator {
  id: number
  name: string
}

export async function getCurators(): Promise<Curator[]> {
  const result = await db.query(
    `select w.id, w.name
     from workers w
     where coalesce(w.is_fired, false) = false
       and coalesce(w.is_former, false) = false
       and (
       exists (select 1
               from config.default_permissions dp
                      join config.permissions pm on pm.id = dp.permission_id
               where pm.name in ('manage_internship', 'admin')
                 and (select permission_level from ranks where id = dp.rank_id)
                 <= (select permission_level from ranks where id = w.rank_id))
         or exists (select 1
                    from relations.workers_permissions wp
                           join config.permissions pm on pm.id = wp.permission_id
                    where wp.worker_id = w.id
                      and pm.name in ('manage_internship', 'admin')
                      and coalesce(wp.expires > now(), true))
       )
     order by w.name`,
  )

  return result.rows
}
