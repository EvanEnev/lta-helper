import {createClient} from '@supabase/supabase-js'

const supabaseClient = createClient(
  'https://db.bubenev.su',
  process.env.NEXT_PUBLIC_ANON_KEY || '',
  {db: {schema: 'lt_arena'}},
)

export default supabaseClient
