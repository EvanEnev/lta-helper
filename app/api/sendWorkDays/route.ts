import google from '@/lib/google'
import validateData from '@/lib/validateData'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import {NextRequest, NextResponse} from 'next/server'

const getWorkerRow = (workerName: string, rows: GoogleSpreadsheetRow[]) => {
  return rows.find(
    // @ts-ignore
    row => row._rawData[0]?.split('-')[0]?.trim() === workerName.trim(),
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await validateData(body?.initData)

  const workerName = body.workerName
  const time = body.time
  const date = body.date
  const bonuses = body.bonuses
  const comment = body.comment

  if (!user) {
    return NextResponse.json({message: 'Ошибка валидации'}, {status: 500})
  }

  if (!(workerName && time && date)) {
    return NextResponse.json({message: 'Ошибка данных'}, {status: 500})
  }

  const doc = await google()

  await doc.actors.loadInfo()
  await doc.workers.loadInfo()

  const workersSheet = doc.workers.sheetsByIndex[0]
  const actorsSheet = doc.actors.sheetsByIndex[0]

  await Promise.all([workersSheet.loadHeaderRow(), actorsSheet.loadHeaderRow()])

  const workersRows = await workersSheet.getRows()
  const actorsRows = await actorsSheet.getRows()

  const workerRow = getWorkerRow(workerName, workersRows)
  const actorRow = getWorkerRow(workerName, actorsRows)

  const workerRowNumber = workerRow?.rowNumber
  const actorRowNumber = actorRow?.rowNumber

  if (!workerRowNumber && !actorRowNumber)
    return NextResponse.json(
      {message: 'Сотрудник не найден в таблице'},
      {status: 404},
    )

    const dateColoumnNumber = 
}
