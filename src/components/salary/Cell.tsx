import {SalaryData} from '@/src/utils/types'
import {Card, CardBody, CardHeader, Divider} from '@heroui/react'
import CellHeader from '@/src/components/salary/CellHeader'
import CellHeaderEditable from '@/src/components/salary/CellHeaderEditable'
import CellBodyEditable from '@/src/components/salary/CellBodyEditable'
import CellBody from '@/src/components/salary/CellBody'
import {memo, useCallback, useEffect, useState} from 'react'
import {ChatRoundLine} from 'solar-icon-set'

export default memo(function Cell({
  data,
  canEdit,
  handleEdit,
}: {
  data?: SalaryData
  canEdit: boolean
  handleEdit: (data: SalaryData) => void
}) {
  const [cellData, setCellData] = useState<SalaryData | undefined>(data)

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

  if (!cellData) return null

  return (
    <Card className={`min-h-[15rem] w-[12rem]`}>
      <CardHeader
        className="grid-rows-auto grid grid-flow-row grid-cols-2 gap-2 pb-0"
        style={{backgroundColor: cellData.location.color}}>
        {canEdit ? (
          <CellHeaderEditable data={cellData} handleEdit={handleCellEdit} />
        ) : (
          <CellHeader data={cellData} />
        )}
      </CardHeader>
      <CardBody
        className="grid h-fit grid-cols-2 grid-rows-1 gap-2 text-center"
        style={{backgroundColor: cellData.location.color}}>
        <Divider className="bg-default-100 col-span-2 w-full" />
        <p className="text-default-100 col-span-2 text-xs">
          {<ChatRoundLine iconStyle="Bold" className="mr-1 align-middle" />}
          Комментарий
        </p>
        {canEdit ? (
          <CellBodyEditable data={cellData} handleEdit={handleCellEdit} />
        ) : (
          <CellBody data={cellData} />
        )}
      </CardBody>
    </Card>
  )
})
