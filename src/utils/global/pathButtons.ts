const buttons: {name: string; href: string; permission?: string}[] = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission: 'set_salary'},
  {name: 'График ЗП', href: '/salary'},
  {name: 'Расписание', href: '/timetable', permission: 'view_timetable'},
]

export default buttons
