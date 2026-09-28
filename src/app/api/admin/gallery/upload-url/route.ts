import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"];

// Donne à l'admin une autorisation d'envoi (valable peu de temps) vers le bucket "photos".
// Le fichier part ensuite directement du navigateur vers Supabase : pas de limite de taille Vercel.
export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => null) as { fileName?: string; contentType?: string } | null;
  if (!body?.contentType || !ALLOWED.includes(body.contentType)) {
    return NextResponse.json({ error: "Format non accepté (JPG, PNG, WEBP, MP4, MOV ou WEBM)." }, { status: 400 });
  }
  const ext = (body.fileName?.split(".").pop() || body.contentType.split("/")[1]).toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabaseAdmin.storage.from("photos").createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[admin] upload galerie :", error?.message);
    return NextResponse.json({ error: error?.message || "Envoi impossible" }, { status: 400 });
  }
  const { data: pub } = supabaseAdmin.storage.from("photos").getPublicUrl(path);
  return NextResponse.json({ path, token: data.token, publicUrl: pub.publicUrl });
}
