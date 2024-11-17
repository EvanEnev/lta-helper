export default function convertDate (localeString: string) {
    const datePart = localeString?.split(', ')[1]?.split(' г.')[0]
  
    if (!datePart) return ''
  
    const monthMap: { [key: string]: number } = {
      января: 0,
      февраля: 1,
      марта: 2,
      апреля: 3,
      мая: 4,
      июня: 5,
      июля: 6,
      августа: 7,
      сентября: 8,
      октября: 9,
      ноября: 10,
      декабря: 11,
    }
  
    const [day, monthName, year] = datePart.split(' ')
    const month = monthMap[monthName]
    const date = new Date(parseInt(year), month, parseInt(day), 0, 0, 0, 0)
  
    return date
  }