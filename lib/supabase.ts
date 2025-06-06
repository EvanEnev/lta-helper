import {createBrowserClient} from '@supabase/ssr'

const supabaseClient = createBrowserClient(
  'https://db.bubenev.su',
  process.env.NEXT_PUBLIC_ANON_KEY!,
  {
    db: {
      schema: 'lt_arena',
    },
  },
)

export default supabaseClient
