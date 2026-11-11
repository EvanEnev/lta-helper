import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import getLocations from '@/lib/functions/getLocations'

export async function GET() {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const locations = await getLocations()

  return NextResponse.json({data: locations})
}
