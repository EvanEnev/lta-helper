import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import checkPermissions from '@/lib/functions/checkPermissions'
import db from '@/lib/database'

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const worker = (await auth.api.getSession({headers: await headers()}))!.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], worker)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  const {id} = await params
  const workerId = parseInt(id)
  if (isNaN(workerId)) {
    return NextResponse.json({message: 'Некорректный id'}, {status: 400})
  }

  try {
    const result = await db.query(
      'SELECT permission_id, expires FROM relations.workers_permissions WHERE worker_id = $1',
      [workerId],
    )
    return NextResponse.json({permissions: result.rows}, {status: 200})
  } catch (e) {
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  }
}
