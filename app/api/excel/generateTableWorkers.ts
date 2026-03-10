import {Interval} from 'luxon'
import ExcelJS from 'exceljs'
import db from '@/lib/database'

interface GenerateTableByDaysProps {
  interval: Interval
}

export default async function generateTableWorkers({
  interval,
}: GenerateTableByDaysProps) {
  const query = `
    with faceId as (
      select
        worker_id,
        date::date,
        min(date),
        max(date)
      from face_id
      where date::date between '${interval.start!.toFormat('yyyy-MM-dd')}' and '${interval.end!.toFormat('yyyy-MM-dd')}'
      group by worker_id, date::date
    )
    select
      w.last_name || ' ' || w.first_name || ' ' || w.middle_name as fio,
      w.name,
      jsonb_agg(
        jsonb_build_object(
          'date', sl.date::text,
          'value', sl.value,
          'overwork', coalesce(overwork, 0),
          'location', l.name,
          'bonuses', functions.eval(coalesce(bonuses, '0')),
          'fines', functions.eval(coalesce(fines, '0')),
          'type', coalesce(type, ''),
          'act', coalesce(p.value, 0),
          'comment', coalesce(p.comment, ''),
          'min', fd.min,
          'max', fd.max
        )
      ) as data
    from salary.list sl
           join locations l on l.id = location_id
           left join payments.list p on p.date = sl.date and p.worker_id = sl.worker_id
           left join faceId fd on fd.worker_id = sl.worker_id and fd.date = sl.date
           left join workers w on w.id = sl.worker_id
    where  sl.date between '${interval.start!.toFormat('yyyy-MM-dd')}' and '${interval.end!.toFormat('yyyy-MM-dd')}'
    group by w.name, w.id, sl.id
    order by (select coalesce(ww.is_former, false) from workers ww where ww.id = w.id),
             (select sorting_weight from ranks r where r.id = w.rank_id) DESC,
             w.name,
             (select ww.first_name from workers ww where ww.id = w.id),
             (select date from salary.list where id = sl.id) desc
  `

  console.debug(query, interval.toISO())

  const dataResult = await db.query(query)

  const data = dataResult.rows

  const baseRows: (number | string)[][] = [
    [
      'ФИО',
      'Позывной',
      'Дата',
      'Локация',
      'Смена',
      'Переработка',
      'Бонусы',
      'Штрафы',
      'Тип выплаты',
      'Выплата по акту',
      'Комментарий акта',
      'Вход',
      'Выход',
    ],
  ]

  const rows: (number | string)[][] = []

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('По сотрудникам', {
    views: [{state: 'frozen', ySplit: 1}],
  })

  data.forEach(d => {
    d.data.forEach((v: any) => {
      const row = [
        d.fio,
        d.name,
        v.date,
        v.location,
        v.value,
        v.overwork,
        v.bonuses,
        v.fines,
        v.type,
        v.act,
        v.comment,
        v.min,
        v.max,
      ]

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
