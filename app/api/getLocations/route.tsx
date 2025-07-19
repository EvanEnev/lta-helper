import {NextResponse} from 'next/server'
import getLocations from '@/lib/functions/getLocations'

export async function GET() {
  const locations = await getLocations()

  return NextResponse.json({data: locations})
}
