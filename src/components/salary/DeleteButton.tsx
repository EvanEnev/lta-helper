import {Button} from '@heroui/react'
import {useState} from 'react'
import {CheckCircle, MinusCircle, TrashBinTrash} from 'solar-icon-set'

interface DeleteButtonProps {
  callback: () => void
  className?: string
}

export default function DeleteButton({
  callback,
  className = '',
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  return (
    <div className={className}>
      {showConfirm ? (
        <div className={'grid-rows-auto grid grid-flow-row grid-cols-2 gap-2'}>
          <p className="col-span-2 h-fit font-bold">Точно удалить?</p>
          <Button
            onPress={() => setShowConfirm(false)}
            className="w-full"
            color="default"
            variant="faded">
            <MinusCircle size={20} />
            <p>Нет</p>
          </Button>
          <Button
            className="w-full"
            onPress={() => callback()}
            color="success"
            variant="ghost">
            <CheckCircle size={20} />
            <p>Да</p>
          </Button>
        </div>
      ) : (
        <Button
          color="danger"
          className="w-full"
          variant="faded"
          onPress={() => setShowConfirm(true)}
          startContent={<TrashBinTrash />}>
          Удалить смену
        </Button>
      )}
    </div>
  )
}
