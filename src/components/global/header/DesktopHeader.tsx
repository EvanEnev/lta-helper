import {Button, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import buttons from '@/src/utils/global/pathButtons'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'
import User from '@/src/components/global/header/User'

export default function DesktopHeader() {
  const {headerRef, setExiting, worker} = useAuth()
  const path = usePathname()

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 left-0 z-10000 flex h-[100dvh] w-fit flex-col p-2`}>
      <div
        className={`header-inner items-between glass flex h-full w-full justify-between px-2 py-4`}>
        <div className="items-between flex flex-col justify-start gap-4">
          <User />
          <>
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
                  className="h-16 w-full flex-col p-2 text-xs"
                  size="lg"
                  title={button.name}
                  aria-label={button.name}
                  aria-placeholder={button.name}>
                  <button.icon size={24} />
                  {/*{button.name}*/}
                </Button>
              )
            })}
          </>
          {/*<Settings />*/}
        </div>
      </div>
    </header>
  )
}
