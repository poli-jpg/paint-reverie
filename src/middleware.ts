import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Protège tout /admin/* : il faut être connecté avec l'e-mail ADMIN_EMAIL, sinon redirection vers /admin/login.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(list) {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAdmin = !!user && user.email === process.env.ADMIN_EMAIL;

  if (!isLoginPage && !isAdmin) {
    console.log(`[admin] accès refusé à ${req.nextUrl.pathname} — connecté: ${user?.email ?? "personne"} / ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
  }
  if (req.nextUrl.pathname.startsWith("/admin") && !isLoginPage && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (isLoginPage && isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/workshops";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
