'use client'

import {LTWorker} from '@/src/utils/types'
import {Avatar} from '@heroui/react'
import useIsMobile from '@/src/hooks/useIsMobile'
import Navigation from '@/src/components/profile/Navigation'

interface ProfilePageProps {
  worker: LTWorker
  userProviders: string[]
}

export default function ProfilePage({worker, userProviders}: ProfilePageProps) {
  const isMobile = useIsMobile()

  return (
    <main className="flex flex-col gap-2 p-4">
      <div className="flex flex-col items-center gap-2 rounded-2xl p-4 sm:flex-row">
        <Avatar className="h-64 w-64" size="lg">
          <Avatar.Image src={worker.photoUrl || ''} />
          <Avatar.Fallback>аватар</Avatar.Fallback>
        </Avatar>
        <p className="text-3xl">{worker.name}</p>
        {/*<TextField value={worker.phoneNumber || ''}>*/}
        {/*  <Label>Номер телефона</Label>*/}
        {/*  <Input />*/}
        {/*</TextField>*/}
      </div>
      {isMobile && <Navigation worker={worker} />}
      {/*<div>*/}
      {/*  {providers.map(provider => (*/}
      {/*    <div*/}
      {/*      key={provider.name}*/}
      {/*      className={`${userProviders.includes(provider.name.toLowerCase()) ? 'bg-success' : ''}`}>*/}
      {/*      {provider.name}*/}
      {/*    </div>*/}
      {/*  ))}*/}
      {/*</div>*/}
    </main>
  )
}
