import {SalaryUser} from "@/src/utils/types";

export default function WorkerCell({data}: {data: SalaryUser}) {
    return <div className="flex flex-col gap-2">
        <p>{data.name}</p>
        <p>{data.firstName}</p>
        <p>{data.rank}</p>
    </div>
}
