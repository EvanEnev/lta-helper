import getDefaultDays from '@/lib/getDefaultDays'
import {NextResponse} from 'next/server'

export async function GET() {
  const days = await getDefaultDays()
  return NextResponse.json({days})
}
