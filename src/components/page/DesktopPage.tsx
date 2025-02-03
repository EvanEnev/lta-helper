import convertTZ from '@/lib/convertTZ'
import daysState from '@/src/state/daysState'
import getRankIcon from '@/src/utils/page/getRankIcon'
import {Avatar, Button, Card, CardBody, CardHeader} from '@nextui-org/react'
import {useSession} from 'next-auth/react'
import Link from 'next/link'
import {useRecoilValue} from 'recoil'
import {CalendarMinimalistic, ClockCircle, MapPoint} from 'solar-icon-set'

export default function DesktopPage() {
  const {data: session} = useSession()
  const days = useRecoilValue(daysState)

  const currentDate = convertTZ(new Date(), 'Europe/Moscow')

  const getDatesDiff = (dateString: string) => {
    const dateParts = dateString.split('.')
    const date = new Date(
      new Date().getFullYear(),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[0]),
    )

    // @ts-ignore
    const diffTime = date - currentDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <main className="w-screen h-screen">
      <div className="flex justify-between h-fit p-4 items-center">
        <div className="flex gap-4 items-center">
          <Button as={Link} href="/schedule" variant="ghost" size="lg">
            Заполнить график работы
          </Button>
          {session?.user.permission_level === 4 ? (
            <Button href="/admin" as={Link} variant="ghost" size="lg">
              Заполнить график персонала
            </Button>
          ) : (
            ''
          )}
        </div>
        <div className="flex gap-4 items-center text-3xl h-fit">
          <Avatar src={session?.user.image} size="lg" />
          {session?.user.name}
        </div>
      </div>
      <div className="flex justify-between gap-4 p-4">
        <div className="text-3xl flex items-center gap-4 h-fit">
          {getRankIcon(session?.user.rank)} {session?.user.rank}
        </div>
        <Card isBlurred className="w-full max-w-fit">
          <CardHeader className="text-3xl">Ближайшие смены</CardHeader>
          <CardBody className="flex gap-4 overflow-auto flex-row">
            {days
              .filter(
                day =>
                  getDatesDiff(day.date) <= 5 &&
                  getDatesDiff(day.date) >= 0 &&
                  day.location,
              )
              .map((day, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-4 flex-col border-1 rounded-xl p-4">
                    <span className="items-center flex gap-1">
                      <CalendarMinimalistic />
                      {day.date}
                    </span>
                    <span className="items-center flex gap-1">
                      <MapPoint />
                      {day.location}
                    </span>
                    <span className="items-center flex gap-1">
                      <ClockCircle />
                      {day.locationData?.find(data => data.self)?.data?.time}
                    </span>
                  </div>
                )
              })}
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
