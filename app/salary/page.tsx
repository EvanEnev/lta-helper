import db from '@/lib/database'
import checkPermissions from '@/lib/functions/checkPermissions'
import auth from '@/lib/auth'
import SalaryPage from '@/src/components/salary/Salary'
import getLocationSalaryData from '@/app/salary/getLocationSalaryData'
import {DateTime} from 'luxon'
import convertTZ from '@/lib/functions/convertTZ'
import getRanks from '@/lib/functions/getRanks'
import getLocations from '@/lib/functions/getLocations'

export default async function Salary() {
  const worker = await auth()
  const canViewFull = checkPermissions(['view_full_salary'], worker)
  const canEdit = checkPermissions(['edit_salary'], worker)

  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('yyyy-MM-dd')

  const data = await getLocationSalaryData({date})

  const datesQuery = `SELECT DISTINCT to_char(date, 'YYYY-MM') as date from lt_arena.salary`

  const datesResult = await db.query(datesQuery)

  const rawDates = datesResult.rows.map(d =>
    DateTime.fromFormat(d.date, 'yyyy-MM'),
  )

  rawDates.sort(
    (d1, d2) =>
      (d1.diff(d2).toObject()?.milliseconds || 0) -
      (d2.diff(d1).toObject()?.milliseconds || 0),
  )

  const dates = rawDates.map((d: DateTime) => d.toISO()!)
  const ranks = await getRanks()
  const locations = await getLocations()

  return (
    <main className="h-fit">
      <SalaryPage
        dates={dates}
        data={data}
        canEdit={canEdit}
        canViewFull={canViewFull}
        ranks={ranks}
        locations={locations}
      />
    </main>
  )
}
