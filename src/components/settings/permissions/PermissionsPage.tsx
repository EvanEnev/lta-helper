'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronsUpDown} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {useIsMobile} from '@/hooks/use-mobile'
import type {
  DefaultPermission,
  Permission,
  WorkerBasic,
  WorkerPermission,
} from '@/src/utils/types'
import RankDefaults from './RankDefaults'
import WorkerPermissions from './WorkerPermissions'
import WorkersList from './WorkersList'

interface PermissionsPageProps {
  workers: WorkerBasic[]
  permissions: Permission[]
  ranks: {id: number; name: string; weight: number}[]
  defaultPermissions: DefaultPermission[]
}

const JSON_HEADERS = {'Content-Type': 'application/json'}

async function request(url: string, method: string, body: object) {
  try {
    const response = await fetch(url, {
      method,
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    })

    return response.ok
  } catch {
    return false
  }
}

export default function PermissionsPage({
  workers,
  permissions,
  ranks,
  defaultPermissions: initialDefaults,
}: PermissionsPageProps) {
  const isMobile = useIsMobile()
  const [selected, setSelected] = useState<WorkerBasic | null>(null)
  const [workerPermissions, setWorkerPermissions] = useState<
    WorkerPermission[]
  >([])
  const [isLoading, setLoading] = useState(false)
  const [defaults, setDefaults] = useState(initialDefaults)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadId = useRef(0)

  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(timer)
  }, [error])

  const selectWorker = useCallback(async (worker: WorkerBasic) => {
    const id = ++loadId.current

    setSelected(worker)
    setPickerOpen(false)
    setLoading(true)

    try {
      const response = await fetch(`/api/permissions/worker/${worker.id}`)
      const data = await response.json()

      if (id === loadId.current) {
        setWorkerPermissions(response.ok ? (data.permissions ?? []) : [])
        if (!response.ok) setError('Не удалось загрузить права сотрудника')
      }
    } catch {
      if (id === loadId.current) {
        setWorkerPermissions([])
        setError('Не удалось загрузить права сотрудника')
      }
    } finally {
      if (id === loadId.current) setLoading(false)
    }
  }, [])

  const toggle = useCallback(
    async (permissionId: number, enabled: boolean) => {
      if (!selected) return

      const previous = workerPermissions
      const body = {worker_id: selected.id, permission_id: permissionId}

      setWorkerPermissions(
        enabled
          ? [...previous, {permission_id: permissionId, expires: null}]
          : previous.filter(grant => grant.permission_id !== permissionId),
      )

      const ok = enabled
        ? await request('/api/permissions/worker', 'POST', {
            ...body,
            expires: null,
          })
        : await request('/api/permissions/worker', 'DELETE', body)

      if (!ok) {
        setWorkerPermissions(previous)
        setError('Не удалось сохранить изменение')
      }
    },
    [selected, workerPermissions],
  )

  const changeExpiry = useCallback(
    async (permissionId: number, expires: string | null) => {
      if (!selected) return

      const previous = workerPermissions

      setWorkerPermissions(
        previous.map(grant =>
          grant.permission_id === permissionId ? {...grant, expires} : grant,
        ),
      )

      const ok = await request('/api/permissions/worker', 'POST', {
        worker_id: selected.id,
        permission_id: permissionId,
        expires,
      })

      if (!ok) {
        setWorkerPermissions(previous)
        setError('Не удалось сохранить срок')
      }
    },
    [selected, workerPermissions],
  )

  const changeDefault = useCallback(
    async (permissionId: number, rankId: number | null) => {
      const previous = defaults
      const rank = ranks.find(r => r.id === rankId)
      const rest = previous.filter(rule => rule.permission_id !== permissionId)

      setDefaults(
        rank
          ? [
              ...rest,
              {
                permission_id: permissionId,
                rank_id: rank.id,
                rank_name: rank.name,
                rank_weight: rank.weight,
              },
            ]
          : rest,
      )

      const ok = await request('/api/permissions/defaults', 'POST', {
        permission_id: permissionId,
        rank_id: rankId,
      })

      if (!ok) {
        setDefaults(previous)
        setError('Не удалось сохранить правило')
      }
    },
    [defaults, ranks],
  )

  const workerPanel = (
    <WorkerPermissions
      worker={selected}
      permissions={permissions}
      workerPermissions={workerPermissions}
      defaultPermissions={defaults}
      isLoading={isLoading}
      onToggle={toggle}
      onExpiry={changeExpiry}
    />
  )

  return (
    <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-4 p-4">
      {error && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue="workers" className="gap-4">
        <TabsList>
          <TabsTrigger value="workers">Сотрудники</TabsTrigger>
          <TabsTrigger value="ranks">Права по рангам</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start">
            <Button
              variant="outline"
              size="lg"
              className="h-12 justify-between md:hidden"
              onClick={() => setPickerOpen(true)}>
              {selected ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar size="sm">
                    <AvatarImage src={selected.photoUrl || ''} />
                    <AvatarFallback>{selected.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{selected.name}</span>
                </span>
              ) : (
                'Выбрать сотрудника'
              )}
              <ChevronsUpDown className="text-muted-foreground" />
            </Button>

            <Card className="hidden md:sticky md:top-4 md:flex md:max-h-[calc(100dvh-8rem)]">
              <CardContent className="flex min-h-0 flex-1 flex-col">
                <WorkersList
                  workers={workers}
                  selectedId={selected?.id ?? null}
                  onSelect={selectWorker}
                  className="flex-1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent>{workerPanel}</CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ranks">
          <Card>
            <CardContent>
              <RankDefaults
                permissions={permissions}
                ranks={ranks}
                defaultPermissions={defaults}
                onChange={changeDefault}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isMobile && (
        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetContent side="bottom" className="max-h-[85dvh]">
            <SheetHeader>
              <SheetTitle>Сотрудник</SheetTitle>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-[calc(4rem+env(safe-area-inset-bottom))]">
              <WorkersList
                workers={workers}
                selectedId={selected?.id ?? null}
                onSelect={selectWorker}
                className="flex-1"
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </main>
  )
}
