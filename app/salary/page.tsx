import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import SalaryPage from '@/src/components/salary/SalaryPage'
import {DateTime} from 'luxon'
import getGamesPayments from '@/lib/functions/getGamesPayments'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import getLocations from '@/lib/functions/getLocations'

export default async function Salary() {
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  const canViewFull = checkPermissions(['view_full_salary'], worker)
  const canEdit = checkPermissions(['edit_salary'], worker)

  const datesQuery = `select distinct date_trunc('month', date)::date as date from salary.list order by date desc`

  const datesResult = await db.query(datesQuery)

  const rawDates = datesResult.rows

  const dates = rawDates.map((d: {date: DateTime}) => d.date.toISO()!)
  const gamesPayments = await getGamesPayments()
  const locations = await getLocations()

  const workTypesQuery = `select
  id,
  name
  from salary.types order by name`

  const workTypesResult = await db.query(workTypesQuery)
  const workTypes = workTypesResult.rows

  return (
    <SalaryPage
      worker={worker}
      locations={locations}
      gamesPayments={gamesPayments}
      dates={dates}
      canEdit={canEdit}
      canViewFull={canViewFull}
      workTypes={workTypes}
    />
  )
}
