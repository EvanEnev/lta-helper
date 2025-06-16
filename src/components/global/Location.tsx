import LocationIcon from '@/src/components/global/LocationIcon'

interface LocationProps {
  locationName: string
  text?: string
  className?: string
}

export default function Location({
  locationName,
  text,
  className = '',
}: LocationProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LocationIcon locationName={locationName} />{' '}
      <span>{text || locationName}</span>
    </div>
  )
}
