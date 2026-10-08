if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registerServiceWorker = async () => {
      const registration =
        await navigator.serviceWorker.register('/service-worker.js')
      const newServiceWorkerWaiting =
        registration.waiting && registration.active

      if (newServiceWorkerWaiting) {
        console.log('new sw waiting')
        window.swUpdate = true
        await SWHelper.skipWaiting()
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing

        if (installingWorker) {
          console.log('installing sw found')
          installingWorker.addEventListener('statechange', async () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('new sw installed')

              window.swUpdate = true

              setTimeout(async () => {
                await SWHelper.prepareCachesForUpdate()
              }, 500)
            }
          })
        }
      })
    }

    registerServiceWorker()

    const SWHelper = {
      async getWaitingWorker() {
        const registrations = await navigator.serviceWorker.getRegistrations()
        const registrationWithWaiting = registrations.find(reg => reg.waiting)
        return registrationWithWaiting?.waiting
      },

      async skipWaiting() {
        return (await SWHelper.getWaitingWorker())?.postMessage({
          type: 'SKIP_WAITING',
        })
      },

      async prepareCachesForUpdate() {
        return (await SWHelper.getWaitingWorker())?.postMessage({
          type: 'PREPARE_CACHES_FOR_UPDATE',
        })
      },
    }

    const updateServiceWorkerIfNeeded = async e => {
      if (window.swUpdate) {
        window.swUpdate = false
        await SWHelper.skipWaiting()
      }
    }

    const retryRequests = () =>
      navigator.serviceWorker.controller.postMessage({type: 'retry-requests'})

    window.addEventListener('beforeunload', updateServiceWorkerIfNeeded)
    window.addEventListener('pagehide', updateServiceWorkerIfNeeded)

    window.addEventListener('online', retryRequests)

    retryRequests()
  })
}
