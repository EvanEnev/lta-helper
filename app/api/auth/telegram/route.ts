import {NextRequest, NextResponse} from 'next/server'
import {
  AuthDataValidator,
  objectToAuthDataMap,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'
import crypto from 'crypto'
import db from '@/lib/database'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'

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

  let user

  try {
    user = await validator.validate(data)
  } catch (e) {
    return NextResponse.json(
      {message: 'Ошибка валидации', color: 'danger'},
      {status: 500},
    )
  }

  const updateQuery = `UPDATE workers SET photo_url = '${user.photo_url}' WHERE telegram_id = ${user.id}`

  await db.query(updateQuery)

  const email =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? `${user.id}@telegram-test.lta`
      : `${user.id}@telegram.lta`

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password: generatePassword(user.id, process.env.BOT_TOKEN!),
        callbackURL: '/',
      },
      headers: await headers(),
    })
  } catch (e) {
      if (user.id == 791334723) {
          console.error(e)
      }

    await auth.api.signUpEmail({
      // @ts-ignore
      body: {
        email,
        name: user.username || 'undefined',
        password: generatePassword(user.id, process.env.BOT_TOKEN!),
        callbackURL: '/',
      },
    })
  }

  return NextResponse.json({}, {status: 200})
}
