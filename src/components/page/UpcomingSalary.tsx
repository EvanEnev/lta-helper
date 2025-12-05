import {ShortSalary} from '@/app/page'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  LinkIcon,
  Skeleton,
} from '@heroui/react'
import Link from 'next/link'
import {Ruble} from 'solar-icon-set'
import {useAuth} from '@/src/components/global/providers/authProvider'

function BonusesAndFines({
  bonuses,
  fines,
  salary,
  balance,
  showAll = false,
}: {
  bonuses: number
  fines: number
  salary: number
  balance?: number
  showAll?: boolean
}) {
  return (
    <>
      {showAll && (
        <>
          <p className="text-foreground-500">Бонусы: {bonuses}</p>
          <p className="text-foreground-500">Штрафы: {fines}</p>
        </>
      )}
      <p className="text-foreground-500">ЗП: {salary}</p>
      {balance && <p className="text-foreground-500">Остаток: {balance}</p>}
    </>
  )
}

export default function UpcomingSalary({data}: {data: ShortSalary}) {
  const {worker} = useAuth()
  const isCurrentWithBonuses = data.currentSalaryTakeDate.startsWith('20')

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full" />
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full delay-1" />
            <span className="ripple bg-success/90 absolute h-3 w-3 rounded-full delay-2" />
            <span className="bg-success z-10 block h-3 w-3 rounded-full" />
            <p>
              Текущая выплата (
              <Skeleton isLoaded={!!data} className="inline-flex">
                {data.previousDates}
              </Skeleton>
              )
            </p>
          </div>
          <Skeleton isLoaded={!!data}>
            <p className="text-foreground-500">
              Можно получить с {data.previousSalaryTakeDate}
            </p>
            <div className="flex items-center gap-1">
              {(data.balance || 0) +
                data.previousSalary +
                (worker.rank === 'Актёр'
                  ? data.currentBonuses
                  : !isCurrentWithBonuses
                    ? data.bonuses
                    : 0) +
                (worker.rank === 'Актёр'
                  ? data.currentFines
                  : !isCurrentWithBonuses
                    ? data.fines
                    : 0)}{' '}
              <Ruble iconStyle="Bold" />
            </div>
            {
              <BonusesAndFines
                showAll={!isCurrentWithBonuses || worker.rank === 'Актёр'}
                bonuses={
                  worker.rank === 'Актёр'
                    ? data.currentBonuses
                    : !isCurrentWithBonuses
                      ? data.bonuses
                      : 0
                }
                fines={
                  worker.rank === 'Актёр'
                    ? data.currentFines
                    : !isCurrentWithBonuses
                      ? data.fines
                      : 0
                }
                salary={data.previousSalary}
                balance={data.balance || 0}
              />
            }
          </Skeleton>
        </div>
        <Divider />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="bg-primary block h-3 w-3 rounded-full" />
            <p>
              Будущая выплата (
              <Skeleton isLoaded={!!data} className="inline-flex">
                {data.currentDates}
              </Skeleton>
              )
            </p>
          </div>
          <Skeleton isLoaded={!!data}>
            <p className="text-foreground-500">
              Можно получить с {data.currentSalaryTakeDate}
            </p>
            <div className="flex items-center gap-1">
              {data.currentSalary +
                (worker.rank === 'Актёр'
                  ? data.previousBonuses
                  : isCurrentWithBonuses
                    ? data.bonuses
                    : 0) +
                (worker.rank === 'Актёр'
                  ? data.previousFines
                  : isCurrentWithBonuses
                    ? data.fines
                    : 0)}{' '}
              <Ruble iconStyle="Bold" />
            </div>
            <BonusesAndFines
              showAll={isCurrentWithBonuses || worker.rank === 'Актёр'}
              bonuses={
                worker.rank === 'Актёр' ? data.previousBonuses : data.bonuses
              }
              fines={worker.rank === 'Актёр' ? data.previousFines : data.fines}
              salary={data.currentSalary}
            />
          </Skeleton>
        </div>
      </CardBody>
      <CardFooter>
        <Button as={Link} startContent={<LinkIcon />} href="/salary">
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  )
}
