import {Button, Avatar, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import buttons from '@/src/utils/global/pathButtons'
import {LTWorker} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'

export default function DesktopHeader({
  worker,
  scrolled,
}: {
  worker: LTWorker
  scrolled: boolean
}) {
  const {headerRef, setExiting} = useAuth()
  const path = usePathname()

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 left-0 z-1000 flex h-fit w-screen items-center justify-between p-4 ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex items-center gap-4">
        {buttons.map((button, index) => {
          if (
            button.permission &&
            !checkPermissions([button.permission], worker)
          )
            return ''

          return (
            <Button
              key={index}
              as={Link}
              href={path === button.href ? '#' : button.href}
              onPress={() => {
                if (path !== button.href) {
                  setExiting(true)
                }
              }}
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
