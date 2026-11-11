import {redirect} from 'next/navigation'
import {headers} from 'next/headers'
import SummaryPage from '@/src/components/salary/summary/SummaryPage'
import getRanks from '@/lib/functions/getRanks'
import getLocations from '@/lib/functions/getLocations'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'
import {auth} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Summarized({
  searchParams,
}: {
  searchParams: Promise<{preset?: string}>
}) {
  const {preset} = await searchParams

  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user || !checkPermissions(['view_full_salary'], session.user)) {
    redirect('/')
  }

  const ranks = await getRanks({
    addon: `where id not in (10)
  order by sorting_weight desc`,
  })
  const locations = await getLocations()
  const workTypesResult = await db.query(
    'select id, name from salary.types order by name',
  )

  return (
    <SummaryPage
      initialPreset={
        preset === 'earnings' || preset === 'payouts' ? preset : undefined
      }
      workTypes={workTypesResult.rows}
      ranks={ranks}
      locations={locations}
    />
  )
}
