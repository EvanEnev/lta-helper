import {NextRequest, NextResponse} from 'next/server'
import requireManagePermissions, {
  toId,
} from '@/lib/functions/requireManagePermissions'
import db from '@/lib/database'

export async function GET(_req: NextRequest) {
  const denied = await requireManagePermissions()
  if (denied) return denied

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
  const denied = await requireManagePermissions()
  if (denied) return denied

  const body = await req.json().catch(() => null)
  const permissionId = toId(body?.permission_id)
  const rankId = body?.rank_id == null ? null : toId(body.rank_id)

  if (permissionId === null) {
    return NextResponse.json({message: 'Не указано право'}, {status: 400})
  }

  if (body?.rank_id != null && rankId === null) {
    return NextResponse.json({message: 'Некорректный ранг'}, {status: 400})
  }

  // Замена правила - одной транзакцией: иначе сбой между DELETE и INSERT
  // оставил бы право без правила по рангу
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    await client.query(
      'DELETE FROM config.default_permissions WHERE permission_id = $1',
      [permissionId],
    )
    if (rankId !== null) {
      await client.query(
        'INSERT INTO config.default_permissions (rank_id, permission_id) VALUES ($1, $2)',
        [rankId, permissionId],
      )
    }
    await client.query('COMMIT')

    return NextResponse.json({ok: true}, {status: 200})
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(e)
    return NextResponse.json({message: 'Ошибка в запросе'}, {status: 500})
  } finally {
    client.release()
  }
}
