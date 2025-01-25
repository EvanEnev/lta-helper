export default function groupBy(array: Array<any>, key: string) {
  return array.reduce((acc, obj) => {
    const groupKey = obj[key]
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(obj)
    return acc
  }, {})
}
