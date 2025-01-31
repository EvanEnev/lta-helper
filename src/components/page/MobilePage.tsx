import getRankIcon from '@/src/utils/page/getRankIcon'
import {Avatar, Button} from '@nextui-org/react'
import {useSession} from 'next-auth/react'
import Link from 'next/link'

export default function DesktopPage() {
  const {data: session} = useSession()

  return (
    <main className="flex flex-col gap-4 p-4 w-screen h-screen">
      <div className="flex flex-col gap-4 items-center text-3xl h-fit">
        {getRankIcon(session?.user.rank)}
        {session?.user.rank}
        <div className="flex gap-2 items-center">
          <Avatar src={session?.user.image} />
          {session?.user.name}
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        <Button as={Link} href="/schedule" variant="ghost" size="lg">
          Заполнить график работы
        </Button>
        {session?.user.permission_level === 4 ? (
          <Button href="/admin" as={Link} variant="ghost" size="lg">
            Заполнить график персонала
          </Button>
        ) : (
          ''
        )}
      </div>
    </main>
  )
}
