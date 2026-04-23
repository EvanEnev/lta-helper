import {auth} from '@/lib/auth'

export const dynamic = 'force-dynamic'

import SchedulePage from '@/src/components/schedule/ShedulePage'
import getLocations from '@/lib/functions/getLocations'
import {headers} from 'next/headers'
import getWorkingDays from '@/lib/functions/getWorkingDays'

export default async function Schedule() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const workingDays = await getWorkingDays({id: worker.id})
  const locations = await getLocations()

  return (
    <SchedulePage
      locations={locations}
      worker={worker}
      // @ts-ignore
      workingDays={workingDays}
    />
  )
}
