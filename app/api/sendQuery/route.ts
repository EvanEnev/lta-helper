import {timingSafeEqual} from 'node:crypto'
import {Pool} from 'pg'
import db from '@/lib/database'
import {NextRequest, NextResponse} from 'next/server'
import logger from '@/Logger'

const KEY = process.env.KEY

const MAX_FAILS = 5
const WINDOW_MS = 10 * 60 * 1000
const fails = new Map<string, {count: number; since: number}>()

const restricted =
  process.env.SENDQUERY_DATABASE_USER && process.env.SENDQUERY_DATABASE_PASSWORD
    ? new Pool({
        user: process.env.SENDQUERY_DATABASE_USER,
        password: process.env.SENDQUERY_DATABASE_PASSWORD,
        host: process.env.DATABASE_URL,
        port: parseInt(process.env.DATABASE_PORT!),
        database: process.env.DATABASE_NAME,
        max: 3,
      })
    : null

const sameKey = (value: unknown) => {
  if (!KEY || typeof value !== 'string') return false

  const a = Buffer.from(value)
  const b = Buffer.from(KEY)

  return a.length === b.length && timingSafeEqual(a, b)
}

const clientId = (req: NextRequest) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

const blocked = (id: string) => {
  const entry = fails.get(id)

  if (!entry) return false

  if (Date.now() - entry.since > WINDOW_MS) {
    fails.delete(id)
    return false
  }

  return entry.count >= MAX_FAILS
}

const registerFail = (id: string) => {
  const entry = fails.get(id)

  if (!entry || Date.now() - entry.since > WINDOW_MS) {
    fails.set(id, {count: 1, since: Date.now()})
  } else {
    entry.count += 1
  }
}

export async function POST(req: NextRequest) {
  const id = clientId(req)

  if (blocked(id)) {
    return NextResponse.json({message: 'Слишком много попыток'}, {status: 429})
  }

  const body = await req.json().catch(() => null)

  if (!sameKey(body?.key)) {
    registerFail(id)

    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 401})
  }

  if (typeof body.query !== 'string' || !body.query.trim()) {
    return NextResponse.json({message: 'Запрос не указан'}, {status: 400})
  }

  logger.info('Query', {data: body.query, ip: id})

  const client = await (restricted ?? db).connect()

  try {
    await client.query("set statement_timeout = '30s'")

    const result = await client.query(body.query)

    return NextResponse.json({rows: result.rows ?? []}, {status: 200})
  } catch (e) {
    console.error('QUERY ERROR: ', e instanceof Error ? e.message : e)

    return NextResponse.json({rows: []}, {status: 200})
  } finally {
    await client.query('reset statement_timeout').catch(() => {})
    client.release()
  }
}
