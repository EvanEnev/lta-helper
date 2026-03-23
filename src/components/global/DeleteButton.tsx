import {Button} from '@heroui/react'
import {useState} from 'react'
import {Icon} from '@iconify/react'

interface DeleteButtonProps {
  label?: string
  showConfirmLabel?: boolean
  confirmLabel?: string
  callback: () => void
  className?: string
}

export default function DeleteButton({
  callback,
  label = 'Удалить смену',
  showConfirmLabel = true,
  confirmLabel = 'Точно удалить?',
  className = '',
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  return (
    <div className={className}>
      {showConfirm ? (
        <div className={'grid-rows-auto grid grid-flow-row grid-cols-2 gap-2'}>
          {showConfirmLabel && (
            <p className="col-span-2 h-fit font-bold">{confirmLabel}</p>
          )}
          <Button
            onPress={() => setShowConfirm(false)}
            className="w-full"
            variant="primary">
            <Icon icon="solar:minus-circle-linear" width="20" height="20" />
            <p>Нет</p>
          </Button>
          <Button
            className="w-full"
            onPress={() => callback()}
            variant="danger">
            <Icon icon="solar:check-circle-linear" width="20" height="20" />
            <p>Да</p>
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          variant="danger-soft"
          onPress={() => setShowConfirm(true)}>
          <Icon icon="solar:trash-bin-trash-linear" width="24" height="24" />
          {label}
        </Button>
      )}
    </div>
  )
}
