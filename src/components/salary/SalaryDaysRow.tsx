import {LTWorkType} from '@/src/utils/types'

interface SalaryDaysRowProps {
  dates: string[]
  today: string | null
  workTypes: LTWorkType[]
}

export default function SalaryDaysRow({
  dates,
  today,
  workTypes,
}: SalaryDaysRowProps) {
  return (
    <>
      <div className="border-content1-foreground/20 h-full w-full rounded-2xl border-2 bg-black" />
      {dates.map(date => (
        <div
          className={`${today && today === date ? 'border-success' : 'border-content1-foreground/20'} bg-content1 border-content1-foreground/20 sticky top-26 z-150 w-full rounded-2xl border-2 p-2 text-center`}
          key={date}>
          {date}
        </div>
      ))}
      {/*{workTypes.map(type => (*/}
      {/*  <div*/}
      {/*    key={type.id}*/}
      {/*    className="border-content1-foreground/20 h-full w-full rounded-2xl border-2 bg-black"*/}
      {/*  />*/}
      {/*))}*/}
    </>
  )
}
