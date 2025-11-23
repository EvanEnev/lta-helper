import {createAuthClient} from 'better-auth/react'
const auth = createAuthClient({})

export const authClient = auth
export const useSession = auth.useSession
