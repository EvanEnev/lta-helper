import {Card, Separator} from '@heroui/react'

export default function PaymentData({
  data,
  location,
}: {
  data: any
  location: boolean
}) {
  // @ts-ignore
  return data.map((data, index) => {
    if (!location && data.name === 'Самозанятый') return null

    return (
      <Card className="bg-surface" key={index}>
        <Card.Header>Внешняя выплата</Card.Header>
        <Separator className="bg-default" />
        <Card.Content className="flex flex-col gap-2">
          <div className="flex gap-2">
            <p>Тип:</p>
            {data.name}
          </div>
          <Separator className="bg-default" />
          <div className="flex gap-2">
            <p>Сумма:</p>
            {data.value}
          </div>
          <Separator className="bg-default" />
          <div className="flex gap-2">
            <p>Комментарий:</p>
            {data.comment}
          </div>
        </Card.Content>
      </Card>
    )
  })
}
