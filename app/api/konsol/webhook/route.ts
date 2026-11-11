import {timingSafeEqual} from 'node:crypto'
import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {DateTime} from 'luxon'
import {konsolFetch} from '@/lib/konsol'

// https://docs.konsol.ru/articles/konsol-hrm-api/webhook
const PAYMENT_EVENTS = [
  'billing.payment_succeeded',
  'external_bank.payment_succeeded',
  'tinkoff.payment_succeeded',
]

const PER_PAGE = 100
const PAYMENT_TYPE_ACT = 2

interface KonsolAct {
  id: number
  number: string
  amount: number | string
  start_date: string
  contractor: {first_name: string; last_name: string}
  workflow_tasks?: {id: number}[]
}

const ok = () => NextResponse.json({ok: true}, {status: 200})

async function upsertActPayment(act: KonsolAct, paid: boolean) {
  await db.query(
    `insert into payments.list (worker_id, payment_type, value, date, comment, act_id, paid)
     values ((select id
              from workers
              where unaccent(first_name) ilike unaccent($1)
                and unaccent(last_name) ilike unaccent($2)),
             $3, $4, $5, $6, $7, $8)
     on conflict (worker_id, act_id) do update
       set value = excluded.value,
           date = excluded.date,
           comment = excluded.comment,
           paid = payments.list.paid or excluded.paid`,
    [
      act.contractor.first_name,
      act.contractor.last_name,
      PAYMENT_TYPE_ACT,
      Number(act.amount),
      act.start_date,
      `Выплата по акту №${act.number}`,
      act.id,
      paid,
    ],
  )
}

async function findActByTaskId(taskId: number): Promise<KonsolAct | null> {
  const today = DateTime.now().setZone('Europe/Moscow').toFormat('yyyy-MM-dd')

  for (let page = 1; ; page++) {
    const res = await konsolFetch<KonsolAct[]>(
      `/v2/acts?created_at_from=${today}&per=${PER_PAGE}&page=${page}`,
    )

    if (!res.ok || !Array.isArray(res.data) || !res.data.length) return null

    const act = res.data.find(a =>
      a.workflow_tasks?.some(task => task.id === taskId),
    )

    if (act) return act
  }
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

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get('x-webhook-secret') ??
    req.nextUrl.searchParams.get('secret')

  if (!sameSecret(secret)) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 401})
  }

  const data = await req.json().catch(() => null)
  const action: string | undefined = data?.manifest?.action_cipher

  try {
    if (action === 'workflow.finalize_tasks') {
      const taskId = toId(data.details?.id)

      if (taskId === null) return ok()

      const act = await findActByTaskId(taskId)

      if (!act) return ok()

      await upsertActPayment(act, false)
    } else if (action && PAYMENT_EVENTS.includes(action)) {
      // task_id в событиях оплаты — id акта
      const actId = toId(data.details?.task_id)

      if (actId === null) return ok()

      const updated = await db.query(
        'update payments.list set paid = true where act_id = $1',
        [actId],
      )

      if (!updated.rowCount) {
        const res = await konsolFetch<KonsolAct>(`/v2/acts/${actId}`)

        if (!res.ok || !res.data?.contractor) {
          console.error('konsol webhook: act not found', actId, res.status)
          return ok()
        }

        await upsertActPayment(res.data, true)
      }
    }
  } catch (e) {
    // всегда отвечаем 2xx, иначе Консоль будет ретраить до 20 раз
    console.error('konsol webhook', action, e instanceof Error ? e.message : e)
  }

  return ok()
}
