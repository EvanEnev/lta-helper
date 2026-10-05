'use client'

import {useState} from 'react'
import {Icon} from '@iconify/react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ListChecks,
  Phone,
  UserCheck,
} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Progress} from '@/components/ui/progress'
import {Separator} from '@/components/ui/separator'
import RankIcon from '@/src/components/global/RankIcon'
import formatPhone from '@/lib/functions/formatPhone'
import {getRankProgress} from '@/lib/functions/rankProgress'
import {cn} from '@/lib/utils'
import type {LTWorkerData} from '@/src/utils/types'
import {fullName} from './utils'

interface WorkerCardProps {
  data: LTWorkerData
  canEdit: boolean
  canApprove: boolean
  isTopRank: boolean
  isBottomRank: boolean
  onOpenRequirements: () => void
  onApprove: () => void
  onRankChange: (type: 'promote' | 'demote') => Promise<void>
}

export default function WorkerCard({
  data,
  canEdit,
  canApprove,
  isTopRank,
  isBottomRank,
  onOpenRequirements,
  onApprove,
  onRankChange,
}: WorkerCardProps) {
  const [copied, setCopied] = useState(false)
  const [isBusy, setBusy] = useState(false)

  const {done, completed, total} = getRankProgress(data.rankData)
  const name = fullName(data)

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(data.phoneNumber || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const changeRank = async (type: 'promote' | 'demote') => {
    setBusy(true)
    try {
      await onRankChange(type)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      className={cn(
        !data.isApproved && 'ring-warning/50',
        data.isFormer && 'opacity-70',
      )}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={data.photoUrl || ''} />
            <AvatarFallback>{data.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">{data.name}</p>
            <p className="text-muted-foreground truncate text-sm">
              {name || 'ФИО не указано'}
            </p>
          </div>
          {!data.isApproved && (
            <Badge className="bg-warning/15 text-warning">Не подтверждён</Badge>
          )}
          {data.isFormer && <Badge variant="secondary">Бывший</Badge>}
        </div>

        <div className="flex items-center gap-3">
          <RankIcon rank={data.rank.name} className="h-10 w-auto shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium">{data.rank.name}</span>
              {total > 0 && (
                <span
                  className={cn(
                    'tabular-nums',
                    done ? 'text-success' : 'text-muted-foreground',
                  )}>
                  {completed} / {total}
                </span>
              )}
            </div>
            {total > 0 && (
              <Progress
                value={completed}
                max={total}
                className={cn(
                  done && '[&_[data-slot=progress-indicator]]:bg-success',
                )}
              />
            )}
          </div>
        </div>

        {(data.quests.length > 0 || data.generations.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {data.generations.map(generation => (
              <Badge key={`g${generation.id}`} variant="secondary">
                {generation.name}
              </Badge>
            ))}
            {data.quests.map(quest => (
              <Badge key={`q${quest.id}`} variant="outline">
                {quest.name}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          {data.phoneNumber && (
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                className="rounded-r-none"
                nativeButton={false}
                render={<a href={`tel:${data.phoneNumber}`} />}>
                <Phone />
                {formatPhone(data.phoneNumber)}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-7 rounded-l-none border-l-0"
                aria-label="Скопировать номер"
                onClick={copyPhone}>
                {copied ? <Check className="text-success" /> : <Copy />}
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={`tg://user?id=${data.telegramId}`}
                target="_blank"
                rel="noreferrer"
              />
            }>
            <Icon icon="ic:baseline-telegram" width={16} height={16} />
            Telegram
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {total > 0 && (
            <Button variant="secondary" size="sm" onClick={onOpenRequirements}>
              <ListChecks />
              Требования
            </Button>
          )}
          {canEdit && (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={isTopRank || isBusy}
                onClick={() => changeRank('promote')}>
                <ArrowUp />
                Повысить
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isBottomRank || isBusy}
                onClick={() => changeRank('demote')}>
                <ArrowDown />
                Понизить
              </Button>
            </>
          )}
          {canApprove && (
            <Button size="sm" onClick={onApprove}>
              <UserCheck />
              Подтвердить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
