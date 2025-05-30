import {Button, Avatar, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import buttons from '@/src/utils/global/pathButtons'

export default function DesktopHeader({worker}: {worker: any | null}) {
  const path = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-1000 flex h-fit items-center justify-between p-4 ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex items-center gap-4">
        {buttons.map((button, index) => {
          if ((worker.permission_level || 0) < (button?.permission_level || 0))
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
      <div className="flex h-fit items-center gap-4 text-3xl">
        <Avatar src={worker.photo_url} size="lg" />
        {worker.name}
      </div>
    </header>
  )
}
