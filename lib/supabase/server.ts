import { createClient } from '@supabase/supabase-js'

// サーバーサイド専用（service role key使用）
// このファイルはAPIルート・サーバーコンポーネントのみから使用すること
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase server configuration')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
