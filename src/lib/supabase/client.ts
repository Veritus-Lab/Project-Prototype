import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export function createBrowserClient() {
  const { supabaseUrl, supabasePublishableKey } = getPublicEnv();

  return createSupabaseBrowserClient(supabaseUrl, supabasePublishableKey);
}
