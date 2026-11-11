import {createAuthClient} from 'better-auth/react'
import {genericOAuthClient} from 'better-auth/client/plugins'

const auth = createAuthClient({
  plugins: [genericOAuthClient()],
})

export const authClient = auth
export const useSession = auth.useSession
