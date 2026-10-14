import webpush from 'web-push'
import db from '../database'

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

interface SendResult {
  sent: number
  removed: number
  failed: number
}

let configured = false

function configure() {
  if (configured) return true

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) return false

  const subject = [process.env.VAPID_SUBJECT, process.env.BETTER_AUTH_URL].find(
    value => value?.startsWith('https://') || value?.startsWith('mailto:'),
  )

  webpush.setVapidDetails(
    subject || 'mailto:admin@localhost',
    publicKey,
    privateKey,
  )
  configured = true

  return true
}

const CHUNK = 20

export async function sendToWorkers(
  workerIds: number[],
  payload: PushPayload,
): Promise<SendResult> {
  const result: SendResult = {sent: 0, removed: 0, failed: 0}

  if (!workerIds.length || !configure()) return result

  const subscriptions = await db.query(
    'select id, data from relations.workers_notifications where worker_id = any($1::int[])',
    [workerIds],
  )

  const message = JSON.stringify(payload)
  const dead: number[] = []

  for (let i = 0; i < subscriptions.rows.length; i += CHUNK) {
    const chunk = subscriptions.rows.slice(i, i + CHUNK)

    await Promise.all(
      chunk.map(async ({id, data}) => {
        try {
          await webpush.sendNotification(data, message, {
            TTL: 6 * 60 * 60,
            urgency: 'normal',
          })
          result.sent += 1
        } catch (error) {
          const status = (error as {statusCode?: number}).statusCode

          if (status === 404 || status === 410) {
            dead.push(id)
          } else {
            result.failed += 1
          }
        }
      }),
    )
  }

  if (dead.length) {
    await db.query(
      'delete from relations.workers_notifications where id = any($1::int[])',
      [dead],
    )
    result.removed = dead.length
  }

  return result
}
