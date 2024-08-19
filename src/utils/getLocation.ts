import {Location} from './types'

type shortLocationsType =
  | 'Анклав'
  | 'Военный Бункер'
  | 'Дикий запад'
  | 'Джунгли'
  | 'Киберпорт'
  | 'Пиратская станция'
  | 'Сити'
  | 'Телепорт'
  | 'Убежище'
  | 'Забытая фабрика'
  | 'Выезд'

type LocationsType = {
  [key: string]: {
    name: string
    color: string
  }
}

const locations: LocationsType = {
  Анклав: {
    name: 'Анклав',
    color: 'linear-gradient(to top, #173a6e, #1D4E8F)', // Slightly darkened blue to original blue
  },
  ВБ: {
    name: 'Военный Бункер',
    color: 'linear-gradient(to top, #20521e, #2B6E27)', // Slightly darkened green to original green
  },
  ДЗ: {
    name: 'Дикий запад',
    color: 'linear-gradient(to top, #804400, #A65B00)', // Slightly darkened orange to original orange
  },
  Джунгли: {
    name: 'Джунгли',
    color: 'linear-gradient(to top, #5d2f03, #7A3E04)', // Slightly darkened brown to original brown
  },
  КП: {
    name: 'Киберпорт',
    color: 'linear-gradient(to top, #730000, #990000)', // Slightly darkened red to original red
  },
  ПС: {
    name: 'Пиратская станция',
    color: 'linear-gradient(to top, #3a3a3a, #4D4D4D)', // Slightly darkened gray to original gray
  },
  Сити: {
    name: 'Сити',
    color: 'linear-gradient(to top, #36585c, #4A7379)', // Slightly darkened teal to original teal
  },
  ТП: {
    name: 'Телепорт',
    color: 'linear-gradient(to top, #503a82, #674EA7)', // Slightly darkened purple to original purple
  },
  УБ: {
    name: 'Убежище',
    color: 'linear-gradient(to top, #555555, #6D6D6D)', // Slightly darkened light gray to original light gray
  },
  Фабрика: {
    name: 'Забытая фабрика',
    color: 'linear-gradient(to top, #6a3750, #8A4663)', // Slightly darkened pink to original pink
  },
  Выезд: {
    name: 'Выезд',
    color: 'linear-gradient(to top, #571f3e, #732C51)', // Slightly darkened magenta to original magenta
  },
}

export default function getLocation(
  shortLocation: shortLocationsType,
): Location {
  const name = locations[shortLocation]
  return name
}
