import { useEffect } from 'react'

export function useWakeLock(active?: boolean) {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    let isCancelled = false

    const requestWakeLock = async () => {
      if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return
      }

      try {
        if (document.visibilityState === 'visible') {
          const lock = await navigator.wakeLock.request('screen')
          if (isCancelled) {
            await lock.release().catch(() => {})
          } else {
            wakeLock = lock
            console.debug('[WakeLock]: Screen wake lock acquired successfully')
          }
        }
      } catch (err: unknown) {
        console.warn('[WakeLock]: Failed to acquire wake lock:', err)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        requestWakeLock()
      }
    }

    if (active) {
      requestWakeLock()
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      isCancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLock) {
        wakeLock.release().catch(() => {})
        wakeLock = null
      }
    }
  }, [active])
}
