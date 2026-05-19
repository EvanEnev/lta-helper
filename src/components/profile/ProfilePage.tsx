'use client'

import {LTWorker} from '@/src/utils/types'
import {Avatar, Button} from '@heroui/react'
import useIsMobile from '@/src/hooks/useIsMobile'
import Navigation from '@/src/components/profile/Navigation'
import providers from '@/src/utils/global/providers'
import {authClient} from '@/lib/auth/authClient'
import {Icon} from '@iconify/react'
import capitalize from '@/lib/functions/capitalize'
import {useCallback, useState} from 'react'
import {LocationPicker} from '@/src/components/global/LocationPicker'
import fetchHandler from '@/src/utils/global/fetchHandler'

interface ProfilePageProps {
  worker: LTWorker
  userProviders: string[]
}

export default function ProfilePage({
  worker,
  userProviders: initialProviders,
}: ProfilePageProps) {
  const [userProviders, setUserProviders] = useState(initialProviders)
  const isMobile = useIsMobile()

  const setLocationCallback = useCallback(
    async ({lat, lng}: {lat: number; lng: number}) => {
      const body = {lat, lng}

      await fetchHandler({url: '/api/profile/setLocation', body})
    },
    [],
  )

  return (
    <main className="flex flex-col gap-2 p-4">
      <div className="flex flex-col items-center gap-2 rounded-2xl p-4 sm:flex-row">
        <Avatar className="h-64 w-64" size="lg">
          <Avatar.Image src={worker.photoUrl || ''} />
          <Avatar.Fallback>аватар</Avatar.Fallback>
        </Avatar>
        <p className="text-3xl">{worker.name}</p>
      </div>
      <div className="bg-surface flex flex-col gap-2 rounded-3xl p-4">
        <h1>Адрес</h1>
        <p className="text-muted italic">
          Данные используются для формирования ведомостей, учитывая расстояние
          до локации. Данные не передаются третьим лицам и надёжно сохранены
        </p>
        <LocationPicker
          onSelect={setLocationCallback}
          defaultCoords={worker.coords}
        />
      </div>
      {isMobile && <Navigation worker={worker} />}
      <div className="bg-surface flex flex-wrap gap-4 rounded-3xl p-4">
        {providers.map(provider => {
          const isLinked = userProviders.includes(provider.name)

          return (
            <div
              key={provider.name}
              className="bg-default flex flex-col gap-2 rounded-2xl p-4">
              <div className="mx-auto flex items-center gap-2">
                <Icon
                  icon={`logos:${provider.icon}`}
                  className="w-fit p-1"
                  width="24"
                  height="24"
                />
                <p>{capitalize(provider.name)}</p>
              </div>
              <p className={`${isLinked ? 'text-success' : ''}`}>
                {isLinked ? 'Привязан' : 'Не привязан'}
              </p>
              <Button
                slot="icon"
                key={provider.name}
                className="w-full"
                variant={isLinked ? 'danger-soft' : 'primary'}
                onPress={async () => {
                  if (isLinked) {
                    await authClient.unlinkAccount({
                      providerId: provider.name,
                    })

                    setUserProviders(prev =>
                      prev.filter(p => p !== provider.name),
                    )
                  } else {
                    await authClient.linkSocial({
                      provider: provider.name,
                      callbackURL: '/profile',
                    })
                  }
                }}>
                {isLinked ? 'Отвязать' : 'Привязать'}
              </Button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
