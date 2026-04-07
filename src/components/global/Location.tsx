import LocationIcon from '@/src/components/global/LocationIcon'

interface LocationProps {
  locationName: string
  text?: string
  className?: string
  iconClassName?: string
}

export default function Location({
  locationName,
  text,
  className = '',
  iconClassName = '',
}: LocationProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LocationIcon className={iconClassName} locationName={locationName} />{' '}
      <span>{text || locationName}</span>
    </div>
  )
}
