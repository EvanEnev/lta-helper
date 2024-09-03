import crypto from 'crypto'

export default async function validateData(initData: string | undefined) {
  if (!initData) return false
  const data = new URLSearchParams(initData)
  const hash = data.get('hash')
  let dataToCheck: string[] = []

  data.sort()
  data.forEach(
    (val, key) => key !== 'hash' && dataToCheck.push(`${key}=${val}`),
  )

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN ?? '')
  const calculatedHash = crypto
    .createHmac('sha256', secret.digest())
    .update(dataToCheck.join('\n'))
    .digest('hex')

  const user = Object.fromEntries(data)
  return calculatedHash === hash ? JSON.parse(user.user) : false
}
