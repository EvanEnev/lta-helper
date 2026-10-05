import {NextRequest, NextResponse} from 'next/server'
import requireManagePermissions from '@/lib/functions/requireManagePermissions'
import db from '@/lib/database'

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
) {
  const denied = await requireManagePermissions()
  if (denied) return denied

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
