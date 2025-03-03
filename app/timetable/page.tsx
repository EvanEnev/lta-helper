'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import {Calendar} from 'solar-icon-set'
import {useSession} from 'next-auth/react'
import {Avatar} from '@nextui-org/react'
import MobileTimetable from '@/src/components/timetable/MobileTimetable'
import DesktopTimetable from '@/src/components/timetable/DesktopTimetable'
import {useEffect, useState} from 'react'

export default function Timetable() {
  const isMobile = useIsMobile()
  const {data: session} = useSession()
  const [timetableData, setTimetableData] = useState()
  const [defaultDays, setDays] = useState<Date[]>()

  useEffect(() => {
    fetch('/api/getTimetable').then(async data => {
      const json = await data.json()
      setTimetableData(json.workers)
    })

    fetch('/api/getDefaultDays').then(async data => {
      const json = await data.json()
      setDays(json.days.map((day: string) => new Date(day)))
    })
  }, [])

  return (
    <main className="max-w-screen m-0 flex min-h-screen w-screen flex-col items-center justify-start gap-4">
      <div className="flex justify-center gap-4">
        <Calendar size={48} />
        <span className="word-wrap inline-block w-fit text-5xl font-bold">
          Расписание
        </span>
      </div>
      <div className="flex items-center gap-2 text-3xl">
        <Avatar src={session?.user.image} />
        {session?.user.name}
      </div>
      {isMobile ? (
        <MobileTimetable />
      ) : (
        <DesktopTimetable data={timetableData} days={defaultDays} />
      )}
    </main>
  )
}
