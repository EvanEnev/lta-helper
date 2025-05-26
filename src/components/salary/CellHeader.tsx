import {SalaryData} from "@/src/utils/types";
import {Tooltip} from "@heroui/react";
import {evaluate} from "mathjs";
import {DateTime} from "luxon";
import {useMemo} from "react";

export default function CellHeader({data}: {data: SalaryData}) {
    const time = useMemo(() => {
            const startTime = data.start_time.slice(0, -3)
            const endTime = data.end_time.slice(0, -3)
            return `${startTime}-${endTime}`
        },
        [data.start_time, data.end_time])

    const date = useMemo(() => DateTime.fromISO(data.created_at), [data.created_at])

    return <>
        <Tooltip content={<p className='text-xs mix-blend-difference'>{data.created_by} {date.toFormat('dd.MM yyyy')}</p>}><p className='col-span-2 mb-2 mix-blend-difference'>{data.location.name}</p></Tooltip>
        <p className='text-start mix-blend-difference w-fit justify-self-start'>{time}</p>
        <p className='text-end mix-blend-difference w-fit justify-self-end'>{data.value}</p>
        {parseInt(data.bonuses || '') ?
            <Tooltip content={data.bonuses}>
                <p className='col-2 text-end mix-blend-difference w-fit justify-self-end'>{evaluate(data.bonuses || '')}</p>
            </Tooltip> : ''}
    </>
}
