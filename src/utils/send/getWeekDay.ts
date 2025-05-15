export default function getWeekDay(dateString: string): string {
  const [day, month] = dateString.split('.').map(v => parseInt(v))
  const dateObject = new Date(2025, month - 1, day)
  return dateObject.toLocaleDateString('ru-RU', {
    weekday: 'long',
  })
}
