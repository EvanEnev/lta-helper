interface ButtonBase {
  name: string
  href: string
  permission?: string
  isDisabled?: boolean // Админы видят
  hide?: boolean // Не видит никто
  icon?: string
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
    icon: 'solar:confetti-minimalistic-linear',
    hide: true,
  },
  {name: 'Главная', href: '/', icon: 'solar:home-angle-linear'},
  {
    name: 'Профиль',
    href: '/profile',
    icon: 'solar:user-linear',
  },
  {
    name: 'График работы',
    href: '/schedule',
    icon: 'solar:clock-circle-linear',
  },
  {
    name: 'Сотрудники',
    href: '/workers',
    icon: 'solar:users-group-rounded-linear',
  },
  {
    name: 'Права',
    href: '/settings/permissions',
    icon: 'solar:shield-keyhole-linear',
    isDisabled: true,
  },
  {
    name: 'Деньги',
    href: '#',
    icon: 'solar:ruble-linear',
    children: [
      {
        name: 'Проставление ЗП',
        href: '/admin',
        permission: 'set_salary',
        icon: 'solar:add-circle-linear',
      },
      {
        name: 'График ЗП',
        href: '/salary',
        icon: 'solar:wallet-linear',
      },
      {
        name: 'Сводная',
        href: '/salary/summarized',
        icon: 'solar:wallet-linear',
        permission: 'view_full_salary',
      },
      {
        name: 'Сводная 2',
        href: '/salary/summarized2',
        icon: 'solar:wallet-linear',
        permission: 'view_full_salary',
      },
      {
        name: 'Выплаты',
        href: '/payments',
        icon: 'solar:wallet-linear',
      },
      {
        name: 'Ведомости',
        href: '/payrolls',
        permission: 'view_payrolls',
        icon: 'solar:bill-list-linear',
      },
      {
        name: 'Получение ЗП',
        permission: 'view_payrolls',
        href: '/payrolls/issue',
        icon: 'solar:cash-out-linear',
      },
    ],
  },
]

export default buttons
