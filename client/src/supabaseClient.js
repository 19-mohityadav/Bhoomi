import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const KEYS_PRESENT = supabaseUrl && supabaseAnonKey;

if (!KEYS_PRESENT) {
  console.warn(
    "[Bhoomi] Supabase credentials missing. Auth features will not work. " +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env"
  );
}

// Use placeholder values so createClient doesn't throw when keys are absent
export const supabase = KEYS_PRESENT
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key");
