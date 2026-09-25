import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fieldErrors, slugify, workshopSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const parsed = workshopSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  const startsAt = new Date(d.startsAt);
  if (isNaN(startsAt.getTime())) return NextResponse.json({ error: "Date et heure invalides." }, { status: 400 });
  const slug = slugify(d.slug || d.title);

  const row = {
    title: d.title, description: d.description || null,
    starts_at: startsAt.toISOString(), location: d.location,
    price_fcfa: d.priceFcfa, capacity: d.capacity, image_url: d.imageUrl || null, status: d.status,
  };
  let { error } = await supabaseAdmin.from("workshops").insert({ ...row, slug });
  // Identifiant déjà pris (même titre) : on ajoute un suffixe au lieu de bloquer.
  if (error?.code === "23505") {
    ({ error } = await supabaseAdmin.from("workshops").insert({ ...row, slug: `${slug}-${Date.now().toString(36).slice(-4)}` }));
  }
  if (error) {
    console.error("[admin] création atelier :", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
