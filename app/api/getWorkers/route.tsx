import google from '@/lib/google'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextResponse} from 'next/server'
import createAdminSupabase from '@/lib/createAdminSupabase'

export async function GET() {
  const supabase = await createAdminSupabase()
  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  await google.schedule.loadInfo()

  const sheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
  await sheet.loadHeaderRow(7)

  const rows = await sheet.getRows()

  const workers = rows
    .map((row: GoogleSpreadsheetRow) => ({
      name: row.get('Позывной')?.split('-')[0]?.trim(),
      rank: row.get('Ранг') || 'Актёр',
    }))
    .filter((worker: any) => worker.name)

  return NextResponse.json({workers})
}
