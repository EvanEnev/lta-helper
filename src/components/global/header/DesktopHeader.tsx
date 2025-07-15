import {Button, Avatar, Link, Switch} from '@heroui/react'
import {usePathname} from 'next/navigation'
import buttons from '@/src/utils/global/pathButtons'
import {LTWorker} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'
import {MoonIcon, SunIcon} from '@heroui/shared-icons'
import {useTheme} from 'next-themes'

export default function DesktopHeader({
  worker,
  scrolled,
}: {
  worker: LTWorker
  scrolled: boolean
}) {
  const {headerRef, setExiting, customHeaderComponents} = useAuth()
  const path = usePathname()
  const {theme, setTheme} = useTheme()

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 z-1000 flex w-full p-2`}>
      <div
        className={`header-inner flex h-full w-full items-center justify-between px-2 py-4 ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center gap-4">
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
                  size="lg">
                  {button.name}
                </Button>
              )
            })}
          </>
          {customHeaderComponents}
        </div>
        <div className="flex h-fit items-center gap-4 p-2 text-3xl">
          <Switch
            color="default"
            size="lg"
            isSelected={theme === 'light'}
            onValueChange={value =>
              value ? setTheme('light') : setTheme('dark')
            }
            thumbIcon={({isSelected, className}) =>
              isSelected ? (
                <SunIcon className={className} />
              ) : (
                <MoonIcon className={className} />
              )
            }>
            Светлая тема
          </Switch>
          <Avatar src={worker.photoUrl} size="lg" />
          {worker.name}
        </div>
      </div>
    </header>
  )
}
