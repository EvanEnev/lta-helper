export const dynamic = 'force-dynamic'

import SchedulePage from '@/src/components/schedule/ShedulePage'
import getLocations from '@/lib/functions/getLocations'

export default async function Schedule() {
  const locations = await getLocations()

  return <SchedulePage locations={locations} />
}
