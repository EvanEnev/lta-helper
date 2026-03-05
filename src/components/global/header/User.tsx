import {
  Avatar,
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
    <Popover backdrop="opaque">
      <PopoverTrigger>
        <Button
          aria-label="Профиль"
          className="flex h-fit items-center p-2 text-3xl"
          variant="ghost">
          <Avatar src={worker?.photoUrl || undefined} size="lg" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1 py-4 text-2xl">
        {worker?.name || ''}
        <Divider />
        Тема
        <div className="flex gap-2">
          <Button
            color={theme === 'dark' ? 'primary' : 'default'}
            onPress={() => setTheme('dark')}
            startContent={
              <Icon icon="solar:moon-linear" width="24" height="24" />
            }>
            Тёмная
          </Button>
          <Button
            color={theme === 'light' ? 'primary' : 'default'}
            onPress={() => setTheme('light')}
            startContent={
              <Icon icon="solar:sun-2-linear" width="24" height="24" />
            }>
            Светлая
          </Button>
        </div>
        <Divider />
        <Button
          variant="ghost"
          color="danger"
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
          Выйти
        </Button>
      </PopoverContent>
    </Popover>
  )
}
