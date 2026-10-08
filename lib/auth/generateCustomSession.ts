import {Session, User} from 'better-auth'
import db from '@/lib/database'
import {getData} from '@/lib/auth/getWorkerData'
import {cookies} from 'next/headers'
import {
  IMPERSONATE_COOKIE,
  IMPERSONATOR_ID,
  parseImpersonateId,
} from '@/lib/auth/impersonation'

export {getData}

export default async function generateCustomSession({
  user,
  session,
}: {
  user: User<any>
  session: Session<any>
}) {
  const cookieStore = await cookies()
  const targetId = parseImpersonateId(
    cookieStore.get(IMPERSONATE_COOKIE)?.value,
  )

  let impersonate = false
  if (targetId !== null) {
    const real = await db.query(
      'select id from workers where auth_id = $1 or email = $2 limit 1',
      [session.userId, user.email],
    )
    impersonate = real.rows[0]?.id === IMPERSONATOR_ID
  }

  const authId = impersonate ? String(targetId) : session.userId

  let data = await getData(authId, session.userId, impersonate)

  if (!data.worker.id) {
    const email = user.email
    data = await getData(email, session.userId, false)

    if (data.worker.id) {
      await db.query('update workers set auth_id = $1 where id = $2', [
        session.userId,
        data.worker.id,
      ])
    }
  }
  return {
    user: {...user, ...data.worker, trueId: data.trueId},
    session,
  }
}
