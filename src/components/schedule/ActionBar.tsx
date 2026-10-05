import {MessageSquare, X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import SendButton from './SendButton'
import {STATUSES, TONE_CLASSES, type ScheduleDay} from './utils'

interface ActionBarProps {
  days: ScheduleDay[]
  changesCount: number
  isSending: boolean
  onStatus: (value: string) => void
  onComment: () => void
  onClear: () => void
  onSend: () => void
}

const pluralDays = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня'
  return 'дней'
}

// Панель действий над нижней навигацией (только телефон)
export default function ActionBar({
  days,
  changesCount,
  isSending,
  onStatus,
  onComment,
  onClear,
  onSend,
}: ActionBarProps) {
  if (!days.length && !changesCount) return null

  const values = new Set(days.map(day => day.value))
  const shared = values.size === 1 ? days[0].value : null

  const title =
    days.length === 1
      ? days[0].date.setLocale('ru').toFormat('ccc, d MMMM')
      : `Выбрано: ${days.length} ${pluralDays(days.length)}`

  return (
    <div className="bg-popover ring-foreground/10 fixed inset-x-3 bottom-[calc(var(--header-height,4rem)+0.5rem)] z-40 flex flex-col gap-2 rounded-2xl p-3 shadow-lg ring-1 md:hidden">
      {days.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium first-letter:uppercase">
              {title}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Снять выбор"
              onClick={onClear}>
              <X />
            </Button>
          </div>
          <div
            className="grid grid-cols-3 gap-2"
            role="group"
            aria-label="Статус">
            {STATUSES.map(option => (
              <Button
                key={option.value}
                variant="outline"
                size="lg"
                aria-pressed={shared === option.value}
                onClick={() => onStatus(option.value)}
                className={cn(
                  'h-11 gap-1.5 px-2 [&_svg]:size-4',
                  TONE_CLASSES[option.tone].icon,
                  shared === option.value && TONE_CLASSES[option.tone].active,
                )}>
                <option.icon />
                {option.short}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="flex gap-2">
        {days.length > 0 && (
          <Button
            variant="outline"
            size="lg"
            className={cn('h-11', !changesCount && 'flex-1')}
            onClick={onComment}>
            <MessageSquare />
            Комментарий
          </Button>
        )}
        {changesCount > 0 && (
          <SendButton
            count={changesCount}
            isPending={isSending}
            onClick={onSend}
            className="flex-1"
          />
        )}
      </div>
    </div>
  )
}
