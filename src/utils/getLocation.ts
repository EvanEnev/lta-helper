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

type locationsType = {
  [key: string]: string
}

const locations: locationsType = {
  Анклав: 'Анклав',
  ВБ: 'Военный Бункер',
  ДЗ: 'Дикий запад',
  Джунгли: 'Джунгли',
  КП: 'Киберпорт',
  ПС: 'Пиратская станция',
  Сити: 'Сити',
  ТП: 'Телепорт',
  УБ: 'Убежище',
  Фабрика: 'Забытая фабрика',
  Выезд: 'Выезд',
}

export default function getLocation(shortLocation: shortLocationsType) {
  const name = locations[shortLocation]
  return name
}
