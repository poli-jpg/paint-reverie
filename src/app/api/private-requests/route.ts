import { NextResponse } from "next/server";
import { privateRequestSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPrivateRequestEmails } from "@/lib/email";

export async function POST(req: Request) {
  const parsed = privateRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifie les champs du formulaire." }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  const { error } = await supabaseAdmin.from("private_requests").insert({
    first_name: d.firstName, last_name: d.lastName, phone: d.phone, email: d.email,
    event_type: d.eventType, desired_date: d.desiredDate || null,
    participants: d.participants ?? null, location: d.location, message: d.message,
  });
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Une erreur est survenue, réessaie." }, { status: 500 });
  }
  await sendPrivateRequestEmails(d);
  return NextResponse.json({ ok: true });
}
