import {Divider} from '@heroui/react'
import {Fragment, useEffect, useState} from 'react'

interface PayrollsDetailsHeaderProps {
  canIssue: boolean
}

export default function PayrollsDetailsHeader({
  canIssue,
}: PayrollsDetailsHeaderProps) {
  const [headerValues, setHeaderValues] = useState<string[]>([
    'Сотрудник',
    'Сумма',
    'Бонусы',
    'Внешняя выплата',
    'Локация',
    'Остаток',
  ])

  useEffect(() => {
    if (canIssue) {
      const headerValuesToAdd = ['К выдаче', 'Заберёт', 'Выдано', 'Выдача']

      setHeaderValues(prev =>
        headerValuesToAdd.every(v => prev.includes(v))
          ? prev
          : [...prev, ...headerValuesToAdd],
      )
    }
  }, [canIssue])

  return (
    <div className="bg-content2 sticky top-0 z-1000 flex items-center gap-2 rounded-xl p-2">
      {headerValues.map((header, index) => (
        <Fragment key={index}>
          <p className="flex-1 text-center">{header}</p>
          <Divider
            orientation="vertical"
            hidden={index === headerValues.length - 1}
          />
        </Fragment>
      ))}
    </div>
  )
}
