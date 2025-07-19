import {Home, ClockCircle, Ruble, AddCircle} from 'solar-icon-set'

const buttons: {
  name: string
  href: string
  permission?: string
  icon?: any
}[] = [
  {name: 'Главная', href: '/', icon: Home},
  {name: 'График работы', href: '/schedule', icon: ClockCircle},
  {
    name: 'График персонала',
    href: '/admin',
    permission: 'set_salary',
    icon: AddCircle,
  },
  {name: 'График ЗП', href: '/salary', icon: Ruble},
]

export default buttons
