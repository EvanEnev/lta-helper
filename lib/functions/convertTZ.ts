export default function convertTZ(date: Date | undefined, tzString: string) {
  if (!date) date = new Date()
  return new Date(date.toLocaleString('en-US', {timeZone: tzString}))
}
