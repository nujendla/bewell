import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export async function server() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) =>
        items.forEach(({ name, value, options }) =>
          jar.set(name, value, options),
        ),
    },
  });
}
export function admin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Subscription verification is not configured");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}
