'use server'

import createAdminSupabase from '@/lib/createAdminSupabase'
import {LTWorker} from '@/src/utils/types'
import authQueryGenerator from '@/lib/auth/authQueryGenerator'
import db from '@/lib/database'
import authParseWorker from '@/lib/auth/authParseWorker'

export default async function auth(): Promise<LTWorker> {
  const supabase = await createAdminSupabase()

  const {data: session} = await supabase.auth.getUser()
  const user = session?.user

  if (!user)
    return {
      email: '',
      firstName: '',
      id: 0,
      isFormer: false,
      lastName: '',
      location: '',
      middleName: '',
      name: '',
      permissions: [],
      phoneNumber: '',
      photoUrl: '',
      rank: '',
      telegramId: 0,
      number: 0,
    }

  const queries = await authQueryGenerator(user)

  const result = await db.query(queries.worker)
  const permissionsResult = await db.query(queries.permissions)

  return await authParseWorker(result, permissionsResult)
}
