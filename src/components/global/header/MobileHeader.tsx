import {Avatar, Button, Link} from '@heroui/react'
import {Session} from 'next-auth'
import {usePathname} from 'next/navigation'
import {ArrowLeft} from 'solar-icon-set'

const buttons = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission_level: 4},
]

export default function MobileHeader({session}: {session: Session | null}) {
  const path = usePathname()

  return (
    <header className="flex justify-between h-fit p-2 items-center flex-wrap gap-4">
      <Button
        as={Link}
        href="/"
        variant="ghost"
        size="lg"
        startContent={
          <ArrowLeft size={24} svgProps={{width: 24, height: 24}} />
        }
        className={`${path === '/' ? 'hidden' : ''}`}>
        На главную
      </Button>
      <span className="text-2xl font-bold flex-1 text-center">
        {buttons.find(obj => obj.href === path)?.name}
      </span>
      <div className="flex gap-2 items-center justify-center text-2xl flex-1">
        <Avatar src={session?.user.image} />
        {session?.user.name}
      </div>
    </header>
  )
}
