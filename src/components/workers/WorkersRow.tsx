import {LTWorker, LTWorkerData} from '@/src/utils/types'
import {Avatar, Button, Separator} from '@heroui/react-beta'
import RankIcon from '@/src/components/global/RankIcon'
import {ArrowDown, ArrowUp, Clipboard, Phone} from 'solar-icon-set'
import formatPhone from '@/lib/functions/formatPhone'
import {Icon} from '@iconify/react'
import {Activity} from 'react'

interface WorkersRowProps {
  worker: LTWorker
  data: LTWorkerData
  maxRankId: number
  minRankId: number
  canEdit: boolean
}

export default function WorkersRow({
  worker,
  data,
  maxRankId,
  minRankId,
  canEdit,
}: WorkersRowProps) {
  return (
    <div className="bg-content1 z-1000 flex items-center gap-2 rounded-2xl px-4 py-2">
      <div className="flex w-20 flex-col gap-2 wrap-anywhere">
        <Avatar>
          <Avatar.Image src={data.photoUrl || ''} />
          <Avatar.Fallback>{data.name.slice(0, 2)}</Avatar.Fallback>
        </Avatar>
        <p>{data.name}</p>
      </div>
      <Separator orientation="vertical" className="bg-content1-foreground/50" />
      <div
        className={`flex ${canEdit ? 'w-60 justify-between' : 'w-25 justify-center'} items-center gap-2`}>
        <div className="flex flex-col items-center gap-2">
          <RankIcon rank={data.rank.name} />
          <p>{data.rank.name}</p>
        </div>
        <Activity mode={canEdit ? 'visible' : 'hidden'}>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              variant="secondary"
              isDisabled={data.rank.id === maxRankId}>
              <ArrowUp size={24} />
              Повысить
            </Button>
            <Button
              className="w-full"
              variant="danger-soft"
              isDisabled={data.rank.id === minRankId}>
              <ArrowDown size={24} />
              Понизить
            </Button>
          </div>
        </Activity>
      </div>
      <Separator orientation="vertical" className="bg-content1-foreground/50" />
      <div className="w-40 wrap-break-word">
        <p>
          {data.lastName} {data.firstName} {data.middleName}
        </p>
      </div>
      <Separator orientation="vertical" className="bg-content1-foreground/50" />
      <div className="flex w-60 flex-col flex-wrap gap-2">
        <div className="border-content1-foreground/50 flex items-center gap-2 rounded-2xl border-2 p-1">
          <Phone iconStyle="Bold" />
          <a href={`tel:${data.phoneNumber}`}>
            {formatPhone(data.phoneNumber || '')}
          </a>
          <Button
            variant="ghost"
            isIconOnly
            onPress={() =>
              navigator.clipboard.writeText(data.phoneNumber || '')
            }>
            <Clipboard iconStyle="Bold" />
          </Button>
        </div>
        <a
          className="transition-background border-primary hover:bg-primary flex items-center gap-2 rounded-2xl border-2 p-1"
          target="_blank"
          href={`tg://user?id=${data.telegramId}`}>
          <Icon icon="ic:baseline-telegram" width={24} height={24} />
          Открыть в Telegram
        </a>
      </div>
    </div>
  )
}
