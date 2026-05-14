import Summarized2Page from '@/src/components/salary/summarized2/Summarized2Page'
import getRanks from '@/lib/functions/getRanks'
import getLocations from '@/lib/functions/getLocations'
import db from '@/lib/database'

export const dynamic = 'force-dynamic'

export default async function Summarized() {
  const ranks = await getRanks({
    addon: `where id not in (10)
  order by sorting_weight desc`,
  })
  const locations = await getLocations()
  const workTypesQuery = `select id, name from salary.types order by name`
  const workTypesResult = await db.query(workTypesQuery)

  return (
    <Summarized2Page
      workTypes={workTypesResult.rows}
      ranks={ranks}
      locations={locations}
    />
  )
}
