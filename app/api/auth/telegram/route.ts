import jwt from 'jsonwebtoken'
import supabaseAdmin from '@/lib/supabaseAdmin'
import {NextRequest, NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {
  AuthDataValidator,
  objectToAuthDataMap,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'
import supabase from '@/lib/supabase'

import crypto from 'crypto'

function generatePassword(
  telegramId: number | string,
  botToken: string,
): string {
  return crypto
    .createHmac('sha256', botToken)
    .update(telegramId.toString())
    .digest('hex')
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  let credentials = body?.credentials

  try {
    // @ts-ignore
    credentials = JSON.parse(credentials)
  } catch (e) {}

  if (!credentials) {
    return NextResponse.json({error: 'Invalid Telegram data'}, {status: 400})
  }

  const validator = new AuthDataValidator({
    botToken: `${process.env.BOT_TOKEN}`,
  })

  const data =
    typeof credentials === 'string'
      ? urlStrToAuthDataMap(credentials)
      : objectToAuthDataMap(credentials)

  const user = await validator.validate(data)

  const {data: existingWorker, error: existingWorkerError} =
    await supabase.auth.signInWithPassword({
      email: `${user.id}@telegram.lta`,
      password: generatePassword(user.id, process.env.BOT_TOKEN!),
    })

  if (existingWorker) {
    return NextResponse.redirect('/')
  }

  const {data: worker, error: workerError} = await supabaseAdmin
    .schema('lt_arena')
    .from('workers')
    .select('id, name')
    .eq('telegram_id', user.id)

  const {data: newUser, error: createError} =
    await supabaseAdmin.auth.admin.createUser({
      email: `${user.id}@telegram.lta`,
      password: generatePassword(user.id, process.env.BOT_TOKEN!),
      user_metadata: {
        telegram_id: user.id,
      },
      email_confirm: true,
    })

  let userId
  // if (existingUser) {
  //   userId = existingUser.id
  // } else {
  //   const {data: newUser, error: insertError} = await supabaseAdmin
  //     .from('users')
  //     .insert({
  //       telegram_id: user.id,
  //       avatar_url: user.photo_url,
  //     })
  //     .select('id')
  //     .single()
  //   if (insertError) {
  //     return NextResponse.json({error: 'User creation failed'}, {status: 500})
  //   }
  //   userId = newUser.id
  // }

  const token = jwt.sign({userId}, process.env.JWT_SECRET || '', {
    algorithm: 'HS256',
    expiresIn: '7d',
  })

  const cookiesList = await cookies()
  cookiesList.set(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
  )

  // Перенаправляем или отвечаем положительно
  return NextResponse.redirect('/')
}
