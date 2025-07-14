import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import logger from '@/lib/Logger'

const KEY = process.env.KEY

export async function POST(req: NextRequest) {
  const body = await req.json()

  const key = body.key
  const query = body.query

  if (key !== KEY)
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 501})

  logger.info('Query', {data: query})

  const result = await db.query(query)

  const response = result.rows?.length ? {rows: result.rows} : {rows: []}
  return NextResponse.json(response, {status: 200})
}
