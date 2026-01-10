'use server'

import webpush from 'web-push'
import type {PushSubscription} from 'web-push'

webpush.setVapidDetails(
  'mailto:evanenev@duck.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

interface NotificationData {
  title: string
  message: string
  icon: string
}

export async function sendNotification(
  subs: PushSubscription[],
  {title, message: body, icon = '/icon.png'}: NotificationData,
): Promise<void> {
  if (!subs.length) {
    return
  }

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title,
          body,
          icon,
        }),
      )
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }
}
