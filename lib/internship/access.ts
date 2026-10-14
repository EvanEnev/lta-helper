import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'

export const fail = (message: string, status = 400) =>
  NextResponse.json({message}, {status})

export async function requireCurator() {
  const session = await auth.api.getSession({headers: await headers()})
  const user = session?.user

  if (!user) return {error: fail('Вход не произведён', 401), user: null}

  if (!checkPermissions(['manage_internship'], user)) {
    return {error: fail('Недостаточно прав', 403), user: null}
  }

  return {error: null, user}
}

export const text = (value: unknown, max: number) => {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string' || value.length > max) return null

  return value.trim()
}
