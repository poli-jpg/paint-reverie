import { supabaseAdmin } from "@/lib/supabase-admin";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import type { HeroSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { data } = await supabaseAdmin.from("gallery_items").select("*").order("sort_order");
  const { data: hero } = await supabaseAdmin.from("site_settings").select("value").eq("key", "hero").maybeSingle();
  return <GalleryAdmin initial={data ?? []} hero={(hero?.value as HeroSettings | undefined) ?? null} />;
}
