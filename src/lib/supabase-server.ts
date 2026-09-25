import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client lié aux cookies de session : sert à savoir QUI est connecté (pages et routes /admin).
// Les données elles-mêmes sont lues/écrites avec supabaseAdmin (service role), pas ce client.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appelé depuis un composant serveur (pas une route) : sans effet, le middleware gère déjà le rafraîchissement.
          }
        },
      },
    }
  );
}

// Renvoie l'utilisateur connecté seulement s'il correspond à ADMIN_EMAIL, sinon null.
export async function requireAdmin() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}
