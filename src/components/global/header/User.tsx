import {
  Avatar,
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@heroui/react'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {MoonIcon, SunIcon} from '@heroui/shared-icons'
import {useTheme} from 'next-themes'
import {authClient} from '@/lib/auth/authClient'
import {useRouter} from 'next/navigation'

export default function User() {
  const router = useRouter()
  const {worker} = useAuth()
  const {theme, setTheme} = useTheme()

  return (
    <Popover backdrop="opaque">
      <PopoverTrigger>
        <Button
          aria-label="Профиль"
          className="flex h-fit items-center p-2 text-3xl"
          variant="ghost">
          <Avatar src={worker.photoUrl || undefined} size="lg" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-1 py-4 text-2xl">
        {worker.name}
        <Divider />
        Тема
        <div className="flex gap-2">
          <Button
            color={theme === 'dark' ? 'primary' : 'default'}
            onPress={() => setTheme('dark')}
            startContent={<MoonIcon />}>
            Тёмная
          </Button>
          <Button
            color={theme === 'light' ? 'primary' : 'default'}
            onPress={() => setTheme('light')}
            startContent={<SunIcon />}>
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
