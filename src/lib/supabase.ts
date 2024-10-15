import { createClient } from '@supabase/supabase-js'

export interface UserPresence {
  image: string
  user: string
  tags: string[]
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const supabaseClient = createClient(supabaseUrl, supabaseKey)
