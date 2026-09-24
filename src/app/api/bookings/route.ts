import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendBookingEmails } from "@/lib/email";

export async function POST(req: Request) {
  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifie les champs du formulaire." }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bot : on fait semblant

  const { data: id, error } = await supabaseAdmin.rpc("book_seats", {
    p_workshop_id: d.workshopId, p_first: d.firstName, p_last: d.lastName,
    p_phone: d.phone, p_email: d.email, p_seats: d.seats, p_notes: d.notes,
  });

  if (error) {
    const msg = error.message;
    if (msg.includes("not_enough_seats"))
      return NextResponse.json({ error: "Il ne reste pas assez de places." }, { status: 409 });
    if (msg.includes("workshop_closed") || msg.includes("workshop_past"))
      return NextResponse.json({ error: "Les réservations sont fermées pour cet atelier." }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Une erreur est survenue, réessaie." }, { status: 500 });
  }

  const { data: w } = await supabaseAdmin
    .from("workshops").select("title, starts_at, location, price_fcfa").eq("id", d.workshopId).single();
  if (w) {
    await sendBookingEmails({
      firstName: d.firstName, lastName: d.lastName, phone: d.phone, email: d.email,
      seats: d.seats, notes: d.notes, title: w.title, startsAt: w.starts_at,
      location: w.location, priceFcfa: w.price_fcfa,
    });
  }
  return NextResponse.json({ ok: true, bookingId: id });
}
