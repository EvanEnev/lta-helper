import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import db from '@/lib/database'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const worker = (await auth.api.getSession({
    headers: await headers(),
  }))!.user

  if (!body.lat || !body.lng) {
    return NextResponse.json({message: 'Не предоставлен адрес'}, {status: 500})
  }

  const query = `update workers
  set lat = ${body.lat},
      lng = ${body.lng}
  where id = ${worker.id}`

  try {
    await db.query(query)
    return NextResponse.json({})
  } catch (e) {
    console.error(e)
    // @ts-ignore
    return NextResponse.json({message: e.message}, {status: 500})
  }
}
