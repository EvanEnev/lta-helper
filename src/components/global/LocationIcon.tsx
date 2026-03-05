import AbandonedFactory from '@/public/icons/locations/AbandonedFactory'
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
import {Icon} from '@iconify/react'

export default function LocationIcon({
  locationName = '',
  className = '',
}: {
  locationName: string
  className?: string
}) {
  let LIcon

  switch (locationName?.toLowerCase().trim()) {
    case 'вб':
    case 'военный бункер':
      LIcon = VB
      break
    case 'уб':
    case 'убежище':
      LIcon = Shelter
      break
    case 'зф':
    case 'забытая фабрика':
      LIcon = AbandonedFactory
      break
    case 'ст':
    case 'сити':
      LIcon = City
      break
    case 'тп':
    case 'телепорт':
      LIcon = Teleport
      break
    case 'вр':
    case 'виармания':
      LIcon = VR
      break
    case 'дз':
    case 'дикий запад':
      LIcon = WildWest
      break
    case 'анк':
    case 'анклав':
      LIcon = Enclave
      break
    case 'кп':
    case 'киберпорт':
      LIcon = Cyberport
      break
    case 'пс':
    case 'пиратская станция':
      LIcon = PirateStation
      break
    case 'дж':
    case 'джунгли':
      LIcon = Jungle
      break
  }

  if (!LIcon) {
    return (
      <Icon
        className={`${className}`}
        fill={'currentColor'}
        color={'currentColor'}
        icon="solar:map-point-linear"
        width="40"
        height="40"
      />
    )
  }

  return (
    <LIcon
      className={`${className}`}
      fill={'currentColor'}
      color={'currentColor'}
      width={40}
      height={40}
    />
  )
}
