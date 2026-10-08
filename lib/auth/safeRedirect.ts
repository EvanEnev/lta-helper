export default function safeRedirect(value?: string | null) {
  if (!value) return '/'

  const path = value.startsWith('/') ? value : `/${value}`

  if (path.startsWith('//') || path.includes('\\') || /[\r\n]/.test(path)) {
    return '/'
  }

  if (path === '/login' || path === '/register') return '/'

  return path
}
