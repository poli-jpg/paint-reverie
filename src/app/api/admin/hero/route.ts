import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Choisit (ou retire) la photo affichée en grand en haut de la page d'accueil.
export async function PUT(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null) as { imageUrl?: string | null } | null;
  const url = body?.imageUrl ?? null;
  if (url !== null && !/^https:\/\/.+/.test(url)) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
  }

  const { error } = url
    ? await supabaseAdmin.from("site_settings").upsert({ key: "hero", value: { image_url: url } })
    : await supabaseAdmin.from("site_settings").delete().eq("key", "hero");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/"); // la page d'accueil se met à jour tout de suite
  return NextResponse.json({ ok: true });
}
