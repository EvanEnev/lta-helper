import {DateTime} from 'luxon'
import type {
  LTFaceIdData,
  LTLocation,
  LTWorker,
  WorkerSalary,
} from '@/src/utils/types'

export const ZONE = 'Europe/Moscow'

// Для этой «локации» вместо типов работ выбирается один тип выплаты
export const TYPED_LOCATION = 'Другое'

export const PAYMENT_TYPES = [
  'Отзывы',
  'Бонус за продажи',
  'Бонусный оборот',
  'Премия',
  'Отпуск',
  'Больничный',
  'Корректировка смен',
  'Корректировка долга',
  'Компенсация НПД',
]

export const GAME_KEYS = [
  'oneGames',
  'twoGames',
  'threeGames',
  'actorGames',
] as const

export type GameKey = (typeof GAME_KEYS)[number]
export type GameEntry = NonNullable<WorkerSalary[GameKey]>

// Новая запись наследует площадку, время и типы работ от предыдущей
export const emptyEntry = (previous?: WorkerSalary): WorkerSalary => ({
  worker: '',
  workingHours: previous?.workingHours || '',
  createdAt: null,
  location: previous?.location || '',
  bonuses: '',
  fines: '',
  comment: '',
  isHardTime: false,
  gamesCount: 1,
  oneGames: null,
  twoGames: null,
  threeGames: null,
  actorGames: null,
  workTypes: previous?.workTypes || [],
  type: previous?.type || '',
  sorting_weight: 0,
  taskId: null,
  isConfirmed: false,
})

export const nowInZone = () => DateTime.now().setZone(ZONE)

// Без права edit_salary дату можно выбрать только рядом с сегодняшней:
// вчера - до 4 утра, сегодня и завтра - всегда
export function isDateAllowed(date: DateTime, canEditAll: boolean) {
  if (canEditAll) return true

  const now = nowInZone()
  const diff = -Math.floor(now.diff(date).as('days'))

  if (diff <= -2 || diff >= 2) return false
  if (diff === -1 && now.hour > 3) return false

  return true
}

// Первая и последняя отметка FaceID за день (вход и выход)
export function getFaceIdTimes(
  faceId: LTFaceIdData[],
  workers: LTWorker[],
  workerName: string,
) {
  const workerId = workers.find(
    w => w.name?.toLowerCase() === workerName?.toLowerCase(),
  )?.id
  if (!workerId) return null

  const marks: {location: LTLocation; date: DateTime}[] = (
    faceId.find(d => d.workerId === workerId)?.data ?? []
  )
    .map(d => ({
      ...d,
      date: DateTime.fromFormat(d.date, 'yyyy-MM-dd HH:mm:ss'),
    }))
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())

  const format = (mark?: {date: DateTime}) =>
    mark ? mark.date.toFormat('dd.MM.yyyy HH:mm:ss') : null

  return {
    entry: format(marks[0]),
    exit: marks.length >= 2 ? format(marks[marks.length - 1]) : null,
  }
}

export type EntryStatus = 'new' | 'saved' | 'confirmed'

// new - ещё не проставлена (например, подставлена из FaceID),
// saved - проставлена, но не подтверждена (дата не наступила),
// confirmed - проставлена и подтверждена
export const entryStatus = (
  entry: Pick<WorkerSalary, 'createdAt' | 'isConfirmed'>,
): EntryStatus =>
  !entry.createdAt ? 'new' : entry.isConfirmed ? 'confirmed' : 'saved'

// БД отдаёт created_at::text, например «2026-10-05 17:12:33.123+03»
export const formatCreatedAt = (createdAt: string) => {
  const match = createdAt.match(/^\d{4}-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/)

  return match ? `${match[2]}.${match[1]} ${match[3]}` : createdAt
}

// Сервер подтверждает запись при отправке, если дата уже наступила
export const canConfirmDate = (date: DateTime) =>
  date.startOf('day').toMillis() <= nowInZone().toMillis()
