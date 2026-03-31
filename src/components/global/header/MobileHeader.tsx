import {Link} from '@heroui/react-beta'
import {usePathname} from 'next/navigation'
import buttonsRaw from '@/src/utils/global/pathButtons'
import checkPermissions from '@/lib/functions/checkPermissions'
import {LTWorker} from '@/src/utils/types'
import {Fragment, Ref} from 'react'
import {Icon} from '@iconify/react'

interface MobileHeaderProps {
  worker?: LTWorker
  ref: Ref<HTMLElement | null>
  className?: string
}

const buttonsPaths = ['/', '/schedule', '/salary', '/profile']

export default function MobileHeader({
  ref,
  worker,
  className = '',
}: MobileHeaderProps) {
  const path = usePathname()

  let buttons = buttonsRaw.filter(
    button =>
      buttonsPaths.includes(button.href) &&
      (button.permission
        ? checkPermissions([button.permission], worker)
        : true),
  )

  buttonsRaw
    .filter(button => button.children?.length)
    .forEach(button => {
      for (const child of button.children!) {
        if (
          buttonsPaths.includes(child.href) &&
          (child.permission
            ? checkPermissions([child.permission], worker)
            : true)
        ) {
          buttons.push(child)
        }
      }
    })

  buttons = buttons.sort((a, b) => {
    const ia = buttonsPaths.indexOf(a.href)
    const ib = buttonsPaths.indexOf(b.href)
    return ia - ib
  })

  return (
    <header
      ref={ref}
      className={`fixed bottom-0 left-0 z-1000 w-dvw px-8 pb-2 ${className}`}>
      <div className="glass mx-auto flex h-16 w-full items-center gap-2 rounded-4xl p-1">
        {buttons.map((button, index) => (
          <Fragment key={index}>
            <Link
              key={index}
              href={button.href}
              className={`h-full flex-1 flex-col items-center justify-center gap-1 rounded-4xl px-6 py-4 text-center no-underline ${button.className} ${path === button.href ? 'bg-primary/20' : ''}`}
              slot="header">
              {button.icon && (
                <Icon
                  icon={
                    path === button.href
                      ? button.icon.replace('linear', 'bold')
                      : button.icon
                  }
                  className={`${path === button.href ? 'text-primary' : ''} shrink-0`}
                  width="24"
                  height="24"
                />
              )}
            </Link>
          </Fragment>
        ))}
      </div>
    </header>
  )
}
