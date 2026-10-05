import type {Socket} from 'socket.io'
import type {Client} from 'pg'
import {getData} from '../auth/getWorkerData'
import checkPermissions from '../functions/checkPermissions'

// Cookie сессии better-auth: <prefix>.session_token = <token>.<подпись>
// (prefix задан в lib/auth.ts, в продакшене добавляется __Secure-).
// Токен - длинный случайный секрет, поэтому проверяем его по таблице сессий
const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?auth\.session_token=([^;]+)/

// Права кэшируются на сокете, чтобы не ходить в БД на каждое событие
const CACHE_MS = 60_000

type SocketWorker = Awaited<ReturnType<typeof getData>>['worker']

interface CachedAuth {
  worker: SocketWorker
  checkedAt: number
}

const getToken = (socket: Socket) => {
  const raw = SESSION_COOKIE.exec(socket.handshake.headers.cookie ?? '')?.[1]
  if (!raw) return null

  try {
    const value = decodeURIComponent(raw)
    const dot = value.lastIndexOf('.')

    return dot === -1 ? value : value.slice(0, dot)
  } catch {
    return null
  }
}

async function loadWorker(socket: Socket, client: Client) {
  const token = getToken(socket)
  if (!token) return null

  const session = await client.query(
    'select "userId" from auth.session where token = $1 and "expiresAt" > now() limit 1',
    [token],
  )
  const userId: string | undefined = session.rows[0]?.userId
  if (!userId) return null

  const {worker} = await getData(userId, userId, false)

  return worker.id ? worker : null
}

// Возвращает сотрудника сокета или null, если сессия недействительна
export async function getSocketWorker(socket: Socket, client: Client) {
  const cached: CachedAuth | undefined = socket.data.auth

  if (cached && Date.now() - cached.checkedAt < CACHE_MS) {
    return cached.worker
  }

  const worker = await loadWorker(socket, client)
  socket.data.auth = worker ? {worker, checkedAt: Date.now()} : undefined

  return worker
}

// Обработчик события, доступный только сотрудникам с нужным правом.
// Ошибки ловим здесь: необработанное отклонение промиса роняет процесс
export function guarded<T>(
  socket: Socket,
  client: Client,
  permissions: string[],
  handler: (data: T) => Promise<unknown>,
) {
  return async (data: T) => {
    try {
      const worker = await getSocketWorker(socket, client)

      if (!worker) {
        socket.disconnect(true)
        return
      }

      // checkPermissions дописывает 'admin' в переданный массив - отдаём копию
      if (!checkPermissions([...permissions], worker)) return

      await handler(data)
    } catch (error) {
      console.error('[Socket] handler error', error)
    }
  }
}
