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

const OPACITY = 35

const locations: LocationsType = {
  Анклав: {
    name: 'Анклав',
    color: `#6d9eeb${OPACITY}`,
  },
  ВБ: {
    name: 'Военный Бункер',
    color: `#6aa84f${OPACITY}`,
  },
  ДЗ: {
    name: 'Дикий запад',
    color: `#ff9900${OPACITY}`,
  },
  Джунгли: {
    name: 'Джунгли',
    color: `#b45f06${OPACITY}`,
  },
  КП: {
    name: 'Киберпорт',
    color: `#cc0000${OPACITY}`,
  },
  ПС: {
    name: 'Пиратская станция',
    color: `#666666${OPACITY}`,
  },
  Сити: {
    name: 'Сити',
    color: `#76a5af${OPACITY}`,
  },
  ТП: {
    name: 'Телепорт',
    color: `#8e7cc3${OPACITY}`,
  },
  УБ: {
    name: 'Убежище',
    color: `#b7b7b7${OPACITY}`,
  },
  Фабрика: {
    name: 'Забытая фабрика',
    color: `#c27ba0${OPACITY}`,
  },
  Выезд: {
    name: 'Выезд',
    color: `#a64d79${OPACITY}`,
  },
}

export default function getLocation(
  shortLocation: shortLocationsType,
): Location {
  const name = locations[shortLocation]
  return name
}
