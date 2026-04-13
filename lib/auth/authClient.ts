import {createAuthClient} from 'better-auth/react'
import {genericOAuthClient, oneTapClient} from 'better-auth/client/plugins'

const auth = createAuthClient({
  plugins: [
    genericOAuthClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID as string,
      autoSelect: false,
      cancelOnTapOutside: false,
      context: 'signin',
      additionalOptions: {},
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
    }),
  ],
})

export const authClient = auth
export const useSession = auth.useSession
