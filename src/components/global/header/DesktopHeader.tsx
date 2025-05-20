import {Button, Avatar, Link} from '@heroui/react'
import {Session} from 'next-auth'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from "react";

const buttons = [
  {name: 'Главная', href: '/'},
  {name: 'График работы', href: '/schedule'},
  {name: 'График персонала', href: '/admin', permission_level: 4},
]

export default function DesktopHeader({session}: {session: Session | null}) {
  const path = usePathname()
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
      const handleScroll = () => {
          setScrolled(window.scrollY > 60)
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
  }, []);

  return (
    <header className={`flex justify-between h-fit p-4 items-center sticky top-0 z-1000 ${scrolled ? ' scrolled' : ''}`}>
      <div className="flex gap-4 items-center">
        {buttons.map((button, index) => {
          if (
            (session?.user.permission_level || 0) <
            (button?.permission_level || 0)
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
