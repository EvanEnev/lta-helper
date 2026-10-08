import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import escapeMarkdown from '@/src/utils/global/escapeMarkdown'

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.slice(0, max) : ''

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({headers: await headers()})
  const worker = session?.user

  if (!worker) {
    return NextResponse.json({message: 'Вход не произведён'}, {status: 401})
  }

  const body = await req.json().catch(() => null)

  if (!body?.error) {
    return NextResponse.json({message: 'Ошибки нет'}, {status: 400})
  }

  const message = escapeMarkdown(text(body.error.message, 500))
  const page = escapeMarkdown(text(body.page, 300))

  const caption = `*🛑 Ошибка*
Сотрудник: ${escapeMarkdown(worker.name || 'Неизвестно')}
ID: \`${worker.telegramId || 'нет'}\`
Сообщение: \`${message}\`
Страница: ${page}
Сервер: ${body.server ? '✅' : '❌'}`

  const stack = Buffer.from(text(body.error.stack, 20000), 'utf8')

  const form = new FormData()
  form.append('chat_id', String(791334723))
  form.append('document', new Blob([stack], {type: 'text/plain'}), 'stack.txt')
  form.append('caption', caption)
  form.append('parse_mode', 'MarkdownV2')

  await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument`,
    {
      method: 'POST',
      body: form,
      headers: {accept: 'application/json'},
    },
  )

  return NextResponse.json({}, {status: 200})
}
