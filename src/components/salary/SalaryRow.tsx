import {
  LTGamePayment,
  LTLocation,
  LTWorkType,
  SalaryData,
  UserSalary,
} from '@/src/utils/types'
import SalaryCell from '@/src/components/salary/SalaryCell'
import RankIcon from '@/src/components/global/RankIcon'
import {useAtomValue} from 'jotai'
import {headerSizesAtom} from '@/src/utils/global/atoms'

interface SalaryRowProps extends UserSalary {
  data?: SalaryData
  days: string[]
  canEdit: boolean
  canViewFull: boolean
  handleEdit: (data: SalaryData, workerId: number) => void
  handleDelete: any
  gamesPayments: LTGamePayment[]
  locations: LTLocation[]
  isReviewMode: boolean
  theme: string | undefined
  workTypes: LTWorkType[]
  workerId: number
}

export default function SalaryRow({
  worker,
  dates,
  days,
  theme,
  locations,
  gamesPayments,
  canEdit,
  canViewFull,
  isReviewMode,
  handleEdit,
  handleDelete,
  workTypes,
  workerId,
}: SalaryRowProps) {
  const headerSizes = useAtomValue(headerSizesAtom)

  return (
    <>
      <div
        style={{left: `${headerSizes.width}px`}}
        className="bg-surface sticky z-100 flex min-h-full w-40 flex-col items-center justify-center rounded-2xl p-2">
        <RankIcon rank={worker.rank} />
        <i className="mb-2 text-xs">{worker.rank}</i>
        <p>{worker.name}</p>
        <p>{worker.firstName}</p>
        {worker.isFormer && <p className="text-xs">Бывший сотрудник</p>}
      </div>
      {days.map(day => {
        const data = dates.find(d => d.date?.slice(0, -5) === day)
        // @ts-ignore
        if (!data?.id && !data?.payments?.length) {
          return (
            <div
              key={day}
              className="border-surface-foreground/20 h-full w-full rounded-2xl border-2"></div>
          )
        }

        return (
          <SalaryCell
            key={day}
            data={data}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            gamesPayments={gamesPayments}
            locations={locations}
            isReviewMode={isReviewMode}
            canEdit={canEdit}
            canViewFull={canViewFull}
            theme={theme}
            workerId={worker.id}
          />
        )
      })}
    </>
  )
}
