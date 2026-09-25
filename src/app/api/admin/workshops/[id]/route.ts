import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fieldErrors, slugify, workshopSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const parsed = workshopSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: fieldErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  const startsAt = new Date(d.startsAt);
  if (isNaN(startsAt.getTime())) return NextResponse.json({ error: "Date et heure invalides." }, { status: 400 });
  const slug = slugify(d.slug || d.title);

  const { error } = await supabaseAdmin.from("workshops").update({
    slug, title: d.title, description: d.description || null,
    starts_at: startsAt.toISOString(), location: d.location,
    price_fcfa: d.priceFcfa, capacity: d.capacity, image_url: d.imageUrl || null, status: d.status,
  }).eq("id", id);
  if (error) {
    const msg = error.code === "23505" ? "Cet identifiant est déjà utilisé par un autre atelier." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("workshops").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
