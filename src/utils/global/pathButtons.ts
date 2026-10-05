import {
  LucideIcon,
  PartyPopper,
  House,
  User,
  Clock,
  Users,
  Shield,
  BadgeRussianRuble,
  CirclePlus,
  Wallet,
  ReceiptText,
  BanknoteArrowDown,
} from 'lucide-react'

interface ButtonBase {
  name: string
  href: string
  permission?: string
  isDisabled?: boolean // Админы видят
  hide?: boolean // Не видит никто
  icon?: LucideIcon
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
    icon: PartyPopper,
    hide: true,
  },
  {name: 'Главная', href: '/', icon: House},
  {
    name: 'Профиль',
    href: '/profile',
    icon: User,
  },
  {
    name: 'График работы',
    href: '/schedule',
    icon: Clock,
  },
  {
    name: 'Сотрудники',
    href: '/workers',
    icon: Users,
  },
  {
    name: 'Права',
    href: '/settings/permissions',
    icon: Shield,
    isDisabled: true,
  },
  {
    name: 'Деньги',
    href: '#',
    icon: BadgeRussianRuble,
    children: [
      {
        name: 'Проставление ЗП',
        href: '/admin',
        permission: 'set_salary',
        icon: CirclePlus,
      },
      {
        name: 'График ЗП',
        href: '/salary',
        icon: Wallet,
      },
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
        icon: ReceiptText,
      },
      {
        name: 'Получение ЗП',
        permission: 'view_payrolls',
        href: '/payrolls/issue',
        icon: BanknoteArrowDown,
      },
    ],
  },
]

export default buttons
