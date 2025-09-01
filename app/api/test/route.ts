import db from '@/lib/database'
import {NextResponse} from 'next/server'
import google from '@/lib/google'
import {DateTime} from 'luxon'

export async function GET() {
  const workersResponse = await fetch(
    'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.userfield.get',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"ID": 577}',
    },
  )

  const workers = (await workersResponse.json()).result.LIST

  const workersMap: {worker: string; value: number}[] = []

  const done: string[] = []
  const n = 100

  for (let i = 0; i < n; i++) {
    console.debug(i)
    const response = await fetch(
      'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.list',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: `{"FILTER": {">UF_CRM_1571227371991": "2025-04-01T00:00:00+03:00", "<=UF_CRM_1571227371991": "2025-04-30T24:00:00+03:00"}, "ORDER": {"UF_CRM_1571227371991": "DESC"}, "start": ${i * 50}}`,
      },
    )

    const deals = await response.json()
    if (!deals.next) break

    for (const dealData of deals.result) {
      const dealResponse = await fetch(
        'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.get',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: `{"ID": ${dealData.ID}}`,
        },
      )

      const deal = await dealResponse.json()
      const json = JSON.parse(deal.result.UF_CRM_1581496630760)

      if (done.includes(json.ID)) {
        continue
      } else {
        done.push(json.ID)
      }

      const date = DateTime.fromISO(deal.result.UF_CRM_1571227371991)
      const gameHours = deal.result.UF_CRM_1571227391338
      const gameType = deal.result.UF_CRM_1571227421480
      const comment = deal.result.COMMENTS

      if (
        deal.result.TITLE.includes('VR') ||
        deal.result.TITLE?.toLowerCase().includes('открытая') ||
        date.month !== 4
      )
        continue

      const dealWorkers = deal.result.UF_CRM_1614616543051

      for (const workerId of dealWorkers) {
        if (workerId === 465) continue

        const worker = workers.find(
          (d: any) => d.ID.toString() === workerId.toString(),
        )
        if (!worker) continue

        const workerName = worker.VALUE

        const query = `select value from lt_arena.salary where date = '${date.toFormat('yyyy-MM-dd')}' and worker_id = (select id from lt_arena.workers where name ilike '${workerName}')`
        const response = await db.query(query)

        if (!response.rows.length) continue
        let salary: number = response.rows[0]?.value

        let bonus = 0
        if (!salary || salary === 1500) continue

        switch (gameHours) {
          case 1:
            bonus += 250
            break
          case 2:
            bonus += 500
            break
          case 3:
            bonus += 750
            break
        }

        if (gameType !== 87) {
          bonus += 500
        }
        if (workerName === 'Эван') {
          console.debug(bonus, gameType, comment, date, deal.result.ID)
        }
        const oldDataIndex = workersMap.findIndex(d => d.worker === workerName)

        if (oldDataIndex !== -1) {
          workersMap[oldDataIndex] = {
            ...workersMap[oldDataIndex],
            value: workersMap[oldDataIndex].value + bonus,
          }
        } else {
          workersMap.push({worker: workerName, value: salary + bonus})
        }
      }
    }
  }

  console.debug(
    'done\n\n',
    workersMap
      .sort((d1, d2) => d1.worker.localeCompare(d2.worker))
      .map(w => `${w.worker}: ${w.value}`)
      .join('\n'),
  )
  return NextResponse.json({data: ''})
}
