import {Interval} from 'luxon'
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

export default async function generateTableByDays({
  interval,
}: GenerateTableByDaysProps) {
  const query = `with
    locationData as (select
          l.name, s.date, s.type,
          sum(coalesce(s.value, 0)) + sum(coalesce(s.overwork, 0)) as value,
          string_agg(s.bonuses, '+') as bonuses,
          string_agg(s.fines, '+') as fines
        from lt_arena.locations l
        left join lt_arena.salary s on l.id = s.location_id
        where s.date between '${interval.start?.toFormat('yyyy-MM-dd')}' and '${interval.end?.toFormat('yyyy-MM-dd')}'
        group by l.name, s.date, s.type
        order by l.name
  )
        select
          json_build_object(
            'date', ld.date,
            'data',
            json_agg(
              json_build_object(
                'location', ld.name,
                'type', ld.type,
                'value', ld.value,
                'bonuses', ld.bonuses,
                'fines', ld.fines
              ) order by ld.name
            )
          ) as data
        from locationData ld
        group by ld.date
        order by ld.date`

  const dataResult = await db.query(query)

  const data: {
    date: string
    data: {
      location: string
      value: number
      bonuses: string
      fines: string
      type: string | null
    }[]
  }[] = dataResult.rows.map(r => r.data)

  const locations = await getLocations()

  const days = interval.splitBy({days: 1}).map(d => d.start)
  days.push(interval.end)

  const finalSum = data.reduce(
    (sum, val) =>
      sum +
      val.data?.reduce(
        (acc, val) =>
          acc + val.value + evaluate(val.bonuses) + evaluate(val.fines),
        0,
      ),
    0,
  )

  const baseRows: string[][] = [
    ['', ...days.map(d => d!.toFormat('dd.MM.yyyy'))],
    [
      finalSum.toString(),
      ...days.map(day => {
        const locData = data.find(d => d.date === day?.toFormat('yyyy-MM-dd'))

        if (!locData) return '0'

        return locData.data
          .reduce(
            (acc, val) =>
              acc + (val.value + evaluate(val.bonuses) + evaluate(val.fines)),
            0,
          )
          .toString()
      }),
    ],
  ]

  const rows: string[][] = []

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('По дням', {
    views: [{state: 'frozen', ySplit: 2, xSplit: 1}],
  })

  locations
    .filter(l => !locationsToRemove.includes(l.name))
    .forEach(location => {
      const row = [location.name]
      days.forEach(day => {
        const locData = data
          .find(d => d.date === day?.toFormat('yyyy-MM-dd'))
          ?.data.find(d => d.location === location.name)

        if (!locData) return row.push('0')

        const summary =
          locData.value + evaluate(locData.bonuses) + evaluate(locData.fines)

        row.push(summary.toString())
      })

      rows.push(row)
    })

  types.forEach(type => {
    const row = [type]
    days.forEach(day => {
      const typeData = data
        .find(d => d.date === day?.toFormat('yyyy-MM-dd'))
        ?.data?.find(d => d.type === type)

      if (!typeData) return row.push('0')

      const summary =
        typeData.value + evaluate(typeData.bonuses) + evaluate(typeData.fines)

      row.push(summary)
    })

    rows.push(row)
  })

  worksheet.addRows([
    ...baseRows,
    ...rows.sort((a, b) => a[0].localeCompare(b[0])),
  ])

  worksheet.columns.forEach(function (column) {
    const lengths = column.values?.map(v => v?.toString().length)
    column.width = Math.max(
      ...(lengths?.filter(v => typeof v === 'number') || [10]),
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
