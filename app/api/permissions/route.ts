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
      'SELECT id, name, description FROM config.permissions ORDER BY name',
    )
    return NextResponse.json({permissions: result.rows}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}
