import createAdminSupabase from '@/lib/createAdminSupabase'
import {NextRequest, NextResponse} from 'next/server'
import {
  AuthDataValidator,
  objectToAuthDataMap,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'

import crypto from 'crypto'
import db from '@/lib/database'

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
  const supabase = await createAdminSupabase()

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

  let user

  try {
    user = await validator.validate(data)
  } catch (e) {
    return NextResponse.json(
      {message: 'Ошибка валидации', color: 'danger'},
      {status: 500},
    )
  }

  const updateQuery = `UPDATE lt_arena.workers SET photo_url = '${user.photo_url}' WHERE telegram_id = ${user.id}`

  await db.query(updateQuery)

  const email =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? `${user.id}@telegram.lta-test`
      : `${user.id}@telegram.lta`

  const {data: existingWorker, error: existingWorkerError} =
    await supabase.auth.signInWithPassword({
      email,
      password: generatePassword(user.id, process.env.BOT_TOKEN!),
    })

  if (existingWorker.user) {
    await supabase.auth.signInWithPassword({
      email,
      password: generatePassword(user.id, process.env.BOT_TOKEN!),
    })

    return NextResponse.json(
      {
        access_token: existingWorker.session?.access_token,
        refresh_token: existingWorker.session?.refresh_token,
      },
      {status: 200},
    )
  }

  await supabase.auth.admin.createUser({
    email,
    password: generatePassword(user.id, process.env.BOT_TOKEN!),
    user_metadata: {
      telegram_id: user.id,
    },
    email_confirm: true,
  })

  const {data: newUserAuthorized, error: newUserAuthtorizedError} =
    await supabase.auth.signInWithPassword({
      email,
      password: generatePassword(user.id, process.env.BOT_TOKEN!),
    })

  return NextResponse.json(
    {
      access_token: newUserAuthorized.session?.access_token,
      refresh_token: newUserAuthorized.session?.refresh_token,
    },
    {status: 200},
  )
}
