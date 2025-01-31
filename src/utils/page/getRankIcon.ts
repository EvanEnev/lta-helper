import IronIcon from '@/public/icons/IronIcon'
import BronzeIcon from '@/public/icons/BronzeIcon'
import SilverIcon from '@/public/icons/SilverIcon'
import GoldIcon from '@/public/icons/GoldIcon'
import PlatinumIcon from '@/public/icons/PlatinumIcon'
import StoneIcon from '@/public/icons/StoneIcon'
import ActorIcon from '@/public/icons/ActorIcon'

export default function getRankIcon(rank: string) {
  switch (rank?.toLowerCase()) {
    case 'актёр':
      return ActorIcon({})
    case 'каменный':
      return StoneIcon({})
    case 'железный':
      return IronIcon({})
    case 'бронзовый':
      return BronzeIcon({})
    case 'серебряный':
      return SilverIcon({})
    case 'золотой':
      return GoldIcon({})
    case 'платиновый':
      return PlatinumIcon({})
    default:
      return ActorIcon({})
  }
}
