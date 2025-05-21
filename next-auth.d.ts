import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: number
    rank: string
    permission_level: number
    name: string
    location_id?: number
    photo?: string
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: number
      rank: string
      permission_level: number
      name: string
      location_id?: number
    }
  }
}
