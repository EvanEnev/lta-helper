import compareObjects from '../../../lib/functions/compareObjects'
import {CellBGColorStyle} from './types'

interface BGColor {
  red?: number
  blue?: number
  green?: number
}

interface BGColors {
  darkRed: BGColor
  black: BGColor
}

const BACKGROUND_COLORS: BGColors = {
  darkRed: {red: 0.6},
  black: {},
}

const bgColorsMap: {[key: string]: string} = {
  darkRed: '-',
  black: '-',
}

const entries = Object.entries(BACKGROUND_COLORS)

export default function getCellValueByBGColor(bgColor: CellBGColorStyle) {
  let computedValue = ''

  entries.forEach(([key, value]) => {
    if (compareObjects(bgColor.rgbColor, value)) {
      computedValue = bgColorsMap[key]
    }
  })

  return computedValue
}
