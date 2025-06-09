import {Button} from '@heroui/react'
import Link from 'next/link'
import UpcomingShifts from './UpcomingShifts'
import buttons from '@/src/utils/global/pathButtons'
import {useAuth} from '@/src/components/global/providers/authProvider'
import RankIcon from '@/src/components/global/RankIcon'
import checkPermissions from '@/lib/functions/checkPermissions'

export default function DesktopPage() {
  const {worker} = useAuth()

  return (
    <main className="flex flex-col items-center gap-4 p-4">
      <div className="flex h-fit flex-col items-center gap-4 text-3xl">
        <RankIcon rank={worker.rank || ''} className="w-full" />
        {worker.rank}
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        {buttons.map((button, index) => {
          if (
            button.permission &&
            !checkPermissions([button.permission], worker)
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
