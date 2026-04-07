import {LTLocation, LTWorker} from '@/src/utils/types'
import LocationSelect from '@/src/components/global/LocationSelect'
import {memo, useCallback} from 'react'

interface PayrollCreateLocationCellProps {
  callback: (
    workerId: LTWorker['id'],
    location: LTLocation['id'],
    type: 'location' | 'bonuses' | 'fines' | 'value',
  ) => void
  locations: LTLocation[]
  workerId: number
  locationId: LTLocation['id']
}

export default memo(function PayrollCreateLocationCell({
  callback,
  locations,
  workerId,
  locationId,
}: PayrollCreateLocationCellProps) {
  const locationCallback = useCallback(
    (location: (LTLocation | LTLocation[]) | null) => {
      callback(workerId, (location as LTLocation)?.id || -1, 'location')
    },
    [callback, workerId],
  )

  return (
    <LocationSelect
      variant="primary"
      dynamicLocationId
      locationId={locationId}
      showLabel={false}
      className="h-full w-full"
      callback={locationCallback}
      locations={locations}
      exclude={['другое', 'выезд', 'отдел продаж']}
    />
  )
})
