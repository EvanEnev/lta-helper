import {useCallback, useRef} from 'react'

export function useLongPress(callback: () => void, ms = 500) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      callback()
      timerRef.current = null
    }, ms)
  }, [callback, ms])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchEnd: stop,
  }
}
