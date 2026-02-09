import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = any;

// クライアントサイド用（ブラウザから直接アクセス）
export const supabase: SupabaseClient<AnyDatabase> = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（APIルートから使用、service_role keyで全権限）
export function createAdminClient(): SupabaseClient<AnyDatabase> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}
