import {
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@heroui/react'
import {useTheme} from 'next-themes'
import {authClient} from '@/lib/auth/authClient'
import {useRouter} from 'next/navigation'
import {LTWorker} from '@/src/utils/types'
import {Icon} from '@iconify/react'

interface UserProps {
  worker?: LTWorker
}

export default function User({worker}: UserProps) {
  const router = useRouter()
  const {theme, setTheme} = useTheme()

  return (
    <Popover>
      <Popover.Trigger>
        <Button
          aria-label="Профиль"
          className="flex h-fit items-center p-2 text-3xl"
          variant="ghost">
          <Avatar size="lg">
            <Avatar.Image src={worker?.photoUrl || undefined} />
          </Avatar>
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col items-center gap-1 p-4 text-2xl">
        {worker?.name || ''}
        <Separator />
        Тема
        <div className="flex gap-2">
          <Button
            variant={theme === 'dark' ? 'primary' : 'outline'}
            onPress={() => setTheme('dark')}>
            <Icon icon="solar:moon-linear" width="24" height="24" />
            Тёмная
          </Button>
          <Button
            variant={theme === 'light' ? 'primary' : 'outline'}
            onPress={() => setTheme('light')}>
            <Icon icon="solar:sun-2-linear" width="24" height="24" />
            Светлая
          </Button>
        </div>
        <Separator />
        <Button
          variant="danger-soft"
          className="w-full"
          onPress={async () =>
            await authClient.signOut(
              {},
              {
                onSuccess: () => {
                  sessionStorage.removeItem('worker')
                  router.push('/login')
                },
              },
            )
          }>
          Выйти из аккаунта
        </Button>
      </Popover.Content>
    </Popover>
  )
}
