import { supabaseAdmin } from "@/lib/supabase-admin";
import GalleryAdmin from "@/components/admin/GalleryAdmin";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { data } = await supabaseAdmin.from("gallery_items").select("*").order("sort_order");
  return <GalleryAdmin initial={data ?? []} />;
}
