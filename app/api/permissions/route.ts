import {NextRequest, NextResponse} from 'next/server'
import requireManagePermissions from '@/lib/functions/requireManagePermissions'
import db from '@/lib/database'

export async function GET(_req: NextRequest) {
  const denied = await requireManagePermissions()
  if (denied) return denied

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
