import {NextRequest} from 'next/server'
import {DateTime, Interval} from 'luxon'
import generateTableByDays from '@/app/api/excel/generateTableByDays'
import generateTableByMonths from '@/app/api/excel/generateTableByMonths'
import generateTableByWorkers from '@/app/api/excel/generateTableByWorkers'
import generateTableWorkers from '@/app/api/excel/generateTableWorkers'

export async function POST(req: NextRequest) {
  const body: {
    start_date: string
    end_date: string
    bonuses: boolean
    type: 'day' | 'month' | 'workers' | 'salary'
  } = await req.json()

  const startDate = DateTime.fromISO(body.start_date)
  const endDate = DateTime.fromISO(body.end_date)

  const interval = Interval.fromDateTimes(startDate, endDate)

  let buffer
  if (body.type === 'day') {
    buffer = await generateTableByDays({interval})
  } else if (body.type === 'month') {
    buffer = await generateTableByMonths({
      interval: Interval.fromDateTimes(
        DateTime.now().startOf('year'),
        DateTime.now().endOf('year'),
      ),
    })
  } else if (body.type === 'workers') {
    buffer = await generateTableByWorkers({interval})
  } else if (body.type === 'salary') {
    buffer = await generateTableWorkers({interval})
  }

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${startDate.toFormat('dd.MM.yyyy')}.xlsx"`,
    },
  })
}
