import { useEffect } from "react"

export 
function useWakeLock(active?: boolean) {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    if (active && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLock = lock
        })
        .catch(() => {})
    }

    return () => {
      wakeLock?.release().catch(() => {})
    }
  }, [active])
}

