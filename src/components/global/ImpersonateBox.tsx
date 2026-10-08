'use client'

import {useEffect, useState, useTransition} from 'react'
import {UserCog} from 'lucide-react'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox'
import {getImpersonationData, setImpersonation} from '@/app/actions/impersonate'
import {useSession} from '@/lib/auth/authClient'
import {IMPERSONATOR_ID} from '@/lib/auth/impersonation'

interface ImpersonateUser {
  id: number
  name: string
}

interface ImpersonateItemGroup {
  value: string
  items: ImpersonateUser[]
}

function ImpersonateCombobox({className}: {className?: string}) {
  const [groups, setGroups] = useState<ImpersonateItemGroup[]>([])
  const [current, setCurrent] = useState<ImpersonateUser | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getImpersonationData()
      .then(data => {
        setGroups(data.groups.map(g => ({value: g.rank, items: g.users})))
        setCurrent(
          data.groups
            .flatMap(g => g.users)
            .find(user => user.id === data.current) ?? null,
        )
      })
      .catch(() => {})
  }, [])

  return (
    <Combobox
      items={groups}
      value={current}
      disabled={pending}
      itemToStringLabel={(user: ImpersonateUser) => user.name}
      isItemEqualToValue={(a: ImpersonateUser, b: ImpersonateUser) =>
        a.id === b.id
      }
      onValueChange={(user: ImpersonateUser | null) => {
        setCurrent(user)
        startTransition(async () => {
          await setImpersonation(user?.id ?? null)
          sessionStorage.removeItem('worker')
          window.location.reload()
        })
      }}>
      <ComboboxInput
        className={className}
        placeholder="Войти как..."
        showClear={!!current}
      />
      <ComboboxContent side="top">
        <ComboboxEmpty>Никого не найдено</ComboboxEmpty>
        <ComboboxList>
          {(group: ImpersonateItemGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(user: ImpersonateUser) => (
                  <ComboboxItem key={user.id} value={user}>
                    {user.name}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default function ImpersonateBox({className}: {className?: string}) {
  const user = useSession().data?.user as {trueId?: number} | undefined

  if (user?.trueId !== IMPERSONATOR_ID) return null

  return (
    <div className="flex items-center gap-2">
      <UserCog className="text-muted-foreground size-4 shrink-0" />
      <ImpersonateCombobox className={className} />
    </div>
  )
}
