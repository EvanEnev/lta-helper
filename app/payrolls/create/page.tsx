import db from "@/lib/database";
import salarySort from "@/lib/functions/salarySort";
import {evaluate} from "mathjs";

interface PayrollsCreateProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PayrollsCreate({searchParams}: PayrollsCreateProps) {
    const params = await searchParams
    const dates = JSON.parse(params?.dates as string)
    const moneyOnLocations = JSON.parse(params?.moneyOnLocations as string)
    const bonuses = JSON.parse(params?.bonuses as string)

    console.debug({dates, moneyOnLocations, bonuses})


    const query = `select
    w.name,
    w.rank,
    sum(value) + sum(overwork) as value,
    string_agg(bonuses, '+') as bonuses,
    string_agg(fines, '+') as fines
    from lt_arena.salary
    left join lt_arena.workers w on w.id = worker_id
    where date between '${dates.start}' and '${dates.end}'
    group by w.name, w.rank`

    const result = await db.query(query)

    let data = salarySort(result.rows)

    if (bonuses) {
        // @ts-ignore
        data = data.map(row => ({...row, bonuses: evaluate(row.bonuses || ''), fines: evaluate(row.fines || '')}))
    }

    console.debug(data)
}