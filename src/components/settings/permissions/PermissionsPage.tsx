'use client'

import type {FC} from 'react'
import {useState, useCallback} from 'react'
import type {CalendarDate} from '@internationalized/date'
import type {
  DefaultPermission,
  Permission,
  WorkerBasic,
  WorkerPermission,
} from '@/src/utils/types'
import useIsMobile from '@/src/hooks/useIsMobile'
import WorkersList from './WorkersList'
import PermissionsList from './PermissionsList'
import {Avatar, Label, ListBox, Select} from '@heroui/react'

interface PermissionsPageProps {
  workers: WorkerBasic[]
  permissions: Permission[]
  ranks: {id: number; name: string; weight: number}[]
  defaultPermissions: DefaultPermission[]
}

const PermissionsPage: FC<PermissionsPageProps> = ({
  workers,
  permissions,
  ranks,
  defaultPermissions: initialDefaults,
}) => {
  const isMobile = useIsMobile()
  const [selectedWorker, setSelectedWorker] = useState<WorkerBasic | null>(null)
  const [workerPermissions, setWorkerPermissions] = useState<WorkerPermission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [defaultPermissions, setDefaultPermissions] =
    useState<DefaultPermission[]>(initialDefaults)

  const loadWorkerPermissions = useCallback(async (worker: WorkerBasic) => {
    setSelectedWorker(worker)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/permissions/worker/${worker.id}`)
      const data = await res.json()
      setWorkerPermissions(data.permissions ?? [])
    } catch {
      setWorkerPermissions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleToggle = useCallback(
    async (permId: number, currentEnabled: boolean) => {
      if (!selectedWorker) return

      if (currentEnabled) {
        setWorkerPermissions(prev =>
          prev.filter(p => p.permission_id !== permId),
        )
        await fetch('/api/permissions/worker', {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            worker_id: selectedWorker.id,
            permission_id: permId,
          }),
        })
      } else {
        setWorkerPermissions(prev => [
          ...prev,
          {permission_id: permId, expires: null},
        ])
        await fetch('/api/permissions/worker', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            worker_id: selectedWorker.id,
            permission_id: permId,
            expires: null,
          }),
        })
      }
    },
    [selectedWorker],
  )

  const handleDateChange = useCallback(
    async (permId: number, date: CalendarDate | null) => {
      if (!selectedWorker) return

      const expires = date ? date.toString() : null
      setWorkerPermissions(prev =>
        prev.map(p => (p.permission_id === permId ? {...p, expires} : p)),
      )
      await fetch('/api/permissions/worker', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          worker_id: selectedWorker.id,
          permission_id: permId,
          expires,
        }),
      })
    },
    [selectedWorker],
  )

  const handleDefaultChange = useCallback(
    async (permId: number, rankId: number | null) => {
      setDefaultPermissions(prev => {
        const filtered = prev.filter(dp => dp.permission_id !== permId)
        if (rankId === null) return filtered
        const rank = ranks.find(r => r.id === rankId)
        if (!rank) return filtered
        return [
          ...filtered,
          {
            permission_id: permId,
            rank_id: rankId,
            rank_name: rank.name,
            rank_weight: rank.weight,
          },
        ]
      })
      await fetch('/api/permissions/defaults', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({permission_id: permId, rank_id: rankId}),
      })
    },
    [ranks],
  )

  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-divider shrink-0 border-b p-3">
          <Select
            selectedKey={selectedWorker ? String(selectedWorker.id) : null}
            onSelectionChange={key => {
              if (!key) return
              const id = parseInt(key as string)
              const w = workers.find(w => w.id === id)
              if (w) loadWorkerPermissions(w)
            }}
            aria-label="Выбор сотрудника"
            variant="secondary">
            <Label>Сотрудник</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {workers.map(w => (
                  <ListBox.Item id={String(w.id)} key={w.id} textValue={w.name}>
                    <div className="flex items-center gap-2 py-1">
                      <Avatar size="sm">
                        <Avatar.Image src={w.photoUrl || ''} />
                        <Avatar.Fallback>{w.name.slice(0, 2)}</Avatar.Fallback>
                      </Avatar>
                      <span>{w.name}</span>
                      <span className="text-default-400 ml-auto text-xs">
                        {w.rank ?? ''}
                      </span>
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div className="flex h-full max-h-dvh">
          <PermissionsList
            worker={selectedWorker}
            permissions={permissions}
            workerPermissions={workerPermissions}
            isLoading={isLoading}
            onToggle={handleToggle}
            onDateChange={handleDateChange}
            ranks={ranks}
            defaultPermissions={defaultPermissions}
            onDefaultChange={handleDefaultChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-dvh gap-2 p-2">
      <aside className="border-divider flex w-64 shrink-0 flex-col rounded-2xl">
        <WorkersList
          workers={workers}
          selectedId={selectedWorker?.id ?? null}
          search={search}
          onSearchChange={setSearch}
          onSelect={loadWorkerPermissions}
        />
      </aside>

      <main className="bg-surface flex h-full w-full flex-col rounded-2xl">
        <PermissionsList
          worker={selectedWorker}
          permissions={permissions}
          workerPermissions={workerPermissions}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDateChange={handleDateChange}
          ranks={ranks}
          defaultPermissions={defaultPermissions}
          onDefaultChange={handleDefaultChange}
        />
      </main>
    </div>
  )
}

export default PermissionsPage
