import {Button, Avatar, Link} from '@heroui/react'
import {Session} from 'next-auth'
import {usePathname} from 'next/navigation'
import path from 'path'

const buttons = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission_level: 4},
]

export default function DesktopHeader({session}: {session: Session | null}) {
  const path = usePathname()

  return (
    <header className="flex justify-between h-fit p-4 items-center">
      <div className="flex gap-4 items-center">
        {buttons.map((button, index) => {
          if (
            button?.permission_level &&
            (session?.user.permission_level || 0 <= button?.permission_level)
          )
            return ''

          return (
            <Button
              key={index}
              as={Link}
              href={path === button.href ? 'javascript:void(0)' : button.href}
              variant={path === button.href ? 'shadow' : 'ghost'}
              size="lg">
              {button.name}
            </Button>
          )
        })}
      </div>
      <div className="flex gap-4 items-center text-3xl h-fit">
        <Avatar src={session?.user.image} size="lg" />
        {session?.user.name}
      </div>
    </header>
  )
}
