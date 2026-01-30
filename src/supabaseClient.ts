import { createClient } from '@supabase/supabase-js'
console.log("BOLT URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("BOLT ANON present:", !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log(
  "BOLT ANON start:",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20)
)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
