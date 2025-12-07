import {useRef, useCallback} from 'react'

type Point = {x: number; y: number}

export function useLongPress(
  callback: () => void,
  ms = 500,
  moveThreshold = 10,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPoint = useRef<Point | null>(null)

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startPoint.current = null
  }

  const onStart = useCallback(
    (e: any) => {
      const touch = e.touches?.[0] ?? e
      startPoint.current = {x: touch.clientX, y: touch.clientY}

      timerRef.current = setTimeout(() => {
        callback()
        clear()
      }, ms)
    },
    [callback, ms],
  )

  const onMove = useCallback(
    (e: any) => {
      if (!startPoint.current) return

      const touch = e.touches?.[0] ?? e
      const dx = Math.abs(touch.clientX - startPoint.current.x)
      const dy = Math.abs(touch.clientY - startPoint.current.y)

      if (dx + dy > moveThreshold) {
        clear()
      }
    },
    [moveThreshold],
  )

  return {
    onMouseDown: onStart,
    onTouchStart: onStart,
    onMouseMove: onMove,
    onTouchMove: onMove,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onTouchCancel: clear,
  }
}
