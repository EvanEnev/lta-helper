import {NextRequest, NextResponse} from 'next/server'
import db from '@/lib/database'
import {DateTime} from 'luxon'

export async function POST(req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ok: true}, {status: 200})
  }

  const action = data.manifest.action_cipher

  if (action === 'workflow.finalize_tasks') {
    const id = data.details.id

    const today = DateTime.now().setZone('Europe/Moscow').toFormat('yyyy-MM-dd')

    const res = await fetch(
      `https://api.konsol.pro/v2/acts?created_at_from=${today}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
        },
      },
    )

    let tasks

    try {
      tasks = await res.json()
    } catch (e) {
      return NextResponse.json({ok: true}, {status: 200})
    }

    const taskData = tasks.find((task: any) =>
      task.workflow_tasks.find((d: any) => d.id === id),
    )

    console.debug(`taskData: ${JSON.stringify(taskData)}`)

    if (!taskData) return NextResponse.json({ok: true}, {status: 200})

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
       ${taskData.id}
       )`

    try {
      await db.query(query)
    } catch (e) {
      console.error(e)
      console.debug(taskData, query)
      return NextResponse.json({ok: true}, {status: 200})
    }
  } else if (action === 'billing_tcb.payment_succeeded') {
    const id = data.details.task_id

    const query = `update payments.list set paid = true where act_id = ${id}`

    try {
      await db.query(query)
    } catch (e) {
      console.error(e)
      console.debug(id, query)
      return NextResponse.json({ok: true}, {status: 200})
    }
  }

  console.debug('WEBHOOK')
  console.debug(data)
  return NextResponse.json({ok: true}, {status: 200})
}
