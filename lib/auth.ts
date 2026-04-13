import jwt from 'jsonwebtoken'
import {betterAuth, OAuth2Tokens} from 'better-auth'
import {nextCookies} from 'better-auth/next-js'
import {Pool} from 'pg'
import {customSession, genericOAuth, oneTap} from 'better-auth/plugins'
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
    genericOAuth({
      config: [
        {
          providerId: 'telegram',
          clientId: '7488909327',
          clientSecret:
            'N2_PqtvTAHkKH_Njiyea270scVMaK50ESkqGvLRzAdhawjp_dinNdQ',
          discoveryUrl:
            'https://oauth.telegram.org/.well-known/openid-configuration',
          pkce: true,
          scopes: ['openid', 'profile', 'phone', 'telegram:bot_access'],
          getUserInfo: async (tokens: OAuth2Tokens) => {
            const decoded = jwt.decode(tokens.idToken || '') as any

            return {
              id: decoded.sub,
              email: `${decoded.id}@telegram.local`,
              name: decoded.preferred_username,
              image: decoded.picture,
              emailVerified: true,
            }
          },
        },
      ],
    }),
    nextCookies(),
    oneTap(),
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
