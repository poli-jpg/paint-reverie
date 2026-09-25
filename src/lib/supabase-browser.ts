"use client";
import { createBrowserClient } from "@supabase/ssr";

// Utilisé uniquement pour la connexion/déconnexion de l'admin (Fatima), côté navigateur.
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
