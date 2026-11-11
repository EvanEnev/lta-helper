export type PushState = 'unsupported' | 'denied' | 'off' | 'on'

const ENDPOINT = '/api/notifications/subscribe'

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)

  return Uint8Array.from(raw, char => char.charCodeAt(0))
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.ready

  return registration.pushManager.getSubscription()
}

const save = (subscription: PushSubscription) =>
  fetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({sub: subscription.toJSON()}),
  })

export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'

  const subscription = await currentSubscription()

  return subscription && Notification.permission === 'granted' ? 'on' : 'off'
}

export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()

  if (permission !== 'granted')
    return permission === 'denied' ? 'denied' : 'off'

  const registration = await navigator.serviceWorker.ready
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    }))

  const response = await save(subscription)

  if (!response.ok) {
    await subscription.unsubscribe()

    return 'off'
  }

  return 'on'
}

export async function disablePush() {
  if (!pushSupported()) return

  const subscription = await currentSubscription()

  if (!subscription) return

  await fetch(ENDPOINT, {
    method: 'DELETE',
    body: JSON.stringify({endpoint: subscription.endpoint}),
  }).catch(() => {})

  await subscription.unsubscribe()
}

export async function syncPush() {
  if (!pushSupported() || Notification.permission !== 'granted') return

  const subscription = await currentSubscription()

  if (subscription) await save(subscription).catch(() => {})
}
