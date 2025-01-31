import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import {
  objectToAuthDataMap,
  AuthDataValidator,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'
import conn from '@/lib/database'

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      //   credentials: {},
      authorize: async credentials => {
        const validator = new AuthDataValidator({
          botToken: `${process.env.BOT_TOKEN}`,
          subtleCrypto: crypto.subtle,
        })

        let credentialsData = credentials?.data

        try {
          // @ts-ignore
          credentialsData = JSON.parse(credentials?.data)
        } catch (e) {}

        const data =
          typeof credentialsData === 'string'
            ? // @ts-ignore
              urlStrToAuthDataMap(credentialsData)
            : // @ts-ignore
              objectToAuthDataMap(credentialsData)

        const user = await validator.validate(data)

        if (user.id) {
          const query = `SELECT
          w.name,
          rank,
          l.name as location,
          ranks.permission_level,
          first_name,
          last_name,
          middle_name,
          phone_number,
          email
          FROM lt_arena.workers w
          LEFT JOIN lt_arena.ranks ranks ON ranks.name = w.rank
          LEFT JOIN lt_arena.locations l ON l.id = w.location_id
          WHERE telegram_id = ${user.id}`

          const result = await conn.query(query)
          const data = result.rows[0]

          let returned = {
            id: user.id.toString(),
            rank: '',
            permission_level: 0,
            name: [user?.first_name, user?.last_name || ''].join(' '),
            image: user.photo_url,
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
    //@ts-ignore
    async jwt({token, user}) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.rank = user.rank
        token.permission_level = user.permission_level
        token.image = user.image
        token.location = user.location
      }
      return token
    },

    // @ts-ignore
    async session({session, token}) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.rank = token.rank
        session.user.permission_level = token.permission_level
        session.user.image = token.image
        session.user.location = token.location
      }
      return session
    },
    // @ts-ignore
    authorized: async ({auth}) => {
      const isLoggedIn = !!auth?.user

      if (isLoggedIn) return true
      else return false
    },
  },
  pages: {
    signIn: '/login',
  },
}

export const {handlers, signIn, signOut, auth} = NextAuth(authOptions)
