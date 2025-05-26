'use server'

import {cookies} from 'next/headers'
import jwt from 'jsonwebtoken'
import supabaseAdmin from '@/lib/supabaseAdmin'

export default async function authh() {
  const cookiesList = await cookies()
  const token = cookiesList.get('token')?.value

  if (!token) {
    return {redirect: {destination: '/login', permanent: false}}
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || '')

    console.log({payload})
    // @ts-ignore
    const userId = payload.userId

    const {data: user, error} = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const {data: newUser, error: createError} =
      await supabaseAdmin.auth.admin.createUser({
        email: `${userId}@telegram`,
        id: userId,
        user_metadata: {
          telegram_id: userId,
        },
        email_confirm: true,
      })

    if (error || !user) {
      return error || new Error('User not found')
    }

    return newUser
  } catch (err) {
    return {redirect: {destination: '/login', permanent: false}}
  }
}
