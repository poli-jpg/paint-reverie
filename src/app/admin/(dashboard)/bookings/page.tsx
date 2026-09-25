import { supabaseAdmin } from "@/lib/supabase-admin";
import BookingsAdmin from "@/components/admin/BookingsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id, first_name, last_name, phone, email, seats, notes, status, payment_status, created_at, workshop_id")
    .order("created_at", { ascending: false });
  if (error) console.error("[admin] réservations :", error.message);
  const { data: workshops } = await supabaseAdmin.from("workshops").select("id, title, starts_at");
  const info = new Map((workshops ?? []).map((w) => [w.id, w]));
  const initial = (bookings ?? []).map((b) => ({
    ...b,
    workshop_title: info.get(b.workshop_id)?.title ?? "Atelier supprimé",
    workshop_date: info.get(b.workshop_id)?.starts_at ?? "",
  }));
  return <BookingsAdmin initial={initial} />;
}
