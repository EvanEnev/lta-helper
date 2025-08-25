import db from '@/lib/database'
import {NextResponse} from 'next/server'

export async function GET() {
  const query = `select daterange('[2025-02-01,2025-02-02)'), date('2025-08-01')`

  const result = await db.query(query)

  console.debug(result.rows)
  // console.debug(
  //   DateTime.fromFormat('[2025-02-01,2025-02-16)', '[yyyy-MM-dd,yyyy-MM-dd)'),
  // )
  //
  // console.debug(
  //   '[2025-02-01,2025-02-16)'.slice(1, -1).replace(',', '/'),
  //   Interval.fromISO(
  //     '[2025-02-01,2025-02-16)'.slice(1).slice(0, -1).replace(',', '/'),
  //   ),
  // )

  return NextResponse.json({data: result.rows})
}
