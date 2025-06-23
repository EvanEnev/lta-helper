import getCellValueByBGColor from './getCellValueByBGColor'
import {CellBGColorStyle, CellValue} from './types'
import getLocations from '@/lib/functions/getLocations'

const valuesMap: {[key: string]: string} = {
  '+': 'Могу',
  '-': 'Не могу',
  '+/-': 'Могу с огр-ем',
}

export default async function getCellValue(
  cellValue: string | undefined,
  cellBGColor: CellBGColorStyle,
): Promise<CellValue> {
  const locations = await getLocations()

  const location = locations.find(
    l => l.name.toLowerCase() === cellValue?.toLowerCase(),
  )

  if (cellValue === 'Могу') return {value: '+', effectiveValue: valuesMap['+']}
  if (cellValue === 'Не могу')
    return {value: '-', effectiveValue: valuesMap['-']}
  if (cellValue === 'Могу с огр-ем')
    return {value: '+/-', effectiveValue: valuesMap['+/-']}
  if (location) return {value: '+', effectiveValue: location.name}

  const valueByBGColor = getCellValueByBGColor(cellBGColor)
  if (valueByBGColor)
    return {value: valueByBGColor, effectiveValue: valuesMap[valueByBGColor]}

  return {value: ''}
}
