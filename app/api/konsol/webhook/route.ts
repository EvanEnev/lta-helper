import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const data = await req.json()

  const action = data.manifest.action_cipher

  if (action === 'billing_tcb.payment_succeeded') {
    const task_id = data.details.task_id

    const res = await fetch(`https://api.konsol.pro/v2/acts/${task_id}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
      },
    })

    let taskData

    try {
      taskData = await res.json()
    } catch (e) {
      return NextResponse.json({ok: true}, {status: 200})
    }

    const value = taskData.amount.slice(0, -2)
    const date = taskData.start_date
    const firstName = taskData.contractor.first_name
    const lastName = taskData.contractor.last_name

    const comment = `Выплата по акту №${taskData.number}`
    const type = 2

    const query = `insert into payments.list (worker_id, payment_type, value, date, comment, act_id)
    values
      ((select id from workers where unaccent(first_name) ilike unaccent('${firstName}' and unaccent(last_name) ilike unaccent('${lastName}'))),
       ${type},
       ${value},
       '${date}',
       '${comment}',
       ${task_id}
       )`

    await db.query(query)
  }

  console.debug('WEBHOOK')
  console.debug(data)
  return NextResponse.json({ok: true}, {status: 200})
}
