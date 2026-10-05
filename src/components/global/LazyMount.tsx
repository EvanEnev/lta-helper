'use client'

import {useEffect, useRef, useState, type ReactNode} from 'react'

interface LazyMountProps {
  children: ReactNode
  minHeight: number | string // высота заглушки, пока содержимое не показано
  root?: Element | null // прокручиваемый контейнер (если не окно)
  rootMargin?: string
  className?: string
}

// Содержимое строки создаётся, когда она приближается к области просмотра.
// В таблицах на сотни строк это убирает основную стоимость первого рендера
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
