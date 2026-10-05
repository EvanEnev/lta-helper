import {Loader2, Send} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

interface SendButtonProps {
  count: number
  isPending: boolean
  onClick: () => void
  className?: string
}

export default function SendButton({
  count,
  isPending,
  onClick,
  className,
}: SendButtonProps) {
  return (
    <Button
      size="lg"
      disabled={!count || isPending}
      onClick={onClick}
      className={cn('h-11 w-full text-base', className)}>
      {isPending ? <Loader2 className="animate-spin" /> : <Send />}
      Отправить{count > 0 && ` (${count})`}
    </Button>
  )
}
