import db from '@/lib/database'
import {NextResponse} from 'next/server'
import google from '@/lib/google'
import {DateTime} from 'luxon'
import {evaluate} from 'mathjs'
import capitalize from '@/lib/functions/capitalize'

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

  const workersMap: {worker: string; value: number; oldValue: number}[] = []
  const workersDatesMap: {worker: string; dates: string[]} | {} = {}

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
      const gameHours: number = Number(deal.result.UF_CRM_1571227391338)
      const gameType: number = Number(deal.result.UF_CRM_1571227421480)
      const comment: string = deal.result.COMMENTS
      const dealAdditions: string = deal.result.UF_CRM_1614616587929

      if (
        deal.result.TITLE.includes('VR') ||
        deal.result.TITLE?.toLowerCase().includes('открытая') ||
        date.month !== 4
      )
        continue

      const dealWorkers = deal.result.UF_CRM_1614616543051

      for (const workerId of dealWorkers) {
        const worker = workers.find(
          (d: any) => d.ID.toString() === workerId.toString(),
        )
        if (!worker) continue

        let workerName: string = worker?.VALUE

        if (workerId === 465) {
          const lines = comment.split('\n')
          lines.forEach((line: string) => {
            if (line.toLowerCase().includes('инст')) {
              const lineSplit = line.split('-')
              if (lineSplit.length > 1) {
                workerName = lineSplit[1].trim()
              } else {
                workerName = lineSplit[0].split(' ')[1].trim()
              }
            }
          })
        }

        const query = `select value, overwork, bonuses, fines from lt_arena.salary where date = '${date.toFormat('yyyy-MM-dd')}' and worker_id = (select id from lt_arena.workers where name ilike '${workerName}')`
        const response = await db.query(query)

        if (!response.rows.length) continue
        const data = response.rows[0]
        let salary: number = data?.value

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

        if (
          dealAdditions.toLowerCase().includes('дп') ||
          dealAdditions.toLowerCase().includes('перс')
        ) {
          bonus += 250
        }
        //
        // if (workerName === 'Якудза') {
        //   console.debug(
        //     gameType,
        //     salary,
        //     gameHours,
        //     bonus,
        //     comment,
        //     date,
        //     deal.result.ID,
        //   )
        // }

        const oldDataIndex = workersMap.findIndex(
          d => d.worker.toLowerCase() === workerName.toLowerCase(),
        )

        workersDatesMap[workerName] = {
          worker: capitalize(workerName.toLowerCase()),
          dates: [
            ...(workersDatesMap[capitalize(workerName.toLowerCase())]?.dates ||
              []),
            date.toFormat('yyyy-MM-dd'),
          ],
        }

        if (oldDataIndex !== -1) {
          workersMap[oldDataIndex] = {
            ...workersMap[oldDataIndex],
            value: workersMap[oldDataIndex].value + salary + bonus,
            oldValue: 0,
          }
        } else {
          workersMap.push({
            worker: workerName,
            value: salary + bonus,
            oldValue: 0,
          })
        }
      }
    }
  }

  for (const data of Object.values(workersDatesMap)) {
    const uniqueDates = Array.from(new Set(data.dates))

    const query = `select sum(value) + sum(coalesce(overwork, 0)) as value, string_agg(bonuses, '+') as bonuses from lt_arena.salary where worker_id=(select id from lt_arena.workers where name ilike '${data.worker}') and date in (
      ${uniqueDates
        .map(d => {
          return `'${d}'`
        })
        .join(', ')})`

    const response = await db.query(query)

    const {value, bonuses} = response.rows[0]

    const summary = evaluate(`${value || 0} + ${bonuses || 0}`)
    const oldDataIndex = workersMap.findIndex(
      d => d.worker.trim().toLowerCase() === data.worker.trim().toLowerCase(),
    )

    if (data.worker === 'Пабло') {
      // console.debug(
      //   oldDataIndex,
      //   workersMap[oldDataIndex],
      //   summary,
      //   response.rows,
      //   value,
      //   bonuses,
      //   evaluate(`${value || 0} + ${bonuses || 0}`),
      //   data.dates,
      //   uniqueDates
      //     .map(d => {
      //       return `'${d}'`
      //     })
      //     .join(', '),
      // )
    }

    workersMap[oldDataIndex] = {
      ...workersMap[oldDataIndex],
      oldValue: summary,
    }

    console.debug(`${data.worker} ${workersMap[oldDataIndex].value} ${summary}`)
    // if (data.worker === 'Пабло') {
    //   console.debug('pablo', oldDataIndex)
    //   console.debug(
    //     {
    //       ...workersMap[oldDataIndex],
    //       oldValue: summary,
    //     },
    //     workersMap[oldDataIndex],
    //   )
    // }
  }

  console.debug(workersMap)
  const text = workersMap
    .map(w => `${w.worker} ${w.value} ${w.oldValue}`)
    .join('\n')

  console.debug('done\n\n', text)

  return NextResponse.json({data: ''})
}
