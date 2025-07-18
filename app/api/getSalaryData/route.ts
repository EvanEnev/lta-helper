import {NextRequest, NextResponse} from 'next/server'
import getLocationSalaryData from '@/app/salary/getLocationSalaryData'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const locationId: number | undefined = body.locationId
  const date: string | undefined = body.date

  if (!date) {
    return NextResponse.json({message: 'Неправльный месяц'}, {status: 500})
  }

  if (!locationId) {
    return NextResponse.json({message: 'Неправльная локация'}, {status: 500})
  }

  const data = await getLocationSalaryData({
    locationId,
    date,
    allLocations: body.allLocations || false,
  })

  return NextResponse.json({data})
}
