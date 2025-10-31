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
import {memo, useCallback, useEffect, useState} from 'react'
import {ChatRoundLine} from 'solar-icon-set'
import isDark from '@/lib/functions/isDark'
import EditDrawer from '@/src/components/salary/EditDrawer'
import {useTheme} from 'next-themes'
import LocationIcon from '@/src/components/global/LocationIcon'
import {DateTime} from 'luxon'

interface CellProps {
  data?: SalaryData
  canEdit: boolean
  canViewFull: boolean
  handleEdit: (data: SalaryData) => void
  handleDelete: any
  gamesPayments: LTGamePayment[]
  faceIdData?: LTFaceIdData['data']
  locations: LTLocation[]
  isReviewMode: boolean
}

export default memo(function Cell({
  data,
  canEdit,
  canViewFull,
  handleEdit,
  handleDelete,
  gamesPayments,
  faceIdData,
  locations,
  isReviewMode,
}: CellProps) {
  const [cellData, setCellData] = useState<SalaryData | undefined>(data)
  const {theme} = useTheme()

  useEffect(() => {
    setCellData(data)
  }, [data])

  const handleCellEdit = useCallback(
    (data: SalaryData) => {
      if (!data) return
      handleEdit(data)

      setCellData(data)
    },
    [handleEdit],
  )

  const handleCellDelete = useCallback(
    (data: SalaryData) => {
      if (!data) return
      handleDelete(data)

      setCellData(undefined)
    },
    [handleDelete],
  )

  if (!cellData) return null

  const textColorClass =
    theme === 'dark'
      ? isDark(cellData.location.color)
        ? 'text-default-100 [&>div>hr[role=separator]]:bg-default-100'
        : 'text-foreground [&>div>hr[role=separator]]:bg-foreground'
      : isDark(cellData.location.color)
        ? 'text-foreground [&>div>hr[role=separator]]:bg-foreground'
        : 'text-default-100 [&>div>hr[role=separator]]:bg-default-100'

  return (
    <Card
      style={{backgroundColor: cellData.location.color}}
      className={`${canViewFull ? '' : 'min-h-[15rem]'} max-h-full w-fit min-w-[20rem]`}>
      <CardHeader
        className={`grid-rows-auto grid grid-flow-row grid-cols-2 items-start gap-2 ${textColorClass}`}>
        <div className="col-span-full flex w-fit items-center gap-1">
          <Tooltip
            content={
              <p className="whitespace-nowrap">
                {cellData.created_by}{' '}
                {DateTime.fromISO(cellData.created_at).toFormat('dd.MM yyyy')}
              </p>
            }>
            <div className="text-large flex items-center gap-2">
              <LocationIcon locationName={cellData.location.name} />
              <p>{cellData.location.name}</p>
            </div>
          </Tooltip>
        </div>
      </CardHeader>
      <CardBody
        className={`[&>div>hr[role=separator]]:bg-foreground grid-rows-auto rounded-t-large border-content1 bg-content1 grid grid-flow-row grid-cols-[1fr_1px_1fr] items-start gap-2 border-t-2`}>
        <CellBody
          isReviewMode={isReviewMode}
          faceId={faceIdData}
          data={cellData}
        />
      </CardBody>
      <CardFooter
        className={`${canViewFull ? 'gap-1 py-1.5' : 'gap-2'} bg-content1 h-fit max-h-fit flex-col text-center`}>
        <Divider className="bg-foreground w-full" />
        <p className="w-full text-xs">
          {<ChatRoundLine iconStyle="Bold" className="mr-1 align-middle" />}
          Комментарий
        </p>
        <CellFooter data={cellData} />
        <EditDrawer
          faceId={faceIdData}
          locations={locations}
          data={cellData}
          handleEdit={handleCellEdit}
          handleDelete={handleCellDelete}
          gamesPayments={gamesPayments}
          isReadOnly={!canEdit}
        />
      </CardFooter>
    </Card>
  )
})
