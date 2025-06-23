import auth from '@/lib/auth'
import checkPermissions from '@/lib/functions/checkPermissions'
import {NextResponse} from 'next/server'
import getLocations from '@/lib/functions/getLocations'

export async function GET() {
  const worker = await auth()

  const canViewFull = checkPermissions(['view_full_salary'], worker)

  if (!canViewFull) {
    return NextResponse.json({message: 'Нет прав'}, {status: 500})
  }

  const locations = await getLocations()

  return NextResponse.json({data: locations})
}
