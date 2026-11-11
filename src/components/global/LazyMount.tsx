'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'

interface LazyMountProps {
  children: ReactNode
  minHeight: number | string
  root?: Element | null
  rootMargin?: string
  className?: string
}

export default function LazyMount({
  children,
  minHeight,
  root = null,
  rootMargin = '600px',
  className,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (visible || !element) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {root, rootMargin},
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [visible, root, rootMargin])

  return (
    <div
      ref={ref}
      className={className}
      style={visible ? undefined : {minHeight}}>
      {visible ? children : null}
    </div>
  )
}
