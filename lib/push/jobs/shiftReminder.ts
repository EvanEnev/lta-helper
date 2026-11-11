import {DateTime} from 'luxon'
import db from '../../database'
import {sendToWorkers} from '../send'

const ZONE = 'Europe/Moscow'
const HOURS_BEFORE_END = Number(process.env.SHIFTS_REMINDER_HOURS_BEFORE ?? 2)
const DEFAULT_END = process.env.SHIFTS_DEFAULT_END ?? '19:00'
const KEEP_SENDING_HOURS = 6

const sent = new Set<string>()

export const REMINDER_QUERY = `
  with plan as (
    select
      ls.worker_id,
      ls.location_id,
      to_char(
        max($1::date + ls.end_time
          + case when ls.end_time <= ls.start_time then interval '1 day' else interval '0' end)
          filter (where ls.start_time is not null
                    and ls.end_time is not null
                    and ls.start_time <> ls.end_time),
        'YYYY-MM-DD"T"HH24:MI:SS') as planned_end
    from schedule.locations_schedule ls
    join workers w on w.id = ls.worker_id
    where ls.date = $1::date
      and coalesce(w.is_fired, false) = false
      and (
        exists (
          select 1
          from config.default_permissions dp
          join config.permissions pm on pm.id = dp.permission_id
          where pm.name = 'set_salary'
            and (select permission_level from ranks where id = dp.rank_id)
              <= (select permission_level from ranks where id = w.rank_id)
        )
        or exists (
          select 1
          from relations.workers_permissions wp
          join config.permissions pm on pm.id = wp.permission_id
          where wp.worker_id = w.id
            and pm.name = 'set_salary'
            and coalesce(wp.expires > now(), true)
        )
      )
    group by ls.worker_id, ls.location_id
  ),
  faces as (
    select fd.location_id, fd.worker_id
    from face_id fd
    where fd.date >= $1::date + interval '5 hours'
      and fd.date < $1::date + interval '29 hours'
    group by fd.location_id, fd.worker_id
  )
  select
    p.worker_id,
    p.location_id,
    (select name from locations where id = p.location_id) as location,
    (select count(*) from faces f
      where f.location_id = p.location_id
        and not exists (
          select 1 from salary.list s
          where s.worker_id = f.worker_id and s.date = $1::date
        ))::int as missing,
    (select count(*) from faces f where f.location_id = p.location_id)::int as faces,
    (select count(*) from salary.list s
      where s.date = $1::date and s.location_id = p.location_id)::int as filled,
    p.planned_end
  from plan p`

export interface Row {
  worker_id: number
  location_id: number
  location: string | null
  missing: number
  faces: number
  filled: number
  planned_end: string | null
}

export interface Reminder {
  workerId: number
  locationId: number
  location: string | null
  text: string
  at: DateTime
}

export const needsReminder = (row: Row) =>
  row.missing > 0 || (row.faces === 0 && row.filled === 0)

export const reminderText = (row: Row) => {
  const place = row.location ? `${row.location}: ` : ''

  return row.missing > 0
    ? `${place}не проставлено смен: ${row.missing}`
    : `${place}за сегодня ещё нет смен`
}

// Админы локации - те, кто запланирован в schedule.locations_schedule и может
// проставлять смены. Конец смены берётся из расписания, а если времени нет,
// то DEFAULT_END
export function adminShiftEnd(row: Row, day: string): DateTime {
  if (row.planned_end) {
    return DateTime.fromISO(row.planned_end, {zone: ZONE})
  }

  const [hour, minute] = DEFAULT_END.split(':').map(Number)

  return DateTime.fromISO(day, {zone: ZONE}).set({hour, minute})
}

// Напоминание уходит админам локации за HOURS_BEFORE_END часа до конца смены
// самого позднего из них
export function remindersFor(rows: Row[], day: string): Reminder[] {
  const byLocation = new Map<number, {row: Row; end: DateTime}[]>()

  for (const row of rows) {
    const end = adminShiftEnd(row, day)

    if (!end.isValid) continue

    byLocation.set(row.location_id, [
      ...(byLocation.get(row.location_id) ?? []),
      {row, end},
    ])
  }

  return [...byLocation.values()].flatMap(admins => {
    const last = admins.reduce((a, b) => (b.end > a.end ? b : a)).end
    const at = last.minus({hours: HOURS_BEFORE_END})

    return admins
      .filter(({row}) => needsReminder(row))
      .map(({row}) => ({
        workerId: row.worker_id,
        locationId: row.location_id,
        location: row.location,
        text: reminderText(row),
        at,
      }))
  })
}

export default async function shiftReminder(now: DateTime) {
  const moscow = now.setZone(ZONE)
  const days = [moscow.minus({days: 1}), moscow].map(d =>
    d.toFormat('yyyy-MM-dd'),
  )

  for (const key of sent) {
    if (!days.some(day => key.startsWith(day))) sent.delete(key)
  }

  for (const day of days) {
    const result = await db.query<Row>(REMINDER_QUERY, [day])

    for (const reminder of remindersFor(result.rows, day)) {
      const key = `${day}:${reminder.workerId}:${reminder.locationId}`

      if (
        sent.has(key) ||
        moscow < reminder.at ||
        moscow > reminder.at.plus({hours: KEEP_SENDING_HOURS})
      ) {
        continue
      }

      sent.add(key)

      await sendToWorkers([reminder.workerId], {
        title: 'Проставьте смены',
        body: reminder.text,
        url: '/admin',
        tag: `shifts-${day}-${reminder.locationId}`,
      })
    }
  }
}
