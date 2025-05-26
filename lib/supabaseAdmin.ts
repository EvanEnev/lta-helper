import {createClient} from '@supabase/supabase-js'

console.log(
  process.env.SUPABASE_ADMIN_KEY,
  typeof process.env.SUPABASE_ADMIN_KEY,
)
const supabaseAdmin = createClient(
  'https://db.bubenev.su',
  process.env.SUPABASE_ADMIN_KEY!,
  {auth: {autoRefreshToken: false, persistSession: false}}, // отключаем ненужный функционал
)

export default supabaseAdmin
