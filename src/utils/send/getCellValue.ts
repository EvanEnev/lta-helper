import locations from "../locations"
import getCellValueByBGColor from "./getCellValueByBGColor"
import { CellBGColorStyle, CellValue } from "./types"

const valuesMap: {[key: string]: string} = {
    '+': 'Могу',
    '-': 'Не могу',
    '+/-': 'Могу с огр-ем'
}

export default function getCellValue(cellValue: string | undefined, cellBGColor: CellBGColorStyle): CellValue {
    const location = locations.find(l => l.toLowerCase() === cellValue?.toLowerCase())
    if (cellValue === 'Могу') return {value: '+', effectiveValue: valuesMap['+']}
    if (cellValue === 'Не могу') return {value: '-', effectiveValue: valuesMap['-']}
    if (cellValue === 'Могу с огр-ем') return {value: '+/-', effectiveValue: valuesMap['+/-']}
    if (location) return {value: '+', effectiveValue: location}

    const valueByBGColor = getCellValueByBGColor(cellBGColor)
    if (valueByBGColor) return {value: valueByBGColor, effectiveValue: valuesMap[valueByBGColor]}

    return {value: ''}
}