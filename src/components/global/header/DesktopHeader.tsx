import {Button, Avatar, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import buttons from '@/src/utils/global/pathButtons'
import {LTWorker} from '@/src/utils/types'

export default function DesktopHeader({
  worker,
  scrolled,
}: {
  worker: LTWorker
  scrolled: boolean
}) {
  const path = usePathname()

  return (
    <header
      className={`sticky top-0 left-0 z-1000 flex h-fit w-screen items-center justify-between p-4 ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex items-center gap-4">
        {buttons.map((button, index) => {
          if ((worker.permissionLevel || 0) < (button?.permission_level || 0))
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
        <Avatar src={worker.photoUrl} size="lg" />
        {worker.name}
      </div>
    </header>
  )
}
