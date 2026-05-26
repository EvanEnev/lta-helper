import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {redirect} from 'next/navigation'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import type {DefaultPermission, Permission, WorkerBasic} from '@/src/utils/types'
import PermissionsPage from '@/src/components/settings/permissions/PermissionsPage'

export default async function Page() {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!checkPermissions(['manage_permissions'], worker)) {
    redirect('/')
  }

  const [workersResult, permissionsResult, ranksResult, defaultsResult] =
    await Promise.all([
      db.query(
        `SELECT w.id, w.name, w.photo_url as "photoUrl", r.name as rank, r.weight as "rankWeight"
         FROM workers w
         LEFT JOIN ranks r ON r.id = w.rank_id
         WHERE COALESCE(w.is_fired, false) = false
         ORDER BY COALESCE(w.is_former, false), r.sorting_weight DESC, w.name, w.first_name`,
      ),
      db.query<Permission>(
        'SELECT id, name, description FROM config.permissions ORDER BY name',
      ),
      db.query<{id: number; name: string; weight: number}>(
        'SELECT id, name, weight FROM ranks ORDER BY weight DESC',
      ),
      db.query<DefaultPermission>(
        `SELECT dp.permission_id, dp.rank_id, r.name as rank_name, r.weight as rank_weight
         FROM config.default_permissions dp
         JOIN ranks r ON r.id = dp.rank_id`,
      ),
    ])

  const workers: WorkerBasic[] = workersResult.rows.map(row => ({
    id: row.id as number,
    name: row.name as string,
    photoUrl: (row.photoUrl ?? null) as string | null,
    rank: typeof row.rank === 'object' && row.rank !== null
      ? String((row.rank as {name: unknown}).name)
      : (row.rank as string | null),
    rankWeight: (row.rankWeight as number | null) ?? null,
  }))

  return (
    <PermissionsPage
      workers={workers}
      permissions={permissionsResult.rows}
      ranks={ranksResult.rows}
      defaultPermissions={defaultsResult.rows}
    />
  )
}
