import {NextRequest} from 'next/server'
import ExcelJS from 'exceljs'
import {DateTime} from 'luxon'
import db from '@/lib/database'
import {evaluate} from 'mathjs'

export async function POST(req: NextRequest) {
  const body: {start_date: string; end_date: string; bonuses: boolean} =
    await req.json()

  const startDate = DateTime.fromISO(body.start_date)
  const endDate = DateTime.fromISO(body.end_date)

  const workersQuery = `SELECT name, first_name, id
FROM lt_arena.workers`

  const salaryQuery = `SELECT
value, bonuses, fines, worker_id, overwork FROM lt_arena.salary
WHERE date BETWEEN '${startDate.toFormat('yyyy-MM-dd')}' AND '${endDate.toFormat('yyyy-MM-dd')}'`

  const workersResult = await db.query(workersQuery)
  const salaryResult = await db.query(salaryQuery)

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('ЗП')
  worksheet.addRow([
    `Ведомость выплаты зп от ${startDate.toFormat('dd.MM.yyyy г.')}`,
  ])
  worksheet.addRow([`Итого`, `123`])
  worksheet.addRow([
    'Сотрудник',
    'ЗП',
    'Площадка',
    'Дата выплаты',
    'Получено, руб.',
    'ФИО, подпись/ Примечания',
  ])

  let finalSalary = 0
  const workers = workersResult.rows.sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  workers.forEach(row => {
    const salaryData = salaryResult.rows.filter(
      (s: any) => s.worker_id === row.id,
    )
    // console.log(row.name, salaryData)
    let salary = 0
    salaryData.forEach(data => {
      salary += data.value + (data.overwork || 0)

      if (body.bonuses) {
        salary += evaluate(data.bonuses || 0) + evaluate(data.fines || 0)
      }

      finalSalary += salary
    })

    worksheet.addRow([`${row.name} - ${row.first_name || ''}`, salary])
  })

  worksheet.mergeCells('A1:F1')
  ;['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
    for (let i = 1; i < workersResult.rows.length + 4; i++) {
      worksheet.getCell(`${letter}:${i}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'},
      }

      if (letter === 'A') {
        worksheet.getCell(`${letter}:${i}`).alignment = {
          vertical: 'middle',
          horizontal: 'left',
        }
      } else if (letter === 'B') {
        worksheet.getCell(`${letter}:${i}`).alignment = {
          vertical: 'middle',
          horizontal: 'right',
        }
      }
    }
  })
  ;['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
    for (let i = 1; i < 4; i++) {
      worksheet.getCell(`${letter}:${i}`).font = {bold: true}

      if (i === 4) {
        worksheet.getCell(`${letter}:${i}`).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        }
      }
    }
  })

  worksheet.getCell('A1').alignment = {
    vertical: 'middle',
    horizontal: 'center',
  }

  worksheet.getCell('A2').alignment = {
    vertical: 'middle',
    horizontal: 'right',
  }

  worksheet.getCell('B2').value = finalSalary

  worksheet.columns = [
    {width: 30},
    {width: 10},
    {width: 10},
    {width: 15},
    {width: 15},
    {width: 35},
  ]

  const buffer = await workbook.xlsx.writeBuffer()

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${startDate.toFormat('dd.MM.yyyy')}.xlsx"`,
    },
  })
}
