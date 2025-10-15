import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import auth from '@/lib/auth/auth'
import SalaryPage from '@/src/components/salary/Salary'
import getLocationSalaryData from '@/app/salary/getLocationSalaryData'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'

export default async function Salary() {
  const worker = await auth()
  const canViewFull = checkPermissions(['view_full_salary'], worker)
  const canEdit = checkPermissions(['edit_salary'], worker)

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('yyyy-MM-dd')

  const data = await getLocationSalaryData({date})

  const datesQuery = `select distinct date from lt_arena.salary order by date desc`

  const datesResult = await db.query(datesQuery)

  const rawDates = datesResult.rows

  const dates = rawDates.map((d: {date: DateTime}) => d.date.toISO()!)

  return (
    <main className="h-fit">
      <SalaryPage
        dates={dates}
        data={data}
        canEdit={canEdit}
        canViewFull={canViewFull}
      />
    </main>
  )
}
