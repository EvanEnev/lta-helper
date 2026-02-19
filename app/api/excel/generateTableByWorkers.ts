import {DateTime, Interval} from 'luxon'
import ExcelJS from 'exceljs'
import db from '@/lib/database'
import getLocations from '@/lib/functions/getLocations'

interface GenerateTableByDaysProps {
  interval: Interval
}

const types = [
  {name: 'Инструктор', keys: []},
  {name: 'Актёр', keys: []},
  {name: 'Техник', keys: ['тех']},
  {name: 'Клининг', keys: ['клининг', 'уборка']},
  {name: 'Художник', keys: ['художник', 'рисование']},
]

const locationsToRemove = ['Другое']

export default async function generateTableByWorkers({
  interval,
}: GenerateTableByDaysProps) {
  const query = `select
                   w.rank,
                   s.comment,
                   s.date,
                   l.name
                 from salary.list s
                        left join locations l on l.id = s.location_id
                        left join workers w on w.id = s.worker_id
                 where s.date between '${interval.start!.toFormat('yyyy-MM-dd')}' and '${interval.end!.toFormat('yyyy-MM-dd')}'
                 and coalesce(s.is_confirmed, false) = true`

  const dataResult = await db.query(query)

  const data: {
    rank: string
    date: DateTime
    name: string
    comment: string | null
  }[] = dataResult.rows

  const locations = await getLocations()

  const days = interval.splitBy({days: 1}).map(d => d.start)
  days.push(interval.end)

  const finalSum = data.length

  const baseRows: (number | string)[][] = [
    ['', ...days.map(d => d!.toFormat('dd.MM.yyyy'))],
    [
      finalSum,
      ...days.map(day => {
        const locData = data.filter(
          d => d.date.toFormat('yyyy-MM-dd') === day?.toFormat('yyyy-MM-dd'),
        )

        if (!locData) return 0

        return locData.length
      }),
    ],
  ]

  const rows: (number | string)[][] = []

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('По дням', {
    views: [{state: 'frozen', ySplit: 2, xSplit: 1}],
  })

  const allTypesRegex = new RegExp(
    `${types
      .filter(t => t.name !== 'Инструктор' && t.name !== 'Актёр')
      .map(t => `(${t.keys.join('|')})`)
      .join('|')}`,
    'giu',
  )

  locations
    .filter(l => !locationsToRemove.includes(l.name))
    .forEach(location => {
      const row: (number | string)[] = [location.name]
      days.forEach(day => {
        const locData = data
          .filter(
            d => d.date.toFormat('yyyy-MM-dd') === day?.toFormat('yyyy-MM-dd'),
          )
          ?.filter(d => d.name === location.name)

        const summary = locData?.length || 0

        row.push(summary)
      })

      rows.push(row)

      types.forEach(type => {
        const row: (number | string)[] = [type.name]

        days.forEach(day => {
          const typeData = data
            .filter(
              d =>
                d.date.toFormat('yyyy-MM-dd') === day?.toFormat('yyyy-MM-dd'),
            )
            ?.filter(d => d.name === location.name)
            ?.filter(d => {
              if (type.name === 'Инструктор') {
                if (d.rank === 'Актёр') return false

                return !d.comment?.match(allTypesRegex)
              } else if (type.name === 'Актёр') {
                if (d.comment?.match(allTypesRegex)) return false
                return d.rank === 'Актёр'
              } else {
                return d.comment?.match(
                  new RegExp(`(${type.keys.join('|')})`, 'gui'),
                )
              }
            })

          const summary = typeData?.length || 0

          row.push(summary)
        })

        rows.push(row)
      })
      rows.push([])
    })

  worksheet.addRows([...baseRows, ...rows])

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
