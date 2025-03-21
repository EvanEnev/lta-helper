import {auth} from '@/auth'
import google from '@/lib/google'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'

export async function GET() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  const doc = google()
  await doc.schedule.loadInfo()

  const sheet = doc.schedule.sheetsByTitle['Сотрудники + расписание']
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
