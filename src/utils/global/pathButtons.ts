const buttons: {name: string; href: string; permission?: string}[] = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission: 'edit_salary'},
  {name: 'График ЗП', href: '/salary'},
]

export default buttons
