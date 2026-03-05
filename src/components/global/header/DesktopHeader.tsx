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
}

export default function DesktopHeader({worker, ref}: DesktopHeaderProps) {
  const path = usePathname()
  const [permanentHovers, setPermanentHovers] = useState<number[]>([])
  const [rawHover, setRawHover] = useState<number | null>(null)
  const [isHover, setIsHover] = useState<number | null>(null)

  useEffect(() => {
    if (isHover === rawHover) return
    const timeout = setTimeout(() => {
      setIsHover(rawHover)
    }, 50)

    return () => clearTimeout(timeout)
  }, [isHover, rawHover])

  return (
    <header
      ref={ref}
      className="sticky top-0 left-0 z-10000 flex h-dvh w-fit flex-col p-2">
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
                <Dropdown
                  onOpenChange={() => {
                    if (permanentHovers.includes(index)) {
                      setPermanentHovers(prev => prev.filter(i => i !== index))
                    } else {
                      setPermanentHovers(prev => [...prev, index])
                    }
                  }}
                  placement="right"
                  key={index}
                  isOpen={isHover === index || permanentHovers.includes(index)}
                  classNames={{backdrop: 'z-10000', content: 'z-10000'}}>
                  <DropdownTrigger>
                    <Button
                      onMouseEnter={() => setRawHover(index)}
                      onMouseLeave={() => setRawHover(null)}
                      variant={path === button.href ? 'shadow' : 'ghost'}
                      className={`h-16 w-full flex-col p-2 text-xs ${button.className}`}
                      size="lg"
                      title={button.name}
                      aria-label={button.name}
                      aria-placeholder={button.name}>
                      {button.icon && (
                        <Icon icon={button.icon} width="24" height="24" />
                      )}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onMouseEnter={() => setRawHover(index)}
                    onMouseLeave={() => setRawHover(null)}>
                    {button.children
                      .filter(d =>
                        d.permission
                          ? checkPermissions([d.permission], worker)
                          : true,
                      )
                      .filter(
                        d =>
                          !(
                            d.isDisabled && !checkPermissions(['admin'], worker)
                          ),
                      )
                      .map((child, index) => (
                        <DropdownItem
                          title={child.name}
                          // @ts-ignore
                          routerOptions={{replace: true}}
                          key={index}
                          className="h-12"
                          startContent={
                            child.icon ? (
                              <Icon icon={child.icon} width="24" height="24" />
                            ) : (
                              ''
                            )
                          }
                          href={path === child.href ? '#' : child.href}
                        />
                      ))}
                  </DropdownMenu>
                </Dropdown>
              )
            }

            return (
              <Button
                key={index}
                as={Link}
                href={path === button.href ? '#' : button.href}
                variant={path === button.href ? 'shadow' : 'ghost'}
                className={`h-16 w-full flex-col p-2 text-xs ${button.className}`}
                size="lg"
                title={button.name}
                aria-label={button.name}
                aria-placeholder={button.name}>
                {button.icon && (
                  <Icon icon={button.icon} width="24" height="24" />
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
