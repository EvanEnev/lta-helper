import Image from 'next/image'
import {Check} from 'lucide-react'
import {cn} from '@/lib/utils'

const STEPS = ['Вход', 'Данные', 'Подтверждение']

interface AuthShellProps {
  step: 1 | 2 | 3
  title: string
  description: string
  children: React.ReactNode
}

export default function AuthShell({
  step,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
      />

      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/web-app-manifest-192x192.png"
            alt=""
            width={56}
            height={56}
            priority
            className="rounded-2xl"
          />
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            LTA Helper
          </p>
        </div>

        <ol
          className="flex items-center justify-center gap-2"
          aria-label="Шаги">
          {STEPS.map((label, index) => {
            const number = index + 1
            const done = number < step
            const current = number === step

            return (
              <li
                key={label}
                aria-current={current ? 'step' : undefined}
                className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border text-sm font-medium',
                    current &&
                      'bg-primary text-primary-foreground border-primary',
                    done && 'bg-primary/15 text-primary border-primary/40',
                    !current && !done && 'text-muted-foreground',
                  )}>
                  {done ? <Check className="size-4" /> : number}
                </span>
                <span
                  className={cn(
                    'text-sm max-sm:hidden',
                    current ? 'font-medium' : 'text-muted-foreground',
                  )}>
                  {label}
                </span>
                {number < STEPS.length && (
                  <span className="bg-border h-px w-6 sm:w-8" />
                )}
              </li>
            )
          })}
        </ol>

        <section className="bg-card flex flex-col gap-5 rounded-2xl border p-6 shadow-sm sm:p-8">
          <header className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-base">{description}</p>
          </header>
          {children}
        </section>
      </div>
    </main>
  )
}
