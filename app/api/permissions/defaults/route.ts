import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

export async function GET(_req: NextRequest) {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  try {
    const result = await db.query(
      `SELECT dp.permission_id, dp.rank_id, r.name as rank_name, r.weight as rank_weight
       FROM config.default_permissions dp
       JOIN ranks r ON r.id = dp.rank_id`,
    )
    return NextResponse.json({defaultPermissions: result.rows}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}

export async function POST(req: NextRequest) {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const body = await req.json()
  const {permission_id, rank_id} = body

  if (!permission_id) {
    return NextResponse.json({message: 'Не указано право'}, {status: 400})
  }

  try {
    await db.query(
      'DELETE FROM config.default_permissions WHERE permission_id = $1',
      [permission_id],
    )
    if (rank_id != null) {
      await db.query(
        'INSERT INTO config.default_permissions (rank_id, permission_id) VALUES ($1, $2)',
        [rank_id, permission_id],
      )
    }
    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}
