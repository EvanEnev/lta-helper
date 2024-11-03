import google from '@/lib/google'
import validateData from '@/lib/validateData'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await validateData(body?.initData)

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
