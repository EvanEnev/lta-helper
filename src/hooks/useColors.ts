'use client'

import {useEffect, useRef, useState} from 'react'

export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'default'
  | 'accent'

export type SemanticColors = Record<SemanticColor, string>

const KEYS: SemanticColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'default',
  'accent',
]

function normalizeColor(raw: string): string {
  return raw.includes('(') ? raw : `hsl(${raw})`
}

function readColors(): SemanticColors {
  const styles = getComputedStyle(document.documentElement)
  const result = {} as SemanticColors

  for (const key of KEYS) {
    const raw = styles.getPropertyValue(`--color-${key}`).trim()
    if (!raw) continue

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = normalizeColor(raw)

    result[key] = ctx.fillStyle
  }

  return result
}

function isEqual(a: SemanticColors | null, b: SemanticColors) {
  if (!a) return false
  return KEYS.every(k => a[k] === b[k])
}

export default function useColors() {
  const [colors, setColors] = useState<SemanticColors | null>(null)
  const colorsRef = useRef<SemanticColors | null>(null)

  useEffect(() => {
    let ticking = false

    const update = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const next = readColors()

        if (!isEqual(colorsRef.current, next)) {
          colorsRef.current = next
          setColors(next)
        }

        ticking = false
      })
    }

    update()

    const observer = new MutationObserver(update)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}
