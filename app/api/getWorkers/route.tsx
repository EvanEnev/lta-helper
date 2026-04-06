import google from '@/lib/google'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

export async function GET() {
  const {user} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  if (!user) {
    return NextResponse.json({message: 'Ошибка авторизации'}, {status: 500})
  }

  await google.schedule.loadInfo()

  const sheet = google.schedule.sheetsByTitle['Сотрудники + расписание']
  await sheet.loadHeaderRow(1)

  const rows = await sheet.getRows()

  const workers = rows
    .map((row: GoogleSpreadsheetRow) => ({
      name: row.get('Позывной')?.split('-')[0]?.trim(),
      rank: row.get('Ранг') || 'Актёр',
    }))
    .filter((worker: any) => worker.name)

  return NextResponse.json({workers})
}
