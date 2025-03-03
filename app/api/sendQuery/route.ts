import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'

const KEY = 'eff93f039b75fb883af6be4d92d87e61'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const key = body.key
  const query = body.query

  if (key !== KEY)
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 501})

  console.log(query)
  const result = await db.query(query)

  const response = result.rows?.length ? {rows: result.rows} : {rows: []}
  return NextResponse.json(response, {status: 200})
}
