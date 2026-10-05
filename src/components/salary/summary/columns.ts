// Каталог колонок сводной. Раньше это были две страницы с разным набором колонок
// и разным «остатком»; теперь обе - пресеты одной страницы.

export interface SummaryRow {
  workerId: number
  workerName: string
  rank: string
  isFormer: boolean
  [field: string]: number | string | boolean | null
}

export interface ColumnDef {
  id: string
  title: string
  hint?: string
  group: 'Начисления' | 'Игры' | 'Итоги' | 'Выплаты и остаток'
  fields: string[] // складываются, как и раньше
  sums: string // что суммирует колонка - для списка выбора и подсказки
}

export const NAME_COLUMN = 'name'

const RAW_COLUMNS: Omit<ColumnDef, 'sums'>[] = [
  {id: 'value', title: 'ЗП', group: 'Начисления', fields: ['value']},
  {
    id: 'value_games',
    title: 'ЗП + Игры',
    group: 'Начисления',
    fields: ['value', 'games'],
  },
  {
    id: 'overwork',
    title: 'Переработка',
    group: 'Начисления',
    fields: ['overwork'],
  },
  {id: 'bonuses', title: 'Бонусы', group: 'Начисления', fields: ['bonuses']},
  {id: 'fines', title: 'Штрафы', group: 'Начисления', fields: ['fines']},
  {
    id: 'bonuses_fines',
    title: 'Бонусы + Штрафы',
    group: 'Начисления',
    fields: ['bonuses', 'fines'],
  },
  {id: 'count', title: 'Смен', group: 'Начисления', fields: ['count']},

  {id: 'games', title: 'Игры', group: 'Игры', fields: ['games']},
  {id: 'one_games', title: 'Часовые', group: 'Игры', fields: ['one_games']},
  {id: 'two_games', title: '2-часовые', group: 'Игры', fields: ['two_games']},
  {
    id: 'three_games',
    title: '3-часовые',
    group: 'Игры',
    fields: ['three_games'],
  },
  {
    id: 'actor_games',
    title: 'Актёрские',
    group: 'Игры',
    fields: ['actor_games'],
  },

  {
    id: 'total_work',
    title: 'ЗП + Переработка + Игры',
    hint: 'Раньше «ЗП + Переработка» (Сводная) и «Итог ЗП» (Сводная 2)',
    group: 'Итоги',
    fields: ['value', 'overwork', 'games'],
  },
  {
    id: 'total_bonuses',
    title: 'Итог ЗП + Бонусы',
    group: 'Итоги',
    fields: ['value', 'overwork', 'games', 'bonuses'],
  },
  {
    id: 'total_all',
    title: 'Итог ЗП + Бонусы + Штрафы + Остаток (ведомость)',
    hint: 'Раньше «Итог ЗП + Бонусы + Штрафы» в Сводной 2',
    group: 'Итоги',
    fields: [
      'value',
      'overwork',
      'games',
      'bonuses',
      'fines',
      'payroll_balance',
    ],
  },
  {
    id: 'sum',
    title: 'Итог',
    hint: 'Считает БД: начисления + бонусы + штрафы + баланс − внешние выплаты',
    group: 'Итоги',
    fields: ['sum'],
  },

  {
    id: 'balance',
    title: 'Остаток',
    hint: 'Баланс сотрудника (раньше «Остаток» в Сводной)',
    group: 'Выплаты и остаток',
    fields: ['balance'],
  },
  {
    id: 'payroll_balance',
    title: 'Остаток (ведомость)',
    hint: 'По последней ведомости до конца периода (раньше «Остаток» в Сводной 2)',
    group: 'Выплаты и остаток',
    fields: ['payroll_balance'],
  },
  {id: 'of', title: 'Оф. труд.', group: 'Выплаты и остаток', fields: ['of']},
  {
    id: 'self',
    title: 'Самозанятость',
    group: 'Выплаты и остаток',
    fields: ['self'],
  },
  {id: 'taken', title: 'Выдано', group: 'Выплаты и остаток', fields: ['taken']},
]

const SUMS: Record<string, string> = {
  value: 'Суммы за смены',
  value_games: 'Смены + игры',
  overwork: 'Суммы за переработку',
  bonuses: 'Бонусы (формулы в ячейках считаются и складываются)',
  fines: 'Штрафы (формулы в ячейках считаются и складываются)',
  bonuses_fines: 'Бонусы + штрафы',
  count: 'Количество подтверждённых смен',
  games: 'Игры: 1-часовые + 2-часовые + 3-часовые + актёрские',
  one_games: 'Только 1-часовые игры',
  two_games: 'Только 2-часовые игры',
  three_games: 'Только 3-часовые игры',
  actor_games: 'Только актёрские игры',
  total_work: 'Смены + переработка + игры',
  total_bonuses: 'Смены + переработка + игры + бонусы',
  total_all:
    'Смены + переработка + игры + бонусы + штрафы + остаток (ведомость)',
  sum: 'Считает БД: смены + переработка + игры + бонусы + штрафы + баланс − внешние выплаты (без самозанятости)',
  balance: 'Баланс сотрудника',
  payroll_balance:
    'По последней ведомости до конца периода: сумма − выдано + бонусы − внешняя выплата',
  of: 'Выплаты типа «Оф. труд.» за период',
  self: 'Выплаты типа «Самозанятость» за период',
  taken: 'Выдано по ведомостям за период',
}

export const COLUMNS: ColumnDef[] = RAW_COLUMNS.map(column => ({
  ...column,
  sums: SUMS[column.id] ?? '',
}))

export const COLUMN_BY_ID = new Map(COLUMNS.map(column => [column.id, column]))

export type PresetId = 'payouts' | 'earnings'

export const PRESETS: Record<
  PresetId,
  {title: string; hint: string; columns: string[]}
> = {
  payouts: {
    title: 'Выплаты',
    hint: 'Бывшая «Сводная»: выплаты, самозанятость, итог',
    columns: [
      'value_games',
      'overwork',
      'balance',
      'total_work',
      'bonuses',
      'fines',
      'bonuses_fines',
      'of',
      'self',
      'taken',
      'sum',
    ],
  },
  earnings: {
    title: 'Заработок',
    hint: 'Бывшая «Сводная 2»: заработок и остаток по ведомости',
    columns: [
      'payroll_balance',
      'value',
      'overwork',
      'games',
      'bonuses',
      'fines',
      'total_all',
    ],
  },
}

// Как и раньше, считаем только числа; всё остальное (в том числе null) - ноль
export const cellValue = (row: SummaryRow, fields: string[]) =>
  fields.reduce((sum, field) => {
    const value = row[field]

    return sum + (typeof value === 'number' ? value : 0)
  }, 0)

// ---------- перенос сохранённых колонок из старых страниц (хранились по названиям) ----------

const V1_TITLES: Record<string, string> = {
  ЗП: 'value',
  'ЗП + Игры': 'value_games',
  Переработка: 'overwork',
  Остаток: 'balance',
  'ЗП + Переработка': 'total_work',
  Бонусы: 'bonuses',
  Штрафы: 'fines',
  'Бонусы + Штрафы': 'bonuses_fines',
  Игры: 'games',
  Часовые: 'one_games',
  '2-часовые': 'two_games',
  '3-часовые': 'three_games',
  Актёрские: 'actor_games',
  'Оф. труд.': 'of',
  Самозянятость: 'self',
  Выдано: 'taken',
  Итог: 'sum',
}

const V2_TITLES: Record<string, string> = {
  ...V1_TITLES,
  Остаток: 'payroll_balance',
  'Итог ЗП': 'total_work',
  'Итог ЗП + Бонусы': 'total_bonuses',
  'Итог ЗП + Бонусы + Штрафы': 'total_all',
}

export function migrateColumns(titles: string[], version: 1 | 2): string[] {
  const map = version === 1 ? V1_TITLES : V2_TITLES

  return titles.flatMap(title => (map[title] ? [map[title]] : []))
}
