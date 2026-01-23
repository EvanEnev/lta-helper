import {Card, Separator} from '@heroui/react-beta'

export default function PaymentData({data}: {data: any}) {
  // @ts-ignore
  return data.map((data, index) => (
    <Card className="bg-content2" key={index}>
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
          <p>Комментарий:</p>
          {data.comment}
        </div>
      </Card.Content>
    </Card>
  ))
}
