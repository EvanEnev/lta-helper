import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import escapeMarkdown from '@/src/utils/global/escapeMarkdown'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.error) {
    return NextResponse.json({message: 'Ошибки нет'}, {status: 500})
  }

  const {user: worker} = (await auth.api.getSession({
    headers: await headers(),
  })) || {user: null}

  const text = `*🛑 Ошибка*
Сотрудник: ${worker?.name || '*Неизвестно*'}
ID: \`${worker?.telegramId || 'нет'}\`
Сообщение: \`${escapeMarkdown(body.error.message)}\`
Страница: ${body.page}
Сервер: ${body.server ? '✅' : '❌'}`

  const buffer = Buffer.from(body.error.stack || '', 'utf8')
  const blob = new Blob([buffer], {type: 'text/plain'})

  const form = new FormData()
  form.append('chat_id', String(791334723))
  form.append('document', blob, 'stack.txt')
  form.append('caption', text)
  form.append('parse_mode', 'MarkdownV2')

  const botToken = process.env.BOT_TOKEN

  await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: 'POST',
    body: form,
    headers: {accept: 'application/json'},
  })

  return NextResponse.json({}, {status: 200})
}
