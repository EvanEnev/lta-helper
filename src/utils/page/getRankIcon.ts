import IronIcon from '@/public/icons/IronIcon'
import BronzeIcon from '@/public/icons/BronzeIcon'
import SilverIcon from '@/public/icons/SilverIcon'
import GoldIcon from '@/public/icons/GoldIcon'
import PlatinumIcon from '@/public/icons/PlatinumIcon'
import StoneIcon from '@/public/icons/StoneIcon'
import ActorIcon from '@/public/icons/ActorIcon'

export default function getRankIcon(rank: string, props: any = {}) {
  switch (rank?.toLowerCase()) {
    case 'актёр':
      return ActorIcon(props)
    case 'каменный':
      return StoneIcon(props)
    case 'железный':
      return IronIcon(props)
    case 'бронзовый':
      return BronzeIcon(props)
    case 'серебряный':
      return SilverIcon(props)
    case 'золотой':
      return GoldIcon(props)
    case 'платиновый':
      return PlatinumIcon(props)
    default:
      return ActorIcon(props)
  }
}
