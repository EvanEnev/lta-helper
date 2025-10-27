import AdminPage from '@/src/components/admin/AdminPage'
import db from '@/lib/database'
import sortByRank from '@/lib/functions/sortByRank'
import {LTWorker} from '@/src/utils/types'
import checkPermissions from '@/lib/functions/checkPermissions'
import getLocations from '@/lib/functions/getLocations'
import getRanks from '@/lib/functions/getRanks'
import getGamesPayments from '@/lib/functions/getGamesPayments'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export default async function Admin() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const workTypesQuery = `select
  id,
  name
  from lt_arena.work_types order by name`

  const workTypesResult = await db.query(workTypesQuery)

  const workersQuery = `SELECT
  w.name,
  w.rank,
  r.id as "rankId",
  w.is_former
  FROM lt_arena.workers w
  left join lt_arena.ranks r on r.name = w.rank`

  const workersResult = await db.query(workersQuery)

  const workersRows = workersResult.rows.map(w => ({
    name: w.name as string,
    rank: w.rank,
    isFormer: !!w.is_former,
  }))

  const canEdit = checkPermissions(['edit_salary'], worker)

  // @ts-ignore
  const workers = sortByRank(workersRows) as LTWorker[]

  const locations = await getLocations()
  const ranks = await getRanks()
  const gamesPayments = await getGamesPayments()

  return (
    <AdminPage
      workers={workers}
      canEdit={canEdit}
      locations={locations}
      ranks={ranks}
      workTypes={workTypesResult.rows}
      gamesPayments={gamesPayments}
    />
  )
}
