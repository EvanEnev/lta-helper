import ExcelJS from 'exceljs'
import db from '@/lib/database'
import {DateTime} from 'luxon'

interface GenerateTablePayroll {
  id: number
}

export default async function generateTablePayroll({id}: GenerateTablePayroll) {
  const query = `
    select
      w.name as worker,
      value as value,
      coalesce(bonuses, 0) as bonuses,
      coalesce(external_payment, 0) as external,
      l.name as location,
      taken as taken,
      w2.name as taken_by,
      wp.taken_at as taken_at
    from relations.workers_payrolls wp
           join workers w on w.id = wp.worker_id
           left join workers w2 on w2.id = wp.taken_by
           join locations l on l.id = wp.location_id
    where payroll_id = ${id}
  `

  const dataResult = await db.query(query)

  const data: {
    worker: string
    value: number
    bonuses: number
    external: number
    location: string
    taken: number | null
    taken_by: string | null
    taken_at: DateTime | null
  }[] = dataResult.rows

  const baseRows: (number | string)[][] = [
    [
      'Сотрудник',
      'ЗП',
      'Бонусы',
      'Внешние выплаты',
      'Локация',
      'Выдано',
      'Забрал',
      'Время выдачи',
    ],
  ]

  const rows: (number | string)[][] = []

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Ведомость', {
    views: [{state: 'frozen', ySplit: 1}],
  })

  data.forEach(d => {
    const row = [
      d.worker,
      d.value,
      d.bonuses,
      d.external,
      d.location,
      d.taken || '',
      d.taken_by || '',
      d.taken_at?.toFormat('dd.MM.yyyy HH:mm:ss') || '',
    ]

    rows.push(row)
  })

  const allRows = [...baseRows, ...rows]
  const colCount = baseRows[0].length

  const widths = Array.from({length: colCount}, (_, i) =>
    Math.max(...allRows.map(row => (row[i] ?? '').toString().length * 1.3), 10),
  )

  worksheet.columns = widths.map((width, i) => ({
    key: `col${i}`,
    width,
  }))

  worksheet.addRows(allRows)

  worksheet.columns.forEach(column => {
    column.eachCell!(cell => {
      if (!Number.isNaN(Number(cell.value))) {
        cell.numFmt = '0'
      }
    })
  })

  return await workbook.xlsx.writeBuffer()
}
