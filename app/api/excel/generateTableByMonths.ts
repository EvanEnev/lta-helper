import {DateTime, Interval} from 'luxon'
import ExcelJS from 'exceljs'
import {evaluate} from 'mathjs'
import db from '@/lib/database'
import getLocations from '@/lib/functions/getLocations'

interface GenerateTableByDaysProps {
  interval: Interval
}

const types = [
  'Отзывы',
  'Бонус за продажи',
  'Бонусный оборот',
  'Премия',
  'Отпуск',
  'Больничный',
]

const locationsToRemove = ['Другое']

export default async function generateTableByMonths({
  interval,
}: GenerateTableByDaysProps) {
  const query = `select
                   d::date AS date,
                   ls.value,
                   ls.bonuses,
                   ls.fines,
                   ls.type,
                   l.name as location
                 from generate_series('${interval.start!.toFormat('yyyy-MM-dd')}'::date, '${interval.end!.toFormat('yyyy-MM-dd')}'::date, interval '1 day') d
                        left join get_locations_salary(d::date) ls on true
                        left join lt_arena.locations l on l.id = ls.location_id`

  const dataResult = await db.query(query)

  const data: {
    date: DateTime
    location: string
    value: number
    bonuses: string
    fines: string
    type: string | null
  }[] = dataResult.rows

  const locations = await getLocations()

  const splittedInterval = interval.splitBy({month: 1})
  const days = splittedInterval.map(d => d.start)

  const finalSum = data.reduce(
    (sum, val) =>
      sum +
      evaluate(`${val.value || 0} + ${val.bonuses || 0} + ${val.fines || 0}`),
    0,
  )

  const baseRows: (number | string)[][] = [
    ['', ...days.map(d => d!.toFormat('MM.yyyy'))],
    [
      finalSum.toString(),
      ...days.map(day => {
        const locData = data.filter(d => d.date.month === day?.month)

        if (!locData.length) return 0

        return locData.reduce(
          (acc, val) =>
            acc +
            evaluate(
              `${val.value || 0} + ${val.bonuses || 0} + ${val.fines || 0}`,
            ),
          0,
        )
      }),
    ],
  ]

  const rows: (number | string)[][] = []

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('По месяцам', {
    views: [{state: 'frozen', ySplit: 2, xSplit: 1}],
  })

  locations
    .filter(l => !locationsToRemove.includes(l.name))
    .forEach(location => {
      const row: (number | string)[] = [location.name]
      days.forEach(day => {
        const locData = data
          .filter(d => d.date.month === day?.month)
          .filter(d => d.location === location.name)

        if (!locData.length) return row.push(0)

        const summary = locData.reduce(
          (acc, val) =>
            acc +
            evaluate(
              `${val.value || 0} + ${val.bonuses || 0} + ${val.fines || 0}`,
            ),
          0,
        )

        row.push(summary)
      })

      rows.push(row)
    })

  types.forEach(type => {
    const row: (number | string)[] = [type]
    days.forEach(day => {
      const typeData = data
        .filter(d => d.date.month === day?.month)
        .filter(d => d.type === type)

      if (!typeData.length) return row.push(0)

      const summary = typeData.reduce(
        (acc, val) =>
          acc +
          evaluate(
            `${val.value || 0} + ${val.bonuses || 0} + ${val.fines || 0}`,
          ),
        0,
      )

      row.push(summary)
    })

    rows.push(row)
  })

  worksheet.addRows([
    ...baseRows,
    ...rows.sort((a, b) => (a[0] as string).localeCompare(b[0] as string)),
  ])

  worksheet.columns.forEach(function (column) {
    const lengths = column.values?.map(v => v?.toString().length)
    column.width = Math.max(
      ...(lengths?.filter(v => typeof v === 'number') || [15]),
    )
  })

  worksheet.columns.forEach(column => {
    column.eachCell!(cell => {
      if (!Number.isNaN(Number(cell.value))) {
        cell.numFmt = '0'
      }
    })
  })

  return await workbook.xlsx.writeBuffer()
}
