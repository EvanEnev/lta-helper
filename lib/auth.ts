import {betterAuth} from 'better-auth'
import {nextCookies} from 'better-auth/next-js'
import {Pool} from 'pg'
import {customSession} from 'better-auth/plugins'
import generateCustomSession from '@/lib/auth/generateCustomSession'

export const auth = betterAuth({
  database: new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_URL,
    port: parseInt(process.env.DATABASE_PORT!),
    database: process.env.DATABASE_NAME,
    options: '-c search_path=auth',
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
  plugins: [
    nextCookies(),
    customSession(async ({user, session}) => {
      return generateCustomSession({user, session})
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
})
