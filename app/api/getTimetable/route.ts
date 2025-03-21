import {auth} from '@/auth'
import db from '@/lib/database'
import sortByRanks from '@/lib/sortByRank'
import groupBy from '@/src/utils/groupBy'
import {NextResponse} from 'next/server'

export async function GET() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }
  const membersQuery = `SELECT
    name,
    id,
    rank
    FROM lt_arena.workers`
  const membersResult = await db.query(membersQuery)
  const members = membersResult.rows

  const sortedMembers = sortByRanks(members)

  const query = `SELECT
    *
    FROM lt_arena.schedule s
    LEFT JOIN lt_arena.dates d ON d.id = 2
    WHERE s.date BETWEEN d.start_date AND d.end_date`

  const result = await db.query(query)
  const schedule = result.rows

  const workers = sortedMembers.map(worker => {
    const data = schedule.find(obj => obj.worker_id === worker.id)

    if (data) {
      worker.days = schedule.filter(obj => obj.worker_id === worker.id)
    } else {
      worker.days = []
    }

    return worker
  })

  return NextResponse.json({workers})
}
