import { supabaseAdmin } from "@/lib/supabase-admin";
import WorkshopsAdmin from "@/components/admin/WorkshopsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminWorkshopsPage() {
  const { data: workshops } = await supabaseAdmin.from("workshops").select("*").order("starts_at", { ascending: false });
  const { data: bookings } = await supabaseAdmin.from("bookings").select("workshop_id, seats, status");
  const counts: Record<string, number> = {};
  (bookings ?? []).forEach((b) => { if (b.status !== "cancelled") counts[b.workshop_id] = (counts[b.workshop_id] ?? 0) + b.seats; });
  const initial = (workshops ?? []).map((w) => ({ ...w, seats_taken: counts[w.id] ?? 0 }));
  return <WorkshopsAdmin initial={initial} />;
}
