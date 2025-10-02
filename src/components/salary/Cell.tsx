import {SalaryData} from '@/src/utils/types'
import {Card, CardBody, CardHeader, Divider} from '@heroui/react'
import CellHeader from '@/src/components/salary/CellHeader'
import CellBody from '@/src/components/salary/CellBody'
import {memo, useCallback, useEffect, useState} from 'react'
import {ChatRoundLine} from 'solar-icon-set'
import isDark from '@/lib/functions/isDark'
import EditDrawer from '@/src/components/salary/EditDrawer'
import {useTheme} from 'next-themes'

interface CellProps {
  data?: SalaryData
  canEdit: boolean
  canViewFull: boolean
  handleEdit: (data: SalaryData) => void
  handleDelete: any
}

export default memo(function Cell({
  data,
  canEdit,
  canViewFull,
  handleEdit,
  handleDelete,
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
      className={`${canViewFull ? 'min-w-[11rem]' : 'min-h-[15rem] min-w-[12rem]'} max-h-full ${textColorClass}`}>
      <CardHeader
        className={`grid-rows-auto grid grid-flow-row grid-cols-2 ${canEdit ? 'gap-1' : 'gap-2'} pb-0`}>
        <CellHeader data={cellData} canEdit={canEdit} />
      </CardHeader>
      <CardBody
        className={`${canViewFull ? 'gap-1 py-1.5' : 'gap-2'} h-fit max-h-fit text-center`}>
        <Divider className="bg-default-100 w-full" />
        <p className="w-full text-xs">
          {<ChatRoundLine iconStyle="Bold" className="mr-1 align-middle" />}
          Комментарий
        </p>
        <CellBody data={cellData} />
        {canEdit && (
          <EditDrawer
            data={cellData}
            handleEdit={handleCellEdit}
            handleDelete={handleCellDelete}
          />
        )}
      </CardBody>
    </Card>
  )
})
