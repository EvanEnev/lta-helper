export default function getWeekDay(dateString: string): string {
  const [day, month] = dateString.split('.').map(v => parseInt(v))
  const dateObject = new Date(2024, month - 1, day)
  const weekday = dateObject.toLocaleDateString('ru-RU', {
    weekday: 'long',
  })

  return weekday
}
