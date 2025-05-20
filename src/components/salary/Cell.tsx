import {SalaryData} from "@/src/utils/types";
import {Card, CardBody, CardFooter, CardHeader, Tooltip} from "@heroui/react";
import {evaluate} from "mathjs";

export default function Cell({data}: {data?: SalaryData}) {
    if (!data) return null

    const startTime = data.start_time.slice(0, -3)
    const endTime = data.end_time.slice(0, -3)
    const time = `${startTime}-${endTime}`

    return <Card className={`w-[12rem] h-[15rem]`}>
        <CardHeader className='grid grid-cols-2 grid-rows-4 h-fit max-h-fit pb-0'>
            <p className='col-span-2 mb-2'>{data.location.name}</p>
            <p className='text-start'>{time}</p>
            <p className='text-end'>{data.value}</p>
            {parseInt(data.bonuses || '') ?
                <Tooltip content={data.bonuses}>
                    <p className='col-2 text-end'>{evaluate(data.bonuses || '')}</p>
                </Tooltip> : ''}
        </CardHeader>
        <CardBody className="grid grid-cols-2 grid-rows-5 pt-0">
                <p className='col-span-2'>{data.comment}</p>
        </CardBody>
        <CardFooter className='flex flex-col gap-2 items-center justify-center relative'>
            <p className='text-xs'>{data.created_by}</p>
            <p className='text-xs'>{data.created_at.toLocaleDateString('ru-RU')}</p>
            <span className='absolute bottom-2 left-2 rounded-full h-5 w-5' style={{backgroundColor: data.location.color}}/>
        </CardFooter>
    </Card>
}
