import {Interval} from 'luxon'
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
  const query = `with
    locationData as (select
          l.name, s.date, s.type, s.comment, w.rank
        from lt_arena.locations l
        left join lt_arena.salary s on l.id = s.location_id
        left join lt_arena.workers w on w.id = s.worker_id
        where s.date between '${interval.start?.toFormat('yyyy-MM-dd')}' and '${interval.end?.toFormat('yyyy-MM-dd')}'
        order by l.name
  )
        select
          json_build_object(
            'date', ld.date,
            'data',
            json_agg(
              json_build_object(
                'location', ld.name,
                'comment', ld.comment,
                'type', ld.type,
                'rank', ld.rank
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
      rank: string
      comment: string | null
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

  const finalSum = data.reduce((sum, val) => sum + val.data?.length || 0, 0)

  const baseRows: string[][] = [
    ['', ...days.map(d => d!.toFormat('dd.MM.yyyy'))],
    [
      finalSum.toString(),
      ...days.map(day => {
        const locData = data.find(d => d.date === day?.toFormat('yyyy-MM-dd'))

        if (!locData) return '0'

        return locData.data.length.toString()
      }),
    ],
  ]

  const rows: string[][] = []

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
      const row = [location.name]
      days.forEach(day => {
        const locData = data
          .find(d => d.date === day?.toFormat('yyyy-MM-dd'))
          ?.data.filter(d => d.location === location.name)

        const summary = locData?.length || 0

        row.push(summary.toString())
      })

      rows.push(row)

      types.forEach(type => {
        const row = [type.name]

        days.forEach(day => {
          const typeData = data
            .find(d => d.date === day?.toFormat('yyyy-MM-dd'))
            ?.data?.filter(d => d.location === location.name)
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

          const summary = (typeData?.length || 0).toString()

          row.push(summary)
        })

        rows.push(row)
      })
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
