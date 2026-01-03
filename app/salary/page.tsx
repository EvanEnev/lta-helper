import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import SalaryPage from '@/src/components/salary/Salary'
import getLocationSalaryData from '@/app/salary/getLocationSalaryData'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import getGamesPayments from '@/lib/functions/getGamesPayments'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import getLocations from '@/lib/functions/getLocations'

export default async function Salary() {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const canViewFull = checkPermissions(['view_full_salary'], worker)
  const canEdit = checkPermissions(['edit_salary'], worker)

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('yyyy-MM-dd')

  const {data, faceId} = await getLocationSalaryData({date})

  const datesQuery = `select distinct date_trunc('month', date)::date as date from salary.list order by date desc`

  const datesResult = await db.query(datesQuery)

  const rawDates = datesResult.rows

  const dates = rawDates.map((d: {date: DateTime}) => d.date.toISO()!)
  const gamesPayments = await getGamesPayments()
  const locations = await getLocations()

  return (
    <main className="h-fit">
      <SalaryPage
        locations={locations}
        faceIdData={faceId}
        gamesPayments={gamesPayments}
        dates={dates}
        data={data}
        canEdit={canEdit}
        canViewFull={canViewFull}
      />
    </main>
  )
}
