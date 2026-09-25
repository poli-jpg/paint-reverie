import { supabaseAdmin } from "@/lib/supabase-admin";
import RequestsAdmin from "@/components/admin/RequestsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { data, error } = await supabaseAdmin
    .from("private_requests")
    .select("id, first_name, last_name, phone, email, event_type, desired_date, participants, location, message, status, created_at")
    .order("created_at", { ascending: false });
  if (error) console.error("[admin] demandes :", error.message);
  return <RequestsAdmin initial={data ?? []} />;
}
