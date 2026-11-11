import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {DateTime, Interval} from 'luxon'
import generateTableByDays from '@/app/api/excel/generateTableByDays'
import generateTableByMonths from '@/app/api/excel/generateTableByMonths'
import generateTableByWorkers from '@/app/api/excel/generateTableByWorkers'
import generateTableWorkers from '@/app/api/excel/generateTableWorkers'
import generateTablePayroll from '@/app/api/excel/generateTablePayroll'

const TYPES = ['day', 'month', 'workers', 'salary', 'payroll']

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body: {
    start_date?: string
    end_date?: string
    bonuses?: boolean
    id?: number
    type: 'day' | 'month' | 'workers' | 'salary' | 'payroll'
  } = await req.json().catch(() => ({type: ''}))

  if (!TYPES.includes(body.type)) {
    return NextResponse.json({message: 'Неверный тип отчёта'}, {status: 400})
  }

  const allowed =
    body.type === 'payroll'
      ? checkPermissions(['edit_payrolls', 'view_all_payrolls'], session.user)
      : body.type === 'salary'
        ? checkPermissions(
            ['view_location_salary', 'view_full_salary'],
            session.user,
          )
        : checkPermissions(['view_full_salary'], session.user)

  if (!allowed) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const startDate = DateTime.fromISO(body?.start_date || '').setZone(
    'Europe/Moscow',
  )
  const endDate = DateTime.fromISO(body?.end_date || '').setZone(
    'Europe/Moscow',
  )

  const interval = Interval.fromDateTimes(startDate, endDate)

  if (
    !['month', 'payroll'].includes(body.type) &&
    (!interval.isValid || interval.length('days') > 400)
  ) {
    return NextResponse.json({message: 'Неверный период'}, {status: 400})
  }

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
  } else if (body.type === 'payroll') {
    buffer = await generateTablePayroll({
      id: Number.isInteger(body.id) ? body.id! : -1,
    })
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
