'use client'

import {useMemo, useState} from 'react'
import {Search, Shield} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Skeleton} from '@/components/ui/skeleton'
import {Switch} from '@/components/ui/switch'
import {cn} from '@/lib/utils'
import ExpiryPicker from './ExpiryPicker'
import type {
  DefaultPermission,
  Permission,
  WorkerBasic,
  WorkerPermission,
} from '@/src/utils/types'
import {dateInDays, dateKey, formatExpires, isExpired} from './utils'

interface WorkerPermissionsProps {
  worker: WorkerBasic | null
  permissions: Permission[]
  workerPermissions: WorkerPermission[]
  defaultPermissions: DefaultPermission[]
  isLoading: boolean
  onToggle: (permissionId: number, enabled: boolean) => void
  onExpiry: (permissionId: number, expires: string | null) => void
}

interface PermissionRowProps {
  permission: Permission
  worker: WorkerBasic
  grant: WorkerPermission | undefined
  rule: DefaultPermission | undefined
  onToggle: (enabled: boolean) => void
  onExpiry: (expires: string | null) => void
}

function PermissionRow({
  permission,
  worker,
  grant,
  rule,
  onToggle,
  onExpiry,
}: PermissionRowProps) {
  const enabled = !!grant
  const expired = isExpired(grant?.expires)
  const viaRank =
    !!rule &&
    worker.rankWeight !== null &&
    rule.rank_weight <= worker.rankWeight

  const tomorrow = dateInDays(1)

  return (
    <li className="flex flex-col gap-3 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{permission.description}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {permission.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {viaRank && (
              <Badge className="bg-success/15 text-success">По рангу</Badge>
            )}
            {enabled && !expired && (
              <Badge variant="secondary">
                Лично
                {grant?.expires
                  ? ` · до ${formatExpires(grant.expires)}`
                  : ' · бессрочно'}
              </Badge>
            )}
            {enabled && expired && (
              <Badge className="bg-warning/15 text-warning">Срок истёк</Badge>
            )}
            <span className="text-muted-foreground text-xs">
              {rule
                ? `Правило: с ранга «${rule.rank_name}»`
                : 'По рангу: никому'}
            </span>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={checked => onToggle(checked)}
          aria-label={`Выдать лично: ${permission.description}`}
        />
      </div>

      {enabled && (
        <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg p-2.5">
          <span className="text-muted-foreground text-xs">Срок действия</span>
          <ExpiryPicker
            value={dateKey(grant?.expires)}
            min={tomorrow}
            onChange={onExpiry}
          />
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant={grant?.expires ? 'outline' : 'secondary'}
              onClick={() => onExpiry(null)}>
              Бессрочно
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onExpiry(dateInDays(7))}>
              7 дней
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onExpiry(dateInDays(30))}>
              30 дней
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

export default function WorkerPermissions({
  worker,
  permissions,
  workerPermissions,
  defaultPermissions,
  isLoading,
  onToggle,
  onExpiry,
}: WorkerPermissionsProps) {
  const [query, setQuery] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)

  const grants = useMemo(
    () => new Map(workerPermissions.map(grant => [grant.permission_id, grant])),
    [workerPermissions],
  )
  const rules = useMemo(
    () => new Map(defaultPermissions.map(rule => [rule.permission_id, rule])),
    [defaultPermissions],
  )

  const isActive = (permission: Permission) => {
    const grant = grants.get(permission.id)
    const rule = rules.get(permission.id)
    const viaRank =
      !!rule &&
      !!worker &&
      worker.rankWeight !== null &&
      rule.rank_weight <= worker.rankWeight

    return viaRank || (!!grant && !isExpired(grant.expires))
  }

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()

    return permissions.filter(
      permission =>
        (!text ||
          permission.description.toLowerCase().includes(text) ||
          permission.name.toLowerCase().includes(text)) &&
        (!onlyActive || isActive(permission)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, query, onlyActive, grants, rules, worker])

  if (!worker) {
    return (
      <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3">
        <Shield className="size-12 opacity-40" />
        <p className="text-sm">Выберите сотрудника</p>
      </div>
    )
  }

  const activeCount = permissions.filter(isActive).length
  const personalCount = workerPermissions.filter(
    grant => !isExpired(grant.expires),
  ).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarImage src={worker.photoUrl || ''} />
          <AvatarFallback>{worker.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{worker.name}</p>
          <p className="text-muted-foreground text-sm">
            {worker.rank ?? 'Без ранга'}
          </p>
        </div>
        {!isLoading && (
          <div className="text-right text-xs">
            <p className="text-foreground text-sm font-medium tabular-nums">
              {activeCount} из {permissions.length}
            </p>
            <p className="text-muted-foreground">
              лично: <span className="tabular-nums">{personalCount}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Найти право"
            aria-label="Поиск права"
            className="h-9 pl-8"
          />
        </div>
        <Button
          variant={onlyActive ? 'default' : 'outline'}
          className="h-9"
          aria-pressed={onlyActive}
          onClick={() => setOnlyActive(prev => !prev)}>
          Только активные
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({length: 5}, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className={cn('flex flex-col divide-y')}>
          {visible.map(permission => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              worker={worker}
              grant={grants.get(permission.id)}
              rule={rules.get(permission.id)}
              onToggle={enabled => onToggle(permission.id, enabled)}
              onExpiry={expires => onExpiry(permission.id, expires)}
            />
          ))}
          {visible.length === 0 && (
            <li className="text-muted-foreground py-8 text-center text-sm">
              Ничего не найдено
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
