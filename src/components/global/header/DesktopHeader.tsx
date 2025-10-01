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
import {useAuth} from '@/src/components/global/providers/authProvider'
import checkPermissions from '@/lib/functions/checkPermissions'
import User from '@/src/components/global/header/User'
import {useEffect, useState} from 'react'

export default function DesktopHeader() {
  const {headerRef, setExiting, worker} = useAuth()
  const path = usePathname()
  const [rawHover, setRawHover] = useState<boolean>(false)
  const [isHover, setIsHover] = useState<boolean>(false)

  useEffect(() => {
    if (isHover === rawHover) return
    const timeout = setTimeout(() => {
      setIsHover(rawHover)
    }, 50)

    return () => clearTimeout(timeout)
  }, [isHover, rawHover])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 left-0 z-10000 flex h-[100dvh] w-fit flex-col p-2">
      <div className="header-inner items-between glass flex h-full w-full justify-between px-2 py-4">
        <div className="items-between flex flex-col justify-start gap-4">
          <User />
          {buttons.map((button, index) => {
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
                  placement="right"
                  key={index}
                  isOpen={isHover}
                  classNames={{backdrop: 'z-10000', content: 'z-10000'}}>
                  <DropdownTrigger>
                    <Button
                      as={Link}
                      onMouseEnter={() => setRawHover(true)}
                      onMouseLeave={() => setRawHover(false)}
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
                      {button.icon && <button.icon size={24} />}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onMouseEnter={() => setRawHover(true)}
                    onMouseLeave={() => setRawHover(false)}>
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
                            child.icon ? <child.icon size={24} /> : ''
                          }
                          href={path === child.href ? '#' : child.href}
                          onPress={() => {
                            if (path !== child.href) {
                              setExiting(true)
                            }
                          }}
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
                {button.icon && <button.icon size={24} />}
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
