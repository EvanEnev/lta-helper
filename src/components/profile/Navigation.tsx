import buttonsRaw from '@/src/utils/global/pathButtons'
import checkPermissions from '@/lib/functions/checkPermissions'
import {Button, Link} from '@heroui/react-beta'
import {Icon} from '@iconify/react'
import {LTWorker} from '@/src/utils/types'

interface NavigationProps {
  worker: LTWorker
}

export default function Navigation({worker}: NavigationProps) {
  return buttonsRaw.map((button, index) => {
    if (button.hide) return ''

    if (button.permission && !checkPermissions([button.permission], worker))
      return ''
    if (button.isDisabled && !checkPermissions(['admin'], worker)) return ''

    if (button.children?.length) {
      return (
        <fieldset
          className="flex flex-col gap-2 rounded-2xl border-2 p-2"
          key={index}>
          <legend className="flex gap-1 px-1">
            {button.icon ? (
              <Icon icon={button.icon} width="24" height="24" />
            ) : (
              ''
            )}
            {button.name}
          </legend>
          {button.children
            .filter(d =>
              d.permission ? checkPermissions([d.permission], worker) : true,
            )
            .filter(
              d => !(d.isDisabled && !checkPermissions(['admin'], worker)),
            )
            .map((child, index) => (
              <Link
                className="w-full no-underline"
                key={index}
                href={child.href}>
                <Button
                  variant="tertiary"
                  className={`h-16 w-full ${child.className}`}>
                  {child.icon ? (
                    <Icon icon={child.icon} width="24" height="24" />
                  ) : (
                    ''
                  )}
                  {child.name}
                </Button>
              </Link>
            ))}
        </fieldset>
      )
    }

    return (
      <Link className="w-full no-underline" key={index}>
        <Button
          variant="tertiary"
          className={`h-16 w-full p-2 ${button.className}`}
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
  })
}
