import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from '@heroui/react'
import {usePathname} from 'next/navigation'
import buttons from '@/src/utils/global/pathButtons'
import checkPermissions from '@/lib/functions/checkPermissions'
import User from '@/src/components/global/header/User'
import {Ref, useEffect, useState} from 'react'
import {LTWorker} from '@/src/utils/types'
import {Icon} from '@iconify/react'

interface DesktopHeaderProps {
  worker?: LTWorker
  ref: Ref<HTMLElement | null>
  className?: string
}

export default function DesktopHeader({
  worker,
  ref,
  className = '',
}: DesktopHeaderProps) {
  const path = usePathname()
  const [permanentHovers, setPermanentHovers] = useState<number[]>([])
  const [rawHover, setRawHover] = useState<number | null>(null)
  const [isHover, setIsHover] = useState<number | null>(null)

  useEffect(() => {
    console.debug(rawHover)
    if (isHover === rawHover) return
    const timeout = setTimeout(() => {
      setIsHover(rawHover)
    }, 50)

    return () => clearTimeout(timeout)
  }, [isHover, rawHover])

  return (
    <header
      ref={ref}
      className={`sticky top-0 left-0 z-10000 flex h-dvh w-fit flex-col p-2 ${className}`}>
      <div className="header-inner items-between glass flex h-full w-full justify-between px-2 py-4">
        <div className="items-between flex flex-col justify-start gap-4">
          <User worker={worker} />
          {buttons.map((button, index) => {
            if (button.hide) return ''

            if (
              button.permission &&
              !checkPermissions([button.permission], worker)
            )
              return ''

            if (button.isDisabled && !checkPermissions(['admin'], worker))
              return ''

            if (button.children?.length) {
              return (
                <Dropdown key={button.name}>
                  <Button
                    isIconOnly
                    slot="icon"
                    variant={path === button.href ? 'tertiary' : 'outline'}
                    className={`flex h-16 w-full gap-1 p-2 text-xs ${button.className}`}
                    aria-label={button.name}
                    aria-placeholder={button.name}>
                    {button.icon && (
                      <Icon icon={button.icon} width="24" height="24" />
                    )}
                  </Button>
                  <Dropdown.Popover>
                    <Dropdown.Menu>
                      {button.children
                        .filter(d =>
                          d.permission
                            ? checkPermissions([d.permission], worker)
                            : true,
                        )
                        .filter(
                          d =>
                            !(
                              d.isDisabled &&
                              !checkPermissions(['admin'], worker)
                            ),
                        )
                        .map((child, index) => (
                          <Dropdown.Item
                            key={index}
                            id={index}
                            className="h-12"
                            href={path === child.href ? '#' : child.href}>
                            {child.icon ? (
                              <Icon icon={child.icon} width="24" height="24" />
                            ) : (
                              ''
                            )}
                            {child.name}
                          </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              )
            }

            return (
              <Button
                slot="icon"
                key={index}
                variant={path === button.href ? 'tertiary' : 'outline'}
                className={`h-16 w-full flex-col p-2 text-xs ${button.className}`}
                size="lg"
                aria-label={button.name}
                aria-placeholder={button.name}>
                <Link href={path === button.href ? '#' : button.href}>
                  {button.icon && (
                    <Icon icon={button.icon} width="24" height="24" />
                  )}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
