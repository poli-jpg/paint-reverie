import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { HeroSettings } from "@/lib/types";

const clamp = (n: unknown, min: number, max: number, def: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;

// Choisit, règle (cadrage, zoom, taille) ou retire la photo de la page d'accueil.
export async function PUT(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { imageUrl?: string | null; posX?: number; posY?: number; zoom?: number; size?: string }
    | null;
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  // Retirer la photo
  if (body.imageUrl === null) {
    const { error } = await supabaseAdmin.from("site_settings").delete().eq("key", "hero");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }

  const { data: cur } = await supabaseAdmin.from("site_settings").select("value").eq("key", "hero").maybeSingle();
  const prev = (cur?.value ?? null) as HeroSettings | null;

  const imageUrl = body.imageUrl ?? prev?.image_url;
  if (!imageUrl || !/^https:\/\/.+/.test(imageUrl)) {
    return NextResponse.json({ error: "Choisis d'abord une photo d'accueil." }, { status: 400 });
  }
  const newPhoto = !!body.imageUrl && body.imageUrl !== prev?.image_url;

  const value: HeroSettings = {
    image_url: imageUrl,
    // Nouvelle photo : cadrage remis au centre, sans zoom. La taille du cadre est conservée.
    pos_x: newPhoto ? 50 : clamp(body.posX ?? prev?.pos_x, 0, 100, 50),
    pos_y: newPhoto ? 50 : clamp(body.posY ?? prev?.pos_y, 0, 100, 50),
    zoom: newPhoto ? 1 : clamp(body.zoom ?? prev?.zoom, 1, 2.5, 1),
    size: (["sm", "md", "lg"] as const).find((s) => s === (body.size ?? prev?.size)) ?? "md",
  };

  const { error } = await supabaseAdmin.from("site_settings").upsert({ key: "hero", value });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/");
  return NextResponse.json({ ok: true, hero: value });
}
