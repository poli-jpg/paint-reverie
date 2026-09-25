import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { workshopSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const parsed = workshopSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les champs du formulaire." }, { status: 400 });
  const d = parsed.data;

  const { error } = await supabaseAdmin.from("workshops").insert({
    slug: d.slug, title: d.title, description: d.description || null,
    starts_at: new Date(d.startsAt).toISOString(), location: d.location,
    price_fcfa: d.priceFcfa, capacity: d.capacity, image_url: d.imageUrl || null, status: d.status,
  });
  if (error) {
    const msg = error.message.includes("duplicate") ? "Cet identifiant (slug) existe déjà." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
