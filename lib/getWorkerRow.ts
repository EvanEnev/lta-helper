import { GoogleSpreadsheetRow } from 'google-spreadsheet'

const findWorkerInRow = (name: string, rows: GoogleSpreadsheetRow[]) => {
  const workerRow = rows.find(
    (row) =>
      row.get('Позывной')?.split('-')[0]?.trim()?.toLowerCase() ===
      name.trim().toLowerCase()
  )

  return workerRow
}

export default function getWorkerRow(
  worker: string,
  workersRows: GoogleSpreadsheetRow[]
) {
  let workerRow = findWorkerInRow(worker.split(' ')[0], workersRows)

  if (!workerRow) workerRow = findWorkerInRow(worker.split('(')[0], workersRows)

  return workerRow
}
