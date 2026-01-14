import {Card, Separator} from '@heroui/react-beta'
import {DateTime} from 'luxon'

export default function PaymentData({data}: {data: any}) {
  return (
    <Card className="bg-content2">
      <Card.Header>Внешняя выплата</Card.Header>
      <Separator className="bg-content3" />
      <Card.Content className="flex flex-col gap-2">
        <div className="flex gap-2">
          <p>Тип:</p>
          {data.name}
        </div>
        <Separator className="bg-content3" />
        <div className="flex gap-2">
          <p>Сумма:</p>
          {data.value}
        </div>
        <Separator className="bg-content3" />
        <div className="flex gap-2">
          <p>Дата:</p>
          {DateTime.fromISO(data.date).toFormat('dd.MM.yyyy')}
        </div>
        <Separator className="bg-content3" />
        <div className="flex gap-2">
          <p>Комментарий:</p>
          {data.comment}
        </div>
      </Card.Content>
    </Card>
  )
}
