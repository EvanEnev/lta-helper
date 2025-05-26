import {SalaryData} from "@/src/utils/types";

export default function CellBody({data}: {data: SalaryData}) {
    return  <p className='col-span-2 mix-blend-difference'>{data.comment}</p>
}
