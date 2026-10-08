import {timingSafeEqual} from 'node:crypto'
import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {DateTime} from 'luxon'

const OK = () => NextResponse.json({ok: true}, {status: 200})

const PAYMENT_TYPE = 2

const konsolHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
}

const sameSecret = (value: string | null) => {
  const secret = process.env.KONSOL_WEBHOOK_SECRET

  if (!secret) return true
  if (!value) return false

  const a = Buffer.from(value)
  const b = Buffer.from(secret)

  return a.length === b.length && timingSafeEqual(a, b)
}

const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

interface KonsolAct {
  id: number
  number: string
  amount: string
  start_date: string
  contractor: {first_name: string; last_name: string}
}

const insertPayment = (act: KonsolAct, value: number, paid: boolean) =>
  db.query(
    `insert into payments.list (worker_id, payment_type, value, date, comment, act_id, paid)
     values (
       (select id from workers
        where unaccent(first_name) ilike unaccent($1)
          and unaccent(last_name) ilike unaccent($2)),
       $3, $4::numeric, $5, $6, $7, $8
     )`,
    [
      act.contractor.first_name,
      act.contractor.last_name,
      PAYMENT_TYPE,
      value,
      act.start_date,
      `Выплата по акту №${act.number}`,
      act.id,
      paid,
    ],
  )

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get('x-webhook-secret') ??
    req.nextUrl.searchParams.get('secret')

  if (!sameSecret(secret)) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 401})
  }

  const data = await req.json().catch(() => null)
  const action = data?.manifest?.action_cipher

  try {
    if (action === 'workflow.finalize_tasks') {
      const id = data.details?.id

      const today = DateTime.now()
        .setZone('Europe/Moscow')
        .toFormat('yyyy-MM-dd')

      const res = await fetch(
        `https://api.konsol.pro/v2/acts?created_at_from=${today}`,
        {method: 'GET', headers: konsolHeaders},
      )

      const tasks = await res.json().catch(() => null)

      const act: (KonsolAct & {workflow_tasks: {id: unknown}[]}) | undefined =
        Array.isArray(tasks)
          ? tasks.find(task =>
              task.workflow_tasks?.find((d: {id: unknown}) => d.id === id),
            )
          : undefined

      if (!act) return OK()

      await insertPayment(act, Number(act.amount.slice(0, -2)), false)
    } else if (action === 'billing_tcb.payment_succeeded') {
      const id = toId(data.details?.task_id)

      if (id === null) return OK()

      const existing = await db.query(
        'select id from payments.list where act_id = $1',
        [id],
      )

      if (existing.rowCount) {
        await db.query(
          'update payments.list set paid = true where act_id = $1',
          [id],
        )

        return OK()
      }

      const res = await fetch(`https://api.konsol.pro/v2/acts/${id}`, {
        method: 'GET',
        headers: konsolHeaders,
      })

      const act: KonsolAct | null = await res.json().catch(() => null)

      if (!act?.contractor) return OK()

      await insertPayment(act, Number(act.amount), true)
    }
  } catch (e) {
    console.error('[konsol webhook]', e instanceof Error ? e.message : e)
  }

  return OK()
}
