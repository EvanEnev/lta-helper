const locations: { [index: string]: string } = {
    АНК: 'Анклав',
    ВБ: 'Военный Бункер',
    СТ: 'Сити',
    ЗФ: 'Забытая Фабрика',
    ПС: 'Пиратская станция',
    ВР: 'Виармания Арена',
    ДЖ: 'Джунгли',
    ДЗ: 'Дикий Запад',
    КП: 'Киберпорт',
    УБ: 'Убежище',
    ТП: 'Телепорт',
    ВЫЕЗД: 'Выезд',
  }
  
  const values = Object.values(locations)
  
  export default function getLocation(locationName: string) {
    const foundByKey = locations[locationName.toUpperCase()]
  
    const foundByValue = values.find(
      (value) => value.toLowerCase() === locationName.toLowerCase()
    )
  
    return foundByKey || foundByValue
  }