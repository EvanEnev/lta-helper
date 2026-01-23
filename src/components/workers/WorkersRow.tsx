import {LTWorker, LTWorkerData} from '@/src/utils/types'
import {
  Avatar,
  Button,
  Separator,
  Popover,
  Checkbox,
  NumberField,
} from '@heroui/react-beta'
import RankIcon from '@/src/components/global/RankIcon'
import {ArrowDown, ArrowUp, Clipboard, Phone} from 'solar-icon-set'
import formatPhone from '@/lib/functions/formatPhone'
import {Icon} from '@iconify/react'
import {Activity, Fragment} from 'react'
import {Progress} from '@heroui/react'

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
      <Separator orientation="vertical" className="bg-content1-foreground/50" />
      <div className="flex gap-2">
        <Progress
          showValueLabel
          value={
            data.rankData.length
              ? data.rankData.reduce(
                  (acc, cur) => (cur.done ? acc + 1 : acc),
                  0,
                )
              : 0
          }
          maxValue={data.rankData.length}
          className="w-20 max-w-20"
        />
        <Popover>
          <Button variant="outline">Подробнее</Button>
          <Popover.Content placement="right">
            <Popover.Arrow />
            <Popover.Dialog className="flex flex-col justify-center gap-2">
              {data.rankData.map((req, index) => (
                <Fragment key={req.id}>
                  <div className="flex items-center gap-2">
                    {req.type === 'check' && (
                      <Checkbox
                        isReadOnly
                        isSelected={req.done}
                        variant="secondary">
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox>
                    )}
                    {req.type === 'number' && (
                      <NumberField
                        defaultValue={req.value || 0}
                        variant="secondary"
                        maxValue={req.limit!}
                        minValue={0}>
                        <NumberField.Group>
                          <NumberField.DecrementButton />
                          <NumberField.Input className="w-12" placeholder="0" />
                          <NumberField.IncrementButton />
                        </NumberField.Group>
                      </NumberField>
                    )}
                    <p>{req.name}</p>
                  </div>
                  {index !== data.rankData.length - 1 && (
                    <Separator className="bg-content1-foreground/50" />
                  )}
                </Fragment>
              ))}
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  )
}
