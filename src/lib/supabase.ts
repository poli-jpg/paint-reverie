import { createClient } from "@supabase/supabase-js";

// Lecture publique (ateliers, galerie, réglages) grâce aux policies RLS.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
