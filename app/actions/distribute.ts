'use server'

import db from '@/lib/database'
import {distribute} from '@/lib/functions/distribute'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'

export async function distributeAction(
  targetDate: string,
  salaries: {worker_id: number; rank_id: number; amount: number}[],
  locationValues: {location_id: number; value: number; priority: number}[],
) {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user || !checkPermissions(['edit_payrolls'], session.user)) {
    return 'Недостаточно прав'
  }

  const isNumber = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value)

  if (
    !Array.isArray(salaries) ||
    !Array.isArray(locationValues) ||
    !salaries.every(
      s =>
        isNumber(s.worker_id) && isNumber(s.rank_id ?? 0) && isNumber(s.amount),
    ) ||
    !locationValues.every(
      l =>
        isNumber(l.location_id) &&
        isNumber(l.value ?? 0) &&
        isNumber(l.priority ?? 0),
    )
  ) {
    return 'Некорректные данные'
  }

  const workerIds = salaries.map(s => s.worker_id)

  const [workers, locations, shifts] = await Promise.all([
    db.query(
      `SELECT id, lat, lng FROM workers
       WHERE id = ANY($1) AND lat IS NOT NULL`,
      [workerIds],
    ),
    db.query(
      `SELECT id, lat, lng FROM locations WHERE lat IS NOT NULL and can_issue is true`,
    ),
    db.query(
      `SELECT worker_id, location_id, date FROM schedule.locations_schedule
       WHERE worker_id = ANY($1)
         AND date BETWEEN $2 AND $2::date + interval '7 days'`,
      [workerIds, targetDate],
    ),
  ])

  const workerCoords = new Map(
    workers.rows.map((r: any) => [r.id, {lat: r.lat, lng: r.lng}]),
  )

  const locationCoords = new Map(
    locations.rows.map((r: any) => [r.id, {lat: r.lat, lng: r.lng}]),
  )

  const employees = salaries.map(s => ({
    employee_id: s.worker_id,
    rank_id: s.rank_id,
    salary: s.amount,
    ...workerCoords.get(s.worker_id)!,
    upcoming_shifts: shifts.rows
      .filter((r: any) => r.worker_id === s.worker_id)
      .map((r: any) => ({
        location_id: r.location_id,
        date: new Date(r.date).toISOString().split('T')[0],
      })),
  }))

  const locs = locationValues
    .filter(l => locationCoords.has(l.location_id))
    .map(l => ({
      ...l,
      ...locationCoords.get(l.location_id)!,
    }))

  const result = distribute(employees, locs, targetDate)

  if (!result.length) {
    return 'Невозможно распределить: недостаточно средств на точках'
  }

  return result
}
