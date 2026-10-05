import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'

const isCoord = (value: unknown, limit: number): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  Math.abs(value) <= limit

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session) {
    return NextResponse.json({message: 'Не авторизован'}, {status: 401})
  }

  const body = await req.json().catch(() => null)

  if (!isCoord(body?.lat, 90) || !isCoord(body?.lng, 180)) {
    return NextResponse.json({message: 'Не предоставлен адрес'}, {status: 400})
  }

  try {
    // меняется только адрес самого пользователя, значения - параметрами
    await db.query('update workers set lat = $1, lng = $2 where id = $3', [
      body.lat,
      body.lng,
      session.user.id,
    ])

    return NextResponse.json({})
  } catch (e) {
    console.error(e)

    return NextResponse.json({message: 'Не удалось сохранить'}, {status: 500})
  }
}
