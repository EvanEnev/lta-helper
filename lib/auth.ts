import NextAuth, {Session} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import {
  AuthDataValidator,
  objectToAuthDataMap,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'
import db from '@/lib/database'
import convertTZ from './functions/convertTZ'
import {Pool} from 'pg'
import PostgresAdapter from '@auth/pg-adapter'

const getUserData = async (id: number): Promise<Session['user']> => {
  const date = convertTZ(new Date(), 'Europe/Moscow').toFormat('dd.MM')

  const query = `SELECT
        w.name,
        w.id,
        rank,
        l.name as location,
        ranks.permission_level,
        first_name,
        last_name,
        middle_name,
        phone_number,
        email,
        admins.location_id as today_location
        FROM lt_arena.workers w
        LEFT JOIN lt_arena.ranks ranks ON ranks.name = w.rank
        LEFT JOIN lt_arena.locations l ON l.id = w.location_id
        LEFT JOIN lt_arena.admins admins ON admins.worker_id=w.id AND admins.date='${date}'
        WHERE telegram_id = ${id}`

  const permissionQuery = `SELECT
        pm.name, description, pm.id
    FROM lt_arena.permissions pm
           LEFT JOIN lt_arena.workers w ON telegram_id=${id}
           LEFT JOIN lt_arena.default_permissions dp ON (SELECT weight FROM lt_arena.ranks WHERE id = dp.rank_id) <= (SELECT weight FROM lt_arena.ranks WHERE name = w.rank)
           LEFT JOIN lt_arena.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires < NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id`

  const result = await db.query(query)
  const permissionsResult = await db.query(permissionQuery)
  const permissions = permissionsResult.rows
  const data = result.rows[0] || {}

  data.permissions = permissions

  if (data?.today_location) {
    data.permission_level = 4
  }

  return data
}

export const authOptions = {
  debug: true,
  session: {strategy: 'jwt'},
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
      // @ts-ignore
      authorize: async credentials => {
        const validator = new AuthDataValidator({
          botToken: `${process.env.BOT_TOKEN}`,
          subtleCrypto: crypto.subtle,
        })

        //  @ts-ignore
        let credentialsData = credentials?.data

        try {
          // @ts-ignore
          credentialsData = JSON.parse(credentials?.data)
        } catch (e) {}

        const data =
          typeof credentialsData === 'string'
            ? urlStrToAuthDataMap(credentialsData)
            : objectToAuthDataMap(credentialsData)

        const user = await validator.validate(data)

        if (user.id) {
          const data = await getUserData(user.id)

          let returned = {
            id: data.id,
            telegramId: user.id,
            rank: '',
            permission_level: 0,
            name: [user?.first_name, user?.last_name || ''].join(' '),
            image: user.photo_url,
            permissions: [],
          }

          if (data) {
            returned = {...returned, ...data}
          }

          return returned
        }

        return null
      },
    }),
  ],
  callbacks: {
    // @ts-ignore
    async jwt({token, trigger, session, user}) {
      if (user) {
        token.id = user.id
        token.telegramId = user.telegramId
        token.name = user.name
        token.first_name = user.first_name
        token.last_name = user.last_name
        token.middle_name = user.middle_name
        token.phone_number = user.phone_number
        token.email = user.email
        token.rank = user.rank
        token.permission_level = user.permission_level
        token.image = user.image
        token.location = user.location
        token.permissions = user.permissions
      }

      return token
    },
    // @ts-ignore
    async session({session, token}) {
      if (token) {
        const data = await getUserData(token.telegramId)

        session.user.telegramId = token.telegramId
        session.user.id = data.id
        session.user.name = data.name
        session.user.rank = data.rank
        session.user.first_name = data.first_name
        session.user.last_name = data.last_name
        session.user.middle_name = data.middle_name
        session.user.phone_number = data.phone_number
        session.user.email = data.email
        session.user.permission_level = data.permission_level
        session.user.image = token.image
        session.user.location = data.location
        session.user.permissions = data.permissions
      }

      return session
    },
    // @ts-ignore
    authorized: async ({auth}) => {
      return !!auth?.user
    },
    redirect: async ({url, baseUrl}: {url: string; baseUrl: string}) => {
      if (baseUrl.includes('localhost')) {
        return 'http://127.0.0.1'
      }

      return baseUrl
    },
  },
}

export const {handlers, signIn, signOut, auth} = NextAuth(() => {
  const pool = new Pool({
    host: 'lt.bubenev.su',
    user: 'evan',
    password: 'Ghjdthrfcdzpb98',
    database: 'lt_arena',
    port: 1672,
    max: 20,
  })

  return {...authOptions, adapter: PostgresAdapter(pool)}
})
