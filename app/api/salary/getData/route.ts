import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/lib/auth'
import getLocationSalaryData from '@/app/api/salary/getData/getLocationSalaryData'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})

  if (!session?.user) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body = await req.json().catch(() => ({}))

  const locationId: number | undefined = body.locationId
  const date: string | undefined = body.date

  if (!date) {
    return NextResponse.json({message: 'Неправильный месяц'}, {status: 500})
  }

  if (!locationId) {
    return NextResponse.json({message: 'Неправильная локация'}, {status: 500})
  }

  const data = await getLocationSalaryData({
    locationId,
    date,
    allLocations: body.allLocations || false,
  })

  return NextResponse.json({data})
}
