import jwt from 'jsonwebtoken'
import {betterAuth, OAuth2Tokens} from 'better-auth'
import {nextCookies} from 'better-auth/next-js'
import {Pool} from 'pg'
import {customSession, genericOAuth} from 'better-auth/plugins'
import generateCustomSession from '@/lib/auth/generateCustomSession'
import {createAuthMiddleware, getOAuthState} from 'better-auth/api'
import db from '@/lib/database'

export const auth = betterAuth({
  database: new Pool({
    user: process.env.AUTH_USER,
    password: process.env.AUTH_PASSWORD,
    host: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!),
    database: process.env.DATABASE_NAME,
  }),
  user: {
    additionalFields: {
      email: {type: 'string'},
      firstName: {type: 'string'},
      id: {type: 'number'},
      isFormer: {type: 'boolean'},
      lastName: {type: 'string'},
      location: {type: 'string'},
      middleName: {type: 'string'},
      name: {type: 'string'},
      permissions: {type: 'string[]'},
      phoneNumber: {type: 'string'},
      photoUrl: {type: 'string'},
      rank: {type: 'string'},
      telegramId: {type: 'number'},
      number: {type: 'number'},
      balance: {type: 'number'},
    },
  },
  advanced: {
    cookiePrefix: 'auth',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  hooks: {
    after: createAuthMiddleware(async ctx => {
      const isOAuth =
        ctx.path === '/callback/:id' ||
        ctx.path === '/oauth2/callback/:providerId'

      if (!isOAuth) return

      const state = await getOAuthState()
      const session = ctx.context.newSession

      if (state?.from === 'login') {
        const query = `select id from workers where auth_id = '${session?.session.userId}'`

        const result = await db.query(query)

        if (!result.rows[0]?.id) {
          const query = `delete from auth."user" where id = '${session?.session.userId}'`

          await db.query(query)

          ctx.redirect('/login?error=user_not_found')
        }
      }
    }),
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'telegram',
          clientId: process.env.TELEGRAM_CLIENT_ID!,
          clientSecret: process.env.TELEGRAM_CLIENT_SECRET,
          discoveryUrl:
            'https://oauth.telegram.org/.well-known/openid-configuration',
          pkce: true,
          scopes: ['openid', 'profile', 'phone', 'telegram:bot_access'],
          getUserInfo: async (tokens: OAuth2Tokens) => {
            const decoded = jwt.decode(tokens.idToken || '') as any

            return {
              id: decoded.sub,
              email: `${decoded.id}`,
              name: decoded.preferred_username,
              image: decoded.picture,
              emailVerified: true,
            }
          },
        },
      ],
    }),
    nextCookies(),
    customSession(async ({user, session}) => {
      return generateCustomSession({user, session})
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
})
