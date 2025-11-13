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
import PirateStation from '@/public/icons/locations/PirateStation'

export default function LocationIcon({
  locationName = '',
  className = '',
}: {
  locationName: string
  className?: string
}) {
  let Icon

  switch (locationName?.toLowerCase().trim()) {
    case 'вб':
    case 'военный бункер':
      Icon = VB
      break
    case 'уб':
    case 'убежище':
      Icon = Shelter
      break
    case 'зф':
    case 'забытая фабрика':
      Icon = AbandonedFactory
      break
    case 'ст':
    case 'сити':
      Icon = City
      break
    case 'тп':
    case 'телепорт':
      Icon = Teleport
      break
    case 'вр':
    case 'виармания':
      Icon = VR
      break
    case 'дз':
    case 'дикий запад':
      Icon = WildWest
      break
    case 'анк':
    case 'анклав':
      Icon = Enclave
      break
    case 'кп':
    case 'киберпорт':
      Icon = Cyberport
      break
    case 'пс':
    case 'пиратская станция':
      Icon = PirateStation
      break
    case 'дж':
    case 'джунгли':
      Icon = Jungle
      break
  }

  if (!Icon) {
    Icon = MapPoint
  }

  return (
    <Icon
      className={`${className}`}
      fill={'currentColor'}
      color={'currentColor'}
      width={40}
      height={40}
    />
  )
}
