import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Fragment, Ref, useState} from 'react'
import {Button} from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {Separator} from '@/components/ui/separator'
import {cn} from '@/lib/utils'
import checkPermissions from '@/lib/functions/checkPermissions'
import buttonsRaw from '@/src/utils/global/pathButtons'
import RankIcon from '@/src/components/global/RankIcon'
import ImpersonateBox from '@/src/components/global/ImpersonateBox'
import {LTWorker} from '@/src/utils/types'
import {Menu} from 'lucide-react'

interface MobileHeaderProps {
  worker?: LTWorker
  ref: Ref<HTMLElement | null>
  className?: string
}

type PathButton = (typeof buttonsRaw)[number]

const buttonsPaths = ['/', '/schedule', '/salary']

const navButtonClass =
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-7'

const isActivePath = (pathname: string, href: string) =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(href + '/')

export default function MobileHeader({
  ref,
  worker,
  className = '',
}: MobileHeaderProps) {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  const isAvailable = (
    button: Pick<PathButton, 'permission' | 'isDisabled' | 'hide'>,
  ) =>
    !button.hide &&
    (!button.permission || checkPermissions([button.permission], worker)) &&
    (!button.isDisabled || checkPermissions(['admin'], worker))

  const allButtons = buttonsRaw.flatMap(button => [
    ...(button.children?.length ? [] : [button]),
    ...(button.children ?? []),
  ])

  const quickButtons = allButtons
    .filter(button => buttonsPaths.includes(button.href) && isAvailable(button))
    .sort((a, b) => buttonsPaths.indexOf(a.href) - buttonsPaths.indexOf(b.href))

  const singles = buttonsRaw.filter(
    button => !button.children?.length && isAvailable(button),
  )
  const groups = buttonsRaw
    .filter(button => button.children?.length)
    .map(group => ({
      ...group,
      children: group.children!.filter(isAvailable),
    }))
    .filter(group => group.children.length)

  const renderLink = (
    button: PathButton | NonNullable<PathButton['children']>[number],
  ) => {
    const active = isActivePath(path, button.href)

    return (
      <Button
        key={button.href}
        variant="ghost"
        size="lg"
        data-active={active || undefined}
        className={cn(
          navButtonClass,
          'h-10 justify-start gap-3 px-3 text-base [&_svg]:size-6',
        )}
        onClick={() => setOpen(false)}
        render={<Link href={button.href} />}>
        {button.icon && <button.icon />}
        {button.name}
      </Button>
    )
  }

  return (
    <header
      ref={ref}
      className={cn(
        'border-sidebar-border bg-sidebar text-sidebar-foreground fixed bottom-0 left-0 z-1000 w-dvw border-t pb-[env(safe-area-inset-bottom)]',
        className,
      )}>
      <div className="flex w-full items-center gap-1 p-1.5">
        {quickButtons.map(button => {
          const active = isActivePath(path, button.href)

          return (
            <Button
              key={button.href}
              variant="ghost"
              aria-label={button.name}
              data-active={active || undefined}
              className={cn(navButtonClass, 'h-11 flex-1')}
              render={<Link href={button.href} />}>
              {button.icon && <button.icon />}
            </Button>
          )
        })}

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger
            render={
              <Button
                variant="ghost"
                aria-label="Меню"
                data-active={open || undefined}
                className={cn(navButtonClass, 'h-11 flex-1')}
              />
            }>
            <Menu />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="flex-row items-center gap-3 text-left">
              <RankIcon rank={worker?.rank || ''} />
              <div className="flex min-w-0 flex-col">
                <DrawerTitle className="truncate">
                  {worker?.name ?? 'Меню'}
                </DrawerTitle>
                <DrawerDescription>Разделы</DrawerDescription>
              </div>
            </DrawerHeader>
            <nav
              data-base-ui-swipe-ignore
              className="flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3">
              {singles.map(renderLink)}
              {groups.map(group => (
                <Fragment key={group.name}>
                  <Separator className="my-2" />
                  <span className="text-muted-foreground flex items-center gap-2 px-3 py-1 text-sm font-medium">
                    {group.icon && <group.icon />}
                    {group.name}
                  </span>
                  {group.children.map(renderLink)}
                </Fragment>
              ))}
              <div className="px-3 pt-3 empty:hidden">
                <ImpersonateBox />
              </div>
              <div
                aria-hidden
                className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0"
              />
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
}
