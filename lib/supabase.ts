import { createBrowserClient } from "@supabase/ssr";
export function browser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error(
      "Authentication is not configured. Add the Supabase project URL and public key in environment settings.",
    );
  return createBrowserClient(url, key);
}
