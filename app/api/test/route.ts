import {NextResponse} from 'next/server'
// import {DateTime} from 'luxon'
// import db from '@/lib/database'
// import unaccent from '@/src/utils/global/unaccent'

export async function GET() {
  // const dealsQuery = `select worker_id, deal_id, game_type, date, type from lt_arena.deals`
  //
  // const dealsResult = await db.query(dealsQuery)
  // const deals = dealsResult.rows
  //
  // const queries = []
  // const total = deals.length
  //
  // for (const data of deals) {
  //   const index = deals.indexOf(data)
  //   console.debug(`${index + 1}/${total}`)
  //
  //   const body = {
  //     ID: data.deal_id,
  //   }
  //
  //   const response = await fetch(
  //     'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.get',
  //     {
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       body: JSON.stringify(body),
  //     },
  //   )
  //
  //   const deal = await response.json()
  //
  //   if (!deal.result.UF_CRM_1581496630760) {
  //     console.debug(data)
  //     return
  //   }
  //
  //   const json = JSON.parse(deal.result.UF_CRM_1581496630760)
  //
  //   if (Number(json.ID) !== data.deal_id) {
  //     const query = `delete from lt_arena.deals where deal_id = ${data.deal_id} and worker_id = ${data.worker_id} and date = '${data.date.toFormat('yyyy-MM-dd')}' and type = '${data.type}' and game_type = '${data.game_type}'`
  //
  //     queries.push(query)
  //   }
  // }
  //
  // await db.query(queries.join(';'))

  // const workersResponse = await fetch(
  //   'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.userfield.get',
  //   {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: '{"ID": 577}',
  //   },
  // )
  //
  // const btWorkers = (await workersResponse.json()).result.LIST
  //
  // const workersQuery = `select id, name from lt_arena.workers`
  // const workersResult = await db.query(workersQuery)
  // const workers: {id: number; name: string}[] = workersResult.rows
  // const workersSet = new Set(workers.map(worker => worker.name.toLowerCase()))
  //
  // let next: number | undefined = 0
  //
  // const queries = []
  //
  // while (next !== undefined) {
  //   const body = {
  //     filter: {'>UF_CRM_1571227371991': '2025-01-01T00:00:00+03:00'},
  //     order: {UF_CRM_1571227371991: 'ASC'},
  //     start: next,
  //   }
  //
  //   const response = await fetch(
  //     'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.list',
  //     {
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       body: JSON.stringify(body),
  //     },
  //   )
  //
  //   const deals: any = await response.json()
  //
  //   next = deals.next
  //   // next = undefined
  //
  //   console.debug(next)
  //
  //   if (!next) break
  //
  //   for (const dealData of deals.result) {
  //     const dealResponse = await fetch(
  //       'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.get',
  //       {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //         body: `{"ID": ${dealData.ID}}`,
  //       },
  //     )
  //
  //     const deal = await dealResponse.json()
  //
  //     let json
  //
  //     let date
  //     let gameHours
  //     let gameType
  //     let comment
  //     let dealAdditions
  //
  //     let dealWorkersRaw
  //
  //     let dealWorkers
  //     let dealActors
  //     let lines
  //
  //     try {
  //       json = JSON.parse(deal.result.UF_CRM_1581496630760)
  //
  //       date = DateTime.fromISO(deal.result.UF_CRM_1571227371991)
  //       gameHours = Number(deal.result.UF_CRM_1571227391338)
  //       gameType = json.UF_CRM_1571227421480
  //       comment = deal.result.COMMENTS
  //       dealAdditions = deal.result.UF_CRM_1614616587929
  //
  //       dealWorkersRaw = deal.result.UF_CRM_1614616543051
  //
  //       dealWorkers = []
  //       dealActors = []
  //       lines = comment?.split('\n') || []
  //     } catch (e) {
  //       console.debug(deal)
  //       throw new Error(e)
  //     }
  //
  //     for (const workerId of dealWorkersRaw) {
  //       const worker = btWorkers.find(
  //         (d: any) => d.ID.toString() === workerId.toString(),
  //       )
  //
  //       if (!worker) continue
  //
  //       let workerName: string = worker?.VALUE
  //
  //       if (workerId === 465) {
  //         lines.forEach((line: string) => {
  //           if (line.toLowerCase().includes('инст')) {
  //             const lineSplit = line.split('-')
  //             if (lineSplit.length > 1) {
  //               workerName = lineSplit[1].trim()
  //             } else {
  //               workerName = lineSplit[0].split(' ')[1].trim()
  //             }
  //           }
  //         })
  //       }
  //
  //       dealWorkers.push(workerName)
  //     }
  //
  //     lines.forEach((line: string) => {
  //       const workersInLine = line
  //         .toLowerCase()
  //         .split(/[\s\-_,. ]+/)
  //         .filter(w => workersSet.has(w))
  //
  //       workersInLine.forEach(worker => {
  //         if (!dealWorkers.find(w => unaccent(w) === unaccent(worker))) {
  //           dealActors.push(worker)
  //         }
  //       })
  //     })
  //
  //     let localQueries: string[] = []
  //
  //     dealWorkers.forEach(worker => {
  //       if (!worker) {
  //         return console.error('worker not found', worker, dealData.ID)
  //       }
  //
  //       localQueries.push(
  //         `insert into lt_arena.deals (worker_id, deal_id, game_type, date, type) VALUES ((select id from lt_arena.workers where unaccent(name) ilike unaccent('${worker}')), ${dealData.ID}, '${gameType}', '${date.toFormat('yyyy-MM-dd')}', 'worker')`,
  //       )
  //     })
  //
  //     dealActors.forEach(worker => {
  //       if (!worker) {
  //         return console.error('worker not found', worker, dealData.ID)
  //       }
  //
  //       localQueries.push(
  //         `insert into lt_arena.deals (worker_id, deal_id, game_type, date, type) VALUES ((select id from lt_arena.workers where unaccent(name) ilike unaccent('${worker}')), ${dealData.ID}, '${gameType}', '${date.toFormat('yyyy-MM-dd')}', 'actor')`,
  //       )
  //     })
  //
  //     queries.push(localQueries.join(';'))
  //   }
  // }
  //
  // await db.query(queries.join(';'))
  // const workersResponse = await fetch(
  //   'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.userfield.get',
  //   {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: '{"ID": 577}',
  //   },
  // )
  //
  // const workers = (await workersResponse.json()).result.LIST
  //
  // const workersMap: {worker: string; value: number; oldValue: number}[] = []
  // const workersDatesMap: {worker: string; dates: string[]} | {} = {}
  //
  // const done: string[] = []
  // const n = 100
  //
  // for (let i = 0; i < n; i++) {
  //   const response = await fetch(
  //     'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.list',
  //     {
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       body: `{"FILTER": {">UF_CRM_1571227371991": "2025-04-01T00:00:00+03:00", "<=UF_CRM_1571227371991": "2025-04-30T24:00:00+03:00"}, "ORDER": {"UF_CRM_1571227371991": "DESC"}, "start": ${i * 50}}`,
  //     },
  //   )
  //
  //   const deals = await response.json()
  //   if (!deals.next) break
  //
  //   for (const dealData of deals.result) {
  //     const dealResponse = await fetch(
  //       'https://crm.lt-arena.ru/rest/3061/3vb2kcwt0hpt13qp/crm.deal.get',
  //       {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //         body: `{"ID": ${dealData.ID}}`,
  //       },
  //     )
  //
  //     const deal = await dealResponse.json()
  //     const json = JSON.parse(deal.result.UF_CRM_1581496630760)
  //
  //     if (done.includes(json.ID)) {
  //       continue
  //     } else {
  //       done.push(json.ID)
  //     }
  //
  //     const date = DateTime.fromISO(deal.result.UF_CRM_1571227371991)
  //     const gameHours: number = Number(deal.result.UF_CRM_1571227391338)
  //     const gameType: number = Number(deal.result.UF_CRM_1571227421480)
  //     const comment: string = deal.result.COMMENTS
  //     const dealAdditions: string = deal.result.UF_CRM_1614616587929
  //
  //     if (
  //       deal.result.TITLE.includes('VR') ||
  //       deal.result.TITLE?.toLowerCase().includes('открытая') ||
  //       date.month !== 4
  //     )
  //       continue
  //
  //     const dealWorkers = deal.result.UF_CRM_1614616543051
  //
  //     for (const workerId of dealWorkers) {
  //       const worker = workers.find(
  //         (d: any) => d.ID.toString() === workerId.toString(),
  //       )
  //       if (!worker) continue
  //
  //       let workerName: string = worker?.VALUE
  //
  //       if (workerId === 465) {
  //         const lines = comment.split('\n')
  //         lines.forEach((line: string) => {
  //           if (line.toLowerCase().includes('инст')) {
  //             const lineSplit = line.split('-')
  //             if (lineSplit.length > 1) {
  //               workerName = lineSplit[1].trim()
  //             } else {
  //               workerName = lineSplit[0].split(' ')[1].trim()
  //             }
  //           }
  //         })
  //       }
  //
  //       const query = `select value, overwork, bonuses, fines from lt_arena.salary where date = '${date.toFormat('yyyy-MM-dd')}' and worker_id = (select id from lt_arena.workers where name ilike '${workerName}')`
  //       const response = await db.query(query)
  //
  //       if (!response.rows.length) continue
  //       const data = response.rows[0]
  //       let salary: number = data?.value
  //
  //       let bonus = 0
  //       if (!salary || salary === 1500) continue
  //
  //       switch (gameHours) {
  //         case 1:
  //           bonus += 200
  //           break
  //         case 2:
  //           bonus += 400
  //           break
  //         case 3:
  //           bonus += 600
  //           break
  //       }
  //
  //       if (gameType !== 87) {
  //         bonus += 500
  //       }
  //
  //       if (
  //         dealAdditions.toLowerCase().includes('дп') ||
  //         dealAdditions.toLowerCase().includes('перс')
  //       ) {
  //         bonus += 250
  //       }
  //       //
  //       // if (workerName === 'Якудза') {
  //       //   console.debug(
  //       //     gameType,
  //       //     salary,
  //       //     gameHours,
  //       //     bonus,
  //       //     comment,
  //       //     date,
  //       //     deal.result.ID,
  //       //   )
  //       // }
  //
  //       const oldDataIndex = workersMap.findIndex(
  //         d => d.worker.toLowerCase() === workerName.toLowerCase(),
  //       )
  //
  //       workersDatesMap[workerName] = {
  //         worker: capitalize(workerName.toLowerCase()),
  //         dates: [
  //           ...(workersDatesMap[capitalize(workerName.toLowerCase())]?.dates ||
  //             []),
  //           date.toFormat('yyyy-MM-dd'),
  //         ],
  //       }
  //
  //       if (oldDataIndex !== -1) {
  //         workersMap[oldDataIndex] = {
  //           ...workersMap[oldDataIndex],
  //           value: workersMap[oldDataIndex].value + salary + bonus,
  //           oldValue: 0,
  //         }
  //       } else {
  //         workersMap.push({
  //           worker: workerName,
  //           value: salary + bonus,
  //           oldValue: 0,
  //         })
  //       }
  //     }
  //   }
  // }
  //
  // for (const data of Object.values(workersDatesMap)) {
  //   const uniqueDates = Array.from(new Set(data.dates))
  //
  //   const query = `select sum(value) + sum(coalesce(overwork, 0)) as value, string_agg(bonuses, '+') as bonuses from lt_arena.salary where worker_id=(select id from lt_arena.workers where name ilike '${data.worker}') and date in (
  //       ${uniqueDates
  //         .map(d => {
  //           return `'${d}'`
  //         })
  //         .join(', ')})`
  //
  //   const response = await db.query(query)
  //
  //   const {value, bonuses} = response.rows[0]
  //
  //   const summary = evaluate(`${value || 0} + ${bonuses || 0}`)
  //   const oldDataIndex = workersMap.findIndex(
  //     d => d.worker.trim().toLowerCase() === data.worker.trim().toLowerCase(),
  //   )
  //
  //   if (data.worker === 'Пабло') {
  //     // console.debug(
  //     //   oldDataIndex,
  //     //   workersMap[oldDataIndex],
  //     //   summary,
  //     //   response.rows,
  //     //   value,
  //     //   bonuses,
  //     //   evaluate(`${value || 0} + ${bonuses || 0}`),
  //     //   data.dates,
  //     //   uniqueDates
  //     //     .map(d => {
  //     //       return `'${d}'`
  //     //     })
  //     //     .join(', '),
  //     // )
  //   }
  //
  //   workersMap[oldDataIndex] = {
  //     ...workersMap[oldDataIndex],
  //     oldValue: summary,
  //   }
  //
  //   console.debug(`${data.worker} ${workersMap[oldDataIndex].value} ${summary}`)
  //   // if (data.worker === 'Пабло') {
  //   //   console.debug('pablo', oldDataIndex)
  //   //   console.debug(
  //   //     {
  //   //       ...workersMap[oldDataIndex],
  //   //       oldValue: summary,
  //   //     },
  //   //     workersMap[oldDataIndex],
  //   //   )
  //   // }
  // }
  //
  // console.debug(workersMap)
  // const text = workersMap
  //   .map(w => `${w.worker} ${w.value} ${w.oldValue}`)
  //   .join('\n')
  //
  // console.debug('done\n\n', text)
  //
  return NextResponse.json({data: ''})
}
