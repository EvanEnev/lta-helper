import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'

// Общая проверка для /api/permissions/*: null - можно продолжать
export default async function requireManagePermissions() {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  if (!checkPermissions(['manage_permissions'], session.user)) {
    return NextResponse.json({message: 'Нет прав'}, {status: 403})
  }

  return null
}

export const toId = (value: unknown) => {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}
