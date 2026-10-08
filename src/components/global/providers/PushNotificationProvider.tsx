import {ReactNode, useEffect} from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    ),
  })

  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify({sub: JSON.parse(JSON.stringify(sub))}),
  })
}

async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })

  const sub = await registration.pushManager.getSubscription()

  if (!sub) await subscribeToPush()
}

export default function PushNotificationProvider({
  children,
}: {
  children: ReactNode | ReactNode[]
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker().catch(() => {})
    }
  }, [])

  return children
}
