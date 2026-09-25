"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await supabaseBrowser.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }
  return <button className="btn line admin-signout" onClick={signOut} type="button">Se déconnecter</button>;
}
