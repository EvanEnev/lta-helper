import SummarizedPage from '@/src/components/salary/summarized/SummarizedPage'
import getRanks from '@/lib/functions/getRanks'
import getLocations from '@/lib/functions/getLocations'

export default async function Summarized() {
  const ranks = await getRanks()
  const locations = await getLocations()
  return <SummarizedPage ranks={ranks} locations={locations} />
}
