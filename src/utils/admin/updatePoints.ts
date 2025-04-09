import {SheetData} from '@/app/api/sendWorkDays/route'
import {GoogleSpreadsheetRow} from 'google-spreadsheet'
import conn from '@/lib/database'
import google from '@/lib/google'
import {google as rawGoogle} from 'googleapis'

export default async function updatePoints({
  name,
  rank,
  date,
  comment,
  hasGames,
  location,
  sheetData,
}: {
  name: string
  rank: string
  date: Date
  comment: string
  hasGames: boolean
  location: string
  sheetData: SheetData
}) {
  let rows
  let sheet

  switch (rank.toLowerCase()) {
    case 'платиновый':
      rows = sheetData.rows.platinumPointsRows
      sheet = sheetData.sheets.platinumPointsSheet
      break
    case 'золотой':
      rows = sheetData.rows.goldPointsRows
      sheet = sheetData.sheets.goldPointsSheet
      break
    default:
      rows = sheetData.rows.pointsRows
      sheet = sheetData.sheets.pointsSheet
      break
  }

  const row = rows.find(
    (row: GoogleSpreadsheetRow) =>
      Reflect.get(row, '_rawData')[1]?.split('-')[0]?.trim() === name.trim(),
  )

  if (!row) return false

  const rawData = Reflect.get(row, '_rawData')

  let currentRow: GoogleSpreadsheetRow = row

  while (Reflect.get(currentRow, '_rawData')[3] !== 'Штрафы') {
    currentRow = rows[currentRow.rowNumber]
  }

  const fines = parseInt(Reflect.get(currentRow, '_rawData')[4])

  const dateIndex = sheet.headerValues.findLastIndex((headerValue: string) => {
    const splittedValue = headerValue?.split('-')
    if (!splittedValue.length || splittedValue.length < 2) return false

    const startDateParts = splittedValue[0].split('.')
    const endDateParts = splittedValue[1].split('.')

    const startDate = new Date(
      new Date().getFullYear(),
      parseInt(startDateParts[1]) - 1,
      parseInt(startDateParts[0]),
    )

    const endDate = new Date(
      new Date().getFullYear(),
      parseInt(endDateParts[1]) - 1,
      parseInt(endDateParts[0]),
    )

    const initialDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )

    return (
      initialDate.valueOf() >= startDate.valueOf() &&
      initialDate.valueOf() <= endDate.valueOf()
    )
  })

  if (dateIndex === -1) return false

  await sheet.loadCells({
    startRowIndex: row.rowNumber - 1,
    endRowIndex: row.rowNumber,
    startColumnIndex: dateIndex,
    endColumnIndex: dateIndex + 2,
  })

  const commentCell = sheet.getCell(row.rowNumber - 1, dateIndex)
  const numberCell = sheet.getCell(row.rowNumber - 1, dateIndex + 1)

  const currentPoints = parseInt(rawData[4])

  const query = `SELECT
  r.max_shift_points as max,
  l.short_name as location
  FROM lt_arena.ranks r
  LEFT JOIN lt_arena.locations l ON LOWER(l.name) = '${location.toLowerCase()}'
  WHERE LOWER(r.name) = '${rank.toLowerCase()}'`

  const result = await conn.query(query)
  const data = result.rows[0]
  const maxPoints: number = data?.max || 0

  const text = `, ${date.toLocaleDateString('ru-RU', {month: 'numeric', day: 'numeric'})} ${data.location}`

  if (commentCell.stringValue?.toLowerCase().includes(text.toLowerCase()))
    return false

  let pointsToAdd = 1
  const splitComment = comment.toLowerCase().split('\n')
  if (
    rank.toLowerCase() === 'серебряный' &&
    splitComment.some(
      line =>
        line.includes('ст') ||
        line.includes('ст. смены') ||
        line.includes('старший смены') ||
        line.includes('ст. смены') ||
        line.includes('ст смены'),
    )
  ) {
    pointsToAdd = 2
  }

  if (rank.toLowerCase() === 'каменный' && hasGames) {
    pointsToAdd = 2
  }

  if (currentPoints + fines + 1 > maxPoints) {
    const googleAuth = google().auth

    const sheets = rawGoogle.sheets({version: 'v4', auth: googleAuth})

    const textFormatRuns = Reflect.get(commentCell, '_rawData')?.textFormatRuns

    let startIndex = (commentCell.stringValue + text).indexOf(text)

    if (textFormatRuns?.length) {
      startIndex =
        textFormatRuns.findLast((format: any) => !!format?.startIndex)
          ?.startIndex || 0
    }

    const requests = [
      {
        updateCells: {
          rows: [
            {
              values: [
                {
                  userEnteredValue: {
                    stringValue: commentCell.stringValue + text,
                  },
                  textFormatRuns: [
                    {
                      format: {
                        foregroundColor: {
                          red: 0.7176471,
                          green: 0.7176471,
                          blue: 0.7176471,
                        },
                      },
                      startIndex:
                        startIndex ||
                        (commentCell.stringValue + text).indexOf(text),
                    },
                  ],
                },
              ],
            },
          ],
          fields: 'userEnteredValue,textFormatRuns',
          start: {
            sheetId: sheet.sheetId,
            rowIndex: commentCell.rowIndex,
            columnIndex: commentCell.columnIndex,
          },
        },
      },
    ]

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheet._spreadsheet.spreadsheetId,
      requestBody: {
        requests,
      },
    })
  } else {
    numberCell.numberValue = (numberCell.numberValue || 0) + pointsToAdd
    commentCell.stringValue = commentCell.stringValue + text
  }

  return true
}
