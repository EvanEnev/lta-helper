import {Avatar, Button, Link, Switch} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {ArrowLeft} from 'solar-icon-set'
import buttons from '@/src/utils/global/pathButtons'
import {LTWorker} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {useTheme} from 'next-themes'
import {MoonIcon, SunIcon} from '@heroui/shared-icons'

export default function MobileHeader({
  worker,
  scrolled,
}: {
  worker: LTWorker
  scrolled: boolean
}) {
  const path = usePathname()
  const {headerRef, setExiting, customHeaderComponents} = useAuth()
  const {theme, setTheme} = useTheme()

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 z-1000 flex w-full p-2`}>
      <div
        className={`flex h-full w-full flex-wrap items-center justify-between gap-1 px-2 py-4 ${scrolled ? 'scrolled' : ''}`}>
        <Button
          as={Link}
          href="/"
          variant="ghost"
          size="lg"
          isIconOnly
          startContent={
            <ArrowLeft size={24} svgProps={{width: 24, height: 24}} />
          }
          onPress={() => {
            setExiting(true)
          }}
          className={`${path === '/' ? 'hidden' : ''} flex-1`}
        />
        <span className="flex-1 text-center text-2xl font-bold">
          {buttons.find(obj => obj.href === path)?.name}
        </span>
        {customHeaderComponents}
        <div className="flex flex-1 items-center justify-center gap-2 text-2xl">
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
            Тема
          </Switch>
          <Avatar src={worker.photoUrl} />
          {worker.name}
        </div>
      </div>
    </header>
  )
}
