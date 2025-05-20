import db from "@/lib/database";
import Table from '@/src/components/salary/Table'
import {SalaryData, UserSalary, Worker} from "@/src/utils/types";
import convertTZ from "@/lib/functions/convertTZ";
import sortByRank from "@/lib/functions/sortByRank";
import {auth} from "@/lib/auth";
export default async function Salary() {
    const {user} = await auth()
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)

    const salaryQuery = `SELECT
    date,
    value,
    bonuses,
    fines,
    comment,
    created_at,
    start_time,
    end_time,
    w.name AS worker_name,
    ws.name AS created_by,
    l.name AS location_name,
    l.color AS location_color
    FROM lt_arena.salary s
    LEFT JOIN lt_arena.workers w ON w.id = s.worker_id
    LEFT JOIN lt_arena.workers ws ON ws.id = s.created_by
    LEFT JOIN lt_arena.locations l ON l.id = s.location_id`

    const salaryResult = await db.query(salaryQuery)

    const workersQuery = `SELECT name, first_name, rank, telegram_id FROM lt_arena.workers`

    const workersResult = await db.query(workersQuery)
    const workersRows = workersResult.rows

    const workers: Worker[] = workersRows.map(row => {
        return {
            name: row.name,
            telegramId: row.telegram_id,
            rank: row.rank,
            firstName: row.first_name,
        }
    })

    const sortedWorkers = sortByRank(workers)

    const salaryData: SalaryData[] = salaryResult.rows.map(row => {
        return {
            date: row.date,
            value: row.value,
            bonuses: row.bonuses,
            fines: row.fines,
            comment: row.comment,
            created_at: row.created_at,
            created_by: row.created_by,
            worker_name: row.worker_name,
            start_time: row.start_time,
            end_time: row.end_time,
            location: {
                name: row.location_name,
                color: row.location_color,
            }
        }
    })

    const data = sortedWorkers.map((worker: Worker) => {
        const rowWithDates: UserSalary = {
            user: {
                name: worker.name,
                firstName: worker.firstName || null,
                rank: worker.rank
            }
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = convertTZ(new Date(currentYear, currentMonth, day), 'Europe/Moscow')

            const salary = salaryData.find(s => s.date.toString() === date.toString() && s.worker_name === worker.name)

            rowWithDates[`day${day}`] = salary || ''
        }

        return rowWithDates
    })

    return <main className="h-fit">
        <Table data={data}/>
    </main>
}
