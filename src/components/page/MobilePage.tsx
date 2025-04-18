import getRankIcon from '@/src/utils/page/getRankIcon'
import {Avatar, Button} from '@heroui/react'
import {useSession} from 'next-auth/react'
import Link from 'next/link'
import UpcomingShifts from './UpcomingShifts'

const buttons = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission_level: 4},
]

export default function DesktopPage() {
  const {data: session} = useSession()

  return (
    <main className="flex flex-col gap-4 p-4 items-center">
      <div className="flex flex-col gap-4 items-center text-3xl h-fit">
        {getRankIcon(session?.user.rank)}
        {session?.user.rank}
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        {buttons.map((button, index) => {
          if (
            (session?.user.permission_level || 0) <
            (button?.permission_level || 0)
          )
            return ''

          return (
            <Button
              className="w-full"
              key={index}
              as={Link}
              href={button.href}
              variant="ghost"
              size="lg">
              {button.name}
            </Button>
          )
        })}
      </div>
      <UpcomingShifts />
    </main>
  )
}
