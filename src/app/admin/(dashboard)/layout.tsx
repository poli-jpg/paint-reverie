import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-in">
          <span className="script" style={{ fontSize: 26 }}>The Paint Reverie</span>
          <nav className="admin-nav">
            <Link href="/admin/workshops">Ateliers</Link>
            <Link href="/admin/bookings">Réservations</Link>
            <Link href="/admin/requests">Demandes</Link>
            <Link href="/admin/gallery">Galerie</Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
