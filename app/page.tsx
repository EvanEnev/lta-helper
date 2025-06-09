import MainPage from '@/src/components/page/MainPage'
import auth from '@/lib/auth'
import convertTZ from '@/lib/functions/convertTZ'
import db from '@/lib/database'
import {evaluate} from 'mathjs'

export interface ShortSalary {
  currentDates: string
  currentSalary: number
  currentSalaryTakeDate: string
  previousDates: string
  previousSalary: number
  previousSalaryTakeDate: string
}

export default async function Home() {
  const worker = await auth()

  const date = convertTZ(new Date(), 'Europe/Moscow')

  const current = [date, date]
  const previous = [date, date]

  let currentSalaryTakeDate = ''
  let previousSalaryTakeDate = ''

  if (date.day < 5 || date.day >= 20) {
    if (date.day < 5) {
      current[0] = current[0].minus({month: 1})
      current[1] = current[1].minus({month: 1})

      previous[0] = previous[0].minus({month: 1})
      previous[1] = previous[1].minus({month: 1})
    }

    current[0] = current[0].set({day: 16})
    current[1] = current[1].set({
      day: current[1].endOf('month').day,
    })

    previous[0] = previous[0].set({day: 1})
    previous[1] = previous[1].set({day: 15})

    currentSalaryTakeDate = current[1]
      .plus({month: 1})
      .set({day: 5})
      .toFormat('dd.MM')
    previousSalaryTakeDate = previous[1].set({day: 20}).toFormat('dd.MM')
  }

  if (date.day >= 5 && date.day < 20) {
    current[0] = current[0].set({day: 1})
    current[1] = current[1].set({day: 15})

    previous[0] = previous[0].set({day: 16}).minus({month: 1})
    previous[1] = previous[1].minus({month: 1}).set({
      day: previous[1].minus({month: 1}).endOf('month').day,
    })

    currentSalaryTakeDate = current[1].set({day: 20}).toFormat('dd.MM')
    previousSalaryTakeDate = previous[1]
      .plus({month: 1})
      .set({day: 5})
      .toFormat('dd.MM')
  }

  const currentSalaryQuery = `
  SELECT value, overwork, bonuses, fines
  FROM lt_arena.salary
  WHERE worker_id = ${worker.id}
  AND date BETWEEN '${current[0].toFormat('yyyy-MM-dd')}' AND '${current[1].toFormat('yyyy-MM-dd')}'`

  const previousSalaryQuery = `
  SELECT value, overwork, bonuses, fines
  FROM lt_arena.salary
  WHERE worker_id = ${worker.id}
  AND date BETWEEN '${previous[0].toFormat('yyyy-MM-dd')}' AND '${previous[1].toFormat('yyyy-MM-dd')}'`

  const results = await db.query(
    `${currentSalaryQuery}; ${previousSalaryQuery}`,
  )

  let currentSalary = 0

  // @ts-ignore
  results[0].rows.forEach(row => {
    currentSalary += row.value
    currentSalary += row.overwork || 0
  })

  let previousSalary = 0

  // @ts-ignore
  results[1].rows.forEach(row => {
    previousSalary += row.value
    previousSalary += row.overwork || 0
  })

  let bonusesQuery = `
SELECT bonuses, fines
FROM lt_arena.salary
WHERE worker_id = ${worker.id}`

  if (currentSalaryTakeDate.startsWith('20')) {
    bonusesQuery += ` AND date BETWEEN '2025-${currentSalaryTakeDate.split('.')[1]}-01' AND '2025-${currentSalaryTakeDate.split('.')[1]}-${current[0].endOf('month').day}'`

    const bonusesResult = await db.query(bonusesQuery)

    bonusesResult.rows.forEach(row => {
      currentSalary += evaluate(row.bonuses || '0')
      currentSalary += evaluate(row.fines || '0')
    })
  } else {
    bonusesQuery += ` AND date BETWEEN '2025-${previousSalaryTakeDate.split('.')[1]}-01' AND '2025-${previousSalaryTakeDate.split('.')[1]}-${previous[0].endOf('month').day}'`

    const bonusesResult = await db.query(bonusesQuery)

    bonusesResult.rows.forEach(row => {
      previousSalary += evaluate(row.bonuses || '0')
      previousSalary += evaluate(row.fines || '0')
    })
  }

  const salaryData: ShortSalary = {
    currentDates: `${current[0].toFormat('dd.MM')}-${current[1].toFormat('dd.MM')}`,
    currentSalary,
    previousDates: `${previous[0].toFormat('dd.MM')}-${previous[1].toFormat('dd.MM')}`,
    previousSalary,
    currentSalaryTakeDate,
    previousSalaryTakeDate,
  }

  return <MainPage salaryData={salaryData} />
}
