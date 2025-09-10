'use client'

import {LTLocation, LTWorkerPayrollData} from '@/src/utils/types'
import {useAuth} from "@/src/components/global/providers/authProvider";
import {useMemo} from "react";
import checkPermissions from "@/lib/functions/checkPermissions";
import {Divider} from "@heroui/react";
import RankIcon from "@/src/components/global/RankIcon";

interface PayrollsDetailsPageProps {
  data: LTWorkerPayrollData[]
  locations: LTLocation[]
}

export default function PayrollsDetailsPage({
  data,
  locations,
}: PayrollsDetailsPageProps) {
    const {worker} = useAuth()
    const canIssue = useMemo(() => checkPermissions(['issue_payrolls'], worker), [worker])

  return <main className="p-4">
      <div className='flex justify-between sticky top-0 bg-content2 rounded-2xl p-2'>
          <p>Сотрудник</p>
          <Divider orientation='vertical' />
          <p>Сумма</p>
          <Divider orientation='vertical' />
          <p>Локация</p>
          {canIssue && (<><Divider orientation='vertical' />
          <p>Выдача</p></>)}
      </div>
      <div className='flex flex-col gap-2'>
          {data.map((item, index) => {
              return <div key={index} className='flex justify-between p-2 rounded-2xl bg-content1'>
                  <p><RankIcon rank={item.worker.rank} /> {item.worker.name}</p>
              </div>
          })}
      </div>
  </main>
}
