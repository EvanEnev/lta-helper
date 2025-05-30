import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'

export default async function createAdminSupabase() {
  const cookiesStore = await cookies()

  return createServerClient(
    'https://db.bubenev.su',
    process.env.SUPABASE_ADMIN_KEY!,
    {
      db: {
        schema: 'lt_arena',
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        getAll: async () => {
          return cookiesStore.getAll()
        },
        setAll: async cookiesToSet => {
          try {
            cookiesToSet.forEach(({name, value, options}) =>
              cookiesStore.set(name, value, options),
            )
          } catch {}
        },
      },
    },
  )
}
