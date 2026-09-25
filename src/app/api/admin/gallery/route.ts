import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { galleryCreateSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const parsed = galleryCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie le lien et les champs." }, { status: 400 });
  const d = parsed.data;

  const { error } = await supabaseAdmin.from("gallery_items").insert({
    media_url: d.mediaUrl, media_type: d.mediaType, caption: d.caption || null,
    category: d.category || null, orientation: d.orientation, sort_order: d.sortOrder, published: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
