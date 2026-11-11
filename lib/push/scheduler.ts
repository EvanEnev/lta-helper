import {DateTime} from 'luxon'
import db from '../database'
import shiftReminder from './jobs/shiftReminder'

const LOCK_ID = 74_001
const TICK_MS = 60_000

const jobs: {name: string; run: (now: DateTime) => Promise<void>}[] = [
  {name: 'shiftReminder', run: shiftReminder},
]

let timer: NodeJS.Timeout | null = null
let running = false

async function tick() {
  if (running) return
  running = true

  const client = await db.connect()

  try {
    const lock = await client.query('select pg_try_advisory_lock($1) as ok', [
      LOCK_ID,
    ])

    if (!lock.rows[0].ok) return

    try {
      const now = DateTime.now()

      for (const job of jobs) {
        try {
          await job.run(now)
        } catch (error) {
          console.error(`[Push] ${job.name}`, error)
        }
      }
    } finally {
      await client.query('select pg_advisory_unlock($1)', [LOCK_ID])
    }
  } finally {
    client.release()
    running = false
  }
}

export function startScheduler() {
  if (timer) return

  timer = setInterval(() => {
    tick().catch(error => console.error('[Push] tick', error))
  }, TICK_MS)
  timer.unref()

  console.log('[Push] scheduler started')
}

export function stopScheduler() {
  if (timer) clearInterval(timer)
  timer = null
}
