import {
  Accordion,
  AccordionItem,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  semanticColors,
  useDisclosure,
} from '@heroui/react'
import {Button, Separator, Link} from '@heroui/react-beta'
import {usePathname} from 'next/navigation'
import buttonsRaw from '@/src/utils/global/pathButtons'
import checkPermissions from '@/lib/functions/checkPermissions'
import {LTWorker} from '@/src/utils/types'
import {Fragment, Ref} from 'react'
import {useTheme} from 'next-themes'
import {Icon} from '@iconify/react'

interface MobileHeaderProps {
  scrolled: boolean
  worker?: LTWorker
  ref: Ref<HTMLElement | null>
}

const buttonsPaths = ['/', '/schedule', '/salary']

export default function MobileHeader({
  scrolled,
  ref,
  worker,
}: MobileHeaderProps) {
  const path = usePathname()
  const {theme} = useTheme()
  const {isOpen, onOpen, onClose, onOpenChange} = useDisclosure()

  const buttons = buttonsRaw.filter(
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

  return (
    <header
      ref={ref}
      className={`bg-content2 fixed bottom-0 left-0 z-100000 flex h-20 w-dvw flex-wrap items-center justify-around gap-1 shadow-2xl`}>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="z-10000 h-[80%] max-h-[80%] pb-20"
        classNames={{backdrop: 'z-10000', wrapper: 'z-10000'}}
        placement="bottom"
        size="full"
        backdrop="blur">
        <DrawerContent className="z-10000">
          <DrawerHeader>
            {buttonsRaw.find(obj => obj.href === path)?.name}
          </DrawerHeader>
          <DrawerBody>
            {buttonsRaw.map((button, index) => {
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
                  <Accordion
                    key={index}
                    defaultExpandedKeys={['1']}
                    variant="splitted">
                    <AccordionItem
                      classNames={{content: 'flex flex-col gap-2'}}
                      title={button.name}
                      startContent={
                        button.icon ? (
                          <Icon icon={button.icon} width="24" height="24" />
                        ) : (
                          ''
                        )
                      }
                      key={'1'}>
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
                          <Link
                            className="w-full"
                            key={index}
                            href={path === child.href ? '#' : child.href}>
                            <Button
                              variant="tertiary"
                              className={`h-16 w-full ${path === child.href ? 'shadow-primary shadow-sm' : ''} ${child.className}`}>
                              {child.icon ? (
                                <Icon
                                  icon={child.icon}
                                  width="24"
                                  height="24"
                                />
                              ) : (
                                ''
                              )}
                              {child.name}
                            </Button>
                          </Link>
                        ))}
                    </AccordionItem>
                  </Accordion>
                )
              }

              return (
                <Link
                  className="w-full"
                  href={path === button.href ? '#' : button.href}
                  key={index}>
                  <Button
                    variant="tertiary"
                    className={`h-16 w-full p-2 ${path === button.href ? 'shadow-primary shadow-sm' : ''} ${button.className}`}
                    size="lg">
                    {button.icon ? (
                      <Icon icon={button.icon} width="24" height="24" />
                    ) : (
                      ''
                    )}{' '}
                    {button.name}
                  </Button>
                </Link>
              )
            })}
          </DrawerBody>
          <DrawerFooter>
            <Button
              onPress={onClose}
              className="h-16 w-full"
              variant="danger-soft">
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {buttons.map((button, index) => (
        <Fragment key={index}>
          <Link
            key={index}
            href={button.href}
            className={`flex-col items-center justify-center gap-1 ${button.className} ${path === button.href ? 'drop-shadow-primary drop-shadow-2xl' : ''}`}
            slot="header">
            {button.icon && (
              <Icon
                icon={button.icon}
                className="items-center justify-center"
                color={
                  path === button.href
                    ? // @ts-ignore
                      semanticColors[theme || 'dark'].primary['500']
                    : undefined
                }
                width="24"
                height="24"
              />
            )}
            <Separator
              className={`${path === button.href ? 'bg-primary' : 'bg-content2-foreground'}`}
            />
          </Link>
          {index !== buttons.length - 1 && (
            <Separator
              orientation="vertical"
              className="bg-content2-foreground h-[50%]"
            />
          )}
        </Fragment>
      ))}
      <Separator
        orientation="vertical"
        className="bg-content2-foreground h-[50%]"
      />
      <Button
        className="flex flex-col gap-1"
        slot="header"
        variant="ghost"
        onPress={onOpen}
        isIconOnly>
        <Icon
          icon="solar:hamburger-menu-linear"
          width="24"
          height="24"
          className="items-center justify-center"
        />
        <Separator className="bg-content2-foreground" />
      </Button>

      {/*<span className="text-center text-2xl font-bold">*/}
      {/*  {buttons.find(obj => obj.href === path)?.name}*/}
      {/*</span>*/}
      {/*<div className="flex items-center justify-center gap-2 text-2xl">*/}
      {/*  <User worker={worker} />*/}
      {/*</div>*/}
    </header>
  )
}
