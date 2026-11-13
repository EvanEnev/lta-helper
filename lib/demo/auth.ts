import generateCustomSession from '@/lib/auth/generateCustomSession'
import {DEMO_AUTH_ID} from '@/lib/demo'

async function getSession() {
  const now = new Date()

  return generateCustomSession({
    user: {
      id: DEMO_AUTH_ID,
      name: 'Демо Админ',
      email: 'demo@example.com',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    session: {
      id: DEMO_AUTH_ID,
      userId: DEMO_AUTH_ID,
      token: DEMO_AUTH_ID,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
  })
}

export const demoAuth = {
  api: {
    getSession,
    listUserAccounts: async () => [],
  },
  handler: async (request: Request) =>
    request.url.includes('/get-session')
      ? Response.json(await getSession())
      : Response.json({}),
}
