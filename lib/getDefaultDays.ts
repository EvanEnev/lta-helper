import google from '@/lib/google'

export default async function getDefaultDays() {
  const doc = google()
  await doc.schedule.loadInfo()

  const sheet = doc.schedule.sheetsByTitle['Сотрудники + расписание']
  
  await sheet.loadHeaderRow(7)
  
  const headerValues = sheet.headerValues
    .slice(9, 23)
    .map((value: string) => value.split(' ')[1])

  return headerValues
}
