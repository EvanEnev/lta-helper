import AbandonedFactory from '@/public/icons/locations/AbandonedFactory'
import {MapPoint} from 'solar-icon-set'
import Jungle from '@/public/icons/locations/Jungle'
import WildWest from '@/public/icons/locations/WildWest'
import Shelter from '@/public/icons/locations/Shelter'
import City from '@/public/icons/locations/City'
import Teleport from '@/public/icons/locations/Teleport'
import VR from '@/public/icons/locations/VR'
import VB from '@/public/icons/locations/VB'
import Cyberport from '@/public/icons/locations/Cyberport'
import Enclave from '@/public/icons/locations/Enclave'

export default function LocationIcon({
  locationName,
  className = '',
}: {
  locationName: string
  className?: string
}) {
  let Icon

  switch (locationName.toLowerCase().trim()) {
    case 'военный бункер':
      Icon = VB
      break
    case 'убежище':
      Icon = Shelter
      break
    case 'забытая фабрика':
      Icon = AbandonedFactory
      break
    case 'сити':
      Icon = City
      break
    case 'телепорт':
      Icon = Teleport
      break
    case 'виармания':
      Icon = VR
      break
    case 'дикий запад':
      Icon = WildWest
      break
    case 'анклав':
      Icon = Enclave
      break
    case 'киберпорт':
      Icon = Cyberport
      break
    case 'пиратская станция':
      break
    case 'джунгли':
      Icon = Jungle
      break
  }

  if (!Icon) {
    Icon = MapPoint
  }

  return (
    <Icon fill={'currentColor'} color={'currentColor'} width={40} height={40} />
  )
}
