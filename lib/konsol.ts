import logger from '@/Logger'

// Konsol.HRM API: https://docs.konsol.ru/articles/konsol-hrm-api/vvedenie
export const KONSOL_URL = 'https://api.konsol.ru'

interface KonsolResponse<T> {
  ok: boolean
  status: number
  headers: Headers
  data: T | null
}

export async function konsolFetch<T = unknown>(
  path: string,
  init: {method?: 'GET' | 'POST'; body?: unknown} = {},
): Promise<KonsolResponse<T>> {
  const res = await fetch(`${KONSOL_URL}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${process.env.KONSOL_TOKEN}`,
      Accept: 'application/json',
      ...(init.body ? {'Content-Type': 'application/json'} : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })

  let data: T | null = null
  try {
    data = (await res.json()) as T
  } catch {
    // пустое или не-JSON тело
  }

  const log = {
    method: init.method || 'GET',
    url: `${KONSOL_URL}${path}`,
    status: res.status,
    request: init.body,
    response: data,
    tokenLength: process.env.KONSOL_TOKEN?.length ?? 0,
  }

  if (res.ok) logger.info('konsol', {data: log})
  else logger.error('konsol', {data: log})

  return {ok: res.ok, status: res.status, headers: res.headers, data}
}

export function konsolErrorMessage(
  res: KonsolResponse<unknown>,
  fallback: string,
): string {
  const data = res.data as {error?: string; errors?: unknown[]} | null

  const details = data?.errors?.length
    ? data.errors.join('; ')
    : data?.error || ''

  return `${fallback} (HTTP ${res.status})${details ? `: ${details}` : ''}`
}

// Konsol ищет исполнителя по телефону в формате +70000000000
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`

  return `+${digits}`
}
