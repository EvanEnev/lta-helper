import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import {
  objectToAuthDataMap,
  AuthDataValidator,
  urlStrToAuthDataMap,
} from '@telegram-auth/server'
import conn from '@/lib/database'
import convertTZ from './lib/convertTZ'

const getUserDdata = async (id: number) => {
  const date = convertTZ(new Date(), 'Europe/Moscow').toLocaleDateString(
    'ru-RU',
    {day: 'numeric', month: 'numeric'},
  )

  const query = `SELECT
        w.name,
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

  const result = await conn.query(query)
  const data = result.rows[0]

  if (data?.today_location) {
  	data.permission_level = 4	
  }
  
  return data
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
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
            ? // @ts-ignore
              urlStrToAuthDataMap(credentialsData)
            : // @ts-ignore
              objectToAuthDataMap(credentialsData)

        const user = await validator.validate(data)

        if (user.id) {
          const data = await getUserDdata(user.id)

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
        const data = await getUserDdata(token.id)

        session.user.id = token.id
        session.user.name = data.name
        session.user.rank = data.rank
        session.user.permission_level = data.permission_level
        session.user.image = token.image
        session.user.location = data.location
      }
      return session
    },
    // @ts-ignore
    authorized: async ({auth}) => {
      const isLoggedIn = !!auth?.user

      if (isLoggedIn) return true
      else return false
    },
    redirect: async () => {
      return 'https://lt.bubenev.su'
    },
  },
  pages: {
    signIn: '/login',
  },
}

export const {handlers, signIn, signOut, auth} = NextAuth(authOptions)
