import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {toId} from '@/lib/payrolls/validate'

const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

interface ConfirmEntry {
  id: number
  value: number
  selectedWorker: string | null
}

export async function POST(req: NextRequest) {
  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!worker) return fail('Вход не произведён', 401)

  const body = await req.json().catch(() => null)
  const payrollId = toId(body?.payroll_id)

  if (!Array.isArray(body?.workers) || !body.workers.length) {
    return fail('Не предоставлены сотрудники')
  }
  if (payrollId === null) return fail('Не предоставлена ведомость')
  if (body.workers.length > 100) return fail('Слишком много сотрудников')

  const entries: ConfirmEntry[] = []

  for (const item of body.workers) {
    const id = toId(item?.id)
    const value = Number(item?.value)

    if (
      id === null ||
      !Number.isFinite(value) ||
      (value < 0 && id !== worker.id)
    ) {
      return fail('Некорректные данные')
    }

    entries.push({
      id,
      value,
      selectedWorker:
        typeof item?.selectedWorker === 'string' && item.selectedWorker.trim()
          ? item.selectedWorker.trim()
          : null,
    })
  }

  const client = await db.connect()

  try {
    await client.query('begin')

    const payroll = await client.query(
      `select 1 from payrolls.list
       where id = $1 and is_published = true and take_by >= now()::date`,
      [payrollId],
    )

    if (!payroll.rowCount) {
      await client.query('rollback')

      return fail('Ведомость недоступна для подтверждения', 409)
    }

    for (const entry of entries) {
      let updated

      if (entry.id === worker.id) {
        let takeById: number | null = null

        if (entry.selectedWorker) {
          const found = await client.query(
            'select id from workers where lower(name) = lower($1) limit 1',
            [entry.selectedWorker],
          )
          takeById = found.rows[0]?.id ?? null

          if (takeById === null) {
            await client.query('rollback')

            return fail('Сотрудник, который заберёт, не найден', 404)
          }
        }

        updated = await client.query(
          `update relations.workers_payrolls
           set issue_confirmed = true,
               to_take = $1,
               to_take_by = coalesce($2::int, to_take_by)
           where worker_id = $3
             and payroll_id = $4
             and coalesce(taken, 0) = 0
             and $1::numeric between
                 least(value + coalesce(bonuses, 0) - coalesce(external_payment, 0), 0)
                 and greatest(value + coalesce(bonuses, 0) - coalesce(external_payment, 0), 0)`,
          [entry.value, takeById, entry.id, payrollId],
        )
      } else {
        updated = await client.query(
          `update relations.workers_payrolls
           set issue_confirmed = true,
               to_take = $1
           where worker_id = $2
             and payroll_id = $3
             and to_take_by = $4
             and coalesce(taken, 0) = 0
             and $1::numeric between 0 and coalesce(to_take, 0)`,
          [entry.value, entry.id, payrollId, worker.id],
        )
      }

      if (updated.rowCount !== 1) {
        await client.query('rollback')

        return fail(
          'Нельзя подтвердить выдачу: сумма вне допустимой или строка недоступна',
          403,
        )
      }
    }

    await client.query('commit')

    return NextResponse.json({}, {status: 200})
  } catch (e) {
    await client.query('rollback').catch(() => {})
    console.error(e)

    return fail(e instanceof Error ? e.message : 'Ошибка в запросе', 500)
  } finally {
    client.release()
  }
}
