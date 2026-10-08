'use client'

import {useCallback, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useTheme} from 'next-themes'
import {LogOut, MapPin, Mail, Moon, Phone, Sun, Wallet} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {LocationPicker} from '@/src/components/global/LocationPicker'
import {ProviderIcon} from '@/src/components/global/BrandIcons'
import RankIcon from '@/src/components/global/RankIcon'
import StatTile from '@/src/components/global/StatTile'
import {authClient} from '@/lib/auth/authClient'
import capitalize from '@/lib/functions/capitalize'
import separateNumber from '@/lib/functions/separateNumber'
import fetchHandler from '@/src/utils/global/fetchHandler'
import providers from '@/src/utils/global/providers'
import type {LTWorker} from '@/src/utils/types'

interface ProfilePageProps {
  worker: LTWorker
  userProviders: string[]
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const SAVE_LABEL: Record<SaveState, string> = {
  idle: '',
  saving: 'Сохраняю…',
  saved: 'Сохранено',
  error: 'Не удалось сохранить',
}

const realEmail = (value?: string | null) =>
  value && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : null

function Contact({
  icon: ContactIcon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      <ContactIcon className="text-muted-foreground size-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-base">
          {value || <span className="text-muted-foreground">Не указано</span>}
        </p>
      </div>
    </div>
  )
}

export default function ProfilePage({
  worker,
  userProviders: initialProviders,
}: ProfilePageProps) {
  const router = useRouter()
  const [userProviders, setUserProviders] = useState(initialProviders)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [unlinking, setUnlinking] = useState<string | null>(null)

  const fullName = [worker.lastName, worker.firstName, worker.middleName]
    .filter(Boolean)
    .join(' ')

  const saveLocation = useCallback(
    async ({lat, lng}: {lat: number; lng: number}) => {
      setSaveState('saving')

      const result = await fetchHandler({
        url: '/api/profile/setLocation',
        body: {lat, lng},
      })

      setSaveState(result ? 'saved' : 'error')
    },
    [],
  )

  const toggleProvider = async (name: string) => {
    if (userProviders.includes(name)) {
      await authClient.unlinkAccount({providerId: name})
      setUserProviders(prev => prev.filter(p => p !== name))
    } else {
      await authClient.linkSocial({provider: name, callbackURL: '/profile'})
    }

    setUnlinking(null)
  }

  const signOut = () =>
    authClient.signOut(
      {},
      {
        onSuccess: () => {
          try {
            sessionStorage.removeItem('worker')
          } catch {}
          router.push('/login')
        },
      },
    )

  return (
    <main className="mx-auto flex w-full max-w-400 flex-col gap-4 p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <Avatar className="size-28 sm:size-32">
            <AvatarImage src={worker.photoUrl || ''} alt="" />
            <AvatarFallback className="text-3xl">
              {worker.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
            <h1 className="text-3xl font-semibold">{worker.name}</h1>
            {fullName && (
              <p className="text-muted-foreground text-lg">{fullName}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <RankIcon rank={worker.rank} className="h-8 w-auto" />
              <span className="text-lg">{capitalize(worker.rank)}</span>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:ml-auto sm:w-auto sm:grid-cols-2">
            <StatTile
              icon={Wallet}
              value={`${separateNumber(worker.balance ?? 0)} ₽`}
              label="Баланс"
              className="text-primary"
            />
            <StatTile
              icon={MapPin}
              value={worker.location || '—'}
              label="Основная локация"
              className="text-primary"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              Адрес
              <span
                aria-live="polite"
                className={
                  saveState === 'error'
                    ? 'text-destructive text-sm font-normal'
                    : 'text-muted-foreground text-sm font-normal'
                }>
                {SAVE_LABEL[saveState]}
              </span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Нужен, чтобы при формировании ведомостей учитывалось расстояние до
              локации. Данные не передаются третьим лицам. Адрес сохраняется
              сразу после выбора.
            </p>
          </CardHeader>
          <CardContent>
            <LocationPicker
              onSelect={saveLocation}
              defaultCoords={worker.coords}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Контакты</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Contact
                icon={Mail}
                label="Почта"
                value={realEmail(worker.email)}
              />
              <Contact
                icon={Phone}
                label="Телефон"
                value={worker.phoneNumber}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Входы в аккаунт</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {providers.map(provider => {
                const isLinked = userProviders.includes(provider.name)

                return (
                  <div
                    key={provider.name}
                    className="flex items-center gap-3 rounded-lg border p-3">
                    <ProviderIcon name={provider.name} className="size-6" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium">
                        {capitalize(provider.name)}
                      </p>
                      <Badge variant={isLinked ? 'secondary' : 'outline'}>
                        {isLinked ? 'Привязан' : 'Не привязан'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Оформление и выход</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ThemeButtons />
              <Button variant="destructive" className="h-10" onClick={signOut}>
                <LogOut />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!unlinking}
        onOpenChange={open => !open && setUnlinking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отвязать {capitalize(unlinking ?? '')}?</DialogTitle>
            <DialogDescription>
              Войти через этот аккаунт больше не получится, пока вы не привяжете
              его снова.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinking(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => unlinking && toggleProvider(unlinking)}>
              Отвязать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function ThemeButtons() {
  const {setTheme} = useTheme()

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="outline"
        className="dark:bg-accent h-10"
        onClick={() => setTheme('dark')}>
        <Moon />
        Тёмная
      </Button>
      <Button
        variant="outline"
        className="bg-accent h-10 dark:bg-transparent"
        onClick={() => setTheme('light')}>
        <Sun />
        Светлая
      </Button>
    </div>
  )
}
