import { DateTime } from 'luxon'

export default function convertTZ(
    inputDate: Date,
    toZone: string
): DateTime {
  const dt = DateTime.fromJSDate(inputDate, { zone: 'UTC' })

  return dt.setZone(toZone)
}
