export default function getDatesInRange(mode: 'current' | 'next' = 'current') {
    const today = new Date()
    let first = today.getDate() - today.getDay() + 1
    let end = today.getDate() - today.getDay() + 7

    if(mode === 'next') {
        first += + 7
        end += 7
    }

    const startDate = new Date(new Date().setDate(first))
    const endDate = new Date(new Date().setDate(end))

    const dates = []

    while (startDate <= endDate) {
        dates.push(new Date(startDate))
        startDate.setDate(startDate.getDate() + 1)
    }

    return dates
}
