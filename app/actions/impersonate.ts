'use server'

import {cookies, headers} from 'next/headers'
import {auth} from '@/lib/auth'
import db from '@/lib/database'
import {
  IMPERSONATE_COOKIE,
  IMPERSONATOR_ID,
  parseImpersonateId,
} from '@/lib/auth/impersonation'

// Server Action - это публичный POST-эндпоинт, поэтому права проверяем
// в каждой функции. trueId считается на сервере по реальной сессии и
// не зависит от cookie подмены
async function assertImpersonator() {
  const session = await auth.api.getSession({headers: await headers()})

  if (session?.user.trueId !== IMPERSONATOR_ID) {
    throw new Error('Forbidden')
  }
}

export interface ImpersonateGroup {
  rank: string
  users: {id: number; name: string}[]
}

export async function getImpersonationData() {
  await assertImpersonator()

  // порядок рангов задаёт SQL (sorting_weight desc), имена сортируем по-русски
  const result = await db.query<{
    id: number
    name: string
    rank_id: number | null
    rank: string | null
  }>(
    `select w.id, w.name, r.id as rank_id, r.name as rank
     from workers w
            left join ranks r on r.id = w.rank_id
     order by r.sorting_weight desc nulls last, w.name`,
  )

  const collator = new Intl.Collator('ru')
  const groups = new Map<number | null, ImpersonateGroup>()

  for (const {id, name, rank_id, rank} of result.rows) {
    const group = groups.get(rank_id) ?? {rank: rank ?? 'Без ранга', users: []}
    group.users.push({id, name})
    groups.set(rank_id, group)
  }

  const sorted = [...groups.values()].map(group => ({
    ...group,
    users: group.users.sort((a, b) => collator.compare(a.name, b.name)),
  }))

  const current = parseImpersonateId(
    (await cookies()).get(IMPERSONATE_COOKIE)?.value,
  )

  return {groups: sorted, current}
}

export async function setImpersonation(id: number | null) {
  await assertImpersonator()

  const store = await cookies()

  if (id === null) {
    store.delete(IMPERSONATE_COOKIE)
    return
  }

  const targetId = parseImpersonateId(String(id))
  if (targetId === null) throw new Error('Invalid id')

  const exists = await db.query('select 1 from workers where id = $1', [
    targetId,
  ])
  if (!exists.rowCount) throw new Error('Not found')

  store.set(IMPERSONATE_COOKIE, String(targetId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
}
