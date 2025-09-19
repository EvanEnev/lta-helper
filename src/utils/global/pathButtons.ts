import {
  Home,
  ClockCircle,
  Ruble,
  AddCircle,
  BillList,
  CashOut,
  Wallet,
} from 'solar-icon-set'
import {ElementType} from 'react'

interface PathButton {
  name: string
  href: string
  permission?: string
  icon?: ElementType
  children?: {
    name: string
    href: string
    permission?: string
    icon?: ElementType
  }[]
}

const buttons: PathButton[] = [
  {name: 'Главная', href: '/', icon: Home},
  {name: 'График работы', href: '/schedule', icon: ClockCircle},

  {
    name: 'Деньги',
    href: '#',
    icon: Ruble,
    children: [
      {
        name: 'Проставление ЗП',
        href: '/admin',
        permission: 'set_salary',
        icon: AddCircle,
      },
      {name: 'График ЗП', href: '/salary', icon: Wallet},
      {name: 'Ведомости', href: '/payrolls', icon: BillList},
      {name: 'Получение ЗП', href: 'payrolls/issue', icon: CashOut},
    ],
  },
]

export default buttons
