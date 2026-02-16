import {
  Home,
  ClockCircle,
  Ruble,
  AddCircle,
  BillList,
  CashOut,
  Wallet,
  ConfettiMinimalistic,
  UsersGroupRounded,
} from 'solar-icon-set'
import {ElementType} from 'react'

interface ButtonBase {
  name: string
  href: string
  permission?: string
  isDisabled?: boolean // Админы видят
  hide?: boolean // Не видит никто
  icon?: ElementType
  className?: string
}

interface PathButton extends ButtonBase {
  children?: ButtonBase[]
}

const buttons: PathButton[] = [
  {
    name: 'Итоги года',
    href: '/wrapped',
    className: `relative rounded-xl overflow-hidden
            before:content-['']
            before:absolute before:inset-0
            before:shadow-[inset_0_0_20px_rgba(168,85,247,0.6)]
            before:pointer-events-none`,
    icon: ConfettiMinimalistic,
    hide: true,
  },
  {name: 'Главная', href: '/', icon: Home},
  {name: 'График работы', href: '/schedule', icon: ClockCircle},
  {name: 'Сотрудники', href: '/workers', icon: UsersGroupRounded},
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
      {
        name: 'Сводная',
        href: '/salary/summarized',
        icon: Wallet,
        permission: 'view_full_salary',
      },
      {
        name: 'Выплаты',
        href: '/payments',
        icon: Wallet,
      },
      {
        name: 'Ведомости',
        href: '/payrolls',
        permission: 'view_payrolls',
        icon: BillList,
      },
      {
        name: 'Получение ЗП',
        permission: 'view_payrolls',
        href: '/payrolls/issue',
        icon: CashOut,
      },
    ],
  },
]

export default buttons
