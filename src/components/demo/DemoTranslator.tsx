'use client'

import {useEffect} from 'react'
import {exact, parts, templates} from '@/src/utils/demo/dictionary'

const CYRILLIC = /[А-Яа-яЁё]/
const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt']

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const rules = Object.entries(parts)
  .sort((a, b) => b[0].length - a[0].length)
  .map(
    ([ru, en]) =>
      [
        new RegExp(`(?<![А-Яа-яЁё])${escape(ru)}(?![А-Яа-яЁё])`, 'g'),
        en,
      ] as const,
  )

const cache = new Map<string, string>()

function translate(text: string) {
  if (!CYRILLIC.test(text)) return text

  const cached = cache.get(text)
  if (cached !== undefined) return cached

  const trimmed = text.trim()
  let result = text

  if (exact[trimmed]) {
    result = text.replace(trimmed, exact[trimmed])
  } else {
    for (const [pattern, replacement] of templates) {
      result = result.replace(pattern, replacement as string)
    }
    for (const [pattern, replacement] of rules) {
      if (!CYRILLIC.test(result)) break
      result = result.replace(pattern, replacement)
    }
  }

  cache.set(text, result)

  return result
}

function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.nodeValue ?? ''
    const next = translate(value)

    if (next !== value) node.nodeValue = next

    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return

  const element = node as Element

  if (['SCRIPT', 'STYLE'].includes(element.tagName)) return

  for (const name of ATTRIBUTES) {
    const value = element.getAttribute(name)

    if (value && CYRILLIC.test(value)) {
      element.setAttribute(name, translate(value))
    }
  }

  node.childNodes.forEach(translateNode)
}

export default function DemoTranslator() {
  useEffect(() => {
    document.documentElement.lang = 'en'

    const run = () => {
      translateNode(document.body)
      document.title = translate(document.title)
    }

    const observer = new MutationObserver(mutations => {
      observer.disconnect()

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(translateNode)
        } else {
          translateNode(mutation.target)
        }
      }

      document.title = translate(document.title)
      observe()
    })

    const observe = () =>
      observer.observe(document, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES,
      })

    // shortcut: ждём завершения гидратации по таймеру, чтобы не ломать её правкой DOM
    const timer = setTimeout(() => {
      run()
      observe()
    }, 300)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return null
}
