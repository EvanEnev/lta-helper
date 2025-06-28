import AdminPage from '@/src/components/admin/AdminPage'
import db from '@/lib/database'
import sortByRank from '@/lib/functions/sortByRank'
import {LTWorker} from '@/src/utils/types'
import auth from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import getLocations from '@/lib/functions/getLocations'
import getRanks from '@/lib/functions/getRanks'

export default async function Admin() {
  const worker = await auth()

  const workersQuery = `SELECT
  name,
  rank,
  is_former
  FROM lt_arena.workers`

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

  return (
    <AdminPage
      workers={workers}
      canEdit={canEdit}
      locations={locations}
      ranks={ranks}
    />
  )
}
