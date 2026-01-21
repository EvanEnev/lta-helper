import {
  LTFaceIdData,
  LTGamePayment,
  LTLocation,
  SalaryData,
} from '@/src/utils/types'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Tooltip,
} from '@heroui/react'
import CellBody from '@/src/components/salary/CellBody'
import CellFooter from '@/src/components/salary/CellFooter'
import {Activity} from 'react'
import isDark from '@/lib/functions/isDark'
import EditDrawer from '@/src/components/salary/EditDrawer'
import LocationIcon from '@/src/components/global/LocationIcon'
import PaymentData from '@/src/components/salary/PaymentData'

interface CellProps {
  data?: SalaryData
  canEdit: boolean
  canViewFull: boolean
  handleEdit: (data: SalaryData, workerId: number) => void
  handleDelete: any
  gamesPayments: LTGamePayment[]
  faceIdData?: LTFaceIdData['data']
  locations: LTLocation[]
  isReviewMode: boolean
  theme: string | undefined
  workerId: number
}

export default function SalaryCell({
  data,
  canEdit,
  canViewFull,
  handleEdit,
  handleDelete,
  gamesPayments,
  faceIdData,
  locations,
  isReviewMode,
  theme,
  workerId,
}: CellProps) {
  if (!data) return null

  const textColorClass =
    theme === 'dark'
      ? isDark(data.location?.color)
        ? 'text-default-100 [&>div>hr[role=separator]]:bg-default-100'
        : 'text-foreground [&>div>hr[role=separator]]:bg-foreground'
      : isDark(data.location?.color)
        ? 'text-foreground [&>div>hr[role=separator]]:bg-foreground'
        : 'text-default-100 [&>div>hr[role=separator]]:bg-default-100'

  return (
    <div>
      <Activity mode={data.location ? 'visible' : 'hidden'}>
        <Card
          style={{backgroundColor: data.location?.color}}
          className={`${canViewFull ? '' : 'min-h-60'} mb-2 max-h-full w-fit min-w-[20rem]`}>
          <CardHeader
            className={`grid-rows-auto grid grid-flow-row grid-cols-2 items-start gap-2 ${textColorClass}`}>
            <div className="col-span-full flex w-fit items-center gap-1">
              <Tooltip
                content={
                  <p className="whitespace-nowrap">
                    {data.createdBy} {data.createdAt}
                  </p>
                }>
                <div className="text-large flex items-center gap-2">
                  <LocationIcon locationName={data.location?.name} />
                  <p>{data.location?.name}</p>
                </div>
              </Tooltip>
            </div>
          </CardHeader>
          <CardBody
            className={`[&>div>hr[role=separator]]:bg-foreground grid-rows-auto rounded-t-large border-content1 bg-content1 grid grid-flow-row grid-cols-[1fr_1px_1fr] items-start gap-2 border-t-2`}>
            <CellBody
              isReviewMode={isReviewMode}
              faceId={faceIdData}
              data={data}
              time={`${data.startTime}-${data.endTime}`}
              overworkTime={
                data.overworkStart && data.overworkEnd
                  ? `${data.overworkStart}-${data.overworkEnd}`
                  : null
              }
            />
          </CardBody>
          <CardFooter
            className={`${canViewFull ? 'gap-1 py-1.5' : 'gap-2'} bg-content1 h-fit max-h-fit flex-col text-center`}>
            <Divider className="bg-foreground w-full" />
            <CellFooter data={data} />
            <EditDrawer
              time={{start: data.startTime, end: data.endTime}}
              overworkTime={{
                start: data.overworkStart || null,
                end: data.overworkEnd || null,
              }}
              locations={locations}
              data={data}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              gamesPayments={gamesPayments}
              isReadOnly={!canEdit}
              workerId={workerId}
            />
          </CardFooter>
        </Card>
      </Activity>
      {
        // @ts-ignore
        data.payments && <PaymentData data={data.payments} />
      }
    </div>
  )
}
