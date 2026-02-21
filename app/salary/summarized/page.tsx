import SummarizedPage from '@/src/components/salary/summarized/SummarizedPage'
import getRanks from '@/lib/functions/getRanks'
import getLocations from '@/lib/functions/getLocations'

export const dynamic = 'force-dynamic'

export default async function Summarized() {
  const ranks = await getRanks({
    addon: `where id not in (10)
  order by sorting_weight desc`,
  })
  const locations = await getLocations()
  return <SummarizedPage ranks={ranks} locations={locations} />
}
