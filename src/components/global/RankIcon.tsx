import Image from 'next/image'

export default function RankIcon({
  rank: workerRank,
  className = '',
  width = 40,
  height = 40,
}: {
  rank: string
  className?: string
  width?: number
  height?: number
}) {
  let rank = ''

  switch (workerRank.toLowerCase().trim()) {
    case 'советник':
      rank = 'Counselor'
      break
    case 'платиновый':
      rank = 'Platinum'
      break
    case 'золотой':
      rank = 'Gold'
      break
    case 'серебряный':
      rank = 'Silver'
      break
    case 'бронзовый':
      rank = 'Bronze'
      break
    case 'железный':
      rank = 'Iron'
      break
    case 'каменный':
      rank = 'Stone'
      break
    case 'деревянный':
      rank = 'Wood'
      break
    case 'старший актёр':
      rank = 'SeniorActor'
      break
    case 'актёр':
      rank = 'Actor'
      break
  }

  return (
    rank && (
      <Image
        src={`/icons/${rank}Icon.svg`}
        alt={workerRank}
        width={width}
        height={height}
        draggable={false}
        className={className + ' select-none'}
      />
    )
  )
}
