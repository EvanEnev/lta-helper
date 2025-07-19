import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Link,
  useDisclosure,
} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {HamburgerMenu} from 'solar-icon-set'
import buttons from '@/src/utils/global/pathButtons'
import {useAuth} from '@/src/components/global/providers/authProvider'
import User from '@/src/components/global/header/User'
import checkPermissions from '@/lib/functions/checkPermissions'

export default function MobileHeader({scrolled}: {scrolled: boolean}) {
  const path = usePathname()
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()
  const {headerRef, setExiting, worker} = useAuth()

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 left-0 z-1000 flex w-[100dvw] p-2`}>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="z-10000 max-w-[70%]"
        classNames={{backdrop: 'z-10000', wrapper: 'z-10000'}}
        placement="left"
        backdrop="blur">
        <DrawerContent className="z-10000">
          <DrawerHeader>
            {buttons.find(obj => obj.href === path)?.name}
          </DrawerHeader>
          <DrawerBody>
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
                  className="h-16 w-full p-2"
                  size="lg"
                  title={button.name}
                  aria-label={button.name}
                  aria-placeholder={button.name}
                  startContent={<button.icon size={24} />}>
                  {button.name}
                </Button>
              )
            })}
          </DrawerBody>
          <DrawerFooter>
            <Button
              onPress={onClose}
              className="h-16 w-full"
              color="danger"
              variant="ghost">
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div
        className={`flex h-full w-full flex-wrap items-center justify-between gap-1 px-2 py-4 ${scrolled ? 'scrolled' : ''}`}>
        <Button className="flex-1" variant="ghost" onPress={onOpen} isIconOnly>
          <HamburgerMenu size={24} />
        </Button>

        <span className="flex-1 text-center text-2xl font-bold">
          {buttons.find(obj => obj.href === path)?.name}
        </span>
        <div className="flex flex-1 items-center justify-center gap-2 text-2xl">
          <User />
        </div>
      </div>
    </header>
  )
}
